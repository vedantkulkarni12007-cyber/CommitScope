"""
Async SQLAlchemy engine, session factory, and ORM declarative base.

The engine is created once at import time from settings.database_url.
Tests override the engine by overriding the FastAPI get_db dependency;
they never touch this module's engine directly.
"""
from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# ── Engine ─────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    # Keep a small pool for the dev/single-node case.
    pool_size=5,
    max_overflow=10,
    # Recycle stale connections proactively.
    pool_pre_ping=True,
    pool_recycle=3600,
)

# ── Session factory ────────────────────────────────────────────────────────────
# expire_on_commit=False prevents lazy-load errors when attributes are accessed
# after commit in async contexts.
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ── Declarative base ───────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Shared declarative base for all ORM models.

    All models in app/models/ inherit from this Base so Alembic can discover
    them for autogenerate via ``target_metadata = Base.metadata``.
    """
