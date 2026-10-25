---
name: arabic-stage-craft
description: "Arabic-first page motion: Droid Arabic Kufi, AR/EN with Arabic default, Amman digital clock, pointer light, loader, reveal, hover, parallax, and 3D tilt. Use after design-taste-rctc and the vendored Taste Skill when a public page needs those behaviors. Reduced motion stays quiet. Do not invent facts while translating."
---

# Arabic stage craft

Motion, type, language, and light for an Arabic public page. Direction stays with `design-taste-rctc` and the vendored [Taste Skill](https://github.com/leonxlnx/taste-skill). This skill adds the stage, not a second art direction.

## Order

1. Read the brief and keep the subject's own colours.
2. Set the body face to **Droid Arabic Kufi** from local files. The clock may use Orbitron.
3. Default language is Arabic (`lang=ar`, `dir=rtl`). English is the second language. Persist the choice in `localStorage` under `site-lang`.
4. Translate only strings that already exist. Do not add claims, phones, or partners during translation.
5. Add the stage behaviors below. Skip any effect when `prefers-reduced-motion: reduce` matches.

## Stage

| Piece | Behavior |
|---|---|
| Clock | Asia/Amman, hour and minute, smaller seconds, localized date. Render the time only after mount. |
| Language | `AR` / `EN` chips. Arabic is the first paint. |
| Loader | One short full-screen ring, then it leaves. |
| Reveal | Intersection observer adds `.is-visible` once. |
| Hover | A small lift on links and cards. |
| Parallax | A few pixels of scroll shift, clamped. |
| Tilt | A slight 3D response on the clock card. |
| Light | A pointer glow that follows the mouse on fine pointers only. |

## Do not port

A contact form that pretends a message was sent. Product catalogs, prices, or partner lists from another site. German, unless the page already has it.

## Check

- Arabic is the first paint, and English does not change `dir` until the visitor chooses it.
- The clock does not mismatch on hydration.
- Reduced motion removes the loader spin, reveal delay, and pointer chase.
- A build of the page succeeds before the skill is called done.
