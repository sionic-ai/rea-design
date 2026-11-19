// Golden 3D logo mark — ‹>」 and 「<” Two pieces overlapping in a staggered shape. When the page gives position, size, rotation and split via pose()
// Follows toward it every frame (a guide that crosses between scenes). Raise it and a ‹Drag to try› chip appears, letting you drag to rotate.
// It doesn’t tilt toward the mouse — in the original the tilt factor (mouseRotFactor) is 0 on every path.
window.DK = window.DK || {};
DK.logo3d = (canvas, opts = {}) => {
  const T = window.THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Environment for metal reflection: a few bright windows in a dark room, baked with PMREM
  const env = new T.Scene();
  env.add(new T.Mesh(new T.BoxGeometry(30, 30, 30), new T.MeshBasicMaterial({ color: 0x7a6a50, side: T.BackSide })));
  [[0, 9, 4, 14, 3, 0xffffff, 4], [-10, 2, 3, 3, 10, 0xfff1d6, 3], [10, -1, -2, 3, 8, 0xe8eeff, 2.4], [0, -8, 6, 12, 3, 0xb09670, 1.6], [0, 0, 12, 6, 6, 0xffffff, 1.5]].forEach(([x, y, z, w, h, c, k]) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k), side: T.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  });
  const pm = new T.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, 0.04).texture;

  // Worn-gold stain feel — roughness map made from canvas noise
  const nc = document.createElement("canvas");
  nc.width = nc.height = 128;
  const nx = nc.getContext("2d");
  for (let i = 0; i < 2600; i++) { const v = 90 + Math.random() * 120; nx.fillStyle = `rgb(${v},${v},${v})`; nx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1 + Math.random() * 2); }
  const rough = new T.CanvasTexture(nc);
  rough.wrapS = rough.wrapT = T.RepeatWrapping;
  rough.repeat.set(1.5, 1.5);
  // The gold is the skin’s gold (--site-gold-logo — near the original metal color #e8c066 derived from the accent color) — swap the skin and the logo metal color follows
  const probe = document.createElement("i");
  probe.style.cssText = "display:none;color:var(--site-gold-logo)";
  document.body.append(probe);
  const goldCss = getComputedStyle(probe).color;
  probe.remove();
  // The computed value of color-mix takes the color(srgb …) form, which three can’t read — paint one point and take it as 8-bit
  const px = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
  px.fillStyle = goldCss; px.fillRect(0, 0, 1, 1);
  const [gr, gg, gb] = px.getImageData(0, 0, 1, 1).data;
  const mat = new T.MeshStandardMaterial({ color: new T.Color().setRGB(gr / 255, gg / 255, gb / 255, T.SRGBColorSpace), metalness: 1, roughness: 0.3, roughnessMap: rough, bumpMap: rough, bumpScale: 0.35 });

  const chevron = () => {
    const s = new T.Shape();
    [[-0.78, 1.12], [-0.42, 1.12], [0.3, 0.3], [-0.42, -0.52], [-0.78, -0.52], [-0.06, 0.3]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 3 });
    g.translate(0, 0, -0.1);
    return g;
  };
  const group = new T.Group();
  const a = new T.Mesh(chevron(), mat);
  const b = new T.Mesh(chevron(), mat);
  b.rotation.z = Math.PI;
  group.add(a, b);
  group.scale.setScalar(opts.size || 1);
  scene.add(group);
  scene.add(new T.HemisphereLight(0xfff4dd, 0x6b5a40, 1.1));
  const key = new T.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 6);
  scene.add(key);

  const cur = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, split: 0, o: 1 };
  const tgt = { ...cur };
  const drag = { on: false, x: 0, y: 0, ry: 0, rx: 0, vry: 0, vrx: 0 };
  const view = { rx: 0, ry: 0 };
  let W = 1, H = 1, visible = true;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  // Screen-ratio coordinates (-1..1) to z=to world coordinates of the 0 plane
  const halfH = () => Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const screenOf = () => {
    const v = group.position.clone().project(camera);
    const r = canvas.getBoundingClientRect();
    return { x: r.left + (v.x * 0.5 + 0.5) * W, y: r.top + (-v.y * 0.5 + 0.5) * H, rad: (group.scale.x * 1.15 * H) / (2 * halfH()) };
  };

  if (opts.drag) addEventListener("pointermove", (e) => {
    if (drag.on) {
      drag.vry = (e.clientX - drag.x) * 0.012; drag.vrx = (e.clientY - drag.y) * 0.012;
      drag.ry += drag.vry; drag.rx += drag.vrx; drag.x = e.clientX; drag.y = e.clientY;
      DK.chip && DK.chip(true, e.clientX, e.clientY);
      return;
    }
    const p = screenOf();
    const near = cur.o > 0.5 && Math.hypot(e.clientX - p.x, e.clientY - p.y) < p.rad && !e.target.closest("a, button");
    canvas.classList.toggle("is-grab", near);
    DK.chip && DK.chip(near, e.clientX, e.clientY);
  });
  if (opts.drag) {
    addEventListener("pointerdown", (e) => {
      const p = screenOf();
      if (cur.o < 0.5 || Math.hypot(e.clientX - p.x, e.clientY - p.y) > p.rad || e.target.closest("a, button")) return;
      drag.on = true; drag.x = e.clientX; drag.y = e.clientY;
      DK.lenis && DK.lenis.stop();
    });
    addEventListener("pointerup", () => { if (drag.on) { drag.on = false; DK.lenis && DK.lenis.start(); } });
  }
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const tick = (now) => {
    requestAnimationFrame(tick);
    if (!visible) return;
    const t = now / 1000;
    const k = reduce ? 1 : 0.1;
    for (const key in tgt) cur[key] += (tgt[key] - cur[key]) * k;
    if (!drag.on) { drag.ry *= 0.92; drag.rx *= 0.92; }
    const hh = halfH();
    group.position.set(cur.x * hh * camera.aspect, -cur.y * hh, 0);
    const idle = reduce ? 0 : 1;
    // Cursor parallax angle for the beach and lakeside stage (scenes.js fills it only while visible). It eases once more so it doesn’t snap to 0 when the stage leaves
    const v = DK.logoView;
    if (v) { view.rx += (v.rx - view.rx) * 0.1; view.ry += (v.ry - view.ry) * 0.1; }
    group.rotation.set(cur.rx + view.rx + drag.rx + Math.sin(t * 0.8) * 0.03 * idle, cur.ry + view.ry + drag.ry + Math.sin(t * 0.5) * 0.08 * idle, cur.rz);
    // On portrait screens the width is narrow so the same size overflows — scale down by the ratio (minimum 0.55)
    const fit = Math.max(0.55, Math.min(1, camera.aspect));
    group.scale.setScalar((opts.size || 1) * cur.s * fit);
    // Split: two pieces each retreat diagonally outward, twisting slightly
    a.position.set(-cur.split * 0.55, cur.split * 0.38, cur.split * 0.2);
    b.position.set(cur.split * 0.55, -cur.split * 0.38, -cur.split * 0.2);
    a.rotation.set(0, cur.split * 0.5, cur.split * 0.25);
    b.rotation.set(0, -cur.split * 0.5, Math.PI - cur.split * 0.25);
    canvas.style.opacity = cur.o.toFixed(3);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(tick);

  return {
    pose(p, now) { Object.assign(tgt, p); if (now) Object.assign(cur, p); },
    target: tgt,
  };
};
