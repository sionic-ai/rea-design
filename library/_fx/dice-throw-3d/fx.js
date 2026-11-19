(() => {
  // A 20-sided die (icosahedron) turns slowly inside its cell, then when pressed or dragged and thrown it leaves the cell and flies around the screen —
  // Per frame gravity .9px, horizontal velocity ×.995, bounces off walls at −.6× and off the floor at −.55× · horizontal ×.78 damping. When it stops, after .48s it emits fx:land (face number) and returns to its slot
  const PHI = (1 + Math.sqrt(5)) / 2, TILT = Math.atan(1 / PHI), FRAME = 1000 / 60;

  const cssColor = (el, name, fallback) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name}, ${fallback})`;
    probe.style.display = "none";
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };

  kfFx.register("dice-throw-3d", (el, { options, reduce }) => {
    if (!window.THREE) return;
    const T = window.THREE;
    const size = +(options.size || 146);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-dice__canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.width = canvas.style.height = `${size}px`;
    el.append(canvas);

    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(size, size, false);
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 3);
    const geo = new T.IcosahedronGeometry(1, 0);
    geo.clearGroups();
    const faces = geo.attributes.position.count / 3, uv = geo.attributes.uv;
    for (let i = 0; i < faces; i++) { geo.addGroup(3 * i, 3, i); uv.setXY(3 * i, 0, 0); uv.setXY(3 * i + 1, 1, 0); uv.setXY(3 * i + 2, 0.5, 1); }
    uv.needsUpdate = true;
    const faceA = cssColor(el, "--fx-dice-a", "var(--kf-surface)"), faceB = cssColor(el, "--fx-dice-b", "var(--kf-raised)"), ink = cssColor(el, "--fx-dice-ink", "var(--kf-ink)");
    const font = getComputedStyle(el).getPropertyValue("--kf-font-display").trim() || "serif";
    const mats = [];
    for (let n = 1; n <= faces; n++) {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d");
      g.fillStyle = n % 2 === 0 ? faceB : faceA;
      g.fillRect(0, 0, 256, 256);
      g.fillStyle = ink;
      g.font = `italic 400 112px ${font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(String(n), 128, 170);
      const tex = new T.CanvasTexture(c);
      tex.colorSpace = T.SRGBColorSpace;
      mats.push(new T.MeshBasicMaterial({ map: tex, toneMapped: false }));
    }
    const mesh = new T.Mesh(geo, mats);
    mesh.rotation.x = TILT;
    scene.add(mesh);
    const draw = () => renderer.render(scene, camera);
    draw();

    const clock = new T.Clock();
    let state = "idle", seen = false, idleRaf = 0, flyRaf = 0, settleT = 0;
    let x = 0, y = 0, vx = 0, vy = 0, wx = 0, wy = 0, wz = 0, lastX = 0, lastY = 0, lastT = 0, downX = 0, downY = 0, pid = null, moved = false;
    const layer = document.createElement("div");
    layer.className = "fx-dice__fly";

    const spin = () => {
      if (state !== "idle" || !seen) { idleRaf = 0; return; }
      const dt = Math.min(0.05, clock.getDelta()), k = Math.min(1, 6 * dt);
      mesh.rotation.x += (TILT - mesh.rotation.x) * k;
      mesh.rotation.y += (0 - mesh.rotation.y) * k;
      mesh.rotation.z += 0.55 * dt;
      draw();
      idleRaf = requestAnimationFrame(spin);
    };
    const startSpin = () => { if (!idleRaf && !reduce) { clock.getDelta(); idleRaf = requestAnimationFrame(spin); } };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) startSpin(); });
    io.observe(el);

    const lift = () => {
      const r = canvas.getBoundingClientRect();
      x = r.left; y = r.top;
      layer.style.left = `${x}px`; layer.style.top = `${y}px`;
      layer.append(canvas);
      document.body.append(layer);
    };
    const put = () => { layer.style.left = `${x}px`; layer.style.top = `${y}px`; };
    const home = () => {
      const r = el.getBoundingClientRect();
      const tx = r.left + (r.width - size) / 2, ty = r.top + (r.height - size) / 2;
      gsap.to(layer, { left: tx, top: ty, duration: reduce ? 0 : 0.7, ease: "power3.inOut", onComplete: () => {
        el.append(canvas);
        layer.remove();
        state = "idle";
        startSpin();
      } });
    };
    const face = () => {
      const v = new T.Vector3(0, 0, 1), best = { n: 1, d: -2 }, p = geo.attributes.position, a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3();
      for (let i = 0; i < faces; i++) {
        a.fromBufferAttribute(p, 3 * i); b.fromBufferAttribute(p, 3 * i + 1); c.fromBufferAttribute(p, 3 * i + 2);
        const nrm = b.clone().sub(a).cross(c.clone().sub(a)).normalize().applyQuaternion(mesh.quaternion);
        if (nrm.dot(v) > best.d) best.d = nrm.dot(v), best.n = i + 1;
      }
      return best.n;
    };
    const settle = () => {
      cancelAnimationFrame(flyRaf);
      state = "settling";
      settleT = setTimeout(() => { el.dispatchEvent(new CustomEvent("fx:land", { bubbles: true, detail: { face: face() } })); home(); }, 480);
    };
    const fly = () => {
      state = "flying";
      if (Math.abs(vx) < 4) vx = (Math.random() - 0.5) * 22;
      if (vy > -2) vy = -8 - 12 * Math.random();
      wy += 0.018 * vy + (Math.random() - 0.5) * 0.35;
      wx += -(0.018 * vx) + (Math.random() - 0.5) * 0.35;
      wz += 0.014 * vx + (Math.random() - 0.5) * 0.28;
      let rest = 0, frames = 0;
      clock.getDelta();
      const step = () => {
        if (state !== "flying") return;
        const dt = Math.min(0.05, Math.max(1 / 120, clock.getDelta()));
        frames++;
        vy += 0.9; vx *= 0.995; x += vx; y += vy;
        wy *= 0.985; wx *= 0.985; wz *= 0.985;
        mesh.rotation.x += wy * dt * 18; mesh.rotation.y += wx * dt * 18; mesh.rotation.z += wz * dt * 18;
        draw();
        const W = innerWidth, H = innerHeight;
        if (x < 0) { x = 0; vx = -0.6 * vx; wx *= -0.85; }
        if (x + size > W) { x = W - size; vx = -0.6 * vx; wx *= -0.85; }
        if (y < 0) { y = 0; vy = -0.6 * vy; }
        if (y + size > H) { y = H - size; vy = -0.55 * vy; vx *= 0.78; wy *= 0.82; wz *= 0.82; }
        put();
        const floor = y + size >= H - 0.75 && Math.abs(vx) < 0.5 && Math.abs(vy) < 1;
        rest = floor ? rest + 1 : 0;
        if (rest > 6 || frames > 720) return settle();
        flyRaf = requestAnimationFrame(step);
      };
      flyRaf = requestAnimationFrame(step);
    };

    const down = (e) => {
      if (state !== "idle" || e.button > 0) return;
      pid = e.pointerId; moved = false;
      downX = lastX = e.clientX; downY = lastY = e.clientY; lastT = e.timeStamp;
      vx = vy = wx = wy = wz = 0;
      addEventListener("pointermove", drag);
      addEventListener("pointerup", up);
      addEventListener("pointercancel", up);
    };
    const drag = (e) => {
      if (e.pointerId !== pid) return;
      const slop = e.pointerType === "touch" ? 20 : 12;
      if (!moved) {
        if (Math.hypot(e.clientX - downX, e.clientY - downY) <= slop) return;
        moved = true; state = "dragging"; lift();
      }
      const dt = Math.max(1, e.timeStamp - lastT);
      vx = Math.max(-35, Math.min(35, 0.35 * vx + 0.65 * ((e.clientX - lastX) / dt) * FRAME));
      vy = Math.max(-35, Math.min(35, 0.35 * vy + 0.65 * ((e.clientY - lastY) / dt) * FRAME));
      lastX = e.clientX; lastY = e.clientY; lastT = e.timeStamp;
      x = e.clientX - size / 2; y = e.clientY - size / 2;
      put();
    };
    const up = (e) => {
      if (e.pointerId !== pid) return;
      removeEventListener("pointermove", drag);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      pid = null;
      if (reduce) return;
      if (!moved) { lift(); vx = (Math.random() - 0.5) * 28; vy = -10 - 14 * Math.random(); wy = (Math.random() - 0.5) * 0.55; wx = (Math.random() - 0.5) * 0.55; wz = (Math.random() - 0.5) * 0.45; }
      else { vx *= 1.15; vy *= 1.15; }
      fly();
    };
    const key = (e) => { if ((e.key === "Enter" || e.key === " ") && state === "idle" && !reduce) { e.preventDefault(); lift(); vx = (Math.random() - 0.5) * 28; vy = -10 - 14 * Math.random(); fly(); } };
    el.addEventListener("pointerdown", down);
    el.addEventListener("keydown", key);
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;

    return () => {
      io.disconnect();
      cancelAnimationFrame(idleRaf); cancelAnimationFrame(flyRaf); clearTimeout(settleT);
      removeEventListener("pointermove", drag); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      el.removeEventListener("pointerdown", down); el.removeEventListener("keydown", key);
      gsap.killTweensOf(layer);
      layer.remove(); canvas.remove();
      mats.forEach((m) => { m.map.dispose(); m.dispose(); });
      geo.dispose(); renderer.dispose();
    };
  });
})();
