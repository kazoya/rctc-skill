#!/usr/bin/env node
/**
 * Voice receptionist -> mock CRM webhook receiver.
 *
 * Zero dependencies (Node >= 18 built-ins only).
 *
 *   node examples/voice-receptionist/webhook/server.js
 *   POST http://localhost:8787/webhook/call-ended   (JSON body, see ../samples/call-ended.payload.json)
 *
 * It validates the post-call payload, turns it into one lead, and appends it to
 * data/leads.json + data/leads.csv. That pair is the "CRM". Swap writeLead() for
 * your real CRM / calendar call when you go live.
 *
 * Env:
 *   PORT            default 8787
 *   LEADS_DIR       default ./data next to this file
 *   WEBHOOK_SECRET  optional; when set, requests must carry
 *                   x-signature: sha256=<hex HMAC-SHA256 of the raw body>
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const INTENTS = new Set(['book_appointment', 'faq', 'callback', 'other']);
const LANGS = new Set(['ar', 'en']);
const MAX_BODY = 256 * 1024;
const CSV_COLUMNS = [
  'lead_id', 'created_at', 'name', 'phone', 'language', 'intent', 'service',
  'preferred_time', 'consent_to_contact', 'needs_human', 'summary', 'source_call_id',
];

/** Jordan-first phone normalisation to E.164. Returns null when it cannot. */
function normalizePhone(raw) {
  if (raw == null) return null;
  let d = String(raw).replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = '+' + d.slice(2);
  if (d.startsWith('+')) return /^\+\d{8,15}$/.test(d) ? d : null;
  if (/^07\d{8}$/.test(d)) return '+962' + d.slice(1); // 079 / 078 / 077 mobile
  if (/^9627\d{8}$/.test(d)) return '+' + d;
  return null;
}

function isIsoDate(v) {
  return typeof v === 'string' && !Number.isNaN(Date.parse(v));
}

/** Returns an array of human-readable problems. Empty array = valid. */
function validatePayload(p) {
  const errors = [];
  if (!p || typeof p !== 'object' || Array.isArray(p)) return ['body must be a JSON object'];
  if (p.event !== 'call_ended') errors.push('event must be "call_ended"');
  const call = p.call;
  if (!call || typeof call !== 'object') {
    errors.push('call object is required');
  } else {
    if (typeof call.id !== 'string' || !call.id.trim()) errors.push('call.id is required');
    if (!isIsoDate(call.ended_at)) errors.push('call.ended_at must be an ISO timestamp');
    if (call.language != null && !LANGS.has(call.language)) errors.push('call.language must be "ar" or "en"');
  }
  const x = p.extracted;
  if (!x || typeof x !== 'object') {
    errors.push('extracted object is required');
  } else {
    if (!INTENTS.has(x.intent)) errors.push('extracted.intent must be one of ' + [...INTENTS].join(', '));
    const phone = normalizePhone(x.phone != null ? x.phone : call && call.from);
    if (!phone) errors.push('a valid phone is required (extracted.phone or call.from)');
    if (x.intent === 'book_appointment' && !(typeof x.name === 'string' && x.name.trim())) {
      errors.push('extracted.name is required for book_appointment');
    }
    if (typeof x.consent_to_contact !== 'boolean') errors.push('extracted.consent_to_contact must be true or false');
  }
  return errors;
}

/** Pure mapping: valid payload -> lead record. Deterministic (no clock, no random). */
function toLead(p) {
  const x = p.extracted;
  const clean = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  return {
    lead_id: 'lead_' + p.call.id,
    created_at: new Date(p.call.ended_at).toISOString(),
    name: clean(x.name),
    phone: normalizePhone(x.phone != null ? x.phone : p.call.from),
    language: p.call.language || 'ar',
    intent: x.intent,
    service: clean(x.service),
    preferred_time: clean(x.preferred_time),
    consent_to_contact: x.consent_to_contact,
    needs_human: Boolean(x.needs_human),
    summary: clean(x.summary),
    source_call_id: p.call.id,
  };
}

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** Mock CRM write. Idempotent on lead_id because providers retry webhooks. */
function writeLead(lead, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, 'leads.json');
  const csvPath = path.join(dir, 'leads.csv');
  const leads = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : [];
  if (leads.some((l) => l.lead_id === lead.lead_id)) return { created: false, lead };
  leads.push(lead);
  fs.writeFileSync(jsonPath, JSON.stringify(leads, null, 2) + '\n');
  if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath, CSV_COLUMNS.join(',') + '\n');
  fs.appendFileSync(csvPath, CSV_COLUMNS.map((c) => csvCell(lead[c])).join(',') + '\n');
  return { created: true, lead };
}

function signatureOk(raw, header, secret) {
  if (!secret) return true;
  if (typeof header !== 'string' || !header.startsWith('sha256=')) return false;
  const want = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const got = header.slice(7);
  return got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

function createServer(opts = {}) {
  const dir = opts.leadsDir || process.env.LEADS_DIR || path.join(__dirname, 'data');
  const secret = opts.secret !== undefined ? opts.secret : process.env.WEBHOOK_SECRET || '';
  const send = (res, code, obj) => {
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(obj));
  };
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
    if (req.method !== 'POST' || req.url !== '/webhook/call-ended') return send(res, 404, { error: 'not found' });
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        send(res, 413, { error: 'payload too large' });
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      if (res.writableEnded) return;
      const raw = Buffer.concat(chunks);
      if (!signatureOk(raw, req.headers['x-signature'], secret)) return send(res, 401, { error: 'bad signature' });
      let payload;
      try {
        payload = JSON.parse(raw.toString('utf8'));
      } catch {
        return send(res, 400, { error: 'invalid JSON' });
      }
      const errors = validatePayload(payload);
      if (errors.length) return send(res, 422, { error: 'invalid payload', details: errors });
      try {
        const out = writeLead(toLead(payload), dir);
        return send(res, out.created ? 201 : 200, { ok: true, created: out.created, lead_id: out.lead.lead_id });
      } catch (err) {
        return send(res, 500, { error: 'crm write failed', detail: String(err.message || err) });
      }
    });
  });
}

module.exports = { normalizePhone, validatePayload, toLead, writeLead, signatureOk, createServer, CSV_COLUMNS };

if (require.main === module) {
  const port = Number(process.env.PORT) || 8787;
  createServer().listen(port, () => {
    console.log(`voice-receptionist webhook on http://localhost:${port}/webhook/call-ended`);
  });
}
