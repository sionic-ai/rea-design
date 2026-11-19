/* Hero — hundreds of pieces on a three.js plate. They burst out of the logo cluster and settle into an elliptical ring, flip in angular waves on fast mouse movement,
   Press and everything flips together, scroll and the pieces scatter upward and vanish. Values are read from the original (pieces a7, aY, se and text a6) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const host = document.querySelector("[data-mv]");
  const mainEl = document.querySelector("main");
  if (!host || !window.THREE || !window.PsPieces) return;
  const P = Math.PI;
  const rand = (a, b) => a + Math.random() * (b - a);
  const ease = {
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outQ: (t) => 1 - (1 - t) * (1 - t),
    inOutC: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };
  const colorOf = (name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const FOV = 45;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 6000);
  const world = new THREE.Group();
  const field = new THREE.Group();
  world.add(field);
  scene.add(world);

  // Like the original layout, spread the pieces across a wide board (±1000 × −760~860) but leave the center oval (the text spot) empty. The pieces rotate outward
  const spots = [];
  const STEP = 70;
  for (let y = -760; y <= 860; y += STEP * 0.86) {
    for (let x = -1000; x <= 1000; x += STEP) {
      const px = x + rand(-STEP * 0.38, STEP * 0.38) + ((Math.round(y / STEP) % 2) * STEP) / 2;
      const py = y + rand(-STEP * 0.3, STEP * 0.3);
      const e = (px / 430) ** 2 + ((py - 10) / 225) ** 2;
      if (e < 1 + rand(0, 0.25)) continue;
      spots.push({ x: px, y: py, rot: Math.atan2(px, py - 10) * (180 / P) });
    }
  }
  const tex = PsPieces.textures(THREE, colorOf("--kf-accent"), colorOf("--site-accent-2"));
  const names = PsPieces.NAMES;
  const geo = new THREE.PlaneGeometry(1, 1);
  // At phone width, pieces are sparse like the original — leave only six per column
  const thin = innerWidth < 600;
  // Off-screen pieces aren’t built. The original also shows only about 100 on screen, and with many panels the frame rate drops and the flip (.075 follow) lags
  const sc0 = innerWidth < 600 ? 0.54 : innerWidth <= 959 ? 1 : 1.203;
  const bx = innerWidth / 2 / sc0 + 140, by = innerHeight / 2 / sc0 + 140;
  const pieces = spots.sort(() => 0.5 - Math.random()).filter((s, i) => (!thin || i % 10 < 6) && Math.abs(s.x) < bx && Math.abs(s.y) < by).map((s, i) => {
    const name = names[i % names.length];
    // Like the original, mix small pieces (flower, droplet, clover, note, dot) with big pieces (hand, leaf, bird, house…)
    const size = name === "dot" ? rand(24, 34) : /^(flower|drop|clover|note)$/.test(name) ? rand(38, 60) : rand(66, 104);
    const mat = new THREE.MeshBasicMaterial({ map: tex[name][i % 2], transparent: true, depthTest: false, opacity: 1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(size * (thin ? 0.72 : 1), size * (thin ? 0.72 : 1), 1);
    const inner = new THREE.Group();
    inner.add(mesh);
    const outer = new THREE.Group();
    outer.add(inner);
    outer.visible = false;
    field.add(outer);
    return {
      outer, inner, mat, name, size, index: i,
      last: new THREE.Vector3(s.x, s.y, 0),
      lastRot: new THREE.Euler(0, 0, -(P / 180) * s.rot),
      angle: Math.atan2(s.y, s.x),
      exPos: new THREE.Vector3(), exRot: 0,
      sensitivity: 0, power: 0, powerTween: null, ready: false,
    };
  });

  // Logo cluster: one per type, a small tilted clump above the wordmark
  const logoSet = [];
  names.forEach((n, k) => {
    const p = pieces.find((q) => q.name === n && !q.inLogo);
    if (!p) return;
    p.inLogo = true;
    const col = k % 6, row = Math.floor(k / 6);
    p.logoPos = new THREE.Vector3(-42 + col * 17 + row * 9, 62 - row * 15 + (col % 2) * 4, 0);
    p.logoRot = rand(-P, P);
    logoSet.push(p);
  });

  let W = 1, H = 1;
  const layout = () => {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, true);
    camera.aspect = W / H;
    camera.position.set(0, 0, H / 2 / Math.tan((FOV / 2) * (P / 180)));
    camera.updateProjectionMatrix();
    const s = W < 600 ? 0.54 : W <= 959 ? 1 : 1.203;
    world.scale.set(s, s, s);
  };
  layout();
  addEventListener("resize", layout);

  // Ring state
  const S = { scroll: 0, explosion: 0, textEx: 0, maxScroll: H / 2, waves: [], lastT: 0, lastPtr: new THREE.Vector2(), ptr: new THREE.Vector2(), fv: false, logo: false, start: 0 };
  // The original measures the business section position while loading (content not yet fully set), so the pieces fully scatter around the middle of the message section — uses that position (top of message section + half a screen)
  const measure = () => {
    const msg = document.getElementById("message");
    S.maxScroll = msg ? msg.getBoundingClientRect().top + scrollY + H * 0.5 : H * 1.5;
  };
  measure();
  addEventListener("load", measure);
  addEventListener("resize", measure);

  const setPower = (p, v) => {
    if (2 * p.power > v) return;
    p.power = Math.min(1, p.power + v);
    p.powerTween?.kill();
    p.powerTween = gsap.to(p, { power: 0, duration: 1.5, ease: "sine.in" });
  };
  // Original se: a band spreading .25 turn (×π) to both sides from the mouse angle — gives intensity to the pieces the band passes
  const makeWave = (angle, power) => {
    const w = { angle, power, pos: 0, last: 0, off: 0, started: performance.now() / 1000, done: false };
    gsap.to(w, { pos: 0.25, duration: 0.25, ease: "sine.out" });
    gsap.to(w, { power: 0, duration: 0.25, ease: "sine.out", onUpdate: () => { w.off = w.pos - w.last; w.last = w.pos; }, onComplete: () => { w.done = true; } });
    return w;
  };
  const hit = (w, p) => {
    const t = p.angle, i = w.angle + w.pos * P, n = w.angle - w.pos * P, r = w.off * P;
    return (t <= i && t >= i - r) || (t >= n && t <= n + r) ? w.power : 0;
  };
  addEventListener("pointermove", (e) => {
    if (S.scroll >= 0.1) return;
    S.ptr.set(e.clientX - W / 2, Math.abs(e.clientY - H) - H / 2);
  });
  addEventListener("pointerdown", () => { if (S.fv && S.scroll < 0.1) pieces.forEach((p) => p.ready && setPower(p, 0.75)); });
  addEventListener("scroll", () => { S.scroll = scrollY / S.maxScroll; }, { passive: true });

  // One piece goes from where it burst (near the center, camera side) back into place — original aq.show
  const burst = (p, delay0 = 0) => {
    const lp = p.last;
    const s = Math.hypot(lp.x, lp.y);
    let a = Math.atan2(lp.y, lp.x) + rand(-0.1 * P, 0.1 * P);
    const o = s * rand(0.15, 0.25 + 0.25 * ease.outQ(Math.min(1, s / 1000)));
    const d = 0.5 * ease.inOut(Math.min(1, s / 1000)) + 0.35 + delay0;
    const from = p.inLogo && p.logoPos;
    p.outer.visible = true;
    p.mat.opacity = 1;
    if (from) {
      gsap.to(p.outer.position, { x: Math.cos(a) * o, y: Math.sin(a) * o, z: 250 + 0.5 * s, duration: 1.1, delay: 0.25 * d, ease: "power2.inOut" });
      gsap.to(p.outer.rotation, { x: rand(-0.2 * P, 0.2 * P), y: rand(-0.2 * P, 0.2 * P), z: p.outer.rotation.z + rand(-0.5 * P, 0.5 * P), duration: 1.1, delay: 0.25 * d, ease: "power2.inOut" });
    } else {
      p.outer.position.set(Math.cos(a) * o, Math.sin(a) * o, 250 + 0.5 * s);
      p.outer.rotation.set(rand(-0.2 * P, 0.2 * P), rand(-0.2 * P, 0.2 * P), rand(-P, P));
      p.outer.scale.set(0, 0, 0);
    }
    gsap.to(p.outer.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.7, delay: d, ease: "back.out" });
    gsap.to(p.outer.position, { z: 0, duration: 2, delay: d, ease: "expo.inOut" });
    gsap.to(p.outer.position, { x: lp.x, y: lp.y, duration: 2, delay: d, ease: "expo.inOut" });
    gsap.to(p.outer.rotation, {
      x: p.lastRot.x, y: p.lastRot.y, z: p.lastRot.z, duration: 2, delay: d, ease: "expo.inOut",
      onComplete: () => {
        p.ready = true;
        gsap.to(p, { sensitivity: 1, duration: 1, ease: "sine.in" });
        p.exPos.set(p.index % 2 === 0 ? 10 * (p.size / 100) : -10 * (p.size / 100), 500 + rand(0, 25) * (p.size / 100), 0);
        p.exRot = P * (p.index % 2 === 0 ? -0.035 : 0.035);
      },
    });
  };

  const tick = () => {
    const now = performance.now() / 1000;
    if (S.fv) {
      const dist = S.lastT ? S.lastPtr.distanceTo(S.ptr) : 0;
      const speed = S.lastT ? dist / Math.max(0.001, now - S.lastT) : 0;
      S.lastT = now;
      S.lastPtr.copy(S.ptr);
      if (speed > 100 && (!S.waves.length || S.waves[S.waves.length - 1].started < now - 0.1)) S.waves.push(makeWave(Math.atan2(S.ptr.y, S.ptr.x), Math.min(1, speed / 1000)));
      S.waves = S.waves.filter((w) => !w.done);
      for (const w of S.waves) for (const p of pieces) { if (!p.ready) continue; const v = hit(w, p); if (v > 0) setPower(p, v); }
      const target = ease.inOut(Math.min(1, S.scroll));
      S.explosion += (target - S.explosion) * 0.1;
      const ex = ease.outQ(S.explosion), k = W < 600 ? 2 : 1;
      for (const p of pieces) {
        if (!p.ready) continue;
        const e = now * 0.5 + p.angle / P, T = Math.floor(e), f = e - T, n = 1 - 2 * Math.abs(f - 0.5);
        p.inner.rotation.z = Math.sin(f * P * (T % 2 === 0 ? 4 : 2)) * (T % 2 === 0 ? 0.05 : 0.01) * p.sensitivity * n;
        p.inner.rotation.x += (p.power * P * 0.5 - p.inner.rotation.x) * 0.075;
        p.outer.position.set(p.last.x + p.exPos.x * ex * k, p.last.y + p.exPos.y * ex * k, 0);
        p.outer.rotation.set(p.lastRot.x, p.lastRot.y, p.lastRot.z + p.exRot * ex);
        p.mat.opacity = ease.inOut(Math.min(1, 1 - S.explosion));
      }
      // The letter cluster fully scatters after scrolling one screen height (original a8: .5 × scrollY/innerHeight×2, follow .25)
      S.textEx += (ease.inOut(Math.min(1, scrollY / H)) - S.textEx) * 0.25;
      document.documentElement.style.setProperty("--ps-text-ex", S.textEx.toFixed(4));
      mainEl?.classList.toggle("is-past", scrollY > 30);
    }
    renderer.render(scene, camera);
  };
  // Shaders are compiled in advance when the world is built, so the first motion doesn’t freeze
  renderer.compile(scene, camera);
  gsap.ticker.add(tick);

  // Building line art — the original drew an outline SVG of a facility building (multi-story apartment block) as WebGL lines. We draw our building on the same panel (2560×1600) in two-point perspective and
  // While the section is on screen, a line is drawn tied to scroll (first 60%), then fill and shadow come in at the end
  (() => {
    const svg = document.querySelector("[data-building]");
    if (!svg) return;
    const L = [], F = [], SH = [];
    const ln = (d) => L.push(d);
    const CX = 760, TOP = 260, BOT = 1250, VR = [4800, 900], VL = [-1800, 880], FAR_R = 2380, FAR_L = 420, FLOORS = 7, COLS_R = 18, COLS_L = 4;
    const onR = (x, y) => y + ((x - CX) * (VR[1] - y)) / (VR[0] - CX);
    const onL = (x, y) => y + ((CX - x) * (VL[1] - y)) / (CX - VL[0]);
    const f = (n) => Math.round(n);
    for (let k = 0; k <= FLOORS; k++) {
      const y = TOP + ((BOT - TOP) * k) / FLOORS;
      ln(`M${CX} ${f(y)}L${FAR_R} ${f(onR(FAR_R, y))}`);
      ln(`M${CX} ${f(y)}L${FAR_L} ${f(onL(FAR_L, y))}`);
    }
    for (let i = 0; i <= COLS_R; i++) { const x = CX + ((FAR_R - CX) * i) / COLS_R; ln(`M${f(x)} ${f(onR(x, TOP - 40))}L${f(x)} ${f(onR(x, BOT))}`); }
    for (let i = 1; i <= COLS_L; i++) { const x = CX - ((CX - FAR_L) * i) / COLS_L; ln(`M${f(x)} ${f(onL(x, TOP - 40))}L${f(x)} ${f(onL(x, BOT))}`); }
    ln(`M${CX} ${TOP - 40}L${FAR_R} ${f(onR(FAR_R, TOP - 40))}M${CX} ${TOP - 40}L${FAR_L} ${f(onL(FAR_L, TOP - 40))}`);
    // Windows — a small square inside each cell on every floor
    for (let k = 1; k < FLOORS; k++) for (let i = 0; i < COLS_R; i += 2) {
      const x0 = CX + ((FAR_R - CX) * (i + 0.25)) / COLS_R, x1 = CX + ((FAR_R - CX) * (i + 0.75)) / COLS_R;
      const y0 = TOP + ((BOT - TOP) * (k + 0.25)) / FLOORS, y1 = TOP + ((BOT - TOP) * (k + 0.8)) / FLOORS;
      const d = `M${f(x0)} ${f(onR(x0, y0))}L${f(x1)} ${f(onR(x1, y0))}L${f(x1)} ${f(onR(x1, y1))}L${f(x0)} ${f(onR(x0, y1))}Z`;
      ln(d); F.push(d);
    }
    // Ground · road · trees
    ln(`M0 ${BOT + 30}L2560 ${BOT + 10}M0 ${BOT + 160}L2560 ${BOT + 60}`);
    ln("M2440 1260V1080M2440 1080a70 110 0 1 1 0.1 0M220 1270V1110M220 1110a60 95 0 1 1 0.1 0");
    SH.push(`M${CX} ${TOP}L${FAR_L} ${f(onL(FAR_L, TOP))}L${FAR_L} ${f(onL(FAR_L, BOT))}L${CX} ${BOT}Z`);
    const ns = "http://www.w3.org/2000/svg";
    const add = (d, cls) => { const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); p.setAttribute("class", cls); if (cls === "ln") p.setAttribute("pathLength", "1"); svg.append(p); return p; };
    const sh = SH.map((d) => add(d, "sh"));
    const fl = F.map((d) => add(d, "fl"));
    const lines = L.map((d) => add(d, "ln"));
    if (reduce) { gsap.set(sh, { opacity: 0.16 }); gsap.set(fl, { opacity: 0.12 }); return; }
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg.closest(".ps-biz__inner"), start: "top 90%", end: "center center", scrub: 1 } });
      tl.to(lines, { strokeDashoffset: 0, ease: "power2.inOut", duration: 0.6, stagger: 0.012 }, 0)
        .to(sh, { opacity: 0.16, duration: 0.25, ease: "power2.inOut" }, 0.6)
        .to(fl, { opacity: 0.12, duration: 0.25, ease: "power2.inOut", stagger: 0.01 }, 0.65);
    });
  })();

  // Big text — original a6: each letter’s plate lying on the x axis stands up with .075s stagger at 1.75s back.out, and the pieces inside gather at .8s expo.out
  addEventListener("ps:fv", () => {
    const chars = [...document.querySelectorAll("[data-fv-title] > span, [data-fv-sub] > span")];
    if (reduce || !chars.length) return;
    chars.forEach((c, t) => {
      const delay = 0.075 * t + 1.5;
      gsap.fromTo(c, { rotationX: -90, transformOrigin: "50% 100%" }, { rotationX: 0, duration: 1.75, ease: "back.out", delay, onStart: () => { c.style.visibility = "visible"; } });
      gsap.fromTo(c, { x: t % 2 ? -20 : 20, yPercent: 30, rotation: t % 2 ? 45 : -45, scale: 0 }, { x: 0, yPercent: 0, rotation: 0, scale: 1, duration: 0.8, ease: "expo.out", delay });
    });
  });

  window.PsMV = {
    // Loading — logo cluster stands above the wordmark
    showLogo() {
      S.logo = true;
      logoSet.forEach((p, k) => {
        p.outer.visible = true;
        p.outer.position.copy(p.logoPos).multiplyScalar(1 / world.scale.x);
        p.outer.rotation.set(0, 0, p.logoRot);
        p.outer.scale.set(0, 0, 0);
        gsap.to(p.outer.scale, { x: 0.34, y: 0.34, z: 0.34, duration: 0.8, delay: 0.02 * k, ease: "back.out" });
      });
    },
    // Hero — logo pieces burst in place, the rest burst from near the center into position
    showFv() {
      if (reduce) {
        pieces.forEach((p) => { p.outer.visible = true; p.outer.position.copy(p.last); p.outer.rotation.copy(p.lastRot); p.outer.scale.set(0.85, 0.85, 0.85); p.ready = true; p.sensitivity = 0; });
        S.fv = true;
        return;
      }
      pieces.forEach((p) => burst(p));
      field.scale.set(1, 1, 1);
      gsap.to(field.scale, { x: 0.95, y: 0.95, z: 0.95, duration: 3, ease: "sine.inOut" });
      S.fv = true;
    },
  };
})();
