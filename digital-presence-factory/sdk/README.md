# Adapter SDK (Trust Kernel)

Add support for a skill **without editing `lib/engine.js`**.

## Steps
1. Copy `sdk/template/` to `adapters/<your-adapter>.js` + `contracts/adapters/<id>.manifest.json`
2. Fill permissions (default deny)
3. Set `match.recipe_ids` and optional `require_markers` (never hardcode customer folder names in the engine)
4. Run `node digital-presence-factory/scripts/validate-adapter-manifests.js`
5. Add a test under `tests/`
6. Register nothing new in canonical registry unless it is a new **capability** (not a copy)

## Rules
- Exact `canonical_capability_id` must exist in `registry/canonical.json`
- Undeclared capability → STOP
- Writes outside `write_paths` → STOP
