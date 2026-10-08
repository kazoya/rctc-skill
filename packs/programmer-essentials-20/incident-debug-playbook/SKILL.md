---
name: incident-debug-playbook
description: "Run a short production incident loop: impact, mitigation, evidence, then a written follow-up. Use when a live service is failing and the user needs a calm sequence rather than a refactor."
---

# incident-debug-playbook

1. Impact: who is affected, since when, which route or job.
2. Mitigation before root cause: rollback, feature flag, or scale — pick the one the repo already supports.
3. Evidence: one dashboard, one log query, or one failing health check. Save the request id.
4. Fix forward only after mitigation holds.
5. Follow-up note: trigger, what mitigated, what still needs a test.

Do not restart everything at once. Do not delete production data as a first step.
