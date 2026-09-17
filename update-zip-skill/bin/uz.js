#!/usr/bin/env node
'use strict';
/**
 * مهارة التطوير والضغط — واجهة الأوامر.
 *
 *   node bin/uz.js harvest        حصاد الحقائق الحيّة
 *   node bin/uz.js pack           جمع + ضغط + طباعة نصّ الطلب   (الافتراضي)
 *   node bin/uz.js cycle          حصاد ثم ضغط
 *   node bin/uz.js send           ضغط ثم إرسال عبر جسر ChatGPT (ملف risha360-social فقط)
 *   node bin/uz.js ingest <zip|dir>   تطبيق حزمة التحسين العائدة
 *
 * ملفات التعريف (profiles): `--profile <name>` أو المتغير UZ_PROFILE.
 *   risha360-social  (الافتراضي)  حساب ريشة 360 القانونية — src/
 *   portfolio-site                 موقع المحفظة (Next.js على Vercel) — profiles/portfolio-site/
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(ROOT, 'out', 'live-latest.json');

function say(s = '') { process.stdout.write(s + '\n'); }

/** تحليل الوسائط: الأمر الأول، ثم --profile / --root وما تبقّى موضعي. */
function parseArgs(argv) {
  const out = { cmd: null, positional: [], profile: process.env.UZ_PROFILE || 'risha360-social', root: null, apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--profile') out.profile = argv[++i];
    else if (a.startsWith('--profile=')) out.profile = a.slice(10);
    else if (a === '--root') out.root = argv[++i];
    else if (a.startsWith('--root=')) out.root = a.slice(7);
    else if (a === '--apply') out.apply = true;
    else if (a === '--dry-run') out.apply = false;
    else if (!out.cmd) out.cmd = a;
    else out.positional.push(a);
  }
  out.cmd = out.cmd || 'pack';
  return out;
}

/* ============================== risha360-social (الأصل) ============================== */

/**
 * عيّنة تصاميم حديثة — ليرى المستشار أسلوبنا البصري لا ليتصفّح الأرشيف.
 * تُلغى التكرارات بالموضوع لا بالملف: التصميم الواحد يُصدَّر بثلاث مقاسات.
 */
function recentDesigns(limit = 6) {
  const dirs = ['D:/projects/chatGPT/output/tiktok', 'D:/projects/chatGPT/output/facebook'];
  const all = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!/\.png$/i.test(f)) continue;
      const p = path.join(d, f);
      const topic = f.replace(/_(feed|story)_\d+x\d+\.png$/i, '');
      all.push({ p, topic, t: fs.statSync(p).mtimeMs });
    }
  }
  all.sort((a, b) => b.t - a.t);
  const seen = new Set(), out = [];
  for (const x of all) {
    if (seen.has(x.topic)) continue;
    seen.add(x.topic); out.push(x.p);
    if (out.length >= limit) break;
  }
  return out;
}

async function cmdHarvest() {
  say('▸ حصاد أرقام التفاعل الحيّة…');
  const { harvest } = require('../src/harvest');
  const live = await harvest();
  if (live.error) { say('✗ ' + live.error); process.exitCode = 1; return null; }
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(live, null, 1), 'utf8');
  const tt = live.sources.tiktok || {};
  say(`  تيك توك: ${tt.clips ?? '—'} مقطعًا · ${tt.totalViews ?? '—'} مشاهدة · الوسيط ${tt.medianViews ?? '—'}`);
  for (const f of live.sources.followers || []) {
    say(`  ${f.platform.padEnd(10)} متابعون: ${f.followers ?? '— ' + (f.unavailable || '')}`);
  }
  say(`  حُفظ: ${CACHE}`);
  return live;
}

function cmdPack(live) {
  say('▸ جمع الحقائق…');
  const { collect } = require('../src/collect');
  const facts = collect();
  say(`  ${facts.totals.published} منشورًا · ${facts.failures.length} نمط عطل · ${facts.learning.length} حدث تعلّم`);

  if (!live && fs.existsSync(CACHE)) {
    live = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    say('  استُخدمت أرقام الحصاد المحفوظة (' + live.harvestedAt.slice(0, 16) + ')');
  }
  if (!live) say('  ⚠ بلا أرقام تفاعل — شغّل `harvest` أولًا وإلا عادت النصائح عامة');

  const { pack } = require('../src/pack');
  const r = pack({ facts, live, sampleImages: recentDesigns() });
  say(`\n✔ الحزمة جاهزة:\n   ${r.zip}\n   ${(r.bytes / 1024).toFixed(0)} كيلوبايت`);
  say(`\n▸ أرسلها إلى ChatGPT مع هذا النصّ:\n`);
  say('   «مرفق ملف مضغوط لأداء حساب قانوني سعودي. اقرأ SUMMARY.md ثم CONSTRAINTS.md');
  say('   (وهي ملزمة)، ونفّذ ما في ASK.md حرفيًا: أعد مجلد IMPROVE بالملفات السبعة');
  say('   بأسمائها المذكورة. لا توصيات عامة، ولا شيء يخالف القيود.»');
  return r;
}

async function cmdSend() {
  const r = cmdPack(null);
  say('\n▸ الإرسال عبر جسر ChatGPT…');
  const { sendToBridge } = require('../src/bridge');
  const res = await sendToBridge(r.zip);
  say(res.ok ? `✔ أُرسل — ${res.note || ''}` : `✗ ${res.error}`);
}

function cmdIngest(dir, { apply = false } = {}) {
  if (!dir) { say('✗ حدّد مجلد IMPROVE العائد'); process.exitCode = 1; return; }
  const { ingest } = require('../src/ingest');
  const r = ingest(dir, { apply });
  say(r.report);
}

async function runDefault(a) {
  if (a.cmd === 'harvest') await cmdHarvest();
  else if (a.cmd === 'pack') cmdPack(null);
  else if (a.cmd === 'cycle') {
    const live = await cmdHarvest();
    if (live) cmdPack(live);
    else say('✗ أُوقفت الدورة لأن الحصاد لم ينجح. استخدم `pack` صراحةً فقط إذا قبلت حزمة بلا أرقام حيّة.');
  }
  else if (a.cmd === 'send') await cmdSend();
  else if (a.cmd === 'ingest') cmdIngest(a.positional[0], { apply: a.apply });
  else if (a.cmd === 'profiles') {
    const extra = fs.existsSync(path.join(ROOT, 'profiles')) ? fs.readdirSync(path.join(ROOT, 'profiles')).sort() : [];
    say(['risha360-social', ...extra].join('\n'));
  }
  else if (a.cmd === 'help' || a.cmd === '--help' || a.cmd === '-h') {
    say('أوامر: harvest | pack | cycle | send | ingest <dir> | profiles');
    say('خيارات: --profile <name>  --root <dir>  --apply (للجدول بعد التحقق؛ الافتراضي مراجعة فقط)');
  }
  else { say('أوامر: harvest | pack | cycle | send | ingest <dir> | profiles   [--profile <name>] [--root <dir>] [--apply]'); process.exitCode = 1; }
}

/* ================================ ملفات التعريف الأخرى ================================ */

async function runProfile(a) {
  const dir = path.join(ROOT, 'profiles', a.profile);
  if (!fs.existsSync(path.join(dir, 'index.js'))) {
    say(`✗ ملف تعريف غير معروف: ${a.profile}. المتاح: risha360-social, ${fs.existsSync(path.join(ROOT, 'profiles')) ? fs.readdirSync(path.join(ROOT, 'profiles')).join(', ') : '—'}`);
    process.exitCode = 1; return;
  }
  const p = require(dir);
  const opts = { root: a.root };
  say(`▸ ملف التعريف: ${a.profile}`);
  if (a.cmd === 'harvest') await p.harvest(opts);
  else if (a.cmd === 'pack' || a.cmd === 'cycle') {
    if (a.cmd === 'cycle') await p.harvest(opts);
    const r = p.pack(opts);
    say(`\n✔ الحزمة جاهزة:\n   ${r.zip}\n   ${(r.bytes / 1024).toFixed(0)} كيلوبايت`);
    say(`\n▸ أرسلها إلى المستشار مع هذا النصّ:\n\n${p.REQUEST_TEXT}`);
  } else if (a.cmd === 'send') { say('✗ الإرسال المباشر متاح لملف risha360-social فقط؛ استخدم pack وأرسل الملف بنفسك'); process.exitCode = 1; }
  else if (a.cmd === 'ingest') { const r = p.ingest(a.positional[0], opts); say(r.report); if (!r.ok) process.exitCode = 1; }
  else { say('أوامر: harvest | pack | cycle | ingest <zip|dir>   [--profile <name>] [--root <dir>]'); process.exitCode = 1; }
}

(async () => {
  const a = parseArgs(process.argv.slice(2));
  if (a.profile === 'risha360-social') await runDefault(a); else await runProfile(a);
})().catch(e => { say('✗ ' + (e && e.message ? e.message : String(e))); process.exitCode = 1; });
