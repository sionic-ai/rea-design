(() => {
  // Original Brand background: fog panel (two textures mixed by shader) + four corner color orbs + flapping birds. The panel fits the element size with a perspective camera (60°) at 1px = 1 unit
  const MIST_VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }";
  const NOISE = `float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }`;
  const MIST_FRAG = `precision highp float;
    uniform float uTime; uniform float uClock; uniform float uOpacity; uniform float uMotion; uniform vec2 uRes;
    uniform vec3 uBase; uniform vec3 uLight; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; varying vec2 vUv;
    ${NOISE}
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return v; }
    void main(){
      vec2 uv = vUv; vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 1.15; float t = uClock * 0.12;
      vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
      float f = fbm(p + 1.1 * q + vec2(t * 0.6, -t * 0.35)); float puff = smoothstep(0.34, 0.8, f);
      vec3 gray = mix(uBase * 0.84, uLight, puff);
      vec3 tint = mix(mix(uC1, uC3, smoothstep(0.3, 0.8, q.x)), uC2, smoothstep(0.55, 0.95, q.y) * 0.6);
      vec3 color = mix(gray, mix(uLight, tint, 0.6), 0.55 * (1.0 - puff * 0.6));
      float blend = 0.5 / cos(cos(uTime)) - length(vec2(uv.x, uv.y - 0.15)) * uMotion;
      gl_FragColor = vec4(clamp(mix(color, gray, blend), 0.0, 1.0), uOpacity);
    }`;
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const BALL_FRAG = `precision highp float; uniform vec3 uColor; uniform float uOpacity; uniform float uSeed; varying vec2 vUv; ${NOISE}
    void main(){ vec2 d = vUv - 0.5; float a = smoothstep(0.5, 0.05, length(d) + noise(d * 4.0 + uSeed) * 0.12); gl_FragColor = vec4(uColor, a * a * uOpacity); }`;
  const BIRD_FRAG = `precision highp float; uniform sampler2D uTexture; uniform float uOpacity; uniform float uDist; varying vec2 vUv; const float PI = 3.14159265359;
    void main(){ vec2 uv = vUv; uv.y -= sin(uv.x * PI) * 0.5 * uDist * (vUv.y - 0.25); vec4 c = texture2D(uTexture, uv); c.a *= uOpacity; gl_FragColor = c; }`;
  const BODY = "M124 4C114 58 110 112 100 158C92 194 80 218 60 238C94 214 114 180 124 136C134 92 134 46 124 4Z";
  const WING = "M4 122C40 114 80 118 112 122C148 126 176 112 198 82C188 116 162 140 120 142C80 144 40 138 4 122Z";
  // Positions of the original four balls (by multiples of the ball diameter outside the ear) and color order
  const CORNERS = [[-0.213, -0.499], [-0.5, -0.318], [1.213, 1.499], [1.5, 1.318]];
  const ORDER = [[0, 1, 2], [1, 2, 0], [0, 1, 2], [1, 2, 0]];

  kfFx.register("mist-bloom-bg", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    let renderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch { return; }
    const PR = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(PR);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(60, 1, 0.1, 10000), unit = new T.PlaneGeometry(1, 1);
    const tweens = [];
    const tw = (t) => (tweens.push(t), t);

    const probe = document.createElement("i");
    probe.style.display = "none";
    el.appendChild(probe);
    const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    px.canvas.width = px.canvas.height = 1;
    const css = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
    const rgb = (v) => { px.clearRect(0, 0, 1, 1); px.fillStyle = css(v); px.fillRect(0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data; return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255); };
    const palette = ["--fx-mist-1", "--fx-mist-2", "--fx-mist-3"];

    const mu = { uTime: { value: 0 }, uClock: { value: 0 }, uOpacity: { value: 0 }, uMotion: { value: 1 }, uRes: { value: new T.Vector2(1, 1) },
      uBase: { value: rgb("--kf-bg") }, uLight: { value: rgb("--kf-surface") }, uC1: { value: rgb(palette[0]) }, uC2: { value: rgb(palette[1]) }, uC3: { value: rgb(palette[2]) } };
    const mist = new T.Mesh(unit, new T.ShaderMaterial({ vertexShader: MIST_VERT, fragmentShader: MIST_FRAG, uniforms: mu, transparent: true, depthTest: false, depthWrite: false }));
    mist.frustumCulled = false;
    scene.add(mist);

    let W = 1, H = 1;
    const balls = +(options.balls ?? 1) ? CORNERS.map((c, i) => {
      const u = { uColor: { value: rgb(palette[ORDER[i][0]]) }, uOpacity: { value: 0 }, uSeed: { value: i * 3.1 } };
      const m = new T.Mesh(unit, new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: BALL_FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false }));
      m.renderOrder = 1;
      scene.add(m);
      return { m, u, c, step: 0, order: ORDER[i] };
    }) : [];

    const tex = (d, v) => {
      const c = document.createElement("canvas");
      c.width = 400; c.height = 480;
      const g = c.getContext("2d");
      g.scale(2, 2); g.fillStyle = css(v); g.fill(new Path2D(d));
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      return t;
    };
    const rand = (a, b) => a + Math.random() * (b - a);
    const birds = Array.from({ length: Math.max(0, +(options.birds ?? 3) | 0) }, (_, i) => {
      const v = i === 0 ? "--fx-mist-1" : "--fx-mist-2";
      const parts = [BODY, WING].map((d, k) => {
        const u = { uTexture: { value: tex(d, v) }, uOpacity: { value: 0 }, uDist: { value: -0.2 } };
        const m = new T.Mesh(unit, new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: BIRD_FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false, side: T.DoubleSide }));
        m.renderOrder = 2 + k;
        scene.add(m);
        return { m, u };
      });
      return { parts, amp: i === 0 ? 1 : 0.5, f: { x: 1e5, r: 1, c: 1, radius: 1 } };
    });

    const resize = () => {
      W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.z = H / Math.tan((camera.fov * Math.PI) / 360) / 2;
      camera.updateProjectionMatrix();
      mu.uRes.value.set(W * PR, H * PR);
      const size = Math.max(W, H) * 0.41;
      balls.forEach((b) => { b.m.scale.set(size, size, 1); b.m.position.set(b.c[0] * W - W / 2 + (b.c[0] < 0.5 ? size / 2 : -size / 2), H / 2 - b.c[1] * H - (b.c[1] < 0.5 ? size / 2 : -size / 2), 0); });
      const bw = Math.min(W * 0.09, 126);
      birds.forEach((b) => b.parts.forEach((p) => p.m.scale.set(bw, bw * 1.2, 1)));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let clock = 0;
    const tick = (t, dt) => {
      mu.uTime.value += 1;
      if (!reduce) clock += Math.min(dt, 50) / 1000;
      mu.uClock.value = clock;
      birds.forEach((b) => {
        const f = b.f, y = f.radius * Math.sin(f.c * f.x * 2), tilt = 0.4 - 1.2 * (1 - Math.abs((-f.r - f.x) / (2 * f.r)));
        b.parts.forEach((p, k) => { p.m.position.set(f.x - W / 2 + 60, y + H / 2 - 80, 0); p.m.rotation.z = k ? tilt * 0.65 : tilt; });
      });
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    const intro = +(options.intro ?? 2);
    const color = () => tw(gsap.to(mu.uMotion, { value: 1, duration: reduce ? 0 : 2, ease: "power2.inOut" }));
    const gray = () => tw(gsap.to(mu.uMotion, { value: 0, duration: reduce ? 0 : 2, ease: "power2.inOut" }));
    tw(gsap.to(mu.uOpacity, { value: 1, duration: reduce ? 0 : intro, ease: "power2.out" }));
    if (options.gray !== "none") tw(gsap.delayedCall(reduce ? 0 : +(options.gray ?? 2.5), gray));
    balls.forEach((b) => tw(gsap.to(b.u.uOpacity, { value: 0.6, duration: 0.6, ease: "power2.out", delay: reduce ? 0 : intro })));
    let timer = 0;
    if (balls.length && !reduce) timer = setInterval(() => balls.forEach((b, i) => {
      b.step = (b.step + 1) % 3;
      const c = rgb(palette[b.order[b.step]]);
      tw(gsap.to(b.u.uColor.value, { r: c.r, g: c.g, b: c.b, duration: 6, delay: 0.1 * i, ease: "power2.out" }));
    }), 2000);
    if (!reduce) birds.forEach((b) => {
      const f = b.f, n = rand(0.8, 1.2), delay = rand(0, 8);
      f.r = rand(W * 1.2, W * 1.5); f.radius = rand(H / 2, H) * 0.8; f.c = -Math.PI / Math.abs(f.r * 1.5);
      b.parts.forEach((p) => tw(gsap.to(p.u.uOpacity, { value: 1, duration: 0.6, ease: "power2.out", delay: intro })));
      tw(gsap.fromTo(b.parts[1].m.rotation, { x: 0.6 * b.amp }, { x: -0.6 * b.amp, duration: n * 4, ease: "circ.inOut", repeat: -1, yoyo: true, delay }));
      tw(gsap.fromTo(f, { x: f.r }, { x: -f.r, duration: n * 10, ease: "circ.inOut", repeat: -1, delay }));
    });
    el.addEventListener("fx:color", color);
    el.addEventListener("fx:gray", gray);

    return () => {
      gsap.ticker.remove(tick);
      clearInterval(timer);
      tweens.forEach((t) => t.kill());
      ro.disconnect();
      el.removeEventListener("fx:color", color);
      el.removeEventListener("fx:gray", gray);
      scene.traverse((o) => { o.material?.uniforms?.uTexture?.value?.dispose(); o.material?.dispose(); });
      unit.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      probe.remove();
    };
  });
})();
