(() => {
  // Stamps a photo (or text) as dots at an even spacing, dots within radius around the cursor are pushed away in inverse proportion to distance and pulled back to place by ret each step,
  // Damped each frame with damp. At first the dots are scattered ±4px, then gather. Only places where the photo frame’s alpha exceeds 128 become dots, so a PNG with the background removed is correct
  kfFx.register("dot-repel", (el, { options, reduce }) => {
    const img = el.querySelector('img[data-fx-part="source"]');
    const text = img ? "" : (el.getAttribute("aria-label") || el.textContent).trim();
    if (!img && !text) return;
    const size = +(options.size ?? 1.5), gap = +(options.gap ?? 6), push = +(options.push ?? 15), ret = +(options.ret ?? 0.08), damp = +(options.damp ?? 0.85), radius = +(options.radius ?? 120);
    const fit = options.fit === "contain" ? "contain" : "cover", flip = options.flip === "true";
    const cubic = options.falloff === "cubic", drag = +(options.drag ?? 0), square = options.shape === "square";
    const scatter = +(options.scatter ?? 4), span = +(options.span ?? 0), top = options.top == null ? null : +options.top;
    const keep = el.innerHTML;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("data-fx-part", "canvas");
    if (!img) { el.setAttribute("aria-label", text); el.textContent = ""; }
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    const still = reduce;
    let w = 0, h = 0, n = 0, groups = [], raf = 0, running = false, visible = true;
    let px, py, hx, hy, vx, vy;
    const mouse = { x: -1e3, y: -1e3, vx: 0, vy: 0 };
    const paint = (g, W, H) => {
      if (img && img.naturalWidth) {
        const f = fit === "cover" ? Math.max(W / img.naturalWidth, H / img.naturalHeight) : Math.min(W / img.naturalWidth, H / img.naturalHeight);
        const iw = img.naturalWidth * f, ih = img.naturalHeight * f;
        if (flip) { g.translate(W, 0); g.scale(-1, 1); }
        g.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
        return;
      }
      const cs = getComputedStyle(el);
      g.fillStyle = options.color === "accent" ? cs.getPropertyValue("--kf-accent") || cs.color : cs.color;
      g.textAlign = "center";
      g.textBaseline = top == null ? "middle" : "top";
      let fs = H * 0.8;
      g.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
      const tw = g.measureText(text).width;
      if (span > 0) { fs *= (W * span) / tw; g.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`; }
      else if (tw > W * 0.92) { fs *= (W * 0.92) / tw; g.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`; }
      const dpr = W / Math.max(1, el.clientWidth);
      g.fillText(text, W / 2, top == null ? H / 2 : top * dpr);
    };
    const build = () => {
      w = el.clientWidth; h = el.clientHeight;
      if (!w || !h || !ctx) { n = 0; return; }
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const src = document.createElement("canvas");
      src.width = canvas.width; src.height = canvas.height;
      const g = src.getContext("2d", { willReadFrequently: true });
      paint(g, src.width, src.height);
      let data;
      try { data = g.getImageData(0, 0, src.width, src.height); } catch (e) { n = 0; return; }
      const step = Math.max(1, Math.floor(gap * dpr)), pts = [];
      for (let y = 0; y < data.height; y += step)
        for (let x = 0; x < data.width; x += step) {
          const i = (y * data.width + x) * 4;
          if (data.data[i + 3] > 128) pts.push({ x: x / dpr, y: y / dpr, c: `rgb(${data.data[i]},${data.data[i + 1]},${data.data[i + 2]})` });
        }
      n = pts.length;
      pts.sort((a, b) => (a.c > b.c ? 1 : -1));
      px = new Float32Array(n); py = new Float32Array(n); hx = new Float32Array(n); hy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
      groups = [];
      pts.forEach((p, i) => {
        hx[i] = p.x; hy[i] = p.y;
        px[i] = still ? p.x : p.x + (Math.random() - 0.5) * scatter * 2;
        py[i] = still ? p.y : p.y + (Math.random() - 0.5) * scatter * 2;
        vx[i] = still || !scatter ? 0 : (Math.random() - 0.5) * 2;
        vy[i] = still || !scatter ? 0 : (Math.random() - 0.5) * 2;
        const last = groups[groups.length - 1];
        if (last && last.c === p.c) last.n++; else groups.push({ c: p.c, from: i, n: 1 });
      });
      draw();
      start();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const gr of groups) {
        ctx.fillStyle = gr.c;
        ctx.beginPath();
        if (square) { const half = size / 2; for (let i = gr.from, end = gr.from + gr.n; i < end; i++) ctx.fillRect(px[i] - half, py[i] - half, size, size); continue; }
        for (let i = gr.from, end = gr.from + gr.n; i < end; i++) { ctx.moveTo(px[i] + size, py[i]); ctx.arc(px[i], py[i], size, 0, Math.PI * 2); }
        ctx.fill();
      }
    };
    const r2 = radius * radius;
    const physics = () => {
      const near = mouse.x !== -1e3;
      let moving = false;
      for (let i = 0; i < n; i++) {
        let x = px[i], y = py[i], ux = vx[i], uy = vy[i];
        if (near) {
          const dx = mouse.x - x, dy = mouse.y - y;
          if (dx > -radius && dx < radius && dy > -radius && dy < radius) {
            const d2 = dx * dx + dy * dy;
            if (d2 < r2 && d2 > 0.001) {
              const d = Math.sqrt(d2), nd = d / radius, f = cubic ? 1 - nd * nd * nd : (radius - d) / radius;
              ux -= (dx / d) * f * push - mouse.vx * f * drag; uy -= (dy / d) * f * push - mouse.vy * f * drag;
            }
          }
        }
        ux += (hx[i] - x) * ret; uy += (hy[i] - y) * ret;
        ux *= damp; uy *= damp;
        x += ux; y += uy;
        px[i] = x; py[i] = y; vx[i] = ux; vy[i] = uy;
        if (!moving && (Math.abs(ux) > 0.05 || Math.abs(uy) > 0.05 || Math.abs(hx[i] - x) > 0.1 || Math.abs(hy[i] - y) > 0.1)) moving = true;
      }
      return moving || near;
    };
    const frame = () => {
      if (!running) return;
      const more = physics();
      draw();
      if (more && visible) raf = requestAnimationFrame(frame);
      else { running = false; cancelAnimationFrame(raf); }
    };
    const start = () => { if (still || !visible || running || !n) return; running = true; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const aim = (cx, cy) => {
      const r = canvas.getBoundingClientRect(), x = cx - r.left, y = cy - r.top;
      if (mouse.x !== -1e3) { mouse.vx = mouse.vx * 0.7 + (x - mouse.x) * 0.3; mouse.vy = mouse.vy * 0.7 + (y - mouse.y) * 0.3; }
      mouse.x = x; mouse.y = y; start();
    };
    const onMove = (e) => aim(e.clientX, e.clientY);
    const leave = () => { mouse.x = mouse.y = -1e3; mouse.vx = mouse.vy = 0; start(); };
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; visible ? start() : stop(); }, { rootMargin: "50px" });
    io.observe(el);
    let lastW = 0, lastH = 0;
    const ro = new ResizeObserver(() => { if (el.clientWidth !== lastW || el.clientHeight !== lastH) { lastW = el.clientWidth; lastH = el.clientHeight; build(); } });
    const go = () => ro.observe(el);
    if (img && !img.complete) img.addEventListener("load", go, { once: true }); else go();
    if (img) img.addEventListener("error", go, { once: true });
    document.fonts?.ready.then(() => !img && build());
    if (!still) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", leave, { passive: true });
      addEventListener("scroll", leave, { passive: true, capture: true });
    }
    return () => {
      stop(); io.disconnect(); ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", leave, { capture: true });
      canvas.remove();
      if (!img) { el.innerHTML = keep; el.removeAttribute("aria-label"); }
    };
  });
})();
