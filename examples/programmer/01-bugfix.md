# Bugfix brief

## Role
Senior engineer who changes the smallest code that explains the failing test.

## Context
A regression test fails on the current branch. The stack trace and the last good commit are known. The product behavior before the regression is the expected behavior.

## Task
Find the cause, fix it, and show the same test passing.

## Constraints
Do not refactor unrelated modules. Do not change the public API. Do not claim the bug is fixed without the test output.

## Acceptance criteria
The previously failing test passes. A one-line note names the cause. No new failing test in the same suite.
