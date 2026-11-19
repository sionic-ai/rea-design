(() => {
  kfFx.register("spring-lean-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const k = +(options.stiffness ?? 90), damp = +(options.damping ?? 11);
    const reach = +(options.reach ?? 1.6), max = +(options.max ?? 0.1), pull = +(options.pull ?? 0.35);
    const bound = options.bound ? el.closest(options.bound) : null;
    let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, raf = 0, last = 0;
    const step = (now) => {
      // When a tab returns after resting, the gap between frames is long and the spring jumps — cap one frame at 32ms
      const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000) || 0.016);
      last = now;
      vx += ((tx - x) * k - vx * damp) * dt;
      vy += ((ty - y) * k - vy * damp) * dt;
      x += vx * dt; y += vy * dt;
      el.style.translate = x.toFixed(2) + "px " + y.toFixed(2) + "px";
      const still = Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05 && Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05;
      raf = still ? 0 : requestAnimationFrame(step);
    };
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    const move = (e) => {
      const r = el.getBoundingClientRect(), w = r.width;
      // Measure from the resting position before moving so what was already dragged isn’t dragged again
      const dx = e.clientX - (r.left + w / 2 - x), dy = e.clientY - (r.top + r.height / 2 - y);
      const d = Math.hypot(dx, dy), f = w * reach;
      const p = d < f * 2.2 ? Math.exp(-((d / f) ** 2)) : 0;
      const h = d ? (Math.min(d * pull, w * max) * p) / d : 0;
      tx = dx * h; ty = dy * h;
      if (bound) tx = Math.min(tx, Math.max(0, (bound.getBoundingClientRect().right - (r.right - x)) * 0.75));
      wake();
    };
    const leave = () => { tx = 0; ty = 0; wake(); };
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      el.style.translate = "";
    };
  });
})();
