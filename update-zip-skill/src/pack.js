'use strict';
/**
 * بناء حزمة الاستشارة: موجز مقروء + قيود العلامة + البيانات الخام + عيّنة محتوى.
 *
 * الضغط عبر `Compress-Archive` في PowerShell — لا حزمة npm. المشروعان كلاهما بلا تبعيات،
 * وإدخال واحدة لأجل ملف مضغوط لا يستحق.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');

/** القيود تُرسل مع كل حزمة — بلا هذا تعود توصيات تخالف العلامة فتُهدر الدورة. */
const CONSTRAINTS = `# قيود العلامة — غير قابلة للتفاوض

هذه ليست تفضيلات؛ هي قرارات المالك. أي توصية تخالفها تُرفض مهما كانت مقنعة.

## اللغة والصوت
- **اللهجة:** سعودية رزينة وواثقة. **لا** أسلوب المذيع، **لا** لغة قانونية ثقيلة، **لا** لهجة سوقية.
- **التشكيل:** كل نصّ عربي سينطقه محرّك صوت يُكتب **بالتشكيل الكامل** — إجراء صحّة لا زينة.
- **التعليق الصوتي فقط.** ممنوع خلط موسيقى خلفية في الفيديو النهائي.
- **ممنوع منعًا باتًّا** استخدام تلاوة قرآنية أو النشيد الوطني خلفيةً. وأي صوت خلفي يجب أن
  يطابق معنى الكلام فوقه. السبب: صوت لا يناسب المعنى يُفقد العلامة جمهورها.

## الهوية البصرية
- بنفسجي عميق · أسود · ذهبي دافئ · كريمي.
- واقعية فوتوغرافية — لا مظهر ألعاب ولا CGI ولا إحساس «صور مخزونة».
- لباس سعودي صحيح. بلا علامات مائية غريبة ولا شعارات عشوائية.
- نصّ الشاشة قليل: **٢–٧ كلمات** في الشاشة الواحدة.
- بطاقة النهاية: الشعار الرسمي بلا تعديل + «ريشة 360 القانونية / RISHA 360 LEGAL / @Risha360Legal»،
  ومع المحتوى التوعوي: «المحتوى توعوي عام ولا يعد استشارة قانونية».

## بنية الفيديو المعتمدة
فيلم قصير سينمائي ٢٥–٤٠ ثانية · عمودي 1080×1920 · خطّاف في أول ١–٢ ثانية.
**ممنوع** بدء المقطع بـ«هل تعلم؟» أو «معلومة قانونية». و**ممنوع** ختمه بـ«اتصل الآن!!!».
التقسيم: ٠–٣ خطّاف · ٣–١٠ موقف · ١٠–٢٥ النقطة القانونية · ٢٥–٣٢ ماذا تفعل · آخر ٣–٥ نداء راقٍ.

## قيود تشغيلية
- **البريد مجمَّد تمامًا** حتى تُستعاد سجلات النطاق (SPF/DKIM/DMARC). لا تقترح حملات بريدية.
- **أولوية النشر: تيك توك ثم إنستقرام.**
- المحتوى قانوني؛ أي ادّعاء يجب أن يكون صحيحًا وقابلًا للإثبات وفق الأنظمة السعودية.
`;

const ASK = `# المطلوب منك

أنت مستشار أداء لمحتوى قانوني سعودي قصير. أمامك أرقام حقيقية لحساب حديث، لا افتراضات.

**اقرأ \`SUMMARY.md\` أولًا** — فيه التشخيص الرقمي. ثم \`CONSTRAINTS.md\` — وهو ملزم.
و\`data/\` فيه الخام إن أردت التحقق.

أعِد إلينا مجلدًا باسم \`IMPROVE\` يحوي **هذه الملفات بهذه الأسماء بالضبط**:

| الملف | المحتوى المطلوب |
|---|---|
| \`01-hooks.md\` | ١٥ خطّافًا جاهزًا للثواني الثلاث الأولى، باللهجة السعودية الرزينة، مكتوبة **بالتشكيل**. لكل خطّاف: النصّ، ولماذا يوقف التمرير، وأي نوع محتوى يناسبه. |
| \`02-captions.md\` | قوالب كابشن لكل منصة ضمن حدودها (تيك توك ٢٢٠٠ · إنستقرام ٢٢٠٠ · X ٢٨٠ · لينكدإن ٣٠٠٠ · ثريدز ٥٠٠). مع سياسة الوسوم لكل منصة. |
| \`03-video-spec.md\` | تعديلات محدّدة على مواصفة الفيديو: المدة المثلى، إيقاع القطع، كثافة نصّ الشاشة، ومكان النداء. استند إلى أرقامنا لا إلى العموميات. |
| \`04-schedule.json\` | \`{"tiktok":["21:30","23:00",...],"instagram":[...]}\` — أوقات بتوقيت الرياض، **ومعها حقل \`why\` لكل منصة** يشرح سبب الاختيار. |
| \`05-prompts.md\` | تحسينات على برومبت توليد التصاميم والنصوص، بصيغة «قبل / بعد» لا وصفًا عامًا. |
| \`06-experiments.md\` | ٥ تجارب A/B: لكل واحدة **فرضية** و**ما يُقاس** و**عتبة النجاح** ومدّتها. |
| \`07-diagnosis.md\` | تشخيصك لضعف التفاعل مستندًا إلى الأرقام المرفقة تحديدًا — اذكر الرقم الذي بنيت عليه كل استنتاج. |

## ما لا نريده

- توصيات عامة تصلح لأي حساب («انشر باستمرار»، «تفاعل مع جمهورك»).
- أي اقتراح يخالف \`CONSTRAINTS.md\`.
- ادّعاءات عن أرقام لم نرسلها. إن نقصك معطى، اذكره صراحةً في \`07-diagnosis.md\`.
`;

function fmtInt(n) { return n === null || n === undefined ? '—' : Number(n).toLocaleString('en-US'); }

/** الموجز هو ما سيُقرأ فعلًا — الخام للتحقق فقط. لذلك يحمل التشخيص الرقمي كاملًا. */
function buildSummary(facts, live) {
  const tt = live?.sources?.tiktok || {};
  const hrs = facts.hourHistogram || {};
  const topHours = Object.entries(hrs).map(([p, arr]) => {
    const pairs = arr.map((n, h) => [h, n]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    return `| ${p} | ${pairs.map(([h, n]) => `${String(h).padStart(2, '0')}:00 (${n})`).join(' · ')} |`;
  }).join('\n');

  const fails = (facts.failures || []).slice(0, 8)
    .map(f => `| ${f.platform} | ${f.step || '—'} | ${f.times} | ${String(f.error || '').replace(/\|/g, '/').slice(0, 80)} |`).join('\n');

  return `# موجز أداء ريشة 360 القانونية

أُنشئ: ${facts.generatedAt}
نافذة البيانات: ${(facts.totals.firstPost || '').slice(0, 10)} → ${(facts.totals.lastPost || '').slice(0, 10)}

## ١) حجم النشر

إجمالي المنشورات المؤكَّدة: **${facts.totals.published}**

${Object.entries(facts.totals.byPlatform).map(([p, n]) => `- ${p}: ${n}`).join('\n')}

## ٢) التفاعل الفعلي — جوهر المشكلة

${tt.clips ? `### تيك توك (${tt.clips} مقطعًا مقروءًا)

| المقياس | القيمة |
|---|---|
| إجمالي المشاهدات | **${fmtInt(tt.totalViews)}** |
| وسيط المشاهدات للمقطع | **${fmtInt(tt.medianViews)}** |
| أعلى مقطع | ${fmtInt(tt.top?.[0]?.views)} |
| أدنى مقطع | ${fmtInt(tt.bottom?.[0]?.views)} |

**الأعلى خمسة:**
${(tt.top || []).map(c => `- ${fmtInt(c.views)} — ${c.url}`).join('\n')}

**الأدنى خمسة:**
${(tt.bottom || []).map(c => `- ${fmtInt(c.views)} — ${c.url}`).join('\n')}

${tt.note ? `> ملاحظة أمانة: ${tt.note}.\n` : ''}
> **القراءة:** التوزيع ثنائي القمّة — قلّة نالت دفعة أولية، والأغلبية لم تُعرض عمليًا.
> وسيط ${fmtInt(tt.medianViews)} مشاهدات يعني أن المحتوى **لا يصل**، لا أنه يصل ولا يُعجب.
> هذا تمييز حاسم: مشكلة **توزيع** لا مشكلة **جودة إقناع**.` : '> تعذّر حصاد أرقام تيك توك — انظر `data/live.json`.'}

### المتابعون
${(live?.sources?.followers || []).map(f => `- ${f.platform}: ${f.followers !== null && f.followers !== undefined ? fmtInt(f.followers) : `غير متاح (${f.unavailable})`}`).join('\n')}

> جمهور شبه صفري على كل المنصات. أي توصية تفترض قاعدة متابعين قائمة **لا تنطبق علينا**.

## ٣) أوقات النشر الفعلية (بتوقيت الجهاز)

| المنصة | أكثر الساعات استخدامًا |
|---|---|
${topHours}

## ٤) الأعطال المتكررة

| المنصة | الخطوة | مرات | الخطأ |
|---|---|---|---|
${fails}

## ٥) إعدادات المنصات الحالية

${(facts.platformConfigs || []).map(c => `- **${c.platform}** — مفعّلة: ${c.enabled} · ذروة: ${c.peak_windows} · سقف يومي: ${c.daily_cap} · وسوم: ${c.hashtag_intensity}`).join('\n')}

## ٦) ما تعلّمه النظام آليًا

${(facts.learning || []).slice(0, 10).map(l => `- ${l.kind} / ${l.platform || '—'} × ${l.times}`).join('\n')}
`;
}

function pack({ facts, live, sampleImages = [] }) {
  fs.mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const stage = path.join(OUT, `stage-${stamp}`);
  fs.mkdirSync(path.join(stage, 'data'), { recursive: true });
  fs.mkdirSync(path.join(stage, 'samples'), { recursive: true });

  fs.writeFileSync(path.join(stage, 'SUMMARY.md'), buildSummary(facts, live), 'utf8');
  fs.writeFileSync(path.join(stage, 'CONSTRAINTS.md'), CONSTRAINTS, 'utf8');
  fs.writeFileSync(path.join(stage, 'ASK.md'), ASK, 'utf8');
  fs.writeFileSync(path.join(stage, 'data', 'facts.json'), JSON.stringify(facts, null, 1), 'utf8');
  fs.writeFileSync(path.join(stage, 'data', 'live.json'), JSON.stringify(live ?? { note: 'لم يُشغَّل الحصاد' }, null, 1), 'utf8');

  // عيّنة محتوى لا الأرشيف كله: المستشار يحتاج أن يرى أسلوبنا، لا أن يتصفّح مئة ملف.
  for (const src of sampleImages.slice(0, 6)) {
    try { fs.copyFileSync(src, path.join(stage, 'samples', path.basename(src))); } catch { /* عيّنة ناقصة أهون من فشل */ }
  }

  const zip = path.join(OUT, `risha360-improve-${stamp}.zip`);
  execFileSync('powershell.exe', ['-NoProfile', '-Command',
    `Compress-Archive -Path '${stage}\\*' -DestinationPath '${zip}' -Force`], { windowsHide: true });
  fs.rmSync(stage, { recursive: true, force: true });

  return { zip, bytes: fs.statSync(zip).size };
}

module.exports = { pack, buildSummary, CONSTRAINTS, ASK, OUT };
