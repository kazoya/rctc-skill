---
name: whatsapp-agent-orchestrator-super-skill
description: >
  Build or extend a governed conversational AI operations layer where WhatsApp, Telegram, web chat,
  or another channel can invoke an AI orchestrator that selects approved tools such as email,
  calendar, GitHub, CRM, documents, databases, and n8n workflows. Use when the user asks for a
  WhatsApp AI agent, n8n AI workflow, tool-calling assistant, multi-agent operations hub, or a
  conversational command center. Pair with safe-forward-execution and focused3-agentic-phases.
---

# WhatsApp Agent Orchestrator — Super Skill

> **From “send a WhatsApp message to an AI” to a governed operations bus that can understand,
> route, execute, verify, and report work across approved tools.**

This skill generalizes an observed workflow pattern: a messaging trigger enters an automation
orchestrator, an AI agent interprets the request, selects an approved tool (for example Gmail or
Google Calendar), executes through a connector/workflow, and returns a result to the conversation.

It is intentionally implementation-neutral: n8n is an excellent visual orchestrator, but the same
contract can be implemented with Node.js, Python, MCP, serverless functions, queues, or a hybrid.

## Core architecture

```text
WhatsApp / Telegram / Web / Dashboard
                 |
          Channel Gateway
                 |
       Normalize + Authenticate
                 |
        Intent / Risk Router
                 |
        Master Orchestrator
          /      |       \
     specialist tools / agents
       /         |          \
   Email      Calendar     GitHub/CRM/Docs/DB
       \         |          /
        Policy + Approval Gate
                 |
         Execution Adapter
        (n8n / MCP / APIs)
                 |
       Verify + Audit Ledger
                 |
          Channel Response
```

## Operating contract

Before executing a request, derive:

1. **Actor** — who sent the command and what identity/tenant do they belong to?
2. **Intent** — what observable outcome is requested?
3. **Tool** — which approved capability can achieve it?
4. **Risk class** — READ, DRAFT, EXECUTE, or DESTRUCTIVE.
5. **Approval rule** — automatic, policy-approved, or human confirmation.
6. **Evidence** — what provider-confirmed result proves completion?
7. **Audit record** — what minimum metadata is retained without leaking secrets?

### Risk classes

| Class | Examples | Default |
|---|---|---|
| READ | search mail, read calendar, inspect issue | allowed if identity and scope permit |
| DRAFT | draft email, prepare event, propose issue update | allowed; no external side effect |
| EXECUTE | send email, create event, post approved update | require explicit policy or confirmation |
| DESTRUCTIVE | delete, cancel, overwrite, revoke, financial/production action | human confirmation and narrow scope |

Never treat “the AI understood me” as authorization. Tool permissions and user intent are separate.

## Build protocol

### 1. Inspect before choosing infrastructure

Detect existing stack, channel provider, n8n availability, database, auth, queues, connectors,
deployment target, and current skills. Reuse existing components when they are healthy.

### 2. Define a canonical command envelope

Every channel should normalize into a transport-independent object:

```json
{
  "request_id": "uuid",
  "channel": "whatsapp",
  "actor_id": "internal-user-id",
  "tenant_id": "optional",
  "message": "Schedule a meeting tomorrow at 10",
  "attachments": [],
  "locale": "ar-JO",
  "received_at": "ISO-8601"
}
```

Do not pass raw provider payloads deep into agent logic.

### 3. Separate reasoning from execution

The model may propose a tool call, but an execution layer must validate:
- tool is allow-listed;
- parameters match schema;
- actor has permission;
- target and scope are explicit;
- approval policy is satisfied;
- idempotency key exists for side-effecting actions;
- secrets stay server-side.

### 4. Prefer specialist tools over “one omnipotent agent”

Use a master router plus bounded adapters or specialists:
- mail;
- calendar;
- GitHub;
- CRM;
- documents;
- research;
- database/reporting;
- project-control / Master Brain.

A specialist is a capability boundary, not an excuse to multiply LLM calls. A deterministic API
adapter is better when no reasoning is needed.

### 5. Use n8n as an orchestration option

A typical n8n path is:

```text
WhatsApp Trigger
→ normalize message
→ authenticate / resolve actor
→ AI Agent or intent classifier
→ policy gate
→ Gmail / Calendar / HTTP / sub-workflow tool
→ provider result check
→ audit
→ WhatsApp response
```

Keep credentials in n8n credential storage or a secrets manager, never in prompts or workflow
exports committed to Git.

### 6. Add human approval without killing usability

Approval should be contextual. Example:

```text
User: "Email Yaser the project update."
Agent: prepares subject + recipients + body
Policy: SEND_EMAIL requires confirmation
Agent: "Ready to send to X with subject Y. Send?"
User: "yes"
Executor: sends once using request/idempotency key
Agent: reports provider-confirmed message ID
```

Trusted organizations may configure narrow auto-execution policies, e.g. create internal calendar
events for the authenticated owner, but policy must be explicit and revocable.

### 7. Verify at provider level

Do not say “sent”, “created”, or “updated” from model output alone. Require connector/provider
confirmation. Store a redacted receipt: request ID, tool, status, provider object ID, timestamps,
approval source, and error class.

### 8. Make failures resumable

Use:
- idempotency keys;
- bounded retries;
- dead-letter / failed-job state;
- clear user-facing failure messages;
- no duplicate sends after timeouts;
- replay from normalized request, not from free-form hallucinated state.

## Multi-agent mode

Use multiple agents only where separation adds value:

```text
Master Router
├── Communication Agent → Gmail / Outlook / WhatsApp templates
├── Scheduling Agent    → Calendar / availability
├── Engineering Agent   → GitHub / CI / project status
├── Knowledge Agent     → docs / RAG / search
└── Operations Agent    → CRM / approved workflows
```

All agents share the same policy gateway and audit model. No specialist gets unrestricted credentials.

## Security baseline

- Verify inbound webhook signatures where supported.
- Map phone/channel identity to an internal actor; do not trust display names.
- Apply tenant isolation and least privilege.
- Encrypt sensitive stored data and minimize retention.
- Redact secrets and unnecessary message content from logs.
- Protect against prompt injection in emails, documents, webpages, and tool outputs.
- Never allow retrieved content to redefine system policy or grant permissions.
- Rate-limit and detect replay.
- Use sandbox/test accounts before production.
- Require human review for money, legal commitments, credential/security changes, bulk messaging,
  production destructive actions, or other high-impact operations.

## Acceptance tests

A production candidate should prove at minimum:

1. authorized READ succeeds and unauthorized READ is rejected;
2. DRAFT creates no external side effect;
3. EXECUTE cannot bypass required approval;
4. duplicate webhook/request does not duplicate the external action;
5. provider failure is reported honestly and can be retried safely;
6. malicious content inside an email/document cannot grant itself tool permission;
7. secrets never appear in prompts, logs, Git history, or channel replies;
8. Arabic and English commands normalize to the same typed intent where applicable;
9. audit receipt links request → approval → tool call → provider result;
10. disabling a tool/policy immediately prevents future execution.

## RCTC ecosystem combinations

### Personal / executive operations
```text
RCTC → WhatsApp Agent Orchestrator
     → Safe Forward Execution
     → Focused3 proof gates
```

### Multi-project command center
```text
WhatsApp Agent Orchestrator
→ Start Skill → Portfolio Commander → Master Brain
→ "What is blocked?" / "continue project X" / "prepare status report"
```

### Company or factory
```text
WhatsApp Agent Orchestrator
→ Factory Sales Concept / CRM / ERP adapters
→ human-approved quotations, follow-ups, alerts, reports
```

### Software delivery
```text
WhatsApp Agent Orchestrator
→ GitHub + CI + Master Brain
→ read status / draft issue / request approved workflow / report evidence
```

## Project opportunities

This skill can serve as a reusable control plane for:
- Maqasa: auction/asset alerts, admin summaries, approved investor or bank workflows;
- Risha360: offer notifications, creator follow-up, monthly reminders, approved communication;
- Factory AI OS: maintenance/quality alerts, shift summaries, work-order routing, human-approved actions;
- project-control platforms: mobile conversational access to project brains, blockers, reports and jobs;
- support/call-center prototypes: triage, retrieval, drafting and bounded escalation.

These are integration patterns, not claims that those projects already implement them.

## Non-goals

This skill does not:
- bypass WhatsApp/Meta/provider policies;
- automate spam or unsolicited bulk messaging;
- bypass OTP, CAPTCHA, MFA, permissions, or account controls;
- grant an LLM unrestricted access to accounts;
- claim autonomous completion without provider evidence.

## Definition of done

```text
DONE =
  CHANNEL VERIFIED
× IDENTITY VERIFIED
× POLICY ENFORCED
× TOOL RESULT CONFIRMED
× AUDIT RECORDED
× USER RECEIVES TRUE STATUS
```

Pair with `../safe-forward-execution/` so implementation continues beyond planning while preserving
authorization boundaries, and `../focused3-agentic-phases/` when stronger evidence gates are needed.
