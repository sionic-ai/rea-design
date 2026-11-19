(() => {
  // A horizontal band over the photo (a different color layer) enters from above, stays briefly in place, then exits downward — the picture inside the band moves the opposite way so it looks stuck to the photo
  kfFx.register("band-scan", (el, { options, scroller }) => {
    const band = el.querySelector('[data-fx-part="band"]');
    if (!band) return;
    const inner = band.querySelector('[data-fx-part="inner"]');
    gsap.registerPlugin(ScrollTrigger);
    const hold = gsap.utils.clamp(0, 0.9, +(options.hold ?? 0.2)), half = (1 - hold) / 2;
    // Band height (photo ratio) and rest spot (% from photo top) are measured from the rendered size
    const ratio = () => band.offsetHeight / (el.offsetHeight || 1);
    const at = () => (band.offsetTop / (el.offsetHeight || 1)) * 100;
    const from = () => -(at() / (ratio() * 100 || 1)) * 100 - 100;
    const to = () => ((100 - at()) / (ratio() * 100 || 1)) * 100;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top bottom", end: options.end || "bottom top", scrub: true, invalidateOnRefresh: true } });
      tl.fromTo(band, { yPercent: from }, { yPercent: 0, ease: "none", duration: half }, 0)
        .fromTo(band, { yPercent: 0 }, { yPercent: to, ease: "none", duration: half, immediateRender: false }, half + hold);
      if (inner) {
        tl.fromTo(inner, { yPercent: () => -from() * ratio() }, { yPercent: 0, ease: "none", duration: half }, 0)
          .fromTo(inner, { yPercent: 0 }, { yPercent: () => -to() * ratio(), ease: "none", duration: half, immediateRender: false }, half + hold);
      }
    });
    return () => mm.revert();
  });
})();
