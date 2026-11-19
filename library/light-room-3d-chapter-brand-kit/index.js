// First page — swaps one fixed WebGL stage for a different object each section (room·photo spiral·light particles·bead chain·molecule·glass box·product stage), and
// Each section’s scroll progress (0~1) sets camera, opacity and rotation. Basic shapes and canvas drawings replace the original Lottie and shader.
(() => {
  window.BRAND.pages.home = (root) => {
  const { lenis } = window.BRAND;
  const offs = [];
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = matchMedia("(max-width: 767px)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  const mix = (a, b, t) => a + (b - a) * t;
  const hex = (h) => new THREE.Color(h);
  // Canvas and three colors and fonts are read from the skin (theme.css)
  const C = (expr, a) => oaColor(expr, a).css;
  const rootStyle = getComputedStyle(document.documentElement);
  const SANS = rootStyle.getPropertyValue("--kf-font-sans").trim() || "sans-serif";
  const DISPLAY = rootStyle.getPropertyValue("--kf-font-display").trim() || SANS;

  /* ── Section Progress ── */
  const $ = (s) => root.querySelector(s);
  const S = {
    kv: $(".h-kv"), intro: $(".h-intro"), concept: $("#concept"), oxygen: $("#oxygen-energy"), science: $("#science-technology"),
    product: $("#product"), interview: $("#interview"), stage: $(".h-stage"), onoff: $(".h-onoff")
  };
  const prog = (el) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - innerHeight));
  };
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };

  /* ── Renderer ── */
  const host = $("#webgl");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(isSP ? 50 : 35, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.HemisphereLight(oaColor("var(--kf-on-accent)").hex, oaColor("oklch(from var(--kf-ink-soft) calc(l * 0.9214) calc(c * 1.1144) calc(h - 17.84))").hex, 1.6));
  const sun = new THREE.DirectionalLight(oaColor("var(--kf-on-accent)").hex, 2.2);
  sun.position.set(2, 6, 5);
  scene.add(sun);
  on(window, "resize", () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  /* Canvas art: photo slot (label) · round glow · gradient */
  const canvasTex = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const photoTex = (label, tint) => canvasTex(256, 180, (g, w, h) => {
    g.fillStyle = tint; g.fillRect(0, 0, w, h);
    g.strokeStyle = C("var(--kf-on-accent)", 0.55); g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.fillStyle = C("oklch(from var(--kf-contrast-bg) calc(l * 1.0038) calc(c * 0.9388) calc(h + 2.5))", 0.75); g.font = `500 15px ${SANS}`; g.textAlign = "center";
    g.fillText(label, w / 2, h / 2 + 5);
  });
  const glowTex = canvasTex(128, 128, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, C("var(--kf-on-accent)", 1)); gr.addColorStop(0.25, C("var(--kf-on-accent)", 0.85)); gr.addColorStop(1, C("var(--kf-on-accent)", 0));
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const orbTex = canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, C("var(--kf-on-accent)")); gr.addColorStop(0.68, C("var(--kf-on-accent)")); gr.addColorStop(0.82, C("var(--kf-on-accent)", 0.75)); gr.addColorStop(1, C("var(--kf-on-accent)", 0));
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const fadeMats = []; // Materials whose opacity changes per section
  const mat = (m) => { m.transparent = true; fadeMats.push(m); return m; };

  /* ── 1. Dark room: wall · light pool floor · ceiling lights · light cone · product bag · pill ── */
  const room = new THREE.Group();
  scene.add(room);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), new THREE.MeshBasicMaterial({
    map: canvasTex(512, 512, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w * 0.42, 10, w / 2, w * 0.42, w * 0.6);
      gr.addColorStop(0, C("oklch(from var(--kf-accent) calc(l * 0.81) calc(c * 0.6489) calc(h - 0.84))")); gr.addColorStop(0.5, C("oklch(from var(--kf-contrast-bg) calc(l * 1.2706) calc(c * 1.5861) calc(h - 4.62))")); gr.addColorStop(1, C("oklch(from var(--kf-contrast-bg) calc(l * 0.755) calc(c * 0.7688) calc(h - 2.75))"));
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    }), transparent: true
  }));
  wall.position.z = -8;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({
    map: canvasTex(256, 256, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, C("oklch(from var(--kf-accent) calc(l * 1.2707) calc(c * 0.8555) calc(h - 2.37))", 0.9)); gr.addColorStop(0.35, C("oklch(from var(--kf-accent) calc(l * 0.795) calc(c * 0.7036) calc(h - 2.68))", 0.6)); gr.addColorStop(1, C("oklch(from var(--kf-contrast-bg) calc(l * 0.8614) calc(c * 1.0669) calc(h - 5.69))", 0));
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    }), transparent: true, depthWrite: false
  }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -3.2, -2);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.2), new THREE.MeshBasicMaterial({ color: oaColor("var(--kf-on-accent)").hex, transparent: true }));
  lamp.position.set(0, 4.1, -2);
  const coneMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uOpacity: { value: 0.32 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform float uOpacity; varying vec2 vUv; void main(){ float a = pow(vUv.y, 1.6) * uOpacity; gl_FragColor = vec4(0.82, 1.0, 0.86, a); }"
  });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(4.2, 7.4, 64, 1, true), coneMat);
  cone.position.set(0, 0.4, -2);
  const packTex = canvasTex(512, 660, (g, w, h) => {
    g.fillStyle = C("oklch(from var(--kf-accent) calc(l * 0.9747) calc(c * 0.9782) calc(h - 1.14))"); g.fillRect(0, 0, w, h);
    g.fillStyle = C("var(--kf-on-accent)", 0.12); g.fillRect(0, h * 0.62, w, h * 0.38);
    g.save(); g.translate(w * 0.5, h * 0.36); g.rotate(-0.26);
    g.fillStyle = C("var(--kf-on-accent)"); g.font = `600 112px ${DISPLAY}`; g.textAlign = "center"; g.fillText("/brand", 0, 0);
    g.font = `500 30px ${SANS}`; g.fillText("Keyword", 40, 70); g.fillText("Here", 40, 108);
    g.restore();
  });
  const packMats = [0, 0, 0, 0, 1, 0].map((f) => new THREE.MeshStandardMaterial(f ? { map: packTex, roughness: 0.45 } : { color: oaColor("oklch(from var(--kf-accent) calc(l * 0.912) calc(c * 0.9195) calc(h - 1.37))").hex, roughness: 0.5 }));
  const pack = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.2, 0.18), packMats);
  pack.position.set(0, -0.2, 0);
  pack.rotation.set(0.05, 0.35, -0.22);
  const pill = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.5, 8, 20), new THREE.MeshStandardMaterial({ color: oaColor("oklch(from var(--kf-raised) calc(l * 1.0095) calc(c * 0.3515) calc(h - 44.12))").hex, roughness: 0.35 }));
  pill.position.set(0.8, -0.85, 0.6);
  pill.rotation.set(0.3, 0, 0.5);
  room.add(wall, floor, lamp, cone, pack, pill);

  /* Light orb: in front of room · behind photo panel (z =White circle placed at 2) — sized by a ratio of the screen height */
  const orb = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTex, transparent: true, depthWrite: false }));
  orb.position.set(0, 0, 2);
  scene.add(orb);
  const viewH = (z) => 2 * (camera.position.z - z) * Math.tan((camera.fov * Math.PI) / 360);

  /* ── 2. Photo plate spiral (sections 1·2) ── */
  const TINTS = [C("oklch(from var(--kf-raised) calc(l * 0.94) calc(c * 1.5247) calc(h + 53.85))"), C("oklch(from var(--kf-raised) calc(l * 0.9583) calc(c * 1.7001) calc(h - 42.83))"), C("oklch(from var(--kf-raised) calc(l * 0.9495) calc(c * 0.8862) calc(h - 98.23))"), C("oklch(from var(--kf-raised) calc(l * 0.9458) calc(c * 1.0732) calc(h + 1.37))"), C("oklch(from var(--kf-raised) calc(l * 0.9765) calc(c * 0.7307) calc(h + 67.26))"), C("oklch(from var(--kf-accent) calc(l * 1.4229) calc(c * 0.2062) calc(h - 19.12))")];
  const LABELS = ["People under the sky", "Waterside scenery", "Person exercising", "Guest by the window", "Forest path", "Kids and adults", "On the desk", "Sea"];
  /* Original XB (Section 1) — scene kept separate, camera field of view 45°. Unit is original px divided by 100 (et = 100) */
  const U = 100;
  const ch1Scene = new THREE.Scene();
  const ch1Cam = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 400);
  const photo = (i) => photoTex(LABELS[i % LABELS.length], TINTS[i % TINTS.length]);
  const rand = (a, b) => a + Math.random() * (b - a);
  const tmpV = new THREE.Vector3();

  /* gallery1 — born on a back disc (radius 670px · depth 6000px±150) and flies to the screen edge (z −500px) at speed 8.69±36%, rolling as it goes. 
     Opacity rises straight up to life .1, then fades by (1−life)^.2 — the original’s values exactly as they are */
  const G1 = { count: 16, spawnDepth: 6000, exitZ: -500, spawnRadius: 670, speedBase: 8.69, speedJitter: 0.36, alphaMiddle: 0.1, alphaIn: 1, alphaOut: 0.2, rollSpeed: 2, planeW: isSP ? 320 : 360, aspect: 2 / 3 };
  const g1 = new THREE.Group();
  ch1Scene.add(g1);
  const lifeAlpha = (l) => (l <= 0 || l >= 1 ? 0 : l <= G1.alphaMiddle ? Math.pow(l / G1.alphaMiddle, G1.alphaIn) : Math.pow((1 - l) / (1 - G1.alphaMiddle), G1.alphaOut));
  const edgeTarget = (x, y, z) => {
    const hw = innerWidth / U / 2, hh = innerHeight / U / 2;
    const ang = Math.random() < 0.5 ? (x >= 0 ? 0 : Math.PI) : (y >= 0 ? Math.PI / 2 : -Math.PI / 2);
    const c = Math.cos(ang), s = Math.sin(ang);
    const k = Math.min(Math.abs(c) > 1e-6 ? hw / Math.abs(c) : Infinity, Math.abs(s) > 1e-6 ? hh / Math.abs(s) : Infinity);
    return new THREE.Vector3(c * k, s * k, z);
  };
  const g1Items = Array.from({ length: G1.count }, (_, id) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(G1.planeW / U, (G1.planeW * G1.aspect) / U), new THREE.MeshBasicMaterial({ map: photo(id), side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false }));
    mesh.renderOrder = id;
    const group = new THREE.Group();
    group.add(mesh);
    g1.add(group);
    return { mesh, group, dir: new THREE.Vector3(), speed: 0, zStart: 0, zEnd: 0, life: 0, roll: 0, id };
  });
  const spawn = (it, first) => {
    const z0 = -G1.spawnDepth / U + rand(-150, 150) / U, z1 = G1.exitZ / U;
    it.zStart = z0; it.zEnd = z1;
    const t = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (G1.spawnRadius / U);
    const from = new THREE.Vector3(Math.cos(t) * r, Math.sin(t) * r, z0), to = edgeTarget(from.x, from.y, z1);
    const d = first ? it.id / G1.count : 0;
    it.group.position.copy(from).lerp(to, d);
    it.dir.copy(to).sub(from).normalize();
    it.speed = Math.max(0.01, G1.speedBase * (1 + rand(-G1.speedJitter, G1.speedJitter)));
    it.roll = (Math.random() < 0.5 ? -1 : 1) * G1.rollSpeed * Math.random() * 0.01;
    it.life = clamp(d);
    it.group.lookAt(tmpV.copy(it.group.position).add(it.dir));
  };
  g1Items.forEach((it) => spawn(it, true));
  const g1Update = (dt, opacity) => g1Items.forEach((it) => {
    it.group.position.addScaledVector(it.dir, it.speed * dt);
    it.life = clamp((it.group.position.z - it.zStart) / (it.zEnd - it.zStart || 1e-6));
    it.group.lookAt(tmpV.copy(it.group.position).add(it.dir));
    const r = it.roll * G1.rollSpeed * dt;
    it.mesh.rotateY(r); it.mesh.rotateX(r); it.mesh.rotateZ(r);
    it.mesh.material.opacity = lifeAlpha(it.life) * opacity;
    if (it.group.position.z >= it.zEnd || it.life >= 1) spawn(it);
  });

  /* gallery2 — 15 spiral-staircase photos at z −6700px where the camera arrives (phone −7500px). A 36-point spiral (radius · height · winding · start angle) is joined with Catmull-Rom (.5),
     By section progress, it closes in on helixTo → helixEnd by 1/10 each frame. The .2 at both section ends is faded, and size goes to 1 over the first .52 of the curve (original kB·a7 values) */
  const G2 = {
    count: 15, planeW: (isSP ? 420 : 300) / U, aspect: 4 / 3, steps: 36, feather: 0.2, arcMin: 0.52, yaw: (-40 * Math.PI) / 180,
    to: isSP ? { radius: 5, height: 30, turns: 2.5, startAngle: 1 } : { radius: 9, height: 22.8, turns: 0.86, startAngle: 4.25 },
    end: isSP ? { radius: 4, height: 30, turns: 3, startAngle: 1 } : { radius: 9.9, height: 22.8, turns: 0.86, startAngle: 4.25 }
  };
  const g2 = new THREE.Group();
  ch1Scene.add(g2);
  const g2Items = Array.from({ length: G2.count }, (_, i) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(G2.planeW, G2.planeW / G2.aspect), new THREE.MeshBasicMaterial({ map: photo(i + 3), side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false }));
    g2.add(mesh);
    return mesh;
  });
  const helixNow = { ...G2.to };
  let g2Offset = 0;
  const smooth01 = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const placeG2 = (revealP, viewP, alpha) => {
    const target = {};
    for (const k of ["radius", "height", "turns", "startAngle"]) {
      target[k] = mix(G2.to[k], G2.end[k], viewP / 2);
      helixNow[k] = mix(helixNow[k], target[k], 0.1);
    }
    const n = G2.steps - 1, dA = (2 * Math.PI * helixNow.turns) / n, dY = helixNow.height / n;
    const pts = Array.from({ length: G2.steps }, (_, p) => new THREE.Vector3(helixNow.radius * Math.cos(helixNow.startAngle + dA * p), dY * p, helixNow.radius * Math.sin(helixNow.startAngle + dA * p)));
    const box = new THREE.Box3().setFromPoints(pts), mid = box.getCenter(new THREE.Vector3());
    pts.forEach((p) => { p.x -= mid.x; p.y -= mid.y; });
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    const len = curve.getLength();
    g2Items.forEach((m, i) => {
      const u = (((i + 0.5) / G2.count + g2Offset / len) % 1 + 1) % 1;
      curve.getPointAt(u, m.position);
      m.lookAt(0, m.position.y, 0);
      m.rotateY(G2.yaw);
      m.scale.setScalar(mix(G2.arcMin, 1, smooth01(u)));
      const ends = u < G2.feather ? smooth01(u / G2.feather) : u > 1 - G2.feather ? smooth01((1 - u) / G2.feather) : 1;
      const shown = smooth01((revealP * (1 + G2.feather) - u) / G2.feather);
      m.material.opacity = ends * shown * alpha;
      m.visible = m.material.opacity > 0.005;
    });
  };
  const layoutCh1 = () => {
    ch1Cam.aspect = innerWidth / innerHeight;
    ch1Cam.updateProjectionMatrix();
    g2.position.set(0, isSP ? -2 : -1.6, -6000 / U - 7 - (isSP ? 8 : 0));
    g2.scale.setScalar(isSP ? 1 : Math.max(1, innerHeight / 1080));
  };
  layoutCh1();
  on(window, "resize", layoutCh1);
  renderer.autoClear = false;

  /* Section 2 floating light particles */
  /* Original YB (section 2) — the camera travels z 0 → −20000 → −27000px with section progress, and the background goes #133520 → #008340 (progress²).
     16 photos on a golden-angle (137.5°) spiral (radius 1200px×1.5, depth per photo 10000/16×1.4px, 1.2x scale) always face the camera, they turn on over a distance of 0→5000px and turn off over 5000→10000px.
     250 light particles (30 on phones) twinkle spread over 100 width and height and 600 depth units (accent 1 : white 3, opacity .3) */
  const ch2Scene = new THREE.Scene();
  const ch2Cam = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 800);
  const CH2 = { start: 10000, depth: 10000, total: 20000, tail: 7000, main: 16, radius: 1200, spread: isSP ? 1 : 1.5, fadeIn: [0, 5000], fadeOut: [5000, 10000] };
  const ch2Bg = [C("oklch(from var(--kf-contrast-bg) calc(l * 1.0317) calc(c * 1.135) calc(h - 3.23))"), C("oklch(from var(--kf-accent) calc(l * 0.8342) calc(c * 0.8255) calc(h + 0.46))")];
  const ch2Gallery = new THREE.Group();
  ch2Gallery.position.z = -(CH2.start * 1.25) / U;
  ch2Scene.add(ch2Gallery);
  const golden = (137.50776405 * Math.PI) / 180, stepZ = (CH2.depth / U / CH2.main) * 1.4;
  const ch2Photos = Array.from({ length: CH2.main }, (_, g) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ map: photo(g + 5), side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false }));
    const ang = golden * g, r = (CH2.radius / U) * CH2.spread;
    mesh.position.set(Math.cos(ang) * r, Math.sin(ang) * r, -stepZ * g);
    mesh.scale.setScalar(1.2);
    ch2Gallery.add(mesh);
    return mesh;
  });
  const byRanges = (d, [a, b], [c, e]) => (d <= b ? clamp((d - a) / (b - a)) : d < c ? 1 : d <= e ? clamp((e - d) / (e - c)) : 0);
  const nP = isSP ? 30 : 250;
  const pPos = new Float32Array(nP * 3), pCol = new Float32Array(nP * 3);
  const accentV = oaColor("var(--kf-accent)").vec, whiteV = oaColor("var(--kf-on-accent)").vec;
  for (let i = 0; i < nP; i++) {
    pPos.set([(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * ((CH2.total * 3) / U)], i * 3);
    pCol.set(i % 4 === 0 ? accentV : whiteV, i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ map: glowTex, size: 0.9, vertexColors: true, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(pGeo, pMat);
  particles.position.z = -CH2.start / U;
  ch2Scene.add(particles);
  const camPathZ = (p) => { const L = (CH2.total + CH2.tail) / U; return -L * p; };
  const layoutCh2 = () => { ch2Cam.aspect = innerWidth / innerHeight; ch2Cam.updateProjectionMatrix(); };
  on(window, "resize", layoutCh2);

  /* ── 3. Glowing bead chain → molecular structure ── */
  const chains = new THREE.Group();
  scene.add(chains);
  const beadMat = mat(new THREE.MeshBasicMaterial({ color: oaColor("var(--kf-on-accent)").hex, opacity: 0 }));
  const nodeMat = mat(new THREE.SpriteMaterial({ map: glowTex, color: oaColor("var(--kf-on-accent)").hex, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const beadGeo = new THREE.SphereGeometry(0.035, 6, 6);
  const dummy = new THREE.Object3D();
  for (let c = 0; c < 4; c++) {
    const pts = [];
    for (let k = 0; k < 7; k++) pts.push(new THREE.Vector3(mix(-7, 7, k / 6) + (c - 1.5) * 0.8, Math.sin(k * 1.3 + c) * 2.2 + (c - 1.5) * 1.4, -k * 3.2 + c * 1.5));
    const curve = new THREE.CatmullRomCurve3(pts);
    const n = 220;
    const inst = new THREE.InstancedMesh(beadGeo, beadMat, n);
    for (let i = 0; i < n; i++) {
      const p = curve.getPoint(i / n);
      dummy.position.set(p.x + (Math.random() - 0.5) * 0.18, p.y + (Math.random() - 0.5) * 0.18, p.z + (Math.random() - 0.5) * 0.18);
      dummy.scale.setScalar(0.6 + Math.random());
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    chains.add(inst);
    for (let k = 0; k <= 8; k++) {
      const s = new THREE.Sprite(nodeMat);
      s.position.copy(curve.getPoint(k / 8));
      s.scale.setScalar(0.9 + (k % 3) * 0.35);
      chains.add(s);
    }
  }
  const molecule = new THREE.Group();
  scene.add(molecule);
  const atomMat = mat(new THREE.MeshBasicMaterial({ color: oaColor("var(--kf-on-accent)").hex, opacity: 0 }));
  const bondMat = mat(new THREE.MeshBasicMaterial({ color: oaColor("var(--kf-on-accent)").hex, opacity: 0 }));
  const ring = (cx, cy, r = 1) => Array.from({ length: 6 }, (_, i) => new THREE.Vector3(cx + Math.cos(Math.PI / 6 + (i * Math.PI) / 3) * r, cy + Math.sin(Math.PI / 6 + (i * Math.PI) / 3) * r, 0));
  const rings = [ring(-1.73, 0), ring(0, 0), ring(2.1, 1.1)];
  const atoms = [...rings.flat(), new THREE.Vector3(-3.4, 1, 0), new THREE.Vector3(0, -2, 0), new THREE.Vector3(3.9, 2.4, 0), new THREE.Vector3(1.9, -0.9, 0)];
  const bonds = [];
  rings.forEach((r) => r.forEach((p, i) => bonds.push([p, r[(i + 1) % 6]])));
  bonds.push([rings[1][0], rings[2][3]], [rings[0][2], atoms[18]], [rings[1][4], atoms[19]], [rings[2][0], atoms[20]], [rings[1][5], atoms[21]]);
  atoms.forEach((p) => {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), atomMat);
    a.position.copy(p);
    const g = new THREE.Sprite(nodeMat);
    g.position.copy(p); g.scale.setScalar(0.7);
    molecule.add(a, g);
  });
  bonds.forEach(([a, b]) => {
    const len = a.distanceTo(b);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 8), bondMat);
    cyl.position.copy(a).add(b).multiplyScalar(0.5);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    molecule.add(cyl);
  });
  molecule.scale.setScalar(isSP ? 0.6 : 0.9);

  /* ── 4. Frosted glass box ── */
  const glass = new THREE.Group();
  scene.add(glass);
  const glassBoxes = [[-3.1, -0.6, 0.2, "Lab hands · White gloves"], [3.0, 0.9, -0.6, "Leaf close-up · green"], [-0.4, 2.2, -2.5, "Water drop · Blue glow"]].map(([x, y, z, label]) => {
    const g = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.3, 0.55), mat(new THREE.MeshStandardMaterial({ color: oaColor("oklch(from var(--kf-raised) calc(l * 1.0173) calc(c * 0.6147) calc(h - 7.77))").hex, roughness: 0.15, metalness: 0, opacity: 0, depthWrite: false })));
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.05), mat(new THREE.MeshBasicMaterial({ map: photoTex(label, C("oklch(from var(--kf-raised) calc(l * 0.9112) calc(c * 0.836) calc(h - 12.77))")), opacity: 0 })));
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), mat(new THREE.LineBasicMaterial({ color: oaColor("var(--kf-on-accent)").hex, opacity: 0 })));
    g.add(inner, box, edges);
    g.position.set(x, y, z);
    glass.add(g);
    return g;
  });

  /* ── 5. Product stage: pillar · large ring · pedestal · bag ── */
  const stage = new THREE.Group();
  scene.add(stage);
  const stoneMat = mat(new THREE.MeshStandardMaterial({ color: oaColor("oklch(from var(--kf-ink-soft) calc(l * 1.6313) calc(c * 1.2106) calc(h - 5.65))").hex, roughness: 0.95, opacity: 0 }));
  [[-4.5, -6, 1.1, 9], [4.6, -5, 1.2, 10], [-2.2, -9, 0.9, 11], [6.5, -9, 0.9, 12], [1.2, -12, 1, 12]].forEach(([x, z, w, h]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), stoneMat);
    p.position.set(x, h / 2 - 3, z);
    stage.add(p);
  });
  const bigRing = new THREE.Mesh(new THREE.TorusGeometry(3, 0.75, 24, 80), stoneMat);
  bigRing.position.set(-3.2, 0.3, -7);
  bigRing.rotation.y = 0.5;
  stage.add(bigRing);
  [[0, 0.9, 1.2], [-1.8, 0.5, 0.9], [1.9, 0.4, 0.8]].forEach(([x, h, r]) => {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), stoneMat);
    ped.position.set(x, -3 + h / 2, -1.5);
    stage.add(ped);
  });
  const stagePack = new THREE.Mesh(pack.geometry, packMats.map((m) => mat(m.clone())));
  stagePack.position.set(0, -1.1, -1.5);
  stagePack.rotation.set(0, -0.25, 0.08);
  stagePack.scale.setScalar(0.55);
  stage.add(stagePack);

  /* ── DOM side ── */
  const bg = $(".h-bg"), hole = $(".h-hole");
  const kvCopy = $(".h-kv__sticky");
  const steps = [...root.querySelectorAll(".h-intro__sticky > *")];
  const chapters = [...root.querySelectorAll(".h-chapter")];
  const navi = $(".h-navi"), cta = $(".h-cta"), ctaLabel = $(".h-cta__label"), ctaBtn = $(".h-cta__btn");
  const ringA = $(".h-ring__a"), ringB = $(".h-ring__b");
  const people = [...root.querySelectorAll(".h-people .wf-img")];
  const stageText = [...root.querySelectorAll(".h-stage__sticky > *")];
  const arc = (r, a0, a1) => {
    const p = (a) => `${(200 + Math.cos(a) * r).toFixed(1)} ${(200 + Math.sin(a) * r).toFixed(1)}`;
    return `M${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
  };
  const fade = (el, o) => { el.style.opacity = o.toFixed(3); el.style.visibility = o < 0.01 ? "hidden" : ""; };
  const BG = { night: C("oklch(from var(--kf-contrast-bg) calc(l * 0.8968) calc(c * 0.9493) calc(h - 3.36))"), mint: C("oklch(from var(--kf-raised) calc(l * 0.9805) calc(c * 1.3466) calc(h - 5.18))"), deep: C("var(--kf-contrast-bg)"), teal: C("oklch(from var(--kf-accent) calc(l * 1.0584) calc(c * 0.5601) calc(h + 9.67))"), pale: C("oklch(from var(--kf-raised) calc(l * 0.9573) calc(c * 1.716) calc(h - 4.86))"), white: C("oklch(from var(--kf-raised) calc(l * 1.0075) calc(c * 0.4086) calc(h - 12.57))"), stage: C("oklch(from var(--kf-ink-soft) calc(l * 1.7914) calc(c * 0.8175) calc(h - 3.62))") };
  const lerpColor = (a, b, t) => "#" + hex(a).lerp(hex(b), t).getHexString();

  /* Section buttons · scene dot navigation */
  const goScene = (dir) => {
    const cur = chapters.findIndex((c) => { const r = c.getBoundingClientRect(); return r.top <= innerHeight * 0.5 && r.bottom > innerHeight * 0.5; });
    const target = chapters[clamp(cur + dir, 0, chapters.length - 1)];
    if (target) lenis ? lenis.scrollTo(target, { duration: 1.5 }) : target.scrollIntoView();
  };
  $(".h-cta__prev").addEventListener("click", () => goScene(-1));
  $(".h-cta__next").addEventListener("click", () => goScene(1));
  navi.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const t = $(a.getAttribute("href"));
    lenis ? lenis.scrollTo(t, { duration: 1.5 }) : t.scrollIntoView();
  }));

  /* Cursor response (original ns.mouseOffset) — rotates the whole scene by rotation.y = _rx×rx, rotation.x = Rotates by _ry×ry. The axis is the world origin, so
     Sections 1 and 2, where the camera is far from the origin, shift the photo a lot even at small angles. Hero and section 4 (glass box) use original strength 0 */
  const P = window.BRAND.pointer;
  // Takes the point d away in front of the axis, rotation.x = ax · y = Amount offset from its place when rotated by ay (XYZ order)
  const orbit = (d, ax, ay) => { const z1 = d * Math.cos(ay); return [d * Math.sin(ay), -z1 * Math.sin(ax), z1 * Math.cos(ax) - d]; };
  const tilt = (sc, rx, ry) => sc.rotation.set(P.fine ? P._ry * ry : 0, P.fine ? P._rx * rx : 0, 0);
  // Pill of 5 sheets (the copy is the C ring): .15x of the point where the cursor spot is moved to the same depth, approaching by .04 per frame
  const ringEl = $(".h-ring"), ringAt = { x: 0, y: 0 };
  // The ON/OFF photo scene (original chapterOn·Off, rx .1 · ry .05) tilts like a panel seen by a camera at screen-fit distance (45° field of view)
  const onoffPhotos = [...root.querySelectorAll(".h-onoff__photos")];

  let time = 0;
  const frame = (dt) => {
    if (!reduce) time += dt;
    const kvP = prog(S.kv), inP = prog(S.intro), coP = prog(S.concept), oxP = prog(S.oxygen), scP = prog(S.science);
    const prP = prog(S.product), ivP = prog(S.interview), stP = prog(S.stage);
    tilt(ch1Scene, 0.01, 0.01);
    tilt(ch2Scene, 0.01, 0.01);
    if (scP > 0 && scP < 1) tilt(scene, 0.03, 0.03);
    else if (stP > 0 && stP < 1) tilt(scene, 0.1, 0.1);
    else tilt(scene, 0, 0);
    const kRing = 1 - Math.pow(0.96, Math.min(dt, 0.1) * 60);
    ringAt.x += ((P.x - innerWidth / 2) * 0.15 - ringAt.x) * kRing;
    ringAt.y += ((P.y - innerHeight / 2) * 0.15 - ringAt.y) * kRing;
    if (inView(S.interview)) ringEl.style.transform = `translate(calc(-50% + ${ringAt.x.toFixed(1)}px), calc(-50% + ${ringAt.y.toFixed(1)}px))`;
    if (P.fine && inView(S.onoff)) {
      const persp = innerHeight / 2 / Math.tan((22.5 * Math.PI) / 180);
      const t = `perspective(${persp.toFixed(0)}px) rotateX(${(-P._ry * 0.05).toFixed(4)}rad) rotateY(${(P._rx * 0.1).toFixed(4)}rad)`;
      onoffPhotos.forEach((el) => { el.style.transform = t; });
    }
    const fades = new Map(); // Material → opacity
    const setF = (m, o) => fades.set(m, Math.max(fades.get(m) || 0, o));

    /* Background color */
    let col = BG.night;
    if (inP > 0.78) col = lerpColor(BG.night, BG.mint, seg(inP, 0.78, 0.84));
    if (inView(S.concept) || coP > 0) col = BG.mint;
    const oxR = S.oxygen.getBoundingClientRect(), oxT = clamp((innerHeight - oxR.top) / (oxR.height + innerHeight));
    if (oxP > 0.12 && oxP < 1) col = lerpColor(ch2Bg[0], ch2Bg[1], oxT * oxT);
    if (scP > 0) col = lerpColor(BG.deep, BG.teal, seg(scP, 0, 0.12));
    if (scP > 0.55) col = lerpColor(BG.teal, BG.pale, seg(scP, 0.55, 0.75));
    if (prP > 0) col = lerpColor(BG.pale, BG.white, seg(prP, 0, 0.15));
    if (ivP > 0) col = BG.white;
    if (stP > 0) col = lerpColor(BG.white, BG.stage, seg(stP, 0, 0.2));
    bg.style.setProperty("--h-bg", col);

    /* 1. Room: recedes while the light orb grows in the hero */
    const roomO = 1 - seg(inP, 0.68, 0.8);
    room.visible = roomO > 0.01;
    room.children.forEach((m) => { if (m.material && !Array.isArray(m.material) && m !== cone) { m.material.opacity = roomO; } });
    packMats.forEach((m) => { m.transparent = true; m.opacity = roomO; });
    pill.material.transparent = true; pill.material.opacity = roomO;
    coneMat.uniforms.uOpacity.value = 0.32 * roomO;
    const lift = ease(seg(kvP, 0, 1)) + seg(inP, 0, 0.3);
    // Original kv model: the bag rotation.y += _rx×.25 · x += _ry×.6×.5, pill is y += _rx×1 · x += _ry×.7.
    // The original model has its rotation axis behind the picture, so as it turns it grows and shifts toward the cursor — in recordings with the cursor at both extremes, the bag shifts 70px·25px and the pill 80px
    // Distance to the axis in copy units: pouch 1.1 · pill .36
    const pk = orbit(1.1, P._ry * 0.3, P._rx * 0.25), pl = orbit(0.36, P._ry * 0.7, P._rx);
    pack.position.set(pk[0], -0.2 + Math.sin(time * 0.9) * 0.08 + lift * 1.6 + pk[1], -lift * 3 + pk[2]);
    pack.rotation.y = 0.35 + Math.sin(time * 0.5) * 0.12 + lift * 0.25 + P._rx * 0.25;
    pack.rotation.x = 0.05 + P._ry * 0.3;
    pill.rotation.set(0.3 + P._ry * 0.7, P._rx, 0.5);
    pill.position.set(0.8 + pl[0], -0.85 + Math.sin(time * 1.1 + 1) * 0.06 + lift * 1.2 + pl[1], 0.6 - lift * 3 + pl[2]);
    fade(kvCopy, 1 - seg(kvP, 0.15, 0.55));

    /* Light orbs and text steps */
    // Original: floats at about 0.52 of the screen height, then grows at the end to cover the screen
    const orbF = (inP <= 0 ? ease(seg(kvP, 0.35, 1)) * 0.4 : mix(0.4, 0.55, ease(seg(inP, 0, 0.12)))) + ease(seg(inP, 0.66, 0.8)) * 2.6;
    orb.scale.setScalar((orbF * viewH(2)) / 0.75);
    orb.visible = orbF > 0.01 && inP < 0.84;
    const win = [[0.04, 0.22], [0.27, 0.45], [0.5, 0.66], [0.82, 0.99]];
    steps.forEach((el, i) => {
      const [a, b] = win[i];
      fade(el, Math.min(seg(inP, a, a + 0.04), 1 - seg(inP, b - 0.04, b)));
    });

    /* 2. Section 1 photos — end of the light orb (original w) gallery1 lights up until w .3 and the camera travels z 0 → −6000px until w .8, reaching the spiral staircase (gallery2).
       The spiral is revealed and widens with section 1 progress (section top edge at screen bottom → bottom edge at screen top), and is pushed along the curve by scroll speed × .018 */
    const w = seg(inP, 0.72, 1);
    const ch1R = S.concept.getBoundingClientRect();
    const coT = clamp((innerHeight - ch1R.top) / (ch1R.height + innerHeight));
    const ch1On = w > 0 && coP < 1;
    const ch2On = oxP > 0.12 && oxT < 1;
    if (ch1On) {
      g1Update(Math.min(dt, 1 / 30), smooth01(seg(w, 0, 0.3)));
      const camZ = mix(0, -6000 / U, seg(w, 0, 0.8));
      ch1Cam.position.set(0, 0, camZ);
      ch1Cam.lookAt(0, 0, camZ - 1);
      if (!reduce) g2Offset += (lenis?.velocity || 0) * 0.018 * (isSP ? 0.5 : 1);
      placeG2(seg(coT, 0, 0.2), seg(coT, 0, 1), 1 - seg(coP, 0.85, 1));
    }
    hole.style.transform = `translate(-50%,-50%) scale(${(ease(seg(oxP, 0, 0.12)) * 3).toFixed(3)})`;
    hole.style.opacity = oxP > 0 && oxP < 0.14 ? 1 : 0;
    if (ch2On) {
      const z = camPathZ(oxT);
      ch2Cam.position.set(0, 0, z);
      ch2Cam.lookAt(0, 0, z - 1);
      const camW = ch2Cam.getWorldPosition(new THREE.Vector3()), fadeIn = CH2.fadeIn.map((v) => v / U), fadeOut = CH2.fadeOut.map((v) => v / U);
      const sceneO = Math.min(seg(oxP, 0.12, 0.2), 1 - seg(oxT, 0.95, 1));
      ch2Photos.forEach((m) => {
        m.lookAt(camW);
        m.material.opacity = byRanges(m.getWorldPosition(tmpV).distanceTo(camW), fadeIn, fadeOut) * sceneO;
        m.visible = m.material.opacity > 0.005;
      });
      pMat.opacity = 0.3 * sceneO;
      if (!reduce) particles.position.x = Math.sin(time * 0.1) * 0.5;
    }

    /* 3. Pass through the bead chain into a molecule */
    const chainO = Math.min(seg(scP, 0, 0.08), 1 - seg(scP, 0.5, 0.62));
    chains.visible = chainO > 0.01;
    chains.position.z = scP * 22;
    chains.rotation.z = scP * 0.4;
    setF(beadMat, chainO); setF(nodeMat, chainO * 0.9);
    const molO = Math.min(seg(scP, 0.55, 0.7), 1 - seg(scP, 0.95, 1));
    molecule.visible = molO > 0.01;
    molecule.rotation.set(-0.3 + scP * 0.4, -0.4 + scP * 0.8 + time * 0.03, 0.1);
    molecule.position.z = mix(-4, 1, seg(scP, 0.55, 1));
    setF(atomMat, molO); setF(bondMat, molO * 0.9); setF(nodeMat, molO * 0.7);

    /* 4. Glass box */
    const glassO = Math.min(seg(prP, 0.05, 0.18), 1 - seg(prP, 0.88, 1));
    glass.visible = glassO > 0.01;
    glassBoxes.forEach((g, i) => {
      g.rotation.set(0.15 * Math.sin(time * 0.3 + i), -0.6 + prP * 1.4 + i * 0.5, 0.05);
      g.position.z = [0.2, -0.6, -2.5][i] + prP * 3;
      g.children.forEach((c) => setF(c.material, glassO * (c.type === "LineSegments" ? 0.8 : c.material.map ? 0.85 : 0.28)));
    });

    /* 5-piece ring (DOM) */
    const ringIn = ease(seg(ivP, 0, 0.3));
    const spin = ivP * 260 + (reduce ? 0 : time * 6);
    const rr = 150 * (0.6 + ringIn * 0.4);
    ringA.setAttribute("d", arc(rr, ((spin - 40) * Math.PI) / 180, ((spin + 130 * ringIn) * Math.PI) / 180));
    ringB.setAttribute("d", arc(rr, ((spin + 160) * Math.PI) / 180, ((spin + 160 + 120 * ringIn) * Math.PI) / 180));
    ringEl.style.opacity = 1 - seg(ivP, 0.45, 0.6);
    people.forEach((p, i) => fade(p, Math.min(seg(ivP, 0.55 + i * 0.04, 0.65 + i * 0.04), 1 - seg(ivP, 0.92, 1))));

    /* Product stage: camera descending from above */
    const stO = Math.min(seg(stP, 0, 0.15), 1 - seg(stP, 0.96, 1));
    stage.visible = stO > 0.01;
    setF(stoneMat, stO);
    stagePack.material.forEach((m) => setF(m, stO));
    stage.position.y = mix(-3, 0, ease(seg(stP, 0, 0.6)));
    stage.rotation.y = mix(-0.15, 0.08, stP);
    stageText.forEach((el, i) => fade(el, Math.min(seg(stP, 0.25 + i * 0.05, 0.35 + i * 0.05), 1 - seg(stP, 0.92, 1))));

    fades.forEach((o, m) => { m.opacity = o; m.visible = o > 0.01; });

    /* Section text: header (number, title) → body */
    let active = -1;
    chapters.forEach((ch, i) => {
      const p = prog(ch);
      const head = ch.querySelector(".h-chapter__head"), text = ch.querySelector(".h-chapter__text");
      fade(head, Math.min(seg(p, 0.02, 0.1), 1 - seg(p, 0.38, 0.46)));
      fade(text, Math.min(seg(p, 0.5, 0.58), 1 - seg(p, 0.9, 0.98)));
      const r = ch.getBoundingClientRect();
      if (r.top <= innerHeight * 0.5 && r.bottom > innerHeight * 0.5) active = i;
    });
    navi.classList.toggle("is-view", active >= 0);
    cta.classList.toggle("is-view", active >= 0);
    navi.classList.toggle("is-green", active >= 0 && !chapters[active].classList.contains("is-dark"));
    navi.querySelectorAll("a").forEach((a, i) => a.classList.toggle("is-on", i === active));
    if (active >= 0) {
      ctaLabel.innerHTML = chapters[active].dataset.cta;
      ctaBtn.setAttribute("href", chapters[active].querySelector(".h-chapter__head a").getAttribute("href"));
    }

    /* Camera: a slightly different position for each section */
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    if (stP > 0) { camera.position.set(0, mix(2.5, 0.6, ease(seg(stP, 0, 0.7))), 9); camera.lookAt(0, -0.5, -2); }
    renderer.clear();
    renderer.render(scene, camera);
    if (ch1On) { renderer.clearDepth(); renderer.render(ch1Scene, ch1Cam); }
    if (ch2On) { renderer.clearDepth(); renderer.render(ch2Scene, ch2Cam); }
  };

  /* ON/OFF (original homeSceneOnOff) — the span from the section’s top edge at the screen bottom to its bottom edge at the screen top is split into enter, stay and exit, and in the first half of enter the title and ON light up,
     During the hold, with easeInOutCubic the ON panel peels away from the left (inset left) while the OFF panel is revealed from the left (inset right), and in the first half of the exit the title and OFF switch off */
  const onTitle = $(".h-onoff__title"), onLayer = $(".h-onoff__layer.is-on"), offLayer = $(".h-onoff__layer.is-off");
  const cubicIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const onoff = () => {
    const r = S.onoff.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (r.height + innerHeight));
    const inn = seg(p, 0, 1 / 3), view = cubicIO(seg(p, 1 / 3, 2 / 3)), out = seg(p, 2 / 3, 1);
    const b = seg(inn, 0, 0.5), w = seg(out, 0, 0.5);
    onTitle.style.opacity = (b * (1 - w)).toFixed(3);
    onLayer.style.opacity = b.toFixed(3);
    offLayer.style.opacity = (1 - w).toFixed(3);
    onLayer.style.clipPath = `inset(0 0 0 ${(view * 100).toFixed(2)}%)`;
    offLayer.style.clipPath = `inset(0 ${(100 - view * 100).toFixed(2)}% 0 0)`;
  };
  on(window, "scroll", onoff, { passive: true });
  onoff();

  /* First-open loading (original LoadingUI) — only once. The logo brightens as much as has loaded, and five photos scatter to positions more than 250px apart from each other,
     Opens one by one from the left as items arrive, .4s power2.out. .5s after all are open, they wipe away downward in reverse at .1s intervals, .5s power4.inOut, and
     Logo letters shrink to .95x and go out with a .05s stagger over .45s Power3.inOut. The copy has no asset to download, so the download progress is set to 1.6s */
  if (!window.BRAND.loaded && !reduce) {
    window.BRAND.loaded = true;
    const LB = ["Morning by the window · horizontal 4:3", "Person walking a forest path · portrait 3:4", "Light on the water · landscape 4:3", "Hands exercising · portrait 3:4", "Cup on desk · landscape 4:3"];
    document.body.insertAdjacentHTML("beforeend", `<div class="h-loader" aria-hidden="true"><div class="h-loader__imgs">${LB.map((l, i) => `<div class="h-loader__img wf-img${i % 2 ? " is-tall" : ""}" data-label="${l}"></div>`).join("")}</div><p class="h-loader__logo en">${[..."/brand"].map((ch) => `<span>${ch}</span>`).join("")}</p></div>`);
    const loader = document.body.lastElementChild, logo = loader.querySelector(".h-loader__logo");
    const imgs = [...loader.querySelectorAll(".h-loader__img")].sort(() => Math.random() - 0.5);
    const placed = [];
    imgs.forEach((im, i) => {
      const r = im.getBoundingClientRect(), hw = r.width / 2, hh = r.height / 2;
      let x, y, k = 0;
      do { x = rand(hw + 20, innerWidth - hw - 20); y = rand(hh + 20, innerHeight - hh - 20); k++; } while (placed.some((p) => Math.hypot(p.x - x, p.y - y) < 250) && k < 100);
      placed.push({ x, y });
      Object.assign(im.style, { left: `${x}px`, top: `${y}px`, zIndex: i });
    });
    gsap.set(imgs, { clipPath: "inset(0 100% 0 0)" });
    let shown = 0, busy = false, wiped = false;
    const state = { p: 0 };
    const wipe = async () => {
      if (wiped) return;
      wiped = true;
      await new Promise((r) => setTimeout(r, 500));
      const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });
      [...imgs].reverse().forEach((im, k) => tl.to(im, { clipPath: "inset(0 0 100% 0)", duration: 0.5 }, k * 0.1));
      logo.querySelectorAll("span").forEach((sp, k) => gsap.to(sp, { opacity: 0, scale: 0.95, duration: 0.45, ease: "power3.inOut", delay: k * 0.05 }));
      await tl;
      await gsap.to(loader, { opacity: 0, duration: 0.5, ease: "power2.out" });
      loader.remove();
    };
    const next = async () => {
      if (busy || shown >= Math.min(imgs.length, Math.floor(state.p * imgs.length) + 1)) return;
      busy = true;
      await gsap.to(imgs[shown], { clipPath: "inset(0 0% 0 0)", duration: 0.4, ease: "power2.out" });
      shown++;
      busy = false;
      if (shown >= imgs.length) wipe(); else next();
    };
    gsap.to(state, { p: 1, duration: 1.6, ease: "none", onUpdate: () => { logo.style.opacity = state.p.toFixed(3); next(); } });
    offs.push(() => loader.isConnected && loader.remove());
  }

  const tick = (t, dt) => frame(dt / 1000);
  gsap.ticker.add(tick);
  // When moving to another page — detach listeners and clocks, and return WebGL resources
  return () => {
    offs.forEach((f) => f());
    gsap.ticker.remove(tick);
    [scene, ch1Scene, ch2Scene].forEach((sc) => sc.traverse((o) => {
      o.geometry?.dispose();
      [].concat(o.material || []).forEach((m) => { m.map?.dispose(); m.dispose(); });
    }));
    renderer.dispose();
    renderer.domElement.remove();
  };
  };
})();
