# SAFETY_MODEL — Ethical Bug-Bounty Training

## Purpose
Defensive education: authorization discipline, safe labs, evidence, responsible disclosure.

## Allowed targets
1. Local labs owned by the learner  
2. Deliberately vulnerable training environments  
3. CTF/demo educational targets  
4. Official bug-bounty programs only when asset is in scope and rules permit the activity  

## Default deny
If authorization or scope is uncertain → **STOP** → `USE_LOCAL_LAB` or `INSUFFICIENT_SCOPE_EVIDENCE`.

## Never taught / automated here
Persistence, credential theft, phishing, malware, destructive actions, stealth/evasion, privilege abuse, DoS, mass exploitation, out-of-scope testing, bypassing program restrictions, hiding activity from defenders.

## Execution integration (if wired to an engine)
| Setting | Default |
|---|---|
| side_effect_level | `none` |
| network | `false` |
| live target execution | not auto-enabled |
| uncertainty | STOP/GAP |

## Scope Guard
Validates **declared** context only. Does not create legal authorization. Official program policy always overrides training text.

## Secrets
No real credentials in fixtures. Validator rejects common secret patterns.

## Pro layer
`pro/` adds pedagogy depth for Coffee Pass supporters — still bound by this safety model.
