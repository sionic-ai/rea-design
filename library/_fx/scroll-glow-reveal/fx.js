// scroll-glow-reveal — a gradient plate laid over a dark section is revealed as the section rises.
// While the section’s top edge goes from ”screen bottom − section height × from” to ”screen bottom − section height × to”, the target goes 0→1, and the actual value follows each frame by the lerp share of the remaining gap.
(() => {
  kfFx.register("scroll-glow-reveal", (el, { options, reduce, scroller }) => {
    const from = +(options.from ?? 0.3);
    const to = +(options.to ?? 1.05);
    const lerp = +(options.lerp ?? 0.08);
    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    let target = 0, value = 0, raf = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const vh = scroller ? scroller.clientHeight : innerHeight || document.documentElement.clientHeight;
      const top = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
      const a = vh - from * r.height, b = vh - to * r.height;
      target = clamp((a - top) / (a - b || 1));
    };
    const paint = () => el.style.setProperty("--fx-reveal", value.toFixed(4));
    const tick = () => {
      value += (target - value) * lerp;
      if (Math.abs(target - value) < 0.001) value = target;
      paint();
      raf = value === target ? 0 : requestAnimationFrame(tick);
    };
    const on = () => {
      measure();
      if (reduce) { value = target; paint(); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const src = scroller || window;
    src.addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on, { passive: true });
    const ro = new ResizeObserver(on);
    ro.observe(el);
    measure();
    value = target;
    paint();
    return () => {
      cancelAnimationFrame(raf);
      src.removeEventListener("scroll", on);
      removeEventListener("resize", on);
      ro.disconnect();
      el.style.removeProperty("--fx-reveal");
    };
  });
})();
