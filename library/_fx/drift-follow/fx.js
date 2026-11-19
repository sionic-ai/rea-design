(() => {
  kfFx.register("drift-follow", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const min = +(options.min ?? 10), max = +(options.max ?? 14), dur = (+options.dur || 10.5) * 1000;
    const innerK = +(options.inner ?? 0.45), scale = +(options.scale ?? 1.08), followMax = +(options.follow ?? 18), ease = +(options.ease ?? 0.1);
    const area = (options.area && el.closest(options.area)) || el;
    // Only variables are written on the outer panel — fx.css moves the inner photo the opposite way with the same variables, so the photo’s style is untouched
    // A big wave + small wave per axis — period·size·phase vary a little each time it opens so the three don’t move together
    const axis = (phase) => {
      const d = rnd(min, max);
      return { a1: d * rnd(0.58, 0.72), w1: (Math.PI * 2) / (dur * rnd(0.92, 1.08)), p1: phase, a2: d * rnd(0.14, 0.24), w2: (Math.PI * 2) / (dur * rnd(1.45, 1.95)), p2: phase + rnd(-Math.PI * 0.7, Math.PI * 0.7) };
    };
    const px = rnd(0, Math.PI * 2);
    const ax = axis(px), ay = axis(px + rnd(Math.PI * 0.2, Math.PI * 0.8));
    const wave = (m, t) => Math.sin(t * m.w1 + m.p1) * m.a1 + Math.sin(t * m.w2 + m.p2) * m.a2;
    const off = Math.random() * dur;
    let fx = 0, fy = 0, tx = 0, ty = 0, raf = 0, last = 0;
    const move = (e) => {
      if (!followMax) return;
      const r = area.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2))) * followMax;
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2))) * followMax;
    };
    const leave = () => { tx = 0; ty = 0; };
    const frame = (now) => {
      const k = last ? Math.min(3, Math.max(1, (now - last) / 16.67)) : 1;
      last = now;
      const t = now + off;
      fx += (tx - fx) * Math.min(1, ease * k);
      fy += (ty - fy) * Math.min(1, ease * k);
      el.style.setProperty("--fx-drift-x", `${wave(ax, t).toFixed(2)}px`);
      el.style.setProperty("--fx-drift-y", `${wave(ay, t).toFixed(2)}px`);
      area.style.setProperty("--fx-follow-x", `${fx.toFixed(2)}px`);
      area.style.setProperty("--fx-follow-y", `${fy.toFixed(2)}px`);
      raf = requestAnimationFrame(frame);
    };
    if (options.inner != null) el.style.setProperty("--fx-inner", innerK);
    if (options.scale != null) el.style.setProperty("--fx-scale", scale);
    raf = requestAnimationFrame(frame);
    if (hover) { area.addEventListener("pointermove", move); area.addEventListener("pointerleave", leave); }
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
      for (const v of ["--fx-drift-x", "--fx-drift-y", "--fx-inner", "--fx-scale"]) el.style.removeProperty(v);
      area.style.removeProperty("--fx-follow-x");
      area.style.removeProperty("--fx-follow-y");
    };
  });
})();
