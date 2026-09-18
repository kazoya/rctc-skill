from __future__ import annotations

import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONTENT_ROOT = PROJECT_ROOT.parent / "embeddings"
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.services.ingestion.importer import import_pdf  # noqa: E402
from backend.app.db.database import connect  # noqa: E402
from backend.app.services.embeddings.service import embed_document_passages  # noqa: E402


def main() -> int:
    sources = sorted((CONTENT_ROOT / "pdf").glob("*.pdf"))
    sources += sorted((CONTENT_ROOT / "epub").glob("*.epub"))
    if not sources:
        print(f"No PDF/EPUB files found under {CONTENT_ROOT}")
        return 0

    failed = 0
    for source in sources:
        try:
            document_id = import_pdf(
                source_path=source,
                original_filename=source.name,
                language="ar" if source.suffix.lower() == ".epub" else None,
            )
            with connect() as connection:
                pending = connection.execute(
                    "SELECT COUNT(*) AS n FROM passages WHERE document_id=? AND embedding_status<>'ready'",
                    (document_id,),
                ).fetchone()["n"]
            if pending:
                embed_document_passages(document_id)
            print(f"OK  {source.name} -> {document_id}")
        except Exception as error:
            failed += 1
            print(f"ERR {source.name}: {error}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
