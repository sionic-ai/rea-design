// First page space scene — the original has 26 camera anchor points in the glb (a separate 26 for phone and tablet), and one timeline driven by the sum of frame progress (P) links them.
// anchor positions and rotations, section labels (map 4.5 · design 6.5 · launch 8.25 · deployed 10 · spaceops 11 · encryption 14 · modular 16 · price 19) and the value changes above them,
// Object positions (Earth radius 5, three satellite anchors, rocket · grid · orbit positions) are the values read from the original as they are. The objects are redrawn with our own geometry and our own shaders.
(() => {
  const canvas = document.querySelector(".fps-canvas");
  if (!canvas || !window.THREE) return;
  const T = THREE;
  const col = (v) => new T.Color().setStyle(window.ES.color(v));
  const C = { bg: col("--kf-bg"), ink: col("--kf-ink"), dim: col("--kf-dim"), accent: col("--kf-accent"), soft: col("--kf-accent-soft"), surface: col("--kf-surface"), raised: col("--kf-raised"), orange: col("--es-orange") };
  const hex = (c) => `#${c.getHexString()}`;

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(C.bg, 1);
  const scene = new T.Scene();
  // Original camera — 12° field of view, near plane 1
  const camera = new T.PerspectiveCamera(12, 1, 1, 1500);
  scene.add(camera);

  const NOISE = `
  vec3 hash3(vec3 p){ p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453)*2.-1.; }
  float noise(vec3 p){ vec3 i=floor(p), f=fract(p); vec3 u=f*f*(3.-2.*f);
    return mix(mix(mix(dot(hash3(i),f), dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x), mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)), dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)), dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x), mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)), dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }
  float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.02; a*=.5; } return s; }
  float h1(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }`;

  const U = {
    uTime: { value: 0 }, uMouse: { value: new T.Vector2() }, uDots: { value: 0 }, uEarthOpacity: { value: 1 }, uLetters: { value: 0 }, uSky: { value: 1 }, uAlbedo: { value: 0 },
    uLight: { value: new T.Vector3(-0.55, 0.3, 0.78).normalize() }, uAccent: { value: C.accent }, uInk: { value: C.ink }, uBg: { value: C.bg }, uDim: { value: C.dim }, uOrange: { value: C.orange },
    uCapt: { value: 0 }, uCaptZoom: { value: 1 }, uAspect: { value: 1 }, uGrid: { value: 0 }, uMix: { value: 0 }, uFrame: { value: 0 },
  };

  // ───── Stars (original sky — off in the map section, on after launch) ─────
  const starGeo = new T.BufferGeometry();
  const N = 3200, sp = new Float32Array(N * 3), ss = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const v = new T.Vector3().randomDirection().multiplyScalar(400 + Math.random() * 500);
    sp.set([v.x, v.y, v.z], i * 3); ss[i] = Math.random();
  }
  starGeo.setAttribute("position", new T.BufferAttribute(sp, 3));
  starGeo.setAttribute("aSeed", new T.BufferAttribute(ss, 1));
  const sky = new T.Points(starGeo, new T.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float aSeed; varying float vA; uniform float uTime; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv; gl_PointSize = (1. + aSeed*1.6); vA = .25 + .55*aSeed*(.7+.3*sin(uTime*1.5 + aSeed*40.)); }`,
    fragmentShader: `uniform vec3 uInk; uniform float uSky; varying float vA; void main(){ float d = length(gl_PointCoord-.5); gl_FragColor = vec4(uInk, vA*uSky*smoothstep(.5,.1,d)); }`,
  }));
  scene.add(sky);

  // ───── Globe — radius 5, centered. Procedural continents, clouds, night-side city lights, rim glow, letter cells for the cipher section, dot globe (uDots) ─────
  const R = 5;
  const earth = new T.Group();
  scene.add(earth);
  const earthMat = new T.ShaderMaterial({
    uniforms: U, transparent: true,
    vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vP = position; vN = normalize(normalMatrix*normal); vW = normalize(mat3(modelMatrix)*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `${NOISE}
    uniform float uTime, uDots, uEarthOpacity, uLetters, uAlbedo; uniform vec3 uLight, uAccent, uInk, uBg, uDim, uOrange; varying vec3 vP; varying vec3 vN; varying vec3 vV; varying vec3 vW;
    void main(){
      vec3 p = normalize(vP);
      float land = smoothstep(.02, .08, fbm(p*1.8 + vec3(3.1,1.7,.4)));
      float ice = smoothstep(.82, .9, abs(p.y));
      float cloud = smoothstep(.05, .45, fbm(p*3.2 + vec3(uTime*.01, 0., uTime*.006)) + .15*fbm(p*9.));
      float lit = smoothstep(-.15, .35, dot(vW, uLight));
      vec3 ocean = mix(uBg, uAccent, .16);
      vec3 ground = mix(mix(uDim, uInk, .12), mix(uBg, uDim, .6), smoothstep(.2,.6,fbm(p*6.)));
      vec3 c = mix(ocean, ground, land);
      c = mix(c, uInk*.9, ice);
      c = mix(c, uInk*.78, cloud*.7);
      vec3 day = c*lit*.85*mix(.07, 1., uAlbedo);
      // Night-side city lights — fine dots clustered where ground noise is high, only on the side past sunset
      float town = smoothstep(.55, .85, fbm(p*14. + 7.)) * land;
      float spark = step(.82, h1(floor(p*420.)));
      vec3 night = mix(uBg, uAccent, .05)*(1.-lit) + uOrange*town*(.35 + .9*spark)*(1.-lit)*(1. - cloud*.8);
      float fres = pow(1. - max(dot(vN, vV), 0.), 2.6);
      vec3 photo = day + night + uAccent*fres*(.18 + .45*lit);
      // Cipher section — letter fragments blinking on and off in each latitude/longitude cell
      vec2 ll = vec2(atan(p.z, p.x)*18., asin(clamp(p.y,-1.,1.))*24.);
      vec2 cell = floor(ll); vec2 fc = fract(ll);
      float on = step(.55, h1(vec3(cell, floor(uTime*3. + h1(vec3(cell,1.))*9.))));
      float glyph = on*step(.18, fc.x)*step(fc.x, .82)*step(.25, fc.y)*step(fc.y, .75)*step(.35, h1(vec3(cell*3.1 + floor(fc*3.), 2.)));
      photo += uAccent*glyph*uLetters*.8;
      // Dot globe — dots in a latitude/longitude grid, land in light blue, ocean in faint dots
      float lat = asin(clamp(p.y,-1.,1.)), lon = atan(p.z, p.x);
      float rows = 90.; float ly = lat/3.14159*rows; float row = floor(ly)+.5; float cosl = cos(row/rows*3.14159);
      float cols = max(4., floor(rows*2.*cosl)); float lx = (lon/6.28318+.5)*cols;
      vec2 g = vec2(fract(lx)-.5, fract(ly)-.5); float dot_ = smoothstep(.32, .18, length(g));
      vec3 dotted = mix(uBg, mix(uDim*.35, uAccent, land), dot_*(.35+.65*land)) * (.35 + .65*smoothstep(-.4,.6,dot(vW,uLight))) + uAccent*fres*.6;
      gl_FragColor = vec4(mix(photo, dotted, uDots), uEarthOpacity);
    }`,
  });
  earth.add(new T.Mesh(new T.SphereGeometry(R, 160, 120), earthMat));
  const atmo = new T.Mesh(new T.SphereGeometry(R * 1.07, 96, 64), new T.ShaderMaterial({
    uniforms: U, transparent: true, side: T.BackSide, blending: T.AdditiveBlending, depthWrite: false,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uAccent, uLight, uInk; uniform float uEarthOpacity; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(max(0., .72 - dot(-vN, vV)), 3.2)*1.1; float l = .35 + .65*smoothstep(-.5,.6,dot(-vN,uLight)); gl_FragColor = vec4(mix(uAccent, uInk*.75, .35)*f*l, f*uEarthOpacity); }`,
  }));
  earth.add(atmo);

  // ───── Satellite — original detail satellite proportions: flat body (.243×.061×.162), observation module on top, solar panels folding and unfolding three each front and back (z) ─────
  const mats = [];
  const lineM = (o = 0.85) => { const m = new T.LineBasicMaterial({ color: C.accent, transparent: true, opacity: o }); mats.push(m); return m; };
  const edges = (geo, m) => new T.LineSegments(new T.EdgesGeometry(geo), m);
  const panelGrid = (w, d, nx, nz, m) => {
    const pts = [];
    for (let i = 0; i <= nx; i++) { const x = -w / 2 + (w * i) / nx; pts.push(x, 0.0025, -d / 2, x, 0.0025, d / 2); }
    for (let j = 0; j <= nz; j++) { const z = -d / 2 + (d * j) / nz; pts.push(-w / 2, 0.0025, z, w / 2, 0.0025, z); }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
    return new T.LineSegments(g, m);
  };
  const makeSat = (detail) => {
    const root = new T.Group(), mesh = new T.Group(); root.add(mesh);
    const busMat = new T.MeshStandardMaterial({ color: C.soft, metalness: 0.6, roughness: 0.3, transparent: true, emissive: C.accent, emissiveIntensity: 0.22, depthWrite: false });
    // The solar panel is like the original: bright cell lines on a dark panel — faces lean toward the background
    const panelMat = new T.MeshStandardMaterial({ color: C.surface, metalness: 0.6, roughness: 0.4, transparent: true, emissive: C.accent, emissiveIntensity: 0.03, depthWrite: false });
    const lm = lineM(), gm = lineM(0.5);
    const box = (w, h, d, mat) => { const g = new T.BoxGeometry(w, h, d), o = new T.Group(); o.add(new T.Mesh(g, mat), edges(g, lm)); return o; };
    const body = box(0.243, 0.061, 0.162, busMat); mesh.add(body);
    const payload = box(0.12, 0.1, 0.12, busMat); payload.position.set(0.013, 0.081, 0.002); mesh.add(payload);
    const lens = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.03, 20), busMat); lens.position.set(0.013, 0.145, 0.002); mesh.add(lens);
    const panels = [];
    [-1, 1].forEach((s) => {
      for (let k = 0; k < 3; k++) {
        const g = new T.BoxGeometry(0.218, 0.004, 0.164), o = new T.Group();
        o.add(new T.Mesh(g, panelMat), panelGrid(0.218, 0.164, 4, 3, gm), edges(g, lm));
        o.userData = { s, k };
        mesh.add(o); panels.push(o);
      }
    });
    // Inside the body — four boards and lines that light up in the peek-inside section
    const mods = [], wires = new T.Group();
    if (detail) {
      for (let k = 0; k < 4; k++) { const m = box(0.2, 0.006, 0.14, panelMat); m.userData.y = -0.021 + k * 0.014; mods.push(m); mesh.add(m); }
      const pts = [];
      for (let i = 0; i < 14; i++) { const x = -0.1 + Math.random() * 0.2, z = -0.06 + Math.random() * 0.12; pts.push(x, -0.025, z, x + (Math.random() - 0.5) * 0.08, 0.025, z + (Math.random() - 0.5) * 0.05); }
      const wg = new T.BufferGeometry(); wg.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
      wires.add(new T.LineSegments(wg, lineM(0))); mesh.add(wires);
    }
    // deployed 1 = Spread (± .182 each, front and back), 0 = Body folds overlapping top and bottom. wire = Blueprint line weight, build = Upright amount, inside = Take a closer look
    root.userData.set = ({ deployed = 1, wire = 0, build = 1, opacity = 1, inside = 0, modules = 0, cables = 0 }) => {
      panels.forEach((o) => {
        const { s, k } = o.userData;
        const fz = 0, fy = s * (0.036 + k * 0.006);
        const dz = s * (0.081 + 0.091 + k * 0.182), dy = 0.0334 - 0.0334 * (1 - deployed);
        o.position.set(0, fy + (dy - fy) * deployed, fz + (dz - fz) * deployed);
      });
      mods.forEach((m, k) => (m.position.y = m.userData.y + (k - 1.5) * 0.012 * modules));
      const solid = opacity * build * (1 - wire * 0.9);
      busMat.opacity = solid * (1 - inside * 0.85); panelMat.opacity = solid;
      lm.opacity = opacity * Math.min(1, 0.25 + wire * 0.75 + (1 - build) * 0.6 + inside * 0.4);
      gm.opacity = lm.opacity * 0.6;
      mods.forEach((m) => (m.visible = inside > 0.01));
      if (wires.children[0]) wires.children[0].material.opacity = cables * opacity;
      root.visible = opacity > 0.01;
    };
    return root;
  };
  const sat = makeSat(1);
  scene.add(sat);
  // Satellite drawn in the design section (original drawSat) — lines only
  const drawSat = makeSat(0);
  scene.add(drawSat);

  // Three satellite anchor points (Hero · workshop · Footer) — position, rotation, size
  const ref = (t, q, s) => ({ p: new T.Vector3(...t), q: new T.Quaternion(...q), s });
  const SATP = [
    ref([1.6931, 2.4491, 12.6934], [0.6312, -0.1901, 0.637, 0.3995], 0.6495),
    ref([0.0507, -2.8707, 41.7769], [0, 0, 0, 1], 0.4904),
    ref([0.6322, 8.9057, 20.9192], [-0.4393, 0.7969, 0.0827, 0.4064], 0.4904),
  ];

  // ───── Blueprint floor grid — original grid spot (workshop floor, 7.77 per side) ─────
  const gridPts = [], GS = 3.8856;
  for (let i = -24; i <= 24; i++) { const v = (i / 24) * GS; gridPts.push(v, 0, -GS, v, 0, GS, -GS, 0, v, GS, 0, v); }
  const gridGeo = new T.BufferGeometry(); gridGeo.setAttribute("position", new T.Float32BufferAttribute(gridPts, 3));
  const gridMat = new T.ShaderMaterial({
    uniforms: { uO: { value: 0 }, uDecay: { value: 0 }, uAccent: U.uAccent }, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    // Original uGridDecay — the grid erases from the center outward
    fragmentShader: `uniform float uO, uDecay; uniform vec3 uAccent; varying vec3 vP; void main(){ float d = length(vP.xz)/${GS.toFixed(4)}; float a = uO*smoothstep(1., .55, d)*(1. - smoothstep(uDecay - .25, uDecay, d)*step(0., uDecay)); gl_FragColor = vec4(uAccent, a*.6); }`,
  });
  const grid = new T.LineSegments(gridGeo, gridMat);
  grid.position.set(0.0227, -3.0014, 41.726);
  scene.add(grid);

  // ───── Rocket — original Product position · size: body cylinder (radius .64 · length 7.9) and two fairing halves (radius .87 · height 3.8), with five satellite bays inside ─────
  const falcon = new T.Group(); scene.add(falcon);
  const FALCON = new T.Vector3(-0.5593, -2.2509, 41.7749);
  const fusMat = new T.MeshStandardMaterial({ color: C.dim, metalness: 0.5, roughness: 0.35, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide });
  const fusLine = new T.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0 });
  const tube = new T.Group(); falcon.add(tube);
  const tg = new T.CylinderGeometry(0.64, 0.64, 7.89, 40, 1, true);
  const tubeMesh = new T.Mesh(tg, fusMat); tubeMesh.position.y = -3.555; tube.add(tubeMesh);
  // Nine body-segment ring lines and eight vertical lines
  const rings = [];
  for (let k = 0; k < 9; k++) for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, b = ((i + 1) / 48) * Math.PI * 2, y = -7.5 + k * 0.98;
    rings.push(Math.sin(a) * 0.645, y, Math.cos(a) * 0.645, Math.sin(b) * 0.645, y, Math.cos(b) * 0.645);
  }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; rings.push(Math.sin(a) * 0.645, -7.5, Math.cos(a) * 0.645, Math.sin(a) * 0.645, 0.39, Math.cos(a) * 0.645); }
  const ringG = new T.BufferGeometry(); ringG.setAttribute("position", new T.Float32BufferAttribute(rings, 3));
  tube.add(new T.LineSegments(ringG, fusLine));
  const half = (s) => {
    const g = new T.Group(), th = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    const cyl = new T.CylinderGeometry(0.87, 0.87, 2.0, 32, 1, true, th, Math.PI), cone = new T.CylinderGeometry(0.12, 0.87, 1.8, 32, 3, true, th, Math.PI);
    const a = new T.Mesh(cyl, fusMat); a.position.y = 1; const b = new T.Mesh(cone, fusMat); b.position.y = 2.9;
    const ea = new T.LineSegments(new T.WireframeGeometry(new T.CylinderGeometry(0.87, 0.87, 2.0, 32, 6, true, th, Math.PI)), fusLine); ea.position.y = 1; const eb = new T.LineSegments(new T.WireframeGeometry(cone), fusLine); eb.position.y = 2.9;
    g.add(a, b, ea, eb); tube.add(g); return g;
  };
  const p1 = half(1), p2 = half(-1);
  const storeMat = new T.MeshStandardMaterial({ color: C.raised, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0 });
  const store = []; for (let k = 0; k < 5; k++) { const g = new T.BoxGeometry(0.62, 0.07, 0.62), o = new T.Group(); o.add(new T.Mesh(g, storeMat), edges(g, fusLine)); tube.add(o); store.push(o); }
  // Where the satellite sits when loaded inside the rocket (original sat-rocket)
  const dock = new T.Object3D(); dock.position.set(0.3959, -0.7232, -0.1428); dock.quaternion.set(0, 0.1699, 0, 0.9855); dock.scale.setScalar(0.7287); falcon.add(dock);
  // Launch lines — streaks of light drawn up and down beside the rocket (where the original falcon-trails sit)
  const ftPts = []; for (let k = 0; k < 7; k++) { const x = -1.36 + Math.random() * 2.9, z = 42.9 - Math.random() * 3.2; ftPts.push(x, -1.44 - 15.5, z, x, -1.44 + 15.5, z); }
  const ftG = new T.BufferGeometry(); ftG.setAttribute("position", new T.Float32BufferAttribute(ftPts, 3));
  const ftMat = new T.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0, blending: T.AdditiveBlending });
  const fTrails = new T.LineSegments(ftG, ftMat); scene.add(fTrails);

  // ───── Constellation orbit (original earth.trails) — rings and a satellite swarm circling the earth, data lines dropping to the ground (by the price drag value) ─────
  const fleet = new T.Group(); earth.add(fleet);
  const ringMat = new T.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0 });
  const trailMat = new T.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0, blending: T.AdditiveBlending });
  const smallSats = [];
  const ORB = [[6.6, 0.3, 0], [6.9, -0.5, 1.2], [7.3, 0.9, 2.4], [6.75, 1.4, 3.1], [7.1, -1.1, 4.4]];
  ORB.forEach(([r, inc, off], k) => {
    const ring = new T.Group(); ring.rotation.set(inc, off, 0);
    const pts = []; for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
    const rg = new T.BufferGeometry(); rg.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
    ring.add(new T.Line(rg, ringMat));
    for (let j = 0; j < 2; j++) {
      const s = makeSat(0); s.scale.setScalar(0.45); s.userData.set({ deployed: 1 });
      const trg = new T.BufferGeometry(); trg.setAttribute("position", new T.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
      const trail = new T.Line(trg, trailMat); scene.add(trail);
      ring.add(s);
      smallSats.push({ s, r, a: off * 2 + j * Math.PI, speed: 0.05 + k * 0.008, trail, k: smallSats.length });
    }
    fleet.add(ring);
  });

  // ───── Operations section — two rings around the Earth (radius 5.37, facing the screen) with a satellite orbiting on them, and a data line down to the ground station ─────
  const ops = new T.Group(); ops.rotation.x = Math.PI / 2; scene.add(ops);
  const opsRingMat = new T.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0 });
  [1, 1.0059].forEach((k, i) => {
    const pts = []; for (let j = 0; j <= 160; j++) { const a = (j / 160) * Math.PI * 2; pts.push(Math.cos(a) * 5.368 * k, 0, Math.sin(a) * 5.368 * k); }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
    const l = new T.Line(g, opsRingMat); l.rotation.z = i * 0.35; ops.add(l);
  });
  const opsSat = makeSat(0); opsSat.scale.setScalar(1.4); opsSat.userData.set({ deployed: 1 }); ops.add(opsSat);
  const opsLineG = new T.BufferGeometry(); opsLineG.setAttribute("position", new T.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
  const opsLineMat = new T.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0, blending: T.AdditiveBlending });
  ops.add(new T.Line(opsLineG, opsLineMat));
  const station = new T.Mesh(new T.SphereGeometry(0.06, 12, 8), new T.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0 })); ops.add(station);

  // ───── Growing satellite swarm (original scalableSats, eight satellites) — spreads out around the last satellite and settles ─────
  const swarm = [];
  for (let i = 0; i < 8; i++) { const s = makeSat(0); s.scale.setScalar(0.38); s.userData.set({ deployed: 1 }); scene.add(s); swarm.push(s); }

  // ───── Gauge frame (operations section) — a panel wrapping the screen edge. A placeholder gauge drawn on the canvas is covered with a screen panel (original uFrameBorders) ─────
  const dashCanvas = document.createElement("canvas"); dashCanvas.width = 1600; dashCanvas.height = 900;
  const drawDash = () => {
    const x = dashCanvas.getContext("2d");
    x.clearRect(0, 0, 1600, 900);
    x.fillStyle = hex(C.surface); x.globalAlpha = 0.92;
    x.fillRect(16, 70, 54, 814); x.fillRect(86, 70, 330, 560); x.fillRect(1190, 70, 394, 240); x.fillRect(1190, 326, 394, 270); x.fillRect(1190, 612, 394, 272); x.fillRect(560, 16, 480, 40);
    x.globalAlpha = 1; x.strokeStyle = hex(C.raised); x.lineWidth = 2;
    for (let i = 0; i < 9; i++) x.strokeRect(26, 84 + i * 88, 34, 34);
    x.strokeRect(86, 70, 330, 560); x.strokeRect(1190, 70, 394, 240); x.strokeRect(1190, 326, 394, 270); x.strokeRect(1190, 612, 394, 272);
    x.fillStyle = hex(C.raised); for (let i = 0; i < 7; i++) x.fillRect(104, 96 + i * 70, 294, 44);
    x.fillStyle = hex(C.accent); for (let i = 0; i < 7; i++) x.fillRect(352, 108 + i * 70, 30, 20);
    x.strokeStyle = hex(C.accent); x.lineWidth = 3; x.beginPath(); x.moveTo(1210, 280); for (let i = 0; i <= 30; i++) x.lineTo(1210 + i * 12.4, 230 - Math.sin(i * 0.5) * 40 - i * 1.5); x.stroke();
    x.globalAlpha = 0.5; x.beginPath(); x.arc(1387, 461, 90, 0, Math.PI * 2); x.stroke(); x.globalAlpha = 1;
    x.fillStyle = hex(C.dim); x.fillRect(1210, 640, 354, 210);
    x.fillStyle = hex(C.orange); x.fillRect(580, 28, 16, 16);
    x.fillStyle = hex(C.dim); x.fillRect(610, 30, 400, 12);
  };
  drawDash();
  const dashTex = new T.CanvasTexture(dashCanvas); dashTex.colorSpace = T.SRGBColorSpace;
  const hud = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    uniforms: { uMap: { value: dashTex }, uFrame: U.uFrame }, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    // Frames push in from outside to inside — original frame borders 1s power3.inOut
    fragmentShader: `uniform sampler2D uMap; uniform float uFrame; varying vec2 vUv; void main(){ vec2 c = (vUv - .5)/mix(1.25, 1., uFrame) + .5; vec4 t = texture2D(uMap, c); float inside = step(0., c.x)*step(c.x, 1.)*step(0., c.y)*step(c.y, 1.); gl_FragColor = vec4(t.rgb, t.a*uFrame*inside); }`,
  }));
  hud.frustumCulled = false; hud.renderOrder = 11;
  scene.add(hud);

  // ───── Zoom map — a panel covering the front of the camera. The cursor very slowly pushes the map and grid (uMouse) ─────
  const capt = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    uniforms: U, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `${NOISE}
    uniform float uTime, uCapt, uCaptZoom, uAspect, uGrid, uMix; uniform vec2 uMouse; uniform vec3 uAccent, uInk, uBg, uDim; varying vec2 vUv;
    float sGrid(vec2 p, float w){ vec2 g = abs(fract(p - .5) - .5)/fwidth(p); return 1. - min(min(g.x, g.y)*w*20., 1.); }
    void main(){
      vec2 dUv = (vUv - .5 + uMouse*.04)*vec2(uAspect, 1.)/max(1., uAspect) + .5;
      float z = 1.6 - uCaptZoom*.9;
      vec3 p = vec3(dUv*z*3., 0.);
      float land = smoothstep(-.05, .2, fbm(p*.8 + vec3(2.,5.,uMix*3.)));
      float rid = fbm(p*4.);
      vec3 ground = mix(mix(uBg, uDim, .7), mix(uInk, uDim, .55), smoothstep(-.2,.4,rid));
      vec3 c = mix(mix(uBg, uAccent, .22), ground, land);
      float cl = smoothstep(.0, .6, fbm(vec3(dUv*z*2.2 + uTime*.004, 1.3)) + .2*fbm(vec3(dUv*z*8., 2.)));
      c = mix(c, uInk, cl*.75);
      vec2 gUv = (vUv - .5)*(1.8 - uCaptZoom*.85) + .5 + uMouse*vec2(.06, .12); gUv.x *= uAspect;
      float g = sGrid(gUv*6., .01)*.1 + sGrid(gUv*24., .04)*.1 + sGrid(gUv*48., .06)*.1;
      c += uAccent*g*uGrid*2.;
      c *= smoothstep(.85, .35, length((vUv - .5)*vec2(uAspect*.7, 1.)));
      gl_FragColor = vec4(c, uCapt);
    }`,
  }));
  capt.frustumCulled = false; capt.renderOrder = 10;
  scene.add(capt);

  // ───── Light ─────
  scene.add(new T.AmbientLight(C.ink, 0.25));
  const sun = new T.DirectionalLight(C.ink, 2.2); sun.position.set(-20, 12, 24); scene.add(sun);
  const rim = new T.DirectionalLight(C.accent, 1.4); rim.position.set(18, -6, -14); scene.add(rim);

  // ───── Camera anchors — camera-1…26 from the original glb (phone·tablet use camera-N-mobile). [x,y,z, qx,qy,qz,qw] ─────
  const CAM_DK = [[1.302,1.225,17.082,0.1347,0.0037,0.0004,0.9909],[-6.716,1.38,32.522,0.0164,0.0036,0.001,0.9999],[-6.276,-1.172,32.522,0.0164,0.0036,0.001,0.9999],[0,0,55.71,0,0,0,1],[0,0,84.716,0,0,0,1],[-0.072,0.019,6.114,0,0,0,1],[3.555,2.591,46.95,-0.3496,0.2598,0.0674,0.8976],[3.003,0.252,44.93,-0.3,0.3374,0.0798,0.8887],[1.638,3.939,47.759,-0.389,0.175,0.0672,0.9019],[1.638,3.939,47.759,-0.389,0.175,0.0672,0.9019],[-0.794,7.685,54.703,-0.0175,0.0182,0.1994,0.9796],[1.858,9.415,24.516,-0.0713,0.1199,0.0881,0.9863],[27.717,4.481,32.397,-0.0342,0.3335,-0.0071,0.9421],[1.061,4.478,29.002,-0.0089,-0.0207,-0.0189,0.9996],[23.727,7.05,19.82,-0.0587,0.3977,0.0507,0.9143],[23.01,9.974,20.344,-0.1144,0.3935,0.0644,0.9099],[12.423,1.779,35.439,0.0036,0.1327,-0.0041,0.9911],[1.101,10.218,33.396,-0.0839,0.0177,-0.0031,0.9963],[2.607,7.733,24.058,0.1774,0.275,0.1056,0.939],[1.349,8.361,21.943,0.2369,0.278,0.081,0.9274],[1.896,7.684,23.128,0.2476,0.2209,0.0698,0.9408],[-0.144,5.647,48.358,0.0066,-0.0019,0.0007,1],[-0.191,0.354,61.302,-0.0023,-0.0019,0.0007,1],[-0.087,2.877,33.794,-0.04,-0.0019,0.0007,0.9992],[-0.409,9.827,28.532,0.0697,-0.0051,-0.0066,0.9975],[-3.053,6.393,32.168,-0.0438,-0.0882,-0.1727,0.98]];
  const CAM_MB = [[1.51,1.448,15.62,0.1347,0.0037,0.0004,0.9909],[-5.556,1.379,32.522,0.0165,0.0036,0.001,0.9999],[-5.116,-1.376,32.522,0.0165,0.0036,0.001,0.9999],[0,0,55.71,0,0,0,1],[0,0,84.716,0,0,0,1],[-0.072,0.019,6.114,0,0,0,1],[3.555,3.214,46.95,-0.3496,0.2598,0.0674,0.8976],[3.003,0.578,44.931,-0.3,0.3374,0.0798,0.8887],[2.214,1.506,47.115,-0.294,0.1949,0.0768,0.9326],[2.032,2.748,47.184,-0.3538,0.1895,0.0892,0.9116],[-0.429,7.697,54.692,-0.0175,0.0182,0.1994,0.9796],[1.823,9.893,25.113,-0.1021,0.1203,0.0876,0.9836],[22.294,5.374,53.097,-0.0327,0.1873,-0.0122,0.9817],[0.937,3.828,31.382,-0.0089,-0.0207,-0.0189,0.9996],[28.902,7.871,22.028,-0.0551,0.4591,0.0546,0.885],[23.398,10.833,23.064,-0.1339,0.3873,0.0189,0.912],[14.63,-0.287,53.229,0.0036,0.1327,-0.0041,0.9911],[1.101,10.218,33.396,-0.0839,0.0177,-0.0031,0.9963],[2.387,8.102,23.483,0.1774,0.275,0.1056,0.939],[1.203,8.532,21.724,0.2369,0.278,0.081,0.9274],[1.076,8.536,21.298,0.328,0.3458,0.0654,0.8767],[-0.144,5.647,48.358,0.0066,-0.0019,0.0007,1],[-0.191,0.354,61.302,-0.0023,-0.0019,0.0007,1],[-0.087,2.877,33.794,-0.04,-0.0019,0.0007,0.9992],[-0.409,9.827,28.532,0.0697,-0.0051,-0.0066,0.9975],[-3.053,6.393,32.168,-0.0438,-0.0882,-0.1727,0.98]];
  // On desktop camera-18 rotates by the square of progress, camera-21 with expo.out (1-(1-t)^5) (original userData)
  const ROT_EASE = { 17: (t) => t * t, 20: (t) => 1 - (1 - t) ** 5 };
  const small = () => innerWidth < 1024;

  // Scene timeline — seeked by P like the original (labels, lengths and curves exactly as the original)
  const st = {
    cam: 0, lerpI: 1, eRx: 0, eRy: -1.9, eO: 1, albedo: 0, sky: 1, dots: 0, letters: 0,
    trails: 0, trailVis: 0, trailCount: 0, capt: 0, czoom: 0, cdecay: 0,
    satV: 1, satPoint: 0, satDock: 0, satS: 1, satRx: 0, satRy: 0, satRz: 0, stowed: 0, build: 1, inside: 0, modules: 0, cables: 0,
    drawV: 0, drawX: 0, grid: 0, gridDecay: -0.4,
    fV: 0, tubeY: -14.243, p1z: 1, p2z: -1, fY: -2.2509, fRy: -0.3476, fS: 1, p1rx: 0, p1ry: 0, p1rz: 0, p1pz: 0, p2rx: 0, p2rz: 0, p2pz: 0, wiggle: 0,
    fus: 0, storeA: 0, storeEx: 1, ftrails: 0, opsV: 0, frame: 0, opsP: 0, opsO: 1, swarmV: 0, swarmP: 0, fade: 0,
  };
  const tl = gsap.timeline({ paused: true });
  const o = "power1.inOut";
  const L = { start: 0, map: 4.5, design: 6.5, launch: 8.25, deployed: 10, spaceops: 11, encryption: 14, modular: 16, price: 19 };
  const at = (lab, d = 0) => L[lab] + d;
  const to = (vars, t) => tl.to(st, vars, t);
  // Between camera anchor points
  [[1, 1.5, "power2.inOut", 0], [2, 1.25, "power3.inOut", 1.5], [3, 0.5, o, 2.75], [4, 1, "power3.inOut", at("map", -1.25)], [5, 1, "power3.in", at("map", -0.25)],
   [6, 0.1, "power1.out", at("map", 1.2)], [7, 1.2, "power2.out", at("design", -0.7)], [8, 0.399, o, at("launch", 0.1)], [9, 0.001, o, at("launch", 0.499)], [10, 0.7, o, at("launch", 0.5)],
   [11, 0.45, "power3.inOut", at("launch", 1.2)], [12, 0.8, o, at("spaceops", -1.1)], [13, 1, o, at("spaceops")], [14, 1.2, o, at("spaceops", 1)], [15, 0.8, o, at("spaceops", 2.2)],
   [16, 1, o, at("encryption")], [17, 1, o, at("encryption", 1)], [18, 1, o, at("modular")], [19, 1, o, at("modular", 1)], [20, 1, o, at("modular", 2)],
   [21, 0.5, "power3.inOut", at("price")], [22, 1, o, at("price", 0.5)], [23, 0.5, o, at("price", 1.5)], [24, 2, o, at("price", 2)]]
    .forEach(([v, d, e, t]) => to({ cam: v, duration: d, ease: e }, t));
  // In the map section the camera does not follow and snaps straight to the anchor
  to({ lerpI: 0, duration: 1e-5 }, at("map", 1)); to({ lerpI: 1, duration: 0.001 }, at("design", 1));
  // Globe rotation · opacity · stars
  to({ eRy: 0, duration: 0.5, ease: "power2.inOut" }, 2.75);
  to({ eRx: 0.7, eRy: 0.5, duration: 0.5, ease: "power3.inOut" }, at("map", 0.3));
  to({ eRx: 0, duration: 0.1, ease: "power2.inOut" }, at("map", 1.5));
  to({ eRy: 3, duration: 0 }, at("design"));
  to({ eRy: 0.4, duration: 0.8, ease: "power3.inOut" }, at("spaceops", -1));
  to({ eRy: -2, duration: 1, ease: "power3.inOut" }, at("encryption", 1));
  to({ albedo: 1, duration: 0.6, ease: o }, at("map", -0.5)); to({ albedo: 0, duration: 0.1, ease: o }, at("map", 1.5));
  to({ eO: 0, duration: 0.1, ease: "power2.inOut" }, at("map", 0.75)); to({ eO: 1, duration: 0.3, ease: "power2.inOut" }, at("deployed", -0.6));
  to({ sky: 0, duration: 1, ease: "power2.inOut" }, at("map", 0.25)); to({ sky: 1, duration: 0.5, ease: "power2.inOut" }, at("launch", 1));
  to({ letters: 1, duration: 1.2, ease: o }, at("encryption")); to({ letters: 0, duration: 0.5, ease: o }, at("encryption", 1.2));
  // Constellation orbit
  to({ trailVis: 1, duration: 0.1 }, 1); to({ trails: 1, duration: 0.2, ease: o }, 1); to({ trailCount: 1, duration: 2, ease: "power2.inOut" }, 1.6);
  to({ trails: 0, duration: 0.5, ease: o }, 3); to({ trailVis: 0, duration: 0.1 }, at("map", 0.25));
  to({ trailVis: 1, duration: 0.1 }, at("modular")); to({ trails: 1, duration: 0.5, ease: o }, at("modular", 0.1));
  to({ trailCount: 0, duration: 0.2, ease: "power2.inOut" }, at("price", 1)); to({ trailCount: 1, duration: 0.8, ease: "power2.inOut" }, at("price", 1.2));
  // Zoomed map
  to({ capt: 1, duration: 0.02, ease: "power2.out" }, at("map", 0.74)); to({ czoom: 1, duration: 0.5, ease: "power3.out" }, at("map", 0.74));
  to({ capt: 0, duration: 0.6, ease: "power2.inOut" }, at("design", -0.7)); to({ cdecay: 1, duration: 0.3, ease: "power2.in" }, at("design"));
  // Satellite
  to({ satV: 0, duration: 0.1, ease: o }, 2); to({ satPoint: 1, duration: 0.1 }, 3);
  to({ build: 0, duration: 0.1 }, at("map")); to({ satS: 2, duration: 0.5, ease: "power2.inOut" }, at("map"));
  to({ satRz: 0, duration: 0.1, ease: "power2.inOut" }, at("design", -1.5));
  to({ satV: 1, duration: 0.1, ease: "power2.inOut" }, at("design", -0.5));
  to({ drawV: 1, duration: 0.8, ease: o }, at("design", -0.3)); to({ drawV: 0, duration: 0.2, ease: o }, at("design", 1.4)); to({ drawX: -0.7, duration: 0.2, ease: "power2.inOut" }, at("design", 1.4));
  to({ build: 1, duration: 1.3, ease: "none" }, at("design", 0.6));
  to({ stowed: 0, duration: 0.2, ease: "power2.inOut" }, at("design", 1.2)); to({ stowed: 1, duration: 0.5, ease: "power2.inOut" }, at("design", 1.6));
  to({ grid: 0.5, duration: 0.4, ease: "power2.inOut" }, at("design")); to({ grid: 1, duration: 0.2, ease: "power2.inOut" }, at("design", 1.2)); to({ grid: 0, duration: 0.2, ease: "power2.inOut" }, at("launch", 0.2));
  to({ gridDecay: 0, duration: 0.2, ease: "power2.out" }, at("design", 0.1)); to({ gridDecay: 0.4, duration: 0.2, ease: "power2.inOut" }, at("design", 0.5)); to({ gridDecay: 0.8, duration: 0.2, ease: "power2.inOut" }, at("design", 1.4));
  to({ gridDecay: 1.2, duration: 0.4, ease: "power2.in" }, at("launch", 0.1)); to({ gridDecay: 1.6, duration: 0.4, ease: "power2.in" }, at("launch", 0.3));
  // Rocket
  to({ fV: 1, duration: 0.01 }, at("launch", -1.1)); to({ fV: 0, duration: 0.1 }, at("deployed", 1));
  to({ storeA: 1, duration: 0.4, ease: "power2.inOut" }, at("launch")); to({ fus: 1, duration: 0.5, ease: "power2.inOut" }, at("launch", 0.1));
  to({ storeEx: 0, duration: 0.6, ease: "power1.out" }, at("launch", -0.1));
  to({ satRz: -Math.PI * 0.5, duration: 0.3, ease: "power2.inOut" }, at("launch"));
  to({ tubeY: -1.3328, duration: 0.4, ease: "power3.inOut" }, at("launch"));
  to({ p1z: 0, p2z: 0, duration: 0.2, ease: "power3.inOut" }, at("launch", 0.3));
  to({ satDock: 1, duration: 0.2, ease: "power2.inOut" }, at("launch", 0.2));
  to({ ftrails: 1, duration: 0.2, ease: "power2.inOut" }, at("launch", 0.5));
  to({ fY: 8, duration: 0.715, ease: o }, at("launch", 0.5));
  to({ wiggle: 1, duration: 0.2, ease: "power2.inOut" }, at("launch", 0.5)); to({ wiggle: 0, duration: 0.4, ease: "power2.inOut" }, at("launch", 1));
  to({ fRy: -Math.PI * 1.7, duration: 1.2, ease: "power2.inOut" }, at("launch", 0.5)); to({ fS: 0.5, duration: 1.2, ease: "power1.inOut" }, at("launch", 0.5));
  to({ p1rx: Math.PI * 0.4, p1rz: -Math.PI * 0.3, p1ry: -Math.PI * 0.4, p1pz: 4, duration: 1.5, ease: "power2.out" }, at("launch", 1.2));
  to({ p2rx: -Math.PI * 0.2, p2rz: Math.PI * 0.2, p2pz: -3.5, duration: 1.5, ease: "power2.out" }, at("launch", 1.2));
  to({ satPoint: 2, duration: 0.01 }, at("launch", 1.2)); to({ satDock: 0, duration: 0.38, ease: "power2.inOut" }, at("launch", 1.24));
  to({ satV: 1, duration: 0.1 }, at("deployed", -0.5));
  to({ satRz: -Math.PI, duration: 0.3, ease: "power2.inOut" }, at("deployed", -0.6));
  to({ stowed: 0, duration: 0.3, ease: "power3.inOut" }, at("deployed", -0.45));
  to({ fus: 0, storeA: 0, duration: 0.3, ease: "power2.inOut" }, at("deployed", -0.5)); to({ ftrails: 0, duration: 0.2, ease: "power2.inOut" }, at("deployed", -0.6));
  // Operations — globe ring and gauge frame
  to({ opsV: 1, duration: 0.1 }, at("spaceops", -1)); to({ opsV: 0, duration: 0.1 }, at("encryption", 0.5));
  to({ frame: 1, duration: 1, ease: "power3.inOut" }, at("spaceops")); to({ frame: 0, duration: 1, ease: "power3.inOut" }, at("encryption"));
  to({ opsP: 1, duration: 4, ease: "none" }, at("spaceops", -0.5)); to({ opsO: 0, duration: 0.1 }, at("encryption", 0.1));
  to({ satRx: Math.PI * 0.3, satRy: -Math.PI * 0.2, satRz: Math.PI * 1.1, duration: 0.1, ease: "power2.inOut" }, at("encryption"));
  // Stretch out · peek in
  to({ swarmV: 1, duration: 0.01 }, at("modular", -0.8)); to({ swarmP: 1, duration: 1.8, ease: "power3.out" }, at("modular", -0.7)); to({ swarmV: 0, duration: 0.1 }, at("modular", 0.8));
  to({ satRx: Math.PI * 0.2, satRy: -Math.PI * 0.25, satRz: Math.PI * 1.1, duration: 1, ease: "power2.inOut" }, at("modular"));
  to({ cables: 1, duration: 0.01 }, at("modular"));
  to({ inside: 1, duration: 0.5, ease: "power2.inOut" }, at("modular", 1)); to({ modules: 1, duration: 0.8, ease: "power2.inOut" }, at("modular", 1.2));
  to({ modules: 0, duration: 0.5, ease: "power2.inOut" }, at("modular", 2.3)); to({ inside: 0, duration: 0.5, ease: "power2.inOut" }, at("modular", 3));
  to({ satV: 0, duration: 0.1, ease: "power2.inOut" }, at("price", 0.2));
  // Cost section — dot globe (exactly the spot the previous student read from the original picture)
  to({ dots: 0.6, duration: 1, ease: o }, at("price")); to({ dots: 1, duration: 1, ease: o }, at("price", 1));
  // Original uFadeToBlack — from the second-to-last frame (P 22), .4 long with power2.out
  tl.fromTo(st, { fade: 0 }, { fade: 1, duration: 0.4, ease: "power2.out", immediateRender: false }, 22);
  tl.add(() => {}, 24);

  let P = 0, trailsAmt = 0.6, pulse = 0, docked = 0;
  const fPos = FALCON.clone();
  const camPos = new T.Vector3(), camQ = new T.Quaternion(), tPos = new T.Vector3(), tQ = new T.Quaternion(), qa = new T.Quaternion(), qb = new T.Quaternion(), va = new T.Vector3();
  const mouse = new T.Vector2(), mouseRaw = new T.Vector2(), camMouse = new T.Vector2();
  addEventListener("mousemove", (e) => mouseRaw.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1));
  const setCam = (snap, dt) => {
    const refs = small() ? CAM_MB : CAM_DK;
    const c = Math.min(refs.length - 1.0001, Math.max(0, st.cam)), n = Math.floor(c), f = c - n;
    tPos.set(refs[n][0], refs[n][1], refs[n][2]).lerp(va.set(refs[n + 1][0], refs[n + 1][1], refs[n + 1][2]), f);
    qa.set(refs[n][3], refs[n][4], refs[n][5], refs[n][6]); qb.set(refs[n + 1][3], refs[n + 1][4], refs[n + 1][5], refs[n + 1][6]);
    tQ.slerpQuaternions(qa, qb, !small() && ROT_EASE[n] ? ROT_EASE[n](f) : f);
    // Original: follows the target at dt×10, and in the map section (lerpIntensity 0) snaps right on
    const k = snap ? 1 : Math.min(1, 1 * (1 - st.lerpI) + dt * 10 * st.lerpI);
    camPos.lerp(tPos, k); camQ.slerp(tQ, k);
    camera.position.copy(camPos); camera.quaternion.copy(camQ);
    camera.translateX(camMouse.x * 0.001); camera.translateY(camMouse.y * 0.001);
    if (small()) camera.translateZ(2);
  };

  const resize = () => {
    const w = innerWidth, h = innerHeight, aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    // Original field-of-view correction — widen for narrow screens, narrow for very wide screens
    camera.fov = 12 / (Math.min(1, aspect * 1.5) * Math.max(1, aspect / 1.77));
    camera.updateProjectionMatrix();
    U.uAspect.value = aspect;
  };
  addEventListener("resize", resize);
  resize();

  const tmp = new T.Vector3(), tmp2 = new T.Vector3(), sq = new T.Quaternion(), dq = new T.Quaternion(), ds = new T.Vector3(), dp = new T.Vector3();
  const euler = new T.Euler();
  let last = performance.now(), first = true;
  const render = (now) => {
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000)); last = now;
    U.uTime.value += dt;
    tl.seek(P);
    // Scene mouse follows at dt×.5 (zoom map), camera shake follows at dt×.2
    mouse.lerp(mouseRaw, Math.min(1, dt * 0.5)); U.uMouse.value.copy(mouse);
    camMouse.lerp(mouseRaw, Math.min(1, dt * 0.2));
    setCam(first, dt); first = false;

    // Globe — follows the target rotation at min(.9, dt×10)
    const ek = Math.min(0.9, dt * 10);
    earth.rotation.x += (st.eRx - earth.rotation.x) * ek;
    earth.rotation.y += (st.eRy + U.uTime.value * 0.004 - earth.rotation.y) * ek;
    U.uEarthOpacity.value = st.eO; U.uAlbedo.value = st.albedo; U.uDots.value = st.dots; U.uLetters.value = st.letters; U.uSky.value = st.sky;
    earth.visible = st.eO > 0.01; sky.visible = st.sky > 0.01;

    // Rocket
    falcon.visible = st.fV > 0.5;
    // Original: the rocket follows the world position (y −2.25 → 8) at min(.9, dt×10), and the shake is sin · cos(t×100)×.01 on x · z
    const th = Math.min(0.9, dt * 10);
    fPos.lerp(tmp.set(FALCON.x, st.fY, FALCON.z), th);
    falcon.position.copy(fPos);
    falcon.position.x += Math.sin(U.uTime.value * 100) * st.wiggle * 0.01; falcon.position.z += Math.cos(U.uTime.value * 100) * st.wiggle * 0.01;
    falcon.rotation.y = st.fRy; falcon.scale.setScalar(0.7405 * st.fS);
    tube.position.y = st.tubeY;
    p1.position.z = st.p1z + st.p1pz; p1.rotation.set(st.p1rx, st.p1ry, st.p1rz);
    p2.position.z = st.p2z + st.p2pz; p2.rotation.set(st.p2rx, 0, st.p2rz);
    fusMat.opacity = st.fus * 0.12; fusLine.opacity = Math.max(st.fus, st.storeA) * 0.45;
    storeMat.opacity = st.storeA;
    store.forEach((s, k) => s.position.set(Math.sin(k * 2.1) * 1.4 * st.storeEx, 0.6 + k * 0.32 + k * 0.5 * st.storeEx, Math.cos(k * 2.1) * 1.4 * st.storeEx));
    ftMat.opacity = st.ftrails * 0.55; fTrails.visible = st.ftrails > 0.01;
    falcon.updateMatrixWorld(true);

    // Satellite — between three anchor points (satPoint 0→1→2), position inside the rocket (satDock)
    // Original: the anchor is not blended but moved to a rounded position, and the load value follows the target by min(.9, dt×10) (immediately if the target is 1)
    const sp = SATP[Math.round(Math.min(2, Math.max(0, st.satPoint)))];
    tmp.copy(sp.p); sq.copy(sp.q);
    let sc = sp.s;
    docked -= (docked - st.satDock) * th; if (st.satDock >= 1) docked = 1;
    if (docked > 0) { dock.matrixWorld.decompose(dp, dq, ds); tmp.lerp(dp, docked); sq.slerp(dq, docked); }
    sat.position.copy(tmp); sat.quaternion.copy(sq); sat.scale.setScalar(sc * (1 + pulse * 0.04));
    const m = sat.children[0];
    m.rotation.set(st.satRx, st.satRy + Math.sin(U.uTime.value * 0.2) * 0.03, st.satRz); m.scale.setScalar(st.satS);
    pulse *= 0.92;
    sat.userData.set({ deployed: 1 - st.stowed, build: st.build, opacity: st.satV, inside: st.inside, modules: st.modules, cables: st.cables * st.inside });
    drawSat.position.copy(SATP[1].p).add(tmp2.set(st.drawX, 0, 0)); drawSat.scale.setScalar(SATP[1].s * 2); drawSat.children[0].rotation.set(0, 0, 0);
    drawSat.userData.set({ deployed: 1, wire: 1, opacity: st.drawV });

    gridMat.uniforms.uO.value = st.grid; gridMat.uniforms.uDecay.value = st.gridDecay; grid.visible = st.grid > 0.01;

    // Constellation orbit
    fleet.visible = st.trailVis > 0.5 && st.trails > 0.01;
    ringMat.opacity = st.trails * 0.22; trailMat.opacity = st.trails * 0.7 * st.trailCount;
    smallSats.forEach((s) => {
      s.a += dt * s.speed;
      s.s.position.set(Math.cos(s.a) * s.r, 0, Math.sin(s.a) * s.r);
      s.s.rotation.y = -s.a;
      s.s.visible = fleet.visible;
      s.s.getWorldPosition(tmp);
      const on = fleet.visible && s.k / smallSats.length < trailsAmt * st.trailCount;
      const pos = s.trail.geometry.attributes.position;
      tmp2.copy(tmp).sub(earth.position).normalize().multiplyScalar(R).add(earth.position);
      pos.setXYZ(0, tmp.x, tmp.y, tmp.z); pos.setXYZ(1, on ? tmp2.x : tmp.x, on ? tmp2.y : tmp.y, on ? tmp2.z : tmp.z); pos.needsUpdate = true;
      s.trail.visible = on;
    });

    // Operations
    ops.visible = st.opsV > 0.5;
    opsRingMat.opacity = 0.5 * st.opsO;
    const oa = 0.9 + st.opsP * 1.6;
    opsSat.position.set(Math.cos(oa) * 5.368, 0, Math.sin(oa) * 5.368); opsSat.rotation.y = -oa;
    opsSat.userData.set({ deployed: 1, opacity: st.opsO });
    station.position.set(Math.cos(oa - 0.35) * R, 0, Math.sin(oa - 0.35) * R); station.material.opacity = st.opsO;
    const ol = opsLineG.attributes.position; ol.setXYZ(0, opsSat.position.x, 0, opsSat.position.z); ol.setXYZ(1, station.position.x, 0, station.position.z); ol.needsUpdate = true;
    opsLineMat.opacity = st.opsO * (0.4 + 0.4 * Math.sin(U.uTime.value * 6));
    U.uFrame.value = st.frame; hud.visible = st.frame > 0.01;

    // Extending — spreads in a half circle around the end satellite
    swarm.forEach((s, i) => {
      s.visible = st.swarmV > 0.5;
      const a = (i / 8) * Math.PI * 2 + 0.4, r = 0.25 + 1.1 * st.swarmP;
      s.position.copy(SATP[2].p).add(tmp.set(Math.cos(a) * r, Math.sin(a) * r * 0.55, Math.sin(a) * r * 0.4 - 0.2 * st.swarmP));
      s.quaternion.copy(SATP[2].q);
    });

    capt.material.uniforms.uCapt.value = st.capt; capt.visible = st.capt > 0.01;
    U.uCaptZoom.value = st.czoom; U.uGrid.value = st.czoom * (1 - st.cdecay);

    canvas.style.opacity = String(1 - st.fade);
    renderer.render(scene, camera);
  };

  // Shaders are precompiled at setup — so the first scroll doesn’t stall
  scene.traverse((o) => { o.userData._v = o.visible; o.visible = true; });
  renderer.compile(scene, camera);
  scene.traverse((o) => { o.visible = o.userData._v; });
  gsap.ticker.add(() => render(performance.now()));

  window.ESScene = {
    get progress() { return P; },
    setProgress: (p) => (P = p),
    setTrails: (v) => (trailsAmt = v),
    pulse: () => (pulse = 1),
    mix: (v) => (U.uMix.value = v),
  };
})();
