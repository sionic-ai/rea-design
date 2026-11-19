// Logo particle canvas next to the leader’s message — like the original (data-message-logo-canvas), it turns the logo into small letter particles per cell, and when the panel center rises above 80% of the screen
// Grains gather into place over 1.18s (each grain delayed 0–240ms, ease-out curve) from a far ring outside the screen (.58–.92× the long side). Within 56px of the mouse (40px for edge grains) they are pushed away 12px (7px)
(() => {
  const stage = document.querySelector("[data-message-stage]");
  const canvas = stage && stage.querySelector("canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const word = "studioNa", ratio = 158 / 27, DUR = 1180;
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  let w = 0, h = 0, dots = [], start = null, raf = 0, visible = false;
  const mouse = { on: false, x: 0, y: 0 };
  const ink = () => getComputedStyle(stage).color;
  const font = () => getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim() || "sans-serif";
  function layout() {
    const r = stage.getBoundingClientRect();
    w = Math.round(r.width); h = Math.round(r.height);
    if (!w || !h) return;
    const dpr = clamp(devicePixelRatio || 1, 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = w < 768 ? 34 : 72, lw = Math.min(w - 2 * pad, w < 768 ? 0.7 * w : 700), lh = lw / ratio;
    const lx = (w - lw) / 2, ly = h * 0.52 - lh / 2;
    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    const o = off.getContext("2d", { willReadFrequently: true });
    o.font = `700 ${lh * 1.25}px ${font()}`;
    o.textBaseline = "middle"; o.textAlign = "center";
    o.fillText(word, w / 2, ly + lh / 2, lw);
    const data = o.getImageData(0, 0, w, h).data;
    const step = Math.max(5, Math.round(lw / 110)), size = step * 1.15;
    const alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3]);
    dots = [];
    for (let y = Math.floor(ly - lh * 0.3); y < ly + lh * 1.3; y += step) {
      for (let x = Math.floor(lx); x < lx + lw; x += step) {
        if (alpha(x, y) < 90) continue;
        const a = Math.random() * Math.PI * 2, d = Math.max(w, h) * lerp(0.58, 0.92, Math.random());
        const edge = alpha(x - step, y) < 90 || alpha(x + step, y) < 90 || alpha(x, y - step) < 90 || alpha(x, y + step) < 90;
        dots.push({ ex: w / 2 + Math.cos(a) * d, ey: h * 0.52 + Math.sin(a) * d, tx: x, ty: y, delay: 240 * Math.random(), alpha: lerp(0.5, 0.95, Math.random()), size: Math.round(size * lerp(0.88, 1.06, Math.random())), edge });
      }
    }
    // Changing the font string is expensive — group by size and set it once per size
    dots.sort((a, b) => a.size - b.size);
  }
  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const t0 = reduce || start === null ? Infinity : now - start;
    let moving = false, cur = 0;
    const face = font();
    for (const d of dots) {
      if (d.size !== cur) { cur = d.size; ctx.font = `${cur}px ${face}`; }
      const p = reduce ? 1 : ease(clamp((t0 - d.delay) / DUR, 0, 1));
      if (p < 1) moving = true;
      let x = lerp(d.ex, d.tx, p), y = lerp(d.ey, d.ty, p);
      if (mouse.on && !reduce) {
        const dx = x - mouse.x, dy = y - mouse.y, dist = Math.hypot(dx, dy), r = d.edge ? 40 : 56;
        if (dist > 0 && dist < r) { const k = ease(1 - dist / r), push = d.edge ? 7 : 12; x += (dx / dist) * push * k; y += (dy / dist) * push * k; }
      }
      ctx.globalAlpha = d.alpha * (start === null && !reduce ? 0 : 1);
      ctx.fillText("n", x, y);
    }
    ctx.globalAlpha = 1;
    return moving;
  }
  // Like the original, while the panel is on screen it redraws every frame (even when still) — it rests when off screen
  let inView = false;
  const loop = (now) => { const moving = draw(now); raf = inView || moving || mouse.on ? requestAnimationFrame(loop) : 0; };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) kick(); }).observe(stage);
  const check = () => {
    if (visible) return;
    const r = stage.getBoundingClientRect();
    if (r.top + r.height * 0.5 <= innerHeight * 0.8 && r.bottom > 0) { visible = true; start = performance.now(); kick(); }
  };
  new ResizeObserver(() => { layout(); kick(); }).observe(stage);
  addEventListener("scroll", check, { passive: true });
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = canvas.getBoundingClientRect();
    mouse.on = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    if (mouse.on) kick();
  }, { passive: true });
  layout(); check(); kick();
})();
