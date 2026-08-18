---
name: portfolio-skills-router
description: >
  Routes Cursor Agent Skills to the active portfolio project. Read project-skills-map.yaml,
  respect Portfolio Commander priority (P1-P6) and lifecycle dormant rules. Use when opening
  a multi-repo workspace, asking which skill applies, or after scan_projects.py.
---

# Portfolio Skills Router

## Sources of truth

| File | Role |
|------|------|
| `%USERPROFILE%\.cursor\portfolio\project-skills-map.yaml` | Which skills install to which project paths |
| `%USERPROFILE%\.cursor\portfolio\project-overrides.yaml` | Priority, lifecycle, backup |
| `%USERPROFILE%\.cursor\portfolio\projects-registry.xml` | Paths and ids |

## Install / refresh project skills

```powershell
python "%USERPROFILE%\.cursor\portfolio\scripts\install_project_skills.py"
```

Or from the OSS repo:

```powershell
python "C:\rctc-skill\portfolio-commander\scripts\install_project_skills.py"
```

This copies skill folders into each project's `.cursor/skills/` (Cursor Agent Skills standard).

## Behavior for agents

1. **User-level skills** in `~/.cursor/skills/` remain global (portfolio-commander, ai-portability-advisor, etc.).
2. **Project-level skills** under `{project}/.cursor/skills/` auto-scope via Cursor nested discovery.
3. Skills with `paths:` in frontmatter only surface for matching files — use for PHP gateway vs Python RAG.
4. Do **not** apply dormant-project skills for feature work unless the user explicitly overrides.
5. **P1 Belt:** prefer `belt-apca-smarthelp-cx`, `belt-gateway-php`, `bitter-truth-delivery-audit`, `ai-portability-advisor`.
6. **RCTC prompts:** `rctc-method` on `rctc-skill` repo; global rule may still apply via `.cursor/rules/rctc.mdc`.
7. **Factories:** `/factory-sales-concept` on `C:\Factories`, `C:\almajjarra`, `C:\Factories\Banoon`, `C:\NoorPlasticFactory` — inspect the public site, ask for missing WhatsApp/parent/differentiator, then seed the Arabic sales platform + GitHub + Vercel.

## Manual invoke

Type `/` in Agent chat and pick the skill by name (e.g. `/bitter-truth-delivery-audit`).

## After changing the map

Re-run `install_project_skills.py` and optionally `scan_projects.py`.
