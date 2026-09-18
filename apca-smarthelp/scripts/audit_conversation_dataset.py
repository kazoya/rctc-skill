"""Audit split coverage, duplicates, conflicts, and cross-split leakage."""

from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.conversation.router import route_message
DATASET = ROOT / "backend" / "data" / "evaluation" / "arabic_conversation_golden.jsonl"
OUTPUT = ROOT / "backend" / "data" / "evaluation" / "results" / "dataset_audit.json"


def normalize_arabic(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).strip().lower()
    value = re.sub(r"[\u064b-\u065f\u0670\u0640]", "", value)
    value = value.translate(str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ؤ": "و", "ئ": "ي", "ة": "ه", "ى": "ي"}))
    return re.sub(r"\s+", " ", value)


def main() -> int:
    rows = [json.loads(line) for line in DATASET.read_text(encoding="utf-8").splitlines() if line.strip()]
    by_text: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        by_text[normalize_arabic(row["input"])].append(row)

    duplicates = {key: [r["id"] for r in group] for key, group in by_text.items() if len(group) > 1}
    conflicts = {
        key: sorted({r["expected_intent"] for r in group})
        for key, group in by_text.items()
        if len({r["expected_intent"] for r in group}) > 1
    }
    leakage = {
        key: sorted({r["split"] for r in group})
        for key, group in by_text.items()
        if len({r["split"] for r in group}) > 1
    }
    split_intents: dict[str, Counter] = defaultdict(Counter)
    for row in rows:
        split_intents[row["split"]][row["expected_intent"]] += 1

    unique_confusion: Counter = Counter()
    unique_failures: list[dict[str, str]] = []
    for normalized_input, group in by_text.items():
        representative = group[0]
        expected = representative["expected_intent"]
        predicted = route_message(representative["input"]).intent
        unique_confusion[(expected, predicted)] += 1
        if expected != predicted:
            unique_failures.append(
                {
                    "normalized_input": normalized_input,
                    "expected_intent": expected,
                    "predicted_intent": predicted,
                }
            )

    report = {
        "row_count": len(rows),
        "unique_normalized_inputs": len(by_text),
        "duplicate_input_count": len(duplicates),
        "conflicting_label_count": len(conflicts),
        "cross_split_leakage_count": len(leakage),
        "split_intent_counts": {split: dict(counts) for split, counts in split_intents.items()},
        "unique_intent_accuracy": round(
            sum(count for (expected, predicted), count in unique_confusion.items() if expected == predicted)
            / max(1, len(by_text)),
            4,
        ),
        "unique_confusion_matrix": [
            {"expected": expected, "predicted": predicted, "count": count}
            for (expected, predicted), count in sorted(unique_confusion.items())
        ],
        "unique_failures": unique_failures,
        "duplicates": duplicates,
        "conflicts": conflicts,
        "cross_split_leakage": leakage,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if not isinstance(v, dict) or k == "split_intent_counts"}, ensure_ascii=False, indent=2))
    print(f"Audit: {OUTPUT}")
    return 1 if conflicts or leakage else 0


if __name__ == "__main__":
    raise SystemExit(main())
