---
name: lawful-web-research-fetch
description: Plan lawful public-page research fetches for Maps SaaS and media R&D. Mentions Scrapling only as an open-source candidate to evaluate after approval. Use for public business pages, docs, and pricing pages. Never for CAPTCHA/Cloudflare bypass, login walls, or unauthorized scraping.
metadata:
  short-description: Lawful public-page research only
---

# Lawful Web Research Fetch

Upstream candidate (evaluate, do not auto-install): [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)

## When to use

- Qualifying Google Maps businesses that have weak or missing websites (JO/SA).
- Capturing public pricing or docs pages for RESEARCH.md.
- Choosing a fetch library after owner approval.

## Workflow

1. Confirm the URL is **public** (no login, no paywall bypass).
2. Check robots.txt / site terms at a high level; stop if the site forbids automated access.
3. Prefer official APIs (`public-apis-catalog`) or manual browser review (`logged-in-browser` when the user is already signed in) over scraping.
4. If a library is needed, propose Scrapling **or** a simpler HTTP client as candidates; install only after explicit approval.
5. Save evidence: URL, date, fields captured, and that access was public.

## Hard no

- Do not provide Cloudflare, CAPTCHA, WAF, or anti-bot bypass steps.
- Do not scrape personal data for person-search products.
- Do not attack or load-test third-party sites.

## Portfolio note

Maps SaaS delivery stays separate from `new_tech` media benches. Scraped marketing copy still needs the `copywriting` skill before client pages.
