# Reports — التقارير

Crystal Reports / RDLC are .NET technologies and cannot run inside Node.js. Master Brain produces equivalent professional output with zero dependencies:

| Format | How | Notes |
|--------|-----|-------|
| **HTML** | `--format html` | A4 print stylesheet, RTL/LTR, KPI cards, status/type/model tables, per-project brain snapshot + journal. Print → Save as PDF from any browser. |
| **PDF** | `--format pdf` (or `all`) | Automatic via headless **Microsoft Edge** or Chrome (`msedge.exe --headless --print-to-pdf`). Set `MB_BROWSER` to force a binary. |
| **Excel** | `--format xlsx` | Sheets: Summary · Projects · Journal · Brain · (Platform). Header style, frozen header row, autofilter, RTL sheets for Arabic. |
| **Markdown** | `--format md` | Same structure, ideal for Claude/Notion/GitHub. |
| **JSON** | `--format json` | Full data model for BI tools (Power BI, Excel Power Query…). |

## Filters (period & nature of progress)

```
--from 2026-09-01 --to 2026-09-30        period (journal entries + brain items dated inside it; progress delta computed)
--project a,b | all                       projects
--status active,blocked                   project statuses
--types progress,milestone,decision       nature of progress (journal entry types)
--models opus,fable                       who did the work
--min-progress 20 --max-progress 80       progress range
--group status | priority | none          grouping of the project sections
--only-active                             drop projects with no entries in the period
--platform                                append the platform brain (lessons/skills/tools/requests)
--lang ar | en   --title ".."   --open
```

Same options via MCP `generate_report` and `POST /api/report` (`from,to,projects,statuses,types,models,min_progress,max_progress,group,lang,format,title,include_platform,only_active_in_period`).

## Output

`E:\master\data\reports\report-<YYYYMMDDHHmm>-<scope>-<lang>.<ext>` — listed on the dashboard (**التقارير**) with open/download links.

## Weekly routine (suggested)

```
mb report --from <monday> --to <sunday> --format all --group status --platform --open
```
or ask Claude Desktop: *"run daily_review then generate_report format=all for the last 7 days"*.
