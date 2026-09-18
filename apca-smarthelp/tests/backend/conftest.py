from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture(autouse=True)
def isolated_db(tmp_path, monkeypatch):
    data = tmp_path / "data"
    data.mkdir()
    for name in ("pdfs", "vectors", "packages", "topics", "tmp"):
        (data / name).mkdir()

    monkeypatch.setenv("APCA_DATA_DIR", str(data))

    from backend.app.core.config import load_settings
    from backend.app.db.database import init_db
    from backend.app.services.embeddings import vector_index

    load_settings.cache_clear()
    vector_index.reset_vector_index_cache()
    settings = load_settings()
    settings["ollama"] = {**settings["ollama"], "enabled": False}
    init_db()
    yield settings
    load_settings.cache_clear()
    vector_index.reset_vector_index_cache()
