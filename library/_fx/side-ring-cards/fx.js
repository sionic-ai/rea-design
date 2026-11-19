(() => {
  // Cards stand around two circles centered outside the panel’s left and right — circle radius is .43 of panel height (phone .36), entering the panel by .17 of its width (phone .2)
  // Wraps the center text like brackets. Cards lie along the circle’s radius, and the two circles turn on their own in opposite directions at .035rad per second, rotating an extra .0006rad per 1px of scroll.
  kfFx.register("side-ring-cards", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (cards.length < 2) return;
    const speed = +(options.speed ?? 0.035), scrollK = +(options.scroll ?? 0.0006), reach = +(options.reach ?? 0.17), rad = +(options.radius ?? 0.43), wF = +(options.width ?? 0.086);
    const half = Math.ceil(cards.length / 2);
    const st = { a: 0, on: true };
    const layout = () => {
      const W = el.clientWidth, H = el.clientHeight, phone = W < 700;
      const w = phone ? 74 : W * wF, h = w / 1.5, R = H * (phone ? 0.36 : rad), rch = W * (phone ? 0.2 : reach);
      cards.forEach((c, i) => {
        const side = i < half ? -1 : 1, k = side < 0 ? i : i - half, n = side < 0 ? half : cards.length - half;
        const a = (k * Math.PI * 2) / n + st.a * side + (side > 0 ? Math.PI : 0);
        const cx = side < 0 ? rch - R : W - rch + R;
        c.style.width = `${w}px`;
        c.style.transform = `translate(${cx + Math.cos(a) * R - w / 2}px, ${H * 0.48 + Math.sin(a) * R - h / 2}px) rotate(${a}rad)`;
      });
    };
    let lastY = scrollY;
    const tick = (t, dt) => {
      const ds = scrollY - lastY; lastY = scrollY;
      if (!st.on) return;
      if (!reduce) st.a += (speed * Math.min(dt, 100)) / 1000 + ds * scrollK;
      layout();
    };
    const io = new IntersectionObserver(([e]) => { st.on = e.isIntersecting; }, { rootMargin: "200px 0px" });
    io.observe(el);
    const ro = new ResizeObserver(layout); ro.observe(el);
    layout();
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); ro.disconnect(); cards.forEach((c) => { c.style.transform = ""; c.style.width = ""; }); };
  });
})();
