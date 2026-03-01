# Sensory Composer

A simplified multisensory creative web application for composing music, generating video, and writing poetry.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Vue 3, Tailwind CSS, Alpine.js, HTMX, hyperscript, p5.js, Chart.js |
| Backend | Laravel 11 (API + Blade), FastAPI (Python 3.11), Rust (DSP microservice) |
| Storage | IndexedDB, PouchDB → CouchDB sync, sql.js, PostgreSQL |
| Notebooks | Jupyter Lab, Voila |
| Docs | Mermaid |
| Deploy | Vercel (frontend), Render (backend services) |

## Quick Start (Local)

```bash
# 1. Clone and enter project
git clone https://github.com/Uchida16104/sensory-composer.git
cd sensory-composer

# 2. Install everything and start all services
make install
make dev
```

## Project Structure

```
sensory-composer/
├── frontend/          # Next.js app → Vercel
├── backend/           # Laravel API + microservices → Render
│   └── services/
│       ├── fastapi/   # Python ML/DSP service
│       └── rust-dsp/  # Rust FFT microservice
├── notebooks/         # Jupyter research notebooks
├── data-sync/         # PouchDB / IndexedDB / sql.js helpers
└── docs/              # Mermaid architecture diagrams
```

## Deployment

- **Frontend**: Push `frontend/` to Vercel. Set environment variable `NEXT_PUBLIC_API_URL`.
- **Laravel**: Deploy `backend/` to Render as a PHP web service.
- **FastAPI**: Deploy `backend/services/fastapi/` to Render as a Python service.
- **Rust DSP**: Deploy `backend/services/rust-dsp/` to Render using the Rust environment.

See `docs/ARCHITECTURE.mmd` for the full system diagram.

Generated via ChatGPT
