(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const coarse = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const smooth = (e) => e * e * (3 - 2 * e);
  const expoOut = (e) => (e >= 1 ? 1 : 1 - 2 ** (-10 * e));
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const DEG = Math.PI / 180;

  // Paint the skin colors on screen and read them back as rgb — so variables made with oklch(from …) or color-mix can be used by three and canvas
  const toneOf = (v) => {
    const p = document.createElement("i"); p.style.color = `var(${v})`; document.body.append(p);
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const x = c.getContext("2d"); x.fillStyle = getComputedStyle(p).color; x.fillRect(0, 0, 1, 1); p.remove();
    const d = x.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // ───────── Hero 3D corridor — instead of the original model, our basic shapes (home slab pillars · arcade wall · semicircle vault) with the same composition and lighting ─────────
  // Coordinates are written on the 3D tool’s axes as in the original (x sideways, y depth, z up) and rotated to three axes
  const Q = ([x, y, z]) => new THREE.Vector3(x, z, -y);
  const CAM = { y: -14.1, z: 0.4, focal: 20, gauge: 36, shift: 0.155 };
  const INTRO = { back: 1.6, ms: 2600 };
  const SCROLL = { end: 0.77, focal: 85, rise: 3, lightDepth: 6, dim: [0.2, 0.15], pool: [0.1, 0.55] };
  const LOOK = { yaw: 2.2, pitch: 1.2, ms: 260 };
  const COL_X = 5.5, BAYS = [0, 7, 14, 21, 28];
  const lampsOf = (s, e) => [
    { kind: "spot", watts: 11000 * e, at: [s * 1.6, -2.6, 0.6], to: [s * COL_X, -0.3, 4.2], angle: 80 },
    { kind: "spot", watts: 14000 * e, at: [s * 1, -3, 1], to: [s * 2.5, 0, 11.3], angle: 60 },
    { kind: "spot", watts: 1200 * e, at: [s * 3.5, -15, 2], to: [s * COL_X, 10, 7], angle: 60 },
    { kind: "point", watts: 6500 * e, at: [s * 1.3, 0.4, 1.8], distance: 9 },
  ];
  const glowsOf = (s, e) => [{ at: [s * 0.9, 1.2, 0.5], size: 7, strength: 0.55 * e }, { at: [s * 1.3, 0.4, 0.2], size: 3.5, strength: 0.35 * e }];

  class Nave {
    constructor(canvas) {
      this.canvas = canvas;
      const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
      r.toneMapping = THREE.NeutralToneMapping;
      r.toneMappingExposure = 2 ** -1.4;
      const void_ = new THREE.Color().setRGB(...toneOf("--site-void"), THREE.SRGBColorSpace);
      this.scene = new THREE.Scene();
      this.scene.background = void_;
      this.scene.fog = new THREE.FogExp2(void_, 0.028);
      this.camera = new THREE.PerspectiveCamera(50, 1, 0.3, 200);
      this.camera.filmGauge = CAM.gauge;
      this.camera.rotation.order = "YXZ";
      this.progress = 0; this.intro = 1; this.introStart = 0;
      this.look = { x: 0, y: 0 }; this.lookTarget = { x: 0, y: 0 };
      this.movers = []; this.glows = []; this.lastTick = 0; this.dirty = true;
      this.size = [1, 1, 0, 0, 1, 1];
      this.build();
      this.lights();
      this.bloomSetup();
      this.place();
    }

    stone() {
      // Stone grain: our canvas with thin veins and stains painted over gray noise
      const c = document.createElement("canvas"); c.width = c.height = 256;
      const x = c.getContext("2d"), img = x.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) {
        const px = i % 256, py = (i / 256) | 0;
        const v = 150 + 50 * Math.sin(px * 0.05 + Math.sin(py * 0.07) * 2) * Math.sin(py * 0.031) + (Math.random() - 0.5) * 70;
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      x.globalAlpha = 0.35; x.strokeStyle = x.fillStyle;
      x.lineWidth = 1;
      for (let k = 0; k < 14; k++) { x.beginPath(); let a = Math.random() * 256, b = Math.random() * 256; x.moveTo(a, b); for (let s = 0; s < 6; s++) { a += (Math.random() - 0.5) * 40; b += Math.random() * 30; x.lineTo(a, b); } x.stroke(); }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    build() {
      const ink = toneOf("--kf-ink"), bg = toneOf("--kf-bg");
      const grey = ink.map((v, i) => v * 0.42 + bg[i] * 0.58);
      const tex = this.stone();
      const mat = (rep, rough = 0.92) => {
        const t = tex.clone(); t.repeat.set(rep[0], rep[1]); t.needsUpdate = true;
        return new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(...grey, THREE.SRGBColorSpace), map: t, roughness: rough, metalness: 0 });
      };
      const S = this.scene, add = (g, m, p) => { const o = new THREE.Mesh(g, m); if (p) o.position.copy(p); S.add(o); return o; };

      // Floor — fine grain so the flagstone joints show
      add(new THREE.PlaneGeometry(40, 90), mat([10, 22], 1), new THREE.Vector3(0, 0, -30)).rotation.x = -Math.PI / 2;

      // Column: base + rounded band + fluted-plate shaft + bell-shaped capital + square slab — height 7.35
      const prof = [[0.001, 0.5], [1.0, 0.5], [1.0, 0.62], [0.9, 0.75], [0.8, 0.82], [0.78, 1.0], [0.7, 6.1], [0.78, 6.2], [0.74, 6.3], [0.8, 6.55], [0.95, 6.8], [1.1, 7.0], [0.001, 7.0]].map(([a, b]) => new THREE.Vector2(a, b));
      const lathe = new THREE.LatheGeometry(prof, 48);
      const pos = lathe.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i); if (y < 1.0 || y > 6.1) continue;
        const a = Math.atan2(pos.getZ(i), pos.getX(i)), k = 1 - 0.035 * Math.abs(Math.sin(12 * a));
        pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k);
      }
      lathe.computeVertexNormals();
      const colMat = mat([3, 4]);
      const plinth = new THREE.BoxGeometry(2.1, 0.5, 2.1), abacus = new THREE.BoxGeometry(2.3, 0.35, 2.3), leaf = new THREE.SphereGeometry(0.28, 10, 8);
      for (const s of [-1, 1]) for (const d of BAYS) {
        const at = Q([s * COL_X, d, 0]);
        add(plinth, colMat, at.clone().setY(0.25));
        add(lathe, colMat, at);
        add(abacus, colMat, at.clone().setY(7.175));
        for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; const o = add(leaf, colMat, at.clone().add(new THREE.Vector3(Math.cos(a) * 0.95, 6.75, Math.sin(a) * 0.95))); o.scale.set(1, 1.5, 0.7); o.lookAt(at.clone().setY(6.75)); }
      }

      // Arcade wall — a plate with a semicircular hole between each pair of columns sits on top of the column heads
      const wall = new THREE.Shape();
      wall.moveTo(0, 0); wall.lineTo(33, 0); wall.lineTo(33, 11.2); wall.lineTo(0, 11.2); wall.lineTo(0, 0);
      for (let i = 0; i < BAYS.length - 1; i++) {
        const a = BAYS[i] + 1.15, b = BAYS[i + 1] - 1.15, r = (b - a) / 2, h = new THREE.Path();
        h.moveTo(a, -0.1); h.lineTo(b, -0.1); h.lineTo(b, 7.35); h.absarc(a + r, 7.35, r, 0, Math.PI, false); h.lineTo(a, -0.1);
        wall.holes.push(h);
      }
      const wallGeo = new THREE.ExtrudeGeometry(wall, { depth: 1.2, bevelEnabled: false, curveSegments: 24 });
      const wallMat = mat([0.12, 0.12]);
      for (const s of [-1, 1]) {
        const w = add(wallGeo, wallMat);
        w.rotation.y = Math.PI / 2;
        w.position.set(s * COL_X - 0.6, 0, 0);
      }
      // Outer wall and end wall of the side corridor behind the column row — they fade into fog
      for (const s of [-1, 1]) add(new THREE.PlaneGeometry(40, 16), mat([6, 2]), new THREE.Vector3(s * 11, 8, -14)).rotation.y = -s * Math.PI / 2;
      add(new THREE.PlaneGeometry(24, 18), mat([4, 3]), new THREE.Vector3(0, 9, -33));
      // Vault — semicircular roof above the wall, with horizontal ribs at each column
      const vault = add(new THREE.CylinderGeometry(COL_X, COL_X, 36, 40, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(...grey, THREE.SRGBColorSpace), map: tex, roughness: 1, side: THREE.BackSide }), new THREE.Vector3(0, 11.2, -15));
      vault.rotation.x = Math.PI / 2;
      const rib = new THREE.TorusGeometry(COL_X - 0.2, 0.35, 8, 40, Math.PI);
      for (const d of BAYS) add(rib, colMat, Q([0, d, 11.2]));
      // Broken stone pieces on the front floor
      const chip = new THREE.DodecahedronGeometry(0.35, 0);
      [[-1.9, -8.4, 0.12, 1.1], [-3.2, -6.5, 0.1, 0.8], [2.4, -7.6, 0.12, 1.3], [3.6, -5.2, 0.1, 0.7], [-0.6, -9.6, 0.08, 0.5], [1.2, -10.2, 0.08, 0.6], [-4.3, -3.4, 0.1, 1.2], [4.6, -2.6, 0.12, 1.1]].forEach(([x, y, z, s]) => {
        const o = add(chip, colMat, Q([x, y, z])); o.scale.set(s * 1.4, s * 0.6, s); o.rotation.set(x, y, z * 10);
      });
    }

    lights() {
      const cold = new THREE.Color().setRGB(...toneOf("--site-lamp-cold"), THREE.SRGBColorSpace);
      const warm = new THREE.Color().setRGB(...toneOf("--site-warm"), THREE.SRGBColorSpace);
      const glowTex = (() => {
        // Bokeh — a round disc adding a narrow central peak (.12) at 40% and a wide skirt (.6) at 60%
        const n = 128, data = new Uint8Array(n * n * 4);
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
          const d = Math.hypot(x + 0.5 - n / 2, y + 0.5 - n / 2) / (n / 2), i = (y * n + x) * 4;
          const a = d >= 1 ? 0 : (1 - d * d) ** 2 * (0.4 * Math.exp(-((d / 0.12) ** 2)) + 0.6 * Math.exp(-((d / 0.6) ** 2)));
          data[i] = data[i + 1] = data[i + 2] = 255; data[i + 3] = Math.round(a * 255);
        }
        const t = new THREE.DataTexture(data, n, n); t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
        return t;
      })();
      const keep = (o) => { this.scene.add(o); this.movers.push({ obj: o, base: o.position.clone(), intensity: o.intensity }); };
      for (const [color, s, e] of [[cold, -1, 1], [warm, 1, 0.7]]) {
        for (const l of lampsOf(s, e)) {
          let o;
          if (l.kind === "spot") {
            o = new THREE.SpotLight(color, l.watts / (4 * Math.PI), 0, (l.angle * Math.PI) / 360, 1, 2);
            o.position.copy(Q(l.at));
            o.target.position.copy(Q(l.to)).sub(o.position);
            o.add(o.target);
          } else {
            o = new THREE.PointLight(color, l.watts / (4 * Math.PI), l.distance, 2);
            o.position.copy(Q(l.at));
          }
          keep(o);
        }
        for (const g of glowsOf(s, e)) {
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: g.strength }));
          sp.scale.set(g.size, g.size, 1);
          sp.position.copy(Q(g.at));
          keep(sp);
          this.glows.push({ sprite: sp, strength: g.strength });
        }
      }
    }

    // Bloom — extracts only areas brighter than .5 at half resolution, spreads them in three stages (1/2·1/4·1/8), then adds them back with strength .35 · radius .9
    bloomSetup() {
      const rt = (s = 1) => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: s === 1 });
      this.rtScene = rt(1);
      this.mips = [0, 1, 2].map(() => ({ a: rt(2), b: rt(2) }));
      const quadVS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
      this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
      this.quadScene = new THREE.Scene(); this.quadScene.add(this.quad);
      this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.bright = new THREE.ShaderMaterial({ vertexShader: quadVS, uniforms: { tex: { value: null }, threshold: { value: 0.5 } }, toneMapped: false, depthTest: false,
        fragmentShader: "uniform sampler2D tex; uniform float threshold; varying vec2 vUv; void main(){ vec4 c = texture2D(tex, vUv); float l = dot(c.rgb, vec3(0.299, 0.587, 0.114)); gl_FragColor = vec4(c.rgb * smoothstep(threshold, threshold + 0.01, l), 1.0); }" });
      this.blur = new THREE.ShaderMaterial({ vertexShader: quadVS, uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() }, radius: { value: 3 } }, toneMapped: false, depthTest: false,
        fragmentShader: `uniform sampler2D tex; uniform vec2 dir; uniform float radius; varying vec2 vUv;
          void main(){ vec3 s = vec3(0.0); float w = 0.0;
            for (int i = -6; i <= 6; i++) { float f = float(i); float g = exp(-0.5 * f * f / (radius * radius)); s += texture2D(tex, vUv + dir * f).rgb * g; w += g; }
            gl_FragColor = vec4(s / w, 1.0); }` });
      this.mix = new THREE.ShaderMaterial({ vertexShader: quadVS, toneMapped: true, depthTest: false,
        uniforms: { scene: { value: null }, b0: { value: null }, b1: { value: null }, b2: { value: null }, strength: { value: 0.35 }, radius: { value: 0.9 } },
        fragmentShader: `uniform sampler2D scene, b0, b1, b2; uniform float strength, radius; varying vec2 vUv;
          float lf(float f){ return mix(f, 1.2 - f, radius); }
          void main(){
            vec3 bloom = 3.0 * strength * (lf(1.0) * texture2D(b0, vUv).rgb + lf(0.8) * texture2D(b1, vUv).rgb + lf(0.6) * texture2D(b2, vUv).rgb);
            gl_FragColor = vec4(texture2D(scene, vUv).rgb + bloom, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }` });
    }

    pass(mat, target) { this.quad.material = mat; this.renderer.setRenderTarget(target); this.renderer.render(this.quadScene, this.quadCam); }

    resize(w, h, x, y, cw, ch) {
      this.size = [w, h, x, y, cw, ch];
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      this.renderer.setPixelRatio(ratio);
      this.renderer.setSize(cw, ch, false);
      const pw = Math.max(1, Math.round(cw * ratio)), ph = Math.max(1, Math.round(ch * ratio));
      this.rtScene.setSize(pw, ph);
      this.mips.forEach((m, i) => { const k = 2 ** (i + 1); m.a.setSize(Math.max(1, pw / k | 0), Math.max(1, ph / k | 0)); m.b.setSize(Math.max(1, pw / k | 0), Math.max(1, ph / k | 0)); });
      this.camera.aspect = w / h;
      this.place();
    }

    setProgress(p) { const v = clamp01(p); if (v !== this.progress) { this.progress = v; this.place(); } }
    playIntro(now) { this.intro = 0; this.introStart = now; this.place(); }
    pointer(x, y) { this.lookTarget.x = Math.max(-1, Math.min(1, x)); this.lookTarget.y = Math.max(-1, Math.min(1, y)); }

    tick(now) {
      const dt = Math.min(now - (this.lastTick || now), 100);
      this.lastTick = now;
      if (this.intro < 1) this.intro = Math.min((now - this.introStart) / INTRO.ms, 1);
      const k = 1 - Math.exp(-dt / LOOK.ms);
      this.look.x += (this.lookTarget.x - this.look.x) * k;
      this.look.y += (this.lookTarget.y - this.look.y) * k;
      const settled = Math.abs(this.lookTarget.x - this.look.x) < 0.001 && Math.abs(this.lookTarget.y - this.look.y) < 0.001;
      if (settled) { this.look.x = this.lookTarget.x; this.look.y = this.lookTarget.y; this.lastTick = 0; }
      this.place();
      return this.intro < 1 || !settled;
    }

    place() {
      const back = INTRO.back * (1 - expoOut(this.intro));
      const i = smooth(Math.min(this.progress / SCROLL.end, 1));
      const c = this.camera;
      c.position.copy(Q([0, CAM.y - back, CAM.z + SCROLL.rise * i]));
      c.setFocalLength(CAM.focal * (SCROLL.focal / CAM.focal) ** i);
      c.rotation.set(this.look.y * LOOK.pitch * DEG, -this.look.x * LOOK.yaw * DEG, 0);
      const [w, h, x, y, cw, ch] = this.size;
      const shift = (CAM.shift * CAM.gauge) / c.getFilmHeight();
      c.setViewOffset(w, h, x, y - shift * h, cw, ch);
      const dim = 1 - (1 - SCROLL.dim[1]) * smooth(clamp01((i - SCROLL.dim[0]) / (1 - SCROLL.dim[0])));
      const pool = 1 - smooth(clamp01((i - SCROLL.pool[0]) / (SCROLL.pool[1] - SCROLL.pool[0])));
      for (const { obj, base, intensity } of this.movers) {
        obj.position.set(base.x, base.y - SCROLL.lightDepth * i, base.z);
        if (obj.isLight) obj.intensity = intensity * dim * (obj.isPointLight ? pool : 1);
      }
      for (const { sprite, strength } of this.glows) {
        const d = sprite.position.distanceTo(c.position);
        sprite.material.opacity = strength * dim * clamp01((d - 9.5) / (15 - 9.5));
      }
      this.dirty = true;
    }

    render() {
      if (!this.dirty) return false;
      this.dirty = false;
      const r = this.renderer;
      r.setRenderTarget(this.rtScene);
      r.render(this.scene, this.camera);
      this.bright.uniforms.tex.value = this.rtScene.texture;
      this.pass(this.bright, this.mips[0].a);
      let src = this.mips[0].a;
      this.mips.forEach((m, i) => {
        if (i > 0) { this.blur.uniforms.tex.value = src.texture; this.blur.uniforms.dir.value.set(0, 0); this.pass(this.blur, m.a); }
        this.blur.uniforms.tex.value = m.a.texture; this.blur.uniforms.dir.value.set(1 / m.a.width, 0); this.pass(this.blur, m.b);
        this.blur.uniforms.tex.value = m.b.texture; this.blur.uniforms.dir.value.set(0, 1 / m.a.height); this.pass(this.blur, m.a);
        src = m.a;
      });
      const u = this.mix.uniforms;
      u.scene.value = this.rtScene.texture; u.b0.value = this.mips[0].a.texture; u.b1.value = this.mips[1].a.texture; u.b2.value = this.mips[2].a.texture;
      this.pass(this.mix, null);
      return true;
    }

    compile() { this.renderer.compile(this.scene, this.camera); this.render(); }
  }

  // ───────── Hero: curtain → arch opens → screen pinned ─────────
  const hero = document.querySelector(".f-hero");
  const stage = hero.querySelector(".f-hero__stage");
  const arch = hero.querySelector(".f-hero__arch");
  const win = hero.querySelector(".f-hero__window");
  const sceneBox = hero.querySelector(".f-hero__scene");
  const canvas = hero.querySelector(".f-hero__canvas");
  const content = hero.querySelector(".f-hero__content");
  const copy = hero.querySelector(".f-hero__copy");
  const title = hero.querySelector(".f-title");
  const band = hero.querySelector(".f-hero__band");
  const solid = hero.querySelector(".f-hero__solid");
  const heroLight = hero.querySelector(".f-hero__light");
  const backdrop = hero.querySelector(".f-hero__backdrop");
  const dustCanvas = hero.querySelector(".f-hero__dust");
  const pre = document.querySelector(".f-preloader");
  const header = document.querySelector(".f-header");
  const next = hero.nextElementSibling;

  const phone = matchMedia("(max-width: 767px)").matches;
  if (dustCanvas) fDust(dustCanvas, { count: 140, size: phone ? 0.6 : 1, maxDpr: phone ? 2 : 1 });

  let nave = null, raf = 0, sceneOn = true;
  const frame = (now) => {
    raf = 0;
    if (!nave) return;
    const more = nave.tick(now);
    nave.render();
    if (more && sceneOn) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (nave && !raf) raf = requestAnimationFrame(frame); };
  const fit = () => {
    if (!nave) return;
    const w = win.offsetWidth, h = win.offsetHeight || (w * 9) / 16;
    const cr = canvas.getBoundingClientRect(), wr = win.getBoundingClientRect(), k = w / (wr.width || w);
    nave.resize(w, h, (cr.left - wr.left) * k, (cr.top - wr.top) * k, canvas.clientWidth, canvas.clientHeight);
    nave.dirty = true; nave.render();
  };

  // Original arch-opening curve — a 41-step table of time → progress over 1.6s (straight between steps)
  const ZOOM = [[0, 0], [0.04, 0.00286], [0.077, 0.01154], [0.101, 0.02107], [0.12, 0.03128], [0.136, 0.042], [0.151, 0.05409], [0.165, 0.06739], [0.178, 0.08171], [0.19, 0.09683], [0.201, 0.11246], [0.212, 0.12996], [0.223, 0.14947], [0.233, 0.16909], [0.243, 0.1906], [0.253, 0.21404], [0.263, 0.2394], [0.273, 0.26657], [0.283, 0.29535], [0.294, 0.32848], [0.305, 0.36262], [0.317, 0.40027], [0.33, 0.44062], [0.344, 0.48264], [0.36, 0.52793], [0.379, 0.57725], [0.402, 0.63033], [0.43, 0.68596], [0.467, 0.74677], [0.507, 0.79969], [0.547, 0.84238], [0.587, 0.87708], [0.627, 0.90541], [0.667, 0.92855], [0.707, 0.94736], [0.747, 0.96253], [0.787, 0.97457], [0.827, 0.9839], [0.867, 0.99084], [0.907, 0.99568], [0.947, 0.99865], [0.987, 0.99992], [1, 1]];
  const zoomAt = (t) => { for (let i = 1; i < ZOOM.length; i++) if (t <= ZOOM[i][0]) { const [a, pa] = ZOOM[i - 1], [b, pb] = ZOOM[i]; return pa + ((t - a) / (b - a)) * (pb - pa); } return 1; };

  // The arch light inside the curtain stays off until 9.84% of 1.6s, then turns on with cubic-bezier(.45,0,.55,1) up to 97.34%
  const preLight = window.CustomEase ? CustomEase.create("f-pre-light", "0.45,0,0.55,1") : gsap.parseEase("sine.inOut");
  let intro = null;
  const measureIntro = () => {
    const logo = pre?.querySelector(".f-preloader__logo");
    if (!logo || !title) return;
    const fr = arch.parentElement.getBoundingClientRect();
    const ax = fr.left + arch.offsetLeft, ay = fr.top + arch.offsetTop, aw = arch.offsetWidth, ah = arch.offsetHeight;
    const l = logo.getBoundingClientRect(), cx = l.left + l.width / 2, cy = l.top + l.height / 2;
    // Small arch around the logo — width is logo width + height × 4, with the area centroid of the semicircle and pillar body at the logo center
    const f = Math.round(l.width + l.height * 4), p = Math.round((f * ah) / aw), m = f / 2;
    const rect = f * (p - m), half = (Math.PI * m * m) / 2;
    const cyArch = (rect * (m + (p - m) / 2) + half * (m - (4 * m) / (3 * Math.PI))) / (rect + half);
    const ix = Math.round(cx - f / 2), iy = Math.round(cy - cyArch);
    let tx = title.offsetWidth / 2, ty = title.offsetHeight / 2;
    for (let e = title; e && e !== content; e = e.offsetParent) { tx += e.offsetLeft; ty += e.offsetTop; }
    const S = l.width / 0.9 / title.offsetWidth;
    const v = {
      "--intro-x": `${ix}px`, "--intro-y": `${iy}px`, "--intro-w": `${f}px`, "--intro-h": `${p}px`,
      "--intro-to-x": `${ax}px`, "--intro-to-y": `${ay}px`, "--intro-to-w": `${aw}px`, "--intro-to-h": `${ah}px`,
      "--intro-copy-x": `${cx - ax - S * tx}px`, "--intro-copy-y": `${cy - ay - S * ty}px`, "--intro-copy-k": S,
      "--intro-logo-x": `${ax + tx - cx}px`, "--intro-logo-y": `${ay + ty - cy}px`, "--intro-logo-s": 1 / S,
    };
    for (const [k, val] of Object.entries(v)) root.style.setProperty(k, val);
    intro = { dx: ix - ax, dy: iy - ay, k: f / aw, ky: p / ah, f, p };
    // Arch line and light heads — on a path of length 1, eight heads of length .006~.09 plus three blurred heads
    const r = (f - 1) / 2, i = p - 0.5, d = `M0.5 ${i}V${r + 0.5}A${r} ${r} 0 0 1 ${f - 0.5} ${r + 0.5}V${i}Z`;
    const svg = pre.querySelector(".f-preloader__svg");
    svg.setAttribute("viewBox", `0 0 ${f} ${p}`);
    pre.querySelector(".f-preloader__line").setAttribute("d", d);
    const heads = pre.querySelector(".f-preloader__heads"), glows = pre.querySelector(".f-preloader__glows");
    if (!heads.childElementCount) {
      const mk = (len, glow) => { const n = document.createElementNS("http://www.w3.org/2000/svg", "path"); n.setAttribute("class", `f-preloader__head${glow ? " --glow" : ""}`); n.setAttribute("pathLength", "1"); n.setAttribute("stroke-dasharray", `0 ${1 - len} ${len} 2`); return n; };
      [0.015, 0.035, 0.06].forEach((len) => glows.append(mk(len, true)));
      [0.006, 0.012, 0.02, 0.03, 0.042, 0.056, 0.072, 0.09].forEach((len) => heads.append(mk(len, false)));
    }
    pre.querySelectorAll(".f-preloader__head").forEach((n) => n.setAttribute("d", d));
    root.classList.add("is-intro-measured");
  };

  const playOpen = () => {
    if (!intro) return;
    const { dx, dy, k, ky } = intro;
    const outline = pre.querySelector(".f-preloader__arch"), plight = pre.querySelector(".f-preloader__light");
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / 1600, 1), p = zoomAt(t), s = k + p * (1 - k);
      win.style.translate = `${dx * (1 - p)}px ${dy * (1 - p)}px`; win.style.scale = s;
      sceneBox.style.translate = `${(-dx * (1 - p)) / s}px ${(-dy * (1 - p)) / s}px`; sceneBox.style.scale = 1 / s;
      outline.style.translate = `${-dx * p}px ${-dy * p}px`; outline.style.scale = `${s / k} ${s / ky}`;
      plight.style.translate = `${dx * (1 - p)}px ${dy * (1 - p)}px`; plight.style.scale = s;
      const o = t < 0.0984 ? 0 : t > 0.9734 ? 1 : preLight((t - 0.0984) / (0.9734 - 0.0984));
      plight.style.opacity = o;
      if (t < 1) requestAnimationFrame(step);
      else { [win, sceneBox].forEach((n) => { n.style.translate = ""; n.style.scale = ""; }); }
    };
    requestAnimationFrame(step);
    const fadeIn = { duration: 1600, easing: "cubic-bezier(0.45, 0, 0.15, 1)", fill: "backwards" };
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], fadeIn);
    dustCanvas?.animate([{ opacity: 0 }, { opacity: 1 }], fadeIn);
    const lit = heroLight.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1600, easing: "steps(1, end)", fill: "backwards" });
    lit.finished.then(settle);
  };
  let settled = false;
  const settle = () => { if (settled) return; settled = true; hero.classList.add("is-settled"); root.classList.remove("is-intro-lock"); };

  let entered = false, readyAt = 0;
  const minAt = performance.now() + 1400;
  const enter = () => {
    if (entered) return;
    entered = true;
    hero.classList.add("is-entered");
    pre?.classList.add("is-done");
    playOpen();
    // The curtain hides at 1.8s — removed after that so the fixed-position glow does not overflow the screen and cause horizontal scroll
    setTimeout(() => pre?.remove(), 1900);
  };
  const ready = () => { readyAt = performance.now(); setTimeout(enter, Math.max(0, minAt - readyAt)); };

  const startScene = () => {
    if (!window.THREE) { ready(); return; }
    try {
      nave = new Nave(canvas);
      fit();
      nave.compile();
      sceneBox.classList.add("is-live");
      nave.playIntro(performance.now());
      wake();
      new ResizeObserver(() => { fit(); wake(); }).observe(sceneBox);
      new IntersectionObserver(([e]) => { sceneOn = e.isIntersecting; if (sceneOn) wake(); }).observe(sceneBox);
      if (hover && !reduce) {
        addEventListener("pointermove", (e) => {
          if (!nave || nave.progress >= SCROLL.end) return;
          const r = sceneBox.getBoundingClientRect();
          nave.pointer(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
          wake();
        }, { passive: true });
      }
    } catch (err) { nave = null; }
    ready();
  };

  if (root.classList.contains("no-intro") || reduce) {
    entered = true; hero.classList.add("is-entered", "is-settled"); pre?.remove(); root.classList.remove("is-intro-lock");
    requestAnimationFrame(startScene);
  } else {
    measureIntro();
    addEventListener("resize", () => { if (!entered) measureIntro(); }, { passive: true });
    setTimeout(enter, 3000);
    setTimeout(settle, 7000);
    (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(startScene);
  }

  // Screen pin — for 1.5 screens. At progress .85 the headline island descends, and at .3·.88·.96 the strip·text·board hide
  const AT = { header: 0.85, past: 0.96, band: 0.3, copy: 0.88 };
  const onProgress = (p) => {
    nave?.setProgress(Math.min(p, SCROLL.end)); wake();
    root.classList.toggle("is-hero", p < AT.header);
    header.classList.toggle("is-past-hero", p >= AT.header);
    stage.classList.toggle("is-past", p >= AT.past);
    stage.classList.toggle("is-band-gone", p >= AT.band);
    stage.classList.toggle("is-copy-gone", p >= AT.copy);
  };
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const PIN = 1.5;
    hero.classList.add("is-pinned");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: stage, start: 0, end: () => `+=${innerHeight * PIN}`, pin: true, anticipatePin: 1, scrub: true, invalidateOnRefresh: true, onUpdate: (s) => onProgress(s.progress), onRefresh: (s) => onProgress(s.progress) },
    });
    if (!CSS.supports("animation-timeline: scroll()")) {
      const g = { scale: 1 };
      tl.to(g, { scale: 4.65, duration: 0.92, ease: "power3.in", onUpdate: () => (arch.style.scale = g.scale) }, 0)
        .to(copy, { y: () => -innerHeight * 0.208, duration: 0.88, ease: "power2.in" }, 0)
        .to(copy, { autoAlpha: 0, duration: 0.14 }, 0.74)
        .to(band, { autoAlpha: 0, y: () => innerHeight * 0.04, duration: 0.15 }, 0.15)
        .to(solid, { opacity: 1, duration: 0.32, ease: "sine.inOut" }, 0.6)
        .to([backdrop, dustCanvas], { opacity: 0, duration: 0.32, ease: "sine.inOut" }, 0.6)
        .to(heroLight, { opacity: 0, duration: 0.14, ease: "sine.inOut" }, 0.62)
        .to(sceneBox, { opacity: 0, duration: 0.02 }, 0.92)
        .to(solid, { opacity: 0, duration: 0.01 }, 0.95)
        .fromTo(header, { "--hero-exit": 0 }, { "--hero-exit": 1, duration: 0.08 }, 0.52);
      const head = next?.querySelector(".f-head");
      if (head) tl.fromTo(head, { autoAlpha: 0, y: () => innerHeight * 0.02 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: "ui.out" }, 0.86);
    }
    tl.set({}, {}, 1);
    let ro = null;
    if (next) {
      ro = new ResizeObserver(() => { next.style.setProperty("--hero-next-h", `${next.offsetHeight}px`); ScrollTrigger.refresh(); });
      ro.observe(next);
    }
    // The arch tilts toward the cursor — ±3° vertical, ±5° horizontal (.8s ui.out)
    let off = () => {};
    if (hover) {
      const tx = gsap.quickTo(arch, "--tilt-x", { duration: 0.8, ease: "ui.out" });
      const ty = gsap.quickTo(arch, "--tilt-y", { duration: 0.8, ease: "ui.out" });
      const tilt = (e) => { if (root.classList.contains("is-intro-lock") || stage.classList.contains("is-past")) return; tx((1 - (e.clientY / innerHeight) * 2) * 3); ty(((e.clientX / innerWidth) * 2 - 1) * 5); };
      addEventListener("pointermove", tilt, { passive: true });
      off = () => removeEventListener("pointermove", tilt);
    }
    return () => { hero.classList.remove("is-pinned"); ro?.disconnect(); next?.style.removeProperty("--hero-next-h"); off(); onProgress(0); };
  });
  mm.add("(max-width: 767px)", () => {
    const st = ScrollTrigger.create({ trigger: stage, start: "top top", end: "bottom top", onUpdate: (s) => { header.classList.toggle("is-past-hero", scrollY > stage.offsetHeight - 120); nave?.setProgress(0); } });
    header.classList.toggle("is-past-hero", scrollY > stage.offsetHeight - 120);
    return () => st.kill();
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { root.classList.remove("is-hero"); header.classList.add("is-past-hero"); });

  // Client band — stops when off screen
  const logos = hero.querySelector(".f-logos");
  if (logos) new IntersectionObserver(([e]) => logos.classList.toggle("is-paused", !e.isIntersecting)).observe(logos);

  // ───────── Product screen touch response ─────────
  // Ask button — when closed, a blue light circles its edge once every 6s, and on press the answer floats up .25rem from below in .2s
  const ask = document.querySelector(".f-ask__button"), answer = document.querySelector(".f-app__answer");
  if (ask && answer) {
    new IntersectionObserver(([e]) => ask.classList.toggle("is-seen", e.isIntersecting)).observe(ask);
    const label = ask.querySelector(".f-ask__label");
    ask.addEventListener("click", () => {
      const open = answer.hidden;
      answer.hidden = !open;
      ask.classList.toggle("is-calling", !open);
      ask.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Erase" : "Asking";
    });
  }

  // Step tabs — the plate slides to the chosen cell in .25s (pill-tab-slide), and the window’s cells change from blur 2px · .375rem in .2s (staggered 30 · 60 · 90ms)
  const steps = document.querySelector(".f-tabs__list");
  const stack = document.querySelector(".f-win__stack");
  if (steps && stack) {
    const layers = [...stack.children];
    let now = 0;
    steps.addEventListener("click", (e) => {
      const tab = e.target.closest(".f-tabs__tab"); if (!tab) return;
      const i = +tab.dataset.step; if (i === now) return;
      stack.dataset.dir = i > now ? "down" : "up";
      layers[now].classList.remove("is-active");
      layers[i].classList.add("is-active");
      now = i;
    });
  }

  // Two match cases — the right pane’s label, score line and button text change
  const cases = document.querySelector(".f-cases"), caseWin = document.querySelector(".f-case");
  if (cases && caseWin) {
    const body = caseWin.querySelector(".f-case__body"), mode = caseWin.querySelector(".f-case__mode"), score = caseWin.querySelector(".f-score"), undo = body.querySelector(".f-pbtn");
    const TEXT = [
      { mode: "Self-written", score: "<b>00%</b> The agent wrote this beyond the standard", undo: "Undo" },
      { mode: "Waiting", score: "<b>00%</b> Below the standard, so it waits for a person", undo: "Custom approval" },
    ];
    cases.addEventListener("click", (e) => {
      const tab = e.target.closest(".f-tabs__tab"); if (!tab) return;
      const t = TEXT[+tab.dataset.case];
      caseWin.dataset.case = tab.dataset.case;
      body.animate([{ opacity: 0, transform: "translateY(0.375rem)", filter: "blur(2px)" }, { opacity: 1, transform: "none", filter: "none" }], { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      mode.textContent = t.mode;
      score.innerHTML = `${score.querySelector(".f-agentmark").outerHTML}${t.score}`;
      undo.textContent = t.undo;
    });
  }

  // Agent button on the checkout screen — the center column opens from 0 → 19.75rem in .3s
  const page = document.querySelector(".f-page"), toggle = document.querySelector(".f-agent-toggle");
  if (toggle) new IntersectionObserver(([e]) => toggle.classList.toggle("is-seen", e.isIntersecting)).observe(toggle);
  if (page && toggle) toggle.addEventListener("click", () => {
    const open = page.classList.toggle("is-agent");
    toggle.setAttribute("aria-expanded", String(open));
    page.querySelector(".f-page__agent").setAttribute("aria-hidden", String(!open));
  });

  // Copy button — shows ‹Copied› for 1.5s (2s for the code window)
  document.querySelectorAll(".f-copy").forEach((b) => {
    const was = b.textContent, hold = b.classList.contains("--box") ? 2000 : 1500;
    let t = 0;
    b.addEventListener("click", () => { b.textContent = b.dataset.copied || "Copied"; b.classList.add("is-done"); clearTimeout(t); t = setTimeout(() => { b.textContent = was; b.classList.remove("is-done"); }, hold); });
  });

  // Final call to action — on send, the button flashes orange for .7s
  const cta = document.querySelector(".f-cta__button");
  if (cta) cta.addEventListener("click", () => { cta.classList.remove("is-lit"); void cta.offsetWidth; cta.classList.add("is-lit"); });

  // Dot graph — Jan to Mar by hand (50 gray dots, a few high ones) · Apr to Sep by agent (103 blue dots), a band over 45 days
  const plot = document.querySelector(".f-plot__svg");
  if (plot) {
    const NS = "http://www.w3.org/2000/svg", W = 640, H = 200, top = 70, cut = 45;
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const y = (d) => H - (d / top) * H;
    const el = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); plot.append(n); return n; };
    el("rect", { class: "f-plot__band", x: 0, y: 0, width: W, height: y(cut) });
    el("line", { class: "f-plot__cut", x1: 0, x2: W, y1: y(cut), y2: y(cut) });
    const dot = (x, d, agent) => el("circle", { class: `f-plot__dot${agent ? " --agent" : ""}`, cx: x.toFixed(1), cy: y(d).toFixed(1), r: 2.6 });
    for (let i = 0; i < 50; i++) { const x = (i / 50) * 220 + rnd() * 6; const hi = rnd() < 0.18; dot(x, hi ? 46 + rnd() * 22 : 30 + rnd() * 14, false); }
    for (let i = 0; i < 103; i++) { const x = 205 + (i / 103) * 430 + rnd() * 4; dot(x, i === 60 ? 45.5 : 20 + rnd() * 16 + (i < 10 ? 6 : 0), true); }
  }
})();
