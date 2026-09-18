#!/usr/bin/env python3
"""Import BStime JavaHelp (jar/BStime_en) into SmartHelp for WhatsApp /api/ask RAG."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BELT_ROOT = ROOT.parent
DEFAULT_HELP = BELT_ROOT / "jar" / "BStime_en"

sys.path.insert(0, str(ROOT))

from backend.app.db.database import init_db  # noqa: E402
from backend.app.services.ingestion.importer import import_javahelp_folder  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Index JavaHelp HTML into SmartHelp")
    parser.add_argument(
        "--path",
        type=Path,
        default=DEFAULT_HELP,
        help=f"HelpSet root (default: {DEFAULT_HELP})",
    )
    parser.add_argument("--title", default="BStime — Time & Attendance Help (EN)")
    args = parser.parse_args()

    if not args.path.is_dir():
        print(f"Not found: {args.path}", file=sys.stderr)
        return 1

    init_db()
    doc_id = import_javahelp_folder(
        help_root=args.path,
        title=args.title,
        language="en",
        user_notes="Imported from jar/BStime_en for Belt WhatsApp",
    )
    print(f"OK document_id={doc_id}")
    print("Restart SmartHelp if it was running, then ask via WhatsApp or POST /api/ask")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
