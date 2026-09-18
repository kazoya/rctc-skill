# VALIDATION_RECEIPT — Portland–Pozzolanic pack

Date: 2026-09-19 (Asia/Amman)
Host: local learner machine
Track: tracks/bug-bounty

## Commands
```
node tracks/bug-bounty/scripts/validate-track.js
# => TRACK_VALIDATOR_PASS { files: 31, authHits: 21, scopeHits: 23, discHits: 4 }

node tracks/bug-bounty/scope-guard/scope-guard.js tracks/bug-bounty/fixtures/invalid/uncertain-live-target.json
# => decision INSUFFICIENT_SCOPE_EVIDENCE / STOP / GAP (exit 1)

node tracks/bug-bounty/scope-guard/scope-guard.js tracks/bug-bounty/fixtures/valid/local-lab-context.json
# => decision USE_LOCAL_LAB / PROCEED_IN_LAB_ONLY (exit 0)
```

## Guarantees in this pack
- No third-party production target required
- No real secrets in fixtures
- Uncertainty defaults to STOP/GAP
- Motto: ليست كل الحكم تصلح دائماً ولكن من طلب العلى سهر الليالي ^_^