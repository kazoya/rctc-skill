#!/usr/bin/env python3
"""Import all PDFs from C:\\Belt\\embeddings\\pdf with OCR enabled."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT.parent / "embeddings" / "pdf"
sys.path.insert(0, str(ROOT))

from backend.app.db.database import connect, init_db  # noqa: E402
from backend.app.services.embeddings.service import embed_document_passages  # noqa: E402
from backend.app.services.ingestion.importer import import_pdf  # noqa: E402


def main() -> int:
    init_db()
    sources = sorted(CONTENT.glob("*.pdf"))
    if not sources:
        print(f"No PDF files in {CONTENT}")
        return 1

    failed = 0
    for source in sources:
        try:
            doc_id = import_pdf(
                source_path=source,
                original_filename=source.name,
                language="ar" if "Arabic" in source.name else None,
            )
            with connect() as conn:
                pending = conn.execute(
                    "SELECT COUNT(*) AS n FROM passages WHERE document_id=? AND embedding_status<>'ready'",
                    (doc_id,),
                ).fetchone()["n"]
            if pending:
                embed_document_passages(doc_id)
            print(f"OK  {source.name} -> {doc_id}")
        except Exception as error:
            failed += 1
            print(f"ERR {source.name}: {error}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
