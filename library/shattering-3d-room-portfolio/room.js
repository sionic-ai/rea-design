// The home 3D room — one canvas is fixed to the screen, and the room is drawn to fit the currently visible slot (data-room-slot).
// hero: original laptop .84x at 49.5% and 45% of the screen = At 1440 width the room is about 1040px wide (1.0 with our camera — measured and confirmed), 1.2 at 1441 and above, rotated 21° to the left and swaying slowly · performance (transformation section): by scroll share p — at p .2~.45 the furniture scatters and tumbles around
// ‹idea› pieces float up, and the p .6~.85 pieces shrink into the place of the ‹business› letters and gather · contact: furniture stands around the screen edge avoiding the text box, drifting and floating up when pushed by the cursor.
// Cursor: the sun moves toward the cursor and the shadow sweeps the floor (the room doesn’t rotate), and brackets·name tags are drawn on the pointed furniture.
// The original room model (GLB) and shader are not used — these are our own box, cylinder and ring shapes with the same silhouette. Lighting follows the original direction and intensity (LEVELS below).
(() => {
  const canvas = document.querySelector(".experience-canvas");
  if (!canvas || !window.THREE) return;
  const T = THREE, TAU = Math.PI * 2, reduced = RI.reduced;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const hash = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 1e4) / 1e4; };

  const probe = document.createElement("canvas").getContext("2d");
  const tone = (v) => { const d = document.createElement("i"); d.style.color = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1); const [r, g, b] = probe.getImageData(0, 0, 1, 1).data; return new T.Color(r / 255, g / 255, b / 255).convertSRGBToLinear(); };
  const M = { plaster: new T.MeshStandardMaterial({ roughness: 0.85 }), floor: new T.MeshStandardMaterial({ roughness: 0.9 }), gold: new T.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05 }) };
  const paint = () => { const p = tone("--site-plaster"); M.plaster.color.copy(p); M.floor.color.copy(p).multiplyScalar(0.92); M.gold.color.copy(tone("--site-gold")); };

  const box = (w, h, d, m = M.plaster) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.castShadow = o.receiveShadow = true; return o; };
  const cyl = (r1, r2, h, m = M.plaster, s = 20) => { const o = new T.Mesh(new T.CylinderGeometry(r1, r2, h, s), m); o.castShadow = o.receiveShadow = true; return o; };
  const put = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };
  const group = (...kids) => { const g = new T.Group(); kids.forEach((k) => g.add(k)); return g; };
  // Furniture — our shapes, following the original room’s positions and size ratios
  const F = {
    frameTable: (w = 1.6, h = 0.8, d = 0.9) => group(put(box(w, 0.14, d, M.gold), 0, h, 0), put(box(0.14, h, 0.14, M.gold), -w / 2 + 0.07, h / 2, -d / 2 + 0.07), put(box(0.14, h, 0.14, M.gold), w / 2 - 0.07, h / 2, d / 2 - 0.07), put(box(w, 0.14, 0.14, M.gold), 0, 0.07, d / 2 - 0.07), put(box(0.14, 0.14, d, M.gold), -w / 2 + 0.07, 0.07, 0)),
    frameStool: () => group(put(box(0.8, 0.12, 0.8, M.gold), 0, 0.7, 0), put(box(0.12, 0.7, 0.8, M.gold), -0.34, 0.35, 0), put(box(0.8, 0.12, 0.12, M.gold), 0, 0.06, 0.34), put(box(0.12, 0.9, 0.12, M.gold), 0.34, 1.15, -0.34)),
    sofa: () => group(put(box(2.4, 0.45, 1, M.plaster), 0, 0.3, 0), put(box(2.4, 0.7, 0.28, M.plaster), 0, 0.7, -0.36), put(box(0.28, 0.6, 1, M.plaster), -1.06, 0.55, 0), put(box(0.28, 0.6, 1, M.plaster), 1.06, 0.55, 0)),
    table: (w = 2, d = 1.1) => { const g = group(put(box(w, 0.08, d), 0, 0.82, 0)); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(put(box(0.07, 0.8, 0.07), (x * (w - 0.2)) / 2, 0.4, (z * (d - 0.2)) / 2)); return g; },
    chair: () => group(put(box(0.5, 0.06, 0.5), 0, 0.48, 0), put(box(0.5, 0.6, 0.05), 0, 0.8, -0.23), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => put(cyl(0.025, 0.025, 0.48), x * 0.21, 0.24, z * 0.21))),
    shelf: () => { const g = group(put(box(0.06, 2.6, 0.5), -0.7, 1.3, 0), put(box(0.06, 2.6, 0.5), 0.7, 1.3, 0)); for (let i = 0; i < 5; i++) { g.add(put(box(1.4, 0.06, 0.5), 0, 0.1 + i * 0.6, 0)); for (let b = 0; b < 6; b++) g.add(put(box(0.12, 0.38 + (b % 3) * 0.06, 0.36), -0.55 + b * 0.2, 0.33 + i * 0.6 + (b % 3) * 0.03, 0)); } return g; },
    desk: () => group(put(box(1.8, 0.07, 0.8), 0, 0.78, 0), put(box(0.07, 0.78, 0.7), -0.85, 0.39, 0), put(box(0.07, 0.78, 0.7), 0.85, 0.39, 0), put(box(1.1, 0.68, 0.05), 0, 1.2, -0.2), put(box(0.1, 0.36, 0.1), 0, 0.98, -0.22), put(box(0.5, 0.03, 0.34), 0.45, 0.83, 0.12)),
    lamp: () => group(put(cyl(0.22, 0.22, 0.05), 0, 0.03, 0), put(cyl(0.025, 0.025, 1.6), 0, 0.82, 0), put(cyl(0.12, 0.38, 0.4), 0, 1.75, 0)),
    plant: () => { const g = group(put(cyl(0.26, 0.2, 0.45), 0, 0.23, 0)); for (let i = 0; i < 7; i++) { const l = box(0.08, 0.7, 0.03); l.position.set(Math.cos(i) * 0.08, 0.75, Math.sin(i) * 0.08); l.rotation.set(Math.sin(i * 2) * 0.5, i, Math.cos(i * 3) * 0.5); g.add(l); } return g; },
    vase: () => { const o = new T.Mesh(new T.LatheGeometry([[0, 0], [0.18, 0.02], [0.24, 0.25], [0.12, 0.55], [0.08, 0.75], [0.12, 0.85], [0, 0.85]].map(([x, y]) => new T.Vector2(x, y)), 22), M.plaster); o.castShadow = true; return group(o); },
    cup: () => group(put(cyl(0.09, 0.07, 0.18), 0, 0.09, 0)),
    arm: () => group(put(cyl(0.18, 0.22, 0.25), 0, 0.12, 0), put(box(0.12, 0.9, 0.12), 0, 0.65, 0), put(box(0.8, 0.1, 0.1), 0.35, 1.1, 0), put(box(0.08, 0.3, 0.2), 0.75, 0.95, 0)),
    bench: () => group(put(box(1.2, 0.5, 0.45), 0, 0.25, 0)),
  };
  // Room shell — floor, back wall (two windows and blinds), left wall
  const shell = new T.Group();
  shell.add(put(box(10, 0.3, 6.4, M.floor), 0, -0.15, 0));
  const back = new T.Group();
  back.add(put(box(10, 0.8, 0.25), 0, 0.4, -3.2), put(box(10, 0.7, 0.25), 0, 3.65, -3.2), put(box(1.6, 2.5, 0.25), -4.2, 2.05, -3.2), put(box(0.6, 2.5, 0.25), 0.3, 2.05, -3.2), put(box(1.5, 2.5, 0.25), 4.25, 2.05, -3.2));
  for (let i = 0; i < 12; i++) { back.add(put(box(3.8, 0.05, 0.06), -1.55, 0.95 + i * 0.2, -3.12)); back.add(put(box(3.6, 0.05, 0.06), 2.35, 0.95 + i * 0.2, -3.12)); }
  shell.add(back, put(box(0.25, 4, 6.4), -5, 2, 0));
  const ITEMS = [
    ["shelf", -4.5, 0, -1.4, Math.PI / 2], ["shelf", -4.5, 0, 0.3, Math.PI / 2], ["sofa", -2.6, 0, -1.8, 0], ["table", -1.4, 0, 0.6, 0, 1.4, 1],
    ["frameTable", -2.6, 0, 1.2, 0.2, 1.4, 0.7, 0.8], ["frameTable", -0.2, 0, 0.9, 0, 2, 0.9, 1], ["frameStool", -3.6, 0, 0.9, 0.4], ["frameStool", 3.2, 0, 1.1, -0.3], ["frameTable", 1.1, 0, -1.6, 0, 1.2, 0.9, 0.7],
    ["table", 2, 0, 0.2, 0, 1.6, 1.1], ["chair", 2.1, 0, 1, Math.PI], ["chair", 1.3, 0, 0.25, Math.PI / 2], ["chair", 2.9, 0, -0.3, -Math.PI / 2],
    ["desk", 3.4, 0, -2.4, 0], ["chair", 3.4, 0, -1.6, Math.PI], ["arm", 4.3, 0, 0.2, 0], ["bench", 4.4, 0, 2.3, 0],
    ["lamp", -1.6, 0, -2.6, 0], ["lamp", 0.4, 0, 1.6, 0], ["plant", -4.4, 2.75, -1.4, 0], ["plant", 4.3, 0, -2.8, 0], ["plant", 0.2, 0.82, -1.6, 0],
    ["vase", -1.4, 0.86, 0.6, 0], ["vase", -0.4, 1.04, 0.9, 0], ["vase", 2.3, 0.86, 0.1, 0], ["cup", 1.7, 0.86, 0.35, 0], ["cup", -1.1, 0.86, 0.75, 0], ["cup", 3.6, 0.82, -2.3, 0],
  ];
  const room = new T.Group(), pieces = [];
  room.add(shell);
  // Shape size (room units) — in the closing section, the radius the cursor pushes follows the furniture screen size
  const sizeOf = (o) => new T.Box3().setFromObject(o).getSize(new T.Vector3());
  ITEMS.forEach(([k, x, y, z, ry, ...args], i) => {
    const pivot = new T.Group(), inner = F[k](...args), size = sizeOf(inner);
    pivot.add(inner);
    pivot.position.set(x, y, z);
    pivot.rotation.y = ry;
    room.add(pivot);
    const seed = hash(`${k}:${i}`);
    pieces.push({ pivot, size, home: pivot.position.clone(), homeQ: pivot.quaternion.clone(), seed, i,
      scatter: new T.Vector3((seed - 0.5) * 22, 0.5 + hash(`y${i}`) * 8, (hash(`z${i}`) - 0.5) * 9), axis: new T.Vector3(seed - 0.5, 1, hash(`a${i}`) - 0.5).normalize(),
      cur: pivot.position.clone(), curQ: pivot.quaternion.clone(), curS: 1 });
  });
  // Small pieces — a small book, cup, plate, and yellow frame visible only in the scattering scene and the finale
  const BITS = [() => box(0.5, 0.08, 0.36), () => cyl(0.12, 0.1, 0.22), () => cyl(0.3, 0.3, 0.04), () => group(put(box(0.5, 0.08, 0.08, M.gold), 0, 0.25, 0), put(box(0.08, 0.5, 0.08, M.gold), -0.21, 0, 0), put(box(0.08, 0.3, 0.08, M.gold), 0.21, 0.1, 0)), () => box(0.3, 0.3, 0.3), F.chair, F.vase, F.cup];
  for (let i = 0; i < 80; i++) {
    const pivot = new T.Group(), seed = hash(`bit${i}`), inner = BITS[i % BITS.length](), size = sizeOf(inner);
    pivot.add(inner);
    pivot.scale.setScalar(0.0001);
    room.add(pivot);
    const at = new T.Vector3((seed - 0.5) * 9, 0.4, (hash(`bz${i}`) - 0.5) * 5);
    pieces.push({ pivot, size, bit: true, home: at, homeQ: new T.Quaternion(), seed, i: ITEMS.length + i,
      scatter: new T.Vector3((seed - 0.5) * 26, -1.5 + hash(`by${i}`) * 10, (hash(`bq${i}`) - 0.5) * 10), axis: new T.Vector3(seed - 0.5, 1, hash(`ba${i}`) - 0.5).normalize(),
      cur: at.clone(), curQ: new T.Quaternion(), curS: 0 });
  }
  const shellParts = shell.children;
  room.position.y = -1.6;
  const world = new T.Group();
  world.add(room);

  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, 0.1, 200);
  const sun = new T.DirectionalLight(new T.Color(1, 0.965, 0.91), 3.4); /* Not skin: warm white light of the original lighting */
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
  sun.shadow.bias = -0.0005;
  const cool = new T.DirectionalLight(new T.Color(0.92, 0.94, 1), 0.45); /* Not skin: cool light of the original lighting */
  cool.position.set(-10, 3, 6);
  // Sun — as in the original, relative to the room, shines from the upper right beyond the back window (height 28°) toward the front left so window light falls on the floor. Dark brightness uses a low sun (height 10°·azimuth −10°).
  // Parallax: shifts azimuth ±14° · height ±8° (dark brightness ±4° · ±3°) by the cursor’s screen position (−1 to 1), and each frame follows 5.5% of the remainder (original values, settles in about .7s).
  // The room stays still while only window light and shadow sweep across the floor. Off for coarse pointers (touch) and reduced motion. Distances and aim spots are scaled by the original room size ratio (about 1.9x)
  const deg = T.MathUtils.degToRad, sunFrom = new T.Vector3(-0.45, -0.47, 0.76).normalize();
  const SUN = { light: { az: Math.atan2(sunFrom.x, sunFrom.z), el: Math.asin(-sunFrom.y), swingAz: deg(14), swingEl: deg(8) }, dark: { az: deg(-10), el: deg(10), swingAz: deg(4), swingEl: deg(3) } };
  const sunAim = new T.Vector3(-1.7, 0, 1.9), SUN_DIST = 13.3, sunOff = { az: 0, el: 0 }, sunDir = new T.Vector3();
  const sunLive = !reduced && !matchMedia("(pointer: coarse)").matches;
  const moveSun = (dt, mx, my) => {
    const S = document.documentElement.dataset.theme === "dark" ? SUN.dark : SUN.light;
    const k = 1 - Math.pow(1 - 0.055, dt * 60), on = sunLive && mx > -1e3;
    sunOff.az += ((on ? (mx / W) * 2 - 1 : 0) * S.swingAz - sunOff.az) * k;
    sunOff.el += ((on ? -((my / H) * 2 - 1) : 0) * S.swingEl - sunOff.el) * k;
    sunOff.az = clamp(sunOff.az, -S.swingAz, S.swingAz); sunOff.el = clamp(sunOff.el, -S.swingEl, S.swingEl);
    const az = S.az + sunOff.az, el = S.el + sunOff.el;
    sunDir.set(Math.cos(el) * Math.sin(az), -Math.sin(el), Math.cos(el) * Math.cos(az));
    sun.target.position.copy(sunAim);
    room.localToWorld(sun.target.position);
    sun.position.copy(sunAim).addScaledVector(sunDir, -SUN_DIST);
    room.localToWorld(sun.position);
    sun.target.updateMatrixWorld();
  };
  const hemi = new T.HemisphereLight(new T.Color(1, 1, 1), new T.Color(0.85, 0.81, 0.77), 0.5), amb = new T.AmbientLight(new T.Color(1, 1, 1), 0.08); /* Not skin: sky/ground light */
  scene.add(world, sun, cool, hemi, amb);
  // Light intensity — the light version comes after the sun has moved beyond the window, so it uses the original light values (sun 4.6·fill .7·sky .55·ground .25·exposure 1.05), and the dark version keeps the built values as they are
  const LEVELS = { light: { sun: 4.6, cool: 0.7, hemi: 0.55, amb: 0.25, exposure: 1.05 }, dark: { sun: 3.4, cool: 0.45, hemi: 0.5, amb: 0.08, exposure: 0.5 } };
  // As in the original, viewed low (about 23°) at a slant. Looking down from above makes the room stretch vertically
  cam.position.set(0, 6.2, 14.8);
  cam.lookAt(0, 0.4, 0);

  // ‹idea› piece — letter plate written on canvas
  const ideaTex = (gold) => { const c = document.createElement("canvas"); c.width = 256; c.height = 128; const x = c.getContext("2d"); x.font = `600 96px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-sans")}`; x.textAlign = "center"; x.textBaseline = "middle"; const col = (gold ? M.gold : M.plaster).color.clone().convertLinearToSRGB(); x.fillStyle = `#${col.getHexString()}`; x.fillText("idea", 128, 70); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; };
  let ideas = [];
  const makeIdeas = () => {
    ideas.forEach((s) => { world.remove(s.sprite); s.sprite.material.map.dispose(); s.sprite.material.dispose(); });
    const texW = ideaTex(false), texG = ideaTex(true);
    ideas = Array.from({ length: 90 }, (_, i) => {
      const sprite = new T.Sprite(new T.SpriteMaterial({ map: i % 5 ? texW : texG, transparent: true, depthWrite: false }));
      const s = hash(`idea${i}`);
      world.add(sprite);
      return { sprite, pos: new T.Vector3((s - 0.5) * 24, -2 + hash(`iy${i}`) * 10, (hash(`iz${i}`) - 0.5) * 7), size: 0.5 + hash(`is${i}`) * 0.9, seed: s };
    });
  };

  let W = 1, H = 1;
  const resize = () => { W = innerWidth; H = innerHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, W < 700 ? 1.5 : 1.75)); renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); };
  // The room’s screen position — move the center to (cx, cy) and scale by k
  const frame = (cx, cy, k) => { cam.zoom = k; cam.setViewOffset(W, H, -(cx - W / 2), -(cy - H / 2), W, H); cam.updateProjectionMatrix(); };
  const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 0, 1), 0), hit = new T.Vector3(), ndc = new T.Vector2();
  // Converts a screen px position to in-room coordinates — fitted to a panel that passes through the room center and faces the camera
  const toRoom = (x, y, out) => { ndc.set((x / W) * 2 - 1, -(y / H) * 2 + 1); ray.setFromCamera(ndc, cam); plane.normal.copy(cam.getWorldDirection(new T.Vector3())).negate(); plane.constant = 0; ray.ray.intersectPlane(plane, hit); return room.worldToLocal(out.copy(hit)); };

  const slots = { hero: document.querySelector('[data-room-slot="hero"]'), performance: document.querySelector('[data-room-slot="performance"]'), contact: document.querySelector('[data-room-slot="contact"]') };
  const motion = document.querySelector(".c2n-motion"), letters = [...document.querySelectorAll("[data-idea-letter]")], captions = [...document.querySelectorAll("[data-motion-caption]")];
  const track = document.querySelector(".c2n-motion-track"), reserve = document.querySelector("[data-contact-reserve]");
  const head = document.querySelector(".studio-header");
  // Pointed furniture — measures the screen box and draws corner brackets, the pulled-out line, dot, ”IDEA” label and number (original values).
  // Pick by ray every 1/30 s, and if the cursor is within box+16px, hold instead of picking. Brackets are 14px wider and 12px taller than the box (min 24×20),
  // Drawing .3s — bracket 0~.3 · pulled line .16~.64 · underline·name .43~.82 · number .65~1. Visibility appears with 1−e^(−24·dt) and disappears with 1−e^(−28·dt).
  // Cleared immediately over links/buttons, on scroll, or outside the window
  const hover = (() => {
    if (reduced || !RI.fine) return null;
    const NS = "http://www.w3.org/2000/svg";
    const make = (n, a = {}) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    const svg = make("svg", { class: "ri-hover", "aria-hidden": "true", focusable: "false" });
    const art = make("g", { fill: "none", stroke: "currentColor", "stroke-width": ".75" });
    const stroke = (w) => make("path", { pathLength: "1", "stroke-dasharray": "1", "stroke-dashoffset": "1", "stroke-width": w });
    const corners = stroke(".65"), leader = stroke(".75"), under = stroke(".65");
    const dot = make("circle", { class: "ri-hover-dot", r: "1.7" });
    const label = make("text", { class: "ri-hover-label" }), note = make("text", { class: "ri-hover-note" });
    label.textContent = "IDEA";
    art.append(corners, leader, under, dot, label, note);
    svg.append(art);
    document.body.append(svg);
    const meshes = [];
    pieces.forEach((pc) => pc.pivot.traverse((o) => { if (o.isMesh) { o.userData.pc = pc; meshes.push(o); } }));
    const SKIP = "a, button, input, textarea, select, summary, [role='button'], dialog";
    const st = { p: null, target: null, shown: null, anchor: null, box: null, alpha: 0, draw: 0, cast: -1, side: null, time: 0 };
    const bb = new T.Box3(), corner = new T.Vector3(), pick = new T.Vector2(), r2 = (v) => Math.round(v * 100) / 100;
    const ss = (x, a, b) => smooth((x - a) / (b - a));
    const screenBox = (pc) => {
      bb.setFromObject(pc.pivot);
      if (bb.isEmpty()) return null;
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (let c = 0; c < 8; c++) {
        corner.set(c & 1 ? bb.max.x : bb.min.x, c & 2 ? bb.max.y : bb.min.y, c & 4 ? bb.max.z : bb.min.z).project(cam);
        if (corner.z < -1 || corner.z > 1) continue;
        const x = ((corner.x + 1) / 2) * W, y = ((1 - corner.y) / 2) * H;
        l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y);
      }
      return r - l < 0.5 || b - t < 0.5 ? null : { x: (l + r) / 2, y: (t + b) / 2, w: r - l, h: b - t };
    };
    const live = (pc) => pc.pivot.visible && pc.pivot.scale.x > 0.05 && canvas.style.opacity !== "0";
    // Is the cursor still over that furniture — in a flow field it holds even within 16px of the first grabbed spot
    const holding = (mode) => {
      const p = st.p, b = st.box;
      if (!p || !st.target || !live(st.target)) return false;
      if (mode === "flow" && st.anchor && Math.hypot(p.x - st.anchor.x, p.y - st.anchor.y) <= 16) return true;
      return !!b && Math.abs(p.x - b.x) <= b.w / 2 + 16 && Math.abs(p.y - b.y) <= b.h / 2 + 16;
    };
    const paint = (b, draw) => {
      const pw = Math.max(24, b.w + 14), ph = Math.max(20, b.h + 12), L = b.x - pw / 2, R = b.x + pw / 2, Tp = b.y - ph / 2, B = b.y + ph / 2, f = Math.min(8, Math.max(4, Math.min(pw, ph) * 0.12));
      corners.setAttribute("d", `M${r2(L)} ${r2(Tp + f)}V${r2(Tp)}H${r2(L + f)}M${r2(R - f)} ${r2(Tp)}H${r2(R)}V${r2(Tp + f)}M${r2(R)} ${r2(B - f)}V${r2(B)}H${r2(R - f)}M${r2(L + f)} ${r2(B)}H${r2(L)}V${r2(B - f)}`);
      // The name tag goes to the side with more room — decided once when picking
      const room = Math.min(76, Math.max(28, W * 0.3));
      if (st.side === null) st.side = W - R >= L;
      const s = st.side ? 1 : -1, lo = st.side ? 12 : room + 46, hi = W - (st.side ? room + 46 : 12);
      const dx = clamp(b.x + s * b.w * 0.43, Math.min(lo, hi), Math.max(lo, hi)), lx = dx + s * 30;
      const ly = clamp(b.y - b.h * 0.28 - 8, 24, H - 26), dy = ly + 9, kx = lx - s * 4;
      leader.setAttribute("d", `M${r2(dx)} ${r2(dy)}L${r2(kx - s * 8)} ${r2(ly - 3)}H${r2(kx)}`);
      under.setAttribute("d", `M${r2(lx)} ${r2(ly + 5)}h${s * 39}`);
      dot.setAttribute("cx", r2(dx)); dot.setAttribute("cy", r2(dy));
      for (const tx of [label, note]) { tx.setAttribute("x", r2(lx)); tx.setAttribute("text-anchor", st.side ? "start" : "end"); }
      label.setAttribute("y", r2(ly)); note.setAttribute("y", r2(ly + 17));
      const a = ss(draw, 0, 0.3), c = ss(draw, 0.16, 0.64), u = ss(draw, 0.43, 0.82), m = ss(draw, 0.65, 1);
      corners.setAttribute("stroke-dashoffset", r2(1 - a)); corners.setAttribute("opacity", r2(a * 0.4)); dot.setAttribute("opacity", r2(a));
      leader.setAttribute("stroke-dashoffset", r2(1 - c)); leader.setAttribute("opacity", r2(c * 0.72));
      under.setAttribute("stroke-dashoffset", r2(1 - u)); under.setAttribute("opacity", r2(u * 0.45));
      label.setAttribute("opacity", r2(u)); label.setAttribute("transform", `translate(0 ${r2((1 - u) * 4)})`);
      note.setAttribute("opacity", r2(m * 0.58)); note.setAttribute("transform", `translate(0 ${r2((1 - m) * 4)})`);
    };
    const clear = () => { st.p = st.target = st.anchor = null; };
    return {
      clear,
      point(e) {
        if (e.pointerType === "touch" || e.target?.closest?.(SKIP)) return clear();
        st.p = { x: e.clientX, y: e.clientY };
        if (st.target && !holding(st.mode)) { st.target = st.anchor = null; st.cast = -1; }
      },
      held: () => (st.mode === "flow" && holding("flow") ? st.target : null),
      update(dt, mode, dark) {
        st.time += dt; st.mode = mode;
        svg.classList.toggle("is-dark", dark);
        if (st.p && st.target && holding(mode)) st.cast = st.time;
        else if (st.p && st.time - st.cast >= 1 / 30) {
          st.cast = st.time;
          pick.set((st.p.x / W) * 2 - 1, -(st.p.y / H) * 2 + 1);
          ray.setFromCamera(pick, cam);
          const hit = ray.intersectObjects(meshes, false).find((h) => live(h.object.userData.pc));
          const pc = hit ? hit.object.userData.pc : null;
          if (pc !== st.target) {
            st.target = pc; st.anchor = pc ? { ...st.p } : null;
            if (pc && pc !== st.shown) { st.shown = pc; st.draw = 0; st.alpha = 0; st.side = null; note.textContent = `${String(pc.i + 1).padStart(2, "0")} / OBSERVE`; }
          }
        }
        const on = st.target ? 1 : 0;
        st.alpha += (on - st.alpha) * (1 - Math.exp(-dt * (on ? 24 : 28)));
        if (on) st.draw = Math.min(1, st.draw + dt / 0.3);
        const b = st.shown ? screenBox(st.shown) : null;
        if (!b || st.alpha < 0.008) { svg.style.visibility = "hidden"; if (!on) { st.shown = null; st.box = null; } return; }
        st.box = b;
        paint(b, st.draw);
        svg.style.visibility = "visible";
        svg.style.opacity = r2(st.alpha);
      },
    };
  })();

  // Cursor — touch forgets on release, mouse forgets when leaving the window
  const mouse = { x: -1e4, y: -1e4 };
  const forget = () => { mouse.x = mouse.y = -1e4; };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; hover?.point(e); }, { passive: true, capture: true });
  addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") forget(); }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { forget(); hover?.clear(); });
  addEventListener("blur", () => { forget(); hover?.clear(); });
  addEventListener("scroll", () => hover?.clear(), { passive: true });

  const v = new T.Vector3(), tgt = new T.Vector3(), q = new T.Quaternion(), q2 = new T.Quaternion(), lt = [];
  const c0 = new T.Vector3(), cRight = new T.Vector3(1, 0, 0), cUp = new T.Vector3(0, 1, 0), cFwd = new T.Vector3(0, 0, -1);
  pieces.forEach((pc) => (pc.push = { x: 0, y: 0, vx: 0, vy: 0 }));
  let t0 = performance.now(), last = 0, intro = reduced ? 1 : 0, shown = false, cap = -1;
  RI.roomIntro = () => (intro = 0.0001);
  
  const view = { cx: 0, cy: 0, k: 1, ready: false, op: 1, dark: 0 };
  const stage = new T.Color();
  function draw() {
    const now = performance.now(), t = (now - t0) / 1000, dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    if (intro > 0 && intro < 1) intro = Math.min(1, intro + dt / 1.6);
    const small = W <= 700, wide = W > 1440;
    const hr = slots.hero.getBoundingClientRect(), mr = motion.getBoundingClientRect(), cr = slots.contact.getBoundingClientRect();
    // Current section — transformation section 60% above screen → transformation, closing 75% above → closing, Hero if it remains down to 35% → Hero, in between is flow (.58 show-through)
    let mode, cx, cy, k, p = 0, op = 1, dark = 0, flow = 0;
    if (cr.top < H * 0.75) { mode = "contact"; cx = W / 2; cy = H / 2; k = small ? 0.42 : 0.62; dark = 1; }
    else if (mr.top < H * 0.6 && mr.bottom > H * 0.4) {
      mode = "performance";
      const sr = slots.performance.getBoundingClientRect();
      p = clamp(-mr.top / Math.max(1, mr.height - H), 0, 1);
      cx = sr.left + sr.width / 2; cy = sr.top + sr.height * 0.55; k = (sr.height / H) * (small ? 0.7 : 1.05) * Math.min(1, W / 1100);
      dark = clamp((H * 0.05 - mr.top) / (H * 0.25), 0, 1);
      track?.style.setProperty("--motion-progress", p.toFixed(4));
      track?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
      const c = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
      if (c !== cap) { cap = c; captions.forEach((el, i) => el.classList.toggle("is-current", i === c)); }
    } else if (hr.bottom > H * 0.35) { mode = "hero"; cx = hr.left + hr.width * 0.495; cy = hr.top + H * (small ? 0.53 : 0.42); k = (small ? 0.62 : wide ? 1.02 : 0.85) * (small ? 0.6 : Math.min(1, W / 1000)); }
    else {
      mode = "flow";
      const span = Math.max(1, mr.top - hr.bottom), f = clamp((H * 0.35 - hr.bottom) / span, 0, 1);
      cx = W / 2; cy = H * (0.62 + 0.2 * f); k = (small ? 0.42 : 0.6) * Math.min(1, W / 1000); op = 0.58;
      // Between sections — the room breaks into furniture pieces that flow up the screen from the bottom, then regroup before the transformation section
      flow = smooth(f / 0.25) * (1 - smooth((f - 0.75) / 0.25)); view.f = f;
    }
    // Follows position and size so the room doesn’t jump when sections change (inside a transforming section it sticks directly to scroll)
    const follow = !view.ready || reduced || mode === "performance" ? 1 : 1 - Math.exp(-6 * dt);
    view.cx += (cx - view.cx) * follow; view.cy += (cy - view.cy) * follow; view.k += (k - view.k) * follow;
    view.op += (op - view.op) * (reduced ? 1 : 1 - Math.exp(-8 * dt)); view.dark += (dark - view.dark) * (mode === "performance" || reduced ? 1 : 1 - Math.exp(-8 * dt));
    view.ready = true;
    frame(view.cx, view.cy, view.k);
    canvas.style.opacity = view.op.toFixed(3);
    // When a dark stage (transformation, closing) is behind the header, make header text light
    head?.classList.toggle("is-dark", (mode === "performance" || mode === "contact") && view.dark > 0.5);
    renderer.setClearColor(stage, view.dark);
    room.rotation.y = T.MathUtils.degToRad(-21) + (reduced ? 0 : Math.sin(t * 0.35) * 0.035);
    room.rotation.x = reduced ? 0 : Math.sin(t * 0.27) * 0.012;
    room.updateMatrixWorld(true);
    moveSun(dt, mouse.x, mouse.y);

    const scatter = mode === "performance" ? smooth((p - 0.2) / 0.25) : mode === "contact" ? 1 : 0;
    const gather = mode === "performance" ? smooth((p - 0.6) / 0.25) : 0;
    shellParts.forEach((s) => (s.visible = mode !== "contact"));
    if (gather > 0 && letters.length) letters.forEach((el, i) => { const r = el.getBoundingClientRect(); lt[i] = toRoom(r.left + r.width / 2, r.top + r.height / 2, lt[i] || new T.Vector3()); });
    letters.forEach((el, i) => el.style.setProperty("--a", clamp((gather - 0.35 - i * 0.05) / 0.4, 0, 1).toFixed(3)));
    const box = mode === "contact" && reserve ? reserve.getBoundingClientRect() : null;
    const ff = view.f ?? 0;
    // How much 100px of the closing section’s screen is inside the room — converts the cursor shift to screen px and maps it to room coordinates
    if (mode === "contact") { toRoom(W / 2, H / 2, c0); toRoom(W / 2 + 100, H / 2, cRight).sub(c0); toRoom(W / 2, H / 2 - 100, cUp).sub(c0); cFwd.crossVectors(cUp, cRight).normalize(); }
    const pushOn = mode === "contact" && !reduced && mouse.x > -1e3;
    const held = mode === "flow" ? hover?.held() : null;
    pieces.forEach((pc, i) => {
      const P = pc.push;
      let s = pc.bit ? scatter : 1;
      if (mode === "contact") {
        // Drifts across the whole screen avoiding the text box — pieces that land inside the box are pushed out sideways
        let x = hash(`cx${i}`) * W, y = 70 + hash(`cy${i}`) * (H - 120);
        if (box && x > box.left - 40 && x < box.right + 40 && y > box.top - 30 && y < box.bottom + 30) x = x < W / 2 ? box.left - 40 - hash(`cl${i}`) * Math.max(40, box.left - 80) : box.right + 40 + hash(`cl${i}`) * Math.max(40, W - box.right - 80);
        x += Math.sin(t * (0.5 + pc.seed) + i) * 14; y += Math.cos(t * (0.4 + pc.seed) + i * 2) * 12;
        toRoom(x, y, tgt);
        s = (pc.bit ? 1.3 : 0.52) * (small ? 0.8 : 1);
        // Cursor push (original values): radius 120px plus .55 of the furniture piece’s screen size. The closer it is, the more it shifts sideways 24px and up 30px by (1−distance/radius)²,
        // Follows with a spring (strength 95, damping 12, settles in about .7s) and is clamped within −40~40px horizontal and −48~24px vertical. Tilts up to .16rad by the amount pushed sideways
        let px = 0, py = 0;
        if (pushOn) {
          const bw = Math.max(pc.size.x, pc.size.z) * s * (100 / cRight.length()), bh = pc.size.y * s * (100 / cUp.length());
          const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy) || 1, reach = 120 + Math.max(bw, bh) * 0.55, u = d < reach ? (1 - d / reach) ** 2 : 0;
          px = (dx / d) * u * 24; py = -u * 30;
        }
        P.vx += ((px - P.x) * 95 - P.vx * 12) * dt; P.vy += ((py - P.y) * 95 - P.vy * 12) * dt;
        P.x = clamp(P.x + P.vx * dt, -40, 40); P.y = clamp(P.y + P.vy * dt, -48, 24);
      } else if (flow > 0) {
        const y = H * (1.25 - (((hash(`fy${i}`) + ff * 1.6) % 1) * 1.5)), x = W * (0.08 + 0.84 * hash(`fx${i}`)) + Math.sin(t * 0.4 + i) * 20;
        toRoom(x, y, v);
        tgt.copy(pc.home).lerp(v, flow);
        s = pc.bit ? flow * 0.9 : 1 - flow * 0.55;
      } else {
        tgt.copy(pc.home).lerp(pc.scatter, scatter);
        if (scatter > 0) tgt.y += Math.sin(t * (0.6 + pc.seed) + i) * 0.25 * scatter;
        if (gather > 0) { const L = lt[i % lt.length]; if (L) { v.set((hash(`gx${i}`) - 0.5) * 0.9, (hash(`gy${i}`) - 0.5) * 1.2, 0); tgt.lerp(v.add(L), gather); s *= 1 - gather * 0.72; } }
      }
      q.copy(pc.homeQ);
      const spin = mode === "contact" ? 1 : Math.max(scatter, flow);
      if (spin > 0) { q2.setFromAxisAngle(pc.axis, (pc.seed * TAU + t * (0.3 + pc.seed * 0.4)) * spin); q.multiply(q2); }
      if (mode !== "contact") P.x = P.y = P.vx = P.vy = 0;
      // In the flow field, furniture the cursor holds stops in place
      const kk = pc === held ? 0 : reduced ? 1 : 1 - Math.exp(-7 * dt);
      pc.cur.lerp(tgt, kk); pc.curQ.slerp(q, kk); pc.curS += (s - pc.curS) * kk;
      const born = intro >= 1 ? 1 : smooth((intro * 1.6 - Math.min(pc.i, 40) * 0.025) / 0.6);
      pc.pivot.position.copy(pc.cur).add(v.set(0, (1 - born) * 1.2, 0));
      pc.pivot.quaternion.copy(pc.curQ);
      if (P.x || P.y) {
        pc.pivot.position.addScaledVector(cRight, P.x / 100).addScaledVector(cUp, -P.y / 100);
        pc.pivot.quaternion.premultiply(q2.setFromAxisAngle(cFwd, -clamp(P.x / 24, -1, 1) * 0.16));
      }
      pc.pivot.scale.setScalar(Math.max(0.0001, pc.curS * born));
    });
    shell.visible = intro > 0;
    // The room shell stays while scattering and shrinks when gathering into letters (the white box of the original idea scene)
    shell.scale.setScalar(Math.max(0.0001, (1 - Math.max(gather, flow) * 0.999) * (intro >= 1 ? 1 : smooth(intro * 1.4))));
    const idea = mode === "performance" ? smooth((p - 0.3) / 0.12) * (1 - smooth((p - 0.62) / 0.12)) : 0;
    ideas.forEach((s, i) => {
      s.sprite.visible = idea > 0.01;
      if (!s.sprite.visible) return;
      s.sprite.position.copy(s.pos).applyMatrix4(room.matrixWorld);
      s.sprite.position.y += Math.sin(t * (0.5 + s.seed) + i) * 0.3;
      const kk = s.size * smooth((idea - s.seed * 0.4) / 0.6);
      s.sprite.scale.set(kk * 2, kk, 1);
      s.sprite.material.opacity = Math.min(1, idea * 1.4);
    });
    renderer.render(scene, cam);
    hover?.update(dt, mode, mode === "performance" || mode === "contact");
  }
  const exposure = () => {
    const L = LEVELS[document.documentElement.dataset.theme === "dark" ? "dark" : "light"];
    renderer.toneMappingExposure = L.exposure; sun.intensity = L.sun; cool.intensity = L.cool; hemi.intensity = L.hemi; amb.intensity = L.amb;
    paint(); stage.copy(tone("--site-stage")); makeIdeas();
  };
  resize(); exposure();
  addEventListener("resize", resize);
  addEventListener("ri:theme", exposure);
  RI.ticks.add(() => { if (!document.hidden) draw(); return true; });
})();
