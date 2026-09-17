'use strict';
/**
 * حصاد أرقام التفاعل الحيّة من المنصات عبر بروفايل العمل (CDP على 9222).
 *
 * لماذا الحصاد مرحلة مستقلّة: قاعدتنا تعرف **ماذا نشرنا ومتى**، ولا تعرف **ماذا حدث بعد
 * النشر**. وسؤال المالك «لماذا التفاعل ضعيف؟» لا يُجاب إلا بالثاني. فبلا هذه المرحلة
 * تُرسل الحزمة ناقصة وتعود بنصائح عامة.
 *
 * قاعدة صارمة: **ما لا نقرؤه نقوله**. المنصة التي تُخفي الأرقام أو تطلب تسجيل دخول
 * تُسجَّل كـ`unavailable` مع السبب — لا تُتخطّى بصمت ولا يُخمَّن لها رقم.
 */
const { chromium } = require('D:/projects/NajiMainIdea/social-autopilot/node_modules/playwright');

const CDP = 'http://127.0.0.1:9222';
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** يحوّل «١٢٫٣ ألف» أو «1.2K» إلى عدد. المنصات تختصر، ونحن نحتاج رقمًا نجمعه. */
function parseCount(s) {
  if (!s) return null;
  const t = String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[,\u066C\s]/g, '').replace(/[٫،]/g, '.');
  const m = t.match(/([\d.]+)\s*(ألف|الف|مليون|K|M|B)?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const mult = /ألف|الف|K/i.test(m[2] || '') ? 1e3 : /مليون|M/i.test(m[2] || '') ? 1e6 : /B/i.test(m[2] || '') ? 1e9 : 1;
  return Math.round(n * mult);
}

async function withBrowser(fn) {
  let b;
  try { b = await chromium.connectOverCDP(CDP); }
  catch { return { error: `متصفّح العمل غير مفتوح على ${CDP} — شغّل scripts\\launch-chrome.cmd` }; }
  const page = await b.contexts()[0].newPage();
  try { return await fn(page); }
  finally { await page.close().catch(() => {}); await b.close().catch(() => {}); }
}

/** تيك توك: أغنى مصدر لدينا — المشاهدات ظاهرة على كل مقطع في الملف الشخصي. */
async function harvestTikTok(page, handle = 'risha360legal') {
  await page.goto(`https://www.tiktok.com/@${handle}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(9000);
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 900).catch(() => {}); await sleep(1200); }
  const items = await page.evaluate(() => [...document.querySelectorAll('a[href*="/video/"]')].map(a => {
    const card = a.closest('div');
    const views = card ? (card.innerText.match(/[\d.,٠-٩٫]+\s*(ألف|الف|مليون|K|M)?/) || [])[0] : null;
    return { url: a.getAttribute('href'), viewsRaw: views };
  }));
  const seen = new Set();
  const clips = items.filter(x => x.url && !seen.has(x.url) && seen.add(x.url))
    .map(x => ({ url: 'https://www.tiktok.com' + x.url, views: null, viewsRaw: x.viewsRaw }));
  for (const c of clips) c.views = parseCount(c.viewsRaw);
  const withViews = clips.filter(c => c.views !== null);
  return {
    platform: 'tiktok', handle, clips: clips.length,
    totalViews: withViews.reduce((a, c) => a + c.views, 0),
    medianViews: withViews.length ? withViews.map(c => c.views).sort((a, b) => a - b)[Math.floor(withViews.length / 2)] : null,
    top: [...withViews].sort((a, b) => b.views - a.views).slice(0, 5),
    bottom: [...withViews].sort((a, b) => a.views - b.views).slice(0, 5),
    note: withViews.length < clips.length ? `${clips.length - withViews.length} مقطعًا بلا رقم مقروء` : null,
  };
}

/** عدّادات المتابعين — مؤشر النموّ لا التفاعل، لكنه يضع الأرقام في سياقها. */
async function harvestFollowers(page) {
  const out = [];
  const targets = [
    ['tiktok', 'https://www.tiktok.com/@risha360legal', /([\d.,٠-٩٫]+\s*(ألف|الف|مليون|K|M)?)\s*(متابع|Followers)/],
    ['instagram', 'https://www.instagram.com/risha360legal/', /([\d.,٠-٩٫]+)\s*(متابع|followers)/i],
    ['threads', 'https://www.threads.com/@risha360legal', /([\d.,٠-٩٫]+)\s*(متابع|follower)/i],
    ['x', 'https://x.com/Risha360Legal', /([\d.,٠-٩٫]+)\s*(متابع|Followers)/],
  ];
  for (const [name, url, re] of targets) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(7000);
      const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 3000));
      const needsLogin = /تسجيل الدخول|Log in|Sign in/i.test(txt.slice(0, 300));
      const m = txt.match(re);
      out.push({
        platform: name,
        followers: m ? parseCount(m[1]) : null,
        unavailable: needsLogin ? 'يطلب تسجيل دخول' : (m ? null : 'لم يُعثر على العدّاد في الصفحة'),
      });
    } catch (e) { out.push({ platform: name, followers: null, unavailable: String(e).slice(0, 90) }); }
  }
  return out;
}

async function harvest() {
  return withBrowser(async page => {
    const result = { harvestedAt: new Date().toISOString(), sources: {} };
    try { result.sources.tiktok = await harvestTikTok(page); }
    catch (e) { result.sources.tiktok = { unavailable: String(e).slice(0, 120) }; }
    try { result.sources.followers = await harvestFollowers(page); }
    catch (e) { result.sources.followers = { unavailable: String(e).slice(0, 120) }; }
    return result;
  });
}

module.exports = { harvest, parseCount };
