#!/usr/bin/env python3
"""Run investor inquiry catalog against /api/ask and report demo readiness."""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "backend" / "data" / "investor_inquiry_catalog.json"
FAIL_MARKERS = ("لم أجد إجابة", "could not find enough information", "insufficient")


def ask(base_url: str, question: str, timeout: float) -> dict:
    payload = json.dumps(
        {"question": question, "mode": "ask", "tone": "formal", "verbosity": "short"},
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{base_url.rstrip('/')}/api/ask",
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def is_pass(answer: str) -> bool:
    text = (answer or "").strip()
    if not text:
        return False
    lower = text.lower()
    return not any(m.lower() in lower for m in FAIL_MARKERS)


def main() -> int:
    parser = argparse.ArgumentParser(description="ITB investor QA suite")
    parser.add_argument("--url", default="http://127.0.0.1:8798")
    parser.add_argument("--timeout", type=float, default=25.0)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    results: list[dict] = []
    passed = 0
    failed = 0
    errors = 0
    t0 = time.time()

    for cat in catalog.get("categories", []):
        cat_id = cat.get("id", "?")
        for question in cat.get("questions", []):
            entry = {
                "category": cat_id,
                "question": question,
                "status": "error",
                "answer": "",
                "explanation": "",
                "error": "",
            }
            try:
                data = ask(args.url, question, args.timeout)
                answer = str(data.get("answer") or "")
                evidence = data.get("evidence") or []
                explanation = ""
                if evidence:
                    explanation = str(evidence[0].get("explanation") or "")
                entry["answer"] = answer[:240]
                entry["explanation"] = explanation
                if is_pass(answer):
                    entry["status"] = "pass"
                    passed += 1
                else:
                    entry["status"] = "fail"
                    failed += 1
            except Exception as exc:
                entry["error"] = str(exc)[:300]
                errors += 1
            results.append(entry)

    total = passed + failed + errors
    summary = {
        "total": total,
        "passed": passed,
        "failed": failed,
        "errors": errors,
        "pass_rate": round(100 * passed / total, 1) if total else 0,
        "elapsed_seconds": round(time.time() - t0, 1),
        "demo_ready": failed == 0 and errors == 0 and passed >= 50,
    }

    if args.json:
        print(json.dumps({"summary": summary, "results": results}, ensure_ascii=False, indent=2))
    else:
        print("=== ITB Investor QA Suite ===")
        print(
            f"Total: {summary['total']} | Pass: {passed} | Fail: {failed} | "
            f"Errors: {errors} | Rate: {summary['pass_rate']}% | "
            f"Demo ready: {'YES' if summary['demo_ready'] else 'NO'}"
        )
        print()
        for r in results:
            mark = {"pass": "OK", "fail": "FAIL", "error": "ERR"}[r["status"]]
            print(f"[{mark}] ({r['category']}) {r['question']}")
            if r["status"] == "pass":
                print(f"      → {r['answer'][:120]}...")
            elif r["error"]:
                print(f"      !! {r['error']}")
            else:
                print(f"      → {r['answer'][:120]}")
        print()

    return 0 if summary["demo_ready"] else 1


if __name__ == "__main__":
    sys.exit(main())
