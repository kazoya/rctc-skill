#!/usr/bin/env node
'use strict';
/**
 * RCTC Digital Presence Factory + Execution Engine
 *
 *   node digital-presence-factory/cli.js plan --type portfolio --source <path>
 *   node digital-presence-factory/cli.js run --stage inspect --type portfolio --source <path>
 *   node digital-presence-factory/cli.js run --stage build ...
 *   node digital-presence-factory/cli.js run --stage verify ...
 *   node digital-presence-factory/cli.js run --stage package --out <dir> ...
 *   node digital-presence-factory/cli.js run --stage publish --owner-approve-publish ...
 *   node digital-presence-factory/cli.js hygiene --root <repo>
 *   node digital-presence-factory/cli.js --list
 *
 * Legacy: --type/--source without subcommand => plan
 */
const fs = require('fs');
const path = require('path');
const { planOnly, runStage, runPipeline } = require('./lib/engine');
const { scanHygiene } = require('./lib/hygiene');
const { writeLedger, closeLedger } = require('./lib/ledger');
const { loadRegistry, resolveExact, findRegistryPath } = require('./lib/registry');

const DPF_ROOT = __dirname;
const RCTC_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = {
    cmd: null,
    type: null,
    source: null,
    stage: null,
    list: false,
    json: false,
    help: false,
    ownerApprovePublish: false,
    out: null,
    root: null,
    pipeline: false,
  };
  const args = argv.slice(2);
  if (args[0] && !args[0].startsWith('-')) {
    out.cmd = args.shift();
  }
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--list') out.list = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--owner-approve-publish') out.ownerApprovePublish = true;
    else if (a === '--pipeline') out.pipeline = true;
    else if (a === '--type' || a === '-t') out.type = args[++i];
    else if (a === '--source' || a === '-s') out.source = args[++i];
    else if (a === '--stage') out.stage = args[++i];
    else if (a === '--out') out.out = args[++i];
    else if (a === '--root') out.root = args[++i];
  }
  // legacy plan
  if (!out.cmd && (out.type || out.source)) out.cmd = 'plan';
  return out;
}

function print(obj, asJson) {
  if (asJson) console.log(JSON.stringify(obj, null, 2));
  else console.log(typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.cmd) {
    console.log(`RCTC Execution Engine (DPF)

  plan   --type <alias> --source <path>     no side effects
  run    --stage <name> --type ... --source ...
         stages: inspect|build|verify|package|publish
         publish requires --owner-approve-publish
  run    --pipeline --type ... --source ...  inspect→build→verify→package
  hygiene --root <repo>                     KEEP/IGNORE/REVIEW/GENERATED report
  resolve --id <skillId>                    exact registry lookup (STOP/GAP)
  --list

Unknown skill ids => STOP/GAP (never fuzzy-execute).`);
    process.exit(args.help ? 0 : 1);
  }

  if (args.list) {
    const idx = JSON.parse(fs.readFileSync(path.join(DPF_ROOT, 'recipes', 'index.json'), 'utf8'));
    print(idx, true);
    return;
  }

  if (args.cmd === 'resolve') {
    const id = args.type || args.source; // misuse guard
    const skillId = process.argv.includes('--id')
      ? process.argv[process.argv.indexOf('--id') + 1]
      : id;
    const reg = loadRegistry(findRegistryPath(RCTC_ROOT));
    const r = resolveExact(reg, skillId);
    print(r, true);
    process.exit(r.ok ? 0 : 2);
  }

  if (args.cmd === 'hygiene') {
    const root = args.root || RCTC_ROOT;
    const report = scanHygiene(root);
    const out = args.out || path.join(root, 'docs', 'HYGIENE_REPORT.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
    print({ wrote: out, summary: report.summary, proposals: report.gitignore_proposals }, true);
    return;
  }

  if (args.cmd === 'plan' || args.cmd === '--type') {
    const plan = planOnly({
      rctcRoot: RCTC_ROOT,
      dpfRoot: DPF_ROOT,
      type: args.type || 'portfolio',
      source: args.source,
    });
    print(plan, true);
    process.exit(plan.compose_resolution && plan.compose_resolution.ok ? 0 : 2);
  }

  if (args.cmd === 'run') {
    const outDir =
      args.out ||
      path.join(args.source || process.cwd(), '.rctc-engine');
    fs.mkdirSync(outDir, { recursive: true });

    if (args.pipeline) {
      const r = runPipeline({
        rctcRoot: RCTC_ROOT,
        dpfRoot: DPF_ROOT,
        type: args.type,
        source: args.source,
        outDir,
        ownerApprovePublish: args.ownerApprovePublish,
      });
      if (r.ledger) {
        writeLedger(r.ledger, path.join(outDir, 'execution-ledger.json'));
      }
      print({ ok: r.ok, results: r.results, ledger: path.join(outDir, 'execution-ledger.json') }, true);
      process.exit(r.ok ? 0 : 1);
    }

    if (!args.stage) {
      console.error('run requires --stage');
      process.exit(1);
    }
    const r = runStage({
      rctcRoot: RCTC_ROOT,
      dpfRoot: DPF_ROOT,
      type: args.type,
      source: args.source,
      stage: args.stage,
      ownerApprovePublish: args.ownerApprovePublish,
      outDir,
    });
    if (r.ledger) {
      closeLedger(r.ledger, r.ok ? 'open' : 'stopped');
      writeLedger(r.ledger, path.join(outDir, 'execution-ledger.json'));
    }
    print(r, true);
    process.exit(r.ok ? 0 : 1);
  }

  console.error('Unknown command:', args.cmd);
  process.exit(1);
}

main();
