// Ten floating kumquat balls — the original three r169 scene rebuilt with the same values.
// 1px = Place the camera at z 2000 so 1 is one unit, and set the field of view from screen height. Each ball heads in its own random direction from a set spot (ratio of half screen width · height)
// Drifts 5e-5 per 1ms, wraps to the opposite side once it passes ±1.05, and is pushed up by the amount the page has scrolled (follows with a .3 delay).
// The two lights shift by the mouse position, so the ball’s bright side turns to follow the mouse. Pages handle it with anSpheres.show/hide/activate/deactivate/clip.
(() => {
  if (!window.THREE) return;
  const css = getComputedStyle(document.documentElement);
  // Even if the skin is written in oklch·color-mix, convert it to sRGB form by canvas paint and hand it over so three can read it
  const paint = document.createElement("canvas").getContext("2d");
  const color = (name) => { paint.fillStyle = css.getPropertyValue(name).trim(); return new THREE.Color(paint.fillStyle); };
  const DIST = 2000;
  const size = { w: innerWidth, h: innerHeight, mobile: innerWidth <= 840 };
  const canvas = document.createElement("canvas");
  canvas.className = "an-webgl";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
  const scene = new THREE.Scene();
  const fov = () => Math.atan(size.h / 2 / DIST) * 2 * (180 / Math.PI);
  const camera = new THREE.PerspectiveCamera(fov(), size.w / size.h, 1, DIST * 3);
  camera.position.z = DIST;
  const resize = () => {
    size.w = innerWidth; size.h = innerHeight; size.mobile = size.w <= 840;
    camera.fov = fov(); camera.aspect = size.w / size.h; camera.updateProjectionMatrix();
    renderer.setSize(size.w, size.h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  };
  resize();
  addEventListener("resize", resize);

  const ambient = new THREE.AmbientLight(color("--kf-accent-soft"), 2.4);
  const light1 = new THREE.DirectionalLight(color("--kf-on-accent"), 3.2);
  const light2 = new THREE.DirectionalLight(color("--kf-accent"), 2.4);
  light1.position.set(-1, 1, 0.5);
  light2.position.set(1, -1, 0.5);
  scene.add(ambient, light1, light2);
  const geometry = new THREE.SphereGeometry(10, 16, 16);
  const material = new THREE.MeshPhongMaterial({ color: color("--kf-accent-soft"), shininess: 30 });

  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (t, dt) => 1 - Math.pow(1 - t, 60 * (dt / 1000));
  const wrap = (min, max, v) => { const n = max - min; return ((n + ((v - min) % n)) % n) + min; };
  const scroll = { y: scrollY, smooth: scrollY };
  addEventListener("scroll", () => { scroll.y = scrollY; }, { passive: true });
  const mouse = { x: 0, y: 0 };
  addEventListener("mousemove", (e) => { mouse.x = (e.clientX / size.w) * 2 - 1; mouse.y = -(e.clientY / size.h) * 2 + 1; });

  const SPOTS = [
    { x: -0.725, y: 0.75, scale: 1.5 }, { x: -0.85, y: -0.6, scale: 2.25 }, { x: -0.35, y: -0.3, scale: 1.75 },
    { x: -0.275, y: 0.2, scale: 1 }, { x: 0.075, y: -0.45, scale: 1.25 }, { x: 0.25, y: 0.75, scale: 1.6 },
    { x: 0.6, y: -0.2, scale: 1 }, { x: 0.8, y: -0.65, scale: 2.5 }, { x: 0.9, y: 0.7, scale: 2 }, { x: 0.9, y: 0, scale: 3 },
  ];
  const state = { scale: 0, frozen: false, tween: null };
  // Edge ball (|x|>.7) shrinks to half size when it goes out, and the inner ball disappears — so the ball looks like it steps aside to the edge between sections
  const balls = SPOTS.map((o) => {
    const mesh = new THREE.Mesh(geometry, material);
    const dir = new THREE.Vector2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    const b = { o, mesh, dir, inner: 1, visible: true, edge: Math.abs(o.x) > 0.7 };
    b.target = () => o.scale * b.inner * (b.visible ? 1 : 0) * (size.mobile ? 0.5 : 1);
    mesh.scale.setScalar(b.target());
    scene.add(mesh);
    return b;
  });

  let last = performance.now(), elapsed = 0;
  const tick = (now) => {
    const dt = Math.max(1, now - last);
    last = now;
    elapsed = now;
    scroll.smooth = lerp(scroll.smooth, scroll.y, damp(0.3, dt));
    light1.position.set(-1 + mouse.x, 1 + mouse.y, 0.5);
    light2.position.set(1 + mouse.x, -1 + mouse.y, 0.5);
    const hw = size.w / 2, hh = size.h / 2;
    balls.forEach((b) => {
      let x = b.o.x + elapsed * b.dir.x * 5e-5;
      let y = b.o.y + (state.frozen ? 0 : scroll.smooth / hh) + elapsed * b.dir.y * 5e-5;
      x = wrap(-1.05, 1.05, x);
      y = wrap(-1.05, 1.05, y);
      b.mesh.position.set(x * hw, y * hh, 0);
      b.mesh.scale.setScalar(lerp(b.mesh.scale.x, b.target(), damp(0.1, dt)) * state.scale);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Ball size change — as in the original, it waits for the preceding change at call time, then runs .5s (power1.out, overwrite). If hide · show are called in succession on the same frame, both wait for the same preceding change so show wins immediately
  const to = async (scale, duration = 0.5) => {
    await state.tween;
    state.tween = gsap.to(state, { scale, duration, overwrite: true });
  };
  window.anSpheres = {
    show: (o = {}) => to(1, o.duration ?? 0.5),
    hide: (o = {}) => to(0, o.duration ?? 0.5),
    activate: () => balls.forEach((b) => { if (b.edge) b.inner = 1; else b.visible = true; }),
    deactivate: () => balls.forEach((b) => { if (b.edge) b.inner = 0.5; else b.visible = false; }),
    // When drawing only inside the hero box — attach the canvas to the document and clip it to that box shape (it scrolls up along with it)
    clip: (rect) => {
      if (!rect) { canvas.style.removeProperty("position"); canvas.style.removeProperty("clip-path"); state.frozen = false; return; }
      canvas.style.position = "absolute";
      canvas.style.clipPath = rect;
      state.frozen = true;
    },
  };
})();
