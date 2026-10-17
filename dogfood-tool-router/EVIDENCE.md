# Evidence

Format: `date | stage | command/tool | scope | result | artifact | caveats`

| Date | Stage | Command / tool | Scope | Result | Artifact | Caveats |
|---|---|---|---|---|---|---|
| 2026-10-17 | 0 baseline | `git rev-parse` on `origin/master` before the branch | rctc-skill | branch `feat/dogfood-tool-router` from `origin/master` | this file | existing skills were not rewritten |
| 2026-10-17 | 1 test first | `node scripts/test-dogfood-router.js` | router | FAIL `MODULE_NOT_FOUND` for `bin/resolve.js` | `scripts/test-dogfood-router.js` | expected red before the resolver existed |
| 2026-10-17 | 1 resolver | `node scripts/test-dogfood-router.js` | 10 tasks, 5 edges | PASS | `dogfood-tool-router/bin/resolve.js` | default registry keeps every external null |
| 2026-10-17 | 2 Context7 | session tool list | Node 22 fetch docs | unverified | `docs/CONTEXT7-FALLBACK.md` | no Context7 MCP, no API key, Node on the machine was v24.15.0 |
| 2026-10-17 | 3 Graphify | file checks, not Graphify | 5 edges | PASS inside the router test | `docs/GRAPH-PLAN.md` | Graphify was not installed |
| 2026-10-17 | 4 21st | none | one card spec | spec only | `docs/UI-SPEC.md` | no component copied, no upload |
| 2026-10-17 | 5 Strix | none | production prompt | blocked, 0 findings | `docs/STRIX-GATE.md` | simulated fixture, not a scan |
| 2026-10-17 | 6 repo tests | `npm run test:dogfood-router`, `npm run validate:repo`, `npm run registry:check` | this change | PASS, PASS (46 existing warnings), PASS | registry files | no root lint or typecheck script |
| 2026-10-17 | 7 holdout before | `node scripts/test-dogfood-holdout.js` | 10 new tasks | FAIL `callExternal is not a function` | `scripts/test-dogfood-holdout.js` | red run, before the safe-failure change |
| 2026-10-17 | 7 holdout after | `npm run test:dogfood-holdout` | same 10 tasks, 1000 loops | PASS, baseline 3/10, router 3/10, 0 tool invocations | `docs/phase2-log.json` | recommendation NEEDS WORK, see `docs/PHASE2-COMPARE.md` |

Rollback: set all `enabled` flags in `registry.json` to false (already true of the commit), or delete `dogfood-tool-router/` and the `test:dogfood-router` script.

Cost: no account created. Enabling Context7 or 21st later can be usage-priced. Read the upstream pricing before turning a flag on.
