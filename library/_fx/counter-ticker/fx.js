(() => {
  // Appends two more copies of each row’s content, and makes odd rows flow left and even rows flow right endlessly.
  // The original, on every setInterval(0) (about 4ms in Chrome), shaves speed px off the first item’s margin and resets it to 0 once it exceeds the item width —
  // So speed × 250px per second, and one loop is the width of a single item. Here the same speed is divided by time per screen frame and pushed with transform.
  kfFx.register("counter-ticker", (el, { options, reduce }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')].filter((r) => r.children.length);
    if (!rows.length) return;
    const narrow = +(options.narrow ?? 768);
    const perSec = () => +(options.speed ?? 0.3) * 250 / (innerWidth <= narrow ? +(options.slow ?? 1.5) || 1 : 1);
    const keep = rows.map((r) => r.innerHTML);
    rows.forEach((r) => { const html = r.innerHTML; r.insertAdjacentHTML("beforeend", html + html); });
    rows.forEach((r) => { const n = r.children.length / 3; [...r.children].forEach((c, j) => j >= n && c.setAttribute("aria-hidden", "true")); });
    const unit = rows.map((r) => r.children[0]);
    const pos = rows.map(() => 0);
    let raf = 0, last = 0, seen = true;
    const paint = () => rows.forEach((r, i) => {
      const w = unit[i].getBoundingClientRect().width + parseFloat(getComputedStyle(unit[i]).marginRight || 0);
      const x = i % 2 === 0 ? -pos[i] : pos[i] - w;
      r.style.transform = `translate3d(${x}px,0,0)`;
    });
    const tick = (now) => {
      raf = 0;
      if (!last) last = now;
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      rows.forEach((r, i) => {
        const w = unit[i].getBoundingClientRect().width + parseFloat(getComputedStyle(unit[i]).marginRight || 0);
        pos[i] += perSec() * Math.min(dt, 0.1);
        if (w > 0 && pos[i] > w) pos[i] -= w;
      });
      paint();
      if (seen) raf = requestAnimationFrame(tick);
    };
    paint();
    let io;
    if (!reduce) {
      io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; last = 0; if (seen && !raf) raf = requestAnimationFrame(tick); });
      io.observe(el);
    }
    return () => {
      cancelAnimationFrame(raf); io && io.disconnect();
      rows.forEach((r, i) => { r.innerHTML = keep[i]; r.style.transform = ""; });
    };
  });
})();
