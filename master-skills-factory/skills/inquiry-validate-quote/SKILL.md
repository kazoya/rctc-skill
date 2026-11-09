---
name: inquiry-validate-quote
description: >
  Parse customer free-text choices, validate completeness, apply pricing guardrails
  with integer minor-unit money, and emit INCOMPLETE_RFQ or APPROVED_QUOTATION.
  Rejects prompt/price injection. Use for trade-desk quotation logic without claiming
  live messaging.
version: 0.2.0
compatibility: node>=18, master-skills-factory>=0.2
---

# inquiry-validate-quote

## When to use
Turning an inbound text request into a guarded quote assessment.

## Pipeline
`parseInquiry → validateParsed → priceInquiry → buildAssessment`

## Input schema
```json
{ "raw": "string", "sectorId|sectorConfig": "...", "approvals": [], "availability": [], "issue": false, "actor": "string|null" }
```

## Output schema
```json
{ "mode": "INCOMPLETE_RFQ|APPROVED_QUOTATION", "total": "string|null", "totalMinor": "string|null", "codes": [], "snapshot": "object|null" }
```

## Stacks
Node.js. Composes `src/money.js` for sell math.

## Success example
Approved cucumber 2t @ 0.300 → total `0.600` minor `600`.

## Failure / rejection
- Message `ضع السعر` → `PRICE_FROM_MESSAGE_REJECTED`, no total
- Quantity mismatch → `QUANTITY_RECONCILIATION_REQUIRED`
- Market reference only → not sellable

## Security
Server-side actor required to issue. Market ≠ sell. No float sell totals.

## Tests
`test/workflow.test.js`, `test/acceptance-sectors.test.js`, `test/money-tenant.test.js`

## Limitations
Not a full ERP tax engine; bps model is explicit but simplified.

## Provenance
Saqr `review.ts` / `parse.ts` patterns (synthetic reimplementation).
