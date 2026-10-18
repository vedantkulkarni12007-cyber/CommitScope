"""
Pytest fixtures shared across all backend tests.

Database strategy
─────────────────
Tests use an in-memory SQLite database via aiosqlite. This means:
  • No PostgreSQL connection required to run the test suite.
  • Schema is created from Base.metadata (the ORM models), not by running
    Alembic migrations. Migration correctness is validated separately in CI
    against a real PostgreSQL instance.
  • The get_db FastAPI dependency is overridden to provide the SQLite session.

All SQLAlchemy models use portable column types (sa.Uuid, sa.String with
native_enum=False) so the schema is compatible with SQLite.
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies import get_db
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


# ── Engine ─────────────────────────────────────────────────────────────────────
@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create a single in-memory SQLite engine for the whole test session."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


# ── Session factory ────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def test_session_factory(test_engine):
    return async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


# ── DB session (per-test) ──────────────────────────────────────────────────────
@pytest_asyncio.fixture
async def db_session(test_session_factory):
    """Provide a database session that is rolled back after each test."""
    async with test_session_factory() as session:
        yield session
        await session.rollback()


# ── HTTP test client (per-test) ────────────────────────────────────────────────
@pytest_asyncio.fixture
async def client(test_session_factory):
    """
    Provide an ASGI test client with the DB dependency overridden to use
    the in-memory SQLite session factory.
    """

    async def override_get_db():
        async with test_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
