// Twenty faint glowing discs (three to one, two colors) drift behind the panel (WebGL, three r152) — each disc fades by smoothstep from .1 at the center to .75 radius,
// Each piece drifts in its own direction at speed px (default 2) per frame, bouncing at ±wall px (default 500) from the board center, while its size oscillates between .5~5x by sin(time + offset) × .0095~.01 steps.
// Background is --kf-raised, disc colors are --fx-c1 · --fx-c2 (if missing, a pale --kf-accent-soft · --kf-line). Gradient circles from the Brand product list and brand.
(() => {
  const vert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const frag = "uniform vec3 uColor; varying vec2 vUv; void main(){ float r = length(vUv - 0.5) / 0.75; gl_FragColor = vec4(uColor, 1.0 - smoothstep(0.1, 0.75, r)); }";
  kfFx.register("drift-blob-gl", (el, { options, reduce }) => {
    if (!window.THREE) return;
    const T = window.THREE, cs = getComputedStyle(el);
    const read = (n, alt) => (cs.getPropertyValue(n).trim() || cs.getPropertyValue(alt).trim());
    const col = (v) => { try { return new T.Color().setStyle(v); } catch { return new T.Color(1, 1, 1); } };
    const W = () => el.clientWidth || 1, H = () => el.clientHeight || 1;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(col(read("--fx-bg", "--kf-raised")));
    renderer.domElement.setAttribute("data-fx-part", "canvas");
    el.prepend(renderer.domElement);
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera(-W() / 2, W() / 2, H() / 2, -H() / 2, 1, 1000);
    cam.position.z = 500;
    const c1 = col(read("--fx-c1", "--kf-accent-soft")), c2 = col(read("--fx-c2", "--kf-line"));
    const speed = +(options.speed ?? 2), wall = +(options.wall || 500), count = +(options.count || 20);
    const geo = new T.CircleGeometry(1000, 64);
    const mats = [];
    const blobs = Array.from({ length: count }, (_, i) => {
      const m = new T.ShaderMaterial({ transparent: true, vertexShader: vert, fragmentShader: frag, uniforms: { uColor: { value: i % 4 === 3 ? c2 : c1 } } });
      mats.push(m);
      const b = new T.Mesh(geo, m);
      b.position.set(Math.random() * W() - W() / 2, Math.random() * H() - H() / 2, 0);
      b.userData = { sx: Math.random() * 5e-4 + 0.0095, sy: Math.random() * 5e-4 + 0.0095, t0: Math.random(), dx: Math.random() - 0.5, dy: Math.random() - 0.5 };
      scene.add(b);
      return b;
    });
    renderer.compile(scene, cam);
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const t = performance.now() * 0.001;
      for (const b of blobs) {
        const u = b.userData;
        b.position.x += u.dx * speed;
        b.position.y += u.dy * speed;
        b.scale.x = Math.max(0.5, Math.min(5, b.scale.x + Math.sin(t + u.t0) * u.sx));
        b.scale.y = Math.max(0.5, Math.min(5, b.scale.y + Math.sin(t + u.t0) * u.sy));
        if (Math.abs(b.position.x) > wall) u.dx *= -1;
        if (Math.abs(b.position.y) > wall) u.dy *= -1;
      }
      renderer.render(scene, cam);
    };
    if (reduce) renderer.render(scene, cam);
    else frame();
    const ro = new ResizeObserver(() => {
      renderer.setSize(W(), H());
      Object.assign(cam, { left: -W() / 2, right: W() / 2, top: H() / 2, bottom: -H() / 2 });
      cam.updateProjectionMatrix();
      if (reduce) renderer.render(scene, cam);
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose();
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  });
})();
