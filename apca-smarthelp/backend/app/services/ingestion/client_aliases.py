from __future__ import annotations

import re
from typing import Iterable

# Canonical client keys -> searchable aliases (Arabic + English + OCR variants)
CLIENT_ALIASES: dict[str, list[str]] = {
    "sdaia": [
        "سدايا",
        "سديا",
        "لسدايا",
        "لسديا",
        "sdaia",
        "SDAIA",
        "Sadaia",
        "الهيئة السعودية للبيانات والذكاء الاصطناعي",
        "Saudi Data & AI Authority",
        "Saudi Data & Al Authority",
        "Saudi Data and AI Authority",
    ],
    "sec": [
        "كهرباء",
        "الكهرباء",
        "الشركة السعودية للكهرباء",
        "Saudi Electricity Company",
        "Saudi Electricity",
        "SEC",
    ],
    "nca": [
        "الهيئة الوطنية للأمن السيبراني",
        "الوطنية للأمن السيبراني",
        "للهيئة الوطنية للأمن السيبراني",
        "الأمن السيبراني",
        "National Cybersecurity Authority",
        "NCA",
    ],
    "moj": [
        "وزارة العدل",
        "Ministry of Justice",
    ],
    "tourism": [
        "وزارة السياحة",
        "وزاره السياحة",
        "وزارة السياحه",
        "السياحة",
        "السیاحة",
        "السياحه",
        "Ministry of Tourism",
        "Saudi Tourism Authority",
    ],
}

_CLIENT_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (key, re.compile("|".join(re.escape(a) for a in aliases), re.IGNORECASE))
    for key, aliases in CLIENT_ALIASES.items()
]

DISPLAY_NAMES: dict[str, tuple[str, str]] = {
    "sdaia": ("سدايا", "SDAIA — الهيئة السعودية للبيانات والذكاء الاصطناعي"),
    "sec": ("الشركة السعودية للكهرباء", "Saudi Electricity Company"),
    "nca": ("الهيئة الوطنية للأمن السيبراني", "National Cybersecurity Authority"),
    "moj": ("وزارة العدل", "Ministry of Justice"),
    "tourism": ("وزارة السياحة", "Ministry of Tourism"),
}


from backend.app.core.arabic import normalize_arabic_for_search


def detect_client_key(text: str) -> str | None:
    norm = normalize_arabic_for_search(text)
    blob = (text or "").lower()
    for key, aliases in CLIENT_ALIASES.items():
        for alias in aliases:
            alias_norm = normalize_arabic_for_search(alias)
            if alias_norm and alias_norm in norm:
                return key
            if alias.lower() in blob:
                return key
    return None


def aliases_for_text(text: str) -> list[str]:
    key = detect_client_key(text)
    if not key:
        return []
    return list(CLIENT_ALIASES[key])


def expand_query_terms(query: str) -> list[str]:
    terms = [query.strip()]
    blob = query or ""
    for key, aliases in CLIENT_ALIASES.items():
        if any(alias.lower() in blob.lower() for alias in aliases):
            terms.extend(aliases)
    # dedupe preserving order
    seen: set[str] = set()
    out: list[str] = []
    for t in terms:
        k = t.lower()
        if k in seen:
            continue
        seen.add(k)
        out.append(t)
    return out


def count_client_mentions(text: str, client_key: str) -> int:
    aliases = CLIENT_ALIASES.get(client_key, [])
    if not text:
        return 0
  # Count distinct project slots: lines that are primarily the client name/logo
    count = 0
    for alias in aliases:
        count += len(re.findall(re.escape(alias), text, flags=re.IGNORECASE))
    # de-dup overlapping OCR noise: prefer canonical short tokens
    short = [a for a in aliases if len(a) <= 8]
    if short:
        return max(count, sum(len(re.findall(re.escape(a), text, flags=re.IGNORECASE)) for a in short))
    return count
