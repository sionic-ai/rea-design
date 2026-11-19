(() => {
  kfFx.register("glyph-wordmark", (el, { options, reduce, hover }) => {
    const logo = el.querySelector(':scope > [data-fx-part="logo"]');
    if (!hover || !logo || !(logo.tagName === "IMG" || logo.textContent.trim())) return;
    const CHARS = options.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const CELL = +options.cell || 11, GW = CELL, GH = Math.round((CELL * 12) / 11);
    const cv = document.createElement("canvas");
    cv.className = "fx-glyph-wordmark";
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    el.classList.add("fx-glyph-wordmark--on");
    const ctx = cv.getContext("2d");
    const state = { phase: "logo", col: -999, row: -999 };
    let sprite = null, dpr = 0, p = null, W = 0, H = 0, raf = 0, seen = false, live = true;
    const color = () => { const i = document.createElement("i"); i.style.color = "var(--fx-glyph, var(--kf-accent))"; el.append(i); const c = getComputedStyle(i).color; i.remove(); return c; };
    const makeSprite = () => {
      const sw = Math.ceil(GW * dpr), sh = Math.ceil(GH * dpr);
      const c = document.createElement("canvas");
      c.width = sw * CHARS.length; c.height = sh;
      const g = c.getContext("2d");
      g.setTransform(sw / GW, 0, 0, sh / GH, 0, 0);
      g.font = `${CELL - 1}px ${getComputedStyle(el).getPropertyValue("--kf-font-mono") || "monospace"}`;
      g.textBaseline = "top"; g.textAlign = "center";
      g.fillStyle = color();
      [...CHARS].forEach((ch, i) => g.fillText(ch, GW * i + CELL * 0.36, 0));
      sprite = { c, sw, sh };
    };
    // Logo shrunk to cell size — only opaque cells are read, so fill color doesn’t matter
    const sample = (cols, rows) => {
      const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      g.canvas.width = cols; g.canvas.height = rows;
      const box = el.getBoundingClientRect(), r = logo.getBoundingClientRect();
      if (logo.tagName === "IMG") g.drawImage(logo, (r.left - box.left) / CELL, (r.top - box.top) / CELL, r.width / CELL, r.height / CELL);
      else {
        const cs = getComputedStyle(logo), text = logo.textContent.trim();
        g.font = `${cs.fontWeight} 100px ${cs.fontFamily}`;
        const size = Math.min((100 * r.width * 0.92) / g.measureText(text).width, r.height * 1.6);
        g.font = `${cs.fontWeight} ${size / CELL}px ${cs.fontFamily}`;
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(text, (r.left - box.left + r.width / 2) / CELL, (r.top - box.top + r.height / 2) / CELL);
      }
      const d = g.getImageData(0, 0, cols, rows).data;
      const span = cols + 1, on = new Uint8Array(span * rows);
      let count = 0;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (d[(y * cols + x) * 4 + 3] / 255 <= 0.5) continue;
        const k = y * span + x;
        if (!on[k]) on[k] = 1, count++;
        if (!on[k + 1]) on[k + 1] = 1, count++;
      }
      const q = { count, rows, col: new Uint16Array(count), row: new Uint16Array(count), glyph: new Uint8Array(count), x: new Float32Array(count), y: new Float32Array(count), vy: new Float32Array(count), wait: new Uint8Array(count), sx: new Float32Array(count), sy: new Float32Array(count) };
      let i = 0;
      for (let y = 0; y < rows; y++) for (let x = 0; x < span; x++) if (on[y * span + x]) {
        q.col[i] = x; q.row[i] = y; q.glyph[i] = Math.floor(Math.random() * CHARS.length);
        q.sx[i] = (Math.random() - 0.5) * 20; q.sy[i] = (Math.random() - 0.5) * 20; i++;
      }
      return q;
    };
    const step = () => {
      let moving = false, back = state.phase === "returning";
      for (let e = 0; e < p.count; e++) {
        if (p.wait[e] > 0) { p.wait[e]--; moving = true; back = false; continue; }
        if (state.phase === "scattered") {
          p.x[e] += (p.sx[e] - p.x[e]) * 0.075; p.y[e] += (p.sy[e] - p.y[e]) * 0.075;
          if (Math.abs(p.sx[e] - p.x[e]) > 0.01 || Math.abs(p.sy[e] - p.y[e]) > 0.01) moving = true;
        } else if (state.phase === "fallen") {
          const floor = p.rows - 1 - p.row[e];
          p.vy[e] += 0.05; p.y[e] += p.vy[e];
          if (p.y[e] > floor) p.y[e] = floor, p.vy[e] *= -0.25;
          if (p.y[e] < floor || Math.abs(p.vy[e]) > 0.05) moving = true;
        } else if (back) {
          p.x[e] -= 0.05 * p.x[e]; p.y[e] -= 0.05 * p.y[e];
          if (Math.abs(p.x[e]) > 0.05 || Math.abs(p.y[e]) > 0.05) back = false;
          moving = true;
        } else {
          let tx = 0, ty = 0;
          const dx = p.col[e] - state.col, dy = p.row[e] - state.row, d2 = dx * dx + dy * dy;
          if (!reduce && d2 < 100 && d2 > 0) { const d = Math.sqrt(d2), k = (1 - d / 10) * 7; tx = (dx / d) * k; ty = (dy / d) * k; }
          p.x[e] += (tx - p.x[e]) * 0.1; p.y[e] += (ty - p.y[e]) * 0.1;
          if (Math.abs(tx - p.x[e]) > 0.01 || Math.abs(ty - p.y[e]) > 0.01) moving = true;
        }
      }
      if (back) state.phase = "logo";
      return moving;
    };
    const paint = () => {
      ctx.clearRect(0, 0, W, H);
      for (let e = 0; e < p.count; e++) ctx.drawImage(sprite.c, p.glyph[e] * sprite.sw, 0, sprite.sw, sprite.sh, (p.col[e] + p.x[e]) * CELL, (p.row[e] + p.y[e]) * CELL, GW, GH);
    };
    const frame = () => {
      raf = 0;
      if (!p) return;
      const moving = step();
      paint();
      if (moving && seen) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && seen && p) raf = requestAnimationFrame(frame); };
    const build = (force) => {
      if (!live) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (!force && w === W && h === H) return;
      W = w; H = h; p = null;
      const cols = Math.floor(W / CELL), rows = Math.floor(H / CELL);
      if (!cols || !rows) return;
      const r = devicePixelRatio || 1;
      if (r !== dpr) { dpr = r; makeSprite(); }
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      p = sample(cols, rows);
      state.phase = "logo";
      paint();
      kick();
    };
    let wait = 0;
    const ro = new ResizeObserver(() => { clearTimeout(wait); wait = setTimeout(build, 100); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; kick(); });
    io.observe(el);
    const ready = () => build(true);
    if (logo.tagName === "IMG" && !logo.complete) logo.addEventListener("load", ready, { once: true });
    else document.fonts.ready.then(ready);

    // Speech bubble: follows to the cursor position (+10, −14) by .18 each time, hides while moving, and pops out when stopped for 140ms
    const bubble = el.querySelector(':scope > [data-fx-part="bubble"]');
    let inner = null;
    if (bubble) {
      inner = document.createElement("span");
      inner.className = "fx-glyph-wordmark__in";
      inner.append(...bubble.childNodes);
      bubble.append(inner);
      bubble.dataset.visible = "false";
      bubble.setAttribute("aria-hidden", "true");
    }
    const b = { x: -200, y: -200, tx: 0, ty: 0, placed: false };
    let braf = 0, show = 0;
    const follow = () => {
      braf = 0;
      const dx = b.tx - b.x, dy = b.ty - b.y;
      b.x += 0.18 * dx; b.y += 0.18 * dy;
      bubble.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) braf = requestAnimationFrame(follow);
    };
    const visible = (v) => bubble && (bubble.dataset.visible = v ? "true" : "false");
    const move = (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      state.col = x / CELL; state.row = y / CELL;
      if (bubble) {
        b.tx = x + 10; b.ty = y - 14;
        if (!b.placed) b.x = b.tx, b.y = b.ty, b.placed = true;
        if (!braf) braf = requestAnimationFrame(follow);
        visible(false);
        clearTimeout(show);
        show = setTimeout(() => visible(true), 140);
      }
      if (state.phase === "logo") kick();
    };
    const leave = () => {
      state.col = state.row = -999;
      clearTimeout(show);
      visible(false);
      b.placed = false;
      if (state.phase === "logo") kick();
    };
    const press = () => {
      inner?.animate([{ transform: "translateY(-100%) scale(1)" }, { transform: "translateY(-100%) scale(0.82)", offset: 0.35 }, { transform: "translateY(-100%) scale(1)" }], { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
      if (!p || reduce) return;
      const next = { logo: "scattered", scattered: "fallen", fallen: "returning" }[state.phase];
      if (!next) return;
      state.phase = next;
      if (next === "fallen") p.vy.fill(0);
      else for (let e = 0; e < p.count; e++) p.wait[e] = Math.floor(18 * Math.random());
      kick();
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("click", press);
    return () => {
      live = false;
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("click", press);
      logo.removeEventListener("load", ready);
      cancelAnimationFrame(raf); cancelAnimationFrame(braf);
      clearTimeout(wait); clearTimeout(show);
      ro.disconnect(); io.disconnect();
      cv.remove();
      if (inner) { bubble.append(...inner.childNodes); inner.remove(); bubble.style.transform = ""; delete bubble.dataset.visible; }
      el.classList.remove("fx-glyph-wordmark--on");
    };
  });
})();
