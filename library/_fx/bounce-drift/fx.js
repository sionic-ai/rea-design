// The element floats diagonally inside the panel (the parent, or the screen if none), bounces off walls, and on hover glides to a stop
(() => {
  kfFx.register("bounce-drift", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const vx = +(options.vx ?? 1.1), vy = +(options.vy ?? 0.8), ease = +(options.ease ?? 0.05), spread = +(options.spread ?? 0);
    const box = options.within === "parent" ? el.parentElement : null;
    // spread adds a random 0~spread px per axis (direction unchanged) — each time it opens, the pieces scatter at different speeds
    const v = { x: vx + Math.sign(vx) * Math.random() * spread, y: vy + Math.sign(vy) * Math.random() * spread }, pos = { x: +(options.x ?? 0), y: +(options.y ?? 0) };
    let speed = 1, over = false, origin = null;
    const on = () => (over = true), off = () => (over = false);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    // Measure the distance to the wall from the initial position (before moving) — re-measure when the panel size changes
    const measure = () => { const t = el.style.transform; el.style.transform = ""; const r = el.getBoundingClientRect(), b = box ? box.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight }; origin = { x: r.left - b.left, y: r.top - b.top, w: b.width, h: b.height }; el.style.transform = t; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box || document.documentElement);
    const tick = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const minX = -origin.x, minY = -origin.y, maxX = origin.w - w - origin.x, maxY = origin.h - h - origin.y;
      speed += ((over ? 0 : 1) - speed) * ease;
      if (maxX <= minX || maxY <= minY) return;
      pos.x += v.x * speed; pos.y += v.y * speed;
      if (pos.x <= minX) { pos.x = minX; v.x = Math.abs(v.x); }
      if (pos.x >= maxX) { pos.x = maxX; v.x = -Math.abs(v.x); }
      if (pos.y <= minY) { pos.y = minY; v.y = Math.abs(v.y); }
      if (pos.y >= maxY) { pos.y = maxY; v.y = -Math.abs(v.y); }
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); ro.disconnect(); el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); el.style.transform = ""; };
  });
})();
