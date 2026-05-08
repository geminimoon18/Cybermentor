"""
app.py — CyberMentor Flask Backend (Gemini-powered)
Routes: /api/chat, /api/upload, /api/documents, /api/health
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types

from prompts import SYSTEM_PROMPT, TOPIC_PROMPTS
from rag import (
    extract_text_from_pdf,
    extract_text_from_txt,
    add_document,
    remove_document,
    list_documents,
    build_context_block,
)

# ─── Init ─────────────────────────────────────────────────────────────────────
load_dotenv()
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173", "http://localhost:5174",
    "http://localhost:3000", "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME   = "gemini-2.5-flash"
MAX_HISTORY  = 20   # max message turns to keep in context


# ─── Health ───────────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_NAME})


# ─── Chat ─────────────────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Body: {
        messages: [{ role, content }],
        topic: "web" | "network" | "exploit" | "defense" | "forensics"
    }
    """
    data = request.get_json()
    if not data or "messages" not in data:
        return jsonify({"error": "Missing messages"}), 400

    messages = data["messages"][-MAX_HISTORY:]
    topic    = data.get("topic", "")

    # Build RAG context from last user message
    last_user_msg = next(
        (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
    )
    context_block = build_context_block(last_user_msg)

    # Build system instruction
    system = SYSTEM_PROMPT.format(context_block=context_block)
    if topic and topic in TOPIC_PROMPTS:
        system += f"\n\nTOPIC FOCUS: {TOPIC_PROMPTS[topic]}"

    # Convert message history for Gemini
    contents = []
    for msg in messages:
        role = "model" if msg["role"] == "assistant" else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])])
        )

    fallback_models = ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-flash-latest"]
    models_to_try = [MODEL_NAME] + fallback_models
    last_error = ""

    for attempt_model in models_to_try:
        try:
            response = client.models.generate_content(
                model=attempt_model,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system
                )
            )
            reply = response.text

            return jsonify({
                "reply":    reply,
                "rag_used": bool(context_block),
                "model_used": attempt_model,
                "usage": {
                    "input_tokens":  getattr(response.usage_metadata, "prompt_token_count",     0),
                    "output_tokens": getattr(response.usage_metadata, "candidates_token_count", 0),
                },
            })

        except Exception as e:
            err = str(e)
            if "API_KEY_INVALID" in err or "API key not valid" in err:
                return jsonify({"error": "Invalid Gemini API key. Check GEMINI_API_KEY in your .env file."}), 401
            
            # If 503 Unavailable or Quota limit, retry with next model
            if "503" in err or "UNAVAILABLE" in err or "quota" in err.lower() or "rate limit" in err.lower() or "429" in err:
                last_error = err
                continue
            
            # If other error, fail immediately
            return jsonify({"error": f"Model {attempt_model} failed: {err}"}), 500

    # If all models failed
    return jsonify({"error": f"API is experiencing high demand. All fallback models failed. Last error: {last_error}"}), 503


# ─── Upload ───────────────────────────────────────────────────────────────────
@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file      = request.files["file"]
    filename  = file.filename or "unknown"
    file_bytes = file.read()

    if len(file_bytes) > 10 * 1024 * 1024:
        return jsonify({"error": "File too large (max 10MB)"}), 413

    try:
        if filename.lower().endswith(".pdf"):
            text = extract_text_from_pdf(file_bytes)
        elif filename.lower().endswith((".txt", ".md")):
            text = extract_text_from_txt(file_bytes)
        else:
            return jsonify({"error": "Only PDF, TXT, and MD files are supported"}), 400

        if not text.strip():
            return jsonify({"error": "Could not extract text from file"}), 400

        doc_meta = add_document(filename, text)
        return jsonify(doc_meta), 201

    except Exception as e:
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 500


# ─── Document Management ──────────────────────────────────────────────────────
@app.route("/api/documents", methods=["GET"])
def get_documents():
    return jsonify(list_documents())


@app.route("/api/documents/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    if remove_document(doc_id):
        return jsonify({"deleted": doc_id})
    return jsonify({"error": "Document not found"}), 404


# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port  = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    print(f"CyberMentor backend running on http://localhost:{port}  [model: {MODEL_NAME}]")
    app.run(host="0.0.0.0", port=port, debug=debug)
