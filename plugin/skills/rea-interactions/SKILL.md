---
name: rea-interactions
description: "Add a hover, click, cursor, drag, scroll-reveal, scrub, pin, parallax, marquee, loader, page-transition or text effect to an existing UI (app screens, dashboards, single components, any framework) using 2,253 ready motion parts extracted from well-made sites. Use when the user wants something to feel alive, wants a specific effect, or says 'like that site's hover'."
---

# rea-interactions — attach motion parts

A motion part is one interaction pulled out of a real site and generalized: `fx.css` (+ `fx.js`) that attach to any element with `data-fx="<name>"`. Colors and fonts come only from `--kf-*` variables, so parts take your skin.

## 1. Find the part

```sh
rea fx -q "<what it should do>"            # free words: "magnetic button", "image reveal on scroll"
rea fx -t hover -p card                    # by trigger and by what it attaches to
rea fx -s <site-slug>                      # every part a reference site uses
rea fx <name>                              # one part: curve, duration, options, attach snippet
```

Triggers: hover · click · state · cursor · key · load · loop · scroll-enter · scroll-scrub · pin-scrub · drag · focus.
Parts fit: section · photo · page · card · title · button · link · menu · list row · text · status.

Open the demo (`demo:` line) and watch it before choosing. Pick by what the element must do, not by name. Offer up to three when the user wants to choose, each as `name — one plain line · demo URL`.

## 2. Install it into the project

```sh
rea get fx:<name> --dir <project>          # fx-core.js + the part + any vendor lib it needs (with LICENSE)
```

Load order: GSAP (and plugins the part `needs`) → `library/_fx/fx-core.js` → the part's `fx.js`. Add `fx.css` with your CSS. Then mark the element:

```html
<article data-fx="card-lift" data-fx-card-lift="tilt: -2; lift: 8">…</article>
<section data-fx-scroller>…</section>   <!-- only when an inner panel scrolls instead of the window -->
```

- Options go in `data-fx-<part>="key: value; key: value"`. CSS-only parts read `--fx-<key>` variables instead.
- Child elements a part looks for are marked `data-fx-part="<role>"` (the `options` list names them).
- Several parts on one element: space-separated in `data-fx`.
- In React/Vue/Svelte: render the attributes, load the scripts once (layout/head), and call `kfFx.scan(root)` after client-side navigation if the part says so.

## 3. Keep it honest

- Keep the part's curve and duration. If the page has a tempo, change only `--fx-dur` / `--fx-ease`.
- Under `prefers-reduced-motion`, parts show the final state; don't override that.
- A press must react within 0.4 s. A loader shows once, not on every navigation.
- Check it in a browser: `rea check <page> --desktop` for console errors, then click and scroll yourself. Report what moves, with the part names.

Full attach contract: [fx.md](../rea-web/references/fx.md).
