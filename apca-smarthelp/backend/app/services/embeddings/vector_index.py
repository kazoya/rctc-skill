from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

import numpy as np

from backend.app.core.config import load_settings


class VectorIndex(ABC):
    @abstractmethod
    def add(self, passage_id: str, document_id: str, vector: np.ndarray) -> None: ...

    @abstractmethod
    def search(self, query_vector: np.ndarray, top_k: int = 20) -> list[tuple[str, float]]: ...

    @abstractmethod
    def remove_document(self, document_id: str) -> None: ...

    @abstractmethod
    def save(self) -> None: ...

    @abstractmethod
    def clear(self) -> None: ...

    @property
    @abstractmethod
    def backend_name(self) -> str: ...

    @property
    @abstractmethod
    def dimension(self) -> Optional[int]: ...


class HnswVectorIndex(VectorIndex):
    def __init__(self, dim: int, path: Path):
        import hnswlib

        self._dim = dim
        self._path = path
        self._meta_path = path.with_suffix(".meta.json")
        self._index = hnswlib.Index(space="cosine", dim=dim)
        self._ids: list[str] = []
        self._doc_map: dict[str, str] = {}
        self._initialized = False
        if path.exists() and self._meta_path.exists():
            meta = json.loads(self._meta_path.read_text(encoding="utf-8"))
            self._ids = meta.get("ids", [])
            self._doc_map = meta.get("doc_map", {})
            self._index.load_index(str(path))
            self._index.set_ef(64)
            self._initialized = True

    @property
    def backend_name(self) -> str:
        return "hnswlib"

    @property
    def dimension(self) -> Optional[int]:
        return self._dim

    def _ensure(self, capacity: int = 1000) -> None:
        if not self._initialized:
            self._index.init_index(max_elements=max(capacity, 1000), ef_construction=200, M=16)
            self._index.set_ef(64)
            self._initialized = True
        else:
            try:
                self._index.resize_index(max(self._index.get_current_count() + capacity, 1000))
            except Exception:
                pass

    def add(self, passage_id: str, document_id: str, vector: np.ndarray) -> None:
        self._ensure()
        label = len(self._ids)
        vec = vector.astype(np.float32)
        self._index.add_items(vec.reshape(1, -1), np.array([label]))
        self._ids.append(passage_id)
        self._doc_map[passage_id] = document_id

    def search(self, query_vector: np.ndarray, top_k: int = 20) -> list[tuple[str, float]]:
        if not self._initialized or not self._ids:
            return []
        k = min(top_k, len(self._ids))
        labels, distances = self._index.knn_query(query_vector.astype(np.float32).reshape(1, -1), k=k)
        out: list[tuple[str, float]] = []
        for label, dist in zip(labels[0], distances[0]):
            if label < 0 or label >= len(self._ids):
                continue
            # cosine distance -> similarity
            sim = 1.0 - float(dist)
            out.append((self._ids[int(label)], sim))
        return out

    def remove_document(self, document_id: str) -> None:
        keep_ids = [pid for pid, did in self._doc_map.items() if did != document_id]
        if len(keep_ids) == len(self._ids):
            return
        # Rebuild without deleted docs (hnswlib lacks easy delete)
        # Caller should re-add vectors; here we clear matching ids from meta and reset if empty.
        self.clear()

    def save(self) -> None:
        if not self._initialized:
            return
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._index.save_index(str(self._path))
        self._meta_path.write_text(
            json.dumps({"ids": self._ids, "doc_map": self._doc_map, "dim": self._dim}, ensure_ascii=False),
            encoding="utf-8",
        )

    def clear(self) -> None:
        import hnswlib

        self._ids = []
        self._doc_map = {}
        self._index = hnswlib.Index(space="cosine", dim=self._dim)
        self._initialized = False
        if self._path.exists():
            self._path.unlink(missing_ok=True)
        if self._meta_path.exists():
            self._meta_path.unlink(missing_ok=True)


class FaissVectorIndex(VectorIndex):
    def __init__(self, dim: int, path: Path):
        import faiss

        self._faiss = faiss
        self._dim = dim
        self._path = path
        self._meta_path = path.with_suffix(".meta.json")
        self._ids: list[str] = []
        self._doc_map: dict[str, str] = {}
        if path.exists() and self._meta_path.exists():
            meta = json.loads(self._meta_path.read_text(encoding="utf-8"))
            self._ids = meta.get("ids", [])
            self._doc_map = meta.get("doc_map", {})
            self._index = faiss.read_index(str(path))
        else:
            self._index = faiss.IndexFlatIP(dim)

    @property
    def backend_name(self) -> str:
        return "faiss"

    @property
    def dimension(self) -> Optional[int]:
        return self._dim

    def add(self, passage_id: str, document_id: str, vector: np.ndarray) -> None:
        vec = vector.astype(np.float32).reshape(1, -1)
        self._index.add(vec)
        self._ids.append(passage_id)
        self._doc_map[passage_id] = document_id

    def search(self, query_vector: np.ndarray, top_k: int = 20) -> list[tuple[str, float]]:
        if not self._ids:
            return []
        k = min(top_k, len(self._ids))
        scores, idxs = self._index.search(query_vector.astype(np.float32).reshape(1, -1), k)
        out: list[tuple[str, float]] = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx < 0 or idx >= len(self._ids):
                continue
            out.append((self._ids[int(idx)], float(score)))
        return out

    def remove_document(self, document_id: str) -> None:
        # Rebuild required; clear and rely on re-embed of remaining docs by caller if needed.
        remaining = [(pid, did) for pid, did in self._doc_map.items() if did != document_id]
        if len(remaining) == len(self._ids):
            return
        self.clear()

    def save(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._faiss.write_index(self._index, str(self._path))
        self._meta_path.write_text(
            json.dumps({"ids": self._ids, "doc_map": self._doc_map, "dim": self._dim}, ensure_ascii=False),
            encoding="utf-8",
        )

    def clear(self) -> None:
        self._ids = []
        self._doc_map = {}
        self._index = self._faiss.IndexFlatIP(self._dim)
        if self._path.exists():
            self._path.unlink(missing_ok=True)
        if self._meta_path.exists():
            self._meta_path.unlink(missing_ok=True)


_INDEX: Optional[VectorIndex] = None
_INDEX_DIM: Optional[int] = None
_INDEX_MODEL: Optional[str] = None


def get_vector_index(dim: Optional[int] = None) -> VectorIndex:
    global _INDEX, _INDEX_DIM, _INDEX_MODEL
    settings = load_settings()
    model_name = settings["embedding"]["model_name"]
    data_dir = Path(settings["_data_dir"]) / "vectors"
    data_dir.mkdir(parents=True, exist_ok=True)
    meta_file = data_dir / "vector-metadata.json"

    if meta_file.exists():
        meta = json.loads(meta_file.read_text(encoding="utf-8"))
        stored_model = meta.get("embedding_model")
        stored_dim = meta.get("embedding_dimension")
        if stored_model and stored_model != model_name:
            raise RuntimeError(
                f"Embedding model mismatch: index={stored_model}, settings={model_name}. Re-embed required."
            )
        if dim is None:
            dim = int(stored_dim or 384)
        backend = meta.get("backend", "faiss")
    else:
        dim = dim or 384
        backend = "faiss"

    if _INDEX is not None and _INDEX_DIM == dim and _INDEX_MODEL == model_name:
        return _INDEX

    if backend == "faiss":
        try:
            _INDEX = FaissVectorIndex(dim, data_dir / "index.faiss")
        except Exception:
            _INDEX = HnswVectorIndex(dim, data_dir / "index.hnsw")
            backend = "hnswlib"
    else:
        _INDEX = HnswVectorIndex(dim, data_dir / "index.hnsw")

    _INDEX_DIM = dim
    _INDEX_MODEL = model_name
    meta_file.write_text(
        json.dumps(
            {
                "embedding_model": model_name,
                "embedding_dimension": dim,
                "backend": _INDEX.backend_name,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    return _INDEX


def reset_vector_index_cache() -> None:
    global _INDEX, _INDEX_DIM, _INDEX_MODEL
    _INDEX = None
    _INDEX_DIM = None
    _INDEX_MODEL = None
