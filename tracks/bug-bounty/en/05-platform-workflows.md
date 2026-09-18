# 05 — Platform Workflows (high-level)

## Governing notice
> The current official program policy **always overrides** this training material.

Do not hard-code payout amounts, disclosure windows, or accepted categories here — they change. Read the live policy before every engagement.

## High-level differences (may change)
| Theme | HackerOne | YesWeHack | Intigriti | Similar programs |
|---|---|---|---|---|
| Access | Invite / public per program page | Per program page | Per program page | Read the program page |
| Scope | Assets + policy in-program | Scope in-program | Scope in-program | Official source only |
| Reporting | Through the platform | Through the platform | Through the platform | Official channel only |
| Disclosure | Program policy | Program policy | Program policy | No public post before permission |

This is a **conceptual** learning table — not a guarantee of today’s platform behavior.

## Safe habits on any platform
1. Save the program URL and the date you read the policy
2. Run `bug-bounty-scope-guard` on your declared context before any activity beyond reading
3. On uncertainty → `INSUFFICIENT_SCOPE_EVIDENCE` / `USE_LOCAL_LAB`
4. Never test assets outside the explicit list
5. Never treat “public website” as automatic authorization

## What this track will not do
- Will not log into your platform accounts
- Will not claim live testing or bounty payouts
- Will not bypass program restrictions

## RCTC policy-reader prompt (read-only)
- **Role:** scope-compliance assistant  
- **Context:** policy text copied locally for study  
- **Task:** extract allowed assets, exclusions, and rate limits  
- **Constraints:** do not propose live testing; if text missing → STOP

## Practice
Using a **synthetic** local policy file you create, build a scope ledger with network access off.

> Not every rule fits every case — but those who seek excellence keep the night watch. ^_^  
> ليست كل الحكم تصلح دائماً ولكن من طلب العلى سهر الليالي ^_^
