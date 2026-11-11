---
name: awesome-lists-finder
description: Navigate the sindresorhus/awesome meta-lists to find curated resource lists for a topic. Use when the user needs discovery of existing curated GitHub lists before inventing a new catalog.
metadata:
  short-description: Find awesome-* resource lists
---

# Awesome Lists Finder

Upstream: [sindresorhus/awesome](https://github.com/sindresorhus/awesome)

## When to use

- “Is there already a curated list for X?”
- Bootstrapping research before cloning a niche tool.
- Avoiding duplicate catalogs inside RCTC.

## Workflow

1. State the topic in one phrase (e.g. “self-hosted analytics”).
2. Search the awesome root README and linked awesome-* lists.
3. Return at most three lists with: stars, last update signal, and one sentence why it fits.
4. Hand off to a more specific pack skill when the list is MCP, LLM apps, or free-for-dev.

## Constraints

- Lists are pointers, not verified quality scores — score tools in the consuming project’s RESEARCH log.
- Do not clone every linked repo.
