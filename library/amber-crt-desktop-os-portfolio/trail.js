// Cursor handprint — the original stamps a fluid grid where the cursor passed, revealing the original image under particles and dither in handprint shape, then settling over 1~2 seconds.
// The grid is two boards, density and velocity (our own formula: stamp with a Gaussian brush, flow by velocity, diffuse, dampen). Values are as read from the original —
// Based on a 64-cell grid: brush radius 54px (1.5~6.75 cells), paint density .84, paint speed 10+speed×28 (speed cap 8 boards/s), flow 12, density decay 1.2/s, spread 2.2,
// Speed damping 1.3/s (from .16s after stopping, over .6s up to 3.4/s), reveal smoothstep(.02, .7). When the image changes, leftover hand marks are wiped 4/s faster first, then the swap happens.
// Not enabled unless the cursor is fine (hover · fine) or when reduced motion is on — the original has no such reaction on phones either
(() => {
  const ok = () => !matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(hover: hover) and (pointer: fine)").matches;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const brush = (px, cols) => { const k = cols / 64; return Math.min(6.75 * k, Math.max(1.5 * k, (54 / Math.max(1, px)) * cols)); };

  const field = (cols, rows) => {
    const N = cols * rows, k = cols / 64;
    let d = new Float32Array(N), d2 = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N), t1 = new Float32Array(N), t2 = new Float32Array(N), p = new Float32Array(N);
    const mask = new Uint8Array(N);
    let peak = 0, still = 0.76;
    const cl = (v, hi) => (v < 0 ? 0 : v > hi ? hi : v);
    const sample = (a, x, y) => {
      x = cl(x, cols - 1); y = cl(y, rows - 1);
      const x0 = x | 0, y0 = y | 0, x1 = Math.min(x0 + 1, cols - 1), y1 = Math.min(y0 + 1, rows - 1), fx = x - x0, fy = y - y0;
      const top = a[y0 * cols + x0] * (1 - fx) + a[y0 * cols + x1] * fx, bot = a[y1 * cols + x0] * (1 - fx) + a[y1 * cols + x1] * fx;
      return top * (1 - fy) + bot * fy;
    };
    // Speed per cell never exceeds .9 times the board width per second
    const cap = (i) => { const u = vx[i] / cols, v = vy[i] / rows, m = u * u + v * v; if (m > 0.81) { const s = 0.9 / Math.sqrt(m); vx[i] *= s; vy[i] *= s; } };
    const reset = () => { d.fill(0); vx.fill(0); vy.fill(0); mask.fill(0); peak = 0; still = 0.76; };
    return {
      cols, rows, mask,
      alive: () => peak > 0.002,
      reset,
      // u·v are the panel ratio (0~1, v is 0 at the top), du·dv are panels/s. If it jumps more than 1.5 panels in one frame it counts as a teleport and just stamps without flow
      splat(u, v, du, dv, dt, rad) {
        if (!(dt > 0)) return;
        const h = Math.min(dt, 1 / 30), sp = Math.hypot(du, dv), flow = sp * dt <= 1.5;
        if (flow && sp * dt > 1e-5) still = 0;
        const g = flow ? Math.min(sp, 8) : 0, mx = flow ? du * dt * cols : 0, my = flow ? dv * dt * rows : 0;
        const r = Math.max(0.75 * k, rad), steps = Math.min(48, Math.max(1, Math.ceil(Math.hypot(mx, my) / (r * 0.4))));
        const rate = 1 - Math.exp(-((10 + g * 28) * h) / steps), push = flow ? (12 * h) / steps : 0, ax = du * cols * push, ay = dv * rows * push;
        const R = r * 2.5, inv = 1 / (r * r);
        for (let s = 0; s < steps; s++) {
          const a = (s + 0.5) / steps, cx = u * cols - mx * (1 - a), cy = v * rows - my * (1 - a);
          const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(rows - 1, Math.ceil(cy + R)), x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(cols - 1, Math.ceil(cx + R));
          for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            const ex = x + 0.5 - cx, ey = y + 0.5 - cy, w = Math.exp(-(ex * ex + ey * ey) * inv);
            if (w < 0.002) continue;
            const i = y * cols + x;
            d[i] += Math.max(0, 0.84 * w - d[i]) * rate;
            vx[i] += ax * w; vy[i] += ay * w; cap(i);
            if (d[i] > peak) peak = d[i];
          }
        }
      },
      step(dt, extra = 0) {
        if (peak <= 0.002) return false;
        const h = Math.min(Math.max(dt, 0), 1 / 30);
        if (!h) return true;
        still += h;
        const keep = Math.exp(-(1.3 + 2.1 * sm(0.16, 0.76, still)) * h);
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const i = y * cols + x, sx = x - vx[i] * h, sy = y - vy[i] * h;
          t1[i] = sample(vx, sx, sy) * keep; t2[i] = sample(vy, sx, sy) * keep; d2[i] = sample(d, sx, sy);
        }
        [vx, t1] = [t1, vx]; [vy, t2] = [t2, vy];
        // Pressure solve (step 14) — subtracting the excess and shortage from the flow creates swirling eddies on both sides of the cursor path, so the hand trail spreads sideways
        const L = (x) => Math.max(0, x - 1), Rt = (x) => Math.min(cols - 1, x + 1);
        for (let y = 0; y < rows; y++) {
          const up = Math.max(0, y - 1) * cols, dn = Math.min(rows - 1, y + 1) * cols;
          for (let x = 0; x < cols; x++) t1[y * cols + x] = 0.5 * (vx[y * cols + Rt(x)] - vx[y * cols + L(x)] + vy[dn + x] - vy[up + x]);
        }
        p.fill(0);
        for (let n = 0; n < 14; n++) {
          for (let y = 0; y < rows; y++) {
            const up = Math.max(0, y - 1) * cols, dn = Math.min(rows - 1, y + 1) * cols;
            for (let x = 0; x < cols; x++) t2[y * cols + x] = 0.25 * (p[y * cols + L(x)] + p[y * cols + Rt(x)] + p[up + x] + p[dn + x] - t1[y * cols + x]);
          }
          [p, t2] = [t2, p];
        }
        for (let y = 0; y < rows; y++) {
          const up = Math.max(0, y - 1) * cols, dn = Math.min(rows - 1, y + 1) * cols;
          for (let x = 0; x < cols; x++) { const i = y * cols + x; vx[i] -= 0.5 * (p[y * cols + Rt(x)] - p[y * cols + L(x)]); vy[i] -= 0.5 * (p[dn + x] - p[up + x]); cap(i); }
        }
        const s = 2.2 * k * k * h, fade = Math.exp(-(1.2 + extra) * h);
        peak = 0;
        for (let y = 0; y < rows; y++) {
          const up = Math.max(0, y - 1) * cols, dn = Math.min(rows - 1, y + 1) * cols;
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x, nb = d2[y * cols + Math.max(0, x - 1)] + d2[y * cols + Math.min(cols - 1, x + 1)] + d2[up + x] + d2[dn + x];
            const v = ((d2[i] + s * nb) / (1 + 4 * s)) * fade;
            d[i] = v;
            if (v > peak) peak = v;
            mask[i] = sm(0.02, 0.7, v) * 255;
          }
        }
        if (peak <= 0.002) reset();
        return true;
      },
    };
  };

  // A picture plate laid under the particle plate (dash-field-morph). It uses the same projection as the particle plate (plate 380×475 · z 10 · distance 2400 · sway sin(.32t)×sway · drag · wheel) and
  // Redraws along the lines, and only at the hand-mark spot does the original picture show through between the strokes. When key changes (corner menu · fx:shape · fx:progress) it clears the hand marks then swaps the picture.
  const plane = (el, { gate } = {}) => {
    const T = window.THREE, shapes = el ? [...el.querySelectorAll('[data-fx-part="shape"]')] : [];
    if (!T || !ok() || !shapes.length) return;
    const opt = Object.fromEntries((el.dataset.fxDashFieldMorph || "").split(";").map((p) => p.split(":").map((s) => s.trim())).filter((p) => p[0]));
    const cols = +(opt.cols || 280), rows = +(opt.rows || 350), tiltBase = +(opt.tilt ?? 0.12), swayAmp = +(opt.sway ?? 0.2), fit = +(opt.fit || 1), dur = +(opt.dur ?? 1.15);
    const PW = 380, PH = 475, PZ = 10, DIST = 2400;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const canvas = renderer.domElement;
    canvas.className = "e-trail";
    canvas.setAttribute("aria-hidden", "true");
    const sim = field(Math.round(64 * Math.min(2, devicePixelRatio || 1)), Math.round(72 * Math.min(2, devicePixelRatio || 1)));
    const maskTex = new T.DataTexture(sim.mask, sim.cols, sim.rows, T.RedFormat);
    maskTex.minFilter = maskTex.magFilter = T.LinearFilter;
    maskTex.needsUpdate = true;
    const U = {
      uSize: { value: new T.Vector2(1, 1) }, uEye: { value: new T.Vector2() }, uScale: { value: 1 }, uYaw: { value: 0 }, uTilt: { value: tiltBase },
      uMap: { value: null }, uMask: { value: maskTex }, uCrop: { value: new T.Vector4(0, 0, 1, 1) },
    };
    const mat = new T.ShaderMaterial({
      uniforms: U, transparent: true, depthTest: false, depthWrite: false, side: T.DoubleSide,
      vertexShader: `
uniform vec2 uSize;uniform vec2 uEye;uniform float uScale;uniform float uYaw;uniform float uTilt;varying vec2 vUv;
void main(){
  vUv=vec2(position.x+0.5,0.5-position.y);
  vec3 p=vec3(position.x*${PW.toFixed(1)},position.y*${PH.toFixed(1)},${PZ.toFixed(1)});
  float cy=cos(uYaw),sy=sin(uYaw);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
  float cx=cos(uTilt),sx=sin(uTilt);p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
  p*=uScale;float w=max((${DIST.toFixed(1)}-p.z)/${DIST.toFixed(1)},0.05);
  vec2 s=(uEye+vec2(p.x,-p.y)/w)/uSize;gl_Position=vec4(vec2(s.x*2.0-1.0,1.0-s.y*2.0)*w,0.0,w);
}`,
      fragmentShader: `
uniform sampler2D uMap;uniform sampler2D uMask;uniform vec4 uCrop;varying vec2 vUv;
void main(){
  float m=texture2D(uMask,vUv).r;if(m<=0.004)discard;
  vec4 c=texture2D(uMap,uCrop.xy+vUv*uCrop.zw);float a=m*c.a;if(a<=0.004)discard;
  gl_FragColor=vec4(c.rgb*a,a);
}`,
    });
    mat.premultipliedAlpha = true;
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 8, 8), mat);
    mesh.frustumCulled = false;
    const scene = new T.Scene(), cam = new T.Camera();
    scene.add(mesh);

    let W = 1, H = 1;
    const layout = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      U.uSize.value.set(W, H); U.uEye.value.set(W / 2, H / 2);
      U.uScale.value = fit * (W <= 500 ? Math.min(0.7, (H - 40) / 530, (W - 40) / 430) : Math.min(1.6, (H - 36) / 530, (W * 0.6) / 470));
    };
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    layout();

    // Image — like the particle panel reads it, cropped to fill the grid ratio (cols:rows) and spread over the whole panel
    const texOf = new Map();
    const setImage = (src) => {
      if (!src) return;
      let t = texOf.get(src);
      if (!t) { t = src.tagName === "CANVAS" ? new T.CanvasTexture(src) : new T.Texture(src); t.flipY = false; t.colorSpace = T.NoColorSpace; t.minFilter = T.LinearFilter; t.generateMipmaps = false; texOf.set(src, t); }
      const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height;
      if (!sw || !sh) return;
      t.needsUpdate = true;
      const ia = sw / sh, ga = cols / rows;
      U.uCrop.value.set(ia > ga ? (1 - ga / ia) / 2 : 0, ia > ga ? 0 : (1 - ia / ga) / 2, ia > ga ? ga / ia : 1, ia > ga ? 1 : ia / ga);
      U.uMap.value = t;
    };
    let pending = null, current = null;
    const pick = (key) => {
      const src = shapes.find((s) => s.dataset.key === key);
      if (!src || key === current) return;
      current = key;
      if (window.gsap) gsap.to(motion, { tilt: +(src.dataset.tilt ?? tiltBase), duration: dur, ease: "power2.inOut", overwrite: "auto" });
      if (sim.alive() && U.uMap.value) pending = src; else { pending = null; whenReady(src); }
    };
    const whenReady = (src) => { if (src.tagName === "IMG" && !src.complete) src.addEventListener("load", () => setImage(src), { once: true }); else setImage(src); };

    // Same interaction as the particle plate — drag to rotate (.008/px · inertia 2.6/s), tilt up and down (.005/px, ±.5), on release it returns to its own tilt over .9s power2.out, wheel .0022/px
    const motion = { yaw: 0, tilt: tiltBase };
    let drag = false, lx = 0, ly = 0, lt = 0, vel = 0, baseTilt = tiltBase;
    let ptr = null, last = null, lastPx = null, enabled = !gate;
    const down = (e) => {
      if (e.button !== 0 || e.target.closest("a,button,input,[data-fx-part=pick]")) return;
      drag = true; lx = e.clientX; ly = e.clientY; lt = performance.now(); vel = 0; baseTilt = motion.tilt; ptr = null; last = null;
    };
    const move = (e) => {
      if (drag) {
        const now = performance.now(), dt = Math.min(0.1, Math.max(0.008, (now - lt) / 1000)), dx = e.clientX - lx, dy = e.clientY - ly;
        lt = now; lx = e.clientX; ly = e.clientY;
        motion.yaw += dx * 0.008;
        motion.tilt = Math.min(baseTilt + 0.5, Math.max(baseTilt - 0.5, motion.tilt + dy * 0.005));
        vel = vel * 0.7 + ((dx * 0.008) / dt) * 0.3;
        return;
      }
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const up = () => { if (!drag) return; drag = false; if (window.gsap) gsap.to(motion, { tilt: baseTilt, duration: 0.9, ease: "power2.out" }); else motion.tilt = baseTilt; };
    const leave = () => { ptr = null; last = null; lastPx = null; };
    const wheel = (e) => { if (e.target.closest("[data-fx-part=pick],a,button")) return; motion.yaw -= (e.deltaX + e.deltaY) * 0.0022; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("wheel", wheel, { passive: true });
    el.querySelectorAll('[data-fx-part="pick"]').forEach((p) => { const go = () => pick(p.dataset.key); p.addEventListener("pointerenter", go); p.addEventListener("focus", go); });
    el.addEventListener("fx:shape", (e) => pick(e.detail?.key));
    // The scroll-gathering panel (end strip) stamps handprints only once it is over 70% gathered, like the original
    el.addEventListener("fx:progress", (e) => { pick(e.detail?.key ?? shapes[0]?.dataset.key); if (gate) enabled = (+e.detail?.value || 0) > gate; });

    // Screen coordinates → position on the board (u, v, top is 0). Find where the gaze meets the board (z 10) by inverting the particle board projection
    const toPlane = (x, y) => {
      const s = U.uScale.value, cy = Math.cos(motion.yawNow || 0), sy = Math.sin(motion.yawNow || 0), cx = Math.cos(motion.tilt), sx = Math.sin(motion.tilt);
      const at = (z) => {
        const k = (DIST - z) / DIST, px = ((x - W / 2) * k) / s, py = (-(y - H / 2) * k) / s, pz = z / s;
        const ty = py * cx + pz * sx, tz = -py * sx + pz * cx;
        return [px * cy - tz * sy, ty, px * sy + tz * cy];
      };
      const a = at(0), b = at(1), dz = b[2] - a[2];
      if (Math.abs(dz) < 1e-6) return null;
      const t = (PZ - a[2]) / dz, lxp = a[0] + (b[0] - a[0]) * t, lyp = a[1] + (b[1] - a[1]) * t;
      return { u: lxp / PW + 0.5, v: 0.5 - lyp / PH };
    };

    let raf = 0, prev = 0, clock = 0, shown = false;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = prev ? Math.max(0.001, Math.min(0.1, (now - prev) / 1000)) : 1 / 60;
      prev = now; clock += dt;
      if (!drag && Math.abs(vel) > 0.02) { motion.yaw += vel * dt; vel *= Math.exp(-2.6 * dt); } else if (!drag) vel = 0;
      motion.yawNow = motion.yaw + (drag ? 0 : Math.sin(clock * 0.32) * swayAmp);
      U.uYaw.value = motion.yawNow; U.uTilt.value = motion.tilt;
      if (ptr && enabled && !pending && U.uMap.value) {
        const p = toPlane(ptr.x, ptr.y);
        if (p && p.u > -0.3 && p.u < 1.3 && p.v > -0.3 && p.v < 1.3) {
          const jump = !last || Math.hypot(p.u - last.u, p.v - last.v) > 1, moved = lastPx && Math.hypot(ptr.x - lastPx.x, ptr.y - lastPx.y) > 0.1;
          const du = jump || !moved ? 0 : (p.u - last.u) / dt, dv = jump || !moved ? 0 : (p.v - last.v) / dt;
          const wpx = (PW * U.uScale.value * DIST) / Math.max(1, DIST - PZ * U.uScale.value);
          sim.splat(p.u, p.v, du, dv, dt, brush(wpx, sim.cols));
          last = p;
        } else last = null;
        lastPx = { ...ptr };
      }
      const live = sim.step(dt, pending ? 4 : 0);
      if (pending && !sim.alive()) { sim.reset(); const src = pending; pending = null; whenReady(src); }
      if (live) maskTex.needsUpdate = true;
      if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) return;
      if (live || shown) { renderer.render(scene, cam); shown = live; }
    };

    // First compile happens when the world is built. Compiling the shader on the first cursor move would freeze the screen
    const first = opt.start && opt.start !== "none" ? opt.start : shapes[0]?.dataset.key;
    const firstSrc = shapes.find((s) => s.dataset.key === first) || shapes[0];
    current = firstSrc?.dataset.key ?? null;
    whenReady(firstSrc);
    renderer.compile(scene, cam);
    // Insert beneath the particle panel after it attaches (DOMContentLoaded), and run the sway clock only while visible on screen, like the particle panel —
    // IntersectionObserver is called twice in the same frame so both clocks run on the same rAF time, run it even when there are no touch traces so the drawing panels don’t drift apart
    const place = () => {
      const dash = el.querySelector(":scope > .fx-dash-field");
      if (dash) dash.before(canvas); else el.prepend(canvas);
      new IntersectionObserver((es) => { for (const e of es) { if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame); else if (!e.isIntersecting) { cancelAnimationFrame(raf); raf = 0; prev = 0; } } }).observe(el);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(place), { once: true });
    else requestAnimationFrame(place);
  };

  // Handprint over a DOM card — a same-size canvas sits over the card art (dither), and only where the handprint lands is the original undithered color drawn.
  // The original sphere card has a resting radius of 0 on the fine cursor, so hovering a card only opens the handprint spot. The grid is 128 cells on the long side, brush radius 54px
  const cards = (root, { selector, rawOf }) => {
    if (!ok()) return;
    const live = new Map();
    let raf = 0, prev = 0;
    const hold = (card) => {
      let s = live.get(card);
      if (s) return s;
      const img = card.querySelector("img"), raw = rawOf(img);
      if (!img || !raw) return null;
      const r = img.getBoundingClientRect(), n = Math.max(1, r.width, r.height);
      const sim = field(Math.max(24, Math.round((128 * r.width) / n)), Math.max(24, Math.round((128 * r.height) / n)));
      const cv = document.createElement("canvas");
      cv.className = "e-trail-card";
      cv.setAttribute("aria-hidden", "true");
      img.after(cv);
      const pic = new Image();
      pic.src = raw;
      const m = document.createElement("canvas");
      m.width = sim.cols; m.height = sim.rows;
      s = { card, img, sim, cv, pic, m, mg: m.getContext("2d"), g: cv.getContext("2d"), md: new ImageData(sim.cols, sim.rows), ptr: null, last: null };
      live.set(card, s);
      return s;
    };
    const drop = (s) => { s.cv.remove(); live.delete(s.card); };
    const paint = (s) => {
      const { cv, g, img, pic, sim, mg, md, m } = s, w = img.offsetWidth, h = img.offsetHeight, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      for (let i = 0; i < sim.mask.length; i++) { md.data[i * 4 + 3] = sim.mask[i]; }
      mg.putImageData(md, 0, 0);
      g.globalCompositeOperation = "copy";
      g.imageSmoothingEnabled = true;
      g.drawImage(m, 0, 0, cv.width, cv.height);
      g.globalCompositeOperation = "source-in";
      g.imageSmoothingEnabled = false;
      if (pic.complete) g.drawImage(pic, 0, 0, cv.width, cv.height);
    };
    const frame = (now) => {
      const dt = prev ? Math.max(0.001, Math.min(0.1, (now - prev) / 1000)) : 1 / 60;
      prev = now;
      for (const s of [...live.values()]) {
        if (s.ptr) {
          const r = s.img.getBoundingClientRect(), u = (s.ptr.x - r.left) / r.width, v = (s.ptr.y - r.top) / r.height;
          if (u > -0.3 && u < 1.3 && v > -0.3 && v < 1.3 && r.width > 1) {
            const moved = s.lastPx && Math.hypot(s.ptr.x - s.lastPx.x, s.ptr.y - s.lastPx.y) > 0.1;
            const du = s.last && moved ? (u - s.last.u) / dt : 0, dv = s.last && moved ? (v - s.last.v) / dt : 0;
            s.sim.splat(u, v, du, dv, dt, brush(r.width, s.sim.cols));
            s.last = { u, v };
          } else s.last = null;
          s.lastPx = { ...s.ptr };
        }
        if (s.sim.step(dt)) paint(s);
        else if (!s.ptr) drop(s);
      }
      raf = live.size ? requestAnimationFrame(frame) : 0;
      if (!raf) prev = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    root.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || e.buttons) return;
      const card = e.target.closest(selector);
      for (const s of live.values()) if (s.card !== card) { s.ptr = null; s.last = null; }
      if (!card || !root.contains(card)) return;
      const s = hold(card);
      if (!s) return;
      s.ptr = { x: e.clientX, y: e.clientY };
      kick();
    });
    root.addEventListener("pointerleave", () => { for (const s of live.values()) { s.ptr = null; s.last = null; } });
  };

  window.eddyTrail = { plane, cards };
})();
