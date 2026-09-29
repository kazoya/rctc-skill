# Decision Priority (Transition Ordering)

Explain priority in prose; do not output a single opaque score without rationale.

## Factors

| Factor | Role |
|--------|------|
| `business_criticality` | Higher → address sooner |
| `lock_in_risk` | Higher → prioritize abstraction or planned migration |
| `failure_cost` | Higher → prioritize recovery/orchestration |
| `rework_cost` | Higher → prefer OPTIMIZE/ABSTRACT before MIGRATE |
| `migration_effort` | Higher → defer unless lock-in or failure cost dominates |
| `security_compliance` | Raises bar for evidence; may force HYBRIDIZE/SELF-HOST |
| `expected_savings` | Only when evidenced; else UNKNOWN |
| `reversibility` | Low reversibility → pilot + gate |
| `evidence_confidence` | Low → DEFER or conditional recommendations |

## Priority bands (roadmap)

1. **Immediate (low risk):** ABSTRACT interfaces, export tests, observability, secrets hygiene, idempotency
2. **30 days:** Pilots, adapter layers, checkpoint design, cost attribution
3. **90 days:** Controlled migrations with rollback, hybrid cutovers
4. **Strategic:** Full provider changes only after pilot success metrics

## Equation (conceptual)

```
priority_score ∝ (business_criticality + lock_in_risk + failure_cost) 
                 − migration_effort 
                 + evidence_confidence_weight
```

Tie-break: **recovery and data sovereignty** before cosmetic tool changes.
