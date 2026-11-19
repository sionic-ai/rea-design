// In the outer margin beside the content column, lay 2px dots at 14px intervals, but only where value noise is high, forming a cloudy clustered dot pattern.
// 10% of dots switch green on and off every 2.2~6s, and the cursor trail (.6s tail, 42px radius) and ripples spreading from a press light dots green.
// The canvas must cover the full window width to reach the margins, so it extends left by the element’s left edge
(() => {
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (css, host) => {
    const sw = document.createElement("i");
    sw.style.cssText = `position:absolute;visibility:hidden;color:${css}`;
    host.append(sw);
    const c = getComputedStyle(sw).color;
    sw.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const hash = (x, y) => {
    let h = Math.imul(x, 0x5bd1e995) + Math.imul(y, 0x1b873593);
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
    h = Math.imul(h ^ (h >>> 13), 0x297a2d39);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const smooth = (v) => v * v * (3 - 2 * v);
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    const top = a + (b - a) * fx;
    return top + (c + (d - c) * fx - top) * fy;
  };
  const ACTIVE = "a, button, input, select, textarea, label, [role=button], [role=link]";

  kfFx.register("margin-dot-field", (el, { options, reduce, hover }) => {
    const pitch = +options.pitch || 14;
    const margin = options.look !== "full";
    const scale = +options.scale || (margin ? 70 : 110);
    const thr = +(options.threshold ?? (margin ? 0.62 : 0.54));
    const base = +(options.alpha ?? 0.12);
    const feather = +(options.feather ?? 0.2);
    const reach = +options.radius || 42, trailMs = +(options.trail ?? 600);
    const wave = +(options.wave ?? 1.4), pulse = +(options.pulse ?? 160);
    const greenShare = +(options.green ?? 0.1);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-mdf__canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = devicePixelRatio || 1;

    let ink = [0, 0, 0], g0 = [0, 0, 0], g1 = [0, 0, 0];
    const paint = () => {
      ink = rgbOf("var(--kf-ink)", el);
      g0 = rgbOf("var(--kf-accent-text, var(--kf-accent))", el);
      g1 = rgbOf("oklch(from var(--kf-accent) calc(l - .163) calc(c - .018) calc(h - 33.6))", el);
    };
    paint();

    let W = 0, H = 0, colL = 0, colR = 0, dots = [], trail = [], lastPush = 0, raf = 0, on = false;
    const layout = () => {
      const r = el.getBoundingClientRect();
      W = document.documentElement.clientWidth; H = el.clientHeight;
      if (W <= 0 || H <= 0) return;
      canvas.style.left = `${-r.left}px`;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      colL = r.left; colR = r.right;
      const now = performance.now();
      dots = [];
      for (let x = pitch / 2; x < W; x += pitch)
        for (let y = pitch / 2; y < H; y += pitch) {
          if (margin && x >= colL && x <= colR) continue;
          const nx = (margin ? Math.min(x, W - x) : x) / scale, ny = y / scale;
          if (0.65 * noise(nx, ny) + 0.35 * noise(2.3 * nx + 11.7, 2.3 * ny + 5.1) < thr) continue;
          dots.push({ x, y, green: Math.random() < greenShare, flip: now + 6000 * Math.random(), waves: [] });
        }
      draw(now);
    };
    const edgeY = (y) => { const f = Math.min(feather * innerHeight, H / 2); return f <= 0 ? 1 : clamp(Math.min(y / f, (H - y) / f)); };
    const edgeX = (x) => (margin ? smooth(clamp(Math.min(x < (colL + colR) / 2 ? x : W - x, x < colL ? colL - x : x - colR) / 72)) : (() => { const f = Math.min(feather * innerWidth, W / 2); return f <= 0 ? 1 : clamp(Math.min(x / f, (W - x) / f)); })());
    const draw = (now) => {
      ctx.clearRect(0, 0, W, H);
      trail = trail.filter((p) => now - p.t <= trailMs);
      for (const d of dots) {
        const fade = edgeY(d.y) * edgeX(d.x);
        if (fade <= 0) continue;
        let glow = 0;
        for (const p of trail) { const dist = Math.hypot(d.x - p.x, d.y - p.y); if (dist < reach) glow = Math.max(glow, smooth(1 - dist / reach)); }
        const hit = d.waves.some((w) => now >= w.a && now <= w.b);
        const m = Math.max(d.green ? 1 : 0, hit ? 1 : 0, glow);
        const u = clamp(W ? d.x / W : 0);
        const gr = g0.map((v, k) => v + (g1[k] - v) * u);
        ctx.fillStyle = `rgb(${ink.map((v, k) => v + (gr[k] - v) * m)})`;
        ctx.globalAlpha = (base + (0.85 - base) * m) * fade;
        ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
    };
    const loop = (now) => {
      for (const d of dots) {
        if (d.waves.length) d.waves = d.waves.filter((w) => w.b >= now);
        if (now >= d.flip) { d.green = Math.random() < greenShare; d.flip = now + 2200 + 3800 * Math.random(); }
      }
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const local = (e) => ({ x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top });
    const move = (e) => {
      if (!on) return;
      const now = performance.now(), { x, y } = local(e);
      if (x < -reach || x > W + reach || y < -reach || y > H + reach) return;
      if (now - lastPush >= 16 || !trail.length) { trail.push({ x, y, t: now }); if (trail.length > 60) trail.shift(); lastPush = now; }
      else trail[trail.length - 1] = { x, y, t: now };
    };
    const press = (e) => {
      if (!on || (e.target instanceof Element && e.target.closest(ACTIVE))) return;
      const now = performance.now(), { x, y } = local(e);
      if (x < 0 || x > W || y < 0 || y > H) return;
      if (margin && x >= colL && x <= colR) return;
      for (const d of dots) { const a = now + wave * Math.hypot(d.x - x, d.y - y); d.waves.push({ a, b: a + pulse }); if (d.waves.length > 8) d.waves.shift(); }
    };
    const ac = new AbortController();
    if (!reduce) {
      if (hover) addEventListener("pointermove", move, { passive: true, signal: ac.signal });
      addEventListener("pointerdown", press, { passive: true, signal: ac.signal });
    }
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    addEventListener("resize", layout, { signal: ac.signal });
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !reduce && !raf) raf = requestAnimationFrame(loop);
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "20% 0px" });
    io.observe(el);
    const mo = new MutationObserver(() => { paint(); draw(performance.now()); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    layout();
    return () => { ac.abort(); ro.disconnect(); io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); canvas.remove(); };
  });
})();
