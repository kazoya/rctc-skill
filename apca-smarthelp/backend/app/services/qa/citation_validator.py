"""Strict validation for index-backed citations before API delivery."""

from __future__ import annotations

import re
from dataclasses import dataclass

from backend.app.db.database import connect
from backend.app.models.schemas import AskResponse, ConversationMeta


UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class ValidationResult:
    valid: bool
    reason: str = ""


def validate_indexed_reference(
    passage_id: str | None,
    page: int | None,
    document_id: str | None = None,
) -> ValidationResult:
    if not passage_id or not UUID_RE.fullmatch(passage_id):
        return ValidationResult(True)
    with connect() as conn:
        row = conn.execute(
            """SELECT p.document_id, p.page_from, p.page_to
               FROM passages p WHERE p.id=?""",
            (passage_id,),
        ).fetchone()
    if row is None:
        return ValidationResult(False, f"unknown passage UUID: {passage_id}")
    if document_id and row["document_id"] != document_id:
        return ValidationResult(False, f"document mismatch for passage: {passage_id}")
    if page is not None:
        page_from = row["page_from"]
        page_to = row["page_to"]
        if page_from is None or page_to is None or not (page_from <= page <= page_to):
            return ValidationResult(False, f"page {page} is outside passage range")
    return ValidationResult(True)


def validate_response(response: AskResponse) -> tuple[AskResponse, ValidationResult]:
    for citation in response.citations:
        result = validate_indexed_reference(citation.passage_id, citation.page, citation.document_id)
        if not result.valid:
            return _safe_fallback(response), result
    for evidence in response.evidence:
        result = validate_indexed_reference(evidence.passage_id, evidence.page_from, evidence.document_id)
        if not result.valid:
            return _safe_fallback(response), result
    if response.conversation:
        current_ids = {
            evidence.passage_id
            for evidence in response.evidence
            if UUID_RE.fullmatch(evidence.passage_id)
        }
        for verified in response.conversation.last_verified_citations:
            passage_id = verified.passage_id or ""
            if UUID_RE.fullmatch(passage_id) and passage_id not in current_ids:
                result = ValidationResult(False, f"stale verified citation: {passage_id}")
                return _safe_fallback(response), result
    return response, ValidationResult(True)


def _safe_fallback(response: AskResponse) -> AskResponse:
    previous = response.conversation
    return AskResponse(
        answer="تعذر التحقق من صفحة المصدر بدقة، لذلك لن أعرض ادعاءً غير موثق. أعد صياغة السؤال وسأبحث عن مصدر موثوق.",
        citations=[],
        evidence=[],
        ollama_used=False,
        conversation=ConversationMeta(
            status="insufficient",
            answer_type="extractive",
            intent=previous.intent if previous else "document_status",
            dialect=previous.dialect if previous else "msa",
            confidence=0.0,
            normalized_query=previous.normalized_query if previous else None,
            requested_evidence=previous.requested_evidence if previous else False,
            request_page_image=False,
            last_verified_citations=[],
        ),
    )
