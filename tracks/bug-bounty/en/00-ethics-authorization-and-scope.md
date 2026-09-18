# 00 — Ethics, Authorization, and Scope

**Track:** Ethical Bug-Bounty Training (defensive education)  
**Audience:** Learners practicing responsible vulnerability research

## Purpose
Teach when security testing is allowed, how to read program scope, and when to **STOP**.

## Explicit rule
> Permission is asset-specific and action-specific. A public website is not automatically authorized for security testing.

## Authorization checklist
Before any activity beyond reading public documentation:

1. **Who owns the asset?** (you / your employer with written mandate / a published bounty program)
2. **What asset?** (exact domain, app, API, mobile package — as listed)
3. **What actions?** (passive reading vs authenticated testing vs invasive checks)
4. **What evidence?** (program URL + policy text, written engagement letter, lab ownership)
5. **What is prohibited?** (rate limits, excluded vulnerability classes, out-of-scope assets)

If any answer is uncertain → **STOP** and use a **local/demo lab**.

## In-scope vs out-of-scope
| Concept | Meaning |
|---|---|
| In-scope | Explicitly listed assets/actions the program permits |
| Out-of-scope | Listed exclusions OR anything not clearly included |
| Grey / unclear | Treat as **OUT_OF_SCOPE** until clarified with the program |

## Prohibited categories (never in this track)
Persistence, credential theft, phishing, malware, destructive actions, stealth/evasion, privilege abuse, denial of service, mass exploitation, out-of-scope testing, bypassing program restrictions, hiding activity from defenders.

## Rate limits and safe data handling
- Respect published rate limits and fair use.
- Do not download or retain personal data beyond what is needed for a report.
- Redact secrets and PII in notes and screenshots.
- Store evidence locally with access control; do not paste secrets into public chats.

## Responsible disclosure
- Report through the program’s official channel.
- Do not publicly disclose before rules allow.
- Do not demand payment outside program terms.
- If you find something severe, follow the program’s emergency / critical path.

## When to stop immediately
- Asset not clearly in scope
- Activity not clearly permitted
- You encounter live customer PII you should not retain
- Program asks you to stop
- You are unsure → `USE_LOCAL_LAB`

## Allowed environments for this course
1. Local labs you own  
2. Deliberately vulnerable training apps  
3. CTF/demo targets meant for education  
4. Official bug-bounty programs **only** when the asset is in scope and rules permit the test  

## RCTC prompt (authorization brief)
- **Role:** Security learner following responsible disclosure  
- **Context:** Program name + URL + asset list excerpt  
- **Task:** Decide AUTHORIZED / INSUFFICIENT / OUT_OF_SCOPE / USE_LOCAL_LAB  
- **Constraints:** Default deny; no fuzzy authorization; cite evidence  

Then run `bug-bounty-scope-guard` with that brief.

> Not every rule fits every case — but those who seek excellence keep the night watch. ^_^  
> ليست كل الحكم تصلح دائماً ولكن من طلب العلى سهر الليالي ^_^
