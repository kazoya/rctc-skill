from pathlib import Path

import fitz

from backend.app.services.ingestion.chunking import build_topics_and_passages
from backend.app.services.ingestion.pdf_extract import canonicalize_pdf_text, detect_heading, extract_pdf_pages
from backend.app.services.ingestion.pdf_extract import TextBlock


def _make_sample_pdf(path: Path) -> None:
    doc = fitz.open()
    page = doc.new_page()
    # Larger text as heading
    page.insert_text((72, 72), "1. Holiday Entitlement", fontsize=18)
    page.insert_text((72, 110), "Employees receive annual leave according to seniority rules.", fontsize=11)
    page.insert_text((72, 140), "ORA-04036 may appear when PGA memory is exhausted.", fontsize=11)
    page2 = doc.new_page()
    page2.insert_text((72, 72), "1.1 Absence reasons", fontsize=14)
    page2.insert_text((72, 110), "Configure holiday, sickness and free time compensation.", fontsize=11)
    # mostly empty page to simulate scanned-like low text
    page3 = doc.new_page()
    page3.insert_text((72, 72), "x", fontsize=8)
    doc.save(path)
    doc.close()


def test_pdf_extraction_heading_chunking_and_scanned(tmp_path):
    pdf = tmp_path / "sample.pdf"
    _make_sample_pdf(pdf)
    pages, meta = extract_pdf_pages(str(pdf))
    assert meta["page_count"] == 3
    assert pages[0].char_count > 20
    assert pages[2].likely_scanned is True

    block = TextBlock(1, 0, "1. Holiday Entitlement", 0, 0, 100, 20, 18, True)
    assert detect_heading(block, median_size=11.0)

    topics = build_topics_and_passages(pages)
    assert topics
    assert any("Holiday" in t.title or "Holiday" in t.body_text for t in topics)
    assert all(p.text_original for t in topics for p in t.passages)
    # original text kept; normalized separate
    for t in topics:
        for p in t.passages:
            assert p.text_search_normalized
            assert p.page_from >= 1


def test_arabic_presentation_forms_are_canonicalized():
    assert canonicalize_pdf_text("ﻧﻄﺎق اﻟﺨﺪﻣﺎت") == "نطاق الخدمات"
