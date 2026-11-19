(() => {
  kfFx.register("zoom-drift-parallax", (el, { options, reduce, scroller }) => {
    const box = el.parentElement;
    if (!box) return;
    // As in the original, hides overflow if the parent doesn’t — so the enlarged image doesn’t spill out of its box
    const setOverflow = !box.style.overflow;
    if (setOverflow) box.style.overflow = "hidden";
    // Intensity — 50px at screen width 1440, 1.5x below 768 (original values). If an option is given, that px
    const power = () => {
      if (options.strength != null) return +options.strength;
      const base = (innerWidth / 1440) * +(options.base ?? 50);
      return innerWidth <= 768 ? base * +(options.narrow ?? 1.5) : base;
    };
    el.style.transformOrigin = "center center";
    const paint = () => {
      const i = power(), s = 1 + i / 400;
      if (reduce) { el.style.transform = `scale(${s})`; return; }
      const r = el.getBoundingClientRect(), vh = innerHeight;
      if (r.top < vh && r.bottom > 0) {
        const ratio = (vh - r.top) / (vh + r.height);
        el.style.transform = `scale(${s}) translateY(${(ratio - 0.5) * i}px)`;
      } else el.style.transform = `scale(${s})`;
    };
    paint();
    const target = scroller || window;
    target.addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", paint);
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => {
      target.removeEventListener("scroll", paint);
      removeEventListener("resize", paint);
      ro.disconnect();
      el.style.transform = el.style.transformOrigin = "";
      if (setOverflow) box.style.overflow = "";
    };
  });
})();
