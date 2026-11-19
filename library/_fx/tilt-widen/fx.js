(() => {
  kfFx.register("tilt-widen", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const host = el.parentElement;
      gsap.matchMedia().add({ desk: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)", mob: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
        gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { scroller, trigger: host, start: "top bottom", end: "center center", scrub: 0.5, invalidateOnRefresh: true } })
          .fromTo(el, { width: options.from || (ctx.conditions.desk ? "34vw" : "70vw"), rotate: options.tilt ? +options.tilt : -8, borderRadius: 24 },
            { width: () => innerWidth - 32 + "px", rotate: 0, borderRadius: 16 });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
