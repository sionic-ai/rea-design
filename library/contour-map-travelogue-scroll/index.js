(() => {
  const fd = window.fd, { clamp, reduce } = fd;
  const THREE = window.THREE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const intro = $("#intro"), pin = $(".fd-intro__pin"), ground = $(".fd-intro__ground"), wall = $(".fd-wall"), scrim = $(".fd-wall__scrim");
  const veils = $$(".fd-veil"), fogCv = $(".fd-fog"), mossCv = $(".fd-moss"), stmt = $(".fd-stmt"), words = $$(".fd-sw"), world = $(".fd-world");
  let fogU = null, mossU = null, bend = 0;

  if (reduce) {
    gsap.set([".fd-header"], { opacity: 1, pointerEvents: "auto" });
    if (world) world.style.opacity = "1";
  }

  // ── Fog: cloud masses (fbm threshold) drift slowly, cover the screen at 72~88% of the About section and clear at 94~100%. Half screen resolution, 30 frames per second ──
  const makeFog = () => {
    if (!THREE || !fogCv) return;
    const r = new THREE.WebGLRenderer({ canvas: fogCv, alpha: true, antialias: false, powerPreference: "low-power" });
    r.setClearColor(0, 0);
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    cam.position.z = 1;
    const ink = fd.color("--kf-ink");
    fogU = { uTime: { value: 0 }, uDissolve: { value: 0 }, uInk: { value: new THREE.Vector3(...ink) } };
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: fogU, transparent: true,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform float uTime, uDissolve; uniform vec3 uInk; varying vec2 vUv;
        float h(vec2 p){ p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 19.19); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n(p); p *= 2.0; a *= 0.5; } return s; }
        void main(){
          float dis = clamp(uDissolve, 0.0, 1.0);
          if (dis >= 0.92) { gl_FragColor = vec4(uInk, 1.0 - smoothstep(0.92, 1.0, dis)); return; }
          vec2 dir = normalize(vec2(1.0, 0.22));
          vec2 wuv = vUv * 1.2 + dir * uTime * 0.008;
          vec2 warp = vec2(fbm(wuv * 4.0), fbm(wuv * 4.0 + vec2(3.7, 1.9))) - 0.5;
          vec2 fuv = vUv * 2.1 + dir * uTime * 0.018 + warp * 0.24;
          float fogN = (fbm(fuv * 4.0) * 0.6 + fbm((fuv * 2.3 + 11.0) * 4.0) * 0.4) * 1.1 - 0.02;
          float bottom = smoothstep(0.55, 0.0, vUv.y);
          float edge = mix(0.72, 0.0, dis) - bottom * 0.46;
          float cloud = clamp(smoothstep(edge, edge + 0.28, fogN) + smoothstep(0.78, 0.92, dis), 0.0, 1.0);
          gl_FragColor = vec4(uInk, cloud * (1.0 - smoothstep(0.92, 1.0, dis)) * mix(0.85, 1.0, smoothstep(0.15, 0.7, dis)));
        }`,
    })));
    const size = () => { r.setPixelRatio(0.5); r.setSize(fogCv.clientWidth || innerWidth, fogCv.clientHeight || innerHeight, false); };
    size(); addEventListener("resize", size);
    const t0 = performance.now(); let last = 0;
    gsap.ticker.add((t) => {
      if (document.hidden || scrollY > innerHeight * 3.6 || t - last < 1 / 30) return;
      last = t; fogU.uTime.value = (performance.now() - t0) / 1000; r.render(scene, cam);
    });
  };

  // ── Moss curtain: a gradient of six deep green poles spread along a slanted grain (-24°, 3x) drifts slowly and gently pushes around the cursor (radius 1/3) ──
  const makeMoss = () => {
    if (!THREE || !mossCv) return;
    const r = new THREE.WebGLRenderer({ canvas: mossCv, alpha: true, antialias: true, powerPreference: "low-power" });
    r.setClearColor(0, 0);
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    const base = fd.color("--kf-raised"), K = [0.2, 0.25, 0.75, 0.95, 1.6, 2.1];
    const poles = K.map((k) => new THREE.Vector3(base[0] * k, base[1] * k, base[2] * k));
    mossU = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uReveal: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uActive: { value: 0 }, uPole: { value: poles } };
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: mossU, transparent: true,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform float uTime, uReveal, uActive; uniform vec2 uRes, uMouse; uniform vec3 uPole[6]; varying vec2 vUv;
        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * n(p); p *= 2.02; a *= 0.5; } return s; }
        vec2 skew(vec2 v){ return vec2(v.x * 0.913 - v.y * 0.408, (v.x * 0.408 + v.y * 0.913) * 3.0); }
        void pole(inout vec3 acc, inout float ws, vec2 P, vec2 at, vec3 c, float rad, float amp){ vec2 d = skew(P - at); float w = amp * exp(-dot(d, d) / (rad * rad)); acc += c * w; ws += w; }
        vec2 drift(float t, float f1, float f2, float ph, float a){ return vec2(cos(t * f1 + ph), sin(t * f2 + ph * 1.7)) * a; }
        void main(){
          float A = uRes.x / uRes.y; vec2 P = vec2(vUv.x * A, vUv.y), m = vec2(uMouse.x * A, uMouse.y), dM = P - m;
          P += normalize(dM + 1e-5) * exp(-dot(dM, dM) * 9.0) * uActive * 0.04 * sin(uTime * 1.2);
          vec2 ns = P * 1.7; float a1 = fbm(ns) * 6.28318 + uTime * 0.17, a2 = fbm(ns * 1.9 + 7.3) * 6.28318 - uTime * 0.12;
          vec2 q = P + vec2(cos(a1), sin(a1)) * 0.13 + vec2(cos(a2), sin(a2)) * 0.065; float t = uTime;
          vec3 acc = vec3(0.0); float ws = 1e-4;
          pole(acc, ws, q, vec2(0.20 * A, 0.80) + drift(t, 0.13, 0.11, 0.0, 0.12), uPole[0], 0.34, 1.6);
          pole(acc, ws, q, vec2(0.88 * A, 0.30) + drift(t, 0.09, 0.14, 2.1, 0.13), uPole[1], 0.36, 1.5);
          pole(acc, ws, q, vec2(0.55 * A, 0.55) + drift(t, 0.11, 0.08, 4.0, 0.14), uPole[2], 0.52, 1.0);
          pole(acc, ws, q, vec2(0.30 * A, 0.30) + drift(t, 0.10, 0.12, 1.0, 0.12), uPole[3], 0.48, 1.0);
          pole(acc, ws, q, vec2(0.72 * A, 0.78) + drift(t, 0.12, 0.09, 3.5, 0.13), uPole[4], 0.40, 0.9);
          pole(acc, ws, q, vec2(0.40 * A, 0.10) + drift(t, 0.08, 0.13, 5.2, 0.14), uPole[5], 0.32, 0.8);
          vec3 col = acc / ws; float lum = dot(col, vec3(0.2126, 0.7152, 0.0722)); col = mix(vec3(lum), col, 0.95);
          float a = (0.34 + 0.66 * smoothstep(0.012, 0.13, lum)) * mix(0.16, 1.0, uReveal) * 0.72;
          a *= 0.82 + 0.36 * h(vUv * uRes + fract(uTime) * 91.7);
          gl_FragColor = vec4(col, a);
        }`,
    })));
    const size = () => { const w = mossCv.clientWidth || innerWidth, h = mossCv.clientHeight || innerHeight; r.setPixelRatio(1); r.setSize(w, h, false); mossU.uRes.value.set(w, h); };
    size(); addEventListener("resize", size);
    let mx = 0.5, my = 0.5, on = 0;
    addEventListener("pointermove", (e) => {
      const b = mossCv.getBoundingClientRect();
      if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) { on = 0; return; }
      mx = (e.clientX - b.left) / b.width; my = 1 - (e.clientY - b.top) / b.height; on = 1;
    }, { passive: true });
    const t0 = performance.now();
    gsap.ticker.add(() => {
      if (document.hidden || scrollY > innerHeight * 3.6) return;
      mossU.uTime.value = (performance.now() - t0) / 1000;
      const m = mossU.uMouse.value; m.x += (mx - m.x) * 0.08; m.y += (my - m.y) * 0.08;
      mossU.uActive.value += (on - mossU.uActive.value) * 0.06;
      r.render(scene, cam);
    });
  };
  // As in the original, on first interaction (wheel·touch·press·key·scroll) the two curtains are raised
  let made = false;
  const wake = () => { if (made) return; made = true; ["wheel", "touchstart", "pointerdown", "keydown", "scroll"].forEach((e) => removeEventListener(e, wake)); makeFog(); makeMoss(); };
  if (!reduce) ["wheel", "touchstart", "pointerdown", "keydown", "scroll"].forEach((e) => addEventListener(e, wake, { once: true, passive: true }));

  // ── About section scroll ──
  if (!reduce) {
    gsap.from(pin, { opacity: 0, duration: 1.4, ease: "power2.out" });
    let lastH = -1;
    ScrollTrigger.create({
      trigger: intro, start: "top top", end: "bottom bottom",
      onUpdate: (self) => {
        const t = self.progress, o = clamp((t - 0.08) / 0.55), c = o * o, keep = 1 - clamp((t - 0.88) / 0.05);
        bend = c;
        if (world) world.style.opacity = String(clamp((t - 0.94) / 0.06));
        veils.forEach((v) => { v.style.opacity = String(1 - c); });
        if (fogU) fogU.uDissolve.value = t < 0.88 ? clamp((t - 0.72) / 0.16) * 0.92 : 0.92 + clamp((t - 0.94) / 0.06) * 0.08;
        if (ground) ground.style.opacity = String(clamp((t - 0.5) / 0.15) * keep);
        if (scrim) scrim.style.opacity = String(clamp((t - 0.55) / 0.1));
        if (wall) wall.style.opacity = String(keep);
        if (mossCv) mossCv.style.opacity = String(keep);
        if (mossU) mossU.uReveal.value = c;
        const hh = clamp((t - 0.62) / 0.18);
        if (Math.abs(hh - lastH) > 0.001) { lastH = hh; words.forEach((w, i) => { w.style.opacity = String(0.25 + 0.75 * clamp(hh * (words.length + 3) - i)); }); }
      },
      onLeave: () => { if (world) world.style.opacity = "1"; },
      onEnterBack: () => { if (world) world.style.opacity = "0"; },
    });
    gsap.timeline({ scrollTrigger: { trigger: intro, start: "top top", end: "bottom bottom", scrub: 0.7 } })
      .to(".fd-intro__title", { opacity: 0, scale: 1.06, duration: 0.16, ease: "none" }, 0.18)
      .to(".fd-header", { opacity: 1, pointerEvents: "auto", duration: 0.05, ease: "none" }, 0.34)
      .fromTo(stmt, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: "none" }, 0.58)
      .to(stmt, { opacity: 0, duration: 0.05, ease: "none" }, 0.88)
      .set({}, {}, 1);
  }

  // ── Photo wall: 8×3 (wide screen) cells flow sideways at 26px per second, and curve into a cylinder while scrolling down the About section, receding to .7× ──
  const tiles = $$(".fd-tile").map((el) => ({ el, i: +el.dataset.i }));
  const GRID = [{ min: 1280, pitch: 6, cols: 8, rows: 3 }, { min: 1024, pitch: 5, cols: 8, rows: 3 }, { min: 640, pitch: 4, cols: 6, rows: 4 }, { min: 0, pitch: 3, cols: 4, rows: 6 }];
  const speed = reduce ? 0 : 26;
  let cols = 8, tw = 0, th = 0, span = 0, radius = 0;
  const layoutWall = () => {
    const g = GRID.find((x) => innerWidth >= x.min) || GRID[GRID.length - 1];
    cols = g.cols; tw = innerWidth / g.pitch; th = innerHeight / g.rows; span = tw * g.cols; radius = innerWidth * 0.75;
    tiles.forEach((t) => { t.el.style.width = `${tw - 2}px`; t.el.style.height = `${th - 2}px`; t.el.style.display = t.i < g.cols * g.rows ? "" : "none"; });
  };
  layoutWall(); addEventListener("resize", layoutWall);
  const w0 = performance.now();
  gsap.ticker.add(() => {
    if (document.hidden || scrollY > innerHeight * 3.6 || (fogU && fogU.uDissolve.value >= 0.92)) return;
    const s = (performance.now() - w0) / 1000, k = bend / radius, sc = 1 - 0.3 * bend;
    for (const t of tiles) {
      const cx = t.i % cols, cy = (t.i / cols) | 0;
      const x = ((((cx + 0.5) * tw - span / 2 - s * speed + span / 2) % span) + span) % span - span / 2, y = (cy + 0.5) * th - innerHeight / 2;
      let px = x, pz = 0, ang = 0;
      if (k > 1e-6) { ang = x * k; px = Math.sin(ang) / k; pz = (1 - Math.cos(ang)) / k; }
      t.el.style.transform = `translate3d(${px.toFixed(2)}px, ${y.toFixed(2)}px, ${pz.toFixed(2)}px) rotateY(${(-ang).toFixed(4)}rad) scale(${sc.toFixed(4)}) translate(-50%, -50%)`;
    }
  });

  // ── Section: you fly in through 2000px of depth (arrives at 76.5% of the section, 52% on narrow screens) — passed panels vanish within 180px, and at 74% the English name rises into place from 28px below ──
  const narrowQ = matchMedia("(max-width: 1023px)");
  $$(".fd-chap").forEach((chap) => {
    const w = $(".fd-chap__world", chap), title = $(".fd-chap__title", chap);
    const planes = $$(".fd-chap__plane, .fd-chap__hero", chap).map((el) => ({ el, z: parseFloat(el.dataset.z || "0"), hero: el.classList.contains("fd-chap__hero") }));
    planes.forEach((p) => gsap.set(p.el, { z: p.z, yPercent: p.el.classList.contains("fd-chap__kanji") ? -50 : 0 }));
    if (reduce) { gsap.set(w, { z: 2000 }); return; }
    gsap.set(title, { opacity: 0, y: 28 });
    if (matchMedia("(pointer: fine)").matches) {
      const rx = gsap.quickTo(w, "rotationX", { duration: 1.2, ease: "power2.out" }), ry = gsap.quickTo(w, "rotationY", { duration: 1.2, ease: "power2.out" });
      addEventListener("mousemove", (e) => {
        const b = chap.getBoundingClientRect();
        if (b.top > 0 || b.bottom < innerHeight) return;
        ry((e.clientX / innerWidth - 0.5) * 2.5); rx((e.clientY / innerHeight - 0.5) * -1.8);
      }, { passive: true });
    }
    ScrollTrigger.create({
      trigger: chap, start: "top top", end: "bottom bottom",
      onUpdate: (self) => {
        const cfg = narrowQ.matches ? { cam: 0.52, ti: 0.49 } : { cam: 0.765, ti: 0.74 };
        const a = clamp(self.progress / cfg.cam), s = (1 - (1 - a) * (1 - a)) * 2000;
        gsap.set(w, { z: s });
        for (const p of planes) if (!p.hero) p.el.style.opacity = String(1 - clamp((p.z + s + 40) / 180));
        const c = clamp((self.progress - cfg.ti) / 0.07);
        gsap.set(title, { opacity: c, y: (1 - c) * 28 });
      },
    });
  });
  if (!reduce) $$(".fd-info").forEach((el) => gsap.from(el, { opacity: 0, y: 36, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));

  // ── Flip distance number ──
  $$(".fd-transit").forEach((tr) => {
    const from = +tr.dataset.kmFrom || 0, to = +tr.dataset.kmTo || 0, n = $(".fd-transit__n", tr);
    if (reduce) { n.textContent = String(to); return; }
    ScrollTrigger.create({ trigger: tr, start: "top top", end: "bottom bottom", onUpdate: (self) => { const p = self.progress, e = 1 - (1 - p) * (1 - p); n.textContent = String(Math.round(from + (to - from) * e)); } });
  });

  // Section video plays silently when on screen and stops when it leaves
  const vids = $$("[data-chapter-video]");
  const vio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !reduce) e.target.play().catch(() => {}); else e.target.pause(); }), { rootMargin: "100px" });
  vids.forEach((v) => vio.observe(v));
  addEventListener("visibilitychange", () => { if (document.hidden) vids.forEach((v) => v.pause()); });

  // ── Terrain map: contour lines (7 height levels) of the height field of an arc-shaped island chain, a red pin at each field spot. The camera goes north to south following scroll ──
  if (!THREE || !world) return;
  const outro = $("#outro");
  let outroP = 0;
  if (outro && !reduce) ScrollTrigger.create({ trigger: outro, start: "top bottom", end: "top 30%", scrub: true, onUpdate: (s) => { outroP = s.progress; } });
  const renderer = new THREE.WebGLRenderer({ canvas: world, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const bgc = new THREE.Color().setRGB(...fd.color("--kf-bg"), THREE.SRGBColorSpace);
  scene.fog = new THREE.Fog(bgc, 7, 34);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
  const inkC = new THREE.Color().setRGB(...fd.color("--kf-ink"), THREE.SRGBColorSpace), redC = new THREE.Color().setRGB(...fd.color("--kf-accent"), THREE.SRGBColorSpace);
  // Longitude/latitude → board coordinates (same scale as the original: 1° of latitude = 1.25, longitude 1° = 1.0125)
  const X = (lon) => (lon - 137) * 1.0125, Z = (lat) => (35 - lat) * 1.25;
  const SPINE = [[145.2, 44.2, 1.5], [143.2, 43.1, 2.0], [141.4, 42.2, 1.4], [140.7, 40.6, 1.15], [140.6, 39.0, 1.2], [140.2, 37.4, 1.15], [139.0, 36.1, 1.3], [137.4, 35.4, 1.25], [135.8, 34.4, 1.15], [134.0, 34.6, 0.8], [132.3, 34.2, 0.85], [130.9, 33.4, 1.1], [130.6, 32.2, 1.15], [131.0, 31.3, 0.8]];
  const PINS = [[143.0, 43.08], [140.5, 39.56], [135.8, 34.11], [130.8, 32.37]].map(([lo, la]) => new THREE.Vector3(X(lo), 0, Z(la)));
  const seg = SPINE.map(([lo, la, w]) => ({ x: X(lo), z: Z(la), w: w * 1.1 }));
  const vn = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
  const noise = (x, z) => { const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
    const a = vn(ix, iz), b = vn(ix + 1, iz), c = vn(ix, iz + 1), d = vn(ix + 1, iz + 1); return a + (b - a) * ux + (c - a) * uz * (1 - ux) + (d - b) * ux * uz; };
  const fbm = (x, z) => noise(x, z) * 0.5 + noise(x * 2.1, z * 2.1) * 0.25 + noise(x * 4.3, z * 4.3) * 0.125;
  const heightAt = (x, z) => {
    let best = -1;
    for (let i = 0; i < seg.length - 1; i++) {
      const a = seg[i], b = seg[i + 1], abx = b.x - a.x, abz = b.z - a.z, t = clamp(((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz));
      const dx = x - (a.x + abx * t), dz = z - (a.z + abz * t), w = a.w + (b.w - a.w) * t;
      best = Math.max(best, 1 - Math.hypot(dx, dz) / w);
    }
    return best + (fbm(x * 0.9, z * 0.9) - 0.45) * 0.55;
  };
  const LEVELS = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84];
  const lift = (h) => Math.max(0, h) * 1.1;
  {
    const minX = X(128.5), maxX = X(146.5), minZ = Z(45.2), maxZ = Z(30.5);
    const NX = innerWidth >= 1280 ? 260 : innerWidth >= 640 ? 200 : 150, NZ = Math.round(NX * (maxZ - minZ) / (maxX - minX));
    const dx = (maxX - minX) / (NX - 1), dz = (maxZ - minZ) / (NZ - 1);
    const H = new Float32Array(NX * NZ);
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) H[j * NX + i] = heightAt(minX + i * dx, minZ + j * dz);
    const coast = [], rest = [];
    const edge = (lv, a, b, ia, ib) => { const t = (lv - a) / (b - a); return [ia[0] + (ib[0] - ia[0]) * t, ia[1] + (ib[1] - ia[1]) * t]; };
    for (const lv of LEVELS) {
      const out = lv === 0 ? coast : rest, y = lift(lv);
      for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) {
        const a = H[j * NX + i], b = H[j * NX + i + 1], c = H[(j + 1) * NX + i + 1], d = H[(j + 1) * NX + i];
        const k = (a > lv) | ((b > lv) << 1) | ((c > lv) << 2) | ((d > lv) << 3);
        if (k === 0 || k === 15) continue;
        const pa = [i, j], pb = [i + 1, j], pc = [i + 1, j + 1], pd = [i, j + 1];
        const e0 = () => edge(lv, a, b, pa, pb), e1 = () => edge(lv, b, c, pb, pc), e2 = () => edge(lv, d, c, pd, pc), e3 = () => edge(lv, a, d, pa, pd);
        const pairs = { 1: [[e3, e0]], 2: [[e0, e1]], 3: [[e3, e1]], 4: [[e1, e2]], 5: [[e3, e0], [e1, e2]], 6: [[e0, e2]], 7: [[e3, e2]], 8: [[e2, e3]], 9: [[e0, e2]], 10: [[e0, e1], [e2, e3]], 11: [[e1, e2]], 12: [[e1, e3]], 13: [[e0, e1]], 14: [[e3, e0]] }[k];
        for (const [f, g] of pairs) { const p = f(), q = g(); out.push(minX + p[0] * dx, y, minZ + p[1] * dz, minX + q[0] * dx, y, minZ + q[1] * dz); }
      }
    }
    const lines = (arr, op) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3)); return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: inkC, transparent: true, opacity: op, fog: true })); };
    scene.add(lines(rest, 0.6), lines(coast, 0.9));
  }
  // Section pin: bottom ring + dot + light beam that is red below and fades upward
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uBase: { value: redC }, uTip: { value: inkC } }, transparent: true, depthWrite: false,
    vertexShader: "varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 uBase, uTip; varying float vY; void main(){ float a = (1.0 - vY) * 0.85; gl_FragColor = vec4(mix(uBase, uTip, smoothstep(0.0, 0.3, vY)), a); }",
  });
  const pins = PINS.map((p) => {
    const g = new THREE.Group(); g.position.set(p.x, lift(heightAt(p.x, p.z)) + 0.02, p.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.22 * 1.06, 72), new THREE.MeshBasicMaterial({ color: redC, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), new THREE.MeshBasicMaterial({ color: redC, transparent: true, opacity: 0.95 }));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.026, 1.2, 16, 1, true), beamMat);
    beam.position.y = 0.6;
    g.add(ring, dot, beam); scene.add(g);
    return { g, ring };
  });
  const route = new THREE.CatmullRomCurve3(PINS.map((p) => p.clone()));
  const chaps = $$(".fd-chap");
  let anchors = [];
  const measure = () => { anchors = chaps.map((c) => c.getBoundingClientRect().top + scrollY + c.offsetHeight / 2 - innerHeight / 2); };
  measure(); ScrollTrigger.addEventListener("refresh", measure);
  const resize = () => { renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  resize(); addEventListener("resize", resize);
  let mx = 0, my = 0, cmx = 0, cmy = 0;
  addEventListener("mousemove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const target = new THREE.Vector3(), centre = new THREE.Vector3(X(133), 0, Z(37.6)); // In the closing, look left so the island chain sits on the right of the screen
  gsap.ticker.add(() => {
    if (document.hidden || +world.style.opacity <= 0) return;
    const y = scrollY;
    let u = 0;
    if (anchors.length && y > anchors[0]) {
      if (y >= anchors[anchors.length - 1]) u = 1;
      else { let i = 0; while (i < anchors.length - 2 && y > anchors[i + 1]) i++; u = (i + (y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i])) / (anchors.length - 1); }
    }
    route.getPoint(reduce ? 1 : u, target);
    const zoom = reduce ? 1 : outroP;
    target.lerp(centre, zoom);
    const f = 4.2 + 10 * zoom, tilt = 0.9 - 0.4 * zoom;
    cmx += (mx - cmx) * 0.05; cmy += (my - cmy) * 0.05;
    camera.position.set(target.x + cmx * 0.6 + 1.2 * (1 - zoom), f, target.z + f * tilt + cmy * 0.4);
    camera.lookAt(target.x + 1.2 * (1 - zoom) * 0.4, 0, target.z);
    const t = performance.now() / 1000;
    pins.forEach((p, i) => { const s = 1 + 0.25 * Math.sin(t * 1.6 + i); p.ring.scale.setScalar(s); p.ring.material.opacity = 0.85 * (1.25 - 0.25 * s); });
    renderer.render(scene, camera);
  });
})();
