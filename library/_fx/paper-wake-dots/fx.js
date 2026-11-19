// Cursor marks on paper — the cursor’s path is stamped like brush strokes into a 1/8-resolution mark grid (Float32) of the board (radius .085, thicker when faster, longer in the direction of movement),
// Each frame it blends .6 with its four neighbors and spreads, fading by .94. That trace is stamped into 6px halftone cells, each cell with its own random threshold so the darker it is, the denser the dots (a sparse cluster of dots).
// Pressing spreads a ring. The backdrop covers the whole plate so it doesn’t intercept interaction — it reads the window pointermove. Drawing rests once the marks have all faded
(() => {
  kfFx.register("paper-wake-dots", (el, { options, reduce }) => {
    if (reduce) return;
    const canvas = document.createElement("canvas");
    canvas.dataset.fxPart = "canvas";
    el.prepend(canvas);
    const g = canvas.getContext("2d");
    const cellPx = +(options.cell ?? 8) || 8, radius = +(options.radius ?? 0.085), decay = +(options.decay ?? 0.94), bleed = +(options.bleed ?? 0.6);
    const pitch = +(options.pitch ?? 6) || 6, amount = +(options.amount ?? 0.4), force = +(options.force ?? 0.1), gain = +(options.gain ?? 1.5);
    let W = 0, H = 0, tw = 0, th = 0, T = new Float32Array(0), N = new Float32Array(0), hash = new Float32Array(0), cols = 0, rows = 0;
    const size = () => {
      const r = el.getBoundingClientRect();
      W = canvas.width = Math.max(1, Math.round(r.width)); H = canvas.height = Math.max(1, Math.round(r.height));
      tw = Math.max(8, Math.ceil(W / cellPx)); th = Math.max(8, Math.ceil(H / cellPx));
      T = new Float32Array(tw * th); N = new Float32Array(tw * th);
      cols = Math.ceil(W / pitch); rows = Math.ceil(H / pitch);
      hash = new Float32Array(cols * rows);
      for (let i = 0; i < hash.length; i++) { const x = Math.sin(i * 12.9898 + (i % cols) * 78.233) * 43758.5453; hash[i] = x - Math.floor(x); }
    };
    const readInk = () => { g.fillStyle = getComputedStyle(el).color; };
    const mouse = { x: 0.5, y: 0.5, px: null, py: null, f: 0, dx: 0, dy: 0 };
    const ring = { x: 0, y: 0, r: 0, s: 0 };
    let raf = 0;
    const frame = () => {
      raf = 0;
      const live = step();
      draw();
      if (live > 0.004 || mouse.f > 0.01 || ring.s > 0.001) raf = requestAnimationFrame(frame);
      else g.clearRect(0, 0, W, H);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (mouse.px !== null) {
        const dx = (x - mouse.px) * (r.width / r.height), dy = y - mouse.py, len = Math.hypot(dx, dy);
        // Force = This stroke’s length in px ÷ 15 (max 1) — the faster the stroke, the thicker and darker it is
        mouse.f = Math.min(1, Math.max(mouse.f, (len * r.height) / 15));
        if (len > 1e-5) { mouse.dx = dx / len; mouse.dy = dy / len; }
      }
      mouse.x = mouse.px = x; mouse.y = mouse.py = y;
      wake();
    };
    const onDown = (e) => { const r = el.getBoundingClientRect(); ring.x = (e.clientX - r.left) / r.width; ring.y = (e.clientY - r.top) / r.height; ring.r = 0; ring.s = 0.5; wake(); };
    const step = () => {
      const asp = W / H;
      // Bleed and fade-out
      for (let y = 0; y < th; y++) {
        const yu = y > 0 ? y - 1 : y, yd = y < th - 1 ? y + 1 : y;
        for (let x = 0; x < tw; x++) {
          const i = y * tw + x, c = T[i];
          const n = (T[y * tw + (x > 0 ? x - 1 : x)] + T[y * tw + (x < tw - 1 ? x + 1 : x)] + T[yu * tw + x] + T[yd * tw + x]) * 0.25;
          N[i] = (c + (n - c) * bleed) * decay;
        }
      }
      // Brush stroke — Gaussian stretched by .65 toward the movement direction, radius widens with intensity
      const fz = Math.min(1, mouse.f * force);
      if (fz > 0.001) {
        const r = radius * (1 + fz * 1.5), r2 = r * r;
        const x0 = Math.max(0, Math.floor((mouse.x - (r * 3) / asp) * tw)), x1 = Math.min(tw - 1, Math.ceil((mouse.x + (r * 3) / asp) * tw));
        const y0 = Math.max(0, Math.floor((mouse.y - r * 3) * th)), y1 = Math.min(th - 1, Math.ceil((mouse.y + r * 3) * th));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          let dx = ((x + 0.5) / tw - mouse.x) * asp, dy = (y + 0.5) / th - mouse.y;
          const along = dx * mouse.dx + dy * mouse.dy;
          dx -= mouse.dx * along * 0.65; dy -= mouse.dy * along * 0.65;
          const i = y * tw + x;
          N[i] = Math.min(1, N[i] + fz * Math.exp(-(dx * dx + dy * dy) / r2));
        }
      }
      // Press ring — radius +.012 per frame, strength ×.93
      if (ring.s > 0.001) {
        for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
          const dx = ((x + 0.5) / tw - ring.x) * asp, dy = (y + 0.5) / th - ring.y;
          const k = Math.hypot(dx, dy) - ring.r;
          if (k > -0.06 && k < 0.06) { const i = y * tw + x; N[i] = Math.min(1, N[i] + ring.s * 0.08 * Math.exp((-k * k) / 0.0004)); }
        }
        ring.r += 0.012; ring.s *= 0.93;
      } else ring.s = 0;
      mouse.f *= 0.85;
      const t = T; T = N; N = t;
      let max = 0;
      for (let i = 0; i < T.length; i++) if (T[i] > max) max = T[i];
      return max;
    };
    const draw = () => {
      g.clearRect(0, 0, W, H);
      g.globalAlpha = amount;
      g.beginPath();
      for (let cy = 0; cy < rows; cy++) {
        const py = (cy + 0.5) * pitch, row = Math.min(th - 1, Math.floor((py / H) * th)) * tw;
        for (let cx = 0; cx < cols; cx++) {
          const px = (cx + 0.5) * pitch, v = T[row + Math.min(tw - 1, Math.floor((px / W) * tw))] * gain;
          const h = hash[cy * cols + cx];
          if (v <= h) continue;
          const rad = pitch * (0.22 + 0.12 * Math.min(1, v - h));
          g.moveTo(px + rad, py);
          g.arc(px, py, rad, 0, Math.PI * 2);
        }
      }
      g.fill();
    };
    const ro = new ResizeObserver(() => { size(); readInk(); });
    ro.observe(el);
    size();
    readInk();
    const onTheme = () => readInk();
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    el.addEventListener("fx:repaint", onTheme);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      el.removeEventListener("fx:repaint", onTheme);
      canvas.remove();
    };
  });
})();
