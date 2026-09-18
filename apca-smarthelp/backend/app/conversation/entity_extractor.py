"""Lightweight entity extraction for conversation routing."""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.app.conversation.arabic_normalizer import normalize_for_conversation
from backend.app.services.ingestion.client_aliases import detect_client_key

ROOT = Path(__file__).resolve().parents[2]
ALIASES_PATH = ROOT / "data" / "language" / "entity_aliases.json"


@lru_cache(maxsize=1)
def _load_aliases() -> dict[str, Any]:
    return json.loads(ALIASES_PATH.read_text(encoding="utf-8"))


def extract_entities(text: str) -> dict[str, Any]:
    raw = (text or "").strip()
    norm = normalize_for_conversation(raw)
    aliases = _load_aliases()
    entities: dict[str, Any] = {
        "client_key": detect_client_key(raw),
        "service_area": None,
        "year": None,
        "project_hint": None,
    }

    if _PROJECT_Q.search(raw):
        entities["project_hint"] = True

    year_match = re.search(r"(20\d{2}|19\d{2})", raw)
    if year_match:
        entities["year"] = year_match.group(1)

    for area, keywords in aliases.get("service_keywords", {}).items():
        for kw in keywords:
            if normalize_for_conversation(kw) in norm:
                entities["service_area"] = area
                break

    if not entities["client_key"]:
        for key, terms in aliases.get("clients", {}).items():
            for term in terms:
                if normalize_for_conversation(term) in norm:
                    entities["client_key"] = key
                    break

    return entities


_PROJECT_Q = re.compile(r"مشروع|project|وزارة|ministry", re.I)
