---
name: ecc-harness
description: >
  Route a need to one local RCTC skill first, then to a named skill in
  affaan-m/ECC when the need is a harness mechanism this repo does not ship
  (hooks, instincts, session memory, language rules, or a domain skill absent
  here). Use when the user asks to add ECC, organize needs into skills, pick
  an agent harness, or install ecc-universal. Do not use to copy ECC skill
  bodies into this tree, to enable hooks without the owner running setup, or
  to replace rctc-method, safe-forward-execution, or owner-credential-vault.
---

# ECC harness

ECC is the MIT agent harness at [affaan-m/ECC](https://github.com/affaan-m/ecc) by Affaan Mustafa. This folder is the RCTC adapter. It does not vendor the upstream skills, agents, hooks, or rules.

Upstream snapshot used for the names in [NEED-MAP.md](NEED-MAP.md): commit `b92f181b3b748d1abbc2afd94af6aa7d8c8fca29` (2026-10-12). Counts and install versions change. Read the upstream README before quoting them.

## Law

Reuse a skill already in this repo. Compose it with one ECC skill name when the map says the need is a harness mechanism. Extend only after both are insufficient. Generate a new local skill only through `skill-factory`.

Do not paste an upstream `SKILL.md` into this repository.

## When to load this skill

Load it when the task is to choose, install, or wire ECC. For a normal coding task, load the local skill from the map and skip ECC.

## Procedure

1. Name the need in one line.
2. Open [NEED-MAP.md](NEED-MAP.md). Take the local skill in that row.
3. If the local skill covers the task, stop. Do not install ECC for that task.
4. If the row lists an ECC skill, tell the owner the upstream name and the install command below. Wait for them to run setup. Do not run `npx ecc-universal` yourself.
5. After setup, use one upstream skill for that need. Do not load the whole ECC catalog into context.
6. Keep secrets in `owner-credential-vault`. Keep an already-open signed-in browser on `logged-in-browser`. ECC does not replace either one.
7. Record the choice: need, local skill, ECC skill name or "none", and whether setup has actually been run.

## Install (owner runs this)

Confirm the registry version, then run the guided setup from the upstream README. The pin below matches ECC 2.2.3 as published at the snapshot commit. It is not an audit.

```powershell
npm view ecc-universal version
npx ecc-universal@2.2.3 setup
```

That wizard configures the Claude Code plugin. For Claude Code plus Codex plus Kimi in one reviewed flow, the upstream command is `npx ecc-universal@2.2.3 install --guided`. Cursor in this repo keeps `.cursor/skills/`. ECC's Cursor adapter is a separate, narrower path. Read the upstream Cursor section before expecting hooks or instincts inside Cursor.

OSS ECC stays MIT. ECC Pro and sponsor links belong to the upstream project. Do not describe them as part of kazoya/rctc-skill.

## What stays here

| Mechanism | Where it lives |
|---|---|
| Brief, one question, then the task | `rctc-method` |
| Think, execute, prove | `focused3-agentic-phases` |
| Authority boundary | `safe-forward-execution` |
| Proof before a claim | `evidence-before-claim` |
| Operator secrets | `owner-credential-vault` |
| Project memory | `master-brain` and `start-skill` |
| Hooks, instincts, language rules, the long domain catalog | upstream ECC, one skill at a time |

## Failure

If the map has no row, add a row in `NEED-MAP.md` with a local skill or `none`, plus one ECC skill name. Do not import the upstream file to fill the gap.
