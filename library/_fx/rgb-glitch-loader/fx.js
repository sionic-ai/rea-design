// Draws the number additively in three RGB layers, and adds a per-line tearing glitch whenever the number changes — the original is a loader that waits for the scene shader to be ready
(() => {
  kfFx.register("rgb-glitch-loader", (el, { options, reduce }) => {
    const KEY = "kf-fx-rgb-glitch-loader";
    const done = () => document.dispatchEvent(new Event("fx:loaded"));
    if (reduce || (!(options.every === "true") && sessionStorage.getItem(KEY) === "1")) { done(); return () => {}; }
    sessionStorage.setItem(KEY, "1");
    const scale = +(options.scale ?? 1), outDur = +(options.out ?? 0.5);
    const STEPS = [[1, 0, [[0, 1], [260, 0.8], [470, 1], [700, 0.7]]], [5, 1000, [[0, 0.6]]], [12, 1350, [[0, 0.6]]], [66, 1800, [[0, 0.65], [220, 0.35]]], [99, 2200, [[0, 0.65]]]];
    const rand = (a, b) => { const n = 43758.5453 * Math.sin(12.9898 * a + 78.233 * b); return n - Math.floor(n); };
    const wrap = document.createElement("div"), cv = document.createElement("canvas"), num = document.createElement("span");
    wrap.className = "fx-rgbload"; wrap.append(cv, num); document.body.append(wrap);
    const g = cv.getContext("2d");
    let W = 1, H = 1, dpr = 1, text = "", layers = null, lw = 0, lh = 0, raf = 0, outAt = null, ready = !options.wait, finished = false;
    const timers = [];
    const size = () => Math.min(104, Math.max(44, (76 / 1920) * innerWidth)) * dpr;
    const ink = () => { const c = getComputedStyle(num).color.match(/[\d.]+/g) || [255, 255, 255]; return c.slice(0, 3).map(Number); };
    const build = () => {
      if (!text) return;
      const fs = size(), f = `700 ${fs}px ${getComputedStyle(num).fontFamily}`, m = document.createElement("canvas").getContext("2d");
      m.font = f; if ("letterSpacing" in m) m.letterSpacing = `${-0.04 * fs}px`;
      const mt = m.measureText(text), pad = Math.ceil(0.1 * fs), asc = mt.actualBoundingBoxAscent, c = ink();
      lw = Math.ceil(mt.width + 2 * pad); lh = Math.ceil(asc + mt.actualBoundingBoxDescent + 2 * pad);
      layers = [0, 1, 2].map((ch) => {
        const l = document.createElement("canvas"); l.width = lw; l.height = lh;
        const x = l.getContext("2d"); x.font = f; if ("letterSpacing" in x) x.letterSpacing = m.letterSpacing;
        x.fillStyle = `rgb(${c.map((v, i) => (i === ch ? v : 0)).join(" ")})`;
        x.fillText(text, pad, pad + asc); return l;
      });
    };
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)); H = cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)); build(); };
    const draw = (t, k, alpha = 1) => {
      g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
      if (!layers || alpha <= 0) return;
      const x0 = Math.round((W - lw) / 2), y0 = Math.round((H - lh) / 2);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = alpha;
      if (k < 0.001) layers.forEach((l) => g.drawImage(l, x0, y0));
      else {
        const frame = Math.floor(30 * t), fs = size(), sep = 0.1 * k * fs, dir = rand(frame, 0) > 0.5 ? 1 : -1, row = Math.max(1, Math.round(2 * dpr));
        g.globalAlpha = alpha * (1 - 0.55 * Math.min(1, k) * rand(frame, 1));
        for (let o = 0; o < lh; o += row) {
          const v = 1 - (y0 + o) / H;
          let dx = Math.sin(15 * v + 20 * t) * Math.sin(73 * v - 10 * t) * 0.22 * k * fs;
          if (rand(Math.floor(20 * v), frame) > 0.85) dx += 0.45 * k * fs * dir;
          const hh = Math.min(row, lh - o);
          for (let c = 0; c < 3; c++) g.drawImage(layers[c], 0, o, lw, hh, x0 + dx + (c - 1) * sep, y0 + o, lw, hh);
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    };
    const now = () => performance.now() / 1000, pulses = [];
    const set = (v, ps) => { text = `${v}%`; num.textContent = text; build(); const t = now(); ps.forEach(([ms, k]) => pulses.push({ start: t + ms / 1000, k })); };
    const finish = () => { if (finished) return; finished = true; set(100, [[0, 0.7]]); timers.push(setTimeout(() => (outAt = now()), 420 * Math.min(1, scale || 0))); };
    const tick = () => {
      const t = now();
      if (outAt !== null) {
        const n = outDur > 0 ? Math.min(1, (t - outAt) / outDur) : 1;
        draw(t, 2.4 * n, 1 - n * n);
        if (n >= 1) { timers.push(setTimeout(() => { wrap.remove(); done(); }, 80)); return; }
        raf = requestAnimationFrame(tick); return;
      }
      let k = 0;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; if (t - p.start >= 0.5) { pulses.splice(i, 1); continue; }
        if (t < p.start) continue; const r = (t - p.start) / 0.5; k = Math.max(k, p.k * (1 - r) * (1 - r));
      }
      draw(t, k); raf = requestAnimationFrame(tick);
    };
    const onReady = () => { ready = true; };
    if (options.wait) document.addEventListener(options.wait, onReady);
    resize(); addEventListener("resize", resize);
    if (scale > 0) STEPS.forEach(([v, at, ps]) => timers.push(setTimeout(() => set(v, ps), at * scale)));
    let poll = null;
    timers.push(setTimeout(() => {
      if (ready) return finish();
      poll = setInterval(() => { if (ready) { clearInterval(poll); finish(); } else pulses.push({ start: now(), k: 0.6 }); }, 1200);
    }, 2600 * scale));
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); timers.forEach(clearTimeout); clearInterval(poll);
      removeEventListener("resize", resize); if (options.wait) document.removeEventListener(options.wait, onReady); wrap.remove();
    };
  });
})();
