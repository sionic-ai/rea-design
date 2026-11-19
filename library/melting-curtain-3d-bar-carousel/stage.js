// 3D stage for the Hero and collection page — loader → logo curtain → flowing chocolate curtain (shader) → bag drop → box burst → one bar spins in and unfolds into a carousel.
// Carousel values are exactly as in the original: gap .11244+.13 (phone .15), .25 back per slot (phone .1), wheel deltaY×.002, drag ×.5, follow SmoothDamp .15, speed .2 (phone .14),
// Bar tilt −80° (+10° as horizontal bars), darkening up to a .5 share the farther from center, a hovered bar rises .01 and turns −10° back to level, and the whole stage tilts ±.9° with the mouse.
(() => {
  const THREE = window.THREE;
  const FX = window.FX || {};
  const body = document.body;
  const stage = document.querySelector(".fx-stage");
  if (!THREE || !stage) return;
  const canvas = stage.querySelector("canvas");
  const tilt = stage.querySelector(".fx-stage__tilt");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth < 768;
  // The original skips the intro on return within the site once seen (markIntroDone) — kept the same for this visit
  const skip = reduce || body.dataset.intro === "skip" || sessionStorage.getItem("fx-intro-done") === "1";

  /* ───── Reading color from the skin — paint color-mix · oklch for real and convert to sRGB ───── */
  const probeEl = document.createElement("i");
  probeEl.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.appendChild(probeEl);
  const pctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    probeEl.style.color = `var(${name})`;
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = getComputedStyle(probeEl).color;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
  };
  const C = {};
  ["--site-choco", "--site-choco-lit", "--site-choco-deep", "--site-cream", "--site-sand", "--site-gold", "--site-dark", "--site-brown", "--kf-accent-soft", "--kf-accent-text", "--site-wrap-1", "--site-wrap-2", "--site-wrap-3", "--site-wrap-4", "--site-wrap-5"].forEach((n) => (C[n] = rgb(n)));
  probeEl.remove();
  const col = (n) => new THREE.Color().setStyle(C[n], THREE.SRGBColorSpace);

  /* ───── Patterns — color blobs, circles, and dripping logo circles drawn by hand in place of the original packaging art ───── */
  const rand = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const wraps = ["--site-wrap-1", "--site-wrap-2", "--site-wrap-3", "--site-wrap-4", "--site-wrap-5", "--kf-accent-soft"];
  const tex = (w, h, draw) => {
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const logoBlob = (g, x, y, r, R) => {
    g.fillStyle = C["--site-choco"];
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 5; i++) {
      const dx = x - r * 0.7 + (i / 4) * r * 1.4, len = r * (0.35 + R() * 0.7), w = r * (0.08 + R() * 0.06);
      g.beginPath(); g.moveTo(dx - w, y + r * 0.6); g.lineTo(dx - w, y + r * 0.7 + len); g.arc(dx, y + r * 0.7 + len, w, Math.PI, 0, true); g.lineTo(dx + w, y + r * 0.6); g.fill();
    }
    g.strokeStyle = C["--site-gold"]; g.lineWidth = r * 0.06;
    g.beginPath(); g.arc(x, y - r * 0.05, r * 0.48, Math.PI * 0.15, Math.PI * 1.7); g.stroke();
  };
  const barFront = (seed) => tex(1024, 500, (g, w, h) => {
    const R = rand(seed * 977 + 13);
    g.fillStyle = C["--site-cream"]; g.fillRect(0, 0, w, h);
    const pal = wraps.map((n, i) => wraps[(i + seed) % wraps.length]);
    const cols = [0, 0.27, 0.5, 0.72, 1];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = C[pal[i]];
      const x = cols[i] * w, ww = (cols[i + 1] - cols[i]) * w;
      if (i % 2 === 0) g.fillRect(x, 0, ww, h * (0.3 + R() * 0.15));
      else g.fillRect(x, h * (0.55 + R() * 0.15), ww, h);
    }
    g.fillStyle = C[pal[4]]; g.beginPath(); g.arc(w * (0.12 + R() * 0.1), h * 0.98, h * 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = C[pal[5]]; g.beginPath(); g.arc(w * (0.78 + R() * 0.12), h * 0.08, h * 0.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = C["--kf-accent-soft"]; g.globalAlpha = 0.5; g.lineWidth = 3;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(w * (0.1 + i * 0.4), h * 0.5, 40, 70, 0, 0, Math.PI * 2); g.stroke(); }
    g.globalAlpha = 1;
    logoBlob(g, w * 0.5, h * 0.36, h * 0.22, R);
    g.fillStyle = C[pal[1]];
    g.beginPath(); g.moveTo(w * 0.66, h * 0.62); g.quadraticCurveTo(w * 0.78, h * 0.5, w * 0.86, h * 0.6); g.lineTo(w * 0.8, h * 0.74); g.closePath(); g.fill();
  });
  const barBack = (seed) => tex(1024, 500, (g, w, h) => {
    const pal = wraps.map((n, i) => wraps[(i + seed + 2) % wraps.length]);
    g.fillStyle = C["--site-cream"]; g.fillRect(0, 0, w, h);
    g.fillStyle = C[pal[0]]; g.fillRect(0, h * 0.22, w * 0.42, h * 0.78);
    g.fillStyle = C[pal[1]]; g.fillRect(w * 0.42, h * 0.22, w * 0.58, h * 0.78);
    g.fillStyle = C["--site-brown"]; g.font = `800 ${h * 0.1}px ${getComputedStyle(body).fontFamily}`;
    g.textAlign = "center"; g.fillText("A Short Line Here", w * 0.5, h * 0.14);
    g.fillStyle = C["--site-cream"];
    for (let i = 0; i < 5; i++) g.fillRect(w * 0.5, h * (0.34 + i * 0.07), w * (0.2 + (i % 3) * 0.06), h * 0.025);
    g.fillRect(w * 0.12, h * 0.7, w * 0.16, h * 0.2);
    g.fillStyle = C["--site-dark"];
    for (let i = 0; i < 22; i++) g.fillRect(w * 0.13 + i * (w * 0.0065), h * 0.72, i % 3 ? 3 : 6, h * 0.12);
  });
  const pattern = (seed, base) => tex(512, 640, (g, w, h) => {
    const R = rand(seed * 131 + 7);
    g.fillStyle = C[base]; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = C[wraps[(i + seed) % wraps.length]];
      const x = R() * w, y = R() * h, s = 40 + R() * 120;
      g.beginPath();
      if (i % 3 === 0) g.arc(x, y, s / 2, 0, Math.PI * 2);
      else g.roundRect(x - s / 2, y - s / 3, s, s * 0.66, s * 0.3);
      g.fill();
    }
    g.strokeStyle = C["--site-cream"]; g.lineWidth = 5;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(R() * w, R() * h, 22 + R() * 18, 0, Math.PI * 2); g.stroke(); }
    logoBlob(g, w * 0.55, h * 0.45, w * 0.17, R);
  });

  /* ───── Stage ───── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35.115, 1, 0.01, 20);
  camera.position.set(0, 0.1195, 0.4878);
  camera.rotation.x = -0.0873;

  scene.add(new THREE.HemisphereLight(col("--site-cream"), col("--site-brown"), 1.5));
  const key = new THREE.DirectionalLight(col("--site-cream"), 2.4);
  key.position.set(-0.35, 0.9, 0.7);
  key.target.position.set(0, 0.05, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.7, right: 0.7, top: 0.7, bottom: -0.7, near: 0.1, far: 3 });
  key.shadow.radius = 8;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(col("--kf-accent-soft"), 0.6);
  rim.position.set(0.6, 0.3, -0.4);
  scene.add(rim);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.32 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* Bar — width .23 × height .112 × thickness .022, foil at both ends */
  /* Product English name column — the last one is another flavor of the first product, so the name is the same and only the line below differs */
  const NAMES = ["Product Name 01", "Bar Name Number 02", "A Longer Product Name 03", "Bar Name 04", "Product Name 05", "Product Name Here 06", "Bar Name Long 07", "Bar Name 08", "Product 09", "Product Name 01"];
  const SUBS = { 0: "Signature Product Line", 9: "Flavor Variant" };
  const barGeo = new THREE.BoxGeometry(0.212, 0.112, 0.022);
  const foilGeo = new THREE.BoxGeometry(0.01, 0.116, 0.026);
  const bars = NAMES.map((n, i) => {
    const g = new THREE.Group();
    const side = new THREE.MeshStandardMaterial({ color: col("--site-cream"), roughness: 0.7 });
    const front = new THREE.MeshStandardMaterial({ map: barFront(i), roughness: 0.65 });
    const back = new THREE.MeshStandardMaterial({ map: barBack(i), roughness: 0.65 });
    const mesh = new THREE.Mesh(barGeo, [side, side, side, side, front, back]);
    mesh.castShadow = true;
    const foil = new THREE.MeshStandardMaterial({ color: col(wraps[(i + 5) % wraps.length]), metalness: 0.85, roughness: 0.28 });
    const fl = new THREE.Mesh(foilGeo, foil), fr = fl.clone();
    fl.position.x = -0.111; fr.position.x = 0.111;
    fl.castShadow = fr.castShadow = true;
    g.add(mesh, fl, fr);
    [side, front, back, foil].forEach((mt) => (mt.userData.base = mt.color.clone()));
    g.userData = { mats: [side, front, back, foil], lift: 0, turn: 0, index: i };
    mesh.userData.bar = i; fl.userData.bar = i; fr.userData.bar = i;
    g.visible = false;
    scene.add(g);
    return g;
  });

  /* Bag — patterned paper box + string loop */
  const bag = new THREE.Group();
  const bagMat = new THREE.MeshStandardMaterial({ map: pattern(3, "--kf-accent-soft"), roughness: 0.8 });
  const bagSide = new THREE.MeshStandardMaterial({ map: pattern(5, "--kf-accent-soft"), roughness: 0.8 });
  const bagBox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.235, 0.105), [bagSide, bagSide, bagSide, bagSide, bagMat, bagMat]);
  bagBox.position.y = 0.1175;
  bagBox.castShadow = true;
  const rope = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.003, 8, 32, Math.PI), new THREE.MeshStandardMaterial({ color: col("--kf-accent-text"), roughness: 0.6 }));
  rope.position.set(0, 0.235, 0.018);
  bag.add(bagBox, rope);
  bag.position.set(0, 0, -0.017);
  bag.visible = false;
  scene.add(bag);

  /* Small boxes — burst out of the bag, pass by the camera and scatter */
  const boxGeo = new THREE.BoxGeometry(0.05, 0.072, 0.016);
  const boxes = Array.from({ length: 18 }, (_, i) => {
    const f = new THREE.MeshStandardMaterial({ map: pattern(10 + i, i % 2 ? "--site-cream" : wraps[i % wraps.length]), roughness: 0.7 });
    const s = new THREE.MeshStandardMaterial({ color: col(wraps[(i + 2) % wraps.length]), roughness: 0.7 });
    const m = new THREE.Mesh(boxGeo, [s, s, s, s, f, f]);
    m.castShadow = true;
    m.visible = false;
    scene.add(m);
    return m;
  });

  /* ───── Dripping chocolate curtain: the original is a chroma key video (5.5s clock). Our shader draws it on the same clock ───── */
  const overlay = new THREE.Scene();
  const ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const titleCanvas = document.createElement("canvas");
  const titleTex = new THREE.CanvasTexture(titleCanvas);
  const handCanvas = document.createElement("canvas");
  const handTex = new THREE.CanvasTexture(handCanvas);
  const drawTitle = (w, h) => {
    const W = (titleCanvas.width = handCanvas.width = Math.round(w / 2));
    const H = (titleCanvas.height = handCanvas.height = Math.round(h / 2));
    const fs = isMobile() ? W * 0.16 : Math.min(W * 0.07, H * 0.1);
    const disp = getComputedStyle(body).getPropertyValue("--kf-font-display").trim() || "sans-serif";
    const hand = getComputedStyle(body).getPropertyValue("--kf-font-hand").trim() || disp;
    const g = titleCanvas.getContext("2d");
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `800 ${fs}px ${disp}`;
    const masks = ["rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)"]; /* Not skin: mask holding one title line per channel */
    ["A big title", "set across", "three lines"].forEach((t, i) => { g.fillStyle = masks[i]; g.fillText(t, W / 2, H * 0.45 + (i - 1) * fs * 0.98); });
    g.globalCompositeOperation = "source-over";
    const k = handCanvas.getContext("2d");
    k.clearRect(0, 0, W, H);
    k.font = `400 ${fs * 0.8}px ${hand}`; k.textAlign = "center"; k.textBaseline = "middle";
    k.fillStyle = masks[0];
    k.fillText("The", W / 2 - fs * 0.9, H * 0.45 - fs * 1.55);
    titleTex.needsUpdate = handTex.needsUpdate = true;
  };
  const drip = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      uniforms: {
        uT: { value: -1 }, uRes: { value: new THREE.Vector2(1, 1) },
        uDark: { value: col("--site-choco-deep") }, uLit: { value: col("--site-choco-lit") },
        uGold: { value: col("--site-gold") }, uGoldDeep: { value: col("--kf-accent-text") },
        uTitle: { value: titleTex }, uHand: { value: handTex }, uLines: { value: new THREE.Vector4(0, 0, 0, 0) },
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: `
        precision highp float;
        uniform float uT; uniform vec2 uRes; uniform vec3 uDark, uLit, uGold, uGoldDeep;
        uniform sampler2D uTitle, uHand; uniform vec4 uLines; varying vec2 vUv;
        #define N 15
        float hash(float n){ return fract(sin(n * 127.1) * 43758.5453); }
        float ease(float a){ a = clamp(a, 0., 1.); return a < .5 ? 2. * a * a : 1. - pow(-2. * a + 2., 2.) / 2.; }
        // Curtain lower-edge height (0 floor · 1 ceiling) — lifts with power2.inOut over 2.4s starting at 1.5s, and the last 14% goes higher still
        float baseAt(float t){ return mix(.085 + .008 * sin(t * 1.7), 1.22, ease((t - 1.3) / 2.1)) + .387 * pow(clamp((t / 5.5 - .86) / .14, 0., 1.), 3.); }
        float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.) / k; return min(a, b) - h * h * k * .25; }
        float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }
        void main(){
          float asp = uRes.x / uRes.y;
          vec2 p = vec2(vUv.x * asp, vUv.y);
          float b = baseAt(uT);
          float d = b - p.y;
          // For the first .7s it covers in from the left
          float sweep = (1. - pow(1. - clamp(uT / .7, 0., 1.), 3.)) * (asp + .3) - .15 + .05 * sin(p.y * 9.);
          d = max(d, p.x - sweep);
          for (int i = 0; i < N; i++) {
            float fi = float(i);
            float x = (fi + .5) / float(N) * asp + (hash(fi) - .5) * asp / float(N) * .8;
            float r = mix(.016, .04, hash(fi + 3.1));
            float lag = mix(.16, .46, hash(fi + 7.7));
            float grow = smoothstep(0., 1., uT - .4 - hash(fi + 5.) * .7);
            float tip = mix(b, min(baseAt(uT - lag), b) - mix(.0, .08, hash(fi + 11.3)) - r, grow);
            float k = smoothstep(b + .05, tip, p.y);
            float dc = seg(p, vec2(x, b + .05), vec2(x, tip)) - r * (.45 + .7 * pow(k, 1.6));
            dc = max(dc, p.x - sweep - r);
            d = smin(d, dc, .05);
          }
          float px = 1.25 / uRes.y;
          float alpha = smoothstep(px, -px, d);
          if (alpha <= 0.) discard;
          vec2 g = vec2(dFdx(d), dFdy(d)) * uRes.y;
          float bead = 1. - smoothstep(0., .05, -d);
          vec3 n = normalize(vec3(-g * bead * 1.6, 1.));
          float fold = .5 + .5 * sin(p.x * 23. + sin(p.x * 6.3 + uT * .5) * 2.2);
          fold = mix(fold, .5 + .5 * sin(p.x * 57. + 1.3), .3);
          vec3 c = mix(uDark, uLit, .2 + .42 * fold * (1. - bead * .5));
          vec3 L = normalize(vec3(-.45, .55, .7));
          float diff = clamp(dot(n, L), 0., 1.);
          float spec = pow(clamp(dot(reflect(-L, n), vec3(0., 0., 1.)), 0., 1.), 24.);
          c = c * (.62 + .55 * diff) + spec * .65 * uLit + bead * .1 * uLit;
          float lift = b - baseAt(0.);
          vec2 tu = vec2(vUv.x, vUv.y - lift);
          float m = (dot(texture2D(uTitle, tu).rgb, uLines.xyz) + texture2D(uHand, tu).r * uLines.w) * (1. - bead);
          vec3 gold = mix(uGoldDeep, uGold, .55 + .45 * sin((tu.y * 40.) + tu.x * 6.));
          c = mix(c, gold, clamp(m, 0., 1.));
          gl_FragColor = vec4(c, alpha);
        }`,
    }),
  );
  drip.frustumCulled = false;
  drip.visible = false;
  overlay.add(drip);

  /* ───── Size ───── */
  const resize = () => {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // In portrait, zoom in so the bar is 3/4 of the screen width
    camera.zoom = Math.min(1, camera.aspect / 0.95);
    camera.updateProjectionMatrix();
    drip.material.uniforms.uRes.value.set(w, h);
    drawTitle(w, h);
    need = true;
  };

  /* ───── Carousel state ───── */
  const S = { F: 0, U: 0, N: 0, H: 0, es: 1, vis: 0, hover: null, drag: false, active: true, intro: !skip };
  const stepX = () => 0.11244 + (isMobile() ? 0.15 : 0.13);
  const depth = () => (isMobile() ? 0.1 : 0.25);
  const K = 0.07715, Z0 = THREE.MathUtils.degToRad(10), HOVER_TURN = THREE.MathUtils.degToRad(-10);
  let need = true, centered = -1, solo = null;

  const damp = (o, k, target, smooth, dt, eps = 1e-3) => {
    const vk = "_v" + k;
    if (o[vk] === undefined) o[vk] = 0;
    if (Math.abs(o[k] - target) <= eps) { o[k] = target; return false; }
    const omega = 2 / Math.max(1e-4, smooth), x = omega * dt, exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const orig = target, change = o[k] - target;
    const temp = (o[vk] + omega * change) * dt;
    o[vk] = (o[vk] - omega * temp) * exp;
    let out = o[k] - change + (change + temp) * exp;
    if (orig - o[k] > 0 === out > orig) { out = orig; o[vk] = (out - orig) / dt; }
    o[k] = out;
    return true;
  };
  const snap = () => { const f = stepX(); S.F = Math.round(S.F / f) * f; need = true; };
  let snapT = 0;
  const canMove = () => S.active && !S.intro;

  addEventListener("wheel", (e) => {
    if (!canMove() || S.drag) return;
    S.F -= 0.002 * e.deltaY;
    S.N = THREE.MathUtils.clamp(-5e-4 * e.deltaY, -0.1, 0.1);
    need = true;
    clearTimeout(snapT);
    snapT = setTimeout(snap, 200);
  }, { passive: true });
  addEventListener("keydown", (e) => {
    if (!canMove()) return;
    const f = stepX(), m = isMobile();
    if (e.key === "ArrowRight" || (m && e.key === "ArrowDown")) { e.preventDefault(); S.F -= f; snap(); }
    else if (e.key === "ArrowLeft" || (m && e.key === "ArrowUp")) { e.preventDefault(); S.F += f; snap(); }
  });

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const pick = (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(bars.filter((b) => b.visible), true)[0];
    return hit ? hit.object.userData.bar : null;
  };
  let last = null, downAt = 0, downP = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (!canMove()) return;
    canvas.setPointerCapture(e.pointerId);
    S.drag = true; stage.classList.add("is-drag");
    pick(e);
    last = { x: ptr.x, y: ptr.y };
    downAt = performance.now(); downP = { ...last };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!canMove()) return;
    const h = pick(e);
    if (S.drag) {
      const t = isMobile() ? ptr.y - last.y : ptr.x - last.x;
      S.N = THREE.MathUtils.clamp(2 * t, -0.1, 0.1);
      S.F += 0.5 * t;
      last = { x: ptr.x, y: ptr.y };
      S.hover = null;
    } else if (e.pointerType !== "touch") S.hover = h;
    stage.classList.toggle("is-hover", S.hover !== null);
    need = true;
  });
  const up = (e) => {
    if (!S.drag) return;
    S.drag = false; stage.classList.remove("is-drag");
    if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    const quick = performance.now() - downAt < 300 && Math.hypot(ptr.x - downP.x, ptr.y - downP.y) < 0.03;
    const hit = quick ? pick(e) : null;
    if (hit !== null) {
      const off = offsetOf(hit);
      if (Math.abs(off) > 0.01) S.F -= off;
    }
    snap();
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("pointerleave", () => { if (!S.drag) { S.hover = null; stage.classList.remove("is-hover"); need = true; } });

  const offsetOf = (t) => {
    const f = stepX(), g = bars.length * f;
    let i = t * f + S.U;
    i = (((i + g / 2) % g) + g) % g - g / 2;
    return i;
  };

  /* ───── Name band: on desktop, four sets in embla (loop·center·no drag), on phone, vertical at 44px each ───── */
  const names = document.querySelector(".fx-names");
  const track = names?.querySelector(".fx-names__track");
  const COPIES = 4;
  let embla = null, nameEls = [];
  const buildNames = () => {
    if (!track) return;
    track.innerHTML = "";
    const n = NAMES.length, copies = isMobile() ? 1 : COPIES;
    for (let c = 0; c < copies; c++) NAMES.forEach((t, i) => {
      const d = document.createElement("div");
      d.className = "fx-name";
      d.innerHTML = `<b>${t}</b>${SUBS[i] ? `<small>${SUBS[i]}</small>` : ""}`;
      track.appendChild(d);
    });
    nameEls = [...track.children];
    embla?.destroy(); embla = null;
    if (!isMobile() && window.EmblaCarousel) embla = EmblaCarousel(names.querySelector(".fx-names__view"), { loop: true, watchDrag: false, align: "center", containScroll: false });
    centered = -1;
    showName(Math.max(0, centerIndex()));
  };
  const showName = (t) => {
    const n = NAMES.length;
    if (isMobile()) {
      nameEls.forEach((el, r) => {
        let i = r - t;
        if (i > n / 2) i -= n;
        if (i < -n / 2) i += n;
        el.style.transform = `translate(-50%, ${-(44 * i)}px)`;
        el.classList.toggle("is-on", r === t);
      });
      return;
    }
    if (!embla) return;
    const sel = embla.selectedScrollSnap();
    let a = t - (sel % n);
    if (a > n / 2) a -= n;
    if (a < -n / 2) a += n;
    const o = sel + a;
    embla.scrollTo(o);
    const u = n * COPIES, c = ((o % u) + u) % u;
    nameEls.forEach((el, r) => el.classList.toggle("is-on", r === c));
  };
  const centerIndex = () => {
    let best = 0, bd = Infinity;
    bars.forEach((b, t) => { const d = Math.abs(offsetOf(t)); if (d < bd) { bd = d; best = t; } });
    return best;
  };

  /* ───── Frame ───── */
  const black = new THREE.Color(0);
  const lay = (dt) => {
    const m = isMobile(), f = stepX(), n = bars.length, g = n * f, W = depth();
    let moving = damp(S, "vis", S.intro && !solo ? 0 : 1, 0.1, dt);
    moving = damp(S, "U", S.F, 0.15, dt, 1e-8) || moving;
    moving = damp(S, "H", S.N, m ? 0.14 : 0.2, dt, 1e-8) || moving;
    S.N += (0 - S.N) * (1 - Math.exp(-10 * dt));
    if (Math.abs(S.N) < 1e-5) S.N = 0;
    bars.forEach((b, t) => {
      const u = b.userData;
      if (solo && solo.index === t) return;
      let i = t * f + S.U;
      i = (((i + g / 2) % g) + g) % g - g / 2;
      const hov = !S.drag && S.hover === t;
      moving = damp(u, "lift", hov ? 0.01 : 0, 0.1, dt, 1e-8) || moving;
      moving = damp(u, "turn", hov ? HOVER_TURN : 0, 0.1, dt, 1e-8) || moving;
      const Mz = S.H * 4, Rl = Math.abs(0.1 * Mz), E = Math.abs(i / f) * W;
      const D = Math.abs(i) < 0.01 ? 0 : 5 * i * S.es;
      if (m) b.position.set(0, K + i + D, -0.01742 - E + u.lift);
      else b.position.set(i + D, K + Rl + u.lift, -0.01742 - E);
      b.rotation.set(0, S.H * 8 - 8 * D, Z0 + Mz + u.turn);
      const F = Math.abs(i), N = g / 2, O = 0.9 * N;
      b.scale.setScalar(F >= O ? THREE.MathUtils.lerp(1, 0.001, THREE.MathUtils.clamp((F - O) / (N - O), 0, 1)) : 1);
      const k = THREE.MathUtils.clamp((F / N) * 0.5, 0, 1) * S.vis;
      u.mats.forEach((mt) => mt.color.copy(mt.userData.base).lerp(black, k));
      b.visible = S.vis > 0.001 || (!!solo && solo.index === t);
    });
    const c = centerIndex();
    if (c !== centered && !S.intro) { centered = c; showName(c); }
    return moving;
  };

  let prev = performance.now(), dripStart = null;
  const frame = () => {
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
    prev = now;
    const moving = lay(dt);
    if (dripStart !== null) {
      const t = (now - dripStart) / 1000;
      drip.material.uniforms.uT.value = t;
      if (t > 5.6) { drip.visible = false; dripStart = null; }
      need = true;
    }
    if (moving || need || busy > 0) {
      renderer.autoClear = true;
      renderer.render(scene, camera);
      if (drip.visible) { renderer.autoClear = false; renderer.render(overlay, ocam); }
      need = false;
    }
    requestAnimationFrame(frame);
  };
  let busy = 0;
  const hold = (tl) => { busy++; tl.eventCallback("onComplete", () => busy--); return tl; };

  /* Whole stage tilts ±.9° with the mouse — follows 1 − .92^frame of the remaining distance each frame */
  if (!reduce) {
    const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    addEventListener("mousemove", (e) => { aim.x = (e.clientX / innerWidth - 0.5) * 2; aim.y = (e.clientY / innerHeight - 0.5) * 2; });
    document.addEventListener("mouseleave", () => { aim.x = 0; aim.y = 0; });
    gsap.ticker.add(() => {
      if (isMobile()) { if (cur.x || cur.y) { cur.x = cur.y = 0; tilt.style.transform = ""; } return; }
      const k = 1 - Math.pow(0.92, gsap.ticker.deltaRatio());
      cur.x += (aim.x - cur.x) * k; cur.y += (aim.y - cur.y) * k;
      tilt.style.transform = `perspective(900px) rotateX(${-(0.9 * cur.y)}deg) rotateY(${0.9 * cur.x}deg) scale(1.025)`;
    });
  }

  /* ───── Contents ───── */
  const loader = document.querySelector(".fx-loader");
  const pct = loader?.querySelector(".fx-loader__pct");
  const cover = document.querySelector(".fx-cover");
  const sheet = cover?.querySelector(".fx-cover__sheet");
  const logo = cover?.querySelector(".fx-cover__logo");

  const startCarousel = (delay = 0.5) => {
    S.intro = false;
    sessionStorage.setItem("fx-intro-done", "1");
    names?.classList.add("is-on");
    document.querySelector(".fx-scrim")?.classList.add("is-on");
    centered = -1;
    hold(gsap.timeline().to(S, { es: 0, duration: 1, delay, ease: "power3.out", onUpdate: () => (need = true) }));
  };

  const bagSequence = (tl, at) => {
    bag.position.y = 0.55; bag.rotation.set(0.1, -0.35, 0.06);
    tl.set(bag, { visible: true }, at)
      .to(bag.position, { y: 0, duration: 0.45, ease: "power2.in" }, at)
      .to(bag.rotation, { x: 0, z: 0, y: -0.18, duration: 0.6, ease: "power2.out" }, at + 0.35)
      .fromTo(bag.scale, { x: 1, y: 1, z: 1 }, { keyframes: [{ x: 1.06, y: 0.9, z: 1.06, duration: 0.09 }, { x: 0.98, y: 1.04, z: 0.98, duration: 0.14 }, { x: 1, y: 1, z: 1, duration: 0.2 }] }, at + 0.45)
      .to(bag.rotation, { y: 0.12, duration: 1.4, ease: "sine.inOut" }, at + 1)
      .to(bag.position, { y: -0.2, duration: 0.6, ease: "power2.in" }, at + 2.05)
      .to(bag.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.6, ease: "power2.in" }, at + 2.05)
      .set(bag, { visible: false }, at + 2.7);
    const R = rand(41);
    boxes.forEach((b, i) => {
      const a = (i / boxes.length) * Math.PI * 2 + R() * 0.4;
      const r = 0.18 + R() * 0.24;
      const to = { x: Math.cos(a) * r * 1.45, y: 0.13 + Math.sin(a) * r * 0.62, z: 0.02 + R() * 0.3 };
      tl.set(b, { visible: true }, at + 2)
        .fromTo(b.position, { x: (R() - 0.5) * 0.08, y: 0.22, z: -0.017 }, { ...to, duration: 0.75, ease: "power2.out" }, at + 2 + i * 0.012)
        .fromTo(b.rotation, { x: 0, y: 0, z: 0 }, { x: (R() - 0.5) * 5, y: (R() - 0.5) * 6, z: (R() - 0.5) * 4, duration: 1.6, ease: "power1.out" }, at + 2)
        .fromTo(b.scale, { x: 0.2, y: 0.2, z: 0.2 }, { x: 1, y: 1, z: 1, duration: 0.35, ease: "power2.out" }, at + 2)
        .to(b.position, { x: to.x * 2.4, y: to.y + 0.18, z: to.z + 0.25, duration: 0.7, ease: "power2.in" }, at + 2.8 + R() * 0.15)
        .set(b, { visible: false }, at + 3.65);
    });
  };

  const soloBar = (tl, at) => {
    const b = bars[0];
    tl.call(() => { solo = { index: 0 }; b.visible = true; }, null, at)
      .fromTo(b.position, { x: 0.16, y: 0.2, z: -0.55 }, { x: 0, y: K, z: -0.01742, duration: 1.4, ease: "power2.inOut" }, at)
      .fromTo(b.rotation, { x: -0.5, y: Math.PI + 0.7, z: 0.9 }, { x: 0, y: 0, z: Z0, duration: 1.4, ease: "power2.inOut" }, at)
      .call(() => { solo = null; S.vis = 1; }, null, at + 1.42);
  };

  const run = () => {
    resize();
    if (skip) {
      S.vis = 1;
      loader?.remove(); cover?.classList.add("is-gone");
      FX.showHeader?.(true);
      if (reduce) { S.es = 0; S.intro = false; names?.classList.add("is-on"); document.querySelector(".fx-scrim")?.classList.add("is-on"); }
      else startCarousel(0.2);
      buildNames();
      setTimeout(() => FX.showCookie?.(), 1200);
      return;
    }
    buildNames();
    const tl = hold(gsap.timeline());
    const n = { v: 0 };
    const paint = () => pct && (pct.textContent = `${Math.round(n.v)}%`);
    // On phone the original shortens the loader (cover .8s) so the intro arrives about 1.9s early — a value tuned to the timetable capture (390).
    const T = isMobile() ? 1.1 : 3.0;
    tl.to(n, { v: 90, duration: Math.min(0.4, T * 0.3), ease: "none", onUpdate: paint }, 0)
      .to(n, { v: 99, duration: T * 0.82, ease: "none", onUpdate: paint }, T * 0.15)
      .to(n, { v: 100, duration: 0.05, onUpdate: paint }, T - 0.05);
    tl.call(() => loader?.classList.add("is-done"), null, T)
      .call(() => loader?.remove(), null, T + 1.3)
      .fromTo(logo, { opacity: 0, yPercent: 100 }, { opacity: 1, yPercent: 0, duration: 1, delay: 0.25, ease: "power2.out" }, T + 0.6)
      .to(logo, { opacity: 0, duration: 0.5, delay: 0.15 }, T + 1.85)
      .to(sheet, { yPercent: -150, duration: 0.5, ease: "none", delay: 0.5 }, T + 2.5)
      .call(() => cover?.classList.add("is-gone"), null, T + 3.6);
    const D = T + 1.8;
    tl.call(() => { drip.visible = true; dripStart = performance.now(); }, null, D);
    const lines = drip.material.uniforms.uLines.value;
    tl.to(lines, { x: 1, duration: 0.4, ease: "power1.out" }, D + 0.75)
      .to(lines, { y: 1, duration: 0.4, ease: "power1.out" }, D + 0.95)
      .to(lines, { z: 1, duration: 0.4, ease: "power1.out" }, D + 1.15)
      .to(lines, { w: 1, duration: 0.4, ease: "power1.out" }, D + 1.3)
      .call(() => FX.showHeader?.(true), null, D + 1.9);
    bagSequence(tl, D + 1.7);
    soloBar(tl, D + 4.1);
    tl.call(() => startCarousel(0.5), null, D + 5.6)
      .call(() => FX.showCookie?.(), null, D + 8.4);
  };

  new ResizeObserver(() => { const was = isMobile(); resize(); if (stage.dataset.m !== String(was)) { stage.dataset.m = String(was); if (track) buildNames(); } }).observe(stage);
  stage.dataset.m = String(isMobile());
  gsap.ticker.lagSmoothing(0);
  resize();
  drip.visible = true;
  renderer.compile(overlay, ocam);
  renderer.compile(scene, camera);
  drip.visible = false;
  document.fonts?.ready.then(() => resize());
  run();
  requestAnimationFrame(frame);
})();
