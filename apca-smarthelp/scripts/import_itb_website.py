#!/usr/bin/env python3
"""Fetch public Arabic pages from itb.com.sa and import them into SmartHelp."""
from __future__ import annotations

import html
import re
import sys
from datetime import date
from pathlib import Path

import fitz
import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.db.database import init_db  # noqa: E402
from backend.app.services.embeddings.service import embed_document_passages  # noqa: E402
from backend.app.services.ingestion.importer import import_pdf  # noqa: E402

OUTPUT_DIR = ROOT.parent / "embeddings" / "pdf"
OUTPUT_NAME = f"ITB_Website_Knowledge_ar_{date.today().isoformat()}.pdf"

PAGES: list[tuple[str, str]] = [
    ("https://itb.com.sa/Defaultar.aspx", "الصفحة الرئيسية"),
    ("https://itb.com.sa/CybersecurityandCompliancear.html", "الأمن السيبراني والامتثال"),
    ("https://itb.com.sa/Cloudar.html", "الحوسبة السحابية"),
    ("https://itb.com.sa/ELVar.html", "الأمن المادي"),
    ("https://itb.com.sa/AdvancedInfrastructurear.html", "البنية التحتية المتقدمة"),
]

CURATED_INTRO = """
مزايا شركة حزام المعلومات (IT Belt - ITB)
المصدر: https://itb.com.sa

لماذا نحن؟
- شركة سعودية تأسست عام 2008 ومقرها الرياض.
- أكثر من 15 سنة خدمة في المملكة العربية السعودية.
- أكثر من 20 مزوداً تقنياً، العديد منهم مصنفون بلاتينيوم أو ذهبي.
- أكثر من 80 عميلاً في أنحاء المملكة.
- تخدم أكثر من 8 قطاعات صناعية.
- قاعدة عملاء واسعة في السعودية ودول مجلس التعاون الخليجي.
- فريق استشاري معتمد لدى ISC2 وSANS وBSI وISACA وCisco وCheck Point وTrend Micro وPalo Alto وIBM وRSA وMicrosoft.
- شهادات فريق العمل تشمل CISSP وCISA وCCNP وCCIE وCCSP وMCSE وغيرها.
- حلول أمن سيبراني وبنية تحتية وفق معايير NCA والجهات التنظيمية.
- دعم فني واستشارات على مدار 24 ساعة طوال أيام الأسبوع.

الخدمات الرئيسية:
- الأمن السيبراني والامتثال.
- الحوسبة السحابية والسحابات السيادية.
- التحول الرقمي وإعادة هندسة العمليات.
- تخطيط موارد المؤسسة (ERP) مع الامتثال لأنظمة ZATCA.
- الأمن المادي والبنية التحتية المتقدمة وإنترنت الأشياء.

الرسالة:
وضع حلول تكنولوجيا معلومات متطورة وإدارة مشاريع احترافية لتحسين الأداء ونجاح المشاريع الاستراتيجية.

الرؤية:
تقديم خدمات مبتكرة عالية الجودة ذات قيمة مضافة مع الحفاظ على موقع قيادي إقليمياً وعالمياً.

شهادات المنظمة (ISO):
ISO 9001:2015، ISO 22301:2019، ISO/IEC 20000-1:2018، ISO/IEC 27001:2022، CMMI، ITIL.

للتواصل:
info@itb.com.sa | +966 11 215 0044 | www.itb.com.sa
Olaya Street, Riyadh 12572, Saudi Arabia
""".strip()


def strip_html(raw: str) -> str:
    raw = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<br\s*/?>", "\n", raw, flags=re.I)
    raw = re.sub(r"</(p|div|h\d|li|section|article|tr)>", "\n", raw, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", raw)
    text = html.unescape(text)
    text = text.replace("\xa0", " ")
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    lines = [line for line in lines if line and len(line) > 2]
    # Drop obvious boilerplate / form labels
    drop = {"check email format", "check mobile format", "please enter valid email", "إقرأ المزيد"}
    lines = [line for line in lines if line.lower() not in drop]
    return "\n".join(lines)


def fetch_page(client: httpx.Client, url: str) -> str:
    response = client.get(url, timeout=30.0, follow_redirects=True)
    response.raise_for_status()
    return strip_html(response.text)


def build_pdf(sections: list[tuple[str, str]], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc = fitz.open()
    for title, body in sections:
        page = doc.new_page(width=595, height=842)
        y = 48
        page.insert_text((48, y), title, fontsize=14)
        y += 22
        rect = fitz.Rect(48, y, 547, 790)
        page.insert_textbox(rect, body, fontsize=10.5, align=0)
    doc.save(out_path)
    doc.close()


def main() -> int:
    init_db()
    sections: list[tuple[str, str]] = [("مزايا شركة حزام المعلومات", CURATED_INTRO)]
    headers = {
        "User-Agent": "Belt-SmartHelp-KnowledgeBot/1.0 (+internal; itb.com.sa public pages)",
        "Accept-Language": "ar,en;q=0.8",
    }
    with httpx.Client(headers=headers) as client:
        for url, label in PAGES:
            try:
                text = fetch_page(client, url)
                if len(text) < 120:
                    print(f"WARN short page {url}", file=sys.stderr)
                    continue
                sections.append((f"{label} — {url}", text[:12000]))
                print(f"OK  fetched {label} ({len(text)} chars)")
            except Exception as error:
                print(f"ERR fetch {url}: {error}", file=sys.stderr)

    out_path = OUTPUT_DIR / OUTPUT_NAME
    build_pdf(sections, out_path)
    print(f"PDF  {out_path}")

    doc_id = import_pdf(
        source_path=out_path,
        original_filename=out_path.name,
        title="موقع شركة حزام المعلومات (itb.com.sa)",
        language="ar",
        user_notes="Auto-imported from public pages on itb.com.sa",
    )
    embed_document_passages(doc_id)
    print(f"DONE document_id={doc_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
