# Example — Architecture cell

Use when the change would introduce lock-in or reorder milestones.

## TASK (illustrative)

Should OmniAgent M3 ingestion use Playwright stealth because some sites block fetch?

## RISK

HIGH for stack choice (new runtime, ops, cost). The feature itself is still M3.

## THINK

```
TASK: Decide fetch vs Playwright for first ingestion slice.
CURRENT STATE: [VERIFIED] PORTFOLIO.md says HTML fetch + markdown is enough for Aha. [VERIFIED] no crawler exists.
DESIRED STATE: A written [DECISION] with OPTION / BENEFIT / COST / RISK / LOCK-IN / RECOMMENDATION.
SCOPE: decision record only, unless user authorizes implementation.
NON-GOALS: implementing the crawler in the same cell as the decision unless explicitly combined.
```

## AGENTS

| Role | Agent |
|------|--------|
| Architect | Architecture Supervisor / Architect Agent |
| Builder | Documentation Agent (DECISIONS.md) only if recording is in scope |
| Security | only if the decision includes credentialed crawling or proxy abuse |
| Verifier | ArchitectureVerifier |

## Required comparison

| OPTION | BENEFIT | COST | RISK | LOCK-IN |
|--------|---------|------|------|---------|
| HTTP fetch + HTML→markdown | Simple, fits 20s Aha | Fails on JS-heavy/blocked sites | Incomplete corpus | Low |
| Playwright | Renders JS, some anti-bot | Heavy, flaky, slower | Ops + ToS | Medium-high |

Recommendation must cite PORTFOLIO.md: do not add Playwright in week one unless a verified blocked-site failure exists.

## PROVE

A decision artifact exists. No Playwright dependency in `package.json` unless that option was approved **and** implementation was authorized.
