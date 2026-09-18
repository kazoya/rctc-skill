from pathlib import Path

import fitz
import pytest

from backend.app.services.ingestion.importer import import_pdf
from backend.app.services.package.apcahelp import export_package, import_package, validate_package
from backend.app.services.search.hybrid import hybrid_search
from backend.app.db.database import connect


def _pdf(path: Path, title: str = "Leave Policy") -> None:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), title, fontsize=18)
    page.insert_text((72, 120), "Why leave balances may not reflect immediately after approval.", fontsize=11)
    page.insert_text((72, 150), "Error ORA-04036 indicates memory pressure during calculation.", fontsize=11)
    doc.save(path)
    doc.close()


def test_duplicate_detection_and_fts_search(tmp_path, monkeypatch):
    pdf = tmp_path / "policy.pdf"
    _pdf(pdf)

    import backend.app.services.embeddings.service as emb

    monkeypatch.setattr(emb, "embed_document_passages", lambda *_a, **_k: None)
    monkeypatch.setattr(emb, "embedding_available", lambda: False)

    doc_id = import_pdf(source_path=pdf, original_filename="policy.pdf", title="Leave Policy")
    dup_id = import_pdf(source_path=pdf, original_filename="policy.pdf", title="Leave Policy Copy")
    assert doc_id == dup_id

    resp = hybrid_search("ORA-04036")
    assert resp.action in ("auto_open", "show_results")
    assert resp.results
    assert any("ORA-04036" in r.snippet or r.phrase_boost > 0 or r.lexical_score > 0 for r in resp.results)


def test_auto_open_confidence_rules(monkeypatch):
    from backend.app.models.schemas import SearchHit, SearchResponse
    from backend.app.core.config import load_settings

    settings = load_settings()
    settings["search"]["auto_open_threshold"] = 0.72
    settings["search"]["min_first_second_gap"] = 0.05

    # Build synthetic ranking by inserting passages
    with connect() as conn:
        conn.execute(
            """INSERT INTO documents (id,title,original_filename,file_hash_sha256,page_count,pdf_path,status,imported_at,updated_at)
               VALUES ('d1','Doc','a.pdf','h1',1,'x','indexed','t','t')"""
        )
        conn.execute(
            """INSERT INTO topics (id,document_id,title,order_index,body_text)
               VALUES ('t1','d1','Exact Title',0,'body'), ('t2','d1','Other',1,'body')"""
        )
        conn.execute(
            """INSERT INTO passages
            (id,document_id,topic_id,topic_title,heading_path,text_original,text_search_normalized,page_from,page_to,embedding_status)
            VALUES
            ('p1','d1','t1','Exact Title','Exact Title','Exact Title body','exact title body',1,1,'pending'),
            ('p2','d1','t2','Other','Other','unrelated text about printers','unrelated text about printers',2,2,'pending')"""
        )
        conn.execute(
            "INSERT INTO passages_fts (passage_id, topic_title, heading_path, text_search_normalized) VALUES ('p1','Exact Title','Exact Title','exact title body')"
        )
        conn.execute(
            "INSERT INTO passages_fts (passage_id, topic_title, heading_path, text_search_normalized) VALUES ('p2','Other','Other','unrelated text about printers')"
        )

    strong = hybrid_search("Exact Title")
    assert strong.action in ("auto_open", "show_results")
    assert strong.results

    weak = hybrid_search("zzzz-not-found-topic-qqq")
    assert weak.action == "no_match"


def test_package_export_import_checksum(tmp_path, monkeypatch):
    pdf = tmp_path / "book.pdf"
    _pdf(pdf, "Manual")
    import backend.app.services.embeddings.service as emb

    monkeypatch.setattr(emb, "embed_document_passages", lambda *_a, **_k: None)
    import_pdf(source_path=pdf, original_filename="book.pdf", title="Manual")

    pkg = export_package(package_title="Test Pack", include_original_pdfs=False)
    assert pkg.exists()
    report = validate_package(pkg)
    assert report["valid"] is True

    # Tamper with a packaged file while keeping zip structure → checksum failure
    import json
    import zipfile
    import tempfile
    import shutil

    bad = tmp_path / "bad.apcahelp"
    with tempfile.TemporaryDirectory() as td:
        with zipfile.ZipFile(pkg, "r") as zf:
            zf.extractall(td)
        root = Path(td)
        (root / "copyright.txt").write_text("tampered", encoding="utf-8")
        with zipfile.ZipFile(bad, "w") as zf:
            for path in root.rglob("*"):
                if path.is_file():
                    zf.write(path, path.relative_to(root).as_posix())
    with pytest.raises(Exception):
        validate_package(bad)

    imported = import_package(pkg)
    assert imported["valid"] is True