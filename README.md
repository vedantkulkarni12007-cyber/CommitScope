# CommitScope

**Git repository intelligence — architecture graphs, dependency analysis, and commit analytics.**

CommitScope analyses local git repositories using deterministic static analysis. No AI, no cloud, no paid APIs. Everything runs locally in Docker Compose.

---

## What it does

| Feature | Status |
|---|---|
| Repository registration and ingestion | Stage 2 |
| Architecture dependency graph | Stage 4 |
| Git analytics and commit timeline | Stage 5 |
| Architecture heatmap (churn overlay) | Stage 5 |
| Historical snapshot comparisons | Stage 6 |
| **Infrastructure, API, schema, design system** | **✓ Stage 1 (this release)** |

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker | 24+ | Runs all services |
| Docker Compose | v2 (`docker compose`) | Orchestrates services |
| Git | any | Version control |
| Python | 3.12+ | Backend local development (optional) |
| Node.js | 20+ | Frontend local development (optional) |

---

## Quick start (Docker Compose)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/commitscope.git
cd commitscope

# 2. Create your environment file
cp .env.example .env
# Edit .env and change POSTGRES_PASSWORD to a strong value.

# 3. Start all services
docker compose up --build

# 4. Open the application
#    Frontend:  http://localhost:5173
#    API docs:  http://localhost:8000/api/docs
#    Health:    http://localhost:8000/api/v1/health
```

The `backend` service automatically runs Alembic migrations before starting Uvicorn.

---

## Local development (without Docker)

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# Install dependencies (including dev extras)
pip install -e ".[dev]"

# Set environment variables
cp ../.env.example .env
# Edit .env: set DATABASE_URL to point at your local PostgreSQL instance

# Run Alembic migrations
alembic upgrade head

# Start the development server (with hot-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev

# The app is available at http://localhost:5173
# The Vite proxy forwards /api/* to http://localhost:8000
```

---

## Running tests

### Backend

```bash
cd backend

# Install dev dependencies if not already done
pip install -e ".[dev]"

# Run the test suite (uses in-memory SQLite — no PostgreSQL required)
pytest

# With verbose output
pytest -v

# With coverage report
pytest --cov=app --cov-report=term-missing
```

### Frontend

```bash
cd frontend

npm install

# Run tests once
npm test

# Run in watch mode during development
npm run test:watch
```

---

## Project structure

```
CommitScope/
├── docker-compose.yml          # Development orchestration
├── .env.example                # Environment variable template
│
├── backend/
│   ├── pyproject.toml          # Python dependencies and tooling config
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py              # Async migration runner
│   │   └── versions/           # Migration scripts
│   └── app/
│       ├── main.py             # FastAPI application factory
│       ├── config.py           # Settings (pydantic-settings + .env)
│       ├── database.py         # Async engine and session factory
│       ├── dependencies.py     # FastAPI Depends() providers
│       ├── models/             # SQLAlchemy 2.x ORM models
│       ├── schemas/            # Pydantic request/response schemas
│       ├── routers/            # Route handlers (delegate to services)
│       ├── services/           # Business logic (Stage 2+)
│       ├── analysis/           # Analysis engines (Stage 3+)
│       │   └── languages/      # Per-language tree-sitter parsers
│       └── tests/              # pytest tests
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx             # Root router
        ├── main.jsx            # React entry point
        ├── api/                # API client
        ├── components/         # Reusable UI components
        │   ├── layout/         # AppShell, Sidebar, TopBar
        │   └── shared/         # Logo, StatusBadge
        ├── pages/              # Route-level page components
        ├── styles/             # Design system CSS tokens
        └── tests/              # Vitest + React Testing Library
```

---

## Environment variables

See [`.env.example`](.env.example) for all variables and their descriptions.

| Variable | Required | Default | Description |
|---|---|---|---|
| `POSTGRES_PASSWORD` | **Yes** | — | PostgreSQL password |
| `DATABASE_URL` | **Yes** | — | Async SQLAlchemy connection string |
| `ALLOWED_REPO_ROOTS` | Yes | `/repos` | Comma-separated filesystem paths CommitScope may read |
| `DEBUG` | No | `false` | Enable SQLAlchemy query echo |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed frontend origins |
| `VITE_API_URL` | No | (same-origin) | Backend URL for the frontend |

---

## Security model

- **Repository paths are validated** before any filesystem access. Only paths that fall under an explicitly configured `ALLOWED_REPO_ROOTS` entry are accepted.
- **No repository code is executed**. Analysis uses AST parsing only; no `eval`, `exec`, or subprocess calls on repository content.
- **Secrets are environment variables**. No credentials are hardcoded or committed.
- **Dependency edges have confidence scores**. Confirmed static imports (confidence 1.0) are clearly distinguished from inferred or external references. No edges are fabricated.

---

## Technology stack

| Component | Technology | License |
|---|---|---|
| Backend language | Python 3.12 | PSF |
| HTTP framework | FastAPI | MIT |
| ORM | SQLAlchemy 2.x (async) | MIT |
| Migrations | Alembic | MIT |
| Database driver | asyncpg | Apache 2.0 |
| Git integration | Pygit2 / libgit2 | GPL-2 + libgit2 exception |
| AST parsing | tree-sitter (Stage 3) | MIT |
| Graph algorithms | NetworkX (Stage 3) | BSD-3 |
| Database | PostgreSQL 16 | PostgreSQL License |
| Frontend framework | React 18 | MIT |
| Build tool | Vite 5 | MIT |
| Graph canvas | @xyflow/react (Stage 4) | MIT |
| Charts | Recharts (Stage 5) | MIT |

---

## Contributing

CommitScope is open-source. Contributions welcome once the Stage 2 implementation is complete and the repository is public on GitHub.

---

## License

MIT — see `LICENSE` for details.
