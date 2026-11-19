// A dot sphere turns slowly in the center of a black panel, scatters into a cloud, the cloud gathers into a donut ring and turns, then returns cloud → sphere (one cycle in 10s).
// The first Work card video of the Studio site (dot sphere ↔ 3D symbol, 60fps 10s loop) redrawn on our canvas — a donut ring instead of the original symbol
(() => {
  // For each position in one cycle (0~1), which shape it takes — sphere 15% · scatter 5% · to ring 6% · ring 18% · scatter 6% · to sphere 6% · sphere 44%
  const PLAN = [[0, "s"], [0.15, "s"], [0.2, "c"], [0.26, "t"], [0.44, "t"], [0.5, "c"], [0.56, "s"], [1, "s"]];
  const smooth = (x) => x * x * (3 - 2 * x);
  const rnd = (i, k) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };

  kfFx.register("dot-sphere-morph", (el, { options, reduce }) => {
    const n = Math.max(200, +(options.points || 2600));
    const period = Math.max(1, +(options.period || 10)) * 1000;
    const spin = +(options.spin ?? 24) * (Math.PI / 180);
    const size = +(options.size ?? 0.32);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.append(canvas);
    const g = canvas.getContext("2d");
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = golden * i;
      const s = [Math.cos(a) * r, y, Math.sin(a) * r];
      const u = rnd(i, 1) * Math.PI * 2, v = rnd(i, 2) * Math.PI * 2, R = 0.72, q = 0.26;
      const t = [(R + q * Math.cos(v)) * Math.cos(u), q * Math.sin(v) * 1.1, (R + q * Math.cos(v)) * Math.sin(u)];
      const c = [(rnd(i, 3) - 0.5) * 1.5, (rnd(i, 4) - 0.5) * 1.1, (rnd(i, 5) - 0.5) * 1.5];
      pts.push({ s, t, c, j: rnd(i, 6) });
    }
    let w = 0, h = 0, dpr = 1, ink = "", raf = 0, start = 0, shown = false;
    const measure = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      ink = getComputedStyle(el).getPropertyValue("--fx-dot").trim() || getComputedStyle(el).color;
    };
    const mixAt = (p) => {
      for (let k = 0; k < PLAN.length - 1; k++) {
        const [a, from] = PLAN[k], [b, to] = PLAN[k + 1];
        if (p >= a && p <= b) return { from, to, m: b > a ? smooth((p - a) / (b - a)) : 1 };
      }
      return { from: "s", to: "s", m: 1 };
    };
    const draw = (now) => {
      const p = reduce ? 0 : ((now - start) % period) / period;
      const { from, to, m } = mixAt(p);
      const ang = reduce ? 0.6 : ((now - start) / 1000) * spin, ca = Math.cos(ang), sa = Math.sin(ang), tilt = 0.32, ct = Math.cos(tilt), st = Math.sin(tilt);
      const R = Math.min(w, h) * size * dpr, cx = (w * dpr) / 2, cy = (h * dpr) / 2, dot = Math.max(1, 1.1 * dpr);
      const grain = (from === "c" || to === "c") ? 0.02 : 0;
      g.clearRect(0, 0, canvas.width, canvas.height);
      g.fillStyle = ink;
      for (let i = 0; i < n; i++) {
        const P = pts[i], A = P[from], B = P[to];
        let x = A[0] + (B[0] - A[0]) * m, y = A[1] + (B[1] - A[1]) * m, z = A[2] + (B[2] - A[2]) * m;
        if (grain) { x += (Math.random() - 0.5) * grain; y += (Math.random() - 0.5) * grain; }
        const x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
        const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
        const k = 2.6 / (2.6 + z2);
        g.globalAlpha = 0.28 + 0.62 * ((1 - z2) / 2) * (0.7 + 0.3 * P.j);
        g.fillRect(cx + x1 * R * k, cy + y2 * R * k, dot, dot);
      }
      g.globalAlpha = 1;
    };
    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    const ro = new ResizeObserver(() => { measure(); if (reduce || !shown) draw(performance.now()); });
    ro.observe(el);
    measure();
    start = performance.now();
    draw(start);
    // Pauses when off-screen — the original video also plays only when visible
    const io = new IntersectionObserver(([e]) => {
      shown = !!e?.isIntersecting;
      cancelAnimationFrame(raf);
      if (shown && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); canvas.remove(); };
  });
})();
