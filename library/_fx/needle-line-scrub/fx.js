(() => {
  kfFx.register("needle-line-scrub", (el, { options, reduce, scroller }) => {
    const fill = el.querySelector(':scope > [data-fx-part="fill"]');
    if (!fill) return;
    const tip = fill.querySelector('[data-fx-part="tip"]');
    gsap.registerPlugin(ScrollTrigger);
    const at = Math.min(Math.max(+(options.at ?? 0.5), 0), 1);
    const view = () => (scroller && scroller !== window ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight });
    const grow = () => {
      const v = view(), box = el.getBoundingClientRect();
      gsap.set(fill, { height: Math.min(Math.max(v.top + v.height * at - box.top, 0), box.height) });
    };
    if (reduce) { gsap.set(fill, { height: "100%" }); return () => gsap.set(fill, { clearProps: "height" }); }
    const fx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top", onUpdate: grow, onRefresh: grow });
      if (tip) gsap.to(tip, { rotate: +(options.spin ?? 2610), ease: "none", scrollTrigger: { trigger: el, scroller, start: `top ${at * 100}%`, end: `bottom ${at * 100}%`, scrub: true } });
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    grow();
    return () => { ro.disconnect(); fx.revert(); gsap.set(fill, { clearProps: "height" }); };
  });
})();
