# Vendored skills (reference copies)

Copied verbatim from **[kazoya/rctc-skill](https://github.com/kazoya/rctc-skill)** (MIT License — see `LICENSE`) on 2026-09-03, so the platform works offline and the reasoning behind Master Brain is traceable:

| Folder | Original path | Applied in Master Brain as |
|--------|---------------|----------------------------|
| `rctc-method/` | `SKILL.md` (repo root) | Ask ≤ 4 decisive questions before building; state assumptions |
| `portfolio-commander/` | `portfolio-commander/skill/SKILL.md` + `docs/` | Registry (`data/registry.json`), lifecycle `dormant`, priority 0–5, revenue flag, engineering mind (`BRAIN.md` / `CLAUDE.md`), dashboard, requests inbox, privacy (`.gitignore`) |
| `focused3-agentic-phases/` | `focused3-agentic-phases/SKILL.md` | Journal entries carry evidence; `DONE = IMPLEMENTATION × TEST × VERIFICATION × EVIDENCE`; `test/smoke.test.js` |

To install any of them as a Claude Code user skill: copy the folder to `%USERPROFILE%\.claude\skills\<name>\`.
Upstream updates: `git clone https://github.com/kazoya/rctc-skill.git`.
