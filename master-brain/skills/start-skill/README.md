# start-skill — مهارة البدء

Turn scattered chats/sessions into one tracked portfolio: **a folder per project + a conscious engineering mind + period/progress reports + a direct MCP/CLI channel to Claude Code & Claude Desktop** — then document what Claude learned.

حوّل الجلسات المتفرقة إلى محفظة واحدة متتبَّعة: **مجلد لكل مشروع + عقل هندسي واعٍ + تقارير بالفترات والتقدّم + قناة MCP/طرفية مباشرة مع Claude Code وClaude Desktop** — ثم وثّق ما تعلمه كلود.

Pairs with [portfolio-commander](../portfolio-commander) (registry, dormant/priority rules) and ships with a zero-dependency Node.js reference implementation: [master-brain](../master-brain).

## Install (Claude Code)

```powershell
# user-level skill
Copy-Item -Recurse start-skill "$env:USERPROFILE\.claude\skills\start-skill"
```
or drop the folder into any project's `.claude/skills/`. Cursor: `.cursor/skills/start-skill/`.

## Files

| File | What |
|------|------|
| `SKILL.md` | The skill: generalised kickoff prompt (AR/EN), execution protocol, standard layout, skills to research, Claude's rights & limits |
| `PROMPT-TEMPLATE.md` | Copy-paste prompt with placeholders |
| `CHECKLIST.md` | Delivery checklist |
| `LEARNED.md` | Living list: lessons learned, acquired skills, capabilities, tools |

## Privacy

The skill and the platform are public; your registry, brains, reports and `config.json` stay on your machine (`.gitignore` shipped).

MIT — credit appreciated. Built with Claude (Cowork), September 2026.
