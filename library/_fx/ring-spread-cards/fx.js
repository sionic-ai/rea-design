// Concentric circles around the center logo and the card around them — once the panel is 30% in view, starting from the second circle they light up at .2s intervals, growing from .8x and transparent (.6s ease-out),
// After all circles turn on (circle count × .2 + .2s) the cards spread all at once into place from a .8x, transparent spot pulled 100px toward the center (.6s ease-out). Once only
(() => {
  kfFx.register("ring-spread-cards", (el, { options, reduce }) => {
    const rings = [...el.querySelectorAll('[data-fx-part="ring"]')];
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const hub = el.querySelector('[data-fx-part="hub"]') || el;
    if (!rings.length && !cards.length) return;
    const dur = +(options.dur ?? 0.6), gap = +(options.gap ?? 0.2), pull = +(options.pull ?? 100), from = +(options.from ?? 0.8);
    const keep = rings.slice(0, +(options.keep ?? 1));
    const tween = `opacity ${dur}s ease-out, transform ${dur}s ease-out`;
    const base = (n) => n.dataset.fxBase ?? (n.dataset.fxBase = n.style.transform || "");
    // Cards are pulled by pull in the direction opposite to the one pointing outward from center
    const place = () => {
      const h = hub.getBoundingClientRect(), cx = h.left + h.width / 2, cy = h.top + h.height / 2;
      cards.forEach((c) => {
        const b = base(c);
        c.style.transition = "none";
        c.style.transform = b;
        const r = c.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
        const d = Math.hypot(dx, dy) || 1;
        c.style.opacity = "0";
        c.style.transform = `${b} translate(${(-dx / d) * pull}px, ${(-dy / d) * pull}px) scale(${from})`;
      });
      rings.forEach((r) => { if (keep.includes(r)) return; r.style.transition = "none"; r.style.opacity = "0"; r.style.transform = `${base(r)} scale(${from})`; });
    };
    if (reduce) return;
    place();
    const timers = [];
    const play = () => {
      el.classList.add("is-played");
      rings.filter((r) => !keep.includes(r)).forEach((r, i) => timers.push(setTimeout(() => { r.style.transition = tween; r.style.opacity = "1"; r.style.transform = base(r); }, i * gap * 1000)));
      const after = (rings.length - keep.length) * gap + gap;
      timers.push(setTimeout(() => cards.forEach((c) => { c.style.transition = tween; c.style.opacity = "1"; c.style.transform = base(c); }), after * 1000));
    };
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
    }, { threshold: +(options.threshold ?? 0.3) });
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      [...rings, ...cards].forEach((n) => { n.style.transition = ""; n.style.opacity = ""; n.style.transform = n.dataset.fxBase || ""; delete n.dataset.fxBase; });
      el.classList.remove("is-played");
    };
  });
})();
