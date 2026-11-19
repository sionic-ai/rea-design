// While the pinned two-line title scatters left and right, the pinned photo box grows from low and small to fill the screen
(() => {
  kfFx.register("title-split-grow", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame || reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const media = frame.querySelector('[data-fx-part="media"]');
    const spread = +(options.spread ?? 20);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub: true } });
      if (lines[0]) tl.to(lines[0], { autoAlpha: 0, xPercent: -spread, duration: 0.33, ease: "none" }, 0);
      if (lines[1]) tl.to(lines[1], { autoAlpha: 0, xPercent: spread, duration: 0.33, ease: "none" }, 0);
      tl.from(frame, { y: options.lift || "75vh", scale: +(options.from ?? 0.5), ease: "none", duration: 1 }, 0);
      if (media) tl.from(media, { scale: +(options.zoom ?? 1.8), ease: "none", duration: 1 }, 0);
    });
    return () => mm.revert();
  });
})();
