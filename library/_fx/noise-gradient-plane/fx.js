(() => {
  // A large wave plane (three.js) is laid tilted behind the panel and mixes three colors with noise — vertices are pushed 20 forward, back and sideways by the noise, wrinkling,
  // Color blends c1, c2, c3 with two noises (a slow one and one twice as fine), then wraps the horizontal edges in c3. Time moves along a circle that completes one lap in 180 seconds, so it ripples endlessly.
  // Changing options c1 · c2 · c3 (editing the attribute) makes the color flow to the new one by speed every frame. At first it turns on from transparent over fade seconds
  const three = () => (window.THREE ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  const NAME = "noise-gradient-plane";
  kfFx.register(NAME, (el, ctx) => {
    let off = null, gone = false;
    three().then((T) => { if (!gone && el.isConnected) off = build(el, ctx, T); });
    return () => { gone = true; off?.(); };
  });

  const VERT = `
    uniform vec2 uDrift;
    varying vec2 vUv;
    varying float vBend;
    void main() {
      vUv = uv;
      vBend = fxSimplex(vUv.xx * 4.0 + uDrift * 0.5);
      float side = fxSimplex(vUv.yy * 3.0 - uDrift * 0.2);
      vec3 p = position;
      p.z += vBend * uAmp;
      p.x += side * uAmp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = `
    uniform vec3 uC1, uC2, uC3;
    uniform float uPhase;
    varying vec2 vUv;
    varying float vBend;
    void main() {
      float slow = fxSimplex(vUv + uPhase * 0.15);
      float fine = fxSimplex(vUv * 2.0 + uPhase * 0.04);
      vec3 col = mix(uC2, uC1, slow * 0.6);
      col = mix(col, uC3, fine * 0.4);
      col = mix(col, mix(uC2, uC1, vUv.x), vBend);
      col = mix(col, uC3, 1.0 - smoothstep(0.1, 0.9, vUv.x));
      gl_FragColor = vec4(col, 1.0);
    }`;
  // 2D simplex noise — adds hashed gradients at the three corners of a triangular grid with 4th-power falloff (values roughly -1~1)
  const NOISE = `
    uniform float uAmp;
    vec2 fxGrad(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }
    float fxSimplex(vec2 p) {
      const float K1 = 0.366025404, K2 = 0.211324865;
      vec2 i = floor(p + (p.x + p.y) * K1);
      vec2 a = p - i + (i.x + i.y) * K2;
      float m = step(a.y, a.x);
      vec2 o = vec2(m, 1.0 - m);
      vec2 b = a - o + K2;
      vec2 c = a - 1.0 + 2.0 * K2;
      vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
      vec3 n = h * h * h * h * vec3(dot(a, fxGrad(i)), dot(b, fxGrad(i + o)), dot(c, fxGrad(i + 1.0)));
      return dot(n, vec3(70.0));
    }`;

  function build(el, { options, reduce }, T) {
    if (!T) return null;
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.append(probe);
    // A skin variable may be an oklch relative color — paint it on a one-cell canvas and convert to 0~1 rgb
    const dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (v, fb) => {
      probe.style.color = "";
      probe.style.color = v || fb;
      if (!probe.style.color) probe.style.color = fb;
      dot.clearRect(0, 0, 1, 1);
      dot.fillStyle = getComputedStyle(probe).color;
      dot.fillRect(0, 0, 1, 1);
      const [r, g, b] = dot.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255];
    };
    // The three default colors are the original blue set rotated from the accent color — dark blue · deep indigo · bright blue
    const FB = [
      "oklch(from var(--kf-accent) calc(l - 0.162) calc(c - 0.016) calc(h + 3.8))",
      "oklch(from var(--kf-accent) calc(l - 0.342) calc(c + 0.017) calc(h + 26.9))",
      "oklch(from var(--kf-accent) calc(l - 0.085) calc(c + 0.045) calc(h + 5.7))",
    ];
    const read = (o) => [o.c1, o.c2, o.c3].map((v, i) => rgb(v, FB[i]));
    const opts = () => {
      const o = {};
      for (const part of (el.getAttribute(`data-fx-${NAME}`) || "").split(";")) {
        const i = part.indexOf(":");
        if (i > 0) o[part.slice(0, i).trim()] = part.slice(i + 1).trim();
      }
      return o;
    };
    let target = read(options);
    const now = target.map((c) => c.slice());
    const speed = Math.min(Math.max(+(options.speed ?? 0.025), 0), 1);
    const fade = Math.max(+(options.fade ?? 5), 0);
    const segs = Math.min(Math.max(+options.segments || 400, 8), 600);

    const canvas = document.createElement("canvas");
    canvas.className = "fx-ngp";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true }); } catch { canvas.remove(); probe.remove(); return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const uniforms = {
      uC1: { value: new T.Vector3(...now[0]) }, uC2: { value: new T.Vector3(...now[1]) }, uC3: { value: new T.Vector3(...now[2]) },
      uPhase: { value: 0 }, uDrift: { value: new T.Vector2(0, 0) }, uAmp: { value: +(options.amp ?? 20) },
    };
    const mat = new T.ShaderMaterial({ uniforms, vertexShader: NOISE + VERT, fragmentShader: NOISE + FRAG });
    // Original layout: a 90° FOV camera at the origin, a 400×400 plane (400 cells) scaled 5x, placed at (0,100,-280) and rotated 80rad around the z axis
    const geo = new T.PlaneGeometry(400, 400, segs, segs);
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(0, +(options.y ?? 100), -280);
    mesh.rotation.set(0, 0, +(options.spin ?? 80));
    mesh.scale.setScalar(5);
    const scene = new T.Scene();
    scene.add(mesh);
    const cam = new T.PerspectiveCamera(90, 1, 0.1, 1000);

    const sync = (t) => {
      // Original clock: angle = ((t + 40) × 2) mod 360 degrees — phase is 2·sin, drift is (2·sin, 2·cos)
      const a = ((((t + 40) * 2) % 360) * Math.PI) / 180;
      uniforms.uPhase.value = 2 * Math.sin(a);
      uniforms.uDrift.value.set(2 * Math.sin(a), 2 * Math.cos(a));
      uniforms.uC1.value.set(...now[0]); uniforms.uC2.value.set(...now[1]); uniforms.uC3.value.set(...now[2]);
    };
    const draw = () => renderer.render(scene, cam);
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      draw();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const mo = new MutationObserver(() => {
      target = read(opts());
      if (reduce || !speed) { target.forEach((c, i) => (now[i] = c.slice())); sync(clock); draw(); }
    });
    mo.observe(el, { attributes: true, attributeFilter: [`data-fx-${NAME}`] });

    let clock = 0, raf = 0, last = 0, on = true;
    sync(0);
    fit();
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(el);
    if (reduce || !fade) canvas.style.opacity = "1";
    else {
      canvas.style.transition = `opacity ${fade}s ease`;
      requestAnimationFrame(() => requestAnimationFrame(() => (canvas.style.opacity = "1")));
    }
    if (!reduce) {
      const loop = (t) => {
        raf = requestAnimationFrame(loop);
        const dt = last ? Math.min(Math.max(1, t - last), 100) / 1000 : 1 / 60;
        last = t;
        if (!on || document.hidden) return;
        clock += dt;
        // The original moves by speed of the remaining difference every frame. Normalized to one 60fps frame so it is independent of display refresh rate.
        const k = 1 - Math.pow(1 - speed, dt * 60);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) now[i][j] += (target[i][j] - now[i][j]) * k;
        sync(clock);
        draw();
      };
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); geo.dispose(); mat.dispose(); renderer.dispose(); canvas.remove(); probe.remove(); };
  }
})();
