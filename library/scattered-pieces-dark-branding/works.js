// Work list — 12 three cards. Overlapping stack → wave (sin) → vertical list on wheel, with inertia · tilt · snapping. Original settings as is
(() => {
  const T = window.THREE;
  const canvas = document.querySelector(".w-gl");
  if (!T || !canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { spreadDur: 1.1, planeW: 20, planeH: 20.5, spread: 1.15, waveDelay: 0.3, waveDur: 1.2, waveStagger: 0.05, waveScale: 0.6, amp: 9.1, freq: 1.1, spacing: 6.85, waveRot: 10, listDelay: 0.2, listDur: 1.1, listStagger: 0.04, listW: 28.5, listGap: 1.5, input: 4e-4, friction: 0.95, vMax: 1, tiltMax: 22, tiltMul: 140, tiltDecay: 0.09, snapDur: 1.45, snapV: 0.0035, centerMin: 0.5, centerR: 2.3, hoverZoom: 1.04 };
  const items = [...document.querySelectorAll("[data-list] li")];
  const nameEl = document.querySelector("[data-name]"), yearEl = document.querySelector("[data-year]"), box = document.querySelector("[data-label-box]"), hint = document.querySelector("[data-hint]");
  const color = (v) => { const p = document.createElement("i"); p.style.color = v; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
  const TONES = { lime: "var(--kf-accent)", green: "color-mix(in oklab, var(--kf-accent-soft) 45%, var(--kf-bg))", ink: "var(--kf-raised)", orange: "oklch(from var(--kf-accent) calc(l * .75) calc(c * 1.2) calc(h - 80))", sky: "oklch(from var(--kf-accent) calc(l * .95) calc(c * .5) calc(h + 110))", pink: "oklch(from var(--kf-accent) calc(l * .8) calc(c * 1.3) calc(h - 150))", silver: "var(--kf-ink-soft)" };

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 100);
  cam.position.z = 5;
  let visH = 1, visW = 1;
  const vw = (x) => (x / 100) * visW;
  const size = () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); visH = 2 * Math.tan((25 * Math.PI) / 180) * 5; visW = visH * cam.aspect; };
  size();

  // Card front — our placeholder cover (color panel + center symbol + lines). Stands in for the original Work cover
  const ink = color("var(--kf-bg)");
  const cover = (tone, i) => {
    const c = document.createElement("canvas"); c.width = 400; c.height = 410;
    const g = c.getContext("2d");
    g.fillStyle = color(TONES[tone] || TONES.ink); g.fillRect(0, 0, 400, 410);
    g.fillStyle = tone === "ink" ? color("var(--kf-ink)") : ink;
    g.globalAlpha = 0.9;
    const k = i % 3;
    if (k === 0) { g.beginPath(); g.arc(200, 205, 70, 0, Math.PI * 2); g.fill(); }
    else if (k === 1) { g.fillRect(140, 150, 120, 110); }
    else { g.beginPath(); g.moveTo(200, 120); g.lineTo(290, 280); g.lineTo(110, 280); g.closePath(); g.fill(); }
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  };
  const geo = new T.PlaneGeometry(1, 1);
  const cards = items.map((li, i) => {
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({ map: cover(li.dataset.tone, i), transparent: true }));
    m.userData = { i, s: 1 };
    scene.add(m);
    return m;
  });
  const n = cards.length;
  const baseW = () => vw(C.planeW), baseH = () => vw(C.planeH);
  const setScale = (m, s) => { m.userData.s = s; m.scale.set(baseW() * s, baseH() * s, 1); };

  // Wave position — x evenly spaced, y is amplitude × sin, tilt is tangent angle × (10/45)
  const wave = (i) => {
    const l = i / (n - 1), r = (11 * vw(C.spacing)) / Math.max(11, n - 1);
    return { x: i * r - ((n - 1) * r) / 2, y: vw(C.amp) * Math.sin(l * Math.PI * 2 * C.freq), rot: Math.atan(vw(C.amp) * ((2 * Math.PI * C.freq) / (n - 1)) * Math.cos(l * Math.PI * 2 * C.freq)) * (C.waveRot / 45) };
  };
  let mode = "stack", pos = 0, vel = 0, tilt = 0, snapTween = null, lastInput = 0;
  cards.forEach((m, i) => { setScale(m, C.waveScale); m.position.set((i - n / 2) * vw(C.spread) * 0.1, (n / 2 - i) * vw(C.spread) * 0.1, 0.01 * i); m.rotation.z = (i - n / 2) * 0.02; });

  // The stacked pile first fans out one card at a time (1.1s, 5.7vw to the upper right) — then the wave
  const spread = () => cards.forEach((m, i) => gsap.to(m.position, { x: vw(5.7) + (i - n / 2) * vw(C.spread), y: -vw(-5.7) - (i - n / 2) * vw(C.spread), duration: reduce ? 0 : C.spreadDur, ease: "power3.inOut" }));
  const toWave = () => {
    mode = "wave";
    cards.forEach((m, i) => {
      const w = wave(i);
      gsap.to(m.position, { x: w.x, y: w.y, z: 0.001 * i, duration: reduce ? 0 : C.waveDur, delay: reduce ? 0 : C.waveDelay + i * C.waveStagger, ease: "power3.inOut" });
      gsap.to(m.rotation, { z: w.rot, duration: reduce ? 0 : C.waveDur, delay: reduce ? 0 : C.waveDelay + i * C.waveStagger, ease: "power3.inOut" });
    });
  };
  const listW = () => (innerWidth <= 640 ? 57.7 : C.listW) / C.planeW;
  const slot = () => baseH() * listW() * 0.62 + vw(C.listGap);
  const listPlace = (m, d) => {
    const ad = Math.abs(d), s = listW() * Math.max(C.centerMin, 1 - (ad / C.centerR) * (1 - C.centerMin));
    return { y: -d * slot(), s };
  };
  const toList = () => {
    if (mode === "list" || mode === "toList") return;
    mode = "toList";
    hint && gsap.to(hint, { opacity: 0, duration: 0.4 });
    cards.forEach((m, i) => {
      const p = listPlace(m, i - pos);
      const o = { s: m.userData.s };
      gsap.to(m.position, { x: 0, y: p.y, duration: C.listDur, delay: C.listDelay + i * C.listStagger, ease: "power3.inOut" });
      gsap.to(m.rotation, { z: 0, duration: C.listDur, delay: C.listDelay + i * C.listStagger, ease: "power3.inOut" });
      gsap.to(o, { s: p.s, duration: C.listDur, delay: C.listDelay + i * C.listStagger, ease: "power3.inOut", onUpdate: () => setScale(m, o.s) });
    });
    gsap.delayedCall(C.listDelay + n * C.listStagger + C.listDur, () => { mode = "list"; label(); });
  };
  const label = () => {
    const i = Math.round(Math.max(0, Math.min(n - 1, pos)));
    nameEl.textContent = items[i].dataset.name; yearEl.textContent = items[i].dataset.year;
    box.classList.toggle("on", mode === "list" && Math.abs(vel) < 0.02);
  };
  const snap = () => {
    const to = Math.max(0, Math.min(n - 1, Math.round(pos)));
    snapTween = gsap.to({ v: pos }, { v: to, duration: C.snapDur, ease: "expo.inOut", onUpdate() { pos = this.targets()[0].v; }, onComplete: () => { snapTween = null; label(); } });
  };
  const input = (dy) => {
    if (mode === "stack" || mode === "wave") { if (dy > 0) toList(); return; }
    if (mode !== "list") return;
    snapTween?.kill(); snapTween = null;
    const a = Math.sign(dy) * Math.min(Math.abs(dy), 120) * C.input * 10;
    vel = Math.max(-C.vMax * 0.1, Math.min(C.vMax * 0.1, vel + a));
    lastInput = performance.now();
  };
  addEventListener("wheel", (e) => input(e.deltaY), { passive: true });
  let ty = 0;
  addEventListener("touchstart", (e) => (ty = e.touches[0].clientY), { passive: true });
  addEventListener("touchmove", (e) => { const y = e.touches[0].clientY; input((ty - y) * 3); ty = y; }, { passive: true });
  addEventListener("keydown", (e) => { if (e.key === "ArrowDown") input(120); if (e.key === "ArrowUp") input(-120); });

  // Hovering the center card scales it 1.04× (1.15s expo.out)
  const ray = new T.Raycaster(), ptr = new T.Vector2(9, 9);
  let hovered = null;
  addEventListener("pointermove", (e) => { ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });

  const tick = () => {
    requestAnimationFrame(tick);
    if (mode === "list") {
      if (!snapTween) {
        pos += vel; vel *= C.friction;
        if (pos < 0) { pos = 0; vel = 0; } if (pos > n - 1) { pos = n - 1; vel = 0; }
        if (Math.abs(vel) < C.snapV && performance.now() - lastInput > 120 && Math.abs(pos - Math.round(pos)) > 0.001) snap();
      }
      const want = Math.max(-C.tiltMax, Math.min(C.tiltMax, vel * C.tiltMul));
      tilt += (want - tilt) * C.tiltDecay;
      cards.forEach((m, i) => {
        const p = listPlace(m, i - pos);
        m.position.y = p.y; m.position.x = 0; m.rotation.x = (tilt * Math.PI) / 180;
        const zoom = m === hovered ? C.hoverZoom : 1;
        setScale(m, p.s * (m.userData.z ?? 1)); m.userData.zt = zoom;
        m.userData.z = (m.userData.z ?? 1) + (zoom - (m.userData.z ?? 1)) * 0.08;
      });
      ray.setFromCamera(ptr, cam);
      const hit = ray.intersectObjects(cards)[0]?.object || null;
      hovered = hit && Math.abs(hit.userData.i - pos) < 0.5 ? hit : null;
      canvas.style.cursor = hovered ? "pointer" : "";
      label();
    }
    renderer.render(scene, cam);
  };
  canvas.addEventListener("click", () => { if (hovered) location.href = "index.html#work"; });
  addEventListener("resize", () => { size(); cards.forEach((m) => setScale(m, m.userData.s)); if (mode === "wave") cards.forEach((m, i) => { const w = wave(i); m.position.x = w.x; m.position.y = w.y; }); });
  renderer.compile(scene, cam);
  tick();
  if (reduce) { mode = "list"; label(); } else {
    // In the original, once the ripple has spread it settles into a vertical list without any touch
    gsap.delayedCall(0.2, spread); gsap.delayedCall(0.2 + C.spreadDur, toWave);
    gsap.delayedCall(0.2 + C.spreadDur + C.waveDelay + C.waveDur + (n - 1) * C.waveStagger, toList);
  }
})();
