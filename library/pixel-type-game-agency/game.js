// Pixel game (original three.js + rapier 2D): a fixed body per lime slot, the mouse path sampled at half-slot intervals (up to 16 at a time) and only the touched slots
// Switch to a moving body and drop it with gravity -1000px/s². Cell friction .2283 (larger side), bounce .3043 (average), damping 1, top and side walls 400px off screen (bounce .5),
// Removed once past 800px below the screen. Cells collide, pile up, and roll down. The digit shapes are our pixel drawing (4·0·4, 11×15 cells).
(async () => {
  const { reduce, onReady, css2rgb } = window.M1;
  const root = document.querySelector(".gm");
  const host = root.querySelector(".gm-canvas");
  const elLeft = root.querySelector(".gm-left"), elTime = root.querySelector(".gm-timer");
  const FOUR = [
    ".......##..", "......###..", ".....####..", "....##.##..", "...##..##..", "..##...##..", ".##....##..", "##.....##..",
    "##.....##..", "###########", "###########", ".......##..", ".......##..", ".......##..", ".......##..",
  ];
  const ZERO = [
    "..#######..", ".#########.", "##.......##", "##......###", "##.....####", "##....##.##", "##...##..##", "##.......##",
    "##..##...##", "##.##....##", "####.....##", "###......##", "##.......##", ".#########.", "..#######..",
  ];
  const GLYPHS = [FOUR, ZERO, FOUR], COLS = 11, ROWS = 15, GAP = 2;
  const CFG = { gravity: -1000, damping: 1, friction: 0.2283, bounce: 0.3043, wallOffset: 400, wallBounce: 0.5, parkBelow: 800 };

  // ── Screen · time · remaining slots ──
  const cells = [];
  GLYPHS.forEach((g, d) => g.forEach((row, r) => [...row].forEach((ch, c) => ch === "#" && cells.push({ d, r, c, active: false, parked: false }))));
  let left = cells.length, t0 = 0, running = false, entering = false;
  const fmt = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}:${String(Math.floor(ms % 1000)).padStart(3, "0")}`;
  const setLeft = () => (elLeft.textContent = String(left).padStart(3, "0"));

  // ── Sound (only when on): a short square-wave beep when a cell matches ──
  let ac = null, sound = false;
  const blip = () => {
    if (!sound) return;
    ac = ac || new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "square"; o.frequency.value = 520 + Math.random() * 400;
    g.gain.setValueAtTime(0.04, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.09);
  };

  if (!window.THREE || !window.RAPIER) return;
  await RAPIER.init();
  const T = THREE;
  const R = new T.WebGLRenderer({ canvas: host, alpha: true, antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  R.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  // Separate material per digit — opacity fills in digit by digit as they drop in
  const ink = new T.Color().setRGB(...css2rgb("var(--kf-accent)"), T.SRGBColorSpace);
  const mats = GLYPHS.map(() => new T.MeshBasicMaterial({ color: ink, transparent: true, opacity: reduce ? 1 : 0 }));
  const geo = new T.PlaneGeometry(1, 1);
  const world = new RAPIER.World({ x: 0, y: CFG.gravity });
  const AVG = RAPIER.CoefficientCombineRule.Average, MAX = RAPIER.CoefficientCombineRule.Max;

  let W = 0, H = 0, size = 0, ox = 0, oy = 0;
  const homeOf = (p) => ({ x: ox + (p.d * (COLS + GAP) + p.c + 0.5) * size, y: oy - (p.r + 0.5) * size });
  const drop = GLYPHS.map(() => ({ off: 0 }));
  let walls = [];
  const layout = () => {
    W = root.clientWidth; H = root.clientHeight;
    R.setSize(W, H, false);
    Object.assign(cam, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 });
    cam.updateProjectionMatrix();
    const total = COLS * 3 + GAP * 2;
    size = Math.floor(Math.min((W - 60) / total, (H * 0.7) / ROWS));
    ox = -(total * size) / 2;
    oy = (ROWS * size) / 2 - size * 0.3;
    walls.forEach((c) => world.removeCollider(c, false));
    const wall = (hx, hy, x, y) => world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy).setTranslation(x, y).setRestitution(CFG.wallBounce).setRestitutionCombineRule(AVG));
    walls = [wall(W, 0.1, 0, H / 2 + CFG.wallOffset), wall(0.1, H, -W / 2 - CFG.wallOffset, 0), wall(0.1, H, W / 2 + CFG.wallOffset, 0)];
  };
  layout();
  cells.forEach((p) => {
    p.mesh = new T.Mesh(geo, mats[p.d]);
    scene.add(p.mesh);
    p.body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setLinearDamping(CFG.damping).setAngularDamping(CFG.damping));
    p.col = world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5).setFriction(CFG.friction).setFrictionCombineRule(MAX).setRestitution(CFG.bounce).setRestitutionCombineRule(AVG), p.body);
    p.col.setEnabled(false);
  });
  // Standing cells stay in place (at their current height if still dropping in), and cell size is recomputed to fit the window
  const seat = (p) => {
    const h = homeOf(p);
    p.body.setTranslation({ x: h.x, y: h.y + drop[p.d].off }, false);
    p.body.setRotation(0, false);
    p.mesh.position.set(h.x, h.y + drop[p.d].off, 0);
    p.mesh.rotation.z = 0;
  };
  const resize = () => {
    layout();
    cells.forEach((p) => {
      p.col.setHalfExtents({ x: size / 2, y: size / 2 });
      p.mesh.scale.set(size, size, 1);
      if (!p.active) seat(p);
    });
  };
  resize();
  addEventListener("resize", resize);

  // ── Stroke: from the last position to the current one, sample at half-cell spacing and wake the standing cell that holds each sampled point ──
  const ptr = { x: null, y: null };
  const hitAt = (x, y) => {
    for (const p of cells) {
      if (p.active) continue;
      const h = homeOf(p), py = h.y + drop[p.d].off;
      if (Math.abs(x - h.x) <= size / 2 && Math.abs(y - py) <= size / 2) {
        // Original startGame: time runs from the first tile hit, not from the moment of entering
        if (!running && left === cells.length) { running = true; t0 = performance.now(); }
        p.active = true;
        p.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
        p.col.setEnabled(true);
        left--; setLeft(); blip();
        if (!left) { running = false; root.classList.add("is-clear"); }
      }
    }
  };
  const move = (e) => {
    const r = root.getBoundingClientRect(), x = e.clientX - r.left - W / 2, y = -(e.clientY - r.top - H / 2);
    if (entering) { ptr.x = x; ptr.y = y; return; }
    const px = ptr.x ?? x, py = ptr.y ?? y, dist = Math.hypot(x - px, y - py), n = Math.min(Math.max(Math.ceil(dist / (size * 0.5)), 1), 16);
    for (let i = 1; i <= n; i++) hitAt(px + ((x - px) * i) / n, py + ((y - py) * i) / n);
    ptr.x = x; ptr.y = y;
  };
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerdown", (e) => { ptr.x = ptr.y = null; if (!e.target.closest("button, a, .gm-board")) move(e); });
  root.addEventListener("pointerleave", () => (ptr.x = ptr.y = null));

  // ── Entrance: drops from 1.3x the digit height above in 0.5s power2.in, then bounces three times at 4% with .55 damping. Order 4·4·0, .12 apart ──
  const enter = () => {
    entering = true;
    const tl = gsap.timeline({ onComplete: () => (entering = false) }), dh = ROWS * size;
    [0, 2, 1].forEach((d, i) => {
      const o = drop[d], at = i * 0.12;
      o.off = dh * 1.3; mats[d].opacity = 0;
      tl.to(o, { off: 0, duration: 0.5, ease: "power2.in" }, at).to(mats[d], { opacity: 1, duration: 0.35, ease: "power1.out" }, at);
      for (let b = 0; b < 3; b++) {
        const m = 0.55 ** b, g = 0.13 * Math.sqrt(m);
        tl.to(o, { off: dh * 0.04 * m, duration: g, ease: "sine.out" }, ">").to(o, { off: 0, duration: g, ease: "sine.in" }, ">");
      }
    });
    return tl;
  };

  const reset = () => {
    cells.forEach((p) => {
      p.active = p.parked = false;
      p.body.setBodyType(RAPIER.RigidBodyType.Fixed, true);
      p.body.setLinvel({ x: 0, y: 0 }, false); p.body.setAngvel(0, false);
      p.col.setEnabled(false);
      p.mesh.visible = true;
      seat(p);
    });
    left = cells.length; setLeft();
    root.classList.remove("is-clear");
    elTime.textContent = fmt(0);
    if (!reduce) enter();
    running = false;
  };

  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    let moving = false;
    for (const p of cells) if (!p.active) seat(p); else if (!p.parked) moving = true;
    if (moving) {
      world.timestep = dt;
      world.step();
      for (const p of cells) {
        if (!p.active || p.parked) continue;
        const t = p.body.translation();
        // When it drops far enough below the screen, set the body upright and hide it
        if (t.y < -H / 2 - CFG.parkBelow) { p.parked = true; p.body.setBodyType(RAPIER.RigidBodyType.Fixed, false); p.col.setEnabled(false); p.mesh.visible = false; continue; }
        p.mesh.position.set(t.x, t.y, 0);
        p.mesh.rotation.z = p.body.rotation();
      }
    }
    R.render(scene, cam);
    if (running) elTime.textContent = fmt(now - t0);
  });

  setLeft();
  onReady(() => { if (!reduce) enter(); });

  root.querySelector(".gm-reset").addEventListener("click", reset);
  const board = root.querySelector(".gm-board");
  root.querySelector(".gm-board-btn").addEventListener("click", () => {
    board.hidden = false;
    if (!reduce) gsap.from(".gm-board-in", { y: 40, rotate: 6, autoAlpha: 0, duration: 0.5, ease: "power3.out" });
  });
  board.addEventListener("click", (e) => (e.target === board || e.target.closest(".gm-board-close")) && (board.hidden = true));
  const sBtn = root.querySelector(".gm-sound");
  sBtn.addEventListener("click", () => { sound = !sound; sBtn.setAttribute("aria-pressed", sound); });
})();
