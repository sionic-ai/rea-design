(() => {
  // Stair-step boundary between two panels — color cells (data-fx-part="box") enters 80% of the screen it flickers in random order (.08s apart) and vanishes, so the panel below is revealed in a stair-step shape
  kfFx.register("step-blink-boundary", (el, { options, reduce, scroller }) => {
    const boxes = [...el.querySelectorAll('[data-fx-part="box"]')];
    if (!boxes.length) return;
    if (reduce) {
      gsap.set(boxes, { autoAlpha: 0 });
      return () => gsap.set(boxes, { clearProps: "opacity,visibility" });
    }
    gsap.registerPlugin(ScrollTrigger);
    const each = +(options.each ?? 0.08), shift = +(options.shift ?? 1);
    // The original blinks only three times on low-spec devices — look: short
    const frames = options.look === "short"
      ? [{ autoAlpha: 0.2, xPercent: shift, duration: 0.04 }, { autoAlpha: 1, xPercent: shift, duration: 0.06 }, { autoAlpha: 0, xPercent: shift, duration: 0.06 }]
      : [
        { autoAlpha: 0.2, xPercent: shift, duration: 0.04 },
        { autoAlpha: 1, xPercent: shift, duration: 0.06 },
        { autoAlpha: 0.2, xPercent: -shift, duration: 0.02 },
        { autoAlpha: 1, xPercent: shift, duration: 0.05 },
        { autoAlpha: 0, xPercent: shift, duration: 0.06 },
      ];
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(boxes, { autoAlpha: 1, xPercent: 0 });
      gsap.timeline({
        delay: +(options.delay ?? 0),
        scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", toggleActions: "play none none none", once: true },
      }).to(boxes, { keyframes: frames, ease: "none", stagger: { each, from: options.from || "random" } });
    });
    return () => mm.revert();
  });
})();
