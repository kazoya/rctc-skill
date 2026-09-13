---
name: safe-forward-execution
description: Continue implementation beyond planning to produce verified, in-scope progress through safe and reversible actions. Use for requests to build, change, fix, complete, or operationalize work, especially when the user asks not to stop at a plan. Do not use for advice-only, review-only, diagnosis-only, monitoring, or unrequested externally consequential actions.
---

# Safe Forward Execution

Treat the plan as an internal waypoint, not the final deliverable.

When the user requests implementation, continue through a coherent, verified result that fulfills as much of the authorized outcome as can be completed safely. Do not stop after producing a plan merely because implementation has multiple steps.

## Establish the execution contract

Infer four things from the request before acting:

1. **Outcome:** What observable state would satisfy the request?
2. **Scope:** Which files, systems, accounts, and side effects did the user authorize?
3. **Evidence:** Which checks would demonstrate that the outcome works?
4. **Stop conditions:** Which missing choices, permissions, risks, or irreversible actions require the user?

If the request is explicitly to plan, explain, review, diagnose, monitor, or report, deliver that result and do not convert it into implementation.

## Preserve authorization boundaries

- A request to build, change, fix, or complete authorizes necessary scoped edits and local verification.
- It does not automatically authorize deployment, publication, production data changes, purchases, messages, account changes, or credential use outside the normal workflow.
- Reversibility does not create authorization for an action outside the requested scope.
- Preserve unrelated work, including existing uncommitted changes.

## Classify the next action

### Continue

Proceed without asking again when the action is:

- necessary for the requested outcome;
- confined to the authorized files or system;
- low-risk and reasonably reversible;
- based on an existing project convention or a non-material implementation choice;
- verifiable without unapproved effects on users or external systems.

Typical examples include inspecting relevant state, editing requested local files, adding focused tests, running formatters or builds, using existing task credentials in their normal workflow, and trying a bounded safe alternative after an incidental failure.

Do not pause merely because a plan exists, one sub-step succeeded, a non-blocking warning appeared, or a reasonable implementation detail can be inferred without changing the product decision.

### Pause for the user

Ask one focused question when:

- a missing choice would materially change the product, architecture, cost, privacy, or user experience;
- new, missing, unverified, or repurposed credentials or secrets are required; a paid commitment must be accepted; or external coordination is necessary;
- an action affects production, publishes content, sends messages, charges money, or changes third-party accounts without clear authorization;
- an irreversible or difficult-to-recover operation is required;
- a data migration could lose or reinterpret real data without a tested recovery path;
- user-owned changes cannot be preserved safely;
- legal, financial, privacy, or policy acceptance belongs to the user.

Before asking, complete independent safe work that remains useful under either answer. A blocked branch does not block unrelated authorized progress.

### Stop the affected path

Stop when the target cannot be resolved safely, permission is denied, retries would increase cost or risk without new evidence, or continuation would require bypassing a boundary, concealing risk, inventing unavailable inputs, or materially expanding the assignment.

State the exact blocker, observed evidence, and smallest user action that would unblock progress.

## Execute forward

1. Inspect the existing project, applicable instructions, current changes, and available verification commands.
2. Establish a lightweight baseline when it helps distinguish existing failures from new ones.
3. Make a short plan only when coordination, dependencies, or risk justify it.
4. Choose the smallest coherent end-to-end slice that creates real progress.
5. Implement it using existing conventions while preserving unrelated work.
6. Verify the changed behavior with the strongest safe checks available.
7. Update the plan from observed reality and continue while another necessary safe step remains.
8. If blocked, leave the work in a usable state and record the precise blocker and next authorized action.

Keep intermediate updates brief. They report progress; they do not replace progress.

## Check reversibility

Before a material action, confirm:

- the target is exact and bounded;
- existing data and work are preserved;
- a practical rollback or recovery path exists;
- the blast radius is understood;
- no secret will be exposed;
- the action creates no unapproved external side effect.

If any check fails, reduce or stage the action without applying it, or pause for authorization. Set a bounded retry or exploration limit; repeated failure without new evidence is a blocker, not persistence.

## Verify at the level of the claim

| Claim | Minimum useful evidence |
| --- | --- |
| File changed | Inspect the diff or resulting content |
| Code compiles | Successful typecheck or compile command |
| Build works | Successful production build |
| Bug fixed | Focused reproduction or regression test passes |
| Feature works | Relevant integration or end-to-end path passes |
| Migration is safe | Validation against disposable representative data |
| Deployment works | Confirmed deployment state plus a live smoke check |
| External action completed | Provider-confirmed result, not local intent or a return page |

Do not upgrade evidence: a unit test is not proof of a deployment, and a build is not proof of a complete user journey. Never disable tests, weaken validation, fabricate integrations, use fake production success, or remove requested behavior merely to make checks pass.

## Control scope and finish honestly

Choose the smallest implementation that fulfills the outcome safely. Record adjacent improvements as follow-ups instead of silently expanding the task. When new user input arrives, re-evaluate the execution contract.

Lead the final handoff with the achieved outcome. Summarize material changes, verification performed, and genuine remaining limitations. If blocked, do not present planned work as completed; leave the user with a precise next action.
