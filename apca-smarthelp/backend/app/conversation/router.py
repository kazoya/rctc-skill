"""Layered conversation intent router."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from backend.app.conversation.arabic_normalizer import (
    detect_language,
    normalize_for_conversation,
    strip_punctuation_edges,
    tokenize_meaningful,
)
from backend.app.conversation.dialect_detector import detect_dialect, is_dialect_greeting
from backend.app.conversation.entity_extractor import extract_entities
from backend.app.conversation.query_rewriter import rewrite_query
from backend.app.conversation.topic_cards import match_topic_card

ROOT = Path(__file__).resolve().parents[2]
INTENT_EXAMPLES = ROOT / "data" / "language" / "intent_examples.jsonl"

_GREETING_RE = re.compile(
    r"^(?:السلام\s+عليكم|مرحبا|مرحباً|أهلا|اهلا|هلا|صباح\s+الخير|مساء\s+الخير|"
    r"hello|hi|good\s+morning|good\s+evening)[\s!.،؟?]*$",
    re.I,
)
_SOCIAL_RE = re.compile(
    r"كيف\s+حال|كيفك|كيفكم|شلونك|شلونكم|شاكو\s+ماكو|شو\s+في\s+ما\s+في|"
    r"شخبار|وش\s+الاخبار|how\s+are\s+you|how\s+r\s+u",
    re.I,
)
_THANKS_RE = re.compile(r"^(?:شكرا|شكراً|مشكور|thanks|thank\s+you|يعطيك\s+العافية)[\s!.،]*$", re.I)
_FAREWELL_RE = re.compile(r"^(?:مع\s+السلامة|باي|bye|goodbye|see\s+you)[\s!.،]*$", re.I)
_EVIDENCE_RE = re.compile(
    r"وين\s+الدليل|هات\s+الدليل|من\s+وين\s+جبت|ورني\s+المصدر|ارسل\s+المصدر|"
    r"show\s+evidence|source\s+please|proof",
    re.I,
)
_PAGE_RE = re.compile(
    r"هات\s+الصورة|ورني\s+الصفحة|صفحة\s+pdf|^(?:صورة|الصورة)$|send\s+page|show\s+page",
    re.I,
)
_OUT_OF_SCOPE_RE = re.compile(
    r"زيت\s+السيارة|change\s+car\s+oil|طبخ|cook\s+recipe|weather\s+today|"
    r"football\s+score|bitcoin|crypto\s+price|الطقس|كرة\s+القدم",
    re.I,
)
_FOUNDATION_RE = re.compile(
    r"متى\s*تأسس|متى\s*تأسست|سنة\s*التأسيس|منذ\s*متى|when\s+(?:was\s+)?(?:itb\s+)?founded|founding\s+year",
    re.I,
)
_AGE_RE = re.compile(
    r"صارلهم\s+كم\s+سنة|كم\s+سنة\s+بالسوق|من\s+كم\s+سنة|how\s+old\s+is|years?\s+in\s+market|"
    r"how\s+many\s+years",
    re.I,
)
_INFERENCE_RE = re.compile(
    r"هل\s+خبرتهم|تعتبر\s+خبرتهم|خبرة\s+قوية|خبرة\s+طويلة|experience\s+strong|strong\s+experience",
    re.I,
)
_CYBER_RE = re.compile(
    r"الامن\s+السيبراني|سيبراني|سايبر|cyber\s*security|cybersecurity|soc|siem",
    re.I,
)
_DIGITAL_TRANSFORMATION_RE = re.compile(
    r"التحول\s+الرقمي|تحول\s+رقمي|رقمنه|رقمنة|digital\s+transformation|digitization",
    re.I,
)
_ERP_RE = re.compile(
    r"\berp\b|تخطيط\s+موارد\s+(?:المؤسسات|المنشات|المنشآت)|موارد\s+مؤسسيه|موارد\s+مؤسسية",
    re.I,
)
_GOV_RE = re.compile(
    r"(?:ال)?مشاريع(?:كم|نا|هم)?\s+(?:ال)?حكومي(?:ة|ه)|"
    r"مشاريع\s+مع\s+(?:جهات|الجهات)\s+(?:ال)?حكومي(?:ة|ه)|"
    r"عدكم\s+شغل|عدكم\s+مشاريع|ويا\s+الحكومة|وزارات|"
    r"government\s+projects|ministr",
    re.I,
)
_SERVICES_RE = re.compile(
    r"خدمات|ماذا\s+تقدم|what\s+services|services\s+do\s+you|what\s+do\s+you\s+provide",
    re.I,
)
_COMPANY_OVERVIEW_RE = re.compile(
    r"ماذا\s+تعرف|من\s+هي|what\s+is\s+itb|tell\s+me\s+about|عرفني\s+عن",
    re.I,
)


@dataclass
class RouteResult:
    intent: str
    confidence: float
    language: str
    dialect: str
    entities: dict[str, Any] = field(default_factory=dict)
    requires_retrieval: bool = False
    requires_reasoning: bool = False
    requires_generation: bool = False
    requested_evidence: bool = False
    normalized_query: str = ""
    topic_card_id: Optional[str] = None
    answer_strategy: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "intent": self.intent,
            "confidence": round(self.confidence, 4),
            "language": self.language,
            "dialect": self.dialect,
            "entities": self.entities,
            "requires_retrieval": self.requires_retrieval,
            "requires_reasoning": self.requires_reasoning,
            "requires_generation": self.requires_generation,
            "requested_evidence": self.requested_evidence,
            "normalized_query": self.normalized_query,
            "topic_card_id": self.topic_card_id,
            "answer_strategy": self.answer_strategy,
        }


@lru_cache(maxsize=1)
def _load_intent_examples() -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    if not INTENT_EXAMPLES.exists():
        return out
    for line in INTENT_EXAMPLES.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        item = json.loads(line)
        out[item["intent"]] = [normalize_for_conversation(x) for x in item.get("examples", [])]
    return out


def _semantic_intent_score(norm: str, intent: str) -> float:
    examples = _load_intent_examples().get(intent, [])
    if not examples:
        return 0.0
    tokens = set(tokenize_meaningful(norm))
    if not tokens:
        return 0.0
    best = 0.0
    for ex in examples:
        ex_tokens = set(tokenize_meaningful(ex))
        if not ex_tokens:
            continue
        overlap = len(tokens & ex_tokens) / max(1, len(ex_tokens))
        if ex in norm or norm in ex:
            overlap = max(overlap, 0.92)
        best = max(best, overlap)
    return best


def route_message(text: str, *, context: Optional[dict[str, Any]] = None) -> RouteResult:
    raw = strip_punctuation_edges(text)
    norm = normalize_for_conversation(raw)
    language = detect_language(raw)
    dialect = detect_dialect(raw)
    entities = extract_entities(raw)
    ctx = context or {}
    pure_social = (
        _GREETING_RE.fullmatch(raw) is not None
        or _SOCIAL_RE.fullmatch(raw) is not None
        or is_dialect_greeting(raw)
    )

    # Layer 1: deterministic high-confidence patterns
    if _GREETING_RE.match(raw) or norm in {"السلام عليكم", "مرحبا", "اهلا", "هلا"}:
        return _result("greeting", 0.98, language, dialect, entities, raw, norm)

    # Explicit business subjects outrank dialect/social phrases embedded in a
    # longer question, e.g. "شو عندك معلومات عن ERP".
    if entities.get("client_key") and entities.get("project_hint"):
        return _result(
            "project_lookup",
            0.97,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=True,
        )

    if _ERP_RE.search(raw):
        return _result(
            "erp_services",
            0.95,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=False,
            strategy="structured_fact",
        )

    if pure_social:
        return _result("social_small_talk", 0.96, language, dialect, entities, raw, norm)

    if _THANKS_RE.match(raw):
        return _result("thanks", 0.97, language, dialect, entities, raw, norm)

    if _FAREWELL_RE.match(raw):
        return _result("farewell", 0.97, language, dialect, entities, raw, norm)

    if _OUT_OF_SCOPE_RE.search(raw):
        return _result("out_of_scope", 0.95, language, dialect, entities, raw, norm)

    if _EVIDENCE_RE.search(raw) or (ctx.get("last_verified_citations") and _PAGE_RE.search(raw)):
        return _result(
            "evidence_request",
            0.94,
            language,
            dialect,
            entities,
            raw,
            norm,
            requested_evidence=True,
        )

    if _PAGE_RE.search(raw):
        return _result(
            "page_or_image_request",
            0.93,
            language,
            dialect,
            entities,
            raw,
            norm,
            requested_evidence=True,
        )

    if _FOUNDATION_RE.search(raw):
        return _result(
            "company_foundation",
            0.93,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=False,
            strategy="structured_fact",
        )

    if _AGE_RE.search(raw):
        return _result(
            "company_age",
            0.92,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=False,
            strategy="calculated",
            reasoning=True,
        )

    if _INFERENCE_RE.search(raw):
        return _result(
            "supported_inference",
            0.9,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=False,
            strategy="supported_inference",
            reasoning=True,
        )

    if _CYBER_RE.search(raw):
        return _result(
            "cybersecurity_services",
            0.9,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=True,
        )

    if _DIGITAL_TRANSFORMATION_RE.search(raw):
        return _result(
            "digital_transformation",
            0.92,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=True,
        )

    if _GOV_RE.search(raw):
        return _result(
            "government_projects",
            0.9,
            language,
            dialect,
            entities,
            raw,
            norm,
            retrieval=True,
        )

    if _COMPANY_OVERVIEW_RE.search(raw):
        return _result("company_overview", 0.88, language, dialect, entities, raw, norm, retrieval=True)

    if _SERVICES_RE.search(raw):
        return _result("company_services", 0.86, language, dialect, entities, raw, norm, retrieval=True)

    if entities.get("project_hint") or entities.get("client_key"):
        return _result("project_lookup", 0.84, language, dialect, entities, raw, norm, retrieval=True)

    # Layer 2: topic card semantic match
    card = match_topic_card(raw)
    if (
        card
        and card.score >= 0.72
        and (card.intent not in {"greeting", "social_small_talk"} or pure_social)
    ):
        return RouteResult(
            intent=card.intent,
            confidence=card.score,
            language=language,
            dialect=dialect,
            entities=entities,
            requires_retrieval=card.answer_strategy == "retrieval",
            requires_reasoning=card.answer_strategy in {"calculated", "supported_inference"},
            requires_generation=False,
            requested_evidence=False,
            normalized_query=rewrite_query(raw, intent=card.intent, dialect=dialect),
            topic_card_id=card.card_id,
            answer_strategy=card.answer_strategy,
        )

    # Layer 3: semantic intent examples
    best_intent = "document_status"
    best_score = 0.0
    for intent in (
        "greeting",
        "social_small_talk",
        "company_foundation",
        "company_age",
        "cybersecurity_services",
        "government_projects",
        "company_services",
        "company_overview",
        "out_of_scope",
        "supported_inference",
        "evidence_request",
    ):
        if intent in {"greeting", "social_small_talk"} and not pure_social:
            continue
        score = _semantic_intent_score(norm, intent)
        if score > best_score:
            best_score = score
            best_intent = intent

    if best_score >= 0.55:
        retrieval = best_intent not in {
            "greeting",
            "social_small_talk",
            "thanks",
            "farewell",
            "out_of_scope",
            "company_foundation",
            "company_age",
            "supported_inference",
        }
        return RouteResult(
            intent=best_intent,
            confidence=best_score,
            language=language,
            dialect=dialect,
            entities=entities,
            requires_retrieval=retrieval,
            requires_reasoning=best_intent in {"company_age", "supported_inference"},
            requires_generation=retrieval,
            requested_evidence=best_intent in {"evidence_request", "page_or_image_request"},
            normalized_query=rewrite_query(raw, intent=best_intent, dialect=dialect),
        )

    # Default: document question needing retrieval
    return RouteResult(
        intent="document_status",
        confidence=0.45,
        language=language,
        dialect=dialect,
        entities=entities,
        requires_retrieval=True,
        requires_reasoning=False,
        requires_generation=True,
        requested_evidence=False,
        normalized_query=rewrite_query(raw, intent="document_status", dialect=dialect) or raw,
    )


def _result(
    intent: str,
    confidence: float,
    language: str,
    dialect: str,
    entities: dict[str, Any],
    raw: str,
    norm: str,
    *,
    retrieval: bool = False,
    reasoning: bool = False,
    requested_evidence: bool = False,
    strategy: Optional[str] = None,
) -> RouteResult:
    return RouteResult(
        intent=intent,
        confidence=confidence,
        language=language,
        dialect=dialect,
        entities=entities,
        requires_retrieval=retrieval,
        requires_reasoning=reasoning,
        requires_generation=retrieval,
        requested_evidence=requested_evidence,
        normalized_query=rewrite_query(raw, intent=intent, dialect=dialect) or raw,
        answer_strategy=strategy,
    )
