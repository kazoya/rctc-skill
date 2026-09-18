#!/usr/bin/env node
/**
 * Digital Presence Factory — plan-only CLI
 * Prints a deterministic composition plan. Never deploys/publishes.
 *
 * Usage:
 *   node digital-presence-factory/cli.js --type personal --source <path>
 *   node digital-presence-factory/cli.js --type technical-delivery --source <path>
 *   node digital-presence-factory/cli.js --type factory --source <path-or-url>
 *   node digital-presence-factory/cli.js --type project-evidence --source <path>
 *   node digital-presence-factory/cli.js --list
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const RECIPES_DIR = path.join(ROOT, 'recipes');
const REGISTRY_PATH = path.join(ROOT, '..', 'registry', 'skills.json');

const TYPE_ALIASES = {
  personal: 'personal-engineering-portfolio',
  'personal-engineering': 'personal-engineering-portfolio',
  'personal-engineering-portfolio': 'personal-engineering-portfolio',
  technical: 'technical-delivery-portfolio',
  'technical-delivery': 'technical-delivery-portfolio',
  'technical-delivery-portfolio': 'technical-delivery-portfolio',
  portfolio: 'technical-delivery-portfolio',
  factory: 'factory-sales-concept',
  'factory-sales': 'factory-sales-concept',
  'factory-sales-concept': 'factory-sales-concept',
  company: 'company-marketing-site',
  'company-marketing': 'company-marketing-site',
  'company-marketing-site': 'company-marketing-site',
  product: 'product-showcase',
  'product-showcase': 'product-showcase',
  evidence: 'project-evidence-portal',
  'project-evidence': 'project-evidence-portal',
  'project-evidence-portal': 'project-evidence-portal',
  project1: 'project-evidence-portal',
  master: 'project-evidence-portal',
};

const PIPELINE = [
  'discover',
  'inspect',
  'reason',
  'design',
  'build',
  'verify',
  'package',
  'publish',
];

const OWNER_GATED = [
  'git push to public remotes',
  'Vercel / hosting deploy',
  'DNS / domain changes',
  'publishing a new skill to the registry',
  'lifting buyHalt / Dry Run / purchasing gates (never for demos)',
  'spending money or creating paid accounts',
];

function parseArgs(argv) {
  const out = { type: null, source: null, list: false, json: false, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') out.list = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--type' || a === '-t') out.type = argv[++i];
    else if (a === '--source' || a === '-s') out.source = argv[++i];
    else if (!a.startsWith('-') && !out.source) out.source = a;
  }
  return out;
}

function loadIndex() {
  return JSON.parse(fs.readFileSync(path.join(RECIPES_DIR, 'index.json'), 'utf8'));
}

function loadRecipe(id) {
  const p = path.join(RECIPES_DIR, id + '.json');
  if (!fs.existsSync(p)) throw new Error('Unknown recipe: ' + id);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadRegistryIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.skills || raw.items || [];
    const ids = new Set();
    for (const item of list) {
      if (typeof item === 'string') ids.add(item);
      else if (item && (item.id || item.name || item.slug)) ids.add(item.id || item.name || item.slug);
    }
    return ids;
  } catch (_) {
    return new Set();
  }
}

function discoverEvidence(source) {
  const evidence = [];
  const missing = [];
  if (!source) {
    missing.push('source path or URL (--source)');
    return { evidence, missing, kind: 'none' };
  }
  const looksUrl = /^https?:\/\//i.test(source);
  if (looksUrl) {
    evidence.push({ kind: 'url', value: source, note: 'public URL — inspect only; do not invent metrics' });
    return { evidence, missing, kind: 'url' };
  }
  const abs = path.resolve(source);
  if (!fs.existsSync(abs)) {
    missing.push('source path does not exist: ' + abs);
    return { evidence, missing, kind: 'missing-path', abs };
  }
  const st = fs.statSync(abs);
  evidence.push({ kind: 'path', value: abs, note: st.isDirectory() ? 'directory' : 'file' });
  if (st.isDirectory()) {
    const markers = [
      'package.json',
      'README.md',
      'SKILL.md',
      'brain.json',
      'BRAIN.md',
      'data',
      'app',
      'src',
      'project.json',
      'ROLES.md',
      'PRODUCTION_DNA.md',
    ];
    for (const m of markers) {
      const mp = path.join(abs, m);
      if (fs.existsSync(mp)) evidence.push({ kind: 'marker', value: m, path: mp });
    }
    try {
      const pkgPath = path.join(abs, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        evidence.push({
          kind: 'package',
          name: pkg.name || null,
          scripts: Object.keys(pkg.scripts || {}),
        });
      }
    } catch (_) {}
  }
  return { evidence, missing, kind: 'path', abs };
}

function inferType(args, discovery) {
  if (args.type) {
    const key = String(args.type).toLowerCase().trim();
    if (!TYPE_ALIASES[key]) throw new Error('Unknown --type: ' + args.type + '. Use --list.');
    return TYPE_ALIASES[key];
  }
  const abs = (discovery.abs || '').toLowerCase().replace(/\\/g, '/');
  if (abs.includes('suhib-ai-delivery-portfolio')) return 'technical-delivery-portfolio';
  if (abs.includes('factory-sales-concept')) return 'factory-sales-concept';
  if (abs.includes('/project1') || abs.endsWith('project1')) return 'project-evidence-portal';
  if (abs.includes('/master') || abs.endsWith('master')) return 'project-evidence-portal';
  if (discovery.evidence.some((e) => e.kind === 'marker' && e.value === 'SKILL.md')) {
    return 'factory-sales-concept';
  }
  if (discovery.evidence.some((e) => e.kind === 'marker' && (e.value === 'brain.json' || e.value === 'data'))) {
    return 'technical-delivery-portfolio';
  }
  return 'personal-engineering-portfolio';
}

function classifyCompose(recipe, registryIds) {
  const reused = [];
  const missingFromRegistry = [];
  const generateNewCandidates = [];
  for (const skill of recipe.compose || []) {
    const found = registryIds.has(skill) || registryIds.has(skill.replace(/_/g, '-'));
    if (found) reused.push({ skill, decision: 'REUSE' });
    else {
      // Prefer compose of known family names even if registry id spelling differs
      const soft = [...registryIds].some(
        (id) =>
          id.includes(skill.split('/')[0].slice(0, 12)) ||
          skill.includes(String(id).slice(0, 12))
      );
      if (soft) reused.push({ skill, decision: 'COMPOSE (registry fuzzy match)' });
      else {
        missingFromRegistry.push(skill);
        // DPF rule: do NOT generate new unless composition fails — flag as extend/compose gap
        generateNewCandidates.push({
          skill,
          decision: 'EXTEND/COMPOSE gap — do not Generate New until reuse fails review',
        });
      }
    }
  }
  return { reused, missingFromRegistry, generateNewCandidates };
}

function verificationCommands(recipe, sourceAbs) {
  const cmds = [];
  const root = sourceAbs || '<target-folder>';
  for (const v of recipe.verify || []) {
    cmds.push(v);
  }
  cmds.push('node digital-presence-factory/scripts/validate-recipes.js');
  cmds.push('node digital-presence-factory/cli.js --type ' + recipe.id + ' --source ' + root + '  # re-plan (idempotent)');
  if (recipe.proving_ground && /project1/i.test(String(recipe.proving_ground))) {
    cmds.push('cd C:\\project1 && pnpm typecheck  # buyHalt/Dry Run must remain untouched');
  }
  return cmds;
}

function expectedArtifacts(recipe) {
  return [
    'composition plan (this CLI stdout)',
    'target site/folder implementing recipe output: ' + (recipe.output || recipe.id),
    'verify log (build/lint/tests as recipe requires)',
    'optional consult/update zip via update-zip-skill',
    'NO auto-deploy artifacts — publish requires owner approval',
  ];
}

function buildPlan(args) {
  const discovery = discoverEvidence(args.source);
  const recipeId = inferType(args, discovery);
  const recipe = loadRecipe(recipeId);
  const registryIds = loadRegistryIds();
  const compose = classifyCompose(recipe, registryIds);
  const missing = [...discovery.missing];
  for (const need of recipe.inputs || []) {
    // informational — CLI cannot satisfy all inputs automatically
    if (/url/i.test(need) && discovery.kind !== 'url' && !args.source) {
      missing.push(need);
    }
  }
  if (!args.source) missing.push('source (folder or URL)');

  const preference = {
    order: ['Reuse', 'Compose', 'Extend', 'Generate New'],
    applied: compose.reused.length
      ? 'Reuse/Compose preferred — existing skills referenced; no new skill generated by this CLI'
      : 'Compose gaps listed; Generate New blocked until owner review via skill-factory draft gate',
  };

  return {
    mode: 'PLAN_ONLY',
    side_effect_level: 'none (stdout plan; no write/deploy/publish)',
    discovered_evidence: discovery.evidence,
    selected_recipe: {
      id: recipe.id,
      output: recipe.output,
      notes: recipe.notes || null,
      proving_ground: recipe.proving_ground || null,
      inputs: recipe.inputs || [],
    },
    existing_skills_reused: compose.reused,
    compose_gaps: compose.missingFromRegistry,
    generate_new: compose.generateNewCandidates,
    preference,
    execution_order: PIPELINE.map((stage, i) => ({
      step: i + 1,
      stage,
      gate: stage === 'publish' ? 'OWNER_APPROVAL_REQUIRED' : stage === 'build' ? 'human confirms target folder' : 'agent-safe',
    })),
    missing_information: missing.length ? missing : ['(none blocking plan — confirm recipe inputs with owner before build)'],
    consequential_actions_requiring_owner_approval: OWNER_GATED,
    verification_commands: verificationCommands(recipe, discovery.abs),
    expected_artifacts: expectedArtifacts(recipe),
    warning: 'Do NOT automatically deploy/publish merely because this CLI can plan it.',
  };
}

function printHuman(plan) {
  const lines = [];
  lines.push('=== Digital Presence Factory — Composition Plan (PLAN ONLY) ===');
  lines.push('Mode: ' + plan.mode);
  lines.push('Side effects: ' + plan.side_effect_level);
  lines.push('');
  lines.push('## Discovered evidence');
  if (!plan.discovered_evidence.length) lines.push('- (none)');
  for (const e of plan.discovered_evidence) {
    lines.push('- ' + JSON.stringify(e));
  }
  lines.push('');
  lines.push('## Selected recipe');
  lines.push('- id: ' + plan.selected_recipe.id);
  lines.push('- output: ' + plan.selected_recipe.output);
  if (plan.selected_recipe.notes) lines.push('- notes: ' + plan.selected_recipe.notes);
  if (plan.selected_recipe.proving_ground) lines.push('- proving_ground: ' + plan.selected_recipe.proving_ground);
  lines.push('');
  lines.push('## Preference: Reuse → Compose → Extend → Generate New');
  lines.push('- ' + plan.preference.applied);
  lines.push('');
  lines.push('## Existing skills reused / composed');
  for (const r of plan.existing_skills_reused) {
    lines.push('- [' + r.decision + '] ' + r.skill);
  }
  if (!plan.existing_skills_reused.length) lines.push('- (none matched registry exactly)');
  if (plan.compose_gaps.length) {
    lines.push('');
    lines.push('## Compose gaps (do not duplicate — extend or map names)');
    for (const g of plan.compose_gaps) lines.push('- ' + g);
  }
  lines.push('');
  lines.push('## Execution order');
  for (const s of plan.execution_order) {
    lines.push(s.step + '. ' + s.stage + '  [' + s.gate + ']');
  }
  lines.push('');
  lines.push('## Missing information');
  for (const m of plan.missing_information) lines.push('- ' + m);
  lines.push('');
  lines.push('## Consequential actions requiring owner approval');
  for (const a of plan.consequential_actions_requiring_owner_approval) lines.push('- ' + a);
  lines.push('');
  lines.push('## Verification commands');
  for (const c of plan.verification_commands) lines.push('- ' + c);
  lines.push('');
  lines.push('## Expected artifacts');
  for (const a of plan.expected_artifacts) lines.push('- ' + a);
  lines.push('');
  lines.push('WARNING: ' + plan.warning);
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Digital Presence Factory CLI (plan only)

Usage:
  node digital-presence-factory/cli.js --type <alias> --source <path|url>
  node digital-presence-factory/cli.js --list
  node digital-presence-factory/cli.js --json --type portfolio --source C:\\\\Suhib-AI-Delivery-Portfolio

Type aliases: personal, technical-delivery, factory, company, product, project-evidence
Never auto-deploys or publishes.`);
    process.exit(0);
  }
  if (args.list) {
    const idx = loadIndex();
    console.log(JSON.stringify(idx, null, 2));
    process.exit(0);
  }
  try {
    const plan = buildPlan(args);
    if (args.json) console.log(JSON.stringify(plan, null, 2));
    else console.log(printHuman(plan));
    process.exit(0);
  } catch (err) {
    console.error('DPF CLI error:', err.message || err);
    process.exit(1);
  }
}

main();
