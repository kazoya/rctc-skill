# QUALITY GATES

Not every tiny task requires every gate. Scale by risk.

| Risk | Required gates |
|------|----------------|
| LOW | 0, 2, 5, 8 (skip 8 if Verifier is the only reviewer) |
| MEDIUM | 0–6, 8–9 |
| HIGH | 0–9 including 7 |

---

## GATE 0 — Task understood

THINK contract exists. Labels `[VERIFIED]` `[ASSUMPTION]` `[UNKNOWN]` `[DECISION]` applied. Unknowns are not treated as facts.

## GATE 1 — Scope approved

Matches PORTFOLIO.md. Non-goals listed. No silent promotion of deferred product work.

## GATE 2 — Implementation completed

Files exist that implement the behavior. Not empty scaffolds claiming success.

## GATE 3 — Static checks pass

Lint / typecheck / format as this repo defines. If a command was not run, record `NOT EXECUTED` — do not invent PASS.

## GATE 4 — Automated tests pass

Meaningful tests for the change. Skip only when the milestone has no test runner yet; then Gate 5 is mandatory.

## GATE 5 — Runtime behavior verified

The app or command actually did the thing. Example: page loads and URL input is visible.

## GATE 6 — Architecture review pass

Supervisor (or Architect on high risk) confirms no unauthorized stack change.

## GATE 7 — Security review when relevant

Required for auth, RLS, secrets, payments, data deletion, tenancy, prompt-injection surfaces.

## GATE 8 — Independent acceptance

Verifier verdict is `PASS` or `PASS_WITH_NOTES`. `REWORK_REQUIRED` and `BLOCKED` fail the gate.

## GATE 9 — Project truth updated

PORTFOLIO.md (and registered brief) reflect the new verified state. Historical claims not rewritten.

---

## Gate failure

Do not patch randomly. Follow [FAILURE_PROTOCOL.md](FAILURE_PROTOCOL.md).
