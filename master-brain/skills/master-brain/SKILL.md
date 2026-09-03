---
name: master-brain
description: >
  Operate the Master Brain portfolio platform (منصة ماستر برين) from Claude Code / Claude Desktop:
  read a project's engineering mind before working, log progress after, attribute suggestions to
  the model that made them, generate period/progress reports, and route tool requests to the owner.
  Use when the user mentions Master Brain, ماستر برين, العقل الهندسي, متابعة المشاريع, تقرير المشاريع,
  mb, a project id from the registry, or when a folder contains BRAIN.md / project.json.
---

# Master Brain — تشغيل المنصة من Claude

**Invoke:** `/master-brain` · **Platform:** `<platformRoot>` (e.g. `E:\master`) · **Projects:** `<projectsRoot>\<id>` (e.g. `D:\projects\cv-job-search`)

**Claude Code defaults for prize/ARC work:** `--model claude-opus-5[1m] --effort xhigh` (above high, not `max`). Pair with sibling `rctc-method` before large changes.

## القانون / The law

```
READ BRAIN  →  DO THE WORK  →  LOG PROGRESS  →  RECORD CONCLUSIONS  →  ATTRIBUTE SUGGESTIONS
```

1. **قبل أي عمل على مشروع:** `get_project(id)` (MCP) أو `mb show <id>` أو اقرأ `BRAIN.md` في مجلده. لا تبدأ من الصفر أبداً.
2. **بعد أي تقدّم ملموس:** `add_journal_entry` / `mb log <id> --title … --type progress|milestone|decision|blocker --progress <0-100> --model <opus|sonnet|fable|haiku>`.
3. **النتائج والقرارات والعوائق** → `add_brain_item` (sections: done · findings · current · next · improvements · decisions · blockers · constraints).
4. **مقترحات التحسين** → `add_suggestion(id, text, by=<your model>)` — **انسبها لنفسك دائماً**.
5. **مشروع `dormant`** → لا تطوير بلا إذن صريح (قاعدة portfolio-commander).
6. **أداة خارجية جديدة** → `request_tool(tool, reason)` وانتظر موافقة المالك على اللوحة. لا تثبيت صامت.
7. **مهام المالك** → `list_requests(status=pending)` ثم `update_request(id, in_progress|done, result)`.
8. **درس/مهارة/أداة جديدة** → `add_learning(kind=learned|skills|tools|capabilities, …)`.
9. **لا تعدّل `BRAIN.md` يدوياً** — يُولَّد من `brain.json` + `journal/`.

## أدوات MCP (19) / MCP tools

`list_projects` · `get_project` · `get_context` · `create_project` · `update_project` · `add_journal_entry` · `list_journal` · `add_brain_item` · `add_suggestion` · `update_brain_item` · `remove_brain_item` · `generate_report` · `get_platform_brain` · `add_learning` · `request_tool` · `list_requests` · `update_request` · `get_stats` · `scan_projects`

Resources: `masterbrain://context/all` · `masterbrain://project/<id>` · `masterbrain://platform-brain` · `masterbrain://registry`
Prompts: `start_work(project, task)` · `daily_review(lang)`

## الطرفية / CLI (`mb` = `node <platformRoot>\bin\mb.js`)

```
mb list                         mb show <id>                     mb context <id|all>
mb new <id> --ar ".." --en ".."  mb set <id> --status active --priority 1 --progress 40
mb log <id> --title ".." --type progress --progress 40 --model opus --body ".."
mb brain <id> add <section> ".." --by fable      mb brain <id> move <section> <itemId> done
mb suggest <id> ".." --by fable                  mb report --from 2026-09-01 --to 2026-09-30 --format all --group status
mb learn skills ".." --name .. --url ..          mb request-tool n8n --reason ".."
mb tasks --status pending                        mb task done <id> --result ".."
mb serve --open                                  mb doctor
```

## التقارير / Reports

`generate_report({from, to, projects, statuses, types, models, min_progress, max_progress, group: status|priority|none, lang, format: html|pdf|xlsx|md|json|all, include_platform})`
→ files under `<platformRoot>\data\reports\`. HTML prints to PDF; PDF is produced automatically when Edge/Chrome is installed.

## نهاية الجلسة / End of session (mandatory)

- journal entry with honest `progress` and your `model`
- brain updated (move finished `current` → `done`; add `next`)
- at least one attributed suggestion if you see an improvement
- `add_learning` for anything reusable you discovered
