# GateCore — Landing Design System (MASTER)

> Source of truth for the GateCore marketing site (`/`). Derived from the
> **UIUX Pro Max** design-intelligence pack — regenerate with
> `ui-ux-pro-max search "B2B infrastructure SaaS enterprise light minimal" --design-system -p "GateCore" --persist --output-dir .`
> and then re-apply the brand overrides below. Follow the project conventions
> here instead of inventing new ones.

## Product context

| | |
|---|---|
| **Product type** | B2B infrastructure platform (SaaS landing page) |
| **Audience** | Fintech SREs, healthcare IT, MSPs, regulated on-prem teams |
| **Surface** | Single marketing page — hero, feature grid, product showcase, pricing, CTA |
| **Style** | Enterprise minimal, light-first, high-trust, evidence-led |
| **Stack** | Static HTML + CSS + vanilla JS (no framework, no build step) |
| **Constraints** | WCAG 2.1 AA, no-JS content still readable, Core Web Vitals in the green |

## Non-negotiables (UIUX Pro Max priority order)

1. **Accessibility (critical).** Body and label text ≥ 4.5:1, large text ≥ 3:1.
   Never remove a focus ring — restyle it instead. Every icon-only control has
   an accessible name. Every decorative icon is `aria-hidden="true"` +
   `focusable="false"`.
2. **No emoji as UI.** Icons come from the inline Lucide-style sprite at the top
   of `index.html` (24px grid, 2px stroke). Emoji belong in copy, nowhere else.
3. **Consistency.** One stroke weight, one radius scale, one shadow scale, one
   type scale. `same action → same component`, everywhere.
4. **Feedback within 100 ms.** Every tap, toggle, and submit produces a visible
   state change immediately.
5. **Recognition over recall.** Navigation, pricing and proof are on the page —
   nothing critical is hidden behind a hover.
6. **Error prevention over error recovery.** Trial form validates on submit and
   returns focus to the offending field.
7. **Motion is optional.** Everything animated respects
   `prefers-reduced-motion: reduce`.

## Color

### Light (default)

| Token | Value | Use |
|---|---|---|
| `--blue` | `#2563EB` | accent, links, primary actions (5.34:1 on white) |
| `--blue-600` | `#1D4ED8` | primary button gradient bottom |
| `--blue-50` / `--blue-100` | `#EFF6FF` / `#DBEAFE` | accent surfaces, badges |
| `--green` / `--green-600` | `#059669` / `#047857` | positive status, checks |
| `--red` | `#DC2626` | negative status only |
| `--ink` | `#0B1220` | headings |
| `--text` | `#33415C` | body copy |
| `--muted` | `#5B6B84` | secondary copy, labels (≈5.3:1) |
| `--line` | `#E3E9F1` | hairlines, card borders |
| `--bg` / `--bg-soft` | `#FFFFFF` / `#F7F9FB` | page / alternating band |

**Light is the default and the base layer of `styles.css`.** Dark mode is an
opt-in override block (`html[data-theme="dark"]`) at the end of the file — it is
never inferred from `prefers-color-scheme`.

### Dark (opt-in)

`--bg #0A0F1C`, `--bg-soft #0E1424`, `--card #111C33`, `--ink #F1F5F9`,
`--text #CBD5E1`, `--muted #94A3B8`, `--line #1E293B`, `--blue #60A5FA`.

**Rule:** no dark background patch survives in light mode. Sections alternate
white ↔ `--bg-soft` only. Console and screenshot cards are light surfaces with
borders, not dark slabs. Every dark fill in the hero traffic diagram is a CSS
override of the SVG's presentation attributes, so the same markup themes both
ways.

## Typography

| Role | Family | Size | Weight |
|---|---|---|---|
| Display | Inter | `clamp(2.3rem, 4.3vw, 3.45rem)` | 800 |
| H2 | Inter | `clamp(1.85rem, 3.4vw, 2.65rem)` | 800 |
| H3 | Inter | 17–21px | 700–800 |
| Body | Inter | 17px / 1.65 (16px ≤ 620px) | 400 |
| Label | Inter | 12–14px, `letter-spacing .1–.14em`, uppercase | 600–700 |
| Mono | JetBrains Mono | `.82em`, `letter-spacing .02em` | 400–500 |

## Spacing & shape

- 4px base scale: 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 72.
- `--pad`: 24px → 20px (≤860) → 18px (≤620) → 14px (≤400).
- Radii: `--r-sm 8` · `--r-md 12` · `--r-lg 18` · pills `999px`.
- Shadows: `--shadow-sm` hairline lift · `--shadow-md` card lift · `--shadow-lg` overlays.
- Tap targets: minimum 44×44px on touch (see `.demo-tab`, `.nav__burger`, `.nav__links a`).

## Components

| Component | File | Notes |
|---|---|---|
| Buttons | `styles.css` `.btn*` | 3 sizes (`--sm`/`--lg`/block), 4 variants |
| Navbar + drawer | `.nav*` | frosted bar is a `::before` so `backdrop-filter` never becomes the containing block for the `position: fixed` drawer |
| Icon sprite | `index.html` | `<symbol>` + `<use>`; one icon per concept |
| Showcase tabs | `.demo-*` | ARIA tab pattern: roving `tabindex`, arrow/Home/End keys |
| Screenshot frame | `.shot` | `width`/`height` set on every `<img>` → no CLS |
| Tooltip card | `.arch__layer` | hover **and** `:focus-visible`; it is a real `<button>` |
| Modal | `.modal*` | `aria-modal`, focus trap, Escape, focus restored |

## Performance budget

| Metric | Target |
|---|---|
| LCP | < 2.0 s — hero copy is static text, no JS on the critical path |
| CLS | < 0.05 — explicit `width`/`height` on every image, no web-font swap shifting layout |
| INP | < 200 ms — no long tasks; scroll listener is passive, work is delegated |
| Critical path | ~28 KB gzipped (HTML + CSS + JS + logo), excluding web fonts |
| Assets | SVG minified, metadata stripped, `loading="lazy" decoding="async"` below the fold |

Measured on the current build: `index.html` 10.6 KB gz, `styles.css` 10.4 KB gz,
`app.js` 3.2 KB gz, `gatecore-logo.jpg` 3.3 KB gz, each screenshot variant
~1.7–2.0 KB gz. Below-the-fold screenshots are lazy, so they never touch the
critical path.

## Anti-patterns (rejected on review)

- ❌ Emoji standing in for an icon
- ❌ Dark slabs inside a light page
- ❌ Saturated full-bleed fills on more than one card per section
- ❌ Icon-only buttons without an accessible name
- ❌ Hover-only affordances that keyboard users cannot reach
- ❌ Mixed stroke weights or a second icon family
- ❌ Layout that only works at one breakpoint

## Assets

`screenshot-traffic.svg` and `screenshot-backends.svg` each exist in a
`-light` and a dark variant. `app.js` swaps `src` on theme change; both
variants share one render, so a future screenshot refresh means regenerating
the pair, not hand-tuning two files.
