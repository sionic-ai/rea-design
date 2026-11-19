(() => {
  const SKIP = 'input, textarea, select, [contenteditable], [draggable="true"], a, button, [data-lenis-prevent], [data-fx~="drag-marquee"]';
  kfFx.register("hold-burst-physics", (el, { options, reduce, hover }) => {
    const icons = [...el.querySelectorAll('[data-fx-part="icon"]')];
    const bar = el.querySelector('[data-fx-part="progress"]');
    if (reduce || !hover || !icons.length || !window.Matter) return;
    const { Engine, Bodies, Body, Composite } = Matter;
    const holdMs = +(options.hold ?? 1000), [s0, s1] = String(options.speed || "2-4").split("-").map(Number);
    const spin = +(options.spin ?? 0.5), air = +(options.air ?? 0.02), R = gsap.utils.random;
    let hold = null, engine = null, bodies = [], running = false, barTween = null;
    const charge = () => { if (!bar) return; barTween?.kill(); bar.classList.add("fx-on"); gsap.set(bar, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" }); barTween = gsap.to(bar, { clipPath: "inset(0% 0% 0% 0%)", duration: holdMs / 1000, ease: "none" }); };
    const discharge = () => { if (!bar) return; barTween?.kill(); barTween = gsap.to(bar, { opacity: 0, duration: 0.25, onComplete: () => { gsap.set(bar, { clipPath: "inset(0% 100% 0% 0%)" }); bar.classList.remove("fx-on"); } }); };
    const cancel = () => { if (!hold) return; clearTimeout(hold.timer); hold = null; discharge(); };
    const sync = () => bodies.forEach((b) => { b.element.style.transform = `translate3d(${b.position.x - b.ox}px, ${b.position.y - b.oy}px, 0) rotate(${b.angle}rad)`; });
    const tick = (t, dt) => {
      Engine.update(engine, Math.min(Math.max(1, dt), 1000 / 60));
      sync();
      if (bodies.every((b) => b.position.y > innerHeight + 300)) { running = false; gsap.ticker.remove(tick); el.classList.remove("fx-on"); }
    };
    const burst = (x, y) => {
      hold = null;
      discharge();
      if (!getSelection()?.isCollapsed) return;
      el.classList.add("fx-on");
      if (!engine) {
        engine = Engine.create({ gravity: { y: +(options.gravity ?? 1) } });
        bodies = icons.map((ic) => {
          const w = Math.max(1, ic.offsetWidth), h = Math.max(1, ic.offsetHeight);
          return Object.assign(Bodies.rectangle(0, 0, w, h, { frictionAir: air, chamfer: { radius: Math.min(w, h) * 0.2 } }), { element: ic, ox: w / 2, oy: h / 2 });
        });
        Composite.add(engine.world, bodies);
      }
      bodies.forEach((b) => {
        const a = R(0, Math.PI * 2) - 0.1, sp = R(s0, s1);
        Body.setPosition(b, { x, y });
        Body.setAngle(b, R(-Math.PI, Math.PI));
        Body.setVelocity(b, { x: Math.cos(a) * sp, y: Math.sin(a) * sp });
        Body.setAngularVelocity(b, R(-spin, spin));
      });
      sync();
      if (!running) { running = true; gsap.ticker.add(tick); }
    };
    const down = (e) => {
      cancel();
      if (e.pointerType === "touch" || e.button !== 0 || e.target.closest?.(SKIP)) return;
      hold = { id: e.pointerId, x: e.clientX, y: e.clientY, sy: scrollY, timer: setTimeout(() => burst(e.clientX, e.clientY), holdMs) };
      charge();
    };
    const move = (e) => { if (hold && e.pointerId === hold.id && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 28) cancel(); };
    const scroll = () => { if (hold && Math.abs(scrollY - hold.sy) > 60) cancel(); };
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerup", cancel, { passive: true });
    document.addEventListener("pointercancel", cancel, { passive: true });
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("blur", cancel);
    return () => {
      cancel();
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", cancel);
      document.removeEventListener("pointercancel", cancel);
      removeEventListener("scroll", scroll);
      removeEventListener("blur", cancel);
      gsap.ticker.remove(tick);
      barTween?.kill();
      if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); }
      icons.forEach((ic) => (ic.style.transform = ""));
      el.classList.remove("fx-on");
    };
  });
})();
