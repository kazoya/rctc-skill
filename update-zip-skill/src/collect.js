'use strict';
/**
 * جمع الحقائق — من قاعدة social-autopilot ومن العقل الهندسي في E:\master.
 *
 * لا تبعيات خارجية: `node:sqlite` مدمج، وهو نفس ما يستخدمه المشروعان.
 * القاعدة تُفتح **للقراءة فقط** — دورة تحسين لا يجوز أن تلمس بيانات الإنتاج.
 */
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const AUTOPILOT_DB = 'D:/projects/NajiMainIdea/social-autopilot/data/autopilot.sqlite';
const MASTER_MIND = 'E:/master/data/mind';

function openDb(p) {
  if (!fs.existsSync(p)) throw new Error(`قاعدة البيانات غير موجودة: ${p}`);
  return new DatabaseSync(p, { readOnly: true });
}

/** كل منشور نُشر فعلًا، بساعته وكابشنه ورابطه — هذا جوهر ما يُحلَّل. */
function publishedPosts(db) {
  return db.prepare(`
    SELECT j.platform, j.external_url, j.finished_at, j.status,
           p.title, p.post_type, p.topic,
           v.caption, v.hashtags, v.image_path
      FROM publish_jobs j
      JOIN posts p            ON p.id = j.post_id
      LEFT JOIN platform_variants v ON v.post_id = j.post_id AND v.platform = j.platform
     WHERE j.status = 'posted'
     ORDER BY j.finished_at DESC`).all();
}

/** الفشل ليس ضجيجًا — تكراره على منصة بعينها يفسّر ضعف حضورنا عليها. */
function failures(db) {
  return db.prepare(`
    SELECT platform, step, error, COUNT(*) AS times,
           MAX(created_at) AS last_seen
      FROM failures GROUP BY platform, step, error
     ORDER BY times DESC LIMIT 40`).all();
}

/** توزيع النشر على ساعات اليوم — بلا هذا لا معنى لأي توصية بأوقات الذروة. */
function hourHistogram(rows) {
  const byPlatform = {};
  for (const r of rows) {
    if (!r.finished_at) continue;
    const h = new Date(r.finished_at).getHours();
    (byPlatform[r.platform] ??= Array(24).fill(0))[h]++;
  }
  return byPlatform;
}

function platformConfigs(db) {
  return db.prepare('SELECT platform, enabled, peak_windows, daily_cap, hashtag_intensity, caption_style FROM platform_configs').all();
}

function learning(db) {
  return db.prepare(`
    SELECT kind, platform, COUNT(*) AS times, MAX(suggestion) AS example
      FROM learning_events GROUP BY kind, platform ORDER BY times DESC LIMIT 30`).all();
}

/** خطط العقل الهندسي الأسبوعية — تُظهر ما وُعد به وما نُفِّذ فعلًا. */
function masterPlans() {
  const dir = path.join(MASTER_MIND, 'weeks');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort().slice(-3)
    .map(f => ({ week: f.replace('.json', ''), data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

function collect() {
  const db = openDb(AUTOPILOT_DB);
  try {
    const posts = publishedPosts(db);
    return {
      generatedAt: new Date().toISOString(),
      totals: {
        published: posts.length,
        byPlatform: posts.reduce((a, r) => (a[r.platform] = (a[r.platform] || 0) + 1, a), {}),
        firstPost: posts.length ? posts[posts.length - 1].finished_at : null,
        lastPost: posts.length ? posts[0].finished_at : null,
      },
      posts,
      hourHistogram: hourHistogram(posts),
      failures: failures(db),
      platformConfigs: platformConfigs(db),
      learning: learning(db),
      masterPlans: masterPlans(),
    };
  } finally { db.close(); }
}

module.exports = { collect, AUTOPILOT_DB };
