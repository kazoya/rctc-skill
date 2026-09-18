'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Exact registry resolution — never fuzzy-execute.
 * Unknown id => { ok:false, status:'GAP', action:'STOP' }
 */

function loadRegistry(registryPath) {
  const raw = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.skills || raw.items || [];
  const byId = new Map();
  for (const item of list) {
    if (typeof item === 'string') {
      byId.set(item, { id: item });
    } else if (item && (item.id || item.name || item.slug)) {
      const id = item.id || item.name || item.slug;
      byId.set(id, { ...item, id });
    }
  }
  return { byId, list, path: registryPath };
}

function resolveExact(registry, skillId) {
  if (!skillId || typeof skillId !== 'string') {
    return {
      ok: false,
      status: 'GAP',
      action: 'STOP',
      skillId,
      reason: 'missing_skill_id',
    };
  }
  if (registry.byId.has(skillId)) {
    return {
      ok: true,
      status: 'RESOLVED',
      action: 'EXECUTE_ALLOWED_IF_STAGE_PERMITS',
      skillId,
      entry: registry.byId.get(skillId),
    };
  }
  // Collect near-misses for human review ONLY — never auto-pick
  const near = [];
  const needle = skillId.toLowerCase();
  for (const id of registry.byId.keys()) {
    const a = id.toLowerCase();
    if (a.includes(needle.slice(0, 8)) || needle.includes(a.slice(0, 8))) {
      near.push(id);
    }
  }
  return {
    ok: false,
    status: 'GAP',
    action: 'STOP',
    skillId,
    reason: 'unknown_skill_id',
    near_misses_for_human_review_only: near.slice(0, 8),
    message:
      'Unknown skill "' +
      skillId +
      '". STOP/GAP — do not guess. Normalize recipe compose ids against registry/skills.json.',
  };
}

function resolveComposeList(registry, composeIds) {
  const results = [];
  let allOk = true;
  for (const id of composeIds || []) {
    const r = resolveExact(registry, id);
    results.push(r);
    if (!r.ok) allOk = false;
  }
  return {
    ok: allOk,
    action: allOk ? 'PROCEED' : 'STOP',
    status: allOk ? 'READY' : 'GAP',
    results,
  };
}

function findRegistryPath(rctcRoot) {
  return path.join(rctcRoot, 'registry', 'skills.json');
}

module.exports = {
  loadRegistry,
  resolveExact,
  resolveComposeList,
  findRegistryPath,
};
