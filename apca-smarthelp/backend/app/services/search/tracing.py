"""Structured retrieval tracing for RAG diagnostics."""

from __future__ import annotations

import time
import uuid
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import Any, Optional


_current_trace: ContextVar[Optional["RetrievalTrace"]] = ContextVar("retrieval_trace", default=None)


@dataclass
class CandidateTrace:
    passage_id: str
    document_id: str
    page_from: Optional[int]
    page_to: Optional[int]
    dense_rank: Optional[int] = None
    lexical_rank: Optional[int] = None
    title_rank: Optional[int] = None
    rrf_score: float = 0.0
    rerank_score: Optional[float] = None
    final_score: float = 0.0


@dataclass
class RetrievalTrace:
    query_id: str
    normalized_query: str
    lexical_candidate_count: int = 0
    dense_candidate_count: int = 0
    merged_candidate_count: int = 0
    retrieval_strategy: str = "hybrid_weighted"
    duration_ms: float = 0.0
    reranker_enabled: bool = False
    reranker_model: Optional[str] = None
    reranker_duration_ms: Optional[float] = None
    candidates: list[CandidateTrace] = field(default_factory=list)
    selected_top_ids: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "query_id": self.query_id,
            "normalized_query": self.normalized_query,
            "lexical_candidate_count": self.lexical_candidate_count,
            "dense_candidate_count": self.dense_candidate_count,
            "merged_candidate_count": self.merged_candidate_count,
            "retrieval_strategy": self.retrieval_strategy,
            "duration_ms": round(self.duration_ms, 2),
            "reranker_enabled": self.reranker_enabled,
            "reranker_model": self.reranker_model,
            "reranker_duration_ms": self.reranker_duration_ms,
            "selected_top_ids": self.selected_top_ids,
            "candidates": [
                {
                    "passage_id": c.passage_id,
                    "document_id": c.document_id,
                    "page_from": c.page_from,
                    "page_to": c.page_to,
                    "dense_rank": c.dense_rank,
                    "lexical_rank": c.lexical_rank,
                    "title_rank": c.title_rank,
                    "rrf_score": round(c.rrf_score, 6),
                    "rerank_score": c.rerank_score,
                    "final_score": round(c.final_score, 4),
                }
                for c in self.candidates
            ],
        }


def get_current_trace() -> Optional[RetrievalTrace]:
    return _current_trace.get()


def set_current_trace(trace: Optional[RetrievalTrace]) -> None:
    _current_trace.set(trace)


class TraceTimer:
    def __init__(self) -> None:
        self._start = time.perf_counter()

    def elapsed_ms(self) -> float:
        return (time.perf_counter() - self._start) * 1000.0


def new_query_id() -> str:
    return str(uuid.uuid4())
