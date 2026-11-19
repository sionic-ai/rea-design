(() => {
  const { reduce, remPx } = window.ED;
  // 13 services — photo-slot labels and the color the original assigned to each service
  const SERVICES = [
    "Home renovation · warm interior · landscape", "Hair salon interior · White curved wall · Landscape", "Office lounge · ceiling pipes · landscape", "Wave-roof shopping street · clear day · horizontal",
    "Wooden welfare facility · forest · landscape", "New home living room · Afternoon light · Landscape", "Rental building exterior · cloudy sky · landscape", "White office space · Natural light · Landscape", "Trailer store · parking lot · landscape",
    "Printed branding · On a desktop · Landscape", "Plant-filled restaurant · window light · landscape", "Leather sofa furniture shop · warm lighting · landscape", "Small café · Afternoon by the window · Landscape",
  ].map((label, i) => ({ label, n: String(i + 1).padStart(2, "0") }));
  const SERVICE_COLORS = ["#F23E94", "#FF5C00", "#00B39D", "#0070BA", "#CCC193", "#8B35DB", "#7BC900", "#F8C400", "#A8A197", "#2EC3CE", "#87693E", "#3D657C", "#CCC193"]; // Not Skin: each service uses its own site’s color, so it stays the same even when the Skin changes
  const ABOUT = [
    { c: "var(--site-c-green)", w1: "PROMISE", w2: "MVV", deco: "ed-hand-open", label: "Plaza stairs and people · daytime · ultra-wide landscape" },
    { c: "var(--site-c-yellow)", w1: "COMPANY", w2: "HISTORY", deco: "ed-hand-thumb", label: "Staff gathered at workbench · bright interior · wide landscape" },
    { c: "var(--site-c-orange)", w1: "GROUP", w2: "MEMBERS", deco: "ed-hand-point", label: "Store entrance with signboard · indoor · wide landscape" },
    { c: "var(--site-c-blue)", w1: "LOCAL", w2: "ACTS", deco: "ed-hand-open", label: "Wavy-roof shopping row · clear sky · wide landscape" },
  ];

  // 4 cards in the About panel
  const card = document.querySelector(".about__card");
  card.insertAdjacentHTML("afterbegin", ABOUT.map((a, i) => `
    <div class="aslide" style="--c:${a.c}" data-i="${i}">
      <p class="aslide__num">0${i + 1}</p>
      <div class="aslide__row"><div class="aslide__rowIn"><span class="aslide__word">${a.w1}</span><span class="aslide__word is-c">&amp;</span><div class="aslide__img is-s wf-img" data-label="Small photo · Person · Portrait"></div></div></div>
      <div class="aslide__row"><div class="aslide__rowIn"><svg class="aslide__deco" data-deco><use href="#${a.deco}"/></svg><div class="aslide__img wf-img" data-label="${a.label}"></div><span class="aslide__word is-c">${a.w2}</span><svg class="aslide__deco" data-deco><use href="#${a.deco}"/></svg></div></div>
      <div class="aslide__foot"><p class="aslide__text">Your three-line intro here for this bundle. What the company promises,<br>What work has been done and how it connects with the region<br>We list them in order.</p>
        <a class="ed-more" href="about.html" style="--c:${a.c}">MORE DETAILS<span class="ed-more__hand"><svg><use href="#ed-hand-point"/></svg></span></a></div>
    </div>`).join(""));
  const slides = [...card.querySelectorAll(".aslide")];
  const dots = [...card.querySelectorAll(".about__dots i")];

  // ── Service gallery — rebuilt the original WebGL structure with our own shader (three).
  //    Camera fov 75 · z 7.5. 13 panels (height = half the visible height, 16:9, size random from 0.8 to 1 in 0.05 steps) line up horizontally spaced 0.25 of the panel width apart,
  //    During the pinned 1100vh, each board comes to the center in turn from the first to the last. Toward the screen edges it bends back by (x/1.8)², so it looks like a round wall.
  const svc = document.querySelector(".svc");
  const canvas = svc.querySelector(".svc__gl");
  const titleEl = svc.querySelector(".svc__titleIn");
  const labelEl = svc.querySelector(".svc__label .ed-pill");
  const numEl = svc.querySelector(".svc__num");
  const pointer = svc.querySelector(".svc__newtab");
  const isMobile = () => matchMedia("(max-width: 960px)").matches;
  SERVICES.forEach((_, i) => svc.insertBefore(Object.assign(document.createElement("div"), { className: "svc__item" }), svc.querySelector(".svc__ui")).setAttribute("data-section", i));

  const VERT = `
    uniform float uBow;
    uniform float uSkew;
    uniform float uDepth[13];
    attribute float aTile;
    varying vec2 vUv;
    varying float vTile;
    void main() {
      vUv = uv;
      vTile = aTile;
      vec3 p = position;
      // On fast scroll, the panel’s center rows get pushed sideways and bend (top and bottom edges stay in place)
      p.x += sin(uv.y * 3.14159265) * uSkew;
      p.z += uDepth[int(aTile + 0.5)];
      vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
      vec4 clip = projectionMatrix * viewMatrix * world;
      // The farther from the horizontal center of the screen, the further back it is pushed — a bend that makes a flat panel look stuck to a round wall
      float edge = abs(clip.x / clip.w) / 1.8;
      world.z -= edge * edge * uBow;
      gl_Position = projectionMatrix * viewMatrix * world;
    }`;
  const FRAG = `
    uniform sampler2D uAtlas;
    uniform float uHover[13];
    varying vec2 vUv;
    varying float vTile;
    const float ASPECT = 16.0 / 9.0;
    void main() {
      vec2 cell = vec2(mod(vTile, 4.0), floor(vTile / 4.0));
      vec4 c = texture2D(uAtlas, vec2((cell.x + vUv.x) / 4.0, 1.0 - (cell.y + 1.0 - vUv.y) / 4.0));
      // On hover, grayscale spreads in a circle from the center of the panel (the spreading edge of 0.12 is soft)
      float d = length(vec2((vUv.x - 0.5) * ASPECT, vUv.y - 0.5)) / length(vec2(0.5 * ASPECT, 0.5));
      float r = uHover[int(vTile + 0.5)] * 1.12;
      float gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(mix(c.rgb, vec3(gray), 1.0 - smoothstep(r - 0.12, r, d)), 1.0);
    }`;

  // Photo slot: draws the same background, diagonal and label as .wf-img on one sheet (4×4) of the 13-piece set. A faint service color is laid down so the spread to monochrome is visible.
  const atlasCanvas = document.createElement("canvas");
  const drawAtlas = () => {
    const W = 512, H = 288, g = atlasCanvas.getContext("2d");
    atlasCanvas.width = W * 4;
    atlasCanvas.height = H * 4;
    const probe = Object.assign(document.createElement("div"), { className: "wf-img" });
    probe.dataset.label = "·";
    document.body.append(probe);
    // Computed style is a live object and becomes empty once the element is removed — read everything before detaching
    const cs = getComputedStyle(probe), after = getComputedStyle(probe, "::after");
    const fill = cs.backgroundColor, line = cs.getPropertyValue("--wf-line").trim() || after.color;
    const tag = { backgroundColor: after.backgroundColor, color: after.color, fontFamily: after.fontFamily };
    probe.remove();
    SERVICES.forEach((s, i) => {
      const x = (i % 4) * W, y = Math.floor(i / 4) * H;
      g.fillStyle = fill;
      g.fillRect(x, y, W, H);
      g.globalAlpha = 0.35;
      g.fillStyle = SERVICE_COLORS[i];
      g.fillRect(x, y, W, H);
      g.globalAlpha = 1;
      g.strokeStyle = line;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x, y); g.lineTo(x + W, y + H); g.moveTo(x + W, y); g.lineTo(x, y + H);
      g.stroke();
      const text = `Service ${s.n} · ${s.label}`;
      g.font = `500 17px ${tag.fontFamily}`;
      const tw = g.measureText(text).width;
      g.fillStyle = tag.backgroundColor;
      g.fillRect(x + W / 2 - tw / 2 - 12, y + H / 2 - 16, tw + 24, 32);
      g.fillStyle = tag.color;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, x + W / 2, y + H / 2 + 1);
    });
  };
  drawAtlas();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
  camera.position.z = 7.5;
  const atlas = new THREE.CanvasTexture(atlasCanvas);
  document.fonts?.ready.then(() => { drawAtlas(); atlas.needsUpdate = true; });
  const uniforms = { uAtlas: { value: atlas }, uBow: { value: 0 }, uSkew: { value: 0 }, uHover: { value: new Float32Array(13) }, uDepth: { value: new Float32Array(13) } };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
  const outer = new THREE.Group(), inner = new THREE.Group();
  outer.add(inner);
  scene.add(outer);
  const scales = SERVICES.map(() => 0.8 + 0.05 * Math.floor(Math.random() * 5));
  const view = { w: 0, h: 0 }, plane = { w: 0, h: 0 };
  let mesh = null, xs = [], travel = 0;
  const layout = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    view.h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    view.w = view.h * camera.aspect;
    plane.h = 0.5 * view.h;
    plane.w = (plane.h * 16) / 9;
    const gap = 0.25 * plane.w;
    let x = 0;
    xs = scales.map((s) => { const c = x + (plane.w * s) / 2; x += plane.w * s + gap; return c; });
    xs = xs.map((c) => c - (x - gap) / 2);
    uniforms.uBow.value = view.h * 0.5 * (isMobile() ? 0.25 : 1);
    if (mesh) (inner.remove(mesh), mesh.geometry.dispose());
    const geo = new THREE.PlaneGeometry(plane.w, plane.h, 48, 24);
    geo.setAttribute("aTile", new THREE.InstancedBufferAttribute(new Float32Array(SERVICES.map((_, i) => i)), 1));
    mesh = new THREE.InstancedMesh(geo, material, SERVICES.length);
    // The shader bends and pushes the panel outside its original surroundings — so don’t cull it as offscreen
    mesh.frustumCulled = false;
    const o = new THREE.Object3D();
    xs.forEach((cx, i) => { o.position.set(cx, 0, 0); o.scale.set(scales[i], scales[i], 1); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); });
    mesh.instanceMatrix.needsUpdate = true;
    inner.add(mesh);
    inner.position.x = gsap.utils.interpolate(-xs[0], -xs[xs.length - 1], travel);
  };
  layout();
  outer.position.x = view.w;
  addEventListener("resize", layout);

  // Drawn only while on screen (at rest, a blank picture with the panel group hidden) — slides in from one screen off to the right when the section top touches 25% of the screen, and exits to the left when pinning ends
  let active = false;
  const show = (on) => { active = on; outer.visible = on; if (!on) renderer.render(scene, camera); };
  ScrollTrigger.create({ trigger: svc, start: "top top", end: "bottom-=100vh bottom", scrub: true, onUpdate: (st) => { travel = st.progress; inner.position.x = gsap.utils.interpolate(-xs[0], -xs[xs.length - 1], travel); } });
  ScrollTrigger.create({ trigger: svc, start: "top 25%", end: "top top-=25%", onEnter: () => show(true), onLeaveBack: () => show(false), onUpdate: (st) => (outer.position.x = view.w * (1 - st.progress)) });
  ScrollTrigger.create({ trigger: svc, start: "bottom-=100vh bottom", end: "bottom-=100vh top", onLeave: () => show(false), onEnterBack: () => show(true), onUpdate: (st) => (outer.position.x = -view.w * st.progress) });

  // Big title letters rise from below one by one with back.out(1.7) 0.5s · 0.02s stagger, labels drop out 0.2s then come in over 0.4s, numbers roll over 0.3s power3.out
  let current = 0, hovered = -1, shown = -1;
  const showService = (i) => {
    if (i === shown) return;
    const dir = i > shown ? 1 : -1, first = shown < 0;
    shown = i;
    const s = SERVICES[i];
    titleEl.style.setProperty("--hover-color", SERVICE_COLORS[i]);
    titleEl.innerHTML = ["SERVICE", `NAME ${s.n}`].map((line) => `<span class="svc__line">${[...line].map((c) => `<span class="svc__ch">${c}</span>`).join("")}</span>`).join("");
    gsap.fromTo(titleEl.querySelectorAll(".svc__ch"), { opacity: 0, yPercent: 100 }, { opacity: 1, yPercent: 0, duration: reduce ? 0 : 0.5, ease: "back.out(1.7)", stagger: reduce ? 0 : 0.02 });
    const word = numEl.firstElementChild;
    if (first) {
      labelEl.textContent = `Service Category ${s.n}`;
      word.textContent = s.n;
      return;
    }
    gsap.timeline()
      .to(labelEl, { opacity: 0, yPercent: 50, duration: reduce ? 0 : 0.2, ease: "back.in(1.0)", onComplete: () => (labelEl.textContent = `Service Category ${SERVICES[shown].n}`) })
      .to(labelEl, { opacity: 1, yPercent: 0, duration: reduce ? 0 : 0.4, ease: "back.out(1.0)" });
    gsap.killTweensOf(word);
    gsap.to(word, { yPercent: -100 * dir, opacity: 0, duration: reduce ? 0 : 0.3, ease: "power3.out", onComplete: () => {
      word.textContent = SERVICES[shown].n;
      gsap.fromTo(word, { yPercent: 100 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduce ? 0 : 0.3, ease: "power3.out" });
    } });
  };
  const sync = () => {
    titleEl.toggleAttribute("data-hovering", hovered >= 0);
    showService(hovered >= 0 ? hovered : current);
  };
  showService(0);
  svc.querySelectorAll(".svc__item").forEach((el, i) => ScrollTrigger.create({ trigger: el, start: "top 25%", end: "bottom 25%", onEnter: () => ((current = i), sync()), onEnterBack: () => ((current = i), sync()) }));
  ScrollTrigger.create({
    trigger: svc, start: "top bottom", end: "bottom 105%",
    onLeave: () => gsap.to(".svc__ui", { opacity: 0, duration: 0.1, ease: "quart.out" }),
    onEnterBack: () => gsap.to(".svc__ui", { opacity: 1, duration: 0.1, ease: "quart.out" }),
  });

  // Cursor: picks a board only while inside the section (fit to the flat board, not the shader-bent shape — the original does the same)
  const mouse = { x: -1, y: -1 }, ndc = new THREE.Vector2(), ray = new THREE.Raycaster();
  const tileAt = (x, y) => {
    if (!active || !mesh) return -1;
    const r = svc.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return -1;
    ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(mesh, false)[0]?.instanceId ?? -1;
  };
  addEventListener("pointermove", (e) => e.pointerType === "mouse" && ((mouse.x = e.clientX), (mouse.y = e.clientY)), { passive: true });
  // Press and release within 8px (finger 18px) over the same panel to open it in a new tab
  let press = null;
  addEventListener("pointerdown", (e) => { if (e.isPrimary) press = { x: e.clientX, y: e.clientY, tile: tileAt(e.clientX, e.clientY), touch: e.pointerType === "touch" }; });
  addEventListener("pointerup", (e) => {
    if (!press || !e.isPrimary) return;
    const t = tileAt(e.clientX, e.clientY), moved = Math.hypot(e.clientX - press.x, e.clientY - press.y);
    if (t >= 0 && t === press.tile && moved <= (press.touch ? 18 : 8)) open("service.html", "_blank", "noopener,noreferrer");
    press = null;
  });

  // NEW TAB circle: follows the cursor late by 9, and tilts (±24°) by as much as the fast horizontal movement. On appear it grows in 0.3s quart.out and spins from -180° back upright in 0.6s
  gsap.set(pointer, { xPercent: -50, yPercent: -50, rotation: -15, opacity: 0, scale: 0 });
  const spin = { v: 0 }, pos = { x: 0, y: 0 }, last = { x: 0, y: 0 };
  let tilt = 0, on = false, spinTw = null, showTw = null;
  const showPointer = (v) => {
    if (on === v) return;
    on = v;
    showTw?.kill();
    spinTw?.kill();
    if (v) {
      pointer.style.visibility = "visible";
      spin.v = -180;
      spinTw = gsap.to(spin, { v: 0, duration: 0.6, ease: "quart.out" });
      showTw = gsap.to(pointer, { xPercent: -50, yPercent: -50, opacity: 1, scale: 1, duration: 0.3, ease: "quart.out" });
      return;
    }
    spin.v = 0;
    showTw = gsap.to(pointer, { xPercent: -50, yPercent: -50, rotation: -15, opacity: 0, scale: 0, duration: 0.25, ease: "quart.out", onComplete: () => on || (pointer.style.visibility = "hidden") });
  };
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const follow = (hit, dt) => {
    if (hit < 0) return showPointer(false);
    const box = pointer.offsetParent.getBoundingClientRect(), tx = mouse.x - box.left, ty = mouse.y - box.top;
    if (on) (pos.x = damp(pos.x, tx, 9, dt)), (pos.y = damp(pos.y, ty, 9, dt));
    else (pos.x = last.x = tx), (pos.y = last.y = ty), (tilt = 0);
    const dx = pos.x - last.x, len = Math.hypot(dx, pos.y - last.y);
    tilt = damp(tilt, gsap.utils.clamp(-24, 24, (len / dt) * (len ? dx / len : 0) * 0.02), 12, dt);
    last.x = pos.x;
    last.y = pos.y;
    pointer.style.left = `${pos.x}px`;
    pointer.style.top = `${pos.y}px`;
    gsap.set(pointer, { rotation: -15 + tilt + spin.v });
    showPointer(true);
  };

  // Every frame: bends the plate by the scroll speed (±5% of plate width), and the raised plate lags behind with grayscale blur 4 and recoil (plate height 0.18) 10
  let skew = 0;
  gsap.ticker.add((time, deltaMs) => {
    if (!active) return;
    const dt = Math.max(0.001, deltaMs / 1000), lenis = window.ED.lenis;
    const v = lenis && Math.abs(lenis.velocity) >= 0.01 ? lenis.velocity : 0, max = 0.05 * plane.w;
    skew = damp(skew, gsap.utils.clamp(-max, max, -v * plane.w * 0.004 * (isMobile() ? 0.25 : 1)), 16, dt);
    if (v === 0 && Math.abs(skew) < 0.001) skew = 0;
    uniforms.uSkew.value = skew;
    const hit = isMobile() || mouse.x < 0 ? -1 : tileAt(mouse.x, mouse.y);
    if (hit !== hovered) ((hovered = hit), sync());
    svc.style.cursor = hit >= 0 ? "pointer" : "";
    follow(hit, dt);
    for (let i = 0; i < SERVICES.length; i++) {
      uniforms.uHover.value[i] = damp(uniforms.uHover.value[i], i === hit ? 1 : 0, 4, dt);
      uniforms.uDepth.value[i] = damp(uniforms.uDepth.value[i], i === hit ? -0.18 * plane.h : 0, 10, dt);
    }
    renderer.render(scene, camera);
  });

  // About card (original values): the two big title lines are bound to scroll per cell and flip on the x axis as they enter and leave (±50% · rotateX ∓80° · vertical 0),
  // The text and number below rise from 120% below when the slot changes and leave upward (.5s), and the hand ornament exits with .3s back.in(2) and pops back in with .5s back.out(2).
  // One eye moves between the title plate’s four spots for each cell with 1s back.inOut(1.5)
  const parts = (k) => ({ lines: slides[k].querySelectorAll(".aslide__rowIn"), bottom: slides[k].querySelectorAll(".aslide__foot, .aslide__num"), deco: slides[k].querySelectorAll("[data-deco]") });
  const EYE_AT = [[0, 0], [100, 50], [50, 0], [20, 0]];
  const aboutEye = card.querySelector(".about__eye");
  let aboutCur = 0;
  const decoIn = (k) => gsap.fromTo(parts(k).deco, { opacity: 0, yPercent: 100 }, k === 3 ? { opacity: 1, yPercent: 0, ease: "back.out(4)" } : { opacity: 1, yPercent: 0, duration: 0.5, ease: "back.out(2)" });
  const decoOut = (k) => gsap.to(parts(k).deco, { opacity: 0, yPercent: 50, duration: 0.3, ease: "back.in(2)" });
  const showSlide = (i) => {
    if (i === aboutCur) return;
    const fwd = i > aboutCur;
    gsap.to(parts(aboutCur).bottom, { opacity: 0, yPercent: fwd ? -120 : 120 });
    gsap.to(parts(i).bottom, { opacity: 1, yPercent: 0 });
    decoOut(aboutCur); decoIn(i);
    gsap.to(aboutEye, { left: `${EYE_AT[i][0]}%`, top: `${EYE_AT[i][1]}%`, duration: 1, ease: "back.inOut(1.5)" });
    dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
    aboutCur = i;
  };
  slides.forEach((_, k) => {
    gsap.set(parts(k).bottom, k ? { opacity: 0, yPercent: 120 } : { opacity: 1, yPercent: 0 });
    gsap.set(parts(k).lines, k ? { opacity: 0, yPercent: 50 } : { opacity: 1, yPercent: 0 });
    gsap.set(parts(k).deco, { opacity: 0, yPercent: -50 });
  });
  if (reduce) gsap.set(parts(0).deco, { opacity: 1, yPercent: 0 }); else decoIn(0);
  dots[0].classList.add("is-active");

  // ── Hero cylinder — the original WebGL structure rebuilt with our own shader (three).
  //    Camera fov 75 · z 7.5. Radius = Visible width ×.7, height = Squash a cylinder of visible height ×.4 into an ellipse by shrinking only its depth by ×.4,
  //    Divide the circumference into 10 cells (cell width = Height×16/9 ÷ .98, 2% between cells) splits it into 3×3 and joins nine frames of the grouped video (the first cell is the 9th frame).
  //    The front half of the ring is drawn by the canvas in front of the title, the back half by the canvas behind. The cylinder is tilted by z .06π and x −.07π.
  //    Entrance: rises from below by the visible height in 3s power3.out while the video row spins one full turn (−1→0) and settles in place.
  //    Scroll: tracks 0→3 with damping (7) until the Hero is fully passed, tilting −.2π on z and +.5π on x and rising 1.8 screens (phone ×.4).
  //    While the end of the hero leaves the screen, it lifts out a full screen as a whole, and the center line of the cylinder bends sideways by the scroll speed.
  const heroGL = (() => {
    const canvases = [...document.querySelectorAll(".hero__gl")];
    if (!canvases.length || !window.THREE) return null;
    const { lenis } = window.ED;
    const FOV = 75, CAM_Z = 7.5, TILE_ASPECT = 16 / 9;
    const ROT_Z = 0.06 * Math.PI, ROT_X = -0.07 * Math.PI, TURN_Z = -0.2 * Math.PI, TURN_X = 0.5 * Math.PI;
    const VERT = `
      uniform float uRadius;
      uniform float uSkew;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        float a = (uv.x - 0.5) * 6.28318530718;
        // Wrapped by circumference angle, depth squashed to .4 for an elliptical cylinder. The closer to center, the more it shifts sideways by scroll speed
        vec3 p = vec3(uRadius * sin(a), position.y, uRadius * cos(a) * 0.4);
        p.x += sin(uv.y * 3.14159265) * uSkew;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
      }`;
    const FRAG = `
      uniform sampler2D uVideo;
      uniform float uRepeat;
      uniform float uOffset;
      uniform float uSide;
      varying vec2 vUv;
      void main() {
        float a = (vUv.x - 0.5) * 6.28318530718;
        if (cos(a) * uSide < 0.0) discard;                 // Front canvas shows only the front half, back canvas only the back half
        float s = (vUv.x - 0.5) * uRepeat + 0.85 + uOffset; // Position on the line starting at the back center (outside 0~1 left empty)
        if (s < 0.0 || s > 1.0) discard;
        float slot = s * 10.0;
        float f = fract(slot);
        if (f < 0.01 || f > 0.99) discard;                 // 2% gap between cells
        float idx = min(floor(slot), 9.0);
        float img = idx < 0.5 ? 8.0 : idx - 1.0;
        vec2 local = (vec2((f - 0.01) / 0.98, vUv.y) - 0.5) / 1.01 + 0.5; // Crop 1% off the video frame edges to hide the seam
        float tile = 8.0 - img;                             // Bundle videos are ordered 9 8 7 / 6 5 4 / 3 2 1
        vec2 cell = vec2(mod(tile, 3.0), 2.0 - floor(tile / 3.0));
        vec4 c = texture2D(uVideo, (local + cell) / 3.0);
        float alpha = c.a;
        if (uSide < 0.0) alpha *= min(smoothstep(0.0, 0.04, vUv.x), smoothstep(1.0, 0.96, vUv.x)); // Blur the back-face seam
        if (alpha <= 0.001) discard;
        gl_FragColor = vec4(c.rgb, alpha);
      }`;

    const views = canvases.map((canvas) => {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      camera.position.set(0, 0, CAM_Z);
      const tex = window.ED.tiles.texture();
      const uniforms = { uVideo: { value: tex }, uRadius: { value: 1 }, uSkew: { value: 0 }, uRepeat: { value: 1 }, uOffset: { value: 0 }, uSide: { value: canvas.classList.contains("is-back") ? -1 : 1 } };
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, side: THREE.DoubleSide }));
      const lift = new THREE.Group(), intro = new THREE.Group();
      lift.add(mesh); intro.add(lift); scene.add(intro);
      return { canvas, renderer, scene, camera, uniforms, mesh, lift, intro };
    });

    let visW = 1, visH = 1, dims = null;
    const size = () => {
      const w = innerWidth, h = innerHeight;
      visH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2) * CAM_Z;
      visW = visH * (w / h);
      const radius = 0.7 * visW, height = 0.4 * visH, around = 2 * Math.PI * radius;
      const tileW = height * TILE_ASPECT;
      dims = { radius, height, tileW, repeat: around / (10 * (tileW / 0.98)), base: (isMobile() ? 0.8 : 0.9) * height };
      views.forEach((v) => {
        v.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        v.renderer.setSize(w, h, false);
        v.camera.aspect = w / h; v.camera.updateProjectionMatrix();
        v.mesh.geometry.dispose();
        v.mesh.geometry = new THREE.PlaneGeometry(around, height, 160, 1);
        v.uniforms.uRadius.value = radius;
        v.uniforms.uRepeat.value = dims.repeat;
        v.mesh.position.z = radius * (0.16 - 0.4);
      });
    };
    size();
    addEventListener("resize", size);

    const damp = (x, y, k, dt) => x + (y - x) * (1 - Math.exp(-k * dt));
    const st = { introY: -visH, spin: -1, turn: 0, turnTo: 0, out: 0, outTo: 0, vel: 0, skew: 0, on: false };
    const hero = document.getElementById("hero");
    ScrollTrigger.create({ trigger: hero, start: "top bottom", end: "bottom top-=50%", onToggle: (s) => { st.on = s.isActive; canvases.forEach((c) => c.classList.toggle("is-on", s.isActive)); } });
    ScrollTrigger.create({ trigger: hero, start: "top-=1px top", end: "bottom top", onUpdate: (s) => (st.turnTo = 3 * s.progress) });
    ScrollTrigger.create({ trigger: hero, start: "bottom bottom", end: "bottom top", onUpdate: (s) => (st.outTo = s.progress) });

    gsap.ticker.add((t, dtMs) => {
      if (!st.on || !dims) return;
      const dt = Math.max(1, dtMs) / 1000;
      const k = isMobile() ? 0.4 : 1;
      st.turn = Math.abs(st.turn - st.turnTo) < 1e-5 ? st.turnTo : damp(st.turn, st.turnTo, 7, dt);
      st.out = Math.abs(st.out - st.outTo) < 1e-5 ? st.outTo : damp(st.out, st.outTo, 7, dt);
      const v = lenis?.velocity ?? 0;
      const vel = Math.abs(v) < 0.01 ? 0 : v;
      st.vel = damp(st.vel, vel, 5, dt);
      const reach = 1.02 * dims.tileW;
      st.skew = damp(st.skew, gsap.utils.clamp(-reach, reach, -st.vel * dims.tileW * 1.004), 6, dt);
      if (vel === 0 && Math.abs(st.skew) < 0.001) { st.vel = 0; st.skew = 0; }
      const n = st.turn / 3;
      views.forEach((w) => {
        window.ED.tiles.frame(t, w.uniforms.uVideo.value);
        w.intro.position.y = st.introY;
        w.lift.position.y = st.out * visH * k;
        w.mesh.rotation.set(ROT_X + n * TURN_X, 0, ROT_Z + n * TURN_Z);
        w.mesh.position.y = -dims.base + n * visH * 1.8 * k;
        w.uniforms.uOffset.value = -(st.spin + st.turn);
        w.uniforms.uSkew.value = st.skew;
        w.renderer.render(w.scene, w.camera);
      });
    });

    return {
      start() {
        if (reduce) { st.introY = 0; st.spin = 0; return; }
        st.introY = -visH; st.spin = -1;
        gsap.to(st, { introY: 0, spin: 0, duration: 3, ease: "power3.out" });
      },
    };
  })();
  if (reduce) heroGL?.start();

  // ── Careers photo pillar — the original WebGL weave rebuilt with our own shader (three). Camera fov 75 · z 7.5.
  //    Radius = Four columns of photo panels lined up vertically on the surface of a horizontal-axis cylinder ×3 the visible height: left front (x −5.5, five panels), left back (x −4.4, depth −1.4, three panels, brightness .32),
  //    Same on the right. The pillar turns ±.18π in y along the cylinder axis to face inward. Panel width = 4 × (random 0.8~1 in .05 steps), height = Width ÷ photo ratio (512:341), gap 1.2.
  //    From when the intro card’s bottom edge reaches the top of the screen until the careers section’s bottom edge is at screen center, the first panel flows from below the screen → the last panel upward (end value ×1.4) along a cylinder,
  //    The first and last 10% fade. The farther behind the cylinder, the darker down to .45, and the panel center bends up and down by the scroll speed
  (() => {
    const canvas = document.querySelector(".career__gl");
    if (!canvas || !window.THREE) return;
    const { lenis } = window.ED;
    const ASPECT = 512 / 341, GAP = 1.2, TURN = 0.18 * Math.PI;
    const COLS = [
      { x: -5.5, rot: TURN, from: 0, n: 5, z: 0, light: 0.62 }, { x: -4.4, rot: TURN, from: 5, n: 3, z: -1.4, light: 0.32 },
      { x: 5.5, rot: -TURN, from: 8, n: 5, z: 0, light: 0.62 }, { x: 4.4, rot: -TURN, from: 13, n: 3, z: -1.4, light: 0.32 },
    ];
    const LABELS = ["Employee smiling in the kitchen", "Employee drawing plans", "Three people at the counter", "Smiling man", "Meeting room from behind", "Outside the office window", "Site visit", "Hands at the workbench", "Store staff", "Hands that build models", "Meeting View", "Window seat", "Event stage", "Cafe Counter", "Rooftop groups", "Office Plants"];
    const atlas = document.createElement("canvas");
    atlas.width = 2048; atlas.height = 1364;
    {
      const g = atlas.getContext("2d"), css = getComputedStyle(document.documentElement), tw = 512, th = 341;
      LABELS.forEach((label, i) => {
        const x = (i % 4) * tw, y = Math.floor(i / 4) * th;
        g.fillStyle = css.getPropertyValue("--kf-raised"); g.fillRect(x, y, tw, th);
        g.strokeStyle = css.getPropertyValue("--kf-line"); g.lineWidth = 2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + tw, y + th); g.moveTo(x + tw, y); g.lineTo(x, y + th); g.stroke();
        g.fillStyle = css.getPropertyValue("--kf-dim"); g.font = `600 22px ${css.getPropertyValue("--kf-font-sans")}`;
        g.fillText(`${label} · Indoor · landscape 3:2`, x + 20, y + th - 24);
      });
    }
    const VERT = `
      uniform float uRadius;
      uniform float uScroll;
      uniform float uSkew;
      attribute float aW;
      attribute float aH;
      attribute float aY;
      attribute float aTile;
      varying vec2 vUv;
      varying float vTile;
      varying float vDark;
      void main() {
        vUv = uv;
        vTile = aTile;
        float y = position.y * aH + aY + uScroll + sin(uv.x * 3.14159265) * uSkew;
        float a = y / uRadius;                            // Distance traveled around the cylinder → angle
        vDark = smoothstep(0.0, 1.0, 1.0 - max(cos(a), 0.0));
        vec3 p = vec3(position.x * aW, sin(a) * uRadius, cos(a) * uRadius);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
      }`;
    const FRAG = `
      uniform sampler2D uAtlas;
      uniform float uOpacity;
      uniform float uLight;
      varying vec2 vUv;
      varying float vTile;
      varying float vDark;
      void main() {
        vec2 cell = vec2(mod(vTile, 4.0), floor(vTile / 4.0));
        vec4 c = texture2D(uAtlas, vec2((cell.x + vUv.x) / 4.0, 1.0 - (cell.y + 1.0 - vUv.y) / 4.0));
        c.rgb *= uLight * mix(1.0, 0.45, vDark);
        gl_FragColor = vec4(c.rgb, c.a * uOpacity);
      }`;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 200);
    camera.position.set(0, 0, 7.5);
    const tex = new THREE.CanvasTexture(atlas);
    tex.colorSpace = THREE.NoColorSpace;
    let visH = 1, radius = 1;
    const cols = COLS.map((c) => {
      // Plate height and position: stacked from the top with the center at 0 — the first plate is topmost
      let run = 0;
      const planes = Array.from({ length: c.n }, (_, k) => {
        const d = 0.8 + 0.05 * Math.floor(Math.random() * 5), h = (4 / ASPECT) * d, y = run + h / 2;
        run += h + GAP;
        return { w: 4 * d, h, y, tile: c.from + k };
      });
      const half = (run - GAP) / 2;
      planes.forEach((pl) => (pl.y = half - pl.y));
      const geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1, 12, 32));
      geo.instanceCount = planes.length;
      geo.setAttribute("aW", new THREE.InstancedBufferAttribute(new Float32Array(planes.map((p) => p.w)), 1));
      geo.setAttribute("aH", new THREE.InstancedBufferAttribute(new Float32Array(planes.map((p) => p.h)), 1));
      geo.setAttribute("aY", new THREE.InstancedBufferAttribute(new Float32Array(planes.map((p) => p.y)), 1));
      geo.setAttribute("aTile", new THREE.InstancedBufferAttribute(new Float32Array(planes.map((p) => p.tile)), 1));
      const uniforms = { uAtlas: { value: tex }, uRadius: { value: 1 }, uScroll: { value: 0 }, uSkew: { value: 0 }, uOpacity: { value: 0 }, uLight: { value: c.light } };
      const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, side: THREE.DoubleSide }));
      mesh.frustumCulled = false;
      const group = new THREE.Group();
      group.rotation.y = c.rot;
      group.add(mesh);
      scene.add(group);
      return { c, planes, uniforms, group, start: 0, end: 0 };
    });
    const arc = (h) => Math.asin(gsap.utils.clamp(-1, 1, h / radius)) * radius;
    const size = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      visH = 2 * Math.tan(THREE.MathUtils.degToRad(37.5)) * 7.5;
      radius = Math.max(3 * visH, 0.001);
      cols.forEach((col) => {
        col.group.position.set(col.c.x - Math.sin(col.c.rot) * radius, 0, -Math.cos(col.c.rot) * radius + col.c.z);
        col.uniforms.uRadius.value = radius;
        col.start = arc(-0.5 * visH) - col.planes[0].y;
        col.end = arc(0.5 * visH) - col.planes[col.planes.length - 1].y;
      });
    };
    size();
    addEventListener("resize", size);
    let on = false, skew = 0, prog = 0;
    ScrollTrigger.create({ trigger: ".career", start: "top bottom", end: "bottom top+=50vh", onToggle: (st) => { on = st.isActive; canvas.classList.toggle("is-on", on); } });
    ScrollTrigger.create({ trigger: "#home-about-cards", start: "bottom top", endTrigger: ".career", end: "bottom center", onUpdate: (st) => (prog = st.progress), onLeaveBack: () => (prog = 0) });
    gsap.ticker.add((t, dtMs) => {
      if (!on) return;
      const dt = Math.max(1, dtMs) / 1000;
      const target = reduce ? 0 : gsap.utils.clamp(-0.18, 0.18, -(0.0038 * 4 * (lenis?.velocity ?? 0)));
      skew += (target - skew) * (1 - Math.exp(-16 * dt));
      const fade = Math.min(gsap.utils.clamp(0, 1, prog / 0.1), gsap.utils.clamp(0, 1, (1 - prog) / 0.1));
      cols.forEach((col) => {
        col.uniforms.uScroll.value = col.start + (1.4 * col.end - col.start) * prog;
        col.uniforms.uOpacity.value = fade;
        col.uniforms.uSkew.value = skew;
      });
      renderer.render(scene, camera);
    });
  })();

  // ── Lottie (original @lottiefiles/dotlottie-web 0.80.0 as is). The content is our own art — built in JS at the same canvas size and frame count (60fps) as the original, with colors read from Skin variables.
  //    Opened via file:// the browser can’t fetch wasm, so a still image (.ed-lottie__still) goes in the same place
  const rgb = (v) => { const el = document.createElement("i"); el.style.color = `var(${v})`; document.body.append(el); const m = getComputedStyle(el).color.match(/[\d.]+/g).map(Number); el.remove(); return [m[0] / 255, m[1] / 255, m[2] / 255, 1]; };
  const lottieOK = /^https?:$/.test(location.protocol) && window.DotLottieLib?.DotLottie && !reduce;
  if (lottieOK) window.DotLottieLib.DotLottie.setWasmUrl(new URL("../_vendor/dotlottie-web@0.80.0/dotlottie-player.wasm", location.href).href);
  const K = (frames) => ({ a: 1, k: frames.map(([t, v], i) => (i < frames.length - 1 ? { t, s: [].concat(v), i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } } : { t, s: [].concat(v) })) });
  const st = (v) => ({ a: 0, k: v });
  const tr = (r = 0, x = 0, y = 0, sx = 100, sy = 100) => ({ ty: "tr", p: st([x, y]), a: st([0, 0]), s: st([sx, sy]), r: st(r), o: st(100) });
  const rc = (w, h, r, x = 0, y = 0) => ({ ty: "rc", d: 1, s: st([w, h]), p: st([x, y]), r: st(r) });
  const el = (w, h, x = 0, y = 0) => ({ ty: "el", d: 1, s: st([w, h]), p: st([x, y]) });
  const fl = (c) => ({ ty: "fl", c: st(c), o: st(100), r: 1 });
  const sk = (c, w) => ({ ty: "st", c: st(c), o: st(100), w: st(w), lc: 2, lj: 2 });
  const gr = (it, t) => ({ ty: "gr", it: [...it, t] });
  const layer = (ind, op, shapes, ks) => ({ ddd: 0, ind, ty: 4, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0, shapes, ks: { o: st(100), r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]), ...ks } });
  const anim = (w, h, op, layers) => ({ v: "5.7.4", fr: 60, ip: 0, op, w, h, ddd: 0, assets: [], layers });
  const LOTTIE = {
    // Hand holding a pen 377×386 · 48 frames — tilts ±7° around the wrist while the pen tip moves up and down (same panel and length as the original home_write)
    write: () => {
      const ink = rgb("--kf-ink"), paper = rgb("--kf-surface"), pen = rgb("--site-c-yellow");
      return anim(377, 386, 48, [layer(1, 48, [
        gr([rc(36, 230, 18), fl(pen), sk(ink, 9)], tr(-38, 150, 150)),
        gr([el(150, 128), fl(paper), sk(ink, 9)], tr(0, 214, 262)),
        gr([el(58, 46), fl(paper), sk(ink, 9)], tr(-20, 150, 230)),
        gr([rc(70, 36, 18), fl(paper), sk(ink, 9)], tr(12, 272, 330)),
      ], { r: K([[0, -7], [24, 7], [48, -7]]), p: st([214, 300, 0]), a: st([214, 300, 0]) })]);
    },
    // Rushing momentum 520×358 · 72-frame loop — three speed lines stretch and shrink in turn and one star pops (same panel and length as the original home_career)
    career: () => {
      const ink = rgb("--kf-ink"), sky = rgb("--site-c-sky"), paper = rgb("--kf-surface");
      const line = (ind, y, d) => layer(ind, 72, [gr([rc(170, 18, 9), fl(sky), sk(ink, 5)], tr(0, 0, 0))], {
        p: st([300, y, 0]), a: st([85, 0, 0]),
        s: K([[d, [0, 100, 100]], [d + 18, [100, 100, 100]], [d + 36, [0, 100, 100]], [72, [0, 100, 100]]]),
      });
      return anim(520, 358, 72, [
        line(1, 110, 0), line(2, 180, 10), line(3, 250, 20),
        layer(4, 72, [gr([rc(64, 64, 14), fl(paper), sk(ink, 6)], tr(45, 0, 0))], { p: K([[0, [110, 200, 0]], [36, [110, 150, 0]], [72, [110, 200, 0]]]), r: K([[0, 0], [72, 90]]) }),
      ]);
    },
  };
  const lottie = (host, kind, opts) => {
    if (!lottieOK || !host) return null;
    const canvas = document.createElement("canvas");
    host.prepend(canvas);
    const player = new window.DotLottieLib.DotLottie({ canvas, data: LOTTIE[kind](), renderConfig: { autoResize: true }, ...opts });
    player.addEventListener("load", () => host.classList.add("is-live"));
    return player;
  };
  lottie(document.querySelector('[data-lottie="career"]'), "career", { autoplay: true, loop: true });

  // Concept text (original values): per line, dark text over faint text is revealed left→right — scrubbed once with 1s sine.out while the line’s top edge goes from screen bottom → 50% of screen.
  // On the highlight line, while the text is revealed along the same curve, a pen hand follows from left to right, spinning the Lottie frames 18 turns in that span, and it vanishes at the end at .1
  //   (Desktop: row top edge at screen bottom → row bottom edge at screen center, phone: top edge at center+20rem → center)
  document.querySelectorAll("[data-mask-line]").forEach((line) => {
    const h = line.innerHTML;
    line.setAttribute("data-group", "mask");
    line.innerHTML = `<span data-mask="base">${h}</span><span data-mask="cliped" aria-hidden="true">${h}</span>`;
  });
  const handwrites = [...document.querySelectorAll("[data-handwrite]")].map((hw) => {
    hw.innerHTML = `<span data-handwrite-inner>${hw.innerHTML}</span><span class="ed-handwrite-illust ed-lottie"><svg class="ed-lottie__still"><use href="#ed-pen-hand"/></svg></span>`;
    const illust = hw.querySelector(".ed-handwrite-illust");
    return { hw, illust, player: lottie(illust, "write", { autoplay: false, loop: false }) };
  });

  // The tween that paints the background reads the skin’s variables as real colors and passes them — GSAP cannot blend between var() strings
  const swatch = document.createElement("i");
  const tone = (v) => { swatch.style.color = `var(${v})`; document.body.append(swatch); const c = getComputedStyle(swatch).color; swatch.remove(); return c; };
  const paper = tone("--kf-bg"), stage = tone("--kf-contrast-bg"), ink = tone("--kf-ink"), onDark = tone("--site-on-dark");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero entrance (original values): four words rise from 50% below at 1s back.out(1.2) · .2 stagger → the script line is drawn over 1.2s split by length ratio
    //   → .6s before the end the eye pops out with 1s back.out(2) and the cylinder starts rising → the thumb rises with .6s back.out(2)
    const heroWords = gsap.utils.toArray("[data-hero-word]");
    const scriptSvg = document.querySelector(".hero__script");
    const strokes = [...scriptSvg.querySelectorAll("path")].map((path) => ({ path, len: Math.max(path.getTotalLength(), 1) }));
    const strokeTotal = strokes.reduce((s, p) => s + p.len, 0);
    gsap.set(heroWords, { opacity: 0 });
    window.ED.ready.then(() => {
      const draw = gsap.timeline();
      strokes.forEach(({ path, len }) => {
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
        draw.to(path, { strokeDashoffset: 0, duration: (len / strokeTotal) * 1.2, ease: "none" });
      });
      gsap.timeline({ onComplete: heroScroll })
        .fromTo(heroWords, { opacity: 0, yPercent: 50 }, { opacity: 1, yPercent: 0, duration: 1, stagger: 0.2, ease: "back.out(1.2)" })
        .set(scriptSvg, { opacity: 1 })
        .add(draw)
        .fromTo(".hero__eye", { translate: "-50% 0%", opacity: 0 }, { opacity: 1, translate: "-50% -50%", duration: 1, delay: -0.6, ease: "back.out(2.0)", onStart: () => heroGL?.start() })
        .fromTo(".hero__hand", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "back.out(2.0)" });
    });
    // After the reveal ends: while the page scrolls down by one Hero height, words slide up 400% (power3.in · .04 stagger),
    // The script handwriting has its strokes erased from the start (fully erased at progress ×1.25). On phones the script only fades
    function heroScroll() {
      gsap.fromTo(heroWords, { yPercent: 0, opacity: 1 }, {
        yPercent: -400, opacity: 0, duration: 1, stagger: 0.04, ease: "power3.in",
        scrollTrigger: {
          trigger: "#hero", start: "top top", end: "top top-=100%", scrub: true,
          onUpdate: (st) => {
            if (isMobile()) { gsap.set(scriptSvg, { opacity: 1 - st.progress }); return; }
            const gone = strokeTotal * Math.min(1.25 * st.progress, 1);
            let before = 0;
            strokes.forEach(({ path, len }) => {
              const a = Math.min(Math.max(gone - before, 0), len);
              gsap.set(path, { strokeDashoffset: -a, opacity: a >= len - 1 ? 0 : 1 });
              before += len;
            });
          },
        },
      });
    }

    document.querySelectorAll('[data-group="mask"]').forEach((line) =>
      gsap.fromTo(line.querySelector('[data-mask="cliped"]'), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "sine.out", scrollTrigger: { trigger: line, start: "top bottom", end: "top 50%", scrub: true, once: true } }));
    handwrites.forEach(({ hw, illust, player }) => {
      const small = isMobile();
      gsap.timeline({ scrollTrigger: {
        trigger: hw, start: small ? "top center+=20rem" : "top bottom", end: small ? "top center" : "bottom center", scrub: true, once: true,
        onUpdate: (stt) => { if (!player?.isLoaded) return; const n = player.totalFrames; if (n > 0) player.setFrame(((18 * stt.progress) % 1) * (n - 1)); },
      } })
        .to(illust, { opacity: 1 })
        .fromTo(hw.querySelector("[data-handwrite-inner]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0% 0%)", duration: 1, ease: "sine.out" }, "<")
        .fromTo(illust, { left: "0%" }, { left: "100%", duration: 1, ease: "sine.out" }, "<")
        .to(illust, { opacity: 0, duration: 0.1 });
    });
    gsap.from(".concept__em.is-under", { backgroundSize: "0% 100%", backgroundRepeat: "no-repeat", ease: "none", scrollTrigger: { trigger: ".concept__em.is-under", start: "top 80%", end: "top 50%", scrub: true } });
    gsap.fromTo(".concept-line__track", { xPercent: 0 }, { xPercent: -25, ease: "none", scrollTrigger: { trigger: ".concept-line", start: "top bottom", end: "bottom top", scrub: true } });
    // Background goes whitish → ink black: boundary catch (original #home_lead) while its top edge passes from screen bottom to 50% of the screen (original values, GSAP default curve)
    gsap.fromTo("#home", { backgroundColor: paper }, { backgroundColor: stage, scrollTrigger: { trigger: ".lead__catch", start: "top bottom", end: "top 50%", scrub: true } });

    // Chunk: 0x · 560° to 1.5x · 0°, vanishing at the end (original values as is)
    gsap.timeline({ scrollTrigger: { trigger: ".lead", start: "top top", end: "bottom bottom", scrub: true } })
      .fromTo(".lead__blob", { scale: 0, opacity: 0.8, rotation: 560 }, { scale: 1.5, opacity: 1, rotation: 0, duration: 0.9, ease: "none" })
      .to(".lead__blob", { opacity: 0, duration: 0.1 });
    // The title underline is drawn from the left over the same range as the title (title top edge at screen bottom → bottom edge at 75%) (1.5 expo.inOut scrub)
    gsap.fromTo(".lead__rule", { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "expo.inOut", scrollTrigger: { trigger: ".lead__catch", start: "top bottom", end: "bottom 75%", scrub: true } });

    gsap.fromTo(".svc__ruler", { backgroundPositionX: 0 }, { backgroundPositionX: "-100vw", ease: "none", scrollTrigger: { trigger: ".svc", start: "top bottom", end: "bottom top", scrub: true } });

    gsap.fromTo("#home-about-head", { yPercent: 0, opacity: 1 }, { yPercent: -25, opacity: 0.2, ease: "none", scrollTrigger: { trigger: "#home-about-cards", start: "top bottom", end: "top top", scrub: true } });
    // Lay four one-screen-height cells behind the card so it changes at the same places as the original cells: becomes 1 when the top of the second cell hits 50%, 2 when that cell’s end arrives, 3 when the third cell’s end arrives
    const secs = [...document.querySelectorAll(".about__sec")];
    ScrollTrigger.create({ trigger: secs[1], start: "top 50%", end: "bottom 50%", onEnter: () => showSlide(1), onLeaveBack: () => showSlide(0), onLeave: () => showSlide(2), onEnterBack: () => showSlide(1) });
    ScrollTrigger.create({ trigger: secs[2], start: "top 50%", end: "bottom 50%", onLeave: () => showSlide(3), onEnterBack: () => showSlide(2) });
    const flipOut = { yPercent: -50, rotateX: 80, scaleY: 0, opacity: 0 }, flipIn = { yPercent: 50, rotateX: -80, scaleY: 0, opacity: 0 }, flat = { yPercent: 0, rotateX: 0, scaleY: 1, opacity: 1 };
    gsap.timeline({ scrollTrigger: { trigger: secs[0], start: "top top", end: "bottom top", scrub: true } }).fromTo(parts(0).lines, flat, flipOut);
    // The original chained enter and exit onto the front and back halves of one top bottom → bottom top timeline per cell (screen height) — when two tweens touch the same value, the ”exit” of a not-yet-reached cell
    // Leaves the stretched values when reversing, splits the same range (first half top bottom → top top, second half top top → bottom top) into two tweens, and the latter is not pre-rendered
    [1, 2].forEach((k) => {
      gsap.fromTo(parts(k).lines, flipIn, { ...flat, scrollTrigger: { trigger: secs[k], start: "top bottom", end: "top top", scrub: true } });
      gsap.fromTo(parts(k).lines, flat, { ...flipOut, immediateRender: false, scrollTrigger: { trigger: secs[k], start: "top top", end: "bottom top", scrub: true } });
    });
    gsap.timeline({ scrollTrigger: { trigger: secs[3], start: "top bottom", end: "top top", scrub: true } }).fromTo(parts(3).lines, flipIn, flat);
    gsap.fromTo(".about__card", { scale: 0.75 }, { scale: 1, scrollTrigger: { trigger: "#home-about-cards", start: "top bottom", end: "top top", scrub: true } });

    gsap.fromTo(".career__ctt > *", { y: "50vh", opacity: 0 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: "#home-about-cards", start: "bottom bottom", end: "bottom top", scrub: true } });
    // Cursive wordmark: each stroke is drawn in turn over 1.2 split by stroke length ratio (appearing at .001) — while the Careers section’s bottom edge passes from screen bottom +60% to +20%
    const runner = [...document.querySelectorAll(".career__script path")].map((path) => ({ path, len: Math.max(path.getTotalLength(), 1) }));
    const runnerTotal = runner.reduce((a, r) => a + r.len, 0);
    const runTl = gsap.timeline({ scrollTrigger: { trigger: ".career", start: "bottom bottom+=60%", end: "bottom bottom+=20%", scrub: true } });
    runner.forEach(({ path, len }) => {
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      runTl.to(path, { opacity: 1, duration: 0.001, ease: "none" }).to(path, { strokeDashoffset: 0, duration: (len / runnerTotal) * 1.2, ease: "none" }, "<");
    });

    // News (original values): the two big lines move from +20% / −20% into place while the section passes through the screen (power2.inOut scrub), and when the section top touches the top of the screen the background turns white over 1s (dark again when scrolling back up)
    const jLines = document.querySelectorAll(".journal__title > span");
    gsap.timeline({ scrollTrigger: { trigger: ".journal", start: "top bottom", end: "bottom top", scrub: true } })
      .fromTo(jLines[0], { xPercent: 20 }, { xPercent: 0, duration: 1, ease: "power2.inOut" })
      .fromTo(jLines[1], { xPercent: -20 }, { xPercent: 0, duration: 1, ease: "power2.inOut" }, "<");
    ScrollTrigger.create({
      trigger: ".journal", start: "top top", end: "bottom bottom",
      onEnter: () => { gsap.to("#home", { backgroundColor: paper, duration: 1 }); gsap.to(".journal", { color: ink, duration: 1 }); },
      onLeaveBack: () => { gsap.to("#home", { backgroundColor: stage, duration: 1 }); gsap.to(".journal", { color: onDark, duration: 1 }); },
    });
    gsap.from(".jcard", { y: 160 * remPx(), opacity: 0, stagger: 0.12, ease: "none", scrollTrigger: { trigger: ".journal__cards", start: "top bottom", end: "top 55%", scrub: true } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set('[data-mask="cliped"], [data-handwrite-inner]', { clipPath: "none" });
    gsap.set("#home", { backgroundColor: stage });
    gsap.set(".hero, .concept, .concept-line", { backgroundColor: paper });
    gsap.set(".hero__script", { opacity: 1 });
    slides.forEach((_, k) => ScrollTrigger.create({ trigger: document.querySelectorAll(".about__sec")[k], start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && (gsap.set([parts(aboutCur).bottom, parts(aboutCur).lines, parts(aboutCur).deco], { opacity: 0 }), gsap.set([parts(k).bottom, parts(k).lines, parts(k).deco], { opacity: 1, yPercent: 0 }), aboutCur = k) }));
  });
})();
