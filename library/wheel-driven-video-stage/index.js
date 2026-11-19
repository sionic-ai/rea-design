// Home page stage — the page doesn’t scroll, time flows. Left alone, scenes advance at their own pace (first 10s · product loop 10s · usage scene 6.08s · blue 7s · last 7s, back to the start at the end),
// Wheel and drag wind or rewind by that amount (as in the original, it follows the wheel amount .2 per frame and decays .2). The image is a single three.js plane with our shader:
// The product ring video (background removed by brightness difference) and the in-use scene video (covers the screen) smear in the direction of travel by how fast they are reeled, and a thin ribbon line is drawn and then erased.
(() => {
  const THREE = window.THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const stage = document.getElementById("stage");
  const canvas = stage.querySelector(".k-canvas");
  const scenes = [...stage.querySelectorAll(".k-scene")].map((el) => ({ el, type: el.dataset.scene, dur: +el.dataset.dur, product: +(el.dataset.product ?? -1) }));
  let acc = 0;
  scenes.forEach((s) => { s.start = acc; acc += s.dur; });
  const TOTAL = acc;

  // ── Read the skin color and pass it to the shader (any color notation converted to rgb via canvas) ──
  const probe = document.createElement("canvas").getContext("2d");
  const cssColor = (name) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = "transparent";
    probe.fillStyle = getComputedStyle(root).getPropertyValue(name).trim() || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(r / 255, g / 255, b / 255);
  };

  const ACCENT = cssColor("--kf-accent"), INK_ON_BLUE = cssColor("--kf-contrast-ink");

  // ── Video ──
  const makeVideo = (src) => {
    const v = document.createElement("video");
    Object.assign(v, { src, muted: true, loop: true, playsInline: true, preload: "auto" });
    v.setAttribute("muted", "");
    return v;
  };
  const loopVideo = makeVideo("loop-placeholder.mp4");
  const useVideo = makeVideo("use-placeholder.mp4");
  const USE_IN = 0.5;

  // ── three ──
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
  let W = 1, H = 1;

  const vert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  // Video smear: shot 12 times split along the direction of travel (uDir) and averaged. For ring video, the background is removed by difference from the corner color (uKey)
  const videoFrag = `
    uniform sampler2D map; uniform vec2 uDir; uniform float uAmt; uniform float uOpacity; uniform float uKey;
    varying vec2 vUv;
    vec4 tap(vec2 uv){
      vec4 c = texture2D(map, clamp(uv, 0.001, 0.999));
      vec3 bg = texture2D(map, vec2(0.03, 0.97)).rgb;
      float a = mix(1.0, smoothstep(0.035, 0.14, distance(c.rgb, bg)), uKey);
      return vec4(c.rgb * a, a);
    }
    void main(){
      vec4 s = vec4(0.0);
      for (int i = 0; i < 12; i++) { float f = float(i) / 11.0 - 0.5; s += tap(vUv + uDir * uAmt * f); }
      s /= 12.0;
      gl_FragColor = vec4(s.rgb, s.a) * uOpacity;
    }`;
  // Opened via file://, the browser blocks reading video into WebGL (cross-origin) — then a placeholder of the same shape is drawn on a 2D canvas and used as the texture
  const FILE = location.protocol === "file:";
  const css = (name) => "#" + cssColor(name).getHexString();
  const painted = (w, h, paint) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d"), tex = new THREE.CanvasTexture(c);
    return { tex, draw: (time) => { paint(g, w, h, time); tex.needsUpdate = true; } };
  };
  const loopPaint = painted(220, 840, (g, w, h, time) => {
    const k = Math.abs(Math.cos((2 * Math.PI * time) / 10));
    g.fillStyle = css("--kf-bg"); g.fillRect(0, 0, w, h);
    g.fillStyle = css("--kf-ink-soft"); g.fillRect(110 - (14 + 12 * k), 40, 2 * (14 + 12 * k), 250);
    g.fillStyle = css("--kf-dim"); g.fillRect(110 - (30 + 28 * k), 300, 2 * (30 + 28 * k), 500);
  });
  const usePaint = painted(480, 270, (g, w, h, time) => {
    g.fillStyle = css("--kf-raised"); g.fillRect(0, 0, w, h);
    g.fillStyle = css("--kf-accent-soft"); g.fillRect(0, 190, w, 80);
    g.fillStyle = css("--kf-surface"); g.fillRect(260, 125, 100, 70);
    g.fillStyle = css("--kf-dim"); g.fillRect(60 + 90 * (time / 8.583), 30 + 120 * (time / 8.583), 180, 30);
  });
  const videoMat = (video, key) => new THREE.ShaderMaterial({
    uniforms: { map: { value: FILE ? (key ? loopPaint : usePaint).tex : new THREE.VideoTexture(video) }, uDir: { value: new THREE.Vector2(1, 0) }, uAmt: { value: 0 }, uOpacity: { value: 0 }, uKey: { value: key } },
    vertexShader: vert, fragmentShader: videoFrag, transparent: true, premultipliedAlpha: true, depthTest: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const product = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), videoMat(loopVideo, 1));
  const use = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), videoMat(useVideo, 0));
  use.renderOrder = 0; product.renderOrder = 2;
  // Blue surface: the square at the end of the product scene and the blue scene covering the screen
  const flatMat = () => new THREE.ShaderMaterial({
    uniforms: { uColor: { value: cssColor("--kf-accent") }, uOpacity: { value: 0 } },
    vertexShader: vert, fragmentShader: "uniform vec3 uColor; uniform float uOpacity; void main(){ gl_FragColor = vec4(uColor, uOpacity); }",
    transparent: true, depthTest: false,
  });
  const square = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flatMat());
  const blueFill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flatMat());
  square.renderOrder = 3; blueFill.renderOrder = 1;

  // Ribbon line: lays a 1.3px-wide band along the curve and paints only where the length position (aT) is inside [uFrom, uTo].
  // Cursor tilt (uMouse × .5 rad in Y then X axis order) and grab (1.2x · push toward cursor) rotate in 3D around the screen center as in the original, then
  // Lit with the original camera (50mm, at 2.47 times the screen height) perspective. Band width (aOff) is added after projection so the pixel width stays the same as the original
  const lineMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: cssColor("--kf-accent") }, uFrom: { value: 0 }, uTo: { value: 0 }, uOpacity: { value: 1 }, uMouse: { value: new THREE.Vector2() }, uView: { value: new THREE.Vector3(0.5, 0.5, 2.469) }, uGrab: { value: new THREE.Vector3() } },
    vertexShader: `
      attribute float aT; attribute vec2 aOff;
      uniform vec2 uMouse; uniform vec3 uView; uniform vec3 uGrab;
      varying float vT;
      void main(){
        vT = aT;
        vec3 p = vec3(position.xy - uView.xy, 0.0);
        vec2 a = uMouse * 0.5;
        p = vec3(cos(a.x) * p.x - sin(a.x) * p.z, p.y, sin(a.x) * p.x + cos(a.x) * p.z);
        p = vec3(p.x, cos(a.y) * p.y + sin(a.y) * p.z, cos(a.y) * p.z - sin(a.y) * p.y);
        float g = 0.2 * uGrab.x;
        p *= 1.0 + g;
        p.xy += uGrab.yz * uView.y * g;
        vec2 s = uView.xy + p.xy * uView.z / (uView.z - p.z) + aOff;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(s, 0.0, 1.0);
      }`,
    fragmentShader: "uniform vec3 uColor; uniform float uFrom; uniform float uTo; uniform float uOpacity; varying float vT; void main(){ if (vT < uFrom || vT > uTo) discard; float tip = smoothstep(uTo, uTo - 0.02, vT); gl_FragColor = vec4(uColor, uOpacity * (0.35 + 0.65 * tip)); }",
    transparent: true, depthTest: false,
  });
  const line = new THREE.Mesh(new THREE.BufferGeometry(), lineMat);
  line.renderOrder = 4;
  line.frustumCulled = false;
  // A different curve per scene (screen-ratio coordinates): instead of the original path data, set a new long arc of the same feel
  const CURVES = {
    fv: [[-0.05, 0.22], [0.25, 0.3], [0.6, 0.18], [1.05, 0.06]],
    0: [[-0.05, 0.62], [0.3, 0.5], [0.7, 0.42], [1.05, 0.5]],
    1: [[1.05, 0.2], [0.6, 0.35], [0.3, 0.72], [0.1, 1.05]],
    2: [[-0.05, 0.85], [0.35, 0.62], [0.75, 0.6], [1.05, 0.3]],
    3: [[0.2, -0.05], [0.4, 0.4], [0.55, 0.7], [0.9, 1.05]],
    blue: [[-0.05, 0.4], [0.5, 0.55], [1.05, 0.45]],
  };
  let curveKey = null;
  const buildLine = (key) => {
    if (curveKey === key) return;
    curveKey = key;
    const pts = CURVES[key].map(([x, y]) => new THREE.Vector3(x * W, (1 - y) * H, 0));
    const curve = new THREE.CatmullRomCurve3(pts);
    const N = 240, w = 0.65;
    const pos = new Float32Array(N * 2 * 3), off = new Float32Array(N * 2 * 2), t = new Float32Array(N * 2), idx = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1), p = curve.getPointAt(u), d = curve.getTangentAt(u);
      const nx = -d.y * w, ny = d.x * w;
      pos.set([p.x, p.y, 0, p.x, p.y, 0], i * 6);
      off.set([nx, ny, -nx, -ny], i * 4);
      t[i * 2] = t[i * 2 + 1] = u;
      if (i < N - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry();
    line.geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    line.geometry.setAttribute("aOff", new THREE.BufferAttribute(off, 2));
    line.geometry.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    line.geometry.setIndex(idx);
  };
  scene.add(use, blueFill, product, square, line);

  // Per product, start pose → end pose (the form of the original transform0 → transform1: rotation, scale, offset)
  const POSE = [
    { r0: -0.5 * Math.PI, s0: 1.15, r1: -0.25 * Math.PI, x1: 0.05, y1: 0.05, s1: 0.9 },
    { r0: 0, s0: 1.1, r1: 0, x1: 0, y1: -0.1, s1: 1.1 },
    { r0: 0.5 * Math.PI, s0: 1.15, r1: 0.3 * Math.PI, x1: -0.2, y1: 0.1, s1: 1.15 },
    { r0: -0.4 * Math.PI, s0: 1.05, r1: -0.6 * Math.PI, x1: 0.08, y1: -0.04, s1: 1 },
  ];

  let useCover = [1, 1];
  const resize = () => {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    Object.assign(cam, { left: 0, right: W, top: H, bottom: 0 });
    cam.updateProjectionMatrix();
    blueFill.scale.set(W, H, 1); blueFill.position.set(W / 2, H / 2, 0);
    const vr = 16 / 9;
    useCover = W / H > vr ? [W, W / vr] : [H * vr, H];
    lineMat.uniforms.uView.value.set(W / 2, H / 2, H * (50 / 20.25));
    curveKey = null;
  };
  resize();
  addEventListener("resize", resize);
  // The first compile on the first cursor move freezes the screen — do it ahead of time when building
  renderer.compile(scene, cam);

  // ── Time Engine ──
  let t = 0, dist = 0, wheelDelta = 0, vel = 0, last = performance.now(), cur = -1, dragging = false;
  const K = 0.0016;
  const wrap = (x) => ((x % TOTAL) + TOTAL) % TOTAL;
  addEventListener("wheel", (e) => { e.preventDefault(); const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX; dist += e.deltaMode === 1 ? d * 33 : d; }, { passive: false });
  let ty = null;
  // The original doesn’t hide the cursor while dragging and hides it .5s after release
  stage.addEventListener("pointerdown", (e) => { ty = e.clientY; stage.setPointerCapture(e.pointerId); if (e.pointerType !== "touch") { clearTimeout(idle); cursorEl.classList.remove("is-hidden"); } cursorEl.classList.add("is-dragging"); pt = [e.clientX, e.clientY]; toggleGrab(true); });
  stage.addEventListener("pointermove", (e) => { if (ty == null) return; dist += (ty - e.clientY) * 4; ty = e.clientY; });
  const endDrag = () => { ty = null; cursorEl.classList.remove("is-dragging"); toggleGrab(false); clearTimeout(idle); idle = setTimeout(() => cursorEl.classList.add("is-hidden"), 500); };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") dist += 400;
    if (e.key === "ArrowUp" || e.key === "PageUp") dist -= 400;
  });

  // Right bar — the handle moves down with overall progress, and dragging it seeks to that spot
  const bar = document.querySelector(".k-bar"), knob = bar.querySelector(".k-bar__knob"), knobIn = knob.querySelector("i");
  const barTo = (y) => { const kh = knob.offsetHeight; t = Math.max(0, Math.min(1, (y - kh / 2) / (H - kh))) * TOTAL * 0.9999; };
  bar.addEventListener("pointerdown", (e) => { dragging = true; bar.classList.add("is-dragging"); bar.setPointerCapture(e.pointerId); barTo(e.clientY); });
  bar.addEventListener("pointermove", (e) => dragging && barTo(e.clientY));
  bar.addEventListener("pointerup", () => { dragging = false; bar.classList.remove("is-dragging"); });

  // Drag cursor — visible only while the mouse moves (expands from .8x in .5s) and hides again .5s after it stops. Always hidden over links.
  // Position follows immediately without delay, like the original. Tilt uses the original formula — each frame, distance moved/1000 accumulates opposite the last horizontal direction (within ±1)
  // decreasing by .15 toward 0, while the visible value follows that by .25 and rotates ×180° (the faster the movement the more it turns, and when still it stops in about .5s).
  // Put the anchor that shrinks to .8x on hide at the cursor position so it shrinks in place
  const cursorEl = document.querySelector(".k-cursor");
  const cursorPos = cursorEl.querySelector(".k-cursor__pos"), cursorRot = cursorEl.querySelector(".k-cursor__rot");
  let cxy = null, prevXY = null, dir = 1, distRot = 0, tilt = 0, idle = 0, last2 = performance.now();
  addEventListener("pointermove", (e) => {
    cursorPos.style.left = e.clientX + "px";
    cursorPos.style.top = e.clientY + "px";
    cursorEl.style.transformOrigin = `${e.clientX}px ${e.clientY}px`;
    cxy = [e.clientX, e.clientY];
    cursorEl.classList.toggle("is-hidden", !!e.target.closest("a, button, .k-bar, .k-menu"));
    clearTimeout(idle);
    idle = setTimeout(() => ty == null && cursorEl.classList.add("is-hidden"), 500);
  });
  document.documentElement.addEventListener("pointerleave", () => cursorEl.classList.add("is-hidden"));
  const tiltLoop = (now) => {
    const k = Math.min(6, Math.max(0.06, ((now ?? performance.now()) - last2) / (1000 / 60)));
    last2 = now ?? performance.now();
    if (cxy) {
      const dx = prevXY ? cxy[0] - prevXY[0] : 0, n = prevXY ? Math.hypot(dx, cxy[1] - prevXY[1]) : 0;
      if (dx) dir = Math.sign(dx);
      prevXY = cxy;
      distRot = Math.max(-1, Math.min(1, distRot + (n / 1000) * -dir)) * 0.85 ** k;
      tilt += (distRot - tilt) * (1 - 0.75 ** k);
    }
    cursorRot.style.transform = `rotate(${(180 * tilt).toFixed(2)}deg)`;
    requestAnimationFrame(tiltLoop);
  };
  if (!reduce) tiltLoop();

  // Picture cursor reaction (original values). Tilt: if the cursor moves more than 1px in a frame, the force goes to 1 in 1.2s easeOutQuart, and when it stops it goes to 0 in 3.6s easeInOutQuad —
  // Tilt values follow the cursor screen coordinates (-1~1) by .12 per frame, then multiply by strength, and about 2s after stopping the lines turn back into place. Mouse only like the original (touch doesn’t tilt).
  // Grab: pressing the stage goes to 1 with .9s easeOutExpo, releasing returns to 0 in 1.5s. The cursor position always follows by .15 each step. Question text follows up to 30px at .08~.3 speed per text
  const outQuart = (x) => 1 - (1 - x) ** 4;
  const inOutQuad = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
  const outExpo = (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));
  const tween = () => ({ v: 0, from: 0, to: 0, ms: 1, ease: outQuart, t0: 0 });
  const tweenTo = (w, to, ms, ease) => Object.assign(w, { from: w.v, to, ms, ease, t0: performance.now() });
  // A start time captured inside an event can be later than the rAF time — if it drops below 0 the force goes negative and power ** k becomes NaN
  const tweenStep = (w, now) => (w.v = w.from + (w.to - w.from) * w.ease(Math.max(0, Math.min(1, (now - w.t0) / w.ms))));
  let pt = null, tiltPt = null, tiltPrev = null, moving = false;
  const power = tween(), grab = tween();
  const mouse = lineMat.uniforms.uMouse.value, grabPos = new THREE.Vector2();
  const strokes = [...stage.querySelectorAll(".k-q__a, .k-q__b")].map((el) => ({ el, x: 0, y: 0, speed: 0.08 + 0.22 * Math.random() }));
  const toggleGrab = (on) => !reduce && tweenTo(grab, on ? 1 : 0, on ? 900 : 1500, outExpo);
  addEventListener("pointermove", (e) => { pt = [e.clientX, e.clientY]; if (e.pointerType !== "touch") tiltPt = pt; });
  const react = (now, k) => {
    if (reduce) return;
    if (tiltPt) {
      const n = tiltPrev ? Math.hypot(tiltPt[0] - tiltPrev[0], tiltPt[1] - tiltPrev[1]) : 0;
      tiltPrev = tiltPt;
      if ((n > k) !== moving) { moving = n > k; moving ? tweenTo(power, 1, 1200, outQuart) : tweenTo(power, 0, 3600, inOutQuad); }
      tweenStep(power, now);
      const f = 1 - 0.88 ** k, keep = power.v ** k;
      mouse.x = (mouse.x + ((tiltPt[0] / W) * 2 - 1 - mouse.x) * f) * keep;
      mouse.y = (mouse.y + (1 - (tiltPt[1] / H) * 2 - mouse.y) * f) * keep;
    }
    if (pt) {
      const f = 1 - 0.85 ** k;
      grabPos.x += ((pt[0] / W) * 2 - 1 - grabPos.x) * f;
      grabPos.y += (1 - (pt[1] / H) * 2 - grabPos.y) * f;
    }
    tweenStep(grab, now);
    lineMat.uniforms.uGrab.value.set(grab.v, grabPos.x, grabPos.y);
    const reach = 30 * (W / 1440);
    strokes.forEach((s) => {
      const f = 1 - (1 - s.speed) ** k;
      s.x += (grabPos.x * grab.v * reach - s.x) * f;
      s.y += (-grabPos.y * grab.v * reach - s.y) * f;
      s.el.style.translate = Math.abs(s.x) + Math.abs(s.y) < 0.01 ? "" : `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
    });
  };

  // ── Text in a scene: appears only within a progress (0~1) window ──
  const win = (el, p, a, b) => el && el.classList.toggle("is-in", p >= a && p < b);
  const blueCopies = [...stage.querySelectorAll(".k-blue__copy")];
  const lastVideos = [...stage.querySelectorAll(".k-last__list video")];
  const enter = (i) => {
    scenes.forEach((s, k) => s.el.classList.toggle("is-in", k === i));
    const s = scenes[i];
    root.dataset.kSection = s.type;
    root.dataset.kTarget = s.type;
    if (s.type === "loop") buildLine(s.product);
    else if (s.type === "fv" || s.type === "blue") buildLine(s.type);
    lastVideos.forEach((v) => (s.type === "last" ? v.play().catch(() => {}) : v.pause()));
  };
  const copies = (s, p) => {
    const q = (sel) => s.el.querySelector(sel);
    if (s.type === "fv") { win(q(".k-fv__body"), p, 0, 1.01); win(q(".k-fv__logo"), p, 0, 1.01); }
    if (s.type === "loop") { win(q(".k-q__a"), p, 0.12, 0.85); win(q(".k-q__b"), p, 0.2, 0.85); }
    if (s.type === "use") win(q(".k-use__copy"), p, 0.1, 0.85);
    if (s.type === "blue") blueCopies.forEach((c, k) => c.classList.toggle("is-on", p >= 0.08 + k * 0.17 && p < 0.08 + (k + 1) * 0.17));
    if (s.type === "last") { win(q(".k-last__head"), p, 0.05, 1.01); win(q(".k-last__logo"), p, 0.1, 1.01); }
  };
  const ramp = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeIO = (x) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2);

  const seek = (video, target, scrubbing) => {
    if (FILE) { (video === loopVideo ? loopPaint : usePaint).draw(target); return; }
    if (!video.duration) return;
    const tt = Math.min(video.duration - 0.05, Math.max(0, target));
    if (scrubbing || reduce) { if (!video.paused) video.pause(); if (Math.abs(video.currentTime - tt) > 0.04) video.currentTime = tt; }
    else { if (Math.abs(video.currentTime - tt) > 0.3) video.currentTime = tt; if (video.paused) video.play().catch(() => {}); }
  };

  const frame = (now) => {
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    const k = dt * 60;
    wheelDelta += 0.2 * (dist - wheelDelta) * k;
    dist += (0 - dist) * Math.min(1, 0.2 * k);
    const push = wheelDelta * K * k;
    vel = lerp(vel, push / dt, 0.25);
    if (!dragging) t = wrap(t + (reduce ? 0 : dt) + push);
    const i = scenes.findIndex((s) => t >= s.start && t < s.start + s.dur);
    if (i !== cur) { cur = i; enter(i); }
    const s = scenes[i], p = (t - s.start) / s.dur;
    copies(s, p);
    const scrubbing = Math.abs(push) > 0.002;
    const blur = Math.min(0.14, Math.abs(vel) * 0.012);
    react(now, k);
    // On grab the video scales 1.1x around the screen center and shifts toward the cursor by screen height × .05 (original video shader values)
    const gs = 1 + 0.1 * grab.v, gx = grabPos.x * H * 0.05 * grab.v, gy = grabPos.y * H * 0.05 * grab.v;

    // Product loop
    if (s.type === "loop") {
      const pose = POSE[s.product % POSE.length], e = easeIO(p);
      const long = Math.min(W, H) * (W > H ? 0.95 : 1.15);
      const sc = lerp(pose.s0, pose.s1, e) * long;
      product.scale.set(sc * (220 / 840) * gs, sc * gs, 1);
      product.rotation.z = lerp(pose.r0, pose.r1, e);
      product.position.set(W * (0.5 + lerp(0, pose.x1, e) * gs) + gx, H * (0.5 - lerp(0, pose.y1, e) * gs) + gy, 0);
      product.material.uniforms.uOpacity.value = ramp(p, 0, 0.08) * (1 - ramp(p, 0.9, 1));
      product.material.uniforms.uAmt.value = blur;
      product.material.uniforms.uDir.value.set(Math.cos(-product.rotation.z), Math.sin(-product.rotation.z)).multiplyScalar(Math.sign(vel) || 1);
      seek(loopVideo, (t - s.start) % 10, scrubbing);
      // Near the end the blue square overlaps the blade
      const g = ramp(p, 0.72, 0.8) * (1 - ramp(p, 0.95, 1));
      square.scale.set(Math.min(W, H) * 0.2, Math.min(W, H) * 0.2, 1);
      square.position.set(W * 0.5, H * 0.5, 0);
      square.rotation.z = lerp(0, 0.06, p);
      square.material.uniforms.uOpacity.value = g;
      lineMat.uniforms.uFrom.value = ramp(p, 0.55, 0.95);
      lineMat.uniforms.uTo.value = ramp(p, 0.05, 0.55);
    } else {
      product.material.uniforms.uOpacity.value = 0;
      square.material.uniforms.uOpacity.value = 0;
    }
    // Writing scene
    if (s.type === "use") {
      use.scale.set(useCover[0] * gs, useCover[1] * gs, 1);
      use.position.set(W / 2 + gx, H / 2 + gy, 0);
      use.material.uniforms.uOpacity.value = ramp(p, 0, 0.1) * (1 - ramp(p, 0.9, 1));
      use.material.uniforms.uAmt.value = blur * 0.5;
      use.material.uniforms.uDir.value.set(0, Math.sign(vel) || 1);
      seek(useVideo, USE_IN + (t - s.start), scrubbing);
    } else {
      use.material.uniforms.uOpacity.value = 0;
      if (!useVideo.paused) useVideo.pause();
    }
    if (s.type !== "loop" && !loopVideo.paused) loopVideo.pause();
    // Lines of the first and blue scenes
    if (s.type === "fv") { lineMat.uniforms.uFrom.value = 0; lineMat.uniforms.uTo.value = easeIO(ramp(p, 0.5, 0.6)); }
    if (s.type === "blue") { lineMat.uniforms.uFrom.value = ramp(p, 0.6, 1); lineMat.uniforms.uTo.value = ramp(p, 0.1, 0.6); }
    line.visible = s.type === "fv" || s.type === "loop" || s.type === "blue";
    lineMat.uniforms.uColor.value = s.type === "blue" ? INK_ON_BLUE : ACCENT;
    blueFill.material.uniforms.uOpacity.value = s.type === "blue" ? ramp(p, 0, 0.08) * (1 - ramp(p, 0.92, 1)) : 0;

    // Bar handle
    const kh = knob.offsetHeight;
    knob.style.transform = `translateY(${(t / TOTAL) * (H - kh)}px)`;
    knobIn.style.transform = `scaleY(${p.toFixed(3)})`;
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
