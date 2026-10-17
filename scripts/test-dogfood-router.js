#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { resolveTask, enableAll } = require('../dogfood-tool-router/bin/resolve.js');

const ROOT = path.join(__dirname, '..');
const tasks = JSON.parse(fs.readFileSync(path.join(ROOT, 'dogfood-tool-router/fixtures/tasks.json'), 'utf8'));
const edges = JSON.parse(fs.readFileSync(path.join(ROOT, 'dogfood-tool-router/fixtures/graph-edges.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'dogfood-tool-router/registry.json'), 'utf8'));

const errors = [];

function check(label, cond) {
  if (!cond) errors.push(label);
}

if (tasks.length !== 10) errors.push('expected 10 tasks');

for (const task of tasks) {
  const off = resolveTask(task.text, registry);
  check(`${task.id} default external is null`, off.external === null);
  check(`${task.id} default local`, off.local === task.local);
  check(`${task.id} single external field`, !Array.isArray(off.external));
  if (task.blocked) check(`${task.id} blocked`, off.blocked === true);

  const on = resolveTask(task.text, enableAll(registry));
  check(`${task.id} still one external`, on.external === null || typeof on.external === 'string');
  if (task.external_when_enabled) {
    check(`${task.id} enables only ${task.external_when_enabled}`, on.external === task.external_when_enabled);
    if (task.upstream_skill) check(`${task.id} upstream skill`, on.upstream_skill === task.upstream_skill);
  } else {
    check(`${task.id} stays off even when integrations are enabled`, on.external === null);
  }
}

const mixed = resolveTask('plan the ui and pentest production', enableAll(registry));
check('mixed prompt still one route', mixed.external === null && mixed.blocked === true);

for (const edge of edges) {
  const abs = path.join(ROOT, edge.from);
  check(`edge source exists ${edge.from}`, fs.existsSync(abs));
  const text = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  check(`edge ${edge.from} -> ${edge.to}`, text.includes(edge.expect));
  check(`edge target exists ${edge.to}`, fs.existsSync(path.join(ROOT, edge.to)));
}

if (errors.length) {
  console.error('FAIL test:dogfood-router');
  for (const err of errors) console.error(' - ' + err);
  process.exit(1);
}

console.log(`PASS test:dogfood-router (${tasks.length} tasks, ${edges.length} edges)`);
