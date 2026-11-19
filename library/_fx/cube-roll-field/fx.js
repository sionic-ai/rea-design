// Several colored cells rest on the cell floor, then roll one cell at a time — only into empty cells so they never overlap
(() => {
  // Reads the same value as CSS cubic-bezier every frame
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const e = ((ax * t + bx) * t + cx) * t - x, d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; }
      return ((ay * t + by) * t + cy) * t;
    };
  };
  const DIRS = [[1, 0], [-1, 0], [0, -1], [0, 1]];

  kfFx.register("cube-roll-field", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.className = "fx-crf-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const g = canvas.getContext("2d");
    if (!g) { canvas.remove(); return; }

    const count = +options.count || 100;
    const cellWide = +options.cell || 16, cellNarrow = +options["cell-narrow"] || 8;
    const rollFrames = +options.roll || 10, waitMin = +(options["wait-min"] ?? 10), waitMax = +(options["wait-max"] ?? 100);
    const chance = +(options.chance ?? 0.1);
    const ease = bezier(...String(options.ease || "0,0,1,.4").split(",").map(Number));
    let cell = cellWide, cols = 1, rows = 1, cubes = [], occ = new Map(), colors = [], raf = 0, last = 0, visible = true;
    const key = (x, y) => x + "," + y;

    const readColors = () => { const cs = getComputedStyle(el); colors = [1, 2, 3, 4].map((i) => cs.getPropertyValue(`--fx-c${i}`).trim()).filter(Boolean); if (!colors.length) colors = [cs.color]; };
    const avoidCells = () => {
      const set = new Set(), r0 = el.getBoundingClientRect();
      el.querySelectorAll('[data-fx-part="avoid"]').forEach((a) => {
        const r = a.getBoundingClientRect();
        for (let x = Math.floor((r.left - r0.left) / cell); x <= Math.floor((r.right - r0.left) / cell); x++)
          for (let y = Math.floor((r.top - r0.top) / cell); y <= Math.floor((r.bottom - r0.top) / cell); y++) set.add(key(x, y));
      });
      return set;
    };
    const seed = () => {
      const w = el.clientWidth, h = el.clientHeight, ratio = Math.min(2, devicePixelRatio || 1);
      cell = w < 768 ? cellNarrow : cellWide;
      cols = Math.max(1, Math.floor(w / cell)); rows = Math.max(1, Math.floor(h / cell));
      canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
      g.setTransform(ratio, 0, 0, ratio, 0, 0);
      readColors();
      occ.clear(); cubes = [];
      const avoid = avoidCells(), n = Math.min(count, Math.floor(cols * rows * 0.5));
      for (let i = 0; i < n; i++) {
        let x, y, tries = 0;
        do { x = Math.floor(Math.random() * cols); y = Math.floor(Math.random() * rows); } while (++tries < 60 && (occ.has(key(x, y)) || avoid.has(key(x, y))));
        occ.set(key(x, y), i);
        cubes.push({ x, y, dx: 0, dy: 0, t: 0, rolling: false, wait: waitMin + Math.floor(Math.random() * (waitMax - waitMin)), color: colors[i % colors.length] });
      }
    };
    const draw = () => {
      g.clearRect(0, 0, el.clientWidth, el.clientHeight);
      for (const c of cubes) {
        const e = c.rolling ? ease(c.t / rollFrames) : 0;
        g.fillStyle = c.color;
        g.fillRect((c.x + c.dx * e) * cell, (c.y + c.dy * e) * cell, cell, cell);
      }
    };
    const step = () => {
      for (const c of cubes) {
        if (!c.rolling) {
          if (--c.wait < 0 && Math.random() < chance) {
            c.wait = waitMin + Math.floor(Math.random() * (waitMax - waitMin));
            const [dx, dy] = DIRS[Math.floor(Math.random() * 4)], nx = c.x + dx, ny = c.y + dy;
            if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !occ.has(key(nx, ny))) { occ.set(key(nx, ny), c); c.dx = dx; c.dy = dy; c.t = 0; c.rolling = true; }
          }
        } else if (++c.t >= rollFrames) { occ.delete(key(c.x, c.y)); c.x += c.dx; c.y += c.dy; c.rolling = false; c.dx = c.dy = 0; }
      }
    };
    // Steps at 60fps like the original — same speed even on 120Hz screens
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / 60 - 2) return;
      last = now;
      step();
      draw();
    };
    const ro = new ResizeObserver(() => { seed(); draw(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    seed();
    draw();
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); canvas.remove(); };
  });
})();
