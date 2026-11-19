// Several stacked images, from the moment the panel top touches the screen top, each layer rises its own distance (rise) over the same scroll length —
// Each layer follows the page upward at twice its speed, then stops at its own time, so front layers cover back ones and build depth as it fills.
// Distance is px based on the design width and on narrow screens shrinks to min(width × px/design width, px). Below 767px, rise-sp · width-sp are used
(() => {
  kfFx.register("layer-rise-scrub", (el, { options, reduce, scroller }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (reduce || !layers.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const list = (v) => String(v).split(/[\s,]+/).filter(Boolean).map(Number);
    const rise = list(options.rise ?? "600 1200 860");
    const riseSp = options["rise-sp"] != null ? list(options["rise-sp"]) : rise;
    const W = +options.width || 1440;
    const Wsp = +options["width-sp"] || W;
    const mm = gsap.matchMedia();
    mm.add({ sp: "(max-width: 767px)", pc: "(min-width: 768px)" }, ({ conditions }) => {
      const arr = conditions.sp ? riseSp : rise, w = conditions.sp ? Wsp : W;
      const px = (k) => { const v = arr[Math.min(k, arr.length - 1)] || 0; return Math.min(innerWidth * (v / w), v); };
      layers.forEach((layer, k) =>
        gsap.to(layer, { y: () => -px(k), ease: "none", scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: () => `+=${px(k)}`, scrub: true, invalidateOnRefresh: true } })
      );
    });
    return () => { mm.revert(); gsap.set(layers, { clearProps: "transform" }); };
  });
})();
