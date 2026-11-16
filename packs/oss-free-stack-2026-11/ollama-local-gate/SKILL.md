---
name: ollama-local-gate
description: Evaluate and gate local LLM runs with Ollama without silent model downloads. Use when the user wants Llama, Mistral, DeepSeek, or other local models with no API fee, or asks to install Ollama.
metadata:
  short-description: Gate local Ollama model use
---

# Ollama Local Gate

Upstream: [ollama/ollama](https://github.com/ollama/ollama)

## When to use

- Prefer local inference over paid APIs.
- Comparing local models for Arabic coding / media prompt help.
- Machine already has Ollama or a prior local stack (e.g. `heretic-local`).

## Workflow

1. Measure hardware first: GPU VRAM, RAM, disk free. State the numbers.
2. If VRAM is under ~8GB, warn that mid/large models will be slow or fail; prefer tiny/quantized tags only after approval.
3. Do **not** run `ollama pull` until the user approves the exact model tag and size.
4. After approval: install/run per upstream docs, then verify with one short prompt and record latency + quality notes.
5. Log the result in the project RESEARCH or journal. Do not claim “best” without a measured sample.

## Constraints

- Aligns with `new_tech` rule: no model downloads without explicit approval.
- GT 1030 (2GB) class machines: treat as **reject for heavy local LLM/video**; keep Ollama for tiny experiments only if approved.
- Never enable telemetry or cloud sync without asking.
