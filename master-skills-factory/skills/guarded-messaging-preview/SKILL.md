---
name: guarded-messaging-preview
description: >
  Build WhatsApp deep-link previews and guarded inbound auto-replies that never
  invent sell prices. Local messaging adapter refuses send. Compose later with
  Belt/APCA-SmartHelp under owner authorization. Live send remains NOT_IMPLEMENTED.
version: 0.2.0
compatibility: node>=18; composes whatsapp-agent-orchestrator-super-skill conceptually
---

# guarded-messaging-preview

## When to use
Preview outbound customer messages; guard inbound AI/auto replies on incomplete RFQs.

## When not to use
Claiming production WhatsApp gateway readiness; copying Belt PHP workers or tokens.

## Inputs
Assessment object + optional `waDigits` (host-injected, never commit real production numbers).

## Outputs
```json
{ "status": "PREVIEW_ONLY|NOT_IMPLEMENTED_FOR_SEND", "url": "string|null", "sent": false }
```
Inbound: `{ action, reply, blocked, sent:false, verified:false }`

## Stacks
Node local mocks. Future: Belt gateway / SmartHelp via adapter boundary only.

## Success example
`waDigits=962700000000` → `https://wa.me/...` PREVIEW_ONLY.

## Failure
Missing digits → `WA_DIGITS_REQUIRED`. Adapter `send()` → `NOT_IMPLEMENTED`.

## Security
No credentials in repo. Policy refuses price injection in chat.

## Tests
Acceptance matrix asserts `sent===false` for all sectors.

## Limitations
Deep link ≠ delivered message. Inbound mock is synthetic.

## Provenance
Saqr `orderWhatsAppUrl` preview pattern; Belt/SmartHelp noted as compose targets only.
