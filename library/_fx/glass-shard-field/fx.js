(() => {
  // Thin-pressed triangular glass (transmission 1, refraction 1.45, thickness .35) scattered and floating in the plate. Each turns slowly, and flows upward by the amount the plate passes by scroll
  // Rolls up and down, and the whole flock tilts slightly toward the cursor (6% of the remaining difference per frame). The environment is four white light panels baked with PMREM
  kfFx.register("glass-shard-field", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T) return;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    const count = Math.max(1, Math.round(+(options.count ?? 22))), drift = +(options.drift ?? 1.2), spin = +(options.spin ?? 0.4), tilt = +(options.tilt ?? 0.08);
    const cv = renderer.domElement;
    cv.setAttribute("data-fx-part", "gl");
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 12;
    const pm = new T.PMREMGenerator(renderer), env = new T.Scene();
    env.background = new T.Color(0.35, 0.35, 0.4);
    [[8, 3, 0, 6, 2, 4], [3, 8, -7, 0, 1, 2.5], [3, 6, 7, 1, -2, 2], [10, 2, 0, -6, 3, 1.2]].forEach(([w, h, x, y, z, k]) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    });
    const envTex = pm.fromScene(env, 0.03).texture;
    scene.environment = envTex;
    const mat = new T.MeshPhysicalMaterial({ transmission: 1, thickness: 0.35, roughness: 0.04, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, side: T.DoubleSide });
    const group = new T.Group();
    scene.add(group);
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const geos = [];
    for (let i = 0; i < count; i++) {
      const s = new T.Shape(), a = 0.5 + rnd() * 1.4, b = 0.3 + rnd() * 1.2;
      s.moveTo(0, 0); s.lineTo(a, rnd() * 0.4); s.lineTo(rnd() * a * 0.6, b); s.closePath();
      const g = new T.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
      g.center(); geos.push(g);
      const m = new T.Mesh(g, mat);
      m.position.set((rnd() - 0.5) * 16, (rnd() - 0.5) * 12, (rnd() - 0.5) * 5 - 1);
      m.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
      m.userData = { s: (rnd() - 0.5) * spin, y: m.position.y, x: m.position.x };
      group.add(m);
    }
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => { const r = el.getBoundingClientRect(); mouse.tx = (e.clientX - r.left) / r.width - 0.5; mouse.ty = (e.clientY - r.top) / r.height - 0.5; };
    if (hover && !reduce) addEventListener("pointermove", onMove);
    const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    renderer.compile(scene, camera);
    let last = 0;
    const tick = (t) => {
      const dt = last ? Math.min(0.1, Math.max(0.001, t - last)) : 0.016;
      last = t;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
      const p = -r.top / innerHeight;
      group.children.forEach((m, i) => {
        if (!reduce) { m.rotation.x += m.userData.s * dt; m.rotation.y += m.userData.s * 0.7 * dt; }
        m.position.y = (((m.userData.y + p * drift * (1 + (i % 3) * 0.4) + 6) % 12) + 12) % 12 - 6;
        m.position.x = m.userData.x + mouse.x * (0.6 + (i % 4) * 0.2);
      });
      group.rotation.y = mouse.x * tilt; group.rotation.x = mouse.y * tilt * 0.6;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick); ro.disconnect(); removeEventListener("pointermove", onMove);
      geos.forEach((g) => g.dispose()); mat.dispose(); envTex.dispose(); pm.dispose(); renderer.dispose(); cv.remove();
    };
  });
})();
