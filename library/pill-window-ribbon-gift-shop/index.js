// Home only: hero pill window (punches through paper with a canvas to reveal the back photo and knot pattern), hero end vanish, info plate clock.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const win = document.querySelector(".fv__window");
  const pat = document.querySelector(".fv__window-pattern");
  const css = getComputedStyle(document.documentElement);
  const paper = css.getPropertyValue("--kf-bg").trim(), surface = css.getPropertyValue("--kf-surface").trim(), accent = css.getPropertyValue("--kf-accent").trim();

  // Original dimensions: on PC at a 1728 base screen pill 307×434 · gap 153/96 · total width 2145, on phone at 393 base 115×162 · 32/32 · 704. 5 columns, 5 cells per 30 seconds
  const PC = { baseW: 1728, totalW: 2145, w: 307, h: 434, gx: 153, gy: 96 };
  const SP = { baseW: 393, totalW: 704, w: 115, h: 162, gx: 32, gy: 32 };
  const COLS = 5, ROWS_PER_MS = 5 / 30000;

  // Pill type: superellipse instead of the original drawing (n=Redrawn with 2.8)
  const pill = (w, h) => {
    const p = new Path2D(), n = 2.8, steps = 72;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const x = w / 2 + (w / 2) * Math.sign(c) * Math.abs(c) ** (2 / n);
      const y = h / 2 + (h / 2) * Math.sign(s) * Math.abs(s) ** (2 / n);
      i ? p.lineTo(x, y) : p.moveTo(x, y);
    }
    p.closePath();
    return p;
  };

  // Red infinity (∞) knot pattern, one cell — vertical figure-8 loops set in a staggered layout
  const tile = document.createElement("canvas");
  tile.width = 34; tile.height = 44;
  const tc = tile.getContext("2d");
  tc.strokeStyle = accent; tc.globalAlpha = .75; tc.lineWidth = 1.6;
  const loop8 = (cx, cy) => {
    tc.beginPath();
    tc.moveTo(cx, cy);
    tc.bezierCurveTo(cx - 7, cy - 11, cx + 7, cy - 11, cx, cy);
    tc.bezierCurveTo(cx - 7, cy + 11, cx + 7, cy + 11, cx, cy);
    tc.stroke();
  };
  loop8(9, 15); loop8(26, 37); loop8(26, -7);

  if (win && pat) {
    const wc = win.getContext("2d"), pc = pat.getContext("2d");
    const pattern = pc.createPattern(tile, "repeat");
    let shape = null, shapeKey = "";
    const size = () => {
      const dpr = devicePixelRatio || 1;
      for (const c of [win, pat]) { c.width = c.offsetWidth * dpr; c.height = c.offsetHeight * dpr; }
    };
    let t0 = null;
    const draw = (now) => {
      if (t0 === null) t0 = now;
      const dpr = devicePixelRatio || 1, W = win.offsetWidth, H = win.offsetHeight;
      const cfg = innerWidth <= 1024 ? SP : PC, k = W / cfg.baseW;
      const pw = cfg.w * k, ph = cfg.h * k, gx = cfg.gx * k, gy = cfg.gy * k, step = ph + gy;
      const rows = reduce ? 0 : (now - t0) * ROWS_PER_MS, frac = rows % 1, whole = Math.floor(rows);
      const x0 = (W - cfg.totalW * k) / 2, count = Math.ceil(H / step) + 3;
      const key = `${pw}x${ph}`;
      if (key !== shapeKey) { shape = pill(pw, ph); shapeKey = key; }
      wc.setTransform(dpr, 0, 0, dpr, 0, 0);
      wc.globalCompositeOperation = "source-over";
      wc.fillStyle = paper; wc.fillRect(0, 0, W, H);
      wc.globalCompositeOperation = "destination-out";
      pc.setTransform(dpr, 0, 0, dpr, 0, 0);
      pc.clearRect(0, 0, W, H);
      for (let col = 0; col < COLS; col++) {
        const x = x0 + col * (pw + gx), down = col === 1 || col === 3;
        for (let r = -1; r < count; r++) {
          // Columns 2 and 4 flow down, the rest flow up. In every third cell, one shows a knot pattern instead of a window
          const y = down ? (frac - 1) * step + r * step : -frac * step + r * step;
          const kind = down ? (((r - whole) % 3) + 3) % 3 : (((r + whole) % 3) + 3) % 3;
          if (y > H) break;
          if (y + ph < 0) continue;
          if (kind === 2) {
            pc.save(); pc.translate(x, y); pc.clip(shape);
            // Pattern window background sits between paper and surface — original #fbf9f8
            pc.fillStyle = paper; pc.fillRect(0, 0, pw, ph);
            pc.globalAlpha = .5; pc.fillStyle = surface; pc.fillRect(0, 0, pw, ph); pc.globalAlpha = 1;
            pc.fillStyle = pattern; pc.fillRect(0, 0, pw, ph);
            pc.restore();
          } else {
            wc.save(); wc.translate(x, y); wc.fill(shape); wc.restore();
          }
        }
      }
      wc.globalCompositeOperation = "source-over";
      if (!reduce) requestAnimationFrame(draw);
    };
    new ResizeObserver(size).observe(win);
    size();
    requestAnimationFrame(draw);
  }

  // When the hero ends, the fixed background and window scale to 1.2x and vanish (on PC until the hero bottom touches the top of the screen, on phone to the 25% line)
  const mm = gsap.matchMedia();
  const fade = (end) => gsap.timeline({ scrollTrigger: { trigger: ".fv", start: "bottom bottom", end, scrub: true } })
    .to(".fv__bg .wf-img", { opacity: 0, ease: "none" }, 0)
    .to(".fv__noise", { opacity: 0, ease: "none" }, 0)
    .to([win, pat], { scale: 1.2, opacity: 0, ease: "none", transformOrigin: "center center" }, 0);
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => { fade("bottom top"); });
  mm.add("(max-width: 1024px) and (prefers-reduced-motion: no-preference)", () => { fade("bottom 25%"); });

  // Info panel time — as in the original, the local time of that place (data-tz, default airport Asia/Tokyo) every 1 second
  const time = document.querySelector(".info__datas-row .time");
  const fmt = time && new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: time.dataset.tz || "Asia/Tokyo" });
  const tick = () => { time.textContent = `${fmt.format(new Date())} (${time.dataset.tzLabel || "JST/UTC+9"})`; };
  if (time) { tick(); setInterval(tick, 1000); }
})();
