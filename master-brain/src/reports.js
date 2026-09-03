'use strict';
/**
 * Master Brain — report engine.
 * Filters: period (from/to), projects, statuses, entry types, models, progress range; grouping by status/priority.
 * Outputs: HTML (print → PDF), Markdown, XLSX, JSON. Optional PDF via headless Edge/Chrome when available.
 */
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const u = require('./util');
const I = require('./i18n');
const { buildXlsx } = require('./xlsx');

// ------------------------------------------------------------------ data
function buildReportData(store, opts = {}) {
  const cfg = store.cfg;
  const lang = opts.lang === 'en' ? 'en' : 'ar';
  const tz = cfg.timezone;
  const ids = opts.projects && opts.projects.length && !opts.projects.includes('all') ? opts.projects : null;
  const statuses = opts.statuses && opts.statuses.length ? new Set(opts.statuses) : null;
  const types = opts.types && opts.types.length ? opts.types : null;
  const models = opts.models && opts.models.length ? opts.models : null;
  const minP = opts.minProgress != null && opts.minProgress !== '' ? u.clampInt(opts.minProgress, 0, 100, 0) : null;
  const maxP = opts.maxProgress != null && opts.maxProgress !== '' ? u.clampInt(opts.maxProgress, 0, 100, 100) : null;
  const from = opts.from || null, to = opts.to || null;

  const all = store.listProjects();
  const selected = [];
  for (const p of all) {
    if (ids && !ids.includes(p.id)) continue;
    if (statuses && !statuses.has(p.status)) continue;
    if (minP != null && p.progress < minP) continue;
    if (maxP != null && p.progress > maxP) continue;
    const full = store.getProject(p.id);
    const entries = store.constructor.filterJournal(full.journal, { from, to, types, models });
    if (opts.onlyActiveInPeriod && (from || to) && !entries.length) continue;
    const fromD = u.toDate(from), toD = u.endOfDay(to);
    let progressAtStart = fromD ? lastProgressBefore(full.journal, fromD) : null;
    if (fromD && progressAtStart == null) {
      const createdD = u.toDate(full.created);
      if (createdD && createdD >= fromD && (!toD || createdD <= toD)) progressAtStart = 0; // project born inside the period
    }
    const progressAtEnd = toD ? (lastProgressBefore(full.journal, new Date(toD.getTime() + 1)) ?? full.progress) : full.progress;
    const inPeriodBrain = {};
    for (const k of I.SECTION_KEYS) {
      inPeriodBrain[k] = (full.brain.sections[k] || []).filter(it => inRange(it.date, fromD, toD));
    }
    selected.push({
      id: full.id, name: full.name, description: full.description, status: full.status, priority: full.priority, revenue: full.revenue,
      progress: full.progress, tags: full.tags, path: full.path, created: full.created, updated: full.updated,
      lastActivity: full.lastActivity, journalCount: full.journalCount,
      brain: full.brain.sections,
      brainInPeriod: inPeriodBrain,
      entries,
      progressAtStart, progressAtEnd,
      progressDelta: progressAtStart != null ? (progressAtEnd - progressAtStart) : null,
    });
  }

  // summary
  const byStatus = {}; for (const s of I.STATUS_KEYS) byStatus[s] = 0;
  const byType = {}; for (const t of I.TYPE_KEYS) byType[t] = 0;
  const byModel = {};
  let entriesCount = 0, suggestionsCount = 0;
  for (const p of selected) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    for (const e of p.entries) { byType[e.type] = (byType[e.type] || 0) + 1; entriesCount++; }
    for (const s of p.brain.suggestions || []) { suggestionsCount++; byModel[s.by] = (byModel[s.by] || 0) + 1; }
  }
  const avg = selected.length ? Math.round(selected.reduce((a, p) => a + (p.progress || 0), 0) / selected.length) : 0;

  // grouping
  const group = ['status', 'priority', 'none'].includes(opts.group) ? opts.group : 'none';
  let groups;
  if (group === 'status') {
    groups = I.STATUSES.map(s => ({ key: s.key, label: { ar: s.ar, en: s.en }, projects: selected.filter(p => p.status === s.key) })).filter(g => g.projects.length);
  } else if (group === 'priority') {
    groups = I.PRIORITIES.map(pr => ({ key: String(pr.key), label: { ar: pr.ar, en: pr.en }, projects: selected.filter(p => (p.priority || 0) === pr.key) })).filter(g => g.projects.length);
  } else {
    groups = [{ key: 'all', label: { ar: 'كل المشاريع', en: 'All projects' }, projects: selected }];
  }

  const data = {
    meta: {
      title: opts.title || (lang === 'ar' ? 'تقرير متابعة المشاريع' : 'Portfolio progress report'),
      platformName: u.localized(cfg.platformName, lang),
      generated: new Date().toISOString(), generatedLabel: u.fmtDate(new Date(), tz),
      from, to, fromLabel: from ? u.fmtDate(from, tz, false) : '', toLabel: to ? u.fmtDate(to, tz, false) : '',
      lang, tz, group,
      filters: { projects: ids, statuses: statuses ? [...statuses] : null, types, models, minProgress: minP, maxProgress: maxP },
      version: cfg.version,
    },
    summary: { projects: selected.length, totalProjects: all.length, byStatus, byType, byModel, avgProgress: avg, entries: entriesCount, suggestions: suggestionsCount },
    groups,
  };
  if (opts.includePlatform) data.platform = store.getPlatformBrain();
  return data;
}
function inRange(iso, fromD, toD) {
  const d = u.toDate(iso);
  if (!d) return !(fromD || toD);
  if (fromD && d < fromD) return false;
  if (toD && d > toD) return false;
  return true;
}
function lastProgressBefore(journal, date) { // journal sorted desc
  for (const e of journal) {
    const d = u.toDate(e.date);
    if (d && d < date && e.progress != null) return e.progress;
  }
  return null;
}

// ------------------------------------------------------------------ helpers
const T = {
  ar: {
    summary: 'الملخص التنفيذي', projects: 'المشاريع', avgProgress: 'متوسط التقدّم', entries: 'مدخلات السجل في الفترة', suggestions: 'مقترحات النماذج',
    period: 'الفترة', allTime: 'كل الفترات', generated: 'تاريخ الإصدار', project: 'المشروع', status: 'الحالة', priority: 'الأولوية', progress: 'التقدّم',
    delta: 'تغيّر التقدّم في الفترة', lastActivity: 'آخر نشاط', entriesCol: 'مدخلات', byStatus: 'التوزيع حسب الحالة', byType: 'طبيعة التقدّم (أنواع المدخلات)',
    byModel: 'المقترحات حسب النموذج', journal: 'سجل التقدّم في الفترة', noEntries: 'لا مدخلات في هذه الفترة.', brain: 'العقل الهندسي (لقطة حالية)',
    date: 'التاريخ', type: 'النوع', title: 'العنوان', model: 'النموذج', print: 'طباعة / حفظ PDF', filters: 'المرشّحات', none: 'بدون',
    group: 'التجميع', by: 'بواسطة', tags: 'الوسوم', description: 'الوصف', platform: 'العقل العام للمنصة', item: 'البند', kind: 'النوع', notes: 'ملاحظات',
    section: 'القسم', text: 'النص', page: 'صفحة', of: 'من', revenue: 'دخل', yes: 'نعم', no: 'لا', unknown: 'غير محدد', id: 'المعرّف',
  },
  en: {
    summary: 'Executive summary', projects: 'Projects', avgProgress: 'Average progress', entries: 'Journal entries in period', suggestions: 'Model suggestions',
    period: 'Period', allTime: 'All time', generated: 'Generated', project: 'Project', status: 'Status', priority: 'Priority', progress: 'Progress',
    delta: 'Progress change in period', lastActivity: 'Last activity', entriesCol: 'Entries', byStatus: 'By status', byType: 'Nature of progress (entry types)',
    byModel: 'Suggestions by model', journal: 'Journal in period', noEntries: 'No entries in this period.', brain: 'Engineering mind (current snapshot)',
    date: 'Date', type: 'Type', title: 'Title', model: 'Model', print: 'Print / Save as PDF', filters: 'Filters', none: 'None',
    group: 'Grouping', by: 'By', tags: 'Tags', description: 'Description', platform: 'Platform brain', item: 'Item', kind: 'Kind', notes: 'Notes',
    section: 'Section', text: 'Text', page: 'Page', of: 'of', revenue: 'Revenue', yes: 'Yes', no: 'No', unknown: 'Unknown', id: 'ID',
  },
};
const tr = (lang, k) => (T[lang] || T.ar)[k] || k;
const periodLabel = (m, lang) => (m.from || m.to) ? `${m.fromLabel || '…'} → ${m.toLabel || '…'}` : tr(lang, 'allTime');

// ------------------------------------------------------------------ HTML
function renderHtml(data) {
  const { meta } = data;
  const lang = meta.lang, rtl = lang === 'ar';
  const e = u.escapeHtml;
  const t = k => tr(lang, k);
  const L = v => u.localized(v, lang);
  const statusBadge = s => `<span class="badge" style="--c:${I.statusColor(s)}">${e(I.statusLabel(s, lang))}</span>`;
  const modelBadge = m => `<span class="badge model" style="--c:${I.modelColor(m)}">${e(I.modelLabel(m, lang))}</span>`;
  const bar = p => `<div class="bar"><div class="fill" style="width:${u.clampInt(p, 0, 100, 0)}%"></div><span>${u.clampInt(p, 0, 100, 0)}%</span></div>`;

  const kpis = [
    [t('projects'), `${data.summary.projects}${data.summary.projects !== data.summary.totalProjects ? ` / ${data.summary.totalProjects}` : ''}`],
    [t('avgProgress'), `${data.summary.avgProgress}%`],
    [t('entries'), data.summary.entries],
    [t('suggestions'), data.summary.suggestions],
  ].map(([k, v]) => `<div class="kpi"><div class="v">${e(v)}</div><div class="k">${e(k)}</div></div>`).join('');

  const statusRows = I.STATUSES.filter(s => data.summary.byStatus[s.key]).map(s => `<tr><td>${statusBadge(s.key)}</td><td class="num">${data.summary.byStatus[s.key]}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">${t('none')}</td></tr>`;
  const typeRows = I.ENTRY_TYPES.filter(x => data.summary.byType[x.key]).map(x => `<tr><td>${x.icon} ${e(lang === 'ar' ? x.ar : x.en)}</td><td class="num">${data.summary.byType[x.key]}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">${t('none')}</td></tr>`;
  const modelRows = Object.entries(data.summary.byModel).sort((a, b) => b[1] - a[1]).map(([m, n]) => `<tr><td>${modelBadge(m)}</td><td class="num">${n}</td></tr>`).join('') || `<tr><td colspan="2" class="muted">${t('none')}</td></tr>`;

  const overviewRows = data.groups.flatMap(g => g.projects).map(p => `<tr>
    <td><strong>${e(L(p.name))}</strong><br><span class="muted mono">${e(p.id)}</span></td>
    <td>${statusBadge(p.status)}</td><td class="num">${p.priority || '—'}</td>
    <td>${bar(p.progress)}</td>
    <td class="num">${p.progressDelta == null ? '—' : (p.progressDelta > 0 ? '+' : '') + p.progressDelta + '%'}</td>
    <td class="num">${p.entries.length}</td><td class="mono">${e(u.fmtDate(p.lastActivity, meta.tz, false))}</td></tr>`).join('');

  const groupsHtml = data.groups.map(g => `
    ${data.groups.length > 1 || g.key !== 'all' ? `<h2 class="group">${e(L(g.label))} <span class="muted">(${g.projects.length})</span></h2>` : ''}
    ${g.projects.map(p => `
    <section class="project">
      <header>
        <div><h3>${e(L(p.name))} <span class="muted mono">${e(p.id)}</span></h3>
        ${L(p.description) ? `<p class="desc">${e(L(p.description))}</p>` : ''}</div>
        <div class="meta">${statusBadge(p.status)} <span class="chip">${t('priority')}: ${p.priority || '—'}</span> ${bar(p.progress)}</div>
      </header>
      <div class="cols">
        <div>
          <h4>${t('brain')}</h4>
          ${I.BRAIN_SECTIONS.map(s => {
            const items = p.brain[s.key] || [];
            if (!items.length) return '';
            return `<div class="sec"><div class="sec-t">${s.icon} ${e(lang === 'ar' ? s.ar : s.en)} <span class="muted">(${items.length})</span></div><ul>${items.slice(-12).map(it => `<li>${e(it.text)}${s.key === 'suggestions' ? ` ${modelBadge(it.by)}${it.status && it.status !== 'proposed' ? ` <span class="chip">${e(it.status)}</span>` : ''}` : ''} <span class="muted mono small">${e(u.fmtDate(it.date, meta.tz, false))}</span></li>`).join('')}</ul></div>`;
          }).join('')}
        </div>
        <div>
          <h4>${t('journal')} <span class="muted">(${p.entries.length})</span></h4>
          ${p.entries.length ? `<table class="entries"><thead><tr><th>${t('date')}</th><th>${t('type')}</th><th>${t('title')}</th><th>${t('progress')}</th><th>${t('model')}</th></tr></thead><tbody>
          ${p.entries.map(en => { const ty = I.ENTRY_TYPES.find(x => x.key === en.type) || {}; return `<tr><td class="mono">${e(u.fmtDate(en.date, meta.tz))}</td><td>${ty.icon || ''} ${e(I.typeLabel(en.type, lang))}</td><td><strong>${e(en.title)}</strong>${en.body ? `<div class="body">${e(en.body).replace(/\n/g, '<br>')}</div>` : ''}</td><td class="num">${en.progress != null ? en.progress + '%' : '—'}</td><td>${modelBadge(en.model)}</td></tr>`; }).join('')}
          </tbody></table>` : `<p class="muted">${t('noEntries')}</p>`}
        </div>
      </div>
    </section>`).join('')}`).join('');

  const platformHtml = data.platform ? `<h2 class="group">${t('platform')}</h2>${I.PLATFORM_KINDS.map(k => {
    const items = data.platform[k.key] || [];
    if (!items.length) return '';
    return `<section class="project"><h4>${e(lang === 'ar' ? k.ar : k.en)} <span class="muted">(${items.length})</span></h4><ul>${items.map(it => `<li>${e(it.name || it.text)}${it.name && it.text && it.name !== it.text ? ` — ${e(it.text)}` : ''}${it.status ? ` <span class="chip">${e(it.status)}</span>` : ''}${it.url ? ` <a href="${e(it.url)}">${e(it.url)}</a>` : ''} ${modelBadge(it.by)}</li>`).join('')}</ul></section>`;
  }).join('')}` : '';

  const filters = [
    meta.filters.projects ? `${t('projects')}: ${meta.filters.projects.join(', ')}` : '',
    meta.filters.statuses ? `${t('status')}: ${meta.filters.statuses.map(s => I.statusLabel(s, lang)).join(', ')}` : '',
    meta.filters.types ? `${t('type')}: ${meta.filters.types.map(s => I.typeLabel(s, lang)).join(', ')}` : '',
    meta.filters.models ? `${t('model')}: ${meta.filters.models.map(s => I.modelLabel(s, lang)).join(', ')}` : '',
    meta.filters.minProgress != null || meta.filters.maxProgress != null ? `${t('progress')}: ${meta.filters.minProgress ?? 0}–${meta.filters.maxProgress ?? 100}%` : '',
    meta.group !== 'none' ? `${t('group')}: ${meta.group}` : '',
  ].filter(Boolean).join(' · ');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(meta.title)} — ${e(meta.platformName)}</title>
<style>
  :root{--navy:#0f1b33;--navy2:#1f2a44;--gold:#c8ad73;--ink:#1a1f2b;--muted:#6b7280;--line:#e5e7eb;--bg:#f6f7fa;--card:#fff}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:"Segoe UI",Tahoma,"Noto Naskh Arabic",Arial,sans-serif;font-size:13px;line-height:1.55}
  .page{max-width:1100px;margin:0 auto;padding:24px}
  .cover{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-radius:14px;padding:26px 28px;display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
  .cover h1{margin:0 0 6px;font-size:24px;letter-spacing:.2px}
  .cover .sub{color:var(--gold);font-weight:600}
  .cover .meta-lines{font-size:12px;opacity:.9;margin-top:8px}
  .btn{background:var(--gold);color:var(--navy);border:0;border-radius:8px;padding:9px 14px;font-weight:700;cursor:pointer;font-family:inherit}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}
  .kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
  .kpi .v{font-size:26px;font-weight:800;color:var(--navy)}
  .kpi .k{color:var(--muted);font-size:12px}
  h2{font-size:18px;margin:26px 0 10px;color:var(--navy);border-bottom:2px solid var(--gold);padding-bottom:6px}
  h2.group{margin-top:30px;break-after:avoid;page-break-after:avoid}
  h3{margin:0;font-size:16px;color:var(--navy)}
  h4{margin:0 0 8px;font-size:13px;color:var(--navy2);text-transform:uppercase;letter-spacing:.4px}
  table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}
  th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top}
  th{background:#eef1f7;color:var(--navy2);font-weight:700;font-size:12px}
  tr:last-child td{border-bottom:0}
  .num{text-align:center;white-space:nowrap}
  .mono{font-family:Consolas,"Courier New",monospace;font-size:11.5px}
  td.mono{white-space:nowrap}
  .small{font-size:11px}
  .muted{color:var(--muted)}
  .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .badge{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;color:var(--c);background:color-mix(in srgb,var(--c) 14%,white);border:1px solid color-mix(in srgb,var(--c) 40%,white);white-space:nowrap}
  .chip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;background:#eef1f7;color:var(--navy2);white-space:nowrap}
  .bar{position:relative;height:16px;background:#e9ecf3;border-radius:999px;min-width:120px;overflow:hidden}
  .bar .fill{height:100%;background:linear-gradient(90deg,var(--gold),#e2cf9a)}
  .bar span{position:absolute;inset:0;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center;color:var(--navy)}
  .project{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:14px 0;page-break-inside:avoid}
  .project header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;border-bottom:1px dashed var(--line);padding-bottom:10px;margin-bottom:12px}
  .project .meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;min-width:280px}
  .desc{margin:4px 0 0;color:var(--muted)}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .sec{margin-bottom:10px}
  .sec-t{font-weight:700;color:var(--navy2);margin-bottom:3px}
  ul{margin:0;padding-inline-start:18px}
  li{margin:2px 0}
  .entries td .body{color:#374151;margin-top:3px;font-size:12px;white-space:pre-wrap}
  footer{margin-top:28px;color:var(--muted);font-size:11px;text-align:center}
  @media print{
    @page{size:A4;margin:12mm}
    body{background:#fff;font-size:11px}
    .page{padding:0;max-width:none}
    .btn{display:none}
    .cols{grid-template-columns:1fr}
    .cover{border-radius:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .badge,.bar .fill,th,.kpi{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .project{break-inside:avoid}
  }
  @media (max-width:800px){.kpis{grid-template-columns:repeat(2,1fr)}.cols,.grid3{grid-template-columns:1fr}.cover{flex-direction:column}}
</style>
</head>
<body><div class="page">
  <div class="cover">
    <div>
      <div class="sub">${e(meta.platformName)}</div>
      <h1>${e(meta.title)}</h1>
      <div class="meta-lines">${t('period')}: <strong>${e(periodLabel(meta, lang))}</strong> &nbsp;·&nbsp; ${t('generated')}: ${e(meta.generatedLabel)}${filters ? `<br>${t('filters')}: ${e(filters)}` : ''}</div>
    </div>
    <button class="btn" onclick="window.print()">${t('print')}</button>
  </div>
  <div class="kpis">${kpis}</div>
  <h2>${t('summary')}</h2>
  <div class="grid3">
    <table><thead><tr><th>${t('byStatus')}</th><th class="num">#</th></tr></thead><tbody>${statusRows}</tbody></table>
    <table><thead><tr><th>${t('byType')}</th><th class="num">#</th></tr></thead><tbody>${typeRows}</tbody></table>
    <table><thead><tr><th>${t('byModel')}</th><th class="num">#</th></tr></thead><tbody>${modelRows}</tbody></table>
  </div>
  <h2>${t('projects')}</h2>
  <table><thead><tr><th>${t('project')}</th><th>${t('status')}</th><th class="num">${t('priority')}</th><th>${t('progress')}</th><th class="num">${t('delta')}</th><th class="num">${t('entriesCol')}</th><th>${t('lastActivity')}</th></tr></thead><tbody>${overviewRows || `<tr><td colspan="7" class="muted">${t('none')}</td></tr>`}</tbody></table>
  ${groupsHtml}
  ${platformHtml}
  <footer>${e(meta.platformName)} · v${e(meta.version)} · ${e(meta.generatedLabel)}</footer>
</div></body></html>`;
}

// ------------------------------------------------------------------ Markdown
function renderMarkdown(data) {
  const { meta } = data, lang = meta.lang, t = k => tr(lang, k), L = v => u.localized(v, lang);
  const o = [];
  o.push(`# ${meta.title}`);
  o.push(`${meta.platformName} · ${t('period')}: ${periodLabel(meta, lang)} · ${t('generated')}: ${meta.generatedLabel}`);
  o.push('');
  o.push(`## ${t('summary')}`);
  o.push('');
  o.push(`| ${t('projects')} | ${t('avgProgress')} | ${t('entries')} | ${t('suggestions')} |`);
  o.push('|---|---|---|---|');
  o.push(`| ${data.summary.projects} | ${data.summary.avgProgress}% | ${data.summary.entries} | ${data.summary.suggestions} |`);
  o.push('');
  o.push(`**${t('byStatus')}:** ` + (I.STATUSES.filter(s => data.summary.byStatus[s.key]).map(s => `${lang === 'ar' ? s.ar : s.en} ${data.summary.byStatus[s.key]}`).join(' · ') || t('none')));
  o.push(`**${t('byType')}:** ` + (I.ENTRY_TYPES.filter(x => data.summary.byType[x.key]).map(x => `${x.icon} ${lang === 'ar' ? x.ar : x.en} ${data.summary.byType[x.key]}`).join(' · ') || t('none')));
  o.push(`**${t('byModel')}:** ` + (Object.entries(data.summary.byModel).map(([m, n]) => `${I.modelLabel(m, lang)} ${n}`).join(' · ') || t('none')));
  o.push('');
  o.push(`## ${t('projects')}`);
  o.push('');
  o.push(`| ${t('project')} | ${t('status')} | ${t('priority')} | ${t('progress')} | ${t('delta')} | ${t('entriesCol')} | ${t('lastActivity')} |`);
  o.push('|---|---|---|---|---|---|---|');
  for (const p of data.groups.flatMap(g => g.projects)) o.push(`| ${L(p.name)} (\`${p.id}\`) | ${I.statusLabel(p.status, lang)} | ${p.priority || '—'} | ${p.progress}% | ${p.progressDelta == null ? '—' : (p.progressDelta > 0 ? '+' : '') + p.progressDelta + '%'} | ${p.entries.length} | ${u.fmtDate(p.lastActivity, meta.tz, false)} |`);
  o.push('');
  for (const g of data.groups) {
    if (data.groups.length > 1 || g.key !== 'all') { o.push(`## ${L(g.label)} (${g.projects.length})`); o.push(''); }
    for (const p of g.projects) {
      o.push(`### ${L(p.name)} — \`${p.id}\` · ${I.statusLabel(p.status, lang)} · ${p.progress}%`);
      if (L(p.description)) o.push(`_${L(p.description)}_`);
      o.push('');
      o.push(`#### ${t('brain')}`);
      for (const s of I.BRAIN_SECTIONS) {
        const items = p.brain[s.key] || [];
        if (!items.length) continue;
        o.push(`**${s.icon} ${lang === 'ar' ? s.ar : s.en}**`);
        for (const it of items) o.push(`- ${it.text}${s.key === 'suggestions' ? ` — _${I.modelLabel(it.by, lang)}_${it.status && it.status !== 'proposed' ? ` [${it.status}]` : ''}` : ''} <sub>${u.fmtDate(it.date, meta.tz, false)}</sub>`);
        o.push('');
      }
      o.push(`#### ${t('journal')} (${p.entries.length})`);
      if (!p.entries.length) o.push(t('noEntries'));
      for (const en of p.entries) {
        const ty = I.ENTRY_TYPES.find(x => x.key === en.type) || {};
        o.push(`- ${ty.icon || ''} **${u.fmtDate(en.date, meta.tz)}** — ${en.title}${en.progress != null ? ` (${en.progress}%)` : ''} — _${I.modelLabel(en.model, lang)}_${en.body ? `\n  ${en.body.replace(/\n/g, '\n  ')}` : ''}`);
      }
      o.push('');
    }
  }
  if (data.platform) {
    o.push(`## ${t('platform')}`);
    for (const k of I.PLATFORM_KINDS) {
      const items = data.platform[k.key] || [];
      if (!items.length) continue;
      o.push(`### ${lang === 'ar' ? k.ar : k.en} (${items.length})`);
      for (const it of items) o.push(`- ${it.name || it.text}${it.name && it.text && it.name !== it.text ? ` — ${it.text}` : ''}${it.status ? ` [${it.status}]` : ''}${it.url ? ` <${it.url}>` : ''} — _${I.modelLabel(it.by, lang)}_`);
      o.push('');
    }
  }
  o.push(`---`);
  o.push(`${meta.platformName} · v${meta.version} · ${meta.generatedLabel}`);
  return o.join('\n') + '\n';
}

// ------------------------------------------------------------------ XLSX
function renderXlsx(data) {
  const { meta } = data, lang = meta.lang, t = k => tr(lang, k), L = v => u.localized(v, lang), rtl = lang === 'ar';
  const projects = data.groups.flatMap(g => g.projects);
  const sheets = [];
  sheets.push({ name: t('summary'), rtl, rows: [
    [t('item'), t('text')],
    [t('project') + ' / ' + t('period'), periodLabel(meta, lang)],
    [t('generated'), meta.generatedLabel],
    [t('projects'), data.summary.projects],
    [t('avgProgress'), data.summary.avgProgress],
    [t('entries'), data.summary.entries],
    [t('suggestions'), data.summary.suggestions],
    ...I.STATUSES.filter(s => data.summary.byStatus[s.key]).map(s => [`${t('byStatus')}: ${lang === 'ar' ? s.ar : s.en}`, data.summary.byStatus[s.key]]),
    ...I.ENTRY_TYPES.filter(x => data.summary.byType[x.key]).map(x => [`${t('byType')}: ${lang === 'ar' ? x.ar : x.en}`, data.summary.byType[x.key]]),
    ...Object.entries(data.summary.byModel).map(([m, n]) => [`${t('byModel')}: ${I.modelLabel(m, lang)}`, n]),
  ], widths: [38, 40] });
  sheets.push({ name: t('projects'), rtl, rows: [
    [t('id'), t('project'), t('status'), t('priority'), t('revenue'), t('progress'), t('delta'), t('entriesCol'), t('lastActivity'), t('tags'), t('description'), 'Path'],
    ...projects.map(p => [p.id, L(p.name), I.statusLabel(p.status, lang), p.priority || 0, tr(lang, p.revenue || 'unknown'), p.progress, p.progressDelta ?? '', p.entries.length, u.toDate(p.lastActivity) || '', (p.tags || []).join(', '), L(p.description), p.path]),
  ], widths: [22, 34, 12, 9, 9, 10, 12, 10, 18, 24, 50, 40] });
  sheets.push({ name: t('journal'), rtl, rows: [
    [t('project'), t('date'), t('type'), t('title'), t('progress'), t('model'), 'Source', t('tags'), t('text')],
    ...projects.flatMap(p => p.entries.map(en => [L(p.name), u.toDate(en.date) || '', I.typeLabel(en.type, lang), en.title, en.progress ?? '', I.modelLabel(en.model, lang), en.source, (en.tags || []).join(', '), en.body])),
  ], widths: [30, 18, 12, 44, 9, 14, 12, 18, 80] });
  sheets.push({ name: t('brain'), rtl, rows: [
    [t('project'), t('section'), t('text'), t('by'), t('status'), t('date'), t('id')],
    ...projects.flatMap(p => I.BRAIN_SECTIONS.flatMap(s => (p.brain[s.key] || []).map(it => [L(p.name), lang === 'ar' ? s.ar : s.en, it.text, I.modelLabel(it.by, lang), it.status || '', u.toDate(it.date) || '', it.id]))),
  ], widths: [30, 24, 80, 14, 10, 18, 12] });
  if (data.platform) {
    sheets.push({ name: t('platform'), rtl, rows: [
      [t('kind'), t('item'), t('text'), t('status'), 'URL', t('by'), t('date')],
      ...I.PLATFORM_KINDS.flatMap(k => (data.platform[k.key] || []).map(it => [lang === 'ar' ? k.ar : k.en, it.name || '', it.text || '', it.status || '', it.url || '', I.modelLabel(it.by, lang), u.toDate(it.date) || ''])),
    ], widths: [20, 30, 70, 12, 40, 14, 18] });
  }
  return buildXlsx(sheets, { creator: meta.platformName });
}

// ------------------------------------------------------------------ save / pdf
function reportFileName(data, ext) {
  const scope = data.meta.filters.projects ? data.meta.filters.projects.join('+').slice(0, 40) : 'all';
  return `report-${u.dateStamp(data.meta.generated, data.meta.tz)}-${u.slugify(scope) || 'all'}-${data.meta.lang}.${ext}`;
}
function saveReport(store, data, format) {
  const dir = u.ensureDir(store.cfg.reportsDirAbs);
  const f = String(format || 'html').toLowerCase();
  let file, content;
  if (f === 'html') { file = reportFileName(data, 'html'); content = renderHtml(data); }
  else if (f === 'md' || f === 'markdown') { file = reportFileName(data, 'md'); content = renderMarkdown(data); }
  else if (f === 'xlsx' || f === 'excel') { file = reportFileName(data, 'xlsx'); content = renderXlsx(data); }
  else if (f === 'json') { file = reportFileName(data, 'json'); content = JSON.stringify(data, null, 2); }
  else throw new Error(`Unknown format "${format}" (html|md|xlsx|json|pdf)`);
  const full = path.join(dir, file);
  fs.writeFileSync(full, content);
  return { file, path: full, format: f, bytes: Buffer.byteLength(content) };
}
function findBrowser() {
  const candidates = process.platform === 'win32' ? [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
  ] : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/pw-browsers/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'];
  if (process.env.MB_BROWSER) candidates.unshift(process.env.MB_BROWSER);
  return candidates.find(c => c && u.exists(c)) || null;
}
function htmlToPdf(htmlPath, pdfPath) {
  const browser = findBrowser();
  if (!browser) return { ok: false, error: 'No headless browser found (Edge/Chrome). Open the HTML report and use Print → Save as PDF.' };
  const url = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/');
  const args = ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', `--print-to-pdf=${path.resolve(pdfPath)}`, url];
  const r = spawnSync(browser, args, { timeout: 60000, stdio: 'ignore' });
  if (r.error || !u.exists(pdfPath)) return { ok: false, error: (r.error && r.error.message) || 'Browser did not produce a PDF', browser };
  return { ok: true, path: pdfPath, browser };
}

module.exports = { buildReportData, renderHtml, renderMarkdown, renderXlsx, saveReport, htmlToPdf, findBrowser, reportFileName, tr };
