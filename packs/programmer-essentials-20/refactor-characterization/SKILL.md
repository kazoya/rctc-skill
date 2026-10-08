---
name: refactor-characterization
description: "Change structure without changing behavior by locking current behavior with a characterization test first. Use when the user asks to clean up, split a module, or rename internals."
---

# refactor-characterization

1. Agree the observable behavior that must stay (API response, CLI output, rendered text).
2. Add a test that records that behavior as it works today.
3. Move code. Do not mix a bugfix into the same commit.
4. The characterization test stays green. If it fails, the refactor changed behavior — revert that part.
5. Commit message says it is a refactor.

If the user also wants a bugfix, do that in a second commit after the move.
