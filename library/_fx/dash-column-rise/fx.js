(() => {
  const U = [-0.8, 0, 0.7, 1.4, 2.0, 2.5, 3.3, 3.3, 2.9, 2.4, 1.7, 1.0, 0, -0.8];
  const U8 = [-0.8, 0.4, 1.6, 2.6, 2.6, 1.6, 0.4, -0.8];
  kfFx.register("dash-column-rise", (el, { options, reduce }) => {
    const canvas = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const drawDur = +(options.draw ?? 2.5), blueShare = +(options.blue ?? 0.05);
    let W = 0, H = 0, dpr = 1, L = null, col = {};
    const layout = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.max(1, W * dpr); canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cs = getComputedStyle(el);
      // Dash and blue colors come from --fx-dash and --fx-blue (the original uses a dark gray that blends into the background and a faded blue) — if absent, the skin’s muted text color and accent color
      const v = (k) => cs.getPropertyValue(k).trim();
      col = { dash: v("--fx-dash") || v("--kf-dim") || cs.color, blue: v("--fx-blue") || v("--kf-accent") || cs.color };
      const mob = W < 640, n = +options.bars || (mob ? 8 : 14);
      const dw = W <= 1440 ? 2.5 + Math.max(0, Math.min(1, (W - 375) / 1065)) : 3.5 + Math.min(1, (W - 1440) / 1120) * 3;
      const dh = mob ? 16 : 21, gap = mob ? 8 : 10, pad = mob ? 12 : 20, step = dh + gap;
      const total = n * 3, sp = (W - pad * 2 - dw) / (total - 1), hideTop = H * 0.4, midBottom = H * 0.55;
      const shown = [], grow = [];
      const curve = n === 8 ? U8 : U;
      for (let i = 0; i < total; i++) {
        const g = (i / n) | 0, bi = i % n, x = pad + i * sp;
        const dist = Math.abs(bi - (n - 1) / 2);
        const sideOff = -dh * 2 + dist * dh * 0.5;
        for (let y0 = H - dh; y0 > -step * 2; y0 -= step) {
          if (g === 1) {
            if (y0 > midBottom || y0 < H * 0.05) continue;
            shown.push({ x, y: y0 + (curve[bi] || 0) * step, a: 0.15 + Math.min(1, y0 / midBottom) * 0.85 });
          } else if (y0 >= hideTop) {
            shown.push({ x, y: y0 - sideOff, a: 0.15 + Math.min(1, (y0 - hideTop) / (H - hideTop)) * 0.85 });
          } else if (y0 > hideTop - step * 6) {
            grow.push({ x, y: y0 - sideOff, a: 0.2 });
          }
        }
      }
      // Empty cells are drawn from the bottom up — within the same height the order is shuffled so rows stagger slightly
      grow.sort((a, b) => (Math.abs(b.y - a.y) > dh * 0.5 ? b.y - a.y : Math.random() - 0.5));
      L = { dw, dh, shown, grow, blues: new Set(), nextBlue: 0 };
    };
    const draw = (t) => {
      if (!L) return;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = L.dw; ctx.lineCap = "butt";
      if (t >= L.nextBlue) {
        L.nextBlue = t + 0.4;
        L.blues = new Set();
        const k = Math.round(L.shown.length * blueShare);
        for (let i = 0; i < k; i++) L.blues.add((Math.random() * L.shown.length) | 0);
        L.blueUntil = t + 0.8;
      }
      const cycle = drawDur + 1, p = reduce ? 1 : Math.min(1, (t % cycle) / drawDur), upto = Math.floor(p * L.grow.length);
      const line = (d, s) => { ctx.moveTo(d.x, d.y + L.dh * (1 - s)); ctx.lineTo(d.x, d.y + L.dh); };
      for (const [list, isGrow] of [[L.shown, false], [L.grow, true]]) {
        list.forEach((d, i) => {
          if (isGrow && i >= upto + 1) return;
          const s = isGrow ? (i < upto ? 1 : (p * L.grow.length) % 1) : 1;
          const blue = !isGrow && L.blues.has(i) && t < L.blueUntil;
          ctx.globalAlpha = d.a;
          ctx.strokeStyle = blue ? col.blue : col.dash;
          ctx.beginPath(); line(d, s); ctx.stroke();
        });
      }
      ctx.globalAlpha = 1;
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    if (reduce) { draw(0); return () => { ro.disconnect(); if (canvas !== el) canvas.remove(); }; }
    let raf = 0, seen = false, t0 = performance.now();
    const loop = (now) => { draw((now - t0) / 1000); raf = requestAnimationFrame(loop); };
    const run = () => { if (!raf && seen && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? run() : stop(); });
    io.observe(canvas);
    const vis = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", vis); if (canvas !== el) canvas.remove(); };
  });
})();
