# RCTC Execution Contract v1

## Commands
| Command | Side effects |
|---|---|
| `dpf plan` | none |
| `dpf run --stage inspect` | read-only |
| `dpf run --stage build` | reversible local writes (adapter-bound) |
| `dpf run --stage verify` | tests/checks only |
| `dpf run --stage package` | local artifacts (ledger, recipe candidate) |
| `dpf run --stage publish` | OWNER GATE — no auto deploy in v1 |

## Identity
Compose skill ids must match `registry/skills.json` **exactly**.
Unknown id → **STOP / GAP**. Near-misses are listed for humans only — never auto-executed.

## Step record (ledger)
Every step records: skill/capability id, input, output, duration_ms, status, evidence, files_changed, side_effect_classification, verification, next_step.

## Adapters
Stages execute through adapters under `adapters/`, not giant prompts.
Missing adapter → GAP/STOP.

## Learning loop
Execution Ledger → Recipe Candidate → (on recurrence) Candidate Skill  
Promotion: Validate → Review → Test → Owner approval → Publish.
