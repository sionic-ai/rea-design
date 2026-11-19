// Flowing ring-line WebGL panel — 28 rings (27 on phone) circle a horn (funnel opening upward) and sphere shape, latitude 0→1 flows once every 6 seconds, appearing and fading away.
// Each ring undulates with value noise (fbm), cycling through six scenes with camera, shape and noise values, staying 4s and transitioning over 2s (expo inOut).
// Cursor speeds up the flow by how fast it moved (.22→.62), twists around itself (radius .16) into a swirl, and adds particle grain (.13) overall.
// The attached element is used as the plane (position: relative · overflow: hidden are in fx.css). Color is the --kf-bg background and --kf-ink-soft lines. The THREE global must exist first
(() => {
  kfFx.register("ring-flow-gl", (box, { options, reduce }) => {
  if (!window.THREE) return;
  const T = window.THREE;
  const css = getComputedStyle(document.documentElement);
  // Read colors from the skin (theme.css) — background is --kf-bg, lines are --kf-ink-soft, lighter than black as in the original
  const color = (name) => new T.Color(css.getPropertyValue(name).trim());

  // Scene values (measured from the original and carried over) — desktop / phone
  const K = ["shapeSphere", "hornPower", "pitch", "yaw", "dist", "tx", "ty", "amp", "freq", "oct", "spin", "fadeIn", "fadeOut", "falloff", "warp", "warpFreq", "warpSpeed"];
  const S = (proj, a) => Object.assign({ proj }, ...K.map((k, i) => ({ [k]: a[i] })));
  const PC = [
    S("ortho", [0, 2, 0, 0, 3.33, 0, 0, 0.092, 1.48, 0.7, 0.16, 0.24, 0.9, 2, 0, 3, 0.15]),
    S("ortho", [0, 2, 0, 0, 1.1, 0.5, 0.4, 0.136, 3.64, 1.3, 0.07, 0.14, 0.875, 1.5, 0, 3, 0.15]),
    S("persp", [1, 0, 0, -48, 3.95, 0.4, 0.4, 0.03, 1.62, 1.5, 0.15, 0.17, 0.525, 0, 0.5, 1.8, 0.51]),
    S("ortho", [0, 1.78, 37.6, 0, 2.71, 0, 0, 0, 0.2, 0.5, 0.115, 0.1, 0.895, 0, 0.03, 7, 0.03]),
    S("persp", [0, 0.05, 89, 3, 2.82, 0, 0, 0.018, 4.5, 1.7, 0.075, 0.2, 0.8, 0, 0, 3, 0.15]),
    S("persp", [0, 0.16, 0, 0, 3.32, 0, 0, 0.05, 3.06, 1.65, 0, 0.13, 0.71, 0, 0, 0.5, 0]),
  ];
  const SP = [
    S("ortho", [0, 2, 0, 0, 2.7, 0, 0, 0.092, 1.48, 0.7, 0.16, 0.24, 0.9, 2, 0, 3, 0.15]),
    S("ortho", [0, 2, 0, 0, 1.73, 0.4, -0.4, 0.136, 3.93, 1.3, 0.07, 0.14, 0.875, 1.5, 0, 3, 0.15]),
    S("persp", [1, 0, 0, -48, 5.05, -0.45, -0.25, 0.01, 1.62, 1.5, 0.15, 0.17, 0.525, 0, 0.5, 1.8, 0.51]),
    S("ortho", [0, 1.78, 37.6, 0, 2.84, 0, 0, 0, 0.2, 0.5, 0.115, 0.1, 0.895, 0, 0.03, 7, 0.03]),
    S("persp", [0, 0.15, 89, 3, 2.85, 0, 0, 0.018, 4.5, 1.7, 0.075, 0.15, 0.71, 0, 0, 3, 0.15]),
    S("persp", [0, 0.16, 0, 0, 3.55, 0, 0, 0.05, 3.06, 1.65, 0, 0.13, 0.71, 0, 0, 0.5, 0]),
  ];
  const mobile = matchMedia("(max-width: 1023px)").matches;
  const scenes = mobile ? SP : PC;
  const G = mobile
    ? { rings: 27, width: 0.0015, flowMin: 0.31, flowMax: 0.7, spinMin: -1, spinMax: 1, distort: false }
    : { rings: 28, width: 0.001, flowMin: 0.22, flowMax: 0.62, spinMin: -1.4, spinMax: -0.2, distort: true };
  if (options.rings != null) G.rings = Math.max(1, +options.rings || 1);
  const LIFE = +(options.life ?? 6) || 6, HOLD = +(options.hold ?? 4) || 4, MOVE = +(options.move ?? 2), PARALLAX = +(options.parallax ?? 0.015), SEGMENTS = 256;
  const GRAIN = +(options.grain ?? 0.13), GRAIN_SCALE = 1950, SWIRL_R = 0.16, SWIRL = +(options.swirl ?? 0.065);
  const FIXED = options.scene != null ? Math.max(0, Math.min(5, +options.scene | 0)) : null;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;top:-10%;left:-10%;width:120%;height:120%;display:block;z-index:0;pointer-events:none";
  canvas.setAttribute("aria-hidden", "true");
  box.prepend(canvas);
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const bg = color("--kf-bg");
  renderer.setClearColor(bg, 1);
  const scene = new T.Scene();
  const persp = new T.PerspectiveCamera(32, 1, 0.1, 50);
  const ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);
  let camera = persp;
  const group = new T.Group();
  scene.add(group);

  const NOISE = `
    float h21(vec2 p){ p = fract(p * vec2(311.7, 183.3)); p += dot(p, p + 19.19); return fract(p.x * p.y); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y); }
    float fbm(vec2 p, float oct){ float v = 0.0, a = 0.5, tot = 0.0, left = clamp(oct, 0.0, 6.0);
      for (int k = 0; k < 6; k++) { float w = clamp(left, 0.0, 1.0); v += w * a * vn(p); tot += w * a; p = p * 2.0 + 7.1; a *= 0.5; left -= 1.0; }
      return tot > 0.0 ? v / tot : 0.5; }`;
  const ringVert = `
    attribute float aAngle; attribute float aNext; attribute float aSide;
    uniform float uLat, uSphere, uHorn, uAmp, uFreq, uSeed, uOct, uFall, uTime, uWidth, uAspect;
    ${NOISE}
    vec3 ringPos(float a){
      float th = uLat * 3.14159265;
      float r = mix(pow(max(uLat, 0.0), uHorn), sin(th), uSphere);
      float y = mix(1.0 - uLat * 2.0, cos(th), uSphere);
      vec3 p = vec3(cos(a) * r, y, sin(a) * r);
      vec3 sn = normalize(vec3(sin(th) * cos(a), cos(th), sin(th) * sin(a)));
      vec2 c2 = normalize(vec2(2.0, 1.0));
      vec3 n = normalize(mix(vec3(cos(a) * c2.x, c2.y, sin(a) * c2.x), sn, uSphere));
      float s = uSeed * 47.0;
      vec2 q = vec2(cos(s) * 50.0, sin(s * 1.3) * 50.0) + vec2(0.0, uTime) + vec2(cos(a), sin(a)) * uFreq;
      p += n * (fbm(q, uOct) - 0.5) * 2.0 * uAmp * pow(clamp(uLat, 0.0, 1.0), max(uFall, 0.0));
      return p;
    }
    void main(){
      vec4 c0 = projectionMatrix * modelViewMatrix * vec4(ringPos(aAngle), 1.0);
      vec4 c1 = projectionMatrix * modelViewMatrix * vec4(ringPos(aNext), 1.0);
      vec2 d = (c1.xy / c1.w - c0.xy / c0.w) * vec2(uAspect, 1.0);
      float l = length(d); d = l > 1e-6 ? d / l : vec2(1.0, 0.0);
      gl_Position = c0;
      gl_Position.xy += vec2(-d.y, d.x) * vec2(1.0 / uAspect, 1.0) * aSide * uWidth * 0.5 * c0.w;
    }`;
  const ringFrag = `precision mediump float; uniform vec3 uInk; uniform float uAlpha; void main(){ gl_FragColor = vec4(uInk, uAlpha); }`;

  const geo = new T.BufferGeometry();
  {
    const n = SEGMENTS * 2, ang = new Float32Array(n), nxt = new Float32Array(n), side = new Float32Array(n), idx = [];
    for (let i = 0; i < SEGMENTS; i++) for (let m = 0; m < 2; m++) {
      const k = i * 2 + m;
      ang[k] = (i / SEGMENTS) * Math.PI * 2;
      nxt[k] = ((i + 1) / SEGMENTS) * Math.PI * 2;
      side[k] = m ? 1 : -1;
    }
    for (let i = 0; i < SEGMENTS; i++) {
      const a = i * 2, b = a + 1, c = ((i + 1) % SEGMENTS) * 2, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
    geo.setAttribute("position", new T.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute("aAngle", new T.BufferAttribute(ang, 1));
    geo.setAttribute("aNext", new T.BufferAttribute(nxt, 1));
    geo.setAttribute("aSide", new T.BufferAttribute(side, 1));
    geo.setIndex(idx);
  }
  const ink = color("--kf-ink-soft");
  const rings = [];
  for (let i = 0; i < G.rings; i++) {
    const mat = new T.ShaderMaterial({
      vertexShader: ringVert, fragmentShader: ringFrag, transparent: true, depthTest: false, depthWrite: false, side: T.DoubleSide,
      uniforms: { uLat: { value: 0 }, uSphere: { value: 0 }, uHorn: { value: 1 }, uAmp: { value: 0 }, uFreq: { value: 3 }, uSeed: { value: i + 0.5 },
        uOct: { value: 1 }, uFall: { value: 0 }, uTime: { value: 0 }, uWidth: { value: G.width }, uAspect: { value: 1 }, uInk: { value: ink }, uAlpha: { value: 1 } },
    });
    const mesh = new T.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.rotation.y = Math.random() * Math.PI * 2;
    group.add(mesh);
    rings.push({ mesh, mat, phase: i / G.rings, spin: G.spinMin + Math.random() * (G.spinMax - G.spinMin) });
  }

  // Final pass — scene warp, swirl around the cursor and grain roughness (overlay) in a single shader
  const target = new T.WebGLRenderTarget(1, 1, { samples: 4 });
  const post = new T.ShaderMaterial({
    uniforms: { tDiffuse: { value: target.texture }, uWarp: { value: 0 }, uWarpFreq: { value: 3 }, uWarpTime: { value: 0 }, uMouse: { value: new T.Vector2(-1, -1) },
      uR: { value: SWIRL_R }, uSwirl: { value: G.distort ? SWIRL : 0 }, uAspect: { value: 1 }, uGrain: { value: GRAIN }, uGrainScale: { value: GRAIN_SCALE } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uWarp, uWarpFreq, uWarpTime, uR, uSwirl, uAspect, uGrain, uGrainScale; uniform vec2 uMouse;
      ${NOISE}
      float hs(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.743); }
      void main(){
        vec2 uv = vUv;
        vec2 q = vec2(uv.x * uAspect, uv.y) * uWarpFreq;
        uv += (vec2(fbm(q + uWarpTime, 3.0), fbm(q + vec2(5.2, 1.3) - uWarpTime, 3.0)) - 0.5) * uWarp * 0.08;
        vec2 d = uv - uMouse; d.x *= uAspect;
        float dist = length(d), fall = 1.0 - smoothstep(0.0, uR, dist);
        float an = uSwirl * 6.2831 * fall, sa = sin(an), ca = cos(an);
        vec2 off = vec2(d.x * ca - d.y * sa, d.x * sa + d.y * ca) - d; off.x /= uAspect;
        vec3 c = texture2D(tDiffuse, uv + off).rgb;
        float g = hs(floor(vec2(vUv.x * uAspect, vUv.y) * uGrainScale));
        vec3 lo = 2.0 * c * g, hi = 1.0 - 2.0 * (1.0 - c) * (1.0 - g);
        gl_FragColor = vec4(mix(c, mix(lo, hi, step(vec3(0.5), c)), uGrain), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const quadScene = new T.Scene();
  const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  quadScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), post));

  let aspect = 1, framing = 1;
  const resize = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio();
    target.setSize(Math.round(w * pr), Math.round(h * pr));
    aspect = w / h;
    persp.aspect = aspect;
    persp.updateProjectionMatrix();
  };
  resize();
  let rt;
  const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  ro.observe(box);

  const cur = {};
  const NUM = K;
  const lastTwo = scenes.length - 2;
  const frameOf = (i) => (i >= lastTwo ? (aspect < 1 ? 1 / aspect : 1) : i === 0 && aspect > 1 ? 1 / aspect : 1);
  const setCamera = () => {
    const pitch = T.MathUtils.degToRad(cur.pitch), yaw = T.MathUtils.degToRad(cur.yaw);
    const len = cur.dist * framing, ring = Math.sin(pitch) * len;
    const pos = new T.Vector3(Math.sin(yaw) * ring, Math.cos(pitch) * len, Math.cos(yaw) * ring);
    const fwd = new T.Vector3().sub(pos).normalize(), up = new T.Vector3(0, 1, 0);
    let right, camUp;
    if (Math.abs(fwd.dot(up)) > 0.999) {
      right = new T.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      camUp = new T.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      if (fwd.y > 0) camUp.multiplyScalar(-1);
    } else {
      right = new T.Vector3().crossVectors(fwd, up).normalize();
      camUp = new T.Vector3().crossVectors(right, fwd).normalize();
    }
    const shift = right.multiplyScalar(cur.tx + ptr.x * PARALLAX).addScaledVector(camUp, cur.ty + ptr.y * PARALLAX);
    camera.position.copy(pos).add(shift);
    camera.up.copy(camUp);
    camera.lookAt(shift);
    const hgt = 2 * Math.tan(T.MathUtils.degToRad(persp.fov) / 2) * cur.dist * framing;
    ortho.left = (-hgt * aspect) / 2; ortho.right = (hgt * aspect) / 2; ortho.top = hgt / 2; ortho.bottom = -hgt / 2;
    ortho.updateProjectionMatrix();
  };

  let visited = false;
  try { visited = localStorage.getItem("fx-ring-flow-visited") === "1"; localStorage.setItem("fx-ring-flow-visited", "1"); } catch {}
  let held = FIXED ?? (visited ? Math.floor(Math.random() * scenes.length) : 0), from = held, to = held, mode = "hold", moveT = 0;
  const expoInOut = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2);
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  const ptr = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, prev = { x: 0, y: 0 };
  let speed = 0;
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
    aim.x = Math.max(-1, Math.min(1, -(u * 2 - 1)));
    aim.y = Math.max(-1, Math.min(1, -(v * 2 - 1)));
    post.uniforms.uMouse.value.set(u, 1 - v);
  };
  const onLeave = () => { aim.x = 0; aim.y = 0; post.uniforms.uMouse.value.set(-1, -1); };
  addEventListener("pointermove", onMove, { passive: true });
  box.addEventListener("pointerleave", onLeave);

  let elapsed = 0, flow = 0, warpT = 0, last = performance.now(), running = false;
  const frame = (dt) => {
    elapsed += dt;
    let n = 0;
    if (mode === "move") {
      moveT += dt;
      const t = Math.min(1, moveT / MOVE);
      n = expoInOut(t);
      if (t >= 1) { mode = "hold"; held = to; from = to; }
    }
    const A = scenes[from], B = scenes[mode === "move" ? to : from];
    for (const k of NUM) cur[k] = A[k] + (B[k] - A[k]) * n;
    camera = ((n < 0.5 ? A : B).proj === "ortho") ? ortho : persp;
    const k = 1 - Math.exp(-dt * 6);
    ptr.x += (aim.x - ptr.x) * k; ptr.y += (aim.y - ptr.y) * k;
    if (dt > 0) speed += (Math.hypot(ptr.x - prev.x, ptr.y - prev.y) / dt - speed) * (1 - Math.exp(-dt * 8));
    prev.x = ptr.x; prev.y = ptr.y;
    framing = frameOf(from) + (frameOf(mode === "move" ? to : from) - frameOf(from)) * n;
    setCamera();
    flow += dt * (G.flowMin + (G.flowMax - G.flowMin) * Math.min(1, speed / 3));
    for (const r of rings) {
      r.mesh.rotation.y += cur.spin * r.spin * dt;
      const lat = flow / LIFE + r.phase, f = lat - Math.floor(lat), u = r.mat.uniforms;
      u.uLat.value = f; u.uSphere.value = cur.shapeSphere; u.uHorn.value = cur.hornPower; u.uAmp.value = cur.amp; u.uFreq.value = cur.freq;
      u.uOct.value = cur.oct; u.uFall.value = cur.falloff; u.uTime.value = elapsed; u.uAspect.value = aspect;
      const fi = Math.max(0.001, cur.fadeIn), fo = Math.min(0.999, cur.fadeOut);
      u.uAlpha.value = Math.min(smooth(Math.max(0, fi - 0.08), fi, f), 1 - smooth(fo, Math.min(1, fo + 0.08), f));
    }
    warpT += dt * cur.warpSpeed;
    const p = post.uniforms;
    p.uWarp.value = cur.warp; p.uWarpFreq.value = cur.warpFreq; p.uWarpTime.value = warpT; p.uAspect.value = aspect;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCam);
  };
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    frame(dt);
    requestAnimationFrame(loop);
  };
  // Bake the shaders first, since compiling on the first cursor move freezes the screen
  renderer.compile(scene, persp);
  renderer.compile(quadScene, quadCam);
  frame(0);
  const dispose = () => {
    removeEventListener("pointermove", onMove);
    box.removeEventListener("pointerleave", onLeave);
    ro.disconnect();
    clearTimeout(rt);
    geo.dispose();
    rings.forEach((r) => r.mat.dispose());
    post.dispose();
    target.dispose();
    renderer.dispose();
    canvas.remove();
  };
  if (reduce) return dispose;
  const start = () => { if (running) return; running = true; last = performance.now(); requestAnimationFrame(loop); };
  const stop = () => { running = false; };
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
  io.observe(box);
  const cycle = FIXED == null && options.cycle !== "off" ? setInterval(() => {
    if (mode === "move") return;
    from = held; to = (held + 1) % scenes.length; mode = "move"; moveT = 0;
  }, HOLD * 1000) : null;
  return () => { stop(); clearInterval(cycle); io.disconnect(); dispose(); };
  });
})();
