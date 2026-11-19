(() => {
  // Original (Framer ”Cursor Image Trail”, frequency 10): each time the cursor moves 163px over the panel, one photo is placed at the cursor’s spot —
  // Turns on from transparent and .5x with a spring (stiffness 500 · damping 60 · mass 1), and 1 second later disappears with the same spring back to transparent and .5x. The photo set is reused
  const springOf = (k, c, m) => {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    let x;
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t)); }
    else if (z === 1) x = (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    else { const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1)); x = (t) => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1); }
    let T = 0.02;
    for (let t = 0.02; t < 4; t += 0.01) if (Math.abs(1 - x(t)) > 0.002) T = t + 0.01;
    const end = x(T);
    return { duration: T, ease: (p) => (p >= 1 ? 1 : x(p * T) / end) };
  };
  kfFx.register("spring-photo-trail", (el, { options, reduce, hover }) => {
    const srcs = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!srcs.length || reduce || !hover || !window.gsap) return;
    const sp = springOf(+(options.k || 500), +(options.c || 60), +(options.m || 1));
    const gap = +(options.gap ?? 163), stay = +(options.stay ?? 1), from = +(options.scale ?? 0.5);
    const layer = document.createElement("div");
    layer.setAttribute("data-fx-part", "layer");
    el.append(layer);
    let last = null, n = 0;
    const timers = new Set();
    const drop = (x, y) => {
      const p = srcs[n++ % srcs.length].cloneNode(true);
      p.removeAttribute("data-fx-part");
      p.classList.add("fx-trail-item");
      p.style.left = `${x}px`; p.style.top = `${y}px`;
      layer.append(p);
      gsap.fromTo(p, { opacity: 0, scale: from, xPercent: -50, yPercent: -50 }, { opacity: 1, scale: 1, duration: sp.duration, ease: sp.ease });
      const t = setTimeout(() => { timers.delete(t); gsap.to(p, { opacity: 0, scale: from, duration: sp.duration, ease: sp.ease, onComplete: () => p.remove() }); }, stay * 1000);
      timers.add(t);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (!last || Math.hypot(x - last.x, y - last.y) > gap) { last = { x, y }; drop(x, y); }
    };
    const leave = () => { last = null; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); timers.forEach(clearTimeout); gsap.killTweensOf(layer.children); layer.remove(); };
  });
})();
