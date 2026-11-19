(() => {
  // Floating objects panel — draws several (default 50) of the same basic shape inside the panel with three.js, each rotating on a random axis and drifting on a sine curve in screen space.
  // Drift range is .5~7 horizontally and vertically and 0~7 in depth, so objects leave the panel and re-enter — the panel becomes a window onto a wider world.
  const VERT = `
    attribute vec4 aRand;
    uniform float uTime;
    uniform float uSpread;
    varying vec3 vNormal;
    mat3 spin(vec3 axis, float a) {
      axis = normalize(axis);
      float s = sin(a), c = cos(a), k = 1.0 - c;
      return mat3(
        k * axis.x * axis.x + c, k * axis.x * axis.y + axis.z * s, k * axis.z * axis.x - axis.y * s,
        k * axis.x * axis.y - axis.z * s, k * axis.y * axis.y + c, k * axis.y * axis.z + axis.x * s,
        k * axis.z * axis.x + axis.y * s, k * axis.y * axis.z - axis.x * s, k * axis.z * axis.z + c);
    }
    void main() {
      mat3 r = spin(aRand.xyz + 0.001, uTime);
      vec3 p = r * (position * (aRand.w * 0.8 + 0.2));
      vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
      float t = uTime * 0.6;
      mv.x += sin(t * aRand.z + 6.2832 * aRand.w) * mix(0.5, 7.0, aRand.x) * uSpread;
      mv.y += sin(t * aRand.y + 6.2832 * aRand.x) * mix(0.5, 7.0, aRand.w) * uSpread;
      mv.z += sin(t * aRand.w + 6.2832 * aRand.y) * mix(0.0, 7.0, aRand.z) * uSpread;
      vNormal = normalize(normalMatrix * mat3(instanceMatrix) * (r * normal));
      gl_Position = projectionMatrix * mv;
    }
  `;
  const FRAG = `
    uniform vec3 uColor;
    uniform vec3 uShade;
    varying vec3 vNormal;
    void main() {
      vec3 n = normalize(vNormal);
      float l = 0.55 + 0.45 * max(dot(n, normalize(vec3(0.4, 0.8, 0.6))), 0.0);
      float rim = pow(1.0 - abs(n.z), 2.0);
      gl_FragColor = vec4(mix(uColor * l, uShade, rim * 0.35), 1.0);
    }
  `;
  const shapes = (T) => ({
    cone: () => new T.ConeGeometry(0.22, 1.4, 14),
    sphere: () => new T.SphereGeometry(0.55, 22, 16),
    arc: () => new T.TorusGeometry(0.85, 0.16, 10, 28, 2.1),
    bottle: () => new T.LatheGeometry([[0, -0.55], [0.26, -0.55], [0.28, -0.4], [0.28, 0.15], [0.12, 0.35], [0.1, 0.62], [0, 0.62]].map(([x, y]) => new T.Vector2(x, y)), 18),
    disc: () => new T.CylinderGeometry(0.42, 0.42, 0.36, 22),
    egg: () => new T.SphereGeometry(0.45, 18, 14).scale(1.25, 0.9, 1),
    ball: () => new T.SphereGeometry(0.42, 22, 16),
    bowl: () => new T.LatheGeometry([[0, -0.3], [0.35, -0.3], [0.55, -0.05], [0.62, 0.25], [0.58, 0.25], [0.5, -0.02], [0, -0.22]].map(([x, y]) => new T.Vector2(x, y)), 22),
  });
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const colorOf = (el, name, T) => {
    const prev = el.style.color;
    el.style.color = `var(${name})`;
    const c = getComputedStyle(el).color;
    el.style.color = prev;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };

  kfFx.register("drift-instances-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    const count = Math.max(1, Math.round(+(options.count || 50)));
    const speed = +(options.speed ?? 1);
    const spread = +(options.spread ?? 1);
    const make = shapes(T)[options.shape] || shapes(T).sphere;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("data-fx-part", "canvas");
    el.append(canvas);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5;
    const geo = make();
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    geo.setAttribute("aRand", new T.InstancedBufferAttribute(rand, 4));
    const mat = new T.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: options.shape === "bowl" ? T.DoubleSide : T.FrontSide,
      uniforms: {
        uTime: { value: Math.random() * 10 },
        uSpread: { value: spread },
        uColor: { value: colorOf(el, options.color || "--fx-drift-color", T) },
        uShade: { value: colorOf(el, options.shade || "--fx-drift-shade", T) },
      },
    });
    const mesh = new T.InstancedMesh(geo, mat, count);
    const o = new T.Object3D();
    for (let i = 0; i < count; i++) {
      o.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    scene.add(mesh);
    // Precompile on attach — compiling on the first frame freezes the screen
    renderer.compile(scene, camera);
    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    let last = 0;
    let raf = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!last) last = now;
      const k = Math.max(1, now - last) / (1000 / 60);
      last = now;
      if (!visible) return;
      mesh.rotation.y += 0.01 * k * speed;
      mat.uniforms.uTime.value += 0.01 * k * speed;
      renderer.render(scene, camera);
    };
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      canvas.remove();
    };
  });
})();
