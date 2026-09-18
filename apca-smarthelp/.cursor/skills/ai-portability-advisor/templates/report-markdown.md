# Human Report Template (sections 1–12)

Use the language chosen by `question_language`. Keep JSON/YAML separate (English fields).

## 1. Executive Summary

## 2. Six-Layer Architecture Map

Table or subsections per `layer_id`.

## 3. Ownership and Control Matrix

What must stay under user/org control per layer.

## 4. Lock-in and Portability Matrix

Summarize scores; call out `vendor_lock_in` ≥ 4.

## 5. Recovery and Durability Assessment

Checkpoints, idempotency, DLQ, resume behavior.

## 6. Hidden Cost Assessment

Visible vs hidden; ranges or UNKNOWN.

## 7. Transition Recommendations

Each with action enum; MIGRATE only with pilot/rollback/tests/gate.

## 8. 30/90-Day Roadmap

- Immediate (low risk)
- 30 days
- 90 days
- Strategic

## 9. Human Approval Gates

List `PENDING_HUMAN_APPROVAL` items explicitly.

## 10. Evidence and Assumptions Register

VERIFIED / INFERRED / UNKNOWN.

## 11. Machine-Readable Output

Point to accompanying `.json` file or embedded block.

## 12. No-Bluff Statement

What was verified, what was inferred, what remains unknown.

---

### Architecture Transition Advisor addendum

Follow order in `src/patterns/architecture-transition-advisor.md`.

### Project Bootstrap Advisor addendum

Follow `src/patterns/project-bootstrap-advisor.md`.
