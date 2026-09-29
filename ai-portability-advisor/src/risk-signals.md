# Risk Signal Catalog

Detect and list in `risk_signals[]` when present. Each entry needs evidence status.

## Data & portability

- Data stored in non-exportable proprietary format
- Embeddings tied to single vendor index without export path
- No data / prompt / model versioning
- Secrets or API keys in repository

## Application & models

- Business logic coupled to one model provider API without adapter
- Proprietary API used without abstraction layer
- Sensitive business rules only in unversioned prompts

## Orchestration & recovery

- No checkpoints for long-running jobs
- Full job restart after partial failure
- No idempotency keys
- No structured retries with backoff
- No dead-letter queue or failed-task audit trail
- Workflow history not exportable

## Cost & operations

- No per-request or per-task cost attribution
- GPU cost inflation from duplicate work or poor scheduling
- No monitoring, alerts, or decision audit log
- No backup / restore plan

## Quality & change safety

- No tests for model swap or vector DB swap
- No pilot path before migration
- No rollback plan documented

## Scoring guidance

Risk signals inform layer scores and recommendation actions; they do not automatically imply `MIGRATE`.
