(() => {
  // Lays a wave terrain drawn with thick grid lines behind the plate. The plate heaves with noise (time × speed) and a shader draws grid lines over it.
  // As the panel passes through the screen the terrain approaches the camera (z from→to) and fades, tilting very slowly toward the cursor
  const NOISE = `vec2 hsh(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1. + 2. * fract(sin(p) * 43758.5453); }
  float gnoise(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6. - 15.) + 10.);
    return mix(mix(dot(hsh(i), f), dot(hsh(i + vec2(1, 0)), f - vec2(1, 0)), u.x), mix(dot(hsh(i + vec2(0, 1)), f - vec2(0, 1)), dot(hsh(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y); }`;
  kfFx.register("wave-grid-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T) return;
    const cells = +options.cells || 44, amp = +(options.amp ?? .5), speed = +(options.speed ?? .1), freq = +(options.freq ?? 1.6);
    const zFrom = +(options.from ?? -10), zTo = +(options.to ?? 7), fade = +(options.fade ?? 1), lean = +(options.lean ?? .06);
    const cv = document.createElement("canvas");
    cv.className = "fx-wave-grid-canvas";
    cv.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
    el.prepend(cv);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, .1, 200);
    cam.position.z = 13;
    const color = () => { const v = getComputedStyle(el).getPropertyValue("--kf-line").trim(); return v ? new T.Color(v) : new T.Color(.33, .33, .35); };
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uColor: { value: color() }, uAmp: { value: amp }, uFreq: { value: freq }, uCells: { value: cells } },
      vertexShader: `uniform float uTime, uAmp, uFreq; varying vec2 vUv; varying float vFog; ${NOISE}
        void main(){ vUv = uv; vec3 p = position; p.y += gnoise(vec2(p.z * uFreq + uTime, p.x * uFreq + uTime)) * uAmp;
          vec4 mv = modelViewMatrix * vec4(p, 1.); vFog = smoothstep(32., 6., -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uOpacity, uCells; uniform vec3 uColor; varying vec2 vUv; varying float vFog;
        void main(){ vec2 g = vUv * uCells; vec2 d = abs(fract(g - .5) - .5) / fwidth(g); float line = 1. - min(min(d.x, d.y) / 1.6, 1.);
          float a = line * uOpacity * vFog; if (a < .01) discard; gl_FragColor = vec4(uColor, a); }`,
    });
    const geo = new T.PlaneGeometry(2, 2, 160, 160);
    geo.rotateX(-Math.PI / 2);
    const group = new T.Group(), pivot = new T.Group();
    pivot.rotation.set(Math.PI / 12, Math.PI / 4, 0);
    pivot.scale.setScalar(+(options.scale ?? 10.648));
    pivot.add(new T.Mesh(geo, mat));
    group.add(pivot);
    scene.add(group);
    renderer.compile(scene, cam);

    let raf = 0, seen = false, mx = 0, my = 0;
    const size = () => {
      const r = el.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    };
    const move = (e) => { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight * 2 - 1); };
    const frame = (now) => {
      raf = seen ? requestAnimationFrame(frame) : 0;
      const r = el.getBoundingClientRect();
      // After the panel top touches the screen top, goes 0→1 while scrolling by the panel height
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
      group.position.z = zFrom + (zTo - zFrom) * (reduce ? 0 : 1 - (1 - p) * (1 - p));
      mat.uniforms.uOpacity.value = 1 - fade * p;
      mat.uniforms.uTime.value = reduce ? 0 : now / 1000 * speed;
      group.rotation.y += (mx * lean - group.rotation.y) * .01;
      group.rotation.x += (-my * lean - group.rotation.x) * .01;
      renderer.render(scene, cam);
    };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(frame); });
    io.observe(el);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    if (hover) addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      removeEventListener("pointermove", move);
      geo.dispose(); mat.dispose(); renderer.dispose(); cv.remove();
    };
  });
})();
