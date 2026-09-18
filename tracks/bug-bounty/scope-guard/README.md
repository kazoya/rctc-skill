# bug-bounty-scope-guard

Validates a learner’s **declared authorization context**.  
**Does not scan** and does not grant legal permission by itself.

```bash
node scope-guard.js ../fixtures/valid/local-lab-context.json
node scope-guard.js ../fixtures/invalid/uncertain-live-target.json
```

Decisions: `AUTHORIZED_FOR_DECLARED_ACTIVITY` | `INSUFFICIENT_SCOPE_EVIDENCE` | `OUT_OF_SCOPE` | `USE_LOCAL_LAB`  
Default when uncertain: **`INSUFFICIENT_SCOPE_EVIDENCE`** (STOP/GAP).
