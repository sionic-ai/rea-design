/* Case section — a gallery spinning endlessly vertically on a light panel. Original gallery values exactly:
   Panel Width = Screen width×.6 (under 1024, depth corrected to width−50), 16:9, gap 50 (25) — starts at 100 and narrows to .085.
   Wheel ×1.2, drag ×1.5 (touch ×3), position follows at .085, and the faster the speed the more the panel rows bend like a cylinder (radius 1800, phone 600).
   On entry, bend 1→0 and opacity 0→1 over 0.75s expo, previous/next shift sideways by the screen width over 0.75s expo. */
(() => {
  const { PROJECTS, reduce, touch, EXPO, LERP } = MA;
  const THREE = window.THREE;
  const host = document.querySelector("[data-stage]");
  const layer = document.querySelector("[data-case-layer]");
  if (!THREE || !host) return;
  const N = PROJECTS.length;
  const arrival = MA.arrival();
  const loader = MA.Loader();
  const controls = MA.Controls();
  const qs = new URLSearchParams(location.search);
  let active = Math.max(0, PROJECTS.findIndex((p) => p.slug === qs.get("p")));
  // Writes the current work into the address — like the original, its own link drops out of the next links and the next work link remains
  if (!qs.get("p")) history.replaceState(null, "", `?p=${PROJECTS[active].slug}`);

  const VERT = `
uniform float uPanelRadius;
uniform float uOvalFlatness;
uniform float uMeshOffsetY;
uniform float uCurveAmount;
uniform float uEntryCurveAmount;
uniform float uEntryOvalFlatness;
varying vec2 vUv;
varying float vWorldY;
void main() {
  vec3 p = position;
  float a = p.y + uMeshOffsetY;
  vWorldY = a;
  float o = (modelMatrix * vec4(position, 1.0)).y;
  p.z += (1.0 - cos(a / uPanelRadius)) * uPanelRadius * uOvalFlatness * uCurveAmount;
  p.z += (1.0 - cos(o / uPanelRadius)) * uPanelRadius * uEntryOvalFlatness * uEntryCurveAmount;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
  const FRAG = `
uniform sampler2D map;
uniform float uAlpha;
uniform float uFadeRange;
uniform float uFadeFalloff;
uniform float uCornerRadius;
uniform vec2 uSlideSize;
varying vec2 vUv;
varying float vWorldY;
float roundMask(vec2 uv) {
  vec2 s = abs(uv - 0.5) * uSlideSize - (uSlideSize * 0.5 - uCornerRadius);
  float d = length(max(s, 0.0)) + min(max(s.x, s.y), 0.0) - uCornerRadius;
  return 1.0 - smoothstep(-1.0, 1.0, d);
}
void main() {
  vec4 tex = texture2D(map, vUv);
  float f = 1.0 - smoothstep(uFadeRange, uFadeRange + uFadeFalloff, abs(vWorldY));
  gl_FragColor = vec4(tex.rgb, tex.a * uAlpha * f * roundMask(vUv));
}`;

  const pal = MA.palette();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(new THREE.Color(...MA.rgb("--kf-contrast-bg")), 1);
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);

  const G = {
    w: 1, h: 1, small: false, mobile: false, D: 1, z: 0, itemW: 1, itemH: 1, gapT: 50, gap: 100, radius: 1800,
    target: 0, entryCurve: 1, entryAlpha: 0, t0: performance.now(), dragging: false, startY: 0, startT: 0, busy: false,
  };
  let cur = null, out = null;

  const LABELS = [
    ["Site hero screen recording · big title and button", "16:9 looping video"],
    ["Product list section capture · light background", "16:9 still photo"],
    ["Detail screen scroll recording", "16:9 looping video"],
    ["Composite of three mobile screens side by side", "16:9 still photo"],
    ["Brand photo · outdoors in daytime sunlight · landscape composition", "16:9 still photo"],
    ["Motion detail · menu open recording", "16:9 looping video"],
  ];

  function bundle(pi) {
    const p = PROJECTS[pi], count = p.count;
    const loopH = count * (G.itemH + G.gapT);
    const tiles = Math.max(3, 2 * Math.ceil((650 + loopH / 2) / loopH) + 1);
    const geo = new THREE.PlaneGeometry(G.itemW, G.itemH, 1, G.small ? 12 : 24);
    const cw = 768, ch = Math.round(cw * 0.5625);
    const items = Array.from({ length: count }, (_, k) => {
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      return { canvas, ctx: canvas.getContext("2d"), tex, video: k % 2 === 0, label: [`Work screen ${String(k + 1).padStart(2, "0")} · ${LABELS[k % LABELS.length][0]}`, LABELS[k % LABELS.length][1]] };
    });
    const meshes = [];
    for (let t = 0; t < tiles; t++) {
      for (let k = 0; k < count; k++) {
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
          uniforms: {
            map: { value: items[k].tex }, uAlpha: { value: 0 }, uPanelRadius: { value: G.radius }, uOvalFlatness: { value: 0.85 }, uEntryOvalFlatness: { value: 0.85 },
            uMeshOffsetY: { value: 0 }, uCurveAmount: { value: 0 }, uEntryCurveAmount: { value: 1 }, uFadeRange: { value: 600 }, uFadeFalloff: { value: 50 },
            uSlideSize: { value: new THREE.Vector2(G.itemW, G.itemH) }, uCornerRadius: { value: 4.5 },
          },
        });
        const m = new THREE.Mesh(geo, mat);
        m.renderOrder = 5;
        m.userData.k = k;
        scene.add(m);
        meshes.push(m);
      }
    }
    const b = { pi, count, tiles, loopH, geo, items, meshes, pos: 0, target: 0, prev: 0, vel: 0, x: 0, alpha: 1 };
    items.forEach((it, k) => paintItem(b, it, k, 0));
    return b;
  }
  function dispose(b) {
    b.meshes.forEach((m) => { scene.remove(m); m.material.dispose(); });
    b.geo.dispose();
    b.items.forEach((it) => it.tex.dispose());
  }
  function paintItem(b, it, k, t) {
    MA.paint(it.ctx, it.canvas.width, it.canvas.height, it.video ? t : 0, b.pi * 7 + k + 1, PROJECTS[b.pi].title, it.label, pal);
    it.tex.needsUpdate = true;
  }

  function build() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    Object.assign(G, { w, h, small: w < 1024, mobile: w < 640 });
    G.D = h / (2 * Math.tan(THREE.MathUtils.degToRad(22.5)));
    camera.aspect = w / h;
    camera.far = G.D * 6;
    camera.position.set(0, 0, G.D);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // The original shares a stage with the carousel, so gallery depth is carousel arc radius × .1 — measured the same way
    const slideW = Math.min(1280, w * (G.small ? 0.8 : 0.58));
    const Rz = (N * (slideW + (G.small ? 25 : 50))) / Math.PI;
    G.z = Rz * 0.1;
    G.itemW = G.small ? (w - 50) * ((G.D - G.z) / G.D) : w * 0.6;
    G.itemH = G.itemW * 0.5625;
    G.gapT = G.small ? 25 : 50;
    G.radius = G.mobile ? 600 : 1800;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    const keep = cur ? cur.pos / cur.loopH : 0;
    if (cur) { dispose(cur); cur = bundle(cur.pi); cur.pos = cur.target = cur.prev = keep * cur.loopH; G.target = cur.target; }
    if (out) { dispose(out); out = null; }
  }

  function update(b, main) {
    if (main) b.target = G.target;
    b.pos += (b.target - b.pos) * (reduce ? 1 : LERP);
    if (Math.abs(b.target - b.pos) < 0.05) b.pos = b.target;
    const d = b.pos - b.prev;
    b.prev = b.pos;
    b.vel += (d - b.vel) * LERP;
    if (Math.abs(b.vel) < 0.01) b.vel = 0;
    const s = reduce ? 0 : Math.min(1, Math.abs(b.vel) * (LERP / 4));
    const n = MA.wrap(b.pos, b.loopH), a = G.itemH + G.gap, o = a * b.count, u = Math.floor(b.tiles / 2), c = Math.floor(b.count / 2);
    b.meshes.forEach((m, i) => {
      const f = Math.floor(i / b.count), A = i % b.count, mm = MA.wrap(c - A, b.count);
      const y = -n + (f - u) * o + (mm - c) * a;
      m.position.set(b.x, y, G.z);
      const un = m.material.uniforms;
      un.uMeshOffsetY.value = y;
      un.uAlpha.value = b.alpha * G.entryAlpha;
      un.uCurveAmount.value = s;
      un.uEntryCurveAmount.value = G.entryCurve;
      m.visible = b.alpha * G.entryAlpha > 0.001 && Math.abs(y) < G.h * 1.2 + G.itemH;
    });
  }

  function entryIn() {
    G.gap = 100;
    G.entryCurve = 1;
    G.entryAlpha = 0;
    if (reduce) { G.entryCurve = 0; G.entryAlpha = 1; return; }
    gsap.to(G, { entryCurve: 0, duration: 0.75, ease: EXPO });
    gsap.to(G, { entryAlpha: 1, duration: 0.75, ease: EXPO });
  }

  // ---- Top-left three rows (category·role·partners) and top-right link: when the work changes, they roll by one row height ----
  const info = [...document.querySelectorAll("[data-info]")].map((el) => ({ el, key: el.dataset.info, a: el.children[0], b: el.children[1] }));
  const infoSt = { p: active, rise: 0 };
  const text = (pi, key) => (key === "agency" ? `Agency: ${PROJECTS[pi].agency}` : PROJECTS[pi][key]);
  function infoTick() {
    const to = MA.nearest(active, infoSt.p, N), d = to - infoSt.p;
    infoSt.p = Math.abs(d) < 0.001 ? Math.round(to) : infoSt.p + d * (reduce ? 1 : LERP * 1.5);
    const P = Math.floor(infoSt.p), V = infoSt.p - P;
    info.forEach((r) => {
      const h = r.el.offsetHeight || 20, lift = h * (1 - infoSt.rise);
      // Text is rewritten only when the work changes, the partner names are links, so re-swapping them every frame would break the hover
      if (r.at !== P) {
        r.at = P;
        [[r.a, P], [r.b, P + 1]].forEach(([el, k]) => {
          const pi = MA.wrap(k, N);
          if (r.key !== "agency") { el.textContent = text(pi, r.key); return; }
          el.textContent = "Agency: ";
          const a = document.createElement("a");
          a.href = "#";
          a.className = "ma-info__link";
          a.textContent = PROJECTS[pi].agency;
          el.append(a);
        });
      }
      r.a.style.transform = `translateY(${(-h * V + lift).toFixed(2)}px)`;
      r.a.style.opacity = 1 - V;
      r.b.style.transform = `translateY(${(h * (1 - V)).toFixed(2)}px)`;
      r.b.style.opacity = V;
    });
  }

  // dir is ±1, and giving to jumps straight to that work (like the original nav link·goToProject, entering from the nearer side)
  function go(dir, to) {
    if (G.busy || (out && out.alpha > 0.01)) return;
    if (to !== undefined) {
      if (to === active) return;
      dir = MA.nearest(to, active, N) > active ? 1 : -1;
    }
    active = to !== undefined ? to : MA.wrap(active + dir, N);
    controls && controls.setActive(active);
    history.replaceState(null, "", `?p=${PROJECTS[active].slug}`);
    out && dispose(out);
    out = cur;
    cur = bundle(active);
    G.target = 0;
    const visW = 2 * (G.D - G.z) * Math.tan(THREE.MathUtils.degToRad(22.5)) * camera.aspect;
    cur.x = dir === 1 ? visW : -visW;
    cur.alpha = 0;
    out.x = 0;
    out.alpha = 1;
    const d = reduce ? 0 : 0.75, done = out;
    gsap.to(cur, { x: 0, alpha: 1, duration: d, ease: EXPO });
    gsap.to(out, { x: dir === 1 ? -visW : visW, alpha: 0, duration: d, ease: EXPO, onComplete: () => { if (out === done) { dispose(out); out = null; } } });
  }

  function close() {
    if (G.busy) return;
    G.busy = true;
    controls && controls.closeCase();
    gsap.to(info.map((r) => r.el.parentElement), { opacity: 0, duration: 0.375, ease: EXPO });
    G.gapT = 100;
    gsap.to(G, { entryCurve: 1, entryAlpha: 0, duration: reduce ? 0 : 0.375, ease: EXPO, onComplete: () => MA.go("index.html", { from: "case", i: active }) });
  }

  // ---- Interaction: the whole panel is a drag surface (wheel · drag · arrows) ----
  layer.addEventListener("wheel", (e) => { e.preventDefault(); if (!G.busy) G.target -= e.deltaY * 1.2; }, { passive: false });
  layer.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a") || G.busy) return;
    G.dragging = true;
    G.startY = e.clientY;
    G.startT = G.target;
    layer.classList.add("is-grabbing");
    layer.setPointerCapture(e.pointerId);
  });
  layer.addEventListener("pointermove", (e) => { if (G.dragging) G.target = G.startT + (e.clientY - G.startY) * (touch ? 3 : 1.5); });
  const up = () => { G.dragging = false; layer.classList.remove("is-grabbing"); };
  ["pointerup", "pointercancel", "pointerleave"].forEach((t) => layer.addEventListener(t, up));
  addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || G.busy) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); G.target -= (e.key === "ArrowDown" ? 1 : -1) * 100 * 1.2; }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  });
  const ctl = document.querySelector(".ma-controls");
  ctl.querySelector(".ma-pill__btn--prev").addEventListener("click", () => go(-1));
  ctl.querySelector(".ma-pill__btn--next").addEventListener("click", () => go(1));
  ctl.querySelector(".ma-square--close").addEventListener("click", close);
  const closeBg = ctl.querySelector(".ma-square--close .ma-square__bg");
  if (closeBg && !touch) {
    const btn = ctl.querySelector(".ma-square--close");
    btn.addEventListener("pointerenter", () => gsap.to(closeBg, { opacity: 0.45, duration: 0.45, ease: EXPO, overwrite: true }));
    btn.addEventListener("pointerleave", () => gsap.to(closeBg, { opacity: 0, duration: 0.45, ease: EXPO, overwrite: true }));
  }
  ctl.querySelectorAll("button").forEach((b) => b.removeAttribute("tabindex"));
  document.querySelectorAll("[data-project-link]").forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); go(0, i); }));

  const ring = document.querySelector("[data-progress-ring]");
  const RING = 2 * Math.PI * 10;
  let lastPaint = 0;
  function tick() {
    const now = performance.now();
    G.gap += (G.gapT - G.gap) * (reduce ? 1 : LERP);
    if (Math.abs(G.gapT - G.gap) < 0.01) G.gap = G.gapT;
    cur && update(cur, true);
    out && update(out, false);
    if (cur && now - lastPaint > 33) {
      lastPaint = now;
      const t = (now - G.t0) / 1000;
      cur.items.forEach((it, k) => it.video && paintItem(cur, it, k, t));
    }
    if (cur && ring) {
      const e = (1 - MA.wrap(cur.pos, cur.loopH) / cur.loopH) % 1;
      ring.style.strokeDashoffset = RING * (1 - e);
      ring.closest("[role=progressbar]").setAttribute("aria-valuenow", Math.round(e * 100));
    }
    infoTick();
    renderer.render(scene, camera);
  }

  build();
  cur = bundle(active);
  renderer.compile(scene, camera);
  if (ring) { ring.style.strokeDasharray = RING; ring.style.strokeDashoffset = RING; }
  let rt = 0;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 200); }).observe(host);
  gsap.ticker.add(tick);
  controls && controls.setActive(active);

  const open = () => {
    MA.setReady();
    loader.show(false);
    controls && controls.openCase();
    if (reduce) infoSt.rise = 1;
    else gsap.to(infoSt, { rise: 1, duration: 0.75, ease: EXPO });
    entryIn();
  };
  if (arrival && arrival.from === "home") {
    // Arrived from the first section with the board covering the screen — the gallery rises curved straight from the covered bright board
    loader.skip();
    open();
  } else {
    const prog = { v: 0 };
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    gsap.to(prog, {
      v: 1, duration: reduce ? 0 : 2.45, ease: "power1.inOut",
      onUpdate: () => loader.progress(prog.v),
      onComplete: () => fonts.then(() => {
        loader.progress(1);
        gsap.delayedCall(reduce ? 0 : 0.35, () => { loader.done(); open(); });
      }),
    });
  }
})();
