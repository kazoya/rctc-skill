---
name: shadowwalk-qa
description: Evidence-driven autonomous user-journey QA for authorized web apps. Explore roles, routes, authentication, API/database consistency, edge cases, accessibility, and regression tests using disposable accounts and safe browser automation; produce reproducible findings and a remediation loop.
---

# ShadowWalk QA — Human-Journey Verification

## Purpose
Act as a skeptical real customer, not a screenshot collector. Explore the authorized application through realistic user journeys and compare UI promises against observable API responses, persistence, authorization, and business invariants. Never claim exhaustive or zero-defect coverage.

## Pair with existing RCTC skills
1. `rctc-method`: define roles, target, acceptance criteria and constraints.
2. `safe-forward-execution`: authorization, reversible actions and hard stops.
3. `logged-in-browser`: reuse the owner's existing authenticated browser only when explicitly authorized; verify session isolation.
4. `owner-credential-vault`: no plaintext passwords or committed auth state.
5. `evidence-before-claim`, `htpaap`, `test-first-slice`, `sql-migration-safety`: evidence, regression and safe repairs.

## Entry contract
Capture: exact allowlisted origins, environment (prefer local/staging), authorized test accounts and roles, seeded disposable dataset, supported browser/device matrix, permitted external integrations, database read-only access method, known invariants, and explicit destructive-action policy. Default to **read-only discovery**. Never sign up with third-party identities, initiate OAuth consent, send messages, purchase, delete, mutate production data, or use a real customer's account without specific approval. Never bypass CAPTCHA, MFA, access controls or rate limits. For Google login, use a dedicated test identity and approved OAuth test configuration; stop at a human gate if consent, OTP or passkey is required.

## Execution algorithm
1. **Inventory:** read routes, sitemap, navigation, code-defined role gates, forms, API contracts, DB schema/migrations and existing tests. Mark discovered versus inferred routes.
2. **Model:** construct a role × state × journey matrix, including guest, newly registered, verified, normal user, admin (if authorized), expired session, validation failure, retry, refresh, back, duplicate submission, interrupted network, RTL/keyboard and mobile.
3. **Prioritize:** risk-weight payments, permissions, identity, data integrity and irreversible actions. Apply pairwise combinations and boundary values; don't pretend to enumerate all possible states.
4. **Execute:** use Playwright or an approved browser driver against allowlisted origins; use stable locators and bounded retries. Capture timestamps, step IDs, browser version, sanitized screenshots, console/network failures, HTTP status and trace. A click is not evidence of success.
5. **Cross-check:** where authorized, compare visible outcome with API response and read-only DB snapshot or test-only queries. Check ownership/tenant isolation, transaction atomicity, idempotency, referential integrity, orphan records and stale cache. Do not execute DB writes or production migrations.
6. **Classify:** CONFIRMED_BUG, SUSPECTED_RISK, ENVIRONMENT_BLOCKER, TEST_GAP or PASS. Assign severity, confidence, reproducibility and affected role/journey. Distinguish backend faults from flaky tests.
7. **Report:** emit machine-readable JSON and readable Markdown, with redacted evidence references, precise repro steps, expected/actual, observed DB/API proof, tested and untested paths, and a coverage denominator.
8. **Remediate:** create a ranked fix plan; only implement scoped authorized changes in a separate branch. Add regression tests, rerun affected journeys plus smoke suite, compare before/after evidence and leave unresolved items open. No silent self-approval of release.

## Minimum report contract
```json
{
  "run_id": "shadowwalk-YYYYMMDD-001",
  "target": {"environment": "staging", "origins": ["https://staging.example.test"]},
  "authorization": {"scope_confirmed": false, "destructive_actions": false},
  "coverage": {"planned": 0, "executed": 0, "passed": 0, "failed": 0, "blocked": 0, "not_tested": 0},
  "findings": [{
    "id": "SW-001", "status": "CONFIRMED_BUG", "severity": "high",
    "confidence": "high", "role": "customer", "journey": "registration",
    "steps": [], "expected": "", "actual": "", "evidence": [],
    "api_observation": null, "db_observation": null, "suggested_regression": ""
  }],
  "limitations": [], "next_actions": []
}
```

## Stop and integrity rules
- Never export secrets, tokens, personal data, raw cookies, full database dumps or unredacted traces to reports or Git.
- Use synthetic fixtures; clean up only disposable test data when cleanup is expressly authorized.
- Do not equate an absent console error with a passing test, or a 200 response with a correct transaction.
- If browser, API or DB access is unavailable, mark the corresponding assertion **UNVERIFIED** rather than inventing evidence.
- Limit autonomous exploration by time, request rate and action budget. Stop on unexpected external effects.
- Do not merge, deploy or mark production-ready without owner review and explicit release gates.

## Upstream inspiration (reference only; not vendored)
- Playwright: https://github.com/microsoft/playwright
- Browser Use: https://github.com/browser-use/browser-use
- Stagehand: https://github.com/browserbase/stagehand
- OWASP Web Security Testing Guide: https://github.com/OWASP/wstg

These are references to evaluate, not proof of installed dependencies, verified integrations, or license compatibility.
