from backend.app.db.database import connect
from backend.app.models.schemas import AskResponse, ConversationMeta, SearchHit, VerifiedCitation
from backend.app.services.qa.citation_validator import validate_indexed_reference, validate_response
from datetime import datetime, timezone
import uuid


def test_unknown_uuid_is_rejected() -> None:
    result = validate_indexed_reference(
        "00000000-0000-4000-8000-000000000000",
        1,
    )
    assert result.valid is False
    assert "unknown passage UUID" in result.reason


def test_virtual_non_uuid_reference_is_not_treated_as_index_evidence() -> None:
    result = validate_indexed_reference("company-facts", 1)
    assert result.valid is True


def _real_passages(limit: int = 2):
    with connect() as conn:
        return conn.execute(
            """SELECT p.id, p.document_id, p.topic_id, p.topic_title, p.page_from, p.page_to,
                      p.text_original, d.title AS document_title
               FROM passages p JOIN documents d ON d.id=p.document_id
               WHERE p.page_from IS NOT NULL ORDER BY p.id LIMIT ?""",
            (limit,),
        ).fetchall()


def _seed_passages(count: int = 2) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        document_id = str(uuid.uuid4())
        conn.execute(
            """INSERT INTO documents
               (id,title,original_filename,file_hash_sha256,page_count,pdf_path,status,imported_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (document_id, "Test document", "test.pdf", str(uuid.uuid4()), 10, "test.pdf", "imported", now, now),
        )
        for index in range(count):
            topic_id = str(uuid.uuid4())
            passage_id = str(uuid.uuid4())
            page = index + 1
            conn.execute(
                """INSERT INTO topics
                   (id,document_id,title,page_from,page_to,order_index)
                   VALUES (?,?,?,?,?,?)""",
                (topic_id, document_id, f"Topic {index}", page, page, index),
            )
            conn.execute(
                """INSERT INTO passages
                   (id,document_id,topic_id,topic_title,text_original,text_search_normalized,page_from,page_to)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (passage_id, document_id, topic_id, f"Topic {index}", f"Evidence {index}", f"evidence {index}", page, page),
            )


def test_real_uuid_with_wrong_document_is_rejected() -> None:
    _seed_passages(1)
    row = _real_passages(1)[0]
    result = validate_indexed_reference(row["id"], row["page_from"], "wrong-document")
    assert result.valid is False
    assert "document mismatch" in result.reason


def test_real_uuid_with_page_outside_range_is_rejected() -> None:
    _seed_passages(1)
    row = _real_passages(1)[0]
    result = validate_indexed_reference(row["id"], int(row["page_to"]) + 100, row["document_id"])
    assert result.valid is False
    assert "outside passage range" in result.reason


def test_stale_verified_citation_is_rejected() -> None:
    _seed_passages(2)
    current, stale = _real_passages(2)
    evidence = SearchHit(
        passage_id=current["id"],
        topic_id=current["topic_id"],
        topic_title=current["topic_title"] or "",
        document_id=current["document_id"],
        document_title=current["document_title"],
        page_from=current["page_from"],
        page_to=current["page_to"],
        snippet=current["text_original"][:100],
        final_score=1.0,
        explanation="test",
    )
    response = AskResponse(
        answer="test",
        citations=[],
        evidence=[evidence],
        ollama_used=False,
        conversation=ConversationMeta(
            last_verified_citations=[
                VerifiedCitation(
                    document_id=stale["document_id"],
                    document_title=stale["document_title"],
                    page=stale["page_from"],
                    passage_id=stale["id"],
                )
            ]
        ),
    )
    safe, result = validate_response(response)
    assert result.valid is False
    assert "stale verified citation" in result.reason
    assert safe.evidence == []
