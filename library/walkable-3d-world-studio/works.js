/* Work — a carousel (three) where sixteen cards stand around a cylinder and rotate. The center card’s border glows and a spec panel overlaps.
   Wheel and drag spin with inertia, then snap to the nearest card (original inertia kept as power3.out instead of .45s back.out(1.7)). */
(() => {
  // Original entrance door loader length (from first paint until the screen settles, ms measured by motion-probe)
  Em.gateDur = 2933;
  // On the original work page the scrollbar appears .27s after entry
  Em.enterAt = { bar: 0.17, thumbFrom: "bottom" };
  const THREE = window.exports;
  const cv = document.querySelector(".wk__stage");
  const reduce = Em.reduce;
  const NAMES = Array.from({ length: 16 }, (_, i) => `Project Name ${String(i + 1).padStart(2, "0")}`);
  const LABELS = ["Dark stage light lines · Portrait", "Laptop screen · gray desk · portrait", "Green sphere · spec table · portrait", "Colorful decor still life · vertical", "Admin screen · dark room · vertical", "Indoor · Color glitch · Portrait", "Orange glowing orb · Vertical", "Person in bright office · portrait"];
  const N = NAMES.length;
  const sr = document.querySelector(".wk__sr");
  NAMES.forEach((n) => { const li = document.createElement("li"); li.innerHTML = `<a href="detail.html">${n}</a>`; sr.appendChild(li); });
  const ticks = document.querySelector(".wk__ticks");
  for (let i = 0; i < N; i++) ticks.appendChild(document.createElement("i"));
  const tickEls = [...ticks.children];
  const now = document.querySelector(".wk__now"), name = document.querySelector(".wk__name");

  // Filter drawer
  const fb = document.querySelector(".wk__filter-btn"), menu = document.querySelector(".wk__menu");
  fb.addEventListener("click", () => { const open = menu.hidden; menu.hidden = !open; fb.setAttribute("aria-expanded", String(open)); if (open) gsap.fromTo(menu, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.4, ease: Em.ease }); });
  menu.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { menu.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); menu.hidden = true; fb.setAttribute("aria-expanded", "false"); }));

  if (!THREE?.WebGLRenderer) return;
  const css = getComputedStyle(document.documentElement);
  const rgb = (n) => { const p = document.createElement("i"); p.style.color = `var(${n})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); const x = document.createElement("canvas").getContext("2d"); x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace); };
  const C = { bg: rgb("--kf-contrast-bg"), ink: rgb("--kf-contrast-ink"), neon: rgb("--site-neon"), a: rgb("--kf-accent"), soft: rgb("--kf-accent-soft") };

  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  scene.background = C.bg;
  scene.fog = new THREE.Fog(C.bg, 14, 30);
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  cam.position.set(0, 0.4, 17.5);
  cam.lookAt(0, -0.1, 0);

  // Card image: photo slot — the photo subject is written over a skin-color gradient
  const cardTex = (i) => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 340;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 256, 340);
    g.addColorStop(0, `#${C.a.clone().lerp(C.bg, 0.55).getHexString()}`); /* Not skin: value read from the skin */
    g.addColorStop(1, `#${C.soft.clone().lerp(C.bg, 0.2).getHexString()}`); /* Not skin: value read from the skin */
    x.fillStyle = g; x.fillRect(0, 0, 256, 340);
    x.fillStyle = `#${C.ink.getHexString()}`; /* Not skin: value read from the skin */
    x.font = `500 13px ${css.getPropertyValue("--kf-font-mono")}`;
    x.fillText(`Photo · ${LABELS[i % LABELS.length]}`, 14, 322);
    x.font = `300 26px ${css.getPropertyValue("--kf-font-display")}`;
    x.fillText(NAMES[i], 14, 40);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const geo = new THREE.PlaneGeometry(2.3, 3.05);
  const R = 13;
  const ring = new THREE.Group();
  const cards = [];
  const mkMat = (tex) => new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, uNeon: { value: C.neon }, uOn: { value: 0 }, uFade: { value: 1 } },
    transparent: true,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D map; uniform vec3 uNeon; uniform float uOn, uFade; varying vec2 vUv;
      float box(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main(){ vec2 p = vUv - 0.5; float d = box(p * vec2(2.3, 3.05), vec2(1.1, 1.47), 0.12);
        if (d > 0.06) discard;
        vec4 tx = texture2D(map, vUv);
        float edge = smoothstep(0.06, 0.0, abs(d + 0.015));
        vec3 col = mix(tx.rgb * (0.55 + 0.45 * uOn), uNeon, edge * (0.35 + 0.65 * uOn));
        float a = (d < 0.0 ? 1.0 : edge) * uFade;
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }`,
  });
  // As in the original, each work has a different glow border color — only the hue is rotated from the skin’s glow color
  const neonOf = (i) => C.neon.clone().offsetHSL([0, 0.42, 0.62, 0.2][i % 4], 0, 0);
  for (let i = 0; i < N; i++) {
    const tex = cardTex(i);
    const m = new THREE.Mesh(geo, mkMat(tex));
    m.material.uniforms.uNeon.value = neonOf(i);
    const refl = new THREE.Mesh(geo, mkMat(tex));
    refl.scale.y = -1; refl.position.y = -3.3; refl.material.uniforms.uFade.value = 0.18;
    const g = new THREE.Group(); g.add(m, refl);
    ring.add(g);
    cards.push({ g, m, refl });
  }
  scene.add(ring);
  // Ceiling grid and light beams
  const grid = new THREE.GridHelper(60, 40, C.neon.clone().multiplyScalar(0.25), C.ink.clone().multiplyScalar(0.12));
  grid.position.y = 4.2; scene.add(grid);
  const beamMat = new THREE.MeshBasicMaterial({ color: C.neon, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending });
  for (const x of [-7, 0, 7]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 9), beamMat); b.position.set(x, 0, -6); scene.add(b); }
  const floorGlow = new THREE.Mesh(new THREE.RingGeometry(R - 0.2, R + 0.25, 128), new THREE.MeshBasicMaterial({ color: C.neon, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = -1.65; scene.add(floorGlow);

  let pos = 0, target = 0, vel = 0, active = -1;
  const layout = () => {
    for (let i = 0; i < N; i++) {
      const a = ((i - pos) / N) * Math.PI * 2;
      const { g, m } = cards[i];
      g.position.set(Math.sin(a) * R, 0, Math.cos(a) * R - R + 6);
      g.rotation.y = a;
      const on = Math.max(0, 1 - Math.abs(((((i - pos) % N) + N + N / 2) % N) - N / 2));
      m.material.uniforms.uOn.value = on;
      g.scale.setScalar(1 + on * 0.08);
    }
    const idx = ((Math.round(pos) % N) + N) % N;
    if (idx !== active) {
      active = idx;
      tickEls.forEach((t, k) => t.classList.toggle("is-on", k === idx));
      now.textContent = String(idx + 1).padStart(2, "0");
      name.textContent = NAMES[idx];
      name._lines = null;
      if (!reduce) gsap.fromTo(Em.lines(name), { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: "expo.out" });
    }
  };
  const size = () => { const w = innerWidth, h = innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w < 700 ? 25 : 17.5; cam.updateProjectionMatrix(); };
  size(); addEventListener("resize", size);
  gsap.ticker.add(() => {
    if (!drag) {
      pos += (target - pos) * (reduce ? 1 : 0.08);
    }
    layout();
    r.render(scene, cam);
  });
  layout();

  // Interaction: wheel, drag, keys
  const wk = document.querySelector(".wk");
  let snapT = null;
  const snap = () => { clearTimeout(snapT); snapT = setTimeout(() => { target = Math.round(target); }, 140); };
  wk.addEventListener("wheel", (e) => { e.preventDefault(); target += (e.deltaY + e.deltaX) / 420; snap(); }, { passive: false });
  let drag = false, sx = 0, sp = 0, lastX = 0, lastT = 0;
  wk.addEventListener("pointerdown", (e) => { if (e.target.closest("button, a")) return; drag = true; sx = lastX = e.clientX; sp = pos; lastT = performance.now(); vel = 0; wk.classList.add("is-drag"); wk.setPointerCapture(e.pointerId); });
  wk.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const t = performance.now();
    vel = (e.clientX - lastX) / Math.max(1, t - lastT);
    lastX = e.clientX; lastT = t;
    pos = sp - (e.clientX - sx) / 260; target = pos;
  });
  const up = () => { if (!drag) return; drag = false; wk.classList.remove("is-drag"); target = Math.round(pos - vel * 2.2); };
  wk.addEventListener("pointerup", up); wk.addEventListener("pointercancel", up);
  addEventListener("keydown", (e) => { if (e.key === "ArrowRight") target = Math.round(target) + 1; if (e.key === "ArrowLeft") target = Math.round(target) - 1; });
  cv.addEventListener("dblclick", () => Em.go("detail.html"));
})();
