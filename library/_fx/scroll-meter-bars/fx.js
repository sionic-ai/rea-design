(() => {
  // Original brand-meter: on a 24px-high canvas, stand 2px bars at 6px intervals. Bar height = Lumpy peaks (three segments set by seed, √sin type)
  // × (.45 + .55·|sin(seed·20 + time·slow speed)|) × (.8 + .2·scroll speed). Scroll speed follows by .08 per frame (40px/frame is 1),
  // Only visible meters are redrawn at 30fps. Each meter’s seed differs by 13.7 so the shapes differ.
  const meters = new Set();
  let speed = 0, lastY = 0, shown = 0, running = false, seeds = 0;
  const hash = (x) => {
    const s = Math.sin(x * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const shape = (seed) => {
    const gaps = [hash(seed) * 0.04 + 0.02, hash(seed + 1) * 0.06 + 0.05, hash(seed + 2) * 0.06 + 0.05];
    const lens = [hash(seed + 3) + 0.6, hash(seed + 4) * 0.6 + 0.3, hash(seed + 5) + 0.6];
    const k = (0.96 - gaps.reduce((a, b) => a + b, 0)) / lens.reduce((a, b) => a + b, 0);
    let at = 0;
    return lens.map((len, i) => {
      at += gaps[i];
      const from = at;
      at += len * k;
      return [from, at];
    });
  };
  const hill = (parts, x) => {
    for (const [a, b] of parts) if (x >= a && x <= b) return Math.sqrt(Math.sin((Math.PI * (x - a)) / (b - a)));
    return 0;
  };
  const tick = (t) => {
    if (!meters.size || document.hidden) {
      running = false;
      return;
    }
    requestAnimationFrame(tick);
    const y = scrollY;
    speed += (Math.min(Math.abs(y - lastY) / 40, 1) - speed) * 0.08;
    lastY = y;
    if (t - shown < 1000 / 30) return;
    shown = t;
    for (const m of meters) if (m.visible) m.draw(t, speed);
  };
  const start = () => {
    if (running || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    running = true;
    lastY = scrollY;
    requestAnimationFrame(tick);
  };
  document.addEventListener("visibilitychange", start);

  kfFx.register("scroll-meter-bars", (el, { options }) => {
    let canvas = el.querySelector("canvas");
    const own = !canvas;
    if (own) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      el.append(canvas);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const high = +(options.height || 24), pitch = +(options.pitch || 6), bar = +(options.bar || 2);
    const seed = options.seed != null ? +options.seed : (seeds += 13.7);
    const parts = shape(seed);
    let width = 0;
    const m = {
      visible: false,
      draw(t, s) {
        ctx.clearRect(0, 0, width, high);
        ctx.fillStyle = getComputedStyle(el).color;
        const n = Math.floor(width / pitch);
        for (let i = 0; i < n; i++) {
          const slow = 0.002 + hash(i + seed + 9) * 0.003;
          const swing = Math.abs(Math.sin(hash(i + seed) * 20 + t * slow));
          const h = hill(parts, (i + 0.5) / n) * (0.45 + 0.55 * swing) * (0.8 + 0.2 * s);
          const c = Math.max(2, Math.round((h * high) / 2) * 2);
          ctx.fillRect(i * pitch + 1, (high - c) / 2, bar, c);
        }
      },
    };
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(devicePixelRatio || 1, 3);
      width = Math.round(el.clientWidth);
      canvas.width = width * dpr;
      canvas.height = high * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      m.draw(0, 0);
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { m.visible = e?.isIntersecting ?? false; });
    io.observe(el);
    meters.add(m);
    start();
    return () => {
      ro.disconnect();
      io.disconnect();
      meters.delete(m);
      if (own) canvas.remove();
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
})();
