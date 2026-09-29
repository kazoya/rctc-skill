---
name: ai-portability-advisor
version: 0.1.0
description: >
  Vendor-neutral AI architecture portability, recovery, and transition advisor.
  Six-layer assessment, lock-in and cost analysis, recovery/durability, transition
  recommendations (KEEP through REJECT), human approval gates, evidence register.
  Use when analyzing AI/RAG/agents systems, migration decisions, greenfield bootstrap,
  FinOps/MLOps/reliability concerns, or vendor lock-in. Evidence-first; no cloud
  deploy or git push without explicit user approval.
license: MIT
tags: [ai-architecture, portability, mlops, finops, reliability, vendor-neutral, rctc]
---

# AI Architecture Portability, Recovery & Transition Advisor

**Governing principle:** Choose AI architecture that is portable, changeable, and recoverable — so you are not hostage to one vendor or paying repeatedly for rework.

## When to use

- Assess an existing or proposed AI system (RAG, agents, inference, workflows).
- Answer: *Should we migrate? Where?* → **Architecture Transition Advisor** (`src/patterns/architecture-transition-advisor.md`).
- Start a new AI project → **Project Bootstrap Advisor** (`src/patterns/project-bootstrap-advisor.md`).
- Review lock-in, hidden cost, recovery, checkpoints, FinOps visibility.

## When NOT to use

- Generic prompt tuning without architecture scope (use RCTC core).
- Executing migrations, cloud provisioning, commit/push/deploy (analysis only unless user explicitly approves and you are in an execution context).

## Workflow

1. Read `src/intake-rctc-bridge.md` — **one** high-impact clarifying question max (RCTC global limit).
2. Classify evidence: `src/evidence-register.md` (`VERIFIED` | `INFERRED` | `UNKNOWN`).
3. Map **six layers**: `src/six-layers.md` — score 0–5 or `null` for unknown numerics.
4. Scan `src/risk-signals.md` — populate `risk_signals[]`.
5. Recommend actions: `src/recommendation-engine.md` — never auto-`MIGRATE` on provider difference alone.
6. Prioritize roadmap: `src/decision-priority.md`.
7. Apply gates: `src/human-approval-gates.md` — `PENDING_HUMAN_APPROVAL` for high-impact actions.
8. Emit human report from `templates/report-markdown.md` + machine report JSON per `templates/report-schema.json`.
9. Include `no_bluff_statement` in every report.

## Language

- Human narrative: `question_language` (`auto` from user message, or `config.example.yaml`).
- Arabic question → Arabic report; English technical terms in parentheses when needed.
- English question → English report.
- **Do not** produce full bilingual reports by default.
- JSON field names and enum values: **English**.

## Recommendation vs authorized action

- `recommendations[]` = analytical output.
- `authorized_actions[]` = empty unless user explicitly approved; high-impact work stays `PENDING_HUMAN_APPROVAL`.

## Portfolio Commander (optional, v1)

After a portability report, you may **mention** that [Portfolio Commander](https://github.com/kazoya/rctc-skill/tree/master/portfolio-commander) can help prioritize repos — no deep integration in v1.

## Installation (single SKILL source)

This folder is the **only** source of truth. No duplicate `skill/SKILL.md`.

```powershell
cd C:\rctc-skill\ai-portability-advisor
.\install.ps1
```

Copies the full package to `%USERPROFILE%\.cursor\skills\ai-portability-advisor\`.

## Validation

```powershell
python scripts/validate_report_schema.py tests/fixtures/report-scenario-01-valid.json
```

## Module index

| Path | Purpose |
|------|---------|
| `src/six-layers.md` | Layer model + rubric |
| `src/risk-signals.md` | Red flags |
| `src/recommendation-engine.md` | KEEP…REJECT + migration block |
| `src/decision-priority.md` | Roadmap priority rationale |
| `src/evidence-register.md` | Evidence statuses |
| `src/human-approval-gates.md` | Approval states |
| `src/intake-rctc-bridge.md` | RCTC + language |
| `src/patterns/*.md` | Transition + bootstrap patterns |
| `templates/report-markdown.md` | Human deliverable outline |
| `templates/report-schema.json` | Machine-readable schema |
| `tests/scenarios/` | Acceptance scenarios |
| `scripts/validate_report_schema.py` | Local schema validator |

## Hard constraints (agent)

- Evidence-first; no fabricated metrics or vendor feature claims.
- No secrets in reports; redact paths if user requests.
- No commit, push, deploy, paid cloud, or external API calls for this skill’s workflow.
- Do not delete or replace existing RCTC files.
- Stop at major architectural decisions until human approval.

*Compatible with RCTC Method — clarity before generation; depth before migration.*
