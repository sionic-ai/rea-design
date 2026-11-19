// First page — 3D building complex (our shapes · our line material), closing the news widget, embla news slider.
(() => {
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const desktop = matchMedia("(min-width: 800px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // News widget — pressing × makes it slide down and vanish in .3s
  const widget = document.querySelector(".pr-widget");
  widget?.querySelector(".pr-widget__close")?.addEventListener("click", () => widget.classList.add("is-closed"));

  // News slider — original embla (loop, align start), autoplay 3.5s, pauses on hover, autoplay off on phones
  const newsRoot = document.querySelector(".pr-news__right");
  if (newsRoot && window.EmblaCarousel) {
    const slides = newsRoot.querySelectorAll(".pr-news__item").length;
    const auto = window.EmblaCarouselAutoplay?.({ delay: 3500, playOnInit: false, stopOnInteraction: false, stopOnMouseEnter: true });
    const embla = EmblaCarousel(newsRoot, { loop: slides > 1, align: "start", skipSnaps: false, watchDrag: slides > 1 }, auto ? [auto] : []);
    const sync = () => {
      const ap = embla.plugins().autoplay;
      if (!ap) return;
      desktop.matches && !reduce && visible ? ap.play() : ap.stop();
    };
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(newsRoot);
    desktop.addEventListener("change", sync);
  }

  // 3D — a building complex drawn with white faces + gray lines. Original values: focal length 45mm (47.5 on phone), azimuth −35° to 190°, elevation 1° to 175°,
  // Drag smoothing .15s, and while the cover is present, focus 65→45→30mm and azimuth 25°→0°→−45° with scroll (section top center → bottom center).
  const section = document.querySelector(".pr-3d");
  const canvas = section?.querySelector(".pr-3d__canvas");
  if (!section || !canvas || !window.THREE) return;
  const boot3d = () => {
    CameraControls.install({ THREE });
    const { Scene, PerspectiveCamera, WebGLRenderer, Color, Fog, Group, BoxGeometry, PlaneGeometry, CylinderGeometry, IcosahedronGeometry, TorusGeometry,
      EdgesGeometry, LineSegments, LineBasicMaterial, MeshBasicMaterial, Mesh, BufferGeometry, Float32BufferAttribute, Clock, Vector3 } = THREE;

    const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new Scene();
    const paper = new Color(css("--kf-surface"));
    const face = new Color(css("--kf-bg"));
    const ink = new Color(css("--kf-ink"));
    scene.background = paper;
    scene.fog = new Fog(paper, 140, 420);

    const faceMat = new MeshBasicMaterial({ color: face, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const lineMat = new LineBasicMaterial({ color: ink, transparent: true, opacity: 0.32, fog: true });
    const faintMat = new LineBasicMaterial({ color: ink, transparent: true, opacity: 0.14, fog: true });
    const world = new Group();
    scene.add(world);

    const solid = (geo, x, y, z, mat = lineMat, ry = 0) => {
      const m = new Mesh(geo, faceMat);
      const l = new LineSegments(new EdgesGeometry(geo, 20), mat);
      const g = new Group();
      g.add(m, l);
      g.position.set(x, y, z);
      g.rotation.y = ry;
      world.add(g);
      return g;
    };
    const lines = (pts, mat = faintMat) => {
      const geo = new BufferGeometry();
      geo.setAttribute("position", new Float32BufferAttribute(pts, 3));
      const l = new LineSegments(geo, mat);
      world.add(l);
      return l;
    };

    // Ground and path
    const ground = new Mesh(new PlaneGeometry(900, 900), faceMat);
    ground.rotation.x = -Math.PI / 2;
    world.add(ground);
    const road = [];
    for (const z of [-62, 58]) road.push(-300, 0.02, z, 300, 0.02, z, -300, 0.02, z + 9, 300, 0.02, z + 9);
    for (const x of [-78, 92]) road.push(x, 0.02, -300, x, 0.02, 300, x + 9, 0.02, -300, x + 9, 0.02, 300);
    lines(road);

    // Main stadium (wide low box + roof ribs + glass band)
    const hall = solid(new BoxGeometry(64, 13, 46), 0, 6.5, 0);
    const ribs = [];
    for (let i = -28; i <= 28; i += 4) ribs.push(i, 13.05, -23, i, 13.05, 23);
    for (let i = -20; i <= 20; i += 10) ribs.push(-32, 13.05, i, 32, 13.05, i);
    for (let i = -30; i <= 30; i += 6) ribs.push(i, 0, 23.02, i, 9, 23.02);
    hall.add(lines(ribs, lineMat));
    ribs.length = 0;
    solid(new BoxGeometry(30, 4, 20), -46, 2, 6);
    // Tall tower
    const tower = solid(new BoxGeometry(14, 58, 18), 42, 29, -30);
    const floors = [];
    for (let y = 4; y < 58; y += 3.6) floors.push(-7, y - 29, 9.02, 7, y - 29, 9.02, 7.02, y - 29, -9, 7.02, y - 29, 9);
    tower.add(lines(floors, lineMat));
    solid(new BoxGeometry(10, 46, 12), 58, 23, -22);
    // Stadium (oval track + spectator ring)
    const stadium = new Group();
    const ring = new LineSegments(new EdgesGeometry(new CylinderGeometry(36, 40, 6, 48, 1, true), 10), lineMat);
    ring.position.y = 3;
    const field = new LineSegments(new EdgesGeometry(new BoxGeometry(44, 0.2, 26)), lineMat);
    field.position.y = 0.2;
    const track = new LineSegments(new EdgesGeometry(new TorusGeometry(30, 0.4, 3, 48)), faintMat);
    track.rotation.x = Math.PI / 2;
    stadium.add(ring, field, track);
    stadium.scale.set(1, 1, 0.7);
    stadium.position.set(-130, 0, -120);
    world.add(stadium);
    // Low houses and trees
    const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    for (let i = 0; i < 26; i++) {
      const x = (rnd() - 0.5) * 380, z = (rnd() - 0.5) * 380;
      if (Math.abs(x) < 70 && Math.abs(z) < 60) continue;
      if (Math.hypot(x + 130, z + 120) < 50) continue;
      const w = 8 + rnd() * 16, h = 4 + rnd() * 14, d = 8 + rnd() * 14;
      solid(new BoxGeometry(w, h, d), x, h / 2, z, faintMat, rnd() * 0.4 - 0.2);
    }
    const treeGeo = new IcosahedronGeometry(2.6, 0);
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2, r = 50 + rnd() * 150;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(x) < 40 && Math.abs(z) < 32) continue;
      solid(treeGeo, x, 3.2, z, faintMat);
    }

    // Camera — overview position (looking down at the complex at an angle) and entered position (in front of the stadium)
    const camera = new PerspectiveCamera(30, 1, 1, 1500);
    const controls = new CameraControls(camera, canvas);
    const DEG = Math.PI / 180;
    controls.minAzimuthAngle = -35 * DEG;
    controls.maxAzimuthAngle = 190 * DEG;
    controls.minPolarAngle = 1 * DEG;
    controls.maxPolarAngle = 175 * DEG;
    controls.draggingSmoothTime = 0.15;
    controls.smoothTime = 1.4;
    controls.dollyToCursor = false;
    controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
    controls.mouseButtons.right = CameraControls.ACTION.NONE;
    controls.mouseButtons.middle = CameraControls.ACTION.NONE;
    controls.touches.two = CameraControls.ACTION.NONE;
    controls.touches.three = CameraControls.ACTION.NONE;
    const VIEWS = {
      overview: { pos: [150, 120, 190], at: [0, 6, 0] },
      hall: { pos: [62, 26, 70], at: [0, 6, 0] },
    };
    controls.setLookAt(...VIEWS.overview.pos, ...VIEWS.overview.at, false);
    const baseAzimuth = controls.azimuthAngle;
    controls.enabled = false;

    const FOCAL_WIDE = 65, FOCAL_END = 30;
    const focal = () => (desktop.matches ? 45 : 47.5);
    const lens = { f: FOCAL_WIDE, theta: 25 };
    const applyLens = () => {
      camera.setFocalLength(lens.f);
      camera.updateProjectionMatrix();
    };
    let scrollTL = null;
    const scrubOn = () => {
      scrollTL?.scrollTrigger?.kill();
      scrollTL?.kill();
      if (!desktop.matches || reduce) { lens.f = focal(); lens.theta = 0; return; }
      scrollTL = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top center", end: "bottom center", scrub: true, invalidateOnRefresh: true },
      })
        .fromTo(lens, { f: FOCAL_WIDE, theta: 25 }, { f: focal, theta: 0, ease: "none", duration: 1 }, 0)
        .to(lens, { f: FOCAL_END, theta: -45, ease: "none", duration: 1 }, 1);
    };
    scrubOn();

    // On pressing the cover: release the scroll lock, bring focus and bearing to the center values with 1.5s expo.out, and turn on dragging
    const veil = section.querySelector(".pr-3d__veil");
    const cta = section.querySelector(".pr-3d__cta");
    const back = section.querySelector(".pr-3d__back");
    const card = section.querySelector(".pr-3d__card");
    let tweens = [];
    let lensTween = null;
    const kill = () => { tweens.forEach((t) => t.kill()); tweens = []; };
    veil.addEventListener("click", () => {
      veil.classList.add("is-hidden");
      scrollTL?.scrollTrigger?.kill();
      scrollTL?.kill();
      scrollTL = null;
      kill();
      lensTween = gsap.to(lens, { f: focal(), theta: 0, duration: reduce ? 0 : 1.5, ease: "expo.out", overwrite: "auto" });
      controls.enabled = true;
      cta.classList.remove("is-hidden");
    });

    // Moving position — lerpLookAt between the two positions over 1.4s
    const teleport = (name) => {
      kill();
      const v = VIEWS[name];
      const from = { p: controls.getPosition(new Vector3()), t: controls.getTarget(new Vector3()) };
      const s = { t: 0 };
      tweens.push(gsap.to(s, {
        t: 1, duration: reduce ? 0 : 1.4, ease: "power3.inOut",
        onUpdate: () => controls.lerpLookAt(from.p.x, from.p.y, from.p.z, from.t.x, from.t.y, from.t.z, ...v.pos, ...v.at, s.t, false),
      }));
      const inside = name !== "overview";
      cta.classList.toggle("is-hidden", inside);
      back.classList.toggle("is-hidden", !inside);
      card.classList.toggle("is-hidden", !inside);
    };
    cta.addEventListener("click", () => teleport("hall"));
    back.addEventListener("click", () => teleport("overview"));
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !back.classList.contains("is-hidden")) teleport("overview");
    });

    // Size and draw — compile the shader as soon as it’s built so the first drag doesn’t freeze
    const resize = () => {
      const w = section.clientWidth, h = section.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      applyLens();
    };
    new ResizeObserver(resize).observe(section);
    resize();
    renderer.compile(scene, camera);

    let onScreen = true;
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(section);
    const clock = new Clock();
    let lastTheta = null;
    gsap.ticker.add(() => {
      const dt = clock.getDelta();
      if (!onScreen) return;
      // The compass is switched off by the lens value only while the cover is up and during the 1.5s of lifting the cover — after that user input switches it off
      const lensDrives = !controls.enabled || lensTween?.isActive();
      if (lensDrives && lens.theta !== lastTheta) {
        controls.rotateAzimuthTo(baseAzimuth + lens.theta * DEG, false);
        lastTheta = lens.theta;
      }
      applyLens();
      controls.update(dt);
      renderer.render(scene, camera);
    });
    desktop.addEventListener("change", () => { if (!veil.classList.contains("is-hidden")) scrubOn(); });
  };
  if (window.CameraControls) boot3d();
})();
