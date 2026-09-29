#!/usr/bin/env python3
"""Scan Cursor workspaces → projects-registry.xml + dashboard (local data only)."""

from __future__ import annotations

import json
import os
import re
import subprocess
import html as html_module
import xml.etree.ElementTree as ET
from datetime import date, datetime, timezone
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
BRIEFS_DIR = PORTFOLIO / "briefs"

PROJECT_MARKERS = (
    ".git",
    ".cursor",
    "PORTFOLIO.md",
    "package.json",
    "pubspec.yaml",
    "pyproject.toml",
    "AGENTS.md",
    "CLAUDE.md",
    "SKILL.md",
    "go.mod",
    "Cargo.toml",
)


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
            folders = data.get("folders")
            if isinstance(folders, list):
                for item in folders:
                    u = item.get("uri") if isinstance(item, dict) else None
                    fp = decode_file_uri(u) if isinstance(u, str) else None
                    if fp and fp.is_dir():
                        out.append(fp.resolve())
            continue
        if p.suffix.lower() == ".code-workspace" and p.is_file():
            try:
                ws = json.loads(p.read_text(encoding="utf-8"))
                for folder in ws.get("folders") or []:
                    rel = folder.get("path")
                    if not rel:
                        continue
                    fp = (p.parent / rel).resolve() if not Path(rel).is_absolute() else Path(rel)
                    if fp.is_dir():
                        out.append(fp)
            except (json.JSONDecodeError, OSError):
                out.append(p.parent.resolve())
            continue
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


def looks_like_project(root: Path) -> bool:
    try:
        for name in PROJECT_MARKERS:
            if (root / name).exists():
                return True
    except OSError:
        return False
    return False


def extra_root_projects(roots: list[str], max_depth: int, exclude: set[str]) -> list[Path]:
    found: list[Path] = []

    def walk(current: Path, depth: int, cap: int) -> None:
        if depth > cap:
            return
        try:
            entries = list(current.iterdir())
        except OSError:
            return
        for child in entries:
            if not child.is_dir():
                continue
            name = child.name
            if name in exclude or name.startswith("."):
                continue
            try:
                if looks_like_project(child):
                    found.append(child.resolve())
            except OSError:
                continue
            if depth < cap:
                walk(child, depth + 1, cap)

    for raw in roots:
        root = expand(raw)
        if not root.is_dir():
            continue
        is_drive = len(str(root).rstrip("\\/")) <= 2
        if is_drive:
            # Walking C:\ or D:\ at depth 2 floods the registry with unrelated folders.
            continue
        cap = max_depth
        walk(root, 1, cap)
    return found


def find_engineering_mind(root: Path, cfg: dict) -> str | None:
    if is_flutter_dart(root):
        return None
    for rel in cfg.get("engineering_mind", {}).get("candidates", ["PORTFOLIO.md", "SKILL.md", "AGENTS.md", "CLAUDE.md", "README.md"]):
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
    for name in ("PORTFOLIO.md", "package.json", "pubspec.yaml", "SKILL.md", "README.md", "index.html", "Cargo.toml", "go.mod"):
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
    for fname in ("PORTFOLIO.md", "README.md"):
        fp = root / fname
        if fp.is_file():
            for line in fp.read_text(encoding="utf-8", errors="ignore").splitlines()[:8]:
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
            "role": proj.get("role", ""),
            "canonicalId": proj.get("canonicalId", ""),
            "path": proj.get("path", ""),
        }
    return preserved


def load_project_overrides(cfg: dict) -> dict[str, dict]:
    if not yaml:
        return {}
    rel = cfg.get("paths", {}).get("project_overrides", str(PORTFOLIO / "project-overrides.yaml"))
    path = expand(rel)
    if not path.is_file():
        return {}
    with open(path, encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}
    if not isinstance(raw, dict):
        return {}
    return {str(k): (v if isinstance(v, dict) else {}) for k, v in raw.items()}


def load_brief(pid: str, briefs_dir: Path) -> dict | None:
    if not yaml:
        return None
    fp = briefs_dir / f"{pid}.yaml"
    if not fp.is_file():
        return None
    try:
        with open(fp, encoding="utf-8") as f:
            raw = yaml.safe_load(f) or {}
    except (OSError, yaml.YAMLError):
        return None
    if not isinstance(raw, dict):
        return None
    keys = (
        "accomplished",
        "current",
        "next",
        "blocker",
        "offer",
        "priceHint",
        "gtm",
        "updated",
        "confidence",
    )
    def stringify(value):
        if isinstance(value, datetime):
            return value.date().isoformat()
        if isinstance(value, date):
            return value.isoformat()
        return str(value) if not isinstance(value, (str, int, float, bool)) else value

    return {k: stringify(raw.get(k)) for k in keys if raw.get(k) not in (None, "")}


def normalize_revenue(value) -> str:
    if value is True:
        return "yes"
    if value is False:
        return "no"
    s = str(value).strip().lower()
    if s in ("yes", "no", "unknown"):
        return s
    return "unknown"


def resolve_override(overrides: dict[str, dict], pid: str, root_path: str) -> dict:
    for key in (pid, root_path, str(root_path).lower()):
        if key in overrides:
            return overrides[key]
    return {}


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


def build_select_options(projects: list[dict], hide_backups: bool) -> str:
    lines: list[str] = []
    for p in projects:
        if hide_backups and p.get("role") == "backup":
            continue
        label = p["displayName"] + (" (سكون)" if p["lifecycle"] == "dormant" else "")
        lines.append(
            f'<option value="{html_module.escape(p["id"], quote=True)}" '
            f'data-path="{html_module.escape(p["path"], quote=True)}" '
            f'data-lifecycle="{html_module.escape(p["lifecycle"], quote=True)}">'
            f"{html_module.escape(label)}</option>"
        )
    return "\n        ".join(lines)


def safe_json_embed(data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=False)
    return payload.replace("<", "\\u003c")


def main() -> None:
    cfg = load_config()
    scan_cfg = cfg.get("scan", {})
    storage = expand(scan_cfg.get("cursor_workspace_storage", ""))
    dormant_days = int(cfg.get("dormant", {}).get("days_without_activity", 45))
    preserved = load_existing_registry()
    overrides = load_project_overrides(cfg)
    hide_backups = bool(cfg.get("agent", {}).get("hide_backup_projects", True))
    briefs_rel = cfg.get("paths", {}).get("briefs_dir", str(BRIEFS_DIR))
    briefs_dir = expand(briefs_rel) if briefs_rel else BRIEFS_DIR
    exclude = set(scan_cfg.get("exclude_dir_names") or [])
    max_depth = int(scan_cfg.get("max_depth") or 2)

    paths: set[Path] = set()
    for p in cursor_workspace_paths(storage):
        nr = normalize_project_root(p)
        if nr:
            paths.add(nr)

    for raw in scan_cfg.get("always_include") or []:
        nr = normalize_project_root(expand(raw))
        if nr:
            paths.add(nr)

    for extra in extra_root_projects(scan_cfg.get("extra_roots") or [], max_depth, exclude):
        paths.add(extra)

    for prev in preserved.values():
        raw_path = prev.get("path") or ""
        if not raw_path:
            continue
        pid = project_id(Path(raw_path))
        if pid not in overrides:
            continue
        nr = normalize_project_root(Path(raw_path))
        if nr:
            paths.add(nr)

    projects = []
    seen_ids: set[str] = set()
    for root in sorted(paths, key=lambda x: str(x).lower()):
        if not root.is_dir():
            continue
        pid = project_id(root)
        if pid in seen_ids:
            continue
        seen_ids.add(pid)
        prev = preserved.get(pid, {})
        ovr = resolve_override(overrides, pid, str(root))
        display = ovr.get("displayName") or prev.get("displayName") or infer_display_name(root)
        last_mod = last_modified(root)
        commits = git_commits_30d(root)
        mind = find_engineering_mind(root, cfg)
        lifecycle = ovr.get("lifecycle") or suggest_lifecycle(
            last_mod, dormant_days, prev.get("lifecycle", "active")
        )
        active_raw = ovr.get("active", prev.get("active", "true"))
        if isinstance(active_raw, bool):
            active = "true" if active_raw else "false"
        else:
            active = str(active_raw)
        priority = str(ovr.get("priority", prev.get("priority", "0")))
        revenue = normalize_revenue(ovr.get("revenue", prev.get("revenue", "unknown")))
        role = str(ovr.get("role") or prev.get("role") or "")
        canonical_id = str(ovr.get("canonicalId") or prev.get("canonicalId") or "")
        brief = load_brief(pid, briefs_dir) or {}

        rec = {
            "id": pid,
            "path": str(root),
            "displayName": display,
            "active": active == "true" or active is True,
            "lifecycle": lifecycle,
            "priority": int(priority) if str(priority).isdigit() else 0,
            "revenue": revenue,
            "role": role,
            "canonicalId": canonical_id,
            "lastModified": last_mod.isoformat() if last_mod else None,
            "gitCommits30d": commits,
            "engineeringMind": mind,
            "isFlutter": is_flutter_dart(root),
            "activityScore": commits * 10
            + (0 if not last_mod else max(0, 30 - (datetime.now(timezone.utc) - last_mod).days)),
            "briefUpdated": brief.get("updated"),
            "accomplished": brief.get("accomplished"),
            "current": brief.get("current"),
            "next": brief.get("next"),
            "blocker": brief.get("blocker"),
            "offer": brief.get("offer"),
            "priceHint": brief.get("priceHint"),
            "gtm": brief.get("gtm"),
            "confidence": brief.get("confidence"),
        }
        projects.append(rec)

    projects.sort(key=sort_key)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    portfolio = ET.Element("portfolio", version="1.2", generated=now)
    for p in projects:
        attrs = {
            "id": p["id"],
            "path": p["path"],
            "active": "true" if p["active"] else "false",
            "lifecycle": p["lifecycle"],
            "priority": str(p["priority"]),
            "revenue": p["revenue"],
        }
        if p.get("role"):
            attrs["role"] = p["role"]
        if p.get("canonicalId"):
            attrs["canonicalId"] = p["canonicalId"]
        el = ET.SubElement(portfolio, "project", attrs)
        ET.SubElement(el, "displayName").text = p["displayName"]
        ET.SubElement(el, "lastModified").text = p["lastModified"] or ""
        ET.SubElement(el, "status").text = "فعال" if p["lifecycle"] == "active" else "سكون"
        ET.SubElement(el, "gitCommits30d").text = str(p["gitCommits30d"])
        if p["engineeringMind"]:
            ET.SubElement(el, "engineeringMind").text = p["engineeringMind"]
        elif p["isFlutter"]:
            ET.SubElement(el, "engineeringMind", skip="dart-flutter")
        if p.get("briefUpdated"):
            ET.SubElement(el, "briefUpdated").text = str(p["briefUpdated"])
        if p.get("next"):
            ET.SubElement(el, "next").text = str(p["next"])

    tree = ET.ElementTree(portfolio)
    ET.indent(tree, space="  ")
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    tree.write(str(REGISTRY_PATH), encoding="utf-8", xml_declaration=True)

    DASHBOARD_DIR.mkdir(parents=True, exist_ok=True)
    DASHBOARD_DATA.write_text(
        json.dumps({"generated": now, "title": "مشاريعنا", "projects": projects}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    tpl = DASHBOARD_DIR / TEMPLATE_NAME
    if not tpl.is_file():
        tpl = Path(__file__).resolve().parent.parent / "dashboard" / TEMPLATE_NAME
    if tpl.is_file():
        payload = safe_json_embed({"generated": now, "title": "مشاريعنا", "projects": projects})
        options = build_select_options(projects, hide_backups)
        html_out = (
            tpl.read_text(encoding="utf-8")
            .replace("__PORTFOLIO_JSON__", payload)
            .replace("__PROJECT_OPTIONS__", options)
            .replace("__PROJECT_COUNT__", str(len(projects)))
        )
        (DASHBOARD_DIR / "index.html").write_text(html_out, encoding="utf-8")

    print(f"Wrote {len(projects)} projects → {REGISTRY_PATH}")
    print(f"Dashboard → {DASHBOARD_DIR / 'index.html'}")
    print("Tip: .\\scripts\\serve-dashboard.ps1  (recommended in Chrome)")


if __name__ == "__main__":
    main()
