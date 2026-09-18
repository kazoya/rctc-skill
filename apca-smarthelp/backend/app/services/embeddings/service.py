from __future__ import annotations

from typing import Optional

import numpy as np

from backend.app.core.config import load_settings
from backend.app.db.database import connect
from backend.app.services.embeddings.vector_index import get_vector_index, reset_vector_index_cache

_MODEL = None
_MODEL_NAME: Optional[str] = None
_MODEL_ERROR: Optional[str] = None


def embedding_available() -> bool:
    try:
        get_model()
        return True
    except Exception:
        return False


def get_model():
    global _MODEL, _MODEL_NAME, _MODEL_ERROR
    settings = load_settings()
    name = settings["embedding"]["model_name"]
    if _MODEL is not None and _MODEL_NAME == name:
        return _MODEL
    try:
        from sentence_transformers import SentenceTransformer

        cache = settings["embedding"].get("cache_folder")
        device = settings["embedding"].get("device", "cpu")
        _MODEL = SentenceTransformer(name, cache_folder=cache, device=device)
        _MODEL_NAME = name
        _MODEL_ERROR = None
        return _MODEL
    except Exception as e:
        _MODEL = None
        _MODEL_NAME = None
        _MODEL_ERROR = str(e)
        raise


def encode_document(texts: list[str]) -> np.ndarray:
    settings = load_settings()
    model = get_model()
    vectors = model.encode(
        texts,
        batch_size=int(settings["embedding"].get("batch_size", 16)),
        show_progress_bar=False,
        normalize_embeddings=bool(settings["embedding"].get("normalize", True)),
    )
    return np.asarray(vectors, dtype=np.float32)


def encode_query(text: str) -> np.ndarray:
    settings = load_settings()
    model = get_model()
    vector = model.encode(
        [text],
        batch_size=1,
        show_progress_bar=False,
        normalize_embeddings=bool(settings["embedding"].get("normalize", True)),
    )
    return np.asarray(vector[0], dtype=np.float32)


def embed_document_passages(document_id: str) -> None:
    settings = load_settings()
    model_name = settings["embedding"]["model_name"]
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, text_search_normalized FROM passages WHERE document_id=? ORDER BY rowid",
            (document_id,),
        ).fetchall()
    if not rows:
        return

    texts = [r["text_search_normalized"] for r in rows]
    vectors = encode_document(texts)
    dim = int(vectors.shape[1])
    index = get_vector_index(dim=dim)

    # If removing old vectors for this doc, clear+rebuild whole index is heavy;
    # for MVP we append and rely on DB as source of truth for membership.
    for row, vec in zip(rows, vectors):
        index.add(row["id"], document_id, vec)
    index.save()

    with connect() as conn:
        conn.execute(
            """UPDATE passages SET embedding_status='ready', embedding_model=?, embedding_dim=?
               WHERE document_id=?""",
            (model_name, dim, document_id),
        )


def reembed_all() -> None:
    reset_vector_index_cache()
    settings = load_settings()
    vectors_dir = __import__("pathlib").Path(settings["_data_dir"]) / "vectors"
    for p in vectors_dir.glob("*"):
        if p.is_file():
            p.unlink(missing_ok=True)
    with connect() as conn:
        docs = [r["id"] for r in conn.execute("SELECT id FROM documents").fetchall()]
        conn.execute("UPDATE passages SET embedding_status='pending'")
    for doc_id in docs:
        embed_document_passages(doc_id)
