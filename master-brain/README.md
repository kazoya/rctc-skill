# Master Brain — ماستر برين

> [!IMPORTANT]
> **Repository snapshot notice:** this bundled Master Brain is the repository snapshot declared by `master-brain/package.json` (currently 1.0.0 / 19-tool generation). Do not infer that it is the newest private/local Master Brain runtime. Consumers that need newer operations must verify the source/version explicitly before claiming parity.

**منصة متابعة المشاريع والعقل الهندسي الواعي** — مجلد لكل مشروع، عقل هندسي (المنجز / النتائج / الجاري / التالي / التحسينات / مقترحات منسوبة للنموذج)، تقارير بالفترات وطبيعة التقدّم (HTML → PDF، Excel، Markdown، JSON)، وقناة مباشرة مع **Claude Code** و**Claude Desktop** عبر MCP والطرفية.

**Portfolio tracker & conscious engineering mind** — a folder per project, an engineering brain per project, period/progress reports, and a native MCP + CLI channel for Claude Code / Claude Desktop. **Zero npm dependencies** — runs with `node` alone (≥ 18).

Born from [kazoya/rctc-skill → portfolio-commander](https://github.com/kazoya/rctc-skill/tree/master/portfolio-commander) and shipped with the **[start-skill](skills/start-skill/)** (مهارة البدء).

---

## ⚡ التشغيل السريع / Quick start (Windows)

**لا يوجد Node على الجهاز؟ لا مشكلة — انقر مرّتين على `run.cmd`.**
يبحث عن Node، وإن لم يجده ينزّل نسخة **محمولة** داخل `.node\` (بلا صلاحيات مسؤول، بلا مثبِّت، بلا تغيير في PATH)، ثم يهيّئ المنصة ويفتح اللوحة.

```powershell
cd E:\master
.\run.cmd                        # ← الطريقة الموصى بها: تثبيت + تشغيل بنقرة
```

يدوياً إن كان Node مثبّتاً لديك:

```powershell
.\scripts\install.ps1            # add -AddToPath to use "mb" from anywhere
mb serve --open                  # http://127.0.0.1:4545
mb doctor
```

**بلا أي تثبيت إطلاقاً:** افتح `dashboard-offline.html` بالنقر المزدوج — لوحة للقراءة مع منشئ تقارير قابل للطباعة PDF.

macOS / Linux: `bash scripts/install.sh` ثم `node bin/mb.js serve --open`.

## 🗂️ مجلد المشروع / Project folder

```
D:\projects\<project-id>\
  project.json   name (ar/en) · status · priority · progress · tags · sessions
  brain.json     done · findings · current · next · improvements · suggestions(by model) · decisions · blockers · constraints
  journal\       one Markdown file per progress entry (date · type · progress · model)
  files\         working files
  BRAIN.md       generated view (read this first)      CLAUDE.md   instructions for Claude Code
```

## 🤖 قنوات Claude / Claude channels

| القناة | كيف |
|--------|-----|
| **Claude Code** | افتح `E:\master` — `.mcp.json` يحمّل خادم `master-brain` تلقائياً (19 أداة + موارد + prompts). المهارات: `/master-brain`, `/start-skill` |
| **Claude Desktop** | `scripts/install.ps1` يضيف `master-brain` إلى `claude_desktop_config.json` — أعد تشغيل التطبيق |
| **أي محادثة** | `mb context <id|all>` → انسخ والصق |
| **الطرفية** | `mb list · show · log · brain · suggest · report · learn · request-tool · tasks` |
| **REST** | `GET /api/projects` · `POST /api/report` · `POST /api/op/<name>` … |

## 📄 التقارير / Reports

```powershell
mb report --from 2026-09-01 --to 2026-09-30 --format all --group status --platform --open
mb report --project cv-job-search --types milestone,decision --format xlsx --lang en
mb report --status active,blocked --min-progress 20 --format pdf
```
Filters: period · projects · statuses · entry types (nature of progress) · models · progress range · grouping (status / priority). Output in `data/reports/`. PDF is automatic when Edge/Chrome exists; otherwise print the HTML.

## 🧠 العقل العام / Platform brain

What Claude learned, acquired skills, tools, capabilities, tool requests: dashboard → **العقل العام**, or `mb brain-platform`, or [skills/start-skill/LEARNED.md](skills/start-skill/LEARNED.md).

## 🧪 الاختبار / Tests

```
npm test        # util + smoke (CLI · reports · XLSX · HTTP API · MCP stdio) — 40+ checks, no network
```

## 🔒 الخصوصية / Privacy

Publish the tool, never the data: `config.json`, `data/`, `seed/initial-projects.json` are git-ignored. Use `seed/example-projects.json` for demos.

## Docs

[ARCHITECTURE](docs/ARCHITECTURE.md) · [CLAUDE-INTEGRATION](docs/CLAUDE-INTEGRATION.md) · [REPORTS](docs/REPORTS.md) · [SKILLS-CATALOG](docs/SKILLS-CATALOG.md) · [LEARNED](skills/start-skill/LEARNED.md) · [CHANGELOG](CHANGELOG.md)

MIT © 2026 — built with Claude (Cowork). Vendored skills © kazoya/rctc-skill (MIT).
