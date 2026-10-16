---
name: dogfood-tool-router
description: >
  Route one task to a single local RCTC skill, then optionally to one of five
  disabled-by-default external tools (Addy Osmani agent-skills, Context7,
  Graphify, 21st MCP, Strix). Use when the user asks to integrate those tools,
  dogfood the router, or decide whether an MCP or scanner may run. Do not use
  it to enable a tool, install a package, scan a target, or call two tools
  for one task.
---

# Dogfood tool router

Existing RCTC skills stay the source of truth. This router adds five optional tools from the 2026-10-16 Grok kit. Each one ships **off**. Turning one on is an owner edit of [registry.json](registry.json). This skill does not install them.

## Order

1. Classify the task with `node dogfood-tool-router/bin/resolve.js` (the test calls the same function).
2. Follow `local`. That skill does the work.
3. Read `external`. `null` means do not call Context7, Graphify, 21st, Strix, or an Agent Skills body.
4. A non-null `external` is a name to open upstream, after the owner set `enabled` to true. Still one name.

## The five tools

| Id | Upstream | License at audit | When it may turn on |
|---|---|---|---|
| `agent_skills` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) `aeac41d` | MIT | Planning, a failing test, or a diff review. Names only: `planning-and-task-breakdown`, `test-driven-development`, `code-review-and-quality`. |
| `context7` | [upstash/context7](https://github.com/upstash/context7) `e004194` | MIT | A version-specific library doc. If the MCP is absent, say the doc is unverified and use the official docs. |
| `graphify` | [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) `91f4d120` | Apache-2.0 | A repo map. Graph edges are leads until a file contains the expected string. Exclude `.env` and secrets. |
| `twentyfirst_mcp` | [21st.dev/mcp](https://21st.dev/mcp) | Confirm before any copy | A frontend component request. Skip it for backend, security, and writing. |
| `strix` | [usestrix/strix](https://github.com/usestrix/strix) `972f509` | Apache-2.0 | Never from this router. Production and unnamed targets stay blocked. A live scan needs a written local-fixture authorization that is not in this repo. |

## Disable and rollback

Set every `enabled` flag to `false`. That is the committed state. Removing the `dogfood-tool-router/` directory and the `test:dogfood-router` script reverts the adapter. No user data lives here.

## Proof

`npm run test:dogfood-router` checks ten tasks and five real repository edges. Read [EVIDENCE.md](EVIDENCE.md) for what was and was not run.
