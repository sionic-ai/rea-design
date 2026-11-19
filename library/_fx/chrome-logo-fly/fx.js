// Flying chrome logo — one screen-fixed canvas holds a single chrome ring + lightning W, placed at the data-fx marker center nearest the screen center
// Each frame it closes 9% of the distance and grows to that box width. If the anchor is not on screen it shrinks to 0. Sways slowly and leans toward the mouse
(() => {
  const anchors = new Map();
  let world = null;
  function build() {
    const T = window.THREE;
    if (!T) return null;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-clf";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { canvas.remove(); return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
    const probe = document.createElement("i"), px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.style.display = "none";
    document.body.appendChild(probe);
    const colorOf = (v) => { probe.style.color = `var(${v})`; px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data; return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.SRGBColorSpace); };
    // The room the chrome reflects — bakes background, text and accent panels with PMREM (changing the skin changes the reflection)
    const room = new T.Scene();
    room.background = colorOf("--kf-bg");
    const panel = (w, h, col, x, y, z, ry) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: col, side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; room.add(m); };
    panel(6, 3, colorOf("--kf-ink"), 0, 3, -4, 0);
    panel(4, 6, colorOf("--kf-ink-soft"), -5, 0, 0, Math.PI / 2);
    panel(3, 3, colorOf("--kf-accent"), 5, -1, 1, -Math.PI / 2);
    panel(8, 1, colorOf("--kf-ink"), 0, -4, 2, 0);
    probe.remove();
    const pmrem = new T.PMREMGenerator(renderer);
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    const mat = new T.MeshStandardMaterial({ metalness: 1, roughness: 0.18 });
    const logo = new T.Group();
    const ring = new T.Mesh(new T.TorusGeometry(0.46, 0.035, 24, 96), mat);
    const w = new T.Shape();
    [[-0.36, 0.3], [-0.24, 0.3], [-0.15, -0.06], [-0.04, 0.22], [0.05, 0.22], [0.13, -0.05], [0.3, 0.42], [0.42, 0.42], [0.16, -0.34], [0.07, -0.34], [0, -0.1], [-0.08, -0.34], [-0.17, -0.34]].forEach(([x, y], i) => (i ? w.lineTo(x, y) : w.moveTo(x, y)));
    w.closePath();
    const wGeo = new T.ExtrudeGeometry(w, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 4 });
    const wMesh = new T.Mesh(wGeo, mat);
    wMesh.position.z = -0.04;
    logo.add(ring, wMesh);
    scene.add(logo);
    renderer.compile(scene, cam);
    const size = () => { const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2; cam.updateProjectionMatrix(); };
    size();
    const cur = { x: 0, y: 0, s: 0, ry: 0 }, mouse = { x: 0, y: 0 };
    const onMove = (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", size);
    const t0 = performance.now();
    let prev = t0, raf = 0;
    const frame = (now) => {
      const dt = Math.min(64, Math.max(1, now - prev)) / 16.67;
      prev = now;
      const H = innerHeight, mid = H / 2;
      let best = null, bestD = Infinity;
      anchors.forEach((o, a) => {
        const r = a.getBoundingClientRect();
        if (!r.width || r.bottom < -H * 0.25 || r.top > H * 1.25) return;
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = { r, o }; }
      });
      const k = 1 - Math.pow(1 - 0.09, dt);
      if (best) {
        const { r, o } = best;
        cur.x += (r.left + r.width / 2 - innerWidth / 2 - cur.x) * k;
        cur.y += (mid - (r.top + r.height / 2) - cur.y) * k;
        cur.s += (r.width * o.scale - cur.s) * k;
        cur.ry += (o.ry - cur.ry) * k;
      } else cur.s += -cur.s * k;
      const t = (now - t0) / 1000, still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      logo.position.set(cur.x, cur.y, 0);
      logo.scale.setScalar(Math.max(0.0001, cur.s));
      logo.rotation.set(still ? 0 : -mouse.y * 0.5 + Math.sin(t * 0.6) * 0.06, cur.ry + (still ? 0 : mouse.x * 0.7 + Math.sin(t * 0.4) * 0.18), still ? 0 : Math.sin(t * 0.5) * 0.03);
      canvas.style.visibility = cur.s > 2 ? "visible" : "hidden";
      if (cur.s > 2) renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return {
      stop() {
        cancelAnimationFrame(raf);
        removeEventListener("pointermove", onMove);
        removeEventListener("resize", size);
        wGeo.dispose(); ring.geometry.dispose(); mat.dispose(); env.dispose(); pmrem.dispose(); renderer.dispose();
        canvas.remove();
      },
    };
  }
  kfFx.register("chrome-logo-fly", (el, { options }) => {
    if (!window.THREE) return;
    anchors.set(el, { scale: +(options.scale ?? 1), ry: +(options.ry ?? 0) });
    if (!world) world = build();
    return () => { anchors.delete(el); if (!anchors.size && world) { world.stop(); world = null; } };
  });
})();
