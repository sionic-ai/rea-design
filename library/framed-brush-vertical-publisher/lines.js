// White brush strokes in the hero, work panel and footer — the original is eight Lotties baked in After Effects (three layers for PC and phone + the first-entrance piece).
// Same plate size (2880×1760, on phones portrait 1760×2880) · same frame count (29.97fps, loop 240 frames = 8s, first sequence 70 frames) · redraws our lines at the same key times to make Lottie data.
// Line colors are read from the skin (--site-line, --site-draw) — the reason data is built at open time rather than kept in a JSON file.
(() => {
  const FR = 29.9700012207031, LOOP = 240.0000097754, FV = 70.0000028511585;
  const SOFT = { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] } };
  const SOFT2 = { i: { x: 0.833, y: 0.833 }, o: { x: 0.167, y: 0.167 } };

  // Resolve skin variables (even color-mix ones) to computed colors, paint one dot and read as 0~1 values
  const rgba = (name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    document.documentElement.append(probe);
    const css = getComputedStyle(probe).color;
    probe.remove();
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    c.canvas.width = c.canvas.height = 1;
    c.fillStyle = css;
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
  };

  // A list of evenly sampled points joining the control points with Catmull-Rom
  const spline = (pts, n) => {
    const out = [];
    for (let k = 0; k < n; k++) {
      const t = (k / (n - 1)) * (pts.length - 1), i = Math.min(Math.floor(t), pts.length - 2), u = t - i;
      const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
    return out;
  };
  // Brush stroke — a closed outline thick in the middle and thin at both ends (original lines are filled outlines)
  const brush = (pts, width) => {
    const line = spline(pts, 90), left = [], right = [];
    line.forEach((p, k) => {
      const a = line[Math.max(k - 1, 0)], b = line[Math.min(k + 1, line.length - 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const w = (width * (0.18 + 0.82 * Math.pow(Math.sin((Math.PI * k) / (line.length - 1)), 0.7))) / 2;
      left.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
      right.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
    });
    const v = left.concat(right.reverse());
    return { i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: true };
  };
  const open = (pts) => {
    const v = spline(pts, 60);
    return { i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: false };
  };
  const centre = (pts) => pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]);
  const swap = (pts, H) => pts.map(([x, y]) => [y, H - x]);

  // Three lines per panel — 2880×1760 coordinates (original hero flow: a few arcs curving big from top to bottom and arcs crossing diagonally)
  const SETS = [
    [
      [[260, -120], [560, 420], [820, 1060], [700, 1900]],
      [[1700, -100], [1560, 520], [1820, 1200], [2280, 1900]],
      [[3000, 240], [2300, 980], [1300, 1520], [760, 1980]],
    ],
    [
      [[-160, 160], [520, 560], [860, 1180], [640, 1900]],
      [[1230, -120], [880, 380], [560, 1100], [740, 1600], [1100, 1640], [1900, 1180], [2980, -140]],
      [[2500, -140], [2180, 400], [2260, 1100], [2520, 1900]],
    ],
    [
      [[-200, 1500], [700, 1300], [1800, 1250], [3000, 980]],
      [[2780, 1900], [2380, 1500], [2120, 900], [1980, -140]],
    ],
  ];
  const DRIFT = [
    { t: [0, 60, 120, 180, 239], d: [[0, 0], [25, 15], [27, -12], [0, -10], [0, 0]], r: [0, 132, 239, 4], s: [0, 88, 239, 103] },
    { t: [0, 70, 126, 239], d: [[0, 0], [-18, 22], [-24, -6], [0, 0]], r: [0, 141, 239, -3], s: [0, 79, 239, 102] },
    { t: [0, 92, 149, 239], d: [[0, 0], [14, -20], [22, 8], [0, 0]], r: [0, 139, 239, 2], s: [0, 92, 239, 104] },
  ];

  const keys = (times, vals, two) => times.map((t, k) => (k === times.length - 1 ? { t, s: vals[k] } : { ...(two ? SOFT2 : SOFT), t, s: vals[k], ...(two ? { to: [0, 0, 0], ti: [0, 0, 0] } : {}) }));

  function loop(layer, { mobile = false, color } = {}) {
    const W = mobile ? 1760 : 2880, H = mobile ? 2880 : 1760, fill = color || rgba("--site-line");
    const dr = DRIFT[layer];
    const layers = SETS[layer].map((raw, n) => {
      const pts = mobile ? swap(raw, 2880) : raw, c = centre(pts), rel = pts.map(([x, y]) => [x - c[0], y - c[1]]);
      const pos = dr.d.map(([dx, dy]) => [c[0] + dx * (n % 2 ? -1 : 1), c[1] + dy, 0]);
      return {
        ddd: 0, ind: n + 1, ty: 4, nm: `line ${layer + 1}-${n + 1}`, sr: 1, ao: 0, ip: 0, op: LOOP, st: 0, bm: 0,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 1, k: keys([dr.r[0], dr.r[1], dr.r[2]], [[0], [dr.r[3] * (n % 2 ? -1 : 1)], [0]]) },
          p: { a: 1, k: keys(dr.t, pos, true) },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: keys([dr.s[0], dr.s[1], dr.s[2]], [[100, 100, 100], [dr.s[3], dr.s[3], 100], [100, 100, 100]]) },
        },
        shapes: [{ ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: brush(rel, 5 + ((n * 7 + layer * 3) % 5)) } },
          { ty: "fl", c: { a: 0, k: fill }, o: { a: 0, k: 100 }, r: 1 },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ] }],
      };
    });
    return { v: "5.9.0", fr: FR, ip: 0, op: LOOP, w: W, h: H, nm: "lines", ddd: 0, assets: [], layers, markers: [] };
  }

  // First intro — eight white lines are drawn from frame 20 to frame 69 (end 0→100, .333,0 → .667,1) and darken (0→1)
  function firstView({ mobile = false } = {}) {
    const W = mobile ? 1760 : 2880, H = mobile ? 2880 : 1760, white = rgba("--site-draw");
    const all = SETS.flat().concat([[[1400, 1900], [1300, 1200], [1500, 400], [1350, -140]], [[-140, 900], [900, 700], [2000, 300], [3000, 120]]]);
    const widths = [14.3, 11.2, 17.2, 11.7, 12.9, 12.2, 13, 12];
    const layers = all.slice(0, 8).map((raw, n) => ({
      ddd: 0, ind: n + 1, ty: 4, nm: `draw ${n + 1}`, sr: 1, ao: 0, ip: 0, op: FV, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "gr", it: [
        { ty: "sh", ks: { a: 0, k: open(mobile ? swap(raw, 2880) : raw) } },
        { ty: "st", c: { a: 0, k: white }, o: { a: 1, k: [{ ...SOFT, t: 20, s: [0] }, { t: 69, s: [100] }] }, w: { a: 0, k: widths[n] / 2.4 }, lc: 2, lj: 2 },
        { ty: "tm", s: { a: 0, k: 0 }, e: { a: 1, k: [{ i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 20, s: [0] }, { t: 69, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
      ] }],
    }));
    return { v: "5.9.0", fr: FR, ip: 0, op: FV, w: W, h: H, nm: "first view", ddd: 0, assets: [], layers, markers: [] };
  }

  window.ygLines = { loop, firstView };
})();
