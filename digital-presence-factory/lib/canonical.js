'use strict';
const fs = require('fs');
const path = require('path');

function loadCanonical(rctcRoot) {
  const p = path.join(rctcRoot, 'registry', 'canonical.json');
  if (!fs.existsSync(p)) {
    throw new Error('Missing registry/canonical.json — run scripts/build-canonical-registry.js');
  }
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const byId = new Map();
  for (const c of data.capabilities || []) {
    if (byId.has(c.canonical_id)) {
      throw new Error('Ambiguous canonical registry: duplicate canonical_id ' + c.canonical_id);
    }
    byId.set(c.canonical_id, c);
  }
  return { data, byId, path: p };
}

/** Resolve recipe compose id → exactly one canonical capability. Else STOP/GAP. */
function resolveCanonical(canonical, skillId) {
  if (!skillId) {
    return { ok: false, status: 'GAP', action: 'STOP', reason: 'missing_id' };
  }
  if (!canonical.byId.has(skillId)) {
    return {
      ok: false,
      status: 'GAP',
      action: 'STOP',
      skillId,
      reason: 'unknown_canonical_id',
      message: 'Not a canonical capability id. Ambiguity or typo → STOP/GAP.',
    };
  }
  const cap = canonical.byId.get(skillId);
  return {
    ok: true,
    status: 'RESOLVED',
    canonical_id: cap.canonical_id,
    primary_installation_id: cap.primary_installation_id,
    installation_count: cap.installation_count,
    executable_default: cap.executable_default,
    capability: cap,
  };
}

function resolveComposeCanonical(canonical, composeIds) {
  const results = (composeIds || []).map((id) => resolveCanonical(canonical, id));
  const ok = results.every((r) => r.ok);
  return { ok, action: ok ? 'PROCEED' : 'STOP', status: ok ? 'READY' : 'GAP', results };
}

module.exports = { loadCanonical, resolveCanonical, resolveComposeCanonical };
