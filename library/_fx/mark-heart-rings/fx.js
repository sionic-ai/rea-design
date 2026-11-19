// Around the brand mark, 16 layers of rings widen its outline outward, and one heartbeat (1.15s cycle — big beat + small beat .3s later)
// Swells outward starting from the inner ring, each ring .085s later. Each ring’s 3x and 5x waves turn at different speeds so the outline stays alive.
(() => {
  const SIZE = 95;
  const gauss = (t, c, w) => Math.exp(-((t - c) * (t - c)) / (2 * w * w));
  const wave = (t) => { const p = ((t % 1.15) + 1.15) % 1.15; return gauss(p, 0.05, 0.13) + 0.5 * gauss(p, 0.3, 0.14); };
  const beat = (t) => { const p = ((t % 1.15) + 1.15) % 1.15; return gauss(p, 0, 0.05) + 0.55 * gauss(p, 0.19, 0.055); };
  // Default symbol: rounded-corner square (superellipse, 4th power)
  const squircle = (n) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const r = 1 / Math.pow(Math.pow(Math.abs(c), 4) + Math.pow(Math.abs(s), 4), 0.25);
    return { x: c * r * SIZE * 0.5, y: s * r * SIZE * 0.5 };
  });
  function outline(path, n) {
    if (!path) return squircle(n);
    const len = path.getTotalLength(), b = path.getBBox(), k = SIZE / Math.max(b.width, b.height || 1);
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    return Array.from({ length: n }, (_, i) => { const p = path.getPointAtLength((i / n) * len); return { x: (p.x - cx) * k, y: (p.y - cy) * k }; });
  }

  kfFx.register("mark-heart-rings", (el, { options, reduce }) => {
    const rings = +options.rings || 16, gap = +(options.gap ?? 22), first = +(options.first ?? 30), lag = +(options.lag ?? 0.085);
    const path = el.querySelector('[data-fx-part="mark"] path, path[data-fx-part="mark"]');
    const pts = outline(path, 96).map((p) => ({ ...p, a: Math.atan2(p.y, p.x), r: Math.hypot(p.x, p.y) || 0.001 }));
    const contours = Array.from({ length: rings }, (_, e) => pts.map((p) => { const d = p.r + first + gap * e; return { x: (p.x / p.r) * d, y: (p.y / p.r) * d, a: p.a, d }; }));
    const markShape = path ? new Path2D(path.getAttribute("d")) : null;
    const bb = path ? path.getBBox() : null;

    const canvas = document.createElement("canvas");
    canvas.className = "fx-mark-heart-rings__cv";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, raf = 0, visible = false, t0 = 0;

    const paint = (t) => {
      const ink = getComputedStyle(el).color, f = reduce ? 0 : 1;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, d = Math.max(40, Math.min(140, 0.24 * Math.min(W, H))), s = d / SIZE;
      ctx.save();
      ctx.strokeStyle = ink; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.lineWidth = 1;
      for (let e = 0; e < rings; e++) {
        const l = f * wave(t - lag * e), amp = 4.5 * (1 + 0.05 * e) * l, ph1 = 0.45 * t + 0.6 * e, ph2 = -0.7 * t + 0.9 * e;
        ctx.globalAlpha = Math.max(0.06, 0.5 - 0.028 * e) * (0.62 + 0.38 * l);
        const c = contours[e], n = c.length;
        const k = (p) => 1 + (amp + 1.6 * f * (Math.sin(3 * p.a + ph1) + 0.6 * Math.sin(5 * p.a + ph2))) / p.d;
        const X = (p) => cx + p.x * k(p) * s, Y = (p) => cy + p.y * k(p) * s;
        ctx.beginPath();
        ctx.moveTo((X(c[n - 1]) + X(c[0])) / 2, (Y(c[n - 1]) + Y(c[0])) / 2);
        for (let i = 0; i < n; i++) { const a = c[i], b = c[(i + 1) % n]; ctx.quadraticCurveTo(X(a), Y(a), (X(a) + X(b)) / 2, (Y(a) + Y(b)) / 2); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const g = 1 + 0.05 * f * beat(t);
      ctx.fillStyle = ink;
      ctx.translate(cx, cy);
      ctx.scale(s * g, s * g);
      if (markShape) {
        const k2 = SIZE / Math.max(bb.width, bb.height || 1);
        ctx.scale(k2, k2);
        ctx.translate(-(bb.x + bb.width / 2), -(bb.y + bb.height / 2));
        ctx.fill(markShape);
      } else {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };
    const tick = (now) => {
      raf = visible && !reduce ? requestAnimationFrame(tick) : 0;
      if (!t0) t0 = now;
      paint((now - t0) / 1000);
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = el.clientWidth; H = el.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(t0 ? (performance.now() - t0) / 1000 : 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible && !raf && !reduce) raf = requestAnimationFrame(tick);
    }, { rootMargin: "240px 0px" });
    io.observe(el);
    const mo = new MutationObserver(() => { if (!raf) resize(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); canvas.remove(); };
  });
})();
