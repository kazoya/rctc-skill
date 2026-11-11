---
name: free-for-dev-picker
description: Pick lasting free-tier developer services from free-for-dev instead of paid trials. Use when choosing hosting, CI, email, databases, or SaaS with a permanent free plan, or when the user wants to avoid subscription cost.
metadata:
  short-description: Find lasting free SaaS tiers
---

# Free-for-dev Picker

Upstream: [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev)

## When to use

- Budget gate: prefer free / low-cost for portfolio projects.
- Replacing a paid trial that will expire.
- Comparing Vercel/Netlify/email/DB free tiers honestly.

## Workflow

1. Name the capability (static host, Postgres, transactional email, monitoring).
2. Open the matching section in free-for-dev.
3. For each candidate record: free quota, card required?, commercial OK?, catch (sleep, branding, rate).
4. Prefer permanent free plans over 14-day trials.
5. Cross-check with live vendor pricing the same day — lists drift.
6. Pair with `ai-portability-advisor` when lock-in risk matters.

## Constraints

- Do not sign up or spend money without owner approval.
- ExperTech public demos stay browser-only for durable state unless redesigned.
- Media generation free tiers still need a RESEARCH.md score entry before “keep”.
