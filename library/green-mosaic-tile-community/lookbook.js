/* Gallery: an endless space built with three. The space is split into chunks, and each chunk scatters 5 stamps from a fixed seed,
   The camera moves by drag (throw with inertia 320) · wheel (forward and back) · W A S D · arrow keys · Q E. Distant stamps blur into fog, and pressing one opens it large in the center. */
(() => {
  const { E } = CB;
  let kill = null;

  function gallery(root) {
    const T3 = window.THREE, cv = root.querySelector(".g3-cv"), stage = root.querySelector(".g3-stage"), lb = root.querySelector(".g3-lb");
    if (!T3) return () => {};
    const r = new T3.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T3.Scene();
    const bg = new T3.Color().setRGB(...CB.rgb("--kf-bg"), T3.SRGBColorSpace);
    scene.fog = new T3.Fog(bg, 14, 46);
    const cam = new T3.PerspectiveCamera(50, 1, 0.1, 80);
    const size = () => { const w = stage.clientWidth, h = stage.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size();
    const ro = new ResizeObserver(size); ro.observe(stage);

    // Six stamp drawings — white perforated border + Skin-colored photo slot
    const tones = [["--site-sage", "--kf-accent-text"], ["--site-tan", "--site-moss"], ["--kf-accent-soft", "--kf-accent-text"], ["--site-moss", "--kf-contrast-bg"], ["--site-paper", "--site-sage"], ["--kf-accent", "--site-deep"]];
    const rgb = (v) => { const [a, b, c] = CB.rgb(v); return `rgb(${a * 255 | 0},${b * 255 | 0},${c * 255 | 0})`; };
    const texs = tones.map(([a, b], i) => {
      const c = document.createElement("canvas"); c.width = 300; c.height = 220; const g = c.getContext("2d");
      g.fillStyle = rgb("--kf-raised"); g.fillRect(0, 0, 300, 220);
      g.globalCompositeOperation = "destination-out";
      for (let x = 0; x <= 300; x += 15) { g.beginPath(); g.arc(x, 0, 5, 0, 7); g.arc(x, 220, 5, 0, 7); g.fill(); }
      for (let y = 0; y <= 220; y += 15) { g.beginPath(); g.arc(0, y, 5, 0, 7); g.arc(300, y, 5, 0, 7); g.fill(); }
      g.globalCompositeOperation = "source-over";
      const gr = g.createLinearGradient(0, 0, 300, 220); gr.addColorStop(0, rgb(a)); gr.addColorStop(1, rgb(b));
      g.fillStyle = gr; g.fillRect(16, 16, 268, 188);
      g.fillStyle = rgb("--kf-raised"); g.globalAlpha = 0.7; g.font = `500 12px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono")}`;
      g.fillText(`Event photo ${String(i + 1).padStart(2, "0")} · Horizontal`, 26, 194);
      const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t;
    });
    const mats = texs.map((t) => new T3.MeshBasicMaterial({ map: t, transparent: true, side: T3.DoubleSide }));
    const geo = new T3.PlaneGeometry(1.36, 1);
    const C = 8.75, chunks = new Map();
    const rnd = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const make = (cx, cy, cz) => {
      const g = new T3.Group(), rand = rnd(Math.abs(cx * 73856093 ^ cy * 19349663 ^ cz * 83492791) % 2147483646 + 1);
      for (let k = 0; k < 5; k++) {
        const m = new T3.Mesh(geo, mats[(rand() * mats.length) | 0]);
        m.position.set((cx + rand()) * C, (cy + rand()) * C * 0.7, (cz + rand()) * C);
        const s = 1.4 + rand() * 1.6; m.scale.setScalar(s);
        m.userData.n = Math.abs(cx * 7 + cy * 13 + cz * 31 + k) % 999;
        g.add(m);
      }
      scene.add(g); return g;
    };
    const cam0 = new T3.Vector3(0, 0, 10), vel = new T3.Vector3(), tgt = new T3.Vector3();
    cam.position.copy(cam0);
    const sync = () => {
      const bx = Math.floor(cam.position.x / C), by = Math.floor(cam.position.y / (C * 0.7)), bz = Math.floor(cam.position.z / C), keep = new Set();
      for (let x = bx - 2; x <= bx + 2; x++) for (let y = by - 1; y <= by + 1; y++) for (let z = bz - 5; z <= bz; z++) {
        const k = `${x},${y},${z}`; keep.add(k); if (!chunks.has(k)) chunks.set(k, make(x, y, z));
      }
      for (const [k, g] of chunks) if (!keep.has(k)) { scene.remove(g); chunks.delete(k); }
    };
    sync();
    r.compile(scene, cam);

    // Drag — throw using the release velocity
    let drag = null, moved = 0;
    const down = (e) => { if (lb.classList.contains("is-open")) return; drag = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 }; moved = 0; stage.setPointerCapture(e.pointerId); };
    const move = (e) => {
      if (!drag) return;
      const now = performance.now(), dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = Math.max(1, now - drag.t);
      moved += Math.abs(dx) + Math.abs(dy);
      const k = 0.02;
      tgt.x -= dx * k; tgt.y += dy * k;
      drag.vx = (-dx * k) / dt * 16; drag.vy = (dy * k) / dt * 16;
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    };
    const up = (e) => {
      if (!drag) return;
      vel.x = drag.vx * (320 / 100); vel.y = drag.vy * (320 / 100);
      drag = null;
      if (moved < 6) pick(e);
    };
    const wheel = (e) => { e.preventDefault(); tgt.z += e.deltaY * 0.01; };
    const keys = new Set();
    const kd = (e) => keys.add(e.key.toLowerCase()), ku = (e) => keys.delete(e.key.toLowerCase());
    stage.addEventListener("pointerdown", down); stage.addEventListener("pointermove", move); stage.addEventListener("pointerup", up);
    stage.addEventListener("wheel", wheel, { passive: false });
    addEventListener("keydown", kd); addEventListener("keyup", ku);

    // Press and that stamp opens to the center
    const ray = new T3.Raycaster(), nd = new T3.Vector2();
    const frame = lb.querySelector(".g3-lb__frame");
    function pick(e) {
      const b = cv.getBoundingClientRect();
      nd.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(nd, cam);
      const hit = ray.intersectObjects([...chunks.values()].flatMap((g) => g.children))[0];
      if (!hit) return;
      lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
      const fb = frame.getBoundingClientRect();
      gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(frame, { x: e.clientX - (fb.left + fb.width / 2), y: e.clientY - (fb.top + fb.height / 2), scale: 0.2, rotation: -6 }, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.9, ease: E.out });
    }
    const close = () => { gsap.to(lb, { opacity: 0, duration: 0.3, onComplete: () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); } }); };
    lb.querySelector(".g3-lb__close").addEventListener("click", close);
    const esc = (e) => e.key === "Escape" && close(); addEventListener("keydown", esc);

    // On first entry the camera glides forward through the fog
    // Only on first open it slides in through the fog — when entered via a page turn, it starts in place
    cam.position.z = CB.reduce || CB.loaded ? 10 : 22;
    tgt.copy(cam.position);
    // Slides in after the loader clears (immediately when arriving via a transition)
    const glide = () => { tgt.z = 10; };
    if (CB.loaded || CB.reduce) glide(); else document.addEventListener("cb:reveal", glide, { once: true });
    const tick = () => {
      const s = 0.12;
      if (keys.has("w") || keys.has("arrowup")) tgt.z -= s; if (keys.has("s") || keys.has("arrowdown")) tgt.z += s;
      if (keys.has("a") || keys.has("arrowleft")) tgt.x -= s; if (keys.has("d") || keys.has("arrowright")) tgt.x += s;
      if (keys.has("q")) tgt.y += s; if (keys.has("e")) tgt.y -= s;
      if (!drag) { tgt.x += vel.x * 0.016; tgt.y += vel.y * 0.016; vel.multiplyScalar(0.92); }
      cam.position.lerp(tgt, CB.reduce ? 1 : 0.035);
      sync();
      r.render(scene, cam);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick); ro.disconnect();
      removeEventListener("keydown", kd); removeEventListener("keyup", ku); removeEventListener("keydown", esc);
      r.dispose(); texs.forEach((t) => t.dispose());
    };
  }

  CB.page("lookbook", {
    mount(root) {
      CB.lenis?.stop();
      kill = gallery(root);
      CB.perches = [{ el: root.querySelector(".g3"), x: 0.62, y: 0.4 }];
    },
    unmount() { kill?.(); kill = null; CB.lenis?.start(); },
  });
})();
