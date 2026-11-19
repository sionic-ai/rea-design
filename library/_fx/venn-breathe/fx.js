// Three-region loop graphic — three labels (data-fx-part=label, ”front row / back row”) draws three ellipses that swell one after another every step seconds up to grow times (edge 50% trapezoid curve) and then return,
// Size follows a spring (stiffness·damping), wobbling ±2.5% as it grows, and the name text grows from 40 → 64 (680×420 panel at 1440 width).
// The outline around the three is drawn as one more rounded line, inflated by hull and shrunk back (closing) — grid distance field twice + contour
(() => {
  kfFx.register("venn-breathe", (el, { options, reduce: reduceNow }) => {
  const labels = [...el.querySelectorAll("[data-fx-part=label]")].map((n) => n.textContent.split("/").map((t) => t.trim()));
  if (labels.length < 3) return;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "display:block;width:100%;height:auto";
  el.append(canvas);
  const ctx = canvas.getContext("2d");
  const W = 680, H = 420, m = W / 1440;
  const rx = (485 / 2) * m, ry = (323 / 2) * m, gapX = 2 * rx + 32 * m, gapY = 2 * ry;
  const E = [
    { cx: W / 2 - gapX / 2, cy: H / 2 - gapY / 2, lines: labels[0] },
    { cx: W / 2 + gapX / 2, cy: H / 2 - gapY / 2, lines: labels[1] },
    { cx: W / 2, cy: H / 2 + gapY / 2, lines: labels[2] },
  ];
  const P = { step: +(options.step ?? 1.15), ramp: 0.5, k: +(options.stiffness ?? 8), damp: +(options.damping ?? 0.3), hero: +(options.grow ?? 1.52), wobble: +(options.wobble ?? 0.025), offset: +(options.hull ?? 50), laps: 3, fontMin: 40 * m, fontMax: 64 * m };
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--kf-ink").trim();
  const font = (css.getPropertyValue("--kf-font-display") || "sans-serif").trim();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let scale = 1, elapsed = 0, raf = null, last = null, onscreen = true, alive = true;

  const trap = (t) => {
    const e = P.ramp, i = 1 - e;
    const s = t < e ? (t * t) / (2 * e) : t <= 1 - e ? e / 2 + (t - e) : i - ((1 - t) * (1 - t)) / (2 * e);
    return s / i;
  };
  const scalesAt = (t) => {
    const n = E.length, at = ((t % n) + n) % n;
    return E.map((_, r) => { const h = Math.abs(r - at), c = Math.min(h, n - h); return 1 + (P.hero - 1) * (1 - trap(Math.min(Math.max(c, 0), 1))); });
  };
  let val = scalesAt(0), vel = E.map(() => 0);
  const spring = (target, dt) => {
    const steps = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / steps;
    for (let s = 0; s < steps; s++) for (let c = 0; c < val.length; c++) {
      vel[c] += (P.k * P.k * (target[c] - val[c]) - 2 * P.damp * P.k * vel[c]) * h;
      val[c] += vel[c] * h;
    }
  };

  // On a grid (4 units), find the shape of the ellipse union inflated by 50 and shrunk back by 50, using two distance transforms
  const CELL = 4, GX = Math.ceil(W / CELL) + 1, GY = Math.ceil(H / CELL) + 1, N = GX * GY;
  const inside = new Uint8Array(N), d1 = new Float32Array(N), d2 = new Float32Array(N);
  const dist = (src, out, wantInside) => {
    const BIG = 1e6;
    for (let i = 0; i < N; i++) out[i] = src[i] === wantInside ? 0 : BIG;
    const a = CELL, b = CELL * Math.SQRT2;
    for (let y = 0; y < GY; y++) for (let x = 0; x < GX; x++) {
      const i = y * GX + x;
      let v = out[i];
      if (x > 0) v = Math.min(v, out[i - 1] + a);
      if (y > 0) { v = Math.min(v, out[i - GX] + a); if (x > 0) v = Math.min(v, out[i - GX - 1] + b); if (x < GX - 1) v = Math.min(v, out[i - GX + 1] + b); }
      out[i] = v;
    }
    for (let y = GY - 1; y >= 0; y--) for (let x = GX - 1; x >= 0; x--) {
      const i = y * GX + x;
      let v = out[i];
      if (x < GX - 1) v = Math.min(v, out[i + 1] + a);
      if (y < GY - 1) { v = Math.min(v, out[i + GX] + a); if (x < GX - 1) v = Math.min(v, out[i + GX + 1] + b); if (x > 0) v = Math.min(v, out[i + GX - 1] + b); }
      out[i] = v;
    }
  };
  const hull = (sx) => {
    for (let y = 0; y < GY; y++) for (let x = 0; x < GX; x++) {
      const px = x * CELL, py = y * CELL;
      let inn = 0;
      for (let k = 0; k < E.length; k++) {
        const dx = (px - E[k].cx) / (rx * sx[k].x), dy = (py - E[k].cy) / (ry * sx[k].y);
        if (dx * dx + dy * dy <= 1) { inn = 1; break; }
      }
      inside[y * GX + x] = inn;
    }
    dist(inside, d1, 1);
    for (let i = 0; i < N; i++) inside[i] = d1[i] <= P.offset ? 1 : 0;
    dist(inside, d2, 0);
    // Contour (value = distance to outside − 50) — connect edge intersections per cell to draw line segments
    ctx.beginPath();
    const f = (x, y) => d2[y * GX + x] - P.offset;
    const lerp = (a, b, va, vb) => a + (b - a) * (va / (va - vb));
    for (let y = 0; y < GY - 1; y++) for (let x = 0; x < GX - 1; x++) {
      const v0 = f(x, y), v1 = f(x + 1, y), v2 = f(x + 1, y + 1), v3 = f(x, y + 1);
      const pts = [];
      const X0 = x * CELL, Y0 = y * CELL, X1 = X0 + CELL, Y1 = Y0 + CELL;
      if ((v0 > 0) !== (v1 > 0)) pts.push([lerp(X0, X1, v0, v1), Y0]);
      if ((v1 > 0) !== (v2 > 0)) pts.push([X1, lerp(Y0, Y1, v1, v2)]);
      if ((v3 > 0) !== (v2 > 0)) pts.push([lerp(X0, X1, v3, v2), Y1]);
      if ((v0 > 0) !== (v3 > 0)) pts.push([X0, lerp(Y0, Y1, v0, v3)]);
      for (let p = 0; p + 1 < pts.length; p += 2) { ctx.moveTo(pts[p][0], pts[p][1]); ctx.lineTo(pts[p + 1][0], pts[p + 1][1]); }
    }
  };

  const size = () => {
    const pr = devicePixelRatio || 1, w = canvas.clientWidth, h = Math.round(w * (H / W));
    canvas.width = Math.round(w * pr);
    canvas.height = Math.round(h * pr);
    canvas.style.height = h + "px";
    scale = w / W;
    ctx.setTransform(pr * scale, 0, 0, pr * scale, 0, 0);
  };
  const render = (s) => {
    ctx.clearRect(0, 0, W, H);
    const pr = devicePixelRatio || 1, lw = 1.3 / (pr * scale);
    const w = (elapsed / (E.length * P.step)) * P.laps * 2 * Math.PI;
    const sx = E.map((_, n) => {
      const t = Math.min(Math.max((s[n] - 1) / (P.hero - 1), 0), 1), a = P.wobble * t;
      return { x: s[n] * (1 + a * Math.sin(w + n * 2.1)), y: s[n] * (1 + a * Math.sin(w + n * 2.1 + 1.7)) };
    });
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = ink;
    ctx.lineWidth = lw;
    hull(sx);
    ctx.stroke();
    E.forEach((e, n) => {
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(e.cx, e.cy, rx * sx[n].x, ry * sx[n].y, 0, 0, Math.PI * 2);
      ctx.stroke();
      const size = P.fontMin + (P.fontMax - P.fontMin) * ((s[n] - 1) / (P.hero - 1));
      ctx.globalAlpha = 1;
      ctx.fillStyle = ink;
      ctx.font = `600 ${size}px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if ("letterSpacing" in ctx) ctx.letterSpacing = "-0.02em";
      if (e.lines.length > 1) { ctx.fillText(e.lines[0], e.cx, e.cy - size * 0.65); ctx.fillText(e.lines[1], e.cx, e.cy + size * 0.75); }
      else ctx.fillText(e.lines[0], e.cx, e.cy);
    });
  };
  const frame = (t) => {
    if (last === null) { last = t; raf = requestAnimationFrame(frame); return; }
    const dt = Math.min((t - last) / 1000, 0.1);
    last = t;
    elapsed += dt;
    spring(scalesAt(elapsed / P.step), dt);
    render(val);
    raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    const go = alive && onscreen && document.visibilityState === "visible" && !reduce.matches;
    if (go && raf === null) { last = null; raf = requestAnimationFrame(frame); }
    if (!go && raf !== null) { cancelAnimationFrame(raf); raf = null; }
  };
  size();
  const ro = new ResizeObserver(() => { size(); render(val); });
  ro.observe(canvas);
  const io = new IntersectionObserver((es) => { onscreen = es.some((e) => e.isIntersecting); sync(); }, { threshold: 0 });
  io.observe(canvas);
  const onRm = () => { render(scalesAt(0)); sync(); };
  document.addEventListener("visibilitychange", sync);
  reduce.addEventListener("change", onRm);
  document.fonts?.ready.then(() => alive && render(val));
  render(val);
  sync();
  return () => {
    alive = false;
    sync();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", sync);
    reduce.removeEventListener("change", onRm);
    canvas.remove();
  };
  });
})();
