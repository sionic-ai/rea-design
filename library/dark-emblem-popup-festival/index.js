// One-screen event site: a 3D emblem (three r146) in the dark gets pulled in close on entry, then is picked via the section title slider or by dragging the logo
// DIVE pierces through the logo to open the popup page (locomotive scroll). Values are read from the original script (camera fov 45, base 1.2071,
// RGB split .0001 to .004, entry 1s power2.inOut, DIVE 3-second sequence — darkness 1~3s · flash 2.5~3.75s · logo passes through z 1~3s sine.in · page at 3s)
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = $(".bf-page");
  const phone = matchMedia("(max-width: 959px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const factor = phone ? 0.5 : 1;
  const BASE = 1.207106781;
  const SNAP = [{ x: 0.8, y: 0.45 }, { x: 0.6, y: 0.5 }, { x: 0.35, y: 0.5 }, { x: 0.15, y: 0.45 }, { x: 0.65, y: 0.46 }, { x: 0.66, y: 0.34 }, { x: 0.67, y: 0.26 }, { x: 0.61, y: 0.49 }, { x: 0.58, y: 0.33 }, { x: 0.45, y: 0.34 }];
  const WALL = ["artist", "info", "extra"];

  // Turn skin colors into rgb that three and canvas can read — even skins written in color-mix or oklch are painted once on a 2d canvas and read as pixels
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rgb = (n) => {
    const el = document.createElement("i");
    el.style.color = `var(${n})`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return { css: `rgb(${d[0]}, ${d[1]}, ${d[2]})`, color: new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255) };
  };
  const C = { bg: rgb("--kf-bg"), ink: rgb("--kf-ink"), accent: rgb("--kf-accent"), paper: rgb("--kf-contrast-bg"), paperInk: rgb("--kf-contrast-ink") };
  const mix = (a, b, t) => a.color.clone().lerp(b.color, t);
  const mixCss = (a, b, t) => `#${mix(a, b, t).getHexString()}`;
  const fonts = { display: cssVar("--kf-font-display"), label: cssVar("--kf-font-label") || cssVar("--kf-font-sans"), black: cssVar("--kf-font-black") || cssVar("--kf-font-display"), sans: cssVar("--kf-font-sans") };

  // ───────── Renderer ─────────
  const canvas = $(".bf-stage");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(C.bg.color, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.01, 900);
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const rgbPass = new THREE.ShaderPass({
    uniforms: { tDiffuse: { value: null }, uAmount: { value: 3e-4 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uAmount; void main(){ vec2 o = vec2(uAmount, 0.0); vec4 r = texture2D(tDiffuse, vUv + o); vec4 g = texture2D(tDiffuse, vUv - o); vec4 b = texture2D(tDiffuse, vUv); gl_FragColor = vec4(r.r, g.g, b.b, b.a); }",
  });
  composer.addPass(rgbPass);
  const SHADER = { min: 1e-4, max: 0.004 };

  // ───────── Light background — grain in the dark and a light cone sweeping. On entry it brightens, and going in tints it sepia ─────────
  const bgMat = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uLight: { value: new THREE.Vector2(0.5, 0.7) }, uAspect: { value: innerWidth / innerHeight },
      uBright: { value: 0 }, uColor: { value: 0 }, uBg: { value: C.bg.color }, uInk: { value: C.ink.color }, uTint: { value: mix(C.accent, C.bg, 0.35) },
      uGlow: { value: 1 }, uGlowOn: { value: phone ? 0 : 1 }, uGlowAt: { value: new THREE.Vector2(0.5, 0.7) },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }",
    fragmentShader: `varying vec2 vUv; uniform float uTime, uAspect, uBright, uColor, uGlow, uGlowOn; uniform vec2 uLight, uGlowAt; uniform vec3 uBg, uInk, uTint;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){
        vec2 p = vec2(vUv.x * uAspect, vUv.y), l = vec2(uLight.x * uAspect, uLight.y);
        float d = distance(p, l);
        float spot = smoothstep(0.95, 0.0, d);
        float sweep = n(vec2(atan(p.y - l.y, p.x - l.x) * 2.0, uTime * 0.15)) * 0.6 + 0.4;
        float lit = spot * sweep * (0.22 + 0.5 * uBright);
        vec3 tone = mix(uInk, uTint, uColor);
        vec3 base = mix(uBg, uTint * 0.55, uColor * 0.8);
        vec3 col = base + tone * lit * 0.32;
        // Original cursor light: a circle 50vh across fades linearly from 25% at the center to 0 at the edge (behind the logo, below the meta bar layer)
        float gd = distance(p, vec2(uGlowAt.x * uAspect, uGlowAt.y));
        col = mix(col, uInk, max(0.0, 1.0 - gd / (0.25 * uGlow)) * 0.25 * uGlowOn);
        col +=(h(vUv * 900.0 + fract(uTime) * 37.0) - 0.5) * 0.045;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bgQuad.frustumCulled = false;
  bgQuad.renderOrder = -1;
  scene.add(bgQuad);

  // ───────── Emblem — four pillars rising like a crown and a center number plate (our shapes with the same silhouette proportions instead of the original logo) ─────────
  const pillar = (w, h, notch) => {
    const s = new THREE.Shape();
    const x0 = -w / 2, x1 = w / 2;
    s.moveTo(x0, 0);
    s.lineTo(x1, 0);
    s.lineTo(x1, h * 0.86);
    s.lineTo(x1 - w * 0.18, h * (0.86 + notch));
    s.lineTo(x1 - w * 0.3, h * 0.9);
    s.lineTo(0, h);
    s.lineTo(x0 + w * 0.3, h * 0.9);
    s.lineTo(x0 + w * 0.18, h * (0.86 + notch));
    s.lineTo(x0, h * 0.86);
    s.closePath();
    const slot = new THREE.Path();
    slot.moveTo(-w * 0.12, h * 0.12);
    slot.lineTo(w * 0.12, h * 0.12);
    slot.lineTo(w * 0.12, h * 0.72);
    slot.lineTo(0, h * 0.8);
    slot.lineTo(-w * 0.12, h * 0.72);
    slot.closePath();
    s.holes.push(slot);
    return s;
  };
  const logoMat = new THREE.MeshStandardMaterial({ color: mix(C.bg, C.ink, 0.1), metalness: 0.72, roughness: 0.38 });
  const plateMat = new THREE.MeshStandardMaterial({ color: mix(C.bg, C.ink, 0.16), metalness: 0.5, roughness: 0.4 });
  const lineMat = new THREE.LineBasicMaterial({ color: C.ink.color, transparent: true, opacity: 0.32 });
  const ext = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 1 };
  const logo = new THREE.Group();
  const P = [{ w: 0.2, h: 0.86, x: -0.39, n: 0.1 }, { w: 0.3, h: 0.96, x: -0.13, n: 0.06 }, { w: 0.3, h: 0.96, x: 0.17, n: 0.06 }, { w: 0.2, h: 0.86, x: 0.42, n: 0.1 }];
  const pieces = [];
  P.forEach((p) => {
    const g = new THREE.ExtrudeGeometry(pillar(p.w, p.h, p.n), ext);
    const m = new THREE.Mesh(g, logoMat);
    m.position.set(p.x, -0.5, -ext.depth / 2);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), lineMat);
    m.add(e);
    logo.add(m);
    pieces.push(m);
  });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 0.08), plateMat);
  plate.position.set(0.02, -0.2, 0.17);
  plate.add(new THREE.LineSegments(new THREE.EdgesGeometry(plate.geometry), lineMat));
  logo.add(plate);
  const seg = (x, y, w, h) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), logoMat); b.position.set(x, y, 0.225); logo.add(b); };
  [-0.06, 0.1].forEach((cx) => { seg(cx, -0.1, 0.1, 0.018); seg(cx, -0.3, 0.1, 0.018); seg(cx - 0.05, -0.2, 0.018, 0.2); seg(cx + 0.05, -0.2, 0.018, 0.2); });
  logo.scale.setScalar(0.87);

  const area = new THREE.Group();
  area.add(logo);
  area.position.z = phone ? (2.25 * -BASE) / 0.8 : (1.5 * -BASE) / 0.8;
  area.rotation.set(-0.2, 0, -0.1);
  const field = new THREE.Group();
  field.add(area);
  const layer = new THREE.Group();
  layer.position.y = 0.2;
  layer.add(field);
  scene.add(layer);

  scene.add(new THREE.AmbientLight(C.ink.color, 0.05));
  const spot = new THREE.PointLight(C.ink.color, 3.4, 4, 1.2);
  spot.position.set(0, 0.3, -0.6);
  scene.add(spot);
  const rim = new THREE.PointLight(C.ink.color, 2.2, 6, 1.6);
  rim.position.set(-1.6, 1.2, -1.2);
  scene.add(rim);
  const under = new THREE.PointLight(C.ink.color, 0.9, 5, 2);
  under.position.set(1.4, -1.2, -0.8);
  scene.add(under);

  // Gold dust — three groups of 300 particles slowly orbit inside a sphere of radius base. After entering, it shows in 1s after a 2s wait
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uAlpha: { value: 0 }, uSize: { value: (phone ? 6 : 3) * Math.min(devicePixelRatio, 2) } },
    vertexShader: "attribute vec3 colors; attribute float sizes; varying vec3 vC; uniform float uSize; void main(){ vC = colors; gl_PointSize = uSize * sizes; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec3 vC; uniform float uAlpha; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vC, uAlpha * smoothstep(0.5, 0.0, d)); }",
  });
  const dust = [];
  for (let k = 0; k < (phone ? 1 : 3); k++) {
    const pos = [], col = [], size = [];
    for (let i = 0; i < (phone ? 100 : 300); i++) {
      const t = Math.acos(2 * Math.random() - 1), s = 2 * Math.random() * Math.PI, r = Math.cbrt(Math.random()) * BASE;
      pos.push(Math.sin(t) * Math.cos(s) * r, Math.sin(t) * Math.sin(s) * r, Math.cos(t) * r);
      const lift = 0.5 * Math.random();
      col.push(C.accent.color.r + lift, C.accent.color.g + lift, C.accent.color.b + lift);
      size.push(0.4 + Math.random() * 0.6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("colors", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("sizes", new THREE.Float32BufferAttribute(size, 1));
    const pts = new THREE.Points(g, dustMat);
    pts.position.z = -BASE;
    pts.userData.axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    scene.add(pts);
    dust.push(pts);
  }

  // ───────── Photo wall (artist · info) and group photo panels (special · goods · news · sponsors) — placeholder photos drawn on canvas ─────────
  const texFrom = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  };
  const person = (ctx, cx, base, s, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(cx, base - s * 1.55, s * 0.32, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.75, base);
    ctx.quadraticCurveTo(cx - s * 0.8, base - s * 1.05, cx - s * 0.2, base - s * 1.12);
    ctx.lineTo(cx + s * 0.2, base - s * 1.12);
    ctx.quadraticCurveTo(cx + s * 0.8, base - s * 1.05, cx + s * 0.75, base);
    ctx.closePath();
    ctx.fill();
  };
  const label = (ctx, text, x, y, size, color) => {
    ctx.font = `400 ${size}px ${fonts.sans}`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };
  const portraitTex = [0, 1, 2, 3].map((k) => texFrom(384, 448, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w * 0.45, h * 0.35, 20, w * 0.5, h * 0.5, h * 0.75);
    g.addColorStop(0, mixCss(C.accent, C.paper, 0.15));
    g.addColorStop(1, mixCss(C.accent, C.bg, 0.55));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    person(ctx, w * (0.46 + k * 0.03), h * 1.02, h * (0.42 + (k % 2) * 0.05), mixCss(C.bg, C.accent, 0.38));
    label(ctx, "Person solo shot · Ochre backdrop · Waist-up · Portrait 6:7", 14, h - 16, 15, C.ink.css);
  }));
  const bandTex = texFrom(2048, 128, (ctx, w, h) => {
    ctx.fillStyle = mixCss(C.bg, C.ink, 0.06);
    ctx.fillRect(0, 0, w, h);
    const names = ["ARTIST 01", "LOGO", "ARTIST 02", "ARTIST 03", "LOGO", "ARTIST 04", "ARTIST 05"];
    const faces = [fonts.label, fonts.display, fonts.black];
    let x = 30;
    names.forEach((n, i) => {
      if (n === "LOGO") {
        ctx.strokeStyle = C.ink.css; ctx.lineWidth = 3; ctx.strokeRect(x, 30, 120, 68);
        label(ctx, "LOGO", x + 22, 78, 34, C.ink.css);
        x += 170;
        return;
      }
      ctx.font = `400 78px ${faces[i % 3]}`;
      ctx.fillStyle = mixCss(C.ink, C.bg, i % 2 ? 0.15 : 0.35);
      ctx.fillText(n, x, 96);
      x += ctx.measureText(n).width + 60;
    });
  });
  bandTex.wrapS = THREE.RepeatWrapping;
  const groupTex = texFrom(1600, 1000, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, mixCss(C.accent, C.paper, 0.2));
    g.addColorStop(0.5, mixCss(C.accent, C.bg, 0.25));
    g.addColorStop(1, mixCss(C.accent, C.paper, 0.1));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = mixCss(C.accent, C.bg, 0.22);
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(120 + i * 180, 120 + (i % 3) * 70, 120, 34, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(60, 380); ctx.lineTo(220, 140); ctx.lineTo(380, 380); ctx.closePath(); ctx.fill();
    for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) person(ctx, 150 + i * 165 + (row % 2) * 80, 520 + row * 150, 90 - row * 4, mixCss(C.bg, C.accent, 0.34 + row * 0.06));
    label(ctx, "Group photo · about 30 people in front of a gold-leaf folding screen · frontal · landscape 16:10", 30, h - 30, 28, C.ink.css);
  });

  const wall = new THREE.Group();
  wall.position.set(0, 0, -2.2);
  wall.rotation.set(-0.06, 0.1, -0.05);
  wall.visible = false;
  scene.add(wall);
  const photoGeo = new THREE.PlaneGeometry(0.48, 0.56);
  const ROW_N = 9, STEP = 0.52, SPAN = ROW_N * STEP;
  const rows = [];
  const photos = [];
  [0.64, 0, -0.64].forEach((y, r) => {
    const row = new THREE.Group();
    row.position.y = y;
    row.userData.speed = (r % 2 ? -1 : 1) * 0.035;
    for (let i = 0; i < ROW_N; i++) {
      const m = new THREE.Mesh(photoGeo, new THREE.MeshBasicMaterial({ map: portraitTex[(i + r) % 4], transparent: true }));
      m.position.x = -SPAN / 2 + i * STEP;
      m.userData.index = r * ROW_N + i;
      row.add(m);
      photos.push(m);
    }
    wall.add(row);
    rows.push(row);
  });
  const bands = [0.32, -0.32].map((y, k) => {
    const t = bandTex.clone();
    t.needsUpdate = true;
    t.repeat.set(2, 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(SPAN, 0.09), new THREE.MeshBasicMaterial({ map: t }));
    m.position.set(0, y, 0.02);
    m.rotation.z = k ? 0.015 : -0.012;
    m.userData.speed = k ? -0.025 : 0.02;
    wall.add(m);
    return m;
  });
  const group = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshBasicMaterial({ map: groupTex }));
  group.position.set(0.32, -0.12, -2.25);
  group.visible = false;
  scene.add(group);

  // ───────── Size ─────────
  const resize = () => {
    const w = innerWidth, h = innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bgMat.uniforms.uAspect.value = w / h;
  };
  resize();
  addEventListener("resize", resize);
  // compile skips hidden things — briefly turn on the photo wall and group photo and bake them together so the screen doesn’t freeze on the first DIVE or first cursor move
  wall.visible = group.visible = true;
  renderer.compile(scene, camera);
  wall.visible = group.visible = false;

  // ───────── State ─────────
  const state = { current: "top", now: -1, entered: false, dove: false, pointer: null, light: { x: 0.5, y: 0.7 }, rot: { dest: 0, value: 0 }, stalker: { x: 0, y: 0, dx: 0, dy: 0 }, cd: 0, scroll: null };
  const lock = (ms) => { page.classList.add("is-locked"); clearTimeout(lock.t); lock.t = setTimeout(() => page.classList.remove("is-locked"), ms); };
  const logoSize = () => ({ w: innerWidth, h: innerHeight });
  const toWorld = (x, y) => ({ x: (x / innerWidth - 0.5) * camera.aspect * 0.8, y: -(y / innerHeight - 0.5) });

  // ───────── Slider ─────────
  const creative = { effect: "creative", creativeEffect: { prev: { opacity: 0, scale: 0.875 }, next: { opacity: 0, scale: 1.125 } }, speed: reduce ? 0 : 1000, allowTouchMove: false };
  const meta = new Swiper(".bf-meta__swiper", { ...creative, initialSlide: 10 });
  const titles = $$(".bf-slide__title");
  const ghost = $(".bf-ghost span");
  const titleSwiper = new Swiper(".bf-title-swiper", {
    ...creative,
    initialSlide: 9,
    pagination: { el: ".bf-dots", type: "bullets", clickable: true },
    on: {
      slideChange(sw) {
        titles.forEach((t, i) => t.classList.toggle("is-in", i === sw.activeIndex));
        ghost.textContent = (titles[sw.activeIndex]?.getAttribute("aria-label") || titles[sw.activeIndex]?.textContent || "A").trim().charAt(0);
        if (state.entered && state.now !== sw.activeIndex) {
          state.now = sw.activeIndex;
          meta.slideTo(state.now);
          moveTo(state.now);
        }
      },
    },
  });

  // Logo drag — on release it slides with inertia and sticks to the nearest section spot (ten places) and moves to that slide
  const dragTarget = document.createElement("div");
  let drag = null;
  const nearest = () => {
    let best = Infinity, idx = 0;
    const { w, h } = logoSize();
    SNAP.forEach((p, i) => { const d = Math.hypot(drag.x - p.x * w, drag.y - p.y * h); if (d < best) { best = d; idx = i; } });
    return idx;
  };
  const applyDrag = () => { const p = toWorld(gsap.getProperty(dragTarget, "x"), gsap.getProperty(dragTarget, "y")); field.position.x = p.x; field.position.y = p.y; };
  const moveTo = (i) => {
    const { w, h } = logoSize();
    gsap.to(dragTarget, { x: SNAP[i].x * w, y: SNAP[i].y * h, duration: reduce ? 0 : 1, ease: "power2.inOut", onUpdate: () => { drag?.update(); applyDrag(); } });
  };
  gsap.set(dragTarget, { x: innerWidth / 2, y: innerHeight / 2 });
  drag = Draggable.create(dragTarget, {
    type: "x,y", inertia: true, allowEventDefault: true, throwResistance: 2000, minDuration: 0, maxDuration: 2, overshootTolerance: 1, edgeResistance: 0.65,
    trigger: canvas,
    snap: { x: () => { const i = nearest(); drag.userData = i; return SNAP[i].x * innerWidth; }, y: () => SNAP[drag.userData ?? 0].y * innerHeight },
    onDrag: applyDrag, onThrowUpdate: applyDrag,
    onRelease() { if (state.entered && state.current === "top" && drag.userData != null && drag.userData !== state.now) titleSwiper.slideTo(drag.userData); },
    onClick(e) { if (state.current === "top" && state.entered) clickLogo(e); },
  })[0];
  drag.disable();
  const ray = new THREE.Raycaster();
  const pick = (e, list) => {
    const v = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(v, camera);
    return ray.intersectObjects(list, false)[0];
  };
  const clickLogo = (e) => {
    if (!pick(e, pieces.concat(plate))) return;
    const b = $$(".bf-title-swiper .swiper-slide")[state.now]?.querySelector("[data-dive]");
    b?.click();
  };

  // ───────── Entrance ─────────
  const pulse = (delay = 0) => {
    if (reduce) return;
    rgbPass.uniforms.uAmount.value = SHADER.min;
    gsap.to(rgbPass.uniforms.uAmount, { keyframes: [{ value: SHADER.max, duration: 1, delay, ease: "power2.in" }, { value: 0, duration: 1, ease: "power2.out" }] });
  };
  $(".bf-enter__btn").addEventListener("click", () => {
    if (state.entered) return;
    state.entered = true;
    lock(1000 * factor);
    gsap.to(bgMat.uniforms.uBright, { value: 1, duration: reduce ? 0 : 2, ease: "none" });
    gsap.to(layer.position, { y: 0, duration: reduce ? 0 : 1, ease: "power2.inOut" });
    gsap.to(area.position, { z: -BASE, duration: reduce ? 0 : 1, ease: "power2.inOut" });
    pulse();
    $(".bf-top").classList.add("is-unlocked");
    $(".bf-enter").classList.add("is-inactive");
    $(".bf-top__swiper").classList.add("is-active");
    $(".bf-stalker").classList.add("is-active");
    $(".bf-ghost").classList.add("is-active");
    window.bfChrome.init();
    drag.enable();
    state.now = 0;
    meta.slideTo(0);
    titleSwiper.slideTo(0, 0);
    titles.forEach((t, i) => t.classList.toggle("is-in", i === 0));
    ghost.textContent = (titles[0].getAttribute("aria-label") || "A").charAt(0);
    moveTo(0);
  });

  // ───────── DIVE — pierce through the logo into the popup page ─────────
  const popup = (key) => $(`[data-popup="${key}"]`);
  const showPage = (key) => {
    const pop = popup(key);
    if (!pop) return;
    page.dataset.current = key;
    wall.visible = WALL.includes(key);
    group.visible = !wall.visible;
    logo.visible = false;
    pop.classList.remove("is-hidden");
    requestAnimationFrame(() => pop.classList.add("is-active"));
    const box = pop.querySelector(":scope > .bf-pop__scroll");
    if (box && !phone) {
      state.scroll?.destroy();
      state.scroll = new LocomotiveScroll({ el: box, smooth: true, lerp: 0.1 });
      setTimeout(() => state.scroll?.update(), 400);
    }
  };
  const hidePage = (key) => {
    const pop = popup(key);
    if (!pop || key === "top") return;
    pop.classList.remove("is-active");
    const s = state.scroll;
    state.scroll = null;
    setTimeout(() => { s?.destroy(); if (!pop.classList.contains("is-active")) pop.classList.add("is-hidden"); }, 1000);
    $("[data-member-panel]").hidden = true;
  };
  const dive = (key) => {
    if (page.classList.contains("is-locked") || !popup(key)) return;
    lock(3000);
    window.bfChrome.closeNav();
    $(".bf-footer__logo").classList.add("is-inactive");
    drag.disable();
    const prev = state.current;
    if (prev === "top") {
      const top = $(".bf-top");
      top.classList.remove("is-unlocked", "is-active");
      $(".bf-stalker").classList.remove("is-active");
      $(".bf-ghost").classList.remove("is-active");
      setTimeout(() => top.classList.add("is-hidden"), 1000 * factor);
    } else hidePage(prev);
    setTimeout(() => { state.dove = true; lineMat.color.copy(mix(C.accent, C.bg, 0.55)); lineMat.opacity = 0.8; }, 2000);
    state.current = key;
    logo.visible = true;
    wall.visible = group.visible = false;
    const d = reduce ? 0 : 1;
    gsap.to(".bf-dark", { keyframes: [{ opacity: 0, duration: 0 }, { opacity: 1, duration: 2 * d, delay: 1 * d, ease: "none" }, { opacity: 0, duration: 0 }] });
    gsap.to(".bf-bright", { keyframes: [{ opacity: 0, duration: 0 }, { opacity: 1, duration: 0.5 * d, delay: 2.5 * d, ease: "none" }, { opacity: 0, duration: 0.75 * d, ease: "none" }] });
    gsap.to(".bf-meta", { keyframes: [{ opacity: 1, duration: 0 }, { opacity: 0, duration: 2 * d, delay: 1 * d, ease: "none" }] });
    gsap.to(field.position, { x: 0, y: 0, duration: d, ease: "power2.out" });
    gsap.to(area.rotation, { x: 0, z: 0, duration: d, ease: "power2.out" });
    gsap.to(area.position, { keyframes: [{ z: -BASE, duration: 1 * d, ease: "power2.out" }, { z: BASE / 2, duration: 2 * d, ease: "sine.in" }, { z: 1.25 * -BASE, duration: 0 }] });
    gsap.to(field.rotation, { keyframes: [{ y: 0, duration: 1 * d, ease: "power2.out" }, { y: THREE.MathUtils.degToRad(90), duration: 0, delay: 2 * d }, { y: THREE.MathUtils.degToRad(-30), duration: 2 * d, ease: "power2.out" }] });
    if (key === "artist") gsap.to(area.position, { keyframes: [{ x: 0.32, y: 0.22, duration: 1 * d, ease: "power2.out" }, { x: 0, y: 0, duration: 2 * d, delay: 2 * d, ease: "power2.out" }] });
    pulse(2);
    setTimeout(() => gsap.to(bgMat.uniforms.uColor, { value: 1, duration: 2 * d, ease: "none" }), 2001 * d);
    gsap.to(dustMat.uniforms.uAlpha, { value: 1, delay: 2 * d, duration: 1 * d, ease: "none" });
    setTimeout(() => showPage(key), 3000 * d);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dive]");
    if (!b) return;
    e.preventDefault();
    dive(b.getAttribute("data-dive"));
  });

  // Back to the start — resets the page and stands the logo up again
  $("[data-home]").addEventListener("click", () => {
    if (state.current === "top" || page.classList.contains("is-locked")) return;
    lock(1000 * factor);
    window.bfChrome.closeNav();
    hidePage(state.current);
    state.current = "top";
    page.dataset.current = "";
    wall.visible = group.visible = false;
    logo.visible = true;
    area.position.set(0, 0, -BASE);
    area.rotation.set(-0.2, 0, -0.1);
    field.rotation.set(0, 0, 0);
    lineMat.color.copy(C.ink.color);
    lineMat.opacity = 0.32;
    gsap.to(bgMat.uniforms.uColor, { value: 0, duration: reduce ? 0 : 1, ease: "none" });
    gsap.to(dustMat.uniforms.uAlpha, { value: 0, duration: reduce ? 0 : 1, ease: "none" });
    gsap.set(".bf-meta", { opacity: 1 });
    pulse();
    const top = $(".bf-top");
    top.classList.remove("is-hidden");
    requestAnimationFrame(() => top.classList.add("is-active", "is-unlocked"));
    $(".bf-stalker").classList.add("is-active");
    $(".bf-ghost").classList.add("is-active");
    $(".bf-footer__logo").classList.remove("is-inactive");
    drag.enable();
    moveTo(Math.max(0, state.now));
  });

  // If arriving with a popup name on the address (#artist·#info…), like the original (#bmsgartist etc.) it skips the entrance·DIVE and opens that page directly,
  // On PC, cover with an overlay that takes the first click (the original turns sound on with that click)
  const deep = location.hash.slice(1);
  const enterDeep = () => {
    state.entered = state.dove = true;
    state.current = deep;
    state.now = 0;
    bgMat.uniforms.uBright.value = bgMat.uniforms.uColor.value = dustMat.uniforms.uAlpha.value = 1;
    layer.position.y = 0;
    area.position.set(0, 0, 1.25 * -BASE);
    area.rotation.set(0, 0, 0);
    field.rotation.y = THREE.MathUtils.degToRad(-30);
    lineMat.color.copy(mix(C.accent, C.bg, 0.55));
    lineMat.opacity = 0.8;
    gsap.set(".bf-meta", { opacity: 0 });
    meta.slideTo(0, 0);
    titleSwiper.slideTo(0, 0);
    titles.forEach((t, i) => t.classList.toggle("is-in", i === 0));
    const top = $(".bf-top");
    top.classList.remove("is-unlocked", "is-active");
    top.classList.add("is-hidden");
    $(".bf-enter").classList.add("is-inactive");
    $(".bf-top__swiper").classList.add("is-active");
    $(".bf-footer__logo").classList.add("is-inactive");
    window.bfChrome.init();
    showPage(deep);
    if (!phone) $(".bf-begin").classList.add("is-active");
  };
  $(".bf-begin").addEventListener("click", (e) => e.currentTarget.classList.remove("is-active"));

  // Bottom NEXT: opens the menu drawer (the page folds away meanwhile)
  $$("[data-next]").forEach((b) => b.addEventListener("click", () => {
    if (page.classList.contains("is-locked")) return;
    b.classList.add("is-active");
    setTimeout(() => b.classList.remove("is-active"), 2000 * factor);
    lock(2000 * factor);
    window.bfChrome.openNav();
    hidePage(state.current);
  }));

  // Artist wall — click a photo to open that person’s intro panel
  const member = $("[data-member-panel]");
  const clickWall = (e) => {
    if (!pick(e, photos)) return;
    member.hidden = false;
    member.querySelector("[data-fx~='stretch-blur-in']")?.classList.remove("is-in");
    requestAnimationFrame(() => member.querySelector("[data-fx~='stretch-blur-in']")?.classList.add("is-in"));
  };
  $("[data-member-close]").addEventListener("click", () => { member.hidden = true; });
  canvas.addEventListener("click", (e) => { if (state.current === "artist" && !drag.isDragging) clickWall(e); });

  // The original casts a ray at the cursor spot every frame, lifts the hit photo forward and grows it to 1.125× and -2° in .25s, then returns it in .125s on leaving
  let hovered = null;
  const lift = (m, on) => {
    const h = (m.userData.lift ??= { z: 0, r: 0, s: 1 });
    m.renderOrder = on ? 1 : 0;
    gsap.to(h, {
      z: on ? 0.01 : 0, r: on ? -2 : 0, s: on ? 1.125 : 1, duration: on ? 0.25 : 0.125, ease: "power2.out", overwrite: true,
      onUpdate: () => { m.position.z = h.z; m.rotation.z = THREE.MathUtils.degToRad(h.r); m.scale.setScalar(h.s); },
    });
  };
  const hoverWall = () => {
    const live = !phone && !reduce && state.current === "artist" && wall.visible && member.hidden && state.pointer;
    const hit = live ? pick(state.pointer, photos)?.object || null : null;
    if (hit === hovered) return;
    if (hovered) lift(hovered, false);
    if (hit) lift(hit, true);
    hovered = hit;
    canvas.style.cursor = hit ? "pointer" : "";
  };

  $$(".bf-row__nav").forEach((b) => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(open));
    b.nextElementSibling.hidden = !open;
    state.scroll?.update();
  }));
  $$(".bf-video__play").forEach((b) => b.addEventListener("click", () => b.closest(".bf-video").classList.toggle("is-playing")));

  // ───────── Interaction — cursor label · large text · light 10% each, logo tilt 1% each (original rate). Light spins on its own before the cursor first moves and on phones ─────────
  const stalkerEl = $(".bf-stalker"), ghostEl = $(".bf-ghost"), beginEl = $(".bf-begin__stalker");
  const glow = { s: 1 };
  if (!reduce) gsap.to(glow, { s: 2, duration: 3, ease: "power2.inOut", repeat: -1, yoyo: true });
  addEventListener("pointermove", (e) => {
    if (!state.pointer) { state.stalker.x = state.light.x * innerWidth; state.stalker.y = (1 - state.light.y) * innerHeight; }
    state.pointer = { clientX: e.clientX, clientY: e.clientY };
    state.stalker.dx = e.clientX;
    state.stalker.dy = e.clientY;
    state.rot.dest = (e.clientX / innerWidth) * 2 - 1;
  });
  const cdBack = $(".bf-cd__back");
  const root = document.documentElement;
  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now();
    const dt = Math.max(1, now - last) / 16.67;
    last = now;
    const t = now / 1000;
    bgMat.uniforms.uTime.value = t;
    state.stalker.x += (state.stalker.dx - state.stalker.x) * 0.1 * dt;
    state.stalker.y += (state.stalker.dy - state.stalker.y) * 0.1 * dt;
    // The light cone and point light turn on their own regardless of the cursor, and the cursor drives only the round light (and the meta band revealed around it) —
    // The original cursor light is a DOM layer behind the logo, so it doesn’t change the background smoke or the logo shadow
    if (!reduce) {
      state.light.x = 0.5 + Math.sin(t * 0.6) * 0.32;
      state.light.y = 0.62 + Math.cos(t * 0.43) * 0.22;
    }
    const at = !phone && !reduce && state.pointer ? { x: state.stalker.x / innerWidth, y: 1 - state.stalker.y / innerHeight } : state.light;
    bgMat.uniforms.uLight.value.set(state.light.x, state.light.y);
    bgMat.uniforms.uGlowAt.value.set(at.x, at.y);
    bgMat.uniforms.uGlow.value = glow.s;
    root.style.setProperty("--bf-lx", `${(at.x * 100).toFixed(2)}%`);
    root.style.setProperty("--bf-ly", `${((1 - at.y) * 100).toFixed(2)}%`);
    const lp = toWorld(state.light.x * innerWidth, (1 - state.light.y) * innerHeight);
    spot.position.set(lp.x * 1.6, lp.y * 1.6, area.position.z + 1.05);

    if (!phone && !reduce && state.current === "top") {
      state.rot.value += (state.rot.dest - state.rot.value) * 0.01 * dt;
      area.rotation.y = state.rot.value * -0.25;
    }
    if (state.current === "extra" && cdBack) {
      state.cd += (state.rot.dest - state.cd) * 0.02 * dt;
      cdBack.style.rotate = `y ${15 * -state.cd}deg`;
    }
    const follow = `translate(${state.stalker.x}px, ${state.stalker.y}px)`;
    stalkerEl.style.transform = ghostEl.style.transform = beginEl.style.transform = follow;

    dust.forEach((p) => p.rotateOnAxis(p.userData.axis, 0.003 * dt));
    if (wall.visible) {
      const sec = dt / 60;
      rows.forEach((row) => row.children.forEach((m) => {
        m.position.x += row.userData.speed * sec;
        if (m.position.x > SPAN / 2) m.position.x -= SPAN;
        if (m.position.x < -SPAN / 2) m.position.x += SPAN;
      }));
      bands.forEach((b) => { b.material.map.offset.x += b.userData.speed * sec; });
    }
    hoverWall();
    composer.render();
  });

  // ───────── Loading — the original had to download ten 3D models and 500 images (47MB) before lifting the loader, which measured 8.5 seconds.
  // Our placeholder loads quickly, so hold it for that length (7.7 seconds minus the .75s lift) to match the Hero tempo ─────────
  const HOLD = 7700;
  const ready = Promise.all([document.fonts?.ready, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })))]);
  Promise.all([ready, new Promise((r) => setTimeout(r, reduce ? 0 : HOLD))]).then(() => {
    if (deep !== "top" && popup(deep)) enterDeep();
    page.classList.add("is-loaded");
  });
})();
