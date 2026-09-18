#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { planOnly, runStage, runPipeline, ENGINE_VERSION } = require('./lib/engine');
const { scanHygiene } = require('./lib/hygiene');
const { writeLedger, finalizeLedgerV2 } = require('./lib/ledger-v2');
const { loadCanonical, resolveCanonical } = require('./lib/canonical');

const DPF_ROOT = __dirname;
const RCTC_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = {
    cmd: null, type: null, source: null, stage: null, list: false, json: true,
    help: false, ownerApprovePublish: false, out: null, root: null, pipeline: false, id: null,
  };
  const args = argv.slice(2);
  if (args[0] && !args[0].startsWith('-')) out.cmd = args.shift();
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--list') out.list = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--owner-approve-publish') out.ownerApprovePublish = true;
    else if (a === '--pipeline') out.pipeline = true;
    else if (a === '--type' || a === '-t') out.type = args[++i];
    else if (a === '--source' || a === '-s') out.source = args[++i];
    else if (a === '--stage') out.stage = args[++i];
    else if (a === '--out') out.out = args[++i];
    else if (a === '--root') out.root = args[++i];
    else if (a === '--id') out.id = args[++i];
  }
  if (!out.cmd && (out.type || out.source)) out.cmd = 'plan';
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.cmd) {
    console.log(`RCTC Trust Kernel (${ENGINE_VERSION})
  plan | run --stage | run --pipeline | hygiene | resolve --id | metrics
Unknown canonical id => STOP/GAP. Adapters via contracts/adapters/*.manifest.json`);
    process.exit(args.help ? 0 : 1);
  }
  if (args.cmd === 'metrics' || args.list) {
    const c = loadCanonical(RCTC_ROOT);
    console.log(JSON.stringify(args.list ? { recipes: JSON.parse(fs.readFileSync(path.join(DPF_ROOT,'recipes','index.json'),'utf8')), metrics: c.data.metrics } : c.data.metrics, null, 2));
    return;
  }
  if (args.cmd === 'resolve') {
    const c = loadCanonical(RCTC_ROOT);
    const r = resolveCanonical(c, args.id || args.type);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 2);
  }
  if (args.cmd === 'hygiene') {
    const root = args.root || RCTC_ROOT;
    const report = scanHygiene(root);
    const out = args.out || path.join(root, 'docs', 'HYGIENE_REPORT.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ wrote: out, summary: report.summary }, null, 2));
    return;
  }
  if (args.cmd === 'plan') {
    const plan = planOnly({ rctcRoot: RCTC_ROOT, dpfRoot: DPF_ROOT, type: args.type, source: args.source });
    console.log(JSON.stringify(plan, null, 2));
    process.exit(plan.compose_resolution.ok ? 0 : 2);
  }
  if (args.cmd === 'run') {
    const outDir = args.out || path.join(args.source || process.cwd(), '.rctc-engine');
    fs.mkdirSync(outDir, { recursive: true });
    if (args.pipeline) {
      const r = runPipeline({
        rctcRoot: RCTC_ROOT, dpfRoot: DPF_ROOT, type: args.type, source: args.source,
        outDir, ownerApprovePublish: args.ownerApprovePublish,
      });
      console.log(JSON.stringify({ ok: r.ok, results: r.results, verified_claim: r.ledger && r.ledger.verified_claim, ledger: path.join(outDir, 'execution-ledger.v2.json') }, null, 2));
      process.exit(r.ok ? 0 : 1);
    }
    if (!args.stage) { console.error('--stage required'); process.exit(1); }
    const r = runStage({
      rctcRoot: RCTC_ROOT, dpfRoot: DPF_ROOT, type: args.type, source: args.source,
      stage: args.stage, ownerApprovePublish: args.ownerApprovePublish, outDir,
    });
    if (r.ledger) {
      finalizeLedgerV2(r.ledger, args.source);
      writeLedger(r.ledger, path.join(outDir, 'execution-ledger.v2.json'));
    }
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  }
  console.error('Unknown command', args.cmd);
  process.exit(1);
}
main();
