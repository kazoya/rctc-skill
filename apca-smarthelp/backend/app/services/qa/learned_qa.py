"""Community-taught Q&A pairs (e.g. expert reviewers via WhatsApp)."""

from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from backend.app.core.arabic import normalize_arabic_for_search
from backend.app.models.schemas import SearchHit
from backend.app.services.qa.knowledge_context import data_dir

_STORE_NAME = "learned_qa.json"
_TEACH_ANSWER_RE = re.compile(
    r"^(?:الجواب|جواب|answer)\s*[:：]\s*(.+)$",
    re.I | re.S,
)
_TEACH_QUESTION_RE = re.compile(
    r"^(?:السؤال|سؤال|question)\s*[:：]\s*(.+)$",
    re.I | re.S,
)
_INSUFFICIENT_MARKERS = (
    "لم أجد إجابة",
    "could not find enough information",
)


def _store_path() -> Path:
    return data_dir() / _STORE_NAME


def _load_store() -> dict[str, Any]:
    path = _store_path()
    if not path.is_file():
        return {"version": 1, "entries": []}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("entries"), list):
            return data
    except Exception:
        pass
    return {"version": 1, "entries": []}


def _save_store(data: dict[str, Any]) -> None:
    path = _store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def normalize_question(text: str) -> str:
    plain = (text or "").strip()
    plain = re.sub(r"\s+", " ", plain)
    return normalize_arabic_for_search(plain)


def parse_teaching_message(text: str) -> Optional[dict[str, str]]:
    """Parse WhatsApp teaching payloads. Returns {question?, answer}."""
    raw = (text or "").strip()
    if not raw:
        return None

    question = ""
    answer = ""
    for line in re.split(r"\r?\n", raw):
        line = line.strip()
        if not line:
            continue
        qm = _TEACH_QUESTION_RE.match(line)
        if qm:
            question = qm.group(1).strip()
            continue
        am = _TEACH_ANSWER_RE.match(line)
        if am:
            answer = am.group(1).strip()

    if not answer and _TEACH_ANSWER_RE.match(raw):
        answer = _TEACH_ANSWER_RE.match(raw).group(1).strip()

    if not answer:
        return None
    out: dict[str, str] = {"answer": answer}
    if question:
        out["question"] = question
    return out


def add_learned_pair(
    question: str,
    answer: str,
    *,
    taught_by: str = "",
    source: str = "whatsapp",
) -> dict[str, Any]:
    q = question.strip()
    a = answer.strip()
    if not q or not a:
        raise ValueError("question and answer are required")
    if any(m in a for m in _INSUFFICIENT_MARKERS):
        raise ValueError("cannot teach an insufficient-answer placeholder")

    norm = normalize_question(q)
    store = _load_store()
    entries: list[dict[str, Any]] = store.setdefault("entries", [])
    for entry in entries:
        if entry.get("question_normalized") == norm:
            entry["answer"] = a
            entry["taught_by"] = taught_by or entry.get("taught_by", "")
            entry["source"] = source
            entry["updated_at"] = datetime.now(timezone.utc).isoformat()
            _save_store(store)
            return entry

    entry = {
        "id": str(uuid.uuid4()),
        "question": q,
        "question_normalized": norm,
        "answer": a,
        "taught_by": taught_by,
        "source": source,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    entries.append(entry)
    _save_store(store)
    return entry


def list_learned_pairs(*, limit: int = 100) -> list[dict[str, Any]]:
    store = _load_store()
    entries = list(store.get("entries") or [])
    return entries[-limit:]


def _token_set(text: str) -> set[str]:
    tokens = re.findall(r"[\u0600-\u06FF]{3,}|[a-zA-Z]{3,}", normalize_question(text))
    return {t for t in tokens if t not in {"ما", "هل", "من", "the", "what", "how", "about"}}


def _similarity(a: str, b: str) -> float:
    ta, tb = _token_set(a), _token_set(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def find_learned_answer(question: str, *, min_score: float = 0.55) -> Optional[dict[str, Any]]:
    q = (question or "").strip()
    if not q:
        return None
    norm = normalize_question(q)
    store = _load_store()
    best: Optional[dict[str, Any]] = None
    best_score = 0.0

    for entry in store.get("entries") or []:
        stored_norm = str(entry.get("question_normalized") or "")
        stored_q = str(entry.get("question") or "")
        if not stored_norm:
            continue
        if norm == stored_norm:
            score = 1.0
        elif stored_norm in norm or norm in stored_norm:
            score = 0.92
        else:
            score = _similarity(q, stored_q)
        if score > best_score:
            best_score = score
            best = entry

    if best is None or best_score < min_score:
        return None
    return {**best, "match_score": round(best_score, 3)}


def learned_evidence_hit(answer: str, entry_id: str = "") -> SearchHit:
    return SearchHit(
        passage_id=f"learned-{entry_id or 'qa'}",
        topic_id="learned-qa",
        topic_title="إجابة معتمدة",
        document_id="learned-qa",
        document_title="Learned Q&A",
        page_from=1,
        page_to=1,
        snippet=answer[:320],
        final_score=0.98,
        lexical_score=0.95,
        explanation="learned_qa",
    )


def try_learned_answer(question: str, *, verbosity: str = "short") -> Optional[tuple[str, list[SearchHit]]]:
    hit = find_learned_answer(question)
    if not hit:
        return None
    answer = str(hit.get("answer") or "").strip()
    if not answer:
        return None
    if verbosity == "short" and len(answer) > 420:
        answer = answer[:417].rstrip() + "…"
    return answer, [learned_evidence_hit(answer, str(hit.get("id") or ""))]
