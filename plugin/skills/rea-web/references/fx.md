# Motion parts: hover responses and scroll effects pulled out of site code

Motion in the library's sites is tangled up with each site's content and skin. Screens that don't take a whole section (apps, launchers, dashboards) lose that motion when they try to port it.

So each motion is extracted into its own **motion part (fx)**. To use one, pick it with `rea fx -p card`, then add `data-fx="<name>"` to your own element.

## One part = one folder

```
library/_fx/fx-core.js      shared base — load it before any part's js
library/_fx/<name>/
  fx.json     what it is, when and where it fits, values, source
  fx.css      targets only [data-fx~="<name>"]. Colors and fonts via --kf-* variables only
  fx.js       (optional) loaded as a plain <script>. No modules, no build step
  demo.html   a single page showing only this part on the default unskinned theme, attached to common elements such as buttons, cards and list rows
```

## Attachment contract

```html
<section data-fx-scroller>                                    <!-- mark this if it's an in-app scroll panel; otherwise the window scrolls -->
  <article data-fx="card-lift pin-stack" data-fx-card-lift="tilt: -2; lift: 8" style="--fx-tilt: -2deg">
    <span data-fx-part="handle">…</span>                     <!-- a child the part looks for -->
  </article>
</section>
```

- **`data-fx`**: names of the parts to attach, space-separated. You can list several.
- **Options**: use `data-fx-<part name>="key: value; key: value"`. Options are namespaced by part name, so several parts on one element never mix their options.
  - CSS-only parts can't read attributes. They take numeric values from `--fx-<key>` variables, set in `style` or in your own CSS.
  - Variables can't express variants. A part with variants (such as glow or quiet) takes them as `look: <variant>`, and its CSS selects them with `[data-fx-<part>*="look: <variant>"]`. For this reason, always write `key: value` with exactly one space after the colon.
- **Child markers**: use only `data-fx-part="<role>"`. Put any value tied to the role (a screen slot name, for example) in a separate attribute such as `data-key`. If an element has `data-fx-part` twice, only the first one is read.
  - Never follow `data-fx-` with anything other than a part name, because it would be confused with options. If the CSS targets a made-up attribute like `[data-fx-soft]`, it won't apply to elements written the way the `use` example shows. The lint tool flags this as **attribute name**.
- **`data-fx-scroller`**: put this on the inner panel when that panel scrolls instead of the window. Scroll parts pass the `scroller` they receive to ScrollTrigger.

`fx.js`:

```js
(() => {
  kfFx.register("card-lift", (el, { options, reduce, hover, scroller }) => {
    if (reduce) return;
    const tilt = Number(options.tilt ?? -1.5), ease = kfFx.ease(options.ease || "0.25,1,0.5,1", "power3.out");
    const on = () => gsap.to(el, { y: -6, rotate: tilt, duration: 0.4, ease });
    const out = () => gsap.to(el, { y: 0, rotate: 0, duration: 0.4, ease });
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", out);
    return () => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", out); gsap.set(el, { clearProps: "transform" }); };
  });
})();
```

- **Wrap the whole file in `(() => { … })();`.** Consumers bundle several parts into one file. A single top-level `const` makes every part after the first fail entirely with "already been declared". Loading each part as a separate `<script>` fails the same way, because they share the global scope. The lint tool flags this as **global name**.
- **Write source easing curves as `kfFx.ease("0.16,1,0.3,1", "expo.out")`.** If CustomEase is loaded, the exact cubic values are used. Otherwise the GSAP curve in the second argument is used. Don't copy a conversion helper into each part.
- **The returned function is the teardown.** `fx-core.js` calls it when the element is removed or the name is removed from `data-fx`. If you created ScrollTriggers, ticker callbacks or window listeners, you must return a teardown.
  - Pinning parts only need to call `revert` in their teardown. If ScrollTrigger re-inserts an already-removed element back into a pin-spacer slot, `fx-core.js` removes it again.
  - GSAP may briefly attach and detach a removed element while the teardown clears its styles. `fx-core.js` doesn't treat that as a new element.
- **`fx-core.js` attaches parts for you.** It scans `[data-fx]` and attaches once per element. It also attaches to elements added later and re-applies when `data-fx` changes later. Parts must not scan with `querySelectorAll` themselves.
  - The first scan runs after DOMContentLoaded. If that has already passed, it runs after the currently executing script finishes. So even if you bundle parts with page scripts into one deferred file, parts attach after markers like `html.js` are set.
  - Elements in hidden panels aren't measured as zero-size, so parts don't need to wait on their own.
- **`reduce`**: leave the element in its final state and return.
- **`hover`**: when it is false (touch devices), convert hover responses to press, or turn them off.

## fx.json

```json
{
  "kind": "hand",
  "trigger": "hover",
  "fits": ["card", "list row", "photo"],
  "what": "The card lifts 6px, tilts -1.5°, and its shadow deepens",
  "ease": "power3.out",
  "duration": 0.4,
  "needs": ["gsap"],
  "options": { "tilt": "tilt in degrees, default -1.5" },
  "use": "<article data-fx=\"card-lift\" data-fx-card-lift=\"tilt: -2\">",
  "from": [{ "slug": "portfolio-list", "where": "list.html project cards" }]
}
```

- **`kind`**: `hand` (responds to the user's hand) or `scroll` (scroll, page load, or runs on its own).
- **`trigger`**: a string for one trigger, or an array when several overlap (`["loop", "click"]`).
  - Hand: `hover`, `click`, `cursor`, `drag`, `focus`, `state` (when a state changes).
  - Scroll: `scroll-enter`, `scroll-scrub`, `pin-scrub`, `load`, `loop`.
- **`fits`**: elements it suits. Choose from button, link, card, list row, photo, heading, text, input, menu, status indicator, section, page.
- **`duration`**: a number in seconds for one duration, an object like `{ "in": 0.6, "out": 0.3 }` for several, or `{ "bpm": 120 }` for beat-driven motion.
- **`pin`**: only for parts that pin to the screen.
  - `"sticky"`: use when you only need pinning. It doesn't break inside inner scroll panels.
  - `"scrolltrigger"`: use when a timeline runs while pinned and spacing is required.
- **`needs`**: anything that must be loaded first, such as `gsap`, `ScrollTrigger`, `SplitText` or `lenis` (from `_shared/vendor/` or `_vendor/`).
- **`from`**: the neutral library slug of each site the motion was extracted from, and where in that site it appears. Never put original site names, domains or class names here.
- **Easing and durations** stay exactly as in the source. If the source uses a GSAP name (`power3.out`), write it as is. Record anything you deliberately changed from the source in `"note"`.

## Authoring rules

- **Search first.** Before building a new part, run `rea fx -q <word>` to check whether the same motion already exists. If it does, just add your source to its `from`.
- **Naming.** Name a part for what it does, in lowercase English with hyphens (`card-lift`, `text-roll`, `pin-stack`, `cursor-label`).
- **Generalize from the source.** Extract only the motion from the site's code and generalize it. Don't depend on the site's class names or content (its images or copy). Look only at `[data-fx~="<name>"]` and `data-fx-part` children.
- **Skin only through variables.** `node tools/library-lint.cjs --fx <name>` must report 0. Sizes must scale with the element's size or come from options.
- **Make waiting time adjustable.** Parts that make people wait (loaders, page-transition covers, curtains, open/close) must expose their timing as options (`dur`, `each`, `delay`, etc.). The defaults are the source values.
  - Screens that navigate often, such as apps, fall under the rule "don't make people wait on every screen change" and must shorten these. If the values are hard-coded, the part can't be used and has to be rewritten by hand.
- **Read numeric options where 0 is meaningful as `+(options.x ?? default)`.** This applies to tilt, offset, duration, gap, delay and speed.
  - `+options.x || default` turns `"0"` into the number 0, treats it as falsy and falls back to the default. Users then can't stand a card upright with `tilt: 0` or skip a transition with `dur: 0`.
  - Use `||` only for numbers where 0 would break the part: bpm, cell size, count, repeat interval.
- **Shadows are skin too.** Use only `var(--kf-shadow-soft)` and `var(--kf-shadow-lift)`. Some skins turn shadows off (`none`). The lint tool also counts shadow colors in parts.
- **Give new variables a default.** Every `--kf-*` a part uses has a default in `_shared/kf-defaults.css`. Consumers that load only a skin without kf-defaults (apps) must fill in values the skin lacks, such as `--kf-contrast-*`, themselves. So if you start using a non-standard variable, add a default for it to kf-defaults as well.
- **Don't block phones.** When `hover` is false, don't hijack touch: no `preventDefault` on `touchstart` or `touchmove`. Swiping over a drag or physics part must still scroll the page.
  - If dragging is the part's whole job (drawing, map panning) and must be captured, say so in `note` in `fx.json`, and tell users not to let the panel cover the full screen height.
- **Don't replace spaces with `&nbsp;`.** When splitting text into characters, wrap each word in a `display:inline-block` chunk and leave the spaces between them intact. Otherwise multi-line Korean headings (`word-break: keep-all`) break mid-word.
- **Don't remove keyboard focus indicators.** Use `outline: none` on `:focus-visible` only when another indicator, such as a `--kf-accent` border, takes its place.
- **Re-measure with `ResizeObserver`.** Parts that measure sizes must not measure only on attach and window resize. Heights change late because of fonts, images and other parts (pin-spacers).
- **Guard frame deltas.** The time between frames (`now − last`) can be 0 or negative. Start the first frame with `last = now` and clamp with `Math.max(1, …)`.
- **Stay quiet when children are missing.** Apps attach parts to empty lists or leave out optional children (hint text, covers, lines).
  - Pass optional children to GSAP only when they exist; empty targets trigger a "target not found" warning.
  - If a required child or text is missing, attach nothing and return. Don't throw null-read errors.
  - `node tools/library-fx-check.cjs <name>` opens the demo as is and with empty elements, then collects warnings and errors. Both counts must be 0.
- **Respect reduced motion.** Wrap scroll effects in `gsap.matchMedia()`. Turn off transitions in hover-response CSS under `@media (prefers-reduced-motion: reduce)`.
- **Build `demo.html` to these rules:**
  - It loads `../../../_shared/wire.css`, `kf-defaults.css` and `../fx-core.js`, and stands without any skin.
  - It shows one line telling the viewer what to try ("Hover over the card").
  - Any placeholder copy is English ("Your title here").
  - It adds one element after 1 second, to show that late-added elements get the part.
  - It removes one element, to show that teardown runs.
- **Publish to the catalog.** When you're done, run `node tools/library-catalog.cjs` to add the part to `catalog/fx.json`.
