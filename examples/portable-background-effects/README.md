# Portable background effects (ITB-style)

Demo folder you can **copy anywhere** — not tied to RCTC skill logic.

## What itb.com.sa uses

| Effect | Script | Mouse? | License |
|--------|--------|--------|---------|
| Network particles + mouse repulsion | `js/nodes.js` | **Yes** (`mousemove`) | **MIT** — [rohanrhu/nodes.js](https://github.com/rohanrhu/nodes.js) |
| Section parallax on scroll | `assets/js/jarallax.min.js` | No (scroll) | MIT |
| Sliders, sticky header, FAQ | `assets/js/custom.js` | Partially | Theme file — do not copy wholesale |
| Scroll animations | `wow.min.js`, `appear.min.js` | No | Theme/libs |

**The “screen moves with mouse” feel on the hero is almost entirely `nodes.js` + a full-screen `<canvas id="nodes">`.**

## Legal note

- Use **`nodes.js` from GitHub/npm** (MIT) for new projects.
- Copying ITB’s full `assets/` theme, images, and `custom.js` without permission may violate their license/terms.
- If you work **for ITB**, get files from your internal ASP.NET project / vendor, not by scraping production.

## Troubleshooting

### No particles / no mouse effect

1. **404 on `js/nodes.js`** — run the server from this folder (`portable-background-effects`), not repo root.
2. **`favicon.ico` 404** — harmless; demo uses empty favicon in HTML.
3. **Canvas hidden** — hero must not use an opaque background *above* the canvas; canvas lives inside `.hero` with a semi-transparent overlay only.
4. **Effect is subtle** — increase `pointerCircleRadius` (e.g. 120) in `index.html`.
5. **Animation never starts** — `nodes.js` waits for `window.load`; if load already fired, `index.html` calls `startNodes()` when `document.readyState === 'complete'`.


```powershell
cd c:\rctc-skill\examples\portable-background-effects
python -m http.server 8080
```

Open: http://127.0.0.1:8080

## Move to another site

1. Copy this folder (or only `js/nodes.js` + the init block from `index.html`).
2. Add `<canvas id="nodes"></canvas>` behind your hero (fixed, `z-index: 0`).
3. Optional: add jarallax from CDN as in `index.html`.

## ITB init (reference)

Same parameters as on https://itb.com.sa/default.aspx — see `index.html` scripts section.
