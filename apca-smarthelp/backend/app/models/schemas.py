from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class DocumentOut(BaseModel):
    id: str
    title: str
    original_filename: str
    author: Optional[str] = None
    language: Optional[str] = None
    page_count: int
    copyright_owner: Optional[str] = None
    user_notes: Optional[str] = None
    status: str
    imported_at: str
    file_hash_sha256: str


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None
    copyright_owner: Optional[str] = None
    user_notes: Optional[str] = None


class TopicOut(BaseModel):
    id: str
    document_id: str
    chapter_id: Optional[str] = None
    parent_topic_id: Optional[str] = None
    title: str
    heading_path: Optional[str] = None
    summary: Optional[str] = None
    page_from: Optional[int] = None
    page_to: Optional[int] = None
    body_text: Optional[str] = None
    document_title: Optional[str] = None


class TocNode(BaseModel):
    id: str
    title: str
    page_from: Optional[int] = None
    children: list["TocNode"] = Field(default_factory=list)


class SearchRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    language: Optional[str] = None
    page_from: Optional[int] = None
    page_to: Optional[int] = None
    top_k: Optional[int] = None


class SearchHit(BaseModel):
    passage_id: str
    topic_id: str
    topic_title: str
    document_id: str
    document_title: str
    page_from: Optional[int] = None
    page_to: Optional[int] = None
    snippet: str
    final_score: float
    semantic_score: float = 0.0
    lexical_score: float = 0.0
    title_boost: float = 0.0
    phrase_boost: float = 0.0
    explanation: str
    dense_rank: Optional[int] = None
    lexical_rank: Optional[int] = None
    title_rank: Optional[int] = None
    rrf_score: Optional[float] = None
    rerank_score: Optional[float] = None


class RetrievalTraceOut(BaseModel):
    query_id: str
    normalized_query: str
    lexical_candidate_count: int
    dense_candidate_count: int
    merged_candidate_count: int
    retrieval_strategy: str
    duration_ms: float
    reranker_enabled: bool = False
    reranker_model: Optional[str] = None
    reranker_duration_ms: Optional[float] = None
    selected_top_ids: list[str] = Field(default_factory=list)
    candidates: list[dict[str, Any]] = Field(default_factory=list)


class SearchResponse(BaseModel):
    query: str
    action: Literal["auto_open", "show_results", "no_match"]
    results: list[SearchHit]
    message_ar: Optional[str] = None
    message_en: Optional[str] = None
    retrieval_trace: Optional[RetrievalTraceOut] = None


class AskRequest(BaseModel):
    question: str
    mode: Literal["ask", "write_topic"] = "ask"
    tone: Literal["formal", "casual"] = "formal"
    verbosity: Literal["short", "detailed"] = "detailed"
    document_id: Optional[str] = None
    conversation_context: Optional[dict[str, Any]] = None
    customer_phone: Optional[str] = None


class Citation(BaseModel):
    document_title: str
    page: Optional[int] = None
    topic_id: Optional[str] = None
    passage_id: Optional[str] = None
    document_id: Optional[str] = None


class VerifiedCitation(BaseModel):
    document_id: str
    document_title: str
    page: Optional[int] = None
    passage_id: Optional[str] = None
    supporting_quote: Optional[str] = None


class ConversationMeta(BaseModel):
    status: Literal["answered", "ambiguous", "insufficient", "out_of_scope"] = "answered"
    answer_type: Literal[
        "explicit_fact",
        "normalized_fact",
        "calculated",
        "supported_inference",
        "extractive",
        "generated",
    ] = "extractive"
    intent: str = "document_status"
    dialect: str = "msa"
    confidence: float = 0.0
    normalized_query: Optional[str] = None
    requested_evidence: bool = False
    request_page_image: bool = False
    best_source_page: Optional[int] = None
    derivation_summary: Optional[str] = None
    answer_id: Optional[str] = None
    last_verified_citations: list[VerifiedCitation] = Field(default_factory=list)


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]
    evidence: list[SearchHit]
    ollama_used: bool
    conversation: Optional[ConversationMeta] = None
    trace_id: Optional[str] = None
    citation_validation: Literal["passed", "failed", "not_applicable"] = "not_applicable"


class LearnedQaRequest(BaseModel):
    question: str
    answer: str
    taught_by: str = ""
    source: str = "whatsapp"


class LearnedQaEntry(BaseModel):
    id: str
    question: str
    answer: str
    taught_by: str = ""
    source: str = "whatsapp"
    match_score: Optional[float] = None


class RelatedTopic(BaseModel):
    id: str
    title: str
    reason: str
    page_from: Optional[int] = None


class PackageExportRequest(BaseModel):
    package_title: str = "APCA Knowledge Package"
    include_original_pdfs: bool = False


class JobOut(BaseModel):
    id: str
    document_id: Optional[str] = None
    status: str
    progress: float
    message: Optional[str] = None
    error: Optional[str] = None


class SettingsOut(BaseModel):
    settings: dict[str, Any]


class HealthOut(BaseModel):
    status: str
    app: str
    version: str
    embedding_available: bool
    ollama_reachable: bool
    copyright: str
