(() => {
  // While a long section stays pinned to the screen, the cells in the strip slide sideways — each cell’s end position is screen width − strip width − pad·screen width/cell width, so smaller cells travel farther
  kfFx.register("sticky-drift-gallery", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const track = el.querySelector('[data-fx-part="track"]');
    const items = track ? [...track.querySelectorAll('[data-fx-part="item"]')] : [];
    if (!items.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const from = +(options.from ?? 60), pad = +(options.pad ?? 80);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1.5);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (reduce) return;
      gsap.fromTo(items, { x: from }, {
        x: (i, it) => innerWidth - track.clientWidth - (pad * innerWidth) / Math.max(1, it.clientWidth),
        ease: "none",
        scrollTrigger: { trigger: el, scroller, start: options.start || "10% top", end: options.end || "90% bottom", scrub, invalidateOnRefresh: true },
      });
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); mm.revert(); };
  });
})();
