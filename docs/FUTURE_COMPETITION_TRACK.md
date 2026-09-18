# Future competition tracks (note only)

Status: **deferred**. Do not implement or migrate competition workflows in this round.

## Intent
Preserve the opportunity to add authorized public-competition labs as **independent** tracks under `tracks/<track-id>/`, using the generic track framework and Policy Gate — not by extending Bug-Bounty.

## Prior work to revisit later
Record that prior work / experience exists around:

- Kaggle-style competitions;
- solved challenge workflows;
- cloned or reproduced environments where rules permit;
- experiment and reproducibility methods.

When we resume, inspect **one strong real example** and extract **Competition DNA** (patterns, gates, evidence, reproducibility) rather than inventing architecture from theory.

## Non-goals now
- No Kaggle integration
- No competition runner
- No scraping of contest data
- No assumption that contest ToS allows cloning — Policy Gate + human confirmation required

## Likely future capability ids (placeholders)
- `kaggle-competition-lab`
- `coding-competition-lab`
- `data-science-challenge-lab`

## Composition with Trust Kernel
Competition tracks would still be non-executing by default, ledger-backed, and adapter-permissioned. Discovery first; side effects only under explicit capability grants.
