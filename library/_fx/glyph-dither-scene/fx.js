(() => {
  // Original dither effect: draws a 3D hand separately and stamps each 12px cell’s brightness as one of five glyphs (cross · empty square · circle · purple cell · pink cell),
  // Leaves mouse trails as a fluid on a 1/8-screen-width grid and covers only those spots with glyphs again. The scene has a threshold-1 bloom (5 stages · 6/10/14/18/22 taps) and
  // Spectral chromatic aberration from 10 samples (strength 1.1 + kick × 8 + (speed − 1) × .45). Holding stacks the speed (smoothDamp 1s · max 5/s) and releasing returns it to 1.
  // Original is three/webgpu + TSL — here the same three version’s WebGLRenderer and newly written GLSL give the same values.
  const TRI = (T) => {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    g.setAttribute("uv", new T.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    return g;
  };
  const QUAD_VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const SS_DOWN = "float ssDown(float a, float b, float x){ float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }";
  // Rainbow ripples made by the fluid trails — used by both the interaction wire and the composite
  const WAVE = `${SS_DOWN}
    vec3 fluidWave(vec4 fl, vec3 k){
      vec2 s = (0.5 - fl.rg) * 2.0;
      vec3 w = sin((vec3(s.x + s.y) * k + 2.5) * 3.0) * ssDown(0.4, -0.9, fl.b * 0.01) * 1.25 * max(abs(s.x), abs(s.y));
      return clamp(w, -0.2, 1000.0);
    }`;
  const GLYPH = `
    uniform sampler2D uAtlas; uniform vec4 uGrid; uniform float uShades;
    vec2 cellCenter(vec2 uv){ return uGrid.xy * (floor(uv * uGrid.zw) + 0.5); }
    vec3 glyph(vec2 uv, float level){
      vec2 loc = fract(uv * uGrid.zw);
      return texture2D(uAtlas, vec2((clamp(level, 0.0, uShades - 1.0) + loc.x) / uShades, loc.y)).rgb;
    }`;

  // A hand built from our basic shapes without photo or model files — forearm, palm, four fingers and thumb, base at y 0
  function handParts(T, low) {
    const seg = low ? [5, 2, 4] : [20, 6, 14];
    const parts = [];
    const add = (geo, pos, rot, scl) => {
      const m = new T.Matrix4().compose(new T.Vector3(...pos), new T.Quaternion().setFromEuler(new T.Euler(...rot)), new T.Vector3(...(scl || [1, 1, 1])));
      geo.applyMatrix4(m);
      parts.push(geo);
    };
    add(new T.CylinderGeometry(0.075, 0.09, 0.36, seg[0], 1, true), [0, 0.32, 0], [0, 0, 0]);
    add(new T.SphereGeometry(1, seg[0], seg[2]), [0, 0.62, 0], [0, 0, 0], [0.15, 0.17, 0.055]);
    const fingers = [[-0.11, 0.24, 0.38, -0.35], [-0.04, 0.3, 0.13, -0.25], [0.03, 0.28, -0.1, -0.3], [0.1, 0.22, -0.32, -0.45]];
    for (const [x, len, fan, curl] of fingers) {
      const f = new T.CapsuleGeometry(0.028, len, seg[1], seg[0] > 6 ? 10 : 5);
      f.translate(0, len / 2 + 0.03, 0);
      add(f, [x, 0.74, 0.01], [curl, 0, fan]);
    }
    const thumb = new T.CapsuleGeometry(0.032, 0.18, seg[1], seg[0] > 6 ? 10 : 5);
    thumb.translate(0, 0.11, 0);
    add(thumb, [0.13, 0.55, 0.04], [0.3, 0, -1.1]);
    return parts;
  }

  // One speck of dust — ring head + rod (pin shape), about 7 long
  function pinGeometry(T) {
    const head = new T.TorusGeometry(1, 0.3, 3, 6).toNonIndexed();
    const stick = new T.CylinderGeometry(0.22, 0.22, 5, 4, 1).toNonIndexed();
    stick.translate(0, -3.4, 0);
    const pos = new Float32Array(head.attributes.position.count * 3 + stick.attributes.position.count * 3);
    pos.set(head.attributes.position.array, 0);
    pos.set(stick.attributes.position.array, head.attributes.position.count * 3);
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3));
    return g;
  }

  // Reads a CSS color (including variables and color-mix) as 0~1 rgb — by painting one dot on a canvas
  function cssColor(el, prop, ctx) {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${prop})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { css: c, rgb: [d[0] / 255, d[1] / 255, d[2] / 255] };
  }

  // Five-glyph board — one cell = Screen cell size, the 1px around each cell is the border color
  function glyphAtlas(T, el, cell, ctx1) {
    const col = (n) => cssColor(el, n, ctx1).css;
    const c = document.createElement("canvas");
    c.width = cell * 5; c.height = cell;
    const g = c.getContext("2d");
    const bg = col("--kf-bg"), edge = col("--fx-glyph-edge");
    for (let i = 0; i < 5; i++) {
      const x0 = i * cell;
      g.fillStyle = edge; g.fillRect(x0, 0, cell, cell);
      g.fillStyle = bg; g.fillRect(x0 + 1, 1, cell - 2, cell - 2);
      const fill = col(`--fx-glyph-${i + 1}`), m = Math.round(cell * 0.17), mid = cell / 2;
      g.fillStyle = fill; g.strokeStyle = fill; g.lineWidth = 1;
      if (i === 0) { g.fillRect(x0 + m + 1, Math.floor(mid), cell - 2 * m - 2, 1); g.fillRect(x0 + Math.floor(mid), m + 1, 1, cell - 2 * m - 2); }
      if (i === 1) g.strokeRect(x0 + m + 0.5, m + 0.5, cell - 2 * m - 1, cell - 2 * m - 1);
      if (i === 2) { g.beginPath(); g.arc(x0 + mid, mid, cell * 0.32, 0, Math.PI * 2); g.fill(); }
      if (i >= 3) g.fillRect(x0 + m, m, cell - 2 * m, cell - 2 * m);
    }
    const t = new T.CanvasTexture(c);
    t.magFilter = t.minFilter = T.NearestFilter;
    t.generateMipmaps = false;
    return t;
  }

  // Unity·GPG4 smoothDamp — the original chases the speed in this form (smoothTime 1 · max 5/s)
  function smoothDamp(state, target, smoothTime, dt, maxSpeed) {
    const omega = 2 / Math.max(1e-4, smoothTime), x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const maxChange = maxSpeed * smoothTime;
    let change = Math.min(Math.max(state.v - target, -maxChange), maxChange);
    const to = state.v - change;
    const temp = (state.vel + omega * change) * dt;
    state.vel = (state.vel - omega * temp) * exp;
    let out = to + (change + temp) * exp;
    if (target - state.v > 0 === out > target) { out = target; state.vel = (out - target) / dt; }
    state.v = out;
  }

  kfFx.register("glyph-dither-scene", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    const probeCanvas = document.createElement("canvas");
    probeCanvas.width = probeCanvas.height = 1;
    const ctx1 = probeCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx1) return;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-glyph-dither-canvas";
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); } catch (e) { return; }
    el.prepend(canvas);

    const cell = +options.cell || 12;
    const shades = 5;
    const spin = +(options.spin ?? 0.65);
    const dustN = Math.max(0, Math.round(+(options.dust ?? 450)));
    const openDur = +(options.open ?? 2);
    const aberr = +(options.aberration ?? 1.1);
    const bloomOn = options.bloom === "off" ? 0 : 1;
    const trail = options.trail !== "off";
    const maxScale = +(options.max ?? 20);
    const shape = options.shape || "hand";
    const waitEnter = options.start === "enter";

    const bg = cssColor(el, "--kf-bg", ctx1).rgb;
    const wire = cssColor(el, "--fx-wire", ctx1).rgb;
    renderer.setClearColor(new T.Color(bg[0], bg[1], bg[2]), 1);
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.7));
    renderer.autoClear = false;
    const atlas = glyphAtlas(T, el, cell, ctx1);

    const half = { type: T.HalfFloatType, depthBuffer: false };
    const fluidOpt = { type: T.HalfFloatType, depthBuffer: false, minFilter: T.LinearFilter, magFilter: T.LinearFilter };
    let fluidA = new T.WebGLRenderTarget(1, 1, fluidOpt), fluidB = new T.WebGLRenderTarget(1, 1, fluidOpt);
    const handRT = new T.WebGLRenderTarget(1, 1, { depthBuffer: true });
    const sceneRT = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, depthBuffer: true });
    const compRT = new T.WebGLRenderTarget(1, 1, half);
    const brightRT = new T.WebGLRenderTarget(1, 1, half);
    const KERNELS = [6, 10, 14, 18, 22], FACTORS = [1, 0.8, 0.6, 0.4, 0.2];
    const mipsH = KERNELS.map(() => new T.WebGLRenderTarget(1, 1, half)), mipsV = KERNELS.map(() => new T.WebGLRenderTarget(1, 1, half));

    const U = {
      time: { value: 0 }, scale: { value: 1 }, kick: { value: 0 }, fluid: { value: fluidA.texture },
      grid: { value: new T.Vector4(1, 1, 1, 1) }, res: { value: new T.Vector2(1, 1) },
    };

    const tri = TRI(T), post = new T.Scene(), postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new T.Mesh(tri);
    quad.frustumCulled = false;
    post.add(quad);
    const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.clear(); renderer.render(post, postCam); };

    // Fluid — blurs the previous frame in a staggered way (3 cells horizontally, 3× aspect ratio vertically), pushes it by flow direction and noise while subtracting .955 and .9, and stamps a trail by mouse velocity
    const fluidMat = new T.ShaderMaterial({
      vertexShader: QUAD_VS, depthTest: false,
      uniforms: { uPrev: { value: null }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uVel: { value: new T.Vector2() }, uDir: { value: new T.Vector2() },
        uOpen: { value: 0.25 }, uAspect: { value: 1 }, uTexel: { value: new T.Vector2() }, uTime: U.time, uInit: { value: 1 } },
      fragmentShader: `precision highp float; varying vec2 vUv;
        uniform sampler2D uPrev; uniform vec2 uMouse, uVel, uDir, uTexel; uniform float uOpen, uAspect, uTime, uInit;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
        void main(){
          if (uInit > 0.5) { gl_FragColor = vec4(0.5, 0.5, 0.0, 1.0); return; }
          vec2 asp = vec2(uAspect, 1.0);
          float speed = length(uVel);
          float r = clamp(pow(smoothstep(0.0, 0.2, speed), 0.85), 0.0, 0.035 * uOpen);
          float d = distance(vUv * asp, uMouse * asp);
          float soft = 1.0 - smoothstep(r * 0.2, r, d);
          float hard = 1.0 - step(r, d);
          vec3 stamp = vec3(mix(vec2(0.0), uDir, hard) * 0.5 + 0.5, clamp(speed * hard * 30.0, 0.0, 1.0));
          vec2 o = vec2(3.0, 3.0 * uAspect) * uTexel;
          vec4 f = texture2D(uPrev, vUv) * 0.25
            + (texture2D(uPrev, vUv + vec2(o.x, 0.0)) + texture2D(uPrev, vUv - vec2(o.x, 0.0)) + texture2D(uPrev, vUv + vec2(0.0, o.y)) + texture2D(uPrev, vUv - vec2(0.0, o.y))) * 0.125
            + (texture2D(uPrev, vUv + o) + texture2D(uPrev, vUv - o) + texture2D(uPrev, vUv + vec2(o.x, -o.y)) + texture2D(uPrev, vUv - vec2(o.x, -o.y))) * 0.0625;
          float q = f.b * 1.4;
          vec2 flow = 0.5 - f.rg;
          vec2 turb = 0.5 - vec2(vn(vUv * 6.0 + uTime * 0.05), vn(vUv * 6.0 + 17.0 - uTime * 0.04));
          vec2 off = flow * 0.027 + turb * 0.005 * q * 1.3;
          vec3 h = texture2D(uPrev, vUv + off).rgb;
          h.rg = (h.rg - 0.5) * 0.955;
          if (abs(h.b) < 1e-4) h.rg = vec2(0.0);
          h.rg += 0.5;
          h.b *= 0.9;
          vec3 c = clamp(mix(h, stamp, clamp(speed * soft * 100.0, 0.0, 1.0)), 0.0, 1.0);
          gl_FragColor = vec4(c, 1.0);
        }`,
    });

    // Hand — bake only brightness from the original three point lights (position and intensity as is, distance² falloff) and use it on the hand plate
    const handMat = new T.ShaderMaterial({
      uniforms: { uGain: { value: +(options.gain ?? 3.6) } },
      vertexShader: `varying vec3 vN; varying vec3 vW;
        void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `precision highp float; varying vec3 vN; varying vec3 vW; uniform float uGain;
        float pl(vec3 p, float k, vec3 n){ vec3 l = p - vW; float d2 = dot(l, l); return k * max(dot(n, normalize(l)), 0.0) / d2; }
        void main(){
          vec3 n = normalize(vN);
          if (!gl_FrontFacing) n = -n;
          float lum = (pl(vec3(3.0, 16.0, -1.0), 45.0, n) + pl(vec3(-12.0, 2.0, -2.0), 19.0, n) + pl(vec3(0.0, -4.0, 1.0), 6.0, n)) * uGain;
          gl_FragColor = vec4(vec3(pow(clamp(lum, 0.0, 1.0), 0.8) + 0.04), 1.0);
        }`,
      side: T.DoubleSide,
    });
    const wireMat = new T.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false, wireframe: true,
      uniforms: { uFluid: U.fluid, uRes: U.res, uKick: U.kick, uWire: { value: new T.Vector3(...wire) } },
      vertexShader: "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `precision highp float; uniform sampler2D uFluid; uniform vec2 uRes; uniform float uKick; uniform vec3 uWire; ${WAVE}
        void main(){
          vec4 fl = texture2D(uFluid, gl_FragCoord.xy / uRes);
          float c = fluidWave(fl, vec3(2.0)).x * 10.0;
          gl_FragColor = vec4(uWire * 1.8, clamp(0.02 * uKick + c, 0.0, 1.0));
        }`,
    });

    const scene = new T.Scene();
    const subject = new T.Group();
    if (shape === "hand") {
      for (const g of handParts(T, false)) { const m = new T.Mesh(g, handMat); m.layers.set(1); subject.add(m); }
      for (const g of handParts(T, true)) { const m = new T.Mesh(g, wireMat); m.layers.set(0); m.renderOrder = 1000; subject.add(m); }
      subject.rotation.set(-0.15, 0, 0.3);
    } else {
      const geo = shape === "knot" ? new T.TorusKnotGeometry(0.32, 0.11, 160, 20).translate(0, 0.5, 0) : new T.IcosahedronGeometry(0.45, 3).translate(0, 0.5, 0);
      const lowGeo = shape === "knot" ? new T.TorusKnotGeometry(0.32, 0.11, 48, 5).translate(0, 0.5, 0) : new T.IcosahedronGeometry(0.45, 1).translate(0, 0.5, 0);
      const m = new T.Mesh(geo, handMat); m.layers.set(1); subject.add(m);
      const w = new T.Mesh(lowGeo, wireMat); w.layers.set(0); w.renderOrder = 1000; subject.add(w);
    }
    const holder = new T.Group();
    holder.add(subject);
    scene.add(holder);
    const subjectBox = new T.Box3().setFromObject(subject).getSize(new T.Vector3());

    // Hand panel in five brightness steps per cell — at the back of the scene (renderOrder −1), clipped by the hand alpha at each cell’s center
    const handQuad = new T.Mesh(tri, new T.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false,
      uniforms: { uHand: { value: handRT.texture }, uAtlas: { value: atlas }, uGrid: U.grid, uShades: { value: shades } },
      vertexShader: QUAD_VS,
      fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D uHand; ${GLYPH}
        void main(){
          vec4 h = texture2D(uHand, cellCenter(vUv));
          float lum = dot(h.rgb, vec3(0.2126, 0.7152, 0.0722));
          gl_FragColor = vec4(glyph(vUv, floor(lum * uShades)), h.a);
        }`,
    }));
    handQuad.frustumCulled = false;
    handQuad.renderOrder = -1;
    scene.add(handQuad);

    // Dust — 450 pinned particles flow across the screen front to back (z −12 → 12) while spinning, 15% grow 1.4x on the kick and get 3x brighter
    const dustOpen = { value: 0 }, randInt = { value: 0 };
    let dust = null;
    if (dustN) {
      const geo = pinGeometry(T);
      const rnd = new Float32Array(dustN * 3);
      for (let i = 0; i < rnd.length; i++) rnd[i] = Math.random();
      geo.setAttribute("aRand", new T.InstancedBufferAttribute(rnd, 3));
      dust = new T.InstancedMesh(geo, new T.ShaderMaterial({
        wireframe: true,
        uniforms: { uTime: U.time, uScale: U.scale, uKick: U.kick, uOpen: dustOpen, uRandInt: randInt },
        vertexShader: `attribute vec3 aRand; uniform float uTime, uScale, uKick, uOpen, uRandInt; varying vec3 vCol;
          float hash(float n){ return fract(sin(n) * 43758.5453); }
          void main(){
            float c = (0.1 + aRand.y * 0.35) * 2.0;
            float g = (uTime + aRand.x) * c;
            float h = fract(g + aRand.x);
            float l = hash(aRand.r * 1e4 + uRandInt);
            float sel = step(0.85, l), selLess = step(0.98, l);
            float b = smoothstep(0.0, 0.2, h) * (c * 0.3 + 1.0) * (1.0 + sel * uKick * 1.4);
            float a = g * 920.0;
            vec3 p = position * b * uOpen;
            p.xy = mat2(cos(a), sin(a), -sin(a), cos(a)) * p.xy;
            vec4 w = modelMatrix * instanceMatrix * vec4(p, 1.0);
            w.z += mix(-12.0, 12.0, h);
            gl_Position = projectionMatrix * viewMatrix * w;
            vCol = aRand * (1.0 + sel * uKick * 3.0) + clamp(uScale - 1.0, 0.0, 1e4) * selLess;
          }`,
        fragmentShader: "precision highp float; varying vec3 vCol; void main(){ gl_FragColor = vec4(vCol, 1.0); }",
      }), dustN);
      const o = new T.Object3D();
      for (let i = 0; i < dustN; i++) {
        o.scale.setScalar(T.MathUtils.randFloat(0.015, 0.033));
        o.position.set(T.MathUtils.randFloat(-8, 8), T.MathUtils.randFloat(-6, 6), 0);
        o.updateMatrix();
        dust.setMatrixAt(i, o.matrix);
      }
      dust.frustumCulled = false;
      scene.add(dust);
    }

    // Fast-forward notice strip — rises at speed 7~10 and the middle bows forward
    const hintText = el.querySelector('[data-fx-part="hint"]')?.textContent.trim() || "";
    let hint = null;
    if (hintText) {
      const hc = document.createElement("canvas");
      hc.width = 704; hc.height = 64;
      const hx = hc.getContext("2d");
      hx.fillStyle = cssColor(el, "--fx-wire", ctx1).css;
      hx.font = `700 34px ${getComputedStyle(el).fontFamily}`;
      hx.textBaseline = "middle";
      hx.fillText(hintText, 12, 34);
      const ht = new T.CanvasTexture(hc);
      ht.wrapS = ht.wrapT = T.RepeatWrapping;
      hint = new T.Mesh(new T.PlaneGeometry(20, 1, 100, 1), new T.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uTex: { value: ht }, uTime: U.time, uScale: U.scale },
        vertexShader: `uniform float uScale; varying vec2 vUv;
          void main(){ vUv = uv; vec3 p = position; float t = (uScale - 6.0) / 10.0; float i = 1.0 - sin(uv.x * 3.14);
            p.z -= i * t * 20.0 + i * 4.0; p.xy *= 1.0 + t * 3.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
        fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform float uTime, uScale;
          void main(){ vec4 c = texture2D(uTex, vUv * vec2(20.0, 1.0) + vec2(uTime * 0.1, 0.0)); c.a *= clamp((uScale - 7.0) / 3.0, 0.0, 1.0); gl_FragColor = c; }`,
      }));
      hint.scale.set(1.2, 0.108, 1);
      hint.renderOrder = 500;
      scene.add(hint);
    }

    // Composite — scene + fluid ripple light (.8), the fluid trace area is covered with glyphs, and bloom is added
    const compMat = new T.ShaderMaterial({
      vertexShader: QUAD_VS, depthTest: false,
      uniforms: { uScene: { value: sceneRT.texture }, uBloom: { value: mipsH[0].texture }, uFluid: U.fluid, uAtlas: { value: atlas }, uGrid: U.grid, uShades: { value: shades }, uBloomOn: { value: bloomOn } },
      fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D uScene, uBloom, uFluid; uniform float uBloomOn; ${WAVE} ${GLYPH}
        void main(){
          vec4 fl = texture2D(uFluid, vUv);
          vec3 col = texture2D(uScene, vUv).rgb + fluidWave(fl, vec3(2.1, 2.2, 2.3)) * 0.8;
          vec4 fc = texture2D(uFluid, cellCenter(vUv));
          col = mix(col, glyph(vUv, floor(pow(fc.r, 0.75) * uShades)), step(0.025, abs(fc.b)));
          col += texture2D(uBloom, vUv).rgb * uBloomOn;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const brightMat = new T.ShaderMaterial({
      vertexShader: QUAD_VS, depthTest: false, uniforms: { uTex: { value: sceneRT.texture } },
      fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D uTex;
        void main(){ vec4 c = texture2D(uTex, vUv); float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722)); gl_FragColor = mix(vec4(0.0), c, smoothstep(1.0, 1.01, l)); }`,
    });
    const blurMats = KERNELS.map((k) => {
      const s = k / 3, w = [];
      for (let i = 0; i < k; i++) w.push((0.39894 * Math.exp((-0.5 * i * i) / (s * s))) / s);
      return new T.ShaderMaterial({
        vertexShader: QUAD_VS, depthTest: false, defines: { KERNEL: k },
        uniforms: { uTex: { value: null }, uDir: { value: new T.Vector2() }, uInv: { value: new T.Vector2() }, uW: { value: w } },
        fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir, uInv; uniform float uW[KERNEL];
          void main(){ vec3 c = texture2D(uTex, vUv).rgb * uW[0];
            for (int i = 1; i < KERNEL; i++){ vec2 o = uDir * uInv * float(i); c += (texture2D(uTex, vUv + o).rgb + texture2D(uTex, vUv - o).rgb) * uW[i]; }
            gl_FragColor = vec4(c, 1.0); }`,
      });
    });
    const bloomMix = new T.ShaderMaterial({
      vertexShader: QUAD_VS, depthTest: false,
      uniforms: { b0: { value: mipsV[0].texture }, b1: { value: mipsV[1].texture }, b2: { value: mipsV[2].texture }, b3: { value: mipsV[3].texture }, b4: { value: mipsV[4].texture }, uF: { value: FACTORS } },
      fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D b0, b1, b2, b3, b4; uniform float uF[5];
        void main(){ gl_FragColor = vec4(texture2D(b0, vUv).rgb * uF[0] + texture2D(b1, vUv).rgb * uF[1] + texture2D(b2, vUv).rgb * uF[2] + texture2D(b3, vUv).rgb * uF[3] + texture2D(b4, vUv).rgb * uF[4], 1.0); }`,
    });
    // Spectral chromatic aberration — pushes 10 samples by an overall distortion (−.044 × t × strength) and blends them with red → green → blue weights
    const finalMat = new T.ShaderMaterial({
      vertexShader: QUAD_VS, depthTest: false, uniforms: { uTex: { value: compRT.texture }, uAmt: { value: aberr } },
      fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform float uAmt;
        vec2 barrel(vec2 uv, float a){ vec2 c = uv - 0.5; return uv + c * dot(c, c) * a; }
        vec4 spectrum(float t){ float lo = step(t, 0.5); float s = clamp(1.0 - abs(2.0 * clamp((t - 1.0 / 6.0) / (4.0 / 6.0), 0.0, 1.0) - 1.0), 0.0, 1.0);
          return pow(vec4(lo, 1.0, 1.0 - lo, 1.0) * vec4(1.0 - s, s, 1.0 - s, 1.0), vec4(1.0 / 2.2)); }
        void main(){ vec4 sum = vec4(0.0), acc = vec4(0.0);
          for (int i = 0; i < 10; i++){ float t = float(i) / 10.0; vec4 w = spectrum(t); sum += w; acc += w * texture2D(uTex, barrel(vUv, -0.044 * t * uAmt)); }
          gl_FragColor = vec4((acc / max(sum, vec4(1e-4))).rgb, 1.0); }`,
    });

    const camera = new T.PerspectiveCamera(45, 1, 1, 100);
    const camInit = new T.Vector3(0, 0, 10), camOpen = camInit.clone().add(new T.Vector3(0, 0, 50)), camExp = new T.Vector3();
    const view = { progress: 0, experience: false };
    const mouse = { static: new T.Vector2(), smooth: new T.Vector2(), prev: new T.Vector2() };
    const time = { elapsed: 0, frames: 0, last: 0 };
    const speed = { v: 1, vel: 0 };
    let target = 1, base = 1, locked = false, holding = false, kickCall = null;
    let W = 1, H = 1, touch = !hover, mobile = false, phase = "intro";

    function resize() {
      W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
      mobile = W < 650;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      const fs = Math.max(8, Math.round(W * 0.125));
      fluidA.setSize(fs, fs); fluidB.setSize(fs, fs);
      fluidMat.uniforms.uTexel.value.set(1 / fs, 1 / fs);
      fluidMat.uniforms.uAspect.value = W / H;
      fluidMat.uniforms.uInit.value = 1;
      handRT.setSize(W, H); sceneRT.setSize(W, H); compRT.setSize(W, H);
      U.res.value.set(W, H);
      U.grid.value.set(cell / W, cell / H, W / cell, H / cell);
      let w = Math.round(W / 2), h = Math.round(H / 2);
      brightRT.setSize(w, h);
      for (let i = 0; i < KERNELS.length; i++) {
        mipsH[i].setSize(w, h); mipsV[i].setSize(w, h);
        blurMats[i].uniforms.uInv.value.set(1 / w, 1 / h);
        w = Math.max(1, Math.round(w / 2)); h = Math.max(1, Math.round(h / 2));
      }
      holder.position.y = mobile ? -4.3 : -5.3;
      const viewH = 2 * Math.tan(T.MathUtils.degToRad(camera.fov) / 2) * camInit.z;
      holder.scale.setScalar((viewH / subjectBox.y) * (mobile ? 0.7 : 0.9));
    }

    function enter() {
      if (phase !== "intro") return;
      phase = "opening";
      el.dispatchEvent(new CustomEvent("fx:state", { bubbles: true, detail: { state: "opening" } }));
      gsap.to(view, { progress: 1, duration: openDur, ease: "sine.out", onComplete: () => {
        view.experience = true; phase = "experience";
        el.dispatchEvent(new CustomEvent("fx:state", { bubbles: true, detail: { state: "experience" } }));
      } });
      gsap.to(dustOpen, { value: 1, duration: 3, ease: "power1.inOut" });
      gsap.to(fluidMat.uniforms.uOpen, { value: 1, duration: 3, ease: "power1.inOut" });
    }

    function updateCamera() {
      const e = touch ? 2 : 4, a = touch ? 0 : 1;
      camExp.set(camInit.x + mouse.smooth.x * e, camInit.y + (mouse.smooth.y - 0.5) * e, camInit.z - Math.abs(mouse.smooth.y) * a - Math.abs(mouse.smooth.x) * a);
      if (view.experience) camera.position.copy(camExp);
      else camera.position.lerpVectors(camOpen, camExp, view.progress);
      camera.lookAt(0, 0, 0);
    }

    function updateSpeed(dt) {
      if (phase !== "experience") return;
      if (!touch && holding && !locked) {
        target = Math.min(Math.max(target + T.MathUtils.lerp(0.02, 0.6, T.MathUtils.smoothstep(speed.v, 4, 8)), 0), maxScale);
      } else target = base;
      if (Math.abs(speed.v - target) > 0.01) smoothDamp(speed, target, 1, Math.max(dt, 1e-4), 5);
      else { speed.v = target; speed.vel = 0; }
    }

    function render() {
      U.time.value = time.elapsed;
      U.scale.value = speed.v;
      finalMat.uniforms.uAmt.value = aberr + U.kick.value * 8 + Math.max(speed.v - 1, 0) * 0.45;
      // Fluid
      if (trail) {
        fluidMat.uniforms.uPrev.value = fluidA.texture;
        fluidMat.uniforms.uMouse.value.set((mouse.smooth.x + 1) * 0.5, (mouse.smooth.y + 1) * 0.5);
        const v = fluidMat.uniforms.uVel.value.set(mouse.smooth.x - mouse.prev.x, mouse.smooth.y - mouse.prev.y);
        fluidMat.uniforms.uDir.value.copy(v).normalize();
        pass(fluidMat, fluidB);
        fluidMat.uniforms.uInit.value = 0;
        [fluidA, fluidB] = [fluidB, fluidA];
        U.fluid.value = fluidA.texture;
      }
      mouse.prev.copy(mouse.smooth);
      subject.rotation.y = time.elapsed * spin;
      // Interaction only
      renderer.setClearAlpha(0);
      camera.layers.set(1);
      renderer.setRenderTarget(handRT); renderer.clear(); renderer.render(scene, camera);
      renderer.setClearAlpha(1);
      camera.layers.set(0);
      renderer.setRenderTarget(sceneRT); renderer.clear(); renderer.render(scene, camera);
      if (bloomOn) {
        pass(brightMat, brightRT);
        let src = brightRT;
        for (let i = 0; i < KERNELS.length; i++) {
          const m = blurMats[i];
          m.uniforms.uTex.value = src.texture; m.uniforms.uDir.value.set(1, 0); pass(m, mipsH[i]);
          m.uniforms.uTex.value = mipsH[i].texture; m.uniforms.uDir.value.set(0, 1); pass(m, mipsV[i]);
          src = mipsV[i];
        }
        pass(bloomMix, mipsH[0]);
      }
      pass(compMat, compRT);
      pass(finalMat, null);
    }

    let ready = false;
    function tick() {
      const now = performance.now() / 1000;
      if (!time.last) time.last = now;
      const real = Math.min(Math.max(now - time.last, 1e-4), 0.1);
      time.last = now;
      time.frames++;
      mouse.smooth.lerp(mouse.static, 0.09 * speed.v);
      updateSpeed(real);
      time.elapsed += real * speed.v;
      updateCamera();
      render();
      el.dispatchEvent(new CustomEvent("fx:tick", { detail: { elapsed: time.elapsed, scale: speed.v, frames: time.frames } }));
      if (!ready) { ready = true; el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true })); }
    }

    const onMove = (e) => {
      mouse.static.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    const onDown = (e) => { if (e.button === 0 || e.button === 2) holding = true; };
    const onUp = () => { holding = false; };
    const onKick = () => {
      U.kick.value = 1;
      randInt.value = T.MathUtils.randInt(0, 1000);
      kickCall?.kill();
      kickCall = gsap.delayedCall(0.15 / Math.max(speed.v, 0.05), () => { U.kick.value = 0; });
    };
    const onSpeed = (e) => {
      const d = e.detail || {};
      if (typeof d.value === "number") base = d.value;
      if (typeof d.lock === "boolean") locked = d.lock;
    };
    const onEnter = () => enter();

    const ro = new ResizeObserver(() => { resize(); if (reduce) render(); });
    ro.observe(el);
    resize();
    el.addEventListener("fx:kick", onKick);
    el.addEventListener("fx:speed", onSpeed);
    if (reduce) {
      view.progress = 1; view.experience = true; phase = "experience";
      dustOpen.value = 1; time.elapsed = 2;
      mouse.smooth.set(0, 0.5);
      updateCamera(); render(); render();
      el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true }));
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      window.addEventListener("blur", onUp);
      document.addEventListener("fx:enter", onEnter);
      gsap.ticker.add(tick);
      if (!waitEnter) enter();
    }

    return () => {
      gsap.ticker.remove(tick);
      kickCall?.kill();
      gsap.killTweensOf([view, dustOpen, fluidMat.uniforms.uOpen]);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      document.removeEventListener("fx:enter", onEnter);
      el.removeEventListener("fx:kick", onKick);
      el.removeEventListener("fx:speed", onSpeed);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      [fluidMat, handMat, wireMat, handQuad.material, compMat, brightMat, bloomMix, finalMat, ...blurMats, dust?.material, hint?.material].forEach((m) => m?.dispose());
      [fluidA, fluidB, handRT, sceneRT, compRT, brightRT, ...mipsH, ...mipsV].forEach((r) => r.dispose());
      atlas.dispose();
      tri.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      canvas.remove();
    };
  });
})();
