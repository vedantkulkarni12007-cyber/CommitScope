"""
CommitScope FastAPI application factory.

Routers are registered here. Middleware (CORS) is applied globally.
Route handlers must remain thin: they validate input and delegate all
business logic to the services layer.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health

app = FastAPI(
    title="CommitScope API",
    description=(
        "Git repository intelligence platform. "
        "Provides deterministic architecture graphs, dependency analysis, "
        "and Git analytics — no AI required."
    ),
    version=settings.app_version,
    # Move OpenAPI endpoints under /api/ to avoid clashing with the frontend
    # SPA router when both are served from the same host in production.
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(health.router)

# Future stages will add:
#   from app.routers import repositories, graph, commits, analysis
#   app.include_router(repositories.router)
#   ...


@app.get("/", tags=["root"], summary="API root")
async def root() -> dict:
    """Returns a brief service description and link to the OpenAPI docs."""
    return {
        "name": "CommitScope API",
        "version": settings.app_version,
        "docs": "/api/docs",
        "status": "ok",
    }
