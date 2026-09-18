# Scenario 02 — Long-running agent loses all progress on failure

## Intake (summary)

- Agent runs multi-hour research/analysis workflows.
- No checkpoints; restart reruns from step 1 (user-stated).

## Expected skill behavior

| Criterion | Expected |
|-----------|----------|
| Detect checkpoints gap | orchestration_execution recovery ≈ 0 |
| Primary action | OPTIMIZE / ABSTRACT orchestration — not MIGRATE because different provider |
| Roadmap | Immediate: idempotency + checkpoint design |
| Human gate | Before production runner changes |

## Fixture

`fixtures/report-scenario-02-valid.json`
