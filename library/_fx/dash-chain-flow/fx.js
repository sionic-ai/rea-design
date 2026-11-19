(() => {
  const REF_W = 1440, REF_H = 842;
  // Our line — twenty-two elliptical arcs bulging to the left like 「(」. They flow from bottom to top, with 45px of arc length between cells
  const chains = (() => {
    const out = [];
    for (let k = 0; k < 22; k++) {
      const cx = -60 + k * 82, cy = 400, rx = 260 + k * 9, ry = 640 + (k % 3) * 40;
      const pts = [];
      let prev = null;
      for (let t = -Math.PI / 2; t <= Math.PI / 2; t += 0.002) {
        const p = [cx - rx * Math.cos(t), cy - ry * Math.sin(t)];
        if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) >= 45) { pts.push(p); prev = p; }
      }
      out.push(pts);
    }
    return out;
  })();
  const strokeAt = (w) => (w <= 375 ? 2.5 : w >= 2560 ? 6.5 : w <= 1440 ? 2.5 + (w - 375) / (1440 - 375) * 1.25 : 3.75 + (w - 1440) / (2560 - 1440) * 2.75);

  kfFx.register("dash-chain-flow", (el, { options, reduce }) => {
    const canvas = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const speed = +(options.speed ?? 0.7), nBlue = +(options.blue ?? 6), life = +(options.life ?? 1.2), fade = +(options.fade ?? 0.2), dashRef = +(options.dash ?? 30);
    let W = 0, H = 0, S = 1, offX = 0, offY = 0, dpr = 1, colors = {};
    const read = () => {
      const cs = getComputedStyle(el);
      colors = { dash: cs.getPropertyValue("--kf-dim").trim() || cs.color, blue: cs.getPropertyValue("--kf-accent").trim() || cs.color };
    };
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.max(1, W * dpr); canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.max(W / REF_W, H / REF_H);
      offX = (W - REF_W * S) / 2; offY = (H - REF_H * S) / 2;
      read();
    };
    let phase = 0, last = 0, blues = [];
    const spawn = (t) => {
      for (let tries = 0; tries < 30; tries++) {
        const ci = (Math.random() * chains.length) | 0, slot = (Math.random() * chains[ci].length) | 0;
        if (!blues.some((b) => b.ci === ci && b.slot === slot)) { blues.push({ ci, slot, birth: t, life: life * (0.7 + Math.random() * 0.6) }); return true; }
      }
      return false;
    };
    const at = (chain, i) => {
      const T = chain.length;
      let dp = (phase + i) % T; if (dp < 0) dp += T;
      const si = dp | 0;
      if (si >= T - 1) return null;
      const f = dp - si, a = chain[si], b = chain[si + 1];
      return [(a[0] + (b[0] - a[0]) * f) * S + offX, (a[1] + (b[1] - a[1]) * f) * S + offY];
    };
    const draw = (now) => {
      const t = now / 1000;
      const dt = last ? Math.min(Math.max(0, t - last), 0.05) : 0;
      last = t;
      phase += speed * dt;
      ctx.clearRect(0, 0, W, H);
      const half = (dashRef * S) / 2;
      ctx.lineWidth = strokeAt(W);
      ctx.lineCap = "butt";
      blues = blues.filter((b) => t - b.birth < b.life);
      while (blues.length < nBlue && spawn(t));
      const lit = new Set(blues.map((b) => b.ci * 1000 + b.slot));
      ctx.strokeStyle = colors.dash;
      ctx.beginPath();
      chains.forEach((chain, ci) => chain.forEach((_, i) => {
        if (lit.has(ci * 1000 + i)) return;
        const p = at(chain, i);
        if (!p || p[0] < -half || p[0] > W + half || p[1] < -half || p[1] > H + half) return;
        ctx.moveTo(p[0], p[1] - half); ctx.lineTo(p[0], p[1] + half);
      }));
      ctx.stroke();
      ctx.strokeStyle = colors.blue;
      ctx.beginPath();
      blues.forEach((b) => { const p = at(chains[b.ci], b.slot); if (p) { ctx.moveTo(p[0], p[1] - half); ctx.lineTo(p[0], p[1] + half); } });
      ctx.stroke();
      // Erases the top and bottom to melt into the background — erasing only looks at opacity, so the color can be anything
      const fh = H * fade;
      if (fh > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        const gt = ctx.createLinearGradient(0, 0, 0, fh); gt.addColorStop(0, colors.dash); gt.addColorStop(1, "transparent");
        ctx.fillStyle = gt; ctx.fillRect(0, 0, W, fh);
        const gb = ctx.createLinearGradient(0, H - fh, 0, H); gb.addColorStop(0, "transparent"); gb.addColorStop(1, colors.dash);
        ctx.fillStyle = gb; ctx.fillRect(0, H - fh, W, fh);
        ctx.restore();
      }
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    if (reduce) { draw(performance.now()); return () => { ro.disconnect(); if (canvas !== el) canvas.remove(); }; }
    let raf = 0, seen = false;
    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    const run = () => { if (!raf && seen && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? run() : stop(); });
    io.observe(canvas);
    const vis = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", vis); if (canvas !== el) canvas.remove(); };
  });
})();
