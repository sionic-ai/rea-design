// Falling and piling: when the board is 25% visible, the children (item) fall in turn from above the board, then roll and pile up on the floor and shelf (matter-js).
// Can be grabbed and thrown with the mouse, and does not hijack wheel or touch scroll — the tape roll in a Brand footer
(() => {
  kfFx.register("drop-pile-physics", (el, { options, reduce, hover }) => {
    const M = window.Matter;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!M || !items.length) return;
    const shelves = [...el.querySelectorAll('[data-fx-part="shelf"]')];
    const gravity = +(options.gravity ?? 1.1), bounce = +(options.bounce ?? 0.35), gap = +(options.gap ?? 1.2);
    const engine = M.Engine.create({ gravity: { y: gravity } });
    let walls = [], bodies = [], started = false, raf = 0, mc = null, W = 0, H = 0;
    const box = () => el.getBoundingClientRect();
    const place = () => {
      const b = box();
      W = b.width; H = b.height;
      M.Composite.remove(engine.world, walls);
      walls = [
        M.Bodies.rectangle(W / 2, H + 50, W * 3, 100, { isStatic: true }),
        M.Bodies.rectangle(-50, H / 2, 100, H * 4, { isStatic: true }),
        M.Bodies.rectangle(W + 50, H / 2, 100, H * 4, { isStatic: true }),
        ...shelves.map((s) => { const r = s.getBoundingClientRect(); return M.Bodies.rectangle(r.left - b.left + r.width / 2, r.top - b.top + r.height / 2, r.width, Math.max(4, r.height), { isStatic: true, chamfer: { radius: 4 } }); }),
      ];
      M.Composite.add(engine.world, walls);
    };
    items.forEach((it) => { it.style.position = "absolute"; it.style.left = "0"; it.style.top = "0"; it.style.visibility = "hidden"; });
    const paint = () => bodies.forEach((b) => {
      const it = b.plugin.el;
      it.style.transform = `translate(${b.position.x - b.plugin.w / 2}px, ${b.position.y - b.plugin.h / 2}px) rotate(${b.angle}rad)`;
    });
    const drop = () => {
      if (started) return;
      started = true;
      place();
      bodies = items.map((it, i) => {
        const w = it.offsetWidth, h = it.offsetHeight, round = it.dataset.shape === "circle" || options.shape === "circle";
        const x = W * (0.12 + 0.76 * ((i * 0.37) % 1)), y = -h * (1 + i * gap * 0.5);
        const b = round
          ? M.Bodies.circle(x, y, w / 2, { restitution: bounce, friction: 0.25, frictionAir: 0.012, angle: (i * 1.7) % 6.28 })
          : M.Bodies.rectangle(x, y, w, h, { restitution: bounce, friction: 0.3, frictionAir: 0.012, angle: (i * 0.6) % 1, chamfer: { radius: Math.min(w, h) * 0.2 } });
        b.plugin.el = it; b.plugin.w = w; b.plugin.h = h;
        it.style.visibility = "visible";
        return b;
      });
      M.Composite.add(engine.world, bodies);
      if (reduce) {
        // Reduced-motion screen: run the simulation ahead of time and show only the settled pile
        for (let k = 0; k < 600; k++) M.Engine.update(engine, 1000 / 60);
        paint();
        return;
      }
      if (hover) {
        const mouse = M.Mouse.create(el);
        mouse.pixelRatio = 1;
        ["wheel", "mousewheel", "DOMMouseScroll"].forEach((n) => el.removeEventListener(n, mouse.mousewheel));
        mc = M.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
        M.Composite.add(engine.world, mc);
      }
      // matter warns if handed more than 16.667ms at once — split the elapsed time into fixed frames and step several times (a late frame at most twice)
      const TICK = 1000 / 60;
      let last = performance.now(), acc = 0;
      const step = (now) => {
        acc = Math.min(TICK * 2, acc + Math.max(0, now - last));
        last = now;
        while (acc >= TICK) { M.Engine.update(engine, TICK); acc -= TICK; }
        paint();
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && drop(), { threshold: +(options.at ?? 0.25) });
    io.observe(el);
    const ro = new ResizeObserver(() => started && place());
    ro.observe(el);
    return () => {
      io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf);
      if (mc) M.Mouse.clearSourceEvents(mc.mouse);
      M.Engine.clear(engine);
      items.forEach((it) => { it.style.cssText = ""; });
    };
  });
})();
