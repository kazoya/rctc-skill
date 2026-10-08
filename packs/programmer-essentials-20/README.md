# حزمة أفضل 20 مهارة للمبرمج — programmer-essentials-20

مهارات أصلية لمستودع [kazoya/rctc-skill](https://github.com/kazoya/rctc-skill). ليست نسخاً من مهارات المستودع الحالية.

| # | المجلد | متى |
|---|--------|-----|
| 1 | `design-taste-rctc` | Anti-slop UI direction for landing pages, dashboards, and redesigns. Infer the brief, set variance/motion/density dials, prefer an official design system, and run a pre-flight check |
| 2 | `owner-credential-vault` | Store the operator's own automation secrets in the OS credential store (Windows Credential Manager or keyring), never in git |
| 3 | `git-worktree-flow` | Isolate feature work in a git worktree and open a small pull request |
| 4 | `pr-review-surgeon` | Review a pull request for correctness bugs, security mistakes, and missing tests |
| 5 | `debugger-hypothesis` | Debug by stating one hypothesis, a cheap observation, then a fix |
| 6 | `api-error-contracts` | Design HTTP or RPC errors as a stable contract: status, machine code, and a safe message |
| 7 | `sql-migration-safety` | Write expandable database migrations that can deploy before the new code reads them |
| 8 | `test-first-slice` | Add one failing test that names the bug or the new behavior, then the smallest code that passes it |
| 9 | `github-actions-min-ci` | Add a small GitHub Actions workflow that installs dependencies, runs the repo's real check, and does not print secrets |
| 10 | `docker-compose-dev` | Run local dependencies with Docker Compose without putting the app's production secrets in the compose file |
| 11 | `a11y-rtl-web` | Make web UI keyboard-accessible and correct in Arabic RTL |
| 12 | `web-vitals-budget` | Keep a web page inside a small performance budget: LCP, INP, and CLS |
| 13 | `twelve-factor-config` | Keep configuration in the environment, with a committed example file and no production secrets in the repo |
| 14 | `observability-starter` | Add request-scoped logs with a correlation id and one health/readiness distinction |
| 15 | `refactor-characterization` | Change structure without changing behavior by locking current behavior with a characterization test first |
| 16 | `typescript-boundaries` | Keep TypeScript boundaries strict: validate input at the edge, use narrow types inside, avoid any and unchecked casts |
| 17 | `release-notes-from-git` | Write release notes from merged commits and pull requests, grouped by user impact |
| 18 | `supply-chain-pinning` | Pin dependency installs to a lockfile and review new packages before adding them |
| 19 | `incident-debug-playbook` | Run a short production incident loop: impact, mitigation, evidence, then a written follow-up |
| 20 | `consistent-character-video` | Plan a ComfyUI video series with a locked character bible and Saudi-dialect dialogue handled outside the video model |

## التصميم

`design-taste-rctc` يضبط الاتجاه (جمهور، ثلاثة مؤشرات، نظام تصميم رسمي، فحص قبل التسليم). الملف الطويل الكامل يبقى عند [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) إن أردت قاعدته كما هي.

## الأسرار

`owner-credential-vault` يخزّن أسرار **المالك** في مخزن نظام التشغيل. جلسة المتصفح المفتوحة أصلاً تبقى على مهارة `logged-in-browser` داخل المستودع. لا استخراج لكلمات مرور كروم.

## التثبيت المحلي

انسخ كل مجلد يحتوي `SKILL.md` إلى `.cursor/skills/` في المشروع (المجلد متجاهَل في git حتى لا تتكرر النسخ).
