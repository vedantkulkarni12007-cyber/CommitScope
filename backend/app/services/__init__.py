"""
Services package.

Service modules contain the business logic layer. Routers delegate to services;
services orchestrate analysis engines and database operations.

Stage 2+ will add:
  repository_service.py  — Repository registration, validation, and status management
  git_service.py         — Pygit2-backed commit log extraction and file tree enumeration
  graph_service.py       — NetworkX graph construction and metric computation
"""
