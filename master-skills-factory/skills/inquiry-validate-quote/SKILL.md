---
name: inquiry-validate-quote
description: >
  Parse customer free-text choices, validate completeness, apply pricing guardrails,
  and emit INCOMPLETE_RFQ or APPROVED_QUOTATION. Rejects prompt/price injection.
  Use for trade-desk quotation logic without claiming live messaging.
---

# inquiry-validate-quote

```text
parseInquiry → validateParsed → priceInquiry → buildAssessment
```

Hard rules (from Saqr trade-desk evidence):
- Message prices never become sell prices.
- Market reference ≠ today's sell price.
- Approved quotation requires approval + availability + explicit issue actor.
- Incomplete RFQ has **no** grand total.

Verify: `npm test` — injection, reconciliation, approved path.
