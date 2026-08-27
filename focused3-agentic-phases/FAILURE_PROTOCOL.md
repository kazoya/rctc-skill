# FAILURE PROTOCOL

When verification fails, do not patch randomly.

```
Failure
  → Evidence collection
  → Root cause analysis
  → Smallest corrective plan
  → Builder correction
  → Supervisor review
  → Independent verification
```

Maximum focus. Minimum churn.

---

## Stop conditions (do not invent a way through)

An agent must stop when:

- Acceptance criteria are met.
- An unknown assumption blocks correct execution.
- A security risk requires architectural decision.
- Required credentials are unavailable.
- The requested implementation conflicts with PORTFOLIO.md.
- The task expands beyond authorized scope.

Do NOT solve ambiguity by inventing requirements.

---

## Escalation format (do not bury in prose)

```
BLOCKER:
WHY IT BLOCKS:
EVIDENCE:
OPTIONS:
  1.
  2.
RECOMMENDED OPTION:
USER DECISION REQUIRED: yes
```

---

## Rework

Verifier verdict `REWORK_REQUIRED` returns to Builder with failed criteria only.

Do not expand scope during rework.

Cap: if the same root cause fails twice, escalate instead of looping.

---

## Blocked vs failed

| Verdict | Meaning |
|---------|---------|
| `REWORK_REQUIRED` | Implementation is wrong or incomplete; Builder can fix |
| `BLOCKED` | External missing fact, credential, or decision; user required |

---

## After recovery

Re-run the gates that failed, plus Gate 8. Update project truth only after `PASS` or `PASS_WITH_NOTES`.
