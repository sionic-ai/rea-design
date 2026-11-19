// Back stage (three r161): cave wall (bent rock grain + firelight + statue shadow + wall words + cursor torch), a thinker made of particles, the cave entrance and light rays seen when turning around, post-processing (bloom·chromatic aberration·tone·vignette).
// Original values: camera fov 35·(0, .3, 9), wall 52×32 at z −6, statue height 4.2·points 60k (touch·narrow screen 2.20k)·point size 26, fire camera fov 62 moving from (5, −2, 6) to (−1, 1, −6),
// Word position (0, 1.7) · 14×5.25, entrance 72×48 at back 34, light beam 60×60 at back 24, bloom .9 · threshold .2, color shift 7e-4, vignette .7 · .22.
// The statue pulls points from the surface of our own seated figure built from capsules and spheres instead of the original model. The shader rewrites the same formula with our noise.
(() => {
  const { state, reduce, touch } = window.ph;
  const root = document.documentElement;
  const cv = document.querySelector(".ph-stage");
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const range = (v, a, b) => clamp01((v - a) / (b - a));
  const smooth = (v) => v * v * (3 - 2 * v);
  const inOutCubic = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
  const look = { time: 0, fire: 1, vortex: 0, yaw: 0, light: 0, torchOn: 0, pointerStrength: 1 };

  // Original Experience section progress → light, torch and swirl formulas
  const update = (t) => {
    look.time = t;
    look.fire = 0.82 + 0.09 * Math.sin(t * 7.1) + 0.06 * Math.sin(t * 13.7 + 1.3) + 0.05 * Math.sin(t * 23.3 + 0.7) * Math.sin(t * 1.9);
    look.vortex = smooth(range(state.turn, 0.12, 0.62));
    look.yaw = Math.PI * inOutCubic(range(state.turn, 0.35, 0.95));
    const q = smooth(range(state.question, 0, 0.2)) * (1 - smooth(range(state.question, 0.8, 1)));
    look.light = Math.min(1, 0.06 + 0.18 * smooth(range(state.turn, 0.45, 1)) + 0.51 * state.ascent + 0.25 * state.sun) * (1 - 0.88 * q);
    look.pointerStrength = 1 - smooth(range(state.hero, 0.2, 0.9));
    const lit = smooth(range(state.wall, 0, 0.12)) * (1 - smooth(range(state.wall, 0.9, 1)));
    look.torchOn = Math.max(0.5 * (1 - state.hero), lit);
    root.style.setProperty("--light", look.light.toFixed(3));
  };

  // The entrance door counts at least 1.4s after the stage is ready (in the original, after compiling the 3D scene) — it signals even if the stage can’t be built
  const ready = () => { if (window.ph.stageReady) return; window.ph.stageReady = true; dispatchEvent(new Event("ph:stage")); };
  const fallback = () => { gsap.ticker.add(() => update(reduce ? 0 : gsap.ticker.time)); ready(); };
  if (!window.THREE || !cv) return fallback();
  const T = THREE;
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: "high-performance", stencil: false }); }
  catch { return fallback(); }

  const narrow = matchMedia("(max-width: 768px)").matches;
  const COUNT = touch || narrow ? 22000 : 60000;

  // Reads colors from the skin — the original shader colors (ember, bone light, bronze, gold) are the same values as the skin’s accent, text, accent text and pale accent, so those sRGB values are used directly as light intensity.
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const tone = (name) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(root).getPropertyValue(name).trim() || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new T.Vector3(d[0] / 255, d[1] / 255, d[2] / 255);
  };
  const C = {};
  const readTones = () => {
    C.ember = tone("--kf-accent"); C.bone = tone("--kf-ink"); C.bronze = tone("--kf-accent-text"); C.gold = tone("--kf-accent-soft");
    C.soot = tone("--kf-bg").multiplyScalar(0.28);
    C.torch = C.ember.clone().lerp(C.gold, 0.6);
    C.sky = C.gold.clone().lerp(C.bone, 0.55);
    const bg = new T.Color().setRGB(...tone("--kf-bg").toArray(), T.SRGBColorSpace);
    C.bg = new T.Vector3(bg.r, bg.g, bg.b);
  };
  readTones();

  /* ---------- Shared GLSL: custom noise · fbm · swirl ---------- */
  const NOISE = `
    float hash3(vec3 p) { p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
    float vnoise(vec3 p) {
      vec3 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
      float a = mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), u.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), u.x), u.y);
      float b = mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), u.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), u.x), u.y);
      return mix(a, b, u.z) * 2. - 1.;
    }
    float fbm(vec3 p) { float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return v; }
    vec3 vnoise3(vec3 p) { return vec3(vnoise(p), vnoise(p + vec3(31.4, -17.2, 8.9)), vnoise(p + vec3(-12.7, 45.1, -23.3))); }
    vec3 swirl(vec3 p) {
      const float e = .1;
      vec3 x0 = vnoise3(p - vec3(e, 0, 0)), x1 = vnoise3(p + vec3(e, 0, 0));
      vec3 y0 = vnoise3(p - vec3(0, e, 0)), y1 = vnoise3(p + vec3(0, e, 0));
      vec3 z0 = vnoise3(p - vec3(0, 0, e)), z1 = vnoise3(p + vec3(0, 0, e));
      return normalize(vec3(y1.z - y0.z - z1.y + z0.y, z1.x - z0.x - x1.z + x0.z, x1.y - x0.y - y1.x + y0.x) + 1e-5);
    }
    float grain(vec2 p) { vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }`;
  const WORLD_VS = `varying vec3 vWorld; varying vec2 vUv;
    void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  const QUAD_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.3, 9);
  camera.rotation.order = "YXZ";

  /* ---------- Seated person resting chin on hand: built from seventeen capsules and spheres, points sampled from the surface (front +x, height 4.2 — turning 3.4 radians faces screen left) ---------- */
  const parts = [
    ["ball", [0.25, -1.62, 0], [-1.25, 0.48, 0.95]],
    ["cap", [0.35, -1.05, 0.36], [-0.9, -0.92, 0.42], 0.33], ["cap", [0.35, -1.05, -0.36], [-0.85, -0.98, -0.3], 0.33],
    ["cap", [-0.92, -0.95, 0.42], [-1.02, -2.02, 0.46], 0.24], ["cap", [-0.86, -1.0, -0.3], [-0.98, -2.02, -0.34], 0.24],
    ["ball", [-1.12, -2.08, 0.46], [-0.3, 0.12, 0.16]], ["ball", [-1.08, -2.08, -0.34], [-0.3, 0.12, 0.16]],
    ["cap", [0.3, -0.9, 0], [-0.18, 0.45, 0], 0.56],
    ["ball", [-0.25, 0.62, 0], [-0.52, 0.42, 0.62]],
    ["cap", [-0.35, 0.78, 0], [-0.55, 0.98, 0.02], 0.16],
    ["ball", [-0.82, 1.08, 0.04], [-0.33, 0.37, 0.31]],
    ["cap", [-0.1, 0.55, -0.48], [-0.86, -0.62, 0.3], 0.17], ["cap", [-0.86, -0.62, 0.3], [-0.88, 0.7, 0.06], 0.15],
    ["ball", [-0.9, 0.78, 0.05], [-0.17, 0.2, 0.17]],
    ["cap", [-0.1, 0.55, 0.5], [0.0, -0.35, 0.62], 0.16], ["cap", [0.0, -0.35, 0.62], [-0.68, -0.82, 0.5], 0.14],
  ];
  const v3 = ([x, y, z]) => new T.Vector3(-x, y, z);
  const prims = parts.map(([k, a, b, r]) => (k === "ball" ? { k, c: v3(a), r: v3(b) } : { k, a: v3(a), b: v3(b), r }));
  const tmp = new T.Vector3(), tmp2 = new T.Vector3();
  const inside = (p, skip) => prims.some((q) => {
    if (q === skip) return false;
    if (q.k === "ball") { tmp.subVectors(p, q.c).divide(q.r); return tmp.lengthSq() < 0.98; }
    tmp.subVectors(q.b, q.a); const t = clamp01(tmp2.subVectors(p, q.a).dot(tmp) / tmp.lengthSq());
    return tmp2.copy(q.a).addScaledVector(tmp, t).distanceTo(p) < q.r * 0.98;
  });
  const area = (q) => (q.k === "ball" ? 4 * Math.PI * Math.pow((q.r.x * q.r.y + q.r.y * q.r.z + q.r.x * q.r.z) / 3, 1) : 2 * Math.PI * q.r * q.a.distanceTo(q.b) + 4 * Math.PI * q.r * q.r);
  const weights = prims.map(area), sum = weights.reduce((a, b) => a + b, 0);
  const dirRand = (out) => { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u); return out.set(s * Math.cos(th), u, s * Math.sin(th)); };
  const lo = -2.2, hi = 1.45, SCALE = 4.2 / (hi - lo), MID = (hi + lo) / 2;
  const samplePoint = (pos, nor) => {
    for (let tries = 0; tries < 40; tries++) {
      let r = Math.random() * sum, q = prims[0];
      for (let i = 0; i < prims.length; i++) { r -= weights[i]; if (r <= 0) { q = prims[i]; break; } }
      dirRand(nor);
      if (q.k === "ball") { pos.copy(nor).multiply(q.r).add(q.c); nor.divide(q.r).normalize(); }
      else {
        tmp.subVectors(q.b, q.a); const t = Math.random();
        const axis = tmp.clone().normalize();
        if (t > 0.08 && t < 0.92) nor.addScaledVector(axis, -nor.dot(axis)).normalize();
        pos.copy(q.a).addScaledVector(tmp, t).addScaledVector(nor, q.r);
      }
      if (!inside(pos, q)) { pos.y -= MID; pos.multiplyScalar(SCALE); return; }
    }
  };
  const statueGeo = (() => {
    const pos = new Float32Array(COUNT * 3), nor = new Float32Array(COUNT * 3), rnd = new Float32Array(COUNT * 4), sc = new Float32Array(COUNT * 3);
    const p = new T.Vector3(), n = new T.Vector3();
    for (let i = 0; i < COUNT; i++) {
      samplePoint(p, n); p.toArray(pos, i * 3); n.toArray(nor, i * 3);
      for (let k = 0; k < 4; k++) rnd[i * 4 + k] = Math.random();
      // Scatter spot: cylinder band of radius 1.2 + 13·r^1.6, height proportional to radius, depth −4 ~ 30
      const rr = 1.2 + Math.pow(Math.random(), 1.6) * 13, a = Math.random() * Math.PI * 2;
      sc[i * 3] = Math.cos(a) * rr; sc[i * 3 + 1] = (Math.random() - 0.4) * 11 * (0.4 + rr / 14); sc[i * 3 + 2] = -4 + Math.random() * 34;
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.BufferAttribute(nor, 3));
    g.setAttribute("aRand", new T.BufferAttribute(rnd, 4));
    g.setAttribute("aScatter", new T.BufferAttribute(sc, 3));
    g.boundingSphere = new T.Sphere(new T.Vector3(), 100);
    return g;
  })();

  const statueU = {
    uTime: { value: 0 }, uSize: { value: 26 }, uPixelRatio: { value: 1 }, uFire: { value: 1 }, uVortex: { value: 0 }, uHold: { value: 0 }, uBurst: { value: 0 },
    uLight: { value: 0 }, uPointerStrength: { value: 1 }, uPointer: { value: new T.Vector3(99, 99, 99) }, uFocus: { value: new T.Vector3() },
    uEmber: { value: C.ember }, uBronze: { value: C.bronze }, uBone: { value: C.bone }, uGold: { value: C.gold },
  };
  const statue = new T.Points(statueGeo, new T.ShaderMaterial({
    uniforms: statueU, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `${NOISE}
      uniform float uTime, uSize, uPixelRatio, uFire, uVortex, uHold, uBurst, uLight, uPointerStrength;
      uniform vec3 uPointer, uFocus, uEmber, uBronze, uBone, uGold;
      attribute vec4 aRand; attribute vec3 aScatter;
      varying vec3 vColor; varying float vAlpha;
      mat2 spin(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
      void main() {
        vec3 p = position, n = normal;
        float gone = smoothstep(aRand.w * .55, aRand.w * .55 + .45, uVortex);
        if (gone < .999) {
          p += n * (.012 + .035 * aRand.x) * vnoise(p * 1.4 + vec3(0., uTime * .25, 0.));
          vec3 d = p - uPointer;
          float push = smoothstep(1.3, 0., length(d.xy)) * uPointerStrength;
          if (push > .001) { p += normalize(vec3(d.xy, d.z * .4) + n * .6) * push * (.35 + aRand.z * .9); p += swirl(p * .8 + uTime * .2) * push * .35; }
        }
        if (gone > .001) {
          vec3 s = aScatter;
          s.xz = spin(uTime * (.015 + aRand.x * .03) + (1. - gone) * (2.5 + aRand.y * 2.)) * s.xz;
          vec3 ph = aRand.xyz * 6.2831;
          s += vec3(sin(s.y * .35 + uTime * .21 + ph.x), sin(s.z * .3 + uTime * .17 + ph.y) * .6, cos(s.x * .33 + uTime * .19 + ph.z)) * (.6 + aRand.z * 1.1);
          if (gone < .999) { vec3 mid = mix(p, s, .5) + swirl(p * .5 + uTime * .3) * 2.5 * sin(gone * 3.14159); p = mix(mix(p, mid, smoothstep(0., .5, gone)), s, smoothstep(.5, 1., gone)); }
          else p = s;
        }
        float h = uHold * uHold * (3. - 2. * uHold);
        if (h > .001) { vec3 shell = normalize(aScatter + .001) * (.08 + aRand.x * .55) * (1. - h * .7); shell.xy = spin(uTime * (.6 + aRand.y)) * shell.xy; p = mix(p, uFocus + shell, h * (.55 + .45 * aRand.y)); }
        p += normalize(p - uFocus + .0001) * uBurst * (1.5 + aRand.z * 7.);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        float near = smoothstep(.8, 3., -mv.z);
        gl_PointSize = min(uSize * (.35 + aRand.x * 1.15) * (1. + h * .6) * mix(1., .6, gone) * uPixelRatio / -mv.z, 12. * uPixelRatio) * near;
        float lam = max(dot(normalize(mat3(modelMatrix) * n), normalize(vec3(.47, -.2, .86))), 0.);
        float rim = pow(1. - abs(normalize(normalMatrix * n).z), 3.);
        float tw = pow(.5 + .5 * sin(uTime * (1. + aRand.y * 4.) + aRand.z * 80.), 12.);
        vec3 body = uBronze * .11 + uEmber * lam * uFire * 1.25 + uBone * rim * .3 + uEmber * tw * .4;
        float shaft = smoothstep(5., .3, length(p.xy - vec2(0., 1.2) + vec2(sin(p.z * .15), 0.)));
        vec3 dust = mix(uEmber * .6, uGold, uLight) * (.32 + shaft * uLight * 1.2) + uGold * tw * .6;
        vColor = mix(mix(body, dust, gone), uBone * 1.4, h * .8);
        vAlpha = (.55 + .45 * aRand.y) * mix(1., .75, gone) * near;
      }`,
    fragmentShader: `varying vec3 vColor; varying float vAlpha;
      void main() { float a = smoothstep(.5, 0., length(gl_PointCoord - .5)); a *= a; if (a < .01) discard; gl_FragColor = vec4(vColor * a * vAlpha, 1.); }`,
  }));
  statue.frustumCulled = false;
  const group = new T.Group();
  group.scale.setScalar(narrow ? 0.72 : 1);
  group.rotation.y = 3.4;
  group.add(statue);
  scene.add(group);

  /* ---------- Wall: bakes the rock texture once, shoots the statue silhouette with a fire camera and lights it as a shadow ---------- */
  const WALL_Z = -6, WALL = [52, 32];
  const rockRT = new T.WebGLRenderTarget(1024, 640);
  const silRT = new T.WebGLRenderTarget(768, 480);
  const bake = new T.Scene(), bakeCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  bake.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    uniforms: { uSize: { value: new T.Vector2(...WALL) } }, vertexShader: QUAD_VS,
    fragmentShader: `${NOISE}
      uniform vec2 uSize; varying vec2 vUv;
      float ht(vec2 p) { return fbm(vec3(p * vec2(.42, .62), 0.)) + .22 * vnoise(vec3(p * 2.4, 2.)); }
      void main() {
        vec2 p = (vUv - .5) * uSize; float e = .04, h = ht(p);
        vec3 n = normalize(vec3(-(ht(p + vec2(e, 0.)) - h) / e * .7, -(ht(p + vec2(0., e)) - h) / e * .7, 1.));
        gl_FragColor = vec4(n * .5 + .5, smoothstep(-.55, .55, h));
      }`,
  })));
  let baked = false;
  // Silhouette: the same seated person built from white lumps (capsules, balls), drawn rotated 1 radian more than the statue to show the shape seen from the fire
  const sil = new T.Scene();
  sil.background = new T.Color(0);
  const silBody = new T.Group();
  silBody.matrixAutoUpdate = false;
  const white = new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide }); // Not skin: shadow mask (white = Cover)
  for (const q of prims) {
    let m;
    if (q.k === "ball") { m = new T.Mesh(new T.SphereGeometry(1, 16, 12), white); m.position.copy(q.c); m.scale.copy(q.r); }
    else {
      const len = q.a.distanceTo(q.b);
      m = new T.Mesh(new T.CapsuleGeometry(q.r, len, 4, 12), white);
      m.position.addVectors(q.a, q.b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), tmp.subVectors(q.b, q.a).normalize());
    }
    m.position.y -= MID; m.position.multiplyScalar(SCALE); m.scale.multiplyScalar(SCALE);
    silBody.add(m);
  }
  const silWrap = new T.Group(); silWrap.add(silBody); sil.add(silWrap);
  const fireCam = new T.PerspectiveCamera(62, 1.6, 0.5, 40);
  // Wall word: white text on a 2048×768 canvas in the title typeface italic 560px (reduced if width exceeds 92%)
  const wordCv = Object.assign(document.createElement("canvas"), { width: 2048, height: 768 });
  const wordTex = new T.CanvasTexture(wordCv);
  const words = gsap.utils.toArray(".ph-wall__truth").map((_, i) => `Word ${i + 1}`);
  let wordAt = -1;
  const paintWord = (i) => {
    const g = wordCv.getContext("2d"), fam = getComputedStyle(root).getPropertyValue("--kf-font-display").trim() || "serif";
    g.fillStyle = "#000"; g.fillRect(0, 0, 2048, 768); // Not skin: word mask (black = Empty spot)
    let size = 560; g.font = `italic ${size}px ${fam}`;
    const w = g.measureText(words[i] || "").width; if (w > 2048 * 0.92) size *= 2048 * 0.92 / w;
    g.font = `italic ${size}px ${fam}`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; // Not skin: word mask (white = Characters)
    g.fillText(words[i] || "", 1024, 384);
    wordTex.needsUpdate = true;
  };
  document.fonts?.ready.then(() => (wordAt = -1));
  const wallU = {
    uTime: { value: 0 }, uFire: { value: 1 }, uShadow: { value: 1 }, uWordFade: { value: 0 }, uTorchOn: { value: 0 },
    uFirePos: { value: new T.Vector3(5, -2.5, 6) }, uTorch: { value: new T.Vector3(0, 0, WALL_Z) }, uShadowMatrix: { value: new T.Matrix4() },
    uSilhouette: { value: silRT.texture }, uRock: { value: rockRT.texture }, uWords: { value: wordTex },
    uWordCenter: { value: new T.Vector2(0, 1.7) }, uWordSize: { value: new T.Vector2(14, 5.25) },
    uSoot: { value: C.soot }, uEmber: { value: C.ember }, uTorchTint: { value: C.torch },
  };
  const wall = new T.Mesh(new T.PlaneGeometry(...WALL), new T.ShaderMaterial({
    uniforms: wallU, vertexShader: WORLD_VS,
    fragmentShader: `
      uniform float uTime, uFire, uShadow, uWordFade, uTorchOn;
      uniform vec3 uFirePos, uTorch, uSoot, uEmber, uTorchTint;
      uniform mat4 uShadowMatrix; uniform sampler2D uSilhouette, uWords, uRock; uniform vec2 uWordCenter, uWordSize;
      varying vec3 vWorld; varying vec2 vUv;
      float soft(sampler2D t, vec2 uv, float r) {
        float s = texture2D(t, uv).r * .2;
        for (int i = 0; i < 8; i++) { float a = float(i) * .7853982; vec2 o = vec2(cos(a), sin(a)) * r * (mod(float(i), 2.) < .5 ? 1. : .7); s += texture2D(t, uv + o).r * .1; }
        return s;
      }
      float within(vec2 uv) { return step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.); }
      void main() {
        vec3 p = vWorld; vec4 rock = texture2D(uRock, vUv);
        vec3 n = normalize(rock.rgb * 2. - 1.); float cav = rock.a;
        vec3 toF = uFirePos - p; float fd = length(toF);
        float lam = max(dot(n, toF / fd), 0.), fall = 1. / (1. + fd * fd * .02);
        vec3 col = uSoot * (.5 + cav) + uEmber * pow(lam, 1.6) * fall * uFire * .75 * cav * cav;
        col *= .25 + 1.1 * smoothstep(8., -4., p.y) * smoothstep(14., -4., p.x);
        vec2 sc = p.xy - vec2(-1.2, 1.4);
        col += uEmber * exp(-dot(sc, sc * vec2(.55, 1.)) / 34.) * uFire * .13 * (.35 + .65 * cav);
        vec4 sp = uShadowMatrix * vec4(p, 1.); vec2 suv = sp.xy / sp.w * .5 + .5;
        suv += vec2(sin(suv.y * 23. + uTime * 1.7), cos(suv.x * 19. + uTime * 1.3)) * .0025;
        float shade = soft(uSilhouette, suv, .006 + .004 * (1. - uFire)) * within(suv) * uShadow;
        vec2 wuv = (p.xy - uWordCenter) / uWordSize + .5;
        wuv.x += sin(wuv.y * 9. + uTime * 2.1) * sin(uTime * .7) * .012; wuv.y += sin(wuv.x * 7. + uTime * 1.6) * .012;
        float word = soft(uWords, wuv, .004 + .003 * sin(uTime * 3.)) * within(wuv) * uWordFade;
        float dark = clamp(shade + word, 0., 1.);
        float torch = smoothstep(3.4, 0., length(p.xy - uTorch.xy)) * uTorchOn;
        col *= 1. - dark * .9 * (1. - torch * .92);
        col += uTorchTint * torch * torch * (.06 + .22 * lam) * (1. - .3 * cav);
        gl_FragColor = vec4(col, 1.);
      }`,
  }));
  wall.position.set(0, 2, WALL_Z);
  scene.add(wall);

  /* ---------- Back side (seen when the camera turns): cave entrance and light rays ---------- */
  const backU = { uTime: { value: 0 }, uLight: { value: 0 }, uSoot: { value: C.soot }, uSky: { value: C.sky }, uGold: { value: C.gold }, uBone: { value: C.bone } };
  const back = new T.Group();
  back.rotation.y = Math.PI;
  const mouth = new T.Mesh(new T.PlaneGeometry(72, 48), new T.ShaderMaterial({
    uniforms: backU, vertexShader: WORLD_VS,
    fragmentShader: `${NOISE}
      uniform float uTime, uLight; uniform vec3 uSoot, uSky, uGold, uBone; varying vec2 vUv;
      void main() {
        vec2 uv = vUv - .5; uv.x *= 1.5;
        float ang = atan(uv.y, uv.x), r = length(uv * vec2(1., 1.25));
        float wob = .55 * sin(ang * 3. + 1.3) + .3 * sin(ang * 7. + 4.1) + .15 * sin(ang * 13. + .4);
        float edge = (.17 + .012 * wob) * (.22 + uLight * .45);
        float open = smoothstep(edge + .012, edge - .012, r);
        vec3 sky = mix(uSky, mix(uSky, uBone, .6) * 1.06, smoothstep(-.2, .3, uv.y));
        float sun = smoothstep(edge * .7, 0., length(uv - vec2(0., .01)));
        vec3 day = sky * (.12 + uLight * 1.9) + mix(uBone, uGold, .3) * 1.08 * sun * 2.5 * uLight;
        float h = .5 + .5 * vnoise(vec3(uv * 6., 5.));
        float rim = smoothstep(edge + .12, edge, r) * (.5 + .5 * h);
        vec3 stone = uSoot * (.6 + h) + uGold * rim * rim * (.05 + uLight * .3);
        float glow = exp(-max(r - edge, 0.) * (16. - uLight * 8.)) * (.12 + uLight * .45);
        vec3 col = mix(stone, day, open) + mix(uGold, uBone, .5) * glow * (1. - open);
        gl_FragColor = vec4(col * smoothstep(0., .15, uLight + .06), 1.);
      }`,
  }));
  mouth.position.set(0, 1.5, -34);
  const beams = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShaderMaterial({
    uniforms: backU, vertexShader: WORLD_VS, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    fragmentShader: `uniform float uTime, uLight; uniform vec3 uGold; varying vec2 vUv;
      void main() {
        vec2 uv = vUv - .5; float ang = atan(uv.y, uv.x), r = length(uv);
        float b = sin(ang * 5. + uTime * .11) * .5 + sin(ang * 11. - uTime * .07 + 2.) * .3 + sin(ang * 23. + uTime * .05) * .2;
        float a = smoothstep(.05, .9, b * .5 + .5) * smoothstep(.5, .05, r) * smoothstep(0., .08, r) * uLight * uLight * .16;
        gl_FragColor = vec4(uGold * a, 1.);
      }`,
  }));
  beams.position.set(0, 1.5, -24);
  back.add(mouth, beams);
  scene.add(back);
  scene.background = new T.Color().setRGB(C.bg.x, C.bg.y, C.bg.z, T.LinearSRGBColorSpace);

  /* Portrait panel: a WebGL plane that follows the DOM portrait slot (5 in front of the camera) — two sepia tones → on hover the original tone · cursor ripple · color split, and once it is within 90% of the screen it is revealed from below as jagged light streaks (.7s),
     It bends with scroll speed (−speed×.012, ±.6) and bulges in the middle when flying to the reading panel. A canvas drawing figure outlines, light and labels stands in for photos ---------- */
  const PLANE_Z = 5;
  const figs = [...document.querySelectorAll(".ph-card__fig")];
  const portrait = (fig) => {
    const c = Object.assign(document.createElement("canvas"), { width: 600, height: 800 }), g = c.getContext("2d");
    const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
    const ink = css("--kf-ink"), dark = css("--kf-bg"), mid = css("--kf-dim");
    g.fillStyle = dark; g.fillRect(0, 0, 600, 800);
    let gr = g.createRadialGradient(150, 160, 20, 220, 300, 640); gr.addColorStop(0, mid); gr.addColorStop(1, dark);
    g.fillStyle = gr; g.fillRect(0, 0, 600, 800);
    // Head and shoulders — a side-profile spot lit from the upper left
    gr = g.createLinearGradient(160, 200, 460, 560); gr.addColorStop(0, ink); gr.addColorStop(1, dark);
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(300, 330, 120, 150, -0.12, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(60, 800); g.bezierCurveTo(90, 560, 200, 500, 300, 500); g.bezierCurveTo(420, 500, 520, 560, 560, 800); g.fill();
    g.fillStyle = ink; g.globalAlpha = .8; g.font = `28px ${css("--kf-font-sans")}`; g.textAlign = "center";
    const label = fig.querySelector(".wf-img")?.dataset.label || "";
    const lines = []; let line = "";
    for (const w of label.split(" ")) { if (g.measureText(line + w).width > 520) { lines.push(line); line = ""; } line += w + " "; }
    lines.push(line);
    lines.forEach((l, i) => g.fillText(l.trim(), 300, 720 - (lines.length - 1 - i) * 36));
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    return tex;
  };
  const planeU = figs.map((f) => ({
    uMap: { value: portrait(f) }, uImageRes: { value: new T.Vector2(600, 800) }, uPlaneRes: { value: new T.Vector2(1, 1) }, uTime: { value: 0 }, uHover: { value: 0 },
    uReveal: { value: reduce ? 1 : 0 }, uLight: { value: 0 }, uBend: { value: 0 }, uMouse: { value: reduce ? new T.Vector2(9, 9) : new T.Vector2(0.5, 0.5) }, uExpand: { value: 0 }, uOpacity: { value: 1 },
    uShade: { value: C.bg }, uBronzeLit: { value: C.bronze.clone().lerp(C.gold, 0.35) }, uSeam: { value: C.torch },
  }));
  const plates = new T.Group();
  const backdrop = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshBasicMaterial({ color: new T.Color().setRGB(C.bg.x, C.bg.y, C.bg.z, T.LinearSRGBColorSpace), transparent: true, opacity: 0, depthWrite: false }));
  backdrop.position.z = -PLANE_Z - 0.05; backdrop.renderOrder = 10; backdrop.visible = false;
  plates.add(backdrop);
  const planes = planeU.map((u) => {
    const m = new T.Mesh(new T.PlaneGeometry(1, 1, 32, 32), new T.ShaderMaterial({
      uniforms: u, transparent: true, premultipliedAlpha: true, depthWrite: false,
      vertexShader: `uniform float uBend, uHover, uTime, uExpand; uniform vec2 uMouse; varying vec2 vUv;
        void main() {
          vUv = uv; vec3 p = position; float sx = sin(uv.x * 3.14159);
          p.z += sx * uBend; p.y += sx * uBend * .15;
          p.z += smoothstep(.6, 0., distance(uv, uMouse)) * uHover * .08;
          float fly = sin(uExpand * 3.14159); p.z += sin(uv.y * 3.14159) * fly * .45 + sx * fly * .2;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
        }`,
      fragmentShader: `${NOISE}
        uniform sampler2D uMap; uniform vec2 uImageRes, uPlaneRes, uMouse; uniform float uTime, uHover, uReveal, uLight, uExpand, uOpacity;
        uniform vec3 uShade, uBronzeLit, uSeam; varying vec2 vUv;
        vec2 fitCover(vec2 uv, vec2 pl, vec2 im) { float rp = pl.x / pl.y, ri = im.x / im.y; vec2 k = rp < ri ? vec2(rp / ri, 1.) : vec2(1., ri / rp); return (uv - .5) * k + .5; }
        void main() {
          vec2 uv = vUv; float d = distance(uv, uMouse);
          uv += normalize(uv - uMouse + .0001) * sin(d * 38. - uTime * 5.) * .006 * uHover * smoothstep(.55, 0., d);
          float wave = sin(uExpand * 3.14159) + (1. - uOpacity);
          uv += normalize(vUv - .5 + .0001) * sin(distance(vUv, vec2(.5)) * 26. - uTime * 4.) * .008 * wave;
          uv = (uv - .5) * (1. - .12 * (1. - uReveal) - .04 * uHover) + .5;
          vec2 c = fitCover(uv, uPlaneRes, uImageRes); float sh = .004 * uHover;
          vec3 tex = vec3(texture2D(uMap, c + vec2(sh, 0.)).r, texture2D(uMap, c).g, texture2D(uMap, c - vec2(sh, 0.)).b);
          float lum = dot(tex, vec3(.299, .587, .114));
          vec3 duo = mix(uShade * .7, uBronzeLit, smoothstep(.05, .95, lum));
          vec3 col = mix(duo, tex, max(uHover, smoothstep(.2, .9, uExpand)));
          col *= .7 + .3 * uLight + .15 * uHover;
          col += (grain(vUv * 900. + fract(uTime) * 100.) - .5) * .06;
          float jag = uReveal < .999 ? vnoise(vec3(vUv.x * 4., uTime * .2, 0.)) * .06 : 0.;
          float edge = uReveal * 1.25 - .12 + jag;
          float mask = smoothstep(edge, edge - .08, vUv.y);
          float seam = smoothstep(.03, 0., abs(vUv.y - edge)) * (1. - step(.999, uReveal));
          gl_FragColor = vec4(col * mask + uSeam * seam * 1.5, mask + seam) * uOpacity;
        }`,
    }));
    m.frustumCulled = false; m.visible = false; plates.add(m);
    return m;
  });
  scene.add(plates);
  if (figs.length) root.classList.add("gl-planes");
  const planeMouse = new T.Vector2(0.5, 0.5);
  // Turned on only when moving, like the original — even if a panel scrolls under a still cursor, there is no ripple before it moves. Turning off is detected by outward movement on pointerout (same meaning as the original React onPointerLeave)
  figs.forEach((f, i) => {
    f.addEventListener("pointermove", (e) => { state.hovered = i; const r = f.getBoundingClientRect(); planeMouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height); });
    f.addEventListener("pointerout", (e) => { if (!f.contains(e.relatedTarget) && state.hovered === i) state.hovered = null; });
  });
  const ascentEl = document.querySelector("#ascent");
  const placePlanes = (dt) => {
    const ar = ascentEl?.getBoundingClientRect();
    const fly = document.querySelector(".ph-reader__fly"), media = document.querySelector(".ph-reader__media");
    const flyIdx = fly ? +fly.dataset.i : -1;
    const on = (ar && ar.bottom > -innerHeight * 0.5 && ar.top < innerHeight * 1.5) || flyIdx >= 0;
    plates.visible = on;
    if (!on) return;
    plates.position.copy(camera.position); plates.quaternion.copy(camera.quaternion);
    const w = innerWidth, h = innerHeight, unit = 2 * PLANE_Z * Math.tan(camera.fov * Math.PI / 360) / h;
    const bend = Math.max(-0.6, Math.min(0.6, -(window.ph.lenis?.velocity || 0) * 0.012));
    let expand = 0;
    if (fly && media) {
      const a = figs[flyIdx]?.getBoundingClientRect(), b = media.getBoundingClientRect(), f = fly.getBoundingClientRect();
      expand = a && b.width !== a.width ? clamp01((f.width - a.width) / (b.width - a.width)) : 1;
    }
    backdrop.visible = expand > 0.001; backdrop.material.opacity = expand * 0.94;
    planes.forEach((m, i) => {
      const u = planeU[i], mine = i === flyIdx;
      if (flyIdx >= 0 && expand > 0.01 && !mine) { m.visible = false; return; }
      const r = (mine ? fly : figs[i]).getBoundingClientRect();
      const seen = mine || (r.right > -80 && r.left < w + 80 && r.bottom > -80 && r.top < h + 80);
      m.visible = seen; if (!seen) return;
      m.renderOrder = mine ? 12 : 0;
      m.position.set((r.left + r.width / 2 - w / 2) * unit, -(r.top + r.height / 2 - h / 2) * unit, -PLANE_Z);
      m.scale.set(r.width * unit, r.height * unit, 1);
      u.uPlaneRes.value.set(r.width, r.height); u.uTime.value = look.time; u.uLight.value = look.light;
      damp(u.uHover, "value", state.hovered === i ? 1 : 0, 0.25, dt);
      if (mine) u.uReveal.value = 1; else if (!reduce) damp(u.uReveal, "value", r.left < w * 0.9 ? 1 : 0, 0.7, dt);
      damp(u.uBend, "value", flyIdx >= 0 ? 0 : bend, 0.2, dt);
      u.uExpand.value = mine ? expand : 0;
      if (!reduce && state.hovered === i) { damp(u.uMouse.value, "x", planeMouse.x, 0.1, dt); damp(u.uMouse.value, "y", planeMouse.y, 0.1, dt); }
    });
  };

  /* ---------- Post-processing: bloom on bright areas (.9, threshold .2 → +.35) in three stages + chromatic aberration (7e-4, from edge .35) + tone mapping (ACES approximation) + vignette (.7·.22) ---------- */
  const fsq = new T.Mesh(new T.PlaneGeometry(2, 2));
  const post = new T.Scene(); post.add(fsq);
  const hf = { type: T.HalfFloatType };
  const mainRT = new T.WebGLRenderTarget(1, 1, hf);
  const levels = [2, 4, 8].map((d) => ({ d, a: new T.WebGLRenderTarget(1, 1, hf), b: new T.WebGLRenderTarget(1, 1, hf) }));
  const brightM = new T.ShaderMaterial({ uniforms: { tMap: { value: null } }, vertexShader: QUAD_VS,
    fragmentShader: `uniform sampler2D tMap; varying vec2 vUv;
      void main() { vec3 c = texture2D(tMap, vUv).rgb; float l = dot(c, vec3(.2126, .7152, .0722)); gl_FragColor = vec4(c * smoothstep(.2, .55, l), 1.); }` });
  const blurM = new T.ShaderMaterial({ uniforms: { tMap: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: QUAD_VS,
    fragmentShader: `uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
      void main() { vec3 c = texture2D(tMap, vUv).rgb * .227;
        c += (texture2D(tMap, vUv + uDir * 1.385).rgb + texture2D(tMap, vUv - uDir * 1.385).rgb) * .316;
        c += (texture2D(tMap, vUv + uDir * 3.231).rgb + texture2D(tMap, vUv - uDir * 3.231).rgb) * .07;
        gl_FragColor = vec4(c, 1.); }` });
  const finalM = new T.ShaderMaterial({
    uniforms: { tMap: { value: mainRT.texture }, tB1: { value: levels[0].a.texture }, tB2: { value: levels[1].a.texture }, tB3: { value: levels[2].a.texture }, uTime: { value: 0 } },
    vertexShader: QUAD_VS,
    fragmentShader: `uniform sampler2D tMap, tB1, tB2, tB3; uniform float uTime; varying vec2 vUv;
      vec3 aces(vec3 x) { x *= .6; return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
      vec3 toSrgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
      void main() {
        vec2 d = vUv - .5; float m = clamp((length(d) * 2. - .35) / .65, 0., 1.);
        vec2 off = vec2(7e-4) * m;
        vec3 c = vec3(texture2D(tMap, vUv + off).r, texture2D(tMap, vUv).g, texture2D(tMap, vUv - off).b);
        c += (texture2D(tB1, vUv).rgb + texture2D(tB2, vUv).rgb + texture2D(tB3, vUv).rgb) * .3 * .9;
        c = aces(c);
        c *= smoothstep(.8, .22 * .799, length(d) * (.7 + .22));
        gl_FragColor = vec4(toSrgb(c), 1.);
      }`,
  });
  const pass = (mat, target) => { fsq.material = mat; renderer.setRenderTarget(target); renderer.render(post, bakeCam); };

  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const w = Math.round(W * dpr), h = Math.round(H * dpr);
    mainRT.setSize(w, h);
    levels.forEach((l) => { l.a.setSize(Math.max(1, w / l.d | 0), Math.max(1, h / l.d | 0)); l.b.setSize(Math.max(1, w / l.d | 0), Math.max(1, h / l.d | 0)); });
  };
  resize();
  addEventListener("resize", resize);

  // Critically damped follow (smoothTime in seconds) — same shape as the damp used by the original camera and statue
  const vel = new Map();
  const damp = (obj, key, to, st, dt) => {
    const id = obj; let v = vel.get(id); if (!v) vel.set(id, (v = {}));
    const omega = 2 / Math.max(1e-4, st), x = omega * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const ch = obj[key] - to, tmpV = ((v[key] || 0) + omega * ch) * dt;
    v[key] = ((v[key] || 0) - omega * tmpV) * e;
    obj[key] = to + (ch + tmpV) * e;
  };
  const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(new T.Vector3(0, 0, 1), 0), hit = new T.Vector3(), dir = new T.Vector3(), focus = new T.Vector3();
  const torchPlane = new T.Plane(new T.Vector3(0, 0, 1), -WALL_Z);
  const target = new T.Vector3();
  let frame = 0, last = performance.now();

  const tick = () => {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = reduce ? 0 : gsap.ticker.time;
    update(t);
    // On touch too, follow the last finger position like the original. Reduced motion turns off all cursor reactions
    const still = reduce ? 0 : 1, climb = smooth(range(state.wall, 0, 0.35)), px = state.pointer.x * still, py = state.pointer.y * still;
    // Camera: at the wall section it rises .9 and approaches 1.8, at the ascent and sun sections it pulls back (toward the entrance) 5·16. Sways .35·.2 with the pointer
    const cx = px * 0.35 * still, cy = 0.3 + climb * 0.9 + py * 0.2 * still, cz = 9 - climb * 1.8 + smooth(state.ascent) * 5 + smooth(state.sun) * 16;
    const yaw = look.yaw - px * 0.04 * still, pitch = py * 0.03 * still;
    if (state.snap) { camera.position.set(cx, cy, cz); camera.rotation.set(pitch, yaw, 0); }
    else {
      damp(camera.position, "x", cx, 0.35, dt); damp(camera.position, "y", cy, 0.35, dt); damp(camera.position, "z", cz, 0.35, dt);
      damp(camera.rotation, "y", yaw, 0.3, dt); damp(camera.rotation, "x", pitch, 0.4, dt);
    }
    camera.updateMatrixWorld();
    // Statue: starts at right 1.7 (centered and .75 up on narrow screens), moves toward the center by the swirl amount, and drops 1.4 in the wall section. Rotates 3.4 radians plus pointer.
    const gx = (narrow ? 0 : 1.7) * (1 - look.vortex), gy = -0.3 - climb * 1.4 + (narrow ? 0.75 : 0);
    if (state.snap) group.position.set(gx, gy, 0);
    else { damp(group.position, "x", gx, 0.4, dt); damp(group.position, "y", gy, 0.4, dt); }
    damp(group.rotation, "y", 3.4 + px * 0.12, 0.6, dt);
    group.updateMatrixWorld();

    const su = statueU;
    su.uTime.value = t; su.uPixelRatio.value = dpr; su.uFire.value = look.fire; su.uVortex.value = look.vortex; su.uLight.value = look.light;
    su.uPointerStrength.value = look.pointerStrength * still; damp(su.uHold, "value", state.hold, 0.12, dt); su.uBurst.value = state.burst;
    ndc.set(state.pointer.x, state.pointer.y); ray.setFromCamera(ndc, camera);
    plane.constant = -group.position.z;
    if (ray.ray.intersectPlane(plane, hit)) { group.worldToLocal(hit); const u = su.uPointer.value; damp(u, "x", hit.x, 0.15, dt); damp(u, "y", hit.y, 0.15, dt); damp(u, "z", hit.z, 0.15, dt); }
    camera.getWorldDirection(dir); focus.copy(camera.position).addScaledVector(dir, 4.5); su.uFocus.value.copy(group.worldToLocal(focus));

    if (!baked) { pass(bake.children[0].material, rockRT); baked = true; }
    // The wall isn’t visible when the camera turns past 1.3 radians, so stop drawing it
    if (look.yaw <= 1.3) {
      const wu = wallU;
      wu.uTime.value = t; wu.uFire.value = look.fire;
      fireCam.position.set(5 + Math.sin(t * 2.3) * 0.12 * look.fire, -2 + Math.sin(t * 3.1) * 0.06, 6);
      fireCam.lookAt(-1, 1, WALL_Z); fireCam.updateMatrixWorld();
      wu.uFirePos.value.set(fireCam.position.x, -2.5, 6);
      silBody.matrix.compose(group.position, new T.Quaternion().setFromEuler(new T.Euler(0, 1 + group.rotation.y, 0)), group.scale);
      silBody.matrixWorldNeedsUpdate = true;
      renderer.setRenderTarget(silRT); renderer.render(sil, fireCam);
      wu.uShadowMatrix.value.multiplyMatrices(fireCam.projectionMatrix, fireCam.matrixWorldInverse);
      wu.uShadow.value = 1 - look.vortex;
      if (wordAt !== state.wordIndex) { wordAt = state.wordIndex; paintWord(wordAt); }
      damp(wu.uWordFade, "value", state.wordFade, 0.12, dt);
      if (touch || reduce) ndc.set(Math.sin(t * 0.6) * 0.55, Math.sin(t * 0.9) * 0.25 + 0.1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(torchPlane, target)) { const u = wu.uTorch.value; damp(u, "x", target.x, 0.08, dt); damp(u, "y", target.y, 0.08, dt); }
      damp(wu.uTorchOn, "value", look.torchOn, 0.25, dt);
    }
    backU.uTime.value = t; backU.uLight.value = look.light;
    placePlanes(dt);

    renderer.setRenderTarget(mainRT); renderer.render(scene, camera);
    brightM.uniforms.tMap.value = mainRT.texture; pass(brightM, levels[0].b);
    const blur = (src, dst, w, h) => { blurM.uniforms.tMap.value = src; blurM.uniforms.uDir.value.set(w, h); pass(blurM, dst); };
    levels.forEach((l, i) => {
      const sx = 0.75 / l.a.width, sy = 0.75 / l.a.height;
      if (i) blur(levels[i - 1].a.texture, l.b, sx, 0);
      blur(l.b.texture, l.a, 0, sy); blur(l.a.texture, l.b, sx, 0); blur(l.b.texture, l.a, 0, sy);
    });
    pass(finalM, null);
    if (!frame) ready();
    if (++frame % 10 === 0) window.ph.sound?.mix(look.light);
  };
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); gsap.ticker.remove(tick); fallback(); });
  gsap.ticker.add(tick);
})();
