---
name: verified-trade-outcome
description: >
  Record verified outcomes after a desk assessment. CSAT stays unknown without
  explicit feedback. Use with evidence-before-claim for trade-desk results.
---

# verified-trade-outcome

Call `verifyOutcome(assessment, actual)` only after an independent success/fail signal.

- Missing pre-state → fail closed.
- Missing CSAT → `unknown` (never invent satisfaction).
- Pair with local store persistence tests for tenant isolation.
