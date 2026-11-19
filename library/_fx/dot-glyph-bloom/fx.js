(() => {
  // Convert skin variables (including color-mix and oklch) to rgb numbers the canvas can blend — paint onto 1px and read it back
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, name) => {
    const tmp = document.createElement("span");
    tmp.style.color = `var(${name})`;
    el.append(tmp);
    const css = getComputedStyle(tmp).color;
    tmp.remove();
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = css;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const css = ([r, g, b], a = 1) => `rgb(${r | 0} ${g | 0} ${b | 0} / ${a})`;

  // Draws text at four times the cell-count resolution and treats a cell as a text cell if over 40% of its 4×4 samples are filled. The time each cell lights is earlier toward the left and scattered by .45
  function grid(text, cols, w, h, family) {
    const rows = Math.max(1, Math.round(h / (w / cols)));
    const sx = w / cols, sy = h / rows;
    const g = { cols, rows, sx, sy, r: 0.3 * Math.min(sx, sy), glyph: new Uint8Array(cols * rows), th: new Float32Array(cols * rows), bg: [] };
    const off = document.createElement("canvas");
    off.width = cols * 4;
    off.height = rows * 4;
    const o = off.getContext("2d", { willReadFrequently: true });
    o.font = `600 100px ${family}`;
    let m = o.measureText(text);
    const size = Math.min((100 * off.height * 0.6) / (m.actualBoundingBoxAscent || 1), (100 * off.width * 0.88) / ((m.actualBoundingBoxLeft + m.actualBoundingBoxRight) || 1));
    o.font = `600 ${size}px ${family}`;
    m = o.measureText(text);
    o.fillText(text, (off.width - (m.actualBoundingBoxLeft + m.actualBoundingBoxRight)) / 2 + m.actualBoundingBoxLeft, (off.height + m.actualBoundingBoxAscent) / 2);
    const px = o.getImageData(0, 0, off.width, off.height).data;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (px[((4 * y + i) * off.width + 4 * x + j) * 4 + 3] > 127) n++;
      const k = y * cols + x;
      g.glyph[k] = n / 16 > 0.4 ? 1 : 0;
      if (!g.glyph[k]) g.bg.push(k);
      g.th[k] = 0.45 * Math.random() + (x / cols) * 0.45;
    }
    return g;
  }

  kfFx.register("dot-glyph-bloom", (el, { options, reduce }) => {
    const cv = el.querySelector('[data-fx-part="canvas"]');
    const ctx = cv?.getContext("2d");
    const text = (options.text ?? cv?.textContent ?? "").trim();
    if (!cv || !ctx || !text) return;
    const cols = +options.cols || 240;
    const dur = +(options.dur ?? 3), delay = +(options.delay ?? 0.15);

    let base, stops, g = null, w = 0, h = 0, p = 0, raf = 0, visible = false, started = false, done = false, lit = null, sparks = [], last = 0, tween = null;
    const color = (x) => {
      const t = x * (stops.length - 1), i = Math.min(Math.floor(t), stops.length - 2);
      return mix(stops[i], stops[i + 1], t - i);
    };
    const X = (c) => g.sx * (c + 0.5), Y = (r) => g.sy * (r + 0.5);

    function paint(c, s) {
      const { cols: C, rows: R, r, glyph, th } = g;
      c.clearRect(0, 0, w, h);
      c.fillStyle = css(base);
      c.beginPath();
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const k = y * C + x;
        if (glyph[k] && s > th[k]) continue;
        c.moveTo(X(x) + r, Y(y));
        c.arc(X(x), Y(y), r, 0, Math.PI * 2);
      }
      c.fill();
      const blooming = [];
      for (let x = 0; x < C; x++) {
        let open = false;
        for (let y = 0; y < R; y++) {
          const k = y * C + x;
          if (!glyph[k] || s <= th[k]) continue;
          if (s < th[k] + 0.1) { blooming.push(k); continue; }
          if (!open) { c.fillStyle = css(color(x / C)); c.beginPath(); open = true; }
          c.moveTo(X(x) + r, Y(y));
          c.arc(X(x), Y(y), r, 0, Math.PI * 2);
        }
        if (open) c.fill();
      }
      // Cell turning on: the ring spreads from 1.5r to 6r while fading, the dot swells to 2.6x then returns to 1x
      for (const k of blooming) {
        const x = k % C, y = (k / C) | 0, col = color(x / C), u = (s - th[k]) / 0.1;
        const fill = Math.min(u / 0.2, 1);
        const grow = u < 0.25 ? 1 + (u / 0.25) * 1.6 : 2.6 - 1.6 * (1 - (1 - (u - 0.25) / 0.75) ** 3);
        c.strokeStyle = css(col, 0.55 * (1 - u));
        c.lineWidth = 0.6 * r;
        c.beginPath();
        c.arc(X(x), Y(y), r * (1.5 + 4.5 * (1 - (1 - u) ** 3)), 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = css(mix(base, col, fill));
        c.beginPath();
        c.arc(X(x), Y(y), r * grow, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Once fully bloomed, the background dots twinkle one every 10ms in their cell’s color over 1.8 seconds with sine²
    function frame(now) {
      raf = 0;
      if (!g || !visible) return;
      if (!done) { paint(ctx, p); return; }
      if (!lit) {
        lit = document.createElement("canvas");
        lit.width = cv.width;
        lit.height = cv.height;
        const l = lit.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        l.setTransform(dpr, 0, 0, dpr, 0, 0);
        paint(l, 1);
      }
      if (now - last > 250) last = now - 10;
      while (now - last >= 10 && g.bg.length) {
        last += 10;
        sparks.push({ k: g.bg[(Math.random() * g.bg.length) | 0], t: now });
      }
      sparks = sparks.filter((s) => now - s.t < 1800);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(lit, 0, 0, w, h);
      for (const s of sparks) {
        const x = s.k % g.cols, y = (s.k / g.cols) | 0, a = Math.sin(Math.PI * ((now - s.t) / 1800)) ** 2;
        ctx.fillStyle = css(mix(base, color(x / g.cols), 0.55 * a));
        ctx.beginPath();
        ctx.arc(X(x), Y(y), g.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    function measure() {
      const box = cv.getBoundingClientRect();
      if (!box.width || !box.height) return;
      w = box.width;
      h = box.height;
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      base = rgbOf(el, "--fx-dot-base");
      stops = [rgbOf(el, "--fx-dot-a"), rgbOf(el, "--fx-dot-b"), rgbOf(el, "--fx-dot-c")];
      g = grid(text, cols, w, h, getComputedStyle(cv).fontFamily);
      lit = null;
      sparks = [];
      if (reduce || done) paint(ctx, 1); else paint(ctx, p);
      kick();
    }

    const start = () => {
      if (started) return;
      started = true;
      if (reduce) { p = 1; done = true; kick(); return; }
      tween = gsap.to({ v: 0 }, {
        v: 1, duration: dur, delay, ease: "power1.inOut",
        onUpdate() { p = this.targets()[0].v; kick(); },
        onComplete() { done = true; kick(); },
      });
    };

    const ro = new ResizeObserver(() => { document.fonts.ready.then(measure); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && e.intersectionRatio >= (+(options.at ?? 0.6))) start();
      if (visible) kick();
    }, { threshold: [0, +(options.at ?? 0.6)] });
    io.observe(cv);

    return () => {
      ro.disconnect();
      io.disconnect();
      tween?.kill();
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, cv.width, cv.height);
    };
  });
})();
