(() => {
  // Eyes inside the letters — if the cursor moved within the last 1.8 seconds they look toward it (following fast), otherwise they look around slowly with two sines, glancing down once every 5~11 seconds.
  // Blink is 190ms (close → open, closing fast and opening slowly) every 2.2~6.4s, with 28% of them being two in a row. The exact values of the original headline eye.
  kfFx.register("idle-blink-eyes", (el, { options, reduce }) => {
    const eyes = [...el.querySelectorAll('[data-fx-part="eye"]')].map((eye) => ({
      eye, pupil: eye.querySelector('[data-fx-part="pupil"]'), lid: eye.querySelector('[data-fx-part="lid"]'), gx: 0, gy: -0.3, ax: 0, ay: -0.3,
    })).filter((e) => e.pupil);
    if (!eyes.length) return;
    const size = +(options.size ?? 0.54), blinkMs = +(options.blink ?? 190) || 190, chase = +(options.chase ?? 15), idle = +(options.idle ?? 6.5);
    const reach = +(options.reach ?? 9) || 9, gain = +(options.gain ?? 1.5), hold = +(options.hold ?? 1800);
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const paint = () => {
      for (const e of eyes) {
        const r = e.eye.getBoundingClientRect();
        e.pupil.style.setProperty("--px", `${(e.gx * (r.width * (1 - size)) / 2).toFixed(2)}px`);
        e.pupil.style.setProperty("--py", `${(e.gy * (r.height - r.width * size) / 2).toFixed(2)}px`);
      }
    };
    if (reduce) {
      paint();
      return () => eyes.forEach((e) => { e.pupil.style.removeProperty("--px"); e.pupil.style.removeProperty("--py"); });
    }

    let ptr = null, ptrAt = -Infinity;
    const onMove = (ev) => { ptr = { x: ev.clientX, y: ev.clientY }; ptrAt = performance.now(); };
    addEventListener("pointermove", onMove, { passive: true });
    let nextBlink = 900 + Math.random() * 2600, left = 0, again = 0, nextTwitch = 1400, wx = 0, wy = 0, nextGlance = 2600, glance = 0;
    let last = performance.now(), clock = 0, raf = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0, now - last) / 1000);
      last = now; clock += dt * 1000;
      if (left > 0) { left -= dt * 1000; if (left <= 0 && again > 0) { again--; left = blinkMs; } }
      else if (clock > nextBlink) { left = blinkMs; again = Math.random() < 0.28 ? 1 : 0; nextBlink = clock + 2200 + Math.random() * 4200; }
      const w = left > 0 ? 1 - Math.abs(left / blinkMs - 0.5) * 2 : 0;
      const shut = left > 0 ? Math.pow(w, left > blinkMs / 2 ? 0.6 : 1.4) : 0;
      const live = ptr && now - ptrAt < hold;
      if (!live) {
        wx = Math.sin(clock * 0.00047) * 0.34 + Math.sin(clock * 0.00121) * 0.12;
        wy = Math.sin(clock * 0.00039 + 1.7) * 0.2;
        if (clock > nextTwitch) { nextTwitch = clock + 1200 + Math.random() * 2400; wx += (Math.random() - 0.5) * 0.5; }
        if (glance > 0) glance -= dt; else if (clock > nextGlance) { glance = 1.1 + Math.random() * 0.9; nextGlance = clock + 5000 + Math.random() * 6000; }
        const down = glance > 0 ? Math.min(1, glance * 1.6) : 0;
        for (const e of eyes) { e.ax = wx * (1 - down * 0.6); e.ay = wy - 0.22 - down * 0.72; }
      }
      const k = 1 - Math.exp(-dt * (live ? chase : idle));
      for (const e of eyes) {
        const r = e.eye.getBoundingClientRect();
        if (live) {
          const dx = ptr.x - (r.left + r.width / 2), dy = ptr.y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, v = Math.min(1, d / (r.width * reach));
          e.ax = clamp((dx / d) * v * gain, -1, 1);
          e.ay = clamp((dy / d) * v * gain, -1, 1);
        }
        e.gx += (e.ax - e.gx) * k;
        e.gy += (e.ay - e.gy) * k;
        e.pupil.style.setProperty("--px", `${(e.gx * (r.width * (1 - size)) / 2).toFixed(2)}px`);
        e.pupil.style.setProperty("--py", `${(e.gy * (r.height - r.width * size) / 2).toFixed(2)}px`);
        e.lid?.style.setProperty("--lid", `${(shut * 100).toFixed(1)}%`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      for (const e of eyes) { e.pupil.style.removeProperty("--px"); e.pupil.style.removeProperty("--py"); e.lid?.style.removeProperty("--lid"); }
    };
  });
})();
