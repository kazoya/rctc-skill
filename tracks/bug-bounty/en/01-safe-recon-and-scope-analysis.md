# 01 — Safe Recon and Scope Analysis

**Boundary:** **Non-destructive** reconnaissance only. Anything more intrusive → local lab.

## Purpose
Organize public knowledge and program documentation into a clear scope ledger — without bypass, stealth, or credential attacks.

## Allowed in this module
- Reading official program documentation and scope policy
- Organizing domains/assets **the program declared**
- Identifying technologies from published public information
- Documenting attack surface **conceptually** (asset/interface inventory)
- Maintaining a scope ledger
- Distinguishing assumptions from verified facts

## Explicitly forbidden
Bypass, stealth, credential attacks, brute force, exploit automation, out-of-scope testing, or any unauthorized live activity.

## Scope ledger (minimum fields)
| Field | Example |
|---|---|
| program_url | Policy URL you read |
| asset | Exactly as listed |
| in_scope | true/false with quote |
| allowed_actions | read / auth’d test / … as stated |
| rate_limits | As stated or UNKNOWN |
| evidence_date | Date you read the policy |
| assumptions | What is not yet verified |

## RCTC prompts (organization only)
### A) Policy digest
- **Role:** scope-compliance assistant  
- **Context:** policy text copied locally  
- **Task:** table of allowed/excluded assets + rate limits  
- **Constraints:** no scan suggestions; UNKNOWN when unclear

### B) Ledger builder
- **Role:** security records keeper  
- **Task:** turn notes into ledger rows; mark assumptions  
- **Constraints:** assumption ≠ authorization

## Live targets
Live-target examples in training stay **informational and non-destructive**. Anything more intrusive runs only on a local lab you own.

Then run: `node scope-guard/scope-guard.js <context.json>`

> Not every rule fits every case — but those who seek excellence keep the night watch. ^_^
