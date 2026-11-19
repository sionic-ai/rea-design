/* 3D world — original neuroform3d (skull · mask · filter · skeleton models + post-processing) rebuilt with our basic shapes and our own shaders.
   Model files aren’t used: the skull is spheres, torus and boxes, the mask is a hemisphere shell + cylinder filter + headband torus, the skeleton is box spine and torus ribs, matching only the same silhouette proportions.
   One post-processing pass (composite shader) produces the original’s five screen effects — block (loader skull), bloom glow + color split + horizontal drag (hero skull),
   Checker halftone (mask), dot halftone + color split (viewer model), cream flash (dive → X-ray).
   All colors are read from the skin (--kf-*). Shaders are precompiled when the world is built — compiling on the first motion would freeze the screen. */
(() => {
  const T = window.THREE;
  if (!T) return;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const color = (n, k = 1) => new T.Color().setStyle(css(n) || "gray").multiplyScalar(k);

  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  /* ---- Material ---- */
  function boneMat() {
    return new T.MeshStandardMaterial({ color: color("--kf-ink"), roughness: 0.55, metalness: 0.0 });
  }
  function voidMat() { return new T.MeshStandardMaterial({ color: color("--kf-line", 0.45), roughness: 0.9 }); }
  /* X-ray: translucent with only the edges glowing (Fresnel). Changing ink gives a dark line like the Footer */
  function xrayMat(ink, power = 1.6, alpha = 1, blending = T.AdditiveBlending) {
    return new T.ShaderMaterial({
      uniforms: { uInk: { value: ink }, uPow: { value: power }, uAlpha: { value: alpha } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uInk; uniform float uPow; uniform float uAlpha; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), uPow); gl_FragColor = vec4(uInk * f, f * uAlpha); }`,
      transparent: true, depthWrite: false, side: T.DoubleSide, blending,
    });
  }

  /* ---- Skull: cranium (sphere) · face (flattened sphere) · cheekbone (small sphere) · jaw (half torus) · teeth (row of boxes) · eye sockets · nose hole (dark sphere · cone) ---- */
  function skull(mat) {
    const g = new T.Group();
    const m = mat || boneMat();
    const add = (geo, x, y, z, sx = 1, sy = 1, sz = 1, mm = m) => { const o = new T.Mesh(geo, mm); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o; };
    const sph = new T.SphereGeometry(1, 48, 32);
    add(sph, 0, 0.3, -0.12, 0.84, 0.9, 1.02);
    add(sph, 0, -0.3, 0.34, 0.66, 0.5, 0.52);
    add(sph, 0.5, -0.2, 0.38, 0.17, 0.13, 0.26);
    add(sph, -0.5, -0.2, 0.38, 0.17, 0.13, 0.26);
    add(sph, 0, -0.62, 0.42, 0.42, 0.14, 0.4);
    const jaw = add(new T.TorusGeometry(0.4, 0.11, 14, 40, Math.PI), 0, -0.86, 0.3, 1.0, 0.95, 1.05);
    jaw.rotation.set(Math.PI / 2 + 0.3, 0, Math.PI);
    add(sph, 0, -1.0, 0.56, 0.32, 0.12, 0.16);
    const tooth = new T.BoxGeometry(0.07, 0.13, 0.07);
    for (let i = 0; i < 12; i++) {
      const a = (i / 11 - 0.5) * 1.7;
      const t1 = add(tooth, Math.sin(a) * 0.36, -0.7, 0.42 + Math.cos(a) * 0.38); t1.rotation.y = a;
      const t2 = add(tooth, Math.sin(a) * 0.34, -0.84, 0.4 + Math.cos(a) * 0.36); t2.rotation.y = a;
    }
    const dark = mat ? null : voidMat();
    if (dark) {
      add(sph, 0.27, -0.01, 0.8, 0.17, 0.15, 0.1, dark);
      add(sph, -0.27, -0.01, 0.8, 0.17, 0.15, 0.1, dark);
      const nose = add(new T.ConeGeometry(0.1, 0.24, 3), 0, -0.34, 0.84, 1, 1, 0.45, dark); nose.rotation.x = Math.PI;
      add(sph, 0, -0.7, 0.6, 0.36, 0.035, 0.12, dark);
    }
    return g;
  }

  /* ---- Mask: forward-bulging shell + cylinder filter on both cheeks + strap torus over the head and side loops ---- */
  function mask() {
    const g = new T.Group();
    const shellM = new T.MeshStandardMaterial({ color: color("--kf-surface"), emissive: color("--kf-surface", 0.18), roughness: 0.75 });
    const filterM = new T.MeshStandardMaterial({ color: color("--kf-line", 0.55), roughness: 0.35, metalness: 0.2 });
    const strapM = new T.MeshStandardMaterial({ color: color("--kf-raised"), roughness: 0.4, metalness: 0.3 });
    const shell = new T.Mesh(new T.SphereGeometry(1, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.56), shellM);
    shell.rotation.x = Math.PI / 2; shell.scale.set(1.12, 0.62, 0.95); shell.position.set(0, -0.15, 0);
    g.add(shell);
    [-1, 1].forEach((s) => {
      const f = new T.Mesh(new T.CylinderGeometry(0.36, 0.36, 0.2, 48), filterM);
      f.rotation.set(Math.PI / 2, 0, s * -0.55); f.position.set(s * 0.68, -0.38, 0.42);
      f.rotation.order = "ZXY"; f.rotation.y = s * 0.7;
      g.add(f);
      const rim = new T.Mesh(new T.TorusGeometry(0.37, 0.025, 8, 48), strapM);
      rim.position.copy(f.position); rim.rotation.set(0, s * 0.62, 0); g.add(rim);
      const clip = new T.Mesh(new T.BoxGeometry(0.1, 0.42, 0.22), strapM);
      clip.position.set(s * 1.08, 0.15, -0.25); g.add(clip);
    });
    const strap = new T.Mesh(new T.TorusGeometry(1.08, 0.075, 12, 80, Math.PI), strapM);
    strap.position.set(0, 0.15, -0.3); strap.scale.set(1, 1.05, 1); g.add(strap);
    const inner = new T.Mesh(new T.TorusGeometry(1.0, 0.03, 8, 80, Math.PI), filterM);
    inner.position.set(0, 0.15, -0.28); g.add(inner);
    return g;
  }

  /* ---- Viewer model set (thumbs 1·2·3): mask · mask with strap · two filter canisters ---- */
  function canisters() {
    const g = new T.Group();
    const m = new T.MeshStandardMaterial({ color: color("--kf-surface"), roughness: 0.6 });
    const d = new T.MeshStandardMaterial({ color: color("--kf-line", 0.5), roughness: 0.4 });
    [[-0.55, 0.9], [0.6, 1.0]].forEach(([x, r]) => {
      const c = new T.Mesh(new T.CylinderGeometry(r, r, 0.55, 48), m); c.rotation.x = Math.PI / 2; c.position.x = x; g.add(c);
      const f = new T.Mesh(new T.CylinderGeometry(r * 0.78, r * 0.78, 0.6, 48), d); f.rotation.x = Math.PI / 2; f.position.set(x, 0, 0.02); g.add(f);
    });
    return g;
  }

  /* ---- Three filter discs (filter layers) — ring border + thin mesh ---- */
  function filters() {
    const g = new T.Group();
    const body = new T.MeshStandardMaterial({ color: color("--kf-line", 0.28), roughness: 0.3, metalness: 0.4 });
    const rimM = new T.MeshBasicMaterial({ color: color("--kf-ink") });
    const mesh = new T.MeshBasicMaterial({ color: color("--kf-line"), wireframe: true, transparent: true, opacity: 0.35 });
    const discs = [];
    for (let i = 0; i < 3; i++) {
      const d = new T.Group();
      const c = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 0.32, 64, 1, true), body); c.rotation.z = Math.PI / 2; d.add(c);
      [-0.16, 0.16].forEach((x) => { const r = new T.Mesh(new T.TorusGeometry(1.25, 0.012, 6, 96), rimM); r.rotation.y = Math.PI / 2; r.position.x = x; d.add(r); });
      [-0.15, 0.15].forEach((x) => { const face = new T.Mesh(new T.CircleGeometry(1.24, 64), body); face.rotation.y = Math.PI / 2; face.position.x = x; face.material.side = T.DoubleSide; d.add(face); const net = new T.Mesh(new T.CircleGeometry(1.22, 24), mesh); net.rotation.y = Math.PI / 2; net.position.x = x * 1.05; d.add(net); });
      g.add(d); discs.push(d);
    }
    g.userData.discs = discs;
    return g;
  }

  /* ---- Airflow: right (dust·pollen·gas — red·orange·white) → disc → left (clean air — teal). 1400 line segments are moved every frame ---- */
  function streams(n = 1400) {
    const r = rng(7);
    const pos = new Float32Array(n * 6), col = new Float32Array(n * 6);
    const L = []; const teal = color("--kf-success").lerp(new T.Color(0.02, 0.45, 0.42), 0.85);
    const dirty = [color("--kf-accent"), color("--kf-accent").lerp(color("--kf-ink"), 0.35), color("--kf-ink"), color("--kf-accent-soft")];
    for (let i = 0; i < n; i++) L.push({ x: r() * 18 - 9, a: r() * Math.PI * 2, rr: Math.sqrt(r()), sp: 1.6 + r() * 2.2, len: 0.2 + r() * 0.6, c: dirty[(r() * 4) | 0] });
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const lines = new T.LineSegments(geo, new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false }));
    const funnel = (x) => 0.35 + 0.95 * Math.min(1, Math.abs(x) / 5) + (x > 0 ? 0.6 * Math.min(1, x / 7) : 0);
    lines.userData.step = (dt, gap) => {
      for (let i = 0; i < n; i++) {
        const s = L[i];
        s.x -= s.sp * dt; if (s.x < -9) s.x += 18;
        const R = funnel(s.x) * s.rr * (1 + gap * 0.15), y = Math.sin(s.a) * R, z = Math.cos(s.a) * R;
        const x2 = s.x + s.len, R2 = funnel(x2) * s.rr * (1 + gap * 0.15);
        pos.set([s.x, y, z, x2, Math.sin(s.a) * R2, Math.cos(s.a) * R2], i * 6);
        const c = s.x < -0.4 * (1 + gap) ? teal : s.c;
        col.set([c.r * 0.25, c.g * 0.25, c.b * 0.25, c.r, c.g, c.b], i * 6);
      }
      geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
    };
    return lines;
  }

  /* ---- Hyperspace streaks: radial lines flying toward the camera ---- */
  function warp(n = 700) {
    const r = rng(11);
    const pos = new Float32Array(n * 6), col = new Float32Array(n * 6), S = [];
    const pal = [color("--kf-accent"), color("--kf-accent"), color("--kf-ink"), color("--kf-ink"), color("--kf-success").lerp(new T.Color(0.02, 0.45, 0.42), 0.85), color("--kf-accent").lerp(color("--kf-ink"), 0.5), color("--kf-accent").lerp(color("--kf-ink"), 0.5)];
    for (let i = 0; i < n; i++) S.push({ a: r() * Math.PI * 2, rad: 0.6 + r() * 7, z: -r() * 80, c: pal[(r() * pal.length) | 0] });
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const lines = new T.LineSegments(geo, new T.LineBasicMaterial({ vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    lines.userData.step = (dt, speed) => {
      for (let i = 0; i < n; i++) {
        const s = S[i];
        s.z += speed * dt * 40; if (s.z > 2) s.z -= 82;
        const x = Math.cos(s.a) * s.rad, y = Math.sin(s.a) * s.rad, tail = 1.5 + speed * 9;
        pos.set([x, y, s.z, x, y, s.z - tail], i * 6);
        const k = Math.min(1, (s.z + 80) / 60);
        col.set([s.c.r * k, s.c.g * k, s.c.b * k, 0, 0, 0], i * 6);
      }
      geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
    };
    return lines;
  }

  /* ---- Skeleton (X-ray): 24 spine boxes · 11 pairs of rib rings · shoulder blades · pelvis ring · limb cylinders · skull ---- */
  function skeleton(mat) {
    const g = new T.Group();
    const m = mat;
    const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); g.add(o); return o; };
    const vert = new T.BoxGeometry(0.16, 0.09, 0.14);
    for (let i = 0; i < 24; i++) add(vert, 0, 1.55 - i * 0.12, -0.05 * Math.sin(i / 23 * Math.PI), 0, 0, 0, 1 + i * 0.02, 1, 1);
    const rib = new T.TorusGeometry(0.5, 0.022, 6, 40, Math.PI * 0.85);
    for (let i = 0; i < 11; i++) {
      const w = 0.62 + Math.sin(Math.min(1, i / 6) * Math.PI / 2) * 0.38 - (i > 7 ? (i - 7) * 0.08 : 0);
      [-1, 1].forEach((s) => add(rib, 0, 1.3 - i * 0.1, 0.05, Math.PI / 2 + 0.35, 0, s > 0 ? -0.2 : Math.PI + 0.2, w, w * 0.85, 1));
    }
    const blade = new T.SphereGeometry(0.28, 20, 12);
    [-1, 1].forEach((s) => add(blade, s * 0.36, 1.2, -0.22, 0.2, s * 0.3, 0, 1, 1.35, 0.25));
    const bar = new T.CylinderGeometry(0.035, 0.03, 1, 10);
    [-1, 1].forEach((s) => {
      add(bar, s * 0.42, 1.48, 0.05, 0, 0, s * 1.35, 1, 0.75, 1);
      add(bar, s * 0.92, 0.95, 0, 0, 0, s * 0.2, 1, 1.05, 1);
      add(bar, s * 1.08, 0.05, 0.08, 0, 0, s * 0.1, 1, 0.95, 1);
      add(bar, s * 1.0, 0.07, 0.0, 0, 0, s * 0.12, 0.8, 0.95, 0.8);
      add(bar, s * 0.26, -1.35, 0, 0, 0, s * -0.06, 1.5, 1.45, 1.5);
    });
    add(new T.TorusGeometry(0.42, 0.09, 10, 40), 0, -0.55, 0, Math.PI / 2 - 0.4, 0, 0, 1.1, 0.75, 1);
    const head = skull(m); head.scale.setScalar(0.32); head.position.set(0, 1.95, 0.05); g.add(head);
    return g;
  }

  /* ---- composite shader ---- */
  const COMPOSE = `
    uniform sampler2D tMain; uniform sampler2D tView; uniform vec2 uRes; uniform float uTime;
    uniform float uPix; uniform float uGlow; uniform float uAberr; uniform float uSmear; uniform float uHalf; uniform float uCell;
    uniform vec4 uViewRect; uniform float uViewOn; uniform float uViewPix; uniform float uFlash; uniform vec3 uInk; uniform vec3 uTint; uniform float uFade;
    varying vec2 vUv;
    float h1(float x){ return fract(sin(x * 91.3458) * 47453.5453); }
    vec4 tapMain(vec2 uv){ return texture2D(tMain, uv); }
    void main(){
      vec2 fc = gl_FragCoord.xy;
      vec2 uv = vUv;
      if (uPix > 1.) uv = (floor(fc / uPix) + .5) * uPix / uRes;
      float band = floor(fc.y / 14.);
      float sm = uSmear * step(.9, h1(band + floor(uTime * 9.))) * (h1(band * 3.1) - .5) * 60. / uRes.x;
      vec2 o = vec2(uAberr / uRes.x, 0.);
      vec4 c = tapMain(uv + vec2(sm, 0.));
      float r = tapMain(uv + vec2(sm, 0.) + o).r, b = tapMain(uv + vec2(sm, 0.) - o).b;
      c.rgb = vec3(r, c.g, b);
      if (uGlow > 0.) {
        vec4 acc = vec4(0.);
        for (int i = 0; i < 10; i++) { float a = float(i) * .6283 + .3; for (int k = 1; k < 3; k++) { vec2 d = vec2(cos(a), sin(a)) * float(k) * 13.5 / uRes; acc += tapMain(uv + d * (1. + uGlow)); } }
        acc /= 20.;
        vec3 halo = uTint * acc.a * 2.2;
        float ra = tapMain(uv + o * 8.).a, ba = tapMain(uv - o * 8.).a;
        halo += vec3(ra * .35, 0., ba * .45) * uGlow;
        c.rgb += halo * uGlow * (1. - c.a);
        c.a = max(c.a, acc.a * uGlow * .9);
      }
      if (uHalf > 0.) {
        float ch = mod(floor(fc.x / uCell) + floor(fc.y / uCell), 2.);
        c.rgb *= mix(1., .35 + ch * 1.15, uHalf);
      }
      c *= uFade;
      if (uViewOn > 0. && fc.x > uViewRect.x && fc.x < uViewRect.x + uViewRect.z && fc.y > uViewRect.y && fc.y < uViewRect.y + uViewRect.w) {
        float cell = max(uViewPix, 4.);
        vec2 cc = (floor(fc / cell) + .5) * cell;
        vec2 vuv = (cc - uViewRect.xy) / uViewRect.zw;
        vec2 vo = vec2(4. / uViewRect.z, 0.);
        vec4 vm = texture2D(tView, vuv);
        float vr = texture2D(tView, vuv + vo).r, vb = texture2D(tView, vuv - vo).b;
        float lum = dot(vec3(vr, vm.g, vb), vec3(.3, .59, .11));
        float d = length(fc - cc) / (cell * .5);
        float dotm = step(d, .35 + lum * .75) * vm.a;
        vec3 vc = vec3(vr, vm.g, vb) * 1.15;
        c.rgb = mix(c.rgb, vc, dotm * uViewOn);
        c.a = max(c.a, dotm * uViewOn);
      }
      c.rgb = mix(c.rgb, uInk, uFlash); c.a = max(c.a, uFlash);
      gl_FragColor = c;
      #include <colorspace_fragment>
    }`;

  /* ---- World ---- */
  function create(canvas, opt = {}) {
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), view = new T.Scene();
    const cam = new T.PerspectiveCamera(30, 1, 0.1, 200); cam.position.set(0, 0, 8);
    const vcam = new T.PerspectiveCamera(30, 1, 0.1, 50); vcam.position.set(0, 0, 6);
    [scene, view].forEach((s) => {
      s.add(new T.HemisphereLight(color("--kf-ink"), color("--kf-line", 0.4), 0.85));
      const d = new T.DirectionalLight(color("--kf-ink"), 1.5); d.position.set(2, 3, 4); s.add(d);
      const b = new T.DirectionalLight(color("--kf-accent-soft"), 0.6); b.position.set(-3, -1, -2); s.add(b);
    });
    const opts = { type: T.HalfFloatType };
    const rtMain = new T.WebGLRenderTarget(4, 4, opts), rtView = new T.WebGLRenderTarget(4, 4, opts);
    const U = {
      tMain: { value: rtMain.texture }, tView: { value: rtView.texture }, uRes: { value: new T.Vector2(1, 1) }, uTime: { value: 0 },
      uPix: { value: 0 }, uGlow: { value: 0 }, uAberr: { value: 0 }, uSmear: { value: 0 }, uHalf: { value: 0 }, uCell: { value: 3 },
      uViewRect: { value: new T.Vector4() }, uViewOn: { value: 0 }, uViewPix: { value: 5 }, uFlash: { value: 0 },
      uInk: { value: color("--kf-ink") }, uTint: { value: color("--kf-ink").lerp(color("--kf-success"), 0.28) }, uFade: { value: 1 },
    };
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
      uniforms: U, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: COMPOSE,
    }));
    const post = new T.Scene(); post.add(quad);
    const ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let W = 1, H = 1;
    function size() {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      const pr = renderer.getPixelRatio();
      rtMain.setSize(W * pr, H * pr);
      U.uRes.value.set(W * pr, H * pr);
      cam.aspect = W / H; cam.updateProjectionMatrix();
    }
    size();
    new ResizeObserver(size).observe(canvas);
    function setView(rect) {
      const pr = renderer.getPixelRatio();
      if (!rect) { U.uViewOn.value = 0; return; }
      const vw = Math.max(1, rect.width), vh = Math.max(1, rect.height);
      if (rtView.width !== Math.round(vw * pr)) rtView.setSize(vw * pr, vh * pr);
      vcam.aspect = vw / vh; vcam.updateProjectionMatrix();
      U.uViewRect.value.set(rect.left * pr, (H - rect.top - vh) * pr, vw * pr, vh * pr);
    }
    function render(t) {
      U.uTime.value = t;
      renderer.setRenderTarget(rtMain); renderer.clear(); renderer.render(scene, cam);
      if (U.uViewOn.value > 0) { renderer.setRenderTarget(rtView); renderer.clear(); renderer.render(view, vcam); }
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(post, ortho);
    }
    /* Find the world x so it lands at screen x (0..1) and depth z — like the original, put the Hero skull at the center of the left panel */
    function worldX(fx, z = 0) {
      const d = cam.position.z - z, hh = Math.tan(T.MathUtils.degToRad(cam.fov / 2)) * d;
      return (fx * 2 - 1) * hh * cam.aspect;
    }
    function worldY(fy, z = 0) {
      const d = cam.position.z - z, hh = Math.tan(T.MathUtils.degToRad(cam.fov / 2)) * d;
      return (1 - fy * 2) * hh;
    }
    function warm() { renderer.compile(scene, cam); renderer.compile(view, vcam); renderer.compile(post, ortho); }
    return { T, renderer, scene, view, cam, vcam, U, render, setView, size, worldX, worldY, warm, get W() { return W; }, get H() { return H; } };
  }

  window.NFWorld = { T, create, skull, mask, canisters, filters, streams, warp, skeleton, xrayMat, boneMat, color };
})();
