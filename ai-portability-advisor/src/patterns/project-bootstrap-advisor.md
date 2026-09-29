# Project Bootstrap Advisor Pattern

Trigger: **new AI project** or greenfield architecture request.

## Propose baseline properties

- Swappable models (interface + config-driven routing)
- Swappable vector / knowledge store
- Data plane separate from provider control plane
- Adapters at provider boundaries
- Long-task state: checkpoints + resume
- Idempotent workers; retries with backoff; DLQ or failed-job log
- Cost per task/request (or explicit UNKNOWN until instrumented)
- Observability: traces, metrics, decision log
- Runnable local / cloud / hybrid via config
- Export, backup, restore runbooks
- No secrets in git
- No external changes without human approval

## Deliverable

Use `report_mode`: `project_bootstrap_advisor` plus six-layer map with **target** posture (not only current state).

## Do not

- Prescribe a specific commercial orchestration framework as default
- Commit, deploy, or provision cloud resources
