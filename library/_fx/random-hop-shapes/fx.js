// The colored shapes floating behind the panel scatter anywhere on screen each time it opens (up to the margin outside the edges), and now and then one turns off and comes back on in another spot.
// Rather than moving over, it switches off and lights up elsewhere, so the background stays quiet. Position is relative to the (fixed) screen, so it follows on scroll.
(() => {
  kfFx.register("random-hop-shapes", (el, { options, reduce }) => {
    const shapes = [...el.querySelectorAll(':scope [data-fx-part="shape"]')];
    if (!shapes.length) return;
    const every = +(options.every || 10);
    const fade = +(options.fade ?? 0.3);
    const margin = +(options.margin ?? 100);
    const min = +(options.min ?? 0.9), max = +(options.max ?? 1.1);
    const place = (s) => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      s.style.left = `${(Math.random() * (w + margin * 2) - margin).toFixed(0)}px`;
      s.style.top = `${(Math.random() * (h + margin * 2) - margin).toFixed(0)}px`;
      s.style.transform = `scale(${(Math.random() * (max - min) + min).toFixed(3)})`;
      s.style.zIndex = String(Math.floor(Math.random() * 50));
      s.style.transition = `opacity ${fade}s`;
      s.style.opacity = "1";
    };
    shapes.forEach(place);
    const timers = [];
    let iv = 0;
    if (!reduce) {
      iv = setInterval(() => {
        const s = shapes[Math.floor(Math.random() * shapes.length)];
        s.style.opacity = "0";
        timers.push(setTimeout(() => place(s), fade * 1000));
      }, every * 1000);
    }
    return () => {
      clearInterval(iv);
      timers.forEach(clearTimeout);
      shapes.forEach((s) => ["left", "top", "transform", "z-index", "transition", "opacity"].forEach((k) => s.style.removeProperty(k)));
    };
  });
})();
