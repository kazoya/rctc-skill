#!/usr/bin/env node
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

function help() {
  console.log('usage: node bin/wait-object.js --lane text|json|image --root <bridge> --id <id> [--brand legal|media] [--batch YYYY-MM-DD] [--wait seconds]');
  console.log('Reads one expected object. Does not send, publish, or retry.');
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function look(root, lane, id, brand, batch) {
  if (lane === 'text') {
    const file = path.join(root, 'response.md');
    if (!fs.existsSync(file)) return { state: 'waiting', path: file };
    const text = fs.readFileSync(file, 'utf8');
    const line = text.split(/\r?\n/).find((row) => row.startsWith('رقم الطلب:'));
    if (!line) return { state: 'waiting', path: file, reason: 'response has no request id' };
    const found = line.slice('رقم الطلب:'.length).trim();
    if (found !== id) return { state: 'waiting', path: file, reason: 'response id is ' + found };
    return { state: 'ready', path: file, kind: 'text' };
  }
  if (lane === 'json') {
    const inbox = path.join(root, 'coordination', 'inbox', id + '.json');
    const outbox = path.join(root, 'coordination', 'outbox', id + '.json');
    if (!fs.existsSync(inbox)) return { state: 'waiting', path: inbox, reason: 'request file is missing' };
    if (!fs.existsSync(outbox)) return { state: 'waiting', path: outbox };
    let body;
    try { body = JSON.parse(fs.readFileSync(outbox, 'utf8')); }
    catch (err) { return { state: 'waiting', path: outbox, reason: 'json is not readable yet' }; }
    const want = sha256(inbox);
    if (body.request_sha256 !== want) return { state: 'waiting', path: outbox, reason: 'sha256 does not match the request bytes' };
    return { state: 'ready', path: outbox, kind: 'json', status: body.status || '' };
  }
  if (lane === 'image') {
    const folder = path.join(root, 'image_lane', 'batch-' + batch, brand);
    const png = path.join(folder, id + '.png');
    if (fs.existsSync(png) && fs.statSync(png).size > 10000) return { state: 'ready', path: png, kind: 'image' };
    const report = path.join(root, 'image_lane', 'batch-' + batch, 'report.json');
    if (fs.existsSync(report)) {
      try {
        const body = JSON.parse(fs.readFileSync(report, 'utf8'));
        if (body && body.stopped) return { state: 'stopped', path: report, reason: body.stopped, available_at: body.available_at || '' };
      } catch { /* report still being written */ }
    }
    return { state: 'waiting', path: png };
  }
  return { state: 'stopped', reason: 'lane must be text, json, or image' };
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    help();
    return;
  }
  const lane = arg('lane');
  const root = arg('root');
  const id = arg('id');
  const brand = arg('brand', 'legal');
  const batch = arg('batch', '2026-10-14');
  const wait = Number(arg('wait', '0'));
  if (!lane || !root || !id) {
    help();
    process.exitCode = 1;
    return;
  }
  const deadline = Date.now() + Math.max(0, wait) * 1000;
  let result;
  do {
    result = look(root, lane, id, brand, batch);
    if (result.state !== 'waiting' || Date.now() >= deadline) break;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  } while (Date.now() < deadline);
  console.log(JSON.stringify(result));
  if (result.state !== 'ready') process.exitCode = 2;
}

main();
