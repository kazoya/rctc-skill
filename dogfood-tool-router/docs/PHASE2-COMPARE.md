# Phase 2 — baseline vs router

Recommendation: **NEEDS WORK**. PR #22 stays open. The five external tools stay disabled and unavailable. Do not merge on this evidence.

## Review of PR #22

The diff against `master` is additive. 24 files, +498/−9 before this phase. The only edits to existing skill behavior are one companion row in `SKILL.md`, one README bullet, catalog and loader lines, and the generated registry. No existing skill body was replaced. No package for Context7, Graphify, 21st, or Strix was added. `mergeable` was MERGEABLE and the PR is still OPEN.

Conflict that is not a file conflict: the router’s English patterns (`plan`, `frontend`, `rtl`, `typo`, `strix`) can claim a sentence that another skill should own. The holdout below did not hit those patterns.

## Holdout

Ten sentences that are not in `fixtures/tasks.json`. Gold labels are the reviewer’s reading of the existing skills, written before the score. The baseline is `bin/baseline.js`: the English companion table in the root skill, and `rctc-method` otherwise. It never names an external tool.

Re-run: `npm run test:dogfood-holdout`

Measured on one run, 1000 loops over the 10 sentences (10,000 resolutions):

| | Baseline | Router |
|---|---:|---:|
| Skill hits | 3/10 | 3/10 |
| Wrong | 7 | 7 |
| External names on the default registry | 0 | 0 |
| Tool invocations | 0 | 0 |
| Time for 1000 loops | 3.090 ms | 3.889 ms |

Token counts and dollar cost were not measured.

The three hits are `status-question`, `spelling-only`, and `summary-only`. Both systems returned `rctc-method` because nothing matched. The gold label is also `rctc-method`, so the point counts, and the router status is still `unmatched`.

The seven misses, both systems:

| Id | Gold | Got |
|---|---|---|
| ar-test-first | `test-first-slice` | `rctc-method` |
| ar-review-diff | `pr-review-surgeon` | `rctc-method` |
| ar-store-secret | `owner-credential-vault` | `rctc-method` |
| multi-release | `focused3-agentic-phases` | `rctc-method` |
| multi-bridge | `chatgpt-bridge-lane` | `rctc-method` |
| ar-live-scan | `wehm` and blocked | `rctc-method`, not blocked |
| stay-in-authority | `safe-forward-execution` | `rctc-method` |

`ar-live-scan` is the serious miss. An Arabic request to inspect the live production site is not blocked. The English word `pentest` is what the development fixture blocks.

Even with every integration forced enabled and marked available, these 10 sentences still name 0 external tools. The development English rules do not cover them.

## Dogfood change in this phase

One local skill: `test-first-slice`.

Before the resolver change, `node scripts/test-dogfood-holdout.js` threw `callExternal is not a function`. A separate probe of `resolveTask(..., null)` threw `Cannot read properties of null (reading 'integrations')`.

After the change, the same command passes. Failure behavior on the committed registry:

| Case | Result |
|---|---|
| Registry `null` | `invalid_registry`, no throw, no tool |
| Unknown text `zzzz-no-such-task-9f3a` | `unmatched`, local `rctc-method`, 0 calls |
| `plan the release checklist` while `agent_skills.enabled` is false | `disabled`, external null, 0 calls |
| Context7 `enabled: true` and `available: false` | `unavailable`, external null, 0 calls |

`callExternal` never starts a process. A route that names a tool still reports `tool_calls: 0` with reason `adapter_does_not_spawn`.

`npm run test:dogfood-router` still passes (the original 10 English tasks and 5 file edges).

## Real vs simulated

| Tool | What is in the repo | What was run |
|---|---|---|
| Agent Skills (MIT, `aeac41d4d005999432bb7312f7ff06383a91d59d`) | Three skill names in the router | Not cloned, not loaded |
| Context7 (MIT, `e0041949fdb3b49b304d98715dde35be51b7c3d1`) | A disabled registry row | Not called. Node 22 fetch answer stays unverified |
| Graphify (Apache-2.0, `91f4d120b630ee35c79bf3c75ccd186870a808f9`) | Five file-string checks | The Graphify program was not installed |
| 21st MCP (license not pinned) | A card spec | No MCP call, no copied component |
| Strix (Apache-2.0, `972f5097c2bfaf8f1dd8b55744ab8861f0d6b6e5`) | A simulated zero-finding note | No scan |

Dependencies added to `package.json`: none. The new script is a node file with no new package.

## Risks still open

- Arabic and mixed-language requests fall through, including a live-site check.
- A multi-step sentence does not pick one specialized local skill. It falls through.
- English patterns can still collide with other skills on wording this holdout did not use.
- The 3/10 score is one reviewer gold set of 10 sentences, one machine, one run. It is not a user study.
- 21st’s license is still “confirm before copy”.
- Forcing `available: true` in `enableAll` is a test double. The committed flags are `enabled: false` and `available: false`.

## Not done, on purpose

Do not add Arabic patterns or a multi-intent tie-break in this phase. That would fit the holdout after seeing it. Propose that as a later change with a fresh sentence set.

No merge, no publish, no install, no paid account, no live scan.
