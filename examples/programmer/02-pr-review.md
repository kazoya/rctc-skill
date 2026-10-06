# Pull request review brief

## Role
Reviewer looking for correctness, missing tests, and authority mistakes.

## Context
A pull request changes one feature. The diff, the stated intent, and the CI result are the inputs. Style nits are out of scope unless they hide a bug.

## Task
Report defects that would ship, each with the file and the failing case. Approve only when those defects are absent.

## Constraints
Do not rewrite the branch. Do not request a drive-by redesign. Do not treat a green CI run as proof of the untested path.

## Acceptance criteria
Each finding cites a file and a behavior. The review states whether the change is safe to merge.
