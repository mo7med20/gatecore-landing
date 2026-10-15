# Agent Prompt — apply UIUX Pro Max conventions to this codebase

Paste this into Cursor, Claude Code, Copilot, or any agent that edits the
GateCore frontend. It tells the agent where the design system lives, which
non-negotiables it must not break, and how to pull fresh UIUX Pro Max guidance
before it invents anything.

---

## The prompt

You are working on the **GateCore** marketing site — a static
HTML + CSS + vanilla JS build (`index.html`, `styles.css`, `app.js`) with no
framework and no bundler. Do not introduce one without asking.

### 1. Load the design system first

Read `design-system/gatecore-landing/MASTER.md` before you touch any markup or
CSS. It is the source of truth for color, type, spacing, components, the
performance budget, and the anti-pattern list. When it conflicts with your
instinct, it wins.

### 2. Query UIUX Pro Max instead of guessing

This project follows the open-source **UIUX Pro Max** design-intelligence pack
(`nextlevelbuilder/ui-ux-pro-max-skill` — MIT). Use it as a live reference, not
as a one-time reading.

```bash
# whole-page / new-section direction
python3 "$UI_UX_PRO_MAX_ROOT/scripts/search.py" \
  "B2B infrastructure SaaS enterprise light minimal" \
  --design-system -p "GateCore" --output-dir .

# one focused question
python3 "$UI_UX_PRO_MAX_ROOT/scripts/search.py" "mobile drawer navigation" --domain ux
python3 "$UI_UX_PRO_MAX_ROOT/scripts/search.py" "pricing cards" --domain style
python3 "$UI_UX_PRO_MAX_ROOT/scripts/search.py" "touch targets" --domain accessibility
```

`$UI_UX_PRO_MAX_ROOT` is the skill's install directory. Run the script by its
full path — never assume a working directory. If a search contradicts MASTER.md,
follow MASTER.md and note the disagreement in your summary.

### 3. Non-negotiables

- **Accessibility is priority 1.** Body and label text ≥ 4.5:1 contrast; large
  text ≥ 3:1. Never delete a focus ring — restyle it. Every icon-only control
  gets an accessible name. Decorative icons are `aria-hidden="true"` +
  `focusable="false"`. Keyboard reachability is a requirement, not a nicety:
  anything hoverable must also be focusable.
- **Never use emoji as UI.** Icons come from the Lucide-style `<symbol>`
  sprite at the top of `index.html` (24px grid, 2px stroke). Add a new
  `<symbol>` rather than reaching for a glyph.
- **One stroke weight, one radius scale, one shadow scale, one type scale.**
  Read the tokens at the top of `styles.css`; do not hardcode hex values or
  magic numbers.
- **Light Mode is the default and the base layer of the stylesheet.** Dark mode
  lives only in the `html[data-theme="dark"]` block at the end and is never
  inferred from `prefers-color-scheme`. Do not reintroduce dark background
  patches into light mode — this was an explicit product decision.
- **Every image gets `width`, `height`, `alt` and `loading`.** An explicit
  intrinsic size is how this project keeps CLS at 0. Alt text describes the
  product, not the file.
- **Mobile first in practice.** Test 360, 390, 768, 1024 and 1440 before you
  call a change done. Touch targets are 44×44px minimum.

### 4. Working agreements

- Vanilla ES5-compatible JS, no dependencies, IIFE-scoped, progressive
  enhancement: the page must stay readable with JavaScript disabled
  (`html.js` gates the reveal animation for exactly this reason).
- Add a change to the matching section of `styles.css` rather than appending
  overrides at the bottom.
- Match the existing comment style: banner comments for a new component block,
  short "why" comments where a non-obvious choice would otherwise look wrong.
- Never add a dependency without saying so explicitly and explaining the cost.

### 5. Before you report done

State, in your summary: the breakpoints you checked, the contrast ratios you
verified for anything you recolored, what the page looks like with JS off, and
any place where you deliberately deviated from MASTER.md and why.

---

## Reference

- Design intelligence pack: <https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>
- Docs and CLI reference: <https://ui-ux-pro-max-skill.com/docs/>
- This project's design system: `design-system/gatecore-landing/MASTER.md`
