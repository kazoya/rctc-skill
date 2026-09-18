from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Optional

from backend.app.core.config import load_settings

_MEMORY_CACHE: tuple[float, str] | None = None
_MEMORY_TTL_SECONDS = 300


def _project_root() -> Path:
    return Path(__file__).resolve().parents[4]


def data_dir() -> Path:
    settings = load_settings()
    base = Path(settings.get("data_dir", "backend/data"))
    if not base.is_absolute():
        base = _project_root() / base
    return base


def master_context_path() -> Path:
    settings = load_settings()
    rel = settings.get("ollama", {}).get("master_context_path", "backend/data/knowledge_master.txt")
    path = Path(rel)
    if not path.is_absolute():
        path = _project_root() / rel
    return path


def load_company_facts() -> dict:
    path = data_dir() / "company_facts.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _identity_block(facts: dict) -> str:
    lines = [
        "=== هوية الشركة / COMPANY IDENTITY ===",
        f"الاسم القانوني (عربي): {facts.get('legal_name_ar', 'شركة حزام تقنية المعلومات')}",
        f"Legal name (English): {facts.get('legal_name_en', 'Information Belt Company for Information Technology')}",
        f"العلامة التجارية (عربي): {facts.get('brand_name_ar', 'حزام المعلومات')}",
        f"Brand (English): {facts.get('brand_name_en', 'Information Belt')}",
        f"Abbreviation: {facts.get('abbreviation', 'ITB')}",
        f"Alternate names: {', '.join(facts.get('alternate_names', []))}",
        f"Founded: {facts.get('founded', '2008')}",
        f"Headquarters: {facts.get('headquarters_en', 'Riyadh, Saudi Arabia')} / {facts.get('headquarters_ar', 'الرياض')}",
        f"Website: {facts.get('website', 'https://www.itb.com.sa')}",
        f"Email: {facts.get('email', 'info@itb.com.sa')}",
        f"Phone: {facts.get('phone', '+966 11 215 0044')}",
        f"Address: {facts.get('address_en', 'Olaya Street, Riyadh 12572, Saudi Arabia')}",
    ]
    reg_bits = []
    for key, label in (
        ("commercial_registration", "CR"),
        ("establishment_membership_number", "Establishment membership"),
        ("unified_number", "Unified number"),
    ):
        val = str(facts.get(key) or "").strip()
        if val:
            reg_bits.append(f"{label}: {val}")
    if reg_bits:
        lines.append("Registration: " + " | ".join(reg_bits))
    stats = (
        f"Experience: {facts.get('years_experience', '15+')} years | "
        f"Clients: {facts.get('client_count', '80+')} | "
        f"Vendors: {facts.get('vendor_count', '20+')} | "
        f"Sectors: {facts.get('sector_count', '8')}"
    )
    lines.append(stats)
    services_ar = facts.get("services_ar") or []
    if services_ar:
        lines.append("Services (AR): " + "؛ ".join(services_ar[:7]))
    services_en = facts.get("services_en") or []
    if services_en:
        lines.append("Services (EN): " + "; ".join(services_en[:7]))
    certs = facts.get("certifications") or []
    if certs:
        lines.append("Certifications: " + ", ".join(certs))
    return "\n".join(lines)


def _fetch_passage_sections() -> list[tuple[str, str]]:
    from backend.app.db.database import connect

    sections: list[tuple[str, str]] = []
    with connect() as conn:
        website_rows = conn.execute(
            """
            SELECT d.title AS document_title, p.topic_title, p.text_original
            FROM passages p
            JOIN documents d ON d.id = p.document_id
            WHERE lower(d.title) LIKE '%itb.com.sa%'
               OR lower(d.original_filename) LIKE '%website%'
            ORDER BY p.page_from, length(p.text_original) DESC
            """
        ).fetchall()
        if website_rows:
            chunks: list[str] = []
            seen: set[str] = set()
            for row in website_rows:
                text = (row["text_original"] or "").strip()
                if len(text) < 30:
                    continue
                key = text[:100]
                if key in seen:
                    continue
                seen.add(key)
                title = row["topic_title"] or row["document_title"] or "Website"
                chunks.append(f"### {title}\n{text}")
            if chunks:
                sections.append(("موقع شركة حزام المعلومات (itb.com.sa)", "\n\n".join(chunks)))

        profile_rows = conn.execute(
            """
            SELECT d.title AS document_title, p.topic_title, p.text_original
            FROM passages p
            JOIN documents d ON d.id = p.document_id
            WHERE lower(d.title) LIKE '%تعريف%'
               OR lower(d.original_filename) LIKE '%تعريف%'
               OR lower(d.title) LIKE '%profile%'
            ORDER BY p.page_from
            LIMIT 40
            """
        ).fetchall()
        if profile_rows:
            chunks = []
            for row in profile_rows:
                text = (row["text_original"] or "").strip()
                if len(text) >= 40:
                    chunks.append(text)
            if chunks:
                sections.append(("الملف التعريفي للشركة", "\n\n".join(chunks)))

        project_rows = conn.execute(
            """
            SELECT p.text_original
            FROM passages p
            JOIN documents d ON d.id = p.document_id
            WHERE lower(d.title) LIKE '%مشاريع%'
               OR lower(d.original_filename) LIKE '%مشاريع%'
            ORDER BY p.page_from
            LIMIT 120
            """
        ).fetchall()
        if project_rows:
            summary_lines: list[str] = []
            client_counts: dict[str, int] = {}
            for row in project_rows:
                text = (row["text_original"] or "").strip()
                m = __import__("re").search(r"عدد مشاريع\s+([^:\n]+):\s*(\d+)", text)
                if m:
                    summary_lines.append(f"- {m.group(1).strip()}: {m.group(2)} projects")
                if "اسم العميل:" in text:
                    for line in text.splitlines():
                        if "اسم العميل:" in line:
                            client = line.split(":", 1)[-1].strip()
                            if client:
                                client_counts[client] = client_counts.get(client, 0) + 1
            if summary_lines:
                sections.append(
                    (
                        "ملخص أعداد المشاريع",
                        "ملخص عدد المشاريع حسب العميل:\n" + "\n".join(summary_lines[:40]),
                    )
                )
            if client_counts:
                top = sorted(client_counts.items(), key=lambda x: (-x[1], x[0]))[:25]
                lines = [f"- {name}: {count}" for name, count in top]
                sections.append(("عينة من عملاء المشاريع", "\n".join(lines)))

        other_rows = conn.execute(
            """
            SELECT d.title AS document_title, p.topic_title, p.text_original
            FROM passages p
            JOIN documents d ON d.id = p.document_id
            WHERE lower(d.title) NOT LIKE '%مشاريع%'
              AND lower(d.original_filename) NOT LIKE '%مشاريع%'
              AND lower(d.title) NOT LIKE '%itb.com.sa%'
              AND lower(d.original_filename) NOT LIKE '%website%'
              AND lower(d.title) NOT LIKE '%تعريف%'
            ORDER BY length(p.text_original) DESC
            LIMIT 30
            """
        ).fetchall()
        if other_rows:
            chunks = []
            for row in other_rows:
                text = (row["text_original"] or "").strip()
                if len(text) >= 80:
                    title = row["topic_title"] or row["document_title"] or "Document"
                    chunks.append(f"### {title}\n{text[:1200]}")
            if chunks:
                sections.append(("مستندات معرفية إضافية", "\n\n".join(chunks)))

    return sections


def rebuild_master_context(*, force: bool = False) -> str:
    """Build master knowledge text from company facts + indexed passages."""
    path = master_context_path()
    if path.is_file() and not force:
        return path.read_text(encoding="utf-8")

    facts = load_company_facts()
    parts = [
        "APCA SmartHelp — Master Knowledge Base for Information Belt (ITB / حزام المعلومات)",
        _identity_block(facts),
    ]
    for heading, body in _fetch_passage_sections():
        parts.append(f"\n=== {heading} ===\n{body}")

    text = "\n\n".join(parts).strip()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")

    global _MEMORY_CACHE
    _MEMORY_CACHE = (time.time(), text)
    return text


def get_master_context(*, max_chars: Optional[int] = None) -> str:
    global _MEMORY_CACHE
    settings = load_settings()
    limit = max_chars or int(settings.get("ollama", {}).get("master_context_max_chars", 28000))
    path = master_context_path()

    if _MEMORY_CACHE and time.time() - _MEMORY_CACHE[0] < _MEMORY_TTL_SECONDS:
        text = _MEMORY_CACHE[1]
    elif path.is_file():
        text = path.read_text(encoding="utf-8")
        _MEMORY_CACHE = (time.time(), text)
    else:
        text = rebuild_master_context()

    if len(text) > limit:
        return text[:limit] + "\n\n...[context truncated for model limit]"
    return text


def invalidate_master_context_cache() -> None:
    global _MEMORY_CACHE
    _MEMORY_CACHE = None
