// Several photos flow endlessly along a staircase from bottom left to top right, and photos in the middle of the stairs are larger (bell curve share).
// On its own it drifts by the drift amount every frame, and scrolling past the panel pushes an extra (1 − 1/section count) of a full turn — when the scroll direction flips, the self-drift direction flips too.
(() => {
  const bez = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  const seg = (p, x) => {
    let lo = 0, hi = 1, t = 0.5;
    for (let i = 0; i < 22; i++) { t = (lo + hi) / 2; if (bez(p[0], p[2], p[4], p[6], t) < x) lo = t; else hi = t; }
    return bez(p[1], p[3], p[5], p[7], t);
  };
  // Original CustomEase ”M0,0 C0.5,0.4 0.4,1 0.5,1 0.6,1 0.5,0.4 1,0” — a bell curve that is 1 at the center (.5) and 0 at both ends. The two-piece Bezier is unrolled as is
  const bell = (x) => (x <= 0.5 ? seg([0, 0, 0.5, 0.4, 0.4, 1, 0.5, 1], x) : seg([0.5, 1, 0.6, 1, 0.5, 0.4, 1, 0], x));

  kfFx.register("bell-stair-flow", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    if (!items.length || !window.gsap) return;
    const n = items.length;
    const base = +(options.base ?? 5 / 12);
    const drift = +(options.drift ?? 0.001);
    const depth = +(options.depth ?? 0.7);
    const lift = +(options.lift ?? 3) || 3;
    const fade = +(options.fade ?? 0.5);
    el.style.setProperty("--fx-base", `${base * 100}%`);
    const S = items.map((_, i) => (i + 0.5) / n);
    const j = 1 - 1 / n;
    const st = { s: 0, w: 0, dir: 1, W: 0, H: 0, ratio: 1.25 };
    const measure = () => {
      st.W = el.clientWidth;
      st.H = el.clientHeight;
      const wNow = items[0].offsetWidth;
      st.ratio = wNow ? items[0].offsetHeight / wNow : 1.25;
    };
    const layout = () => {
      const e = S.map((v) => ((((v + ((j * (st.s + st.w)) % 1)) % 1) + 1) % 1));
      const order = e.map((_, i) => i).sort((a, b) => e[a] - e[b]);
      const b = e.map(bell);
      const sum = b.reduce((a, c) => a + c, 0) || 1;
      let acc = 0;
      for (const i of order) {
        const t = acc, wi = b[i] / sum;
        acc += wi;
        const h = wi * st.W * st.ratio, sc = wi / base;
        gsap.set(items[i], { scale: sc, x: t * st.W, y: -t * st.H + (h / lift) * t });
        const inner = items[i].firstElementChild;
        if (inner) gsap.set(inner, { scale: 1 + (1 - sc) * depth });
      }
    };
    measure();
    const ro = new ResizeObserver(() => { measure(); layout(); });
    ro.observe(el);
    if (reduce) {
      layout();
      gsap.set(items, { opacity: 1 });
      return () => { ro.disconnect(); el.style.removeProperty("--fx-base"); gsap.set(items, { clearProps: "transform,opacity" }); items.forEach((it) => it.firstElementChild && gsap.set(it.firstElementChild, { clearProps: "transform" })); };
    }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(items, { opacity: 0 });
      layout();
      gsap.to(items, { opacity: 1, duration: fade, ease: "power2.out" });
      let prev = 0;
      if (window.ScrollTrigger) {
        const from = (options.trigger && el.closest(options.trigger)) || el;
        gsap.to(st, {
          w: 1, ease: "none",
          scrollTrigger: { trigger: from, endTrigger: el, start: "top top", end: "bottom top", scrub: true, scroller: scroller || undefined },
          onUpdate() { const d = st.w - prev > 0 ? 1 : -1; st.dir = d; prev = st.w; },
        });
      }
      const tick = () => { st.s += drift * st.dir; layout(); };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    });
    return () => {
      mm.revert();
      ro.disconnect();
      el.style.removeProperty("--fx-base");
      gsap.set(items, { clearProps: "transform,opacity" });
      items.forEach((it) => it.firstElementChild && gsap.set(it.firstElementChild, { clearProps: "transform" }));
    };
  });
})();
