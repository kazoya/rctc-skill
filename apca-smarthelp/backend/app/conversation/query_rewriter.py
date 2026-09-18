"""Rewrite dialect/colloquial Arabic into clear MSA for retrieval."""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

from backend.app.conversation.arabic_normalizer import normalize_for_conversation, preserve_entities
from backend.app.conversation.dialect_detector import detect_dialect

ROOT = Path(__file__).resolve().parents[2]
LEXICON_PATH = ROOT / "data" / "language" / "dialect_lexicon.json"

_INTENT_REWRITES: dict[str, str] = {
    "cybersecurity_services": "ما خدمات الشركة في الامن السيبراني؟",
    "government_projects": "هل نفذت الشركة مشاريع مع وزارات او جهات حكومية؟",
    "company_services": "ما خدمات شركة حزام تقنية المعلومات؟",
    "company_foundation": "متى تأسست شركة حزام تقنية المعلومات؟",
    "company_age": "منذ كم سنة تعمل شركة حزام تقنية المعلومات في السوق؟",
    "evidence_request": "اعرض الدليل الموثق على الاجابة السابقة",
    "page_or_image_request": "اعرض صفحة المصدر الموثقة للاجابة السابقة",
}

_RETRIEVAL_FILLER_PHRASES = (
    r"لو\s+سمحت",
    r"من\s+فضلك",
    r"بعد\s+اذنك",
    r"بعد\s+إذنك",
    r"ممكن\s+تعرفني",
    r"ممكن\s+تحكيلي",
    r"ممكن\s+تقلي",
    r"ممكن\s+تقول(?:ي)?\s*لي",
)
_RETRIEVAL_FILLER_TOKENS = {
    "مرحبا",
    "هلا",
    "اهلين",
    "أهلين",
    "المعذرة",
    "المعذره",
    "عذرا",
    "عذرًا",
    "اغلبك",
    "أغلبك",
    "غلبتك",
    "بدي",
    "اريد",
    "أريد",
    "ابغى",
    "أبغى",
    "ابغا",
    "أبغا",
    "ممكن",
    "اعرف",
    "أعرف",
    "شو",
    "وش",
}
_NEGATION_TOKENS = {"لا", "مش", "مو", "ليس", "ما"}


@lru_cache(maxsize=1)
def _load_lexicon() -> dict:
    return json.loads(LEXICON_PATH.read_text(encoding="utf-8"))


def focus_retrieval_query(text: str) -> str:
    """Remove conversational request filler while preserving factual constraints."""
    raw = re.sub(r"\s+", " ", (text or "").strip())
    if not raw:
        return raw

    focused = raw
    for phrase in _RETRIEVAL_FILLER_PHRASES:
        focused = re.sub(rf"(?:^|\s)(?:{phrase})(?=\s|$)", " ", focused, flags=re.I)

    tokens = focused.split()
    kept: list[str] = []
    for index, token in enumerate(tokens):
        clean = token.strip("؟?،,.!؛:«»()[]{}")
        previous = (
            tokens[index - 1].strip("؟?،,.!؛:«»()[]{}")
            if index > 0
            else ""
        )
        # "لا أريد..." carries a real negative constraint, so retain the verb.
        if clean in _RETRIEVAL_FILLER_TOKENS and previous not in _NEGATION_TOKENS:
            continue
        kept.append(token)

    result = re.sub(r"\s+", " ", " ".join(kept)).strip()
    meaningful = re.findall(r"[A-Za-z0-9\u0600-\u06FF]+", result)
    return result if meaningful else raw


def rewrite_query(text: str, *, intent: str, dialect: str) -> str:
    raw = (text or "").strip()
    if not raw:
        return raw

    if intent in _INTENT_REWRITES:
        return _INTENT_REWRITES[intent]

    out = raw
    lexicon = _load_lexicon()
    dialect_cfg = lexicon.get(dialect) or {}
    norm = normalize_for_conversation(out)

    for phrase, replacement in dialect_cfg.get("rewrite_map", {}).items():
        p = normalize_for_conversation(phrase)
        r = replacement
        if p and p in norm:
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            out = pattern.sub(r, out)

    # Saudi/Gulf: وش -> ما in question context
    if dialect in {"saudi", "gulf"}:
        out = re.sub(r"\bوش\b", "ما", out)
        out = re.sub(r"\bتسوون\b", "تقدمون", out)

    # Iraqi: عدكم -> لديكم
    if dialect == "iraqi":
        out = re.sub(r"عدكم", "لديكم", out)
        out = re.sub(r"ويا", "مع", out)

  # Preserve entities
    entities = preserve_entities(raw)
    for term in entities.get("latin_terms", []):
        if term.lower() not in out.lower():
            out = f"{out} {term}"

    return focus_retrieval_query(re.sub(r"\s+", " ", out).strip())
