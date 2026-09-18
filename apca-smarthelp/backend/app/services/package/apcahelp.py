from __future__ import annotations

import hashlib
import json
import shutil
import tempfile
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from backend.app.core.config import get_copyright_block, load_settings
from backend.app.core.security import is_path_traversal
from backend.app.db.database import connect, get_db_path, init_db
from backend.app.services.embeddings.vector_index import reset_vector_index_cache


FORMAT_VERSION = "1.0"
APP_MIN_VERSION = "0.1.0"


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _copyright_text() -> str:
    c = get_copyright_block()
    return (
        f"{c['footer']}\n"
        f"Rights contact: {c['rights_contact']}\n\n"
        f"{c['imported_disclaimer']}\n"
    )


def export_package(*, package_title: str, include_original_pdfs: bool = False) -> Path:
    settings = load_settings()
    data_dir = Path(settings["_data_dir"])
    out_dir = data_dir / "packages"
    out_dir.mkdir(parents=True, exist_ok=True)
    package_path = out_dir / f"{uuid.uuid4().hex}.apcahelp"

    with connect() as conn:
        docs = [dict(r) for r in conn.execute("SELECT * FROM documents").fetchall()]
        topic_count = conn.execute("SELECT COUNT(*) AS c FROM topics").fetchone()["c"]
        passage_count = conn.execute("SELECT COUNT(*) AS c FROM passages").fetchone()["c"]

    emb = settings["embedding"]
    manifest = {
        "format_version": FORMAT_VERSION,
        "product_name": "APCA SmartHelp",
        "package_title": package_title,
        "created_date": datetime.now(timezone.utc).isoformat(),
        "creator": "Suhib Asrawi / APCA Systems",
        "copyright_notice": settings["copyright"]["footer"],
        "rights_contact": settings["copyright"]["rights_contact"],
        "documents": [
            {
                "id": d["id"],
                "title": d["title"],
                "original_filename": d["original_filename"],
                "file_hash_sha256": d["file_hash_sha256"],
                "page_count": d["page_count"],
            }
            for d in docs
        ],
        "embedding_model": emb["model_name"],
        "embedding_dimension": None,
        "chunking": settings["chunking"],
        "topic_count": topic_count,
        "passage_count": passage_count,
        "application_minimum_version": APP_MIN_VERSION,
        "include_original_pdfs": include_original_pdfs,
    }

    vectors_meta = data_dir / "vectors" / "vector-metadata.json"
    if vectors_meta.exists():
        vm = json.loads(vectors_meta.read_text(encoding="utf-8"))
        manifest["embedding_dimension"] = vm.get("embedding_dimension")

    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "vectors").mkdir()
        (root / "topics").mkdir()
        (root / "assets").mkdir()
        (root / "documents").mkdir()

        shutil.copy2(get_db_path(), root / "knowledge.sqlite")
        for item in (data_dir / "vectors").glob("*"):
            if item.is_file():
                shutil.copy2(item, root / "vectors" / item.name)
        topics_src = data_dir / "topics"
        if topics_src.exists():
            shutil.copytree(topics_src, root / "topics", dirs_exist_ok=True)
        if include_original_pdfs:
            for d in docs:
                pdf = Path(d["pdf_path"])
                if pdf.exists():
                    shutil.copy2(pdf, root / "documents" / pdf.name)

        (root / "copyright.txt").write_text(_copyright_text(), encoding="utf-8")
        (root / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

        checksums = {}
        for path in root.rglob("*"):
            if path.is_file() and path.name != "checksums.json":
                rel = path.relative_to(root).as_posix()
                checksums[rel] = _sha256_file(path)
        (root / "checksums.json").write_text(json.dumps(checksums, indent=2), encoding="utf-8")

        with zipfile.ZipFile(package_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for path in root.rglob("*"):
                if path.is_file():
                    zf.write(path, path.relative_to(root).as_posix())

    with connect() as conn:
        conn.execute(
            "INSERT INTO package_metadata (id, package_title, format_version, created_at, creator, notes) VALUES (?,?,?,?,?,?)",
            (
                str(uuid.uuid4()),
                package_title,
                FORMAT_VERSION,
                datetime.now(timezone.utc).isoformat(),
                "APCA SmartHelp",
                f"include_pdfs={include_original_pdfs}",
            ),
        )
    return package_path


def validate_package(package_path: Path) -> dict:
    if not package_path.exists():
        raise ValueError("Package not found")
    with zipfile.ZipFile(package_path, "r") as zf:
        names = zf.namelist()
        for name in names:
            if is_path_traversal(name):
                raise ValueError(f"Path traversal rejected: {name}")
        required = ["manifest.json", "knowledge.sqlite", "checksums.json", "copyright.txt"]
        for req in required:
            if req not in names:
                raise ValueError(f"Missing required file: {req}")
        with tempfile.TemporaryDirectory() as tmp:
            zf.extractall(tmp)
            root = Path(tmp)
            checksums = json.loads((root / "checksums.json").read_text(encoding="utf-8"))
            for rel, expected in checksums.items():
                path = root / rel
                if not path.exists():
                    raise ValueError(f"Missing checksum target: {rel}")
                actual = _sha256_file(path)
                if actual != expected:
                    raise ValueError(f"Checksum mismatch for {rel} (integrity check failed; not a digital signature)")
            manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    return {"valid": True, "manifest": manifest, "note": "Checksums verify integrity, not authenticity/signature."}


def import_package(package_path: Path) -> dict:
    report = validate_package(package_path)
    settings = load_settings()
    data_dir = Path(settings["_data_dir"])

    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(package_path, "r") as zf:
            for name in zf.namelist():
                if is_path_traversal(name):
                    raise ValueError(f"Path traversal rejected: {name}")
            zf.extractall(tmp)
        root = Path(tmp)

        # Replace local knowledge store
        db_dest = get_db_path()
        # Avoid WinError 32: copy over instead of unlink while handles may linger
        tmp_db = db_dest.with_suffix(".importing.sqlite")
        if tmp_db.exists():
            tmp_db.unlink(missing_ok=True)
        shutil.copy2(root / "knowledge.sqlite", tmp_db)
        if db_dest.exists():
            try:
                db_dest.unlink()
            except PermissionError:
                # Fall back to overwrite copy
                pass
        try:
            tmp_db.replace(db_dest)
        except OSError:
            shutil.copy2(tmp_db, db_dest)
            tmp_db.unlink(missing_ok=True)

        vectors_dest = data_dir / "vectors"
        if vectors_dest.exists():
            shutil.rmtree(vectors_dest)
        if (root / "vectors").exists():
            shutil.copytree(root / "vectors", vectors_dest)

        topics_dest = data_dir / "topics"
        if topics_dest.exists():
            shutil.rmtree(topics_dest)
        if (root / "topics").exists():
            shutil.copytree(root / "topics", topics_dest)

        pdf_dest = data_dir / "pdfs"
        pdf_dest.mkdir(exist_ok=True)
        docs_src = root / "documents"
        if docs_src.exists():
            for pdf in docs_src.glob("*.pdf"):
                shutil.copy2(pdf, pdf_dest / pdf.name)

    reset_vector_index_cache()
    init_db()
    return report
