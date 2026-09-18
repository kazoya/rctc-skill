'use strict';
const fs = require('fs');
const path = require('path');

function loadAdapterManifests(dpfRoot) {
  const dir = path.join(dpfRoot, 'contracts', 'adapters');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.manifest.json'))
    .map((f) => {
      const full = path.join(dir, f);
      const m = JSON.parse(fs.readFileSync(full, 'utf8'));
      m.__manifest_path = full;
      return m;
    });
}

function markersPresent(source, markers) {
  if (!markers || !markers.length) return true;
  return markers.every((m) => fs.existsSync(path.join(source, m)));
}

/**
 * Declarative adapter selection — no project-name hardcoding in engine.
 * 0 matches → GAP; >1 matches → STOP ambiguity.
 */
function selectAdapterManifest(manifests, { stage, recipeId, source }) {
  const matched = manifests.filter((m) => {
    if (!(m.stages || []).includes(stage)) return false;
    const match = m.match || {};
    if (match.recipe_ids && match.recipe_ids.length && !match.recipe_ids.includes(recipeId)) {
      return false;
    }
    if (match.require_markers && !markersPresent(source, match.require_markers)) {
      return false;
    }
    if (match.forbid_markers && match.forbid_markers.some((x) => fs.existsSync(path.join(source, x)))) {
      return false;
    }
    return true;
  });
  if (matched.length === 0) {
    return { ok: false, status: 'GAP', action: 'STOP', reason: 'no_adapter_manifest', stage, recipeId };
  }
  if (matched.length > 1) {
    return {
      ok: false,
      status: 'GAP',
      action: 'STOP',
      reason: 'ambiguous_adapter_manifests',
      matches: matched.map((m) => m.adapter_id),
      message: 'Multiple adapter manifests matched — resolve ambiguity before execute',
    };
  }
  return { ok: true, manifest: matched[0] };
}

function loadAdapterModule(dpfRoot, manifest) {
  const modPath = path.resolve(dpfRoot, manifest.module);
  if (!fs.existsSync(modPath)) {
    return { ok: false, status: 'GAP', action: 'STOP', reason: 'adapter_module_missing', modPath };
  }
  // Clear cache for fresh loads in tests
  delete require.cache[require.resolve(modPath)];
  const mod = require(modPath);
  return { ok: true, module: mod, modPath };
}

module.exports = { loadAdapterManifests, selectAdapterManifest, loadAdapterModule, markersPresent };
