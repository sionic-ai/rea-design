// The same picture repeats every text width (textW), so the traveled distance keeps only the remainder after dividing by textW — the number doesn’t grow even if left on for a long time
(() => {
  kfFx.register("frame-text-ring", (el, { options, reduce }) => {
    const label = String(options.text ?? el.getAttribute("aria-label") ?? "").trim();
    if (!label) return;
    const text = `${label}    `;
    const speed = +(options.speed ?? 50), spMul = +(options.sp ?? 0.8), margin = +(options.margin ?? 18), size = +(options.size ?? 10);
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const canvas = document.createElement("canvas");
    canvas.className = "fx-ring";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    let offset = 0, last = 0, textW = 1, dpr = 1, raf = 0;
    const narrow = () => innerWidth <= 767;
    const resize = () => {
      const r = el.getBoundingClientRect();
      dpr = devicePixelRatio || 1;
      canvas.width = Math.max(1, r.width * dpr); canvas.height = Math.max(1, r.height * dpr);
      const cs = getComputedStyle(el);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `700 ${size}px ${cs.getPropertyValue("--kf-font-display").trim() || "sans-serif"}`;
      ctx.fillStyle = cs.getPropertyValue("--kf-accent").trim() || cs.color;
      textW = ctx.measureText(text).width || 1;
    };
    const line = (x, y, angle, length, reverse) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      for (let pos = reverse ? offset - textW : -offset; pos < length; pos += textW) ctx.fillText(text, pos, 0);
      ctx.restore();
    };
    const draw = (now) => {
      if (!last) last = now;
      const dt = Math.max(0, (now - last) / 1000);
      last = now;
      if (!reduce) offset = (offset + speed * (narrow() ? spMul : 1) * dt) % textW;
      const w = canvas.width / dpr, h = canvas.height / dpr, iw = w - margin * 2, ih = h - margin * 2;
      ctx.clearRect(0, 0, w, h);
      const four = !narrow() && options.sides !== "lr";
      if (four) line(margin, margin, 0, iw, false);
      line(w - margin, margin, Math.PI / 2, ih, false);
      if (four) line(margin, h - margin + size, 0, iw, true);
      line(margin, h - margin, -Math.PI / 2, ih, false);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(performance.now()); });
    ro.observe(el);
    resize();
    document.fonts?.ready.then(() => { if (canvas.isConnected) resize(); });
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); canvas.remove(); };
  });
})();
