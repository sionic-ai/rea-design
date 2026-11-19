// Shared GL built with three and cannon-es — shader grid, footer hologram strip, rotating 3D figure, squishy rabbit physics world.
// The original shader and model are not ported, rewritten from scratch with the same values (noise .05 time · .075 amplitude · stronger toward the center, rotation .01/frame, gravity -3000 · push 4e5).
// Colors are resolved from the skin (--kf-*, --site-*) through a 1×1 canvas and re-read when the theme changes (ic:theme).
(() => {
  const IC = (window.IC = window.IC || {});
  const T = window.THREE;
  const sp = () => matchMedia("(max-width: 768px)").matches;

  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  let probe = null;
  IC.rgb = (name) => {
    if (!probe) { probe = document.createElement("i"); probe.style.display = "none"; document.body.append(probe); }
    probe.style.color = `var(${name})`;
    swatch.clearRect(0, 0, 1, 1);
    swatch.fillStyle = getComputedStyle(probe).color;
    swatch.fillRect(0, 0, 1, 1);
    const d = swatch.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const srgb = (name) => new T.Color().setRGB(...IC.rgb(name), T.SRGBColorSpace);

  // Cell size: like the original, (screen width − 2 outer margins) ÷ column count, divided into cells of about 40px
  IC.cell = 38.9;
  const measureCell = () => {
    const cs = getComputedStyle(document.documentElement);
    const cols = parseInt(cs.getPropertyValue("--ic-cols")) || 12;
    const pad = parseFloat(cs.getPropertyValue("--ic-pad-out")) || 20;
    const col = (innerWidth - pad * 2) / cols;
    IC.cell = col / (Math.floor(col / 40) + 1);
    document.documentElement.style.setProperty("--ic-cell", `${IC.cell}px`);
  };
  measureCell();
  addEventListener("resize", measureCell);

  const FULL_VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  IC.FULL_VS = FULL_VS;

  // Single canvas = One renderer. Draws only when visible, and re-measures when the wrapper size changes
  IC.glCanvas = (wrap, { alpha = true } = {}) => {
    const canvas = wrap.querySelector("canvas") || wrap.appendChild(document.createElement("canvas"));
    const renderer = new T.WebGLRenderer({ canvas, alpha, antialias: true, premultipliedAlpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const size = { width: wrap.clientWidth || 1, height: wrap.clientHeight || 1 };
    renderer.setSize(size.width, size.height, false);
    const api = { renderer, size, visible: true, onResize: null };
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth || 1, h = wrap.clientHeight || 1;
      if (w === size.width && h === size.height) return;
      size.width = w; size.height = h;
      renderer.setSize(w, h, false);
      api.onResize?.(size);
    });
    ro.observe(wrap);
    const io = new IntersectionObserver((es) => es.forEach((e) => (api.visible = e.isIntersecting)));
    io.observe(wrap);
    api.dispose = () => { ro.disconnect(); io.disconnect(); renderer.dispose(); renderer.forceContextLoss(); };
    return api;
  };
  IC.orthoCamera = (size) => {
    const cam = new T.OrthographicCamera(-size.width / 2, size.width / 2, size.height / 2, -size.height / 2, 0.1, 1000);
    cam.position.set(0, 0, 500);
    cam.setSize = (s) => { cam.left = -s.width / 2; cam.right = s.width / 2; cam.top = s.height / 2; cam.bottom = -s.height / 2; cam.updateProjectionMatrix(); };
    return cam;
  };

  // ───── Shader grid ─────
  const GRID_FS = `
precision highp float;
uniform vec2 uRes; uniform vec2 uCount; uniform float uTime; uniform float uSeed;
uniform vec3 uInk; uniform float uPx; uniform bool uOutline;
varying vec2 vUv;
vec2 grad(vec2 p){ p = vec2(dot(p, vec2(41.3, 289.1)), dot(p, vec2(171.7, 83.9))); return fract(sin(p) * 15731.743) * 2.0 - 1.0; }
float wave(vec2 p){
  vec2 c = floor(p), f = fract(p), s = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad(c), f), b = dot(grad(c + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float d = dot(grad(c + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), e = dot(grad(c + vec2(1.0)), f - vec2(1.0));
  return mix(mix(a, b, s.x), mix(d, e, s.x), s.y) * 1.6;
}
float softMin(float a, float b){ return -log(exp(-20.0 * a) + exp(-20.0 * b)) / 20.0; }
void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float toCenter = clamp(softMin(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)) / 0.5, 0.0, 1.0);
  if (uOutline) {
    float edge = softMin(min(uv.x * aspect, aspect - uv.x * aspect), min(uv.y, 1.0 - uv.y));
    toCenter *= smoothstep(0.02, 0.12, edge);
  }
  uv += wave(uv * 2.0 + uTime * 0.05 + uSeed) * 0.075 * toCenter;
  float trim = uOutline ? 1.0 : 0.0;
  vec2 g = uv * uCount - trim;
  vec2 live = uCount - 2.0 * trim;
  vec2 aa = fwidth(g) * uPx;
  if (uOutline && (g.x < -aa.x || g.x > live.x + aa.x || g.y < -aa.y || g.y > live.y + aa.y)) { gl_FragColor = vec4(0.0); return; }
  vec2 d = abs(fract(g - 0.5) - 0.5);
  float lx = 1.0 - smoothstep(0.0, aa.x, d.x);
  float ly = 1.0 - smoothstep(0.0, aa.y, d.y);
  bool outX = uOutline && (g.x < 0.0 || g.x > live.x), outY = uOutline && (g.y < 0.0 || g.y > live.y);
  if (outY) lx = 0.0;
  if (outX) ly = 0.0;
  if (!uOutline) { if (vUv.x < 0.01 || vUv.x > 0.99) lx = 0.0; if (vUv.y < 0.01 || vUv.y > 0.99) ly = 0.0; }
  float line = max(lx, ly);
  gl_FragColor = vec4(uInk * line, line);
}`;
  IC.grid = (wrap, { outline = false } = {}) => {
    const gl = IC.glCanvas(wrap);
    const scene = new T.Scene(), cam = new T.Camera();
    const u = {
      uRes: { value: new T.Vector2(1, 1) }, uCount: { value: new T.Vector2(1, 1) }, uTime: { value: 0 },
      uSeed: { value: Math.random() * 30 }, uInk: { value: new T.Vector3(...IC.rgb("--kf-line")) },
      uPx: { value: 0.75 }, uOutline: { value: outline },
    };
    const mat = new T.ShaderMaterial({ uniforms: u, vertexShader: FULL_VS, fragmentShader: GRID_FS, transparent: true, depthTest: false, depthWrite: false });
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    const fit = (s) => { u.uRes.value.set(s.width, s.height); u.uCount.value.set(Math.max(1, Math.round(s.width / IC.cell)), Math.max(1, Math.round(s.height / IC.cell))); };
    fit(gl.size); gl.onResize = fit;
    const recolor = () => { u.uInk.value.set(...IC.rgb("--kf-line")); fit(gl.size); };
    const tick = () => { if (!gl.visible) return; u.uTime.value = performance.now() * 0.001; gl.renderer.render(scene, cam); };
    gsap.ticker.add(tick);
    addEventListener("ic:theme", recolor);
    addEventListener("resize", recolor);
    return () => { gsap.ticker.remove(tick); removeEventListener("ic:theme", recolor); removeEventListener("resize", recolor); mat.dispose(); gl.dispose(); };
  };

  // ───── Footer hologram band — blends three colors with two folds of noise (domain warping) and adds a metallic sheen ─────
  const HOLO_FS = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec2 uScale;
varying vec2 vUv;
float ripple(vec2 p){ return cos(p.x) * sin(p.y); }
float layered(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * ripple(p); p *= 2.0; a *= 0.5; } return v; }
void main(){
  float aspect = uRes.x / uRes.y;
  vec2 st = (vUv - 0.5) * vec2(min(aspect, 1.0), min(1.0 / aspect, 1.0)) + 0.5;
  st = (st + vec2(0.1, 2.0)) * uScale;
  vec2 q = vec2(layered(st + 0.2), layered(st + 0.1));
  vec2 r = vec2(layered(st + 6.0 * q + 0.1 * uTime), layered(st + 6.0 * q + 0.12 * uTime));
  vec3 col = mix(uC1, uC2, clamp(length(q), 0.0, 1.0));
  col = mix(col, uC3, clamp(length(r), 0.0, 1.0));
  float k = layered(st + 8.0 * r);
  k = 0.7 + 0.3 * (k * k + k * k * k + k * k * k * k);
  col *= k;
  col = mix(col, vec3(2.4 * k * k * k), 0.7);
  col *= col * 1.7;
  gl_FragColor = vec4(col, 1.0);
}`;
  IC.holo = (wrap) => {
    const gl = IC.glCanvas(wrap, { alpha: false });
    const scene = new T.Scene(), cam = new T.Camera();
    const scale = () => (sp() ? new T.Vector2(2.8 * 0.4, 1.5 * 0.3) : new T.Vector2(2.8, 1.5));
    const u = {
      uRes: { value: new T.Vector2(gl.size.width, gl.size.height) }, uTime: { value: 0 }, uScale: { value: scale() },
      uC1: { value: new T.Vector3(...IC.rgb("--site-holo-1")) }, uC2: { value: new T.Vector3(...IC.rgb("--site-holo-2")) }, uC3: { value: new T.Vector3(...IC.rgb("--site-holo-3")) },
    };
    const mat = new T.ShaderMaterial({ uniforms: u, vertexShader: FULL_VS, fragmentShader: HOLO_FS, depthTest: false, depthWrite: false });
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    gl.onResize = (s) => { u.uRes.value.set(s.width, s.height); u.uScale.value = scale(); };
    const recolor = () => { u.uC1.value.set(...IC.rgb("--site-holo-1")); u.uC2.value.set(...IC.rgb("--site-holo-2")); u.uC3.value.set(...IC.rgb("--site-holo-3")); };
    const tick = () => { if (!gl.visible) return; u.uTime.value = performance.now() * 0.001; gl.renderer.render(scene, cam); };
    gsap.ticker.add(tick);
    addEventListener("ic:theme", recolor);
    return () => { gsap.ticker.remove(tick); removeEventListener("ic:theme", recolor); mat.dispose(); gl.dispose(); };
  };

  // ───── 3D character — basic shapes with the same silhouette proportions (twin tails, wide sleeves, short skirt, long boots), stepped shading + black outline ─────
  const TOON_VS = "varying vec3 vN; varying vec3 vP; void main(){ vN = normal; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const TOON_FS = `
uniform vec3 uColor; uniform vec3 uKey; uniform vec3 uFill; uniform vec3 uBack;
varying vec3 vN; varying vec3 vP;
float band(float x){ return x < 0.2 ? 0.25 : (x < 0.55 ? 0.6 : 1.0); }
void main(){
  vec3 n = normalize(vN);
  float l = band(max(dot(n, normalize(uKey - vP)), 0.0)) * 0.4 + band(max(dot(n, normalize(uFill - vP)), 0.0)) * 0.3 + band(max(dot(n, normalize(uBack - vP)), 0.0)) * 0.3;
  gl_FragColor = vec4(uColor * l * 0.9 + 0.25, 1.0);
}`;
  const toon = (color) => new T.ShaderMaterial({
    uniforms: { uColor: { value: color }, uKey: { value: new T.Vector3(500, 300, 500) }, uFill: { value: new T.Vector3(-500, 300, 500) }, uBack: { value: new T.Vector3(0, 300, -500) } },
    vertexShader: TOON_VS, fragmentShader: TOON_FS,
  });
  const buildFigure = (cols) => {
    const g = new T.Group();
    const parts = [];
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
      const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); g.add(m); parts.push(m); return m;
    };
    const skin = toon(cols.skin), cloth = toon(cols.cloth), hair = toon(cols.hair), boot = toon(cols.boot);
    add(new T.CylinderGeometry(0.55, 0.75, 7.2, 12), boot, -1.1, 3.6, 0);
    add(new T.CylinderGeometry(0.55, 0.75, 7.2, 12), boot, 1.1, 3.6, 0);
    add(new T.CylinderGeometry(1.5, 3.6, 3.2, 16), cloth, 0, 9.2, 0);
    add(new T.CapsuleGeometry(1.7, 3.4, 6, 14), cloth, 0, 12.6, 0, 0, 0, 0, 1, 1, 0.75);
    add(new T.CylinderGeometry(1.0, 2.4, 4.8, 12), cloth, -3.7, 13.4, 0, 0, 0, Math.PI / 2.3);
    add(new T.CylinderGeometry(1.0, 2.4, 4.8, 12), cloth, 3.7, 13.4, 0, 0, 0, -Math.PI / 2.3);
    add(new T.SphereGeometry(0.75, 12, 10), skin, 0, 15.6, 0);
    add(new T.SphereGeometry(2.3, 20, 16), skin, 0, 18.1, 0, 0, 0, 0, 1, 1.05, 1);
    add(new T.SphereGeometry(2.5, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), hair, 0, 18.4, -0.15);
    add(new T.CapsuleGeometry(0.9, 9.5, 6, 12), hair, -3.2, 13.8, -0.6, 0, 0, -0.12);
    add(new T.CapsuleGeometry(0.9, 9.5, 6, 12), hair, 3.2, 13.8, -0.6, 0, 0, 0.12);
    const ink = new T.MeshBasicMaterial({ color: cols.ink, side: T.BackSide });
    parts.forEach((m) => { const o = new T.Mesh(m.geometry, ink); o.position.copy(m.position); o.rotation.copy(m.rotation); o.scale.copy(m.scale).multiplyScalar(1.06); g.add(o); });
    // Like the original model, about 32 units tall and centered on the origin — at a scale of innerHeight×.026 it nearly fills the space above and below the footer
    g.scale.setScalar(1.52); g.position.y = -16;
    const outer = new T.Group(); outer.add(g);
    return { group: outer, mats: { skin, cloth, hair, boot, ink } };
  };
  IC.figure = (wrap) => {
    const gl = IC.glCanvas(wrap);
    const scene = new T.Scene(), cam = IC.orthoCamera(gl.size);
    const col = () => ({ skin: new T.Vector3(...IC.rgb("--kf-surface")), cloth: new T.Vector3(...IC.rgb("--site-figure")), hair: new T.Vector3(...IC.rgb("--site-hair")), boot: new T.Vector3(...IC.rgb("--site-figure")), ink: srgb("--kf-ink") });
    const fig = buildFigure(col());
    scene.add(fig.group);
    const place = () => { const s = sp() ? 18 : innerHeight * 0.026; fig.group.scale.setScalar(s); fig.group.position.set(0, -s, 0); };
    place();
    gl.onResize = (s) => { cam.setSize(s); place(); };
    const recolor = () => { const c = col(); ["skin", "cloth", "hair", "boot"].forEach((k) => fig.mats[k].uniforms.uColor.value.copy(c[k])); fig.mats.ink.color.copy(c.ink); };
    let last = performance.now();
    const tick = () => {
      const now = performance.now(), dt = Math.max(1, now - last); last = now;
      if (!gl.visible) return;
      fig.group.rotation.y += 0.01 * (dt / 1000) * 60;
      gl.renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    addEventListener("ic:theme", recolor);
    return () => { gsap.ticker.remove(tick); removeEventListener("ic:theme", recolor); gl.dispose(); };
  };

  // ───── Soft rabbit — a flat ball body with two long ears. Same width as the original model (about 140px on a 1440 screen at scale 1) ─────
  const rabbitTemplate = () => {
    const g = new T.Group();
    const mat = new T.MeshLambertMaterial();
    const body = new T.Mesh(new T.SphereGeometry(4.1, 28, 20), mat); body.scale.set(1, 0.82, 0.84); g.add(body);
    const ear = new T.CapsuleGeometry(1.0, 3.6, 6, 14);
    const e1 = new T.Mesh(ear, mat); e1.position.set(-1.65, 4.6, 0); e1.rotation.z = 0.32; g.add(e1);
    const e2 = new T.Mesh(ear, mat); e2.position.set(1.65, 4.6, 0); e2.rotation.z = -0.32; g.add(e2);
    const tail = new T.Mesh(new T.SphereGeometry(1.1, 12, 10), mat); tail.position.set(0, -1.3, -3.3); g.add(tail);
    return { g, mat };
  };
  IC.rabbitWorld = ({ size, gravity = false, scale = 1, ratios = [], mouse = true }) => {
    const C = window.CANNON;
    const scene = new T.Scene();
    scene.add(new T.AmbientLight(undefined, 1), new T.DirectionalLight(undefined, 2));
    scene.children[1].position.set(0.4, 1, 0.8);
    const camera = IC.orthoCamera(size);
    const world = new C.World({ gravity: new C.Vec3(0, gravity ? -3000 : 0, 0) });
    const tpl = rabbitTemplate();
    let group = null, bodies = [], walls = [], running = true, unit = 1;
    const modelSize = () => (sp() ? innerWidth * 0.026 : Math.max(innerWidth, 1280) * 0.0125);
    const build = (s) => {
      unit = modelSize() * scale;
      tpl.g.scale.setScalar(unit);
      const box = new T.Box3().setFromObject(tpl.g).getSize(new T.Vector3());
      group = new T.Group();
      ratios.forEach((r) => {
        const m = tpl.g.clone(); m.position.set(s.width * r.x, s.height * r.y, 0);
        const q = new C.Quaternion(Math.random(), Math.random(), Math.random(), Math.random()); q.normalize();
        const b = new C.Body({ mass: 10, shape: new C.Cylinder(box.z * 0.5, box.z * 0.5, box.y, 8), material: new C.Material({ restitution: 0.2 }), position: new C.Vec3(m.position.x, m.position.y, 0), quaternion: q });
        b.linearFactor.set(1, 1, 0);
        world.addBody(b); bodies.push(b); group.add(m);
      });
      scene.add(group);
    };
    const setWalls = (s) => {
      const spec = [[[Math.PI / 2, 0, 0], [0, gravity ? s.height * 4 : s.height / 2, 0]], [[-Math.PI / 2, 0, 0], [0, -s.height / 2, 0]], [[0, -Math.PI / 2, 0], [s.width / 2, 0, 0]], [[0, Math.PI / 2, 0], [-s.width / 2, 0, 0]]];
      spec.forEach(([rot, pos], i) => {
        if (!walls[i]) { walls[i] = new C.Body({ type: C.Body.STATIC, shape: new C.Plane(), material: new C.Material({ restitution: gravity ? 0.1 : 1 }) }); world.addBody(walls[i]); }
        walls[i].quaternion.setFromEuler(...rot); walls[i].position.set(...pos);
      });
    };
    const drop = () => { if (!group) return; scene.remove(group); bodies.forEach((b) => world.removeBody(b)); bodies = []; group = null; };
    build(size); setWalls(size);
    let hand = null;
    if (mouse && !IC.reduced) {
      hand = new C.Body({ type: C.Body.KINEMATIC, shape: new C.Sphere(1) });
      const ball = new C.Body({ mass: 5, shape: new C.Sphere(IC.isTouch() ? 100 : 80) });
      world.addBody(hand); world.addBody(ball);
      world.addConstraint(new C.PointToPointConstraint(hand, new C.Vec3(), ball, new C.Vec3()));
    }
    const step = () => {
      if (!running) return;
      world.fixedStep();
      if (hand) {
        const touchIdle = IC.isTouch() && !IC.mouse.touched;
        hand.collisionFilterMask = touchIdle ? 0 : -1;
        hand.isTrigger = touchIdle;
        hand.position.set(IC.mouse.x - innerWidth / 2, -(IC.mouse.y - innerHeight / 2), 0);
      }
      bodies.forEach((b, i) => { const m = group.children[i]; m.position.set(b.position.x, b.position.y, b.position.z); m.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w); });
    };
    gsap.ticker.add(step);
    let rebuild = 0;
    const api = {
      scene, camera,
      start: () => (running = true), stop: () => (running = false),
      hideNow: () => group?.children.forEach((m) => m.scale.setScalar(0)),
      appear: () => { if (!group) return; running = true; group.children.forEach((m) => gsap.to(m.scale, { x: unit, y: unit, z: unit, duration: 1, ease: "power3.out", overwrite: true })); },
      disappear: () => group?.children.forEach((m) => gsap.to(m.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power3.out", overwrite: true, onComplete: () => (running = false) })),
      push: () => { if (!group) return; const f = IC.isSp() ? 2e5 : 4e5; group.children.forEach((m, i) => bodies[i].applyForce(new C.Vec3(Math.sign(m.position.x) * f, Math.sign(m.position.y) * f, 0))); },
      resize: (s, after) => { camera.setSize(s); setWalls(s); clearTimeout(rebuild); rebuild = setTimeout(() => { drop(); build(s); after?.(); }, 500); },
      recolor: () => tpl.mat.color.copy(srgb("--kf-surface")),
      dispose: () => { gsap.ticker.remove(step); clearTimeout(rebuild); drop(); walls.forEach((w) => world.removeBody(w)); },
    };
    api.recolor();
    return api;
  };
})();
