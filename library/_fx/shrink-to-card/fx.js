// A full-width panel (reel band) shrinks its inner frame down to the base width and rounds its corners as the scroll goes down — it’s scrub, so scrolling back expands it again
(() => {
  kfFx.register("shrink-to-card", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const frame = el.querySelector("[data-fx-part=frame]");
    if (!frame) return;
    const to = () => {
      const ref = options.to && document.querySelector(options.to);
      if (ref) return ref.offsetWidth;
      return el.clientWidth - 2 * (parseFloat(options.inset ?? 48) || 0);
    };
    const radius = options.radius || "1rem";
    if (reduce) { gsap.set(frame, { width: to(), borderRadius: radius }); return () => gsap.set(frame, { clearProps: "width,borderRadius" }); }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(frame, {
        width: to,
        borderRadius: radius,
        ease: "none",
        scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 20%", end: options.end || "bottom 50%", scrub: +(options.scrub ?? 0.8), invalidateOnRefresh: true },
      });
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); mm.revert(); gsap.set(frame, { clearProps: "width,borderRadius" }); };
  });
})();
