(() => {
  // From when the section’s top edge touches the top of the screen until its bottom edge touches the bottom, the line is tied to scroll (scrub) and fills 0 → 1. The header pinning is CSS sticky
  kfFx.register("sticky-line-scrub", (el, { options, reduce, scroller }) => {
    const fill = el.querySelector("[data-fx-part='fill']");
    if (!fill) return;
    if (reduce) { gsap.set(fill, { scaleY: 1 }); return () => gsap.set(fill, { clearProps: "transform" }); }
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1025px)", () => {
      gsap.set(fill, { scaleY: 0 });
      gsap.to(fill, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, scroller: scroller || undefined, start: options.start || "top top", end: options.end || "bottom bottom", scrub: options.scrub === "true" ? true : +(options.scrub ?? 1), invalidateOnRefresh: true } });
    });
    return () => { mm.revert(); gsap.set(fill, { clearProps: "transform" }); };
  });
})();
