---
name: twelve-factor-config
description: "Keep configuration in the environment, with a committed example file and no production secrets in the repo. Use when adding settings, feature flags, or a new deployment target."
---

# twelve-factor-config

1. Code reads configuration from the environment.
2. Commit `.env.example` with empty or dummy values and one-line comments.
3. Gitignore real `.env` files.
4. Fail fast at startup when a required variable is missing. Do not fall back to a production secret.
5. Separate public config (`NEXT_PUBLIC_` / client bundles) from server secrets. Anything in the client bundle is public.

Pair secret storage with `owner-credential-vault`.
