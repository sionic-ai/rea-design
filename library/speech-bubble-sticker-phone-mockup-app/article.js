(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (c, f) => (window.CustomEase ? CustomEase.get(`hm-${c}`) || CustomEase.create(`hm-${c}`, c) : f);
  const swing = ease("0.42,0,0.58,1", "sine.inOut");

  if (!reduce) {
    // Hero image sunset gradient starts off-position and settles into place over 5s · 3s (framer easeOut = 0,0,.58,1)
    const settle = (sel, from, to, dur) => {
      const g = document.querySelector(sel);
      if (g) gsap.fromTo(g, { attr: from }, { attr: to, duration: dur, ease: ease("0,0,0.58,1", "power1.out") });
    };
    settle("#hm-dusk-big", { x1: 100.435, y1: -80, x2: 200, y2: 200 }, { x1: 198.435, y1: 12.2318, x2: 226.662, y2: 234.768 }, 5);
    settle("#hm-dusk-small", { x1: 100.435, y1: -80, x2: 200, y2: 200 }, { x1: 64.955, y1: 162.041, x2: 53.0371, y2: 284.43 }, 3);

    // Three hearts on the thank-you card — a 2s back-and-forth bobbing 5px and tilting a few degrees, each with its own delay
    document.querySelectorAll(".hm-heart").forEach((h) => {
      const [y0, y1] = h.dataset.bob.split(",").map(Number), [r0, r1] = h.dataset.tilt.split(",").map(Number);
      gsap.fromTo(h, { y: y0, rotation: r0, transformOrigin: "50% 50%" }, { y: y1, rotation: r1, duration: 2, delay: +h.dataset.wait, ease: swing, repeat: -1, yoyo: true });
    });
  }

  // Closed-form solution of the framer-motion spring (mass · stiffness · damping) — if the direction changes midway, it carries over the current speed
  const solve = (k, c, m, from, to, v0) => {
    const d = to - from, w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return (t) => to - Math.exp(-z * w0 * t) * (((-v0 + z * w0 * d) / wd) * Math.sin(wd * t) + d * Math.cos(wd * t));
    }
    if (z === 1) return (t) => to - Math.exp(-w0 * t) * (d + (-v0 + w0 * d) * t);
    const wd = w0 * Math.sqrt(z * z - 1);
    return (t) => { const f = Math.min(wd * t, 300); return to - (Math.exp(-z * w0 * t) * ((-v0 + z * w0 * d) * Math.sinh(f) + wd * d * Math.cosh(f))) / wd; };
  };
  const spring = (state, to, cfg, put, delay = 0) => {
    state.raf && cancelAnimationFrame(state.raf);
    clearTimeout(state.wait);
    const go = () => {
      const from = state.x, v0 = state.v || 0;
      // Original framer (v4 · popmotion) threshold — stops when speed is under 2/s and the remaining distance is within (.01 if distance is 1 or less, .4 if larger)
      const restV = 2, restD = Math.abs(to - from) <= 1 ? 0.01 : 0.4;
      const x = solve(cfg.k, cfg.c, cfg.m, from, to, v0);
      // popmotion draws the first frame with a value already advanced by one frame (16.7ms), then advances by the gap between frames (capped at 40ms)
      let elapsed = 0, last = null;
      const step = (now) => {
        elapsed += last == null ? 1000 / 60 : Math.min(40, Math.max(1, now - last));
        last = now;
        const t = elapsed / 1000;
        state.x = x(t);
        state.v = (x(t + 0.005) - x(Math.max(0, t - 0.005))) / (t < 0.005 ? t + 0.005 : 0.01);
        const done = Math.abs(state.v) <= restV && Math.abs(to - state.x) <= restD && t > 0;
        if (done) { state.x = to; state.v = 0; }
        put(state.x, done);
        state.raf = done ? 0 : requestAnimationFrame(step);
      };
      state.raf = requestAnimationFrame(step);
    };
    if (delay) state.wait = setTimeout(go, delay * 1000); else go();
  };

  const HEIGHT = { m: 0.2, c: 18, k: 280 }, FADE = { m: 0.5, c: 18, k: 200 }, BAR = { m: 0.5, c: 20, k: 220 };
  document.querySelectorAll(".hm-faq__item").forEach((item) => {
    const q = item.querySelector("h5"), box = item.querySelector(".hm-faq__a"), fade = item.querySelector(".hm-faq__fade");
    const toggle = item.querySelector(".hm-faq__toggle"), [bar1, bar2] = toggle.querySelectorAll("i");
    const h = { x: 0 }, o = { x: 0 }, b = { x: 0 };
    let open = false;
    const flip = () => {
      open = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Collapse answer" : "Show answer");
      const full = box.scrollHeight;
      if (reduce) {
        box.style.height = open ? "auto" : "0px"; fade.style.opacity = open ? 1 : 0;
        bar1.style.transform = `rotate(${open ? 180 : 0}deg)`; bar2.style.transform = `translateX(6px) scale(${open ? 0 : 1}) rotate(${open ? 80 : 0}deg)`;
        return;
      }
      if (box.style.height === "auto") h.x = full;
      // At the open end release to auto so the answer isn’t cut off when the window width changes
      spring(h, open ? full : 0, HEIGHT, (v, done) => { box.style.height = done && open ? "auto" : `${Math.max(0, v)}px`; });
      spring(o, open ? 1 : 0, FADE, (v) => { fade.style.opacity = Math.min(1, Math.max(0, v)); }, open ? 0.1 : 0);
      spring(b, open ? 1 : 0, BAR, (v) => {
        bar1.style.transform = `rotate(${v * 180}deg)`;
        bar2.style.transform = `translateX(6px) scale(${Math.max(0, 1 - v)}) rotate(${v * 80}deg)`;
      });
    };
    q.addEventListener("click", flip);
    toggle.addEventListener("click", flip);
    toggle.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });
})();
