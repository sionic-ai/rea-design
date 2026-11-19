(() => {
  // Glass showcase stage. Uses original values (ce and Ve settings table) as is, while shader, shapes, and inner logo are newly written by us.
  const vt = window.vt, T = window.THREE;
  const canvas = document.getElementById("webgl");
  if (!canvas || !T) return;
  const C = {
    FLOOR_Y: -0.07, BOX: 0.06, ZOOM_DEFAULT: 0.2, ZOOM_MIN: 0.12, ZOOM_MAX: 0.36, ZOOM_STEP: 0.04, BEVEL: 1.5, DISPERSION: 0.8,
    RING_SPEED: 0.25, MAX_SPEED: 0.08, PARTICLES: 16000, PARTICLE_SIZE: 0.018, PARTICLE_MOTION: 0.1, REFLECTION: 0.25,
    OPEN: { duration: 3.5, skip: 0.5, revealBeforeEnd: 1, ease: "power3.out", mistEase: "power2.inOut", mistRatio: 0.9 },
    ZOOM_ANIM: { duration: 0.6, ease: "power2.out" }, FLOAT: { speed: 1.2, amplitude: 0.004, spin: 0.002 },
    DRAG: { sensitivity: 0.01, friction: 0.95, hold: 0.5 }, INTENSITY: { smoothing: 0.1, ringBoost: 3 },
    TIME: { enter: { duration: 2.4, ease: "power2.inOut" }, exit: { duration: 2, ease: "power4.out" }, seal: { duration: 0.9, ease: "power3.out", landAt: 0.72 } },
    AGING: [{ years: 1 / 8760, dust: 0, haze: 0, wear: 0 }, { years: 1 / 365, dust: 0.12, haze: 0, wear: 0 }, { years: 1, dust: 0.3, haze: 0.08, wear: 0.25 }, { years: 100, dust: 0.75, haze: 0.7, wear: 0.6 }, { years: 1000, dust: 1, haze: 1, wear: 0.78 }],
    DIAL: 0.175, MAX_YEARS: 1000, MAX_TURNS: 5, GROWTH: 3.2, MS_PER_YEAR: 365.2425 * 24 * 3600 * 1000, SCROLL: 1 / 600, SWIPE: 1 / 150, MOVE_FRICTION: 0.93,
    ABSORB: { stepLimit: 0.15, fillSpeed: 0.3, idleDelay: 0.5, releaseSpeed: 0.25, duration: 2, ease: "power2.in" },
  };
  const S = (vt.stage = { C, canDrag: false, intensity: 0, onTick: null, onSecond: null, onAbsorb: null, absorbProgress: 0, isAtEnd: false });

  // Original stage: field of view 60, transparent background (page color shows through), ACES tone mapping
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  const bgColor = new T.Color();
  const ink = new T.Color().setRGB(...vt.color("--kf-ink"), T.SRGBColorSpace);
  const setBg = (css) => { bgColor.setRGB(...vt.color(css), T.SRGBColorSpace); renderer.setClearColor(bgColor, 0); rttScene.background = bgColor; };

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(60, 1, 0.01, 100);
  scene.add(camera);

  // Inner artwork: a separately drawn 1024² plate (logo, particles, uploaded image) — the box face refracts it into view
  const rt = new T.WebGLRenderTarget(1024, 1024, { samples: 4, generateMipmaps: true, minFilter: T.LinearMipmapLinearFilter });
  rt.texture.colorSpace = T.SRGBColorSpace;
  const rttScene = new T.Scene();
  const rttCamera = new T.PerspectiveCamera(45, 1, 0.1, 100);
  rttCamera.position.set(0, 0, 3);
  rttScene.add(new T.AmbientLight(0xffffff, 1));
  const sun = new T.DirectionalLight(0xffffff, 2); sun.position.set(1, 1, 2); rttScene.add(sun);
  const content = new T.Group(); rttScene.add(content);

  // Placeholder logo: a crown shape with three peaks and two arch holes cut out, extruded at thickness .25 (where the original logo model goes)
  const mark = new T.Shape();
  [[-0.78, -0.72], [0.78, -0.72], [0.78, 0.42], [0.52, 0.72], [0.26, 0.38], [0, 0.72], [-0.26, 0.38], [-0.52, 0.72], [-0.78, 0.42]].forEach(([x, y], i) => (i ? mark.lineTo(x, y) : mark.moveTo(x, y)));
  mark.closePath();
  const arch = (cx) => { const h = new T.Path(); h.moveTo(cx - 0.17, -0.72); h.lineTo(cx - 0.17, -0.15); h.absarc(cx, -0.15, 0.17, Math.PI, 0, true); h.lineTo(cx + 0.17, -0.72); h.closePath(); return h; };
  const holes = [arch(-0.36), arch(0.36)];
  holes.forEach((h) => mark.holes.push(h));
  const logoMat = new T.MeshStandardMaterial({ color: ink, roughness: 0.35, metalness: 0.1 });
  const logo = new T.Mesh(new T.ExtrudeGeometry(mark, { depth: 0.25, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 }), logoMat);
  logo.position.z = -0.12;
  content.add(logo);

  // Engraved text: small at bottom right (where the original BRAND sits)
  const labelCanvas = document.createElement("canvas"); labelCanvas.width = 512; labelCanvas.height = 128;
  const labelTex = new T.CanvasTexture(labelCanvas); labelTex.colorSpace = T.SRGBColorSpace;
  const label = new T.Mesh(new T.PlaneGeometry(0.8, 0.2), new T.MeshBasicMaterial({ map: labelTex, transparent: true }));
  label.position.set(0.45, -1.02, 0.2); label.rotation.z = 0.32;
  content.add(label);
  S.setLabel = (text) => {
    const g = labelCanvas.getContext("2d");
    g.clearRect(0, 0, 512, 128);
    g.fillStyle = getComputedStyle(document.body).color;
    g.font = `400 68px ${vt.css("--kf-font-engrave") || "serif"}`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, 256, 66);
    labelTex.needsUpdate = true;
  };

  // Particle mode: spreads 16000 points evenly across the logo area and ripples with noise (size .018 · motion .1)
  const inShape = (x, y) => {
    const poly = mark.getPoints(), pin = (pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c; } return c; };
    return pin(poly) && !holes.some((h) => pin(h.getPoints()));
  };
  const pos = new Float32Array(C.PARTICLES * 3), seed = new Float32Array(C.PARTICLES);
  for (let i = 0; i < C.PARTICLES; ) {
    const x = (Math.random() * 2 - 1) * 0.8, y = (Math.random() * 2 - 1) * 0.74;
    if (!inShape(x, y)) continue;
    pos.set([x, y, (Math.random() - 0.5) * 0.25], i * 3); seed[i] = Math.random(); i++;
  }
  const pg = new T.BufferGeometry();
  pg.setAttribute("position", new T.BufferAttribute(pos, 3));
  pg.setAttribute("seed", new T.BufferAttribute(seed, 1));
  const pMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uSize: { value: C.PARTICLE_SIZE }, uMotion: { value: C.PARTICLE_MOTION }, uColor: { value: ink } },
    vertexShader: `attribute float seed; uniform float uTime, uSize, uMotion; varying float vA;
      void main(){ vec3 p = position; float t = uTime + seed * 6.2831;
        p += vec3(sin(t * 1.3 + p.y * 4.), cos(t * 1.1 + p.x * 4.), sin(t * .9 + seed * 9.)) * uMotion * .3;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * 1024. / -mv.z; vA = .55 + .45 * seed; }`,
    fragmentShader: `uniform vec3 uColor; varying float vA; void main(){ vec2 c = gl_PointCoord - .5; if (dot(c, c) > .25) discard; gl_FragColor = vec4(uColor, vA); }`,
  });
  const points = new T.Points(pg, pMat); points.visible = false; content.add(points);
  let speed = 1;
  S.setDisplay = (mode) => { const p = mode === "particles"; points.visible = p && !photo.visible; logo.visible = !p && !photo.visible; };
  S.setParticleSize = (v) => (pMat.uniforms.uSize.value = C.PARTICLE_SIZE * v);
  S.setParticleMotion = (v) => (pMat.uniforms.uMotion.value = v / 0.2 * C.PARTICLE_MOTION);
  S.setParticleSpeed = (v) => (speed = v);

  // Uploaded image: shrunk to within 1024 and placed in the same spot (browser only)
  const photo = new T.Mesh(new T.PlaneGeometry(1.6, 1.6), new T.MeshBasicMaterial({ transparent: true }));
  photo.visible = false; content.add(photo);
  let mode = "solid";
  S.setImage = (file) => new Promise((res) => {
    if (!file) { photo.visible = false; S.setDisplay(mode); return res(); }
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1024 / Math.max(img.width, img.height)), cv = document.createElement("canvas");
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
      photo.material.map?.dispose(); photo.material.map = tex; photo.material.needsUpdate = true;
      const a = cv.width / cv.height; photo.scale.set(a >= 1 ? 1 : a, a >= 1 ? 1 / a : 1, 1);
      photo.visible = true; logo.visible = points.visible = false; res();
    };
    img.src = url;
  });
  const _setDisplay = S.setDisplay; S.setDisplay = (m) => { mode = m; _setDisplay(m); };

  // Glass box: reads the inner image by face coordinates, but warps it by how much the line of sight bends at the face (refraction), warping harder toward the edges and splitting red · green · blue for a rainbow border
  const boxUniforms = {
    uTex: { value: rt.texture }, uBevel: { value: C.BEVEL }, uDispersion: { value: C.DISPERSION }, uLight: { value: new T.Vector3(0.4, 1, 0.5).normalize() },
    uHaze: { value: 0 }, uDust: { value: 0 }, uWear: { value: 0 }, uAbsorb: { value: 0 }, uDim: { value: 1 }, uTime: { value: 0 }, uInk: { value: ink },
  };
  const boxMat = new T.ShaderMaterial({
    uniforms: boxUniforms, transparent: true, side: T.FrontSide,
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vV = -mv.xyz; vN = normalize(normalMatrix * normal); vW = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uTex; uniform float uBevel, uDispersion, uHaze, uDust, uWear, uAbsorb, uDim, uTime; uniform vec3 uLight, uInk;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec3 n = normalize(vN), v = normalize(vV);
        vec3 r = refract(-v, n, 1. / 1.5);
        vec2 c = vUv - .5;
        float edge = min(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y));
        float bev = 1. - smoothstep(0., .22, edge);
        vec2 dir = normalize(c + 1e-4);
        vec2 off = r.xy * .18 + dir * bev * bev * .22 * (uBevel / 1.5);
        float d = uDispersion * (.016 + bev * .09);
        vec2 b = c * .94 + .5 + off;
        vec3 col = vec3(texture2D(uTex, b + dir * d).r, texture2D(uTex, b).g, texture2D(uTex, b - dir * d).b);
        float fres = pow(1. - max(dot(n, v), 0.), 3.);
        float lit = max(dot(normalize(vW), uLight), 0.);
        col += uInk * (fres * .55 + (1. - smoothstep(0., .012, edge)) * .45 + lit * bev * .12);
        float dust = step(.985 - uDust * .05, hash(floor(vUv * 220.) + floor(uTime * .0))) * uDust * .5;
        float scratch = smoothstep(.996, 1., fract(vUv.x * 7. + vUv.y * 23. + hash(floor(vUv * 3.)) * 5.)) * uWear;
        col = mix(col, uInk * .82, uHaze * .7) + uInk * (dust + scratch * .5);
        col = mix(col, uInk, uAbsorb);
        gl_FragColor = vec4(col * uDim, uDim < 1. ? clamp(uDim * 3.6, 0., .9) : mix(.96, 1., uHaze));
      }`,
  });
  const box = new T.Mesh(new T.BoxGeometry(C.BOX, C.BOX, C.BOX), boxMat);
  box.rotation.set(0.35, -0.6, 0.12);
  scene.add(box);
  // Box reflected below the floor: flip the same box over the floor plane at .25 brightness
  const mirror = new T.Group(); mirror.scale.y = -1; mirror.position.y = 2 * C.FLOOR_Y; scene.add(mirror);
  const reflMat = boxMat.clone(); reflMat.uniforms = { ...boxUniforms, uDim: { value: C.REFLECTION } }; reflMat.side = T.BackSide;
  const refl = new T.Mesh(box.geometry, reflMat); mirror.add(refl);

  // Floor: a small ring and a large ring under the box, with wave rings spreading between them (faster and brighter by intensity)
  const floorMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uPhase: { value: 0 }, uIntensity: { value: 0 }, uInk: { value: ink }, uFade: { value: 1 } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uPhase, uIntensity, uFade; uniform vec3 uInk; varying vec2 vP;
      float ring(float d, float r, float w){ return 1. - smoothstep(0., w, abs(d - r)); }
      void main(){ float d = length(vP);
        float a = ring(d, .052, .0012) * .55 + ring(d, .215, .0016) * .4;
        for (int i = 0; i < 3; i++) { float rr = fract(uPhase * .35 + float(i) / 3.) * .32; a += ring(d, rr, .0014) * (1. - rr / .32) * (.18 + uIntensity * .5); }
        a *= smoothstep(.45, .2, d) * uFade;
        gl_FragColor = vec4(uInk, a); }`,
  });
  const floor = new T.Mesh(new T.PlaneGeometry(1.2, 1.2), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.y = C.FLOOR_Y; scene.add(floor);

  // Fog ring: on first open, a hazy smoke ring in the center of the screen clears away (a plate stuck to the camera)
  const mistMat = new T.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uMist: { value: 1 }, uTime: { value: 0 }, uAspect: { value: 1 }, uInk: { value: ink } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2., 0., 1.); }`,
    fragmentShader: `uniform float uMist, uTime, uAspect; uniform vec3 uInk; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec2 p = vUv - vec2(.5, .58); p.x *= uAspect; float d = length(p);
        float w = n(p * 4. + uTime * .15) * .08 + n(p * 9. - uTime * .1) * .03;
        float ring = exp(-pow((d - .2 - w) / .075, 2.));
        gl_FragColor = vec4(uInk * .5, ring * uMist * .75); }`,
  });
  const mist = new T.Mesh(new T.PlaneGeometry(1, 1), mistMat); mist.frustumCulled = false; mist.renderOrder = 10; scene.add(mist);

  // Clock face: draw outer ticks 120 · large ticks 12 · numbers · two-line name on the canvas behind the box, and put three hands and a handle dot on top
  const dialCanvas = document.createElement("canvas"); dialCanvas.width = dialCanvas.height = 2048;
  const dialTex = new T.CanvasTexture(dialCanvas); dialTex.colorSpace = T.SRGBColorSpace; dialTex.anisotropy = 4;
  const drawDial = (name, label) => {
    const g = dialCanvas.getContext("2d"), R = 1024, col = getComputedStyle(document.body).color, fam = vt.css("--kf-font-sans");
    g.clearRect(0, 0, 2048, 2048); g.save(); g.translate(R, R);
    g.strokeStyle = g.fillStyle = col;
    for (let i = 0; i < 120; i++) { const a = (i / 120) * Math.PI * 2, major = i % 10 === 0, len = major ? 60 : 26; g.lineWidth = major ? 7 : 3; g.beginPath(); g.moveTo(Math.sin(a) * (R - 40), -Math.cos(a) * (R - 40)); g.lineTo(Math.sin(a) * (R - 40 - len), -Math.cos(a) * (R - 40 - len)); g.stroke(); }
    g.font = `500 52px ${fam}`; g.textAlign = "center"; g.textBaseline = "middle";
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillText(String(i), Math.sin(a) * R * 0.78, -Math.cos(a) * R * 0.78); }
    g.font = `500 46px ${fam}`; g.globalAlpha = 0.7; g.fillText(name, 0, -R * 0.6); g.fillText(label, 0, R * 0.6);
    g.restore(); dialTex.needsUpdate = true;
  };
  const dialMat = new T.MeshBasicMaterial({ map: dialTex, transparent: true, opacity: 0, depthWrite: false });
  const dial = new T.Group(); scene.add(dial);
  dial.add(new T.Mesh(new T.PlaneGeometry(C.DIAL * 2, C.DIAL * 2), dialMat));
  const handMat = new T.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0, depthWrite: false });
  const hand = (len, w, back) => { const g = new T.PlaneGeometry(w, len + back); g.translate(0, (len - back) / 2, 0); const m = new T.Mesh(g, handMat); m.position.z = 0.001; dial.add(m); return m; };
  const hHour = hand(C.DIAL * 0.5, 0.0022, 0.02), hMin = hand(C.DIAL * 0.82, 0.0014, 0.03), hSec = hand(C.DIAL * 1.05, 0.0007, 0.05);
  const knob = new T.Mesh(new T.CircleGeometry(0.0035, 24), handMat); knob.position.z = 0.002; dial.add(knob);
  dial.position.z = -0.045;

  // Aged background: full-screen grain + faint center glow (just a dust’s worth)
  const grainMat = new T.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uDust: { value: 0 }, uBlend: { value: 0 }, uTime: { value: 0 }, uInk: { value: ink }, uAspect: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2., .999, 1.); }`,
    fragmentShader: `uniform float uDust, uBlend, uTime, uAspect; uniform vec3 uInk; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
      void main(){ vec2 p = vUv - .5; p.x *= uAspect; float glow = exp(-dot(p, p) * 7.) * .16 * uBlend;
        float g = (h(gl_FragCoord.xy) - .5) * .16 * uDust * uBlend;
        gl_FragColor = vec4(uInk, max(glow + g, 0.)); }`,
  });
  const grain = new T.Mesh(new T.PlaneGeometry(1, 1), grainMat); grain.frustumCulled = false; grain.renderOrder = -1; scene.add(grain);

  // Size
  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    mistMat.uniforms.uAspect.value = grainMat.uniforms.uAspect.value = w / h;
  };
  addEventListener("resize", resize); resize();

  // State
  const state = { zoomZ: C.ZOOM_DEFAULT, velocity: new T.Vector2(), dragging: false, mist: { value: 1 }, timeBlend: { value: 0 }, sealSpin: { value: 0 }, absorb: boxUniforms.uAbsorb, floorFade: floorMat.uniforms.uFade };
  const clock = new T.Clock();
  const look = () => camera.lookAt(0, 0, 0);

  // Opening scene: camera moves from (0,.82,1.5) to (0,0,.2) over 3.5s power3.out (skipping the first .5s), and screen elements appear 1s before the end. The fog clears over 2.7s power2.inOut.
  camera.position.set(0, 0.82, 1.5); look();
  const openTl = gsap.timeline({ paused: true })
    .to(camera.position, { y: 0, z: C.ZOOM_DEFAULT, duration: C.OPEN.duration, ease: C.OPEN.ease, onUpdate: look }, 0)
    .call(() => S.onReveal?.(), null, C.OPEN.duration - C.OPEN.revealBeforeEnd)
    .seek(C.OPEN.skip);
  look();
  S.opening = () => {
    if (vt.reduce) { openTl.progress(1); state.mist.value = 0; return; }
    state.mistOn = true;
    gsap.to(state.mist, { value: 0, duration: (C.OPEN.duration - C.OPEN.skip) * C.OPEN.mistRatio, ease: C.OPEN.mistEase });
    openTl.play();
  };

  S.zoom = (dir) => {
    state.zoomZ = T.MathUtils.clamp(state.zoomZ - dir * C.ZOOM_STEP, C.ZOOM_MIN, C.ZOOM_MAX);
    gsap.to(camera.position, { z: state.zoomZ, ...C.ZOOM_ANIM, overwrite: true });
    return { canIn: state.zoomZ > C.ZOOM_MIN + 1e-6, canOut: state.zoomZ < C.ZOOM_MAX - 1e-6 };
  };
  S.setRefraction = (v) => { boxUniforms.uBevel.value = C.BEVEL * v; boxUniforms.uDispersion.value = C.DISPERSION * v; };
  S.setBackground = (css) => setBg(css);

  // Drag: grab and drag the box to rotate it on world axes (sensitivity .01), .95 inertia on release, and .5 to stop quickly if held still
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let last = null;
  const hit = (e) => { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObject(box).length > 0; };
  const rotateBox = (x, y) => { box.rotateOnWorldAxis(new T.Vector3(0, 1, 0), x); box.rotateOnWorldAxis(new T.Vector3(1, 0, 0), y); };
  canvas.addEventListener("pointerdown", (e) => { if (!S.canDrag || !hit(e)) return; state.dragging = true; last = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", (e) => {
    if (state.dragging && last) { const dx = e.clientX - last.x, dy = e.clientY - last.y; last = { x: e.clientX, y: e.clientY }; state.velocity.set(dx * C.DRAG.sensitivity, dy * C.DRAG.sensitivity); rotateBox(state.velocity.x, state.velocity.y); return; }
    canvas.style.cursor = S.canDrag && hit(e) ? "grab" : "";
  });
  const release = () => { state.dragging = false; last = null; canvas.style.cursor = ""; };
  canvas.addEventListener("pointerup", release); canvas.addEventListener("pointercancel", release);

  // Guide line spot: points where the box position is mapped to the screen
  const tmp = new T.Vector3();
  S.anchor = () => { tmp.copy(box.position).add(new T.Vector3(innerWidth < 768 ? 0 : 0.02, 0.02, 0)).project(camera); return { x: ((tmp.x + 1) / 2) * innerWidth, y: ((1 - tmp.y) / 2) * innerHeight }; };

  // Time: wheel 600px = One loop, 1000 years in 5 loops (exponent 3.2), the hands show the hour, minute and second of that date
  const tc = (S.time = { active: false, canMove: false, turns: 0, target: 0, start: Date.now(), absorbTarget: 0, idle: 0, absorbing: false, lastSecond: -1 });
  const yearsAt = (turns) => { const x = T.MathUtils.clamp(turns / C.MAX_TURNS, 0, 1); return ((Math.exp(C.GROWTH * x) - 1) / (Math.exp(C.GROWTH) - 1)) * C.MAX_YEARS; };
  tc.getDate = () => new Date(tc.start + yearsAt(tc.turns) * C.MS_PER_YEAR);
  tc.goalYear = () => new Date(tc.start + C.MAX_YEARS * C.MS_PER_YEAR).getFullYear();
  const moveBy = (d) => {
    if (!tc.canMove) return;
    if (tc.target >= C.MAX_TURNS - 1e-4 && d > 0) { tc.absorbTarget = T.MathUtils.clamp(tc.absorbTarget + Math.min(d, C.ABSORB.stepLimit), 0, 1); tc.idle = 0; return; }
    tc.target = T.MathUtils.clamp(tc.target + d, 0, C.MAX_TURNS);
  };
  addEventListener("wheel", (e) => { if (!tc.active || e.ctrlKey) return; const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; moveBy(dy * C.SCROLL); }, { passive: true });
  let swipeY = null;
  canvas.addEventListener("pointerdown", (e) => { if (tc.active && e.pointerType === "touch") swipeY = e.clientY; });
  canvas.addEventListener("pointermove", (e) => { if (swipeY !== null) { moveBy((swipeY - e.clientY) * C.SWIPE); swipeY = e.clientY; } });
  addEventListener("pointerup", () => (swipeY = null));
  const lerpAging = (years) => {
    const A = C.AGING; if (years <= A[0].years) return A[0];
    for (let i = 1; i < A.length; i++) if (years <= A[i].years) { const a = A[i - 1], b = A[i], t = (Math.log(years) - Math.log(a.years)) / (Math.log(b.years) - Math.log(a.years)); return { dust: a.dust + (b.dust - a.dust) * t, haze: a.haze + (b.haze - a.haze) * t, wear: a.wear + (b.wear - a.wear) * t }; }
    return A[A.length - 1];
  };
  // The camera is pulled back so the clock face takes .72 of the height on wide screens and .66 of the width on portrait (ratios measured on the original screen)
  const tanH = Math.tan(T.MathUtils.degToRad(30));
  const timeCam = { get z() { return Math.max((C.DIAL * 2) / 0.72 / (2 * tanH), (C.DIAL * 2) / 0.66 / (2 * tanH * camera.aspect)); } };

  // Closing the showcase: the box spins once (.9s power3.out) and settles at .72s while the clock plate fades in overlapping over 2.4s
  S.seal = (landed) => {
    S.canDrag = false; state.velocity.set(0, 0); openTl.kill(); gsap.killTweensOf(camera.position);
    tc.active = true; tc.canMove = false; tc.turns = tc.target = 0; tc.absorbTarget = 0; S.absorbProgress = 0; tc.start = Date.now();
    state.sealSpin.value = 0;
    gsap.to(state.sealSpin, { value: Math.PI * 2, duration: vt.reduce ? 0 : C.TIME.seal.duration, ease: C.TIME.seal.ease });
    gsap.to(state.timeBlend, { value: 1, ...C.TIME.enter, duration: vt.reduce ? 0 : C.TIME.enter.duration, overwrite: true, onComplete: () => (tc.canMove = true) });
    gsap.to(camera.position, { y: 0, z: timeCam.z, ...C.TIME.enter, duration: vt.reduce ? 0 : C.TIME.enter.duration, onUpdate: look });
    gsap.delayedCall(vt.reduce ? 0 : C.TIME.seal.landAt, () => landed?.());
  };
  S.exitTime = (done) => {
    tc.canMove = false;
    gsap.to(state.timeBlend, { value: 0, ...C.TIME.exit, overwrite: true });
    gsap.to(tc, { turns: 0, target: 0, duration: C.TIME.exit.duration, ease: C.TIME.exit.ease });
    gsap.to(camera.position, { y: 0, z: state.zoomZ, ...C.TIME.exit, onUpdate: look, onComplete: () => { tc.active = false; S.canDrag = true; done?.(); } });
  };
  // Pull-in: the ring fills by the amount scrolled past the end (.3 per second), and after letting go for .5s it drains at .25 per second. When full, the box swallows the light over 2s power2.in
  const absorb = () => {
    tc.absorbing = true; tc.canMove = false;
    gsap.to(state.absorb, { value: 1, duration: C.ABSORB.duration, ease: C.ABSORB.ease, onComplete: () => S.onAbsorb?.() });
  };
  S.receive = () => {
    gsap.to(camera.position, { z: timeCam.z * 0.78, duration: 4, ease: "power2.out", onUpdate: look });
    gsap.to(state.absorb, { value: 0, duration: 1.2, ease: "power2.inOut" });
    gsap.to(state.floorFade, { value: 0.2, duration: 1.2, ease: "power2.out" });
  };
  S.reset = () => {
    tc.active = tc.absorbing = false; tc.turns = tc.target = tc.absorbTarget = 0; S.absorbProgress = 0;
    gsap.to(state.timeBlend, { value: 0, duration: 1.2, ease: "power2.inOut" });
    gsap.to(state.floorFade, { value: 1, duration: 1.2 });
    gsap.to(camera.position, { y: 0, z: (state.zoomZ = C.ZOOM_DEFAULT), duration: 1.2, ease: "power2.inOut", onUpdate: look, onComplete: () => (S.canDrag = true) });
  };
  S.saveImage = () => {
    floor.visible = mirror.visible = false; renderer.setClearColor(bgColor, 1); renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL("image/png");
    floor.visible = mirror.visible = true; renderer.setClearColor(bgColor, 0);
    const a = document.createElement("a"); a.href = url; a.download = "keepsake.png"; a.click();
  };

  // Every frame
  const baseQ = new T.Quaternion(), spinQ = new T.Quaternion(), yAxis = new T.Vector3(0, 1, 0);
  let prevT = 0;
  const frame = () => {
    const t = clock.getElapsedTime(), dt = Math.min(Math.max(t - prevT, 1e-4), 1 / 30); prevT = t;
    // Inertia · floating
    if (state.dragging) state.velocity.multiplyScalar(C.DRAG.hold); else { rotateBox(state.velocity.x, state.velocity.y); state.velocity.multiplyScalar(C.DRAG.friction); }
    box.position.y = vt.reduce ? 0 : Math.sin(t * C.FLOAT.speed) * C.FLOAT.amplitude;
    if (!vt.reduce) box.rotateOnWorldAxis(yAxis, C.FLOAT.spin);
    // The seal spin makes one extra turn over the original pose
    baseQ.copy(box.quaternion); spinQ.setFromAxisAngle(yAxis, state.sealSpin.value);
    // Time
    if (tc.active) {
      tc.turns += (tc.target - tc.turns) * (1 - C.MOVE_FRICTION);
      const atEnd = tc.turns >= C.MAX_TURNS - 0.002;
      S.isAtEnd = atEnd;
      if (atEnd && !tc.absorbing) {
        tc.idle += dt;
        if (tc.idle > C.ABSORB.idleDelay) tc.absorbTarget = Math.max(0, tc.absorbTarget - C.ABSORB.releaseSpeed * dt);
        S.absorbProgress += Math.sign(tc.absorbTarget - S.absorbProgress) * Math.min(Math.abs(tc.absorbTarget - S.absorbProgress), C.ABSORB.fillSpeed * dt * 3);
        if (S.absorbProgress >= 0.999) absorb();
      }
      const date = tc.getDate(), years = yearsAt(tc.turns), ag = lerpAging(years);
      boxUniforms.uDust.value = ag.dust; boxUniforms.uHaze.value = ag.haze; boxUniforms.uWear.value = ag.wear; grainMat.uniforms.uDust.value = ag.dust;
      const s = date.getSeconds(), m = date.getMinutes() + s / 60, h = (date.getHours() % 12) + m / 60;
      hHour.rotation.z = -(h / 12) * Math.PI * 2; hMin.rotation.z = -(m / 60) * Math.PI * 2; hSec.rotation.z = -(s / 60) * Math.PI * 2;
      const ka = (tc.turns % 1) * Math.PI * 2; knob.position.set(Math.sin(ka) * C.DIAL * 0.96, Math.cos(ka) * C.DIAL * 0.96, 0.002);
      S.speed = Math.abs(tc.target - tc.turns) * 0.05;
      if (s !== tc.lastSecond) { tc.lastSecond = s; S.onSecond?.(); }
      S.onTick?.(date);
    } else { boxUniforms.uDust.value *= 0.95; boxUniforms.uHaze.value *= 0.95; boxUniforms.uWear.value *= 0.95; S.speed = 0; }
    const reveal = T.MathUtils.smoothstep(state.timeBlend.value, 0.45, 1);
    dialMat.opacity = handMat.opacity = reveal;
    box.scale.setScalar(1 + 0.35 * state.timeBlend.value); refl.scale.copy(box.scale);
    // Like the original, the floor·reflection are tied to the mist (uMist) — invisible before entry and revealed as the mist clears
    const clear = 1 - state.mist.value;
    reflMat.uniforms.uDim.value = C.REFLECTION * (1 - state.timeBlend.value) * clear;
    refl.visible = reflMat.uniforms.uDim.value > 0.005;
    grainMat.uniforms.uBlend.value = state.timeBlend.value;
    floorMat.uniforms.uFade.value = state.floorFade.value * (1 - state.timeBlend.value * 0.6) * clear;
    // Intensity: follows the drag speed (or time speed) at .1, feeding the base loop speed and the sound filter
    const sp = Math.max(state.velocity.length(), S.speed || 0), target = Math.min(sp / C.MAX_SPEED, 1);
    S.intensity += (target - S.intensity) * C.INTENSITY.smoothing;
    floorMat.uniforms.uPhase.value += dt * C.RING_SPEED * (1 + S.intensity * C.INTENSITY.ringBoost);
    floorMat.uniforms.uIntensity.value = S.intensity;
    mistMat.uniforms.uMist.value = state.mist.value; mistMat.uniforms.uTime.value = t;
    mist.visible = !!state.mistOn && state.mist.value > 0.001;
    pMat.uniforms.uTime.value += dt * speed;
    boxUniforms.uTime.value = t; grainMat.uniforms.uTime.value = t % 10;
    // Reflection box keeps the same pose and position
    refl.quaternion.copy(box.quaternion).premultiply(spinQ); refl.position.copy(box.position);
    box.quaternion.premultiply(spinQ);
    renderer.setRenderTarget(rt); renderer.render(rttScene, rttCamera); renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    box.quaternion.copy(baseQ);
    S.onFrame?.();
  };

  // Preparation: when the font arrives, draws the engraved text and clock face, and precompiles shaders so the first drag doesn’t stall
  setBg("--kf-bg");
  S.ready = (async () => {
    vt.progress = 0.3;
    await document.fonts?.ready;
    S.setLabel("BRAND"); drawDial("Product", "BRAND");
    vt.progress = 0.7;
    renderer.compile(scene, camera); renderer.compile(rttScene, rttCamera);
    vt.progress = 1;
  })();
  S.redrawDial = (label) => drawDial("Product", label);
  // When the background is switched to light and the text color (skin’s data-bright) flips, the white things on the stage flip too
  S.refreshInk = () => {
    ink.setRGB(...vt.color("--kf-ink"), T.SRGBColorSpace);
    logoMat.color.copy(ink); handMat.color.copy(ink);
    const v = document.querySelector(".js-label")?.value || "BRAND";
    S.setLabel(v); drawDial("Product", v);
  };
  gsap.ticker.add(frame);
})();
