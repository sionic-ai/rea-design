(() => {
  // White toy shapes (ring, ball, star, square frame, triangle frame, bow) are piled on the panel floor as Matter bodies, and one more drops for every 200px the mouse moves.
  // Size is in cell units of the plate width divided into 110 cells (50 if narrow) — restretched to the cells when the window changes.
  const KINDS = {
    ring: { r: 8 }, dot: { r: 4 }, pea: { r: 3 }, star: { r: 4 },
    frame: { w: 10, h: 10, chamfer: 2 }, tri: { r: 10 }, arc: { w: 5.656, h: 14, chamfer: 2.5 },
  };
  // Original starting positions (cells) — two sets each, placed on the floor line (bottom edge of the board), pushed up by the floor to bounce, then settle. Only the first arc set drops from above
  const START = [["dot", 60], ["pea", 104], ["tri", 40], ["ring", 0], ["frame", 30], ["star", 70], ["arc", 10, 0.2]];
  const STEP = 1000 / 60;

  kfFx.register("cursor-drop-shapes", (el, { options, reduce, hover }) => {
    if (typeof Matter === "undefined") return;
    const { Engine, Bodies, Body, Composite } = Matter;
    const O = {
      gravity: +(options.gravity ?? 0.0005), bounce: +(options.bounce ?? 0.8), air: +(options.air ?? 0.0001), friction: +(options.friction ?? 0.01),
      every: +(options.every ?? 200), offset: +(options.offset ?? 200), max: +(options.max ?? 20) || 20,
      cols: +(options.cols ?? 110) || 110, colsNarrow: +(options["cols-narrow"] ?? 50) || 50, narrow: +(options.narrow ?? 1023),
    };
    const canvas = el.querySelector("canvas[data-fx-part=canvas]") || Object.assign(document.createElement("canvas"), { className: "fx-drop-shapes" });
    const made = !canvas.isConnected;
    if (made) { canvas.setAttribute("aria-hidden", "true"); el.prepend(canvas); }
    const ctx = canvas.getContext("2d");
    const engine = Engine.create();
    engine.gravity.scale = O.gravity;
    let W = 0, H = 0, unit = 1, color = "", walls = [], visible = false, last = 0, alive = true;
    const opts = () => ({ restitution: O.bounce, frictionAir: O.air, friction: O.friction });

    const measure = () => {
      W = canvas.clientWidth || el.clientWidth; H = canvas.clientHeight || innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      unit = W / (innerWidth <= O.narrow ? O.colsNarrow : O.cols);
      color = getComputedStyle(el).getPropertyValue("--fx-shape").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-surface").trim();
    };
    const make = (kind, x, y) => {
      const k = KINDS[kind], u = unit;
      let b;
      if (kind === "tri") {
        const r = k.r * u;
        b = Bodies.fromVertices(x, y, [[{ x: 0, y: -r }, { x: 0.866 * r, y: 0.5 * r }, { x: -0.866 * r, y: 0.5 * r }]], opts());
      } else if (k.r) b = Bodies.circle(x, y, k.r * u, opts());
      else b = Bodies.rectangle(x, y, k.w * u, k.h * u, { ...opts(), chamfer: { radius: k.chamfer * u } });
      b.plugin.kind = kind; b.plugin.unit = u;
      return b;
    };
    const setWalls = () => {
      if (walls.length) Composite.remove(engine.world, walls);
      walls = [
        Bodies.rectangle(W / 2, H + 25, W * 2, 50, { isStatic: true }),
        Bodies.rectangle(-25, H / 2, 50, H * 2, { isStatic: true }),
        Bodies.rectangle(W + 25, H / 2, 50, H * 2, { isStatic: true }),
      ];
      Composite.add(engine.world, walls);
    };
    const shapes = () => Composite.allBodies(engine.world).filter((b) => !b.isStatic);
    const add = (kind, x, y) => {
      Composite.add(engine.world, make(kind, x, y));
      const all = shapes();
      if (all.length > O.max) Composite.remove(engine.world, all[Math.floor(Math.random() * all.length)]);
    };

    measure();
    setWalls();
    for (let n = 0; n < 2; n++) START.forEach(([kind, col, top]) => Composite.add(engine.world, make(kind, col * unit, top && n === 0 ? H * top : H)));

    const tri = (q) => { const p = new Path2D(); p.moveTo(0, -q); p.lineTo(0.866 * q, 0.5 * q); p.lineTo(-0.866 * q, 0.5 * q); p.closePath(); return p; };
    const shape = (b) => {
      const k = b.plugin.kind, u = b.plugin.unit;
      if (k === "ring" || k === "dot" || k === "pea") {
        const r = KINDS[k].r * u, p = new Path2D();
        p.arc(0, 0, r, 0, Math.PI * 2);
        if (k === "ring") { p.moveTo(r * 0.55, 0); p.arc(0, 0, r * 0.55, 0, Math.PI * 2, true); }
        ctx.fill(p, "evenodd");
      } else if (k === "star") {
        const R = KINDS.star.r * u * 0.86, p = new Path2D();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? R * 0.5 : R; p.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
        p.closePath();
        ctx.lineWidth = R * 0.28; ctx.stroke(p); ctx.fill(p);
      } else if (k === "frame") {
        const w = KINDS.frame.w * u, h = w * 0.45, p = new Path2D();
        p.roundRect(-w / 2, -w / 2, w, w, KINDS.frame.chamfer * u); p.rect(h / 2, -h / 2, -h, h);
        ctx.fill(p, "evenodd");
      } else if (k === "tri") {
        const r = KINDS.tri.r * u * 0.86, outer = tri(r), both = tri(r);
        both.addPath(tri(r * 0.42));
        ctx.lineWidth = r * 0.3; ctx.stroke(outer); ctx.fill(both, "evenodd");
      } else if (k === "arc") {
        const w = KINDS.arc.w * u, h = KINDS.arc.h * u, t = w * 0.5, R = h * 0.62, a = Math.asin(Math.min(1, (h / 2 - t / 2) / R)), p = new Path2D();
        p.arc(w / 2 - t / 2 - R, 0, R, -a, a);
        ctx.lineWidth = t; ctx.stroke(p);
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ctx.strokeStyle = color;
      ctx.lineJoin = ctx.lineCap = "round";
      for (const b of shapes()) {
        ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle);
        shape(b);
        ctx.restore();
      }
    };
    const tick = (time, delta) => {
      const dt = Math.min(Math.max(1, delta || STEP), 50), n = Math.max(1, Math.ceil(dt / STEP - 0.05));
      for (let i = 0; i < n; i++) Engine.update(engine, STEP);
      if (visible) draw();
    };

    if (reduce) {
      for (let i = 0; i < 400; i++) Engine.update(engine, STEP);
      draw();
    }

    // For the first 5 seconds the board runs even when not visible so shapes settle on the floor, after that it runs only when visible
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (reduce) return;
      if (visible || performance.now() - last < 5000) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    });
    io.observe(el);
    last = performance.now();
    if (!reduce) gsap.ticker.add(tick);
    const settle = setTimeout(() => !visible && gsap.ticker.remove(tick), 5000);

    const rect = () => canvas.getBoundingClientRect();
    let px = null, py = null;
    const kinds = START.map((s) => s[0]);
    const pick = () => kinds[Math.floor(Math.random() * kinds.length)];
    const ac = new AbortController(), on = { signal: ac.signal, passive: true };
    const move = (e) => {
      const r = rect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (px === null) { px = x; py = y; return; }
      if (Math.hypot(x - px, y - py) >= O.every) { px = x; py = y; add(pick(), x + O.offset, y); }
    };
    const touch = (e) => {
      const t = e.touches[0]; if (!t) return;
      const r = rect(); add(pick(), t.clientX - r.left, t.clientY - r.top);
    };
    if (!reduce) {
      el.addEventListener("mousemove", move, on);
      el.addEventListener("touchstart", touch, on);
    }
    // On window change, rebuild the wall to the cell size and stretch the shapes — drawing knows the stretch scale as b.plugin.unit
    const ro = new ResizeObserver(() => {
      if (!alive) return;
      const before = unit;
      measure();
      setWalls();
      if (before !== unit) for (const b of shapes()) { const s = unit / b.plugin.unit; Body.scale(b, s, s); b.plugin.unit = unit; }
      draw();
    });
    ro.observe(canvas);
    return () => {
      alive = false;
      ac.abort(); io.disconnect(); ro.disconnect(); clearTimeout(settle);
      gsap.ticker.remove(tick);
      Composite.clear(engine.world, false); Engine.clear(engine);
      if (made) canvas.remove(); else ctx.clearRect(0, 0, W, H);
    };
  });
})();
