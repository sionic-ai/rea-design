// Rotating meadow island — an orthographic camera looks down at 10° onto a round island planted with hundreds of thousands of grass blades as instances.
// Grass blades are ribbons turned to face the camera (oval cross-section with rounded tips), and lie down to passing wind waves + small jitters. Grass at the cursor spot (radius 1.15) is pushed outward while
// It lowers, and each time the cursor moves more than 1.15 it leaves one spot (eight total) that stands up again over 20 seconds. When opened, it grows from the island center in 2.7s.
// In the middle of the island is [data-fx-part=scene] the pictures stand one at a time — turning the disc (drag 90px · arrows · wheel · fx:turn · fx:goto) moves to the next picture every 15° step
// The whole panel ripples and melts into the next in .42s. On fx:walk (detail 0|1) the camera approaches in .76s and the island becomes a band at the bottom of the screen
(() => {
  const BLADE_VS = `
attribute vec3 iPos; attribute vec4 iParams; attribute vec2 iFace; attribute vec2 iLean; attribute vec3 iMeta;
uniform float uTime, uGrow, uCrop, uWind, uGust; uniform vec2 uWindDir; uniform vec4 uBall; uniform vec4 uTrail[8];
uniform vec3 uGrass, uPale, uDeep, uWarm, uCold; uniform float uInk;
varying vec3 vColor; varying float vAcross; varying float vHalf; varying float vInked;
float h2(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1.0, 0.0)), f.x), mix(h2(i + vec2(0.0, 1.0)), h2(i + 1.0), f.x), f.y); }
float waves(vec2 p){ return vnoise(p) * 0.55 + vnoise(p * 2.03 + 7.1) * 0.3 + vnoise(p * 4.1 + 3.3) * 0.15; }
void main(){
  float t = position.y;
  float g = clamp((uGrow - iMeta.x) / 0.32, 0.0, 1.0);
  g = g * g * (3.0 - 2.0 * g);
  if (g <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec3 toCam = cameraPosition - iPos; toCam.y = 0.0;
  vec3 fwd = normalize(toCam + vec3(1e-4, 0.0, 0.0));
  vec3 rgt = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 side = normalize(rgt * iFace.x + fwd * iFace.y);
  vec3 push = vec3(iLean.x, 0.0, iLean.y) * iParams.z;
  float wave = waves(iPos.xz * 0.13 - uWindDir * uTime * 1.15) * 2.0 - 1.0;
  float flutter = sin(uTime * 3.3 + iParams.w * 2.1) * 0.09;
  push += vec3(uWindDir.x, 0.0, uWindDir.y) * max(0.0, uWind * (0.42 + uGust * wave) + flutter * uWind);
  float squash = 0.0;
  if (uBall.w > 0.0) {
    vec2 d = iPos.xz - uBall.xz; float dist = length(d);
    float k = 1.0 - smoothstep(uBall.w * 0.5, uBall.w * 2.1, dist);
    push += vec3(d.x, 0.0, d.y) / max(dist, 0.001) * k * 1.7;
    squash = k;
  }
  for (int i = 0; i < 8; i++) {
    if (uTrail[i].z <= 0.0) continue;
    vec2 d = iPos.xz - uTrail[i].xy; float dist = length(d);
    float k = (1.0 - smoothstep(0.46, 1.96, dist)) * uTrail[i].z;
    push += vec3(d.x, 0.0, d.y) / max(dist, 0.001) * k * 1.1;
    squash = max(squash, k * 0.8);
  }
  float pl = length(push); if (pl > 1.5) push *= 1.5 / pl;
  float h = iParams.x * g * uCrop * (1.0 - 0.6 * clamp(squash, 0.0, 1.0));
  float w = iParams.y * pow(max(0.0, 1.0 - pow(t, iMeta.z)), 0.42);
  vAcross = position.x * 2.0; vHalf = w * 0.5;
  float curve = t * t;
  vec3 p = iPos + side * (position.x * w + sin(t * 6.5 + iParams.w * 4.0) * 0.018 * h)
    + push * (curve * h) + vec3(0.0, t * h * (1.0 - 0.18 * min(dot(push, push), 2.0) * curve), 0.0);
  float tone = iMeta.y;
  vec3 c = mix(uDeep, uGrass, 0.5 + 0.5 * smoothstep(0.0, 0.7, t));
  c = mix(c, uPale, smoothstep(0.35, 1.0, t) * (0.25 + 0.75 * fract(tone * 7.31)) * 0.8);
  c = mix(c, uCold, step(0.86, fract(tone * 3.7)) * 0.45 * t);
  c = mix(c, uWarm, step(0.965, tone) * smoothstep(0.15, 0.7, t));
  vColor = c;
  vInked = step(fract(tone * 13.7), uInk);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
  const BLADE_FS = `
uniform vec3 uInkColor; varying vec3 vColor; varying float vAcross; varying float vHalf; varying float vInked;
void main(){
  float edge = (1.0 - abs(vAcross)) * vHalf;
  float px = fwidth(abs(vAcross) * vHalf) * 1.0;
  vec3 c = vColor;
  if (vInked > 0.5 && edge < px) c = uInkColor;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;
  const GROUND_VS = `varying float vU; attribute float aU; void main(){ vU = aU; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const GROUND_FS = `uniform vec3 uGrass, uDeep; uniform float uReveal; varying float vU;
void main(){ float a = smoothstep(1.02, 0.8, vU) * clamp(uReveal, 0.0, 1.0); if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uGrass, uDeep, 0.28 + 0.12 * vU), a);
  #include <colorspace_fragment>
}`;
  const SHEET_VS = `
uniform float uProgress, uDir, uGroundA, uGroundB; varying vec2 vUv; varying float vBlend;
void main(){
  vUv = uv;
  float delay = (uDir > 0.0 ? uv.x : 1.0 - uv.x) * 0.06;
  float t = smoothstep(delay, 0.94 + delay, uProgress);
  vBlend = t;
  float arc = sin(t * 3.14159265);
  vec3 p = vec3((uv - 0.5) * vec2(12.0, 8.0), 0.0);
  p.y += (0.5 - mix(uGroundA, uGroundB, t)) * 8.0;
  p.x += uDir * arc * 0.26 * sin(uv.y * 3.14159265);
  p.y += arc * 0.06;
  p.z += arc * 0.24 * sin(uv.x * 3.14159265);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
  const SHEET_FS = `
uniform sampler2D uA, uB; uniform float uOpacity, uLight; varying vec2 vUv; varying float vBlend;
void main(){
  vec4 a = texture2D(uA, vUv); vec4 b = texture2D(uB, vUv);
  float paint = smoothstep(0.24, 0.76, vBlend);
  vec4 pa = vec4(a.rgb * a.a, a.a), pb = vec4(b.rgb * b.a, b.a);
  vec4 ink = mix(pa, pb, paint);
  float body = sin(paint * 3.14159265);
  float alpha = mix(ink.a, max(a.a, b.a), body * body * 0.88) * uOpacity;
  if (alpha < 0.04) discard;
  gl_FragColor = vec4(ink.rgb / max(ink.a, 0.001) * uLight, alpha);
  #include <colorspace_fragment>
}`;

  kfFx.register("grass-turntable-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T) return;
    const num = (k, d) => (options[k] == null || options[k] === "" ? d : +options[k]);
    const cfg = {
      blades: Math.max(1000, (num("blades", 220000) || 220000) * (reduce ? 0.18 : hover ? 1 : 0.45)),
      radius: num("radius", 12) || 12, steps: Math.round(num("steps", 24)) || 24, step: num("step", 15) || 15,
      elevation: num("elevation", 10), frustum: num("frustum", 26.5) || 26.5, height: num("height", 8.75), shift: num("shift", -5),
      grab: num("grab", 90) || 90, ease: num("ease", 9) || 9, ball: num("ball", 1.15) || 1.15, trail: num("trail", 20) || 20,
      grow: num("grow", 2.7), morph: num("morph", 0.42) || 0.42, walk: num("walk", 0), wind: num("wind", 0.35), seed: num("seed", 7) || 7,
    };
    const dragPage = options.drag === "page";

    // ── Color: reads skin variables (--fx-grass-*) into three colors. color-mix·oklch(from …) are also painted and read back ──
    const probeEl = document.createElement("i");
    probeEl.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
    el.append(probeEl);
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const read = (name) => {
      probeEl.style.color = `var(${name})`;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = getComputedStyle(probeEl).color;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.SRGBColorSpace);
    };
    const NAMES = { uGrass: "--fx-grass", uPale: "--fx-grass-pale", uDeep: "--fx-grass-deep", uWarm: "--fx-grass-warm", uCold: "--fx-grass-cold", uInkColor: "--fx-grass-ink" };

    const canvas = document.createElement("canvas");
    canvas.className = "fx-gtt-canvas";
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
    el.append(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);

    const U = {
      uTime: { value: 0 }, uGrow: { value: reduce ? 1.2 : 0 }, uCrop: { value: 1 }, uWind: { value: cfg.wind }, uGust: { value: 0.75 },
      uWindDir: { value: new T.Vector2(1, 0.35).normalize() }, uBall: { value: new T.Vector4(9999, 0, 9999, 0) },
      uTrail: { value: Array.from({ length: 8 }, () => new T.Vector4(0, 0, 0, 0)) }, uInk: { value: 0.14 }, uReveal: { value: reduce ? 1 : 0 },
    };
    for (const k in NAMES) U[k] = { value: read(NAMES[k]) };

    // ── Island: a circle with jagged edges + low hills ──
    let s = cfg.seed >>> 0 || 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
    const R = cfg.radius;
    const radiusAt = (a) => R * (1 + 0.1 * Math.sin(3 * a + ph[0]) + 0.06 * Math.sin(7 * a + ph[1]) + 0.035 * Math.sin(13 * a + ph[2]));
    const fray = (x, z) => 0.08 * Math.sin(x * 1.7 + ph[3]) * Math.cos(z * 2.1 - ph[0]);
    const hill = (x, z) => { const u = Math.hypot(x, z) / R; return Math.max(0, 1 - u * u) * (0.55 + 0.45 * Math.sin(x * 0.31 + ph[1]) * Math.cos(z * 0.37 + ph[2])) * 0.9; };
    const density = (x, z) => Math.min(1, Math.max(0.18, 0.46 + 0.4 * Math.sin(1.25 * x + ph[0]) * Math.cos(1.05 * z + ph[1])));

    const groundGeo = new T.CircleGeometry(1, 96, 0, Math.PI * 2);
    {
      const pos = groundGeo.attributes.position, au = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), a = Math.atan2(y, x), r = Math.hypot(x, y) * 1.12;
        const wx = Math.cos(a) * r * radiusAt(a), wz = Math.sin(a) * r * radiusAt(a);
        au[i] = r;
        pos.setXYZ(i, wx, hill(wx, wz) - 0.02, wz);
      }
      groundGeo.setAttribute("aU", new T.BufferAttribute(au, 1));
      groundGeo.computeBoundingSphere();
    }
    const ground = new T.Mesh(groundGeo, new T.ShaderMaterial({ uniforms: U, vertexShader: GROUND_VS, fragmentShader: GROUND_FS, transparent: true, depthWrite: false }));
    ground.renderOrder = 0;
    scene.add(ground);

    // ── Grass blades ──
    const SEGS = 6;
    const base = new T.BufferGeometry();
    {
      const p = [], idx = [];
      for (let i = 0; i <= SEGS; i++) { const t = i / SEGS; p.push(-0.5, t, 0, 0.5, t, 0); }
      for (let i = 0; i < SEGS; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      base.setAttribute("position", new T.Float32BufferAttribute(p, 3));
      base.setIndex(idx);
    }
    const N = Math.round(cfg.blades);
    const iPos = new Float32Array(N * 3), iParams = new Float32Array(N * 4), iFace = new Float32Array(N * 2), iLean = new Float32Array(N * 2), iMeta = new Float32Array(N * 3);
    let n = 0;
    for (let tries = 0; n < N && tries < N * 6; tries++) {
      const x = (rnd() * 2 - 1) * R * 1.5, z = (rnd() * 2 - 1) * R * 1.5;
      const a = Math.atan2(z, x), u = Math.hypot(x, z) / radiusAt(a) + fray(x, z);
      if (u >= 1.44) continue;
      const keep = u <= 0.84 ? 1 : Math.pow(1 - (u - 0.84) / 0.6, 2.6);
      if (rnd() > keep * density(x, z)) continue;
      // Mostly short grass, occasionally long thin grass (4%) — red wildflowers cluster in patches in the field (35% of where the pattern exceeds .55)
      const wisp = rnd() < 0.04;
      const tall = (wisp ? 0.9 + rnd() * 0.9 : 0.12 + Math.pow(rnd(), 2.2) * 0.62) * (0.55 + 0.45 * keep);
      const patch = 0.5 + 0.5 * Math.sin(x * 0.55 + ph[2]) * Math.cos(z * 0.62 - ph[3]);
      const warm = patch > 0.55 && rnd() < 0.22;
      iPos.set([x, hill(x, z), z], n * 3);
      iParams.set([tall, wisp ? 0.03 : 0.05 + rnd() * 0.07, 0.15 + rnd() * 0.35, rnd() * 6.28], n * 4);
      const yaw = (rnd() - 0.5) * 1.1;
      iFace.set([Math.cos(yaw), Math.sin(yaw)], n * 2);
      const la = rnd() * 6.28;
      iLean.set([Math.cos(la), Math.sin(la)], n * 2);
      iMeta.set([Math.min(1, u) * 0.75 + rnd() * 0.15, warm ? 0.97 + rnd() * 0.03 : rnd() * 0.96, wisp ? 1.6 : 1.6 + rnd() * 2.4], n * 3);
      n++;
    }
    const geo = new T.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute("position", base.attributes.position);
    geo.setAttribute("iPos", new T.InstancedBufferAttribute(iPos, 3));
    geo.setAttribute("iParams", new T.InstancedBufferAttribute(iParams, 4));
    geo.setAttribute("iFace", new T.InstancedBufferAttribute(iFace, 2));
    geo.setAttribute("iLean", new T.InstancedBufferAttribute(iLean, 2));
    geo.setAttribute("iMeta", new T.InstancedBufferAttribute(iMeta, 3));
    geo.instanceCount = n;
    const blades = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: U, vertexShader: BLADE_VS, fragmentShader: BLADE_FS, side: T.DoubleSide }));
    blades.frustumCulled = false;
    blades.renderOrder = 2;
    scene.add(blades);

    // Wildflower — dots drawn on canvas with white petals, yellow eye and ink outline (picture content, not the color set by the user)
    const flowerTex = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 128;
      const x = c.getContext("2d"); x.translate(64, 64);
      x.lineWidth = 6; x.strokeStyle = `#${U.uInkColor.value.getHexString()}`;
      x.fillStyle = `#${U.uPale.value.clone().lerp(new T.Color(1, 1, 1), 0.85).getHexString()}`;
      for (let i = 0; i < 6; i++) { x.save(); x.rotate((i / 6) * Math.PI * 2); x.beginPath(); x.ellipse(0, -30, 13, 22, 0, 0, Math.PI * 2); x.fill(); x.stroke(); x.restore(); }
      x.beginPath(); x.arc(0, 0, 12, 0, Math.PI * 2); x.fillStyle = `#${U.uWarm.value.clone().lerp(new T.Color(1, 0.85, 0.2), 0.7).getHexString()}`; x.fill(); x.stroke();
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    })();
    const flowerMat = new T.SpriteMaterial({ map: flowerTex, transparent: true, depthWrite: false });
    const flowers = [];
    for (let i = 0; i < 90; i++) {
      const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.92 * radiusAt(a);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const sp = new T.Sprite(flowerMat);
      const sz = 0.28 + rnd() * 0.22;
      sp.scale.set(sz, sz, 1);
      sp.position.set(x, hill(x, z) + 0.28 + rnd() * 0.3, z);
      sp.userData.h = sp.position.y;
      scene.add(sp);
      flowers.push(sp);
    }

    // ── Center picture panel ──
    const parts = [...el.querySelectorAll('[data-fx-part="scene"]')];
    const sheets = parts.map((p) => {
      const t = p.tagName === "CANVAS" ? new T.CanvasTexture(p) : new T.Texture(p);
      t.colorSpace = T.SRGBColorSpace;
      if (p.tagName === "IMG") { if (p.complete) t.needsUpdate = true; else p.addEventListener("load", () => (t.needsUpdate = true), { once: true }); }
      return { tex: t, ground: +(p.dataset.ground ?? 0.36) };
    });
    let sheet = null;
    const sh = { from: 0, to: 0, p: 0, dir: 1, want: 0 };
    if (sheets.length) {
      const mat = new T.ShaderMaterial({
        uniforms: { uA: { value: sheets[0].tex }, uB: { value: sheets[0].tex }, uProgress: { value: 0 }, uDir: { value: 1 }, uGroundA: { value: sheets[0].ground }, uGroundB: { value: sheets[0].ground }, uOpacity: { value: 0 }, uLight: { value: 1 } },
        vertexShader: SHEET_VS, fragmentShader: SHEET_FS, transparent: true, side: T.DoubleSide,
      });
      sheet = new T.Mesh(new T.PlaneGeometry(12, 8, 60, 40), mat);
      sheet.frustumCulled = false;
      sheet.renderOrder = 3;
      scene.add(sheet);
    }
    const setSheet = (a, b) => {
      sh.from = a; sh.to = b; sh.p = 0;
      const u = sheet.material.uniforms;
      u.uA.value = sheets[a].tex; u.uB.value = sheets[b].tex;
      u.uGroundA.value = sheets[a].ground; u.uGroundB.value = sheets[b].ground;
    };

    // ── Turntable camera ──
    const stepRad = (cfg.step * Math.PI) / 180;
    const state = { index: 0, az: 0, elev: (cfg.elevation * Math.PI) / 180, frustum: cfg.frustum, walk: cfg.walk, walkFrom: cfg.walk, walkTo: cfg.walk, walkT: -1 };
    const wrap = (i) => ((i % cfg.steps) + cfg.steps) % cfg.steps;
    let W = 1, H = 1;
    const place = () => {
      const fr = cfg.frustum - state.walk * cfg.frustum * 0.42;
      const asp = W / H;
      camera.left = (-fr * asp) / 2; camera.right = (fr * asp) / 2; camera.top = fr / 2; camera.bottom = -fr / 2;
      const d = Math.cos(state.elev) * 60;
      camera.position.set(Math.cos(state.az) * d, cfg.height + Math.sin(state.elev) * 60, Math.sin(state.az) * d);
      camera.lookAt(0, cfg.height, 0);
      if (cfg.shift) camera.setViewOffset(W, H, -cfg.shift, 0, W, H); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      U.uCrop.value = 1 + (0.4 / 0.54 - 1) * state.walk;
      el.style.setProperty("--fx-walk", state.walk.toFixed(3));
    };
    const emit = (type, detail) => el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
    let lastSent = -1;
    const goTo = (i) => {
      const t = Math.round(i);
      if (t === state.index) return;
      sh.dir = Math.sign(t - state.index);
      state.index = t;
      if (reduce) state.az = t * stepRad;
      sh.want = sheets.length ? wrap(t) % sheets.length : 0;
      const sc = wrap(t);
      if (sc !== lastSent) { lastSent = sc; emit("fx:turned", { index: sc, steps: cfg.steps }); }
    };
    const turn = (d) => goTo(state.index + d);
    const goToScene = (k) => { let d = ((k - wrap(state.index)) % cfg.steps + cfg.steps) % cfg.steps; if (d > cfg.steps / 2) d -= cfg.steps; turn(d); };

    // ── Interaction: drag to rotate, wheel, arrows, cursor ball ──
    const ac = new AbortController(), sig = { signal: ac.signal };
    const host = dragPage ? window : el;
    const skip = (e) => dragPage && e.target.closest?.("a, button, input, textarea, select, label, [role=slider], [data-nodrag]");
    let grab = null;
    host.addEventListener("pointerdown", (e) => { if ((e.button ?? 0) !== 0 || skip(e)) return; grab = { x: e.clientX, from: state.index }; document.body.classList.add("is-fx-turning"); }, sig);
    host.addEventListener("pointermove", (e) => { if (grab) goTo(grab.from + Math.round((e.clientX - grab.x) / cfg.grab)); }, sig);
    const drop = () => { grab = null; document.body.classList.remove("is-fx-turning"); };
    addEventListener("pointerup", drop, sig);
    addEventListener("pointercancel", drop, sig);
    let wheelAt = 0;
    host.addEventListener("wheel", (e) => {
      if (skip(e) || state.walk > 0.5) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 2) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelAt) return;
      wheelAt = now + 320;
      turn(Math.sign(d));
    }, { passive: false, signal: ac.signal });
    el.addEventListener("keydown", (e) => { const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 }[e.key]; if (d !== undefined) { e.preventDefault(); turn(e.shiftKey ? d * Math.round(cfg.steps / 4) : d); } }, sig);
    el.addEventListener("fx:turn", (e) => turn(+e.detail || 1), sig);
    el.addEventListener("fx:goto", (e) => goToScene(+e.detail || 0), sig);
    el.addEventListener("fx:walk", (e) => {
      const to = e.detail && typeof e.detail === "object" ? +e.detail.to : +e.detail;
      const instant = e.detail && typeof e.detail === "object" && e.detail.instant;
      if (reduce || instant) { state.walk = to; state.walkT = -1; place(); emit("fx:walked", { to }); return; }
      state.walkFrom = state.walk; state.walkTo = to; state.walkT = 0;
    }, sig);
    let recolor = null;
    // Scene plate brightness: the caller passes --fx-scene-light (0~1, a number), darker at night
    const sceneLight = () => { const v = parseFloat(getComputedStyle(el).getPropertyValue("--fx-scene-light")); return Number.isFinite(v) ? v : 1; };
    let lightTo = sceneLight();
    el.addEventListener("fx:recolor", (e) => {
      const dur = e.detail && e.detail.dur != null ? +e.detail.dur : 0.8;
      const to = {}; for (const k in NAMES) to[k] = read(NAMES[k]);
      lightTo = sceneLight();
      if (dur <= 0 || reduce) { for (const k in to) U[k].value.copy(to[k]); recolor = null; return; }
      const from = {}; for (const k in to) from[k] = U[k].value.clone();
      recolor = { from, to, t: 0, dur };
    }, sig);

    const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3(), dir = new T.Vector3();
    const ball = { here: false, at: new T.Vector3(), r: 0, head: 0, trail: Array.from({ length: 8 }, () => ({ x: 0, z: 0, at: -99 })) };
    if (hover && !reduce) {
      addEventListener("pointermove", (e) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        plane.constant = -0.5;
        if (!ray.ray.intersectPlane(plane, hit)) { ball.here = false; return; }
        camera.getWorldDirection(dir);
        const back = 0.62 / Math.max(0.05, Math.abs(dir.y));
        ball.at.set(hit.x - dir.x * back, 0, hit.z - dir.z * back);
        ball.here = Math.hypot(ball.at.x, ball.at.z) < R * 1.6;
      }, { passive: true, signal: ac.signal });
      document.documentElement.addEventListener("pointerleave", () => { ball.here = false; }, sig);
      addEventListener("blur", () => { ball.here = false; }, sig);
    }

    // ── Size · Drawing ──
    const resize = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      renderer.setSize(W, H, false);
      place();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    // Bake all shaders when building the world — baking for the first time on the first cursor move would freeze the screen
    renderer.compile(scene, camera);

    let raf = 0, last = 0, grow = reduce ? null : 0, visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); });
    io.observe(el);
    function frame(now) {
      raf = 0;
      if (!visible) return;
      const dt = last ? Math.min(0.1, Math.max(0.001, (now - last) / 1000)) : 0.016;
      last = now;
      if (!document.hidden) {
        U.uTime.value += reduce ? 0 : dt;
        const time = U.uTime.value;
        if (grow !== null) {
          grow += dt;
          const e = Math.min(1, grow / 3.5), g = Math.min(1, grow / cfg.grow);
          U.uReveal.value = 1.2 * (1 - Math.pow(1 - e, 3));
          U.uGrow.value = 1.2 * (1 - Math.pow(1 - g, 3));
          if (e >= 1) grow = null;
        }
        // Cursor ball — when present it quickly goes to 1.15 (12), and when it leaves it slowly goes to 0 (1.8). Each time it moves more than 1.15, one mark is left and fades away over 20 seconds
        const target = ball.here ? cfg.ball : 0;
        ball.r += (target - ball.r) * Math.min(1, dt * (ball.here ? 12 : 1.8));
        if (ball.r < 0.01 && !ball.here) ball.r = 0;
        U.uBall.value.set(ball.at.x, 0, ball.at.z, ball.r > 0.001 ? ball.r : 0);
        if (ball.here) {
          const h = ball.trail[ball.head];
          if (Math.hypot(ball.at.x - h.x, ball.at.z - h.z) > cfg.ball || h.at < 0) {
            ball.head = (ball.head + 1) % 8;
            ball.trail[ball.head] = { x: ball.at.x, z: ball.at.z, at: time };
          }
        }
        ball.trail.forEach((p, i) => { const k = Math.max(0, 1 - (time - p.at) / cfg.trail); U.uTrail.value[i].set(p.x, p.z, k * k * 0.8, 0); });
        // Turning — 1 − e^(−9·dt) of the remaining angle each frame
        const want = state.index * stepRad;
        if (state.az !== want) { state.az += (want - state.az) * (1 - Math.exp(-dt * cfg.ease)); if (Math.abs(want - state.az) < 1e-4) state.az = want; }
        // Approach — cubic inOut .76s
        if (state.walkT >= 0) {
          state.walkT = Math.min(1, state.walkT + dt / 0.76);
          const t = state.walkT, k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          state.walk = state.walkFrom + (state.walkTo - state.walkFrom) * k;
          if (state.walkT >= 1) { state.walkT = -1; emit("fx:walked", { to: state.walkTo }); }
        }
        place();
        if (recolor) {
          recolor.t = Math.min(1, recolor.t + dt / recolor.dur);
          for (const k in recolor.to) U[k].value.copy(recolor.from[k]).lerp(recolor.to[k], recolor.t);
          if (recolor.t >= 1) recolor = null;
        }
        if (sheet) {
          const u = sheet.material.uniforms;
          if (reduce) { if (sh.from !== sh.want || sh.to !== sh.want) setSheet(sh.want, sh.want); }
          else {
            if (sh.from === sh.to && sh.want !== sh.from) setSheet(sh.from, sh.want);
            if (sh.from !== sh.to) {
              const fast = sh.want !== sh.from && sh.want !== sh.to ? 2.5 : 1;
              sh.p = Math.min(1, sh.p + (Math.min(dt, 0.05) * fast) / cfg.morph);
              if (sh.p >= 1) { const at = sh.to; setSheet(at, at); if (sh.want !== at) setSheet(at, sh.want); }
            }
          }
          u.uProgress.value = sh.p; u.uDir.value = sh.dir;
          u.uOpacity.value = Math.min(1, U.uGrow.value);
          u.uLight.value += (lightTo - u.uLight.value) * Math.min(1, dt * 12);
          const ax = Math.cos(state.az) * 1.5, az = Math.sin(state.az) * 1.5;
          sheet.rotation.y = Math.PI / 2 - state.az;
          sheet.position.set(ax, hill(ax, az), az);
          sheet.visible = state.walk < 0.98 || options.keep === "sheet";
        }
        for (const f of flowers) f.position.y = f.userData.h * Math.min(1, U.uGrow.value / 1.2) * (1 - 0.26 * state.walk);
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    place();
    emit("fx:turned", { index: 0, steps: cfg.steps });
    lastSent = 0;

    return () => {
      cancelAnimationFrame(raf);
      ac.abort(); ro.disconnect(); io.disconnect();
      document.body.classList.remove("is-fx-turning");
      geo.dispose(); base.dispose(); groundGeo.dispose(); blades.material.dispose(); ground.material.dispose(); flowerTex.dispose(); flowerMat.dispose();
      if (sheet) { sheet.geometry.dispose(); sheet.material.dispose(); }
      sheets.forEach((x) => x.tex.dispose());
      renderer.dispose(); renderer.forceContextLoss();
      canvas.remove(); probeEl.remove();
    };
  });
})();
