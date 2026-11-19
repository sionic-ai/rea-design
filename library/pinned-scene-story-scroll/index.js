// Each scene is a timeline pinned to the screen and scrubbed to scroll — like the original it moves exactly with scroll progress with no curve (ease none).
// Story cards and the index change at fixed points in the scene progress.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const narrow = () => innerWidth < 1024;

  BS.cards([
    { tag: "Chapter 1", title: "Chapter one", body: "Your three-line opening story of this section goes here. Say what has begun." },
    { tag: "Chapter 2", title: "Chapter two", body: "Your story here, about four lines. Say who was chosen from many, and how." },
    { tag: "Chapter 2", body: "Your three lines here to continue the story. Say what tests it went through." },
    { tag: "Chapter 3", title: "Chapter three!", body: "Write three lines here about the preparation process. Note what you got used to over several months." },
    { tag: "Chapter 3", body: "Your four-line continuing story goes here: the repeated tests and the end it endured." },
    { tag: "Chapter 5", title: "Chapter five", body: "Three lines here on the story of departure. Say when you set out and what watched over it." },
    { tag: "Chapter 5", body: "Your four-line story here about after leaving. Describe how things were even amid the turbulence." },
    { tag: "Chapter 5", title: "000 000", body: "Two lines explaining the meaning of the big number go here.", dark: true },
    { tag: "Chapter 5", title: "00 laps", body: "Explain the meaning of the second number in two lines.", dark: true },
    { tag: "Chapter 5", body: "Your five-line story watched on screen goes here. Describe what was measured and recorded." },
    { tag: "Chapter 6", title: "Chapter six", body: "Your story of the day of return goes here in four lines. Where and how it touched down." },
    { tag: "Chapter 7", title: "Chapter seven", body: "Your three lines here on what happened afterward." },
  ]);

  // One scene = One pin. marks are [progress, card number] — passing that point switches the card
  const pins = [];
  function scene(sel, len, build, marks = []) {
    const el = $(sel);
    const tl = gsap.timeline({ defaults: { ease: "none" }, paused: reduce });
    build(tl, el);
    if (reduce) { tl.progress(1); return; }
    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: `+=${len}%`, pin: true, scrub: true, animation: tl, invalidateOnRefresh: true,
      onUpdate: (s) => sync(s),
      onToggle: (s) => s.isActive && sync(s),
    });
    st.marks = marks;
    st.chapter = Number(el.dataset.chapter);
    pins.push(st);
  }
  function sync(s) {
    BS.chapter(s.chapter);
    let card = -1;
    for (const [at, i] of s.marks) if (s.progress >= at) card = i;
    if (card >= 0) BS.setCard(card);
  }

  const paper = $("[data-bs-paper]");

  /* 1 Newspaper — approaches the photo (0→.35), body words switch off in shuffled order (.3→.7), and the paper slips out upward */
  scene(".bs-paper", 90, (tl) => {
    const words = $$("[data-bs-words]").flatMap((p) => new SplitText(p, { type: "words", tag: "span" }).words);
    const mixed = gsap.utils.shuffle(words.slice());
    tl.addLabel("paperZoom", 0)
      .to(paper, { scale: 1.32, yPercent: -6, duration: 0.35 }, 0)
      .to(mixed, { opacity: 0, duration: 0.05, stagger: 0.35 / Math.max(1, mixed.length) }, 0.3)
      .to(".bs-paper__title, .bs-paper__stats, .bs-paper__mast", { opacity: 0, duration: 0.15 }, 0.55)
      .to(paper, { yPercent: -120, duration: 0.3 }, 0.7);
  }, [[0, 0]]);

  /* 2 Choosing — the window grows, four dogs rise from below, a hand enters from the top right and picks two, then jumps into the window */
  scene(".bs-select", 50, (tl, el) => {
    const dogs = $$("[data-bs-dog]", el), hand = $("[data-bs-hand]", el), hole = $("[data-bs-porthole]", el);
    tl.addLabel("selectReveal", 0)
      .from(hole, { scale: 0.6, rotate: -40, duration: 0.25 }, 0)
      .addLabel("dogsEnter", 0.1)
      .from(dogs, { yPercent: 120, rotate: (i) => (i % 2 ? 8 : -8), duration: 0.2, stagger: 0.05 }, 0.1)
      .addLabel("handEnter", 0.35)
      .from(hand, { xPercent: 60, yPercent: -70, rotate: 12, duration: 0.2 }, 0.35)
      .addLabel("dogsSelect", 0.55)
      .to([dogs[1], dogs[2]], { yPercent: -18, scale: 1.08, duration: 0.1 }, 0.55)
      .to([dogs[0], dogs[3]], { opacity: 0.25, duration: 0.1 }, 0.55)
      .to(hand, { xPercent: 40, yPercent: -50, opacity: 0, duration: 0.12 }, 0.66)
      .addLabel("dive", 0.75)
      .to(hole, { scale: 7, duration: 0.25 }, 0.75)
      .to(dogs, { yPercent: 200, opacity: 0, duration: 0.15 }, 0.75);
  }, [[0, 1], [0.55, 2]]);

  /* 3 Rotating device (three.js) — rotates with scroll, camera descends from above to the side */
  scene(".bs-carusel", 130, (tl, el) => {
    const g = carusel($("[data-bs-carusel]", el));
    if (!g) return;
    tl.addLabel("caruselReveal", 0)
      .from($("[data-bs-porthole-huge]", el), { scale: 1.6, duration: 0.3 }, 0)
      .fromTo(g.state, { spin: 0, cam: 0 }, { spin: Math.PI * 6, cam: 1, duration: 1, onUpdate: g.render }, 0);
  }, [[0, 3], [0.5, 4]]);

  /* 4 Protagonists — two photo cards tilt in from below and settle */
  scene(".bs-heroes", 60, (tl, el) => {
    tl.from($$(".bs-hero", el), { yPercent: 80, rotate: (i) => (i ? 10 : -10), opacity: 0, duration: 0.45, stagger: 0.15 }, 0);
  }, [[0, -1]]);

  /* 5 Clouds · Launch — clouds rush in from both sides to cover, the sky turns navy, and a rocket with a flame rises from below */
  scene(".bs-launch", 120, (tl, el) => {
    const clouds = $$(".bs-cloud", el);
    tl.addLabel("rocket", 0)
      .from(clouds, { xPercent: (i) => (i % 2 ? 120 : -120), duration: 0.35, stagger: 0.02 }, 0)
      .to($("[data-bs-sky]", el), { opacity: 1, duration: 0.15 }, 0.35)
      .to($("[data-bs-rocket]", el), { y: () => -innerHeight * 2.2, duration: 0.65 }, 0.35)
      .to(clouds, { yPercent: 160, opacity: 0, duration: 0.3, stagger: 0.02 }, 0.55);
    gsap.to(".bs-launch__fire", { scaleY: 0.86, transformOrigin: "50% 0%", duration: 0.12, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, [[0, 5], [0.5, 6]]);

  /* 6 Orbit — Earth rises from below and spins, a rocket crosses from left to right */
  scene(".bs-orbit", 300, (tl, el) => {
    tl.addLabel("earth", 0)
      .from($("[data-bs-earth]", el), { yPercent: 40, rotate: -30, duration: 0.5 }, 0)
      .to($("[data-bs-earth]", el), { rotate: 30, duration: 0.5 }, 0.5)
      .fromTo($("[data-bs-orbit-rocket]", el), { x: () => -innerWidth * 0.7 }, { x: () => innerWidth * 0.7, duration: 1 }, 0)
      .addLabel("earthHide", 0.9);
  }, [[0, 7], [0.5, 8]]);

  /* 7 Television — the screen approaches and the stats panel turns on. Values jitter slightly every 1.2s and turn red when out of range */
  scene(".bs-tv", 140, (tl, el) => {
    tl.addLabel("tvZoom", 0)
      .from($("[data-bs-tv]", el), { scale: 0.4, rotate: -6, duration: 0.6 }, 0)
      .to($("[data-bs-meters]", el), { opacity: 1, duration: 0.15 }, 0.25)
      .to($("[data-bs-tv]", el), { scale: narrow() ? 1.1 : 1.35, duration: 0.4 }, 0.6);
  }, [[0, 9]]);
  const RANGE = { pulse: [90, 140], pressure: [120, 180], breath: [20, 50] };
  const ALERT = { pulse: 130, pressure: 170, breath: 45 };
  // Shakes only when a TV scene is on screen
  let tvSeen = false;
  new IntersectionObserver(([e]) => (tvSeen = e.isIntersecting)).observe($(".bs-tv"));
  if (!reduce) setInterval(() => tvSeen && $$("[data-bs-meters] b").forEach((b) => {
    const k = b.dataset.kind, [lo, hi] = RANGE[k];
    const v = Math.min(hi, Math.max(lo, Number(b.textContent) + Math.round((Math.random() - 0.5) * 8)));
    b.textContent = v;
    b.classList.toggle("is-alert", v >= ALERT[k]);
  }), 1200);

  /* 8 Landing — the parachute sways down and touches the hill, while two people taking photos approach from both sides */
  scene(".bs-landing", 150, (tl, el) => {
    const chute = $("[data-bs-chute]", el);
    tl.addLabel("landing", 0)
      .to(chute, { y: () => innerHeight * 1.08, duration: 0.7 }, 0)
      .to(chute, { rotate: 5, duration: 0.2, yoyo: true, repeat: 3 }, 0)
      .from($$("[data-bs-person]", el), { x: (i) => (i ? innerWidth * 0.3 : innerWidth * 0.4), opacity: 0, duration: 0.3, stagger: 0.08 }, 0.5);
  }, [[0, 10]]);

  /* 9 Newspaper second page — a title larger than the screen passes from right to left */
  scene(".bs-paper2", 120, (tl, el) => {
    tl.addLabel("paperFull", 0)
      .fromTo($("[data-bs-paper2-title]", el), { x: () => innerWidth * 0.2 }, { x: () => -$("[data-bs-paper2-title]", el).scrollWidth + innerWidth * 0.7, duration: 1 }, 0)
      .from($(".bs-paper2__photo", el), { scale: 1.15, duration: 1 }, 0);
  }, [[0, -1]]);

  ScrollTrigger.create({ trigger: ".bs-final", start: "top 60%", onEnter: () => { BS.chapter(6); BS.setCard(11); }, onLeaveBack: () => BS.setCard(-1) });

  /* Drawing the rotating device — the original is a GLB model, but the same shape (base·pillar·four arms·dogs riding in the two pods at the ends) is built from primitives */
  function carusel(canvas) {
    const T = window.THREE;
    if (!T || !canvas) return null;
    const col = (n) => {
      const i = document.createElement("i");
      i.style.color = `var(${n})`;
      document.body.appendChild(i);
      const v = getComputedStyle(i).color;
      i.remove();
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = v; c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.SRGBColorSpace);
    };
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 200);
    scene.add(new T.HemisphereLight(0xffffff, 0x222244, 1.5));
    const sun = new T.DirectionalLight(0xffffff, 2.2);
    sun.position.set(6, 12, 8);
    scene.add(sun);
    const mat = (n, r = 0.55) => new T.MeshStandardMaterial({ color: col(n), roughness: r, flatShading: true });
    const stick = (p, q, r, m) => {
      const d = new T.Vector3().subVectors(q, p), mesh = new T.Mesh(new T.CylinderGeometry(r, r, d.length(), 10), m);
      mesh.position.copy(p).addScaledVector(d, 0.5);
      mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
      return mesh;
    };
    // Tripod base + pillar (standing), with a long arm on top (rotating) — a barrel with a dog riding at one end, a weight at the other
    const top = new T.Vector3(0, 2.6, 0);
    const legM = mat("--site-sky"), poleM = mat("--site-blue");
    for (let k = 0; k < 3; k++) {
      const ang = (k / 3) * Math.PI * 2 + 0.4;
      scene.add(stick(top, new T.Vector3(Math.cos(ang) * 2.6, -3.2, Math.sin(ang) * 2.6), 0.1, legM));
    }
    scene.add(stick(new T.Vector3(0, -3.2, 0), top, 0.16, poleM));
    const rig = new T.Group();
    rig.position.copy(top);
    scene.add(rig);
    rig.add(new T.Mesh(new T.SphereGeometry(0.32, 16, 12), mat("--kf-accent")));
    rig.add(new T.Mesh(new T.BoxGeometry(10, 0.18, 0.18), poleM));
    const weight = new T.Mesh(new T.SphereGeometry(0.45, 16, 12), mat("--site-deep"));
    weight.position.x = -5;
    rig.add(weight);
    // Dog face reflected in the barrel window — bakes the same symbol from the drawing drawer onto the canvas (fill resolved with the current skin’s variables)
    const faceTex = { c: document.createElement("canvas"), svg: $("#bs-dogface") };
    faceTex.c.width = faceTex.c.height = 256;
    faceTex.x = faceTex.c.getContext("2d");
    const tex = new T.CanvasTexture(faceTex.c);
    tex.colorSpace = T.SRGBColorSpace;
    const img = new Image();
    const ser = new XMLSerializer();
    const sym = faceTex.svg.cloneNode(true);
    const styled = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256"><style>${[...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText).filter((t) => /^\.bs-[fs]-/.test(t)); } catch { return []; } }).join("")}:root{${["--kf-ink", "--kf-surface", "--site-patch"].map((v) => `${v}:${getComputedStyle(document.documentElement).getPropertyValue(v)}`).join(";")}}</style>${ser.serializeToString(sym).replace(/<symbol[^>]*>|<\/symbol>/g, "")}</svg>`;
    img.onload = () => { faceTex.x.drawImage(img, 0, 0, 256, 256); tex.needsUpdate = true; render(); };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(styled);
    const pod = new T.Group();
    pod.position.set(5, -1.3, 0);
    rig.add(pod);
    pod.add(stick(new T.Vector3(0, 1.3, 0), new T.Vector3(0, 0.6, 0), 0.04, mat("--kf-ink")));
    pod.add(new T.Mesh(new T.BoxGeometry(1.5, 1.2, 1.2), mat("--site-sky", 0.4)));
    const frame = new T.Mesh(new T.BoxGeometry(1.6, 0.14, 1.3), mat("--kf-accent"));
    frame.position.y = 0.62;
    pod.add(frame);
    const face = new T.Mesh(new T.PlaneGeometry(1.05, 1.05), new T.MeshBasicMaterial({ map: tex, transparent: true }));
    face.position.z = 0.61;
    pod.add(face);
    const state = { spin: 0, cam: 0 };
    function resize() {
      const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    }
    function render() {
      rig.rotation.y = state.spin;
      const t = state.cam;
      camera.position.set(T.MathUtils.lerp(-3, -2, t), T.MathUtils.lerp(6, 1.5, t), T.MathUtils.lerp(20, 13.5, t));
      camera.lookAt(T.MathUtils.lerp(-2.2, -1.7, t), 0.2, 0);
      renderer.render(scene, camera);
    }
    new ResizeObserver(resize).observe(canvas);
    resize();
    return { state, render };
  }

  BS.intro(paper).then(() => ScrollTrigger.refresh());
})();
