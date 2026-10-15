# GateCore — repository guidance for coding agents

Static marketing site. No framework, no bundler, no dependencies. Three files
carry the whole page: `index.html`, `styles.css`, `app.js`, plus `assets/`.

## Read this before editing

1. `design-system/gatecore-landing/MASTER.md` — the source of truth for color,
   type, spacing, components, performance budget and anti-patterns. It wins
   over your own instinct.
2. `docs/UIUX-PRO-MAX-AGENT-PROMPT.md` — the full UIUX Pro Max prompt, the
   CLI to query the design pack live, and the non-negotiable rules.

## Hard rules

- **Light Mode is the default** and the base layer of `styles.css`. Dark mode is
  the opt-in `html[data-theme="dark"]` block at the end of the file, never
  inferred from `prefers-color-scheme`. No dark patches in light mode.
- **No emoji as UI.** Icons are Lucide-style `<symbol>`s in the sprite at the
  top of `index.html` — 24px grid, 2px stroke, one family.
- **Accessibility first.** ≥4.5:1 body text, never remove focus rings, name
  every icon-only control, `aria-hidden` on decorative icons, and anything
  hoverable must be keyboard-focusable too.
- **Every `<img>` needs `width`, `height`, `alt`, `loading`** — the intrinsic
  size is what keeps CLS at 0.
- **Works without JS.** The page must stay readable and complete with
  JavaScript disabled; `html.js` gates the reveal animation for that reason.
- **44px minimum touch targets**; verify 360 / 390 / 768 / 1024 / 1440.

## Assets

`assets/screenshot-traffic.svg` and `assets/screenshot-backends.svg` each ship
in a `-light` and a dark variant; `app.js` swaps `src` on theme change. When a
screenshot changes, regenerate the pair — do not hand-tune one side.

## Checks before you call it done

- No console errors; keyboard-only pass through nav, tabs, modal and footer.
- Page weight under ~120 KB excluding fonts; hero LCP under 2 s; CLS under 0.05.
- Confirm nothing regressed in light mode *and* in dark mode.
