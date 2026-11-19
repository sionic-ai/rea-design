// One-page staging — loader → opening (4s band) → sentence section (curved band) → gallery (curved plate flowing horizontally, our shader) → schedule. Pressing a plate opens a horizontal drawer.
(() => {
  const { lx } = window;
  const html = document.documentElement;
  const { PC, reduce } = lx;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const N = lx.names.length;
  // Original settings — PC/phone
  const CFG = {
    basic: { brightness: 1, curve: 0.3, positionY: 0 },
    gallery: { curve: 0.05, firstDuration: 1, gap: PC ? 30 : 18, img: PC ? 52 : 72, lastDuration: 2, paddingLeft: PC ? 300 : 40, positionY: PC ? 0 : 20 },
    opening: { curve: 0.2, duration: 4, gap: 10, img: 80 },
    statement: { curve: PC ? 0.3 : 0.8, duration: 2, gap: PC ? 10 : 3, scale: 1.1 },
  };
  const LABEL = ["Coupe car on a dark stage · golden wall lighting · landscape 16:10", "Wooden house-shaped pavilion · night · reflected in water", "Catamaran on blue sea · daytime · sky", "Aircraft flying between buildings · blue sky", "Small single-seat car · building shade · daytime", "Sports car in a light beam · blue lighting", "Waterside round exhibition hall · night · golden", "Minivan side view · dark stage · gold floor"];

  // ---------- Building the DOM ----------
  const lists = $('[data-webgl="lists"]');
  lists.innerHTML = lx.names.map((_, i) => `<li class="lx-art__list" data-webgl="item" data-label="${LABEL[i]}"></li>`).join("");
  $("[data-product-list]").outerHTML = lx.names.map((n, i) => `<section class="lx-product lx-product--${i + 1}" data-webgl="section">
      <div class="lx-product__heading"><span class="lx-product__sub">( PRODUCTS ${String(i + 1).padStart(2, "0")} )</span><h2 class="lx-product__title">${n.replace("\n", "<br>")}</h2></div>
      <div class="lx-product__button"><button type="button" class="lx-more" data-webgl-horizontal="${i + 1}"><span>VIEW MORE</span><i class="lx-more__icon"></i></button></div>
    </section>`).join("");
  const wrap = $('[data-horizontal="wrap"]'), contents = $('[data-horizontal="contents"]');
  $("[data-detail-titles]").innerHTML = `<span>${[...lx.names, lx.names[0]].map((n) => `<span>${n.replace("\n", " ")}</span>`).join("")}</span>`;
  $("[data-detail-nos]").innerHTML = [...lx.names, lx.names[0]].map((_, i) => `<span>${String((i % N) + 1).padStart(2, "0")}</span>`).join("");
  contents.innerHTML = lx.names.map((n, i) => `<section class="lx-dp" data-dp="${i + 1}" ${i ? "hidden" : ""}>
      <div class="lx-dp__intro"><div class="lx-dp__heading"><span class="lx-dp__sub">( PRODUCTS ${String(i + 1).padStart(2, "0")} )</span><h2 class="lx-dp__title">${n.replace("\n", "<br>")}</h2><i class="lx-dp__border"></i></div><span class="lx-dp__visual wf-img" data-label="${LABEL[i]}"></span></div>
      <div class="lx-dp__sec1"><div class="lx-dp__heading"><span class="lx-dp__sub">${n.replace("\n", " ")}</span><h2 class="lx-dp__title">DISCOVER<br>SOMETHING</h2><i class="lx-dp__border"></i><p class="lx-dp__text">Your short line goes here.</p></div><span class="lx-dp__visual wf-img" data-label="Another angle of the same product · Indoor lighting · Landscape 16:10"></span></div>
      <div class="lx-dp__sec2"><div class="lx-marquee" data-marquee="top"><div class="lx-marquee__track">${[1, 2, 3, 4].map((k) => `<span class="lx-marquee__item wf-img" data-label="Detail photo ${k} · 4:5"></span>`).join("")}</div></div><div class="lx-marquee" data-marquee="bottom"><div class="lx-marquee__track">${[5, 6, 7, 8].map((k) => `<span class="lx-marquee__item wf-img" data-label="Detail photo ${k} · 4:5"></span>`).join("")}</div></div></div>
      <div class="lx-dp__sec3"><p class="lx-dp__text">Your three-line product description here.<br>Your description continues here.<br>Your closing line here.</p><button type="button" class="lx-more lx-dp__next" data-horizontal-trigger="${(i + 1) % N + 1}"><span>NEXT PRODUCT</span><i class="lx-more__icon"></i></button></div>
    </section>`).join("");
  const items = $$('[data-webgl="item"]'), sections = $$('[data-webgl="section"]');
  const products = $('[data-webgl="products"]'), body = $('[data-webgl="body"]');
  const progress = $('[data-webgl="progress"]'), progressCurrent = $('[data-webgl="progress-current"]');

  // ---------- Plate art — stands in for photos, a placeholder painted in Skin colors (dark stage + golden bloom + label) ----------
  const css = getComputedStyle(html);
  const C = (v) => css.getPropertyValue(v).trim();
  const paint = (i) => {
    const w = PC ? 1024 : 640, h = PC ? 640 : 800, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    // Original photos are bright and colorful — painted at mid brightness with an ink text color so the board reads on a dark stage
    g.fillStyle = C("--kf-raised"); g.fillRect(0, 0, w, h);
    const bg = g.createLinearGradient(0, 0, w * (i % 2 ? 1 : 0.4), h);
    bg.addColorStop(0, C("--kf-ink")); bg.addColorStop(1, C("--kf-raised"));
    g.globalAlpha = 0.16 + (i % 4) * 0.05; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
    const glow = g.createRadialGradient(w * (0.3 + (i % 3) * 0.2), h * 0.7, 0, w * (0.3 + (i % 3) * 0.2), h * 0.7, w * 0.6);
    glow.addColorStop(0, C("--kf-accent")); glow.addColorStop(1, "transparent");
    g.globalAlpha = 0.45; g.fillStyle = glow; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.12; g.fillStyle = C("--kf-ink");
    g.beginPath(); g.roundRect(w * 0.22, h * 0.48, w * 0.56, h * 0.22, h * 0.08); g.fill();
    g.globalAlpha = 0.7; g.fillStyle = C("--kf-dim"); g.font = `${PC ? 22 : 20}px ${C("--kf-font-mono") || "monospace"}`; g.textAlign = "center";
    g.fillText(LABEL[i], w / 2, h * 0.9);
    return c;
  };

  // ---------- WebGL — one panel = One DOM cell (follows size·x), the vertex shader pushes the screen center back to make it round ----------
  const stageEl = $('[data-webgl="stage"]'), container = $('[data-webgl="container"]');
  const renderer = new THREE.WebGLRenderer({ canvas: stageEl, alpha: true, antialias: true });
  renderer.setClearColor(0xffffff, 0); // Not skin: transparent base (alpha 0)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
  const VS = `precision highp float;
    uniform float uCurve; uniform vec2 uView; varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 p = modelViewMatrix * vec4(position, 1.0);
      p.z -= cos(p.x / uView.x * 3.14159265) * uCurve;
      gl_Position = projectionMatrix * p;
    }`;
  const FS = `precision highp float;
    uniform sampler2D uTex; uniform vec2 uMesh; uniform vec2 uTexSize; uniform float uBright; varying vec2 vUv;
    void main() {
      vec2 r = vec2(min((uMesh.x / uMesh.y) / (uTexSize.x / uTexSize.y), 1.0), min((uMesh.y / uMesh.x) / (uTexSize.y / uTexSize.x), 1.0));
      vec2 uv = (vUv - 0.5) * r + 0.5;
      gl_FragColor = texture2D(uTex, uv) * uBright;
    }`;
  const geo = new THREE.PlaneGeometry(1, 1, 10, 10);
  const meshes = items.map((el, i) => {
    const cv = paint(i), tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, side: THREE.DoubleSide,
      uniforms: { uTex: { value: tex }, uMesh: { value: new THREE.Vector2(1, 1) }, uTexSize: { value: new THREE.Vector2(cv.width, cv.height) }, uBright: { value: CFG.basic.brightness }, uCurve: { value: 0 }, uView: { value: new THREE.Vector2(1, 1) } } });
    const m = new THREE.Mesh(geo, mat);
    m.userData.i = i; scene.add(m);
    return m;
  });
  let W = 0, H = 0;
  const resize = () => {
    const r = container.getBoundingClientRect();
    W = document.body.clientWidth; H = innerHeight;
    camera.aspect = r.width / r.height; camera.fov = 45; camera.updateProjectionMatrix();
    camera.position.set(0, 0, (0.5 * r.height) / Math.tan((0.5 * 45 * Math.PI) / 180));
    renderer.setSize(r.width, r.height, false);
  };
  resize();
  addEventListener("resize", resize);
  const sync = () => {
    meshes.forEach((m, i) => {
      const r = items[i].getBoundingClientRect();
      m.scale.set(r.width || 0.001, r.height || 0.001, 1);
      m.material.uniforms.uMesh.value.set(r.width || 1, r.height || 1);
      m.position.x = -W / 2 + r.width / 2 + r.left;
      m.position.y = CFG.basic.positionY;
      m.material.uniforms.uCurve.value = (W / 2) * CFG.basic.curve;
      m.material.uniforms.uView.value.set(W, H);
    });
  };
  // ---------- Gallery progress: 0→1 from above the first photo to below the last one plus the screen, the strip moves by −100% − pl ----------
  let galleryOn = false, currentIdx = 0;
  new IntersectionObserver(([e]) => (galleryOn = e.isIntersecting)).observe(products);
  const gallery = () => {
    if (!galleryOn) return;
    const a = sections[0].getBoundingClientRect(), total = sections.at(-1).getBoundingClientRect().bottom - a.top + innerHeight;
    const p = Math.min(Math.max((innerHeight - a.top) / total, 0), 1), n = -100 * p;
    lists.style.transform = `translateX(calc(${n}% + ${-p * CFG.gallery.paddingLeft}px))`;
    progress.style.setProperty("--progress", `${Math.abs(n)}`);
    const mid = document.body.clientWidth / 2;
    let best = 0, dist = Infinity;
    items.forEach((el, i) => { const r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < dist) { dist = d; best = i; } });
    if (best !== currentIdx) {
      currentIdx = best;
      products.dataset.current = String(best + 1);
      const h = progressCurrent.firstElementChild?.clientHeight || 19.5;
      gsap.to(progressCurrent, { duration: 0.6, ease: "power2.inOut", force3D: true, y: -h * best + "px" });
    }
  };
  // As in the original, draws at a 60fps frame cap
  let running = false, last = 0, raf = 0;
  const frame = (t) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const d = t - last;
    if (d < 1000 / 60 - 1) return;
    last = t - (d % (1000 / 60));
    gallery(); sync(); renderer.render(scene, camera);
  };
  lx.on("gl:start", () => { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); });
  lx.on("gl:stop", () => { running = false; cancelAnimationFrame(raf); });

  // ---------- Interaction — a finger cursor over a board, and on press only that board keeps its brightness (others .7) and a drawer opens ----------
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  const hit = (e) => { mouse.set((e.clientX / document.body.clientWidth) * 2 - 1, (-e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera); const h = ray.intersectObjects(meshes, false); return h.length ? h[0].object : null; };
  let hovered = null, lastMove = null, clickOn = true;
  const move = (e) => {
    lastMove = e;
    if (html.dataset.active !== "gallery") return;
    const m = hit(e);
    if (m !== hovered) { html.classList.toggle("is-pointer-enter", !!m); hovered = m; }
  };
  if (PC) { addEventListener("pointermove", move); addEventListener("scroll", () => lastMove && move(lastMove), { passive: true }); }
  const setActive = (m) => meshes.forEach((x) => gsap.to(x.material.uniforms.uBright, { duration: 1, ease: "power4.out", value: x === m ? 1 : 0.7 }));
  const resetActive = () => { meshes.forEach((x) => gsap.to(x.material.uniforms.uBright, { duration: 1, ease: "power4.out", value: CFG.basic.brightness })); gsap.to(items, { duration: 0.8, ease: "power3.inOut", scale: 1 }); };
  addEventListener("click", (e) => {
    if (!clickOn || html.dataset.active !== "gallery" || e.target.closest("button, a, .lx-menu, .lx-detail")) return;
    const m = hit(e);
    if (!m) return;
    e.preventDefault();
    const i = m.userData.i;
    if (PC) { setActive(m); html.classList.add("is-pointer-click"); setTimeout(() => html.classList.remove("is-pointer-click"), 200); html.classList.remove("is-pointer-enter"); }
    else focusItem(i);
    openDetail(i + 1);
  });
  $$("[data-webgl-horizontal]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); if (html.dataset.active !== "gallery") return; focusItem(+b.dataset.webglHorizontal - 1); openDetail(+b.dataset.webglHorizontal); }));
  const pageTop = (el) => el.getBoundingClientRect().top + scrollY;
  const focusItem = (i) => {
    const pl = CFG.gallery.paddingLeft, lw = lists.getBoundingClientRect().width, el = items[i];
    const s0 = pageTop(sections[0]), endY = pageTop(sections.at(-1)) + sections.at(-1).offsetHeight;
    let l = (el.offsetLeft - (innerWidth / 2 - el.getBoundingClientRect().width / 2) + pl) / (lw + pl);
    l = Math.max(0, Math.min(1, l));
    let y = l * (endY - s0 + innerHeight) - (innerHeight - s0);
    if (i === 0) y = s0 + 10 - innerHeight;
    lx.lenis.scrollTo(y, { duration: 1, easing: (t) => 1 - Math.pow(1 - t, 3) });
  };

  // ---------- Step choreography ----------
  const curve = { val: CFG.basic.curve }, posY = { val: 0 };
  const setCurve = () => (CFG.basic.curve = curve.val), setPos = () => (CFG.basic.positionY = posY.val);
  const stmtWidth = () => `calc(${100 / N}vw - ${CFG.statement.gap}px)`;
  const openingReset = () => {
    gsap.killTweensOf([lists, body, items, curve, posY]);
    html.dataset.active = "opening"; curve.val = CFG.opening.curve; setCurve();
    gsap.set(body, { paddingLeft: 0, x: 0 }); gsap.set(lists, { gap: CFG.opening.gap, scale: 1, x: "101%" }); gsap.set(items, { width: "50vw" });
  };
  const statement = () => {
    const s = CFG.statement;
    curve.val = s.curve; setCurve(); posY.val = 0; setPos();
    gsap.set(body, { paddingLeft: 0, x: "101%" }); gsap.set(lists, { gap: s.gap, scale: s.scale, x: "101%" }); gsap.set(items, { width: stmtWidth() });
    const tl = gsap.timeline();
    tl.to([lists, body], { duration: s.duration, ease: "expo.out", overwrite: true, x: "0%" }, "+=0.3");
    tl.eventCallback("onComplete", () => { html.dataset.active = "statement"; });
  };
  const opening = () => {
    openingReset();
    const o = CFG.opening, tl = gsap.timeline();
    tl.to(lists, { duration: o.duration, ease: "power3.out", x: "-86%" }, 0);
    tl.to(items, { duration: o.duration, ease: "power3.out", width: `${o.img}vw` }, 0);
    tl.to(body, { duration: 1, ease: "power3.in", x: "-101%" }, "-=0.7");
    tl.set([lists, body], { x: "101%", onComplete: () => { addTriggers(); scrollTo(0, 0); statement(); } });
  };
  const toGallery = () => {
    html.dataset.active = "animating";
    lx.lenis.scrollTo(products, { duration: 0, immediate: true, offset: 40 - innerHeight });
    lx.emit("lenis:stop");
    const g = CFG.gallery, tl = gsap.timeline();
    gsap.killTweensOf([lists, body, items, curve, posY]);
    tl.set([lists, body], { x: "0%" }); tl.set(items, { width: stmtWidth() }); tl.set(lists, { gap: CFG.statement.gap, scale: 1 });
    tl.to(curve, { duration: g.firstDuration, ease: "power3.out", onUpdate: setCurve, val: g.curve });
    tl.to(body, { duration: g.firstDuration, ease: "power3.out", scale: 2 }, "<");
    tl.to(items, { duration: g.lastDuration, ease: "power2.inOut", width: `${g.img}vw` }, "-=0.3");
    tl.to(body, { duration: g.lastDuration, ease: "power2.inOut", paddingLeft: g.paddingLeft, scale: 1 }, "<");
    tl.to(lists, { duration: g.lastDuration, ease: "power2.inOut", gap: g.gap }, "<");
    tl.to(posY, { duration: g.lastDuration, ease: "power2.inOut", onUpdate: setPos, val: g.positionY }, "<-0.3");
    tl.eventCallback("onComplete", () => { lx.emit("lenis:start"); html.dataset.active = "gallery"; });
  };
  const toStatement = () => {
    html.dataset.active = "animating";
    lx.lenis.scrollTo(products, { duration: 0.1, offset: -1 });
    lx.emit("lenis:stop");
    const s = CFG.statement, g = CFG.gallery, tl = gsap.timeline();
    gsap.killTweensOf([lists, body, items, curve, posY]);
    lists.style.transform = "";
    tl.to(body, { duration: g.lastDuration, ease: "power2.inOut", paddingLeft: 0, scale: s.scale });
    tl.to(lists, { duration: g.lastDuration, ease: "power2.inOut", gap: s.gap }, "<");
    tl.to(posY, { duration: g.lastDuration, ease: "power2.inOut", onUpdate: setPos, val: 0 }, "<");
    tl.to(items, { duration: g.lastDuration, ease: "power2.inOut", width: stmtWidth() }, "<");
    tl.to(curve, { duration: g.firstDuration, ease: "power3.out", onUpdate: setCurve, val: s.curve }, "<0.6");
    tl.eventCallback("onComplete", () => { lx.emit("lenis:start"); html.dataset.active = "statement"; });
  };
  const gallerySetup = () => {
    gsap.killTweensOf([lists, body, items, curve, posY]);
    curve.val = CFG.gallery.curve; setCurve(); posY.val = CFG.gallery.positionY; setPos();
    gsap.set(body, { paddingLeft: CFG.gallery.paddingLeft, scale: 1, x: 0 }); gsap.set(items, { width: `${CFG.gallery.img}vw` }); gsap.set(lists, { gap: CFG.gallery.gap, x: 0 });
  };

  // ---------- Sentence section scroll ----------
  const sTitle = $('[data-scene="statement-title"]'), sBg = $('[data-scene="statement-bg"]'), sScroll = $('[data-scene="scroll"]'), sBody = $('[data-scene="statement-body"]');
  let triggered = false;
  const addTriggers = () => {
    if (triggered) return;
    triggered = true;
    ScrollTrigger.create({ trigger: sBody, start: "clamp(top bottom+=100)", end: "+=" + innerHeight / 2, scrub: true,
      onUpdate: (s) => { if (html.dataset.active === "statement") gsap.to([sTitle, sBg, sScroll], { "--progress": s.progress, ease: "none" }); } });
    ScrollTrigger.create({ trigger: sBody, start: "clamp(bottom bottom)",
      onEnter: () => { if (!lx.animation) return; toGallery(); gsap.killTweensOf(sBg); gsap.to(sBg, { "--progress": 0, duration: 1, ease: "expo.inOut" }); },
      onLeaveBack: () => { if (!lx.animation) return; toStatement(); gsap.killTweensOf(sBg); gsap.to(sBg, { "--progress": 1, duration: 1, ease: "expo.inOut" }); } });
    // Schedule — when visible, the background (1.5s) and cover (2s) fill in turn and the text spreads through a round mask
    const sched = $('[data-scene="schedule"]'), sbg = $('[data-scene="schedule-bg"]'), scov = $('[data-scene="schedule-cover"]');
    const marks = $$(".lx-schedule__detail, .lx-schedule__book");
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        html.dataset.active = "schedule";
        gsap.killTweensOf([sbg, scov]);
        marks.forEach((m) => m.classList.remove("is-fx-in", "is-fx-done"));
        const tl = gsap.timeline();
        tl.set([sbg, scov], { autoAlpha: 0 });
        tl.to(sbg, { autoAlpha: 1, duration: 1.5, ease: "power2.out" }, "+=0.2");
        tl.to(scov, { autoAlpha: 1, duration: 2, ease: "power2.out" }, "-=0.6");
        tl.call(() => marks.forEach((m) => m.dispatchEvent(new Event("fx:play"))), [], "<+=0.6");
      } else if (html.dataset.active === "schedule") html.dataset.active = "gallery";
    }).observe(sched);
  };

  // ---------- Horizontal drawer ----------
  const status = { titles: $("[data-detail-titles] > span"), nos: $("[data-detail-nos]") };
  const dlenis = new Lenis({ wrapper: wrap, content: contents, orientation: PC ? "horizontal" : "vertical", gestureOrientation: PC ? "both" : "vertical" });
  dlenis.stop();
  const dprog = $('[data-horizontal="progress"]');
  const dtick = (t) => { dlenis.raf(t * 1000); const max = (PC ? contents.scrollWidth - innerWidth : contents.scrollHeight - innerHeight) || 1; dprog.style.setProperty("--progress", `${Math.min(Math.max((dlenis.scroll / max) * 100, 0), 100)}`); };
  let detailOpen = false;
  const showProduct = (n) => {
    wrap.dataset.horizontalCurrent = String(n);
    $$("[data-dp]", contents).forEach((s) => (s.hidden = +s.dataset.dp !== n));
    status.titles.style.transform = `translateY(${-(n - 1) * 100 / (N + 1)}%)`;
    status.nos.style.transform = `translateY(${-(n - 1) * 100 / (N + 1)}%)`;
    dlenis.resize();
  };
  const dStart = () => { gsap.ticker.add(dtick); dlenis.start(); };
  const dStop = () => { gsap.ticker.remove(dtick); dlenis.stop(); };
  lx.on("detail:resume", dStart);
  const openDetail = (n) => {
    showProduct(n);
    const tl = gsap.timeline({ defaults: { duration: 1.2, ease: "expo.inOut" } });
    tl.set(wrap, { autoAlpha: 0, clipPath: PC ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)", display: "block", scrollTo: { x: 0, y: 0 } });
    tl.to(wrap, { autoAlpha: 1, clipPath: PC ? "inset(0% 0 0 0)" : "inset(0 0% 0 0)" });
    tl.call(() => { clickOn = false; html.dataset.active = "detail"; }, [], "<");
    tl.eventCallback("onComplete", () => { html.classList.remove("is-pointer-click", "is-pointer-enter"); resetActive(); lx.emit("gl:stop"); lx.emit("lenis:stop"); dStart(); detailOpen = true; });
  };
  const changeDetail = (n) => {
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "expo.inOut" } });
    tl.to(contents, { clipPath: PC ? "inset(0 0 100% 0)" : "inset(0 0 0 100%)" });
    tl.call(() => { showProduct(n); dlenis.scrollTo(0, { duration: 0.6 }); });
    tl.set(contents, { clipPath: PC ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)" }, "<");
    tl.to(contents, { clipPath: PC ? "inset(0% 0 0 0)" : "inset(0 0% 0 0)" }, "<+=0.4");
  };
  const closeToGallery = () => {
    if (!detailOpen) return;
    const n = +wrap.dataset.horizontalCurrent;
    html.dataset.active = "gallery"; clickOn = true;
    lx.emit("gl:start"); lx.emit("lenis:start"); lx.animation = true;
    const tl = gsap.timeline({ defaults: { duration: 1.2, ease: "expo.inOut" } });
    tl.to(wrap, { clipPath: PC ? "inset(0 0 100% 0)" : "inset(0 0 0 100%)", display: "none", onComplete: () => { dStop(); detailOpen = false; } });
    tl.call(() => focusItem(n - 1), [], "<+=0.3");
  };
  $('[data-horizontal="close"]').addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); closeToGallery(); });
  $$("[data-horizontal-trigger]", contents).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); changeDetail(+b.dataset.horizontalTrigger); }));
  // Detail photo band — two rows flowing up and down (PC 1.2px/frame), with the detail scroll speed added via lerp .1
  const marquees = $$("[data-marquee]", contents);
  let mPos = 0, mSpeed = 0, lastScroll = 0;
  gsap.ticker.add(() => {
    if (!detailOpen || reduce) return;
    const v = dlenis.scroll - lastScroll; lastScroll = dlenis.scroll;
    mSpeed += ((PC ? 1.2 : 0.8) + Math.abs(v) * 0.2 - mSpeed) * 0.1;
    mPos += mSpeed;
    marquees.forEach((m) => { const t = m.firstElementChild, h = t.scrollHeight / 2 || 1; const y = (mPos % h); t.style.transform = `translateY(${m.dataset.marquee === "top" ? -y : y - h}px)`; });
  });
  marquees.forEach((m) => { const t = m.firstElementChild; t.innerHTML += t.innerHTML; });

  // Where the menu led
  lx.on("go:top", () => { html.dataset.active = "statement"; closeDetailNow(); scrollTo(0, 0); lx.lenis.scrollTo(0, { immediate: true }); setTimeout(() => statement(), 800); gsap.killTweensOf([sTitle, sBg, sScroll]); gsap.to([sTitle, sBg, sScroll], { "--progress": 0, delay: 1 }); });
  lx.on("go:statement", () => { html.dataset.active = "statement"; closeDetailNow(); lx.lenis.scrollTo($("#statement").offsetTop, { immediate: true }); setTimeout(() => statement(), 800); gsap.set([sTitle, sBg, sScroll], { "--progress": 1 }); });
  lx.on("go:gallery", () => { html.dataset.active = "gallery"; closeDetailNow(); gallerySetup(); lx.lenis.scrollTo(pageTop(products) - innerHeight + 40, { immediate: true }); lx.animation = true; });
  lx.on("go:detail", (n) => { if (html.dataset.active === "statement") gallerySetup(); lx.lenis.scrollTo(pageTop(products) - innerHeight + 40, { immediate: true }); gsap.set([sTitle, sScroll], { "--progress": 1 }); lx.emit("lenis:stop"); detailOpen ? changeDetail(n) : openDetail(n); });
  const closeDetailNow = () => { if (!detailOpen) return; dStop(); detailOpen = false; gsap.set(wrap, { display: "none" }); clickOn = true; lx.emit("gl:start"); };

  // ---------- Loader → open ----------
  const splash = { bg: $('[data-splash="bg"]'), header: $('[data-splash="header"]'), scroll: $('[data-splash="scroll"]'), title: $('[data-splash="title"]') };
  const loader = () => new Promise((done) => {
    const lb = $('[data-loading="body"]'), lp = $('[data-loading="progress"]');
    const hold = setInterval(() => { if ((scrollY || html.scrollTop) === 0) { clearInterval(hold); html.dataset.active = "opening"; } else scrollTo({ behavior: "instant", left: 0, top: 0 }); }, 100);
    if (!lb) return done();
    // The original raises the % each time an image file finishes downloading — the copy’s panel images are canvases, so it counts through sixteen in turn as if downloading them
    const total = 16, r = { val: 0 };
    let got = 0;
    const step = () => {
      got++;
      gsap.to(r, { duration: 1.5, ease: "power2.out", val: Math.floor((got / total) * 100),
        onUpdate: () => (lp.textContent = String(Math.floor(r.val)).padStart(2, "0")),
        onComplete: () => { if (got !== total) return; gsap.set(window, { scrollTo: 0 }); gsap.to(lb, { autoAlpha: 0, delay: 0.3, duration: 1, ease: "power2.inOut", filter: "blur(0.6rem)", onComplete: () => { lb.remove(); document.body.classList.add("is-loaded"); done(); } }); } });
    };
    for (let k = 0; k < total; k++) setTimeout(step, 80 + k * 45 + ((k * 37) % 60));
  });
  (async () => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    gsap.set([splash.header, splash.scroll, splash.bg], { autoAlpha: 0 });
    lx.emit("lenis:stop");
    openingReset();
    if (reduce) { $('[data-loading="body"]')?.remove(); gsap.set([splash.header, splash.scroll, splash.bg], { autoAlpha: 1 }); addTriggers(); statement(); splash.title.classList.add("is-fx-done"); lx.emit("gl:start"); lx.emit("lenis:start"); return; }
    await loader();
    lx.emit("gl:start");
    const o = CFG.opening.duration, tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power2.out" } });
    tl.call(() => { opening(); ScrollTrigger.refresh(); });
    tl.to(splash.bg, { autoAlpha: 1, duration: 4 }, `${o}`);
    tl.call(() => { splash.title.dispatchEvent(new Event("fx:play")); ScrollTrigger.refresh(); }, [], `${o + CFG.statement.duration}`);
    tl.to([splash.header, splash.scroll], { autoAlpha: 1, onComplete: () => lx.emit("lenis:start") }, "<+=0.8");
  })();
})();
