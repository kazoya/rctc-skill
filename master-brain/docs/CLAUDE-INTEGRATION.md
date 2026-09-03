# Claude integration — الربط مع Claude Code و Claude Desktop

## 1) Claude Code (MCP, automatic)

`E:\master\.mcp.json` (written by `scripts/install.ps1` with the absolute path):

```json
{ "mcpServers": { "master-brain": { "command": "node", "args": ["E:\\master\\bin\\mcp.js"] } } }
```

Open Claude Code in `E:\master` (or add the server user-wide: `claude mcp add master-brain -- node E:\master\bin\mcp.js`). Verify with `/mcp`. The server sends `instructions` that tell Claude the working rules automatically.

Skills: `%USERPROFILE%\.claude\skills\master-brain` and `…\start-skill` (copied by the installer) → `/master-brain`, `/start-skill`.

Per-project: every `D:\projects\<id>\CLAUDE.md` tells Claude Code to read `BRAIN.md` first and how to log back.

## 2) Claude Desktop (MCP)

`%APPDATA%\Claude\claude_desktop_config.json` — the installer merges:

```json
{ "mcpServers": { "master-brain": { "command": "node", "args": ["E:\\master\\bin\\mcp.js"] } } }
```

Restart Claude Desktop → the 🔌 tools list shows `master-brain` (19 tools). Prompts `start_work` and `daily_review` appear in the prompt picker. Resources: `masterbrain://project/<id>`.

No MCP? Paste channel: `mb context all` (or the dashboard → **قناة Claude** → copy) and paste into the chat.

## 3) MCP tools

| Tool | Use |
|------|-----|
| `list_projects` / `get_project` / `get_context` | discover & read the brain |
| `create_project` / `update_project` | slots, status, priority, progress |
| `add_journal_entry` / `list_journal` | progress log (type, %, model) |
| `add_brain_item` / `add_suggestion` / `update_brain_item` / `remove_brain_item` | engineering mind |
| `generate_report` | html · pdf · xlsx · md · json · all — with period & progress filters |
| `get_platform_brain` / `add_learning` | lessons, skills, tools, capabilities |
| `request_tool` | ask the owner to approve a tool (n8n, Notion, VM, XAMPP…) |
| `list_requests` / `update_request` | owner → Claude task inbox |
| `get_stats` / `scan_projects` | totals, registry refresh |

## 4) Cowork (cloud sessions)

Connect `E:\master` as the session folder. Cowork sessions do not run MCP servers, so they use the files directly: read `D:\projects\<id>\BRAIN.md`, and write through the CLI when a local shell is available, or by editing `brain.json` / adding `journal/*.md` files (then `mb sync`).

## 5) Terminal cheat-sheet

```
mb list · mb show <id> · mb context <id|all>
mb log <id> --title ".." --type progress --progress 40 --model opus --body ".."
mb brain <id> add <section> ".." --by fable · mb suggest <id> ".." --by fable
mb report --from 2026-09-01 --to 2026-09-30 --format all --group status
mb learn skills ".." --name .. --url .. · mb request-tool n8n --reason ".."
mb tasks --status pending · mb task done <id> --result ".."
mb serve --open · mb doctor · mb scan · mb sync
```
