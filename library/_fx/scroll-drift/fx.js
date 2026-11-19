(() => {
  kfFx.register("scroll-drift", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const lo = options.min ? +options.min : -25, hi = options.max ? +options.max : 15;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(el, { y: gsap.utils.random(lo, hi), ease: "none", scrollTrigger: { scroller, trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
