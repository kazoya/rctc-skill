---
name: belt-gateway-php
description: >
  WhatsApp SMS gateway PHP worker — FIFO queue, MariaDB, booking conversation, BeltKnowledgeClient.
  Use for flutter_sms_gateway backend PHP, Worker.php, WebhookService, smoke tests.
paths:
  - "flutter_sms_gateway/**"
  - "**/flutter_sms_gateway/**"
  - "**/backend/src/**"
  - "**/backend/tests/**"
---

# Belt Gateway (PHP)

## Run / test

- PHP with **mbstring** (e.g. XAMPP): `php backend/tests/unit.php`
- Worker: `backend/bin/worker.php` (see PROJECT_OVERVIEW_AR.md)
- Env: `backend/.env` from `.env.example` — never commit secrets.

## Critical path

Inbound → Worker FIFO → `BookingConversationService` → `HumanHandoffService` → `ProjectBrainService` / `BeltConversationService` → `BeltKnowledgeClient` → outbound queue.

Operator inbox: `backend/bin/handoff-inbox.php`

## Claims discipline

Use `/bitter-truth-delivery-audit` before stating "handoff ready" or "production ready."

## Portfolio

`lifecycle=dormant` on backup paths; do not develop duplicate AIPRO copies without user approval.
