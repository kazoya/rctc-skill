"""CLI: trace retrieval for a single question."""

from __future__ import annotations

import argparse
import json
import sys

from backend.app.services.search.hybrid import hybrid_search


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Trace hybrid retrieval for one question")
    parser.add_argument("--question", required=True, help="Arabic/English question")
    parser.add_argument("--top-k", type=int, default=10)
    args = parser.parse_args(argv)

    response = hybrid_search(args.question, top_k=args.top_k, return_all=True, include_trace=True)
    payload = {
        "query": response.query,
        "action": response.action,
        "results": [hit.model_dump() for hit in response.results],
        "retrieval_trace": response.retrieval_trace.model_dump() if response.retrieval_trace else None,
    }
    sys.stdout.write(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
