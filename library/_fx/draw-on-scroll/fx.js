// Signature drawing: tied to scroll from when the panel head is at screen center until it touches the screen top, a handwriting line is drawn from start to end (no curve) —
// On phone (below 767px), use the phone line (data-fx-part="path-mobile") if present, use that — brand(Draw Path on Scroll)
(() => {
  kfFx.register("draw-on-scroll", (el, { options, reduce, scroller }) => {
    const desk = el.querySelector('[data-fx-part="path"]'), mob = el.querySelector('[data-fx-part="path-mobile"]');
    if (!desk && !mob) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add({ d: "(min-width: 768px)", m: "(max-width: 767px)" }, (ctx) => {
      const path = (ctx.conditions.m && mob) || desk || mob;
      const len = path.getTotalLength?.() || 0;
      if (!len) return;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len });
      if (reduce) return;
      gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { scroller, trigger: el, start: options.start || "clamp(top center)", end: options.end || "clamp(top top)", scrub: options.scrub == null || options.scrub === "true" ? true : +options.scrub, invalidateOnRefresh: true } });
    });
    return () => { mm.revert(); [desk, mob].forEach((p) => p && gsap.set(p, { clearProps: "strokeDasharray,strokeDashoffset" })); };
  });
})();
