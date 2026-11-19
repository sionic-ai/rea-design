(() => {
  kfFx.register("wheel-orbit-photos", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const rx = +options.rx || 2.4, ry = +options.ry || 2.7, period = +options.period || 3;
    const accel = +options.accel || 800, spread = +options.spread || 40, tilt = +(options.tilt ?? 20);
    const base = items.map((_, i) => (i / items.length) * Math.PI * 2);
    const q = items.map(() => (Math.random() - 0.5) / 2);
    let w = el.clientWidth, h = el.clientHeight;
    const ro = new ResizeObserver(() => { w = el.clientWidth; h = el.clientHeight; if (reduce) place(0); });
    ro.observe(el);
    const state = { acceleration: 0, rayon: 0 };
    let incr = 0;
    const place = (time) => {
      items.forEach((it, i) => {
        const a = (time + incr) / period + base[i];
        gsap.set(it, {
          x: (Math.sin(a) * w) / (rx + q[i] * state.rayon),
          y: (Math.cos(a) * h) / (ry + q[i] * state.rayon),
          rotate: q[i] * state.rayon * tilt,
        });
      });
    };
    if (reduce) { place(0); return () => { ro.disconnect(); gsap.set(items, { clearProps: "transform" }); }; }

    const setA = gsap.quickTo(state, "acceleration", { duration: 0.3, ease: "power1" });
    const setR = gsap.quickTo(state, "rayon", { duration: 0.6, ease: "power1" });
    let idle = 0;
    const nudge = (dy, a, r) => {
      setA(dy / a); setR(dy / r);
      clearTimeout(idle);
      idle = setTimeout(() => { setA(0); setR(0); }, 120);
    };
    const onWheel = (e) => nudge(e.deltaY, accel, spread);
    let lastY = null;
    const onTouchStart = (e) => { lastY = e.touches[0]?.clientY ?? null; };
    const onTouchMove = (e) => {
      const y = e.touches[0]?.clientY;
      if (y == null || lastY == null) return;
      nudge(lastY - y, accel / 4, spread / 4);
      lastY = y;
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });

    const tick = (time) => { incr += state.acceleration; place(time); };
    let running = false;
    const play = () => { if (!running) { running = true; gsap.ticker.add(tick); } };
    const pause = () => { if (running) { running = false; gsap.ticker.remove(tick); } };
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? play() : pause()));
    io.observe(el);
    place(gsap.ticker.time);

    return () => {
      pause(); io.disconnect(); ro.disconnect(); clearTimeout(idle);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      gsap.killTweensOf(state);
      gsap.set(items, { clearProps: "transform" });
    };
  });
})();
