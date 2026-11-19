(() => {
  kfFx.register("pixel-trail-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const CELL = +options.cell || 8, LIFE = +options.life || 450, KEEP = +options.keep || 40, BURST = +(options.burst ?? 14), SIZES = [4, 8, 8, 12, 16, 24];
    const cv = document.createElement("canvas");
    cv.className = "fx-pixel-trail";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    let dpr = 1, dots = [], last = null, raf = null;
    const colour = () => getComputedStyle(el).getPropertyValue("--fx-trail").trim() || getComputedStyle(el).color;
    let fill = colour();
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.fillStyle = fill;
      dots = dots.filter((d) => now - d.t < LIFE);
      for (const d of dots) {
        const a = now - d.t;
        if (a < 0) continue;
        const k = 1 - a / LIFE, size = Math.max(2, Math.round(d.cell * k)), off = Math.floor((d.cell - size) / 2);
        const x = d.burst ? Math.floor((d.ox + Math.cos(d.a) * d.r) / d.cell) : d.x, y = d.burst ? Math.floor((d.oy + Math.sin(d.a) * d.r) / d.cell) : d.y;
        ctx.globalAlpha = Math.min(1, k);
        ctx.fillRect(x * d.cell + off, y * d.cell + off, size, size);
      }
      ctx.globalAlpha = 1;
      raf = dots.length ? requestAnimationFrame(draw) : ((last = null), null);
    };
    const wake = () => { if (raf === null) raf = requestAnimationFrame(draw); };
    const move = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const cx = Math.floor(e.clientX / CELL), cy = Math.floor(e.clientY / CELL), now = performance.now(), o = last || { cx, cy };
      const n = Math.max(Math.abs(cx - o.cx), Math.abs(cy - o.cy), 1);
      for (let i = 1; i <= n; i++) {
        const x = Math.round(o.cx + ((cx - o.cx) * i) / n), y = Math.round(o.cy + ((cy - o.cy) * i) / n), p = dots[dots.length - 1];
        if (p && !p.burst && p.x === x && p.y === y) p.t = now; else dots.push({ x, y, t: now, cell: CELL });
      }
      const trail = dots.filter((d) => !d.burst);
      if (trail.length > KEEP) { const drop = new Set(trail.slice(0, trail.length - KEEP)); dots = dots.filter((d) => !drop.has(d)); }
      if (dots.length > 400) dots.splice(0, dots.length - 400);
      last = { cx, cy };
      wake();
    };
    const down = (e) => {
      if (!BURST || e.button !== 0 || (e.pointerType && e.pointerType !== "mouse")) return;
      const now = performance.now();
      for (let i = 0; i < BURST; i++) dots.push({ burst: true, ox: e.clientX, oy: e.clientY, a: Math.random() * Math.PI * 2, r: (0.1 + Math.random() * 0.9) * 5 * CELL, cell: SIZES[Math.floor(Math.random() * SIZES.length)], t: now - Math.random() * LIFE * 0.6 });
      fill = colour();
      wake();
    };
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down);
    return () => {
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      if (raf !== null) cancelAnimationFrame(raf);
      cv.remove();
    };
  });
})();
