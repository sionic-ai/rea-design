(() => {
  // Stack the cursor trail as columns and stamp it as dot characters per cell (default 9px) — older dots thinner and weaker, the head thick and hot.
  // Hot cells use the accent color, the hottest uses the accent lightened toward the text color. When the hand stops they cool at 1.2/s and vanish
  const RAMP = [["."], ["·", "."], ["·", "•"], ["•", "·", "o"], ["o", "•"], ["o", "•", "o"]];
  // A computed color from color-mix or oklch doesn’t come out as rgb() — paint one cell and read the actual rgb
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (probe, value) => {
    probe.style.color = value;
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(probe).color;
    pix.fillRect(0, 0, 1, 1);
    const [r, g, b] = pix.getImageData(0, 0, 1, 1).data;
    return `${r}, ${g}, ${b}`;
  };
  kfFx.register("glyph-heat-trail", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const cell = +options.cell || 9, follow = +(options.follow ?? 0.13), len = +options.length || 115, cool = +(options.cool ?? 1.2);
    const canvas = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas"));
    if (canvas !== el) canvas.className = "fx-glyph-heat-trail__canvas";
    const ctx = canvas.getContext("2d");
    const probe = document.createElement("i");
    probe.hidden = true;
    document.body.append(probe);
    let hi, lo, hot, hottest, font, blend;
    const readColors = () => {
      const cs = getComputedStyle(el);
      hi = rgbOf(probe, cs.getPropertyValue("--fx-hi").trim() || "var(--kf-ink)");
      lo = rgbOf(probe, cs.getPropertyValue("--fx-lo").trim() || "var(--kf-dim)");
      hot = rgbOf(probe, cs.getPropertyValue("--fx-hot").trim() || "var(--kf-accent)");
      hottest = rgbOf(probe, "color-mix(in oklab, var(--fx-hot, var(--kf-accent)) 72%, var(--kf-ink))");
      const bg = rgbOf(probe, "var(--kf-bg)").split(",").map(Number);
      // On dark backgrounds, add light (lighter) so it blazes, on light backgrounds just paint over — adding on light turns it washed-out white
      blend = options.blend || ((bg[0] * 0.3 + bg[1] * 0.59 + bg[2] * 0.11) < 110 ? "lighter" : "source-over");
      font = `600 ${+options.size || 12}px ${getComputedStyle(document.body).fontFamily}`;
    };
    readColors();
    let w = 0, h = 0, cols = 0, rows = 0, heat = new Float32Array(1);
    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      cols = Math.ceil(w / cell) + 1; rows = Math.ceil(h / cell) + 1;
      heat = new Float32Array(cols * rows);
    };
    size();
    document.fonts.load(font).then(() => { ctx.font = font; });
    const ro = new ResizeObserver(size);
    ro.observe(document.documentElement);
    const target = { x: w / 2, y: h / 2 }, pos = { x: target.x, y: target.y }, trail = [];
    let force = 0, glow = 0, raf = 0, running = false, last = performance.now(), dirty = null;
    const hash = (x, y, z, m) => { let n = (73855101 * x) ^ (19349663 * y) ^ (83492791 * z); n = (n ^ (n >>> 13)) >>> 0; return n % m; };
    const frame = (now) => {
      const dt = Math.min(Math.max(1, now - last) / 1000, 0.05);
      last = now;
      const tick = Math.floor(now / 320);
      pos.x += (target.x - pos.x) * follow; pos.y += (target.y - pos.y) * follow;
      force = Math.max(0, force - cool * dt);
      glow += (force - glow) * Math.min(1, 8 * dt);
      trail.push({ x: pos.x, y: pos.y });
      if (trail.length > len) trail.shift();
      if (dirty) { ctx.clearRect(dirty.x, dirty.y, dirty.w, dirty.h); dirty = null; }
      if (glow < 0.01 && force === 0) { running = false; return; }
      raf = requestAnimationFrame(frame);
      if (trail.length < 4 || glow < 0.01) return;
      const breathe = 1 + 0.07 * Math.sin((now / 1000) * 1.6) * (1 - force), amp = 0.35 + 0.65 * glow;
      let x0 = cols, x1 = 0, y0 = rows, y1 = 0;
      const step = Math.max(1, Math.ceil(trail.length / 62));
      for (let k = 0; k < trail.length; k += step) {
        const p = trail[k], t = k / (trail.length - 1);
        const r = (4 + 34 * Math.pow(t, 1.6)) * breathe * amp, wgt = (0.16 + Math.pow(t, 1.8)) * step * 0.5;
        const inv = 1 / (2 * r * r), reach = 2.2 * r;
        const a0 = Math.max(0, Math.floor((p.x - reach) / cell)), a1 = Math.min(cols - 1, Math.ceil((p.x + reach) / cell));
        const b0 = Math.max(0, Math.floor((p.y - reach) / cell)), b1 = Math.min(rows - 1, Math.ceil((p.y + reach) / cell));
        if (a0 > a1 || b0 > b1) continue;
        x0 = Math.min(x0, a0); x1 = Math.max(x1, a1); y0 = Math.min(y0, b0); y1 = Math.max(y1, b1);
        for (let j = b0; j <= b1; j++) {
          const dy = cell * j + cell / 2 - p.y, dy2 = dy * dy, row = j * cols;
          for (let i = a0; i <= a1; i++) { const dx = cell * i + cell / 2 - p.x; heat[row + i] += wgt * Math.exp(-(dx * dx + dy2) * inv); }
        }
      }
      if (x0 > x1) return;
      dirty = { x: (x0 - 1) * cell, y: (y0 - 1) * cell, w: (x1 - x0 + 3) * cell, h: (y1 - y0 + 3) * cell };
      ctx.globalCompositeOperation = blend;
      ctx.globalAlpha = glow;
      for (let j = y0; j <= y1; j++) {
        const row = j * cols, cy = cell * j + cell / 2;
        for (let i = x0; i <= x1; i++) {
          const v = heat[row + i];
          heat[row + i] = 0;
          if (v < 0.015) continue;
          const d = 1 - Math.exp(-1.1 * v);
          if (d < 0.04) continue;
          const lv = Math.min(RAMP.length - 1, Math.floor(d * RAMP.length)), set = RAMP[lv];
          ctx.fillStyle = d > 0.86 ? `rgba(${hottest}, ${0.7 + 0.3 * d})` : d > 0.58 ? `rgba(${hot}, ${0.35 + 0.6 * d})` : d > 0.28 ? `rgba(${hi}, ${0.1 + 0.85 * d})` : `rgba(${lo}, ${0.08 + 0.9 * d})`;
          ctx.fillText(set[hash(i, j, tick + lv, set.length)], cell * i + cell / 2, cy);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };
    const move = (e) => {
      target.x = e.clientX; target.y = e.clientY; force = 1;
      if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    addEventListener("pointermove", move, { passive: true });
    // When the skin changes (theme switch), re-read the colors
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      ro.disconnect(); mo.disconnect(); probe.remove();
      ctx.clearRect(0, 0, w, h);
      if (canvas !== el) canvas.remove();
    };
  });
})();
