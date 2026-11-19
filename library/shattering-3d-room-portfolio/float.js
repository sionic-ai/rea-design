// Subpage background — small 3D furniture pieces flow while winding as a two-strand helix around a curve crossing the page. Pieces stick to the scroll and rise with the page.
// Original values (re-transcribed): the curve is a centripetal Catmull-Rom through points placed by fractions of page height, one spiral turn pitch px · radius a fraction of screen width, two strands offset by half a turn,
// Flow speed in px per second + scroll share .35 (clamped to ±240), each piece sways with an orbit share of .26~.3, and on appearing they scale up with back(1.6), each .035s later. Lighting — warm white light 3.4 · cool light .45 · sky/ground light .5.
// Our own shapes built from boxes, cylinders and rings instead of the original furniture models (yellow-frame chair, book, cup, vase, lamp, planter, monitor, table).
(() => {
  const host = document.querySelector("[data-float]");
  if (!host || !window.THREE || RI.reduced) return;
  const T = THREE, TAU = Math.PI * 2, N = 900;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mod = (a, b) => ((a % b) + b) % b;
  const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 1e4) / 1e4; };
  const backOut = (t) => { const r = t - 1; return 1 + 2.6 * r * r * r + 1.6 * r * r; };
  const SETS = {
    about: { runs: [{ from: 0.1, to: 0.6, points: [["L", 0], [34, 0.1], [74, 0.3], [30, 0.56], [64, 0.82], ["R", 1]], strands: [["mark", "mark", "chair", "mark", "mark", "book", "mark", "mark", "cup"], ["cup", "plant", "book", "vase", "chair", "cup", "book", "lamp", "vase"]] }, { from: 0.7, to: 1, points: [["R", 0], [62, 0.22], [30, 0.5], [58, 0.8], ["L", 1]], strands: [["plant", "book", "cup", "vase", "book", "monitor", "plant", "chair", "book"], ["mark", "mark", "chair", "mark", "mark", "book", "mark", "mark", "cup"]] }], pitch: 620, radius: (w) => clamp(w * 0.085, 56, 120), size: (k) => (k === "mark" ? 66 : k === "book" ? 40 : 48), orbit: 0.3, speed: 20, repeat: 3 },
    works: { runs: [{ from: 0.1, to: 0.6, points: [["R", 0], [70, 0.14], [36, 0.34], [20, 0.55], [58, 0.8], ["L", 1]], strands: [["sofa", "book", "monitor", "table", "chair", "book", "shelf", "lamp", "box", "box"], ["chair", "lamp", "book", "monitor", "table", "box", "book", "chair", "lamp", "vase"]] }, { from: 0.7, to: 1, points: [["L", 0], [26, 0.2], [62, 0.46], [80, 0.72], ["R", 1]], strands: [["box", "lamp", "book", "monitor", "sofa", "mark", "table", "plant"], ["shelf", "monitor", "lamp", "book", "table", "box", "vase", "shelf"]] }], pitch: 1000, radius: (w) => clamp(w * 0.12, 70, 150), size: (k) => (/sofa|table|shelf/.test(k) ? 124 : k === "book" ? 52 : /chair|lamp|monitor|box/.test(k) ? 100 : 76), orbit: 0.26, speed: 28, repeat: 2 },
  };
  const set = SETS[host.dataset.float];
  if (!set) return;

  // Read colors from the skin — paint color-mix onto a canvas once to get the real value
  const probe = document.createElement("canvas").getContext("2d");
  const tone = (v) => { const d = document.createElement("i"); d.style.color = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1); const [r, g, b] = probe.getImageData(0, 0, 1, 1).data; return new T.Color(r / 255, g / 255, b / 255).convertSRGBToLinear(); };
  const mat = { plaster: new T.MeshStandardMaterial({ roughness: 0.82, metalness: 0 }), gold: new T.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }) };
  const paint = () => { mat.plaster.color.copy(tone("--site-plaster")); mat.gold.color.copy(tone("--site-gold")); };

  const box = (w, h, d, m = mat.plaster) => new T.Mesh(new T.BoxGeometry(w, h, d), m);
  const cyl = (r1, r2, h, m = mat.plaster, s = 18) => new T.Mesh(new T.CylinderGeometry(r1, r2, h, s), m);
  const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
  const SHAPES = {
    chair: () => { const g = new T.Group(); g.add(at(box(1, 0.12, 1, mat.gold), 0, 0.5, 0), at(box(0.12, 1, 0.12, mat.gold), -0.44, 0, -0.44), at(box(0.12, 1, 0.12, mat.gold), 0.44, 0, 0.44), at(box(0.12, 1.1, 1, mat.gold), -0.44, 1, 0), at(box(1, 0.12, 0.12, mat.gold), 0, -0.5, 0.44)); return g; },
    mark: () => { const g = new T.Group(); g.add(at(box(0.22, 1.2, 0.22, mat.gold), -0.3, 0, 0), at(box(0.8, 0.22, 0.22, mat.gold), 0.1, 0.49, 0), at(box(0.22, 0.6, 0.22, mat.gold), 0.4, 0.2, 0)); return g; },
    book: () => box(1, 0.22, 0.72),
    cup: () => { const g = new T.Group(); g.add(cyl(0.42, 0.34, 0.9)); const h = new T.Mesh(new T.TorusGeometry(0.22, 0.06, 8, 18), mat.plaster); g.add(at(h, 0.5, 0.05, 0)); return g; },
    vase: () => new T.Mesh(new T.LatheGeometry([[0, -0.8], [0.4, -0.75], [0.55, -0.3], [0.3, 0.4], [0.18, 0.7], [0.26, 0.85], [0, 0.85]].map(([x, y]) => new T.Vector2(x, y)), 22), mat.plaster),
    lamp: () => { const g = new T.Group(); g.add(at(cyl(0.38, 0.38, 0.08), 0, -0.8, 0), at(cyl(0.04, 0.04, 1.4), 0, -0.1, 0), at(cyl(0.18, 0.55, 0.5), 0, 0.75, 0)); return g; },
    plant: () => { const g = new T.Group(); g.add(at(cyl(0.36, 0.28, 0.6), 0, -0.5, 0)); for (let i = 0; i < 5; i++) g.add(at(box(0.12, 0.9, 0.04), Math.cos(i) * 0.15, 0.25, Math.sin(i) * 0.15, 0.3 * Math.sin(i * 2), i, 0.35 * Math.cos(i * 3))); return g; },
    monitor: () => { const g = new T.Group(); g.add(at(box(1.6, 1, 0.08), 0, 0.3, 0), at(box(0.12, 0.5, 0.12), 0, -0.4, 0), at(box(0.6, 0.06, 0.4), 0, -0.66, 0)); return g; },
    table: () => { const g = new T.Group(); g.add(at(box(2, 0.1, 1.1), 0, 0.5, 0)); for (const [x, z] of [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]]) g.add(at(box(0.08, 1, 0.08), x, 0, z)); return g; },
    sofa: () => { const g = new T.Group(); g.add(at(box(2, 0.5, 0.9), 0, 0, 0), at(box(2, 0.7, 0.25), 0, 0.5, -0.33), at(box(0.25, 0.6, 0.9), -0.88, 0.3, 0), at(box(0.25, 0.6, 0.9), 0.88, 0.3, 0)); return g; },
    shelf: () => { const g = new T.Group(); g.add(at(box(0.06, 2, 0.5), -0.6, 0, 0), at(box(0.06, 2, 0.5), 0.6, 0, 0)); for (let i = 0; i < 4; i++) g.add(at(box(1.2, 0.06, 0.5), 0, -0.95 + i * 0.63, 0)); return g; },
    box: () => box(1, 1.3, 0.9),
  };

  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.domElement.className = "float-canvas";
  host.append(renderer.domElement);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 10, 8000);
  const warm = new T.DirectionalLight(new T.Color(1, 0.965, 0.91), 3.4); /* Not skin: warm white light of the original lighting */
  warm.position.set(0.45, 0.8, 1);
  const cool = new T.DirectionalLight(new T.Color(0.92, 0.94, 1), 0.45); /* Not skin: cool light of the original lighting */
  cool.position.set(-1, 0.3, 0.6);
  scene.add(warm, cool, new T.HemisphereLight(new T.Color(1, 1, 1), new T.Color(0.85, 0.81, 0.77), 0.5), new T.AmbientLight(new T.Color(1, 1, 1), 0.08)); /* Not skin: sky/ground light */
  const world = new T.Group();
  scene.add(world);

  let order = 0;
  const runs = set.runs.map((spec, ri) => ({
    spec, seed: hash(`${host.dataset.float}:run:${ri}`) * TAU,
    strands: spec.strands.map((list, si) => {
      const all = Array.from({ length: set.repeat }, () => list).flat();
      return {
        s: si,
        pieces: all.map((k, i) => {
          const inner = SHAPES[k](), pivot = new T.Group(), b = new T.Box3().setFromObject(inner);
          inner.position.sub(b.getCenter(new T.Vector3()));
          pivot.add(inner);
          world.add(pivot);
          const seed = hash(`${ri}:${si}:${k}:${i}`);
          return { pivot, span: Math.max(0.001, b.getSize(new T.Vector3()).length()), seed, slot: (i + si * 0.5) / all.length, size: set.size(k), flat: k === "mark", axis: new T.Vector3(seed - 0.5, 1, hash(`${k}:z`) - 0.5).normalize(), order: order++ };
        }),
        length: 1, radius: 1, pos: new Float32Array(N * 3), nrm: new Float32Array(N * 2), arc: new Float32Array(N),
      };
    }),
  }));

  let W = 1, H = 1, unit = 1, small = false;
  function resize() {
    W = Math.max(1, innerWidth); H = Math.max(1, innerHeight); small = W < 700;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
    renderer.setSize(W, H, false);
    cam.aspect = W / H;
    cam.position.set(0, 0, H / 2 / Math.tan(T.MathUtils.degToRad(cam.fov / 2)));
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    unit = clamp(Math.min(W, H) / 800, 0.62, 1.2);
  }
  const P = new T.Vector3(), D = new T.Vector3();
  function layout() {
    const doc = document.documentElement.scrollHeight, edge = Math.max(W * 0.18, 190 * unit), rad = set.radius(W) * (small ? 0.8 : 1), pitch = set.pitch * unit;
    runs.forEach((run) => {
      const { spec } = run, y0 = spec.from * doc, span = (spec.to - spec.from) * doc;
      const curve = new T.CatmullRomCurve3(spec.points.map(([x, m]) => new T.Vector3(x === "L" ? -edge : x === "R" ? W + edge : (x / 100) * W, y0 + m * span, 0)), false, "centripetal");
      const len = curve.getLength();
      run.strands.forEach((st) => {
        let acc = 0;
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1);
          curve.getPointAt(u, P); curve.getTangentAt(u, D);
          const turn = ((u * len) / pitch) * TAU + st.s * Math.PI;
          const wob = 1 + 0.14 * Math.sin((u * len) / (pitch * 2.3) + run.seed) + 0.07 * Math.sin((u * len) / (pitch * 0.9) + run.seed * 3);
          const g = rad * (0.84 + 0.16 * Math.sin(u * Math.PI)) * wob, nx = -D.y, ny = D.x;
          const x = P.x + nx * Math.cos(turn) * g, y = P.y + ny * Math.cos(turn) * g;
          if (i) acc += Math.hypot(x - st.pos[(i - 1) * 3], y - st.pos[(i - 1) * 3 + 1]);
          st.pos[i * 3] = x; st.pos[i * 3 + 1] = y; st.pos[i * 3 + 2] = Math.sin(turn) * g;
          st.nrm[i * 2] = nx; st.nrm[i * 2 + 1] = ny; st.arc[i] = acc;
        }
        st.length = Math.max(1, acc); st.radius = rad;
      });
    });
  }
  const A = new T.Vector3(), nrm = new T.Vector2(), q = new T.Quaternion(), eul = new T.Euler();
  function along(st, d) {
    const l = mod(d, st.length);
    let lo = 0, hi = N - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (st.arc[m] <= l) lo = m; else hi = m; }
    const k = clamp((l - st.arc[lo]) / Math.max(1e-4, st.arc[hi] - st.arc[lo]), 0, 1), a = lo * 3, b = hi * 3;
    A.set(st.pos[a] + (st.pos[b] - st.pos[a]) * k - W / 2, -(st.pos[a + 1] + (st.pos[b + 1] - st.pos[a + 1]) * k), st.pos[a + 2] + (st.pos[b + 2] - st.pos[a + 2]) * k);
    nrm.set(st.nrm[lo * 2], -st.nrm[lo * 2 + 1]);
  }
  let born = null, t0 = performance.now(), lastT = 0, lastY = scrollY, dist = 0;
  function draw() {
    const t = (performance.now() - t0) / 1000, sy = scrollY, spin = sy * 0.0006;
    // Flow — on top of speed px per second, it flows .35× more by scrolled distance (clamped to ±240px per beat)
    const dt = Math.min(0.05, Math.max(0, t - lastT)); lastT = t;
    dist += set.speed * dt + Math.max(-240, Math.min(240, sy - lastY)) * 0.35; lastY = sy;
    const flow = dist;
    world.position.set(0, H / 2 + sy, 0);
    for (const run of runs) for (const st of run.strands) {
      const o = st.radius * set.orbit;
      for (const p of st.pieces) {
        along(st, p.slot * st.length + flow);
        const ang = t * TAU * (0.08 + p.seed * 0.06) + p.seed * TAU;
        A.x += nrm.x * Math.cos(ang) * o;
        A.y += nrm.y * Math.cos(ang) * o + Math.sin(t * (0.7 + p.seed) + p.seed * 9) * o * 0.35;
        A.z += Math.sin(ang) * o;
        const grow = born === null ? 1 : clamp((t - born - 0.2 - p.order * 0.035) / 0.9, 0, 1);
        const s = p.size * unit * (small ? 0.62 : 1) * (grow ? backOut(grow) : 0);
        p.pivot.visible = s > 0.01;
        p.pivot.position.copy(A);
        p.pivot.scale.setScalar(s / p.span);
        if (p.flat) { eul.set(Math.atan(1 / Math.SQRT2) + Math.sin(t * 0.5 + p.seed * TAU) * 0.08, -Math.PI / 4 + Math.sin(t * 0.6 + p.seed * 9) * 0.24 + spin, 0); p.pivot.rotation.copy(eul); }
        else { q.setFromAxisAngle(p.axis, p.seed * TAU + t * (0.22 + p.seed * 0.3) + spin); p.pivot.quaternion.copy(q); }
      }
    }
    renderer.render(scene, cam);
  }
  const exposure = () => { renderer.toneMappingExposure = document.documentElement.dataset.theme === "dark" ? 0.5 : 0.95; paint(); };
  resize(); exposure(); layout();
  addEventListener("resize", () => { resize(); layout(); });
  addEventListener("ri:theme", exposure);
  new ResizeObserver(() => layout()).observe(document.body);
  let seen = true;
  new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(document.body);
  RI.ticks.add(() => { if (seen && !document.hidden) draw(); return true; });
  // After the curtain lifts, pieces appear one by one, growing larger
  RI.floatBegin = () => { born = (performance.now() - t0) / 1000; renderer.domElement.classList.add("is-ready"); };
  setTimeout(() => born === null && RI.floatBegin(), 900);
})();
