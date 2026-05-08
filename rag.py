"""
rag.py — Retrieval-Augmented Generation pipeline
Handles: PDF parsing, text chunking, TF-IDF retrieval (no external vector DB needed)
"""

import re
import math
import uuid
from collections import defaultdict

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# ─── In-memory document store ────────────────────────────────────────────────
# Structure: { doc_id: { "name": str, "chunks": [str], "metadata": {} } }
DOCUMENT_STORE = {}

# ─── Config ──────────────────────────────────────────────────────────────────
CHUNK_SIZE = 400        # words per chunk
CHUNK_OVERLAP = 50      # word overlap between chunks
MAX_CHUNKS = 5          # max chunks to inject per query


# ─── PDF Parsing ─────────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    if not PDF_AVAILABLE:
        raise RuntimeError("PyPDF2 not installed. Run: pip install PyPDF2")

    import io
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())
    return "\n\n".join(pages)


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from a plain text file."""
    return file_bytes.decode("utf-8", errors="ignore")


# ─── Chunking ────────────────────────────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping word-based chunks."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk.strip())
        start += chunk_size - overlap
    return [c for c in chunks if len(c.split()) > 20]  # filter tiny chunks


# ─── TF-IDF Retrieval ────────────────────────────────────────────────────────
def tokenize(text: str) -> list[str]:
    """Simple tokenizer: lowercase, remove punctuation, split."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return [w for w in text.split() if len(w) > 2]


def build_tfidf(chunks: list[str]) -> tuple[list[dict], dict]:
    """Build TF-IDF vectors for chunks. Returns (tf_list, idf_dict)."""
    # TF per chunk
    tf_list = []
    df = defaultdict(int)
    for chunk in chunks:
        tokens = tokenize(chunk)
        tf = defaultdict(float)
        for token in tokens:
            tf[token] += 1
        total = max(len(tokens), 1)
        for token in tf:
            tf[token] /= total
            df[token] += 1
        tf_list.append(dict(tf))

    # IDF
    N = len(chunks)
    idf = {token: math.log((N + 1) / (count + 1)) + 1 for token, count in df.items()}
    return tf_list, idf


def score_chunk(query_tokens: list[str], tf: dict, idf: dict) -> float:
    """Score a chunk against a query using TF-IDF dot product."""
    score = 0.0
    for token in query_tokens:
        if token in tf and token in idf:
            score += tf[token] * idf[token]
    return score


def retrieve_relevant_chunks(query: str, top_k: int = MAX_CHUNKS) -> list[dict]:
    """Find most relevant chunks across all documents for a given query."""
    if not DOCUMENT_STORE:
        return []

    query_tokens = tokenize(query)
    results = []

    for doc_id, doc in DOCUMENT_STORE.items():
        chunks = doc["chunks"]
        tf_list = doc.get("tf_list", [])
        idf = doc.get("idf", {})
        for i, (chunk, tf) in enumerate(zip(chunks, tf_list)):
            score = score_chunk(query_tokens, tf, idf)
            if score > 0:
                results.append({
                    "doc_name": doc["name"],
                    "chunk": chunk,
                    "score": score,
                    "chunk_idx": i,
                })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


def build_context_block(query: str) -> str:
    """Build the RAG context string to inject into the system prompt."""
    chunks = retrieve_relevant_chunks(query)
    if not chunks:
        return ""

    lines = ["--- RELEVANT CONTEXT FROM YOUR DOCUMENTS ---"]
    for item in chunks:
        lines.append(f"\n[From: {item['doc_name']}]\n{item['chunk']}")
    lines.append("\n--- END CONTEXT ---\n")
    return "\n".join(lines)


# ─── Document Management ─────────────────────────────────────────────────────
def add_document(name: str, text: str) -> dict:
    """Chunk, index, and store a document. Returns doc metadata."""
    doc_id = str(uuid.uuid4())[:8]
    chunks = chunk_text(text)
    tf_list, idf = build_tfidf(chunks)

    DOCUMENT_STORE[doc_id] = {
        "id": doc_id,
        "name": name,
        "chunks": chunks,
        "tf_list": tf_list,
        "idf": idf,
        "chunk_count": len(chunks),
        "word_count": len(text.split()),
    }
    return {
        "id": doc_id,
        "name": name,
        "chunk_count": len(chunks),
        "word_count": len(text.split()),
    }


def remove_document(doc_id: str) -> bool:
    """Remove a document from the store."""
    if doc_id in DOCUMENT_STORE:
        del DOCUMENT_STORE[doc_id]
        return True
    return False


def list_documents() -> list[dict]:
    """List all stored documents (without chunks)."""
    return [
        {
            "id": v["id"],
            "name": v["name"],
            "chunk_count": v["chunk_count"],
            "word_count": v["word_count"],
        }
        for v in DOCUMENT_STORE.values()
    ]
