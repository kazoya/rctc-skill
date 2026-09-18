# 03 — Report Writing (HackerOne / YesWeHack / Intigriti style)

## Goal
Write clear, honest vulnerability reports. Never exaggerate severity.

## Template
1. **Title** — concise, specific (asset + issue class)
2. **Summary** — 3–5 sentences
3. **Asset** — exact in-scope identifier
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
| “Endpoint returns 500” | Only an impact if it leaks sensitive data or breaks auth — prove it |
| “Outdated library listed” | Impact requires reachable exploit path **or** program accepts version findings — check policy |

If you only have an observation, say so. Do not inflate CVSS mentally without evidence.

## RCTC report coach prompt
Role: triage-friendly technical writer  
Context: your notes + redacted evidence  
Task: fill the template; flag weak impact claims  
Constraints: no severity inflation; mark unknowns as UNKNOWN; keep secrets redacted

## Practice
Use `examples/lab/` findings only for your first three reports.
