---
name: belt-apca-smarthelp-cx
description: >
  P1 APCA SmartHelp CX — Arabic WhatsApp agent, RAG (FastAPI), booking, handoff roadmap.
  Use for C:\Belt\APCA-SmartHelp, embeddings, /api/ask, pytest, and 90-day GTM constraints.
paths:
  - "APCA-SmartHelp/**"
  - "**/APCA-SmartHelp/**"
  - "backend/app/**"
  - "tests/backend/**"
---

# Belt / APCA SmartHelp CX (P1)

## Strategy (do not expand scope)

- Sell: cited Arabic answers + booking + human handoff (handoff still maturing).
- Defer: full voice/Pipecat, Cloud API migration without pilot approval.
- Read: `%USERPROFILE%\.cursor\portfolio\docs\STRATEGY-FOCUS-AR.md`

## Engineering

- SmartHelp API default `http://127.0.0.1:8787` — gateway uses `BeltKnowledgeClient`.
- Run tests: `pytest tests/backend` from `APCA-SmartHelp` venv.
- Preserve: `.apcahelp` export, no secrets in git.

## Pair skills

- `/bitter-truth-delivery-audit` before demos or status claims.
- `/ai-portability-advisor` for architecture / vendor lock-in.
- `/portfolio-commander` for registry lifecycle.
