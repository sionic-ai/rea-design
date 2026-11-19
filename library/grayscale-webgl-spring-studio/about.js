// About — wordmark rise and nav open, three fogged 3D rocks (our shapes), header pushed up by scroll, floating and flipping cards, service cylinder, team window.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const portrait = matchMedia("(orientation: portrait) and (max-width: 820px), (orientation: portrait) and (hover: none) and (pointer: coarse)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (name) => {
    const t = document.createElement("i");
    t.style.color = `var(${name})`;
    document.body.append(t);
    const c = getComputedStyle(t).color;
    t.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };

  /* ── Intro — text rises from 100% below tilted back 60°, and the nav strip opens over 1s ── */
  const letters = $$(".o-hero-top .o-letter svg");
  const nav = $(".o-hero-top .o-nav");
  if (reduce) { gsap.set(letters, { y: 0, yPercent: 0, rotationX: 0 }); nav.classList.add("is-open"); }
  else {
    // In the original, text stands up after the 3D stage draws the first scene (basalt3d:title, about .65s by measurement)
    const LEAD = 0.65;
    gsap.fromTo(letters, { y: 0, yPercent: 100, rotationX: 60 }, { yPercent: 0, rotationX: 0, duration: 1.4, ease: "expo.out", stagger: 0.035, delay: LEAD });
    const h = nav.scrollHeight || 22;
    nav.animate([{ height: "0px" }, { height: h + "px" }], { duration: 1000, delay: LEAD * 1000, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }).onfinish = (e) => { nav.classList.add("is-open"); e.target.cancel(); };
    // The head is pushed up 75% while the intro text rises (scrub 1)
    gsap.fromTo(".o-hero-top", { yPercent: 0 }, { yPercent: -75, ease: "none", scrollTrigger: { trigger: ".o-about", start: "top bottom", end: "top top", scrub: 1, invalidateOnRefresh: true } });
    // ”Down” arrow — starts after the intro ends (the original attaches it after the text is fully set), rests 1s, then drops 200% over 1s and exits as a new arrow comes in
    gsap.timeline({ repeat: -1, repeatDelay: 1, delay: 3 }).fromTo(".o-scroll__mask svg", { yPercent: 0 }, { yPercent: 200, duration: 1, ease: "expo.out" });
  }

  /* ── 3D rock — field of view 25°, around the anchor point (0, 0, −3.6) three rocks, four smoke puffs, four light beams, fog 3.6~7 ── */
  const stageEl = $(".o-basalt__stage");
  if (window.THREE && stageEl && !portrait.matches) {
    const mist = rgbOf("--site-mist"), ink = rgbOf("--kf-ink");
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, fine && Math.min(innerWidth, innerHeight) >= 700 ? 1.5 : 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stageEl.append(renderer.domElement);
    // As in the original, 3D appears all at once when the first section is ready (.65s as the letters stand)
    renderer.domElement.style.opacity = "0";
    let shown = -1;
    setTimeout(() => { renderer.domElement.style.opacity = "1"; shown = performance.now(); }, reduce ? 0 : 650);
    const scene = new THREE.Scene();
    const bg = new THREE.Color().setRGB(mist[0], mist[1], mist[2], THREE.SRGBColorSpace);
    scene.background = bg;
    scene.fog = new THREE.Fog(bg, 3.6, 7.0);
    const camera = new THREE.PerspectiveCamera(25, 1, 0.05, 50);
    const pivot = new THREE.Vector3(0, 0, -3.6);
    scene.add(new THREE.HemisphereLight(new THREE.Color().setRGB(...ink), new THREE.Color().setRGB(mist[0] * 0.3, mist[1] * 0.3, mist[2] * 0.3), 0.55));
    const sun = new THREE.DirectionalLight(new THREE.Color().setRGB(...ink), 0.9);
    sun.position.set(0.6, 2, 0.5);
    scene.add(sun);
    // Basalt — an icosahedron subdivided finely and carved with overlapping sine waves, stretched vertically like column joints
    const rock = (seed, stretch) => {
      const g = new THREE.IcosahedronGeometry(0.5, 4);
      const p = g.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const n = Math.sin(v.x * 7 + seed) * Math.cos(v.y * 5 - seed) * 0.08 + Math.sin(v.z * 11 + seed * 2) * 0.04 + Math.abs(Math.sin(v.y * 18 + seed)) * 0.03;
        v.multiplyScalar(1 + n);
        v.y *= stretch;
        p.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      return g;
    };
    const stone = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(Math.min(1, mist[0] * 1.15), Math.min(1, mist[1] * 1.15), Math.min(1, mist[2] * 1.15)), roughness: 0.95, metalness: 0, flatShading: true });
    const ROCKS = [{ p: [-1.5, 0.1, -4.6], r: [180, 60, 90], s: 3.4 }, { p: [1.3, 0, -3.2], r: [0, 130, -90], s: 2.9 }, { p: [-0.2, -0.62, -2.2], r: [10, 30, 0], s: 0.9 }];
    ROCKS.forEach((d, i) => {
      const m = new THREE.Mesh(rock(i * 1.7 + 0.4, 1.35), stone);
      m.position.set(...d.p);
      m.rotation.set(...d.r.map((a) => (a * Math.PI) / 180));
      m.scale.setScalar(d.s * 0.55);
      scene.add(m);
    });
    // Smoke — a noise-pattern panel drifts sideways at its own speed
    const SMOKE = [{ p: [0, -0.66, -1.7], w: 2.4, h: 0.6, op: 0.7, sp: 0.04, seed: 1 }, { p: [0.2, -0.55, -2.6], w: 3.4, h: 0.9, op: 0.5, sp: 0.028, seed: 2 }, { p: [-0.25, 0.05, -3.65], w: 1.3, h: 2.4, op: 0.32, sp: 0.02, seed: 3 }, { p: [0.6, -0.3, -3.0], w: 1.6, h: 1.2, op: 0.25, sp: 0.024, seed: 4 }];
    const smokeMats = SMOKE.map((d) => {
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uT: { value: 0 }, uSp: { value: d.sp }, uSeed: { value: d.seed }, uOp: { value: d.op }, uCol: { value: new THREE.Color().setRGB(...ink) } },
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: `
          uniform float uT, uSp, uSeed, uOp; uniform vec3 uCol; varying vec2 vUv;
          float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 17.0) * 43758.5453); }
          float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
          void main(){
            vec2 p = vUv * vec2(3.0, 2.0) + vec2(uT * uSp * 6.0, 0.0);
            float v = n(p) * 0.55 + n(p * 2.1 + 3.0) * 0.3 + n(p * 4.3 - 1.0) * 0.15;
            float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
            gl_FragColor = vec4(uCol, v * edge * uOp);
          }`,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(d.w, d.h), mat);
      m.position.set(...d.p);
      scene.add(m);
      return mat;
    });
    // Light beam — a faint diagonal band falling from above (additive blend, strength .2)
    const RAYS = [{ p: [0.12, 0.3, -4.3], w: 0.9, h: 3.4, rz: 0.08 }, { p: [0.32, 0.4, -4.5], w: 0.7, h: 3.4, rz: -0.05 }, { p: [-0.05, 0.2, -4.1], w: 0.55, h: 3.2, rz: 0.12 }, { p: [0.2, 0.3, -3.9], w: 0.4, h: 2.8, rz: 0.02 }];
    RAYS.forEach((d) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(d.w, d.h), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uCol: { value: new THREE.Color().setRGB(...ink) } },
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: "uniform vec3 uCol; varying vec2 vUv; void main(){ float a = sin(vUv.x * 3.14159) * smoothstep(0.0, 0.8, vUv.y) * 0.35; gl_FragColor = vec4(uCol * a, a); }",
      }));
      m.position.set(...d.p);
      m.rotation.z = d.rz;
      scene.add(m);
    });
    // Mouse — as in the original, takes only the cursor’s horizontal position over the panel (−1~1) and the camera orbits the reference point (.09rad at the edge, .022 sideways of the reference point).
    // Vertical input is ignored, and outside the panel it returns to center. The original’s tilt (.018) was left out because lookAt turns it back toward world up and it doesn’t show on screen
    const MOUSE = { yaw: 0.09, shift: 0.022 }, orbit = -pivot.z;
    // Touch devices with no cursor stand aside at one side (−.85) and sway slowly like the original (±.2, 0.13rad/s)
    const REST = fine ? 0 : -0.85, SWAY = 0.2;
    let aim = REST, cur = REST, tPrev = performance.now();
    if (fine && !reduce) {
      addEventListener("pointermove", (e) => {
        const r = stageEl.getBoundingClientRect();
        aim = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom ? 0 : ((e.clientX - r.left) / r.width) * 2 - 1;
      }, { passive: true });
      document.addEventListener("pointerleave", () => (aim = 0));
    }
    const look = new THREE.Vector3();
    const size = () => {
      const r = stageEl.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size);
    let live = true;
    new IntersectionObserver(([e]) => (live = e.isIntersecting)).observe(stageEl);
    const t0 = performance.now();
    const draw = () => {
      if (!live) return;
      const now = performance.now(), t = (now - t0) / 1000;
      const dt = Math.min((now - tPrev) / 1000, 0.1);
      tPrev = now;
      if (!fine && !reduce) aim = REST + Math.sin(t * 0.13) * SWAY;
      cur += (aim - cur) * (1 - Math.exp(-2 * dt));
      // On reveal the camera approaches from 1.6 behind and .12 above over 3 sec at 2^(−10t)
      const k = shown < 0 ? 0 : (now - shown) / 3000, intro = reduce || k >= 1 ? 0 : Math.pow(2, -10 * k);
      const yaw = cur * MOUSE.yaw, side = pivot.x + cur * MOUSE.shift, rad = orbit + intro * 1.6;
      camera.position.set(side + Math.sin(yaw) * rad, pivot.y + intro * 0.12, pivot.z + Math.cos(yaw) * rad);
      camera.lookAt(look.set(side, camera.position.y, pivot.z));
      smokeMats.forEach((m) => (m.uniforms.uT.value = reduce ? 0 : t));
      renderer.render(scene, camera);
    };
    gsap.ticker.add(draw);
  }

  /* ── Flipping card — starts at the bottom right of the hero and travels to the center of the Services section, spinning one and a half turns until the back face stands ── */
  const flip = $(".o-flip"), card = $(".o-flip__card");
  if (flip) {
    const st = { p: 0 };
    let vel = 0;
    const place = () => {
      const w = flip.offsetWidth, h = flip.offsetHeight;
      const x0 = innerWidth * 0.62, y0 = innerHeight * 0.66;
      const x1 = (innerWidth - w) / 2, y1 = (innerHeight - h) / 2;
      const e = gsap.parseEase("power2.inOut")(st.p);
      gsap.set(flip, { x: x0 + (x1 - x0) * e, y: y0 + (y1 - y0) * e });
      const tilt = Math.max(-1, Math.min(1, vel / 2000)) * 0.3;
      gsap.set(card, { rotationY: 540 * e, rotationZ: -8 * (1 - e) + tilt * 40, rotationX: tilt * 25 });
      flip.style.opacity = st.p >= 0.995 ? "0" : "1";
    };
    if (reduce) { st.p = 0; place(); }
    else {
      ScrollTrigger.create({
        trigger: ".o-flip-track", start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: (s) => { st.p = s.progress; vel = s.getVelocity(); place(); },
      });
      place();
    }
    addEventListener("resize", place);
  }

  /* ── Service cylinder — six words wrap around a cylinder and rotate with the scroll (scrub .5), and only the center word is sharp ── */
  const svc = $(".o-services");
  const cv = $(".o-services__canvas");
  if (svc && cv) {
    const words = $$(".o-services__list li").map((li) => li.textContent.toUpperCase());
    const g = cv.getContext("2d");
    const col = rgbOf("--kf-ink").map((v) => Math.round(v * 255));
    const font = getComputedStyle(root).getPropertyValue("--kf-font-sans").trim();
    const O = { p: 0 };
    let W = 1, H = 1, dpr = 1;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = svc.clientWidth; H = svc.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    };
    const draw = () => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const fs = Math.max(32, Math.min(112, W * 0.07));
      const step = fs * 1.05, span = step * words.length, reach = span * 0.42;
      g.font = `500 ${fs}px ${font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      words.forEach((w, j) => {
        let y = -j * step + (O.p - 0.25) * span * 2;
        y = (((y + span / 2) % span) + span) % span - span / 2;
        const d = Math.abs(y);
        const sharp = Math.pow(Math.max(0, 1 - d / reach), 3), edge = Math.min(1, Math.max(0, (span / 2 - d) / step));
        const a = (0.1 + 0.9 * sharp) * edge * edge * (3 - 2 * edge);
        // Cylinder — the farther from center, the more it is squashed vertically and tilted inward
        const ang = Math.max(-1.4, Math.min(1.4, (y / reach) * 1.2));
        g.save();
        g.translate(W / 2, H / 2 + Math.sin(ang) * reach * 0.9);
        g.transform(1, 0, -Math.sin(ang) * 0.35, Math.max(0.15, Math.cos(ang)), 0, 0);
        g.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${a.toFixed(3)})`;
        g.letterSpacing = "-0.05em";
        g.fillText(w, 0, 0);
        g.restore();
      });
    };
    size(); draw();
    addEventListener("resize", () => { size(); draw(); });
    if (!reduce) gsap.fromTo(O, { p: 0 }, { p: 1, ease: "none", onUpdate: draw, scrollTrigger: { trigger: svc, start: "top bottom", end: "bottom top", scrub: 0.5 } });
  }

  /* ── Team window — background fills up (1.2s), photo · button open from below and text lines rise. The close text follows the cursor ── */
  const pop = $(".o-popup"), close = $(".o-popup__close");
  if (pop) {
    const N = { lead: 0.18, bgIn: 0.8, bgOut: 1.2, imgIn: 1.35, imgAt: 0.08, btnAt: 0.33, textIn: 1.1, textAt: 0.45, textStep: 0.06, textRow: 0.08, textOut: 0.5, textOutStep: 0.012, imgOut: 0.9, zoomOut: 1.15, bgOutAt: 0.35 };
    const bg = { p: 0 };
    const paintBg = () => pop.style.setProperty("--o-bg", bg.p.toFixed(3));
    let open = null, busy = false, chase = false;
    const linesOf = (card) => card._lines || (card._lines = $$("[data-team-text]", card).map((el) => window.oLines(el)));
    const show = (key) => {
      const card = $(`.o-card[data-team="${key}"]`, pop);
      if (!card || busy) return;
      busy = true; open = card;
      pop.hidden = false; card.hidden = false;
      pop.classList.toggle("is-desk", fine);
      window.oLenis?.stop();
      const rows = linesOf(card);
      const cover = $(".o-card__img", card), btn = $(".o-card__btn", card);
      if (reduce) { bg.p = 1; paintBg(); gsap.set([cover, btn], { clipPath: "inset(0% 0% 0% 0%)" }); gsap.set(close, { opacity: 1 }); busy = false; return; }
      gsap.set(rows.flat(), { yPercent: 110 });
      gsap.set(cover, { scale: 1 });
      // The original raises the window .18 seconds after the press, and the close text jumps straight to the cursor position at that moment
      const tl = gsap.timeline({ delay: N.lead, onComplete: () => (busy = false) });
      gsap.set(card, { opacity: 0 });
      // The original window covers the name when the background starts filling, so the underline drops out then — before that the cursor is passed over
      gsap.set(pop, { pointerEvents: "none" });
      tl.set(card, { opacity: 1 }, 0);
      tl.set(pop, { clearProps: "pointerEvents" }, 0);
      if (fine && last) tl.set(close, { x: last.x - close.offsetWidth / 2, y: last.y - close.offsetHeight / 2 }, 0);
      tl.call(() => (chase = true), null, 0);
      tl.to(bg, { p: 1, duration: N.bgIn, ease: "power2.out", onUpdate: paintBg }, 0);
      tl.fromTo(cover, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: N.imgIn, ease: "expo.inOut" }, N.imgAt);
      tl.fromTo(btn, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: N.imgIn, ease: "expo.inOut" }, N.btnAt);
      rows.forEach((r, i) => tl.to(r, { yPercent: 0, duration: N.textIn, ease: "power4.out", stagger: N.textStep }, N.textAt + i * N.textRow));
      tl.fromTo(close, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0);
    };
    const hide = () => {
      if (!open || busy) return;
      busy = true;
      const card = open, rows = linesOf(card).flat(), cover = $(".o-card__img", card), btn = $(".o-card__btn", card);
      const done = () => { card.hidden = true; pop.hidden = true; open = null; busy = false; chase = false; window.oLenis?.start(); };
      if (reduce) { bg.p = 0; paintBg(); return done(); }
      const tl = gsap.timeline({ onComplete: done });
      tl.to(rows, { yPercent: -110, duration: N.textOut, ease: "power3.in", stagger: N.textOutStep }, 0);
      tl.to([cover, btn], { clipPath: "inset(0% 0% 100% 0%)", duration: N.imgOut, ease: "expo.inOut" }, 0.1);
      tl.to(close, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0);
      tl.to(bg, { p: 0, duration: N.bgOut, ease: "power2.inOut", onUpdate: paintBg }, N.bgOutAt);
    };
    $$("[data-team-open]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); show(a.dataset.teamOpen); }));
    close.addEventListener("click", hide);
    pop.addEventListener("click", (e) => { if (fine && !e.target.closest("a")) hide(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
    let last = null;
    addEventListener("pointerdown", (e) => (last = { x: e.clientX, y: e.clientY }), { passive: true });
    if (fine) {
      // As in the original, the close label approaches the cursor by .18 of the remaining distance each frame
      const at = { x: 0, y: 0 };
      addEventListener("pointermove", (e) => {
        if (!chase) at.x = e.clientX, at.y = e.clientY;
        last = { x: e.clientX, y: e.clientY };
      }, { passive: true });
      gsap.ticker.add(() => {
        if (!chase || !last) return;
        at.x += (last.x - at.x) * 0.18;
        at.y += (last.y - at.y) * 0.18;
        gsap.set(close, { x: at.x - close.offsetWidth / 2, y: at.y - close.offsetHeight / 2 });
      });
    }
  }
})();
