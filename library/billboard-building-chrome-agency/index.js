/* Home page — original timeline values kept as is:
   Loading 8 cells → curtain lifts over 1s, background black → gradient 1s, header row y -100 → 0 1s (after 1s), LED .1s ×12 blinks, intro text 1s (after 1.5s), notice .1s ×2 (after 2.5s), then smooth scroll turns on
   Box building: starts at (0,-200,-600)·23x → at 1s y rotation -.25π·(30,-194,-500), camera (0,-1,26)→(0,-5.5,19). Over scroll 0~3000 the building goes to (-8,·,-440) with a further -.25π rotation, camera (·,-370,3) 1.3, material disappears at .2
   Chrome letters: the first letter enters its cell from outside the top-left of the screen at 1600~3300, and the rest sit outside the four corners at 1000~2400 and then return into place over 1 at horizontal scroll .6 · 1.2 · 3.4 · 3.9 cells
   Horizontal pin: scrub 1 over (row width − screen width)+3000 — row 10, case titles 10~11.5, cube scale 1x at 11, Y 360° over 12~22, descriptions change at 11·13.5·15.5·17.5, X +89.9° at 22, 4x at 23 · TV shade
   Dark section: fixed 2500 scrub 1 — cylinder X -80°→270° (2), cube 0 at 1.5 */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = innerWidth > 900;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TextPlugin);
  history.scrollRestoration = "manual";
  scrollTo(0, 0);
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const loader = $(".bp-loader");

  // ── Phone / reduced motion: stack vertically without 3D, each row floats up (original phone branch)
  if (!desk || reduce) {
    gsap.set(loader, { autoAlpha: 0 });
    gsap.set(".bp-backgra", { autoAlpha: 0 });
    if (reduce) { gsap.set(".bp-m1__copy, .bp-scrolldown, .bp-led__item > div, .bp-arrow i", { opacity: 1 }); gsap.set(".bp-m1__mask", { height: 1.13 * innerWidth }); return; }
    gsap.to(".bp-m1__copy", { opacity: 1, duration: 1 });
    gsap.to(".bp-scrolldown", { opacity: 1, duration: 0.1, delay: 1, repeat: 2 });
    gsap.to(".bp-led__item > div", { opacity: 1, duration: 0.1, repeat: 8 });
    gsap.to(".bp-arrow i", { opacity: 1, duration: 0.3, delay: 1.2, stagger: 0.02, repeat: 1 });
    gsap.to(".bp-m1__mask", { height: 1.13 * innerWidth, duration: 1, delay: 0.4 });
    gsap.timeline({ scrollTrigger: { scrub: true, start: 0, end: 100 } }).to(".bp-scrolldown", { opacity: 0, duration: 0.2 }, 0);
    $$(".bp-row").forEach((r) => gsap.from(r, { opacity: 0, duration: 1, scrollTrigger: { trigger: r, start: `top+=${-0.7 * innerHeight} bottom` } }));
    return;
  }

  const smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1 });
  smoother.paused(true);
  const W = innerWidth, H = innerHeight;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // ── three
  const T = THREE;
  const renderer = new T.WebGLRenderer({ canvas: $(".bp-canvas"), antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H, false);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.autoClear = false;
  const sceneA = new T.Scene(), sceneB = new T.Scene();
  const camA = new T.PerspectiveCamera(30, W / H, 10, 1000);
  const camB = new T.PerspectiveCamera(2 * Math.atan(H / 2 / 1300) * 180 / Math.PI, W / H, 100, 1e4);
  camA.position.set(0, -1, 26); camB.position.z = 1300;
  sceneA.add(camA); sceneB.add(camB);

  // Stand-in for the original HDR environment — a reflection baked from three bright studio panels with PMREM
  const env = (() => {
    const s = new T.Scene();
    s.add(new T.Mesh(new T.SphereGeometry(30, 32, 16), new T.ShaderMaterial({ side: T.BackSide,
      vertexShader: "varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: "varying vec3 p; void main(){ float t = p.y * .5 + .5; gl_FragColor = vec4(mix(vec3(.35), vec3(1.), smoothstep(-.2, .9, t)), 1.); }" })));
    for (const [x, y, z, w, h] of [[-12, 8, 10, 10, 6], [14, 4, -4, 4, 12], [0, 16, 0, 14, 14]]) {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(4, 4, 4), side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    const pm = new T.PMREMGenerator(renderer), tex = pm.fromScene(s, 0.03).texture; pm.dispose(); return tex;
  })();

  // Box building — the original model spot as the same silhouette (ad box on top + text wall below, dark roof panel)
  const paint = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };
  const ink = css("--kf-ink"), surf = css("--kf-surface"), raised = css("--kf-raised"), dim = css("--kf-dim");
  const display = css("--kf-font-display"), mono = css("--kf-font-mono");
  const posterA = paint(1600, 1140, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, raised); g.addColorStop(1, surf); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = ink;
    x.font = `500 30px ${display}`; ["Company Name", "Short tagline", "in two lines"].forEach((t, i) => x.fillText(t, 40, 70 + i * 38));
    x.font = `400 140px ${display}`; x.fillText("00-0000, BIG", 30, 420); x.fillText("HEADL◯NE", 30, 580);
    x.font = `700 200px ${display}`; x.fillText("A", 900, 520); x.fillText("WORD", 900, 760);
    x.font = `400 40px ${display}`; ["00-0, 0F/0F", "Street address line", "City, Country 00000"].forEach((t, i) => x.fillText(t, 900, 110 + i * 52));
    x.strokeStyle = ink; x.lineWidth = 4; x.beginPath(); x.arc(1460, 140, 56, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.ellipse(1460, 140, 24, 56, 0, 0, Math.PI * 2); x.stroke();
    x.font = `400 28px ${mono}`; ["Small text in three lines", "a note at the top right", "like a quick memo"].forEach((t, i) => x.fillText(t, 1150, 330 + i * 40));
    x.beginPath(); x.ellipse(330, 960, 150, 50, 0, 0, Math.PI * 2); x.stroke();
    x.font = `400 44px ${display}`; x.fillText("Keyword", 250, 975);
  });
  const posterB = paint(1140, 1140, (x, w, h) => {
    x.fillStyle = surf; x.fillRect(0, 0, w, h); x.fillStyle = ink;
    x.font = `700 230px ${display}`; x.fillText("SIDE", 60, 360); x.fillText("FACE", 60, 640);
    x.font = `400 34px ${mono}`; ["Two small lines here", "a note on the side face"].forEach((t, i) => x.fillText(t, 70, 760 + i * 46));
  });
  const wall = paint(2048, 1400, (x, w, h) => {
    x.fillStyle = surf; x.fillRect(0, 0, w, h); x.fillStyle = dim;
    const rows = ["A LONG ROW OF BIG LETTERS RUNS ACROSS HERE", "THE SECOND ROW ◯ RUNS PAST THE EDGE", "A THIRD ROW ⬭ KEEPS GOING IN BIG TYPE", "THE FOURTH ROW HAS AN ▦ ICON SLOT", "FIFTH ROW SMALL THREE LINE SLOT  AND MORE", "THE SIXTH ROW WIDE GAP   AND THEN END", "THE SEVENTH AND LAST ROW OF BIG TYPE"];
    x.font = `500 96px ${display}`;
    rows.concat(rows.slice(0, 4)).forEach((t, i) => x.fillText(t + "  " + t, -60 + (i % 2) * -160, 110 + i * 112));
    x.font = `400 44px ${display}`; x.textAlign = "center";
    x.fillText("Your two-line note goes here. A spot to write about the joy of working together.", w / 2, 1330); x.fillText("”Your quotation line goes here.”", w / 2, 1385);
  });
  const mats = [];
  const mk = (opt) => { const m = new T.MeshStandardMaterial({ roughness: 0.82, metalness: 0, transparent: true, envMap: env, envMapIntensity: 0.6, ...opt }); mats.push(m); return m; };
  const L = 13.6, TOP = 9.67, LOW = -16;
  const building = new T.Group();
  const upper = new T.Mesh(new T.BoxGeometry(L, TOP, L), [mk({ map: posterB }), mk({ map: posterB }), mk({ color: new T.Color(css("--kf-ink-soft")) }), mk({ color: new T.Color(raised) }), mk({ map: posterA }), mk({ map: posterA })]);
  upper.position.y = TOP / 2; building.add(upper);
  const lower = new T.Mesh(new T.BoxGeometry(L, -LOW, L), [mk({ map: wall }), mk({ map: wall }), mk({ color: new T.Color(raised) }), mk({ color: new T.Color(raised) }), mk({ map: wall }), mk({ map: wall })]);
  lower.position.y = LOW / 2; building.add(lower);
  const slabShape = new T.Shape(); const r = 0.6, s = L / 2 + 0.25;
  slabShape.moveTo(-s + r, -s); slabShape.lineTo(s - r, -s); slabShape.quadraticCurveTo(s, -s, s, -s + r); slabShape.lineTo(s, s - r); slabShape.quadraticCurveTo(s, s, s - r, s);
  slabShape.lineTo(-s + r, s); slabShape.quadraticCurveTo(-s, s, -s, s - r); slabShape.lineTo(-s, -s + r); slabShape.quadraticCurveTo(-s, -s, -s + r, -s);
  const slab = new T.Mesh(new T.ExtrudeGeometry(slabShape, { depth: 0.75, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 3 }), mk({ color: new T.Color(css("--kf-ink-soft")), roughness: 0.35, metalness: 0.6, envMapIntensity: 1.2 }));
  slab.rotation.x = -Math.PI / 2; slab.position.y = TOP - 0.1; building.add(slab);
  // On the original screen the roof sits below the LED strip (y≈335 at 1440 width) — only the model’s inner height is lowered, group coordinates and scale stay as in the original
  building.children.forEach((c) => (c.position.y -= 1.25));
  building.position.set(0, -200, -600); building.scale.setScalar(23); building.rotation.y = 0.385;
  sceneA.add(building);

  // Chrome letters — our own glyphs (zigzag, ring, arc, mountain, wave) drawn as inflated tubes in place of the original’s letter model
  const chrome = new T.MeshPhysicalMaterial({ color: new T.Color(surf), metalness: 0.35, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMap: env, envMapIntensity: 1.25 });
  const PATHS = [
    [[-0.5, 0.5], [-0.25, -0.5], [0, 0.15], [0.25, -0.5], [0.5, 0.5]],
    [[-0.3, -0.55], [-0.3, 0.45], [0.15, 0.45], [0.38, 0.22], [0.15, 0], [-0.3, 0]],
    [[0.35, 0.35], [0, 0.5], [-0.35, 0.2], [-0.35, -0.2], [0, -0.5], [0.35, -0.35]],
    [[-0.5, -0.5], [-0.45, 0.5], [0, -0.1], [0.45, 0.5], [0.5, -0.5]],
    [[0.32, 0.38], [0, 0.5], [-0.3, 0.3], [0.3, -0.3], [0, -0.5], [-0.32, -0.38]],
  ];
  const glyphs = PATHS.map((pts, i) => {
    const curve = new T.CatmullRomCurve3(pts.map(([x, y]) => new T.Vector3(x, y, 0)), false, "catmullrom", 0.2);
    const mesh = new T.Mesh(new T.TubeGeometry(curve, 160, 0.13, 28, false), chrome);
    const cap = new T.SphereGeometry(0.13, 24, 16);
    [curve.getPoint(0), curve.getPoint(1)].forEach((p) => { const c = new T.Mesh(cap, chrome); c.position.copy(p); mesh.add(c); });
    mesh.scale.setScalar(0.0001);
    sceneB.add(mesh);
    return { mesh, i, appear: 0, fly: 1, spinX: 0, spinY: 0, slot: $(`.bp-tspan[data-glyph="${i}"]`) };
  });
  const keyB = new T.DirectionalLight(0xffffff, 1.8); keyB.position.set(-15, 5, 50); sceneB.add(keyB);
  sceneB.add(new T.DirectionalLight(0xffffff, 0.8));
  sceneB.add(new T.AmbientLight(0xffffff, 0.4));
  const keyA = new T.DirectionalLight(0xffffff, 1.2); keyA.position.set(7, 13, 20); sceneA.add(keyA);
  const pointA = new T.PointLight(0xaaaaff, 2e4, 8e3); pointA.position.set(-50, -10, -450); sceneA.add(pointA);
  sceneA.add(new T.AmbientLight(0xffffff, 0.9));

  // Cell position — position within the horizontal row (before the row shift) and height from the top edge of the section. Placed at the position seen on the horizontally fixed board.
  const rows = $(".bp-rows"), m2 = $(".bp-m2");
  const slots = () => glyphs.forEach((g) => {
    const rr = rows.getBoundingClientRect(), sr = g.slot.getBoundingClientRect(), mr = m2.getBoundingClientRect();
    const tx = gsap.getProperty(rows, "x");
    g.sx = sr.left - rr.left + (rr.left - tx) + sr.width / 2; g.sy = sr.top - mr.top + 0.105 * W; g.size = (g.i === 0 || g.i === 3 ? 0.24 : 0.17) * W;
    const corners = [[-1.2, 1.6], [1.2, -1.4], [1.3, 1.9], [-1.3, -1.4], [-1.1, 0.3]];
    const c = g.i === 0 ? corners[4] : corners[g.i - 1];
    g.ox = c[0] * W / 2; g.oy = c[1] * H / 2;
  });

  // ── TV noise — our shader replaces the original noise canvas (dark face smear + noise + scanlines + color shift)
  const tv = (() => {
    const c = $(".bp-tv"), gl = c.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) return { draw() {} };
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, "attribute vec2 a; varying vec2 v; void main(){ v = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }"));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, `precision mediump float; varying vec2 v; uniform float t; uniform vec3 k;
      float h(vec2 q){ return fract(sin(dot(q, vec2(12.9898, 78.233)) + t * 61.) * 43758.5453); }
      float face(vec2 q){ q -= vec2(.58, .52); q.x *= 1.25; return smoothstep(.42, .05, length(q)) * (.55 + .45 * smoothstep(.0, .3, abs(q.y + .08))); }
      void main(){
        float sh = .004 * sin(t * 3. + v.y * 40.);
        float r = face(v + vec2(sh + .006, 0.)), g = face(v + vec2(sh, 0.)), b = face(v + vec2(sh - .006, 0.));
        vec3 col = vec3(r, g, b) * k * .34;
        col += (h(floor(v * 288.)) - .5) * .16;
        col *= .82 + .18 * sin(v.y * 900.);
        col *= smoothstep(1.05, .35, length(v - .5));
        gl_FragColor = vec4(col, 1.); }`));
    gl.linkProgram(p); gl.useProgram(p);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const ut = gl.getUniformLocation(p, "t"), uk = gl.getUniformLocation(p, "k");
    const kc = new T.Color(css("--kf-contrast-ink"));
    return { draw(now) { gl.uniform1f(ut, now * 0.001); gl.uniform3f(uk, kc.r, kc.g, kc.b); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } };
  })();

  // ── Every frame
  const dice = $(".bp-dice__items");
  const QX = { x: 0 };
  gsap.ticker.add((time) => {
    const now = time * 1000;
    for (const g of glyphs) {
      if (g.sx === undefined) continue;
      const k = g.fly;
      g.mesh.position.set(g.sx - W / 2 + gsap.getProperty(rows, "x") + k * g.ox, H / 2 - g.sy + k * g.oy, 0);
      g.mesh.rotation.set(0.25 + g.spinX * k, -0.35 + g.spinY * k, 0.08);
      g.mesh.scale.setScalar(Math.max(0.0001, g.size * g.appear));
    }
    renderer.clear();
    renderer.render(sceneA, camA);
    renderer.clearDepth();
    renderer.render(sceneB, camB);
    if (gsap.getProperty(dice, "scale") > 0.01) tv.draw(now);
  });
  gsap.ticker.lagSmoothing(0);

  // ── Loading 8 cells: build one scene per cell (texture baking · shader compile)
  const pct = $(".bp-loader__pct"), fill = $(".bp-loader__fill");
  const steps = [() => renderer.compile(sceneA, camA), () => renderer.compile(sceneB, camB), () => renderer.initTexture(posterA), () => renderer.initTexture(posterB), () => renderer.initTexture(wall), () => tv.draw(0), slots, () => renderer.render(sceneA, camA)];
  let n = 0;
  const step = () => {
    steps[n]?.(); n++;
    const p = (n / 8) * 100;
    fill.style.width = p + "%"; pct.textContent = Math.round(p);
    if (n < 8) return setTimeout(step, 48);
    gsap.to(loader, { autoAlpha: 0, duration: 1, onComplete: intro });
    // The original starts the spin 2.5s after receiving the model — it begins while the loading curtain lifts, and once the curtain is gone it is standing, turned
    gsap.to(building.rotation, { y: 0.385 - 0.25 * Math.PI, duration: 1, delay: 1.5 });
    gsap.to(building.position, { x: 30, y: -194, z: -500, duration: 1, delay: 1.5 });
    gsap.to(camA.position, { z: 19, y: -5.5, duration: 1, delay: 1.5, onComplete: scrollScenes });
  };
  (document.fonts?.ready || Promise.resolve()).then(() => setTimeout(step, 60));

  function intro() {
    gsap.from(".bp-backgra", { background: css("--kf-contrast-bg"), duration: 1, ease: "power1.out" });
    gsap.from(".bp-header__info, .bp-nav", { y: -100, duration: 1, delay: 1 });
    gsap.to(".bp-led__item > div", { opacity: 1, duration: 0.1, repeat: 12 });
    gsap.to(".bp-m1__copy", { opacity: 1, duration: 1, delay: 1.5 });
    gsap.to(".bp-introbox", { opacity: 1, duration: 1, delay: 1.5 });
    gsap.to(".bp-scrolldown", { opacity: 1, duration: 0.1, delay: 2.5, repeat: 2, onComplete: () => smoother.paused(false) });
    gsap.to(".bp-arrow i", { opacity: 1, duration: 0.3, delay: 2.4, stagger: 0.02, repeat: 1 });
  }

  function scrollScenes() {
    // Descend into building
    const C = gsap.timeline({ scrollTrigger: { scrub: true, start: 0, end: 3000, invalidateOnRefresh: true } });
    C.to(".bp-introbox, .bp-scrolldown", { opacity: 0, duration: 0.2 }, 0);
    C.to(building.position, { x: -8, z: -440, duration: 1 }, 0);
    C.to(camA.position, { y: -370, z: 3, duration: 1.3 }, 0);
    C.to(building.rotation, { y: `+=${-0.25 * Math.PI}`, duration: 1 }, 0);
    mats.forEach((m) => C.to(m, { opacity: 0, duration: 0.2 }, 1));
    // First chrome letters: fly in from outside the top left into their cells
    const g0 = glyphs[0];
    g0.spinX = 1.4; g0.spinY = -2.6;
    const v = gsap.timeline({ scrollTrigger: { scrub: true, start: 1600, end: 3300, invalidateOnRefresh: true } });
    v.fromTo(g0, { appear: 0 }, { appear: 1, duration: 1.5 }, 0);
    v.fromTo(g0, { fly: 1 }, { fly: 0.35, duration: 1.3 }, 0).to(g0, { fly: 0, duration: 0.7 }, 1);
    // The other four: scaled up outside the corner during 1000~2400, then settle into place on horizontal scroll
    glyphs.slice(1).forEach((g, o) => {
      g.spinX = -7 + 0.5 * o; g.spinY = 6;
      gsap.timeline({ scrollTrigger: { scrub: 1, start: 1000, end: 2400, invalidateOnRefresh: true } }).fromTo(g, { appear: 0 }, { appear: 1, duration: 0.5, delay: 0.25 * o }, 0);
    });
    horizon();
  }

  function horizon() {
    const e = rows.scrollWidth - innerWidth;
    const Wtl = gsap.timeline({ scrollTrigger: { trigger: m2, start: "top top", end: `+=${e + 3000}`, scrub: 1, pin: true, invalidateOnRefresh: true } });
    Wtl.to(rows, { x: -e, duration: 10, ease: "none" }, 0);
    [0.6, 1.2, 3.4, 3.9].forEach((at, i) => Wtl.to(glyphs[i + 1], { fly: 0, duration: 1, ease: "power1.out" }, at));
    const rs5 = $(".bp-rs5"), title = $(".bp-rs5__title"), pr = $(".bp-rs5__pr");
    const tShift = title.getBoundingClientRect().left - rs5.getBoundingClientRect().left - 40;
    const prR = pr.getBoundingClientRect();
    const oShift = e + innerWidth - prR.left - prR.width - 40;
    Wtl.to(title, { x: -tShift, duration: 1.5, ease: "none" }, 10);
    Wtl.to(pr, { x: oShift, duration: 1, ease: "none" }, 10);
    gsap.set(dice, { z: -0.2 * W, scale: 0 });
    Wtl.to(dice, { scale: 1, duration: 1 }, 11);
    Wtl.to(dice, { rotationY: 360, duration: 10, ease: "none" }, 12);
    const desc = $(".bp-dice__desc p");
    const lines = ["”Your first case intro here, about three lines. A spot to describe when and where it happened, what was done, and how it reached people...", "“Your second case introduction goes here, about three lines. Note how long the work has run and how far the scope reaches...", "“Your third case introduction goes here, about three lines. Note which story was put first and what was shown...", "“Your fourth case introduction goes here in about three lines. A place to describe how you chose, decorated and ran the space..."];
    [11, 13.5, 15.5, 17.5].forEach((at, i) => Wtl.to(desc, { text: lines[i] }, at));
    Wtl.to(desc, { text: "", onUpdate: () => gsap.set(".bp-dice", { zIndex: 2 }), onComplete: () => gsap.set(".bp-dice", { zIndex: 0 }) }, 20);
    Wtl.to(dice, { rotationX: "+=89.9", duration: 1 }, 22);
    Wtl.to(dice, { scale: 4, duration: 0.5 }, 23);
    Wtl.to(".bp-tv__shadow", { opacity: 1, duration: 0.5 }, 23);

    // Dark section cylinder
    const items = $$(".bp-drum__item"), l = items.length;
    items.forEach((el, t) => gsap.set(el, { x: -el.getBoundingClientRect().width / 2, y: (W / 4.8) * Math.sin(t * (Math.PI / l)), z: (W / 4.8) * Math.cos(t * (Math.PI / l)), rotationX: -t * (180 / l) }));
    const q = gsap.timeline({ scrollTrigger: { trigger: ".bp-m4", start: "top top", end: "+=2500", scrub: 1, pin: true, invalidateOnRefresh: true,
      onToggle: (st) => $(".bp-nav").classList.toggle("is-dark", st.isActive) } });
    q.fromTo(".bp-drum", { rotationX: -80 }, { rotationX: 270, duration: 2 }, 0);
    q.to(dice, { scale: 0, duration: 1 }, 1.5);
    ScrollTrigger.refresh();
    slots();
  }

  addEventListener("resize", () => { clearTimeout(window.__bpR); window.__bpR = setTimeout(() => location.reload(), 300); });
})();
