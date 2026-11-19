(() => {
  // three.js single stage = One canvas. Draws only while visible on screen (IntersectionObserver).
  // Compile the shader at setup — compiling for the first time on first scroll freezes the screen.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stages = [];

  window.twStage = (host, opts = {}) => {
    if (!window.THREE || !host) return null;
    const canvas = document.createElement("canvas");
    canvas.className = "tw-stage__canvas";
    host.appendChild(canvas);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      host.classList.add("is-no-gl");
      return null;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.dpr || 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = opts.ortho
      ? new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 4000)
      : new THREE.PerspectiveCamera(opts.fov || 30, 1, 0.1, 200);
    camera.position.set(...(opts.camera || [0, 0, 20]));
    camera.lookAt(0, 0, 0);
    const st = { host, canvas, renderer, scene, camera, visible: false, w: 1, h: 1, tick: null, t: 0, ortho: !!opts.ortho, zoom: opts.zoom || 10 };

    const size = () => {
      const r = host.getBoundingClientRect();
      st.w = Math.max(1, r.width); st.h = Math.max(1, r.height);
      renderer.setSize(st.w, st.h, false);
      if (st.ortho) {
        const a = st.w / st.h, z = opts.pixel ? st.h / 2 : st.zoom;
        Object.assign(camera, { left: -z * a, right: z * a, top: z, bottom: -z });
      } else camera.aspect = st.w / st.h;
      camera.updateProjectionMatrix();
      st.render();
    };
    st.render = () => renderer.render(scene, camera);
    st.light = () => {
      scene.add(new THREE.HemisphereLight(window.twThreeColor("--kf-raised"), window.twThreeColor("--kf-dim"), 1.6));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(4, 8, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(-6, -2, 4);
      scene.add(rim);
    };
    new ResizeObserver(size).observe(host);
    new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; }, { rootMargin: "200px" }).observe(host);
    size();
    stages.push(st);
    st.ready = () => { renderer.compile(scene, camera); st.render(); };
    return st;
  };

  // Color [r,g,b] (0~1) → THREE.Color, read from skin variables
  window.twThreeColor = (name) => {
    const [r, g, b] = window.twColor(name);
    return new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
  };

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    for (const st of stages) {
      if (!st.visible) continue;
      st.t += reduce ? 0 : dt;
      st.tick && st.tick(st.t, dt);
      st.render();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
