# 🛡️ CyberMentor — AI Cybersecurity Chatbot

A full-stack cybersecurity mentor chatbot with RAG support, built for students and pentesters.

## Stack
- **Frontend**: React + Vite (terminal hacker aesthetic)
- **Backend**: Flask + Python (REST API, RAG pipeline, PDF parsing)

## Features
- 💬 Multi-turn AI chat powered by Claude API
- 📄 RAG: Upload PDFs (lab manuals, OWASP notes) — they get chunked & injected as context
- ⚡ 8 Quick-fire prompts (SQLi, XSS, Metasploit, OWASP, etc.)
- 🗂️ Topic sidebar (Web Vulns, Network, Exploit, Defense, Forensics)
- 💾 Conversation history (localStorage)
- 🔍 Code block syntax highlighting

---

## Project Structure

```
cybermentor/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx      # Message list + typing indicator
│   │   │   ├── InputBar.jsx        # Textarea + send button
│   │   │   ├── QuickPrompts.jsx    # Quick-fire buttons
│   │   │   ├── Sidebar.jsx         # Topic nav + uploaded docs
│   │   │   ├── MessageBubble.jsx   # Renders markdown + code blocks
│   │   │   └── Header.jsx          # Logo + status
│   │   ├── hooks/
│   │   │   ├── useChat.js          # Chat state + API calls
│   │   │   └── useDocuments.js     # File upload + doc management
│   │   ├── utils/
│   │   │   └── formatMessage.jsx   # Markdown/code renderer
│   │   ├── styles/
│   │   │   └── globals.css         # CSS variables + animations
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # Flask REST API
│   ├── app.py              # Main Flask app + routes
│   ├── rag.py              # RAG: chunk, embed, retrieve
│   ├── prompts.py          # System prompt + topic prompts
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Add your ANTHROPIC_API_KEY
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send a message, get AI response |
| POST | `/api/upload` | Upload a PDF for RAG |
| GET | `/api/documents` | List uploaded documents |
| DELETE | `/api/documents/:id` | Remove a document |
| GET | `/api/health` | Health check |

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
FLASK_PORT=5000
FLASK_DEBUG=true
MAX_CONTEXT_CHUNKS=5
CHUNK_SIZE=400
CHUNK_OVERLAP=50
```
