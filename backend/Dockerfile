# ─────────────────────────────────────────────────────────────────────────────
# CommitScope Backend — Development Dockerfile
#
# Base: python:3.12-slim (Debian Bookworm)
# libgit2-dev is installed via apt for Pygit2 (Stage 2+).
# PYTHONPATH=/app ensures the bind-mounted source takes precedence over the
# installed package, enabling hot-reload without a container rebuild.
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.12-slim

LABEL maintainer="CommitScope"
LABEL description="CommitScope FastAPI backend"

# ── System dependencies ───────────────────────────────────────────────────────
# libgit2-dev  : C library required by Pygit2 (Git integration, Stage 2+)
# pkg-config   : needed to locate libgit2 headers during Pygit2 build
# build-essential: C compiler toolchain for packages without binary wheels
# git          : git binary, available as a fallback if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgit2-dev \
    pkg-config \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# PYTHONPATH=/app makes the `app` package importable from the mounted source.
# This means docker-compose bind-mounts (./backend:/app) provide hot-reload
# without overwriting installed dependencies.
ENV PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# ── Install Python dependencies ───────────────────────────────────────────────
# Copy only pyproject.toml first to maximise Docker layer cache reuse.
# A stub app/__init__.py allows hatchling to resolve the editable install
# before the full source is copied.
COPY pyproject.toml .
RUN mkdir -p app && touch app/__init__.py \
    && pip install --no-cache-dir ".[dev]" \
    && rm -rf app

# ── Copy application source ───────────────────────────────────────────────────
# In development, docker-compose bind-mounts ./backend:/app, overriding these
# files with live source. PYTHONPATH ensures the live source wins.
COPY . .

EXPOSE 8000

# Default command; overridden by docker-compose to also run migrations first.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
