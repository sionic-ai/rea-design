# Mobile Layout Gate

Look at a phone screen along **two axes**. If you mix them up, you'll handle only one and assume you're done.

| Axis | Question | What catches it |
|---|---|---|
| **Hygiene** | Does it break? | One pass through the §4 checklist. Public skills and linters only cover this axis |
| **Density** | Is it usable? | **The core of this gate.** Nothing catches it automatically, and missing it gets the work sent back |

A screen that passes only hygiene "opens on a phone." It has to pass density too before people "use it on a phone." Nearly all rejections come from density.

---

## 1. Six pass conditions

Each condition is **judged** by a number, not by eye. `rea check` (§3) measures them all in one run.

### ① The first screen is data
If the title, description, filters, and notice boxes take up the first screen, it fails. People open a screen to see **"what's there right now,"** not to operate controls.

- **Check**: the y coordinate where the first data row starts. **If it's over 300px, fix it** (at 390×844).
- **Common wrong fix**: collapsing the controls into a single "Filters ▾" button. Frequently used filters then take two taps to reach. Collapsing is the last resort. Try §② first.
- For screens with no data rows, such as intro or promo pages, check whether the first action (book, contact, apply button) is visible on the first screen.

### ② Lay it flat, don't hide it
"Don't show this on phones" is not a fix. Removing a feature is different from rearranging it into one row.

- Laying five vertically stacked groups **flat, one row each**, usually wins back about half the space.
- When you put two selects on one row, **set their minimum width to `calc(50% - gap)`**. If you leave it at 0, they shrink until the chosen value no longer shows.
- If the markup order is label-value-label-value, the items get mixed up when laid out in a row. Regroup them with flex `order`.
- **The exception you may remove**: labels on values that already name themselves. `aria-pressed` still tells assistive tech which axis is which.

### ③ "Same as elsewhere" beats per-screen optimization
**Matching the layout of other screens** is better than the best layout for this one screen. Users never use only one screen.

- Before writing a new rule, **find an existing rule and extend it** (start by `grep`ping for similar media queries).
- When a page-specific class overrides a global rule, leave a comment saying why this screen differs.

### ④ Make motion intentional
Putting `position: sticky` on a "fixed top bar" means it covers the top of the screen the whole time someone reads. It should be neither always pinned nor always hidden. **The user's own gesture is the signal.** Someone scrolling up is trying to navigate.

- Hide it **only with `transform`**. If you change `display` or `position`, the content below jumps up by that height at that instant, and the line being read moves under the user's finger.
- Turn off transitions under `prefers-reduced-motion: reduce`.

### ⑤ Horizontal scrolling counts as failure
Adding a "swipe left/right" hint is an excuse, not a fix.

- Use these replacements:
  - Table → one card per row (tap to expand)
  - 12-column board → quarter or range tabs
  - Wide grid → list view
- **Detect the device by UA on the server, not by width.** Some pages have the server pick a view and query only that view. Rendering both views and hiding one with CSS doubles the queries there. Switching on the client means the user sees the page render and then change. In Next.js, use `userAgent({ headers: await headers() }).device.type`, which returns `'mobile'`, `'tablet'`, or `undefined`.
- If the default value depends on the device, **check that the URL carries that value**. Some links omit the value when it equals the default. With those links, the user's choice quietly reverts on the next tap.

### ⑥ Report in px
"Made it narrower" reads as unverified. Every report gives a **before/after pair**, such as `514 → 311px`. An item without numbers counts as not done.

---

## 2. How to look

- **Don't just shrink the browser window.** `rea check` launches a separate 390×844 viewport through Playwright.
- Shrinking the width alone skips every `(hover: none)` / `(pointer: coarse)` rule and any server branch keyed on UA. `rea check` turns on touch, mobile mode, and a phone UA together. If you use another tool (Playwright MCP, etc.), turn on `isMobile` and `hasTouch`.
- When checking bottom-fixed elements, **don't take a full-page screenshot**. Fixed elements get pinned at the end of the first screen and look missing. `--shot` captures only the first screen.
- To check scroll behavior (§④), scroll down first, e.g. `--scroll 600`, then take the shot.
- `rea check` needs Playwright and a Chromium build. If it reports a missing browser, run `npx playwright install chromium`.

---

## 3. How to measure

```sh
rea check <url|file.html|folder> [--data '<row/card selector>'] [--measure '.hero,.filters'] [--shot phone.png]
rea check <url> --desktop --shot desk.png      # same measurements at 1440×900
```

It prints a single JSON object with these fields:

- Horizontal scroll (overflow in px)
- Overflowing elements
- Data start y
- Touch targets under 44px
- Inputs under 16px
- Console errors
- `--measure` block heights

If data start comes back "not found," pass that screen's row or card selector with `--data`. Block heights are the numbers you report as "what got smaller."

The overflowing-elements list also includes elements clipped inside `overflow: hidden`, which aren't visible. Judge by the "horizontal scroll" line.

---

## 4. Hygiene checklist (short)

Public skills and linters already cover this axis well, so **just get through the list**. Don't research it again.

- Touch targets at least **44×44px** (iOS HIG), with at least 8px between them. Set these inside `@media (hover: none)`.
- **Zero horizontal scroll.** It fails if `scrollWidth > clientWidth`.
- Input text at least **16px**. Below that, iOS zooms the page on focus.
- Use **`100dvh`** instead of `100vh`. When the mobile browser's address bar collapses, `100vh` overflows the screen.
- Fixed elements that overlap the notch or home indicator use `env(safe-area-inset-*)`.
- `viewport-fit=cover` in the viewport meta.
- Truncated button labels: buttons and inputs where `scrollWidth > clientWidth`.

---

## 5. Report format

Write it in three parts. If you leave the last one empty, the work reads as fully done.

```
Changed        — data start 514 → 311px (hero 110→36 · filters 200→77 · spacing 80→48)
Concerns       — Removed the "Show" label. I judged the chip names act as the label, but that's a guess
Not verified   — Screens behind login were reviewed in code only
```

---

## 6. Still unresolved

You will have to **decide these by best guess and state them in the report**. Don't decide them silently.

- **What to remove and what to keep.** §②'s "remove it if the value names itself" is reliable only for labels. Explanatory sentences stay, because removing them brings support questions back. There's no solid basis yet for where that line falls.
- **The 300px rule is an agreed number, not a measurement.** It means the controls shouldn't take more than a third of the first screen at 390×844.
- **Observation is missing.** These judgments come from looking at screens and reasoning about them. Nobody has yet watched where real people's thumbs stop when they use these screens on a phone.
