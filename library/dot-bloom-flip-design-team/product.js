/* Sub pages — foldable phone 3D mockup editor. Original values: FOV 33, OrbitControls damping .075 · distance 6~28 · auto-rotate 1.1, initial target (0,0,.35),
   Three poses (closed 0°·book 145°·fully open 180°), camera 750ms cubic-out, fold angle follows with 1-exp(-10·dt), exposure 1.15, key light 4 (-3,10,5), shadow radius 20,
   Light bar 40~180% → key 1.5/4/8 · sky 2.8/2/1.1 · back 2/2.5/3 · floor shadow .025/.06/.14 */
(() => {
  const T = window.THREE;
  const studio = document.querySelector(".sd-studio");
  const view = document.getElementById("sd-view"), wrap = document.getElementById("sd-canvas-wrap");
  const $ = (id) => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const toast = (msg) => { const t = $("sd-toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); };

  // View 1·2 panel switch — original numbers: the outgoing panel slides out 14px sideways and fades in 120ms, the incoming panel enters from 18px on the opposite side in 400ms, panel group height also 400ms, curve cubic-bezier(.2,.8,0,1)
  const panels = document.querySelector(".sd-panels");
  let running = [], settle = () => {}, onMode = () => {};
  document.querySelectorAll(".sd-switch").forEach((sw) => sw.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    sw.querySelectorAll("button").forEach((x) => { x.classList.toggle("selected", x === b); x.setAttribute("aria-pressed", String(x === b)); });
    const to = b.dataset.panelTo; if (!to) return;
    const next = panels.querySelector(`[data-panel="${to}"]`), cur = panels.querySelector(`[data-panel]:not([data-panel="${to}"])`);
    if (!next.hidden && cur.hidden) return;
    const from = panels.getBoundingClientRect().height;
    document.querySelectorAll("[data-mode=render]").forEach((el) => (el.hidden = to === "live"));
    onMode(to === "live");
    running.forEach((a) => a.cancel()); settle();
    next.hidden = false; cur.hidden = true;
    if (reduce.matches) return;
    const h = panels.getBoundingClientRect().height, dir = to === "live" ? 1 : -1, o = { duration: 400, easing: "cubic-bezier(.2,.8,0,1)" };
    cur.hidden = false; cur.inert = true; cur.classList.add("is-leaving"); panels.classList.add("is-moving");
    const out = cur.animate([{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: `translateX(${-14 * dir}px)` }], { ...o, duration: 120, fill: "forwards" });
    const into = next.animate([{ opacity: 0, transform: `translateX(${18 * dir}px)` }, { opacity: 1, transform: "translateX(0)" }], o);
    const grow = panels.animate([{ height: `${from}px` }, { height: `${h}px` }], o);
    running = [out, into, grow];
    settle = () => { cur.hidden = true; cur.inert = false; cur.classList.remove("is-leaving"); panels.classList.remove("is-moving"); out.cancel(); };
    grow.onfinish = () => { settle(); running = []; settle = () => {}; };
  }));
  document.querySelectorAll(".sd-link-form").forEach((f) => f.addEventListener("submit", (e) => { e.preventDefault(); toast("Your guide line here"); }));

  if (!T) return;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); }
  catch (err) { $("sd-loading").textContent = "This editor requires WebGL."; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.VSMShadowMap;
  wrap.appendChild(renderer.domElement);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("aria-label", "Foldable phone in 3D. Drag to rotate it, spin it to pull it closer.");

  let raf = 0, last = performance.now();
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(33, 1, 0.1, 100);
  const ctl = new T.OrbitControls(cam, renderer.domElement);
  ctl.enableDamping = true; ctl.dampingFactor = 0.075; ctl.minDistance = 6; ctl.maxDistance = 28; ctl.autoRotateSpeed = 1.1;
  ctl.target.set(0, 0, 0.35);

  // Studio reflection — replaces the original’s six light panels of the box room with three bright panels
  const env = (() => {
    const s = new T.Scene();
    s.add(new T.Mesh(new T.SphereGeometry(20, 24, 12), new T.MeshBasicMaterial({ color: new T.Color(0.42, 0.42, 0.44), side: T.BackSide })));
    for (const [x, y, z, w, h, k] of [[-10, 9, 6, 6, 4, 6], [10, 6, -2, 3, 8, 3], [0, 14, 0, 10, 10, 2.5]]) {
      const p = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide }));
      p.position.set(x, y, z); p.lookAt(0, 0, 0); s.add(p);
    }
    const pm = new T.PMREMGenerator(renderer), tex = pm.fromScene(s, 0.04).texture; pm.dispose(); return tex;
  })();
  scene.environment = env;
  const hemi = new T.HemisphereLight(0xffffff, 0x737b8b, 2); scene.add(hemi);
  const key = new T.DirectionalLight(0xffffff, 4); key.position.set(-3, 10, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 30 });
  key.shadow.bias = -3e-4; key.shadow.normalBias = 0.035; key.shadow.radius = 20; key.shadow.blurSamples = 16; scene.add(key);
  const rim = new T.DirectionalLight(0xdde6ff, 2.5); rim.position.set(5, 2, -6); scene.add(rim);
  const floor = new T.Mesh(new T.PlaneGeometry(200, 200), new T.ShadowMaterial({ opacity: 0.06 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.7; floor.receiveShadow = true; scene.add(floor);

  // Screen image — in the original, before an image is uploaded the screen is off (black glass). Place a panel with ratio and resolution faintly noted on the same dark, and uploading swaps it for that image
  const mkCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const screens = { inner: mkCanvas(2260, 1600), folded: mkCanvas(2260, 1600), cover: mkCanvas(1130, 1600) };
  const color = (v) => { const s = getComputedStyle(document.documentElement).getPropertyValue(v).trim(); return s || "gray"; };
  const GLASS = ["#16181b", "#0b0c0e"]; // Not skin: off-screen glass — a device material color, so it stays black even when the skin changes
  const paintPlaceholder = (c, label) => {
    const x = c.getContext("2d"), { width: w, height: h } = c;
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, GLASS[0]); g.addColorStop(1, GLASS[1]);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = color("--kf-dim"); x.globalAlpha = 0.12; x.lineWidth = 2;
    for (let i = 0; i <= w; i += 80) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let j = 0; j <= h; j += 80) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    x.globalAlpha = 0.45; x.fillStyle = color("--kf-dim");
    x.font = `500 ${Math.round(w / 18)}px ${color("--kf-font-sans")}`; x.textAlign = "center";
    x.fillText(label, w / 2, h / 2);
    x.font = `400 ${Math.round(w / 40)}px ${color("--kf-font-mono")}`;
    x.fillText(`${w} × ${h}`, w / 2, h / 2 + w / 16); x.globalAlpha = 1;
  };
  paintPlaceholder(screens.inner, "Inner screen slot · App screen capture, landscape"); paintPlaceholder(screens.folded, "Screen spot when collapsed · optional"); paintPlaceholder(screens.cover, "Outer screen slot · app screen capture portrait");
  const tex = {};
  for (const k in screens) { tex[k] = new T.CanvasTexture(screens[k]); tex[k].colorSpace = T.SRGBColorSpace; tex[k].anisotropy = renderer.capabilities.getMaxAnisotropy(); }

  // Device — two halves (width 2.8 · height 4 · thickness .12) on a vertical hinge (x=0) folds. At fold 0° both stand in +z and touch face to face
  const W = 2.8, H = 4, D = 0.12, R = 0.36;
  const halfShape = (side) => {
    const s = new T.Shape(), x0 = side < 0 ? -W : 0, x1 = side < 0 ? 0 : W, rL = side < 0 ? R : 0.04, rR = side < 0 ? 0.04 : R, y0 = -H / 2, y1 = H / 2;
    s.moveTo(x0 + rL, y0); s.lineTo(x1 - rR, y0); s.quadraticCurveTo(x1, y0, x1, y0 + rR); s.lineTo(x1, y1 - rR); s.quadraticCurveTo(x1, y1, x1 - rR, y1);
    s.lineTo(x0 + rL, y1); s.quadraticCurveTo(x0, y1, x0, y1 - rL); s.lineTo(x0, y0 + rL); s.quadraticCurveTo(x0, y0, x0 + rL, y0); return s;
  };
  const uvFit = (geo, x0, x1, u0, u1) => {
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, u0 + ((p.getX(i) - x0) / (x1 - x0)) * (u1 - u0), (p.getY(i) + H / 2) / H);
    uv.needsUpdate = true;
  };
  // Not skin: two device finishes — the chosen color is itself the content (border·side·back·camera·logo colors of the original two finishes)
  const FINISH = { night: { label: "Closing 1", frame: 0x4a4e56, edge: 0x9398a2, back: 0x24272e, camera: 0x747a85 }, white: { label: "Closing 2", frame: 0xb8bbc2, edge: 0xe3e6ec, back: 0xf4f3ef, camera: 0xd0d4db } };
  const mFrame = new T.MeshStandardMaterial({ metalness: 0.85, roughness: 0.32 });
  const mBack = new T.MeshStandardMaterial({ metalness: 0.1, roughness: 0.55 });
  const mCam = new T.MeshStandardMaterial({ metalness: 0.6, roughness: 0.25 });
  const mLens = new T.MeshStandardMaterial({ color: 0x0b0c0f, metalness: 0.2, roughness: 0.08 });
  const mInner = new T.MeshBasicMaterial({ map: tex.inner, toneMapped: false });
  const mCover = new T.MeshBasicMaterial({ map: tex.cover, toneMapped: false, side: T.DoubleSide });
  const cutouts = [];
  const makeHalf = (side) => {
    const g = new T.Group();
    const body = new T.Mesh(new T.ExtrudeGeometry(halfShape(side), { depth: D, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 16 }), [mBack, mFrame]);
    body.position.z = -D; body.castShadow = true; g.add(body);
    const inset = new T.ShapeGeometry(halfShape(side), 16);
    uvFit(inset, -W, W, 0, 1); const cx = side < 0 ? -W / 2 : W / 2; inset.translate(-cx, 0, 0); inset.scale(0.985, 0.985, 1); inset.translate(cx, 0, 0);
    // The body front sticks out forward by the corner trim (.012) — the screen must sit outside that to be visible
    const scr = new T.Mesh(inset, mInner); scr.position.z = 0.014; g.add(scr);
    if (side < 0) {
      // The outer screen is the left half back side, seen from behind, so u is the hinge (x=0) is flipped to 0
      const cov = new T.ShapeGeometry(halfShape(side), 16); uvFit(cov, -W, 0, 1, 0);
      cov.translate(W / 2, 0, 0); cov.scale(0.97, 0.97, 1); cov.translate(-W / 2, 0, 0);
      const c = new T.Mesh(cov, mCover); c.position.z = -D - 0.014; g.add(c);
    } else {
      const bump = new T.Group();
      const plate = new T.Mesh(new T.BoxGeometry(1.1, 1.1, 0.06), mCam); plate.position.set(W - 0.8, H / 2 - 0.8, -D - 0.04); bump.add(plate);
      for (const [dx, dy] of [[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25]]) {
        const l = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.05, 32), mLens); l.rotation.x = Math.PI / 2; l.position.set(W - 0.8 + dx, H / 2 - 0.8 + dy, -D - 0.09); bump.add(l);
      }
      g.add(bump); cutouts.push(bump);
    }
    return g;
  };
  const left = new T.Group(), right = new T.Group();
  const leftHalf = makeHalf(-1), rightHalf = makeHalf(1);
  left.add(leftHalf); right.add(rightHalf);
  const device = new T.Group(); device.add(left, right); scene.add(device);
  let angle = 0, target = 0;
  const setFold = (deg) => {
    const a = ((180 - deg) / 2) * Math.PI / 180;
    right.rotation.y = -a; left.rotation.y = a;
    // At fold 0° the two halves open by the hinge thickness and meet face to face
    const gap = (1 - deg / 180) * 0.02;
    right.position.x = gap; left.position.x = -gap;
  };

  const applyFinish = (k) => {
    const f = FINISH[k]; $("sd-finish-name").textContent = f.label;
    mFrame.color.setHex(f.frame); mBack.color.setHex(f.back); mCam.color.setHex(f.camera);
    document.querySelectorAll("[data-finish]").forEach((b) => { const on = b.dataset.finish === k; b.classList.toggle("selected", on); b.setAttribute("aria-pressed", String(on)); });
    wake();
  };
  document.querySelectorAll("[data-finish]").forEach((b) => (b.onclick = () => applyFinish(b.dataset.finish)));

  const rangeFill = (el) => { const e = (el.value - el.min) / (el.max - el.min); el.style.setProperty("--range-fill", `calc(${e * 100}% + ${12 - 24 * e}px)`); };
  document.querySelectorAll("input[type=range]").forEach((r) => { rangeFill(r); r.addEventListener("input", () => rangeFill(r)); });
  const setAngle = (v) => { target = +v; $("sd-angle").value = v; $("sd-angle-out").value = `${v}°`; rangeFill($("sd-angle")); wake(); };
  $("sd-angle").oninput = (e) => { setAngle(e.target.value); clearPose(); };
  const clearPose = () => document.querySelectorAll("[data-pose]").forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });

  const POSES = { book: { angle: 145, pos: [4, 2, 12.5], target: [0, 0, 0.45] }, open: { angle: 180, pos: [0, 0, 12.5], target: [0, 0, 0] }, closed: { angle: 0, pos: [-11.5, 0, 1.4], target: [0, 0, 1.4] } };
  let tween = null;
  const pose = (k, instant = false) => {
    const p = POSES[k]; setAngle(p.angle); clearPose();
    const b = document.querySelector(`[data-pose="${k}"]`); b.classList.add("active"); b.setAttribute("aria-pressed", "true");
    const narrow = wrap.clientWidth / wrap.clientHeight < 0.8 ? 1.35 : 1;
    const tg = new T.Vector3(...p.target), to = new T.Vector3(...p.pos).sub(tg).multiplyScalar(narrow).add(tg);
    if (instant || reduce.matches) { cam.position.copy(to); ctl.target.copy(tg); angle = p.angle; }
    else tween = { from: cam.position.clone(), to, fromT: ctl.target.clone(), toT: tg, start: performance.now() };
    wake();
  };
  document.querySelectorAll("[data-pose]").forEach((b) => (b.onclick = () => pose(b.dataset.pose)));
  ctl.addEventListener("start", () => (tween = null));
  ctl.addEventListener("change", () => wake());
  // Going to view 2 (link screen), as in the original, it parks the current angle and camera and switches straight to the wide-open pose — restored on return
  let live = false, kept = null;
  onMode = (on) => {
    live = on;
    $("sd-angle").disabled = $("sd-export").disabled = on;
    document.querySelectorAll("[data-pose]").forEach((b) => (b.disabled = on));
    if (on) {
      kept = { angle: target, pos: cam.position.clone(), tgt: ctl.target.clone() };
      $("sd-rotate").checked = false; ctl.autoRotate = false;
      tween = null; pose("open", true);
    } else if (kept) {
      tween = null; setAngle(kept.angle); angle = kept.angle; cam.position.copy(kept.pos); ctl.target.copy(kept.tgt); clearPose(); wake();
    }
  };
  $("sd-reset").onclick = () => { pose(live ? "open" : "book"); $("sd-rotate").checked = false; ctl.autoRotate = false; };
  $("sd-rotate").onchange = (e) => { ctl.autoRotate = e.target.checked; wake(); };
  $("sd-cutouts").onchange = (e) => { cutouts.forEach((c) => (c.visible = e.target.checked)); wake(); };

  let bgMode = "light";
  // Export PNG background — the scene picker’s own color (same value as product.css). Light scenes are read from the skin
  const BG = { dark: ["#474a50", "#202226"], peach: ["#f6dfd0", "#d2ac9e"] }; // Not a skin: the scene-picker colors are the content itself
  document.querySelectorAll("[data-bg]").forEach((b) => (b.onclick = () => {
    bgMode = b.dataset.bg; view.classList.toggle("dark", bgMode === "dark"); view.classList.toggle("peach", bgMode === "peach"); light();
    document.querySelectorAll("[data-bg]").forEach((x) => { x.classList.toggle("selected", x === b); x.setAttribute("aria-pressed", String(x === b)); });
  }));
  const lerp = (a, b, t) => a + (b - a) * t;
  const light = () => {
    const v = +$("sd-light").value, e = v < 100 ? (v - 100) / 60 : (v - 100) / 80;
    const t = (lo, mid, hi) => (e < 0 ? lerp(mid, lo, -e) : lerp(mid, hi, e));
    key.intensity = t(1.5, 4, 8); hemi.intensity = t(2.8, 2, 1.1); rim.intensity = t(2, 2.5, 3);
    scene.environmentIntensity = t(1.1, 1, 0.8); floor.material.opacity = t(0.025, 0.06, 0.14) * (bgMode === "dark" ? 2 : 1); key.shadow.radius = t(30, 20, 10);
    $("sd-light-out").value = `${v}%`; wake();
  };
  $("sd-light").oninput = light; light();

  // Image upload — drawn only inside this window (sent nowhere)
  document.querySelectorAll(".sd-upload input").forEach((inp) => inp.addEventListener("change", () => {
    const f = inp.files[0], k = inp.dataset.target; if (!f) return;
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => {
      const c = screens[k], x = c.getContext("2d"), s = Math.max(c.width / img.width, c.height / img.height);
      x.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s);
      tex[k].needsUpdate = true; document.querySelector(`[data-name="${k}"]`).textContent = f.name; URL.revokeObjectURL(url); wake();
    };
    img.src = url;
  }));

  $("sd-export").onclick = async () => {
    const btn = $("sd-export"); btn.disabled = true;
    const size = new T.Vector2(); renderer.getSize(size); const pr = renderer.getPixelRatio();
    try {
      const res = +$("sd-res").value, r = size.x / size.y, w = Math.round(r >= 1 ? res : res * r), h = Math.round(r >= 1 ? res / r : res);
      renderer.setPixelRatio(1); renderer.setSize(w, h, false);
      const clear = $("sd-transparent").checked; floor.visible = !clear;
      renderer.render(scene, cam);
      const c = mkCanvas(w, h), x = c.getContext("2d");
      if (!clear) {
        const [a, b] = BG[bgMode] || [color("--kf-bg"), color("--kf-line")];
        const g = x.createRadialGradient(w * 0.45, h * 0.4, 0, w * 0.45, h * 0.4, Math.max(w, h) * 0.75); g.addColorStop(0, a); g.addColorStop(1, b);
        x.fillStyle = g; x.fillRect(0, 0, w, h);
      }
      x.drawImage(renderer.domElement, 0, 0);
      const blob = await new Promise((ok) => c.toBlob(ok, "image/png"));
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `device-${Math.round(angle)}deg-${res}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1e4); toast("PNG exported.");
    } catch (err) { toast("Export failed. Try again at 2048 px."); }
    finally { floor.visible = true; renderer.setPixelRatio(pr); renderer.setSize(size.x, size.y, false); btn.disabled = false; wake(); }
  };

  const resize = () => { renderer.setSize(wrap.clientWidth, wrap.clientHeight); cam.aspect = wrap.clientWidth / Math.max(wrap.clientHeight, 1); cam.updateProjectionMatrix(); wake(); };
  new ResizeObserver(resize).observe(wrap);

  // Draw only on change — rest once angle, camera interpolation, damping and auto-rotate stop
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (angle !== target) { angle = reduce.matches ? target : lerp(angle, target, 1 - Math.exp(-10 * dt)); if (Math.abs(angle - target) < 0.001) angle = target; }
    setFold(angle);
    mInner.map = angle < 180 && document.querySelector('[data-name="folded"]').textContent !== "Optional · Only when collapsed" ? tex.folded : tex.inner;
    if (tween) {
      const k = Math.min((now - tween.start) / 750, 1), e = 1 - Math.pow(1 - k, 3);
      cam.position.lerpVectors(tween.from, tween.to, e); ctl.target.lerpVectors(tween.fromT, tween.toT, e);
      if (k === 1) tween = null;
    }
    const moving = ctl.update(dt);
    renderer.render(scene, cam);
    // If a control’s change has already scheduled the next frame via wake() in here, don’t schedule again — overlapping doubles the calls every frame and it freezes
    if (!raf && (tween || angle !== target || moving || ctl.autoRotate)) raf = requestAnimationFrame(frame);
  }
  // Intro — original values: over 2400ms the camera swings half a turn around the aim point (damping curve 1-(1+8f)e^-8f), swelling distance +4.5% and height +.32, then settling,
  // The canvas clears from blur 72px · opacity .35 with smoothstep(.04~.96). The side panel entrance (.48s) runs when this finishes and inert is released.
  // As in the original, start the clock after baking all shaders (compileAsync)
  const reveal = async () => {
    if (reduce.matches) return;
    cancelAnimationFrame(raf); raf = 0;
    const el = renderer.domElement, tg = ctl.target.clone(), home = cam.position.clone(), d = home.clone().sub(tg), up = new T.Vector3(0, 1, 0);
    const swing = (f) => 1 - (1 + 8 * f) * Math.exp(-8 * f);
    const at = (g) => {
      const m = swing(g) / swing(1), s = Math.sin(Math.PI * g);
      cam.position.copy(d).applyAxisAngle(up, Math.PI * (1 - m)).multiplyScalar(1 + 0.045 * s);
      cam.position.y += 0.32 * s; cam.position.add(tg); cam.lookAt(tg);
      const y = Math.min(Math.max((g - 0.04) / 0.92, 0), 1), a = y * y * (3 - 2 * y);
      el.style.filter = `blur(${72 * (1 - a) ** 2}px)`; el.style.opacity = String(0.35 + 0.65 * a);
      setFold(angle); renderer.render(scene, cam);
    };
    at(0);
    if (renderer.compileAsync) await renderer.compileAsync(scene, cam);
    await new Promise((done) => {
      let t0;
      const step = (now) => { t0 ??= now; const g = Math.min((now - t0) / 2400, 1); at(g); g < 1 ? requestAnimationFrame(step) : done(); };
      requestAnimationFrame(step);
    });
    cam.position.copy(home); cam.lookAt(tg); el.style.filter = ""; el.style.opacity = "";
  };
  applyFinish("night");
  pose("closed", true);
  resize();
  reveal().then(() => { $("sd-loading").hidden = true; studio.removeAttribute("inert"); wake(); });
})();
