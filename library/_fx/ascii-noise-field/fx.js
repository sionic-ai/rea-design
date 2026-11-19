// Letter noise field: a letter in each fixed-width cell, stamping only the bright side (by density) of a flowing pattern of layered noise values — 30fps, swapping 1% of the letters each frame,
// Inside the mouse radius it is brighter, and where it passed lights up briefly like a tail — brand (footer background)
(() => {
  const mix = (a, b, t) => a + (b - a) * t;
  const ease3 = (t) => t * t * (3 - 2 * t);
  const step = (lo, hi, v) => { const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo))); return t * t * (3 - 2 * t); };
  // Cell coordinates → 0..1 pseudo-random (integer mixing)
  const rnd = (x, y, z) => {
    let h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const vnoise = (x, y, z, s) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const u = ease3(x - xi), v = ease3(y - yi), w = ease3(z - zi), o = s * 977;
    const c = (dx, dy, dz) => rnd(xi + dx + o, yi + dy - o, zi + dz);
    return mix(
      mix(mix(c(0, 0, 0), c(1, 0, 0), u), mix(c(0, 1, 0), c(1, 1, 0), u), v),
      mix(mix(c(0, 0, 1), c(1, 0, 1), u), mix(c(0, 1, 1), c(1, 1, 1), u), v), w);
  };
  const fbm = (x, y, z, s) => 0.55 * vnoise(x, y, z, s) + 0.3 * vnoise(x * 2.1, y * 2.1, z * 1.6, s + 1) + 0.15 * vnoise(x * 4.3, y * 4.3, z * 2.2, s + 2);

  kfFx.register("ascii-noise-field", (el, { options, reduce }) => {
    const chars = Array.from(options.chars || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
    if (!chars.length) return;
    const density = +(options.density ?? 0.35), alphaMax = +(options.opacity ?? 0.3), patch = +options.patch || 160;
    const angle = +(options.angle ?? 0), speed = +(options.speed ?? 0.1), layers = Math.max(1, Math.round(+options.layers || 3)), seed = +(options.seed ?? 2);
    const hoverR = +(options["hover-radius"] ?? 100), hoverK = +(options["hover-strength"] ?? 0.2);
    const trail = +(options.trail ?? 3), trailR = +(options["trail-size"] ?? 150), trailA = +(options["trail-opacity"] ?? 0.6);
    const fontPx = +options.size || 9, track = +(options.tracking ?? 1), lineH = fontPx * (+options.leading || 1.2);
    const fps = +options.fps || 30;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.fxPart = "canvas";
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) { canvas.remove(); return; }
    const css = getComputedStyle(el);
    const fam = css.getPropertyValue("--kf-font-mono").trim() || "monospace";
    const font = `400 ${fontPx}px ${fam}`;

    let W = 0, H = 0, cw = 6, cols = 0, rows = 0, glyph = new Uint16Array(0), val = new Float32Array(0), tail = new Float32Array(0);
    let thr = -1, soft = 0.1, last = 0, t0 = performance.now(), raf = 0, seen = false;
    const m = { x: -1e4, y: -1e4, sx: -1e4, sy: -1e4, inside: false, here: 0 };
    const size = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;
      cw = Math.max(1, chars.reduce((s, ch) => s + ctx.measureText(ch).width, 0) / chars.length + track);
      cols = Math.ceil(W / cw); rows = Math.ceil(H / lineH);
      glyph = new Uint16Array(cols * rows); val = new Float32Array(cols * rows); tail = new Float32Array(cols * rows);
      for (let k = 0; k < glyph.length; k++) glyph[k] = Math.floor(Math.random() * chars.length);
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      if (!val.length) return;
      const ink = getComputedStyle(el).color;
      ctx.font = font; ctx.textBaseline = "top"; ctx.textAlign = "center"; ctx.fillStyle = ink;
      m.sx = mix(m.sx, m.x, 0.2); m.sy = mix(m.sy, m.y, 0.2);
      const moving = Math.hypot(m.x - m.sx, m.y - m.sy);
      m.here = mix(m.here, m.inside ? 1 : 0, 0.08);
      const dt = Math.min(Math.max(t - last, 0), 0.1); last = t;
      const fade = Math.pow(0.01, dt / Math.max(trail, 0.1));
      for (let k = 0; k < tail.length; k++) tail[k] *= fade;
      if (m.inside && moving > 1) {
        const c0 = Math.max(0, Math.floor((m.sx - trailR) / cw)), c1 = Math.min(cols - 1, Math.ceil((m.sx + trailR) / cw));
        const r0 = Math.max(0, Math.floor((m.sy - trailR) / lineH)), r1 = Math.min(rows - 1, Math.ceil((m.sy + trailR) / lineH));
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          const d = Math.hypot(c * cw - m.sx, r * lineH - m.sy);
          if (d < trailR) { const f = 1 - d / trailR, k = r * cols + c; tail[k] = Math.max(tail[k], f * f); }
        }
      }
      const L = Array.from({ length: layers }, (_, n) => {
        const a = ((angle + (n % 2 ? -1 : 1) * n * 18) * Math.PI) / 180, sp = speed * (1 + n * 0.35);
        return { cos: Math.cos(a), sin: Math.sin(a), z: t * sp, drift: t * sp * patch * 0.8, s: seed * 101 + n * 7 };
      });
      for (let r = 0; r < rows; r++) {
        const y = r * lineH;
        for (let c = 0; c < cols; c++) {
          const x = c * cw;
          let v = 0;
          for (const l of L) {
            const u = (x * l.cos + y * l.sin - l.drift) / (patch * 1.7), w = (-x * l.sin + y * l.cos) / patch;
            const warp = vnoise(u * 0.7 + 11, w * 0.7, l.z * 0.5, l.s + 3) - 0.5;
            v = Math.max(v, fbm(u + warp * 0.8, w + warp * 1.6, l.z, l.s));
          }
          val[r * cols + c] = v;
        }
      }
      const every = Math.max(1, Math.floor(val.length / 1500)), sample = [];
      for (let k = 0; k < val.length; k += every) sample.push(val[k]);
      sample.sort((a, b) => a - b);
      const q = (p) => sample[Math.min(sample.length - 1, Math.floor(p * sample.length))];
      const target = q(1 - density * 0.7);
      thr = thr < 0 ? target : mix(thr, target, 0.08);
      soft = mix(soft, Math.max((q(0.9) - q(0.1)) * 0.3, 0.02), 0.08);
      const R2 = hoverR * hoverR;
      for (let r = 0; r < rows; r++) {
        const y = r * lineH;
        for (let c = 0; c < cols; c++) {
          const x = c * cw, k = r * cols + c, v = val[k], grain = 0.45 + 0.55 * rnd(c, r, 7);
          let a = step(thr, thr + soft, v) * alphaMax * grain;
          const tk = tail[k];
          if (tk > 0.01) a = Math.max(a, step(thr, thr + soft, v + tk * soft * 4) * Math.min(tk * 1.5, 1) * alphaMax * trailA * grain);
          if (a > 0 && m.here > 0.01) {
            const dx = x - m.sx, dy = y - m.sy, d2 = dx * dx + dy * dy;
            if (d2 < R2) { const f = 1 - Math.sqrt(d2) / hoverR; a *= 1 + f * f * hoverK * m.here; }
          }
          if (a >= 0.01) { ctx.globalAlpha = Math.min(a, 1); ctx.fillText(chars[glyph[k]], x + cw / 2, y); }
        }
      }
      ctx.globalAlpha = 1;
      const swaps = Math.ceil(glyph.length * 0.01);
      for (let n = 0; n < swaps; n++) glyph[Math.floor(Math.random() * glyph.length)] = Math.floor(Math.random() * chars.length);
    };
    const now = () => (performance.now() - t0) / 1000;
    size();
    draw(0);
    let alive = true;
    document.fonts?.load(font).then(() => { if (alive) { size(); draw(reduce ? 0 : now()); } });
    if (reduce) return () => { alive = false; canvas.remove(); };

    let prev = 0;
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      if (ts - prev < 1000 / fps - 1) return;
      prev = ts;
      draw(now());
    };
    const sync = () => {
      const go = seen && !document.hidden;
      if (go && !raf) raf = requestAnimationFrame(loop);
      if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); });
    io.observe(el);
    const ro = new ResizeObserver(() => { size(); draw(now()); });
    ro.observe(el);
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      m.x = e.clientX - r.left; m.y = e.clientY - r.top;
      m.inside = m.x >= 0 && m.y >= 0 && m.x <= r.width && m.y <= r.height;
    };
    const onOut = () => { m.inside = false; };
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onOut);
    document.addEventListener("visibilitychange", sync);
    return () => {
      alive = false;
      cancelAnimationFrame(raf); raf = 0;
      io.disconnect(); ro.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onOut);
      document.removeEventListener("visibilitychange", sync);
      canvas.remove();
    };
  });
})();
