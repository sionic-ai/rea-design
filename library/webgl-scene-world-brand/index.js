// One full-screen canvas (three r162, pixel ratio devicePixelRatio × .5 — coarse like the original) changes scenes to match the scroll position.
// Each section’s inner panel is pinned, so the 3D group is pushed up together only when the section enters and leaves, and moves by progress (0~1) while it stays stuck.
// Original values: camera fov 75·z 1, ball rotation .001 per frame, grid cell hover z .3·1.4x, grid tilt .1·sin(.1t),
// Noise pulse every 3s (5 → ×.96 per frame), angel rotation x .005 and y .002.
// Cursor lens (red ball·pill text panel): each mousemove adds 60 (pill 10) to the speed, and each frame the radius += Speed,
// Speed ×.5, radius ×.945, cap 2000 (the pill uses ×.975 for both, cap 6000). In canvas pixels (pixel ratio ×.5), inside half the radius it switches to a different word board,
// The .4~1 band of that circle is read rotated by (d − .4)·2π around the panel center so the text swirls
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = matchMedia("(max-width: 959px)").matches;
  const step = () => window.mpLoader?.step();

  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rgb = (n) => {
    const el = document.createElement("i");
    el.style.color = `var(${n})`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };
  const C = { bg: rgb("--kf-bg"), ink: rgb("--kf-ink"), accent: rgb("--kf-accent"), hot: rgb("--kf-accent-text"), paper: rgb("--kf-contrast-bg") };
  const hex = (c) => `#${c.getHexString()}`;
  const mix = (a, b, t) => a.clone().lerp(b, t);
  const F = { display: cssVar("--kf-font-display"), heavy: cssVar("--kf-font-heavy") || cssVar("--kf-font-display"), tall: cssVar("--kf-font-tall") || cssVar("--kf-font-display"), sans: cssVar("--kf-font-sans") };

  // ───────── Renderer ─────────
  const canvas = $(".mp-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(C.bg, 0);
  renderer.setPixelRatio(devicePixelRatio * 0.5);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 1;
  const visH = () => 2 * Math.tan(THREE.MathUtils.degToRad(37.5)) * camera.position.z;
  scene.add(new THREE.AmbientLight(C.ink, 0.18));
  const key = new THREE.DirectionalLight(C.ink, 1.9);
  key.position.set(-0.6, 0.8, 1);
  scene.add(key);
  const back = new THREE.PointLight(C.paper, 2, 4, 1.4);
  back.position.set(0.6, -0.3, 0.4);
  scene.add(back);

  const texFrom = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  // The original builds the radius by event count, not by distance moved — the same value for finger swipes (touchmove)
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, moves: 0 };
  const track = (x, y) => {
    mouse.x = x; mouse.y = y;
    mouse.nx = (x / innerWidth) * 2 - 1;
    mouse.ny = -(y / innerHeight) * 2 + 1;
  };
  addEventListener("pointermove", (e) => {
    track(e.clientX, e.clientY);
    if (e.pointerType !== "touch") mouse.moves++;
  });
  addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) { track(t.clientX, t.clientY); mouse.moves++; }
  }, { passive: true });

  // Compared against gl_FragCoord as is — the renderer pixel ratio is devicePixelRatio × .5 like the original, so the circle radius is the same canvas pixels as the original
  const lensU = () => ({ lensAt: { value: new THREE.Vector2(-1e5, -1e5) }, lensR: { value: 0 } });
  const outerMat = (map) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { map: { value: map }, offset: { value: 0 }, ...lensU() },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec2 vUv; uniform sampler2D map; uniform vec2 lensAt; uniform float lensR, offset;
      void main(){
        if (distance(gl_FragCoord.xy, lensAt) < lensR) discard;
        gl_FragColor = texture2D(map, vec2(fract(vUv.x + offset), vUv.y));
      }`,
  });
  const innerMat = (map) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { map: { value: map }, shift: { value: -1 }, ...lensU() },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; p.z -= 0.25 * dot(p.xy, p.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
    fragmentShader: `varying vec2 vUv; uniform sampler2D map; uniform vec2 lensAt; uniform float lensR, shift;
      void main(){
        float d = distance(gl_FragCoord.xy, lensAt) / max(lensR, 1e-3);
        if (d >= 1.0) discard;
        float a = max(d - 0.4, 0.0) * 6.2832, s = sin(a), c = cos(a);
        vec2 q = vUv - 0.5;
        vec2 uv = vec2(q.x * c - q.y * s, q.x * s + q.y * c) + 0.5;
        vec4 col = texture2D(map, vec2(uv.x, uv.y - shift));
        if (col.a < 0.02) discard;
        gl_FragColor = col;
      }`,
  });
  const sheetGeo = new THREE.PlaneGeometry(1, 1, 32, 32);
  // Like the original text image, place text chunks only in the bottom half and leave the edges empty — pushing the panel up or down moves the chunks across the screen
  const blockTex = (draw) => texFrom(1024, 1024, (ctx, w, h) => { ctx.fillStyle = hex(C.paper); draw(ctx, w, h); });
  // Original: text panel timing = Section progress .25~.85 mapped to −1~1, outside that range −1 (blob is off the plate)
  const shiftAt = (p, p0) => (p > p0 && p < p0 + 0.6 ? ((p - p0) / 0.6) * 2 - 1 : -1);

  // ───────── Section: red ball and curving flowing text ─────────
  const ph = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.4, 64, 64), new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.55, metalness: 0.05 }));
  ball.position.set(-0.27, -0.06, 0);
  ph.add(ball);
  const arcTex = texFrom(2048, 256, (ctx, w, h) => {
    ctx.fillStyle = hex(C.paper);
    ctx.font = `900 120px ${F.heavy}`;
    ctx.fillText("Year 00XX.", 40, 130);
    ctx.font = `700 64px ${F.heavy}`;
    ctx.fillText("A mysterious one-liner appears here", 720, 120);
    ctx.font = `700 56px ${F.heavy}`;
    ctx.fillText("Your second line curves past here · Appears", 160, 220);
  });
  arcTex.wrapS = THREE.RepeatWrapping;
  const arcMat = outerMat(arcTex);
  const arc = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.42, 96, 1, true, -0.85, 1.7), arcMat);
  arc.rotation.set(-0.25, 0, 0.06);
  arc.position.set(-0.04, 0.2, -0.75);
  ph.add(arc);
  // Like the original year20xx version (English outside, Japanese inside), a curved panel as wide as the screen sits in front of the ball (z .3) — a panel carrying the same line in another language shows only inside the circle
  const phLensMat = innerMat(blockTex((ctx) => {
    ctx.font = `700 92px ${F.sans}`;
    ctx.fillText("The year is 00XX.", 90, 600);
    ctx.font = `700 78px ${F.sans}`;
    ctx.fillText("Your same-line text here", 380, 715);
    ctx.fillText("Put in other words", 150, 825);
    ctx.fillText("It lights up!!", 470, 935);
  }));
  const phLens = new THREE.Mesh(sheetGeo, phLensMat);
  phLens.position.z = 0.3;
  phLens.renderOrder = 2;
  ph.add(phLens);
  scene.add(ph);
  step();

  // ───────── Section: glowing red panel grid → character cells ─────────
  const grid = new THREE.Group();
  const gridInner = new THREE.Group();
  grid.add(gridInner);
  const glowTex = [0, 1, 2, 3].map((k) => texFrom(128, 128, (ctx, w, h) => {
    ctx.fillStyle = hex(mix(C.bg, C.accent, 0.08));
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2 + k; i++) {
      const x = 16 + ((i * 47 + k * 31) % 96), y = 16 + ((i * 29 + k * 53) % 96);
      const g = ctx.createRadialGradient(x, y, 1, x, y, 18 + ((i + k) % 3) * 10);
      g.addColorStop(0, hex(C.hot));
      g.addColorStop(0.3, hex(C.accent));
      g.addColorStop(1, `${hex(C.accent)}00`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }));
  const charNames = ["CHARA 01", "CHARA 02", "CHARA 03", "CHARA 04", "CHARA 05", "CHARA 06"];
  const charTex = charNames.map((n, k) => texFrom(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, hex(mix(C.paper, C.accent, 0.15 + (k % 3) * 0.1)));
    g.addColorStop(1, hex(mix(C.bg, C.paper, 0.35)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = hex(mix(C.bg, C.accent, 0.3));
    ctx.beginPath(); ctx.ellipse(w / 2, h * 0.42, w * 0.2, h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.15, h); ctx.quadraticCurveTo(w / 2, h * 0.58, w * 0.85, h); ctx.fill();
    ctx.fillStyle = hex(C.ink);
    ctx.font = `700 15px ${F.heavy}`;
    ctx.fillText(`3D character front portrait · ${n}`, 10, h - 12);
  }));
  const tiles = [], chars = [];
  const COLS = 13, ROWS = 7, S = 0.2;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const isChar = r >= 2 && r <= 3 && c >= 5 && c <= 7;
    const ci = isChar ? (r - 2) * 3 + (c - 5) : -1;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(S * 0.94, S * 0.94), new THREE.MeshBasicMaterial({ map: isChar ? charTex[ci] : glowTex[(r * 3 + c) % 4], transparent: true }));
    m.position.set((c - (COLS - 1) / 2) * S, ((ROWS - 1) / 2 - r) * S, -0.01);
    if (isChar) { m.userData.url = `detail.html?c=${ci % 3}`; chars.push(m); }
    gridInner.add(m);
    tiles.push(m);
  }
  const pulseMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: { time: { value: 0 }, pulse: { value: 0 }, tint: { value: C.hot } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }",
    fragmentShader: `varying vec2 vUv; uniform float time, pulse; uniform vec3 tint;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){ float line = step(0.5, h(vec2(floor(vUv.y * 140.0), floor(time * 24.0)))) * pulse;
        float grain = h(vUv * 600.0 + time) * 0.06; gl_FragColor = vec4(tint, clamp(line * 0.18 + grain * (0.4 + pulse), 0.0, 0.5)); }`,
  });
  const pulseQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), pulseMat);
  pulseQuad.frustumCulled = false;
  pulseQuad.renderOrder = 10;
  grid.add(pulseQuad);
  scene.add(grid);
  step();

  // ───────── Section: text wall scattered in dots and a spinning angel (our polyhedron) ─────────
  const wall = new THREE.Group();
  const N = phone ? 3000 : 7000;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const row = Math.floor(Math.random() * 18);
    let x = Math.random() * 2.6 - 1.3;
    x = Math.round(x * 14) / 14 + (Math.random() - 0.5) * 0.05;
    pos.set([x, 0.72 - row * 0.085 + (Math.random() - 0.5) * 0.03, -0.4 + Math.random() * 0.1], i * 3);
    seed[i] = Math.random();
  }
  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  ptsGeo.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
  const ptsMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { color: { value: C.ink }, time: { value: 0 }, size: { value: 3 * devicePixelRatio * 0.5 } },
    vertexShader: `attribute float seed; uniform float time, size; varying float vA;
      void main(){ vec3 p = position; p.y += fract(seed * 7.0 + time * 0.01) * 0.02;
        vA = 0.35 + seed * 0.65; gl_PointSize = size * (0.6 + seed); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: "uniform vec3 color; varying float vA; void main(){ if (length(gl_PointCoord - 0.5) > 0.5) discard; gl_FragColor = vec4(color, vA); }",
  });
  wall.add(new THREE.Points(ptsGeo, ptsMat));
  const angel = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), new THREE.MeshStandardMaterial({ color: mix(C.ink, C.bg, 0.35), roughness: 0.4, metalness: 0.3, flatShading: true, transparent: true, opacity: 0.85 }));
  angel.scale.set(1, 1.35, 0.7);
  angel.position.set(0.15, 0.12, -0.1);
  wall.add(angel);
  scene.add(wall);
  step();

  // ───────── Section: pill — red half and clear half, with text wrapping around it ─────────
  const pill = new THREE.Group();
  const pillBody = new THREE.Group();
  const R = 0.12, L = 0.17;
  const red = new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.32, metalness: 0.05 });
  const glass = new THREE.MeshStandardMaterial({ color: C.paper, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.32, depthWrite: false });
  const half = (mat, dir) => {
    const g = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 48, 1, true), mat);
    cyl.position.y = (dir * L) / 2;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 24, 0, Math.PI * 2, dir > 0 ? 0 : Math.PI / 2, Math.PI / 2), mat);
    cap.position.y = dir * L;
    g.add(cyl, cap);
    return g;
  };
  pillBody.add(half(red, -1), half(glass, 1));
  const sp = new Float32Array(240 * 3);
  for (let i = 0; i < 240; i++) sp.set([(Math.random() - 0.5) * R * 1.4, Math.random() * L * 1.6, (Math.random() - 0.5) * R * 1.4], i * 3);
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  pillBody.add(new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: C.paper, size: 2.5 * devicePixelRatio * 0.5, sizeAttenuation: false, transparent: true, opacity: 0.8 })));
  pillBody.rotation.z = -0.75;
  pill.add(pillBody);
  const ringTex = texFrom(2048, 128, (ctx, w) => {
    ctx.fillStyle = hex(C.ink);
    ctx.font = `700 64px ${F.sans}`;
    ctx.fillText("List emotion words here. Anxiety. Resignation. Hidden lies. Memories rewinding · list emotion words here", 20, 86);
  });
  ringTex.wrapS = THREE.RepeatWrapping;
  const ringMat = outerMat(ringTex);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.16, 96, 1, true, -1.0, 2.0), ringMat);
  ring.rotation.set(-0.3, 0, -0.05);
  ring.position.set(0, 0.3, -0.5);
  pill.add(ring);
  // Original dreampill panel (paragraph, English outside and Japanese inside) spot — a panel covering the screen in front of the pill, where a paragraph in another language shows through only inside the circle
  const pillLensMat = innerMat(blockTex((ctx) => {
    ctx.font = `700 30px ${F.sans}`;
    const text = "Your paragraph explaining what this pill is goes here, glimpsed in other words. Over three or four lines, set up the premise of a pill that traps someone’s memories, then continue with how those memories rise up in sharp detail. Thought. Ambition. Longing. Hope. Stimulus. Confusion. Climax. Illusion. Resignation. Disgust. Anxiety. Inner thoughts and hidden lies. Memories rewinding at high speed create a twisted texture, and it ends with one line asking about the moment when the boundaries between self and other, fact and truth melt into one……";
    let line = "", y = 540;
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > 690 && ch !== " ") { ctx.fillText(line.trim(), 200, y); line = ""; y += 44; }
      if (y > 990) return;
      line += ch;
    }
    ctx.fillText(line.trim(), 200, y);
  }));
  const pillLens = new THREE.Mesh(sheetGeo, pillLensMat);
  pillLens.position.z = 0.25;
  pillLens.renderOrder = 2;
  pill.add(pillLens);
  scene.add(pill);
  step();

  // ───────── Section: twisted text band and diamond ─────────
  const join = new THREE.Group();
  const twistTex = texFrom(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = hex(C.ink);
    ctx.font = `900 150px ${F.display}`;
    ctx.textBaseline = "middle";
    ctx.fillText("TITLE NAME", 20, h / 2 + 8);
  });
  const twistMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
    uniforms: { map: { value: twistTex }, time: { value: 0 } },
    vertexShader: "uniform float time; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; float a = p.x * 3.2 + time * 0.8; float c = cos(a), s = sin(a); p.yz = vec2(p.y * c - p.z * s, p.y * s + p.z * c); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
    fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.05) discard; gl_FragColor = c; }",
  });
  const twist = new THREE.Mesh(new THREE.PlaneGeometry(2.3 * 0.42, 0.42, 128, 8), twistMat);
  twist.rotation.z = -0.7;
  twist.position.set(-0.32, 0.08, 0);
  join.add(twist);
  // Original floor cubes light their base color only on the face the cursor is over (mouse_over, ray each frame) — the diamond also takes the accent color only while the cursor touches it
  const diamondIdle = mix(C.paper, C.accent, 0.35);
  const diamond = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ color: diamondIdle.clone() }));
  diamond.rotation.z = Math.PI / 4;
  diamond.position.set(0.05, 0.06, 0.05);
  join.add(diamond);
  scene.add(join);
  step();

  // ───────── Linking sections and groups ─────────
  const groups = { ph, grid, wall, pill, join };
  const secs = $$(".mp-sec").map((el) => ({ el, key: el.dataset.scene, group: groups[el.dataset.scene] || null, p: 0 }));
  // compile only walks what is visible — everything must be compiled before hiding so the screen doesn’t freeze when a section first enters or on the first cursor move
  renderer.compile(scene, camera);
  Object.values(groups).forEach((g) => (g.visible = false));
  const words = $$(".mp-world__w");
  const hzLines = $$(".mp-hz__line");
  const gridSec = $(".mp-grid");

  const ray = new THREE.Raycaster();
  let hovered = null;
  const ndc = new THREE.Vector2();
  addEventListener("click", (e) => {
    if (!grid.visible || e.target.closest("a, button, nav")) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(chars, false)[0];
    if (hit?.object.userData.url) location.href = hit.object.userData.url;
  });

  const resize = () => {
    const narrow = innerWidth < 960;
    ball.position.set(narrow ? 0 : -0.04, narrow ? -0.1 : -0.12, -0.2);
    ball.scale.setScalar(narrow ? 0.75 : 1);
    arc.position.x = narrow ? 0 : -0.04;
    arc.scale.setScalar(narrow ? 0.6 : 1);
    ring.scale.setScalar(narrow ? 0.6 : 1);
    twist.position.x = narrow ? -0.05 : -0.32;
    twist.scale.setScalar(narrow ? 0.55 : 1);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    // Plate size fits the screen width visible at that depth — where the text block passes in the original capture (red ball: first line at 85% screen height, pill: paragraph at 6~71%)
    const seen = (z) => 2 * Math.tan(THREE.MathUtils.degToRad(37.5)) * (camera.position.z - z);
    const phW = seen(phLens.position.z) * camera.aspect;
    phLens.scale.set(phW * 0.97, phW * 0.97, 1);
    const pillH = seen(pillLens.position.z), pillW = pillH * camera.aspect;
    pillLens.scale.set(pillW * 1.12, pillW * 1.12 * 0.83, 1);
    pillLens.position.y = -0.105 * pillH;
  };
  resize();
  addEventListener("resize", resize);

  let first = false, phR = 0, phV = 0, pillR = 0, pillV = 0, pulse = 0, since = 0, last = performance.now();
  const t0 = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = (now - t0) / 1000;
    const vh = innerHeight, wpp = visH() / vh;

    const n = reduce ? 0 : mouse.moves;
    mouse.moves = 0;
    phV += 60 * n; phR = Math.min(phR + phV, 2000); phV *= 0.5; phR *= 0.945;
    pillV += 10 * n; pillR = Math.min(pillR + pillV, 6000); pillV *= 0.975; pillR *= 0.975;
    const pr = renderer.getPixelRatio();
    for (const [m, r] of [[arcMat, phR], [phLensMat, phR], [ringMat, pillR], [pillLensMat, pillR]]) {
      m.uniforms.lensAt.value.set(mouse.x * pr, (innerHeight - mouse.y) * pr);
      m.uniforms.lensR.value = r * 0.5;
    }
    ptsMat.uniforms.time.value = t;

    for (const s of secs) {
      const r = s.el.getBoundingClientRect();
      const on = r.top < vh && r.bottom > 0;
      s.p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      const off = r.top > 0 ? r.top : r.bottom < vh ? r.bottom - vh : 0;
      if (s.group) {
        s.group.visible = on;
        s.group.position.y = -off * wpp;
      }
      if (s.key === "top") document.body.classList.toggle("is-top", on && r.bottom > vh * 0.5);
      if (!on) continue;
      if (s.key === "world") words.forEach((w) => { const sp = +w.dataset.speed || 1; w.style.transform = reduce ? "" : `translate3d(0, ${(0.5 - s.p) * (sp - 0.4) * vh * 0.9}px, 0)`; });
      if (s.key === "hz") hzLines.forEach((l) => { const d = +l.dataset.hz || 1, span = Math.max(0, l.scrollWidth - innerWidth); l.style.transform = reduce ? "" : `translate3d(${d < 0 ? -s.p * span : (s.p - 1) * span}px, 0, 0)`; });
      if (s.key === "ph") { arcMat.uniforms.offset.value = reduce ? 0 : s.p * 0.6; phLensMat.uniforms.shift.value = shiftAt(s.p, 0.25); }
      // Moving the original o .25~.85 (6-screen section) into a 5-screen section would make the paragraph cross the center only at the section end — so it is pulled so the section midpoint (.5) matches the original o .667 (paragraph at screen center)
      if (s.key === "pill") { pillBody.rotation.z = -0.95 + s.p * 0.5; pillBody.rotation.y = s.p * Math.PI * 1.5; ringMat.uniforms.offset.value = s.p * 0.5; pillLensMat.uniforms.shift.value = shiftAt(s.p, 0.083); }
      if (s.key === "grid") {
        const z = THREE.MathUtils.smoothstep(s.p, 0.35, 0.75);
        gridInner.scale.setScalar(1 + z * 1.15);
        gridInner.position.y = z * 0.0;
        gridSec.classList.toggle("is-chars", z > 0.5);
        tiles.forEach((m) => { if (!m.userData.url) m.material.opacity = 1 - z * 0.55; });
      }
    }

    if (ph.visible && !reduce) { ball.rotation.x += 0.001; ball.rotation.y += 0.001; }
    if (wall.visible && !reduce) { angel.rotation.x += 0.005; angel.rotation.y += 0.002; }
    if (join.visible) {
      twistMat.uniforms.time.value = reduce ? 0 : t;
      diamond.position.y = 0.06 + Math.sin(t * 1.2) * 0.015;
      ndc.set(mouse.nx, mouse.ny);
      ray.setFromCamera(ndc, camera);
      diamond.material.color.copy(ray.intersectObject(diamond, false).length ? C.accent : diamondIdle);
    }
    if (grid.visible) {
      if (!reduce) gridInner.rotation.x = 0.1 * Math.sin(0.1 * t);
      since += dt;
      pulse = pulse > 0.01 ? pulse * 0.96 : 0;
      if (pulse < 0.001 && since > 3) { pulse = reduce ? 0 : 5; since = 0; }
      pulseMat.uniforms.pulse.value = Math.min(1, pulse / 5);
      pulseMat.uniforms.time.value = t + pulse * 10;
      ndc.set(mouse.nx, mouse.ny);
      ray.setFromCamera(ndc, camera);
      chars.forEach((m) => { m.position.z = -0.01; m.scale.set(1, 1, 1); });
      const hit = ray.intersectObjects(chars, false)[0];
      hovered = hit ? hit.object : null;
      if (hovered) { hovered.position.z = 0.3 / (1 + gridInner.scale.x); hovered.scale.set(1.4, 1.4, 1.4); }
      document.body.style.cursor = hovered ? "pointer" : "";
    }
    renderer.render(scene, camera);
    if (!first) { first = true; step(); }
  });

  const more = $(".mp-top__more");
  more?.addEventListener("click", () => { const box = more.closest(".mp-top__text"); const open = !box.classList.contains("is-open"); box.classList.toggle("is-open", open); more.textContent = open ? "CLOSE" : "VIEW MORE"; });
  step();
})();
