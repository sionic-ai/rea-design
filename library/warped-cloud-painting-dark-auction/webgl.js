// Rebuild the four original three scenes with our shapes and shaders (③ footer cloud and ④ menu cloud ring are described at each function below).
// ① Cloud panel ([data-cloud]) — the original views a panel model (2.68×2) wearing a cloud image through a 22° perspective camera, and the vertex shader uses time (gentle flow) · mouse (retreat + swirl + tilt) ·
//    bends the panel by scroll (recede + swirl) and click (twisting wave). The panel turns at .045rad per second. The image draws our own cloud onto a canvas.
// ② Header 3D logo ([data-logo-3d]) — instead of the original logo model, an extruded plate of the same mark. Spins .35rad per second, drag .012rad per px, inertia ×.94 on release.
(() => {
  if (!window.THREE) return;
  const T = window.THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const docEl = document.documentElement;
  const css = (n) => {
    const i = document.createElement("i");
    i.style.color = `var(${n})`;
    document.body.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    return c;
  };

  const palette = () => [css("--kf-accent"), css("--kf-accent-text"), css("--kf-accent-soft"), css("--kf-ink")];
  const painter = (g, seed) => {
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const blob = (x, y, r, c, a) => {
      g.globalAlpha = a;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, c);
      gr.addColorStop(1, "transparent");
      g.fillStyle = gr;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    };
    return { rnd, blob };
  };

  // Cloud illustration — classical painting-style sunset clouds: soft overlapping masses of copper, cream and dark brown.
  // kind: ring (wreath with empty center) · full, back · front (two footer layers — like the original art, rising from the bottom at both sides with a low cloud bank in the middle, 1200×553)
  const cloudTexture = (kind) => {
    const bank = kind === "back" || kind === "front";
    const W = bank ? 1200 : 1024, H = bank ? 553 : 764, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const cols = palette();
    const { rnd, blob } = painter(g, kind.length * 97 + 13);
    // Dike top line — at center (u 0) it sits 8% from the bottom, at both ends (u 1) up to 85% high. Back layers are a bit higher and wider
    const top = (x) => { const u = Math.abs(x / W - 0.5) * 2; return H * ((kind === "back" ? 0.86 : 0.92) - (kind === "back" ? 0.72 : 0.78) * u ** 1.6); };
    const scale = bank ? 0.8 : 1;
    for (let i = 0; i < 260; i++) {
      let x, y;
      const t = rnd() * Math.PI * 2;
      if (kind === "ring") { const k = 0.78 + rnd() * 0.3; x = W / 2 + Math.cos(t) * W * 0.36 * k; y = H / 2 + Math.sin(t) * H * 0.34 * k; }
      else if (bank) { x = rnd() * W; const y0 = top(x); y = y0 + rnd() ** 0.7 * (H - y0); }
      else { x = rnd() * W; y = rnd() * H; }
      const shade = rnd();
      const c = shade < 0.3 ? cols[1] : shade < 0.72 ? cols[0] : shade < 0.9 ? cols[2] : cols[3];
      blob(x, y, (34 + rnd() * 96) * scale, c, (0.3 + rnd() * 0.35) * (kind === "back" ? 0.8 : 1));
    }
    // One more layer of a cream-colored bulge lit from the top. The original cloud image is bright at the upper edge
    for (let i = 0; i < 70; i++) {
      const t = rnd() * Math.PI * 2;
      let x = rnd() * W, y = rnd() * H;
      if (kind === "ring") { x = W / 2 + Math.cos(t) * W * 0.34; y = H / 2 + Math.sin(t) * H * 0.3 - 20; }
      if (bank) y = top(x) + 30;
      blob(x, y, (20 + rnd() * 46) * scale, cols[1], 0.35 + rnd() * 0.3);
    }
    g.globalAlpha = 1;
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  };

  // Individual drawings for the menu cloud ring — four different cloud clumps in 2×2 cells
  const puffAtlas = () => {
    const S = 512, cv = document.createElement("canvas");
    cv.width = cv.height = S * 2;
    const g = cv.getContext("2d");
    const cols = palette();
    const { rnd, blob } = painter(g, 7919);
    for (let k = 0; k < 4; k++) {
      const ox = (k % 2) * S, oy = ((k / 2) | 0) * S;
      for (let i = 0; i < 46; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() ** 0.8 * S * 0.24;
        const shade = rnd();
        const c = shade < 0.35 ? cols[1] : shade < 0.8 ? cols[0] : cols[2];
        blob(ox + S / 2 + Math.cos(a) * d * 1.3, oy + S / 2 + Math.sin(a) * d * 0.8, S * (0.08 + rnd() * 0.12), c, 0.35 + rnd() * 0.35);
      }
      for (let i = 0; i < 12; i++) blob(ox + S * (0.3 + rnd() * 0.4), oy + S * (0.36 + rnd() * 0.12), S * (0.05 + rnd() * 0.07), cols[1], 0.4 + rnd() * 0.3);
    }
    g.globalAlpha = 1;
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  };

  const NOISE = /* glsl */ `
    float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.743); }
    float n2(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1.0, 0.0)), u.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), u.x), u.y); }`;
  const VERT = /* glsl */ `
    uniform float uTime; uniform vec2 uMouse; uniform float uMouseAmt; uniform float uScroll; uniform float uClick; uniform float uMotion;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      vUv = uv;
      vec3 p = position; float m = uMotion; float t = uTime;
      p.z += (n2(p.xy * 0.7 + t * 0.1) - 0.5) * 0.11 * m;
      p.x += sin(p.y * 1.5 + t * 0.25) * 0.03 * m;
      p.y += cos(p.x * 1.5 + t * 0.2) * 0.025 * m;
      float hv = uMouseAmt * m;
      p.z -= hv * 0.28;
      p.xy += vec2(sin(p.y * 2.5 + t * 0.4), cos(p.x * 2.5 + t * 0.4)) * hv * 0.06 + uMouse * hv * 0.04;
      float s = uScroll * m;
      p.z -= s * 0.55;
      p.xy += vec2(sin(p.y * 3.0 + t * 0.3), cos(p.x * 3.0 + t * 0.3)) * s * 0.09;
      float cl = uClick * m;
      float a = cl * 0.9 * (0.5 + 0.5 * sin(length(p.xy) * 3.0));
      p.xy = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xy;
      p.z += cl * 0.35 * sin(length(p.xy) * 4.0 - t * 2.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = /* glsl */ `
    uniform sampler2D uTex; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(uTex, vUv);
      c.a *= smoothstep(0.02, 0.07, vUv.x) * smoothstep(0.0, 0.06, 1.0 - vUv.x) * smoothstep(0.0, 0.06, vUv.y) * smoothstep(0.0, 0.06, 1.0 - vUv.y);
      if (c.a < 0.003) discard;
      gl_FragColor = c;
    }`;

  const cloud = (host) => {
    const contain = host.dataset.cloud === "hero" || host.dataset.cloud === "wreath";
    const kind = contain ? "ring" : "full";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { opacity: "0", transition: "opacity .6s ease", display: "block" });
    host.append(canvas);
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(22, 1, 0.1, 100);
    cam.position.set(0, 0, 6);
    const PW = 2.68, PH = 2;
    const u = { uTex: { value: cloudTexture(kind) }, uTime: { value: 0 }, uMouse: { value: new T.Vector2() }, uMouseAmt: { value: 0 }, uScroll: { value: 0 }, uClick: { value: 0 }, uMotion: { value: reduce ? 0 : 1 } };
    const mesh = new T.Mesh(new T.PlaneGeometry(PW, PH, 96, 72), new T.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
    scene.add(mesh);
    let w = 0, hgt = 0;
    const fit = () => {
      const b = host.getBoundingClientRect(), W = Math.round(b.width), H = Math.round(b.height);
      if (!W || !H || (W === w && H === hgt)) return;
      w = W; hgt = H;
      r.setSize(W, H, false);
      cam.aspect = W / H;
      const fov = (cam.fov * Math.PI) / 180;
      let d = PH / 2 / Math.tan(fov / 2);
      if (cam.aspect < PW / PH) d = PW / 2 / Math.tan(Math.atan(Math.tan(fov / 2) * cam.aspect));
      cam.position.z = d * (contain ? 1.12 : 1);
      cam.updateProjectionMatrix();
    };
    fit();
    r.compile(scene, cam);
    requestAnimationFrame(() => { canvas.style.opacity = ""; document.dispatchEvent(new CustomEvent("e:hero-ready")); });
    const zone = host.closest(".e-hero, .e-shop, .e-jr") || host.parentElement;
    const target = new T.Vector2();
    let near = 0, scroll = 0, kick = 0, vis = true;
    zone.addEventListener("pointermove", (e) => {
      const b = canvas.getBoundingClientRect();
      target.set((((e.clientX - b.left) / b.width) * 2 - 1) * (PW / 2), (-(((e.clientY - b.top) / b.height) * 2 - 1)) * (PH / 2));
      near = 1;
    }, { passive: true });
    zone.addEventListener("pointerleave", () => (near = 0), { passive: true });
    zone.addEventListener("click", () => (kick = 1), { passive: true });
    const onScroll = () => { const b = zone.getBoundingClientRect(); scroll = Math.min(1, Math.max(0, -b.top / (innerHeight || 1))); };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(canvas);
    new ResizeObserver(fit).observe(host);
    const born = performance.now();
    const loop = () => {
      requestAnimationFrame(loop);
      if (!vis || document.hidden) return;
      u.uTime.value = (performance.now() - born) / 1000;
      u.uMouse.value.lerp(target, 0.1);
      u.uMouseAmt.value += 0.08 * (near - u.uMouseAmt.value);
      u.uScroll.value += 0.08 * (scroll - u.uScroll.value);
      u.uClick.value += 0.15 * (kick - u.uClick.value);
      kick *= 0.96;
      if (!reduce) mesh.rotation.z = 0.045 * u.uTime.value;
      if (contain) {
        const c = Math.abs(Math.cos(mesh.rotation.z)), s = Math.abs(Math.sin(mesh.rotation.z));
        mesh.scale.setScalar(Math.min(1, (PW / 2) / ((PW / 2) * c + (PH / 2) * s), (PH / 2) / ((PW / 2) * s + (PH / 2) * c)));
      }
      r.render(scene, cam);
    };
    loop();
  };

  // ③ Footer clouds (data-cloud="foot") — the original lays two picture layers, back and front, on the bottom of the screen with an orthographic camera, tilting each layer differently toward the cursor
  //    (back .05, front .1, swirl .04 per tilt amount, follow .06 per frame, back to 0 when leaving the Footer). The panel does not rotate.
  const FOOT_VERT = /* glsl */ `
    uniform float uTime; uniform vec2 uMouse; uniform float uReveal; uniform float uLean; uniform float uMotion;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      vUv = uv;
      vec3 p = position;
      float on = uMotion * clamp(uReveal, 0.0, 1.0);
      p.y -= (1.0 - clamp(uReveal, 0.0, 1.0)) * 0.3;
      p.z += (n2(p.xy * 0.7 + uTime * 0.1) - 0.5) * 0.1 * on;
      p.x += sin(p.y * 1.4 + uTime * 0.22) * 0.025 * on;
      vec2 swirl = vec2(sin(p.y * 2.5 + uTime * 0.4), cos(p.x * 2.5 + uTime * 0.4));
      p.xy += (uMouse * uLean + swirl * length(uMouse) * 0.04) * on;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FOOT_FRAG = /* glsl */ `
    uniform sampler2D uTex; uniform float uReveal; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(uTex, vUv);
      c.a *= smoothstep(0.0, 0.05, vUv.x) * smoothstep(0.0, 0.05, 1.0 - vUv.x) * smoothstep(0.0, 0.05, vUv.y) * smoothstep(0.0, 0.05, 1.0 - vUv.y) * clamp(uReveal, 0.0, 1.0);
      if (c.a < 0.004) discard;
      gl_FragColor = c;
    }`;
  const foot = (host) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { opacity: "0", transition: "opacity .8s ease", display: "block" });
    host.append(canvas);
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    cam.position.z = 4;
    const PW = 2.675, PH = 2, ASPECT = 1200 / 553;
    const geo = new T.PlaneGeometry(PW, PH, 64, 48);
    // Back layer: z -.4 · tilt .05 · scale 1.06 / front layer: z 0 · tilt .1 · scale 1 · shifted down by .07 of the image height
    const layers = [["back", -0.4, 0.05, 1.06, 0], ["front", 0, 0.1, 1, 0.07]].map(([kind, z, lean, k, drop]) => {
      const u = { uTex: { value: cloudTexture(kind) }, uTime: { value: 0 }, uMouse: { value: new T.Vector2() }, uReveal: { value: reduce ? 1 : 0 }, uLean: { value: lean }, uMotion: { value: reduce ? 0 : 1 } };
      const mesh = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: u, vertexShader: FOOT_VERT, fragmentShader: FOOT_FRAG, transparent: true, depthWrite: false }));
      mesh.position.z = z;
      scene.add(mesh);
      return { u, mesh, k, drop };
    });
    let w = 0, hgt = 0;
    const fit = () => {
      const b = host.getBoundingClientRect(), W = Math.round(b.width), H = Math.round(b.height);
      if (!W || !H || (W === w && H === hgt)) return;
      w = W; hgt = H;
      r.setSize(W, H, false);
      const a = W / H;
      Object.assign(cam, { left: -a, right: a, top: 1, bottom: -1 });
      cam.updateProjectionMatrix();
      // Image width = Screen width (1.6x below 782px), height follows the image ratio — each layer sticks to the bottom
      const sw = 2 * a * (W < 782 ? 1.6 : 1), sh = sw / ASPECT;
      for (const l of layers) {
        l.mesh.scale.set((sw / PW) * l.k, (sh / PH) * l.k, 1);
        l.mesh.position.y = (sh * l.k) / 2 - 1 - sh * l.drop;
      }
    };
    fit();
    r.compile(scene, cam);
    new ResizeObserver(fit).observe(host);
    requestAnimationFrame(() => (canvas.style.opacity = "1"));
    const target = new T.Vector2();
    let vis = false, reveal = 0;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) reveal = 1; }, { rootMargin: "100% 0px" }).observe(host);
    if (!reduce) {
      const zone = host.closest(".e-foot") || host.parentElement;
      zone.addEventListener("pointermove", (e) => {
        const b = canvas.getBoundingClientRect();
        target.set(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1));
      }, { passive: true });
      zone.addEventListener("pointerleave", () => target.set(0, 0), { passive: true });
    }
    const born = performance.now();
    const loop = () => {
      requestAnimationFrame(loop);
      if (!vis || document.hidden) return;
      const t = (performance.now() - born) / 1000;
      for (const { u } of layers) {
        u.uTime.value = t;
        u.uMouse.value.lerp(target, 0.06);
        if (!reduce) u.uReveal.value += 0.04 * (reveal - u.uReveal.value);
      }
      r.render(scene, cam);
    };
    loop();
  };

  // ④ Menu cloud ring (data-cloud="menu") — the original wraps dozens of individual cloud sheets in a ring, each turning separately by depth (0 far ~ 1 near) (one ring turn 140 seconds).
  // Cursor: in view space, depth-proportional parallax .03~.14 plus pushing sheets within .85 around the cursor by .16 and brightening them by .12. Follow .07 per frame · on .05. Runs only while the menu is open.
  const MENU_VERT = /* glsl */ `
    uniform float uTime; uniform vec2 uMouseN; uniform vec2 uMouseW; uniform float uPointer; uniform float uRing;
    attribute vec2 aCard;
    varying vec2 vUv; varying float vLift;
    void main() {
      vUv = uv;
      float ph = aCard.x * 6.2832, d = aCard.y, pace = 0.7 + 0.6 * fract(aCard.x * 13.37);
      float a = uRing * mix(-0.35, 1.45, d) * (0.8 + 0.4 * fract(aCard.x * 7.13)) + 0.06 * sin(uTime * 0.013 * pace + ph);
      vec3 p = position;
      p.xy = mat2(cos(a), sin(a), -sin(a), cos(a)) * p.xy;
      float reach = mix(0.75, 1.25, d), t = uTime * pace;
      p.x += 0.03 * sin(t * 0.1 + ph) * reach + 0.035 * d * sin(uTime * 0.021);
      p.y += 0.024 * cos(t * 0.071 + ph * 1.7) * reach;
      vLift = 0.92 + 0.06 * sin(t * 0.06 + ph * 4.0);
      vec4 v = modelViewMatrix * vec4(p, 1.0);
      v.xy += uMouseN * mix(0.03, 0.14, d) * uPointer;
      vec2 off = v.xy - uMouseW;
      float gust = smoothstep(0.85, 0.0, length(off)) * uPointer;
      v.xy += normalize(off + vec2(1e-4, 0.0)) * gust * 0.16;
      vLift += gust * 0.12;
      gl_Position = projectionMatrix * v;
    }`;
  const MENU_FRAG = /* glsl */ `
    uniform sampler2D uTex; varying vec2 vUv; varying float vLift;
    void main() {
      vec4 c = texture2D(uTex, vUv);
      float a = c.a * vLift;
      if (a < 0.004) discard;
      gl_FragColor = vec4(c.rgb, a);
    }`;
  const menuRing = (host) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.append(canvas);
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    r.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(22, 1, 0.1, 100);
    // 48 loose sheets — drawn from the farthest so nearer sheets sit on top (without depth test)
    const { rnd } = painter(null, 4271);
    const N = 48, pos = [], uv = [], card = [], idx = [];
    Array.from({ length: N }, (_, i) => ({ i, d: rnd() })).sort((p, q) => p.d - q.d).forEach(({ i, d }, n) => {
      const th = (i / N) * Math.PI * 2 + (rnd() - 0.5) * 0.2, R = 1 + (rnd() - 0.5) * 0.45, s = (0.5 + rnd() * 0.3) * (0.8 + 0.4 * d);
      const cx = Math.cos(th) * R, cy = Math.sin(th) * R, ph = rnd(), k = (rnd() * 4) | 0, u0 = (k % 2) / 2, v0 = 0.5 - ((k / 2) | 0) / 2;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        pos.push(cx + sx * s * 0.65, cy + sy * s * 0.5, 0);
        uv.push(u0 + (sx + 1) / 4, v0 + (sy + 1) / 4);
        card.push(ph, d);
      }
      idx.push(n * 4, n * 4 + 1, n * 4 + 2, n * 4, n * 4 + 2, n * 4 + 3);
    });
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geo.setAttribute("aCard", new T.Float32BufferAttribute(card, 2));
    geo.setIndex(idx);
    let g = 0;
    for (let k = 0; k < pos.length; k += 3) g = Math.max(g, Math.hypot(pos[k], pos[k + 1]));
    const u = { uTex: { value: puffAtlas() }, uTime: { value: 0 }, uMouseN: { value: new T.Vector2() }, uMouseW: { value: new T.Vector2(0, 99) }, uPointer: { value: 0 }, uRing: { value: 0 } };
    const mesh = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: u, vertexShader: MENU_VERT, fragmentShader: MENU_FRAG, transparent: true, depthWrite: false, depthTest: false }));
    mesh.frustumCulled = false;
    scene.add(mesh);
    const half = { x: 1, y: 1 };
    let w = 0, hgt = 0;
    const fit = () => {
      const b = host.getBoundingClientRect(), W = Math.round(b.width), H = Math.round(b.height);
      if (!W || !H || (W === w && H === hgt)) return false;
      w = W; hgt = H;
      r.setSize(W, H, false);
      cam.aspect = W / H;
      // Outer end of the ring reaches 70% of the screen’s opposite diagonal
      const tan = Math.tan((cam.fov * Math.PI) / 360);
      cam.position.z = (0.7 * g) / (Math.hypot(cam.aspect, 1) * tan);
      cam.updateProjectionMatrix();
      half.y = cam.position.z * tan;
      half.x = half.y * cam.aspect;
      return true;
    };
    const aim = { x: 0, y: 0, on: 0 };
    if (!reduce) {
      const zone = host.closest(".e-menu") || host.parentElement;
      zone.addEventListener("pointermove", (e) => {
        const b = canvas.getBoundingClientRect();
        aim.x = ((e.clientX - b.left) / b.width) * 2 - 1;
        aim.y = -(((e.clientY - b.top) / b.height) * 2 - 1);
        aim.on = 1;
      }, { passive: true });
      zone.addEventListener("pointerleave", () => (aim.on = 0), { passive: true });
    }
    let raf = 0, last = 0;
    const frame = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const t = (u.uTime.value += dt);
      u.uRing.value += ((Math.PI * 2) / 140) * dt * (1 + 0.35 * Math.sin(0.045 * t) * Math.cos(0.017 * t));
      const m = u.uMouseN.value;
      m.x += 0.07 * (aim.x - m.x);
      m.y += 0.07 * (aim.y - m.y);
      u.uMouseW.value.set(m.x * half.x, m.y * half.y);
      u.uPointer.value += 0.05 * (aim.on - u.uPointer.value);
      r.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };
    const open = () => docEl.classList.contains("menu-open");
    const sync = () => {
      if (open() && !raf) {
        fit();
        if (reduce) r.render(scene, cam);
        else { last = 0; raf = requestAnimationFrame(frame); }
      } else if (!open() && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    fit();
    r.compile(scene, cam);
    r.render(scene, cam);
    new MutationObserver(sync).observe(docEl, { attributes: true, attributeFilter: ["class"] });
    new ResizeObserver(() => { if (fit() && !raf) r.render(scene, cam); }).observe(host);
    sync();
  };

  const logo = (host) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.append(canvas);
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(18, 250 / 115, 0.1, 100);
    scene.add(new T.AmbientLight(0xffffff, 1.5));
    const d1 = new T.DirectionalLight(0xffffff, 2.2); d1.position.set(2, 3, 4); scene.add(d1);
    const d2 = new T.DirectionalLight(0xffffff, 1.1); d2.position.set(-3, -1, 2); scene.add(d2);
    // Marker: eye-shaped outer ellipse + center circle hole + thin wings on both sides
    const shape = new T.Shape(); shape.absellipse(0, 0, 0.54, 0.4, 0, Math.PI * 2, false, 0);
    const hole = new T.Path(); hole.absellipse(0, 0, 0.2, 0.2, 0, Math.PI * 2, true, 0); shape.holes.push(hole);
    const wing = (sx) => { const s = new T.Shape(); s.moveTo(sx * 0.56, -0.02); s.lineTo(sx * 1.02, 0); s.lineTo(sx * 0.56, 0.02); return s; };
    const geo = new T.ExtrudeGeometry([shape, wing(1), wing(-1)], { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 3, curveSegments: 48 });
    geo.center();
    const mat = new T.MeshStandardMaterial({ color: new T.Color(css("--kf-ink")), roughness: 0.35, metalness: 0.15 });
    const mesh = new T.Mesh(geo, mat);
    scene.add(mesh);
    const fit = () => { const b = host.getBoundingClientRect(); r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.position.set(0, 0, 1.2 / Math.tan((9 * Math.PI) / 180) / cam.aspect + 0.6); cam.updateProjectionMatrix(); };
    fit();
    new ResizeObserver(fit).observe(host);
    host.classList.add("has-3d");
    let drag = false, lastX = 0, moved = 0, spin = 0;
    host.addEventListener("pointerdown", (e) => { drag = true; lastX = e.clientX; moved = 0; });
    addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); mesh.rotation.y += 0.012 * dx; spin = 0.012 * dx * 60; }, { passive: true });
    addEventListener("pointerup", () => { drag = false; if (reduce) spin = 0; }, { passive: true });
    host.addEventListener("dragstart", (e) => e.preventDefault());
    host.addEventListener("click", (e) => { if (moved > 6) { e.preventDefault(); moved = 0; } });
    let last = performance.now();
    const loop = () => {
      requestAnimationFrame(loop);
      const now = performance.now(), dt = Math.min(Math.max(0.001, (now - last) / 1000), 0.1);
      last = now;
      if (!drag) { spin *= 0.94; mesh.rotation.y += ((reduce || docEl.classList.contains("e-loading") ? 0 : 0.35) + spin) * dt; }
      r.render(scene, cam);
    };
    loop();
  };

  const boot = () => {
    document.querySelectorAll("[data-cloud]").forEach((h) => (h.dataset.cloud === "foot" ? foot : h.dataset.cloud === "menu" ? menuRing : cloud)(h));
    document.querySelectorAll("[data-logo-3d]").forEach(logo);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
