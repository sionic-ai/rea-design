// 3D, two kinds (the original also draws only these two with three.js r171): orbit view (8 rings with cards spinning, flowing up and down on wheel) and a chrome blackletter Y.
// The Y is a shape extruded from an outline we drew by hand, and the reflection is our shader (chrome reflecting a sky with several horizontal bands + bright areas in the skin’s ink color).
// Original values: 8 rings · 6 cards per ring · gap 1.6 · radius 2.05 · card width 1.25 (360:224) · bend .06 · fov 55 · camera 3.82 (1440) to 6.5 (375) · look down .25,
// Drift .00025 + ring speed (−1 to 1)×.0025 (min .0007) per frame, wheel .556 · step .011 · follow .075 · speed .18 · bend .00675 · spin .00016875 · unit 2.15/21,
// Hover lift 1.4 units (.12) · scale .05, mouse x .2 · y .1 · .08 damping · move 1.25 · head tilt .45, Y height 2.2032×.45 · y −.2+.058 · spin ×1.6
(() => {
  const T = window.THREE;
  if (!T) return;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const be = (a, b, t, n) => a + (b - a) * -Math.expm1(Math.log(1 - t) * n);
  const damp = (a, b, t, dt) => a + (b - a) * (1 - Math.exp(-t * 0.05 * dt));
  const RINGS = { fov: 55, rings: 8, perRing: 6, gap: 1.6, radius: 2.05, angleJitter: 0.1, cardW: 1.25, aspect: 360 / 224, curve: 0.06, segments: 15,
    drift: 0.00025, driftSpeed: 0.0025, minDrift: 0.0007, camera: { w0: 375, r0: 6.5, w1: 1440, r1: 3.82 }, lookDown: 0.25, pullBack: 5,
    mouse: { x: 0.2, y: 0.1, damp: 0.08, shift: 1.25, turn: 0.45 }, logo: { y: -0.2, height: 2.2032 * 0.45, centre: 0.058, turn: 1.6 } };
  const MOTION = { wheel: 0.556, step: 0.011, follow: 0.075, speed: 0.18, bend: 0.00675, spin: 0.00016875, touch: 3, unit: 2.15 / 21, fade: 0.6, fadeFrom: -10, fadeTo: 0, lift: 1.4, liftEase: 0.12, zoom: 0.05 };

  // ---------- Y: our outline (height 100) — thick left arm and thin right arm, with a serif at each end ----------
  function yShape() {
    const s = new T.Shape();
    s.moveTo(-50, 100); s.lineTo(-12, 100); s.lineTo(-12, 96.5); s.quadraticCurveTo(-20, 96, -16, 90);
    s.lineTo(6, 52); s.lineTo(30, 90); s.quadraticCurveTo(34, 96, 26, 96.5); s.lineTo(26, 100);
    s.lineTo(54, 100); s.lineTo(54, 96.5); s.quadraticCurveTo(46, 96, 41, 89);
    s.lineTo(13, 40); s.lineTo(13, 9); s.quadraticCurveTo(14, 3.5, 26, 3.5); s.lineTo(26, 0);
    s.lineTo(-26, 0); s.lineTo(-26, 3.5); s.quadraticCurveTo(-13, 3.5, -12, 9);
    s.lineTo(-12, 40); s.lineTo(-34, 89); s.quadraticCurveTo(-40, 96, -50, 96.5); s.closePath();
    return s;
  }
  const Y_VERT = `
    varying vec3 vN; varying vec3 vW; varying vec3 vL;
    void main() {
      vL = position;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vW = w.xyz;
      vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  // Sky: bands with different top and bottom brightness per azimuth (our layout), blended within ±3° of the horizon. Fresnel F0 .6, grain .12, brightness .45~.85 in ink color
  const Y_FRAG = `
    uniform float uOpacity; uniform vec3 uGreen; uniform float uTurn;
    varying vec3 vN; varying vec3 vW; varying vec3 vL;
    float band(float a, float c, float w) { float d = abs(fract(a - c + 0.5) - 0.5); return exp(-(d * d) / (w * w)); }
    float top(float a) { return 0.04 + 1.0 * band(a, 0.05, 0.03) + 0.8 * band(a, 0.37, 0.045) + 0.5 * band(a, 0.62, 0.02) + 0.3 * band(a, 0.8, 0.07); }
    float bottom(float a) { return 0.03 + 0.45 * band(a, 0.2, 0.06) + 0.2 * band(a, 0.55, 0.1); }
    float h3(vec3 p) { p = fract(p * 0.3183 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float vn(vec3 p) {
      vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y),
                 mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
    }
    void main() {
      vec3 N = normalize(vN), V = normalize(cameraPosition - vW), R = reflect(-V, N);
      float c = cos(uTurn), s = sin(uTurn);
      R = vec3(R.x * c - R.z * s, R.y, R.x * s + R.z * c);
      float a = fract(atan(-R.x, R.z) / 6.28318530718);
      float e = degrees(asin(clamp(R.y, -1.0, 1.0)));
      float light = mix(bottom(a), top(a), smoothstep(-3.0, 3.0, e)) * 1.15 / 0.6;
      light *= 1.0 + 0.12 * (vn(vL * 90.0) - 0.5) * 2.0;
      float F = 0.6 + 0.4 * pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 5.0);
      float v = pow(clamp(F * light, 0.0, 1.0), 1.0 / 2.2);
      gl_FragColor = vec4(mix(vec3(v), uGreen * min(v / 0.85, 1.0), smoothstep(0.45, 0.85, v)), uOpacity);
    }`;
  // The shader outputs color as is, so skin colors are also passed as sRGB values (THREE.Color converts to linear and darkens them)
  const srgb = (name) => { const h = window.H.cssColor(name); return new T.Vector3(...[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)); };
  // Y with height 1 and the center as origin. Thickness 10.02, corner .72 (12 steps) — original proportions
  function yMesh() {
    const geo = new T.ExtrudeGeometry(yShape(), { depth: 10.02, bevelEnabled: true, bevelThickness: 0.72, bevelSize: 0.72, bevelSegments: 12, curveSegments: 24 });
    geo.center();
    geo.scale(0.01, 0.01, 0.01);
    const mat = new T.ShaderMaterial({ vertexShader: Y_VERT, fragmentShader: Y_FRAG, transparent: true, uniforms: { uOpacity: { value: 1 }, uGreen: { value: srgb("--kf-ink") }, uTurn: { value: 0 } } });
    return new T.Mesh(geo, mat);
  }

  // ---------- About page Y: one turn per 5.05s, faster by scroll speed ×.007 (follows in .05s), and on enter it spins two turns over 2s while going 0→1 ----------
  class Y3D {
    constructor(canvas) {
      this.canvas = canvas;
      this.renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(10, 1, 0.1, 100);
      this.group = new T.Group();
      this.mesh = yMesh();
      this.group.add(this.mesh);
      this.scene.add(this.group);
      this.intro = { scale: 0, turn: 0 };
      this.angle = 0; this.speed = TAU / 5.05; this.way = 1; this.last = null; this.scroll = null;
      this.resize();
      addEventListener("resize", () => this.resize());
    }
    resize() {
      const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      const distance = 4.7;
      this.camera.aspect = w / h;
      // In the original capture, Y is about 63% of the 580px panel height — set it so 1/.63 units fit in the screen height
      this.camera.fov = (2 * Math.atan(1.59 / 2 / distance) * 180) / Math.PI;
      this.camera.position.set(0, 0, distance);
      this.camera.updateProjectionMatrix();
    }
    show(instant) {
      if (instant) return Object.assign(this.intro, { scale: 1, turn: 0 });
      this.angle += this.intro.turn;
      gsap.fromTo(this.intro, { scale: 0, turn: 0 }, { scale: 1, turn: this.way * 2 * TAU, duration: 2, ease: window.H?.o6 || "expo.out", overwrite: true });
    }
    update(now, scroll) {
      const dt = this.last === null ? 0 : Math.min(now - this.last, 100) / 1000;
      this.last = now;
      const v = this.scroll === null || dt === 0 ? 0 : (scroll - this.scroll) / dt;
      this.scroll = scroll;
      if (v !== 0) this.way = Math.sign(v);
      if (!window.H?.reduce) {
        const target = this.way * (TAU / 5.05 + Math.abs(v) * 0.007);
        this.speed += (target - this.speed) * (1 - Math.exp(-dt / 0.05));
        this.angle += this.speed * dt;
      }
      this.group.rotation.y = this.angle + this.intro.turn;
      this.group.scale.setScalar(this.intro.scale);
      this.canvas.style.transform = `translate3d(0, ${-scroll}px, 0)`;
      if (this.canvas.offsetTop + this.canvas.offsetHeight - scroll <= 0) return;
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ---------- Orbit ----------
  // Card board: bends horizontally along a ring (center outward), and by speed the vertical center is pushed sideways (uBend)
  const CARD_VERT = `
    uniform float uBend; varying vec2 vUv;
    void main() { vUv = uv; vec3 p = position; p.x += sin(uv.y * 3.14159) * uBend; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
  const CARD_FRAG = `
    uniform sampler2D uMap; uniform float uAlpha; uniform float uHover; uniform vec2 uCover; uniform vec3 uOverlayColor; uniform float uOverlay;
    varying vec2 vUv;
    void main() {
      vec2 uv = (vUv - 0.5) * uCover * (1.0 - uHover) + 0.5;
      vec3 c = texture2D(uMap, uv).rgb;
      gl_FragColor = vec4(mix(c, uOverlayColor, uOverlay), uAlpha);
    }`;
  function curvedPlane(w, h, sag, seg) {
    const g = new T.PlaneGeometry(w, h, seg, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (w / 2); p.setZ(i, -sag * u * u); }
    g.computeVertexNormals();
    return g;
  }
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  class Orbit {
    // works: [{ source, w, h, isVideo }] inner ring works · pictures: outer ring photos
    constructor(canvas, works, pictures) {
      this.canvas = canvas;
      this.renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
      this.scene = new T.Scene();
      this.cam = new T.PerspectiveCamera(RINGS.fov, 1, 0.1, 100);
      this.camBase = new T.Object3D();
      this.camBase.add(this.cam);
      this.scene.add(this.camBase);
      this.shift = new T.Group(); this.spin = new T.Group();
      this.scene.add(this.shift); this.shift.add(this.spin);
      this.bend = { value: 0 };
      this.overlayColor = { value: srgb("--kf-bg") };
      this.T = 0; this.k = 0; this.O = 0; this.P = 0; this.M = 0; this.j = 0; this.lastY = 0; this.pull = 0;
      this.mx = 0; this.my = 0; this.pointer = null; this.hovered = null; this.alpha = 0; this.last = null;
      this.raycaster = new T.Raycaster();
      this.textures = new Map();
      this.build(works, pictures);
      this.logoTurn = new T.Group();
      this.logo = yMesh();
      this.logo.scale.setScalar(RINGS.logo.height);
      this.logoTurn.add(this.logo);
      this.logoTurn.position.y = RINGS.logo.y + RINGS.logo.centre;
      this.scene.add(this.logoTurn);
      this.lastSpin = 0;
      this.morph = -Math.PI;
      addEventListener("mousemove", (e) => (this.pointer = { x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 }));
    }
    tex(item) {
      if (this.textures.has(item)) return this.textures.get(item);
      const video = item.media?.tagName === "VIDEO" && location.protocol !== "file:" ? item.media : null;
      const t = video ? new T.VideoTexture(video) : new T.CanvasTexture(item.source);
      this.textures.set(item, t);
      return t;
    }
    build(works, pictures) {
      const rand = rng(7);
      const between = (a, b) => a + rand() * (b - a);
      this.rings = []; this.cards = [];
      const count = works.length;
      for (let r = 0; r < RINGS.rings; r++) {
        const middle = r === Math.floor(RINGS.rings / 2);
        const ring = { y: (r - Math.floor(RINGS.rings / 2)) * RINGS.gap, speed: between(-1, 1), middle, cards: [] };
        this.rings.push(ring);
        const n = middle ? count : RINGS.perRing;
        for (let i = 0; i < n; i++) {
          const item = middle ? works[i] : pictures[(r * RINGS.perRing + i) % pictures.length] || works[i % count];
          const w = RINGS.cardW, h = w / RINGS.aspect;
          const ta = (item.w || 1) / (item.h || 1);
          const cover = ta >= RINGS.aspect ? [RINGS.aspect / ta, 1] : [1, ta / RINGS.aspect];
          const uniforms = { uMap: { value: this.tex(item) }, uAlpha: { value: 0 }, uBend: this.bend, uHover: { value: 0 }, uCover: { value: new T.Vector2(...cover) }, uOverlayColor: this.overlayColor, uOverlay: { value: middle ? 0 : 0.15 } };
          const mesh = new T.Mesh(curvedPlane(w, h, RINGS.radius * RINGS.curve, RINGS.segments), new T.ShaderMaterial({ uniforms, vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, transparent: true, side: T.DoubleSide, depthWrite: false }));
          mesh.frustumCulled = false;
          const jitter = between(-RINGS.angleJitter, RINGS.angleJitter);
          const card = { work: middle ? i : -1, ring, mesh, uniforms, radius: RINGS.radius, angle: (middle ? (-i * TAU) / count : i) + jitter, dy: -w / 2, lift: 0 };
          mesh.userData.card = card;
          ring.cards.push(card); this.cards.push(card);
          (middle ? this.spin : this.shift).add(mesh);
        }
      }
      this.meshes = this.cards.map((c) => c.mesh);
    }
    // Rotates the center ring so the current work faces front (+x toward the camera)
    face(index) {
      const c = this.rings.find((r) => r.middle).cards[index];
      this.spin.rotation.y = c ? c.angle : 0;
      this.lastSpin = this.spin.rotation.y;
      this.T = this.k = this.O = this.P = this.M = this.j = 0;
      this.rings.forEach((r, i) => (r.y = (i - Math.floor(RINGS.rings / 2)) * RINGS.gap));
    }
    front() {
      const mid = this.rings.find((r) => r.middle);
      let best = 0, bestCos = -2;
      mid.cards.forEach((c, i) => { const a = c.angle - this.spin.rotation.y; if (Math.cos(a) > bestCos) { bestCos = Math.cos(a); best = i; } });
      return best;
    }
    wheel(dy) { this.T += MOTION.wheel * dy; }
    touch(dy) { this.T += MOTION.wheel * dy * MOTION.touch; }
    hoveredWork() { return this.hovered && this.hovered.work >= 0 ? this.hovered.work : -1; }
    // The rectangle the card occupied on screen when the work opens — the photo starts from there
    rectOf(work) {
      const c = this.rings.find((r) => r.middle).cards[work];
      if (!c) return null;
      const box = new T.Box3().setFromObject(c.mesh), v = new T.Vector3();
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        v.set(x, y, z).project(this.cam);
        const sx = ((v.x + 1) / 2) * innerWidth, sy = ((1 - v.y) / 2) * innerHeight;
        x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
      }
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    render(alpha, morph, now, enabled) {
      const dt = this.last === null ? 16.7 : Math.min(now - this.last, 100);
      this.last = now;
      const n = Math.min(dt / (1000 / 60), 4);
      const W = innerWidth, Hh = innerHeight;
      const pr = Math.min(devicePixelRatio || 1, 2);
      if (this.canvas.width !== Math.round(W * pr) || this.canvas.height !== Math.round(Hh * pr)) { this.renderer.setPixelRatio(pr); this.renderer.setSize(W, Hh, false); }
      if (this.cam.aspect !== W / Hh) { this.cam.aspect = W / Hh; this.cam.updateProjectionMatrix(); }

      if (this.T) { this.k += MOTION.step * this.T; this.P += this.T; this.T = 0; }
      this.O = be(this.O, this.k, MOTION.follow, n);
      this.M = be(this.M, this.P, MOTION.speed, n);
      this.j = be(this.j, this.P - this.M, MOTION.speed, n);
      this.bend.value = clamp(MOTION.bend * this.j, -1, 1) * MOTION.unit;
      this.spin.rotation.y -= MOTION.spin * this.j * n;
      const y = this.O * MOTION.unit;
      const loop = this.rings.length * RINGS.gap;
      this.shift.position.y = y;
      this.pull = (Math.abs(y - this.lastY) / Math.max(n, 1e-3)) * RINGS.pullBack;
      this.lastY = y;
      this.rings.forEach((ring) => { const s = ring.y + y; if (s < -loop / 2) ring.y += loop; else if (s > loop / 2) ring.y -= loop; });

      // Drifts per ring, cards sit around the ring (outward by the lifted amount) and face the center
      this.rings.forEach((ring) => {
        let drift = RINGS.drift + ring.speed * RINGS.driftSpeed;
        if (Math.abs(drift) < RINGS.minDrift) drift = Math.sign(drift || 1) * RINGS.minDrift;
        ring.cards.forEach((c) => {
          c.angle += drift * n;
          const r = c.radius + c.lift * MOTION.lift * MOTION.unit;
          const px = r * Math.cos(c.angle), pz = r * Math.sin(c.angle);
          c.mesh.position.set(px, (ring.middle ? 0 : ring.y) + c.dy, pz);
          c.mesh.rotation.set(0, Math.atan2(px, pz), 0);
        });
      });
      const mid = this.rings.find((r) => r.middle);
      this.spin.position.y = mid.y;

      // Camera: distance 3.82~6.5 depending on screen width + backs off by the wheel speed (and 5 more during a view switch), moves with the mouse and turns its head
      const { w0, r0, w1, r1 } = RINGS.camera;
      const radius = r0 + (r1 - r0) * clamp((W - w0) / (w1 - w0), 0, 1) + this.pull + (1 - alpha) * RINGS.pullBack;
      this.camBase.position.set(radius, 0, 0);
      this.camBase.lookAt(0, -RINGS.lookDown, 0);
      const p = this.pointer || { x: 0, y: 0 }, mo = RINGS.mouse;
      this.mx = damp(this.mx, p.x * mo.x, mo.damp, dt);
      this.my = damp(this.my, p.y * mo.y, mo.damp, dt);
      this.cam.rotation.set(-Math.PI - this.my * mo.turn, this.mx * mo.turn, Math.PI);
      this.cam.position.set(this.mx * mo.shift, -this.my * mo.shift, 0);
      this.scene.updateMatrixWorld();

      this.hovered = null;
      if (enabled && this.pointer && matchMedia("(hover: hover)").matches) {
        this.raycaster.setFromCamera(this.pointer, this.cam);
        const hit = this.raycaster.intersectObjects(this.meshes, false)[0];
        this.hovered = hit ? hit.object.userData.card : null;
      }
      // The outer ring appears later than the center (after .8 for 1.4), and the side far from the eye fades to .6
      const others = clamp((alpha * 2.4 - 0.8) / 1.4, 0, 1);
      const view = this.cam.matrixWorldInverse, v = new T.Vector3();
      const axis = -v.set(0, 0, 0).applyMatrix4(view).z;
      this.cards.forEach((c) => {
        const want = c === this.hovered ? 1 : 0;
        if (c.lift !== want) { c.lift = be(c.lift, want, MOTION.liftEase, n); if (Math.abs(want - c.lift) < 0.001) c.lift = want; }
        c.uniforms.uHover.value = c.lift * MOTION.zoom;
        const depth = -c.mesh.getWorldPosition(v).applyMatrix4(view).z;
        const t = clamp((depth - axis - MOTION.fadeFrom * MOTION.unit) / ((MOTION.fadeTo - MOTION.fadeFrom) * MOTION.unit), 0, 1);
        c.uniforms.uAlpha.value = (c.ring.middle ? alpha : others) * (1 + (MOTION.fade - 1) * t * t * (3 - 2 * t));
      });

      const spin = this.spin.rotation.y;
      this.logoTurn.rotation.y += (spin - this.lastSpin) * RINGS.logo.turn;
      this.lastSpin = spin;
      this.logo.rotation.y = morph;
      this.logo.material.uniforms.uOpacity.value = alpha;
      this.renderer.render(this.scene, this.cam);
    }
    clear() { this.renderer.clear(); this.last = null; }
  }

  window.Stage3D = { Y3D, Orbit };
})();
