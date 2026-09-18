from __future__ import annotations

import re
from pathlib import Path


_SAFE_NAME = re.compile(r"[^A-Za-z0-9._\-\u0600-\u06FF]+")


def safe_filename(name: str, fallback: str = "document.pdf") -> str:
    base = Path(name).name
    cleaned = _SAFE_NAME.sub("_", base).strip("._")
    if not cleaned:
        return fallback
    if ".." in cleaned or cleaned.startswith(("/", "\\")):
        return fallback
    return cleaned[:180]


def is_path_traversal(member: str) -> bool:
    normalized = member.replace("\\", "/")
    if normalized.startswith("/") or re.match(r"^[A-Za-z]:", normalized):
        return True
    parts = Path(normalized).parts
    return any(p == ".." for p in parts)


def looks_like_pdf(header: bytes) -> bool:
    return header.startswith(b"%PDF")
