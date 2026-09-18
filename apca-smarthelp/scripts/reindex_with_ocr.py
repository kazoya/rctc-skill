#!/usr/bin/env python3
"""Re-import all PDFs with OCR image extraction enabled."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.db.database import connect, init_db  # noqa: E402
from backend.app.services.ingestion.importer import reindex_document  # noqa: E402


def main() -> int:
    init_db()
    with connect() as conn:
        rows = conn.execute("SELECT id, title, original_filename FROM documents ORDER BY imported_at").fetchall()
    if not rows:
        print("No documents to reindex.")
        return 1
    for row in rows:
        doc_id = row["id"]
        print(f"Reindexing {doc_id} — {row['title'] or row['original_filename']}")
        job_id = reindex_document(doc_id)
        print(f"  job={job_id}")
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
