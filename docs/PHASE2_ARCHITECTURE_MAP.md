# Phase 2 Architecture Map

Date: 2026-09-18

## Existing pipeline (responsibilities)

| Layer | Path | Owns | Must not own |
|---|---|---|---|
| Start Skill | `start-skill/` | Persistent project memory, kickoff | Long autonomous loops |
| RCTC Method | root `SKILL.md` + `src/` | Prompt clarity (Role/Context/Task/Constraints) | Shipping code |
| Focused3 | `focused3-agentic-phases/` | THINK → EXECUTE → PROVE gates | Portfolio scanning |
| Safe Forward | `safe-forward-execution/` | Reversible authorized execution | Skill generation |
| Portfolio Commander | `portfolio-commander/` | Multi-project prioritization | Publishing OSS repos |
| Continuous Improving | `continuous-improving/` | Autonomous iteration with explicit gates | Community forum product |
| Update-Zip | `update-zip-skill/` | Harvest → pack → consult → ingest | Skill marketplace |
| Master Brain | `master-brain/` | Control plane / MCP / CLI | Viral growth spam |
| APCA SmartHelp | `apca-smarthelp/` | Local PDF→semantic help | RCTC skill factory |
| Dev Agora (playbook) | `dev-agora-skill/` | Community growth guidance | Fake engagement |

## Overlaps / gaps found
- README suite table vs scattered SKILL.md — **gap:** no machine-readable registry (Phase 2 fills this).
- Dev Agora skill describes community; **gap:** GitHub-native templates missing.
- Many skills but **no Skill Factory** for draft→validate→package→repo-ready→publish(owner).
- Composition advice exists informally; **gap:** explicit Reuse→Compose→Extend→Generate rule + planner notes.

## Phase 2 composition rule
**Reuse → Compose → Extend → Generate New** (never invent a skill when an existing chain works).

## Owner gates
See `docs/OWNER_APPROVAL_NEEDED.md` and pack `05_OWNER_GATES.md`.
