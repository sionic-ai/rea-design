// Evidence board — rebuilds the same structure as the original (three r180 + custom post-processing) with our own drawings and shaders.
// Values measured from the original: camera fov 50 · z 5 (8 on phone), mouse follow lerp .1, drag friction 5 · smoothing 25 · edge damping .75,
// Flashlight circle radius .2 · blur .25 · size 7 (5 on hover), darkness .7 (focus .99), vignette .4/1/.9, lens .05 · chromatic aberration .007, grain .125 · dust .3@30fps.
(() => {
  const T = window.THREE, bus = window.mBus;
  const canvas = document.querySelector(".m-webgl__canvas");
  if (!T || !canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth >= 1024;
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  // Pass the skin’s colors to shaders and canvas — the canvas resolves color-mix too
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    probe.fillStyle = "#000"; probe.fillStyle = v(name) || "#000"; // Not skin: grayscale values that draw paper grain, photo slot and light strength (art material unrelated to skin)
    probe.clearRect(0, 0, 1, 1); probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const hex = (name) => { const [r, g, b] = rgb(name); return `rgb(${r} ${g} ${b})`; };
  const col3 = (name) => new T.Color().setRGB(...rgb(name).map((x) => x / 255), T.SRGBColorSpace);

  // ───────── Original layout (panel coordinates, unit m). Panel 16.9 × 18.8 ─────────
  const BOARD = { w: 16.9, h: 18.8 };
  const LAYOUT = {
    "band": { x: -3.96, y: -4.75, r: 0.06, w: 1.83, h: 2.29 },
    "site-a": { x: -6.2, y: -2.66, r: 0.04, w: 2.28, h: 1.93 },
    "cover-a": { x: 2.98, y: -5.93, r: 0.04, w: 1.93, h: 2.59 },
    "cover-b": { x: 4.57, y: 4.95, r: 0.04, w: 1.77, h: 2.59 },
    "cover-c": { x: -5.1, y: 6.4, r: -0.02, w: 1.77, h: 2.59 },
    "credits": { x: 2.76, y: -1.36, r: 0.04, w: 1.84, h: 2.3 },
    "lyrics-a": { x: 5.38, y: -4.65, r: -0.02, w: 1.84, h: 2.3 },
    "lyrics-b": { x: 2.14, y: 6.26, r: -0.02, w: 1.84, h: 2.3 },
    "lyrics-c": { x: -2.28, y: 1.12, r: -0.02, w: 1.84, h: 2.3 },
    "photo-a": { x: 6.27, y: -7.08, r: 0, w: 1.22, h: 1.54 },
    "photo-b": { x: 4.61, y: 7.4, r: 0, w: 1.22, h: 1.54 },
    "photo-c": { x: 2.06, y: 1.94, r: 0, w: 1.24, h: 1.88 },
    "photo-d": { x: -2.05, y: -1.62, r: -0.02, w: 1.24, h: 1.88 },
    "photo-e": { x: -2.99, y: 4.84, r: 0, w: 1.22, h: 1.54 },
    "photo-f": { x: -4.66, y: 3.75, r: 0.04, w: 1.22, h: 1.54 },
    "site-b": { x: 6.97, y: -0.18, r: 0.04, w: 0.88, h: 1.9 },
  };
  const PINS = [[0.05, 1.36], [7.05, 1.22], [3.69, 7.32], [3.87, -4.13], [-5.44, -4.17], [-4.09, 5.14]];
  const ROPES = [[0, 2], [0, 1], [0, 5], [0, 4], [1, 3], [1, 2], [5, 2], [4, 5], [4, 3]];
  // Six torn sketch pieces in the center (three pairs) — panel slot / game slot / loader slot
  const PIECES = [
    { id: "a1", pair: "a", base: [-0.38, 0.52, 0.02, -0.06], game: [-2.1, 0.95, 0.12, 0.08], intro: [-1.5, 0.9, 1.4, -0.2], w: 1.2, h: 1.05 },
    { id: "a2", pair: "a", base: [0.52, 0.66, 0.03, 0.05], game: [2.05, -0.9, 0.12, -0.06], intro: [1.6, -0.6, 1.2, 0.15], w: 1.05, h: 1.2 },
    { id: "b1", pair: "b", base: [-0.1, -0.05, 0.035, 0.04], game: [0.05, 1.0, 0.12, -0.05], intro: [0.2, 1.1, 1.6, 0.1], w: 1.35, h: 0.8 },
    { id: "b2", pair: "b", base: [0.62, -0.36, 0.025, -0.08], game: [-2.0, -0.92, 0.12, 0.06], intro: [-1.3, -1.0, 1.1, -0.12], w: 0.95, h: 1.0 },
    { id: "c1", pair: "c", base: [-0.45, -0.62, 0.03, 0.07], game: [2.1, 1.0, 0.12, 0.04], intro: [1.9, 1.2, 0.9, 0.2], w: 1.1, h: 0.95 },
    { id: "c2", pair: "c", base: [0.18, -0.85, 0.04, -0.03], game: [0.0, -1.0, 0.12, 0.05], intro: [0.1, -1.4, 1.5, -0.08], w: 1.2, h: 0.75 },
  ];
  const PAIR_COVER = { a: "cover-a", b: "cover-b", c: "cover-c" };
  const PAIR_PHOTOS = { a: ["photo-a"], b: ["photo-b"], c: ["photo-e", "photo-f"] };
  const PAIR_NAME = { a: "Subject Name 01", b: "Subject Name 02", c: "Subject Name 03" };

  // ───────── Images (canvas) — instead of the original photos and drawings, redraw the same spot with the same feel ─────────
  const FONT_D = v("--kf-font-display"), FONT_M = v("--kf-font-mono");
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };
  const grain = (g, w, h, amt, n = 9000) => {
    for (let i = 0; i < n; i++) { g.fillStyle = rnd() > 0.5 ? `rgb(255 255 255 / ${amt * rnd()})` : `rgb(0 0 0 / ${amt * rnd()})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); } // Not skin: grayscale values that draw paper grain, photo slot and light strength (art material unrelated to skin)
  };
  const PAPER = hex("--site-paper"), INK = hex("--kf-bg"), PENCIL = hex("--site-pencil"), BOARDC = hex("--site-board"), DIM = hex("--kf-dim");
  const paperBase = (g, w, h) => {
    g.fillStyle = PAPER; g.fillRect(0, 0, w, h); grain(g, w, h, 0.06, (w * h) / 60);
    const st = g.createRadialGradient(w * rnd(), h * rnd(), 0, w / 2, h / 2, w);
    st.addColorStop(0, "rgb(120 100 60 / .0)"); st.addColorStop(1, "rgb(120 100 60 / .12)"); // Not skin: grayscale values that draw paper grain, photo slot and light strength (art material unrelated to skin)
    g.fillStyle = st; g.fillRect(0, 0, w, h);
  };
  const lines = (g, x, y, w, rows, gap, hgt, col) => { g.fillStyle = col; for (let i = 0; i < rows; i++) g.fillRect(x, y + i * gap, w * (0.55 + rnd() * 0.45), hgt); };
  const label = (g, text, x, y, size, col, align = "center") => { g.fillStyle = col; g.textAlign = align; g.font = `400 ${size}px ${FONT_M}`; g.fillText(text, x, y); };
  const photoBox = (g, x, y, w, h, text) => {
    const gr = g.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, "rgb(70 66 60)"); gr.addColorStop(1, "rgb(28 26 24)"); // Not skin: gray tones of the B&W photo slot (photo content)
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.strokeStyle = "rgb(255 255 255 / .18)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke(); // Not skin: grayscale values that draw paper grain, photo slot and light strength (art material unrelated to skin)
    grain(g, w, h, 0.12, (w * h) / 40);
    if (text) text.split(" · ").forEach((t, i, a) => label(g, t, x + w / 2, y + h / 2 + (i - (a.length - 1) / 2) * 30, 22, "rgb(255 255 255 / .75)")); // Not skin: grayscale values that draw paper grain, photo slot and light strength (art material unrelated to skin)
  };
  const silhouette = (g, cx, cy, s, col) => {
    g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy - s * 0.35, s * 0.32, s * 0.4, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(cx - s * 0.75, cy + s * 0.75); g.quadraticCurveTo(cx - s * 0.7, cy + s * 0.1, cx, cy + s * 0.05); g.quadraticCurveTo(cx + s * 0.7, cy + s * 0.1, cx + s * 0.75, cy + s * 0.75); g.fill();
    grain(g, s * 2, s * 2, 0.0, 0);
  };
  const tex = (c) => { const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; };
  const drawPoster = (id, kind, data) => {
    const W = 512, H = Math.round(512 * (LAYOUT[id].h / LAYOUT[id].w));
    const [c, g] = mk(W, H);
    if (kind === "photo") {
      g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
      photoBox(g, 18, 18, W - 36, H - 36, data.label);
    } else if (kind === "cover") {
      paperBase(g, W, H);
      g.fillStyle = INK; g.textAlign = "center"; g.font = `500 ${W * 0.13}px ${FONT_D}`;
      g.fillText("POSTER", W / 2, H * 0.17); g.fillText("HEADLINE", W / 2, H * 0.29);
      silhouette(g, W / 2, H * 0.58, W * 0.24, INK);
      g.fillStyle = PAPER; g.font = `500 ${W * 0.14}px ${FONT_D}`; g.fillText("?", W / 2, H * 0.53);
      label(g, "Do you know this person?", W / 2, H * 0.84, 20, INK); lines(g, W * 0.2, H * 0.88, W * 0.6, 3, 14, 3, DIM);
    } else if (kind === "lyrics") {
      paperBase(g, W, H);
      label(g, "Your song name here", W * 0.12, H * 0.08, 20, INK, "left");
      lines(g, W * 0.12, H * 0.13, W * 0.34, 26, H * 0.031, 4, DIM); lines(g, W * 0.54, H * 0.13, W * 0.34, 24, H * 0.031, 4, DIM);
    } else if (kind === "credits") {
      paperBase(g, W, H);
      g.fillStyle = INK; g.textAlign = "left"; g.font = `500 ${W * 0.06}px ${FONT_D}`; g.fillText("CREDITS SHEET", W * 0.12, H * 0.12);
      g.strokeStyle = DIM; g.lineWidth = 1.5;
      for (let i = 0; i < 9; i++) { const y = H * (0.2 + i * 0.08); g.beginPath(); g.moveTo(W * 0.12, y); g.lineTo(W * 0.88, y); g.stroke(); lines(g, W * 0.14, y + 14, W * 0.2, 1, 0, 4, DIM); lines(g, W * 0.4, y + 14, W * 0.42, 2, 12, 4, DIM); }
      g.strokeStyle = hex("--kf-accent"); g.globalAlpha = 0.5; g.strokeRect(W * 0.66, H * 0.05, W * 0.22, H * 0.09); g.globalAlpha = 1;
    } else if (kind === "band") {
      g.fillStyle = INK; g.fillRect(0, 0, W, H); grain(g, W, H, 0.1, 8000);
      photoBox(g, W * 0.08, H * 0.22, W * 0.84, H * 0.6, data.label);
      g.fillStyle = PAPER; g.textAlign = "center"; g.font = `500 ${W * 0.1}px ${FONT_D}`; g.fillText("NOTICE TITLE", W / 2, H * 0.14);
      label(g, "Your performance date · venue here", W / 2, H * 0.92, 20, PAPER);
    } else {
      paperBase(g, W, H);
      g.fillStyle = INK; g.fillRect(W * 0.08, H * 0.05, W * 0.84, H * 0.05);
      photoBox(g, W * 0.08, H * 0.14, W * 0.84, H * 0.36, data.label);
      lines(g, W * 0.08, H * 0.56, W * 0.84, 12, H * 0.03, 5, DIM);
    }
    return c;
  };
  const drawAlt = (id) => {
    const W = 512, H = Math.round(512 * (LAYOUT[id].h / LAYOUT[id].w));
    const [c, g] = mk(W, H);
    paperBase(g, W, H);
    photoBox(g, W * 0.1, H * 0.08, W * 0.8, H * 0.72, "Revealed face photo · black and white · portrait 3:4");
    label(g, "Identity verified", W / 2, H * 0.88, 22, INK);
    return c;
  };
  // Torn paper + pencil-hatched face fragment
  const drawPiece = (p) => {
    const W = 512, H = Math.round(512 * (p.h / p.w));
    const [c, g] = mk(W, H);
    const pts = [];
    const edge = (x0, y0, x1, y1, n, j) => { for (let i = 0; i < n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t + (rnd() - 0.5) * j, y0 + (y1 - y0) * t + (rnd() - 0.5) * j]); } };
    const m = 18;
    edge(m, m, W - m, m, 24, 22); edge(W - m, m, W - m, H - m, 24, 22); edge(W - m, H - m, m, H - m, 24, 22); edge(m, H - m, m, m, 24, 22);
    g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    paperBase(g, W, H);
    g.strokeStyle = PENCIL; g.lineCap = "round";
    // A few face-outline strokes + hatching — no human face drawn, only a pencil-sketch texture
    for (let k = 0; k < 7; k++) {
      g.globalAlpha = 0.5 + rnd() * 0.35; g.lineWidth = 1.6 + rnd() * 2.2;
      g.beginPath(); g.ellipse(W * (0.4 + rnd() * 0.2), H * (0.45 + rnd() * 0.1), W * (0.25 + rnd() * 0.1), H * (0.3 + rnd() * 0.1), rnd() - 0.5, rnd() * 3, 3 + rnd() * 3); g.stroke();
    }
    for (let i = 0; i < 520; i++) {
      const x = rnd() * W, y = rnd() * H, l = 10 + rnd() * 34;
      g.globalAlpha = 0.18 + rnd() * 0.4; g.lineWidth = 1 + rnd();
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y - l * 0.7); g.stroke();
    }
    g.restore(); g.globalAlpha = 1;
    return c;
  };
  const drawBoard = () => {
    const [c, g] = mk(1024, 1024);
    g.fillStyle = BOARDC; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 1024, w = 6 + rnd() * 40;
      g.fillStyle = rnd() > 0.5 ? `rgb(255 255 255 / ${0.01 + rnd() * 0.02})` : `rgb(0 0 0 / ${0.015 + rnd() * 0.03})`; // Not skin: grayscale values that draw paper grain, photo slot and light strength (art material unrelated to skin)
      g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= 1024; y += 64) g.lineTo(x + Math.sin(y * 0.006 + i) * 14, y);
      g.lineTo(x + w, 1024); g.lineTo(x + w, 0); g.fill();
    }
    grain(g, 1024, 1024, 0.035, 30000);
    const t = tex(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 3); return t;
  };
  // Flashlight pattern — circle reflected by the reflector ring
  const drawCookie = () => {
    const [c, g] = mk(512, 512);
    g.fillStyle = "#000"; g.fillRect(0, 0, 512, 512); // Not skin: black base of the light-blocking pattern (intensity, not color)
    for (let r = 40; r < 240; r += 18 + rnd() * 14) { g.strokeStyle = `rgb(255 255 255 / ${0.05 + rnd() * 0.12})`; g.lineWidth = 6 + rnd() * 12; g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke(); } // Not skin: grayscale values that draw paper grain, photo slot and light strength (art material unrelated to skin)
    const t = new T.CanvasTexture(c); return t;
  };

  // ───────── Scene ─────────
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const root = new T.Group(); scene.add(root);
  const head = new T.Group(); root.add(head);
  const camera = new T.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 0, desktop ? 5 : 8);
  head.add(camera);
  const sv = { w: innerWidth, h: innerHeight, vH: 0, vW: 0 };
  const resizeVars = () => {
    sv.w = innerWidth; sv.h = innerHeight;
    sv.vH = 2 * camera.position.z * Math.tan(T.MathUtils.degToRad(25));
    sv.vW = sv.vH * (sv.w / sv.h);
  };
  resizeVars();

  scene.add(new T.HemisphereLight(col3("--site-flash"), col3("--kf-bg"), 0.55));
  const dir = new T.DirectionalLight(0xffffff, 0.1); // Not clothing: white light intensity
  dir.position.set(0, 0, 5); dir.castShadow = true; dir.shadow.mapSize.set(1024, 1024);
  Object.assign(dir.shadow.camera, { near: 1, far: 7, left: -9, right: 9, top: 9, bottom: -9 });
  dir.shadow.bias = -1e-4; dir.shadow.camera.updateProjectionMatrix(); scene.add(dir);
  const flashGroup = new T.Group(), flashTarget = new T.Object3D();
  head.add(flashGroup, flashTarget);
  flashGroup.position.set(0, 1, 5);
  const SPOT = 15;
  const spot = new T.SpotLight(col3("--site-flash"), SPOT, 10, Math.PI / 5.5, 0.2, 1);
  spot.castShadow = true; spot.shadow.mapSize.setScalar(desktop ? 2048 : 1024); spot.shadow.camera.near = 1; spot.shadow.camera.far = 7; spot.shadow.bias = -1e-4;
  spot.target = flashTarget; flashGroup.add(spot);

  const progress = (p) => bus.emit("loader:progress", { progress: p });
  // In the original, after the asset list is received (about .5s measured) progress fills to 100%, and the warning curtain follows after a 1s count + .5s — the copy, which has nothing to receive, is also set to fill at the same time
  setTimeout(() => progress(1), Math.max(0, 480 - performance.now()));

  const pois = [], pieces = [], foreground = [];
  let boardMesh;
  const state = {
    interactive: false, focusDark: 1, lens: 1, flash: 1, flashSize: 7, flashStretch: 0.25,
    game: false, gameLocked: false, found: new Set(), selection: [], hovering: null, focused: null, paused: false, time: 0,
  };

  const build = () => {
    seed = 11;
    const boardMat = new T.MeshStandardMaterial({ map: drawBoard(), roughness: 0.92, metalness: 0 });
    boardMesh = new T.Mesh(new T.PlaneGeometry(BOARD.w, BOARD.h), boardMat);
    boardMesh.receiveShadow = true; root.add(boardMesh);
    const items = [...document.querySelectorAll("[data-poi]")];
    items.forEach((li) => {
      const id = li.dataset.poi;
      if (!LAYOUT[id]) return;
      const L = LAYOUT[id], kind = li.dataset.kind;
      const map = tex(drawPoster(id, kind, li.dataset));
      const mat = new T.MeshStandardMaterial({ map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0, roughness: 1, metalness: 0 }); // Not skin: glow is the brightness of the paper art itself
      const mesh = new T.Mesh(new T.PlaneGeometry(L.w, L.h), mat);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.position.set(L.x, L.y, 0.02 + rnd() * 0.02); mesh.rotation.z = L.r;
      const glow = new T.Mesh(mesh.geometry, new T.MeshBasicMaterial({ map, transparent: true, opacity: 0, depthWrite: false }));
      glow.layers.set(2); mesh.add(glow);
      root.add(mesh);
      const poi = { id, kind, mesh, mat, glow, base: mesh.position.clone(), baseRot: mesh.rotation.z, anim: { x: L.x, y: L.y, z: mesh.position.z, r: L.r }, emissive: { value: 0 }, censored: "censored" in li.dataset, alt: "alt" in li.dataset ? { value: 0 } : null, hasVideo: "video" in li.dataset };
      if (poi.censored) setupCensor(poi);
      if (poi.alt) setupReveal(poi);
      pois.push(poi);
    });
    PIECES.forEach((p) => {
      const map = tex(drawPiece(p));
      const mat = new T.MeshStandardMaterial({ map, transparent: true, alphaTest: 0.5, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0, roughness: 1 }); // Not skin: glow is the brightness of the paper art itself
      const mesh = new T.Mesh(new T.PlaneGeometry(p.w, p.h), mat);
      mesh.castShadow = mesh.receiveShadow = true;
      const glow = new T.Mesh(mesh.geometry, new T.MeshBasicMaterial({ map, transparent: true, opacity: 0, depthWrite: false }));
      glow.layers.set(2); mesh.add(glow);
      root.add(mesh);
      const [x, y, z, r] = p.intro;
      mesh.position.set(x, y, z); mesh.rotation.z = r;
      pieces.push({ ...p, mesh, mat, glow, anim: { x, y, z, r }, emissive: { value: 0 } });
    });
    const gold = new T.MeshStandardMaterial({ color: col3("--kf-accent-soft"), metalness: 1, roughness: 0.3, transparent: true });
    const red = new T.MeshStandardMaterial({ color: col3("--kf-accent"), roughness: 0.85, metalness: 0.15, transparent: true });
    PINS.forEach(([x, y]) => {
      const pin = new T.Group();
      const headM = new T.Mesh(new T.SphereGeometry(0.035, 16, 12), gold); headM.position.z = 0.2;
      const shaft = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 0.2, 6), gold); shaft.rotation.x = Math.PI / 2; shaft.position.z = 0.1;
      headM.castShadow = shaft.castShadow = true;
      pin.add(headM, shaft); pin.position.set(x, y, 0); root.add(pin); foreground.push(headM, shaft);
    });
    ROPES.forEach(([a, b]) => {
      const A = new T.Vector3(PINS[a][0], PINS[a][1], 0.17), B = new T.Vector3(PINS[b][0], PINS[b][1], 0.17);
      const mid = A.clone().lerp(B, 0.5); mid.z = 0.1;
      const rope = new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(A, mid, B), 48, 0.014, 6), red);
      rope.castShadow = true; root.add(rope); foreground.push(rope);
    });
    [gold, red].forEach((m) => (m.opacity = 0));
    foreground.forEach((m) => (m.visible = false));
  };

  // Mask — inside a circle at the center of the paper, a mosaic boiling at 4fps (14 cells, radius .85, jitter .35)
  const clockU = { value: 0 };
  function setupCensor(p) {
    p.censor = { value: 1 };
    p.mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, { uCensor: p.censor, uCTime: clockU, uCAspect: { value: LAYOUT[p.id].w / LAYOUT[p.id].h } });
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <map_pars_fragment>", `#include <map_pars_fragment>
uniform float uCensor; uniform float uCTime; uniform float uCAspect;
float cHash(vec2 q){ return fract(sin(dot(q, vec2(41.3, 289.1))) * 43758.5); }
vec4 censorTex(sampler2D t, vec2 uv){
  vec2 asp = uCAspect > 1.0 ? vec2(uCAspect, 1.0) : vec2(1.0, 1.0 / uCAspect);
  float shortSide = 1.0; float blocks = 14.0; float cell = shortSide / blocks;
  float frame = mod(floor(uCTime * 4.0), 997.0);
  float s = fract(sin(frame * 71.7) * 9137.3);
  vec2 off = vec2(s, fract(s * 29.1));
  vec2 p = uv * asp;
  vec2 id = floor(p / cell + off);
  vec2 c = (id + 0.5 - off) * cell;
  float inside = uCensor * step(length(c - asp * 0.5), 0.85 * 0.5);
  c += (vec2(cHash(id + frame), cHash(id - frame)) - 0.5) * cell * 0.35;
  c = clamp(c, vec2(0.0), asp);
  return texture2D(t, mix(uv, c / asp, inside));
}`)
        .replace("#include <map_fragment>", "vec4 sampledDiffuseColor = censorTex( map, vMapUv ); diffuseColor *= sampledDiffuseColor;")
        .replace("#include <emissivemap_fragment>", "vec4 emissiveColor = censorTex( emissiveMap, vEmissiveMapUv ); totalEmissiveRadiance *= emissiveColor.rgb;");
    };
  }
  // Reveal — a wanted poster with all pairs found shows the hidden photo only around the mouse (radius .65 · blur .7, phone .275/.35)
  const mouseNdc = new T.Vector2(), resU = { value: new T.Vector2(1, 1) };
  function setupReveal(p) {
    p.altMap = tex(drawAlt(p.id));
    p.mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, { uAltMap: { value: p.altMap }, uAlt: p.alt, uCenter: { value: mouseNdc }, uRes: resU, uRad: { value: desktop ? 0.65 : 0.275 }, uSoft: { value: desktop ? 0.7 : 0.35 } });
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <map_pars_fragment>", `#include <map_pars_fragment>
uniform sampler2D uAltMap; uniform float uAlt; uniform vec2 uCenter; uniform vec2 uRes; uniform float uRad; uniform float uSoft;
vec4 revealTex(sampler2D t, vec2 uv){
  vec2 q = gl_FragCoord.xy / uRes * 2.0 - 1.0;
  vec2 d = (q - uCenter) * vec2(uRes.x / uRes.y, 1.0);
  float k = uAlt * (1.0 - smoothstep(uRad, uRad + uSoft, length(d)));
  return mix(texture2D(t, uv), texture2D(uAltMap, uv), k);
}`)
        .replace("#include <map_fragment>", "vec4 sampledDiffuseColor = revealTex( map, vMapUv ); diffuseColor *= sampledDiffuseColor;");
    };
  }

  // ───────── Flashlight circle (drawn only on the mask panel) ─────────
  const flashU = { uAlpha: { value: 1 }, uSize: { value: 7 }, uStretch: { value: 0.25 }, uAim: { value: new T.Vector2() }, uRadius: { value: 0.2 }, uSoft: { value: 0.25 }, uTime: { value: 0 }, uMap: { value: null } };
  const flashMesh = new T.Mesh(new T.PlaneGeometry(1, 1, 32, 32), new T.ShaderMaterial({
    uniforms: flashU, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `uniform vec2 uAim; uniform float uStretch; uniform float uSize; varying vec2 vUv;
void main(){ vUv = uv;
  vec2 lean = clamp(uAim * uStretch, -0.8, 0.8);
  vec2 p = position.xy * 2.0;
  vec2 q = p * (1.0 + abs(lean)) + lean * p * p;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(q * uSize * 0.5, 0.0, 1.0); }`,
    fragmentShader: `uniform float uAlpha; uniform float uRadius; uniform float uSoft; uniform float uTime; uniform vec2 uAim; uniform sampler2D uMap; varying vec2 vUv;
vec2 spin(vec2 uv, float a){ uv -= 0.5; float s = sin(a), c = cos(a); return mat2(c, -s, s, c) * uv + 0.5; }
void main(){
  float d = length(vUv - 0.5);
  float disc = 1.0 - smoothstep(uRadius, uRadius + uSoft, d);
  vec2 su = spin(spin(vUv, uAim.x * 0.3), sin(uTime * 0.001) * 0.1);
  disc += texture2D(uMap, su).r * 0.5 * (1.0 - smoothstep(0.3, 0.5, d));
  gl_FragColor = vec4(vec3(disc * uAlpha), 1.0); }`,
  }));
  flashMesh.layers.set(1);
  head.add(flashMesh);

  // ───────── Post-processing — darkness, flashlight mask, glow, lens, chromatic aberration, color grading, vignette, grain, dust ─────────
  const rtOpts = { type: T.HalfFloatType, samples: desktop ? 2 : 0 };
  let rtMain = new T.WebGLRenderTarget(1, 1, rtOpts), rtMask = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType }), rtEmis = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType });
  const hue = 0.825 * Math.PI * 2, sat = 0.3;
  const post = new T.ShaderMaterial({
    uniforms: {
      tScene: { value: rtMain.texture }, tMask: { value: rtMask.texture }, tEmis: { value: rtEmis.texture }, uRes: { value: new T.Vector2(1, 1) }, uTime: { value: 0 },
      uTint: { value: col3("--site-dark-tint") }, uDark: { value: 0.7 }, uFocusFactor: { value: 1 }, uFocusDark: { value: 0.99 },
      uVigCol: { value: col3("--site-vignette") }, uVig: { value: new T.Vector3(0.4, 1, 0.9) },
      uExposure: { value: 1.075 }, uContrast: { value: 0.01 }, uSat: { value: 0.2 }, uLift: { value: 0.005 },
      uDistort: { value: desktop ? 0.05 : 0.025 }, uAber: { value: 0.007 }, uAberTint: { value: new T.Vector3(0.5 + sat * Math.cos(hue), 0.5 + sat * Math.cos(hue + 2.094), 0.5 + sat * Math.cos(hue + 4.189)) },
      uGrain: { value: 0.125 }, uGrainFreq: { value: 5 }, uDust: { value: 0.3 }, uDustFreq: { value: desktop ? 2 : 1.5 },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `precision highp float;
uniform sampler2D tScene, tMask, tEmis; uniform vec2 uRes; uniform float uTime;
uniform vec3 uTint; uniform float uDark, uFocusFactor, uFocusDark;
uniform vec3 uVigCol; uniform vec3 uVig;
uniform float uExposure, uContrast, uSat, uLift, uDistort, uAber; uniform vec3 uAberTint;
uniform float uGrain, uGrainFreq, uDust, uDustFreq;
varying vec2 vUv;
const vec3 LW = vec3(0.2126, 0.7152, 0.0722);
const float MID = 0.18;
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1,0)), f.x), mix(h21(i + vec2(0,1)), h21(i + vec2(1,1)), f.x), f.y); }
vec3 toSrgb(vec3 c){ c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec2 o = vUv - 0.5; vec2 shift = o * dot(o, o);
  vec2 uvD = vUv - uDistort * shift;
  vec3 lit = texture2D(tScene, uvD - uAber * shift).rgb * uAberTint + texture2D(tScene, uvD + uAber * shift).rgb * (1.0 - uAberTint);
  vec3 luma = vec3(dot(lit, LW));
  vec3 dark = (mix(lit, luma, 0.5) - MID) * 0.9 + MID;
  dark = mix(dark, uTint, mix(uDark, uFocusDark, uFocusFactor));
  float mFlash = length(texture2D(tMask, uvD).rgb) * (1.0 - uFocusFactor);
  float mEmis = clamp(length(texture2D(tEmis, uvD).rgb), 0.0, 1.0);
  vec3 c = mix(dark, lit, max(mFlash, mEmis));
  c *= exp2(uExposure);
  c = (c - MID) * (1.0 + uContrast) + MID;
  c = mix(luma, c, 1.0 + uSat);
  c = max(c + uLift, 0.0);
  vec2 cov = (vUv - 0.5) * (uRes.x > uRes.y ? vec2(uRes.x / uRes.y, 1.0) : vec2(1.0, uRes.y / uRes.x)) + 0.5;
  float vd = length(cov - 0.5) * 2.0;
  c = mix(c, uVigCol, smoothstep(uVig.x, uVig.x + max(uVig.y, 1e-4), vd) * uVig.z);
  vec3 s = toSrgb(c);
  float fr = floor(uTime * 24.0);
  vec2 gc = floor(gl_FragCoord.xy / max(1.0, uGrainFreq * 0.3)) + fr * vec2(17.0, 31.0);
  float g = fract(sin(dot(gc, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  s += g * uGrain;
  float df = floor(uTime * 30.0);
  vec2 dp = vUv * uRes / 220.0 * uDustFreq + vec2(h21(vec2(df, 1.0)), h21(vec2(2.0, df))) * 40.0;
  float speck = smoothstep(0.992, 1.0, vnoise(dp * 7.0)) + step(0.9995, h21(floor(gl_FragCoord.xy / 2.0) + df));
  s = mix(s, s * 0.35, clamp(speck, 0.0, 1.0) * uDust);
  gl_FragColor = vec4(s, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const postScene = new T.Scene();
  const postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  postScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), post));

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    resizeVars();
    const pr = renderer.getPixelRatio(), w = Math.round(innerWidth * pr), h = Math.round(innerHeight * pr);
    rtMain.setSize(w, h); rtMask.setSize(Math.round(w / 2), Math.round(h / 2)); rtEmis.setSize(Math.round(w / 2), Math.round(h / 2));
    post.uniforms.uRes.value.set(w, h); resU.value.set(w, h);
    drag.computeLimits(); applyViewOffset();
  };

  // Mouse — like the original, follows screen-ratio coordinates by .1 each frame
  const mouse = { rel: new T.Vector2(0.01, 0.01), eased: new T.Vector2(0.01, 0.01), px: new T.Vector2(), down: false, dragging: false, moved: false, first: new T.Vector2(), last: new T.Vector2(), dRel: new T.Vector2() };
  const setPos = (x, y) => { mouse.px.set(x, y); mouse.rel.set((x / innerWidth - 0.5) * 2, (1 - y / innerHeight - 0.5) * 2); };
  addEventListener("pointermove", (e) => {
    mouse.moved = true; setPos(e.clientX, e.clientY);
    if (!mouse.down) return;
    mouse.dRel.set((e.clientX - mouse.last.x) / innerWidth, (e.clientY - mouse.last.y) / innerHeight);
    mouse.last.set(e.clientX, e.clientY);
    const tot = Math.hypot((e.clientX - mouse.first.x) / innerWidth, (e.clientY - mouse.first.y) / innerHeight);
    if (tot > 0.02) {
      if (!mouse.dragging) { mouse.dragging = true; document.body.classList.add("is-dragging"); drag.start(); }
      drag.move(mouse.dRel);
    }
  }, { passive: true });
  canvas.addEventListener("pointerdown", (e) => {
    mouse.down = true; setPos(e.clientX, e.clientY);
    mouse.first.set(e.clientX, e.clientY); mouse.last.set(e.clientX, e.clientY);
    pressTarget = state.interactive ? pick() : null;
  }, { passive: true });
  let pressTarget = null;
  addEventListener("pointerup", () => {
    if (!mouse.down) return;
    mouse.down = false;
    const wasDrag = mouse.dragging;
    if (wasDrag) { mouse.dragging = false; document.body.classList.remove("is-dragging"); drag.end(); }
    else if (pressTarget && state.interactive) {
      const now = pick();
      if (now === pressTarget && (!desktop || state.hovering === now)) interact(now);
    }
    pressTarget = null;
  }, { passive: true });

  // ───────── Drag header — on release it glides with inertia (friction 5) and slows from within .75 of the panel end ─────────
  const drag = {
    pos: new T.Vector2(), vel: new T.Vector2(), delta: new T.Vector2(), anim: new T.Vector3(), shake: new T.Vector2(),
    limits: { min: new T.Vector2(), max: new T.Vector2() }, active: false, focused: false, view: { value: 0 },
    computeLimits() {
      const hw = sv.vW / 2, hh = sv.vH / 2;
      this.limits.min.set(-BOARD.w / 2 + hw, -BOARD.h / 2 + hh); this.limits.max.set(BOARD.w / 2 - hw, BOARD.h / 2 - hh);
    },
    activeLimits() {
      if (!state.game) return this.limits;
      return { min: new T.Vector2(desktop ? -1.75 : -3.5, desktop ? -2 : -1.5), max: new T.Vector2(desktop ? 1.75 : 3.5, desktop ? 1.35 : 1) };
    },
    start() { if (!state.interactive || this.focused || (state.game && state.gameLocked)) return; this.active = true; this.vel.set(0, 0); canvas.style.cursor = "grabbing"; },
    move(d) { if (!this.active || this.focused) return; this.delta.x -= d.x * sv.vW; this.delta.y += d.y * sv.vH; },
    end() { if (this.active) { this.active = false; canvas.style.cursor = state.game ? "grab" : ""; } },
    damp(axis, p, sign, L) { if (sign === 0) return 1; return T.MathUtils.clamp((sign > 0 ? L.max[axis] - p : p - L.min[axis]) / 0.75, 0, 1); },
    update(dtMs) {
      const dt = T.MathUtils.clamp(dtMs, 1, 50) / 1000, L = this.activeLimits();
      if (this.active) {
        const k = 1 / dt, sm = 1 - Math.exp(-25 * dt);
        const fx = this.damp("x", this.pos.x, Math.sign(this.delta.x), L), fy = this.damp("y", this.pos.y, Math.sign(this.delta.y), L);
        this.pos.x += this.delta.x * fx; this.pos.y += this.delta.y * fy;
        this.vel.x = T.MathUtils.lerp(this.vel.x, this.delta.x * k * fx, sm);
        this.vel.y = T.MathUtils.lerp(this.vel.y, this.delta.y * k * fy, sm);
      } else if (!this.focused) {
        const fx = this.damp("x", this.pos.x, Math.sign(this.vel.x), L), fy = this.damp("y", this.pos.y, Math.sign(this.vel.y), L);
        this.pos.x += this.vel.x * fx * dt; this.pos.y += this.vel.y * fy * dt;
        this.vel.multiplyScalar(Math.exp(-5 * dt));
        if (this.vel.lengthSq() < 1e-6) this.vel.set(0, 0);
      }
      ["x", "y"].forEach((a) => { const c = T.MathUtils.clamp(this.pos[a], L.min[a], L.max[a]); if (c !== this.pos[a]) { this.pos[a] = c; this.vel[a] = 0; } });
      this.delta.set(0, 0);
      head.position.set(this.pos.x + this.anim.x + this.shake.x, this.pos.y + this.anim.y + this.shake.y, this.anim.z);
    },
  };
  const applyViewOffset = () => {
    if (drag.view.value === 0) camera.clearViewOffset();
    else camera.setViewOffset(sv.w, sv.h, drag.view.value * sv.w, 0, sv.w, sv.h);
  };

  // ───────── Select · lift ─────────
  const ray = new T.Raycaster();
  const targets = () => (state.game ? pieces.filter((p) => !state.found.has(p.pair)).map((p) => p.mesh) : [...pois.map((p) => p.mesh), ...pieces.map((p) => p.mesh)]);
  const pick = () => {
    ray.setFromCamera(desktop ? mouse.rel : new T.Vector2(mouse.rel.x, mouse.rel.y), camera);
    const hit = ray.intersectObjects(targets(), false)[0];
    if (!hit) return null;
    const piece = pieces.find((p) => p.mesh === hit.object);
    if (piece) return state.game ? piece : "sketch";
    return pois.find((p) => p.mesh === hit.object) || null;
  };
  const emissiveOf = (t) => (t === "sketch" ? pieces : [t]);
  const hoverIn = (t) => {
    state.hovering = t; canvas.style.cursor = "pointer";
    if (!state.game) emissiveOf(t).forEach((p) => gsap.to(p.emissive, { value: 0.2, duration: 0.75, ease: "power3.out", overwrite: "auto" }));
    else if (!state.selection.includes(t)) gsap.to(t.emissive, { value: 0.4, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    gsap.to(state, { flashSize: 5, flashStretch: 0.15, duration: 0.75, ease: "power3.out", overwrite: "auto" });
  };
  const hoverOut = () => {
    const t = state.hovering; state.hovering = null; canvas.style.cursor = state.game ? "grab" : "";
    if (!t) return;
    if (!state.game) emissiveOf(t).forEach((p) => gsap.to(p.emissive, { value: 0, duration: 1, ease: "power2.out", overwrite: "auto" }));
    else if (!state.selection.includes(t) && !state.found.has(t.pair)) gsap.to(t.emissive, { value: 0.2, duration: 1, ease: "power2.out", overwrite: "auto" });
    gsap.to(state, { flashSize: 7, duration: 1, ease: "power2.out", overwrite: "auto" });
    gsap.to(state, { flashStretch: 0.25, duration: 0.75, ease: "power3.out" });
  };

  // ───────── Approach (evidence window) ─────────
  let tlFocus, tlDark, tlTransform;
  const darkTo = (on) => {
    tlDark?.kill();
    tlDark = on
      ? gsap.timeline().to(state, { focusDark: 1, lens: 0, duration: 0.3, ease: "power3.out" }, 0).to(dir.shadow, { intensity: 0, duration: 0.3, ease: "power3.out" }, 0)
      : gsap.timeline().to(state, { focusDark: 0, lens: 1, duration: 1, ease: "power3.out" }, 0).to(dir.shadow, { intensity: 1, duration: 0.5, ease: "power3.out" }, 0.5);
  };
  const interact = (t) => {
    if (t === "sketch") return openGame();
    if (state.game) return gameTap(t);
    hoverOut();
    state.focused = t; state.interactive = false;
    stopFlicker();
    darkTo(true);
    gsap.to(t.emissive, { value: 0.4, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    bus.emit("poi:in", { id: t.id, isCensored: t.censored && t.censor.value > 0, isAlternative: !!(t.alt && t.alt.value > 0) });
    if (!desktop) { gsap.delayedCall(0.1, () => (state.paused = true)); return; }
    // The panel approaches that paper and fills the paper height to .85 of the screen, shifting the screen .125 sideways to clear the right text column
    const L = drag.limits;
    const fx = T.MathUtils.clamp(t.base.x, L.min.x, L.max.x), fy = T.MathUtils.clamp(t.base.y, L.min.y, L.max.y);
    tlTransform?.kill();
    tlTransform = gsap.timeline().to(t.anim, { x: fx, y: fy, z: t.base.z + 0.25, r: 0, duration: 1, ease: "power4.out" }, 0);
    const dist = Math.max(LAYOUT[t.id].h / (0.9326 * 0.85) + 0.05, 0.5);
    drag.focused = true; drag.vel.set(0, 0);
    tlFocus?.kill();
    tlFocus = gsap.timeline()
      .to(drag.pos, { x: fx, y: fy, duration: 1, ease: "power4.out" }, 0)
      .to(drag.anim, { z: t.base.z + 0.25 + dist - camera.position.z, duration: 1, ease: "power4.out" }, 0)
      .to(drag.view, { value: 0.125, duration: 1, ease: "power3.out", onUpdate: applyViewOffset }, 0);
  };
  bus.on("poi:out", () => {
    const t = state.focused;
    if (!t) return;
    state.paused = false;
    darkTo(false);
    gsap.to(t.emissive, { value: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
    tlTransform?.kill();
    tlTransform = gsap.timeline().to(t.anim, { x: t.base.x, y: t.base.y, z: t.base.z, r: t.baseRot, duration: 1, ease: "power4.out" }, 0);
    tlFocus?.kill();
    tlFocus = gsap.timeline()
      .to(drag.anim, { z: 0, duration: 1, ease: "power4.out" }, 0)
      .to(drag.view, { value: 0, duration: 1, ease: "power3.out", onUpdate: applyViewOffset }, 0)
      .call(() => { drag.focused = false; state.focused = null; }, null, 0.5);
    state.interactive = true;
    startFlicker();
  });
  bus.on("video:open", () => (state.paused = true));
  bus.on("video:close", () => (state.paused = !desktop && !!state.focused));

  // ───────── Flashlight flicker — .5s rough (15 points) when turning on, .35/.9s rough (10 points) every 10~20s ─────────
  let tlFlash, flickerCall;
  const flashOn = () => {
    tlFlash?.kill();
    return (tlFlash = gsap.timeline()
      .to(state, { flash: 1, duration: 0.5, ease: window.mRough(15), immediateRender: false, onUpdate: () => (spot.intensity = state.flash * 2 * SPOT) }, 0)
      .to(spot, { intensity: SPOT, duration: 1, ease: "power2.out", immediateRender: false }, ">"));
  };
  const flicker = (done) => {
    tlFlash?.kill();
    const long = rnd() > 0.5;
    tlFlash = gsap.timeline({ onComplete: done }).fromTo(state, { flash: 0.25 }, { flash: 1, duration: long ? 0.9 : 0.35, ease: window.mRough(10), onUpdate: () => (spot.intensity = state.flash * SPOT) }, 0);
  };
  const startFlicker = () => { stopFlicker(); const next = () => (flickerCall = gsap.delayedCall(gsap.utils.random(10, 20), () => flicker(next))); next(); };
  const stopFlicker = () => { flickerCall?.kill(); flickerCall = null; };

  // ───────── Game — unfold pieces and match pairs ─────────
  const fgTo = (on, d = 0.3) => {
    const mats = [...new Set(foreground.map((m) => m.material))];
    if (on) foreground.forEach((m) => (m.visible = true));
    gsap.to(mats, { opacity: on ? 1 : 0, duration: d, ease: "power2.out", onComplete: () => !on && foreground.forEach((m) => (m.visible = false)) });
  };
  const layoutPieces = (key, durs, ease) => pieces.forEach((p) => {
    const [x, y, z, r] = p[key];
    gsap.to(p.anim, { x, y, z, duration: gsap.utils.random(...durs[0]), ease });
    gsap.to(p.anim, { r, duration: gsap.utils.random(...durs[1]), ease });
  });
  const openGame = () => {
    if (state.game) return;
    hoverOut(); state.interactive = false;
    bus.emit("game:open");
    stopFlicker(); darkTo(true); flicker();
    fgTo(false);
    drag.focused = true; drag.vel.set(0, 0);
    tlFocus?.kill();
    tlFocus = gsap.timeline()
      .to(drag.pos, { x: 0, y: 0, duration: 1, ease: "power4.out" }, 0)
      .to(drag.anim, { z: -0.75, duration: 1, ease: "power4.out" }, 0)
      .call(() => { state.game = true; drag.focused = false; state.interactive = true; canvas.style.cursor = "grab"; }, null, 1);
    layoutPieces("game", [[1.5, 2], [1.25, 1.75]], "power4.out");
    pieces.forEach((p) => gsap.to(p.emissive, { value: state.found.has(p.pair) ? 0 : 0.2, duration: gsap.utils.random(0.35, 0.6), ease: "power3.out" }));
  };
  const closeGame = () => {
    if (!state.game && !drag.focused) return;
    state.selection = []; state.game = false; state.interactive = false;
    drag.focused = true; drag.vel.set(0, 0);
    tlFocus?.kill();
    tlFocus = gsap.timeline()
      .to(drag.pos, { x: 0, y: 0, duration: 1, ease: "power3.out" }, 0)
      .to(drag.anim, { x: 0, y: 0, z: 0, duration: 1.25, ease: "power3.out" }, 0)
      .call(() => { drag.focused = false; state.interactive = true; canvas.style.cursor = ""; }, null, 1);
    darkTo(false); fgTo(true);
    layoutPieces("base", [[1.5, 2], [1.25, 1.75]], "power4.out");
    pieces.forEach((p) => gsap.to(p.emissive, { value: 0, duration: 0.35, ease: "power3.out" }));
    startFlicker();
  };
  bus.on("game:close", closeGame);
  const shake = () => gsap.timeline()
    .to(drag.shake, { x: 0.01, duration: 0.75, ease: CustomWiggle.create("mHeadX", { wiggles: 16, type: "easeOut" }) }, 0)
    .to(drag.shake, { y: 0.01, duration: 0.75, ease: CustomWiggle.create("mHeadY", { wiggles: 14, type: "easeOut" }) }, 0);
  const gameTap = (p) => {
    if (state.gameLocked || state.found.has(p.pair) || state.selection.includes(p)) return;
    state.selection.push(p);
    gsap.to(p.emissive, { value: 0.4, duration: 0.35, ease: "power3.out", overwrite: "auto" });
    if (state.selection.length < 2) return;
    const [a, b] = state.selection;
    state.selection = [];
    if (a.pair !== b.pair) {
      // On a wrong answer the two pieces blink for .5s and cool down, and the flashlight shakes
      [a, b].forEach((q) => gsap.fromTo(q.emissive, { value: 0.4 }, { value: 0.2, duration: 0.5, ease: CustomWiggle.create("mMiss", { wiggles: 6, type: "random" }) }));
      flicker(); shake();
      return;
    }
    state.found.add(a.pair); state.gameLocked = true;
    // On a match the two pieces lift (.75s back.out(2)), gather in the center, then the name curtain
    gsap.to(drag.pos, { x: 0, y: 0, duration: 1, ease: "power3.out" });
    const tl = gsap.timeline();
    [a, b].forEach((q, i) => {
      tl.to(q.anim, { z: 0.4, duration: 0.75, ease: "back.out(2)" }, 0).to(q.emissive, { value: 0.3, duration: 0.75, ease: "back.out(2)" }, 0);
      tl.to(q.anim, { x: (i ? 0.48 : -0.48), y: 0, r: 0, duration: 0.9, ease: "power3.inOut" }, 0.6);
    });
    tl.call(() => bus.emit("game:success-content", { name: PAIR_NAME[a.pair] }), null, 1.4);
    const after = () => {
      off();
      state.gameLocked = false;
      [a, b].forEach((q) => { gsap.to(q.anim, { x: q.base[0], y: q.base[1], z: q.base[2], r: q.base[3], duration: 1.25, ease: "power3.inOut" }); gsap.to(q.emissive, { value: 0, duration: 0.6, ease: "power2.out" }); });
      pois.filter((x) => PAIR_PHOTOS[a.pair].includes(x.id)).forEach((x) => x.censor && (x.censor.value = 0));
      const cover = pois.find((x) => x.id === PAIR_COVER[a.pair]);
      if (cover) cover.alt.value = 1;
      if (state.found.size === 3) bus.emit("game:completed");
    };
    const off = bus.on("game:success-continue", after);
  };

  // ───────── Entrance ─────────
  // In the original the plate’s first image appears about 1s after the document opens (three · model prep) — until then only the empty room color
  canvas.style.visibility = "hidden";
  setTimeout(() => (canvas.style.visibility = ""), Math.max(0, 1000 - performance.now()));
  bus.on("loader:disclaimer", () => {
    drag.anim.z = desktop ? -2.25 : -4.25;
    state.flash = desktop ? 1 : 0;
  });
  bus.on("loader:audio", () => {
    gsap.delayedCall(0.25, () => pieces.forEach((p) => gsap.fromTo(p.emissive, { value: 0 }, { value: 0.6 + rnd() * 0.3, duration: gsap.utils.random(1.75, 2), ease: "power2.inOut" })));
  });
  bus.on("loader:hide", () => {
    const tl = gsap.timeline({ onComplete: () => { state.interactive = true; bus.emit("intro:complete"); startFlicker(); } });
    tl.to(state, { focusDark: 0, duration: 2.5, ease: "power2.in" }, 0.5)
      .to(drag.anim, { z: 0, duration: 3, ease: "power3.inOut", immediateRender: false }, 0)
      .call(() => fgTo(true), null, 1.75);
    pieces.forEach((p) => {
      tl.to(p.emissive, { value: 0, duration: gsap.utils.random(1.5, 2), ease: "power2.in" }, 0);
      const [x, y, z, r] = p.base;
      tl.to(p.anim, { x, y, z, duration: gsap.utils.random(2.75, 3.25), ease: "power3.inOut" }, 0);
      tl.to(p.anim, { r, duration: gsap.utils.random(2.75, 3.25), ease: "power3.inOut" }, 0);
    });
    if (desktop) tl.to(state, { flash: 0, duration: 0.75, ease: "power2.in", onUpdate: () => (spot.intensity = state.flash * SPOT) }, 0.5);
    tl.add(flashOn(), 1.75);
    if (reduce) tl.progress(1);
  });

  // ───────── Drawing ─────────
  const v3 = new T.Vector3();
  let last = performance.now();
  const frame = (now) => {
    const dt = now - last; last = now;
    state.time += dt / 1000;
    if (state.paused) return;
    mouse.eased.lerp(mouse.rel, 0.1);
    if (desktop) {
      flashGroup.position.set(mouse.eased.x * sv.vW * 0.2, 1 + mouse.eased.y * sv.vH * 0.2, 5);
      flashTarget.position.set(mouse.eased.x * sv.vW * 0.5, mouse.eased.y * sv.vH * 0.5, 0);
    }
    drag.update(dt);
    if (state.interactive && (!desktop || mouse.moved) && !mouse.dragging && !drag.focused) {
      const t = pick();
      if (t !== state.hovering) { if (state.hovering) hoverOut(); if (t && desktop) hoverIn(t); }
    }
    pois.forEach((p) => {
      p.mesh.position.set(p.anim.x, p.anim.y, p.anim.z); p.mesh.rotation.z = p.anim.r;
      p.mat.emissiveIntensity = p.emissive.value; p.glow.material.opacity = Math.min(1, p.emissive.value * 2.5);
    });
    pieces.forEach((p) => {
      p.mesh.position.set(p.anim.x, p.anim.y, p.anim.z); p.mesh.rotation.z = p.anim.r;
      p.mat.emissiveIntensity = p.emissive.value; p.glow.material.opacity = Math.min(1, p.emissive.value * 2.5);
    });
    clockU.value = state.time;
    mouseNdc.copy(mouse.eased);
    // The flashlight circle lies on the spot of the plate the light reaches
    flashTarget.getWorldPosition(v3);
    flashMesh.position.copy(head.worldToLocal(v3.clone()));
    flashU.uAlpha.value = state.flash; flashU.uSize.value = state.flashSize; flashU.uStretch.value = state.flashStretch;
    flashU.uAim.value.copy(mouse.eased); flashU.uTime.value = now;
    post.uniforms.uFocusFactor.value = state.focusDark;
    post.uniforms.uDistort.value = (desktop ? 0.05 : 0.025) * state.lens;
    post.uniforms.uAber.value = 0.007 * state.lens;
    post.uniforms.uTime.value = state.time;
    spot.shadow.needsUpdate = true;

    renderer.setRenderTarget(rtMain); renderer.setClearColor(0x000000, 1); // Not a skin: value that clears the drawing board
    camera.layers.set(0); renderer.render(scene, camera);
    renderer.setRenderTarget(rtMask); renderer.clear(); camera.layers.set(1); renderer.render(scene, camera);
    renderer.setRenderTarget(rtEmis); renderer.clear(); camera.layers.set(2); renderer.render(scene, camera);
    camera.layers.set(0);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  };

  const start = () => {
    build();
    flashU.uMap.value = drawCookie();
    resize();
    addEventListener("resize", resize);
    gsap.ticker.add(() => frame(performance.now()));
  };
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(start));
})();
