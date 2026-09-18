# Canonical Capability vs Installation

| Concept | Meaning |
|---|---|
| **Canonical Capability** | One logical skill id (`canonical_id`) used in recipes and execution |
| **Installation / Vendored Copy / Host Install / Variant** | Physical path where SKILL.md appears |

`registry/skills.json` remains the **discovery scan** (may list many paths).
`registry/canonical.json` is the **identity model** for execution.

Public metric example:
> 24 canonical capabilities (41 discovered installations/copies — not independent skills)

Ambiguous compose id → STOP/GAP.
