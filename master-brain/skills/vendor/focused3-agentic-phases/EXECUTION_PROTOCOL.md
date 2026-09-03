# EXECUTION PROTOCOL

## Operating loop

```
THINK → ASSIGN → BUILD → SUPERVISE → VERIFY → PROVE → RECORD TRUTH → NEXT TASK
```

One objective per cell. Prefer one understandable commit per objective.

Example commit messages:

- `chore(web): initialize Next.js application`
- `feat(ingestion): crawl website pages`
- `feat(ai): add embedding pipeline`
- `feat(chat): implement source-grounded retrieval`
- `feat(widget): add embeddable chat launcher`

Avoid: `update stuff`, `final changes`, `misc fixes`.

Do not commit unless the user asked. When they ask, follow the repo's git safety rules.

---

## PHASE 1 — THINK

Inspect the repository before making claims.

Required outputs:

```
TASK
CURRENT STATE
DESIRED STATE
SCOPE
NON-GOALS
DEPENDENCIES
RISKS
ACCEPTANCE CRITERIA
EXPECTED FILE CHANGES
TEST PLAN
ROLLBACK PLAN
```

Label every material fact:

| Label | Meaning |
|-------|---------|
| `[VERIFIED]` | Observed in the repo, command output, or user artifact |
| `[ASSUMPTION]` | Stated explicitly; must not be silent |
| `[UNKNOWN]` | Missing; do not fill with invention |
| `[DECISION]` | Choice made with rationale |

Then ASSIGN: pick agents by risk (see [AGENT_ROLES.md](AGENT_ROLES.md)), generate prompts from [PROMPT_FACTORY.md](PROMPT_FACTORY.md).

---

## PHASE 2 — EXECUTE

Task Agent implements the smallest coherent change that satisfies acceptance.

Forbidden during execute:

- Speculative refactoring
- Unrelated cleanup
- Bonus features
- Architecture changes outside scope
- New frameworks / ORMs / databases / auth / queues / vector DBs / state libraries / payment systems without justification

Every Task Agent receives: ROLE, MISSION, CURRENT VERIFIED STATE, FILES ALLOWED TO MODIFY, FILES NOT TO MODIFY, DEPENDENCIES, IMPLEMENTATION CONSTRAINTS, ACCEPTANCE CRITERIA, TEST COMMANDS, REPORT FORMAT.

---

## PHASE 3 — PROVE

Independent Verifier. Do not reuse the builder's narrative as proof.

Ask:

- Does it compile / typecheck?
- Does it run?
- Does it satisfy acceptance criteria?
- Did it break anything?
- Were unnecessary changes introduced?
- Did it violate architecture?
- Are security assumptions valid?
- Are tests meaningful?
- Can another engineer reproduce the result?

Then RECORD TRUTH in PORTFOLIO.md (phase, completed, verified, missing, next action, risks, confidence).

---

## Micro-commits

One engineering objective → one coherent commit when committing is authorized.

---

## Continuous learning (after significant cells)

Capture: WHAT WORKED / WHAT FAILED / WHAT TO REUSE / WHAT TO CHANGE.

Improve prompts over time. Do not rewrite focused3AgenticPhases because of one exception.
