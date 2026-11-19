(() => {
  // Original V2CtaLineUp: lines up the scattered items in order of center x and sends each to its i-th slot (when there are more items than slots they overlap at the last slot).
  // Lines up when the section is 50% visible and scatters again when it drops below 12% — two thresholds so it doesn’t flicker going up and down.
  kfFx.register("seat-line-up", (el, { options, reduce }) => {
    const fliers = [...el.querySelectorAll('[data-fx-part="flier"]')];
    const seats = [...el.querySelectorAll('[data-fx-part="seat"]')];
    if (!fliers.length || !seats.length) return;
    const on = +(options.on ?? 0.5), off = +(options.off ?? 0.12);
    const set = (k, v) => el.style.setProperty(k, v);
    if (options.dur != null) set("--fx-dur", `${+options.dur}s`);
    if (options.each != null) set("--fx-each", `${+options.each * 1000}ms`);
    if (options.hop != null) set("--fx-hop", `${+options.hop}s`);

    const measure = () => {
      const field = fliers[0].offsetParent;
      if (!field) return;
      const box = field.getBoundingClientRect();
      const rects = seats.map((s) => s.getBoundingClientRect());
      const at = fliers.map((f, k) => ({ k, x: f.offsetLeft, y: f.offsetTop, w: f.offsetWidth || 1 }));
      [...at].sort((a, b) => a.x + a.w / 2 - (b.x + b.w / 2)).forEach((f, n) => {
        const r = rects[Math.min(n, rects.length - 1)];
        const s = fliers[f.k].style;
        s.setProperty("--to-x", `${(r.left + r.width / 2 - box.left - (f.x + f.w / 2)).toFixed(1)}px`);
        s.setProperty("--to-y", `${(r.top + r.height / 2 - box.top - (f.y + f.w / 2)).toFixed(1)}px`);
        s.setProperty("--to-s", (r.width / f.w).toFixed(3));
        s.setProperty("--i", String(n));
      });
    };

    if (reduce) { measure(); el.setAttribute("data-lined", ""); }
    const io = new IntersectionObserver(([e]) => {
      const lined = el.hasAttribute("data-lined");
      if (e.intersectionRatio >= on && !lined) { measure(); el.setAttribute("data-lined", ""); }
      else if (e.intersectionRatio < off && lined && !reduce) el.removeAttribute("data-lined");
    }, { threshold: [0, off, on] });
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      io.disconnect(); ro.disconnect();
      el.removeAttribute("data-lined");
      for (const f of fliers) ["--to-x", "--to-y", "--to-s", "--i"].forEach((k) => f.style.removeProperty(k));
    };
  });
})();
