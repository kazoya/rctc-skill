# RCTC training tracks

Educational capabilities live under `tracks/<track-id>/` and are registered in `capabilities/`.

## Current
| Capability id | Path | Release state |
|---|---|---|
| `ethical-bugbounty-training` | `tracks/bug-bounty/` | **Unreleased / validated — FROZEN** (no new lessons/Pro bodies/platforms/marketing in this phase) |

Core RCTC skill version remains `1.0.0` in root `SKILL.md` until a deliberate release bumps it.

## Extension point (future work — do not implement here yet)
The track system is **multi-track**. `ethical-bugbounty-training` is not assumed to be the only training capability.

Future independent capabilities may include (examples only):
- `kaggle-competition-lab`
- `coding-competition-lab`
- `data-science-challenge-lab`
- other **authorized** public competitions

Shared infrastructure *may* later include challenge intake, evidence/provenance, experiment ledger, reproducibility, solution review, reusable recipe extraction, and safe cloning of public competition environments **where rules permit**.

Do not add those tracks in the Bug-Bounty workstream unless separately scoped.


## Shared design (reusable)
- Policy Gate proposal: `docs/trust/POLICY_GATE.md`
- Track framework: `docs/trust/TRACK_FRAMEWORK.md`
- Extraction note: `docs/trust/REUSABLE_FROM_BUG_BOUNTY.md`
- Future competitions (note only): `docs/FUTURE_COMPETITION_TRACK.md`
