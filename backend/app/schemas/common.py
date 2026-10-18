"""
Common Pydantic response schemas shared across routes.
"""
from __future__ import annotations

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Response body for GET /api/v1/health."""

    status: str
    version: str
    database: str


class MessageResponse(BaseModel):
    """Generic single-message response."""

    message: str


class ErrorDetail(BaseModel):
    """Structured error detail used in 4xx/5xx responses."""

    code: str
    message: str
    detail: str | None = None
