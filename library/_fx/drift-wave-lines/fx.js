// Four thin sine wave lines — same createjs Stage·Ticker 60fps as the original (Animate export), each Frame shifts one step sideways, and amplitude (scaleY)·opacity breathe along set lines.
// The canvas is not stretched like the original (isResp false) — the plate’s top left is art coordinate (0,0), if the plate is narrow the right side is cut and line size stays the same on phones
(() => {
  // Values sampled every 12 frames from the original 360-frame line (31 points) — joined by straight lines in between
  const LINES = [
    { half: 267.89, ctrl: 104.6, segs: 10, width: 0.5, x0: 654.7, x1: 1192.15, y: 215.4,
      sy: [0.308, 0.413, 0.509, 0.596, 0.675, 0.744, 0.801, 0.844, 0.867, 0.66, 0.505, 0.439, 0.422, 0.44, 0.479, 0.514, 0.546, 0.575, 0.6, 0.621, 0.637, 0.649, 0.654, 0.651, 0.621, 0.56, 0.472, 0.359, 0.299, 0.281, 0.286],
      a: [0.5, 0.507, 0.513, 0.519, 0.525, 0.531, 0.537, 0.543, 0.549, 0.555, 0.561, 0.568, 0.574, 0.58, 0.586, 0.592, 0.598, 0.604, 0.602, 0.593, 0.584, 0.576, 0.567, 0.558, 0.55, 0.541, 0.532, 0.524, 0.515, 0.506, 0.5] },
    { half: 240.19, ctrl: 120.8, segs: 10, width: 2, x0: 1075.15, x1: 596.05, y: 224.55,
      sy: [0.697, 0.661, 0.625, 0.589, 0.553, 0.516, 0.48, 0.444, 0.408, 0.372, 0.336, 0.3, 0.348, 0.397, 0.446, 0.494, 0.542, 0.591, 0.639, 0.688, 0.723, 0.754, 0.785, 0.816, 0.847, 0.862, 0.828, 0.793, 0.759, 0.726, 0.7],
      a: [1, 0.964, 0.929, 0.893, 0.857, 0.821, 0.786, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75] },
    { half: 240.19, ctrl: 135, segs: 10, width: 1, x0: 1059.25, x1: 582.2, y: 228,
      sy: [0.997, 0.961, 0.925, 0.89, 0.854, 0.818, 0.786, 0.758, 0.729, 0.701, 0.673, 0.645, 0.617, 0.588, 0.56, 0.532, 0.503, 0.475, 0.447, 0.419, 0.42, 0.479, 0.539, 0.598, 0.658, 0.717, 0.777, 0.836, 0.896, 0.955, 1],
      a: [0.304, 0.358, 0.412, 0.466, 0.519, 0.573, 0.594, 0.581, 0.569, 0.557, 0.544, 0.532, 0.52, 0.507, 0.495, 0.482, 0.47, 0.458, 0.445, 0.433, 0.421, 0.408, 0.396, 0.384, 0.371, 0.359, 0.346, 0.334, 0.322, 0.309, 0.3] },
    { half: 240.19, ctrl: 135, segs: 10, width: 1, x0: 1075.3, x1: 600.45, y: 241.05,
      sy: [0.222, 0.232, 0.247, 0.267, 0.303, 0.368, 0.396, 0.356, 0.305, 0.304, 0.308, 0.316, 0.326, 0.339, 0.353, 0.368, 0.381, 0.391, 0.394, 0.383, 0.363, 0.351, 0.345, 0.344, 0.345, 0.347, 0.343, 0.329, 0.306, 0.27, 0.22],
      a: [0.3] },
  ];
  const at = (arr, f) => {
    if (arr.length === 1) return arr[0];
    const p = f * (arr.length - 1), i = Math.floor(p), k = p - i;
    return i >= arr.length - 1 ? arr[arr.length - 1] : arr[i] + (arr[i + 1] - arr[i]) * k;
  };
  kfFx.register("drift-wave-lines", (el, { options, reduce }) => {
    const cjs = window.createjs;
    if (!cjs?.Stage) return;
    const frames = Math.max(2, Math.round((+(options.dur ?? 6) || 6) * 60));
    const scale = +(options.scale ?? 1) || 1;
    const shiftY = +(options["shift-y"] ?? 0);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-wave-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const stage = new cjs.Stage(canvas);
    const color = () => getComputedStyle(el).getPropertyValue("--fx-wave-color").trim() || getComputedStyle(el).getPropertyValue("--kf-ink-soft").trim() || "currentColor";
    const shapes = LINES.map((l) => {
      const s = new cjs.Shape();
      stage.addChild(s);
      return s;
    });
    const paint = () => {
      const c = color();
      shapes.forEach((s, i) => {
        const l = LINES[i], g = s.graphics.clear().setStrokeStyle(l.width, 0, 0, 4).beginStroke(c);
        let x = -(l.half * l.segs) / 2;
        g.moveTo(x, 0);
        for (let k = 0; k < l.segs; k++) { g.quadraticCurveTo(x + l.half / 2, k % 2 ? l.ctrl : -l.ctrl, x + l.half, 0); x += l.half; }
      });
    };
    const size = () => {
      const r = devicePixelRatio || 1, w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
      canvas.width = w * r; canvas.height = h * r;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      stage.scaleX = stage.scaleY = r * scale;
      stage.y = shiftY * r;
    };
    let frame = 0;
    const draw = () => {
      const f = frame / (frames - 1);
      shapes.forEach((s, i) => {
        const l = LINES[i];
        s.x = l.x0 + (l.x1 - l.x0) * f;
        s.y = l.y;
        s.scaleY = at(l.sy, f);
        s.alpha = at(l.a, f);
      });
      stage.update();
    };
    paint(); size(); draw();
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(el);
    if (reduce) return () => { ro.disconnect(); stage.removeAllChildren(); canvas.remove(); };
    let seen = true;
    const io = new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; });
    io.observe(el);
    // Like the original MovieClip, one frame per tick, so if ticks lag the flow slows down with them
    const tick = () => { if (!seen) return; frame = (frame + 1) % frames; draw(); };
    cjs.Ticker.framerate = 60;
    cjs.Ticker.addEventListener("tick", tick);
    return () => { cjs.Ticker.removeEventListener("tick", tick); io.disconnect(); ro.disconnect(); stage.removeAllChildren(); canvas.remove(); };
  });
})();
