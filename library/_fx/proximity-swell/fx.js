// Cells scattered over the panel swell by their distance from the cursor: within the reach share of the screen width, the closer the larger up to scale times, each frame following the remaining difference by follow.
// Touch devices use the screen center instead of the cursor and widen the radius to the full screen width (reach-touch)
(() => {
  kfFx.register("proximity-swell", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || reduce) return;
    const max = +(options.scale ?? 1.3);
    const reachK = +(hover ? options.reach ?? 0.2 : options["reach-touch"] ?? 1);
    const follow = +(options.follow ?? 0.08);
    const at = { x: innerWidth / 2, y: innerHeight / 2 };
    const size = items.map(() => 1);
    const onMove = (e) => { at.x = e.clientX; at.y = e.clientY; };
    if (hover) addEventListener("pointermove", onMove, { passive: true });
    let raf = 0, last = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = now;
      // Step counted with one 60fps frame as 1 — if frames run late it follows that much more
      const step = Math.max(1, now - last) / (1000 / 60);
      last = now;
      if (!hover) { at.x = innerWidth / 2; at.y = innerHeight / 2; }
      const reach = innerWidth * reachK;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const d = Math.hypot(at.x - (r.left + r.width / 2), at.y - (r.top + r.height / 2));
        const near = Math.min(1, Math.max(0, 1 - d / reach));
        size[i] += (1 + near * (max - 1) - size[i]) * Math.min(1, follow * step);
        it.style.scale = size[i].toFixed(4);
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      items.forEach((it) => it.style.removeProperty("scale"));
    };
  });
})();
