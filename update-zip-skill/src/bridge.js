'use strict';
/**
 * جسر ChatGPT — رفع الحزمة وكتابة الطلب في محادثة مفتوحة.
 *
 * هذا المسار **ثانوي عمدًا**. الوضع الافتراضي `pack` لأنه لا يعتمد على تبويب متصفّح
 * ولا على حصّة حساب ولا على بقاء واجهة ChatGPT كما هي. الجسر يوفّر خطوتين يدويتين
 * ولا يستحق أن تتوقّف عليه الدورة.
 */
const fs = require('node:fs');
const { chromium } = require('D:/projects/NajiMainIdea/social-autopilot/node_modules/playwright');

const CDP = 'http://127.0.0.1:9222';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROMPT = 'مرفق ملف مضغوط لأداء حساب قانوني سعودي على منصات التواصل. '
  + 'اقرأ SUMMARY.md أولًا ثم CONSTRAINTS.md وهي ملزمة، ونفّذ ما في ASK.md حرفيًا: '
  + 'أعد مجلد IMPROVE يحوي الملفات السبعة بأسمائها المذكورة تمامًا. '
  + 'لا توصيات عامة تصلح لأي حساب، ولا شيء يخالف القيود، وكل استنتاج يذكر الرقم الذي بُني عليه.';

async function sendToBridge(zipPath) {
  if (!fs.existsSync(zipPath)) return { ok: false, error: `الملف غير موجود: ${zipPath}` };
  let b;
  try { b = await chromium.connectOverCDP(CDP); }
  catch { return { ok: false, error: `متصفّح العمل غير مفتوح على ${CDP}` }; }

  const ctx = b.contexts()[0];
  const page = await ctx.newPage();
  try {
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(9000);

    const body = await page.evaluate(() => document.body.innerText.slice(0, 400));
    if (/log ?in|تسجيل الدخول/i.test(body.slice(0, 200))) {
      return { ok: false, error: 'ChatGPT يطلب تسجيل الدخول في بروفايل العمل' };
    }

    const input = page.locator('input[type="file"]').first();
    if (!await input.count()) return { ok: false, error: 'لا حقل رفع في الصفحة — تغيّرت الواجهة' };
    await input.setInputFiles(zipPath);
    await sleep(12000);   // الرفع والمعالجة قبل قبول الإرسال

    const box = page.locator('div[contenteditable="true"], textarea').first();
    await box.click({ timeout: 15000 });
    await page.keyboard.insertText(PROMPT);
    await sleep(2000);

    // تحقّق قبل الإرسال: حقل ممتلئ بنصّ خاطئ يمرّ أي فحص طول.
    const got = await box.innerText().catch(() => '');
    if (!got.includes('SUMMARY.md')) return { ok: false, error: 'النصّ لم يُكتب في الحقل — أُوقف قبل الإرسال' };

    await page.keyboard.press('Enter');
    await sleep(8000);
    return { ok: true, note: 'رُفعت الحزمة وأُرسل الطلب — الردّ يستغرق دقائق. احفظ مجلد IMPROVE ثم شغّل `ingest`.' };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e).slice(0, 200) };
  } finally {
    await page.close().catch(() => {});
    await b.close().catch(() => {});
  }
}

module.exports = { sendToBridge, PROMPT };
