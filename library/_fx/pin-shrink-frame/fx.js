(() => {
  // A full-bleed panel (video) stays pinned to the section while scrolling 1.5 screens, shrinking to a .65x card with 24px corners — from section progress .2 to .8 (power2.inOut)
  kfFx.register("pin-shrink-frame", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame || !window.ScrollTrigger) return;
    const scale = +(options.scale ?? 0.65), radius = +(options.radius ?? 24);
    if (reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({
        scrollTrigger: { trigger: el, scroller, start: "top top", end: `+=${options.end || "150%"}`, scrub: +(options.scrub ?? 0.3), pin: true, invalidateOnRefresh: true },
      }).to(frame, { scale, borderRadius: `${radius}px`, duration: 0.8, ease: "power2.inOut" }, +(options.at ?? 0.2)).to({}, { duration: 0 }, 1);
    });
    return () => mm.revert();
  });
})();
