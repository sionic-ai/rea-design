(() => {
  kfFx.register("pixel-scatter-in", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const cells = el.matches("svg") ? el.querySelectorAll("rect, path, circle") : el.children;
      if (!cells.length) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(cells, { autoAlpha: 0, stagger: { each: +(options.each ?? 0.05), from: "random" }, duration: +(options.dur ?? 0.3),
          scrollTrigger: { scroller, trigger: el, start: "top bottom-=100px", toggleActions: options.once === "true" ? "play none none none" : "play none none reverse" } });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
