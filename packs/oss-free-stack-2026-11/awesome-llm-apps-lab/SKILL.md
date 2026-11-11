---
name: awesome-llm-apps-lab
description: Study ready open-source AI agent and RAG example apps from awesome-llm-apps. Use when learning patterns for agents, RAG, or when the user wants cloneable Apache-2.0 examples before building a custom agent.
metadata:
  short-description: Learn from open agent/RAG examples
---

# Awesome LLM Apps Lab

Upstream: [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps)

## When to use

- Need a reference agent/RAG architecture to copy patterns from.
- Comparing multi-agent layouts before writing a new skill.
- Teaching or documenting agent flows for the portfolio.

## Workflow

1. Filter examples by modality (RAG, multi-agent, tool-use) and license.
2. Prefer Apache-2.0 / MIT examples with readable README and runnable steps.
3. Extract **pattern only** (roles, memory, tools) — do not paste entire apps into RCTC.
4. If adapting into a skill, use `skill-factory` (Reuse → Compose → Extend).
5. Record which example was studied and what was reused in the project journal.

## Constraints

- No silent `pip install` of example stacks.
- Paid model keys inside examples stay unused unless approved.
- For production Maps or ExperTech, prefer focused skills over cloning demo apps wholesale.
