(() => {
  // Original (bottom of the music section’s hero): 88-key canvas (below width 700, four octaves 36~83). Black keys are .6 of a white key’s width and .62 of its height.
  // A hovered key gets +.14, pressing or dragging while pressed lights it to 1, and every light cools ×.93 per frame. When idle, every 70 frames any key in the middle 40% of the range lights to .28.
  // The glow goes from top --kf-accent-text (intensity .95) to bottom --kf-accent (.15), 18px blur. Sound is a short triangle wave (turn off with option sound: off)
  kfFx.register("glow-piano-keys", (el, { options, reduce }) => {
    const cv = el.tagName === "CANVAS" ? el : el.querySelector('[data-fx-part="keys"]') || el.appendChild(Object.assign(document.createElement("canvas"), { className: "fx-piano-made" }));
    const made = cv.classList.contains("fx-piano-made");
    const g = cv.getContext("2d");
    if (!g) return;
    const decay = +(options.decay ?? 0.93), idle = +(options.idle ?? 70), touch = +(options.hover ?? 0.14);
    const css = getComputedStyle(cv);
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (name) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = css.getPropertyValue(name).trim(); probe.fillRect(0, 0, 1, 1); return [...probe.getImageData(0, 0, 1, 1).data].slice(0, 3).join(" "); };
    let INK, ACC, ACC2, DARK;
    const readColors = () => { INK = rgb("--kf-ink"); ACC = rgb("--kf-accent"); ACC2 = rgb("--kf-accent-text"); DARK = rgb("--kf-raised"); };
    readColors();
    const BLACK = new Set([1, 3, 6, 8, 10]);
    let keys = [], glow = new Float32Array(0), freqs = [], W = 0, H = 0, pr = 1, over = -1, down = false, last = -1, frame = 0, raf = 0, seen = true, actx;
    const layout = () => {
      pr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return;
      cv.width = W * pr; cv.height = H * pr;
      const narrow = W < +(options.narrow ?? 700);
      const lo = narrow ? 36 : 21, hi = narrow ? 83 : 108;
      const whites = [];
      for (let m = lo; m <= hi; m++) if (!BLACK.has(m % 12)) whites.push(m);
      const kw = W / whites.length;
      keys = [];
      for (let m = lo; m <= hi; m++) keys.push(BLACK.has(m % 12) ? { black: true, x: (whites.indexOf(m - 1) + 1) * kw - 0.3 * kw, w: 0.6 * kw, h: 0.62 * H, m } : { black: false, x: whites.indexOf(m) * kw, w: kw, h: H, m });
      freqs = keys.map((k) => 440 * Math.pow(2, (k.m - 69) / 12));
      glow = new Float32Array(keys.length);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(cv);
    const at = (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      for (let i = 0; i < keys.length; i++) { const k = keys[i]; if (k.black && x >= k.x && x <= k.x + k.w && y <= k.h) return i; }
      for (let i = 0; i < keys.length; i++) { const k = keys[i]; if (!k.black && x >= k.x && x < k.x + k.w) return i; }
      return -1;
    };
    const tone = (f) => {
      if (options.sound === "off") return;
      try {
        actx ||= new (window.AudioContext || window.webkitAudioContext)();
        const o = actx.createOscillator(), v = actx.createGain(), t = actx.currentTime;
        o.type = "triangle"; o.frequency.value = f;
        v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.18, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        o.connect(v).connect(actx.destination); o.start(t); o.stop(t + 1.7);
      } catch (err) { /* Silent environments get light only */ }
    };
    const strike = (i) => { if (i < 0 || i === last) return; last = i; glow[i] = 1; tone(freqs[i]); };
    const onDown = (e) => { down = true; last = -1; strike(at(e)); };
    const onMove = (e) => { over = at(e); if (down) strike(over); };
    const onUp = () => { down = false; last = -1; };
    const onLeave = () => { over = -1; down = false; };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    cv.addEventListener("pointerleave", onLeave);
    const key = (k, i) => {
      const n = glow[i] + (i === over ? touch : 0), lift = n > 0.3 ? 2 : 0;
      if (k.black) { g.fillStyle = `rgb(${DARK})`; g.fillRect(k.x, 0, k.w, k.h + lift); g.strokeStyle = `rgb(${INK} / .16)`; g.strokeRect(k.x + 0.5, -1, k.w - 1, k.h + lift); }
      else { g.fillStyle = `rgb(${INK} / .035)`; g.fillRect(k.x, 0, k.w, k.h); g.strokeStyle = `rgb(${INK} / .15)`; g.strokeRect(k.x + 0.5, -1, k.w - 1, k.h + 4); }
      if (n > 0.01) {
        const gr = g.createLinearGradient(0, 0, 0, k.h);
        gr.addColorStop(0, `rgb(${ACC2} / ${0.95 * Math.min(1, n)})`);
        gr.addColorStop(1, `rgb(${ACC} / ${0.15 * Math.min(1, n)})`);
        g.fillStyle = gr; g.shadowColor = `rgb(${ACC2} / ${0.8 * Math.min(1, n)})`; g.shadowBlur = 18 * n;
        g.fillRect(k.x + 1, lift, k.w - 2, k.h - 1); g.shadowBlur = 0;
      }
    };
    const draw = () => {
      frame += 1;
      if (!reduce && idle > 0 && frame % idle === 0 && keys.length) { const i = Math.floor(keys.length * (0.3 + 0.4 * Math.random())); glow[i] = Math.max(glow[i], 0.28); }
      g.setTransform(pr, 0, 0, pr, 0, 0); g.clearRect(0, 0, W, H);
      keys.forEach((k, i) => !k.black && key(k, i));
      keys.forEach((k, i) => k.black && key(k, i));
      for (let i = 0; i < glow.length; i++) glow[i] *= decay;
      raf = seen ? requestAnimationFrame(draw) : 0;
    };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(draw); });
    io.observe(cv);
    draw();
    return () => {
      cancelAnimationFrame(raf); raf = 0; seen = false;
      io.disconnect(); ro.disconnect();
      cv.removeEventListener("pointerdown", onDown); cv.removeEventListener("pointermove", onMove); cv.removeEventListener("pointerleave", onLeave);
      removeEventListener("pointerup", onUp);
      actx?.close?.();
      if (made) cv.remove(); else g.clearRect(0, 0, cv.width, cv.height);
    };
  });
})();
