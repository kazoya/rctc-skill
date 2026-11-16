---
name: awesome-mcp-servers-router
description: Choose MCP servers from the curated awesome-mcp-servers list for browsers, databases, APIs, and tools. Use when wiring Cursor, Claude Code, or Codex to external systems via MCP, or when the user asks which MCP to add.
metadata:
  short-description: Route MCP server picks
---

# Awesome MCP Servers Router

Upstream: [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)

## When to use

- Agent needs browser, DB, filesystem, calendar, or API access through MCP.
- User asks “what MCP should we add?”
- Comparing MCP options before `request_tool` / owner approval on Master Brain.

## Workflow

1. Name the **job** (read calendar, query Postgres, browse a logged-in site), not the brand.
2. Search the awesome list for that job category.
3. Prefer servers that: are open source, have clear auth, and match an already-approved host in the portfolio.
4. Check overlap with skills already present (`logged-in-browser`, `master-brain`, Notion/Vercel MCPs).
5. Propose at most **one** new MCP. Ask for install approval before configuring credentials.

## Constraints

- Do not install or authenticate MCP servers silently.
- Skip pentest, credential-stuffing, or person-search MCP entries.
- Record the chosen server URL and why in the project journal when adopted.
