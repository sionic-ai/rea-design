(() => {
  // From the band entering at the bottom of the screen until it leaves at the top (while moving down by screen height + panel height) it is pushed by that distance × speed — scrub 1
  // With multiple bands, each band is pushed separately by data-dir (−1 left · 1 right) and data-offset (starting position, as % of band width when unit: %)
  kfFx.register("scrub-track-x", (el, { options, reduce, scroller }) => {
    const tracks = [...el.querySelectorAll("[data-fx-part=track]")];
    if (!tracks.length || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const pct = options.unit === "%";
    const speed = +(options.speed ?? 1), scrub = +(options.scrub ?? 1);
    const sp = options.sp != null ? +options.sp : speed;
    // span — pins the share moved while passing in unit % to span% of the band width · narrow — at widths of bp or below, the starting position and span multiplier (Brand 10 · .5 · 559)
    const span = options.span != null ? +options.span : null, narrowK = +(options.narrow ?? 1), bp = +options.bp || 834;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      tracks.forEach((track) => {
        const dir = +(track.dataset.dir ?? -1);
        const k = () => (matchMedia(`(max-width: ${bp}px)`).matches ? narrowK : 1);
        const off = () => +(track.dataset.offset ?? 0) * k();
        const dist = () => (pct && span != null ? span * k() : (innerHeight + el.offsetHeight) * (matchMedia(`(max-width: ${bp}px)`).matches ? sp : speed));
        if (pct) gsap.set(track, { xPercent: off() });
        gsap.fromTo(track, pct ? { xPercent: () => off() } : { x: 0 }, { ...(pct ? { xPercent: () => off() + dir * dist() } : { x: () => dir * dist() }), ease: "none",
          scrollTrigger: { trigger: el, scroller, start: "top bottom", end: "bottom top", scrub: scrub || true, invalidateOnRefresh: true } });
      });
    });
    return () => mm.revert();
  });
})();
