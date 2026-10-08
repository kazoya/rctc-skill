import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const skills = [
  {
    name: "design-taste-rctc",
    description:
      "Anti-slop UI direction for landing pages, dashboards, and redesigns. Infer the brief, set variance/motion/density dials, prefer an official design system, and run a pre-flight check. Use when the user asks for design taste, UI polish, or a less generic interface. Complements upstream Leonxlnx/taste-skill; does not replace its full rulebook.",
    body: `# design-taste-rctc

RCTC-sized design direction. The long rulebook lives upstream at [Leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) (\`design-taste-frontend\`). Use that file when the project already vendors it. Use this skill to decide direction before writing CSS.

## Procedure

1. Read the brief: audience, page type (marketing / app / dashboard), brand constraints, RTL or LTR.
2. Write one design sentence: who it is for, the mood, and what must not look templated.
3. Set three dials (1–10) and keep them for the whole page:
   - \`DESIGN_VARIANCE\` — 1 centered/symmetric, 10 asymmetric.
   - \`MOTION_INTENSITY\` — 1 static, 10 cinematic. Honor \`prefers-reduced-motion\`.
   - \`VISUAL_DENSITY\` — 1 airy, 10 dense data.
4. If the brief names Material, Fluent, Carbon, Polaris, Primer, GOV.UK, Radix, shadcn, or Tailwind, use that official package. Do not hand-draw a fake version.
5. Lock one accent, one corner radius, and one type scale. Do not mix three visual languages.
6. Hero: one claim, at most two lines, one primary action. Sections must not all be the same three-column card row.
7. Motion only on \`transform\` and \`opacity\`.

## Pre-flight

- Text contrast at least 4.5:1 for body copy.
- Focus rings visible.
- Clickable targets at least 44px on touch.
- No emoji as the only icon.
- Redesigns keep URLs, form field names, and the wordmark unless the user asked to change them.

## Stop

Ask once if brand colors or an existing design system are unknown and the choice would change the page.
`,
  },
  {
    name: "owner-credential-vault",
    description:
      "Store the operator's own automation secrets in the OS credential store (Windows Credential Manager or keyring), never in git. Use when saving API tokens, SMTP, or OAuth client secrets the operator owns so later runs can read them without printing them. Do not use to extract browser passwords, decrypt Chrome cookies, or sign into accounts the operator does not own.",
    body: `# owner-credential-vault

Chrome remembers passwords inside the user's profile. This skill does the same job for **automation secrets the operator owns**, using the operating system store. It does not read Chrome's Login Data, cookie jars, or anyone else's accounts.

Pair browser work that already has a live login with \`logged-in-browser\`. Do not replay a password into a site when a visible logged-in window already exists.

## Allowed

- API tokens, webhook secrets, and OAuth client secrets the operator created.
- A dedicated automation Chrome profile the operator signed into once, launched by them.
- Names in the vault; values stay in the OS store.

## Forbidden

- Decrypting Chrome/Edge password databases.
- Copying cookies to impersonate a session.
- Printing, logging, or committing secret values.
- Storing credentials for an account the operator does not control.

## Windows (default)

\`cmdkey\` puts the secret on the command line. Prefer Python \`keyring\` (DPAPI-backed on Windows):

\`\`\`powershell
python -m pip install --user keyring
python -c "import keyring; keyring.set_password('rctc-owner-vault','NAME', input('secret: '))"
python -c "import keyring; import os; v=keyring.get_password('rctc-owner-vault','NAME'); os.environ['NAME']=v or ''; print('loaded' if v else 'missing')"
\`\`\`

Use the secret only as an environment variable for the next process. Do not echo it.

## Layout

| Item | Where |
|---|---|
| Secret value | OS credential manager, service \`rctc-owner-vault\` |
| Secret name + purpose | repo file \`vault.names.md\` (names only) |
| \`.env\` | local, gitignored, generated at runtime if a tool insists on a file |

## Check

- \`git status\` shows no secret material.
- A fresh shell can resolve the name without opening a password manager UI only when the operator is logged into Windows.
`,
  },
  {
    name: "git-worktree-flow",
    description:
      "Isolate feature work in a git worktree and open a small pull request. Use when the user wants parallel branches, a clean master, or a reviewable diff without mixing unrelated files.",
    body: `# git-worktree-flow

1. \`git status\` — do not stash over someone else's uncommitted work without saying so.
2. \`git fetch origin\`.
3. \`git worktree add ../repo-feature -b feat/short-name origin/master\` (or the repo default branch).
4. Commit only files that belong to the task. No secrets, no \`node_modules\`.
5. Push and open a PR whose body says what changed and how it was checked.
6. Remove the worktree after merge: \`git worktree remove ../repo-feature\`.

Default branch in this repo is \`master\`.
`,
  },
  {
    name: "pr-review-surgeon",
    description:
      "Review a pull request for correctness bugs, security mistakes, and missing tests. Use when the user asks for a code review. Report findings first, ordered by severity, with file references.",
    body: `# pr-review-surgeon

Read the diff and nearby code. Do not restyle the change.

Order:

1. Bugs that change behavior or data.
2. Auth, injection, secret leakage, path traversal.
3. Missing tests for the risky branch.
4. API or migration compatibility.

Each finding: severity, file, why it fails, what to change. If nothing important is wrong, say so and mention residual risk (unrun tests, unseen production config).
`,
  },
  {
    name: "debugger-hypothesis",
    description:
      "Debug by stating one hypothesis, a cheap observation, then a fix. Use when a bug, failing test, or unexpected runtime behavior needs a cause before an edit.",
    body: `# debugger-hypothesis

1. Restate the symptom with the exact error text or a failing command.
2. Write one hypothesis.
3. Run the smallest observation that would falsify it (one test, one log line, one query).
4. If falsified, write the next hypothesis. Do not stack speculative edits.
5. Patch the confirmed cause. Re-run the same observation.

Do not claim the bug is fixed without the observation passing.
`,
  },
  {
    name: "api-error-contracts",
    description:
      "Design HTTP or RPC errors as a stable contract: status, machine code, and a safe message. Use when adding endpoints, fixing client error handling, or stopping leaked stack traces.",
    body: `# api-error-contracts

Every error response the client branches on needs:

- HTTP status (or RPC code) chosen from the project's existing set.
- A stable machine \`code\` string.
- A human message that does not include secrets, SQL, or file paths.
- One log line on the server with a request id.

Document the codes next to the route. Add a test that asserts status + \`code\` for the main failure (validation, not found, conflict, unauthorized).
`,
  },
  {
    name: "sql-migration-safety",
    description:
      "Write expandable database migrations that can deploy before the new code reads them. Use when changing schema, indexes, or backfills on PostgreSQL or MySQL.",
    body: `# sql-migration-safety

1. Expand first: add nullable columns or new tables. Do not rename or drop in the same release as the code switch.
2. Backfill in batches. Avoid a single transaction that locks a large table.
3. Index with the engine's non-blocking option when the table is large (\`CREATE INDEX CONCURRENTLY\` on PostgreSQL).
4. Deploy code that writes both old and new shapes, then switch reads, then contract (drop) in a later migration.
5. Include a down strategy or an explicit "forward-only" note.

Run the migration against a scratch database before calling it done.
`,
  },
  {
    name: "test-first-slice",
    description:
      "Add one failing test that names the bug or the new behavior, then the smallest code that passes it. Use when fixing a defect or adding a narrow feature with a clear oracle.",
    body: `# test-first-slice

1. Name the behavior in one sentence.
2. Add a test that fails for that reason only.
3. Implement the smallest change that passes.
4. Re-run the new test and the nearest existing suite the change could break.

Do not add a framework, snapshot the whole page, or skip the failing test to go green.
`,
  },
  {
    name: "github-actions-min-ci",
    description:
      "Add a small GitHub Actions workflow that installs dependencies, runs the repo's real check, and does not print secrets. Use when CI is missing or a workflow needs a tighter job.",
    body: `# github-actions-min-ci

Prefer one workflow file:

- Trigger: \`pull_request\` and \`push\` to the default branch.
- Pin action major versions (\`actions/checkout@v4\`).
- Install from the lockfile (\`npm ci\`, \`pip install -r\` with hashes if the repo uses them).
- Run the command the repo already documents (\`npm test\`, \`npm run validate:repo\`).
- \`permissions: contents: read\` unless the job must write.
- Secrets only via \`secrets.*\`. Never \`echo\` them.

Show a failing run's relevant log lines before changing the workflow again.
`,
  },
  {
    name: "docker-compose-dev",
    description:
      "Run local dependencies with Docker Compose without putting the app's production secrets in the compose file. Use when a programmer needs Postgres, Redis, or a worker on localhost.",
    body: `# docker-compose-dev

1. Compose is for local dependencies. The app can still run on the host if that is simpler.
2. Pin image tags. Map ports only to \`127.0.0.1\`.
3. Passwords for local databases are dev-only and come from a gitignored env file, not from a committed default that matches production.
4. Add a healthcheck for any service the app waits on.
5. Document one command: \`docker compose up -d\` and the matching URL.

Do not mount the Docker socket into the app container.
`,
  },
  {
    name: "a11y-rtl-web",
    description:
      "Make web UI keyboard-accessible and correct in Arabic RTL. Use when building or fixing pages for Arabic users, focus order, labels, or contrast.",
    body: `# a11y-rtl-web

1. Set \`lang\` and \`dir="rtl"\` on the document or the Arabic subtree, not via CSS alone.
2. Use logical properties (\`margin-inline\`, \`padding-inline\`) instead of physical left/right when the layout mirrors.
3. Every input has a visible label. Icon-only buttons have an accessible name.
4. Focus order follows the visual order. Do not trap focus except in a real dialog, and then restore it on close.
5. Contrast 4.5:1 for text. Do not convey state by color alone.
6. Check a 200% zoom pass and one keyboard-only pass of the changed flow.
`,
  },
  {
    name: "web-vitals-budget",
    description:
      "Keep a web page inside a small performance budget: LCP, INP, and CLS. Use when a page feels slow, images are heavy, or a change might cause layout shift.",
    body: `# web-vitals-budget

Measure before tuning. Targets for a marketing or app shell:

- LCP under 2.5s on a mid-tier mobile profile.
- INP under 200ms for the main interaction.
- CLS under 0.1.

Fixes in this order: correct image dimensions and modern formats, font subsetting, less client JS on the first screen, no layout-shifting banners. Do not add a performance library to "fix" a single oversized image.
`,
  },
  {
    name: "twelve-factor-config",
    description:
      "Keep configuration in the environment, with a committed example file and no production secrets in the repo. Use when adding settings, feature flags, or a new deployment target.",
    body: `# twelve-factor-config

1. Code reads configuration from the environment.
2. Commit \`.env.example\` with empty or dummy values and one-line comments.
3. Gitignore real \`.env\` files.
4. Fail fast at startup when a required variable is missing. Do not fall back to a production secret.
5. Separate public config (\`NEXT_PUBLIC_\` / client bundles) from server secrets. Anything in the client bundle is public.

Pair secret storage with \`owner-credential-vault\`.
`,
  },
  {
    name: "observability-starter",
    description:
      "Add request-scoped logs with a correlation id and one health/readiness distinction. Use when a service fails in production and logs are unstructured or secrets leak into them.",
    body: `# observability-starter

1. One logger, structured fields: timestamp, level, message, request id, route.
2. Generate a request id at the edge and pass it through outbound calls.
3. \`/health\` means the process is up. \`/ready\` means dependencies needed for traffic are up.
4. Never log authorization headers, cookies, passwords, or full payment payloads.
5. On an error path, log the exception type and request id; return the safe API error from \`api-error-contracts\`.
`,
  },
  {
    name: "refactor-characterization",
    description:
      "Change structure without changing behavior by locking current behavior with a characterization test first. Use when the user asks to clean up, split a module, or rename internals.",
    body: `# refactor-characterization

1. Agree the observable behavior that must stay (API response, CLI output, rendered text).
2. Add a test that records that behavior as it works today.
3. Move code. Do not mix a bugfix into the same commit.
4. The characterization test stays green. If it fails, the refactor changed behavior — revert that part.
5. Commit message says it is a refactor.

If the user also wants a bugfix, do that in a second commit after the move.
`,
  },
  {
    name: "typescript-boundaries",
    description:
      "Keep TypeScript boundaries strict: validate input at the edge, use narrow types inside, avoid any and unchecked casts. Use when adding API handlers, parsing JSON, or reviewing TS errors.",
    body: `# typescript-boundaries

1. Untrusted input (HTTP, env, JSON files) is \`unknown\` until a parser accepts it (zod, valibot, or a hand-written guard).
2. Do not use \`any\`. A cast needs a one-line comment naming the invariant.
3. Export types from the module that owns the data, not from a dump of \`types.ts\` that imports everything.
4. \`strict\` stays on. Do not fix a build by skipping \`tsc\`.
5. Public functions return a result or throw a typed error the caller can handle; do not return \`null\` for three different failures.
`,
  },
  {
    name: "release-notes-from-git",
    description:
      "Write release notes from merged commits and pull requests, grouped by user impact. Use when tagging a version or preparing a changelog entry.",
    body: `# release-notes-from-git

1. \`git log --oneline <previous-tag>..HEAD\` and the merged PR titles.
2. Group lines as: added, fixed, changed, security. Drop typo-only noise unless the user wants everything.
3. Write what a user of the software can do differently, not the file list.
4. Link the compare URL.
5. Do not invent fixes that are not in the log.

Update \`CHANGELOG.md\` only when the repo already keeps one.
`,
  },
  {
    name: "supply-chain-pinning",
    description:
      "Pin dependency installs to a lockfile and review new packages before adding them. Use when adding a library, bumping versions, or checking a suspicious install script.",
    body: `# supply-chain-pinning

1. Install with the lockfile (\`npm ci\`, not a floating \`npm install\` in CI).
2. Before adding a package: check weekly downloads are not the only signal — read the repo, the install script, and whether a stdlib or an existing dependency already does the job.
3. Prefer a direct dependency you import over a chain of unused extras.
4. Commit the lockfile in the same change as \`package.json\`.
5. If an install script needs network or shell, say so in the PR. Do not disable TLS or ignore signature checks to make an install pass.
`,
  },
  {
    name: "incident-debug-playbook",
    description:
      "Run a short production incident loop: impact, mitigation, evidence, then a written follow-up. Use when a live service is failing and the user needs a calm sequence rather than a refactor.",
    body: `# incident-debug-playbook

1. Impact: who is affected, since when, which route or job.
2. Mitigation before root cause: rollback, feature flag, or scale — pick the one the repo already supports.
3. Evidence: one dashboard, one log query, or one failing health check. Save the request id.
4. Fix forward only after mitigation holds.
5. Follow-up note: trigger, what mitigated, what still needs a test.

Do not restart everything at once. Do not delete production data as a first step.
`,
  },
  {
    name: "consistent-character-video",
    description:
      "Plan a ComfyUI video series with a locked character bible and Saudi-dialect dialogue handled outside the video model. Use when the user wants recurring characters, episode scenes, Wan, or LTX workflows. Choose Wan 2.2 I2V for face stability and LTX-2.3 when length or native audio matters more.",
    body: `# consistent-character-video

Video models do not speak a dialect reliably. Write the Saudi dialogue as text, then record or synthesize voice separately. The image model only keeps the face and wardrobe.

## Character bible (one file per person)

- Canonical portrait: front, neutral light, no sunglasses.
- Two extra refs: three-quarter and full outfit.
- Locked: age range, hair, wardrobe colors, props. Do not re-roll these per episode.
- Negative: extra fingers, different outfit, different face, text artifacts.

## Model choice (ComfyUI, 2026)

| Need | Model |
|---|---|
| Same face across shots, photoreal motion | **Wan 2.2 I2V 14B** (image-to-video from the canonical still). 16GB+ VRAM; Lightning/LightX2V LoRA if you must go faster. |
| Longer clips or audio in one pass, less VRAM | **LTX-2.3** (about 8GB+ GGUF). Weaker identity on close-ups — still start from the same still. |
| Swap a character onto existing motion | Wan 2.2 Animate with a reference image, short source clips. |

Generate 2–4 seconds per shot. Low motion preserves the face. Same seed family per character when the workflow exposes it. Cut in an editor; do not ask one generation for a whole episode.

## Saudi dialogue

1. Write lines in Najdi or the requested regional dialect, not formal MSA, unless the character is a news anchor.
2. Record a human or use a voice product that explicitly offers a Saudi Arabic voice.
3. Lip-sync only if the workflow is built for it (Wan Animate). Otherwise cut on the voiceover.

## Shot list

Each shot: location, action in one sentence, start image (which bible frame), duration, line of dialogue. Reject a shot whose start image is not from the bible.
`,
  },
];

for (const skill of skills) {
  const dir = join(root, skill.name);
  mkdirSync(dir, { recursive: true });
  const description = JSON.stringify(skill.description);
  const md = `---\nname: ${skill.name}\ndescription: ${description}\n---\n\n${skill.body.trim()}\n`;
  writeFileSync(join(dir, "SKILL.md"), md, "utf8");
}

const index = `# حزمة أفضل 20 مهارة للمبرمج — programmer-essentials-20

مهارات أصلية لمستودع [kazoya/rctc-skill](https://github.com/kazoya/rctc-skill). ليست نسخاً من مهارات المستودع الحالية.

| # | المجلد | متى |
|---|--------|-----|
${skills.map((s, i) => `| ${i + 1} | \`${s.name}\` | ${s.description.split(". Use when")[0].replace(/\\n/g, " ")} |`).join("\n")}

## التصميم

\`design-taste-rctc\` يضبط الاتجاه (جمهور، ثلاثة مؤشرات، نظام تصميم رسمي، فحص قبل التسليم). الملف الطويل الكامل يبقى عند [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) إن أردت قاعدته كما هي.

## الأسرار

\`owner-credential-vault\` يخزّن أسرار **المالك** في مخزن نظام التشغيل. جلسة المتصفح المفتوحة أصلاً تبقى على مهارة \`logged-in-browser\` داخل المستودع. لا استخراج لكلمات مرور كروم.

## التثبيت المحلي

انسخ كل مجلد يحتوي \`SKILL.md\` إلى \`.cursor/skills/\` في المشروع (المجلد متجاهَل في git حتى لا تتكرر النسخ).
`;

writeFileSync(join(root, "README.md"), index, "utf8");
console.log("wrote", skills.length, "skills");
