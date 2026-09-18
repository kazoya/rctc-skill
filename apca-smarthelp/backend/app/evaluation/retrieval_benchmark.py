"""Retrieval-only benchmark (no LLM generation)."""

from __future__ import annotations

import argparse
import csv
import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

from backend.app.evaluation.benchmark_configs import apply_benchmark_config
from backend.app.services.search.hybrid import hybrid_search

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATASET = ROOT / "data" / "evaluation" / "itb_retrieval_golden.jsonl"
DEFAULT_RESULTS = ROOT / "data" / "evaluation" / "results"


@dataclass
class BenchmarkRow:
    id: str
    question_ar: str
    split: str
    question_type: str
    expected_document_ids: list[str]
    expected_pages: list[int]
    forbidden_document_ids: list[str]


def load_dataset(path: Path, *, split: Optional[str] = None) -> list[BenchmarkRow]:
    rows: list[BenchmarkRow] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        item = json.loads(line)
        if split and item.get("split") != split:
            continue
        rows.append(
            BenchmarkRow(
                id=item["id"],
                question_ar=item["question_ar"],
                split=item.get("split", "dev"),
                question_type=item.get("question_type", "project"),
                expected_document_ids=list(item.get("expected_document_ids") or []),
                expected_pages=[int(p) for p in item.get("expected_pages") or []],
                forbidden_document_ids=list(item.get("forbidden_document_ids") or []),
            )
        )
    return rows


def _hit_page(hit) -> Optional[int]:
    return hit.page_from if hit.page_from is not None else hit.page_to


def _recall_at_k(expected_docs: list[str], hits, k: int) -> float:
    if not expected_docs:
        return 0.0
    top_docs = {h.document_id for h in hits[:k]}
    return 1.0 if any(doc in top_docs for doc in expected_docs) else 0.0


def _page_hit_at_k(expected_pages: list[int], hits, k: int) -> float:
    if not expected_pages:
        return 0.0
    pages = {_hit_page(h) for h in hits[:k]}
    return 1.0 if any(p in pages for p in expected_pages if p is not None) else 0.0


def _mrr_at_k(expected_docs: list[str], hits, k: int) -> float:
    if not expected_docs:
        return 0.0
    for idx, hit in enumerate(hits[:k], start=1):
        if hit.document_id in expected_docs:
            return 1.0 / idx
    return 0.0


def run_benchmark(
    dataset_path: Path,
    *,
    config_name: str,
    split: Optional[str] = None,
    top_k: int = 10,
) -> dict[str, Any]:
    rows = load_dataset(dataset_path, split=split)
    latencies: list[float] = []
    failures: list[dict[str, Any]] = []

    recall1 = recall3 = recall5 = mrr10 = doc1 = page1 = page3 = 0.0
    false_positive = 0
    out_of_scope = 0

    with apply_benchmark_config(config_name):
        for row in rows:
            started = time.perf_counter()
            response = hybrid_search(row.question_ar, top_k=top_k, return_all=True, include_trace=True)
            elapsed_ms = (time.perf_counter() - started) * 1000.0
            latencies.append(elapsed_ms)
            hits = response.results

            is_oos = row.question_type == "out_of_scope"
            if is_oos:
                out_of_scope += 1
                if hits and hits[0].final_score >= 0.45:
                    false_positive += 1
                continue

            recall1 += _recall_at_k(row.expected_document_ids, hits, 1)
            recall3 += _recall_at_k(row.expected_document_ids, hits, 3)
            recall5 += _recall_at_k(row.expected_document_ids, hits, 5)
            mrr10 += _mrr_at_k(row.expected_document_ids, hits, 10)
            doc1 += _recall_at_k(row.expected_document_ids, hits, 1)
            page1 += _page_hit_at_k(row.expected_pages, hits, 1)
            page3 += _page_hit_at_k(row.expected_pages, hits, 3)

            ok_doc = _recall_at_k(row.expected_document_ids, hits, 5) == 1.0
            ok_page = not row.expected_pages or _page_hit_at_k(row.expected_pages, hits, 5) == 1.0
            forbidden = any(h.document_id in row.forbidden_document_ids for h in hits[:3])
            if not ok_doc or not ok_page or forbidden:
                failures.append(
                    {
                        "id": row.id,
                        "question": row.question_ar,
                        "expected_document_ids": row.expected_document_ids,
                        "expected_pages": row.expected_pages,
                        "returned": [
                            {
                                "document_id": h.document_id,
                                "page_from": h.page_from,
                                "final_score": h.final_score,
                                "passage_id": h.passage_id,
                            }
                            for h in hits[:5]
                        ],
                        "retrieval_strategy": (
                            response.retrieval_trace.retrieval_strategy
                            if response.retrieval_trace
                            else None
                        ),
                    }
                )

    n = len(rows)
    scoped = max(1, n - out_of_scope)
    latencies_sorted = sorted(latencies)
    p50 = latencies_sorted[len(latencies_sorted) // 2] if latencies_sorted else 0.0
    p95 = latencies_sorted[int(len(latencies_sorted) * 0.95) - 1] if latencies_sorted else 0.0

    return {
        "config": config_name,
        "dataset": str(dataset_path),
        "split": split or "all",
        "question_count": n,
        "recall_at_1": round(recall1 / scoped, 4),
        "recall_at_3": round(recall3 / scoped, 4),
        "recall_at_5": round(recall5 / scoped, 4),
        "mrr_at_10": round(mrr10 / scoped, 4),
        "correct_document_at_1": round(doc1 / scoped, 4),
        "correct_page_at_1": round(page1 / scoped, 4),
        "correct_page_at_3": round(page3 / scoped, 4),
        "out_of_scope_false_positive_rate": round(false_positive / max(1, out_of_scope), 4),
        "p50_latency_ms": round(p50, 2),
        "p95_latency_ms": round(p95, 2),
        "peak_rss_mb": 0.0,
        "failures": failures,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run retrieval benchmark without LLM")
    parser.add_argument("--dataset", default=str(DEFAULT_DATASET))
    parser.add_argument("--config", default="baseline_minilm_rrf")
    parser.add_argument("--split", choices=["dev", "holdout"], default=None)
    parser.add_argument("--output", default="")
    args = parser.parse_args(argv)

    dataset_path = Path(args.dataset)
    result = run_benchmark(dataset_path, config_name=args.config, split=args.split)

    out_dir = DEFAULT_RESULTS
    out_dir.mkdir(parents=True, exist_ok=True)
    out_json = Path(args.output) if args.output else out_dir / f"{args.config}.json"
    failures = result.pop("failures")
    out_json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    csv_path = out_json.with_suffix(".failures.csv")
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["id", "question", "expected_document_ids", "expected_pages", "returned", "retrieval_strategy"],
        )
        writer.writeheader()
        for row in failures:
            writer.writerow(
                {
                    "id": row["id"],
                    "question": row["question"],
                    "expected_document_ids": json.dumps(row["expected_document_ids"], ensure_ascii=False),
                    "expected_pages": json.dumps(row["expected_pages"]),
                    "returned": json.dumps(row["returned"], ensure_ascii=False),
                    "retrieval_strategy": row.get("retrieval_strategy"),
                }
            )

    print(json.dumps(result, ensure_ascii=False, indent=2))
    print(f"Failures CSV: {csv_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
