// Lays a triangle grid behind the button, and briefly lights in lines only the triangles that a ripple spreading from one point passes — on hover from that spot, while idle from the left every few seconds
(() => {
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  // A uniformly round wave front looks mechanical, so mix in 18% low-frequency noise like the original
  const noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };

  kfFx.register("tri-glint-sweep", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const cv = document.createElement("canvas");
    cv.className = "fx-tri-glint-sweep__cv";
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const ctx = cv.getContext("2d");
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    const side = +(options.side ?? Math.min(30, Math.max(9, fs * 0.25)));
    const tall = side * 0.8660254;
    const dur = +(options.dur ?? 1.6);
    const idle = +(options.idle ?? 2.4);
    const [lo, hi] = (options.every || "4 9").split(/[\s,~]+/).map(Number);
    let w = 0, h = 0, tris = [], raf = 0, t0 = 0, len = 1, seen = false, timer = 0, rgb = "250, 250, 250";

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const build = (o) => {
      const far = Math.max(Math.hypot(o.x, o.y), Math.hypot(w - o.x, o.y), Math.hypot(o.x, h - o.y), Math.hypot(w - o.x, h - o.y)) || 1;
      tris = [];
      const add = (p) => {
        const cx = (p[0] + p[2] + p[4]) / 3, cy = (p[1] + p[3] + p[5]) / 3;
        tris.push({ p, n: (Math.hypot(cx - o.x, cy - o.y) / far) * 0.82 + noise(cx * 0.013, cy * 0.017) * 0.18 });
      };
      const rows = Math.ceil(h / tall) + 1, cols = Math.ceil(w / side) + 2;
      for (let r = 0; r < rows; r++) {
        const top = r * tall, bot = top + tall, sh = r % 2 ? side / 2 : 0;
        for (let c = -1; c < cols; c++) {
          const x = c * side - sh;
          add([x, bot, x + side, bot, x + side / 2, top]);
          add([x + side / 2, top, x + side * 1.5, top, x + side, bot]);
        }
      }
    };
    const draw = (q) => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const t of tris) {
        if (q < t.n || q >= t.n + 0.3) continue;
        const a = (1 - smooth(t.n, t.n + 0.3, q)) * 0.35 + (1 - smooth(t.n, t.n + 0.06, q)) * 0.55;
        if (a < 0.01) continue;
        const p = t.p;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.closePath();
        ctx.strokeStyle = `rgba(${rgb}, ${a.toFixed(3)})`;
        ctx.stroke();
      }
    };
    const frame = (now) => {
      const q = Math.min(1.3, ((now - t0) / 1000 / len) * 1.3);
      draw(q);
      raf = q < 1.3 ? requestAnimationFrame(frame) : 0;
      if (!raf) ctx.clearRect(0, 0, w, h);
    };
    const sweep = (o, d) => {
      size();
      if (!w || !h) return;
      rgb = (getComputedStyle(el).color.match(/[\d.]+/g) || ["250", "250", "250"]).slice(0, 3).join(", ");
      build(o);
      len = Math.max(0.05, d);
      t0 = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };

    const enter = (e) => {
      if (!hover) return;
      const r = cv.getBoundingClientRect();
      sweep({ x: e.clientX - r.left, y: e.clientY - r.top }, dur);
    };
    el.addEventListener("pointerenter", enter);

    // Idle sparkle runs only when it is fully on screen and no pointer is present — checks every 1 second, and when on, runs its length then rests 4~9 seconds
    const tick = () => {
      if (seen && !el.matches(":hover") && document.visibilityState === "visible") {
        sweep({ x: 0, y: h / 2 || cv.clientHeight / 2 }, idle);
        timer = setTimeout(tick, (idle + lo + Math.random() * (hi - lo)) * 1000);
        return;
      }
      timer = setTimeout(tick, 1000);
    };
    const io = new IntersectionObserver(([en]) => { seen = en.intersectionRatio >= 0.75; }, { threshold: [0, 0.75, 1] });
    io.observe(el);
    if (idle > 0) timer = setTimeout(tick, 1000);
    const ro = new ResizeObserver(size);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer); io.disconnect(); ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      cv.remove();
    };
  });
})();
