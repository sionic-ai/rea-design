// Four pages share one canvas — the original uses barba with [data-barba="container"] is swapped out while the WebGL stage stays as is
// Pages change only by switching camera, window (portal), and post-processing mode. So stage, physics, and transitions all live here, and pages only supply a name (namespace).
// Stage: 23 floating objects under zero-gravity physics (cannon.js 0.6.2) → draws two passes, raw and normal (face direction),
//   Hero: outside the window is composed as ‹paper with lines drawn only where the surface direction bends›, inside the window as raw. About and Work use the full raw, Contact uses the full paper.
// When opened via file:// barba cannot fetch the page, so the same transition plays, then the address moves and the new page starts with the transition already finished.
(() => {
  const PX = (window.PX = window.PX || {});
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  const narrow = () => innerWidth <= 820;
  if (reduce) html.classList.add("is-reduced");
  gsap.registerPlugin(ScrollTrigger);

  const PAGE_OF = { "index.html": "home", "about.html": "about", "works.html": "works", "contact.html": "contact" };
  const nsOfHref = (href) => {
    const u = new URL(href, location.href);
    const file = u.pathname.split("/").pop() || "index.html";
    return PAGE_OF[file] || null;
  };

  // Reading colors from a skin — color-mix and oklch(from …) are painted once so the browser resolves them, then read back as pixels
  const probeCanvas = document.createElement("canvas");
  probeCanvas.width = probeCanvas.height = 1;
  const probeCtx = probeCanvas.getContext("2d", { willReadFrequently: true });
  const probeEl = document.createElement("i");
  probeEl.style.display = "none";
  function themeColor(name) {
    if (!probeEl.isConnected) document.body.appendChild(probeEl);
    probeEl.style.color = `var(${name})`;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = getComputedStyle(probeEl).color;
    probeCtx.fillRect(0, 0, 1, 1);
    const d = probeCtx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace);
  }
  const fontVar = () => getComputedStyle(html).getPropertyValue("--kf-font-sans").trim();

  /* ---------------- Line-by-line text reveal (1s power3.out, 0.25s between lines, 0.2s delay) ---------------- */
  const reveals = [];
  function splitLines(el) {
    if (el.dataset.pxSrc === undefined) el.dataset.pxSrc = el.innerHTML;
    const parts = el.dataset.pxSrc.split(/<br\s*\/?>/i);
    el.innerHTML = parts
      .map((p) => {
        const d = document.createElement("div");
        d.innerHTML = p;
        return (d.textContent || "").trim().split(/\s+/).filter(Boolean).map((w) => `<span class="px-word">${w.replace(/</g, "&lt;")}</span>`).join(" ");
      })
      .join("<br>");
    const lines = [];
    let top = null;
    el.querySelectorAll(".px-word").forEach((w) => {
      if (w.offsetTop !== top) { top = w.offsetTop; lines.push([]); }
      lines[lines.length - 1].push(w.outerHTML);
    });
    el.innerHTML = lines.map((l) => `<span class="px-line"><span class="px-words">${l.join(" ")}</span></span>`).join("");
    return el.querySelectorAll(".px-words");
  }
  let revealGen = 0;
  const fontOf = (el) => { const s = getComputedStyle(el); return `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`; };
  function initReveal(root) {
    const els = [...root.querySelectorAll(".reveal-text")];
    const gen = revealGen;
    const run = () => gen === revealGen && els.forEach((el) => {
      if (reduce) { gsap.set(el, { autoAlpha: 1 }); return; }
      const lines = splitLines(el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%", once: true } });
      tl.set(el, { autoAlpha: 1 }).from(lines, { duration: 1, yPercent: 100, ease: "power3.out", stagger: 0.25, delay: 0.2 });
      reveals.push(tl);
    });
    // Lines are split by text width — measuring before the web font arrives splits by fallback font width, so after the font swaps, words drop to the next line one by one
    const fonts = document.fonts;
    if (reduce || !fonts || els.every((el) => fonts.check(fontOf(el), el.textContent))) { run(); return; }
    Promise.all(els.map((el) => fonts.load(fontOf(el), el.textContent))).catch(() => {}).then(run);
  }
  function killReveal() {
    revealGen++;
    reveals.splice(0).forEach((tl) => { tl.scrollTrigger?.kill(); tl.kill(); });
  }

  /* ---------------- Pill menu ---------------- */
  const nav = document.querySelector("[data-px-nav]");
  const setMenu = (open) => {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    const t = nav.querySelector("[data-px-menu-toggle]");
    t?.setAttribute("aria-expanded", String(open));
    nav.querySelector("[data-px-menu-panel]")?.setAttribute("aria-hidden", String(!open));
  };
  nav?.querySelector("[data-px-menu-toggle]")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu(!nav.classList.contains("is-open"));
  });
  document.addEventListener("pointerdown", (e) => nav && !nav.contains(e.target) && setMenu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  const syncNav = (ns) => document.querySelectorAll("[data-px-menu] a").forEach((a) => (nsOfHref(a.href) === ns ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));

  /* ---------------- Stage ---------------- */
  const CAMERA_Z = 25;
  const BOUNDS = { x: 13, y: 7, z: 3 };
  const COUNT = coarse ? 10 : 23;
  const WORKS_CENTER = new THREE.Vector3(0, coarse ? -19.5 : -22, CAMERA_Z);
  const W = {
    count: 10, w: coarse ? 4.3 : 4.8, h: coarse ? 2.7 : 3.0, gap: coarse ? 0.75 : 1.0, depth: coarse ? 4.5 : 9, rot: 10,
    lerp: 0.16, wheel: coarse ? 0.006 : 0.008, friction: 0.1, auto: coarse ? 0.22 : 0.45, radius: coarse ? 0.16 : 0.2,
  };
  W.period = W.count * (W.w + W.gap);
  const SWITCH_AT = 0.58;

  const S = {
    ns: null, mode: 0, portal: { x: 0, y: 0, w: 0, h: 0, r: 30 }, portalScale: 1, portalLocked: false,
    camT: 0, camTarget: 0, aboutBack: 0, mouse: new THREE.Vector2(), mouseT: new THREE.Vector3(), mousePrev: new THREE.Vector3(), mouseSpeed: 0,
    gravity: false, worksX: 0, worksXT: 0, worksV: 0, worksAuto: 0, drag: null, parallax: { x: 0, y: 0, tx: 0, ty: 0 },
    service: { index: -1, models: [], yaw: 0, pitch: 0, drag: null, rect: null },
  };
  const canvas = document.querySelector("[data-px-gl]");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const C = {};
  function readColors() {
    C.stage = themeColor("--site-stage");
    C.paper = themeColor("--site-paper");
    C.sketch = themeColor("--site-sketch-ink");
    C.grid = themeColor("--site-grid");
    C.obj = ["--site-obj-key", "--site-obj-hand", "--site-obj-phones", "--site-obj-dog"].map(themeColor);
    C.stageInk = themeColor("--site-stage-ink");
    C.accent = themeColor("--kf-accent");
  }
  readColors();

  const scene = new THREE.Scene();
  const rawBg = C.stage.clone();
  scene.fog = new THREE.Fog(rawBg, 35, 85);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);
  scene.add(camera);
  const look = new THREE.Vector3();

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x181818, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-12, 14, 18);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { near: 1, far: 80, left: -22, right: 22, top: 16, bottom: -16 });
  key.shadow.bias = -0.00035;
  key.shadow.normalBias = 0.025;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.95);
  fill.position.set(14, 2, 12);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.15);
  rim.position.set(4, 10, -16);
  scene.add(rim);

  // Floor grid — wall (XY, z=-45) sits behind the Hero and About, floor (XZ, y=-65) sits under Work
  function gridMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uColor: { value: C.grid }, uOpacity: { value: coarse ? 0.1 : 0.16 }, uCell: { value: 4 }, uSize: { value: new THREE.Vector2(180, 100) } },
      vertexShader: "varying vec2 vP; uniform vec2 uSize; void main(){ vP = uv * uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uCell; varying vec2 vP;
        void main(){ vec2 g = abs(fract(vP / uCell - 0.5) - 0.5) * uCell; vec2 w = fwidth(vP) * 1.1;
          float l = 1.0 - min(min(g.x / w.x, g.y / w.y), 1.0);
          gl_FragColor = vec4(uColor, l * uOpacity);
          #include <colorspace_fragment>
        }`,
    });
  }
  const gridWall = new THREE.Mesh(new THREE.PlaneGeometry(180, 100), gridMaterial());
  gridWall.position.z = -45;
  scene.add(gridWall);
  const gridFloor = new THREE.Mesh(new THREE.PlaneGeometry(180, 100), gridMaterial());
  gridFloor.rotation.x = -Math.PI / 2;
  gridFloor.position.set(0, -65, CAMERA_Z);
  scene.add(gridFloor);

  /* Four objects — the original keycap · hand · headphones · balloon dog replaced with our basic shapes of the same size · silhouette ratio */
  function roundedSquare(w, h, r) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }
  function capsule(r, len) { return new THREE.CapsuleGeometry(r, len, 6, 14); }
  const BUILD = {
    key(mat) {
      const g = new THREE.Group();
      const base = new THREE.ExtrudeGeometry(roundedSquare(2.3, 2.3, 0.45), { depth: 1.0, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.16, bevelSegments: 4, curveSegments: 10 });
      base.center();
      g.add(new THREE.Mesh(base, mat));
      const top = new THREE.ExtrudeGeometry(roundedSquare(1.7, 1.7, 0.35), { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3, curveSegments: 10 });
      top.center();
      const t = new THREE.Mesh(top, mat);
      t.position.z = 0.75;
      g.add(t);
      return g;
    },
    hand(mat) {
      const g = new THREE.Group();
      const palm = new THREE.ExtrudeGeometry(roundedSquare(1.5, 1.7, 0.5), { depth: 0.45, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.12, bevelSegments: 3 });
      palm.center();
      g.add(new THREE.Mesh(palm, mat));
      [[-0.55, 1.35, 0.95, 0.12], [-0.18, 1.5, 1.2, 0.03], [0.2, 1.45, 1.1, -0.05], [0.56, 1.25, 0.85, -0.16]].forEach(([x, y, len, rz]) => {
        const f = new THREE.Mesh(capsule(0.2, len), mat);
        f.position.set(x, y, 0);
        f.rotation.z = rz;
        g.add(f);
      });
      const th = new THREE.Mesh(capsule(0.22, 0.8), mat);
      th.position.set(-0.95, 0.05, 0.1);
      th.rotation.z = 0.95;
      g.add(th);
      const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.7, 18), mat);
      wrist.position.y = -1.15;
      g.add(wrist);
      return g;
    },
    phones(mat) {
      const g = new THREE.Group();
      const band = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.17, 12, 40, Math.PI), mat);
      band.position.y = 0.2;
      g.add(band);
      [-1, 1].forEach((s) => {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 24), mat);
        cup.rotation.z = Math.PI / 2;
        cup.position.set(s * 1.45, -0.25, 0);
        g.add(cup);
        const pad = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.17, 10, 24), mat);
        pad.rotation.y = Math.PI / 2;
        pad.position.set(s * 1.15, -0.25, 0);
        g.add(pad);
      });
      return g;
    },
    dog(mat) {
      const g = new THREE.Group();
      const part = (len, x, y, rz) => { const m = new THREE.Mesh(capsule(0.32, len), mat); m.position.set(x, y, 0); m.rotation.z = rz; g.add(m); };
      part(1.1, 0, 0, Math.PI / 2);
      part(0.7, 0.75, 0.55, -0.3);
      part(0.5, 1.15, 1.0, Math.PI / 2 - 0.2);
      part(0.35, 0.95, 1.4, 0.2);
      [[-0.55, -0.7], [0.55, -0.7]].forEach(([x, y]) => { part(0.75, x, y, 0.12); const b = new THREE.Mesh(capsule(0.32, 0.75), mat); b.position.set(x, y, 0.55); b.rotation.z = -0.12; g.add(b); });
      part(0.5, -0.95, 0.4, 0.7);
      return g;
    },
  };
  const KINDS = ["key", "hand", "phones", "dog"];
  function makeMat(kind, i) {
    const glossy = kind === "dog" || i % 3 === 0;
    return new THREE.MeshStandardMaterial({ color: C.obj[KINDS.indexOf(kind)], roughness: glossy ? 0.2 : 0.5, metalness: 0 });
  }
  const SCALE = 1.55;
  const objects = [];
  const per = coarse ? [3, 3, 2, 2] : [6, 6, 6, 5];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  KINDS.forEach((kind, k) => {
    for (let n = 0; n < per[k]; n++) {
      const i = objects.length;
      const g = BUILD[kind](makeMat(kind, i));
      g.scale.setScalar(SCALE);
      g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      g.position.set((rnd() * 2 - 1) * 12, (rnd() * 2 - 1) * 6.5, (rnd() * 2 - 1) * 2.5);
      g.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
      g.userData.kind = kind;
      scene.add(g);
      objects.push(g);
    }
  });

  // Zero gravity + weak pull toward the center + pushes away near a moving mouse (radius 7, strength 100.8, force clamped to ±0.5)
  const world = new CANNON.World();
  world.gravity.set(0, 0, 0);
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.solver.iterations = 8;
  world.allowSleep = true;
  world.defaultContactMaterial.friction = 0;
  world.defaultContactMaterial.restitution = 0.3;
  const bodies = objects.map((g) => {
    const q = g.quaternion.clone();
    g.quaternion.identity();
    g.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());
    g.quaternion.copy(q);
    const b = new CANNON.Body({
      mass: 0.025, shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)),
      position: new CANNON.Vec3(g.position.x, g.position.y, g.position.z), linearDamping: 0.1, angularDamping: 0.1,
    });
    b.quaternion.set(q.x, q.y, q.z, q.w);
    b.allowSleep = true;
    b.sleepSpeedLimit = 0.1;
    b.sleepTimeLimit = 0.5;
    world.addBody(b);
    return b;
  });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function stepPhysics() {
    bodies.forEach((b) => {
      const f = new CANNON.Vec3();
      const p = b.position;
      const d = Math.hypot(p.x, p.y, p.z);
      if (!S.gravity && d > 0.001) {
        const c = Math.min(d, 5) * 0.0003;
        f.x -= (p.x / d) * c; f.y -= (p.y / d) * c; f.z -= (p.z / d) * c;
      }
      if (!coarse && S.mouseSpeed > 0.0002) {
        const mx = p.x - S.mouseT.x, my = p.y - S.mouseT.y, mz = p.z - S.mouseT.z;
        const dm = Math.hypot(mx, my, mz);
        if (dm > 0.001 && dm < 7) {
          const k = (1 - dm / 7) * 100.8;
          f.x += (mx / dm) * k; f.y += (my / dm) * k; f.z += (mz / dm) * k;
          b.wakeUp();
        }
      }
      b.force.set(clamp(f.x, -0.5, 0.5), clamp(f.y, -0.5, 0.5), clamp(f.z, -0.5, 0.5));
      for (const ax of ["x", "y", "z"]) {
        if (p[ax] < -BOUNDS[ax]) { p[ax] = -BOUNDS[ax]; if (b.velocity[ax] < 0) b.velocity[ax] *= -0.5; }
        else if (p[ax] > BOUNDS[ax]) { p[ax] = BOUNDS[ax]; if (b.velocity[ax] > 0) b.velocity[ax] *= -0.5; }
      }
    });
    world.step(1 / 60, 1 / 60, 1);
    bodies.forEach((b, i) => { objects[i].position.copy(b.position); objects[i].quaternion.copy(b.quaternion); });
  }
  const launchNoise = (i, s) => { const v = Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };
  function setGravity(on) {
    if (S.gravity === on) return;
    S.gravity = on;
    world.gravity.set(0, on ? (coarse ? -7 : -9) : 0, 0);
    if (!on) { bodies.forEach((b) => b.wakeUp()); return; }
    bodies.forEach((b, i) => {
      const ly = THREE.MathUtils.lerp(8.2 * 0.42, 8.2 * 1.38, launchNoise(i, 2));
      b.velocity.set(b.velocity.x * 0.14 + (launchNoise(i, 1) * 2 - 1) * 3.4 * (0.55 + launchNoise(i, 4) * 0.95), ly,
        b.velocity.z * 0.14 + (launchNoise(i, 3) * 2 - 1) * 1.65 * (0.6 + launchNoise(i, 6) * 0.9));
      const sp = 2.2 * (0.45 + launchNoise(i, 5) * 1.35);
      b.angularVelocity.set((launchNoise(i, 7) * 2 - 1) * sp, (launchNoise(i, 8) * 2 - 1) * 2.2, (launchNoise(i, 10) * 2 - 1) * 2.2);
      b.wakeUp();
    });
  }

  /* Work carousel — 10 cards, set on a floor seen from above, the center bulges 9 toward the camera */
  const worksOuter = new THREE.Group();
  worksOuter.position.copy(WORKS_CENTER);
  worksOuter.rotation.y = THREE.MathUtils.degToRad(W.rot);
  const worksGroup = new THREE.Group();
  worksGroup.rotation.x = -Math.PI / 2;
  worksOuter.add(worksGroup);
  scene.add(worksOuter);
  const PROJECTS = [
    ["Project Name 01", "Your one-line work description here", "3D scene of a perfume bottle product · red sand dune · sunset backlight"],
    ["Project Name 02", "Your one-line work description here", "Match scene photo · motorcycle rider · daytime outdoors · telephoto"],
    ["Project Name 03", "Your one-line work description here", "3D scene of a monument in the forest · fog · front symmetrical"],
    ["Project Name 04", "Your one-line work description here", "Product CGI · glass bottle above the clouds · soft sky tones"],
    ["Project Name 05", "Your one-line work description here", "Hospital website screen · bright interior · front view"],
    ["Project Name 06", "Your one-line work description here", "Fashion editorial · person upper body · studio lighting"],
    ["Project Name 07", "Your one-line work description here", "Shoe product render · side view · dark background"],
    ["Project Name 08", "Your one-line work description here", "Furniture photo · living room interior · natural window light"],
    ["Project Name 09", "Your one-line work description here", "Outdoor apparel · person on snowy mountain · daytime"],
    ["Project Name 10", "Your one-line work description here", "Airline service screen · cabin · warm lighting"],
  ];
  // Photo slot — draws a board describing subject, light and composition onto a canvas (original photos and video are not used)
  function panelTexture(i) {
    const cv = document.createElement("canvas");
    cv.width = 1024; cv.height = 640;
    const x = cv.getContext("2d");
    const a = C.accent.clone().offsetHSL((i * 0.097) % 1, -0.2, 0.08 - (i % 3) * 0.06);
    const b = C.stage.clone().lerp(a, 0.35);
    const gr = x.createLinearGradient(0, 0, 1024, 640);
    gr.addColorStop(0, "#" + a.getHexString(THREE.SRGBColorSpace));
    gr.addColorStop(1, "#" + b.getHexString(THREE.SRGBColorSpace));
    x.fillStyle = gr;
    x.fillRect(0, 0, 1024, 640);
    x.strokeStyle = "#" + C.stageInk.getHexString(THREE.SRGBColorSpace);
    x.globalAlpha = 0.35;
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(1024, 640); x.moveTo(1024, 0); x.lineTo(0, 640); x.stroke();
    x.globalAlpha = 1;
    x.fillStyle = "#" + C.stageInk.getHexString(THREE.SRGBColorSpace);
    x.font = `600 30px ${fontVar()}`;
    x.textAlign = "center";
    x.fillText(PROJECTS[i][2], 512, 330);
    x.font = `500 22px ${fontVar()}`;
    x.fillText("Landscape 16:10 · photo or looping video", 512, 372);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  // Split into 24 columns so it doesn’t form angles when bent. A shader trims the rounded corners
  const panelGeometry = () => new THREE.PlaneGeometry(W.w, W.h, coarse ? 16 : 24, 6);
  const panelShader = (tex) => new THREE.ShaderMaterial({
    side: THREE.DoubleSide, transparent: true,
    uniforms: { map: { value: tex }, uSize: { value: new THREE.Vector2(W.w, W.h) }, uR: { value: W.radius }, uOpacity: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform sampler2D map; uniform vec2 uSize; uniform float uR; uniform float uOpacity; varying vec2 vUv;
      float box(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main(){ vec2 p = (vUv - 0.5) * uSize; float d = box(p, uSize * 0.5, uR); float a = 1.0 - smoothstep(-0.01, 0.01, d);
        if (a < 0.01) discard; vec4 c = texture2D(map, vUv); gl_FragColor = vec4(c.rgb, a * uOpacity);
        #include <colorspace_fragment>
      }`,
  });
  const panels = PROJECTS.map((p, i) => {
    const m = new THREE.Mesh(panelGeometry(), panelShader(panelTexture(i)));
    m.userData.baseX = i * (W.w + W.gap);
    m.userData.index = i;
    m.userData.lastX = NaN;
    worksGroup.add(m);
    return m;
  });
  const wrapC = (v, s) => ((((v + s / 2) % s) + s) % s) - s / 2;
  function bendPanel(m, cx) {
    if (Math.abs(m.userData.lastX - cx) < 1e-5) return;
    m.userData.lastX = cx;
    const pos = m.geometry.attributes.position, nor = m.geometry.attributes.normal;
    const k = (Math.PI * 2) / W.period;
    for (let i = 0; i < pos.count; i++) {
      const ph = (cx + pos.getX(i)) * k;
      pos.setZ(i, Math.cos(ph) * W.depth);
      const slope = -Math.sin(ph) * W.depth * k;
      const l = Math.hypot(slope, 1);
      nor.setXYZ(i, -slope / l, 0, 1 / l);
    }
    pos.needsUpdate = true;
    nor.needsUpdate = true;
    m.geometry.boundingSphere = null;
  }
  function updateWorks(dt) {
    const live = S.ns === "works";
    if ((live || (S.ns === "home" && S.camT > 0.12)) && !reduce && !S.portalLocked) S.worksAuto = wrapC(S.worksAuto - W.auto * dt, W.period);
    if (live && !S.drag) { S.worksXT += S.worksV; S.worksV *= W.friction; if (Math.abs(S.worksV) < 1e-3) S.worksV = 0; }
    if (live) S.worksX += (S.worksXT - S.worksX) * W.lerp;
    panels.forEach((m) => {
      const x = wrapC(m.userData.baseX + S.worksX + S.worksAuto, W.period);
      m.position.x = x;
      bendPanel(m, x);
    });
    // Mouse parallax — the carousel follows the mouse by 1.05 and tilts slightly
    const pr = S.parallax;
    pr.x += (pr.tx - pr.x) * 0.052;
    pr.y += (pr.ty - pr.y) * 0.038;
    worksGroup.position.set(pr.x * 1.05, -pr.y * 0.34, pr.y * 1.15);
    worksGroup.rotation.set(-Math.PI / 2 + THREE.MathUtils.degToRad(pr.y * 1.35), THREE.MathUtils.degToRad(pr.x * 2.65), 0);
  }
  function centerPanel() {
    let best = null, bd = Infinity;
    panels.forEach((m) => { const d = Math.abs(m.position.x); if (d < bd) { bd = d; best = m; } });
    return best;
  }

  /* Service mockup in About — attached to the camera and floated over the DOM cell (.about-services__media) */
  const serviceRoot = new THREE.Group();
  camera.add(serviceRoot);
  ["dog", "hand", "key", "phones"].forEach((kind, i) => {
    const mat = makeMat(kind, 0);
    mat.fog = false;
    const g = BUILD[kind](mat);
    const holder = new THREE.Group();
    holder.add(g);
    g.rotation.set(...[[0.1, 0.5, 0.02], [0.06, 2.4, -0.08], [0.42, 0.8, 0.08], [0.3, -0.45, 0.3]][i]);
    holder.scale.setScalar(0.0001);
    holder.userData.reveal = 0;
    serviceRoot.add(holder);
    S.service.models.push(holder);
  });
  serviceRoot.visible = false;

  /* Post-processing — takes two passes, raw and face-direction, and composites inside and outside the window */
  const rtOpts = { type: THREE.HalfFloatType, samples: 4 };
  const rawRT = new THREE.WebGLRenderTarget(1, 1, rtOpts);
  const normRT = new THREE.WebGLRenderTarget(1, 1, rtOpts);
  // Draw in the smooth-face direction so no hatching shows on round bodies and only outlines·edges become lines (the original model has dense faces, so same result)
  const normalMat = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  const comp = new THREE.ShaderMaterial({
    uniforms: {
      tRaw: { value: rawRT.texture }, tNormal: { value: normRT.texture }, uRes: { value: new THREE.Vector2(1, 1) },
      uPortal: { value: new THREE.Vector4() }, uRadius: { value: 30 }, uPaper: { value: C.paper }, uInk: { value: C.sketch },
      uRawAll: { value: 0 }, uBlur: { value: 0 }, uBlurDir: { value: new THREE.Vector2(0, 1) },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `precision highp float;
      uniform sampler2D tRaw; uniform sampler2D tNormal; uniform vec2 uRes; uniform vec4 uPortal; uniform float uRadius;
      uniform vec3 uPaper; uniform vec3 uInk; uniform float uRawAll; uniform float uBlur; uniform vec2 uBlurDir; varying vec2 vUv;
      vec3 N(vec2 uv){ return texture2D(tNormal, uv).rgb; }
      vec4 rawAt(vec2 uv){
        if (uBlur < 0.01) return texture2D(tRaw, uv);
        vec2 st = normalize(uBlurDir + 1e-6) * uBlur / uRes; vec4 c = vec4(0.0); float t = 0.0;
        for (int i = -3; i <= 3; i++) { float w = 1.0 - abs(float(i)) / 4.0; c += texture2D(tRaw, clamp(uv + st * float(i) / 3.0, 0.001, 0.999)) * w; t += w; }
        return c / t;
      }
      float edge(vec2 uv){
        vec2 o = 0.48 / uRes; vec3 c = N(uv); float e = 0.0;
        e = max(e, distance(c, N(uv + vec2(o.x, 0.0)))); e = max(e, distance(c, N(uv - vec2(o.x, 0.0))));
        e = max(e, distance(c, N(uv + vec2(0.0, o.y)))); e = max(e, distance(c, N(uv - vec2(0.0, o.y))));
        e = max(e, distance(c, N(uv + o)) * 0.75); e = max(e, distance(c, N(uv - o)) * 0.75);
        e = max(e, distance(c, N(uv + vec2(o.x, -o.y))) * 0.75); e = max(e, distance(c, N(uv + vec2(-o.x, o.y))) * 0.75);
        return smoothstep(0.075, 0.17, e);
      }
      float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main(){
        vec4 raw = rawAt(vUv);
        if (uRawAll > 0.5) { gl_FragColor = raw;
          #include <colorspace_fragment>
          return; }
        vec3 sketch = mix(uPaper, uInk, edge(vUv));
        vec2 hs = max(uPortal.zw * 0.5, vec2(0.001));
        float d = rbox(vUv * uRes - (uPortal.xy + hs), hs, min(uRadius, min(hs.x, hs.y)));
        float m = (uPortal.z < 0.5 || uPortal.w < 0.5) ? 0.0 : 1.0 - smoothstep(-0.75, 0.75, d);
        gl_FragColor = vec4(mix(sketch, raw.rgb, m), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const compScene = new THREE.Scene();
  compScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), comp));
  const compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function resize() {
    const w = innerWidth, h = innerHeight, pr = renderer.getPixelRatio();
    renderer.setSize(w, h, false);
    rawRT.setSize(w * pr, h * pr);
    normRT.setSize(w * pr, h * pr);
    comp.uniforms.uRes.value.set(w * pr, h * pr);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (S.ns === "home" && !S.portalLocked) syncPortal(true);
  }
  addEventListener("resize", resize);

  // Window size is set by the DOM button — hover 1.2x (0.5s power2.out) scales from the same center.
  const portalEl = document.querySelector("[data-px-portal]");
  const portalLabel = portalEl?.querySelector(".px-portal__label");
  function portalBase() {
    const r = portalEl.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, r: parseFloat(getComputedStyle(portalEl).borderRadius) || 30 };
  }
  function syncPortal(force) {
    if (!portalEl || S.portalLocked) return;
    const b = portalBase(), s = S.portalScale;
    const t = { x: b.x + (b.w - b.w * s) / 2, y: b.y + (b.h - b.h * s) / 2, w: b.w * s, h: b.h * s, r: b.r * s };
    if (force) Object.assign(S.portal, t);
    return t;
  }
  function pushPortal() {
    const pr = renderer.getPixelRatio();
    const p = S.portal;
    comp.uniforms.uPortal.value.set(p.x * pr, (innerHeight - p.y - p.h) * pr, p.w * pr, p.h * pr);
    comp.uniforms.uRadius.value = p.r * pr;
  }
  const fullRect = () => ({ x: 0, y: 0, w: innerWidth, h: innerHeight, r: 0 });
  const zeroRect = () => ({ x: innerWidth / 2, y: innerHeight / 2, w: 0, h: 0, r: 30 });
  const tweenPortal = (to, dur, ease) => new Promise((res) => {
    gsap.killTweensOf(S.portal);
    if (reduce || dur === 0) { Object.assign(S.portal, to); return res(); }
    gsap.to(S.portal, { ...to, duration: dur, ease, onComplete: res });
  });

  // Motion blur during the transition — rises to the max (88.5px × strength, 5px on phones) over 38% of the length with power2.in, then clears over the remaining 62% with power3.out
  const blurState = { v: 0 };
  let blurTl = null;
  function motionBlur(dur, dx, dy, strength) {
    blurTl?.kill();
    if (reduce || dur <= 0) return;
    comp.uniforms.uBlurDir.value.set(dx, dy);
    const peak = (coarse ? 5 : 88.5) * clamp(strength, 0, 2);
    const sync = () => (comp.uniforms.uBlur.value = blurState.v);
    blurTl = gsap.timeline({ onComplete: () => { blurState.v = 0; sync(); } })
      .to(blurState, { v: peak, duration: dur * 0.38, ease: "power2.in", onUpdate: sync }, 0)
      .to(blurState, { v: 0, duration: dur * 0.62, ease: "power3.out", onUpdate: sync }, dur * 0.38);
  }

  // Enter cursor — like the original, created and attached when the pointer first hovers the window, and follows only inside the window
  let portalCursor = null;
  const ensureCursor = () => {
    if (portalCursor?.isConnected) return portalCursor;
    portalCursor = document.createElement("div");
    portalCursor.className = "px-cursor";
    portalCursor.setAttribute("aria-hidden", "true");
    portalCursor.innerHTML = '<div class="px-cursor__inner">Open</div>';
    document.body.appendChild(portalCursor);
    return portalCursor;
  };
  const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (portalEl) {
    const moveCursor = (e) => { if (portalCursor) portalCursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`; };
    portalEl.addEventListener("mouseenter", (e) => {
      if (S.portalLocked || S.ns !== "home" || !fine()) return;
      gsap.to(S, { portalScale: 1.2, duration: 0.5, ease: "power2.out", overwrite: true });
      ensureCursor();
      moveCursor(e);
      portalCursor.classList.add("is-visible");
    });
    portalEl.addEventListener("mousemove", moveCursor, { passive: true });
    portalEl.addEventListener("mouseleave", () => {
      gsap.to(S, { portalScale: 1, duration: 0.5, ease: "power2.out", overwrite: true });
      portalCursor?.classList.remove("is-visible");
    });
    portalEl.addEventListener("click", () => {
      if (S.ns !== "home") return;
      go(S.camT > SWITCH_AT ? "works.html" : "about.html");
    });
  }

  // Mouse → z=Point on the 0 plane
  const ray = new THREE.Raycaster();
  const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let hitEl = null;
  const onHitMove = (e) => {
    const r = hitEl.getBoundingClientRect();
    S.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(S.mouse, camera);
    ray.ray.intersectPlane(zPlane, S.mouseT);
  };
  const onHitLeave = () => { S.mouse.set(0, 0); S.mouseT.set(0, 0, 0); };
  function bindHit(el) {
    if (hitEl) { hitEl.removeEventListener("mousemove", onHitMove); hitEl.removeEventListener("mouseleave", onHitLeave); }
    hitEl = el;
    if (!el) return;
    el.addEventListener("mousemove", onHitMove, { passive: true });
    el.addEventListener("mouseleave", onHitLeave, { passive: true });
  }

  /* Camera — as Hero scroll goes 0→1, the camera facing forward looks down at the work carousel below */
  const smooth01 = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const fwd = new THREE.Vector3();
  function applyCamera() {
    const p = smooth01(S.camT);
    camera.position.set(0, 0, CAMERA_Z);
    look.lerpVectors(new THREE.Vector3(0, 0, 0), WORKS_CENTER, p);
    if (S.aboutBack > 1e-4) {
      fwd.subVectors(look, camera.position).normalize();
      const depth = -50 * S.aboutBack * (1 - p);
      camera.position.addScaledVector(fwd, depth);
      look.addScaledVector(fwd, depth);
    }
    camera.up.set(0, 1 - p, -p).normalize();
    camera.lookAt(look);
    const f = smooth01(S.aboutBack * (1 - p));
    scene.fog.near = THREE.MathUtils.lerp(35, 20, f);
    scene.fog.far = THREE.MathUtils.lerp(85, 42, f);
  }
  const homeWorksEl = () => document.querySelector("[data-px-home-works]");
  function updateHomeCamera() {
    if (S.ns !== "home" || S.portalLocked) return;
    const el = homeWorksEl();
    if (el) S.camTarget = clamp(1 - el.getBoundingClientRect().top / innerHeight, 0, 1);
    S.camT += (S.camTarget - S.camT) * 0.095;
    if (Math.abs(S.camT - S.camTarget) < 1e-4) S.camT = S.camTarget;
    setHomeWorks(S.camT > SWITCH_AT);
  }
  let homeWorks = false;
  function setHomeWorks(on) {
    if (homeWorks === on) return;
    homeWorks = on;
    html.classList.toggle("is-home-works", on);
    portalLabel?.classList.toggle("is-works", on);
    portalEl?.setAttribute("aria-label", on ? "Open work" : "Open About");
  }
  // Work ↔ About camera curve — accelerates until 0.64s, then eases out smoothly (split point aligned so velocity matches at the seam)
  function worksAboutEase(v) {
    const t = clamp(v, 0, 1), split = 0.64 / 0.9, a = 2, d = 1.35;
    const sp = (d * split) / (a * (1 - split) + d * split);
    if (t <= split) return sp * Math.pow(t / split, a);
    return sp + (1 - sp) * (1 - Math.pow(1 - (t - split) / (1 - split), d));
  }

  /* One Frame */
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!last) last = now;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    S.mouseSpeed = S.mouseT.distanceTo(S.mousePrev);
    S.mousePrev.copy(S.mouseT);
    updateHomeCamera();
    if (!reduce) stepPhysics();
    updateWorks(dt);
    // When the camera pulls back in About the carousel below shows, so place it only when the camera tilts toward Work
    worksOuter.visible = S.camT > 0.001;
    updateService(dt);
    applyCamera();
    if (S.ns === "home" && !S.portalLocked) Object.assign(S.portal, syncPortal());
    pushPortal();
    comp.uniforms.uRawAll.value = S.mode;

    scene.background = rawBg;
    renderer.shadowMap.needsUpdate = true;
    renderer.setRenderTarget(rawRT);
    renderer.render(scene, camera);
    if (S.mode < 0.5) {
      scene.background = null;
      scene.overrideMaterial = normalMat;
      gridWall.visible = gridFloor.visible = false;
      renderer.setClearColor(0x8080ff, 1);
      renderer.setRenderTarget(normRT);
      renderer.clear();
      renderer.render(scene, camera);
      scene.overrideMaterial = null;
      gridWall.visible = gridFloor.visible = true;
    }
    renderer.setRenderTarget(null);
    renderer.render(compScene, compCam);
  }

  /* About service model — when a cell becomes active its model grows 0→1 (damping 8.5) and spins automatically at 0.28rad/s, drag to rotate it */
  function updateService(dt) {
    const sv = S.service;
    serviceRoot.visible = S.ns === "about" && sv.rect !== null;
    if (!serviceRoot.visible) return;
    const r = sv.rect();
    const dist = 12;
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    const vw = vh * camera.aspect;
    const cx = ((r.left + r.width / 2) / innerWidth - 0.5) * vw;
    const cy = -((r.top + r.height / 2) / innerHeight - 0.5) * vh;
    const fitH = (r.height / innerHeight) * vh;
    if (!sv.drag && !reduce) sv.yaw += 0.28 * dt;
    sv.models.forEach((m, i) => {
      const on = i === sv.index;
      m.userData.reveal += ((on ? 1 : 0) - m.userData.reveal) * (1 - Math.exp(-8.5 * dt));
      m.position.set(cx, cy, -dist);
      m.scale.setScalar(Math.max(0.0001, m.userData.reveal * fitH * 0.3 * [0.82, 0.82, 0.72, 0.84][i]));
      m.rotation.set(sv.pitch, sv.yaw, 0);
      m.visible = m.userData.reveal > 0.002;
    });
  }

  /* ---------------- Loader — 000→96 closes 2.5% of the remaining distance every 0.1s (min 0.08), 98→100 once ready, holds 0.18s, then folds 0.9s and fades out 0.42s ---------------- */
  const loader = document.querySelector("[data-px-loader]");
  const digits = loader ? [...loader.querySelectorAll("[data-px-digit]")] : [];
  let shown = 0;
  function setProgress(v) {
    shown = Math.max(shown, clamp(v, 0, 100));
    const s = String(Math.round(shown)).padStart(3, "0");
    digits.forEach((d, i) => (d.textContent = s[i]));
    loader?.setAttribute("aria-label", s);
  }
  function runLoader(readyAt) {
    if (!loader) return Promise.resolve();
    html.classList.add("is-loading");
    setProgress(0);
    const timer = setInterval(() => { if (shown < 96) setProgress(Math.min(96, shown + Math.max(0.08, (96 - shown) * 0.025))); }, 100);
    // In the original, numbers jump as 4 items and work photos are received — here there is nothing to receive, so the steps go up at the same tempo
    const steps = [0.18, 0.31, 0.43, 0.56, 0.68, 0.79, 0.88].map((f, i) => setTimeout(() => setProgress(f * 96), readyAt * (i + 1) / 8));
    return new Promise((res) => setTimeout(async () => {
      clearInterval(timer);
      steps.forEach(clearTimeout);
      setProgress(98);
      await new Promise((r) => requestAnimationFrame(r));
      setProgress(100);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 180));
      const b = portalEl && S.ns === "home" ? portalBase() : { w: Math.min(520, innerWidth * 0.56), h: Math.min(520, innerWidth * 0.56) / 1.55, r: 30 };
      loader.style.setProperty("--px-loader-w", `${b.w}px`);
      loader.style.setProperty("--px-loader-h", `${b.h}px`);
      loader.style.setProperty("--px-loader-r", `${b.r}px`);
      html.classList.add("is-loader-collapsing");
      requestAnimationFrame(() => {
        loader.classList.add("is-collapsing");
        setTimeout(() => {
          loader.classList.add("is-fading");
          setTimeout(() => { html.classList.remove("is-loading", "is-loader-collapsing"); res(); }, 420);
        }, 900);
      });
    }, readyAt));
  }

  /* ---------------- Page mode ---------------- */
  function setScenePage(ns) {
    S.ns = ns;
    S.mode = ns === "about" || ns === "works" ? 1 : 0;
    if (ns === "works") S.camT = S.camTarget = 1;
    if (ns === "about" || ns === "contact") S.camT = S.camTarget = 0;
    if (ns !== "about") { S.aboutBack = 0; setGravity(false); S.service.rect = null; S.service.index = -1; }
    if (ns === "contact") Object.assign(S.portal, zeroRect());
    if (ns === "about" || ns === "works") Object.assign(S.portal, fullRect());
    gridWall.visible = true;
  }

  /* ---------------- Transition ---------------- */
  let navigating = false;
  function fadeOut(container, dur = 0.3) {
    if (!container) return Promise.resolve();
    container.style.pointerEvents = "none";
    return new Promise((r) => gsap.to(container, { autoAlpha: 0, duration: reduce ? 0 : dur, ease: "power2.out", overwrite: true, onComplete: r }));
  }
  function tweenCam(to, dur) {
    return new Promise((res) => {
      if (reduce) { S.camT = S.camTarget = to; return res(); }
      const from = S.camT, o = { t: 0 };
      gsap.to(o, { t: 1, duration: dur, ease: "none", onUpdate: () => (S.camT = S.camTarget = from + (to - from) * worksAboutEase(o.t)), onComplete: res });
    });
  }
  async function sceneOut(from, to) {
    const container = document.querySelector('[data-barba="container"]');
    S.portalLocked = true;
    if (to === "contact") {
      motionBlur(0.9, 0, -0.55, 0.45);
      await Promise.all([tweenPortal(zeroRect(), 0.9, "power3.inOut").then(() => (S.mode = 0)), fadeOut(container)]);
      S.mode = 0;
    } else if (from === "contact") {
      Object.assign(S.portal, zeroRect());
      motionBlur(0.9, 0, 0.55, 0.45);
      await Promise.all([tweenPortal(to === "home" ? (S.portalLocked = false, syncPortal()) : fullRect(), 0.9, "power3.inOut"), fadeOut(container)]);
    } else if (from === "home") {
      html.classList.add(to === "works" ? "is-opening-works" : "is-opening-about");
      gsap.to(S, { portalScale: 1, duration: 0.5, ease: "power3.inOut" });
      motionBlur(1.15, to === "works" ? 0.2 : 0.12, to === "works" ? 1 : 0.7, to === "works" ? 1 : 0.72);
      await Promise.all([tweenPortal(fullRect(), 1.15, "power4.inOut"), fadeOut(container)]);
      S.mode = 1;
    } else if ((from === "about" && to === "works") || (from === "works" && to === "about")) {
      S.aboutBack = 0;
      setGravity(false);
      motionBlur(1.55, to === "works" ? 0.18 : -0.18, to === "works" ? 1 : -1, 1);
      await Promise.all([tweenCam(to === "works" ? 1 : 0, 1.55), fadeOut(container)]);
    } else if (to === "home") {
      await fadeOut(container);
    }
  }
  async function sceneIn(from, to) {
    // When returning home, the raw full-screen piece shrinks to window size (1.15s power4.inOut)
    if (to === "home" && (from === "about" || from === "works")) {
      S.mode = 0;
      S.camT = S.camTarget = from === "works" ? 1 : 0;
      if (from === "works") scrollTo(0, innerHeight);
      Object.assign(S.portal, fullRect());
      S.portalLocked = true;
      html.classList.add("is-returning-home");
      const target = (() => { S.portalLocked = false; const t = syncPortal(); S.portalLocked = true; return t; })();
      motionBlur(1.15, from === "works" ? -0.2 : -0.12, from === "works" ? -1 : -0.7, from === "works" ? 1 : 0.72);
      await tweenPortal(target, 1.15, "power4.inOut");
      html.classList.remove("is-returning-home");
    }
    if (to === "home" && from === "contact") S.mode = 0;
    S.portalLocked = false;
    html.classList.remove("is-opening-about", "is-opening-works");
  }

  let pageCleanup = null;
  function activate(container, from) {
    const ns = container.dataset.barbaNamespace;
    html.classList.remove("is-page-home", "is-page-about", "is-page-works", "is-page-contact", "is-home-works");
    html.classList.add(`is-page-${ns}`);
    homeWorks = false;
    portalLabel?.classList.remove("is-works");
    syncNav(ns);
    setScenePage(ns);
    if (from === "home" && (ns === "about" || ns === "works")) Object.assign(S.portal, fullRect());
    bindHit(container.querySelector("[data-px-hit]"));
    pageCleanup = PX.pages?.[ns]?.(container, { S, setGravity, panels, centerPanel, W, go, motionBlur }) || null;
    initReveal(container);
    ScrollTrigger.refresh();
  }
  function deactivate() {
    killReveal();
    if (typeof pageCleanup === "function") pageCleanup();
    pageCleanup = null;
    bindHit(null);
  }

  const useBarba = !!window.barba && /^https?:$/.test(location.protocol);
  async function go(href) {
    const to = nsOfHref(href);
    const from = S.ns;
    if (!to || navigating || to === from) return;
    navigating = true;
    setMenu(false);
    await sceneOut(from, to);
    if (useBarba) {
      PX._from = from;
      await barba.go(new URL(href, location.href).href);
    } else {
      sessionStorage.setItem("px-nav", JSON.stringify({ from, to, at: Date.now() }));
      location.href = href;
    }
    navigating = false;
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || a.hasAttribute("data-px-native")) return;
    const to = nsOfHref(a.href);
    if (!to || a.href.startsWith("mailto:") || a.href.startsWith("tel:")) return;
    e.preventDefault();
    e.stopPropagation();
    if (to !== S.ns) go(a.href);
    else setMenu(false);
  }, true);

  // Preload the other page’s css at transition time — barba is <head> Does not change
  function pullStyles(nextHtml) {
    const doc = new DOMParser().parseFromString(nextHtml, "text/html");
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      const href = new URL(l.getAttribute("href"), location.href).href;
      if (![...document.querySelectorAll('link[rel="stylesheet"]')].some((m) => m.href === href)) {
        const n = document.createElement("link");
        n.rel = "stylesheet";
        n.href = href;
        document.head.appendChild(n);
      }
    });
  }

  /* ---------------- Start ---------------- */
  resize();
  const first = document.querySelector('[data-barba="container"]');
  let arrived = null;
  try { arrived = JSON.parse(sessionStorage.getItem("px-nav") || "null"); } catch (_) {}
  sessionStorage.removeItem("px-nav");
  if (arrived && (Date.now() - arrived.at > 8000 || arrived.to !== first.dataset.barbaNamespace)) arrived = null;
  activate(first, arrived?.from);
  if (arrived?.from === "home" && (S.ns === "about" || S.ns === "works")) Object.assign(S.portal, fullRect());
  requestAnimationFrame(frame);
  if (arrived) {
    html.classList.remove("is-loading");
    sceneIn(arrived.from, S.ns);
  } else if (!reduce) {
    S.portalLocked = S.ns === "home";
    runLoader(2600).then(() => { S.portalLocked = false; });
  }
  if (S.ns === "home") syncPortal(true);

  if (useBarba) {
    barba.init({
      prevent: () => true,
      transitions: [{
        sync: false,
        beforeEnter: ({ next }) => pullStyles(next.html),
        leave: () => deactivate(),
        enter: ({ next }) => {
          scrollTo(0, 0);
          activate(next.container, PX._from);
          return sceneIn(PX._from, next.namespace);
        },
      }],
    });
  }
  PX.stage = { S, go, themeColor, motionBlur };
})();
