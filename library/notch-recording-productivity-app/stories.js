// Story cards: on hover each photo adds a random ±4° to its original tilt and grows by (i+1)×.04.
// Exactly the default transition of the original framer-motion 10 variants — tilt spring (stiffness 500·damping 25), scale spring (stiffness 550·damping 30), both restSpeed 10·restDelta .01.
// framer is React-only, so the same spring analytic solution is solved directly (if it stops and re-enters, it carries over the speed at that moment).
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPRING = { rotate: [500, 25], scale: [550, 30] };
  const spring = (k, c, x0, v0, to) => {
    const w0 = Math.sqrt(k), z = c / (2 * Math.sqrt(k)), wd = w0 * Math.sqrt(1 - z * z);
    const A = x0 - to, B = (v0 + z * w0 * A) / wd;
    return (t) => {
      const e = Math.exp(-z * w0 * t), cs = Math.cos(wd * t), sn = Math.sin(wd * t);
      const x = to + e * (A * cs + B * sn);
      const v = e * ((B * wd - z * w0 * A) * cs - (A * wd + z * w0 * B) * sn);
      return [x, v];
    };
  };
  document.querySelectorAll("[data-story]").forEach((card) => {
    const photos = [...card.querySelectorAll(".am-story__photo > div")].map((el) => {
      const base = parseFloat(getComputedStyle(el.parentElement).getPropertyValue("--r")) || 0;
      return { el, base, rotate: { x: base, v: 0, f: null }, scale: { x: 1, v: 0, f: null } };
    });
    let raf = 0, last = 0;
    const paint = (p) => { p.el.style.transform = `rotate(${p.rotate.x}deg) scale(${p.scale.x})`; };
    photos.forEach(paint);
    const step = (now) => {
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      let moving = false;
      photos.forEach((p) => {
        ["rotate", "scale"].forEach((key) => {
          const s = p[key];
          if (!s.f) return;
          s.t += dt;
          const [x, v] = s.f(s.t);
          s.x = x; s.v = v;
          if (Math.abs(v) <= 10 && Math.abs(s.to - x) <= 0.01) { s.x = s.to; s.v = 0; s.f = null; }
          else moving = true;
        });
        paint(p);
      });
      raf = moving ? requestAnimationFrame(step) : 0;
    };
    const go = (open) => {
      photos.forEach((p, i) => {
        const to = { rotate: open ? p.base + (Math.random() * 8 - 4) : p.base, scale: open ? 1 + (i + 1) * 0.04 : 1 };
        ["rotate", "scale"].forEach((key) => {
          const s = p[key];
          s.to = to[key];
          if (reduced) { s.x = s.to; s.v = 0; s.f = null; return; }
          s.f = spring(SPRING[key][0], SPRING[key][1], s.x, s.v, s.to);
          s.t = 0;
        });
        if (reduced) paint(p);
      });
      if (!reduced && !raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    };
    card.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && go(true));
    card.addEventListener("pointerleave", (e) => e.pointerType !== "touch" && go(false));
  });
})();
