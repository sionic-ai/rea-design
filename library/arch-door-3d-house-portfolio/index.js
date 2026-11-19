// Scroll progress (0..1) is the camera position. The original sets action.time on a camera clip baked into the GLB = Scrub by progress × length (ease none).
// Here the key positions fitted by shooting the original screen in 16 slices are joined with Catmull-Rom, and a bright curtain covers the spot where the room changes.
(() => {
  const PK = window.PK;
  const canvas = document.querySelector(".pk-canvas");
  const fade = document.querySelector(".pk-fade");
  const root = document.documentElement;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (e) {
    PK.ready();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(14, 1, 0.05, 400);

  // Key spot: at progress p, the camera pos looks at tgt with vertical field of view fov
  const KEYS = [
    [ // Room 1: outer door (flattened with a 14° telephoto) → through the door → living room → approach the text wall and into the cream light
      { p: 0, pos: [0, 1.5, 23], tgt: [0, 1.39, 0], fov: 14 },
      { p: 0.03, pos: [0, 1.48, 11], tgt: [0, 1.42, 0], fov: 22 },
      { p: 0.0625, pos: [-0.05, 1.5, -0.8], tgt: [0.45, 1.5, -4.6], fov: 50 },
      { p: 0.095, pos: [-0.35, 1.6, -3.0], tgt: [0.0, 1.4, -9.5], fov: 54 },
      { p: 0.125, pos: [-0.3, 1.55, -4.4], tgt: [0.3, 1.4, -11.5], fov: 54 },
      { p: 0.1875, pos: [-1.3, 1.65, -10.6], tgt: [-1.9, 1.75, -14.4], fov: 50 },
      { p: 0.24, pos: [-1.6, 1.85, -13.6], tgt: [-1.8, 1.9, -15], fov: 48 },
      { p: 0.25, pos: [-1.65, 1.88, -14.1], tgt: [-1.8, 1.9, -15], fov: 48 },
    ],
    [ // Room 2: disc-wall gallery — seen through an arch in a cream wall, then passes through the arch and approaches low toward the black sphere
      { p: 0.25, pos: [0.4, 1.7, 10.5], tgt: [0.35, 1.5, -1.0], fov: 46 },
      { p: 0.28, pos: [0.4, 1.6, 7.4], tgt: [0.35, 1.5, -1.0], fov: 46 },
      { p: 0.3125, pos: [0.35, 1.45, 5.3], tgt: [0.35, 1.4, -1.0], fov: 46 },
      { p: 0.375, pos: [0.45, 1.15, 2.8], tgt: [0.45, 1.0, -1.2], fov: 46 },
      { p: 0.408, pos: [0.5, 1.05, 1.7], tgt: [0.5, 0.98, -1.2], fov: 46 },
    ],
    [ // Room 3: Sunset water garden — follow the stepping stones to the sofa in the center
      { p: 0.408, pos: [0.3, 1.9, 12.8], tgt: [0.3, 1.45, 0], fov: 50 },
      { p: 0.4375, pos: [0.3, 1.8, 11.3], tgt: [0.3, 1.35, 0], fov: 50 },
      { p: 0.5, pos: [0.6, 1.5, 8.8], tgt: [0.2, 1.1, -2], fov: 50 },
      { p: 0.5625, pos: [0.6, 1.3, 6.2], tgt: [0.0, 0.9, -3], fov: 50 },
      { p: 0.625, pos: [0.1, 1.15, 3.4], tgt: [-0.7, 0.7, -3], fov: 50 },
      { p: 0.688, pos: [-0.2, 1.0, 1.6], tgt: [-0.9, 0.6, -3], fov: 50 },
    ],
    [ // Room 4: starts in front of the desk, turns half a circle to the right and stands at the back (doll side)
      { p: 0.688, pos: [0, 1.75, 6.2], tgt: [0, 1.2, 0], fov: 46 },
      { p: 0.75, pos: [0, 1.6, 3.7], tgt: [0, 1.2, 0], fov: 46 },
      { p: 0.8125, pos: [1.5, 1.5, 2.7], tgt: [0, 1.15, 0], fov: 46 },
      { p: 0.875, pos: [2.9, 1.42, 0.3], tgt: [0, 1.1, 0], fov: 46 },
      { p: 0.9375, pos: [1.6, 1.38, -2.4], tgt: [-0.05, 1.1, 0], fov: 46 },
      { p: 1, pos: [0.12, 1.38, -2.75], tgt: [-0.18, 1.12, 0], fov: 46 },
    ],
  ];
  // Between rooms: rooms change at progress p, and the film fills and clears by w before and after.
  // First transition (portal): instead of lifting away, an arch-shaped hole opens in a cream wall and the hole grows past the screen edges during out
  const CUTS = [
    { p: 0.25, w: 0.022, out: 0.032, bg: "var(--site-cut-portal)", portal: true },
    { p: 0.408, w: 0.016, bg: "radial-gradient(80% 70% at 50% 50%, var(--site-cut-2a), var(--site-cut-2b))" },
    { p: 0.688, w: 0.03, bg: "radial-gradient(90% 80% at 50% 60%, var(--site-cut-3a), var(--site-cut-3b))" },
  ];
  const OPEN_AT = 0.004;
  const TOUR_END = 0.985;
  // Only the sunset water garden (room 3) gets bloom — original values (strength .42, radius .45, threshold .88), only when the window is wider than 960px, ?bloom=Off if 0
  const BLOOM = { room: 2, strength: 0.42, radius: 0.45, threshold: 0.88 };
  const bloomOn = innerWidth > 960 && new URLSearchParams(location.search).get("bloom") !== "0";

  // Filter only the bright areas (brightness threshold + .01 softness), blur five downscaled copies with a Gaussian (kernels 3·5·7·9·11),
  // Each step adds weights 1·.8·.6·.4·.2 shifted by radius toward 1.2−f, times intensity, layered over the scene. The scene is drawn in an HDR buffer and finally output with tone mapping and sRGB
  function makeBloom() {
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    const qScene = new THREE.Scene();
    qScene.add(quad);
    const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const vert = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
    const rt = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, ...o });
    const MIPS = 5, KERNEL = [3, 5, 7, 9, 11];
    const scene = rt(1, 1, { samples: 4 });
    const bright = rt(1, 1), hs = [], vs = [];
    for (let i = 0; i < MIPS; i++) { hs.push(rt(1, 1)); vs.push(rt(1, 1)); }
    const high = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, threshold: { value: BLOOM.threshold }, smoothWidth: { value: 0.01 } },
      vertexShader: vert,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float threshold, smoothWidth; varying vec2 vUv;
        void main() { vec4 t = texture2D(tDiffuse, vUv); float v = dot(t.rgb, vec3(0.299, 0.587, 0.114));
          gl_FragColor = mix(vec4(0.0), t, smoothstep(threshold, threshold + smoothWidth, v)); }`,
    });
    const blurs = KERNEL.map((k) => {
      const w = [];
      for (let i = 0; i < k; i++) w.push((0.39894 * Math.exp((-0.5 * i * i) / (k * k))) / k);
      return new THREE.ShaderMaterial({
        defines: { KERNEL_RADIUS: k },
        uniforms: { tDiffuse: { value: null }, invSize: { value: new THREE.Vector2() }, direction: { value: new THREE.Vector2() }, weights: { value: w } },
        vertexShader: vert,
        fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 invSize, direction; uniform float weights[KERNEL_RADIUS]; varying vec2 vUv;
          void main() { float sum = weights[0]; vec3 c = texture2D(tDiffuse, vUv).rgb * sum;
            for (int i = 1; i < KERNEL_RADIUS; i++) { float x = float(i); float wt = weights[i]; vec2 o = direction * invSize * x;
              c += (texture2D(tDiffuse, vUv + o).rgb + texture2D(tDiffuse, vUv - o).rgb) * wt; sum += 2.0 * wt; }
            gl_FragColor = vec4(c / sum, 1.0); }`,
      });
    });
    const factor = (f) => f + (1.2 - f - f) * BLOOM.radius;
    const mix = new THREE.ShaderMaterial({
      uniforms: { b0: { value: null }, b1: { value: null }, b2: { value: null }, b3: { value: null }, b4: { value: null },
        factors: { value: [1, 0.8, 0.6, 0.4, 0.2].map(factor) }, strength: { value: BLOOM.strength } },
      vertexShader: vert,
      fragmentShader: `uniform sampler2D b0, b1, b2, b3, b4; uniform float factors[5], strength; varying vec2 vUv;
        void main() { gl_FragColor = strength * (factors[0] * texture2D(b0, vUv) + factors[1] * texture2D(b1, vUv) + factors[2] * texture2D(b2, vUv)
          + factors[3] * texture2D(b3, vUv) + factors[4] * texture2D(b4, vUv)); }`,
    });
    const blend = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null } }, vertexShader: vert, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
      fragmentShader: "uniform sampler2D tDiffuse; varying vec2 vUv; void main() { gl_FragColor = texture2D(tDiffuse, vUv); }",
    });
    const out = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null } }, vertexShader: vert,
      fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tDiffuse, vUv);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(qScene, qCam); };
    return {
      setSize(w, h) {
        scene.setSize(w, h);
        let x = Math.round(w / 2), y = Math.round(h / 2);
        bright.setSize(x, y);
        for (let i = 0; i < MIPS; i++) {
          hs[i].setSize(x, y); vs[i].setSize(x, y);
          blurs[i].uniforms.invSize.value.set(1 / x, 1 / y);
          x = Math.round(x / 2); y = Math.round(y / 2);
        }
      },
      render(sc, cam) {
        renderer.setRenderTarget(scene);
        renderer.render(sc, cam);
        high.uniforms.tDiffuse.value = scene.texture;
        pass(high, bright);
        let input = bright;
        for (let i = 0; i < MIPS; i++) {
          const b = blurs[i];
          b.uniforms.tDiffuse.value = input.texture; b.uniforms.direction.value.set(1, 0); pass(b, hs[i]);
          b.uniforms.tDiffuse.value = hs[i].texture; b.uniforms.direction.value.set(0, 1); pass(b, vs[i]);
          input = vs[i];
        }
        for (let i = 0; i < MIPS; i++) mix.uniforms[`b${i}`].value = vs[i].texture;
        pass(mix, hs[0]);
        blend.uniforms.tDiffuse.value = hs[0].texture;
        renderer.autoClear = false;
        pass(blend, scene);
        renderer.autoClear = true;
        out.uniforms.tDiffuse.value = scene.texture;
        pass(out, null);
      },
    };
  }
  let bloom = null;

  let world, rooms, active = -1;
  const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const cr = (a, b, c, d, t) => {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  };

  function sample(p) {
    let r = 0;
    for (const c of CUTS) if (p >= c.p) r++;
    r = Math.min(r, KEYS.length - 1);
    const ks = KEYS[r];
    let i = 0;
    while (i < ks.length - 2 && p > ks[i + 1].p) i++;
    const k0 = ks[Math.max(0, i - 1)], k1 = ks[i], k2 = ks[i + 1] || k1, k3 = ks[Math.min(ks.length - 1, i + 2)];
    const span = k2.p - k1.p || 1;
    const t = Math.min(1, Math.max(0, (p - k1.p) / span));
    const out = { room: r, pos: [0, 0, 0], tgt: [0, 0, 0], fov: cr(k0.fov, k1.fov, k2.fov, k3.fov, t) };
    for (const f of ["pos", "tgt"]) for (let j = 0; j < 3; j++) out[f][j] = cr(k0[f][j], k1[f][j], k2[f][j], k3[f][j], t);
    return out;
  }

  function setRoom(r) {
    if (r === active) return;
    active = r;
    rooms.forEach((room, i) => (room.group.visible = i === r));
    scene.environment = rooms[r].envMap;
    scene.background = new THREE.Color(rooms[r].bg);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    if (bloom) bloom.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let st, still = PK.reduce;
  const smooth = (x) => x * x * (3 - 2 * x);
  function frame(time) {
    const p = st ? st.progress : 0;
    const s = sample(p);
    setRoom(s.room);
    camera.position.set(...s.pos);
    camera.lookAt(...s.tgt);
    // On portrait screens the vertical field of view is widened to fit more width. The original widens it only slightly in the outer door scene (14°→16.6°, the door fills half the screen),
    // Inside the room it widens greatly — the exponent shifts while passing through the door
    const e = 0.18 + 0.44 * smooth(Math.min(1, p / 0.0625));
    const k = camera.aspect < 1.2 ? Math.pow(1.2 / camera.aspect, e) : 1;
    camera.fov = (2 * Math.atan(Math.tan((s.fov * Math.PI) / 360) * k) * 180) / Math.PI;
    camera.updateProjectionMatrix();

    const door = rooms[0].door;
    door.hinge.rotation.y = door.closed + (door.open - door.closed) * smooth(Math.min(1, p / 0.035));
    root.classList.toggle("ent-door", p >= OPEN_AT);
    root.classList.toggle("tour-end", p >= TOUR_END);

    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    let f = 0, cut = CUTS[0], hole = 0;
    for (const c of CUTS) {
      let v;
      if (c.portal && p >= c.p) {
        const u = (p - c.p) / c.out;
        v = u < 1 ? 1 : 0;
        if (v) hole = 0.35 * Math.pow(16, smooth(clamp01(u)));
      } else v = smooth(clamp01((1 - Math.abs(p - c.p) / c.w) * 1.25));
      if (v > f) { f = v; cut = c; }
    }
    fade.style.opacity = f.toFixed(3);
    fade.classList.toggle("is-portal", hole > 0);
    if (f > 0) {
      fade.style.setProperty("--fade-bg", cut.bg);
      fade.style.setProperty("--fade-hole", hole.toFixed(3));
    }

    world.update(still ? 0 : time, still);
    if (bloom && active === BLOOM.room) bloom.render(scene, camera);
    else renderer.render(scene, camera);
  }

  const fontsReady = () => Promise.race([
    Promise.all([
      document.fonts.load('300 40px "Jost"'),
      document.fonts.load('500 40px "Montserrat"'),
      document.fonts.load('400 40px "Noto Sans KR"', "Your keyword here"),
      document.fonts.load('500 40px "Noto Sans KR"', "Your keyword here"),
    ]),
    new Promise((r) => setTimeout(r, 3000)),
  ]);

  (async () => {
    PK.progress(0.15);
    await fontsReady();
    PK.progress(0.4);
    world = await window.PKWorld(THREE, (i) => PK.progress(0.4 + i * 0.07));
    rooms = world.rooms;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const breathe = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    for (const r of rooms) {
      r.envMap = pmrem.fromScene(r.env, 0.02).texture;
      scene.add(r.group);
      await breathe();
    }
    pmrem.dispose();
    PK.progress(0.65);
    if (bloomOn) bloom = makeBloom();
    resize();
    addEventListener("resize", resize);

    st = ScrollTrigger.create({ trigger: "#scene", start: "top top", end: "bottom bottom" });
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      still = ctx.conditions.reduce;
    });

    // Build the shaders once per room before the first paint so there’s no hitch when rooms change
    for (let i = 0; i < rooms.length; i++) {
      setRoom(i);
      renderer.compile(scene, camera);
      PK.progress(0.65 + i * 0.06);
      await breathe();
    }
    // The blur plane has its own shader that draws to an HDR plane, so pre-draw one water garden
    if (bloom) {
      setRoom(BLOOM.room);
      bloom.render(scene, camera);
    }
    active = -1;
    frame(0);
    PK.progress(0.9);
    gsap.ticker.add((t) => frame(t));
    PK.ready();
  })();
})();
