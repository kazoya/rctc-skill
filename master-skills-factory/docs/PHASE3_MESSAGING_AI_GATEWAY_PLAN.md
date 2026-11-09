# Phase 3 Plan — Messaging & AI Gateway Composition

**Status:** PLAN ONLY — not authorized for production integration  
**Depends on:** Draft PR #27 review (no merge required to plan)

## Objective
Compose inbound/outbound messaging adapters, agent routing, human approval, delivery receipts, and tenant-safe conversations — using **synthetic messages** and **mocked gateway responses**.

## Study targets (read-only / adapter boundary)

| Source | Path / skill | Use |
|---|---|---|
| Belt Gateway | `C:\Belt\flutter_sms_gateway` + `belt-gateway-php` | Outbound/inbound contract shape |
| APCA SmartHelp | `C:\Belt\APCA-SmartHelp` + `belt-apca-smarthelp-cx` | Grounded ask / abstain |
| Noura | locate staging path when available | Voice transcript gate (optional) |
| RCTC WhatsApp Orchestrator | `whatsapp-agent-orchestrator-super-skill` | Tool allow-list + policy gateway |
| Current factory | `master-skills-factory` messaging mock | Extend, don’t replace |

## Proposed composable skills (draft names)

1. `messaging-adapter-contract` — send/receive interfaces; mock + Belt adapter stubs  
2. `delivery-receipt-store` — tenant-scoped synthetic receipt records  
3. `human-approval-gate` — block auto-send until actor approves  
4. `inbound-agent-router` — route to clarification / SmartHelp ask / escalate  
5. `conversation-tenant-guard` — forbid cross-tenant thread access  

## Acceptance (Phase 3 engineering, when authorized)

- [ ] Mock outbound never claims `sent:true` without receipt fixture  
- [ ] Human approval required before any “send” mock succeeds  
- [ ] Inbound injection still refused  
- [ ] SmartHelp adapter called only with synthetic corpus / fixture HTTP  
- [ ] No Belt PHP, tokens, or customer numbers copied into public RCTC  
- [ ] Tests + evidence report before any Draft PR for Phase 3  

## Explicit non-goals until separate authorization

Production WhatsApp/SMS send · live Belt deploy · real customer threads · Noura production voice · merge of PR #27 without owner review
