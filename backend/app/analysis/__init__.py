"""
Analysis engine package.

This package contains pure analysis modules with no HTTP or database concerns.
Each module accepts raw data (file bytes, git objects) and returns structured
results that the service layer persists.

Stage 3+ modules:
  git_analyzer.py         — Pygit2-backed commit log and file blame extraction
  dependency_analyzer.py  — Dispatches to per-language parsers, resolves imports
  graph_builder.py        — Builds a NetworkX DiGraph and computes graph metrics

Sub-package:
  languages/              — Per-language tree-sitter parser implementations
"""
