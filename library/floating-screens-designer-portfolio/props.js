// 3D props between sentences: the original draws GLB models (glasses, skate wheel, basketball, film canister) — rebuilt from basic shapes at the same position and size.
// Positions use the original CSS em coordinates (relative to the sentence font size) as they are. Original values: tilt x-4° y-21° z-4° · rotation .15 rad/s · scroll parallax .15 ·
// Appear 0→1 back.out(1.4) · press spins once around the y-axis in 1s power2.inOut, rises by .4 in size and lands with power4.inOut.
(() => {
  const host = document.querySelector(".teaser__statement");
  if (!host || !window.THREE) return;
  const T = THREE;
  const canvas = host.querySelector(".teaser__canvas");
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const cam = new T.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
  scene.add(new T.HemisphereLight(0xffffff, 0xcfc8c2, 1.5));
  const sun = new T.DirectionalLight(0xffffff, 2.4);
  sun.position.set(-0.4, 0.8, 1);
  scene.add(sun);
  const mat = (color, roughness = 0.5, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });

  // Built at unit size (width 1) and scaled up to screen px
  const glasses = () => {
    const g = new T.Group();
    const red = mat(0xe3342f, 0.3);
    const rim = new T.TorusGeometry(0.19, 0.04, 16, 48);
    const lens = new T.MeshStandardMaterial({ color: 0xffd9d0, transparent: true, opacity: 0.28, roughness: 0.1 });
    [-0.24, 0.24].forEach((x) => {
      const r = new T.Mesh(rim, red); r.position.x = x; r.scale.set(1.05, 0.82, 1); g.add(r);
      const l = new T.Mesh(new T.CircleGeometry(0.18, 32), lens); l.position.x = x; l.scale.set(1.05, 0.82, 1); g.add(l);
      const temple = new T.Mesh(new T.BoxGeometry(0.035, 0.035, 0.55), red); temple.position.set(x * 1.9, 0.06, -0.27); g.add(temple);
    });
    const bridge = new T.Mesh(new T.TorusGeometry(0.06, 0.03, 8, 24, Math.PI), red); bridge.position.y = 0.06; g.add(bridge);
    return { g, k: 0.7 };
  };
  const wheel = () => {
    const g = new T.Group();
    const tire = new T.Mesh(new T.TorusGeometry(0.3, 0.17, 24, 48), mat(0xf2ebe0, 0.6)); g.add(tire);
    const hub = new T.Mesh(new T.CylinderGeometry(0.14, 0.14, 0.3, 32), mat(0x8a5a35, 0.4)); hub.rotation.x = Math.PI / 2; g.add(hub);
    const core = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.32, 16), mat(0x222222, 0.3, 0.6)); core.rotation.x = Math.PI / 2; g.add(core);
    return { g, k: 0.8 };
  };
  const ball = () => {
    const g = new T.Group();
    g.add(new T.Mesh(new T.SphereGeometry(0.5, 48, 32), mat(0x6c63d8, 0.85)));
    const seam = mat(0x1f1a3a, 0.7);
    const ring = (rx, ry, s = 1) => { const m = new T.Mesh(new T.TorusGeometry(0.5 * s, 0.012, 8, 96), seam); m.rotation.set(rx, ry, 0); return m; };
    g.add(ring(Math.PI / 2, 0), ring(0, 0), ring(0, Math.PI / 2));
    [-1, 1].forEach((side) => { const c = ring(0, Math.PI / 2, 0.82); c.position.x = side * 0.29; g.add(c); });
    return { g, k: 0.46 };
  };
  const film = () => {
    const g = new T.Group();
    g.add(new T.Mesh(new T.CylinderGeometry(0.26, 0.26, 0.5, 32), mat(0x1c1c1c, 0.4)));
    g.add(new T.Mesh(new T.CylinderGeometry(0.265, 0.265, 0.3, 32), mat(0xf5c92c, 0.5)));
    const cap = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 0.12, 16), mat(0x9a9a9a, 0.3, 0.7)); cap.position.y = 0.3; g.add(cap);
    return { g, k: 0.8 };
  };

  // Original em coordinates: [x, y, w] (some are anchored to the right on phone)
  const DESK = { glasses: [-2.288, 4.173, 5.135], wheel: [9.019, 2.058, 1.865], ball: [10.087, 7.021, 9.056], film: [-5.479, 11.1, 1.823] };
  const MOB = { glasses: [-1.696, 5.283, 4.63], wheel: [null, -0.87, 1.696, -0.043], ball: [null, 10.552, 8.175, -5.161], film: [-0.737, 10.587, 1.643] };
  const props = { glasses: glasses(), wheel: wheel(), ball: ball(), film: film() };
  const tilt = new T.Euler(-4 * Math.PI / 180, -21 * Math.PI / 180, -4 * Math.PI / 180);
  Object.values(props).forEach((p) => {
    p.pivot = new T.Group();
    p.spin = new T.Group();
    p.spin.add(p.g);
    p.pivot.add(p.spin);
    p.g.rotation.copy(tilt);
    p.hop = { y: 0, ry: 0, s: 1 };
    scene.add(p.pivot);
  });

  let W = 1, H = 1, em = 52, off = { x: 0, y: 0 };
  const layout = () => {
    const r = canvas.getBoundingClientRect();
    const hr = host.getBoundingClientRect();
    W = r.width; H = r.height;
    em = parseFloat(getComputedStyle(host).fontSize);
    off = { x: hr.left - r.left, y: hr.top - r.top };
    renderer.setSize(W, H, false);
    cam.left = 0; cam.right = W; cam.top = 0; cam.bottom = -H; cam.updateProjectionMatrix();
    const set = matchMedia("(max-width: 1023.98px)").matches ? MOB : DESK;
    Object.entries(props).forEach(([name, p]) => {
      const [x, y, w, right] = set[name];
      const size = w * em;
      const left = x === null ? hr.width - (right * em) - size : x * em;
      p.home = { x: off.x + left + size / 2, y: off.y + y * em + size / 2 };
      p.size = size * p.k;
      p.pivot.scale.setScalar(p.size);
    });
  };

  const st = { t: 0, vel: 0, par: 0 };
  const render = () => {
    Object.values(props).forEach((p) => {
      p.pivot.position.set(p.home.x, -(p.home.y + st.par - p.hop.y * p.size), 0);
      p.pivot.scale.setScalar(p.size * p.hop.s);
      p.spin.rotation.y = p.hop.ry;
    });
    renderer.render(scene, cam);
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  layout();
  render();
  addEventListener("resize", () => { layout(); render(); });
  if (reduce.matches) return;

  // Spins more with scroll parallax and speed, normally .15 rad/s
  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  let lastY = scrollY;
  gsap.ticker.add((time, dt) => {
    if (!visible) return;
    const s = dt / 1000;
    st.vel = gsap.utils.interpolate(st.vel, scrollY - lastY, 0.1);
    lastY = scrollY;
    const hr = host.getBoundingClientRect();
    st.par = -(hr.top + hr.height / 2 - innerHeight / 2) * 0.15;
    props.ball.spin.rotation.x += (0.15 + Math.abs(st.vel) * 0.02) * s;
    props.wheel.spin.rotation.z -= (0.15 + st.vel * 0.03) * s;
    props.glasses.spin.rotation.z = Math.sin(time * 0.8) * 0.06 + st.vel * 0.004;
    props.film.spin.rotation.x += 0.15 * s;
    render();
  });

  // Entrance
  Object.values(props).forEach((p) => (p.hop.s = 0));
  ScrollTrigger.create({
    trigger: host, start: "top 80%", once: true,
    onEnter: () => gsap.to(Object.values(props).map((p) => p.hop), { s: 1, duration: 0.9, ease: "back.out(1.4)", stagger: 0.1 }),
  });

  // Flips once on press
  const ray = new T.Raycaster();
  host.closest("section").addEventListener("click", (e) => {
    const r = canvas.getBoundingClientRect();
    const p = new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(p, cam);
    const hit = ray.intersectObjects(scene.children, true)[0];
    if (!hit) return;
    const prop = Object.values(props).find((q) => { let o = hit.object; while (o) { if (o === q.pivot) return true; o = o.parent; } return false; });
    if (!prop || gsap.isTweening(prop.hop)) return;
    gsap.timeline()
      .to(prop.hop, { ry: "+=" + Math.PI * 2, duration: 1, ease: "power2.inOut" }, 0)
      .to(prop.hop, { y: 0.4, duration: 0.45, ease: "power2.out" }, 0.15)
      .to(prop.hop, { y: 0, duration: 0.55, ease: "power4.inOut" }, 0.6);
  });
  host.closest("section").addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), cam);
    host.closest("section").style.cursor = ray.intersectObjects(scene.children, true).length ? "pointer" : "";
  });
  document.fonts.ready.then(layout);
  window.IM && IM.ready.then(() => setTimeout(layout, 50));
})();
