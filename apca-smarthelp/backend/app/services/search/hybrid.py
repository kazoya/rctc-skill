from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from backend.app.core.arabic import normalize_arabic_for_search
from backend.app.core.config import load_settings
from backend.app.db.database import connect
from backend.app.models.schemas import RetrievalTraceOut, SearchHit, SearchResponse
from backend.app.services.ingestion.client_aliases import expand_query_terms
from backend.app.services.search.reranker import rerank_candidates, reranker_enabled
from backend.app.services.search.rrf import ranks_from_scores, rrf_fuse
from backend.app.services.search.tracing import (
    CandidateTrace,
    RetrievalTrace,
    TraceTimer,
    new_query_id,
    set_current_trace,
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _minmax(values: list[float]) -> list[float]:
    if not values:
        return []
    lo, hi = min(values), max(values)
    if hi - lo < 1e-9:
        return [1.0 for _ in values]
    return [(v - lo) / (hi - lo) for v in values]


def _extract_phrases(query: str) -> list[str]:
    return re.findall(r'"([^"]+)"', query)


def hybrid_search(
    query: str,
    *,
    document_id: Optional[str] = None,
    language: Optional[str] = None,
    page_from: Optional[int] = None,
    page_to: Optional[int] = None,
    top_k: Optional[int] = None,
    return_all: bool = False,
    include_trace: bool = False,
) -> SearchResponse:
    settings = load_settings()
    cfg = settings["search"]
    top_k = top_k or int(cfg.get("top_k", 20))
    display_n = int(cfg.get("display_top_n", 5))
    lexical_limit = int(cfg.get("lexical_top_k", 40))
    dense_limit = int(cfg.get("dense_top_k", 40))
    timer = TraceTimer()
    trace = RetrievalTrace(
        query_id=new_query_id(),
        normalized_query="",
        retrieval_strategy="hybrid_rrf" if cfg.get("use_rrf") else "hybrid_weighted",
        reranker_enabled=reranker_enabled(),
    )
    q = (query or "").strip()
    if not q:
        return SearchResponse(
            query=q,
            action="no_match",
            results=[],
            message_ar="أدخل عبارة بحث.",
            message_en="Enter a search query.",
        )
    if len(q) > int(settings.get("query_max_length", 2000)):
        raise ValueError("Query too long / الاستعلام طويل جداً")

    norm_q = normalize_arabic_for_search(q)
    trace.normalized_query = norm_q
    phrases = _extract_phrases(q)
    search_terms = expand_query_terms(q)

    # Lexical FTS
    lexical_scores: dict[str, float] = {}
    with connect() as conn:
        for term in search_terms:
            fts_q = re.sub(r"[^\w\u0600-\u06FF\s]", " ", normalize_arabic_for_search(term))
            fts_q = " ".join(fts_q.split())
            if not fts_q:
                continue
            try:
                rows = conn.execute(
                    """
                    SELECT p.id AS passage_id, bm25(passages_fts) AS rank
                    FROM passages_fts
                    JOIN passages p ON p.id = passages_fts.passage_id
                    WHERE passages_fts MATCH ?
                    ORDER BY rank
                    LIMIT ?
                    """,
                    (fts_q, lexical_limit),
                ).fetchall()
                raw = [float(r["rank"]) for r in rows]
                inv = [-x for x in raw]
                normed = _minmax(inv)
                for r, s in zip(rows, normed):
                    lexical_scores[r["passage_id"]] = max(lexical_scores.get(r["passage_id"], 0.0), s)
            except Exception:
                pass

        like_terms = [f"%{normalize_arabic_for_search(t)}%" for t in search_terms if t.strip()]
        for like in like_terms:
            rows = conn.execute(
                """
                SELECT id AS passage_id FROM passages
                WHERE text_search_normalized LIKE ?
                   OR lower(topic_title) LIKE ?
                   OR lower(heading_path) LIKE ?
                LIMIT ?
                """,
                (like, like, like, lexical_limit),
            ).fetchall()
            for i, r in enumerate(rows):
                lexical_scores.setdefault(r["passage_id"], 0.35)
                lexical_scores[r["passage_id"]] = max(lexical_scores[r["passage_id"]], 0.5 - (i / max(len(rows), 1)) * 0.2)
    # Semantic
    semantic_scores: dict[str, float] = {}
    try:
        from backend.app.services.embeddings.service import encode_query, embedding_available
        from backend.app.services.embeddings.vector_index import get_vector_index

        if embedding_available():
            qvec = encode_query(norm_q)
            index = get_vector_index(dim=len(qvec))
            hits = index.search(qvec, top_k=dense_limit)
            sims = [s for _, s in hits]
            normed = _minmax(sims)
            for (pid, _), s in zip(hits, normed):
                semantic_scores[pid] = s
    except Exception:
        pass

    trace.lexical_candidate_count = len(lexical_scores)
    trace.dense_candidate_count = len(semantic_scores)

    use_rrf = bool(cfg.get("use_rrf", False))
    rrf_k = int(cfg.get("rrf_k", 60))
    rrf_norm: dict[str, float] = {}
    raw_rrf: dict[str, float] = {}
    lexical_ranks = ranks_from_scores(lexical_scores)
    dense_ranks = ranks_from_scores(semantic_scores)
    if use_rrf and (lexical_scores or semantic_scores):
        rank_maps: dict[str, dict[str, int]] = {}
        if lexical_scores:
            rank_maps["bm25"] = lexical_ranks
        if semantic_scores:
            rank_maps["dense"] = dense_ranks
        raw_rrf = rrf_fuse(rank_maps, k=rrf_k)
        if raw_rrf:
            peak = max(raw_rrf.values())
            if peak > 0:
                rrf_norm = {pid: score / peak for pid, score in raw_rrf.items()}
        trace.retrieval_strategy = "hybrid_rrf"

    candidate_ids = set(lexical_scores) | set(semantic_scores) | set(rrf_norm)
    trace.merged_candidate_count = len(candidate_ids)

    # Title / heading exact-ish boosts and filters
    hits: list[SearchHit] = []
    with connect() as conn:
        if not candidate_ids:
            # still try title match
            rows = conn.execute(
                """
                SELECT p.*, d.title AS document_title
                FROM passages p
                JOIN documents d ON d.id = p.document_id
                WHERE lower(p.topic_title) LIKE ? OR p.text_search_normalized LIKE ?
                LIMIT ?
                """,
                (f"%{norm_q}%", f"%{norm_q}%", top_k),
            ).fetchall()
            candidate_ids = {r["id"] for r in rows}
        else:
            rows = []
            for pid in candidate_ids:
                row = conn.execute(
                    """
                    SELECT p.*, d.title AS document_title, d.language AS doc_language
                    FROM passages p JOIN documents d ON d.id = p.document_id
                    WHERE p.id=?
                    """,
                    (pid,),
                ).fetchone()
                if row:
                    rows.append(row)

        for row in rows:
            if document_id and row["document_id"] != document_id:
                continue
            if language and (row["doc_language"] if "doc_language" in row.keys() else None) not in (None, "auto", language):
                continue
            if page_from is not None and row["page_to"] is not None and row["page_to"] < page_from:
                continue
            if page_to is not None and row["page_from"] is not None and row["page_from"] > page_to:
                continue

            title = (row["topic_title"] or "").lower()
            path = (row["heading_path"] or "").lower()
            title_boost = 0.0
            nq = norm_q.lower()
            if title == nq or path == nq:
                title_boost = 1.0
            elif nq and (nq in title or nq in path):
                title_boost = 0.7
            elif any(tok and tok in title for tok in nq.split() if len(tok) > 2):
                title_boost = 0.4

            phrase_boost = 0.0
            body = row["text_search_normalized"] or ""
            original = row["text_original"] or ""
            for ph in phrases:
                if normalize_arabic_for_search(ph) in body:
                    phrase_boost = 1.0
                    break
            # error codes / identifiers exact
            if re.search(r"[A-Za-z]{2,}[-_]?\d{2,}|[A-Z]{3,}-\d+", q):
                code = q.strip()
                if code.lower() in original.lower() or code.lower() in body:
                    phrase_boost = max(phrase_boost, 0.9)

            sem = semantic_scores.get(row["id"], 0.0)
            lex = lexical_scores.get(row["id"], 0.0)
            if use_rrf and rrf_norm:
                base = rrf_norm.get(row["id"], 0.0)
                final = (
                    base * 0.85
                    + cfg["title_weight"] * title_boost
                    + cfg["phrase_weight"] * phrase_boost
                )
            else:
                final = (
                    cfg["semantic_weight"] * sem
                    + cfg["lexical_weight"] * lex
                    + cfg["title_weight"] * title_boost
                    + cfg["phrase_weight"] * phrase_boost
                )
            # Strong exact signals must surface even when other channels are cold
            if title_boost >= 1.0:
                final = max(final, 0.85)
            elif title_boost >= 0.7:
                final = max(final, 0.74)
            if phrase_boost >= 0.9:
                final = max(final, 0.78)
            reasons = []
            if sem > 0.3:
                reasons.append("semantic")
            if lex > 0.3:
                reasons.append("lexical")
            if title_boost > 0:
                reasons.append("title/heading")
            if phrase_boost > 0:
                reasons.append("phrase/code")
            snippet = original[:240].replace("\n", " ")
            hits.append(
                SearchHit(
                    passage_id=row["id"],
                    topic_id=row["topic_id"],
                    topic_title=row["topic_title"] or "",
                    document_id=row["document_id"],
                    document_title=row["document_title"],
                    page_from=row["page_from"],
                    page_to=row["page_to"],
                    snippet=snippet,
                    final_score=round(final, 4),
                    semantic_score=round(sem, 4),
                    lexical_score=round(lex, 4),
                    title_boost=round(title_boost, 4),
                    phrase_boost=round(phrase_boost, 4),
                    explanation=", ".join(reasons) or "weak match",
                    dense_rank=dense_ranks.get(row["id"]),
                    lexical_rank=lexical_ranks.get(row["id"]),
                    rrf_score=round(raw_rrf.get(row["id"], 0.0), 6) if raw_rrf else None,
                )
            )

    # Deduplicate by topic keeping best passage
    best_by_topic: dict[str, SearchHit] = {}
    for h in sorted(hits, key=lambda x: x.final_score, reverse=True):
        if h.topic_id not in best_by_topic:
            best_by_topic[h.topic_id] = h
    ranked = sorted(best_by_topic.values(), key=lambda x: x.final_score, reverse=True)[: max(display_n, top_k)]

    rerank_cfg = settings.get("reranker", {})
    answer_top_k = int(rerank_cfg.get("answer_top_k", 5))
    ranked, rerank_ms, rerank_model = rerank_candidates(
        q,
        ranked,
        top_k=answer_top_k,
    )
    if rerank_ms is not None:
        trace.reranker_duration_ms = round(rerank_ms, 2)
        trace.reranker_model = rerank_model
        trace.retrieval_strategy = (
            trace.retrieval_strategy + "+reranker"
            if reranker_enabled()
            else trace.retrieval_strategy
        )

    trace.duration_ms = timer.elapsed_ms()
    trace.selected_top_ids = [h.passage_id for h in ranked[:answer_top_k]]
    trace.candidates = [
        CandidateTrace(
            passage_id=h.passage_id,
            document_id=h.document_id,
            page_from=h.page_from,
            page_to=h.page_to,
            dense_rank=h.dense_rank,
            lexical_rank=h.lexical_rank,
            rrf_score=float(h.rrf_score or 0.0),
            rerank_score=h.rerank_score,
            final_score=h.final_score,
        )
        for h in sorted(hits, key=lambda x: x.final_score, reverse=True)[:40]
    ]
    set_current_trace(trace)

    with connect() as conn:
        conn.execute(
            "INSERT INTO search_history (id, query, mode, result_count, created_at) VALUES (?,?,?,?,?)",
            (str(uuid.uuid4()), q, "hybrid", len(ranked), _now()),
        )

    used_reranker = any(h.rerank_score is not None for h in ranked)
    if not ranked or (not used_reranker and ranked[0].final_score < 0.15):
        response = SearchResponse(
            query=q,
            action="no_match",
            results=[],
            message_ar="لم أجد موضوعاً مطابقاً",
            message_en="No matching topic found",
        )
        if include_trace:
            response.retrieval_trace = RetrievalTraceOut(**trace.to_dict())
        return response

    if return_all:
        response = SearchResponse(query=q, action="show_results", results=ranked[:top_k])
        if include_trace:
            response.retrieval_trace = RetrievalTraceOut(**trace.to_dict())
        return response

    threshold = float(cfg["auto_open_threshold"])
    gap = float(cfg["min_first_second_gap"])
    top1 = ranked[0].final_score
    top2 = ranked[1].final_score if len(ranked) > 1 else 0.0
    if top1 >= threshold and (top1 - top2) >= gap:
        action = "auto_open"
        results = ranked[:1]
    else:
        action = "show_results"
        results = ranked[:display_n]

    response = SearchResponse(query=q, action=action, results=results)
    if include_trace:
        response.retrieval_trace = RetrievalTraceOut(**trace.to_dict())
    return response
