(() => {
  // A single character (a symbol like an asterisk) always spins around the center of its ink, speeds up as much as you scroll, then returns to its own speed.
  // The center of a font box isn’t the center of the glyph (the asterisk floats up), so draw it on a canvas with the same font and measure the center of the inked cells
  kfFx.register("glyph-spin-scroll", (el, { options, reduce, scroller }) => {
    const glyph = el.textContent.trim();
    if (!glyph) return;
    const base = +(options.speed ?? -32), gain = +(options.gain ?? 0.5), back = +(options.back ?? 1.6);
    const lo = +(options.min ?? -170), hi = +(options.max ?? -9);
    const cv = document.createElement("canvas"), g = cv.getContext("2d", { willReadFrequently: true });
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;overflow:hidden";
    const measure = () => {
      if (!g || !el.isConnected) return;
      const keep = el.style.transform;
      el.style.transform = "none";
      const cs = getComputedStyle(el), size = parseFloat(cs.fontSize) || 64;
      el.insertBefore(probe, el.firstChild);
      const box = el.getBoundingClientRect(), base0 = probe.getBoundingClientRect();
      probe.remove();
      const left = base0.left - box.left, baseline = base0.bottom - box.top, f = Math.ceil(size * 2.2);
      cv.width = cv.height = f;
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      g.textAlign = "left";
      g.textBaseline = "alphabetic";
      const ox = Math.floor(f * 0.25), oy = Math.floor(f * 0.7);
      g.clearRect(0, 0, f, f);
      g.fillText(glyph, ox, oy);
      const d = g.getImageData(0, 0, f, f).data;
      let x0 = f, x1 = -1, y0 = f, y1 = -1;
      for (let y = 0; y < f; y++) for (let x = 0; x < f; x++) if (d[(y * f + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= x0 && y1 >= y0) el.style.transformOrigin = `${(left + ((x0 + x1) / 2 - ox)).toFixed(2)}px ${(baseline + ((y0 + y1) / 2 - oy)).toFixed(2)}px`;
      el.style.transform = keep;
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (reduce) return () => { ro.disconnect(); el.style.transformOrigin = ""; };
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    let speed = base, angle = 0, last = pos();
    const tick = (_, dtMs) => {
      const dt = Math.max(0, dtMs) / 1000, now = pos(), dy = now - last;
      last = now;
      speed = gsap.utils.clamp(lo, hi, speed - dy * gain + (base - speed) * (1 - Math.exp(-dt * back)));
      angle += speed * dt;
      el.style.transform = `rotate(${angle}deg)`;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); ro.disconnect(); el.style.transform = el.style.transformOrigin = ""; };
  });
})();
