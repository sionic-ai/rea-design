// Text · photo start at top-left (-16px, -16px) with 10px blur and transparent, tied to scroll (top 90% → center 75%, scrub 2), and clear up into place.
// if there are item children, each gets its own tween and the start·end lines are raised by step (90 − i×step %) so columns lined up horizontally settle in order from the right (Brand about section, three columns 10)
(() => {
  kfFx.register("blur-drift-scrub", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const targets = items.length ? items : [el];
    const x = +(options.x ?? -16), y = +(options.y ?? -16), blur = +(options.blur ?? 10), scrub = +(options.scrub ?? 2), step = +(options.step ?? 0);
    const s0 = +(options.start ?? 90), e0 = +(options.end ?? 75);
    const tweens = targets.map((t, i) => gsap.fromTo(t, { x, y, opacity: 0, filter: `blur(${blur}px)` }, { x: 0, y: 0, opacity: 1, filter: "blur(0px)", ease: "none",
      scrollTrigger: { trigger: t, scroller, start: `top ${s0 - i * step}%`, end: `center ${e0 - i * step}%`, scrub } }));
    return () => { tweens.forEach((tw) => { tw.scrollTrigger?.kill(); tw.kill(); }); gsap.set(targets, { clearProps: "transform,opacity,filter" }); };
  });
})();
