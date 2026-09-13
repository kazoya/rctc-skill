# Skills catalogue — كتالوج المهارات (GitHub research, 2026-09-03)

Researched while building Master Brain. Status: **installed** = bundled/applied here · **recommended** = install when the use-case appears · **catalog** = search index.

## Applied / bundled

| Skill | Repo | License | Status | What we took |
|-------|------|---------|--------|--------------|
| rctc-method | https://github.com/kazoya/rctc-skill | MIT | installed (vendor) | Role → Context → Task → Constraints; one focused question; state assumptions |
| portfolio-commander | https://github.com/kazoya/rctc-skill/tree/master/portfolio-commander | MIT | installed (vendor) | registry, active/dormant, priority 1–5, revenue flag, engineering-mind file order (SKILL.md → AGENTS.md → CLAUDE.md → README.md), dashboard + copy-paste requests, privacy model |
| focused3-agentic-phases | https://github.com/kazoya/rctc-skill/tree/master/focused3-agentic-phases | MIT | installed (vendor) | THINK → EXECUTE → PROVE; confidence ladder; DONE = IMPLEMENTATION × TEST × VERIFICATION × EVIDENCE |
| continuous-improving | https://github.com/kazoya/rctc-skill/tree/master/continuous-improving | MIT | reference | gate protocol (human decision / material blocker / mission objective) — mirrored by `request_tool` + owner approvals |
| logged-in-browser | this package | MIT | installed · **always recommended** | Drive the operator's already-logged-in Chrome (same cookie jar). UIA ValuePattern; do not trust Playwright/CDP or Claude-in-Chrome MCP tabs until they share that jar |
| start-skill | this package | MIT | installed | kickoff protocol for any portfolio |
| master-brain | this package | MIT | installed | operating rules for the platform |
| web-marketing-and-personal-builder-super-skill | https://github.com/kazoya/rctc-skill/tree/master/web_marketing_and_personal-builder-super-skill | MIT | installed | URL/bio → professional marketing / factory concept site → GitHub + Vercel; pairs with safe-forward-execution; sub-routes factory-sales-concept + ui-ux-pro-max + WhatsApp QR |
| factory-sales-concept | https://github.com/kazoya/rctc-skill/tree/master/factory-sales-concept | MIT | installed | manufacturer Arabic RTL sales-concept platforms (Al-Majjarra / Banoon pattern) |

## Recommended (install on demand)

| Skill | Repo | Install | Why / when |
|-------|------|---------|-----------|
| ui-ux-pro-max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` → `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` (or `npm i -g ui-ux-pro-max-cli && uipro init --ai claude`) | design systems for dashboards, social templates, law.risha360.com — 79 UI styles, 192 palettes, 74 font pairs, 119 UX rules, 22 stacks |
| n8n-skills | https://github.com/czlonkowski/n8n-skills | `/plugin marketplace add czlonkowski/n8n-skills` → `/plugin install` (needs n8n-mcp: https://github.com/czlonkowski/n8n-mcp) | automation: scheduled reports, alerts, data pipelines (after the owner approves n8n) |
| n8n-io/skills | https://github.com/n8n-io/skills | clone → `~/.claude/skills/` | official n8n conventions |
| document-skills (docx/xlsx/pptx/pdf) | https://github.com/anthropics/skills | `/plugin marketplace add anthropics/skills` → `/plugin install document-skills@anthropic-agent-skills` | Word/Excel/PowerPoint/PDF deliverables from project data |
| webapp-testing | https://github.com/anthropics/skills (example-skills) | `/plugin install example-skills@anthropic-agent-skills` | Playwright tests for the dashboard |
| playwright-skill / puppeteer-skill | https://github.com/VoltAgent/awesome-agent-skills (testmu-ai) | see catalog | browser automation & scraping (contacts pipeline, publishing checks) |
| internal-comms | anthropics/skills | as above | status reports / newsletters from journal data |

## Catalogs (search first)

- https://github.com/VoltAgent/awesome-agent-skills — 1000+ skills (Claude Code, Codex, Gemini CLI, Cursor)
- https://github.com/ComposioHQ/awesome-claude-skills — curated Claude skills & tools
- https://github.com/topics/n8n-skills — n8n skill packs
- https://github.com/quemsah/awesome-claude-plugins — plugin adoption metrics (via n8n)

## Rule

Every skill adopted must be recorded: `mb learn skills "<what it does>" --name <name> --url <repo> --status installed|recommended --install "<cmd>"` — it then appears on the dashboard (**العقل العام → المهارات**) and in reports with `--platform`.
