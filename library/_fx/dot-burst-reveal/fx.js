(() => {
  // Covers the element with an overlapping dot-grid canvas, and touching the letter ball bursts it into petals that erase dots — the element’s real content shows through the erased holes
  kfFx.register("dot-burst-reveal", (el, { options, reduce }) => {
    const word = String(options.word ?? "PINGPONG").slice(0, 16);
    const SP = +options.spacing || 35;
    const R = +(options.dot ?? 27);
    const BR = +options.ball || 18;
    const idle = +(options.idle ?? 8000);
    const grow = +options.grow || 1000;
    const cvs = document.createElement("canvas");
    cvs.className = "fx-dbr-canvas";
    cvs.setAttribute("aria-hidden", "true");
    el.append(cvs);
    const ctx = cvs.getContext("2d");
    const color = (name, fb) => { const s = document.createElement("i"); s.style.color = `var(${name}, ${fb})`; el.append(s); const c = getComputedStyle(s).color; s.remove(); return c; };
    let W = 0, H = 0, grid = [], balls = [], petals = [], raf = 0, last = 0, touched = performance.now(), cool = 0, pal = {};
    const timers = new Set();
    const rand = (a, b) => a + Math.random() * (b - a);
    const read = () => { pal = { dot: color("--fx-dot", "var(--kf-accent)"), ball: color("--fx-ball", "var(--kf-bg)"), ink: color("--fx-ink", "var(--kf-ink)") }; };
    const build = () => {
      const b = el.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      W = b.width; H = b.height;
      if (!W || !H) return;
      cvs.width = W * d; cvs.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      grid = [];
      for (let y = 0; y <= H + SP; y += SP) for (let x = 0; x <= W + SP; x += SP) grid.push({ x, y, r: R + rand(-3, 3), gone: 0 });
      balls = [...word].map((ch) => ({ ch, x: rand(0.06, 0.94) * W, y: rand(0.1, 0.9) * H, ph: rand(0, 6.28), alive: true }));
    };
    const burst = (b) => {
      b.alive = false;
      const n = Math.round(rand(6, 9));
      for (let i = 0; i < n; i++) { const a = (6.283 * i) / n + rand(-0.2, 0.2), s = rand(14, 20); petals.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 }); }
      const t = setTimeout(() => { timers.delete(t); b.x = rand(0.06, 0.94) * W; b.y = rand(0.1, 0.9) * H; b.alive = true; }, 2600);
      timers.add(t);
    };
    const draw = (now) => {
      const dt = Math.max(1, Math.min(48, now - (last || now)));
      last = now;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = pal.dot;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      for (const d of grid) {
        if (!d.gone) continue;
        d.gone = Math.min(1, d.gone + dt / grow);
        ctx.moveTo(d.x + d.r * d.gone, d.y); ctx.arc(d.x, d.y, d.r * d.gone, 0, 6.283);
      }
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      for (const p of petals) {
        p.x += p.vx * (dt / 16); p.y += p.vy * (dt / 16); p.vx *= 0.93; p.vy *= 0.93; p.life -= dt / 900;
        for (const d of grid) if (!d.gone && Math.abs(d.x - p.x) < 30 && Math.abs(d.y - p.y) < 30) d.gone = 0.0001;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = pal.ball;
        ctx.beginPath(); ctx.ellipse(0, 0, 12, 6, 0, 0, 6.283); ctx.fill(); ctx.restore();
      }
      petals = petals.filter((p) => p.life > 0);
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `600 13px ${getComputedStyle(el).fontFamily}`;
      for (const b of balls) {
        if (!b.alive) continue;
        const bob = Math.sin(now * 0.007 + b.ph) * 6.5;
        ctx.fillStyle = pal.ball; ctx.beginPath(); ctx.arc(b.x, b.y + bob, BR, 0, 6.283); ctx.fill();
        ctx.fillStyle = pal.ink; ctx.fillText(b.ch, b.x, b.y + bob + 1);
      }
      if (idle > 0 && now - touched > idle) { const live = balls.filter((b) => b.alive); if (live.length) burst(live[Math.floor(Math.random() * live.length)]); touched = now; }
      raf = requestAnimationFrame(draw);
    };
    const move = (e) => {
      const r = cvs.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
      touched = now;
      if (now < cool) return;
      for (const b of balls) if (b.alive && Math.hypot(b.x - x, b.y - y) < BR + 4) { burst(b); cool = now + 300; break; }
    };
    read(); build();
    if (reduce) {
      // Reduced motion: shows the content below as is, without the dot panel
      cvs.remove();
      return;
    }
    const ro = new ResizeObserver(() => { build(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e?.isIntersecting) { last = 0; raf = requestAnimationFrame(draw); } });
    io.observe(el);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); timers.forEach(clearTimeout);
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerdown", move);
      cvs.remove();
    };
  });
})();
