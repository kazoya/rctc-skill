# Annotated report sample (local lab only)

**Environment:** `examples/lab/mock-api-access.json` (synthetic)  
**Not** a claim against any real company.

## Title
Local lab: IDOR-style access-control assumption on mock order API

## Summary
In the local mock API fixture, order `1001` owned by `user-a` is returned when requested with `user-b`’s token claim in the fixture. This demonstrates a broken access-control **assumption** in the lab model.

## Asset
`http://127.0.0.1:8765/mock/orders/1001` (lab)

## Scope confirmation
Local lab owned by the learner — `USE_LOCAL_LAB`.

## Steps (lab)
1. Load `mock-api-access.json`
2. Compare response for `user-a` vs `user-b` on order `1001`
3. Record that `user-b` receives `user-a` order fields in the fixture

## Evidence
Redacted fixture excerpts only (no real tokens).

## Impact (lab-demonstrated)
In this lab model, a user can read another user’s order object. **Do not** extrapolate to production without authorized testing.

## Mentor annotations
- **Good:** Labels environment as lab; separates observation from real-world claim
- **Weak (avoid):** “Critical RCE on Arab Bank” — unsupported, out of scope, dishonest
