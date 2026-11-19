// Hero chrome objects: the original uses GLB models (chrome sparrow, quill, bell tower). Here three basic shapes give the same position, size and gloss.
// Original values: camera z 9.2 · one turn on the Y axis 7s linear repeat · pointer tilt x (vertical-.5)*.35 / y (horizontal-.5)*.6 followed over .9s power3 ·
// Rotation accelerates by the scroll speed (max 1.4, released over 1.2s) · up-down sway sin(t/900)*.06
window.SXChrome = (host, kind) => {
  if (!window.THREE || !host) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  host.append(R.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  cam.position.set(0, 0, 9.2);

  // Surroundings the chrome reflects: bright sky on top, dark green band in the middle, floor reflection below
  const env = document.createElement("canvas");
  env.width = 512; env.height = 256;
  const g = env.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 256);
  const rgb = (css) => `rgb(${SX.color(css).map((v) => Math.round(v * 255)).join(",")})`;
  grd.addColorStop(0, rgb("var(--kf-surface)")); grd.addColorStop(0.35, rgb("color-mix(in srgb, var(--kf-accent) 20%, var(--kf-surface))")); grd.addColorStop(0.5, rgb("var(--kf-accent)"));
  grd.addColorStop(0.62, rgb("color-mix(in srgb, var(--kf-accent) 88%, var(--kf-surface))")); grd.addColorStop(1, rgb("var(--kf-raised)"));
  g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
  g.fillStyle = rgb("var(--kf-surface)");
  [[80, 60, 60], [300, 40, 90], [430, 90, 40]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2); g.fill(); });
  const envTex = new THREE.CanvasTexture(env);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(R);
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color().setRGB(...SX.color("oklch(from var(--kf-accent) calc(l + 0.621) calc(c * 1.099) calc(h - 6.8))"), THREE.SRGBColorSpace), 1.2); rim.position.set(-4, 1, -3); scene.add(rim);

  const chrome = new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 1, roughness: 0.16 });
  const pivot = new THREE.Group(), obj = new THREE.Group();
  pivot.add(obj); scene.add(pivot);
  const mesh = (geo, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, chrome); m.position.set(x, y, z); obj.add(m); return m; };

  // Sparrow: round body, head, short beak, tail, with two wings held up in a V
  const bird = (s = 1, at = new THREE.Vector3()) => {
    const grp = new THREE.Group();
    const add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, chrome); m.position.set(x, y, z); grp.add(m); return m; };
    add(new THREE.SphereGeometry(0.62, 48, 32), 0, 0, 0).scale.set(1.25, 0.9, 0.85);
    add(new THREE.SphereGeometry(0.38, 40, 28), 0.72, 0.42, 0);
    const beak = add(new THREE.ConeGeometry(0.11, 0.32, 24), 1.12, 0.38, 0);
    beak.rotation.z = -Math.PI / 2;
    const tail = add(new THREE.BoxGeometry(0.7, 0.08, 0.42), -0.95, 0.18, 0);
    tail.rotation.z = 0.5;
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0); wingShape.bezierCurveTo(0.2, 0.7, 0.6, 1.3, 1.2, 1.55);
    wingShape.bezierCurveTo(0.95, 1.05, 0.8, 0.55, 0.62, 0); wingShape.lineTo(0, 0);
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 4, curveSegments: 24 });
    [1, -1].forEach((sd) => {
      const w = new THREE.Mesh(wingGeo, chrome);
      w.position.set(-0.35, 0.25, 0.28 * sd);
      w.rotation.set(sd * 0.55, 0, 0.25);
      grp.add(w);
    });
    grp.scale.setScalar(s);
    grp.position.copy(at);
    obj.add(grp);
    return grp;
  };

  let size = 1.6;
  if (kind === "bird") {
    bird(0.9, new THREE.Vector3(0, -0.9, 0));
    size = 3.4;
  } else if (kind === "quill") {
    // Quill pen: a leaf-shaped feather set at a slant with a curly stem below
    const leaf = new THREE.Shape();
    leaf.moveTo(0, 0); leaf.bezierCurveTo(0.55, 0.6, 0.6, 1.7, 0, 2.6); leaf.bezierCurveTo(-0.6, 1.7, -0.55, 0.6, 0, 0);
    const lg = new THREE.ExtrudeGeometry(leaf, { depth: 0.05, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 32 });
    const l = mesh(lg, 0.2, -0.3, 0);
    l.rotation.z = -0.62;
    const pts = [];
    for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push(new THREE.Vector3(-0.1 - t * 2.1, -0.3 - Math.sin(t * Math.PI * 2.2) * 0.35 - t * 0.6, Math.cos(t * 6) * 0.1)); }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.035, 10, false));
    size = 1.5;
  } else if (kind === "tower") {
    // Bell tower: base, three-tier body, spire, with a small sparrow on top
    mesh(new THREE.BoxGeometry(1.7, 0.18, 1.1), 0, -2.05, 0);
    mesh(new THREE.BoxGeometry(1.1, 1.5, 0.9), 0, -1.2, 0);
    mesh(new THREE.BoxGeometry(0.85, 0.9, 0.75), 0, -0.02, 0);
    [-0.25, 0.25].forEach((x) => mesh(new THREE.BoxGeometry(0.16, 0.5, 0.05), x, -0.05, 0.4));
    mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.6, 8), 0, 0.72, 0);
    mesh(new THREE.ConeGeometry(0.34, 1.2, 8), 0, 1.6, 0);
    bird(0.32, new THREE.Vector3(0, 2.38, 0));
    size = 2.3;
  }

  const st = { spin: 0, tx: 0, ty: 0, boost: 0 };
  let W = 0, H = 0;
  const fit = () => {
    W = host.clientWidth; H = host.clientHeight;
    if (!W || !H) return;
    R.setSize(W, H, false);
    cam.aspect = W / H;
    // Adjust the distance so objects aren’t cropped on portrait screens
    cam.position.z = Math.max(9.2, (size * 2.2) / Math.tan((cam.fov * Math.PI) / 360) / Math.min(1, cam.aspect) / 2);
    cam.updateProjectionMatrix();
  };
  fit();
  new ResizeObserver(fit).observe(host);

  let visible = true;
  new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(host);
  if (!reduced) {
    gsap.to(st, { spin: Math.PI * 2, duration: 7, ease: "none", repeat: -1 });
    const qx = gsap.quickTo(st, "tx", { duration: 0.9, ease: "power3" }), qy = gsap.quickTo(st, "ty", { duration: 0.9, ease: "power3" });
    addEventListener("pointermove", (e) => { qx((e.clientY / innerHeight - 0.5) * 0.35); qy((e.clientX / innerWidth - 0.5) * 0.6); }, { passive: true });
    let ly = scrollY;
    addEventListener("scroll", () => {
      const d = Math.abs(scrollY - ly); ly = scrollY;
      gsap.to(st, { boost: Math.min(d * 0.012, 1.4), duration: 0.25, overwrite: "auto", onComplete: () => gsap.to(st, { boost: 0, duration: 1.2, ease: "power2.out" }) });
    }, { passive: true });
  } else st.spin = -0.5;
  let extra = 0, last = performance.now();
  const frame = (t) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!visible) return;
    extra += st.boost * dt * 6;
    pivot.rotation.set(st.tx, st.spin + extra + st.ty, 0);
    obj.position.y = reduced ? 0 : Math.sin(t / 900) * 0.06;
    R.render(scene, cam);
  };
  requestAnimationFrame(frame);
};
