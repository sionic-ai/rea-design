(() => {
  kfFx.register("lag-thumb-follow", (el, { options, reduce, hover }) => {
    const thumb = el.querySelector('[data-fx-part="thumb"]');
    if (!thumb || !hover) return;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')], photos = [...thumb.querySelectorAll('[data-fx-part="photo"]')];
    const decay = reduce ? 0 : +(options.decay ?? 0.85), step = Math.floor(1000 / (+options.fps || 60));
    const show = (n) => photos.forEach((p, k) => p.classList.toggle("is-fx-active", k === n));
    show(0);
    const g = { x: 0, y: 0 }, prev = { x: 0, y: 0 }, lag = { x: 0, y: 0 };
    let last = performance.now(), stopped = false, raf = 0;
    const r2 = (n) => Math.round(n * 100) / 100;
    const loop = () => { raf = requestAnimationFrame(frame); };
    const frame = (t) => {
      if (stopped) return;
      const dt = t - last;
      if (dt <= step) { loop(); return; }
      last = t - (dt % step);
      lag.x *= decay;
      lag.y *= decay;
      const x = g.x + r2(lag.x), y = g.y + r2(lag.y);
      thumb.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
      if (g.x === x && g.y === y) stopped = true;
      loop();
    };
    const ac = new AbortController(), signal = ac.signal;
    el.addEventListener("mouseenter", (e) => { prev.x = e.clientX; prev.y = e.clientY; stopped = false; loop(); }, { signal });
    el.addEventListener("mouseleave", () => { thumb.classList.remove("is-fx-on"); cancelAnimationFrame(raf); }, { signal });
    el.addEventListener("mousemove", (e) => {
      if (g.x && g.y && !thumb.classList.contains("is-fx-on")) thumb.classList.add("is-fx-on");
      if (stopped) { stopped = false; loop(); }
      g.x = e.clientX; g.y = e.clientY;
      lag.x += prev.x - g.x; lag.y += prev.y - g.y;
      prev.x = g.x; prev.y = g.y;
    }, { signal });
    items.forEach((item, i) => item.addEventListener("mouseenter", () => show(photos[i] ? i : 0), { signal }));
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      thumb.classList.remove("is-fx-on");
      thumb.style.removeProperty("transform");
      photos.forEach((p) => p.classList.remove("is-fx-active"));
    };
  });
})();
