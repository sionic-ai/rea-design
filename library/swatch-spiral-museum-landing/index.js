// First page — wood tile mosaic (wood grain drawn by us), photo slides (original Swiper settings), sample spiral (three r178, original spiral mode values).
(() => {
  const reduced = window.XL?.reduced;

  // ── Wood grain swatch: redraw ring and grain stripes on a canvas (instead of the original photo). The spiral panel and tiles share the same swatch
  // Not skin: wood swatch colors are content (each species has its own wood color), so they don’t change when the skin changes
  const WOODS = [["#c79a63", "#9c6b3a"], ["#e2c08c", "#b88d55"], ["#8a5a33", "#5e3a1e"], ["#d9b27a", "#a77845"], ["#6e4528", "#43281a"], ["#b47d4b", "#7f532c"], ["#efd5a8", "#c9a272"], ["#a0623a", "#6d3d22"], ["#d6a56d", "#9b6a3e"], ["#4a2f1f", "#2c1b12"], ["#c48a52", "#8e5a30"], ["#e7c79a", "#c09566"], ["#9b7a52", "#6f5435"], ["#b5543a", "#7c3424"], ["#dcc6a0", "#b39a70"], ["#7d5a3c", "#523822"]]; /* Not skin: wood swatch color */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const swatch = (i, size = 96) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d"), [light, dark] = WOODS[i % WOODS.length];
    g.fillStyle = light;
    g.fillRect(0, 0, size, size);
    const quarter = Math.random() < 0.45, cx = rnd(-size, size * 2), cy = quarter ? rnd(-size * 3, -size) : rnd(-size * 8, -size * 4);
    for (let r = 4; r < size * 10; r += rnd(2, 7)) {
      g.strokeStyle = dark;
      g.globalAlpha = rnd(0.08, 0.35);
      g.lineWidth = rnd(0.6, 2.4);
      g.beginPath();
      for (let x = -4; x <= size + 4; x += 4) {
        const wob = Math.sin(x * 0.07 + r * 0.3) * rnd(0.4, 1.4);
        const y = cy + Math.sqrt(Math.max(0, r * r - (x - cx) * (x - cx))) + wob;
        x === -4 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    g.globalAlpha = 0.12;
    for (let k = 0; k < 40; k++) { g.fillStyle = Math.random() < 0.5 ? dark : light; g.fillRect(rnd(0, size), rnd(0, size), rnd(1, 3), rnd(4, 18)); }
    g.globalAlpha = 1;
    return c;
  };
  const SWATCHES = Array.from({ length: 24 }, (_, i) => swatch(i));
  // The spiral board is a plank cut vertically — straight grain runs up and down
  const plank = (i, w = 128, h = 208) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d"), [light, dark] = WOODS[i % WOODS.length];
    g.fillStyle = light;
    g.fillRect(0, 0, w, h);
    for (let x = rnd(-2, 2); x < w; x += rnd(1.5, 6)) {
      g.strokeStyle = dark;
      g.globalAlpha = rnd(0.06, 0.4);
      g.lineWidth = rnd(0.5, 2.6);
      g.beginPath();
      const amp = rnd(0.5, 3), ph = rnd(0, 6);
      for (let y = 0; y <= h; y += 8) { const xx = x + Math.sin(y * 0.03 + ph) * amp; y ? g.lineTo(xx, y) : g.moveTo(xx, y); }
      g.stroke();
    }
    g.globalAlpha = 1;
    return c;
  };
  const PLANKS = Array.from({ length: 16 }, (_, i) => plank(i));
  const URLS = SWATCHES.map((c) => c.toDataURL("image/jpeg", 0.8));

  // Tiles: cells of 64px or more are laid to fit the screen width, only enough to cover the screen (the original puts in 1000 sample cells and hides the overflow)
  const wood = document.querySelector("[data-wood]");
  if (wood) {
    const fill = () => {
      const cols = Math.max(1, Math.floor(innerWidth / 64)), side = innerWidth / cols, n = cols * (Math.ceil(innerHeight / side) + 1);
      if (wood.childElementCount === n) return;
      wood.textContent = "";
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const d = document.createElement("div");
        d.className = "xl-tile";
        d.style.backgroundImage = `url(${URLS[(Math.random() * URLS.length) | 0]})`;
        frag.append(d);
      }
      wood.append(frag);
    };
    fill();
    let t;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fill, 150); });
  }

  // ── Photo slider (original settings): 0.6s transition · 5s autoplay (continues on touch) · page numbers · prev/next buttons. Changes the info panel text and refills the progress bar in a 5s straight line
  const sw = document.querySelector("[data-swiper]");
  if (sw && window.Swiper) {
    const DELAY = 5000;
    const bar = sw.querySelector("[data-progress]");
    const info = (s) => {
      const d = s.slides[s.activeIndex].dataset;
      sw.querySelector("[data-info-title]").textContent = d.title || "";
      sw.querySelector("[data-info-text]").textContent = d.text || "";
      sw.querySelector("[data-info-link]").textContent = d.link || "View details";
    };
    const run = () => {
      if (!bar) return;
      bar.style.transition = "none";
      bar.style.width = "0%";
      void bar.offsetWidth;
      if (reduced) return;
      bar.style.transition = `width ${DELAY}ms linear`;
      bar.style.width = "100%";
    };
    new Swiper(sw, {
      speed: 600,
      autoplay: reduced ? false : { delay: DELAY, disableOnInteraction: false },
      pagination: { el: sw.querySelector(".swiper-pagination"), type: "fraction" },
      navigation: { nextEl: sw.querySelector(".swiper-button-next"), prevEl: sw.querySelector(".swiper-button-prev") },
      on: { init(s) { info(s); run(); }, slideChange: info, slideChangeTransitionStart: run },
    });
  }

  // ── Sample spiral (original spiral mode): N upright plates laid around radius 6 at height −10~10 · angle −1.5π~1.5π (plates turn along the axis so neighbors look thin), with progress a passing through the collection box
  //    the whole spiral on y = −a (visible half-height + 10) · rotation −1.5πa. Each panel sways slightly on a 10s triangle wave. Camera z 100, field of view set so the panel ends (6+4) fit the screen width
  const canvas = document.querySelector("[data-spiral]"), box = document.querySelector("[data-spiral-container]");
  if (!canvas || !box || !window.THREE) return;
  const T = THREE, Rs = 10, ol = 6, al = 1.5, yr = 4, Cs = 100, N = 40;
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(45, 1, 1, 1000);
  camera.position.set(0, 0, Cs);
  scene.add(new T.HemisphereLight(0xffffff, 0x404030, 1.4)); /* Not skin: light color of the lighting */
  const sun = new T.DirectionalLight(0xffffff, 2.2); /* Not skin: light color of the lighting */
  sun.position.set(200, 15, 5);
  scene.add(sun);
  // In the original, plates cluster at 35~95% of the screen width — shift the spiral axis 3 to the right (a measured value)
  const AXIS_X = 3;
  const spiral = new T.Group();
  spiral.position.set(AXIS_X, -Rs, 0);
  scene.add(spiral);
  const textures = PLANKS.map((c) => { const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; });
  // Panel: width 2.4 · height 3.6 · thickness .05 (panel size measured on the original screen — built lying down and stood up with a half turn on the x axis, original rotation π/2 as is)
  const geo = new T.BoxGeometry(2.4, 0.05, 3.6);
  const edge = new T.MeshStandardMaterial({ color: 0x5a3b22, roughness: 0.8 }); /* Not skin: wood color of the board’s side */
  const meshes = [];
  for (let i = 0; i < N; i++) {
    const l = (i / (N - 1) - 0.5) * 2;
    const face = new T.MeshStandardMaterial({ map: textures[(Math.random() * textures.length) | 0], roughness: 0.72, metalness: 0 });
    const mesh = new T.Mesh(geo, [edge, edge, face, face, edge, edge]);
    mesh.position.set(ol, 0, 0);
    mesh.rotation.set(Math.PI * 0.5, 0, 0);
    mesh.userData.rand = Math.random();
    const holder = new T.Group();
    holder.add(mesh);
    holder.position.set(0, l * Rs, 0);
    holder.rotation.set(0, l * al * Math.PI, 0);
    spiral.add(holder);
    meshes.push(mesh);
  }
  const size = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = 2 * Math.atan((2 * (ol + yr)) / Math.max(camera.aspect, 0.5) / (2 * Cs)) * (180 / Math.PI);
    camera.updateProjectionMatrix();
    place();
  };
  const place = () => {
    const r = box.getBoundingClientRect();
    const a = reduced ? 0 : ((r.top - innerHeight * 0.5) / r.height + 0.5) * 2;
    const half = Math.sin((camera.fov / 180) * Math.PI) * camera.position.z * (0.25 + 0.25 * Math.min(1, camera.aspect));
    spiral.position.set(AXIS_X, -a * (half + Rs), 0);
    spiral.rotation.set(0, -a * al * Math.PI, 0);
  };
  const wobble = () => {
    const o = Date.now(), P = 1e4;
    meshes.forEach((m) => {
      const rand = m.userData.rand, u = (Math.abs(((o + P * rand) % P) / P - 0.5) * -1 + 0.25) * 4, k = Math.atan(u * 4), f = Math.atan(u * 2);
      m.rotation.set(Math.PI * 0.5 + k * Math.PI * 0.01 * rand, 0, k * Math.PI * 0.01 * rand);
      m.position.set(ol + rand * f * 0.1, rand * f * 0.1, rand * f * 0.1);
    });
  };
  // Draws only while the box is near the screen — the rest of the time the stage is hidden behind the body background
  const near = () => { const r = box.getBoundingClientRect(); return r.top < innerHeight * 1.5 && r.bottom > -innerHeight * 0.5; };
  const scroller = window.XL?.scroller || window;
  scroller.addEventListener("scroll", place, { passive: true });
  addEventListener("resize", size);
  size();
  const loop = () => {
    if (near()) { if (!reduced) wobble(); renderer.render(scene, camera); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
