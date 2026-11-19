// Work detail — a black circle grows from the center 0 to 1.35x with scroll (scrub), covering the title, and the title is pushed up 18% later
(() => {
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const hero = document.querySelector(".dc-hero");
    const t = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } })
      .fromTo(".dc-hero__circle", { scale: 0.15 }, { scale: 1.35, ease: "none" }, 0)
      .fromTo(".dc-hero__word", { yPercent: 0 }, { yPercent: -18, ease: "none" }, 0);
    gsap.fromTo(".dc-hero__circle", { scale: 0 }, { scale: 0.15, duration: 1.2, ease: "reveal", delay: 0.2 });
    return () => t.scrollTrigger.kill();
  });
})();

// Photo plate press — redraws photo plates (hero photo·phone·side photo) as a screen-fixed WebGL plate, where the cursor spot is pressed into a Gaussian shape and catches light.
// Original values: depth .085 × min(panel height, 560px) · radius (1/e) .24 × same value · edge band .25 × same value (inside the band it isn’t pressed) ·
// Press on/off .5s expo.out · the press center moves .41 toward the cursor on every 60fps frame · light (-.09, 1, .61) strength .75 · reflection .31 (gloss 48) ·
// Sunken spots darken by .5 at .14 depth of half the screen height · camera FOV 53.4°. As in the original, no press on touch (so no panel is set up on touch screens)
(() => {
  const T = window.THREE;
  if (!T || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const frames = [...document.querySelectorAll(".dc-shot__frame, .dc-phone, .dc-side")];
  if (!frames.length) return;
  const DENT = 0.085, DENT_R = 0.24, DENT_E = 0.25, DENT_REF = 560, FOLLOW = 0.41, LIT = 0.75, SHADE = 0.5, SPEC = 0.31, GLOSS = 48, FOV = 53.4;
  let renderer;
  try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
  const canvas = renderer.domElement;
  canvas.className = "dc-gl";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(FOV, 1, 1, 10000);
  const size = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.position.z = innerHeight / 2 / Math.tan((FOV * Math.PI) / 360); camera.updateProjectionMatrix(); };
  size();
  addEventListener("resize", size);

  const vert = `
    uniform vec2 uRes; uniform vec2 uMouse; uniform float uHover, uDent, uR, uE;
    varying vec2 vUv; varying vec3 vN; varying float vZ;
    float ramp(float t, float span, float w) {
      float a = clamp(t * span / w, 0.0, 1.0), b = clamp((1.0 - t) * span / w, 0.0, 1.0);
      a = a * a * a * (a * (a * 6.0 - 15.0) + 10.0); b = b * b * b * (b * (b * 6.0 - 15.0) + 10.0);
      return a * b;
    }
    float zAt(vec2 uv) {
      if (uHover < 0.0001) return 0.0;
      vec2 d = (uv - uMouse) * uRes;
      float keep = 0.5 + 0.5 * ramp(uMouse.x, uRes.x, uE * 1.8) * ramp(uMouse.y, uRes.y, uE * 1.8);
      return -uHover * uDent * keep * exp(-dot(d, d) / (uR * uR)) * ramp(uv.x, uRes.x, uE) * ramp(uv.y, uRes.y, uE);
    }
    void main() {
      vUv = uv;
      vec3 p = vec3((uv - 0.5) * uRes, zAt(uv));
      vec2 e = vec2(1.0 / 96.0);
      vec3 px = vec3(e.x * uRes.x, 0.0, zAt(uv + vec2(e.x, 0.0)) - p.z);
      vec3 py = vec3(0.0, e.y * uRes.y, zAt(uv + vec2(0.0, e.y)) - p.z);
      vN = normalize(cross(px, py));
      vZ = p.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const frag = `
    uniform sampler2D uTex; uniform vec2 uRes; uniform float uRad, uAlpha, uHalfH;
    uniform vec3 uLight; uniform float uLit, uSpec, uGloss, uShade;
    varying vec2 vUv; varying vec3 vN; varying float vZ;
    void main() {
      vec2 px = vUv * uRes, q = min(px, uRes - px);
      if (q.x < uRad && q.y < uRad && length(vec2(uRad) - q) > uRad) discard;
      vec3 col = texture2D(uTex, vUv).rgb;
      vec3 n = normalize(vN);
      float rel = dot(n, uLight) - uLight.z;
      col *= 1.0 + uLit * min(rel, 0.0);
      col += (1.0 - col) * uLit * max(rel, 0.0);
      vec3 h = normalize(uLight + vec3(0.0, 0.0, 1.0));
      col += max(pow(max(dot(n, h), 0.0), uGloss) - pow(max(h.z, 0.0), uGloss), 0.0) * uSpec;
      float sink = clamp(-vZ / (0.14 * uHalfH), 0.0, 1.0);
      col = mix(col, vec3(0.0), uShade * sink * sink);
      gl_FragColor = vec4(col, uAlpha);
    }`;

  // Bake the placeholder art (background, diagonal X, label) onto a canvas and use it as the board’s texture, including the phone bezel and the side photo board background.
  const bake = (f) => {
    const r = f.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 2);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(r.width * k)); c.height = Math.max(1, Math.round(r.height * k));
    const g = c.getContext("2d"), fs = getComputedStyle(f);
    g.scale(k, k);
    const box = (x, y, w, h, rad) => { g.beginPath(); g.roundRect(x, y, w, h, rad); };
    const bw = parseFloat(fs.borderTopWidth) || 0;
    if (bw) { g.fillStyle = fs.borderTopColor; g.fillRect(0, 0, r.width, r.height); }
    g.fillStyle = fs.backgroundColor; g.fillRect(bw, bw, r.width - 2 * bw, r.height - 2 * bw);
    f.querySelectorAll(".wf-img").forEach((im) => {
      const b = im.getBoundingClientRect(), s = getComputedStyle(im), x = b.left - r.left, y = b.top - r.top, line = s.getPropertyValue("--wf-line").trim();
      g.save();
      box(x, y, b.width, b.height, parseFloat(s.borderTopLeftRadius) || 0); g.clip();
      g.fillStyle = s.backgroundColor; g.fillRect(x, y, b.width, b.height);
      g.strokeStyle = line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y + b.height); g.lineTo(x + b.width, y); g.moveTo(x, y); g.lineTo(x + b.width, y + b.height); g.stroke();
      if (parseFloat(s.borderTopWidth)) { g.strokeRect(x + 0.5, y + 0.5, b.width - 1, b.height - 1); }
      const label = im.dataset.label || "";
      if (label) {
        const a = getComputedStyle(im, "::after");
        g.font = `${a.fontWeight} ${a.fontSize} ${a.fontFamily}`;
        const tw = g.measureText(label).width, fz = parseFloat(a.fontSize) || 12, pw = tw + fz * 1.4, ph = fz * 1.2 + fz * 0.7;
        g.fillStyle = a.backgroundColor; g.fillRect(x + (b.width - pw) / 2, y + (b.height - ph) / 2, pw, ph);
        g.fillStyle = a.color; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, x + b.width / 2, y + b.height / 2);
      }
      g.restore();
    });
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };

  const geo = new T.PlaneGeometry(1, 1, 36, 64);
  const light = new T.Vector3(-0.09, 1, 0.61).normalize();
  const items = frames.map((f) => {
    const U = { uTex: { value: null }, uRes: { value: new T.Vector2(1, 1) }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uHover: { value: 0 }, uDent: { value: 0 }, uR: { value: 1 }, uE: { value: 1 },
      uRad: { value: parseFloat(getComputedStyle(f).borderTopLeftRadius) || 0 }, uAlpha: { value: 1 }, uHalfH: { value: innerHeight / 2 },
      uLight: { value: light }, uLit: { value: LIT }, uSpec: { value: SPEC }, uGloss: { value: GLOSS }, uShade: { value: SHADE } };
    const mesh = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: U, vertexShader: vert, fragmentShader: frag, transparent: true, depthTest: false }));
    mesh.frustumCulled = false;
    mesh.visible = false;
    scene.add(mesh);
    return { f, mesh, U, hv: { v: 0 }, w: 0, h: 0 };
  });
  // Compiling the shader on the first cursor move freezes the screen — do it ahead of time at setup
  renderer.compile(scene, camera);

  let X = null, hot = null, last = 0;
  addEventListener("pointermove", (e) => { X = e.pointerType === "touch" ? null : { x: e.clientX, y: e.clientY }; }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { X = null; });
  const go = (it, v) => gsap.to(it.hv, { v, duration: 0.5, ease: "expo.out", overwrite: true });
  const uvAt = (r) => [Math.min(1, Math.max(0, (X.x - r.left) / r.width)), Math.min(1, Math.max(0, 1 - (X.y - r.top) / r.height))];

  gsap.ticker.add((time) => {
    const steps = last ? Math.min(3, (time - last) * 60) : 1;
    last = time;
    let next = null, any = false;
    for (const it of items) {
      const r = it.f.getBoundingClientRect();
      const a = r.bottom > 0 && r.top < innerHeight && r.width > 1 ? parseFloat(getComputedStyle(it.f).opacity) : 0;
      it.mesh.visible = a > 0.001;
      if (!it.mesh.visible) continue;
      any = true;
      if (Math.abs(r.width - it.w) > 0.5 || Math.abs(r.height - it.h) > 0.5) {
        it.w = r.width; it.h = r.height;
        it.U.uTex.value?.dispose();
        it.f.classList.remove("is-gl");
        it.U.uTex.value = bake(it.f);
        it.f.classList.add("is-gl");
      }
      const v = Math.min(r.height, DENT_REF);
      it.mesh.position.set(r.left + r.width / 2 - innerWidth / 2, innerHeight / 2 - (r.top + r.height / 2), 0);
      it.U.uRes.value.set(r.width, r.height);
      it.U.uDent.value = DENT * v; it.U.uR.value = DENT_R * v; it.U.uE.value = DENT_E * v;
      it.U.uAlpha.value = a; it.U.uHalfH.value = innerHeight / 2;
      if (X && a > 0.98 && X.x >= r.left && X.x <= r.right && X.y >= r.top && X.y <= r.bottom) next = it;
      if (it === hot && X && it.hv.v > 5e-4) {
        const [u, w] = uvAt(r), m = it.U.uMouse.value, k = 1 - Math.pow(1 - FOLLOW, steps);
        m.x += (u - m.x) * k; m.y += (w - m.y) * k;
      }
      it.U.uHover.value = it.hv.v;
    }
    if (next !== hot) {
      if (hot) go(hot, 0);
      hot = next;
      if (hot) {
        if (hot.hv.v < 0.05) hot.U.uMouse.value.set(...uvAt(hot.f.getBoundingClientRect()));
        go(hot, 1);
      }
    }
    canvas.style.visibility = any ? "" : "hidden";
    if (any) renderer.render(scene, camera);
  });
})();
