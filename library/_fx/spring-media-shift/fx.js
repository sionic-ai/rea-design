(() => {
  /* While more than half the slot is visible, moving the cursor anywhere in the document shifts the inner image (media) by (cursor − slot center) × strength
     Follows with a damped spring (stiffness 200, damping 40, mass 1 — settles around .3s without overshoot). When the cell leaves the screen it returns to 0 */
  kfFx.register("spring-media-shift", (el, { options, reduce, hover }) => {
    const media = el.querySelector('[data-fx-part="media"]') || el;
    if (reduce || !hover) return;
    const strength = +(options.strength ?? 0.03);
    const k = +(options.k ?? 200), c = +(options.c ?? 40), m = +options.m || 1;
    const s = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    let seen = false, last = 0;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (!seen) { s.tx = s.ty = 0; }
    }, { threshold: 0.5 });
    io.observe(el);
    const onMove = (e) => {
      if (!seen) return;
      const r = el.getBoundingClientRect();
      s.tx = (e.clientX - (r.left + r.width / 2)) * strength;
      s.ty = (e.clientY - (r.top + r.height / 2)) * strength;
    };
    const tick = () => {
      /* Integrates wall-clock time in slices of 8ms or less — even if frames are late it arrives on time like the original spring */
      const now = performance.now();
      if (!last) last = now;
      let rem = Math.min(0.5, Math.max(1, now - last) / 1000);
      last = now;
      while (rem > 0) {
        const h = Math.min(rem, 0.008);
        s.vx += ((k * (s.tx - s.x) - c * s.vx) / m) * h;
        s.vy += ((k * (s.ty - s.y) - c * s.vy) / m) * h;
        s.x += s.vx * h;
        s.y += s.vy * h;
        rem -= h;
      }
      /* Like framer-motion, snap to the target within .5px and 2px per second (restDelta .5 · restSpeed 2) */
      if (Math.abs(s.tx - s.x) < 0.5 && Math.abs(s.vx) < 2) { s.x = s.tx; s.vx = 0; }
      if (Math.abs(s.ty - s.y) < 0.5 && Math.abs(s.vy) < 2) { s.y = s.ty; s.vy = 0; }
      if (Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.vx) + Math.abs(s.vy) < 0.01 && !s.tx && !s.ty) return;
      gsap.set(media, { x: s.x, y: s.y });
    };
    document.addEventListener("mousemove", onMove);
    gsap.ticker.add(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      gsap.ticker.remove(tick);
      io.disconnect();
      gsap.set(media, { clearProps: "transform" });
    };
  });
})();
