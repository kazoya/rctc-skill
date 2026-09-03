'use strict';
/**
 * Master Brain — shared utilities (zero dependencies).
 * fs helpers, ids, slugs, dates, frontmatter, argv parsing.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BOM = String.fromCharCode(0xFEFF);
function stripBom(t) { return t && t.charCodeAt(0) === 0xFEFF ? t.slice(1) : t; }

// ---------- filesystem ----------
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); return p; }
function readText(p, fallback = null) { try { return stripBom(fs.readFileSync(p, 'utf8')); } catch { return fallback; } }
function writeText(p, text) { ensureDir(path.dirname(p)); fs.writeFileSync(p, text, 'utf8'); return p; }
function readJson(p, fallback = null) {
  const t = readText(p);
  if (t == null) return fallback;
  try { return JSON.parse(t); } catch (e) { throw new Error(`Invalid JSON in ${p}: ${e.message}`); }
}
function writeJson(p, obj) { return writeText(p, JSON.stringify(obj, null, 2) + '\n'); }
function listDirs(p) { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return []; } }
function listFiles(p, ext) { try { return fs.readdirSync(p).filter(f => !ext || f.toLowerCase().endsWith(ext)).sort(); } catch { return []; } }

// ---------- ids / slugs ----------
function shortId(prefix = '') { return (prefix ? prefix + '-' : '') + crypto.randomBytes(4).toString('hex'); }
function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')   // keep latin letters/digits + arabic letters
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'project';
}
function isSafeId(id) { return /^[a-z0-9][a-z0-9._-]{0,63}$/i.test(id); }

// ---------- dates ----------
function nowIso() { return new Date().toISOString(); }
function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  const s = String(v).trim();
  // Accept YYYY-MM-DD, YYYY-MM-DDTHH:mm, full ISO
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T00:00:00' : s);
  return isNaN(d) ? null : d;
}
function endOfDay(v) {
  const d = toDate(v); if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(v).trim())) d.setHours(23, 59, 59, 999);
  return d;
}
function fmtDate(v, tz = 'Asia/Riyadh', withTime = true) {
  const d = toDate(v); if (!d) return '';
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(d).reduce((a, p) => (a[p.type] = p.value, a), {});
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    return withTime ? `${date} ${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}` : date;
  } catch { return d.toISOString().slice(0, withTime ? 16 : 10).replace('T', ' '); }
}
function dateStamp(v, tz = 'Asia/Riyadh') { return fmtDate(v, tz, true).replace(/[^0-9]/g, '').slice(0, 12); } // YYYYMMDDHHmm
function daysBetween(a, b) { const da = toDate(a), db = toDate(b); if (!da || !db) return null; return Math.floor((db - da) / 86400000); }

// ---------- frontmatter (simple key: value) ----------
function parseFrontmatter(text) {
  const src = stripBom(String(text || ''));
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: src.trim() };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!mm) continue;
    let val = mm[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      try { val = JSON.parse(val); } catch { val = val.slice(1, -1); }
    }
    meta[mm[1]] = val;
  }
  return { meta, body: m[2].trim() };
}
function buildFrontmatter(meta, body) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined || v === null || v === '') continue;
    const s = Array.isArray(v) ? v.join(', ') : String(v);
    lines.push(`${k}: ${/[:#\n"]/.test(s) ? JSON.stringify(s) : s}`);
  }
  lines.push('---', '', body || '', '');
  return lines.join('\n');
}

// ---------- argv ----------
/** parse ['cmd','sub','--key','value','--flag'] → { _: ['cmd','sub'], key:'value', flag:true } */
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > -1) { out[a.slice(2, eq)] = a.slice(eq + 1); continue; }
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { out[key] = next; i++; } else out[key] = true;
    } else out._.push(a);
  }
  return out;
}

// ---------- misc ----------
function clampInt(v, min, max, dflt) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
/** XML escape + drop control characters that XML 1.0 forbids (keeps tab/LF/CR). */
function escapeXml(s) {
  const src = String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let out = '';
  for (const ch of src) {
    const c = ch.charCodeAt(0);
    if (c < 32 && c !== 9 && c !== 10 && c !== 13) continue;
    out += ch;
  }
  return out;
}
function csv(list) { return String(list || '').split(',').map(s => s.trim()).filter(Boolean); }
function pick(obj, keys) { const o = {}; for (const k of keys) if (obj[k] !== undefined) o[k] = obj[k]; return o; }
function localized(v, lang) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[lang] || v.ar || v.en || Object.values(v)[0] || '';
}

module.exports = {
  BOM, stripBom,
  exists, isDir, ensureDir, readText, writeText, readJson, writeJson, listDirs, listFiles,
  shortId, slugify, isSafeId,
  nowIso, toDate, endOfDay, fmtDate, dateStamp, daysBetween,
  parseFrontmatter, buildFrontmatter, parseArgs,
  clampInt, escapeHtml, escapeXml, csv, pick, localized,
};
