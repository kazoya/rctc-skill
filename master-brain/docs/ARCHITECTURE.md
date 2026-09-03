# Architecture — البنية

```
                 ┌────────────────────────────── channels ──────────────────────────────┐
  Claude Code ──▶ .mcp.json ──▶ bin/mcp.js (stdio JSON-RPC) ─┐                          │
  Claude Desktop ▶ claude_desktop_config.json ─▶ bin/mcp.js ─┤                          │
  Terminal ──────▶ bin/mb.js (CLI) ───────────────────────────┼──▶ src/ops.js ──▶ src/store.js ──▶ files
  Browser ───────▶ bin/server.js (HTTP) ▶ public/index.html ──┘        │                 │
  Any chat ──────▶ mb context <id> (paste) ◀───────────────────────────┘                 ▼
                                                                          src/reports.js ▶ HTML · PDF · XLSX · MD · JSON
```

**One operations catalogue** (`src/ops.js`) defines every action once (JSON-schema input + handler). The MCP server exposes them as tools, the HTTP server as `POST /api/op/<name>` (plus REST sugar), and the CLI calls them directly — so all channels behave identically.

## Files as the database

| Location | File | Purpose |
|----------|------|---------|
| `<projectsRoot>/<id>/` | `project.json` | metadata: `name{ar,en}`, `description{ar,en}`, `status`, `priority` 0–5, `revenue`, `progress` 0–100, `tags`, `sessions`, `links`, `created`, `updated` |
| | `brain.json` | `sections`: `done` · `findings` · `current` · `next` · `improvements` · `suggestions` (`by`, `status`) · `decisions` · `blockers` · `constraints`; each item `{id,text,date,by,source,evidence?}` |
| | `journal/YYYYMMDD-HHMM-<slug>-<id>.md` | frontmatter `id,date,type,title,progress,model,source,tags` + Markdown body |
| | `BRAIN.md` | generated view — never edited by hand |
| | `CLAUDE.md` | generated once; instructions for Claude Code inside the project |
| `<platformRoot>/data/` | `registry.json` | `projects[{id,path,missing}]`, `sessions[]` (session → project map) |
| | `platform-brain.json` | `learned[]`, `skills[]`, `tools[]`, `capabilities[]`, `requests[]` (tool requests) |
| | `requests.json` | owner → Claude task inbox |
| | `reports/` | generated reports |

Why files: Claude reads/writes them natively, they diff in git, survive any tooling change, and need no server to be inspected. The registry is a cache — `mb scan` rebuilds it from folders.

## Progress semantics

- `project.progress` is set explicitly (`mb set --progress`) **or** by the latest journal entry carrying `progress`.
- Reports compute `progressAtStart` (last entry with progress before the period; 0 if the project was created inside it) and `progressAtEnd` → `progressDelta`.
- "Nature of progress" = journal entry `type` (`progress`, `milestone`, `decision`, `blocker`, `suggestion`, `note`, `report`) — filterable.
- `dormantSuggested` = no activity for `dormantAfterDays` (45) — the dashboard shows 💤; the owner decides.

## Model attribution

Every brain item and journal entry carries `by`/`model` ∈ `claude · opus · sonnet · haiku · fable · human · other`. Suggestions additionally carry `status` (`proposed · accepted · rejected · done`). Reports aggregate suggestions per model.

## Zero dependencies

Only Node built-ins: `fs`, `path`, `http`, `zlib` (xlsx zip), `crypto` (ids), `child_process` (headless PDF, open browser), `readline` (MCP stdin). Target Node ≥ 18; tested on 22.

## Security notes

- The HTTP server binds `127.0.0.1` by default (local only). No auth — do not expose it; put it behind a reverse proxy with auth if you must.
- Static/report routes are path-normalised and confined to `public/` and `data/reports/`.
- MCP runs over stdio only — no network surface.
