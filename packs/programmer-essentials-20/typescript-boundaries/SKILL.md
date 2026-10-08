---
name: typescript-boundaries
description: "Keep TypeScript boundaries strict: validate input at the edge, use narrow types inside, avoid any and unchecked casts. Use when adding API handlers, parsing JSON, or reviewing TS errors."
---

# typescript-boundaries

1. Untrusted input (HTTP, env, JSON files) is `unknown` until a parser accepts it (zod, valibot, or a hand-written guard).
2. Do not use `any`. A cast needs a one-line comment naming the invariant.
3. Export types from the module that owns the data, not from a dump of `types.ts` that imports everything.
4. `strict` stays on. Do not fix a build by skipping `tsc`.
5. Public functions return a result or throw a typed error the caller can handle; do not return `null` for three different failures.
