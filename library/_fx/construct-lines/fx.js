// Drafting-line panel — on an accent-color panel (brighter by a step on top, coarse grain) orange guide lines lie, and white lines are drawn like a ruler and then retracted
// A 13.013s loop where a circle is drawn as if with a compass, orbits, travels the diagonal and flips. The start and end shapes match, so there’s no seam.
// Values were measured frame by frame from the original looping video (974×974, 30fps, 390 frames) and copied over — positions are a square 0~1, angles are relative to the screen (0° right · 90° down).
(() => {
  const BASE = 13.013;
  const TAU = Math.PI * 2, RAD = Math.PI / 180;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lin = (t, a, b) => clamp((t - a) / (b - a));
  // Connects straight between [time, value, time, value …] — the measured frames are every 0.2 seconds, so curves aren’t fitted separately
  const tab = (k, t) => {
    if (t <= k[0]) return k[1];
    for (let i = 2; i < k.length; i += 2) if (t <= k[i]) return k[i - 1] + ((k[i + 1] - k[i - 1]) * (t - k[i - 2])) / (k[i] - k[i - 2]);
    return k[k.length - 1];
  };

  // Geometry on one frame — the four big circles (bottom·left·top·orbit) lie on an orbit of radius 0.236 around one center, and the outer big circle is their enclosing circle.
  const C = [0.54, 0.534], ORBIT = 0.236, RC = 0.266;
  const G0 = [0.304, 0.533], DIAG = [0.236, 0.235];
  const B0 = [0.6355, 0.533], BU = [-0.83, 0.557], RB = 0.0825;

  // White line: drawn from the start point to the end (a→b), retracted to the start (c→d)
  const LINES = [
    [0.305, 0, 0.305, 1, 1.81, 2.58, 11.02, 11.95],
    [0.719, 1, 0.719, 0, 2.72, 3.58, 10.42, 11.22],
    [0, 0.228, 0.772, 1, 1.07, 1.8, 11.86, 12.56],
    [0, 0.838, 0.838, 0, 1.15, 1.68, 11.98, 12.5],
    [0, 0.005, 1, 0.679, 1.45, 2.1, 11.65, 12.27],
    [0, 1.06, 1, 0.386, 1.45, 2.1, 11.65, 12.27],
  ];
  // Orange guide lines are always laid down — six white lines + a center vertical line + a horizontal line
  const GUIDES = [...LINES.map((l) => l.slice(0, 4)), [0.552, 0, 0.552, 1], [0, 0.533, 1, 0.533]];
  // The center vertical line is white from the start, and its two ends pinch in to the horizontal line height (0.533) and then open out again
  const MID_OUT = [1.67, 1, 1.97, 0.96, 2.27, 0.9, 2.57, 0.8, 2.87, 0.7, 3.17, 0.59, 3.47, 0.5, 3.77, 0.4, 4.07, 0.32, 4.37, 0.24, 4.67, 0.16, 4.97, 0.09, 5.27, 0.04, 5.5, 0];
  const MID_IN = [8.1, 0, 8.5, 0.06, 8.9, 0.11, 9.1, 0.16, 9.3, 0.2, 9.5, 0.25, 9.7, 0.3, 9.9, 0.36, 10.1, 0.42, 10.3, 0.48, 10.5, 0.55, 10.7, 0.62, 10.9, 0.69, 11.1, 0.76, 11.3, 0.83, 11.5, 0.89, 11.7, 0.94, 11.9, 1];

  // How much of the circle is drawn — the half-angle (deg) spreading to both sides from the base angle
  const E_IN = [0.15, 0, 0.6, 10, 0.8, 17, 1, 22, 1.2, 30, 1.4, 40, 1.6, 50, 1.8, 60, 2, 70, 2.2, 80, 2.4, 90, 2.6, 100, 2.8, 110, 3, 128, 3.2, 140, 3.4, 160, 3.6, 180];
  const E_OUT = [10.25, 180, 10.4, 160, 10.6, 150, 10.8, 140, 11, 130, 11.2, 115, 11.4, 105, 11.6, 80, 11.8, 70, 12, 60, 12.2, 45, 12.4, 35, 12.6, 20, 12.8, 10, 13, 0];
  const F_IN = [1.5, 0, 2, 40, 3.8, 180];
  const F_OUT = [9.5, 180, 11, 40, 11.2, 30, 11.4, 18, 11.6, 8, 11.75, 0];
  const G_IN = [0.15, 0, 0.2, 5, 0.4, 20, 0.6, 30, 0.8, 50, 1, 70, 1.2, 100, 1.4, 120, 1.6, 140, 1.8, 160, 2, 175, 2.2, 180];
  const G_OUT = [10.5, 180, 10.68, 150, 10.88, 140, 11.08, 120, 11.28, 115, 11.48, 100, 11.68, 80, 11.88, 60, 12.08, 50, 12.28, 30, 12.48, 20, 12.68, 10, 12.88, 8, 13.02, 0];
  const H_IN = [3.3, 0, 3.4, 20, 3.6, 40, 3.8, 60, 4, 80, 4.2, 110, 4.4, 130, 4.6, 150, 4.8, 170, 5, 180];
  const H_OUT = [7.45, 180, 7.6, 155, 7.8, 140, 8, 130, 8.2, 110, 8.4, 90, 8.6, 60, 8.8, 40, 9, 20, 9.15, 0];
  // Position of the orbit circle (degrees) — starts at the bottom (90°), goes counterclockwise once around, speeding up then slowing down
  const ORB = [0.9, 90, 1, 88.8, 1.2, 87.3, 1.4, 84.9, 1.6, 82.2, 1.8, 78.8, 2.8, 53.7, 3, 47.4, 3.2, 40.6, 3.4, 33.4, 3.6, 25.6, 3.8, 18.4, 4, 9.9, 4.2, 1.7, 4.4, -7.5, 4.6, -16.4, 4.8, -25.4, 5, -34.9, 5.2, -44.2, 5.4, -53.9, 5.6, -63.8, 5.8, -73.3, 6, -82.7, 6.2, -92.7, 6.4, -102.9, 6.6, -112.3, 6.8, -122.5, 7, -131.8, 7.8, -169.9, 8.2, -186.8, 8.4, -194.9, 8.6, -203, 8.8, -210.7, 9, -218.2, 9.2, -225.2, 9.4, -231.7, 9.6, -237.9, 9.8, -243.4, 10, -248.8, 10.2, -253.4, 10.4, -257.8, 10.6, -261.3, 10.8, -264.2, 11, -266.9, 11.2, -268.5, 11.4, -269.8, 11.6, -270];
  const ORB_A = [1.03, 1, 2.3, 0.06, 3.7, 1, 6.22, 1, 7.4, 0.03, 8.85, 1];
  // The left circle rides the diagonal to the lower circle’s spot and back — it almost vanishes midway on the way
  const DG = [2.4, 0, 2.6, 0.04, 2.8, 0.09, 3, 0.157, 3.2, 0.225, 3.8, 0.51, 4, 0.614, 4.2, 0.716, 4.4, 0.814, 4.6, 0.9, 4.8, 0.98, 5, 1, 5.4, 1, 5.6, 0.95, 5.8, 0.88, 6, 0.8, 6.2, 0.72, 7, 0.36, 7.2, 0.29, 7.4, 0.2, 7.6, 0.13, 7.8, 0.05, 8, 0];
  const DG_A = [2.25, 1, 3.45, 0.04, 4.75, 1, 5.45, 1, 6.75, 0.04, 8, 1];
  // A small circle slips off diagonally to the lower left, returns along the same line from the upper right, bounces once and settles
  const B_OUT = [4.85, 0, 5, 0.0145, 5.2, 0.0434, 5.4, 0.0843, 5.6, 0.137, 5.8, 0.196, 6, 0.262, 6.2, 0.335, 6.4, 0.411, 6.6, 0.492, 6.8, 0.576, 7, 0.662, 7.4, 0.834, 7.8, 1.006];
  const B_IN = [8, -0.75, 8.6, -0.595, 9, -0.494, 9.2, -0.443, 9.4, -0.386, 9.6, -0.319, 9.8, -0.251, 10, -0.179, 10.21, -0.108, 10.34, -0.0605, 10.48, -0.0185, 10.54, 0, 10.61, -0.0102, 10.68, -0.0198, 10.81, -0.0367, 10.97, -0.043, 11.14, -0.04, 11.28, -0.0355, 11.6, -0.02, 12, -0.006, 12.8, 0];
  // Shrinking concentric circles — three are born in turn inside the circle and shrink toward the center (radius ratio / progress 0~1)
  const RING_B = [0, 1, 0.115, 0.9, 0.18, 0.854, 0.246, 0.793, 0.311, 0.72, 0.377, 0.634, 0.443, 0.561, 0.508, 0.488, 0.574, 0.415, 0.639, 0.341, 0.705, 0.28, 0.77, 0.195, 0.836, 0.134, 0.9, 0.085, 0.967, 0.049, 1, 0];
  const RING_G = [0, 1, 0.074, 0.985, 0.131, 0.97, 0.186, 0.936, 0.241, 0.898, 0.296, 0.85, 0.351, 0.789, 0.405, 0.726, 0.46, 0.654, 0.515, 0.579, 0.57, 0.504, 0.625, 0.429, 0.68, 0.353, 0.734, 0.282, 0.789, 0.214, 0.844, 0.154, 0.899, 0.105, 0.953, 0.056, 1, 0];
  const RING_A = [0.5, 0.38, 0.2];

  const arc = (out, a, c, r, pivot, half, sx = 1) => {
    if (half <= 0.2 || a <= 0.003) return;
    out.push({ k: "arc", a, c, r, s: (pivot - half) * RAD, e: (pivot + half) * RAD, sx });
  };
  // Scene for one loop of 0 to 13.013s — 0 to 1 coordinates on a square the length of the layer’s long side (same as video cover)
  const scene = (t) => {
    const out = GUIDES.map((p) => ({ k: "line", g: 1, a: 0.85, p, f0: 0, f1: 1 }));
    for (const [x1, y1, x2, y2, a, b, c, d] of LINES) {
      const k = Math.min(lin(t, a, b), 1 - lin(t, c, d));
      if (k > 0) out.push({ k: "line", a: 0.85, p: [x1, y1, x2, y2], f0: 0, f1: k });
    }
    const mk = t < 7 ? tab(MID_OUT, t) : tab(MID_IN, t);
    if (mk > 0) out.push({ k: "line", a: 0.85, p: [0.552, 0, 0.552, 1], f0: 0.533 * (1 - mk), f1: 0.533 + 0.467 * mk });

    arc(out, 0.8, [0.54, 0.532], 0.502, 170, t < 7 ? tab(E_IN, t) : tab(E_OUT, t));
    arc(out, 0.8, [1.168, 0.533], 0.211, 180, t < 7 ? tab(F_IN, t) : tab(F_OUT, t));
    const f = tab(DG, t);
    arc(out, 0.8 * tab(DG_A, t), [G0[0] + DIAG[0] * f, G0[1] + DIAG[1] * f], RC, 180, t < 6 ? tab(G_IN, t) : tab(G_OUT, t));
    const th = tab(ORB, t) * RAD;
    arc(out, 0.8 * tab(ORB_A, t), [C[0] + ORBIT * Math.cos(th), C[1] + ORBIT * Math.sin(th)], RC, 0, 180);
    arc(out, 0.8, [0.54, 0.298], RC, 270, t < 6 ? tab(H_IN, t) : tab(H_OUT, t), Math.cos(lin(t, 6.52, 7.64) * Math.PI));
    const s = t < 7.9 ? tab(B_OUT, t) : tab(B_IN, t);
    arc(out, 0.8, [B0[0] + BU[0] * s, B0[1] + BU[1] * s], RB, 0, 180);
    for (let i = 0; i < 3; i++) {
      const ub = (t - 0.55 - i * 0.6) / 3.05;
      if (ub > 0 && ub < 1) arc(out, 0.8 * RING_A[i], B0, RB * tab(RING_B, ub), 0, 180);
      const ug = (t - 8 - i * 0.4) / 3.65;
      if (ug > 0 && ug < 1) arc(out, 0.8 * RING_A[i], G0, RC * tab(RING_G, ug), 0, 180);
    }
    return out;
  };

  // Canvas can’t read CSS variables, so paint 1px and convert to rgb — color-mix and oklch pass through as they are
  let probe;
  const toRGB = (color) => {
    probe = probe || document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const rgba = (c, a) => `rgb(${c[0]} ${c[1]} ${c[2]} / ${a})`;
  const colorVar = (el, name) => {
    const tmp = document.createElement("i");
    tmp.style.cssText = `position:absolute;color:var(${name})`;
    el.append(tmp);
    const c = getComputedStyle(tmp).color;
    tmp.remove();
    return c;
  };

  kfFx.register("construct-lines", (el, { options, reduce }) => {
    const loopLen = +options.loop || BASE;
    const still = options.still != null && options.still !== "" ? +options.still : null;
    const offset = +(options.offset ?? 0);
    const grainOn = (options.grain ?? "on") !== "off";
    // The original subsection header image is a single construction-line drawing scaled 1.42x with the bottom cropped, so it takes the zoom and the point that should sit at the center of the plate
    const zoom = +options.zoom || 1;
    const at = String(options.at ?? "0.5 0.5").trim().split(/\s+/).map(Number);
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.dataset.fxPart = "canvas";
    el.prepend(cv);
    const ctx = cv.getContext("2d");
    if (!ctx) { cv.remove(); return; }
    let W = 1, H = 1, dpr = 1, grain = null, cols = null, visible = true, raf = 0;

    const read = () => {
      cols = {
        top: toRGB(colorVar(el, "--fx-cl-top")),
        bot: toRGB(colorVar(el, "--fx-cl-bottom")),
        line: toRGB(colorVar(el, "--fx-cl-line")),
        guide: toRGB(colorVar(el, "--fx-cl-guide")),
        lite: toRGB(colorVar(el, "--kf-on-accent")),
        dark: toRGB(colorVar(el, "--kf-ink")),
      };
      if (!grainOn) { grain = null; return; }
      const g = document.createElement("canvas");
      g.width = g.height = 192;
      const gx = g.getContext("2d");
      const img = gx.createImageData(192, 192);
      for (let i = 0; i < img.data.length; i += 4) {
        const r = Math.random(), c = r < 0.5 ? cols.dark : cols.lite;
        img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2];
        img.data[i + 3] = r < 0.5 ? r * 70 : (r - 0.5) * 46;
      }
      gx.putImageData(img, 0, 0);
      grain = ctx.createPattern(g, "repeat");
    };
    const size = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr;
      cv.height = H * dpr;
    };
    const draw = (sec) => {
      const t = ((((sec % loopLen) + loopLen) % loopLen) * BASE) / loopLen;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, rgba(cols.top, 1));
      bg.addColorStop(1, rgba(cols.bot, 1));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      if (grain) { ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); }
      const S = Math.max(W, H) * zoom, ox = W / 2 - (at[0] ?? 0.5) * S, oy = H / 2 - (at[1] ?? 0.5) * S;
      const X = (u) => ox + u * S, Y = (v) => oy + v * S;
      ctx.lineCap = "round";
      for (const e of scene(t)) {
        ctx.strokeStyle = rgba(e.g ? cols.guide : cols.line, e.a);
        ctx.lineWidth = e.g ? 1 : Math.max(1, S / 620);
        ctx.beginPath();
        if (e.k === "line") {
          const [x1, y1, x2, y2] = e.p;
          ctx.moveTo(X(x1 + (x2 - x1) * e.f0), Y(y1 + (y2 - y1) * e.f0));
          ctx.lineTo(X(x1 + (x2 - x1) * e.f1), Y(y1 + (y2 - y1) * e.f1));
        } else if (e.sx === 1) {
          ctx.arc(X(e.c[0]), Y(e.c[1]), e.r * S, e.s, e.e);
        } else {
          ctx.ellipse(X(e.c[0]), Y(e.c[1]), Math.max(0.5, Math.abs(e.sx) * e.r * S), e.r * S, 0, e.s, e.e);
        }
        ctx.stroke();
      }
    };
    const frozen = () => still != null || reduce;
    const now = () => (frozen() ? (still ?? 4.2) + offset : performance.now() / 1000 + offset);
    read();
    size();
    draw(now());
    const ro = new ResizeObserver(() => { size(); draw(now()); });
    ro.observe(el);
    const io = new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; });
    io.observe(el);
    const tick = () => { raf = requestAnimationFrame(tick); if (visible) draw(now()); };
    if (!frozen()) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.remove();
    };
  });
})();
