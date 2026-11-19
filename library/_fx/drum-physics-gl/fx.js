// Zero-gravity drum — dozens of objects form a cylinder around a center hub (swollen logo) (axis = horizontal) inside, floats trapped by cannon-es physics,
// The camera circles that cylinder. Wheel and vertical drag add turning force (decays by .98 per frame and stops at .01, so it always turns slowly),
// Hold and every object is pulled toward the cursor, release and they bounce and scatter individually. White objects each flash chrome at a different late moment and return.
(() => {
  const TAU = Math.PI * 2;

  const rngOf = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Turn a skin variable into [r,g,b] that three can read — pass it through an element and a canvas once so the browser resolves color-mix and oklch
  const paint = (() => {
    let ctx;
    return (name, host) => {
      const probe = document.createElement("i");
      probe.style.cssText = `display:none;color:var(${name})`;
      (host || document.body).appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      ctx = ctx || document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
    };
  })();

  // Environment the chrome reflects — instead of the original photo, paint with skin colors a bright top with a band at the horizon and a dark studio below.
  function studio(col) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    const g = c.getContext("2d");
    const css = (k) => `#${col[k].getHexString()}`;
    const sky = g.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, css("surface"));
    sky.addColorStop(0.42, css("raised"));
    sky.addColorStop(0.5, css("dim"));
    sky.addColorStop(0.56, css("ink"));
    sky.addColorStop(1, css("dim"));
    g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
    g.fillStyle = css("surface");
    for (let i = 0; i < 6; i++) g.fillRect(40 + i * 82, 70 + (i % 2) * 18, 26, 70);
    g.globalAlpha = 0.5;
    g.fillStyle = css("accent");
    g.fillRect(0, 150, 512, 6);
    const t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    return t;
  }

  // Image slot board — shows the img if present, otherwise a placeholder labeled with data-label
  function cardTexture(part, col, font) {
    const img = part.querySelector("img");
    const ratio = Number(part.dataset.ratio) || (img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.75);
    const c = document.createElement("canvas");
    const W = 512, H = Math.round(512 / ratio);
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    const draw = () => {
      if (img && img.complete && img.naturalWidth) { g.drawImage(img, 0, 0, W, H); tex.needsUpdate = true; return; }
      g.fillStyle = `#${col.raised.getHexString()}`; g.fillRect(0, 0, W, H);
      g.strokeStyle = `#${col.dim.getHexString()}`; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.lineWidth = 2; g.stroke();
      g.fillStyle = `#${col.ink.getHexString()}`;
      g.font = `500 30px ${font}`;
      const words = (part.dataset.label || "").split(" ");
      let line = "", y = 56;
      for (const w of words) {
        if (g.measureText(line + w).width > W - 60 && line) { g.fillText(line, 30, y); line = ""; y += 38; }
        line += w + " ";
      }
      g.fillText(line, 30, y);
      tex.needsUpdate = true;
    };
    draw();
    if (img && !img.complete) img.addEventListener("load", draw, { once: true });
    return { tex, ratio };
  }

  // Object type — builds the original 3D model spots from basic shapes of the same size and same silhouette ratio. tint: white ones shine as chrome and the rest keep their own color
  const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
  const KINDS = [
    { name: "funnel", tint: "white", geo: () => lathe([[0.05, 0.62], [0.08, 0.62], [0.08, 0.18], [0.44, -0.22], [0.46, -0.24], [0.42, -0.24], [0.05, 0.16], [0.05, 0.62]]) },
    { name: "washer", tint: "white", geo: () => lathe([[0.22, -0.1], [0.44, -0.1], [0.44, 0.1], [0.22, 0.1], [0.22, -0.1]], 48) },
    { name: "disc", tint: "chrome", geo: () => lathe([[0.08, -0.012], [0.52, -0.012], [0.52, 0.012], [0.08, 0.012], [0.08, -0.012]], 64) },
    { name: "pill", tint: "brand", geo: () => new THREE.CapsuleGeometry(0.16, 0.62, 8, 20).rotateZ(Math.PI / 2) },
    { name: "rock", tint: "dim", geo: (r) => rock(r) },
    { name: "brick", tint: "white", geo: () => new THREE.BoxGeometry(0.9, 0.32, 0.46) },
    { name: "band", tint: "white", side: true, geo: () => new THREE.CylinderGeometry(0.5, 0.5, 0.36, 8, 1, true) },
    { name: "helmet", tint: "ink", geo: () => new THREE.SphereGeometry(0.38, 28, 16, 0, TAU, 0, Math.PI * 0.62) },
    { name: "speaker", tint: "ink", geo: () => new THREE.SphereGeometry(0.44, 32, 20).scale(1, 1, 0.55) },
    { name: "phone", tint: "white", geo: () => rounded(0.52, 0.86, 0.08, 0.09) },
    { name: "monitor", tint: "white", geo: () => new THREE.BoxGeometry(1.1, 0.72, 0.14) },
    { name: "mushroom", tint: "white", geo: () => lathe([[0, 0.34], [0.3, 0.3], [0.42, 0.14], [0.36, 0.08], [0.12, 0.06], [0.14, -0.3], [0, -0.32]]) },
    { name: "globe", tint: "line", geo: () => new THREE.SphereGeometry(0.42, 14, 9) },
    { name: "balloon", tint: "brand", geo: () => new THREE.TorusKnotGeometry(0.24, 0.1, 96, 14, 2, 3) },
    { name: "lens", tint: "accent", geo: () => new THREE.CylinderGeometry(0.5, 0.5, 0.05, 48).scale(1.4, 1, 1).rotateX(Math.PI / 2) },
    { name: "keypad", tint: "brand", geo: () => new THREE.BoxGeometry(0.42, 0.42, 0.26) },
    { name: "swoosh", tint: "chrome", geo: () => new THREE.TorusGeometry(0.34, 0.09, 16, 60, Math.PI * 1.4) },
    { name: "sneaker", tint: "white", geo: () => new THREE.CapsuleGeometry(0.17, 0.62, 8, 20).rotateZ(Math.PI / 2).scale(1, 1, 0.75) },
    { name: "cup", tint: "white", geo: () => lathe([[0.3, 0.32], [0.28, -0.3], [0, -0.3]]) },
    { name: "tube", tint: "white", geo: () => new THREE.CylinderGeometry(0.16, 0.16, 0.8, 24) },
  ];

  function rounded(w, h, d, r) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 }).center();
  }

  function rock(r) {
    const g = new THREE.IcosahedronGeometry(0.4, 3);
    const p = g.attributes.position, v = new THREE.Vector3();
    const a = r() * 9, b = r() * 9;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + 0.12 * Math.sin(v.x * 7 + a) * Math.cos(v.y * 6 + b) + 0.06 * Math.sin(v.z * 13);
      v.multiplyScalar(n); v.y *= 0.75;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }

  // Center hub — puffy cloud-shaped label (fourteen droplets + four rings). Same width-to-height ratio as the original logo spot (3.1 : 1.45)
  const PUFF = [
    [-1.2, 0.05, 0.28, 0.3], [-0.92, 0.22, 0.35, 0.38], [-0.86, -0.2, 0.3, 0.3], [-0.52, 0.27, 0.4, 0.42], [-0.46, -0.25, 0.35, 0.33],
    [-0.1, 0.36, 0.38, 0.36], [-0.06, -0.15, 0.42, 0.42], [0.3, 0.3, 0.4, 0.4], [0.35, -0.3, 0.35, 0.32], [0.7, 0.25, 0.4, 0.42],
    [0.76, -0.2, 0.33, 0.32], [1.06, 0.4, 0.3, 0.33], [1.1, 0.0, 0.3, 0.3], [1.3, -0.1, 0.22, 0.22],
  ];
  const RINGS = [[-1.5, 0.04, 0.17], [1.56, -0.04, 0.17], [-0.62, -0.66, 0.15], [-0.2, 0.74, 0.14]];

  function hub(mat, scale) {
    const g = new THREE.Group();
    const ball = new THREE.SphereGeometry(1, 36, 22);
    for (const [x, y, rx, ry] of PUFF) {
      const m = new THREE.Mesh(ball, mat);
      m.position.set(x, y, 0); m.scale.set(rx, ry, 0.2);
      g.add(m);
    }
    for (const [x, y, r] of RINGS) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.42, 16, 40), mat);
      m.position.set(x, y, 0); m.scale.z = 0.8;
      g.add(m);
    }
    g.scale.setScalar(scale);
    return g;
  }

  kfFx.register("drum-physics-gl", (el, { options, reduce, hover }) => {
    if (!window.THREE || !window.CANNON) return;
    const zoomDiv = +(options.zoom ?? 4.5) || 4.5;
    const count = Math.max(0, Math.round(+(options.count ?? 34)));
    const drift = +(options.drift ?? 0.01);
    const wheelDiv = +(options.wheel ?? 800) || 800;
    const decay = +(options.decay ?? 0.98);
    const pulse = +(options.pulse ?? 0.4);
    const pull = +(options.pull ?? 1);
    const burst = +(options.burst ?? 15);
    const hold = +(options.hold ?? 0);
    const seed = Math.round(+(options.seed ?? 7));
    if (options.touch === "spin") el.style.touchAction = "none";

    const col = {
      surface: paint("--kf-surface", el), raised: paint("--kf-raised", el), line: paint("--kf-line", el), dim: paint("--kf-dim", el),
      ink: paint("--kf-ink", el), accent: paint("--kf-accent", el), brand: paint("--kf-accent-text", el),
    };
    const font = getComputedStyle(el).fontFamily;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);

    const scene = new THREE.Scene();
    scene.background = col.surface;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.set(0, 0, 10);
    scene.add(new THREE.AmbientLight(undefined, 0.7));
    const lights = new THREE.Group();
    for (const p of [[15, -15, 6], [-15, 15, -6], [15, -6, 15], [-15, 6, -15]]) {
      const l = new THREE.DirectionalLight(undefined, 0.1);
      l.position.set(...p);
      lights.add(l);
    }
    scene.add(lights);

    const env = studio(col);
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
    world.solver.iterations = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e6;
    world.defaultContactMaterial.friction = 0;

    // Cylinder wall of 20 panels (horizontal axis around, radius = Half the screen height) and 2 side walls — repositions when the size changes
    const ring = Array.from({ length: 20 }, () => { const b = new CANNON.Body({ type: CANNON.Body.STATIC }); b.addShape(new CANNON.Plane()); world.addBody(b); return b; });
    const walls = [1, -1].map(() => { const b = new CANNON.Body({ type: CANNON.Body.KINEMATIC }); b.addShape(new CANNON.Plane()); world.addBody(b); return b; });
    let vw = 1, vh = 1;
    function fit() {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      canvas.style.width = "100%"; canvas.style.height = "100%";
      camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2;
      camera.zoom = (w + h) / 2 / zoomDiv;
      camera.updateProjectionMatrix();
      vw = w / camera.zoom; vh = h / camera.zoom;
      const r = vh / 2;
      ring.forEach((b, t) => {
        const l = Math.PI + (TAU / 20) * t;
        b.position.set(0, Math.cos(l) * r, Math.sin(l) * r);
        b.quaternion.setFromEuler(l + Math.PI / 2, 0, 0);
      });
      walls[0].position.set(-0.5 * vw, 0, 0); walls[0].quaternion.setFromEuler(0, Math.PI / 2, 0);
      walls[1].position.set(0.5 * vw, 0, 0); walls[1].quaternion.setFromEuler(0, -Math.PI / 2, 0);
    }
    fit();

    const box = new THREE.Box3(), size = new THREE.Vector3();
    const hubMat = new THREE.MeshStandardMaterial({ color: col.surface, roughness: 0.3, metalness: 0, emissive: col.surface, emissiveIntensity: 0.1 });
    let hubMesh = null, hubBody = null;
    if (options.hub !== "none") {
      hubMesh = hub(hubMat, (+(options.hubScale ?? 1)) * (el.clientWidth < 768 ? 0.9375 : 1));
      scene.add(hubMesh);
      box.setFromObject(hubMesh).getSize(size);
      hubBody = new CANNON.Body({ type: CANNON.Body.STATIC });
      hubBody.addShape(new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)));
      world.addBody(hubBody);
    }

    const rand = rngOf(seed);
    const items = [];
    const mainMat = new THREE.MeshStandardMaterial({ color: col.surface, envMap: env, envMapIntensity: 1, metalness: 1, roughness: 0.2 });
    const total = count + el.querySelectorAll('[data-fx-part="card"]').length;
    function add(obj, phaseIndex, dims, chromeMat) {
      const i = items.length;
      const body = new CANNON.Body({ mass: 1, angularDamping: 0.5, linearDamping: 0.01 });
      body.addShape(new CANNON.Box(new CANNON.Vec3(dims.x / 2, dims.y / 2, Math.max(dims.z, 0.02) / 2)));
      body.position.set(0, 0, Math.sin(i) * Math.PI / 6);
      world.addBody(body);
      scene.add(obj);
      items.push({ obj, body, mat: chromeMat, phase: (TAU / total) * (phaseIndex - 1) });
    }
    for (let i = 0; i < count; i++) {
      const kind = KINDS[i % KINDS.length];
      const geo = kind.geo(rand);
      let mat, chrome = null;
      if (kind.tint === "white") { mat = chrome = mainMat.clone(); if (kind.side) mat.side = THREE.DoubleSide; }
      else if (kind.tint === "chrome") mat = new THREE.MeshStandardMaterial({ color: col.surface, envMap: env, metalness: 1, roughness: 0.12 });
      else if (kind.tint === "line") mat = new THREE.MeshStandardMaterial({ color: col.dim, wireframe: true });
      else mat = new THREE.MeshStandardMaterial({ color: col[kind.tint], metalness: 0, roughness: kind.tint === "accent" ? 0.25 : 1, transparent: kind.tint === "accent", opacity: kind.tint === "accent" ? 0.85 : 1 });
      const mesh = new THREE.Mesh(geo, mat);
      const s = 0.5 + rand() * 0.35;
      mesh.scale.setScalar(s);
      mesh.rotation.set(rand() * TAU, rand() * TAU, 0);
      const g = new THREE.Group();
      g.add(mesh);
      box.setFromObject(g).getSize(size);
      add(g, (i + 1) % total, size.clone(), chrome);
    }
    el.querySelectorAll('[data-fx-part="card"]').forEach((part) => {
      const { tex, ratio } = cardTexture(part, col, font);
      const sc = +(part.dataset.scale || 1);
      const dims = ratio > 1.5 ? new THREE.Vector3(sc, sc / ratio, 0.1) : new THREE.Vector3(ratio * sc, sc, 0.1);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sp.scale.set(dims.x, dims.y, 1);
      add(sp, 0, dims, null);
    });

    // Shaders are precompiled at setup — compiling on first movement would freeze the screen
    renderer.compile(scene, camera);

    // Rotation force: wheel is −Δ/800 every 30ms (within ±.5), drag is the vertical distance moved after pressing/1000 (finger /10, within ±.3)
    let power = drift, angle = 0, pressed = false, last = 0, wheelAt = 0, drag = null;
    const mouse = { x: 0, y: 0 };
    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - wheelAt < 30) return;
      wheelAt = now;
      const px = e.deltaMode === 1 ? e.deltaX * 40 : e.deltaX, py = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      const r = -(Math.abs(py) >= Math.abs(px) ? py : 0.75 * px) / wheelDiv;
      power = r <= 0 ? Math.max(Math.min(r, power), -0.5) : Math.min(Math.max(r, power), 0.5);
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      if (drag) {
        const dy = e.clientY - drag.y;
        power = Math.max(Math.min(dy / (e.pointerType === "touch" ? 10 : 1000), 0.3), -0.3);
      }
    };
    const onDown = (e) => { drag = { y: e.clientY }; if (e.pointerType !== "mouse") pressed = true; onMove(e); };
    const onUp = () => { drag = null; };
    const onPress = () => { pressed = true; };
    // On release, each object gets a random ±15 impulse per axis relative to its own body
    const kick = new CANNON.Vec3(), zero = new CANNON.Vec3();
    const onRelease = () => {
      if (!pressed) return;
      pressed = false;
      for (const it of items) { kick.set((2 * Math.random() - 1) * burst, (2 * Math.random() - 1) * burst, (2 * Math.random() - 1) * burst); it.body.applyLocalImpulse(kick, zero); }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mousedown", onPress);
    document.addEventListener("mouseup", onRelease);
    document.addEventListener("touchend", onRelease);

    const force = new CANNON.Vec3(), point = new CANNON.Vec3(), imp = new CANNON.Vec3();
    const eu = new THREE.Euler();
    let raf = 0, t0 = performance.now(), times = [], dprAt = 0, visible = true, ready = false;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      const t = (now - t0) / 1000;

      // As in the original, collect 60 frames of time, and if the average excluding the top and bottom extremes exceeds 20ms lower the resolution by .2, and if under 10ms raise it by .2
      times.push(dt); if (times.length > 60) times.shift();
      if (times.length >= 60 && now - dprAt > 500) {
        const s = [...times].sort((a, b) => a - b).slice(1, -1), avg = s.reduce((a, b) => a + b, 0) / s.length, pr = renderer.getPixelRatio();
        if (avg > 20 && pr > 0.8) { renderer.setPixelRatio(Math.round((pr - 0.2) * 10) / 10); fit(); times = []; dprAt = now; }
        else if (avg < 10 && pr < 2) { renderer.setPixelRatio(Math.round((pr + 0.2) * 10) / 10); fit(); times = []; dprAt = now; }
      }

      angle += power;
      if (power > 0.01 || power < -0.01) power *= decay;
      const e = Math.PI + (TAU / 10) * angle;
      camera.position.y = 10 * Math.sin(e);
      camera.position.z = 10 * Math.cos(e);
      camera.rotation.x = -e;
      lights.rotation.y = -e; lights.rotation.z = -e;

      if (hubBody) {
        hubBody.quaternion.setFromEuler(camera.rotation.x, 0, 0);
        hubMesh.quaternion.set(hubBody.quaternion.x, hubBody.quaternion.y, hubBody.quaternion.z, hubBody.quaternion.w);
      }
      const rx = camera.rotation.x;
      for (const it of items) {
        force.set(0.02 * Math.sin(t / 10), 0, 0.02 * Math.cos(t / 10));
        point.set(Math.cos(t / 15 + 50), Math.sin(t / 10 + 100), Math.cos(t / 20 + 150));
        it.body.applyLocalForce(force, point);
        if (pressed) { imp.set(mouse.x * pull, Math.cos(rx) * mouse.y * pull, Math.sin(rx) * mouse.y * pull); it.body.applyImpulse(imp, zero); }
        if (it.mat) {
          const k = Math.min(1, Math.pow((1 + Math.sin(pulse * t + it.phase)) / 2, 5));
          it.mat.envMapIntensity = k; it.mat.metalness = k; it.mat.roughness = 1 - 0.9 * k;
        }
      }
      world.step(1 / 60, dt / 1000, 1);
      for (const it of items) {
        it.obj.position.set(it.body.position.x, it.body.position.y, it.body.position.z);
        if (it.obj.isSprite) continue;
        it.obj.quaternion.set(it.body.quaternion.x, it.body.quaternion.y, it.body.quaternion.z, it.body.quaternion.w);
      }
      renderer.render(scene, camera);
      if (!ready && now - t0 >= hold) { ready = true; el.classList.add("is-ready"); }
    }

    if (reduce) {
      // Reduced motion: pre-run only up to the initial push-out and stop as a single frame
      for (let i = 0; i < 240; i++) world.step(1 / 60);
      for (const it of items) { it.obj.position.copy(it.body.position); if (!it.obj.isSprite) it.obj.quaternion.copy(it.body.quaternion); }
      camera.position.set(0, 0, -10); camera.rotation.set(-Math.PI, 0, 0);
      if (hubMesh) hubMesh.quaternion.setFromEuler(eu.set(-Math.PI, 0, 0));
      renderer.render(scene, camera);
      el.classList.add("is-ready");
    } else raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => { fit(); if (reduce) renderer.render(scene, camera); });
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting && !document.hidden; });
    io.observe(el);
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mousedown", onPress);
      document.removeEventListener("mouseup", onRelease);
      document.removeEventListener("touchend", onRelease);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose(); }); });
      env.dispose();
      renderer.dispose();
      canvas.remove();
      el.classList.remove("is-ready");
      el.style.touchAction = "";
    };
  });
})();
