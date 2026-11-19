// First page: one machine fixed on screen (three.js basic shapes) is rotated by scroll, recolored, and disassembled then rebuilt.
// The original uses a GLB model + spotlight shadow — here we build the box frame, piston, gears, planetary gear and pipe by hand, and the projection room wall is drawn in DOM.
(() => {
  const { gearPath, cogSvg } = LG;
  const D2R = Math.PI / 180;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
  const isMobile = () => innerWidth <= 820;

  document.querySelectorAll('.cogwrap').forEach((el) => (el.innerHTML = cogSvg()));

  // ---------- Renderer·lights ----------
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const hemi = new THREE.HemisphereLight(0xf2eee8, 0x6d6a65, 1.6);
  const sun = new THREE.DirectionalLight(0xfff4e8, 2.2);
  sun.position.set(-3, 6, 4);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(4, 2, 3);
  scene.add(hemi, sun, fill);

  // Line-art view: faces filled with paper color + ink lines only on edges bent more than 20°. Paper and ink colors change per layer
  const kf = (name) => new THREE.Color(LG.css(name));
  const PAPER_HERO = kf('--kf-bg'), INK_HERO = kf('--kf-ink');
  const PAPER_X = kf('--site-paper-x'), INK_X = kf('--site-ink-x');
  const THEME = { paper: PAPER_HERO.clone(), ink: INK_HERO.clone() };
  const LAYER_THEMES = [
    { paper: kf('--site-yellow'), ink: kf('--kf-ink') },
    { paper: kf('--kf-accent'), ink: kf('--site-ink-teal') },
    { paper: kf('--kf-contrast-bg'), ink: kf('--site-ink-mint') },
    { paper: PAPER_HERO.clone(), ink: INK_HERO.clone() },
  ];
  const fillMat = new THREE.MeshBasicMaterial({ color: PAPER_HERO, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const lineMat = new THREE.LineBasicMaterial({ color: INK_HERO });
  const STEEL = new THREE.Color(0xc2bdb3), DARKSTEEL = new THREE.Color(0x9c978e), NIGHT = new THREE.Color(0x1d2120);
  const steel = new THREE.MeshStandardMaterial({ color: STEEL, roughness: 0.62 });
  const dark = new THREE.MeshStandardMaterial({ color: DARKSTEEL, roughness: 0.62 });

  const recs = [];
  // Round parts (tube·piston·shaft) have no edge lines so they vanish in the line drawing — an outline is made with a slightly larger shell painted only on the back face
  const hullMat = new THREE.MeshBasicMaterial({ color: INK_HERO, side: THREE.BackSide });
  function part(geo, mat, parent, r = 0) {
    const mesh = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), lineMat);
    edges.visible = false;
    mesh.add(edges);
    if (r) { const hull = new THREE.Mesh(geo, hullMat); const k = 1 + 0.008 / r; hull.scale.set(k, 1, k); mesh.add(hull); edges.hull = hull; hull.visible = false; }
    recs.push({ mesh, edges, solid: mat });
    parent.add(mesh);
    return mesh;
  }
  const { gearGeo, ringGeo, carrierGeo } = LG3D;
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r, h, n = 20, open = false) => new THREE.CylinderGeometry(r, r, h, n, 1, open);

  // ---------- Machine: a box frame with side 2 + its insides ----------
  const machine = new THREE.Group();
  scene.add(machine);
  const frameParts = [], boltGroups = [], drive = [];
  const F = 0.93;
  const addFrame = (geo, x, y, z, dx, dy, dz, mat = steel) => {
    const o = part(geo, mat, machine); o.position.set(x, y, z);
    frameParts.push({ obj: o, p0: o.position.clone(), dir: new THREE.Vector3(dx, dy, dz), u: 0, lu: -1 });
  };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addFrame(box(0.14, 1.62, 0.14), sx * F, 0, sz * F, sx * 1.3, 0.1, sz * 1.3);
  for (const y of [-1, 1]) for (const s of [-1, 1]) {
    addFrame(box(1.6, 0.12, 0.12), 0, y * 0.94, s * F, 0, y * 0.7, s * 1.5);
    addFrame(box(0.12, 0.12, 1.6), s * F, y * 0.94, 0, s * 1.5, y * 0.7, 0);
  }
  for (const sx of [-1, 1]) for (const y of [-1, 1]) for (const sz of [-1, 1]) addFrame(box(0.26, 0.26, 0.26), sx * F, y * 0.94, sz * F, sx * 1.8, y * 1.2, sz * 1.8, dark);
  addFrame(box(1.66, 0.04, 1.66), 0, -0.9, 0, 0, -1.4, 0, dark);
  // Screw: 8 above and below the corner blocks + 8 above and below the beam center
  const addBolt = (x, y, z, n) => {
    const o = part(cyl(0.045, 0.06, 6), dark, machine); o.position.set(x, y, z);
    boltGroups.push({ obj: o, p0: o.position.clone(), n, u: 0, lu: -1 });
  };
  for (const sx of [-1, 1]) for (const y of [-1, 1]) for (const sz of [-1, 1]) addBolt(sx * F, y * 1.1, sz * F, y);
  for (const y of [-1, 1]) for (const s of [-1, 1]) { addBolt(0, y * 1.03, s * F, y); addBolt(s * F, y * 1.03, 0, y); }

  const addDrive = (obj, a1, a2, s1, s2, label) => {
    const d = { obj, p0: obj.position.clone(), a1: new THREE.Vector3(...a1), a2: new THREE.Vector3(...a2), s1, s2, u1: 0, u2: 0, label };
    drive.push(d); return d;
  };
  // Top: planetary gear (fixed inner toothed ring + sun + three planets + three-arm carrier)
  const PM = 0.0278, PY = 0.8;
  const ring = part(ringGeo(0.6, 36, PM, 0.07), steel, machine); ring.rotation.x = -Math.PI / 2; ring.position.y = PY;
  addDrive(ring, [0, 1.6, 0], [0, 0, 0], 0.7, 0, 'Role Name 01');
  const sunG = part(gearGeo(12, PM, 0.09, 0.03), dark, machine); sunG.rotation.x = -Math.PI / 2; sunG.position.y = PY;
  const sunD = addDrive(sunG, [0, 0.75, 0], [0, 0, 0], 0.3, 0, 'Role Name 02');
  const planets = [0, 1, 2].map((i) => {
    const g = part(gearGeo(12, PM, 0.08, 0.025), steel, machine); g.rotation.x = -Math.PI / 2; g.position.y = PY;
    const a = i * 2 * Math.PI / 3;
    const d = addDrive(g, [0, 1.05, 0], [Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5], 0.45, 0.6 + i * 0.1, i === 0 ? 'Role Name 03' : null);
    d.orbit = { r: PM * 24 / 2, a0: a }; return d;
  });
  const carrier = part(carrierGeo(0.33, 0.1, 0.04), dark, machine); carrier.rotation.x = -Math.PI / 2; carrier.position.y = PY + 0.08;
  const carD = addDrive(carrier, [0, 1.35, 0], [0, 0, 0], 0.55, 0, 'Role Name 04');
  // Front (+z) inside: three meshed gears
  const GM = 0.026, GZ = 0.72;
  const g1 = { z: 30, x: 0.22, y: -0.28 }, g2 = { z: 14 }, g3 = { z: 20 };
  Object.assign(g2, LG.place(GM, g1, g2, 145)); Object.assign(g3, LG.place(GM, g2, g3, 75));
  const trains = [g1, g2, g3].map((g, i) => {
    const o = part(gearGeo(g.z, GM, 0.06, GM * g.z * 0.14), i === 1 ? dark : steel, machine); o.position.set(g.x, g.y, GZ - i * 0.07);
    return addDrive(o, [0, 0, 1.1 + i * 0.35], [0.25 * (i - 1), 0, 0], 0.15 + i * 0.12, 0.2, i === 0 ? 'Role Name 05' : i === 2 ? 'Role Name 06' : null);
  });
  // Right (+x) inside: a pair of big and small gears (axis is x)
  const s1 = { z: 24, x: -0.05, y: 0.15 }, s2 = { z: 12 };
  Object.assign(s2, LG.place(GM, s1, s2, -40));
  const sides = [s1, s2].map((g, i) => {
    const o = part(gearGeo(g.z, GM, 0.07, 0.03), i ? dark : steel, machine); o.rotation.y = Math.PI / 2; o.position.set(0.72, g.y, -g.x);
    return addDrive(o, [1.2 + i * 0.3, 0, 0], [0, 0.2, 0], 0.25, 0.4, i ? null : 'Role Name 07');
  });
  // Bottom: crankshaft + three pistons + cylinder block + connecting rods
  const crank = new THREE.Group(); crank.position.set(0, -0.55, -0.15); machine.add(crank);
  part(cyl(0.045, 1.5, 16), dark, crank, 0.045).rotation.z = Math.PI / 2;
  const PX = [-0.42, 0, 0.42];
  PX.forEach((x, i) => { const w = part(box(0.06, 0.22, 0.12), steel, crank); w.position.set(x + 0.06, 0, 0); w.rotation.x = i * 2 * Math.PI / 3; });
  const crankD = addDrive(crank, [0, -0.9, 0], [-0.4, 0, 0], 0.5, 0.2, 'Role Name 08');
  const pistons = PX.map((x, i) => {
    const sleeve = part(cyl(0.14, 0.4, 24, true), steel, machine, 0.14); sleeve.position.set(x, 0.05, -0.15);
    addDrive(sleeve, [0, 1.0, 0], [x * 0.7, 0, -0.3], 0.35 + i * 0.08, 0.5, null);
    const p = part(cyl(0.12, 0.2, 24), dark, machine, 0.12); p.position.set(x, -0.05, -0.15);
    const pd = addDrive(p, [0, 0.55, 0], [x * 1.4, 0, 0.5], 0.6 + i * 0.08, 0.7, i === 1 ? 'Role Name 09' : null);
    const rod = part(box(0.04, 0.34, 0.04), steel, machine); rod.position.set(x, -0.32, -0.15);
    const rd = addDrive(rod, [0, 0.2, 0], [x * 1.4, -0.3, 0.5], 0.7, 0.75, null);
    pd.phase = rd.phase = i * 2 * Math.PI / 3; pd.kind = 'piston'; rd.kind = 'rod';
    return pd;
  });
  // Pipe: a long hose coming into the box from behind (-z) with segment rings
  const PIPE = { u: 0 };
  const pipe = new THREE.Group(); pipe.position.set(-0.2, 0.18, 0); machine.add(pipe);
  const tube = part(cyl(0.12, 7, 24, true), steel, pipe, 0.12); tube.rotation.x = Math.PI / 2; tube.position.z = -4.45;
  for (let i = 0; i < 9; i++) { const c = part(cyl(0.15, 0.07, 24), dark, pipe, 0.15); c.rotation.x = Math.PI / 2; c.position.z = -1.3 - i * 0.72; }
  // Rainbow band flowing along the tube (scene 4)
  const bandCv = document.createElement('canvas'); bandCv.width = 8; bandCv.height = 512;
  const bx = bandCv.getContext('2d');
  const BAND = ['#e8705a', '#f2c14e', '#9fd36b', '#3fb0a9', '#5aa9e8', '#8a6bd6', '#e86ba8', '#f2c14e', '#3fb0a9', '#e8705a']; /* Not skin: rainbow band where the tech stack flows in — the many colors are the content of the scene */
  BAND.forEach((c, i) => { bx.fillStyle = c; bx.fillRect(0, i * 51.2, 8, 51.2); bx.fillStyle = '#fff'; bx.fillRect(2, i * 51.2 + 22, 4, 6); }); /* Not skin: white ticks on the rainbow band — part of the band drawing */
  const bandTex = new THREE.CanvasTexture(bandCv); bandTex.wrapS = bandTex.wrapT = THREE.RepeatWrapping; bandTex.repeat.set(1, 4);
  const band = new THREE.Mesh(cyl(0.13, 6.4, 24, true), new THREE.MeshBasicMaterial({ map: bandTex, transparent: true, opacity: 0, depthWrite: false }));
  band.rotation.x = Math.PI / 2; band.position.z = -4.15; band.visible = false; pipe.add(band);
  // The projection room’s box is a closed black box: five face panels (visible only in the projection room)
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x241f1c, roughness: 0.8, transparent: true, opacity: 0 });
  const panels = new THREE.Group(); machine.add(panels);
  [[0, 0, F, 0], [0, 0, -F, Math.PI], [F, 0, 0, Math.PI / 2], [-F, 0, 0, -Math.PI / 2]].forEach(([x, y, z, ry]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), panelMat); m.position.set(x, y, z); m.rotation.y = ry; panels.add(m);
  });
  const lid = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), panelMat); lid.rotation.x = -Math.PI / 2; lid.position.y = 0.9; panels.add(lid);
  panels.visible = false;
  // Yellow light inside the box, lit only in the projection room
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.4), new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0 }));
  glow.position.set(0.45, -0.5, 0.96); machine.add(glow);

  // ---------- Viewpoint ----------
  const VIEW_H = 3.4;
  const KEYS = ['az', 'el', 'tx', 'ty', 'tz', 'zoom', 'fx', 'fy', 'roll'];
  const V = (o) => ({ az: -45, el: 35.264, tx: 0, ty: 0, tz: 0, zoom: 0.72, fx: 0.5, fy: 0.5, roll: 0, ...o });
  const VIEWS = {
    overview: V({ zoom: 0.84 }),
    engine: V({ az: -78, el: 14, ty: -0.4, tz: -0.15, zoom: 1.05, lzoom: 1.4, fx: 0.42 }),
    gears: V({ az: 12, el: 12, tx: 0.1, ty: -0.2, tz: 0.7, zoom: 1.0, lzoom: 1.3, fx: 0.42 }),
    planetary: V({ az: -20, el: 58, ty: 0.9, zoom: 0.9, lzoom: 1.4, fx: 0.42 }),
  };
  const mobileFix = (v, fy = 0.46) => (isMobile() ? { ...v, fx: 0.5, fy, zoom: v.zoom * 0.68 } : v);
  const rig = V({ zoom: 0.84 });
  const LYC = V({}), LY = { b: 0 }, ST = { b: 0, v: 0 }, X = { xb: 0, k: 0, zb: 0, callouts: 0 };
  const PJ = { p: 1, look: 1, light: 0 }, END = { p: 0, look: 0 };
  // Cursor parallax (deg) must be kept apart from the viewpoint tween so it isn’t wiped by the card viewpoint move (overwrite:auto)
  const PAR = { ox: 0, oy: 0 };
  const parX = gsap.quickTo(PAR, 'ox', { duration: 1.2, ease: 'power2.out' }), parY = gsap.quickTo(PAR, 'oy', { duration: 1.2, ease: 'power2.out' });
  addEventListener('pointermove', (e) => {
    if (LG.reduce) return;
    parX((e.clientX / innerWidth - 0.5) * 6); parY(-(e.clientY / innerHeight - 0.5) * 4);
  });
  const projView = () => (isMobile() ? V({ az: -32, el: 16, zoom: 0.3, fx: 0.42, fy: 0.8 }) : V({ az: -32, el: 16, zoom: 0.36, fx: 0.79, fy: 0.76 }));
  const sideView = () => (isMobile() ? V({ az: -90, el: 4, zoom: 0.62, fx: 0.5, fy: 0.5, roll: Math.PI / 2 }) : V({ az: -90, el: 4, zoom: 1.0, fx: 0.6, fy: 0.55 }));
  const xView = () => {
    const base = isMobile() ? V({ zoom: 0.5, fx: 0.5, fy: 0.56 }) : V({ zoom: 0.8, fx: 0.5, fy: 0.52 });
    base.zoom *= (1 - 0.18 * X.k) * (1 + 0.8 * X.zb);
    base.ty = 0.9 * X.zb - 0.1 * X.k;
    return base;
  };
  const lerpV = (a, b, t) => { if (t <= 0) return a; const o = {}; for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * t; return o; };
  let W = 1, H = 1;
  function applyCam(v) {
    const az = v.az * D2R, el = v.el * D2R, R = 20;
    camera.position.set(v.tx + R * Math.cos(el) * Math.sin(az), v.ty + R * Math.sin(el), v.tz + R * Math.cos(el) * Math.cos(az));
    camera.up.set(0, 1, 0);
    camera.lookAt(v.tx, v.ty, v.tz);
    if (v.roll) camera.rotateZ(v.roll);
    const aspect = W / H, hh = VIEW_H * Math.max(1, 0.62 / aspect) / v.zoom / 2, hw = hh * aspect;
    const ox = (v.fx - 0.5) * 2 * hw + (v.sx || 0), oy = (0.5 - v.fy) * 2 * hh + (v.sy || 0);
    camera.left = -hw - ox; camera.right = hw - ox; camera.top = hh - oy; camera.bottom = -hh - oy;
    camera.updateProjectionMatrix();
  }
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    dustCv.width = W; dustCv.height = H;
    drawIdeas();
  }

  // ---------- View mode: solid / line drawing ----------
  let mode = -1, baseMode = 1, inProj = true, inSection = false;
  const modeBtn = document.getElementById('modeBtn');
  function setMode(m) {
    if (m === mode) return;
    mode = m;
    for (const r of recs) { r.mesh.material = m === 1 ? fillMat : r.solid; r.edges.visible = m === 1; if (r.edges.hull) r.edges.hull.visible = m === 1; }
    document.body.classList.toggle('lines', m === 1);
    modeBtn.textContent = baseMode === 1 ? 'View: Wire' : 'View: Solid';
  }
  modeBtn.addEventListener('click', () => { baseMode = baseMode === 1 ? 0 : 1; if (!inProj && !inSection) setMode(baseMode); modeBtn.textContent = baseMode === 1 ? 'View: Wire' : 'View: Solid'; });

  // ---------- Projection room wall (DOM) ----------
  const projEl = document.getElementById('proj'), headEl = document.querySelector('.lg-head');
  const shadowSvg = projEl.querySelector('.pj-shadow');
  const shadowChain = LG.makeChain(shadowSvg, (() => {
    const m = 9, a = { x: -70, y: 10, z: 22, c: 'inherit', hole: 34 }, b = { z: 12, c: 'inherit' }, c = { z: 15, c: 'inherit' }, d = { z: 9, c: 'inherit' };
    Object.assign(b, LG.place(m, a, b, -30)); Object.assign(c, LG.place(m, b, c, 70)); Object.assign(d, LG.place(m, a, d, 200));
    return [a, b, c, d];
  })(), 9, 10);
  shadowSvg.setAttribute('viewBox', '-300 -200 600 400');
  const dustCv = projEl.querySelector('.pj-dust'), dx = dustCv.getContext('2d');
  const dust = Array.from({ length: 140 }, () => ({ t: Math.random(), s: Math.random(), r: 0.6 + Math.random() * 1.4, v: 0.01 + Math.random() * 0.03, ph: Math.random() * 6 }));
  const DUST = LG.css('--site-dust');
  function drawDust(a, time) {
    dx.clearRect(0, 0, W, H);
    if (a < 0.01) return;
    // Inside the wedge spreading from the box (bottom right) to the wall (top center)
    const pv = projView(), ox = W * (pv.fx - 0.03), oy = H * (pv.fy - 0.04);
    for (const p of dust) {
      p.t = (p.t + p.v * 0.016) % 1;
      const ex = W * (0.3 + 0.44 * p.s), ey = H * (0.06 + 0.1 * p.s);
      const x = ox + (ex - ox) * p.t + Math.sin(time * 0.6 + p.ph) * 6, y = oy + (ey - oy) * p.t + Math.cos(time * 0.5 + p.ph) * 6;
      dx.globalAlpha = a * 0.7 * Math.sin(p.t * Math.PI);
      dx.fillStyle = DUST;
      dx.beginPath(); dx.arc(x, y, p.r, 0, 6.283); dx.fill();
    }
    dx.globalAlpha = 1;
  }
  const BG_LIGHT = [LG.css('--site-mute'), LG.css('--site-mute-2')], BG_DARK = [LG.css('--site-proj-bg'), LG.css('--site-proj-bg-2')];
  const _c1 = new THREE.Color(), _c2 = new THREE.Color();
  function applyProjection(p, look, light, time) {
    const l = look * light;
    projEl.style.opacity = (smooth((p - 0.35) / 0.45) * light).toFixed(3);
    projEl.style.visibility = p > 0.36 ? 'visible' : 'hidden';
    drawDust(p > 0.36 ? smooth((p - 0.35) / 0.45) * light : 0, time);
    steel.color.copy(STEEL).lerp(NIGHT, look); dark.color.copy(DARKSTEEL).lerp(NIGHT, look * 0.92);
    sun.intensity = 2.2 * (1 - 0.92 * look); hemi.intensity = 1.6 * (1 - 0.78 * look); fill.intensity = 0.6 * (1 - 0.7 * look);
    glow.material.opacity = mode === 1 ? 0 : smooth((l - 0.4) / 0.5);
    panelMat.opacity = smooth((look - 0.45) / 0.4); panels.visible = panelMat.opacity > 0.01 && mode === 0;
    pipe.visible = look < 0.6;
    const pv = projView();
    projEl.style.setProperty('--bx', (pv.fx * 100).toFixed(1) + '%'); projEl.style.setProperty('--by', (pv.fy * 100).toFixed(1) + '%');
    const root = document.body.style;
    root.setProperty('--bg', '#' + _c1.set(BG_LIGHT[0]).lerp(_c2.set(BG_DARK[0]), look).getHexString());
    root.setProperty('--bg-2', '#' + _c1.set(BG_LIGHT[1]).lerp(_c2.set(BG_DARK[1]), look).getHexString());
    headEl.classList.toggle('dim', look > 0.5);
    const on = p > 0.02;
    if (on !== inProj || mode === -1) {
      inProj = on;
      if (on) setMode(0); else setMode(inSection ? 1 : baseMode);
    }
  }

  // ---------- Scene 4: chips·waves ----------
  const chipsEl = document.getElementById('chips');
  const CHIP_C = ['#61dafb', '#dd0031', '#42b883', '#02569b', '#5fa04e', '#ff2d20', '#512bd4', '#3776ab', '#00add8', '#ff3e00']; /* Not skin: each tech logo slot gets that tech’s symbol color (content) */
  const chips = CHIP_C.map((c, i) => {
    const el = document.createElement('div'); el.className = 'chip'; el.style.setProperty('--c', c);
    el.innerHTML = `<i></i>Logo ${i + 1}`; chipsEl.append(el); return el;
  });
  const ideas = document.getElementById('ideas');
  function drawIdeas() {
    const mob = isMobile(), R = mob ? W * 0.75 : Math.min(H * 0.62, W * 0.42), cx = mob ? W * 0.5 : W + R * 0.32, cy = mob ? H + R * 0.45 : H * 0.5;
    let d = '';
    for (let i = 0; i <= 160; i++) { const a = i / 160 * 2 * Math.PI, r = R * (1 + 0.035 * Math.sin(a * 26)); d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
    const ICONS = ['<rect x="-7" y="-6" width="14" height="12" rx="2"/>', '<circle r="6"/>', '<path d="M-4 -6 L-9 0 L-4 6 M4 -6 L9 0 L4 6"/>', '<path d="M-7 6 L0 -7 L7 6 Z"/>', '<path d="M-7 -3 H7 M-7 3 H7"/>', '<path d="M-6 -6 L6 6 M6 -6 L-6 6"/>'];
    let rings = '';
    [0.42, 0.62, 0.82].forEach((k, ri) => {
      const n = 8 + ri * 5;
      let g = '';
      for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI; g += `<g class="ic" transform="translate(${(R * k * Math.cos(a)).toFixed(1)} ${(R * k * Math.sin(a)).toFixed(1)})">${ICONS[(i + ri) % ICONS.length]}</g>`; }
      rings += `<g class="ring" data-dir="${ri % 2 ? -1 : 1}" data-sp="${0.6 - ri * 0.15}">${g}</g>`;
    });
    ideas.innerHTML = `<path d="${d}" fill="var(--kf-accent)"/><g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})">${rings}</g>`;
  }

  // ---------- Scene 5: leader lines ----------
  const svgEl = document.getElementById('callouts'), NS = 'http://www.w3.org/2000/svg';
  const labelled = drive.filter((d) => d.label).map((d) => {
    const path = document.createElementNS(NS, 'path'), dot = document.createElementNS(NS, 'circle'), t = document.createElementNS(NS, 'text');
    path.setAttribute('pathLength', '1'); path.style.strokeDasharray = '1'; dot.setAttribute('r', '2.5'); t.textContent = d.label;
    svgEl.append(path, dot, t);
    return { d, path, dot, t };
  });
  const _v = new THREE.Vector3();
  const toScreen = (obj) => { obj.getWorldPosition(_v); _v.project(camera); return { x: (_v.x + 1) / 2 * W, y: (1 - _v.y) / 2 * H }; };
  function drawCallouts() {
    const P = X.callouts;
    svgEl.style.visibility = P > 0.001 ? 'visible' : 'hidden';
    if (P <= 0.001) return;
    const pts = labelled.map((L) => ({ L, ...toScreen(L.d.obj) })).sort((a, b) => a.y - b.y);
    const mob = isMobile(), textR = W - (mob ? 16 : 40), gap = mob ? 22 : 34, y0 = H * (mob ? 0.3 : 0.24), tw = mob ? 82 : 118;
    const stg = 0.32, span = 1 + (pts.length - 1) * stg;
    pts.forEach((q, i) => {
      const ry = y0 + i * gap, lx = textR - tw - 10, ex = lx - (mob ? 14 : 40);
      const p = clamp01(P * span - i * stg), draw = smooth(p / 0.7), txt = smooth((p - 0.25) / 0.6), dt = smooth((p - 0.6) / 0.3);
      q.L.path.setAttribute('d', `M${lx.toFixed(1)},${ry.toFixed(1)}H${ex.toFixed(1)}L${q.x.toFixed(1)},${q.y.toFixed(1)}`);
      q.L.path.style.strokeDashoffset = (1 - draw).toFixed(4);
      q.L.dot.setAttribute('cx', q.x.toFixed(1)); q.L.dot.setAttribute('cy', q.y.toFixed(1)); q.L.dot.style.opacity = dt.toFixed(3);
      q.L.t.setAttribute('x', (textR + (1 - txt) * 10).toFixed(1)); q.L.t.setAttribute('y', ry.toFixed(1)); q.L.t.style.opacity = txt.toFixed(3);
    });
  }

  // ---------- Every frame ----------
  const time = { scale: 1, crank: 0, t: 0 };
  const xc0 = document.getElementById('xcount0'), xc1 = document.getElementById('xcount1');
  const pad = (n) => String(n).padStart(2, '0');
  const _ink = new THREE.Color(), _paper = new THREE.Color();
  function frame(_, dtMs) {
    const dt = Math.min(dtMs, 50) / 1000;
    time.t += dt;
    time.crank += dt * 2.2 * time.scale;
    const th = time.crank;
    // Rotating parts: crank, piston, gear, planetary gear
    for (const d of drive) d.obj.position.copy(d.p0).addScaledVector(d.a1, d.u1).addScaledVector(d.a2, d.u2);
    crank.rotation.x = th;
    for (const d of drive) {
      if (d.kind === 'piston') d.obj.position.y += 0.08 * Math.cos(th + d.phase);
      if (d.kind === 'rod') { d.obj.position.y += 0.05 * Math.cos(th + d.phase); d.obj.rotation.x = 0.22 * Math.sin(th + d.phase); }
    }
    const zr = [30, 14, 20];
    trains[0].obj.rotation.z = th * 0.4; trains[1].obj.rotation.z = -th * 0.4 * zr[0] / zr[1] + 0.3; trains[2].obj.rotation.z = th * 0.4 * zr[0] / zr[2];
    sides[0].obj.rotation.x = th * 0.35; sides[1].obj.rotation.x = -th * 0.7 + 0.2;
    const ca = th * 0.12;
    carD.obj.rotation.z = ca; sunD.obj.rotation.z = ca * 4;
    planets.forEach((d) => {
      const a = d.orbit.a0 + ca;
      d.obj.position.x += d.orbit.r * Math.cos(a); d.obj.position.z -= d.orbit.r * Math.sin(a);
      d.obj.rotation.z = -2 * ca;
    });
    // Disassembly: screws unwind 2.5 turns and drop out, frames move outward
    let out0 = 0, out1 = 0;
    for (const g of boltGroups) {
      const u = g.u; if (u >= 0.98) out0++;
      g.obj.position.copy(g.p0); g.obj.position.y += g.n * (0.1 * Math.min(u / 0.7, 1) + 0.9 * smooth((u - 0.7) / 0.3));
      g.obj.rotation.y = -g.n * Math.min(u / 0.7, 1) * 2.5 * 2 * Math.PI;
      const sc = 1 - smooth((u - 0.85) / 0.15); g.obj.scale.setScalar(Math.max(0.001, sc)); g.obj.visible = sc > 0.01;
    }
    for (const f of frameParts) {
      if (f.u >= 0.98) out1++;
      f.obj.position.copy(f.p0).addScaledVector(f.dir, f.u * (1 + 2.2 * smooth((f.u - 0.4) / 0.6)));
      const sc = 1 - smooth((f.u - 0.55) / 0.45); f.obj.scale.setScalar(Math.max(0.001, sc)); f.obj.visible = sc > 0.01;
    }
    pipe.position.z = -2.6 * PIPE.u;
    if (xc0) xc0.textContent = `${pad(out0)} / ${pad(boltGroups.length)} Omission`;
    if (xc1) xc1.textContent = `${pad(out1)} / ${pad(frameParts.length)} Separation`;
    // Scene 4: Band·Chip
    band.visible = ST.v > 0.01; band.material.opacity = ST.v; bandTex.offset.y -= dt * 0.18 * time.scale;
    chipsEl.style.visibility = ST.v > 0.01 ? 'visible' : 'hidden';
    ideas.style.visibility = ST.v > 0.01 ? 'visible' : 'hidden'; ideas.style.opacity = ST.v.toFixed(3);
    ideas.querySelectorAll('.ring').forEach((r) => r.setAttribute('transform', `rotate(${(time.t * 6 * r.dataset.sp * r.dataset.dir).toFixed(2)})`));
    // Color: floor theme → pale paper of the exploded view
    _paper.copy(THEME.paper).lerp(PAPER_X, X.xb); _ink.copy(THEME.ink).lerp(INK_X, X.xb);
    fillMat.color.copy(_paper); lineMat.color.copy(_ink); hullMat.color.copy(_ink);
    document.body.style.setProperty('--paper', '#' + _paper.getHexString());
    // Viewpoint: blend in order hero → floor → side → exploded → projection room, overlapping
    const p = Math.max(PJ.p, END.p), look = Math.max(PJ.look, END.look);
    let v = mobileFix(rig);
    v = lerpV(v, mobileFix({ ...LYC }, 0.36), LY.b);
    v = lerpV(v, sideView(), ST.b);
    v = lerpV(v, xView(), X.xb);
    v = lerpV(v, projView(), p);
    // The original screening-room camera orbits around a point on the wall behind the box, so with parallax the box slides across the screen (16px per sweep · 4 below) —
    // Add our camera orbiting the box center, shifting that share in as a ratio of the box size
    const pw = 1 - 0.5 * X.xb, pa = PAR.ox * (pw + (0.4 - pw) * p), pe = PAR.oy * (pw + (0.3 - pw) * p);
    applyCam({ ...v, az: v.az + pa, el: v.el + pe, sx: -4.2 * p * pa * D2R, sy: -(3.9 * pe + 1.06 * pa) * p * D2R });
    applyProjection(p, look, PJ.p > END.p ? PJ.light : 1, time.t);
    LG.driveChain(shadowChain, time.t * 0.35 * time.scale);
    if (ST.v > 0.01) chips.forEach((el, i) => {
      const s = (time.t * 0.05 + i / chips.length) % 1;
      _v.set(-0.2, -0.17, -6.6 + 5.6 * s); machine.localToWorld(_v); _v.project(camera);
      const x = (_v.x + 1) / 2 * W, y = (1 - _v.y) / 2 * H;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      el.style.opacity = (ST.v * smooth(s / 0.12) * (1 - smooth((s - 0.82) / 0.12))).toFixed(3);
    });
    renderer.render(scene, camera);
    drawCallouts();
  }

  // ---------- Scene 2: cards ----------
  const cards = [...document.querySelectorAll('.card')];
  function openCard(view) {
    cards.forEach((card) => {
      const on = card.dataset.view === view;
      card.classList.toggle('active', on);
      gsap.to(card.querySelector('.body'), { height: on ? 'auto' : 0, opacity: on ? 1 : 0, duration: 0.5, ease: 'power3.inOut', overwrite: true });
    });
  }
  function goTo(view) {
    openCard(view);
    const { lzoom, ...rv } = VIEWS[view];
    gsap.to(rig, { ...rv, duration: 1.6, ease: 'power3.inOut', overwrite: 'auto' });
    gsap.to('.intro', { autoAlpha: view === 'overview' ? 1 : 0, x: view === 'overview' ? 0 : -24, duration: 0.6, ease: 'power2.out' });
  }
  cards.forEach((card) => card.addEventListener('click', () => goTo(card.dataset.view)));
  // 3D control chips: pause · speed (1 → 0.35 → 2) · view
  let playing = true, speed = 1;
  const playBtn = document.getElementById('playBtn'), speedBtn = document.getElementById('speedBtn');
  const setScale = (s) => gsap.to(time, { scale: s, duration: 0.6, ease: 'power2.out' });
  playBtn.addEventListener('click', () => { playing = !playing; playBtn.textContent = playing ? 'Pause' : 'Play'; setScale(playing ? speed : 0); });
  speedBtn.addEventListener('click', () => { speed = speed === 1 ? 0.35 : speed === 0.35 ? 2 : 1; speedBtn.textContent = `Speed ${speed}×`; if (playing) setScale(speed); });

  // ---------- Scroll ----------
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const still = ctx.conditions.still;
    if (still) time.scale = 0;
    Object.assign(LYC, VIEWS.engine, { zoom: VIEWS.engine.lzoom });
    const stg = document.querySelectorAll('.ly-stage');
    const ly = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: '#layers', start: 'top bottom', end: 'bottom bottom', scrub: 0.6,
      onUpdate: (self) => {
        const q = self.progress, k = q < 0.06 || q > 0.95 ? '' : q < 0.36 ? '1' : q < 0.68 ? '2' : '3';
        if (document.body.dataset.layer !== k) document.body.dataset.layer = k;
      } } });
    const theme = (i, at, d) => {
      const t = LAYER_THEMES[i];
      ly.to(THEME.paper, { r: t.paper.r, g: t.paper.g, b: t.paper.b, duration: d }, at).to(THEME.ink, { r: t.ink.r, g: t.ink.g, b: t.ink.b, duration: d }, at);
    };
    const LV = (v) => ({ az: v.az, el: v.el, tx: v.tx, ty: v.ty, tz: v.tz, zoom: v.lzoom, fx: 0.66 });
    Object.assign(LYC, LV(VIEWS.engine));
    ly.to(LY, { b: 1, duration: 0.12, ease: 'power2.inOut' }, 0)
      .to(['#heroUI .intro', '#heroUI .cards', '#heroUI .controls'], { autoAlpha: 0, duration: 0.07 }, 0)
      .fromTo('#layersUI', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, immediateRender: false }, 0.05);
    theme(0, 0.04, 0.07);
    ly.fromTo(stg[0], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.05, immediateRender: false }, 0.09)
      .to(stg[0], { autoAlpha: 0, y: -18, duration: 0.04 }, 0.31)
      .to(LYC, { ...LV(VIEWS.gears), duration: 0.1, ease: 'power2.inOut' }, 0.32);
    theme(1, 0.33, 0.07);
    ly.fromTo(stg[1], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.05, immediateRender: false }, 0.4)
      .to(stg[1], { autoAlpha: 0, y: -18, duration: 0.04 }, 0.63)
      .to(LYC, { ...LV(VIEWS.planetary), duration: 0.1, ease: 'power2.inOut' }, 0.64);
    theme(2, 0.65, 0.07);
    ly.fromTo(stg[2], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.05, immediateRender: false }, 0.72)
      .to('#layersUI', { autoAlpha: 0, duration: 0.05 }, 0.92);
    theme(3, 0.93, 0.07);

    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#stack', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } })
      .to(ST, { b: 1, duration: 0.3, ease: 'power2.inOut' }, 0)
      .to(ST, { v: 1, duration: 0.15 }, 0.22)
      .fromTo('#stackUI', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, immediateRender: false }, 0.24)
      .fromTo('#stackUI .st-in', { y: 18 }, { y: 0, duration: 0.12, immediateRender: false }, 0.24)
      .to('#stackUI', { autoAlpha: 0, duration: 0.1 }, 0.88)
      .to(ST, { v: 0, duration: 0.1 }, 0.9);

    // Scene 1 → 2: turns from the wall to the box. Even a small push carries it all the way in one go (1.1~1.3s)
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#projection', start: 'top top', end: 'bottom top', scrub: 0.6,
      snap: still ? false : { snapTo: [0, 1], duration: { min: 1.1, max: 1.3 }, delay: 0.04, ease: 'power2.inOut', directional: true } } })
      .to(PJ, { p: 0, duration: 0.72, ease: 'power2.inOut' }, 0)
      .to(PJ, { look: 0, duration: 0.22, ease: 'power1.inOut' }, 0.74)
      .to('#projUI', { autoAlpha: 0, duration: 0.28, ease: 'power1.in' }, 0)
      .to('#projUI .pj-in', { y: -24, duration: 0.28, ease: 'power1.in' }, 0)
      .fromTo('#heroWrap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, immediateRender: true }, 0.82);

    // Exploded view (timeline units 0~152): 0–8 viewpoint change, 8–30 screws, 27–36 pipe, 30–52 frame, 52–74 drive unit, 74–88 leader lines, 100–152 reassemble → screening room
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to('#heroUI', { autoAlpha: 0, duration: 4, ease: 'power1.in' }, 0)
      .to(X, { xb: 1, duration: 10, ease: 'power2.inOut' }, 0)
      .to(X, { k: 1, duration: 70, ease: 'sine.inOut' }, 6)
      .to(X, { zb: 1, duration: 7, ease: 'power2.inOut' }, 3)
      .to(X, { zb: 0, duration: 10, ease: 'power2.inOut' }, 19)
      .fromTo('.xcopy', { autoAlpha: 0 }, { autoAlpha: 1, duration: 5, ease: 'power2.out' }, 4)
      .fromTo('.xcopy-in', { y: 18 }, { y: 0, duration: 5, ease: 'power2.out' }, 4);
    const lis = document.querySelectorAll('.xstages li');
    [[8, 29], [30, 51], [52, 101]].forEach(([a, b], i) => {
      tl.fromTo(lis[i], { opacity: 0.3 }, { opacity: 1, duration: 2 }, a);
      if (b <= 100) tl.to(lis[i], { opacity: 0.3, duration: 2 }, b - 1);
    });
    const nb = boltGroups.length, nf = frameParts.length;
    boltGroups.forEach((g, i) => tl.to(g, { u: 1, duration: 8 }, 8 + (i / (nb - 1)) * 13.5));
    tl.to(PIPE, { u: 1, duration: 9 }, 27);
    frameParts.forEach((r, i) => tl.to(r, { u: 1, duration: 8, ease: 'power2.inOut' }, 30.5 + (i / (nf - 1)) * 13));
    drive.forEach((d) => {
      tl.to(d, { u2: 1, duration: 9, ease: 'power2.inOut' }, 52 + d.s2 * 12);
      tl.to(d, { u1: 1, duration: 10, ease: 'power3.inOut' }, 52 + d.s1 * 12);
    });
    tl.to(X, { callouts: 1, duration: 14 }, 74);
    tl.to(X, { callouts: 0, duration: 4 }, 100).to('.xcopy', { autoAlpha: 0, duration: 4 }, 101);
    drive.forEach((d) => tl.to(d, { u1: 0, u2: 0, duration: 9, ease: 'power2.inOut' }, 104 + (1 - d.s1) * 5));
    frameParts.forEach((r, i) => tl.to(r, { u: 0, duration: 7, ease: 'power2.inOut' }, 112 + (1 - i / (nf - 1)) * 5));
    tl.to(PIPE, { u: 0, duration: 6, ease: 'power2.inOut' }, 116);
    boltGroups.forEach((g, i) => tl.to(g, { u: 0, duration: 5 }, 118 + (1 - i / (nb - 1)) * 5));
    tl.to(END, { p: 1, duration: 14, ease: 'power2.inOut' }, 126)
      .to(END, { look: 1, duration: 10, ease: 'power1.inOut' }, 128)
      .fromTo('#endUI', { autoAlpha: 0 }, { autoAlpha: 1, duration: 5, immediateRender: false }, 139)
      .fromTo('#endUI .end-in', { y: 20 }, { y: 0, duration: 5, immediateRender: false }, 139);
    tl.to({}, { duration: 0.001 }, 152);
    ScrollTrigger.create({ trigger: '#deconstruct', start: 'top bottom', end: 'bottom bottom', animation: tl, scrub: 0.6,
      onUpdate: (self) => {
        const on = self.progress > 0.012;
        if (on !== inSection) { inSection = on; if (!inProj) setMode(on ? 1 : baseMode); }
      } });

    // On entry: loader → projector flickers on → text
    const loaderSpan = document.querySelector('#loader span'), cnt = { v: 0 };
    const itl = gsap.timeline();
    itl.to(cnt, { v: 100, duration: still ? 0 : 0.9, ease: 'power1.inOut', onUpdate: () => (loaderSpan.textContent = `Loading engine — ${Math.round(cnt.v)}%`) })
      .to('#loader', { autoAlpha: 0, duration: 0.6 });
    Object.assign(rig, VIEWS.overview, { az: -15, el: 55, zoom: 0.55 });
    itl.to(rig, { ...VIEWS.overview, duration: still ? 0 : 2.4, ease: 'power3.out' }, 0.9);
    if (still) { PJ.light = 1; openCard('overview'); }
    else {
      gsap.timeline({ delay: 1.4 })
        .to(PJ, { light: 0.55, duration: 0.07 }).to(PJ, { light: 0.08, duration: 0.07 })
        .to(PJ, { light: 0.8, duration: 0.06 }).to(PJ, { light: 0.3, duration: 0.1 })
        .to(PJ, { light: 1, duration: 0.7, ease: 'power2.out' })
        .from('#projUI .pj-in > *', { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.8, ease: 'power3.out' }, 0.35);
      itl.from('.intro > *', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 1.5)
        .from('.card', { x: 30, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out' }, 1.7)
        .add(() => openCard('overview'), 1.9);
    }
  });

  document.getElementById('projCta').addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: document.getElementById('hero').offsetTop, behavior: 'smooth' }); });
  document.querySelector('.lg-brand').addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
  addEventListener('resize', resize);
  resize();
  gsap.ticker.add(frame);
})();
