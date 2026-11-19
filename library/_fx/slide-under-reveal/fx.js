(() => {
  kfFx.register("slide-under-reveal", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const inner = el.querySelector("[data-fx-part=inner]") || el.firstElementChild;
      if (!inner) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        // With from it is a px distance (Brand A −1600), without it drops from above by its own height (−100%)
        // Given pct, it comes down from that share of its own height (brand −25)
        const from = options.from != null ? { y: +options.from } : { yPercent: +(options.pct ?? -100) };
        const scrub = options.scrub != null ? +options.scrub || true : true;
        const tl = gsap.timeline({ scrollTrigger: { scroller, trigger: el, start: options.start || "top bottom", end: options.end || (() => `+=${el.offsetHeight}`), scrub, invalidateOnRefresh: true } });
        tl.from(inner, { ...from, ease: "none" });
        // Cover (optional) — lifts from the dim opacity to 0, as if emerging from the previous section’s shade
        const dim = el.querySelector("[data-fx-part=dim]");
        if (dim) tl.from(dim, { opacity: +(options.dim ?? 0.5), ease: "none" }, "<");
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
