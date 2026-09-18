"""Deterministic fact derivation and supported inference."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from backend.app.services.qa.knowledge_context import load_company_facts


@dataclass
class DerivedFact:
    answer_type: str
    answer_ar: str
    derivation_summary: str
    founded_year: Optional[int] = None
    years_in_market: Optional[int] = None


def _reference_year() -> int:
    return datetime.now().year


def _parse_founded_year(facts: dict) -> Optional[int]:
    raw = str(facts.get("founded", "")).strip()
    if raw.isdigit():
        return int(raw)
    return None


def answer_foundation_question() -> DerivedFact:
    facts = load_company_facts()
    year = _parse_founded_year(facts)
    if not year:
        return DerivedFact(
            answer_type="insufficient",
            answer_ar="لم أجد سنة تأسيس موثقة في بيانات الشركة المعتمدة.",
            derivation_summary="founded year missing in company_facts",
        )
    title = "الملف التعريفي للشركة باللغة العربية 2025"
    answer = f"تأسست شركة حزام تقنية المعلومات عام {year}.\n[{title}، ص 3]"
    return DerivedFact(
        answer_type="explicit_fact",
        answer_ar=answer,
        derivation_summary="Founding year from approved company facts aligned to company profile.",
        founded_year=year,
    )


def answer_age_question() -> DerivedFact:
    facts = load_company_facts()
    year = _parse_founded_year(facts)
    if not year:
        return DerivedFact(
            answer_type="insufficient",
            answer_ar="لم أجد سنة بداية عمل موثقة لحساب عمر الشركة.",
            derivation_summary="founded year missing",
        )
    ref = _reference_year()
    years = max(0, ref - year)
    title = "الملف التعريفي للشركة باللغة العربية 2025"
    answer = (
        f"تعمل الشركة منذ عام {year}، أي منذ نحو {years} عاماً حتى عام {ref}.\n"
        f"[{title}، ص 3]"
    )
    return DerivedFact(
        answer_type="calculated",
        answer_ar=answer,
        derivation_summary=f"Calculated {years} years from founded year {year} to reference year {ref}.",
        founded_year=year,
        years_in_market=years,
    )


def answer_supported_experience_inference() -> DerivedFact:
    age = answer_age_question()
    if age.answer_type == "insufficient" or age.years_in_market is None:
        return age
    ref = _reference_year()
    title = "الملف التعريفي للشركة باللغة العربية 2025"
    answer = (
        f"نعم، وبالاستناد إلى عمل الشركة منذ عام {age.founded_year}، "
        f"فهي تمتلك خبرة ممتدة تقارب {age.years_in_market} عاماً حتى {ref}، "
        f"وهو ما يُعد خبرة طويلة في قطاع تقنية المعلومات.\n"
        f"[{title}، ص 3]"
    )
    return DerivedFact(
        answer_type="supported_inference",
        answer_ar=answer,
        derivation_summary="Supported inference from verified founding year and deterministic age calculation.",
        founded_year=age.founded_year,
        years_in_market=age.years_in_market,
    )
