---
name: verified-trade-outcome
description: >
  Record verified outcomes after a desk assessment. CSAT stays unknown without
  explicit feedback. Enforces tenant isolation and idempotent case persistence
  for synthetic local stores. Use with evidence-before-claim.
version: 0.2.0
compatibility: node>=18, master-skills-factory>=0.2
---

# verified-trade-outcome

## When to use
After an independent success/fail signal for a desk case.

## Inputs
`verifyOutcome(assessment, { success, csat? })` plus optional `storeDir`/`tenantId`.

## Outputs
```json
{ "verified": true, "csat": "unknown|number", "success": "boolean?", "code": "MISSING_PRE?" }
```

## Success example
`verify: { success: true }` → `csat: unknown`, `verified: true`.

## Failure
Missing assessment pre-state → `MISSING_PRE`. Cross-tenant read → `FORBIDDEN`.

## Security
Authorization checked server-side in `submitCase`/`readCase`. Idempotent hash replay.

## Tests
`test/money-tenant.test.js`, acceptance verified outcome per sector.

## Limitations
Local JSON store is a **prototype**, not production multi-tenant DB.

## Provenance
Composes Saqr store tenant forbid + RCTC evidence-before-claim norms.
