// Single-screen stage — two giant words filling the screen flatten and swap every 3 seconds (.6s expo.inOut), and eight color windows appear above them .12s apart.
// The window is a looking-through window that shows a perspective-camera scene of the whole screen only inside its own rectangle, so moving the window reveals different objects.
(() => {
  if (!window.THREE) return;
  const stage = document.querySelector(".stage");
  const loader = document.querySelector(".preloader");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const words = (stage.dataset.words || "BRAND|STUDIOS").split("|");
  const items = (stage.dataset.items || "").split("|").filter(Boolean).map((s) => {
    const [label, shape] = s.split(":");
    return { label, shape };
  });

  // Skin variables are color-mix or oklch, so paint the computed color on a 1px canvas and read it as rgb
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssColor = (name) => {
    const prev = document.body.style.color;
    document.body.style.color = `var(${name})`;
    const c = getComputedStyle(document.body).color;
    document.body.style.color = prev;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return { css: `rgb(${d[0]},${d[1]},${d[2]})`, three: new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255) };
  };
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  let vw = innerWidth, vh = innerHeight;
  const scaleOf = () => Math.min(1.5, Math.max(0.5, vw / 1440));
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(vw, vh);
  renderer.autoClear = false;
  stage.append(renderer.domElement);
  const ortho = new THREE.OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, -100, 100);
  const persp = new THREE.PerspectiveCamera(45, vw / vh, 0.1, 1000);
  persp.position.z = 5;

  const pal = {};
  const readPalette = () => {
    pal.bg = cssColor("--kf-bg");
    pal.ink = cssColor("--kf-ink");
    pal.lime = cssColor("--kf-accent");
    pal.magenta = cssColor("--site-magenta");
    pal.violet = cssColor("--site-violet");
    pal.grey = cssColor("--site-grey");
    pal.dark = cssColor("--site-outline");
  };
  readPalette();
  renderer.setClearColor(pal.bg.three, 1);

  // ───────── Giant word ─────────
  // Draw the word on a canvas fit exactly to the letter box height and attach it to the plate — the plate fills the screen width fully and its height stretches to 1.15x the screen height × the letter ratio
  const CAP = 0.848;
  const wordScene = new THREE.Scene();
  const wordTexture = (text) => {
    const font = `${cssVar("--kf-weight-display") || 400} 640px ${cssVar("--kf-font-display")}`;
    const c = document.createElement("canvas");
    const g = c.getContext("2d");
    g.font = font;
    const m = g.measureText(text);
    const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
    const left = m.actualBoundingBoxLeft, w = left + m.actualBoundingBoxRight;
    c.width = Math.ceil(w) + 2;
    c.height = Math.ceil(asc + desc) + 2;
    g.font = font;
    g.fillStyle = pal.ink.css;
    g.fillText(text, left + 1, asc + 1);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  };
  const glText = [];
  const buildWords = () => {
    glText.forEach((m) => { wordScene.remove(m); m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); });
    glText.length = 0;
    words.forEach((w, i) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, CAP), new THREE.MeshBasicMaterial({ map: wordTexture(w), transparent: true, depthTest: false }));
      mesh.scale.set(vw * 0.985, 1.15 * vh, 1);
      mesh.position.y = -0.015 * vh;
      if (i > 0) { mesh.scale.y = 0; mesh.position.y = 0.5 * vh * (i % 2 === 0 ? 1 : -1); mesh.visible = false; }
      wordScene.add(mesh);
      glText.push(mesh);
    });
  };
  let activeText = 0;
  const switchWord = () => {
    const prev = activeText;
    const next = (activeText + 1) % glText.length;
    activeText = next;
    const r = next % 2 === 0 ? -1 : 1;
    const a = glText[prev], b = glText[next];
    gsap.to(a.scale, { y: 0, ease: "expo.inOut", duration: 0.6, onComplete: () => { a.visible = false; } });
    gsap.to(a.position, { y: 0.485 * vh * r, ease: "expo.inOut", duration: 0.6 });
    b.visible = true;
    gsap.set(b.position, { y: -0.485 * vh * r });
    gsap.to(b.scale, { y: 1.165 * vh, ease: "expo.inOut", duration: 0.6 });
    gsap.to(b.position, { y: -0.015 * vh, ease: "expo.inOut", duration: 0.6 });
  };

  // ───────── Objects inside the window ─────────
  // Spin 50 identical objects on their own axes and make them drift 0.5~7 in screen space on a sine curve (original values in our shader)
  const VERT = `
    attribute vec4 aRand;
    uniform float uTime;
    varying vec3 vNormal;
    mat3 spin(vec3 axis, float a) {
      axis = normalize(axis);
      float s = sin(a), c = cos(a), k = 1.0 - c;
      return mat3(
        k * axis.x * axis.x + c, k * axis.x * axis.y + axis.z * s, k * axis.z * axis.x - axis.y * s,
        k * axis.x * axis.y - axis.z * s, k * axis.y * axis.y + c, k * axis.y * axis.z + axis.x * s,
        k * axis.z * axis.x + axis.y * s, k * axis.y * axis.z - axis.x * s, k * axis.z * axis.z + c);
    }
    void main() {
      mat3 r = spin(aRand.xyz + 0.001, uTime);
      vec3 p = r * (position * (aRand.w * 0.8 + 0.2));
      vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
      float t = uTime * 0.6;
      mv.x += sin(t * aRand.z + 6.2832 * aRand.w) * mix(0.5, 7.0, aRand.x);
      mv.y += sin(t * aRand.y + 6.2832 * aRand.x) * mix(0.5, 7.0, aRand.w);
      mv.z += sin(t * aRand.w + 6.2832 * aRand.y) * mix(0.0, 7.0, aRand.z);
      vNormal = normalize(normalMatrix * mat3(instanceMatrix) * (r * normal));
      gl_Position = projectionMatrix * mv;
    }
  `;
  const FRAG = `
    uniform vec3 uColor;
    uniform vec3 uShade;
    varying vec3 vNormal;
    void main() {
      float l = 0.55 + 0.45 * max(dot(normalize(vNormal), normalize(vec3(0.4, 0.8, 0.6))), 0.0);
      float rim = pow(1.0 - abs(normalize(vNormal).z), 2.0);
      gl_FragColor = vec4(mix(uColor * l, uShade, rim * 0.35), 1.0);
    }
  `;
  // Object slot — instead of the original 3D model, a basic shape of the same size and silhouette ratio. The object’s own color is part of the picture, so it doesn’t follow the skin
  const bottle = () => new THREE.LatheGeometry([[0, -0.55], [0.26, -0.55], [0.28, -0.4], [0.28, 0.15], [0.12, 0.35], [0.1, 0.62], [0, 0.62]].map(([x, y]) => new THREE.Vector2(x, y)), 18);
  const bowl = () => new THREE.LatheGeometry([[0, -0.3], [0.35, -0.3], [0.55, -0.05], [0.62, 0.25], [0.58, 0.25], [0.5, -0.02], [0, -0.22]].map(([x, y]) => new THREE.Vector2(x, y)), 22);
  const SHAPES = {
    cone: () => new THREE.ConeGeometry(0.22, 1.4, 14),
    sphere: () => new THREE.SphereGeometry(0.55, 22, 16),
    arc: () => new THREE.TorusGeometry(0.85, 0.16, 10, 28, 2.1),
    bottle,
    disc: () => new THREE.CylinderGeometry(0.42, 0.42, 0.36, 22),
    egg: () => new THREE.SphereGeometry(0.45, 18, 14).scale(1.25, 0.9, 1),
    ball: () => new THREE.SphereGeometry(0.42, 22, 16),
    bowl,
  };
  const TONES = {
    cone: ["#d4271c", "#5a8a24"], /* Not Skin: the item’s own color for the chili spot */
    sphere: ["#f39a6b", "#e0543c"], /* not skin: the peach slot object’s own color */
    arc: ["#f4c430", "#9a7a12"], /* not skin: the banana slot object’s own color */
    bottle: ["#4f7a1c", "#1d2f6b"], /* not skin: the item’s own color in the bottle slot */
    disc: ["#f07a5a", "#fff3e6"], /* Not Skin: the item’s own color for the sushi spot */
    egg: ["#8c8c8c", "#3a3a3a"], /* not skin: the cat slot object’s own color */
    ball: ["#151515", "#f2f2f2"], /* not skin: the billiard ball slot object’s own color */
    bowl: ["#b3261e", "#1a1a1a"], /* Not skin: the object’s own color for the ramen bowl spot */
  };
  const makeObjects = (shape) => {
    const geo = (SHAPES[shape] || SHAPES.sphere)();
    const n = geo.attributes.position.count;
    const rand = new Float32Array(50 * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    geo.setAttribute("aRand", new THREE.InstancedBufferAttribute(rand, 4));
    const [base, shade] = TONES[shape] || TONES.sphere;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uTime: { value: Math.random() * 10 }, uColor: { value: new THREE.Color(base) }, uShade: { value: new THREE.Color(shade) } },
      side: shape === "bowl" ? THREE.DoubleSide : THREE.FrontSide,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, 50);
    const o = new THREE.Object3D();
    for (let i = 0; i < 50; i++) {
      o.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    return n ? mesh : null;
  };

  // ───────── Window ─────────
  // 15px border (window color) · 1px black outer line · 1px black inner line · 30px-high name strip centered 45px from the bottom (30px inset on each side, 2px black border)
  const UI_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const UI_FRAG = `
    uniform vec2 uSize;
    uniform vec3 uFrame;
    uniform vec3 uLine;
    varying vec2 vUv;
    float inside(vec2 px, float inset) {
      return step(inset, px.x) * step(inset, px.y) * step(inset, uSize.x - px.x) * step(inset, uSize.y - px.y);
    }
    void main() {
      vec2 px = vUv * uSize;
      float pad = 15.0;
      vec3 col = uLine;
      float a = 1.0;
      if (inside(px, 1.0) > 0.5) col = uFrame;
      if (inside(px, pad) > 0.5) col = uLine;
      if (inside(px, pad + 1.0) > 0.5) a = 0.0;
      vec2 c = vec2(uSize.x * 0.5, 45.0);
      vec2 d = abs(px - c);
      vec2 half_ = vec2(uSize.x * 0.5 - 30.0, 15.0);
      if (d.x <= half_.x + 2.0 && d.y <= half_.y + 2.0) { col = uLine; a = 1.0; }
      if (d.x <= half_.x && d.y <= half_.y) { col = uFrame; a = 1.0; }
      gl_FragColor = vec4(col, a);
    }
  `;
  const SCHEMES = [["lime", "magenta", "ink"], ["violet", "grey", "dark"], ["magenta", "lime", "dark"], ["grey", "violet", "ink"]];
  const labelTexture = (text, color, width) => {
    const c = document.createElement("canvas");
    const k = 2;
    c.width = Math.ceil(width * k);
    c.height = Math.ceil(18 * k);
    const g = c.getContext("2d");
    g.scale(k, k);
    g.font = `700 14px ${cssVar("--kf-font-sans")}`;
    g.fillStyle = color;
    g.textBaseline = "alphabetic";
    g.fillText(text.toUpperCase(), 0, 14);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  };
  const frames = [];
  const makeFrame = (i) => {
    const s = scaleOf();
    const w = 100 * Math.random() + 300, h = 100 * Math.random() + 300;
    const [fill, edge, ink] = SCHEMES[i % 4];
    const item = items[i % items.length] || { label: "ITEM NAME", shape: "sphere" };
    const group = new THREE.Group();
    group.position.set((Math.random() - 0.5) * (vw - w * s), (Math.random() - 0.5) * (vh - h * s), 0);
    group.scale.set(s, s, 1);
    const fillMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: pal[fill].three, depthTest: false }));
    const ui = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
      vertexShader: UI_VERT,
      fragmentShader: UI_FRAG,
      transparent: true,
      depthTest: false,
      uniforms: { uSize: { value: new THREE.Vector2(w, h) }, uFrame: { value: pal[edge].three }, uLine: { value: pal.dark.three } },
    }));
    const lw = w - 80;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(lw, 18), new THREE.MeshBasicMaterial({ map: labelTexture(item.label, pal[ink].css, lw), transparent: true, depthTest: false }));
    label.position.set(-0.5 * w + 40 + lw / 2, -0.5 * h + 44, 0);
    const fillScene = new THREE.Scene();
    const uiScene = new THREE.Scene();
    const fillGroup = new THREE.Group();
    const uiGroup = new THREE.Group();
    fillGroup.add(fillMesh);
    uiGroup.add(ui, label);
    fillScene.add(fillGroup);
    uiScene.add(uiGroup);
    const scene = new THREE.Scene();
    const objects = makeObjects(item.shape);
    if (objects) scene.add(objects);
    const f = { w, h, group, fillGroup, uiGroup, fillScene, uiScene, scene, objects, fill, edge, ink, item, label };
    const sync = () => {
      fillGroup.position.copy(group.position); fillGroup.scale.copy(group.scale);
      uiGroup.position.copy(group.position); uiGroup.scale.copy(group.scale);
    };
    f.sync = sync;
    sync();
    return f;
  };

  // ───────── Drawing ─────────
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    const scale = Math.max(1, now - last) / (1000 / 60);
    last = now;
    renderer.setScissorTest(false);
    renderer.clear(true, true, true);
    renderer.render(wordScene, ortho);
    for (const f of frames) {
      if (f.objects && !reduce) {
        f.objects.rotation.y += 0.01 * scale;
        f.objects.material.uniforms.uTime.value += 0.01 * scale;
      }
      f.sync();
      renderer.render(f.fillScene, ortho);
      const s = f.group.scale.x;
      const left = vw / 2 + f.group.position.x - (f.w * s) / 2;
      const bottom = vh / 2 + f.group.position.y - (f.h * s) / 2;
      renderer.clearDepth();
      renderer.setScissorTest(true);
      renderer.setScissor(left, bottom, f.w * s, f.h * s);
      renderer.render(f.scene, persp);
      renderer.setScissorTest(false);
      renderer.render(f.uiScene, ortho);
    }
  };

  // ───────── Drag ─────────
  // Grabbing a window brings it to the front and it follows the hand as is. Over a window the cursor is grab, and while pressed it is grabbing
  let active = null, down = false, px = 0, py = 0;
  const hit = (x, y) => {
    const wx = x - vw / 2, wy = vh / 2 - y;
    for (let i = frames.length - 1; i >= 0; i--) {
      const f = frames[i], s = f.group.scale.x;
      if (Math.abs(wx - f.group.position.x) <= (f.w * s) / 2 && Math.abs(wy - f.group.position.y) <= (f.h * s) / 2) return f;
    }
    return null;
  };
  const cursor = (x, y) => {
    const over = !!hit(x, y);
    stage.classList.toggle("is-grab", over && !down);
    stage.classList.toggle("is-grabbing", over && down);
  };
  stage.addEventListener("pointerdown", (e) => {
    down = true;
    px = e.clientX; py = e.clientY;
    active = hit(px, py);
    if (active) {
      frames.splice(frames.indexOf(active), 1);
      frames.push(active);
      stage.setPointerCapture?.(e.pointerId);
    }
    cursor(px, py);
  });
  stage.addEventListener("pointermove", (e) => {
    if (active) {
      active.group.position.x += e.clientX - px;
      active.group.position.y -= e.clientY - py;
    }
    px = e.clientX; py = e.clientY;
    cursor(px, py);
  });
  const release = (e) => { down = false; active = null; if (e) cursor(e.clientX, e.clientY); };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", () => release());

  // The tag is scattered and cleared by the motion part drag-front-free — only presses released without dragging come here
  const tagBox = document.querySelector(".t");
  document.querySelectorAll(".tag").forEach((t) => t.addEventListener("click", (e) => {
    if (t.getAttribute("href") === "#") e.preventDefault();
    if (!t.hasAttribute("data-sound")) return;
    const on = t.dataset.on;
    t.dataset.on = t.textContent;
    t.textContent = on;
  }));

  addEventListener("resize", () => {
    const ow = vw, oh = vh;
    vw = innerWidth; vh = innerHeight;
    renderer.setSize(vw, vh);
    Object.assign(ortho, { left: -vw / 2, right: vw / 2, top: vh / 2, bottom: -vh / 2 });
    ortho.updateProjectionMatrix();
    persp.aspect = vw / vh;
    persp.updateProjectionMatrix();
    const s = scaleOf();
    frames.forEach((f) => { f.group.position.x *= vw / ow; f.group.position.y *= vh / oh; f.group.scale.set(s, s, 1); });
    glText.forEach((m, i) => {
      m.scale.x = vw * 0.985;
      if (i === activeText) { m.scale.y = 1.15 * vh; m.position.y = -0.015 * vh; }
    });
  });

  // ───────── Start ─────────
  // When the font arrives, it bakes the words and turns the stage on, then eight windows at .12s intervals, and when all are placed the tags show at .12s intervals
  const start = async () => {
    try { await document.fonts.load(`400 300px ${cssVar("--kf-font-display")}`); await document.fonts.load(`700 14px ${cssVar("--kf-font-sans")}`); } catch (e) { /* If the font is late, a fallback font steps in */ }
    // The original shows LOADING… while downloading eight models and the sound (about 3 seconds) — the copy has nothing to download but holds the same length
    if (!reduce) await new Promise((r) => setTimeout(r, Math.max(0, 3000 - performance.now())));
    buildWords();
    // Shaders are precompiled when the stage is built — compiling when the first window opens would freeze the screen
    const all = items.map((_, i) => makeFrame(i));
    all.forEach((f) => renderer.compile(f.scene, persp));
    stage.classList.add("is-ready");
    loader.classList.add("is-done");
    gsap.ticker.add(tick);
    const gap = reduce ? 0 : 120;
    all.forEach((f, i) => setTimeout(() => frames.push(f), gap * i));
    setTimeout(() => tagBox.setAttribute("data-fx", "drag-front-free"), gap * all.length);
    if (!reduce) setInterval(switchWord, 3000);
  };
  start();
})();
