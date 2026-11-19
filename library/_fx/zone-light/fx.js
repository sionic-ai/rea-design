(() => {
  // Turns a single image into a process guide — when a step card’s center is between 30~70% of the screen, that card turns on and only the image zone up to that step lights up (the rest sinks into the background).
  // The picture panel (stage) enters when the section is 62% or more visible and leaves below 38% — from below when scrolling down, from above when scrolling up
  kfFx.register("zone-light", (el, { options, reduce, scroller }) => {
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    const zones = [...el.querySelectorAll('[data-fx-part="zone"]')];
    if (!steps.length || !zones.length) return;
    const stage = el.querySelector('[data-fx-part="stage"]');
    const lo = +(options.lo ?? 0.3), hi = +(options.hi ?? 0.7), inAt = +(options.enter ?? 0.62), outAt = +(options.leave ?? 0.38), shift = +(options.shift ?? 120);
    const view = () => (scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight });
    let lit = -1;
    const paint = (n) => {
      if (n === lit) return;
      lit = n;
      steps.forEach((s, i) => s.classList.toggle("is-active", i === n - 1));
      zones.forEach((z) => z.classList.toggle("is-off", Number(z.dataset.key) > n));
      el.dataset.activeStep = String(n);
    };
    if (reduce) {
      paint(steps.length);
      return () => { zones.forEach((z) => z.classList.remove("is-off")); steps.forEach((s) => s.classList.remove("is-active")); };
    }
    const active = () => {
      const v = view(), top = v.top + v.height * lo, bot = v.top + v.height * hi;
      const mids = steps.map((s) => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; });
      let idx = -1;
      mids.forEach((m, i) => m <= bot && m > top && (idx = i));
      if (idx < 0) mids.forEach((m, i) => m <= bot && (idx = i));
      return idx < 0 ? steps.length : idx + 1;
    };
    let inside = null, lastY = 0, down = true;
    const seen = () => {
      const v = view(), r = (stage || el).getBoundingClientRect();
      const s = Math.max(0, Math.min(r.bottom, v.top + v.height) - Math.max(r.top, v.top));
      return s / Math.min(r.height || v.height, v.height);
    };
    const show = (on, instant) => {
      if (!stage) return;
      const off = { autoAlpha: 0, y: on === down ? shift : -shift, scale: 0.92 };
      if (instant) return void gsap.set(stage, on ? { autoAlpha: 1, y: 0, scale: 1 } : off);
      on ? gsap.fromTo(stage, off, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: kfFx.ease("0.22,1,0.36,1", "expo.out"), overwrite: true })
        : gsap.to(stage, { ...off, duration: 0.7, ease: kfFx.ease("0.22,1,0.36,1", "expo.out"), overwrite: true });
    };
    const tick = () => {
      const y = scroller ? scroller.scrollTop : scrollY;
      if (y !== lastY) (down = y > lastY), (lastY = y);
      const r = seen(), now = inside ? r >= outAt : r >= inAt;
      if (now !== inside) { const first = inside === null; inside = now; show(now, first); }
      paint(active());
    };
    gsap.ticker.add(tick);
    tick();
    return () => {
      gsap.ticker.remove(tick);
      if (stage) gsap.set(stage, { clearProps: "opacity,visibility,transform" });
      zones.forEach((z) => z.classList.remove("is-off"));
      steps.forEach((s) => s.classList.remove("is-active"));
      delete el.dataset.activeStep;
    };
  });
})();
