---
name: git-worktree-flow
description: "Isolate feature work in a git worktree and open a small pull request. Use when the user wants parallel branches, a clean master, or a reviewable diff without mixing unrelated files."
---

# git-worktree-flow

1. `git status` — do not stash over someone else's uncommitted work without saying so.
2. `git fetch origin`.
3. `git worktree add ../repo-feature -b feat/short-name origin/master` (or the repo default branch).
4. Commit only files that belong to the task. No secrets, no `node_modules`.
5. Push and open a PR whose body says what changed and how it was checked.
6. Remove the worktree after merge: `git worktree remove ../repo-feature`.

Default branch in this repo is `master`.
