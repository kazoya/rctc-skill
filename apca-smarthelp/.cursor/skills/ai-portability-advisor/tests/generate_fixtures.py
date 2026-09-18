"""Generate scenario JSON fixtures (stdlib). Run from ai-portability-advisor: python tests/generate_fixtures.py"""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent / "fixtures"
LAYER_IDS = [
    "data_knowledge",
    "models",
    "training_adaptation_evaluation",
    "applications_retrieval_agents",
    "inference_serving",
    "orchestration_execution",
]


def layers(**overrides):
    base = {
        "components": ["component-a"],
        "provider_or_technology": "category-managed-saas",
        "business_criticality": 3,
        "data_sensitivity": 2,
        "vendor_lock_in": 3,
        "portability": 2,
        "replaceability": 2,
        "recovery_capability": 2,
        "observability_clarity": 2,
        "progress_loss_risk": 2,
        "rework_risk": 2,
        "visible_cost": "UNKNOWN",
        "hidden_cost": "UNKNOWN",
        "migration_difficulty": 3,
        "outage_impact": 3,
        "assessment_confidence": "medium",
        "evidence_ids": ["ev-001"],
        "user_must_retain_control": ["source documents"],
    }
    return [
        {**base, "layer_id": lid, **(overrides.get(lid) or {})} for lid in LAYER_IDS
    ]


def skeleton(report_id, mode, summary, recommendations, gates, extra=None):
    d = {
        "schema_version": "1.0",
        "report_id": report_id,
        "generated_at": "2026-08-06T12:00:00Z",
        "question_language": "english",
        "report_mode": mode,
        "executive_summary": summary,
        "layers": layers(),
        "ownership_and_control_matrix": [{"item": "customer documents", "owner": "customer"}],
        "lock_in_portability_matrix": {"summary": "elevated lock-in on data plane"},
        "recovery_assessment": {"checkpoints": False, "notes": "see orchestration layer"},
        "hidden_cost_assessment": {"notes": "re-embedding cost UNKNOWN"},
        "risk_signals": [{"id": "rs-1", "signal": "no_export_path", "evidence_id": "ev-001"}],
        "recommendations": recommendations,
        "authorized_actions": [],
        "roadmap": {
            "immediate": ["document export requirements"],
            "days_30": ["adapter spike"],
            "days_90": ["pilot if metrics pass"],
            "strategic": ["reassess managed vs hybrid"],
        },
        "human_approval_gates": gates,
        "evidence": [
            {
                "id": "ev-001",
                "status": "VERIFIED",
                "statement": "User stated single closed vendor for RAG stack",
                "source": "scenario intake",
                "layer": "data_knowledge",
            }
        ],
        "assumptions": ["usage scale UNKNOWN"],
        "no_bluff_statement": "Scores are qualitative; costs UNKNOWN unless stated.",
        "recommendation_vs_authorized_action_note": "Recommendations are analytical only; authorized_actions empty until user approves.",
    }
    if extra:
        d.update(extra)
    return d


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # Scenario 1: closed vendor RAG — ABSTRACT not blind MIGRATE
    s1 = skeleton(
        "scenario-01-closed-rag",
        "full_assessment",
        "High lock-in; defer full migration; abstract data and model boundaries first.",
        [
            {
                "id": "rec-1",
                "layer_id": "data_knowledge",
                "action": "ABSTRACT",
                "current_problem": "Embeddings tied to proprietary index API",
                "evidence_ids": ["ev-001"],
                "impact_if_unchanged": "Cannot change vector backend without rework",
                "alternatives": ["export-and-reindex pattern", "dual-write shadow index"],
                "selection_rationale": "Lower risk than MIGRATE before export path validated",
                "confidence": "medium",
                "prerequisites": ["export test on sample corpus"],
                "phased_steps": ["spike export", "measure re-embed cost range"],
                "rollback_plan": "N/A — no production change in phase 1",
                "verification_tests": ["export sample docs", "rehydrate in test index"],
                "human_gate_id": "gate-abstract-01",
                "time_cost_estimate": "1-2 weeks",
                "transition_risks": ["incomplete export API"],
            }
        ],
        [
            {
                "gate_id": "gate-abstract-01",
                "status": "PENDING_HUMAN_APPROVAL",
                "recommendation_action": "ABSTRACT",
                "reason": "Production adapter change",
                "triggers": [],
                "authorized_action": None,
            }
        ],
    )
    s1["layers"][0]["vendor_lock_in"] = 5
    s1["layers"][0]["portability"] = 1

    # Scenario 2: long agent no checkpoints
    s2 = skeleton(
        "scenario-02-long-agent",
        "full_assessment",
        "Orchestration recovery is critical; optimize checkpoints before any provider change.",
        [
            {
                "id": "rec-orch",
                "layer_id": "orchestration_execution",
                "action": "OPTIMIZE",
                "current_problem": "Full job restarts on single task failure",
                "evidence_ids": ["ev-001"],
                "impact_if_unchanged": "Progress loss on long research runs",
                "alternatives": ["checkpoint to durable store", "task-level idempotency"],
                "selection_rationale": "Failure cost dominates; not a migration problem",
                "confidence": "high",
                "prerequisites": ["identify resumable units"],
                "phased_steps": ["add checkpoint store", "resume integration test"],
                "rollback_plan": "Feature flag checkpoints off",
                "verification_tests": ["kill worker mid-run", "resume completes"],
                "human_gate_id": "gate-opt-01",
                "time_cost_estimate": "2-4 weeks",
                "transition_risks": ["state schema churn"],
            }
        ],
        [
            {
                "gate_id": "gate-opt-01",
                "status": "PENDING_HUMAN_APPROVAL",
                "recommendation_action": "OPTIMIZE",
                "reason": "Touches production job runner",
                "triggers": ["hard_to_reverse"],
                "authorized_action": None,
            }
        ],
    )
    s2["layers"][5]["recovery_capability"] = 0
    s2["layers"][5]["progress_loss_risk"] = 5
    s2["recovery_assessment"] = {"checkpoints": False, "resume": False}

    # Scenario 3: enterprise sensitive hybrid
    s3 = skeleton(
        "scenario-03-enterprise",
        "architecture_transition_advisor",
        "Hybridize data plane; defer model migration; gates on PII movement.",
        [
            {
                "id": "rec-hybrid",
                "layer_id": "data_knowledge",
                "action": "HYBRIDIZE",
                "current_problem": "PII in managed vector without residency controls",
                "evidence_ids": ["ev-001"],
                "impact_if_unchanged": "Compliance exposure UNKNOWN without DPA review",
                "alternatives": ["self-hosted vector enclave", "customer-managed keys with hosted service"],
                "selection_rationale": "data movement to production hybrid",
                "confidence": "low",
                "prerequisites": ["legal review"],
                "phased_steps": ["pilot non-prod copy", "validate residency"],
                "rollback_plan": "Revert routing to current managed index",
                "verification_tests": ["residency checklist", "access audit"],
                "pilot_plan": {"scope": "non-prod subset", "duration": "2-4 weeks"},
                "human_gate_id": "gate-hybrid-01",
                "time_cost_estimate": "UNKNOWN",
                "transition_risks": ["data movement", "production"],
            }
        ],
        [
            {
                "gate_id": "gate-hybrid-01",
                "status": "PENDING_HUMAN_APPROVAL",
                "recommendation_action": "HYBRIDIZE",
                "reason": "PII data movement",
                "triggers": ["pii_data", "data_delete_replace_transfer"],
                "authorized_action": None,
            }
        ],
    )
    s3["layers"][0]["data_sensitivity"] = 5

    invalid = skeleton(
        "invalid-migrate",
        "full_assessment",
        "Should fail validation",
        [
            {
                "id": "rec-bad",
                "layer_id": "models",
                "action": "MIGRATE",
                "current_problem": "Different vendor",
                "evidence_ids": ["ev-001"],
                "confidence": "low",
                "human_gate_id": "missing-gate",
                "selection_rationale": "different vendor only",
            }
        ],
        [],
    )

    (OUT / "report-scenario-01-valid.json").write_text(json.dumps(s1, indent=2), encoding="utf-8")
    (OUT / "report-scenario-02-valid.json").write_text(json.dumps(s2, indent=2), encoding="utf-8")
    (OUT / "report-scenario-03-valid.json").write_text(json.dumps(s3, indent=2), encoding="utf-8")
    (OUT / "report-scenario-invalid-migrate.json").write_text(json.dumps(invalid, indent=2), encoding="utf-8")
    print("Wrote fixtures to", OUT)


if __name__ == "__main__":
    main()
