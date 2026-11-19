(() => {
  // The original uses a CSS view timeline (entry 0% → entry 100vh), which can’t be used inside an inner scroll pane — so the same range runs with ScrollTrigger scrub and passes progress out as --fx-p
  kfFx.register("inset-open-corners", (el, { options, reduce, scroller }) => {
    const from = +(options.from ?? 25);
    const round = +(options.round ?? 8);
    const ease = kfFx.ease(options.ease || "0.47,0,0.745,0.715", "sine.in");
    const set = (p) => {
      const q = from * (1 - p);
      el.style.clipPath = p >= 1 ? "inset(-1px round 0px)" : `inset(0% ${q}% 0% ${q}% round ${round * (1 - p)}px)`;
      el.style.setProperty("--fx-p", p.toFixed(4));
    };
    const clear = () => { el.style.clipPath = ""; el.style.removeProperty("--fx-p"); };
    if (reduce) { set(1); return clear; }
    const st = { p: 0 };
    set(0);
    const tw = gsap.to(st, {
      p: 1, ease, onUpdate: () => set(st.p),
      scrollTrigger: { trigger: el, scroller, start: options.start || "top bottom", end: options.end || "top top", scrub: true },
    });
    return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); clear(); };
  });
})();
