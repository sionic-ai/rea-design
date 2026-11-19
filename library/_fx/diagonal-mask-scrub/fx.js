(() => {
  // Tie the vertical position of a diagonal mask (angle°, 48% visible · 52% hidden, 300% tall) to scroll, moving it from from% → to%
  kfFx.register("diagonal-mask-scrub", (el, { options, reduce, scroller }) => {
    if (options.angle != null) el.style.setProperty("--fx-angle", `${+options.angle}deg`);
    const from = +(options.from ?? 80), to = +(options.to ?? 0);
    el.style.setProperty("--fx-from", `${from}%`);
    const clear = () => ["--fx-angle", "--fx-from", "mask-position", "-webkit-mask-position"].forEach((k) => el.style.removeProperty(k));
    if (reduce || !window.gsap || !window.ScrollTrigger) return clear;
    gsap.registerPlugin(ScrollTrigger);
    const st = { y: from };
    const draw = () => { el.style.setProperty("mask-position", `50% ${st.y}%`); el.style.setProperty("-webkit-mask-position", `50% ${st.y}%`); };
    const tw = gsap.to(st, {
      y: to, ease: "none", onUpdate: draw,
      scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top center", end: options.end || "bottom center", scrub: +(options.scrub ?? 1), fastScrollEnd: false },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); clear(); };
  });
})();
