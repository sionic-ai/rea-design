// Rainy neon street 3D scene (three) → entering through wet glass → incoming message → driving HUD.
// The scene is rebuilt with our own shapes (box buildings, light-panel signs, light strips bleeding on the road, box cars, rain). All colors are read from skin variables.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const T = window.THREE;
  const css = getComputedStyle(document.documentElement);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth <= 760;

  // Skin variables (including oklch(from …)) to three colors — painted onto a 1px canvas and read
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const color = (name) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css.getPropertyValue(name).trim() || css.getPropertyValue("--kf-ink").trim();
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.SRGBColorSpace);
  };
  const C = {
    night: color("--site-night"), haze: color("--site-haze"), wall: color("--site-wall"), road: color("--site-road"), window: color("--site-window"),
    ink: color("--kf-ink"), accent: color("--kf-accent"), red: color("--site-red"), lamp: color("--kf-contrast-bg"),
    neon: ["--site-magenta", "--site-cyan", "--site-purple", "--site-green", "--site-red", "--site-violet", "--site-sky", "--kf-accent"].map(color),
  };

  // Seed random — same streets every time it opens
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  const canvas = $(".tp-scene");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new T.Scene();
  scene.background = C.night;
  scene.fog = new T.FogExp2(C.haze, 0.022);
  const camera = new T.PerspectiveCamera(mobile() ? 100 : 65, innerWidth / innerHeight, 0.1, 300);

  // ── Picture panels (drawn by us on canvas) ──
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "white"); g.addColorStop(0.25, "rgba(255,255,255,.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: light bokeh alpha plate (color is multiplied by the material color) */
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  })();
  const streakTex = (() => {
    const c = document.createElement("canvas"); c.width = 32; c.height = 256;
    const x = c.getContext("2d"); const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.35, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: road light band alpha plate */
    x.fillStyle = g; x.fillRect(0, 0, 32, 256);
    const h = x.createLinearGradient(0, 0, 32, 0);
    h.addColorStop(0, "rgba(0,0,0,1)"); h.addColorStop(0.5, "rgba(0,0,0,0)"); h.addColorStop(1, "rgba(0,0,0,1)"); /* Not skin: edge eraser */
    x.globalCompositeOperation = "destination-out"; x.fillStyle = h; x.fillRect(0, 0, 32, 256);
    return new T.CanvasTexture(c);
  })();
  const windowTex = (() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 256;
    const x = c.getContext("2d");
    x.fillStyle = "black"; x.fillRect(0, 0, 128, 256); /* Not skin: window light intensity plate (black = No light) */
    for (let r = 0; r < 16; r++) for (let k = 0; k < 8; k++) {
      const v = rnd();
      if (v < 0.86) continue;
      x.fillStyle = `rgba(255,255,255,${(0.15 + rnd() * 0.5).toFixed(2)})`; /* Not skin: window light intensity */
      x.fillRect(k * 16 + 4, r * 16 + 5, 8, 7);
    }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace;
    return t;
  })();

  // ── One street segment (length 40) — buildings · signs · road light strips · street lamps. When a car passes they move ahead to connect endlessly ──
  const SEG = 40, NSEG = 7;
  const wallMat = (w, h) => {
    const t = windowTex.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 10)));
    return new T.MeshStandardMaterial({ color: C.wall, roughness: 0.92, metalness: 0.05, emissive: C.window, emissiveMap: t, emissiveIntensity: 0.4 });
  };
  const boxGeo = new T.BoxGeometry(1, 1, 1);
  const planeGeo = new T.PlaneGeometry(1, 1);
  const glowMats = new Map();
  const glowMat = (col) => {
    const k = col.getHexString();
    if (!glowMats.has(k)) glowMats.set(k, new T.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false, fog: true }));
    return glowMats.get(k);
  };
  const makeSign = (group, side, z, col) => {
    const x = side * 11.8;
    const kind = rnd();
    const y = 3.5 + rnd() * 9;
    const sign = new T.Group();
    const mat = new T.MeshBasicMaterial({ color: col.clone().multiplyScalar(1.6), toneMapped: false, fog: true });
    let w, h;
    if (kind < 0.35) { // Vertical bar signboard + text cell
      w = 0.9; h = 3 + rnd() * 4;
      const bar = new T.Mesh(boxGeo, mat); bar.scale.set(0.12, h, w); sign.add(bar);
      for (let i = 0; i < Math.floor(h / 0.9); i++) { const g = new T.Mesh(boxGeo, mat); g.scale.set(0.1, 0.5, 0.5); g.position.set(-side * 0.08, h / 2 - 0.6 - i * 0.9, 0); sign.add(g); }
    } else if (kind < 0.7) { // Border sign
      w = 3 + rnd() * 3; h = 1.2 + rnd() * 1.4;
      for (const [sx, sy, px, py] of [[w, 0.12, 0, h / 2], [w, 0.12, 0, -h / 2], [0.12, h, -w / 2, 0], [0.12, h, w / 2, 0]]) {
        const b = new T.Mesh(boxGeo, mat); b.scale.set(0.1, sy, sx); b.position.set(0, py, px); sign.add(b);
      }
      for (let i = 0; i < 4; i++) { const g = new T.Mesh(boxGeo, mat); g.scale.set(0.08, h * 0.4, w * 0.12); g.position.set(0, 0, -w / 2 + w * (0.2 + i * 0.2)); sign.add(g); }
    } else { // Full light panel
      w = 2 + rnd() * 3; h = 0.7 + rnd() * 0.8;
      const p = new T.Mesh(boxGeo, mat); p.scale.set(0.12, h, w); sign.add(p);
    }
    sign.position.set(x - side * 0.2, y, z);
    group.add(sign);
    const glow = new T.Sprite(glowMat(col));
    glow.scale.set(w * 2.6 + 3, h * 2.6 + 3, 1);
    glow.position.set(x - side * 0.8, y, z);
    group.add(glow);
    // Light smeared long across the wet road — a vertically stretched band on the road under the sign
    const refl = new T.Mesh(planeGeo, new T.MeshBasicMaterial({ map: streakTex, color: col, transparent: true, opacity: 0.32, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false, fog: true }));
    refl.rotation.x = -Math.PI / 2;
    refl.scale.set(Math.min(w, 2.4) * 0.7, 6 + y * 1.2, 1);
    refl.position.set(side * (6.5 + rnd() * 2), 0.03, z + 2 + y * 0.4);
    group.add(refl);
  };
  const segments = [];
  const lightCols = [C.neon[0], C.neon[1], C.neon[2], C.neon[3]];
  for (let s = 0; s < NSEG; s++) {
    const g = new T.Group();
    for (const side of [-1, 1]) {
      let z = 0;
      while (z < SEG) {
        const depth = 8 + rnd() * 8, w = 8 + rnd() * 8, h = 16 + rnd() * 46;
        const b = new T.Mesh(boxGeo, wallMat(depth, h));
        b.scale.set(w, h, Math.min(depth, SEG - z));
        b.position.set(side * (12 + w / 2), h / 2, -z - b.scale.z / 2);
        g.add(b);
        const n = 2 + Math.floor(rnd() * 3);
        for (let i = 0; i < n; i++) makeSign(g, side, -z - rnd() * b.scale.z, pick(C.neon));
        // Shop lights, view through a window etc. — dots that look like small bokeh lights behind frosted glass
        for (let i = 0; i < 5; i++) {
          const dot = new T.Sprite(glowMat(rnd() < 0.5 ? C.window : pick(C.neon)));
          const d = 0.6 + rnd() * 1.4;
          dot.scale.set(d, d, 1);
          dot.position.set(side * (11.6 - rnd() * 0.4), 0.8 + rnd() * 14, -z - rnd() * b.scale.z);
          g.add(dot);
        }
        z += b.scale.z;
      }
      // Street lamp — pole, arm, lamp head, light beam
      const lz = -10 - (side > 0 ? 20 : 0);
      const pole = new T.Mesh(boxGeo, new T.MeshStandardMaterial({ color: C.wall, roughness: 0.6 }));
      pole.scale.set(0.18, 7.5, 0.18); pole.position.set(side * 9.6, 3.75, lz); g.add(pole);
      const arm = new T.Mesh(boxGeo, pole.material); arm.scale.set(2.2, 0.14, 0.14); arm.position.set(side * 8.6, 7.4, lz); g.add(arm);
      const head = new T.Mesh(boxGeo, new T.MeshBasicMaterial({ color: C.lamp, toneMapped: false })); head.scale.set(0.9, 0.12, 0.4); head.position.set(side * 7.7, 7.3, lz); g.add(head);
      const hg = new T.Sprite(glowMat(C.lamp)); hg.scale.set(3, 2, 1); hg.position.set(side * 7.7, 7.2, lz); g.add(hg);
      const beam = new T.Mesh(new T.ConeGeometry(1.7, 7.2, 24, 1, true), new T.MeshBasicMaterial({ color: C.lamp, transparent: true, opacity: 0.028, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      beam.position.set(side * 7.7, 3.65, lz); g.add(beam);
    }
    const pl = new T.PointLight(lightCols[s % lightCols.length], 60, 26, 1.6);
    pl.position.set((s % 2 ? 1 : -1) * 7, 5, -SEG / 2);
    g.add(pl);
    g.position.z = -s * SEG + SEG;
    scene.add(g);
    segments.push(g);
  }
  const road = new T.Mesh(planeGeo, new T.MeshStandardMaterial({ color: C.road, roughness: 0.28, metalness: 0.55 }));
  road.rotation.x = -Math.PI / 2; road.scale.set(20, 600, 1); scene.add(road);
  const walkMat = new T.MeshStandardMaterial({ color: C.wall, roughness: 0.7 });
  for (const side of [-1, 1]) { const w = new T.Mesh(boxGeo, walkMat); w.scale.set(4, 0.25, 600); w.position.set(side * 10, 0.12, 0); scene.add(w); }
  const lineMat = new T.MeshBasicMaterial({ color: C.accent.clone().multiplyScalar(0.45), toneMapped: false, fog: true });
  const dashes = new T.InstancedMesh(planeGeo, lineMat, 100);
  const m4 = new T.Matrix4(), q = new T.Quaternion().setFromEuler(new T.Euler(-Math.PI / 2, 0, 0));
  const placeDashes = (z0) => { for (let i = 0; i < 100; i++) { m4.compose(new T.Vector3(0, 0.02, z0 - i * 6), q, new T.Vector3(0.12, 2.4, 1)); dashes.setMatrixAt(i, m4); } dashes.instanceMatrix.needsUpdate = true; };
  placeDashes(20);
  scene.add(dashes);
  scene.add(new T.HemisphereLight(C.neon[2], C.night, 0.35));

  // ── Car (three layered boxes + taillight strip) ──
  const car = new T.Group();
  const paint = new T.MeshStandardMaterial({ color: C.wall.clone().lerp(C.ink, 0.28), metalness: 0.7, roughness: 0.3 });
  const body = new T.Mesh(boxGeo, paint); body.scale.set(2.0, 0.55, 4.4); body.position.y = 0.6; car.add(body);
  const deck = new T.Mesh(boxGeo, paint); deck.scale.set(1.9, 0.18, 1.6); deck.position.set(0, 0.95, 1.2); car.add(deck);
  const cabin = new T.Mesh(boxGeo, new T.MeshStandardMaterial({ color: C.night, metalness: 0.9, roughness: 0.15 })); cabin.scale.set(1.45, 0.42, 1.9); cabin.position.set(0, 1.08, -0.2); car.add(cabin);
  const vent = new T.Mesh(boxGeo, new T.MeshBasicMaterial({ color: C.accent.clone().multiplyScalar(0.8), toneMapped: false })); vent.scale.set(1.2, 0.04, 0.5); vent.position.set(0, 1.06, 1.3); car.add(vent);
  const tailMat = new T.MeshBasicMaterial({ color: C.red.clone().multiplyScalar(2.2), toneMapped: false });
  for (const y of [0.66, 0.56, 0.46]) { const t = new T.Mesh(boxGeo, tailMat); t.scale.set(1.85, 0.035, 0.04); t.position.set(0, y, 2.21); car.add(t); }
  const tailGlow = new T.Sprite(glowMat(C.red)); tailGlow.scale.set(4.6, 1.6, 1); tailGlow.position.set(0, 0.58, 2.4); car.add(tailGlow);
  const tailRefl = new T.Mesh(planeGeo, new T.MeshBasicMaterial({ map: streakTex, color: C.red, transparent: true, opacity: 0.45, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
  tailRefl.rotation.x = -Math.PI / 2; tailRefl.scale.set(1.6, 3.2, 1); tailRefl.position.set(0, 0.03, 3.4); car.add(tailRefl);
  const tyre = new T.MeshStandardMaterial({ color: C.night, roughness: 0.8 });
  const wheelGeo = new T.CylinderGeometry(0.36, 0.36, 0.32, 18);
  for (const [x, z] of [[-0.98, 1.4], [0.98, 1.4], [-0.98, -1.35], [0.98, -1.35]]) { const w = new T.Mesh(wheelGeo, tyre); w.rotation.z = Math.PI / 2; w.position.set(x, 0.36, z); car.add(w); }
  const carLight = new T.PointLight(C.neon[5], 26, 9, 1.4); carLight.position.set(0, 3.2, 2.6); car.add(carLight);
  const carRim = new T.PointLight(C.neon[1], 8, 6, 1.6); carRim.position.set(0, 2.4, -3.5); car.add(carRim);
  scene.add(car);

  // ── Rain streaks ──
  const RAIN = 2200;
  const rainPos = new Float32Array(RAIN * 6);
  const rainSeed = new Float32Array(RAIN * 3);
  for (let i = 0; i < RAIN; i++) { rainSeed[i * 3] = rnd() * 36 - 18; rainSeed[i * 3 + 1] = rnd() * 26; rainSeed[i * 3 + 2] = -rnd() * 70 + 6; }
  const rainGeo = new T.BufferGeometry();
  rainGeo.setAttribute("position", new T.BufferAttribute(rainPos, 3));
  const rain = new T.LineSegments(rainGeo, new T.LineBasicMaterial({ color: C.ink.clone().lerp(C.neon[6], 0.4), transparent: true, opacity: 0.32, depthWrite: false }));
  rain.frustumCulled = false;
  scene.add(rain);

  // ── Motion State ──
  const drive = { on: false, v: 0, x: 0, keys: new Set(), nitro: 1 };
  let last = 0, time = 0;
  const camPos = new T.Vector3(), camLook = new T.Vector3();
  const place = (dt) => {
    car.position.x = drive.x;
    car.rotation.y = -drive.steer * 0.12 || 0;
    camPos.set(drive.x * 0.6, 2.05, car.position.z + 5.3);
    camLook.set(drive.x * 0.8, 0.9, car.position.z - 8);
    if (!reduce) { camPos.x += Math.sin(time * 0.35) * 0.18; camPos.y += Math.sin(time * 0.5) * 0.06; }
    camera.position.lerp(camPos, dt ? Math.min(1, dt * 6) : 1);
    camera.lookAt(camLook);
  };
  const recycle = () => {
    for (const g of segments) if (g.position.z - car.position.z > SEG * 1.5) g.position.z -= NSEG * SEG;
    const dz = Math.floor(car.position.z / 6) * 6;
    if (Math.abs(dashes.userData.z0 - dz) >= 6 || dashes.userData.z0 == null) { dashes.userData.z0 = dz; placeDashes(dz + 30); }
    road.position.z = car.position.z;
  };
  const updateRain = (dt) => {
    const fall = reduce ? 0 : 22 * dt;
    for (let i = 0; i < RAIN; i++) {
      let y = rainSeed[i * 3 + 1] - fall;
      if (y < 0) y += 26;
      rainSeed[i * 3 + 1] = y;
      let z = rainSeed[i * 3 + 2] + car.position.z;
      const x = rainSeed[i * 3] + camera.position.x;
      const len = 0.55 + drive.v * 0.01;
      rainPos.set([x, y, z, x + 0.04, y - len, z + drive.v * 0.006], i * 6);
    }
    rainGeo.attributes.position.needsUpdate = true;
  };

  // ── Speedometer (original values: center 140,138 · 270° · 0~8 · red zone 7.6~8 · nitro 152°~212°) ──
  const dial = $(".tp-dial");
  const svg = $(".tp-dial__svg");
  const NS = "http://www.w3.org/2000/svg";
  const CX = 140, CY = 138;
  const pt = (deg, r) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)];
  const arc = (a0, a1, r, sweep = 1) => { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  const el = (tag, attrs, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.append(n); return n; };
  const ang = (rpm) => 135 + (rpm / 8) * 270;
  el("path", { class: "tp-dial__ring", d: arc(135, 405, 120) });
  el("path", { class: "tp-dial__track", d: arc(135, 405, 100) });
  el("path", { class: "tp-dial__red", d: arc(ang(7.6), ang(8), 112) });
  const fill = el("path", { class: "tp-dial__fill", d: arc(135, 405, 100), "stroke-dasharray": "471.2", "stroke-dashoffset": "471.2" });
  for (let i = 0; i <= 16; i++) {
    const r = i / 2, a = ang(r), major = i % 2 === 0, red = r >= 7.5;
    const [x0, y0] = pt(a, major ? 96 : 101), [x1, y1] = pt(a, 107);
    el("line", { class: `tp-dial__tick${major ? " is-major" : ""}${red ? " is-red" : ""}`, x1: x0.toFixed(2), y1: y0.toFixed(2), x2: x1.toFixed(2), y2: y1.toFixed(2) });
    if (major) { const [nx, ny] = pt(a, 83); const t = el("text", { class: `tp-dial__num${red ? " is-red" : ""}`, x: nx.toFixed(1), y: (ny + 4).toFixed(1) }); t.textContent = String(r); }
  }
  const needle = el("g", { transform: "rotate(135 140 138)" });
  el("line", { class: "tp-dial__needle-glow", x1: 202, y1: 138, x2: 250, y2: 138 }, needle);
  el("line", { class: "tp-dial__needle-core", x1: 202, y1: 138, x2: 250, y2: 138 }, needle);
  el("line", { class: "tp-dial__needle-hot", x1: 206, y1: 138, x2: 248, y2: 138 }, needle);
  el("path", { class: "tp-dial__nitro-track", d: arc(152, 212, 132) });
  const nitro = el("path", { class: "tp-dial__nitro-fill", d: arc(152, 212, 132), "stroke-dasharray": "138.2", "stroke-dashoffset": "0" });
  el("path", { class: "tp-dial__bolt", d: "M8 0 L1 10 H6 L4 18 L12 7 H7 Z", transform: "translate(26.2 217.6)" });
  const txt = (cls, x, y, s) => { const t = el("text", { class: cls, x, y }); t.textContent = s; return t; };
  txt("tp-dial__label", 140, 94, "RPM");
  const speedT = txt("tp-dial__speed", 140, 152, "0");
  txt("tp-dial__unit", 140, 170, "km/h");
  const gearT = txt("tp-dial__gear", 140, 204, "N");
  txt("tp-dial__mode", 140, 222, "AUTO");
  const updateDial = () => {
    const v = drive.v, gear = v < 0.5 ? 0 : Math.min(6, 1 + Math.floor(v / 11));
    const frac = gear ? (v - (gear - 1) * 11) / 11 : 0;
    const rpm = Math.min(8, gear ? 1.4 + frac * 6.2 : 0.9 + (drive.keys.size ? 0.4 : 0));
    needle.setAttribute("transform", `rotate(${ang(rpm).toFixed(1)} 140 138)`);
    fill.setAttribute("stroke-dashoffset", (471.2 * (1 - rpm / 8)).toFixed(1));
    speedT.textContent = String(Math.round(v * 3.6));
    gearT.textContent = gear ? String(gear) : "N";
    dial.classList.toggle("is-redline", rpm > 7.2);
    nitro.setAttribute("stroke-dashoffset", (138.2 * (1 - drive.nitro)).toFixed(1));
  };
  updateDial();

  // ── Minimap (our neighborhood drawing) ──
  const mm = $(".tp-minimap__canvas").getContext("2d");
  const drawMap = (z) => {
    const w = mm.canvas.width;
    mm.fillStyle = css.getPropertyValue("--kf-surface").trim();
    mm.fillRect(0, 0, w, w);
    mm.save();
    mm.translate(w / 2, w * 0.62 - ((z * 1.2) % 120));
    mm.fillStyle = css.getPropertyValue("--site-wall").trim();
    for (let r = -4; r < 4; r++) for (let k = -3; k < 3; k++) mm.fillRect(k * 70 + 14, r * 120 + 14, 42, 92);
    mm.strokeStyle = css.getPropertyValue("--kf-dim").trim();
    mm.lineWidth = 9;
    mm.beginPath();
    for (let k = -3; k <= 3; k++) { mm.moveTo(k * 70, -500); mm.lineTo(k * 70, 500); }
    for (let r = -4; r <= 4; r++) { mm.moveTo(-260, r * 120); mm.lineTo(260, r * 120); }
    mm.stroke();
    mm.restore();
  };
  drawMap(0);

  // ── Draw loop ──
  let raf = 0;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 0.016;
    last = now; time += dt;
    if (drive.on) {
      const k = drive.keys;
      const up = k.has("KeyW") || k.has("ArrowUp"), down = k.has("KeyS") || k.has("ArrowDown");
      const boost = (k.has("ShiftLeft") || k.has("ShiftRight")) && drive.nitro > 0 && up;
      const max = boost ? 75 : 62;
      if (up) drive.v = Math.min(max, drive.v + (boost ? 18 : 9) * dt);
      else if (down) drive.v = Math.max(0, drive.v - 22 * dt);
      else drive.v = Math.max(0, drive.v - 3 * dt);
      drive.nitro = boost ? Math.max(0, drive.nitro - dt * 0.25) : Math.min(1, drive.nitro + dt * 0.05);
      dial.classList.toggle("is-nitro", boost);
      const steer = (k.has("KeyA") || k.has("ArrowLeft") ? -1 : 0) + (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0);
      drive.steer = steer;
      drive.x = Math.max(-4.5, Math.min(4.5, drive.x + steer * dt * (4 + drive.v * 0.08)));
      car.position.z -= drive.v * dt;
      if (drive.v > 0.5) prompt.classList.remove("is-visible");
      updateDial();
      drawMap(car.position.z);
    }
    recycle();
    place(dt);
    updateRain(dt);
    renderer.render(scene, camera);
  };
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = mobile() ? 100 : 65;
    camera.updateProjectionMatrix();
  };
  addEventListener("resize", resize);
  resize();

  // ── Flow: loader → entrance → message → HUD ──
  const S = window.tpShared;
  const intro = $(".tp-intro");
  const enter = $(".tp-intro__enter");
  const stage = $(".tp-stage");
  const story = $(".tp-story");
  const storyText = $(".tp-story__text");
  const toast = $(".tp-toast");
  const prompt = $(".tp-prompt");
  const hud = [$(".tp-dial"), $(".tp-hint"), $(".tp-minimap")];

  // Preloads the fixed-width Korean and title fonts for the message window during the loader — if they load after the window opens, lines re-wrap and the window height jumps
  const fontsReady = () => {
    if (!document.fonts?.load) return Promise.resolve();
    const fam = (v) => css.getPropertyValue(v).trim();
    // Korean web fonts are split into files per character range, so the text actually used must be passed in for all those pieces to load
    const said = (sel) => [...document.querySelectorAll(sel)].map((n) => n.textContent).join(" ");
    const mono = said(".tp-story__text, .tp-toast__preview, .tp-toast__link") + " Aa 01";
    const sans = said(".tp-story, .tp-toast, .tp-intro, .tp-hint, .tp-prompt") + " Aa 01";
    return Promise.all([["400", "--kf-font-mono", mono], ["400", "--kf-font-display", sans], ["900", "--kf-font-display", sans], ["400", "--kf-font-sans", sans]].map(([w, v, text]) => document.fonts.load(`${w} 16px ${fam(v)}`, text).catch(() => null)));
  };
  const boot = async () => {
    // Fill the ring for each scene built — the curtain opens only when baking finishes
    S.progress(0.18);
    await S.wait(160);
    place(0); recycle(); updateRain(0);
    S.progress(0.46);
    await S.wait(160);
    S.progress(0.74);
    renderer.compile(scene, camera);
    await Promise.race([fontsReady(), S.wait(2500)]);
    S.progress(1);
    S.status("COMPILING SHADERS");
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
    await S.wait(reduce ? 0 : 900);
    await S.finish();
    playEnter();
  };

  const parts = { kicker: $(".tp-intro__kicker"), rule: $(".tp-intro__rule"), tagline: $(".tp-intro__tagline"), credit: $(".tp-intro__credit"), actions: $(".tp-intro__actions"), enter };
  let introTl = null;
  const mm2 = gsap.matchMedia();
  const playEnter = () => {
    intro.classList.add("is-in");
    mm2.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.still) {
        gsap.set([parts.kicker, parts.rule, parts.tagline, parts.actions, parts.credit], { opacity: 1, y: 0, scaleX: 1 });
        gsap.set(parts.enter, { opacity: 1 });
        enter.disabled = false;
        return;
      }
      // Original schedule — heading 0 · letters .35 (.035 spacing over .9s) · line 1.05 · intro 1.4 · button 1.9 · name 2.2
      gsap.set(parts.kicker, { opacity: 0, y: 12 });
      gsap.set(parts.rule, { scaleX: 0, opacity: 0 });
      gsap.set(parts.tagline, { opacity: 0, y: 14 });
      // Moves the button itself — in the original too, a leftover inline transform on the button means the CSS hover −2px lift never actually applies
      gsap.set(parts.actions, { opacity: 1 });
      gsap.set(parts.enter, { opacity: 0, y: 10 });
      gsap.set(parts.credit, { opacity: 0, y: 8 });
      introTl = gsap.timeline()
        .to(parts.kicker, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, 0)
        .to(parts.rule, { scaleX: 1, opacity: 1, duration: 0.75, ease: "power2.inOut" }, 1.05)
        .to(parts.tagline, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, 1.4)
        .to(parts.enter, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", onComplete: () => { enter.disabled = false; } }, 1.9)
        .to(parts.credit, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 2.2);
    });
  };

  let entered = false;
  const doEnter = async () => {
    if (entered || enter.disabled) return;
    entered = true;
    enter.disabled = true;
    introTl?.kill();
    await new Promise((r) => gsap.to(intro, { opacity: 0, duration: reduce ? 0 : 0.6, ease: "power1.out", onComplete: r }));
    intro.hidden = true;
    S.notice.show();
    const glass = (async () => {
      await new Promise((r) => { stage.addEventListener("fx:cleared", r, { once: true }); stage.dispatchEvent(new CustomEvent("fx:clear", { detail: { dur: 1.2 } })); setTimeout(r, 1600); });
      await S.wait(1000);
      await S.notice.hide();
    })();
    await Promise.all([glass, openStory()]);
    revealHud();
  };
  enter.addEventListener("click", doEnter);

  // Incoming message — when opened, the portrait cover lifts in steps and the text is typed .8s later. When fully typed, the goal and continue buttons rise
  let storyDone = null;
  const openStory = () => new Promise((resolve) => {
    storyDone = resolve;
    story.hidden = false;
    // When the radio turns on — the original lowers the strip about 3.3s after entering
    setTimeout(() => S.ticker(true), reduce ? 0 : 2700);
    requestAnimationFrame(() => requestAnimationFrame(() => story.classList.add("is-open", "is-in")));
  });
  storyText.addEventListener("fx:typed", () => story.classList.add("is-typed"));
  const closeStory = () => {
    if (!storyDone) return;
    story.classList.remove("is-open");
    story.classList.add("is-closing");
    setTimeout(() => { story.hidden = true; }, reduce ? 0 : 450);
    const r = storyDone; storyDone = null; r();
  };
  story.addEventListener("click", (e) => {
    if (e.target.closest(".tp-story__go, .tp-story__skip")) { closeStory(); return; }
    if (!story.classList.contains("is-typed")) storyText.dispatchEvent(new CustomEvent("fx:finish"));
  });

  const revealHud = () => {
    S.header(true);
    hud.forEach((n) => n.classList.add("is-visible"));
    prompt.classList.add("is-visible");
    drive.on = true;
    setTimeout(() => { toast.classList.add("is-visible", "is-in"); }, reduce ? 0 : 1500);
  };

  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!entered && (e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Space") && !enter.disabled) { e.preventDefault(); doEnter(); return; }
    if (storyDone) {
      if (e.code === "Escape") { e.preventDefault(); closeStory(); }
      else if (e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Space") { e.preventDefault(); if (story.classList.contains("is-typed")) closeStory(); else storyText.dispatchEvent(new CustomEvent("fx:finish")); }
      return;
    }
    if (drive.on) { drive.keys.add(e.code); if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault(); }
  });
  addEventListener("keyup", (e) => drive.keys.delete(e.code));
  addEventListener("blur", () => drive.keys.clear());

  const start = () => setTimeout(boot, 0);
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start, { once: true }); else start();
})();
