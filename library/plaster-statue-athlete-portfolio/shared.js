// Shared across the whole site — smooth scroll, transition curtain (Lottie), Taxi, menu box, WebGL statue and sponsor mark, section heading titles, line rise-in.
// Page motion is registered by pages.js with TS.page(name, attach), and detached and reattached whenever Taxi changes the screen.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = getComputedStyle(root);
  gsap.registerPlugin(ScrollTrigger);
  const EASE = "cubic-bezier(0.4,0,0,1)";
  const curve = (t) => { // cubic-bezier(.4,0,0,1) — the curve used 29 times in the original
    let lo = 0, hi = 1;
    for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2, x = 3 * (1 - m) * (1 - m) * m * 0.4 + m * m * m; x < t ? (lo = m) : (hi = m); }
    const m = (lo + hi) / 2; return 3 * (1 - m) * m * m + m * m * m;
  };
  const TS = (window.TS = { pages: {}, page: (name, fn) => { TS.pages[name] = fn; }, curve, reduce, lenis: null });

  // ── Smooth scroll — same Lenis 1.3.17 as the original, lerp .1
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    TS.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Transition curtain Lottie — a 40-frame line drawing of our own ball (circle) outline and two seam lines being drawn. Color comes from CSS currentColor
  const trim = (from, to) => ({ ty: "tm", s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: from, s: [0], i: { x: [0.4], y: [1] }, o: { x: [0.4], y: [0] } }, { t: to, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 });
  const stroke = { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2, lj: 2 };
  const tr = { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } };
  const seam = (sign) => ({ ty: "sh", ks: { a: 0, k: { c: false, v: [[-70 * sign, -30], [-20 * sign, 0], [-30 * sign, 72]], i: [[0, 0], [-10 * sign, -14], [0, 0]], o: [[0, 0], [10 * sign, 14], [0, 0]] } } });
  const LOTTIE = {
    v: "5.7.0", fr: 30, ip: 0, op: 60, w: 200, h: 200, nm: "ball", ddd: 0, assets: [],
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: "ball", sr: 1, ip: 0, op: 60, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 1, k: [{ t: 0, s: [-40], i: { x: [0.4], y: [1] }, o: { x: [0.4], y: [0] } }, { t: 40, s: [0] }] }, p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        { ty: "gr", it: [{ ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [150, 150] }, d: 1 }, stroke, trim(0, 34), tr] },
        { ty: "gr", it: [seam(1), stroke, trim(10, 40), tr] },
        { ty: "gr", it: [seam(-1), stroke, trim(14, 44), tr] },
      ],
    }],
  };

  // ── Transition curtain: name · one line · progress number · line art. First the number climbs 0 → 100% then lifts away bottom to top (1s, original curve .4,0,0,1)
  const veil = document.querySelector(".t-veil");
  const count = veil.querySelector(".t-veil__count");
  let anim = null;
  if (window.lottie && !reduce) anim = lottie.loadAnimation({ container: veil.querySelector(".t-veil__lottie"), renderer: "svg", loop: false, autoplay: false, animationData: LOTTIE });
  const veilIn = (dur = 0.8) => new Promise((done) => {
    root.classList.add("is-veiled");
    gsap.fromTo(veil, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: reduce ? 0 : dur, ease: EASE, onComplete: done });
  });
  const veilCount = (dur) => new Promise((done) => {
    anim?.goToAndStop(0, true); anim?.play();
    const o = { n: 0 };
    gsap.to(o, { n: 100, duration: reduce ? 0 : dur, ease: EASE, onUpdate: () => { count.textContent = Math.round(o.n) + "%"; }, onComplete: done });
  });
  const veilOut = (dur = 1, ease = EASE) => new Promise((done) => {
    gsap.to(veil, { clipPath: "inset(0% 0% 100% 0%)", duration: reduce ? 0 : dur, ease, onComplete: () => { root.classList.remove("is-veiled"); done(); } });
  });

  // Menu box: on press the box widens (.5s) and large menu text rises in one after another at .05s steps. Each text rolls through three copies to change
  const menu = document.querySelector(".t-menu");
  const menuBtn = menu.querySelector(".t-menu__top");
  const setMenu = (on) => { menu.classList.toggle("is-open", on); menuBtn.setAttribute("aria-expanded", String(on)); };
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  document.addEventListener("click", (e) => { if (!menu.contains(e.target)) setMenu(false); });
  TS.closeMenu = () => setMenu(false);

  // ── WebGL statue — in place of the original 3D figure model, a bust of basic shapes with the same silhouette proportions. Blends from plaster (bluish white) to suit and skin materials
  const canvas = document.querySelector(".t-gl canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(new THREE.Color(0, 0, 0), 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  let vw = innerWidth, vh = innerHeight, wpp = 1;
  const resize = () => {
    vw = innerWidth; vh = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh; camera.updateProjectionMatrix();
    wpp = (2 * 12 * Math.tan((30 * Math.PI) / 360)) / vh;
  };
  resize();
  addEventListener("resize", resize);
  const col = (v) => { const t = css.getPropertyValue(v).trim(); return t ? new THREE.Color(t) : new THREE.Color(0.5, 0.5, 0.5); };
  const plaster = col("--kf-accent-soft").lerp(col("--kf-bg"), 0.55);
  const suit = col("--kf-contrast-bg").lerp(col("--kf-ink"), 0.5);
  const skin = new THREE.Color(0.78, 0.6, 0.48); /* Not skin: skin material when the statue turns into a person — content of the figure drawing */
  const hair = new THREE.Color(0.24, 0.17, 0.12); /* Not skin: hair material — content of the character art */
  const racketCol = col("--kf-accent").lerp(col("--kf-ink"), 0.35);
  const mats = [];
  const dressU = { value: 0 }, invU = { value: new THREE.Matrix4() };
  const mat = (dressed) => {
    const m = new THREE.MeshStandardMaterial({ color: plaster.clone(), roughness: 0.82, metalness: 0 });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uDress = dressU;
      sh.uniforms.uInv = invU;
      sh.uniforms.uPlaster = { value: plaster };
      sh.uniforms.uDressed = { value: dressed };
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform mat4 uInv; varying vec3 vBody;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvBody = (uInv * modelMatrix * vec4(position, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>
uniform float uDress; uniform vec3 uPlaster; uniform vec3 uDressed; varying vec3 vBody;
vec3 h3(vec3 p){ p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6))); return fract(sin(p) * 43758.5453); }
vec3 cell(vec3 p){ vec3 i = floor(p), f = fract(p); float d1 = 8., d2 = 8.; float id = 0.;
  for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) for (int z = -1; z <= 1; z++) {
    vec3 g = vec3(float(x), float(y), float(z)); vec3 o = h3(i + g); float d = length(g + o - f);
    if (d < d1) { d2 = d1; d1 = d; id = o.x; } else if (d < d2) d2 = d; }
  return vec3(d1, d2, id); }`)
        .replace("#include <color_fragment>", `#include <color_fragment>
{ vec3 c = cell(vBody * 2.6);
  float th = c.z * 0.9 + 0.05; float on = step(th, uDress);
  float crack = (1.0 - smoothstep(0.0, 0.06, c.y - c.x)) * step(0.02, uDress) * step(uDress, 0.98);
  diffuseColor.rgb = mix(uPlaster, uDressed, on) * (1.0 - crack * 0.75); }`);
    };
    m.userData.dressed = dressed; mats.push(m); return m;
  };
  const mSuit = mat(suit), mSkin = mat(skin), mHair = mat(hair), mRacket = mat(racketCol);
  const statue = new THREE.Group();
  const add = (geo, m, p, s = [1, 1, 1], r = [0, 0, 0]) => { const o = new THREE.Mesh(geo, m); o.position.set(...p); o.scale.set(...s); o.rotation.set(...r); statue.add(o); return o; };
  // Original statue silhouette: a head down to the shoulders wearing a headband, head is one seventh of the body, narrow shoulders, arms crossed in front of the belly, a racket held upright in front of the chest. The torso continues long below the screen
  add(new THREE.SphereGeometry(0.19, 48, 32), mSkin, [0, 1.62, 0.01], [0.84, 1.1, 0.95]);
  add(new THREE.SphereGeometry(0.215, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.6), mHair, [0, 1.66, -0.03], [0.96, 1.02, 1.02]);
  add(new THREE.CapsuleGeometry(0.075, 0.3, 8, 16), mHair, [-0.15, 1.43, -0.07], [1, 1, 0.8], [0, 0, 0.12]);
  add(new THREE.CapsuleGeometry(0.075, 0.3, 8, 16), mHair, [0.15, 1.43, -0.07], [1, 1, 0.8], [0, 0, -0.12]);
  add(new THREE.TorusGeometry(0.188, 0.022, 12, 48), mSkin, [0, 1.71, 0.01], [0.9, 1, 1], [Math.PI / 2 - 0.18, 0, 0]);
  add(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 24), mSkin, [0, 1.38, 0]);
  add(new THREE.CapsuleGeometry(0.25, 1.25, 12, 32), mSuit, [0, 0.62, 0], [1.12, 1, 0.6]);
  add(new THREE.SphereGeometry(0.12, 20, 16), mSuit, [-0.3, 1.2, 0], [1, 0.8, 0.9]);
  add(new THREE.SphereGeometry(0.12, 20, 16), mSuit, [0.3, 1.2, 0], [1, 0.8, 0.9]);
  add(new THREE.CapsuleGeometry(0.075, 0.42, 8, 16), mSuit, [-0.36, 0.95, 0.03], [1, 1, 1], [0.2, 0, 0.1]);
  add(new THREE.CapsuleGeometry(0.075, 0.42, 8, 16), mSuit, [0.36, 0.95, 0.03], [1, 1, 1], [0.2, 0, -0.1]);
  add(new THREE.CapsuleGeometry(0.068, 0.46, 8, 16), mSuit, [-0.06, 0.72, 0.21], [1, 1, 1], [0, 0.15, 1.4]);
  add(new THREE.CapsuleGeometry(0.068, 0.46, 8, 16), mSuit, [0.06, 0.78, 0.24], [1, 1, 1], [0, -0.15, -1.45]);
  add(new THREE.SphereGeometry(0.058, 16, 12), mSkin, [0.26, 0.73, 0.27]);
  add(new THREE.SphereGeometry(0.058, 16, 12), mSkin, [-0.27, 0.8, 0.29]);
  add(new THREE.CylinderGeometry(0.022, 0.022, 0.36, 12), mRacket, [0.2, 0.86, 0.34], [1, 1, 1], [0, 0, 0.18]);
  add(new THREE.TorusGeometry(0.17, 0.02, 12, 48), mRacket, [0.12, 1.17, 0.36], [0.8, 1.15, 1], [0, 0, 0.18]);
  scene.add(statue);
  const courtTex = (() => {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 1024;
    const g = c.getContext("2d");
    g.fillStyle = "rgb(196, 92, 44)"; /* Not skin: clay court earth tone — scene content */
    g.fillRect(0, 0, 1024, 1024);
    g.strokeStyle = "rgb(250, 248, 240)"; /* Not skin: court line */
    g.lineWidth = 10;
    g.strokeRect(160, 80, 704, 1400); g.beginPath(); g.moveTo(240, 80); g.lineTo(240, 1024); g.moveTo(784, 80); g.lineTo(784, 1024); g.moveTo(240, 520); g.lineTo(784, 520); g.moveTo(512, 520); g.lineTo(512, 1024); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  })();
  const court = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: courtTex, transparent: true, opacity: 0 }));
  court.rotation.x = -Math.PI / 2;
  scene.add(court);
  scene.add(new THREE.HemisphereLight(new THREE.Color(1, 1, 1), new THREE.Color(0.27, 0.33, 0.4), 1.4));
  const key = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 2.2); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 1.4); rim.position.set(4, 2, -3); scene.add(rim);
  renderer.compile(scene, camera);

  // Sponsor marks — attached to five spots on the statue’s body (forehead band, two on the chest, wrist, racket) and follow it
  const ANCHORS = [[0, 1.72, 0.17], [0.12, 1.17, 0.38], [-0.18, 1.08, 0.15], [-0.26, 0.8, 0.34], [0.2, 0.95, 0.15]];
  const layer = document.querySelector(".t-points");
  const points = ANCHORS.map((a, i) => {
    const el = document.createElement("div");
    el.className = "t-point";
    el.innerHTML = `<span class="t-point__mark"><span></span></span><span class="t-point__box"><span class="t-mono t-yellow">Official partner</span><span class="t-mono">Brand 0${i + 1}</span></span>`;
    layer.append(el);
    return { el, a: new THREE.Vector3(...a) };
  });

  // Pose: each section’s data-pose name → screen position (x·y as screen ratio) · height (screen height ratio) · turn · skin · marker. Blends the section crossing screen center with the next one by scroll ratio
  const POSES = {
    hero: { x: 0.5, y: 0.72, h: 1.15, ry: 0.35, dress: 0, pts: 0, show: 1 },
    court: { x: 0.5, y: 0.72, h: 1.2, ry: -0.35, dress: 0, pts: 2, show: 1 },
    turn: { x: 0.5, y: 0.74, h: 1.25, ry: -2.6, dress: 1, pts: 1, show: 1 },
    off: { x: 0.46, y: 0.72, h: 1.15, ry: -5.6, dress: 1, pts: 2, show: 1 },
    back: { x: 0.46, y: 0.74, h: 1.0, ry: -7.4, dress: 1, pts: 0, show: 1 },
    intro: { x: 0.62, y: 0.62, h: 0.6, ry: -6.6, dress: 1, pts: 0, show: 1 },
    away: { x: 0.62, y: 1.9, h: 0.6, ry: -6.6, dress: 1, pts: 0, show: 0 },
    footer: { x: 0.5, y: 1.26, h: 1.37, ry: -6.28, dress: 0, pts: 0, show: 1 },
    sidehero: { x: 0.5, y: 0.72, h: 1.15, ry: 0.35, dress: 0, pts: 0, show: 1 },
    sidehero2: { x: 0.5, y: 0.72, h: 1.15, ry: 0.35, dress: 1, pts: 0, show: 1 },
    run: { x: 0.45, y: 0.5, h: 0.42, ry: 1.2, dress: 0, pts: 0, show: 1, court: 1 },
  };
  const keys = ["x", "y", "h", "ry", "dress", "pts", "show", "court"];
  Object.values(POSES).forEach((p) => { p.court = p.court || 0; });
  const now = { ...POSES.hero };
  const target = () => {
    const secs = [...document.querySelectorAll("[data-taxi-view] [data-pose]")];
    if (!secs.length) return POSES.away;
    const mid = vh / 2;
    let i = secs.findIndex((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (i < 0) i = secs[0].getBoundingClientRect().top > mid ? 0 : secs.length - 1;
    const r = secs[i].getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    const a = POSES[secs[i].dataset.pose] || POSES.away, b = POSES[(secs[i + 1] || secs[i]).dataset.pose] || a;
    const k = curve(t);
    const o = {};
    keys.forEach((n) => { o[n] = a[n] + (b[n] - a[n]) * k; });
    return o;
  };
  const tmp = new THREE.Vector3();
  let mouse = 0;
  addEventListener("pointermove", (e) => { mouse = e.clientX / vw - 0.5; });
  const stage = (y) => {
    const s = [...document.querySelectorAll("[data-taxi-view] [data-stage]")].find((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    return s?.dataset.stage;
  };
  let last = performance.now();
  gsap.ticker.add(() => {
    const t = performance.now(), dt = Math.min(0.05, Math.max(0.001, (t - last) / 1000));
    last = t;
    const goal = target();
    const k = reduce ? 1 : 1 - Math.exp(-dt * 6);
    keys.forEach((n) => { now[n] += (goal[n] - now[n]) * k; });
    // On narrow screens like phones the height shrinks to fit the screen width — the original phone statue is a bit over 70% of screen width
    const H = now.h * Math.min(vh, vw * 1.45);
    statue.visible = now.show > 0.02;
    const sc = (H / 1.91) * wpp * (0.85 + 0.15 * now.show);
    statue.scale.setScalar(sc);
    statue.position.set((now.x * vw - vw / 2) * wpp, -(now.y * vh - vh / 2) * wpp - 0.875 * sc, 0);
    statue.rotation.y = now.ry + mouse * 0.15;
    dressU.value = now.dress;
    statue.updateMatrixWorld();
    invU.value.copy(statue.matrixWorld).invert();
    court.visible = now.court > 0.01;
    if (court.visible) {
      court.material.opacity = now.court;
      court.scale.setScalar(sc / 0.12 * 0.12);
      court.position.set(statue.position.x - 0.6 * sc, statue.position.y - 0.08 * sc, -2 * sc);
      court.rotation.set(-Math.PI / 2 + 0.32, 0, 0.12);
    }
    renderer.render(scene, camera);
    statue.updateMatrixWorld();
    // A hidden marker does not move — it follows the point on the body only while visible (including the .5s fade-out)
    points.forEach((p, i) => {
      tmp.copy(p.a).applyMatrix4(statue.matrixWorld).project(camera);
      const on = statue.visible && tmp.z < 1 && i < Math.round(now.pts);
      p.el.classList.toggle("is-on", on);
      if (on) p.seen = t;
      if (on || t - (p.seen || 0) < 600) {
        const x = (tmp.x * 0.5 + 0.5) * vw, y = (-tmp.y * 0.5 + 0.5) * vh;
        p.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    });
    root.classList.toggle("nav-dark", stage(60) === "paper");
    root.classList.toggle("has-scrolled", scrollY > vh * 0.4);
  });

  // ── Paragraph line rise: each line goes from 100% below to its place inside a mask (1s · .1s stagger)
  const lines = (scope) => [...scope.querySelectorAll(".t-lines")].map((p) => {
    if (reduce) return null;
    const split = SplitText.create(p, { type: "lines", mask: "lines" });
    const tw = gsap.from(split.lines, { yPercent: 100, duration: 1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: p, start: "top 85%" } });
    return { kill: () => { tw.scrollTrigger?.kill(); tw.kill(); split.revert(); } };
  });
  // ── Signature: when it enters the screen, the line is drawn with 2s power3.out
  const signs = (scope) => [...scope.querySelectorAll(".t-sign path")].map((p) => {
    if (reduce) return null;
    const len = p.getTotalLength();
    return gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2, ease: "power3.out", scrollTrigger: { trigger: p.closest("svg"), start: "top 90%" } });
  });

  // ── Screen Attach · Detach
  let unmount = null;
  const mount = (view) => {
    unmount?.();
    const made = [...lines(view), ...signs(view)];
    const fn = TS.pages[view.dataset.page];
    const off = fn ? fn(view) : null;
    unmount = () => { made.forEach((m) => m?.scrollTrigger?.kill?.() || m?.kill?.()); off?.(); };
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  // ── page transition — Taxi 1.9.1. The curtain covers from below (.8s), numbers fill up, then it lifts upward on the new screen. On file:// the same values run curtain → navigate → lift
  const bindTaxi = () => {
    const T = window.taxi;
    if (!T || !/^https?:$/.test(location.protocol)) return false;
    class Veil extends T.Transition {
      onLeave({ done }) { TS.closeMenu(); veilIn(0.8).then(() => veilCount(0.3)).then(done); }
      onEnter({ done }) { veilOut(0.8).then(done); }
    }
    const core = new T.Core({ links: 'a[href$=".html"]:not([target]):not([data-taxi-ignore])', removeOldContent: true, allowInterruption: false, transitions: { default: Veil } });
    core.on("NAVIGATE_IN", ({ to }) => {
      TS.lenis?.scrollTo(0, { immediate: true }); scrollTo(0, 0);
      mount(to.renderer.content);
      document.querySelectorAll(".t-menu__link, .t-footer__links a").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === location.pathname.split("/").pop()));
    });
    return true;
  };
  const bindFileNav = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("data-taxi-ignore") || e.metaKey || e.ctrlKey || e.button) return;
      if (!/^[\w-]+\.html$/.test(a.getAttribute("href"))) return;
      e.preventDefault();
      TS.closeMenu();
      veilIn(0.8).then(() => veilCount(0.6)).then(() => { sessionStorage.setItem("ts-nav", "1"); location.href = a.getAttribute("href"); });
    });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href") === "#") return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    TS.lenis ? TS.lenis.scrollTo(t, { duration: 1.5 }) : t.scrollIntoView();
  });
  let taxiOn = false;
  try { taxiOn = bindTaxi(); } catch (err) { taxiOn = false; }
  if (!taxiOn) bindFileNav();

  // First load: with the curtain covering, the number climbs to 100% over 2s and the curtain lifts. When arriving via transition it lifts right away without a number
  const first = sessionStorage.getItem("ts-nav") === "1";
  sessionStorage.removeItem("ts-nav");
  mount(document.querySelector("[data-taxi-view]"));
  // The original first curtain is 1.33s (measured) — it starts lifting as soon as it opens, so the start is fast (power3.out shape). The number rises while it lifts
  if (!first) veilCount(0.6);
  veilOut(2.1, "power3.out");
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
