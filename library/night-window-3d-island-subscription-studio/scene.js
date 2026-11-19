// Rebuild the two 3D scenes with our own shapes (the original models and shaders are not used).
// Island: grass and a puddle on a lump of earth, the logo’s two diagonals stand as stone pillars (x ±.55, z tilt −.38). Tilts toward the cursor (horizontal ±.11 · vertical ±.07rad,
// each frame takes a 1−.945^(60dt) share), and on its own it sways with .018sin(.25t)·.012cos(.3t) and floats with .025sin(.45t). On entering, z 6.4→0 over 1.6s easeOutQuart.
//     When the cursor touches a stone pillar, moss grains grow and remain at the touched spot (original: moss, ferns and flowers grow).
// Conveyor: isometric camera yaw 28°, pitch 16°, fov 18, mouse horizontal −4° and vertical 3° (.05 share), rotates ±5° with scroll. Boxes flow along the belt.
(() => {
  const T = window.THREE;
  if (!T) return;
  const SQ3D = (window.SQ3D = {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i");
  probe.hidden = true;
  document.body.append(probe);
  // CSS variables (colors made from the skin) to three colors
  const color = (v) => {
    probe.style.color = `var(${v})`;
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(probe).color;
    pix.fillRect(0, 0, 1, 1);
    const [r, g, b] = pix.getImageData(0, 0, 1, 1).data;
    return new T.Color(r / 255, g / 255, b / 255);
  };
  const renderer = (canvas) => {
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    r.setClearColor(0, 0);
    r.outputColorSpace = T.SRGBColorSpace;
    return r;
  };
  const live = (el, cb) => { let on = true; new IntersectionObserver(([e]) => { on = e.isIntersecting; cb?.(on); }).observe(el); return () => on; };

  /* ---------- Stone Pillar Island ---------- */
  SQ3D.island = (canvas, { intro = true } = {}) => {
    const gl = renderer(canvas);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(30, 1, 0.1, 60);
    cam.position.set(0, 1.6, 9.5);
    cam.lookAt(0, 0.1, 0);
    scene.add(new T.HemisphereLight(color("--site-stone-hi"), color("--site-earth"), 1.4));
    const sun = new T.DirectionalLight(color("--site-stone-hi"), 2.2);
    sun.position.set(-3, 6, 4);
    scene.add(sun);
    const rim = new T.DirectionalLight(color("--site-water"), 1.2);
    rim.position.set(4, 2, -4);
    scene.add(rim);
    const root = new T.Group(), isle = new T.Group();
    root.add(isle);
    scene.add(root);
    const mat = (v, o = {}) => new T.MeshStandardMaterial({ color: color(v), roughness: 0.9, metalness: 0, ...o });
    // Dirt mound + grass + water puddle (right front corner)
    const earth = new T.Mesh(new T.BoxGeometry(3, 0.9, 3), mat("--site-earth"));
    earth.position.y = -0.85;
    const grass = new T.Mesh(new T.BoxGeometry(3.02, 0.14, 3.02), mat("--site-grass"));
    grass.position.y = -0.36;
    const water = new T.Mesh(new T.BoxGeometry(1.5, 0.16, 1.5), mat("--site-water", { roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.92 }));
    water.position.set(0.77, -0.35, 0.77);
    isle.add(earth, grass, water);
    // Grass blade — our shader: brighter toward the tip and sways in the wind
    const bladeMat = new T.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uLo: { value: color("--site-grass") }, uHi: { value: color("--site-moss") } },
      vertexShader: "uniform float uTime; varying float vH; void main(){ vec4 w = instanceMatrix * vec4(position,1.); vH = position.y; float s = sin(uTime*1.3 + w.x*2. + w.z*1.7) * .06 * position.y; w.x += s; w.z += s*.6; gl_Position = projectionMatrix * modelViewMatrix * w; }",
      fragmentShader: "uniform vec3 uLo; uniform vec3 uHi; varying float vH; void main(){ gl_FragColor = vec4(mix(uLo, uHi, clamp(vH/.25,0.,1.)), 1.); }",
      side: T.DoubleSide,
    });
    const blades = new T.InstancedMesh(new T.ConeGeometry(0.02, 0.25, 3).translate(0, 0.125, 0), bladeMat, 420);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), v3 = new T.Vector3(), s3 = new T.Vector3();
    let n = 0;
    for (let i = 0; i < 900 && n < 420; i++) {
      const x = (Math.random() - 0.5) * 2.9, z = (Math.random() - 0.5) * 2.9;
      if (x > 0 && z > 0) continue;
      const k = 0.6 + Math.random() * 0.8;
      m4.compose(v3.set(x, -0.29, z), q.setFromAxisAngle(new T.Vector3(0, 1, 0), Math.random() * 6), s3.set(k, k, k));
      blades.setMatrixAt(n++, m4);
    }
    blades.count = n;
    isle.add(blades);
    // Two diagonal stone pillars
    const stone = mat("--site-stone", { roughness: 1 });
    const beams = [-0.55, 0.55].map((x) => {
      const g = new T.Group();
      g.position.set(x - 0.15, 0.85, -0.2);
      g.rotation.z = -0.38;
      const m = new T.Mesh(new T.BoxGeometry(0.46, 2.6, 0.5), stone);
      g.add(m);
      isle.add(g);
      return m;
    });
    // Light beams (panels slanting down from above)
    const beam = new T.Mesh(new T.PlaneGeometry(2.8, 13), new T.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uA: { value: 0 }, uC: { value: color("--site-stone-hi") } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: "uniform float uA; uniform vec3 uC; varying vec2 vUv; float b(float c,float w){ return 1. - smoothstep(0.,1.,abs(vUv.x-c)/w); } void main(){ float o = (b(.4,.19) + b(.68,.12)*.24) * smoothstep(.05,.85,vUv.y); gl_FragColor = vec4(uC, o * uA * .14); }",
    }));
    beam.position.set(0.5, 0.9, -1.6);
    beam.rotation.z = 0.52;
    scene.add(beam);
    // Moss grains — grow wherever the cursor touches the stone pillars
    const MAX = 360, moss = new T.InstancedMesh(new T.IcosahedronGeometry(0.05, 0), mat("--site-moss", { flatShading: true }), MAX);
    moss.count = 0;
    isle.add(moss);
    const grows = [];
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    let aim = false, tx = 0, ty = 0, w = 0, h = 0;
    const fit = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      if (!w || !h) return;
      gl.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      const s = Math.min(1, (w / h) * 0.72);
      root.scale.setScalar(s);
    };
    new ResizeObserver(fit).observe(canvas);
    fit();
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      tx = 2 * gsap.utils.clamp(-0.5, 0.5, (e.clientX - (r.left + r.width / 2)) / innerWidth) * 0.11;
      ty = 2 * gsap.utils.clamp(-0.5, 0.5, (e.clientY - (r.top + r.height / 2)) / innerHeight) * 0.07;
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      aim = Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1;
    };
    addEventListener("pointermove", move, { passive: true });
    const seen = live(canvas);
    const up = { x: 0 };
    let start = null, t = 0, last = performance.now(), spawnAt = 0;
    gl.compile(scene, cam);
    const go = () => { start = performance.now(); };
    if (!intro || reduced) { up.x = 1; start = 0; }
    else if (window.SQ?.introDone) go(); else addEventListener("sq:intro-done", go, { once: true });
    const frame = (now) => {
      requestAnimationFrame(frame);
      const dt = Math.min(Math.max(1, now - last) / 1000, 0.05);
      last = now;
      if (!seen() || document.hidden) return;
      t += dt;
      if (start !== null && up.x < 1) { const k = Math.min((now - start) / 1600, 1); up.x = 1 - Math.pow(1 - k, 4); }
      const x = reduced ? 1 : up.x;
      isle.position.z = (1 - x) * 6.4;
      beam.material.uniforms.uA.value = x;
      bladeMat.uniforms.uTime.value = t;
      const f = 1 - Math.pow(0.945, 60 * dt);
      root.rotation.y += ((tx + 0.018 * Math.sin(0.25 * t)) * x - root.rotation.y) * f;
      root.rotation.x += ((ty + 0.012 * Math.cos(0.3 * t)) * x - root.rotation.x) * f;
      root.position.y = 0.025 * Math.sin(0.45 * t);
      beam.position.x = 0.5 + 0.025 * Math.sin(0.12 * t);
      if (aim && x > 0.65 && now - spawnAt > 40 && moss.count < MAX) {
        ray.setFromCamera(ndc, cam);
        const hit = ray.intersectObjects(beams, false)[0];
        if (hit) {
          spawnAt = now;
          const p = isle.worldToLocal(hit.point.clone()).add(new T.Vector3((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12));
          grows.push({ i: moss.count++, p, born: t, k: 0.6 + Math.random() * 0.9 });
        }
      }
      for (const g of grows) {
        const a = Math.min(1, (t - g.born) / 0.4);
        const k = g.k * (1 - Math.pow(1 - a, 3));
        m4.compose(g.p, q.identity(), s3.set(k, k, k));
        moss.setMatrixAt(g.i, m4);
      }
      if (grows.length) moss.instanceMatrix.needsUpdate = true;
      gl.render(scene, cam);
    };
    requestAnimationFrame(frame);
    requestAnimationFrame(() => dispatchEvent(new Event("sq:hero-ready")));
  };

  /* ---------- Conveyor ---------- */
  SQ3D.conveyor = (canvas, bubble) => {
    const gl = renderer(canvas);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(18, 1, 0.1, 80);
    scene.add(new T.HemisphereLight(color("--site-stone-hi"), color("--site-stone"), 1.6));
    const sun = new T.DirectionalLight(color("--site-stone-hi"), 2.3);
    sun.position.set(1.2, 5, -2.2);
    scene.add(sun);
    const mat = (v, o = {}) => new T.MeshStandardMaterial({ color: color(v), roughness: 0.8, ...o });
    const belt = new T.Group();
    scene.add(belt);
    const top = new T.Mesh(new T.BoxGeometry(9, 0.08, 0.9), mat("--site-body"));
    top.position.y = 0.6;
    belt.add(top);
    for (let i = 0; i < 6; i++) {
      const leg = new T.Mesh(new T.BoxGeometry(0.06, 0.6, 0.06), mat("--site-body"));
      leg.position.set(-4 + i * 1.6, 0.3, 0.38);
      belt.add(leg);
    }
    // White machine on the left, stone arch in the center
    const box = new T.Mesh(new T.BoxGeometry(1, 1.15, 1), mat("--site-stone-hi"));
    box.position.set(-4.1, 1.2, 0);
    const eye = new T.Mesh(new T.BoxGeometry(0.02, 0.1, 0.34), mat("--site-water", { emissive: color("--site-water"), emissiveIntensity: 0.6 }));
    eye.position.set(-3.59, 1.35, 0);
    belt.add(box, eye);
    const arch = new T.Group();
    [[-0.5, 0.85], [0.5, 0.85]].forEach(([z]) => { const p = new T.Mesh(new T.BoxGeometry(0.16, 0.9, 0.16), mat("--site-stone")); p.position.set(-1.7, 1.08, z); arch.add(p); });
    const lintel = new T.Mesh(new T.BoxGeometry(0.2, 0.16, 1.2), mat("--site-stone"));
    lintel.position.set(-1.7, 1.55, 0);
    arch.add(lintel);
    belt.add(arch);
    // Square mascot: stone square head + black body
    const sqm = new T.Group();
    const head = new T.Mesh(new T.BoxGeometry(0.55, 0.55, 0.55), mat("--site-stone", { roughness: 1 }));
    head.position.y = 1.55;
    const body = new T.Mesh(new T.BoxGeometry(0.34, 0.45, 0.26), mat("--site-body"));
    body.position.y = 1.05;
    const scarf = new T.Mesh(new T.BoxGeometry(0.38, 0.08, 0.3), mat("--kf-accent"));
    scarf.position.y = 1.26;
    const eyes = [-0.1, 0.1].map((z) => { const e = new T.Mesh(new T.SphereGeometry(0.028, 8, 8), new T.MeshBasicMaterial({ color: color("--site-eye") })); e.position.set(0.28, 1.6, z); return e; });
    sqm.add(head, body, scarf, ...eyes);
    sqm.position.set(0.1, 0, -0.75);
    scene.add(sqm);
    // Objects flowing along the strip (box, screen, camera, dice)
    const kinds = ["--site-stone", "--site-moss", "--kf-accent", "--site-stone-hi", "--site-body", "--site-water"];
    const goods = Array.from({ length: 9 }, (_, i) => {
      const s = 0.18 + (i % 3) * 0.06;
      const m = new T.Mesh(new T.BoxGeometry(s * (i % 2 ? 1.4 : 1), s, s), mat(kinds[i % kinds.length]));
      m.userData.x = -3.4 + i * 0.95;
      m.position.set(m.userData.x, 0.64 + s / 2, 0);
      scene.add(m);
      return m;
    });
    let w = 0, h = 0, mx = 0, my = 0, bx = 0, by = 0;
    const fit = () => { w = canvas.clientWidth; h = canvas.clientHeight; if (!w || !h) return; gl.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(fit).observe(canvas);
    fit();
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    canvas.addEventListener("pointerdown", (e) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      if (ray.intersectObjects([head, body], false)[0] && bubble) {
        bubble.classList.add("is-on");
        clearTimeout(bubble._t);
        bubble._t = setTimeout(() => bubble.classList.remove("is-on"), 7000);
      }
    });
    const seen = live(canvas);
    gl.compile(scene, cam);
    let last = performance.now(), t = 0;
    const v = new T.Vector3();
    const frame = (now) => {
      requestAnimationFrame(frame);
      const dt = Math.min(Math.max(1, now - last) / 1000, 0.05);
      last = now;
      if (!seen() || document.hidden || !w) return;
      t += dt;
      bx += (mx - bx) * 0.05; by += (my - by) * 0.05;
      const r = canvas.getBoundingClientRect();
      const o = gsap.utils.clamp(0, 1, 1 - (r.top + r.height) / (innerHeight + r.height));
      const yaw = T.MathUtils.degToRad(28 + 10 * (o - 0.5) - 4 * bx), pitch = T.MathUtils.degToRad(16 + 3 * by);
      const dist = cam.aspect < 1 ? 26 : 22;
      cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist + 0.8, Math.cos(yaw) * Math.cos(pitch) * dist);
      cam.lookAt(v.set(0, 0.9, 0));
      if (!reduced) goods.forEach((g) => { g.userData.x += dt * 0.55; if (g.userData.x > 4.3) g.userData.x -= 8.55; g.position.x = g.userData.x; g.visible = g.userData.x > -3.55; });
      head.rotation.y = Math.sin(t * 0.8) * 0.12;
      gl.render(scene, cam);
    };
    requestAnimationFrame(frame);
  };

  // Hooks onto the canvas placed on the page — only performs the intro where the Hero island enters. The Footer island is set up when it gets close (the original also only shows it near the screen)
  document.querySelectorAll("canvas[data-island]").forEach((c) => {
    if (c.dataset.island === "hero") { SQ3D.island(c, { intro: true }); return; }
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); SQ3D.island(c, { intro: false }); } }, { rootMargin: "50% 0px" }).observe(c);
  });
  document.querySelectorAll("canvas[data-conveyor]").forEach((c) => SQ3D.conveyor(c, document.querySelector(c.dataset.conveyor)));
})();
