// Floating ball — 1px = Camera is placed at z 2000 so that 1 is one unit, and the field of view is set by board height. Balls sit at fixed spots (ratio of board half-width and half-height)
// Each drifts in a random direction by speed per 1ms, and when it goes beyond ±1.05 it comes back from the opposite side. With look: fixed it becomes a plane attached to the screen and the balls are pushed up by the scroll amount.
(() => {
  const SPOTS = [
    [-0.725, 0.75, 1.5], [-0.85, -0.6, 2.25], [-0.35, -0.3, 1.75], [-0.275, 0.2, 1], [0.075, -0.45, 1.25],
    [0.25, 0.75, 1.6], [0.6, -0.2, 1], [0.8, -0.65, 2.5], [0.9, 0.7, 2], [0.9, 0, 3],
  ];
  kfFx.register("drift-spheres-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !T.WebGLRenderer) return;
    const fixed = options.look === "fixed";
    const count = Math.min(SPOTS.length, +options.count || SPOTS.length);
    const speed = +(options.speed ?? 5e-5);
    const radius = +options.size || 10;
    const follow = +(options.scroll ?? 0.3);
    const DIST = 2000;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-drift-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, canvas }); } catch (e) { canvas.remove(); return; }
    const css = getComputedStyle(el);
    const paint = document.createElement("canvas").getContext("2d");
    const color = (name, fallback) => { paint.fillStyle = (css.getPropertyValue(name).trim() || css.getPropertyValue(fallback).trim()); return new T.Color(paint.fillStyle); };
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 1, DIST * 3);
    camera.position.z = DIST;
    const ambient = new T.AmbientLight(color("--fx-ball", "--kf-accent-soft"), 2.4);
    const key = new T.DirectionalLight(color("--fx-shine", "--kf-on-accent"), 3.2);
    const rim = new T.DirectionalLight(color("--fx-glow", "--kf-accent"), 2.4);
    scene.add(ambient, key, rim);
    const geometry = new T.SphereGeometry(radius, 16, 16);
    const material = new T.MeshPhongMaterial({ color: color("--fx-ball", "--kf-accent-soft"), shininess: 30 });
    const balls = SPOTS.slice(0, count).map(([x, y, s]) => {
      const mesh = new T.Mesh(geometry, material);
      scene.add(mesh);
      return { x, y, s, mesh, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2 };
    });
    const size = { w: 1, h: 1 };
    const resize = () => {
      const r = fixed ? { width: innerWidth, height: innerHeight } : el.getBoundingClientRect();
      size.w = Math.max(1, r.width); size.h = Math.max(1, r.height);
      camera.fov = Math.atan(size.h / 2 / DIST) * 2 * (180 / Math.PI);
      camera.aspect = size.w / size.h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(size.w, size.h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    addEventListener("resize", resize);
    resize();
    const mouse = { x: 0, y: 0 };
    const onMove = (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; };
    if (hover) addEventListener("mousemove", onMove);
    const scroll = { y: scrollY, smooth: scrollY };
    const onScroll = () => { scroll.y = scrollY; };
    if (fixed) addEventListener("scroll", onScroll, { passive: true });
    const wrap = (v) => ((2.1 + ((v + 1.05) % 2.1)) % 2.1) - 1.05;
    const small = () => (innerWidth <= 840 ? 0.5 : 1);
    let raf = 0, last = 0, start = 0;
    const draw = (now) => {
      if (!start) { start = now; last = now; }
      const dt = Math.max(1, now - last);
      last = now;
      const t = now - start;
      scroll.smooth += (scroll.y - scroll.smooth) * (1 - Math.pow(1 - follow, 60 * (dt / 1000)));
      key.position.set(-1 + mouse.x, 1 + mouse.y, 0.5);
      rim.position.set(1 + mouse.x, -1 + mouse.y, 0.5);
      const hw = size.w / 2, hh = size.h / 2;
      balls.forEach((b) => {
        const x = wrap(b.x + t * b.dx * speed);
        const y = wrap(b.y + (fixed ? scroll.smooth / hh : 0) + t * b.dy * speed);
        b.mesh.position.set(x * hw, y * hh, 0);
        b.mesh.scale.setScalar(b.s * small());
      });
      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("mousemove", onMove);
      removeEventListener("scroll", onScroll);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
