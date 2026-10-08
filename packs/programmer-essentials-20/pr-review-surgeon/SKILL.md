---
name: pr-review-surgeon
description: "Review a pull request for correctness bugs, security mistakes, and missing tests. Use when the user asks for a code review. Report findings first, ordered by severity, with file references."
---

# pr-review-surgeon

Read the diff and nearby code. Do not restyle the change.

Order:

1. Bugs that change behavior or data.
2. Auth, injection, secret leakage, path traversal.
3. Missing tests for the risky branch.
4. API or migration compatibility.

Each finding: severity, file, why it fails, what to change. If nothing important is wrong, say so and mention residual risk (unrun tests, unseen production config).
