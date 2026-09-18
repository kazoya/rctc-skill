from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

# backend/app/core/config.py -> parents[3] == repo root
ROOT = Path(__file__).resolve().parents[3]
SETTINGS_PATH = ROOT / "backend" / "config" / "settings.json"


def _deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    out = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = _deep_merge(out[key], value)
        else:
            out[key] = value
    return out


@lru_cache(maxsize=1)
def load_settings() -> dict[str, Any]:
    with SETTINGS_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    override = os.environ.get("APCA_DATA_DIR")
    if override:
        data_dir = Path(override).resolve()
    else:
        data_dir = (ROOT / data.get("data_dir", "backend/data")).resolve()
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "pdfs").mkdir(exist_ok=True)
    (data_dir / "vectors").mkdir(exist_ok=True)
    (data_dir / "packages").mkdir(exist_ok=True)
    (data_dir / "topics").mkdir(exist_ok=True)
    (data_dir / "tmp").mkdir(exist_ok=True)
    cache = data.get("embedding", {}).get("cache_folder", "backend/data/models")
    (ROOT / cache).mkdir(parents=True, exist_ok=True)
    data["_root"] = str(ROOT)
    data["_data_dir"] = str(data_dir)
    data["_db_path"] = str(data_dir / "knowledge.sqlite")

    openai_cfg = data.get("openai")
    if isinstance(openai_cfg, dict):
        has_key = bool(os.environ.get("OPENAI_API_KEY", "").strip())
        if openai_cfg.get("enabled") and not has_key:
            data["openai"] = {**openai_cfg, "enabled": False}

    return data


def save_settings(updates: dict[str, Any]) -> dict[str, Any]:
    current = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
    merged = _deep_merge(current, updates)
    SETTINGS_PATH.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    load_settings.cache_clear()
    return load_settings()


def get_copyright_block() -> dict[str, str]:
    settings = load_settings()
    return settings["copyright"]
