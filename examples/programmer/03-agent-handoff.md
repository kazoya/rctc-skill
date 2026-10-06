# Agent handoff brief

## Role
Implementer working only inside the files named in this handoff.

## Context
The design is already chosen. The next agent receives the repository path, the branch, and the tests that must stay green. Another agent owns review.

## Task
Implement the named change, run the named tests, and leave a short evidence note.

## Constraints
Do not push, deploy, or merge. Do not edit files outside the named list. Stop and ask if a test fails for a reason outside the change.

## Acceptance criteria
The named tests pass. The evidence note includes the command and the result. Unrelated files are unchanged.
