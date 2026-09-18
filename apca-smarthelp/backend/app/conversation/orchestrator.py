"""Conversation orchestration — routes before heavy RAG/LLM."""

from __future__ import annotations

import re
import uuid
from typing import Any, Optional

from backend.app.conversation.inference import (
    answer_age_question,
    answer_foundation_question,
    answer_supported_experience_inference,
)
from backend.app.conversation.response_style import (
    apply_investor_prefix,
    farewell_response,
    greeting_response,
    out_of_scope_response,
    social_small_talk_response,
    thanks_response,
)
from backend.app.conversation.router import RouteResult, route_message
from backend.app.models.schemas import AskResponse, Citation, ConversationMeta, SearchHit, VerifiedCitation


def _synthetic_hit(
    *,
    passage_id: str,
    document_id: str,
    document_title: str,
    page: int,
    snippet: str,
    explanation: str,
) -> SearchHit:
    return SearchHit(
        passage_id=passage_id,
        topic_id=passage_id,
        topic_title=explanation,
        document_id=document_id,
        document_title=document_title,
        page_from=page,
        page_to=page,
        snippet=snippet[:320],
        final_score=0.97,
        lexical_score=0.9,
        explanation=explanation,
    )


def _profile_doc_hit(page: int = 3, explanation: str = "company_foundation") -> SearchHit:
    return _synthetic_hit(
        passage_id=f"topic-card-{explanation}",
        document_id="84d2d0b1-c42a-4163-89c9-01d0b5092831",
        document_title="الملف التعريفي للشركة باللغة العربية 2025",
        page=page,
        snippet="شركة حزام تقنية المعلومات",
        explanation=explanation,
    )


def _pack(
    *,
    answer: str,
    evidence: list[SearchHit],
    route: RouteResult,
    answer_type: str,
    status: str = "answered",
    derivation_summary: str = "",
    phone: str = "",
    ollama_used: bool = False,
) -> AskResponse:
    answer = apply_investor_prefix(answer, phone=phone, intent=route.intent)
    citations = [
        Citation(
            document_title=e.document_title,
            page=e.page_from,
            topic_id=e.topic_id,
            passage_id=e.passage_id,
        )
        for e in evidence
    ]
    verified = [
        VerifiedCitation(
            document_id=e.document_id,
            document_title=e.document_title,
            page=e.page_from,
            passage_id=e.passage_id,
            supporting_quote=(e.snippet or "")[:240],
        )
        for e in evidence
    ]
    best_page = evidence[0].page_from if evidence else None
    return AskResponse(
        answer=answer,
        citations=citations,
        evidence=evidence,
        ollama_used=ollama_used,
        conversation=ConversationMeta(
            status=status,  # type: ignore[arg-type]
            answer_type=answer_type,  # type: ignore[arg-type]
            intent=route.intent,
            dialect=route.dialect,
            confidence=route.confidence,
            normalized_query=route.normalized_query,
            requested_evidence=route.requested_evidence,
            best_source_page=best_page,
            derivation_summary=derivation_summary or None,
            answer_id=str(uuid.uuid4()),
            last_verified_citations=verified,
        ),
    )


def try_conversation_answer(
    question: str,
    *,
    verbosity: str = "detailed",
    context: Optional[dict[str, Any]] = None,
    phone: str = "",
) -> Optional[AskResponse]:
    """Fast conversational path without retrieval/LLM when possible."""
    ctx = context or {}
    route = route_message(question, context=ctx)

    if route.intent == "greeting":
        answer = greeting_response(dialect=route.dialect, language=route.language)
        if verbosity == "short":
            answer = answer.split(".")[0] + "."
        hit = _synthetic_hit(
            passage_id="greeting",
            document_id="conversation",
            document_title="ITB Assistant",
            page=1,
            snippet=answer,
            explanation="greeting",
        )
        return _pack(answer=answer, evidence=[hit], route=route, answer_type="explicit_fact", phone=phone)

    if route.intent == "social_small_talk":
        answer = social_small_talk_response(dialect=route.dialect, language=route.language)
        hit = _synthetic_hit(
            passage_id="social-small-talk",
            document_id="conversation",
            document_title="ITB Assistant",
            page=1,
            snippet=answer,
            explanation="social_small_talk",
        )
        return _pack(answer=answer, evidence=[hit], route=route, answer_type="explicit_fact", phone=phone)

    if route.intent == "thanks":
        answer = thanks_response()
        hit = _synthetic_hit(
            passage_id="thanks",
            document_id="conversation",
            document_title="ITB Assistant",
            page=1,
            snippet=answer,
            explanation="thanks",
        )
        return _pack(answer=answer, evidence=[hit], route=route, answer_type="explicit_fact", phone=phone)

    if route.intent == "farewell":
        answer = farewell_response()
        hit = _synthetic_hit(
            passage_id="farewell",
            document_id="conversation",
            document_title="ITB Assistant",
            page=1,
            snippet=answer,
            explanation="farewell",
        )
        return _pack(answer=answer, evidence=[hit], route=route, answer_type="explicit_fact", phone=phone)

    if route.intent == "out_of_scope":
        answer = out_of_scope_response()
        return _pack(
            answer=answer,
            evidence=[],
            route=route,
            answer_type="explicit_fact",
            status="out_of_scope",
            phone=phone,
        )

    if route.intent in {"evidence_request", "page_or_image_request"}:
        last = ctx.get("last_verified_citations") or []
        if not last:
            answer = (
                "لا أملك إجابة سابقة موثقة لإرفاق الدليل. "
                "اطرح سؤالك أولاً وسأرسل المصدر بعد الإجابة."
            )
            return _pack(
                answer=answer,
                evidence=[],
                route=route,
                answer_type="extractive",
                status="insufficient",
                phone=phone,
            )
        cite = last[0]
        page = cite.get("page") or cite.get("page_from")
        title = cite.get("document_title", "المصدر")
        answer = f"نعم، هذه الصفحة الأصلية التي استندت إليها الإجابة:\n{title} — الصفحة {page}."
        hit = _synthetic_hit(
            passage_id=str(cite.get("passage_id") or "evidence"),
            document_id=str(cite.get("document_id") or ""),
            document_title=title,
            page=int(page or 1),
            snippet=str(cite.get("supporting_quote") or ""),
            explanation="evidence_request",
        )
        response = _pack(
            answer=answer,
            evidence=[hit],
            route=route,
            answer_type="extractive",
            phone=phone,
        )
        response.conversation.request_page_image = True  # type: ignore[union-attr]
        return response

    if route.intent == "company_foundation":
        derived = answer_foundation_question()
        if derived.answer_type == "insufficient":
            return None
        hit = _profile_doc_hit(page=3, explanation="company_foundation")
        return _pack(
            answer=derived.answer_ar,
            evidence=[hit],
            route=route,
            answer_type=derived.answer_type,
            derivation_summary=derived.derivation_summary,
            phone=phone,
        )

    if route.intent == "company_age":
        derived = answer_age_question()
        if derived.answer_type == "insufficient":
            return None
        hit = _profile_doc_hit(page=3, explanation="company_age")
        return _pack(
            answer=derived.answer_ar,
            evidence=[hit],
            route=route,
            answer_type=derived.answer_type,
            derivation_summary=derived.derivation_summary,
            phone=phone,
        )

    if route.intent == "supported_inference":
        derived = answer_supported_experience_inference()
        if derived.answer_type == "insufficient":
            return None
        hit = _profile_doc_hit(page=3, explanation="supported_inference")
        return _pack(
            answer=derived.answer_ar,
            evidence=[hit],
            route=route,
            answer_type=derived.answer_type,
            derivation_summary=derived.derivation_summary,
            phone=phone,
        )

    if route.intent == "digital_transformation":
        answer = (
            "نساعد الجهات في التحول الرقمي عبر تصميم وتنفيذ حلول تشمل إدارة الخدمات، "
            "أنظمة تخطيط موارد المؤسسات (ERP) والفوترة الإلكترونية المتوافقة مع ZATCA، "
            "الحوسبة السحابية والبنية التحتية، والاستشارات التقنية وإدارة المشاريع، "
            "مع دعم فني ومراكز عمليات على مدار الساعة. "
            "ويُحدد نطاق كل مشروع بعد دراسة الأنظمة الحالية والأهداف والأولويات."
        )
        hit = _synthetic_hit(
            passage_id="company-facts",
            document_id="company-facts",
            document_title="الحقائق الرسمية لشركة حزام تقنية المعلومات",
            page=1,
            snippet=answer,
            explanation="digital_transformation",
        )
        return _pack(
            answer=answer,
            evidence=[hit],
            route=route,
            answer_type="explicit_fact",
            phone=phone,
        )

    if route.intent == "erp_services":
        answer = (
            "نقدّم حلول أنظمة تخطيط موارد المؤسسات (ERP) ضمن خدمات التحول الرقمي، "
            "إضافةً إلى حلول الفوترة الإلكترونية المتوافقة مع متطلبات ZATCA. "
            "نحدد النظام ونطاق التنفيذ والتكامل والدعم بعد دراسة عمليات الجهة واحتياجاتها؛ "
            "إذا ذكرت لي القطاع أو العملية التي تريد إدارتها أوجّهك للخيار الأنسب."
        )
        hit = _synthetic_hit(
            passage_id="company-facts",
            document_id="company-facts",
            document_title="الحقائق الرسمية لشركة حزام تقنية المعلومات",
            page=1,
            snippet=answer,
            explanation="erp_services",
        )
        return _pack(
            answer=answer,
            evidence=[hit],
            route=route,
            answer_type="explicit_fact",
            phone=phone,
        )

    if route.intent == "government_projects":
        answer = (
            "نعم، لدى الشركة خبرة مع جهات حكومية ووطنية، ومن الجهات المعلنة في "
            "الملف الرسمي: الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)، "
            "الهيئة الوطنية للأمن السيبراني، ووزارة العدل، إضافةً إلى الشركة "
            "السعودية للكهرباء. ويمكنني توضيح المشروع المتاح لكل جهة على حدة."
        )
        hit = _synthetic_hit(
            passage_id="company-facts",
            document_id="company-facts",
            document_title="الحقائق الرسمية لشركة حزام تقنية المعلومات",
            page=1,
            snippet=answer,
            explanation="government_projects",
        )
        return _pack(
            answer=answer,
            evidence=[hit],
            route=route,
            answer_type="explicit_fact",
            phone=phone,
        )

    # Mixed greeting + services in one message
    if route.language == "mixed" and re.search(r"hello|hi|what\s+services", question, re.I):
        return None  # fall through to retrieval with normalized query

    return None


def retrieval_query_for_route(question: str, route: RouteResult) -> str:
    if route.normalized_query and route.normalized_query != question:
        return route.normalized_query
    return question
