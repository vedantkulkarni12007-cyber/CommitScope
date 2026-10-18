"""
Application settings loaded from environment variables and an optional .env file.

All secrets (database passwords, etc.) must be provided via environment variables.
This module never supplies production-ready defaults for secrets; only safe
development placeholders are included here.
"""
from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ───────────────────────────────────────────────────────────
    app_version: str = "0.1.0"
    debug: bool = False

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://commitscope:commitscope_dev@localhost:5432/commitscope"
    )

    # ── Security ──────────────────────────────────────────────────────────────
    # Comma-separated absolute filesystem paths that CommitScope may read.
    # Any repository path that does not fall under one of these roots is
    # rejected at the service layer before any filesystem access occurs.
    allowed_repo_roots: list[str] = []

    # ── CORS ──────────────────────────────────────────────────────────────────
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # ── Validators ────────────────────────────────────────────────────────────

    @field_validator("allowed_repo_roots", mode="before")
    @classmethod
    def _split_repo_roots(cls, v: str | list[str]) -> list[str]:
        """Accept either a JSON list or a comma-separated string."""
        if isinstance(v, str):
            return [r.strip() for r in v.split(",") if r.strip()]
        return v

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, v: str | list[str]) -> list[str]:
        """Accept either a JSON list or a comma-separated string."""
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v


# Module-level singleton — import this everywhere.
settings = Settings()
