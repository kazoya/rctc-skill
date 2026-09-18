#!/usr/bin/env python3
"""Rebuild the master ITB knowledge context file used by Ollama universal answers."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.db.database import init_db  # noqa: E402
from backend.app.services.qa.knowledge_context import (  # noqa: E402
    master_context_path,
    rebuild_master_context,
)


def main() -> None:
    init_db()
    text = rebuild_master_context(force=True)
    path = master_context_path()
    print(f"Wrote {len(text):,} chars to {path}")


if __name__ == "__main__":
    main()
