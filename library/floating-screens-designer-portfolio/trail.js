// All pages: halftone dots sprout and settle where the cursor passes, and the wordmark behind the screen (ghost letters · CONTACT) breaks into dots only in the cells the trail touches.
// Original (halftone background, canvas stuck to the screen at z -1, only with a fine pointer and motion allowed) values: dot cell = Screen width/102 · resting dot .144 cell (below the .15 threshold so hidden),
// Grows by 1+.92 times the tail strength and appears between .15→.225 · brush diameter 105px (when fast 1+.6×min(3, speed/1500) times), scatter .35 ·
// The brush head chases the cursor with spring .25 · inertia .43 (1/60s steps) · the tail keeps only 1−dt/.85×3 each frame and sheds dt×.03 more until it reaches 0 ·
// Tail edge ripple 83px (pattern 180px · speed .3) · hole .3 · dot melt .27 cell (resting)→1.7 cells (on the tail) · ink 5% · magnifier around the cursor .25x radius 200px ·
// Wordmark cells turn into dots (1.6 cells, 1.2 cells if the tail reaches .46) from tail .41, and go back to letters once they drop below.
(() => {
  if (!window.THREE || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine)").matches) return;
  const T = THREE;
  const cv = document.createElement("canvas");
  cv.className = "halftone";
  cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  let r;
  try { r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true }); } catch { cv.remove(); return; }
  const dpr = Math.min(devicePixelRatio, 2);
  r.setPixelRatio(dpr);
  r.setClearColor(0, 0);
  // The 8-bit tail never quite reaches 0, leaving traces where it passed — use a half-precision float target, and if unavailable shave off one more step (1/255) each time
  const half = r.capabilities.isWebGL2 && r.extensions.has("EXT_color_buffer_float");
  const target = (filter) => new T.WebGLRenderTarget(1, 1, { type: half ? T.HalfFloatType : T.UnsignedByteType, minFilter: filter, magFilter: filter, depthBuffer: false });
  const trails = [target(T.LinearFilter), target(T.LinearFilter)], sizes = target(T.NearestFilter);
  const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new T.PlaneGeometry(2, 2);
  const VERT = "void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const NOISE = /* glsl */ `
    float hash(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.02 + vec2(13.1, 7.7); a *= 0.5; } return v; }`;
  const pass = (fragmentShader, uniforms) => {
    const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader, uniforms, depthTest: false, depthWrite: false });
    const scene = new T.Scene();
    scene.add(new T.Mesh(quad, mat));
    return { scene, u: mat.uniforms };
  };
  // All positions are in CSS px, with y growing downward. The tail target is 1/4 screen resolution
  const Q = 0.25;
  const trail = pass(/* glsl */ `
    precision highp float;
    uniform sampler2D uPrev; uniform vec2 uSize, uA, uB; uniform float uR, uKeep, uEps, uOn, uSeed;
    ${NOISE}
    void main() {
      float v = max(0.0, texture2D(uPrev, gl_FragCoord.xy / uSize).r * uKeep - uEps);
      vec2 p = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y) / ${Q.toFixed(2)};
      vec2 ab = uB - uA;
      float h = clamp(dot(p - uA, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
      float rr = uR * (1.0 + (vnoise(p * 0.045 + uSeed) - 0.5) * 0.35);
      float dab = uOn * clamp(1.0 - length(p - uA - ab * h) / rr, 0.0, 1.0);
      gl_FragColor = vec4(max(v, dab), 0.0, 0.0, 1.0);
    }`, { uPrev: { value: null }, uSize: { value: new T.Vector2(1, 1) }, uA: { value: new T.Vector2() }, uB: { value: new T.Vector2() }, uR: { value: 52.5 }, uKeep: { value: 1 }, uEps: { value: 0 }, uOn: { value: 0 }, uSeed: { value: 0 } });
  // One slot per dot: size (stored at .5x — so 1.6 slots don’t overflow even on 8-bit targets) · tail strength · whether the slot covers text
  const dots = pass(/* glsl */ `
    precision highp float;
    uniform sampler2D uTrail, uShape; uniform vec2 uRes, uGrid; uniform vec4 uRect; uniform float uCell, uTime, uShapeOn;
    ${NOISE}
    float letter(vec2 c) {
      vec2 uv = (c - uRect.xy) / uRect.zw;
      if (uShapeOn < 0.5 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
      return texture2D(uShape, vec2(uv.x, 1.0 - uv.y)).a;
    }
    void main() {
      vec2 c = (floor(gl_FragCoord.xy) - floor(uGrid * 0.5) + 0.5) * uCell + uRes * 0.5;
      float t = uTime * 0.3;
      vec2 n = c / 180.0;
      vec2 uv = (c + (vec2(fbm(n + t), fbm(n - t + 5.2)) - 0.5) * 166.0) / uRes;
      float tr = uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 ? 0.0 : texture2D(uTrail, vec2(uv.x, 1.0 - uv.y)).r;
      tr *= mix(1.0, smoothstep(0.25, 0.65, fbm(c / 108.0 + vec2(t * 0.7, -t * 0.4) + 11.0)), 0.3);
      float size = 0.1442 * (1.0 + 0.92 * tr);
      float onLetter = step(0.5, letter(c)) * step(0.41, tr);
      if (onLetter > 0.5) size = max(size, mix(1.6, 1.2, smoothstep(0.41, 0.46, tr)));
      size *= smoothstep(0.15, 0.225, size);
      gl_FragColor = vec4(size * 0.5, tr, onLetter, 1.0);
    }`, { uTrail: { value: null }, uShape: { value: null }, uRes: { value: new T.Vector2(1, 1) }, uGrid: { value: new T.Vector2(1, 1) }, uRect: { value: new T.Vector4(0, 0, 1, 1) }, uCell: { value: 14 }, uTime: { value: 0 }, uShapeOn: { value: 0 } });
  // Neighboring dots melt together by their tail strength (smooth minimum). Cells covering text are wiped with the background color, then dots are drawn on top
  const screen = pass(/* glsl */ `
    precision highp float;
    uniform sampler2D uSizes; uniform vec2 uRes, uGrid, uMouse; uniform float uCell, uDpr; uniform vec3 uInk, uPaper;
    float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
    vec4 at(vec2 id) {
      vec2 uv = (id + floor(uGrid * 0.5) + 0.5) / uGrid;
      return uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 ? vec4(0.0) : texture2D(uSizes, uv);
    }
    void main() {
      vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
      vec2 d = p - uMouse;
      p = uMouse + d / (1.0 + 0.25 * exp(-dot(d, d) / 40000.0));
      vec2 cell = floor((p - uRes * 0.5) / uCell);
      float f = 1e5;
      for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++) {
        vec2 id = cell + vec2(float(x), float(y));
        vec4 s = at(id);
        float rad = s.r * uCell;
        if (rad <= 0.05) continue;
        f = smin(f, length(p - (id + 0.5) * uCell - uRes * 0.5) - rad, mix(0.27, 1.7, s.g) * uCell);
      }
      float a = (1.0 - smoothstep(-0.5 / uDpr, 0.5 / uDpr, f)) * 0.05;
      float erase = at(cell).b;
      gl_FragColor = vec4(uInk * a + uPaper * erase * (1.0 - a), a + erase * (1.0 - a));
    }`, { uSizes: { value: sizes.texture }, uRes: { value: new T.Vector2(1, 1) }, uGrid: { value: new T.Vector2(1, 1) }, uMouse: { value: new T.Vector2(-1e4, -1e4) }, uCell: { value: 14 }, uDpr: { value: dpr }, uInk: { value: new T.Vector3() }, uPaper: { value: new T.Vector3() } });
  const rgb = (name) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace("#", "");
    const n = parseInt(v.length === 3 ? [...v].map((c) => c + c).join("") : v.slice(0, 6), 16) || 0;
    return new T.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };
  screen.u.uInk.value = rgb("--kf-ink");
  screen.u.uPaper.value = rgb("--kf-bg");

  // Wordmark glyph shape — draws the DOM text onto a canvas in the same font and size and checks whether a cell’s center is inside a glyph
  const mask = document.createElement("canvas"), mctx = mask.getContext("2d"), shapeTex = new T.CanvasTexture(mask);
  dots.u.uShape.value = shapeTex;
  let maskKey = "";
  const wordmark = () => {
    for (const el of document.querySelectorAll(".ghost, .footer__word")) {
      if (el._undo) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility !== "visible") continue;
      const b = el.getBoundingClientRect();
      if (b.bottom > 0 && b.top < innerHeight && b.width > 0) return { el, cs, b };
    }
    return null;
  };
  const shape = () => {
    const w = wordmark();
    dots.u.uShapeOn.value = w ? 1 : 0;
    if (!w) return;
    const { el, cs, b } = w, mw = Math.min(2048, Math.ceil(b.width)), mh = Math.max(1, Math.ceil(b.height * (mw / b.width)));
    const key = [el.textContent, cs.font, cs.letterSpacing, mw, mh].join("|");
    if (key !== maskKey) {
      maskKey = key;
      mask.width = mw; mask.height = mh;
      const k = mw / b.width;
      mctx.setTransform(k, 0, 0, k, 0, 0);
      mctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      mctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      mctx.textAlign = "center";
      mctx.textBaseline = "alphabetic";
      mctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
      const m = mctx.measureText(el.textContent), A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent;
      mctx.fillText(el.textContent, b.width / 2, (b.height - (A + D)) / 2 + A);
      shapeTex.needsUpdate = true;
    }
    dots.u.uRect.value.set(b.left, b.top, b.width, b.height);
  };

  let W = 0, H = 0, cols = 0, rows = 0;
  const fit = () => {
    W = innerWidth; H = innerHeight;
    r.setSize(W, H, false);
    const cell = W / 102;
    cols = Math.ceil(W / cell) + 8; rows = Math.ceil(H / cell) + 8;
    sizes.setSize(cols, rows);
    const tw = Math.max(1, Math.round(W * Q)), th = Math.max(1, Math.round(H * Q));
    for (const t of trails) { t.setSize(tw, th); r.setRenderTarget(t); r.clear(); }
    r.setRenderTarget(null);
    trail.u.uSize.value.set(tw, th);
    for (const u of [dots.u, screen.u]) { u.uRes.value.set(W, H); u.uGrid.value.set(cols, rows); u.uCell.value = cell; }
  };
  fit();
  addEventListener("resize", () => { fit(); wake(); });

  const mouse = { x: 0, y: 0, seen: false }, head = { x: -1, y: -1, vx: 0, vy: 0 };
  const t0 = performance.now();
  let last = t0, lastPaint = -1e9, awake = false;
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true; wake(); }, { passive: true });

  const frame = () => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    let moved = 0;
    if (mouse.seen) {
      if (head.x < 0) Object.assign(head, { x: mouse.x, y: mouse.y });
      const fx = head.x, fy = head.y, n = Math.min(10, Math.max(1, Math.round(dt * 60)));
      for (let i = 0; i < n; i++) {
        head.vx = (head.vx + (mouse.x - head.x) * 0.25) * 0.43; head.vy = (head.vy + (mouse.y - head.y) * 0.25) * 0.43;
        head.x += head.vx; head.y += head.vy;
      }
      if (Math.abs(head.vx) + Math.abs(head.vy) > 0.05) lastPaint = now;
      moved = Math.hypot(head.x - fx, head.y - fy);
      const speed = moved / Math.max(dt, 1 / 240);
      trail.u.uA.value.set(fx, fy); trail.u.uB.value.set(head.x, head.y);
      trail.u.uR.value = 52.5 * (1 + 0.6 * Math.min(3, speed / 1500));
    }
    trail.u.uOn.value = moved >= 0.2 ? 1 : 0;
    trail.u.uSeed.value = (now % 10000) * 0.37;
    trail.u.uKeep.value = 1 - Math.min(1, (dt / 0.85) * 3);
    trail.u.uEps.value = dt * 0.03 + (half ? 0 : 1 / 255);
    trail.u.uPrev.value = trails[0].texture;
    r.setRenderTarget(trails[1]); r.render(trail.scene, cam);
    trails.reverse();
    shape();
    dots.u.uTrail.value = trails[0].texture;
    dots.u.uTime.value = (now - t0) / 1000;
    r.setRenderTarget(sizes); r.render(dots.scene, cam);
    r.setRenderTarget(null);
    screen.u.uMouse.value.set(mouse.seen ? mouse.x : -1e4, mouse.seen ? mouse.y : -1e4);
    r.render(screen.scene, cam);
    // Once the tail is fully out (original: .85+.5s after the last brush stroke), drawing rests — by then the canvas is already empty
    if (now - lastPaint > 1350) { awake = false; gsap.ticker.remove(frame); }
  };
  const wake = () => { if (!awake) { awake = true; last = performance.now(); gsap.ticker.add(frame); } };
  // Binding the shader on the first cursor move freezes the screen — bind it ahead of time during setup and draw once
  for (const p of [trail, dots, screen]) r.compile(p.scene, cam);
  frame();
})();
