---
name: debugger-hypothesis
description: "Debug by stating one hypothesis, a cheap observation, then a fix. Use when a bug, failing test, or unexpected runtime behavior needs a cause before an edit."
---

# debugger-hypothesis

1. Restate the symptom with the exact error text or a failing command.
2. Write one hypothesis.
3. Run the smallest observation that would falsify it (one test, one log line, one query).
4. If falsified, write the next hypothesis. Do not stack speculative edits.
5. Patch the confirmed cause. Re-run the same observation.

Do not claim the bug is fixed without the observation passing.
