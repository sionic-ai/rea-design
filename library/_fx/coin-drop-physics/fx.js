// Inside the board, 3D coins (rim edge + hollow face + ring pattern) fall with matter-js physics and pile up, hitting the floor, text boxes (solid) and walls.
// Every few seconds a coin is thrown in from off the left on a parabola, and once over the set count the oldest coin vanishes. Coins can be grabbed, dragged and thrown.
// Original values (Brand hero): engine position 14 · velocity 10 iterations · gravity clamp(3.1×height/1000, 1.9, 3.1) · body bounce .2 · friction .04 · static friction .08 · air .014 · density .0016
// · wall friction .3 · restitution .25 · radius clamp(.27×strip, 30, 72) · one coin every 3.2s×(.85~1.15) · fade-out 520ms smoothstep · appear 320ms cubic · drag stiffness .2 damping .12 (air .05)
// · Camera field of view 28(1 unit = 1px) · directional light 2.4 (.93w, .18h, .32w) · hemisphere light .55 · material roughness .42·clearcoat .35 · shadow blob 2.5r (−.16r, −.12r).
(() => {
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const color = (el, name, fb) => {
    const s = document.createElement("i");
    s.style.cssText = `position:absolute;width:0;height:0;visibility:hidden;color:var(${name}, var(${fb}))`;
    el.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return { r, g, b, hex: (r << 16) | (g << 8) | b };
  };

  kfFx.register("coin-drop-physics", (el, { options, reduce }) => {
    const THREE = window.THREE, Matter = window.Matter;
    if (!THREE || !Matter) return;
    const floorEl = el.querySelector('[data-fx-part="floor"]');
    if (!floorEl) return;
    const { Engine, Bodies, Body, Composite, Constraint } = Matter;
    const coarse = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.25 : 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.78;
    const cvs = renderer.domElement;
    cvs.dataset.fxPart = "canvas";
    cvs.setAttribute("aria-hidden", "true");
    el.prepend(cvs);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(28, 1, 10, 2e4);
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); /* Not skin: strength of white light — object colors come from skin variables */
    scene.add(sun, sun.target, new THREE.HemisphereLight(0xffffff, 0x3a0010, 0.55)); /* Not skin: sky and ground colors — original hemisphere light values */
    // The original lights the leaves with a room environment map (RoomEnvironment, intensity .45) — we fill in the same brightness with a single chosen light
    scene.add(new THREE.AmbientLight(0xffffff, +(options.fill ?? 1.6))); /* Not skin: white fill light */

    // A single coin — body from a revolved cross-section (rim thickness 96, radius 280) + recessed front disc + ring pattern (the original logo spot uses our ring instead)
    const prof = [[0, -48], [260, -48], [274, -42], [280, -28], [280, 28], [274, 42], [260, 48], [248, 48], [248, 40], [236, 40], [0, 40]].map(([x, y]) => new THREE.Vector2(x, y));
    const bodyGeo = new THREE.LatheGeometry(prof, coarse ? 48 : 72);
    bodyGeo.rotateX(Math.PI / 2);
    const ringGeo = new THREE.TorusGeometry(132, 20, 12, coarse ? 48 : 72);
    ringGeo.translate(0, 0, 44);
    const dotGeo = new THREE.CircleGeometry(36, 32);
    dotGeo.translate(0, 0, 41);
    const blobCvs = document.createElement("canvas");
    blobCvs.width = blobCvs.height = 128;
    const shadow = color(el, "--fx-shadow", "--kf-ink");
    const bg = blobCvs.getContext("2d"), grd = bg.createRadialGradient(64, 64, 20, 64, 64, 64);
    grd.addColorStop(0, `rgba(${shadow.r},${shadow.g},${shadow.b},0.55)`); grd.addColorStop(0.55, `rgba(${shadow.r},${shadow.g},${shadow.b},0.28)`); grd.addColorStop(1, `rgba(${shadow.r},${shadow.g},${shadow.b},0)`);
    bg.fillStyle = grd; bg.fillRect(0, 0, 128, 128);
    const blobTex = new THREE.CanvasTexture(blobCvs);
    blobTex.colorSpace = THREE.SRGBColorSpace;
    const blobGeo = new THREE.PlaneGeometry(1, 1), blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false });
    const palette = Array.from({ length: 10 }, (_, i) => color(el, `--fx-coin-${i + 1}`, "--kf-accent").hex);
    const mats = palette.map((hex) => {
      const base = { color: new THREE.Color(hex), roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.25 };
      return coarse ? new THREE.MeshStandardMaterial({ color: base.color, roughness: 0.38, metalness: 0 }) : new THREE.MeshPhysicalMaterial(base);
    });

    const engine = Engine.create({ enableSleeping: false, positionIterations: 14, velocityIterations: 10 });
    const world = engine.world;
    let walls = [], solids = [], coins = [], g = null, clock = 0, nextAt = 0, pick = Math.floor(Math.random() * mats.length), grab = null;
    // Filtering — leaf 1 · side walls and ceiling 2 · floor and text box 4. An incoming leaf passes the side wall (2) until it is fully inside the board
    // Classes: 1 coin · 2 wall · 4 floor · 8 text box. A thrown coin outside the wall only collides with coins and floor, and once inside the panel it passes behind the text until it drops below the text line
    const COIN = { restitution: 0.2, friction: 0.04, frictionStatic: 0.08, frictionAir: 0.014, slop: 0.02, density: 0.0016, collisionFilter: { category: 1, mask: 15 } };
    const WALL = { isStatic: true, friction: 0.3, frictionStatic: 0.4, restitution: 0.25, collisionFilter: { category: 2, mask: 1 } };
    const FLOOR = { ...WALL, restitution: 0.2, collisionFilter: { category: 4, mask: 1 } };
    const SOLID = { ...FLOOR, collisionFilter: { category: 8, mask: 1 } };

    const measure = () => {
      const box = el.getBoundingClientRect(), fl = floorEl.getBoundingClientRect();
      const w = box.width, h = box.height, floor = fl.top - box.top;
      if (w < 10) return null;
      const rects = [...el.querySelectorAll('[data-fx-part="solid"]')].map((s) => s.getBoundingClientRect()).filter((r) => r.width > 1 && r.height > 1)
        .map((r) => ({ l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top }));
      const above = rects.reduce((m, r) => (r.b < floor ? Math.max(m, r.b) : m), 0);
      const band = Math.max(60, floor - above);
      const r = Math.round(Math.min(Math.max(0.27 * band, 30), +(options.r ?? 72), w / 9));
      const max = +(options.max || 0) || Math.max(5, Math.round(Math.floor(w / (2.05 * r)) * Math.min(Math.max((band - 2 * r) / (1.73 * r) + 0.2, 0.85), 2.1))) * (coarse ? 0.6 : 1) | 0;
      return { w, h, floor, r, max: Math.max(4, max), rects };
    };
    const build = () => {
      const m = measure();
      if (!m) return;
      g = m;
      renderer.setSize(g.w, g.h, false);
      cam.aspect = g.w / g.h;
      cam.position.set(0, 0, g.h / 2 / Math.tan(THREE.MathUtils.degToRad(14)));
      cam.updateProjectionMatrix();
      sun.position.set(0.93 * g.w, 0.18 * g.h, 0.32 * g.w);
      engine.gravity.y = Math.min(3.1, Math.max(1.9, (3.1 * g.h) / 1000));
      Composite.remove(world, walls); Composite.remove(world, solids);
      walls = [
        Bodies.rectangle(-200, g.h / 2, 400, g.h + 800, WALL), Bodies.rectangle(g.w + 200, g.h / 2, 400, g.h + 800, WALL),
        Bodies.rectangle(g.w / 2, -200 - 2 * g.r, g.w + 800, 400, WALL), Bodies.rectangle(g.w / 2, g.floor + 200, g.w + 800, 400, FLOOR),
      ];
      solids = g.rects.map((s) => Bodies.rectangle((s.l + s.r) / 2, (s.t + s.b) / 2, s.r - s.l, s.b - s.t, { ...SOLID, chamfer: { radius: Math.min(8, (s.b - s.t) / 2) } }));
      Composite.add(world, [...walls, ...solids]);
      coins.forEach((c) => { const k = g.r / c.r0; c.group.scale.setScalar((g.r / 280) * (c.pop ? 0 : 1)); Body.scale(c.body, k, k); c.r0 = g.r; });
    };
    const spawn = (x, y, launch) => {
      const body = Bodies.circle(x, y, g.r, { ...COIN, angle: Math.random() * Math.PI * 2 });
      const mat = mats[pick++ % mats.length];
      const group = new THREE.Group();
      [bodyGeo, ringGeo, dotGeo].forEach((geo) => group.add(new THREE.Mesh(geo, mat)));
      scene.add(group);
      const blob = new THREE.Mesh(blobGeo, blobMat);
      blob.renderOrder = -1;
      scene.add(blob);
      const c = { body, group, blob, mat, born: clock, dying: 0, pop: launch ? 0 : clock || 1, r0: g.r, entering: launch ? 1 : 0 };
      if (launch) { body.collisionFilter = { category: 1, mask: 5 }; body.frictionAir = 0; Body.setVelocity(body, launch); }
      Composite.add(world, body);
      coins.push(c);
      const alive = coins.filter((k) => !k.dying);
      if (alive.length > g.max) { const old = alive.find((k) => k !== grab?.coin); if (old) old.dying = clock || 1; }
      return c;
    };
    const kill = (c) => { Composite.remove(world, c.body); scene.remove(c.group, c.blob); if (c.fade) c.fade.forEach((m) => m.dispose()); coins.splice(coins.indexOf(c), 1); };
    const settle = () => {
      for (let i = 0; i < g.max; i++) { spawn(g.r + 6 + Math.random() * (g.w - 2 * g.r - 12), g.floor - g.r - Math.random() * 3 * g.r); for (let k = 0; k < 40; k++) Engine.update(engine, 1000 / 60); }
      for (let k = 0; k < 400; k++) Engine.update(engine, 1000 / 60);
      coins.forEach((c) => (c.pop = 0));
    };
    // Thrown from outside the left to land somewhere at 20~80% of the panel floor — shoots upward by the height lost to gravity over the flight time T.
    // If there is text on the incoming side (the width of the left 4 petals), it is thrown from the height above that text (the original comes in over the text). While flying it passes behind the text
    const throwIn = () => {
      const tx = g.w * (0.2 + 0.6 * Math.random()), T = 38 + Math.random() * 14, grav = engine.gravity.y * engine.gravity.scale * (1000 / 60) ** 2;
      const near = g.rects.filter((s) => s.l < 4 * g.r && s.b < g.floor);
      const over = near.length ? Math.min(...near.map((s) => s.t)) - g.r - 10 : Infinity;
      const y0 = Math.max(g.r + 10, Math.min(g.floor - 5 * g.r, over)), ty = g.floor - g.r;
      spawn(-g.r - 4, y0, { x: (tx + g.r + 4) / T, y: (ty - y0) / T - (grav * T) / 2 });
    };
    // Has it come all the way below the text line — after that it also collides with the text (if it lands on text while flying, a leaf stays on the text)
    const belowText = (p) => p.y - g.r > g.rects.reduce((m, s) => (s.b < g.floor ? Math.max(m, s.b) : m), -Infinity) + 2;
    const draw = () => {
      const t = g.r / 280;
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i], p = c.body.position;
        c.group.position.set(p.x - g.w / 2, g.h / 2 - p.y, 0);
        c.group.rotation.z = -c.body.angle;
        let a = 1, o = 1;
        if (c.pop) { const e = Math.min(1, (clock - c.pop) / 320); a = 1 - (1 - e) ** 3; if (e >= 1) c.pop = 0; }
        if (c.dying) {
          const e = Math.min(1, (clock - c.dying) / 520);
          if (e >= 1) { kill(c); continue; }
          o = 1 - e * e * (3 - 2 * e);
          if (!c.fade) { const m = c.mat.clone(); m.transparent = true; c.fade = [m]; c.group.children.forEach((k) => (k.material = m)); }
          c.fade[0].opacity = o;
        }
        c.group.scale.setScalar(t * a);
        c.blob.position.set(p.x - g.w / 2 - 0.16 * g.r, g.h / 2 - p.y - 0.12 * g.r, -48 * t - 2);
        c.blob.scale.setScalar(2.5 * g.r * a);
        c.blob.material.opacity = o;
      }
    };

    build();
    if (!g) { renderer.dispose(); cvs.remove(); return; }
    renderer.compile(scene, cam);
    if (reduce) { settle(); draw(); renderer.render(scene, cam); return () => { renderer.dispose(); cvs.remove(); }; }
    // At first, burst petals enter the empty board one after another at .32s intervals, then one petal about every 3.2s (original ek·eB)
    if (options.settle === "on") settle();
    let burst = +(options.burst ?? 4);
    nextAt = 0;

    // Drag — a press on the board that touches a coin grabs it as a constraint, and the hand pulls it at most 1.2r per frame
    const local = (e) => { const b = el.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const hit = (p) => { let best = null, d = 1.08 * g.r; for (const c of coins) { if (c.dying) continue; const k = Math.hypot(c.body.position.x - p.x, c.body.position.y - p.y); if (k < d) { best = c; d = k; } } return best; };
    const onDown = (e) => {
      if (e.button !== 0 || grab) return;
      const p = local(e), c = hit(p);
      if (!c) return;
      e.preventDefault();
      const con = Constraint.create({ pointA: { ...p }, bodyB: c.body, pointB: { x: p.x - c.body.position.x, y: p.y - c.body.position.y }, length: 0, stiffness: 0.2, damping: 0.12 });
      Composite.add(world, con);
      c.body.frictionAir = 0.05;
      grab = { coin: c, con, id: e.pointerId, to: p };
      try { el.setPointerCapture(e.pointerId); } catch {}
      el.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      const p = local(e);
      if (grab && e.pointerId === grab.id) { grab.to = { x: Math.min(Math.max(p.x, 0), g.w), y: Math.min(Math.max(p.y, 0), g.h) }; return; }
      if (e.pointerType === "mouse") el.style.cursor = hit(p) ? "grab" : "";
    };
    const release = (e) => {
      if (!grab || (e && e.pointerId !== grab.id)) return;
      Composite.remove(world, grab.con); grab.coin.body.frictionAir = 0.014;
      try { el.releasePointerCapture(grab.id); } catch {}
      grab = null; el.style.cursor = "";
    };
    const follow = () => {
      if (!grab) return;
      const b = grab.coin.body, o = grab.con.pointB, x = b.position.x + o.x, y = b.position.y + o.y, dx = grab.to.x - x, dy = grab.to.y - y, d = Math.hypot(dx, dy), k = d > 1.2 * g.r ? (1.2 * g.r) / d : 1;
      grab.con.pointA = { x: x + dx * k, y: y + dy * k };
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    let raf = 0, last = 0, on = false, still = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(33, Math.max(1, now - (last || now)));
      last = now;
      clock += dt;
      if (clock >= nextAt) { throwIn(); if (burst > 0) burst--; nextAt = clock + (burst > 0 ? 320 : 3200 * (0.85 + 0.3 * Math.random())); }
      for (let i = 0; i < 2; i++) { follow(); Engine.update(engine, dt / 2); }
      const cap = 0.45 * g.r;
      coins.forEach((c) => {
        if (c.entering === 1 && c.body.position.x - g.r > 1) { c.entering = 2; c.body.collisionFilter = { category: 1, mask: 7 }; }
        if (c.entering === 2 && belowText(c.body.position)) { c.entering = 0; c.body.collisionFilter = { category: 1, mask: 15 }; c.body.frictionAir = 0.014; }
        if (c.entering === 1 && !c.dying && clock - c.born > 2000) c.dying = clock;
        if (c.entering) return;
        const v = c.body.velocity, s = Math.hypot(v.x, v.y);
        if (s > cap) Body.setVelocity(c.body, { x: (v.x * cap) / s, y: (v.y * cap) / s });
      });
      draw();
      const moving = grab || coins.some((c) => c.dying || c.pop || c.body.speed > 0.04 || Math.abs(c.body.angularSpeed) > 0.002);
      if (moving) { still = 0; renderer.render(scene, cam); } else if (still < 3) { still++; renderer.render(scene, cam); }
    };
    const run = (v) => { if (v && !on) { on = true; last = 0; raf = requestAnimationFrame(frame); } else if (!v && on) { on = false; cancelAnimationFrame(raf); } };
    let seen = false;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; run(seen && !document.hidden); });
    io.observe(el);
    const onVis = () => run(seen && !document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => { clearTimeout(ro.t); ro.t = setTimeout(() => { build(); draw(); renderer.render(scene, cam); }, 150); });
    ro.observe(el);
    draw();
    renderer.render(scene, cam);
    return () => {
      run(false); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerup", release); el.removeEventListener("pointercancel", release);
      [...coins].forEach(kill); Composite.clear(world, false); Engine.clear(engine);
      [bodyGeo, ringGeo, dotGeo, blobGeo, blobMat, blobTex, ...mats].forEach((x) => x.dispose());
      renderer.dispose(); cvs.remove(); el.style.cursor = "";
    };
  });
})();
