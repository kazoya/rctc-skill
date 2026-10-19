#!/usr/bin/env node
/**
 * npm run test:voice-receptionist
 * Feeds the sample payload to the webhook and checks the lead it writes.
 * Built-ins only; uses a temp dir, never touches webhook/data/.
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { createServer, toLead, validatePayload, normalizePhone, CSV_COLUMNS } = require('../webhook/server.js');

const HERE = path.join(__dirname, '..');
const payload = JSON.parse(fs.readFileSync(path.join(HERE, 'samples', 'call-ended.payload.json'), 'utf8'));
const expected = JSON.parse(fs.readFileSync(path.join(HERE, 'samples', 'expected-lead.json'), 'utf8'));

function post(port, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = http.request(
      { host: '127.0.0.1', port, path: '/webhook/call-ended', method: 'POST',
        headers: { 'content-type': 'application/json', 'content-length': data.length, ...headers } },
      (res) => {
        let out = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (out += c));
        res.on('end', () => resolve({ status: res.statusCode, body: out ? JSON.parse(out) : null }));
      }
    );
    req.on('error', reject);
    req.end(data);
  });
}

function listen(server) {
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port)));
}

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push(['PASS', name]);
  } catch (err) {
    results.push(['FAIL', name, err.message]);
  }
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-receptionist-'));
  const server = createServer({ leadsDir: dir, secret: '' });
  const port = await listen(server);

  await check('sample payload is valid', () => assert.deepStrictEqual(validatePayload(payload), []));
  await check('toLead(sample) equals expected-lead.json', () => assert.deepStrictEqual(toLead(payload), expected));
  await check('Jordan phone formats normalise to E.164', () => {
    assert.strictEqual(normalizePhone('079 000 0001'), '+962790000001');
    assert.strictEqual(normalizePhone('00962790000001'), '+962790000001');
    assert.strictEqual(normalizePhone('962790000001'), '+962790000001');
    assert.strictEqual(normalizePhone('12'), null);
  });

  await check('POST sample -> 201 and lead written to JSON + CSV', async () => {
    const r = await post(port, payload);
    assert.strictEqual(r.status, 201, JSON.stringify(r.body));
    const leads = JSON.parse(fs.readFileSync(path.join(dir, 'leads.json'), 'utf8'));
    assert.strictEqual(leads.length, 1);
    assert.deepStrictEqual(leads[0], expected);
    const csv = fs.readFileSync(path.join(dir, 'leads.csv'), 'utf8').trim().split('\n');
    assert.strictEqual(csv[0], CSV_COLUMNS.join(','));
    assert.strictEqual(csv.length, 2);
    assert.ok(csv[1].startsWith('lead_call_demo_0001,'));
  });

  await check('retry of same call is idempotent (200, no duplicate)', async () => {
    const r = await post(port, payload);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.created, false);
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'leads.json'), 'utf8')).length, 1);
  });

  await check('missing name on booking -> 422 with reason', async () => {
    const bad = JSON.parse(JSON.stringify(payload));
    bad.call.id = 'call_demo_bad';
    delete bad.extracted.name;
    const r = await post(port, bad);
    assert.strictEqual(r.status, 422);
    assert.ok(r.body.details.some((d) => d.includes('name')));
  });

  await check('missing consent flag -> 422', async () => {
    const bad = JSON.parse(JSON.stringify(payload));
    delete bad.extracted.consent_to_contact;
    assert.strictEqual((await post(port, bad)).status, 422);
  });

  await check('broken JSON -> 400', async () => assert.strictEqual((await post(port, '{nope')).status, 400));
  server.close();

  await check('WEBHOOK_SECRET: unsigned -> 401, signed -> 201', async () => {
    const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-receptionist-sig-'));
    const s2 = createServer({ leadsDir: dir2, secret: 'test-secret' });
    const p2 = await listen(s2);
    try {
      assert.strictEqual((await post(p2, payload)).status, 401);
      const raw = JSON.stringify(payload);
      const sig = 'sha256=' + crypto.createHmac('sha256', 'test-secret').update(raw).digest('hex');
      assert.strictEqual((await post(p2, raw, { 'x-signature': sig })).status, 201);
    } finally {
      s2.close();
      fs.rmSync(dir2, { recursive: true, force: true });
    }
  });

  fs.rmSync(dir, { recursive: true, force: true });
  for (const r of results) console.log(r.join(' — '));
  const failed = results.filter((r) => r[0] === 'FAIL').length;
  console.log(`${failed ? 'FAIL' : 'PASS'} test:voice-receptionist (${results.length - failed}/${results.length})`);
  process.exit(failed ? 1 : 0);
})();
