/* Brand showreel experience — draws ten sections one after another on one three r186 canvas, moving between them with a different shader transition per section like the original.
   Section list, transition types and durations are as in the original: BOOT(cut) → VOLT(led 1.25s) → MUSEUM(peel 1.7s) → MONUMENT(portal 1s) → NEON(flash .9s)
   → POSTER(tube .8s) → BREAKOUT(cut) → STYLE RUN(flash .7s) → SHATTER(cut) → LOGO(flash .9s).
   The original’s scanned figure, robot model and shaders are not used — the same scene is built with our own shapes (sphere·capsule·box) of the same size and silhouette ratio, and our own shader. */
(() => {
  const T = window.THREE, Fun = window.Fun;
  if (!T || !Fun) return;
  const canvas = document.getElementById("gl");
  const reduce = Fun.reduce, body = document.body;

  /* Resolve skin colors through a canvas into three colors — CSS colors like oklch(from …) are read as-is too */
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const col = (name) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = Fun.css(name) || Fun.css("--kf-dim");
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color(r / 255, g / 255, b / 255);
  };
  const C = {};
  const readColors = () => Object.assign(C, { bg: col("--kf-bg"), ink: col("--kf-ink"), accent: col("--kf-accent"), volt: col("--site-volt"), green: col("--site-green"), phos: col("--site-phos"), paper: col("--kf-contrast-bg"), dim: col("--kf-dim") });
  readColors();
  const hex = (c) => `#${c.getHexString()}`;

  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); }
  catch (e) { document.getElementById("ui-loading")?.removeAttribute("hidden"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;

  const W = () => innerWidth, H = () => innerHeight;
  const mkRT = () => new T.WebGLRenderTarget(1, 1, { samples: 4, type: T.HalfFloatType });
  const rtA = mkRT(), rtB = mkRT(), rtPost = mkRT();
  const size = () => {
    renderer.setSize(W(), H(), false);
    const pr = renderer.getPixelRatio(), w = Math.round(W() * pr), h = Math.round(H() * pr);
    [rtA, rtB, rtPost].forEach((r) => r.setSize(w, h));
    /* On portrait screens the vertical field of view is widened to keep the horizontal view of a 16:10 screen — so the scene doesn’t come in cropped on phones */
    const asp = W() / H(), ref = 1.6;
    stations.forEach((s) => { if (!s.cam) return; s.cam.userData.fov ??= s.cam.fov; const base = s.cam.userData.fov * Math.PI / 180;
      s.cam.fov = asp >= ref ? s.cam.userData.fov : (2 * Math.atan(Math.tan(base / 2) * ref / asp)) * 180 / Math.PI; s.cam.aspect = asp; s.cam.updateProjectionMatrix(); });
  };

  /* Reflective panel — a room bright above and at the sides is baked with PMREM so glossy black · chrome · bronze reflect with the same grain */
  const pmrem = new T.PMREMGenerator(renderer);
  const envScene = new T.Scene();
  envScene.add(new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ color: 0x0c0c0c, side: T.BackSide })));
  [[0, 12, 0, 18, 4, 1], [-12, 3, 4, 3, 10, .7], [12, 4, -2, 4, 8, .55], [0, 2, 14, 10, 2, .35]].forEach(([x, y, z, w, h, k]) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k * 6, k * 6, k * 6), side: T.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
  });
  const ENV = pmrem.fromScene(envScene, 0.02).texture;

  /* Text plate — drawn on canvas as a texture */
  const painted = [];
  const textTex = (draw, w = 1024, h = 512) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    painted.push(() => { const g = c.getContext("2d"); g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; });
    return t;
  };
  /* If the font attaches late, redraw the canvas text */
  document.fonts?.ready.then(() => painted.forEach((f) => f()));
  const DISPLAY = () => Fun.css("--kf-font-display") || "sans-serif";
  const TERM = () => Fun.css("--kf-font-term") || "monospace";

  /* Helmet robot — glossy black sphere head (diameter 2), red rim ring, LED face panel, ear covers on both sides, shark teeth, two sneakers */
  const ledFace = (mood = "smile") => textTex((g, w, h) => {
    g.fillStyle = hex(C.bg); g.fillRect(0, 0, w, h);
    g.fillStyle = hex(C.green); g.shadowColor = hex(C.green); g.shadowBlur = 18;
    const px = 22, eye = (cx, cy) => { const pts = mood === "smile" ? [[0, 1], [1, 0], [2, 1]] : [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]]; pts.forEach(([x, y]) => g.fillRect(cx + x * px, cy + y * px, px - 4, px - 4)); };
    eye(w * .3 - px, h * .38); eye(w * .62, h * .38);
  }, 512, 256);
  const makeRobot = () => {
    const g = new T.Group();
    const black = new T.MeshPhysicalMaterial({ color: 0x050505, roughness: .12, metalness: .2, clearcoat: 1, clearcoatRoughness: .05, envMap: ENV, envMapIntensity: 1.4 });
    const rim = new T.MeshStandardMaterial({ color: C.accent, emissive: C.accent, emissiveIntensity: 1.6, roughness: .3 });
    const head = new T.Mesh(new T.SphereGeometry(1, 64, 48), black); head.castShadow = true; g.add(head);
    const ring = new T.Mesh(new T.TorusGeometry(1.02, .035, 12, 96), rim); ring.rotation.y = Math.PI / 2; g.add(ring);
    const ring2 = new T.Mesh(new T.TorusGeometry(.78, .02, 8, 64, Math.PI * 1.2), rim); ring2.position.z = .63; ring2.rotation.z = Math.PI * -.1; g.add(ring2);
    const face = new T.Mesh(new T.PlaneGeometry(1.2, .6), new T.MeshBasicMaterial({ map: ledFace(), transparent: true, toneMapped: false, depthTest: false }));
    face.position.set(0, .12, 1.03); face.renderOrder = 2; g.add(face); g.userData.face = face;
    const teeth = new T.Mesh(new T.ConeGeometry(.6, .22, 12, 1, true, 0, Math.PI), new T.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .4, side: T.DoubleSide }));
    teeth.position.set(0, -.45, .72); teeth.rotation.set(Math.PI * .5, 0, 0); teeth.scale.set(1, 1, .4); g.add(teeth);
    [-1, 1].forEach((s) => {
      const ear = new T.Mesh(new T.CylinderGeometry(.36, .36, .26, 40), black); ear.rotation.z = Math.PI / 2; ear.position.x = s * 1.04; g.add(ear);
      const pad = new T.Mesh(new T.TorusGeometry(.33, .04, 10, 40), rim); pad.rotation.y = Math.PI / 2; pad.position.x = s * 1.18; g.add(pad);
      const shoe = new T.Mesh(new T.CapsuleGeometry(.22, .42, 6, 16), new T.MeshStandardMaterial({ color: C.accent, roughness: .35, metalness: .1, envMap: ENV })); shoe.rotation.x = Math.PI / 2; shoe.position.set(s * .42, -1.42, .12); shoe.castShadow = true; g.add(shoe);
    });
    return g;
  };

  /* Default stage used by each section */
  const stage = (bg, fov = 35) => {
    const scene = new T.Scene(); scene.background = bg ? bg.clone() : null;
    const cam = new T.PerspectiveCamera(fov, W() / H(), .1, 200);
    return { scene, cam };
  };
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => { mouse.x = (e.clientX / W()) * 2 - 1; mouse.y = (e.clientY / H()) * 2 - 1; }, { passive: true });

  /* Screen panel shader (post-processing per section) */
  const quadGeo = new T.PlaneGeometry(2, 2);
  const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const post = (frag, uniforms = {}) => {
    const mat = new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new T.Vector2(1, 1) }, ...uniforms },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }", fragmentShader: frag, depthTest: false, depthWrite: false });
    const sc = new T.Scene(); sc.add(new T.Mesh(quadGeo, mat));
    return { mat, run: (src, dst, t) => { mat.uniforms.tDiffuse.value = src.texture; mat.uniforms.uTime.value = t; mat.uniforms.uRes.value.set(src.width, src.height); renderer.setRenderTarget(dst); renderer.render(sc, quadCam); } };
  };
  const NOISE = "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }";

  const stations = [];
  const def = (s) => stations.push(s);

  /* ── 02 VOLT — helmet robot in front of a red graffiti letter wall. Press and a balloon-letter mass inflates and stickers pop ── */
  def((() => {
    const { scene, cam } = stage(null, 32);
    cam.position.set(0, .2, 7.2);
    const wall = textTex((g, w, h) => {
      g.fillStyle = hex(C.accent.clone().multiplyScalar(.55)); g.fillRect(0, 0, w, h);
      g.font = `900 150px ${DISPLAY()}`; g.textBaseline = "middle";
      for (let r = 0; r < 4; r++) for (let k = -1; k < 3; k++) {
        g.save(); g.translate(k * 560 + (r % 2) * 280, 70 + r * 128); g.rotate(-.08);
        g.fillStyle = hex(C.accent); g.strokeStyle = hex(C.accent.clone().multiplyScalar(.3)); g.lineWidth = 10; g.lineJoin = "round";
        g.strokeText("BRAND", 0, 0); g.fillText("BRAND", 0, 0); g.restore();
      }
    }, 1024, 512);
    wall.wrapS = wall.wrapT = T.RepeatWrapping;
    const bgMat = new T.ShaderMaterial({ uniforms: { map: { value: wall }, uTime: { value: 0 } }, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, .999, 1.); }",
      fragmentShader: "uniform sampler2D map; uniform float uTime; varying vec2 vUv; void main(){ vec2 uv = vUv * vec2(1.6, 1.4) + vec2(uTime * .03, -uTime * .012); float wob = sin(uv.y * 9. + uTime * 2.) * .004; vec3 c = texture2D(map, uv + wob).rgb; float v = smoothstep(1.2, .2, length(vUv - .5)); gl_FragColor = vec4(c * (.35 + .75 * v), 1.); }" });
    const bg = new T.Mesh(quadGeo, bgMat); bg.frustumCulled = false; bg.renderOrder = -1; scene.add(bg);
    const robot = makeRobot(); robot.position.y = .25; scene.add(robot);
    scene.add(new T.HemisphereLight(0xffffff, 0x220000, .6));
    const key = new T.SpotLight(C.accent, 60, 30, .5, .6); key.position.set(-4, 4, 5); scene.add(key);
    const back = new T.PointLight(C.accent, 40, 12); back.position.set(2.5, 2, -2); scene.add(back);
    const fill = new T.DirectionalLight(0xffffff, 1.2); fill.position.set(3, 2, 6); scene.add(fill);
    /* Twelve balloon letter chunks — pressing inflates them with elastic to fill the space around the robot */
    const balloons = new T.Group(); scene.add(balloons);
    const bmat = new T.MeshPhysicalMaterial({ color: 0x080808, roughness: .08, clearcoat: 1, envMap: ENV, envMapIntensity: 1.6, transparent: true, opacity: .92 });
    for (let i = 0; i < 12; i++) {
      const b = new T.Mesh(new T.CapsuleGeometry(.32 + Math.random() * .25, .4 + Math.random() * .6, 8, 24), bmat);
      const a = (i / 12) * Math.PI * 2;
      b.position.set(Math.cos(a) * (2.2 + Math.random()), Math.sin(a) * 1.4 + .2, -1 - Math.random() * 1.5);
      b.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); b.scale.setScalar(0.001); balloons.add(b);
    }
    let popped = false;
    const pop = () => {
      if (popped) return; popped = true; Fun.hintOff();
      balloons.children.forEach((b, i) => gsap.to(b.scale, { x: 1, y: 1, z: 1, duration: reduce ? 0 : 1.1, delay: reduce ? 0 : i * .05, ease: "elastic.out(1, .45)" }));
    };
    return { id: "volt", num: "02", chapter: "VOLT", cuts: "C05–C08", arrive: { type: "led", duration: 1.25 }, scene, cam,
      title: "Your section title here", lead: "Your one line introducing this section — try clicking the robot.",
      enter() { popped = false; balloons.children.forEach((b) => b.scale.setScalar(.001)); Fun.hint("click", W() * .5, H() * .5, "Try pressing"); },
      click: pop,
      update(t) {
        bgMat.uniforms.uTime.value = t;
        robot.rotation.y = Math.sin(t * .6) * .25 + mouse.sx * .5; robot.rotation.x = mouse.sy * .2; robot.position.y = .25 + Math.sin(t * 1.6) * .06;
        balloons.children.forEach((b, i) => { b.rotation.y += .004; b.position.y += Math.sin(t * 1.3 + i) * .0015; });
      } };
  })());

  /* ── 03 MUSEUM — a dark gallery, four pedestals and figure sculptures (white plaster·chrome·bronze·navy) under pin lights falling from above ── */
  const figure = (mat, pose = 0) => {
    const g = new T.Group();
    const torso = new T.Mesh(new T.CapsuleGeometry(.32, .7, 8, 20), mat); torso.position.y = 1.15; g.add(torso);
    const head = new T.Mesh(new T.SphereGeometry(.24, 32, 24), mat); head.position.y = 1.85; g.add(head);
    const hair = new T.Mesh(new T.IcosahedronGeometry(.3, 0), mat); hair.position.y = 2.02; hair.scale.set(1, .6, 1); g.add(hair);
    [-1, 1].forEach((s) => {
      const arm = new T.Mesh(new T.CapsuleGeometry(.09, .62, 6, 12), mat); arm.position.set(s * .45, 1.2, 0); arm.rotation.z = s * (.35 + pose * .6); g.add(arm);
      const leg = new T.Mesh(new T.CapsuleGeometry(.12, .7, 6, 12), mat); leg.position.set(s * .17, .42, 0); leg.rotation.z = s * pose * .25; g.add(leg);
    });
    g.traverse((m) => m.isMesh && (m.castShadow = true));
    return g;
  };
  def((() => {
    const { scene, cam } = stage(C.bg.clone().lerp(C.accent, .02), 38);
    scene.fog = new T.Fog(scene.background, 6, 18);
    const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ color: 0x120c08, roughness: .85 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const mats = [new T.MeshStandardMaterial({ color: 0xe9e2d6, roughness: .8 }), new T.MeshStandardMaterial({ color: 0xdedede, roughness: .08, metalness: 1, envMap: ENV }),
      new T.MeshStandardMaterial({ color: 0xb46a3c, roughness: .35, metalness: .9, envMap: ENV }), new T.MeshStandardMaterial({ color: 0x1d2a52, roughness: .5, metalness: .2, envMap: ENV })];
    const pedMat = new T.MeshStandardMaterial({ color: 0xf1ede6, roughness: .7 });
    const spots = [];
    [[-2.4, 0], [0, -1.5], [2.3, -.4], [4.5, -2.6]].forEach(([x, z], i) => {
      const ped = new T.Mesh(new T.BoxGeometry(1.1, 1, 1.1), pedMat); ped.position.set(x, .5, z); ped.castShadow = ped.receiveShadow = true; scene.add(ped);
      const f = figure(mats[i], i * .5); f.position.set(x, 1, z); f.rotation.y = -.3 + i * .25; scene.add(f);
      const sp = new T.SpotLight(0xfff1dc, 70, 12, .32, .55, 1.4); sp.position.set(x, 6.5, z + 1.2); sp.target = f; sp.castShadow = true; sp.shadow.mapSize.set(512, 512); scene.add(sp); spots.push(sp);
    });
    scene.add(new T.AmbientLight(0xffe0c0, .06));
    return { id: "museum", num: "03", chapter: "MUSEUM", cuts: "C09–C11", arrive: { type: "peel", duration: 1.7 }, scene, cam,
      title: "Your section title here", lead: "Your one-line gallery intro here — drag to explore.",
      enter() { this.t0 = null; },
      update(t, dt) {
        this.t0 ??= t; const k = Math.min(1, (t - this.t0) / 7);
        cam.position.set(-1.2 + k * 2.4 + mouse.sx * .6, 2.1 + mouse.sy * -.3, 6.2 - k * 1.2); cam.lookAt(.6, 1.55, -1);
        spots.forEach((s, i) => (s.intensity = 70 * (0.85 + Math.sin(t * 3 + i) * .02)));
      } };
  })());

  /* ── 03 MONUMENT — bronze group statue and a WE ARE ___. pedestal, cone of light overhead, electric sparks crawling over the figures ── */
  def((() => {
    const { scene, cam } = stage(C.bg.clone(), 34);
    const bronze = new T.MeshStandardMaterial({ color: 0xa8683a, roughness: .38, metalness: .95, envMap: ENV, envMapIntensity: 1.2 });
    const plinth = new T.Mesh(new T.BoxGeometry(7.2, .9, 2.4), new T.MeshStandardMaterial({ color: 0x3a2412, roughness: .5, metalness: .7, envMap: ENV })); plinth.position.y = -.45; scene.add(plinth);
    const label = new T.Mesh(new T.PlaneGeometry(6.4, .7), new T.MeshBasicMaterial({ transparent: true, map: textTex((g, w, h) => { g.font = `900 120px ${DISPLAY()}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#d9a066"; g.fillText("WE ARE BRAND.", w / 2, h / 2); }, 1536, 168) })); /* Not skin: gold lettering engraved on a bronze base — a material color */
    label.position.set(0, -.45, 1.21); scene.add(label);
    const crowd = new T.Group(); scene.add(crowd);
    for (let i = 0; i < 22; i++) {
      const f = figure(bronze, Math.random()); const row = i % 3;
      f.position.set(-3 + (i / 22) * 6 + (Math.random() - .5) * .4, 0, -.6 + row * .5 + Math.random() * .2); f.scale.setScalar(.62 + Math.random() * .12); f.rotation.y = (Math.random() - .5) * .9; crowd.add(f);
    }
    const sparkGeo = new T.BufferGeometry(), N = 600, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 6; pos[i * 3 + 1] = Math.random() * 1.6; pos[i * 3 + 2] = (Math.random() - .5) * 1.4; }
    sparkGeo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const sparks = new T.Points(sparkGeo, new T.PointsMaterial({ color: C.phos, size: .035, transparent: true, opacity: .9, blending: T.AdditiveBlending, depthWrite: false }));
    scene.add(sparks);
    const cone = new T.Mesh(new T.ConeGeometry(3.4, 9, 48, 1, true), new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
      uniforms: { c: { value: new T.Color(0x6f86c9) } }, vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: "uniform vec3 c; varying vec3 vP; void main(){ float a = smoothstep(-4.5, 4.5, vP.y); gl_FragColor = vec4(c * .22 * a, 1.); }" }));
    cone.position.y = 3.6; scene.add(cone);
    const top = new T.SpotLight(0xffe2c0, 120, 20, .5, .5); top.position.set(0, 7, 2); scene.add(top);
    scene.add(new T.AmbientLight(0x6070a0, .08));
    return { id: "monument", num: "03", chapter: "MONUMENT", cuts: "C12–C14", arrive: { type: "portal", duration: 1 }, scene, cam,
      title: "Your section title here", lead: "Our story in one line — try pulling it upward.",
      enter() { this.t0 = null; },
      update(t) {
        this.t0 ??= t; const k = Math.min(1, (t - this.t0) / 6), e = 1 - Math.pow(1 - k, 3);
        cam.position.set(Math.sin(t * .15) * 1.2 + mouse.sx * .5, 1.6 - e * .3, 11 - e * 4.2); cam.lookAt(0, .7, 0);
        const p = sparkGeo.attributes.position.array;
        for (let i = 0; i < N; i++) { p[i * 3 + 1] += .01 + Math.random() * .01; if (p[i * 3 + 1] > 1.6) p[i * 3 + 1] = 0; p[i * 3] += (Math.random() - .5) * .02; }
        sparkGeo.attributes.position.needsUpdate = true;
      } };
  })());

  /* ── 04 NEON — a light streak flying along a light pillar, at its end a dark street and a neon yellow paint smear ── */
  def((() => {
    const { scene, cam } = stage(C.bg.clone(), 60);
    cam.position.set(0, 0, 5);
    const NS = 1400, g = new T.BufferGeometry(), p = new Float32Array(NS * 3);
    for (let i = 0; i < NS; i++) { const a = Math.random() * Math.PI * 2, r = .6 + Math.random() * 6; p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = Math.sin(a) * r; p[i * 3 + 2] = -Math.random() * 80; }
    g.setAttribute("position", new T.BufferAttribute(p, 3));
    const streaks = new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: .05, transparent: true, opacity: .8, depthWrite: false, blending: T.AdditiveBlending })); scene.add(streaks);
    const beam = new T.Mesh(new T.PlaneGeometry(12, 60), new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: "varying vec2 vUv; void main(){ float w = mix(.5, .02, vUv.y); float a = smoothstep(w, w * .2, abs(vUv.x - .5)) * pow(1. - vUv.y, 1.6); gl_FragColor = vec4(vec3(1., .97, 1.) * a * 1.4, 1.); }" }));
    beam.rotation.x = -Math.PI / 2; beam.position.set(0, -1.4, -25); scene.add(beam);
    const city = new T.Group(); city.visible = false; scene.add(city);
    const dark = new T.MeshStandardMaterial({ color: 0x0c0d14, roughness: .9 });
    for (let i = 0; i < 26; i++) { const b = new T.Mesh(new T.BoxGeometry(.8 + Math.random(), 2 + Math.random() * 6, .8), dark); b.position.set((i % 2 ? 1 : -1) * (2.2 + Math.random() * 2), 0, -i * 1.6); city.add(b); }
    const splat = textTex((gx, w, h) => { gx.fillStyle = hex(C.volt); for (let i = 0; i < 40; i++) { gx.beginPath(); gx.arc(w * (.3 + Math.random() * .4), h * (.3 + Math.random() * .4), 20 + Math.random() * 90, 0, Math.PI * 2); gx.fill(); } }, 512, 512);
    const splats = [];
    for (let i = 0; i < 6; i++) { const s = new T.Mesh(new T.PlaneGeometry(3, 3), new T.MeshBasicMaterial({ map: splat, transparent: true, depthWrite: false, toneMapped: false })); s.position.set((Math.random() - .5) * 5, (Math.random() - .5) * 2.5, -2 - i * 2); s.rotation.z = Math.random() * 3; s.scale.setScalar(.001); city.add(s); splats.push(s); }
    city.add(new T.PointLight(C.volt, 30, 20));
    return { id: "neon", num: "04", chapter: "NEON", cuts: "C16–C17", arrive: { type: "flash", duration: .9 }, scene, cam,
      title: "Your section title here", lead: "Your one line introducing the path of light goes here — click to throw paint.",
      enter() { this.t0 = null; city.visible = false; splats.forEach((s) => s.scale.setScalar(.001)); },
      click() { splats.forEach((s, i) => gsap.to(s.scale, { x: 1, y: 1, z: 1, duration: reduce ? 0 : .35, delay: reduce ? 0 : i * .07, ease: "back.out(2.2)" })); },
      update(t, dt) {
        this.t0 ??= t; const k = t - this.t0;
        const arr = g.attributes.position.array, v = k < 2.4 ? 40 : 10;
        for (let i = 0; i < NS; i++) { arr[i * 3 + 2] += v * dt; if (arr[i * 3 + 2] > 5) arr[i * 3 + 2] = -80; }
        g.attributes.position.needsUpdate = true;
        beam.material.opacity = 1; beam.visible = k < 2.6;
        if (k > 2.4 && !city.visible) { city.visible = true; this.click(); }
        if (city.visible) { city.position.z = (k - 2.4) * 2; }
        cam.position.x = mouse.sx * .4; cam.position.y = -mouse.sy * .3; cam.lookAt(0, 0, -10);
      } };
  })());

  /* ── 05 POSTER — beige CRT computer (LED face on screen) on an accent-color print panel, panel text is DOM (#st-poster) ── */
  const makeCRT = () => {
    const g = new T.Group();
    const beige = new T.MeshStandardMaterial({ color: 0xe9e0cc, roughness: .55, envMap: ENV, envMapIntensity: .6 });
    const box = new T.Mesh(new T.BoxGeometry(2.2, 1.9, 1.9), beige); box.position.y = .95; g.add(box);
    const screen = new T.Mesh(new T.PlaneGeometry(1.6, 1.2), new T.MeshBasicMaterial({ map: ledFace("happy"), toneMapped: false })); screen.position.set(0, 1.05, .96); g.add(screen);
    const bezel = new T.Mesh(new T.TorusGeometry(.95, .06, 8, 4), beige); bezel.position.set(0, 1.05, .97); bezel.rotation.z = Math.PI / 4; bezel.scale.set(1.05, .8, 1); g.add(bezel);
    const kb = new T.Mesh(new T.BoxGeometry(2.6, .18, .9), beige); kb.position.set(0, .09, 1.6); kb.rotation.x = .08; g.add(kb);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) { const k = new T.Mesh(new T.BoxGeometry(.13, .06, .13), new T.MeshStandardMaterial({ color: 0xf6f1e4, roughness: .6 })); k.position.set(-1.1 + c * .17, .2, 1.3 + r * .17); g.add(k); }
    g.traverse((m) => m.isMesh && (m.castShadow = true));
    return g;
  };
  def((() => {
    const { scene, cam } = stage(C.accent.clone(), 30);
    cam.position.set(0, 1.2, 9);
    const crt = makeCRT(); crt.position.y = -1.1; crt.rotation.y = -.25; scene.add(crt);
    const shadow = new T.Mesh(new T.PlaneGeometry(20, 20), new T.ShadowMaterial({ opacity: .28 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.1; shadow.receiveShadow = true; scene.add(shadow);
    const sun = new T.DirectionalLight(0xffffff, 2.4); sun.position.set(-4, 6, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun);
    scene.add(new T.HemisphereLight(0xffffff, C.accent, .9));
    return { id: "poster", num: "05", chapter: "POSTER", cuts: "C18–C19", arrive: { type: "tube", duration: .8 }, scene, cam, dom: "st-poster",
      title: "Your section title here", lead: "Your line introducing the Poster section goes here.",
      update(t) { crt.rotation.y = -.25 + Math.sin(t * .5) * .08 + mouse.sx * .25; crt.rotation.x = mouse.sy * .06; } };
  })());

  /* ── 06 BREAKOUT — up close on the same CRT, the screen printed as an accent-color halftone plate (our halftone shader) ── */
  def((() => {
    const { scene, cam } = stage(C.bg.clone(), 40);
    const crt = makeCRT(); crt.position.y = -1; scene.add(crt);
    scene.add(new T.HemisphereLight(0xffffff, 0x111111, 1.2));
    const key = new T.DirectionalLight(0xffffff, 2); key.position.set(3, 4, 5); scene.add(key);
    const halftone = post(`uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime; uniform vec3 uInk; uniform vec3 uPaper; varying vec2 vUv; ${NOISE}
      void main(){ vec2 px = vUv * uRes; float cell = 7.; vec2 g = mod(px, cell) - cell * .5; vec2 cuv = (floor(px / cell) + .5) * cell / uRes;
        float l = dot(texture2D(tDiffuse, cuv).rgb, vec3(.299, .587, .114)); float r = sqrt(1. - l) * cell * .62; float dotm = 1. - smoothstep(r - .8, r + .8, length(g));
        float grain = hash(px + uTime) * .08; vec3 c = mix(uPaper, uInk, clamp(dotm + grain, 0., 1.)); gl_FragColor = vec4(c, 1.); }`, { uInk: { value: C.bg.clone() }, uPaper: { value: C.accent.clone() } });
    return { id: "breakout", num: "06", chapter: "BREAKOUT", cuts: "C20–C21", arrive: { type: "cut" }, scene, cam, post: halftone,
      title: "Your section title here", lead: "One line here for the scene breaking out of the screen.",
      enter() { this.t0 = null; },
      update(t) { this.t0 ??= t; const k = Math.min(1, (t - this.t0) / 5); cam.position.set(Math.sin(t * .3) * .3 + mouse.sx * .3, .2, 4.2 - k * 2.1); cam.lookAt(0, .05, 0); } };
  })());

  /* ── 07 STYLE RUN — a robot runs to the tempo (174 BPM) and the render style changes TOON → ASCII → PRODUCT → Y2K → GLITCH ── */
  def((() => {
    const { scene, cam } = stage(C.paper.clone(), 50);
    cam.position.set(0, 2.2, 6); cam.lookAt(0, 1, -6);
    const road = new T.Mesh(new T.PlaneGeometry(8, 200, 1, 1), new T.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uA: { value: new T.Color(0xdedad2) }, uB: { value: new T.Color(0x1a1a1a) } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: "uniform float uTime; uniform vec3 uA, uB; varying vec2 vUv; void main(){ float z = vUv.y * 200. + uTime * 22.; float lane = step(.97, fract(vUv.x * 4.)); float stripe = step(.86, fract(z * .1)); gl_FragColor = vec4(mix(uA, uB, max(lane, stripe * step(.47, vUv.x) * step(vUv.x, .53))), 1.); }" }));
    road.rotation.x = -Math.PI / 2; road.position.z = -90; scene.add(road);
    const robot = makeRobot(); robot.scale.setScalar(.6); robot.position.set(0, 1, 0); scene.add(robot);
    const props = new T.Group(); scene.add(props);
    for (let i = 0; i < 30; i++) { const b = new T.Mesh(new T.BoxGeometry(.6, .6 + Math.random() * 2, .6), new T.MeshStandardMaterial({ color: 0x222222, roughness: .6 })); b.position.set((i % 2 ? 1 : -1) * (4.5 + Math.random() * 3), .5, -i * 6); props.add(b); }
    scene.add(new T.HemisphereLight(0xffffff, 0x444444, 1.2));
    const sun = new T.DirectionalLight(0xffffff, 1.6); sun.position.set(2, 5, 4); scene.add(sun);
    const STYLES = ["TOON", "ASCII", "PRODUCT", "Y2K", "GLITCH"];
    const style = post(`uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime; uniform float uMode; uniform vec3 uG; uniform vec3 uV; varying vec2 vUv; ${NOISE}
      vec3 tex(vec2 uv){ return texture2D(tDiffuse, uv).rgb; }
      float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
      void main(){
        vec2 px = vUv * uRes; vec3 c = tex(vUv);
        if (uMode < .5) { vec3 q = floor(c * 4.) / 4.; float e = abs(lum(tex(vUv + vec2(1.5 / uRes.x, 0.))) - lum(c)) + abs(lum(tex(vUv + vec2(0., 1.5 / uRes.y))) - lum(c)); c = q * (1. - step(.12, e)); }
        else if (uMode < 1.5) { vec2 cell = vec2(8., 14.); vec2 id = floor(px / cell); float l = lum(tex((id + .5) * cell / uRes)); vec2 f = fract(px / cell); float glyph = step(.5, hash(id + floor(l * 6.))) * step(.15, f.x) * step(f.x, .85) * step(.15, f.y) * step(f.y, .85); glyph *= step(.08, l); float grid = step(.985, fract(vUv.y * 18. + uTime * .5)) * .35; c = uG * (glyph * l * 1.4 + grid); }
        else if (uMode < 2.5) { vec2 p2 = floor(px / 4.) * 4. / uRes; float l = lum(tex(p2)); float d = hash(floor(px / 4.)) * .25; c = mix(vec3(.30, .31, .78), uV, step(.45, l + d - .12)); }
        else if (uMode < 3.5) { float l = lum(c); vec3 rb = .5 + .5 * cos(6.2831 * (vUv.x * 1.5 + uTime * .25 + vec3(0., .33, .67))); c = mix(vec3(.04, .0, .12) + vec3(step(.997, hash(floor(px / 2.)))), rb * 1.2, smoothstep(.15, .6, l)); }
        else { vec2 b = floor(px / vec2(48., 24.)); float r = hash(b + floor(uTime * 12.)); vec2 off = (r > .82) ? vec2((r - .9) * .2, 0.) : vec2(0.); vec3 g = vec3(tex(vUv + off + vec2(.006, 0.)).r, tex(vUv + off).g, tex(vUv + off - vec2(.006, 0.)).b); c = (r > .95) ? vec3(step(.5, hash(b))) : g; c = mix(c, c.bgr, step(.9, hash(b + 3.))); }
        c *= .92 + .08 * sin(px.y * 1.5); gl_FragColor = vec4(c, 1.); }`, { uMode: { value: 0 }, uG: { value: C.green.clone() }, uV: { value: C.volt.clone() } });
    const hud = document.getElementById("st-hud"), hs = hud?.querySelector(".st-hud__style"), hw = hud?.querySelector(".st-hud__world"), hb = hud?.querySelector(".st-hud__bar"), hsc = hud?.querySelector(".st-hud__score");
    let mode = 0, last = 0, score = 0;
    const setMode = (m) => { mode = m % STYLES.length; style.mat.uniforms.uMode.value = mode; if (hs) hs.textContent = STYLES[mode]; if (hw) hw.textContent = `WORLD 1-${mode + 1}`; };
    return { id: "run", num: "07", chapter: "STYLE RUN", cuts: "C22–C29", arrive: { type: "flash", duration: .7 }, scene, cam, post: style, dom: "st-hud",
      title: "Your section title here", lead: "Your running line about the render type changing goes here — press SPACE to switch the type.",
      enter(t) { setMode(0); last = t ?? 0; score = 0; Fun.hint("key", W() * .5, H() * .72, "Change Type"); },
      click() { setMode(mode + 1); last = this._t; Fun.hintOff(); },
      key(e) { if (e.key === " ") { e.preventDefault(); this.click(); } },
      update(t) {
        this._t = t; const beat = 60 / 174;
        road.material.uniforms.uTime.value = t;
        const ph = (t / beat) % 1; robot.position.y = 1 + Math.abs(Math.sin(ph * Math.PI)) * .25; robot.rotation.z = Math.sin(t / beat * Math.PI) * .08; robot.position.x = mouse.sx * 1.2;
        props.children.forEach((b) => { b.position.z += .35; if (b.position.z > 6) b.position.z -= 180; });
        if (t - last > beat * 8) { setMode(mode + 1); last = t; }
        score += 7; if (hsc) hsc.textContent = String(score).padStart(4, "0"); if (hb) hb.textContent = String(Math.floor(t / (beat * 4)) % 100).padStart(2, "0");
      } };
  })());

  /* ── 08 SHATTER — hundreds of glass shards burst toward the screen from the center of white light ── */
  def((() => {
    const { scene, cam } = stage(C.paper.clone(), 55);
    cam.position.set(0, 0, 6);
    const glass = new T.MeshStandardMaterial({ color: 0xbfc6c4, metalness: .9, roughness: .05, envMap: ENV, envMapIntensity: 2.2, side: T.DoubleSide, transparent: true, opacity: .82 });
    const shards = new T.Group(); scene.add(shards);
    const tri = (s) => { const g = new T.BufferGeometry(); const a = new Float32Array([0, 0, 0, s * (Math.random() + .3), s * (Math.random() - .5), 0, s * (Math.random() - .5), s * (Math.random() + .3), 0]); g.setAttribute("position", new T.BufferAttribute(a, 3)); g.computeVertexNormals(); return g; };
    for (let i = 0; i < 260; i++) { const m = new T.Mesh(tri(.5 + Math.random() * .9), glass); const a = Math.random() * Math.PI * 2, r = Math.random() * .6; m.userData = { dir: new T.Vector3(Math.cos(a) * (1 + r), Math.sin(a) * (1 + r), 1.2 + Math.random() * 2).normalize(), spin: new T.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(4), v: 2 + Math.random() * 5 }; shards.add(m); }
    const greens = new T.MeshBasicMaterial({ color: C.green, toneMapped: false });
    for (let i = 0; i < 18; i++) { const b = new T.Mesh(new T.PlaneGeometry(.12, .5), greens); b.position.set((Math.random() - .5) * 8, (Math.random() - .5) * 5, -2); shards.add(b); }
    scene.add(new T.HemisphereLight(0xffffff, 0x99aaaa, 2));
    return { id: "shatter", num: "08", chapter: "SHATTER", cuts: "C30–C31", arrive: { type: "cut" }, scene, cam,
      title: "Your section title here", lead: "Your one line on the moment the screen breaks.",
      enter() { this.t0 = null; shards.children.forEach((m) => { m.position.set((Math.random() - .5) * .6, (Math.random() - .5) * .6, -3); m.rotation.set(Math.random() * 3, Math.random() * 3, 0); }); },
      update(t, dt) {
        this.t0 ??= t; const k = t - this.t0;
        shards.children.forEach((m) => { if (!m.userData.dir) return; const s = reduce ? 1 : Math.max(0, 1 - k * .15); m.position.addScaledVector(m.userData.dir, m.userData.v * dt * s); m.rotation.x += m.userData.spin.x * dt * s; m.rotation.y += m.userData.spin.y * dt * s; });
        cam.position.x = mouse.sx * .3; cam.position.y = -mouse.sy * .2; cam.lookAt(0, 0, 0);
      } };
  })());

  /* ── 09 LOGO — white background, black balloon-letter mass (our letters made of twisted tubes) and robot, faint floor shadow ── */
  def((() => {
    const { scene, cam } = stage(C.paper.clone(), 30);
    cam.position.set(0, 1.4, 16);
    const balloon = new T.MeshPhysicalMaterial({ color: 0x060606, roughness: .12, clearcoat: 1, envMap: ENV, envMapIntensity: 1.5 });
    const word = new T.Group(); scene.add(word);
    /* Five-letter slot — a few thick tube paths per letter (block letter strokes) */
    const strokes = [[[-.5, -.7, -.5, .7], [-.5, .7, .3, .5], [.3, .5, -.4, 0], [-.4, 0, .4, -.4], [.4, -.4, -.5, -.7]], [[-.5, -.7, -.5, .7], [-.5, .7, .4, .4], [.4, .4, -.4, 0], [-.4, 0, .5, -.7]], [[-.6, -.7, 0, .7], [0, .7, .6, -.7], [-.35, -.1, .35, -.1]], [[-.5, -.7, -.5, .7], [-.5, .7, .5, -.7], [.5, -.7, .5, .7]], [[-.5, -.7, -.5, .7], [-.5, .7, .4, .3], [.4, .3, .4, -.3], [.4, -.3, -.5, -.7]]];
    strokes.forEach((ls, i) => {
      const L = new T.Group(); L.position.x = -4.6 + i * 1.8;
      ls.forEach(([x1, y1, x2, y2]) => { const curve = new T.QuadraticBezierCurve3(new T.Vector3(x1, y1, 0), new T.Vector3((x1 + x2) / 2 + .1, (y1 + y2) / 2 + .15, .25), new T.Vector3(x2, y2, 0)); const m = new T.Mesh(new T.TubeGeometry(curve, 24, .26, 16, false), balloon); m.castShadow = true; L.add(m);
        [curve.v0, curve.v2].forEach((v) => { const cap = new T.Mesh(new T.SphereGeometry(.26, 24, 16), balloon); cap.position.copy(v); L.add(cap); }); });
      L.rotation.z = (Math.random() - .5) * .2; L.position.y = 1.1; word.add(L);
    });
    const robot = makeRobot(); robot.scale.setScalar(.75); robot.position.set(5.2, 1.2, .3); robot.rotation.y = -.4; scene.add(robot);
    const ground = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: .12 })); ground.rotation.x = -Math.PI / 2; ground.position.y = .02; ground.receiveShadow = true; scene.add(ground);
    const sun = new T.DirectionalLight(0xffffff, 2.2); sun.position.set(-3, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -8; sun.shadow.camera.right = 8; scene.add(sun);
    scene.add(new T.HemisphereLight(0xffffff, 0xdddddd, 1.4));
    return { id: "logo", num: "09", chapter: "LOGO", cuts: "C32–C33", arrive: { type: "flash", duration: .9 }, scene, cam, dom: "st-end", hud: "dark", last: true,
      title: "Your farewell here", lead: "Your closing line goes here — to go back to the start, press the logo.",
      enter() { word.children.forEach((L, i) => { L.scale.setScalar(.001); gsap.to(L.scale, { x: 1, y: 1, z: 1, duration: reduce ? 0 : .9, delay: reduce ? 0 : .3 + i * .08, ease: "elastic.out(1, .5)" }); }); },
      update(t) { word.children.forEach((L, i) => (L.position.y = 1.1 + Math.sin(t * 1.4 + i) * .05)); robot.rotation.y = -.4 + mouse.sx * .4; cam.position.x = mouse.sx * .4; cam.lookAt(0, 1, 0); } };
  })());

  /* ── Section transition shader — original transition names and lengths kept, the artwork is our own ── */
  const TYPES = { cut: 0, led: 1, peel: 2, portal: 3, flash: 4, tube: 5 };
  const trans = new T.ShaderMaterial({ depthTest: false, depthWrite: false,
    uniforms: { tA: { value: null }, tB: { value: null }, uP: { value: 1 }, uType: { value: 0 }, uAsp: { value: 1 }, uGlow: { value: C.green.clone() } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
    fragmentShader: `uniform sampler2D tA, tB; uniform float uP, uType, uAsp; uniform vec3 uGlow; varying vec2 vUv; ${NOISE}
      vec3 A(vec2 u){ return texture2D(tA, u).rgb; } vec3 B(vec2 u){ return texture2D(tB, u).rgb; }
      void main(){
        float p = clamp(uP, 0., 1.); vec2 uv = vUv; vec3 c;
        if (uType < .5) { c = p < .5 ? A(uv) : B(uv); }
        else if (uType < 1.5) { vec2 g = vec2(64., 64. / uAsp); vec2 id = floor(uv * g); vec2 f = fract(uv * g) - .5; float r = hash(id); float on = smoothstep(r * .7, r * .7 + .3, p);
          float dotm = 1. - smoothstep(.32, .42, length(f)); vec3 led = uGlow * dotm * (1. - abs(on - .5) * 2.) * 1.8; c = mix(A(uv), B(uv), on) + led; }
        else if (uType < 2.5) { float d = (uv.x + (1. - uv.y)) * .5; float edge = p * 1.25; float fold = d - (1. - edge); vec2 m = uv + vec2(-1., 1.) * max(fold, 0.) * .5;
          c = fold > 0. ? B(uv) : A(uv); float sh = smoothstep(.0, .04, abs(fold)); c *= mix(.6, 1., sh); if (fold > -.03 && fold < 0.) c = mix(c, vec3(1.), .35); }
        else if (uType < 3.5) { vec2 q = (uv - .5) * vec2(uAsp, 1.); float r = p * 1.2; float d = length(q); c = d < r ? B(uv) : A(uv + q * .05 * p); c += uGlow * smoothstep(.04, 0., abs(d - r)) * 1.5 * (1. - p); }
        else if (uType < 4.5) { float a = smoothstep(0., .5, p), b = smoothstep(.5, 1., p); vec3 ca = A(uv) * (a * a * 6. + 1.); vec3 cb = B(uv) * ((1. - b) * 3. + 1.); float w = p < .5 ? pow(a, 3.) : pow(1. - b, 2.); c = clamp(mix(p < .5 ? ca : cb, vec3(1.), w), 0., 1.); }
        else { float s = p < .5 ? 1. - p * 2. : (p - .5) * 2.; float hgt = max(s, .004); float y = (uv.y - .5) / hgt + .5; vec3 src = p < .5 ? A(vec2(uv.x, y)) : B(vec2(uv.x, y));
          float inside = step(abs(uv.y - .5), hgt * .5); c = src * inside * (1. + (1. - s) * 2.); }
        gl_FragColor = vec4(c, 1.); }` });
  const transScene = new T.Scene(); transScene.add(new T.Mesh(quadGeo, trans));

  /* Render the section — goes through rtPost if there is post-processing */
  const draw = (s, dst, t) => {
    if (!s) { renderer.setRenderTarget(dst); renderer.setClearColor(C.bg, 1); renderer.clear(); return; }
    if (s.post) { renderer.setRenderTarget(rtPost); renderer.render(s.scene, s.cam); s.post.run(rtPost, dst, t); }
    else { renderer.setRenderTarget(dst); renderer.render(s.scene, s.cam); }
  };

  /* Flow: after boot ends it starts from VOLT, pressing the section guide ring goes to the next section */
  let cur = null, prev = null, tStart = 0, tDur = 0, transType = 0, idx = -1;
  const chap = document.querySelector(".chapter");
  const showDom = (s) => document.querySelectorAll(".station:not(.bt)").forEach((d) => { const on = s && d.id === s.dom; d.hidden = !on; d.classList.toggle("is-in", false); if (on) requestAnimationFrame(() => d.classList.add("is-in")); });
  const go = (i, t) => {
    const s = stations[i];
    if (!s) return;
    prev = cur; cur = s; idx = i;
    transType = TYPES[s.arrive.type] ?? 0; tDur = reduce ? 0 : (s.arrive.duration || .001); tStart = t;
    s.enter?.(t);
    body.dataset.hud = s.hud || ""; showDom(s);
    if (chap) { chap.querySelector(".chapter__num").textContent = s.num; chap.querySelector(".chapter__name").textContent = s.chapter; chap.querySelector(".chapter__cuts").textContent = s.cuts; }
    Fun.gateOff();
    clearTimeout(go._g);
    go._g = setTimeout(() => Fun.gate(s, () => (s.last ? go(0, clock.getElapsedTime()) : go(i + 1, clock.getElapsedTime()))), reduce ? 0 : (tDur + 1.6) * 1000);
  };
  document.getElementById("ui-logo")?.addEventListener("click", () => cur && go(0, clock.getElapsedTime()));
  canvas.addEventListener("click", (e) => { cur?.click?.(e); });
  addEventListener("keydown", (e) => { if (body.classList.contains("is-hud-in")) cur?.key?.(e); });

  const t0 = performance.now(); const clock = { getElapsedTime: () => (performance.now() - t0) / 1000 };
  addEventListener("resize", size);
  size();
  Fun.on("load", (p) => Fun.loading(p));
  let last = 0;
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime(), dt = Math.min(.05, t - last); last = t;
    mouse.sx += (mouse.x - mouse.sx) * .06; mouse.sy += (mouse.y - mouse.sy) * .06;
    if (!cur) { renderer.setRenderTarget(null); renderer.setClearColor(C.bg, 1); renderer.clear(); return; }
    const p = tDur ? Math.min(1, (t - tStart) / tDur) : 1;
    cur.update?.(t, dt);
    if (p < 1) { prev?.update?.(t, dt); draw(prev, rtA, t); }
    draw(cur, rtB, t);
    trans.uniforms.tA.value = rtA.texture; trans.uniforms.tB.value = rtB.texture; trans.uniforms.uP.value = p < 1 ? p : 1; trans.uniforms.uType.value = p < 1 ? transType : 0; trans.uniforms.uAsp.value = W() / H();
    renderer.setRenderTarget(null); renderer.render(transScene, quadCam);
  });

  /* Bakes each scene once in advance (shader compile) — the boot log scrolls meanwhile */
  const warm = () => stations.forEach((s) => { try { renderer.compile(s.scene, s.cam); } catch (e) { /* A failed bake is retried on the first paint */ } });
  setTimeout(warm, 50);
  (Fun.bootDone || Fun.boot()).then(() => { body.classList.add("is-hud-in"); Fun.loading(null); go(0, clock.getElapsedTime()); });
})();
