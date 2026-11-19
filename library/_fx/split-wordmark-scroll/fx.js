// While passing the section, the two halves of the big wordmark below spread apart, the center panel rises, and the pattern behind floats up
(() => {
  kfFx.register("split-wordmark-scroll", (el, { options, reduce, scroller }) => {
    const l = el.querySelector('[data-fx-part="left"]'), r = el.querySelector('[data-fx-part="right"]');
    if (!l || !r || reduce) return;
    const panel = el.querySelector('[data-fx-part="panel"]'), shape = el.querySelector('[data-fx-part="shape"]');
    const st = { scroller, trigger: el, start: "top bottom", end: "bottom bottom", scrub: true };
    const tl = gsap.timeline({ scrollTrigger: st });
    tl.fromTo(l, { xPercent: 0 }, { xPercent: +(options.left ?? -51), duration: 5, ease: "power1.out" }, 0);
    tl.fromTo(r, { xPercent: 0 }, { xPercent: +(options.right ?? 50), duration: 5, ease: "power1.out" }, 0);
    if (panel) tl.fromTo(panel, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2, ease: "linear" }, 0.5);
    const sh = shape ? gsap.fromTo(shape, { y: "-2vw" }, { y: `-${+(options.rise ?? 25.5)}vw`, ease: "linear", scrollTrigger: { ...st } }) : null;
    return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.revert(); if (sh) { sh.scrollTrigger && sh.scrollTrigger.kill(); sh.revert(); } };
  });
})();
