// While a section leaves the top of the screen it is pushed down by screen height × strength and rises late — the next section (rounded top edge) covers it, an overlap.
// Start is when the section’s bottom edge is (start + strength) screens below the top of the screen, end is when the bottom edge has passed above the screen by end screens (scrub, no curve).
(() => {
  kfFx.register("exit-lag-scrub", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    let refresh = 0;
    const ro = new ResizeObserver(() => { clearTimeout(refresh); refresh = setTimeout(() => ScrollTrigger.refresh(), 200); });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Original uses strength .2 · start .1 · end .1 below 768px
      const narrow = matchMedia("(max-width: 767px)").matches;
      const pick = (k, d, dn) => +(narrow ? options[`${k}-narrow`] ?? dn : options[k] ?? d);
      const s = pick("strength", 0.4, 0.2), a = pick("start", 0.2, 0.1), b = pick("end", 0.2, 0.1);
      gsap.to(el, {
        y: () => innerHeight * s, force3D: true, ease: "none",
        scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: () => `bottom-=${innerHeight * s} top+=${innerHeight * a}`, end: () => `bottom top-=${innerHeight * b}`, scrub: true, invalidateOnRefresh: true },
      });
      ro.observe(el);
    });
    return () => { ro.disconnect(); clearTimeout(refresh); mm.revert(); };
  });
})();
