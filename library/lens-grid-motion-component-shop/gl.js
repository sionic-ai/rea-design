/* Three WebGL devices — lens grid wall (hero) · paint beads · glass cylinder slider. three r182 (same version as the original), shaders rewritten to match the original’s numbers. 
   The picture panel (pattern) is painted by AN.paintShot in shared.js using skin variables. The shader is drawn once when set up so it is precompiled. */
(() => {
  const { css, reduce } = window.AN;
  const T = window.THREE;
  if (!T) return;
  /* The shader does no output color conversion, so skin colors are passed as sRGB values as they are — that way the gradient joins the page background */
  const col = (name) => { const c = new T.Color(); c.setStyle(css(name) || css("--kf-ink"), T.SRGBColorSpace); const o = {}; c.getRGB(o, T.SRGBColorSpace); return new T.Color(o.r, o.g, o.b); };
  const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const visible = (el, cb) => { const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: "200px 0px" }); io.observe(el); return io; };
  const QUAD_V = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FROST = `
    vec4 frost(sampler2D t, vec2 uv, vec2 res, float r) {
      vec4 acc = texture2D(t, uv); float ws = 1.0;
      for (int i = 1; i < 32; i++) {
        float f = float(i), rr = sqrt(f / 31.0), a = f * 2.39996;
        float w = 1.0 - 0.6 * rr;
        acc += texture2D(t, uv + vec2(cos(a), sin(a)) * rr * r / res) * w; ws += w;
      }
      return acc / ws;
    }`;

  /* ── Lens grid wall ── cell size is .26 of the width (landscape) · .36 · .62 (portrait), lens [.12,.07,.035,.03], flow .05 cell/s, 
     Drag inertia .94/frame, body tilt ±.06 cell, entrance 1.6s expo.out (size .7→1 · lens +1.6→0 · below -.6→0), the lens flattens on scroll */
  const wall = (box, { count = 24, onPick, copyEl } = {}) => {
    const LENS = [0.12, 0.07, 0.035, 0.03], SLOT_W = 320, SLOT_H = 222, RATIO = SLOT_W / SLOT_H;
    const MW = 269, MH = Math.round(MW / (1280 / 804)), MY = (SLOT_H - MH) / 2, MX = (SLOT_W - MW) / 2;
    const renderer = new T.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    box.append(renderer.domElement);
    const cols = 4, rows = Math.ceil(count / cols);
    const atlas = document.createElement("canvas");
    atlas.width = SLOT_W * cols; atlas.height = SLOT_H * rows;
    const paint = () => {
      const g = atlas.getContext("2d");
      g.fillStyle = css("--kf-bg"); g.fillRect(0, 0, atlas.width, atlas.height);
      for (let i = 0; i < count; i++) {
        const x = (i % cols) * SLOT_W, y = Math.floor(i / cols) * SLOT_H;
        window.AN.paintShot(g, x + MX, y + MY, MW, MH, i + 3);
        g.fillStyle = css("--kf-ink"); g.font = `500 10px ${css("--kf-font-sans")}`; g.textBaseline = "middle";
        g.fillText(`Component ${String(i + 1).padStart(2, "0")}`, x + MX, y + MY + MH + MY / 2);
      }
      tex.needsUpdate = true;
    };
    const tex = new T.CanvasTexture(atlas);
    tex.colorSpace = T.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = T.LinearFilter; tex.flipY = false;
    const rt = new T.WebGLRenderTarget(2, 2, { depthBuffer: false });
    const grid = new T.ShaderMaterial({
      vertexShader: QUAD_V, depthTest: false, depthWrite: false,
      uniforms: { uAtlas: { value: tex }, uRes: { value: new T.Vector2(1, 1) }, uCell: { value: new T.Vector2(1, 1) }, uPan: { value: new T.Vector2() },
        uLens: { value: new T.Vector4(...LENS) }, uHa: { value: new T.Vector4(1e6, 1e6, 0, 0) }, uHb: { value: new T.Vector4(1e6, 1e6, 0, 0) },
        uMedia: { value: new T.Vector4(MX / SLOT_W, MY / SLOT_H, (MX + MW) / SLOT_W, (MY + MH) / SLOT_H) }, uSlots: { value: new T.Vector2(cols, rows) },
        uCount: { value: count }, uInk: { value: col("--kf-ink") } },
      fragmentShader: `
        uniform sampler2D uAtlas; uniform vec2 uRes, uCell, uPan, uSlots; uniform vec4 uLens, uHa, uHb, uMedia; uniform float uCount; uniform vec3 uInk;
        varying vec2 vUv;
        vec2 bend(vec2 s) { vec2 q = s * s; return vec2(s.x * (1.0 + uLens.z * q.x) / (1.0 + uLens.y * q.y), s.y * (1.0 + uLens.w * q.y) / (1.0 + uLens.x * q.x)); }
        float lit(vec2 c, vec4 h) { vec2 d = abs(c - h.xy); return (d.x < 0.5 && d.y < 0.5) ? h.z : 0.0; }
        void main() {
          vec2 s = (vUv - 0.5) * 2.0 * vec2(uRes.x / uRes.y, 1.0);
          vec2 cell = bend(s) / uCell - uPan;
          vec2 ci = floor(cell), lc = cell - ci;
          float h = max(lit(ci, uHa), lit(ci, uHb));
          vec2 m = (lc - uMedia.xy) / (uMedia.zw - uMedia.xy);
          float inM = step(0.0, m.x) * step(m.x, 1.0) * step(0.0, m.y) * step(m.y, 1.0);
          vec2 mz = 0.5 + (m - 0.5) / (1.0 + 0.04 * h);
          float idx = mod(ci.x + 3.0 * ci.y, uCount);
          vec2 slot = vec2(mod(idx, uSlots.x), floor(idx / uSlots.x));
          vec2 lu = inM > 0.5 ? uMedia.xy + mz * (uMedia.zw - uMedia.xy) : lc;
          lu = clamp(lu, 0.003, 0.997);
          vec3 c = texture2D(uAtlas, vec2((slot.x + lu.x) / uSlots.x, (slot.y + 1.0 - lu.y) / uSlots.y)).rgb;
          c += (1.0 - inM) * h * (0.08 + 0.1 * (1.0 - lc.y));
          vec2 fw = max(fwidth(cell), vec2(1e-5));
          vec2 e = min(lc, 1.0 - lc) / fw;
          c = mix(c, uInk, 0.07 * (1.0 - smoothstep(0.0, 1.0, min(e.x, e.y))));
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const post = new T.ShaderMaterial({
      vertexShader: QUAD_V, depthTest: false, depthWrite: false,
      uniforms: { tScene: { value: rt.texture }, uRes: { value: new T.Vector2(1, 1) }, uCopy: { value: 0.45 }, uFade: { value: 0 }, uBg: { value: col("--kf-bg") } },
      fragmentShader: `
        uniform sampler2D tScene; uniform vec2 uRes; uniform float uCopy, uFade; uniform vec3 uBg; varying vec2 vUv;
        ${FROST}
        void main() {
          vec4 c = texture2D(tScene, vUv);
          float y = 1.0 - vUv.y;
          float t = clamp((y - uCopy + 0.12) / 0.30, 0.0, 1.0);
          float r = 1.0 - smoothstep(0.0, 1.0, pow(t, 1.5));
          if (r > 0.001) { vec4 f = frost(tScene, vUv, uRes, 14.0 * r); f.rgb = mix(f.rgb, f.rgb * 0.92 + 0.04, 0.5 * r); c = mix(c, f, smoothstep(0.0, 0.1, r)); }
          float g = clamp((0.80 - y) / 0.70, 0.0, 1.0);
          c.rgb = mix(c.rgb, uBg, 1.0 - (1.0 - g) * (1.0 - g));
          c.rgb = mix(c.rgb, uBg, 0.55 * smoothstep(0.6, 1.4, length((vUv - 0.5) * 2.0)));
          gl_FragColor = vec4(mix(uBg, c.rgb, uFade), 1.0);
        }`,
    });
    const quad = new T.PlaneGeometry(2, 2);
    const gScene = new T.Scene(); gScene.add(new T.Mesh(quad, grid));
    const pScene = new T.Scene(); pScene.add(new T.Mesh(quad, post));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const st = { pan: { x: -0.5, y: -0.5 }, vel: { x: 0, y: 0 }, lean: { x: 0, y: 0 }, leanTo: { x: 0, y: 0 }, bend: 1, w: 1, h: 1, cellPx: 300, copy: 0.45,
      scrollP: 0, drag: false, ptr: null, touch: matchMedia("(hover: none)").matches, introT: reduce ? 9 : null, ha: { x: 1e6, y: 1e6, t: 0, on: false }, hb: { x: 1e6, y: 1e6, t: 0 }, on: true };
    const cellAt = (u, v) => {
      const a = (u - 0.5) * 2 * (st.w / st.h), b = (v - 0.5) * 2, a2 = a * a, b2 = b * b;
      const l = grid.uniforms.uLens.value, c = grid.uniforms.uCell.value, p = grid.uniforms.uPan.value;
      const x = (a * (1 + l.z * a2)) / (1 + l.y * b2), y = (b * (1 + l.w * b2)) / (1 + l.x * a2);
      return { x: Math.floor(x / c.x - p.x), y: Math.floor(y / c.y - p.y) };
    };
    const frostAt = (v) => { const r = Math.min(1, Math.max(0, (1 - v - st.copy + 0.12) / 0.3)) ** 1.5; return 1 - r * r * (3 - 2 * r); };
    const size = () => {
      const w = box.clientWidth || 1, h = box.clientHeight || 1, pr = renderer.getPixelRatio();
      renderer.setSize(w, h, false);
      rt.setSize(Math.round(w * pr), Math.round(h * pr));
      grid.uniforms.uRes.value.set(w * pr, h * pr); post.uniforms.uRes.value.set(w * pr, h * pr);
      st.w = w; st.h = h; const asp = w / h;
      st.cellPx = w * (asp < 1 ? 0.62 : asp < 1.3 ? 0.36 : 0.26);
      if (copyEl) st.copy = Math.min(0.8, (copyEl.offsetTop + copyEl.offsetHeight) / h);
    };
    const frame = (dtMs) => {
      const dt = Math.min(dtMs / 1000, 0.1), d = dt * 60;
      if (!reduce) st.pan.x += 0.05 * dt;
      if (!st.drag) { st.pan.x += st.vel.x * d; st.pan.y += st.vel.y * d; const k = Math.pow(0.94, d); st.vel.x *= k; st.vel.y *= k; }
      const sp = Math.hypot(st.vel.x, st.vel.y);
      st.bend += (1 + Math.min(0.6, 6 * sp) - st.bend) * (1 - Math.pow(0.9, d));
      const lk = 1 - Math.pow(0.95, d);
      st.lean.x += (st.leanTo.x - st.lean.x) * lk; st.lean.y += (st.leanTo.y - st.lean.y) * lk;
      let m = 1, lensAdd = 0, dy = 0, fade = 1;
      if (st.introT !== null && st.introT < 1.6) {
        st.introT += dt;
        const e = expoOut(Math.min(1, st.introT / 1.6));
        m = 0.7 + 0.3 * e; lensAdd = 1.6 * (1 - e); dy = -0.6 * (1 - e); fade = expoOut(Math.min(1, st.introT / 0.6));
      } else if (st.introT === null) fade = 0;
      const flat = reduce ? 1 : 1 - st.scrollP;
      fade *= 1 - 0.5 * Math.min(1, st.scrollP / 0.35);
      const L = grid.uniforms.uLens.value;
      L.set(LENS[0] * (st.bend + lensAdd) * flat, LENS[1] * (st.bend + lensAdd) * flat, LENS[2] * (st.bend + lensAdd) * flat, LENS[3] * (st.bend + lensAdd) * flat);
      const cx = (st.cellPx * m) / (st.h / 2);
      grid.uniforms.uCell.value.set(cx, cx / RATIO);
      grid.uniforms.uPan.value.set(st.pan.x + st.lean.x, st.pan.y + st.lean.y + dy);
      let hit = null;
      const intro = st.introT === null || st.introT < 1.6;
      if (!st.drag && !intro) {
        if (st.touch) { if (sp < 0.004) hit = cellAt(0.5, (1 - st.copy - 0.18) / 2); }
        else if (st.ptr && frostAt(st.ptr.v) < 0.3) hit = cellAt(st.ptr.u, st.ptr.v);
      }
      const A = st.ha;
      if (hit ? !A.on || hit.x !== A.x || hit.y !== A.y : A.on) {
        st.hb = A; st.ha = hit ? { x: hit.x, y: hit.y, t: 0, on: true } : { x: 1e6, y: 1e6, t: 0, on: false };
        box.style.cursor = hit && !st.touch ? "pointer" : "";
      }
      const hk = 1 - Math.pow(0.82, d);
      st.ha.t += (+st.ha.on - st.ha.t) * hk; st.hb.t -= st.hb.t * hk;
      grid.uniforms.uHa.value.set(st.ha.x, st.ha.y, st.ha.t, 0); grid.uniforms.uHb.value.set(st.hb.x, st.hb.y, st.hb.t, 0);
      post.uniforms.uCopy.value = st.copy; post.uniforms.uFade.value = fade;
      renderer.setRenderTarget(rt); renderer.render(gScene, cam);
      renderer.setRenderTarget(null); renderer.render(pScene, cam);
    };
    let last = performance.now(), raf = 0;
    const loop = (now) => { raf = 0; if (!st.on) return; frame(Math.max(1, now - last)); last = now; raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    visible(box, (on) => { st.on = on; if (on) start(); });
    const rect = () => box.getBoundingClientRect();
    const uv = (e) => { const r = rect(); return { u: (e.clientX - r.left) / st.w, v: 1 - (e.clientY - r.top) / st.h }; };
    let px = 0, py = 0, pt = 0, sx = 0, sy = 0;
    box.addEventListener("pointerdown", (e) => { st.drag = true; st.vel.x = st.vel.y = 0; px = sx = e.clientX; py = sy = e.clientY; pt = performance.now(); });
    addEventListener("pointermove", (e) => {
      if (!st.drag) {
        if (e.pointerType === "mouse" && box.contains(e.target)) { st.ptr = uv(e); st.leanTo.x = -0.06 * 2 * (st.ptr.u - 0.5); st.leanTo.y = -0.06 * 2 * (st.ptr.v - 0.5); }
        return;
      }
      const now = performance.now(), dx = (e.clientX - px) / st.cellPx, dy = st.touch ? 0 : -(e.clientY - py) / (st.cellPx / RATIO);
      st.pan.x += dx; st.pan.y += dy;
      const k = 1000 / 60 / Math.max(1, now - pt);
      st.vel.x = dx * k; st.vel.y = dy * k; px = e.clientX; py = e.clientY; pt = now;
    });
    const up = () => { st.drag = false; };
    addEventListener("pointerup", up); addEventListener("pointercancel", up);
    box.addEventListener("pointerleave", () => { st.ptr = null; st.leanTo.x = st.leanTo.y = 0; });
    box.addEventListener("click", (e) => {
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) return;
      const p = uv(e);
      if (frostAt(p.v) >= 0.3) return;
      const c = cellAt(p.u, p.v);
      onPick?.((((c.x + 3 * c.y) % count) + count) % count);
    });
    let lastY = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY, top = rect().top + y;
      st.pan.y -= ((y - lastY) / (st.cellPx / RATIO)) * 0.4;
      st.scrollP = Math.min(1, Math.max(0, (y - top) / st.h));
      lastY = y;
    }, { passive: true });
    new ResizeObserver(size).observe(box);
    if (copyEl) new ResizeObserver(size).observe(copyEl);
    size();
    paint();
    document.fonts?.ready.then(paint);
    renderer.compile(gScene, cam); renderer.compile(pScene, cam);
    frame(16);
    start();
    return { intro: () => { if (!reduce) st.introT = 0; } };
  };

  /* ── Paint marble ── views a pattern plate (noise from a six-cell palette made from the skin orange) through a spherical lens and warps it with noise.
     Time .12/s, switching tabs rolls it to another spot on the image (exponential .35s) — stirs as it rolls (rise .12s · settle .7s), a press sends ripples (1.6s, up to three) */
  const orb = (box, { frames = 3 } = {}) => {
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0, 0);
    box.append(renderer.domElement);
    /* Palette is mixed in plain sRGB (original six stops: deep night brown → orange → light apricot → near white) */
    const acc = col("--kf-accent"), light = col("--kf-contrast-bg"), dark = col("--kf-bg").lerp(acc, 0.2).multiplyScalar(1.4);
    const stops = [dark, acc.clone(), acc.clone().lerp(light, 0.16), acc.clone().lerp(light, 0.36), acc.clone().lerp(light, 0.7), acc.clone().lerp(light, 0.93)];
    const N = 256, cv = document.createElement("canvas"); cv.width = cv.height = N;
    const g = cv.getContext("2d"), img = g.createImageData(N, N);
    const rnd = window.AN.rand(7);
    const lattice = (n) => { const a = new Float32Array(n * n).map(() => rnd()); return (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, x0 = ((xi % n) + n) % n, y0 = ((yi % n) + n) % n, x1 = (x0 + 1) % n, y1 = (y0 + 1) % n;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a0 = a[y0 * n + x0], b0 = a[y0 * n + x1], a1 = a[y1 * n + x0], b1 = a[y1 * n + x1];
      return a0 + (b0 - a0) * sx + (a1 - a0) * sy + (a0 - b0 - a1 + b1) * sx * sy; }; };
    const fbm = () => { const o = [0, 1, 2, 3].map((k) => lattice(3 << k)); return (x, y) => { let s = 0, w = 0.5, t = 0; o.forEach((f, k) => { s += w * f(x * (3 << k), y * (3 << k)); t += w; w *= 0.5; }); return s / t; }; };
    const n0 = fbm(), n1 = fbm(), n2 = fbm();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      let t = n0(u + 0.3 * (n1(u, v) - 0.5), v + 0.3 * (n2(u, v) - 0.5));
      t = Math.min(1, Math.max(0, (t - 0.3) / 0.42)); t = t * t * (3 - 2 * t);
      const h = t * 5, i = Math.min(4, Math.floor(h)), f = h - i, c = stops[i].clone().lerp(stops[i + 1], f), k = (y * N + x) * 4;
      img.data[k] = c.r * 255; img.data[k + 1] = c.g * 255; img.data[k + 2] = c.b * 255; img.data[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const tex = new T.CanvasTexture(cv); tex.wrapS = tex.wrapT = T.RepeatWrapping;
    const rip = Array.from({ length: 3 }, () => new T.Vector4(0, 0, 0, 0));
    const mat = new T.ShaderMaterial({
      vertexShader: QUAD_V, transparent: true,
      uniforms: { uPaint: { value: tex }, uTime: { value: 0 }, uPx: { value: 0.01 }, uFrame: { value: new T.Vector4(0.8, 0, 0, 0) }, uStir: { value: 0 }, uRip: { value: rip }, uRim: { value: acc } },
      fragmentShader: `
        uniform sampler2D uPaint; uniform float uTime, uPx, uStir; uniform vec4 uFrame; uniform vec4 uRip[3]; uniform vec3 uRim; varying vec2 vUv;
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float vnoise(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z) * 2.0 - 1.0; }
        float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
        vec3 paint(vec2 uv) { float c = cos(uFrame.y), s = sin(uFrame.y); uv = mat2(c, -s, s, c) * (uv - 0.5) * uFrame.x + 0.5 + uFrame.zw; return texture2D(uPaint, uv).rgb; }
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float d = length(p);
          if (d > 1.0 + uPx * 2.0) { gl_FragColor = vec4(0.0); return; }
          float z = sqrt(max(0.0, 1.0 - min(d * d, 1.0)));
          vec3 n = normalize(vec3(p, z));
          vec2 uv = 0.5 + p / (1.0 + z) * 0.62;
          float glow = 0.0, slope = 0.0;
          for (int i = 0; i < 3; i++) {
            vec4 r = uRip[i]; if (r.w <= 0.0) continue;
            float a = r.z / 1.6;
            float g0 = acos(clamp(dot(n, normalize(vec3(r.xy, sqrt(max(0.0, 1.0 - dot(r.xy, r.xy)))))), -1.0, 1.0));
            float rad = 2.2 * (1.0 - exp(-3.0 * a));
            float wd = 0.16 * (1.0 + rad * 0.6);
            float fade = r.w * exp(-2.0 * a) / sqrt(1.0 + rad) * (1.0 - smoothstep(0.85, 1.0, a)) * smoothstep(0.0, 0.15, g0);
            float b = (g0 - rad) / wd, wave = b * exp(-b * b);
            uv += (p / max(d, 0.001)) * wave * 0.05 * fade; glow += max(wave, 0.0) * fade; slope += wave * fade;
          }
          float tw = uStir * 1.4 * (1.0 - d * d);
          vec2 tc = uv - 0.5; uv = mat2(cos(tw), -sin(tw), sin(tw), cos(tw)) * tc + 0.5;
          float stir = 1.0 + uStir * 1.5;
          vec2 w = uv * 2.2;
          vec2 q = vec2(fbm(vec3(w, uTime * 0.4)), fbm(vec3(w + vec2(5.2, 1.3), uTime * 0.4)));
          vec2 r2 = vec2(fbm(vec3(w + 1.6 * q + vec2(1.7, 9.2), uTime)), fbm(vec3(w + 1.6 * q + vec2(8.3, 2.8), uTime * 0.9)));
          float f = fbm(vec3(w + 1.6 * r2, uTime * 0.5));
          uv += (n.xy * f * 0.08 + r2 * 0.05) * 0.8 * stir;
          vec3 c = clamp(paint(uv) * 1.06, 0.0, 1.0);
          c = mix(c, vec3(1.0), clamp(glow * 0.35, 0.0, 1.0));
          c *= 1.0 - clamp(slope, -1.0, 1.0) * 0.18;
          float face = dot(n, normalize(vec3(0.6, 0.7, 0.4)));
          c = mix(c, c * vec3(0.55, 0.5, 0.62), smoothstep(0.35, 1.05, d) * (0.5 - 0.5 * face) * 0.5);
          float rm = smoothstep(0.82, 1.0, d); c = mix(c, uRim, rm * rm * 0.3);
          float gr = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);
          c = mix(c, c + (gr - 0.5) * 0.1, 0.35);
          float soft = max(uPx * 2.0, 0.054), al = 1.0 - smoothstep(1.0 - soft, 1.0 + uPx, d);
          gl_FragColor = vec4(c * al, al);
        }`,
    });
    const scene = new T.Scene(); scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fr = Array.from({ length: frames }, (_, i) => new T.Vector4(0.7 + 0.2 * ((i * 37) % 10) / 10, (((i * 53) % 10) / 10 - 0.5) * 0.6, 0.06 * i, -0.32 * i));
    let target = 0, at = 0, stir = 0, ri = 0, on = true, dirty = true, lastDraw = 0;
    const size = () => { const w = box.clientWidth || 1; renderer.setSize(w, w, false); mat.uniforms.uPx.value = 2 / (w * renderer.getPixelRatio()); dirty = true; };
    const ripple = (x, y) => { const r = rip[ri]; ri = (ri + 1) % 3; r.set(x, y, 0, 1); dirty = true; };
    const draw = () => {
      const k = Math.min(Math.max(at, 0), frames - 1), a = Math.min(Math.floor(k), Math.max(0, frames - 2)), f = k - a, A = fr[a], B = fr[Math.min(a + 1, frames - 1)];
      mat.uniforms.uFrame.value.set(A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f, A.z + (B.z - A.z) * f, A.w + (B.w - A.w) * f);
      mat.uniforms.uStir.value = stir;
      renderer.render(scene, cam); dirty = false;
    };
    const tick = (t, dtMs) => {
      if (!on) return;
      const dt = Math.min(dtMs, 100) / 1000;
      mat.uniforms.uTime.value += 0.12 * dt;
      rip.forEach((r) => { if (r.w) { r.z += dt; if (r.z > 1.6) r.w = 0; dirty = true; } });
      const prev = at;
      at += (target - at) * (1 - Math.exp(-dt / 0.35));
      const sp = Math.min((Math.abs(at - prev) / Math.max(dt, 0.001)) * 0.9, 1);
      stir += (sp - stir) * (1 - Math.exp(-dt / (sp > stir ? 0.12 : 0.7)));
      if (Math.abs(target - at) > 5e-4 || stir > 0.002) dirty = true;
      if (dirty || t - lastDraw > 0.03) { lastDraw = t; draw(); }
    };
    if (!reduce) gsap.ticker.add(tick);
    visible(box, (v) => { on = v; });
    box.addEventListener("click", (e) => {
      const r = box.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = -((e.clientY - r.top) / r.height - 0.5) * 2;
      if (x * x + y * y <= 1) ripple(x, y);
    });
    new ResizeObserver(size).observe(box);
    size(); renderer.compile(scene, cam); draw();
    return { goTo: (i) => { if (i === target) return; target = i; if (reduce) { at = i; draw(); } else ripple(0, 0); } };
  };

  /* ── Glass cylinder slider ── radius 2.28, camera z 3.72, center slide flat and wrapping onto the cylinder toward the outside (height edge +35%),
     Auto .22 items/s, drag inertia .94, scroll .6x, entrance flies in from beyond 7 items at 1.6s expo.out · gap .08. The 20% at each screen edge is thick glass (blur · bulge) */
  const cylinder = (box, { count = 8, titles = [], onPick, speed = 0.22 } = {}) => {
    const R = 2.28, CAMZ = 3.72, RATIO = 1280 / 804, VIS = (86 * Math.PI) / 180, CUT = (115 * Math.PI) / 180, EDGE = 0.35;
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0, 0);
    box.append(renderer.domElement);
    const camera = new T.PerspectiveCamera(40, 1, 0.01, 20); camera.position.set(0, 0, CAMZ);
    const scene = new T.Scene();
    const geo = new T.PlaneGeometry(1, 1 / RATIO, 48, 1);
    const tile = (i) => {
      const c = document.createElement("canvas"); c.width = 640; c.height = Math.round(640 / RATIO);
      const g = c.getContext("2d");
      window.AN.paintShot(g, 0, 0, c.width, c.height, i + 11);
      const gr = g.createLinearGradient(0, c.height * 0.62, 0, c.height);
      gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.55)"); /* Not skin: shade that keeps text over photos readable */
      g.fillStyle = gr; g.fillRect(0, c.height * 0.62, c.width, c.height * 0.38);
      g.fillStyle = css("--kf-contrast-bg"); g.font = `500 22px ${css("--kf-font-sans")}`;
      g.fillText(titles[i % titles.length] || `Component ${i + 1}`, 22, c.height - 20);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    };
    const ring = [];
    while (ring.length < 12) for (let i = 0; i < count && ring.length < 12; i++) ring.push(i);
    const texes = Array.from({ length: count }, (_, i) => tile(i));
    const VERT = `
      uniform float uPsi, uScale, uR, uEdge, uVis, uReach; varying vec2 vUv;
      void main() {
        vUv = uv;
        float t = position.x * uScale, psi = uPsi + t / uR;
        vec3 bent = vec3(uR * sin(psi), 0.0, -uR * cos(psi));
        vec3 flat0 = vec3(uR * sin(uPsi) + t * cos(uPsi), 0.0, -uR * cos(uPsi) + t * sin(uPsi));
        vec3 p = mix(flat0, bent, smoothstep(0.0, 1.0, abs(uPsi) / uReach));
        p.y = position.y * (1.0 + uEdge * min(1.0, abs(atan(p.x, -p.z)) / uVis));
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`;
    const FRAG = "uniform sampler2D uMap; uniform float uAlpha; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(uMap, vUv).rgb, uAlpha); }";
    const meshes = ring.map((k) => {
      const m = new T.Mesh(geo, new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true,
        uniforms: { uMap: { value: texes[k] }, uAlpha: { value: 1 }, uPsi: { value: 0 }, uScale: { value: 1 }, uR: { value: R }, uEdge: { value: EDGE }, uVis: { value: VIS }, uReach: { value: 1.04 / R } } }));
      m.frustumCulled = false; scene.add(m); return m;
    });
    /* A path where the angle between slides widens the farther from the center — a table integrated in advance along the arc length */
    const G = 2.28 * VIS, base = VIS / G;
    let table = [], gapAt = () => 0.04, edgePsi = 1.2, wpx = 300;
    const build = (gap) => {
      const ang = (s) => base * Math.abs(s), widen = (a) => 1 + 0.35 * Math.min(1, Math.abs(a) / VIS);
      const step = (s) => widen(ang(s)) + gap(ang(s));
      let s = 0, x = 0, z = -R; table = [{ x: 0, z: -R, psi: 0 }];
      for (let i = 1; i <= 512; i++) { const ds = step(s + (0.5 * step(s)) / 64) / 64, a = ang(s + ds / 2); x += Math.cos(a) * ds; z += Math.sin(a) * ds; s += ds; table.push({ x, z, psi: ang(s) }); }
    };
    const at = (s) => { const t = Math.min(64 * Math.abs(s), table.length - 1.001), i = Math.floor(t), f = t - i, a = table[i], b = table[i + 1]; return Math.sign(s || 1) * (a.psi + (b.psi - a.psi) * f); };
    const rt = new T.WebGLRenderTarget(2, 2);
    const post = new T.ShaderMaterial({ vertexShader: QUAD_V, transparent: true, depthTest: false, depthWrite: false,
      uniforms: { tScene: { value: rt.texture }, uRes: { value: new T.Vector2(1, 1) }, uGlass: { value: 1 } },
      fragmentShader: `
        uniform sampler2D tScene; uniform vec2 uRes; uniform float uGlass; varying vec2 vUv;
        ${FROST}
        vec4 smear(vec2 uv, vec2 dir, float sp) { vec4 a = vec4(0.0); for (int i = 0; i < 12; i++) a += texture2D(tScene, uv + dir * sp * (float(i) / 11.0 - 0.5)); return a / 12.0; }
        float hgt(vec2 p) { return sin(p.x * 7.0 + sin(p.y * 4.0) * 1.5) * 0.5 + sin(p.y * 9.0 - p.x * 3.0) * 0.5; }
        void main() {
          float asp = uRes.x / uRes.y, side = sign(vUv.x - 0.5), dE = (0.5 - abs(vUv.x - 0.5)) * asp;
          float r = 1.0 - clamp(dE / 0.2, 0.0, 1.0), g = r * uGlass, g3 = r * r * r * uGlass;
          vec4 c = texture2D(tScene, vUv);
          if (g > 0.001) {
            vec2 uv = vUv; uv.x -= side * 0.035 * g3; uv.y = 0.5 + (vUv.y - 0.5) / (1.0 + 0.14 * g3);
            vec2 q = vUv * vec2(asp, 1.0); float e = 0.002;
            uv += vec2(hgt(q + vec2(e, 0.0)) - hgt(q - vec2(e, 0.0)), hgt(q + vec2(0.0, e)) - hgt(q - vec2(0.0, e))) / (2.0 * e) * 0.004 * g;
            vec4 f = 0.7 * frost(tScene, uv, uRes, 42.0 * g) + 0.3 * smear(uv, vec2(side, 0.0), 0.06 * g3);
            f.rgb = mix(f.rgb, f.rgb * 0.88 + 0.07 * f.a, 0.6 * g);
            c = mix(c, f, smoothstep(0.0, 0.1, g));
          }
          gl_FragColor = c;
        }` });
    const pScene = new T.Scene(); pScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), post));
    const pCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const st = { offset: 0, vel: 0, drag: false, introT: null, on: true, slots: [] };
    const size = () => {
      const w = box.clientWidth || 1, h = (box.clientHeight || 1) * 1.7, pr = renderer.getPixelRatio();
      const dist =(a, wpx) => (wpx * (CAMZ * Math.cos(a) + R)) / Math.pow(CAMZ + R * Math.cos(a), 2);
      let gap = () => 0.04, half = 1, e = 0;
      for (let k = 0; k < 4; k++) { build(gap); const p = at(2); e = p - gap(p) / 2 / R; half = ((R * Math.sin(e)) / (CAMZ + R * Math.cos(e)) / 1.33) * 0.73; const l = w / 2 / half; gap = (a) => 8 / dist(a, l); }
      build(gap); edgePsi = e; gapAt = gap;
      camera.aspect = w / h; camera.fov = (2 * Math.atan(half / (w / h)) * 180) / Math.PI; camera.updateProjectionMatrix();
      wpx = (w / 2) * (1 / 6 / half);
      renderer.setSize(w, h, false); rt.setSize(Math.round(w * pr), Math.round(h * pr)); post.uniforms.uRes.value.set(w * pr, h * pr);
      post.uniforms.uGlass.value = w >= 1024 ? 1 : 0;
    };
    const n = ring.length;
    const frame = (dtMs) => {
      const dt = Math.min(dtMs / 1000, 0.1), d = dt * 60;
      if (!reduce) st.offset += (speed * d) / 60;
      if (st.introT !== null) { st.introT += dt; if (st.introT > 1.6 + 2 * 3 * 0.08) st.introT = null; }
      if (!st.drag && Math.abs(st.vel) > 2e-5) { st.offset += st.vel * d; st.vel *= Math.pow(0.94, d); }
      meshes.forEach((m, i) => {
        const r = T.MathUtils.euclideanModulo(i + st.offset + n / 2, n) - n / 2;
        let fly = 0;
        if (st.introT !== null) fly = 7 * (1 - expoOut(T.MathUtils.clamp((st.introT - (3 - r) * 0.08) / 1.6, 0, 1)));
        const s = r - fly, a0 = at(s - 0.5), a1 = at(s + 0.5), psi = (a0 + a1) / 2, ab = Math.abs(psi);
        const show = !(ab > CUT || s < -n / 2);
        m.visible = show;
        const sc = Math.max(0.2, R * (a1 - a0) - gapAt(psi));
        const u = m.material.uniforms; u.uAlpha.value = show ? 1 : 0; u.uPsi.value = psi; u.uScale.value = sc;
        st.slots[i] = { psi, half: (0.5 * sc) / R, on: show };
      });
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(pScene, pCam);
    };
    let last = performance.now(), raf = 0;
    const loop = (now) => { raf = 0; if (!st.on) return; frame(Math.max(1, now - last)); last = now; raf = requestAnimationFrame(loop); };
    visible(box, (v) => { st.on = v; if (v && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } });
    const pick = (cx, cy) => {
      const rc = renderer.domElement.getBoundingClientRect(), ray = new T.Raycaster();
      ray.setFromCamera(new T.Vector2(((cx - rc.left) / rc.width) * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1), camera);
      const o = ray.ray.origin, dv = ray.ray.direction, A = dv.x * dv.x + dv.z * dv.z, B = 2 * (o.x * dv.x + o.z * dv.z), C = o.x * o.x + o.z * o.z - R * R, D = B * B - 4 * A * C;
      if (D < 0 || !A) return -1;
      for (const t of [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)]) {
        if (t <= 0) continue;
        const x = o.x + dv.x * t, y = o.y + dv.y * t, ang = Math.atan2(x, -(o.z + dv.z * t));
        if (Math.abs(y) > (0.5 * (1 + EDGE * Math.min(1, Math.abs(ang) / VIS))) / RATIO) continue;
        const k = st.slots.findIndex((sl) => sl?.on && Math.abs(ang - sl.psi) <= sl.half);
        if (k >= 0) return ring[k];
      }
      return -1;
    };
    const toOff = (px) => px / wpx / (1 + gapAt(0));
    let lx = 0, lt = 0, sx = 0;
    box.addEventListener("pointerdown", (e) => { st.drag = true; st.vel = 0; lx = sx = e.clientX; lt = performance.now(); });
    addEventListener("pointermove", (e) => {
      if (!st.drag) { if (box.contains(e.target)) box.style.cursor = pick(e.clientX, e.clientY) >= 0 ? "pointer" : "grab"; return; }
      const now = performance.now(), o = toOff(e.clientX - lx);
      st.offset += o; st.vel = (o / Math.max(1, now - lt)) * (1000 / 60); lx = e.clientX; lt = now;
    });
    addEventListener("pointerup", () => { st.drag = false; });
    box.addEventListener("click", (e) => { if (Math.abs(e.clientX - sx) > 6) return; const k = pick(e.clientX, e.clientY); if (k >= 0) onPick?.(k); });
    let ly = scrollY;
    addEventListener("scroll", () => { st.offset += 0.6 * toOff(scrollY - ly); ly = scrollY; }, { passive: true });
    new ResizeObserver(size).observe(box);
    size(); renderer.compile(scene, camera); renderer.compile(pScene, pCam); frame(16);
    if (!reduce) { st.introT = 0; }
    return {
      nudge: (dir) => gsap.to(st, { offset: Math.round(st.offset) + dir, duration: 0.8, ease: "expo.out" }),
    };
  };

  window.ANGL = { wall, orb, cylinder };
})();
