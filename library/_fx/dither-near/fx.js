(() => {
  // 8×8 Bayer threshold (0–63): dots are switched on and off by shaving cell brightness in this order
  const bayer = (x, y) => {
    let v = 0;
    for (let b = 0; b < 3; b++) v |= ((((x ^ y) >> b) & 1) << (5 - 2 * b)) | (((y >> b) & 1) << (4 - 2 * b));
    return v;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  kfFx.register("dither-near", (el, { options, reduce, hover }) => {
    const src = el.querySelector('[data-fx-part="src"]');
    if (!src) return;
    const far = +options.far || 7, near = +options.near || 3.5, range = +options.range || 420;
    const pull = +(options.pull ?? 2), contrast = +(options.contrast ?? 2.2), ease = clamp(+(options.smooth ?? 0.12), 0, 1);
    const cv = document.createElement("canvas");
    cv.className = "fx-dither-near__canvas";
    cv.setAttribute("aria-hidden", "true");
    el.append(cv);
    const x = cv.getContext("2d"), off = document.createElement("canvas"), ox = off.getContext("2d", { willReadFrequently: true });
    let w = 0, h = 0, size = far, want = far, drawn = -1, seen = false;

    const ready = () => (src.tagName === "VIDEO" ? src.readyState >= 2 : src.complete && src.naturalWidth > 0);
    const draw = () => {
      if (!w || !h || !ready()) return;
      const cols = Math.max(1, Math.floor(w / size)), rows = Math.max(1, Math.floor(h / size));
      off.width = cols; off.height = rows;
      ox.imageSmoothingEnabled = true; ox.imageSmoothingQuality = "high";
      const sw = src.videoWidth || src.naturalWidth, sh = src.videoHeight || src.naturalHeight, s = Math.max(cols / sw, rows / sh);
      ox.clearRect(0, 0, cols, rows);
      ox.drawImage(src, (cols - sw * s) / 2, (rows - sh * s) / 2, sw * s, sh * s);
      const d = ox.getImageData(0, 0, cols, rows).data;
      const k = clamp((far - size) / (far - near || 1), 0, 1), pivot = lerp(0.52, 0.34, k), fade = lerp(0.68, 0.9, k), vig = (1 - k) * 0.1, vr = 1 / (1.05 * 1.05);
      const dot = size * 0.5, pad = (size - dot) / 2, dim = new Path2D(), full = new Path2D();
      for (let r = 0; r < rows; r++) {
        const rowFade = fade + (1 - fade) * (r / (rows - 1 || 1)), vy = (r * 2) / (rows - 1 || 1) - 1;
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4, l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
          const vx = (c * 2) / (cols - 1 || 1) - 1, edge = 1 - (vx * vx + vy * vy) * vr;
          const v = clamp((l - pivot) * contrast + pivot, 0, 1) * rowFade * (edge > 0 ? 1 - vig * edge : 1) - (bayer(c % 8, r % 8) + 0.5) / 64;
          if (v > 0) (v > 0.14 ? full : dim).rect(c * size + pad, r * size + pad, dot, dot);
        }
      }
      const style = getComputedStyle(cv);
      x.clearRect(0, 0, w, h);
      x.fillStyle = style.borderTopColor; x.fill(dim);
      x.fillStyle = style.color; x.fill(full);
      drawn = size;
    };
    const fit = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    // Cell size is set by the distance between the cursor and the photo box (0 if inside)
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right), dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      want = lerp(far, near, Math.pow(1 - clamp(Math.hypot(dx, dy) / range, 0, 1), pull));
      if (reduce) { size = want; draw(); }
    };
    const onLeave = () => { want = far; if (reduce) { size = far; draw(); } };
    const tick = () => {
      if (!seen) return;
      const gap = want - size;
      size = Math.abs(gap) < 0.01 || !ease ? want : size + gap * ease;
      if (size !== drawn || (src.tagName === "VIDEO" && !src.paused)) draw();
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !hover) { want = near; if (reduce) size = near; }
      if (seen) draw();
    });
    const ro = new ResizeObserver(fit);
    io.observe(el); ro.observe(el);
    src.addEventListener("load", draw);
    src.addEventListener("loadeddata", draw);
    if (hover) { addEventListener("pointermove", onMove); document.documentElement.addEventListener("pointerleave", onLeave); }
    if (!reduce) gsap.ticker.add(tick);
    return () => {
      io.disconnect(); ro.disconnect();
      src.removeEventListener("load", draw); src.removeEventListener("loadeddata", draw);
      removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("pointerleave", onLeave);
      gsap.ticker.remove(tick);
      cv.remove();
    };
  });
})();
