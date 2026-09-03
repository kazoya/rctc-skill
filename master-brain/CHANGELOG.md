# Changelog

## [1.0.0] — 2026-09-03

### Added
- Zero-dependency Node.js platform: file store (project.json / brain.json / journal), CLI `mb`, HTTP dashboard (Arabic/English, RTL), MCP stdio server (19 tools, resources, prompts), REST API.
- Engineering mind per project: done · findings · current · next · improvements · suggestions (model-attributed) · decisions · blockers · constraints; generated `BRAIN.md` + `CLAUDE.md`.
- Reports: HTML (print), automatic PDF via headless Edge/Chrome, XLSX (hand-built, RTL), Markdown, JSON; filters by period, projects, statuses, entry types, models, progress range; grouping by status/priority.
- Platform brain: lessons, skills, tools, capabilities, tool requests (owner approval); owner → Claude task inbox.
- Skills: `start-skill` (مهارة البدء) with LEARNED.md / PROMPT-TEMPLATE.md / CHECKLIST.md; `master-brain` operating skill; vendored `rctc-method`, `portfolio-commander`, `focused3-agentic-phases` from kazoya/rctc-skill (MIT).
- Installers: `scripts/install.ps1` (Claude Desktop merge, Claude Code skills, `.mcp.json`, PATH), `scripts/install.sh`.
- Tests: `test/util.test.js`, `test/smoke.test.js` (41 checks: CLI, reports, XLSX zip validation, HTTP API, MCP).
