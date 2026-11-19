(() => {
  // When the cursor moves within the element width, the element is pushed by that frame’s cursor speed and returns to place like a spring (pull .18 · damping .3).
  // Cursor speed goes to 0 once 100ms have passed since it last moved — things stay still next to a stopped cursor. Counted only while visible on screen
  const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
  let bound = false;
  const bind = () => {
    if (bound) return; bound = true;
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      mouse.vx = e.clientX - mouse.x; mouse.vy = e.clientY - mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY;
      clearTimeout(mouse.t); mouse.t = setTimeout(() => { mouse.vx = 0; mouse.vy = 0; }, 100);
    }, { passive: true });
  };
  kfFx.register("nudge-spring", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    bind();
    const k = +(options.pull ?? 0.18), damp = +(options.damp ?? 0.3), reach = +(options.reach ?? 1);
    const off = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
    let active = false;
    const io = new IntersectionObserver((es) => es.forEach((e) => (active = e.isIntersecting)));
    io.observe(el);
    const tick = () => {
      if (!active) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let fx = 0, fy = 0;
      if (Math.hypot(cx - mouse.x, cy - mouse.y) < r.width * reach && (mouse.vx || mouse.vy)) { fx = mouse.vx; fy = mouse.vy; }
      vel.x = (vel.x - off.x * k + fx) * damp;
      vel.y = (vel.y - off.y * k + fy) * damp;
      off.x += vel.x; off.y += vel.y;
      el.style.translate = `${off.x}px ${off.y}px`;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); el.style.translate = ""; };
  });
})();
