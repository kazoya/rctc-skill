'use strict';
const path = require('path');

/**
 * Capability Sandbox v1 — smallest practical enforcement.
 *
 * Technically enforced (best-effort in-process):
 * - write_paths: reject reported/intended writes outside declared prefixes
 * - process_exec / network / git_write / github_write / deploy / secrets:
 *   policy gate before adapter.run if manifest requests them without grant
 *
 * NOT a perfect OS sandbox. Documented limitations in SANDBOX_LIMITATIONS.md
 */

const PERMISSION_KEYS = [
  'read_paths',
  'write_paths',
  'process_exec',
  'network',
  'git_read',
  'git_write',
  'github_write',
  'deploy',
  'secrets',
];

function defaultDeny() {
  return {
    read_paths: [],
    write_paths: [],
    process_exec: false,
    network: false,
    git_read: false,
    git_write: false,
    github_write: false,
    deploy: false,
    secrets: false,
  };
}

function expandPaths(perms, ctx) {
  const out = { ...defaultDeny(), ...perms };
  const expand = (arr) =>
    (arr || []).map((p) =>
      String(p)
        .replace(/\$\{source\}/g, ctx.source || '')
        .replace(/\$\{out\}/g, ctx.outDir || '')
        .replace(/\$\{rctc\}/g, ctx.rctcRoot || '')
    );
  out.read_paths = expand(out.read_paths);
  out.write_paths = expand(out.write_paths);
  return out;
}

function isUnder(file, roots) {
  const f = path.resolve(file);
  return (roots || []).some((r) => {
    const root = path.resolve(r);
    return f === root || f.startsWith(root + path.sep);
  });
}

/**
 * Check manifest-declared permissions against what the stage requires.
 * Undeclared dangerous capability → STOP.
 */
function authorizeManifest(manifest, stage, ctx) {
  const declared = expandPaths(manifest.permissions || {}, ctx);
  const needs = stageNeeds(stage);
  const violations = [];

  for (const key of Object.keys(needs)) {
    if (needs[key] === true && declared[key] !== true) {
      violations.push({ key, message: 'Stage requires ' + key + ' but manifest denies/undeclared' });
    }
  }
  // Adapter must not claim deploy/secrets/git_write without owner gate context
  if (declared.deploy && !(ctx.ownerApprovePublish)) {
    violations.push({ key: 'deploy', message: 'deploy requires owner gate' });
  }
  if (declared.github_write && !(ctx.ownerApprovePublish)) {
    violations.push({ key: 'github_write', message: 'github_write requires owner gate' });
  }
  if (declared.secrets) {
    violations.push({ key: 'secrets', message: 'secrets capability denied in v1 engine' });
  }

  if (violations.length) {
    return { ok: false, status: 'STOP', action: 'STOP', reason: 'undeclared_or_forbidden_capability', violations, declared };
  }
  return { ok: true, declared, enforced: ['write_paths_postcheck', 'boolean_capability_gates'], policy_only: ['read_paths', 'network_actual_sockets'] };
}

function stageNeeds(stage) {
  switch (stage) {
    case 'inspect':
    case 'discover':
      return { process_exec: false, network: false, git_write: false, deploy: false };
    case 'build':
      return { process_exec: false, network: false, git_write: false, deploy: false };
    case 'verify':
      return {}; // may allow process_exec if manifest declares it
    case 'package':
      return { network: false, git_write: false, deploy: false };
    case 'publish':
      return {};
    default:
      return {};
  }
}

/** Post-run: every changed file must be under write_paths */
function enforceWrites(declared, filesChanged) {
  const bad = [];
  for (const f of filesChanged || []) {
    if (!isUnder(f, declared.write_paths) && !isUnder(f, declared.write_paths.map((p) => path.dirname(p)))) {
      // also allow exact file write_paths
      if (!isUnder(f, declared.write_paths)) bad.push(f);
    }
  }
  // refine: check each file against write_paths prefixes OR exact files
  const reallyBad = (filesChanged || []).filter((f) => {
    const resolved = path.resolve(f);
    return !(declared.write_paths || []).some((w) => {
      const ww = path.resolve(w);
      return resolved === ww || resolved.startsWith(ww + path.sep);
    });
  });
  if (reallyBad.length) {
    return { ok: false, status: 'STOP', action: 'STOP', reason: 'write_outside_declared_paths', files: reallyBad };
  }
  return { ok: true };
}

module.exports = {
  PERMISSION_KEYS,
  defaultDeny,
  expandPaths,
  authorizeManifest,
  enforceWrites,
  isUnder,
};
