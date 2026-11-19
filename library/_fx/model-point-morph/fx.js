// Models are built from our basic shapes (cylinder · box · sphere · tube · prism) with flat normals per face — faces must look split like a low-poly model for the light to come alive.
// On change, the point cloud flies from the surface of the departing model to the surface of the next one, and the new model forms grain by grain and takes over the cloud.
(() => {
  const TAU = Math.PI * 2, DEG = Math.PI / 180;

  const rot = (p, [rx, ry, rz]) => {
    let [x, y, z] = p, c, s, t;
    c = Math.cos(rx); s = Math.sin(rx); t = y * c - z * s; z = y * s + z * c; y = t;
    c = Math.cos(ry); s = Math.sin(ry); t = x * c + z * s; z = -x * s + z * c; x = t;
    c = Math.cos(rz); s = Math.sin(rz); t = x * c - y * s; y = x * s + y * c; x = t;
    return [x, y, z];
  };
  const place = (o = {}) => {
    const r = (o.r || [0, 0, 0]).map((d) => d * DEG), t = o.t || [0, 0, 0], k = o.s || [1, 1, 1];
    return (p) => { const q = rot([p[0] * k[0], p[1] * k[1], p[2] * k[2]], r); return [q[0] + t[0], q[1] + t[1], q[2] + t[2]]; };
  };
  const tri = (m, a, b, c, tone) => { m.p.push(...a, ...b, ...c); m.k.push(tone, tone, tone); };
  const quad = (m, a, b, c, d, tone) => { tri(m, a, b, c, tone); tri(m, a, c, d, tone); };

  const cyl = (m, { r0 = 0.3, r1 = r0, h = 1, seg = 10, caps = true, tone = 0.7, ...o }) => {
    const f = place(o), y0 = -h / 2, y1 = h / 2;
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * TAU, b = ((i + 1) / seg) * TAU;
      const p0 = f([Math.cos(a) * r0, y0, Math.sin(a) * r0]), p1 = f([Math.cos(b) * r0, y0, Math.sin(b) * r0]);
      const q0 = f([Math.cos(a) * r1, y1, Math.sin(a) * r1]), q1 = f([Math.cos(b) * r1, y1, Math.sin(b) * r1]);
      quad(m, p0, q0, q1, p1, tone);
      if (caps && r0 > 0) tri(m, f([0, y0, 0]), p0, p1, tone);
      if (caps && r1 > 0) tri(m, f([0, y1, 0]), q1, q0, tone);
    }
  };
  const box = (m, { w = 1, h = 1, d = 1, tone = 0.7, ...o }) => {
    const f = place(o), x = w / 2, y = h / 2, z = d / 2;
    const v = [[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z], [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]].map(f);
    [[4, 5, 6, 7], [1, 0, 3, 2], [0, 4, 7, 3], [5, 1, 2, 6], [7, 6, 2, 3], [0, 1, 5, 4]].forEach(([a, b, c, e]) => quad(m, v[a], v[b], v[c], v[e], tone));
  };
  const ball = (m, { r = 0.1, seg = 8, ring = 6, tone = 0.7, ...o }) => {
    const f = place(o), pt = (i, j) => { const th = (j / ring) * Math.PI, ph = (i / seg) * TAU; return f([Math.sin(th) * Math.cos(ph) * r, Math.cos(th) * r, Math.sin(th) * Math.sin(ph) * r]); };
    for (let j = 0; j < ring; j++) for (let i = 0; i < seg; i++) quad(m, pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1), tone);
  };
  // Tube extruded by sweeping an n-gon cross-section along a polyline — cord · spiral strand · bar
  const tube = (m, pts, { r = 0.05, sides = 6, tone = 0.6, caps = true } = {}) => {
    const rings = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2];
      const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
      let ux = 0, uy = 1, uz = 0;
      if (Math.abs(ty) > 0.9) { ux = 1; uy = 0; }
      let nx = ty * uz - tz * uy, ny = tz * ux - tx * uz, nz = tx * uy - ty * ux;
      const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
      return Array.from({ length: sides }, (_, k) => {
        const th = (k / sides) * TAU + Math.PI / sides, c = Math.cos(th) * r, s = Math.sin(th) * r;
        return [p[0] + nx * c + bx * s, p[1] + ny * c + by * s, p[2] + nz * c + bz * s];
      });
    });
    for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < sides; k++) quad(m, rings[i][k], rings[i][(k + 1) % sides], rings[i + 1][(k + 1) % sides], rings[i + 1][k], tone);
    if (caps) [[rings[0], pts[0]], [rings[rings.length - 1], pts[pts.length - 1]]].forEach(([ring, c]) => { for (let k = 0; k < sides; k++) tri(m, c, ring[(k + 1) % sides], ring[k], tone); });
  };
  // Convex 2D polygon extruded along z by a thickness into a prism — wings and face plates
  const prism = (m, poly, { depth = 0.1, tone = 0.6, ...o }) => {
    const f = place(o), z = depth / 2, a = poly.map(([x, y]) => f([x, y, z])), b = poly.map(([x, y]) => f([x, y, -z]));
    for (let i = 1; i < poly.length - 1; i++) { tri(m, a[0], a[i], a[i + 1], tone); tri(m, b[0], b[i + 1], b[i], tone); }
    for (let i = 0; i < poly.length; i++) { const j = (i + 1) % poly.length; quad(m, a[i], b[i], b[j], a[j], tone); }
  };
  const octagon = (w, h, c) => [[-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2 - c], [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c]];

  const SHAPES = {
    rocket(m) {
      cyl(m, { r0: 0.24, r1: 0.33, h: 0.35, t: [0, -0.375, 0], tone: 0.72 });
      cyl(m, { r0: 0.33, r1: 0.31, h: 0.45, t: [0, 0.025, 0], tone: 0.78 });
      cyl(m, { r0: 0.31, r1: 0.19, h: 0.3, t: [0, 0.4, 0], tone: 0.8 });
      cyl(m, { r0: 0.19, r1: 0, h: 0.32, t: [0, 0.71, 0], tone: 0.86 });
      cyl(m, { r0: 0.342, r1: 0.342, h: 0.035, t: [0, -0.2, 0], tone: 0.98 });
      cyl(m, { r0: 0.196, r1: 0.196, h: 0.02, t: [0, 0.55, 0], tone: 0.08 });
      cyl(m, { r0: 0.17, r1: 0.22, h: 0.12, t: [0, -0.61, 0], tone: 0.2 });
      for (let i = 0; i < 3; i++) prism(m, [[0, 0.05], [0, -0.36], [0.27, -0.56], [0.25, -0.28]], { depth: 0.05, t: [Math.cos(i * TAU / 3) * 0.24, -0.25, Math.sin(i * TAU / 3) * 0.24], r: [0, -i * 120, 0], tone: 0.6 });
      cyl(m, { r0: 0.012, r1: 0.012, h: 0.26, seg: 5, t: [0, 0.98, 0], tone: 0.5 });
      ball(m, { r: 0.04, t: [0, 1.12, 0], tone: 0.95 });
    },
    headset(m) {
      prism(m, octagon(1.0, 0.52, 0.11), { depth: 0.42, tone: 0.62 });
      prism(m, octagon(0.94, 0.46, 0.09), { depth: 0.05, t: [0, 0, 0.23], tone: 0.22 });
      prism(m, octagon(0.9, 0.42, 0.1), { depth: 0.1, t: [0, 0, -0.26], tone: 0.3 });
      box(m, { w: 0.06, h: 0.16, d: 0.14, t: [0.52, 0, -0.1], tone: 0.4 });
      box(m, { w: 0.06, h: 0.16, d: 0.14, t: [-0.52, 0, -0.1], tone: 0.4 });
      const strap = [];
      for (let i = 0; i <= 18; i++) { const a = Math.PI * (i / 18); strap.push([Math.cos(a) * 0.55, 0, -0.1 - Math.sin(a) * 0.62]); }
      tube(m, strap, { r: 0.05, sides: 4, tone: 0.32 });
      const top = [];
      for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); top.push([0, Math.sin(a) * 0.32, -0.25 - (1 - Math.cos(a)) * 0.24]); }
      tube(m, top, { r: 0.045, sides: 4, tone: 0.35 });
    },
    helix(m) {
      const turns = 1.15, n = 44, A = [], B = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, a = t * TAU * turns, y = -1 + 2 * t;
        A.push([Math.cos(a) * 0.36, y, Math.sin(a) * 0.36]);
        B.push([Math.cos(a + Math.PI) * 0.36, y, Math.sin(a + Math.PI) * 0.36]);
      }
      tube(m, A, { r: 0.06, sides: 6, tone: 0.42 });
      tube(m, B, { r: 0.06, sides: 6, tone: 0.42 });
      for (let i = 2; i < n - 1; i += 3) tube(m, [A[i], B[i]], { r: 0.03, sides: 5, tone: 0.64 });
    },
    rack(m) {
      box(m, { w: 1.6, h: 0.12, d: 0.5, t: [0, -0.46, 0], tone: 0.34 });
      box(m, { w: 0.12, h: 0.7, d: 0.5, t: [-0.74, -0.11, 0], tone: 0.34 });
      box(m, { w: 0.12, h: 0.7, d: 0.5, t: [0.74, -0.11, 0], tone: 0.34 });
      box(m, { w: 1.6, h: 0.1, d: 0.1, t: [0, 0.2, 0.2], tone: 0.36 });
      box(m, { w: 1.6, h: 0.1, d: 0.1, t: [0, 0.2, -0.2], tone: 0.36 });
      for (let i = 0; i < 5; i++) box(m, { w: 0.06, h: 0.1, d: 0.32, t: [-0.62 + i * 0.31, 0.2, 0], tone: 0.36 });
      for (let i = 0; i < 4; i++) {
        const x = -0.465 + i * 0.31;
        cyl(m, { r0: 0.1, r1: 0.1, h: 0.72, caps: false, t: [x, 0.02, 0], tone: 0.56 });
        ball(m, { r: 0.1, t: [x, -0.34, 0], tone: 0.56 });
        cyl(m, { r0: 0.125, r1: 0.125, h: 0.06, t: [x, 0.4, 0], tone: 0.7 });
      }
    },
    box(m) { box(m, { w: 1, h: 1, d: 1, tone: 0.6 }); },
    ball(m) { ball(m, { r: 0.6, seg: 14, ring: 10, tone: 0.7 }); },
  };

  // Gather at the center and scale so the longest side is 1.9 — the size the original fit per model
  function build(name, scale) {
    const m = { p: [], k: [] };
    (SHAPES[name] || SHAPES.box)(m);
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < m.p.length; i += 3) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], m.p[i + a]); hi[a] = Math.max(hi[a], m.p[i + a]); }
    const k = (1.9 / Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2])) * scale, c = lo.map((v, a) => (v + hi[a]) / 2);
    const pos = new Float32Array(m.p.length), nor = new Float32Array(m.p.length), tone = new Float32Array(m.k);
    for (let i = 0; i < m.p.length; i++) pos[i] = (m.p[i] - c[i % 3]) * k;
    const areas = [];
    let total = 0;
    for (let i = 0; i < pos.length; i += 9) {
      const ux = pos[i + 3] - pos[i], uy = pos[i + 4] - pos[i + 1], uz = pos[i + 5] - pos[i + 2];
      const vx = pos[i + 6] - pos[i], vy = pos[i + 7] - pos[i + 1], vz = pos[i + 8] - pos[i + 2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz) || 1;
      total += l / 2; areas.push(total);
      nx /= l; ny /= l; nz /= l;
      for (let j = 0; j < 3; j++) { nor[i + j * 3] = nx; nor[i + j * 3 + 1] = ny; nor[i + j * 3 + 2] = nz; }
    }
    const radius = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2 * k;
    return { pos, nor, tone, areas, total, radius };
  }

  // Picks points from the surface in proportion to area — wider faces get more points, so the cloud draws the model silhouette as is
  function sample(g, n) {
    const out = new Float32Array(n * 3), tone = new Float32Array(n);
    for (let e = 0; e < n; e++) {
      const r = Math.random() * g.total;
      let lo = 0, hi = g.areas.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (g.areas[mid] < r) lo = mid + 1; else hi = mid; }
      let s = Math.random(), t = Math.random();
      if (s + t > 1) { s = 1 - s; t = 1 - t; }
      const u = 1 - s - t, i = lo * 9;
      for (let a = 0; a < 3; a++) out[e * 3 + a] = g.pos[i + a] * u + g.pos[i + 3 + a] * s + g.pos[i + 6 + a] * t;
      tone[e] = g.tone[lo * 3];
    }
    return { pos: out, tone };
  }

  const SOLID_V = `
    attribute vec3 position; attribute vec3 normal; attribute float tone;
    uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix;
    varying vec3 vN; varying vec3 vEye; varying float vTone; varying vec3 vObj;
    void main() {
      vTone = tone; vObj = position;
      vN = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vEye = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }`;
  const SOLID_F = `
    precision highp float;
    uniform vec3 uBase; uniform vec3 uInk; uniform float uProgress; uniform float uGrain;
    varying vec3 vN; varying vec3 vEye; varying float vTone; varying vec3 vObj;
    float h3(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float vn(vec3 p) {
      vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      float a = mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x), b = mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x);
      float c = mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x), d = mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0)), f.x);
      return mix(mix(a, b, f.y), mix(c, d, f.y), f.z);
    }
    float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
    void main() {
      vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
      vec3 v = normalize(-vEye), key = normalize(vec3(0.35, 0.85, 0.55));
      float lit = 0.12 + 0.74 * max(dot(n, key), 0.0) + 0.16 * max(dot(n, normalize(vec3(-0.6, 0.15, -0.45))), 0.0);
      float alb = mix(0.16, 1.0, vTone), l = lit * alb;
      bool darkGround = luma(uBase) < luma(uInk);
      vec3 lo = darkGround ? uBase : uInk, hi = darkGround ? uInk : uBase;
      float rim = 1.0 - max(dot(n, v), 0.0); rim = 0.28 * rim * rim;
      l = clamp(l + (darkGround ? rim * 1.1 : -rim), 0.0, 1.0);
      l = mix(l, l * l * (3.0 - 2.0 * l), darkGround ? 0.2 : 0.65);
      vec3 col = mix(lo, hi, mix(darkGround ? 0.3 : 0.03, 0.94, l));
      float sheen = pow(max(dot(n, normalize(key + v)), 0.0), 56.0) * (0.35 + 0.65 * alb);
      col = mix(col, vec3(1.0), clamp(sheen * 0.85, 0.0, 1.0));
      float g = vn(vObj * uGrain) * 0.76 + h3(floor(vObj * uGrain * 3.0)) * 0.24;
      float a = clamp((uProgress - g * 0.94) / 0.06, 0.0, 1.0);
      if (a <= 0.001) discard;
      gl_FragColor = vec4(mix(uBase, col, a), 1.0);
    }`;
  const CLOUD_V = `
    attribute vec3 aFrom; attribute vec3 aTo; attribute float aToneFrom; attribute float aToneTo; attribute vec3 aDir; attribute float aSeed;
    uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
    uniform float uMix; uniform float uSpread; uniform float uSize;
    varying float vBump; varying float vTone;
    void main() {
      float m = clamp(uMix / 0.82, 0.0, 1.0);
      float t = clamp((m - aSeed * 0.3) / 0.7, 0.0, 1.0);
      t = t * t * (3.0 - 2.0 * t);
      t = 1.0 - pow(1.0 - t, 1.7);
      float bump = sin(3.141592 * t);
      vec3 p = mix(aFrom, aTo, t) + aDir * (uSpread * bump);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (1.0 - 0.5 * bump) / max(0.4, -mv.z);
      vBump = bump; vTone = mix(aToneFrom, aToneTo, t);
    }`;
  const CLOUD_F = `
    precision highp float;
    uniform vec3 uBase; uniform vec3 uInk; uniform float uFade;
    varying float vBump; varying float vTone;
    float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
    void main() {
      vec2 c = gl_PointCoord - 0.5; float d = dot(c, c);
      if (d > 0.25) discard;
      bool darkGround = luma(uBase) < luma(uInk);
      vec3 lo = darkGround ? uBase : uInk, hi = darkGround ? uInk : uBase;
      float alb = mix(0.16, 1.0, vTone);
      vec3 surface = mix(lo, hi, mix(darkGround ? 0.3 : 0.03, 0.94, 0.08 + 0.62 * alb));
      gl_FragColor = vec4(mix(surface, uInk, 0.55 * vBump), uFade * (1.0 - 0.4 * vBump) * smoothstep(0.25, 0.12, d));
    }`;

  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a || 1))); return t * t * (3 - 2 * t); };
  const rgbOf = (str) => { const m = String(str).match(/[\d.]+/g); return m && m.length >= 3 ? [m[0] / 255, m[1] / 255, m[2] / 255] : [0, 0, 0]; };

  kfFx.register("model-point-morph", (el, { options, reduce }) => {
    if (!window.OGL || !window.gsap) return;
    const nodes = [...el.querySelectorAll('[data-fx-part="model"]')];
    if (!nodes.length) return;
    const { Renderer, Camera, Transform, Program, Mesh, Geometry } = OGL;
    const zoom = +options.zoom || 1.15, dur = +(options.dur ?? 0.95), intro = +(options.intro ?? 1.2), auto = +(options.auto ?? 0);
    const baseVar = options.base || "--kf-bg";
    let index = Math.min(nodes.length - 1, Math.max(0, Math.round(+(options.index ?? 0)) || 0));

    const renderer = new Renderer({ dpr: Math.min(devicePixelRatio || 1, 1.5), alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.className = "fx-model-point-morph__gl";
    el.append(canvas);

    const eb = 4.5 / zoom;
    const camera = new Camera(gl, { fov: 40, near: 0.1, far: 100 });
    camera.position.set(0, 0, eb);
    const scene = new Transform();

    let base = [1, 1, 1], ink = [0, 0, 0];
    const readColors = () => {
      ink = rgbOf(getComputedStyle(el).color);
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;color:var(${baseVar})`;
      el.append(probe);
      base = rgbOf(getComputedStyle(probe).color);
      probe.remove();
    };
    readColors();
    const solidInk = () => ink.map((v, i) => 0.94 * v + 0.06 * base[i]);

    const rect = el.getBoundingClientRect();
    const count = Math.round(Math.min(22000, Math.max(3000, (22000 * Math.max(1, rect.width * rect.height)) / 547284)));
    const dir = new Float32Array(count * 3), seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const z = Math.random() * 2 - 1, a = Math.random() * TAU, s = Math.sqrt(1 - z * z), r = Math.cbrt(Math.random());
      dir[i * 3] = s * Math.cos(a) * r; dir[i * 3 + 1] = s * Math.sin(a) * r; dir[i * 3 + 2] = z * r;
      seed[i] = Math.random();
    }

    let radius = 0;
    const models = nodes.map((node) => {
      const g = build(node.dataset.shape || "box", +node.dataset.scale || 1);
      radius = Math.max(radius, g.radius);
      const tilt = (node.dataset.tilt || "0,0,0").split(",").map((v) => +v || 0);
      const program = new Program(gl, {
        vertex: SOLID_V, fragment: SOLID_F, cullFace: null,
        uniforms: { uBase: { value: [...base] }, uInk: { value: solidInk() }, uProgress: { value: 0 }, uGrain: { value: 47.4 } },
      });
      const geometry = new Geometry(gl, { position: { size: 3, data: g.pos }, normal: { size: 3, data: g.nor }, tone: { size: 1, data: g.tone } });
      const outer = new Transform(), spin = new Transform();
      outer.rotation.set(tilt[0] * DEG, tilt[1] * DEG, tilt[2] * DEG);
      spin.setParent(outer);
      outer.setParent(scene);
      const mesh = new Mesh(gl, { geometry, program });
      mesh.frustumCulled = false;
      mesh.setParent(spin);
      outer.visible = false;
      return { program, outer, spin, tilt, cloud: sample(g, count), draw: { v: 0 } };
    });

    const from = new Float32Array(count * 3), to = new Float32Array(count * 3), toneFrom = new Float32Array(count), toneTo = new Float32Array(count);
    const cloudGeo = new Geometry(gl, {
      aFrom: { size: 3, data: from }, aTo: { size: 3, data: to }, aToneFrom: { size: 1, data: toneFrom }, aToneTo: { size: 1, data: toneTo },
      aDir: { size: 3, data: dir }, aSeed: { size: 1, data: seed },
    });
    const cloudProg = new Program(gl, {
      vertex: CLOUD_V, fragment: CLOUD_F, transparent: true, depthWrite: false, cullFace: null,
      uniforms: { uMix: { value: 0 }, uSpread: { value: 0.22 }, uSize: { value: 8 }, uBase: { value: [...base] }, uInk: { value: [...ink] }, uFade: { value: 0 } },
    });
    const tiltT = new Transform(), spinT = new Transform();
    spinT.setParent(tiltT);
    tiltT.setParent(scene);
    const cloud = new Mesh(gl, { geometry: cloudGeo, program: cloudProg, mode: gl.POINTS });
    cloud.frustumCulled = false;
    cloud.setParent(spinT);
    cloud.visible = false;
    const upload = (...names) => names.forEach((n) => { cloudGeo.attributes[n].needsUpdate = true; });

    const fit = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1, ey = eb * Math.tan(20 * DEG);
      const k = (0.95 * ey * Math.min(1, w / h)) / (radius || 1.4);
      scene.scale.set(k, k, k);
    };
    let lw = -1, lh = -1;
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w < 1 || h < 1 || (w === lw && h === lh)) return;
      lw = w; lh = h;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
      fit();
      if (!raf) frame(performance.now(), true);
    };

    const morph = { from: index, to: index, t: 0 };
    let tl = null, condense = reduce ? 1 : 0, condenseAt = 0, started = false;
    let w = 0, boost = 0, turning = false, turnFrom = 0, turnTo = 0, lastY = scrollY;
    let key = "", eg = 0, em = 0, spreadMul = 1;
    const tiltFrom = [0, 0, 0], tiltNow = [0, 0, 0];

    const show = (i) => {
      i = Math.max(0, Math.min(models.length - 1, Math.round(i)));
      if (i === index && !(morph.t > 0 && morph.t < 1)) return;
      const prev = index;
      index = i;
      if (reduce) { models.forEach((m, k) => { m.draw.v = +(k === i); }); frame(performance.now(), true); return; }
      morph.from = morph.t > 0 && morph.t < 1 ? (morph.t < 0.5 ? morph.from : morph.to) : prev;
      morph.to = i;
      morph.t = 0;
      tl?.kill();
      tl = gsap.timeline();
      tl.to(morph, { t: 1, duration: dur, ease: "none" }, 0);
      models.forEach((m, k) => { if (k !== i && m.draw.v > 0.001) tl.to(m.draw, { v: 0, duration: 0.14, ease: "power2.in" }, 0); });
      tl.to(models[i].draw, { v: 1, duration: 0.28, ease: "power1.out" }, dur * (0.7 / 0.95));
    };
    const onShow = (e) => show(+(e.detail?.index ?? e.detail ?? 0));
    el.addEventListener("fx:show", onShow);

    const start = () => {
      if (started) return;
      started = true;
      if (reduce) { models[index].draw.v = 1; return; }
      condenseAt = performance.now();
      gsap.fromTo(models[index].draw, { v: 0 }, { v: 1, duration: intro, ease: "power2.out" });
    };

    let raf = 0, visible = false, shown = false;
    function frame(now, once) {
      if (!once) raf = visible ? requestAnimationFrame(frame) : 0;
      const dy = scrollY - lastY;
      lastY = scrollY;
      if (!reduce) {
        boost += (Math.min(0.0016 * Math.abs(dy), 0.13) - boost) * 0.08;
        if (morph.t > 1e-4 && morph.t < 0.9999) {
          const e = morph.t;
          if (!turning) { turning = true; turnFrom = w; turnTo = Math.ceil((w - 0.05) / TAU) * TAU; }
          w = turnFrom + e * e * (3 - 2 * e) * (turnTo - turnFrom);
        } else { turning = false; if (!once) w += 0.003 + boost; }
      }
      if (started && condense < 1) condense = Math.min(1, condense + (now - condenseAt) / 900), condenseAt = now;
      const c = condense >= 1 ? 1 : smooth(0.62, 0.95, condense);
      const sInk = solidInk();
      let any = false, top = 0, best = 0;
      models.forEach((m, k) => {
        const s = Math.max(0, Math.min(1, m.draw.v)) * c;
        m.program.uniforms.uProgress.value = s;
        m.program.uniforms.uBase.value = base;
        m.program.uniforms.uInk.value = sInk;
        m.spin.rotation.y = w;
        m.outer.visible = s > 0.001;
        if (m.draw.v > best) { best = m.draw.v; top = k; }
        if (m.outer.visible) any = true;
      });
      const live = morph.t > 1e-4 && morph.t < 0.9999;
      const run = live ? morph : started && condense > 1e-4 && condense < 0.9999 ? { from: top, to: top, t: condense, intro: true } : null;
      let draw = false;
      if (run && !reduce) {
        const A = models[run.from].cloud, B = models[run.to].cloud, k = run.intro ? "in" + run.to : run.from + ">" + run.to;
        if (k !== key) {
          if (key && em > 1e-4 && em < 0.9999) {
            // Use the flying position as the new starting point — so the cloud doesn’t jump when re-aiming
            const r = Math.min(1, Math.max(0, em / 0.82)), sp = cloudProg.uniforms.uSpread.value;
            for (let e = 0; e < count; e++) {
              let t = Math.min(1, Math.max(0, (r - 0.3 * seed[e]) / 0.7));
              t = 1 - Math.pow(1 - t * t * (3 - 2 * t), 1.7);
              const b = Math.sin(Math.PI * t);
              for (let a = 0; a < 3; a++) { const o = e * 3 + a; from[o] = from[o] + (to[o] - from[o]) * t + dir[o] * sp * b; }
              toneFrom[e] += (toneTo[e] - toneFrom[e]) * t;
            }
            spreadMul = Math.max(0.2, 1 - Math.sin(Math.PI * r));
            tiltFrom.splice(0, 3, ...tiltNow);
          } else if (run.intro) {
            const lift = 0.55 * (radius || 1.4);
            for (let e = 0; e < count * 3; e++) from[e] = A.pos[e] + dir[e] * lift;
            toneFrom.set(A.tone);
            spreadMul = 0;
            tiltFrom.splice(0, 3, ...models[run.to].tilt);
          } else {
            from.set(A.pos); toneFrom.set(A.tone);
            spreadMul = 1;
            tiltFrom.splice(0, 3, ...models[run.from].tilt);
          }
          to.set(B.pos); toneTo.set(B.tone);
          upload("aFrom", "aTo", "aToneFrom", "aToneTo");
          key = k;
        }
        eg += (1 - eg) * 0.35;
        const fade = Math.min(eg, smooth(1, 0.78, run.t));
        const u = cloudProg.uniforms;
        u.uMix.value = run.t;
        u.uFade.value = fade;
        u.uSpread.value = 0.3 * (radius || 1.4) * spreadMul;
        u.uSize.value = 2.8 * renderer.dpr * eb;
        u.uBase.value = base;
        u.uInk.value = sInk;
        em = run.t;
        const tt = models[run.to].tilt;
        for (let a = 0; a < 3; a++) tiltNow[a] = tiltFrom[a] + (tt[a] - tiltFrom[a]) * run.t;
        tiltT.rotation.set(tiltNow[0] * DEG, tiltNow[1] * DEG, tiltNow[2] * DEG);
        spinT.rotation.y = w;
        draw = fade > 0.002;
      } else { eg = 0; em = 0; }
      cloud.visible = draw;
      renderer.render({ scene, camera });
      if (!shown && any) { shown = true; requestAnimationFrame(() => { canvas.style.opacity = "1"; }); }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible) { start(); if (!raf) raf = requestAnimationFrame(frame); }
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    const mo = new MutationObserver(() => { readColors(); if (!raf) frame(performance.now(), true); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    const timer = auto > 0 && !reduce ? setInterval(() => { if (visible) show((index + 1) % models.length); }, auto * 1000) : 0;
    if (reduce) { models[index].draw.v = 1; started = true; }

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      tl?.kill();
      models.forEach((m) => gsap.killTweensOf(m.draw));
      ro.disconnect(); io.disconnect(); mo.disconnect();
      el.removeEventListener("fx:show", onShow);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
