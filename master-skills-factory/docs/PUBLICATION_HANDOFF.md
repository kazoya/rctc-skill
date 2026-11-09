# Publication Handoff — Master Skills Factory

## Prepared (local)

- Working package: `master-skills-factory/`
- Skills: parent + 4 children
- Tests + cross-industry demo
- Evidence + source trace
- Git branch on `C:\rctc-skill`: `feat/pozzolan-master-skills-factory`

## Owner gates (do not bypass)

1. Review diff — confirm no secrets / Saqr private catalogs.  
2. `node skill-factory/scripts/sf.js validate` (if wired for this folder).  
3. Commit on feature branch (explicit owner ask).  
4. Push + PR (explicit owner ask).  
5. `skill-factory` **publish** mode only after PR approval.

## Suggested PR title

`feat: Portland–Pozzolanic master-skills-factory trade desk pack`

## Suggested PR body

```markdown
## Summary
- Extract portable trade-desk workflow skills from Saqr patterns (synthetic catalogs only).
- Six-industry demo + tests; WhatsApp labeled PREVIEW_ONLY / NOT_IMPLEMENTED for send.

## Test plan
- [ ] `cd master-skills-factory && npm test`
- [ ] `npm run evidence`
- [ ] Confirm no live phone digits or customer prices in tree
```

## Not done

Push ❌ · Merge ❌ · Deploy ❌ · Live message ❌
