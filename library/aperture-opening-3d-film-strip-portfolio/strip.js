/* Film strip — one 35mm frame (width 1 = 38mm) repeated 52 times, flowing endlessly along a 3D curve. Bend and twist are done in the vertex shader.
   Original values: cell gap 1 · wheel deltaY × .0016 · follow tau .32s · speed cap 5 · twist .68 rad (period 2) · speed wobble .16 (period 2.2) · idle wobble .04
   Camera (.6, −.45, 2.37) → (0, .05) · band tilt −.1 · far cells fade to the background color by .85 between 3.25 and 3.8 · screen edges darkened .12
   Photos are black and white (contrast mix .5) — only the center column is in color (.3~.85), inside a 70px magnifier around the cursor (softness 14, 1.35x) is in color, and a click sends out a color ripple (.6s) and small ripples (.045·30·9, .5s) from that spot
   A hovered cell lifts .05 and its edges bend .09 (follow speed 7/s). On the film background, a 130px sparkle .22 around the cursor
   mode: "strip"(Hero) · "sheet"(contact sheet — cells drop in as a grid, vertical wheel .0022) */
(() => {
  const P = {
    spacing: 1, tau: 0.32, wheel: 0.0016, vmax: 5, twistAmp: 0.68, twistFreq: 2, velAmp: 0.16, velFreq: 2.2, rest: 0.04,
    fadeStart: 3.25, fadeEnd: 3.8, fadeStrength: 0.85, edgeDark: 0.12, cam: [0.6, -0.45, 2.37], target: [0, 0.05], diagonal: -0.1,
    bwContrast: 0.5, loupeR: 70, loupeSoft: 14, loupeMag: 1.35, hoverLift: 0.05, hoverCurl: 0.09, hoverSpeed: 7, glintI: 0.22, glintR: 130,
    waveDur: 0.6, cursorLerp: 10, satIn: 0.3, satOut: 0.85, rippleAmp: 0.045, rippleFreq: 30, rippleSpeed: 9, rippleDur: 0.5,
    focusDur: 0.75, focusDelay: 0.15, focusScale: 0.7,
    sheetScale: 0.96, sheetGapX: 0.075, sheetGapY: 0.24, sheetIn: 1.4, sheetStagger: 0.12, sheetDrop: 0.5, sheetWheel: 0.0022, sheetBump: 0.56, sheetBumpR: 0.99, sheetBend: 0.073,
  };
  const IMG_W = 36 / 38, IMG_H = 24 / 38, FILM_H = 35 / 38, BAND = 2 / 35;

  const COMMON = `
    uniform float uScroll; uniform float uVel; uniform float uTotal; uniform float uRest;
    uniform vec2 uTwist; uniform vec2 uVelWave; uniform vec3 uFade;
    uniform vec2 uHoverUV; uniform vec2 uHoverAmt; uniform vec3 uRipple; uniform vec2 uWaveUV;
    uniform float uSheetMix; uniform vec2 uSheetPos; uniform float uSheetDrop; uniform vec3 uSheetBump;
    uniform float uFocus; uniform vec3 uFocusPos; uniform float uFocusScale;
    uniform float uIndex; uniform float uHover; uniform float uRippleT;
    // Position on the strip at the cell center — wind by cell units so it doesn’t tear at the cell center
    float stripS(float i) { return mod(i + uScroll, uTotal) - 0.5 * uTotal; }
    vec3 curvePos(float s) {
      float sway = (uRest + abs(uVel) * uVelWave.x) * sin(s * uVelWave.y + uScroll * 1.7);
      return vec3(s, sway, 0.0);
    }
    vec3 curveTan(float s) {
      float d = (uRest + abs(uVel) * uVelWave.x) * uVelWave.y * cos(s * uVelWave.y + uScroll * 1.7);
      return vec3(1.0, d, 0.0);
    }
    mat3 curveBasis(float s) {
      vec3 T = normalize(curveTan(s));
      vec3 R = normalize(cross(vec3(0.0, 0.0, 1.0), T));
      vec3 N = normalize(cross(T, R));
      float tw = uTwist.x * sin(s * uTwist.y + 0.7);
      vec3 R2 = R * cos(tw) + N * sin(tw);
      return mat3(T, R2, cross(T, R2));
    }
    vec2 imgLocal(vec2 uv) { return vec2((uv.x - 0.5) * ${IMG_W.toFixed(5)}, (uv.y - 0.5) * ${IMG_H.toFixed(5)}); }
    float hoverDz(vec2 lp) { return uHover * (uHoverAmt.x + uHoverAmt.y * smoothstep(0.05, 0.55, distance(lp, imgLocal(uHoverUV)))); }
    float rippleDz(vec2 lp) {
      if (uRippleT <= 0.0) return 0.0;
      float d = distance(lp, imgLocal(uWaveUV));
      return uRipple.x * sin(d * uRipple.y - uRippleT * uRipple.z) * exp(-d * 3.5) * (1.0 - uRippleT) * smoothstep(0.0, 0.06, uRippleT);
    }
    vec3 sheetPlace(vec3 lp, float hz) {
      vec3 p = vec3(uSheetPos.x + lp.x, uSheetPos.y + lp.y + uSheetDrop, lp.z + hz);
      vec2 q = p.xy;
      p.z += uSheetBump.x * exp(-dot(q, q) / (2.0 * uSheetBump.y * uSheetBump.y)) - uSheetBump.z * (q.x * q.x + q.y * q.y * 0.6);
      return p;
    }
    vec3 place(vec3 lp, out float sOut) {
      float s = stripS(uIndex) + lp.x;
      mat3 B = curveBasis(s);
      float hz = hoverDz(lp.xy);
      vec3 bent = curvePos(s) + B * vec3(0.0, lp.y, lp.z + hz + rippleDz(lp.xy));
      vec3 w = mix(bent, sheetPlace(lp, hz * 0.35), uSheetMix);
      float fly = uFocus * (1.0 - uFocus) * 4.0;
      vec3 flat3 = uFocusPos + vec3(lp.xy * uFocusScale, lp.z + 0.07 * fly * sin(lp.x * 9.0 + uFocus * 6.0));
      sOut = s;
      return mix(w, flat3, uFocus);
    }`;
  const VERT = `
    ${COMMON}
    varying vec2 vUv; varying float vFade; varying float vS; varying float vEdge; varying vec3 vN; varying vec3 vView;
    void main() {
      float s;
      vec3 wp = place(position, s);
      vec4 mv = modelViewMatrix * vec4(wp, 1.0);
      gl_Position = projectionMatrix * mv;
      vUv = uv; vS = s;
      vN = normalize(normalMatrix * (curveBasis(s) * vec3(0.0, 0.0, 1.0)));
      vView = normalize(-mv.xyz);
      vFade = 1.0 - uFade.z * smoothstep(uFade.x, uFade.y, length(mv.xyz)) * (1.0 - uSheetMix);
      vEdge = smoothstep(0.55, 1.15, abs(gl_Position.x / max(gl_Position.w, 1e-4))) * (1.0 - uSheetMix);
    }`;
  const FRAG_BASE = `
    precision highp float;
    varying vec2 vUv; varying float vFade; varying float vEdge; varying vec3 vN; varying vec3 vView; varying float vS;
    uniform vec2 uReveal;
    uniform sampler2D uFilm; uniform sampler2D uPrint; uniform vec3 uFadeCol; uniform float uEdgeDark;
    uniform vec2 uCursorPx; uniform vec2 uGlint; uniform float uDim; uniform vec3 uDimCol; uniform float uFocus;
    void main() {
      if (vS < uReveal.x || vS > uReveal.y) discard;
      vec4 f = texture2D(uFilm, vUv);
      if (f.a < 0.5) discard;
      vec3 c = f.rgb;
      // Printed edge strips (top and bottom 2/35) — a different number per cell
      if (vUv.y > ${(1 - BAND).toFixed(5)}) { vec4 e = texture2D(uPrint, vec2(vUv.x, 0.5 + (vUv.y - ${(1 - BAND).toFixed(5)}) / ${BAND.toFixed(5)} * 0.5)); c = mix(c, e.rgb, e.a); }
      else if (vUv.y < ${BAND.toFixed(5)}) { vec4 e = texture2D(uPrint, vec2(vUv.x, vUv.y / ${BAND.toFixed(5)} * 0.5)); c = mix(c, e.rgb, e.a); }
      float rim = pow(1.0 - abs(dot(normalize(vN), vView)), 2.0);
      c += 0.18 * rim;
      float gd = distance(gl_FragCoord.xy, uCursorPx);
      c += uGlint.x * exp(-gd * gd / max(uGlint.y * uGlint.y, 1.0)) * (0.35 + rim);
      c = mix(uFadeCol, c, vFade);
      c *= 1.0 - uEdgeDark * vEdge;
      c = mix(c, uDimCol, uDim * (1.0 - step(0.0001, uFocus)));
      gl_FragColor = vec4(c, 1.0);
    }`;
  const FRAG_IMG = `
    precision highp float;
    varying vec2 vUv; varying float vFade; varying float vEdge; varying float vS;
    uniform vec2 uReveal;
    uniform sampler2D uTex; uniform float uAspect; uniform float uSat; uniform float uBw; uniform vec3 uFadeCol; uniform float uEdgeDark;
    uniform vec2 uCursorPx; uniform vec3 uLoupe; uniform vec2 uHoverUV; uniform float uHover; uniform float uWaveT; uniform vec2 uWaveUV; uniform float uSheetMix; uniform float uDim; uniform vec3 uDimCol; uniform float uFocus;
    vec2 cover(vec2 p) { float pa = ${(IMG_W / IMG_H).toFixed(5)}; if (uAspect > pa) p.x *= pa / uAspect; else p.y *= uAspect / pa; return p + 0.5; }
    void main() {
      if (vS < uReveal.x || vS > uReveal.y) discard;
      // Canvas textures are flipY, so use uv as is (original GLB textures are flipY=false, so read it inverted)
      vec2 p = vUv - 0.5;
      vec2 cp = uHoverUV - 0.5;
      float dpx = distance(gl_FragCoord.xy, uCursorPx);
      float m = uHover * (1.0 - smoothstep(uLoupe.x - uLoupe.y, uLoupe.x + uLoupe.y, dpx));
      vec2 fuv = cover(p), cuv = cover(cp);
      vec3 c = texture2D(uTex, mix(fuv, cuv + (fuv - cuv) / max(uLoupe.z, 1.0), m)).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      l = mix(l, l * l * (3.0 - 2.0 * l), uBw);
      float wm = 0.0;
      if (uWaveT > -0.5) {
        vec2 a = vec2((vUv.x - 0.5) * 1.5, vUv.y - 0.5), b = vec2((uWaveUV.x - 0.5) * 1.5, uWaveUV.y - 0.5);
        float r = uWaveT * 1.15;
        wm = 1.0 - smoothstep(r - 0.09, r + 0.09, distance(a, b));
      }
      float sat = clamp(max(max(uSat, m), max(wm, uSheetMix)), 0.0, 1.0);
      c = mix(vec3(l), c, sat);
      c = mix(uFadeCol, c, vFade);
      c *= 1.0 - uEdgeDark * vEdge;
      c = mix(c, uDimCol, uDim * (1.0 - step(0.0001, uFocus)));
      gl_FragColor = vec4(c, 1.0);
    }`;
  const FRAG_PICK = `
    precision highp float;
    varying vec2 vUv; uniform float uIndex; uniform float uKind;
    void main() { gl_FragColor = vec4((uIndex + 1.0) / 255.0, vUv.x, vUv.y, uKind); }`;

  /* One film base sheet (holes are transparent) — same for every cell */
  function filmCanvas() {
    const W = 1024, H = Math.round(1024 * FILM_H), c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const film = hc.color("--site-film");
    g.fillStyle = film;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "destination-out";
    const holeW = W * 0.0735, holeH = H * 0.0566, pitch = W / 8, off = H * 0.098;
    for (let k = 0; k < 8; k++) {
      const x = pitch * k + (pitch - holeW) / 2;
      for (const y of [off - holeH / 2, H - off - holeH / 2]) { g.beginPath(); g.roundRect(x, y, holeW, holeH, holeH * 0.28); g.fill(); }
    }
    const iw = W * IMG_W, ih = H * (IMG_H / FILM_H);
    g.fillRect((W - iw) / 2, (H - ih) / 2, iw, ih);
    return c;
  }
  /* Edge printing (top half: film name · format, bottom half: frame numbers · triangle marks) */
  function printCanvas(i) {
    const W = 512, H = 64, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = hc.color("--site-film-print");
    g.textBaseline = "middle"; g.textAlign = "center";
    const font = (px) => `700 ${px}px ${hc.css("--kf-font-sans") || "sans-serif"}`;
    g.font = font(20);
    g.fillText("S A M P L E   4 0 0", W * 0.29, 17);
    g.font = font(17);
    g.fillText("SC-36", W * 0.882, 17);
    const n = String(i + 1).padStart(2, "0");
    g.font = font(21);
    g.fillText(n, W * 0.132, 49);
    g.font = font(19);
    g.fillText(n + "A", W * 0.474, 49);
    for (const x of [0.276, 0.632]) { const t = x * W; g.beginPath(); g.moveTo(t - 6, 43); g.lineTo(t - 6, 55); g.lineTo(t + 7, 49); g.closePath(); g.fill(); }
    return c;
  }

  function create(container, opts = {}) {
    const mode = opts.mode || "strip";
    const count = opts.count || 52, photos = opts.photos || 13;
    const reduce = hc.reduce;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    container.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    const group = new THREE.Group();
    scene.add(group);
    const bg = new THREE.Color(hc.color("--kf-bg")), dim = new THREE.Color(hc.color("--kf-contrast-bg"));
    const U = {
      uScroll: { value: 0 }, uVel: { value: 0 }, uTotal: { value: count * P.spacing }, uRest: { value: P.rest },
      uTwist: { value: new THREE.Vector2(P.twistAmp, P.twistFreq) }, uVelWave: { value: new THREE.Vector2(P.velAmp, P.velFreq) },
      uFade: { value: new THREE.Vector3(P.fadeStart, P.fadeEnd, P.fadeStrength) }, uFadeCol: { value: new THREE.Vector3(bg.r, bg.g, bg.b) },
      uEdgeDark: { value: P.edgeDark }, uCursorPx: { value: new THREE.Vector2(-1e4, -1e4) }, uGlint: { value: new THREE.Vector2(P.glintI, P.glintR * dpr) },
      uLoupe: { value: new THREE.Vector3(P.loupeR * dpr, P.loupeSoft * dpr, P.loupeMag) }, uHoverUV: { value: new THREE.Vector2(0.5, 0.5) },
      uHoverAmt: { value: new THREE.Vector2(P.hoverLift, P.hoverCurl) }, uRipple: { value: new THREE.Vector3(P.rippleAmp, P.rippleFreq, P.rippleSpeed) },
      uWaveUV: { value: new THREE.Vector2(0.5, 0.5) }, uBw: { value: P.bwContrast }, uSheetBump: { value: new THREE.Vector3(P.sheetBump * 0.25, P.sheetBumpR, P.sheetBend * 0.15) },
      uFocusPos: { value: new THREE.Vector3() }, uFocusScale: { value: P.focusScale },
      uReveal: { value: new THREE.Vector2(mode === "sheet" ? -1e4 : 1e4, mode === "sheet" ? 1e4 : 10001) },
      uDim: { value: 0 }, uDimCol: { value: new THREE.Vector3(dim.r, dim.g, dim.b) },
    };
    const filmTex = new THREE.CanvasTexture(filmCanvas());
    filmTex.anisotropy = 4;
    const photoTex = Array.from({ length: photos }, (_, i) => { const t = new THREE.CanvasTexture(hc.portrait(i)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; });
    const baseGeo = new THREE.PlaneGeometry(P.spacing, FILM_H, 40, 4);
    const imgGeo = new THREE.PlaneGeometry(IMG_W, IMG_H, 32, 8);
    imgGeo.translate(0, 0, 0.002);
    const frames = [];
    const pickScene = new THREE.Scene();
    for (let i = 0; i < count; i++) {
      const per = { uIndex: { value: i }, uHover: { value: 0 }, uRippleT: { value: 0 }, uWaveT: { value: -1 }, uSheetMix: { value: mode === "sheet" ? 1 : 0 }, uSheetPos: { value: new THREE.Vector2() }, uSheetDrop: { value: 0 }, uFocus: { value: 0 }, uSat: { value: 0 } };
      const printTex = new THREE.CanvasTexture(printCanvas(i));
      const baseMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG_BASE, uniforms: { ...U, ...per, uFilm: { value: filmTex }, uPrint: { value: printTex } }, side: THREE.DoubleSide });
      const imgMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG_IMG, uniforms: { ...U, ...per, uTex: { value: photoTex[i % photos] }, uAspect: { value: 1.5 } }, side: THREE.DoubleSide });
      const base = new THREE.Mesh(baseGeo, baseMat), img = new THREE.Mesh(imgGeo, imgMat);
      base.frustumCulled = img.frustumCulled = false;
      group.add(base, img);
      const pick = new THREE.Mesh(imgGeo, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG_PICK, uniforms: { ...U, ...per, uKind: { value: 1 } }, side: THREE.DoubleSide }));
      pick.frustumCulled = false;
      pickScene.add(pick);
      frames.push({ i, per, base, img, printTex, photo: i % photos });
    }
    const pickRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.UnsignedByteType });
    const pickBuf = new Uint8Array(4);

    /* Contact sheet grid */
    let cols = 7, sheetY = 0, sheetTarget = 0, rowsTotal = 1;
    function layoutSheet() {
      cols = innerWidth < 700 ? 3 : innerWidth < 1100 ? 5 : 7;
      const cw = (P.spacing + P.sheetGapX), rh = (FILM_H + P.sheetGapY);
      const rows = Math.ceil(count / cols);
      rowsTotal = rows * rh;
      frames.forEach((f, k) => {
        const c = k % cols, r = Math.floor(k / cols);
        f.sheetX = (c - (cols - 1) / 2) * cw;
        f.sheetRow = (r - (rows - 1) / 2) * rh;
      });
    }
    layoutSheet();

    let W = 0, H = 0;
    function size() {
      W = container.clientWidth; H = container.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      const narrow = W < 700;
      // About 480px per cell on the original 1440 screen, and about 300px at 390
      camera.fov = mode === "sheet" ? 40 : narrow ? 50 : 35;
      camera.updateProjectionMatrix();
      if (mode === "sheet") layoutSheet();
    }
    function aim() {
      if (mode === "sheet") {
        // Fit cell count − .4 across the screen width — the original also crops both end cells slightly off screen
        const span = (cols - 0.4) * (P.spacing + P.sheetGapX) * P.sheetScale;
        const d = span / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
        camera.position.set(0, 0, d); camera.lookAt(0, 0, 0); group.rotation.z = 0; group.scale.setScalar(P.sheetScale);
        return;
      }
      camera.position.set(...P.cam);
      camera.lookAt(P.target[0], P.target[1], 0);
      group.rotation.z = P.diagonal;
      group.scale.setScalar(W < 700 ? 0.82 : 1);
    }
    const ro = new ResizeObserver(() => { size(); aim(); });
    ro.observe(container);
    size(); aim();
    renderer.compile(scene, camera);
    renderer.compile(pickScene, camera);

    /* Hand */
    const st = { x: 0, target: 0, prev: 0, vel: 0, cx: -1e4, cy: -1e4, lx: -1e4, ly: -1e4, hover: -1, drag: null, focus: null, locked: mode === "strip" };
    const onWheel = (e) => {
      e.preventDefault();
      if (st.focus || st.locked) return;
      if (mode === "sheet") sheetTarget += e.deltaY * P.sheetWheel;
      else st.target -= (e.deltaY + e.deltaX) * P.wheel;
    };
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      st.cx = e.clientX - r.left; st.cy = e.clientY - r.top;
      if (st.drag) {
        const dx = e.clientX - st.drag.x, dy = e.clientY - st.drag.y;
        st.drag.moved += Math.abs(dx) + Math.abs(dy);
        if (mode === "sheet") sheetTarget -= dy / (H * 0.38);
        else if (!st.locked) st.target += dx / (W / 3.2);
        st.drag.x = e.clientX; st.drag.y = e.clientY;
      }
    };
    const onDown = (e) => { st.drag = { x: e.clientX, y: e.clientY, moved: 0 }; container.setPointerCapture && container.setPointerCapture(e.pointerId); };
    const onUp = (e) => {
      const d = st.drag;
      st.drag = null;
      if (d && d.moved < 6) click(e);
    };
    const onLeave = () => { st.cx = st.cy = -1e4; };
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointerup", onUp);
    container.addEventListener("pointerleave", onLeave);

    function pickAt(x, y) {
      if (x < 0 || y < 0 || x > W || y > H) return null;
      camera.setViewOffset(W, H, Math.round(x), Math.round(y), 1, 1);
      renderer.setRenderTarget(pickRT);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(pickScene, camera);
      renderer.readRenderTargetPixels(pickRT, 0, 0, 1, 1, pickBuf);
      renderer.setRenderTarget(null);
      camera.clearViewOffset();
      const id = pickBuf[0] - 1;
      return id >= 0 ? { id, u: pickBuf[1] / 255, v: pickBuf[2] / 255 } : null;
    }
    function click() {
      if (st.focus) return;
      const hit = pickAt(st.cx, st.cy);
      if (!hit) return;
      const f = frames[hit.id];
      U.uWaveUV.value.set(hit.u, hit.v);
      gsap.fromTo(f.per.uWaveT, { value: 0 }, { value: 1, duration: P.waveDur, ease: "none", onComplete: () => { f.per.uWaveT.value = -1; } });
      gsap.fromTo(f.per.uRippleT, { value: 0 }, { value: 1, duration: P.rippleDur, ease: "none", onComplete: () => { f.per.uRippleT.value = 0; } });
      container.dispatchEvent(new CustomEvent("hc:pick", { detail: { index: f.i, photo: f.photo } }));
      if (opts.focus !== false) focusOn(f);
    }
    function focusOn(f) {
      st.focus = f;
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      const pos = camera.position.clone().add(fwd.multiplyScalar(1.5));
      group.worldToLocal(pos);
      U.uFocusPos.value.copy(pos);
      document.body.classList.add("is-focus");
      gsap.to(U.uDim, { value: 1, duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.15, ease: "power2.out" });
      gsap.to(f.per.uFocus, { value: 1, duration: reduce ? 0 : P.focusDur, delay: reduce ? 0 : P.focusDelay, ease: "power2.inOut" });
      container.dispatchEvent(new CustomEvent("hc:focus", { detail: { index: f.i, photo: f.photo, open: true } }));
    }
    function unfocus() {
      const f = st.focus;
      if (!f) return;
      gsap.to(U.uDim, { value: 0, duration: reduce ? 0 : 0.6, ease: "power2.out" });
      gsap.to(f.per.uFocus, { value: 0, duration: reduce ? 0 : P.focusDur, ease: "power2.inOut", onComplete: () => { st.focus = null; document.body.classList.remove("is-focus"); } });
      container.dispatchEvent(new CustomEvent("hc:focus", { detail: { index: f.i, photo: f.photo, open: false } }));
    }

    /* Entrance: the band unfolds from the left · on the photo paper, cells drop in from the top one after another */
    let revealed = mode === "sheet";
    function intro(skip = false) {
      if (mode === "sheet") {
        frames.forEach((f, k) => {
          f.per.uSheetDrop.value = reduce ? 0 : P.sheetDrop + (k % cols) * 0.0;
          if (!reduce) gsap.to(f.per.uSheetDrop, { value: 0, duration: P.sheetIn, delay: Math.floor(k / cols) * P.sheetStagger * 0.5 + (k % cols) * 0.03, ease: "expo.out" });
        });
        return;
      }
      revealed = true;
      const R = U.uReveal.value, half = U.uTotal.value / 2, start = st.target;
      const done = () => { R.set(-1e4, 1e4); st.locked = false; };
      if (reduce || skip) { done(); return; }
      const b = { t: 0 };
      R.set(-2.5, -2.5);
      const tl = gsap.timeline({ onComplete: done });
      tl.to({}, { duration: 0.15 });
      tl.to(b, { t: 1, duration: 2.6, ease: "expo.out", onUpdate: () => { st.target = start + 2.2 * b.t; R.y = -2.5 + (half + 1.5 + 2.5) * b.t; } });
      tl.call(() => { st.locked = false; }, null, "-=0.9");
      tl.to(R, { x: -half - 1.5, duration: 0.8, ease: "power1.inOut" }, "-=0.9");
    }
    if (mode === "sheet") frames.forEach((f) => { f.per.uSheetDrop.value = P.sheetDrop; });

    let last = 0, raf = 0, centered = -1;
    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000));
      last = now;
      const k = 1 - Math.exp(-dt / P.tau);
      st.x += (st.target - st.x) * k;
      const v = Math.max(-P.vmax, Math.min(P.vmax, (st.x - st.prev) / dt));
      st.prev = st.x;
      st.vel += (v - st.vel) * Math.min(1, dt * 6);
      U.uScroll.value = st.x;
      U.uVel.value = st.vel;
      if (mode === "sheet") {
        sheetY += (sheetTarget - sheetY) * (1 - Math.exp(-dt / 0.25));
        frames.forEach((f) => {
          let y = f.sheetRow + sheetY;
          y = ((y + rowsTotal / 2) % rowsTotal + rowsTotal) % rowsTotal - rowsTotal / 2;
          f.per.uSheetPos.value.set(f.sheetX, -y);
        });
      }
      // Cursor follows with lerp 10/s (the magnifier glides)
      const ck = 1 - Math.exp(-dt * P.cursorLerp);
      st.lx = st.lx < -1e3 ? st.cx : st.lx + (st.cx - st.lx) * ck;
      st.ly = st.ly < -1e3 ? st.cy : st.ly + (st.cy - st.ly) * ck;
      if (st.cx < -1e3) st.lx = st.ly = -1e4;
      U.uCursorPx.value.set(st.lx * dpr, (H - st.ly) * dpr);
      const hit = st.focus || st.drag ? null : pickAt(st.lx, st.ly);
      st.hover = hit ? hit.id : -1;
      if (hit) U.uHoverUV.value.set(hit.u, hit.v);
      container.style.cursor = hit ? "pointer" : st.drag ? "grabbing" : "grab";
      document.body.classList.toggle("is-onfilm", !!hit);
      document.body.dataset.frame = hit ? String(frames[hit.id].photo + 1).padStart(2, "0") : "";
      const hk = 1 - Math.exp(-dt * P.hoverSpeed);
      let best = 1e9, bestI = -1;
      frames.forEach((f) => {
        f.per.uHover.value += ((f.i === st.hover ? 1 : 0) - f.per.uHover.value) * hk;
        const s = ((f.i + U.uScroll.value) % U.uTotal.value + U.uTotal.value) % U.uTotal.value - U.uTotal.value / 2;
        f.per.uSat.value = mode === "sheet" ? 1 : 1 - THREE.MathUtils.smoothstep(Math.abs(s), P.satIn, P.satOut);
        if (Math.abs(s) < best) { best = Math.abs(s); bestI = f.i; }
      });
      if (bestI !== centered && mode === "strip") { centered = bestI; container.dispatchEvent(new CustomEvent("hc:center", { detail: { index: bestI, photo: bestI % photos } })); }
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);

    return {
      intro, unfocus, frames, P,
      get revealed() { return revealed; },
      dispose() {
        cancelAnimationFrame(raf); ro.disconnect();
        container.removeEventListener("wheel", onWheel); container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerdown", onDown); container.removeEventListener("pointerup", onUp); container.removeEventListener("pointerleave", onLeave);
        renderer.dispose();
      },
    };
  }
  window.hcStrip = { create };
})();
