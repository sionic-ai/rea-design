// 3D stage shared by two pages (three r184) — background liquid · stardust, cards (smoke shader + text cover), showcase (light panel · base · card stack · grass).
// The original shader code was not used. We rewrote the same effect (fbm smoke twisted twice · stars with different parallax per layer · a veil that clears around the mouse).
(() => {
  const KT = window.KT, T = window.THREE;
  const GL = (KT.GL = {});
  const c3 = (name) => new T.Vector3(...KT.readColor(name));
  const font = (name) => KT.cssVar(name) || "serif";
  // Card text is baked into the canvas — draw after the font loads so it doesn’t harden into a fallback font
  GL.fontsReady = () => {
    const d = font("--kf-font-display"), m = font("--kf-font-mono");
    const want = [`italic 46px ${d}`, `400 46px ${d}`, `700 15px ${m}`, `400 16px ${m}`];
    return Promise.all(want.map((f) => document.fonts.load(f, "Your title Aa0 here"))).catch(() => {}).then(() => document.fonts.ready);
  };

  const NOISE = /* glsl */ `
    float kh(vec2 p) { p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
    float kn(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(kh(i), kh(i + vec2(1.0, 0.0)), f.x), mix(kh(i + vec2(0.0, 1.0)), kh(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float kfbm(vec2 p) {
      float s = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { s += a * kn(p); p = p * 2.03 + 17.1; a *= 0.5; }
      return s;
    }
    // Twice-twisted smoke — shift position once with q and once with r to make a flowing grain
    float smoke(vec2 p, float t, out vec2 r) {
      vec2 q = vec2(kfbm(p + 0.06 * t), kfbm(p + vec2(5.2, 1.3) - 0.045 * t));
      r = vec2(kfbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.03 * t), kfbm(p + 4.0 * q + vec2(8.3, 2.8)));
      return clamp((kfbm(p + 3.0 * r) - 0.5) * 1.15 + 0.5, 0.0, 1.0);
    }
    vec3 stops(vec3 s, vec3 a, vec3 b, vec3 c, float f) {
      vec3 col = mix(s, a, smoothstep(0.0, 0.38, f));
      col = mix(col, b, smoothstep(0.3, 0.68, f));
      return mix(col, c, smoothstep(0.6, 0.95, f));
    }
    float motes(vec2 p, float cell, float size, float fill, float t) {
      vec2 g = floor(p * cell), f = fract(p * cell);
      float h = kh(g);
      vec2 c = vec2(kh(g + 13.7), kh(g + 37.1)) * 0.5 + 0.25;
      float tw = 1.0 - 0.36 * (0.5 + 0.5 * sin(t * 2.3 * (0.4 + h * 1.6) + h * 40.0));
      return smoothstep(size, size * 0.2, length(f - c)) * step(h, fill) * tw;
    }
  `;
  const FULL_VS = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const PLANE_VS = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

  // Four steps of the original background liquid (dark → light) — built from one color by ratio (original ratios .067 · .2 · .5 · 1)
  GL.liquid = (name) => { const c = KT.readColor(name); return [0.067, 0.2, 0.5, 1].map((k) => new T.Vector3(c[0] * k, c[1] * k, c[2] * k)); };

  // ── One panel: renderer, scene, camera (fov 38, looks at the origin from (0,.15,3.6)) ──
  GL.stage = (host) => {
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
    renderer.outputColorSpace = T.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0.15, 3.6);
    camera.lookAt(0, 0, 0);
    const view = { w: 1, h: 1, W: 1, H: 1 };
    const resize = () => {
      view.W = innerWidth; view.H = innerHeight;
      renderer.setSize(view.W, view.H, false);
      camera.aspect = view.W / view.H;
      camera.updateProjectionMatrix();
      const d = camera.position.length();
      view.h = 2 * Math.tan((camera.fov * Math.PI) / 360) * d;
      view.w = view.h * camera.aspect;
    };
    resize();
    addEventListener("resize", resize);
    // Screen position (px) → z=World slot for face 0
    const world = (cx, cy) => ({ x: ((cx - view.W / 2) / view.W) * view.w, y: (-(cy - view.H / 2) / view.H) * view.h });
    const pointer = new T.Vector2(0, 0), ray = new T.Raycaster();
    let has = false;
    addEventListener("pointermove", (e) => { has = true; pointer.set((e.clientX / view.W) * 2 - 1, -(e.clientY / view.H) * 2 + 1); }, { passive: true });
    const pick = (list) => {
      if (!has) return null;
      ray.setFromCamera(pointer, camera);
      return ray.intersectObjects(list, false)[0] || null;
    };
    const frames = [];
    const clock = new T.Clock();
    let running = true;
    const tick = () => {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      for (const f of frames) f(dt, t);
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    document.addEventListener("visibilitychange", () => { running = !document.hidden; clock.getDelta(); });
    // Compile when setting up hidden objects (branch meadow, reel card, door) — compiling first on the first hover freezes the screen
    const warm = () => {
      const hidden = [];
      scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
      renderer.compile(scene, camera);
      hidden.forEach((o) => (o.visible = false));
    };
    return { renderer, scene, camera, view, world, pointer, pick, warm, onFrame: (f) => frames.push(f), get hasPointer() { return has; } };
  };

  // ── Background: blue-violet base + two layers of stardust + a slowly turning liquid film above. Around the mouse the film thins and the stars sharpen ──
  GL.backdrop = (stage, { veil = 0.18, stars = 1 } = {}) => {
    const u = {
      uBase: { value: c3("--kf-bg") }, uRes: { value: new T.Vector2(1, 1) }, uTime: { value: 0 }, uFade: { value: 1 },
      uScroll: { value: 0 }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uVeil: { value: veil }, uStars: { value: stars },
      uPal: { value: GL.liquid("--site-liquid") }, uCool: { value: c3("--site-star-cool") }, uWarm: { value: c3("--site-star-warm") },
    };
    const mat = new T.ShaderMaterial({
      uniforms: u, depthTest: false, depthWrite: false, vertexShader: FULL_VS,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform vec3 uBase, uCool, uWarm, uPal[4];
        uniform vec2 uRes, uMouse;
        uniform float uTime, uFade, uScroll, uVeil, uStars;
        ${NOISE}
        vec3 dust(vec2 p, float cell, float gain) {
          vec2 g = floor(p * cell), f = fract(p * cell);
          float h = kh(g);
          vec2 c = vec2(kh(g + 3.1), kh(g + 5.7));
          float spark = smoothstep(0.05, 0.0, length(f - c)) * step(0.9, h);
          vec3 tint = mix(uCool, uWarm, step(0.975, h));
          return tint * spark * gain * (0.6 + 0.4 * sin(uTime * (0.3 + h) + h * 31.0));
        }
        void main() {
          float aspect = uRes.x / max(uRes.y, 1.0);
          vec2 p0 = (vUv - 0.5) * vec2(aspect, 1.0);
          vec2 dm = (vUv - uMouse) * vec2(aspect, 1.0);
          float clearing = exp(-dot(dm, dm) * 14.0);
          vec2 p = p0 * 1.35 + vec2(3.1, 7.7) + vec2(uTime * 0.01, -uTime * 0.006) + vec2(0.0, uScroll * 0.3) + uMouse * 0.04;
          vec2 r;
          float f = smoke(p, uTime, r);
          vec3 fluid = stops(uPal[0], uPal[1], uPal[2], uPal[3], f);
          fluid = mix(fluid, fluid + (uPal[3] - uPal[1]) * 0.15, clamp(dot(r, r) * 0.8, 0.0, 1.0) * 0.45);
          float dens = smoothstep(0.42, 0.95, f);
          vec2 refr = (r - 0.5) * 0.02 * dens;
          vec3 st = dust(p0 + refr + vec2(0.0, uScroll * 0.1) + uMouse * 0.012, 26.0, 0.055);
          st += dust(p0 * 1.7 + refr * 1.5 + vec2(0.0, uScroll * 0.28) + uMouse * 0.03 + 4.2, 40.0, 0.038);
          st *= (1.0 - 0.55 * dens) * (1.0 + 0.6 * clearing) * uStars;
          vec3 col = uBase + st * uFade;
          col = mix(col, fluid, uVeil * (0.35 + 0.65 * dens) * (1.0 - 0.35 * clearing) * uFade);
          col *= 1.0 - 0.1 * smoothstep(0.45, 0.85, length(p0)) * uFade;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1000;
    stage.scene.add(mesh);
    const mouse = new T.Vector2(0.5, 0.5);
    if (!KT.reduce) addEventListener("pointermove", (e) => mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight), { passive: true });
    let sc = 0;
    stage.onFrame((dt, t) => {
      u.uTime.value = t;
      u.uRes.value.set(stage.view.W, stage.view.H);
      const w = 1 - Math.exp(-3.5 * dt);
      u.uMouse.value.lerp(mouse, w);
      sc += (scrollY / Math.max(innerHeight, 1) - sc) * w;
      u.uScroll.value = sc;
    });
    return { mesh, u };
  };

  // ── Star stage (feature list backdrop · inside the ”View all” door) — three depths, each layer with different parallax to mouse and scroll ──
  GL.starMaterial = ({ density = 17, transparent = false } = {}) =>
    new T.ShaderMaterial({
      transparent, depthWrite: !transparent,
      uniforms: {
        uTime: { value: 0 }, uPar: { value: new T.Vector2() }, uDensity: { value: density }, uOpacity: { value: 1 },
        uBg: { value: c3("--kf-surface") }, uBg2: { value: c3("--kf-bg") }, uDot: { value: c3("--kf-ink-soft") }, uNear: { value: c3("--kf-ink") },
        uAspect: { value: 1 },
      },
      vertexShader: PLANE_VS,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime, uDensity, uOpacity, uAspect;
        uniform vec2 uPar;
        uniform vec3 uBg, uBg2, uDot, uNear;
        ${NOISE}
        void main() {
          vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
          vec3 col = mix(uBg, uBg2, smoothstep(0.0, 0.75, length(p)));
          float far = motes(p * (1.0 + 0.85) + uPar * 0.15 + vec2(0.0, uTime * 0.009), uDensity, 0.05, 0.08, uTime);
          float mid = motes(p * (1.0 + 0.5) + uPar * 0.5 + 7.3, uDensity * 0.8, 0.06, 0.08, uTime);
          float near = motes(p * (1.0 + 0.22) + uPar + 3.9, uDensity * 0.6, 0.075, 0.08, uTime);
          col += uDot * (far * 0.32 + mid * 0.45) + uNear * near * 0.55;
          gl_FragColor = vec4(col, uOpacity);
        }`,
    });

  // ── Card text overlay — border, number, title, date, tag, risograph gold line, bottom band ──
  const W = 512, H = 640;
  const rgba = (c, a = 1) => `rgba(${c.slice(0, 3).map((v) => Math.round(v * 255)).join(",")},${a})`;
  GL.paintCard = (card) => {
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const ink = KT.readColor("--kf-ink"), gold = KT.readColor("--kf-accent"), dark = KT.readColor("--kf-bg");
    const disp = font("--kf-font-display"), mono = font("--kf-font-mono");
    // Rough gold double border — the original has a hand-drawn doubled line
    const frame = (inset, a, w) => {
      g.strokeStyle = rgba(gold, a); g.lineWidth = w;
      g.beginPath();
      for (let s = 0; s < 4; s++) {
        const pts = [[inset, inset], [W - inset, inset], [W - inset, H - inset], [inset, H - inset]];
        const [x0, y0] = pts[s], [x1, y1] = pts[(s + 1) % 4];
        for (let i = 0; i <= 24; i++) {
          const k = i / 24, j = (Math.sin((s * 31 + i) * 12.9898) * 43758.5453) % 1;
          const x = x0 + (x1 - x0) * k + (y0 === y1 ? 0 : j * 1.4), y = y0 + (y1 - y0) * k + (x0 === x1 ? 0 : j * 1.4);
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        }
      }
      g.stroke();
    };
    frame(12, 0.9, 5);
    frame(22, 0.7, 2.2);
    if (card.corner) {
      g.strokeStyle = rgba(gold, 0.9); g.lineWidth = 3;
      for (const [x, y, sx] of [[34, 36, 1], [W - 34, 36, -1]]) { g.beginPath(); g.moveTo(x, y + 28); g.lineTo(x, y); g.lineTo(x + 28 * sx, y); g.stroke(); }
    }
    g.fillStyle = rgba(ink, 0.95);
    g.textBaseline = "alphabetic";
    g.font = `700 15px ${mono}`;
    g.fillText(card.no, 34, 50);
    g.font = `italic 46px ${disp}`;
    g.fillText(card.title, 32, 124, W - 64);
    g.font = `400 16px ${mono}`;
    g.fillText(card.date, 34, 158);
    let x = 34;
    g.font = `700 13px ${mono}`;
    for (const tag of card.tags) {
      const w = g.measureText(tag).width + 14;
      g.fillStyle = rgba(dark, 0.55); g.fillRect(x, 170, w, 22);
      g.strokeStyle = rgba(ink, 0.45); g.lineWidth = 1; g.strokeRect(x + 0.5, 170.5, w - 1, 21);
      g.fillStyle = rgba(ink, 0.95); g.fillText(tag, x + 7, 186);
      x += w + 6;
    }
    // Lissajous curve: a gold inner curve over a white outer curve, plus the spreading glow
    const [a, b, ph] = card.curve;
    const curve = (rx, ry, phase) => {
      g.beginPath();
      for (let i = 0; i <= 900; i++) {
        const t = (i / 900) * Math.PI * 2;
        const px = W / 2 + rx * Math.sin(a * t + phase), py = H * 0.655 + ry * Math.sin(b * t);
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
    };
    g.lineJoin = g.lineCap = "round";
    g.save(); g.shadowColor = rgba(ink, 0.7); g.shadowBlur = 10; g.strokeStyle = rgba(ink, 0.6); g.lineWidth = 2.2; curve(W * 0.4, H * 0.13, ph + 0.6); g.restore();
    g.save(); g.shadowColor = rgba(gold, 0.9); g.shadowBlur = 14; g.strokeStyle = rgba(gold, 0.95); g.lineWidth = 3.4; curve(W * 0.27, H * 0.09, ph); g.restore();
    g.fillStyle = rgba(dark, 0.72);
    g.fillRect(24, H - 88, W - 48, 64);
    g.fillStyle = rgba(ink, 0.95);
    g.font = `700 14px ${mono}`;
    g.textAlign = "center";
    g.fillText(card.name, W / 2, H - 50);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.NoColorSpace;
    tex.anisotropy = 4;
    return tex;
  };

  // Card front: smoke in that card’s color flows slowly and a cover sits on top. The back is a dark face
  GL.cardMaterial = (card) => {
    const c = KT.readColor(card.color);
    const pal = [0.16, 0.42, 0.82, 1].map((k, i) => (i === 3 ? new T.Vector3(...c.map((v) => v + (1 - v) * 0.42)) : new T.Vector3(c[0] * k, c[1] * k, c[2] * k)));
    return new T.ShaderMaterial({
      side: T.DoubleSide, transparent: true,
      uniforms: { uPal: { value: pal }, uMap: { value: GL.paintCard(card) }, uSeed: { value: card.seed || 0 }, uTime: { value: 0 }, uBack: { value: c3("--kf-surface") }, uOpacity: { value: 1 } },
      vertexShader: PLANE_VS,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform vec3 uPal[4], uBack;
        uniform sampler2D uMap;
        uniform float uSeed, uTime, uOpacity;
        ${NOISE}
        void main() {
          if (!gl_FrontFacing) { gl_FragColor = vec4(uBack, uOpacity); return; }
          vec2 p = vUv * vec2(0.8, 1.0) * 2.4 + vec2(uSeed * 3.7, uSeed * 1.3);
          vec2 r;
          float f = smoke(p, uTime * 0.6 + uSeed * 10.0, r);
          vec3 col = stops(uPal[0], uPal[1], uPal[2], uPal[3], f);
          col *= 0.95 + 0.1 * kn(vUv * 240.0);
          vec2 e = min(vUv, 1.0 - vUv);
          col *= 0.7 + 0.3 * smoothstep(0.0, 0.08, min(e.x, e.y));
          vec4 o = texture2D(uMap, vUv);
          col = mix(col, o.rgb, o.a);
          gl_FragColor = vec4(col, uOpacity);
        }`,
    });
  };
  GL.cardGeometry = new T.PlaneGeometry(0.78, 0.975);

  // ”View all” door — a frame where the star stage appears deep inside
  GL.portal = (label) => {
    const group = new T.Group();
    const stars = GL.starMaterial({ density: 17 * 1.0 });
    stars.uniforms.uAspect.value = 0.8;
    const face = new T.Mesh(GL.cardGeometry, stars);
    group.add(face);
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const ink = KT.readColor("--kf-ink");
    g.strokeStyle = rgba(ink, 0.85); g.lineWidth = 2.5; g.strokeRect(6, 6, W - 12, H - 12);
    g.fillStyle = rgba(ink, 1); g.textAlign = "center"; g.font = `400 26px ${font("--kf-font-mono")}`;
    g.save(); g.shadowColor = rgba(ink, 0.8); g.shadowBlur = 14; g.fillText(label, W / 2, H / 2 + 9); g.restore();
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    const top = new T.Mesh(GL.cardGeometry, new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    top.position.z = 0.002;
    group.add(top);
    group.userData = { face, top, stars };
    return group;
  };

  // ── Showcase: top light panel (black lid + white light rim), card stack, bottom base (white top + black side), light bloom ──
  const glowMat = (color, strength) =>
    new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uColor: { value: color }, uK: { value: strength } },
      vertexShader: PLANE_VS,
      fragmentShader: /* glsl */ `varying vec2 vUv; uniform vec3 uColor; uniform float uK;
        void main() { vec2 d = (vUv - 0.5) * 2.0; float a = exp(-dot(d, d) * 3.2) * uK; gl_FragColor = vec4(uColor * a, a); }`,
    });
  GL.vitrine = (cards) => {
    const ink = new T.Color().setRGB(...KT.readColor("--kf-ink"), T.SRGBColorSpace);
    const surf = new T.Color().setRGB(...KT.readColor("--kf-surface"), T.SRGBColorSpace);
    const lit = new T.MeshBasicMaterial({ color: ink });
    const body = new T.MeshStandardMaterial({ color: surf, roughness: 0.6, metalness: 0.1 });
    const g = new T.Group();
    const spin = new T.Group();
    g.add(spin);
    // Base
    const plinth = new T.Mesh(new T.BoxGeometry(1.0, 0.115, 0.56), [body, body, lit, body, body, body]);
    plinth.position.y = -0.6575;
    spin.add(plinth);
    // Light panel — four bars form a white frame, black lid on top
    const lid = new T.Mesh(new T.BoxGeometry(1.04, 0.1, 0.54), body);
    lid.position.y = 0.665;
    spin.add(lid);
    const bars = new T.Group();
    for (const [w, d, x, z] of [[1.0, 0.06, 0, 0.24], [1.0, 0.06, 0, -0.24], [0.06, 0.5, 0.47, 0], [0.06, 0.5, -0.47, 0]]) {
      const m = new T.Mesh(new T.BoxGeometry(w, 0.035, d), lit);
      m.position.set(x, 0.598, z);
      bars.add(m);
    }
    spin.add(bars);
    // Card stack — original layout formula: further back, slightly offset and tilted
    const stack = new T.Group();
    stack.position.y = -0.6 + 0.4875 * 1.0;
    cards.forEach((card, e) => {
      const m = new T.Mesh(GL.cardGeometry, GL.cardMaterial(card));
      m.position.set(-0.012 * e, 0.004 * e, 0.08 - 0.06 * e);
      m.rotation.set(-0.04 - 0.008 * e, -0.025 + 0.012 * e, -0.008 + 0.004 * e);
      m.renderOrder = 10 - e;
      stack.add(m);
    });
    spin.add(stack);
    // Light bloom (bloom in the original) — under the light board and above the base
    const glowA = new T.Mesh(new T.PlaneGeometry(1.5, 0.42), glowMat(ink, 0.2));
    glowA.position.set(0, 0.46, 0.3);
    const glowB = new T.Mesh(new T.PlaneGeometry(1.6, 0.5), glowMat(ink, 0.22));
    glowB.position.set(0, -0.6, 0.32);
    g.add(glowA, glowB);
    const up = new T.PointLight(ink, 3.5, 2.65, 0);
    up.position.set(0, -0.545, 0.2);
    g.add(up);
    g.userData = { spin, stack, plinth, lid, bars };
    return g;
  };

  // ── Grass: grows (uGrow 0→1) beneath the showcase of the hovered branch ──
  GL.grass = () => {
    const N = 900;
    const blade = new T.BufferGeometry();
    blade.setAttribute("position", new T.Float32BufferAttribute([-0.008, 0, 0, 0.008, 0, 0, 0, 1, 0], 3));
    blade.setAttribute("uv", new T.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
    const geo = new T.InstancedBufferGeometry().copy(blade);
    geo.instanceCount = N;
    const off = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      off.set([Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.36, 0.05 + Math.random() * 0.09 * (1.2 - r), Math.random() * 6.28], i * 4);
    }
    geo.setAttribute("aOff", new T.InstancedBufferAttribute(off, 4));
    const mat = new T.ShaderMaterial({
      side: T.DoubleSide,
      uniforms: { uGrow: { value: 0 }, uTime: { value: 0 }, uColor: { value: c3("--site-grass") }, uTip: { value: c3("--kf-accent-soft") } },
      vertexShader: /* glsl */ `
        attribute vec4 aOff; uniform float uGrow, uTime; varying float vT;
        void main() {
          vec3 p = position;
          float r = length(aOff.xy / vec2(0.62, 0.36));
          float g = clamp(uGrow * 1.35 - r * 0.35, 0.0, 1.0);
          g = g * g * (3.0 - 2.0 * g);
          p.y *= aOff.z * g;
          p.x += sin(uTime * 1.6 + aOff.w + aOff.x * 4.0) * 0.012 * position.y;
          float c = cos(aOff.w), s = sin(aOff.w);
          p.xz = mat2(c, -s, s, c) * p.xz;
          p.xz += aOff.xy;
          vT = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `uniform vec3 uColor, uTip; varying float vT;
        void main() { vec3 c = mix(uColor * 0.35, uColor, vT); c += uTip * pow(vT, 4.0) * 0.18; gl_FragColor = vec4(c, 1.0); }`,
    });
    const mesh = new T.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.userData.u = mat.uniforms;
    return mesh;
  };
})();
