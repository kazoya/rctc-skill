---
name: release-notes-from-git
description: "Write release notes from merged commits and pull requests, grouped by user impact. Use when tagging a version or preparing a changelog entry."
---

# release-notes-from-git

1. `git log --oneline <previous-tag>..HEAD` and the merged PR titles.
2. Group lines as: added, fixed, changed, security. Drop typo-only noise unless the user wants everything.
3. Write what a user of the software can do differently, not the file list.
4. Link the compare URL.
5. Do not invent fixes that are not in the log.

Update `CHANGELOG.md` only when the repo already keeps one.
