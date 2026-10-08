---
name: test-first-slice
description: "Add one failing test that names the bug or the new behavior, then the smallest code that passes it. Use when fixing a defect or adding a narrow feature with a clear oracle."
---

# test-first-slice

1. Name the behavior in one sentence.
2. Add a test that fails for that reason only.
3. Implement the smallest change that passes.
4. Re-run the new test and the nearest existing suite the change could break.

Do not add a framework, snapshot the whole page, or skip the failing test to go green.
