(() => {
  // The original measures by the untransformed position (offsetTop) — measuring with getBoundingClientRect brings its own tilt and scale back in and it jitters. So we compute from ScrollTrigger’s start position and height
  kfFx.register("sheet-tilt-pass", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const rot = +(options.rot ?? 7), shrink = +(options.shrink ?? 0.16), out = options.out !== "off";
    if (reduce) return;
    gsap.set(el, { transformOrigin: "50% 50%", willChange: "transform" });
    const view = () => (scroller && scroller !== window ? scroller.clientHeight : innerHeight);
    const apply = (self) => {
      const vh = view(), y = self.scroll(), h = el.offsetHeight;
      const s = Math.min(1, Math.max(0, (y - self.start) / vh));
      const a = out ? Math.min(1, Math.max(0, (y - (self.start + h)) / vh)) : 0;
      const off = Math.min(1, 1 - s + a), turn = 1 - s - a;
      gsap.set(el, { rotation: turn * rot, scale: 1 - off * shrink });
    };
    const st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: "top bottom", end: "bottom top", onUpdate: apply, onRefresh: apply });
    apply(st);
    return () => { st.kill(); gsap.set(el, { clearProps: "transform,transformOrigin,willChange" }); };
  });
})();
