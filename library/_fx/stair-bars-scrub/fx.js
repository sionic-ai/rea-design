(() => {
  kfFx.register("stair-bars-scrub", (el, { options, reduce, scroller }) => {
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (!bars.length) return;
    if (reduce) { gsap.set(bars, { scaleY: 1 }); return () => gsap.set(bars, { clearProps: "transform" }); }
    gsap.registerPlugin(ScrollTrigger);
    const n = bars.length;
    // Bottom bars first — the i-th bar from the top starts (n−1−i)/n × spread of progress later, and they all reach 1 together at the end
    const spread = +(options.spread ?? 0.5);
    const origin = options.origin || "top";
    gsap.set(bars, { scaleY: 0, transformOrigin: `${origin} center` });
    const paint = (p) => bars.forEach((bar, i) => {
      const o = ((n - 1 - i) / n) * spread;
      gsap.set(bar, { scaleY: gsap.utils.clamp(0, 1, (p - o) / (1 - o)) });
    });
    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scroller || window,
      start: options.start || "top 75%",
      end: options.end || "bottom 75%",
      scrub: true,
      onUpdate: (s) => paint(s.progress),
      onRefresh: (s) => paint(s.progress),
    });
    return () => { st.kill(); gsap.set(bars, { clearProps: "transform,transformOrigin" }); };
  });
})();
