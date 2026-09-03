'use strict';
/**
 * Master Brain — shared vocabulary (Arabic / English).
 * Used by the CLI, reports, MCP server and dashboard (served as JSON).
 */

const BRAIN_SECTIONS = [
  { key: 'done',         icon: '✅', ar: 'ما تم إنجازه',          en: 'Done',                    primary: true },
  { key: 'findings',     icon: '🔎', ar: 'ما توصلنا إليه',        en: 'Findings & conclusions',  primary: true },
  { key: 'current',      icon: '🔧', ar: 'ما نعمل عليه حالياً',   en: 'In progress now',         primary: true },
  { key: 'next',         icon: '⏭️', ar: 'الخطوات التالية',       en: 'Next steps',              primary: true },
  { key: 'improvements', icon: '🚀', ar: 'ما نتطلع إلى تحسينه',   en: 'Improvements we aim for', primary: true },
  { key: 'suggestions',  icon: '💡', ar: 'مقترحات النماذج (Claude / Opus / Fable…)', en: 'Model suggestions (Claude / Opus / Fable…)', primary: true },
  { key: 'decisions',    icon: '📌', ar: 'القرارات المعتمدة',     en: 'Decisions',               primary: false },
  { key: 'blockers',     icon: '⛔', ar: 'العوائق',               en: 'Blockers',                primary: false },
  { key: 'constraints',  icon: '📏', ar: 'القيود والقواعد',       en: 'Constraints & rules',     primary: false },
];

const STATUSES = [
  { key: 'planning', ar: 'تخطيط',   en: 'Planning', color: '#8b9cf5' },
  { key: 'active',   ar: 'نشط',     en: 'Active',   color: '#10b981' },
  { key: 'paused',   ar: 'متوقف مؤقتاً', en: 'Paused', color: '#f59e0b' },
  { key: 'blocked',  ar: 'معلّق بعائق', en: 'Blocked', color: '#ef4444' },
  { key: 'done',     ar: 'مكتمل',   en: 'Done',     color: '#c8ad73' },
  { key: 'dormant',  ar: 'سكون',    en: 'Dormant',  color: '#6b7280' },
];

const ENTRY_TYPES = [
  { key: 'progress',   ar: 'تقدّم',        en: 'Progress',   icon: '📈' },
  { key: 'milestone',  ar: 'إنجاز رئيسي',  en: 'Milestone',  icon: '🏁' },
  { key: 'decision',   ar: 'قرار',         en: 'Decision',   icon: '📌' },
  { key: 'blocker',    ar: 'عائق',         en: 'Blocker',    icon: '⛔' },
  { key: 'suggestion', ar: 'مقترح',        en: 'Suggestion', icon: '💡' },
  { key: 'note',       ar: 'ملاحظة',       en: 'Note',       icon: '📝' },
  { key: 'report',     ar: 'تقرير',        en: 'Report',     icon: '📄' },
];

const MODELS = [
  { key: 'claude', ar: 'كلود (عام)',        en: 'Claude (generic)', color: '#d97757' },
  { key: 'opus',   ar: 'كلود أوبوس',        en: 'Claude Opus',      color: '#a78bfa' },
  { key: 'sonnet', ar: 'كلود سونيت',        en: 'Claude Sonnet',    color: '#60a5fa' },
  { key: 'haiku',  ar: 'كلود هايكو',        en: 'Claude Haiku',     color: '#34d399' },
  { key: 'fable',  ar: 'كلود فابل',         en: 'Claude Fable',     color: '#c8ad73' },
  { key: 'human',  ar: 'المالك (بشري)',     en: 'Owner (human)',    color: '#f472b6' },
  { key: 'other',  ar: 'أخرى',              en: 'Other',            color: '#9ca3af' },
];

const SOURCES = ['cowork', 'claude-code', 'claude-desktop', 'cli', 'mcp', 'dashboard', 'human', 'import'];

const PRIORITIES = [
  { key: 0, ar: 'تلقائي', en: 'Auto' },
  { key: 1, ar: 'قصوى',   en: 'Critical' },
  { key: 2, ar: 'عالية',  en: 'High' },
  { key: 3, ar: 'متوسطة', en: 'Medium' },
  { key: 4, ar: 'منخفضة', en: 'Low' },
  { key: 5, ar: 'لاحقاً', en: 'Someday' },
];

const PLATFORM_KINDS = [
  { key: 'learned',      ar: 'ما تعلّمناه (دروس)',     en: 'Lessons learned' },
  { key: 'skills',       ar: 'المهارات المكتسبة',      en: 'Acquired skills' },
  { key: 'tools',        ar: 'الأدوات والتكاملات',     en: 'Tools & integrations' },
  { key: 'capabilities', ar: 'القدرات المتاحة',        en: 'Capabilities' },
  { key: 'requests',     ar: 'طلبات تثبيت أدوات',      en: 'Tool requests' },
];

const UI = {
  ar: {
    appName: 'ماستر برين', tagline: 'منصة المتابعة والعقل الهندسي الواعي',
    dashboard: 'اللوحة', projects: 'المشاريع', reports: 'التقارير', brain: 'العقل العام', channel: 'قناة Claude',
    inbox: 'صندوق الطلبات', newProject: 'مشروع جديد', progress: 'التقدّم', status: 'الحالة', priority: 'الأولوية',
    lastActivity: 'آخر نشاط', journal: 'سجل التقدّم', period: 'الفترة', from: 'من', to: 'إلى', generate: 'إنشاء التقرير',
    format: 'الصيغة', all: 'الكل', save: 'حفظ', cancel: 'إلغاء', add: 'إضافة', by: 'بواسطة', date: 'التاريخ',
  },
  en: {
    appName: 'Master Brain', tagline: 'Portfolio tracker & conscious engineering mind',
    dashboard: 'Dashboard', projects: 'Projects', reports: 'Reports', brain: 'Platform brain', channel: 'Claude channel',
    inbox: 'Requests inbox', newProject: 'New project', progress: 'Progress', status: 'Status', priority: 'Priority',
    lastActivity: 'Last activity', journal: 'Journal', period: 'Period', from: 'From', to: 'To', generate: 'Generate report',
    format: 'Format', all: 'All', save: 'Save', cancel: 'Cancel', add: 'Add', by: 'By', date: 'Date',
  },
};

function label(list, key, lang = 'ar') {
  const f = list.find(x => String(x.key) === String(key));
  return f ? (f[lang] || f.en) : String(key ?? '');
}
const sectionLabel = (k, lang) => label(BRAIN_SECTIONS, k, lang);
const statusLabel = (k, lang) => label(STATUSES, k, lang);
const typeLabel = (k, lang) => label(ENTRY_TYPES, k, lang);
const modelLabel = (k, lang) => label(MODELS, k, lang);
const priorityLabel = (k, lang) => label(PRIORITIES, k, lang);
const kindLabel = (k, lang) => label(PLATFORM_KINDS, k, lang);
const statusColor = k => (STATUSES.find(s => s.key === k) || {}).color || '#9ca3af';
const modelColor = k => (MODELS.find(s => s.key === k) || {}).color || '#9ca3af';

const SECTION_KEYS = BRAIN_SECTIONS.map(s => s.key);
const STATUS_KEYS = STATUSES.map(s => s.key);
const TYPE_KEYS = ENTRY_TYPES.map(s => s.key);
const MODEL_KEYS = MODELS.map(s => s.key);
const KIND_KEYS = PLATFORM_KINDS.map(s => s.key);

module.exports = {
  BRAIN_SECTIONS, STATUSES, ENTRY_TYPES, MODELS, SOURCES, PRIORITIES, PLATFORM_KINDS, UI,
  SECTION_KEYS, STATUS_KEYS, TYPE_KEYS, MODEL_KEYS, KIND_KEYS,
  label, sectionLabel, statusLabel, typeLabel, modelLabel, priorityLabel, kindLabel, statusColor, modelColor,
};
