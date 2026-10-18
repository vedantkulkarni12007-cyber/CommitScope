"""
FastAPI dependency providers.

Import these in route handlers via ``Depends()`` — never instantiate sessions
or other resources directly inside routes.
"""
from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Provide a database session for the duration of a single request.

    Commits on clean exit, rolls back on any exception, and always closes
    the session. Tests replace this dependency via app.dependency_overrides.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
