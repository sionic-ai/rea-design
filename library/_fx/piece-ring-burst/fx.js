(() => {
  // Hundreds of silhouette pieces — hands, leaves, flowers, birds, fish, houses — fill the board, leaving the center ellipse empty (text area). When touched or signaled, the pieces
  // Grows near the center and camera side (.7s back.out), flies to its place over 2s expo.inOut and settles, then each one sways on its own.
  // When the mouse moves fast, a ripple spreading to both sides from that angle flips the passed pieces on the x axis (returning in 1.5s sine.in),
  // Pressing flips everything together, and scrolling scatters it upward and fades it (three.js r148)
  const P = Math.PI;
  const ell = (c, x, y, rx, ry, r = 0) => { c.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r)); c.ellipse(x, y, rx, ry, r, 0, P * 2); };
  const cut = (c, fn) => { c.save(); c.globalCompositeOperation = "destination-out"; c.beginPath(); fn(); c.fill(); c.restore(); };
  const cutStroke = (c, w, fn) => { c.save(); c.globalCompositeOperation = "destination-out"; c.lineWidth = w; c.lineCap = "round"; c.beginPath(); fn(); c.stroke(); c.restore(); };
  const poly = (c, pts) => { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); };

  const SHAPES = {
    heart(c) { c.beginPath(); c.moveTo(50, 90); c.bezierCurveTo(8, 62, 2, 34, 20, 20); c.bezierCurveTo(34, 9, 47, 16, 50, 30); c.bezierCurveTo(53, 16, 66, 9, 80, 20); c.bezierCurveTo(98, 34, 92, 62, 50, 90); c.fill(); },
    flower(c) { c.beginPath(); for (let k = 0; k < 5; k++) { const a = (k * 2 * P) / 5 - P / 2; ell(c, 50 + 24 * Math.cos(a), 50 + 24 * Math.sin(a), 19, 19); } c.fill(); cut(c, () => ell(c, 50, 50, 8, 8)); },
    leaf(c) { c.beginPath(); c.moveTo(50, 4); c.quadraticCurveTo(94, 48, 50, 96); c.quadraticCurveTo(6, 48, 50, 4); c.fill(); cutStroke(c, 3, () => { c.moveTo(50, 22); c.lineTo(50, 86); c.moveTo(50, 46); c.lineTo(66, 34); c.moveTo(50, 62); c.lineTo(34, 50); }); },
    sprig(c) {
      c.lineWidth = 5; c.lineCap = "round"; c.beginPath(); c.moveTo(48, 98); c.quadraticCurveTo(58, 50, 50, 4); c.stroke();
      c.beginPath();
      [[50, 18, -0.8], [54, 36, 0.9], [52, 54, -0.9], [54, 72, 0.8]].forEach(([x, y, r]) => ell(c, x + Math.sign(r) * 13, y, 15, 7, r));
      c.fill();
    },
    drop(c) { c.beginPath(); c.moveTo(50, 4); c.bezierCurveTo(62, 30, 80, 48, 80, 66); c.arc(50, 66, 30, 0, P, false); c.bezierCurveTo(20, 48, 38, 30, 50, 4); c.fill(); },
    flash(c) { const pts = []; for (let k = 0; k < 16; k++) { const a = (k * P) / 8, r = k % 2 ? 17 : 44 + ((k * 7) % 5); pts.push(50 + r * Math.cos(a), 50 + r * Math.sin(a)); } c.beginPath(); poly(c, pts); c.fill(); cut(c, () => ell(c, 50, 50, 6, 6)); },
    fish(c) { c.beginPath(); ell(c, 42, 50, 32, 18); c.fill(); c.beginPath(); poly(c, [68, 50, 97, 28, 92, 50, 97, 72]); c.fill(); cut(c, () => ell(c, 24, 45, 4.5, 4.5)); },
    bird(c) {
      c.beginPath(); ell(c, 48, 60, 28, 15, -0.25); ell(c, 24, 46, 12, 12); c.fill();
      c.beginPath(); poly(c, [13, 43, 2, 48, 14, 50]); c.fill();
      c.beginPath(); c.moveTo(40, 54); c.quadraticCurveTo(58, 6, 84, 14); c.quadraticCurveTo(70, 36, 62, 60); c.closePath(); c.fill();
      c.beginPath(); poly(c, [70, 64, 98, 58, 94, 80]); c.fill();
      cut(c, () => ell(c, 21, 44, 3, 3));
    },
    hand(c) {
      c.beginPath(); c.roundRect(26, 44, 48, 48, 18);
      [[28, 14, 34], [40, 6, 42], [52, 8, 40], [64, 16, 32]].forEach(([x, y, h]) => c.roundRect(x, y, 10, h, 5));
      c.fill();
      c.save(); c.translate(26, 62); c.rotate(-0.7); c.beginPath(); c.roundRect(-28, -6, 30, 11, 5.5); c.fill(); c.restore();
      cut(c, () => { c.moveTo(50, 80); c.bezierCurveTo(38, 72, 40, 62, 46, 62); c.bezierCurveTo(49, 62, 50, 65, 50, 66); c.bezierCurveTo(50, 65, 51, 62, 54, 62); c.bezierCurveTo(60, 62, 62, 72, 50, 80); });
    },
    house(c) { c.beginPath(); poly(c, [50, 6, 94, 44, 84, 44, 84, 94, 16, 94, 16, 44, 6, 44]); c.fill(); cut(c, () => { c.rect(37, 54, 12, 12); c.rect(51, 54, 12, 12); c.rect(37, 68, 12, 12); c.rect(51, 68, 12, 12); }); },
    tree(c) { c.beginPath(); poly(c, [50, 2, 68, 28, 59, 28, 78, 54, 66, 54, 88, 82, 12, 82, 34, 54, 22, 54, 41, 28, 32, 28]); c.rect(44, 80, 12, 18); c.fill(); },
    note(c) { c.beginPath(); ell(c, 32, 78, 16, 12, -0.4); c.rect(42, 12, 7, 64); c.fill(); c.beginPath(); c.moveTo(46, 12); c.quadraticCurveTo(82, 22, 78, 52); c.quadraticCurveTo(72, 32, 46, 32); c.closePath(); c.fill(); },
    apple(c) { c.beginPath(); ell(c, 37, 60, 27, 30); ell(c, 63, 60, 27, 30); c.fill(); c.beginPath(); ell(c, 64, 18, 14, 6, -0.6); c.fill(); c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(50, 32); c.lineTo(52, 16); c.stroke(); },
    clover(c) { c.beginPath(); ell(c, 50, 28, 19, 19); ell(c, 29, 60, 19, 19); ell(c, 71, 60, 19, 19); c.fill(); c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(50, 52); c.quadraticCurveTo(54, 80, 64, 96); c.stroke(); },
    human(c) {
      c.beginPath(); ell(c, 58, 13, 10, 10); c.fill();
      c.lineWidth = 10; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath();
      c.moveTo(55, 28); c.lineTo(47, 58); c.lineTo(32, 92); c.moveTo(47, 58); c.lineTo(64, 90); c.moveTo(53, 36); c.lineTo(36, 52); c.moveTo(53, 36); c.lineTo(70, 48);
      c.stroke();
    },
    fire(c) { c.beginPath(); c.moveTo(50, 97); c.bezierCurveTo(16, 92, 10, 60, 30, 38); c.bezierCurveTo(34, 54, 42, 52, 40, 28); c.bezierCurveTo(54, 38, 62, 20, 58, 3); c.bezierCurveTo(84, 24, 92, 62, 78, 84); c.bezierCurveTo(72, 93, 61, 97, 50, 97); c.fill(); cut(c, () => { c.moveTo(50, 90); c.bezierCurveTo(38, 86, 38, 72, 48, 62); c.bezierCurveTo(52, 72, 62, 74, 58, 86); c.closePath(); }); },
    dot(c) { c.beginPath(); ell(c, 50, 50, 26, 26); c.fill(); },
  };

  const NAMES = Object.keys(SHAPES);
  const ease = {
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outQ: (t) => 1 - (1 - t) * (1 - t),
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const colorOf = (el, prop) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color:var(${prop})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  const textures = (colA, colB) => {
    const out = {};
    for (const name of NAMES) {
      out[name] = [0, 1].map((v) => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 128;
        const c = cv.getContext("2d");
        c.scale(1.28, 1.28);
        const g = v ? c.createLinearGradient(0, 100, 100, 0) : c.createLinearGradient(0, 0, 100, 100);
        g.addColorStop(0, v ? colB : colA);
        g.addColorStop(1, v ? colA : colB);
        c.fillStyle = g; c.strokeStyle = g;
        SHAPES[name](c);
        return new THREE.CanvasTexture(cv);
      });
    }
    return out;
  };

  kfFx.register("piece-ring-burst", (el, { options, reduce, scroller }) => {
    if (!window.THREE || !window.gsap) return;
    const step = +options.step || 70;
    const rx = +options.rx || 430, ry = +options.ry || 225, cy = +(options.cy ?? 10);
    const on = options.on || "load";
    const wave = options.wave !== "off";
    const useScroll = options.scroll !== "off";
    const cs = getComputedStyle(el);
    if (cs.position === "static") el.style.position = "relative";
    el.style.overflow = "hidden";

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;pointer-events:none";
    el.append(renderer.domElement);
    const scene = new THREE.Scene();
    const FOV = 45;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 6000);
    const world = new THREE.Group(), field = new THREE.Group();
    world.add(field); scene.add(world);

    const tex = textures(colorOf(el, "--fx-piece-a"), colorOf(el, "--fx-piece-b"));
    const geo = new THREE.PlaneGeometry(1, 1);
    const spots = [];
    for (let y = -760; y <= 860; y += step * 0.86) for (let x = -1000; x <= 1000; x += step) {
      const px = x + rand(-step * 0.38, step * 0.38) + ((Math.round(y / step) % 2) * step) / 2, py = y + rand(-step * 0.3, step * 0.3);
      if ((px / rx) ** 2 + ((py - cy) / ry) ** 2 < 1 + rand(0, 0.25)) continue;
      spots.push({ x: px, y: py, rot: Math.atan2(px, py - cy) * (180 / Math.PI) });
    }
    // Don’t build pieces outside the board — with many boards frames drop and the flip (.075 follow) lags
    const sc0 = options.scale ? +options.scale : innerWidth < 600 ? 0.54 : innerWidth <= 959 ? 1 : 1.203;
    const bx = (el.clientWidth || innerWidth) / 2 / sc0 + 140, by = (el.clientHeight || innerHeight) / 2 / sc0 + 140;
    const pieces = spots.sort(() => 0.5 - Math.random()).filter((s) => Math.abs(s.x) < bx && Math.abs(s.y) < by).map((s, i) => {
      const name = NAMES[i % NAMES.length], size = name === "dot" ? rand(24, 34) : /^(flower|drop|clover|note)$/.test(name) ? rand(38, 60) : rand(66, 104);
      const mat = new THREE.MeshBasicMaterial({ map: tex[name][i % 2], transparent: true, depthTest: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(size, size, 1);
      const inner = new THREE.Group(); inner.add(mesh);
      const outer = new THREE.Group(); outer.add(inner); outer.visible = false;
      field.add(outer);
      return { outer, inner, mat, size, index: i, last: new THREE.Vector3(s.x, s.y, 0), lastRot: new THREE.Euler(0, 0, -(Math.PI / 180) * s.rot), angle: Math.atan2(s.y, s.x), exPos: new THREE.Vector3(), exRot: 0, sensitivity: 0, power: 0, tween: null, ready: false };
    });

    let W = 1, H = 1;
    const layout = () => {
      W = el.clientWidth || 1; H = el.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.set(0, 0, H / 2 / Math.tan((FOV / 2) * (Math.PI / 180)));
      camera.updateProjectionMatrix();
      const s = options.scale ? +options.scale : innerWidth < 600 ? 0.54 : innerWidth <= 959 ? 1 : 1.203;
      world.scale.set(s, s, s);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);

    const S = { scroll: 0, explosion: 0, waves: [], lastT: 0, lastPtr: new THREE.Vector2(), ptr: new THREE.Vector2(), live: false };
    const tweens = [];
    const setPower = (p, v) => {
      if (2 * p.power > v) return;
      p.power = Math.min(1, p.power + v);
      p.tween?.kill();
      p.tween = gsap.to(p, { power: 0, duration: 1.5, ease: "sine.in" });
    };
    const onMove = (e) => {
      if (S.scroll >= 0.1) return;
      const r = el.getBoundingClientRect();
      S.ptr.set(e.clientX - r.left - W / 2, Math.abs(e.clientY - r.top - H) - H / 2);
    };
    const onDown = (e) => { if (S.live && S.scroll < 0.1 && el.contains(e.target)) pieces.forEach((p) => p.ready && setPower(p, 0.75)); };
    const src = scroller || window;
    const onScroll = () => {
      if (!useScroll) return;
      // For a panel pinned to the screen, scrolled distance ÷ dist (default screen height), for a panel in the flow, the share that has exited upward
      if (getComputedStyle(el).position === "fixed") S.scroll = (scroller ? scroller.scrollTop : scrollY) / (+options.dist || innerHeight);
      else { const r = el.getBoundingClientRect(); S.scroll = Math.max(0, -r.top) / Math.max(1, r.height); }
    };
    if (wave) addEventListener("pointermove", onMove);
    addEventListener("pointerdown", onDown);
    src.addEventListener("scroll", onScroll, { passive: true });

    const burst = (p) => {
      const lp = p.last, s = Math.hypot(lp.x, lp.y);
      const a = Math.atan2(lp.y, lp.x) + rand(-0.1 * Math.PI, 0.1 * Math.PI);
      const o = s * rand(0.15, 0.25 + 0.25 * ease.outQ(Math.min(1, s / 1000)));
      const d = 0.5 * ease.inOut(Math.min(1, s / 1000)) + 0.35;
      p.outer.visible = true;
      p.outer.position.set(Math.cos(a) * o, Math.sin(a) * o, 250 + 0.5 * s);
      p.outer.rotation.set(rand(-0.2 * Math.PI, 0.2 * Math.PI), rand(-0.2 * Math.PI, 0.2 * Math.PI), rand(-Math.PI, Math.PI));
      p.outer.scale.set(0, 0, 0);
      tweens.push(
        gsap.to(p.outer.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.7, delay: d, ease: "back.out" }),
        gsap.to(p.outer.position, { x: lp.x, y: lp.y, z: 0, duration: 2, delay: d, ease: "expo.inOut" }),
        gsap.to(p.outer.rotation, { x: p.lastRot.x, y: p.lastRot.y, z: p.lastRot.z, duration: 2, delay: d, ease: "expo.inOut", onComplete: () => {
          p.ready = true;
          tweens.push(gsap.to(p, { sensitivity: 1, duration: 1, ease: "sine.in" }));
          p.exPos.set(p.index % 2 === 0 ? p.size / 10 : -p.size / 10, 500 + rand(0, 25) * (p.size / 100), 0);
          p.exRot = Math.PI * (p.index % 2 === 0 ? -0.035 : 0.035);
        } }),
      );
    };
    const settle = () => pieces.forEach((p) => { p.outer.visible = true; p.outer.position.copy(p.last); p.outer.rotation.copy(p.lastRot); p.outer.scale.set(0.85, 0.85, 0.85); p.ready = true; });
    const start = () => {
      if (S.live) return;
      S.live = true;
      if (reduce) { settle(); renderer.render(scene, camera); return; }
      pieces.forEach(burst);
      field.scale.set(1, 1, 1);
      tweens.push(gsap.to(field.scale, { x: 0.95, y: 0.95, z: 0.95, duration: 3, ease: "sine.inOut" }));
    };
    const onBurst = () => start();
    if (on === "load") start(); else el.addEventListener("fx:burst", onBurst);

    let last = 0;
    const tick = () => {
      if (!S.live) { renderer.render(scene, camera); return; }
      const now = performance.now() / 1000;
      if (wave && !reduce) {
        const dt = Math.max(0.001, now - (last || now));
        const speed = S.lastT ? S.lastPtr.distanceTo(S.ptr) / dt : 0;
        S.lastT = now; last = now; S.lastPtr.copy(S.ptr);
        if (speed > 100 && (!S.waves.length || S.waves[S.waves.length - 1].started < now - 0.1)) {
          const w = { angle: Math.atan2(S.ptr.y, S.ptr.x), power: Math.min(1, speed / 1000), pos: 0, prev: 0, off: 0, started: now, done: false };
          gsap.to(w, { pos: 0.25, duration: 0.25, ease: "sine.out" });
          gsap.to(w, { power: 0, duration: 0.25, ease: "sine.out", onUpdate: () => { w.off = w.pos - w.prev; w.prev = w.pos; }, onComplete: () => { w.done = true; } });
          S.waves.push(w);
        }
        S.waves = S.waves.filter((w) => !w.done);
        for (const w of S.waves) for (const p of pieces) {
          if (!p.ready) continue;
          const t = p.angle, i = w.angle + w.pos * Math.PI, n = w.angle - w.pos * Math.PI, r = w.off * Math.PI;
          if ((t <= i && t >= i - r) || (t >= n && t <= n + r)) setPower(p, w.power);
        }
      }
      S.explosion += (ease.inOut(Math.min(1, S.scroll)) - S.explosion) * 0.1;
      const ex = ease.outQ(S.explosion), k = innerWidth < 600 ? 2 : 1;
      for (const p of pieces) {
        if (!p.ready || reduce) continue;
        const e = now * 0.5 + p.angle / Math.PI, T = Math.floor(e), f = e - T, n = 1 - 2 * Math.abs(f - 0.5);
        p.inner.rotation.z = Math.sin(f * Math.PI * (T % 2 === 0 ? 4 : 2)) * (T % 2 === 0 ? 0.05 : 0.01) * p.sensitivity * n;
        p.inner.rotation.x += (p.power * Math.PI * 0.5 - p.inner.rotation.x) * 0.075;
        p.outer.position.set(p.last.x + p.exPos.x * ex * k, p.last.y + p.exPos.y * ex * k, 0);
        p.outer.rotation.set(p.lastRot.x, p.lastRot.y, p.lastRot.z + p.exRot * ex);
        p.mat.opacity = ease.inOut(Math.min(1, 1 - S.explosion));
      }
      el.style.setProperty("--fx-burst", S.explosion.toFixed(4));
      renderer.render(scene, camera);
    };
    renderer.compile(scene, camera);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      tweens.forEach((t) => t.kill());
      pieces.forEach((p) => p.tween?.kill());
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      src.removeEventListener("scroll", onScroll);
      el.removeEventListener("fx:burst", onBurst);
      geo.dispose();
      pieces.forEach((p) => p.mat.dispose());
      Object.values(tex).flat().forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      el.style.removeProperty("--fx-burst");
    };
  });
})();
