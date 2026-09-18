# Training Track Framework (generic)

Status: **structural convention** — Bug-Bounty is frozen as one Unreleased consumer.

## Layout
```text
tracks/<track-id>/
capabilities/<capability-id>.json
```

`tracks/README.md` is the index. Tracks must not assume Bug-Bounty is the only capability.

## Track contract (minimum)
| Artifact | Purpose |
|---|---|
| `README.md` | Purpose, safety, how to validate |
| `SAFETY_MODEL.md` or equivalent | Allowed substrates + default deny |
| Domain policy adapter (optional) | Uses Policy Gate semantics |
| `examples/` | Local/synthetic only by default |
| Validator script | Corpus + fixture checks |
| Capability manifest | `release_state`, `side_effect_level`, `network`, uncertainty behavior |

## Frozen consumer
| Capability | Path | State |
|---|---|---|
| `ethical-bugbounty-training` | `tracks/bug-bounty/` | **Unreleased / validated** — do not add lessons, Pro bodies, platforms, or marketing now |

Public Pro for that track remains **catalog-only** (`pro/README.md`).

## Future tracks (not implemented here)
See `docs/FUTURE_COMPETITION_TRACK.md`. Examples: `kaggle-competition-lab`, `coding-competition-lab`, `data-science-challenge-lab`.

## Hard rule
Do not hard-code Bug-Bounty vocabulary into shared track infrastructure. Shared pieces speak Policy Gate / Trust Kernel language; domain adapters translate.
