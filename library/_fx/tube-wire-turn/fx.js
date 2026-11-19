// Draws several adjoining cylinders (vases · pillars) with thin lines, and the camera turns with scroll — a row of black dots seen from above → hollow circles → a slanted lying view →
// Upright front → turned sideways → slanted isometric. Each cylinder’s outer outline is filled with the background color and then the lines are drawn (farthest first) so rear lines are hidden.
// scene: room places three vases of different sizes on a table and bench along the same line, and the line is drawn as you scroll.
(() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const rad = (d) => (d * Math.PI) / 180;

  // Scene path — per progress (0~1): camera (pitch·yaw·roll too), fill (0~1), size (zoom)
  const PATHS = {
    story: [
      { at: 0, pitch: 90, yaw: 0, roll: 90, fill: 1, zoom: 0.8 },
      { at: 0.16, pitch: 90, yaw: 0, roll: 90, fill: 0, zoom: 0.8 },
      { at: 0.36, pitch: 58, yaw: 0, roll: 48, fill: 0, zoom: 0.9 },
      { at: 0.56, pitch: 8, yaw: 0, roll: 0, fill: 0, zoom: 1 },
      { at: 0.8, pitch: 10, yaw: -38, roll: 0, fill: 0, zoom: 1 },
      { at: 1, pitch: 24, yaw: 32, roll: -6, fill: 0, zoom: 0.92 },
    ],
    front: [{ at: 0, pitch: 12, yaw: -18, roll: 0, fill: 0, zoom: 1 }],
    turn: [
      { at: 0, pitch: 8, yaw: -40, roll: 0, fill: 0, zoom: 1 },
      { at: 1, pitch: 8, yaw: 40, roll: 0, fill: 0, zoom: 1 },
    ],
  };
  const poseAt = (path, p) => {
    if (path.length === 1 || p <= path[0].at) return path[0];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      if (p <= b.at) {
        const t = smooth(clamp((p - a.at) / (b.at - a.at)));
        return { pitch: mix(a.pitch, b.pitch, t), yaw: mix(a.yaw, b.yaw, t), roll: mix(a.roll, b.roll, t), fill: mix(a.fill, b.fill, t), zoom: mix(a.zoom, b.zoom, t) };
      }
    }
    return path[path.length - 1];
  };

  // Orthographic projection — yaw (vertical axis) → pitch (horizontal axis, looking down from above) → roll (screen axis)
  const camera = (pose) => {
    const cy = Math.cos(rad(pose.yaw)), sy = Math.sin(rad(pose.yaw));
    const cp = Math.cos(rad(pose.pitch)), sp = Math.sin(rad(pose.pitch));
    const cr = Math.cos(rad(pose.roll)), sr = Math.sin(rad(pose.roll));
    return ([x, y, z]) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      return [x1 * cr - y2 * sr, x1 * sr + y2 * cr, z2];
    };
  };

  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }

  // One cylinder = Bottom center (bx, bz), radius r, height h
  function drawTube(c, proj, t, toScreen, ink, bg, fill, reveal, dark = ink) {
    const N = 40, top = [], bot = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU, x = t.x + Math.cos(a) * t.r, z = t.z + Math.sin(a) * t.r;
      top.push(proj([x, t.h, z])); bot.push(proj([x, 0, z]));
    }
    const outline = hull(top.concat(bot)).map(toScreen);
    c.beginPath();
    outline.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fillStyle = bg; c.fill();
    if (fill > 0.001) { c.globalAlpha = fill; c.fillStyle = dark; c.fill(); c.globalAlpha = 1; }
    c.strokeStyle = ink;
    // Outer outline (as much as is drawn) + top border + one inner glass tube line
    const stroke = (pts, closed) => {
      const n = Math.max(2, Math.round(pts.length * reveal));
      c.beginPath();
      for (let i = 0; i < n; i++) { const [x, y] = pts[i]; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      if (closed && reveal >= 1) c.closePath();
      c.stroke();
    };
    stroke(outline, true);
    stroke(top.map(toScreen), true);
    const inR = t.r * 0.42, inTop = proj([t.x, t.h * 0.98, t.z - inR * 0.2]), inBot = proj([t.x, t.h * 0.12, t.z - inR * 0.2]);
    c.globalAlpha = 0.55;
    stroke([toScreen(inTop), toScreen(inBot)], false);
    c.globalAlpha = 1;
  }

  // n items side by side — gather toward the center, the outer two slightly lower
  const row = (n, ox = 0, oz = 0, h = 9) => Array.from({ length: n }, (_, i) => ({
    x: ox + (i - (n - 1) / 2) * 1.86, z: oz, r: 1, h: h * (i % 2 ? 1.03 : 1) - (i === 0 || i === n - 1 ? 0.12 : 0),
  }));

  kfFx.register("tube-wire-turn", (el, { options, reduce }) => {
    const stage = el.querySelector(":scope [data-fx-part='stage']") || el;
    const cv = document.createElement("canvas");
    cv.className = "fx-tube-canvas";
    cv.setAttribute("aria-hidden", "true");
    stage.append(cv);
    const c = cv.getContext("2d");
    if (!c) { cv.remove(); return; }
    const probe = document.createElement("i");
    probe.className = "fx-tube-probe";
    stage.append(probe);
    const colorOf = (v) => { probe.style.color = v; return getComputedStyle(probe).color; };
    const n = Math.max(1, +(options.tubes || 4));
    const scene = options.scene || "";
    const path = PATHS[options.path || (scene ? "front" : "story")] || PATHS.story;
    const scroll = options.scroll !== "off";
    let W = 0, H = 0, dpr = 1, p = reduce ? 1 : 0, raf = 0, st = null;

    const size = () => {
      const r = stage.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
      cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    function draw() {
      if (!W || !H) return;
      const ink = colorOf("var(--fx-tube-ink, var(--kf-line))"), bg = colorOf("var(--fx-tube-bg, var(--kf-bg))");
      c.clearRect(0, 0, W, H);
      c.lineWidth = +(options.line || 1); c.lineJoin = "round"; c.lineCap = "round";
      if (scene === "room") return drawRoom(ink, bg);
      const pose = poseAt(path, p), proj = camera(pose);
      const tubes = row(n);
      const S = Math.min(W / (n * 1.86 + 2.4), H / 11) * pose.zoom * +(options.size || 1) * +(options.scale || 1);
      const cy = 4.5, dark = colorOf("var(--fx-tube-fill, var(--kf-ink))");
      const toScreen = ([x, y]) => [W / 2 + x * S, H / 2 - (y - 0) * S];
      const centred = (pt) => proj([pt[0], pt[1] - cy, pt[2]]);
      tubes.map((t) => ({ t, d: centred([t.x, t.h / 2, t.z])[2] })).sort((a, b) => a.d - b.d)
        .forEach(({ t }) => drawTube(c, centred, t, toScreen, ink, bg, pose.fill, 1, dark));
    }
    // Table (round-ended slab), bench, three vases (2·3·4 lines) — lines grow with progress
    function drawRoom(ink, bg) {
      const proj = camera({ pitch: 30, yaw: -38, roll: 0 });
      const S = Math.min(W / 30, H / 18) * +(options.scale || 1);
      const toScreen = ([x, y]) => [W / 2 + x * S, H * 0.56 - y * S];
      const grow = smooth(clamp(p * 1.25));
      const line = (pts, from, to) => {
        const k = clamp((grow - from) / (to - from));
        if (k <= 0) return;
        const n2 = Math.max(2, Math.ceil(pts.length * k));
        c.beginPath();
        for (let i = 0; i < n2; i++) { const [x, y] = toScreen(proj(pts[i])); i ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
      };
      const slab = (x0, x1, z0, z1, y, round) => {
        const pts = [];
        const rr = round ? (z1 - z0) / 2 : 0;
        if (!round) return [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0]];
        for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; pts.push([x1 - rr + Math.cos(a) * rr, y, (z0 + z1) / 2 + Math.sin(a) * rr]); }
        for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; pts.push([x0 + rr + Math.cos(a) * rr, y, (z0 + z1) / 2 + Math.sin(a) * rr]); }
        pts.push(pts[0]);
        return pts;
      };
      c.strokeStyle = ink;
      line(slab(-11, 11, -4.5, 4.5, 0, true), 0, 0.35);
      line(slab(-11, 11, -4.5, 4.5, -0.6, true).slice(0, 14), 0.05, 0.4);
      [[-8.5, -2.5], [8.5, -2.5], [-8.5, 2.5], [8.5, 2.5]].forEach(([x, z], i) => line([[x, -0.6, z], [x, -9, z]], 0.1 + i * 0.04, 0.45 + i * 0.04));
      line(slab(-10, 10, -9.5, -7.2, 1.5, false), 0.2, 0.55);
      line([[-10, 1.5, -9.5], [-10, 7.5, -10.2], [10, 7.5, -10.2], [10, 1.5, -9.5]], 0.25, 0.6);
      line([[-14, -9, -14], [-14, 14, -14]], 0.3, 0.7);
      line([[-14, -9, -14], [16, -9, -14]], 0.3, 0.7);
      const k = clamp((grow - 0.45) / 0.45);
      if (k <= 0) return;
      const sets = [row(2, -6.5, 0, 4.6), row(3, 0, 0, 4.8), row(4, 6.8, 0, 5)];
      const all = sets.flat().map((t) => ({ t, d: proj([t.x, t.h / 2, t.z])[2] })).sort((a, b) => a.d - b.d);
      c.globalAlpha = 1;
      all.forEach(({ t }) => drawTube(c, proj, t, toScreen, ink, bg, 0, k));
    }

    const tick = () => { raf = 0; draw(); };
    const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    size();
    document.fonts?.ready.then(ask);
    if (!reduce && scroll && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const o = { p: 0 };
      st = gsap.to(o, {
        p: 1, ease: "none", onUpdate: () => { p = o.p; ask(); },
        scrollTrigger: { trigger: el, start: options.start || "top top", end: options.end || "bottom bottom", scrub: +(options.scrub ?? 0.4) },
      });
    }
    return () => { st?.scrollTrigger?.kill(); st?.kill(); ro.disconnect(); cancelAnimationFrame(raf); cv.remove(); probe.remove(); };
  });
})();
