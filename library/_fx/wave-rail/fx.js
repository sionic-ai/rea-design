(() => {
  // Edge color band — a band of color segments of varied length flows slowly, and segment thickness ripples between 2~10px with three layered sine waves.
  // The vertical strip sticks to the document scroll and passes along with the page (scroll panel position = document slot), the horizontal band drifts sideways from that spot.
  // Original (WaveRail) values: three waves (wavelength 1229·749·315px, weight .2·.24·.56, phase 0·.37·.72, amplitude period 8.3·5.05·4.65s),
  // Amplitude floor .32, flow period 2.5s, thickness 2 + 8 × (.5 + .5 × clamp(sum × 1.5)), segment length 78~543px (1/4 for horizontal), flow .02px/ms (horizontal .015).
  const WAVES = [
    { len: 1229, weight: 0.2, phase: 0, cycle: 8300 },
    { len: 749, weight: 0.24, phase: 0.37, cycle: 5050 },
    { len: 315, weight: 0.56, phase: 0.72, cycle: 4650 },
  ];
  const TAU = Math.PI * 2;
  const KIND = {
    vertical: { stretch: 1, lenScale: 1, pace: 0.55, drift: 0.02 },
    horizontal: { stretch: 0.7, lenScale: 0.25, pace: 0.35, drift: 0.015 },
  };
  const DEFAULT_COLORS = "--kf-accent, --kf-warning, --kf-success, --kf-danger, --kf-accent-soft, --kf-ink-soft";
  const swell = (x) => 0.5 + 0.5 * Math.sin(TAU * x);
  const rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  kfFx.register("wave-rail", (el, { options, reduce }) => {
    const orient = options.orient === "horizontal" ? "horizontal" : "vertical";
    const horiz = orient === "horizontal", k = KIND[orient];
    const thinMin = +(options.min ?? 2), thinSpan = +(options.span ?? 8);
    const drift = +(options.drift ?? k.drift), pace = +(options.pace ?? k.pace);
    const segMin = +(options["seg-min"] ?? 78) * k.lenScale, segMax = +(options["seg-max"] ?? 543) * k.lenScale;
    const follow = (options.scroll ?? (horiz ? "off" : "on")) === "on";
    const flip = options.flip === "on";
    const names = String(options.colors || DEFAULT_COLORS).split(/[\s,]+/).filter(Boolean);
    if (!names.length) return;

    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = `position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;${flip ? `transform:scale${horiz ? "Y" : "X"}(-1);` : ""}`;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.append(cv);
    const g = cv.getContext("2d");
    if (!g) { cv.remove(); return; }

    let colors = [];
    const readColors = () => { const cs = getComputedStyle(el); colors = names.map((n) => (n.startsWith("--") ? cs.getPropertyValue(n) : n).trim()).filter(Boolean); };
    const thick = (pos, t) => {
      let sum = 0;
      for (const w of WAVES) {
        const amp = 0.32 + 0.68 * swell((t * pace) / w.cycle + w.phase);
        sum += w.weight * amp * Math.sin(TAU * (pos / w.len - (t * pace) / 2500 + w.phase));
      }
      return thinMin + thinSpan * (0.5 + 0.5 * Math.min(1, Math.max(-1, sum * 1.5)));
    };
    const rand = rng(Math.floor(Math.random() * 4294967296));
    let segs = [], across = 0, along = 0, total = 0, last = null, elapsed = 0, raf = 0;
    const grow = (upTo) => {
      let at = segs.length ? segs[segs.length - 1].start + segs[segs.length - 1].len : 0;
      let prev = segs.length ? segs[segs.length - 1].c : null;
      while (at < upTo) {
        const len = segMin + rand() * (segMax - segMin);
        const n = colors.length;
        const c = n === 1 ? 0 : prev === null ? Math.floor(rand() * n) : (prev + 1 + Math.floor(rand() * (n - 1))) % n;
        segs.push({ start: at, len, c }); at += len; prev = c;
      }
      // Drop segments that have fully flowed behind the screen — so the array does not grow when left open a long time
      const off = elapsed * drift - 4;
      while (segs.length > 2 && segs[0].start + segs[0].len < off) segs.shift();
    };
    const size = () => {
      readColors();
      const r = el.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      across = horiz ? r.height : r.width; along = horiz ? r.width : r.height;
      total = follow ? document.documentElement.scrollHeight : along;
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      grow(total + elapsed * drift);
    };
    const pt = (a, b) => (horiz ? [a, b] : [b, a]);
    const draw = () => {
      if (!along || !colors.length) return;
      const scroll = follow ? window.scrollY : 0, shift = elapsed * drift;
      grow(total + shift);
      g.clearRect(0, 0, cv.width, cv.height);
      const lo = Math.max(0, scroll - 2), hi = Math.min(total + shift, scroll + along + 2);
      for (const s of segs) {
        const a = Math.max(s.start - shift, lo), b = Math.min(s.start - shift + s.len + 1, hi);
        if (b <= a) continue;
        g.fillStyle = colors[s.c % colors.length];
        g.beginPath();
        g.moveTo(...pt(a - scroll, 0));
        for (let p = a; p < b; p += 2) g.lineTo(...pt(p - scroll, thick(p / k.stretch, elapsed)));
        g.lineTo(...pt(b - scroll, thick(b / k.stretch, elapsed)));
        g.lineTo(...pt(b - scroll, 0));
        g.closePath();
        g.fill();
      }
    };
    const moving = () => !reduce && document.documentElement.dataset.motionEnabled !== "false";
    const tick = (now) => {
      if (last !== null && moving()) elapsed += Math.max(0, now - last);
      last = now;
      draw();
      raf = requestAnimationFrame(tick);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el); ro.observe(document.body);
    size();
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); cv.remove(); };
  });
})();
