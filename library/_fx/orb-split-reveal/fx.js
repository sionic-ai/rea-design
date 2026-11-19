(() => {
  // Circles splitting to both sides — once visible, after a delay the left and right circles are pushed apart by an em distance. Scrolling back up overlaps them again
  kfFx.register("orb-split-reveal", (el, { options, reduce, scroller }) => {
    const left = el.querySelector(':scope > [data-fx-part="left"]'), right = el.querySelector(':scope > [data-fx-part="right"]');
    const parts = [left, right].filter(Boolean);
    if (!parts.length) return;
    const dist = +(options.dist ?? 20), delay = +(options.delay ?? 0.4), dur = +(options.dur ?? 1);
    const open = (instant) => {
      if (left) gsap.to(left, { x: -dist + "em", duration: instant ? 0 : dur, delay: instant ? 0 : delay, ease: "quart.out", overwrite: true });
      if (right) gsap.to(right, { x: dist + "em", duration: instant ? 0 : dur, delay: instant ? 0 : delay, ease: "quart.out", overwrite: true });
    };
    if (reduce) { open(true); return () => gsap.set(parts, { clearProps: "transform" }); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }), start: options.start || "top 60%",
      onEnter: () => open(false),
      onLeaveBack: () => gsap.to(parts, { x: 0, duration: 0.5, overwrite: true }),
    });
    return () => { st.kill(); gsap.killTweensOf(parts); gsap.set(parts, { clearProps: "transform" }); };
  });
})();
