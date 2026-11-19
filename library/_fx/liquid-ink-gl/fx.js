(() => {
  // A black liquid laid behind the screen — a feedback buffer that reads and rewrites the previous scene (half width and height as is) paints cursor brush strokes onto it,
  // Flows along a noise angle field and dries at .95 per second. The visible screen reads that height field as a slope to apply backlight, reflection and a rainbow rim.
  // Runs on fixed steps (1/120s, max 4 steps per frame) so flow speed stays the same whatever the frame rate.
  const STEP = 1 / 120, MAX_STEPS = 4, SHOCKS = 4;
  const PICK = 'a, button, input, textarea, select, label, summary, [role="button"]';

  const SHOCK_GLSL = `
#define SHOCKS ${SHOCKS}
uniform vec4 uShocks[SHOCKS];
uniform sampler2D uFiber;
const float RING_LIFE = 1.5;
const float RING_W = .07;
const float RING_OVER = .72;
const float RING_PUSH = .25;
const float FIBER_LEAD = .075;
const float FIBER_TILE = 1.5;
vec2 ringField(vec2 px) {
  vec2 acc = vec2(0.);
  vec2 fuv = px / uRes.y * FIBER_TILE;
  for (int i = 0; i < SHOCKS; i++) {
    vec4 s = uShocks[i];
    float age = uTime - s.z;
    if (s.w <= 0. || age < 0. || age > RING_LIFE) continue;
    vec2 d = (px - s.xy) / uRes.y;
    float dist = length(d);
    float grain = texture(uFiber, fuv + fract(s.z * vec2(.1234, .0789))).r;
    float reach = dist * (1. - FIBER_LEAD * (grain * 2. - 1.));
    vec2 corner = max(s.xy, uRes.xy - s.xy) / uRes.y;
    float far = (length(corner) * (1. + FIBER_LEAD) + RING_W * 2.) * RING_OVER;
    float t = age / RING_LIFE;
    float r = far * (1. - pow(1. - t, 3.));
    float x = (reach - r) / RING_W;
    float ring = exp(-x * x) * smoothstep(0., RING_W * 2., r);
    acc += d / max(dist, 1e-4) * ring * (1. - smoothstep(0., 1., t)) * s.w * RING_PUSH;
  }
  return acc;
}`;

  const VERT = `precision highp float;
in vec3 position;
void main() { gl_Position = vec4(position, 1.); }`;

  const SIM = `precision highp float;
out vec4 fragOut;
uniform vec3 uRes;
uniform float uTime;
uniform sampler2D uNoise;
uniform sampler2D uPrev;
uniform vec4 uMouse;
uniform vec2 uMousePrev;
uniform float uDt;
uniform float uPx;
uniform vec4 uRect;
uniform float uOnTarget;
uniform float uScroll;
uniform float uStill;
uniform float uLeaving;
uniform float uIntro;
const float FLOW_SPEED = .01;
const float FLOW_SCALE = .075;
const float DRY = .95;
const float PUSH = 1.85;
const float REACH = 6.;
const float INTRO_TURB = 1.;
const float INTRO_PUSH = 2.5;
const float INTRO_SCALE = .01;
const float INTRO_CUT = .0245;
const float INTRO_SPEED = .15;
const float INTRO_RADIUS = 1.3;
${SHOCK_GLSL}

vec3 layered(vec3 p) {
  vec3 sum = vec3(0.);
  float amp = .5, freq = 2.;
  float z = p.z * .2;
  vec2 a = p.xy + vec2(z, 0.), b = p.xy + vec2(0., z);
  for (int i = 0; i < 3; i++) {
    sum += mix(texture(uNoise, a * freq).rgb, texture(uNoise, b * freq).rgb, fract(z)) * amp;
    amp /= 3.;
    freq *= 3.;
  }
  return sum;
}

void main() {
  float ry = 1. / uRes.y;
  vec2 aspect = vec2(uRes.y / uRes.x, 1.);
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 c = (gl_FragCoord.xy - .5 * uRes.xy) * ry;
  vec2 m = (uMouse.xy - .5 * uRes.xy) * ry;
  float live = step(.5, uMouse.z) * (1. - uIntro);
  vec2 at = mix(m, vec2(0.), uIntro);
  float brush = max(live, uIntro);
  vec2 toMouse = c - m;
  float near = smoothstep(.2, 0., length(toMouse)) * live;
  vec2 mp = (uMousePrev - .5 * uRes.xy) * ry;
  vec2 from = mix(mp, vec2(0.), uIntro) * brush;
  vec2 seg = at * brush - from;
  float h = clamp(dot(c - from, seg) / max(dot(seg, seg), 1e-6), 0., 1.);
  vec2 q = c - (from + seg * h);

  vec2 cell = (REACH / 472.) * aspect;
  float mid = texture(uPrev, uv).r;
  float l = texture(uPrev, uv - vec2(cell.x, 0.)).r;
  float r = texture(uPrev, uv + vec2(cell.x, 0.)).r;
  float dn = texture(uPrev, uv - vec2(0., cell.y)).r;
  float up = texture(uPrev, uv + vec2(0., cell.y)).r;
  float zz = mid * mid + .001;
  vec2 g = vec2(l - r, dn - up);
  vec2 slope = g / sqrt(dot(g, g) + zz * zz);
  vec2 bend = -slope + (toMouse * near * 30.) * uOnTarget;

  float turb = mix(1., INTRO_TURB, uIntro);
  vec3 spice = layered(vec3(c * FLOW_SCALE * turb, uTime * FLOW_SPEED * turb));
  float ang = spice.x * 12.566;
  float force = (PUSH - uOnTarget * .75 + uLeaving * .25 + uIntro * INTRO_PUSH) * ry;
  force *= mix(1., uPx, uOnTarget);
  uv += (bend + vec2(cos(ang), sin(ang))) * aspect * force;
  vec2 ring = ringField(gl_FragCoord.xy);
  uv -= ring * aspect * 25. * ry;

  vec4 prev = texture(uPrev, uv);
  float rad = mix(.08, .12, 1. - prev.r);
  float wob = (1. - uOnTarget) * (rad + (spice.y - .5) * .05);
  float paint = (1. - smoothstep(wob * .2, wob, length(q))) * (.5 + spice.z * .5) * brush;

  float blobs = 0.;
  if (uIntro > 0.) {
    vec3 n = layered(vec3(c * INTRO_SCALE, uTime * INTRO_SPEED + 50.));
    blobs = smoothstep(INTRO_CUT - .15, INTRO_CUT + .15, n.x) * float(length(c) < uIntro * INTRO_RADIUS);
  }

  float v = 0.;
  bool inside = false;
  if (uOnTarget > .5) {
    float pulse = sin(uTime * 3. + spice.x * 200.) * .012;
    vec2 half_ = uRect.zw * .5 * ry + pulse;
    vec2 ctr = ((uRect.xy + uRect.zw * .5) - .5 * uRes.xy) * ry;
    vec2 pb = c - ctr + spice.xy * .05;
    if (all(lessThan(abs(pb), half_))) {
      inside = true;
      float sx = live > .5 ? clamp(m.x, ctr.x - half_.x, ctr.x + half_.x) : ctr.x;
      float side = sign(c.x - sx);
      vec2 npb = vec2(c.x - cell.x * side - ctr.x, pb.y);
      float o = .001 + .003 * uStill;
      float nb = texture(uPrev, uv + vec2(o, 0.)).r + texture(uPrev, uv - vec2(o, 0.)).r
               + texture(uPrev, uv + vec2(0., o)).r + texture(uPrev, uv - vec2(0., o)).r;
      float far = abs(c.x - sx);
      float gate = mix(.6, .1, smoothstep(0., half_.x, far * (1. - nb)));
      float spread = smoothstep(gate, gate - .1, 1. - nb) * float(all(lessThan(abs(npb), half_)));
      float grow = max(smoothstep(.08, 0., far) * live, smoothstep(0., .9, nb * spread));
      float drag = smoothstep(0., 1., far / (half_.x * 2.));
      float rate = (20.12 + spice.z * .1) * (1. - drag * .6);
      v = mix(prev.r, 1., grow * rate) - .002 - uScroll * .1;
    }
  }
  if (!inside) {
    v = max(max(paint, blobs), prev.r - uDt * (DRY + uScroll * .2 + uLeaving));
    v = max(v, length(ring) * .5);
  }
  fragOut = vec4(clamp(v, 0., 1.));
}`;

  const VIEW = `precision highp float;
out vec4 fragOut;
uniform vec3 uRes;
uniform float uTime;
uniform sampler2D uField;
uniform float uHold;
uniform float uGlitch;
uniform vec3 uLo;
uniform vec3 uHi;
uniform vec3 uShine;
const float SPAN = 3.;
const float GLITCH_RATE = .6;
${SHOCK_GLSL}

float hash(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

vec3 tone(vec2 uv) {
  vec2 px = SPAN / uRes.xy;
  float hgt = texture(uField, uv).r;
  float l = texture(uField, uv - vec2(px.x, 0.)).r;
  float r = texture(uField, uv + vec2(px.x, 0.)).r;
  float dn = texture(uField, uv - vec2(0., px.y)).r;
  float up = texture(uField, uv + vec2(0., px.y)).r;
  vec3 nrm = normalize(vec3(r - l, dn - up, hgt * hgt * hgt));
  vec3 col = vec3(.3) * (1. - abs(nrm.z));
  float lit = dot(nrm, vec3(0., .4472136, .8944272));
  col += vec3(.5) * smoothstep(.2, 1., pow(lit * .5 + .5, 20.));
  float edge = mix(.15, 1., uHold);
  col += (.5 + .5 * cos(vec3(1., 2., 3.) + lit * 4. - uv.y * 3. - 3. + uTime * 2.)) * smoothstep(edge, 0., hgt);
  col -= texture(uFiber, gl_FragCoord.xy / vec2(textureSize(uFiber, 0))).r * .1;
  float glow = smoothstep(mix(1.5, .5, uHold), mix(-.5, -1.5, uHold), length(uv - .5));
  vec3 ground = mix(uLo, uHi, glow);
  return mix(ground, mix(uLo, uShine, clamp(col, 0., 1.)), smoothstep(.01, .1, hgt));
}

void main() {
  vec2 ring = ringField(gl_FragCoord.xy);
  vec2 uv = (gl_FragCoord.xy - ring * uRes.y * .03) / uRes.xy;
  vec3 col = tone(uv);
  if (uGlitch > .001) {
    float t = floor(uTime * GLITCH_RATE * 60.);
    float shift = uGlitch * .5;
    for (float i = 0.; i < 10. * uGlitch; i += 1.) {
      float y0 = hash(vec2(t, 2345. + i));
      float hh = hash(vec2(t, 9035. + i)) * .25;
      float dx = mix(-shift, shift, hash(vec2(t, 9625. + i)));
      if (step(y0, uv.y) - step(fract(y0 + hh), uv.y) == 1.) col = tone(vec2(uv.x + dx, uv.y));
    }
    float cs = uGlitch / 6.;
    vec2 off = vec2(mix(-cs, cs, hash(vec2(t, 9545.))), mix(-cs, cs, hash(vec2(t, 7205.))));
    col.r = tone(uv + off).r;
    col.b = tone(uv - off).b;
    col = mix(col, mix(uLo, uShine, .5), uGlitch * .6);
  }
  col *= 1. - clamp(length(ring) / RING_PUSH, 0., 1.);
  fragOut = vec4(col, 1.);
}`;

  // Instead of the original noise image, same-purpose noise is baked on the spot — for flow, per-cell random RGB (linear interpolation, mipmaps, repeat),
  // The grain image is gray grain stretched horizontally (the grain at the head of the dither and shockwave)
  function seeded(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function noiseTexture(THREE) {
    const n = 256, data = new Uint8Array(n * n * 4), rnd = seeded(7);
    for (let i = 0; i < n * n; i++) { data[i * 4] = rnd() * 255; data[i * 4 + 1] = rnd() * 255; data[i * 4 + 2] = rnd() * 255; data[i * 4 + 3] = 255; }
    const t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  }
  function fiberTexture(THREE) {
    const n = 256, raw = new Float32Array(n * n), rnd = seeded(11);
    for (let i = 0; i < raw.length; i++) raw[i] = rnd();
    const data = new Uint8Array(n * n * 4);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      let sum = 0;
      for (let k = -6; k <= 6; k++) sum += raw[y * n + ((x + k + n) % n)];
      const v = Math.min(255, Math.max(0, ((sum / 13 - .5) * 3.2 + .5) * 255));
      const i = (y * n + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v; data[i + 3] = 255;
    }
    const t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = t.minFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  }

  const rgb = (el, name, THREE) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    probe.style.display = "none";
    el.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const m = c.match(/[\d.]+/g) || ["0", "0", "0"];
    return new THREE.Vector3(+m[0] / 255, +m[1] / 255, +m[2] / 255);
  };

  kfFx.register("liquid-ink-gl", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    if (!THREE || !window.gsap) return;
    const boxed = options.layer === "box";
    let stage = el.querySelector(':scope > [data-fx-part="canvas"]');
    const made = !stage;
    if (made) {
      stage = document.createElement("div");
      stage.setAttribute("data-fx-part", "canvas");
      stage.setAttribute("aria-hidden", "true");
      el.prepend(stage);
    }
    stage.classList.toggle("is-boxed", boxed);
    if (reduce) {
      stage.style.background = "radial-gradient(circle at 50% 50%, var(--fx-hi) 0%, color-mix(in oklab, var(--fx-hi) 45%, var(--fx-lo)) 75%)";
      return () => { stage.style.background = ""; if (made) stage.remove(); };
    }

    const holdOn = options.hold !== "off";
    const introDur = +(options.intro ?? 3);
    const holdDur = +(options["hold-dur"] ?? 1);
    const touch = !hover;
    const dprOf = () => (touch ? 1 : Math.min(window.devicePixelRatio || 1, +(options.dpr || 2)));

    const shocks = Array.from({ length: SHOCKS }, () => new THREE.Vector4(0, 0, -100, 0));
    const noise = noiseTexture(THREE), fiber = fiberTexture(THREE);
    const shared = { uRes: { value: new THREE.Vector3() }, uTime: { value: 0 }, uShocks: { value: shocks }, uFiber: { value: fiber } };
    const simU = {
      ...shared, uTime: { value: 0 }, uNoise: { value: noise }, uPrev: { value: null },
      uMouse: { value: new THREE.Vector4() }, uMousePrev: { value: new THREE.Vector2() }, uDt: { value: STEP }, uPx: { value: 1 },
      uRect: { value: new THREE.Vector4() }, uOnTarget: { value: 0 }, uScroll: { value: 0 }, uStill: { value: 0 }, uLeaving: { value: 0 },
      uIntro: { value: introDur > 0 ? 1 : 0 },
    };
    const viewU = {
      ...shared, uField: { value: null }, uHold: { value: 0 }, uGlitch: { value: 0 },
      uLo: { value: rgb(el, "--fx-lo", THREE) }, uHi: { value: rgb(el, "--fx-hi", THREE) }, uShine: { value: rgb(el, "--fx-shine", THREE) },
    };

    const renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance", depth: false, stencil: false, antialias: false });
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    stage.appendChild(renderer.domElement);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);
    const simScene = new THREE.Scene(), viewScene = new THREE.Scene();
    const simMat = new THREE.RawShaderMaterial({ uniforms: simU, vertexShader: VERT, fragmentShader: SIM, glslVersion: THREE.GLSL3 });
    const viewMat = new THREE.RawShaderMaterial({ uniforms: viewU, vertexShader: VERT, fragmentShader: VIEW, glslVersion: THREE.GLSL3 });
    simScene.add(new THREE.Mesh(quad, simMat));
    viewScene.add(new THREE.Mesh(quad, viewMat));
    const rtOpt = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RedFormat, type: THREE.HalfFloatType, depthBuffer: false };
    let rtA = new THREE.WebGLRenderTarget(4, 4, rtOpt), rtB = new THREE.WebGLRenderTarget(4, 4, rtOpt);

    let W = -1, H = -1, D = -1;
    const size = () => {
      const w = stage.clientWidth, h = stage.clientHeight, d = dprOf();
      if (!w || !h || (w === W && h === H && d === D)) return;
      W = w; H = h; D = d;
      renderer.setPixelRatio(d);
      renderer.setSize(w, h, false);
      simU.uRes.value.set(w * d, h * d, 1);
      viewU.uRes.value.set(w * d, h * d, 1);
      simU.uPx.value = touch ? 1 : d / 2;
      rtA.setSize(w * d, h * d);
      rtB.setSize(w * d, h * d);
    };
    size();
    // Precompile both shaders when building the world — compiling at the first cursor move freezes the screen
    renderer.compile(simScene, cam);
    renderer.compile(viewScene, cam);
    const ro = new ResizeObserver(size);
    ro.observe(stage);

    const box = () => (boxed ? stage.getBoundingClientRect() : { left: 0, top: 0 });
    const cur = new THREE.Vector2(), goal = new THREE.Vector2(), last = new THREE.Vector2();
    let moving = false, movedAt = 0, seen = false;
    const onMove = (e) => {
      const b = box(), x = e.clientX - b.left, y = e.clientY - b.top;
      if (touch) { if (!moving) { cur.set(x, y); last.copy(cur); } goal.set(x, y); }
      else { cur.set(x, y); if (!moving) last.copy(cur); }
      moving = true; movedAt = performance.now(); seen = true;
      pointAt = { x: e.clientX, y: e.clientY };
    };
    let pointAt = null;

    // When over a row (target), liquid fills that row’s box from the cursor position out to both sides — the box starts as a thin band at cursor height
    // Grows to the bottom of the row over 2.6s, then gathers into a band 30% of the row height at the bottom over 1.1s (both wrap a linear progress in expo.out at once)
    const rect = { x: 0, y: 0, z: 0, w: 0 };
    let target = null, rectLive = false, forceUntil = 0, rectTl = null;
    const enter = (t) => {
      target = t;
      const r = t.getBoundingClientRect(), d = D, b = box();
      const sy = boxed ? 0 : window.scrollY * d;
      const left = (r.left - b.left) * d, bottom = (H - (r.bottom - b.top)) * d - sy, wide = r.width * d, tall = r.height * .3 * d;
      let y0, h0;
      if (rectLive) { y0 = rect.y; h0 = rect.w; }
      else {
        rectLive = true;
        forceUntil = performance.now() + 150;
        y0 = (H - ((pointAt ? pointAt.y : r.top + r.height / 2) - b.top)) * d - sy;
        h0 = 0;
        Object.assign(rect, { y: y0, x: left, z: wide });
      }
      rectTl?.kill();
      rectTl = gsap.timeline({ paused: true })
        .to(rect, { x: left, w: y0 + h0 - bottom, duration: 2.6, ease: "none", overwrite: true })
        .to(rect, { y: bottom, z: wide, w: tall, duration: 1.1, ease: "none", overwrite: true });
      rectTl.tweenTo(rectTl.duration(), { ease: "expo.out" });
      gsap.to(simU.uOnTarget, { value: 1, duration: .03, ease: "power2.out", overwrite: true });
    };
    const leave = () => {
      if (!target) return;
      target = null;
      rectLive = false;
      gsap.to(simU.uLeaving, { value: 1, duration: 0, overwrite: true, onComplete: () => gsap.to(simU.uLeaving, { value: 0, duration: 1, ease: "none", overwrite: true }) });
      gsap.to(simU.uOnTarget, { value: 0, duration: .03, ease: "power2.out", overwrite: true });
    };
    const checkTarget = () => {
      if (touch || !pointAt) return;
      const hit = document.elementFromPoint(pointAt.x, pointAt.y);
      const t = hit?.closest('[data-fx-part="target"]');
      if (t && el.contains(t)) { if (t !== target) enter(t); }
      else if (target && !target.parentElement?.contains(hit)) leave();
    };
    const onPointer = (e) => { onMove(e); checkTarget(); };
    const off = [];
    const on = (t, type, fn, opt) => { t.addEventListener(type, fn, opt); off.push(() => t.removeEventListener(type, fn, opt)); };
    on(touch ? window : document, touch ? "touchmove" : "mousemove", touch ? (e) => e.touches[0] && onMove(e.touches[0]) : onPointer, { passive: true });
    if (touch) on(window, "touchstart", (e) => e.touches[0] && onMove(e.touches[0]), { passive: true });
    if (!touch) on(document.documentElement, "mouseleave", () => { pointAt = null; leave(); });

    let scrollAt = 0;
    on(window, "scroll", () => { scrollAt = performance.now(); checkTarget(); }, { passive: true });

    // Press an empty spot and hold for 1 second and the panel flips — the background darkens and a rainbow rim spreads across the whole liquid. Release early and it reverts
    let mode = 0, holding = false;
    const glitch = () => {
      gsap.killTweensOf(viewU.uGlitch);
      viewU.uGlitch.value = .85;
      gsap.to(viewU.uGlitch, { value: 0, duration: .85, ease: "power3.out", overwrite: true });
    };
    const holdTw = gsap.to(viewU.uHold, {
      value: 1, duration: holdDur, ease: "power2.inOut", paused: true,
      onUpdate: () => {
        const v = viewU.uHold.value;
        el.style.setProperty("--fx-hold", v.toFixed(3));
        el.dispatchEvent(new CustomEvent("fx:hold", { detail: { value: v } }));
        if (holdTw.reversed()) { if (mode === 1 && v <= .25) { mode = 0; glitch(); el.dispatchEvent(new CustomEvent("fx:mode", { detail: { mode } })); } }
        else if (mode === 0 && v >= .75) { mode = 1; glitch(); el.dispatchEvent(new CustomEvent("fx:mode", { detail: { mode } })); }
      },
    });
    if (holdOn && !touch) {
      const pressOn = boxed ? el : document.body;
      on(pressOn, "mousedown", (e) => {
        if (e.button !== 0 || e.target.closest?.(PICK)) return;
        holding = true;
        window.getSelection()?.removeAllRanges();
        mode === 0 ? holdTw.play() : holdTw.reverse();
      });
      const release = () => {
        if (!holding) return;
        holding = false;
        if (holdTw.isActive()) mode === 0 ? holdTw.reverse() : holdTw.play();
      };
      on(window, "mouseup", release);
      on(window, "dragend", release);
      on(document, "selectstart", (e) => { if (holding) e.preventDefault(); });
    }
    on(el, "fx:toggle", () => ((holdTw.isActive() ? !holdTw.reversed() : mode === 1) ? holdTw.reverse() : holdTw.play()));

    let clock = 0, slot = 0;
    on(el, "fx:shock", (e) => {
      const { x = W / 2, y = H / 2, strength = 1 } = e.detail || {};
      const b = box();
      shocks[slot].set((x - b.left) * D, (H - (y - b.top)) * D, clock, strength);
      slot = (slot + 1) % SHOCKS;
    });

    const intro = () => { if (introDur > 0) gsap.to(simU.uIntro, { value: 0, duration: introDur, ease: "expo.inOut" }); };
    if (options.wait === "ready") on(el, "fx:ready", intro, { once: true });
    else gsap.delayedCall(+(options.delay ?? 0), intro);

    let carry = 0, prevT = -1, flip = true;
    const fromPx = new THREE.Vector2(), toPx = new THREE.Vector2();
    const step = () => {
      const goingStill = (!moving && target ? 1 : 0) - simU.uStill.value;
      simU.uStill.value += goingStill * (goingStill > 0 ? 2.4 : .04);
      const src = flip ? rtA : rtB, dst = flip ? rtB : rtA;
      simU.uPrev.value = src.texture;
      renderer.setRenderTarget(dst);
      renderer.render(simScene, cam);
      viewU.uField.value = dst.texture;
      flip = !flip;
    };
    const tick = (time) => {
      if (W <= 0) return;
      const t = time;
      const dt = prevT < 0 ? 0 : Math.max(0, t - prevT);
      prevT = t;
      clock = t;
      const now = performance.now();
      if (touch) {
        if (moving) cur.lerp(goal, 1 - Math.exp(-dt * 9));
        if (now - movedAt > 250 && cur.distanceTo(goal) < 1) moving = false;
      } else if (now - movedAt > 50) moving = false;
      viewU.uTime.value = t;
      const forced = !touch && !!target && now < forceUntil;
      simU.uMouse.value.z = moving || forced ? 1 : 0;
      simU.uRect.value.set(rect.x, rect.y + (boxed ? 0 : window.scrollY * D), rect.z, rect.w);
      simU.uScroll.value = !touch && now - scrollAt < 120 ? 1 : 0;
      carry = Math.min(carry + dt, STEP * MAX_STEPS);
      const n = Math.round(carry / STEP);
      carry -= n * STEP;
      fromPx.set(last.x * D, H * D - last.y * D);
      toPx.set(cur.x * D, H * D - cur.y * D);
      if (n > 0) last.copy(cur);
      for (let i = 0; i < n; i++) {
        simU.uTime.value = t - (n - 1 - i) * STEP;
        simU.uMousePrev.value.lerpVectors(fromPx, toPx, i / n);
        const k = (i + 1) / n;
        simU.uMouse.value.x = fromPx.x + (toPx.x - fromPx.x) * k;
        simU.uMouse.value.y = fromPx.y + (toPx.y - fromPx.y) * k;
        step();
      }
      renderer.setRenderTarget(null);
      renderer.render(viewScene, cam);
    };
    if (!seen) { cur.set(stage.clientWidth / 2, stage.clientHeight / 2); last.copy(cur); }
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      off.forEach((f) => f());
      ro.disconnect();
      holdTw.kill();
      rectTl?.kill();
      gsap.killTweensOf([viewU.uGlitch, simU.uIntro, simU.uOnTarget, simU.uLeaving, rect]);
      el.style.removeProperty("--fx-hold");
      quad.dispose(); simMat.dispose(); viewMat.dispose(); noise.dispose(); fiber.dispose(); rtA.dispose(); rtB.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      if (made) stage.remove();
    };
  });
})();
