"""Pluggable embedding adapters for offline index comparison (not production)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import numpy as np


@dataclass(frozen=True)
class EmbeddingSpec:
    name: str
    model_name: str
    dimension: int
    index_dir: str
    normalize: bool = True


EMBEDDING_SPECS = {
    "minilm-384": EmbeddingSpec(
        name="minilm-384",
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        dimension=384,
        index_dir="minilm-384",
    ),
    "qwen3-embedding-0.6b": EmbeddingSpec(
        name="qwen3-embedding-0.6b",
        model_name="Qwen/Qwen3-Embedding-0.6B",
        dimension=1024,
        index_dir="qwen3-embedding-0.6b",
    ),
    "bge-m3": EmbeddingSpec(
        name="bge-m3",
        model_name="BAAI/bge-m3",
        dimension=1024,
        index_dir="bge-m3",
    ),
}


class EmbeddingAdapter(Protocol):
    spec: EmbeddingSpec

    def encode_queries(self, texts: list[str]) -> np.ndarray: ...

    def encode_documents(self, texts: list[str]) -> np.ndarray: ...


class SentenceTransformerAdapter:
    def __init__(self, spec: EmbeddingSpec, *, cache_folder: str) -> None:
        from sentence_transformers import SentenceTransformer

        self.spec = spec
        self._model = SentenceTransformer(spec.model_name, cache_folder=cache_folder)

    def encode_queries(self, texts: list[str]) -> np.ndarray:
        return np.asarray(
            self._model.encode(texts, normalize_embeddings=self.spec.normalize, show_progress_bar=False),
            dtype=np.float32,
        )

    def encode_documents(self, texts: list[str]) -> np.ndarray:
        return self.encode_queries(texts)


def index_root(data_dir: Path) -> Path:
    return data_dir / "vectors"


def metadata_path(data_dir: Path, spec: EmbeddingSpec) -> Path:
    return index_root(data_dir) / spec.index_dir / "metadata.json"
