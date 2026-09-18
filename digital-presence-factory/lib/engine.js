'use strict';
const fs = require('fs');
const path = require('path');
const { loadCanonical, resolveComposeCanonical } = require('./canonical');
const { createLedgerV2, appendStepV2, finalizeLedgerV2, writeLedger, gitSnap, sha256File, sha256String, nowIso } = require('./ledger-v2');
const { getStage, assertStageAllowed, STAGE_ORDER } = require('./stages');
const { loadAdapterManifests, selectAdapterManifest, loadAdapterModule } = require('./contracts');
const { authorizeManifest, enforceWrites } = require('./sandbox');

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

const ENGINE_VERSION = 'rctc-trust-kernel-v1';

function loadRecipe(dpfRoot, id) {
  const p = path.join(dpfRoot, 'recipes', id + '.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function resolveType(type) {
  const key = String(type || '').toLowerCase();
  if (!TYPE_ALIASES[key]) throw new Error('Unknown --type: ' + type);
  return TYPE_ALIASES[key];
}

function engineHash(dpfRoot) {
  return sha256File(path.join(dpfRoot, 'lib', 'engine.js'));
}

function planOnly(opts) {
  const { rctcRoot, dpfRoot, type, source } = opts;
  const canonical = loadCanonical(rctcRoot);
  const recipeId = resolveType(type);
  const recipe = loadRecipe(dpfRoot, recipeId);
  const compose = resolveComposeCanonical(canonical, recipe.compose || []);
  return {
    mode: 'plan',
    side_effects: 'none',
    metrics: canonical.data.metrics,
    recipe,
    compose_resolution: compose,
    warning: compose.ok
      ? 'Plan ready — stages via declarative adapter manifests only'
      : 'STOP/GAP — compose must resolve to canonical capability ids',
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

  const gate = assertStageAllowed(stageName, { owner_approve_publish: !!ownerApprovePublish });
  if (!gate.ok) return { ok: false, ...gate };
  const stage = gate.stage;
  const canonical = loadCanonical(rctcRoot);
  const recipeId = resolveType(type);
  const recipePath = path.join(dpfRoot, 'recipes', recipeId + '.json');
  const recipe = loadRecipe(dpfRoot, recipeId);
  const recipeHash = sha256File(recipePath);
  const compose = resolveComposeCanonical(canonical, recipe.compose || []);

  if (['build', 'verify', 'package', 'publish'].includes(stage.id) && !compose.ok) {
    return {
      ok: false,
      status: 'GAP',
      action: 'STOP',
      message: 'Compose ids not canonical',
      compose_resolution: compose,
    };
  }

  const snapBefore = gitSnap(source);
  const ledger =
    existingLedger ||
    createLedgerV2({
      recipe_id: recipe.id,
      recipe_hash: recipeHash,
      source,
      type,
      engine_version: ENGINE_VERSION,
      engine_hash: engineHash(dpfRoot),
      repository_root: source,
      commit_before: snapBefore.commit,
      dirty_before: snapBefore.dirty,
    });

  const started_at = nowIso();
  const t0 = Date.now();
  const manifests = loadAdapterManifests(dpfRoot);

  if (['plan', 'reason', 'design'].includes(stage.id)) {
    appendStepV2(ledger, {
      canonical_capability_id: 'digital-presence-factory',
      physical_adapter_id: null,
      recipe_id: recipe.id,
      recipe_hash: recipeHash,
      stage: stage.id,
      input: { type, source },
      output: { compose_resolution: compose },
      duration_ms: Date.now() - t0,
      status: 'ok',
      permissions_granted: {},
      owner_gates_invoked: [],
      verification: { ok: true },
      next_step: nextAfter(stage.id),
      started_at,
      side_effect_classification: stage.side_effects,
    });
    return { ok: true, ledger, stage, compose_resolution: compose };
  }

  if (stage.id === 'publish') {
    const gates = ownerApprovePublish ? ['--owner-approve-publish'] : [];
    appendStepV2(ledger, {
      canonical_capability_id: 'digital-presence-factory',
      recipe_id: recipe.id,
      recipe_hash: recipeHash,
      stage: 'publish',
      input: {},
      output: { manual_only: true },
      duration_ms: Date.now() - t0,
      status: ownerApprovePublish ? 'ok' : 'OWNER_GATE',
      owner_gates_invoked: gates,
      permissions_granted: { deploy: false, github_write: false },
      verification: { ok: false, checks: ['no auto deploy in trust kernel v1'] },
      started_at,
      side_effect_classification: 'external-irreversible',
      notes: 'Publish remains manual even with owner flag',
    });
    return { ok: !!ownerApprovePublish, ledger, stage, status: 'OWNER_GATE_MANUAL' };
  }

  const sel = selectAdapterManifest(manifests, { stage: stage.id, recipeId: recipe.id, source });
  if (!sel.ok) {
    appendStepV2(ledger, {
      canonical_capability_id: (recipe.compose && recipe.compose[0]) || null,
      recipe_id: recipe.id,
      recipe_hash: recipeHash,
      stage: stage.id,
      input: { source },
      output: sel,
      duration_ms: Date.now() - t0,
      status: 'GAP',
      verification: { ok: false },
      started_at,
      side_effect_classification: stage.side_effects,
    });
    return { ok: false, ...sel, ledger };
  }

  const manifest = sel.manifest;
  const auth = authorizeManifest(manifest, stage.id, {
    source,
    outDir,
    rctcRoot,
    ownerApprovePublish,
  });
  if (!auth.ok) {
    appendStepV2(ledger, {
      canonical_capability_id: manifest.canonical_capability_id,
      physical_adapter_id: manifest.adapter_id,
      recipe_id: recipe.id,
      recipe_hash: recipeHash,
      stage: stage.id,
      input: { source },
      output: auth,
      duration_ms: Date.now() - t0,
      status: 'STOP',
      permissions_granted: auth.declared || null,
      owner_gates_invoked: [],
      verification: { ok: false },
      started_at,
      notes: 'Sandbox denied undeclared capability',
    });
    return { ok: false, ...auth, ledger };
  }

  const loaded = loadAdapterModule(dpfRoot, manifest);
  if (!loaded.ok) return { ...loaded, ledger };

  const adapterHash = sha256File(loaded.modPath);
  const adapterInput = {
    source,
    ledger,
    out_dir: outDir || path.join(source, '.rctc-engine'),
    expect_marker: manifest.verify_marker || undefined,
    permissions: auth.declared,
  };
  if (stage.id === 'package') fs.mkdirSync(adapterInput.out_dir, { recursive: true });

  const result = loaded.module.run(adapterInput);
  const writeCheck = enforceWrites(auth.declared, result.files_changed || []);
  if (!writeCheck.ok) {
    appendStepV2(ledger, {
      canonical_capability_id: manifest.canonical_capability_id,
      physical_adapter_id: manifest.adapter_id,
      adapter_hash: adapterHash,
      adapter_version: manifest.version || '1',
      recipe_id: recipe.id,
      recipe_hash: recipeHash,
      stage: stage.id,
      input: { source },
      output: { result, writeCheck },
      duration_ms: result.duration_ms,
      status: 'STOP',
      files_changed: result.files_changed || [],
      permissions_granted: auth.declared,
      verification: { ok: false },
      started_at,
      notes: 'Write outside declared paths',
    });
    return { ok: false, ...writeCheck, ledger };
  }

  const artifact_hashes = {};
  for (const f of result.files_changed || []) {
    artifact_hashes[f] = sha256File(f);
  }

  appendStepV2(ledger, {
    canonical_capability_id: manifest.canonical_capability_id,
    physical_adapter_id: manifest.adapter_id,
    adapter_hash: adapterHash,
    adapter_version: manifest.version || '1',
    recipe_id: recipe.id,
    recipe_hash: recipeHash,
    stage: stage.id,
    input: { source, recipe: recipe.id },
    output: result.output,
    duration_ms: result.duration_ms,
    status: result.status,
    evidence: result.evidence,
    files_changed: result.files_changed,
    artifact_hashes,
    permissions_granted: auth.declared,
    owner_gates_invoked: [],
    verification: result.verification,
    verification_command: (result.verification && result.verification.command) || null,
    verification_exit_code: (result.verification && result.verification.exit_code) ?? null,
    next_step: result.next_step || nextAfter(stage.id),
    started_at,
    side_effect_classification: result.side_effect_classification || stage.side_effects,
    notes: result.notes || null,
  });

  return {
    ok: result.status === 'ok',
    ledger,
    stage,
    result,
    manifest,
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
    if (!r.ok) break;
  }
  if (ledger) {
    finalizeLedgerV2(ledger, opts.source);
    if (opts.outDir) writeLedger(ledger, path.join(opts.outDir, 'execution-ledger.v2.json'));
  }
  return { ok: results.every((x) => x.ok), ledger, results };
}

module.exports = {
  planOnly,
  runStage,
  runPipeline,
  resolveType,
  loadRecipe,
  TYPE_ALIASES,
  ENGINE_VERSION,
};
