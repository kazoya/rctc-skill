# 03 — Report Writing (HackerOne / YesWeHack / Intigriti style)

**Track:** Ethical Bug-Bounty Training  
**Tier:** Core (Free / MIT) + mentor checklists (Pro / Coffee Pass)

## Goal
Write clear, honest, triage-friendly vulnerability reports. Never exaggerate severity. Never claim impact you did not demonstrate.

## Golden rule
> A technical observation is not automatically a security impact. Impact is proven with minimal, in-scope (or in-lab) reproduction.

## Professional template
1. **Title** — asset + issue class, concise
2. **Summary** — 3–5 sentences: what / where / who / why it matters
3. **Asset** — exact in-scope identifier (or local lab URL)
4. **Program scope confirmation** — quote/link policy; why this asset/action is allowed
5. **Preconditions** — accounts, roles, feature flags
6. **Steps to reproduce** — numbered, minimal, deterministic
7. **Evidence** — redacted requests/responses, screenshots, timestamps
8. **Security impact** — who can do what to whom
9. **Severity rationale** — map to the program’s scale; show your work
10. **Suggested remediation** — practical, defensive
11. **Disclosure notes** — timeline expectations; no public post yet

## Technical observation vs demonstrated impact
| Technical observation | Demonstrated security impact |
|---|---|
| “Parameter reflects input” | “Unauthenticated user can execute script in victim session *in this lab*” with proof |
| “Endpoint returns 500” | Impact only if it leaks sensitive data or breaks auth — prove it |
| “Outdated library listed” | Needs a reachable path **or** program accepts version findings — check policy |

If you only have an observation, say so. Do not inflate CVSS without evidence.

## What never goes in a report
- Real secrets, keys, or full personal data
- Offensive steps against third-party production
- Threats of public disclosure to pressure payment

## RCTC report coach prompt
- **Role:** triage-friendly technical writer  
- **Context:** your notes + redacted local-lab evidence  
- **Task:** fill the template; flag weak impact claims  
- **Constraints:** no severity inflation; mark unknowns as UNKNOWN; keep secrets redacted

## Practice (Free)
First three reports from `examples/lab/` and `examples/synthetic/` only — no third-party production targets.

## Pro add-on (Buy Me a Coffee / Coffee Pass)
Mentor pre-submit checklists and annotated sample reports live under `pro/` after Coffee Pass verification — see `docs/BUG_BOUNTY_PACKAGING_PROPOSAL.md`.

> Track motto: Not every rule fits every case — but those who seek excellence keep the night watch. ^_^  
> ليست كل الحكم تصلح دائماً ولكن من طلب العلى سهر الليالي ^_^
