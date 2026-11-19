// Paints one box with a gradient band, and the span between two colors is carved by an 8×8 Bayer threshold to mix into two-color dots (3px, 2px on phone).
// Reveal also uses the same threshold — v per cell = Turns on when 2p − t (t is the share away from the start edge) passes that cell’s threshold, so the band spreads into dots and fills from one side.
// Since canvas can’t read variables, color is painted on a hidden dot and read back — re-read when the skin changes (ResizeObserver, window resize).
(() => {
  const bayer = (x, y) => {
    let v = 0;
    for (let b = 0; b < 3; b++) {
      const xb = (x >> b) & 1, yb = (y >> b) & 1;
      v |= ((xb ^ yb) << (2 * (2 - b) + 1)) | (yb << (2 * (2 - b)));
    }
    return (v + 0.5) / 64;
  };
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const small = matchMedia("(max-width: 767px)");
  // Default where no color variable is given — a band spreading from the accent color to a deeper one
  const FALLBACK = ["var(--kf-accent)", "var(--kf-accent)", "color-mix(in oklab, var(--kf-accent) 45%, var(--kf-ink))", "color-mix(in oklab, var(--kf-accent) 15%, var(--kf-ink))"];

  kfFx.register("dither-band-reveal", (el, { options, reduce }) => {
    const on = options.on || "load";
    const dir = options.dir || "right";
    const angle = +(options.angle ?? 0);
    const at = String(options.at || "0 .4 .7 1").split(/\s+/).map(Number);
    const [d0, d1] = String(options.dither || `${at.length - 2} ${at.length - 1}`).split(/\s+/).map(Number);
    const look = options.look || "duotone";
    const threshold = +(options.threshold ?? 0.5);
    const dur = +(options.dur ?? 0.8), delay = +(options.delay ?? 0);
    const dot = +(options.dot || 3), dotSm = +(options["dot-sm"] || 2);
    const enterAt = +(options.enter ?? 0.2);

    const cv = document.createElement("canvas");
    cv.className = "fx-dither-band-reveal__cv";
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const cx = cv.getContext("2d");
    const base = document.createElement("canvas"), bx = base.getContext("2d");
    const mask = document.createElement("canvas"), mx = mask.getContext("2d");
    let progress = reduce || on === "none" ? 1 : 0, raf = 0, baseOk = false, colors = [];

    const readColors = () => {
      const probe = document.createElement("i");
      probe.style.display = "none";
      el.append(probe);
      const cs = getComputedStyle(el);
      // Computed color strings (rgb · oklch) go straight into the canvas — so a canvas isn’t made per color when opening hundreds of boxes
      colors = at.map((_, i) => {
        probe.style.color = cs.getPropertyValue(`--fx-c${i}`).trim() || FALLBACK[Math.min(i, FALLBACK.length - 1)];
        return getComputedStyle(probe).color;
      });
      probe.remove();
    };

    const block = () => Math.max(1, Math.round((small.matches ? dotSm : dot) * (window.devicePixelRatio || 1)));
    const axis = (w, h) => {
      const r = (angle * Math.PI) / 180, dx = Math.cos(r), dy = Math.sin(r);
      const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
      return { dx, dy, sx: w / 2 - dx * half, sy: h / 2 - dy * half, len: 2 * half || 1 };
    };

    const paintBase = () => {
      const w = cv.width, h = cv.height;
      base.width = w; base.height = h;
      const a = axis(w, h);
      const g = bx.createLinearGradient(a.sx, a.sy, a.sx + a.dx * a.len, a.sy + a.dy * a.len);
      at.forEach((o, i) => g.addColorStop(Math.min(1, Math.max(0, o)), colors[i]));
      bx.fillStyle = g;
      bx.fillRect(0, 0, w, h);
      baseOk = true;
      const s0 = at[d0], s1 = at[d1];
      if (s0 === undefined || s1 === undefined || s1 === s0) return;
      const b = block(), cols = Math.ceil(w / b), rows = Math.ceil(h / b);
      // For horizontal and vertical bands the dot pattern repeats every 8 cells — bake only 8 rows (8 cells) and join them
      const flat = angle % 180 === 0 ? "rows" : angle % 180 === 90 ? "cols" : "";
      const pr = flat === "rows" ? Math.min(rows, 8) : rows, pc = flat === "cols" ? Math.min(cols, 8) : cols;
      const pa = new Path2D(), pb = look === "duotone" ? new Path2D() : null;
      for (let y = 0; y < pr; y++) {
        for (let x = 0; x < pc; x++) {
          let c = ((x * b - a.sx) * a.dx + (y * b - a.sy) * a.dy) / a.len;
          c = c < 0 ? 0 : c > 1 ? 1 : c;
          const k = (c - s0) / (s1 - s0);
          if (k < 0 || k > 1) continue;
          const lit = 1 - k > threshold + (bayer(x % 8, y % 8) - 0.5);
          (lit ? pa : pb)?.rect(x * b, y * b, b, b);
        }
      }
      bx.fillStyle = colors[d0]; bx.fill(pa);
      if (pb) { bx.fillStyle = colors[d1]; bx.fill(pb); }
      if (flat === "rows" && rows > 8) for (let y = 8 * b; y < h; y += 8 * b) bx.drawImage(base, 0, 0, w, 8 * b, 0, y, w, 8 * b);
      if (flat === "cols" && cols > 8) for (let x = 8 * b; x < w; x += 8 * b) bx.drawImage(base, 0, 0, 8 * b, h, x, 0, 8 * b, h);
    };

    const draw = () => {
      const w = cv.width, h = cv.height;
      cx.clearRect(0, 0, w, h);
      if (progress <= 0) return;
      if (!baseOk) paintBase();
      cx.drawImage(base, 0, 0);
      if (progress >= 1) return;
      const b = block(), cols = Math.ceil(w / b), rows = Math.ceil(h / b);
      mask.width = cols; mask.height = rows;
      const img = mx.createImageData(cols, rows), px = img.data;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const t = dir === "right" ? (x + 0.5) / cols : dir === "left" ? 1 - (x + 0.5) / cols : dir === "down" ? (y + 0.5) / rows : 1 - (y + 0.5) / rows;
          const v = 2 * progress - t;
          if (v > bayer(x % 8, y % 8)) px[(y * cols + x) * 4 + 3] = 255;
        }
      }
      mx.putImageData(img, 0, 0);
      cx.globalCompositeOperation = "destination-in";
      cx.imageSmoothingEnabled = false;
      cx.drawImage(mask, 0, 0, cols, rows, 0, 0, cols * b, rows * b);
      cx.globalCompositeOperation = "source-over";
      cx.imageSmoothingEnabled = true;
    };

    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.floor(el.clientWidth * dpr)), h = Math.max(1, Math.floor(el.clientHeight * dpr));
      if (cv.width === w && cv.height === h) return;
      cv.width = w; cv.height = h; baseOk = false;
      draw();
    };

    const run = (to, d = dur, wait = delay) => {
      cancelAnimationFrame(raf);
      if (reduce || d <= 0) { progress = to; draw(); return; }
      const from = progress, span = d * 1000 * Math.abs(to - from);
      let t0 = null;
      const tick = (now) => {
        t0 ??= now;
        const e = now - t0 - wait * 1000;
        const u = e < 0 ? 0 : span <= 0 ? 1 : Math.min(e / span, 1);
        progress = from + (to - from) * inOut(u);
        draw();
        if (u < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    readColors();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    const repaint = () => { readColors(); baseOk = false; draw(); };
    small.addEventListener("change", repaint);

    const fxIn = (e) => run(1, e.detail?.dur ?? dur, e.detail?.delay ?? 0);
    const fxOut = (e) => run(0, e.detail?.dur ?? dur, e.detail?.delay ?? 0);
    el.addEventListener("fx:in", fxIn);
    el.addEventListener("fx:out", fxOut);

    let io = null;
    if (!reduce && on === "load") run(1);
    if (!reduce && on === "enter") {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); run(1); } }), { threshold: enterAt });
      io.observe(el);
    }
    if (reduce && on !== "event") { progress = 1; draw(); }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      small.removeEventListener("change", repaint);
      el.removeEventListener("fx:in", fxIn);
      el.removeEventListener("fx:out", fxOut);
      cv.remove();
    };
  });
})();
