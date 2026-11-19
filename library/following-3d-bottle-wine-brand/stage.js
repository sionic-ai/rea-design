(() => {
  // One canvas stuck to the screen draws one bottle (swapping three labels), a wine glass and the pouring stream.
  // All motion: GSAP changes a single kw.pose, and here that value is read every frame and drawn — written in screen ratios (horizontal x · vertical y · bottle height h).
  const kw = window.kw;
  const T = window.THREE;
  const canvas = document.querySelector(".kw-stage");
  if (!canvas || !T) return;

  const pose = (kw.pose = { x: 0.5, y: 0.43, h: 0.69, rot: 0, spin: 0, op: 1, wine: 0, follow: 0, dropY: 0, pour: 0, glass: 0, level: 0, glassX: 0.43, glassY: 0.78, glassH: 0.42, branch: 1, branchX: 0.56 });
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(22, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // Our ambient light: bake a dark room scene with two big windows and one small reflector via PMREM and use it as glass reflection
  const pm = new T.PMREMGenerator(renderer);
  const room = new T.Scene();
  room.add(new T.Mesh(new T.BoxGeometry(20, 20, 20), new T.MeshBasicMaterial({ color: 0x000000, side: T.BackSide })));
  const panel = (w, h, x, y, z, ry, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; room.add(m); };
  panel(5, 12, -8, 1, 2, Math.PI / 2, 3.2);
  panel(3, 10, 8, 0, -1, -Math.PI / 2, 1.6);
  panel(10, 3, 0, 9, 0, 0, 0.6);
  scene.environment = pm.fromScene(room, 0.04).texture;
  scene.add(new T.AmbientLight(0xffffff, 0.35));
  const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(-4, 3, 6); scene.add(key);
  const rim = new T.DirectionalLight(0xffffff, 1.1); rim.position.set(5, 2, -4); scene.add(rim);

  // Bottle: height 1, origin at center, a flute bottle (body radius .109, narrowing long from shoulder .45 to neck .043, cap .8~1)
  const prof = [[0, 0], [0.098, 0], [0.106, 0.01], [0.109, 0.04], [0.109, 0.44], [0.105, 0.5], [0.094, 0.57], [0.076, 0.64], [0.058, 0.71], [0.047, 0.77], [0.043, 0.82], [0.043, 0.985], [0.04, 1], [0, 1]]
    .map(([r, y]) => new T.Vector2(r, y - 0.5));
  const bottle = new T.Group();
  const glassMat = new T.MeshPhysicalMaterial({ roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, transparent: true });
  const body = new T.Mesh(new T.LatheGeometry(prof, 96), glassMat);
  bottle.add(body);
  const capMat = new T.MeshPhysicalMaterial({ roughness: 0.38, metalness: 0.15, clearcoat: 0.6, envMapIntensity: 1, transparent: true });
  const cap = new T.Mesh(new T.CylinderGeometry(0.0445, 0.0445, 0.19, 64, 1, false), capMat);
  cap.position.y = 0.5 - 0.095;
  bottle.add(cap);
  for (let i = 0; i < 8; i++) { const ring = new T.Mesh(new T.TorusGeometry(0.0447, 0.0012, 6, 64), capMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.5 - 0.012 - i * 0.004; bottle.add(ring); }
  const labelCanvas = document.createElement("canvas"); labelCanvas.width = 512; labelCanvas.height = 640;
  const labelTex = new T.CanvasTexture(labelCanvas); labelTex.colorSpace = T.SRGBColorSpace; labelTex.anisotropy = 4;
  const labelMat = new T.MeshPhysicalMaterial({ map: labelTex, roughness: 0.55, clearcoat: 0.3, envMapIntensity: 0.6, transparent: true });
  const label = new T.Mesh(new T.CylinderGeometry(0.1105, 0.1105, 0.33, 72, 1, true, -1.05, 2.1), labelMat);
  label.position.y = -0.5 + 0.05 + 0.165;
  bottle.add(label);
  const backCanvas = document.createElement("canvas"); backCanvas.width = 256; backCanvas.height = 320;
  const backTex = new T.CanvasTexture(backCanvas); backTex.colorSpace = T.SRGBColorSpace;
  const backMat = new T.MeshPhysicalMaterial({ map: backTex, roughness: 0.6, transparent: true });
  const back = new T.Mesh(new T.CylinderGeometry(0.1105, 0.1105, 0.24, 48, 1, true, Math.PI - 0.7, 1.4), backMat);
  back.position.y = -0.5 + 0.06 + 0.12;
  bottle.add(back);
  scene.add(bottle);

  // Wine glass + wine inside the glass (raise the height with the clipping plane) + stem
  const gprof = [[0, 0], [0.3, 0], [0.31, 0.012], [0.04, 0.03], [0.022, 0.06], [0.02, 0.36], [0.06, 0.39], [0.17, 0.43], [0.26, 0.5], [0.31, 0.6], [0.325, 0.72], [0.31, 0.86], [0.285, 1]].map(([r, y]) => new T.Vector2(r, y - 0.5));
  const wineGlass = new T.Group();
  const cupMat = new T.MeshPhysicalMaterial({ roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, envMapIntensity: 2.4, side: T.DoubleSide, depthWrite: false });
  wineGlass.add(new T.Mesh(new T.LatheGeometry(gprof, 96), cupMat));
  const clip = new T.Plane(new T.Vector3(0, -1, 0), 0);
  const wprof = [[0, -0.105], [0.05, -0.105], [0.16, -0.065], [0.25, 0.0], [0.3, 0.1], [0.315, 0.22], [0.3, 0.36], [0, 0.36]].map(([r, y]) => new T.Vector2(r * 0.96, y));
  const fillMat = new T.MeshPhysicalMaterial({ roughness: 0.15, clearcoat: 1, envMapIntensity: 1.2, clippingPlanes: [clip], transparent: true, opacity: 0.94 });
  const fill = new T.Mesh(new T.LatheGeometry(wprof, 72), fillMat);
  wineGlass.add(fill);
  scene.add(wineGlass);
  const streamMat = new T.MeshPhysicalMaterial({ roughness: 0.12, clearcoat: 1, envMapIntensity: 1.2, transparent: true, opacity: 0.95 });
  let stream = null;

  // Label art: wine label color background, a gold mosaic cluster in the center (where the original image sits), two lines of brand text below
  const hex = (c, a = 1) => `rgb(${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)} / ${a})`;
  const rand = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const drawLabel = (i) => {
    const g = labelCanvas.getContext("2d");
    const bg = kw.color(`--site-label-${i}`), gold = kw.color("--site-gold"), ink = kw.color("--kf-ink"), red = kw.color("--site-wine-red"), acc = kw.color("--kf-accent-text");
    const W = labelCanvas.width, H = labelCanvas.height;
    g.fillStyle = hex(bg); g.fillRect(0, 0, W, H);
    const r = rand(7 + i * 31);
    g.save(); g.beginPath(); g.ellipse(W * 0.48, H * 0.4, W * 0.21, H * 0.3, -0.12, 0, Math.PI * 2); g.clip();
    g.fillStyle = hex(gold); g.fillRect(0, 0, W, H);
    for (let k = 0; k < 420; k++) {
      const x = W * (0.25 + r() * 0.5), y = H * (0.08 + r() * 0.65), s = 4 + r() * 16, t = r();
      g.fillStyle = hex(t < 0.5 ? acc : t < 0.72 ? ink : t < 0.86 ? red : bg, 0.55 + r() * 0.45);
      if (t > 0.9) { g.beginPath(); g.arc(x, y, s * 0.6, 0, Math.PI * 2); g.fill(); } else g.fillRect(x, y, s * (t < 0.72 ? 0.5 : 1), s);
    }
    g.restore();
    const fam = kw.css("--kf-font-display").trim() || "serif";
    g.fillStyle = hex(i === 2 ? gold : ink);
    g.textAlign = "center";
    g.font = `300 40px ${fam}`; g.fillText("BRAND", W / 2, H * 0.85);
    g.font = `400 18px ${fam}`; g.fillText("PRODUCT NAME", W / 2, H * 0.91);
    labelTex.needsUpdate = true;
    const b = backCanvas.getContext("2d");
    b.fillStyle = hex(bg); b.fillRect(0, 0, 256, 320);
    b.fillStyle = hex(i === 2 ? gold : ink, 0.8);
    for (let k = 0; k < 9; k++) b.fillRect(40, 60 + k * 18, 120 + ((k * 37) % 60), 5);
    for (let k = 0; k < 22; k++) b.fillRect(70 + k * 5, 250, k % 3 ? 2 : 3, 40);
    backTex.needsUpdate = true;
  };
  let shown = -1;
  const paintWine = (i) => {
    if (i === shown) return;
    shown = i;
    const [gr, gg, gb] = kw.color(`--site-glass-${i}`);
    glassMat.color.setRGB(gr, gg, gb, T.SRGBColorSpace);
    const [cr, cg, cb] = kw.color(`--site-cap-${i}`);
    capMat.color.setRGB(cr, cg, cb, T.SRGBColorSpace);
    drawLabel(i);
  };
  const [wr, wg, wb] = kw.color("--site-wine-red");
  fillMat.color.setRGB(wr * 0.7, wg * 0.6, wb * 0.6, T.SRGBColorSpace);
  streamMat.color.copy(fillMat.color);
  cupMat.color.setRGB(1, 1, 1);

  // Grapevine stem behind the hero: the original is a 3D model (what turns ±15° with the cursor is this stem, not the bottle).
  // Twists two tubes of the same position, thickness and curve into an upright shape, and paints the bark grain with canvas stripes
  const branch = new T.Group();
  const barkCanvas = document.createElement("canvas"); barkCanvas.width = 256; barkCanvas.height = 512;
  const barkTex = new T.CanvasTexture(barkCanvas); barkTex.colorSpace = T.SRGBColorSpace; barkTex.wrapS = barkTex.wrapT = T.RepeatWrapping; barkTex.repeat.set(1, 10);
  const barkMat = new T.MeshStandardMaterial({ map: barkTex, roughness: 0.92, metalness: 0, envMapIntensity: 0.35, transparent: true });
  const mossMat = new T.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0.2, transparent: true });
  const paintBark = () => {
    const g = barkCanvas.getContext("2d"), r = rand(11);
    const mid = kw.color("--site-bark"), dark = kw.color("--site-bark-dark"), light = kw.color("--site-bark-light");
    g.fillStyle = hex(mid); g.fillRect(0, 0, 256, 512);
    for (let k = 0; k < 320; k++) {
      const x = r() * 256, w = 2 + r() * 10;
      g.fillStyle = hex(r() < 0.6 ? dark : light, 0.45 + r() * 0.55);
      g.fillRect(x, r() * 512, w, 60 + r() * 400);
    }
    barkTex.needsUpdate = true;
    const [mr, mg, mb] = kw.color("--site-moss");
    mossMat.color.setRGB(mr, mg, mb, T.SRGBColorSpace);
  };
  paintBark();
  const BR = [[-0.13, -0.62, 0.2], [-0.17, -0.42, -0.3], [-0.09, -0.24, 0.1], [0.09, -0.12, 0.4], [0.26, 0.0, 0.1], [0.29, 0.14, -0.3], [0.15, 0.27, 0], [-0.02, 0.36, 0.3], [-0.13, 0.5, 0], [-0.16, 0.66, -0.2]];
  let branchBuilt = 0;
  const buildBranch = () => {
    branch.clear();
    const pts = BR.map(([x, y, z]) => new T.Vector3(x * vh * 1.35, -y * vh, z * vh * 0.4));
    const curve = new T.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    branch.add(new T.Mesh(new T.TubeGeometry(curve, 220, 0.08 * vh, 18, false), barkMat));
    const frames = curve.computeFrenetFrames(220, false), twist = [];
    for (let i = 0; i <= 220; i++) {
      const u = i / 220, a = u * Math.PI * 9, p = curve.getPointAt(u);
      twist.push(p.clone().addScaledVector(frames.normals[i], Math.cos(a) * 0.065 * vh).addScaledVector(frames.binormals[i], Math.sin(a) * 0.065 * vh));
    }
    branch.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(twist), 440, 0.032 * vh, 10, false), barkMat));
    const moss = new T.CatmullRomCurve3([0.33, 0.38, 0.44, 0.5].map((u) => curve.getPointAt(u).add(new T.Vector3(0.03 * vh, 0.0, 0.03 * vh))));
    branch.add(new T.Mesh(new T.TubeGeometry(moss, 40, 0.03 * vh, 10, false), mossMat));
    branchBuilt = vh;
  };
  scene.add(branch);

  // Screen ratio → world coordinates
  let vw = 1, vh = 1, W = innerWidth, H = innerHeight;
  const resize = () => {
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    vh = 2 * camera.position.z * Math.tan(T.MathUtils.degToRad(camera.fov / 2)); vw = vh * camera.aspect;
  };
  resize();
  buildBranch();
  addEventListener("resize", resize);
  const toWorld = (x, y) => [(x - 0.5) * vw, (0.5 - y) * vh];

  // Cursor: on wide screens the bottle rotates ±15° with mouse x — the target is followed at .035 and the rotation is followed at .08 (original values)
  let aim = 0, lag = 0;
  if (kw.fine && !kw.reduce) {
    addEventListener("pointermove", (e) => { aim = (2 * Math.max(0, Math.min(1, e.clientX / Math.max(innerWidth, 1))) - 1) * (15 * Math.PI) / 180; });
    document.documentElement.addEventListener("pointerleave", () => { aim = 0; });
  }
  const anchor = document.querySelector("[data-bottle-anchor]");
  const mouth = new T.Vector3();
  const tmp = new T.Vector3();
  const buildStream = (a, b) => {
    const mid = new T.Vector3((a.x + b.x) / 2 - 0.02 * vh, a.y - (a.y - b.y) * 0.2, (a.z + b.z) / 2);
    const curve = new T.QuadraticBezierCurve3(a.clone(), mid, b.clone());
    const geo = new T.TubeGeometry(curve, 48, 0.006 * vh, 10, false);
    if (stream) { stream.geometry.dispose(); stream.geometry = geo; } else { stream = new T.Mesh(geo, streamMat); scene.add(stream); }
  };

  const frame = () => {
    paintWine(Math.round(pose.wine));
    lag += (aim - lag) * 0.035;
    let x = pose.x, y = pose.y;
    if (pose.follow > 0 && anchor) {
      const r = anchor.getBoundingClientRect(), c = canvas.getBoundingClientRect();
      const ax = (r.left - c.left + r.width / 2) / W, ay = (r.top - c.top + r.height / 2) / H;
      x += (ax - x) * pose.follow; y += (ay - y) * pose.follow;
    }
    y += pose.dropY;
    const [X, Y] = toWorld(x, y);
    const s = pose.h * vh;
    bottle.position.set(X, Y, 0);
    bottle.scale.setScalar(s);
    bottle.rotation.z = T.MathUtils.degToRad(pose.rot);
    bottle.rotation.y += (pose.spin - bottle.rotation.y) * 0.08;
    const bo = Math.max(0, Math.min(1, pose.branch));
    branch.visible = bo > 0.001;
    if (branch.visible) {
      if (branchBuilt !== vh) buildBranch();
      const [bx, by] = toWorld(pose.branchX, 0.5);
      branch.position.set(bx, by, -2.2);
      branch.rotation.y += (lag - branch.rotation.y) * 0.08;
      barkMat.opacity = mossMat.opacity = bo;
    }
    const op = Math.max(0, Math.min(1, pose.op));
    bottle.visible = op > 0.001;
    for (const m of [glassMat, capMat, labelMat, backMat]) m.opacity = op;
    glassMat.opacity = op * 0.97;

    const g = Math.max(0, Math.min(1, pose.glass));
    wineGlass.visible = g > 0.001;
    if (wineGlass.visible) {
      const [gx, gy] = toWorld(pose.glassX, pose.glassY + (1 - g) * 0.5);
      const gs = pose.glassH * vh;
      wineGlass.position.set(gx, gy, 0.6);
      wineGlass.scale.setScalar(gs);
      cupMat.opacity = 0.22 * g;
      fillMat.opacity = 0.94 * g;
      clip.constant = gy + gs * (-0.105 + 0.2 * pose.level);
      fill.visible = pose.level > 0.001;
    }
    const p = Math.max(0, Math.min(1, pose.pour));
    if (p > 0.001 && wineGlass.visible) {
      bottle.updateMatrixWorld(true);
      mouth.set(0, 0.5, 0).applyMatrix4(bottle.matrixWorld);
      tmp.set(wineGlass.position.x, wineGlass.position.y + pose.glassH * vh * (-0.1 + 0.2 * pose.level), 0.6);
      buildStream(mouth, tmp);
      stream.visible = true;
      const n = stream.geometry.index.count;
      stream.geometry.setDrawRange(0, Math.floor(n * p));
    } else if (stream) stream.visible = false;
    renderer.render(scene, camera);
  };
  // Precompile shaders so the first frame doesn’t stall
  paintWine(0);
  renderer.compile(scene, camera);
  gsap.ticker.add(frame);
  kw.stage = { renderer, scene, camera, bottle };
})();
