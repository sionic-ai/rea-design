// Stand a dark metal plate (three) inside the element and scatter thousands of sand grains — the plate vibrates in mode Ψ(m, n, ±), and where plate acceleration exceeds gravity (|Ψ|·γ > Only the grains of 1) pop out
// Walks randomly by the overflow amount, then is pushed toward shrinking amplitude and gathers at the node lines. When given another mode, the pattern mixes and regathers in 1.4s.
(() => {
  kfFx.register("brand-sand-plate", (el, { options, reduce }) => {
    if (!window.THREE) return;
    const T = THREE;
    const num = (k, d) => +(options[k] ?? d);
    let mode = { m: num("m", 2) || 2, n: num("n", 3) || 3, sign: +(options.sign ?? -1) < 0 ? -1 : 1 };
    const disc = options.shape === "disc";
    const count = Math.max(500, num("grains", innerWidth < 768 ? 5000 : 12000) || 12000);
    const gamma = num("gamma", 4.5), step0 = num("step", 0.0045), slope = num("slope", 0.15), morph = num("morph", 1.4), tilt = num("tilt", 0.55);
    const color = (name) => { const i = document.createElement("i"); i.style.color = `var(${name})`; el.appendChild(i); const c = getComputedStyle(i).color; i.remove();
      const cv = document.createElement("canvas"); cv.width = cv.height = 1; const x = cv.getContext("2d"); x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data;
      return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.LinearSRGBColorSpace); };
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0, 0);
    const cv = renderer.domElement;
    cv.className = "fx-sand-canvas";
    el.appendChild(cv);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, 0.1, 40);
    camera.up.set(0, 0, 1);
    camera.position.set(0, -2.6 * tilt, 3.6 - 1.2 * tilt);
    camera.lookAt(0, 0, 0);
    const field = (md, x, y) => {
      if (disc) { const r = Math.hypot(x, y), th = Math.atan2(y, x); return Math.cos(md.m * th) * Math.cos(Math.PI * (md.n + 0.5 + md.m * 0.32) * r); }
      const u = (x + 1) / 2, v = (y + 1) / 2;
      return 0.5 * (Math.cos(md.m * Math.PI * u) * Math.cos(md.n * Math.PI * v) + md.sign * Math.cos(md.n * Math.PI * u) * Math.cos(md.m * Math.PI * v));
    };
    let prev = mode, mix = 1;
    const psi = (x, y) => (mix >= 1 ? field(mode, x, y) : field(prev, x, y) * (1 - mix) + field(mode, x, y) * mix);
    const plateMat = new T.MeshBasicMaterial({ color: color("--kf-raised").lerp(color("--kf-dim"), 0.18) });
    const plate = disc ? new T.Mesh(new T.CircleGeometry(1, 96), plateMat) : new T.Mesh(new T.PlaneGeometry(2, 2), plateMat);
    scene.add(plate);
    const edge = disc ? Array.from({ length: 96 }, (_, i) => new T.Vector3(Math.cos((i / 96) * 6.2832), Math.sin((i / 96) * 6.2832), 0.001))
      : [new T.Vector3(-1, -1, 0.001), new T.Vector3(1, -1, 0.001), new T.Vector3(1, 1, 0.001), new T.Vector3(-1, 1, 0.001)];
    const rim = new T.LineLoop(new T.BufferGeometry().setFromPoints(edge), new T.LineBasicMaterial({ color: color("--kf-line") }));
    scene.add(rim);
    const pos = new Float32Array(count * 3);
    const spawn = (i) => { let x, y; do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; } while (disc && x * x + y * y > 1); pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0; };
    for (let i = 0; i < count; i++) spawn(i);
    const geo = new T.BufferGeometry(), attr = new T.BufferAttribute(pos, 3);
    attr.setUsage(T.DynamicDrawUsage);
    geo.setAttribute("position", attr);
    const sand = new T.Points(geo, new T.PointsMaterial({ color: color("--kf-ink").lerp(color("--kf-accent"), 0.12), size: 2, sizeAttenuation: false, transparent: true, opacity: 0.92, depthWrite: false }));
    sand.frustumCulled = false;
    scene.add(sand);
    const walk = (dt) => {
      const e = 0.012;
      for (let i = 0; i < count; i++) {
        const j = i * 3; let x = pos[j], y = pos[j + 1];
        const a = Math.abs(psi(x, y)) * gamma;
        if (a > 1) {
          const over = Math.min(3, a - 1), ang = Math.random() * 6.2832, s = step0 * over * (0.5 + Math.random()) * (reduce ? 0.45 : 1);
          const gx = Math.abs(psi(x + e, y)) - Math.abs(psi(x - e, y)), gy = Math.abs(psi(x, y + e)) - Math.abs(psi(x, y - e)), gl = Math.hypot(gx, gy) || 1;
          x += Math.cos(ang) * s - (gx / gl) * s * slope * 6;
          y += Math.sin(ang) * s - (gy / gl) * s * slope * 6;
          pos[j + 2] = Math.min(0.02, pos[j + 2] + 0.12 * over * dt);
        } else pos[j + 2] = Math.max(0, pos[j + 2] - dt * 0.12);
        if (disc ? x * x + y * y > 1 : Math.abs(x) > 1 || Math.abs(y) > 1) { spawn(i); continue; }
        pos[j] = x; pos[j + 1] = y;
      }
      attr.needsUpdate = true;
    };
    let raf = 0, last = 0, visible = true;
    const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); sand.material.size = Math.max(1.4, 2.1 * Math.min(1.5, devicePixelRatio || 1) * h / 700); };
    const frame = (now) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(1 / 30, Math.max(0.001, (now - (last || now)) / 1000)); last = now;
      if (mix < 1) mix = Math.min(1, mix + dt / Math.max(0.001, morph));
      walk(dt);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } });
    io.observe(el);
    const onMode = (e) => { const d = e.detail || {}; prev = mode; mode = { m: +d.m || mode.m, n: +d.n || mode.n, sign: d.sign < 0 ? -1 : d.sign > 0 ? 1 : mode.sign }; mix = reduce ? 1 : 0; };
    const onSprinkle = () => { for (let i = 0; i < count; i++) spawn(i); };
    el.addEventListener("fx:mode", onMode);
    el.addEventListener("fx:sprinkle", onSprinkle);
    if (reduce) for (let k = 0; k < 240; k++) walk(1 / 30);
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); el.removeEventListener("fx:mode", onMode); el.removeEventListener("fx:sprinkle", onSprinkle); renderer.dispose(); geo.dispose(); rim.geometry.dispose(); cv.remove(); };
  });
})();
