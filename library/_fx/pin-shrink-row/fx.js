(() => {
  kfFx.register("pin-shrink-row", (el, { options, reduce, hover, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    // The motion-off side releases pinning and lays the cards in a wrapping grid
    if (reduce || !hover) { el.classList.add("is-fx-still"); return () => el.classList.remove("is-fx-still"); }
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: options.end || "bottom 130%", scrub: +(options.scrub ?? 0.8) } })
      .to(items, { width: options.width || "32.5%", duration: 0.5, stagger: 0.5, ease: "none" });
    return () => { tl.scrollTrigger?.kill(); tl.revert(); };
  });
})();
