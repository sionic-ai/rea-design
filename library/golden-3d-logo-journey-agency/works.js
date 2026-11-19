// Work list: a laptop built from basic shapes sits on a night lakeside, and while pinned the camera approaches into the screen. The screen draws a miniature of the list below.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s) => document.querySelector(s);
  const T = window.THREE;
  DK.night($(".wk-hero__sky"), { aurora: true, cursor: false });

  const canvas = $(".wk-hero__3d");
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, 1, 0.05, 100);

  // Mini screen thumbnail: white background, title at top left, four staggered photo cells, half-moon on the left
  const sc = document.createElement("canvas");
  sc.width = 1024; sc.height = 640;
  const g = sc.getContext("2d");
  // Thumbnail colors and fonts are read from the skin — a canvas can’t read variables
  const root = getComputedStyle(document.documentElement);
  const v = (n) => root.getPropertyValue(n).trim();
  const paint = (expr) => { const p = document.createElement("i"); p.style.cssText = `display:none;color:${expr}`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
  g.fillStyle = paint("var(--kf-bg)"); g.fillRect(0, 0, 1024, 640);
  g.fillStyle = paint("var(--kf-ink)"); g.font = `700 34px ${v("--kf-font-display")}`; g.fillText("Works", 60, 90);
  [[60, 130, 330, 250, "color-mix(in srgb, var(--kf-ink), var(--kf-bg) 5.8%)"], [410, 130, 560, 380, "color-mix(in srgb, var(--kf-ink) 85%, var(--kf-accent))"], [60, 400, 330, 220, "color-mix(in srgb, var(--kf-ink), var(--kf-bg) 88.3%)"], [410, 530, 560, 110, "color-mix(in srgb, var(--kf-ink), var(--kf-bg) 84.2%)"]].forEach(([x, y, w, h, c]) => { g.fillStyle = paint(c); g.fillRect(x, y, w, h); });
  g.fillStyle = paint("var(--kf-accent)"); g.beginPath(); g.arc(0, 320, 46, -Math.PI / 2, Math.PI / 2); g.fill();
  const screenTex = new T.CanvasTexture(sc);
  screenTex.colorSpace = T.SRGBColorSpace;

  const metal = new T.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.8, roughness: 0.35 });
  const laptop = new T.Group();
  const base = new T.Mesh(new T.BoxGeometry(3.2, 0.1, 2.2), metal);
  laptop.add(base);
  const keys = new T.Mesh(new T.PlaneGeometry(2.8, 1.0), new T.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.8 }));
  keys.rotation.x = -Math.PI / 2; keys.position.set(0, 0.052, -0.25);
  const pad = new T.Mesh(new T.PlaneGeometry(1.0, 0.6), new T.MeshStandardMaterial({ color: 0x3a3c40, metalness: 0.6, roughness: 0.4 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.052, 0.6);
  laptop.add(keys, pad);
  const hinge = new T.Group();
  hinge.position.set(0, 0.05, -1.1);
  const lid = new T.Mesh(new T.BoxGeometry(3.2, 2.05, 0.06), metal);
  lid.position.set(0, 1.025, 0);
  const screen = new T.Mesh(new T.PlaneGeometry(2.96, 1.85), new T.MeshBasicMaterial({ map: screenTex }));
  screen.position.set(0, 1.025, 0.032);
  hinge.add(lid, screen);
  hinge.rotation.x = -0.18;
  laptop.add(hinge);
  laptop.position.set(0, -0.6, 0);
  laptop.rotation.y = -0.32;
  scene.add(laptop);
  scene.add(new T.HemisphereLight(0x9fb8d0, 0x101418, 0.9));
  const glow = new T.PointLight(0xfff2d0, 6, 6);
  glow.position.set(0, 0.6, 0.6);
  scene.add(glow);
  const moon = new T.DirectionalLight(0xbcd0ff, 1.2);
  moon.position.set(-4, 6, 3);
  scene.add(moon);

  const size = () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(size).observe(canvas);
  size();

  // Screen-bound panel (original ProjectsBeachHero): the DOM panel is perspective-transformed onto the spot where the four corners of the screen plane project (quad to quad, closed-form projective transform).
  // At the end of the pin (.75 → 1) those four points move to the four corners of the screen so the panel fills the screen exactly
  const screenEl = $(".wk-hero__screen");
  const corners = [[-1.48, 0.925], [1.48, 0.925], [1.48, -0.925], [-1.48, -0.925]].map(([x, y]) => new T.Vector3(x, y, 0));
  const pt = new T.Vector3();
  const quadToCss = (w, h, q) => {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-9) return null;
    const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
    return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${x0},${y0},0,1)`;
  };
  const placeScreen = (fill) => {
    if (!screenEl) return;
    const W = canvas.clientWidth, H = canvas.clientHeight, full = [[0, 0], [W, 0], [W, H], [0, H]];
    let behind = false;
    const q = corners.map((c, i) => {
      pt.copy(c);
      screen.localToWorld(pt);
      pt.project(camera);
      if (pt.z > 1) behind = true;
      const x = ((pt.x + 1) * W) / 2, y = ((1 - pt.y) * H) / 2;
      return [x + (full[i][0] - x) * fill, y + (full[i][1] - y) * fill];
    });
    const m = behind ? null : quadToCss(screenEl.offsetWidth, screenEl.offsetHeight, q);
    screenEl.style.transform = m || "";
    screenEl.style.opacity = m ? "1" : "0";
  };

  // Start: laptop seen from an oblique top-down angle / End: head-on to the screen at a distance where the screen fills the view
  const target = new T.Vector3();
  const look = new T.Vector3();
  const pose = { p: 0 };
  // Mouse parallax (original ProjectsBeachHero): measures the mouse position over the hero as −1 to 1, and each frame the followed value closes 1 − e^(−5·dt) of the gap.
  // Moves camera right by .12 × x and up by .07 × y (to 0 as pin end goes .86 → 1) and looks at the same spot — the panel on screen moves along too
  const aim = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  const right = new T.Vector3();
  const draw = () => {
    const p = pose.p;
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    laptop.rotation.y = -0.32 * (1 - e);
    hinge.rotation.x = -0.18 * (1 - e);
    laptop.updateMatrixWorld(true);
    screen.getWorldPosition(target);
    const fill = 1.85 / 2 / Math.tan((camera.fov * Math.PI) / 360) / Math.min(1, camera.aspect / 1.6) * 0.98;
    camera.position.set(3.4 * (1 - e), 2.9 + (target.y - 2.9) * e, 9.4 + (target.z + fill - 9.4) * e);
    look.set(0, 0.55, 0).lerp(target, e);
    camera.lookAt(look);
    const g = Math.min(1, Math.max(0, (p - 0.86) / 0.14)), keep = 1 - g * g * g * (g * (g * 6 - 15) + 10);
    if (eased.x || eased.y) {
      camera.updateMatrixWorld();
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      camera.position.addScaledVector(right, 0.12 * eased.x * keep);
      camera.position.y += 0.07 * eased.y * keep;
      camera.lookAt(look);
    }
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    const f = Math.min(1, Math.max(0, (p - 0.75) / 0.25));
    placeScreen(f * f * (3 - 2 * f));
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.motion) { draw(); return; }
    gsap.timeline({ scrollTrigger: { trigger: ".wk-hero", start: "top top", end: "bottom bottom", scrub: true } })
      .to(pose, { p: 1, ease: "none", duration: 1, onUpdate: draw }, 0)
      .to([".wk-hero__title", ".wk-hero__cue"], { opacity: 0, y: -40, duration: 0.25, ease: "none" }, 0)
      .to(".wk-hero__white", { opacity: 1, duration: 0.12, ease: "none" }, 0.88);
    gsap.utils.toArray(".hx-case").forEach((c) => {
      gsap.from(c, { y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 92%" } });
      gsap.fromTo(c.querySelector(".hx-case__img"), { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => draw());
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const hero = $(".wk-hero__stage");
    addEventListener("pointermove", (ev) => {
      if (ev.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      aim.x = Math.max(-1, Math.min(1, ((ev.clientX - r.left) / r.width) * 2 - 1));
      aim.y = Math.max(-1, Math.min(1, 1 - ((ev.clientY - r.top) / r.height) * 2));
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { aim.x = aim.y = 0; });
    let last = 0;
    gsap.ticker.add(() => {
      const now = performance.now(), dt = last ? Math.max(1, now - last) / 1000 : 1 / 60;
      last = now;
      if (Math.abs(aim.x - eased.x) < 1e-4 && Math.abs(aim.y - eased.y) < 1e-4) return;
      const k = 1 - Math.exp(-5 * Math.max(dt, 1 / 120));
      eased.x += (aim.x - eased.x) * k;
      eased.y += (aim.y - eased.y) * k;
      draw();
    });
  }
  draw();
  addEventListener("resize", draw);

  // Half-moon filter: shows only while the list is on screen, and pressing it slides the category panel in from the side
  const filter = $(".wk-filter"), panel = $(".wk-panel");
  ScrollTrigger.create({ trigger: ".wk-list", start: "top 60%", end: "bottom 40%", onToggle: (st) => { filter.classList.toggle("is-shown", st.isActive); if (!st.isActive) setOpen(false); } });
  const setOpen = (open) => { panel.classList.toggle("is-open", open); filter.setAttribute("aria-expanded", open); panel.setAttribute("aria-hidden", !open); };
  filter.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  panel.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    panel.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
    gsap.fromTo(".hx-case", { opacity: 0.2 }, { opacity: 1, duration: 0.6, stagger: 0.04, ease: "expo.out" });
  }));
})();
