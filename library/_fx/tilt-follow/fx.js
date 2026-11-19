(() => {
  // Original tilt3d: reads the cursor from .2s after entering and applies the −1~1 ratio from center × (Y-axis 13° · X-axis 15° · shift 20/15px) in the opposite direction.
  // Follow is an exponential interpolation of .4s divided by 60fps (1 − .001^(1/(.4·60))), perspective 800px
  kfFx.register("tilt-follow", (el, { options, hover, reduce }) => {
    if (!hover || reduce) return;
    const target = el.querySelector('[data-fx-part="target"]') || el.firstElementChild;
    if (!target) return;
    const mY = +(options.ry ?? 13), mX = +(options.rx ?? 15), tX = +(options.x ?? 20), tY = +(options.y ?? 15), delay = +(options.delay ?? 0.2);
    const sign = options.dir === "toward" ? 1 : -1;
    const k = 1 - Math.pow(0.001, 1 / (Math.max(0.05, +(options.dur ?? 0.4)) * 60));
    gsap.set(target, { transformPerspective: +(options.perspective ?? 800), transformOrigin: "center center" });
    const g = { ry: 0, rx: 0, x: 0, y: 0 }, c = { ry: 0, rx: 0, x: 0, y: 0 };
    let ok = false, timer = 0, run = false;
    const tick = () => {
      let done = true;
      for (const key in g) { c[key] += (g[key] - c[key]) * k; if (Math.abs(g[key] - c[key]) > 0.01) done = false; }
      gsap.set(target, { rotateY: c.ry, rotateX: c.rx, x: c.x, y: c.y });
      if (done) { gsap.ticker.remove(tick); run = false; }
    };
    const go = () => { if (!run) { run = true; gsap.ticker.add(tick); } };
    const enter = () => { go(); timer = setTimeout(() => { ok = true; }, delay * 1000); };
    const move = (e) => {
      if (!ok) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2), ny = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      g.ry = sign * nx * mY; g.x = sign * nx * tX; g.rx = sign * ny * mX; g.y = sign * ny * tY;
      go();
    };
    const leave = () => { clearTimeout(timer); ok = false; Object.assign(g, { ry: 0, rx: 0, x: 0, y: 0 }); go(); };
    el.addEventListener("pointerenter", enter); el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { clearTimeout(timer); gsap.ticker.remove(tick); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.set(target, { clearProps: "transform" }); };
  });
})();
