---
name: focused3-agentic-phases
description: >
  focused3AgenticPhases is a 3-phase agentic engineering OS (THINK → EXECUTE → PROVE)
  with specialized builders, expert supervision, independent verification, and hard
  evidence. Use when implementing, reviewing, or sequencing production work; when the
  user says focused3AgenticPhases, agentic cell, THINK EXECUTE PROVE, or NextScaffold;
  and for OmniAgent / C:\airealpro\chatbase engineering. Do not use for copy edits,
  status questions, or dumping large unscoped code.
---

# focused3AgenticPhases

Reusable engineering operating system. Not a code generator.

**Invoke:** `/focused3-agentic-phases`

**Law:** ONE OBJECTIVE. SPECIALIZED AGENT. EXPERT SUPERVISION. INDEPENDENT VERIFICATION. HARD EVIDENCE. THEN MOVE FORWARD.

```
THINK → ASSIGN → BUILD → SUPERVISE → VERIFY → PROVE → RECORD TRUTH → NEXT TASK
```

Never: PLAN → GENERATE EVERYTHING → HOPE.

PORTFOLIO.md is execution source of truth unless a later canonical file replaces it.

Read next, only as needed:

- [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md)
- [AGENT_ROLES.md](AGENT_ROLES.md)
- [PROMPT_FACTORY.md](PROMPT_FACTORY.md)
- [QUALITY_GATES.md](QUALITY_GATES.md)
- [EVIDENCE_PROTOCOL.md](EVIDENCE_PROTOCOL.md)
- [FAILURE_PROTOCOL.md](FAILURE_PROTOCOL.md)
- Templates: [templates/](templates/task-agent.md)
- Examples: [examples/](examples/feature-task.md)

---

## When to use

- Any engineering task that will change the repository.
- Milestone work (M0–M10 on OmniAgent).
- Bugs that need a root cause, not a guess.
- Architecture choices with lock-in.

## When not to use

- Pure Q&A about current files.
- Copy / comment / rename with no behavior change (Builder + Verifier is enough; skip the full cell theater).
- Generating the whole product in one pass.
- Inventing P1/P2/P3 product features while the current slice is unfinished.

---

## Three phases (mandatory)

| Phase | Name | Owner | Exit |
|-------|------|--------|------|
| 1 | THINK | Orchestrator | Task contract with labels `[VERIFIED]` `[ASSUMPTION]` `[UNKNOWN]` `[DECISION]` |
| 2 | EXECUTE | Task Agent | Smallest coherent change that can meet acceptance |
| 3 | PROVE | Verifier (independent) | `PASS` / `PASS_WITH_NOTES` / `REWORK_REQUIRED` / `BLOCKED` |

No phase skip. Writing code is not completion.

THINK must answer: what changes, why, what exists, what stays unchanged, acceptance, evidence, files, dependencies, failure modes.

Unknown facts must not silently become assumptions.

---

## Agentic cell (minimum)

```
Principal Orchestrator
        │
        ▼
      TASK
        │
 ┌──────┴──────┐
 ▼             ▼
Builder     Supervisor
 │             │
 └──────┬──────┘
        ▼
     Verifier
        │
   PASS | REWORK → Builder
```

- **LOW risk** (copy, trivial UI): Builder + Verifier.
- **MEDIUM risk** (API, query, auth): Builder + Supervisor + Verifier.
- **HIGH risk** (payments, RLS, deletion, prod migrations): Architect + Builder + Security Reviewer + Verifier.

Do not add agents to look sophisticated. Agent count tracks risk.

The orchestrator decomposes, assigns, protects scope, and accepts. It does not normally write implementation.

---

## Focus

One primary engineering objective at a time.

Finish one vertical step. Verify. Record truth. Continue.

Do not simultaneously implement unrelated systems (for OmniAgent: do not mix Next.js bootstrap with Supabase, RAG, Stripe, Widget, OAuth unless a proven technical dependency requires it).

---

## No fake progress

These are **not** completion:

Created documentation. Empty folders. TODOs. Interfaces without implementation. Referenced future files. Architecture diagrams. Unused dependencies. Mock-success API routes. Tests that never exercise behavior.

Completion requires observable working behavior plus evidence.

---

## Confidence (never auto-promote)

`unknown` → `planned` → `scaffolded` → `implemented` → `tested` → `verified` → `production-ready`

Repository reality beats README, plans, memory, previous agent statements, and user assumptions. Inspect first.

Never claim "already implemented", "working", "tested", or "production ready" without direct evidence.

---

## Definition of done

```
DONE = IMPLEMENTATION × TEST × VERIFICATION × EVIDENCE
```

If any factor is 0, DONE is false.

A task is done only when implementation exists, acceptance criteria pass, relevant tests pass, verifier approves, and project truth is updated.

Report with [templates/completion-report.md](templates/completion-report.md).

---

## Stop conditions

Stop when: acceptance met **or** an unknown blocks correctness **or** security needs an architectural decision **or** credentials are missing **or** the request conflicts with PORTFOLIO.md **or** scope expands beyond authorization.

Do not solve ambiguity by inventing requirements.

Escalate with: BLOCKER / WHY / EVIDENCE / OPTIONS / RECOMMENDED OPTION / USER DECISION REQUIRED.

---

## OmniAgent product path (do not reorder casually)

M0 repo bootstrap → M1 Next.js app → M2 Supabase+pgvector → M3 URL ingestion → M4 chunk+embed → M5 retrieval → M6 source-grounded chat → M7 live demo → M8 widget → M9 OAuth → M10 billing.

Deferred until core value is verified: CRM, WhatsApp, Voice, SEO Factory, advanced multi-agent.

Current verified stage (inspect PORTFOLIO.md before claiming otherwise): Phase 0 Paper OS / scaffolded.

First proposed cell (do **not** run unless the user authorizes execution):

- **Objective:** Git + Next.js 15 in `apps/web` with title, URL input, primary CTA.
- **Agents:** NextScaffoldBuilder, FrontendSupervisor, RuntimeVerifier.
- **Accept:** `npm install` succeeds, `npm run dev` launches, page loads, URL input visible, no build-breaking error.
- **Forbidden:** backend, Supabase, RAG, Stripe, widget.

---

## Prompt factory

Do not reuse one giant generic coding prompt. Generate a task-specific prompt from [PROMPT_FACTORY.md](PROMPT_FACTORY.md) and [templates/](templates/task-agent.md).

Every builder prompt includes: ROLE, OBJECTIVE, VERIFIED CONTEXT, INPUTS, ALLOWED CHANGES, FORBIDDEN CHANGES, IMPLEMENTATION RULES, ACCEPTANCE CRITERIA, VERIFICATION, OUTPUT CONTRACT.

---

## Architecture protection

Do not silently introduce a new framework, ORM, database, auth provider, queue, vector store, state library, or payment system.

If alternatives exist, present: OPTION / BENEFIT / COST / RISK / LOCK-IN / RECOMMENDATION.

Prefer boring reliable technology, small diffs, reversible decisions, one working vertical slice.

---

## After a verified milestone

Update PORTFOLIO.md (and the portfolio brief if this repo is registered): Current Phase, Completed, Verified, Known Missing, Next Action, Risks, Confidence.

Do not rewrite historical truth to make progress look better.

Capture: WHAT WORKED / WHAT FAILED / WHAT TO REUSE / WHAT TO CHANGE. Do not rewrite this methodology for one exception.
