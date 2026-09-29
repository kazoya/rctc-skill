# bug-bounty-scope-guard

Validates a **learner-declared** authorization context JSON.

It does **not** scan targets and does **not** independently verify HackerOne / YesWeHack / Intigriti (or any) legal authorization.

## Decisions
| Decision | Meaning |
|---|---|
| `USE_LOCAL_LAB` | Local/synthetic/CTF lab — proceed in-lab only |
| `DECLARED_SCOPE_CONTEXT_ACCEPTED` | Declaration is internally consistent; **human must still confirm** live scope. `authorization_verified_by_rctc: false` |
| `INSUFFICIENT_SCOPE_EVIDENCE` | STOP/GAP — default under uncertainty |
| `OUT_OF_SCOPE` | Declared out of scope |

> This decision validates the supplied declaration only. It does not create or independently verify legal authorization. Official program scope and rules remain authoritative.

```bash
node scope-guard.js ../fixtures/valid/local-lab-context.json
node scope-guard.js ../fixtures/valid/declared-program-context.json
node scope-guard.js ../fixtures/invalid/uncertain-live-target.json
```
