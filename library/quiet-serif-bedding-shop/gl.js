// Two scenes newly written with three r152 (same version as the original).
// Gradient circles (original script-common-gradient): twenty discs of radius 1000 (three pale pink to one gray) within the orthographic projection of the panel size
//   Each drifts 2px per frame in its own direction and bounces at ±500, and the size swings between .5 and 5 times by sin(time + offset) × .0095~.01 steps.
//   The disc has an edge that fades via smoothstep from center .1 → .75 radius. Background is cream.
// White tube (original script-common-wave): y of a 100-point curve joining x −60 to 60 = Re-wind a .05 radius tube every frame along amplitude · sin(frequency · 2π · i/100 + seconds).
//   Every 2s a new walking speed is drawn, stepping amplitude · frequency by ±.0025, and the actual value follows that target at a .005 ratio. FOV 75° · z 20.
(() => {
  const NM = window.NM;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const color = (v) => new THREE.Color().setStyle(v);

  const vert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const frag = [
    "uniform vec3 uColor; uniform float uIn; uniform float uOut; varying vec2 vUv;",
    "void main(){ float r = length(vUv - 0.5) / 0.75; float edge = smoothstep(uIn, uOut, r); gl_FragColor = vec4(uColor, 1.0 - edge); }",
  ].join("\n");

  NM.gradient = (box) => {
    if (!window.THREE || !box) return () => {};
    const w = () => box.clientWidth || innerWidth, h = () => box.clientHeight || innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w(), h());
    renderer.setClearColor(color(css("--kf-raised")));
    box.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-w() / 2, w() / 2, h() / 2, -h() / 2, 1, 1000);
    cam.position.z = 500;
    const pink = color(css("--site-mist")), gray = color(css("--site-mist-2"));
    const geo = new THREE.CircleGeometry(1000, 64);
    const blobs = Array.from({ length: 20 }, (_, i) => {
      const mat = new THREE.ShaderMaterial({ transparent: true, vertexShader: vert, fragmentShader: frag, uniforms: { uColor: { value: i % 4 === 3 ? gray : pink }, uIn: { value: 0.1 }, uOut: { value: 0.75 } } });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(Math.random() * w() - w() / 2, Math.random() * h() - h() / 2, 0);
      m.userData = { sx: Math.random() * 5e-4 + 0.0095, sy: Math.random() * 5e-4 + 0.0095, t0: Math.random(), dir: new THREE.Vector2(Math.random() - 0.5, Math.random() - 0.5) };
      scene.add(m);
      return m;
    });
    renderer.compile(scene, cam);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = performance.now() * 0.001;
      for (const b of blobs) {
        const u = b.userData;
        b.position.x += u.dir.x * 2;
        b.position.y += u.dir.y * 2;
        b.scale.x = Math.max(0.5, Math.min(5, b.scale.x + Math.sin(t + u.t0) * u.sx));
        b.scale.y = Math.max(0.5, Math.min(5, b.scale.y + Math.sin(t + u.t0) * u.sy));
        if (b.position.x < -500 || b.position.x > 500) u.dir.x *= -1;
        if (b.position.y < -500 || b.position.y > 500) u.dir.y *= -1;
      }
      renderer.render(scene, cam);
    };
    if (NM.reduced) renderer.render(scene, cam);
    else tick();
    const ro = new ResizeObserver(() => {
      renderer.setSize(w(), h());
      Object.assign(cam, { left: -w() / 2, right: w() / 2, top: h() / 2, bottom: -h() / 2 });
      cam.updateProjectionMatrix();
    });
    ro.observe(box);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); geo.dispose(); };
  };

  NM.wave = (box) => {
    if (!window.THREE || !box) return () => {};
    const w = () => box.clientWidth || innerWidth, h = () => box.clientHeight || 200;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w(), h());
    box.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(75, w() / h(), 0.1, 1000);
    cam.position.z = 20;
    const mat = new THREE.MeshBasicMaterial({ color: color(css("--kf-surface")) });
    let amp = 0.5, ampT = amp, ampV = 0, freq = 1, freqT = freq, freqV = 0, last = Date.now(), tube = null;
    const N = 100;
    const build = () => {
      const pts = Array.from({ length: N }, (_, i) => new THREE.Vector3((i / N) * 120 - 60, amp * Math.sin(((freq * i) / N) * 2 * Math.PI + Date.now() / 1000), 0));
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, 0.05, 8, false);
      if (tube) { tube.geometry.dispose(); tube.geometry = g; } else { tube = new THREE.Mesh(g, mat); scene.add(tube); }
    };
    build();
    renderer.compile(scene, cam);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      build();
      if (Date.now() - last > 2000) { ampV = (Math.random() - 0.5) / 200; freqV = (Math.random() - 0.5) / 200; last = Date.now(); }
      ampT += ampV; freqT += freqV;
      amp += (ampT - amp) * 0.005; freq += (freqT - freq) * 0.005;
      renderer.render(scene, cam);
    };
    if (NM.reduced) renderer.render(scene, cam);
    else tick();
    const ro = new ResizeObserver(() => { renderer.setSize(w(), h()); cam.aspect = w() / h(); cam.updateProjectionMatrix(); });
    ro.observe(box);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); };
  };
})();
