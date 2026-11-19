// Scrolling further at the page end pushes the body plate (target) up, revealing the footer pinned behind it (this element), and when scrolling stops (45ms) it closes as if dropping.
// Scroll amount is taken up to 24 per frame, accumulates into 0–1 progress times sensitivity (scrolling up clears it 1.35x faster), and progress follows by .13. Screen movement = −Footer height × (1 − (1 − progress)³)
(() => {
  kfFx.register("wheel-pull-footer", (el, { options, reduce }) => {
    const wrap = document.querySelector(options.target || "main");
    if (!wrap || reduce) return;
    const sens = +(options.sensitivity ?? 0.000825), maxStep = +(options.step ?? 24) || 24, idle = +(options.idle ?? 45);
    const fallMs = +(options.fall ?? 620) || 620, smooth = +(options.smooth ?? 0.13) || 0.13, back = +(options.back ?? 1.35);
    const bez = (x1, y1, x2, y2) => {
      const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
      const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
      return (x) => { let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; t -= e / d; } return sy(Math.max(0, Math.min(1, t))); };
    };
    const fallEase = bez(...String(options.ease || "0.83,0.02,0.23,0.99").split(",").map(Number));
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const atBottom = () => {
      const l = window.lenis;
      return l ? l.scroll >= l.limit - 2 : scrollY >= document.documentElement.scrollHeight - innerHeight - 2;
    };
    let progress = 0, target = 0, lastWheel = 0, acc = 0, raf = 0;
    let fall = { on: false, start: 0, from: 0 };
    const onWheel = (e) => {
      if (!atBottom() || e.deltaY <= 0) { if (!atBottom()) { acc = 0; fall.on = false; } return; }
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;
      if (e.deltaMode === 2) d *= innerHeight;
      acc += clamp(d, -maxStep, maxStep);
      lastWheel = performance.now();
      fall.on = false;
    };
    const tick = () => {
      const now = performance.now();
      const step = clamp(acc, -maxStep, maxStep);
      acc -= step;
      if (Math.abs(step) > 0.01) target = clamp(target + step * sens * (step > 0 ? 1 : back), 0, 1);
      if (now - lastWheel > idle && target > 0.001) { if (!fall.on) fall = { on: true, start: now, from: target }; acc *= 0.65; }
      if (fall.on) {
        const t = clamp((now - fall.start) / fallMs, 0, 1);
        target = fall.from * (1 - fallEase(t));
        if (t >= 1 || target < 0.001) { target = 0; fall.on = false; }
      }
      progress += (target - progress) * smooth;
      const y = -el.offsetHeight * (1 - Math.pow(1 - progress, 3));
      if (!window._isPageTransitioning) wrap.style.transform = Math.abs(y) < 0.01 ? "" : `translate3d(0, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("wheel", onWheel, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("wheel", onWheel); wrap.style.transform = ""; };
  });
})();
