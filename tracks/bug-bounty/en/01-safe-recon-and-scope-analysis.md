# 01 — Safe Recon and Scope Analysis

## Goal
Organize **non-destructive** reconnaissance and scope facts. No bypass, stealth, credential attacks, brute force, or exploit automation.

## What “safe recon” means here
- Reading **official** program documentation and policy pages
- Organizing domains/assets **the program already listed**
- Noting publicly documented technologies (e.g. from their own engineering blogs)
- Building a **scope ledger** (claims vs verified facts)
- Conceptual attack-surface notes — not live intrusive probing

Live-target examples in this module stay **informational**. Anything more intrusive → local lab (module 02).

## Scope ledger template
| Asset | Source of truth | In scope? | Allowed activities (verbatim) | Evidence link/note | Status |
|---|---|---|---|---|---|
| example.com | Program policy §2 | Yes/No/Unclear | … | URL + date | VERIFIED / ASSUMPTION |

Rules:
- Mark **ASSUMPTION** distinctly from **VERIFIED**.
- Unclear → do not test; ask program or switch to lab.

## RCTC prompts (safe)
### A. Policy digest
Role: security documentation analyst  
Context: paste program policy excerpt (public)  
Task: extract in-scope assets, out-of-scope items, rate limits, prohibited tests  
Constraints: quote policy; no recommendations to test out-of-scope; flag ambiguities as STOP

### B. Scope ledger builder
Role: bug-bounty coordinator  
Context: list of assets from the program page only  
Task: produce a scope ledger table  
Constraints: no scanning advice; every row needs a source

### C. Technology notes (public only)
Role: defensive researcher  
Context: vendor’s public tech blog / security.txt / disclosed stack  
Task: summarize technologies as *reported publicly*  
Constraints: label confidence; do not invent hidden services

## Out of bounds for this module
Port scanning campaigns, fuzzing production, credential stuffing, social engineering, WAF bypass guides, stealth techniques.

## Hand-off
Run Scope Guard before any lab that simulates HTTP against localhost, and before any authorized program work.
