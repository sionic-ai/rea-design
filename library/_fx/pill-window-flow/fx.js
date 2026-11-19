(() => {
  // Original dimensions (Brand): wide screens are based on 1728 with pills 307×434 · gaps 153/96 · total width of five rows 2145, narrow screens (1024 and below) based on 393 with 115×162 · 32/32 · 704
  const WIDE = { base: 1728, total: 2145, w: 307, h: 434, gx: 153, gy: 96 };
  const NARROW = { base: 393, total: 704, w: 115, h: 162, gx: 32, gy: 32 };
  // Pill shape is a superellipse — larger n is closer to a rectangle
  const pill = (w, h, n) => {
    const p = new Path2D(), steps = 72;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const x = w / 2 + (w / 2) * Math.sign(c) * Math.abs(c) ** (2 / n), y = h / 2 + (h / 2) * Math.sign(s) * Math.abs(s) ** (2 / n);
      i ? p.lineTo(x, y) : p.moveTo(x, y);
    }
    p.closePath();
    return p;
  };
  kfFx.register("pill-window-flow", (el, { options, reduce }) => {
    const cols = Math.max(1, Math.round(+options.cols || 5)), dur = +options.dur || 6, every = Math.round(+(options.every ?? 3)), n = +options.n || 2.8;
    const narrow = matchMedia("(max-width: 1024px)");
    const css = getComputedStyle(el), paper = css.getPropertyValue("--kf-bg").trim(), surface = css.getPropertyValue("--kf-surface").trim(), accent = css.getPropertyValue("--kf-accent").trim();
    const win = document.createElement("canvas"), pat = document.createElement("canvas");
    win.dataset.fxPart = "window"; pat.dataset.fxPart = "pattern";
    win.setAttribute("aria-hidden", "true"); pat.setAttribute("aria-hidden", "true");
    el.append(win, pat);
    const wc = win.getContext("2d"), pc = pat.getContext("2d");
    // Pattern cell: one cell of staggered accent-color infinity (∞) knot loops
    const tile = document.createElement("canvas");
    tile.width = 34; tile.height = 44;
    const tc = tile.getContext("2d");
    tc.strokeStyle = accent; tc.globalAlpha = 0.75; tc.lineWidth = 1.6;
    [[9, 15], [26, 37], [26, -7]].forEach(([cx, cy]) => {
      tc.beginPath(); tc.moveTo(cx, cy);
      tc.bezierCurveTo(cx - 7, cy - 11, cx + 7, cy - 11, cx, cy);
      tc.bezierCurveTo(cx - 7, cy + 11, cx + 7, cy + 11, cx, cy);
      tc.stroke();
    });
    const pattern = pc.createPattern(tile, "repeat");
    let shape = null, key = "", raf = 0, t0 = null, seen = true;
    const size = () => {
      const dpr = devicePixelRatio || 1;
      for (const c of [win, pat]) { c.width = Math.max(1, c.offsetWidth * dpr); c.height = Math.max(1, c.offsetHeight * dpr); }
      if (reduce || !raf) draw(performance.now(), true);
    };
    const draw = (now, once) => {
      if (t0 === null) t0 = now;
      const dpr = devicePixelRatio || 1, W = win.offsetWidth, H = win.offsetHeight;
      if (!W || !H) { if (!once && !reduce) raf = requestAnimationFrame(draw); return; }
      const cfg = narrow.matches ? NARROW : WIDE, k = W / cfg.base;
      const pw = cfg.w * k, ph = cfg.h * k, gx = cfg.gx * k, gy = cfg.gy * k, step = ph + gy;
      const total = cols * pw + (cols - 1) * gx, x0 = (W - total) / 2, count = Math.ceil(H / step) + 3;
      const rows = reduce ? 0 : Math.max(0, now - t0) / (dur * 1000), frac = rows % 1, whole = Math.floor(rows);
      if (`${pw}x${ph}` !== key) { shape = pill(pw, ph, n); key = `${pw}x${ph}`; }
      wc.setTransform(dpr, 0, 0, dpr, 0, 0);
      wc.globalCompositeOperation = "source-over";
      wc.clearRect(0, 0, W, H); wc.fillStyle = paper; wc.fillRect(0, 0, W, H);
      wc.globalCompositeOperation = "destination-out";
      pc.setTransform(dpr, 0, 0, dpr, 0, 0);
      pc.clearRect(0, 0, W, H);
      for (let col = 0; col < cols; col++) {
        const x = x0 + col * (pw + gx), down = col % 2 === 1;
        for (let r = -1; r < count; r++) {
          // Odd-numbered rows (2, 4…) flow down, the rest flow up. Every few cells (the every value), one is a pattern cell instead of a window
          const y = down ? (frac - 1) * step + r * step : -frac * step + r * step;
          if (y > H) break;
          if (y + ph < 0) continue;
          const kind = every > 0 ? ((((down ? r - whole : r + whole) % every) + every) % every) : 0;
          if (every > 0 && kind === every - 1) {
            pc.save(); pc.translate(x, y); pc.clip(shape);
            pc.fillStyle = paper; pc.fillRect(0, 0, pw, ph);
            pc.globalAlpha = 0.5; pc.fillStyle = surface; pc.fillRect(0, 0, pw, ph); pc.globalAlpha = 1;
            pc.fillStyle = pattern; pc.fillRect(0, 0, pw, ph);
            pc.restore();
          } else { wc.save(); wc.translate(x, y); wc.fill(shape); wc.restore(); }
        }
      }
      wc.globalCompositeOperation = "source-over";
      raf = once || reduce || !seen ? 0 : requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(size);
    ro.observe(win);
    // Pauses off screen — when visible again, the start time is shifted by that amount so the flow continues
    let hiddenAt = 0;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (reduce) return;
      if (!seen) { cancelAnimationFrame(raf); raf = 0; hiddenAt = performance.now(); }
      else if (!raf) { if (hiddenAt && t0 !== null) t0 += performance.now() - hiddenAt; raf = requestAnimationFrame(draw); }
    });
    io.observe(el);
    size();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); win.remove(); pat.remove(); };
  });
})();
