// 3D scene behind the screen: a dark ink human sculpture in purple light, with the camera sweeping down from head → point cloud over the hand → light ring under the feet according to section progress (HR.progress).
// The original uses a scanned human model (gltf), but here basic shapes are layered to produce only the same composition and light.
(() => {
  const html = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("h-webgl");
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // Resolve skin variables (including oklch relative colors) into rgb strings the canvas can paint
  const probeEl = Object.assign(document.createElement("i"), { hidden: true });
  html.append(probeEl);
  const probeCtx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const cssRGB = (name, a = 1) => {
    probeEl.style.color = `var(${name})`;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = getComputedStyle(probeEl).color;
    probeCtx.fillRect(0, 0, 1, 1);
    const d = probeCtx.getImageData(0, 0, 1, 1).data;
    return `rgba(${d[0]},${d[1]},${d[2]},${a})`;
  };

  let ready;
  window.HR.load.push(new Promise((r) => (ready = r)));

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  // Original WEBGL.fov = 30
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);

  // Background: light purple at the top, deeper indigo toward the bottom and edges
  const bg = document.createElement("canvas");
  bg.width = bg.height = 256;
  const g = bg.getContext("2d");
  const lin = g.createLinearGradient(0, 0, 0, 256);
  lin.addColorStop(0, cssRGB("--site-scene-top"));
  lin.addColorStop(0.55, cssRGB("--site-scene-mid"));
  lin.addColorStop(1, cssRGB("--site-scene-low"));
  g.fillStyle = lin;
  g.fillRect(0, 0, 256, 256);
  const vig = g.createRadialGradient(128, 90, 30, 128, 128, 200);
  vig.addColorStop(0, cssRGB("--site-scene-glow", 0.25));
  vig.addColorStop(1, cssRGB("--site-scene-shade", 0.55));
  g.fillStyle = vig;
  g.fillRect(0, 0, 256, 256);
  const bgTex = new THREE.CanvasTexture(bg);
  bgTex.colorSpace = THREE.SRGBColorSpace;
  scene.background = bgTex;

  scene.add(new THREE.HemisphereLight(0x7a5cff, 0x05040c, 0.9));
  const rim = new THREE.DirectionalLight(0xa88cff, 3.2);
  rim.position.set(-1.2, 2.4, -1.4);
  scene.add(rim);
  const key = new THREE.DirectionalLight(0x4a5cff, 1.4);
  key.position.set(1.4, 1.2, 1.6);
  scene.add(key);
  const under = new THREE.PointLight(0x7f5bff, 2.2, 1.4, 1.6);
  under.position.set(0, 0.06, 0.25);
  scene.add(under);

  /* ── Body part: overlapping ellipsoid and capsule ── */
  const skin = new THREE.MeshStandardMaterial({ color: 0x0a0920, roughness: 0.5, metalness: 0.15 });
  // Original yurayura: the whole world sways slowly — pieces, point cloud and light ring held in one group
  const world = new THREE.Group();
  scene.add(world);
  const body = new THREE.Group();
  world.add(body);
  const sphere = new THREE.SphereGeometry(1, 48, 32);
  const blob = (c, s, parent = body, rot) => {
    const m = new THREE.Mesh(sphere, skin);
    m.position.copy(c);
    m.scale.set(s[0], s[1], s[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  };
  const limb = (a, b, r, parent = body) => {
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), skin);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    parent.add(m);
    return m;
  };

  // Head is a 3/4 profile, lowered down and to the left
  const head = new THREE.Group();
  head.position.set(0, 1.6, 0);
  head.rotation.set(0.42, -0.75, 0.12);
  body.add(head);
  // Carve a sphere into a head: narrow the jaw, enlarge the back of the skull, and raise brow ridges, nose, lips, and chin on the front
  const headGeo = new THREE.SphereGeometry(1, 96, 72);
  const hp = headGeo.attributes.position;
  const bump = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
  const sstep = (a, b, t) => { const k = Math.min(Math.max((t - a) / (b - a), 0), 1); return k * k * (3 - 2 * k); };
  for (let i = 0; i < hp.count; i++) {
    let x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    const front = Math.max(z, 0), ax = Math.abs(x);
    x *= 1 - 0.3 * sstep(0, -1, y);
    if (z < 0) z *= 1.14;
    z += front * (0.24 * bump(x, y, 0, -0.12, 0.11, 0.2) + 0.08 * bump(ax, y, 0, 0.24, 0.5, 0.07) + 0.06 * bump(x, y, 0, -0.45, 0.22, 0.07) + 0.1 * bump(x, y, 0, -0.72, 0.2, 0.14) + 0.05 * bump(ax, y, 0.55, -0.05, 0.2, 0.15));
    z -= front * 0.1 * bump(ax, y, 0.36, 0.1, 0.14, 0.1);
    z += 0.12 * sstep(-0.3, -0.9, y) * front;
    hp.setXYZ(i, x * 0.088, y * 0.118, z * 0.104);
  }
  headGeo.computeVertexNormals();
  head.add(new THREE.Mesh(headGeo, skin));
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.062, 0.2, 32), skin);
  neck.position.set(0, 1.47, -0.02);
  neck.rotation.x = 0.18;
  body.add(neck);
  blob(V(0, 1.26, -0.01), [0.2, 0.19, 0.115]);
  blob(V(0, 1.33, 0.02), [0.17, 0.09, 0.1]);
  blob(V(-0.17, 1.37, -0.01), [0.09, 0.05, 0.075], body, [0, 0, 0.25]);
  blob(V(0.17, 1.37, -0.01), [0.09, 0.05, 0.075], body, [0, 0, -0.25]);
  blob(V(0, 1.06, 0), [0.14, 0.15, 0.1]);
  blob(V(0, 0.92, 0), [0.17, 0.12, 0.11]);

  // Both arms gather forward and cradle the point cloud in the palms
  [-1, 1].forEach((s) => {
    const sh = V(0.2 * s, 1.37, 0), el = V(0.25 * s, 1.13, 0.1), wr = V(0.075 * s, 1.03, 0.33);
    limb(sh, el, 0.045);
    limb(el, wr, 0.036);
    const palm = new THREE.Group();
    palm.position.set(0.055 * s, 1.025, 0.37);
    palm.rotation.set(0.15, -0.35 * s, -0.55 * s);
    body.add(palm);
    blob(V(0, 0, 0), [0.045, 0.016, 0.055], palm);
    [-0.03, -0.01, 0.01, 0.03].forEach((fx, i) => {
      const a = V(fx * 1.1, 0.004, 0.045), b = V(fx * 1.4, 0.03 + i * 0.004, 0.105);
      limb(a, b, 0.0105, palm);
    });
    limb(V(-0.045 * s * -1, 0, 0.0), V(-0.07 * s * -1, 0.03, 0.04), 0.012, palm);
  });

  [-1, 1].forEach((s) => {
    limb(V(0.09 * s, 0.9, 0), V(0.1 * s, 0.5, 0.02), 0.07);
    limb(V(0.1 * s, 0.5, 0.02), V(0.1 * s, 0.09, -0.01), 0.048);
    blob(V(0.1 * s, 0.035, 0.06), [0.045, 0.034, 0.11]);
  });

  /* ── Dot cloud over the hand: a jittered cube grid ── */
  const N = 13, pts = [];
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
    const j = () => (Math.random() - 0.5) * 0.35;
    pts.push((x + j()) / (N - 1) - 0.5, (y + j()) / (N - 1) - 0.5, (z + j()) / (N - 1) - 0.5);
  }
  const cloudGeo = new THREE.BufferGeometry();
  cloudGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const cloudMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uSize: { value: 2.4 * renderer.getPixelRatio() } },
    vertexShader: `uniform float uSize; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (1.0 / -mv.z); vA = clamp(0.35 + position.y * 0.8, 0.15, 1.0); }`,
    fragmentShader: `varying float vA;
      void main(){ float d = length(gl_PointCoord - .5); if(d > .5) discard;
      gl_FragColor = vec4(vec3(.74,.68,1.), (1. - d * 2.) * .55 * vA); }`,
  });
  const cloud = new THREE.Points(cloudGeo, cloudMat);
  cloud.position.set(0, 1.135, 0.38);
  cloud.scale.setScalar(0.2);
  cloud.rotation.set(0.5, 0.6, 0.1);
  world.add(cloud);

  /* ── Underfoot Light Ring ── */
  const ring = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `varying vec2 vUv;
        void main(){ vec2 p = (vUv - .5) * 2.; float r = length(p * vec2(1., 1.15));
        float ring = smoothstep(.16, .0, abs(r - .4)) * .8 + smoothstep(.6, .0, r) * .22;
        gl_FragColor = vec4(vec3(.62,.5,1.) * ring, ring); }`,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.002, 0.03);
  world.add(ring);

  /* ── Camera spots per section (position · look-at point): the original SECTION_SYNC_SCROLL section table (a straight line from top .0 → supervisor 1).
       The original targets of top·concept sit where the original head and chest were, so the same direction is shifted toward our head and chest.
       In the original, apply·entry look at a walking actor and a footprint floor (a separate ground), so here they look at the light ring under our feet instead (gaps) ── */
  // The target goes to the anatomy position (original head 75 → ours 1.6, hip 0 → .85), and the camera is in the same direction as the original, at a distance reduced by the head size ratio —
  // In the original first scene the head is 6/10 of the screen height (head about 41 at 30° FOV and distance 123.6), so fitting our head (.236) makes it .00574×
  const D = 0.00574;
  const T = (p, d = [0, 0, 0]) => V(p[0] * 0.01 + d[0], p[1] * 0.01 + 0.85 + d[1], p[2] * 0.01 + d[2]);
  const shot = (pos, tgt, d) => { const t = T(tgt, d); return [t.clone().add(V(pos[0] - tgt[0], pos[1] - tgt[1], pos[2] - tgt[2]).multiplyScalar(D)), t]; };
  const HEAD = [-0.211, 0, 0.327], CHEST = [-0.115, 0, 0.166];
  const SHOTS = [
    shot([114.42, 72.17, 48.3], [21.13, 75.0, -32.7], HEAD),
    shot([58.8, 38.3, 64.5], [11.5, 37.5, -16.6], CHEST),
    shot([-0.3, 2.5, 84.6], [0, 0, 0]),
    shot([-36.7, 33.1, 61.2], [0, 0, 0]),
    shot([-62.8, 31.1, 34.5], [0, 0, 0]),
    shot([-92.4, 32.5, 13.7], [0, 0, 0]),
    [V(0.18, 0.55, 0.92), V(0.0, 0.33, 0.0)],
    [V(0.0, 0.5, 1.15), V(0.0, -0.32, 0.05)],
  ];
  // SPLASH: at first from this spot (far behind the head) it blends into the section spot over 8s expo.out
  const [fp, fl] = shot([44.36, 38.02, -244.29], [27.99, 51.83, -31.36], HEAD);
  const FROM = { pos: fp, look: fl };
  const splash = { p: reduced ? 1 : 0 };
  document.addEventListener("hr:a1", () => { if (!reduced) gsap.fromTo(splash, { p: 0 }, { p: 1, duration: 8, ease: "expo.out" }); });
  const cur = { pos: SHOTS[0][0].clone(), look: SHOTS[0][1].clone() };
  const want = { pos: V(0, 0, 0), look: V(0, 0, 0) };
  const eye = { pos: V(0, 0, 0), look: V(0, 0, 0) };

  let distScale = 1;
  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // On portrait screens the same composition is cropped left and right, so pull back by that much
    distScale = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 1.1 : 1;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

  const t0 = performance.now();
  let last = t0;
  const deg = Math.PI / 180;
  const frame = () => {
    const now = performance.now(), dt = Math.max(1, now - last) / 1000;
    last = now;
    // The original links sections in a straight line (ease none)
    const p = Math.min(Math.max(window.HR.progress || 0, 0), SHOTS.length - 1);
    const i = Math.min(Math.floor(p), SHOTS.length - 2), f = p - i;
    want.look.lerpVectors(SHOTS[i][1], SHOTS[i + 1][1], f);
    want.pos.lerpVectors(SHOTS[i][0], SHOTS[i + 1][0], f).sub(want.look).multiplyScalar(distScale).add(want.look);
    // Render position follows .5 of the remaining distance each frame (at 60fps)
    const k = reduced ? 1 : 1 - Math.pow(0.5, dt * 60);
    cur.pos.lerp(want.pos, k);
    cur.look.lerp(want.look, k);
    eye.pos.lerpVectors(FROM.pos, cur.pos, splash.p);
    eye.look.lerpVectors(FROM.look, cur.look, splash.p);
    camera.position.copy(eye.pos);
    camera.lookAt(eye.look);
    if (!reduced) {
      const t = (now - t0) / 1000, e = 0.5 * t;
      world.position.set(-0.0075 * Math.sin(e), 0.0066 * Math.sin(2 * e), 0);
      world.rotation.set(0, 0.15 * Math.sin(2 * e + 0.6) * deg, -0.24 * Math.sin(e + 1.2) * deg);
      cloud.rotation.y += 0.0035;
    }
    renderer.render(scene, camera);
  };
  gsap.ticker.add(frame);
  frame();
  ready();

  /* ── Reviewer panel: photo as stipple — without data-src it dots by the brightness of a bust silhouette ── */
  const portrait = (u, v, seed) => {
    const hx = 0.5 + (seed ? 0.03 : -0.02), hy = seed ? 0.4 : 0.42, rx = seed ? 0.19 : 0.215, ry = seed ? 0.25 : 0.26;
    const dh = ((u - hx) / rx) ** 2 + ((v - hy) / ry) ** 2;
    const ds = ((u - 0.5) / 0.5) ** 2 + ((v - 1.02) / 0.3) ** 2;
    const neck = Math.abs(u - hx) < 0.09 && v > hy + 0.18 && v < 0.85 ? 0.75 : 0;
    let L = Math.max(dh < 1 ? 1 - dh * 0.35 : 0, ds < 1 ? 0.7 - ds * 0.3 : 0, neck);
    if (!L) return 0;
    L *= 0.45 + 0.55 * Math.max(0, 1 - (u - (hx - 0.12)) * 1.6);
    const eye = (ex) => (((u - ex) / 0.045) ** 2 + ((v - (hy - 0.02)) / 0.022) ** 2 < 1 ? 0.35 : 1);
    L *= eye(hx - 0.075) * eye(hx + 0.075);
    if (Math.abs(u - hx) < 0.05 && Math.abs(v - (hy + 0.14)) < 0.008) L *= 0.4;
    return L;
  };
  // Original reviewer edition: a point cloud (WebGL) extracted from the photo and depth map is revealed over 4s power4.out when it first enters the screen —
  // Dot threshold .95 → .12 adds more dots, the 1.1x silhouette and 1.35x dots stay in place at their own size, the per-dot scattered rotation (.5) unwinds, and depth comes alive from the flat plane.
  // Colors go from a dark tint → a light tint (contrast 1.4 · gamma 1.2), and two light bands (width .1 · strength 2) pass along the depth every 8s. The formula was rewritten from the original values
  const rgb = (name) => cssRGB(name).match(/\d+/g).slice(0, 3).map((v) => v / 255);
  const lumaOf = (img, cols, rows) => {
    const off = Object.assign(document.createElement("canvas"), { width: cols, height: rows }).getContext("2d", { willReadFrequently: true });
    const r = Math.max(cols / img.width, rows / img.height);
    off.drawImage(img, (cols - img.width * r) / 2, (rows - img.height * r) / 2, img.width * r, img.height * r);
    const d = off.getImageData(0, 0, cols, rows).data;
    return (u, v) => { const k = (Math.min(rows - 1, Math.floor(v * rows)) * cols + Math.min(cols - 1, Math.floor(u * cols))) * 4; return (d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11) / 255; };
  };
  const htVert = `
    attribute float aMono; attribute float aPresence; attribute float aSize;
    uniform float uFade; uniform float uDepth; varying float vMono; varying float vDepth; varying float vHas;
    void main() {
      float rev = clamp(uFade, 0.0, 1.0), pull = (1.0 - rev) * (1.0 - rev);
      vHas = step(mix(0.95, 0.12, rev), aPresence);
      float h = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453);
      float a = (h - 0.5) * 0.5 * pull, s = sin(a), c = cos(a);
      vec2 xy = mat2(c, -s, s, c) * position.xy * mix(1.1, 1.0, rev);
      vec3 p = vec3(xy, position.z * rev);
      vDepth = clamp(p.z / max(uDepth, 1.0) * 0.5 + 0.5, 0.0, 1.0);
      vMono = aMono;
      gl_PointSize = vHas < 0.5 ? 0.0 : aSize * mix(0.8, 1.35, aMono) * mix(0.9, 1.2, vDepth) * mix(1.35, 1.0, rev);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const htFrag = `
    uniform vec3 uDark; uniform vec3 uBright; uniform vec3 uPulse; uniform float uTime; uniform float uContrast;
    varying float vMono; varying float vDepth; varying float vHas;
    void main() {
      vec2 q = gl_PointCoord * 2.0 - 1.0; float d = dot(q, q);
      if (vHas < 0.5 || d > 1.0) discard;
      float m = pow(clamp((vMono - 0.5) * uContrast + 0.5, 0.0, 1.0), 1.2);
      vec3 col = mix(uDark, uBright, m);
      float phase = fract(uTime / 8.0), w = 0.1, travel = 1.0 + w * 3.0, pulse = 0.0;
      float pos = clamp((1.0 - vDepth - 0.5) * 2.0 + 0.5, 0.0, 1.0);
      for (int i = 0; i < 2; i++) {
        float e = fract(phase + float(i) * 0.5) * travel - w;
        pulse = max(pulse, smoothstep(e - w, e, pos) - smoothstep(e, e + w, pos));
      }
      col += uPulse * pulse * 2.0;
      col -= pow(1.0 - length(q), 2.0) * 0.1;
      gl_FragColor = vec4(col, smoothstep(1.0, 0.18, d) * mix(0.35, 1.0, m) * mix(0.8, 1.15, vDepth));
    }`;
  const buildHalftone = (st) => {
    const { cv } = st, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (!st.r) {
      try { st.r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false }); } catch (e) { return; }
      st.scene = new THREE.Scene();
      st.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
      st.r.setClearColor(new THREE.Color().setRGB(...rgb("--site-ht-bg"), THREE.SRGBColorSpace));
    }
    st.r.setPixelRatio(Math.min(devicePixelRatio, 2));
    st.r.setSize(w, h, false);
    Object.assign(st.cam, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
    st.cam.updateProjectionMatrix();
    if (st.points) { st.scene.remove(st.points); st.points.geometry.dispose(); }
    const s = Math.max(5, w / 85), depth = 0.6 * w;
    const sampler = st.img ? lumaOf(st.img, Math.ceil(w / s), Math.ceil(h / s)) : (u, v) => portrait(u, v, Number(cv.dataset.seed));
    const pos = [], mono = [], pres = [], size = [];
    for (let y = s / 2; y < h; y += s) for (let x = s / 2; x < w; x += s) {
      const L = Math.min(sampler(x / w, y / h), 1);
      if (L < 0.04) continue;
      pos.push(x - w / 2, h / 2 - y, (L - 0.5) * depth);
      mono.push(L); pres.push(0.12 + Math.random() * 0.88); size.push(s * 0.92 * st.r.getPixelRatio());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aMono", new THREE.Float32BufferAttribute(mono, 1));
    g.setAttribute("aPresence", new THREE.Float32BufferAttribute(pres, 1));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
    st.mat ||= new THREE.ShaderMaterial({
      uniforms: { uFade: { value: reduced ? 1 : 0 }, uDepth: { value: depth }, uTime: { value: 0 }, uContrast: { value: Number(cv.dataset.seed) ? 1 : 1.4 },
        uDark: { value: new THREE.Vector3(...rgb("--site-ht-dark")) }, uBright: { value: new THREE.Vector3(...rgb("--site-ht-bright")) }, uPulse: { value: new THREE.Vector3(...rgb("--site-ht-pulse")) } },
      vertexShader: htVert, fragmentShader: htFrag, transparent: true, depthTest: false, depthWrite: false,
    });
    st.mat.uniforms.uDepth.value = depth;
    st.points = new THREE.Points(g, st.mat);
    st.points.frustumCulled = false;
    st.scene.add(st.points);
    if (st.on) appear(st);
  };
  const appear = (st) => {
    if (st.played || !st.mat || reduced) return;
    st.played = true;
    gsap.fromTo(st.mat.uniforms.uFade, { value: 0 }, { value: 1, duration: 4, ease: "power4.out" });
  };
  const halftones = [...document.querySelectorAll(".h-ht")].map((fig) => {
    const cv = fig.querySelector(".h-ht__cv");
    const st = { cv, img: null, on: false, played: false };
    if (fig.dataset.src) {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => { st.img = im; buildHalftone(st); };
      im.src = fig.dataset.src;
    }
    new IntersectionObserver(([e]) => {
      st.on = e.isIntersecting;
      if (st.on) appear(st);
    }).observe(fig);
    return st;
  });
  const redraw = () => halftones.forEach(buildHalftone);
  addEventListener("load", redraw);
  addEventListener("resize", redraw);
  gsap.ticker.add((time) => halftones.forEach((st) => {
    if (!st.on || !st.r || !st.points) return;
    st.mat.uniforms.uTime.value = time;
    st.r.render(st.scene, st.cam);
  }));

  /* ── Phone: curriculum card accordion ── */
  document.querySelectorAll(".h-curri__li").forEach((li) => li.addEventListener("click", () => {
    if (html.classList.contains("is-v-s")) li.classList.toggle("is-open");
  }));
})();
