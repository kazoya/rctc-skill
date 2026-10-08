---
name: observability-starter
description: "Add request-scoped logs with a correlation id and one health/readiness distinction. Use when a service fails in production and logs are unstructured or secrets leak into them."
---

# observability-starter

1. One logger, structured fields: timestamp, level, message, request id, route.
2. Generate a request id at the edge and pass it through outbound calls.
3. `/health` means the process is up. `/ready` means dependencies needed for traffic are up.
4. Never log authorization headers, cookies, passwords, or full payment payloads.
5. On an error path, log the exception type and request id; return the safe API error from `api-error-contracts`.
