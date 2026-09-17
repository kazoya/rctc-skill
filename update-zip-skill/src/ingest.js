'use strict';
/**
 * استيعاب حزمة التحسين العائدة.
 *
 * مبدأ حاكم: **الردّ مسودّة لا أمر.** الملف الوحيد القابل للتطبيق الآلي هو
 * `04-schedule.json` لأنه بيانات محضة يمكن التحقق منها. أما النصوص (خطّافات، كابشنات،
 * برومبتات) فتُنسخ إلى `review/` وتنتظر عين المالك — نصّ يُنشر باسم مكتب محاماة لا يمرّ
 * بلا مراجعة بشرية مهما بدا جيدًا.
 */
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const REVIEW = path.join(ROOT, 'review');
const AUTOPILOT_DB = 'D:/projects/NajiMainIdea/social-autopilot/data/autopilot.sqlite';
const KNOWN_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'x', 'tiktok', 'snapchat', 'threads'];
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** لا نكتب في القاعدة ما لم يكن كل حقل سليمًا — جدول ذروة فاسد يوقف النشر كله. */
function validateSchedule(obj) {
  const clean = {}, notes = [];
  for (const [platform, val] of Object.entries(obj || {})) {
    if (platform === 'why') continue;
    if (!KNOWN_PLATFORMS.includes(platform)) { notes.push(`تُجوهلت منصة غير معروفة: ${platform}`); continue; }
    const times = Array.isArray(val) ? val : val && Array.isArray(val.times) ? val.times : null;
    if (!times) { notes.push(`${platform}: لا قائمة أوقات`); continue; }
    const good = times.filter(t => HHMM.test(String(t).trim()));
    if (good.length !== times.length) notes.push(`${platform}: أُسقطت ${times.length - good.length} قيمة بصيغة خاطئة`);
    if (!good.length) { notes.push(`${platform}: لا وقت صالح`); continue; }
    if (good.length > 6) notes.push(`${platform}: ${good.length} أوقات — اكتُفي بأول ٦`);
    clean[platform] = good.slice(0, 6);
  }
  return { clean, notes };
}

function applySchedule(clean) {
  const db = new DatabaseSync(AUTOPILOT_DB);
  const applied = [];
  try {
    const now = new Date().toISOString().slice(0, 19);
    for (const [platform, times] of Object.entries(clean)) {
      const before = db.prepare('SELECT peak_windows FROM platform_configs WHERE platform=?').get(platform);
      if (!before) continue;
      db.prepare('UPDATE platform_configs SET peak_windows=?, updated_at=? WHERE platform=?')
        .run(JSON.stringify(times), now, platform);
      applied.push({ platform, before: before.peak_windows, after: JSON.stringify(times) });
    }
  } finally { db.close(); }
  return applied;
}

function ingest(dir, { apply = false } = {}) {
  if (!fs.existsSync(dir)) return { report: `✗ المجلد غير موجود: ${dir}` };
  fs.mkdirSync(REVIEW, { recursive: true });
  const lines = ['# نتيجة استيعاب حزمة التحسين', ''];

  const files = fs.readdirSync(dir).filter(f => /\.(md|json)$/i.test(f)).sort();
  if (!files.length) return { report: `✗ لا ملفات .md أو .json في ${dir}` };

  // النصوص → مراجعة بشرية
  const stamp = new Date().toISOString().slice(0, 10);
  const bucket = path.join(REVIEW, stamp);
  fs.mkdirSync(bucket, { recursive: true });
  const copied = [];
  for (const f of files) {
    if (/^04-schedule\.json$/i.test(f)) continue;
    fs.copyFileSync(path.join(dir, f), path.join(bucket, f));
    copied.push(f);
  }
  lines.push(`## للمراجعة البشرية (${copied.length} ملفًا)`, '', `نُسخت إلى \`${bucket}\`:`, '',
    ...copied.map(f => `- ${f}`), '',
    '> لا يُنشر أيٌّ من هذه قبل أن يقرأه المالك. نصّ باسم مكتب محاماة لا يمرّ بلا مراجعة.', '');

  // الجدول → تطبيق آلي بعد تحقّق
  const sched = files.find(f => /^04-schedule\.json$/i.test(f));
  if (!sched) {
    lines.push('## أوقات النشر', '', '✗ لا ملف `04-schedule.json` في الحزمة — لم يُطبَّق شيء آليًا.');
  } else {
    let parsed = null;
    try { parsed = JSON.parse(fs.readFileSync(path.join(dir, sched), 'utf8')); }
    catch (e) { lines.push('## أوقات النشر', '', `✗ JSON غير صالح: ${e.message}`); }
    if (parsed) {
      const { clean, notes } = validateSchedule(parsed);
      const hasValid = Object.keys(clean).length > 0;
      if (!hasValid) {
        lines.push('## أوقات النشر', '', 'لم يُطبَّق شيء — لا منصة بأوقات صالحة.', '');
      } else if (!apply) {
        lines.push('## أوقات النشر — جاهزة للمراجعة ولم تُطبَّق', '',
          '> الوضع الافتراضي آمن: لم تُكتب أي قيمة في قاعدة البيانات. أعد الأمر مع `--apply` بعد مراجعة الاقتراح.', '',
          '```json', JSON.stringify(clean, null, 2), '```', '');
      } else {
        const applied = applySchedule(clean);
        lines.push('## أوقات النشر — طُبِّقت بتفويض صريح `--apply`', '');
        if (applied.length) {
          lines.push('| المنصة | قبل | بعد |', '|---|---|---|',
            ...applied.map(a => `| ${a.platform} | ${a.before} | ${a.after} |`), '');
        } else {
          lines.push('لم يُطبَّق شيء — لم تطابق المنصات صفوفًا موجودة في قاعدة البيانات.', '');
        }
      }
      if (notes.length) lines.push('**ملاحظات التحقّق:**', ...notes.map(n => `- ${n}`), '');
      if (parsed.why) lines.push('**تعليل المستشار:**', '```', JSON.stringify(parsed.why, null, 1), '```', '');
    }
  }

  const report = lines.join('\n');
  fs.writeFileSync(path.join(bucket, 'INGEST-REPORT.md'), report, 'utf8');
  return { report, bucket };
}

module.exports = { ingest, validateSchedule };
