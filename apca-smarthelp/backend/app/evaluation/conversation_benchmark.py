"""Conversation routing benchmark and failure analysis."""

from __future__ import annotations

import argparse
import csv
import json
import time
from pathlib import Path
from typing import Any, Optional

from backend.app.conversation.router import route_message
from backend.app.conversation.orchestrator import try_conversation_answer

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATASET = ROOT / "data" / "evaluation" / "arabic_conversation_golden.jsonl"
RESULTS = ROOT / "data" / "evaluation" / "results"


def load_rows(path: Path, split: Optional[str] = None) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        item = json.loads(line)
        if split and item.get("split") != split:
            continue
        rows.append(item)
    return rows


def classify_failure(row: dict[str, Any], predicted_intent: str, response: Optional[dict]) -> tuple[str, str, str]:
    expected = row.get("expected_intent", "")
    if predicted_intent != expected:
        return "intent_routing_failure", f"predicted {predicted_intent} != expected {expected}", "extend router patterns or topic card"

    if row.get("requires_retrieval") and response:
        conv = response.get("conversation") or {}
        if conv.get("status") == "out_of_scope":
            return "intent_routing_failure", "routed out_of_scope for retrieval question", "router"
        docs = row.get("expected_document_ids") or []
        evidence = response.get("evidence") or []
        if docs and evidence:
            got = evidence[0].get("document_id")
            if got not in docs and got not in {"company-facts", "conversation"}:
                return "retrieval_failure", f"wrong document {got}", "retrieval/reranker"
    if row.get("expected_intent") == "out_of_scope" and response:
        answer = str(response.get("answer", ""))
        for bad in row.get("must_not_claim") or []:
            if bad.lower() in answer.lower():
                return "generation_failure", f"claimed forbidden token {bad}", "out_of_scope handler"
    return "", "", ""


def run_router_benchmark(dataset: Path, split: Optional[str]) -> dict[str, Any]:
    rows = load_rows(dataset, split=split)
    correct = 0
    greeting_correct = 0
    greeting_total = 0
    failures: list[dict[str, Any]] = []
    latencies: list[float] = []

    for row in rows:
        started = time.perf_counter()
        route = route_message(row["input"])
        elapsed = (time.perf_counter() - started) * 1000
        latencies.append(elapsed)
        predicted = route.intent
        expected = row["expected_intent"]
        if predicted == expected:
            correct += 1
        if expected in {"greeting", "social_small_talk"}:
            greeting_total += 1
            if predicted == expected:
                greeting_correct += 1

        response_dict = None
        if not row.get("requires_retrieval"):
            resp = try_conversation_answer(row["input"])
            if resp:
                response_dict = json.loads(resp.model_dump_json())

        failure_class, root_cause, proposed = classify_failure(row, predicted, response_dict)
        if predicted != expected or failure_class:
            failures.append(
                {
                    "question_id": row["id"],
                    "original_input": row["input"],
                    "expected_intent": expected,
                    "predicted_intent": predicted,
                    "expected_document": json.dumps(row.get("expected_document_ids") or []),
                    "returned_document": "",
                    "expected_page": json.dumps(row.get("expected_pages") or []),
                    "returned_page": "",
                    "failure_class": failure_class or "intent_routing_failure",
                    "root_cause": root_cause or f"intent mismatch {predicted}!={expected}",
                    "proposed_fix": proposed or "router",
                    "regression_risk": "low",
                }
            )

    n = max(1, len(rows))
    lat_sorted = sorted(latencies)
    return {
        "split": split or "all",
        "question_count": len(rows),
        "intent_accuracy": round(correct / n, 4),
        "greeting_question_count": greeting_total,
        "greeting_accuracy": round(greeting_correct / greeting_total, 4) if greeting_total else None,
        "latency_scope": "router_only_no_retrieval_no_llm",
        "router_p50_ms": round(lat_sorted[len(lat_sorted) // 2], 2),
        "router_p95_ms": round(lat_sorted[int(len(lat_sorted) * 0.95) - 1], 2),
        "failures": failures,
    }


def run_acceptance_tests() -> dict[str, Any]:
    cases = {
        "A_shako_mako": ("شاكو ماكو", "social_small_talk", False),
        "B_sho_fi": ("شو في ما في", "social_small_talk", False),
        "C_founded": ("متى تأسست الشركة؟", "company_foundation", False),
        "D_age": ("صارلهم كم سنة بالسوق؟", "company_age", False),
        "E_cyber": ("وش تسوون بالأمن السيبراني؟", "cybersecurity_services", True),
        "F_gov": ("عدكم مشاريع ويا الحكومة؟", "government_projects", True),
        "H_inference": ("هل خبرتهم تعتبر قوية؟", "supported_inference", False),
        "I_oos": ("ممكن تساعدني أغير زيت السيارة؟", "out_of_scope", False),
    }
    out: dict[str, Any] = {}
    for key, (text, intent, retrieval) in cases.items():
        started = time.perf_counter()
        route = route_message(text)
        conv = try_conversation_answer(text)
        elapsed = time.perf_counter() - started
        out[key] = {
            "intent_ok": route.intent == intent,
            "predicted_intent": route.intent,
            "dialect": route.dialect,
            "has_answer": conv is not None,
            "requires_retrieval": route.requires_retrieval,
            "retrieval_expected": retrieval,
            "elapsed_ms": round(elapsed * 1000, 2),
            "answer_preview": (conv.answer[:120] if conv else ""),
        }
        if key == "C_founded" and conv:
            out[key]["contains_2008"] = "2008" in conv.answer
        if key == "D_age" and conv:
            out[key]["contains_2008"] = "2008" in conv.answer
        if key == "I_oos" and conv:
            out[key]["no_itb_claim"] = "مشروع" not in conv.answer
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default=str(DEFAULT_DATASET))
    parser.add_argument("--split", choices=["development", "holdout"], default=None)
    parser.add_argument("--acceptance", action="store_true")
    args = parser.parse_args(argv)

    RESULTS.mkdir(parents=True, exist_ok=True)
    if args.acceptance:
        acc = run_acceptance_tests()
        out = RESULTS / "conversation_acceptance.json"
        out.write_text(json.dumps(acc, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(acc, ensure_ascii=False, indent=2))
        return 0

    result = run_router_benchmark(Path(args.dataset), split=args.split)
    failures = result.pop("failures")
    tag = args.split or "all"
    out_json = RESULTS / f"conversation_router_{tag}.json"
    out_json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    csv_path = RESULTS / f"failure_analysis_{tag}.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "question_id",
                "original_input",
                "expected_intent",
                "predicted_intent",
                "expected_document",
                "returned_document",
                "expected_page",
                "returned_page",
                "failure_class",
                "root_cause",
                "proposed_fix",
                "regression_risk",
            ],
        )
        writer.writeheader()
        writer.writerows(failures)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print(f"Failures: {csv_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
