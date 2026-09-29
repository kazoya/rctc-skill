# Architecture

## Control plane

```text
[Channel Provider]
      |
      v
[Webhook Gateway] -- signature/replay checks
      |
      v
[Normalizer] -- canonical request envelope
      |
      v
[Identity Resolver] -- channel identity -> actor/tenant
      |
      v
[Intent Router / LLM]
      |
      v
[Policy Engine] ----> [Human Approval]
      |
      v
[Tool Registry]
 |     |      |       |
Mail Calendar GitHub CRM/Docs/DB
      |
      v
[Execution Adapter: n8n/MCP/API]
      |
      v
[Provider Verification]
      |
      +----> [Audit Ledger]
      |
      v
[Response Renderer] -> channel
```

## Recommended boundaries

**Channel gateway:** provider-specific webhooks only. No business reasoning.

**Normalizer:** converts every channel to the same typed envelope.

**Router:** maps language to intent/tool proposal. It cannot authorize itself.

**Policy engine:** deterministic authorization and approval rules.

**Tool registry:** explicit schemas and least-privilege credentials.

**Executor:** idempotency, timeouts, retries and provider calls.

**Verifier:** interprets provider response and confirms the claim level.

**Audit:** redacted trace of request, approval, execution and result.

## Deployment modes

### n8n-first
Fastest for prototypes and business workflows. Keep custom policy/identity logic in Code nodes or a
small service if visual workflows become hard to audit.

### application-first
Node.js/Python service owns identity, policy, audit and tool schemas; n8n handles selected business
sub-workflows.

### MCP-first
Useful for engineering/project-control environments. MCP tools expose bounded capabilities while the
channel service handles identity and approvals.

## Data model sketch

- actors(id, tenant_id, channel_identity, role, status)
- requests(id, actor_id, channel, intent, risk, status, created_at)
- approvals(id, request_id, approver_id, decision, expires_at)
- tool_calls(id, request_id, tool, idempotency_key, status, provider_id)
- audit_events(id, request_id, event_type, redacted_payload, created_at)
- policies(id, tenant_id, action, rule, enabled)

Do not store OAuth tokens or API secrets in these tables as plain application data.
