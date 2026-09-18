"""OpenAI GPT-4o grounded answers (preferred over local Ollama for investor demos)."""

from __future__ import annotations

import os
import re
from typing import Optional

import httpx

from backend.app.core.config import load_settings
from backend.app.models.schemas import SearchHit
from backend.app.services.qa.knowledge_context import get_master_context

INSUFFICIENT_EN = "I could not find enough information to answer this question."
INSUFFICIENT_AR = "لم أجد إجابة كافية عن هذا السؤال."

_INSUFFICIENT_RE = re.compile(
    r"لم أجد|could not find|insufficient|لا معلومات|no information",
    re.I,
)


def _sanitize_customer_answer(text: str) -> str:
    out = (text or "").strip()
    out = re.sub(r"^\s*based on the (?:imported )?documents\s*:?\s*", "", out, flags=re.I)
    out = re.sub(r"^\s*بناءً?\s*على\s*المستندات[^:]*:?\s*", "", out, flags=re.I)
    return out.strip()


def openai_available() -> bool:
    settings = load_settings()
    cfg = settings.get("openai", {})
    if not cfg.get("enabled", False):
        return False
    return bool(os.environ.get("OPENAI_API_KEY", "").strip())


def _call_openai(system: str, user: str) -> str:
    settings = load_settings()
    cfg = settings.get("openai", {})
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    model = str(cfg.get("model", "gpt-4o"))
    timeout = float(cfg.get("timeout_seconds", 60))
    payload = {
        "model": model,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    with httpx.Client(timeout=timeout) as client:
        r = client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
    return str(data["choices"][0]["message"]["content"] or "").strip()


def _grounded_system_prompt(*, lang_ar: bool, verbosity: str) -> str:
    length = (
        "1-3 short WhatsApp-friendly sentences"
        if verbosity == "short"
        else "2-4 short paragraphs or up to 5 bullet points"
    )
    language = "Arabic" if lang_ar else "English"
    insufficient = INSUFFICIENT_AR if lang_ar else INSUFFICIENT_EN
    return f"""You are the official ITB (Information Belt / حزام تقنية المعلومات) assistant.

RULES:
- Answer ONLY from the provided reference passages and master knowledge.
- Never invent facts, numbers, clients, or certifications.
- If evidence is insufficient, reply exactly: {insufficient}
- Do not mention documents, embeddings, sources, citations, or page numbers.
- Reply in {language}.
- Length: {length}.
- Be direct; do not repeat the question."""


def _format_evidence_block(evidence: list[SearchHit], *, limit: int = 5) -> str:
    lines = []
    for i, hit in enumerate(evidence[:limit], 1):
        lines.append(
            f"[{i}] {hit.document_title} | {hit.topic_title} | p.{hit.page_from}-{hit.page_to}\n{hit.snippet}"
        )
    return "\n\n".join(lines)


def try_openai_grounded_answer(
    question: str,
    evidence: list[SearchHit],
    *,
    verbosity: str,
    tone: str,
) -> Optional[tuple[str, list[SearchHit]]]:
    if not openai_available() or not evidence:
        return None
    lang_ar = bool(re.search(r"[\u0600-\u06FF]", question))
    system = _grounded_system_prompt(lang_ar=lang_ar, verbosity=verbosity)
    user = f"QUESTION:\n{question}\n\nREFERENCE PASSAGES:\n{_format_evidence_block(evidence)}"
    try:
        answer = _sanitize_customer_answer(_call_openai(system, user))
    except Exception:
        return None
    if not answer or _INSUFFICIENT_RE.search(answer):
        return None
    for hit in evidence:
        hit.explanation = "openai_grounded"
    return answer, evidence[:5]


def try_openai_universal_answer(
    question: str,
    evidence: list[SearchHit],
    *,
    verbosity: str,
) -> Optional[tuple[str, list[SearchHit]]]:
    if not openai_available():
        return None
    settings = load_settings()
    max_chars = int(settings.get("openai", {}).get("master_context_max_chars", 12000))
    lang_ar = bool(re.search(r"[\u0600-\u06FF]", question))
    system = _grounded_system_prompt(lang_ar=lang_ar, verbosity=verbosity)
    master = get_master_context()[:max_chars]
    search_block = _format_evidence_block(evidence, limit=6) if evidence else "(no close search hits)"
    user = (
        f"QUESTION:\n{question}\n\nMASTER KNOWLEDGE:\n{master}\n\nSEARCH HITS:\n{search_block}"
    )
    try:
        answer = _sanitize_customer_answer(_call_openai(system, user))
    except Exception:
        return None
    if not answer or _INSUFFICIENT_RE.search(answer):
        return None
    out_evidence = evidence[:5] if evidence else []
    for hit in out_evidence:
        hit.explanation = "openai_grounded"
    return answer, out_evidence
