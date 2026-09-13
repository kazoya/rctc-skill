# Multi-agent & local models

Goal: higher craft, still **safe-forward**. More agents ≠ more chaos.

---

## 1) Recommended cell (marketing site)

```text
Orchestrator (this skill)
   ├── Research agent     → inspect URL, facts ledger
   ├── Design agent       → ui-ux-pro-max palette / type / layout
   ├── Builder agent      → Next.js implementation
   └── Verifier agent     → build + smoke + honesty audit
```

Risk rules (from focused3):

| Risk | Agents |
|------|--------|
| LOW | Builder + Verifier |
| MEDIUM | + Design/Supervisor |
| HIGH (PII, payments) | **Stop** — out of scope |

Do not spawn agents to look sophisticated.

---

## 2) Parallelism that helps

Safe to parallelize:

- Brand color extraction vs copying UI kit from reference project
- Writing sales scripts vs scaffolding routes
- Desktop smoke vs mobile viewport checks

Never parallelize:

- Two writers editing the same `lib/config.ts`
- Deploy while build is red
- Conflicting git branches without orchestrator merge plan

---

## 3) Local Ollama (optional hint)

Use a local model when:

- Drafting Arabic microcopy variants privately
- Clustering “thin page” notes from a long crawl dump
- Summarizing a large product catalog before the cloud builder consumes it

Do **not** use Ollama as:

- Authority for phone numbers / legal claims
- Deploy approver
- Secret holder

Suggested pattern:

```text
Ollama draft → human or primary agent accepts → Builder commits only accepted text
```

Example local pulls (operator choice): `qwen2.5`, `llama3.1`, Arabic-capable instruct models — whatever the host already runs.

---

## 4) Cross-tool agents

| Host | Role |
|------|------|
| Cursor Agent (Composer/Claude) | Primary orchestrator + ship |
| Claude Code | Deep repo edits with xhigh effort when invited |
| Second Cursor chat | Verifier-only (“review honesty + a11y, no edits”) |
| Cloud agent | Optional preview branch — never silent production overwrite |

---

## 5) Contract between agents

Every delegated task needs:

1. Objective (one sentence)
2. Files allowed / forbidden
3. Acceptance checks
4. Evidence to return (log excerpt, screenshot path, build exit code)

Without that contract, do not delegate.
