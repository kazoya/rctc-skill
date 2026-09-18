from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from backend.app.core.config import load_settings

SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    author TEXT,
    language TEXT,
    file_hash_sha256 TEXT NOT NULL UNIQUE,
    page_count INTEGER NOT NULL DEFAULT 0,
    copyright_owner TEXT,
    user_notes TEXT,
    pdf_path TEXT NOT NULL,
    metadata_json TEXT,
    status TEXT NOT NULL DEFAULT 'imported',
    imported_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    page_from INTEGER,
    page_to INTEGER
);

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
    parent_topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    heading_path TEXT,
    summary TEXT,
    page_from INTEGER,
    page_to INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    body_text TEXT,
    body_html TEXT
);

CREATE TABLE IF NOT EXISTS passages (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chapter_id TEXT,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    topic_title TEXT,
    heading_path TEXT,
    text_original TEXT NOT NULL,
    text_search_normalized TEXT NOT NULL,
    page_from INTEGER,
    page_to INTEGER,
    char_count INTEGER,
    token_estimate INTEGER,
    embedding_status TEXT NOT NULL DEFAULT 'pending',
    extraction_confidence REAL DEFAULT 1.0,
    embedding_model TEXT,
    embedding_dim INTEGER
);

CREATE TABLE IF NOT EXISTS passage_blocks (
    id TEXT PRIMARY KEY,
    passage_id TEXT NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    block_index INTEGER NOT NULL,
    x0 REAL, y0 REAL, x1 REAL, y1 REAL,
    font_size REAL,
    is_bold INTEGER DEFAULT 0,
    raw_text TEXT
);

CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    status TEXT NOT NULL,
    progress REAL NOT NULL DEFAULT 0,
    message TEXT,
    error TEXT,
    cancelled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS embedding_jobs (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    status TEXT NOT NULL,
    progress REAL NOT NULL DEFAULT 0,
    message TEXT,
    error TEXT,
    cancelled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS search_history (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    mode TEXT,
    result_count INTEGER,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS package_metadata (
    id TEXT PRIMARY KEY,
    package_title TEXT,
    format_version TEXT,
    created_at TEXT,
    creator TEXT,
    notes TEXT
);

CREATE VIRTUAL TABLE IF NOT EXISTS passages_fts USING fts5(
    passage_id UNINDEXED,
    topic_title,
    heading_path,
    text_search_normalized,
    content=''
);

CREATE INDEX IF NOT EXISTS idx_topics_document ON topics(document_id);
CREATE INDEX IF NOT EXISTS idx_topics_chapter ON topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_passages_topic ON passages(topic_id);
CREATE INDEX IF NOT EXISTS idx_passages_document ON passages(document_id);
CREATE INDEX IF NOT EXISTS idx_chapters_document ON chapters(document_id);
"""


def get_db_path() -> Path:
    return Path(load_settings()["_db_path"])


def init_db() -> None:
    path = get_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(path) as conn:
        conn.executescript(SCHEMA_SQL)
        conn.commit()


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
