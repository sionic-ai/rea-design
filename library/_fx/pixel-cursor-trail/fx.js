(() => {
  // Splits the element (by default a panel covering the whole screen) into cells of size px, paints cells the mouse passes over in the accent color, and erases them linearly over fade ms.
  // Runs rAF only while cells remain to paint — draws nothing when still. Not enabled on devices without a pointer or with reduced motion.
  kfFx.register("pixel-cursor-trail", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const num = (k, d) => { const v = parseFloat(options[k]); return Number.isFinite(v) ? v : d; };
    const size = num("size", 10) || 10, fade = Math.max(1, num("fade", 500)), delay = num("delay", 0);
    const colorVar = options.color || "--kf-accent";
    const cv = document.createElement("canvas");
    cv.className = "fx-pixel-cursor-trail__gl";
    cv.setAttribute("aria-hidden", "true");
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    el.prepend(cv);
    const cells = new Map();
    let raf = 0, W = 0, H = 0, color = "";
    const fit = () => {
      W = el.clientWidth; H = el.clientHeight;
      cv.width = W; cv.height = H;
      color = getComputedStyle(el).getPropertyValue(colorVar).trim() || getComputedStyle(el).color;
    };
    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      cells.forEach((c, k) => {
        const age = now - c.t - delay;
        if (age < 0) return;
        if (age >= fade) { cells.delete(k); return; }
        ctx.globalAlpha = 1 - age / fade;
        ctx.fillRect(c.x * size, c.y * size, size, size);
      });
      ctx.globalAlpha = 1;
      raf = cells.size ? requestAnimationFrame(draw) : 0;
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) / size), y = Math.floor((e.clientY - r.top) / size);
      if (x < 0 || y < 0 || x >= Math.ceil(W / size) || y >= Math.ceil(H / size)) return;
      cells.set(`${x}-${y}`, { x, y, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    addEventListener("mousemove", move);
    return () => {
      removeEventListener("mousemove", move);
      ro.disconnect();
      cancelAnimationFrame(raf);
      cv.remove();
    };
  });
})();
