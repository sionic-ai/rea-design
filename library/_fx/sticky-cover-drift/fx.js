(() => {
  // Each section is pinned sticky at screen height with a gap below so the next section covers it as it rises.
  // While pinned, the inner video and photo (data-fx-part="media", height 130%) drifts upward by 30% of the section height during half a section height of scrolling, so the section being covered doesn’t stand still
  kfFx.register("sticky-cover-drift", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const drift = +(options.drift ?? 0.3), span = +(options.span ?? 0.5);
    const scrub = options.scrub === undefined ? (/iPad|iPhone|iPod/.test(navigator.userAgent) ? 0.8 : true) : (options.scrub === "true" ? true : +options.scrub);
    if (reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(media, {
        y: () => -drift * el.offsetHeight, ease: "none",
        scrollTrigger: { trigger: el, scroller, start: "top top", end: () => "+=" + el.offsetHeight * span, scrub, invalidateOnRefresh: true },
      });
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); mm.revert(); gsap.set(media, { clearProps: "transform" }); };
  });
})();
