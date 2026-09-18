from __future__ import annotations

import re
import unicodedata


_ALEF_RE = re.compile(r"[إأآا]")
_YA_RE = re.compile(r"[ىيی]")  # Arabic yeh + Persian yeh (OCR/PDF)
_HA_RE = re.compile(r"[ةه]")
_TATWEEL_RE = re.compile(r"\u0640")
_DIACRITICS_RE = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]")
_WS_RE = re.compile(r"\s+")


def normalize_arabic_for_search(text: str, *, strip_diacritics: bool = True) -> str:
    """Normalize Arabic for indexing/search only. Never mutate display text."""
    if not text:
        return ""
    out = unicodedata.normalize("NFKC", text)
    out = _ALEF_RE.sub("ا", out)
    out = _YA_RE.sub("ي", out)
    out = _HA_RE.sub("ه", out)
    out = _TATWEEL_RE.sub("", out)
    if strip_diacritics:
        out = _DIACRITICS_RE.sub("", out)
    out = _WS_RE.sub(" ", out).strip().lower()
    return out


def estimate_tokens(text: str) -> int:
    # Rough multilingual estimate (~4 chars/token average).
    return max(1, len(text) // 4) if text else 0
