# Human Approval Gates

## States

| State | Meaning |
|-------|---------|
| `APPROVED` | User explicitly authorized a high-impact action |
| `PENDING_HUMAN_APPROVAL` | Analysis complete; execution blocked until approval |
| `DEFER` | Insufficient evidence to finalize |
| `REJECT` | Analysis recommends not proceeding |

## Mandatory `PENDING_HUMAN_APPROVAL` before final high-impact plan

Applies to recommendations of type:

- `MIGRATE`
- `SELF-HOST`
- `MANAGED_SERVICE`
- `HYBRIDIZE` when it includes **production data movement** or **production architecture change**

Also when any trigger applies:

- PII, health, financial, or legal-hold data affected
- Paid cost incurred
- Data delete, replace, or transfer
- Cloud resource creation
- Commit, Push, or Deploy
- Hard-to-reverse step

## Analytical-only (no auto-execution)

`KEEP`, `OPTIMIZE`, `ABSTRACT`, `DEFER`, `REJECT` may appear in reports as **recommendations**.

Any **implementation** derived from them still requires approval when high-impact triggers apply.

## Gate object (machine-readable)

```json
{
  "gate_id": "gate-migrate-vector-01",
  "status": "PENDING_HUMAN_APPROVAL",
  "recommendation_action": "MIGRATE",
  "reason": "Production embeddings store move",
  "triggers": ["data_delete_replace_transfer", "paid_cost"],
  "authorized_action": null
}
```

`authorized_action` is `null` until user sets `APPROVED` with explicit scope.
