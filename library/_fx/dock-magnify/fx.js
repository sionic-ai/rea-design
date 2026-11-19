// Dock magnification — looks only at horizontal distance from the cursor (shrinks linearly within the radius) and scales items from the bottom. Cell positions stay as they are
// Items before it push sideways by the amount they grew (--fx-x) and the line widens by the same amount (--fx-spread). Size follows by integrating a spring in 4ms steps
(() => {
  kfFx.register("dock-magnify", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (reduce || !hover || !items.length) return;
    const max = +(options.scale ?? 1.6), reach = +(options.distance ?? 100) || 100;
    const k = +(options.stiffness ?? 277) || 277, c = +(options.damping ?? 12), m = +(options.mass ?? 0.1) || 0.1;
    const curve = options.falloff === "smooth" ? (t) => t * t * (3 - 2 * t) : (t) => t;
    let base = items[0].offsetWidth || 1, px = null, running = false;
    const st = items.map(() => ({ s: base, v: 0 }));
    const want = (it) => (px === null ? base : base * (1 + (max - 1) * curve(Math.max(0, 1 - Math.abs(px - (el.getBoundingClientRect().left + it.offsetLeft + base / 2)) / reach))));
    const paint = () => {
      const extra = st.map((p) => p.s - base), total = extra.reduce((a, b) => a + b, 0), rest = st.every((p) => Math.abs(p.s - base) < 0.01);
      rest ? el.style.removeProperty("--fx-spread") : el.style.setProperty("--fx-spread", `${total}px`);
      let run = 0;
      items.forEach((it, i) => {
        if (rest) { it.style.removeProperty("--fx-scale"); it.style.removeProperty("--fx-x"); }
        else { it.style.setProperty("--fx-scale", String(st[i].s / base)); it.style.setProperty("--fx-x", `${run + extra[i] / 2 - total / 2}px`); }
        run += extra[i];
      });
    };
    // A stiff spring (ω≈53rad/s) blows up if integrated in one frame — split it into 4ms steps
    const tick = (t, dt) => {
      const span = Math.min(Math.max(dt, 1), 64), n = Math.ceil(span / 4), h = span / 1000 / n, goal = items.map(want);
      let moving = false;
      st.forEach((p, i) => {
        for (let j = 0; j < n; j++) { p.v += ((k * (goal[i] - p.s) - c * p.v) / m) * h; p.s += p.v * h; }
        if (Math.abs(goal[i] - p.s) > 0.01 || Math.abs(p.v) > 0.01) moving = true; else { p.s = goal[i]; p.v = 0; }
      });
      paint();
      if (!moving && px === null) { running = false; gsap.ticker.remove(tick); }
    };
    const wake = () => { if (!running) { running = true; gsap.ticker.add(tick); } };
    const move = (e) => { if (e.pointerType !== "mouse") return; base = items[0].offsetWidth || base; px = e.clientX; wake(); };
    const out = () => { px = null; wake(); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", out);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", out);
      gsap.ticker.remove(tick);
      el.style.removeProperty("--fx-spread");
      items.forEach((it) => { it.style.removeProperty("--fx-scale"); it.style.removeProperty("--fx-x"); });
    };
  });
})();
