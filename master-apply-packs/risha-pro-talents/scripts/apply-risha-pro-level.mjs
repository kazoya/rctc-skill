#!/usr/bin/env node
/**
 * تطبيق حزمة مهارات ريشة برو (مستوى تسويق المواهب) على مشروع master المحلي.
 *
 *   node apply-risha-pro-level.mjs --master E:\master --skills E:\rctc-skill
 *   node apply-risha-pro-level.mjs --master E:\master --skills E:\rctc-skill --apply
 *
 * قواعد صارمة:
 *   - جفاف افتراضي: لا يُكتب شيء بلا --apply.
 *   - لا حذف إطلاقاً.
 *   - لا استبدال لملف قائم إلا مع --force.
 *   - ملفات ذاكرة المستوى (BRAIN/DECISIONS/CROSS-LEVEL-REQUESTS) محمية حتى من --force،
 *     لأنها تحمل عمل المالك؛ استبدالها يحتاج --force-memory صراحةً.
 *   - كل ما يُكتب يُسجَّل في levels/<level>/APPLY-MANIFEST.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACK_ROOT = path.resolve(HERE, '..');

const C = process.stdout.isTTY
  ? { dim: '\x1b[2m', y: '\x1b[33m', g: '\x1b[32m', c: '\x1b[36m', r: '\x1b[31m', x: '\x1b[0m' }
  : { dim: '', y: '', g: '', c: '', r: '', x: '' };

function parseArgs(argv) {
  const out = { master: null, skills: null, level: 'risha-pro-talents', apply: false, force: false, forceMemory: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--master' || a === '-m') out.master = argv[++i];
    else if (a === '--skills' || a === '-s') out.skills = argv[++i];
    else if (a === '--level') out.level = argv[++i];
    else if (a === '--apply') out.apply = true;
    else if (a === '--force') out.force = true;
    else if (a === '--force-memory') { out.force = true; out.forceMemory = true; }
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a.startsWith('--master=')) out.master = a.slice(9);
    else if (a.startsWith('--skills=')) out.skills = a.slice(9);
    else if (a.startsWith('--level=')) out.level = a.slice(8);
    else { out.error = `وسيط غير معروف: ${a}`; }
  }
  return out;
}

const HELP = `
تطبيق حزمة ريشة برو للمواهب على مشروع master

  --master, -m <path>   مسار مشروع master (مثال: E:\\master)            [مطلوب]
  --skills, -s <path>   مسار مستودع المهارات (مثال: E:\\rctc-skill)      [مطلوب]
  --level <id>          معرّف المستوى (افتراضي: risha-pro-talents)
  --apply               نفّذ فعلياً. بدونه: معاينة لا تكتب شيئاً
  --force               اسمح باستبدال ملف قائم (بلا حذف مجلدات)
  --force-memory        اسمح باستبدال ملفات ذاكرة المستوى أيضاً — يمحو عملك المكتوب فيها
`;

const planned = [];
const skipped = [];
let opts;

const step = (t) => console.log(`\n${C.c}== ${t}${C.x}`);
const note = (t) => console.log(`${C.dim}   ${t}${C.x}`);

function act(kind, target, detail = '') {
  planned.push({ kind, target, detail });
  const verb = opts.apply ? `${C.g}WRITE${C.x}` : `${C.y}PLAN ${C.x}`;
  console.log(`${verb} ${kind} -> ${target}`);
}

function skip(target, reason) {
  skipped.push({ target, reason });
  console.log(`${C.y}SKIP ${C.x} ${target}  (${reason})`);
}

function ensureDir(dir) {
  if (fs.existsSync(dir)) return;
  act('mkdir', dir);
  if (opts.apply) fs.mkdirSync(dir, { recursive: true });
}

/** ملفات تحمل عمل المالك: لا يكفي --force لاستبدالها. */
const MEMORY_FILES = new Set(['BRAIN.md', 'DECISIONS.md', 'CROSS-LEVEL-REQUESTS.md']);

function writeOnce(file, content) {
  const isMemory = MEMORY_FILES.has(path.basename(file));
  if (fs.existsSync(file)) {
    if (isMemory && !opts.forceMemory) {
      skip(file, 'ملف ذاكرة قائم — محمي حتى من --force؛ استخدم --force-memory إن أردت محوه');
      return;
    }
    if (!opts.force) {
      skip(file, 'موجود — أعد التشغيل مع --force للاستبدال');
      return;
    }
  }
  act('write', file);
  if (opts.apply) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }
}

function copyOnce(src, dst) {
  if (!fs.existsSync(src)) { skip(dst, `المصدر مفقود: ${src}`); return; }
  if (fs.existsSync(dst) && !opts.force) {
    skip(dst, 'موجود — أعد التشغيل مع --force للاستبدال');
    return;
  }
  act('copy', dst, src);
  if (opts.apply) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

function main() {
  opts = parseArgs(process.argv.slice(2));
  if (opts.help) { console.log(HELP); return 0; }
  if (opts.error) { console.error(`${C.r}${opts.error}${C.x}\n${HELP}`); return 2; }
  if (!opts.master || !opts.skills) { console.error(`${C.r}--master و --skills مطلوبان${C.x}\n${HELP}`); return 2; }

  const master = path.resolve(opts.master);
  const skills = path.resolve(opts.skills);

  step('فحص المسارات');
  if (!fs.existsSync(master)) {
    console.error(`${C.r}لم يُعثر على مشروع master في: ${master}${C.x}`);
    return 1;
  }
  if (!fs.existsSync(skills)) {
    console.error(`${C.r}لم يُعثر على مستودع المهارات في: ${skills}${C.x}`);
    console.error('   git clone https://github.com/kazoya/rctc-skill.git ' + skills);
    return 1;
  }
  const packRoot = fs.existsSync(path.join(skills, 'master-apply-packs', opts.level))
    ? path.join(skills, 'master-apply-packs', opts.level)
    : PACK_ROOT;

  note(`master : ${master}`);
  note(`skills : ${skills}`);
  note(`pack   : ${packRoot}`);
  note(opts.apply ? 'الوضع  : تطبيق فعلي (--apply)' : 'الوضع  : معاينة فقط — لن يُكتب شيء');

  const levelRoot = path.join(master, 'levels', opts.level);
  const capDir = path.join(master, 'files', 'capabilities');
  const today = new Date().toISOString().slice(0, 10);

  step('مجلد المستوى');
  ensureDir(levelRoot);

  writeOnce(path.join(levelRoot, 'BRAIN.md'), `# ذاكرة المستوى — ريشة برو للمواهب

- **المستوى:** L2 — تسويق المواهب (risha360.com)
- **آخر تحديث:** ${today}
- **الحالة:** تأسيس

## أين نحن
حُضِّرت حزمة التطبيق وثُبتت بطاقة القدرة. لم يُنشر شيء بعد.

## المحظورات في هذا المستوى
- لا نشر، لا دفع، لا ربط حساب، لا إرسال رسالة لموهبة.
- لا تعديل للمستويات الثلاثة الأخرى.
- لا ادعاء رقمي بلا مصدر من المالك.

## الخطوة التالية
نفّذ التكليف 00 ثم 01:
\`${path.join(levelRoot, 'prompts')}\`
`);

  writeOnce(path.join(levelRoot, 'DECISIONS.md'), `# سجل القرارات — ريشة برو للمواهب

| التاريخ | القرار | السبب | من قرر |
|---|---|---|---|
| ${today} | اعتماد حزمة المهارات المفتوحة لهذا المستوى | توحيد التنفيذ تحت بوابات وأدلة بدل شغل متناثر | المالك |
`);

  writeOnce(path.join(levelRoot, 'CROSS-LEVEL-REQUESTS.md'), `# طلبات عبور المستويات

كل ما يتجاوز مستوى تسويق المواهب يُسجَّل هنا **ولا يُنفَّذ** حتى يقرر المالك.

| التاريخ | الطلب | المستوى المتأثر | الحالة |
|---|---|---|---|
| — | — | — | — |
`);

  step('بطاقة القدرة');
  ensureDir(capDir);
  copyOnce(
    path.join(packRoot, 'capabilities', 'risha-pro-talents-level.json'),
    path.join(capDir, 'risha-pro-talents-level.json'),
  );

  const capIndex = path.join(master, 'CAPABILITIES.md');
  const capLine =
    '- [risha-pro-talents-level](files/capabilities/risha-pro-talents-level.json) — ريشة برو: المستوى التسويقي للمواهب (risha360.com)';
  if (fs.existsSync(capIndex)) {
    const existing = fs.readFileSync(capIndex, 'utf8');
    if (existing.includes('risha-pro-talents-level')) {
      skip(capIndex, 'يشير إلى البطاقة أصلاً');
    } else {
      act('append', capIndex, capLine);
      if (opts.apply) fs.appendFileSync(capIndex, `\n${capLine}\n`, 'utf8');
    }
  } else {
    writeOnce(capIndex, `# القدرات المسجلة\n\n${capLine}\n`);
  }

  step('التكاليف الجاهزة');
  const promptsSrc = path.join(packRoot, 'prompts');
  const promptsDst = path.join(levelRoot, 'prompts');
  ensureDir(promptsDst);
  if (fs.existsSync(promptsSrc)) {
    for (const name of fs.readdirSync(promptsSrc).filter((f) => f.endsWith('.md')).sort()) {
      copyOnce(path.join(promptsSrc, name), path.join(promptsDst, name));
    }
  } else {
    skip(promptsDst, `المصدر مفقود: ${promptsSrc}`);
  }

  step('خطة التطبيق والبوابات');
  for (const doc of ['APPLY-PLAN.md', 'CHECKLIST.md', 'LEVELS.md']) {
    copyOnce(path.join(packRoot, doc), path.join(levelRoot, doc));
  }

  step('مؤشر المهارات للمحرر');
  writeOnce(path.join(levelRoot, 'SKILLS-POINTER.md'), `# مهارات هذا المستوى

المصدر الوحيد للمهارات: \`${skills}\` (مستودع kazoya/rctc-skill).
لا تُنسخ المهارات هنا حتى لا تتفرع نسخة ثانية تتعفن.

| الحاجة | المهارة |
|---|---|
| توضيح طلب مبهم | \`${path.join(skills, 'SKILL.md')}\` (RCTC) |
| مواصلة التنفيذ بأمان | \`${path.join(skills, 'safe-forward-execution')}\` |
| بوابات الدليل | \`${path.join(skills, 'focused3-agentic-phases')}\` |
| بناء واجهة تسويقية | \`${path.join(skills, 'web_marketing_and_personal-builder-super-skill')}\` |
| وصفة إنتاج منضبطة | \`${path.join(skills, 'digital-presence-factory')}\` |
| دورة تحسين مغلقة | \`${path.join(skills, 'update-zip-skill')}\` |
| أتمتة محادثات محكومة | \`${path.join(skills, 'whatsapp-agent-orchestrator-super-skill')}\` |
| تحسين دوري مقيس | \`${path.join(skills, 'continuous-improving')}\` |

الخطة الكاملة: \`APPLY-PLAN.md\` بجانب هذا الملف.
`);

  step('البيان');
  const manifest = {
    level: opts.level,
    generated_at: new Date().toISOString(),
    mode: opts.apply ? 'apply' : 'dry-run',
    master_path: master,
    skills_path: skills,
    planned_actions: planned,
    skipped,
    human_gates: [
      'publish or deploy anything',
      'send any real message to a talent',
      'link or authorize any external account',
      'write into a project level other than L2',
    ],
  };
  const manifestPath = path.join(levelRoot, 'APPLY-MANIFEST.json');
  if (opts.apply) {
    fs.mkdirSync(levelRoot, { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`${C.g}MANIFEST${C.x} ${manifestPath}`);
  } else {
    console.log(`${C.y}PLAN ${C.x} ${manifestPath} (يُكتب عند --apply)`);
  }

  step('الخلاصة');
  console.log(`إجراءات: ${planned.length} · متخطّاة: ${skipped.length}`);
  console.log(
    opts.apply
      ? `${C.g}\nتم. الخطوة التالية: افتح ${path.join(levelRoot, 'prompts', '00-bootstrap-master-level.md')}${C.x}`
      : `${C.y}\nلم يُكتب شيء. أعد التشغيل مع --apply بعد مراجعة القائمة أعلاه.${C.x}`,
  );
  return 0;
}

process.exit(main());
