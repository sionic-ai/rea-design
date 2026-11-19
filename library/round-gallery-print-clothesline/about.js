// About — ① Line-drawn head: a bust fitted to height 1 in an orthographic camera (z 4) (revolved skin + contour·meridian ink lines). For the first 1.25s the ink fills up (1−(1−u)³) while it settles from 1.06x to full size,
// Until 62% of scroll progress p it turns from −18° to 62° (exponential follow at 7.5 per second). ② When the head stands (at latest 2.8s) three name pieces rise from 12px blur · 38% below over 1.15s (.13 sequence)
// The about text enters over 1.1s after .35s. ③ About text lines each rise from the screen bottom (+8%) to 80% and vanish from 46% to 30% (scrub .4).
// ④ Two logo bands flow only while visible and stop on hover. ⑤ Selected-work ring: turns by itself at .12 rad per second, dragging moves .9 turn per width, buttons give speed ±5.65, speed decays by .94^(60dt).
// ⑥ Ink tail: the cursor path of the last 900ms drawn as a line 3.2→.9px (thinner the faster), older nodes fainter by 1−s².
(() => {
  const SB = window.SB;
  const deg = (d) => (d * Math.PI) / 180;
  const reduce = () => SB.reduce();
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.gsap && window.SplitText) gsap.registerPlugin(SplitText);
  const col = (v) => { const [r, g, b] = SB.rgb(v); return new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace); };

  // ── ① Head ──
  function bust(stage, hero, onReady) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { onReady(); return () => {}; }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    stage.append(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    cam.position.set(0, 0, 4);
    // Head·jaw·neck·shoulder outline (height 1) — our default shape in place of the original head model
    const profile = [[0, -0.5], [0.42, -0.5], [0.45, -0.43], [0.41, -0.34], [0.2, -0.27], [0.13, -0.21], [0.12, -0.1], [0.16, -0.05], [0.2, 0.04], [0.22, 0.17], [0.21, 0.3], [0.17, 0.4], [0.1, 0.47], [0, 0.5]].map(([x, y]) => new THREE.Vector2(x, y));
    const curve = new THREE.SplineCurve(profile);
    const pts = curve.getPoints(80);
    const skinMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uNear: { value: new THREE.Color() }, uFar: { value: new THREE.Color() }, uRim: { value: 0.06 }, uTerm: { value: new THREE.Vector2(-0.5, 0.95) }, uIn: { value: 0 }, uLight: { value: new THREE.Vector3(0.78, 0.4, 0.48).normalize() } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uNear, uFar; uniform float uRim, uIn; uniform vec2 uTerm; uniform vec3 uLight; varying vec3 vN; varying vec3 vV;
        void main() {
          float lit = smoothstep(uTerm.x, uTerm.y, dot(normalize(vN), uLight));
          vec3 c = mix(uFar, uNear, lit) + uRim * pow(1.0 - max(dot(normalize(vN), vV), 0.0), 3.0);
          gl_FragColor = vec4(c, uIn);
        }`,
    });
    const skin = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), skinMat);
    const inkMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
    const seg = [];
    for (let k = 4; k < pts.length - 2; k += 4) {
      const p = pts[k];
      for (let a = 0; a < 48; a++) { const t0 = (a / 48) * Math.PI * 2, t1 = ((a + 1) / 48) * Math.PI * 2; seg.push(Math.sin(t0) * p.x, p.y, Math.cos(t0) * p.x, Math.sin(t1) * p.x, p.y, Math.cos(t1) * p.x); }
    }
    for (let m = 0; m < 16; m++) {
      const t = (m / 16) * Math.PI * 2;
      for (let k = 0; k < pts.length - 1; k++) { const p = pts[k], q = pts[k + 1]; seg.push(Math.sin(t) * p.x, p.y, Math.cos(t) * p.x, Math.sin(t) * q.x, q.y, Math.cos(t) * q.x); }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    const ink = new THREE.LineSegments(lineGeo, inkMat);
    // Paint the skin first to leave depth so the back lines are hidden and only the front lines show
    skin.renderOrder = 0;
    ink.renderOrder = 1;
    const group = new THREE.Group();
    group.add(skin, ink);
    group.position.y = -0.07;
    group.rotation.y = deg(-18);
    scene.add(group);
    const paint = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      skinMat.uniforms.uNear.value.copy(col(dark ? "color-mix(in srgb, var(--kf-danger) 70%, var(--kf-bg))" : "color-mix(in srgb, var(--kf-surface) 86%, var(--kf-dim))"));
      skinMat.uniforms.uFar.value.copy(col(dark ? "var(--kf-bg)" : "var(--kf-ink-soft)"));
      skinMat.uniforms.uRim.value = dark ? 0.18 : 0.06;
      skinMat.uniforms.uTerm.value.set(dark ? -0.12 : -0.5, dark ? 0.86 : 0.95);
      inkMat.color.copy(col(dark ? "var(--kf-bg)" : "var(--kf-ink)"));
    };
    paint();
    addEventListener("theme-change", paint);
    const fit = () => {
      const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
      renderer.setSize(w, h);
      Object.assign(cam, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
      cam.zoom = Math.min(0.86 * h, (0.94 * w) / 0.9);
      cam.updateProjectionMatrix();
    };
    fit();
    addEventListener("resize", fit);
    let turn = deg(-18), grow = reduce() ? 1 : 0, last = performance.now(), raf = 0;
    if (reduce()) { group.rotation.y = deg(26); skinMat.uniforms.uIn.value = 1; inkMat.opacity = 1; }
    const frame = (now) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      if (!reduce()) {
        const p = Math.min(1, Math.max(0, +getComputedStyle(hero).getPropertyValue("--p") || 0));
        const goal = deg(-18 + 80 * Math.min(1, p / 0.62));
        turn += (goal - turn) * (1 - Math.exp(-7.5 * dt));
        group.rotation.y = turn;
        group.position.x = 0.04 * p;
        if (grow < 1) {
          grow = Math.min(1, grow + dt / 1.25);
          const e = 1 - (1 - grow) ** 3;
          skinMat.uniforms.uIn.value = e;
          inkMat.opacity = e;
          group.scale.setScalar(1 + (1 - e) * 0.06);
        }
      }
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    onReady();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", fit); removeEventListener("theme-change", paint); renderer.dispose(); renderer.domElement.remove(); };
  }

  // ── ②③ Name · intro text ──
  function hero() {
    const el = document.querySelector(".about-hero");
    if (!el) return;
    const bio = el.querySelector(".about-bio"), stage = el.querySelector(".about-stage"), column = el.querySelector(".about-column");
    let ticking = false;
    const vars = () => {
      ticking = false;
      const room = Math.max(1, el.offsetHeight - innerHeight), y = Math.max(0, -el.getBoundingClientRect().top);
      el.style.setProperty("--p", String(Math.min(1, y / room)));
      el.style.setProperty("--t", String(Math.min(1, y / Math.max(1, 0.92 * el.offsetHeight))));
      el.style.setProperty("--sv", String(y / innerHeight));
      if (bio && stage) el.style.setProperty("--wash", `${Math.max(bio.getBoundingClientRect().top, 0.3 * innerHeight) - stage.getBoundingClientRect().top}px`);
    };
    const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(vars); } };
    vars();
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    if (column && bio) new ResizeObserver(() => { el.style.setProperty("--col-h", `${bio.offsetHeight}px`); window.ScrollTrigger?.refresh(); }).observe(bio);
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      el.setAttribute("data-open", "true");
      if (reduce() || !window.gsap) return;
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(el.querySelectorAll(".about-name-in"), { duration: 1.15, filter: "blur(12px)", opacity: 0, stagger: 0.13, yPercent: 38 })
        .from(bio, { duration: 1.1, opacity: 0 }, 0.35);
      if (window.SplitText && window.ScrollTrigger && matchMedia("(min-width: 721px)").matches) {
        const tweens = [];
        SplitText.create(bio.querySelectorAll("p"), {
          type: "lines", linesClass: "bio-line", autoSplit: true,
          onSplit(self) {
            tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
            tweens.length = 0;
            for (const line of self.lines) {
              tweens.push(gsap.fromTo(line, { "--w": 0 }, { "--w": 1, ease: "none", scrollTrigger: { trigger: line, start: "top bottom+=8%", end: "top 80%", scrub: 0.4 } }));
              tweens.push(gsap.fromTo(line, { "--wout": 1 }, { "--wout": 0, ease: "none", scrollTrigger: { trigger: line, start: "top 46%", end: "top 30%", scrub: 0.4 } }));
            }
          },
        });
      }
    };
    const stop = stage && window.THREE ? bust(stage, el, open) : (open(), () => {});
    setTimeout(open, 2800);
    return stop;
  }

  // ── ④ Logo strip ──
  function reels() {
    const win = document.querySelector(".clients-window");
    if (!win) return;
    const reels = win.querySelectorAll(".clients-reel");
    new IntersectionObserver(([e]) => reels.forEach((r) => r.toggleAttribute("data-still", !e.isIntersecting))).observe(win);
    document.querySelector(".clients-hold")?.addEventListener("click", (e) => {
      const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
      e.currentTarget.setAttribute("aria-pressed", String(on));
      reels.forEach((r) => (r.style.animationPlayState = on ? "paused" : ""));
    });
  }

  // ── ⑤ Selected work loop ──
  function ring() {
    const stage = document.querySelector(".projects-stage");
    if (!stage || !window.THREE) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.toneMapping = THREE.NoToneMapping;
    stage.append(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    cam.position.set(0, 0, 9);
    const turn = { at: 0, vel: 0, held: false };
    const KINDS = [{ w: 0.68, h: 1, d: 0.1, label: "Book cover · encyclopedia · portrait" }, { w: 0.62, h: 0.62, d: 0.62, label: "Tea box · patterned packaging" }, { w: 0.66, h: 1, d: 0.16, label: "Book covers · Three novels" }, { w: 0.7, h: 1, d: 0.08, label: "Poster · sports match" }];
    const face = (k, i) => {
      const cv = document.createElement("canvas");
      cv.width = Math.round(300 * k.w); cv.height = Math.round(300 * k.h);
      const c = cv.getContext("2d");
      c.fillStyle = SB.css(`color-mix(in srgb, var(--kf-ink) ${12 + i * 6}%, var(--kf-surface))`);
      c.fillRect(0, 0, cv.width, cv.height);
      c.strokeStyle = SB.css("color-mix(in srgb, var(--kf-ink) 26%, var(--kf-surface))");
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(cv.width, cv.height); c.moveTo(cv.width, 0); c.lineTo(0, cv.height); c.stroke();
      c.fillStyle = SB.css("var(--kf-dim)");
      c.font = `500 15px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono")}`;
      c.textAlign = "center";
      k.label.split(" · ").forEach((s, n) => c.fillText(s, cv.width / 2, cv.height / 2 - 14 + n * 20));
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const items = KINDS.map((k, i) => {
      const side = new THREE.MeshBasicMaterial({ color: col("color-mix(in srgb, var(--kf-ink) 30%, var(--kf-surface))"), toneMapped: false });
      const front = new THREE.MeshBasicMaterial({ map: face(k, i), toneMapped: false });
      const mats = [side, side, side, side, front, front];
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(k.w, k.h, k.d), mats);
      const g = new THREE.Group(); g.add(mesh); scene.add(g);
      return { g, mats: [side, front], base: [side.color.clone(), front.color.clone()], k };
    });
    let v = 1, b = 1, hover = -1, last = performance.now(), raf = 0, active = false;
    const lift = items.map((_, t) => (t % 2 ? -1 : 1) * (0.04 + 0.06 * ((43758.5453 * Math.sin(127.1 * (t + 11))) % 1 + 1) % 1));
    const fit = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      const vh = 2 * 9 * Math.tan(deg(17)), vw = vh * cam.aspect, slim = vw < 1.4 * vh;
      v = Math.min(0.5 * vh, vw * (slim ? 0.34 : 0.22));
      b = Math.min(vw * (slim ? 0.34 : 0.27), 1.55 * v);
      items.forEach(({ g }) => g.scale.setScalar(v));
    };
    fit();
    addEventListener("resize", fit);
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(-9, -9);
    const drag = { id: -1, last: 0, time: 0, moved: 0 };
    stage.addEventListener("pointerdown", (e) => { if (e.button) return; Object.assign(drag, { id: e.pointerId, last: e.clientX, time: e.timeStamp, moved: 0 }); turn.held = true; turn.vel = 0; });
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.last, step = (dx / (stage.clientWidth || 1)) * 0.9 * Math.PI * 2;
      turn.at += step;
      turn.vel = step / (Math.max(1, e.timeStamp - drag.time) / 1000);
      drag.last = e.clientX; drag.time = e.timeStamp; drag.moved += Math.abs(dx);
      if (drag.moved > 6 && !stage.hasAttribute("data-holding")) { stage.setAttribute("data-holding", "true"); stage.setPointerCapture(e.pointerId); }
    });
    const up = (e) => { if (drag.id !== e.pointerId) return; if (e.timeStamp - drag.time > 80) turn.vel = 0; drag.id = -1; turn.held = false; stage.removeAttribute("data-holding"); };
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("pointerleave", () => ptr.set(-9, -9));
    document.querySelectorAll("[data-turn]").forEach((btn) => btn.addEventListener("click", () => (turn.vel += 5.65 * +btn.dataset.turn)));
    new IntersectionObserver(([e]) => { active = e.isIntersecting; if (active && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }, { rootMargin: "50% 0px" }).observe(stage);
    function frame(now) {
      const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000));
      last = now;
      const t = reduce() ? 0 : now / 1000;
      if (!turn.held) { turn.at += (turn.vel + (reduce() ? 0 : 0.12)) * dt; turn.vel *= 0.94 ** (60 * dt); if (Math.abs(turn.vel) < 0.001) turn.vel = 0; }
      ray.setFromCamera(ptr, cam);
      const hit = ray.intersectObjects(items.map((i) => i.g.children[0]), false)[0]?.object;
      hover = hit ? items.findIndex((i) => i.g.children[0] === hit) : -1;
      stage.style.cursor = hover >= 0 && !stage.hasAttribute("data-holding") ? "pointer" : "";
      items.forEach((it, i) => {
        const o = turn.at + (i / items.length) * Math.PI * 2, near = (Math.cos(o) + 1) / 2, d = ((43758.5453 * Math.sin(127.1 * (i + 5))) % 1 + 1) % 1;
        it.g.position.set(Math.sin(o) * b, lift[i] * v + (reduce() ? 0 : Math.sin(0.5 * t + 6.3 * d) * v * 0.015), Math.cos(o) * b * 0.85);
        it.g.rotation.set(0, 0.75 * Math.sin(o), reduce() ? 0 : 0.01 * Math.sin(0.3 * t + 6.3 * d));
        const want = (hover === i ? 1.05 : 1) * v;
        it.g.scale.setScalar(it.g.scale.x + (want - it.g.scale.x) * Math.min(1, 8 * dt));
        const shade = 0.5 + 0.5 * near;
        it.mats.forEach((m, k) => m.color.copy(it.base[k]).multiplyScalar(shade));
      });
      renderer.render(scene, cam);
      raf = active ? requestAnimationFrame(frame) : 0;
    }
  }

  // ── ⑥ Ink tail ──
  function inkTrail() {
    if (!matchMedia("(pointer: fine)").matches || reduce()) return;
    const cv = document.createElement("canvas");
    cv.className = "ink-trail";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const c = cv.getContext("2d");
    let pts = [], raf = 0, W = 0, H = 0;
    const size = () => { const r = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = Math.round(W * r); cv.height = Math.round(H * r); c.setTransform(r, 0, 0, r, 0, 0); };
    size();
    addEventListener("resize", size);
    const draw = () => {
      const now = performance.now();
      pts = pts.filter((p) => now - p.t < 900);
      c.clearRect(0, 0, W, H);
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "#fff"; /* Not Skin: a difference blend needs a white line so it inverts visibly on any background */
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i - 1], p = pts[i], n = pts[i + 1], s = (now - p.t) / 900, life = 1 - s * s;
        c.globalAlpha = Math.max(0, life);
        c.lineWidth = p.w * (0.55 + 0.45 * life);
        c.beginPath(); c.moveTo((a.x + p.x) / 2, (a.y + p.y) / 2); c.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2); c.stroke();
      }
      c.globalAlpha = 1;
      raf = pts.length ? requestAnimationFrame(draw) : 0;
    };
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const prev = pts[pts.length - 1], now = performance.now();
      if (prev) {
        const d = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
        if (d < 2) return;
        const w = 3.2 - (3.2 - 0.9) * Math.min(1, d / Math.max(1, now - prev.t) / 2.4);
        pts.push({ t: now, w: prev.w + (w - prev.w) * 0.35, x: e.clientX, y: e.clientY });
      } else pts.push({ t: now, w: 3.2, x: e.clientX, y: e.clientY });
      if (!raf) raf = requestAnimationFrame(draw);
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => (pts = []));
  }

  function video() {
    const f = document.querySelector(".feature");
    f?.querySelector(".feature-cta")?.addEventListener("click", () => f.toggleAttribute("data-playing", true));
  }

  const boot = () => { hero(); reels(); ring(); inkTrail(); video(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
