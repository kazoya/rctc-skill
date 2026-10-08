---
name: github-actions-min-ci
description: "Add a small GitHub Actions workflow that installs dependencies, runs the repo's real check, and does not print secrets. Use when CI is missing or a workflow needs a tighter job."
---

# github-actions-min-ci

Prefer one workflow file:

- Trigger: `pull_request` and `push` to the default branch.
- Pin action major versions (`actions/checkout@v4`).
- Install from the lockfile (`npm ci`, `pip install -r` with hashes if the repo uses them).
- Run the command the repo already documents (`npm test`, `npm run validate:repo`).
- `permissions: contents: read` unless the job must write.
- Secrets only via `secrets.*`. Never `echo` them.

Show a failing run's relevant log lines before changing the workflow again.
