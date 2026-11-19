// Original eight slots — horizontal position (%), height before falling (px, negative = Over panel), tilt (°), rotation speed
(() => {
  const FX_DROP = [["20%", -180, -8, -0.009], ["43%", -430, 5, 0.007], ["68%", -250, -4, -0.005], ["80%", -610, 6, 0.006], ["29%", -760, 7, 0.01], ["53%", -930, -5, -0.006], ["74%", -800, -7, -0.008], ["38%", -1120, 9, 0.008]];
  kfFx.register("physics-notes", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    (() => {
      const M = window.Matter, notes = [...el.querySelectorAll("[data-fx-part=note]")];
      if (!M || !notes.length) return;
      const drops = options.drop ? options.drop.split("|").map((s) => s.split(",").map((v, i) => (i ? +v : v))) : FX_DROP;
      if (reduce) { notes.forEach((n, i) => { const [x] = drops[i % drops.length]; n.style.transform = `translate(${(parseFloat(x) / 100) * el.offsetWidth - n.offsetWidth / 2}px, ${el.offsetHeight - n.offsetHeight * (1 + (i % 3))}px)`; }); return; }
      let engine = null, raf = 0, mouse = null, bodies = [], sealed = false;
      const start = () => {
        if (engine) return;
        const W = el.offsetWidth, H = el.offsetHeight, T = 200, wall = { isStatic: true, friction: 1 };
        engine = M.Engine.create({ enableSleeping: true });
        M.Composite.add(engine.world, [M.Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, wall), M.Bodies.rectangle(W + T / 2, H / 2, T, H * 3, wall), M.Bodies.rectangle(-T / 2, H / 2, T, H * 3, wall)]);
        bodies = notes.map((n, i) => {
          const [x, y, a, spin] = drops[i % drops.length], w = n.offsetWidth, h = n.offsetHeight;
          const b = M.Bodies.rectangle((parseFloat(x) / 100) * W, y, w, h, { restitution: 0.85, friction: 0.15, frictionAir: 0.02, density: 0.001, angle: (a * Math.PI) / 180 });
          // The roof closes after everything is in, so at first it drops from above the panel (24px above the bottom edge)
          if (b.bounds.max.y > -24) M.Body.translate(b, { x: 0, y: -24 - b.bounds.max.y });
          M.Body.setAngularVelocity(b, spin);
          M.Composite.add(engine.world, b);
          return { n, b, w, h };
        });
        mouse = M.Mouse.create(el);
        // Matter blocks the wheel — release it so page scroll continues
        el.removeEventListener("wheel", mouse.mousewheel);
        el.removeEventListener("mousewheel", mouse.mousewheel);
        el.removeEventListener("DOMMouseScroll", mouse.mousewheel);
        // On phone, touch is released — Matter calls preventDefault on touchstart and touchmove, so dragging on a note would stop the page from scrolling
        if (!hover) [["touchmove", "mousemove"], ["touchstart", "mousedown"], ["touchend", "mouseup"]].forEach(([t, f]) => el.removeEventListener(t, mouse[f]));
        // A grabbed note doesn’t lock rotation (angularStiffness 0) — dragging by a corner spins it
        const mc = M.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.7, angularStiffness: 0, render: { visible: false } } });
        M.Composite.add(engine.world, mc);
        sealed = false;
        let last = 0;
        const tick = (now) => {
          // rAF time can be earlier than a previously measured time. Running with a negative delta makes Sleeping fall asleep on the first frame and the note freezes on top of the box. The first frame is last = now
          M.Engine.update(engine, Math.min(1000 / 60, Math.max(1, now - (last || now))));
          last = now;
          let inside = true;
          for (const { n, b, w, h } of bodies) { n.style.transform = `translate(${b.position.x - w / 2}px, ${b.position.y - h / 2}px) rotate(${b.angle}rad)`; if (b.position.y - h / 2 < 0) inside = false; }
          if (!sealed && inside) { sealed = true; M.Composite.add(engine.world, M.Bodies.rectangle(W / 2, -T / 2, W + T * 2, T, wall)); }
          const over = M.Query.point(bodies.map((o) => o.b), mouse.position).length > 0;
          el.classList.toggle("is-grab", over && !mc.body);
          el.classList.toggle("is-grabbing", !!mc.body);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      };
      const stop = () => {
        if (!engine) return;
        cancelAnimationFrame(raf);
        M.Mouse.clearSourceEvents(mouse);
        [["mousemove", "mousemove"], ["mousedown", "mousedown"], ["mouseup", "mouseup"], ["touchmove", "mousemove"], ["touchstart", "mousedown"], ["touchend", "mouseup"]].forEach(([t, f]) => el.removeEventListener(t, mouse[f]));
        M.Composite.clear(engine.world, false);
        M.Engine.clear(engine);
        engine = mouse = null;
      };
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { root: scroller || null, threshold: 0.2 });
      io.observe(el);
      signal.addEventListener("abort", () => { io.disconnect(); stop(); notes.forEach((n) => (n.style.transform = "")); });
    })();
    return () => ac.abort();
  });
})();
