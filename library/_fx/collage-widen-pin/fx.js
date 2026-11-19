(() => {
  kfFx.register("collage-widen-pin", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const min = +(options.min ?? 834), endMd = String(options["end-md"] ?? 1000).trim();
    // end is a px count (+=2000) or that followed by a screen-side reference (2000 bottom → +=2000 bottom — ends when that distance reaches the bottom of the screen, oga)
    const end = String(options.end ?? 2000).trim();
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min + 1}px) and (prefers-reduced-motion: no-preference)`, () => {
      const md = () => matchMedia("(max-width: 1024px)").matches;
      gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: () => options.start || (md() ? "top 35%" : "center center"), end: () => `+=${md() ? endMd : end}`, scrub: true, pin: true, pinSpacing: true, invalidateOnRefresh: true } })
        .to(frame, { width: "100%", duration: 0.4, ease: "none" }, 0);
    });
    return () => mm.revert();
  });
})();
