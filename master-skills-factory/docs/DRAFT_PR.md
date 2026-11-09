# Draft Pull Request (not opened)

**Branch:** `feat/pozzolan-master-skills-factory`  
**Base:** `master`  
**Remote action:** blocked until owner authorizes push + draft PR

## Title
feat: Portland–Pozzolanic master-skills-factory (Phase 1–2)

## Summary
- Portable sector trade-desk skills extracted from Saqr patterns (synthetic catalogs only).
- Phase 2: minor-unit money, tenant/idempotency, sector JSON config switch, 6-sector acceptance matrix, skill manifests, capability gap map.
- WhatsApp labeled PREVIEW_ONLY / send NOT_IMPLEMENTED.
- Clinic/pharmacy administrative-only with clinical content rejection.

## Test plan
- [x] `cd master-skills-factory && npm test` (27/27)
- [x] `npm run validate:skills`
- [x] `npm run scan:secrets`
- [x] `npm run evidence`
- [ ] Owner secret/IP review before push
- [ ] `git push -u origin feat/pozzolan-master-skills-factory` (owner auth)
- [ ] `gh pr create --draft ...` (owner auth)

## Security notes
- No live WhatsApp digits from Saqr.
- No customer price books.
- Local JSON store explicitly not production-ready.
