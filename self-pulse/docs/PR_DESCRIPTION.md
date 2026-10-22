# Pull Request — Self-Pulse Free skill (DRAFT — do not open until owner authorizes)

**Branch:** `feat/self-pulse-skill` → `main` (or default branch)  
**Scope:** Free MIT skill only. Premium stays outside this repository.

## Summary

- Add `self-pulse/` — evidence-grounded agent self-state & customer-interaction intelligence skill.
- Includes SKILL.md, EN/AR docs, offline tests (13), synthetic support demo, security notes.
- Explicitly **not** consciousness; computational satisfaction only; no manufactured CSAT.
- Inspired by Project SELF patterns without bundling or modifying that lab.

## Test plan

- [ ] `cd self-pulse && npm test` → 13/13
- [ ] `npm run demo` writes `examples/sample-output.json`
- [ ] Confirm `git ls-files` has **no** `self-pulse-agensi-premium` / premium ZIPs
- [ ] Spot-check README install paths for Cursor / Claude Code

## Out of scope (do not include)

- Premium proprietary package
- Agensi listing submission
- Project SELF research tree
- Push/publish without owner string

## Owner authorization required before

```
git push -u origin feat/self-pulse-skill
gh pr create ...
```
