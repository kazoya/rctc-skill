# Roadmap · خارطة الطريق

Short and honest: what is shipped, what is next, and where you can help.
باختصار: شو جاهز، شو الجاي، ووين بتقدر تساعد.

Status words follow the repo's own ladder (`planned → scaffolded → implemented → tested → verified`). Nothing here is promised by date.

## Now · الآن (shipped on `master`)

| Piece | Where | Check |
|---|---|---|
| One-command starter install (Cursor / Claude / Codex) | `npm run install:starter` · [skills/INSTALL.md](skills/INSTALL.md) | `node scripts/install-starter.js --dry-run` |
| 60-second path | [docs/QUICKSTART_60S.md](docs/QUICKSTART_60S.md) · [examples/60s-demo.md](examples/60s-demo.md) | follow it in a fresh folder |
| Arabic course → skills funnel | [build-your-own-agent-ar](https://github.com/kazoya/build-your-own-agent-ar) (separate MIT repo) | finish a lesson, then run `install:starter` |
| Voice receptionist example (AR + EN) | [examples/voice-receptionist/](examples/voice-receptionist/README.md) | `npm run test:voice-receptionist` |
| Self-Pulse (evidence-grounded agent self-state) | [self-pulse/](self-pulse/README.md) | tests in `self-pulse/test/` |
| Repo integrity in CI (conflict markers, frontmatter, registry drift, generated files) | [scripts/validate-repo.js](scripts/validate-repo.js) · [.github/workflows/repo-integrity.yml](.github/workflows/repo-integrity.yml) | `npm run validate:repo` |
| One catalog of skills | [skills/CATALOG.md](skills/CATALOG.md) · `registry/` | `npm run registry:check` |

## Next · التالي (the packaging work from [issue #3](https://github.com/kazoya/rctc-skill/issues/3))

Issue #3 is a field report that scored the repo **7.0/10: content strong, packaging weak**. Part of it is already fixed (factory drafts removed, `.cursor/skills` copies are generated, CI catches conflict markers). What is left is split into five small tasks in [docs/good-first-issues.md](docs/good-first-issues.md):

1. Mark the `master-brain/` snapshot with a machine-readable `VERSION` so nobody mistakes it for the live product.
2. Give consumers one command that lists every `SKILL.md` path, whatever its depth.
3. Catch two slugs for one skill (underscore vs hyphen), starting with `web_marketing_and_personal-builder-super-skill`.
4. Add a fixture test that proves `skill-factory/out/` drafts can never ship again.
5. Add a `files:` list to `focused3-agentic-phases/SKILL.md` and a check that every listed file exists.

## Later · لاحقًا (needs owner decision first)

- Move every skill to one depth (`skills/<slug>/SKILL.md`) with pointer aliases. Big move; do it only after tasks 2 and 3 land.
- Replace `master-brain/` with a link or submodule to the live platform.
- Turn the `files:` check into a rule for all skills, not just one.
- More worked examples in Arabic for small businesses in Jordan and the Gulf.

## How to contribute · كيف تساهم

1. Pick a task from [docs/good-first-issues.md](docs/good-first-issues.md) (or an open issue labelled `good first issue`).
2. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/CONTRIBUTING_SKILLS.md](docs/CONTRIBUTING_SKILLS.md).
3. Work on a branch. Before opening a PR run:
   ```bash
   npm run registry:check && npm run validate:repo && npm run test:integrity && npm run test:examples
   ```
4. In the PR, say what you ran and what you did not run. "Not executed" is a fine answer; an invented pass is not.

No secrets, API keys, or paid-service sign-ups in PRs. Use synthetic test data.
