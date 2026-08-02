# MedGPT v1.0 — AI Medical Assistant

A production-ready AI-powered medical assistant built with **FastAPI + React + Vite + Tailwind CSS**, powered by **Ollama** (local LLM), **ChromaDB** (vector store), and **LangChain** (RAG pipeline).

---

## 🏗️ Architecture

```
medgpt-project/
├── backend/               # FastAPI + SQLite + LangChain + ChromaDB
│   ├── app/
│   │   ├── main.py        # FastAPI app + CORS + lifespan
│   │   ├── config.py      # Settings (pydantic-settings + .env)
│   │   ├── database.py    # SQLAlchemy + SQLite
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # LLM, PDF, RAG services
│   │   └── utils/         # Auth (JWT), hashing, helpers
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── run.py
├── frontend/              # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.tsx        # Router + protected routes
│   │   ├── pages/         # LoginPage, RegisterPage, Dashboard, Chat, Medical, Upload, Profile, Settings, Admin
│   │   ├── components/    # Layout, Chat, Medical tools, UI primitives
│   │   ├── services/      # API client (Axios + interceptors), auth, chat, medical
│   │   ├── store/         # Zustand state (auth, chat)
│   │   ├── hooks/         # useAuth, useChat
│   │   └── types/         # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml     # Full stack: Ollama + Backend + Frontend
```

---

## 🚀 Quick Start

### Prerequisites

- **Ollama** — [install from ollama.ai](https://ollama.ai)
- **Node.js 18+** and **npm**
- **Python 3.11+**

### 1. Install Ollama models

```bash
ollama pull llama3.2:3b          # Chat model (or use llama3.2:1b for faster)
ollama pull nomic-embed-text     # Embedding model for RAG
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env if needed (SECRET_KEY is required for production!)

# Start the server
python run.py
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 🐳 Docker Compose (Production)

```bash
# Start the full stack (Ollama + Backend + Frontend)
docker-compose up --build

# Pull models into the Ollama container
docker exec medgpt-ollama ollama pull llama3.2:3b
docker exec medgpt-ollama ollama pull nomic-embed-text
```

Access at: http://localhost

---

## 🔐 Authentication

- **First registered user** automatically becomes **Admin**
- JWT access tokens (30 min) + refresh tokens (7 days)
- Auto-refresh on 401 with React interceptor
- Role-based access: `user`, `doctor`, `admin`

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/auth/me` | Get current user |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/` | List all chats |
| POST | `/api/chat/` | Create new chat |
| GET | `/api/chat/{id}` | Get chat with messages |
| POST | `/api/chat/{id}/messages` | Send message (SSE streaming) |
| PATCH | `/api/chat/{id}` | Rename / archive chat |
| DELETE | `/api/chat/{id}` | Delete chat |

### Documents (RAG)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/pdf` | Upload PDF (async processing) |
| GET | `/api/upload/` | List documents |
| DELETE | `/api/upload/{id}` | Delete document |
| POST | `/api/upload/search` | Semantic search in documents |

### Medical Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/medical/symptom-checker` | AI symptom analysis |
| POST | `/api/medical/drug-interaction` | Drug interaction check |
| POST | `/api/medical/bmi-calculator` | BMI + health analysis |
| POST | `/api/medical/report-analyzer` | Medical report interpretation |
| POST | `/api/medical/medicine-info` | Drug information |
| POST | `/api/medical/disease-info` | Disease information |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | System statistics |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/{id}/role` | Change user role |
| PATCH | `/api/admin/users/{id}/status` | Activate / deactivate user |
| DELETE | `/api/admin/users/{id}` | Delete user |

---

## 🤖 AI Features

### Streaming Chat
Real-time SSE (Server-Sent Events) streaming so responses appear token-by-token.

### RAG (Retrieval-Augmented Generation)
1. Upload a PDF → auto-extracted, chunked, embedded with `nomic-embed-text`
2. Chunks stored in **ChromaDB** (persistent vector store)
3. Enable ⚡ RAG toggle in chat — relevant chunks injected as context before each AI response
4. Grounded, document-aware medical answers

### Medical Tools
- **Symptom Checker** — analyze symptoms with patient context
- **Drug Interaction** — check interactions between multiple medications
- **BMI Calculator** — BMI with personalized health analysis
- **Report Analyzer** — AI interpretation of blood, ECG, MRI, CT reports
- **Medicine Info** — comprehensive drug information
- **Disease Info** — detailed disease information

---

## ⚙️ Configuration (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | random | JWT signing key — **change in production** |
| `OLLAMA_MODEL` | `llama3.2:3b` | Chat model |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Embedding model |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server |
| `DATABASE_URL` | `sqlite:///./medgpt.db` | Database |
| `CHUNK_SIZE` | `1000` | PDF chunk size (chars) |
| `RAG_TOP_K` | `5` | Number of chunks retrieved |

---

## 🧪 Testing the API

With the server running, visit: **http://localhost:8000/docs** (Swagger UI)

```bash
# Health check
curl http://localhost:8000/api/health

# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","username":"admin","full_name":"Admin User","password":"Admin@1234"}'
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand, React Router v6 |
| HTTP | Axios (with JWT interceptor), Fetch (SSE streaming) |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| Database | SQLite + SQLAlchemy ORM |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| LLM | Ollama (local) — llama3.2, mistral, etc. |
| Embeddings | nomic-embed-text via Ollama |
| Vector DB | ChromaDB (persistent local) |
| PDF | PyPDF2 + LangChain text splitters |
| Containers | Docker + Docker Compose + Nginx |

---

## 📈 Roadmap (Phases 3–4 extensions)

- [ ] Voice assistant (speech-to-text + text-to-speech)
- [ ] Multi-PDF RAG with collection management
- [ ] Long-term conversation memory
- [ ] Analytics dashboard with charts
- [ ] CI/CD with GitHub Actions
- [ ] PostgreSQL support (replace SQLite)
- [ ] Email verification flow
- [ ] Export chat history as PDF

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ — MedGPT v1.0*
