# Evidence Register

Every material claim in a report must link to evidence entries.

## Status (required per evidence item)

| Status | Meaning |
|--------|---------|
| `VERIFIED` | User-provided artifact, repo file, or locally checked fact |
| `INFERRED` | Logical inference from stated architecture; label assumptions |
| `UNKNOWN` | Not provided; do not invent numbers or vendor capabilities |

## Rules

- **No bluff:** `UNKNOWN` must not become a default score or cost. Use `null` in JSON for unknown numerics.
- Vendor product features require `VERIFIED` or cite `UNKNOWN` and `DEFER`.
- Separate **Recommendation** (analysis) from **Authorized Action** (human-approved execution).

## Evidence object (machine-readable)

```json
{
  "id": "ev-001",
  "status": "VERIFIED",
  "statement": "Vector store is vendor-managed with no export API documented by user",
  "source": "user intake",
  "layer": "data_knowledge"
}
```
