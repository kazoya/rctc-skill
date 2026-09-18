'use strict';

/** Stage permissions for the execution engine */
const STAGES = {
  plan: {
    id: 'plan',
    side_effects: 'none',
    writes: false,
    owner_gate: false,
    description: 'Deterministic composition plan only',
  },
  discover: {
    id: 'discover',
    side_effects: 'none',
    writes: false,
    owner_gate: false,
    description: 'Collect evidence paths/URLs',
  },
  inspect: {
    id: 'inspect',
    side_effects: 'read-only',
    writes: false,
    owner_gate: false,
    description: 'Read local/public evidence; no mutation',
  },
  reason: {
    id: 'reason',
    side_effects: 'none',
    writes: false,
    owner_gate: false,
    description: 'Select recipe + gates',
  },
  design: {
    id: 'design',
    side_effects: 'none',
    writes: false,
    owner_gate: false,
    description: 'IA / honesty labels (in-memory / ledger only)',
  },
  build: {
    id: 'build',
    side_effects: 'reversible-local-writes',
    writes: true,
    owner_gate: false,
    description: 'Local reversible writes in target folder only',
  },
  verify: {
    id: 'verify',
    side_effects: 'tests-only',
    writes: false,
    owner_gate: false,
    description: 'Tests/checks only',
  },
  package: {
    id: 'package',
    side_effects: 'local-artifact',
    writes: true,
    owner_gate: false,
    description: 'Local artifact generation (zip/ledger)',
  },
  publish: {
    id: 'publish',
    side_effects: 'external-irreversible',
    writes: true,
    owner_gate: true,
    description: 'OWNER GATE — push/deploy/public release',
  },
};

const STAGE_ORDER = [
  'discover',
  'inspect',
  'reason',
  'design',
  'build',
  'verify',
  'package',
  'publish',
];

function getStage(name) {
  const key = String(name || '').toLowerCase();
  if (!STAGES[key]) {
    throw new Error('Unknown stage: ' + name + '. Valid: ' + Object.keys(STAGES).join(', '));
  }
  return STAGES[key];
}

function assertStageAllowed(stageName, flags) {
  const stage = getStage(stageName);
  if (stage.owner_gate && !(flags && flags.owner_approve_publish)) {
    return {
      ok: false,
      status: 'OWNER_GATE',
      action: 'STOP',
      message:
        'Stage publish requires --owner-approve-publish. Refusing to push/deploy.',
      stage,
    };
  }
  return { ok: true, stage };
}

module.exports = { STAGES, STAGE_ORDER, getStage, assertStageAllowed };
