# Master vs Master Brain — Source of Truth Decision (2026-09-19)

## What exists
| Path | Role |
|---|---|
| `C:\master` | Master **HQ**: roles, bridge pointers, prompts, **capability registration cards** (`files/capabilities/*.json`), collaboration norms |
| `C:\master-brain` | Master Brain **platform**: projects DB/UI (`projects/`, dashboard, `mb` CLI), engineering memory for many projects |

## Decision
**Do not dual-edit the same facts in both places.**

1. **Skill / capability identity (executable ids)**  
   Source of truth: `C:\rctc-skill\registry\skills.json`  
   Views: DPF recipes must use exact ids; Master HQ capability cards **reference** registry ids; they do not redefine them.

2. **HQ-discoverable capability cards (what Cursor should know exists)**  
   Source of truth: `C:\master\files\capabilities\*.json` + `C:\master\CAPABILITIES.md`  
   Registration executes nothing.  
   Import path into Master Brain (when needed): generate a project/capability view from these cards — do not hand-maintain a second capabilities list inside `master-brain`.

3. **Project progress / journal / brain.json**  
   Source of truth: the project's own brain (e.g. portfolio `brain.json`) and/or `C:\master-brain\projects\<id>` when that project is seeded there.  
   `C:\master\project.json` is HQ meta for the collaboration room, not the catalog of all skills.

## Rule
- Change a skill id → update **registry** first, then recipes, then any capability card references.  
- Change "what HQ can discover" → update **master/files/capabilities** only.  
- Change project delivery state → update **master-brain project** or the project's own brain — not both with divergent copy-paste.

## This round
DPF remains registered only under `C:\master\files\capabilities\digital-presence-factory.json`.  
No duplicate capability registry was created inside `C:\master-brain`.
