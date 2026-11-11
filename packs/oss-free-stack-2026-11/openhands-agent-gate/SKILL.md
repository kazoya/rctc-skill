---
name: openhands-agent-gate
description: Decide when an autonomous coding agent like OpenHands is worth running versus staying in Cursor. Use when the user asks for OpenHands, All-Hands-AI, or a self-hosted agent that writes code, runs tests, and fixes bugs.
metadata:
  short-description: Gate OpenHands vs Cursor
---

# OpenHands Agent Gate

Upstream: [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands)

## When to use

- Long unsupervised coding loops with tests.
- Self-hosted agent canvas across local/remote backends.
- Evaluating open coding agents as an alternative seat.

## Workflow

1. Ask: can Cursor + `focused3-agentic-phases` + `safe-forward-execution` finish this faster?
2. If yes, stay in Cursor and do the work.
3. If OpenHands is still desired, list: install size, sandbox needs, model cost, and what must stay human-approved (push, spend, messages).
4. Install only after explicit approval. Prefer read-only dry runs first.
5. Require evidence: tests run, diff summary, and what was not verified.

## Constraints

- Do not give OpenHands credentials to production or payment systems.
- Do not use it for offensive security automation.
- Portfolio already uses Cursor heavily — OpenHands is optional, not default.
