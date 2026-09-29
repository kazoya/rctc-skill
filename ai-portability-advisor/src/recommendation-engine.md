# Recommendation Engine

Vendor-neutral. Compare alternatives by requirements and evidence — never default to a brand.

## Actions

| Action | When |
|--------|------|
| `KEEP` | Fit is adequate; lock-in and recovery acceptable |
| `OPTIMIZE` | Same stack; improve cost, reliability, observability |
| `ABSTRACT` | Add adapter/interface before any swap |
| `HYBRIDIZE` | Split control/data/on-prem vs managed by layer |
| `MIGRATE` | Evidence shows alternative materially better; pilot first |
| `SELF-HOST` | Control/compliance justified; ops cost accepted |
| `MANAGED_SERVICE` | Ops burden exceeds managed premium (evidenced) |
| `DEFER` | Insufficient evidence |
| `REJECT` | Migration/changes cost > benefit |

**Rule:** Provider difference alone does **not** imply `MIGRATE`.

## Transition recommendation block (required for MIGRATE / SELF-HOST / MANAGED_SERVICE / production HYBRIDIZE)

1. `current_problem`
2. `evidence_ids`
3. `impact_if_unchanged`
4. `recommended_action` (enum above)
5. `alternatives` (≥2 when possible)
6. `selection_rationale`
7. `confidence` (`high` \| `medium` \| `low`)
8. `prerequisites`
9. `phased_steps`
10. `rollback_plan`
11. `verification_tests`
12. `time_cost_estimate` (ranges only, e.g. `"2-4 weeks"`, `"UNKNOWN"`)
13. `transition_risks`
14. `human_gate_id` → must be `PENDING_HUMAN_APPROVAL` until approved

## MIGRATE requirements (validator-enforced)

- `pilot_plan` object present
- `rollback_plan` non-empty
- `verification_tests` non-empty
- `human_gate` with `PENDING_HUMAN_APPROVAL` or `APPROVED`
- Not auto-authorized: `authorized_action` separate from `recommendation`
