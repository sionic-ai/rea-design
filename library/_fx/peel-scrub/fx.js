(() => {
  kfFx.register("peel-scrub", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const end = +(options.end ?? 60), s0 = +(options.scale ?? 0.94), b0 = +(options.blur ?? 8), l0 = +(options.bright ?? 0.75), o0 = +(options.fade ?? 0.35);
    const mix = (a, b, t) => a + (b - a) * t;
    const apply = (p) => {
      const r = 1 - Math.pow(1 - p, 3);
      if (r >= 0.999) { el.style.transform = el.style.filter = el.style.opacity = ""; return; }
      el.style.transform = `translate3d(0,0,0) scale(${mix(s0, 1, r)})`;
      el.style.filter = `blur(${mix(b0, 0, r)}px) brightness(${mix(l0, 1, r)})`;
      el.style.opacity = String(mix(o0, 1, r));
    };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: `top ${end}%`, onUpdate: (self) => apply(self.progress), onRefresh: (self) => apply(self.progress) });
      apply(st.progress);
      return () => { st.kill(); el.style.transform = el.style.filter = el.style.opacity = ""; };
    });
    return () => mm.revert();
  });
})();
