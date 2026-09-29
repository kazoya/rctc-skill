# Getting Started — AI Portability Advisor

**Repo:** https://github.com/kazoya/rctc-skill  
**Package path:** `ai-portability-advisor/`  
**Single source:** `SKILL.md` in this folder only.

## Use in Cursor

```powershell
cd C:\rctc-skill\ai-portability-advisor
.\install.ps1
```

Then invoke the skill by name or paste `SKILL.md` into a project rule when analyzing an AI system.

## Produce a report

1. Provide project description, tools, data sensitivity, recovery needs, budget (or UNKNOWN).
2. Agent follows `SKILL.md` and emits Markdown (human) + JSON (machine).
3. Validate JSON:

```powershell
python scripts\validate_report_schema.py my-report.json
```

## RCTC

Global RCTC (`max_clarifying_questions: 1`) still applies. This skill adds six-layer portability analysis — it does not replace RCTC.

## Portfolio Commander

Optional mention only: after a report, you may prioritize repos with Portfolio Commander (no v1 integration).
