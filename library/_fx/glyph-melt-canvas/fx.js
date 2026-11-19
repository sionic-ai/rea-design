(() => {
  // Wrap text by word to fit the column count — one character per fixed-width grid cell
  const wrap = (text, n) => {
    const out = [];
    for (const para of String(text).split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        if (!line) line = word;
        else if (line.length + 1 + word.length <= n) line += " " + word;
        else { out.push(line); line = word; }
        while (line.length > n) { out.push(line.slice(0, n)); line = line.slice(n); }
      }
      out.push(line);
    }
    return out;
  };
  const clamp = (v, a, b) => Math.max(Math.min(v, Math.max(a, b)), Math.min(a, b));
  const norm = (a, b, v) => (v - a) / (b - a);

  kfFx.register("glyph-melt-canvas", (el, { options, reduce, hover }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')];
    if (!cols.length || !window.Noise) return;
    let canvas = el.querySelector('[data-fx-part="canvas"]');
    const made = !canvas;
    if (made) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("data-fx-part", "canvas");
      el.prepend(canvas);
    }
    const ctx = canvas.getContext("2d");
    const scroller = el.querySelector('[data-fx-part="scroller"]');
    const track = el.querySelector('[data-fx-part="track"]');
    const o = {
      size: +(options.size || 10),
      line: +(options.line || 1.3),
      amp: +(options.amp ?? 1800),
      speed: +(options.speed ?? 1),
      gutter: +(options.gutter ?? 10.4),
      seed: options.seed,
    };
    const rnd = () => (o.seed != null ? +o.seed : Math.random());
    const nx = new Noise(rnd()), ny = new Noise(rnd() * 0.37 + 0.11), na = new Noise(rnd() * 0.71 + 0.05);
    const css = getComputedStyle(el);
    const font = `${o.size}px ${css.fontFamily}`;
    let cw = o.size * 0.6, ch = o.size * o.line, W = 0, H = 0, texts = [], hot = null, scroll = 0, raf = 0;
    const t0 = performance.now();

    const measure = () => {
      ctx.font = font;
      cw = ctx.measureText("X").width || cw;
      ch = o.size * o.line;
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      // Column position is relative to the left end inside the panel (track) — scroll is added while drawing
      texts = cols.filter((c) => c.offsetParent !== null).map((c) => {
        const width = c.offsetWidth - o.gutter;
        const src = c.querySelector('[data-fx-part="text"]');
        return { el: c, left: c.offsetLeft + o.gutter, width, lines: wrap((src ? src.textContent : c.getAttribute("data-text") || "").trim(), Math.max(1, Math.floor(width / cw))) };
      });
    };
    const colAt = (x) => texts.find((t) => x >= t.left - o.gutter && x < t.left - o.gutter + t.width + o.gutter);
    const glyph = (x, y) => {
      if (y < 0) return [" ", null];
      const t = texts.find((c) => x >= c.left && x < c.left + c.width);
      if (!t) return [" ", null];
      const row = Math.floor(y / ch);
      if (row >= t.lines.length) return [" ", t];
      const line = t.lines[row];
      const f = (x - t.left) / cw, i = Math.abs(f - Math.floor(f) - 1) < 1e-6 ? Math.ceil(f) : Math.floor(f);
      return i >= line.length ? [" ", t] : [line[i], t];
    };
    // Original formula: top row stays, going down by (y share)² — noise strength 1.5–4x, flowing .1 per second
    const shift = (x, y, n) => {
      const m = Math.max(W, H);
      const depth = Math.pow(clamp(norm(ch, H, y), 0, 1), 2);
      const v = na.simplex3((x / m) * 3, (y / m) * 3 - 0.1 * n, 0.03 * n);
      const a = -1 + 5 * norm(-1, 1, v * v);
      const p = [(x / m - 0.5) * a * 2, (y / m - 0.5) * a - 0.08 * n, 0.1 * n];
      return [nx.simplex3(p[0], p[1], p[2]) * o.amp * depth * 2, ny.simplex3(p[0], p[1], p[2]) * o.amp * depth];
    };
    const draw = () => {
      const n = reduce ? 0 : ((performance.now() - t0) / 1000) * o.speed;
      const root = getComputedStyle(document.documentElement);
      const ink = root.getPropertyValue("--kf-ink").trim() || "currentColor";
      const red = root.getPropertyValue("--kf-accent").trim() || ink;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.textBaseline = "top";
      ctx.font = font;
      let s = -scroll + o.gutter;
      while (s + cw < 0) s += cw;
      for (let y = 0; y < H; y += ch) {
        let run = "", color = ink, from = s;
        for (let x = s; x < W; x += cw) {
          const d = shift(x, y, n);
          const [c, t] = glyph(x + d[0] + scroll, y + d[1]);
          const want = t && hot && t.el === hot ? red : ink;
          if (want !== color) { ctx.fillStyle = color; ctx.fillText(run.toUpperCase(), from, y); from = x; run = ""; }
          color = want;
          run += c;
        }
        ctx.fillStyle = color;
        ctx.fillText(run.toUpperCase(), from, y);
      }
    };
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };

    const setHot = (c) => {
      if (hot === c) return;
      hot?.classList.remove("is-hot");
      hot = c;
      hot?.classList.add("is-hot");
      if (reduce) draw();
    };
    const syncScroll = () => {
      scroll = scroller ? scroller.scrollLeft : 0;
      if (track) track.style.transform = `translateX(${-scroll}px)`;
      if (reduce) draw();
    };

    const offs = [];
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); };
    const target = scroller || el;
    if (hover) {
      on(target, "mousemove", (e) => { const r = el.getBoundingClientRect(); setHot(colAt(e.clientX - r.left + scroll)?.el || null); });
      on(target, "mouseleave", () => setHot(null));
    }
    if (scroller) {
      on(scroller, "scroll", syncScroll, { passive: true });
      // Dragging with the mouse pushes the panel (original use-gesture drag) — released within 3px it counts as a press and goes to that pillar’s link
      let down = null;
      on(scroller, "pointerdown", (e) => { if (e.pointerType === "mouse" && e.button === 0) down = { x: e.clientX, moved: 0 }; });
      on(window, "pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - down.x;
        down.x = e.clientX;
        down.moved += Math.abs(dx);
        scroller.scrollBy(-dx, 0);
      });
      on(window, "pointerup", (e) => {
        if (!down) return;
        const tap = down.moved < 3;
        down = null;
        if (!tap) return;
        const r = el.getBoundingClientRect();
        const c = colAt(e.clientX - r.left + scroll);
        const href = c && (c.el.getAttribute("data-href") || c.el.querySelector("a[href]")?.getAttribute("href"));
        if (href) location.href = href;
      });
    }

    const ro = new ResizeObserver(() => { measure(); if (reduce) draw(); });
    ro.observe(canvas);
    cols.forEach((c) => ro.observe(c));
    measure();
    syncScroll();
    // Like the original (FontLoader), drawing starts only after the grid font has fully loaded — drawing earlier sets cells at fallback font width and then shifts
    let gone = false;
    const start = () => {
      if (gone) return;
      measure();
      if (reduce) draw();
      else if (!raf) raf = requestAnimationFrame(loop);
    };
    const fontReady = document.fonts ? Promise.race([document.fonts.load(font), new Promise((r) => setTimeout(r, 3000))]) : Promise.resolve();
    fontReady.then(start, start);

    return () => {
      gone = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      offs.forEach((f) => f());
      hot?.classList.remove("is-hot");
      if (track) track.style.transform = "";
      if (made) canvas.remove();
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
})();
