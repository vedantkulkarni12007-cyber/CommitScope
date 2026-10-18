"""
Abstract base class for per-language dependency parsers.

Each concrete parser (Python, JavaScript/TypeScript, …) inherits from this
class and uses tree-sitter to extract import statements from source files.

Design constraints
──────────────────
* Parsers MUST NOT fabricate dependency edges.
* Parsers MUST return an empty list (not raise) when input is malformed.
* Only confirmed static imports are returned as ImportStatement instances.
* Dynamic imports (importlib.import_module, require() with non-literal paths)
  are excluded from results, not guessed at.
* Relative and absolute imports are both returned; resolution to FileNode
  targets is performed by DependencyAnalyzer, not here.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass(frozen=True)
class ImportStatement:
    """A single, confirmed static import extracted from source code."""

    # The exact raw text of the import statement as it appears in source.
    raw_statement: str
    # The module or package name as written in the import, e.g. "os.path"
    # or "../utils". For `from X import Y`, this is X.
    module_name: str
    # Relative path of the source file within the repository.
    source_path: str
    # 1-indexed line number where the import appears.
    line_number: int
    # True for relative imports (e.g. `from . import foo`, `from ..utils`).
    is_relative: bool
    # The specific names imported, e.g. ["Path", "exists"] for
    # `from pathlib import Path, exists`. Empty list for bare module imports.
    imported_names: list[str] = field(default_factory=list)


class BaseLanguageParser(ABC):
    """
    Abstract parser interface for a single programming language.

    Implementations are registered with DependencyAnalyzer (Stage 3) via
    a language name → parser mapping. The parser receives raw file bytes and
    returns ImportStatement instances; it never touches the database.
    """

    @property
    @abstractmethod
    def language_name(self) -> str:
        """Canonical lowercase language identifier, e.g. "python"."""
        ...

    @property
    @abstractmethod
    def file_extensions(self) -> list[str]:
        """File extensions this parser handles, e.g. [".py"]."""
        ...

    @abstractmethod
    def extract_imports(
        self, source_code: bytes, file_path: str
    ) -> list[ImportStatement]:
        """
        Parse *source_code* and return all confirmed static import statements.

        Args:
            source_code: Raw file bytes. The parser is responsible for
                         decoding; UTF-8 is assumed but errors are handled
                         gracefully (replace mode, not strict).
            file_path:   Repository-relative path, used only for error context
                         and populating ImportStatement.source_path.

        Returns:
            A (possibly empty) list of ImportStatement instances. On any parse
            error, log a warning and return [] — never raise.
        """
        ...

    def can_parse(self, file_path: str) -> bool:
        """Return True if this parser handles the given file extension."""
        return any(file_path.endswith(ext) for ext in self.file_extensions)

    def __repr__(self) -> str:
        return f"<{type(self).__name__} language={self.language_name!r}>"
