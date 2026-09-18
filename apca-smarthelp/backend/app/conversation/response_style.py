"""Dialect-aware polished response templates."""

from __future__ import annotations

from typing import Optional


def greeting_response(*, dialect: str, language: str, name: Optional[str] = None) -> str:
    _ = name
    if dialect == "iraqi":
        return (
            "هلا وغلا، كل الأمور طيبة والحمد لله. "
            "أنا حاضر أخدمك بأي معلومة عن شركة حزام تقنية المعلومات أو مشاريعها وخدماتها."
        )
    if dialect in {"levantine", "jordanian", "palestinian"}:
        return (
            "أهلين وسهلين، الأمور تمام والحمد لله. "
            "أنا جاهز لأي استفسار عن الشركة أو خدماتها ومشاريعها."
        )
    if dialect in {"saudi", "gulf"}:
        return (
            "يا مرحبا، أبشرك الأمور طيبة. "
            "تفضل بسؤالك عن الشركة أو المشاريع أو الخدمات، وأعطيك الجواب الموثق."
        )
    if language == "en":
        return (
            "Hello. I am the ITB assistant. "
            "Ask me about company services, projects, or verified contact information."
        )
    # MSA default
    return "وعليكم السلام ورحمة الله وبركاته، حياك الله. كيف أستطيع خدمتك؟"


def social_small_talk_response(*, dialect: str, language: str) -> str:
    if dialect == "iraqi":
        return (
            "هلا وغلا، كل الأمور طيبة والحمد لله. "
            "أنا حاضر أخدمك بأي معلومة عن شركة حزام أو مشاريعها وخدماتها."
        )
    if dialect in {"levantine", "jordanian", "palestinian"}:
        return (
            "أهلين وسهلين، الأمور تمام والحمد لله. "
            "أنا جاهز لأي استفسار عن الشركة أو خدماتها ومشاريعها."
        )
    if dialect in {"saudi", "gulf"}:
        return (
            "يا مرحبا، أبشرك الأمور طيبة. "
            "تفضل بسؤالك عن الشركة أو المشاريع أو الخدمات، وأعطيك الجواب الموثق."
        )
    return (
        "الحمد لله بخير، شكراً لسؤالك. "
        "أنا مساعد شركة حزام تقنية المعلومات (ITB). اسألني عن الخدمات أو المشاريع أو بيانات التواصل."
    )


def thanks_response() -> str:
    return "العفو، يسعدني خدمتك. إذا احتجت أي معلومة موثقة عن الشركة فأنا حاضر."


def farewell_response() -> str:
    return "في أمان الله. يسعدني خدمتك في أي وقت تحتاج معلومة موثقة عن شركة حزام تقنية المعلومات."


def out_of_scope_response() -> str:
    return (
        "عذراً، هذا السؤال خارج نطاق معرفتي بشركة حزام تقنية المعلومات. "
        "أستطيع مساعدتك في الخدمات، المشاريع، بيانات التواصل، والملف التعريفي للشركة."
    )


def ambiguous_choice_prompt(options: list[str]) -> str:
    lines = ["وجدت موضوعين قريبين من سؤالك:"]
    for idx, opt in enumerate(options[:3], start=1):
        lines.append(f"{idx}. {opt}")
    lines.append("أرسل الرقم المطلوب وسأعرض التفاصيل الموثقة.")
    return "\n".join(lines)


def format_citation_suffix(document_title: str, page: int | None) -> str:
    if page:
        return f"[{document_title}، ص {page}]"
    return f"[{document_title}]"


def apply_investor_prefix(answer: str, *, phone: str, intent: str) -> str:
    """Mohammed investor quote-reply style for factual answers only."""
    import os
    import re

    targets = os.environ.get("BELT_INVESTOR_PHONES", "+966543242082")
    allowed = {re.sub(r"\D", "", p.strip()) for p in targets.split(",") if p.strip()}
    normalized_phone = re.sub(r"\D", "", phone or "")
    if normalized_phone not in allowed:
        return answer
    if intent in {"greeting", "social_small_talk", "thanks", "farewell", "out_of_scope"}:
        return answer
    prefix = "التقرير سيد محمد هو:"
    if answer.startswith(prefix):
        return answer
    return f"{prefix}\n{answer}"
