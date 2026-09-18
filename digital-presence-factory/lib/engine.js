'use strict';
const fs = require('fs');
const path = require('path');
const { loadRegistry, resolveComposeList, findRegistryPath } = require('./registry');
const { createLedger, appendStep, closeLedger, nowIso } = require('./ledger');
const { getStage, assertStageAllowed, STAGE_ORDER } = require('./stages');
const inspectAdapter = require('../adapters/local-fs-inspect');
const improveAdapter = require('../adapters/portfolio-small-improve');
const verifyAdapter = require('../adapters/local-verify');
const packageAdapter = require('../adapters/package-ledger');

const TYPE_ALIASES = {
  personal: 'personal-engineering-portfolio',
  'personal-engineering-portfolio': 'personal-engineering-portfolio',
  technical: 'technical-delivery-portfolio',
  'technical-delivery': 'technical-delivery-portfolio',
  'technical-delivery-portfolio': 'technical-delivery-portfolio',
  portfolio: 'technical-delivery-portfolio',
  factory: 'factory-sales-concept',
  'factory-sales-concept': 'factory-sales-concept',
  company: 'company-marketing-site',
  'company-marketing-site': 'company-marketing-site',
  product: 'product-showcase',
  'product-showcase': 'product-showcase',
  evidence: 'project-evidence-portal',
  'project-evidence': 'project-evidence-portal',
  'project-evidence-portal': 'project-evidence-portal',
  project1: 'project-evidence-portal',
};

function loadRecipe(dpfRoot, id) {
  const p = path.join(dpfRoot, 'recipes', id + '.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function resolveType(type) {
  const key = String(type || '').toLowerCase();
  if (!TYPE_ALIASES[key]) throw new Error('Unknown --type: ' + type);
  return TYPE_ALIASES[key];
}

/**
 * Map recipe compose skill → adapter for a given stage.
 * Unknown executable mapping at build => GAP (do not invent).
 */
function pickAdapter(stage, recipe, source) {
  if (stage === 'inspect' || stage === 'discover') return inspectAdapter;
  if (stage === 'verify') return verifyAdapter;
  if (stage === 'package') return packageAdapter;
  if (stage === 'build') {
    // Controlled dogfood adapter for portfolio technical-delivery only
    const abs = String(source || '').toLowerCase().replace(/\\/g, '/');
    if (
      recipe.id === 'technical-delivery-portfolio' &&
      abs.includes('suhib-ai-delivery-portfolio')
    ) {
      return improveAdapter;
    }
    return null; // GAP — no generic build executor yet
  }
  if (stage === 'publish') return null;
  // plan/reason/design are ledger-only
  return 'ledger-only';
}

function planOnly(opts) {
  const { rctcRoot, dpfRoot, type, source } = opts;
  const registry = loadRegistry(findRegistryPath(rctcRoot));
  const recipeId = resolveType(type);
  const recipe = loadRecipe(dpfRoot, recipeId);
  const compose = resolveComposeList(registry, recipe.compose || []);
  const inspect = inspectAdapter.run({ source });
  return {
    mode: 'plan',
    side_effects: 'none',
    recipe,
    compose_resolution: compose,
    inspect_preview: inspect,
    warning: compose.ok
      ? 'Plan ready — run stages explicitly; publish needs owner gate'
      : 'STOP/GAP — normalize compose ids before any run stage that executes skills',
  };
}

function runStage(opts) {
  const {
    rctcRoot,
    dpfRoot,
    type,
    source,
    stage: stageName,
    ownerApprovePublish,
    outDir,
    ledger: existingLedger,
  } = opts;

  const gate = assertStageAllowed(stageName, {
    owner_approve_publish: !!ownerApprovePublish,
  });
  if (!gate.ok) {
    return { ok: false, ...gate };
  }
  const stage = gate.stage;
  const registry = loadRegistry(findRegistryPath(rctcRoot));
  const recipeId = resolveType(type);
  const recipe = loadRecipe(dpfRoot, recipeId);

  // Identity gate before ANY executable stage beyond plan/design/reason
  const executable = ['inspect', 'build', 'verify', 'package', 'publish'].includes(stage.id);
  const compose = resolveComposeList(registry, recipe.compose || []);
  if (executable && ['build', 'verify', 'package', 'publish'].includes(stage.id) && !compose.ok) {
    return {
      ok: false,
      status: 'GAP',
      action: 'STOP',
      message: 'Compose ids not fully resolved against registry. Fix recipes before execution.',
      compose_resolution: compose,
    };
  }
  // inspect may run read-only even with compose gaps (discovery), but record GAP
  const ledger =
    existingLedger ||
    createLedger({
      recipe_id: recipe.id,
      source,
      type,
      engine: 'rctc-execution-engine-v1',
    });

  const started_at = nowIso();
  const t0 = Date.now();

  if (stage.id === 'plan' || stage.id === 'reason' || stage.id === 'design') {
    const output = {
      recipe_id: recipe.id,
      compose: recipe.compose,
      compose_resolution: compose,
      stage: stage.id,
    };
    appendStep(ledger, {
      skill_or_capability_id: 'digital-presence-factory',
      input: { type, source, stage: stage.id },
      output,
      duration_ms: Date.now() - t0,
      status: compose.ok || stage.id !== 'build' ? 'ok' : 'gap',
      evidence: [{ kind: 'compose_resolution', ...compose }],
      files_changed: [],
      side_effect_classification: stage.side_effects,
      verification: { ok: true },
      next_step: nextAfter(stage.id),
      stage: stage.id,
      started_at,
    });
    return { ok: true, ledger, stage, output, compose_resolution: compose };
  }

  if (stage.id === 'publish') {
    appendStep(ledger, {
      skill_or_capability_id: 'digital-presence-factory',
      input: { stage: 'publish' },
      output: {
        refused_without_flag: !ownerApprovePublish,
        message: 'Publish is owner-gated. Pass --owner-approve-publish only after human review.',
      },
      duration_ms: Date.now() - t0,
      status: ownerApprovePublish ? 'owner_approved_but_no_auto_deploy' : 'OWNER_GATE',
      evidence: [],
      files_changed: [],
      side_effect_classification: 'external-irreversible',
      verification: { ok: false, checks: ['owner must deploy manually this round'] },
      next_step: null,
      stage: 'publish',
      started_at,
      notes:
        'Even with approval flag, this engine version does not auto-push/deploy — prints required human commands only.',
    });
    return {
      ok: !!ownerApprovePublish,
      ledger,
      stage,
      status: 'OWNER_GATE_MANUAL',
      message:
        'Manual publish checklist only. No git push / vercel from engine.',
    };
  }

  const adapter = pickAdapter(stage.id, recipe, source);
  if (!adapter) {
    appendStep(ledger, {
      skill_or_capability_id: recipe.compose && recipe.compose[0],
      input: { stage: stage.id, source },
      output: {
        error: 'NO_ADAPTER',
        message:
          'No contract adapter for this stage/recipe pair. STOP — do not fall back to giant prompts.',
      },
      duration_ms: Date.now() - t0,
      status: 'GAP',
      evidence: [],
      files_changed: [],
      side_effect_classification: stage.side_effects,
      verification: { ok: false },
      next_step: 'Implement adapter or choose supported dogfood path',
      stage: stage.id,
      started_at,
    });
    return { ok: false, status: 'GAP', action: 'STOP', ledger, compose_resolution: compose };
  }

  const adapterInput = {
    source,
    ledger,
    out_dir: outDir || path.join(source, '.rctc-engine'),
    expect_marker:
      stage.id === 'verify' && recipe.id === 'technical-delivery-portfolio'
        ? improveAdapter.MARKER
        : undefined,
  };
  if (stage.id === 'package') {
    fs.mkdirSync(adapterInput.out_dir, { recursive: true });
  }

  const result = adapter.run(adapterInput);
  appendStep(ledger, {
    skill_or_capability_id: adapter.id,
    input: { stage: stage.id, source, recipe: recipe.id },
    output: result.output,
    duration_ms: result.duration_ms,
    status: result.status,
    evidence: result.evidence,
    files_changed: result.files_changed,
    side_effect_classification: result.side_effect_classification || stage.side_effects,
    verification: result.verification,
    next_step: result.next_step || nextAfter(stage.id),
    stage: stage.id,
    started_at,
    notes: result.notes || null,
  });

  return {
    ok: result.status === 'ok',
    ledger,
    stage,
    result,
    compose_resolution: compose,
  };
}

function nextAfter(stageId) {
  const i = STAGE_ORDER.indexOf(stageId);
  if (i < 0 || i >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[i + 1];
}

function runPipeline(opts) {
  const stages = opts.stages || ['inspect', 'build', 'verify', 'package'];
  let ledger = null;
  const results = [];
  for (const st of stages) {
    const r = runStage({ ...opts, stage: st, ledger });
    ledger = r.ledger || ledger;
    results.push({ stage: st, ok: r.ok, status: r.status || (r.result && r.result.status) });
    if (!r.ok && st !== 'inspect') break;
  }
  if (ledger) closeLedger(ledger, results.every((x) => x.ok) ? 'success' : 'stopped');
  return { ok: results.every((x) => x.ok), ledger, results };
}

module.exports = {
  planOnly,
  runStage,
  runPipeline,
  resolveType,
  loadRecipe,
  TYPE_ALIASES,
};
