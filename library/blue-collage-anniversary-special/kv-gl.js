// Draws the brand-anniversary KV photo panel in WebGL (three r184) — the original also paints the photo panel with a three shader.
// Each panel is covered and filled with a photo (cover), turned grayscale, then overlaid with the accent color using screen so it looks solid blue, and the panel under the mouse and the first panel that grows on scroll return to the original color.
// Original values: photo zoom 1 → 1.2 over 6.5s (restarting each time the panel changes) · the original-color panel drifts horizontally 10% of the panel width over 4s · color change .25s linear.
// Board position and size follow the DOM grid (.ft-kv__cell) measured every frame — the 2×2 ↔ 4×2 swap and the first board’s scrub zoom become the WebGL board as they are.
(() => {
  const kv = document.querySelector(".ft-kv");
  const stage = kv?.querySelector(".ft-kv__stage");
  if (!kv || !stage || !window.THREE) return;
  const T = window.THREE;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
  if (!renderer.getContext()) return;
  renderer.outputColorSpace = T.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.className = "ft-kv__gl";
  canvas.setAttribute("aria-hidden", "true");
  stage.querySelector(".ft-kv__grid").after(canvas);
  kv.classList.add("is-gl");

  const css = getComputedStyle(document.documentElement);
  const tone = (name) => { const c = new T.Color(); c.setStyle(css.getPropertyValue(name).trim(), T.LinearSRGBColorSpace); return c; };
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(0, 1, 0, 1, -10, 10);

  const VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  // All shader calculations use sRGB values as they are — only brightness is measured linearly, then converted back to sRGB and overlaid with screen
  const FRAG = `
    uniform sampler2D uMap;
    uniform vec2 uCover;
    uniform float uZoom;
    uniform float uPan;
    uniform float uColor;
    uniform vec3 uScreen;
    varying vec2 vUv;
    vec3 decode(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
    vec3 encode(vec3 c) { return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
    void main() {
      vec2 uv = (vUv - 0.5) * uCover / uZoom + 0.5;
      uv.x += uPan * uCover.x;
      vec4 t = texture2D(uMap, clamp(uv, 0.0, 1.0));
      vec3 photo = mix(vec3(1.0), t.rgb, t.a);
      float luma = dot(decode(photo), vec3(0.2126, 0.7152, 0.0722));
      vec3 mono = encode(vec3(luma));
      vec3 blue = 1.0 - (1.0 - mono) * (1.0 - uScreen);
      gl_FragColor = vec4(mix(blue, photo, uColor), 1.0);
    }`;

  // Placeholder photo — the one person described by the panel label, drawn with simple shapes, original colors come from the skin variables
  const paint = (label, k) => {
    const c = document.createElement("canvas");
    c.width = 640; c.height = 480;
    const g = c.getContext("2d");
    const v = (n) => css.getPropertyValue(n).trim();
    const sky = g.createLinearGradient(0, 0, 0, 480);
    sky.addColorStop(0, v("--kf-ink-soft")); sky.addColorStop(1, v("--kf-dim"));
    g.fillStyle = sky; g.fillRect(0, 0, 640, 480);
    g.globalAlpha = 0.35; g.fillStyle = v("--site-cyan"); g.fillRect(0, 300 + (k % 3) * 20, 640, 180); g.globalAlpha = 1;
    const x = 220 + ((k * 97) % 200);
    g.fillStyle = v("--site-red");
    g.beginPath(); g.ellipse(x, 420, 150, 150, 0, Math.PI, 0); g.fill();
    g.fillStyle = v("--site-pink");
    g.beginPath(); g.arc(x, 200, 72, 0, Math.PI * 2); g.fill();
    g.fillStyle = v("--kf-ink");
    g.beginPath(); g.ellipse(x, 160, 78, 44, 0, Math.PI, 0); g.fill();
    g.font = `500 22px ${v("--kf-font-sans")}`;
    g.fillStyle = v("--kf-ink");
    g.fillText(label.slice(0, 28), 24, 452);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.NoColorSpace;
    tex.minFilter = T.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  };

  const screen = tone("--kf-accent");
  const panels = [...kv.querySelectorAll(".ft-kv__cell")].map((cell, k) => {
    const label = cell.querySelector(".ft-kv__color")?.dataset.label || cell.querySelector(".wf-img")?.dataset.label || "Photo";
    const mat = new T.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false, side: T.DoubleSide,
      uniforms: { uMap: { value: paint(label, k) }, uCover: { value: new T.Vector2(1, 1) }, uZoom: { value: 1 }, uPan: { value: 0 }, uColor: { value: 0 }, uScreen: { value: screen } },
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
    mesh.renderOrder = k === 0 ? 2 : 1;
    scene.add(mesh);
    return { cell, color: cell.querySelector(".ft-kv__color"), mesh, mat, hot: 0, hotAt: 0 };
  });

  let W = 0, H = 0;
  const resize = () => {
    W = stage.clientWidth; H = stage.clientHeight;
    renderer.setSize(W, H, false);
    camera.right = W; camera.bottom = H; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  // Recount the photo zoom from when the panel changed (2×2 ↔ 4×2)
  const grid = kv.querySelector(".ft-kv__grid");
  let zoomFrom = performance.now();
  new MutationObserver(() => (zoomFrom = performance.now())).observe(grid, { attributes: true, attributeFilter: ["class"] });

  let visible = true, last = performance.now();
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min(now - last, 100);
    last = now;
    if (!visible || !W) return;
    const s = stage.getBoundingClientRect();
    const zoom = reduced ? 1 : 1 + 0.2 * Math.min((now - zoomFrom) / 6500, 1);
    for (const p of panels) {
      const r = p.cell.getBoundingClientRect();
      const shown = r.width > 1 && r.height > 1 && getComputedStyle(p.cell).display !== "none" && !p.cell.classList.contains("is-wait");
      p.mesh.visible = shown;
      if (!shown) continue;
      p.mesh.position.set(r.left - s.left + r.width / 2, r.top - s.top + r.height / 2, 0);
      p.mesh.scale.set(r.width, -r.height, 1);
      const pa = r.width / r.height, ta = 640 / 480;
      p.mat.uniforms.uCover.value.set(pa > ta ? 1 : pa / ta, pa > ta ? ta / pa : 1);
      p.mat.uniforms.uZoom.value = zoom;
      // Under the mouse (is-hot) it returns to the original color in .25s, and also takes the first panel’s color layer opacity raised by the scroll scrub
      const want = p.cell.classList.contains("is-hot") || Number(kv.dataset.hot) === panels.indexOf(p) ? 1 : 0;
      if (want && !p.hot) p.hotAt = now;
      p.hot = want;
      const cur = p.mat.uniforms.uColor.value, step = dt / 250;
      const hover = want ? Math.min(cur + step, 1) : Math.max(cur - step, 0);
      const scrub = p.color ? Number(getComputedStyle(p.color).opacity) || 0 : 0;
      p.mat.uniforms.uColor.value = Math.max(hover, p.cell === panels[0].cell ? scrub : 0);
      p.mat.uniforms.uPan.value = reduced ? 0 : 0.1 * (1 - 2 * Math.min((now - p.hotAt) / 4000, 1)) * (p.hot ? 1 : 0);
    }
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
})();
