(() => {
  // The original makes a single strip image of nine people walk as a 29-cell sprite (1.2s steps(29)), and pulls the whole strip from one panel left outside to the right (20s linear).
  // Draw a flat person on a canvas with no image file to get the same tempo — steps are cut per cell, while the flow continues every frame.
  const css = (el, name, d) => getComputedStyle(el).getPropertyValue(name).trim() || d;
  const num = (el, name, d) => { const v = parseFloat(css(el, name, "")); return Number.isFinite(v) ? v : d; };

  // People within one strip (strip height : 1) — x position, height, clothing type (0 pants, 1 skirt, 2 bag), color slot index, walk phase
  const PEOPLE = [
    [0.035, 0.9, 1, [1, 3, 2], 0.0],
    [0.15, 0.92, 0, [3, 0, 2], 0.42],
    [0.27, 0.88, 1, [0, 2, 3], 0.15],
    [0.385, 0.95, 2, [3, 0, 1], 0.6],
    [0.5, 0.9, 0, [2, 1, 0], 0.3],
    [0.615, 0.93, 0, [0, 3, 0], 0.78],
    [0.725, 0.9, 1, [2, 4, 1], 0.5],
    [0.835, 0.96, 0, [1, 1, 2], 0.08],
    [0.94, 0.89, 0, [4, 2, 3], 0.66],
  ];

  function walker(ctx, x, h, kind, col, phase, pal) {
    const s = h * 0.88, ground = h * 0.97;
    const swing = Math.sin(phase * Math.PI * 2);
    const lift = Math.abs(Math.cos(phase * Math.PI * 2));
    const hipY = ground - s * 0.46, shY = ground - s * 0.8;
    const body = pal[col[0]], legs = pal[col[1]], shoe = pal[col[2]];
    ctx.lineCap = "round";
    // Two legs — swing alternately front and back
    const leg = (dir, c) => {
      const a = swing * 0.42 * dir;
      const kx = x + Math.sin(a) * s * 0.22, ky = hipY + Math.cos(a) * s * 0.22;
      const fx = kx + Math.sin(a + (dir * swing < 0 ? 0.35 : 0)) * s * 0.22, fy = Math.min(ground - s * 0.02, ky + s * 0.23 - (dir * swing < 0 ? lift * s * 0.03 : 0));
      ctx.strokeStyle = c; ctx.lineWidth = s * 0.075;
      ctx.beginPath(); ctx.moveTo(x, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.strokeStyle = shoe; ctx.lineWidth = s * 0.05;
      ctx.beginPath(); ctx.moveTo(fx - s * 0.02, fy + s * 0.01); ctx.lineTo(fx + s * 0.06, fy + s * 0.015); ctx.stroke();
    };
    leg(-1, legs);
    leg(1, legs);
    // One arm (back) — opposite to the leg
    const arm = (dir) => {
      const a = -swing * 0.5 * dir;
      ctx.strokeStyle = pal.skin; ctx.lineWidth = s * 0.045;
      ctx.beginPath(); ctx.moveTo(x, shY + s * 0.03); ctx.lineTo(x + Math.sin(a) * s * 0.28, shY + Math.cos(a) * s * 0.28); ctx.stroke();
    };
    arm(-1);
    // Body — the skirt is a trapezoid flaring downward
    ctx.fillStyle = body;
    ctx.beginPath();
    if (kind === 1) {
      ctx.moveTo(x - s * 0.06, shY); ctx.lineTo(x + s * 0.07, shY);
      ctx.lineTo(x + s * 0.13, hipY + s * 0.2); ctx.lineTo(x - s * 0.12, hipY + s * 0.2);
    } else {
      ctx.moveTo(x - s * 0.07, shY); ctx.lineTo(x + s * 0.07, shY);
      ctx.lineTo(x + s * 0.065, hipY + s * 0.02); ctx.lineTo(x - s * 0.065, hipY + s * 0.02);
    }
    ctx.closePath(); ctx.fill();
    if (kind === 2) { ctx.fillStyle = legs; ctx.fillRect(x - s * 0.17, shY + s * 0.02, s * 0.1, s * 0.2); }
    arm(1);
    // Head · hair
    ctx.fillStyle = pal.skin;
    ctx.beginPath(); ctx.arc(x + s * 0.015, shY - s * 0.09, s * 0.065, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal[col[1] === 4 ? 0 : 1];
    ctx.beginPath(); ctx.arc(x + s * 0.005, shY - s * 0.105, s * 0.066, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  }

  kfFx.register("walk-crowd-strip", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) { canvas.remove(); return; }
    const steps = Math.max(1, +options.steps || 29);
    const cycle = +(options.cycle ?? 1.2);
    let w = 0, h = 0, pal = null, raf = 0, start = 0, seen = true;

    const read = () => {
      pal = [
        css(el, "--fx-c1", css(el, "--kf-accent", "")),
        css(el, "--fx-c2", css(el, "--kf-ink", "")),
        css(el, "--fx-c3", css(el, "--kf-dim", "")),
        css(el, "--fx-c4", css(el, "--kf-accent-soft", "")),
        css(el, "--fx-c5", css(el, "--kf-line", "")),
      ];
      pal.skin = css(el, "--fx-skin", css(el, "--kf-raised", ""));
    };
    const size = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      read();
    };
    const draw = (t) => {
      if (!w || !h) return;
      // Each piece’s width scales with strip height (original 1206×160), and one loop length is --fx-loop (seconds), read as a css variable so each width can differ
      const tile = h * num(el, "--fx-tile", +(options.tile ?? 7.54));
      const loop = num(el, "--fx-loop", +(options.loop ?? 20));
      const frame = cycle > 0 ? Math.floor((t / cycle) * steps) % steps : 0;
      const shift = loop > 0 ? ((t / loop) % 1) * tile : 0;
      const dir = options.dir === "left" ? -1 : 1;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      if (dir < 0) { ctx.translate(w, 0); ctx.scale(-1, 1); }
      for (let base = shift - tile; base < w + tile; base += tile) {
        for (const [px, k, kind, col, ph] of PEOPLE) walker(ctx, base + px * tile, h * k + h * (1 - k), kind, col, (frame / steps + ph) % 1, pal);
      }
      ctx.restore();
    };
    const tick = (now) => {
      if (!start) start = now;
      draw(Math.max(0, now - start) / 1000);
      if (seen) raf = requestAnimationFrame(tick);
    };
    size();
    // When steps and flow are both 0 it is a still image (crowd image strip · empty box people row) — not redrawn every frame, only when the size changes
    const still = cycle <= 0 && num(el, "--fx-loop", +(options.loop ?? 20)) <= 0;
    const ro = new ResizeObserver(() => { size(); draw(reduce || still ? 0 : (performance.now() - start) / 1000); });
    ro.observe(el);
    let io = null;
    if (reduce || still) draw(0);
    else {
      io = new IntersectionObserver(([e]) => {
        const was = seen;
        seen = e.isIntersecting;
        if (seen && !was) raf = requestAnimationFrame(tick);
        if (!seen) cancelAnimationFrame(raf);
      });
      io.observe(el);
      raf = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io?.disconnect(); canvas.remove(); };
  });
})();
