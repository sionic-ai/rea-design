// A brand symbol flies over the plate along a Lissajous curve (horizontal .55 · vertical .83 rad/s) leaving 10 outlines along its path — the further back, the smaller and fainter.
// When the cursor enters the panel it drops the curve and chases the cursor (catch-up 9/s), and on leaving returns to the curve (4/s). The head always faces the flying direction.
(() => {
  const gauss = (t, c, w) => Math.exp(-((t - c) * (t - c)) / (2 * w * w));
  const beat = (t) => { const p = ((t % 1.15) + 1.15) % 1.15; return gauss(p, 0, 0.05) + 0.55 * gauss(p, 0.19, 0.055); };
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const squircle = () => {
    const p = new Path2D();
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), r = 9 / Math.pow(Math.pow(Math.abs(c), 4) + Math.pow(Math.abs(s), 4), 0.25);
      i ? p.lineTo(c * r, s * r) : p.moveTo(c * r, s * r);
    }
    p.closePath();
    return { shape: p, cx: 0, cy: 0, size: 18 };
  };

  kfFx.register("mark-trail-flight", (el, { options, reduce, hover }) => {
    const ghosts = Math.round(+options.ghosts || 10), gap = +(options.gap ?? 0.55);
    const baseVar = options.base || "--kf-bg";
    const src = el.querySelector('[data-fx-part="mark"] path, path[data-fx-part="mark"]');
    let mark = squircle();
    if (src) { const b = src.getBBox(); mark = { shape: new Path2D(src.getAttribute("d")), cx: b.x + b.width / 2, cy: b.y + b.height / 2, size: Math.max(b.width, b.height) || 1 }; }

    const canvas = document.createElement("canvas");
    canvas.className = "fx-mark-trail-flight__cv";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    let W = 1, H = 1, ready = false, fg = "", bg = "";
    const colors = () => {
      fg = getComputedStyle(el).color;
      const p = document.createElement("span");
      p.style.cssText = `position:absolute;color:var(${baseVar})`;
      el.append(p); bg = getComputedStyle(p).color; p.remove();
    };
    colors();
    const s = { head: { x: 0, y: 0, rot: 0 }, target: { x: 0, y: 0 }, ptr: { x: 0, y: 0, inside: false }, path: [], arc: 0, size: 30 };
    const at = (back) => {
      const r = s.arc - back, p = s.path;
      let n = p.length - 1;
      while (n > 0 && p[n - 1].arc > r) n--;
      if (n === 0) return null;
      const a = p[n - 1], b = p[n], t = clamp((r - a.arc) / (b.arc - a.arc || 1), 0, 1);
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rot: Math.atan2(b.y - a.y, b.x - a.x) };
    };
    const step = (t, dt) => {
      const { head, target, ptr, path } = s;
      s.size = clamp(0.2 * H, 16, +options.max || 120);
      if (ptr.inside) { target.x = ptr.x; target.y = ptr.y; }
      else { target.x = W * (0.5 + 0.42 * Math.sin(0.55 * t + 0.6)); target.y = H * (0.5 + 0.36 * Math.sin(0.83 * t + 1.9)); }
      const u = 1 - Math.exp(-dt * (ptr.inside ? 9 : 4)), ox = head.x, oy = head.y;
      head.x += (target.x - head.x) * u; head.y += (target.y - head.y) * u;
      const dx = head.x - ox, dy = head.y - oy, m = Math.hypot(dx, dy);
      if (m > 0.15) {
        let d = Math.atan2(dy, dx) - head.rot;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        head.rot += d * (1 - Math.exp(-9 * dt));
      }
      if (m > 0.05) {
        s.arc += m;
        path.push({ x: head.x, y: head.y, arc: s.arc });
        const keep = s.arc - gap * s.size * ghosts - s.size;
        while (path.length > 2 && path[1].arc < keep) path.shift();
      }
    };
    const drawMark = (x, y, rot, alpha, fill, size, color, line) => {
      if (alpha <= 0.001) return;
      const k = size / mark.size;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.translate(-mark.cx, -mark.cy);
      if (fill) { ctx.fillStyle = color; ctx.fill(mark.shape); }
      else { ctx.strokeStyle = color; ctx.lineJoin = "round"; ctx.lineWidth = line / k; ctx.stroke(mark.shape); }
      ctx.restore();
    };
    const paint = (t) => {
      ctx.clearRect(0, 0, W, H);
      const { head, size } = s, f = gap * size;
      for (let e = ghosts; e >= 1; e--) {
        const back = e * f, p = at(back);
        if (!p) continue;
        const o = 1 - e / (ghosts + 1), vis = clamp((s.arc - back) / f, 0, 1), a = (0.1 + 0.6 * o) * vis, sz = lerp(0.5 * size, 0.92 * size, o), rot = e === 1 ? head.rot : p.rot;
        drawMark(p.x, p.y, rot, 0.9 * a, false, sz, bg, 3.2);
        drawMark(p.x, p.y, rot, a, false, sz, fg, 1.2);
      }
      const big = size * (1 + 0.035 * (reduce ? 0 : beat(t)));
      drawMark(head.x, head.y, head.rot, 1, false, big, bg, 3);
      drawMark(head.x, head.y, head.rot, 1, true, big, fg, 0);
    };
    let raf = 0, visible = false, t0 = 0, last = 0;
    const tick = (now) => {
      raf = visible ? requestAnimationFrame(tick) : 0;
      if (!t0) t0 = now;
      if (!last) last = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      step((now - t0) / 1000, dt);
      paint((now - t0) / 1000);
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = el.clientWidth || 1; H = el.clientHeight || 1;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!ready) {
        ready = true;
        s.head.x = s.target.x = 0.3 * W; s.head.y = s.target.y = 0.5 * H;
        s.path.push({ x: s.head.x, y: s.head.y, arc: 0 });
        if (reduce) for (let i = 0; i < 240; i++) step(i / 60, 1 / 60);
      }
      paint(0);
    };
    const onMove = (e) => { const r = el.getBoundingClientRect(); s.ptr.x = e.clientX - r.left; s.ptr.y = e.clientY - r.top; s.ptr.inside = true; };
    const onOut = () => { s.ptr.inside = false; };
    if (hover && !reduce) { el.addEventListener("pointermove", onMove); el.addEventListener("pointerleave", onOut); }
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible && !reduce && !raf) { last = 0; raf = requestAnimationFrame(tick); }
    }, { rootMargin: "240px 0px" });
    io.observe(el);
    const mo = new MutationObserver(() => { colors(); if (!raf) paint(0); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onOut);
      canvas.remove();
    };
  });
})();
