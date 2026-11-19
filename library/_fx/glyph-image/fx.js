(() => {
  const RAMP = ["·", ":", "/", "+", "×", "#", "■"];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // Same value for every cell — reveal order
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };

  kfFx.register("glyph-image", (el, { options, reduce }) => {
    const src = el.querySelector('[data-fx-part="src"]');
    if (!src) return;
    const dark = /dark/.test(options.look || ""), base = +options.cell || 6, fitH = +(options.fit ?? 0.94), min = +(options.min ?? 0.03);
    const gamma = +(options.gamma ?? 0.85), dur = +(options.dur ?? 1.1), delay = +(options.delay ?? 0.15), frames = +options.frames || 1, fps = +options.fps || 16;
    const SS = 2;
    const cv = document.createElement("canvas");
    cv.className = "fx-glyph-image__canvas";
    cv.setAttribute("aria-hidden", "true");
    el.append(cv);
    const x = cv.getContext("2d"), off = document.createElement("canvas"), ox = off.getContext("2d", { willReadFrequently: true });
    const st = { reveal: reduce ? 1 : 0 };
    let w = 0, h = 0, cell = base, cols = 0, rows = 0, vals = null, sampled = -1, shown = -2, play = 0, seen = false, tw = null;

    const ready = () => (src.tagName === "VIDEO" ? src.readyState >= 2 : src.complete && src.naturalWidth > 0);
    // Places the photo (one for a band) centered at the cell height’s fit, reads it at SS times to get the cell value
    const sample = (frame) => {
      if (!ready() || !cols) return;
      const fw = (src.videoWidth || src.naturalWidth) / frames, fh = src.videoHeight || src.naturalHeight;
      let dh = rows * fitH, dw = dh * (fw / fh);
      if (dw > cols * 0.98) { dw = cols * 0.98; dh = dw / (fw / fh); }
      ox.clearRect(0, 0, off.width, off.height);
      ox.imageSmoothingEnabled = true; ox.imageSmoothingQuality = "high";
      ox.drawImage(src, fw * frame, 0, fw, fh, ((cols - dw) / 2) * SS, ((rows - dh) / 2) * SS, dw * SS, dh * SS);
      const d = ox.getImageData(0, 0, off.width, off.height).data, W = cols * SS;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        let sum = 0, hit = 0;
        for (let v = 0; v < SS; v++) for (let u = 0; u < SS; u++) {
          const p = ((r * SS + v) * W + c * SS + u) * 4, lum = (d[p] + d[p + 1] + d[p + 2]) / 765, k = (dark ? 1 - lum : lum) * (d[p + 3] / 255);
          sum += k; if (k > 0.55) hit++;
        }
        const mean = sum / (SS * SS), fill = hit / (SS * SS);
        vals[r * cols + c] = Math.pow(mean < 0.5 && fill >= 0.4 ? Math.max(mean, Math.min(0.9, fill * 1.6)) : mean, gamma);
      }
      sampled = frame;
    };
    const draw = () => {
      if (!vals || sampled < 0) return;
      const style = getComputedStyle(cv), tones = [style.color, style.borderTopColor, style.outlineColor];
      x.clearRect(0, 0, w, h);
      x.textAlign = "center"; x.textBaseline = "middle";
      x.font = `400 ${Math.round(cell * 1.15)}px ${style.fontFamily}`;
      const x0 = (w - cols * cell) / 2 + cell / 2, y0 = (h - rows * cell) / 2 + cell / 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (st.reveal < 1 && hash(c, r) > st.reveal) continue;
        const v = vals[r * cols + c];
        if (v < min) continue;
        const q = clamp(v, 0, 0.999);
        x.fillStyle = tones[q > 0.55 ? 0 : q > 0.22 ? 1 : 2];
        x.fillText(RAMP[Math.floor(q * RAMP.length)], x0 + c * cell, y0 + r * cell);
      }
      shown = sampled;
    };
    const frameNow = () => Math.floor(play) % frames;
    const fit = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cell = h < 420 ? Math.max(2, base * (4 / 6)) : base;
      cols = Math.floor(w / cell); rows = Math.floor(h / cell);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = Math.max(1, cols * SS); off.height = Math.max(1, rows * SS);
      vals = new Float32Array(Math.max(1, cols * rows));
      sample(frameNow()); draw();
    };
    const reload = () => { sample(frameNow()); draw(); };
    const io = new IntersectionObserver(([e]) => {
      const was = seen;
      seen = e.isIntersecting;
      if (!seen || was || reduce) return;
      tw?.kill();
      st.reveal = 0;
      draw();
      tw = gsap.to(st, { reveal: 1, duration: dur, delay, ease: "power2.out" });
    });
    const tick = (time, delta) => {
      if (!seen) return;
      if (frames > 1) play = (play + (Math.min(delta, 50) / 1000) * fps) % frames;
      const f = frameNow(), live = src.tagName === "VIDEO" && !src.paused;
      if (f !== sampled || live) sample(f);
      if (shown !== sampled || st.reveal < 1 || live) draw();
    };
    const ro = new ResizeObserver(fit);
    io.observe(el); ro.observe(el);
    src.addEventListener("load", reload);
    src.addEventListener("loadeddata", reload);
    if (!reduce) gsap.ticker.add(tick);
    return () => {
      io.disconnect(); ro.disconnect(); tw?.kill();
      src.removeEventListener("load", reload); src.removeEventListener("loadeddata", reload);
      gsap.ticker.remove(tick);
      cv.remove();
    };
  });
})();
