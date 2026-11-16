---
name: open-design-assistant
description: Use the open-design workflow pattern to turn a coding agent into an AI design assistant for marketing and Maps pages. Use when the user wants Claude-Design-like help from open source, design systems, or agent-driven UI mockups without a paid design seat.
metadata:
  short-description: Open-source design-with-agent flow
---

# Open Design Assistant

Upstream: [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0)

## When to use

- Factory / personal / Maps landing pages need visual direction with a coding agent.
- User wants an open alternative to closed “Claude Design” style workflows.
- Pairing with `design-taste-rctc` and `web-marketing-and-personal-builder-super-skill`.

## Workflow

1. Lock brand signals first (name, one headline, one CTA, one visual anchor) — do not start with a dashboard of cards.
2. Prefer HTML/CSS compositions the agent can edit; for video title cards prefer Hyperframes on `new_tech`.
3. If Open Design itself must be installed, get explicit approval, then follow upstream docs — do not invent install paths.
4. Run the taste anti-slop checks from `design-taste-rctc` before shipping.
5. Keep Maps client pages separate from media R&D benches.

## Constraints

- No purple-on-white / cream-serif terracotta defaults unless the brand already uses them.
- Do not pull Remotion until its commercial license is accepted.
- Arabic RTL pages: use `a11y-rtl-web` for reading order and contrast.
