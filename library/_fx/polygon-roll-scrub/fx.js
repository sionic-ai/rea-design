// An angular wheel rolls along a catenary path and becomes a circle — Brand process panel values (4→12 sides, edges lengthen over the first 30%, radius .13, rest for the first 25%, followers trail by .2 each)
(() => {
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (t) => t * t * (3 - 2 * t);
  const poly = (n, r) => Array.from({ length: n }, (_, i) => { const a = Math.PI / 2 + (2 * Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const verts = (nf, r) => {
    const lo = Math.floor(nf), fr = nf - lo, base = poly(lo, r);
    if (fr < 1e-9) return base;
    const start = [base[0], [(base[0][0] + base[1][0]) / 2, (base[0][1] + base[1][1]) / 2], ...base.slice(1)];
    const hi = poly(lo + 1, r), ref = Math.atan2(base[0][1], base[0][0]);
    let best = 0, bd = Infinity;
    hi.forEach((p, o) => { let d = Math.abs(Math.atan2(p[1], p[0]) - ref); if (d > Math.PI) d = 2 * Math.PI - d; if (d < bd) { bd = d; best = o; } });
    return start.map((p, i) => { const q = hi[(i + best) % hi.length]; return [lerp(p[0], q[0], fr), lerp(p[1], q[1], fr)]; });
  };
  kfFx.register("polygon-roll-scrub", (root, { options, reduce, scroller }) => {
    const stage = root.querySelector('[data-fx-part="stage"]') || root;
    let cv = stage.querySelector('[data-fx-part="canvas"]'), made = false;
    if (!cv) { cv = document.createElement("canvas"); cv.setAttribute("data-fx-part", "canvas"); cv.setAttribute("aria-hidden", "true"); stage.append(cv); made = true; }
    const g = cv.getContext("2d");
    if (!g) return;
    const N0 = Math.max(3, Math.round(+(options.from || 4))), N1 = Math.max(N0 + 1, Math.round(+(options.to || 12)));
    const RK = +(options.radius ?? 0.13), PH = +(options.phase ?? 0.3) || 0.3, K = +(options.smooth ?? 0.2), MARGIN = +(options.margin ?? 360);
    let W = 0, H = 0, R = 0, xL = 0, xR = 0, tIn = 0, target = 0, cur = 0, raf = 0, mob = false, off = 0;
    const src = scroller || window;
    const aim = () => {
      const vh = scroller ? scroller.clientHeight : innerHeight;
      const top = root.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
      const span = Math.max(1, root.offsetHeight - vh);
      const raw = Math.min(1, Math.max(0, -top) / span);
      target = Math.max(0, (raw - off) / (1 - off || 1));
      if (reduce) { cur = target; draw(); return; }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      cur = lerp(cur, target, K);
      if (Math.abs(target - cur) < 5e-4) cur = target;
      draw();
      raf = Math.abs(target - cur) >= 5e-4 ? requestAnimationFrame(loop) : 0;
    };
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = stage.clientWidth; H = stage.clientHeight;
      if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      mob = W <= 767;
      off = options.offset != null ? +options.offset : mob ? 0 : 0.25;
      R = Math.min(W, H) * RK * (mob ? 1.2 : 1);
      xL = mob ? R : -R; xR = W - R;
      tIn = mob ? 0.05 : (2 * R) / Math.max(1, xR - xL);
      aim(); draw();
    };
    const draw = () => {
      if (!W || !H) return;
      const t = Math.min(1, Math.max(0, cur)), col = getComputedStyle(stage).color;
      const tm = ss(Math.min(1, Math.max(0, (t - tIn) / (1 - tIn))));
      const tp = Math.min(tm / PH, 1), circ = ss(Math.max(0, (tm - PH) / (1 - PH)));
      const nf = N0 + tp * (N1 - N0), lo = Math.floor(nf), hi = Math.min(N1, lo + 1), fr = nf - lo;
      const s = lerp(2 * R * Math.sin(Math.PI / lo), 2 * R * Math.sin(Math.PI / hi), fr);
      const a = lerp(R * Math.cos(Math.PI / lo), R * Math.cos(Math.PI / hi), fr);
      const peak = (H - (mob ? MARGIN - 20 : MARGIN)) * 0.5 + a, axle = peak - (a + (R - a) * circ);
      g.clearRect(0, 0, W, H);
      g.lineJoin = g.lineCap = "round";
      g.strokeStyle = g.fillStyle = col;
      g.beginPath();
      const first = xL + Math.ceil((-xL - s) / s) * s, n = Math.ceil((W + 2 * s) / s) + 2, steps = Math.max(48, Math.round(s));
      for (let k = 0; k < n; k++) {
        const px = first + k * s, left = px - s / 2;
        for (let j = 0; j <= steps; j++) {
          const lx = left + (j / steps) * s, y = peak + a * Math.cosh((lx - px) / a) - a;
          j ? g.lineTo(lx, y * (1 - circ) + peak * circ) : g.moveTo(lx, y * (1 - circ) + peak * circ);
        }
      }
      g.lineWidth = 1.5; g.stroke();
      const v = verts(nf, R), rot = ((t * (xR - xL)) / s) * ((2 * Math.PI) / nf) - Math.PI / nf;
      g.save(); g.translate(lerp(xL, xR, t), axle); g.rotate(rot); g.beginPath();
      if (circ < 0.999) {
        const S = mob ? 90 : 360, per = v.length / S;
        for (let i = 0; i <= S; i++) {
          const vi = i * per, i0 = Math.floor(vi) % v.length, i1 = (i0 + 1) % v.length, f = vi - Math.floor(vi);
          const px = lerp(v[i0][0], v[i1][0], f), py = lerp(v[i0][1], v[i1][1], f), pr = Math.hypot(px, py) || 1, k = lerp(pr, R, circ) / pr;
          i ? g.lineTo(px * k, py * k) : g.moveTo(px * k, py * k);
        }
        g.closePath();
      } else g.arc(0, 0, R, 0, Math.PI * 2);
      g.stroke();
      g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill();
      g.restore();
      g.save(); g.lineWidth = 1; g.setLineDash([5, 10]); g.beginPath(); g.moveTo(0, axle); g.lineTo(W, axle); g.stroke(); g.restore();
    };
    const onScroll = () => requestAnimationFrame(aim);
    src.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", size);
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    size();
    return () => {
      cancelAnimationFrame(raf);
      src.removeEventListener("scroll", onScroll);
      removeEventListener("resize", size);
      ro.disconnect();
      if (made) cv.remove(); else g.clearRect(0, 0, cv.width, cv.height);
    };
  });
})();
