// Hide and show after it disappears — the spots must change all at once so the lines don’t wobble
(() => {
  kfFx.register("filter-fade", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const btns = [...el.querySelectorAll("[data-fx-part=filter]")];
      btns.forEach((b) => b.setAttribute("aria-pressed", b.classList.contains("is-on")));
      el.addEventListener("click", (e) => {
        const b = e.target.closest("[data-fx-part=filter]");
        if (!b || !el.contains(b)) return;
        btns.forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", x === b); });
        const f = b.dataset.f, items = [...el.querySelectorAll("[data-fx-part=item]")];
        // Default is brand values. brand hides immediately without vanishing and the remaining cards move all at once in 1s power3.out (out: 0; in: 1; each: 0; ease: power3.out; scroll: .3)
        const out = reduce ? 0 : +(options.out ?? 0.25), dur = reduce ? 0 : +(options.in ?? 0.35), each = reduce ? 0 : +(options.each ?? 0.05);
        const ease = kfFx.ease(options.ease || "power1.out", "power1.out"), roll = options.scroll != null ? +options.scroll : null;
        // scroll — rolls up to the filter board head over that length (seconds) with power2.out (when ScrollToPlugin is present)
        if (roll != null && window.ScrollToPlugin) { gsap.registerPlugin(ScrollToPlugin); gsap.to(scroller || window, { scrollTo: el, duration: reduce ? 0 : roll, ease: "power2.out" }); }
        const show = () => {
          items.forEach((c) => (c.style.display = !f || c.dataset.cat.split(" ").includes(f) ? "" : "none"));
          el.dispatchEvent(new CustomEvent("fx:filtered", { bubbles: true, detail: { filter: f } }));
          gsap.fromTo(items.filter((c) => c.style.display !== "none"), { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, stagger: each, ease });
        };
        if (out) gsap.to(items, { autoAlpha: 0, duration: out, ease, onComplete: show });
        else show();
      }, { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
