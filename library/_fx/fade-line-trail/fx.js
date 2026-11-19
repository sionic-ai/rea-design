(() => {
  // Each frame, half-cover the canvas over the panel with the panel color (transparency per look) to erase past trails, and redraw a curve joining cursor points from the last life ms
  const LOOK = { dark: { fade: 0.5, width: 5, deep: true }, deep: { fade: 0.05, width: 5, deep: true }, light: { fade: 0.5, width: 2, deep: false } };
  const resolve = (host, value) => {
    const p = document.createElement("i");
    p.style.cssText = `position:absolute;visibility:hidden;color:${value}`;
    host.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  };
  kfFx.register("fade-line-trail", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const own = el.tagName !== "CANVAS";
    const host = own ? el : el.parentElement;
    if (!host) return;
    const look = LOOK[options.look] || LOOK.dark;
    const life = +(options.life ?? 400);
    const width = +(options.width ?? look.width);
    const fade = +(options.fade ?? look.fade);
    const canvas = own ? document.createElement("canvas") : el;
    if (own) {
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0";
      if (getComputedStyle(host).position === "static") host.style.position = "relative";
      host.prepend(canvas);
    }
    const ctx = canvas.getContext("2d");
    const cs = getComputedStyle(el);
    let line, fill;
    const paint = () => {
      const bg = getComputedStyle(host).backgroundColor;
      const clear = !bg || bg === "transparent" || /rgba\(.*,\s*0\)$/.test(bg);
      fill = cs.getPropertyValue("--fx-fill").trim() || (clear ? resolve(host, look.deep ? "var(--kf-contrast-bg)" : "var(--kf-bg)") : bg);
      line = cs.getPropertyValue("--fx-line").trim() || resolve(host, look.deep ? "oklch(from var(--kf-accent) calc(l * 0.38) c h)" : "var(--kf-accent)");
      if (cs.getPropertyValue("--fx-fill").trim()) fill = resolve(host, fill);
      if (cs.getPropertyValue("--fx-line").trim()) line = resolve(host, line);
    };
    paint();
    const size = () => { canvas.width = host.clientWidth; canvas.height = host.clientHeight; };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    let pts = [];
    const move = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      pts.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    };
    host.addEventListener("pointermove", move);
    let raf = 0, seen = true;
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(draw); });
    io.observe(host);
    function draw() {
      raf = 0;
      const now = performance.now();
      ctx.globalAlpha = fade;
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      pts = pts.filter((p) => now - p.t <= life);
      if (pts.length > 1) {
        ctx.strokeStyle = line;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
        const last = pts[pts.length - 1];
        ctx.quadraticCurveTo(last.x, last.y, last.x, last.y);
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.fillStyle = line;
        for (const p of pts) {
          const o = Math.max(0, 1 - (now - p.t) / life);
          ctx.globalAlpha = o;
          ctx.beginPath();
          ctx.arc(p.x, p.y, o, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (seen) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    const theme = new MutationObserver(paint);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); theme.disconnect();
      host.removeEventListener("pointermove", move);
      if (own) canvas.remove();
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
})();
