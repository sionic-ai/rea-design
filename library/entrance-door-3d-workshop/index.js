// First page — entrance door (spinning model → press to count up → curtain lifts up), 3D room tour, viewpoint moves, hotspots and info panel
(() => {
  const T = THREE, V3 = T.Vector3;
  const reduce = CL.reduce;
  const stage = document.querySelector(".stage");
  const entry = document.querySelector(".entry-screen");
  const cue = entry.querySelector(".entry-screen__cue");
  const enterBtn = entry.querySelector(".entry-screen__enter");
  const content = stage.querySelector(".stage__content");
  const room = document.querySelector(".room");
  const canvas = room.querySelector(".room__canvas");
  const dotsEl = room.querySelector(".room__dots");
  const itemsEl = room.querySelector(".room__items");
  const panel = room.querySelector(".item-panel");
  const panelBody = panel.querySelector(".item-panel__content");
  const heading = room.querySelector(".room-heading");
  const headingTitle = heading.querySelector(".room-heading__title");
  const soon = heading.querySelector(".room-hint--coming-soon");
  const views = room.querySelector(".room-views");
  const viewButtons = views.querySelectorAll("[data-view]");
  const trigger = views.querySelector(".room-views__trigger");
  const menu = views.querySelector(".room-views__menu");
  const back = views.querySelector(".room-views__back");

  // ───────── Entrance door model: one turn in 44 seconds ─────────
  const tt = (() => {
    const cv = entry.querySelector(".entry-screen__video");
    const r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.toneMapping = T.ACESFilmicToneMapping;
    const sc = new T.Scene();
    sc.add(new T.HemisphereLight(0xffffff, 0x777777, 1.6)); // Not skin: white light of the model lighting and gray ground light (brightness values)
    const sun = new T.DirectionalLight(0xffffff, 1.6); // Not skin: white light for lighting intensity
    sun.position.set(3, 5, 4); sc.add(sun);
    const model = CatRoom.turntable();
    sc.add(model);
    const cam = new T.PerspectiveCamera(30, 512 / 448, 0.1, 50);
    cam.position.set(0, 2.2, 7.4); cam.lookAt(0, 1.55, 0);
    const size = () => { const b = cv.getBoundingClientRect(); r.setSize(b.width, b.height, false); };
    size(); addEventListener("resize", size);
    let raf = 0, start = performance.now();
    const loop = (now) => {
      model.rotation.y = reduce.matches ? 0 : (((now - start) / 44000) * Math.PI * 2) % (Math.PI * 2);
      r.render(sc, cam);
      raf = requestAnimationFrame(loop);
    };
    const play = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };
    const pause = () => { cancelAnimationFrame(raf); raf = 0; };
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
    play();
    return { pause, dispose: () => { pause(); r.dispose(); } };
  })();

  // ───────── Room ─────────
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color().setRGB(...CL.rgb("--site-sky-fill"), T.SRGBColorSpace);
  const VIEWS = CatRoom.VIEWS;
  const camera = new T.PerspectiveCamera(VIEWS.overview.fov, 1, 0.05, 60);
  camera.position.set(...VIEWS.overview.position);
  const controls = new T.OrbitControls(camera, canvas);
  Object.assign(controls, { enablePan: false, enableDamping: true, dampingFactor: 0.08, rotateSpeed: 0.35, zoomSpeed: 0.55, minDistance: 1.2, maxDistance: 11 });
  controls.touches = { ONE: T.TOUCH.ROTATE, TWO: T.TOUCH.DOLLY_ROTATE };
  controls.target.set(...VIEWS.overview.target);
  controls.update();
  controls.enabled = false;

  // Keeps the camera from passing through walls or the attic while looking around — it only runs along the line from the target toward the camera, up to the room box edge
  const BOUND = { min: new V3(-4.3, 0.5, -2.4), max: new V3(4.3, 4.1, 5.4) };
  const inside = (p) => p.x >= BOUND.min.x && p.x <= BOUND.max.x && p.y >= BOUND.min.y && p.y <= BOUND.max.y && p.z >= BOUND.min.z && p.z <= BOUND.max.z;
  const tmp = new V3();
  controls.addEventListener("change", () => {
    if (inside(camera.position) || moving) return;
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; tmp.lerpVectors(controls.target, camera.position, m); inside(tmp) ? (lo = m) : (hi = m); }
    camera.position.lerpVectors(controls.target, camera.position, lo);
  });

  let anchors = null, built = false, view = "overview", moving = null, readyView = null, selected = null;

  // The close-up view when the info panel opens shifts the screen center left by half the panel width (original viewOffset) — so the object isn’t hidden by the panel.
  const SHIFTED = new Set(["table", "swing", "pegboard"]);
  let offX = 0;
  const panelShift = () => {
    if (innerWidth < 900) return 0;
    const unit = Math.min(1, Math.min(Math.max(360, innerWidth * 0.357292), 686) / 686, (innerHeight - 64 - 77 - 19) / 623);
    return (686 * unit + 24 + 16) / 2;
  };
  const applyOffset = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (Math.abs(offX) < 0.5) camera.clearViewOffset();
    else camera.setViewOffset(w, h, offX, 0, w, h);
  };
  // Attaches on-screen buttons to 3D positions — original hotspot coordinates
  const DOT_AT = {
    table: [0.32, 0.97, 0.48], swing: [-3.35, 1.1, 0.95], whiteboard: [2.48, 1.3775, -1.65],
    pegboard: [3.085, 0.62, 0], tv: [0.09, 1.625, -5.9], booth: [-3.05, 1.45, -4.83],
  };

  // Like the original, the overview widens fov until the set of must-see points fits within the screen margin — the whole room fits on a portrait phone
  const corners = (a, b) => [a[0], b[0]].flatMap((x) => [a[1], b[1]].flatMap((y) => [a[2], b[2]].map((z) => [x, y, z])));
  const FIT_OVERVIEW = [...corners([-4.1, 0.05, -2.8], [3.2, 4.12, -2.8]), ...corners([-4.05, 0.12, -0.15], [-2.6, 1.12, 2.15]), ...corners([-1.65, 0.25, -0.25], [1.65, 1.2, 1.6]),
    [4.1, 1.25, 0.6], [4.75, 4, -2.8], [-1.8, 3, 0.6], [1.8, 3, 0.6], [0, 5.5, -2.8]];
  function fitFov(name) {
    const v = VIEWS[name], w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight), asp = w / h;
    let y = Math.tan((v.fov * Math.PI) / 360);
    if (name !== "overview") return w < 900 && asp < 1.2 ? 2 * Math.atan(y * Math.min(2.6, 1.2 / asp)) * 180 / Math.PI : v.fov;
    const pos = new V3(...v.position), fwd = new V3(...v.target).sub(pos).normalize();
    const right = fwd.clone().cross(new V3(0, 1, 0)).normalize(), up = right.clone().cross(fwd).normalize();
    const mx = Math.max(0.7, 1 - 40 / w), my = Math.max(0.55, 1 - 164 / h);
    const reach = (pts, ex) => pts.forEach((p) => {
      const e = new V3(...p).sub(pos), r = Math.max(0.1, e.dot(fwd));
      y = Math.max(y, Math.abs(e.dot(right)) / (r * asp * ex), Math.abs(e.dot(up)) / (r * my));
    });
    reach(FIT_OVERVIEW, mx);
    if (w <= 600 && w < h) y /= 1.35;
    y /= 1.15;
    reach(Object.values(DOT_AT), Math.max(0.5, 1 - 76 / w));
    return (2 * Math.atan(y) * 180) / Math.PI;
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (!moving) { offX = SHIFTED.has(view) ? panelShift() : 0; camera.fov = fitFov(view); }
    applyOffset();
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  const dots = [...dotsEl.querySelectorAll("[data-view]")].map((el) => ({ el, p: new V3(...DOT_AT[el.dataset.view]) }));
  let items = [];
  const place = (el, p) => {
    tmp.copy(p).project(camera);
    const off = tmp.z > 1 || Math.abs(tmp.x) > 1.05 || Math.abs(tmp.y) > 1.05;
    el.style.visibility = off ? "hidden" : "";
    el.style.transform = `translate3d(${((tmp.x + 1) / 2) * canvas.clientWidth}px, ${((1 - tmp.y) / 2) * canvas.clientHeight}px, 0)`;
  };

  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (document.hidden || !built) return;
    if (controls.enabled) controls.update();
    renderer.render(scene, camera);
    if (view === "overview") dots.forEach((d) => place(d.el, d.p));
    else items.forEach((it) => place(it.el, it.p));
  }

  // ───────── viewpoint move — as in the original, duration set by path length (.8 + .075 × length, max 1.65s) power2.inOut, fov too ─────────
  const ypd = (pos, target) => {
    const d = new V3().subVectors(target, pos);
    return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)), dist: d.length() };
  };
  function travel(to, done) {
    const v = VIEWS[to];
    moving?.kill();
    controls.enabled = false;
    const p0 = camera.position.clone(), p1 = new V3(...v.position);
    // A curve with the middle lifted slightly — so it passes over the desk and chair
    const mid = p0.clone().lerp(p1, 0.5); mid.y += Math.min(0.6, p0.distanceTo(p1) * 0.08);
    const curve = new T.QuadraticBezierCurve3(p0, mid, p1);
    const a = ypd(p0, controls.target), b = ypd(p1, new V3(...v.target));
    const dyaw = Math.atan2(Math.sin(b.yaw - a.yaw), Math.cos(b.yaw - a.yaw));
    const fov0 = camera.fov, fov1 = fitFov(to), st = { p: 0 };
    const ox0 = offX, ox1 = SHIFTED.has(to) ? panelShift() : 0;
    const dur = reduce.matches || document.hidden ? 0 : Math.min(1.65, 0.8 + 0.075 * curve.getLength());
    room.dataset.moving = "true";
    const look = new V3();
    moving = gsap.to(st, {
      p: 1, duration: dur, ease: "power2.inOut",
      onUpdate() {
        const e = st.p;
        curve.getPoint(e, camera.position);
        camera.fov = fov0 + (fov1 - fov0) * e;
        offX = ox0 + (ox1 - ox0) * e;
        applyOffset();
        camera.updateProjectionMatrix();
        camera.rotation.set(a.pitch + (b.pitch - a.pitch) * e, a.yaw + dyaw * e, 0, "YXZ");
        camera.getWorldDirection(look).multiplyScalar(a.dist + (b.dist - a.dist) * e).add(camera.position);
        controls.target.copy(look);
      },
      onComplete() {
        moving = null;
        room.dataset.moving = "false";
        controls.target.set(...v.target);
        camera.lookAt(controls.target);
        if (to === "overview") { controls.enabled = true; controls.update(); }
        done && done();
      },
    });
  }

  // ───────── Close-up content ─────────
  const TITLES = { table: "Meet the people here", swing: "Earlier work", whiteboard: "About this place", pegboard: "Tools we use now" };
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  const SOCIAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor"/></svg>';
  const pad = (n) => String(n).padStart(2, "0");
  const PANELS = {
    table: (n) => `
      <div class="item-panel__header"><h2 data-label="Person name (English)">Builder Name ${pad(n)}</h2>
        <div class="item-panel__socials">${["Instagram", "YouTube", "LinkedIn"].map((s) => `<a class="item-panel__social" href="#" aria-label="${s}">${SOCIAL}</a>`).join("")}</div></div>
      <div class="item-panel__image wf-img" data-label="Portrait · Polaroid film grain · indoor natural light · landscape composition above the waist"></div>
      <p class="item-panel__description">Your person intro here in about four lines. What they make, what work they have done, and what they are doing now in this studio. The original is about five lines.</p>
      <div class="item-panel__projects">${[1, 2, 3].map((k) => `<a class="item-project" href="#"><span>Project ${pad(k)}</span>${ARROW}</a>`).join("")}</div>`,
    swing: (n) => `
      <div class="item-panel__header"><div class="item-panel__title"><span class="item-panel__logo" aria-hidden="true">P.</span><h2 data-label="Work name (English)">Project Name ${pad(n)}</h2></div><a class="item-panel__out" href="#" aria-label="Open">${ARROW}</a></div>
      <div class="item-panel__image wf-img" data-label="Scene of using the product · warm indoor lighting · person close-up, landscape"></div>
      <h3>What it is</h3>
      <p class="item-panel__description">Your text goes here, three or four lines, explaining this project. Briefly write what problem it solved and how it is used.</p>
      <h3>Made by</h3><p class="item-panel__description">Maker Name</p>`,
    pegboard: (n) => `
      <div class="item-panel__header"><h2 data-label="Tool name (English)">Tool Name ${pad(n)}</h2><a class="item-panel__out" href="#" aria-label="Open">${ARROW}</a></div>
      <p class="item-panel__description">Your text goes here, about five lines, on what this tool is and why everyone uses it this season. The original is one short paragraph.</p>
      <h3>Why we love it</h3>
      <ul><li>One reason you love it goes here, about two lines.</li><li>Two reasons for liking it go here in about two lines.</li><li>Three reasons for liking it go here in about two lines.</li></ul>`,
    whiteboard: (n) => `
      <div class="item-panel__header"><h2 data-label="Question (English)">Question ${["one", "two", "three"][n - 1]}?</h2></div>
      <p class="item-panel__description">Your answer to this question goes here, three or four lines. Write what the studio is, who runs it and how it supports people.</p>`,
  };

  function setItems(to) {
    itemsEl.textContent = "";
    items = [];
    if (!anchors) return;
    const list = to === "table" ? anchors.table.map((o) => o.getWorldPosition(new V3()).add(new V3(0.035, 0.005, 0.045)))
      : to === "swing" ? anchors.swing.map((o) => o.getWorldPosition(new V3()).add(new V3(0.08, 0.02, 0.1)))
      : to === "pegboard" ? anchors.pegboard.map((o) => o.getWorldPosition(new V3()).add(new V3(-0.06, 0.02, 0.08)))
      : to === "whiteboard" ? anchors.whiteboard : [];
    list.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "item-hotspot" + (to === "table" || to === "swing" || to === "pegboard" ? " item-hotspot--small" : "");
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", `Item ${i + 1}`);
      b.innerHTML = `<span>${i + 1}</span>`;
      b.addEventListener("click", () => select(i + 1));
      itemsEl.appendChild(b);
      items.push({ el: b, p });
    });
  }
  function select(n) {
    selected = n;
    items.forEach((it, i) => it.el.setAttribute("aria-pressed", String(i + 1 === n)));
    const make = PANELS[view];
    if (!make || !n) { panel.dataset.visible = "false"; room.dataset.panelOpen = "false"; return; }
    panel.dataset.kind = view;
    panelBody.innerHTML = make(n);
    panel.dataset.visible = "true";
    room.dataset.panelOpen = "true";
  }

  function go(to) {
    if (to === "booth") { CL.go("join.html"); return; }
    if (to === view && !moving) return;
    view = to;
    readyView = null;
    room.dataset.view = to;
    heading.dataset.visible = "false";
    panel.dataset.visible = "false";
    room.dataset.panelOpen = "false";
    itemsEl.textContent = ""; items = [];
    views.dataset.detail = String(to !== "overview");
    back.tabIndex = to === "overview" ? -1 : 0;
    viewButtons.forEach((b) => b.setAttribute(b.getAttribute("role") === "menuitemradio" ? "aria-checked" : "aria-pressed", String(b.dataset.view === to)));
    closeMenu();
    travel(to, () => {
      readyView = to;
      if (to === "overview") return;
      if (TITLES[to]) { headingTitle.textContent = TITLES[to]; heading.dataset.visible = "true"; }
      soon.dataset.visible = String(to === "tv");
      heading.dataset.visible = String(!!TITLES[to] || to === "tv");
      if (to === "tv") headingTitle.textContent = "";
      setItems(to);
      if (to === "table" || to === "swing" || to === "pegboard") select(1);
    });
  }

  views.addEventListener("click", (e) => {
    const b = e.target.closest("[data-view]");
    if (b) go(b.dataset.view);
  });
  dotsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-view]");
    if (b) go(b.dataset.view);
  });
  back.addEventListener("click", () => go("overview"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && view !== "overview") { e.preventDefault(); go("overview"); } });
  room.closest(".stage__content").querySelector(".nav__logo").addEventListener("click", (e) => {
    if (!built) return;
    e.preventDefault();
    if (view !== "overview") go("overview");
    else travel("overview");
  });
  function closeMenu() { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); }
  trigger.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
  });
  // Pill width = Button row width + inner padding (the original measures the buttons and sets --room-nav-expanded-width)
  const fitPill = () => {
    const w = views.querySelector(".room-views__buttons").scrollWidth;
    if (w) views.style.setProperty("--room-nav-expanded-width", `${w + 8}px`);
  };
  addEventListener("resize", fitPill);

  // ───────── Entrance ─────────
  let shown = 0, target = 0, timer = 0;
  function count(onDone) {
    clearTimeout(timer);
    if (document.hidden) { timer = setTimeout(() => count(onDone), 40); return; }
    shown = reduce.matches ? target : Math.min(target, shown + Math.max(1, Math.ceil((target - shown) * 0.2)));
    cue.textContent = `${shown}%`;
    timer = setTimeout(shown === 100 ? onDone : () => count(onDone), shown === 100 ? 160 : 40);
  }

  async function buildRoom(progress) {
    resize();
    anchors = await CatRoom.build(scene, progress);
    // Compile all shaders right now so the screen does not freeze on first drag or first move
    await renderer.compileAsync(scene, camera);
    renderer.render(scene, camera);
    built = true;
    if (!raf) frame();
  }

  function open(instant) {
    stage.dataset.entered = "true";
    content.inert = false;
    content.removeAttribute("aria-hidden");
    controls.enabled = true;
    tt.dispose();
    if (instant) return;
    room.querySelector(".room-views button")?.focus({ preventScroll: true });
  }

  function reveal() {
    camera.zoom = reduce.matches ? 1 : 0.94;
    camera.updateProjectionMatrix();
    content.inert = true;
    const a = entry.animate(reduce.matches ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: "translate3d(0, 0, 0)" }, { transform: "translate3d(0, -101%, 0)" }],
      { duration: reduce.matches ? 120 : 1050, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    gsap.to(camera, { zoom: 1, duration: reduce.matches ? 0 : 1.05, ease: "power3.inOut", onUpdate: () => camera.updateProjectionMatrix() });
    a.onfinish = () => open(false);
  }

  let entering = false;
  enterBtn.addEventListener("click", () => {
    if (entering) return;
    entering = true;
    entry.dataset.entering = "true";
    cue.setAttribute("role", "progressbar");
    cue.setAttribute("aria-valuemin", "0");
    cue.setAttribute("aria-valuemax", "100");
    requestAnimationFrame(() => requestAnimationFrame(() => { target = Math.max(target, 6); }));
    // In the original, after the room UI attaches (~.5s after the press) it measures the button width and shrinks the pill from 480 to the button width (.55s)
    setTimeout(fitPill, 340);
    count(reveal);
    // In the original a number rises while 5MB of textures and model download (.5s 70% · 1.2s 82% · 2s 91% · 2.3s end) — the procedurally built copy is bound so it never fills earlier than that
    const t0 = performance.now(), PACE = [[0, 0], [500, 70], [1200, 82], [2000, 91], [2300, 100]];
    const cap = () => { const t = performance.now() - t0; for (let i = 1; i < PACE.length; i++) if (t < PACE[i][0]) { const [a, va] = PACE[i - 1], [b, vb] = PACE[i]; return va + ((vb - va) * (t - a)) / (b - a); } return 100; };
    let made = 0;
    const pace = setInterval(() => { target = Math.max(target, Math.round(Math.min(made, cap()))); if (target >= 100) clearInterval(pace); }, 40);
    buildRoom((p) => { made = Math.min(99, p); }).then(() => { made = 100; if (reduce.matches) { target = 100; clearInterval(pace); } });
  });

  // Path back after covering with the curtain in Join: build the room and lift the curtain without an entrance door
  if (CL.returning) {
    entry.style.display = "none";
    buildRoom(() => {}).then(() => { open(true); CL.reveal(); });
  }
})();
