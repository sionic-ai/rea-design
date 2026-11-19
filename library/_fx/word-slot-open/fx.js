// A video slot hidden at width 0 between big text lines opens from its own center with scroll, pushing the words on either side aside — first line of the Service section.
// The image inside a cell keeps its size and only the cell (window) widens, so the inside is not squashed while it spreads.
(() => {
  kfFx.register("word-slot-open", (el, { options, reduce, scroller }) => {
    const slots = [...el.querySelectorAll('[data-fx-part="slot"]')];
    if (!slots.length) return;
    if (options.w) el.style.setProperty("--fx-w", options.w);
    if (reduce) { el.style.setProperty("--fx-open", 1); return () => el.style.removeProperty("--fx-open"); }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(el, { "--fx-open": 0 }, {
        "--fx-open": 1, ease: "none",
        scrollTrigger: { scroller, trigger: el, start: options.start || "top 94%", end: options.end || "bottom 55%", scrub: +(options.scrub ?? 0.8), invalidateOnRefresh: true },
      });
    });
    return () => { mm.revert(); el.style.removeProperty("--fx-open"); el.style.removeProperty("--fx-w"); };
  });
})();
