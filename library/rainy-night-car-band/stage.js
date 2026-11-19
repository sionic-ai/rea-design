// One old sedan on a rainy-night highway — builds the same scene with basic shapes and our own shader, without the original model, textures or shaders.
// AV.frame(0~96) sets the camera path, trunk lid and light intensity. The car sits at the origin facing +z.
(() => {
  const AV = window.AV, T = THREE;
  const mobile = AV.mobile;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector(".av-canvas");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1 : 1.25));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Skin fills as 3D materials — color-mix and oklch are also painted on a one-cell canvas and read as rgb
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const one = document.createElement("canvas"); one.width = one.height = 1;
  const oneCtx = one.getContext("2d", { willReadFrequently: true });
  const css = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
  const col = (name) => {
    oneCtx.clearRect(0, 0, 1, 1); oneCtx.fillStyle = css(name); oneCtx.fillRect(0, 0, 1, 1);
    const d = oneCtx.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.SRGBColorSpace);
  };
  const fam = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "sans-serif";
  const C = {
    bg: col("--kf-bg"), ink: col("--kf-ink"), glow: col("--site-glow"), warm: col("--site-warm"), trunk: col("--site-trunk"),
    paint: col("--site-paint"), asphalt: col("--site-asphalt"), chrome: col("--site-chrome"), tail: col("--site-tail"), lamp: col("--site-lamp"),
  };

  const scene = new T.Scene();
  scene.background = C.bg.clone();
  scene.fog = new T.FogExp2(C.bg.clone(), 0.045);
  const camera = new T.PerspectiveCamera(34, innerWidth / innerHeight, 0.03, 300);

  // Surroundings for the car paint and chrome to reflect — bake a sphere with a few streetlight bands in a dark sky using PMREM
  const pmrem = new T.PMREMGenerator(renderer);
  const envTex = (() => {
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 256;
    const x = cv.getContext("2d");
    x.fillStyle = css("--kf-bg"); x.fillRect(0, 0, 512, 256);
    x.fillStyle = css("--site-chrome");
    for (let i = 0; i < 7; i++) { x.globalAlpha = 0.25 + Math.random() * 0.5; x.fillRect(i * 74 + 10, 40 + Math.random() * 30, 22, 6); }
    x.globalAlpha = 0.12; x.fillRect(0, 0, 512, 60);
    const t = new T.CanvasTexture(cv); t.mapping = T.EquirectangularReflectionMapping; t.colorSpace = T.SRGBColorSpace;
    return pmrem.fromEquirectangular(t).texture;
  })();

  const std = (o) => new T.MeshStandardMaterial({ envMap: envTex, ...o });
  const tex = (w, h, draw) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  };

  // ── Light ──
  scene.add(new T.HemisphereLight(C.ink, C.bg, 0.7));
  const moon = new T.DirectionalLight(C.ink, 1.4); moon.position.set(-6, 12, -8); scene.add(moon);
  const fill = new T.DirectionalLight(C.ink, 0.6); fill.position.set(4, 5, 10); scene.add(fill);
  const heads = [-0.75, 0.75].map((x) => {
    const s = new T.SpotLight(C.lamp, 40, 45, 0.5, 0.6, 1.4);
    s.position.set(x, 0.72, 2.95); s.target.position.set(x * 1.6, 0, 22);
    scene.add(s, s.target); return s;
  });
  const glowLight = new T.SpotLight(C.glow, 0, 30, 0.6, 0.8, 1.2);
  glowLight.position.set(-3.2, 6.5, 5.5); glowLight.target.position.set(0, 0.6, 1.5); scene.add(glowLight, glowLight.target);
  const glowBack = new T.PointLight(C.glow, 0, 18, 1.4); glowBack.position.set(-2.5, 3.5, -4); scene.add(glowBack);
  const warmLight = new T.PointLight(C.warm, 0, 40, 1.2); warmLight.position.set(-16, 4, -6); scene.add(warmLight);
  const cabinLight = new T.PointLight(C.ink, 0, 3.5, 1.5); cabinLight.position.set(0, 1.0, 0.6); scene.add(cabinLight);

  // ── Road: wet asphalt (only the puddles are smooth), lanes, guardrail ──
  const puddles = tex(512, 512, (x, w, h) => {
    x.fillStyle = css("--kf-ink"); x.globalAlpha = 1; x.fillRect(0, 0, w, h);
    x.fillStyle = css("--kf-bg");
    for (let i = 0; i < 70; i++) { x.globalAlpha = 0.08 + Math.random() * 0.22; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 60, 6 + Math.random() * 30, Math.random() * 3, 0, 7); x.fill(); }
    x.globalAlpha = 0.18;
    for (let i = 0; i < 4000; i++) { x.fillStyle = Math.random() > 0.5 ? css("--kf-ink") : css("--kf-bg"); x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  puddles.colorSpace = T.NoColorSpace;
  puddles.wrapS = puddles.wrapT = T.RepeatWrapping; puddles.repeat.set(6, 60);
  const road = new T.Mesh(new T.PlaneGeometry(60, 400), std({ color: C.asphalt, roughness: 1, roughnessMap: puddles, metalness: 0.05, envMapIntensity: 0.25 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -40); scene.add(road);

  const paintLine = std({ color: C.ink.clone().multiplyScalar(0.75), roughness: 0.55 });
  const dashes = new T.InstancedMesh(new T.BoxGeometry(0.14, 0.012, 3), paintLine, 26);
  const m4 = new T.Matrix4();
  for (let i = 0; i < 26; i++) dashes.setMatrixAt(i, m4.makeTranslation(1.95, 0.006, 60 - i * 9));
  scene.add(dashes);
  [-3.5, 5.3].forEach((x) => { const l = new T.Mesh(new T.BoxGeometry(0.12, 0.01, 400), paintLine); l.position.set(x, 0.005, -40); scene.add(l); });
  const metal = std({ color: C.chrome.clone().multiplyScalar(0.55), metalness: 0.75, roughness: 0.42 });
  [-4.6, 6.2].forEach((x) => {
    const beam = new T.Mesh(new T.BoxGeometry(0.07, 0.34, 400), metal); beam.position.set(x, 0.72, -40); scene.add(beam);
    const posts = new T.InstancedMesh(new T.BoxGeometry(0.1, 0.78, 0.1), metal, 120);
    for (let i = 0; i < 120; i++) posts.setMatrixAt(i, m4.makeTranslation(x + Math.sign(x) * 0.08, 0.39, 60 - i * 2.2));
    scene.add(posts);
  });

  // Background between sections — forest shadow left of the road and the sky behind it tinted orange and purple (camera looks there only in the About section)
  const skyMat = new T.ShaderMaterial({
    uniforms: { uTop: { value: C.bg }, uMid: { value: C.glow }, uLow: { value: C.warm }, uAmt: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "uniform vec3 uTop,uMid,uLow; uniform float uAmt; varying vec2 vUv; void main(){ float y=vUv.y; vec3 c=mix(uLow,uMid,smoothstep(.05,.45,y)); c=mix(c,uTop,smoothstep(.4,.9,y)); gl_FragColor=vec4(mix(uTop,c,uAmt),1.); }",
    fog: false, depthWrite: false,
  });
  const sky = new T.Mesh(new T.PlaneGeometry(120, 40), skyMat);
  sky.position.set(-36, 12, -6); sky.rotation.y = Math.PI / 2; scene.add(sky);
  const treeMat = new T.MeshBasicMaterial({ color: C.bg });
  const trees = new T.InstancedMesh(new T.ConeGeometry(1.4, 1, 7), treeMat, 70);
  for (let i = 0; i < 70; i++) {
    const h = 6 + Math.random() * 9, s = 0.7 + Math.random() * 0.8;
    m4.compose(new T.Vector3(-9 - Math.random() * 16, h / 2, 30 - i * 1.3 - Math.random()), new T.Quaternion(), new T.Vector3(s, h, s));
    trees.setMatrixAt(i, m4);
  }
  scene.add(trees);

  // ── Car ──
  const car = new T.Group(); scene.add(car);
  const paint = std({ color: C.paint, metalness: 0.35, roughness: 0.32, envMapIntensity: 1.0 });
  const chrome = std({ color: C.chrome, metalness: 1, roughness: 0.18 });
  const dark = std({ color: C.bg.clone().lerp(C.ink, 0.06), roughness: 0.8 });
  const glass = std({ color: C.bg.clone().lerp(C.ink, 0.04), metalness: 1, roughness: 0.06, transparent: true, opacity: 0.8, side: T.DoubleSide, envMapIntensity: 1.4 });
  // Side profile (z, y) — a low, long sedan: front bumper, hood, windshield, roof, rear window, with the trunk area left empty at the back
  const side = new T.Shape();
  [[2.95, 0.34], [3.02, 0.56], [2.98, 0.84], [2.62, 0.92], [1.15, 0.99], [0.47, 1.4], [-0.95, 1.42], [-1.75, 1.02], [-1.86, 0.98], [-1.86, 0.62], [-2.92, 0.62], [-2.98, 0.5], [-2.9, 0.34]].forEach(([z, y], i) => (i ? side.lineTo(z, y) : side.moveTo(z, y)));
  side.closePath();
  const bodyGeo = new T.ExtrudeGeometry(side, { depth: 1.9, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3, curveSegments: 2 });
  bodyGeo.translate(0, 0, -0.95);
  const body = new T.Mesh(bodyGeo, paint); body.rotation.y = -Math.PI / 2; car.add(body);
  // Glass: windshield · rear window · side window
  const quadBetween = (a, b, w, mat) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const m = new T.Mesh(new T.PlaneGeometry(w, len), mat);
    m.position.set(0, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2);
    m.rotation.x = -Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
    // The body corner rounding (0.05) lies outside the glass face, so it is lifted by that much — otherwise the stamp would cover the glass and sticker
    m.translateZ(0.065);
    return m;
  };
  // Windshield water drops — a panel with round droplet normals painted by hand
  const drops = (() => {
    const s = 512, cv = document.createElement("canvas"); cv.width = cv.height = s;
    const x = cv.getContext("2d"), img = x.createImageData(s, s), d = img.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i + 1] = 128; d[i + 2] = 255; d[i + 3] = 255; }
    for (let k = 0; k < 900; k++) {
      const cx = Math.random() * s, cy = Math.random() * s, r = 2 + Math.random() * Math.random() * 9;
      for (let yy = Math.max(0, cy - r | 0); yy < Math.min(s, cy + r + 1); yy++) for (let xx = Math.max(0, cx - r | 0); xx < Math.min(s, cx + r + 1); xx++) {
        const nx = (xx - cx) / r, ny = (yy - cy) / r, q = nx * nx + ny * ny;
        if (q > 1) continue;
        const o = (yy * s + xx) * 4; d[o] = (nx * 0.5 + 0.5) * 255; d[o + 1] = (-ny * 0.5 + 0.5) * 255; d[o + 2] = Math.sqrt(1 - q) * 255;
      }
    }
    x.putImageData(img, 0, 0);
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 1.4); return t;
  })();
  const wetGlass = glass.clone(); wetGlass.normalMap = drops; wetGlass.normalScale = new T.Vector2(0.8, 0.8);
  const windshield = quadBetween([1.15, 0.99], [0.47, 1.4], 1.78, wetGlass); car.add(windshield);
  car.add(quadBetween([-0.95, 1.42], [-1.75, 1.02], 1.78, glass));
  [-1, 1].forEach((sx) => {
    const g = new T.Shape([[0.42, 1.0], [0.42, 1.36], [-0.92, 1.38], [-1.62, 1.02]].map(([z, y]) => new T.Vector2(z, y)));
    const m = new T.Mesh(new T.ShapeGeometry(g), glass);
    m.rotation.y = -Math.PI / 2; m.position.x = sx * 1.002; car.add(m);
  });
  // Inside the car: ceiling and door interiors (hidden by the body from outside), dashboard, steering wheel, driver shadow, front seat
  const inner = new T.MeshStandardMaterial({ color: C.bg.clone().lerp(C.ink, 0.05), roughness: 0.9, side: T.DoubleSide });
  const roofIn = new T.Mesh(new T.PlaneGeometry(1.85, 1.5), inner); roofIn.rotation.x = Math.PI / 2; roofIn.position.set(0, 1.36, -0.25); car.add(roofIn);
  [-0.93, 0.93].forEach((x) => { const p = new T.Mesh(new T.PlaneGeometry(2.6, 0.6), inner); p.rotation.y = Math.PI / 2; p.position.set(x, 0.7, -0.4); car.add(p); });
  const dashTex = tex(512, 128, (x, w, h) => {
    x.fillStyle = css("--kf-bg"); x.fillRect(0, 0, w, h);
    x.strokeStyle = css("--site-chrome"); x.lineWidth = 3;
    [[90, 64, 34], [180, 64, 34], [330, 64, 22], [390, 64, 22]].forEach(([cx, cy, r]) => { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + r * 0.7, cy - r * 0.5); x.stroke(); });
    x.fillStyle = css("--site-chrome"); x.fillRect(250, 30, 50, 8); x.fillRect(250, 50, 50, 8); x.fillRect(250, 70, 50, 8);
  });
  const dash = new T.Mesh(new T.BoxGeometry(1.86, 0.26, 0.5), [dark, dark, dark, dark, dark, std({ map: dashTex, roughness: 0.6 })]);
  dash.position.set(0, 0.92, 0.95); dash.rotation.y = Math.PI; car.add(dash);
  const wheel = new T.Mesh(new T.TorusGeometry(0.19, 0.022, 8, 28), dark); wheel.position.set(-0.45, 1.02, 0.66); wheel.rotation.x = -0.45; car.add(wheel);
  const shadowMat = new T.MeshBasicMaterial({ color: C.bg });
  const torso = new T.Mesh(new T.CapsuleGeometry(0.21, 0.42, 4, 12), shadowMat); torso.position.set(-0.45, 0.88, 0.05); car.add(torso);
  const head = new T.Mesh(new T.SphereGeometry(0.13, 16, 12), shadowMat); head.position.set(-0.45, 1.25, 0.05); car.add(head);
  [-0.45, 0.45].forEach((x) => { const s = new T.Mesh(new T.BoxGeometry(0.62, 0.52, 0.14), dark); s.position.set(x, 0.76, -0.22); s.rotation.x = -0.12; car.add(s); });
  // Chrome band along the side — waistline of a long sedan
  [-1, 1].forEach((sx) => { const t = new T.Mesh(new T.BoxGeometry(0.02, 0.035, 5.7), chrome); t.position.set(sx * 1.0, 0.78, 0.02); car.add(t); });
  // Wheels, chrome, lights
  const tire = new T.MeshStandardMaterial({ color: C.bg.clone().lerp(C.ink, 0.05), roughness: 0.85 });
  [[0.95, 1.85], [-0.95, 1.85], [0.95, -1.95], [-0.95, -1.95]].forEach(([x, z]) => {
    const t = new T.Mesh(new T.CylinderGeometry(0.38, 0.38, 0.26, 28), tire); t.rotation.z = Math.PI / 2; t.position.set(x, 0.38, z); car.add(t);
    const hub = new T.Mesh(new T.CylinderGeometry(0.22, 0.24, 0.27, 20), chrome); hub.rotation.z = Math.PI / 2; hub.position.set(x * 1.005, 0.38, z); car.add(hub);
  });
  const grilleTex = tex(256, 64, (x, w, h) => { x.fillStyle = css("--kf-bg"); x.fillRect(0, 0, w, h); x.fillStyle = css("--site-chrome"); for (let i = 0; i < w; i += 10) x.fillRect(i, 0, 4, h); x.fillRect(0, 0, w, 5); x.fillRect(0, h - 5, w, 5); });
  const grille = new T.Mesh(new T.BoxGeometry(1.0, 0.3, 0.05), std({ map: grilleTex, metalness: 0.9, roughness: 0.25 })); grille.position.set(0, 0.68, 3.0); car.add(grille);
  [[0, 0.4, 3.02], [0, 0.4, -2.96]].forEach(([x, y, z]) => { const b = new T.Mesh(new T.BoxGeometry(2.12, 0.15, 0.16), chrome); b.position.set(x, y, z); car.add(b); });
  const lampMat = new T.MeshStandardMaterial({ color: C.lamp, emissive: C.lamp, emissiveIntensity: 3 });
  [-0.92, -0.62, 0.62, 0.92].forEach((x) => { const l = new T.Mesh(new T.BoxGeometry(0.24, 0.15, 0.04), lampMat); l.position.set(x, 0.7, 3.0); car.add(l); });
  const tailMat = new T.MeshStandardMaterial({ color: C.tail, emissive: C.tail, emissiveIntensity: 2.2 });
  [-0.93, 0.93].forEach((x) => { const l = new T.Mesh(new T.BoxGeometry(0.14, 0.3, 0.04), tailMat); l.position.set(x, 0.78, -2.95); car.add(l); });
  // Headlight bloom — add radial gradient plates and paint
  const flare = tex(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, css("--site-lamp")); g.addColorStop(0.25, css("--site-ink-quiet")); g.addColorStop(1, css("--site-veil")); x.fillStyle = g; x.globalCompositeOperation = "source-over"; x.fillRect(0, 0, w, w); });
  const flareMat = new T.SpriteMaterial({ map: flare, color: C.lamp, blending: T.AdditiveBlending, depthWrite: false, transparent: true });
  const flares = [-0.77, 0.77].map((x) => { const s = new T.Sprite(flareMat); s.position.set(x, 0.7, 3.12); s.scale.setScalar(1.1); car.add(s); return s; });

  // Trunk: inside is pink (a BackSide box, so the inside shows only from above), three outer walls, a lid that opens backward
  const tub = new T.Mesh(new T.BoxGeometry(1.8, 0.4, 1.0), new T.MeshStandardMaterial({ color: C.trunk, emissive: C.trunk, emissiveIntensity: 0.35, roughness: 0.7, side: T.BackSide }));
  tub.position.set(0, 0.8, -2.38); car.add(tub);
  [[-0.97, 0.12, 1.06], [0.97, 0.12, 1.06]].forEach(([x, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.4, d), paint); m.position.set(x, 0.8, -2.39); car.add(m); });
  const backWall = new T.Mesh(new T.BoxGeometry(2.0, 0.4, 0.1), paint); backWall.position.set(0, 0.8, -2.9); car.add(backWall);
  const trunkGlow = new T.PointLight(C.trunk, 0, 3, 1.5); trunkGlow.position.set(0, 0.95, -2.4); car.add(trunkGlow);
  const lidPivot = new T.Group(); lidPivot.position.set(0, 1.0, -1.86); car.add(lidPivot);
  const lid = new T.Mesh(new T.BoxGeometry(2.0, 0.05, 1.08), paint); lid.position.set(0, 0, -0.54); lidPivot.add(lid);

  // Original photo slot panel — placeholder with a label saying what the photo is (same ratio)
  const sans = fam("--kf-font-sans");
  const plate = (w, h, lines, tone, opts = {}) => tex(w, h, (x) => {
    x.fillStyle = tone; x.fillRect(0, 0, w, h);
    x.strokeStyle = css("--site-ink-faint"); x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
    x.strokeRect(6, 6, w - 12, h - 12);
    if (opts.title) { x.fillStyle = css("--kf-ink"); x.font = `800 ${opts.size || 30}px ${sans}`; x.textAlign = "center"; x.fillText(opts.title, w / 2, h * 0.16); }
    x.fillStyle = css("--kf-ink"); x.font = `500 ${opts.small || 15}px ${sans}`; x.textAlign = "center";
    lines.forEach((l, i) => x.fillText(l, w / 2, h * 0.5 + (i - (lines.length - 1) / 2) * (opts.small || 15) * 1.4));
  });
  const hueTone = (k) => { const c = C.glow.clone(); const hsl = {}; c.getHSL(hsl); c.setHSL((hsl.h + k * 0.18) % 1, hsl.s * 0.55, 0.22 + 0.08 * (k % 2)); return `#${c.getHexString()}`; };

  // Four videotapes — stood upright in the trunk (click for the video panel)
  const vhs = [0, 1, 2, 3].map((i) => {
    const front = plate(256, 384, ["Music video cover", ["Person, front view · Night lighting", "Cat illustration · green background", "Logo · red stage", "Person side profile · White outfit"][i], "Vertical 2:3"], hueTone(i), { title: `Video ${i + 1}`, size: 34 });
    const spine = dark;
    const m = new T.Mesh(new T.BoxGeometry(0.36, 0.56, 0.08), [spine, spine, spine, spine, std({ map: front, roughness: 0.4 }), spine]);
    m.position.set(-0.6 + i * 0.4, 0.92, -2.62); m.rotation.y = Math.PI + (i - 1.5) * 0.06; m.rotation.x = 0.1;
    m.userData = { kind: "vhs", index: i, label: "Watch video" };
    car.add(m); return m;
  });

  // Three cassettes above the dashboard — press to change the track
  const cassettes = [0, 1, 2].map((i) => {
    const face = plate(256, 160, [["Album cover · Hand-drawn figure", "Album cover · flower photo", "Album cover · Red print"][i]], hueTone(i + 4), { title: `Track name ${i + 1}`, size: 26, small: 13 });
    const m = new T.Mesh(new T.BoxGeometry(0.03, 0.16, 0.25), [std({ map: face, roughness: 0.35 }), dark, dark, dark, dark, dark]);
    m.position.set(0.42 + i * 0.16, 1.13, 0.76); m.rotation.set(0, Math.PI / 2 + 0.25 + i * 0.1, 0.12);
    m.userData = { kind: "cassette", index: i, label: "Play" };
    car.add(m); return m;
  });

  // Windshield hologram sticker — link in the Contact section
  const stickerMat = (map, k) => new T.ShaderMaterial({
    uniforms: { map: { value: map }, uTime: { value: 0 }, uTint: { value: C.glow }, uInk: { value: C.bg }, uK: { value: k }, uShift: { value: new T.Vector2() } },
    vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }",
    // uShift: the rainbow band shifts in the 45° direction by the distance the cursor travels over the sticker (original gradient one full cycle = Diagonal 1)
    fragmentShader: "uniform sampler2D map; uniform float uTime,uK; uniform vec2 uShift; uniform vec3 uTint,uInk; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vec4 t=texture2D(map,vUv); if(t.a<.05) discard; float h=vUv.x*.6+vUv.y*.4+dot(vN,vV)*1.6+uTime*.04+uK+(uShift.x-uShift.y)*.7071; vec3 iri=.5+.5*cos(6.28318*(vec3(0.,.33,.67)+h)); iri=mix(iri,uTint,.25); gl_FragColor=vec4(mix(uInk,iri,t.r),t.a); }",
    transparent: true, depthWrite: false,
  });
  const stickerTex = (w, h, text, shape) => tex(w, h, (x) => {
    x.clearRect(0, 0, w, h); x.fillStyle = css("--kf-ink");
    x.beginPath();
    if (shape === "pill") x.roundRect(4, 4, w - 8, h - 8, (h - 8) / 2);
    else if (shape === "oval") x.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, 7);
    else x.roundRect(4, 4, w - 8, h - 8, Math.min(w, h) / 2 - 4);
    x.fill();
    const rows = text.split("\n");
    let fs = (h * 0.34) / Math.max(1, rows.length * 0.75);
    x.fillStyle = css("--kf-bg"); x.textAlign = "center"; x.textBaseline = "middle";
    // The round sticker is narrow so text overflows — shrink until the longest line fits within 78% of the width
    do { x.font = `800 ${fs}px ${sans}`; fs *= 0.92; } while (Math.max(...rows.map((l) => x.measureText(l).width)) > w * 0.78 && fs > 6);
    rows.forEach((l, i, a) => x.fillText(l, w / 2, h / 2 + (i - (a.length - 1) / 2) * fs * 1.25));
  });
  const shieldBasis = (() => {
    const o = new T.Object3D(); o.position.copy(windshield.position); o.rotation.copy(windshield.rotation); o.updateMatrix(); return o.matrix;
  })();
  const stickers = [
    { t: "Link 1", s: "oval", u: -0.62, v: 0.32, w: 0.3, h: 0.17 },
    { t: "Link 2", s: "pill", u: -0.62, v: 0.12, w: 0.32, h: 0.1 },
    { t: "Link 3", s: "pill", u: -0.62, v: -0.02, w: 0.32, h: 0.1 },
    { t: "Link 4", s: "pill", u: -0.62, v: -0.16, w: 0.32, h: 0.1 },
    { t: "Backstory link", s: "pill", u: -0.6, v: -0.36, w: 0.26, h: 0.16 },
    { t: "Where it’s made", s: "round", u: 0.62, v: -0.26, w: 0.24, h: 0.32 },
  ].map((s, i) => {
    const m = new T.Mesh(new T.PlaneGeometry(s.w, s.h), stickerMat(stickerTex(Math.round(s.w * 800), Math.round(s.h * 800), s.t, s.s), i * 0.13));
    m.position.set(s.u, s.v, 0.004).applyMatrix4(shieldBasis);
    m.quaternion.setFromRotationMatrix(shieldBasis);
    m.userData = { kind: "sticker", index: i, label: s.t.replace("\n", " ") };
    car.add(m); return m;
  });

  // ── Purple light beams: two cones pouring down in front of the car from above (additive, fading toward the ends) ──
  const beamMat = new T.ShaderMaterial({
    uniforms: { uColor: { value: C.glow }, uAmt: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "uniform vec3 uColor; uniform float uAmt; varying vec2 vUv; void main(){ float a=pow(vUv.y,1.6)*(1.-abs(vUv.x-.5)*1.6); gl_FragColor=vec4(uColor*a*uAmt,1.); }",
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
  });
  const beams = [[-1.6, 2.2], [1.2, 1.4]].map(([x, z], i) => {
    const b = new T.Mesh(new T.CylinderGeometry(0.15, 1.6 + i * 0.4, 7, 24, 1, true), beamMat);
    b.position.set(x, 3.5, z); b.rotation.z = (i ? -0.25 : 0.3); scene.add(b); return b;
  });

  // Rain: short lines falling inside a box around the camera (the GPU moves them by time, and when they leave the box they re-enter from the opposite side)
  const N = mobile ? 2200 : 4200;
  const rainGeo = new T.BufferGeometry();
  const seeds = new Float32Array(N * 2 * 4);
  for (let i = 0; i < N; i++) {
    const s = [Math.random(), Math.random(), Math.random(), 0.25 + Math.random() * 0.35];
    for (let k = 0; k < 2; k++) { seeds.set([...s.slice(0, 3), k ? s[3] : 0], (i * 2 + k) * 4); }
  }
  rainGeo.setAttribute("position", new T.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  rainGeo.setAttribute("seed", new T.BufferAttribute(seeds, 4));
  const rainMat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uCam: { value: new T.Vector3() }, uColor: { value: C.ink } },
    vertexShader: "attribute vec4 seed; uniform float uTime; uniform vec3 uCam; varying float vA; void main(){ vec3 box=vec3(18.,12.,18.); vec3 p; p.x=uCam.x+mod(seed.x*box.x-uCam.x,box.x)-box.x*.5; p.z=uCam.z+mod(seed.z*box.z-uCam.z,box.z)-box.z*.5; p.y=uCam.y+mod(seed.y*box.y-uTime*(9.+seed.x*3.)-uCam.y,box.y)-box.y*.5; p.y+=seed.w; p.x+=seed.w*.08; vec4 mv=modelViewMatrix*vec4(p,1.); vA=smoothstep(14.,1.5,-mv.z)*(.25+seed.z*.35); gl_Position=projectionMatrix*mv; }",
    fragmentShader: "uniform vec3 uColor; varying float vA; void main(){ gl_FragColor=vec4(uColor,vA); }",
    transparent: true, depthWrite: false,
  });
  const rain = new T.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; scene.add(rain);

  // ── Phone: the cassette pillar and videotape band float in front of the camera (like the original phone panel, passing across the screen vertically · horizontally) ──
  const rig = new T.Group(); camera.add(rig); scene.add(camera);
  if (mobile) {
    cassettes.forEach((m, i) => { m.removeFromParent(); m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1); rig.add(m); m.geometry = new T.BoxGeometry(0.34, 0.48, 0.05); m.material = [dark, dark, dark, dark, m.material[0], dark]; });
    vhs.forEach((m) => { m.removeFromParent(); m.rotation.set(0, 0, 0); rig.add(m); });
  }
  // Phone intro section: broken windshield shards scatter from below and the sides, reflecting the mirrored scene
  const shardMat = std({ color: C.chrome, metalness: 1, roughness: 0.04, envMapIntensity: 1.6, transparent: true, opacity: 0.85, side: T.DoubleSide });
  const shards = mobile ? Array.from({ length: 14 }, (_, i) => {
    const r = 0.45 + Math.random() * 0.9, a = Math.random() * 6.28;
    const g = new T.BufferGeometry().setFromPoints([0, 2.1, 4.2].map((k) => new T.Vector3(Math.cos(a + k + Math.random() * 0.6) * r, Math.sin(a + k + Math.random() * 0.6) * r * 1.6, 0)));
    g.computeVertexNormals();
    const m = new T.Mesh(g, shardMat);
    const side = i % 2 ? 1 : -1;
    m.userData = { x: side * (0.35 + Math.random() * 0.9), y: -0.6 - Math.random() * 1.3, z: -2.6 - Math.random() * 1.6, rx: Math.random() * 0.8 - 0.4, ry: side * (0.4 + Math.random() * 0.5), drift: 0.6 + Math.random() };
    m.visible = false; rig.add(m); return m;
  }) : [];

  // ── Camera path: frame → position, look-at target, field of view. The last cell equals the first so the endless scroll connects ──
  const KEYS = mobile ? [
    [0, [0, 1.0, 10.5], [0, 1.1, 0], 52], [10, [0.3, 1.1, 8.5], [0, 1.0, 0], 52], [20, [-0.5, 1.4, 6.8], [0, 1.1, 0], 54],
    [32, [0, 1.25, 7.8], [0, 1.05, 0], 52], [46, [0.4, 1.0, 6.4], [0, 0.95, 0], 54], [60, [0, 1.15, 8.4], [0, 1.0, 0], 52],
    [72, [-0.3, 1.2, 8.8], [0, 1.0, 0], 52], [84, [0, 2.4, 6.5], [0, 0.9, 0], 52], [96, [0, 1.0, 10.5], [0, 1.1, 0], 52],
  ] : [
    [0, [-2.4, 1.05, 9.0], [0.3, 0.95, 0], 32], [6.5, [-0.4, 1.0, 6.8], [0, 0.9, 0], 32], [15.5, [-2.3, 0.85, 4.7], [-0.1, 0.8, 1.6], 34],
    [22, [-0.7, 1.55, 3.4], [0.1, 1.2, 0.6], 38], [28.5, [-0.05, 1.27, 0.3], [0.1, 1.2, 6], 50], [33, [0.2, 1.26, -1.15], [0.05, 1.02, 2.5], 50],
    [40, [0.05, 1.22, -0.75], [0.55, 1.05, 1.9], 46], [45, [1.7, 1.45, 0.4], [-0.5, 1.1, -1.5], 42], [49, [3.8, 1.25, 2.8], [-1.6, 1.25, -3.2], 38], [52, [3.6, 2.2, -3.8], [0, 1.0, -2.2], 38],
    [55, [0, 1.8, -6.4], [0, 0.95, -2.5], 36], [62, [0, 1.55, -5.5], [0, 0.92, -2.4], 34], [68.5, [-1.8, 3.3, -6.6], [0.2, 1.0, -1.2], 36],
    [74, [-6.2, 0.95, -0.4], [0, 0.8, 0.2], 34], [79, [0, 2.75, 2.55], [0, 1.15, 0.65], 40], [85, [0, 2.95, 2.9], [0, 1.15, 0.6], 40],
    [90.5, [0.2, 2.5, 7.2], [0, 0.95, 0], 34], [96, [-2.4, 1.05, 9.0], [0.3, 0.95, 0], 32],
  ];
  const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
  const n = KEYS.length;
  const at = (k) => KEYS[(k + n - 1) % (n - 1)];
  const pos = new T.Vector3(), tgt = new T.Vector3();
  const sample = (f) => {
    let i = 0;
    while (i < n - 2 && f >= KEYS[i + 1][0]) i++;
    const a = KEYS[i], b = KEYS[i + 1], t = Math.min(1, Math.max(0, (f - a[0]) / (b[0] - a[0])));
    const p0 = i === 0 ? at(n - 2) : KEYS[i - 1], p3 = i + 2 >= n ? at(1) : KEYS[i + 2];
    pos.set(...[0, 1, 2].map((k) => cr(p0[1][k], a[1][k], b[1][k], p3[1][k], t)));
    tgt.set(...[0, 1, 2].map((k) => cr(p0[2][k], a[2][k], b[2][k], p3[2][k], t)));
    return a[3] + (b[3] - a[3]) * (t * t * (3 - 2 * t));
  };
  const band = (f, a, b, c, d) => (f <= a || f >= d ? 0 : f < b ? (f - a) / (b - a) : f <= c ? 1 : (d - f) / (d - c));
  const ease = (t) => t * t * (3 - 2 * t);

  // ── Interaction: cursor label · press over 3D objects ──
  const label = document.querySelector(".av-cursor-label");
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let hit = null, px = -1, py = -1;
  const pickable = () => {
    const f = AV.frame;
    if (mobile) return [];
    return [...(f > 26 && f < 44 ? cassettes : []), ...(f > 52 && f < 70 ? vhs : []), ...(f > 76 && f < 91 ? stickers : [])];
  };
  // Graphic reaction while the cursor moves is desktop only (the original also makes no logo panel or cursor glow on phones), and is turned off with reduced motion
  const cursorOn = !mobile && !reduce;
  let movedAt = -1e9, lastNx = 0, lastNy = 0;
  addEventListener("pointermove", (e) => {
    px = e.clientX; py = e.clientY; label.style.left = `${px}px`; label.style.top = `${py}px`;
    movedAt = performance.now();
    const nx = (px / innerWidth) * 2 - 1, ny = -(py / innerHeight) * 2 + 1;
    if (cursorOn && hit?.userData.kind === "sticker") hit.material.uniforms.uShift.value.add(new T.Vector2(nx - lastNx, ny - lastNy).multiplyScalar(2.5));
    lastNx = nx; lastNy = ny;
  }, { passive: true });
  // 3D hover — original values: cassette +.3 (.1s, instantly on release), videotape ×1.12·y -.38·z +.28 (.25s), sticker ×1.08 (.3s)
  const rest = new Map();
  const hover = (o, on) => {
    if (!o || !cursorOn) return;
    if (!rest.has(o)) rest.set(o, { s: o.scale.x, r: o.rotation.clone() });
    const { s, r } = rest.get(o), kind = o.userData.kind;
    const size = (v, duration, ease) => gsap.to(o.scale, { x: v, y: v, z: v, duration, ease, overwrite: "auto" });
    if (kind === "cassette") size(on ? s + 0.3 : s, on ? 0.1 : 0, "power1.out");
    else if (kind === "vhs") {
      size(on ? s * 1.12 : s, 0.25, "power2.out");
      gsap.to(o.rotation, { x: r.x, y: r.y + (on ? -0.38 : 0), z: r.z + (on ? 0.28 : 0), duration: 0.25, ease: "power2.out", overwrite: "auto" });
    } else size(on ? s * 1.08 : s, 0.3, "power2.out");
  };
  const pick = () => {
    const list = pickable();
    if (!list.length || px < 0 || !AV.started) return null;
    ndc.set((px / innerWidth) * 2 - 1, -(py / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(list, false)[0]?.object || null;
  };
  const songEl = document.querySelector(".av-player__song");
  const vhsPanel = document.querySelector(".av-vhs");
  const openVhs = (i) => {
    vhsPanel.querySelector(".av-vhs__title").textContent = `Your video title $ here{i + 1}`;
    vhsPanel.hidden = false; requestAnimationFrame(() => vhsPanel.classList.add("is-open"));
    AV.lenis.stop(); document.body.classList.add("av-no-scroll");
  };
  const closeVhs = () => {
    vhsPanel.classList.remove("is-open");
    setTimeout(() => { vhsPanel.hidden = true; }, 350);
    AV.lenis.start(); document.body.classList.remove("av-no-scroll");
  };
  vhsPanel.querySelector(".av-vhs__close").addEventListener("click", closeVhs);
  vhsPanel.addEventListener("click", (e) => { if (e.target === vhsPanel) closeVhs(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !vhsPanel.hidden) closeVhs(); });
  const act = (o) => {
    if (!o) return;
    const { kind, index } = o.userData;
    if (kind === "cassette") { AV.song = index; songEl.textContent = `Track name ${index + 1}`; AV.setMusic(true); }
    else if (kind === "vhs") openVhs(index);
    else if (kind === "sticker") location.hash = `link-${index + 1}`;
  };
  canvas.parentElement.style.pointerEvents = "none";
  addEventListener("click", (e) => {
    if (e.target.closest("a, button, .av-wave, .av-vhs, .av-loader, .av-mmenu")) return;
    px = e.clientX; py = e.clientY;
    if (mobile) {
      ndc.set((px / innerWidth) * 2 - 1, -(py / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
      const f = AV.frame;
      act(ray.intersectObjects([...(f > 26 && f < 46 ? cassettes : []), ...(f > 54 && f < 82 ? vhs : [])], false)[0]?.object);
    } else act(pick());
  });

  // ── Phone cassette name tag ──
  const labelsBox = document.querySelector(".av-cassette-labels");
  const tags = mobile ? cassettes.map((_, i) => {
    const d = document.createElement("div"); d.className = "av-cassette-labels__item";
    d.innerHTML = `<span class="av-cassette-labels__name">Track name ${i + 1}</span><span class="av-cassette-labels__meta av-cassette-labels__year">0000</span><span class="av-cassette-labels__meta">Your label here</span>`;
    labelsBox.append(d); return d;
  }) : [];
  const v3 = new T.Vector3();

  // ── Hero logo plate: the original puts the logo on a 3D plate and splits RGB only around the cursor (within .2 of the plate width, red outward and blue inward by 1% of the plate width).
  //    The DOM logo (moved by index.js per frame) only keeps its place, and a square panel of the same position and size (the original art is a 2048 square) is drawn over it on the stage ──
  const heroEl = document.querySelector(".av-hero-logo");
  const hud = new T.Scene(), hudCam = new T.OrthographicCamera(0, innerWidth, 0, -innerHeight, -1, 1);
  const logoCv = document.createElement("canvas");
  const logoTex = new T.CanvasTexture(logoCv);
  const logoMat = new T.ShaderMaterial({
    uniforms: { map: { value: logoTex }, uAt: { value: new T.Vector2(0.5, 0.5) }, uAmt: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "uniform sampler2D map; uniform vec2 uAt; uniform float uAmt; varying vec2 vUv; void main(){ vec2 off=vUv-uAt; vec2 push=normalize(off+1e-4)*uAmt*(1.-smoothstep(0.,.2,length(off)))*.01; vec4 r=texture2D(map,vUv+push), g=texture2D(map,vUv+push*.1), b=texture2D(map,vUv-push); gl_FragColor=vec4(r.r,g.g,b.b,max(r.a,max(g.a,b.a))); }",
    transparent: true, depthTest: false, depthWrite: false,
  });
  const logoQuad = new T.Mesh(new T.PlaneGeometry(1, 1), logoMat); hud.add(logoQuad);
  let logoSide = 0;
  const yearEl = heroEl.querySelector(".av-hero-logo__year"), heroSvg = heroEl.querySelector("svg");
  const logoPath = new Path2D(document.querySelector("#av-logo path").getAttribute("d"));
  const drawLogo = () => {
    const r = heroEl.getBoundingClientRect();
    if (!r.width) return;
    const side = r.width * 1.04, k = 2, px2 = Math.round(side * k);
    if (logoCv.width !== px2) { logoCv.width = logoCv.height = px2; logoTex.dispose(); }
    logoSide = side;
    const x = logoCv.getContext("2d"), cs = getComputedStyle(yearEl), yb = yearEl.getBoundingClientRect(), sb = heroSvg.getBoundingClientRect();
    const ox = (side - r.width) / 2 - r.left, oy = (side - r.height) / 2 - r.top;
    x.setTransform(k, 0, 0, k, 0, 0); x.clearRect(0, 0, side, side);
    x.fillStyle = getComputedStyle(heroEl).color;
    x.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; x.letterSpacing = cs.letterSpacing;
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(yearEl.textContent, ox + yb.left + yb.width / 2, oy + yb.top + yb.height / 2);
    x.translate(ox + sb.left, oy + sb.top); x.scale(sb.width / 600, sb.height / 300); x.fill(logoPath);
    logoTex.needsUpdate = true;
  };
  if (!mobile) {
    const cs = getComputedStyle(yearEl);
    document.fonts.load(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, yearEl.textContent).catch(() => {}).finally(() => { drawLogo(); heroEl.classList.add("is-gl"); });
  }

  // ── Trunk section (original state table frames 52~68) cursor light: a pink point light (intensity 20 · distance 8) standing 1.2 in front of the videotape, on the side the cursor points to, turns on and off in .5s.
  //    Set intensity to 0 from the start — if light is newly added when turning on, every material recompiles and the screen freezes ──
  // The original intensity 20 only lights one side of the tail lights and trunk on a black glossy body — the copy’s body is bright matte, so left as is it would tint the whole car, and the value tuned to the recording is used.
  const CURSOR_LIGHT = 5;
  const cursorLight = cursorOn ? new T.PointLight(C.trunk, 0, 8) : null;
  if (cursorLight) { cursorLight.position.set(0, 0, -4); camera.add(cursorLight); }
  const vhsMid = new T.Vector3(0, 0.92, -2.62), lv = new T.Vector3();
  let lightOn = false, warm = false;

  // ── Drawing ──
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    hudCam.right = innerWidth; hudCam.bottom = -innerHeight; hudCam.updateProjectionMatrix();
    if (logoSide) drawLogo();
  };
  addEventListener("resize", resize); resize();
  let time = 0, last = performance.now();
  const render = () => {
    // So the first draw (shader bake) doesn’t stall the loader wave, drawing starts after the loader fills — until then the loader panel covers the stage
    if (!AV.ready && !AV.started) return;
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    if (!reduce) time += dt;
    const f = AV.frame;
    const fov = sample(f);
    camera.position.copy(pos); camera.lookAt(tgt);
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    const glow = ease(band(f, 7, 13, 21, 27)) + ease(band(f, 43, 47, 54, 58));
    glowLight.intensity = glow * 45; glowBack.intensity = glow * 18; beamMat.uniforms.uAmt.value = glow * (mobile ? 0.6 : 0.55);
    beams.forEach((b) => (b.visible = glow > 0.01));
    const bio = ease(band(f, 43, 47, 54, 58));
    warmLight.intensity = bio * 160; skyMat.uniforms.uAmt.value = bio * 0.75;
    cabinLight.intensity = ease(band(f, 25, 29, 41, 45)) * 1.2;
    const lidOpen = mobile ? 0 : ease(band(f, 49, 53, 70, 75));
    lidPivot.rotation.x = lidOpen * 1.25;
    trunkGlow.intensity = lidOpen * 3.5;
    rainMat.uniforms.uTime.value = time; rainMat.uniforms.uCam.value.copy(camera.position);
    stickers.forEach((s) => (s.material.uniforms.uTime.value = time));
    const inside = f > 25 && f < 44;
    flares.forEach((s, i) => { s.visible = !inside; s.scale.setScalar(1.05 + Math.sin(time * 2 + i) * 0.04); });

    if (mobile) {
      // Glass shards: spread outward and spin over frames 16 to 34
      const sp = (f - 16) / 18;
      shards.forEach((m) => {
        const u = m.userData, k = Math.min(1, Math.max(0, sp));
        m.visible = sp > 0 && sp < 1;
        m.position.set(u.x * (1 + k * u.drift), u.y - k * 0.4, u.z + k * 0.8);
        m.rotation.set(u.rx + k * 0.6, u.ry + k * u.drift * 0.5, k * 0.3);
      });
      // Cassette pillars: rise from below in the music section and exit upward
      const cs = (f - 24) / 22;
      cassettes.forEach((m, i) => {
        const y = 0.9 - i * 0.62 + (cs - 0.45) * 2.6;
        m.position.set(-0.42, y, -3.2); m.rotation.set(0, 0.35 + Math.sin(time * 0.6 + i) * 0.05, 0);
        m.visible = cs > -0.2 && cs < 1.2;
        const tag = tags[i];
        if (m.visible) { m.getWorldPosition(v3).project(camera); tag.style.opacity = 1; tag.style.top = `${(-v3.y * 0.5 + 0.5) * 100}%`; tag.style.left = `calc(${(v3.x * 0.5 + 0.5) * 100}% + 20vw)`; }
        else tag.style.opacity = 0;
      });
      // Videotape strip: passes from right to left during the video section (400vh)
      const vs = (f - 55) / 28;
      vhs.forEach((m, i) => {
        m.position.set(1.6 - vs * 5.2 + i * 1.05, 0.05, -3.0 + Math.abs(1.6 - vs * 5.2 + i * 1.05) * -0.35);
        m.rotation.set(0, -0.35 + (1.6 - vs * 5.2 + i * 1.05) * -0.25, 0);
        m.scale.setScalar(2.2); m.visible = vs > -0.1 && vs < 1.1;
      });
    }

    // Logo plate: follows the cursor position at .15 per frame, holds 200ms after the last movement and then fades out over 400ms (fades out right away if the cursor is outside the plate)
    logoQuad.visible = logoSide > 0 && heroEl.style.visibility !== "hidden";
    if (logoQuad.visible) {
      const r = heroEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      logoQuad.position.set(cx, -cy, 0); logoQuad.scale.set(logoSide, logoSide, 1);
      const u = (px - cx) / logoSide + 0.5, v = 0.5 - (py - cy) / logoSide;
      const over = cursorOn && AV.started && px >= 0 && u >= 0 && u <= 1 && v >= 0 && v <= 1;
      const hold = 1 - Math.min(1, Math.max(0, (now - movedAt - 200) / 400));
      const k = 1 - Math.pow(0.85, dt * 60), lu = logoMat.uniforms;
      if (over) lu.uAt.value.lerp(new T.Vector2(u, v), k);
      lu.uAmt.value += ((over ? hold : 0) - lu.uAmt.value) * k;
    }
    if (cursorLight) {
      const want = f >= 52 && f < 68;
      if (want !== lightOn) { lightOn = want; gsap.killTweensOf(cursorLight); gsap.to(cursorLight, { intensity: want ? CURSOR_LIGHT : 0, duration: 0.5 }); }
      if (cursorLight.intensity > 0.01) {
        camera.updateMatrixWorld();
        car.localToWorld(lv.copy(vhsMid)); camera.worldToLocal(lv);
        const d = Math.max(0.5, -lv.z - 1.2), hh = Math.tan(T.MathUtils.degToRad(camera.fov) / 2) * d;
        const nx = px < 0 ? 0 : (px / innerWidth) * 2 - 1, ny = py < 0 ? 0 : -(py / innerHeight) * 2 + 1;
        cursorLight.position.set(nx * hh * camera.aspect, ny * hh, -d);
      }
    }

    const o = pick();
    if (o !== hit) {
      hover(hit, false); hover(o, true);
      hit = o;
      label.textContent = o ? o.userData.label : "";
      label.classList.toggle("is-visible", !!o);
      document.body.classList.toggle("av-pointer", !!o);
    }
    // The logo panel shader is baked on the first draw — compiling it on the first cursor move would freeze the screen
    if (!warm) { warm = true; const was = logoQuad.visible; logoQuad.visible = true; renderer.compile(hud, hudCam); logoQuad.visible = was; }
    renderer.render(scene, camera);
    if (logoQuad.visible) { renderer.autoClear = false; renderer.render(hud, hudCam); renderer.autoClear = true; }
  };
  gsap.ticker.add(render);
  AV.stage = { scene, camera, renderer };
})();
