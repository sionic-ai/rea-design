// A 3D particle plate built from tens of thousands of short horizontal strokes standing up from the image — the image is read as cols×rows cells, each cell gets an intensity from brightness, warmth and outline, and only cells passing a 4×4 Bayer threshold
// Lit with horizontal strokes of cell width .72 (protruding forward 10~52 by intensity). When switching to another picture, each stroke gets a delay (seed×.45) and runs 1.15s power2.inOut
// Curves sideways (18 to 60) as it flies and lands in its new spot. The panel tilts .12rad and sways with sin(.32t)×.2, spins when dragged (settling at 2.6/s on release) and the wheel spins it too.
// When the mouse moves past quickly, strokes within 120px around it get pushed away (speed 700px/s gives 63% of .8, rising at 18/s · falling at 5/s).
// Artwork is a child [data-fx-part=shape](img·canvas, data-key) — the [data-fx-part element the pointer is hovering over=Switch it with pick][data-key] or the fx:shape event (detail.key)
(() => {
  const BRAND = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const PLANE = { w: 380, h: 475, z: 10, depth: 42 };
  const STAGGER = 0.45;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const rand = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 4294967295);
  const fract = (x) => x - Math.floor(x);

  // Image → stroke list [x0,y0,z, x1,y1,z, strength]. The threshold for removing the background is alpha if there is transparency, otherwise the median of the top-edge colors
  const segmentsOf = (src, cols, rows) => {
    const c = document.createElement("canvas");
    c.width = cols; c.height = rows;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) return null;
    const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height;
    if (!sw || !sh) return null;
    const k = Math.max(cols / sw, rows / sh), dw = sw * k, dh = sh * k;
    g.drawImage(src, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
    const d = g.getImageData(0, 0, cols, rows).data;
    let alpha = false;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 255) { alpha = true; break; }
    const med = (ch) => {
      const v = [], ex = Math.round(cols * 0.15), ey = Math.round(rows * 0.12);
      for (let y = 0; y < ey; y++) for (let x = 0; x < ex; x++) for (const xx of [x, cols - 1 - x]) v.push(d[(y * cols + xx) * 4 + ch]);
      v.sort((a, b) => a - b);
      return (v[v.length >> 1] || 0) / 255;
    };
    const bg = alpha ? null : [med(0), med(1), med(2)];
    const dist = (r, gg, b, r2, g2, b2) => Math.sqrt(0.25 * (r - r2) ** 2 + 0.5 * (gg - g2) ** 2 + 0.25 * (b - b2) ** 2);
    const px = (i) => [d[i * 4] / 255, d[i * 4 + 1] / 255, d[i * 4 + 2] / 255];
    const out = new Float32Array(cols * rows * 7), len = (PLANE.w / (cols - 1)) * 0.72;
    for (let y = 0; y < rows; y++) {
      const wy = PLANE.h / 2 - (y / (rows - 1)) * PLANE.h;
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x, [r, gg, b] = px(i), lum = r * 0.299 + gg * 0.587 + b * 0.114;
        const fg = alpha ? 1 : sm(0.035, 0.2, dist(r, gg, b, ...bg));
        const nb = [x > 0 ? i - 1 : i, x + 1 < cols ? i + 1 : i, y > 0 ? i - cols : i, y + 1 < rows ? i + cols : i];
        const edge = sm(0.018, 0.11, Math.max(...nb.map((j) => dist(r, gg, b, ...px(j)))));
        const warm = sm(-0.01, 0.16, r - b), hi = sm(0.55, 0.82, lum) * sm(-0.05, 0.1, r - b);
        const T = Math.max(warm, hi, 0.55 * fg, 0.72 * edge);
        const E = (d[i * 4 + 3] / 255) * Math.min(1, Math.max(0, lum * (0.05 + 0.95 * T) + 0.1 * edge + 0.22 * fg));
        const wx = (x / (cols - 1)) * PLANE.w - PLANE.w / 2, o = i * 7;
        if (E <= (BRAND[(y % 4) * 4 + (x % 4)] + 0.5) / 16) { out.set([wx, wy, PLANE.z, wx, wy, PLANE.z, 0], o); continue; }
        const z = PLANE.z + Math.min(1, Math.max(0, 0.62 * E + 0.23 * fg + 0.15 * edge)) * PLANE.depth;
        out.set([wx - len / 2, wy, z, wx + len / 2, wy, z, 0.2 + E * 0.8], o);
      }
    }
    return out;
  };

  const VERT = `
uniform vec2 uSize;uniform vec2 uEye;uniform float uDist;uniform vec3 uCenter;uniform float uScale;uniform float uYaw;uniform float uTilt;
uniform float uMix;uniform float uWidth;uniform float uTravel;uniform vec2 uPointer;uniform float uPush;uniform float uSpread;
attribute vec3 aStartA;attribute vec3 aEndA;attribute vec3 aStartB;attribute vec3 aEndB;attribute vec3 aTravel;attribute float aSeed;attribute vec2 aTone;
varying float vAcross;varying float vTone;varying float vRelief;varying float vLive;
void main(){
  float t=clamp(uMix*(1.0+${STAGGER.toFixed(2)})-aSeed*${STAGGER.toFixed(2)},0.0,1.0);t=t*t*(3.0-2.0*t);
  vec3 la=mix(aStartA,aStartB,t);vec3 lb=mix(aEndA,aEndB,t);
  vTone=mix(aTone.x,aTone.y,t);
  vRelief=clamp((lb.z-${PLANE.z.toFixed(1)})/${PLANE.depth.toFixed(1)},0.0,1.0);
  vLive=step(0.42,length(lb-la)*uScale);
  vec3 off=aTravel*sin(3.14159265*t)*uTravel;la+=off;lb+=off;
  float puff=1.0+uSpread*(0.08+0.24*fract(aSeed*7.13));la*=puff;lb*=puff;
  float cy=cos(uYaw),sy=sin(uYaw);
  la=vec3(la.x*cy+la.z*sy,la.y,-la.x*sy+la.z*cy);lb=vec3(lb.x*cy+lb.z*sy,lb.y,-lb.x*sy+lb.z*cy);
  float cx=cos(uTilt),sx=sin(uTilt);
  la=vec3(la.x,la.y*cx-la.z*sx,la.y*sx+la.z*cx);lb=vec3(lb.x,lb.y*cx-lb.z*sx,lb.y*sx+lb.z*cx);
  la=la*uScale+uCenter;lb=lb*uScale+uCenter;
  float wa=max((uDist-la.z)/uDist,0.05),wb=max((uDist-lb.z)/uDist,0.05);
  vec2 pa=uEye+vec2(la.x,-la.y)/wa,pb=uEye+vec2(lb.x,-lb.y)/wb;
  vec2 away=(pa+pb)*0.5-uPointer;float ad=length(away);float fall=1.0-smoothstep(0.0,120.0,ad);fall*=fall;
  vec2 shove=away/max(ad,28.0)*fall*uPush*(8.0+aSeed*14.0);pa+=shove;pb+=shove;
  vec2 dd=pb-pa;float len=length(dd);vec2 dir=len>1e-4?dd/len:vec2(1.0,0.0);vec2 nrm=vec2(-dir.y,dir.x);
  float hw=uWidth+1.0;
  vec2 p=mix(pa,pb,position.x)+dir*(position.x*2.0-1.0)+nrm*(position.y*hw);
  vAcross=position.y*hw;
  vec2 s=p/uSize;gl_Position=vec4(s.x*2.0-1.0,1.0-s.y*2.0,0.0,1.0);
}`;
  const FRAG = `
uniform float uWidth;uniform float uAlpha;uniform vec3 uR0;uniform vec3 uR1;uniform vec3 uR2;uniform vec3 uR3;uniform vec3 uR4;
varying float vAcross;varying float vTone;varying float vRelief;varying float vLive;
vec3 ramp(float t){t=clamp(t,0.0,1.0)*4.0;vec3 c=mix(uR0,uR1,clamp(t,0.0,1.0));c=mix(c,uR2,clamp(t-1.0,0.0,1.0));c=mix(c,uR3,clamp(t-2.0,0.0,1.0));return mix(c,uR4,clamp(t-3.0,0.0,1.0));}
void main(){
  float cov=clamp(uWidth-abs(vAcross)+0.5,0.0,1.0);
  float a=cov*vLive*uAlpha;if(a<=0.004)discard;
  float deep=clamp(vRelief*0.72+vTone*0.28,0.0,1.0);
  gl_FragColor=vec4(ramp(0.06+0.94*deep),a);
}`;

  const color = (v) => {
    const g = document.createElement("canvas").getContext("2d");
    g.fillStyle = v; g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("dash-field-morph", (el, { options, reduce, hover }) => {
    const T = window.THREE, shapes = [...el.querySelectorAll('[data-fx-part="shape"]')];
    if (!T || !shapes.length) return;
    const cols = Math.max(16, +(options.cols || 280)), rows = Math.max(16, +(options.rows || 350)), N = cols * rows;
    const dur = +(options.dur ?? 1.15), tiltBase = +(options.tilt ?? 0.12), swayAmp = +(options.sway ?? 0.2);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: false }); } catch { return; }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const canvas = renderer.domElement;
    canvas.className = "fx-dash-field";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);

    // Initial layout — points scattered in a sphere shell of radius 235~365 (vertical .8). They gather into the first picture as they come in
    const geo = new T.InstancedBufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0], 3));
    geo.setIndex([0, 1, 2, 2, 1, 3]);
    geo.instanceCount = N;
    const A0 = new Float32Array(N * 3), A1 = new Float32Array(N * 3), B0 = new Float32Array(N * 3), B1 = new Float32Array(N * 3);
    const tone = new Float32Array(N * 2), seed = new Float32Array(N), trav = new Float32Array(N * 3);
    const rs = rand(23), rc = rand(7);
    for (let i = 0; i < N; i++) {
      seed[i] = rs();
      const th = rc() * Math.PI * 2, ph = Math.acos(rc() * 2 - 1), r = 235 + rc() * 130;
      const p = [Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.8, Math.sin(ph) * Math.sin(th) * r];
      A0.set(p, i * 3); A1.set(p, i * 3); B0.set(p, i * 3); B1.set(p, i * 3);
    }
    const attr = (arr, n) => { const a = new T.InstancedBufferAttribute(arr, n); a.setUsage(T.DynamicDrawUsage); return a; };
    const at = { a0: attr(A0, 3), a1: attr(A1, 3), b0: attr(B0, 3), b1: attr(B1, 3), tone: attr(tone, 2), trav: attr(trav, 3) };
    geo.setAttribute("aStartA", at.a0); geo.setAttribute("aEndA", at.a1); geo.setAttribute("aStartB", at.b0); geo.setAttribute("aEndB", at.b1);
    geo.setAttribute("aTone", at.tone); geo.setAttribute("aTravel", at.trav); geo.setAttribute("aSeed", new T.InstancedBufferAttribute(seed, 1));
    const U = {
      uSize: { value: new T.Vector2(1, 1) }, uEye: { value: new T.Vector2() }, uDist: { value: 2400 }, uCenter: { value: new T.Vector3() },
      uScale: { value: 1 }, uYaw: { value: 0 }, uTilt: { value: tiltBase }, uMix: { value: 1 }, uWidth: { value: 0.72 }, uTravel: { value: reduce ? 0 : 1 },
      uPointer: { value: new T.Vector2(-1e5, -1e5) }, uPush: { value: 0 }, uSpread: { value: 0 }, uAlpha: { value: 1 },
      uR0: { value: new T.Vector3() }, uR1: { value: new T.Vector3() }, uR2: { value: new T.Vector3() }, uR3: { value: new T.Vector3() }, uR4: { value: new T.Vector3() },
    };
    const mat = new T.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false, side: T.DoubleSide });
    const mesh = new T.Mesh(geo, mat);
    mesh.frustumCulled = false;
    const scene = new T.Scene(), cam = new T.Camera();
    scene.add(mesh);

    // Five-rung ladder — background → (between background and accent) → accent → (between accent and text) → text. Each rung can be overridden with --fx-ramp-0~4
    const paint = () => {
      const s = getComputedStyle(el), v = (n) => s.getPropertyValue(n).trim();
      const bg = color(v("--kf-bg") || "Canvas"), ac = color(v("--kf-accent") || "Highlight"), ink = color(v("--kf-ink") || "CanvasText");
      const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
      const pickC = (n, fb) => (v(n) ? color(v(n)) : fb);
      U.uR0.value.fromArray(pickC("--fx-ramp-0", bg));
      U.uR1.value.fromArray(pickC("--fx-ramp-1", mix(bg, ac, 0.55)));
      U.uR2.value.fromArray(pickC("--fx-ramp-2", ac));
      U.uR3.value.fromArray(pickC("--fx-ramp-3", mix(ac, ink, 0.5)));
      U.uR4.value.fromArray(pickC("--fx-ramp-4", ink));
      dirty = true;
    };

    let dirty = true, W = 1, H = 1;
    const layout = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      U.uSize.value.set(W, H);
      U.uEye.value.set(W / 2, H / 2);
      const fit = +(options.fit || 1);
      U.uScale.value = fit * (W <= 500 ? Math.min(0.7, (H - 40) / 530, (W - 40) / 430) : Math.min(1.6, (H - 36) / 530, (W * 0.6) / 470));
      dirty = true;
    };
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    layout(); paint();

    // Swap — freezes the currently visible position (including the mid position with delay) as the starting point, and mixes in the lit strokes of the new picture to hand out
    const cache = new Map();
    let mixTween = null, seq = 0, current = null;
    const morph = (key, tween = true) => {
      const src = shapes.find((s) => s.dataset.key === key) || (key == null ? shapes[0] : null);
      if (!src || key === current) return;
      let segs = cache.get(src);
      if (!segs) { segs = segmentsOf(src, cols, rows); if (!segs) return; cache.set(src, segs); }
      current = src.dataset.key ?? null;
      seq++;
      const m = U.uMix.value, rr = rand((2654435769 ^ Math.imul(seq, 2246822507)) >>> 0);
      for (let i = 0; i < N; i++) {
        let t = Math.min(1, Math.max(0, m * (1 + STAGGER) - seed[i] * STAGGER)); t = t * t * (3 - 2 * t);
        for (let k = 0; k < 3; k++) { const j = i * 3 + k; A0[j] += (B0[j] - A0[j]) * t; A1[j] += (B1[j] - A1[j]) * t; }
        tone[i * 2] += (tone[i * 2 + 1] - tone[i * 2]) * t;
      }
      const live = [], dead = [];
      for (let i = 0; i < N; i++) (segs[i * 7 + 6] > 0 ? live : dead).push(i);
      for (const list of [live, dead]) for (let n = list.length - 1; n > 0; n--) { const j = Math.floor(rr() * (n + 1)); [list[n], list[j]] = [list[j], list[n]]; }
      const order = live.concat(dead);
      for (let i = 0; i < N; i++) {
        const o = order[i] * 7, j = i * 3;
        B0[j] = segs[o]; B0[j + 1] = segs[o + 1]; B0[j + 2] = segs[o + 2];
        B1[j] = segs[o + 3]; B1[j + 1] = segs[o + 4]; B1[j + 2] = segs[o + 5];
        tone[i * 2 + 1] = segs[o + 6];
        const fx = (A0[j] + A1[j]) / 2, fy = (A0[j + 1] + A1[j + 1]) / 2, tx = (B0[j] + B1[j]) / 2, ty = (B0[j + 1] + B1[j + 1]) / 2;
        const dx = tx - fx, dy = ty - fy, dl = Math.hypot(dx, dy);
        const g = fract(seed[i] * 97.31 + seq * 0.618), c = fract(seed[i] * 43.17 + seq * 0.382), w = fract(seed[i] * 71.93 + seq * 0.755);
        let nx, ny;
        if (dl > 0.001) { nx = -dy / dl; ny = dx / dl; } else { nx = Math.cos(g * 6.283); ny = Math.sin(g * 6.283); }
        const bend = (g < 0.5 ? -1 : 1) * (18 + Math.min(42, dl * 0.16) + c * 12);
        trav[j] = nx * bend; trav[j + 1] = ny * bend; trav[j + 2] = (w < 0.5 ? -1 : 1) * (46 + fract(w * 11.37) * 44);
      }
      for (const a of Object.values(at)) a.needsUpdate = true;
      mixTween?.kill();
      U.uMix.value = 0;
      if (!tween) { dirty = true; return; }
      if (reduce || !window.gsap) { U.uMix.value = 1; dirty = true; return; }
      mixTween = gsap.to(U.uMix, { value: 1, duration: dur, ease, onUpdate: () => (dirty = true) });
      gsap.to(motion, { tilt: +(src.dataset.tilt ?? tiltBase), duration: dur, ease: "power2.inOut" });
    };

    // Interaction — drag to rotate (inertia 2.6/s), wheel, mouse push
    const motion = { yaw: 0, tilt: tiltBase, swayGain: 1 };
    let drag = false, lx = 0, ly = 0, lt = 0, vel = 0, baseTilt = tiltBase, lastYaw = 0, spread = 0;
    let pdist = 0, pspeed = 0, push = 0, px = null, py = null;
    const down = (e) => {
      if (e.button !== 0 || e.target.closest("a,button,input,[data-fx-part=pick]")) return;
      drag = true; lx = e.clientX; ly = e.clientY; lt = performance.now(); vel = 0; baseTilt = motion.tilt; push = 0;
      el.setPointerCapture?.(e.pointerId); el.classList.add("is-fx-grabbing");
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      if (drag) {
        const now = performance.now(), dt = Math.min(0.1, Math.max(0.008, (now - lt) / 1000)), dx = e.clientX - lx, dy = e.clientY - ly;
        lt = now; lx = e.clientX; ly = e.clientY;
        motion.yaw += dx * 0.008;
        motion.tilt = Math.min(baseTilt + 0.5, Math.max(baseTilt - 0.5, motion.tilt + dy * 0.005));
        vel = vel * 0.7 + ((dx * 0.008) / dt) * 0.3;
        dirty = true;
        return;
      }
      if (!hover || e.pointerType === "touch") return;
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (px !== null) pdist = Math.min(240, pdist + Math.hypot(x - px, y - py));
      px = x; py = y;
      U.uPointer.value.set(x, y);
      dirty = true;
    };
    const up = () => { if (!drag) return; drag = false; el.classList.remove("is-fx-grabbing"); if (window.gsap && !reduce) gsap.to(motion, { tilt: baseTilt, duration: 0.9, ease: "power2.out" }); else motion.tilt = baseTilt; };
    const leave = () => { px = py = null; pdist = 0; pspeed = 0; };
    const wheel = (e) => { if (e.target.closest("[data-fx-part=pick],a,button")) return; e.preventDefault(); motion.yaw -= (e.deltaX + e.deltaY) * 0.0022; dirty = true; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("wheel", wheel, { passive: false });
    const picks = [...el.querySelectorAll('[data-fx-part="pick"]')];
    const pick = (e) => morph(e.currentTarget.dataset.key);
    picks.forEach((p) => { p.addEventListener("pointerenter", pick); p.addEventListener("focus", pick); });
    const onShape = (e) => morph(e.detail?.key);
    el.addEventListener("fx:shape", onShape);
    // Gather on scroll — when the caller passes progress (0~1), the artwork gathers by that amount (delay and bend are the same)
    const onProgress = (e) => {
      const key = e.detail?.key ?? shapes[0].dataset.key;
      if (key !== current) morph(key, false);
      U.uMix.value = reduce ? 1 : Math.max(0, Math.min(1, +e.detail?.value || 0));
      dirty = true;
    };
    el.addEventListener("fx:progress", onProgress);

    let raf = 0, prev = 0, clock = 0, alive = true;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = prev ? Math.max(0.001, Math.min(0.1, (now - prev) / 1000)) : 1 / 60;
      prev = now; clock += dt;
      if (!drag && !reduce && Math.abs(vel) > 0.02) { motion.yaw += vel * dt; vel *= Math.exp(-2.6 * dt); dirty = true; } else if (!drag) vel = 0;
      // Mouse drag — the original pointerResponse speed filtering as is
      const sp = pdist / dt, o = -Math.expm1(-10 * dt), mid = sp - ((sp - pspeed) * o) / (10 * dt);
      pspeed = Math.min(3500, pspeed + (sp - pspeed) * o);
      if (pdist === 0 && pspeed < 0.01) pspeed = 0;
      const target = 0.8 * -Math.expm1(-Math.min(3500, Math.max(0, mid)) / 700);
      push += (target - push) * -Math.expm1(-(target > push ? 18 : 5) * dt);
      if (push < 0.001 && pspeed === 0) push = 0;
      pdist = 0;
      if (Math.abs(U.uPush.value - push) > 1e-4) { U.uPush.value = push; dirty = true; }
      const sway = reduce ? 0 : Math.sin(clock * 0.32) * swayAmp * motion.swayGain;
      const yaw = motion.yaw + (drag ? 0 : sway), dy = Math.abs(yaw - lastYaw) > 3 ? 0 : yaw - lastYaw;
      lastYaw = yaw;
      const want = reduce ? 0 : Math.min(1, Math.abs(dy / dt) / 6);
      spread += (want - spread) * Math.min(1, (want > spread ? 12 : 3) * dt);
      U.uSpread.value = spread;
      U.uYaw.value = yaw; U.uTilt.value = motion.tilt;
      // While hidden beneath a cover (boot screen etc.), don’t draw — drawing tens of thousands of strokes every frame slows the response on the screen above
      if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) return;
      if (!reduce || dirty) { renderer.render(scene, cam); dirty = false; }
    };
    const io = new IntersectionObserver((es) => { for (const e of es) { if (e.isIntersecting && !raf && alive) raf = requestAnimationFrame(frame); else if (!e.isIntersecting) { cancelAnimationFrame(raf); raf = 0; prev = 0; } } });
    io.observe(el);
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style", "class"] });

    const first = options.start || shapes[0].dataset.key;
    const begin = () => { if (!alive) return; const s = shapes.find((x) => x.dataset.key === first) || shapes[0]; if (s.tagName === "IMG" && !s.complete) s.addEventListener("load", () => morph(first), { once: true }); else morph(first); };
    const delay = +(options.delay ?? 0);
    let startT = 0;
    if (first === "none") { /* Gathered only by scroll progress (fx:progress) */ }
    else if (options.wait) document.addEventListener(options.wait, begin, { once: true });
    else startT = setTimeout(begin, delay * 1000);

    return () => {
      alive = false;
      cancelAnimationFrame(raf); clearTimeout(startT); io.disconnect(); ro.disconnect(); mo.disconnect(); mixTween?.kill();
      if (options.wait) document.removeEventListener(options.wait, begin);
      window.gsap?.killTweensOf(motion);
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up); el.removeEventListener("pointerleave", leave); el.removeEventListener("wheel", wheel); el.removeEventListener("fx:shape", onShape); el.removeEventListener("fx:progress", onProgress);
      picks.forEach((p) => { p.removeEventListener("pointerenter", pick); p.removeEventListener("focus", pick); });
      geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); canvas.remove();
      el.classList.remove("is-fx-grabbing");
    };
  });
})();
