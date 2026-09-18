from __future__ import annotations

import hashlib
import json
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from backend.app.core.arabic import estimate_tokens
from backend.app.core.config import load_settings
from backend.app.core.security import looks_like_pdf, safe_filename
from backend.app.db.database import connect
from backend.app.services.ingestion.chunking import build_topics_and_passages
from backend.app.services.ingestion.pdf_extract import extract_pdf_pages
from backend.app.services.ingestion.epub_extract import extract_epub_pages
from backend.app.services.ingestion.javahelp_extract import extract_javahelp_pages


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def create_import_job() -> str:
    job_id = str(uuid.uuid4())
    now = _now()
    with connect() as conn:
        conn.execute(
            "INSERT INTO import_jobs (id, status, progress, message, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            (job_id, "queued", 0.0, "Queued", now, now),
        )
    return job_id


def update_job(job_id: str, *, status: Optional[str] = None, progress: Optional[float] = None,
               message: Optional[str] = None, error: Optional[str] = None, document_id: Optional[str] = None) -> None:
    fields = ["updated_at=?"]
    values: list = [_now()]
    if status is not None:
        fields.append("status=?")
        values.append(status)
    if progress is not None:
        fields.append("progress=?")
        values.append(progress)
    if message is not None:
        fields.append("message=?")
        values.append(message)
    if error is not None:
        fields.append("error=?")
        values.append(error)
    if document_id is not None:
        fields.append("document_id=?")
        values.append(document_id)
    values.append(job_id)
    with connect() as conn:
        conn.execute(f"UPDATE import_jobs SET {', '.join(fields)} WHERE id=?", values)


def is_cancelled(job_id: str) -> bool:
    with connect() as conn:
        row = conn.execute("SELECT cancelled FROM import_jobs WHERE id=?", (job_id,)).fetchone()
        return bool(row and row["cancelled"])


def cancel_job(job_id: str) -> None:
    with connect() as conn:
        conn.execute("UPDATE import_jobs SET cancelled=1, status='cancelled', updated_at=? WHERE id=?", (_now(), job_id))


def import_pdf(
    *,
    source_path: Path,
    original_filename: str,
    title: Optional[str] = None,
    author: Optional[str] = None,
    language: Optional[str] = None,
    copyright_owner: Optional[str] = None,
    user_notes: Optional[str] = None,
    job_id: Optional[str] = None,
) -> str:
    settings = load_settings()
    data_dir = Path(settings["_data_dir"])
    job_id = job_id or create_import_job()

    try:
        update_job(job_id, status="validating", progress=0.05, message="Validating document")
        header = source_path.read_bytes()[:8]
        is_epub = source_path.suffix.lower() == ".epub"
        if not is_epub and not looks_like_pdf(header):
            raise ValueError("Invalid PDF/EPUB signature / توقيع المستند غير صالح")

        file_hash = _sha256_file(source_path)
        with connect() as conn:
            dup = conn.execute("SELECT id, title FROM documents WHERE file_hash_sha256=?", (file_hash,)).fetchone()
            if dup:
                update_job(job_id, status="duplicate", progress=1.0, message=f"Duplicate of {dup['title']}", document_id=dup["id"])
                return dup["id"]

        if is_cancelled(job_id):
            raise RuntimeError("Import cancelled")

        update_job(job_id, status="extracting", progress=0.15, message="Extracting text")
        pages, meta = (
            extract_epub_pages(str(source_path))
            if is_epub
            else extract_pdf_pages(str(source_path))
        )

        doc_id = str(uuid.uuid4())
        safe_name = safe_filename(original_filename)
        dest = data_dir / "pdfs" / f"{doc_id}_{safe_name}"
        shutil.copy2(source_path, dest)

        display_title = title or meta.get("title") or Path(original_filename).stem
        display_author = author or meta.get("author") or None

        return _persist_imported_document(
            pages=pages,
            meta=meta,
            file_hash=file_hash,
            dest_path=dest,
            original_filename=original_filename,
            title=display_title,
            author=display_author,
            language=language,
            copyright_owner=copyright_owner,
            user_notes=user_notes,
            job_id=job_id,
            data_dir=data_dir,
            doc_id=doc_id,
        )
    except Exception as e:
        update_job(job_id, status="failed", error=str(e), message="Import failed")
        raise


def import_javahelp_folder(
    *,
    help_root: Path,
    title: Optional[str] = None,
    language: str = "en",
    copyright_owner: Optional[str] = None,
    user_notes: Optional[str] = None,
    job_id: Optional[str] = None,
) -> str:
    """Import a JavaHelp-style folder (e.g. jar/BStime_en) into SmartHelp passages + embeddings."""
    settings = load_settings()
    data_dir = Path(settings["_data_dir"])
    job_id = job_id or create_import_job()
    help_root = help_root.resolve()

    try:
        update_job(job_id, status="validating", progress=0.05, message="Validating JavaHelp folder")
        pages, meta = extract_javahelp_pages(help_root)
        file_hash = str(meta.get("file_hash_sha256") or "")
        if not file_hash:
            raise ValueError("Could not hash JavaHelp folder")

        with connect() as conn:
            dup = conn.execute("SELECT id, title FROM documents WHERE file_hash_sha256=?", (file_hash,)).fetchone()
            if dup:
                update_job(
                    job_id,
                    status="duplicate",
                    progress=1.0,
                    message=f"Duplicate of {dup['title']}",
                    document_id=dup["id"],
                )
                return dup["id"]

        if is_cancelled(job_id):
            raise RuntimeError("Import cancelled")

        update_job(job_id, status="extracting", progress=0.15, message="Extracting JavaHelp topics")
        doc_id = str(uuid.uuid4())
        stamp = data_dir / "pdfs" / f"{doc_id}_javahelp_{safe_filename(help_root.name)}.json"
        stamp.parent.mkdir(parents=True, exist_ok=True)
        stamp.write_text(json.dumps(meta.get("metadata") or {}, ensure_ascii=False, indent=2), encoding="utf-8")

        display_title = title or str(meta.get("title") or help_root.name)
        return _persist_imported_document(
            pages=pages,
            meta=meta,
            file_hash=file_hash,
            dest_path=stamp,
            original_filename=f"{help_root.name}.javahelp",
            title=display_title,
            author=str(meta.get("author") or "JavaHelp"),
            language=language,
            copyright_owner=copyright_owner,
            user_notes=user_notes,
            job_id=job_id,
            data_dir=data_dir,
            doc_id=doc_id,
        )
    except Exception as e:
        update_job(job_id, status="failed", error=str(e), message="Import failed")
        raise


def _persist_imported_document(
    *,
    pages: list,
    meta: dict,
    file_hash: str,
    dest_path: Path,
    original_filename: str,
    title: str,
    author: Optional[str],
    language: Optional[str],
    copyright_owner: Optional[str],
    user_notes: Optional[str],
    job_id: str,
    data_dir: Path,
    doc_id: Optional[str] = None,
) -> str:
    now = _now()

    update_job(job_id, status="structuring", progress=0.45, message="Building topics")
    topics = build_topics_and_passages(pages)

    if is_cancelled(job_id):
        if dest_path.exists():
            dest_path.unlink(missing_ok=True)
        raise RuntimeError("Import cancelled")

    doc_id = doc_id or str(uuid.uuid4())
    update_job(job_id, document_id=doc_id)

    with connect() as conn:
        conn.execute(
            """INSERT INTO documents
            (id, title, original_filename, author, language, file_hash_sha256, page_count,
             copyright_owner, user_notes, pdf_path, metadata_json, status, imported_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                doc_id,
                title,
                original_filename,
                author,
                language or "auto",
                file_hash,
                int(meta.get("page_count") or len(pages)),
                copyright_owner,
                user_notes,
                str(dest_path),
                json.dumps(meta.get("metadata") or {}, ensure_ascii=False),
                "indexed",
                now,
                now,
            ),
        )

        chapter_ids: dict[str, str] = {}
        for t in topics:
            if t.chapter_title not in chapter_ids:
                ch_id = str(uuid.uuid4())
                chapter_ids[t.chapter_title] = ch_id
                conn.execute(
                    "INSERT INTO chapters (id, document_id, title, order_index, page_from, page_to) VALUES (?,?,?,?,?,?)",
                    (ch_id, doc_id, t.chapter_title, len(chapter_ids), t.page_from, t.page_to),
                )

        topic_id_by_title: dict[str, str] = {}
        for t in topics:
            topic_id = str(uuid.uuid4())
            topic_id_by_title[t.title] = topic_id
            parent_id = topic_id_by_title.get(t.parent_title) if t.parent_title else None
            ch_id = chapter_ids[t.chapter_title]
            summary = (t.body_text[:280] + "…") if len(t.body_text) > 280 else t.body_text
            conn.execute(
                """INSERT INTO topics
                (id, document_id, chapter_id, parent_topic_id, title, heading_path, summary,
                 page_from, page_to, order_index, body_text, body_html)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    topic_id,
                    doc_id,
                    ch_id,
                    parent_id,
                    t.title,
                    t.heading_path,
                    summary,
                    t.page_from,
                    t.page_to,
                    t.order_index,
                    t.body_text,
                    f"<pre>{_escape_html(t.body_text)}</pre>",
                ),
            )

            for p in t.passages:
                passage_id = str(uuid.uuid4())
                conn.execute(
                    """INSERT INTO passages
                    (id, document_id, chapter_id, topic_id, topic_title, heading_path,
                     text_original, text_search_normalized, page_from, page_to,
                     char_count, token_estimate, embedding_status, extraction_confidence)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        passage_id,
                        doc_id,
                        ch_id,
                        topic_id,
                        p.topic_title,
                        p.heading_path,
                        p.text_original,
                        p.text_search_normalized,
                        p.page_from,
                        p.page_to,
                        len(p.text_original),
                        estimate_tokens(p.text_original),
                        "pending",
                        p.extraction_confidence,
                    ),
                )
                conn.execute(
                    """INSERT INTO passages_fts (passage_id, topic_title, heading_path, text_search_normalized)
                       VALUES (?,?,?,?)""",
                    (passage_id, p.topic_title, p.heading_path, p.text_search_normalized),
                )
                for b in p.blocks[:50]:
                    conn.execute(
                        """INSERT INTO passage_blocks
                        (id, passage_id, page_number, block_index, x0,y0,x1,y1, font_size, is_bold, raw_text)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                        (
                            str(uuid.uuid4()),
                            passage_id,
                            b.page_number,
                            b.block_index,
                            b.x0,
                            b.y0,
                            b.x1,
                            b.y1,
                            b.font_size,
                            1 if b.is_bold else 0,
                            b.text[:2000],
                        ),
                    )

        topics_dir = data_dir / "topics" / doc_id
        topics_dir.mkdir(parents=True, exist_ok=True)
        for topic_title, tid in topic_id_by_title.items():
            row = conn.execute("SELECT body_text, page_from, page_to FROM topics WHERE id=?", (tid,)).fetchone()
            (topics_dir / f"{tid}.md").write_text(
                f"# {topic_title}\n\nPages: {row['page_from']}-{row['page_to']}\n\n{row['body_text']}\n",
                encoding="utf-8",
            )

    update_job(job_id, status="embedding", progress=0.75, message="Building embeddings", document_id=doc_id)
    try:
        from backend.app.services.embeddings.service import embed_document_passages

        embed_document_passages(doc_id)
    except Exception as emb_err:
        update_job(job_id, message=f"Indexed without embeddings: {emb_err}")

    update_job(job_id, status="completed", progress=1.0, message="Import complete", document_id=doc_id)
    return doc_id


def _escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def delete_document(document_id: str) -> None:
    settings = load_settings()
    with connect() as conn:
        row = conn.execute("SELECT pdf_path FROM documents WHERE id=?", (document_id,)).fetchone()
        if not row:
            return
        passage_ids = [r["id"] for r in conn.execute("SELECT id FROM passages WHERE document_id=?", (document_id,)).fetchall()]
        for pid in passage_ids:
            conn.execute("DELETE FROM passages_fts WHERE passage_id=?", (pid,))
        conn.execute("DELETE FROM documents WHERE id=?", (document_id,))
        pdf_path = Path(row["pdf_path"])
        if pdf_path.exists():
            pdf_path.unlink(missing_ok=True)
        topics_dir = Path(settings["_data_dir"]) / "topics" / document_id
        if topics_dir.exists():
            shutil.rmtree(topics_dir, ignore_errors=True)
    try:
        from backend.app.services.embeddings.vector_index import get_vector_index

        get_vector_index().remove_document(document_id)
    except Exception:
        pass


def reindex_document(document_id: str) -> str:
    import shutil
    import tempfile

    with connect() as conn:
        row = conn.execute("SELECT pdf_path, original_filename, title, author, language, copyright_owner, user_notes FROM documents WHERE id=?", (document_id,)).fetchone()
        if not row:
            raise ValueError("Document not found")
        pdf_path = Path(row["pdf_path"])
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF missing for reindex: {pdf_path}")
        meta = dict(row)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        backup_path = Path(tmp.name)
    shutil.copy2(pdf_path, backup_path)
    try:
        delete_document(document_id)
        job_id = create_import_job()
        return import_pdf(
            source_path=backup_path,
            original_filename=meta["original_filename"],
            title=meta["title"],
            author=meta["author"],
            language=meta["language"],
            copyright_owner=meta["copyright_owner"],
            user_notes=meta["user_notes"],
            job_id=job_id,
        )
    finally:
        backup_path.unlink(missing_ok=True)
