// Hundreds to a thousand-plus arrows (›) gather on one fixed canvas into a different shape per section (big letters, sphere, monitor, check, logo, portrait), then
// When scrolling moves to the next section, it scatters from the previous section’s shape (swelling in depth and sideways) and settles into the next shape.
// Birds not used in the shapes rest outside both sides of the screen and are never drawn over text or buttons, so the copy stays readable. Birds within 110px of the cursor move aside.
// Per section (element) data-fx="arrow-flock" One = One station. Only one canvas·bird flock per page, and the stations share that flock.
(() => {
  const CAM = 5;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const hash = (i, k = 1) => { const v = Math.sin(12.9898 * i * k + 78.233) * 43758.5453; return v - Math.floor(v); };
  const MOBILE = 1200;
  const isMobile = () => innerWidth < MOBILE;
  const vh = () => innerHeight;

  // ── Building point clusters: each point has x·y·z·direction, group (g=1 means accent color) ──────────────────────
  function byX(p, g, n) {
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => p[4 * a] - p[4 * b]);
    const P = new Float32Array(4 * n), G = new Uint8Array(n);
    order.forEach((from, to) => { P.set(p.subarray(4 * from, 4 * from + 4), 4 * to); G[to] = g[from]; });
    return { p: P, g: G, n };
  }
  // Divides segments [x1,y1,z1,x2,y2,z2,accent] into points by length and seats them. Leftover slots overlap beside points already seated
  function lines(segs, jitter, n) {
    const len = segs.map((s) => Math.hypot(s[3] - s[0], s[4] - s[1], s[5] - s[2]));
    const total = len.reduce((a, b) => a + b, 0) || 1;
    const p = new Float32Array(4 * n), g = new Uint8Array(n);
    let k = 0;
    segs.forEach((s, si) => {
      const c = Math.round((n * len[si]) / total);
      const ang = Math.atan2(s[4] - s[1], s[3] - s[0]);
      for (let j = 0; j < c && k < n; j++, k++) {
        const t = (j + Math.random()) / c;
        p[4 * k] = mix(s[0], s[3], t) + (Math.random() - 0.5) * jitter;
        p[4 * k + 1] = mix(s[1], s[4], t) + (Math.random() - 0.5) * jitter;
        p[4 * k + 2] = mix(s[2], s[5], t) + (Math.random() - 0.5) * jitter;
        p[4 * k + 3] = ang;
        g[k] = s[6] ? 1 : 0;
      }
    });
    for (; k < n; k++) {
      const from = Math.floor(Math.random() * Math.max(1, k));
      p.copyWithin(4 * k, 4 * from, 4 * from + 4);
      g[k] = g[from];
    }
    return byX(p, g, n);
  }
  const rect = (x1, y1, x2, y2, lead) => [
    [x1, y1, 0, x2, y1, 0, lead], [x2, y1, 0, x2, y2, 0, lead],
    [x2, y2, 0, x1, y2, 0, lead], [x1, y2, 0, x1, y1, 0, lead],
  ];
  const arc = (cx, cy, r, a0, a1, steps, lead, ry = r) => {
    const out = [];
    for (let i = 0; i < steps; i++) {
      const t0 = a0 + ((a1 - a0) * i) / steps, t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
      out.push([cx + Math.cos(t0) * r, cy + Math.sin(t0) * ry, 0, cx + Math.cos(t1) * r, cy + Math.sin(t1) * ry, 0, lead]);
    }
    return out;
  };

  const SHAPES = {
    // Fibonacci sphere — one in five goes inside so the volume shows
    sphere(n) {
      const p = new Float32Array(4 * n), g = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), a = 2.39996 * i;
        const r = i % 5 === 0 ? 0.2 + 0.3 * Math.random() : 0.62;
        p[4 * i] = Math.cos(a) * rr * r; p[4 * i + 1] = y * r; p[4 * i + 2] = Math.sin(a) * rr * r;
        g[i] = i % 9 === 0 ? 1 : 0;
      }
      return byX(p, g, n);
    },
    // Oval cloud gathering at screen center during page turns — direction rotates along the perimeter
    disc(n) {
      const p = new Float32Array(4 * n), g = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, r = Math.sqrt(Math.random());
        p[4 * i] = Math.cos(a) * r * 1.6; p[4 * i + 1] = Math.sin(a) * r * 1.1; p[4 * i + 2] = (Math.random() - 0.5) * 1.5;
        p[4 * i + 3] = a + Math.PI / 2; g[i] = i % 15 === 0 ? 1 : 0;
      }
      return { p, g, n };
    },
    // Three stacked chevrons pointing up (launch), every bird looks up
    launch(n) {
      const segs = [];
      for (let k = 0; k < 3; k++) {
        const y = -0.7 + 0.24 * k;
        segs.push([0, y, 0.5, -1.05, y + 0.85, -0.4, k === 0], [0, y, 0.5, 1.05, y + 0.85, -0.4, k === 0]);
      }
      const s = lines(segs, 0.05, n);
      for (let i = 0; i < n; i++) s.p[4 * i + 3] = -Math.PI / 2;
      return s;
    },
    // Browser window wireframe — header band, featured photo slot, three text lines, three cards below
    monitor: (n) => lines([
      ...rect(-1.3, -0.85, 1.3, 0.85), [-1.3, -0.62, 0, 1.3, -0.62, 0],
      ...rect(-1.12, -0.45, 0.05, 0.2, true),
      [0.25, -0.4, 0, 1.1, -0.4, 0], [0.25, -0.25, 0, 0.95, -0.25, 0], [0.25, -0.1, 0, 1.05, -0.1, 0],
      ...rect(-1.12, 0.38, -0.42, 0.7), ...rect(-0.33, 0.38, 0.37, 0.7), ...rect(0.46, 0.38, 1.12, 0.7),
    ], 0.025, n),
    // Laptop and phone, accent-color check on each screen
    devices: (n) => lines([
      ...rect(-1.4, -0.8, 0.5, 0.45), [-1.62, 0.58, 0, 0.72, 0.58, 0], [-1.4, 0.45, 0, -1.62, 0.58, 0], [0.5, 0.45, 0, 0.72, 0.58, 0],
      ...rect(0.82, -0.62, 1.4, 0.62), [1, -0.52, 0, 1.22, -0.52, 0],
      [-0.85, -0.12, 0, -0.58, 0.14, 0, true], [-0.58, 0.14, 0, -0.08, -0.38, 0, true],
      [1.02, 0.05, 0, 1.1, 0.14, 0, true], [1.1, 0.14, 0, 1.25, -0.04, 0, true],
    ], 0.03, n),
    // Cover made of four chevrons (top one in accent color) — ratio carried over from a 132×88 cell
    logo: (n) => lines([
      [50, 10, 66, 22, 1], [66, 22, 82, 10, 1], [22, 38, 38, 50, 0], [38, 50, 54, 38, 0],
      [78, 38, 94, 50, 0], [94, 50, 110, 38, 0], [50, 66, 66, 78, 0], [66, 78, 82, 66, 0],
    ].map(([x1, y1, x2, y2, l]) => [((x1 - 66) / 106) * 2.6, ((y1 - 44) / 106) * 2.6, 0, ((x2 - 66) / 106) * 2.6, ((y2 - 44) / 106) * 2.6, 0, l]), 0.13, n),
    arrow: (n) => lines([[-1.4, 0, 0, 1.4, 0, 0], [0.7, -0.6, 0, 1.4, 0, 0, true], [0.7, 0.6, 0, 1.4, 0, 0, true]], 0.08, n),
    check: (n) => lines([[-1, -0.05, 0, -0.32, 0.62, 0, true], [-0.32, 0.62, 0, 1, -0.72, 0, true]], 0.02, n),
    // For card drawings — shopping cart bag, padlock, two windows, speech bubble, circle, brace, chevron, dot grid
    bag: (n) => lines([
      [-1, -0.35, 0, 1, -0.35, 0], [1, -0.35, 0, 1.15, 1, 0], [1.15, 1, 0, -1.15, 1, 0], [-1.15, 1, 0, -1, -0.35, 0],
      ...arc(0, -0.35, 0.55, Math.PI, TAU, 8, false, 0.7),
      [-0.35, 0.3, 0, -0.1, 0.55, 0, true], [-0.1, 0.55, 0, 0.4, 0.05, 0, true],
    ], 0.04, n),
    lock: (n) => lines([
      ...rect(-0.95, -0.15, 0.95, 1.05),
      ...arc(0, -0.15, 0.62, Math.PI, TAU, 9, false, 0.85),
      ...arc(0, 0.38, 0.17, 0, TAU, 8, true), [0, 0.55, 0, 0, 0.8, 0, true],
    ], 0.035, n),
    windows: (n) => lines([
      ...rect(-1.45, -0.75, -0.15, 0.55), [-1.45, -0.5, 0, -0.15, -0.5, 0],
      [-1.25, -0.2, 0, -0.45, -0.2, 0], [-1.25, 0.05, 0, -0.65, 0.05, 0], [-1.25, 0.3, 0, -0.55, 0.3, 0],
      [-0.05, -0.1, 0, 0.25, -0.1, 0, true], [0.12, -0.25, 0, 0.27, -0.1, 0, true], [0.12, 0.05, 0, 0.27, -0.1, 0, true],
      ...arc(0.9, -0.1, 0.5, 0, TAU, 12, true, 0.32),
    ], 0.03, n),
    circle: (n) => lines([...arc(0, 0, 1, 0, TAU, 20, false), ...arc(0, 0, 0.55, 0, TAU, 12, false), ...arc(0, 0, 0.18, 0, TAU, 6, true)], 0.06, n),
    brace: (n) => lines([
      [-0.4, -1, 0, -0.75, -0.75, 0], [-0.75, -0.75, 0, -0.75, -0.15, 0], [-0.75, -0.15, 0, -1.05, 0, 0],
      [-1.05, 0, 0, -0.75, 0.15, 0], [-0.75, 0.15, 0, -0.75, 0.75, 0], [-0.75, 0.75, 0, -0.4, 1, 0],
      [0.2, -0.55, 0, 0.75, 0, 0, true], [0.75, 0, 0, 0.2, 0.55, 0, true],
    ], 0.04, n),
    chevron: (n) => lines([[-0.6, -1, 0, 0.6, 0, 0], [0.6, 0, 0, -0.6, 1, 0], [0.1, -0.55, 0, 0.75, 0.1, 0, true]], 0.06, n),
    grid(n) {
      const p = new Float32Array(4 * n), g = new Uint8Array(n), side = Math.ceil(Math.sqrt(n));
      for (let i = 0; i < n; i++) {
        p[4 * i] = ((i % side) / (side - 1 || 1) - 0.5) * 2; p[4 * i + 1] = (Math.floor(i / side) / (side - 1 || 1) - 0.5) * 2;
        p[4 * i + 3] = Math.PI / 2; g[i] = i % 11 === 0 ? 1 : 0;
      }
      return byX(p, g, n);
    },
    cart: (n) => lines([
      [-1.3, -0.8, 0, -0.95, -0.8, 0], [-0.95, -0.8, 0, -0.6, 0.45, 0], [-0.6, 0.45, 0, 0.95, 0.45, 0],
      [0.95, 0.45, 0, 1.2, -0.45, 0], [1.2, -0.45, 0, -0.85, -0.45, 0],
      ...arc(-0.4, 0.8, 0.14, 0, TAU, 6, true), ...arc(0.75, 0.8, 0.14, 0, TAU, 6, true),
    ], 0.04, n),
  };

  // Stamp the text onto an offscreen canvas and scatter dots evenly over the painted pixels — fit the width to 1 and return the height ratio (ratio)
  function textPoints(text, n, font, leadUpTo) {
    const W = 2400, H = 420;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d", { willReadFrequently: true });
    if (!c) return { p: new Float32Array(4 * n), g: new Uint8Array(n), n, ratio: 0.3 };
    c.textAlign = "center"; c.textBaseline = "middle"; c.font = font;
    const px = Number(font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 330);
    c.letterSpacing = `${0.04 * px}px`;
    const wide = c.measureText(text).width;
    if (wide > 2160) c.font = font.replace(/(\d+(?:\.\d+)?)px/, (_, v) => `${(Number(v) * 2160) / wide}px`);
    c.fillText(text, W / 2, 222);
    const a = c.getImageData(0, 0, W, H).data;
    const on = (x, y) => a[((y | 0) * W + (x | 0)) * 4 + 3] > 128;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, area = 0;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (on(x, y)) { area += 4; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const step = 0.98 * Math.sqrt(area / n), pts = [];
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
      const jx = x + (Math.random() - 0.5) * step * 0.7, jy = y + (Math.random() - 0.5) * step * 0.7;
      if (jx >= 0 && jx < W && jy >= 0 && jy < H && on(jx, jy)) pts.push([jx, jy]);
    }
    while (pts.length > n) pts.splice(Math.floor(Math.random() * pts.length), 1);
    while (pts.length < n && pts.length) { const q = pts[Math.floor(Math.random() * pts.length)]; pts.push([q[0] + (Math.random() - 0.5) * step * 0.5, q[1] + (Math.random() - 0.5) * step * 0.5]); }
    const span = Math.max(1, x1 - x0), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const p = new Float32Array(4 * n), g = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const q = pts[i] ?? [W / 2, H / 2];
      p[4 * i] = (q[0] - mx) / span; p[4 * i + 1] = (q[1] - my) / span;
      p[4 * i + 2] = (Math.random() - 0.5) * 0.015; p[4 * i + 3] = (Math.random() - 0.5) * 0.5;
      g[i] = leadUpTo(  (q[0] - x0) / span) ? 1 : 0;
    }
    return { ...byX(p, g, n), ratio: (y1 - y0) / span };
  }

  // Portrait slot — the head·neck·shoulder silhouette is painted with shade so darker areas get more and bigger dots. Drawn from our own artwork instead of a photo
  function portraitPoints(n) {
    const S = 400, cv = document.createElement("canvas");
    cv.width = cv.height = S;
    const c = cv.getContext("2d", { willReadFrequently: true });
    const p = new Float32Array(4 * n), g = new Uint8Array(n), sizes = new Float32Array(n);
    if (!c) return { p, g, n, sizes };
    const shade = (x, y, r, a) => { const gr = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a * 0.25})`); gr.addColorStop(1, `rgba(0,0,0,${a})`); return gr; }; // Not a skin: an off-screen canvas that only measures darkness (alpha), so it’s invisible
    c.fillStyle = shade(200, 170, 105, 0.9); c.beginPath(); c.ellipse(200, 165, 78, 98, 0, 0, TAU); c.fill();
    c.fillStyle = shade(200, 280, 60, 0.8); c.fillRect(170, 240, 60, 60);
    c.fillStyle = shade(200, 380, 190, 0.85); c.beginPath(); c.ellipse(200, 400, 175, 95, 0, Math.PI, TAU); c.fill();
    const d = c.getImageData(0, 0, S, S).data;
    let k = 0, guard = 0;
    while (k < n && guard++ < n * 60) {
      const x = Math.random() * S, y = Math.random() * S, a = d[((y | 0) * S + (x | 0)) * 4 + 3] / 255;
      if (a < 0.05 || Math.random() > a) continue;
      p[4 * k] = (x / S - 0.5) * 2.7; p[4 * k + 1] = (y / S - 0.5) * 2.7; p[4 * k + 3] = Math.PI / 4 + (Math.random() - 0.5) * 1.2;
      sizes[k] = 0.65 + 0.7 * a; k++;
    }
    return { p, g, n, sizes };
  }

  // ── Shapes (slots the station gives to the group) ───────────────────────────────
  // points: {p,g,n}, place(): [cx, cy, radius, new size] (viewport coordinates)
  function pointForm(env, pts, place, o = {}) {
    let at = null;
    return {
      n: pts.n, calm: !!o.calm,
      prep() { at = place(); },
      glow: o.glow ? () => (at ? [at[0], at[1], at[2] * 1.2] : null) : undefined,
      get(i, now, lt, out) {
        if (i >= pts.n || !at) return false;
        const P = pts.p;
        let x = P[4 * i], y = P[4 * i + 1], z = P[4 * i + 2];
        if (!env.reduce) {
          if (o.wave) y += Math.sin(2.2 * x + 0.0011 * now) * o.wave;
          if (o.flap) y += 0.03 * Math.sin(0.005 * now + 4 * x);
        }
        const yaw = (o.spin && !env.reduce ? (now / 1000) * o.spin : 0) + (o.rot ? (lt - 0.5) * o.rot : 0);
        if (yaw) { const c = Math.cos(yaw), s = Math.sin(yaw), nx = x * c + z * s; z = -x * s + z * c; x = nx; }
        if (o.tilt) { const c = Math.cos(o.tilt), s = Math.sin(o.tilt), ny = y * c - z * s; z = y * s + z * c; y = ny; }
        out.cx = at[0]; out.cy = at[1]; out.X = x * at[2]; out.Y = y * at[2]; out.Z = z + CAM;
        out.a = P[4 * i + 3]; out.t = Math.min(5, (pts.g[i] ?? 0) + 1);
        out.s = pts.sizes ? pts.sizes[i] * at[3] : at[3];
        return true;
      },
    };
  }

  // Circles around the element in a triple ring (reversing direction for each nearby element) — work photo frame
  function ringForm(env, targets, n, o) {
    let rs = [];
    return {
      n,
      prep() { rs = targets().map((t) => t.getBoundingClientRect()).filter((r) => r.width > 2); },
      get(i, now, lt, out) {
        if (i >= n || !rs.length) return false;
        const k = rs.length, ri = i % k, r = rs[ri], per = Math.ceil(n / k);
        const lane = Math.floor(i / k);
        const rings = o.rings ?? (isMobile() ? [14, 14, 14] : [16, 28, 40]);
        const gap = rings[lane % rings.length];
        const u = (((lane / per + (env.reduce ? 0 : now * (o.speed ?? 18e-6) * (ri % 2 ? -1 : 1))) % 1) + 1) % 1;
        out.cx = r.left + r.width / 2; out.cy = r.top + r.height / 2; out.Z = CAM; out.s = o.size ?? 5.5; out.t = i % 15 === 0 ? 2 : 1;
        const w = r.width + 2 * gap, h = r.height + 2 * gap;
        let d = 2 * u * (w + h);
        if (d < w) { out.X = -w / 2 + d; out.Y = -h / 2; out.a = 0; }
        else if ((d -= w) < h) { out.X = w / 2; out.Y = -h / 2 + d; out.a = Math.PI / 2; }
        else if ((d -= h) < w) { out.X = w / 2 - d; out.Y = h / 2; out.a = Math.PI; }
        else { d -= w; out.X = -w / 2; out.Y = h / 2 - d; out.a = -Math.PI / 2; }
        if (ri % 2) out.a += Math.PI;
        return true;
      },
    };
  }

  // A layer of three plates overlapping diagonally (screen, admin, server from the top) — the plate of the hovered row rises in the accent color
  function stackForm(env, stage, layers, pick) {
    const mob = isMobile(), edge = mob ? 10 : 16, side = mob ? 3 : 5, per = 4 * edge + side * side, n = per * layers;
    const lift = Array(layers).fill(0);
    let last = performance.now(), cx = 0, cy = 0, R = 0, near = 1, tiltY = 0;
    const B = 0.8364626499151869, A = 0.5480239367918736;
    return {
      n, calm: true,
      prep() {
        const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const on = pick();
        for (let k = 0; k < layers; k++) lift[k] += ((on === k ? 1 : 0) - lift[k]) * (env.reduce ? 1 : 1 - Math.exp(-6 * dt));
        const r = stage.getBoundingClientRect(), H = vh(), mid = r.top + r.height / 2;
        near = env.reduce ? 1 : clamp(1.15 - Math.abs(mid - H / 2) / (0.55 * H));
        R = Math.min(r.width * (mob ? 0.28 : 0.25), 0.22 * r.height);
        cx = r.left + r.width / 2; cy = mid; tiltY = (H / 2 - mid) / H;
      },
      get(i, now, lt, out) {
        if (i >= n) return false;
        const L = Math.floor(i / per), j = i % per;
        let x, y, dx = 0, dy = 0, inner = false;
        if (j < 4 * edge) {
          const q = 4 * ((((j / (4 * edge) + (env.reduce ? 0 : 4e-5 * now * (L % 2 ? -1 : 1))) % 1) + 1) % 1);
          const sideIx = Math.floor(q), f = (q - sideIx) * 2 - 1;
          if (sideIx === 0) { x = f; y = -1; dx = 1; } else if (sideIx === 1) { x = 1; y = f; dy = 1; }
          else if (sideIx === 2) { x = -f; y = 1; dx = -1; } else { x = -1; y = -f; dy = -1; }
          if (L % 2) { dx = -dx; dy = -dy; }
        } else {
          const m = j - 4 * edge;
          x = ((((m % side) + 0.5) / side) * 2 - 1) * 0.7; y = (((Math.floor(m / side) + 0.5) / side) * 2 - 1) * 0.7; dx = 1; inner = true;
        }
        const yaw = 0.62 + (env.reduce ? 0 : 5e-5 * now) + 0.8 * tiltY, c = Math.cos(yaw), s = Math.sin(yaw);
        const h = (L - (layers - 1) / 2) * (0.42 + 0.5 * near) - 0.16 * lift[L];
        const proj = (px, py) => { const d = px * s + py * c; return [px * c - py * s, B * h - A * d, A * h + B * d]; };
        const P = proj(x, y), Q = proj(x + 0.02 * dx, y + 0.02 * dy);
        out.cx = cx; out.cy = cy; out.X = P[0] * R; out.Y = P[1] * R; out.Z = CAM + 0.8 * P[2];
        out.a = Math.atan2(Q[1] - P[1], Q[0] - P[0]); out.t = lift[L] > 0.5 ? 2 : 1;
        out.s = (mob ? 4.2 : 5.6) * (inner ? 0.7 : 1) * (1 + 0.18 * lift[L]);
        return true;
      },
    };
  }

  // One shape per card across several cards — card image slot (data-fx-part="card", data-shape) divides the group evenly for each
  function cardsForm(env, cards, total, sizeOpt) {
    const each = Math.floor(total / Math.max(1, cards.length));
    const sets = cards.map((c) => (SHAPES[c.dataset.shape] || SHAPES.circle)(each));
    // If the card background differs from the band, match the new color to the card — data-ink: dark·light, data-lead: dark·light
    const tone = (v, d) => (v === "dark" ? 5 : v === "light" ? 3 : d);
    const inkT = cards.map((c) => tone(c.dataset.ink, 1)), leadT = cards.map((c) => tone(c.dataset.lead, 2));
    let rs = [];
    return {
      n: each * cards.length, calm: true,
      prep() { rs = cards.map((c) => c.getBoundingClientRect()); },
      get(i, now, lt, out) {
        const k = Math.floor(i / each), j = i % each;
        if (k >= cards.length || !rs[k] || rs[k].width < 2) return false;
        const r = rs[k], R = Math.min(r.width * 0.3, r.height * 0.36), P = sets[k].p;
        let x = P[4 * j], y = P[4 * j + 1];
        if (!env.reduce) y += 0.03 * Math.sin(0.004 * now + 3 * x + k);
        out.cx = r.left + r.width / 2; out.cy = r.top + r.height / 2; out.X = x * R; out.Y = y * R; out.Z = CAM;
        out.a = P[4 * j + 3]; out.t = sets[k].g[j] ? leadT[k] : inkT[k]; out.s = sizeOpt ?? (isMobile() ? 4.2 : 5.5);
        return true;
      },
    };
  }

  // ── Engine (one per page) ───────────────────────────────────────────
  let engine = null;
  function makeEngine(reduce) {
    const env = { reduce, W: () => innerWidth, H: vh, count: () => (isMobile() ? (innerWidth >= 768 ? 800 : 480) : 1100) };
    const cv = document.createElement("canvas");
    cv.className = "fx-flock-canvas";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    const probe = document.createElement("i");
    probe.className = "fx-flock-probe";
    document.body.append(probe);

    const birds = [];
    const stops = new Map();
    let list = [], count = 0, bornAt = performance.now(), last = performance.now();
    let W = innerWidth, H = vh(), dpr = 1, override = null, raf = 0, dirty = true;
    const mouse = { x: -1e4, y: -1e4 };
    let guard = [], guardTop = new Float64Array(0), guardBot = new Float64Array(0), guardStuck = new Uint8Array(0);

    const bird = () => ({ x: 0, y: 0, h: 0, d: 0.35 * Math.random(), sw: 0.8 + 2.4 * Math.random(), lx: (Math.random() - 0.5) * 1.8, ly: (Math.random() - 0.5) * 0.9, k: 6 + 6 * Math.random(), ph: Math.random() * TAU, park: 2 * Math.random(), init: false });
    // Birds not used in the shape — perch out past both sides of the screen
    const park = (b, o) => {
      const side = b.park < 1 ? -1 : 1;
      o.cx = W / 2; o.cy = H / 2; o.X = side * (0.5 * W + 80 + 30 * b.park); o.Y = (b.ph / Math.PI - 1) * H * 0.5;
      o.Z = CAM; o.a = side < 0 ? Math.PI : 0; o.t = 1; o.s = 4;
    };

    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = vh();
      cv.width = W * dpr; cv.height = H * dpr; ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    // No birds over text, buttons or photos — collect only the outermost elements, remember their document positions, and measure only those near the screen
    const GUARD = "h1, h2, h3, p, a, button, label, img, video, li, b, input, textarea, select, .wf-img, [data-flock-protect], header, footer";
    function collectGuard() {
      const all = [...document.querySelectorAll(GUARD)].filter((e) => (e.matches("[data-flock-protect]") || !e.closest("[data-flock-free]")) && !e.closest(".wf-ui"));
      const set = new Set(all);
      guard = all.filter((e) => { for (let p = e.parentElement; p; p = p.parentElement) if (set.has(p)) return false; return true; });
      guardTop = new Float64Array(guard.length); guardBot = new Float64Array(guard.length); guardStuck = new Uint8Array(guard.length);
      const sy = scrollY, seen = new Map();
      // Fixed and pinned elements change document position with scroll, so always measure
      const stuck = (e) => {
        if (!e || e === document.body) return false;
        if (seen.has(e)) return seen.get(e);
        const p = getComputedStyle(e).position, v = p === "fixed" || p === "sticky" || stuck(e.parentElement);
        seen.set(e, v);
        return v;
      };
      guard.forEach((e, i) => { const r = e.getBoundingClientRect(); guardTop[i] = r.top + sy; guardBot[i] = r.bottom + sy; guardStuck[i] = stuck(e) ? 1 : 0; });
    }
    function relayout() {
      dirty = false;
      collectGuard();
      const max = Math.max(0, document.documentElement.scrollHeight - H);
      let need = env.count();
      stops.forEach((s) => (need = Math.max(need, s.need || 0)));
      while (birds.length < need) birds.push(bird());
      if (need > count && count === 0) { bornAt = performance.now(); skipWarm(); }
      count = need;
      const top = (el) => el.getBoundingClientRect().top + scrollY;
      const sorted = [...stops.values()].map((s) => {
        const r = s.el.getBoundingClientRect();
        let key = clamp(top(s.el) + r.height / 2 - H / 2, 0, max);
        if (s.keyAt === "top") key = clamp(top(s.el) - H * 0.25, 0, max);
        return { s, key, span: s.span ? Math.max(0, (r.height - H) / 2) : 0 };
      }).sort((a, b) => a.key - b.key);
      list = sorted.map(({ s, key, span }, i) => {
        const before = i ? key - sorted[i - 1].key : 1e9, after = i < sorted.length - 1 ? sorted[i + 1].key - key : 1e9;
        return { s, key, hold: Math.max(span, Math.max(0, Math.min(0.3 * H, 0.32 * Math.min(before, after)))) };
      });
      // If a wide stop (span) overlaps its neighbor, split it at the middle
      for (let i = 0; i < list.length - 1; i++) {
        const room = list[i + 1].key - list[i].key;
        if (list[i].hold + list[i + 1].hold > room * 0.8) {
          const k = (room * 0.8) / (list[i].hold + list[i + 1].hold);
          list[i].hold *= k; list[i + 1].hold *= k;
        }
      }
    }

    const colorOf = (v) => { probe.style.color = v; return getComputedStyle(probe).color; };
    const rgbParts = (c) => (c.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).join(",");
    const scratchA = {}, scratchB = {};

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!ctx) return;
      if (dirty) relayout();
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (Math.abs(innerWidth - W) > 1 || Math.abs(vh() - H) > 1) { size(); relayout(); }
      ctx.clearRect(0, 0, W, H);
      if (!list.length && !override) return;
      const sy = scrollY, mob = isMobile();
      let from = 0, to = 0, prog = 0;
      if (list.length) {
        let k = 0;
        while (k < list.length - 1 && sy >= list[k + 1].key) k++;
        from = to = k;
        if (k < list.length - 1) {
          const a = list[k].key + list[k].hold, b = list[k + 1].key - list[k + 1].hold;
          if (sy > a) { to = k + 1; prog = clamp((sy - a) / Math.max(1, b - a)); }
        }
        // Anything above the first stop (when the top is not 0) keeps its initial shape
      }
      const A = override ?? list[from].s.form, Bf = override ?? list[to].s.form, moving = !override && to !== from;
      A.prep(); if (moving) Bf.prep();
      const ltA = !override ? list[from].s.lt() : 0.5, ltB = !override ? list[to].s.lt() : 0.5;
      const e = inOutCubic(prog);
      const ink = colorOf("var(--fx-flock-ink, var(--kf-ink))"), lead = colorOf("var(--fx-flock-lead, var(--kf-accent))");
      const glowA = A.glow?.(), glowB = moving ? Bf.glow?.() : null;
      const gAmt = (glowA ? 1 - (moving ? e : 0) : 0) + (glowB ? e : 0), g = glowA ?? glowB;
      if (g && gAmt > 0.01) {
        const rgb = rgbParts(lead), gr = ctx.createRadialGradient(g[0], g[1], 0, g[0], g[1], g[2]);
        gr.addColorStop(0, `rgba(${rgb},${0.5 * gAmt})`); gr.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gr; ctx.fillRect(g[0] - g[2], g[1] - g[2], 2 * g[2], 2 * g[2]);
      }
      const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const turn = 1 - Math.exp(-7 * dt), age = (now - bornAt) / 1000, Q = 0.3 * Math.min(W, H);
      // Only measure guard elements near the screen
      const rects = [];
      for (let i = 0; i < guard.length; i++) {
        if (!guardStuck[i] && (guardBot[i] - sy < -H || guardTop[i] - sy > 2 * H)) continue;
        const r = guard[i].getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > H) continue;
        // Text in hidden scenes stacked on top of each other (transparent · hidden) is not protected
        if (guard[i].checkVisibility && !guard[i].checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        rects.push(r.left - 6, r.top - 6, r.right + 6, r.bottom + 6);
      }
      for (let i = 0; i < count; i++) {
        const b = birds[i];
        scratchA.w = 0;
        if (!A.get(i, now, ltA, scratchA)) park(b, scratchA);
        let { cx, cy, X, Y, Z, a, t, s } = scratchA;
        if (moving && prog > 0) {
          scratchB.w = 0;
          if (!Bf.get(i, now, ltB, scratchB)) park(b, scratchB);
          const r = inOutCubic(clamp((prog - b.d) / 0.65));
          cx = mix(cx, scratchB.cx, r); cy = mix(cy, scratchB.cy, r); X = mix(X, scratchB.X, r); Y = mix(Y, scratchB.Y, r);
          Z = mix(Z, scratchB.Z, r); s = mix(s, scratchB.s, r);
          if (r > 0.5) { a = scratchB.a; t = scratchB.t; }
          if (!reduce) { const burst = Math.sin(Math.PI * r) * (mob ? 0.08 : 0.18); Z -= burst * b.sw; X += burst * b.lx * Q; Y += burst * b.ly * Q; }
        }
        if (override && !reduce) { const q = 0.0012 * now + b.ph; X += 18 * Math.cos(q); Y += 18 * Math.sin(q); }
        if (!reduce) {
          const amp = Math.min(2, 0.35 * s) * (A.calm && !moving ? 0.25 : 1);
          X += Math.sin(0.0013 * now + b.ph) * amp; Y += Math.cos(0.0017 * now + 1.3 * b.ph) * amp;
        }
        const C = Math.min(5, CAM / Math.max(Z, 0.7));
        let tx = cx + X * C, ty = cy + Y * C;
        const mx = tx - mouse.x, my = ty - mouse.y, md = Math.hypot(mx, my);
        if (md < 110 && md > 0.1) { const push = ((110 - md) / 110) * 40; tx += (mx / md) * push; ty += (my / md) * push; }
        if (!b.init) {
          if (reduce) { b.x = tx; b.y = ty; }
          else if (arrive) { const q = Math.random() * TAU, rr = Math.sqrt(Math.random()) * 0.3 * Math.min(W, H); b.x = W / 2 + Math.cos(q) * rr * 1.6; b.y = H / 2 + Math.sin(q) * rr * 1.1; }
          else { const q = Math.random() * TAU, rr = Math.max(W, H) * (0.6 + 0.5 * Math.random()); b.x = W / 2 + Math.cos(q) * rr; b.y = H / 2 + Math.sin(q) * rr; }
          b.h = a; b.init = true;
        }
        // For the first 3s they fly in slowly (each bird later) and perch
        const t2 = mob ? 1.6 * age : age, warm = t2 < 3 ? 0.5 * clamp(1.2 * t2 - 2.4 * b.d) : 1;
        const follow = reduce ? 1 : 1 - Math.exp(-dt * b.k * (override ? 1.4 : 1) * warm);
        const ox = b.x, oy = b.y;
        b.x += (tx - b.x) * follow; b.y += (ty - b.y) * follow;
        const vx = b.x - ox, vy = b.y - oy;
        b.h += wrapAngle((Math.hypot(vx, vy) > 0.8 ? Math.atan2(vy, vx) : a) - b.h) * turn;
        const len = s * C;
        if (b.y < -40 || b.y > H + 40 || b.x < -40 || b.x > W + 40) continue;
        let hidden = false;
        for (let q = 0; q < rects.length; q += 4) if (b.x > rects[q] - len && b.x < rects[q + 2] + len && b.y > rects[q + 1] - len && b.y < rects[q + 3] + len) { hidden = true; break; }
        if (hidden) continue;
        const path = t === 2 ? paths[4] : t === 3 ? paths[5] : t === 4 ? paths[6] : t === 5 ? paths[7] : len < 2.6 ? paths[0] : len < 4 ? paths[1] : C < 1.3 ? paths[2] : paths[3];
        const cs = Math.cos(b.h), sn = Math.sin(b.h), wink = scratchA.w ?? 0;
        const open = reduce ? 1 : (1 - wink) * (0.9 + 0.25 * Math.sin(0.016 * now + b.ph)) + wink * (0.15 + 0.85 * (0.5 + 0.5 * Math.sin(0.011 * now + b.ph)));
        const px = b.x + cs * len * 0.6, py = b.y + sn * len * 0.6;
        path.moveTo(px - cs * len - sn * len * open, py - sn * len + cs * len * open);
        path.lineTo(px, py);
        path.lineTo(px - cs * len + sn * len * open, py - sn * len - cs * len * open);
      }
      if (arrive && age > 0.2) arrive = false;
      ctx.lineCap = "square";
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.95; ctx.stroke(paths[0]);
      ctx.lineWidth = 1.35; ctx.stroke(paths[1]);
      ctx.lineWidth = 2; ctx.stroke(paths[2]);
      ctx.lineWidth = 3.4; ctx.stroke(paths[3]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = lead; ctx.stroke(paths[4]);
      ctx.strokeStyle = colorOf("var(--fx-flock-light, var(--kf-bg))"); ctx.stroke(paths[5]);
      ctx.strokeStyle = colorOf("var(--fx-flock-deep, var(--kf-accent-text))"); ctx.stroke(paths[6]);
      ctx.strokeStyle = colorOf("var(--fx-flock-dark, var(--kf-ink))"); ctx.stroke(paths[7]);
    }

    // If arriving gathered from another page, starts from the center cloud
    let arrive = false;
    try { const t = Number(sessionStorage.getItem("fx-flock-arrive") || 0); arrive = Date.now() - t < 4000; sessionStorage.removeItem("fx-flock-arrive"); } catch { /* Storage Blocked */ }
    // The incoming group was already flying, so it skips the initial fly-in (slow 3s)
    const skipWarm = () => { if (arrive) bornAt = performance.now() - 3000; };

    const onMove = (e) => { if (e.pointerType === "mouse") { mouse.x = e.clientX; mouse.y = e.clientY; } };
    const onLeave = () => { mouse.x = mouse.y = -1e4; };
    const onResize = () => { size(); dirty = true; };
    const mark = () => (dirty = true);
    const gather = () => {
      if (reduce) return;
      const n = Math.max(env.count(), ...[...stops.values()].map((s) => s.need || 0));
      const pts = SHAPES.disc(n);
      override = pointForm(env, pts, () => [W / 2, H / 2, 0.3 * Math.min(W, H), isMobile() ? 4 : 5.5]);
      try { sessionStorage.setItem("fx-flock-arrive", String(Date.now())); } catch { /* Storage Blocked */ }
    };
    const release = () => (override = null);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    addEventListener("resize", onResize);
    addEventListener("load", mark);
    document.addEventListener("fx:flock-gather", gather);
    document.addEventListener("fx:flock-release", release);
    const ro = new ResizeObserver(mark);
    ro.observe(document.body);
    const tick = setInterval(mark, 1000);
    size();
    // Launched when idle so it doesn’t collide with the first paint of the screen
    const start = () => { last = performance.now(); raf = requestAnimationFrame(frame); };
    const idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 600 }) : setTimeout(start, 120);

    return {
      env,
      add(s) { stops.set(s, s); dirty = true; },
      remove(s) {
        stops.delete(s);
        dirty = true;
        if (stops.size) return;
        cancelAnimationFrame(raf);
        window.cancelIdleCallback?.(idle); clearTimeout(idle); clearInterval(tick);
        ro.disconnect();
        removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave);
        removeEventListener("resize", onResize); removeEventListener("load", mark);
        document.removeEventListener("fx:flock-gather", gather); document.removeEventListener("fx:flock-release", release);
        cv.remove(); probe.remove();
        engine = null;
      },
    };
  }

  // ── Attach ────────────────────────────────────────────────────
  kfFx.register("arrow-flock", (el, { options, reduce }) => {
    engine ??= makeEngine(reduce);
    const env = engine.env;
    const opt = (k, d) => { const m = isMobile() && options[`${k}-m`] !== undefined ? options[`${k}-m`] : options[k]; return m === undefined ? d : m; };
    const num = (k, d) => { const v = opt(k, undefined); return v === undefined || v === "" ? d : +v; };
    const kind = opt("form", "word");
    const anchorSel = opt("anchor", "");
    const anchor = () => (anchorSel && document.querySelector(anchorSel)) || el.querySelector(":scope [data-fx-part='stage']") || el;
    // Position: point ax·ay of the reference box, radius = Box width × fit (so it does not exceed height × max)
    const place = (defFit, defSize) => () => {
      const r = anchor().getBoundingClientRect(), H = vh();
      const R = Math.min(r.width * num("fit", defFit), H * num("max", 9));
      const sz = num("size", defSize(R));
      return [r.left + r.width * num("ax", 0.5), r.top + r.height * num("ay", 0.5), R, sz];
    };
    const autoSize = (R) => clamp(R * (isMobile() ? 0.026 : 0.03), 4.5, 8.5);
    const flags = { rot: num("rot", 0), spin: num("spin", 0), tilt: num("tilt", 0), wave: num("wave", 0), flap: opt("flap", "") === "on", glow: opt("glow", "") === "on", calm: opt("calm", "") === "on" };
    let form = null, need = 0;
    if (!kind) return;
    if (kind === "word") {
      const text = opt("text", "") || (el.querySelector(":scope [data-fx-part='word']")?.textContent || "").trim();
      if (!text) return;
      const fam = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim() || "sans-serif";
      const font = `${num("weight", 750)} 330px ${fam}`;
      const leadN = num("lead", 1), lead = 0.92 * leadN / Math.max(1, text.length);
      const pts = textPoints(text, env.count(), font, (x) => x < lead);
      form = pointForm(env, pts, () => {
        const r = anchor().getBoundingClientRect(), W = innerWidth;
        const R = Math.min(0.98 * r.width, r.height / (pts.ratio || 0.3), 0.92 * W);
        return [r.left + r.width / 2, r.top + r.height / 2, R, num("size", isMobile() ? 3.4 : clamp(0.0055 * R, 4, 6.5))];
      }, flags);
      // Redraw if the font loads late
      document.fonts?.ready.then(() => {
        if (!stop.form) return;
        const again = textPoints(text, env.count(), font, (x) => x < lead);
        pts.p.set(again.p); pts.g.set(again.g); pts.ratio = again.ratio;
      });
    } else if (kind === "ring") {
      const kids = () => { const all = [...el.querySelectorAll("[data-fx-part='ring']")]; const on = all.filter((k) => k.closest("[data-on='true']")); return on.length ? on : all.slice(0, 1); };
      form = ringForm(env, kids, num("count", isMobile() ? 64 : 190), { size: num("size", 5.5), speed: num("speed", 18e-6) });
    } else if (kind === "stack") {
      const rows = [...el.querySelectorAll("[data-fx-part='layer']")];
      let hovered = -1;
      rows.forEach((r, i) => {
        r.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovered = i; });
        r.addEventListener("pointerleave", () => { if (hovered === i) hovered = -1; });
      });
      const pick = () => {
        let k = hovered;
        if (k < 0) { let best = 1e9; rows.forEach((r, i) => { const b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - vh() / 2); if (d < best) { best = d; k = i; } }); }
        rows.forEach((r, i) => (r.dataset.on = String(i === k)));
        return k;
      };
      form = stackForm(env, anchor(), Math.max(1, rows.length || 3), pick);
    } else if (kind === "cards") {
      const cards = [...el.querySelectorAll("[data-fx-part='card']")];
      if (!cards.length) return;
      form = cardsForm(env, cards, num("count", isMobile() ? 360 : 720), options.size ? +options.size : undefined);
    } else if (kind === "portrait") {
      need = num("count", isMobile() ? 900 : 2200);
      const pts = portraitPoints(need);
      form = pointForm(env, pts, place(1 / 2.7, () => (isMobile() ? 2.3 : 2.6)), { ...flags, calm: true });
    } else if (kind === "code") {
      const fam = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim() || "sans-serif";
      const n = num("count", isMobile() ? 240 : 600);
      const pts = textPoints(opt("text", "</>"), n, `700 240px ${fam}`, (x) => Math.abs(x - 0.5) < 0.1);
      const base = place(0.15, autoSize);
      form = pointForm(env, pts, () => { const a = base(); a[2] *= 2.7; return a; }, flags);
    } else if (SHAPES[kind]) {
      const defaults = { logo: [isMobile() ? 56 : 104, 1 / 2.7, () => (isMobile() ? 4.5 : 6.5)], check: [isMobile() ? 34 : 64, 1 / 2.3, () => (isMobile() ? 4.5 : 7)] };
      const [n0, fit0, size0] = defaults[kind] || [isMobile() ? 240 : 600, 0.15, autoSize];
      const pts = SHAPES[kind](num("count", n0));
      form = pointForm(env, pts, place(fit0, size0), flags);
    }
    if (!form) return;
    // lt — .5 when the center of this section passes the screen center, and rotation (rot) follows the scroll
    const lt = () => { const r = el.getBoundingClientRect(); return 0.5 + (vh() / 2 - (r.top + r.height / 2)) / vh(); };
    const stop = { el, form, lt, need, span: opt("span", "") === "on", keyAt: opt("key", "center") };
    engine.add(stop);
    return () => { stop.form = null; engine?.remove(stop); };
  });
})();
