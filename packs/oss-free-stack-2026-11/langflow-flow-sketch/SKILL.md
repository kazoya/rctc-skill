---
name: langflow-flow-sketch
description: Sketch AI agent and RAG workflows in a drag-and-drop style inspired by Langflow, then decide whether to install. Use when designing agent pipelines, RAG graphs, or MCP-exposed flows before writing production code.
metadata:
  short-description: Sketch Langflow-style agent/RAG flows
---

# Langflow Flow Sketch

Upstream: [langflow-ai/langflow](https://github.com/langflow-ai/langflow)

## When to use

- Designing a multi-step agent or RAG path visually before coding.
- Comparing “build in Langflow” vs “code in Cursor with skills”.
- Exposing a flow as API/MCP later (upstream feature) — only after install approval.

## Workflow

1. Draw the flow as a short markdown graph: Input → Retrieve/Tools → Reason → Output.
2. Name each node’s job and which existing skill/MCP already covers it.
3. Prefer implementing with current Cursor + pack skills when the flow is small.
4. Propose Langflow install only if the visual playground clearly saves time; get approval first.
5. Keep secrets out of exported flow JSON committed to git.

## Constraints

- No silent Docker/pip install of Langflow.
- Paid LLM nodes inside Langflow still need budget approval.
- For trade-desk style flows, prefer `master-skills-factory` patterns already in RCTC.
