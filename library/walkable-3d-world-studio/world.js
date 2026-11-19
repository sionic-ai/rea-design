/* One 3D world laid behind all pages — the same plate as the original (three r185), with shapes · shaders newly written.
   Sky (gradient + drifting clouds) · hill terrain · grass swaying in the wind · low-poly rock ridge · mirror-reflection lake ·
   Shape-shifting particle cloud · black cylindrical building · flowering tree · falling leaves · fireflies · chromatic aberration on entry.
   A page gives the camera path with EmWorld.path([...scenes]) and travels it with EmWorld.progress(0~1). */
(() => {
  const THREE = window.exports;
  if (!THREE || !THREE.WebGLRenderer) return;

  // ── Reading color from the skin: let the browser resolve color-mix·oklch and take it as sRGB through a 1px canvas ──
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.documentElement.appendChild(probe);
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  function cssColor(name) {
    probe.style.color = `var(${name})`;
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = getComputedStyle(probe).color;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace);
  }

  // ── Value noise (for terrain and placement) ──
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const vnoise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // Lake: center (0, -16), 34 × 17 radius ellipse
  const LAKE = { x: 0, z: -16, rx: 34, rz: 17 };
  const lakeD = (x, z) => Math.hypot((x - LAKE.x) / LAKE.rx, (z - LAKE.z) / LAKE.rz);
  function height(x, z) {
    const d = lakeD(x, z);
    const hills = vnoise(x * 0.035, z * 0.035) * 3.2 + vnoise(x * 0.11, z * 0.11) * 0.6;
    const shore = THREE.MathUtils.smoothstep(d, 0.86, 1.25);
    return -1.4 + shore * (1.55 + hills);
  }

  const W = { ready: false, el: null };
  window.EmWorld = W;

  W.init = function (host, opts = {}) {
    if (W.ready) return W;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = innerWidth <= 1024;
    let quality = opts.quality || (small ? "medium" : "high");
    const canvas = document.createElement("canvas");
    host.prepend(canvas);
    W.el = host;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const dpr = () => Math.min(devicePixelRatio, quality === "high" ? 1.5 : quality === "medium" ? 1.2 : 0.9);
    renderer.setPixelRatio(dpr());
    renderer.setSize(innerWidth, innerHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(small ? 62 : 45, innerWidth / innerHeight, 0.1, 600);
    camera.position.set(0, 2.4, 24);
    const look = new THREE.Vector3(0, 6.5, -20);

    const C = {};
    const readColors = () => {
      for (const k of ["sky-top", "sky-low", "cloud", "grass-root", "grass-tip", "grass-far", "rock", "water", "glow", "leaf", "room", "wood", "fluid"]) C[k] = cssColor(`--site-${k}`);
      C.accent = cssColor("--kf-accent");
      C.surface = cssColor("--kf-surface");
      C.ink = cssColor("--kf-ink");
      C.bg = cssColor("--kf-bg");
    };
    readColors();
    // The original world fog is FogExp2 (density .0015) — only a little over 2% sets in at distance 100. This plane’s world is 1.184x wider, so the density is reduced by that much.
    const FOG = 0.0015 / 1.184;

    // ── Sky: a big sphere painted on the inside. Pale at the horizon → deep above, with pink clouds slowly drifting along the top ──
    const NOISE = `
      float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y); }
      float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n2(p); p *= 2.03; a *= 0.5; } return v; }`;
    const skyU = { uTop: { value: C["sky-top"] }, uLow: { value: C["sky-low"] }, uCloud: { value: C.cloud }, uTime: { value: 0 } };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(300, 48, 24),
      new THREE.ShaderMaterial({
        uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 uTop, uLow, uCloud; uniform float uTime; varying vec3 vDir; ${NOISE}
          void main(){
            float y = clamp(vDir.y, -0.2, 1.0);
            vec3 col = mix(uLow, uTop, smoothstep(-0.02, 0.55, y));
            vec2 p = vDir.xz / max(vDir.y + 0.18, 0.08) * 1.6 + vec2(uTime * 0.012, uTime * 0.004);
            float c = smoothstep(0.52, 0.86, fbm(p)) * smoothstep(0.02, 0.22, y);
            col = mix(col, uCloud, c * 0.75);
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    );
    sky.renderOrder = -10;
    scene.add(sky);

    // ── Light: sky hemisphere + slanted sun ──
    const hemi = new THREE.HemisphereLight(C["sky-top"], C["grass-root"], 2.1);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(C.surface, 1.6);
    sun.position.set(-30, 40, 20);
    scene.add(sun);
    scene.fog = new THREE.FogExp2(C["sky-low"], FOG);

    // ── Terrain ──
    const tg = new THREE.PlaneGeometry(260, 220, 160, 140);
    tg.rotateX(-Math.PI / 2);
    tg.translate(0, 0, -30);
    const tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) tp.setY(i, height(tp.getX(i), tp.getZ(i)));
    tg.computeVertexNormals();
    const terrainMat = new THREE.MeshLambertMaterial({ color: C["grass-root"] });
    // Far ground uses the same carpet color as far grass — if dark ground shows through the leaves, the carpet becomes striped again
    const farU = { value: C["grass-far"] };
    terrainMat.onBeforeCompile = (sh) => {
      sh.uniforms.uFar = farU;
      sh.fragmentShader = "uniform vec3 uFar;\n" + sh.fragmentShader.replace("#include <opaque_fragment>", "#include <opaque_fragment>\n\tgl_FragColor.rgb = mix(gl_FragColor.rgb, uFar, smoothstep(30.0, 45.0, vViewPosition.z));");
    };
    const terrain = new THREE.Mesh(tg, terrainMat);
    scene.add(terrain);

    // ── Rocky ridge: tall polyhedra in a distant ring around the lake ──
    const rockGeo = new THREE.IcosahedronGeometry(1, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: C.rock, flatShading: true });
    const ROCKS = small ? 70 : 110;
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, ROCKS);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
    for (let i = 0; i < ROCKS; i++) {
      const a = (i / ROCKS) * Math.PI * 2 + rnd() * 0.05;
      const r = 54 + rnd() * 16 + (i % 3) * 3;
      const x = LAKE.x + Math.cos(a) * r * 1.15, z = LAKE.z + Math.sin(a) * r * 0.9;
      if (opts.room && Math.hypot(x, z - 58) < 24) { rocks.setMatrixAt(i, m4.makeScale(0, 0, 0)); continue; }
      // The original hero ridge is low and blunt (peak at 49~58% of screen height) — height matched to that
      const tall = 1.8 + rnd() * 3 + (rnd() < 0.15 ? 3 : 0);
      e3.set((rnd() - 0.5) * 0.25, rnd() * Math.PI, (rnd() - 0.5) * 0.25);
      q.setFromEuler(e3);
      s3.set(2.4 + rnd() * 2.6, tall, 2.4 + rnd() * 2.6);
      v3.set(x, height(x, z) + tall * 0.55, z);
      rocks.setMatrixAt(i, m4.compose(v3, q, s3));
    }
    // A few nearby rocks (right of and behind the lake) — placed outside the first-page orbit (center (0, -18.7), radius 26~43) so the camera doesn’t pass through them
    scene.add(rocks);
    const nearRocks = new THREE.InstancedMesh(rockGeo, rockMat, 12);
    for (let i = 0; i < 12; i++) {
      const a = -0.55 - rnd() * 0.5, d = 48 + rnd() * 7, x = Math.cos(a) * d, z = -18.7 + Math.sin(a) * d;
      const tall = 2 + rnd() * 4;
      e3.set((rnd() - 0.5) * 0.2, rnd() * Math.PI, (rnd() - 0.5) * 0.2);
      q.setFromEuler(e3);
      s3.set(1.2 + rnd() * 1.8, tall, 1.2 + rnd() * 1.8);
      v3.set(x, Math.max(height(x, z), -0.6) + tall * 0.45, z);
      nearRocks.setMatrixAt(i, m4.compose(v3, q, s3));
    }
    scene.add(nearRocks);

    // ── Black cylinder building: two big cylinders overlapping off-center ──
    const tower = new THREE.Group();
    const towerMat = new THREE.MeshLambertMaterial({ color: C.ink });
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 9, 48, 1, false), towerMat);
    t1.position.y = 4.5;
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 12, 48, 1, false), towerMat);
    t2.position.set(-3.6, 6, 2.2);
    const t3 = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 7.4, 0.5, 48), towerMat);
    t3.position.y = 9.1;
    tower.add(t1, t2, t3);
    // The original building sits far away, (100, 70) from the orbit center — seen far behind when the first page camera makes a turn
    tower.position.set(118, height(118, 64), 64);
    scene.add(tower);

    // ── Flowering tree: cylinder trunk + pink particle canopy ──
    const trees = new THREE.Group();
    function tree(x, z, s) {
      const g = new THREE.Group();
      const trunkMat = new THREE.MeshLambertMaterial({ color: C.ink });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.32 * s, 4 * s, 7), trunkMat);
      trunk.position.y = 2 * s;
      g.add(trunk);
      for (let b = 0; b < 4; b++) {
        const br = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.14 * s, 2.4 * s, 5), trunkMat);
        br.position.set(Math.cos(b * 1.7) * 0.6 * s, 4.2 * s, Math.sin(b * 1.7) * 0.6 * s);
        br.rotation.set(Math.sin(b * 2.1) * 0.7, 0, Math.cos(b * 1.7) * 0.7);
        g.add(br);
      }
      const N = 1400, pos = new Float32Array(N * 3), sz = new Float32Array(N), tint = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = Math.cbrt(rnd()) * 2.6 * s;
        pos[i * 3] = Math.sin(v) * Math.cos(u) * r * 1.25;
        pos[i * 3 + 1] = 5.4 * s + Math.cos(v) * r * 0.7;
        pos[i * 3 + 2] = Math.sin(v) * Math.sin(u) * r * 1.25;
        sz[i] = 0.5 + rnd() * 0.8;
        tint[i] = rnd();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
      geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 1));
      g.add(new THREE.Points(geo, dotMat(0.22)));
      g.position.set(x, height(x, z) - 0.1, z);
      trees.add(g);
    }

    // ── Round-dot (particle cloud·flower) shader: each dot is like a small bead, bright at upper left ──
    const dotUniforms = [];
    // glow: each point gets aGlow (0~1), so points stirred by the cursor brighten and grow up to 1.35x (particle cloud only)
    function dotMat(base, glow) {
      const u = { uA: { value: C.accent }, uB: { value: C.glow }, uS: { value: C.surface }, uBase: { value: base }, uPx: { value: renderer.getPixelRatio() * innerHeight }, uFogC: { value: C["sky-low"] }, uFog: { value: FOG }, uAlpha: { value: 1 }, uTime: { value: 0 } };
      dotUniforms.push(u);
      return new THREE.ShaderMaterial({
        uniforms: u, transparent: true, depthWrite: true, defines: glow ? { GLOW: "" } : {},
        vertexShader: `attribute float aSize; attribute float aTint; uniform float uBase, uPx, uTime; varying float vT; varying float vD; varying float vG; varying float vTw;
          #ifdef GLOW
          attribute float aGlow;
          #endif
          void main(){ vT = aTint; vG = 0.0; vTw = 1.0;
            #ifdef GLOW
            vG = aGlow;
            // In the original, each particle flickers ±5% in brightness with its own phase (4.2s period)
            vTw = 1.0 + 0.05 * sin(uTime * 1.5 + fract(sin(float(gl_VertexID) * 12.9898) * 43758.5453) * 6.28318);
            #endif
            vec4 mv = modelViewMatrix * vec4(position, 1.0); vD = -mv.z;
            gl_PointSize = uBase * aSize * uPx / max(-mv.z, 0.1) * 0.5 * (1.0 + vG * 0.35); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 uA, uB, uS, uFogC; uniform float uFog; uniform float uAlpha; varying float vT; varying float vD; varying float vG; varying float vTw;
          void main(){ vec2 p = gl_PointCoord * 2.0 - 1.0; float r = dot(p, p); if (r > 1.0) discard;
            vec3 base = mix(uA, uB, smoothstep(0.35, 1.0, vT));
            float nz = sqrt(1.0 - r); float l = 0.55 + 0.45 * dot(normalize(vec3(p.x, -p.y, nz)), normalize(vec3(-0.5, 0.6, 0.7)));
            vec3 col = base * l + uS * pow(max(0.0, l - 0.7), 3.0) * 2.0;
            col = mix(col, max(uB, uS * 0.85), vG * 0.85) * vTw;
            col = mix(col, uFogC, 1.0 - exp(-uFog * uFog * vD * vD));
            gl_FragColor = vec4(col, uAlpha);
            #include <colorspace_fragment>
          }`,
      });
    }
    // The Contact page is a chair scene under a flowering tree, so it goes in that spot, other pages go outside the first page orbit (center (0, -18.7), radius 26~43) —
    // Placed inside the orbit it blocks the view between camera and clouds (the original has no trees around the clouds either)
    if (opts.chairs) { tree(-15, -36, 1); tree(15, -30, 0.9); }
    else { tree(-42, -55, 1); tree(40, -50, 0.9); }
    scene.add(trees);

    // ── Grass: thin blade instances, brighter toward the tip and bent by wind ──
    const bladeGeo = new THREE.BufferGeometry();
    bladeGeo.setAttribute("position", new THREE.Float32BufferAttribute([-0.05, 0, 0, 0.05, 0, 0, -0.035, 0.45, 0, 0.035, 0.45, 0, 0, 1, 0], 3));
    bladeGeo.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4]);
    const GRASS = quality === "high" ? 60000 : quality === "medium" ? 32000 : 16000;
    const grassU = { uRoot: { value: C["grass-root"] }, uTip: { value: C["grass-tip"] }, uFar: farU, uTime: { value: 0 }, uFogC: { value: C["sky-low"] }, uFog: { value: FOG } };
    const grassMat = new THREE.ShaderMaterial({
      uniforms: grassU, side: THREE.DoubleSide,
      vertexShader: `uniform float uTime; varying float vH; varying float vD;
        void main(){ vH = position.y; vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
          float sway = sin(uTime * 1.6 + w.x * 0.35 + w.z * 0.22) * 0.5 + sin(uTime * 2.7 + w.x * 0.9) * 0.18;
          w.x += sway * position.y * position.y * 0.35; w.z += sway * position.y * 0.12;
          vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uRoot, uTip, uFar, uFogC; uniform float uFog; varying float vH; varying float vD;
        void main(){ vec3 col = mix(uRoot, uTip, smoothstep(0.0, 1.0, vH));
          // Grass beyond the clouds (outside 30~45) is a single-color carpet with no leaf stripes — like the original’s distant meadow
          col = mix(col, uFar, smoothstep(30.0, 45.0, vD));
          col = mix(col, uFogC, 1.0 - exp(-uFog * uFog * vD * vD)); gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const grass = new THREE.InstancedMesh(bladeGeo, grassMat, GRASS);
    let gi = 0, guard = 0;
    while (gi < GRASS && guard++ < GRASS * 6) {
      // Planted densely in front, where the camera passes
      const x = (rnd() - 0.5) * 150, z = 34 - Math.pow(rnd(), 1.4) * 100;
      const y = height(x, z);
      if (y < 0.05) continue;
      e3.set((rnd() - 0.5) * 0.4, rnd() * Math.PI, (rnd() - 0.5) * 0.4);
      q.setFromEuler(e3);
      if (Math.hypot(x, z - 24) < 5 || Math.hypot(x, z - 12) < 3.5) continue;
      if (opts.chairs && Math.hypot(x + 15, z + 31) < 6) continue;
      const low = z > 4 && Math.abs(x) < 16;
      const h = low ? 0.35 + rnd() * 0.45 : 0.7 + rnd() * 1.1 + (z > 10 ? 0.5 : 0);
      s3.set(1 + rnd(), h, 1);
      v3.set(x, y - 0.05, z);
      grass.setMatrixAt(gi++, m4.compose(v3, q, s3));
    }
    grass.count = gi;
    grass.frustumCulled = false;
    scene.add(grass);

    // ── Particle cloud: the same dots move between shapes (our shapes) — About is a distant logo, Contact is a heart, the first page uses the original’s five shapes ──
    const N = quality === "low" ? 3000 : 6500;
    const SHAPES = {};
    const fill = (fn) => { const a = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const p = fn(i); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; } return a; };
    const ball = () => { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1); return [Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)]; };
    // Upside-down e (logo spot): 300° thick arc + horizontal bar in the middle
    SHAPES.mark = fill((i) => {
      const b = ball(), t = Math.cbrt(rnd()) * 0.62;
      if (i % 5 === 0) return [(rnd() - 0.5) * 4.6, -0.2 + b[1] * t * 0.7, b[2] * t];
      const a = Math.PI * 0.62 + rnd() * Math.PI * 1.66;
      const r = 2.5;
      return [Math.cos(a) * r + b[0] * t, Math.sin(a) * r * 1.12 + b[1] * t, b[2] * t];
    });
    SHAPES.heart = fill(() => {
      for (let k = 0; k < 60; k++) {
        const x = rnd() * 2.6 - 1.3, y = rnd() * 2.6 - 1.3, z = rnd() * 1.6 - 0.8;
        const a = x * x + 2.25 * z * z + y * y - 1;
        if (a * a * a - x * x * y * y * y - 0.1125 * z * z * y * y * y < 0) return [x * 2.6, y * 2.6, z * 2.6];
      }
      return [0, 0, 0];
    });
    // Five orbit shapes on the first page — size range of the original shapes (original units ÷ 2 = per board unit: logo height 11, thickness 1.6 (faces only), cube edge 6 (faces only),
    // Sphere radius 6 (filled), heart is an outline band (horizontal ±3.9 · vertical -4.2~2.9 · thickness ±2.45), ring radius 4.5 · thickness 1.5 (filled, standing to face the screen)
    SHAPES["o-logo"] = fill((i) => {
      const b = ball(), t = 0.62;
      const p = i % 5 === 0 ? [(rnd() - 0.5) * 4.6, -0.2 + b[1] * t * 0.7, b[2] * t] : (() => { const a = Math.PI * 0.62 + rnd() * Math.PI * 1.66; return [Math.cos(a) * 2.5 + b[0] * t, Math.sin(a) * 2.8 + b[1] * t, b[2] * t]; })();
      // Fitted to the original logo ratio (width 0.68 · thickness 0.1 × height), and sized to the original first-screen recording (logo is 41% of screen height) — a height of 11 measured by the model bounding box gives 27%, so 1.5×
      return [p[0] * 0.9, p[1] * 1.2, p[2] * 0.99];
    });
    SHAPES["o-cube"] = fill(() => { const p = [rnd() * 3 - 1.5, rnd() * 3 - 1.5, rnd() * 3 - 1.5], k = Math.floor(rnd() * 3); p[k] = (rnd() < 0.5 ? -1.5 : 1.5) + (rnd() - 0.5) * 0.075; return p; });
    SHAPES["o-sphere"] = fill(() => { const b = ball(), r = 3 * Math.cbrt(rnd()); return [b[0] * r, b[1] * r, b[2] * r]; });
    SHAPES["o-heart"] = fill(() => {
      const a = rnd() * Math.PI * 2, j = Math.cbrt(rnd()) * 0.3, s = 0.1225;
      return [16 * Math.sin(a) ** 3 * s + (rnd() - 0.5) * j * 1.5, (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * s + (rnd() - 0.5) * j * 1.5, (rnd() - 0.5) * 2.45 + (rnd() - 0.5) * j];
    });
    SHAPES["o-torus"] = fill(() => { const a = rnd() * Math.PI * 2, b = rnd() * Math.PI * 2, r = 0.75 * Math.cbrt(rnd()); return [(2.25 + r * Math.cos(b)) * Math.cos(a), (2.25 + r * Math.cos(b)) * Math.sin(a), r * Math.sin(b)]; });
    const cloudGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(new Float32Array(SHAPES.mark), 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    cloudGeo.setAttribute("position", posAttr);
    const csz = new Float32Array(N), ctint = new Float32Array(N), cph = new Float32Array(N);
    for (let i = 0; i < N; i++) { csz[i] = 0.6 + rnd() * 1.0; ctint[i] = Math.sqrt(rnd()); cph[i] = rnd() * Math.PI * 2; }
    cloudGeo.setAttribute("aSize", new THREE.BufferAttribute(csz, 1));
    cloudGeo.setAttribute("aTint", new THREE.BufferAttribute(ctint, 1));
    const glowAttr = new THREE.BufferAttribute(new Float32Array(N), 1);
    glowAttr.setUsage(THREE.DynamicDrawUsage);
    cloudGeo.setAttribute("aGlow", glowAttr);
    const cloud = new THREE.Points(cloudGeo, dotMat(0.36, true));
    cloud.frustumCulled = false;
    cloud.position.set(0, 9, -27);
    scene.add(cloud);

    // ── Falling leaves · fireflies ──
    const LEAVES = 140;
    const leafGeo = new THREE.PlaneGeometry(0.16, 0.24);
    const leafMat = new THREE.MeshBasicMaterial({ color: C.leaf, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, LEAVES);
    leaves.frustumCulled = false;
    const leafS = Array.from({ length: LEAVES }, () => ({ x: (rnd() - 0.5) * 60, y: rnd() * 22, z: (rnd() - 0.5) * 50, sp: 0.35 + rnd() * 0.5, ph: rnd() * 6.28, rs: 0.5 + rnd() * 1.5 }));
    scene.add(leaves);
    const FLIES = 40, flyPos = new Float32Array(FLIES * 3), flySz = new Float32Array(FLIES), flyT = new Float32Array(FLIES);
    for (let i = 0; i < FLIES; i++) { flyPos[i * 3] = (rnd() - 0.5) * 70; flyPos[i * 3 + 1] = 2 + rnd() * 16; flyPos[i * 3 + 2] = -10 - rnd() * 40; flySz[i] = 0.5 + rnd(); flyT[i] = 1; }
    const flyGeo = new THREE.BufferGeometry();
    flyGeo.setAttribute("position", new THREE.BufferAttribute(flyPos, 3));
    flyGeo.setAttribute("aSize", new THREE.BufferAttribute(flySz, 1));
    flyGeo.setAttribute("aTint", new THREE.BufferAttribute(flyT, 1));
    const flies = new THREE.Points(flyGeo, dotMat(0.3));
    flies.material.blending = THREE.AdditiveBlending;
    flies.material.depthWrite = false;
    scene.add(flies);

    // ── about: a round room on the hill south of the lake. A panorama window cut in the north wall shows the outside world ──
    let room = null;
    if (opts.room) {
      room = new THREE.Group();
      // Rebuilds the original room model (office) at the measured position and size — original room coordinate 1 = This panel 0.91 (base radius 15.4 → 14), room center (-0.53, -3.04)
      const RX = 0, RZ = 58, RY = height(RX, RZ) + 0.3, K = 0.91, R = 14, H = 6.36 * K;
      W.roomK = K;
      W.roomC = [-0.53, -3.04];
      room.position.set(RX, RY, RZ);
      W.roomAt = [RX, RY, RZ];
      const wallMat = new THREE.MeshLambertMaterial({ color: C.room, side: THREE.BackSide });
      const floorMat = new THREE.MeshLambertMaterial({ color: C.room });
      const woodMat = new THREE.MeshLambertMaterial({ color: C.wood });
      const inkMat = new THREE.MeshLambertMaterial({ color: C.ink });
      const paleMat = new THREE.MeshLambertMaterial({ color: C.rock });
      // Window: leave 110° to the north (-z) open. Wall = Remaining surround + lintel above the window + sill below the window
      // (cylinder angle θ is x = sin θ·z = as cos θ, -z is θ = π — original end length, facing direction)
      const winL = (Math.PI * 110) / 180, winA = Math.PI - winL / 2;
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 64, 1, true, winA + winL, Math.PI * 2 - winL), wallMat);
      wall.position.y = H / 2;
      const lintel = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 2.2, 32, 1, true, winA, winL), wallMat);
      lintel.position.y = H - 1.1;
      const sill = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.1, 32, 1, true, winA, winL), wallMat);
      sill.position.y = 0.55;
      const floor = new THREE.Mesh(new THREE.CircleGeometry(R, 64), floorMat);
      floor.rotation.x = -Math.PI / 2;
      // Ceiling: a round panel with a skylight cut above the wood (original skylight ring diameter 13.3, center (-8.1, -1.1))
      const P = (x, z) => [(x - W.roomC[0]) * K, (z - W.roomC[1]) * K];
      const [ax, az] = P(-8.11, -1.09);
      const ceilShape = new THREE.Shape().absarc(0, 0, R, 0, Math.PI * 2);
      ceilShape.holes.push(new THREE.Path().absarc(ax, -az, 6.64 * K, 0, Math.PI * 2, true));
      const ceil = new THREE.Mesh(new THREE.ShapeGeometry(ceilShape, 64), wallMat);
      ceil.rotation.x = -Math.PI / 2; ceil.position.y = H;
      room.add(wall, lintel, sill, floor, ceil);
      // Placed in original coordinates (room model units): center x · y above floor · center z, size w · h · d
      const put = (mesh, x, y, z, ry = 0) => { const [px, pz] = P(x, z); mesh.position.set(px, y * K, pz); mesh.rotation.y = ry; room.add(mesh); return mesh; };
      const box = (w, h, d, m, x, y, z, ry = 0) => put(new THREE.Mesh(new THREE.BoxGeometry(w * K, h * K, d * K), m), x, y, z, ry);
      const cyl = (r, h, m, x, y, z, seg = 32) => put(new THREE.Mesh(new THREE.CylinderGeometry(r * K, r * K, h * K, seg), m), x, y, z);
      const ballAt = (sx, sy, sz, m, x, y, z, detail = 1) => { const b = put(new THREE.Mesh(new THREE.IcosahedronGeometry(1, detail), m), x, y, z); b.scale.set(sx * K / 2, sy * K / 2, sz * K / 2); return b; };
      // Mat 18.8×29.3
      box(18.8, 0.03, 29.3, woodMat, -1.03, 0.015, -1.86);
      // Table 4.5×0.84×5.6 and surrounding chairs (within the chair area 6.7×7.7), two laptops
      box(4.47, 0.12, 5.6, woodMat, 5.85, 0.78, 3.45);
      for (const [dx, dz] of [[-1.8, -2.3], [1.8, -2.3], [-1.8, 2.3], [1.8, 2.3]]) box(0.22, 0.72, 0.22, woodMat, 5.85 + dx, 0.36, 3.45 + dz);
      for (const side of [-1, 1]) for (const dz of [-1.9, -0.65, 0.65, 1.9]) {
        box(0.95, 0.12, 0.95, inkMat, 5.85 + side * 2.85, 0.48, 3.45 + dz);
        box(0.12, 0.9, 0.95, inkMat, 5.85 + side * 3.3, 0.95, 3.45 + dz);
      }
      for (const end of [-1, 1]) { box(0.95, 0.12, 0.95, inkMat, 5.85, 0.48, 3.45 + end * 3.35); box(0.95, 0.9, 0.12, inkMat, 5.85, 0.95, 3.45 + end * 3.8); }
      for (const [x, z, ry] of [[6.93, 1.53, 0.35], [7.25, 2.8, -0.35]]) {
        box(0.78, 0.03, 0.66, paleMat, x, 0.86, z, ry);
        box(0.03, 0.45, 0.66, paleMat, x + 0.32, 1.08, z, ry).rotation.z = 0.25;
      }
      for (const [x, y, z, s] of [[5.86, 0.99, 3.93, 0.4], [6.22, 0.98, 3.38, 0.2], [5.83, 1.16, 3.54, 0.2]]) ballAt(s * 2, s * 1.2, s * 2, paleMat, x, y, z);
      // Big built-in shelf 7.25×6.44×15 (+x wall) with six vases on top
      box(0.3, 6.44, 15, woodMat, 15.4, 3.22, 2.44);
      for (const y of [0.05, 1.6, 3.2, 4.8, 6.3]) box(2.2, 0.14, 15, woodMat, 14.3, y, 2.44);
      for (const z of [-4.9, -1.2, 2.44, 6.1, 9.8]) box(2.2, 6.44, 0.14, woodMat, 14.3, 3.22, z);
      for (const [x, y, z, w, h] of [[13.79, 1.2, -0.62, 0.53, 0.36], [11.66, 2.42, 4.24, 0.82, 1.17], [12.31, 1.21, 2.63, 0.23, 0.4], [12.81, 2.09, 1.33, 0.18, 0.52], [13.2, 2.77, 0.82, 0.38, 0.25], [11.86, 1.27, 3.34, 0.66, 0.51]])
        put(new THREE.Mesh(new THREE.CylinderGeometry(w * K * 0.35, w * K * 0.5, h * K, 16), paleMat), x, y, z);
      // Picture 3.7×3.95 (+z wall) and the big e form 2.4×3.55 in front of it
      box(3.7, 3.95, 0.12, paleMat, 4.61, 3.12, 11.8);
      const eMark = new THREE.Group();
      const eArc = new THREE.Mesh(new THREE.TorusGeometry(0.95 * K, 0.22 * K, 12, 40, Math.PI * 1.66), inkMat);
      eArc.rotation.z = Math.PI * 0.62;
      const eBar = new THREE.Mesh(new THREE.BoxGeometry(1.9 * K, 0.4 * K, 0.4 * K), inkMat);
      eMark.add(eArc, eBar);
      eMark.scale.set(1.25, 1.6, 1);
      put(eMark, 4.51, 3.12, 10.84, Math.PI);
      // Big sofa 10×1.4×6.8, two partition walls (11×4.9, 8.3×3.4), side decor
      box(10, 0.55, 2.6, inkMat, -2.62, 0.28, 9.6);
      box(10, 1.42, 0.7, inkMat, -2.62, 0.71, 10.9);
      box(2.6, 0.55, 4.2, inkMat, -6.3, 0.28, 7.3);
      box(11.03, 4.87, 0.4, paleMat, -4.69, 2.44, 12.0);
      box(8.27, 3.36, 0.4, paleMat, -5.03, 1.68, 11.2, 0.12);
      for (const [x, y, z, w, h] of [[-12.64, 1.38, -4.06, 0.47, 2.73], [-7.66, 1.03, 8.77, 0.33, 2.0], [-1.75, 0.51, 10.76, 0.92, 0.94]]) cyl(w / 2, h, paleMat, x, y, z, 16);
      for (const [x, y, z, s] of [[-12.19, 1.91, 2.79, 0.33], [-12.05, 1.46, 2.64, 0.51], [-7.39, 1.84, 8.77, 0.32], [-1.61, 0.69, 10.71, 0.26]]) ballAt(s, s, s, paleMat, x, y, z);
      // Rock 7.7×3.7×7.5
      ballAt(7.7, 3.7, 7.53, paleMat, -11.61, 1.8, -8.47);
      // Round tea table 5.8 in diameter with a small plant pot, a window armchair, a round stool
      cyl(2.9, 0.12, paleMat, -0.34, 0.62, -10.91, 48);
      cyl(0.6, 0.62, paleMat, -0.34, 0.31, -10.91);
      cyl(0.14, 0.29, inkMat, -1.69, 0.84, -11.13, 12);
      ballAt(0.63, 0.47, 0.62, woodMat, -1.7, 1.23, -11.13);
      box(1.83, 0.5, 1.27, inkMat, 2.26, 0.25, -14.22);
      box(1.83, 0.92, 0.3, inkMat, 2.26, 0.46, -14.75);
      cyl(0.5, 0.9, inkMat, -11.69, 0.45, 1.53, 24);
      // Curved stand (height 3.9) and its light
      cyl(0.04, 3.86, paleMat, -11.11, 1.93, 5.79, 8);
      const bulb = ballAt(0.74, 0.97, 0.81, new THREE.MeshBasicMaterial({ color: C.surface }), -11.07, 3.6, 5.79);
      const pl = new THREE.PointLight(C.surface, 6, 9, 1.6); pl.position.copy(bulb.position); room.add(pl);
      // Skylight ring (diameter 13.3, thickness 0.85) and the indoor tree below it (trunk 7.7, leaves 12×7.4)
      const collar = new THREE.Mesh(new THREE.TorusGeometry(6.22 * K, 0.42 * K, 10, 64), paleMat);
      collar.rotation.x = Math.PI / 2;
      put(collar, -8.11, 6.22, -1.09);
      const roomLight = new THREE.PointLight(C.accent, 18, 26, 1.2); roomLight.position.set(0, H - 0.5, 0); room.add(roomLight);
      scene.add(room);
      const [tx, tz] = P(-8.9, -1.25);
      tree(RX + tx, RZ + tz, 1.15);
      trees.children[trees.children.length - 1].position.y = RY;
      hemi.intensity = 0.7;
    }

    // ── contact: two armchairs under a flowering tree ──
    if (opts.chairs) {
      const woodMat = new THREE.MeshLambertMaterial({ color: C.wood });
      const cushion = new THREE.MeshLambertMaterial({ color: C.surface });
      const chair = (x, z, ry) => {
        const g = new THREE.Group();
        const b = (w, h, d, m, px, py, pz, rx = 0) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(px, py, pz); k.rotation.x = rx; g.add(k); };
        b(1.3, 0.22, 1.2, cushion, 0, 0.55, 0);
        b(1.3, 1.0, 0.22, cushion, 0, 1.05, -0.55, -0.25);
        for (const sx of [-0.7, 0.7]) { b(0.1, 0.1, 1.4, woodMat, sx, 0.85, 0); b(0.1, 0.85, 0.1, woodMat, sx, 0.42, 0.55); b(0.1, 0.85, 0.1, woodMat, sx, 0.42, -0.55); }
        g.position.set(x, height(x, z), z); g.rotation.y = ry;
        scene.add(g);
      };
      chair(-16.8, -32.5, 0.5);
      chair(-13.2, -32.2, -0.45);
    }

    // ── One duck (a small black dot on the lake) ──
    const duck = new THREE.Group();
    const duckMat = new THREE.MeshLambertMaterial({ color: C.ink });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), duckMat);
    body.scale.set(1.4, 0.7, 0.9);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), duckMat);
    head.position.set(0.32, 0.3, 0);
    duck.add(body, head);
    duck.position.set(9, 0.08, -24);
    scene.add(duck);

    // ── Lake: shoot the world once more with an upside-down camera and reflect it on the water ──
    const rtScale = quality === "high" ? 0.5 : 0.35;
    const reflRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
    const texM = new THREE.Matrix4();
    const waterU = { tRefl: { value: reflRT.texture }, uTexM: { value: texM }, uTint: { value: C.water }, uTime: { value: 0 }, uFogC: { value: C["sky-low"] }, uFog: { value: FOG } };
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(LAKE.rx * 2.6, LAKE.rz * 2.8, 1, 1),
      new THREE.ShaderMaterial({
        uniforms: waterU,
        vertexShader: `uniform mat4 uTexM; varying vec4 vUv; varying vec3 vW; varying float vD;
          void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vUv = uTexM * w; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform sampler2D tRefl; uniform vec3 uTint, uFogC; uniform float uFog; uniform float uTime; varying vec4 vUv; varying vec3 vW; varying float vD; ${NOISE}
          void main(){
            vec2 rip = vec2(n2(vW.xz * 0.6 + uTime * 0.25), n2(vW.zx * 0.6 - uTime * 0.2)) - 0.5;
            vec4 uv = vUv; uv.xy += rip * 0.35 * uv.w * 0.06;
            vec3 refl = texture2DProj(tRefl, uv).rgb;
            vec3 col = mix(refl, uTint, 0.32);
            col = mix(col, uFogC, 1.0 - exp(-uFog * uFog * vD * vD));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(LAKE.x, 0, LAKE.z);
    scene.add(water);
    const vCam = new THREE.PerspectiveCamera();
    const bias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);

    // ── Post-processing: render the scene to a plane and output with chromatic aberration and vignette ──
    const mainRT = new THREE.WebGLRenderTarget(1, 1, { samples: quality === "low" ? 0 : 4, type: THREE.HalfFloatType });
    const postU = { tScene: { value: mainRT.texture }, uSplit: { value: 0 }, uVeil: { value: 0 }, uVeilC: { value: C.bg }, uRes: { value: new THREE.Vector2(1, 1) }, tFluid: { value: null }, uFluidOn: { value: 0 }, uFluidC: { value: C.fluid } };
    const post = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: postU, depthTest: false, depthWrite: false,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: `uniform sampler2D tScene, tFluid; uniform float uSplit, uVeil, uFluidOn; uniform vec3 uVeilC, uFluidC; uniform vec2 uRes; varying vec2 vUv;
          // Where the wave is dense, a faint glyph pattern shows through in 8px cells, one glyph per brightness level across six levels (blank, dot, colon, plus, hash, ring) — original levels, shapes and soft edges.
          float spot(vec2 c, vec2 p){ return smoothstep(0.15, 0.05, length(c - p)); }
          float mark(float b, vec2 c){ float l = floor(b * 6.0); vec2 q = abs(c - 0.5);
            if (l < 1.0) return 0.0;
            if (l < 2.0) return spot(c, vec2(0.5, 0.25));
            if (l < 3.0) return max(spot(c, vec2(0.5, 0.3)), spot(c, vec2(0.5, 0.7)));
            if (l < 4.0) return max(smoothstep(0.18, 0.08, q.y) * smoothstep(0.45, 0.15, q.x), smoothstep(0.18, 0.08, q.x) * smoothstep(0.45, 0.15, q.y));
            if (l < 5.0) { vec2 a = smoothstep(0.12, 0.04, abs(c - 0.35)), z = smoothstep(0.12, 0.04, abs(c - 0.65)); return max(max(a.x, a.y), max(z.x, z.y)); }
            return smoothstep(0.48, 0.38, length(c - 0.5)) * smoothstep(0.18, 0.28, length(c - 0.55)); }
          void main(){
            vec3 f = uFluidOn > 0.5 ? texture2D(tFluid, vUv).rgb : vec3(0.0);
            float fl = length(f);
            vec2 uv = vUv - f.rg * 0.0002;
            vec2 d = (uv - 0.5) * uSplit + normalize(f.rg + 0.001) * fl * 0.000032;
            vec3 col = vec3(texture2D(tScene, uv + d).r, texture2D(tScene, uv).g, texture2D(tScene, uv - d).b);
            col = mix(col, uFluidC * fl, 0.015 * min(fl, 1.0)) + uFluidC * fl * fl * 0.0002;
            if (fl > 0.01) {
              vec2 px = uv * uRes, cell = floor(px / 8.0);
              float b = dot(texture2D(tScene, (cell + 0.5) * 8.0 / uRes).rgb, vec3(0.299, 0.587, 0.114));
              col = mix(col, mix(col, vec3(1.0), mark(b, fract(px / 8.0)) * 0.3), clamp(fl * 0.004, 0.0, 0.5));
            }
            // Original world scene vignette (offset .5 · darkness .5, multiplied in linear color) — corner cells on the first screen are darkened to 0.54 of the center
            col *= smoothstep(0.8, 0.3995, distance(vUv, vec2(0.5)));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
            gl_FragColor.rgb = mix(gl_FragColor.rgb, uVeilC, uVeil);
          }`,
      }),
    );
    // The slab is already linear → converted to screen sRGB just once
    mainRT.texture.colorSpace = THREE.LinearSRGBColorSpace;
    const postScene = new THREE.Scene();
    postScene.add(post);
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ── Cursor ripple: the original runs a low-resolution fluid over the whole screen so the spot the cursor passed shimmers (separate from particle drag) ──
    // Each time the cursor moves more than 1.5px, that movement × force is poured in as a Gaussian of radius 0.004 (squared, relative to screen height), then vorticity 1.9, pressure 0.8 solved twice, and advection
    // Runs in 1/60 steps. Stops once 120 steps (2 seconds) pass after the last brush stroke.
    // Paint stays 0.96 per step. On the image it pushes the screen by the wave speed (×0.0002), splits color in that direction (×0.000032), and mixes in paint color × strength at 1.5%,
    // Adds paint color by strength² — values the original overrode when making the fluid effect (paint #352d3d · push .2 · mix 1.5). Painting with the effect defaults (accent purple · .4 · 5) gives
    // A pink band lingers for a long time where it passed.
    // Paint amount and added light are also exactly as the original (same amount as the velocity field, strength² × .0002) — before the sky was matched to the original brightness it was too bright, so it was filled in with 1.5x and .8x, and the tail stayed visible that much longer
    const FL = { sim: small ? 64 : 96, dye: small ? 128 : 256, force: 1.1, fade: 0.96, splats: [], idle: 999, acc: 0, last: null };
    const flRT = (n, lin) => new THREE.WebGLRenderTarget(n, n, { type: THREE.HalfFloatType, minFilter: lin ? THREE.LinearFilter : THREE.NearestFilter, magFilter: lin ? THREE.LinearFilter : THREE.NearestFilter, depthBuffer: false });
    const flPair = (n, lin) => { const p = { read: flRT(n, lin), write: flRT(n, lin) }; p.swap = () => { const t = p.read; p.read = p.write; p.write = t; }; return p; };
    const fVel = flPair(FL.sim, true), fDye = flPair(FL.dye, true), fPrs = flPair(FL.sim, false), fDiv = flRT(FL.sim, false), fCurl = flRT(FL.sim, false);
    const texel = new THREE.Vector2();
    const flMat = (frag, u) => new THREE.ShaderMaterial({
      uniforms: { uTx: { value: texel }, ...u }, depthTest: false, depthWrite: false,
      vertexShader: `uniform vec2 uTx; varying vec2 vUv, vL, vR, vT, vB;
        void main(){ vUv = uv; vL = uv - vec2(uTx.x, 0.0); vR = uv + vec2(uTx.x, 0.0); vT = uv + vec2(0.0, uTx.y); vB = uv - vec2(0.0, uTx.y); gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `precision highp float; uniform vec2 uTx; varying vec2 vUv, vL, vR, vT, vB; ${frag}`,
    });
    const F = {
      splat: flMat(`uniform sampler2D uT; uniform vec2 uP; uniform vec3 uC; uniform float uAsp;
        void main(){ vec2 p = vUv - uP; p.x *= uAsp; gl_FragColor = vec4(texture2D(uT, vUv).xyz + exp(-dot(p, p) / 0.004) * uC, 1.0); }`,
        { uT: { value: null }, uP: { value: new THREE.Vector2() }, uC: { value: new THREE.Vector3() }, uAsp: { value: 1 } }),
      curl: flMat(`uniform sampler2D uV;
        void main(){ gl_FragColor = vec4(texture2D(uV, vR).y - texture2D(uV, vL).y - texture2D(uV, vT).x + texture2D(uV, vB).x, 0.0, 0.0, 1.0); }`, { uV: { value: null } }),
      vort: flMat(`uniform sampler2D uV, uC;
        void main(){ float L = texture2D(uC, vL).x, R = texture2D(uC, vR).x, T = texture2D(uC, vT).x, B = texture2D(uC, vB).x;
          vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); f = f / (length(f) + 1.0) * 1.9 * texture2D(uC, vUv).x; f.y = -f.y;
          gl_FragColor = vec4(texture2D(uV, vUv).xy + f / 60.0, 0.0, 1.0); }`, { uV: { value: null }, uC: { value: null } }),
      div: flMat(`uniform sampler2D uV;
        void main(){ vec2 c = texture2D(uV, vUv).xy; float L = texture2D(uV, vL).x, R = texture2D(uV, vR).x, T = texture2D(uV, vT).y, B = texture2D(uV, vB).y;
          if (vL.x < 0.0) L = -c.x; if (vR.x > 1.0) R = -c.x; if (vT.y > 1.0) T = -c.y; if (vB.y < 0.0) B = -c.y;
          gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }`, { uV: { value: null } }),
      fade: flMat(`uniform sampler2D uT; void main(){ gl_FragColor = vec4(texture2D(uT, vUv).xyz * 0.8, 1.0); }`, { uT: { value: null } }),
      prs: flMat(`uniform sampler2D uP, uD;
        void main(){ float s = texture2D(uP, vL).x + texture2D(uP, vR).x + texture2D(uP, vT).x + texture2D(uP, vB).x;
          gl_FragColor = vec4((s - texture2D(uD, vUv).x) * 0.25, 0.0, 0.0, 1.0); }`, { uP: { value: null }, uD: { value: null } }),
      grad: flMat(`uniform sampler2D uP, uV;
        void main(){ vec2 g = vec2(texture2D(uP, vR).x - texture2D(uP, vL).x, texture2D(uP, vT).x - texture2D(uP, vB).x);
          gl_FragColor = vec4(texture2D(uV, vUv).xy - g, 0.0, 1.0); }`, { uP: { value: null }, uV: { value: null } }),
      adv: flMat(`uniform sampler2D uV, uS; uniform float uK;
        void main(){ gl_FragColor = vec4(uK * texture2D(uS, vUv - texture2D(uV, vUv).xy * uTx / 60.0).xyz, 1.0); }`, { uV: { value: null }, uS: { value: null }, uK: { value: 1 } }),
    };
    const flQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), F.splat);
    flQuad.frustumCulled = false;
    const flScene = new THREE.Scene();
    flScene.add(flQuad);
    // Compiling eight shaders at the first brush stroke freezes the screen for 0.5s — precompile when building the world
    for (const m of Object.values(F)) { flQuad.material = m; renderer.compile(flScene, postCam); }
    const flRun = (mat, to) => { flQuad.material = mat; renderer.setRenderTarget(to.write || to); renderer.render(flScene, postCam); if (to.swap) to.swap(); };
    addEventListener("pointermove", (e) => {
      const L = FL.last;
      FL.last = [e.clientX, e.clientY];
      if (!L) return;
      const dx = e.clientX - L[0], dy = e.clientY - L[1];
      if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) return;
      FL.splats.push([e.clientX / innerWidth, 1 - e.clientY / innerHeight, dx * FL.force, -dy * FL.force]);
    }, { passive: true });
    function fluidStep(dt) {
      FL.acc += dt;
      if (FL.acc < 1 / 60 - 0.001) return;
      FL.acc = Math.min(FL.acc - 1 / 60, 1 / 60);
      const S = FL.splats;
      if (S.length) FL.idle = 0;
      else if (++FL.idle > 120) return;
      const asp = innerWidth / innerHeight, u = (m) => m.uniforms;
      texel.set(1 / (FL.sim * asp), 1 / FL.sim);
      if (S.length > 8) S.splice(0, S.length - 8);
      u(F.splat).uAsp.value = asp;
      while (S.length) {
        const [x, y, vx, vy] = S.pop();
        u(F.splat).uP.value.set(x, y);
        u(F.splat).uC.value.set(vx, vy, 10);
        u(F.splat).uT.value = fVel.read.texture; flRun(F.splat, fVel);
        u(F.splat).uT.value = fDye.read.texture; flRun(F.splat, fDye);
      }
      u(F.curl).uV.value = fVel.read.texture; flRun(F.curl, fCurl);
      u(F.vort).uV.value = fVel.read.texture; u(F.vort).uC.value = fCurl.texture; flRun(F.vort, fVel);
      u(F.div).uV.value = fVel.read.texture; flRun(F.div, fDiv);
      u(F.fade).uT.value = fPrs.read.texture; flRun(F.fade, fPrs);
      u(F.prs).uD.value = fDiv.texture;
      for (let k = 0; k < 2; k++) { u(F.prs).uP.value = fPrs.read.texture; flRun(F.prs, fPrs); }
      u(F.grad).uP.value = fPrs.read.texture; u(F.grad).uV.value = fVel.read.texture; flRun(F.grad, fVel);
      u(F.adv).uV.value = fVel.read.texture; u(F.adv).uS.value = fVel.read.texture; u(F.adv).uK.value = 1; flRun(F.adv, fVel);
      u(F.adv).uS.value = fDye.read.texture; u(F.adv).uK.value = FL.fade; flRun(F.adv, fDye);
    }

    let fovFix = 0;
    function resize() {
      const w = innerWidth, h = innerHeight;
      renderer.setPixelRatio(dpr());
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = fovFix || (w <= 1024 ? 62 : 45);
      camera.updateProjectionMatrix();
      const pr = renderer.getPixelRatio();
      mainRT.setSize(Math.round(w * pr), Math.round(h * pr));
      reflRT.setSize(Math.round(w * pr * rtScale), Math.round(h * pr * rtScale));
      postU.uRes.value.set(w, h);
      for (const u of dotUniforms) u.uPx.value = pr * h;
    }
    resize();
    addEventListener("resize", resize);

    // ── Camera Path ──
    let keys = [{ cam: [0, 2.4, 24], look: [0, 6.5, -20], shape: "mark", at: [0, 9, -27], size: 1 }];
    let prog = 0, target = 0;
    const lerp3 = (a, b, t, out) => out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    const ease = (t) => t * t * (3 - 2 * t);
    const camP = new THREE.Vector3(), lookP = new THREE.Vector3(), atP = new THREE.Vector3();
    const mouse = { x: 0, y: 0, yaw: 0, pitch: 0 };
    addEventListener("pointermove", (e) => {
      mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5;
      stir.still = 0;
    }, { passive: true });

    // ── Cursor stir: the original particle physics (GPGPU) rebuilt on the CPU with measured values ──
    // Not pushing away but dragging along the direction the cursor moved — everything within 0.05 screen height of the cursor on screen is taken, nothing beyond 0.12.
    // Dragged points return to their shape with a spring (0.6 · stronger with distance) and damping (0.93 per step), while stirred, the spring loosens by up to 60%, so they linger scattered for a moment.
    // Values are kept in original units and multiplied by SU when drawn — the size ratio between the original shape (radius about 6) and ours (about 3)
    const SU = 0.5;
    const off = new Float32Array(N * 3), vel = new Float32Array(N * 3), scat = new Float32Array(N), glow = glowAttr.array;
    const stir = { nx: 0, ny: 0, vx: 0, vy: 0, seeded: false, still: 99, acc: 0 };
    const mvp = new THREE.Matrix4(), cInv = new THREE.Matrix4(), cR = new THREE.Vector3(), cU = new THREE.Vector3();
    const smooth01 = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    function stirStep(P, time) {
      // The original runs with a fixed 1/60 step and delta 1/120 — spring and scatter values are based on that step
      const force = stir.still < 3 ? 1 : Math.max(0, 1 - (stir.still - 3));
      const aspect = innerWidth / innerHeight, e = mvp.elements;
      const mu = (mouse.x * 2 + 1) * 0.5, mv = (-mouse.y * 2 + 1) * 0.5;
      const imp = 43.5 / Math.max(1, cloud.position.distanceTo(camera.position)) * SU * cloud.scale.x;
      const kick = Math.hypot(stir.vx, stir.vy) * 50 * imp * force;
      for (let i = 0; i < N; i++) {
        const j = i * 3;
        let mask = 0, fx = 0, fy = 0, fluid = 0;
        if (kick > 1e-4) {
          const x = P[j] + off[j] * SU, y = P[j + 1] + off[j + 1] * SU, z = P[j + 2] + off[j + 2] * SU;
          const w = e[3] * x + e[7] * y + e[11] * z + e[15];
          if (w > 0) {
            const sx = Math.min(0.999, Math.max(0.001, ((e[0] * x + e[4] * y + e[8] * z + e[12]) / w) * 0.5 + 0.5));
            const sy = Math.min(0.999, Math.max(0.001, ((e[1] * x + e[5] * y + e[9] * z + e[13]) / w) * 0.5 + 0.5));
            mask = 1 - smooth01(0.05, 0.12, Math.hypot((sx - mu) * aspect, sy - mv));
          }
          if (mask > 0) {
            fx = stir.vx * aspect * 50 * imp * mask; fy = stir.vy * 50 * imp * mask;
            const raw = Math.hypot(fx, fy), cap = Math.min(1, 1.5 / Math.max(raw, 1e-4));
            fx *= cap; fy *= cap;
            fluid = Math.min(raw, 1.5) * force;
            const k = 0.07 * force;
            vel[j] += (cR.x * fx + cU.x * fy) * k; vel[j + 1] += (cR.y * fx + cU.y * fy) * k; vel[j + 2] += (cR.z * fx + cU.z * fy) * k;
          }
        }
        const s = scat[i], dist = Math.hypot(off[j], off[j + 1], off[j + 2]);
        const hold = smooth01(0, 0.25, s);
        const ease = Math.max(0.2, Math.max(0.3, 1 - fluid * 0.8) * (1 - hold * 0.6));
        const spring = 0.6 * (1 + dist * 0.5 + (1 - (1 + dist * 0.5)) * s) * ease / 120;
        vel[j] -= off[j] * spring; vel[j + 1] -= off[j + 1] * spring; vel[j + 2] -= off[j + 2] * spring;
        {
          // As in the original, it keeps undulating at a constant flow (0.0025) even at rest, and stirred spots go up to 4.9x (× (1 + 2.6·strength)) — which is why the cloud always wriggles hazily
          const q = 0.9 / SU, px = P[j] * q, py = P[j + 1] * q, pz = P[j + 2] * q, t = time * 0.5, b = 0.0025 * (1 + 2.6 * fluid);
          vel[j] += Math.sin(py + t + 1.7 * Math.sin(pz)) * b; vel[j + 1] += Math.sin(pz + t + 1.7 * Math.sin(px)) * b; vel[j + 2] += Math.sin(px + t + 1.7 * Math.sin(py)) * b;
        }
        vel[j] *= 0.93; vel[j + 1] *= 0.93; vel[j + 2] *= 0.93;
        const sp = Math.hypot(vel[j], vel[j + 1], vel[j + 2]);
        if (sp > 6) { vel[j] *= 6 / sp; vel[j + 1] *= 6 / sp; vel[j + 2] *= 6 / sp; }
        const ts = Math.min(1, fluid * 2.5);
        scat[i] = ts > s ? s + (ts - s) * 0.125 : Math.max(0, s - 1 / 120 / 0.35);
        off[j] += vel[j] * 0.5; off[j + 1] += vel[j + 1] * 0.5; off[j + 2] += vel[j + 2] * 0.5;
        const tg = Math.min(1, Math.min(1, Math.max(0, (sp - 0.05) * 2.5)) + Math.min(Math.hypot(stir.vx, stir.vy) * 50 * imp * mask * 1.5, 0.8) + scat[i] * 0.7);
        glow[i] += (tg - glow[i]) * (tg > glow[i] ? 0.1 : 0.025);
      }
    }
    function stirFrame(P, dt, time) {
      stir.still += dt;
      const f = Math.min(2, dt * 60), mx = mouse.x * 2, my = -mouse.y * 2;
      if (!stir.seeded) { stir.nx = mx; stir.ny = my; stir.seeded = true; }
      // Cursor speed: accumulate the difference between the smoothly following point and the actual cursor, then shrink it by 0.6 each step
      const lead = 1 - Math.pow(0.8, f);
      stir.nx += (mx - stir.nx) * lead; stir.ny += (my - stir.ny) * lead;
      stir.vx += (mx - stir.nx) * 0.5; stir.vy += (my - stir.ny) * 0.5;
      const fade = Math.pow(0.6, f);
      stir.vx *= fade; stir.vy *= fade;
      if (stir.vx * stir.vx + stir.vy * stir.vy > 1e-8) stir.still = 0;
      camera.updateMatrixWorld();
      cloud.updateMatrixWorld();
      mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(cloud.matrixWorld);
      cInv.copy(cloud.matrixWorld).invert();
      cR.setFromMatrixColumn(camera.matrixWorld, 0).transformDirection(cInv);
      cU.setFromMatrixColumn(camera.matrixWorld, 1).transformDirection(cInv);
      stir.acc += Math.min(dt, 1 / 30);
      while (stir.acc >= 1 / 60) { stirStep(P, time); stir.acc -= 1 / 60; }
      for (let j = 0; j < N * 3; j++) P[j] += off[j] * SU;
      glowAttr.needsUpdate = true;
    }

    let fromShape = "mark", toShape = "mark", morphT = 1, held = null;
    // When the path is given as a function (first-page orbit), the shape isn’t reshuffled and only the target changes like the original — dots fly in place on springs and gather into the new shape
    function retarget(name) {
      const A = SHAPES[held], B = SHAPES[name];
      if (!reduce) for (let j = 0; j < N * 3; j++) off[j] += (A[j] - B[j]) / SU;
      held = name;
    }
    function shapeAt(p) {
      if (typeof keys === "function") {
        const r = keys(p, innerWidth <= 1024);
        camP.set(...r.cam); lookP.set(...r.look); atP.set(...r.at);
        // This build’s hills differ from the original terrain, so the orbit never drops below 2.6 above the ground when passing over a hill so it doesn’t get buried in grass (indoor paths unchanged)
        if (!opts.room) camP.y = Math.max(camP.y, height(camP.x, camP.z) + 2.6);
        return { hold: r.shape, size: r.size, rotY: r.rotY || 0 };
      }
      const n = keys.length - 1;
      const f = Math.min(n, Math.max(0, p * n));
      const i = Math.max(0, Math.min(n - 1, Math.floor(f))), t = n ? f - i : 0;
      const a = keys[i], b = keys[Math.min(n, i + 1)];
      lerp3(a.cam, b.cam, ease(t), camP);
      lerp3(a.look, b.look, ease(t), lookP);
      lerp3(a.at, b.at, ease(t), atP);
      const size = a.size + (b.size - a.size) * ease(t);
      // The shape changes in the middle 40% between two scenes
      const mt = THREE.MathUtils.clamp((t - 0.3) / 0.4, 0, 1);
      return { from: a.shape, to: b.shape, t: ease(mt), size };
    }

    // Original camera feel: the camera sits on the path and turns around the point the world is looking at — cursor edge to edge gives an opposite tilt of the same size as ±0.025rad left and right,
    // Vertically it moves 1/10 of that, up and down. Each frame follows 8%, settling in a little over 0.2s (ridge, waterside and grass tips tilt slightly across the full screen width).
    // Even when idle it sways ±0.8° left and right over 12s and tilts ±0.4° over 17s. Instead of rotating the world, the camera is turned the opposite way by the same amount (so the reflection camera stays correct)
    const UP = new THREE.Vector3(0, 1, 0), aimL = new THREE.Vector3(), aimV = new THREE.Vector3(), aimR = new THREE.Vector3();
    const aimQ = new THREE.Quaternion(), aimT = new THREE.Quaternion();
    function aimCamera(dt, time) {
      const k = reduce ? 0 : 1 - Math.pow(0.92, dt * 60);
      mouse.yaw += (mouse.x * 2 * 0.025 - mouse.yaw) * k;
      mouse.pitch += (mouse.y * 2 * 0.025 - mouse.pitch) * k;
      const sway = reduce ? 0 : 1;
      aimV.subVectors(lookP, camP).applyAxisAngle(UP, Math.sin(time * Math.PI * 2 / 12) * THREE.MathUtils.degToRad(0.8) * sway);
      aimL.copy(camP).add(aimV);
      aimV.normalize();
      camera.position.copy(camP);
      camera.up.copy(UP).applyAxisAngle(aimV, Math.sin(time * Math.PI * 2 / 17) * THREE.MathUtils.degToRad(0.4) * sway);
      camera.lookAt(aimL);
      aimR.crossVectors(aimV, UP).normalize();
      aimQ.setFromAxisAngle(UP, mouse.yaw).multiply(aimT.setFromAxisAngle(aimV, -mouse.yaw)).multiply(aimT.setFromAxisAngle(aimR, mouse.pitch * 0.1)).invert();
      camera.position.sub(aimL).applyQuaternion(aimQ).add(aimL);
      camera.quaternion.premultiply(aimQ);
      camera.updateMatrixWorld();
    }

    const clock = new THREE.Clock();
    let running = true, split = 0, veil = 0;
    function frame() {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      prog += (target - prog) * (reduce ? 1 : 1 - Math.exp(-dt * 6));
      const s = shapeAt(prog);
      aimCamera(dt, time);
      cloud.position.copy(atP);
      if (s.hold) {
        if (!held) held = s.hold;
        else if (s.hold !== held) retarget(s.hold);
        fromShape = toShape = held; morphT = 0;
        cloud.scale.setScalar(s.size);
        cloud.rotation.y = s.rotY;
      } else {
        held = null;
        cloud.scale.setScalar(s.size * 1.35);
        cloud.rotation.y = time * 0.08;
        if (s.from !== fromShape || s.to !== toShape || s.t !== morphT) { fromShape = s.from; toShape = s.to; morphT = s.t; }
      }
      const A = SHAPES[fromShape], B = SHAPES[toShape], P = posAttr.array, k = morphT;
      for (let i = 0; i < N; i++) {
        const j = i * 3, sw = Math.sin(k * Math.PI) * 1.4;
        P[j] = A[j] + (B[j] - A[j]) * k + Math.sin(cph[i] + time * 0.5) * sw * 0.4;
        P[j + 1] = A[j + 1] + (B[j + 1] - A[j + 1]) * k + Math.cos(cph[i] * 2.0) * sw * 0.3;
        P[j + 2] = A[j + 2] + (B[j + 2] - A[j + 2]) * k;
      }
      if (!reduce) stirFrame(P, dt, time);
      posAttr.needsUpdate = true;

      for (let i = 0; i < LEAVES; i++) {
        const L = leafS[i];
        L.y -= L.sp * dt; L.x += Math.sin(time * 0.6 + L.ph) * dt * 0.8 + dt * 0.4;
        if (L.y < -1) { L.y = 18 + rnd() * 6; L.x = camera.position.x + (rnd() - 0.5) * 60; L.z = camera.position.z - 6 - rnd() * 44; }
        e3.set(time * L.rs + L.ph, time * L.rs * 0.7, L.ph);
        q.setFromEuler(e3);
        leaves.setMatrixAt(i, m4.compose(v3.set(L.x, L.y, L.z), q, s3.set(1, 1, 1)));
      }
      leaves.instanceMatrix.needsUpdate = true;
      flies.material.uniforms.uAlpha.value = 0.55 + Math.sin(time * 2.0) * 0.25;
      duck.position.x = 9 + Math.sin(time * 0.15) * 3;
      duck.rotation.y = Math.cos(time * 0.15) > 0 ? 0 : Math.PI;
      skyU.uTime.value = time;
      for (const u of dotUniforms) u.uTime.value = time;
      grassU.uTime.value = time;
      waterU.uTime.value = time;

      // Reflection: camera flipped below the water
      water.visible = false;
      vCam.copy(camera);
      vCam.position.set(camera.position.x, -camera.position.y, camera.position.z);
      vCam.up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      vCam.up.y = -vCam.up.y;
      v3.set(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      vCam.lookAt(v3.x, -v3.y, v3.z);
      vCam.updateMatrixWorld();
      vCam.projectionMatrix.copy(camera.projectionMatrix);
      texM.copy(bias).multiply(vCam.projectionMatrix).multiply(vCam.matrixWorldInverse);
      renderer.setRenderTarget(reflRT);
      renderer.render(scene, vCam);
      water.visible = true;

      renderer.setRenderTarget(mainRT);
      renderer.render(scene, camera);
      postU.uSplit.value = split;
      postU.uVeil.value = veil;
      if (!reduce) fluidStep(dt);
      postU.uFluidOn.value = FL.idle <= 120 ? 1 : 0;
      postU.tFluid.value = fDye.read.texture;
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    W.path = (k, fov) => { keys = k; if (fov && fov !== fovFix) { fovFix = fov; resize(); } return W; };
    W.progress = (p, now) => { target = THREE.MathUtils.clamp(p, 0, 1); if (now) prog = target; };
    W.split = (v) => { split = v; };
    W.veil = (v) => { veil = v; };
    W.quality = (q2) => { quality = q2; resize(); };
    W.recolor = () => {
      readColors();
      skyU.uTop.value = C["sky-top"]; skyU.uLow.value = C["sky-low"]; skyU.uCloud.value = C.cloud;
      hemi.color.copy(C["sky-top"]); hemi.groundColor.copy(C["grass-root"]); sun.color.copy(C.surface);
      scene.fog.color.copy(C["sky-low"]);
      terrainMat.color.copy(C["grass-root"]); rockMat.color.copy(C.rock); towerMat.color.copy(C.ink); duckMat.color.copy(C.ink); leafMat.color.copy(C.leaf);
      grassU.uRoot.value = C["grass-root"]; grassU.uTip.value = C["grass-tip"]; grassU.uFar.value = C["grass-far"]; grassU.uFogC.value = C["sky-low"];
      waterU.uTint.value = C.water; waterU.uFogC.value = C["sky-low"]; postU.uVeilC.value = C.bg; postU.uFluidC.value = C.fluid;
      for (const u of dotUniforms) { u.uA.value = C.accent; u.uB.value = C.glow; u.uS.value = C.surface; u.uFogC.value = C["sky-low"]; }
    };
    W.pause = (v) => { if (v) running = false; else if (!running) { running = true; clock.getDelta(); requestAnimationFrame(frame); } };
    W.ready = true;
    return W;
  };
})();
