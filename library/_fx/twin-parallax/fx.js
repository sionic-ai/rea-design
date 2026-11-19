(() => {
  // Two-layer parallax — the outer cell descends by drift (px) from when it touches the bottom of the screen until it has fully exited at the top,
  // Inner (data-fx-part="inner") moves by distance between screen center and its own center ÷ half screen height × its height × ratio. Below 768px both use the mobile multiplier (default half)
  kfFx.register("twin-parallax", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const drift = +(options.drift ?? 0), ratio = +(options.ratio ?? 0.15), mobile = +(options.mobile ?? 0.5);
    const inner = el.querySelector('[data-fx-part="inner"]');
    const src = scroller || window;
    const viewH = () => (scroller ? scroller.clientHeight : innerHeight);
    const scrollTop = () => (scroller ? scroller.scrollTop : window.pageYOffset || document.documentElement.scrollTop);
    const offsetTop = () => (scroller ? scroller.getBoundingClientRect().top : 0);
    const wide = matchMedia("(min-width: 768px)");
    let g = null, raf = 0;
    const measure = () => {
      const keepEl = el.style.transform, keepIn = inner?.style.transform;
      el.style.transform = "";
      if (inner) inner.style.transform = "";
      const r = el.getBoundingClientRect(), top = r.top - offsetTop() + scrollTop();
      g = { top, bottom: top + r.height };
      if (inner) {
        const ri = inner.getBoundingClientRect(), it = ri.top - offsetTop() + scrollTop();
        g.center = it + ri.height / 2;
        g.h = ri.height;
      }
      el.style.transform = keepEl;
      if (inner) inner.style.transform = keepIn;
    };
    const apply = () => {
      raf = 0;
      if (!g) return;
      const vh = viewH(), y = scrollTop(), k = wide.matches ? 1 : mobile;
      if (drift) {
        const from = g.top - vh, p = Math.max(0, Math.min(1, (y - from) / (g.bottom - from)));
        el.style.transform = `translate3d(0, ${p * drift * k}px, 0)`;
      }
      if (inner && ratio) inner.style.transform = `translate3d(0, ${((y + vh / 2 - g.center) / (vh / 2)) * g.h * ratio * k}px, 0)`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const remeasure = () => { measure(); queue(); };
    el.style.willChange = "transform";
    if (inner) inner.style.willChange = "transform";
    src.addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", remeasure, { passive: true });
    const ro = new ResizeObserver(remeasure);
    ro.observe(el);
    ro.observe(document.body);
    remeasure();
    return () => {
      cancelAnimationFrame(raf);
      src.removeEventListener("scroll", queue);
      removeEventListener("resize", remeasure);
      ro.disconnect();
      el.style.transform = el.style.willChange = "";
      if (inner) inner.style.transform = inner.style.willChange = "";
    };
  });
})();
