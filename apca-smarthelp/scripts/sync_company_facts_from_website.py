#!/usr/bin/env python3
"""Pull public facts from itb.com.sa into company_facts.json (best-effort)."""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]
FACTS_PATH = ROOT / "backend" / "data" / "company_facts.json"

URLS = [
    "https://itb.com.sa/Defaultar.aspx",
    "https://www.itb.com.sa/Defaultar.aspx",
    "https://itb.com.sa/Aboutar.aspx",
    "https://itb.com.sa/Contactar.aspx",
]

PATTERNS: list[tuple[str, str]] = [
    ("commercial_registration", r"(?:السجل\s*التجاري|CR\s*No\.?|Commercial\s*Registration)[^\d]{0,24}(\d{8,12})"),
    ("unified_number", r"(?:الرقم\s*الموحد|Unified\s*(?:Number|No\.?))[^\d]{0,24}(\d{10,15})"),
    ("establishment_membership_number", r"(?:عضوية\s*المنشأة|Establishment\s*Membership)[^\d]{0,24}(\d{5,12})"),
    ("ceo_name_ar", r"(?:المدير\s*العام|رئيس\s*تنفيذي)\s*[:：]?\s*([\u0600-\u06FF][\u0600-\u06FF\s]{4,40})"),
    ("ceo_name_en", r"(?:CEO|Managing\s*Director)\s*[:：]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})"),
]


def strip_html(raw: str) -> str:
    raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", raw)
    return html.unescape(re.sub(r"\s+", " ", text))


def main() -> int:
    facts: dict = {}
    if FACTS_PATH.is_file():
        facts = json.loads(FACTS_PATH.read_text(encoding="utf-8"))

    combined = ""
    headers = {"User-Agent": "Belt-SmartHelp-FactsSync/1.0", "Accept-Language": "ar,en"}
    with httpx.Client(headers=headers, timeout=30.0, follow_redirects=True) as client:
        for url in URLS:
            try:
                resp = client.get(url)
                if resp.status_code == 200:
                    combined += "\n" + strip_html(resp.text)
                    print(f"OK  {url} ({len(resp.text)} bytes)")
            except Exception as exc:
                print(f"WARN {url}: {exc}", file=sys.stderr)

    found = 0
    for key, pattern in PATTERNS:
        if str(facts.get(key) or "").strip():
            continue
        m = re.search(pattern, combined, re.I)
        if m:
            val = m.group(1).strip()
            facts[key] = val
            found += 1
            print(f"SET {key} = {val}")

    if found == 0:
        print("No new registration/leadership fields found on public pages.")

    # Always refresh contact block from known public footer if missing
    if not str(facts.get("phone") or "").strip():
        facts["phone"] = "+966 11 215 0044"
    if not str(facts.get("email") or "").strip():
        facts["email"] = "info@itb.com.sa"
    if not str(facts.get("website") or "").strip():
        facts["website"] = "https://www.itb.com.sa"

    facts["website_synced_at"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    FACTS_PATH.write_text(json.dumps(facts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {FACTS_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
