// Footprints walk diagonally across the panel — staggered left and right footprints appear from the front at .12s intervals (14%), stay (until 48%), then vanish (2.4s per cycle)
(() => {
  const PAW = '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="15.5" rx="5.6" ry="4.8" fill="currentColor"/><ellipse cx="5.2" cy="9.6" rx="2.2" ry="2.8" fill="currentColor"/><ellipse cx="9.4" cy="5.6" rx="2.2" ry="2.9" fill="currentColor"/><ellipse cx="14.6" cy="5.6" rx="2.2" ry="2.9" fill="currentColor"/><ellipse cx="18.8" cy="9.6" rx="2.2" ry="2.8" fill="currentColor"/></svg>';
  const pair = (s, d) => (s || d).split(/[\s,]+/).map(Number);
  kfFx.register("paw-trail-loader", (el, { options, reduce }) => {
    if (reduce) return;
    const n = Math.max(2, +options.count || 16), cycle = +(options.cycle ?? 2.4), each = +(options.each ?? 0.12), peak = +(options.peak ?? 0.85);
    const side = +(options.side ?? 12), tilt = +(options.tilt ?? 8), loop = options.loop === "on";
    // Horizontal panels go from lower left → upper right, vertical panels from top → bottom (ratio to panel size)
    const wideLine = [...pair(options.from, "0.24 0.74"), ...pair(options.to, "0.98 0.44")];
    const tallLine = [...pair(options["from-tall"], "0.42 -0.02"), ...pair(options["to-tall"], "0.8 1.02")];
    // path: curve — like the original, draws a random quadratic curve from outside the board to outside, one footstep per gap (px) (step count is set by curve length)
    const curve = options.path === "curve", gap = +options.gap || 58;
    const curvePoints = (w, h) => {
      const R = Math.random, tall = w < h;
      const a = R() < 0.5 ? 0.1 + 0.18 * R() : 0.72 + 0.18 * R(), l = 0.42 + 0.16 * R(), o = 0.36 + 0.28 * R(), k = 0.38 + 0.24 * R();
      const p0 = tall ? [w * a, h + 80] : [-80, h * a], p1 = tall ? [w * l, h * k] : [w * k, h * l], p2 = tall ? [w * o, -232] : [w + 232, h * o];
      const pts = Array.from({ length: 401 }, (_, i) => { const t = i / 400, u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; });
      const out = [];
      let run = 0;
      for (let i = 1; i < pts.length; i++) {
        run += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (run < gap) continue;
        run = 0;
        const A = pts[Math.max(0, i - 4)], B = pts[Math.min(400, i + 4)];
        out.push({ x: pts[i][0], y: pts[i][1], dx: B[0] - A[0], dy: B[1] - A[1] });
      }
      return out;
    };
    const layer = document.createElement("div");
    layer.className = "fx-paw-trail";
    layer.setAttribute("aria-hidden", "true");
    el.append(layer);
    const first = curve ? curvePoints(el.clientWidth || 1, el.clientHeight || 1) : null;
    const paws = Array.from({ length: curve ? Math.max(1, first.length) : n }, () => {
      const p = document.createElement("span");
      p.className = "fx-paw";
      p.innerHTML = PAW;
      layer.append(p);
      return p;
    });
    let steps = first, lastW = el.clientWidth || 1, lastH = el.clientHeight || 1;
    const place = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      if (curve) {
        // Redraw the curve only when the plate size changes (so the first ResizeObserver call doesn’t change the curve)
        if (w !== lastW || h !== lastH) { steps = curvePoints(w, h); lastW = w; lastH = h; }
        paws.forEach((p, i) => {
          const q = steps[i];
          if (!q) { p.style.display = "none"; return; }
          const len = Math.hypot(q.dx, q.dy) || 1, s = i % 2 ? 1 : -1;
          p.style.display = "";
          p.style.left = `${q.x - (q.dy / len) * side * s}px`;
          p.style.top = `${q.y + (q.dx / len) * side * s}px`;
          p.style.transform = `translate(-50%, -50%) rotate(${(Math.atan2(q.dy, q.dx) * 180) / Math.PI + 90}deg)`;
        });
        return;
      }
      const [a, b, c, d] = w > h ? wideLine : tallLine;
      const x0 = a * w, y0 = b * h, x1 = c * w, y1 = d * h;
      const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 90;
      const len = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
      paws.forEach((p, i) => {
        const t = (i + 0.5) / n, s = i % 2 ? 1 : -1;
        p.style.left = `${x0 + (x1 - x0) * t + nx * side * s}px`;
        p.style.top = `${y0 + (y1 - y0) * t + ny * side * s}px`;
        p.style.transform = `translate(-50%, -50%) rotate(${ang + s * tilt}deg)`;
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    const tweens = paws.map((p, i) => gsap.to(p, {
      keyframes: { "0%": { opacity: 0 }, "14%": { opacity: peak }, "48%": { opacity: peak }, "100%": { opacity: 0 } },
      duration: cycle, delay: +(options.delay ?? 0) + i * each, ease: "power1.out",
      repeat: loop ? -1 : 0, repeatDelay: loop ? Math.max(0, n * each - cycle) : 0,
    }));
    return () => { ro.disconnect(); tweens.forEach((t) => t.kill()); layer.remove(); };
  });
})();
