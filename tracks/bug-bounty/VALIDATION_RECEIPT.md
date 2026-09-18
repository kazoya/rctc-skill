# VALIDATION_RECEIPT — pre-push

## Expected
```
node tracks/bug-bounty/scripts/validate-track.js
# TRACK_VALIDATOR_PASS … declared_decision: DECLARED_SCOPE_CONTEXT_ACCEPTED, authorization_verified_by_rctc: false

node tracks/bug-bounty/scope-guard/scope-guard.js tracks/bug-bounty/fixtures/valid/local-lab-context.json
# USE_LOCAL_LAB

node tracks/bug-bounty/scope-guard/scope-guard.js tracks/bug-bounty/fixtures/invalid/uncertain-live-target.json
# INSUFFICIENT_SCOPE_EVIDENCE / STOP / GAP

node tracks/bug-bounty/scope-guard/scope-guard.js tracks/bug-bounty/fixtures/invalid/out-of-scope-claim.json
# OUT_OF_SCOPE

node tracks/bug-bounty/scope-guard/scope-guard.js tracks/bug-bounty/fixtures/valid/declared-program-context.json
# DECLARED_SCOPE_CONTEXT_ACCEPTED + authorization_verified_by_rctc:false + human_confirmation_required_for_live_target:true
```

No real secrets. No live target tests.
