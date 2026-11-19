(() => {
  // Inside a lengthened track, punch a silhouette-shaped hole (mask) in the stage pinned to the screen —
  // First tempo: grows 0 → mid so the silhouette is clear, pauses briefly, second tempo: grows to end so the whole plate opens
  kfFx.register("silhouette-hold-open", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) return;
    const ghost = el.querySelector('[data-fx-part="ghost"]');
    const show = (v) => { stage.style.setProperty("-webkit-mask-size", v); stage.style.setProperty("mask-size", v); };
    const clear = () => { stage.style.removeProperty("-webkit-mask-size"); stage.style.removeProperty("mask-size"); if (ghost) { ghost.style.removeProperty("opacity"); ghost.style.removeProperty("height"); } };
    const narrow = +(options.narrow ?? 991);
    // Reduced motion and narrow screens open everything with no hole — the original also turns the mask off on phones
    if (reduce || innerWidth <= narrow) { stage.style.setProperty("-webkit-mask-image", "none"); stage.style.setProperty("mask-image", "none"); if (ghost) ghost.style.opacity = 0; return () => { stage.style.removeProperty("-webkit-mask-image"); stage.style.removeProperty("mask-image"); clear(); }; }
    const mid = +(options.mid ?? 88.5), end = +(options.end ?? 2000), grow = +(options.grow ?? 0.9), hold = +(options.hold ?? 0.2), open = +(options.open ?? 1.1), unit = options.unit || "vh";
    const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const mix = (a, b, t) => a + (b - a) * t;
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: "top top", end: () => `+=${(grow + hold + open) * innerHeight}`, invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress * (grow + hold + open);
        const size = p <= grow ? mid * io3(p / Math.max(grow, 1e-6)) : p <= grow + hold ? mid : mix(mid, end, io3((p - grow - hold) / Math.max(open, 1e-6)));
        show(`${size}${unit} ${size}${unit}`);
        if (ghost) { const k = Math.min(size, mid) / Math.max(mid, 1e-6); ghost.style.height = `${k * 100}${unit}`; ghost.style.opacity = p >= grow ? 0 : Math.max(0, Math.min(1, (k - 0.12) / 0.88)); }
      },
    });
    show(`0${unit} 0${unit}`);
    return () => { st.kill(); clear(); };
  });
})();
