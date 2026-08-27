# EVIDENCE PROTOCOL

Every completion report must provide evidence. Do not fabricate command results.

If a command was not executed, write: `NOT EXECUTED`.

---

## Fact labels (Think + reports)

| Label | Rule |
|-------|------|
| `[VERIFIED]` | Direct inspection or command output you ran |
| `[ASSUMPTION]` | Must be visible to the user |
| `[UNKNOWN]` | Must not become a silent fact |
| `[DECISION]` | Named choice, reversible when possible |

Repository reality beats README, plans, memory, previous agent statements, and user assumptions.

---

## File evidence

```
Created:
apps/web/package.json

Modified:
apps/web/app/page.tsx

Deleted:
(none)
```

Referenced files that do not exist are not evidence of implementation.

---

## Command evidence

```
npm install
→ PASS | FAIL | NOT EXECUTED
(paste relevant output / exit code)

npm run lint
→ ...

npm run build
→ ...
```

---

## Behavioral evidence

Observable user-facing or runtime fact.

Example:

```
GET /
returns page containing URL input.
```

For UI work: exercise the flow, not only a screenshot of first paint, when browser tools exist.

---

## Anti-hallucination

Never claim:

- already implemented
- configured
- working
- tested
- production ready

without direct repository evidence.

Empty folders, TODOs, mock routes, and unused dependencies are evidence of **scaffold**, not of **verified**.

---

## Confidence states

| State | Meaning |
|-------|---------|
| unknown | No reliable knowledge |
| planned | Design exists |
| scaffolded | Files or skeleton exist |
| implemented | Code exists |
| tested | Automated or manual test executed successfully |
| verified | Independent verifier confirmed acceptance |
| production-ready | Verified plus operational / security / reliability requirements |

Never promote status automatically.
