// ”Narrow window opening” section of the horizontal scroll page — in a one-screen-wide section, the picture (video/photo) first shows only as a vertical window with half-width 115px,
// When a section enters from the right, the window comes ahead of the section to the left (transform) until it reaches the screen center, and while it stays there for the next one screen of scroll
// Top, bottom, left and right unfold straight into the full screen. Tied directly to the scroll position, so there is no curve
(() => {
  const lerp = (a, b, k) => a + (b - a) * k;
  const r1 = (v) => Math.round(v * 10) / 10;
  kfFx.register("side-window-open", (el, { options, reduce }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media) return;
    const q = matchMedia(`(min-width:${+(options.min ?? 782)}px) and (max-aspect-ratio:${options.aspect || "3/1"})`);
    const half = +(options.w ?? 115), gap = +(options.gap ?? 30), top0 = +(options.top ?? 300), bottomR = +(options.bottom ?? 0.104);
    let m = null, raf = 0;
    const clear = () => {
      el.classList.remove("is-fx-open");
      ["transform", "clipPath"].forEach((k) => { media.style[k] = ""; });
    };
    const measure = () => {
      const left = el.getBoundingClientRect().left + scrollX;
      const baseX = -(el.offsetWidth / 2 + half + gap);
      m = { from: left + baseX, to: left, baseX, end: el.offsetWidth / 2 };
    };
    const draw = () => {
      raf = 0;
      if (!q.matches || !m) { clear(); return; }
      const sx = scrollX, H = el.offsetHeight;
      let x = m.baseX, t = top0, b = H * bottomR, w = half;
      if (reduce || sx >= m.to) { x = 0; t = 0; b = 0; w = m.end; }
      else if (sx > m.from) {
        const k = (sx - m.from) / (m.to - m.from);
        x = r1(lerp(m.baseX, 1, k));
        t = r1(top0 - lerp(0, top0, k));
        b = r1(b - lerp(0, b, k));
        w = r1(lerp(half, m.end, k));
      }
      el.classList.toggle("is-fx-open", reduce || sx > m.from);
      media.style.transform = `translateX(${x}px)`;
      media.style.clipPath = `polygon(calc(50% - ${w}px) ${t}px, calc(50% + ${w}px) ${t}px, calc(50% + ${w}px) calc(100% - ${b}px), calc(50% - ${w}px) calc(100% - ${b}px))`;
    };
    const upd = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const re = () => { measure(); upd(); };
    // Late fonts, photos and neighboring sections push the section’s position, so re-measure whenever the body size changes
    const ro = new ResizeObserver(re);
    ro.observe(document.body);
    addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", re);
    q.addEventListener("change", re);
    re();
    return () => {
      ro.disconnect();
      removeEventListener("scroll", upd);
      removeEventListener("resize", re);
      q.removeEventListener("change", re);
      cancelAnimationFrame(raf);
      clear();
    };
  });
})();
