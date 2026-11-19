(() => {
  // When the mouse moves over the plate, the scattered pieces follow by (cursor − screen center) ÷ 100, data-dir="-1" Pieces move the opposite way
  // (original gsap.to(.5s default duration, curve none) — newly set on every move so it trails late). Pieces with data-y flow tied to scroll by that % of their own height while passing through the panel.
  kfFx.register("cursor-drift-pieces", (el, { options, reduce, hover, scroller }) => {
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (!pieces.length || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const div = +options.div || 100, dur = +(options.dur ?? 0.5);
    const ease = kfFx.ease(options.ease || "none", "none");
    const move = (e) => {
      const dx = (e.clientX - innerWidth / 2) / div, dy = (e.clientY - innerHeight / 2) / div;
      pieces.forEach((p) => { const k = +(p.dataset.dir ?? 1); gsap.to(p, { x: dx * k, y: dy * k, duration: dur, ease, overwrite: "auto" }); });
    };
    if (hover) el.addEventListener("mousemove", move);
    const sts = pieces.filter((p) => p.dataset.y).map((p) => gsap.to(p, {
      yPercent: +p.dataset.y, ease: "none",
      scrollTrigger: { scroller, trigger: p, start: "top bottom", end: "bottom top", scrub: true },
    }));
    return () => {
      el.removeEventListener("mousemove", move);
      sts.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
      gsap.set(pieces, { clearProps: "transform" });
    };
  });
})();
