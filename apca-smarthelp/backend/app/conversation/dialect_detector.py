"""Dialect detection for Arabic conversational routing."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.app.conversation.arabic_normalizer import normalize_for_conversation

ROOT = Path(__file__).resolve().parents[2]
LEXICON_PATH = ROOT / "data" / "language" / "dialect_lexicon.json"


@lru_cache(maxsize=1)
def _load_lexicon() -> dict[str, Any]:
    return json.loads(LEXICON_PATH.read_text(encoding="utf-8"))


def detect_dialect(text: str) -> str:
    raw = (text or "").strip()
    norm = normalize_for_conversation(raw)
    if not norm:
        return "unknown"

    scores: dict[str, int] = {}
    lexicon = _load_lexicon()
    for dialect, cfg in lexicon.items():
        score = 0
        for phrase in cfg.get("greeting_phrases", []):
            if normalize_for_conversation(phrase) in norm:
                score += 3
        for marker in cfg.get("markers", []):
            m = normalize_for_conversation(marker)
            if m and m in norm:
                score += 1
        if score:
            scores[dialect] = score

    if not scores:
        if any(g in norm for g in ("السلام عليكم", "صباح الخير", "مساء الخير")):
            return "msa"
        return "msa" if raw else "unknown"

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_dialect, top_score = ranked[0]
    if len(ranked) > 1 and ranked[1][1] == top_score:
        return "levantine" if top_dialect in {"jordanian", "palestinian", "levantine"} else top_dialect
    return top_dialect


def is_dialect_greeting(text: str) -> bool:
    norm = normalize_for_conversation(text)
    lexicon = _load_lexicon()
    for cfg in lexicon.values():
        for phrase in cfg.get("greeting_phrases", []):
            p = normalize_for_conversation(phrase)
            # A greeting token inside a substantive sentence must not hijack
            # the whole message (for example: "شو بتقدموا بالتحول الرقمي؟").
            if p and norm == p:
                return True
    return False
