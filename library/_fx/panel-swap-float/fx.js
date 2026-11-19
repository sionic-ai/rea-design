// The two panels show only one at a time — the back panel rises after the front panel has fully left (always kill the previous tween before starting so they never overlap)
(() => {
  kfFx.register("panel-swap-float", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const panel = el.querySelector('[data-fx-part="panel"]'), float = el.querySelector('[data-fx-part="float"]');
    if (!float) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.4), gap = reduce ? 0 : +(options.gap ?? 0.1);
    const narrow = matchMedia(`(max-width: ${+options.narrow || 960}px)`);
    const off = (n) => n.offsetHeight + 30;
    const both = [float, panel].filter(Boolean);
    let on = false;
    const reset = () => { on = false; gsap.killTweensOf(both); gsap.set(float, { y: off(float), opacity: 1 }); if (panel) gsap.set(panel, { y: 0, clearProps: "opacity" }); };
    const show = () => {
      if (on) return;
      on = true;
      gsap.killTweensOf(both);
      if (narrow.matches || !panel) {
        gsap.set(float, { y: off(float), opacity: narrow.matches ? 0 : 1 });
        gsap.to(float, { y: 0, opacity: 1, duration: reduce ? 0 : 0.5, ease: "power2.out" });
        return;
      }
      gsap.to(panel, {
        y: off(panel), duration: dur, ease: "power2.out",
        onComplete: () => { gsap.set(float, { y: off(float), opacity: 1 }); gsap.to(float, { y: 0, duration: dur, delay: gap, ease: "power2.out" }); },
      });
    };
    const hide = () => {
      if (!on) return;
      on = false;
      gsap.killTweensOf(both);
      gsap.to(float, {
        y: off(float), duration: dur, ease: "power2.out",
        onComplete: () => { if (!panel || narrow.matches) return; gsap.set(panel, { y: off(panel) }); gsap.to(panel, { y: 0, duration: dur, delay: gap / 2, ease: "power2.out" }); },
      });
    };
    reset();
    if (panel && narrow.matches) gsap.set(panel, { opacity: 0 });
    const st = ScrollTrigger.create({ trigger: el, start: options.start || "bottom top", end: "max", ...(scroller && { scroller }), onEnter: show, onLeaveBack: hide });
    if (st.progress > 0) show();
    const onNarrow = () => { reset(); if (panel && narrow.matches) gsap.set(panel, { opacity: 0 }); ScrollTrigger.refresh(); if (st.progress > 0) show(); };
    narrow.addEventListener("change", onNarrow);
    return () => { st.kill(); narrow.removeEventListener("change", onNarrow); gsap.killTweensOf(both); gsap.set(both, { clearProps: "transform,opacity" }); };
  });
})();
