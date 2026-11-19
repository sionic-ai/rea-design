(() => {
  // Original Brand sign-up page right panel: stamps a 2px dot per 6px cell on a canvas, each dot on a 300ms tempo (start random per cell),
  // Redraws with opacity newly drawn between .04~.20 — looks like a still dot pattern but sparkles gently on close look.
  // Color is the skin’s text color (--kf-ink). Not repainted when off screen, in hidden tabs, or under reduced motion.
  kfFx.register("dot-shimmer-field", (el, { options, reduce }) => {
    const cell = +(options.cell || 6), dot = +(options.dot || 2), every = +(options.every || 300);
    const min = +(options.min ?? 0.04), span = +(options.span ?? 0.16);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fx-dsf";
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) { canvas.remove(); return; }
    let dots = [], w = 0, h = 0, raf = 0, seen = true, ink = "";
    const roll = () => min + Math.random() * span;
    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink;
      for (const d of dots) { ctx.globalAlpha = d.v; ctx.fillRect(d.x, d.y, dot, dot); }
      ctx.globalAlpha = 1;
    };
    const size = () => {
      w = el.clientWidth; h = el.clientHeight;
      if (!w || !h) return;
      const r = Math.min(devicePixelRatio || 1, 3);
      canvas.width = Math.round(w * r); canvas.height = Math.round(h * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
      ink = getComputedStyle(el).getPropertyValue("--kf-ink").trim() || getComputedStyle(el).color;
      const now = performance.now(), next = [];
      for (let y = 0; y < h; y += cell) for (let x = 0; x < w; x += cell) next.push({ x, y, v: roll(), at: now + Math.random() * every });
      dots = next;
      paint();
    };
    const tick = (now) => {
      let changed = false;
      for (const d of dots) if (now >= d.at) { d.v = roll(); d.at = Math.max(d.at + every, now); changed = true; }
      if (changed) paint();
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      cancelAnimationFrame(raf); raf = 0;
      if (!reduce && seen && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; run(); });
    io.observe(el);
    document.addEventListener("visibilitychange", run);
    size(); run();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", run); canvas.remove(); };
  });
})();
