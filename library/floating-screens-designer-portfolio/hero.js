// Hero card strip — the original draws cards as a curved band on one WebGL canvas (three r186). We rewrote our shader with the same values.
// Original settings: card 290.5u · 4:3 · gap 104u · corner 4u · strip tilt .21 · bend -.05π/canvas width · perspective 730px ·
// Center 1.75x (spread 1.05 cell · push .57) · toward both sides the vertical axis tilts ±1° (tanh 6x) ·
// 111u/s to the left, when a card reaches the center it stays for .62×.9 · drag inertia .85/frame · while dragging .57x (.18/frame) ·
// Cards far from the grabbed spot follow up to .24×.3s later · when flowing fast, blur sideways at the strip ends (64%→104%) ·
// Entrance: after the loader at .2+.45s, scales 0→1 over 1.9s power3.out, flowing an additional 2220u/s meanwhile ·
// On press, opens in .8s power3.inOut to 80% of the screen, shaking by a vertical-axis 42.5°×sin(πt), with perspective 730→1140 ·
// While opening and closing, the photo bends like paper by -20° (peak .45 · lag .5 · rebound .3 · shade .2) · on close it swaps with the card at the .2 point.
(() => {
const stage = document.querySelector("[data-hero-stage]");
const canvas = stage?.querySelector(".hero__canvas");
const box = document.querySelector(".hero__lightbox");
const open = box?.querySelector(".hero__open");
const sheetCanvas = box?.querySelector(".hero__sheet");
const items = [...(stage?.querySelectorAll(".hero__items li") || [])].map((li) => ({ label: li.dataset.label, tone: li.className }));

const C = {
  size: 290.5, aspect: 4 / 3, gap: 104, radius: 4, slope: 0.21, curve: -0.05, persp: 730,
  focus: { scale: 1.75, spread: 1.05, push: 0.57 }, turn: 1,
  motion: { speed: 111, dwell: 0.62 }, drag: { inertia: 0.85, scale: 0.57, scaleEase: 0.18, delay: 0.24 },
  blur: { amount: 0.5, from: 0.64, ramp: 0.4 },
  arrive: { at: 0.2 + 0.45, speed: 2220, dur: 1.9 },
  open: { dur: 0.8, size: 0.8, swing: 42.5, persp: 1140, handoff: 0.2, bend: { amount: -20, peak: 0.45, lag: 0.5, settle: 0.3, shading: 0.2 } },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// Error function approximation — the amount the center card pushes neighbors away as it grows follows the normal distribution area
const erf = (x) => { const t = x * x, a = 0.147; return Math.sign(x) * Math.sqrt(1 - Math.exp((-t * (4 / Math.PI + a * t)) / (1 + a * t))); };
const css = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();

// Photo slot art — tone background + diagonal + a label saying what photo it is (when a photo is added it takes the same spot)
const placeholder = (item, w = 640) => {
  const probe = document.createElement("span");
  probe.className = item.tone;
  stage.appendChild(probe);
  const fill = css("--wf-fill", probe), line = css("--wf-line", probe), ink = css("--wf-fill-ink", probe);
  probe.remove();
  const h = Math.round(w / C.aspect), cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const x = cv.getContext("2d");
  x.fillStyle = fill; x.fillRect(0, 0, w, h);
  x.strokeStyle = line; x.lineWidth = 2;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
  x.fillStyle = fill; x.fillRect(w * 0.08, h / 2 - 22, w * 0.84, 44);
  x.fillStyle = ink; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = `600 ${Math.round(w / 34)}px ${css("--kf-font-sans")}`;
  x.fillText(item.label, w / 2, h / 2, w * 0.82);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return { tex: t, url: cv.toDataURL("image/jpeg", 0.85) };
};

const VERT = /* glsl */ `
uniform vec2 uSize;
uniform float uScale, uAlong, uTurn, uBend, uSlope;
varying vec2 vUv;
varying float vAlong;
void main() {
  vUv = uv;
  vec2 q = position.xy * uSize * uScale;
  // After rotating on the vertical axis, move to the position on the band — the band is an arc (bend uBend) and drops by uSlope toward the right
  vec3 p = vec3(cos(uTurn) * q.x, q.y, -sin(uTurn) * q.x);
  float s = uAlong + p.x;
  vAlong = s;
  vec3 w = vec3(s, p.y - uAlong * uSlope, 0.0);
  if (abs(uBend) > 1e-7) w.xz = vec2(sin(s * uBend), 1.0 - cos(s * uBend)) / uBend;
  w.z += p.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(w, 1.0);
}`;
const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uSize;
uniform float uScale, uRadius, uBlur, uHalf, uFrom, uRamp, uAlpha;
varying vec2 vUv;
varying float vAlong;
void main() {
  vec2 half_ = uSize * uScale * 0.5;
  vec2 d = abs((vUv - 0.5) * uSize * uScale) - half_ + uRadius * uScale;
  float sdf = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - uRadius * uScale;
  float edge = clamp(0.5 - sdf / max(fwidth(sdf), 1e-4), 0.0, 1.0);
  // Center is sharp and blurs sideways toward the band ends — every pixel must read the same number of samples so no seam line appears at the edge
  float side = smoothstep(uFrom, uFrom + max(uRamp, 0.001), abs(vAlong) / max(uHalf, 1.0));
  float spread = uBlur * side;
  vec3 c = vec3(0.0);
  for (int i = 0; i < 9; i++) c += texture2D(uMap, vUv + vec2((float(i) / 8.0 - 0.5) * spread, 0.0)).rgb;
  gl_FragColor = vec4(c / 9.0, edge * uAlpha);
  #include <colorspace_fragment>
}`;

const start = () => {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true }); } catch { return; }
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const fine = matchMedia("(pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera();
  const geo = new THREE.PlaneGeometry(1, 1, 48, 8);
  const pics = items.map((it) => placeholder(it));
  let cards = [];
  const build = (n) => {
    if (n === cards.length) return;
    cards.forEach((c) => { scene.remove(c.mesh); c.mesh.material.dispose(); });
    cards = Array.from({ length: n }, (_, i) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false,
        uniforms: {
          uMap: { value: pics[i % pics.length].tex }, uSize: { value: new THREE.Vector2() }, uScale: { value: 1 }, uAlong: { value: 0 },
          uTurn: { value: 0 }, uBend: { value: 0 }, uSlope: { value: C.slope }, uRadius: { value: 0 }, uBlur: { value: 0 },
          uHalf: { value: 1 }, uFrom: { value: C.blur.from }, uRamp: { value: C.blur.ramp }, uAlpha: { value: 1 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      return { mesh, item: i % pics.length, lag: null, box: null, turn: 0 };
    });
  };

  const st = { offset: 0, vel: 0, dragScale: 1, grabX: 0, arrive: reduce ? 1 : 0, last: performance.now(), size: "", W: 1, H: 1, live: true };
  let drag = null, opened = null;
  const arrival = { p: st.arrive };
  if (!reduce) (window.IM?.ready || Promise.resolve()).then(() => gsap.to(arrival, { p: 1, duration: C.arrive.dur, ease: "power3.out", delay: C.arrive.at }));

  const frame = () => {
    const now = performance.now(), dt = Math.min(0.05, (now - st.last) / 1000);
    st.last = now;
    if (!st.live) return;
    const r = canvas.getBoundingClientRect();
    if (`${r.width}x${r.height}` !== st.size) { st.size = `${r.width}x${r.height}`; st.W = r.width; st.H = r.height; renderer.setSize(st.W, st.H, false); }
    const { W, H } = st, k = (stage.clientHeight || 408) / 408;
    const cw = C.size * k, ch = cw / C.aspect, step = Math.max(1, (C.size + C.gap) * k), spread = Math.max(0.05, C.focus.spread) * step;
    const push = (e) => e + C.focus.push * (C.focus.scale - 1) * spread * (Math.sqrt(Math.PI) / 2) * erf(e / spread);
    const need = W + step * 6 + Math.abs(C.focus.scale - 1) * spread * 2;
    build(pics.length * Math.max(1, Math.ceil(need / (pics.length * step))));
    const loop = cards.length * step, wrap = (e) => ((((e + loop / 2) % loop) + loop) % loop) - loop / 2;
    let near = Infinity;
    for (let i = 0; i < cards.length; i++) near = Math.min(near, Math.abs(wrap(i * step - st.offset)));
    const target = reduce ? 0 : C.motion.speed * k * (1 - C.motion.dwell * 0.9 * Math.exp(-((near / (step * 0.35)) ** 2)));
    if (!drag) { st.vel = target + (st.vel - target) * C.drag.inertia ** (dt * 60); st.offset += st.vel * dt; }
    st.dragScale += ((drag ? C.drag.scale : 1) - st.dragScale) * (1 - (1 - C.drag.scaleEase) ** (dt * 60));
    if (arrival.p < 1 && !drag) st.offset += C.arrive.speed * k * (1 - arrival.p) * dt;
    cam.fov = (2 * Math.atan(H / 2 / C.persp) * 180) / Math.PI;
    cam.aspect = W / Math.max(1, H); cam.near = C.persp / 20; cam.far = C.persp * 20;
    cam.position.set(0, 0, C.persp); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    const bend = (C.curve * Math.PI) / Math.max(1, W), half = W / 2;
    const blur = fine ? clamp((Math.abs(st.vel) * 0.04 * C.blur.amount) / Math.max(1, cw), 0, 0.3) : 0;
    if (opened) tickOpen(dt);
    cards.forEach((c, i) => {
      const s0 = wrap(i * step - st.offset);
      if (c.lag === null) c.lag = st.offset;
      const t = C.drag.delay * 0.3 * Math.min(1, Math.abs(s0 - st.grabX) / half);
      c.lag += (st.offset - c.lag) * (t < 0.001 ? 1 : 1 - Math.exp(-dt / t));
      const m = wrap(i * step - c.lag), along = push(m), g = Math.exp(-((m / spread) ** 2));
      const scale = Math.max(1e-4, (1 + (C.focus.scale - 1) * g) * st.dragScale * arrival.p);
      const turn = C.turn * Math.tanh(clamp(along / half, -1.5, 1.5) * 6);
      const u = c.mesh.material.uniforms;
      u.uAlong.value = along; u.uSize.value.set(cw, ch); u.uScale.value = scale; u.uTurn.value = (turn * Math.PI) / 180;
      u.uBend.value = bend; u.uRadius.value = C.radius * k; u.uBlur.value = blur; u.uHalf.value = half;
      u.uAlpha.value = opened?.card === c && opened.ready ? (opened.closing ? hand(opened.p).card : 0) : 1;
      c.mesh.renderOrder = Math.round(g * 100);
      // Box on screen — finds the pressed card and gives the start position on open
      const th = along * bend, x = Math.abs(bend) < 1e-7 ? along : Math.sin(th) / bend, z = Math.abs(bend) < 1e-7 ? 0 : (1 - Math.cos(th)) / bend;
      const per = C.persp / Math.max(1, C.persp - z), bw = cw * scale * per, bh = ch * scale * per;
      const cx = r.left + half + x * per, cy = r.top + H / 2 + along * C.slope * per;
      c.box = new DOMRect(cx - bw / 2, cy - bh / 2, bw, bh);
      c.turn = turn - (th * 180) / Math.PI;
    });
    renderer.render(scene, cam);
  };

  // ── Drag ──
  canvas.addEventListener("pointerdown", (e) => {
    if (opened || e.button !== 0) return;
    drag = { last: e.clientX, time: performance.now(), moved: 0 };
    const r = canvas.getBoundingClientRect();
    st.grabX = e.clientX - (r.left + r.width / 2);
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const now = performance.now(), dx = e.clientX - drag.last;
    st.offset -= dx;
    st.vel = st.vel * 0.6 + (-dx / (Math.max(1, now - drag.time) / 1000)) * 0.4;
    drag.moved += Math.abs(dx); drag.last = e.clientX; drag.time = now;
  });
  const up = (e) => {
    if (!drag) return;
    const tap = drag.moved < 6;
    if (performance.now() - drag.time > 80) st.vel = 0;
    drag = null;
    if (!tap) return;
    st.vel = 0;
    const hit = cards.filter((c) => c.box && e.clientX >= c.box.left && e.clientX <= c.box.right && e.clientY >= c.box.top && e.clientY <= c.box.bottom)
      .sort((a, b) => b.mesh.renderOrder - a.mesh.renderOrder)[0];
    if (hit) show(hit);
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  // ── Expand Open ──
  const hand = (p) => { const n = clamp(p / Math.max(0.001, C.open.handoff), 0, 1); return { card: clamp((1 - n) * 2, 0, 1), image: clamp(n * 2, 0, 1) }; };
  const ease = gsap.parseEase("power3.inOut");
  const img = open.querySelector("img");
  const sheet = paperSheet(sheetCanvas);
  const show = (card) => {
    img.src = pics[card.item].url;
    img.alt = items[card.item].label;
    opened = { card, p: 0, closing: false, ready: true };
    box.hidden = false;
    window.IM?.lenis?.stop();
    sheet?.setImage(pics[card.item].tex);
    tickOpen(0);
  };
  const close = () => { if (opened?.ready && !opened.closing) opened.closing = true; };
  // Paper bend: largest at the peak, and bounces back once in the last 35%
  const bendAt = (p) => {
    const b = C.open.bend, n = clamp(b.peak, 0.05, 0.95), i = clamp((p - 0.65) / 0.35, 0, 1);
    return Math.sin(Math.PI * p ** (Math.log(0.5) / Math.log(n))) - b.settle * Math.sin(2 * Math.PI * i) * (1 - i);
  };
  const tickOpen = (dt) => {
    const o = opened;
    o.p = clamp(o.p + (o.closing ? -dt : dt) / C.open.dur, 0, 1);
    const from = o.card.box;
    if (!from) return;
    const a = C.aspect, w = Math.min(innerWidth * C.open.size, innerHeight * C.open.size * a), h = w / a, s = ease(o.p);
    const lerp = (x, y) => x + (y - x) * s;
    const L = lerp(from.left, (innerWidth - w) / 2), T = lerp(from.top, (innerHeight - h) / 2), Wd = lerp(from.width, w), Hd = lerp(from.height, h);
    const swing = C.open.swing * Math.sin(Math.PI * s), ry = lerp(o.card.turn, 0) + swing, lens = lerp(C.persp, C.open.persp);
    Object.assign(open.style, { left: `${L}px`, top: `${T}px`, width: `${Wd}px`, height: `${Hd}px`, transform: `perspective(${lens}px) rotateY(${ry}deg)` });
    const alpha = o.closing ? hand(o.p).image : 1;
    open.style.opacity = String(alpha);
    if (sheet && (o.closing || o.p < 1)) {
      sheet.draw({ left: L, top: T, width: Wd, height: Hd, ry, lens, bend: C.open.bend.amount * bendAt(o.p), lag: C.open.bend.lag * (Math.sign(C.open.swing) || 1), shading: C.open.bend.shading, alpha, radius: C.radius });
      open.style.visibility = "hidden";
    } else { sheet?.hide(); open.style.visibility = ""; }
    box.style.setProperty("--shown", String(s));
    if (o.closing && o.p === 0) { sheet?.hide(); open.style.visibility = ""; box.hidden = true; opened = null; window.IM?.lenis?.start(); }
  };
  box.addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && close());
  addEventListener("wheel", close, { passive: true });

  new IntersectionObserver(([e]) => { st.live = !!e?.isIntersecting || !!opened; st.last = performance.now(); }).observe(stage);
  stage.toggleAttribute("data-live", true);
  gsap.ticker.add(frame);
};

// Photo in flight: bends like paper along the vertical axis, shadowed by the amount of bend. Normal once opened <img> passes to
function paperSheet(cv) {
  if (!cv) return null;
  let r;
  try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, premultipliedAlpha: true }); } catch { return null; }
  r.setClearColor(0, 0);
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera();
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, side: THREE.DoubleSide,
    uniforms: { uMap: { value: null }, uSize: { value: new THREE.Vector2(1, 1) }, uBend: { value: 0 }, uLag: { value: 0 }, uShade: { value: 0 }, uAlpha: { value: 1 }, uRadius: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform vec2 uSize; uniform float uBend, uLag;
      varying vec2 vUv; varying float vShade;
      void main() {
        vUv = uv;
        // The bend angle accumulates at each horizontal position — one end follows late by the lag amount, so the paper curls to one side instead of bending into an S
        float u = position.x;
        float k = uBend * (1.0 + uLag * u);
        float a = k * u;
        vec3 p = abs(k) < 1e-5 ? vec3(u * uSize.x, position.y * uSize.y, 0.0)
          : vec3(sin(a) / k * uSize.x, position.y * uSize.y, (1.0 - cos(a)) / k * uSize.x);
        vShade = 1.0 - cos(a);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap; uniform vec2 uSize; uniform float uShade, uAlpha, uRadius;
      varying vec2 vUv; varying float vShade;
      void main() {
        vec2 d = abs((vUv - 0.5) * uSize) - uSize * 0.5 + uRadius;
        float sdf = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - uRadius;
        float edge = clamp(0.5 - sdf / max(fwidth(sdf), 1e-4), 0.0, 1.0);
        vec3 c = texture2D(uMap, vUv).rgb * (1.0 - uShade * clamp(vShade * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(c, edge * uAlpha);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 64, 1), mat);
  scene.add(mesh);
  return {
    setImage: (t) => (mat.uniforms.uMap.value = t),
    hide: () => (cv.style.visibility = "hidden"),
    draw: (o) => {
      const W = innerWidth, H = innerHeight;
      r.setSize(W, H, false);
      cam.fov = (2 * Math.atan(H / 2 / o.lens) * 180) / Math.PI; cam.aspect = W / H; cam.near = 1; cam.far = o.lens * 10;
      cam.position.set(0, 0, o.lens); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
      mesh.position.set(o.left + o.width / 2 - W / 2, H / 2 - (o.top + o.height / 2), 0);
      mesh.rotation.set(0, (o.ry * Math.PI) / 180, 0);
      mat.uniforms.uSize.value.set(o.width, o.height);
      mat.uniforms.uBend.value = (o.bend * Math.PI) / 180;
      mat.uniforms.uLag.value = o.lag;
      mat.uniforms.uShade.value = o.shading;
      mat.uniforms.uAlpha.value = o.alpha;
      mat.uniforms.uRadius.value = o.radius;
      cv.style.visibility = "visible";
      r.render(scene, cam);
    },
  };
}

if (stage && canvas && box && open && items.length && window.THREE) start();
})();
