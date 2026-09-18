#!/usr/bin/env python3
"""
Validate AI Portability Advisor machine-readable reports (JSON).
Stdlib only — no network. Optional: PyYAML not required (JSON is primary).

Usage:
  python validate_report_schema.py path/to/report.json
  python validate_report_schema.py tests/fixtures/*.json
Exit code 0 if all valid, non-zero on failure.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

SCHEMA_VERSION = "1.0"

LAYER_IDS = {
    "data_knowledge",
    "models",
    "training_adaptation_evaluation",
    "applications_retrieval_agents",
    "inference_serving",
    "orchestration_execution",
}

EVIDENCE_STATUS = {"VERIFIED", "INFERRED", "UNKNOWN"}
ACTIONS = {
    "KEEP",
    "OPTIMIZE",
    "ABSTRACT",
    "HYBRIDIZE",
    "MIGRATE",
    "SELF-HOST",
    "MANAGED_SERVICE",
    "DEFER",
    "REJECT",
}
HIGH_IMPACT_ACTIONS = {"MIGRATE", "SELF-HOST", "MANAGED_SERVICE"}
GATE_STATUS = {"APPROVED", "PENDING_HUMAN_APPROVAL", "DEFER", "REJECT"}
CONFIDENCE = {"high", "medium", "low"}
REPORT_MODES = {
    "full_assessment",
    "architecture_transition_advisor",
    "project_bootstrap_advisor",
}

SECRET_PATTERNS = [
    re.compile(r"sk-[a-zA-Z0-9]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"(?i)api[_-]?key\s*[:=]\s*['\"]?[a-zA-Z0-9_\-]{16,}"),
]

REQUIRED_TOP = [
    "schema_version",
    "report_id",
    "generated_at",
    "question_language",
    "report_mode",
    "executive_summary",
    "layers",
    "ownership_and_control_matrix",
    "lock_in_portability_matrix",
    "recovery_assessment",
    "hidden_cost_assessment",
    "recommendations",
    "roadmap",
    "human_approval_gates",
    "evidence",
    "assumptions",
    "no_bluff_statement",
    "recommendation_vs_authorized_action_note",
]


def err(path: str, msg: str) -> str:
    return f"{path}: {msg}"


def check_score(val: Any, field: str, errors: list[str], prefix: str) -> None:
    if val is None:
        return
    if not isinstance(val, int) or val < 0 or val > 5:
        errors.append(err(prefix, f"{field} must be 0-5 integer or null"))


def validate_evidence(evidence: list[Any], errors: list[str]) -> set[str]:
    ids: set[str] = set()
    if not evidence:
        errors.append(err("evidence", "at least one entry required"))
        return ids
    for i, ev in enumerate(evidence):
        p = f"evidence[{i}]"
        if not isinstance(ev, dict):
            errors.append(err(p, "must be object"))
            continue
        for k in ("id", "status", "statement"):
            if k not in ev:
                errors.append(err(p, f"missing {k}"))
        st = ev.get("status")
        if st not in EVIDENCE_STATUS:
            errors.append(err(p, f"invalid status {st!r}"))
        eid = ev.get("id")
        if isinstance(eid, str):
            ids.add(eid)
    return ids


def validate_migrate_rec(rec: dict[str, Any], gates_by_id: dict[str, dict], errors: list[str], p: str) -> None:
    action = rec.get("action")
    if action != "MIGRATE":
        return
    if not rec.get("pilot_plan"):
        errors.append(err(p, "MIGRATE requires pilot_plan"))
    rb = rec.get("rollback_plan")
    if not rb or not str(rb).strip():
        errors.append(err(p, "MIGRATE requires rollback_plan"))
    vt = rec.get("verification_tests")
    if not vt or not isinstance(vt, list) or len(vt) == 0:
        errors.append(err(p, "MIGRATE requires verification_tests"))
    gid = rec.get("human_gate_id")
    if not gid:
        errors.append(err(p, "MIGRATE requires human_gate_id"))
        return
    gate = gates_by_id.get(gid)
    if not gate:
        errors.append(err(p, f"human_gate_id {gid!r} not found in human_approval_gates"))
        return
    if gate.get("status") not in ("PENDING_HUMAN_APPROVAL", "APPROVED"):
        errors.append(err(p, "MIGRATE gate must be PENDING_HUMAN_APPROVAL or APPROVED"))


def validate_high_impact_gate(rec: dict[str, Any], gates_by_id: dict[str, dict], errors: list[str], p: str) -> None:
    action = rec.get("action")
    if action not in HIGH_IMPACT_ACTIONS:
        if action == "HYBRIDIZE":
            triggers = rec.get("transition_risks") or []
            text = json.dumps(rec, ensure_ascii=False).lower()
            if "production" in text or "data movement" in text or "data_movement" in text:
                action = "HYBRIDIZE"  # treat as high impact
            else:
                return
        else:
            return
    gid = rec.get("human_gate_id")
    if not gid:
        errors.append(err(p, f"{action} requires human_gate_id"))
        return
    gate = gates_by_id.get(gid)
    if not gate:
        errors.append(err(p, f"missing gate {gid!r}"))
        return
    if gate.get("status") == "APPROVED":
        return
    if gate.get("status") != "PENDING_HUMAN_APPROVAL":
        errors.append(err(p, f"high-impact action requires PENDING_HUMAN_APPROVAL, got {gate.get('status')!r}"))


def scan_secrets(obj: Any, errors: list[str], path: str = "$") -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            scan_secrets(v, errors, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            scan_secrets(v, errors, f"{path}[{i}]")
    elif isinstance(obj, str):
        for pat in SECRET_PATTERNS:
            if pat.search(obj):
                errors.append(err(path, "possible secret pattern detected"))
        if re.search(r"(?i)password\s*[:=]\s*\S+", obj) and "UNKNOWN" not in obj:
            errors.append(err(path, "possible password in report"))


def validate_report(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    for key in REQUIRED_TOP:
        if key not in data:
            errors.append(err("$", f"missing required field {key!r}"))

    if data.get("schema_version") != SCHEMA_VERSION:
        errors.append(err("schema_version", f"must be {SCHEMA_VERSION!r}"))

    if data.get("report_mode") not in REPORT_MODES:
        errors.append(err("report_mode", "invalid enum"))

    layers = data.get("layers")
    if not isinstance(layers, list):
        errors.append(err("layers", "must be array"))
    else:
        seen = set()
        for i, layer in enumerate(layers):
            p = f"layers[{i}]"
            if not isinstance(layer, dict):
                errors.append(err(p, "must be object"))
                continue
            lid = layer.get("layer_id")
            if lid not in LAYER_IDS:
                errors.append(err(p, f"invalid layer_id {lid!r}"))
            seen.add(lid)
            conf = layer.get("assessment_confidence")
            if conf not in CONFIDENCE:
                errors.append(err(p, "invalid assessment_confidence"))
            for sf in (
                "business_criticality",
                "data_sensitivity",
                "vendor_lock_in",
                "portability",
                "replaceability",
                "recovery_capability",
                "observability_clarity",
                "progress_loss_risk",
                "rework_risk",
                "migration_difficulty",
                "outage_impact",
            ):
                check_score(layer.get(sf), sf, errors, p)
        if len(seen) < 6:
            errors.append(err("layers", "must include all six layer_id values"))

    evidence_ids = validate_evidence(data.get("evidence", []), errors)

    roadmap = data.get("roadmap")
    if not isinstance(roadmap, dict):
        errors.append(err("roadmap", "must be object"))
    else:
        for rk in ("immediate", "days_30", "days_90", "strategic"):
            if rk not in roadmap or not isinstance(roadmap[rk], list):
                errors.append(err(f"roadmap.{rk}", "required array"))

    nbs = data.get("no_bluff_statement")
    if not isinstance(nbs, str) or len(nbs.strip()) < 10:
        errors.append(err("no_bluff_statement", "required non-empty statement"))

    gates_list = data.get("human_approval_gates", [])
    gates_by_id: dict[str, dict] = {}
    if isinstance(gates_list, list):
        for i, g in enumerate(gates_list):
            p = f"human_approval_gates[{i}]"
            if not isinstance(g, dict):
                continue
            for k in ("gate_id", "status", "recommendation_action", "reason"):
                if k not in g:
                    errors.append(err(p, f"missing {k}"))
            st = g.get("status")
            if st not in GATE_STATUS:
                errors.append(err(p, f"invalid gate status {st!r}"))
            act = g.get("recommendation_action")
            if act not in ACTIONS:
                errors.append(err(p, f"invalid action {act!r}"))
            gid = g.get("gate_id")
            if isinstance(gid, str):
                gates_by_id[gid] = g

    recs = data.get("recommendations", [])
    if not isinstance(recs, list):
        errors.append(err("recommendations", "must be array"))
    else:
        for i, rec in enumerate(recs):
            p = f"recommendations[{i}]"
            if not isinstance(rec, dict):
                errors.append(err(p, "must be object"))
                continue
            act = rec.get("action")
            if act not in ACTIONS:
                errors.append(err(p, f"invalid action {act!r}"))
            if rec.get("confidence") not in CONFIDENCE:
                errors.append(err(p, "invalid confidence"))
            for eid in rec.get("evidence_ids") or []:
                if eid not in evidence_ids:
                    errors.append(err(p, f"unknown evidence_id {eid!r}"))
            validate_migrate_rec(rec, gates_by_id, errors, p)
            validate_high_impact_gate(rec, gates_by_id, errors, p)
            if act == "MIGRATE" and rec.get("selection_rationale", "").lower().startswith("different vendor"):
                errors.append(err(p, "MIGRATE must not be justified only by vendor difference"))

    auth = data.get("authorized_actions", [])
    if auth is None:
        data["authorized_actions"] = []
    elif isinstance(auth, list):
        for i, a in enumerate(auth):
            if a.get("status") == "APPROVED" and not a.get("approved_by"):
                errors.append(err(f"authorized_actions[{i}]", "APPROVED requires approved_by"))

    note = data.get("recommendation_vs_authorized_action_note", "")
    if "recommendation" not in note.lower() and "authorized" not in note.lower():
        errors.append(err("recommendation_vs_authorized_action_note", "must distinguish recommendation vs authorized action"))

    scan_secrets(data, errors)
    return errors


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: validate_report_schema.py <report.json> [...]", file=sys.stderr)
        return 2
    failed = 0
    for arg in argv[1:]:
        path = Path(arg)
        if not path.is_file():
            print(err(str(path), "file not found"), file=sys.stderr)
            failed += 1
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(err(str(path), f"invalid JSON: {e}"), file=sys.stderr)
            failed += 1
            continue
        if not isinstance(data, dict):
            print(err(str(path), "root must be object"), file=sys.stderr)
            failed += 1
            continue
        errors = validate_report(data)
        if errors:
            failed += 1
            print(f"FAIL {path}:", file=sys.stderr)
            for e in errors:
                print(f"  - {e}", file=sys.stderr)
        else:
            print(f"OK {path}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
