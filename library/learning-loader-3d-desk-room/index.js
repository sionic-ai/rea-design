// 3D desk room — a room rebuilt from our basic shapes. Original values: center (1.1, 1.6, −.6) · start yaw .95 · pitch .3 · distance 11.5 · FOV 32° (portrait screen 70°),
// Drag .004rad per px (pitch .15~.8, yaw −.3~1.5 · portrait screen −.8~1.3), releasing within 6px counts as a press, attach·detach 1.6s smootherstep. On the object screen a CSS3D panel is attached in perspective as it is
(() => {
  const canvas = document.querySelector(".rh-scene");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let built = 0;
  const STEPS = 6;
  window.rhRoom = { progress: () => built / STEPS, ready: () => built >= STEPS, hover: () => "", dragging: () => false };
  if (!canvas || !window.THREE) { built = STEPS; return; }
  const T = THREE;

  // Skin variable to sRGB — the computed color may come out as an oklch string, so paint it on a canvas and read it
  const probe = document.body.appendChild(document.createElement("i"));
  const cx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const col = (expr) => {
    probe.style.color = expr;
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = getComputedStyle(probe).color; cx.fillRect(0, 0, 1, 1);
    const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
    return new T.Color(`rgb(${r}, ${g}, ${b})`);
  };
  // Relative color syntax (oklch from …) can’t be read by canvas and turns black in some browsers — read only the four base colors of the skin and build the rest with three color operations
  const B = { bg: col("var(--kf-bg)"), ink: col("var(--kf-ink)"), dim: col("var(--kf-dim)"), accent: col("var(--kf-accent)") };
  const C = {
    bg: B.bg, ink: B.ink, accent: B.accent,
    floor: B.bg.clone().lerp(B.dim, 0.14), wall: B.bg.clone().lerp(B.dim, 0.24),
    wood: B.ink.clone().lerp(B.bg, 0.72), metal: B.dim.clone().lerp(B.bg, 0.5), dark: B.bg.clone().multiplyScalar(0.6),
    cool: B.accent.clone().offsetHSL(0.55, -0.1, 0), warm: B.accent.clone().offsetHSL(0.08, 0.1, -0.05), cork: B.ink.clone().lerp(B.accent, 0.35).lerp(B.bg, 0.45),
  };
  probe.remove();

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  // Shadow map is turned off — r186’s shadow sampler has a format mismatch on some GPUs (metal ANGLE), so drawing of shadow-receiving objects is dropped entirely
  const scene = new T.Scene();
  scene.background = C.bg;
  scene.fog = new T.Fog(C.bg, 18, 34);
  const portrait = () => innerWidth / innerHeight < 1;
  const camera = new T.PerspectiveCamera(portrait() ? 70 : 32, innerWidth / innerHeight, 0.1, 80);
  const css = new T.CSS3DRenderer({ element: document.querySelector(".rh-css3d") });
  const cssScene = new T.Scene();

  const mat = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05, ...o });
  const box = (w, h, d, m, x, y, z, parent = scene) => {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };

  // The scene is built in several steps — the loader bar follows the actual build
  const hot = new Map();
  const glassOf = (key, pos, normal, w, h, label) => hot.set(key, { key, pos, normal: normal.normalize(), w, h, label, meshes: [] });
  const tag = (key, ...meshes) => { meshes.forEach((m) => { m.name = key; hot.get(key).meshes.push(m); }); };
  const build = [
    () => { // Room shell: floor, two walls, baseboard
      const floor = new T.Mesh(new T.PlaneGeometry(16, 13), mat(C.floor, { roughness: 0.55 }));
      floor.rotation.x = -Math.PI / 2; floor.position.set(1.95, 0, 1.45); floor.receiveShadow = true; scene.add(floor);
      const wallA = new T.Mesh(new T.PlaneGeometry(16, 6.5), mat(C.wall)); wallA.position.set(1.95, 3.25, -5); wallA.receiveShadow = true; scene.add(wallA);
      const wallB = new T.Mesh(new T.PlaneGeometry(13, 6.5), mat(C.wall)); wallB.rotation.y = Math.PI / 2; wallB.position.set(-6, 3.25, 1.5); wallB.receiveShadow = true; scene.add(wallB);
      box(16, 0.18, 0.06, mat(C.dark), 1.95, 0.09, -4.97); box(0.06, 0.18, 13, mat(C.dark), -5.97, 0.09, 1.5);
    },
    () => { // Desk, chair, monitor (projects), phone (contact)
      const top = box(4.6, 0.12, 2, mat(C.wood, { roughness: 0.6 }), 1.1, 1.5, -2.9);
      [[-1.1, -0.85], [1.1, -0.85], [-1.1, 0.85], [1.1, 0.85]].forEach(([dx, dz]) => box(0.08, 1.44, 0.08, mat(C.metal, { metalness: 0.6, roughness: 0.4 }), 1.1 + dx * 1.9, 0.72, -2.9 + dz));
      void top;
      box(0.5, 0.06, 0.35, mat(C.metal, { metalness: 0.7, roughness: 0.3 }), 1.1, 1.59, -3.3); box(0.08, 0.7, 0.08, mat(C.metal, { metalness: 0.7, roughness: 0.3 }), 1.1, 1.95, -3.4);
      const bezel = box(2.6, 1.55, 0.08, mat(C.dark, { roughness: 0.4 }), 1.1, 2.75, -3.35);
      glassOf("projects", new T.Vector3(1.1, 2.75, -3.305), new T.Vector3(0, 0, 1), 2.44, 1.39, "Open projects");
      tag("projects", bezel);
      box(1.3, 0.04, 0.45, mat(C.dark), 1.1, 1.58, -2.4); // Keyboard
      const phone = box(0.34, 0.03, 0.66, mat(C.dark, { roughness: 0.3 }), 2.75, 1.575, -2.35);
      phone.rotation.y = -0.25;
      const pg = new T.Mesh(new T.PlaneGeometry(0.3, 0.6), new T.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0.18 }));
      pg.rotation.x = -Math.PI / 2; pg.rotation.z = -0.25; pg.position.set(2.75, 1.592, -2.35); scene.add(pg);
      glassOf("contact", new T.Vector3(2.75, 1.593, -2.35), new T.Vector3(0, 1, 0), 0.3, 0.6, "Contact");
      hot.get("contact").up = new T.Vector3(-Math.sin(0.25), 0, -Math.cos(0.25));
      tag("contact", phone, pg);
      const seat = box(1.1, 0.12, 1.1, mat(C.dark), 1.3, 0.95, -1.2); const back = box(1.1, 1.2, 0.12, mat(C.dark), 1.3, 1.6, -0.68);
      back.rotation.x = -0.12; box(0.08, 0.9, 0.08, mat(C.metal, { metalness: 0.7 }), 1.3, 0.45, -1.2); void seat;
      const lampArm = box(0.05, 1.1, 0.05, mat(C.metal, { metalness: 0.7 }), -0.75, 2.1, -3.4); lampArm.rotation.z = 0.35;
      const shade = new T.Mesh(new T.ConeGeometry(0.22, 0.3, 24, 1, true), mat(C.warm, { side: T.DoubleSide, emissive: C.warm, emissiveIntensity: 0.6 }));
      shade.position.set(-0.55, 2.65, -3.2); shade.rotation.z = 2.4; scene.add(shade);
    },
    () => { // Desk-side TV-head robot (about — face screen is the chat panel) · right wall perforated panel badge (experience) · shelf speaker (music)
      const bot = new T.Group(); bot.position.set(1.5, 0, -1.25); bot.rotation.y = 0.75; scene.add(bot);
      const shell = mat(C.ink.clone().lerp(C.wall, 0.25), { roughness: 0.5 });
      box(0.9, 0.95, 0.7, shell, 0, 1.55, 0, bot); box(0.25, 0.2, 0.25, mat(C.dark), 0, 2.12, 0, bot);
      const head = box(1.05, 0.85, 0.85, shell, 0, 2.62, 0, bot);
      box(0.04, 0.45, 0.04, mat(C.dark), -0.25, 3.25, 0, bot); box(0.04, 0.45, 0.04, mat(C.dark), 0.25, 3.25, 0, bot);
      [-0.25, 0.25].forEach((x) => { const b = new T.Mesh(new T.SphereGeometry(0.06, 12, 8), mat(C.dark)); b.position.set(x, 3.5, 0); bot.add(b); });
      [-0.55, 0.55].forEach((x) => { const arm = box(0.16, 0.7, 0.16, shell, x, 1.55, 0.2, bot); arm.rotation.x = -0.9; });
      const face = new T.Mesh(new T.PlaneGeometry(0.82, 0.62), new T.MeshBasicMaterial({ color: C.accent }));
      face.position.set(0, 2.62, 0.426); bot.add(face);
      bot.updateMatrixWorld(true);
      const facePos = face.getWorldPosition(new T.Vector3()), faceN = new T.Vector3(0, 0, 1).applyQuaternion(bot.quaternion);
      glassOf("about", facePos.addScaledVector(faceN, 0.002), faceN, 0.82, 0.62, "Talk to him");
      tag("about", head, face);
      const board = box(2.9, 1.9, 0.08, mat(C.dark, { roughness: 0.9 }), 3.6, 3.2, -4.95);
      for (let i = 0; i < 5; i++) { const lan = box(0.04, 0.7, 0.01, mat([C.accent, C.cool, C.warm, C.ink, C.accent][i]), 2.6 + i * 0.5, 3.6, -4.9); void lan; }
      glassOf("experience", new T.Vector3(3.6, 3.2, -4.905), new T.Vector3(0, 0, 1), 2.74, 1.76, "Experience");
      tag("experience", board);
      const glow = new T.Mesh(new T.PlaneGeometry(3.1, 2.1), new T.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0.12 }));
      glow.position.set(3.6, 3.2, -4.97); scene.add(glow);
      // A pink diamond marker bobs above each object
      const marks = [];
      const gem = new T.OctahedronGeometry(0.09);
      [[1.1, 3.75, -3.3], [3.6, 4.4, -4.8], [2.75, 1.95, -2.35], [1.5, 3.95, -1.25], [5.0, 2.45, -4.6]].forEach(([x, y, z]) => {
        const g = new T.Mesh(gem, new T.MeshBasicMaterial({ color: C.accent })); g.scale.set(1, 1.6, 1); g.position.set(x, y, z); g.userData.y = y; scene.add(g); marks.push(g);
      });
      window.rhRoom.marks = marks;
      box(2.4, 0.08, 0.6, mat(C.wood), 5.2, 1.3, -4.65);
      const spk = box(0.55, 0.8, 0.45, mat(C.dark), 4.5, 1.74, -4.6); const disc = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 0.03, 40), mat(C.ink, { roughness: 0.3 }));
      disc.position.set(5.4, 1.36, -4.6); scene.add(disc);
      const cone = new T.Mesh(new T.CircleGeometry(0.16, 32), mat(C.metal)); cone.position.set(4.5, 1.8, -4.37); scene.add(cone);
      glassOf("music", new T.Vector3(5.4, 1.38, -4.6), new T.Vector3(0, 1, 0), 0.7, 0.7, "Now playing");
      hot.get("music").up = new T.Vector3(0, 0, -1);
      tag("music", spk, disc);
    },
    () => { // City outside the window — canvas drawing (window lights flicker now and then)
      const cw = 512, ch = 320, cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
      const g = cv.getContext("2d");
      const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
      let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const towers = Array.from({ length: 16 }, (_, i) => ({ x: i * 34 + rnd() * 10, w: 22 + rnd() * 18, h: 80 + rnd() * 170 }));
      const lights = [];
      towers.forEach((t) => { for (let y = ch - t.h + 8; y < ch - 6; y += 9) for (let x = t.x + 3; x < t.x + t.w - 3; x += 6) if (rnd() > 0.55) lights.push([x, y, rnd() > 0.85]); });
      const paint = () => {
        const sky = g.createLinearGradient(0, 0, 0, ch);
        sky.addColorStop(0, `#${C.bg.getHexString()}`); sky.addColorStop(1, `#${C.accent.clone().lerp(C.bg, 0.6).getHexString()}`);
        g.fillStyle = sky; g.fillRect(0, 0, cw, ch);
        g.fillStyle = `#${C.dark.getHexString()}`; towers.forEach((t) => g.fillRect(t.x, ch - t.h, t.w, t.h));
        lights.forEach(([x, y, c]) => { g.fillStyle = `#${(c ? C.cool : C.warm).getHexString()}`; g.globalAlpha = Math.random() > 0.02 ? 0.85 : 0.2; g.fillRect(x, y, 2, 3); });
        g.globalAlpha = 1; tex.needsUpdate = true;
      };
      paint(); window.rhRoom.paintCity = paint;
      const win = new T.Mesh(new T.PlaneGeometry(3.6, 2.25), new T.MeshBasicMaterial({ map: tex }));
      win.rotation.y = Math.PI / 2; win.position.set(-5.96, 3.4, -1.8); scene.add(win);
      box(0.12, 0.08, 3.8, mat(C.dark), -5.92, 2.24, -1.8); box(0.12, 0.08, 3.8, mat(C.dark), -5.92, 4.56, -1.8); box(0.12, 2.4, 0.08, mat(C.dark), -5.92, 3.4, -1.8);
    },
    () => { // Plant, books, rug
      const pot = new T.Mesh(new T.CylinderGeometry(0.32, 0.26, 0.6, 24), mat(C.wall)); pot.position.set(-4.6, 0.3, -3.9); pot.castShadow = true; scene.add(pot);
      for (let i = 0; i < 7; i++) { const leaf = new T.Mesh(new T.SphereGeometry(0.28, 12, 8), mat(C.cool.clone().lerp(C.dark, 0.55))); leaf.scale.set(0.6, 1.4, 0.3); leaf.position.set(-4.6 + Math.cos(i) * 0.25, 1 + (i % 3) * 0.22, -3.9 + Math.sin(i) * 0.25); leaf.rotation.z = Math.cos(i) * 0.6; scene.add(leaf); }
      [0, 1, 2, 3].forEach((i) => box(0.16, 0.5 + (i % 2) * 0.12, 0.42, mat([C.accent, C.cool, C.ink, C.warm][i].clone().lerp(C.dark, 0.45)), 4.3 + i * 0.19, 1.6 + (i % 2) * 0.06, -4.6 + 0.0));
      const rug = new T.Mesh(new T.CircleGeometry(2.6, 48), mat(C.accent.clone().lerp(C.dark, 0.9), { roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(1.3, 0.005, -0.9); rug.receiveShadow = true; scene.add(rug);
    },
    () => { // Light — dark navy base + pink screen glow + warm desk lamp + cool window light
      scene.add(new T.HemisphereLight(C.cool, C.wall, 0.45)); scene.add(new T.AmbientLight(C.wall, 0.3));
      const lamp = new T.PointLight(C.warm, 22, 10, 1.6); lamp.position.set(-0.5, 2.5, -3.0); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); scene.add(lamp);
      const screen = new T.PointLight(C.accent, 14, 7, 1.7); screen.position.set(1.1, 2.6, -2.6); scene.add(screen);
      const tvl = new T.PointLight(C.accent, 9, 6, 1.7); tvl.position.set(3.6, 3.4, -4.2); scene.add(tvl);
      const win = new T.DirectionalLight(C.cool, 0.5); win.position.set(-12, 7, -2); scene.add(win);
      renderer.compile(scene, camera);
    },
  ];
  const buildNext = () => { if (built < STEPS) { build[built](); built++; requestAnimationFrame(buildNext); } };
  requestAnimationFrame(buildNext);

  // CSS3D panel: shrink panel pixels to fit the object’s screen size (world units)
  const PX = 1000;
  const surfaces = new Map();
  document.querySelectorAll("[data-surface]").forEach((el) => {
    const key = el.dataset.surface;
    surfaces.set(key, el);
  });
  const placeSurfaces = () => {
    hot.forEach((h, key) => {
      const el = surfaces.get(key);
      if (!el || h.obj) return;
      const pxW = PX, pxH = Math.round((PX * h.h) / h.w);
      el.style.width = `${pxW}px`; el.style.height = `${pxH}px`;
      const o = new T.CSS3DObject(el);
      o.scale.setScalar(h.w / pxW);
      o.position.copy(h.pos).addScaledVector(h.normal, 0.002);
      const up = h.up || new T.Vector3(0, 1, 0);
      const m = new T.Matrix4().lookAt(new T.Vector3(), h.normal.clone().negate(), up);
      o.quaternion.setFromRotationMatrix(m);
      cssScene.add(o);
      h.obj = o;
    });
  };

  // Camera — original formula: position = Center + (sin yaw · cos pitch, sin pitch, cos yaw · cos pitch) × distance
  const target = new T.Vector3(1.1, 1.6, -0.6);
  const view = { yaw: 0.95, pitch: 0.3, dist: 11.5 };
  const want = { yaw: 0.95, pitch: 0.3 };
  const orbit = (out, v = view) => out.set(target.x + Math.sin(v.yaw) * Math.cos(v.pitch) * v.dist, target.y + Math.sin(v.pitch) * v.dist, target.z + Math.cos(v.yaw) * Math.cos(v.pitch) * v.dist);
  const clampYaw = () => (portrait() ? [-0.8, 1.3] : [-0.3, 1.5]);
  let locked = true;
  if (!reduce) { view.dist = 3.2; view.yaw = 0.75; view.pitch = 0.2; }
  addEventListener("rh:intro", () => {
    if (reduce) { locked = false; return; }
    gsap.to(view, { dist: 11.5, yaw: 0.95, pitch: 0.3, duration: 4.7, ease: "power2.inOut", onUpdate: () => { want.yaw = view.yaw; want.pitch = view.pitch; } });
    setTimeout(() => (locked = false), 15000);
  });
  addEventListener("rh:settled", () => (locked = false));

  // Drag · press · hover
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let down = false, moved = 0, sx = 0, sy = 0, overKey = "";
  const setNdc = (e) => ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const pick = () => {
    if (dock.on) return "";
    ray.setFromCamera(ndc, camera);
    const all = [...hot.values()].flatMap((h) => h.meshes);
    const hit = ray.intersectObjects(all, false)[0];
    return hit ? hit.object.name : "";
  };
  canvas.addEventListener("pointerdown", (e) => { setNdc(e); down = true; moved = 0; sx = e.clientX; sy = e.clientY; });
  addEventListener("pointermove", (e) => {
    setNdc(e);
    overKey = e.target === canvas ? pick() : "";
    if (!down) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 30) document.body.classList.add("is-explored");
    sx = e.clientX; sy = e.clientY;
    if (dock.on || locked) return;
    want.pitch = Math.max(0.15, Math.min(0.8, want.pitch + dy * 0.004));
    const [a, b] = clampYaw();
    want.yaw = Math.max(a, Math.min(b, want.yaw - dx * 0.004));
  });
  addEventListener("pointerup", (e) => {
    if (down && moved < (e.pointerType === "touch" ? 12 : 6)) {
      setNdc(e);
      if (dock.on) setDock(null); else { const k = pick(); if (k && !locked) setDock(k); }
    }
    down = false;
  });
  addEventListener("pointercancel", () => (down = false));
  window.rhRoom.hover = () => (overKey && !dock.on ? hot.get(overKey)?.label || "" : "");
  window.rhRoom.dragging = () => down && moved > 6;

  // Docking — 1.6s smootherstep(6t⁵−15t⁴+10t³), the path is a quadratic curve bending slightly upward, and the look-at point reaches screen center 1.6 times faster
  const dock = { on: false, key: null, t: 0, from: new T.Vector3(), to: new T.Vector3(), via: new T.Vector3(), lookFrom: new T.Vector3(), lookTo: new T.Vector3(), up: new T.Vector3(0, 1, 0) };
  const undock = document.querySelector(".rh-undock");
  const navBtns = [...document.querySelectorAll(".rh-index [data-go]")];
  const fitDist = (h) => {
    const f = T.MathUtils.degToRad(camera.fov / 2);
    return Math.max(h.h / 2 / Math.tan(f), h.w / 2 / (Math.tan(f) * camera.aspect)) * 1.12;
  };
  function setDock(key) {
    const h = key ? hot.get(key) : null;
    dock.from.copy(camera.position);
    dock.lookFrom.copy(dock.on ? dock.lookTo : target);
    if (h) {
      dock.to.copy(h.pos).addScaledVector(h.normal, fitDist(h));
      dock.lookTo.copy(h.pos);
      dock.up.copy(h.up || new T.Vector3(0, 1, 0));
    } else {
      orbit(dock.to, { ...view, yaw: want.yaw, pitch: want.pitch });
      dock.lookTo.copy(target);
      dock.up.set(0, 1, 0);
    }
    dock.via.lerpVectors(dock.from, dock.to, 0.5).add(new T.Vector3(0, 1.2, 0));
    dock.t = 0; dock.moving = true; dock.on = !!h; dock.key = key;
    surfaces.forEach((el, k) => el.classList.toggle("is-live", k === key && false));
    document.body.classList.toggle("is-docked", !!h);
    undock.hidden = !h;
    navBtns.forEach((b) => b.setAttribute("aria-current", String(b.dataset.go === key)));
    document.body.classList.add("is-explored");
  }
  navBtns.forEach((b) => b.addEventListener("click", () => { if (!locked || built >= STEPS) setDock(dock.key === b.dataset.go ? null : b.dataset.go); }));
  undock.addEventListener("click", () => setDock(null));
  addEventListener("keydown", (e) => e.key === "Escape" && dock.on && setDock(null));

  const sstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const pos = new T.Vector3(), look = new T.Vector3(), up = new T.Vector3(), q = new T.Vector3();
  let lastT = performance.now(), cityT = 0;
  const frame = (now) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
    lastT = now;
    if (built >= STEPS && !hot.get("projects").obj) placeSurfaces();
    if (dock.moving) {
      dock.t = Math.min(1, dock.t + (reduce ? 1 : dt / 1.6));
      const n = sstep(dock.t), m = 1 - n;
      pos.copy(dock.from).multiplyScalar(m * m).addScaledVector(dock.via, 2 * m * n).addScaledVector(dock.to, n * n);
      look.lerpVectors(dock.lookFrom, dock.lookTo, Math.min(1, n * 1.6));
      up.set(0, 1, 0).lerp(dock.up, dock.on ? n : 1 - n).normalize();
      camera.position.copy(pos); camera.up.copy(up); camera.lookAt(look);
      if (dock.t >= 1) {
        dock.moving = false;
        surfaces.forEach((el, k) => el.classList.toggle("is-live", k === dock.key));
        if (!dock.on) { camera.up.set(0, 1, 0); }
      }
    } else if (!dock.on) {
      const k = 1 - Math.exp(-dt * 6);
      view.yaw += (want.yaw - view.yaw) * k; view.pitch += (want.pitch - view.pitch) * k;
      orbit(q); camera.position.copy(q); camera.up.set(0, 1, 0); camera.lookAt(target);
    }
    cityT += dt; if (cityT > 0.4 && window.rhRoom.paintCity) { cityT = 0; window.rhRoom.paintCity(); }
    (window.rhRoom.marks || []).forEach((g, i) => { g.position.y = g.userData.y + Math.sin(now / 600 + i) * 0.06; g.rotation.y += dt * 1.2; g.visible = !dock.on; });
    renderer.render(scene, camera);
    css.render(cssScene, camera);
    requestAnimationFrame(frame);
  };
  const size = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    css.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.fov = portrait() ? 70 : 32; camera.updateProjectionMatrix();
  };
  size();
  addEventListener("resize", size);
  orbit(camera.position); camera.lookAt(target);
  requestAnimationFrame(frame);

  // Badge panel · TV tab · clock
  const badges = [...document.querySelectorAll(".bd-badge")], count = document.querySelector("[data-badge-count]");
  let bi = 0;
  document.querySelectorAll("[data-badge]").forEach((b) => b.addEventListener("click", () => {
    bi = (bi + Number(b.dataset.badge) + badges.length) % badges.length;
    badges.forEach((x, i) => x.classList.toggle("is-on", i === bi));
    count.textContent = `${String(bi + 1).padStart(2, "0")} / ${String(badges.length).padStart(2, "0")}`;
  }));
  document.querySelectorAll(".tv-tabs [data-tab]").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tv-tabs [data-tab]").forEach((o) => o.setAttribute("aria-selected", String(o === t)));
    document.querySelectorAll(".tv-panel").forEach((p) => (p.hidden = p.dataset.panel !== t.dataset.tab));
  }));
  const tick = () => {
    const d = new Date();
    document.querySelectorAll("[data-clock]").forEach((el) => (el.textContent = d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).replace(",", "")));
    document.querySelectorAll("[data-clock-short]").forEach((el) => (el.textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })));
  };
  tick(); setInterval(tick, 15000);
})();
