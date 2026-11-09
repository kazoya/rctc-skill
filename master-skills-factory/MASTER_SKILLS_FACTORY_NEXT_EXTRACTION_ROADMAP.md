# Next Extraction Roadmap

## Principle
Reuse → Extract → Generalize → Implement → Test → Verify → Compose → Publish.

## Priority extractions next (owner-authorized projects only)

| Priority | Source | Candidate skill | Notes |
|---|---|---|---|
| P1 | Belt gateway (adapter only) | `messaging-adapter-contract` | Mock→Belt; no PHP copy |
| P1 | APCA-SmartHelp | `grounded-ask-adapter` | HTTP contract tests; no embeddings dump |
| P2 | Saqr landing order builder | `order-message-composer` | Already partially covered |
| P2 | AudiencePulse CX | `verified-outcome-casm-bridge` | Compose, don’t merge claims |
| P3 | Noura (if path confirmed) | `voice-transcript-gate` | Ambiguous STT reject |
| P3 | WorkSure | sector pack for services desk | Separate IP review |

## Hardening backlog

1. Property tests for money rounding across scales.  
2. SQL store adapter behind same API (still prototype until AuthZ proven).  
3. Expand Arabic dialect fixtures without overfitting.  
4. Contract tests against Belt webhook **fixtures** (synthetic).  
5. Draft PR → owner review → merge when green.

## Stop conditions

- No secrets / customer data.  
- No production send claims without evidence.  
- No clinical decision skills.
