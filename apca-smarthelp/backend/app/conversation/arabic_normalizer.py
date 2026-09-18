"""Conversation-layer Arabic normalization (preserves original for display)."""

from __future__ import annotations

import re
import unicodedata

from backend.app.core.arabic import normalize_arabic_for_search

_LATIN_WORD = re.compile(r"[A-Za-z][A-Za-z0-9._+-]*")
_DIGITS = re.compile(r"\d+")


def detect_language(text: str) -> str:
    raw = (text or "").strip()
    if not raw:
        return "ar"
    ar = len(re.findall(r"[\u0600-\u06FF]", raw))
    en = len(re.findall(r"[A-Za-z]", raw))
    if ar and en:
        return "mixed"
    if en and ar == 0:
        return "en"
    return "ar"


def normalize_for_conversation(text: str) -> str:
    """Search-normalized form for matching; not for user-visible output."""
    return normalize_arabic_for_search(text)


def strip_punctuation_edges(text: str) -> str:
    return re.sub(r"^[\s؟?!.,،:;]+|[\s؟?!.,،:;]+$", "", (text or "").strip())


def tokenize_meaningful(text: str) -> list[str]:
    norm = normalize_for_conversation(text)
    tokens = re.findall(r"[\u0600-\u06FFa-zA-Z0-9]{2,}", norm)
    stop = {
        "ما", "من", "في", "على", "عن", "هل", "هي", "هو", "ان", "the", "and", "you",
        "your", "what", "how", "do", "is", "are", "can", "u",
    }
    return [t for t in tokens if t not in stop]


def preserve_entities(text: str) -> dict[str, list[str]]:
    """Extract names, acronyms, numbers to keep during rewrite."""
    raw = text or ""
    return {
        "latin_terms": _LATIN_WORD.findall(raw),
        "numbers": _DIGITS.findall(raw),
        "acronyms": re.findall(r"\b[A-Z]{2,}\b", raw),
    }


def nfkc(text: str) -> str:
    return unicodedata.normalize("NFKC", text or "")
