// Work: orbit photos (speed 6 · spread 2.4/2.7 · wheel acceleration) and a step indicator nearest the screen center.
EF.page("services", { scroll: (box, k) => {
  // ── Orbit: each takes a share of the start angles and circles on a sin · cos ellipse. Speeds up by wheel deltaY/800, the orbit scatters by deltaY/40 then returns after 0.12s ──
  const zone = box.querySelector("[data-orbit]");
  const items = [...zone.querySelectorAll("[data-orbit-media]")];
  const speed = parseFloat(zone.dataset.orbitSpeed) || 3, sx = 2.4, sy = 2.7, rot = 20;
  const base = items.map((_, i) => (i / items.length) * Math.PI * 2);
  const jitter = items.map(() => (Math.random() - 0.5) / 2);
  const st = { acc: 0, ray: 0 };
  const qa = gsap.quickTo(st, "acc", { duration: 0.3, ease: "power1" });
  const qr = gsap.quickTo(st, "ray", { duration: 0.6, ease: "power1" });
  let extra = 0, settle = 0, W = innerWidth, H = innerHeight, on = false;
  const kick = (dy, a, r) => { qa(dy / a); qr(dy / r); clearTimeout(settle); settle = setTimeout(() => (qa(0), qr(0)), 120); };
  const tick = (t) => {
    extra += st.acc;
    items.forEach((el, i) => {
      const a = (t + extra) / speed + base[i];
      gsap.set(el, { x: (Math.sin(a) * W) / (sx + jitter[i] * st.ray), y: (Math.cos(a) * H) / (sy + jitter[i] * st.ray), rotate: jitter[i] * st.ray * rot });
    });
  };
  if (EF.reduce) tick(0);
  else {
    k.on(zone, "wheel", (e) => kick(e.deltaY, 800, 40), { passive: true });
    Observer.create({ target: zone, type: "touch", onChange: (s) => kick(s.deltaY, 200, 10) });
    k.on(window, "resize", () => ((W = innerWidth), (H = innerHeight)));
    const start = () => on || ((on = true), gsap.ticker.add(tick));
    const stop = () => on && ((on = false), gsap.ticker.remove(tick));
    ScrollTrigger.create({ trigger: zone, start: "top bottom", end: "bottom top", onEnter: start, onLeave: stop, onEnterBack: start, onLeaveBack: stop });
    start();
    k.add(() => (stop(), clearTimeout(settle)));
  }

  // ── Steps: the text block whose center is nearest the screen center is active, earlier ones are before, later ones are after
  const steps = [...box.querySelectorAll("[data-step]")];
  let cur = -1, queued = false;
  const update = () => {
    queued = false;
    const mid = innerHeight / 2;
    let best = 0, d = Infinity;
    steps.forEach((s, i) => { const r = s.querySelector("[data-step-anchor]").getBoundingClientRect(); const dd = Math.abs(mid - (r.top + r.height / 2)); if (dd < d) (d = dd), (best = i); });
    if (best === cur) return;
    cur = best;
    steps.forEach((s, i) => (s.dataset.status = i < best ? "before" : i > best ? "after" : "active"));
  };
  k.on(window, "scroll", () => queued || ((queued = true), requestAnimationFrame(update)), { passive: true });
  k.on(window, "resize", () => ((cur = -1), update()));
  update();
} });
