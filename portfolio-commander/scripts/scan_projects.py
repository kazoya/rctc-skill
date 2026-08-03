#!/usr/bin/env python3
"""Scan Cursor workspaces → projects-registry.xml + dashboard (local data only)."""

from __future__ import annotations

import json
import os
import re
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

try:
    import yaml
except ImportError:
    yaml = None

HOME = Path(os.environ.get("USERPROFILE") or Path.home())
PORTFOLIO = HOME / ".cursor" / "portfolio"
CONFIG_PATH = PORTFOLIO / "config.yaml"
REGISTRY_PATH = PORTFOLIO / "projects-registry.xml"
DASHBOARD_DIR = PORTFOLIO / "dashboard"
DASHBOARD_DATA = DASHBOARD_DIR / "projects-data.json"
TEMPLATE_NAME = "index.template.html"


def expand(p: str) -> Path:
    return Path(os.path.expandvars(p)).resolve()


def load_config() -> dict:
    if yaml and CONFIG_PATH.exists():
        with open(CONFIG_PATH, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {
        "scan": {"cursor_workspace_storage": os.path.join(os.environ.get("APPDATA", ""), "Cursor", "User", "workspaceStorage")},
        "dormant": {"days_without_activity": 45},
    }


def decode_file_uri(uri: str) -> Path | None:
    if not uri or not uri.startswith("file:///"):
        return None
    raw = unquote(uri.replace("file:///", ""))
    if re.match(r"^[a-zA-Z]:", raw):
        return Path(raw.replace("/", "\\"))
    return Path(raw)


def cursor_workspace_paths(storage: Path) -> list[Path]:
    out: list[Path] = []
    if not storage.is_dir():
        return out
    for entry in storage.iterdir():
        wj = entry / "workspace.json"
        if not wj.is_file():
            continue
        try:
            data = json.loads(wj.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        uri = data.get("folder") or data.get("workspace")
        p = decode_file_uri(uri) if isinstance(uri, str) else None
        if not p:
            continue
        if p.suffix.lower() == ".code-workspace" and p.is_file():
            p = p.parent
        if p.name == ".git":
            p = p.parent
        if p.is_dir():
            out.append(p.resolve())
    return out


def normalize_project_root(p: Path) -> Path | None:
    if not p.exists():
        return None
    if p.is_file():
        if p.suffix.lower() == ".code-workspace":
            return p.parent.resolve()
        return None
    return p.resolve()


def is_flutter_dart(root: Path) -> bool:
    return (root / "pubspec.yaml").is_file()


def find_engineering_mind(root: Path, cfg: dict) -> str | None:
    if is_flutter_dart(root):
        return None
    for rel in cfg.get("engineering_mind", {}).get("candidates", ["SKILL.md", "AGENTS.md", "CLAUDE.md", "README.md"]):
        fp = root / rel
        if fp.is_file():
            return str(fp)
    rules = root / ".cursor" / "rules"
    if rules.is_dir():
        mdc = list(rules.glob("*.mdc"))
        if mdc:
            return str(mdc[0])
    return None


def last_modified(root: Path) -> datetime | None:
    candidates: list[datetime] = []
    try:
        candidates.append(datetime.fromtimestamp(root.stat().st_mtime, tz=timezone.utc))
    except OSError:
        pass
    for name in ("package.json", "pubspec.yaml", "SKILL.md", "README.md", "index.html", "Cargo.toml", "go.mod"):
        fp = root / name
        if fp.is_file():
            try:
                candidates.append(datetime.fromtimestamp(fp.stat().st_mtime, tz=timezone.utc))
            except OSError:
                pass
    if (root / ".git").is_dir():
        try:
            r = subprocess.run(
                ["git", "-C", str(root), "log", "-1", "--format=%cI"],
                capture_output=True,
                text=True,
                timeout=8,
                check=False,
            )
            if r.returncode == 0 and r.stdout.strip():
                candidates.append(datetime.fromisoformat(r.stdout.strip().replace("Z", "+00:00")))
        except (subprocess.TimeoutExpired, FileNotFoundError, ValueError):
            pass
    return max(candidates) if candidates else None


def git_commits_30d(root: Path) -> int:
    if not (root / ".git").is_dir():
        return 0
    try:
        r = subprocess.run(
            ["git", "-C", str(root), "log", "--since=30.days", "--oneline"],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        if r.returncode != 0:
            return 0
        return len([ln for ln in r.stdout.splitlines() if ln.strip()])
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return 0


def infer_display_name(root: Path) -> str:
    readme = root / "README.md"
    if readme.is_file():
        for line in readme.read_text(encoding="utf-8", errors="ignore").splitlines()[:8]:
            line = line.strip()
            if line.startswith("# "):
                return line[2:].strip()[:80]
    if (root / "SKILL.md").is_file():
        return f"Skill — {root.name}"
    if (root / "pubspec.yaml").is_file():
        return f"Flutter — {root.name}"
    if (root / "package.json").is_file():
        return f"Node — {root.name}"
    if (root / ".git").is_dir():
        return f"Repo — {root.name}"
    return root.name


def load_existing_registry() -> dict[str, dict]:
    preserved: dict[str, dict] = {}
    if not REGISTRY_PATH.is_file():
        return preserved
    tree = ET.parse(REGISTRY_PATH)
    root = tree.getroot()
    for proj in root.findall("project"):
        pid = proj.get("id") or proj.get("path", "")
        preserved[pid] = {
            "active": proj.get("active", "true"),
            "lifecycle": proj.get("lifecycle", "active"),
            "displayName": proj.findtext("displayName"),
            "priority": proj.get("priority", "0"),
            "revenue": proj.get("revenue", "unknown"),
        }
    return preserved


def project_id(path: Path) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", str(path).lower()).strip("-")[:120]


def suggest_lifecycle(last_mod: datetime | None, days_threshold: int, preserved_lifecycle: str) -> str:
    if preserved_lifecycle == "dormant":
        return "dormant"
    if not last_mod:
        return "dormant"
    age = (datetime.now(timezone.utc) - last_mod).days
    if age >= days_threshold:
        return "dormant"
    return "active"


def sort_key(p: dict) -> tuple:
    pr = int(p.get("priority") or 0)
    pr_sort = pr if pr > 0 else 999
    return (pr_sort, -p["activityScore"], p["displayName"].lower())


def main() -> None:
    cfg = load_config()
    storage = expand(cfg.get("scan", {}).get("cursor_workspace_storage", ""))
    dormant_days = int(cfg.get("dormant", {}).get("days_without_activity", 45))
    preserved = load_existing_registry()

    paths: set[Path] = set()
    for p in cursor_workspace_paths(storage):
        nr = normalize_project_root(p)
        if nr:
            paths.add(nr)

    projects = []
    for root in sorted(paths, key=lambda x: str(x).lower()):
        if not root.is_dir():
            continue
        pid = project_id(root)
        prev = preserved.get(pid, {})
        display = prev.get("displayName") or infer_display_name(root)
        last_mod = last_modified(root)
        commits = git_commits_30d(root)
        mind = find_engineering_mind(root, cfg)
        lifecycle = suggest_lifecycle(last_mod, dormant_days, prev.get("lifecycle", "active"))
        active = prev.get("active", "true")
        priority = str(prev.get("priority", "0"))
        revenue = prev.get("revenue", "unknown")

        projects.append(
            {
                "id": pid,
                "path": str(root),
                "displayName": display,
                "active": active == "true" or active is True,
                "lifecycle": lifecycle,
                "priority": int(priority) if str(priority).isdigit() else 0,
                "revenue": revenue,
                "lastModified": last_mod.isoformat() if last_mod else None,
                "gitCommits30d": commits,
                "engineeringMind": mind,
                "isFlutter": is_flutter_dart(root),
                "activityScore": commits * 10
                + (0 if not last_mod else max(0, 30 - (datetime.now(timezone.utc) - last_mod).days)),
            }
        )

    projects.sort(key=sort_key)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    portfolio = ET.Element("portfolio", version="1.1", generated=now)
    for p in projects:
        attrs = {
            "id": p["id"],
            "path": p["path"],
            "active": "true" if p["active"] else "false",
            "lifecycle": p["lifecycle"],
            "priority": str(p["priority"]),
            "revenue": p["revenue"],
        }
        el = ET.SubElement(portfolio, "project", attrs)
        ET.SubElement(el, "displayName").text = p["displayName"]
        ET.SubElement(el, "lastModified").text = p["lastModified"] or ""
        ET.SubElement(el, "status").text = "فعال" if p["lifecycle"] == "active" else "سكون"
        ET.SubElement(el, "gitCommits30d").text = str(p["gitCommits30d"])
        if p["engineeringMind"]:
            ET.SubElement(el, "engineeringMind").text = p["engineeringMind"]
        elif p["isFlutter"]:
            ET.SubElement(el, "engineeringMind", skip="dart-flutter")

    tree = ET.ElementTree(portfolio)
    ET.indent(tree, space="  ")
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    tree.write(REGISTRY_PATH, encoding="utf-8", xml_declaration=True)

    DASHBOARD_DIR.mkdir(parents=True, exist_ok=True)
    DASHBOARD_DATA.write_text(
        json.dumps({"generated": now, "projects": projects}, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    tpl = DASHBOARD_DIR / TEMPLATE_NAME
    if not tpl.is_file():
        tpl = Path(__file__).resolve().parent.parent / "dashboard" / TEMPLATE_NAME
    if tpl.is_file():
        payload = json.dumps({"generated": now, "projects": projects}, ensure_ascii=False)
        (DASHBOARD_DIR / "index.html").write_text(
            tpl.read_text(encoding="utf-8").replace("__PORTFOLIO_JSON__", payload), encoding="utf-8"
        )

    print(f"Wrote {len(projects)} projects → {REGISTRY_PATH}")
    print(f"Dashboard → {DASHBOARD_DIR / 'index.html'}")


if __name__ == "__main__":
    main()
