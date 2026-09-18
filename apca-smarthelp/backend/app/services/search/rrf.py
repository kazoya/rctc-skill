"""Reciprocal Rank Fusion for hybrid retrieval."""

from __future__ import annotations


def rrf_score(rank: int, k: int = 60) -> float:
    return 1.0 / (k + rank)


def rrf_fuse(
    rank_maps: dict[str, dict[str, int]],
    *,
    weights: dict[str, float] | None = None,
    k: int = 60,
) -> dict[str, float]:
    """Combine ranked lists from multiple retrieval channels."""
    weights = weights or {}
    scores: dict[str, float] = {}
    for channel, ranks in rank_maps.items():
        weight = float(weights.get(channel, 1.0))
        for passage_id, rank in ranks.items():
            scores[passage_id] = scores.get(passage_id, 0.0) + weight * rrf_score(rank, k)
    return scores


def ranks_from_scores(scores: dict[str, float]) -> dict[str, int]:
    ordered = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return {pid: idx + 1 for idx, (pid, _) in enumerate(ordered)}
