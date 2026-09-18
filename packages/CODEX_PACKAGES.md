# Codex — RCTC Package Loader

Token discipline: do **not** ingest the whole monorepo.

Procedure:
1. `packages/catalog.json` → select one package by user goal.
2. Open only listed paths for that package.
3. If stuck, query `registry/skills.json` by name/tag — still one skill at a time.
4. Use `skill-factory` only after composition fails.
5. No auto-git-push of new public skill repos without explicit owner approval text.

Default for "I want to learn programming": `beginner-coding-path`.
