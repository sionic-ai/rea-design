(() => {
  // One big character (data-fx-part="shape" …its text) is drawn to fill the panel, only the opaque cells are picked at step intervals, and a small character (cell) is stamped on each one.
  // Once attached, small letters start 0 to .5s late from anywhere in the panel and gather into place over the gather duration with power3.out,
  // Letters within radius of the cursor and of a virtual point drifting on its own grow up to max times by (1 − distance/radius)² (the Hero character mosaic of a reference site).
  kfFx.register("glyph-mosaic", (el, { options, reduce, hover }) => {
    const shapeEl = el.querySelector('[data-fx-part="shape"]');
    const glyph = (shapeEl?.textContent || "").trim();
    if (!glyph) return;
    const cell = options.cell || glyph;
    const step = +options.step || (hover ? 20 : 27), font = +options.size || (hover ? 30 : 27);
    const radius = +options.radius || 160, max = +(options.max ?? (hover ? 4 : 3.5));
    const gather = +(options.gather ?? 3), top = options.top === undefined ? null : +options.top;
    const mirror = options.mirror === "1" || options.mirror === "true";
    const weight = options.weight || "900";
    const cv = document.createElement("canvas");
    cv.className = "fx-glyph-mosaic";
    cv.setAttribute("aria-hidden", "true");
    if (mirror) cv.style.transform = "scaleX(-1)";
    el.prepend(cv);
    el.classList.add("fx-glyph-mosaic--on");
    const ctx = cv.getContext("2d");
    const css = () => {
      const cs = getComputedStyle(el);
      return { color: cs.getPropertyValue("--fx-glyph").trim() || cs.color, family: cs.getPropertyValue("--kf-font-display").trim() || "sans-serif" };
    };
    let w = 0, h = 0, pts = [], tweens = [], raf = 0, seen = false, t0 = 0;
    const mouse = { x: 0, y: 0, on: false }, auto = { x: 0, y: 0 };
    const sample = () => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
      const x = c.getContext("2d", { willReadFrequently: true });
      const { family } = css();
      // Find the largest font size that fits the panel width and height by bisection
      let lo = 1, hi = Math.min(w, h), size = 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        x.font = `${weight} ${mid}px ${family}`;
        if (x.measureText(glyph).width <= w && mid <= h) { size = mid; lo = mid + 1; } else hi = mid - 1;
      }
      x.font = `${weight} ${size}px ${family}`;
      x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(glyph, w / 2, h / 2);
      const d = x.getImageData(0, 0, c.width, c.height).data, out = [];
      for (let y = 0; y < c.height; y += step) for (let xx = 0; xx < c.width; xx += step) if (d[(y * c.width + xx) * 4 + 3] > 128) out.push({ x: xx, y });
      return out;
    };
    const build = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = r.width; h = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tweens.forEach((t) => t.kill());
      const shape = sample();
      if (!shape.length) { pts = []; return; }
      // With top, pins the shape’s upper edge to that px on the stage (original 40 — only the top part peeks in below the hero)
      const lift = top === null ? 0 : Math.min(...shape.map((p) => p.y)) - top;
      pts = shape.map((p) => ({ x: reduce ? p.x : Math.random() * w, y: reduce ? p.y - lift : Math.random() * h, tx: p.x, ty: p.y - lift }));
      if (!reduce) tweens = pts.map((p) => gsap.to(p, { x: p.tx, y: p.ty, delay: Math.random() * 0.5, duration: gather, ease: "power3.out" }));
      if (!raf) draw(performance.now());
    };
    const k = (px, py, mx, my) => { const f = Math.max(0, 1 - Math.hypot(px - mx, py - my) / radius); return 1 + (max - 1) * f * f; };
    const draw = (now) => {
      const s = (now - t0) / 1000;
      // A virtual dot circling alone — moves slowly around the board center at .35 width horizontally and .35 vertically
      auto.x = w - w * (0.5 + 0.35 * Math.cos(s * 0.6));
      auto.y = h * (0.5 + 0.35 * Math.sin(s * 0.8));
      const { color, family } = css();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      // Set the font once and scale with a transform — changing ctx.font per character reruns font parsing hundreds of times and makes interaction response slow
      ctx.font = `bold ${font}px ${family}`;
      const dpr = cv.width / Math.max(w, 1);
      for (const p of pts) {
        const g = reduce ? 1 : Math.max(mouse.on ? k(p.x, p.y, mouse.x, mouse.y) : 1, k(p.x, p.y, auto.x, auto.y));
        ctx.setTransform(dpr * g, 0, 0, dpr * g, dpr * p.x, dpr * p.y);
        ctx.fillText(cell, 0, 0);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      raf = seen && !reduce ? requestAnimationFrame(draw) : 0;
    };
    const move = (cx, cy) => {
      const r = cv.getBoundingClientRect();
      mouse.x = mirror ? r.width - (cx - r.left) : cx - r.left;
      mouse.y = cy - r.top;
      mouse.on = true;
    };
    const onMove = (e) => move(e.clientX, e.clientY);
    const onLeave = () => (mouse.on = false);
    const onTouch = (e) => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    if (!hover) addEventListener("touchmove", onTouch, { passive: true });
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf) raf = requestAnimationFrame(draw);
    }, { threshold: 0.01 });
    io.observe(el);
    const ro = new ResizeObserver(() => { if (Math.abs(el.getBoundingClientRect().width - w) > 1 || Math.abs(el.getBoundingClientRect().height - h) > 1) build(); });
    ro.observe(el);
    t0 = performance.now();
    document.fonts?.ready.then(() => cv.isConnected && build());
    build();
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect(); ro.disconnect();
      tweens.forEach((t) => t.kill());
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      removeEventListener("touchmove", onTouch);
      cv.remove();
      el.classList.remove("fx-glyph-mosaic--on");
    };
  });
})();
