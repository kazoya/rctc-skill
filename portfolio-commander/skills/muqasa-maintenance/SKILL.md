---
name: muqasa-maintenance
description: >
  Muqasa P4 — site up, critical fixes, backups only. No new auction/marketplace features
  without paying client. Use for C:\muqasa maintenance and hotfixes.
paths:
  - "**/muqasa/**"
  - "**/Muqasa/**"
---

# Muqasa maintenance (P4)

- **Allowed:** uptime, critical bugfix, domain/backup hygiene.
- **Not allowed:** new marketplace features, major refactors, ERP-scale rewrites.
- Canonical path: `C:\muqasa` — `muqasa-jo` is backup (`role=backup` in portfolio overrides).

Use `/bitter-truth-delivery-audit` if stakeholder asks "is Muqasa ready to scale?"
