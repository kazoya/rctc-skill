---
name: skill-factory
description: >
  Use when drafting, validating, packaging, or preparing a new agent skill for
  GitHub — especially inside kazoya/rctc-skill. Modes: draft, validate, review,
  package, repo-ready, publish (owner gate only). Prefer Reuse→Compose→Extend
  before generating a new skill.
---

# Skill Factory

**Invoke:** `/skill-factory` or `node skill-factory/scripts/sf.js <mode> ...`

## Modes
1. `draft` — generate local candidate under `skill-factory/out/<id>/`
2. `validate` — check structure, manifest, SKILL.md frontmatter
3. `review` — emit human/agent review packet
4. `package` — deterministic zip of candidate (no publish)
5. `repo-ready` — expand standalone GitHub scaffold into candidate
6. `publish` — **OWNER GATE ONLY** — prepare exact commands; do not push unless owner explicitly approved this exact action

## Composition law
Reuse → Compose → Extend → Generate New.

## Contract
See `skill-factory/contract/skill-manifest.schema.json`.
