'use strict';
/**
 * ملف تعريف «PtreeLink» — الدورة نفسها (حصاد → ضغط → استشارة → استيعاب) على مشروع
 * Next.js + Drizzle/RLS يتبع بنية PtreeLink (docs/blueprint + EXECUTION_PLAN + WORKLOG + ADRs).
 *
 * الحقائق هنا قياسات من المستودع نفسه وبلا شبكة: git، package.json، حالة الخطة، آخر WORKLOG،
 * الجداول والسياسات والـmigrations والـroutes والاختبارات، ونتائج بوابات الجودة إن شُغِّلت
 * (UZ_GATES=1) أو وُجد سجل محفوظ. الاستيعاب: `05-backlog.json` يُلحق بـ docs/IMPROVE-BACKLOG.md
 * بعد تحقق؛ النصوص إلى review/؛ وملفات الكود (إن وُجدت) إلى فرع مراجعة ثم بوابات — لا كتابة في main.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawnSync } = require('node:child_process');

const SKILL_ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(SKILL_ROOT, 'out');
const CACHE = path.join(OUT, 'ptreelink-live-latest.json');
const REVIEW = path.join(SKILL_ROOT, 'review');
const HERE = __dirname;

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.data', 'out', 'test-results', 'playwright-report', '.vercel', 'files', 'journal']);
const ALLOWED_OVERLAY = ['src', 'tests', 'messages', 'drizzle', 'docs', 'scripts', 'public', 'package.json', 'playwright.config.ts', 'vitest.config.ts', 'tsconfig.json', 'eslint.config.mjs', 'next.config.ts', 'postcss.config.mjs', 'drizzle.config.ts'];
const AREAS = ['ux', 'search', 'security', 'data', 'dx', 'growth'];
const EXPECTED = ['REPORT.md', '01-diagnosis.md', '02-ux.md', '03-search-matching.md', '04-security-privacy.md', '05-backlog.json', '06-experiments.md', '07-next-slice-plan.md'];

function say(s = '') { process.stdout.write(s + '\n'); }
function stamp() { return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-'); }
const read = (p, max = 120000) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8').slice(0, max) : null);

/** جذر المشروع: --root أو UZ_ROOT أو المجلد الحالي، ويجب أن يكون مشروع Node بـ docs/. */
function projectRoot(opts = {}) {
  const root = path.resolve(opts.root || process.env.UZ_ROOT || process.cwd());
  if (!fs.existsSync(path.join(root, 'package.json'))) throw new Error(`لا package.json في ${root} — شغّل الأمر من جذر المشروع أو مرّر --root`);
  if (!fs.existsSync(path.join(root, 'docs'))) throw new Error(`لا مجلد docs/ في ${root} — هذا الملف يتوقع بنية PtreeLink (docs/EXECUTION_PLAN.md, docs/WORKLOG.md)`);
  return root;
}

function git(root, args) {
  try { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true }).trim(); } catch { return ''; }
}

function walk(dir, root, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (SKIP_DIRS.has(e.name)) continue; walk(p, root, acc); }
    else {
      if (/^\.env(?!\.example)/.test(e.name) || /\.(pem|key|p12)$/i.test(e.name)) continue;
      if (fs.statSync(p).size > 15 * 1024 * 1024) continue;
      acc.push(p);
    }
  }
  return acc;
}

/* ------------------------------------------------------------------ harvest */

function planStatus(md) {
  if (!md) return null;
  const count = { done: 0, partial: 0, doing: 0, todo: 0, blocked: 0 };
  const items = [];
  for (const r of md.split('\n').filter(l => /^\|\s*S?\d/.test(l))) {
    const cells = r.split('|').map(c => c.trim());
    const status = cells[cells.length - 2] || '';
    const key = /DONE-PARTIAL|DONE-BASIC/.test(status) ? 'partial' : /DONE/.test(status) ? 'done' : /DOING/.test(status) ? 'doing' : /BLOCKED/.test(status) ? 'blocked' : 'todo';
    count[key]++;
    items.push({ id: cells[1], step: cells[2], status });
  }
  return { count, items };
}

/** pnpm: الأسماء من قائمة ثابتة (typecheck/lint/test) فلا خطر تسلسل؛ على ويندوز عبر cmd /c لأن pnpm ملف .cmd. */
function pnpm(root, args) {
  const safe = args.filter(a => /^[a-z:-]+$/.test(a));
  if (process.platform === 'win32') return spawnSync('cmd.exe', ['/d', '/s', '/c', `pnpm -s ${safe.join(' ')}`], { cwd: root, encoding: 'utf8', windowsHide: true });
  return spawnSync('pnpm', ['-s', ...safe], { cwd: root, encoding: 'utf8', windowsHide: true });
}

function runGates(root) {
  const gate = name => {
    const t0 = Date.now();
    const r = pnpm(root, [name]);
    const txt = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').filter(Boolean);
    return { name, ok: r.status === 0, ms: Date.now() - t0, tail: txt.slice(-5).join(' | ').slice(0, 400) };
  };
  return { ranAt: new Date().toISOString(), results: ['typecheck', 'lint', 'test'].map(gate) };
}

async function harvest(opts = {}) {
  const root = projectRoot(opts);
  say('▸ حصاد حقائق PtreeLink…');
  const pkg = JSON.parse(read(path.join(root, 'package.json')) || '{}');
  const schemaDir = path.join(root, 'src', 'db', 'schema');
  const schemaFiles = fs.existsSync(schemaDir) ? walk(schemaDir, root) : [];
  const tables = schemaFiles.flatMap(f => [...(read(f) || '').matchAll(/pgTable\(\s*"([^"]+)"/g)].map(m => m[1]));
  const policies = schemaFiles.reduce((n, f) => n + ((read(f) || '').match(/pgPolicy\(/g) || []).length, 0);
  const appDir = path.join(root, 'src', 'app');
  const routes = fs.existsSync(appDir) ? walk(appDir, root).filter(p => /page\.tsx$|route\.ts$/.test(p)).map(p => path.relative(appDir, p).replace(/\\/g, '/')) : [];
  const testsDir = path.join(root, 'tests');
  const tests = fs.existsSync(testsDir) ? walk(testsDir, root).filter(p => /\.(test|spec)\.ts$/.test(p)).map(p => path.relative(root, p).replace(/\\/g, '/')) : [];
  const migrations = fs.existsSync(path.join(root, 'drizzle')) ? fs.readdirSync(path.join(root, 'drizzle')).filter(f => f.endsWith('.sql')) : [];
  const worklog = read(path.join(root, 'docs', 'WORKLOG.md'));

  let gates = null;
  if (process.env.UZ_GATES === '1') { say('  تشغيل بوابات الجودة (typecheck/lint/test)…'); gates = runGates(root); }
  else if (fs.existsSync(CACHE)) { try { gates = JSON.parse(fs.readFileSync(CACHE, 'utf8')).gates || null; } catch { gates = null; } }

  const live = {
    profile: 'ptreelink',
    harvestedAt: new Date().toISOString(),
    root,
    project: { name: pkg.name || path.basename(root), scripts: Object.keys(pkg.scripts || {}), deps: Object.keys(pkg.dependencies || {}), devDeps: Object.keys(pkg.devDependencies || {}) },
    git: { head: git(root, ['rev-parse', '--short', 'HEAD']), branch: git(root, ['rev-parse', '--abbrev-ref', 'HEAD']), dirty: git(root, ['status', '--porcelain']).split('\n').filter(Boolean).length, recent: git(root, ['log', '--oneline', '-30']).split('\n').filter(Boolean), lastCommitAt: git(root, ['log', '-1', '--format=%cI']) },
    plan: planStatus(read(path.join(root, 'docs', 'EXECUTION_PLAN.md'))),
    worklogTail: worklog ? worklog.split('\n').slice(-140).join('\n') : null,
    schema: { tables, policies, migrations },
    routes,
    tests: { files: tests.length, list: tests },
    gates,
    screenshots: fs.existsSync(path.join(root, 'docs', 'screenshots')) ? fs.readdirSync(path.join(root, 'docs', 'screenshots')).filter(f => /\.png$/i.test(f)).sort() : [],
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(live, null, 1), 'utf8');
  say(`  ${live.project.name} @ ${live.git.head} (${live.git.branch}) · ${live.git.dirty} ملفًا غير ملتزم`);
  say(`  الخطة: ${live.plan ? `DONE ${live.plan.count.done} · جزئي ${live.plan.count.partial} · TODO ${live.plan.count.todo}` : '—'} · ${tables.length} جدولًا · ${policies} سياسة RLS · ${routes.length} routes · ${tests.length} ملف اختبار`);
  say(`  البوابات: ${gates ? gates.results.map(r => `${r.name}=${r.ok ? '✓' : '✗'}`).join(' ') + ` (${gates.ranAt.slice(0, 16)})` : 'لم تُشغَّل — اضبط UZ_GATES=1 لتضمين نتائج حقيقية'}`);
  say(`  حُفظ: ${CACHE}`);
  return live;
}

/* --------------------------------------------------------------------- pack */

function summaryMd(live) {
  const gates = live.gates
    ? live.gates.results.map(r => `| ${r.name} | ${r.ok ? '✅' : '❌'} | ${(r.ms / 1000).toFixed(0)}s | ${r.tail.replace(/\|/g, '/')} |`).join('\n')
    : '| — | لم تُشغَّل | — | شغّل harvest مع UZ_GATES=1 |';
  const plan = live.plan ? live.plan.items.map(i => `| ${i.id} | ${String(i.step).replace(/\|/g, '/')} | ${i.status} |`).join('\n') : '| — | لا خطة | — |';
  return `# موجز حالة ${live.project.name} — ${live.harvestedAt.slice(0, 16)}

**المستودع:** \`${live.git.head}\` على \`${live.git.branch}\` · آخر commit ${live.git.lastCommitAt} · ملفات غير ملتزمة: ${live.git.dirty}

## ١) بوابات الجودة كما قيست
| البوابة | النتيجة | الزمن | آخر سطور |
|---|---|---|---|
${gates}

## ٢) حالة الخطة (${live.plan ? `${live.plan.count.done} DONE · ${live.plan.count.partial} جزئي · ${live.plan.count.todo} TODO` : '—'})
| # | الخطوة | الحالة |
|---|---|---|
${plan}

## ٣) البنية المقيسة
- الجداول (${live.schema.tables.length}): ${live.schema.tables.join(', ')}
- سياسات RLS: ${live.schema.policies} · migrations: ${live.schema.migrations.join(', ')}
- Routes (${live.routes.length}): ${live.routes.join(' · ')}
- اختبارات (${live.tests.files}): ${live.tests.list.join(' · ')}
- التبعيات: ${live.project.deps.join(', ')}

## ٤) آخر ${live.git.recent.length} commits
\`\`\`
${live.git.recent.join('\n')}
\`\`\`

## ٥) آخر ما في سجل الأدلة (docs/WORKLOG.md)
${live.worklogTail ? '```\n' + live.worklogTail.slice(-6000) + '\n```' : '_لا WORKLOG.md_'}

> **القراءة المطلوبة من المستشار:** ابنِ كل استنتاج على صف من الجداول أعلاه أو سطر من WORKLOG، واذكره.
`;
}

function pack(opts = {}) {
  const root = projectRoot(opts);
  let live = null;
  if (fs.existsSync(CACHE)) { live = JSON.parse(fs.readFileSync(CACHE, 'utf8')); say('  استُخدم حصاد محفوظ (' + live.harvestedAt.slice(0, 16) + ')'); }
  if (!live) throw new Error('لا حصاد — شغّل `harvest` أولًا حتى تحمل الحزمة قياسات لا انطباعات');

  const name = `ptreelink-consult-${stamp()}`;
  const stage = path.join(os.tmpdir(), name);
  fs.rmSync(stage, { recursive: true, force: true });
  fs.mkdirSync(stage, { recursive: true });

  fs.writeFileSync(path.join(stage, 'SUMMARY.md'), summaryMd(live), 'utf8');
  const decisions = read(path.join(root, 'docs', 'blueprint', 'DECISIONS.md'));
  fs.writeFileSync(path.join(stage, 'CONSTRAINTS.md'), read(path.join(HERE, 'CONSTRAINTS.md')) + (decisions ? `\n\n---\n\n## القرارات الملزمة كما في المستودع (docs/blueprint/DECISIONS.md)\n\n${decisions}` : ''), 'utf8');
  fs.copyFileSync(path.join(HERE, 'ASK.md'), path.join(stage, 'ASK.md'));
  fs.writeFileSync(path.join(stage, 'FACTS.json'), JSON.stringify(live, null, 1), 'utf8');
  for (const f of ['BRAIN.md', 'README.md']) if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(stage, f));

  const docs = path.join(root, 'docs');
  if (fs.existsSync(docs)) {
    fs.mkdirSync(path.join(stage, 'docs'), { recursive: true });
    for (const p of walk(docs, root)) {
      if (!/\.(md|json|prisma)$/i.test(p)) continue;
      const dst = path.join(stage, 'docs', path.relative(docs, p));
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(p, dst);
    }
    const shots = path.join(docs, 'screenshots');
    if (fs.existsSync(shots)) {
      fs.mkdirSync(path.join(stage, 'screenshots'), { recursive: true });
      for (const f of fs.readdirSync(shots).filter(f => /\.png$/i.test(f)).sort().slice(0, 8)) fs.copyFileSync(path.join(shots, f), path.join(stage, 'screenshots', f));
    }
  }
  for (const p of walk(root, root)) {
    const rel = path.relative(root, p);
    if (rel.startsWith('docs' + path.sep)) continue;
    const dst = path.join(stage, 'source', rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(p, dst);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const zip = path.join(OUT, name + '.zip');
  fs.rmSync(zip, { force: true });
  execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${stage}\\*' -DestinationPath '${zip}' -CompressionLevel Optimal`], { windowsHide: true });
  fs.rmSync(stage, { recursive: true, force: true });
  return { zip, bytes: fs.statSync(zip).size };
}

const REQUEST_TEXT = `«مرفق ملف مضغوط لحالة مشروع PtreeLink (Next.js 16، Drizzle/Postgres مع RLS، عربي RTL وإنجليزي LTR) بقياسات حقيقية.
اقرأ SUMMARY.md ثم CONSTRAINTS.md (وهي ملزمة)، ثم BRAIN.md وdocs/، ونفّذ ما في ASK.md حرفيًا:
أعد مجلد IMPROVE بالملفات الثمانية بأسمائها المذكورة تمامًا. لا توصيات عامة، ولا شيء يخالف القيود،
وكل استنتاج يذكر الصف أو السطر الذي بُني عليه. أي كود يأتي كملفات كاملة تحت IMPROVE/changed-files/.»`;

/* ------------------------------------------------------------------- ingest */

function expand(src) {
  if (fs.statSync(src).isDirectory()) return src;
  const dst = path.join(os.tmpdir(), 'uz-ingest-' + stamp());
  fs.rmSync(dst, { recursive: true, force: true });
  execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -Path '${src}' -DestinationPath '${dst}' -Force`], { windowsHide: true });
  return dst;
}

function findImprove(dir) {
  const has = f => fs.existsSync(path.join(dir, f));
  if (has('05-backlog.json') || has('01-diagnosis.md') || has('changed-files')) return dir;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const r = findImprove(path.join(dir, e.name));
    if (r) return r;
  }
  return null;
}

function validateBacklog(parsed) {
  const notes = [];
  const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
  if (!items.length) notes.push('لا قائمة items');
  const clean = [], seen = new Set();
  for (const it of items) {
    const id = String(it.id || '').trim();
    if (!/^IMP-\d{2,3}$/.test(id)) { notes.push(`عنصر بلا id صالح (IMP-nn): ${JSON.stringify(it).slice(0, 60)}`); continue; }
    if (seen.has(id)) { notes.push(`id مكرر: ${id}`); continue; }
    if (!it.title || !it.acceptance) { notes.push(`${id}: بلا عنوان أو معيار قبول`); continue; }
    const area = AREAS.includes(it.area) ? it.area : (notes.push(`${id}: area غير معروفة (${it.area}) → dx`), 'dx');
    const priority = Number.isInteger(it.priority) && it.priority >= 1 && it.priority <= 5 ? it.priority : 3;
    seen.add(id);
    clean.push({ id, title: String(it.title).slice(0, 160), area, priority, evidence: String(it.evidence || '').slice(0, 400), acceptance: String(it.acceptance).slice(0, 400), files: Array.isArray(it.files) ? it.files.slice(0, 10) : [] });
  }
  if (clean.length > 15) { notes.push(`${clean.length} عنصرًا — اكتُفي بأول 15`); clean.length = 15; }
  return { clean, notes };
}

/** يُلحق بـ docs/IMPROVE-BACKLOG.md — ملف مراجعة، لا يمس الكود ولا Master Brain. */
function appendBacklog(root, clean) {
  const file = path.join(root, 'docs', 'IMPROVE-BACKLOG.md');
  if (!fs.existsSync(file)) fs.writeFileSync(file, '# IMPROVE Backlog (مقترحات خارجية بانتظار الاعتماد)\n', 'utf8');
  fs.appendFileSync(file, [
    `\n## دفعة ${new Date().toISOString().slice(0, 10)}`, '',
    '| ID | الأولوية | المجال | العنوان | معيار القبول | الدليل | الملفات |', '|---|---|---|---|---|---|---|',
    ...clean.map(i => `| ${i.id} | P${i.priority} | ${i.area} | ${i.title.replace(/\|/g, '/')} | ${i.acceptance.replace(/\|/g, '/')} | ${i.evidence.replace(/\|/g, '/')} | ${i.files.join(', ')} |`),
    '', '> مصدر: حزمة IMPROVE خارجية. تُعتمد بنودها بقرار المالك فقط، ثم تُنقل إلى EXECUTION_PLAN.md وتُسجَّل بـ `mb suggest ptreelink`.', '',
  ].join('\n'), 'utf8');
  return path.relative(root, file);
}

function ingest(input, opts = {}) {
  const root = projectRoot(opts);
  if (!input) throw new Error('حدّد ملف IMPROVE المضغوط أو مجلده');
  const lines = [];
  const dir = expand(path.resolve(input));
  const improve = findImprove(dir);
  if (!improve) throw new Error('لا ملفات IMPROVE معروفة داخل الحزمة — الحزمة لا تطابق ASK.md');

  const files = fs.readdirSync(improve).filter(f => /\.(md|json)$/i.test(f)).sort();
  const missing = EXPECTED.filter(f => !files.some(g => g.toLowerCase() === f.toLowerCase()));
  if (missing.length) lines.push(`⚠ ملفات ناقصة: ${missing.join(', ')}`);

  const tag = `improve_${stamp()}`;
  const bucket = path.join(REVIEW, tag);
  fs.mkdirSync(bucket, { recursive: true });
  const copied = [];
  for (const f of files) { if (/^05-backlog\.json$/i.test(f)) continue; fs.copyFileSync(path.join(improve, f), path.join(bucket, f)); copied.push(f); }
  lines.push(`▸ للمراجعة البشرية: ${copied.length} ملفًا في ${bucket}`);

  // الملف الآلي الوحيد
  let ok = true;
  const backlog = files.find(f => /^05-backlog\.json$/i.test(f));
  if (!backlog) lines.push('✗ لا 05-backlog.json — لم يُطبَّق شيء آليًا.');
  else {
    try {
      const { clean, notes } = validateBacklog(JSON.parse(fs.readFileSync(path.join(improve, backlog), 'utf8')));
      if (clean.length) lines.push(`✔ أُلحق ${clean.length} عنصرًا بـ ${appendBacklog(root, clean)}`, ...clean.map(i => `    ${i.id} P${i.priority} [${i.area}] ${i.title}`));
      else { lines.push('✗ لا عنصر صالح في 05-backlog.json'); ok = false; }
      for (const n of notes) lines.push(`    ⚠ ${n}`);
    } catch (e) { lines.push(`✗ 05-backlog.json غير صالح: ${e.message}`); ok = false; }
  }

  // ملفات كود (اختيارية) → فرع مراجعة + بوابات، لا كتابة في main
  const src = path.join(improve, 'changed-files');
  if (fs.existsSync(src)) {
    const dirty = git(root, ['status', '--porcelain']).split('\n').filter(Boolean).length;
    if (dirty) { lines.push(`✗ الشجرة غير نظيفة (${dirty} ملفًا) — لم تُطبَّق ملفات الكود. التزم أو خزّن التغييرات ثم أعد ingest.`); return { ok: false, report: lines.join('\n') }; }
    const branch = `improve/${stamp()}`;
    execFileSync('git', ['-C', root, 'checkout', '-b', branch], { windowsHide: true });
    const applied = [], refused = [];
    for (const p of walk(src, src)) {
      const rel = path.relative(src, p).replace(/\\/g, '/');
      const top = rel.split('/')[0];
      if (!ALLOWED_OVERLAY.includes(top) || rel.startsWith('docs/blueprint/')) { refused.push(rel); continue; }
      const dst = path.join(root, rel);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(p, dst); applied.push(rel);
    }
    lines.push(`▸ فرع المراجعة ${branch}: طُبِّق ${applied.length} ملفًا · رُفض ${refused.length} خارج المسارات المسموحة`);
    for (const r of refused) lines.push(`    ✗ ${r}`);
    lines.push('▸ pnpm typecheck && lint && test …');
    const gates = runGates(root);
    for (const g of gates.results) lines.push(`    ${g.ok ? '✔' : '✗'} ${g.name} — ${g.tail}`);
    ok = ok && gates.results.every(g => g.ok);
    lines.push(ok ? `✔ البوابات خضراء على ${branch}. القرار للمالك: دمج أو حذف الفرع.` : `✗ البوابات فشلت على ${branch}. لا دمج.`);
    lines.push(`  التراجع: git checkout main && git branch -D ${branch}`);
  }
  return { ok, report: lines.join('\n') };
}

module.exports = { harvest, pack, ingest, REQUEST_TEXT, projectRoot };
