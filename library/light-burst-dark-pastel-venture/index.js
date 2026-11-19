// Home: ray hero (three — particle-suction loader → rays spreading from center → fan-shaped crackling serif title), peeling declaration box and hole cover,
// Round-hole results, light-ray wipe · logo strip, three-step icons, news paging (embla).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => matchMedia("(max-width: 768px)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const root = document.documentElement;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const paint = (varName) => {
    const probe = document.createElement("i");
    probe.style.cssText = `display:none;color:var(${varName})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  // Original Curve (CustomEase path as is)
  const easeLoad = CustomEase.create("ecLoadingParticles", "M0,0 C0.46,0 0.637,0.033 0.761,0.19 0.903,0.37 0.93,0.392 1,1");
  const easeAppear = CustomEase.create("ecMvAppear", "M0,0 C0.033,0.504 0.053,0.739 0.182,0.864 0.31,0.987 0.613,1 1,1");
  const easeText = CustomEase.create("ecMvMessageAppear", "M0,0 C0,0.45 0.001,0.736 0.127,0.862 0.259,0.994 0.388,0.982 1,1");
  const easeGlitch = CustomEase.create("ecGlitchPersist", "M0,0 C0.08,0.92 0.2,1 1,1");

  // ================= Hero =================
  const kv = document.querySelector(".ec-kv");
  const canvas = kv.querySelector(".ec-kv__canvas");
  const overlay = kv.querySelector(".ec-kv__overlay");
  const meter = kv.querySelector(".ec-kv__meter i");
  const quote = kv.querySelector(".ec-kv__quote");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(new THREE.Color(paint("--kf-contrast-bg")), 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 5;
  const gradTex = window.ecGradTexture();
  let fw = 1, fh = 1;
  const resize = () => {
    const w = kv.clientWidth, h = kv.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    fw = fh * camera.aspect;
  };
  resize();

  // ----- Rays: 13 large + 5 small. Vertex at center (5% up), outer end beyond the screen corner (1.02). Color is picked from the gradient cell by angle and distance -----
  const rayMat = (opacity = 1) => new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: { uGrid: { value: gradTex }, uOpacity: { value: opacity }, uSpin: { value: 0 } },
    vertexShader: `varying vec2 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xy; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform sampler2D uGrid; uniform float uOpacity; uniform float uSpin; varying vec2 vW;
      void main() {
        float a = atan(vW.y, vW.x) / 6.2831853 + 0.5 + uSpin;
        float r = length(vW);
        vec3 c = texture2D(uGrid, vec2(fract(a), clamp(0.9 - r * 0.16, 0.05, 0.95))).rgb;
        c = mix(vec3(1.0), c, smoothstep(0.0, 2.4, r));
        gl_FragColor = vec4(c, uOpacity);
      }`,
  });
  const wedge = (half, len) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, -half, len, 0, half, len, 0], 3));
    return g;
  };
  const seedRand = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const rnd = seedRand(42);
  const center = new THREE.Group();
  scene.add(center);
  const rays = [];
  const reach = () => Math.hypot(fw, fh) * 0.5 * 1.02 * 1.1;
  const buildRays = () => {
    rays.forEach((r) => center.remove(r.mesh));
    rays.length = 0;
    const L = reach();
    // Pick the angle so the top is 40% (original verticalBalance .4), and spacing .85~1.15 with occasional tight ones
    const n = 18;
    let a = rnd() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const small = i % 4 === 3;
      const gap = rnd() < 0.3 ? 0.1 + rnd() * 0.15 : 0.85 + rnd() * 0.3;
      a += ((Math.PI * 2) / n) * gap;
      const half = L * (0.2 / 5) * (0.4 + rnd() * 0.9) * (small ? 0.6 : 1);
      const mesh = new THREE.Mesh(wedge(half, L), rayMat(1));
      mesh.rotation.z = a - Math.PI / 2;
      mesh.position.z = small ? 0.01 : 0;
      mesh.scale.set(0.05, 0, 1);
      center.add(mesh);
      rays.push({ mesh, delay: rnd() * 1.2 });
    }
    // 6 dark wedges (white outline .25) + 10 outline-only ones — drifting between the rays
    for (let i = 0; i < 16; i++) {
      const dark = i < 6;
      const ang = rnd() * Math.PI * 2, half = L * 0.04 * (dark ? 0.6 : 0.4 + rnd() * 0.4), len = L * (dark ? 0.6 : 0.55 + rnd() * 0.3);
      const g = wedge(half, len);
      const grp = new THREE.Group();
      if (dark) {
        const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(paint("--kf-contrast-bg")), transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
        grp.add(m);
      }
      const line = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: new THREE.Color(paint("--kf-contrast-ink")), transparent: true, opacity: 0.25 }));
      grp.add(line);
      grp.rotation.z = ang - Math.PI / 2;
      grp.position.set(Math.cos(ang) * L * (dark ? 0.25 : 0.23) * 0.4, Math.sin(ang) * L * 0.1, dark ? 0.2 : 0.15);
      grp.scale.set(0.05, 0, 1);
      center.add(grp);
      rays.push({ mesh: grp, delay: rnd() * 1.2, float: { sx: 0.35 + rnd() * 0.4, ph: rnd() * 6.28, base: grp.position.clone(), rot: grp.rotation.z } });
    }
  };
  buildRays();
  center.position.y = fh * 0.05;

  // ----- Title panel: draw in serif on a canvas and attach it to the panel, push the fan-shaped cells (36) outward so it glitches + RGB splits once at first -----
  const titleCanvas = document.createElement("canvas");
  const titleTex = new THREE.CanvasTexture(titleCanvas);
  titleTex.colorSpace = THREE.SRGBColorSpace;
  const titleUniforms = {
    uTex: { value: titleTex },
    uOpacity: { value: 0 },
    uBurst: { value: 0 },
    uSeed: { value: 1 },
    uPersist: { value: 0 },
    uPSeed: { value: 3 },
    uRgb: { value: new THREE.Vector3(0, 0, 0) },
  };
  const titleMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: titleUniforms,
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D uTex; uniform float uOpacity, uBurst, uSeed, uPersist, uPSeed; uniform vec3 uRgb; varying vec2 vUv;
      const float PI = 3.14159265;
      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      vec2 shift(vec2 uv) {
        vec2 c = vec2(0.5, 0.45);
        vec2 d = uv - c;
        float a = atan(d.y, d.x) + PI;
        float r = length(d);
        if (r < 0.01) return uv;
        float s36 = floor(a / (2.0 * PI) * 36.0);
        float on = step(hash(s36 + uSeed * 17.0), 0.2);
        float s12 = floor(a / (2.0 * PI) * 12.0);
        float pon = step(hash(s12 + uPSeed * 11.0), 0.34);
        vec2 dir = d / r;
        return uv - dir * (on * uBurst * 0.18 * hash(s36 + 3.0) + pon * uPersist * 0.12 * 0.18);
      }
      float tap(vec2 uv) { return (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) ? 0.0 : texture2D(uTex, uv).a; }
      void main() {
        vec2 uv = shift(vUv);
        float r = tap(uv + uRgb.x * vec2(cos(0.26), sin(0.26)) * 0.03);
        float g = tap(uv + uRgb.y * vec2(cos(-0.52), sin(-0.52)) * 0.03);
        float b = tap(uv + uRgb.z * vec2(cos(1.92), sin(1.92)) * 0.03);
        float a = max(r, max(g, b));
        vec3 col = mix(vec3(1.0), vec3(r, g, b), 0.9 * step(0.001, uRgb.x + uRgb.y + uRgb.z));
        gl_FragColor = vec4(col, a * uOpacity);
      }`,
  });
  const titlePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), titleMat);
  titlePlane.position.z = 0.3;
  titlePlane.scale.set(0.0001, 0.0001, 1);
  scene.add(titlePlane);
  let titleAspect = 1;
  const drawTitle = () => {
    const lines = kv.querySelector(".ec-kv__title").innerHTML.split(/<br\s*\/?>/).map((s) => s.trim()).filter(Boolean);
    const fam = css("--kf-font-mincho") || "serif";
    const px = 220;
    const ctx = titleCanvas.getContext("2d");
    ctx.font = `400 ${px}px ${fam}`;
    const w = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width)) + px * 0.4);
    const lh = px * 1.12;
    titleCanvas.width = Math.min(4096, w);
    titleCanvas.height = Math.ceil(lh * lines.length + px * 0.3);
    ctx.font = `400 ${px}px ${fam}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = paint("--kf-contrast-ink");
    lines.forEach((l, i) => ctx.fillText(l, titleCanvas.width / 2, px * 0.15 + lh * (i + 0.5)));
    titleAspect = titleCanvas.width / titleCanvas.height;
    // When the board size changes, the GPU-side position must be re-set (fixed-size storage, so uploading as is gets cropped)
    titleTex.dispose();
    titleTex.needsUpdate = true;
  };
  let titleK = 0;
  const placeTitle = () => {
    const width = fw * (narrow() ? 1.5 * 0.82 : 0.72);
    const k = Math.max(0.0001, titleK);
    titlePlane.scale.set(width * k, (width / titleAspect) * k, 1);
    titlePlane.position.y = fh * 0.08 * 0.5;
  };

  // ----- Particle loader: 9000 (6000 on phones) particles float scattered on a ring, then get sucked toward the center -----
  const N = narrow() ? 6000 : 9000;
  const pos = new Float32Array(N * 3), start = new Float32Array(N * 3), col = new Float32Array(N * 3), alpha = new Float32Array(N), speedExp = new Float32Array(N), arrive = new Float32Array(N), ph = new Float32Array(N * 2), fq = new Float32Array(N * 2);
  const gradPx = (() => {
    const p = document.createElement("canvas");
    p.width = 24; p.height = 1;
    const c = p.getContext("2d", { willReadFrequently: true });
    for (let i = 0; i < 24; i++) { c.fillStyle = paint(`--site-grad-${i + 1}`); c.fillRect(i, 0, 1, 1); }
    return c.getImageData(0, 0, 24, 1).data;
  })();
  const seedParticles = () => {
    const a = fw / 2, b = fh / 2, rMin = Math.max(a, b) * 0.35, rMax = Math.max(a, b) * 1;
    const mid = (rMin + rMax) / 2, span = rMax - rMin;
    for (let m = 0; m < N; m++) {
      const x3 = m * 3;
      const th = Math.random() * Math.PI * 2 + (Math.random() - 0.5) * 0.6 * Math.PI * 2;
      let r = THREE.MathUtils.lerp(rMin, rMax, Math.random()) + (Math.random() - 0.5) * 0.6 * span;
      r = THREE.MathUtils.clamp(r, 0, rMax);
      let x = Math.cos(th) * r + (Math.random() - 0.5) * 0.4 * mid;
      let y = Math.sin(th) * r + (Math.random() - 0.5) * 0.4 * mid;
      const d = Math.hypot(x, y);
      if (d > rMax) { x *= rMax / d; y *= rMax / d; }
      start[x3] = pos[x3] = x;
      start[x3 + 1] = pos[x3 + 1] = y;
      start[x3 + 2] = pos[x3 + 2] = (Math.random() - 0.5) * 25 * 0.1;
      const k = Math.floor(Math.random() * 24) * 4;
      col[x3] = gradPx[k] / 255; col[x3 + 1] = gradPx[k + 1] / 255; col[x3 + 2] = gradPx[k + 2] / 255;
      const v = THREE.MathUtils.clamp(Math.hypot(x, y) / rMax, 0, 1);
      speedExp[m] = THREE.MathUtils.lerp(30, 10, v);
      arrive[m] = THREE.MathUtils.clamp(THREE.MathUtils.lerp(0.8, 1, v), 0.05, 1);
      ph[m * 2] = Math.random() * 6.28; ph[m * 2 + 1] = Math.random() * 6.28;
      fq[m * 2] = THREE.MathUtils.lerp(0.1, 0.7, Math.random()); fq[m * 2 + 1] = THREE.MathUtils.lerp(0.1, 0.7, Math.random());
      alpha[m] = 0;
    }
  };
  seedParticles();
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  pGeo.setAttribute("alpha", new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const dot = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, paint("--kf-contrast-ink"));
    rg.addColorStop(1, "transparent");
    g.globalAlpha = 0.5;
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const pMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { uTex: { value: dot }, uSize: { value: Math.max(0.08, Math.min(fw, fh) * 0.016) * 60 } },
    vertexShader: `attribute float alpha; varying vec3 vC; varying float vA; uniform float uSize;
      void main() { vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uSize / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uTex; varying vec3 vC; varying float vA;
      void main() {
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(vC, t.a * vA);
      }`,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);
  // Dot size: shorter screen side × .016 (min .08) world units, converted to screen px
  const sizePoints = () => { pMat.uniforms.uSize.value = Math.max(0.08, Math.min(fw, fh) * 0.016) * (kv.clientHeight / fh) * camera.position.z * renderer.getPixelRatio(); };
  sizePoints();
  const loader = { reveal: 0, suck: 0, floatT: 0 };
  const stepParticles = (dt) => {
    loader.floatT += dt;
    const p = loader.suck, fadeR = Math.max(fw, fh) * 0.5 * 0.1;
    for (let m = 0; m < N; m++) {
      const x3 = m * 3;
      const local = Math.min(1, p / arrive[m]);
      const k = 1 - Math.pow(1 - local, speedExp[m] * 0.1 + 1);
      const amp = Math.max(0.01, Math.max(fw, fh) * 0.008) * Math.pow(1 - p, 1.6);
      const fx = Math.sin(loader.floatT * fq[m * 2] * 6.28 + ph[m * 2]) * amp;
      const fy = Math.cos(loader.floatT * fq[m * 2 + 1] * 6.28 + ph[m * 2 + 1]) * amp;
      pos[x3] = start[x3] * (1 - k) + fx;
      pos[x3 + 1] = start[x3 + 1] * (1 - k) + fy;
      pos[x3 + 2] = start[x3 + 2] * (1 - k);
      const d = Math.hypot(pos[x3], pos[x3 + 1]);
      alpha[m] = loader.reveal * Math.min(1, d / fadeR) * (local >= 1 ? 0 : 1);
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.alpha.needsUpdate = true;
  };

  // ----- Order: loader bar (min .75s + .9s hold) → particle suck-in 1s → rays 2.4s(+width 3.1s) · title 4s starting .6s later → glitch → button · footer text -----
  const intro = gsap.timeline({ paused: true });
  const glitch = { burst: 0 };
  let glitchOn = false;
  const startGlitchLoop = () => {
    if (glitchOn) return;
    glitchOn = true;
    const once = () => {
      const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(gsap.utils.random(4.1, 4.9), once) });
      titleUniforms.uSeed.value = Math.random() * 100;
      let t = 0;
      for (let i = 0; i < 6; i++) {
        const dur = gsap.utils.random(0.015, 0.023), gap = gsap.utils.random(0.004, 0.026);
        tl.set(titleUniforms.uBurst, { value: 0.34 * gsap.utils.random(0.8, 1.2) }, t).set(titleUniforms.uBurst, { value: 0 }, t + dur);
        t += dur + gap;
      }
      tl.to(titleUniforms.uPersist, { value: gsap.utils.random(0.4, 1), duration: 0.8, ease: easeGlitch }, t);
      tl.call(() => { titleUniforms.uPSeed.value = Math.random() * 100; }, null, t);
    };
    gsap.delayedCall(2.4, once);
  };
  intro
    .to(quote, { autoAlpha: 0, duration: 0.5 }, 0)
    .to(loader, { reveal: 0, duration: 0.3 }, 0.9)
    .to(loader, { suck: 1, duration: 1, ease: easeLoad }, 0)
    .add("rays", 0.8);
  rays.forEach((r) => {
    intro.to(r.mesh.scale, { y: 1, duration: 2.4, ease: easeAppear }, `rays+=${r.delay}`);
    intro.to(r.mesh.scale, { x: 1, duration: 3.1, ease: easeAppear }, `rays+=${r.delay + 0.7}`);
  });
  intro.to({ k: 0 }, {
    k: 1,
    duration: 4,
    ease: easeText,
    onUpdate() {
      titleK = 0.05 + this.targets()[0].k * 0.95;
      titleUniforms.uOpacity.value = Math.min(1, this.targets()[0].k * 3);
      placeTitle();
      // At 85% the three RGB panels split apart once at 15°·−30°·110° (they return at .18s after .06s)
      if (!this.rgbDone && this.progress() > 0.85) {
        this.rgbDone = true;
        const v = titleUniforms.uRgb.value;
        gsap.timeline()
          .to(v, { x: 0.8, duration: 0.06, ease: "power2.out" }, 0).to(v, { y: 0.8, duration: 0.06, ease: "power2.out" }, 0.03).to(v, { z: 0.8, duration: 0.06, ease: "power2.out" }, 0.05)
          .to(v, { x: 0, y: 0, z: 0, duration: 0.18, ease: "power4.out" }, 0.13);
      }
    },
  }, "rays+=0.6")
    .call(startGlitchLoop, null, "rays+=0.8")
    .to(overlay, { opacity: 1, duration: 1, ease: "power2.in", onStart: () => overlay.classList.add("is-on") }, "rays+=2.6");

  gsap.set(loader, { reveal: 0 });
  // Draw after the serif font has actually arrived — if @import is late, load() ends empty-handed, so call it once more after ready, and redraw if it arrives late
  const spec = `400 40px ${css("--kf-font-mincho") || "serif"}`;
  // Passing the title with sample text brings down the Korean chunk (unicode-range) too — giving only blanks fetches just the Latin chunk and falls back to a gothic font
  const titleText = kv.querySelector(".ec-kv__title").textContent;
  const fontReady = document.fonts.ready.then(() => document.fonts.load(spec, titleText)).catch(() => {});
  // If the theme font css (@import) attaches late, ready·load finish empty-handed — so retry every .3s until the serif Korean font subset actually arrives, and redraw when it does (up to 5 seconds)
  let tries = 0;
  const retitle = () => {
    document.fonts.load(spec, titleText).then((faces) => {
      // Right after receiving, the canvas may still draw with the old font, so draw once more after two frames and after 1 second
      if (faces.length && document.fonts.check(spec, titleText)) { const redraw = () => { drawTitle(); placeTitle(); }; requestAnimationFrame(() => requestAnimationFrame(redraw)); setTimeout(redraw, 1000); return; }
      if (++tries < 17) setTimeout(retitle, 300);
    }).catch(() => {});
  };
  retitle();
  // Play the loader only once per session (original sessionStorage "loading-played") — on return, starts from the light beam, without bar or quote
  const PLAYED = "ec:loading-played";
  let played = false;
  try { played = sessionStorage.getItem(PLAYED) === "1"; } catch {}
  const meterBox = kv.querySelector(".ec-kv__meter");
  if (played || reduce) gsap.set([meterBox, quote], { autoAlpha: 0 });
  // A returning path doesn’t wait for fonts and stands with everything drawn from the first paint (the original swaps in one scene on arrival) — if the serif font arrives late, only the heading is redrawn
  if (played && !reduce) {
    loader.suck = 1; intro.progress(1); loader.reveal = 0; startGlitchLoop();
    // Draw the title only once, after the serif font arrives (on the path in, the font is already downloaded so a few frames suffice) — drawing with a fallback font first and then swapping changes the screen twice
    titleUniforms.uOpacity.value = 0;
    document.fonts.load(spec, titleText).finally(() => { drawTitle(); placeTitle(); titleUniforms.uOpacity.value = 1; });
  }
  fontReady.then(() => {
    drawTitle();
    placeTitle();
    if (reduce) { intro.progress(1); loader.reveal = 0; return; }
    // On a return visit (original: the mark stays once any other page has been opened) the hero is left fully drawn and only the glitch plays
    if (played) return;
    // Original: the bar rests .9s then fills in .75s, clears in .9s (power4.inOut), while particles appear in .5s, float .7s, then get sucked in
    gsap.timeline()
      .to(meter, { width: "100%", duration: 0.75, ease: "none" }, 0.9)
      .to(meterBox, { autoAlpha: 0, duration: 0.9, ease: "power4.inOut" }, 1.65)
      .to(loader, { reveal: 1, duration: 0.5, ease: "none" }, 1.65)
      .call(() => { intro.play(0); try { sessionStorage.setItem(PLAYED, "1"); } catch {} }, null, 1.65 + 0.5 + 0.7);
  });

  // Floating wedges drift slowly in x·y by .035·.025 width (.35~.75 speed)
  let last = performance.now();
  const tick = () => {
    const now = performance.now(), dt = Math.max(0.001, (now - last) / 1000);
    last = now;
    if (loader.reveal > 0.001 || loader.suck < 1) stepParticles(dt);
    else if (points.visible) points.visible = false;
    const t = now / 1000;
    rays.forEach((r) => {
      if (!r.float) return;
      r.mesh.position.x = r.float.base.x + Math.sin(t * r.float.sx + r.float.ph) * fw * 0.035 * 0.3;
      r.mesh.position.y = r.float.base.y + Math.cos(t * r.float.sx * 0.8 + r.float.ph) * fh * 0.025 * 0.3;
      r.mesh.rotation.z = r.float.rot + Math.sin(t * 0.4 + r.float.ph) * THREE.MathUtils.degToRad(2.5);
    });
    if (kvVisible) renderer.render(scene, camera);
  };
  let kvVisible = true;
  gsap.ticker.add(tick);
  addEventListener("resize", () => { resize(); sizePoints(); placeTitle(); center.position.y = fh * 0.05; });

  // When the next section rises, the hero darkens (bottom → 55%), and drawing stops once it is fully covered
  const gradwrap = document.querySelector(".ec-gradwrap");
  const shade = kv.querySelector(".ec-kv__shade");
  ScrollTrigger.create({
    trigger: gradwrap,
    start: "top bottom",
    end: () => (narrow() ? "top 60%" : "top 55%"),
    scrub: true,
    onUpdate: (self) => {
      shade.style.opacity = self.progress;
      overlay.style.pointerEvents = self.progress > 0.98 ? "none" : "";
      const hide = self.progress > 0.98;
      kvVisible = !hide;
      document.querySelector(".ec-kv-layer").style.visibility = hide ? "hidden" : "";
    },
  });

  // ================= Declaration Box =================
  const msg = document.querySelector(".ec-message");
  const ov = msg.querySelector(".ec-message__overlay");
  const octx = ov.getContext("2d");
  const inner = msg.querySelector(".ec-message__inner");
  const boxes = [...msg.querySelectorAll(".ec-box")].map((el) => ({ el, peel: el.querySelector(".ec-box__peel"), text: el.querySelector(".ec-box__text"), path: el.querySelector(".ec-box__border path"), open: false, rects: [] }));
  const cuts = [...msg.querySelectorAll(".ec-cut")].map((el) => ({ el, a: 0 }));
  let ow = 0, oh = 0;
  const measureMsg = () => {
    const r = inner.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    ow = r.width; oh = r.height;
    ov.width = Math.round(ow * dpr);
    ov.height = Math.round(oh * dpr);
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    boxes.forEach((b) => {
      const prev = b.peel.style.transform;
      b.peel.style.transform = "none";
      b.rects = [...b.text.children].map((s) => { const q = s.getBoundingClientRect(); return { x: q.left - r.left + 1, y: q.top - r.top + 1, w: q.width - 2, h: q.height - 2 }; });
      const pr = b.peel.getBoundingClientRect();
      b.path.setAttribute("d", stairPath(b.rects.map((q) => ({ x: q.x + r.left - pr.left - 1, y: q.y + r.top - pr.top - 1, w: q.w + 2, h: q.h + 2 }))));
      b.peel.style.transform = prev;
    });
    cuts.forEach((c) => { const q = c.el.getBoundingClientRect(); c.rect = { x: q.left - r.left, y: q.top - r.top, w: q.width, h: q.height }; });
  };
  // Trace the outer boundary of the row rectangles as one stepped line (same method as the original)
  function stairPath(rs) {
    if (!rs.length) return "";
    rs = rs.slice().sort((a, b) => a.y - b.y);
    const L = (q) => q.x, R = (q) => q.x + q.w, T = (q) => q.y, B = (q) => q.y + q.h;
    let d = `M ${L(rs[0])} ${T(rs[0])} H ${R(rs[0])}`;
    for (let i = 0; i < rs.length - 1; i++) d += ` V ${B(rs[i])} H ${R(rs[i + 1])}`;
    const z = rs[rs.length - 1];
    d += ` V ${B(z)} H ${L(z)}`;
    for (let i = rs.length - 1; i > 0; i--) d += ` V ${T(rs[i])} H ${L(rs[i - 1])}`;
    return d + ` V ${T(rs[0])} Z`;
  }
  const drawOverlay = () => {
    octx.globalCompositeOperation = "source-over";
    octx.clearRect(0, 0, ow, oh);
    octx.fillStyle = paint("--kf-contrast-bg");
    octx.fillRect(0, 0, ow, oh);
    octx.globalCompositeOperation = "destination-out";
    boxes.forEach((b) => b.open && b.rects.forEach((q) => octx.fillRect(q.x, q.y, q.w, q.h)));
    cuts.forEach((c) => {
      if (c.a <= 0 || !c.rect) return;
      octx.globalAlpha = c.a;
      octx.fillRect(c.rect.x, c.rect.y, c.rect.w, c.rect.h);
    });
    octx.globalAlpha = 1;
  };
  let dirty = true;
  gsap.ticker.add(() => { if (dirty) { dirty = false; drawOverlay(); } });
  const remeasure = () => { measureMsg(); dirty = true; };
  remeasure();
  new ResizeObserver(remeasure).observe(inner);
  document.fonts.ready.then(remeasure);

  boxes.forEach((b) => {
    const sp = narrow();
    const attr = (k) => parseFloat((sp ? b.el.dataset[`${k}Sp`] : undefined) ?? b.el.dataset[k]);
    const skew = attr("skew"), rot = attr("rotate"), dy = attr("dy"), dx = parseFloat(b.el.dataset.dx || 0);
    // Text is split with SplitText and kept hidden, then switched on at 80% of the viewport (power3.inOut, .8s total)
    const split = new SplitText(b.text.querySelectorAll("span"), { type: "chars", charsClass: "ch" });
    const len = b.path.getTotalLength ? 4000 : 0;
    if (reduce) {
      b.open = true;
      gsap.set(b.peel, { transformOrigin: "50% 0%", xPercent: dx, yPercent: dy, rotationX: 22, rotate: rot, skewX: skew });
      return;
    }
    gsap.set(split.chars, { autoAlpha: 0 });
    gsap.set(b.path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ scrollTrigger: { trigger: b.el, start: "top 80%", toggleActions: "play none none none" } })
      .to(split.chars, { autoAlpha: 1, duration: touch ? 0.22 : 0.01, ease: "power3.inOut", stagger: { amount: 0.8, from: "start" } })
      .eventCallback("onComplete", () => { b.open = true; dirty = true; });
    // At 57% of the screen: border (.22s, starts at .088s) → at .34s peel 1.4s power3.out (xPercent · yPercent · rotationX 22 · rotate · skewX on the top center axis) → float (y +6, 1°, 2.2s)
    const peel = gsap.timeline({ scrollTrigger: { trigger: b.el, start: "top 57%", toggleActions: "play none none none" } });
    // The original is "power1.inout"(lowercase), so it runs on GSAP’s default curve (power1.out)
    peel.to(b.path, { strokeDashoffset: 0, duration: 0.22, ease: "power1.out" }, 0.088)
      .to(b.peel, {
        transformOrigin: "50% 0%",
        transformPerspective: 0,
        xPercent: dx,
        yPercent: dy,
        rotationX: 22,
        rotate: rot,
        skewX: skew,
        duration: 1.4,
        ease: "power3.out",
        onStart: () => { b.open = true; dirty = true; },
      }, 0.34)
      .to(b.peel, { y: "+=6", rotate: `+=1`, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 }, ">");
  });
  // Hole cell: opens while blinking six times over +260px, starting at 80% of the screen
  cuts.forEach((c) => {
    if (reduce) { c.a = 1; return; }
    ScrollTrigger.create({
      trigger: c.el,
      start: "top 80%",
      end: "+=260",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        c.a = p < 0.35 ? (Math.floor((p / 0.35) * 12) % 2 ? 1 : 0.15) * Math.min(1, p / 0.05) : 1;
        dirty = true;
      },
    });
  });

  // ================= Track record =================
  const ach = document.querySelector(".ec-ach");
  const layer = ach.querySelector(".ec-ach__layer");
  const lctx = layer.getContext("2d");
  const nums = [...ach.querySelectorAll(".ec-num")];
  const drawAch = () => {
    const r = ach.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    layer.width = Math.round(r.width * dpr);
    layer.height = Math.round(r.height * dpr);
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.fillStyle = paint("--kf-bg");
    lctx.fillRect(0, 0, r.width, r.height);
    lctx.globalCompositeOperation = "destination-out";
    nums.forEach((n) => {
      const q = n.getBoundingClientRect();
      lctx.beginPath();
      lctx.arc(q.left - r.left + q.width / 2, q.top - r.top + q.height / 2, (q.width / 2) * 0.96, 0, Math.PI * 2);
      lctx.fill();
    });
    lctx.globalCompositeOperation = "source-over";
  };
  drawAch();
  new ResizeObserver(drawAch).observe(ach);
  const numTL = (tl, n, at) => {
    const ring = n.querySelector("circle"), fill = n.querySelector(".ec-num__cover > i");
    const value = n.querySelector(".ec-num__value"), label = n.querySelector(".ec-num__label"), unit = n.querySelector(".ec-num__unit");
    const L = 2 * Math.PI * 48;
    gsap.set(ring, { attr: { "stroke-dasharray": L, "stroke-dashoffset": L } });
    value.innerHTML = [...value.textContent].map((c) => `<span class="d">${c}</span>`).join("");
    const digits = value.querySelectorAll(".d");
    gsap.set(digits, { autoAlpha: 0, yPercent: 10 });
    gsap.set([label, unit], { autoAlpha: 0, y: 10 });
    tl.to(ring, { attr: { "stroke-dashoffset": 0 }, duration: 0.3, ease: "power4.inOut" }, at)
      .to(fill, { scaleY: 0, duration: 0.5, ease: "power4.inOut" }, at + 0.3)
      .to(digits, touch
        ? { autoAlpha: 1, yPercent: 0, duration: 0.22, ease: "power2.out", stagger: { each: 0.04 } }
        : { keyframes: [{ autoAlpha: 1, duration: 0.06 }, { autoAlpha: 0, duration: 0.06 }, { autoAlpha: 1, duration: 0.06 }, { autoAlpha: 0, duration: 0.06 }, { autoAlpha: 1, duration: 0.06 }, { autoAlpha: 0, duration: 0.06 }, { autoAlpha: 1, duration: 0.06 }], yPercent: 0, stagger: { each: 0.08 } }, at + 0.6)
      .to([label, unit], { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, at + 0.8);
  };
  if (!reduce) {
    if (narrow()) {
      nums.forEach((n) => { const tl = gsap.timeline({ scrollTrigger: { trigger: n, start: "top 80%", once: true } }); numTL(tl, n, 0); });
    } else {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ach.querySelector(".ec-ach__nums"), start: "-30% 50%", end: "bottom 60%" } });
      nums.forEach((n, i) => numTL(tl, n, i * 0.45));
    }
  } else {
    gsap.set(ach.querySelectorAll(".ec-num__cover > i"), { scaleY: 0 });
  }

  // ================= Light sweep · Logo strip =================
  const spark = document.querySelector(".ec-spark");
  ScrollTrigger.create({ trigger: spark, start: "top 70%", once: true, onEnter: () => spark.classList.add("is-lit") });
  const track = spark.querySelector(".ec-marquee__track");
  const cells = [...track.children];
  cells.forEach((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); track.append(k); });
  if (!reduce) {
    let tw;
    const runMarquee = () => {
      tw?.kill();
      const setW = track.scrollWidth / 2;
      gsap.set(track, { x: 0 });
      // Original: flows over 50 seconds by the width of one set and repeats endlessly
      tw = gsap.to(track, { x: -setW, duration: 50, ease: "none", repeat: -1 });
    };
    runMarquee();
    addEventListener("resize", runMarquee);
  }

  // ================= Three-step icons =================
  const icons = [...document.querySelectorAll(".ec-icon")];
  const parts = (svg) => ({ l: svg.querySelector(".ec-icon__l"), r: svg.querySelector(".ec-icon__r"), c: svg.querySelector(".ec-icon__c"), o: svg.querySelector(".ec-icon__overlap") });
  const A = (tl, p) => {
    gsap.set([p.l, p.r], { autoAlpha: 0, xPercent: 0, yPercent: (i) => (i === 0 ? -26 : 26) });
    gsap.set(p.o, { autoAlpha: 0 });
    tl.to([p.l, p.r], { autoAlpha: 0.8, xPercent: (i) => (i === 0 ? -16 : 16), yPercent: (i) => (i === 0 ? -16 : 16), ease: "power3.out", duration: 0.6 })
      .to([p.l, p.r], { autoAlpha: 1, xPercent: 0, yPercent: 0, ease: "power3.inOut", duration: 0.4 }, "-=0.2")
      .to(p.o, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, "-=0.1");
  };
  const B = (tl, p, at) => {
    gsap.set(p.l, { autoAlpha: 0, xPercent: -6 });
    gsap.set(p.r, { autoAlpha: 0, xPercent: 6 });
    gsap.set(p.c, { autoAlpha: 0, scale: 0.95, transformOrigin: "center" });
    gsap.set(p.o, { autoAlpha: 0, scale: 0, rotate: 540, transformOrigin: "center center" });
    tl.to(p.l, { autoAlpha: 1, xPercent: 0, duration: 0.64, ease: "power4.out" }, at)
      .to(p.r, { autoAlpha: 1, xPercent: 0, duration: 0.64, ease: "power4.out" }, "<+=0.2")
      .to(p.c, { autoAlpha: 1, scale: 1, duration: 0.65, ease: "power4.out" }, "<+=0.2")
      .to(p.o, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.8, ease: "power4.inOut" }, "-=1");
  };
  const C = (tl, p, at) => {
    gsap.set(p.l, { autoAlpha: 0, xPercent: 16 });
    gsap.set(p.r, { autoAlpha: 0, xPercent: -16 });
    const L = p.c.getTotalLength();
    gsap.set(p.c, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set(p.o, { autoAlpha: 0, scale: 0, transformOrigin: "center center" });
    tl.to(p.c, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }, at)
      .to(p.o, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power4.inOut" }, "<-=0.3")
      .to([p.l, p.r], { autoAlpha: 1, xPercent: 0, duration: 0.6, ease: "power4.inOut" }, "<+=0.7");
  };
  if (!reduce && icons.length === 3) {
    const [a, b, c] = icons.map(parts);
    if (narrow()) {
      [[icons[0], (tl) => A(tl, a)], [icons[1], (tl) => B(tl, b, 0)], [icons[2], (tl) => C(tl, c, 0)]].forEach(([el, build]) => {
        build(gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } }));
      });
    } else {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".ec-supports", start: "top 70%", once: true } });
      A(tl, a);
      B(tl, b, "-=0.9");
      C(tl, c, "-=1.2");
    }
  }

  // ================= News slider (embla: align start · one slide at a time) =================
  const slider = document.querySelector(".ec-topics__slider");
  if (slider && window.EmblaCarousel) {
    const embla = EmblaCarousel(slider.querySelector(".embla__viewport"), { align: "start", slidesToScroll: 1, containScroll: false, skipSnaps: false });
    const dotsBox = slider.querySelector(".ec-topics__dots");
    const prog = slider.querySelector(".ec-topics__progress");
    const prev = slider.querySelector(".ec-topics__prev"), next = slider.querySelector(".ec-topics__next");
    const dots = embla.scrollSnapList().map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "ec-topics__dot";
      d.setAttribute("aria-label", `${i + 1}Nth`);
      d.addEventListener("click", () => embla.scrollTo(i));
      dotsBox.append(d);
      return d;
    });
    const sync = () => {
      const i = embla.selectedScrollSnap();
      dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
      prev.disabled = !embla.canScrollPrev();
      next.disabled = !embla.canScrollNext();
      const first = dots[0], cur = dots[i];
      if (first && cur) {
        const a = first.offsetLeft + first.offsetWidth / 2, b = cur.offsetLeft + cur.offsetWidth / 2;
        prog.style.setProperty("--p-start", `${a}px`);
        prog.style.setProperty("--p-w", `${b - a}px`);
      }
    };
    prev.addEventListener("click", () => embla.scrollPrev());
    next.addEventListener("click", () => embla.scrollNext());
    embla.on("select", sync).on("reInit", sync);
    sync();
  }
})();
