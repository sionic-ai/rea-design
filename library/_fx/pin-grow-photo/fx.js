(() => {
  const pair = (v, d) => { const p = String(v ?? d).split(",").map(Number); return p.length === 2 && p.every(Number.isFinite) ? p : d.split(",").map(Number); };
  kfFx.register("pin-grow-photo", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) return;
    gsap.registerPlugin(ScrollTrigger);
    const shade = el.querySelector('[data-fx-part="shade"]');
    const ink = el.querySelector('[data-fx-part="ink"]'), paper = el.querySelector('[data-fx-part="paper"]');
    const from = +(options.from ?? 0.27);
    const [g0, g1] = pair(options.grow, "0.99,1.92"), [s0, s1] = pair(options.shade, "0.99,2.34"), [w0, w1] = pair(options.swap, "1.776,1.967");
    const mm = gsap.matchMedia();
    if (reduce) { if (paper) gsap.set(paper, { opacity: 1 }); if (ink) gsap.set(ink, { opacity: 0 }); if (shade) gsap.set(shade, { opacity: 1 }); }
    else mm.add("all", () => {
      // Time 0 = When the section’s top edge touches the bottom of the screen, unit = Screen Height
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.fromTo(stage, { "--fx-s": 1, opacity: 0 }, { "--fx-s": from, opacity: 1, duration: 0.03 }, 1);
      tl.to(stage, { "--fx-s": 1, duration: g1 - g0 }, 1 + g0);
      if (shade) tl.fromTo(shade, { opacity: 0 }, { opacity: 1, duration: s1 - s0 }, 1 + s0);
      if (paper) tl.fromTo(paper, { opacity: 0 }, { opacity: 1, duration: w1 - (w0 + 0.0) - 0.023 }, 1 + w0);
      if (ink) tl.fromTo(ink, { opacity: 1 }, { opacity: 0, duration: w1 - w0 - 0.071 }, 1 + w0 + 0.071);
      tl.set({}, {}, 4);
      ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: () => `+=${4 * innerHeight}`, scrub: true, animation: tl, invalidateOnRefresh: true });
    });
    return () => {
      mm.revert();
      for (const x of [stage, shade, ink, paper]) if (x) gsap.set(x, { clearProps: "opacity" });
      stage.style.removeProperty("--fx-s");
    };
  });
})();
