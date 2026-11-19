/* Home: lens logo, following headline · video card, 3D stage, clock, fix demo, scroll film, footer burst */
(() => {
  const { reduce, clamp01, burst } = window.vb;
  const css = getComputedStyle(document.documentElement);
  const cssVar = (n, el) => (el ? getComputedStyle(el) : css).getPropertyValue(n).trim();
  const smooth = (t) => t * t * (3 - 2 * t);
  const isPhone = () => matchMedia("(max-width: 480px)").matches;

  // Skin variable to the rgb that the canvas and shader use — color-mix and oklch are received as computed values too
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.append(probe);
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  function rgbOf(value) {
    probe.style.color = value;
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(probe).color;
    pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }
  const rgbStr = (a, alpha = 1) => `rgba(${a[0]},${a[1]},${a[2]},${alpha})`;
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

  /* ── Lens logo: draws the SDF of the line logo, and only the area within 64px of the cursor (140px at the edges) is blurred by 28px and becomes 4.5 times darker ── */
  function lensMark() {
    const host = document.querySelector("[data-lens-mark]");
    if (!host || reduce || !window.THREE) return;
    const W = 366, H = 350, RANGE = 40;
    const src = document.createElement("canvas");
    src.width = W; src.height = H;
    const g = src.getContext("2d", { willReadFrequently: true });
    g.translate(40, 40);
    g.lineWidth = 6; g.lineJoin = "round"; g.strokeStyle = "#fff"; /* Not skin: white brush for distance field calculation */
    g.stroke(new Path2D("M16 135C16 -8 140 0 143 135S270 278 270 135 146 -8 143 135 16 278 16 135Z"));
    const alpha = g.getImageData(0, 0, W, H).data;
    const N = W * H, outside = new Float64Array(N), inside = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const a = alpha[i * 4 + 3] / 255;
      outside[i] = a === 1 ? 0 : a === 0 ? 1e20 : Math.max(0, 0.5 - a) ** 2;
      inside[i] = a === 1 ? 1e20 : a === 0 ? 0 : Math.max(0, a - 0.5) ** 2;
    }
    edt(outside, W, H); edt(inside, W, H);
    const tex = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const s = (H - 1 - y) * W + x, d = Math.sqrt(outside[s]) - Math.sqrt(inside[s]);
      tex[y * W + x] = Math.max(0, Math.min(255, Math.round(255 * (0.5 + d / (2 * RANGE)))));
    }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    host.append(renderer.domElement);
    host.classList.add("is-live");
    const dt = new THREE.DataTexture(tex, W, H, THREE.RedFormat, THREE.UnsignedByteType);
    dt.minFilter = dt.magFilter = THREE.LinearFilter; dt.generateMipmaps = false; dt.unpackAlignment = 1; dt.needsUpdate = true;
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 10);
    cam.position.z = 1;
    const ink = rgbOf(cssVar("--kf-bg")).map((v) => v / 255);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uField: { value: dt }, uPointer: { value: new THREE.Vector2(-9999, -9999) }, uSize: { value: new THREE.Vector2(W, H) },
        uRange: { value: RANGE }, uInk: { value: new THREE.Vector3(...ink) },
        uRadius: { value: 64 }, uSoft: { value: 140 }, uBlur: { value: 28 }, uGain: { value: 4.5 },
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `precision highp float;
        varying vec2 vUv;
        uniform sampler2D uField; uniform vec2 uPointer, uSize; uniform vec3 uInk;
        uniform float uRange, uRadius, uSoft, uBlur, uGain;
        float band(float x, float r, float s){ return 1.0 - smoothstep(r - s, r + s, x); }
        void main(){
          float dist = (texture2D(uField, vUv).r - 0.5) * 2.0 * uRange;
          float near = band(distance(vUv * uSize, uPointer), uRadius, uSoft);
          float soft = mix(0.75, uBlur, near);
          float a = clamp(band(dist, 0.0, soft) * mix(1.0, uGain, near), 0.0, 1.0);
          gl_FragColor = vec4(uInk, a);
        }`,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
    scene.add(quad);
    renderer.compile(scene, cam);
    const target = new THREE.Vector2(-9999, -9999), cur = new THREE.Vector2(-9999, -9999);
    let seen = false;
    addEventListener("pointermove", (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      if (!r.width) return;
      target.set(((e.clientX - r.left) * W) / r.width, ((r.height - (e.clientY - r.top)) * H) / r.height);
      if (!seen) { seen = true; cur.copy(target); }
    }, { passive: true });
    renderer.render(scene, cam);
    let raf = 0, last = performance.now();
    const tick = () => {
      const now = performance.now(), d = Math.min((now - last) / 1000, 0.1);
      last = now;
      const k = 1 - Math.exp(-8 * d);
      cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k;
      mat.uniforms.uPointer.value.copy(cur);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
      else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(renderer.domElement);
  }
  // Squared-distance transform (1D lower-envelope along rows and columns), used only to build the distance field
  function edt(grid, w, h) {
    const n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    const pass = (len) => {
      let k = 0;
      v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
      for (let q = 1; q < len; q++) {
        let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
      }
      k = 0;
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const dq = q - v[k]; d[q] = dq * dq + f[v[k]]; }
    };
    for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = grid[y * w + x]; pass(h); for (let y = 0; y < h; y++) grid[y * w + x] = d[y]; }
    for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = grid[y * w + x]; pass(w); for (let x = 0; x < w; x++) grid[y * w + x] = d[x]; }
  }

  /* ── Following heading · video card: extend the rail to the end of the document so sticky holds through the whole page ── */
  function rails() {
    const list = [...document.querySelectorAll("[data-sticky-rail]")];
    const fit = () => {
      const bottom = document.querySelector(".vb-page").getBoundingClientRect().bottom + scrollY;
      for (const r of list) {
        const top = r.getBoundingClientRect().top + scrollY, want = `${Math.max(0, Math.round(bottom - top))}px`;
        if (r.style.height !== want) r.style.height = want;
      }
    };
    fit();
    new ResizeObserver(fit).observe(document.body);
  }

  function eyebrow() {
    const el = document.querySelector("[data-eyebrow]"), hero = document.querySelector("[data-hero]");
    if (!el || !hero) return;
    new IntersectionObserver(([e]) => { e.isIntersecting ? el.removeAttribute("data-mark-in") : el.setAttribute("data-mark-in", ""); }).observe(hero);
    const darks = [...document.querySelectorAll('[data-tone="dark"]')];
    let raf = 0;
    const check = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const on = darks.some((d) => { const b = d.getBoundingClientRect(); return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom; });
      on ? el.setAttribute("data-on-dark", "") : el.removeAttribute("data-on-dark");
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    addEventListener("resize", check);
    check();
  }

  // The video card folds to 47px when the 3D stage reaches the card area (50px from top to card height)
  function watchCard() {
    const card = document.querySelector("[data-watch]"), stage = document.querySelector("[data-stage]");
    if (!card || !stage) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const cs = getComputedStyle(card), top = parseFloat(cs.top) || 0, h = parseFloat(cs.getPropertyValue("--watch-h")) || card.offsetHeight;
      const r = stage.getBoundingClientRect();
      const hit = r.top < top + h && r.bottom > top;
      hit ? card.setAttribute("data-collapsed", "") : card.removeAttribute("data-collapsed");
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    addEventListener("resize", check);
    check();
  }

  /* ── 3D stage: two of our app windows (editor·preview). They come in from afar to the front → the editor turns with its left side approaching, and the preview opens like a door and comes forward ── */
  function stage3d() {
    const section = document.querySelector("[data-stage]");
    if (!section) return;
    const veil = section.querySelector("[data-stage-veil]");
    const launcher = section.querySelector("[data-dock-launcher]");
    const hop = section.querySelector("[data-dock-hop]");
    const panels = [...section.querySelectorAll(".vb-stage__panel")];
    const headline = section.querySelector("[data-stage-headline]");
    let progress = 0;
    const range = () => {
      const r = section.getBoundingClientRect(), vh = innerHeight;
      return clamp01(-r.top / Math.max(1, r.height - vh));
    };

    const cssTl = window.vb.cssTimeline;
    if (veil && !cssTl) gsap.fromTo(veil, { opacity: 0.25 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true } });

    // Dock: the center icon bounces every 1.1s, sinks from height 16px to 0 at 24→33% progress, and the dot below lights up at 30→37%
    if (hop && !reduce && !cssTl) {
      hop.animate([
        { transform: "translateY(0)", easing: "cubic-bezier(.19,.82,.36,1)", offset: 0 },
        { transform: "translateY(calc(var(--dock-hop, 16px) * -1))", easing: "cubic-bezier(.6,0,.75,.25)", offset: 0.32 },
        { transform: "translateY(0)", offset: 0.64 },
        { transform: "translateY(0)", offset: 1 },
      ], { duration: 1100, iterations: Infinity });
    }
    const paintDock = (p) => {
      if (!launcher) return;
      launcher.style.setProperty("--dock-lit", clamp01((p - 0.3) / 0.07).toFixed(3));
      hop && hop.style.setProperty("--dock-hop", `${(16 * (1 - clamp01((p - 0.24) / 0.09))).toFixed(2)}px`);
    };

    // Phone: panels stick to the screen, the title slides up over the first 1/3, and card text passes sideways one screen at a time
    const paintPhone = (p) => {
      const phone = isPhone();
      if (headline) headline.style.translate = phone ? `0 ${(-clamp01(p * 3) * section.querySelector(".vb-stage__sticky").offsetHeight).toFixed(1)}px` : "";
      panels.forEach((pn, i) => {
        const c = pn.querySelector("[data-stage-card]");
        if (c) c.style.translate = phone ? `${((i - 3 * p) * 100).toFixed(2)}vw 0` : "";
      });
    };

    const scene = buildStageScene(section);
    const paint = () => {
      progress = range();
      if (!cssTl) { paintDock(progress); paintPhone(progress); }
      scene && scene.setTarget(progress);
    };
    ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top", onUpdate: paint, onRefresh: paint });
    addEventListener("resize", paint);
    paint();
  }

  function buildStageScene(section) {
    const cv = section.querySelector("[data-stage-gl]");
    if (!cv || !window.THREE) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 10, 20000);
    const C = {
      bg: rgbOf(cssVar("--kf-bg")), raised: rgbOf(cssVar("--kf-raised")), ink: rgbOf(cssVar("--kf-ink")), soft: rgbOf(cssVar("--kf-ink-soft")),
      dim: rgbOf(cssVar("--kf-dim")), accent: rgbOf(cssVar("--kf-accent")), lilac: rgbOf(cssVar("--kf-accent-soft")), dark: rgbOf(cssVar("--kf-contrast-bg")),
      go: rgbOf(cssVar("--site-go")), blue: rgbOf(cssVar("--site-blurple")),
    };
    const font = cssVar("--kf-font-display") || "sans-serif";
    // Window illustration: editor (layer list on the left, canvas in the middle, properties on the right), preview (one page of our site)
    const editorTex = canvasTexture(1240, 760, (g, w, h) => {
      g.fillStyle = rgbStr(C.bg); roundRect(g, 0, 0, w, h, 22); g.fill();
      g.fillStyle = rgbStr(mix(C.bg, C.ink, 0.06)); g.fillRect(0, 0, w, 44);
      [C.accent, C.go, C.dim].forEach((c, i) => { g.fillStyle = rgbStr(c); g.beginPath(); g.arc(26 + i * 20, 22, 6, 0, 7); g.fill(); });
      g.fillStyle = rgbStr(mix(C.bg, C.ink, 0.03)); g.fillRect(0, 44, 230, h - 44);
      for (let i = 0; i < 22; i++) { g.fillStyle = rgbStr(i === 4 ? C.go : mix(C.bg, C.ink, 0.18)); roundRect(g, 26 + (i % 3) * 14, 70 + i * 28, 120 - (i % 4) * 18, 9, 4); g.fill(); }
      g.fillStyle = rgbStr(mix(C.ink, C.dark, 0.35)); g.fillRect(230, 44, 560, h - 44);
      g.fillStyle = rgbStr(mix(C.bg, C.ink, 0.03)); g.fillRect(w - 220, 44, 220, h - 44);
      for (let i = 0; i < 14; i++) { g.fillStyle = rgbStr(mix(C.bg, C.ink, 0.16)); roundRect(g, w - 196, 74 + i * 40, 150 - (i % 3) * 30, 10, 5); g.fill(); }
      g.fillStyle = rgbStr(C.blue); roundRect(g, w - 196, 30 + 14, 70, 22, 6); g.fill();
    });
    const previewTex = canvasTexture(560, 700, (g, w, h) => {
      g.fillStyle = rgbStr(C.bg); roundRect(g, 0, 0, w, h, 16); g.fill();
      const sky = g.createLinearGradient(0, 0, 0, 300);
      sky.addColorStop(0, rgbStr(mix(C.dim, C.ink, 0.25))); sky.addColorStop(0.55, rgbStr(mix(C.accent, C.raised, 0.4))); sky.addColorStop(1, rgbStr(mix(C.soft, C.ink, 0.3)));
      g.save(); roundRect(g, 14, 14, w - 28, 300, 12); g.clip(); g.fillStyle = sky; g.fillRect(0, 0, w, 320); g.restore();
      g.strokeStyle = rgbStr(C.bg); g.lineWidth = 3;
      g.stroke(new Path2D("M250 90c0-30 30-30 30-3s30 27 30 0-30-27-30 3-30 30-30 0Z"));
      g.fillStyle = rgbStr(C.bg); g.font = `900 34px ${font}`; g.fillText("LOGO", 30, 270);
      g.fillStyle = rgbStr(C.accent); g.font = `900 40px ${font}`; g.fillText("A BIG LINE SET", 30, 372);
      g.fillStyle = rgbStr(C.accent); g.font = `600 18px ${font}`; g.fillText("Dear Reader", 200, 430);
      for (let i = 0; i < 5; i++) { g.fillStyle = rgbStr(mix(C.bg, C.soft, 0.45)); roundRect(g, 70 + (i % 2) * 20, 456 + i * 22, 400 - (i % 2) * 40, 9, 4); g.fill(); }
      g.fillStyle = rgbStr(C.lilac); roundRect(g, 30, 600, 140, 26, 6); g.fill();
      g.fillStyle = rgbStr(C.dark); g.beginPath(); g.arc(w - 40, h - 40, 9, 0, 7); g.fill();
    });
    const card = (tex, w, h) => {
      const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      return mesh;
    };
    const group = new THREE.Group();
    const editor = card(editorTex, 1240, 760);
    const preview = card(previewTex, 560, 700);
    // The preview window rotates around its left edge as a hinge
    const hinge = new THREE.Group();
    preview.position.x = 280;
    hinge.add(preview);
    group.add(editor, hinge);
    scene.add(group);
    const shadowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...C.dark.map((v) => v / 255)), transparent: true, opacity: 0.18 });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(580, 720), shadowMat);
    shadow.position.set(286, -14, -1);
    hinge.add(shadow);

    let w = 1, h = 1, scale = 1;
    const size = () => {
      const r = cv.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      // Wide screens cover-fill the 1920×1080 scene, tall screens shrink so the editor window is 85% of the width (original phone screen)
      scale = w / h < 1.2 ? (w * 0.85) / 1240 : Math.max(w / 1920, h / 1080);
      const visH = h / scale;
      cam.aspect = w / h;
      cam.position.set(0, 0, visH / 2 / Math.tan((cam.fov * Math.PI) / 360));
      cam.updateProjectionMatrix();
    };
    size();
    new ResizeObserver(size).observe(cv);
    renderer.compile(scene, cam);

    // Progress 0.08→0.30 enters from depth 1300 to the front, 0.55→0.80 turns around, 0.80→1 the preview comes forward large
    const entryZ = Math.min(1300, Math.max(330, innerWidth * 0.69)) / Math.max(scale, 0.0001);
    const pose = (p) => {
      const enter = smooth(clamp01((p - 0.08) / 0.22));
      const turn = smooth(clamp01((p - 0.55) / 0.25));
      const push = smooth(clamp01((p - 0.8) / 0.2));
      return {
        vis: enter,
        gz: -entryZ * 1.6 * (1 - enter), gx: -40 - 120 * turn - 80 * push, gy: 30,
        ery: 0.36 * turn + 0.08 * push,
        hx: -60 + 140 * turn + 160 * push, hz: 4 + 300 * turn + 520 * push, hry: -0.42 * turn - 0.12 * push,
      };
    };
    let target = 0, cur = 0, mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0, last = performance.now();
    addEventListener("pointermove", (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
    const render = () => {
      const now = performance.now(), dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      last = now;
      cur += (target - cur) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - cur) < 1e-4) cur = target;
      mx += (tmx - mx) * (1 - Math.exp(-dt * 4)); my += (tmy - my) * (1 - Math.exp(-dt * 4));
      const P = pose(reduce ? 0.5 : cur);
      group.position.set(P.gx, P.gy, P.gz);
      group.rotation.set(my * 0.06, mx * 0.08, 0);
      editor.rotation.y = P.ery;
      editor.material.opacity = P.vis;
      preview.material.opacity = P.vis;
      shadowMat.opacity = 0.18 * P.vis;
      hinge.position.set(P.hx, -20, P.hz);
      hinge.rotation.y = P.hry;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(render);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(render); } }
      else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(cv);
    return { setTarget: (p) => { target = p; } };
  }

  function canvasTexture(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w * 2; c.height = h * 2;
    const g = c.getContext("2d");
    g.scale(2, 2);
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

  /* ── Clock: section progress is one turn of the hand, progress/.86 maps to 00:00→04:43 and eight steps ── */
  function clock() {
    const sec = document.querySelector("[data-clock]");
    if (!sec) return;
    const ticks = sec.querySelector("[data-clock-ticks]");
    if (ticks) {
      let d = "";
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2, big = i % 10 === 0, r1 = 186, r2 = big ? 172 : 180;
        d += `M${(188 + Math.sin(a) * r1).toFixed(2)} ${(188 - Math.cos(a) * r1).toFixed(2)}L${(188 + Math.sin(a) * r2).toFixed(2)} ${(188 - Math.cos(a) * r2).toFixed(2)}`;
      }
      ticks.innerHTML = `<path d="${d}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
    }
    const m = sec.querySelector("[data-clock-m]"), s1 = sec.querySelector("[data-clock-s1]"), s2 = sec.querySelector("[data-clock-s2]");
    const steps = [...sec.querySelectorAll(".vb-step")];
    const fmt = (t) => { const r = t % 60; return [String(Math.floor(t / 60)).padStart(2, "0"), String(Math.floor(r / 10)), String(r % 10)]; };
    if (reduce) { sec.style.setProperty("--clock-turn", "1"); const [a, b, c] = fmt(283); m.textContent = a; s1.textContent = b; s2.textContent = c; steps.forEach((s) => (s.dataset.state = "done")); return; }
    let shown = -1, raf = 0;
    const paint = () => {
      raf = 0;
      const r = sec.getBoundingClientRect(), vh = innerHeight, span = r.height - vh;
      const p = span > 1 ? clamp01(-r.top / span) : clamp01((vh - r.top) / (vh + r.height));
      sec.style.setProperty("--clock-turn", p.toFixed(4));
      const u = clamp01(p / 0.86), t = Math.floor(283 * u);
      if (t !== shown) { shown = t; const [a, b, c] = fmt(t); m.textContent = a; s1.textContent = b; s2.textContent = c; }
      const k = u * steps.length;
      steps.forEach((s, i) => { const v = k - i, st = v <= 0 ? "todo" : v < 1 ? "active" : "done"; if (s.dataset.state !== st) s.dataset.state = st; });
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    addEventListener("resize", paint);
    paint();
  }

  /* ── Fix demo: while the target’s center passes from 90% to 50% of the screen, cursor moves (0~.68), press (.64~.82), reveal (.74~1) ── */
  function tune() {
    const sec = document.querySelector("[data-tune]"), target = sec && sec.querySelector("[data-tune-target]");
    if (!sec || !target) return;
    const chip = sec.querySelector("[data-tune-chip]");
    const chipW = () => {
      if (!chip) return;
      const keep = chip.style.cssText;
      chip.style.cssText = "transition:none;max-width:none;width:max-content;padding-left:7.83px;padding-right:7.83px;flex-shrink:0";
      const w = chip.offsetWidth;
      chip.style.cssText = keep;
      sec.style.setProperty("--chip-w", `${Math.ceil(w) + 8}px`);
    };
    chipW();
    if (reduce) { sec.style.setProperty("--cursor-move", "1"); sec.style.setProperty("--reveal", "1"); sec.dataset.selected = "true"; return; }
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = target.getBoundingClientRect(), vh = innerHeight, c = r.top + r.height / 2, s = 0.9 * vh;
      const d = clamp01((s - c) / (s - 0.5 * vh));
      const move = smooth(clamp01(d / 0.68)), click = d > 0.64 && d < 0.82 ? Math.sin(((d - 0.64) / 0.18) * Math.PI) : 0, reveal = smooth(clamp01((d - 0.74) / 0.26));
      sec.style.setProperty("--cursor-move", move.toFixed(4));
      sec.style.setProperty("--cursor-click", click.toFixed(4));
      sec.style.setProperty("--reveal", reveal.toFixed(4));
      sec.dataset.selected = reveal > 0.6 ? "true" : "false";
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    addEventListener("resize", () => { chipW(); paint(); });
    paint();
  }

  /* ── Scroll film: as the stage entry progress goes .6→1 the card (996px, 15px rounded) grows to full screen (inOutCubic),
        The picture number follows progress/.96 by 1-.78^(dt/16.7) each frame. Our canvas draws the picture for each number ── */
  function film() {
    const track = document.querySelector("[data-film]");
    if (!track) return;
    const stage = track.querySelector(".vb-film__stage"), media = track.querySelector("[data-film-media]"), cv = track.querySelector("[data-film-canvas]");
    const ctx = cv.getContext("2d", { alpha: false });
    const P = {
      dark: rgbOf(cssVar("--kf-contrast-bg")), ink: rgbOf(cssVar("--kf-contrast-ink")), blue: rgbOf(cssVar("--site-blurple")), accent: rgbOf(cssVar("--kf-accent")),
      sage: rgbOf(cssVar("--site-sage")), ochre: rgbOf(cssVar("--site-ochre")), rose: rgbOf(cssVar("--site-rose")), bg: rgbOf(cssVar("--kf-bg")),
      soft: rgbOf(cssVar("--kf-ink-soft")), dim: rgbOf(cssVar("--kf-dim")), lilac: rgbOf(cssVar("--kf-accent-soft")),
    };
    const font = cssVar("--kf-font-display") || "sans-serif";
    let spec = null, shown = -1, cur = -1, raf = 0, last = 0, vw = 0, vh = 0;
    const pickSpec = () => (isPhone() ? { count: 218, w: 864, h: 1536 } : { count: 222, w: 1536, h: 864 });
    const resize = () => {
      vw = stage.clientWidth; vh = stage.clientHeight;
      const s = pickSpec();
      if (!spec || s.w !== spec.w) { spec = s; cv.width = s.w; cv.height = s.h; shown = -1; }
    };
    const grow = (e) => {
      const n = Math.min(996, vw - 120), nh = n * (560 / 996);
      media.style.setProperty("--media-w", `${n + (vw - n) * e}px`);
      media.style.setProperty("--media-h", `${nh + (vh - nh) * e}px`);
      media.style.setProperty("--media-r", `${15 * (1 - e)}px`);
    };
    const step = (now) => {
      raf = 0;
      const r = track.getBoundingClientRect();
      if (reduce) { grow(1); draw(Math.round((spec.count - 1) * 0.62)); return; }
      const dt = last ? Math.min(64, Math.max(1, now - last)) : 1000 / 60;
      last = now;
      const enter = clamp01(1 - r.top / vh), i = clamp01((enter - 0.6) / 0.4);
      grow(i < 0.5 ? 4 * i * i * i : 1 - Math.pow(-2 * i + 2, 3) / 2);
      const want = clamp01(clamp01((vh - r.top) / Math.max(1, r.height)) / 0.96);
      if (cur < 0) cur = want;
      cur += (want - cur) * (1 - Math.pow(0.78, dt / (1000 / 60)));
      if (Math.abs(want - cur) < 5e-4) cur = want;
      draw(Math.round(cur * (spec.count - 1)));
      raf = requestAnimationFrame(step);
    };
    const poster = track.querySelector("[data-film-poster]");
    const draw = (n) => {
      if (n === shown) return;
      shown = n; drawFilm(ctx, spec.w, spec.h, n / (spec.count - 1), P, font);
      if (poster && !poster.dataset.hidden) poster.dataset.hidden = "";
    };
    resize();
    grow(reduce ? 1 : 0);
    draw(0);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "150% 0px" }).observe(track);
    addEventListener("resize", () => { resize(); if (!raf) raf = requestAnimationFrame(step); }, { passive: true });
  }

  // One film section: night desert → glowing ring and curved greeting → one-line sentence → flying app tiles → melting, gathering big tile → sky turning to sunset
  function drawFilm(g, w, h, t, P, font) {
    const tall = h > w, u = Math.min(w, h) / 864;
    const dusk = smooth(clamp01((t - 0.8) / 0.16));
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, rgbStr(mix(P.dark, mix(P.dim, P.dark, 0.3), dusk)));
    sky.addColorStop(0.5, rgbStr(mix(mix(P.blue, P.dark, 0.55), mix(P.accent, P.bg, 0.25), dusk)));
    sky.addColorStop(0.62, rgbStr(mix(mix(P.blue, P.lilac, 0.25), mix(P.accent, P.soft, 0.2), dusk)));
    sky.addColorStop(1, rgbStr(mix(mix(P.blue, P.dark, 0.7), mix(P.soft, P.dark, 0.25), dusk)));
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = rgbStr(P.ink, 0.5 * (1 - dusk));
    for (let i = 0; i < 70; i++) { const x = (i * 197.3) % w, y = ((i * 89.7) % (h * 0.5)); g.fillRect(x, y, 1.6 * u, 1.6 * u); }
    const horizon = h * (tall ? 0.62 : 0.6);
    for (let k = 0; k < 3; k++) {
      g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, horizon + k * 40 * u + Math.sin(x / (180 * u) + k * 1.7 + t * 2) * 24 * u + Math.sin(x / (61 * u) + k) * 8 * u);
      g.lineTo(w, h); g.closePath();
      g.fillStyle = rgbStr(mix(mix(mix(P.blue, P.dark, 0.6 + k * 0.12), mix(P.soft, P.dark, 0.2 + k * 0.15), dusk), P.dark, 0.1)); g.fill();
    }
    const cx = w / 2, cy = h / 2;
    // Ring and curved greeting (0 ~ .24)
    const a = clamp01(t / 0.24);
    if (t < 0.3) {
      const R = (330 + 1500 * a * a * a) * u, oy = h * 0.98 + R * 0.35;
      const fade = 1 - smooth(clamp01((t - 0.17) / 0.09));
      const rim = g.createLinearGradient(cx - R, 0, cx + R, 0);
      rim.addColorStop(0, rgbStr(P.accent, fade)); rim.addColorStop(0.5, rgbStr(P.lilac, fade)); rim.addColorStop(1, rgbStr(P.sage, fade));
      g.save(); g.beginPath(); g.arc(cx, oy, R, 0, Math.PI * 2); g.fillStyle = rgbStr(mix(P.blue, P.dark, 0.62), 0.7 * fade); g.fill();
      g.lineWidth = 6 * u; g.strokeStyle = rim; g.shadowColor = rgbStr(P.lilac, fade); g.shadowBlur = 40 * u; g.stroke(); g.restore();
      const word = "Welcome to Studio";
      g.save(); g.fillStyle = rgbStr(P.ink, fade); g.font = `600 ${Math.round(82 * u * (1 + a))}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
      const span = Math.min(1.2, 0.9 / (1 + a * 2));
      for (let i = 0; i < word.length; i++) {
        const ang = -Math.PI / 2 + (i / (word.length - 1) - 0.5) * span;
        g.save(); g.translate(cx + Math.cos(ang) * (R - 70 * u), oy + Math.sin(ang) * (R - 70 * u)); g.rotate(ang + Math.PI / 2); g.fillText(word[i], 0, 0); g.restore();
      }
      g.restore();
    }
    // Centered one-line sentences
    const line = (txt, t0, t1, y = cy) => {
      const k = clamp01((t - t0) / (t1 - t0)); if (k <= 0 || k >= 1) return;
      const o = Math.min(smooth(clamp01(k / 0.25)), smooth(clamp01((1 - k) / 0.25)));
      g.save(); g.globalAlpha = o; g.fillStyle = rgbStr(P.ink); g.font = `500 ${Math.round((tall ? 64 : 58) * u)}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
      const parts = txt.split("\n"); parts.forEach((p, i) => g.fillText(p, cx, y + (i - (parts.length - 1) / 2) * 66 * u - (1 - o) * 14 * u)); g.restore();
    };
    line("Built for people\nwho make.", 0.22, 0.42);
    line("Work in the tools\nyou already use.", 0.42, 0.64);
    // Flying-in tiles (0.40 ~ 0.66)
    const fly = clamp01((t - 0.4) / 0.26);
    if (fly > 0 && fly < 1) {
      const cols = [P.blue, P.accent, P.ochre, P.sage, P.rose, P.lilac, P.bg, P.dark];
      for (let i = 0; i < 8; i++) {
        const ang = i * 0.785 + 0.4, z = (fly * 1.4 + i * 0.13) % 1.2, s = (0.4 + z * 1.6) * 110 * u, d = (180 + z * 520) * u;
        const x = cx + Math.cos(ang) * d * (tall ? 0.7 : 1.25), y = cy + Math.sin(ang) * d * 0.8;
        g.save(); g.globalAlpha = Math.min(1, z * 3) * (1 - smooth(clamp01((fly - 0.85) / 0.15)));
        g.fillStyle = rgbStr(cols[i]); g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 24 * u; /* Not skin: tile shadow */
        g.beginPath(); g.roundRect(x - s / 2, y - s / 2, s, s, s * 0.24); g.fill(); g.restore();
      }
    }
    // Big tile: a melted rainbow spins (.62~.74) then solidifies into the brand tile (.74~)
    const big = clamp01((t - 0.62) / 0.12);
    if (big > 0) {
      const s = (tall ? 300 : 330) * u * (0.8 + 0.2 * smooth(big)) * (1 - 0.12 * dusk), x = cx - s / 2, y = cy - s / 2 - 30 * u * dusk;
      const settle = smooth(clamp01((t - 0.72) / 0.08));
      g.save(); g.shadowColor = rgbStr(P.accent, 0.6 * (1 - dusk) + 0.2); g.shadowBlur = 80 * u; g.beginPath(); g.roundRect(x, y, s, s, s * 0.24);
      g.fillStyle = rgbStr(P.bg); g.fill(); g.restore();
      if (settle < 1) {
        g.save(); g.beginPath(); g.roundRect(x, y, s, s, s * 0.24); g.clip(); g.globalAlpha = 1 - settle;
        const cols = [P.accent, P.ochre, P.sage, P.blue, P.rose, P.lilac];
        for (let i = 0; i < 12; i++) {
          const ang = i * 0.52 + t * 22;
          g.fillStyle = rgbStr(cols[i % cols.length]);
          g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, s, ang, ang + 0.34); g.closePath(); g.fill();
        }
        g.restore();
      }
      g.save(); g.globalAlpha = settle; g.strokeStyle = rgbStr(P.accent); g.lineWidth = s * 0.07; g.lineJoin = "round";
      const k = s / 140; g.translate(x + s * 0.14, y + s * 0.3);
      g.stroke(new Path2D("M10 40C10 10 50 12 50 40S90 68 90 40 50 12 50 40 10 70 10 40Z".replace(/[\d.]+/g, (n) => (+n * k).toFixed(1))));
      g.restore();
    }
    line("Your work is the product.", 0.74, 1.08, cy + (tall ? 260 : 230) * u - 60 * u * dusk);
  }

  /* ── Footer: when an email is sent the field lingers as a ghost, melts early and bursts + a thank-you message. Pressing an app icon makes the icon burst as a ghost ── */
  function footer() {
    const form = document.querySelector("[data-footer-form]");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input"), mail = input.value.trim();
      const rect = form.getBoundingClientRect();
      const ghost = document.createElement("div");
      ghost.className = "vb-footer__field";
      ghost.innerHTML = `<div class="vb-footer__glass"></div>`;
      const run = () => burst({
        ghost: { node: ghost, rect, early: true },
        outro: { title: "Thank you!", note: "You’re on the list. We’ll let you know once, on opening day." },
        onCovered: () => { form.dataset.joined = "true"; input.value = ""; input.placeholder = mail ? `You’re on the list · ${mail}` : "You’re on the list"; },
      });
      if (reduce) { form.dataset.joined = "true"; input.value = ""; return; }
      run();
    });
    const logo = document.querySelector("[data-logo-burst]");
    if (!logo) return;
    let busy = false;
    const play = () => {
      if (busy || reduce) return;
      busy = true;
      const node = logo.cloneNode(true);
      node.removeAttribute("data-logo-burst"); node.removeAttribute("role"); node.removeAttribute("tabindex");
      node.style.transform = "none";
      const rect = logo.getBoundingClientRect();
      // The original loads the burst module after the press, sets up the canvas, and only then lays the curtain (measured delay 253ms) — the same gap is kept
      setTimeout(() => burst({ ghost: { node, rect }, onEnd: () => { busy = false; } }), 150);
    };
    logo.addEventListener("click", play);
    logo.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
  }

  const mm = gsap.matchMedia();
  mm.add("(min-width: 0px)", () => {
    lensMark();
    rails();
    eyebrow();
    watchCard();
    stage3d();
    clock();
    tune();
    film();
    footer();
  });
})();
