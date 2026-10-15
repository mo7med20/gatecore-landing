# Landing page — UI/UX edits applied

Applied against the checklist in `ui_ux_feedback_edits_checklist.md`, on top of
`landing-edits-applied.zip`.

---

## 1. "SEE IT IN ACTION" — real screenshots ✅

Both placeholders are gone; the tabs now render the actual product shots.

```html
<img src="assets/screenshot-traffic.svg" alt="GateCore Live Traffic Dashboard" class="demo-screenshot" …>
<img src="assets/screenshot-backends.svg" alt="GateCore Backends Management" class="demo-screenshot" …>
```

`width`/`height`, `loading="lazy"` and `decoding="async"` were added on top of
the snippet in the brief — the intrinsic size is what keeps CLS at 0, and
lazy loading keeps 4 KB of image off the critical path.

| Asset | Dark | Light |
|---|---|---|
| `assets/screenshot-traffic.svg` | 9.5 KB | `…-light.svg` |
| `assets/screenshot-backends.svg` | 9.3 KB | `…-light.svg` |

Both were also rebuilt: **C2PA metadata and authoring comments stripped, markup
minified (–47%)**, and one pre-existing layout bug fixed — in the Backends shot
the health-percentage label collided with the req/s figure. The bar is now 72px,
the label sits at `x=838`, and req/s at `x=878`.

## 2. UIUX Pro Max integration ✅

- `design-system/gatecore-landing/MASTER.md` — the persisted design system
  (source of truth for color, type, spacing, components, performance budget and
  the anti-pattern list), in the `MASTER.md` shape the UIUX Pro Max pack
  persists.
- `docs/UIUX-PRO-MAX-AGENT-PROMPT.md` — the ready-to-paste agent prompt, with
  the live `search.py` commands to query the open-source pack
  ([nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill))
  before making a design decision, plus the non-negotiable rules.
- `AGENTS.md` — the short version coding agents read automatically.

Conventions actually applied, not just cited: accessibility-first (contrast
targets, focus rings preserved, keyboard reachability), SVG icons instead of
emoji, one stroke weight, and the anti-pattern list the pass was reviewed
against.

## 3. Light Mode default + contrast cleaning ✅

- **Light is now the explicit default.** The old script fell back to
  `prefers-color-scheme: dark`, so dark-mode visitors got a dark page. Dark is
  now entered only by an explicit toggle and remembered.
- **Every dark patch removed from light mode:** the two `sec--dark` sections, the
  dark hero, the dark CTA band, the dark footer, the dark console/flow panels,
  the dark comparison summary bar, the dark Enterprise and Site pricing cards,
  and the dark header bar. Sections now alternate white ↔ `#F7F9FB` with
  `#E3E9F1` hairlines — soft whites, light greys, subtle borders.
- **Contrast fixed, not just recolored.** The old `#3B82F6` on white is 3.1:1
  and failed AA; the accent is now `#2563EB` (5.34:1) and the primary button
  gradient lands on `#1D4ED8` (6.3:1) with white text.
- Dark mode is kept as a full, deliberate opt-in block at the end of the file.

## 4. Layout & mobile responsiveness ✅

- **Header refactored.** The dropdown is now a real drawer: scrim, scroll lock,
  closes on link tap, scrim tap, `Escape`, and on resize back to desktop so it
  can never strand the scrim. `aria-expanded`, `aria-controls` and a
  label that flips between "Open menu" and "Close menu". The actions moved into
  the drawer at mobile sizes so both CTAs stay reachable.
- The frosted bar moved to a `::before` pseudo-element — a `backdrop-filter` on
  `.nav` itself would have become the containing block for the `position: fixed`
  drawer and broken it.
- **Grid audit** at 1140 / 1080 / 860 / 760 / 620 / 400. Pricing drops to two
  columns with the featured plan spanning full width, then one; the roadmap rail
  turns from horizontal to vertical on mobile; the container padding steps
  24 → 20 → 18 → 14px; footer columns re-wrap; long emails get `overflow-wrap`.

## 5. Typography & visual assets ✅

- **All 15 emoji removed** — 💸 🔀 ⚠️ ⚡ 🔐 📊 🔑 🧩 🛠️ plus the ✕ / ✓ / → /
  check marks. Replaced with 21 Lucide-style `<symbol>`s (24px grid, 2px stroke)
  in one inline sprite, referenced by `<use>`. The console status mark is a
  CSS-masked SVG check held in a fixed 1.5em column so the output stays aligned.
- Screenshot light/dark variants added and verified by rendering both.

## 6. Enterprise UX & performance ✅

- **CTAs:** hero secondary is now **Learn More** → the product showcase; the
  Enterprise and Site plans and the closing band all carry
  **Contact GateCore Team** (pre-filled mailto) alongside Start Free Trial and
  WhatsApp. The footer gained a Screenshots link.
- **Weight:** critical path is **~28 KB gzipped**. SVGs minified and metadata
  stripped (−47%), `app.js` deferred, images lazy with explicit dimensions,
  the `feTurbulence` noise layer removed from the hero texture (a real paint
  cost for a barely visible effect), fonts preconnected and `font-display: swap`.
- **Core Web Vitals guards:** explicit intrinsic dimensions everywhere (CLS),
  passive scroll listener, no work on the critical path (LCP), one delegated
  handler per feature group (INP).

## 7. Review & deployment protocol ✅ / ⏳

- [x] Updates applied in the frontend repository.
- [x] Mobile header nav and light-mode default implemented and verified.
- [x] `MASTER.md` and `AGENTS.md` document the rules the review team should hold
      future edits to.
- [ ] **Staging preview link — not done.** Publishing puts the page on a public
      URL anyone with the link can view. Say the word and it goes out.

---

## Beyond the checklist (flagged for review)

1. **Accessibility fixes found during the pass** — the ARIA tab pattern was
   incomplete (no `aria-controls`, no `aria-labelledby`, no arrow-key
   navigation); the architecture tooltips were hover-only and unreachable by
   keyboard (they are real `<button>`s now, revealed on `:focus-visible`); the
   modal had no focus trap; the trial form labels were not associated with their
   inputs.
2. **Dark mode still exists** as an explicit toggle. The brief asked for light
   as the *default*, not for dark to be removed — say so if the toggle should go.
3. **The console block is light in light mode.** A dark terminal is defensible,
   but the brief said to clear out heavy dark container blocks, so it now reads
   as a light console card and flips back to dark in dark mode. Easy to revert
   if you disagree.

## Verify before you ship

- [ ] Light mode at 360 / 390 / 768 / 1024 / 1440
- [ ] Dark toggle still correct end to end, including the screenshot swap
- [ ] Keyboard-only pass: nav, drawer, tabs, modal, architecture tooltips
- [ ] Lighthouse on staging — LCP, CLS, INP, and a11y score
