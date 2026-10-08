# RCTC Skills

Evidence-first skills for coding agents. Make the brief precise, then do the work and show proof.

**RCTC** is Role, Context, Task, Constraints. The root skill is [SKILL.md](SKILL.md). It does not turn a clear request into an interview.

Author: [Suhaib Asrawi (@kazoya)](https://github.com/kazoya). Provenance: [AUTHORS.md](AUTHORS.md). License: MIT.

## Install

From the project you want the agent to work in:

```bash
git clone --depth 1 https://github.com/kazoya/rctc-skill.git .rctc-skill
```

Point the agent at `.rctc-skill/SKILL.md`.

| Host | Skill file |
|---|---|
| Cursor | `.cursor/skills/rctc-method/SKILL.md` |
| Claude Code | `.claude/skills/rctc-method/SKILL.md` |
| Codex | `.codex/skills/rctc-method/SKILL.md` |

Copy the root [SKILL.md](SKILL.md) to that path. Open this repository itself and Cursor also loads `.cursor/rules/rctc.mdc`.

## Programmer chain

Use this order for code. Do not start with a marketing skill.

1. [RCTC](SKILL.md) — precise brief, then finish the task.
2. [HTPAAP](htpaap/SKILL.md) — what strong engineers actually prove.
3. [Focused3](focused3-agentic-phases/SKILL.md) — think, execute, prove.
4. [Safe Forward](safe-forward-execution/SKILL.md) — continue only inside the authority you already have.

The full map is [skills/CATALOG.md](skills/CATALOG.md). Domain stories (sites, factories, portfolio) stay in [docs/SKILLS-SHOWCASE.md](docs/SKILLS-SHOWCASE.md).

## Prize windows

[Prize-hunt skill fit](prize-hunt-skill-fit/SKILL.md) enters a contest only when a measured class matches a dated public score. It publishes the method, not secrets, flags, or exploit steps.

## Check the tree

```bash
npm run registry:check
npm run validate:repo
npm run test:integrity
npm run test:examples
```

Node 18 or newer. No install step. These commands reject merge-conflict markers, a `SKILL.md` without `name` and `description`, and two byte-identical skill files.
