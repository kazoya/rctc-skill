# Offline graph plan

Graphify was not installed. Apache-2.0 snapshot `91f4d120` was recorded and left disabled.

The stand-in is [fixtures/graph-edges.json](../fixtures/graph-edges.json). `npm run test:dogfood-router` opens each `from` file and checks that the expected string is present, and that the `to` path exists. Five edges:

| From | To | What the check is |
|---|---|---|
| `SKILL.md` | `chatgpt-bridge-lane/SKILL.md` | companion name is in the table |
| `packages/catalog.json` | `ecc-harness/SKILL.md` | catalog path string |
| `ecc-harness/SKILL.md` | `ecc-harness/NEED-MAP.md` | relative link target exists |
| `skills/CATALOG.md` | `SKILL.md` | `rctc-method` points at the root skill |
| `package.json` | `scripts/validate-repo.js` | npm script path exists |

A future Graphify run may add edges. Those edges stay leads until the same file check passes. Do not index `.env`, credentials, or `node_modules`.
