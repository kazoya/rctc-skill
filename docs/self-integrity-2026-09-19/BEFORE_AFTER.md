# BEFORE / AFTER — Self-Integrity Sprint 2026-09-19

Baseline commit: `0fe8bf6` (origin/master at sprint start).
Authoritative input after: `git ls-files` only.

## Canonical registry metrics

| Metric | BEFORE (committed canonical.json) | AFTER (git-generated) |
|--------|-----------------------------------|------------------------|
| discovered installations | 41 | 27 |
| canonical capabilities | 24 | 20 |
| paths present in git ls-files | 22 | 27 |
| dead registry paths (not in git) | **19 (~46%)** | **0** |
| exact duplicate content groups | (not systematically reported) | 3 |
| CANONICAL_VALIDATION_REPORT | n/a | **PASS** |

## Examples of dead-path detection (BEFORE)

These installation paths were claimed in the old canonical registry but were not in `git ls-files` (local-only / machine pollution). Examples of the class of failure (paths may include `.cursor/...` and `.agents/...` host installs that were never committed).

After regeneration, `dead_registry_paths: []`.

## Examples of duplicate detection (AFTER)

Reported in `registry/CANONICAL_VALIDATION_REPORT.json` (report only; no auto-delete):

1. `.cursor/skills/continuous-improving/SKILL.md` ≡ `continuous-improving/SKILL.md`
2. `.cursor/skills/web-marketing-and-personal-builder-super-skill/SKILL.md` ≡ `web_marketing_and_personal-builder-super-skill/SKILL.md`
3. `skill-factory/out/next-js-accessibility-review-skill/SKILL.md` ≡ `.../repo-ready/SKILL.md`

## Commands proven

```bat
npm run registry:generate   # PASS
npm run registry:check      # PASS
npm run validate:repo       # PASS (warnings allowed)
npm run test:integrity      # 8/8 fixtures PASS
```

No quality score claimed.
