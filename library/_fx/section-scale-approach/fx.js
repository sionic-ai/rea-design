(() => {
  // While a section approaches from the bottom of the screen it grows from .8 → 1 — on sites that stack sections with rounded bottom corners, this gives the feel of the next section ”pushing up”
  kfFx.register("section-scale-approach", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const min = +(options.min ?? 0.8), span = +(options.span ?? 400), dur = +(options.dur ?? 0.2), wait = +(options.wait ?? 0.6);
    let st;
    const call = gsap.delayedCall(wait, () => {
      st = ScrollTrigger.create({
        trigger: el, scroller,
        start: () => `top-=${innerHeight}`, end: () => `top-=${innerHeight - span}`,
        onUpdate: (s) => gsap.to(el, { scale: s.progress >= 0.001 ? Math.max(min, Math.min(1, min + (1 - min) * s.progress)) : 1, duration: dur, overwrite: true }),
      });
    });
    return () => { call.kill(); st && st.kill(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "transform" }); };
  });
})();
