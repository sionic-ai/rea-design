// Treat the sticky cell height as one photo’s span — in each span a photo flies in and lands, and when it leaves the span that photo tilts slightly the other way
(() => {
  kfFx.register("tilt-fly-stack", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!photos.length || reduce) return;
    const x = options.x ?? "-10vh", y = options.y ?? "-30vh", tilt = +(options.tilt ?? -6), lean = +(options.lean ?? 3);
    const dur = +(options.dur ?? 0.5), ease = kfFx.ease(options.ease || "power1.out", "power1.out"), leanDur = +(options["lean-dur"] ?? 0.5);
    const min = +(options.min ?? 1025);
    const mm = gsap.matchMedia();
    // The original flings only on wide screens (1025px and up) — when narrow, the photos stay laid out side by side
    mm.add(`(min-width: ${min}px) and (prefers-reduced-motion: no-preference)`, () => {
      const h = () => el.offsetHeight;
      photos.forEach((p, i) => {
        gsap.set(p, { x, y, rotate: tilt, opacity: 0 });
        gsap.to(p, {
          opacity: 1, x: 0, y: 0, rotate: 0, duration: dur, ease,
          scrollTrigger: {
            trigger: el, ...(scroller && { scroller }), start: () => `top+=${h() * i} center`, end: () => `bottom+=${h() * i} center`,
            toggleActions: "play none none reverse", invalidateOnRefresh: true,
            onLeave: () => gsap.to(p, { rotate: lean, duration: leanDur }),
          },
        });
      });
      // If the row height changes late due to fonts or photos, re-measure the ranges
      let last = el.offsetHeight;
      const ro = new ResizeObserver(() => { if (el.offsetHeight !== last) { last = el.offsetHeight; ScrollTrigger.refresh(); } });
      ro.observe(el);
      return () => ro.disconnect();
    });
    return () => { mm.revert(); gsap.set(photos, { clearProps: "transform,opacity" }); };
  });
})();
