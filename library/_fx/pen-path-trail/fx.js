(() => {
  // Draws the mouse trail like a pen-tool path on the screen overlay canvas (element) — connects the points kept for 520ms with midpoint quadratic curves (1.25px),
  // Going backward, an anchor square (6px) every 72px, and the latest anchor gets tangent handles (±22px, end circle r2.4). Pressing spreads two rings (0 · 90ms) over 760ms and the center dot shrinks over 380ms.
  // Color is the color option (default --kf-contrast-ink) — the background is inverted with CSS mix-blend-mode: difference. Not drawn on touch devices
  kfFx.register("pen-path-trail", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !(el instanceof HTMLCanvasElement)) return;
    const ctx = el.getContext("2d");
    const life = +(options.life ?? 520), gap = +(options.gap ?? 72), arm = +(options.arm ?? 22), ringMs = +(options.ring ?? 760);
    const reach = +(options.reach ?? 190), max = +(options.max ?? 160);
    const colorOf = () => options.color || getComputedStyle(el).getPropertyValue("--kf-contrast-ink").trim() || "currentColor";
    let color = colorOf(), dpr = 1, W = 0, H = 0, raf = 0, dirty = false;
    const pts = [], rings = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      el.width = Math.round(W * dpr); el.height = Math.round(H * dpr);
      color = colorOf();
    };
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > max) pts.splice(0, pts.length - max);
      wake();
    };
    const down = (e) => {
      if (e.pointerType !== "mouse") return;
      if (rings.length >= 3) rings.shift();
      rings.push({ x: e.clientX, y: e.clientY, t: performance.now(), power: 1 });
      wake();
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const draw = () => {
      raf = 0;
      const now = performance.now();
      while (pts.length && now - pts[0].t > life) pts.shift();
      for (let i = rings.length - 1; i >= 0; i--) if (now - rings[i].t >= ringMs + 140) rings.splice(i, 1);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      if (!pts.length && !rings.length) { dirty = false; return; }
      dirty = true;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = color; ctx.fillStyle = color;
      if (pts.length > 2) {
        ctx.lineWidth = 1.25; ctx.lineCap = "round";
        for (let i = 1; i < pts.length - 1; i++) {
          const a = pts[i - 1], b = pts[i], c = pts[i + 1];
          ctx.globalAlpha = Math.max(0, 1 - (now - b.t) / life) * 0.9;
          ctx.beginPath(); ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2); ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2); ctx.stroke();
        }
        let run = 0, first = true;
        for (let i = pts.length - 1; i > 0; i--) {
          run += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
          if (run < gap) continue;
          run = 0;
          const p = pts[i], fade = Math.max(0, 1 - (now - p.t) / life);
          if (first) {
            const f = pts[Math.min(pts.length - 1, i + 2)], b = pts[Math.max(0, i - 2)];
            let dx = f.x - b.x, dy = f.y - b.y; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
            ctx.globalAlpha = fade * 0.9; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x - dx * arm, p.y - dy * arm); ctx.lineTo(p.x + dx * arm, p.y + dy * arm); ctx.stroke();
            for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(p.x + dx * arm * s, p.y + dy * arm * s, 2.4, 0, Math.PI * 2); ctx.fill(); }
            first = false;
          }
          // Keep the anchor interior empty so the background shows through (the original uses a black fill plus difference, so the background color shows as-is)
          ctx.globalAlpha = fade; ctx.lineWidth = 1.2;
          ctx.clearRect(p.x - 3, p.y - 3, 6, 6);
          ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);
        }
      }
      for (const r of rings) {
        for (const [delay, k] of [[0, 1], [90, 0.56]]) {
          const a = Math.min(1, Math.max(0, (now - r.t - delay) / ringMs));
          if (a <= 0 || a >= 1) continue;
          const e = 1 - (1 - a) ** 4;
          ctx.globalAlpha = (1 - a) * 0.95; ctx.lineWidth = 2.6 * (1 - a) + 0.6;
          ctx.beginPath(); ctx.arc(r.x, r.y, 6 + e * reach * k * (0.7 + 0.3 * r.power), 0, Math.PI * 2); ctx.stroke();
        }
        const q = Math.min(1, (now - r.t) / 380);
        if (q < 1) { ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(r.x, r.y, 10 * (1 - q) * (1 - q) + 0.01, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      wake();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (dirty) ctx.clearRect(0, 0, el.width, el.height);
    };
  });
})();
