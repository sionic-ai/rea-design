// Lay a bent ridge floor under the panel (bend points based on 1280×256, even if concave poly-decomp splits it into convex pieces), and when the panel’s top edge crosses the screen center
// Pieces are thrown in from the side — before touching the floor they collide only with the floor and other pieces so they can enter from off-screen, after touching they also hit the side walls·ceiling.
// Original values: piece restitution .9 · friction .1 · air .01, floor restitution .3 · friction .8, piece width 7.5% of the panel. You can grab and throw pieces by hand (mouse)
(() => {
  const RIDGE = "0,128 160,96 448,40 640,120 960,176 1120,96 1280,64";
  const THROW = "-0.04,0.35,1.1,-0.9,0.05|1.04,0.25,-1.2,-1.1,-0.06|-0.04,0.15,1.5,-0.5,0.04";
  const CAT = { ground: 1, wall: 2, shape: 4 };
  kfFx.register("ridge-drop-shapes", (el, { options, reduce, hover, scroller }) => {
    const M = window.Matter;
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (!M || !pieces.length) return;
    if (window.decomp) M.Common.setDecomp(window.decomp);
    const num = (k, d) => +(options[k] ?? d);
    const widthPc = num("width", 7.5) || 7.5;
    const ridge = String(options.ground || RIDGE).trim().split(/\s+/).map((p) => p.split(",").map(Number));
    const throws = String(options.throw || THROW).split("|").map((s) => s.split(",").map(Number));
    const polyOf = (p) => (p.dataset.key ? p.dataset.key.trim().split(/\s+/).map((q) => q.split(",").map(Number)) : [[0, 0], [100, 0], [100, 100], [0, 100]]);
    const ridgeY = (x, w, h) => {
      const s = w / 1280, X = x / s;
      for (let i = 0; i < ridge.length - 1; i++) {
        const [x0, y0] = ridge[i], [x1, y1] = ridge[i + 1];
        if (X >= x0 && X <= x1) return h - 256 * s + (y0 + ((X - x0) / (x1 - x0 || 1)) * (y1 - y0)) * s;
      }
      return h - 256 * s;
    };
    const place = (p, x, y, a, ox, oy) => { p.style.transformOrigin = `${ox}px ${oy}px`; p.style.transform = `translate(${x - ox}px, ${y - oy}px) rotate(${a}rad)`; };
    const sizeOf = () => (el.offsetWidth * widthPc) / 100;
    pieces.forEach((p) => { p.style.position = "absolute"; p.style.left = "0"; p.style.top = "0"; });
    const setSize = () => pieces.forEach((p) => { p.style.width = `${sizeOf()}px`; p.style.height = `${sizeOf()}px`; });
    setSize();

    // Reduced motion: only the pose sitting side by side on the ridge
    if (reduce) {
      const w = el.offsetWidth, h = el.offsetHeight, k = sizeOf();
      pieces.forEach((p, i) => { const x = w * (0.3 + i * 0.15); place(p, x, ridgeY(x, w, h) - k / 2, 0, k / 2, k / 2); });
      return () => pieces.forEach((p) => ["position", "left", "top", "width", "height", "transform", "transformOrigin"].forEach((k) => p.style.removeProperty(k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()))));
    }

    let engine = null, raf = 0, mouse = null, mc = null, items = [];
    const build = () => {
      const w = el.offsetWidth, h = el.offsetHeight, s = w / 1280, top = h - 256 * s;
      engine = M.Engine.create({ positionIterations: 8, velocityIterations: 6, constraintIterations: 4 });
      const verts = [...ridge.map(([x, y]) => ({ x: x * s, y: top + y * s })), { x: w, y: h + 40 }, { x: 0, y: h + 40 }];
      const ground = M.Bodies.fromVertices(0, 0, [verts], { isStatic: true, restitution: 0.3, friction: 0.8, slop: 0, label: "ground", collisionFilter: { category: CAT.ground, mask: 0xffff } }, true);
      const minX = Math.min(...verts.map((v) => v.x)), minY = Math.min(...verts.map((v) => v.y));
      M.Body.setPosition(ground, { x: ground.position.x + minX - ground.bounds.min.x, y: ground.position.y + minY - ground.bounds.min.y });
      ground.parts.forEach((q) => { q.label = "ground"; });
      const wall = { isStatic: true, restitution: 0.3, friction: 0.1, slop: 0, label: "wall", collisionFilter: { category: CAT.wall, mask: 0xffff } };
      M.Composite.add(engine.world, [ground, M.Bodies.rectangle(-25, h / 2, 50, h * 3, wall), M.Bodies.rectangle(w + 25, h / 2, 50, h * 3, wall), M.Bodies.rectangle(w / 2, -h - 25, w * 3, 50, wall)]);
      const k = sizeOf() / 100;
      items = pieces.map((p, i) => {
        const pts = polyOf(p).map(([x, y]) => ({ x: x * k, y: y * k }));
        const b = M.Bodies.fromVertices(0, 0, [pts], { density: 0.001, restitution: 0.9, friction: 0.1, frictionAir: 0.01, slop: 0, label: "shape", collisionFilter: { category: CAT.shape, mask: CAT.ground | CAT.shape } }, true);
        // The center of mass isn’t the box center — measure (ox, oy) from the element’s top-left to its center
        const ox = b.position.x - b.bounds.min.x + Math.min(...pts.map((v) => v.x)), oy = b.position.y - b.bounds.min.y + Math.min(...pts.map((v) => v.y));
        const [tx, ty, vx, vy, av] = throws[i % throws.length];
        M.Body.setPosition(b, { x: w * tx, y: h * ty });
        M.Body.setVelocity(b, { x: (vx * w) / 100, y: (vy * h) / 100 });
        M.Body.setAngularVelocity(b, av || 0);
        M.Composite.add(engine.world, b);
        return { p, b, ox, oy };
      });
      // Pieces that have touched the floor once also collide with walls and ceiling
      M.Events.on(engine, "collisionStart", (e) => e.pairs.forEach(({ bodyA, bodyB }) => {
        const hit = bodyA.label === "ground" ? bodyB : bodyB.label === "ground" ? bodyA : null;
        const body = hit && (hit.parent || hit);
        if (body && body.label === "shape") [body, ...body.parts].forEach((q) => { q.collisionFilter.mask = 0xffff; });
      }));
      if (hover) {
        mouse = M.Mouse.create(el);
        ["wheel", "mousewheel", "DOMMouseScroll"].forEach((t) => el.removeEventListener(t, mouse.mousewheel));
        ["touchmove", "touchstart", "touchend"].forEach((t) => el.removeEventListener(t, mouse[{ touchmove: "mousemove", touchstart: "mousedown", touchend: "mouseup" }[t]]));
        mc = M.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
        M.Composite.add(engine.world, mc);
      }
      let last = 0;
      const tick = (now) => {
        M.Engine.update(engine, Math.min(1000 / 60, Math.max(1, now - (last || now))));
        last = now;
        for (const { p, b, ox, oy } of items) place(p, b.position.x, b.position.y, b.angle, ox, oy);
        if (mc) el.classList.toggle("is-grabbing", !!mc.body);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!engine) return;
      cancelAnimationFrame(raf);
      if (mouse) {
        M.Mouse.clearSourceEvents(mouse);
        ["mousemove", "mousedown", "mouseup"].forEach((t) => el.removeEventListener(t, mouse[t]));
      }
      M.Events.off(engine);
      M.Composite.clear(engine.world, false);
      M.Engine.clear(engine);
      engine = mouse = mc = null;
    };
    // Fires once when the panel’s top edge passes the screen center
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !engine) build(); }, { root: scroller || null, rootMargin: "0px 0px -50% 0px" });
    io.observe(el);
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(() => { setSize(); if (engine) { stop(); build(); } }); });
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(resizeRaf);
      stop();
      el.classList.remove("is-grabbing");
      pieces.forEach((p) => ["position", "left", "top", "width", "height", "transform", "transform-origin"].forEach((k) => p.style.removeProperty(k)));
    };
  });
})();
