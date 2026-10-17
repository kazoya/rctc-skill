#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { resolveTask, enableAll, callExternal } = require('../dogfood-tool-router/bin/resolve.js');
const { baselineRoute } = require('../dogfood-tool-router/bin/baseline.js');

const ROOT = path.join(__dirname, '..');
const holdout = JSON.parse(fs.readFileSync(path.join(ROOT, 'dogfood-tool-router/fixtures/holdout.json'), 'utf8'));
const devTasks = JSON.parse(fs.readFileSync(path.join(ROOT, 'dogfood-tool-router/fixtures/tasks.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'dogfood-tool-router/registry.json'), 'utf8'));

const errors = [];
function check(label, cond) {
  if (!cond) errors.push(label);
}

if (holdout.length !== 10) errors.push('expected 10 holdout tasks');
const devText = new Set(devTasks.map((task) => task.text));
for (const task of holdout) {
  check(`holdout overlaps dev set: ${task.id}`, !devText.has(task.text));
}

function score(route, task) {
  const localOk = route.local === task.gold_local;
  const blockOk = Boolean(route.blocked) === Boolean(task.gold_blocked);
  return { localOk, blockOk, hit: localOk && blockOk };
}

const rows = holdout.map((task) => {
  const base = baselineRoute(task.text);
  const routed = resolveTask(task.text, registry);
  const invoked = callExternal(routed);
  return {
    id: task.id,
    kind: task.kind,
    gold_local: task.gold_local,
    baseline_local: base.local,
    router_local: routed.local,
    baseline_hit: score(base, task).hit,
    router_hit: score(routed, task).hit,
    router_status: routed.status,
    router_external: routed.external,
    tool_invocations: invoked.tool_calls,
  };
});

function hits(key) {
  return rows.filter((row) => row[key]).length;
}

const loops = 1000;
const t0 = process.hrtime.bigint();
for (let i = 0; i < loops; i += 1) {
  for (const task of holdout) baselineRoute(task.text);
}
const baselineNs = process.hrtime.bigint() - t0;
const t1 = process.hrtime.bigint();
for (let i = 0; i < loops; i += 1) {
  for (const task of holdout) resolveTask(task.text, registry);
}
const routerNs = process.hrtime.bigint() - t1;

let corrupt;
try {
  corrupt = resolveTask('plan the release checklist', null);
} catch (err) {
  corrupt = { threw: err.message };
}
check('corrupt registry does not throw', !corrupt.threw);
check('corrupt registry status', corrupt.status === 'invalid_registry');
check('corrupt registry names no tool', corrupt.external == null);

const unknown = resolveTask('zzzz-no-such-task-9f3a', registry);
check('unknown status', unknown.status === 'unmatched');
check('unknown external', unknown.external === null);
check('unknown invocations', callExternal(unknown).tool_calls === 0);

const disabled = resolveTask('plan the release checklist', registry);
check('disabled tool is not named', disabled.external === null);
check('disabled reason', disabled.reason === 'disabled');
check('disabled invocations', callExternal(disabled).tool_calls === 0);

const unavailableRegistry = JSON.parse(JSON.stringify(registry));
unavailableRegistry.integrations.context7.enabled = true;
unavailableRegistry.integrations.context7.available = false;
const unavailable = resolveTask('what does the Node 22 fetch API document say', unavailableRegistry);
check('unavailable tool is not named', unavailable.external === null);
check('unavailable reason', unavailable.reason === 'unavailable');
check('unavailable invocations', callExternal(unavailable).tool_calls === 0);

for (const item of Object.values(registry.integrations)) {
  check(`committed ${item.upstream} stays disabled`, item.enabled === false);
  check(`committed ${item.upstream} stays unavailable`, item.available === false);
}

const enabledNames = holdout.filter((task) => {
  const route = resolveTask(task.text, enableAll(registry));
  return route.external != null;
}).length;
check('holdout default registry names zero tools', rows.every((row) => row.router_external == null));

const log = {
  date: '2026-10-17',
  loops,
  baseline_hits: hits('baseline_hit'),
  router_hits: hits('router_hit'),
  n: holdout.length,
  baseline_ms: Number(baselineNs) / 1e6,
  router_ms: Number(routerNs) / 1e6,
  baseline_tool_invocations: 0,
  router_tool_invocations: rows.reduce((sum, row) => sum + row.tool_invocations, 0),
  router_external_names_on_default_registry: rows.filter((row) => row.router_external).length,
  router_external_names_if_installed_and_enabled: enabledNames,
  wrong_router: rows.filter((row) => !row.router_hit).map((row) => ({
    id: row.id,
    gold: row.gold_local,
    got: row.router_local,
  })),
  wrong_baseline: rows.filter((row) => !row.baseline_hit).map((row) => ({
    id: row.id,
    gold: row.gold_local,
    got: row.baseline_local,
  })),
  rows,
  failure: {
    corrupt: corrupt.status || corrupt.threw,
    unknown: unknown.status,
    disabled: disabled.reason,
    unavailable: unavailable.reason,
  },
};

const out = path.join(ROOT, 'dogfood-tool-router/docs/phase2-log.json');
fs.writeFileSync(out, JSON.stringify(log, null, 2) + '\n');

if (errors.length) {
  console.error('FAIL test:dogfood-holdout');
  for (const err of errors) console.error(' - ' + err);
  console.error(JSON.stringify({ baseline_hits: log.baseline_hits, router_hits: log.router_hits }, null, 2));
  process.exit(1);
}

console.log(
  `PASS test:dogfood-holdout baseline ${log.baseline_hits}/${log.n} router ${log.router_hits}/${log.n} ` +
    `baseline_ms ${log.baseline_ms.toFixed(3)} router_ms ${log.router_ms.toFixed(3)} ` +
    `tool_invocations ${log.router_tool_invocations}`
);
