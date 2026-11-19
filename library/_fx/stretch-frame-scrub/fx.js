// The cell expands .8 → 1 while the inside returns 1.2 → 1 so only the frame seems to open, then the inside moves down 20%. All of it is tied to scroll
(() => {
  kfFx.register("stretch-frame-scrub", (el, { options, reduce, scroller }) => {
    const inner = el.querySelector('[data-fx-part="inner"]');
    if (!inner || reduce) return;
    const from = +(options.from ?? 0.8), counter = +(options.counter ?? 1.2), drift = +(options.drift ?? 20);
    const origin = options.origin === "right" ? "100%" : "0%";
    const wide = +(options.wide ?? 1024);
    const mm = gsap.matchMedia();
    mm.add(wide > 0 ? `(min-width: ${wide}px)` : "all", () => {
      gsap.set(el, { scaleX: from, transformOrigin: origin });
      gsap.set(inner, { scaleX: counter, yPercent: 0, transformOrigin: origin });
      const st = { trigger: el, scroller, start: "top bottom", end: "top center", scrub: true };
      gsap.to(el, { scaleX: 1, ease: "none", scrollTrigger: st });
      gsap.to(inner, { scaleX: 1, ease: "none", scrollTrigger: { ...st } });
      if (drift) gsap.to(inner, { yPercent: drift, ease: "none", scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom top", scrub: true } });
      return () => gsap.set([el, inner], { clearProps: "transform" });
    });
    return () => mm.revert();
  });
})();
