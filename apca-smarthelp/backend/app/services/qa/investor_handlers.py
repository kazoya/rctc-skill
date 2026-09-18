"""Deterministic investor/customer inquiry handlers backed by company_facts.json."""

from __future__ import annotations

import re
from typing import Callable, Optional

from backend.app.models.schemas import SearchHit
from backend.app.services.qa.knowledge_context import load_company_facts

_INSUFFICIENT_RE = re.compile(
    r"لم أجد|could not find|insufficient|لا معلومات|no information",
    re.I,
)

# --- Intent patterns (order matters inside try_investor_facts_answer) ---

_COMPANY_PROFILE_Q = re.compile(
    r"ماذا\s*تعرف|ما\s*تعرف|شو\s*تعرف|ماذا\s*تعلم|ما\s*تعلم|"
    r"من\s*هي|ما\s*هي|من\s*انت|من\s*انتم|"
    r"عرفني\s*عن|حدثني\s*عن|نبذة\s*عن|"
    r"who\s+is\s+(?:itb|information\s+belt)|"
    r"what\s+is\s+(?:itb|information\s+belt)|"
    r"what\s+do\s+you\s+know\s+about|tell\s+me\s+about",
    re.I,
)
_ITB_MENTION_Q = re.compile(r"itb|حزام|information\s+belt|شركة", re.I)

_LOCATION_Q = re.compile(
    r"وين\s*مقر|أين\s*مقر|اين\s*مقر|مقركم|مقر\s*الشركة|العنوان|موقع\s*الشركة|"
    r"where\s+(?:is|are)\s+(?:your\s+)?(?:office|headquarters|hq)|"
    r"company\s+address|office\s+location|headquarters",
    re.I,
)
_FOUNDED_Q = re.compile(
    r"متى\s*تأسس|متى\s*تأسست|منذ\s*متى|سنة\s*التأسيس|تأسست\s*متى|عام\s*التأسيس|"
    r"when\s+(?:was\s+)?(?:itb\s+)?founded|founding\s+year|since\s+when|established\s+in",
    re.I,
)
_WEBSITE_Q = re.compile(
    r"^(?:ما\s*موقع|موقعكم|الموقع\s*الإلكتروني|الموقع\s*الالكتروني|"
    r"what\s+is\s+your\s+website|your\s+website|website\s+url)[\s؟?]*$",
    re.I,
)
_SERVICES_Q = re.compile(
    r"خدمات(?:كم|نا| الشركة)?|ماذا\s*تقدم|ماذا\s*تقدمون|شو\s*خدمات|ما\s*خدمات|"
    r"what\s+(?:are\s+)?(?:your\s+)?services|services\s+(?:do\s+you|offered)|"
    r"what\s+do\s+you\s+offer|solutions\s+you\s+provide",
    re.I,
)
_SECTORS_Q = re.compile(
    r"قطاعات|القطاعات|في\s*أي\s*قطاع|في\s*اي\s*قطاع|"
    r"what\s+sectors|which\s+sectors|industries\s+you\s+serve|sectors\s+you\s+work",
    re.I,
)
_CERTIFICATIONS_Q = re.compile(
    r"شهادات|اعتمادات|iso|آيزو|ايزو|certification|certified|accreditation|"
    r"CMMI|ITIL|27001|9001",
    re.I,
)
_STATS_Q = re.compile(
    r"كم\s*عميل|عدد\s*العملاء|كم\s*مزود|عدد\s*المزودين|كم\s*قطاع|"
    r"how\s+many\s+clients|client\s+count|number\s+of\s+clients|"
    r"how\s+many\s+(?:vendors|partners)|technology\s+partners|"
    r"years?\s+of\s+experience|خبرة\s*كم|كم\s*سنة\s*خبرة",
    re.I,
)
_CLIENTS_LIST_Q = re.compile(
    r"من\s*عملاءكم|عملاؤكم|قائمة\s*العملاء|أبرز\s*العملاء|"
    r"who\s+(?:are\s+)?your\s+clients|client\s+list|key\s+clients|notable\s+clients",
    re.I,
)
_PARTNERS_Q = re.compile(
    r"شركاء|شركاؤكم|مزودين|الموردين|تقنياً|technology\s+partners|"
    r"vendor\s+partners|who\s+do\s+you\s+partner",
    re.I,
)
_FINANCIALS_Q = re.compile(
    r"إيرادات|ايرادات|أرباح|ارباح|قيمة\s*الشركة|تقييم\s*الشركة|استثمار|مستثمر|"
    r"حصص|مساهم|revenue|profit|valuation|investor|investment|shareholder|"
    r"funding|financials|market\s+cap",
    re.I,
)
_EMPLOYEES_Q = re.compile(
    r"كم\s*موظف|عدد\s*الموظفين|حجم\s*الفريق|team\s+size|how\s+many\s+employees|headcount",
    re.I,
)
_BRANCHES_Q = re.compile(
    r"فروع|فرع\s+آخر|خارج\s*الرياض|branches|other\s+offices|outside\s+riyadh",
    re.I,
)
_SLA_Q = re.compile(
    r"دعم\s*24|SLA|مستوى\s*الخدمة|service\s+level|support\s+hours|24/7|على\s*مدار",
    re.I,
)
_ABBREV_Q = re.compile(
    r"ماذا\s*يعني\s*ITB|معنى\s*ITB|ITB\s+stand\s+for|what\s+does\s+ITB\s+mean",
    re.I,
)
_THANKS_Q = re.compile(
    r"^(?:شكرا|شكراً|مشكور|يعطيك\s*العافية|thanks|thank\s+you)[\s!.،]*$",
    re.I,
)
_GOODBYE_Q = re.compile(
    r"^(?:مع\s*السلامة|الله\s*يعطيك\s*العافية|باي|bye|goodbye|see\s+you)[\s!.،]*$",
    re.I,
)


def _facts_hit(snippet: str, explanation: str, title: str = "بيانات الشركة") -> SearchHit:
    return SearchHit(
        passage_id=f"investor-{explanation}",
        topic_id=f"investor-{explanation}",
        topic_title=title,
        document_id="company-facts",
        document_title="company_facts.json",
        page_from=1,
        page_to=1,
        snippet=snippet[:320],
        final_score=0.96,
        lexical_score=0.88,
        explanation=explanation,
    )


def _lang_ar(question: str) -> bool:
    return bool(re.search(r"[\u0600-\u06FF]", question))


def _bullet_list(items: list[str], *, max_items: int = 7) -> str:
    shown = items[:max_items]
    return "\n".join(f"- {item}" for item in shown)


def _try_company_profile(
    question: str, facts: dict, *, verbosity: str
) -> Optional[tuple[str, list[SearchHit]]]:
    q = (question or "").strip()
    if not _COMPANY_PROFILE_Q.search(q):
        return None
    if not _ITB_MENTION_Q.search(q) and not re.search(
        r"الشركة|الشركه|company", q, re.I
    ):
        return None

    ar = _lang_ar(question)
    legal = facts.get("legal_name_ar" if ar else "legal_name_en", "ITB")
    brand = facts.get("brand_name_ar" if ar else "brand_name_en", "Information Belt")
    abbr = facts.get("abbreviation", "ITB")
    founded = facts.get("founded", "2008")
    years = facts.get("years_experience", "15+")
    hq = facts.get("headquarters_ar" if ar else "headquarters_en", "Riyadh")
    clients = facts.get("client_count", "80+")
    vendors = facts.get("vendor_count", "20+")
    sectors = facts.get("sector_count", "8")
    site = facts.get("website", "https://www.itb.com.sa")
    email = facts.get("email", "info@itb.com.sa")
    phone = facts.get("phone", "+966 11 215 0044")
    services = facts.get("services_ar" if ar else "services_en", [])
    service_line = "، ".join(services[:4]) if services else (
        "الأمن السيبراني، السحابة، التحول الرقمي، وERP"
        if ar
        else "cybersecurity, cloud, digital transformation, and ERP"
    )

    if ar:
        if verbosity == "short":
            answer = (
                f"{legal} ({abbr} — {brand}) شركة سعودية منذ {founded} ومقرها {hq}.\n"
                f"تتخصص في {service_line}.\n"
                f"خبرة {years} سنة، {clients} عميلاً في {sectors} قطاعات، "
                f"وشراكات مع {vendors} مزوداً تقنياً، ودعم {facts.get('support_hours', '24/7')}.\n"
                f"الموقع: {site} | {email}"
            )
        else:
            answer = (
                f"{legal} ({abbr} — {brand}) شركة سعودية تأسست عام {founded} ومقرها {hq}.\n"
                f"- التخصص: {service_line}.\n"
                f"- خبرة تتجاوز {years} سنة في السوق السعودي.\n"
                f"- {clients} عميلاً في {sectors} قطاعات، وشراكات مع {vendors} مزوداً تقنياً.\n"
                f"- دعم فني واستشارات {facts.get('support_hours', '24/7')}.\n"
                f"للتواصل: {phone} | {email} | {site}"
            )
    else:
        if verbosity == "short":
            answer = (
                f"{legal} ({abbr} — {brand}) is a Saudi technology company since {founded}, "
                f"headquartered in {hq}.\n"
                f"Focus: {service_line}.\n"
                f"{years} years of experience, {clients} clients across {sectors} sectors, "
                f"{vendors} technology partners, and {facts.get('support_hours', '24/7')} support.\n"
                f"Website: {site} | {email}"
            )
        else:
            answer = (
                f"{legal} ({abbr} — {brand}) is a Saudi technology company founded in {founded}, "
                f"headquartered in {hq}.\n"
                f"- Focus: {service_line}.\n"
                f"- {years}+ years in the Saudi market.\n"
                f"- {clients} clients across {sectors} sectors and {vendors} technology partners.\n"
                f"- {facts.get('support_hours', '24/7')} technical support and consulting.\n"
                f"Contact: {phone} | {email} | {site}"
            )

    return answer, [_facts_hit(answer, "company_narrative", title="نبذة عن الشركة")]


def _try_location(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _LOCATION_Q.search(question):
        return None
    ar = _lang_ar(question)
    if ar:
        answer = (
            f"مقر شركة حزام تقنية المعلومات (ITB): {facts.get('headquarters_ar', 'الرياض')}.\n"
            f"العنوان: {facts.get('address_ar', facts.get('address_en', ''))}."
        )
    else:
        answer = (
            f"ITB headquarters: {facts.get('headquarters_en', 'Riyadh, Saudi Arabia')}.\n"
            f"Address: {facts.get('address_en', '')}."
        )
    if verbosity == "short":
        answer = answer.split("\n")[0] + "."
    return answer, [_facts_hit(answer, "company_location")]


def _try_founded(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _FOUNDED_Q.search(question):
        return None
    founded = facts.get("founded", "2008")
    years = facts.get("years_experience", "15+")
    ar = _lang_ar(question)
    if ar:
        answer = (
            f"تأسست شركة حزام تقنية المعلومات (ITB) عام {founded}، "
            f"بخبرة تتجاوز {years} سنة في السوق السعودي."
        )
    else:
        answer = (
            f"ITB (Information Belt) was founded in {founded}, "
            f"with {years} years of experience in the Saudi market."
        )
    return answer, [_facts_hit(answer, "company_founded")]


def _try_website(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _WEBSITE_Q.search(question.strip()):
        return None
    site = facts.get("website", "https://www.itb.com.sa")
    email = facts.get("email", "info@itb.com.sa")
    ar = _lang_ar(question)
    if ar:
        answer = f"الموقع الرسمي: {site} | البريد: {email}"
    else:
        answer = f"Official website: {site} | Email: {email}"
    return answer, [_facts_hit(answer, "contact_facts")]


def _try_services(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _SERVICES_Q.search(question):
        return None
    ar = _lang_ar(question)
    items = facts.get("services_ar" if ar else "services_en", [])
    if not items:
        return None
    if ar:
        intro = "خدمات شركة حزام تقنية المعلومات (ITB) تشمل:"
    else:
        intro = "ITB (Information Belt) provides:"
    if verbosity == "short":
        answer = intro + " " + "، ".join(items[:4]) + ("..." if len(items) > 4 else "") + "."
    else:
        answer = intro + "\n" + _bullet_list(items)
    return answer, [_facts_hit(answer, "company_services")]


def _try_sectors(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _SECTORS_Q.search(question):
        return None
    ar = _lang_ar(question)
    items = facts.get("sectors_ar" if ar else "sectors_en", [])
    count = facts.get("sector_count", str(len(items)))
    if not items:
        return None
    if ar:
        intro = f"تعمل ITB في أكثر من {count} قطاعات، منها:"
    else:
        intro = f"ITB serves {count}+ sectors, including:"
    if verbosity == "short":
        answer = intro + " " + "، ".join(items[:4]) + "."
    else:
        answer = intro + "\n" + _bullet_list(items)
    return answer, [_facts_hit(answer, "company_sectors")]


def _try_certifications(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _CERTIFICATIONS_Q.search(question):
        return None
    ar = _lang_ar(question)
    certs = facts.get("certifications", [])
    team = facts.get("team_certifications", [])
    if not certs:
        return None
    if ar:
        answer = "شهادات وإطارات عمل الشركة: " + "، ".join(certs) + "."
        if team and verbosity != "short":
            answer += "\nشهادات الفريق: " + "، ".join(team) + "."
    else:
        answer = "Company certifications: " + ", ".join(certs) + "."
        if team and verbosity != "short":
            answer += "\nTeam certifications: " + ", ".join(team) + "."
    return answer, [_facts_hit(answer, "company_certifications")]


def _try_stats(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _STATS_Q.search(question):
        return None
    ar = _lang_ar(question)
    clients = facts.get("client_count", "80+")
    vendors = facts.get("vendor_count", "20+")
    sectors = facts.get("sector_count", "8")
    years = facts.get("years_experience", "15+")
    founded = facts.get("founded", "2008")
    if ar:
        if re.search(r"عميل", question):
            answer = f"تخدم ITB أكثر من {clients} عميلاً في المملكة."
        elif re.search(r"مزود|شريك", question):
            answer = f"تتعاون ITB مع أكثر من {vendors} مزوداً تقنياً عالمياً."
        elif re.search(r"قطاع", question):
            answer = f"تعمل ITB في {sectors} قطاعات رئيسية."
        elif re.search(r"خبرة|سنة", question):
            answer = f"خبرة ITB تتجاوز {years} سنة منذ تأسيسها عام {founded}."
        else:
            answer = (
                f"أرقام موثقة: {clients} عميلاً، {vendors} مزوداً تقنياً، "
                f"{sectors} قطاعات، خبرة {years} سنة."
            )
    else:
        if re.search(r"client", question, re.I):
            answer = f"ITB serves {clients} clients across KSA."
        elif re.search(r"vendor|partner", question, re.I):
            answer = f"ITB partners with {vendors} technology vendors."
        elif re.search(r"sector", question, re.I):
            answer = f"ITB operates across {sectors} key sectors."
        elif re.search(r"experience|years", question, re.I):
            answer = f"ITB has {years} years of experience since {founded}."
        else:
            answer = (
                f"Documented figures: {clients} clients, {vendors} vendors, "
                f"{sectors} sectors, {years} years of experience."
            )
    return answer, [_facts_hit(answer, "company_stats")]


def _try_clients_list(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _CLIENTS_LIST_Q.search(question):
        return None
    ar = _lang_ar(question)
    items = facts.get("featured_clients_ar" if ar else "featured_clients_en", [])
    if not items:
        return None
    if ar:
        intro = "من أبرز عملاء ITB (حسب الملف التعريفي):"
    else:
        intro = "Featured ITB clients (per company profile):"
    if verbosity == "short":
        answer = intro + " " + "، ".join(items) + "."
    else:
        answer = intro + "\n" + _bullet_list(items)
    return answer, [_facts_hit(answer, "company_clients")]


def _try_partners(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _PARTNERS_Q.search(question):
        return None
    if _CLIENTS_LIST_Q.search(question):
        return None
    ar = _lang_ar(question)
    partners = facts.get("technology_partners", [])
    vendors = facts.get("vendor_count", "20+")
    if not partners:
        return None
    if ar:
        intro = f"تتعاون ITB مع أكثر من {vendors} مزوداً تقنياً، من بينهم:"
    else:
        intro = f"ITB works with {vendors}+ technology partners, including:"
    if verbosity == "short":
        answer = intro + " " + "، ".join(partners[:6]) + "."
    else:
        answer = intro + "\n" + _bullet_list(partners)
    return answer, [_facts_hit(answer, "company_partners")]


def _try_financials(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _FINANCIALS_Q.search(question):
        return None
    ar = _lang_ar(question)
    answer = facts.get("investor_contact_ar" if ar else "investor_contact_en", "")
    if not answer:
        return None
    return answer, [_facts_hit(answer, "investor_contact")]


def _try_employees(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _EMPLOYEES_Q.search(question):
        return None
    count = str(facts.get("employee_count") or "").strip()
    ar = _lang_ar(question)
    if count:
        answer = (
            f"عدد موظفي ITB: {count}." if ar else f"ITB employee count: {count}."
        )
    elif ar:
        answer = (
            "حجم الفريق غير منشور عبر هذه القناة. "
            "للحصول على معلومات رسمية، تواصل مع info@itb.com.sa."
        )
    else:
        answer = (
            "Team size is not published via this channel. "
            "Contact info@itb.com.sa for official information."
        )
    return answer, [_facts_hit(answer, "company_stats")]


def _try_branches(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _BRANCHES_Q.search(question):
        return None
    ar = _lang_ar(question)
    hq = facts.get("headquarters_ar" if ar else "headquarters_en", "Riyadh")
    if ar:
        answer = (
            f"المقر الرئيسي لـ ITB في {hq}. "
            "للاستفسار عن الفروع أو التواجد الإقليمي، تواصل مع info@itb.com.sa."
        )
    else:
        answer = (
            f"ITB headquarters is in {hq}. "
            "For branch or regional presence inquiries, contact info@itb.com.sa."
        )
    return answer, [_facts_hit(answer, "company_location")]


def _try_sla(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _SLA_Q.search(question):
        return None
    ar = _lang_ar(question)
    hours = facts.get("support_hours", "24/7")
    if ar:
        answer = (
            f"توفر ITB دعماً فنياً واستشارات على مدار الساعة ({hours}) "
            "وفق عقود الخدمة المتفق عليها مع كل عميل."
        )
    else:
        answer = (
            f"ITB provides {hours} technical support and consulting "
            "per service agreements with each client."
        )
    return answer, [_facts_hit(answer, "company_advantages")]


def _try_abbrev(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _ABBREV_Q.search(question):
        return None
    ar = _lang_ar(question)
    meaning = facts.get("abbreviation_meaning_ar" if ar else "abbreviation_meaning_en", "Information Belt")
    abbr = facts.get("abbreviation", "ITB")
    legal = facts.get("legal_name_ar" if ar else "legal_name_en", "")
    answer = f"{abbr} = {meaning}. {legal}." if verbosity != "short" else f"{abbr}: {meaning}."
    return answer, [_facts_hit(answer, "company_identity")]


def _try_thanks(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _THANKS_Q.match(question.strip()):
        return None
    ar = _lang_ar(question)
    answer = (
        "العفو، في خدمتك دائماً. اسألني عن أي معلومة عن ITB."
        if ar
        else "You're welcome. Ask me anything about ITB."
    )
    return answer, [_facts_hit(answer, "greeting")]


def _try_goodbye(question: str, facts: dict, *, verbosity: str) -> Optional[tuple[str, list[SearchHit]]]:
    if not _GOODBYE_Q.match(question.strip()):
        return None
    ar = _lang_ar(question)
    answer = (
        "مع السلامة. نتشرف بخدمتك في أي وقت."
        if ar
        else "Goodbye. We look forward to assisting you."
    )
    return answer, [_facts_hit(answer, "greeting")]


_HANDLERS: list[Callable[..., Optional[tuple[str, list[SearchHit]]]]] = [
    _try_company_profile,
    _try_location,
    _try_founded,
    _try_website,
    _try_services,
    _try_sectors,
    _try_certifications,
    _try_stats,
    _try_clients_list,
    _try_partners,
    _try_financials,
    _try_employees,
    _try_branches,
    _try_sla,
    _try_abbrev,
    _try_thanks,
    _try_goodbye,
]


def try_investor_facts_answer(
    question: str,
    *,
    verbosity: str = "short",
) -> Optional[tuple[str, list[SearchHit]]]:
    """Return a grounded answer for investor/customer FAQ intents, or None."""
    q = (question or "").strip()
    if not q:
        return None
    facts = load_company_facts()
    for handler in _HANDLERS:
        payload = handler(q, facts, verbosity=verbosity)
        if payload:
            answer, evidence = payload
            if answer and not _INSUFFICIENT_RE.search(answer):
                return answer, evidence
    return None
