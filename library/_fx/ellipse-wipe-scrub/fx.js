// Ellipse reveal: while the panel head moves dist px past the screen bottom (start), the mask edge goes 110%→0, ellipses 175→1200% · 230→1500%, scale 1.06→1 — a reference site’s about page fixed background
(() => {
  kfFx.register("ellipse-wipe-scrub", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const st = el.style;
    const s0 = +(options.scale ?? 1.06);
    const set = (p) => {
      st.setProperty("--fx-reveal", ((1 - p) * 110).toFixed(2) + "%");
      st.setProperty("--fx-ew-scale", (s0 - (s0 - 1) * p).toFixed(4));
      st.setProperty("--fx-ew-h", (175 + 1025 * p).toFixed(1) + "%");
      st.setProperty("--fx-ew-v", (230 + 1270 * p).toFixed(1) + "%");
    };
    const clear = () => ["--fx-reveal", "--fx-ew-scale", "--fx-ew-h", "--fx-ew-v"].forEach((k) => st.removeProperty(k));
    if (reduce) { set(1); return clear; }
    set(0);
    const trig = (options.trigger && document.querySelector(options.trigger)) || el;
    const tr = ScrollTrigger.create({
      scroller, trigger: trig, start: options.start || "top bottom", end: `+=${+(options.dist ?? 1000) || 1000}`,
      onUpdate: (s) => set(s.progress), onRefresh: (s) => set(s.progress),
    });
    return () => { tr.kill(); clear(); };
  });
})();
