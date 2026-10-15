# Install RCTC skills

One catalog, one canonical path per skill: [CATALOG.md](CATALOG.md). Host copies under `.cursor/skills/` are generated — do not edit them as a second source.

## One command (starter pack)

From this repository:

```bash
node scripts/install-starter.js --host cursor --target .
```

Claude Code:

```bash
node scripts/install-starter.js --host claude --target .
```

Codex:

```bash
node scripts/install-starter.js --host codex --target .
```

Preview without writing:

```bash
node scripts/install-starter.js --dry-run
```

The starter list is [STARTER.json](STARTER.json): `rctc-method`, `htpaap`, `focused3-agentic-phases`, `safe-forward-execution`, `evidence-before-claim`, `digital-presence-factory`.

## What the installer copies

| Slug | Source | Why the whole folder |
|---|---|---|
| `rctc-method` | root `SKILL.md` | single file → `<host>/rctc-method/SKILL.md` |
| `focused3-agentic-phases` | `focused3-agentic-phases/` | siblings listed in the skill (`AGENT_ROLES.md`, templates, …) |
| others in STARTER | their catalog folders | same — avoid a 4-of-15 vendoring hole |

## Packaging rules (issue #3)

1. **One source** — edit the path in [CATALOG.md](CATALOG.md) only.
2. **Aliases** — a second `SKILL.md` must be a short pointer with `canonical: <path>` in frontmatter (see `docs/SKILL.md`).
3. **No draft factory output** — `skill-factory/out/` is gitignored and must stay untracked.
4. **CI** — `npm run validate:repo` rejects merge-conflict markers and byte-identical skill bodies.
5. **New skills** — prefer `<slug>/SKILL.md` at a stable depth; register the path in the catalog/registry before merge.

Full layout migration to `skills/<slug>/SKILL.md` for every historical folder is tracked separately; the catalog + installer make the tree machine-consumable today without a big-bang move.

## 60-second proof

After install, follow [docs/QUICKSTART_60S.md](../docs/QUICKSTART_60S.md).
