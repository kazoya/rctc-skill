"""Named benchmark profiles — override settings without changing production defaults."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterator
from unittest.mock import patch

from backend.app.core.config import SETTINGS_PATH, _deep_merge, load_settings

# Each profile merges onto backend/config/settings.json for the benchmark run only.
BENCHMARK_CONFIGS: dict[str, dict[str, Any]] = {
    "baseline_minilm_rrf": {},
    "baseline_minilm_rrf_holdout": {},
    "minilm_rrf_bge_reranker": {
        "reranker": {
            "enabled": True,
            "answer_top_k": 10,
            "timeout_seconds": 20,
            "batch_size": 8,
        },
    },
    "minilm_rrf_bge_reranker_holdout": {
        "reranker": {
            "enabled": True,
            "answer_top_k": 10,
            "timeout_seconds": 20,
            "batch_size": 8,
        },
    },
}


def _build_settings(overrides: dict[str, Any]) -> dict[str, Any]:
    """Mirror load_settings() post-processing with optional overrides."""
    import json
    import os
    from pathlib import Path

    with SETTINGS_PATH.open(encoding="utf-8") as handle:
        data = json.load(handle)
    data = _deep_merge(data, overrides)

    root = SETTINGS_PATH.resolve().parents[2]
    override_dir = os.environ.get("APCA_DATA_DIR")
    if override_dir:
        data_dir = Path(override_dir).resolve()
    else:
        data_dir = (root / data.get("data_dir", "backend/data")).resolve()
    data["_root"] = str(root)
    data["_data_dir"] = str(data_dir)
    data["_db_path"] = str(data_dir / "knowledge.sqlite")

    openai_cfg = data.get("openai")
    if isinstance(openai_cfg, dict):
        has_key = bool(os.environ.get("OPENAI_API_KEY", "").strip())
        if openai_cfg.get("enabled") and not has_key:
            data["openai"] = {**openai_cfg, "enabled": False}

    return data


@contextmanager
def apply_benchmark_config(config_name: str) -> Iterator[None]:
    overrides = BENCHMARK_CONFIGS.get(config_name, {})
    if not overrides:
        yield
        return

    patched_settings = _build_settings(overrides)

    def _patched_load() -> dict[str, Any]:
        return patched_settings

    with patch("backend.app.core.config.load_settings", _patched_load):
        with patch("backend.app.services.search.hybrid.load_settings", _patched_load):
            with patch("backend.app.services.search.reranker.load_settings", _patched_load):
                load_settings.cache_clear()
                try:
                    yield
                finally:
                    load_settings.cache_clear()
