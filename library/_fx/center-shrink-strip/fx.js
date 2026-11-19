// A row of round cells flows endlessly left at an even gap, and each cell grows the farther it is from the screen (panel) center — size = 1 + grow × (distance/half-width)².
// Append one more set of cells for a seamless loop. Rests when the panel is off screen, and with reduced motion it stays still and only fits the size
(() => {
  kfFx.register("center-shrink-strip", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const gap = +(options.gap || 270), grow = +(options.grow ?? 0.585), speed = reduce ? 0 : +(options.speed ?? 30);
    const clones = items.map((it) => { const c = it.cloneNode(true); c.setAttribute("aria-hidden", "true"); it.parentNode.append(c); return c; });
    const all = [...items, ...clones];
    let off = 0, last = 0, W = el.clientWidth, on = true;
    const ro = new ResizeObserver(() => (W = el.clientWidth));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    io.observe(el);
    const place = (now) => {
      const dt = last ? Math.max(1, now - last) : 16;
      last = now;
      const span = gap * all.length;
      off = (off + (speed * dt) / 1000) % span;
      all.forEach((o, i) => {
        const x = ((((i * gap - off) % span) + span) % span) - gap;
        const d = Math.min(1, Math.abs(x - W / 2) / (W / 2 || 1));
        gsap.set(o, { x, scale: 1 + grow * d * d });
      });
    };
    const tick = () => on && place(performance.now());
    gsap.ticker.add(tick);
    place(performance.now());
    return () => { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); clones.forEach((c) => c.remove()); gsap.set(items, { clearProps: "transform" }); };
  });
})();
