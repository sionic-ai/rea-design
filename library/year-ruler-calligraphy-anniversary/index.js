// Home page scene: 3D logo (pops and grows after the loader, tilts following the mouse, pinned to the end of the section), sticker, header, news band entrance,
// Flowing band text and photo rows, event photo crossfade and thumbnail row (Swiper), history navy background, falling color pills in About.
(() => {
  const { reduced } = window.tSite;
  const narrow = () => innerWidth <= 800;

  /* ---------- 3D Logo ---------- */
  // Scale the procedural shape to the original OBJ’s longest side (23.68) — so the rotation amount in the entrance formula (proportional to baseScale) matches the original value
  const OBJ_SIZE = 23.68;
  const logo = { model: null, mouseX: 0, mouseY: 0, isAppearing: true, currentScale: 0, time: 0, running: false };
  const canvas = document.getElementById("t-logo3d");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 10;
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const dir = new THREE.DirectionalLight(0xffffff, 2.0);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);
  const point = new THREE.PointLight(0xffffff, 15, 100);
  point.position.set(0, 0, 10);
  scene.add(point);

  // Black metal gloss only works if there is something to reflect — bake a room with a few white light panels as the environment map
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x3a3d44, side: THREE.BackSide })));
  [[0, 12, 0, 18, 4], [-12, 4, 6, 4, 14], [12, -2, 4, 4, 10], [0, 0, 14, 10, 3]].forEach(([x, y, z, w, h]) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    room.add(panel);
  });
  scene.environment = pmrem.fromScene(room, 0.02).texture;

  // Four calligraphy strokes (dot·roof·face ring·lower bend) made into swollen tubes — the same strokes as the header’s 2D mark (#t-mark)
  const STROKES = [
    [[47, 6], [51.5, 10.5], [56, 15]],
    [[12, 36], [16, 25], [32, 20], [50, 20], [70, 21], [86, 26], [88, 35]],
    [[50, 30], [38, 33], [34, 46], [42, 55], [52, 57], [60, 48], [60, 38], [56, 32]],
    [[20, 66], [45, 61], [66, 64], [69, 72], [58, 81], [38, 84], [31, 92], [40, 99], [63, 100], [89, 95]],
  ];
  const buildModel = () => {
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(window.tSite.color("--site-black")), roughness: 0.2, metalness: 0.7 });
    const group = new THREE.Group();
    const R = 6.5;
    STROKES.forEach((pts, s) => {
      const v = pts.map(([x, y], i) => new THREE.Vector3(x - 50, 53 - y, Math.sin(i * 1.3 + s) * 5));
      const curve = new THREE.CatmullRomCurve3(v);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length * 14, R, 20, false), mat));
      [v[0], v[v.length - 1]].forEach((end) => {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 24, 16), mat);
        cap.position.copy(end);
        group.add(cap);
      });
    });
    [[-5, 11], [5, 11]].forEach(([x, y]) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(3.4, 20, 14), mat);
      eye.position.set(x, y, 6);
      eye.scale.set(1, 1.4, 0.6);
      group.add(eye);
    });
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const k = OBJ_SIZE / Math.max(size.x, size.y, size.z);
    group.scale.setScalar(k);
    const holder = new THREE.Group();
    holder.add(group);
    return holder;
  };

  const model = buildModel();
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const maxDimension = OBJ_SIZE;
  const updateModelScale = () => {
    const baseScale = (narrow() ? 4 : 6) / maxDimension;
    model.userData.baseScale = baseScale;
    model.position.set(-center.x * baseScale, -center.y * baseScale, -center.z * baseScale);
    if (!logo.isAppearing) model.scale.setScalar(baseScale);
  };
  updateModelScale();
  model.scale.setScalar(0);
  model.rotation.y = Math.PI * 2;
  scene.add(model);
  logo.model = model;
  // The first draw and first cursor tilt stall the screen briefly when the shader is first linked — pre-link it at setup
  renderer.compile(scene, camera);

  addEventListener("mousemove", (e) => {
    logo.mouseX = (e.clientX / innerWidth) * 2 - 1;
    logo.mouseY = (e.clientY / innerHeight) * 2 - 1;
  });

  // Appear: each frame closes 4% of the remaining distance in size, swelling 0.7x more with sin before coming back, and the z rotation is the remaining size×2
  const update3d = () => {
    const base = model.userData.baseScale;
    if (logo.isAppearing) {
      logo.currentScale += (base - logo.currentScale) * 0.04;
      const bounce = Math.sin((logo.currentScale / base) * Math.PI) * (base * 0.7);
      model.scale.setScalar(logo.currentScale + bounce);
      model.rotation.z = (base - logo.currentScale) * 2;
      if (base - logo.currentScale < 0.001) {
        logo.isAppearing = false;
        model.scale.setScalar(base);
        model.rotation.z = 0;
      }
    }
    let ty, tx;
    if (narrow()) {
      logo.time += 0.01;
      ty = Math.sin(logo.time * 0.7) * 0.4;
      tx = Math.cos(logo.time * 0.5) * 0.4;
    } else {
      ty = logo.mouseX * 0.5;
      tx = logo.mouseY * 0.5;
    }
    model.rotation.y += (ty - model.rotation.y) * 0.05;
    model.rotation.x += (tx - model.rotation.x) * 0.05;
  };

  let mvVisible = true;
  new IntersectionObserver(([en]) => { mvVisible = en.isIntersecting; }).observe(document.querySelector(".t-mv"));
  gsap.ticker.add(() => {
    if (logo.running) update3d();
    if (mvVisible) renderer.render(scene, camera);
  });

  let lastW = innerWidth;
  addEventListener("resize", () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    updateModelScale();
  });

  // The logo spot stays fixed on screen through the end of the hero+message section (no spacer offset)
  ScrollTrigger.create({ trigger: ".t-mv", start: "top top", end: "bottom bottom", pin: ".t-mv__logo", pinSpacing: false });

  /* ---------- First screen after the loader ---------- */
  window.tSite.afterLoader((tl, isReduced) => {
    if (isReduced) {
      logo.isAppearing = false;
      model.scale.setScalar(model.userData.baseScale);
      model.rotation.set(0, 0, 0);
      return;
    }
    const pop = { scale: 0, duration: 0.3, ease: "back.inOut(1.7)" };
    const st = (n) => `.t-mv__stickers .is-${n} svg`;
    tl.call(() => { logo.running = true; })
      .from(st(1), pop, "+=1.5")
      .from(st(5), pop, "<")
      .from(st(6), pop, "<")
      .from(st(3), pop, "-=0.2")
      .from(st(2), pop, "-=0.2")
      .from(st(4), { scale: 0, ease: "back.inOut(1.7)" }, "<")
      .from(".t-head__bar", { y: "-150%", ease: "power2.inOut" }, "-=0.2")
      .from(".t-news", { opacity: 0, y: "100%", ease: "back.inOut(1.7)" }, "<");
  });

  /* ---------- Flowing and sliding rows: original slider settings as they are (News 5s · photo crossfade 2.5s · thumbnails 2.5s · photo row 10s per step / 8s on phone · band text 40s) ---------- */
  // Reduced motion only turns off auto-advance — the row stops at the first slide
  const auto = (opts) => (reduced ? false : { disableOnInteraction: false, ...opts });
  new Swiper(".t-news__slider", { loop: true, slidesPerView: 1, spaceBetween: 0, speed: 500, autoplay: reduced ? false : { delay: 5000 } });
  new Swiper(".t-next__slider", {
    loop: true, slidesPerView: 2, spaceBetween: 25, speed: 8000, allowTouchMove: false, autoplay: auto({ delay: 0 }),
    breakpoints: { 800: { slidesPerView: 4, speed: 10000, spaceBetween: 50 } },
  });
  new Swiper(".t-fade", {
    loop: true, slidesPerView: 1, spaceBetween: 0, speed: 500, allowTouchMove: false,
    effect: "fade", fadeEffect: { crossFade: true }, autoplay: auto({ delay: 2500 }),
  });
  new Swiper(".t-thumbs", {
    loop: true, slidesPerView: 4, spaceBetween: 13, speed: 500, allowTouchMove: false, initialSlide: -1, autoplay: auto({ delay: 2500 }),
    breakpoints: { 800: { spaceBetween: 24 } },
  });
  addEventListener("load", () => {
    new Swiper(".t-typo-slider", { loop: true, slidesPerView: "auto", speed: 40000, allowTouchMove: false, autoplay: auto({ delay: 0 }) });
    new Swiper(".t-hist-slider", { loop: true, slidesPerView: "auto", spaceBetween: 15, speed: 40000, allowTouchMove: false, autoplay: auto({ delay: 0 }) });
  });

  /* ---------- History: navy background only while the section passes the screen center ---------- */
  ScrollTrigger.create({ trigger: ".t-hist", start: "top center", end: "bottom center", toggleClass: { targets: ".t-hist", className: "is-active" } });

  /* ---------- About: seven colored pills fall (gravity 1.2, restitution 0, air resistance .01, density .8) ---------- */
  const about = document.querySelector(".t-about");
  const PILLS = ["Field One", "Field Name 2", "A Longer Field Name", "Field Name Four", "The Longest Field Name", "Field Name Six", "Field Seven"];
  const cvs = about.querySelector(".t-about__canvas");
  const ctx = cvs.getContext("2d");
  const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body } = Matter;
  const engine = Engine.create();
  engine.gravity.y = 1.2;
  const runner = Runner.create();
  let pills = [];
  let walls = [];
  let dpr = 1;

  const sizeCanvas = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    cvs.width = about.clientWidth * dpr;
    cvs.height = about.clientHeight * dpr;
  };
  let family = "";
  let ink = "";
  const font = (h) => `500 ${Math.round(h * 0.52)}px ${family}`;

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    pills.forEach(({ body, w, h, label, color }) => {
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = h * 0.057;
      ctx.strokeStyle = ink;
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = font(h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, h * 0.04);
      ctx.restore();
    });
  };

  const initMatter = () => {
    family = window.tSite.font("--kf-font-display");
    ink = window.tSite.color("--kf-surface");
    sizeCanvas();
    const cw = about.clientWidth;
    const ch = about.clientHeight;
    const baseUnit = cw * (innerWidth <= 800 ? 0.019 : 0.009);
    const h = baseUnit * 6;
    ctx.font = font(h);
    pills = PILLS.map((label, i) => {
      const color = window.tSite.color(`--site-pill-${i + 1}`);
      const w = ctx.measureText(label).width + h * 1.25;
      const body = Bodies.rectangle(cw / 2 + (Math.random() - 0.5) * (cw * 0.4), -100 - i * 150, w, h, {
        restitution: 0, frictionAir: 0.01, density: 0.8, chamfer: { radius: h / 2 },
      });
      return { body, w, h, label, color };
    });
    Composite.add(engine.world, pills.map((p) => p.body));
    walls = [
      Bodies.rectangle(cw / 2, ch + 25, cw * 2, 50, { isStatic: true, label: "ground" }),
      Bodies.rectangle(-25, ch / 2, 50, ch * 2, { isStatic: true, label: "wallLeft" }),
      Bodies.rectangle(cw + 25, ch / 2, 50, ch * 2, { isStatic: true, label: "wallRight" }),
    ];
    Composite.add(engine.world, walls);

    const mouse = Mouse.create(cvs);
    // If the physics engine blocks the mouse wheel, the page won’t scroll down in this section — only dragging is used
    cvs.removeEventListener("mousewheel", mouse.mousewheel);
    cvs.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    cvs.removeEventListener("wheel", mouse.mousewheel);
    Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }));

    if (reduced) {
      for (let i = 0; i < 900; i++) Engine.update(engine, 1000 / 60);
      draw();
      return;
    }
    Runner.run(runner, engine);
    gsap.ticker.add(draw);
  };

  const seenAbout = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    seenAbout.disconnect();
    document.fonts.ready.then(initMatter);
  }, { threshold: 0.2 });
  seenAbout.observe(about);

  addEventListener("resize", () => {
    if (!pills.length) return;
    sizeCanvas();
    const cw = about.clientWidth;
    const ch = about.clientHeight;
    walls.forEach((b) => {
      if (b.label === "ground") Body.setPosition(b, { x: cw / 2, y: ch + 25 });
      if (b.label === "wallLeft") Body.setPosition(b, { x: -25, y: ch / 2 });
      if (b.label === "wallRight") Body.setPosition(b, { x: cw + 25, y: ch / 2 });
    });
    if (reduced) draw();
  });
})();
