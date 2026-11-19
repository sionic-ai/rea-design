// Service — seven pointed arch doors (width 1060·height 1700) stand in a round brick cellar wall of radius 2600, and the frame holding the camera (FOV 40, looking at −330 from 2150 toward the wall)
// Rotates on the center axis. Wheel: one step per 100px, push: 44px and when horizontal exceeds 1.15× vertical, also arrow keys and the scale below. The current position follows the target
// Follows with τ .13s, and the camera frame with τ .03s (original ServicesPage · ServiceCathedral values). The smoke inside the door is newly built with our own fbm shader
(() => {
  const T = window.THREE;
  const root = document.querySelector(".cs-crypt");
  if (!T || !root) return;
  const stage = root.querySelector(".cs-crypt__stage");
  const labelBox = root.querySelector(".cs-crypt__labels");
  const hint = root.querySelector(".cs-crypt__hint");
  const tl = root.querySelector(".cs-tl");
  const reduce = cs.reduce;

  const SERVICES = [
    { rune: "ᛏ", name: "Service One", sub: "Your one-line description here" },
    { rune: "ᛒ", name: "Service Two", sub: "Your one-line description here" },
    { rune: "ᚠ", name: "Service Three", sub: "Your one-line description here" },
    { rune: "ᛊ", name: "Service Four", sub: "Your one-line description here" },
    { rune: "ᛉ", name: "Service Five", sub: "Your one-line description here" },
    { rune: "ᛟ", name: "Service Six", sub: "Your one-line description here" },
    { rune: "ᚷ", name: "Service Seven", sub: "Your one-line description here" },
  ];
  const N = SERVICES.length;
  // Each door has its own nameplate — only the centered door’s plate floats up in .38s, and once rotation starts only that one fades out (original portalTitle)
  const labels = SERVICES.map((sv) => {
    const el = document.createElement("div");
    el.className = "cs-crypt__label is-moving";
    el.innerHTML = `<span class="cs-crypt__rune" aria-hidden="true">${sv.rune}</span><strong class="cs-crypt__name" data-label="Service name (English)">${sv.name}</strong><span class="cs-crypt__sub">${sv.sub}</span>`;
    labelBox.append(el);
    return el;
  });

  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (css) => {
    probe.style.color = css;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const d = px.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const BG = rgbOf("var(--kf-bg)"), COLD = rgbOf("var(--site-cold)"), CREAM = rgbOf("var(--kf-ink-soft)");
  const portalRGB = SERVICES.map((_, i) => rgbOf(`var(--site-portal-${i})`));
  probe.remove();
  const mixC = (a, b, t, al = 1) => `rgba(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ")}, ${al})`;
  const toColor = (rgb) => new T.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255).convertSRGBToLinear();

  // Bricks — row height 64, width 90~190, joint 4, 26 shade smudges. Two maps: pattern and bump
  function bricks(seed) {
    let s = seed * 9973 + 7;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const S = 512, map = document.createElement("canvas"), bump = document.createElement("canvas");
    map.width = map.height = bump.width = bump.height = S;
    const g = map.getContext("2d"), b = bump.getContext("2d");
    g.fillStyle = mixC(BG, COLD, 0.04); g.fillRect(0, 0, S, S);
    b.fillStyle = "rgba(0, 0, 0, 1)"; b.fillRect(0, 0, S, S); /* Not skin: height value of the bump map (black  = Grout) */
    for (let y = 0; y < S; y += 64) {
      let x = -rnd() * 190;
      while (x < S) {
        const w = 90 + rnd() * 100, v = 1 + (rnd() - 0.5) * 0.32;
        for (const off of [0, -S, S]) {
          g.fillStyle = mixC(BG, COLD, Math.min(1, 0.17 * v)); g.fillRect(x + off + 2, y + 2, w - 4, 60);
          b.fillStyle = "rgba(138, 138, 138, 1)"; b.fillRect(x + off + 2, y + 2, w - 4, 60); /* Not skin: bump height */
          b.fillStyle = "rgba(196, 196, 196, 1)"; b.fillRect(x + off + 7, y + 7, w - 14, 50); /* Not skin: bump height */
        }
        x += w;
      }
    }
    for (let i = 0; i < 26; i++) {
      const x = rnd() * S, y = rnd() * S, r = 30 + rnd() * 110, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, mixC(BG, BG, 0, 0.12 + rnd() * 0.16)); gr.addColorStop(1, mixC(BG, BG, 0, 0));
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const tex = [new T.CanvasTexture(map), new T.CanvasTexture(bump)];
    tex.forEach((t) => { t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; });
    tex[0].colorSpace = T.SRGBColorSpace;
    return tex;
  }
  // Paving stone — a stone with clipped corners for each wobbly grid cell
  function flags() {
    const S = 1024, cv = document.createElement("canvas");
    cv.width = cv.height = S;
    const g = cv.getContext("2d");
    g.fillStyle = mixC(BG, COLD, 0.02); g.fillRect(0, 0, S, S);
    const n = 8, c = S / n, jit = [];
    for (let y = 0; y <= n; y++) { jit[y] = []; for (let x = 0; x <= n; x++) jit[y][x] = [x * c + (x % n ? (Math.random() - 0.5) * c * 0.5 : 0), y * c + (y % n ? (Math.random() - 0.5) * c * 0.5 : 0)]; }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = [jit[y][x], jit[y][x + 1], jit[y + 1][x + 1], jit[y + 1][x]];
      const cx = p.reduce((a, q) => a + q[0], 0) / 4, cy = p.reduce((a, q) => a + q[1], 0) / 4;
      g.fillStyle = mixC(BG, COLD, 0.1 + Math.random() * 0.08);
      g.beginPath();
      p.forEach((q, i) => { const qx = cx + (q[0] - cx) * 0.94, qy = cy + (q[1] - cy) * 0.94; i ? g.lineTo(qx, qy) : g.moveTo(qx, qy); });
      g.closePath(); g.fill();
    }
    for (let i = 0; i < 9000; i++) { g.fillStyle = mixC(BG, BG, 0, 0.12); g.fillRect(Math.random() * S, Math.random() * S, 2 + Math.random() * 3, 2); }
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(9, 9); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }

  // Rounded arch — radius .5× width gives a semicircle, larger makes the top pointed. The door in the original screen has a semicircle top (total height ≈ width × 1.8)
  const arch = (shape, w, h, r = 0.5 * w) => {
    const a = Math.acos((r - w / 2) / r);
    shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, h);
    shape.absarc(w / 2 - r, h, r, 0, a, false);
    shape.absarc(r - w / 2, h, r, Math.PI - a, Math.PI, false);
    shape.lineTo(-w / 2, 0);
    return shape;
  };

  const W = 2600, G = -1000, PW = 1060, PH = 1380, FRAME = 56, CAMZ = 2150, CAMY = 330, LOOKY = -330;
  const small = innerWidth < 760;
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  stage.append(renderer.domElement);
  const scene = new T.Scene();
  const fogColor = toColor(BG.map((v) => v * 0.25));
  scene.background = fogColor;
  scene.fog = new T.Fog(fogColor, (W + CAMZ) * 1.15, (W + CAMZ) * 2.6);
  const camera = new T.PerspectiveCamera(small ? 58 : 40, 1, 40, 9000);
  camera.rotation.order = "YXZ";
  const rig = new T.Group();
  scene.add(rig);
  rig.add(camera);
  camera.position.set(0, CAMY, CAMZ);
  camera.lookAt(0, LOOKY, -W);

  scene.add(new T.AmbientLight(toColor(COLD).multiplyScalar(0.35), 0.5));
  scene.add(new T.HemisphereLight(toColor(COLD), fogColor, 0.35));
  const sun = new T.DirectionalLight(toColor(COLD), 0.5);
  sun.position.set(0, 2600, 1400);
  scene.add(sun);
  const lamp = new T.PointLight(toColor(COLD), 2, W * 3.4, 1.7);
  lamp.position.set(0, G + 260, -1300);
  rig.add(lamp);

  const [bMap, bBump] = bricks(1);
  bMap.repeat.set(14, 4); bBump.repeat.set(14, 4);
  const wall = new T.Mesh(new T.CylinderGeometry(W, W, 5000, 128, 1, true), new T.MeshStandardMaterial({ map: bMap, bumpMap: bBump, bumpScale: 3, roughness: 0.92, side: T.BackSide }));
  wall.position.y = G + 2500;
  scene.add(wall);
  const floor = new T.Mesh(new T.CircleGeometry(W, 96), new T.MeshStandardMaterial({ map: flags(), roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = G;
  scene.add(floor);

  const smokeVert = `varying vec2 vP; varying float vDepth;
    void main(){ vP = position.xy; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`;
  const smokeFrag = `uniform float uTime, uSeed, uOn, uHover, uW, uH, uNear, uFar; uniform vec3 uColor, uFog; varying vec2 vP; varying float vDepth;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 17.3) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1.0, 0.0)), u.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
    void main(){
      vec2 uv = vec2(vP.x / uW + 0.5, vP.y / uH);
      float t = uTime;
      vec2 q = vec2(fbm(uv * vec2(2.0, 1.4) + vec2(0.0, -t * 0.06)), fbm(uv * vec2(2.0, 1.4) + vec2(4.1, 2.7) + vec2(t * 0.03, -t * 0.05)));
      float f = fbm(uv * vec2(2.4, 1.8) + q * 1.7 + vec2(0.0, -t * 0.1));
      float smoke = smoothstep(0.28, 0.82, f);
      vec3 col = uColor * (0.14 + 1.0 * smoke);
      col += uColor * pow(max(0.0, 1.0 - uv.y * 1.4), 2.5) * 0.55;
      col += uColor * pow(smoke, 5.0) * 0.6;
      col *= mix(0.55, 1.0, smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x));
      col *= mix(0.72, 1.0, uOn) * (1.0 + uHover * 0.24);
      col = mix(col, uFog, smoothstep(uNear, uFar, vDepth));
      gl_FragColor = vec4(col, 1.0);
    }`;
  const glowFrag = `uniform vec3 uColor; uniform float uOn; varying vec2 vUv;
    void main(){ vec2 p = (vUv - vec2(0.5, 0.82)) * vec2(1.0, 1.9); float a = pow(max(0.0, 1.0 - length(p) * 1.6), 2.2) * mix(0.35, 0.6, uOn); gl_FragColor = vec4(uColor * a, a); }`;
  const stone = new T.MeshStandardMaterial({ color: toColor(COLD).multiplyScalar(0.22), roughness: 0.8, metalness: 0.1 });
  const frameGeo = (() => {
    const outer = arch(new T.Shape(), PW + FRAME * 2, PH, 0.5 * PW + FRAME);
    outer.holes.push(arch(new T.Path(), PW, PH));
    return new T.ExtrudeGeometry(outer, { depth: 70, bevelEnabled: true, bevelThickness: 10, bevelSize: 10, bevelSegments: 2, curveSegments: 24 });
  })();
  const innerGeo = new T.ShapeGeometry(arch(new T.Shape(), PW, PH), 24);
  const archH = PH + PW / 2;
  const portals = SERVICES.map((sv, i) => {
    const th = (i / N) * Math.PI * 2;
    const grp = new T.Group();
    grp.position.set(-Math.sin(th) * (W - 30), G, -Math.cos(th) * (W - 30));
    grp.lookAt(0, G, 0);
    const color = toColor(portalRGB[i]);
    const u = { uTime: { value: 0 }, uSeed: { value: i * 3.1 }, uOn: { value: 0 }, uHover: { value: 0 }, uW: { value: PW }, uH: { value: archH }, uColor: { value: color }, uFog: { value: fogColor }, uNear: { value: scene.fog.near }, uFar: { value: scene.fog.far } };
    const smoke = new T.Mesh(innerGeo, new T.ShaderMaterial({ uniforms: u, vertexShader: smokeVert, fragmentShader: smokeFrag }));
    smoke.position.z = 20;
    const frame = new T.Mesh(frameGeo, stone);
    const glow = new T.Mesh(new T.PlaneGeometry(1700, 1100), new T.ShaderMaterial({ uniforms: { uColor: { value: color }, uOn: u.uOn }, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: glowFrag, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 3, 520);
    const light = new T.PointLight(color, 0, 2200, 1.4);
    light.position.set(0, 700, 420);
    grp.add(frame, smoke, glow, light);
    scene.add(grp);
    return { grp, u, light, smoke };
  });

  // Current position L, target z — wheel, push, keys and ticks move z by whole cells
  let L = 0, z = 0, acc = 0, rigY = 0, last = 0, raf = 0;
  const step = () => (Math.PI * 2) / N;
  const idx = (v) => ((Math.round(v) % N) + N) % N;
  // Services that have an About page (the first two) are links — they navigate if centered, otherwise they spin to that door. The rest are buttons (original timeline)
  const items = SERVICES.map((sv, i) => {
    const b = document.createElement(i < 2 ? "a" : "button");
    if (i < 2) b.href = "works.html"; else b.type = "button";
    b.className = "cs-tl__item";
    b.innerHTML = `<span class="cs-tl__dot"></span><span class="cs-tl__name">${sv.name}</span>`;
    b.addEventListener("click", (e) => {
      if (i < 2 && idx(z) === i && Math.abs(z - L) <= 0.03) return;
      e.preventDefault();
      e.stopPropagation();
      const t = Math.round(z);
      let d = ((i - t) % N + N) % N;
      if (d > N / 2) d -= N;
      z = t + d;
      seen();
    });
    tl.append(b);
    return b;
  });
  const line = tl.querySelector(".cs-tl__line");
  const placeTimeline = () => {
    items.forEach((b, i) => {
      let t = ((i - L) % N + N) % N;
      if (t > N / 2) t -= N;
      const o = Math.max(0, Math.min(1, 1.15 - Math.abs(t) / 3.2));
      b.style.left = `calc(50% + ${t.toFixed(3)} * var(--tl-step))`;
      b.style.opacity = o.toFixed(3);
      b.style.zIndex = Math.abs(t) < 0.5 ? 4 : 2;
      b.style.pointerEvents = o < 0.15 ? "none" : "auto";
      b.classList.toggle("is-active", i === idx(L));
    });
    line.style.backgroundPosition = `calc(50vw - (var(--tl-step) / 2) - (${L.toFixed(3)} * var(--tl-step))) center`;
  };
  // The moment turning starts, the label of the departing door drops out and the label of the arriving door rises together (original stagger 33ms)
  const setLabel = () => {
    const i = idx(z);
    labels.forEach((el, k) => el.classList.toggle("is-moving", k !== i));
  };

  const size = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  size();
  addEventListener("resize", size);

  let hovering = false;
  const ray = new T.Raycaster(), ndc = new T.Vector2(-9, -9);
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(Math.max(0.001, (now - (last || now)) / 1000), 0.05);
    last = now;
    if (reduce) L = z; else { L += (z - L) * (1 - Math.exp(-dt / 0.13)); if (Math.abs(z - L) < 8e-4) L = z; }
    const want = L * step();
    rigY += reduce ? want - rigY : (want - rigY) * (1 - Math.exp(-dt / 0.03));
    rig.rotation.y = rigY;
    const cur = idx(L), settled = Math.abs(L - Math.round(L)) < 0.03;
    ray.setFromCamera(ndc, camera);
    hovering = settled && ray.intersectObject(portals[cur].smoke).length > 0;
    root.style.cursor = hovering ? "pointer" : "";
    portals.forEach((p, i) => {
      p.u.uTime.value = now / 1000;
      const on = i === cur ? 1 : 0;
      p.u.uOn.value += (on - p.u.uOn.value) * Math.min(1, dt * 4);
      p.u.uHover.value += ((i === cur && hovering ? 1 : 0) - p.u.uHover.value) * Math.min(1, dt * 8);
      p.light.intensity = (0.08 + p.u.uOn.value * 0.22) * 1e5;
    });
    setLabel();
    placeTimeline();
    renderer.render(scene, camera);
  };
  renderer.compile(scene, camera);
  raf = requestAnimationFrame(frame);

  const hintKey = "cs-crypt-hint";
  // Once spinning starts, the guide drops out right away (the original removes it with v-if)
  const seen = () => { sessionStorage.setItem(hintKey, "1"); hint.classList.remove("is-shown"); hint.hidden = true; };
  // Once the section title card clears (in the original the Services section attaches then), the 3D scene floats up after .6s over 1.4s, and the guide text follows 5.6s later for 5.2s (original ServicesPage)
  document.addEventListener("cs:in", () => {
    root.focus({ preventScroll: true });
    stage.classList.add("is-on");
    if (sessionStorage.getItem(hintKey)) return;
    setTimeout(() => { if (!sessionStorage.getItem(hintKey)) hint.classList.add("is-shown"); }, 5600);
    setTimeout(() => hint.classList.remove("is-shown"), 10800);
  });

  root.addEventListener("wheel", (e) => {
    let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : e.deltaY;
    if (e.deltaMode === 1) d *= 40; else if (e.deltaMode === 2) d *= innerHeight;
    acc += d;
    while (Math.abs(acc) >= 100) { const s = Math.sign(acc); z += s; acc -= s * 100; }
    seen();
  }, { passive: true });
  let down = null;
  root.addEventListener("pointerdown", (e) => { down = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
  root.addEventListener("pointerup", (e) => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    down = null;
    if (Math.abs(dx) < 44 || Math.abs(dx) <= Math.abs(dy) * 1.15) {
      if (hovering && Math.hypot(dx, dy) < 6) cs.go("works.html", "leave");
      return;
    }
    z = Math.round(z) + (dx < 0 ? 1 : -1);
    seen();
  });
  root.addEventListener("pointercancel", () => { down = null; });
  addEventListener("pointermove", (e) => { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); z = Math.round(z) + 1; seen(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); z = Math.round(z) - 1; seen(); }
    else if (e.key === "Enter" && Math.abs(z - L) <= 0.03) cs.go("works.html", "leave");
  });
})();
