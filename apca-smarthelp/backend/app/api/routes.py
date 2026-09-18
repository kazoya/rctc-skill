from __future__ import annotations

import shutil
import tempfile
import uuid
import re
from pathlib import Path
from typing import Optional

import fitz
from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse

from backend.app.core.config import get_copyright_block, load_settings, save_settings
from backend.app.core.security import safe_filename
from backend.app.db.database import connect
from backend.app.models.schemas import (
    AskRequest,
    AskResponse,
    DocumentOut,
    DocumentUpdate,
    HealthOut,
    JobOut,
    LearnedQaEntry,
    LearnedQaRequest,
    PackageExportRequest,
    RelatedTopic,
    SearchRequest,
    SearchResponse,
    SettingsOut,
    TocNode,
    TopicOut,
)
from backend.app.services.embeddings.service import embedding_available
from backend.app.services.ingestion import importer
from backend.app.services.package import apcahelp
from backend.app.services.qa.grounded import ask, ollama_reachable
from backend.app.services.qa.citation_validator import validate_response
from backend.app.services.qa.learned_qa import add_learned_pair, find_learned_answer, list_learned_pairs
from backend.app.services.related.topics import get_related_topics
from backend.app.services.search.hybrid import hybrid_search

router = APIRouter(prefix="/api")


def _doc_row(row) -> DocumentOut:
    return DocumentOut(
        id=row["id"],
        title=row["title"],
        original_filename=row["original_filename"],
        author=row["author"],
        language=row["language"],
        page_count=row["page_count"],
        copyright_owner=row["copyright_owner"],
        user_notes=row["user_notes"],
        status=row["status"],
        imported_at=row["imported_at"],
        file_hash_sha256=row["file_hash_sha256"],
    )


@router.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    settings = load_settings()
    return HealthOut(
        status="ok",
        app=settings["app_name"],
        version=settings["app_version"],
        embedding_available=embedding_available(),
        ollama_reachable=ollama_reachable(),
        copyright=settings["copyright"]["footer"],
    )


@router.get("/documents", response_model=list[DocumentOut])
def list_documents() -> list[DocumentOut]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM documents ORDER BY imported_at DESC").fetchall()
    return [_doc_row(r) for r in rows]


@router.get("/passages/random-proverb")
def random_proverb(document_filename: str = "19363759.epub") -> dict:
    with connect() as conn:
        row = conn.execute(
            """SELECT pb.raw_text, p.page_from, d.id AS document_id, d.title
               FROM passage_blocks pb
               JOIN passages p ON p.id=pb.passage_id
               JOIN documents d ON d.id=p.document_id
               WHERE d.original_filename=?
                 AND trim(pb.raw_text) LIKE '(%'
                 AND length(trim(pb.raw_text)) BETWEEN 15 AND 280
               ORDER BY RANDOM() LIMIT 1""",
            (document_filename,),
        ).fetchone()
    if not row:
        raise HTTPException(404, detail={"en": "No proverb found", "ar": "لم يُعثر على مثل"})
    proverb = re.sub(r"^\([^)]{1,12}\)\s*", "", row["raw_text"].strip())
    return {
        "proverb": proverb,
        "document_id": row["document_id"],
        "document_title": row["title"],
        "section": row["page_from"],
    }


@router.get("/documents/{document_id}", response_model=DocumentOut)
def get_document(document_id: str) -> DocumentOut:
    with connect() as conn:
        row = conn.execute("SELECT * FROM documents WHERE id=?", (document_id,)).fetchone()
    if not row:
        raise HTTPException(404, detail={"en": "Document not found", "ar": "المستند غير موجود"})
    return _doc_row(row)


@router.put("/documents/{document_id}", response_model=DocumentOut)
def update_document(document_id: str, body: DocumentUpdate) -> DocumentOut:
    fields = []
    values = []
    for key in ("title", "author", "language", "copyright_owner", "user_notes"):
        val = getattr(body, key)
        if val is not None:
            fields.append(f"{key}=?")
            values.append(val)
    if not fields:
        return get_document(document_id)
    values.append(document_id)
    with connect() as conn:
        conn.execute(f"UPDATE documents SET {', '.join(fields)} WHERE id=?", values)
    return get_document(document_id)


@router.delete("/documents/{document_id}")
def remove_document(document_id: str) -> dict:
    importer.delete_document(document_id)
    return {"ok": True}


@router.post("/documents/{document_id}/reindex")
def reindex(document_id: str) -> dict:
    try:
        # Keep existing PDF path - reindex_document currently deletes then needs file.
        with connect() as conn:
            row = conn.execute(
                "SELECT pdf_path, original_filename, title, author, language, copyright_owner, user_notes FROM documents WHERE id=?",
                (document_id,),
            ).fetchone()
        if not row:
            raise HTTPException(404, detail={"en": "Document not found", "ar": "المستند غير موجود"})
        pdf_path = Path(row["pdf_path"])
        if not pdf_path.exists():
            raise HTTPException(400, detail={"en": "PDF file missing", "ar": "ملف PDF مفقود"})
        # Copy aside before delete
        tmp = Path(tempfile.mkdtemp()) / pdf_path.name
        shutil.copy2(pdf_path, tmp)
        importer.delete_document(document_id)
        job_id = importer.create_import_job()
        new_id = importer.import_pdf(
            source_path=tmp,
            original_filename=row["original_filename"],
            title=row["title"],
            author=row["author"],
            language=row["language"],
            copyright_owner=row["copyright_owner"],
            user_notes=row["user_notes"],
            job_id=job_id,
        )
        return {"document_id": new_id, "job_id": job_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, detail=str(e)) from e


@router.post("/documents/import")
async def import_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    copyright_owner: Optional[str] = Form(None),
    user_notes: Optional[str] = Form(None),
) -> dict:
    settings = load_settings()
    max_bytes = int(settings.get("max_upload_mb", 100)) * 1024 * 1024
    filename = safe_filename(file.filename or "document.pdf")
    job_id = importer.create_import_job()
    tmp_dir = Path(settings["_data_dir"]) / "tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = tmp_dir / f"{job_id}_{filename}"
    size = 0
    with tmp_path.open("wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                out.close()
                tmp_path.unlink(missing_ok=True)
                raise HTTPException(413, detail={"en": "File too large", "ar": "الملف كبير جداً"})
            out.write(chunk)
    try:
        doc_id = importer.import_pdf(
            source_path=tmp_path,
            original_filename=file.filename or filename,
            title=title,
            author=author,
            language=language,
            copyright_owner=copyright_owner,
            user_notes=user_notes,
            job_id=job_id,
        )
        return {"document_id": doc_id, "job_id": job_id}
    except Exception as e:
        raise HTTPException(400, detail={"en": str(e), "ar": str(e)}) from e
    finally:
        tmp_path.unlink(missing_ok=True)


@router.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: str) -> JobOut:
    with connect() as conn:
        row = conn.execute("SELECT * FROM import_jobs WHERE id=?", (job_id,)).fetchone()
        if not row:
            row = conn.execute("SELECT * FROM embedding_jobs WHERE id=?", (job_id,)).fetchone()
    if not row:
        raise HTTPException(404, detail={"en": "Job not found", "ar": "المهمة غير موجودة"})
    return JobOut(
        id=row["id"],
        document_id=row["document_id"],
        status=row["status"],
        progress=float(row["progress"] or 0),
        message=row["message"],
        error=row["error"],
    )


@router.post("/jobs/{job_id}/cancel")
def cancel_job(job_id: str) -> dict:
    importer.cancel_job(job_id)
    return {"ok": True}


@router.get("/topics", response_model=list[TopicOut])
def list_topics(document_id: Optional[str] = None) -> list[TopicOut]:
    with connect() as conn:
        if document_id:
            rows = conn.execute(
                """SELECT t.*, d.title AS document_title FROM topics t
                   JOIN documents d ON d.id=t.document_id
                   WHERE t.document_id=? ORDER BY t.order_index""",
                (document_id,),
            ).fetchall()
        else:
            rows = conn.execute(
                """SELECT t.*, d.title AS document_title FROM topics t
                   JOIN documents d ON d.id=t.document_id
                   ORDER BY t.order_index LIMIT 500"""
            ).fetchall()
    return [
        TopicOut(
            id=r["id"],
            document_id=r["document_id"],
            chapter_id=r["chapter_id"],
            parent_topic_id=r["parent_topic_id"],
            title=r["title"],
            heading_path=r["heading_path"],
            summary=r["summary"],
            page_from=r["page_from"],
            page_to=r["page_to"],
            body_text=r["body_text"],
            document_title=r["document_title"],
        )
        for r in rows
    ]


@router.get("/topics/{topic_id}", response_model=TopicOut)
def get_topic(topic_id: str) -> TopicOut:
    with connect() as conn:
        r = conn.execute(
            """SELECT t.*, d.title AS document_title FROM topics t
               JOIN documents d ON d.id=t.document_id WHERE t.id=?""",
            (topic_id,),
        ).fetchone()
    if not r:
        raise HTTPException(404, detail={"en": "Topic not found", "ar": "الموضوع غير موجود"})
    return TopicOut(
        id=r["id"],
        document_id=r["document_id"],
        chapter_id=r["chapter_id"],
        parent_topic_id=r["parent_topic_id"],
        title=r["title"],
        heading_path=r["heading_path"],
        summary=r["summary"],
        page_from=r["page_from"],
        page_to=r["page_to"],
        body_text=r["body_text"],
        document_title=r["document_title"],
    )


@router.get("/topics/{topic_id}/related", response_model=list[RelatedTopic])
def related(topic_id: str) -> list[RelatedTopic]:
    return get_related_topics(topic_id)


@router.get("/toc/{document_id}", response_model=list[TocNode])
def toc(document_id: str) -> list[TocNode]:
    with connect() as conn:
        chapters = conn.execute(
            "SELECT * FROM chapters WHERE document_id=? ORDER BY order_index",
            (document_id,),
        ).fetchall()
        topics = conn.execute(
            "SELECT * FROM topics WHERE document_id=? ORDER BY order_index",
            (document_id,),
        ).fetchall()
    by_chapter: dict[str, list] = {}
    for t in topics:
        by_chapter.setdefault(t["chapter_id"], []).append(t)
    nodes: list[TocNode] = []
    for ch in chapters:
        children = [
            TocNode(id=t["id"], title=t["title"], page_from=t["page_from"], children=[])
            for t in by_chapter.get(ch["id"], [])
        ]
        nodes.append(TocNode(id=ch["id"], title=ch["title"], page_from=ch["page_from"], children=children))
    return nodes


@router.post("/evaluation/trace", response_model=SearchResponse)
def evaluation_trace(body: SearchRequest) -> SearchResponse:
    """Diagnostic retrieval trace (RRF ranks, no passage text in trace)."""
    try:
        return hybrid_search(
            body.query,
            document_id=body.document_id,
            language=body.language,
            page_from=body.page_from,
            page_to=body.page_to,
            top_k=body.top_k or 10,
            return_all=True,
            include_trace=True,
        )
    except ValueError as e:
        raise HTTPException(400, detail=str(e)) from e


@router.post("/search", response_model=SearchResponse)
def search(body: SearchRequest) -> SearchResponse:
    try:
        return hybrid_search(
            body.query,
            document_id=body.document_id,
            language=body.language,
            page_from=body.page_from,
            page_to=body.page_to,
            top_k=body.top_k,
        )
    except ValueError as e:
        raise HTTPException(400, detail=str(e)) from e


@router.post("/ask", response_model=AskResponse)
def ask_endpoint(body: AskRequest, response: Response) -> AskResponse:
    trace_id = str(uuid.uuid4())
    answer = ask(
        body.question,
        mode=body.mode,
        tone=body.tone,
        verbosity=body.verbosity,
        document_id=body.document_id,
        conversation_context=body.conversation_context,
        customer_phone=body.customer_phone or "",
    )
    answer, validation = validate_response(answer)
    answer.trace_id = trace_id
    answer.citation_validation = "passed" if validation.valid else "failed"
    response.headers["X-Trace-ID"] = trace_id
    return answer


@router.post("/learned-qa", response_model=LearnedQaEntry)
def learned_qa_upsert(body: LearnedQaRequest) -> LearnedQaEntry:
    try:
        entry = add_learned_pair(
            body.question,
            body.answer,
            taught_by=body.taught_by,
            source=body.source,
        )
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc)) from exc
    return LearnedQaEntry(
        id=str(entry.get("id") or ""),
        question=str(entry.get("question") or ""),
        answer=str(entry.get("answer") or ""),
        taught_by=str(entry.get("taught_by") or ""),
        source=str(entry.get("source") or "whatsapp"),
    )


@router.get("/learned-qa", response_model=list[LearnedQaEntry])
def learned_qa_list(limit: int = 50) -> list[LearnedQaEntry]:
    limit = max(1, min(limit, 200))
    return [
        LearnedQaEntry(
            id=str(e.get("id") or ""),
            question=str(e.get("question") or ""),
            answer=str(e.get("answer") or ""),
            taught_by=str(e.get("taught_by") or ""),
            source=str(e.get("source") or "whatsapp"),
        )
        for e in list_learned_pairs(limit=limit)
    ]


@router.post("/learned-qa/match", response_model=LearnedQaEntry)
def learned_qa_match(body: AskRequest) -> LearnedQaEntry:
    hit = find_learned_answer(body.question)
    if not hit:
        raise HTTPException(404, detail="no learned match")
    return LearnedQaEntry(
        id=str(hit.get("id") or ""),
        question=str(hit.get("question") or ""),
        answer=str(hit.get("answer") or ""),
        taught_by=str(hit.get("taught_by") or ""),
        source=str(hit.get("source") or "whatsapp"),
        match_score=float(hit.get("match_score") or 0),
    )


@router.post("/packages/export")
def export_pkg(body: PackageExportRequest) -> FileResponse:
    path = apcahelp.export_package(
        package_title=body.package_title,
        include_original_pdfs=body.include_original_pdfs,
    )
    return FileResponse(path, filename=f"{safe_filename(body.package_title, 'package')}.apcahelp")


@router.post("/packages/validate")
async def validate_pkg(file: UploadFile = File(...)) -> dict:
    settings = load_settings()
    tmp = Path(settings["_data_dir"]) / "tmp" / f"validate_{uuid.uuid4().hex}.apcahelp"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_bytes(await file.read())
    try:
        return apcahelp.validate_package(tmp)
    except Exception as e:
        raise HTTPException(400, detail=str(e)) from e
    finally:
        tmp.unlink(missing_ok=True)


@router.post("/packages/import")
async def import_pkg(file: UploadFile = File(...)) -> dict:
    settings = load_settings()
    tmp = Path(settings["_data_dir"]) / "tmp" / f"import_{uuid.uuid4().hex}.apcahelp"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_bytes(await file.read())
    try:
        return apcahelp.import_package(tmp)
    except Exception as e:
        raise HTTPException(400, detail=str(e)) from e
    finally:
        tmp.unlink(missing_ok=True)


@router.get("/settings", response_model=SettingsOut)
def get_settings() -> SettingsOut:
    data = load_settings()
    # strip internal paths for safer exposure? keep for local admin
    public = {k: v for k, v in data.items() if not k.startswith("_")}
    return SettingsOut(settings=public)


@router.put("/settings", response_model=SettingsOut)
def put_settings(body: dict) -> SettingsOut:
    # only allow known top-level config keys
    allowed = {
        "embedding",
        "search",
        "ollama",
        "answer_style",
        "ocr",
        "chunking",
        "max_upload_mb",
        "query_max_length",
    }
    updates = {k: v for k, v in body.items() if k in allowed}
    data = save_settings(updates)
    public = {k: v for k, v in data.items() if not k.startswith("_")}
    return SettingsOut(settings=public)


@router.get("/documents/{document_id}/pdf")
def open_pdf(document_id: str) -> FileResponse:
    with connect() as conn:
        row = conn.execute("SELECT pdf_path, original_filename FROM documents WHERE id=?", (document_id,)).fetchone()
    if not row:
        raise HTTPException(404, detail="Not found")
    path = Path(row["pdf_path"])
    if not path.exists():
        raise HTTPException(404, detail="PDF missing")
    return FileResponse(path, filename=row["original_filename"], media_type="application/pdf")


@router.get("/assets/company-logo")
def company_logo() -> FileResponse:
    """Return the curated company logo from the shared Belt image library."""
    logo = Path(__file__).resolve().parents[4] / "embeddings" / "img" / "image001.png"
    if not logo.is_file():
        raise HTTPException(404, detail="Company logo missing")
    return FileResponse(logo, filename="itb-company-logo.png", media_type="image/png")


@router.get("/passages/{passage_id}/image")
def passage_image(passage_id: str) -> FileResponse:
    """Render the complete source page containing a passage."""
    settings = load_settings()
    with connect() as conn:
        passage = conn.execute(
            """SELECT p.page_from, d.pdf_path
               FROM passages p JOIN documents d ON d.id=p.document_id
               WHERE p.id=?""",
            (passage_id,),
        ).fetchone()
    if not passage:
        raise HTTPException(404, detail="Passage not found")
    pdf_path = Path(passage["pdf_path"])
    if not pdf_path.exists():
        raise HTTPException(404, detail="PDF missing")

    output_dir = Path(settings["_data_dir"]) / "rendered" / "passages"
    output_dir.mkdir(parents=True, exist_ok=True)
    # Keep a versioned filename so previously cached cropped images are ignored.
    output = output_dir / f"{passage_id}-full-page.png"
    if not output.exists() or output.stat().st_mtime < pdf_path.stat().st_mtime:
        document = fitz.open(pdf_path)
        try:
            page_number = int(passage["page_from"] or 1)
            page = document.load_page(max(0, min(page_number - 1, document.page_count - 1)))
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0), clip=page.rect, alpha=False)
            pixmap.save(output)
        finally:
            document.close()
    return FileResponse(output, filename=f"passage-{passage_id}.png", media_type="image/png")


@router.get("/copyright")
def copyright_info() -> dict:
    return get_copyright_block()
