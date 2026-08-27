#!/usr/bin/env python3
"""Install Cursor Agent Skills into project .cursor/skills/ from project-skills-map.yaml."""

from __future__ import annotations

import json
import os
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

HOME = Path(os.environ.get("USERPROFILE") or Path.home())
PORTFOLIO = HOME / ".cursor" / "portfolio"
MAP_PATH = PORTFOLIO / "project-skills-map.yaml"
REGISTRY = PORTFOLIO / "projects-registry.xml"
OVERRIDES = PORTFOLIO / "project-overrides.yaml"
USER_SKILLS = HOME / ".cursor" / "skills"


def expand(s: str) -> str:
    return os.path.expandvars(s.replace("/", "\\"))


def load_yaml(path: Path) -> dict:
    if not yaml:
        raise SystemExit("PyYAML required: pip install pyyaml")
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def registry_lifecycle_by_id() -> dict[str, str]:
    out: dict[str, str] = {}
    if not REGISTRY.is_file():
        return out
    root = ET.parse(REGISTRY).getroot()
    for p in root.findall("project"):
        pid = p.get("id") or ""
        out[pid] = p.get("lifecycle", "active")
    return out


def overrides_extra() -> dict[str, dict]:
    if not yaml or not OVERRIDES.is_file():
        return {}
    raw = load_yaml(OVERRIDES)
    return {str(k): v for k, v in raw.items() if isinstance(v, dict) and not str(k).startswith("#")}


def should_skip_project(pid: str, policy: dict, lifecycle_map: dict, ovr: dict) -> bool:
    if ovr.get(pid, {}).get("role") == "backup":
        return policy.get("skip_role") == "backup"
    life = ovr.get(pid, {}).get("lifecycle") or lifecycle_map.get(pid, "active")
    if life == "dormant" and policy.get("skip_lifecycle") == "dormant":
        return True
    return False


def resolve_source(catalog: dict, sources: dict, skill_key: str) -> Path | None:
    spec = catalog.get(skill_key)
    if not spec:
        return None
    src_key = spec.get("from", "rctc-skill")
    base = expand(sources.get(src_key, ""))
    rel = spec.get("dir", skill_key)
    path = Path(base) / rel.replace("/", os.sep)
    if (path / "SKILL.md").is_file():
        return path
    if path.is_file():
        return path.parent
    return None


def copy_skill(src: Path, dest: Path, dry_run: bool) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    if dry_run:
        print(f"  [dry-run] copy {src} -> {dest}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src, dest, ignore=shutil.ignore_patterns(".git", "__pycache__", ".venv", "node_modules"))


def install_list(
    target_root: Path,
    skill_names: list[str],
    catalog: dict,
    sources: dict,
    dry_run: bool,
    manifest: list[dict],
) -> None:
    skills_dir = target_root / ".cursor" / "skills"
    for name in skill_names:
        src = resolve_source(catalog, sources, name)
        if not src:
            print(f"  SKIP missing catalog source: {name}", file=sys.stderr)
            continue
        dest = skills_dir / name
        copy_skill(src, dest, dry_run)
        manifest.append({"skill": name, "path": str(dest), "source": str(src)})


def main() -> None:
    map_path = Path(sys.argv[1]) if len(sys.argv) > 1 else MAP_PATH
    if not map_path.is_file():
        example = Path(__file__).resolve().parent.parent / "project-skills-map.example.yaml"
        print(f"Map not found: {map_path}", file=sys.stderr)
        print(f"Copy example: {example} -> {MAP_PATH}", file=sys.stderr)
        sys.exit(2)

    cfg = load_yaml(map_path)
    catalog = cfg.get("catalog", {})
    sources = {k: expand(v) for k, v in cfg.get("sources", {}).items()}
    policy = cfg.get("install_policy", {})
    dry_run = bool(policy.get("dry_run"))
    lifecycle_map = registry_lifecycle_by_id()
    ovr = overrides_extra()

    manifest: dict = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "map": str(map_path),
        "installs": [],
    }

    # User-level router skill (from rctc-skill OSS path in map)
    rctc = Path(sources.get("rctc-skill", ""))
    router_src = rctc / "portfolio-commander" / "skills" / "portfolio-skills-router"
    if (router_src / "SKILL.md").is_file():
        router_dest = USER_SKILLS / "portfolio-skills-router"
        copy_skill(router_src, router_dest, dry_run)
        print(f"User skill: {router_dest}")

    factory_src = rctc / "factory-sales-concept"
    if (factory_src / "SKILL.md").is_file():
        factory_dest = USER_SKILLS / "factory-sales-concept"
        copy_skill(factory_src, factory_dest, dry_run)
        print(f"User skill: {factory_dest}")

    f3_src = rctc / "focused3-agentic-phases"
    if (f3_src / "SKILL.md").is_file():
        f3_dest = USER_SKILLS / "focused3-agentic-phases"
        copy_skill(f3_src, f3_dest, dry_run)
        print(f"User skill: {f3_dest}")

    for bundle_name, bundle in cfg.get("bundles", {}).items():
        ids = bundle.get("registry_ids", [])
        if any(should_skip_project(pid, policy, lifecycle_map, ovr) for pid in ids):
            print(f"Bundle {bundle_name}: skip (dormant/backup)")
            continue

        primary = bundle.get("primary_path")
        if primary:
            path = Path(expand(primary))
            if path.is_dir():
                print(f"Bundle {bundle_name} -> {path}")
                install_list(path, bundle.get("skills", []), catalog, sources, dry_run, manifest["installs"])
            else:
                print(f"  SKIP missing path: {path}", file=sys.stderr)

        for entry in bundle.get("nested", []):
            np = Path(expand(entry.get("path", "")))
            if np.is_dir():
                print(f"  nested -> {np}")
                install_list(np, entry.get("skills", []), catalog, sources, dry_run, manifest["installs"])

        for path_str, skills in (bundle.get("skills_by_path") or {}).items():
            np = Path(expand(path_str))
            if np.is_dir():
                print(f"  by_path -> {np}")
                install_list(np, skills, catalog, sources, dry_run, manifest["installs"])

    manifest_path = PORTFOLIO / "project-skills-manifest.json"
    if not dry_run:
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Manifest: {manifest_path}")
    print("Done.")


if __name__ == "__main__":
    main()
