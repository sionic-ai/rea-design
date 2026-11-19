(() => {
  // A rounded-rectangle path around an element (outside by gap) — the original reel badge is a 304×182 path with 12px outside and radius 30 around a 280×157.5 card
  const roundRect = (w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    return `M${r} ${h}H${w - r}C${w - r * 0.45} ${h} ${w} ${h - r * 0.45} ${w} ${h - r}V${r}C${w} ${r * 0.45} ${w - r * 0.45} 0 ${w - r} 0H${r}C${r * 0.45} 0 0 ${r * 0.45} 0 ${r}V${h - r}C0 ${h - r * 0.45} ${r * 0.45} ${h} ${r} ${h}Z`;
  };

  kfFx.register("border-orbit-text", (el, { options, reduce }) => {
    const src = el.querySelector('[data-fx-part="text"]');
    const text = (src?.textContent || options.text || "").replace(/\s+/g, " ").trim();
    if (!text) return;
    const dur = +(options.dur ?? 12);
    const each = +(options.each ?? 0.12);
    const gap = +(options.gap ?? 12);
    const radius = +(options.radius ?? 30);
    const unit = `${text} • `;
    const count = Math.max(unit.length, Math.floor(dur / Math.max(each, 0.01)) - 2);
    const chars = [];
    while (chars.length < count) chars.push(...unit);
    chars.length = Math.floor(chars.length / unit.length) * unit.length || unit.length;

    const ring = document.createElement("span");
    ring.setAttribute("data-fx-part", "ring");
    ring.setAttribute("aria-hidden", "true");
    ring.style.cssText = `--fx-dur: ${dur}s; left: ${-gap}px; top: ${-gap}px`;
    chars.forEach((c, i) => {
      const s = document.createElement("span");
      s.setAttribute("data-fx-part", "char");
      s.textContent = c;
      s.style.animationDelay = `${(i * each).toFixed(2)}s`;
      if (reduce) s.style.offsetDistance = `${(i / chars.length) * 100}%`;
      ring.append(s);
    });
    const wasHidden = src?.hidden;
    if (src) src.hidden = true;
    el.append(ring);
    const size = () => {
      const w = el.offsetWidth + gap * 2, h = el.offsetHeight + gap * 2;
      if (w > gap * 2) ring.style.setProperty("--fx-path", `path("${roundRect(w, h, radius)}")`);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    return () => { ro.disconnect(); ring.remove(); if (src) src.hidden = !!wasHidden; };
  });
})();
