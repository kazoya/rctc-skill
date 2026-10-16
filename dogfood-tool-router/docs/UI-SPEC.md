# Skills dashboard card (spec only)

21st MCP was not called. No component was copied. No private project file was uploaded. `twentyfirst_mcp.enabled` stays false. Any later component from 21st.dev needs its own license check before it enters this repo.

## Component

One card in a list of skills. The page `dir` follows the skill language: `rtl` for Arabic, `ltr` for English.

## Content

- Skill name as the heading
- One sentence: when to use it
- A link to `SKILL.md`
- State text: `off` or `on` for an external tool, never a color alone

## Keyboard and accessibility

- The card is an `<article>` with a single `<a>` on the skill name
- Visible `:focus-visible` ring, at least 2px, not color-only
- Contrast of the state text at least 4.5:1 against the card background
- The state is a word (`off` / `on`) plus the name of the tool
- Honor `prefers-reduced-motion`. No autoplaying animation

## Out of scope

This spec does not ship CSS, a server, or a 21st generation. Backend tasks, secret storage, and security checks do not render this card.
