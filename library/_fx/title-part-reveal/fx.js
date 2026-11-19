// Two full-width title lines above and below the stage panel stuck to the screen are tied to scroll, spreading apart while shrinking, and the center text opens from inset 50% → 0 in the gap.
// Shrink ratio = min(max, panel width ÷ title width, 25% of screen height ÷ average title height) — long or short, the title fits on screen once opened.
(() => {
  kfFx.register("title-part-reveal", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const top = el.querySelector('[data-fx-part="top"]');
    const bottom = el.querySelector('[data-fx-part="bottom"]');
    const copy = el.querySelector('[data-fx-part="copy"]');
    if (!top || !bottom) return;
    if (reduce) { if (copy) gsap.set(copy, { clipPath: "inset(0% 0% 0% 0%)" }); return; }
    const max = +(options.max ?? 0.82);
    const gap = +(options.gap ?? 54);
    const lag = +(options.lag ?? 0.1);
    const exit = options.exit === "true";
    let ctx;
    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        gsap.set(top, { transformOrigin: "50% 75%" });
        gsap.set(bottom, { transformOrigin: "50% 25%" });
        const pad = parseFloat(getComputedStyle(stage).paddingLeft) || 0;
        const room = stage.clientWidth - pad * 2;
        const s = Math.min(max, room / (top.clientWidth || 1), (innerHeight * 0.25) / ((top.clientHeight + bottom.clientHeight) / 2 || 1));
        const d = (copy ? copy.offsetHeight : 0) / 2 + gap;
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { scroller, trigger: el, start: options.start || "top top", end: options.end || "bottom bottom", scrub: true, invalidateOnRefresh: true } })
          .fromTo(top, { scale: 1, y: 0 }, { scale: s, y: -d, duration: 1 }, 0)
          .fromTo(bottom, { scale: 1, y: 0 }, { scale: s, y: d, duration: 1 }, 0);
        if (copy) tl.fromTo(copy, { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, lag);
        if (exit) tl.to(top, { y: -innerHeight * 0.5, scale: s * 0.9 }).to(bottom, { y: innerHeight * 0.5, scale: s * 0.9 }, "<");
      }, el);
    };
    let last = "";
    const ro = new ResizeObserver(() => {
      const key = `${stage.clientWidth}x${top.clientWidth}x${top.clientHeight}x${copy?.offsetHeight || 0}x${innerHeight}`;
      if (key === last) return;
      last = key;
      build();
      ScrollTrigger.refresh();
    });
    ro.observe(stage);
    ro.observe(top);
    if (copy) ro.observe(copy);
    return () => { ro.disconnect(); ctx?.revert(); };
  });
})();
