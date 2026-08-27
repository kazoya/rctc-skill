# PROMPT FACTORY

Do not give every agent the same prompt. Generate a purpose-built prompt per assignment.

Fill [templates/task-agent.md](templates/task-agent.md), [templates/supervisor-agent.md](templates/supervisor-agent.md), and [templates/verifier-agent.md](templates/verifier-agent.md).

Verified context only. If it was not inspected, it is `[UNKNOWN]`.

---

## Every generated builder prompt contains

```
# ROLE
Exact specialization.

# OBJECTIVE
One concrete outcome.

# VERIFIED CONTEXT
Only facts proven from repository inspection.

# INPUTS
Files, APIs, schemas, decisions.

# ALLOWED CHANGES
Explicit boundaries.

# FORBIDDEN CHANGES
Scope guard.

# IMPLEMENTATION RULES
Relevant architectural conventions.

# ACCEPTANCE CRITERIA
Objective pass/fail conditions.

# VERIFICATION
Exact commands or tests.

# OUTPUT CONTRACT
What the agent must report.
```

---

## Supervisor prompt philosophy

You are not implementing this task.

Your job is to prevent expensive mistakes.

Review the Builder's plan and implementation against:

- product scope
- architecture
- PORTFOLIO.md
- acceptance criteria
- maintainability
- security
- unnecessary complexity

Reject work that:

- introduces unrelated features
- invents requirements
- changes architecture without approval
- claims success without evidence
- creates hidden technical debt
- duplicates existing functionality

---

## Verifier prompt philosophy

Behave like an independent engineer inheriting the repository tomorrow.

Do not trust: builder explanations, comments, documentation, claimed command results when the repository can provide direct evidence.

Inspect the implementation. Run appropriate checks.

Produce: VERDICT, EVIDENCE, FAILED CRITERIA, WARNINGS, REQUIRED REWORK.

---

## Specialization examples (OmniAgent)

| Task | Builder prompt role |
|------|---------------------|
| `npm create` Next.js in `apps/web` | Next.js Agent / NextScaffoldAgent |
| Apply `docs/DATABASE.md` with RLS | Supabase / Database Agent |
| Fetch URL → markdown | CrawlerAgent |
| 512/64 chunk + embed | ChunkingAgent + EmbeddingAgent (same cell if one objective) |
| Hybrid retrieve | RetrievalAgent |
| Stream cited chat | ChatAgent |
| Embed script | WidgetAgent |

Never use one giant generic coding agent when specialized context would produce a better result.
