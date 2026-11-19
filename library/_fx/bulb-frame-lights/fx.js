// String of bulbs around the frame (top and bottom [data-fx-part=row] pills inside) — .3 brightness at rest. Picks one of the on-screen cards every .5~1.5s
// Two heads send a wave circling .9 turns around the perimeter (the trail cools by (1−n)^2.5), and on hover it heats up in .05s with each bead delayed 0–.25s
// Turns on at .06s (three of them flicker at 14Hz up to .35 for the first .4s) and cools down in .8s on release
(() => {
  const L = { rest: 0.3, every: 1, rounds: 0.9, heads: 2, tail: 2.5, heatIn: 0.05, heatOut: 0.8, spread: 0.25, warm: 0.06, flickers: 3, flickTime: 0.4, rate: 14, dim: 0.35 };
  const live = new Set();
  let waveTimer = 0;
  const smooth = (x) => x * x * (3 - 2 * x);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const hash = (x) => { const s = Math.sin(x) * 43758.5453; return s - Math.floor(s); };
  const queueWave = () => {
    if (waveTimer || !live.size) return;
    waveTimer = setTimeout(() => {
      waveTimer = 0;
      const idle = [...live].filter((c) => c.seen && c.wave === null && !c.heat);
      if (idle.length) idle[Math.floor(Math.random() * idle.length)].wave = performance.now() / 1000;
      queueWave();
    }, L.every * (0.5 + Math.random()) * 1000);
  };

  kfFx.register("bulb-frame-lights", (el, { options, reduce, hover }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    const bulbs = rows.flatMap((r, ri) => { const b = [...r.children]; return ri % 2 ? b.reverse() : b; });
    if (!bulbs.length) return;
    const rest = +(options.rest ?? L.rest);
    const paint = (i, v) => bulbs[i].style.setProperty("--fx-glow", (rest + (1 - rest) * v).toFixed(2));
    bulbs.forEach((_, i) => paint(i, 0));
    if (reduce) return () => bulbs.forEach((b) => b.style.removeProperty("--fx-glow"));
    const n = bulbs.length;
    const c = { seen: false, wave: null, heat: 0, came: 0, plan: null, over: false, still: true };
    const plan = () => {
      const p = bulbs.map(() => ({ delay: Math.random() * L.spread, flicker: false, seed: Math.random() * 1000 }));
      for (let k = 0; k < Math.min(L.flickers, n); k++) p[Math.floor(Math.random() * n)].flicker = true;
      return p;
    };
    let last = 0;
    const tick = () => {
      const now = performance.now() / 1000, dt = last ? Math.min(0.1, Math.max(0.001, now - last)) : 0.016;
      last = now;
      if (c.over && !c.heat) { c.came = now; c.plan = plan(); }
      c.heat = clamp01(c.heat + dt / (c.over ? L.heatIn : -L.heatOut));
      const w = c.wave === null ? 2 : (now - c.wave) * L.rounds * L.heads;
      if (w >= 2) c.wave = null;
      const hot = smooth(c.heat);
      const busy = c.wave !== null || (c.heat > 0 && (c.heat < 1 || now - c.came < L.spread + L.flickTime));
      if (!busy && c.still) return;
      c.still = !busy;
      for (let i = 0; i < n; i++) {
        let v = 0;
        if (c.wave !== null) {
          const d = w - ((i / n) * L.heads - Math.floor((i / n) * L.heads));
          if (d >= 0 && d < 1) v = (1 - d) ** L.tail;
        }
        if (hot && c.plan) {
          const b = c.plan[i], t = now - c.came;
          let on = smooth(clamp01((t - b.delay) / L.warm));
          if (b.flicker && t - b.delay < L.flickTime && hash(b.seed + Math.floor(t * L.rate)) < 0.5) on *= L.dim;
          v = Math.max(v, hot * on);
        }
        paint(i, v);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      c.seen = e.isIntersecting;
      if (c.seen) { live.add(c); gsap.ticker.add(tick); queueWave(); } else { live.delete(c); gsap.ticker.remove(tick); }
    }, { threshold: 0.01 });
    io.observe(el);
    const enter = (e) => { if (e.pointerType !== "touch") { c.over = true; c.still = false; } };
    const leave = () => { c.over = false; c.still = false; };
    const tap = (e) => { if (e.pointerType === "touch") { c.over = true; c.still = false; setTimeout(leave, (L.spread + L.flickTime) * 1000); } };
    if (hover) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); }
    el.addEventListener("pointerup", tap);
    return () => {
      io.disconnect();
      live.delete(c);
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", tap);
      bulbs.forEach((b) => b.style.removeProperty("--fx-glow"));
    };
  });
})();
