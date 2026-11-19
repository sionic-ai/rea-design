/* Hero — curved carousel. Takes the numbers from the original (LiquidSlider) as they are and rewrites them in our own GLSL: 
   Camera 45°·Distance=Screen height + 1px=1 unit, board width min(1280, width×.58) (.8 under 1024), gap 50 (25), six boards wrapped on a 180° arc.
   Position follows every frame at .085, and with speed (±70) the panel pinches at the waist and bends while red and blue split apart. The mouse tilts the camera ±50 and the light follows. */
(() => {
  const { PROJECTS, reduce, touch, EXPO, LERP } = MA;
  const THREE = window.THREE;
  const host = document.querySelector("[data-stage]");
  if (!THREE || !host) return;
  const N = PROJECTS.length;
  const arrival = MA.arrival();
  const loader = MA.Loader();
  const controls = MA.Controls();
  const header = document.querySelectorAll(".ma-head__line > *");

  const VERT = `
uniform float uPanelRadius;
uniform float uOvalRatio;
uniform float uWrap;
uniform float uCurve;
uniform float uVelocity;
uniform float uPull;
uniform vec2 uPullOrigin;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec3 p = position;
  float a = p.x / uPanelRadius;
  p.x = mix(p.x, sin(a) * uPanelRadius, uWrap);
  p.z += -(1.0 - cos(a)) * uPanelRadius * uOvalRatio * uWrap;
  p.z -= (p.x * p.x + p.y * p.y * 0.3) * uCurve * 6e-4;
  float u = (uv.y - 0.5) * 2.0;
  float c = 1.0 - u * u;
  p.x += uVelocity * 0.06 * c;
  p.y *= 1.0 - abs(uVelocity) * 0.008 * c;
  float h = 1.0 - smoothstep(0.0, 0.9, distance(uv, uPullOrigin));
  p.z += uPull * h;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
  const FRAG = `
uniform sampler2D map;
uniform float uVelocity;
uniform float uDim;
uniform float uAlpha;
uniform float uLightRadius;
uniform float uLightIntensity;
uniform float uLightFade;
uniform float uBlackout;
uniform float uContentAlpha;
uniform float uBgOpacity;
uniform float uCornerRadius;
uniform vec3 uLightPos;
uniform vec3 uLightColor;
uniform vec3 uBgColor;
uniform vec3 uBlackColor;
uniform vec2 uSlideSize;
varying vec2 vUv;
varying vec3 vWorld;
float roundMask(vec2 uv) {
  vec2 s = abs(uv - 0.5) * uSlideSize - (uSlideSize * 0.5 - uCornerRadius);
  float d = length(max(s, 0.0)) + min(max(s.x, s.y), 0.0) - uCornerRadius;
  return 1.0 - smoothstep(-1.0, 1.0, d);
}
void main() {
  float ab = clamp(uVelocity * 0.0022, -0.018, 0.018);
  vec4 tex = texture2D(map, vUv);
  vec3 col = tex.rgb;
  if (abs(ab) > 1e-4) {
    col.r = texture2D(map, vUv + vec2(ab, 0.0)).r;
    col.b = texture2D(map, vUv - vec2(ab, 0.0)).b;
  }
  col *= uDim;
  float l = 1.0 - smoothstep(0.0, uLightRadius, distance(vWorld, uLightPos));
  vec3 lit = col + uLightColor * l * uLightIntensity * uLightFade;
  vec3 h = mix(lit, uBlackColor, uBlackout);
  float a = mix(tex.a, 1.0, uBlackout);
  float dither = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  vec3 f = mix(uBgColor, h, uContentAlpha) + dither;
  float A = mix(uBgOpacity, a, uContentAlpha) * uAlpha;
  gl_FragColor = vec4(f, A * roundMask(vUv));
}`;

  const pal = MA.palette();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(new THREE.Color(...pal.bg), 1);
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
  const blackColor = new THREE.Vector3(...MA.rgb("--kf-contrast-bg"));
  // The original light is white — use the lighter of the skin’s two background colors
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const lightColor = new THREE.Vector3(...(lum(pal.ink) > lum(pal.bg) ? pal.ink : pal.bg));
  const lightPos = new THREE.Vector3();

  const S = {
    w: 1, h: 1, small: false, mobile: false, D: 1, slideW: 1, slideH: 1, spacing: 1, loopW: 1, Rx: 1, Rz: 1, oval: 1, halfArc: Math.PI / 2,
    pos: 0, target: 0, prevPos: 0, vel: 0, arc: 0,
    tiltT: [0, 0], tilt: [0, 0], lightT: [0, 0], light: [0, 0], hasPointer: false, ndc: new THREE.Vector2(),
    dragging: false, startX: 0, startPos: 0, dragDist: 0, suppress: false,
    hero: 0, heroTween: null, opening: false, edge: 0, tIndex: null,
    m: { x: 0, y: 0, z: 0, rotY: 0, sx: 1, sy: 1, curve: 0, dim: 1, vel: 0, wrap: 1 }, pull: [0.5, 0.5],
    hovered: null, ready: false, t0: performance.now(),
  };
  const scale = new Array(N).fill(1), curve = new Array(N).fill(0), pullAmt = new Array(N).fill(0), pullO = PROJECTS.map(() => [0.5, 0.5]);
  const pool = PROJECTS.map(() => ({ x: 0, y: 0, z: 0, rotY: 0, sx: 1, sy: 1, curve: 0, dim: 1, alpha: 1 }));
  let geo = null, heroT = null, coverT = null;

  // Placeholder video panel: redraws a canvas at the panel’s aspect ratio every frame so it flows like a looping video
  const slides = PROJECTS.map((p, i) => {
    const canvas = document.createElement("canvas");
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false,
      uniforms: {
        map: { value: tex }, uVelocity: { value: 0 }, uDim: { value: 1 }, uCurve: { value: 0 }, uAlpha: { value: 1 },
        uPanelRadius: { value: 1 }, uOvalRatio: { value: 1 }, uWrap: { value: 1 }, uPull: { value: 0 }, uPullOrigin: { value: new THREE.Vector2(0.5, 0.5) },
        uLightPos: { value: lightPos }, uLightColor: { value: lightColor }, uLightIntensity: { value: 0.75 }, uLightRadius: { value: 1 }, uLightFade: { value: 1 },
        uBlackout: { value: 0 }, uBlackColor: { value: blackColor }, uSlideSize: { value: new THREE.Vector2(1, 1) }, uCornerRadius: { value: 4.5 },
        uBgColor: { value: new THREE.Vector3(...pal.bg) }, uBgOpacity: { value: 0.45 }, uContentAlpha: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.userData.i = i;
    scene.add(mesh);
    return { canvas, ctx: canvas.getContext("2d"), tex, mat, mesh, label: ["Project video · Site hero recording", "Three large title lines and a white button · looping"] };
  });
  const meshes = slides.map((s) => s.mesh);

  function paintSlide(s, i, t) {
    MA.paint(s.ctx, s.canvas.width, s.canvas.height, t, i + 1, PROJECTS[i].title, s.label, pal);
    s.tex.needsUpdate = true;
  }

  function build() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    const keep = S.spacing > 1 ? { p: S.pos / S.spacing, t: S.target / S.spacing } : null;
    Object.assign(S, { w, h, small: w < 1024, mobile: w < 640 });
    S.D = h / (2 * Math.tan(THREE.MathUtils.degToRad(22.5)));
    camera.aspect = w / h;
    camera.far = S.D * 6;
    camera.position.set(0, 0, S.D);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    S.slideW = Math.min(1280, w * (S.small ? 0.8 : 0.58));
    S.slideH = S.slideW * (S.mobile ? 1.1 : 0.5625);
    S.spacing = S.slideW + (S.small ? 25 : 50);
    S.loopW = N * S.spacing;
    S.Rx = S.loopW / Math.PI;
    S.Rz = S.Rx;
    S.oval = S.Rz / S.Rx;
    lightPos.set(0, 0, S.slideW * 0.5853);
    const visH = 2 * S.D * Math.tan(THREE.MathUtils.degToRad(22.5));
    const hs = (visH * camera.aspect * 0.6) / S.slideW;
    heroT = { x: 0, y: 0, z: S.Rz * 0.1, rotY: 0, sx: hs, sy: hs, curve: 0, dim: 1 };
    coverT = { x: 0, y: 0, z: 0, rotY: 0, sx: (visH * camera.aspect * 1.05) / S.slideW, sy: (visH * 1.05) / S.slideH, curve: 0, dim: 1 };
    geo && geo.dispose();
    geo = new THREE.PlaneGeometry(S.slideW, S.slideH, 32, 16);
    const cw = 768, ch = Math.round(cw * (S.slideH / S.slideW));
    slides.forEach((s, i) => {
      s.mesh.geometry = geo;
      const u = s.mat.uniforms;
      u.uPanelRadius.value = S.Rx;
      u.uOvalRatio.value = S.oval;
      u.uSlideSize.value.set(S.slideW, S.slideH);
      u.uLightRadius.value = S.slideW * 0.8621;
      if (s.canvas.width !== cw || s.canvas.height !== ch) {
        s.canvas.width = cw;
        s.canvas.height = ch;
        s.tex.dispose();
        paintSlide(s, i, 0);
      }
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    if (keep) { S.pos = keep.p * S.spacing; S.target = keep.t * S.spacing; S.prevPos = S.pos; S.vel = 0; }
    scale.fill(1);
    curve.fill(0);
  }

  // Original computeCarouselTransform: position on the arc, size (shrinks down to .65), bend (.4), darkening (.55+.45s), fades out in the last 15%, stretched horizontally by speed.
  function place(i, e) {
    const L = S.loopW;
    let x = (i * S.spacing + S.pos) % L;
    x = ((x % L) + L) % L;
    if (x > L / 2) x -= L;
    const n = x / S.Rx, u = S.arc;
    const p = Math.min(1, Math.abs(n) / S.halfArc);
    const f = Math.max(0.65, 1 - p * 0.35);
    scale[i] += (THREE.MathUtils.lerp(1, f, u) - scale[i]) * 0.15;
    const grow = THREE.MathUtils.lerp(0.75, 1, u), y = Math.min(Math.abs(e) * 0.0016, 0.045);
    curve[i] += (THREE.MathUtils.lerp(0, p * 0.4, u) - curve[i]) * 0.15;
    const fade = Math.max(0, Math.min(1, 1 - Math.max(0, (p - 0.85) / 0.15)));
    const o = pool[i];
    o.x = THREE.MathUtils.lerp(x, Math.sin(n) * S.Rx, u);
    o.y = 0;
    o.z = THREE.MathUtils.lerp(0, (Math.cos(n) - 1) * S.Rz, u);
    o.rotY = THREE.MathUtils.lerp(0, n * S.oval, u);
    o.sx = scale[i] * (1 + y) * grow;
    o.sy = scale[i] * (1 - y * 0.6) * grow;
    o.dim = 0.55 + 0.45 * scale[i];
    o.curve = curve[i];
    o.alpha = THREE.MathUtils.lerp(1, fade, u) * THREE.MathUtils.lerp(0, 1, u);
    return o;
  }

  const nearestAbs = (i, ref = S.pos) => { const c = -ref / S.spacing; return i + Math.round((c - i) / N) * N; };
  const centred = () => MA.wrap(Math.round(-S.pos / S.spacing), N);

  function heroTo(open, dur, done) {
    S.heroTween && S.heroTween.kill();
    const o = { v: S.hero };
    S.heroTween = gsap.to(o, { v: open ? 1 : 0, duration: reduce ? 0 : dur, ease: EXPO, onUpdate: () => (S.hero = o.v), onComplete: () => { S.hero = open ? 1 : 0; S.heroTween = null; done && done(); } });
  }

  function openSlide(i, uv) {
    if (S.opening || S.tIndex !== null || !S.ready) return;
    S.target = -nearestAbs(i) * S.spacing;
    if (uv) S.pull = [uv.x, uv.y];
    S.opening = true;
    S.hovered = null;
    S.tIndex = i;
    const h = place(i, 0);
    Object.assign(S.m, { x: h.x, y: h.y, z: h.z, rotY: h.rotY, sx: h.sx, sy: h.sy, curve: h.curve, dim: h.dim, vel: 0, wrap: 1 });
    host.style.cursor = "";
    gsap.to(header, { yPercent: -100, opacity: 0, duration: 0.75, ease: EXPO });
    // The original brightens as a panel covers the screen with 0.75s expo, then opens the case within the same section — here it switches to the case section at the moment it is covered
    heroTo(true, 0.75, () => gsap.delayedCall(reduce ? 0 : 0.2, () => MA.go(`detail.html?p=${PROJECTS[i].slug}`, { from: "home", i })));
  }

  // ---- Interaction ----
  host.dataset.drag = "";
  const busy = () => S.opening || S.tIndex !== null;
  host.addEventListener("pointerdown", (e) => {
    if (busy()) return;
    S.dragging = true;
    S.startX = e.clientX;
    S.startPos = S.target;
    S.dragDist = 0;
    host.setPointerCapture(e.pointerId);
  });
  host.addEventListener("pointermove", (e) => {
    if (!S.dragging) return;
    const dx = e.clientX - S.startX;
    S.target = S.startPos + dx * (touch ? 3 : 1.5);
    S.dragDist = Math.abs(dx);
  });
  const up = () => {
    if (!S.dragging) return;
    S.dragging = false;
    if (S.dragDist > 6) { S.suppress = true; setTimeout(() => (S.suppress = false), 0); }
  };
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("wheel", (e) => {
    if (busy()) return;
    e.preventDefault();
    S.target -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 0.6;
  }, { passive: false });
  addEventListener("mousemove", (e) => {
    const r = host.getBoundingClientRect();
    const t = ((e.clientX - r.left) / r.width) * 2 - 1, s = ((e.clientY - r.top) / r.height) * 2 - 1;
    S.tiltT = [t * 50, -s * 50];
    const k = S.slideW * 0.0808;
    S.lightT = [-t * k, s * k];
    S.ndc.set(t, -s);
    S.hasPointer = true;
  });
  const ray = new THREE.Raycaster();
  host.addEventListener("click", (e) => {
    if (S.suppress || busy()) return;
    const r = host.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(meshes.filter((m) => m.visible))[0];
    if (hit) openSlide(hit.object.userData.i, hit.uv);
  });
  addEventListener("keydown", (e) => {
    if ((e.key !== "ArrowUp" && e.key !== "ArrowDown") || e.altKey || e.ctrlKey || e.metaKey || busy() || !S.ready) return;
    if (document.querySelector('[data-about-btn][aria-expanded="true"]')) return;
    e.preventDefault();
    S.target -= (e.key === "ArrowDown" ? 1 : -1) * 100 * 0.6;
  });
  document.querySelectorAll("[data-project-link]").forEach((a, i) => {
    a.addEventListener("click", (e) => { e.preventDefault(); openSlide(i); });
    a.addEventListener("focus", () => { if (!busy() && i !== centred()) S.target = -nearestAbs(i, S.target) * S.spacing; });
  });

  function hover() {
    if (touch || !S.hasPointer || S.dragging || busy()) { S.hovered = null; return; }
    ray.setFromCamera(S.ndc, camera);
    const hit = ray.intersectObjects(meshes.filter((m) => m.visible))[0];
    if (hit) {
      const i = hit.object.userData.i;
      S.hovered = i;
      pullO[i][0] += (hit.uv.x - pullO[i][0]) * LERP * 2;
      pullO[i][1] += (hit.uv.y - pullO[i][1]) * LERP * 2;
      host.style.cursor = "pointer";
    } else { S.hovered = null; host.style.cursor = ""; }
  }

  let lastPaint = 0;
  function tick() {
    const now = performance.now();
    S.pos += (S.target - S.pos) * (reduce ? 1 : LERP);
    // Approaching by half forever makes the title and progress indicator jitter at the decimal end for good — snap when close
    if (Math.abs(S.target - S.pos) < 0.05) S.pos = S.target;
    const d = S.pos - S.prevPos;
    S.prevPos = S.pos;
    S.vel += (d - S.vel) * LERP;
    const e = reduce ? 0 : Math.max(-70, Math.min(70, S.vel));
    if (!touch) {
      const off = S.hero > 0.5;
      S.tilt[0] += ((off ? 0 : S.tiltT[0]) - S.tilt[0]) * LERP;
      S.tilt[1] += ((off ? 0 : S.tiltT[1]) - S.tilt[1]) * LERP;
      camera.position.set(S.tilt[0], S.tilt[1], S.D);
      camera.lookAt(0, 0, 0);
      S.light[0] += ((off ? 0 : S.lightT[0]) - S.light[0]) * LERP;
      S.light[1] += ((off ? 0 : S.lightT[1]) - S.light[1]) * LERP;
      lightPos.x = S.light[0];
      lightPos.y = S.light[1];
    }
    hover();
    S.edge += (S.hero - S.edge) * LERP;
    const gap = S.hero - S.edge;
    let pullOpen = gap * 250;
    if (Math.abs(gap) < 0.01) { S.edge = S.hero; pullOpen = 0; }
    const A = Math.max(0, Math.min(1, S.hero)), Ni = LERP * 1.15;
    for (let i = 0; i < N; i++) {
      const s = slides[i], u = s.mat.uniforms, h = place(i, e);
      if (i === S.tIndex) {
        const from = S.opening ? heroT : h, m = S.m;
        const tx = THREE.MathUtils.lerp(from.x, coverT.x, A), ty = THREE.MathUtils.lerp(from.y, coverT.y, A), tz = THREE.MathUtils.lerp(from.z, coverT.z, A);
        const tsx = THREE.MathUtils.lerp(from.sx, coverT.sx, A), tsy = THREE.MathUtils.lerp(from.sy, coverT.sy, A);
        const k = reduce ? 1 : Ni;
        m.x += (tx - m.x) * k;
        m.y = S.opening && S.hero > 0.99 ? ty : m.y + (ty - m.y) * k;
        m.z += (tz - m.z) * k;
        m.rotY += (from.rotY - m.rotY) * k;
        m.sx += (tsx - m.sx) * k;
        m.sy += (tsy - m.sy) * k;
        m.curve += (from.curve - m.curve) * k;
        m.dim += (from.dim - m.dim) * k;
        m.vel += ((S.opening ? 0 : e) - m.vel) * k;
        m.wrap += ((S.opening ? 0 : 1) - m.wrap) * k;
        const settled = Math.abs(h.x - m.x) < 0.05 && Math.abs(h.z - m.z) < 0.05 && Math.abs(h.rotY - m.rotY) < 0.001 && Math.abs(1 - m.wrap) < 0.001 && Math.abs(h.sx - m.sx) < 0.001 && Math.abs(h.sy - m.sy) < 0.001 && pullOpen === 0;
        s.mesh.position.set(m.x, m.y, m.z);
        s.mesh.rotation.y = m.rotY;
        s.mesh.scale.set(m.sx, m.sy, 1);
        u.uCurve.value = m.curve;
        u.uDim.value = m.dim;
        if (!S.opening && settled && S.hero < 0.01) {
          u.uAlpha.value = h.alpha; u.uVelocity.value = e; u.uWrap.value = 1; u.uPull.value = 0; u.uLightFade.value = 1; u.uBlackout.value = 0;
          s.mesh.renderOrder = 0;
          S.tIndex = null;
        } else {
          u.uAlpha.value = 1; u.uVelocity.value = m.vel; u.uWrap.value = m.wrap; u.uPull.value = pullOpen; u.uPullOrigin.value.set(S.pull[0], S.pull[1]);
          u.uLightFade.value = 1 - S.hero;
          u.uBlackout.value = Math.max(0, Math.min(1, S.opening ? S.hero / 0.5 : S.hero));
          s.mesh.renderOrder = 1;
        }
        s.mesh.visible = true;
      } else {
        s.mesh.position.set(h.x, h.y, h.z);
        s.mesh.rotation.y = h.rotY;
        s.mesh.scale.set(h.sx, h.sy, 1);
        u.uCurve.value = h.curve; u.uDim.value = h.dim; u.uVelocity.value = e; u.uWrap.value = 1; u.uLightFade.value = 1; u.uBlackout.value = 0;
        if (!touch || pullAmt[i] !== 0) {
          pullAmt[i] += ((!touch && i === S.hovered ? 25 : 0) - pullAmt[i]) * LERP * 2;
          if (Math.abs(pullAmt[i]) < 0.05) pullAmt[i] = 0;
          u.uPull.value = pullAmt[i];
          u.uPullOrigin.value.set(pullO[i][0], pullO[i][1]);
        }
        s.mesh.renderOrder = 0;
        const a = h.alpha * (1 - S.hero);
        u.uAlpha.value = a;
        s.mesh.visible = a > 0.01;
      }
    }
    // Video panels redraw only what is visible, at 30 frames per second
    if (now - lastPaint > 33 && S.ready) {
      lastPaint = now;
      const t = (now - S.t0) / 1000;
      slides.forEach((s, i) => s.mesh.visible && paintSlide(s, i, t));
    }
    controls && controls.setFloat(-S.pos / S.spacing);
    loader.loop(MA.wrap(-S.pos, S.loopW) / S.loopW);
    loader.show(S.hero <= 0.5);
    renderer.render(scene, camera);
  }

  build();
  // Shaders are pre-baked when the world is built — baking on first movement would freeze the screen
  renderer.compile(scene, camera);
  let rt = 0;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 200); }).observe(host);
  gsap.ticker.add(tick);

  const fadeIn = (s, delay) => gsap.to(s.mat.uniforms.uContentAlpha, { value: 1, duration: reduce ? 0 : 0.75, ease: EXPO, delay });

  if (arrival && arrival.from === "case" && Number.isInteger(arrival.i)) {
    // Closing from the case and returning — starts from the covering panel and returns to its place on the arc over 0.375s expo (original heroOpen 1→0)
    const i = MA.wrap(arrival.i, N);
    loader.skip();
    S.ready = true;
    S.arc = 1;
    S.pos = S.target = S.prevPos = -i * S.spacing;
    S.tIndex = i;
    S.hero = S.edge = 1;
    Object.assign(S.m, { x: coverT.x, y: coverT.y, z: coverT.z, rotY: 0, sx: coverT.sx, sy: coverT.sy, curve: 0, dim: 1, vel: 0, wrap: 0 });
    slides.forEach((s) => (s.mat.uniforms.uContentAlpha.value = 1));
    gsap.set(header, { yPercent: -100, opacity: 0 });
    MA.setReady();
    heroTo(false, 0.375);
    gsap.to(header, { yPercent: 0, opacity: 1, duration: 0.75, ease: EXPO, delay: 0.1 });
  } else {
    // First open — while the number loader ”downloads” six panels from 0 to 100, and once full the arc spreads out in 1.75s expo
    const prog = { v: 0 };
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    gsap.to(prog, {
      v: 1, duration: reduce ? 0 : 1.83, ease: "power1.inOut",
      onUpdate: () => loader.progress(prog.v),
      onComplete: () => fonts.then(() => {
        loader.progress(1);
        gsap.delayedCall(reduce ? 0 : 0.35, () => {
          loader.done();
          MA.setReady();
          S.ready = true;
          const c = centred();
          fadeIn(slides[c], 0);
          slides.forEach((s, i) => i !== c && fadeIn(s, 0.15 + 0.1 * MA.wrap(i - c, N)));
          if (reduce) S.arc = 1;
          else gsap.to(S, { arc: 1, duration: 1.75, ease: EXPO });
        });
      }),
    });
  }
})();
