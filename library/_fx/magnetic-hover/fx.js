(() => {
  // In the style of the original MagneticHoverEffect — if the cursor is within dist of the edge, it pulls by the center→cursor distance × pull (max max), depth follows smoothstep, and at corners it tilts by tilt°
  kfFx.register("magnetic-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const dist = +options.dist || 10, pull = +(options.pull ?? 0.68), max = +(options.max ?? 15), tilt = +(options.tilt ?? 2);
    const follow = +(options.follow ?? 0.15), back = +(options.back ?? 0.2);
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const smooth = (t) => t * t * (3 - 2 * t);
    let px = 0, py = 0, has = false, x = 0, y = 0, r = 0, raf = 0, last = 0;
    const step = (now) => {
      raf = 0;
      const dt = last ? clamp((now - last) / (1000 / 60), 0, 2) : 1;
      last = now;
      let tx = 0, ty = 0, tr = 0, active = false;
      const w = el.offsetWidth, h = el.offsetHeight;
      if (has && w && h) {
        const b = el.getBoundingClientRect();
        const cx = b.left + b.width / 2 - x, cy = b.top + b.height / 2 - y;
        const ox = clamp(px, cx - w / 2, cx + w / 2), oy = clamp(py, cy - h / 2, cy + h / 2);
        const out = Math.hypot(px - ox, py - oy);
        if (out < dist) {
          const c = smooth(1 - out / dist), dx = px - cx, dy = py - cy;
          tx = clamp(dx * pull, -max, max) * c;
          ty = clamp(dy * pull, -max, max) * c;
          tr = clamp(dx / (w / 2), -1, 1) * clamp(dy / (h / 2), -1, 1) * tilt * c;
          active = true;
        }
      }
      const k = 1 - (1 - (active ? follow : back)) ** dt;
      x += (tx - x) * k; y += (ty - y) * k; r += (tr - r) * k;
      const moving = Math.abs(tx - x) > 0.01 || Math.abs(ty - y) > 0.01 || Math.abs(tr - r) > 0.01;
      if (!moving) { x = tx; y = ty; r = tr; }
      el.style.translate = `${x}px ${y}px`;
      el.style.rotate = `${r}deg`;
      if (moving || active) raf = requestAnimationFrame(step); else last = 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(step); };
    const move = (e) => { px = e.clientX; py = e.clientY; has = true; wake(); };
    const leave = () => { has = false; wake(); };
    addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
      el.style.translate = el.style.rotate = "";
    };
  });
})();
