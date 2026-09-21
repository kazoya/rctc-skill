# WhatsApp Agent Orchestrator — Super Skill

**Turn WhatsApp from a chat window into a governed AI operations interface.**

This sibling skill for the RCTC ecosystem describes how to build a channel-independent AI
orchestrator that can receive a natural-language request from WhatsApp (or Telegram/web), route it
to bounded capabilities such as Gmail, Calendar, GitHub, CRM, documents, databases or n8n
workflows, enforce approvals, verify the provider result, and return a truthful status.

## Why it is stronger than a demo chatbot

A demo often proves:

```text
message → LLM → tool → reply
```

This skill adds the engineering needed for reusable systems:

```text
identity → typed intent → risk classification → policy/approval
→ bounded tool → idempotent execution → provider verification
→ audit receipt → response
```

That difference matters when the assistant can send email, create events, touch engineering systems,
or trigger business workflows.

## Quick use

Tell Cursor, Claude Code, Codex, or another coding agent:

```text
Read whatsapp-agent-orchestrator-super-skill/SKILL.md.
Apply it with safe-forward-execution and focused3-agentic-phases.
Inspect my existing stack first. Build the smallest end-to-end slice using test credentials.
Do not send, publish, delete, purchase, deploy to production, or change third-party accounts
without the authorization rules in the skill.
```

## n8n reference pattern

```text
WhatsApp Trigger
→ Normalize
→ Resolve identity
→ AI router
→ Policy gate
→ approved Gmail / Calendar / HTTP / sub-workflow tool
→ Verify result
→ Audit
→ WhatsApp reply
```

n8n is optional. The architecture works with Node.js/Python/MCP/serverless workers too.

## Best combinations

- **+ Safe Forward Execution:** keeps the builder moving through safe implementation instead of
  stopping at a plan.
- **+ Focused3:** requires THINK → EXECUTE → PROVE evidence.
- **+ Start Skill + Portfolio Commander + Master Brain:** gives your project portfolio a mobile
  conversational command surface.
- **+ Factory Sales Concept:** supports factory alerts, CRM-style follow-up and approved operational
  workflows.

## Practical reuse

The pattern can be adapted to Maqasa, Risha360, Factory AI OS, project-control dashboards, support
systems, and internal company assistants. Integration must still respect each provider's terms,
permissions, privacy requirements, and human approval boundaries.

## Provenance

The initial architecture was inspired by analysis of a user-provided tutorial video showing a
WhatsApp-triggered n8n workflow with an AI agent and external tools such as Gmail and Google
Calendar. This repository implementation is a generalized, independently written engineering
pattern; it does not copy the tutorial's code or proprietary assets.

See [SKILL.md](SKILL.md) for the complete execution contract and acceptance tests.
