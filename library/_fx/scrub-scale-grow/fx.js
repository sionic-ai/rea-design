(() => {
  kfFx.register("scrub-scale-grow", (el, { options, reduce, scroller }) => {
    const art = el.querySelector('[data-fx-part="art"]');
    if (!art || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const num = (k, d) => (options[k] != null && options[k] !== "" ? +options[k] : d);
    const cut = num("narrow", 767);
    const mm = gsap.matchMedia();
    mm.add({ narrow: `(max-width: ${cut}px)`, motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      if (!ctx.conditions.motion) return;
      const n = ctx.conditions.narrow;
      const from = n ? num("from-narrow", num("from", 1)) : num("from", 1);
      const to = n ? num("to-narrow", num("to", 1.5)) : num("to", 1.5);
      const fromVars = { scale: from };
      // The original passes ease: none into the scrollTrigger slot so it is ignored and runs on the GSAP default power1.out — that curve is set as the default
      const toVars = { scale: to, ease: kfFx.ease(options.ease || "power1.out", "power1.out") };
      if (options.opacity != null) {
        fromVars.opacity = num("from-opacity", 1);
        toVars.opacity = +options.opacity;
      }
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          ...(scroller && { scroller }),
          start: options.start || "center bottom",
          end: options.end || "bottom top",
          scrub: num("scrub", 1),
        },
      }).fromTo(art, fromVars, toVars);
      return () => gsap.set(art, { clearProps: "transform,opacity" });
    });
    return () => mm.revert();
  });
})();
