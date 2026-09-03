# Master Brain — منصة المتابعة والعقل الهندسي الواعي

هذا المجلد هو **منصة Master Brain**: وكيل متابعة لكل المشاريع الفرعية للمالك (وأي مشروع يُضاف لاحقاً)، يُصدر تقارير جماعية أو فردية حسب الطلب، ويحفظ "العقل الهندسي" لكل مشروع.

This folder is the **Master Brain platform**: the owner's portfolio agent — one folder per project under `projectsRoot`, an engineering mind per project, period/progress reports, and an MCP/CLI channel for Claude Code and Claude Desktop.

## ابدأ هنا / Start here (every session)

1. `node bin/mb.js list` — أو أداة MCP `list_projects` (الخادم مسجَّل في `.mcp.json` ويُحمَّل تلقائياً).
2. قبل العمل على مشروع: `get_project(id)` / `node bin/mb.js show <id>` — اقرأ عقله كاملاً.
3. بعد العمل: `add_journal_entry` (progress + model) → `add_brain_item` للنتائج → `add_suggestion` (منسوبة لنموذجك).
4. مهام المالك: `list_requests(status=pending)`. أدوات جديدة: `request_tool` — لا تثبيت بلا موافقة.
5. تقارير: `generate_report({from,to,format:"all",group:"status"})` → `data/reports/`.

التفاصيل الكاملة في المهارة: `skills/master-brain/SKILL.md`. مهارة التأسيس: `skills/start-skill/SKILL.md`.

## البنية / Layout

```
bin/mb.js        CLI        bin/server.js   HTTP dashboard (public/index.html)     bin/mcp.js   MCP stdio server
src/store.js     file store (project.json / brain.json / journal/*.md)             src/reports.js  HTML·PDF·XLSX·MD·JSON
src/ops.js       single operations catalogue shared by MCP + REST + CLI            src/xlsx.js     zero-dep xlsx writer
config.json      projectsRoot / port / lang / timezone                              data/           registry · platform-brain · requests · reports
skills/          start-skill · master-brain · vendor (kazoya/rctc-skill, MIT)       seed/           initial-projects.json (private) · example-projects.json (public)
scripts/         install.ps1 (Windows) · install.sh                                 test/           util.test.js · smoke.test.js
```

## قواعد ثابتة / Hard rules

- لا اعتماديات npm — كل شيء بمكتبات Node المدمجة (Node ≥ 18). `npm test` يجب أن يبقى أخضر.
- `BRAIN.md` و`CLAUDE.md` داخل مجلدات المشاريع مُولَّدة — عدّل المصدر (`brain.json` / `journal/`) عبر الأدوات.
- بيانات المالك (`config.json`, `data/`, `seed/initial-projects.json`) لا تُرفع إلى GitHub — الأداة فقط (`.gitignore`).
- انسب كل مقترح للنموذج الذي قدّمه. لا أرقام أو تواريخ مختلقة. لا تجاوز CAPTCHA/OTP.
- المشروع `dormant` لا يُطوَّر بلا إذن. أي أداة خارجية عبر `request_tool` أولاً.
