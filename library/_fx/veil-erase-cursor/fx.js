// Cover a background-color curtain with a canvas and cut holes with five smoke blobs per cursor trail — trails spread and fade over their lifetime so the curtain fills back in
// Original values (Brand hero): hole diameter 220 · lifetime 800ms · on 100ms · stop detection 120ms · follow .3 · mark every 4px · 5 blobs (spread .55, size .4~.95, scatter .7)
// · Auto sweep: crosses panel 25%→75% in 1s cubic in-out with a 40px sine sag, every 10 seconds.
(() => {
  kfFx.register("veil-erase-cursor", (el, { options, reduce }) => {
    let canvas = el.querySelector('[data-fx-part="veil"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.dataset.fxPart = "veil"; canvas.setAttribute("aria-hidden", "true"); el.append(canvas); }
    if (reduce) return () => { if (made) canvas.remove(); };
    const ctx = canvas.getContext("2d");
    const HOLE = +(options.hole ?? 220), LIFE = +(options.life ?? 800) || 800, FADE_IN = +(options["fade-in"] ?? 100), IDLE = +(options.idle ?? 120);
    const SMOOTH = +(options.smooth ?? 0.3), MIN_MOVE = +(options["min-move"] ?? 4), AUTO = +(options.auto ?? 10), SWEEP = +(options.sweep ?? 1) * 1000;
    const R = HOLE / 1.5, BLOBS = 5, SPREAD = 0.55, MIN_S = 0.4, MAX_S = 0.95, DISPERSE = 0.7;
    const dpr = Math.min(devicePixelRatio || 1, 1.25);
    const veilColor = () => getComputedStyle(el).getPropertyValue("--fx-veil").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim() || "Canvas";

    // One puff — a smoke shape: a circle dense in the middle and fading outward with six round bumps on top (only alpha is used when erasing)
    const maxR = R * MAX_S * (1 + DISPERSE), base = Math.ceil(maxR * 2), TEX = 1.5;
    const puff = document.createElement("canvas");
    puff.width = puff.height = base * TEX;
    const pc = puff.getContext("2d");
    pc.scale(TEX, TEX);
    const g = pc.createRadialGradient(base / 2, base / 2, 0, base / 2, base / 2, base / 2);
    g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.5, "rgba(0,0,0,0.5)"); g.addColorStop(1, "rgba(0,0,0,0)"); /* Not skin: alpha plate of the eraser blob — color is not used */
    pc.fillStyle = g; pc.fillRect(0, 0, base, base);
    pc.globalCompositeOperation = "source-atop"; pc.fillStyle = "rgba(0,0,0,0.8)"; /* Not skin: alpha plate */
    for (let i = 0; i < 6; i++) { const a = Math.random() * Math.PI * 2; pc.beginPath(); pc.arc(base / 2 + Math.cos(a) * base * 0.2, base / 2 + Math.sin(a) * base * 0.2, base / 2 * (0.3 + Math.random() * 0.3), 0, Math.PI * 2); pc.fill(); }

    let rect = el.getBoundingClientRect(), trail = [], tx = null, ty = null, sx = 0, sy = 0, has = false, lx = null, ly = null;
    let idle = 0, interval = 0, user = false, visible = true, running = false, color = veilColor();
    const fillVeil = () => { ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.fillRect(0, 0, rect.width, rect.height); };
    const resize = () => {
      rect = el.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr)); canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = veilColor(); trail = []; lx = ly = null; fillVeil();
    };
    resize();
    const ro = new ResizeObserver(() => { clearTimeout(ro.t); ro.t = setTimeout(resize, 100); });
    ro.observe(el);

    const blobs = () => Array.from({ length: BLOBS }, () => ({ a: Math.random() * Math.PI * 2, d: Math.random() * SPREAD, s: MIN_S + Math.random() * (MAX_S - MIN_S), v: (Math.random() - 0.5) * 0.0015, ph: Math.random() * Math.PI * 2 }));
    const loop = (now) => {
      if (!visible) { trail = []; lx = ly = null; has = false; fillVeil(); running = false; return; }
      if (tx !== null) {
        sx += (tx - sx) * SMOOTH; sy += (ty - sy) * SMOOTH;
        if (lx === null || Math.hypot(sx - lx, sy - ly) > MIN_MOVE) { trail.push({ x: sx, y: sy, t: now, b: blobs() }); lx = sx; ly = sy; }
      }
      trail = trail.filter((p) => now - p.t < LIFE);
      fillVeil();
      ctx.globalCompositeOperation = "destination-out";
      for (const p of trail) {
        const age = Math.max(0, now - p.t), life = Math.min(1, age / LIFE), op = Math.max(0, 1 - life) * Math.min(1, age / FADE_IN);
        if (op < 0.0039) continue;
        const spread = 1 + life * DISPERSE;
        for (const b of p.b) {
          const k = spread * (1 + Math.sin(age * 0.005 + b.ph) * 0.1), a = b.a + age * b.v, off = b.d * R * k, r = b.s * R * k;
          ctx.globalAlpha = op * (0.7 + b.s * 0.3);
          ctx.drawImage(puff, p.x + Math.cos(a) * off - r, p.y + Math.sin(a) * off - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
      if (trail.length || tx !== null) requestAnimationFrame(loop); else { running = false; lx = ly = null; }
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
    const point = (x, y, fromUser) => {
      if (fromUser) user = true;
      tx = x - rect.left; ty = y - rect.top;
      if (!has) { sx = tx; sy = ty; has = true; }
      clearTimeout(idle);
      idle = setTimeout(() => { tx = ty = null; if (fromUser) user = false; }, IDLE);
      kick();
    };
    const onMove = (e) => { if (!has) rect = el.getBoundingClientRect(); else requestAnimationFrame(() => (rect = el.getBoundingClientRect())); point(e.clientX, e.clientY, true); };
    const onClear = () => { clearTimeout(idle); tx = ty = null; has = false; user = false; };

    const sweep = () => {
      if (user || !visible) return;
      stopTimer();
      rect = el.getBoundingClientRect();
      trail.length = 0; lx = ly = null;
      const x0 = rect.width * 0.25, x1 = rect.width * 0.75, y0 = rect.height * 0.45, y1 = rect.height * 0.55, t0 = performance.now();
      sx = x0; sy = y0; has = true;
      const step = (now) => {
        if (user) return;
        const p = Math.min(1, (now - t0) / SWEEP), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        tx = x0 + (x1 - x0) * e; ty = y0 + Math.sin(p * Math.PI) * 40 + (y1 - y0) * e;
        clearTimeout(idle); idle = setTimeout(() => { tx = ty = null; }, IDLE);
        kick();
        if (p < 1) requestAnimationFrame(step); else { clearTimeout(idle); tx = ty = null; startTimer(); }
      };
      requestAnimationFrame(step);
    };
    const coarse = matchMedia("(max-width: 767px), (pointer: coarse)");
    const startTimer = () => { if (!AUTO || coarse.matches) return; stopTimer(); interval = setInterval(() => { if (visible && !user) sweep(); }, AUTO * 1000); };
    const stopTimer = () => { clearInterval(interval); interval = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!visible) stopTimer(); else if (AUTO && !interval) startTimer(); }, { threshold: 0.1 });
    io.observe(el);

    el.style.touchAction = "pan-y";
    el.addEventListener("pointerdown", onMove, { passive: true });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerup", onClear, { passive: true });
    el.addEventListener("pointercancel", onClear, { passive: true });
    el.addEventListener("pointerleave", onClear, { passive: true });
    // For the user to sweep once after first appearance: el.dispatchEvent(new Event("fx:play"))
    const onPlay = () => { sweep(); startTimer(); };
    el.addEventListener("fx:play", onPlay);
    if (options.on !== "state") onPlay();

    return () => {
      stopTimer(); clearTimeout(idle); io.disconnect(); ro.disconnect(); visible = false;
      el.removeEventListener("pointerdown", onMove); el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onClear); el.removeEventListener("pointercancel", onClear); el.removeEventListener("pointerleave", onClear);
      el.removeEventListener("fx:play", onPlay);
      if (made) canvas.remove(); else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
})();
