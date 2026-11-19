(() => {
  kfFx.register("pin-overlap-stack", (el, { options, reduce, scroller }) => {
    const blocks = [...el.querySelectorAll('[data-fx-part="block"]')].filter((b) => b.closest('[data-fx~="pin-overlap-stack"]') === el);
    if (!blocks.length || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const min = +(options.min ?? 768);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px) and (prefers-reduced-motion: no-preference)`, () => {
      // No space is left (pinSpacing: false), so the next panel rises over the pinned panel and covers it — the end is the ScrollTrigger default (panel bottom at screen top)
      blocks.forEach((b) => ScrollTrigger.create({
        trigger: b,
        ...(scroller && { scroller }),
        pin: true,
        pinSpacing: false,
        start: options.start || "top top",
        ...(options.end && { end: options.end }),
      }));
    });
    return () => mm.revert();
  });
})();
