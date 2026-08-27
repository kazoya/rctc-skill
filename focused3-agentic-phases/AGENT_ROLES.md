# AGENT ROLES

Create a new role only when the task needs distinct domain expertise. Do not create a role because a filename is new.

Installing Next.js and adding the first page → same Frontend/Next.js agent.  
RLS design → not the UI agent.

---

## Level 0 — Principal Orchestrator

Responsible for: task decomposition, scope protection, agent assignment, dependency ordering, quality gates, final acceptance.

Does not normally write implementation code.

For large milestones, also run **PrincipalAuditAgent** after the cell:

- Was the correct agent selected?
- Was the prompt scoped?
- Did the supervisor catch architectural drift?
- Did the verifier test real behavior?
- Was completion declared prematurely?
- Was agent overhead unnecessary?
- Is the methodology helping delivery?

---

## Level 1 — Domain Supervisors

Architecture · AI · Database · Frontend · Security · Quality

Job: prevent expensive mistakes. Not implement.

Reject work that: invents requirements, adds unrelated features, changes architecture without approval, claims success without evidence, creates hidden debt, or duplicates existing functionality.

Review against: product scope, architecture, PORTFOLIO.md, acceptance criteria, maintainability, security, unnecessary complexity.

---

## Level 2 — Task Agents (builders)

Pick the narrowest specialist that still covers the objective.

Generic catalog: Next.js · Database · Supabase · AI/RAG · UI · Authentication · Billing · Testing · Security · DevOps · Documentation.

OmniAgent catalog (use when on that path):

| Agent | Milestone |
|-------|-----------|
| NextScaffoldAgent | M1 |
| SupabaseSchemaAgent | M2 |
| CrawlerAgent | M3 |
| ChunkingAgent | M4 |
| EmbeddingAgent | M4 |
| RetrievalAgent | M5 |
| ChatAgent | M6 |
| WidgetAgent | M8 |
| OAuthAgent | M9 |
| StripeAgent | M10 |

---

## Level 3 — Verification Agents

TestVerifier · DiffAuditor · SecurityVerifier · ArchitectureVerifier · ProductAcceptanceVerifier

The verifier must not trust the builder's report. Inspect actual files, diffs, commands, test results, and application behavior when possible.

Verdicts only: `PASS` | `PASS_WITH_NOTES` | `REWORK_REQUIRED` | `BLOCKED`.

Never use `DONE` without evidence.

---

## Optional high-risk additions

Architect Agent · Security Agent · Test Agent · Red-Team Agent · Performance Agent

Add only when risk justifies them.

---

## Three-agent minimum (medium+ risk)

| Agent | Job |
|-------|-----|
| A Builder | Smallest coherent change |
| B Supervisor | Architecture, scope, acceptance |
| C Verifier | Independent proof |

Low risk may omit Supervisor. High risk must add Architect and Security Reviewer.
