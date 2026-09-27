---
name: secretsinnextcss
description: Design and implement accessible, privacy-safe Easter eggs, hover secrets, riddles, and progressive-discovery moments in Next.js and CSS. Use when a product needs a hidden marketing interaction, playful developer signature, viral discovery mechanic, or skill-linked puzzle without hiding essential functionality.
---

# Secrets in Next CSS

Build secrets that reward curiosity without blocking core use.

## Rules

1. Keep essential navigation, consent, pricing, safety, and legal information visible. Secrets are bonuses only.
2. Never embed credentials, private URLs, personal data, admin paths, or security controls in an Easter egg.
3. Provide an accessible alternative to hover through focus, taps, or a documented keyboard pattern when touch or assistive technology matters.
4. Respect the reduced-motion media preference. The reveal must remain usable with animation disabled.
5. Keep the discovery threshold memorable and bounded. Six hover entries, six logo taps, or one short key sequence are good defaults.
6. Track discovery locally unless the user explicitly requests analytics and gives a privacy basis.
7. Make factual jokes verifiable. Link a primary source when humor depends on a technical claim.
8. Credit linked open-source skills accurately; do not imply endorsement by a model vendor.

## RCTC Brief

- Role: interaction designer and Next.js engineer.
- Context: the page, audience, brand voice, and discovery surface.
- Task: the exact secret, trigger, reveal, reset, and optional riddle.
- Constraints: accessibility, privacy, performance, tone, and facts that require citation.

## Implementation Pattern

Use client state for the counter and modal. Count discrete pointer entries rather than animation frames. Reset the counter after reveal. Keep the modal dismissible by close button, Escape, and backdrop. For touch devices, mirror the hover count with taps.

## Quality Gate

- The normal page works when the secret is never discovered.
- Mouse, keyboard, and touch each have a path.
- The reveal is readable in RTL and LTR.
- No sensitive information exists in source or rendered output.
- Reduced-motion mode remains coherent.
- Any factual punchline links to an authoritative source.

