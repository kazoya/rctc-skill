# Policy Gate / Authorization-Context Gate (design proposal)

Status: **design only** — not a new runtime package in this round.  
Bug-Bounty Scope Guard is one **domain adapter** that already proves the pattern.

## North star
Every successful domain implementation should leave behind a reusable RCTC capability — not an isolated feature tree.

## Problem
Domain work repeatedly needs:

```text
declared context → validation → uncertainty → STOP/GAP → human confirmation
```

Hard-coding that as `bug-bounty-scope-guard` prevents reuse for security, deploy, finance, external APIs, competitions, data usage, and publishing.

## Proposed generic component
**Name (preferred):** `policy-gate`  
**Alias:** `authorization-context-gate`

### Non-goals
- Not a scanner
- Not a legal authority
- Not independent verification of third-party program authorization
- Not automatic approval of live side effects

### Inputs (domain-agnostic)
| Field | Meaning |
|---|---|
| `domain` | Adapter id (e.g. `bug-bounty`, `deploy`, `competition-rules`) |
| `declared_context` | Structured claim the human/system asserts |
| `evidence` | Pointers/quotes the claimant supplies |
| `intended_action` | What would happen next |
| `uncertainty` | Explicit unknown flag |
| `side_effect_class` | `none` / `local` / `network` / `publish` / `financial` / … |

### Core decisions (conservative semantics)
| Decision | Meaning |
|---|---|
| `ACCEPTED_DECLARATION` | Declaration is internally consistent; **not** independently verified |
| `INSUFFICIENT_EVIDENCE` | Missing/weak evidence → default deny |
| `POLICY_DENIED` | Explicitly out of policy / out of scope |
| `HUMAN_CONFIRMATION_REQUIRED` | Live or high-impact path needs a human |
| `USE_SAFE_SUBSTRATE` | Proceed only on local/synthetic/sandbox substrate (lab analog) |
| `STOP` / `GAP` | Do not continue the side-effecting path |

**Unknown is not approval.**

### Required output fields
```json
{
  "component": "policy-gate",
  "decision": "ACCEPTED_DECLARATION",
  "authorization_verified_by_rctc": false,
  "human_confirmation_required": true,
  "side_effect_level": "none",
  "note": "Validates the supplied declaration only. Does not create or independently verify legal/policy authorization. Authoritative policy remains external."
}
```

### Domain adapters
| Adapter | Declared context examples | Maps today to |
|---|---|---|
| `bug-bounty` | program URL, asset, claimed scope | `tracks/bug-bounty/scope-guard` (`DECLARED_SCOPE_CONTEXT_ACCEPTED` ≈ `ACCEPTED_DECLARATION`) |
| `deploy` | target env, owner flag, artifact digest | future |
| `financial` | amount, payee, mandate | future |
| `external-api` | endpoint class, credential scope | future |
| `competition-rules` | contest ToS, data license, clone rules | future (see `docs/FUTURE_COMPETITION_TRACK.md`) |
| `publish` | channel, disclosure window | future |

### Relationship to Trust Kernel
Policy Gate answers **may we proceed under declared policy?**  
Trust Kernel answers **may this adapter touch the machine / network / ledger under declared capabilities?**

They compose:

```text
policy-gate (domain declaration) → capability sandbox (adapter permissions) → ledger (evidence)
```

If either gate is uncertain → **STOP/GAP**.

## Implementation plan (later)
1. Extract shared decision vocabulary into `packages/policy-gate` or `digital-presence-factory/lib/policy-gate.js`
2. Keep Bug-Bounty guard as a thin adapter (no lesson churn)
3. Wire Trust Kernel canaries to assert `authorization_verified_by_rctc !== true` never appears as a bypass

Do **not** implement the package in the Bug-Bounty freeze round.
