# Security Review — Self-Pulse Free (0.1.0)

| Topic | Status |
|---|---|
| Secrets in repo | None |
| Network I/O in core | None (offline) |
| Customer isolation | Enforced via `assertAccess` / `ISOLATION_VIOLATION` |
| CSAT fabrication | Blocked |
| Consciousness claims in revisions | Blocked |
| PII | Pseudonymous IDs only; no live collection in tests |
| Retention / deletion | `retentionDays` field + `deleteAll` |
| Supply chain | Zero runtime dependencies |

## Limitations

- Free edition persistence is **in-process** only — not durable across restarts.
- Callers must supply **externally verified** outcomes; the skill does not trust the model to grade itself.
- Not a substitute for production IAM, encryption-at-rest, or legal consent workflows.

## Marketplace notes

Before any Agensi / plugin listing: run host security checklist, redact fixtures, confirm premium sources are **excluded** from the public tarball.
