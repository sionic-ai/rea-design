/* Sand plate — a vibrating plate newly built with our own code (three). The plate bends by vibration mode Ψ(x,y), and sand grains (where plate acceleration exceeds gravity (|Ψ|·γ > In 1)
   Bounces and walks randomly (step ∝ overflow), gradually pushed toward smaller amplitude (slope .15) and gathers on the still nodal lines.
   Original values: γ 4.5 · step .0045 · slope .15 · bounce height .02 · plate bend .09 · phase speed 2.4 · camera fov 38 (phone 52) · preset move 1.4s power3.inOut ·
   Cursor parallax .09 · camera follow 1 − e^(−3.2·dt) */
(() => {
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  // Turn skin variables (including color-mix and oklch) into real colors — paint them on an element and sample the computed color into one canvas cell
  const rgbOf = (name) => {
    const el = document.createElement("i");
    el.style.color = `var(${name})`;
    document.body.appendChild(el);
    const c = getComputedStyle(el).color;
    el.remove();
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const ctx = cv.getContext("2d"); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.LinearSRGBColorSpace);
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 768;
  const CAMERA = { fov: 38, mobileFov: 52, easeRate: 3.2, parallax: 0.09, drift: { x: 0.16, y: 0.06, z: -0.1 } };
  const PRESETS = {
    intro: [0, -3.4, 4.6, 0, 0, 0], hero: [0, -2.2, 2.95, 0, 0.05, 0], tilt: [-0.6, -2.1, 2.65, 0, 0, 0], overhead: [0, -0.2, 3.6, 0, 0, 0],
    low: [0.9, -2.9, 0.95, 0, 0, 0], lab: [0, -1.5, 3.7, 0, 0.05, 0], detail: [0.35, -1.2, 2.6, 0, 0, 0], backdrop: [0, -2.4, 5.6, 0, 0.35, 0],
  };
  const SAND = { gamma: 4.5, step: 0.0045, slope: 0.15, hop: 0.02, creep: 0.06 };
  const PLATE = { displace: 0.09, phaseSpeed: 2.4 };

  // Vibration mode — the rectangular free plate is a Rayleigh approximation cos(mπu)cos(nπv) ± cos(nπu)cos(mπv), the circular plate has n diameters × s concentric circles
  const field = (mode, x, y) => {
    if (!mode) return 0;
    if (mode.kind === "disc") {
      const r = Math.hypot(x, y), th = Math.atan2(y, x);
      if (r > 1) return 0;
      const k = Math.PI * (mode.s + 0.5 + mode.n * 0.32);
      return Math.cos(mode.n * th) * Math.cos(k * r) * (mode.n ? Math.min(1, r * 3) : 1);
    }
    const u = (x + 1) / 2, v = (y + 1) / 2, m = mode.m, n = mode.n;
    return 0.5 * (Math.cos(m * Math.PI * u) * Math.cos(n * Math.PI * v) + mode.sign * Math.cos(n * Math.PI * u) * Math.cos(m * Math.PI * v));
  };
  // Frequency sweep — spreads 250~2600Hz logarithmically and passes over a ladder of square-plate modes. Between resonances, two neighbors blend
  // The lab chip’s ten resonances serve as the mode ladder cells — between cells they blend in log frequency
  const HZ = [250, 420, 760, 1117, 1456, 1688, 1912, 2170, 2380, 2590];
  const LADDER = [[1, 2, -1], [2, 2, 1], [1, 3, 1], [2, 3, -1], [2, 4, -1], [1, 5, 1], [3, 4, -1], [2, 5, 1], [3, 5, -1], [4, 6, -1]];
  const hzToLadder = (hz) => {
    if (hz <= HZ[0]) return 0;
    for (let i = 0; i < HZ.length - 1; i++) if (hz < HZ[i + 1]) return i + (Math.log(hz) - Math.log(HZ[i])) / (Math.log(HZ[i + 1]) - Math.log(HZ[i]));
    return HZ.length - 1;
  };

  class Plate {
    constructor(host, opts = {}) {
      this.host = host;
      this.count = opts.grains || (mobile ? 14000 : 42000);
      this.mode = { kind: "rect", m: 4, n: 6, sign: -1 };
      this.next = null; this.mix = 1;
      this.shape = "rect";
      this.gammaScale = 1; this.displaceScale = 0; this.glow = 0; this.drift = 0; this.paused = false;
      this.region = { x: 0.5, y: 0.5, fit: 1 };
      this.driver = null;
      const T = THREE;
      this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      this.renderer.setClearColor(0x000000, 0);
      host.appendChild(this.renderer.domElement);
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(mobile ? CAMERA.mobileFov : CAMERA.fov, 1, 0.1, 40);
      const p = PRESETS[opts.preset || "hero"];
      this.cam = { x: p[0], y: p[1], z: p[2], tx: p[3], ty: p[4], tz: p[5] };
      this.camNow = { ...this.cam };
      this.pointer = { x: 0, y: 0, sx: 0, sy: 0 };

      const ink = rgbOf("--kf-ink"), accent = rgbOf("--kf-accent"), sand = rgbOf("--site-sand"), plateC = rgbOf("--site-plate");
      // Board — a 64×64 grid surface, bent by Ψ from the vertices, with light, border and brass glow from the pieces
      this.plateUniforms = {
        uPhase: { value: 0 }, uDisplace: { value: 0 }, uGlow: { value: 0 }, uDisc: { value: 0 },
        uBase: { value: plateC },
        uRim: { value: ink.clone().multiplyScalar(0.55) }, uAccent: { value: accent },
        uM: { value: new T.Vector3(4, 6, -1) }, uM2: { value: new T.Vector3(4, 6, -1) }, uMix: { value: 1 }, uKind: { value: new T.Vector2(0, 0) },
      };
      const FIELD_GLSL = `
        uniform vec3 uM; uniform vec3 uM2; uniform float uMix; uniform vec2 uKind;
        float psi1(vec3 md, float kind, vec2 p) {
          if (kind > 0.5) { float r = length(p); float th = atan(p.y, p.x); float k = 3.14159265 * (md.y + 0.5 + md.x * 0.32);
            return cos(md.x * th) * cos(k * r) * (md.x > 0.5 ? min(1.0, r * 3.0) : 1.0); }
          vec2 uv = (p + 1.0) * 0.5;
          return 0.5 * (cos(md.x * 3.14159265 * uv.x) * cos(md.y * 3.14159265 * uv.y) + md.z * cos(md.y * 3.14159265 * uv.x) * cos(md.x * 3.14159265 * uv.y)); }
        float psi(vec2 p) { return mix(psi1(uM, uKind.x, p), psi1(uM2, uKind.y, p), uMix); }`;
      const plateGeo = new T.PlaneGeometry(2, 2, 96, 96);
      this.plateMat = new T.ShaderMaterial({
        uniforms: this.plateUniforms, transparent: true,
        vertexShader: `${FIELD_GLSL}
          uniform float uPhase; uniform float uDisplace; uniform float uDisc;
          varying vec2 vP; varying float vF;
          void main() { vP = position.xy; float f = psi(position.xy); vF = f;
            vec3 pos = position; pos.z += uDisplace * f * cos(uPhase);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); }`,
        fragmentShader: `
          uniform vec3 uBase; uniform vec3 uRim; uniform vec3 uAccent; uniform float uGlow; uniform float uDisc;
          varying vec2 vP; varying float vF;
          void main() {
            float edge = uDisc > 0.5 ? 1.0 - length(vP) : min(1.0 - abs(vP.x), 1.0 - abs(vP.y));
            if (edge < 0.0) discard;
            vec3 c = uBase * (0.82 + 0.16 * (0.5 + 0.5 * vP.y) - 0.06 * length(vP));
            c = mix(c, uAccent * (0.55 + 0.45 * abs(vF)), uGlow * 0.75);
            c = mix(uRim, c, smoothstep(0.0, 0.012, edge));
            gl_FragColor = vec4(c, 1.0); }`,
      });
      this.plate = new T.Mesh(plateGeo, this.plateMat);
      this.group = new T.Group();
      this.group.add(this.plate);
      this.scene.add(this.group);

      // Sand — N points. Positions are walked on the CPU (Float32Array), and height (bounce) and panel bend are added in the vertex shader
      this.pos = new Float32Array(this.count * 3);
      this.state = new Float32Array(this.count * 2);
      for (let i = 0; i < this.count; i++) this.spawn(i, true);
      const g = new T.BufferGeometry();
      this.posAttr = new T.BufferAttribute(this.pos, 3);
      this.posAttr.setUsage(T.DynamicDrawUsage);
      g.setAttribute("position", this.posAttr);
      const rnd = new Float32Array(this.count);
      for (let i = 0; i < this.count; i++) rnd[i] = Math.random();
      g.setAttribute("aRand", new T.BufferAttribute(rnd, 1));
      this.sandUniforms = { uSize: { value: 2.6 }, uScale: { value: 1 }, uSand: { value: sand }, uGlow: { value: accent }, uReveal: { value: 0 }, uPhase: this.plateUniforms.uPhase, uDisplace: this.plateUniforms.uDisplace, uM: this.plateUniforms.uM, uM2: this.plateUniforms.uM2, uMix: this.plateUniforms.uMix, uKind: this.plateUniforms.uKind };
      this.sandMat = new T.ShaderMaterial({
        uniforms: this.sandUniforms, transparent: true, depthWrite: false,
        vertexShader: `${FIELD_GLSL}
          attribute float aRand; uniform float uSize; uniform float uScale; uniform float uPhase; uniform float uDisplace;
          varying float vRand; varying float vAir;
          void main() { vRand = aRand; vec3 p = position; vAir = clamp(p.z / 0.02, 0.0, 1.0);
            p.z += 0.004 + uDisplace * psi(p.xy) * cos(uPhase);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = clamp(uSize * uScale * (0.75 + 0.5 * aRand) * 3.0 / max(-mv.z, 0.01), 1.0, 64.0);
            gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `
          uniform vec3 uSand; uniform vec3 uGlow; uniform float uReveal; varying float vRand; varying float vAir;
          void main() { vec2 d = gl_PointCoord - 0.5; float r = dot(d, d); if (r > 0.25) discard;
            vec3 c = uSand * (0.82 + 0.3 * vRand) + uGlow * vAir * 0.55;
            gl_FragColor = vec4(c, uReveal * smoothstep(0.25, 0.12, r)); }`,
      });
      this.sand = new T.Points(g, this.sandMat);
      this.sand.frustumCulled = false;
      this.group.add(this.sand);

      this.resize = this.resize.bind(this);
      addEventListener("resize", this.resize);
      addEventListener("pointermove", (e) => { this.pointer.x = (e.clientX / innerWidth) * 2 - 1; this.pointer.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
      this.resize();
      this.last = performance.now();
      this.phase = 0;
      gsap.to(this.sandUniforms.uReveal, { value: 1, duration: 0.6, ease: "power2.out" });
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }
    spawn(i, any) {
      let x, y;
      do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; } while (this.shape === "disc" && x * x + y * y > 1);
      this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = any ? 0 : SAND.hop;
      this.state[i * 2] = 0; this.state[i * 2 + 1] = Math.random();
    }
    resize() {
      const w = this.host.clientWidth || innerWidth, h = this.host.clientHeight || innerHeight;
      this.W = w; this.H = h;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.sandUniforms.uScale.value = h / 900 * Math.min(1.5, devicePixelRatio || 1);
    }
    psi(x, y) { const a = field(this.mode, x, y); return this.next ? a + (field(this.next, x, y) - a) * this.mix : a; }
    // Next shape — instead of rebuilding the panel warp and sand targets every .18s, move them over 1.4s power2.inOut using a mix share (mix)
    setMode(md, dur = 1.4) {
      const key = (m) => m && (m.kind === "disc" ? `d${m.n}.${m.s}` : `r${m.m}.${m.n}.${m.sign}`);
      const cur = this.next && this.mix > 0.5 ? this.next : this.mode;
      this.sharp = 1;
      if (key(cur) === key(md)) return;
      this.mode = this.next && this.mix > 0.5 ? this.next : this.mode;
      this.next = md; this.mix = 0;
      const U = this.plateUniforms;
      const vec = (m) => (m.kind === "disc" ? [m.n, m.s, 0] : [m.m, m.n, m.sign]);
      U.uM.value.set(...vec(this.mode)); U.uM2.value.set(...vec(md));
      U.uKind.value.set(this.mode.kind === "disc" ? 1 : 0, md.kind === "disc" ? 1 : 0);
      gsap.killTweensOf(this, "mix");
      gsap.to(this, { mix: 1, duration: reduce ? 0 : dur, ease: "power2.inOut", onUpdate: () => (U.uMix.value = this.mix), onComplete: () => { this.mode = md; this.next = null; this.mix = 1; } });
    }
    setFrequency(hz) {
      gsap.killTweensOf(this, "mix");
      const t = clamp(hzToLadder(hz), 0, LADDER.length - 1), i = Math.floor(t), f = t - i;
      const a = LADDER[i], b = LADDER[Math.min(LADDER.length - 1, i + 1)];
      this.mode = { kind: "rect", m: a[0], n: a[1], sign: a[2] };
      this.next = { kind: "rect", m: b[0], n: b[1], sign: b[2] };
      this.mix = f * f * (3 - 2 * f);
      const U = this.plateUniforms;
      U.uM.value.set(a[0], a[1], a[2]); U.uM2.value.set(b[0], b[1], b[2]); U.uKind.value.set(0, 0); U.uMix.value = this.mix;
      // The farther from resonance, the fainter the pattern — reduce the overflow share so less sand gathers
      this.sharp = 1 - 0.65 * Math.sin(Math.PI * f);
    }
    setShape(shape) {
      if (shape === this.shape) return;
      this.shape = shape;
      this.plateUniforms.uDisc.value = shape === "disc" ? 1 : 0;
      for (let i = 0; i < this.count; i++) if (shape === "disc" && Math.hypot(this.pos[i * 3], this.pos[i * 3 + 1]) > 1) this.spawn(i);
    }
    setCamera(name, dur = 1.4) {
      const p = PRESETS[name];
      if (!p) return;
      gsap.to(this.cam, { x: p[0], y: p[1], z: p[2], tx: p[3], ty: p[4], tz: p[5], duration: reduce ? 0 : dur, ease: "power3.inOut", overwrite: "auto" });
    }
    // Where on the screen to place the plate — x·y are the screen share, fit is the size ratio (original: reading .2 up · aside .42 wide)
    setRegion(x, y, fit = 1) { gsap.to(this.region, { x, y, fit, duration: reduce ? 0 : 0.9, ease: "power3.inOut", overwrite: "auto" }); }
    strike() { for (let i = 0; i < this.count; i++) { if (Math.random() < 0.5) { this.pos[i * 3 + 2] = SAND.hop * (0.5 + Math.random()); this.state[i * 2] = 0.3; } } }
    sprinkle() { for (let i = 0; i < this.count; i++) this.spawn(i, true); }
    step(dt) {
      // Steps are based on a 60fps frame — when frames are sparse, it steps bigger by that much so it gathers in the same time (original MAX_DELTA 1/30)
      const g = SAND.gamma * this.gammaScale * (this.sharp ?? 1), stepK = SAND.step * (reduce ? 0.45 : 1) * Math.min(2, dt * 60), slope = SAND.slope, P = this.pos, S = this.state, disc = this.shape === "disc";
      const e = 0.012;
      for (let i = 0; i < this.count; i++) {
        const j = i * 3;
        let x = P[j], y = P[j + 1];
        const f = Math.abs(this.psi(x, y)), a = f * g;
        if (a > 1) {
          // When plate acceleration exceeds gravity it bounces — the step is proportional to the excess, a random walk biased toward shrinking amplitude
          const over = Math.min(3, a - 1), ang = Math.random() * Math.PI * 2, s = stepK * over * (0.5 + Math.random());
          const gx = (Math.abs(this.psi(x + e, y)) - Math.abs(this.psi(x - e, y))) / (2 * e), gy = (Math.abs(this.psi(x, y + e)) - Math.abs(this.psi(x, y - e))) / (2 * e);
          const gl = Math.hypot(gx, gy) || 1;
          x += Math.cos(ang) * s - (gx / gl) * s * slope * 6;
          y += Math.sin(ang) * s - (gy / gl) * s * slope * 6;
          P[j + 2] = Math.min(SAND.hop, P[j + 2] + SAND.hop * over * dt * 6);
        } else {
          // If acceleration falls short of gravity it settles down, creeping slowly (creep .06) only toward shrinking amplitude — at a node line the slope is 0 so it stops
          P[j + 2] = Math.max(0, P[j + 2] - dt * 0.12);
          if (f > 0.004) {
            const gx = (Math.abs(this.psi(x + e, y)) - Math.abs(this.psi(x - e, y))) / (2 * e), gy = (Math.abs(this.psi(x, y + e)) - Math.abs(this.psi(x, y - e))) / (2 * e);
            const gl = Math.hypot(gx, gy) || 1, c = Math.min(f / gl, stepK * SAND.creep * 20);
            x -= (gx / gl) * c; y -= (gy / gl) * c;
          }
        }
        if (this.noise) { x += (Math.random() - 0.5) * stepK * this.noise * 3; y += (Math.random() - 0.5) * stepK * this.noise * 3; }
        // Eggs that fall off the board are scattered again from the top
        if (disc ? x * x + y * y > 1 : x < -1 || x > 1 || y < -1 || y > 1) { this.spawn(i); continue; }
        P[j] = x; P[j + 1] = y;
      }
      this.posAttr.needsUpdate = true;
    }
    loop(now) {
      requestAnimationFrame(this.loop);
      const dt = Math.min(1 / 30, Math.max(0.001, (now - this.last) / 1000));
      this.last = now;
      if (!this.paused) {
        this.phase += dt * PLATE.phaseSpeed * Math.PI * 2;
        this.plateUniforms.uPhase.value = this.phase;
        this.step(dt);
      }
      this.plateUniforms.uDisplace.value = PLATE.displace * this.displaceScale * (this.paused ? 0 : 1);
      this.plateUniforms.uGlow.value = this.glow;
      // Camera — preset + scroll flow (drift) + cursor parallax (.09), follows each frame with 1 − e^(−3.2 dt)
      const k = reduce ? 1 : 1 - Math.exp(-CAMERA.easeRate * dt);
      this.pointer.sx += (this.pointer.x - this.pointer.sx) * k; this.pointer.sy += (this.pointer.y - this.pointer.sy) * k;
      const d = reduce ? 0 : this.drift, c = this.camNow;
      for (const key of ["x", "y", "z", "tx", "ty", "tz"]) c[key] += (this.cam[key] - c[key]) * k;
      const px = reduce ? 0 : this.pointer.sx * CAMERA.parallax, py = reduce ? 0 : -this.pointer.sy * CAMERA.parallax;
      this.camera.position.set(c.x + CAMERA.drift.x * d + px, c.y + CAMERA.drift.y * d + py * 0.5, c.z + CAMERA.drift.z * d + py * 0.5);
      this.camera.lookAt(c.tx, c.ty, c.tz);
      // Panel position — shifts the projection sideways so the panel center lands at the screen region spot
      const R = this.region;
      this.camera.setViewOffset(this.W, this.H, (0.5 - R.x) * this.W, (0.5 - R.y) * this.H, this.W, this.H);
      this.group.scale.set(R.fit, R.fit * (this.aspect || 1), R.fit);
      this.renderer.render(this.scene, this.camera);
    }
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  window.BrandPlate = Plate;
  window.brandField = { field, LADDER, HZ, hzToLadder };
})();
