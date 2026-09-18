"""Semantic Topic Card matching."""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Optional

from backend.app.conversation.arabic_normalizer import normalize_for_conversation, tokenize_meaningful

ROOT = Path(__file__).resolve().parents[2]
CARDS_PATH = ROOT / "data" / "topics" / "topic_cards.json"


@dataclass
class TopicCardMatch:
    card_id: str
    intent: str
    answer_strategy: str
    score: float
    card: dict


@lru_cache(maxsize=1)
def load_topic_cards() -> list[dict]:
    if not CARDS_PATH.exists():
        return []
    return json.loads(CARDS_PATH.read_text(encoding="utf-8"))


def _similarity(a: str, b: str) -> float:
    ta = set(tokenize_meaningful(a))
    tb = set(tokenize_meaningful(b))
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    union = len(ta | tb)
    jaccard = inter / max(1, union)
    na = normalize_for_conversation(a)
    nb = normalize_for_conversation(b)
    if na in nb or nb in na:
        return max(jaccard, 0.85)
    return jaccard


def match_topic_card(text: str) -> Optional[TopicCardMatch]:
    norm = normalize_for_conversation(text)
    best: Optional[TopicCardMatch] = None
    for card in load_topic_cards():
        if not card.get("approved", True):
            continue
        candidates = [card.get("canonical_question", "")] + list(card.get("variants", []))
        score = max(_similarity(norm, c) for c in candidates if c)
        if best is None or score > best.score:
            best = TopicCardMatch(
                card_id=str(card.get("id", "")),
                intent=str(card.get("intent", "")),
                answer_strategy=str(card.get("answer_strategy", "retrieval")),
                score=score,
                card=card,
            )
    if best and best.score >= 0.45:
        return best
    return None
