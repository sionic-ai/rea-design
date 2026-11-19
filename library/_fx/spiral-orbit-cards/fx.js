(() => {
  // Orbit of the original brand customer card (orbit=1): several cards line up around an ellipse with geometrically narrowing gaps (gap .88), taking up .62 of a turn, and
  // The front (bottom) card is 1.25x and darker, shrinking back to .4x with .22 opacity, deep cards (35% of the order back) blur up to 1.6px.
  // The ring turns .09 rad per second, and when scroll is given, that much more per scroll screen. Perspective comes only from sin(angle) (front is larger and darker).
  kfFx.register("spiral-orbit-cards", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const N = cards.length;
    if (!N) return;
    const span = +(options.span ?? 0.62), gap = +(options.gap ?? 0.88), s0 = +(options.front ?? 1.25), s1 = +(options.back ?? 0.4);
    const o1 = +(options.fade ?? 0.22), blurMax = +(options.blur ?? 1.6), speed = +(options.speed ?? 0.09), scrollK = +(options.scroll ?? 0);
    const rxK = +(options.rx ?? 0.385), ryK = +(options.ry ?? 0.35);
    const W = Math.PI * 2;
    const r = N > 1 ? (span * W * (1 - gap)) / (1 - gap ** Math.max(N - 1, 1)) : 0;
    const offs = [0];
    for (let t = 1; t < N; t++) offs.push(offs[t - 1] + r * gap ** (t - 1));
    let L = Math.PI / 2, last = 0, sy = null, raf = 0, visible = false;
    let rx = 0, ry = 0;
    const measure = () => { const w = el.clientWidth, h = el.clientHeight; rx = w * (w < 600 ? 0.58 : rxK); ry = h * (w < 600 ? 0.37 : ryK); };
    const ro = new ResizeObserver(() => { measure(); draw(); });
    ro.observe(el);
    measure();
    function draw() {
      cards.forEach((c, e) => {
        const i = (N - e) % N, a = N > 1 ? i / (N - 1) : 0;
        const ang = L - offs[i], s = (Math.sin(ang) + 1) / 2, sc = s0 * (s1 / s0) ** a;
        const scale = sc * (0.82 + 0.18 * s), op = (1 - (1 - o1) * a ** 0.85) * (0.65 + 0.35 * s), b = a > 0.35 ? ((a - 0.35) / 0.65) * blurMax : 0;
        c.style.transform = `translate(-50%, -50%) translate(${(Math.cos(ang) * rx).toFixed(2)}px, ${(Math.sin(ang) * ry).toFixed(2)}px) scale(${scale.toFixed(4)})`;
        c.style.zIndex = String(Math.round(s * 100));
        c.style.opacity = op.toFixed(3);
        c.style.filter = b ? `blur(${b.toFixed(2)}px)` : "";
      });
    }
    function loop(now) {
      raf = 0;
      if (!last) last = now;
      const dt = Math.min(0.1, Math.max(1, now - last) / 1000);
      last = now;
      L += dt * speed;
      if (scrollK) { const y = scrollY; if (sy !== null) L += ((y - sy) / innerHeight) * scrollK; sy = y; }
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    }
    draw();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) { last = 0; sy = null; raf = requestAnimationFrame(loop); }
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      cards.forEach((c) => { c.style.transform = ""; c.style.zIndex = ""; c.style.opacity = ""; c.style.filter = ""; });
    };
  });
})();
