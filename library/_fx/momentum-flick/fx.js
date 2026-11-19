// Mouse speed is sampled every 16ms — so it can be pushed at that speed and direction the moment it enters
(() => {
  const m = { x: 0, y: 0, vx: 0, vy: 0, t: 0 };
  addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - m.t < 16) return;
    m.t = now; m.vx = e.clientX - m.x; m.vy = e.clientY - m.y; m.x = e.clientX; m.y = e.clientY;
  }, { passive: true });
  gsap.registerPlugin(InertiaPlugin);
  const clamp = gsap.utils.clamp;
  kfFx.register("momentum-flick", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      if (reduce || !hover) return;
      const power = +(options.power ?? 30), spin = +(options.spin ?? 20);
      el.addEventListener("mouseenter", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy);
        const rot = d < 1 ? 0 : ((dx * m.vy - dy * m.vx) / d) * spin;
        gsap.to(el, { inertia: { x: { velocity: clamp(-200, 200, m.vx * power), end: 0 }, y: { velocity: clamp(-200, 200, m.vy * power), end: 0 }, rotation: { velocity: clamp(-60, 60, rot), end: 0 }, resistance: 200 } });
      }, { signal });
  
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
