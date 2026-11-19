// Pair the stacked panels (layer) with the text cards (card) in order — while card i passes, panel i tilts up and away, turning transparent so panel i+1 shows.
// In the original, each panel gets gsap.to(panel, { top: -5vh, rotate: 5deg, opacity: 0, ease: none, scrollTrigger: { trigger: card, start: bottom center, end: bottom top, scrub: true } })
// and the list number is is-active while the same card goes from bottom bottom → bottom top. The last panel stays
(() => {
  kfFx.register("pair-tilt-out", (el, { options, scroller }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!layers.length || !cards.length) return;
    const marks = [...el.querySelectorAll('[data-fx-part="mark"]')];
    const y = +(options.y ?? -5), rot = +(options.rotate ?? 5);
    const min = options.from != null ? +options.from : 769;
    const fx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.matchMedia().add(`(min-width: ${min}px) and (prefers-reduced-motion: no-preference)`, () => {
        layers.forEach((l, i) => gsap.set(l, { zIndex: layers.length - i }));
        cards.slice(0, layers.length - 1).forEach((c, i) => gsap.to(layers[i], {
          y: () => (innerHeight * y) / 100, rotate: rot, autoAlpha: 0, ease: "none",
          scrollTrigger: { scroller, trigger: c, start: options.start || "bottom center", end: options.end || "bottom top", scrub: true, invalidateOnRefresh: true },
        }));
        cards.forEach((c, i) => marks[i] && ScrollTrigger.create({ scroller, trigger: c, start: "bottom bottom", end: "bottom top", toggleClass: { targets: marks[i], className: "is-active" } }));
      });
    }, el);
    return () => fx.revert();
  });
})();
