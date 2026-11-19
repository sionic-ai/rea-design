// 3D bottle pinned to the window — keeps the original’s scene structure and values (three r178 plus three model files), and only the bottle was newly carved with our own surface of revolution.
// Scroll effects are built by index.js moving the values in window.sdBottle.state with GSAP (the original does the same: one value object shared by several ScrollTriggers).
(() => {
  const host = document.getElementById("canvas");
  if (!host || !window.THREE) return;
  const canvas = host.querySelector("canvas");
  const T = window.THREE;

  // The value object is built first by index.js and the scroll motion is hooked on (original default: starts at fadedZ −10 and goes to 0 in the About section)
  const state = window.sdBottle && window.sdBottle.state;
  if (!state) return;
  const SPIN = 1.8; // Radians per second — the bottle always spins on its own axis

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 1, 100);

  // Reads color from skin — relative colors (oklch from …) too are painted once on a canvas from the value the browser resolved and received as rgb
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssColor = (name) => {
    probe.style.color = `var(${name})`;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };

  // Reflection backdrop — white at the top, background color at the bottom. The metallic gloss of the original model material comes alive with this light
  const envScene = new T.Scene();
  const sky = new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ side: T.BackSide, vertexColors: true }));
  envScene.add(sky);
  const softbox = new T.Mesh(new T.PlaneGeometry(14, 6), new T.MeshBasicMaterial());
  softbox.position.set(-6, 9, 8);
  softbox.lookAt(0, 0, 0);
  envScene.add(softbox);
  const pmrem = new T.PMREMGenerator(renderer);
  const paintEnv = () => {
    const top = cssColor("--kf-contrast-bg");
    const low = cssColor("--kf-bg");
    const pos = sky.geometry.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      c.copy(low).lerp(top, T.MathUtils.smoothstep(pos.getY(i), -12, 14));
      cols.set([c.r, c.g, c.b], i * 3);
    }
    sky.geometry.setAttribute("color", new T.BufferAttribute(cols, 3));
    softbox.material.color.copy(top).multiplyScalar(2.2);
    if (scene.environment) scene.environment.dispose();
    scene.environment = pmrem.fromScene(envScene, 0.035).texture;
  };

  // Original lighting: ambient 1, directional light 15 from the front (0,0,1)
  scene.add(new T.AmbientLight(undefined, 1));
  const sun = new T.DirectionalLight(undefined, 15);
  sun.position.set(0, 0, 1);
  scene.add(sun);

  // Bottle — a surface of revolution cut from ratios measured on the original screen (length 707px, diameter 230px at 1440 width, model scale .28). Unit 1. = Screen 100px
  const v2 = (pts) => pts.map(([r, y]) => new T.Vector2(r, y));
  const bodyGeo = new T.LatheGeometry(v2([[0, -12.6], [3.55, -12.6], [3.95, -12.45], [4.1, -12.05], [4.1, 1.6], [4.02, 2.8], [3.7, 4.0], [3.1, 5.1], [2.4, 6.0], [2.0, 6.6], [1.92, 7.5]]), 72);
  const capGeo = new T.LatheGeometry(v2([[0, 7.1], [2.3, 7.1], [2.62, 7.35], [2.64, 9.9], [2.5, 10.25], [2.28, 10.45], [2.22, 12.2], [2.0, 12.6], [0, 12.6]]), 48);
  const ribGeo = new T.CylinderGeometry(2.66, 2.66, 2.3, 24, 1, true);
  const labelGeo = new T.CylinderGeometry(4.118, 4.118, 11.4, 72, 1, true, -1.55, 3.1);

  // Label: the original’s two big white lines plus a small text strip, in the same layout. The font is the Skin’s narrow type
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1024;
  labelCanvas.height = 900;
  const labelTex = new T.CanvasTexture(labelCanvas);
  labelTex.colorSpace = T.SRGBColorSpace;
  labelTex.anisotropy = 4;
  const paintLabel = () => {
    const ctx = labelCanvas.getContext("2d");
    const W = labelCanvas.width, H = labelCanvas.height;
    const root = getComputedStyle(document.documentElement);
    const fam = (root.getPropertyValue("--kf-font-cond") || root.getPropertyValue("--kf-font-display")).trim();
    ctx.clearRect(0, 0, W, H);
    probe.style.color = "var(--kf-contrast-bg)";
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.save();
    ctx.translate(W * 0.5, H * 0.5);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${Math.round(H * 0.34)}px ${fam}`;
    ctx.fillText("LOGO", -H * 0.42, -W * 0.02);
    ctx.fillText("HERE", -H * 0.42, W * 0.27);
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 4; i++) ctx.fillRect(-H * 0.42, W * 0.33 + i * 22, H * (0.5 - i * 0.06), 7);
    ctx.restore();
    labelTex.needsUpdate = true;
  };

  const tilt = new T.Group();
  tilt.rotation.set(-Math.PI / 8, 0, -Math.PI / 9);
  const outer = new T.Group(); // Original i — screen width ratio, position, rx
  const spin = new T.Group(); // Original r — spin on its own axis, one full turn forward (innerRx)
  const model = new T.Group(); // Original l — model scale and laying down (orientation)
  outer.add(tilt);
  tilt.add(spin);
  spin.add(model);
  scene.add(outer);

  // The original also multiplied model material color per bottle to darken it (.5·.9·.3) — here a multiplier with the same role is applied to the skin color
  const VARIANTS = { ps: ["--site-v1-ink", 0.9], sf: ["--site-v2-ink", 1], ff: ["--site-v3-to", 0.75] };
  const bottles = {};
  const labelMat = new T.MeshStandardMaterial({ map: labelTex, transparent: true, roughness: 0.4, metalness: 0, depthWrite: false });
  Object.keys(VARIANTS).forEach((key) => {
    const g = new T.Group();
    const bodyMat = new T.MeshStandardMaterial({ metalness: 0.86, roughness: 0.27, envMapIntensity: 1 });
    const capMat = new T.MeshPhysicalMaterial({ metalness: 0, roughness: 0.32, transparent: true, opacity: 0.72, clearcoat: 0.6 });
    g.add(new T.Mesh(bodyGeo, bodyMat), new T.Mesh(labelGeo, labelMat), new T.Mesh(capGeo, capMat), new T.Mesh(ribGeo, capMat));
    g.children[3].position.y = 8.7;
    g.name = key;
    g.userData = { bodyMat, capMat, color: VARIANTS[key] };
    bottles[key] = g;
    model.add(g);
  });
  const paintBottles = () => {
    const white = cssColor("--kf-contrast-bg");
    Object.values(bottles).forEach(({ userData: u }) => {
      const c = cssColor(u.color[0]);
      u.bodyMat.color.copy(c).multiplyScalar(u.color[1]);
      u.capMat.color.copy(white).lerp(c, 0.22);
    });
  };

  const paint = () => { paintEnv(); paintBottles(); paintLabel(); };

  let w = 0, h = 0;
  const size = () => {
    w = host.clientWidth;
    h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  size();
  addEventListener("resize", size);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new T.Clock();
  const frame = () => {
    const md = innerWidth >= 769;
    const base = md ? 1440 : 375;
    const M = w / base;
    const A = md ? state.mdScale : state.smScale;
    camera.position.z = h / 2 / Math.tan((15 * Math.PI) / 180) / 100;
    model.scale.setScalar((md ? 0.28 : 0.18) * A);
    model.rotation.z = (Math.PI / 8) * state.orientation;
    spin.rotation.y = -(reduce ? 0 : clock.getElapsedTime() * SPIN) - state.rotation;
    spin.rotation.x = state.innerRx;
    outer.scale.setScalar(M);
    const step = md ? 10 : 5;
    const E = md ? -w / 320 : w / 200;
    const Tz = md ? h / 200 - 1 * M : h / 200 - 2.2 * M;
    outer.position.set(state.x * step * M + E * state.footer, state.y * step * M - Tz * state.footer, state.z + state.fadedZ);
    outer.rotation.set(state.rx, state.ry, state.rz);
    Object.entries(bottles).forEach(([k, g]) => { g.visible = state.bottle === k; });
    renderer.render(scene, camera);
  };
  // Baking reflection panels and building shaders take one long frame — index.js loads this file after the loader ends (or on reaching the About section) and calls start
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    paint();
    if (document.fonts) document.fonts.ready.then(paintLabel);
    // Builds shaders in parallel first and then runs them (KHR_parallel_shader_compile) — the two hidden bottles must be built too, or swapping them in on the product section would stall
    const groups = Object.values(bottles);
    groups.forEach((g) => { g.visible = true; });
    const go = () => { groups.forEach((g) => { g.visible = state.bottle === g.name; }); renderer.setAnimationLoop(frame); };
    if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(go, go); else go();
  };

  Object.assign(window.sdBottle, { start, repaint: paint });
})();
