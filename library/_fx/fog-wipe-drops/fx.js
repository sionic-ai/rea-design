(() => {
  // Fogged glass pieces — a frost panel blurring the back by 14px covers them in the piece shape, and rubbing with the cursor (radius 56px, stamped every 12px) wipes it clear.
  // Water drops form on wiped spots and run down, wiping the passed line again. 2.4s after the last wipe, frost slowly forms again.
  // When a piece is wiped more than 35% from the start it emits fx:wiped once. With fx:play it appears straight over .72s after 1.5s, and with fx:reset it hides and stops
  const rand = Math.random;

  // Piece shape: turn the element’s clip-path polygon into a path with only rounded corners — the pointer panel (clip) and the frost panel (mask) become the same piece
  function shapeOf(el, w, h, s) {
    const m = getComputedStyle(el).clipPath.match(/polygon\((.*)\)/);
    const pts = m ? m[1].split(",").map((p) => p.trim().split(/\s+/).map((v, i) => (parseFloat(v) / (v.endsWith("%") ? 100 : 1)) * (v.endsWith("%") ? (i ? h : w) : 1))) : [[0, 0], [w, 0], [w, h], [0, h]];
    const path = new Path2D(), n = pts.length, r = Math.min(w, h) * 0.05;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = mid(pts[n - 1], pts[0]);
    path.moveTo(start[0] * s, start[1] * s);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; path.arcTo(p[0] * s, p[1] * s, ...mid(p, q).map((v) => v * s), r * s); }
    path.closePath();
    return path;
  }

  kfFx.register("fog-wipe-drops", (el, { options, reduce, hover }) => {
    // The original also applies only on desktop with motion allowed
    if (reduce || !hover) return;
    const delay = +(options.delay ?? 1.5), fade = +(options.fade ?? 0.72), radius = +(options.radius ?? 56);
    const refog = +(options.refog ?? 2.4), need = +(options.threshold ?? 0.35);
    const frost = document.createElement("div"), canvas = document.createElement("canvas");
    frost.setAttribute("data-fx-part", "frost"); canvas.setAttribute("data-fx-part", "drops");
    frost.setAttribute("aria-hidden", "true"); canvas.setAttribute("aria-hidden", "true");
    // Put the frost/droplet plate as a sibling right behind the piece — if placed inside a piece with clip-path, that piece becomes the floor of the back blur and the screen behind stays unblurred
    el.after(frost, canvas);
    const ctx = canvas.getContext("2d");
    const mask = document.createElement("canvas"), mctx = mask.getContext("2d");
    const probe = document.createElement("canvas"); probe.width = 32; probe.height = 24;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, shape = null, shapeHi = null, full = 1, beads = [], runners = [], lastWipe = -Infinity, lastMask = -Infinity, pending = false;
    let raf = 0, prev = 0, playing = false, wiped = false, checkAt = 0, prevPt = null, appearT = 0;
    const ink = () => getComputedStyle(el).getPropertyValue("--kf-ink").trim() || "black";
    let inkRgb = "", lit = "";
    const rgb = (c) => { const g = probe.getContext("2d"); g.clearRect(0, 0, 1, 1); g.fillStyle = c; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return `${d[0]},${d[1]},${d[2]}`; };

    function coverage() {
      pctx.clearRect(0, 0, 32, 24); pctx.drawImage(mask, 0, 0, 32, 24);
      const d = pctx.getImageData(0, 0, 32, 24).data;
      let a = 0; for (let i = 3; i < d.length; i += 4) a += d[i];
      return a / ((d.length / 4) * 255);
    }
    function applyMask(t) {
      lastMask = t; pending = false;
      const url = `url("${mask.toDataURL("image/png")}")`;
      frost.style.maskImage = url; frost.style.webkitMaskImage = url;
    }
    function fit() {
      const r = el.getBoundingClientRect(), nw = Math.round(r.width), nh = Math.round(r.height);
      const z = getComputedStyle(el).zIndex;
      for (const n of [frost, canvas]) Object.assign(n.style, { left: `${el.offsetLeft}px`, top: `${el.offsetTop}px`, width: `${el.offsetWidth}px`, height: `${el.offsetHeight}px`, zIndex: z === "auto" ? "" : z });
      if (nw < 2 || nh < 2 || (nw === w && nh === h)) return;
      w = nw; h = nh;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      mask.width = w; mask.height = h;
      shape = shapeOf(el, w, h, 1); shapeHi = shapeOf(el, w, h, dpr);
      mctx.clearRect(0, 0, w, h); mctx.fillStyle = "#fff"; mctx.fill(shape); /* Not skin: mask alpha */
      full = coverage() || 1;
      inkRgb = rgb(ink()); lit = rgb(getComputedStyle(el).getPropertyValue("--kf-raised").trim() || "white");
      applyMask(performance.now() / 1000);
    }
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const runner = (x, y) => { const big = rand() < 0.3; runners.push({ x, y, vy: 0.15, seed: rand(), r: big ? 6.5 + 2.5 * rand() : 3.5 + 1.5 * rand() }); };
    function wipe(x, y) {
      const g = mctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)"); /* Not skin: mask alpha */
      mctx.globalCompositeOperation = "destination-out"; mctx.fillStyle = g;
      mctx.beginPath(); mctx.arc(x, y, radius, 0, Math.PI * 2); mctx.fill();
      mctx.globalCompositeOperation = "source-over";
      beads = beads.filter((b) => Math.hypot(b.x - x, b.y - y) >= 60);
      if (runners.length < 4 && rand() < 0.12) runner(x + (rand() - 0.5) * 30, y + 20);
    }
    const onMove = (e) => {
      if (!playing || !w) return;
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      lastWipe = performance.now() / 1000;
      if (prevPt) { const n = Math.max(1, Math.ceil(Math.hypot(x - prevPt.x, y - prevPt.y) / 12)); for (let i = 1; i <= n; i++) wipe(prevPt.x + ((x - prevPt.x) * i) / n, prevPt.y + ((y - prevPt.y) * i) / n); }
      else wipe(x, y);
      prevPt = { x, y };
      applyMask(lastWipe);
    };
    const onUp = () => { prevPt = null; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onMove);
    el.addEventListener("pointerleave", onUp);
    el.addEventListener("pointerup", onUp);

    function step(t, dt) {
      // After a full wipe and a 2.4s rest the frost forms again — a white film is painted on each frame at dt/2.8 (max .05)
      if (t - lastWipe >= refog) {
        mctx.save(); mctx.clip(shape); mctx.fillStyle = `rgba(255,255,255,${Math.min(0.05, dt / 2.8)})`; mctx.fillRect(0, 0, w, h); mctx.restore(); /* Not skin: mask alpha */
        pending = true;
      }
      if (runners.length < 4 && rand() < 0.36 * dt) runner((0.08 + 0.84 * rand()) * w, rand() * h * 0.35);
      for (let i = runners.length - 1; i >= 0; i--) {
        const a = runners[i], px = a.x, py = a.y;
        a.vy = Math.min(a.vy + 0.01 + 0.002 * a.r + 0.008 * a.seed, 0.85 + 0.08 * a.r);
        a.y += a.vy; a.x += 0.35 * Math.sin(0.05 * a.y + 9 * a.seed);
        for (let j = beads.length - 1; j >= 0; j--) { const b = beads[j]; if (Math.hypot(b.x - a.x, b.y - a.y) < a.r + b.r + 2) { beads.splice(j, 1); a.r = Math.min(a.r + 0.25 * b.r, 10); a.vy += 0.12; } }
        a.r -= 0.22 * dt;
        if (a.vy > 0.02) {
          /* Not skin: mask alpha */ mctx.globalCompositeOperation = "destination-out"; mctx.strokeStyle = "rgba(0,0,0,0.92)"; mctx.lineWidth = Math.max(1.05 * a.r, 1.2); mctx.lineCap = "round";
          mctx.beginPath(); mctx.moveTo(px, py); mctx.lineTo(a.x, a.y); mctx.stroke(); mctx.globalCompositeOperation = "source-over";
        }
        if (a.y > h + 8) runners.splice(i, 1);
        else if (a.r < 2.2) { runners.splice(i, 1); if (beads.length < 7) beads.push({ x: a.x, y: a.y, r: 2.4 + 1.2 * rand(), vy: 0, seed: rand() }); }
      }
      if (runners.length) pending = true;
      if (beads.length < 7 && rand() < 0.01) beads.push({ x: rand() * w, y: rand() * h * 0.6, r: 2.4 + 3.8 * rand(), vy: 0, seed: rand() });
      for (const b of beads) {
        if (b.r > 3.8) b.vy = Math.min(b.vy + 0.028, 0.55 + b.seed);
        b.y += b.vy; b.r += 0.0015;
        if (b.y > h + 10) { b.y = -6; b.vy = 0; b.r = 2.4 + 3.8 * rand(); }
      }
    }
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save(); ctx.clip(shapeHi);
      const s = dpr;
      for (const b of beads) {
        const x = b.x * s, y = b.y * s, r = b.r * s, g = ctx.createRadialGradient(x, y, 0.2 * r, x, y, r);
        g.addColorStop(0, `rgba(${inkRgb},0.28)`); g.addColorStop(0.8, `rgba(${inkRgb},0.34)`); g.addColorStop(1, `rgba(${inkRgb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${lit},0.5)`; ctx.beginPath(); ctx.arc(x - 0.3 * r, y - 0.35 * r, 0.22 * r, 0, Math.PI * 2); ctx.fill();
      }
      for (const a of runners) {
        const x = a.x * s, y = a.y * s, r = a.r * s, k = Math.min(a.vy / 1.6, 1), g = ctx.createRadialGradient(x, y, 0.2 * r, x, y, r);
        g.addColorStop(0, `rgba(${inkRgb},0.35)`); g.addColorStop(1, `rgba(${inkRgb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * (0.95 - 0.2 * k), r * (1.05 + 0.6 * k), 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${lit},0.55)`; ctx.beginPath(); ctx.arc(x - 0.25 * r, y - 0.4 * r, 0.25 * r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      const t = now / 1000, dt = Math.min(prev ? t - prev : 1 / 60, 0.05);
      prev = t;
      if (!w) fit();
      if (!w) return;
      step(t, dt); draw();
      if (pending && t - lastMask >= 0.1) applyMask(t);
      if (!wiped && t - checkAt >= 0.5) { checkAt = t; if (1 - coverage() / full >= need) { wiped = true; el.dispatchEvent(new CustomEvent("fx:wiped")); } }
    }
    const show = (on) => {
      clearTimeout(appearT);
      for (const n of [frost, canvas]) { n.style.transition = on ? `opacity ${fade}s linear ${delay}s` : "none"; n.style.opacity = on ? "1" : "0"; }
    };
    const play = () => { if (playing) return; playing = true; wiped = false; prev = 0; show(true); raf = requestAnimationFrame(loop); };
    const reset = () => { playing = false; cancelAnimationFrame(raf); raf = 0; prevPt = null; show(false); };
    el.addEventListener("fx:play", play);
    el.addEventListener("fx:reset", reset);
    if (options.auto === "on") play();
    return () => {
      reset(); ro.disconnect();
      el.removeEventListener("fx:play", play); el.removeEventListener("fx:reset", reset);
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointerleave", onUp); el.removeEventListener("pointerup", onUp);
      frost.remove(); canvas.remove();
    };
  });
})();
