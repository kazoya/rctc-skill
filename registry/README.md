# Skill Registry

## Generated canonical registry (authoritative for shipped skills)

**Do not hand-edit** `registry/canonical.json`.

Authoritative input for shipped repository content is:

```bat
git ls-files
```

Regenerate intentionally:

```bat
npm run registry:generate
```

Check committed output matches git reality (CI gate):

```bat
npm run registry:check
```

Validation report (PASS/FAIL + duplicates, dead paths, warnings):

`registry/CANONICAL_VALIDATION_REPORT.json`

Tracked generated-output allowlist:

`registry/TRACKED_OUTPUT_ALLOWLIST.txt`

## Legacy skills.json builder

Still available via Skill Factory:

```bat
node skill-factory/scripts/build-registry.js
```

Output: `registry/skills.json` (separate from the git-backed canonical registry).

## Repo integrity

```bat
npm run validate:repo
npm run test:integrity
```

CI: `.github/workflows/repo-integrity.yml`
