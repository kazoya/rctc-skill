"""Cross-encoder reranking behind feature flags."""

from __future__ import annotations

import logging
from typing import Optional

from backend.app.core.config import load_settings
from backend.app.models.schemas import SearchHit

logger = logging.getLogger(__name__)

_MODEL = None
_MODEL_NAME: Optional[str] = None


class Reranker:
    def rerank(self, query: str, candidates: list[SearchHit], top_k: int) -> list[SearchHit]:
        raise NotImplementedError


class BgeReranker(Reranker):
    def __init__(self) -> None:
        settings = load_settings()
        cfg = settings.get("reranker", {})
        self.model_name = str(cfg.get("model", "BAAI/bge-reranker-v2-m3"))
        self.batch_size = int(cfg.get("batch_size", 4))
        self.timeout_seconds = float(cfg.get("timeout_seconds", 5))

    def _get_model(self):
        global _MODEL, _MODEL_NAME
        if _MODEL is not None and _MODEL_NAME == self.model_name:
            return _MODEL
        from sentence_transformers import CrossEncoder

        _MODEL = CrossEncoder(self.model_name, max_length=512)
        _MODEL_NAME = self.model_name
        return _MODEL

    def _rerank_inner(self, query: str, candidates: list[SearchHit], top_k: int) -> list[SearchHit]:
        model = self._get_model()
        pairs = [(query, (c.snippet or "")[:1200]) for c in candidates]
        scores = model.predict(pairs, batch_size=self.batch_size, show_progress_bar=False)
        ranked = sorted(
            zip(candidates, scores),
            key=lambda item: float(item[1]),
            reverse=True,
        )
        out: list[SearchHit] = []
        for hit, score in ranked[:top_k]:
            hit = hit.model_copy(deep=True)
            hit.rerank_score = round(float(score), 4)
            hit.final_score = round(float(score), 4)
            hit.explanation = "reranked"
            out.append(hit)
        return out

    def rerank(self, query: str, candidates: list[SearchHit], top_k: int) -> list[SearchHit]:
        if not candidates:
            return []
        from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(self._rerank_inner, query, candidates, top_k)
            try:
                return future.result(timeout=self.timeout_seconds)
            except FuturesTimeout as error:
                raise TimeoutError(
                    f"Reranker timed out after {self.timeout_seconds}s"
                ) from error


def reranker_enabled() -> bool:
    settings = load_settings()
    cfg = settings.get("reranker", {})
    return bool(cfg.get("enabled", False))


def get_reranker() -> Optional[Reranker]:
    if not reranker_enabled():
        return None
    provider = str(load_settings().get("reranker", {}).get("provider", "sentence_transformers"))
    if provider == "sentence_transformers":
        return BgeReranker()
    return None


def rerank_candidates(
    query: str,
    candidates: list[SearchHit],
    *,
    top_k: int,
) -> tuple[list[SearchHit], Optional[float], Optional[str]]:
    settings = load_settings()
    cfg = settings.get("reranker", {})
    if not cfg.get("enabled", False):
        return candidates[:top_k], None, None

    reranker = get_reranker()
    if reranker is None:
        return candidates[:top_k], None, None

    import time

    started = time.perf_counter()
    try:
        limit = int(cfg.get("candidate_count", 20))
        pool = candidates[:limit]
        ranked = reranker.rerank(query, pool, top_k=top_k)
        duration_ms = (time.perf_counter() - started) * 1000.0
        model_name = str(cfg.get("model", ""))
        return ranked, duration_ms, model_name
    except Exception as error:
        logger.warning("Reranker failed, fail_open=%s: %s", cfg.get("fail_open", True), error)
        if cfg.get("fail_open", True):
            return candidates[:top_k], None, str(cfg.get("model", ""))
        raise
