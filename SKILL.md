---
name: rctc-method
description: Structure or improve AI prompts and implementation briefs with Role, Context, Task, and Constraints. Use when a request is vague, when the user asks for a stronger prompt, or when multiple agents need one precise handoff. Do not invoke merely because a normal request can already be completed directly.
metadata:
  short-description: Turn vague requests into precise AI briefs
---

<<<<<<< HEAD
# RCTC Method
=======
# 🧠 RCTC Method — Sohaib's Structured Prompt Framework
> **شعار RCTC-SKILLS:** ليست كل الحكم تصلح دائماً ولكن من طلب العلى سهر الليالي ^_^  
> _Not every rule fits every case — but those who seek excellence keep the night watch._
>>>>>>> fe9ba6f (feat(education): elevate ethical bug-bounty Portland-Pozzolanic pack)

RCTC means **Role → Context → Task → Constraints**. Use it to remove ambiguity that would materially change the result while preserving the user's momentum.

## Operating rule

Do not turn every request into an interview. If the task is already actionable, perform it. If a missing fact can be inferred safely, state the assumption briefly and proceed. Ask one focused question only when its answer would change the deliverable, authority, cost, risk, or architecture.

## Workflow

1. Identify the actual outcome and intended consumer.
2. Map what is known:
   - **Role:** the expertise or perspective genuinely needed.
   - **Context:** facts, audience, current state, and relevant inputs.
   - **Task:** the concrete deliverable or action.
   - **Constraints:** format, boundaries, quality gates, budget, time, and prohibited actions.
3. Separate material unknowns from details that can be reasonably inferred.
4. If blocked, ask the single highest-impact question and offer a sensible default.
5. Produce the requested artifact or action. Show an RCTC breakdown only when the user asks for one or when it improves a handoff.
6. End with acceptance criteria appropriate to the work: observable output, tests, evidence, or a clearly marked decision gate.

## Output modes

- **Prompt upgrade:** return a copy-ready prompt with objective, inputs, workflow, constraints, outputs, and acceptance criteria.
- **Agent handoff:** specify ownership, permitted tools, stopping conditions, evidence, and what requires human approval.
- **Direct work:** use RCTC internally and complete the task; do not stop after rewriting the user's request.
- **Multi-stage project:** keep the shared contract short and route substantial procedures to the relevant skill or project documentation.

## Boundaries

- RCTC improves instructions; it does not create authority to publish, pay, message, delete, deploy, or access accounts.
- Do not claim persistent learning or write a user profile unless the host provides that feature and the user has agreed to it.
- Do not assume local absolute paths or companion skills exist. Check availability before referencing them.
- Give concise decision reasoning, not private chain-of-thought.
- Preserve the user's chosen stack and scope unless a change is necessary and explained.

## Companion skills in this repository

| Need | Route |
|---|---|
| Continue safely beyond the plan | `safe-forward-execution` |
| Prove implementation through gates | `focused3-agentic-phases` |
| Build a company, factory, or personal marketing site | `web_marketing_and_personal-builder-super-skill` |
| Package evidence for an external AI and review the returned ZIP | `update-zip-skill` |
| Organize scattered projects into one portfolio | `start-skill` + `portfolio-commander` |
| Run repeated measured improvement | `continuous-improving` |

Recommend a companion only when it materially helps the current request. If it is available and the user asks for execution, use it rather than merely advertising it.

## Compact handoff template

```markdown
# Objective
[observable outcome]

## Role
[needed expertise]

## Context and inputs
[facts, current state, sources]

## Task
[actions and deliverables]

## Constraints and authority
[must/must-not, permissions, budget, format]

## Acceptance criteria
[tests, evidence, completion conditions]

## Stop and ask when
[material ambiguity, external commitment, destructive or irreversible action]
```
