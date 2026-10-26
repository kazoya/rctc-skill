# Good first issues (drafts from issue #3)

Five small, ready-to-file tasks split out of the field report in [issue #3](https://github.com/kazoya/rctc-skill/issues/3). Each one is a single PR. Label every issue `good first issue` when it is filed. These are drafts; nothing here has been filed on GitHub yet.

State checked on `master` @ `4d006dd` (2026-10-26):

| #3 problem | State today | Task below |
|---|---|---|
| 1. `master-brain/` copy is stale (1.0.0 vs live 1.3.0) | README now says "snapshot", but there is no machine-readable marker | GFI-1 |
| 2. `SKILL.md` at five depths | still true (depths 1–5); `registry/` and `skills/CATALOG.md` exist | GFI-2 |
| 3. Byte-for-byte duplicates, two slugs for one skill | `.cursor/skills` copies are gone; the underscore slug remains and nothing detects near-duplicate slugs | GFI-3 |
| 4. `skill-factory/out/` ships drafts | folder removed; Gate F blocks generated files, but no fixture proves it for this path | GFI-4 |
| 5. Conflict markers reached `master` | fixed: Gate A in `validate-repo.js` runs in CI. Follow-up from the same report: no `files:` manifest, so missing sibling files fail silently | GFI-5 |

---

## GFI-1 · Add a machine-readable `VERSION` to the `master-brain/` snapshot

**Labels:** `good first issue`, `docs`

**Context.** `master-brain/package.json` says `1.0.0`; the live platform was `1.3.0` on 2026-10-06. `master-brain/README.md` already warns in prose, but a tool that reads only files cannot tell this is a snapshot.

**Acceptance criteria**
- `master-brain/VERSION` exists with one line, e.g. `1.0.0-snapshot (live: 1.3.0 as of 2026-10-06)`.
- `master-brain/package.json` `description` starts with `SNAPSHOT —`.
- Root `README.md` mentions the snapshot in one line where `master-brain/` is listed (or under Common questions).
- `npm run validate:repo` and `npm run registry:check` still pass.

**Files to touch:** `master-brain/VERSION` (new), `master-brain/package.json`, `README.md`.

---

## GFI-2 · `npm run skills:list` — print every `SKILL.md` path from the registry

**Labels:** `good first issue`, `tooling`

**Context.** Skills live at different depths (`SKILL.md`, `focused3-agentic-phases/SKILL.md`, `portfolio-commander/skills/portfolio-skills-router/SKILL.md`, …), so no single glob finds them all. Moving everything is a big change (see ROADMAP "Later"). A list command solves the consumer problem today.

**Acceptance criteria**
- New script `scripts/list-skills.js` reads `registry/canonical.json` (no new dependencies) and prints one path per line; `--json` prints `[{ "id", "path" }]`.
- `package.json` gets `"skills:list": "node scripts/list-skills.js"`.
- The printed count equals the number of tracked `SKILL.md` files that the registry knows about.
- A short section in `skills/INSTALL.md` shows the command.

**Files to touch:** `scripts/list-skills.js` (new), `package.json`, `skills/INSTALL.md`.

---

## GFI-3 · Detect two slugs for one skill (underscore vs hyphen)

**Labels:** `good first issue`, `ci`

**Context.** `web_marketing_and_personal-builder-super-skill` used a different slug from its old copy (`web-marketing-and-personal-builder-super-skill`). The old copy is gone. Today Gate E fails only on byte-identical bodies and Gate G only warns when a skill's `name:` differs from its own folder, so two folders whose names differ only by `_` vs `-` (with slightly different text) would still pass.

**Acceptance criteria**
- `scripts/validate-repo.js` reports a new error code (e.g. `near_duplicate_slug`) when two skill folders have the same name after lower-casing and replacing `_` with `-`, unless one is a pointer with `canonical:` frontmatter (Gate E rules).
- A fixture case in `scripts/integrity/run-fixture-tests.js` covers one failing and one allowed (pointer) case.
- `npm run validate:repo` passes on current `master` (no false positive).
- Optional, separate commit: add a `canonical:` pointer at the hyphen slug so both names resolve to one skill.

**Files to touch:** `scripts/validate-repo.js`, `scripts/integrity/run-fixture-tests.js`.

---

## GFI-4 · Fixture test: `skill-factory/out/` drafts cannot ship

**Labels:** `good first issue`, `tests`

**Context.** Issue #3 found 30 draft files in `skill-factory/out/`. They are removed now and Gate F (`unexpected_tracked_generated`) should block them, but no test proves that for this exact path. A test keeps the fix from regressing.

**Acceptance criteria**
- A fixture in `scripts/integrity/run-fixture-tests.js` simulates a tracked `skill-factory/out/draft.md` and expects a Gate F error.
- `skill-factory/out/` is listed in `.gitignore` (add it if missing).
- `npm run test:integrity` passes.

**Files to touch:** `scripts/integrity/run-fixture-tests.js`, `.gitignore`.

---

## GFI-5 · `files:` manifest for `focused3-agentic-phases` + existence check

**Labels:** `good first issue`, `skills`

**Context.** `focused3-agentic-phases/SKILL.md` tells the agent to read `AGENT_ROLES.md`, `PROMPT_FACTORY.md`, `FAILURE_PROTOCOL.md`, `templates/` and `examples/`. Inside this repo Gate C already hard-fails broken markdown links, but a consumer who vendored only part of the folder hit five dead paths and the agent carried on silently. A `files:` manifest gives consumers (and `install-starter.js`) one list to verify, turning that into a loud failure.

**Acceptance criteria**
- `focused3-agentic-phases/SKILL.md` frontmatter gets a `files:` list of every sibling it links to.
- `scripts/validate-repo.js` checks: when a `SKILL.md` has `files:`, every listed path exists next to it; otherwise error `missing_manifest_file`. Skills without `files:` are not affected.
- One fixture case for a missing file.
- `npm run validate:repo`, `npm run registry:check` and `npm run test:integrity` pass.

**Files to touch:** `focused3-agentic-phases/SKILL.md`, `scripts/validate-repo.js`, `scripts/integrity/run-fixture-tests.js`.

---

### Before you open the PR

```bash
npm run registry:check && npm run validate:repo && npm run test:integrity && npm run test:examples
```

Say in the PR what you ran. Do not commit secrets or premium files. See [ROADMAP.md](../ROADMAP.md).
