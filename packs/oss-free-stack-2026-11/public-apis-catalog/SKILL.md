---
name: public-apis-catalog
description: Find free public HTTP APIs from the community catalog for weather, finance, images, and other categories. Use when the user wants a free data source instead of a paid API, or asks for public-apis GitHub list. Do not call paid endpoints.
metadata:
  short-description: Pick free public APIs
---

# Public APIs Catalog

Upstream: [public-apis/public-apis](https://github.com/public-apis/public-apis)

## When to use

- Need a free weather, maps-adjacent, finance, image, or misc HTTP API.
- Comparing cost before approving a paid provider.
- Seeding `new_tech` RESEARCH or Maps SaaS research with free data options.

## Workflow

1. Open the catalog README category that matches the need.
2. Record for each candidate: auth type (none / key / OAuth), HTTPS, CORS, rate limit notes, and whether commercial use is allowed.
3. Prefer **No Auth** or free-key APIs that stay inside the current budget gate.
4. Prove one live call (status + sample fields) before claiming the API works — use `evidence-before-claim`.
5. Do not store secrets in the repo; put keys only in local env after owner approval.

## Constraints

- No paid API call without explicit approval.
- Catalog entries go stale — re-check the linked docs the same day.
- For image/video generation, prefer the media skills (`image`, `video`) over random public APIs.
