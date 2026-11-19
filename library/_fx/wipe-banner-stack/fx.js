// The scroll share is split into intervals between panels, in each interval, the upper panel’s lower part is wiped away and the dim on the panel beneath is lifted
(() => {
  kfFx.register("wipe-banner-stack", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    const n = slides.length;
    const dark = +(options.dark ?? 0.5);
    const ring = el.querySelector('[data-fx-part="ring"]');
    const had = el.style.height;
    if (!el.style.height) el.style.height = `${n * 100}vh`;
    slides.forEach((s, i) => { s.style.zIndex = String(n - i); });
    const paint = (p) => {
      const seg = p * (n - 1);
      slides.forEach((s, i) => {
        s.style.setProperty("--fx-clip", `${(Math.min(1, Math.max(0, seg - i)) * 100).toFixed(2)}%`);
        const shade = s.querySelector('[data-fx-part="shade"]');
        if (shade) s.style.setProperty("--fx-dark", i ? (dark * (1 - Math.min(1, Math.max(0, seg - (i - 1))))).toFixed(3) : "0");
      });
      if (ring) ring.style.strokeDashoffset = (1 - (Math.min(n - 1, seg) + 1) / n).toFixed(4);
    };
    paint(0);
    if (reduce) return () => { el.style.height = had; };
    const st = ScrollTrigger.create({
      scroller, trigger: el, start: "top top", end: "bottom bottom",
      scrub: options.scrub ? +options.scrub : true,
      onUpdate: (s) => paint(s.progress), onRefresh: (s) => paint(s.progress),
    });
    return () => {
      st.kill();
      el.style.height = had;
      slides.forEach((s) => { s.style.removeProperty("--fx-clip"); s.style.removeProperty("--fx-dark"); s.style.zIndex = ""; });
    };
  });
})();
