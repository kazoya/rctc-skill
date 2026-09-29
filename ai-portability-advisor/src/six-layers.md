# Six-Layer Architecture Model

Assess each layer independently. Scores are `0–5` integers or `null` when `UNKNOWN` (never invent defaults).

| Layer ID | Name |
|----------|------|
| `data_knowledge` | Data & Knowledge |
| `models` | Models |
| `training_adaptation_evaluation` | Training, Adaptation & Evaluation |
| `applications_retrieval_agents` | Applications, Retrieval & Agents |
| `inference_serving` | Inference & Serving |
| `orchestration_execution` | Orchestration & Execution Infrastructure |

## Per-layer assessment fields (machine-readable)

| Field | Type | Notes |
|-------|------|-------|
| `layer_id` | enum | required |
| `components` | string[] | current components |
| `provider_or_technology` | string | neutral category if vendor unknown |
| `business_criticality` | 0–5 or null | |
| `data_sensitivity` | 0–5 or null | |
| `vendor_lock_in` | 0–5 or null | 5 = highest lock-in |
| `portability` | 0–5 or null | 5 = easiest to move |
| `replaceability` | 0–5 or null | |
| `recovery_capability` | 0–5 or null | checkpoints, resume |
| `observability_clarity` | 0–5 or null | |
| `progress_loss_risk` | 0–5 or null | |
| `rework_risk` | 0–5 or null | |
| `visible_cost` | string | range or `UNKNOWN` |
| `hidden_cost` | string | range or `UNKNOWN` |
| `migration_difficulty` | 0–5 or null | |
| `outage_impact` | 0–5 or null | |
| `assessment_confidence` | enum | `high` \| `medium` \| `low` |
| `evidence_ids` | string[] | links to `evidence[]` |
| `user_must_retain_control` | string[] | what should stay under user/org control |

## Ownership questions (all layers)

1. What must remain under user/company control?
2. Where is dangerous single-vendor dependency?
3. Hidden costs or needless rework?
4. Can the system resume after failure?
5. What is hard to change later?

Answer in `ownership_and_control_matrix` and layer narratives.
