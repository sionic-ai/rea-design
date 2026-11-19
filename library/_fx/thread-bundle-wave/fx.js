(() => {
  // Color thread bundle — each strand waves with two layers of cosine, each with its own amplitude, frequency, speed and phase, and sorting front to back by depth (sum of sines) makes them look twisted.
  // Bundle width breathes 1.0~2.2× with sin(t·.005), and the whole bundle tilts 12° as it crosses the screen
  const COLORS = [["--fx-thread-1", [10, 8, 8]], ["--fx-thread-2", [6, 4]], ["--fx-thread-3", [6, 6, 4, 4, 2]], ["--fx-thread-4", [12, 10, 8, 6]]];

  kfFx.register("thread-bundle-wave", (el, { options: o, reduce }) => {
    const num = (k, d) => +(o[k] ?? d);
    const cfg = {
      count: +o.count || 120, step: +o.step || 12, width: num("width", 2.6), tilt: num("tilt", 12),
      y: num("y", 0.5), band: num("band", 0), speed: num("speed", 1), breathe: num("breathe", 0.005),
      seed: num("seed", 42), mix: num("mix-seed", 88),
    };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-thread-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => canvas.remove();
    const slope = -Math.tan((cfg.tilt * Math.PI) / 180);
    let seed = 0, w = 0, h = 0, lines = [], time = 0, raf = 0, running = false, seen = false;
    const rnd = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };

    // Color chunks (color, ratio) are shuffled up and down, and each strand draws one chunk by ratio — the same seed always gives the same bundle
    // Even if the thread color variable is an expression like oklch(from …), paint it onto an element so the canvas reads the computed color
    const colorOf = (v) => {
      const s = document.createElement("span");
      s.style.color = `var(${v})`;
      el.append(s);
      const c = getComputedStyle(s).color;
      s.remove();
      return c;
    };
    const build = () => {
      seed = cfg.mix;
      const chunks = [];
      COLORS.forEach(([v, ratios]) => { const color = colorOf(v); ratios.forEach((r) => chunks.push({ color, ratio: r, y: 0 })); });
      const offs = [];
      let y = 0;
      chunks.forEach(() => { offs.push(y); y += 1 + (rnd() < 0.35 ? rnd() * 7 + 0.5 : 0); });
      const mid = (y - 1) / 2;
      offs.forEach((_, i) => (offs[i] -= mid));
      offs.sort(() => rnd() - 0.64);
      chunks.forEach((c, i) => (c.y = offs[i]));
      const total = chunks.reduce((s, c) => s + c.ratio, 0);
      const pick = () => { let v = rnd() * total; for (const c of chunks) { if (v < c.ratio) return c; v -= c.ratio; } return chunks[0]; };
      seed = cfg.seed;
      lines = Array.from({ length: cfg.count }, () => {
        const c = pick();
        return { yo: c.y + (rnd() - 0.5) * 1.2, color: c.color, amp: rnd() ** 3 * 35 + 10, freq: rnd() * 0.0074 + 0.001, speed: rnd() * 0.001 + 0.006, phase: rnd() * Math.PI * 5 };
      }).sort((a, b) => a.yo - b.yo);
    };
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const startY = h * cfg.y + cfg.band * rem;
      const spread = Math.max(0.1, 1 + 1.2 * ((Math.sin(time * cfg.breathe) + 1) / 2));
      const list = lines.map((l) => {
        const pts = [];
        let depth = 0;
        for (let x = 0; x <= w + cfg.step; x += cfg.step) {
          const a1 = x * l.freq + time * l.speed + l.phase;
          const a2 = x * l.freq * 1.5 - time * l.speed * 0.5;
          pts.push(x, startY + l.yo * spread + x * slope + (Math.cos(a1) * l.amp + Math.cos(a2) * l.amp * 0.3) * spread);
          depth -= Math.sin(a1) * l.amp + Math.sin(a2) * l.amp * 0.3;
        }
        return { pts, depth, color: l.color };
      }).sort((a, b) => a.depth - b.depth);
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = cfg.width;
      for (const { pts, color } of list) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.stroke();
      }
    };
    const loop = () => { if (!running) return; draw(); time -= cfg.speed; raf = requestAnimationFrame(loop); };
    const start = () => { if (running || reduce) { draw(); return; } running = true; loop(); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    build();
    size();
    draw();
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(el);
    // Runs only while on screen
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? start() : stop(); });
    io.observe(el);
    // When the skin changes, re-read the thread color
    const mo = new MutationObserver(() => { build(); draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    return () => { stop(); ro.disconnect(); io.disconnect(); mo.disconnect(); canvas.remove(); };
  });
})();
