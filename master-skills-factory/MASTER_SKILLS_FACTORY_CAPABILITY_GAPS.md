# Capability Gaps — Composition Map

## Target composed pipeline

```
Customer request
→ validated order
→ database
→ dashboard
→ outbound message
→ inbound gateway
→ AI response
→ policy guard
→ verified result
```

## Component map

| Stage | RCTC / local now | External compose target | Gap |
|---|---|---|---|
| Request parse/validate | **IMPLEMENTED** master-skills-factory | Saqr trade-desk (private) | Dialect coverage |
| Pricing / quote | **IMPLEMENTED** (minor units) | Saqr geo-commerce | Full tax jurisdictions |
| Database | Local JSON prototype | Production Postgres/etc. | AuthZ, backups, HA |
| Dashboard | Text projection mock | Saqr admin UI / future | Real UI not in pack |
| Outbound | `wa.me` **PREVIEW_ONLY** | Belt `flutter_sms_gateway` | Send **NOT_IMPLEMENTED** |
| Inbound gateway | Mock receiver | Belt webhook PHP | Not wired |
| AI response | Clarification templates | APCA-SmartHelp `/api/ask` | No RAG in this pack |
| Policy guard | Injection + clinical reject | WhatsApp orchestrator policy | Expand tool allow-lists |
| Verified result | **IMPLEMENTED** | AudiencePulse/CASM patterns | Optional compose later |

## Belt / SmartHelp / Noura (inspected boundaries)

| Path | Finding | Action |
|---|---|---|
| `C:\Belt` | Present; includes `flutter_sms_gateway`, `APCA-SmartHelp` | Compose via adapter later |
| `C:\Belt\APCA-SmartHelp` | Present | Do **not** copy proprietary RAG/core into public RCTC |
| Noura | No `C:\noura*` root found this session | Treat as optional voice channel later |

## Explicit non-copies

Gateway licensing, PHP worker secrets, customer WA numbers, Saqr approved price books, Premium Self-Pulse — **out of public library**.

## Phase rule

Keep `claims.whatsapp_send = NOT_IMPLEMENTED` until an authorized integration proves delivery with independent evidence.
