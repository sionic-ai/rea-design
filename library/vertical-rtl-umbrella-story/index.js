// Hero WebGL (original Controller·Objects rebuilt with our shaders) · feature Lottie (our drawings built as JSON) · picker panel (SwitchSlider) · parallax (Parallax).
// Values are the original build.js as is — loading: canvas .4s later for .4s, vignette · rain distance .8s later 3s power4.inOut, ripple background 3s, brightness .5s later 2s expo.inOut (loaded .7s after it ends),
// Umbrella disappears 1.5s late over 3s power1.out and scatters to triple positions over 100s, logo .5s late over 3s power1.out. The umbrella image goes around 3×3 cells in 4s (cells staggered .2s, .165s between).
(() => {
  const hover = matchMedia("(hover: hover)").matches;
  const narrow = matchMedia("(max-width: 768px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const main = document.getElementById("jsMain");
  const sc = hover ? undefined : main;
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();

  // ---------- Picker panel (original SwitchSlider — turns on the first button’s id, and on press turns on the cell with the same id) ----------
  document.querySelectorAll(".jsSwitchSlider").forEach((box) => {
    const ts = [...box.querySelectorAll(".jsSwitchSlider__target")], bs = [...box.querySelectorAll(".jsSwitchSlider__btn")];
    const set = (id) => [...ts, ...bs].forEach((o) => o.classList.toggle("isActive", o.dataset.id === id));
    if (bs[0]) set(bs[0].dataset.id);
    bs.forEach((b) => b.addEventListener("click", () => { box.setAttribute("data-id", b.dataset.id); set(b.dataset.id); }));
  });

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // ---------- Parallax (original Parallax — ±2.5% on wide screens, ±5% on phones × power, scrub while on screen) ----------
  if (!reduce) document.querySelectorAll(".jsParallax").forEach((el) => {
    const mk = el.querySelector(".jsParallaxMarker"), tg = el.querySelector(".jsParallaxTarget");
    if (!mk || !tg) return;
    const p = +(el.dataset.power || 1);
    const range = narrow ? [10 * p * -0.5, 10 * p * 0.5] : [5 * p * -0.5, 5 * p * 0.5];
    ScrollTrigger.create({ trigger: mk, scroller: sc, horizontal: true, start: "top bottom", end: "bottom top", invalidateOnRefresh: true,
      onUpdate: (t) => gsap.set(tg, { x: gsap.utils.interpolate(range[0], range[1], 1 - t.progress) + "%" }) });
  });

  // ---------- Feature Lottie — like the original 83×83 · 30fps · 60-frame loop, plays when on screen and pauses when off ----------
  const rgb = (() => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = v("--kf-ink");
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
  })();
  const ease = { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } };
  const K = (frames) => ({ a: 1, k: frames.map(([t, s], i) => (i < frames.length - 1 ? { t, s, ...ease } : { t, s })) });
  const path = (vs, ins, outs, closed = false) => ({ ty: "sh", ks: { a: 0, k: { v: vs, i: ins, o: outs, c: closed } } });
  const line = (a, b) => path([a, b], [[0, 0], [0, 0]], [[0, 0], [0, 0]]);
  const stroke = (w = 2) => ({ ty: "st", c: { a: 0, k: rgb }, o: { a: 0, k: 100 }, w: { a: 0, k: w }, lc: 2, lj: 2 });
  const tr = (extra = {}) => ({ ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, ...extra });
  const canopy = { ty: "gr", it: [path([[-26, 6], [0, -18], [26, 6]], [[0, 0], [-15, 0], [0, -14]], [[0, -14], [15, 0], [0, 0]]), path([[-26, 6], [-13, 6], [0, 6], [13, 6], [26, 6]], [[0, 0], [-6, -4], [-6, -4], [-6, -4], [-6, -4]], [[6, -4], [6, -4], [6, -4], [6, -4], [0, 0]]), line([0, 6], [0, 26]), path([[0, 26], [-7, 26]], [[0, 0], [3, 5]], [[0, 5], [0, 0]]), stroke(), tr()] };
  const ANIM = {
    drops: { it: [line([-14, -34], [-14, -28]), line([0, -38], [0, -32]), line([14, -34], [14, -28]), stroke()], p: [[0, [0, -6]], [30, [0, 8]], [31, [0, -6]], [60, [0, 8]]], o: [[0, 0], [10, 100], [30, 0], [31, 0], [40, 100], [60, 0]] },
    shade: { it: [line([-18, -36], [-12, -28]), line([0, -40], [0, -31]), line([18, -36], [12, -28]), stroke()], o: [[0, 0], [20, 100], [40, 100], [60, 0]] },
    heat: { it: [path([[-10, -26], [-10, -40]], [[0, 0], [4, 5]], [[-4, -5], [0, 0]]), path([[10, -26], [10, -40]], [[0, 0], [4, 5]], [[-4, -5], [0, 0]]), stroke()], p: [[0, [0, 6]], [60, [0, -4]]], o: [[0, 0], [20, 100], [50, 100], [60, 0]] },
    uv: { it: [line([22, -40], [12, -28]), line([32, -32], [22, -20]), stroke()], p: [[0, [10, -10]], [30, [0, 0]], [60, [0, 0]]], o: [[0, 0], [15, 100], [45, 100], [60, 0]] },
    cover: { it: [path([[-3, 8], [3, 8], [3, 16], [-3, 16]], [[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]], true), stroke(1.6)], p: [[0, [0, 0]], [30, [0, 8]], [60, [0, 0]]] },
    badge: { it: [line([22, -32], [32, -32]), line([27, -37], [27, -27]), stroke()], s: [[0, [80, 80]], [20, [115, 115]], [40, [100, 100]], [60, [80, 80]]], o: [[0, 0], [15, 100], [50, 100], [60, 0]] },
  };
  const makeLottie = (kind) => {
    const a = ANIM[kind] || ANIM.drops;
    const t = tr({ ...(a.p ? { p: K(a.p) } : {}), ...(a.o ? { o: K(a.o) } : {}), ...(a.s ? { s: K(a.s) } : {}) });
    return { v: "5.12.2", fr: 30, ip: 0, op: 60, w: 83, h: 83, nm: kind, ddd: 0, assets: [],
      layers: [{ ddd: 0, ind: 1, ty: 4, nm: kind, sr: 1, ao: 0, ip: 0, op: 60, st: 0, bm: 0,
        ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [41.5, 46, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
        shapes: [canopy, { ty: "gr", it: [...a.it, t] }] }] };
  };
  if (window.lottie) {
    const list = [];
    const lio = new IntersectionObserver((es) => es.forEach((e) => {
      const an = list[+e.target.dataset.index];
      if (!an) return;
      if (e.isIntersecting) { setTimeout(() => { an.play(); e.target.classList.add("isLottieCue"); }, +(e.target.dataset.delay || 0)); }
      else an.pause();
    }), { root: hover ? null : main, threshold: 0 });
    document.querySelectorAll(".jsLottie").forEach((el, i) => {
      el.dataset.index = i;
      list.push(lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: false, animationData: makeLottie(el.dataset.kind) }));
      if (reduce) list[i].goToAndStop(30, true); else lio.observe(el);
    });
  }

  // ---------- Hero WebGL ----------
  const world = document.getElementById("world");
  if (!window.THREE || !world) return;
  const T = window.THREE;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  world.append(renderer.domElement);
  const scene = new T.Scene();
  const cam = new T.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const col = (n) => new T.Color(v(n)).convertLinearToSRGB();
  const quad = new T.PlaneGeometry(1, 1);
  let W = 1, H = 1;

  // Wave background — pale gray and cream mix in a slow noise grain (when uEnableGradient is 0 it is a single gray board)
  const bg = new T.Mesh(quad, new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEnableGradient: { value: 0 }, uColor1: { value: col("--kf-raised") }, uColor2: { value: col("--kf-bg") }, uRes: { value: new T.Vector2(1, 1) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `precision highp float; varying vec2 vUv; uniform float uTime, uEnableGradient; uniform vec3 uColor1, uColor2; uniform vec2 uRes;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){ vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0) * 1.6; float t = uTime * .06;
        float g = n(p + vec2(t, -t * .7)) * .6 + n(p * 2.1 - vec2(t * .5, t)) * .4;
        float k = smoothstep(.25, .8, g + vUv.x * .35 - .1);
        gl_FragColor = vec4(mix(uColor1, mix(uColor1, uColor2, k), uEnableGradient), 1.0); }`,
  }));
  bg.position.z = -10;
  scene.add(bg);

  // Logo — draws our logo on a canvas and spreads out from the noise boundary to appear (uEnter)
  const logoCanvas = document.createElement("canvas");
  logoCanvas.width = logoCanvas.height = 512;
  {
    const c = logoCanvas.getContext("2d");
    c.strokeStyle = c.fillStyle = v("--kf-ink");
    c.lineWidth = 9;
    c.beginPath(); c.arc(256, 200, 150, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(150, 240); c.quadraticCurveTo(256, 90, 362, 240); c.moveTo(256, 120); c.lineTo(256, 300); c.quadraticCurveTo(256, 330, 226, 330); c.stroke();
    c.font = `700 64px ${v("--kf-font-sans")}`; c.textAlign = "center"; c.fillText("Business name", 256, 470);
  }
  const logo = new T.Mesh(quad, new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTexture: { value: new T.CanvasTexture(logoCanvas) }, uEnter: { value: 0 }, uAlpha: { value: 1 }, uTime: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D uTexture; uniform float uEnter, uAlpha, uTime;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){ vec2 uv = vUv; uv.x += sin(uv.y * 20.0 + uTime * 2.0) * .004 * (1.0 - uEnter);
        vec4 t = texture2D(uTexture, uv); float m = smoothstep(uEnter * 1.2 - .2, uEnter * 1.2, h(floor(vUv * 64.0) / 64.0) * .5 + (1.0 - vUv.y) * .5);
        gl_FragColor = vec4(t.rgb, t.a * (1.0 - m) * uAlpha); }`,
  }));
  scene.add(logo);

  // 30 raindrops — rain seen from above flowing outward from the center in all directions (original rainCount 30, radius 0 to 20)
  const RAIN = 30;
  const rainMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uAlpha: { value: 1 }, uEnableDistance: { value: 1 }, uColor: { value: col("--kf-dim") } },
    vertexShader: "attribute float aFade; varying vec2 vUv; varying float vFade; void main(){ vUv = uv; vFade = aFade; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }",
    fragmentShader: "precision highp float; varying vec2 vUv; varying float vFade; uniform float uAlpha, uEnableDistance; uniform vec3 uColor; void main(){ float a = smoothstep(0.0, .5, vUv.y) * (1.0 - smoothstep(.5, 1.0, vUv.y)); gl_FragColor = vec4(uColor, a * .55 * uAlpha * uEnableDistance * (1.0 - vFade * .6)); }",
  });
  const rain = new T.InstancedMesh(new T.PlaneGeometry(1, 1), rainMat, RAIN);
  const rAng = new Float32Array(RAIN), rRad = new Float32Array(RAIN), rFade = new Float32Array(RAIN);
  for (let i = 0; i < RAIN; i++) { rAng[i] = Math.random() * Math.PI * 2; rRad[i] = Math.random() * 20; }
  rain.geometry.setAttribute("aFade", new T.InstancedBufferAttribute(rFade, 1));
  rain.position.z = 1;
  scene.add(rain);
  const m4 = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 1, 0), dir = new T.Vector3(), sv = new T.Vector3(), pv = new T.Vector3();

  // Five umbrellas seen from above, a 3×3 grid image (our image: an eight-rib umbrella rotating 5° per cell)
  const sheet = document.createElement("canvas");
  sheet.width = sheet.height = 768;
  {
    const c = sheet.getContext("2d"), cell = 256;
    for (let k = 0; k < 9; k++) {
      const cx = (k % 3) * cell + cell / 2, cy = Math.floor(k / 3) * cell + cell / 2;
      for (let s = 0; s < 8; s++) {
        const a0 = (s / 8) * Math.PI * 2 + (k * 5 * Math.PI) / 180, a1 = a0 + Math.PI / 4;
        c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, 110, a0, a1); c.closePath();
        c.fillStyle = s % 2 ? v("--kf-ink") : v("--kf-surface"); c.fill();
        c.strokeStyle = v("--kf-ink"); c.lineWidth = 2; c.stroke();
      }
      c.beginPath(); c.arc(cx, cy, 8, 0, Math.PI * 2); c.fillStyle = v("--kf-dim"); c.fill();
    }
  }
  const sheetTex = new T.CanvasTexture(sheet);
  const umbMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTexture: { value: sheetTex }, uAlpha: { value: 1 }, uLeaveAlpha: { value: 1 }, uStepProgress: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "precision highp float; varying vec2 vUv; uniform sampler2D uTexture; uniform float uAlpha, uLeaveAlpha, uStepProgress; void main(){ float s = mod(floor(uStepProgress), 9.0); vec2 cell = vec2(mod(s, 3.0), 2.0 - floor(s / 3.0)); vec4 t = texture2D(uTexture, (vUv + cell) / 3.0); gl_FragColor = vec4(t.rgb, t.a * uAlpha * uLeaveAlpha); }",
  });
  const SPOTS = narrow ? [[-0.6, 1.2], [-0.7, -0.4], [0.6, 1.3], [0.45, -1.1], [0.6, 0.08]] : [[-0.75, 0.7], [-1.35, -0.325], [0.5, 0.75], [0, -0.7], [1.3, -0.3]];
  const umbs = SPOTS.map(([x, y], i) => {
    const m = new T.Mesh(quad, umbMat.clone());
    m.userData = { x, y, ax: x * 3, ay: y * 3, k: { x, y } };
    m.position.z = 0.1 * (i + 1);
    scene.add(m);
    return m;
  });
  const umbTls = umbs.map((m, i) => gsap.timeline({ repeat: -1, repeatDelay: 0.165, paused: true }).to(m.material.uniforms.uStepProgress, { value: 9, duration: 4, ease: "linear", roundProps: "value" }, -0.2 * i));

  // Finishing plane — the original OutputPass’s vignette (dark edges) and brightness (white overlay)
  const post = new T.Mesh(quad, new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: { uVignette: { value: 1 }, uBright: { value: 1 }, uShade: { value: col("--kf-ink") }, uLight: { value: col("--kf-surface") } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "precision highp float; varying vec2 vUv; uniform float uVignette, uBright; uniform vec3 uShade, uLight; void main(){ float d = distance(vUv, vec2(.5)); float vg = smoothstep(.3, .85, d) * .35 * uVignette; vec3 c = mix(uShade, uLight, uBright / max(uBright + vg, .0001)); gl_FragColor = vec4(c, clamp(uBright + vg, 0.0, 1.0)); }",
  }));
  post.position.z = 50;
  post.renderOrder = 10;
  scene.add(post);

  const fvItem = () => Math.min(innerHeight * 0.55, 500);
  const resize = () => {
    W = world.clientWidth; H = world.clientHeight;
    renderer.setSize(W, H, false);
    Object.assign(cam, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 });
    cam.updateProjectionMatrix();
    bg.scale.set(W, H, 1); post.scale.set(W, H, 1);
    bg.material.uniforms.uRes.value.set(W, H);
    const lb = document.getElementById("jsFvLogo").getBoundingClientRect();
    logo.scale.set(lb.width * 1.2, lb.width * 1.2, 1);
    const u = fvItem();
    umbs.forEach((m) => m.scale.set(u * 0.42, u * 0.42, 1));
  };
  resize();
  addEventListener("resize", resize);

  let leaveFv = false, leaveAbout = false;
  const clock = new T.Clock();
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (!leaveAbout) { bg.material.uniforms.uTime.value = t; logo.material.uniforms.uTime.value = t; }
    const u = fvItem();
    umbs.forEach((m) => m.position.set(m.userData.k.x * u, m.userData.k.y * u, m.position.z));
    if (!leaveFv) {
      const unit = Math.hypot(W, H) / 2 / 20;
      for (let i = 0; i < RAIN; i++) {
        rRad[i] += dt * 9;
        if (rRad[i] > 20) { rRad[i] = 0; rAng[i] = Math.random() * Math.PI * 2; }
        const x = Math.cos(rAng[i]) * rRad[i] * unit, y = Math.sin(rAng[i]) * rRad[i] * unit;
        dir.set(Math.cos(rAng[i]), Math.sin(rAng[i]), 0);
        q.setFromUnitVectors(up, dir);
        m4.compose(pv.set(x, y, 0), q, sv.set(2, unit * 3, 1));
        rain.setMatrixAt(i, m4);
        rFade[i] = rRad[i] / 20;
      }
      rain.instanceMatrix.needsUpdate = true;
      rain.geometry.attributes.aFade.needsUpdate = true;
    }
    renderer.render(scene, cam);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Loading — long sequence only for first-time visitors (original sessionStorage "loading")
  const first = sessionStorage.getItem("kj-loading") !== "1";
  sessionStorage.setItem("kj-loading", "1");
  const canvas = renderer.domElement;
  const done = () => body.setAttribute("data-webgl-loaded", "1");
  const U = (m) => m.material.uniforms;
  if (reduce) {
    gsap.set(canvas, { opacity: 1 });
    U(bg).uEnableGradient.value = 1; U(logo).uEnter.value = 1; U(post).uVignette.value = 0; U(post).uBright.value = 0; rainMat.uniforms.uEnableDistance.value = 0;
    umbs.forEach((m) => (m.visible = false));
    done();
  } else if (first) {
    umbTls.forEach((t) => t.play());
    const drift = [];
    const l = "power4.inOut";
    gsap.timeline({
      onComplete: () => { umbTls.forEach((t) => t.pause().kill()); drift.forEach((d) => d.kill()); umbs.forEach((m) => (m.visible = false)); },
    })
      .to(canvas, { delay: 0.4, opacity: 1, duration: 0.4 }, "<")
      .to(world, { backgroundColor: "transparent", duration: 0.4 }, "<")
      .to([U(post).uVignette, rainMat.uniforms.uEnableDistance], { delay: 0.8, duration: 3, ease: l, value: 0 }, "<")
      .to(U(bg).uEnableGradient, { duration: 3, ease: l, value: 1 }, "<")
      .to(U(post).uBright, { delay: 0.5, duration: 2, ease: "expo.inOut", value: 0, onComplete: () => setTimeout(done, 700) }, "<")
      .to(umbs.map((m) => U(m).uAlpha), { delay: 1.5, duration: 3, ease: "power1.out", value: 0,
        onStart: () => umbs.forEach((m) => drift.push(gsap.to(m.userData.k, { duration: narrow ? 40 : 100, x: m.userData.ax, y: m.userData.ay }))) }, "<")
      .to(U(logo).uEnter, { delay: 0.5, value: 1, duration: 3, ease: "power1.out" }, "<");
  } else {
    U(post).uVignette.value = 0; U(post).uBright.value = 0; rainMat.uniforms.uEnableDistance.value = 0;
    umbs.forEach((m) => (m.visible = false));
    gsap.timeline()
      .to(canvas, { opacity: 1, duration: 0.4 }, "<")
      .to(world, { backgroundColor: "transparent", duration: 0.4 }, "<")
      .to(U(bg).uEnableGradient, { duration: 1, ease: "power4.inOut", value: 1, onComplete: done }, "<")
      .to(U(logo).uEnter, { delay: 0.4, value: 1, duration: 2, ease: "power1.out" }, "<");
  }

  // Leaving the hero clears the logo and rain, and when the about section enters the canvas disappears (original tlFv·tlAbout).
  ScrollTrigger.create({ trigger: "#jsFvSection", scroller: sc, horizontal: true, start: "top center", end: "top top", invalidateOnRefresh: true,
    onEnter: () => { leaveFv = false; body.setAttribute("data-leave-fv", "0"); },
    onLeaveBack: () => { leaveFv = true; done(); body.setAttribute("data-leave-fv", "1"); },
    onUpdate: (t) => { const a = gsap.utils.interpolate(1, 0, 1 - t.progress); U(logo).uAlpha.value = a; rainMat.uniforms.uAlpha.value = a; umbs.forEach((m) => (U(m).uLeaveAlpha.value = a)); } });
  ScrollTrigger.create({ trigger: "#jsAboutSection", scroller: sc, horizontal: true, start: "top center", end: "top top", invalidateOnRefresh: true,
    onEnter: () => (leaveAbout = false), onLeaveBack: () => (leaveAbout = true),
    onUpdate: (t) => gsap.set(canvas, { opacity: gsap.utils.interpolate(1, 0, 1 - t.progress) }) });
})();
