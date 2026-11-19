(() => {
  kfFx.register("sink-dim-scrub", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const depth = +(options.y ?? 0.4), dim = +(options.dim ?? 0.5), min = +(options.min ?? 768);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px) and (prefers-reduced-motion: no-preference)`, () => {
      gsap.to(el, {
        y: () => depth * innerHeight, filter: `brightness(${dim})`, ease: "none",
        scrollTrigger: { trigger: el, scroller, start: options.start || "bottom 90%", end: options.end || "bottom top", scrub: true, invalidateOnRefresh: true },
      });
      return () => gsap.set(el, { clearProps: "transform,filter" });
    });
    return () => mm.revert();
  });
})();
