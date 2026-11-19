(() => {
  kfFx.register("pin-hold-slide", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2 || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const num = (k, d) => (options[k] != null && options[k] !== "" ? +options[k] : d);
    const cut = num("narrow", 767);
    const hold = num("hold", 0.15), move = num("move", 0.7);
    const mm = gsap.matchMedia();
    let timer = 0;
    // The original attaches this 300ms late, to measure after the previous section’s sticky has settled
    timer = setTimeout(() => {
      mm.add({ narrow: `(max-width: ${cut}px)`, motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
        if (!ctx.conditions.motion) return;
        const n = ctx.conditions.narrow;
        const keep = n ? num("keep-narrow", num("keep", 2)) : num("keep", 2);
        const x = n ? num("x-narrow", num("x", 0)) * (slides.length - 1) : num("x", 0);
        const len = n ? num("len-narrow", num("len", 3)) : num("len", 3);
        const width = el.offsetWidth;
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            ...(scroller && { scroller }),
            pin: true,
            scrub: num("scrub", 1),
            start: options.start || "top top",
            end: () => "+=" + (width * len + innerHeight * num("buffer", 0.8) * 2),
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: -1,
          },
        })
          .to({}, { duration: hold })
          .to(slides, { xPercent: -100 * (slides.length - keep), x, ease: "none", duration: move })
          .to({}, { duration: hold });
      });
    }, num("delay", 300));
    return () => { clearTimeout(timer); mm.revert(); };
  });
})();
