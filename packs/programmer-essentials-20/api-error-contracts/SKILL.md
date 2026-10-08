---
name: api-error-contracts
description: "Design HTTP or RPC errors as a stable contract: status, machine code, and a safe message. Use when adding endpoints, fixing client error handling, or stopping leaked stack traces."
---

# api-error-contracts

Every error response the client branches on needs:

- HTTP status (or RPC code) chosen from the project's existing set.
- A stable machine `code` string.
- A human message that does not include secrets, SQL, or file paths.
- One log line on the server with a request id.

Document the codes next to the route. Add a test that asserts status + `code` for the main failure (validation, not found, conflict, unauthorized).
