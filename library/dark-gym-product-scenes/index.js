// First page — loader (number hole), hero light-ray shader, court 3D, horizontal band, zigzag band flip, name embroidery, reviews, light fog, pouch drop, dusk
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 992px)");
  const phone = matchMedia("(max-width: 767px)");
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const T = window.THREE;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const span = (v, a, b) => clamp((v - a) / (b - a));

  /* Convert variables to real sRGB values so skin colors can be passed to the shader and canvas */
  const probeCtx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probeEl = document.createElement("i");
  probeEl.style.display = "none";
  document.body.appendChild(probeEl);
  function rgbOf(name) {
    probeEl.style.color = `var(${name})`;
    const c = getComputedStyle(probeEl).color;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = c;
    probeCtx.fillRect(0, 0, 1, 1);
    const d = probeCtx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }
  const cssRgb = (name, a = 1) => { const [r, g, b] = rgbOf(name).map((v) => Math.round(v * 255)); return `rgba(${r},${g},${b},${a})`; };
  const fontVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const threeColor = (name) => { const [r, g, b] = rgbOf(name); return new T.Color().setRGB(r, g, b, T.SRGBColorSpace); };

  /* ────────── Hero title fit — the giant line fills the 3em side margins but never exceeds .24 of the screen height ────────── */
  const hero = document.getElementById("hero");
  const giant = hero.querySelector(".hero__h1-line--giant");
  const giantSeg = giant.querySelector(".cf-seg");
  function fitHero() {
    hero.style.removeProperty("--h1-size");
    if (phone.matches) return;
    const avail = hero.clientWidth - giant.offsetLeft * 2, w = giantSeg.getBoundingClientRect().width;
    if (w < 1 || avail < 1) return;
    const size = Math.min(parseFloat(getComputedStyle(giant).fontSize) * (avail / w), innerHeight * 0.24);
    hero.style.setProperty("--h1-size", size.toFixed(2) + "px");
  }
  fitHero();
  document.fonts?.ready.then(fitHero);
  addEventListener("resize", fitHero);
  // Layer the same title once more with hard-light (the original’s light-catching layer)
  const ghost = document.createElement("div");
  ghost.className = "hero__h1-ghost";
  ghost.setAttribute("aria-hidden", "true");
  const ghostLine = giant.cloneNode(true);
  ghostLine.removeAttribute("class");
  ghostLine.className = "hero__h1-line hero__h1-line--giant";
  ghostLine.querySelector(".cf-seg").removeAttribute("data-label");
  ghost.setAttribute("data-fill", "ghost");
  ghost.setAttribute("data-fill-manual", "");
  ghost.appendChild(ghostLine);
  hero.querySelector(".hero__copy").appendChild(ghost);
  window.sitePrepFill?.();

  /* Hero light beams — three beams from upper right to lower left plus a fourth beam toward the cursor, haze and dust, a trail where the pointer passed, mouse parallax */
  // Original hero-scene values: stem positions .46/.66/.30 · widths .105/.075/.14 · strengths 1/.6/.35, cursor stem width .09 ×.75, flow bend .02 · light ≤1.6x (combined ≤1.85x) · dust push .025 · lift .05
  const HERO_FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime, uAspect, uCursorBeam, uCursorGain, uGain, uFlowGain;
    uniform vec2 uParallax;
    uniform vec3 uBandC, uBandBoost, uWarm, uHot;
    uniform sampler2D tFlow;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++){ s += a*noise(p); p *= 2.07; a *= .5; } return s; }
    /* Position 0..1 along the streak measured across — the streak flows toward (-.4226,-.9063) */
    float beamCoord(vec2 uv){ vec2 p = vec2(uv.x * uAspect, uv.y); float t = dot(p, vec2(.9063, -.4226)); return (t + .4226) / (.9063 * uAspect + .4226); }
    float band(float x, float c, float w){ float d = (x - c) / w; return exp(-d*d); }
    float beamMask(vec2 uv){ float t = beamCoord(uv);
      return band(t, uBandC.x, .105) + band(t, uBandC.y, .075) * .6 + band(t, uBandC.z, .14) * .35 + band(t, uCursorBeam, .09) * uCursorGain * .75; }
    float steerBoost(float t){ return min(uBandBoost.x * band(t, uBandC.x, .105) + uBandBoost.y * band(t, uBandC.y, .075) + uBandBoost.z * band(t, uBandC.z, .14), .18); }
    void main(){
      vec2 uv = vUv + uParallax * .02;
      vec3 fl = texture2D(tFlow, vUv).rgb * step(.0001, uFlowGain);
      float mask = beamMask(uv + fl.rg * .02 * uFlowGain);
      vec2 p = vec2(uv.x * uAspect, uv.y);
      float along = dot(p, vec2(-.4226, -.9063)), t = beamCoord(uv);
      float shimmer = .72 + .40 * noise(vec2(along * 2.6 - uTime * .16, t * 9.));
      float fall = mix(.55, 1., smoothstep(0., .85, vUv.y));
      float boost = min((1. + fl.b * .6 * uFlowGain) * (1. + steerBoost(t)), 1.85);
      float rays = mask * shimmer * fall * boost;
      float haze = fbm(p * 2.2 + vec2(uTime * .02, -uTime * .035)) * .35;
      vec2 dp = p + fl.rg * .025 * uFlowGain;
      float dust = smoothstep(.985, 1., noise(dp * 260. + vec2(0., uTime * 1.6))) * (rays * 2.5 + .1);
      /* Original light-ray pass strength .16 (default without ?rays) — rays · haze sit only faintly over the photo */
      float light = (rays + haze * (.35 + rays)) * .16 * uGain;
      vec3 col = mix(uWarm, uHot, clamp(rays * 1.2, 0., 1.)) * light + uHot * dust * .5 * uGain;
      col += uHot * fl.b * .05 * uFlowGain * uGain;
      col *= 1. + band(t, uCursorBeam, .12) * uCursorGain * .10;
      gl_FragColor = vec4(col, 0.);
    }`;
  const QUAD_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
  // Flow map — stamp velocity (rg) and strength (b) at the interaction position and fade by .965 each frame (same formula as OGL Flowmap)
  const FLOW_FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tMap;
    uniform float uFalloff, uAlpha, uDissipation, uAspect;
    uniform vec2 uMouse, uVelocity;
    void main(){
      vec4 color = texture2D(tMap, vUv) * uDissipation;
      vec2 cursor = vUv - uMouse; cursor.x *= uAspect;
      vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
      float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;
      color.rgb = mix(color.rgb, stamp, vec3(falloff));
      gl_FragColor = color;
    }`;
  let heroGL = null;
  function buildHeroGL() {
    if (!T || reduce) return null;
    const canvas = hero.querySelector(".hero__canvas");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true }); } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene(), cam = new T.Camera();
    const BANDS = [0.46, 0.66, 0.3];
    const u = {
      uTime: { value: 0 }, uAspect: { value: 1 }, uParallax: { value: new T.Vector2() },
      uBandC: { value: new T.Vector3(...BANDS) }, uBandBoost: { value: new T.Vector3() }, uCursorBeam: { value: 0.5 }, uCursorGain: { value: 0 }, uGain: { value: 0 },
      uFlowGain: { value: 0 }, tFlow: { value: null },
      uWarm: { value: new T.Vector3(...rgbOf("--site-terra")) }, uHot: { value: new T.Vector3(...rgbOf("--site-peach")) },
    };
    // Like the original, adds on top of the photo (ONE,ONE) — drawing with alpha 0 on a premultiplied-alpha canvas makes the browser add it straight onto the screen below
    const mat = new T.ShaderMaterial({ uniforms: u, vertexShader: QUAD_VERT, fragmentShader: HERO_FRAG, transparent: true, depthTest: false, blending: T.NoBlending });
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    let flow = null;
    try {
      const opt = { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false };
      const fu = { tMap: { value: null }, uFalloff: { value: 0.09 }, uAlpha: { value: 1 }, uDissipation: { value: 0.965 }, uAspect: { value: 1 }, uMouse: { value: new T.Vector2() }, uVelocity: { value: new T.Vector2() } };
      const fscene = new T.Scene();
      fscene.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: fu, vertexShader: QUAD_VERT, fragmentShader: FLOW_FRAG, depthTest: false, depthWrite: false })));
      flow = { a: new T.WebGLRenderTarget(192, 192, opt), b: new T.WebGLRenderTarget(192, 192, opt), u: fu, scene: fscene, pending: [], energy: 0, speed: 0, last: null };
      u.tFlow.value = flow.a.texture;
    } catch { flow = null; }
    const flowStep = () => {
      flow.u.tMap.value = flow.a.texture;
      renderer.setRenderTarget(flow.b); renderer.render(flow.scene, cam); renderer.setRenderTarget(null);
      [flow.a, flow.b] = [flow.b, flow.a];
      u.tFlow.value = flow.a.texture;
    };
    // Compile now so it doesn’t freeze on the first compile at the first cursor move
    renderer.compile(scene, cam);
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const front = hero.querySelector(".hero__player-front"), glow = hero.querySelector(".hero__player-glow"), sweep = { t: 0, gain: 0 };
    let glowLive = false;
    // Original parallax — follow 1−e^(−5·dt), intensity goes 0→1 over 1.2s after turning on, drifts by sine (±.2) when the hand rests 4s, shifted down by scroll progress × 14
    let raf = 0, visible = true, t0 = performance.now(), prev = t0, lastPointer = -1e9, amp = 0, ampOn = false;
    // Cursor stream steering — influence fills at 2.5/s while a hand is present and drains over 3s without one. Strength fills with hand speed (uv/ms ×500) and fades over 2.2s.
    const steer = { on: false, last: null, uv: { x: 0.5, y: 0.5 }, to: { x: 0.5, y: 0.5 }, gain: 0, infl: 0, speed: 0 };
    const sstep = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    // Pull the cursor trail toward the strip positions (.38, .56, .76)
    const snap = (s) => { let num = s, den = 1; [0.38, 0.56, 0.76].forEach((c) => { const r = (s - c) / 0.1, w = Math.exp(-r * r) * 2.5; num += c * w; den += w; }); return num / den; };
    const size = () => { const w = hero.clientWidth, h = hero.clientHeight; renderer.setSize(w, h, false); u.uAspect.value = w / Math.max(1, h); if (flow) flow.u.uAspect.value = u.uAspect.value; };
    size();
    addEventListener("resize", size);
    const beamCoord = (x, y) => { const a = u.uAspect.value; return ((x * a) * 0.9063 - y * 0.4226 + 0.4226) / (0.9063 * a + 0.4226); };
    addEventListener("pointermove", (e) => {
      lastPointer = performance.now();
      target.x = e.clientX / innerWidth - 0.5;
      target.y = e.clientY / innerHeight - 0.5;
      const r = canvas.getBoundingClientRect();
      if (!r.height) return;
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height, out = x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05;
      if (flow) {
        if (out) flow.last = null;
        else {
          if (flow.last) {
            const dt = Math.max(8, e.timeStamp - flow.last.t);
            let vx = (x - flow.last.x) / dt * 800, vy = (y - flow.last.y) / dt * 800;
            const len = Math.hypot(vx, vy);
            if (len > 1) { vx /= len; vy /= len; }
            const steps = Math.min(3, Math.max(1, Math.ceil(Math.hypot(x - flow.last.x, y - flow.last.y) / 0.05)));
            for (let k = 1; k <= steps && flow.pending.length < 9; k++) flow.pending.push({ x: flow.last.x + (x - flow.last.x) * (k / steps), y: flow.last.y + (y - flow.last.y) * (k / steps), vx, vy });
            flow.speed = Math.max(flow.speed, Math.min(len, 1));
          }
          flow.last = { x, y, t: e.timeStamp };
        }
      }
      if (out) steer.last = null;
      else {
        if (steer.last) steer.speed = Math.max(steer.speed, Math.min(1, Math.hypot(x - steer.last.x, y - steer.last.y) / Math.max(8, e.timeStamp - steer.last.t) * 500));
        steer.last = { x, y, t: e.timeStamp };
        steer.to.x = x; steer.to.y = y;
      }
    }, { passive: true });
    document.addEventListener("pointerleave", () => { if (flow) flow.last = null; steer.last = null; });
    new IntersectionObserver((es) => { visible = es[0].intersectionRatio >= 0.15; if (visible && !raf) raf = requestAnimationFrame(frame); }, { threshold: [0, 0.15, 0.3] }).observe(hero);
    const updateFlow = (sec) => {
      if (!flow) return;
      flow.energy = Math.max(flow.speed, flow.energy * Math.exp(-sec / 1.3));
      flow.speed = 0;
      u.uFlowGain.value = sstep(0.002, 0.01, flow.energy);
      if (flow.energy <= 0.002) { flow.pending.length = 0; return; }
      const n = flow.pending.length;
      if (n) {
        flow.u.uDissipation.value = Math.pow(0.965, 1 / n); flow.u.uAlpha.value = 1;
        flow.pending.forEach((q) => { flow.u.uMouse.value.set(q.x, q.y); flow.u.uVelocity.value.set(q.vx, -q.vy); flowStep(); });
        flow.pending.length = 0; flow.u.uDissipation.value = 0.965;
      } else { flow.u.uAlpha.value = 0; flow.u.uVelocity.value.set(0, 0); flowStep(); flow.u.uAlpha.value = 1; }
    };
    const updateSteer = (now, sec) => {
      const live = !!steer.last && now - lastPointer < 4000, r = 1 - Math.exp(-2.5 * sec);
      steer.infl = live ? steer.infl + (1 - steer.infl) * r : Math.max(0, steer.infl - sec / 3);
      steer.gain = Math.max(steer.gain * Math.exp(-sec / 2.2), steer.speed);
      steer.speed = 0;
      if (steer.gain < 0.002) steer.gain = 0;
      if (steer.infl === 0 && steer.gain === 0) {
        steer.uv.x = steer.uv.y = steer.to.x = steer.to.y = 0.5;
        u.uCursorBeam.value = 0.5; u.uCursorGain.value = 0; u.uBandC.value.set(...BANDS); u.uBandBoost.value.set(0, 0, 0);
        return;
      }
      steer.uv.x += (steer.to.x - steer.uv.x) * r; steer.uv.y += (steer.to.y - steer.uv.y) * r;
      const n = beamCoord(steer.uv.x, steer.uv.y), h = Math.min(1, Math.max(0, n)), a = steer.infl;
      const c = BANDS.map((z, i) => z + (h - z) * [0.05, 0.04, 0.08][i] * a), g = BANDS.map((z) => { const d = (h - z) / 0.18; return 0.18 * a * Math.exp(-d * d); });
      u.uBandC.value.set(...c); u.uBandBoost.value.set(...g);
      const l = snap(Math.min(0.8, Math.max(0.25, n)));
      u.uCursorBeam.value = l;
      const f = sstep(0.15, 0.45, Math.hypot(1 - steer.uv.x, 1 - steer.uv.y)), dd = (l - c[0]) / 0.105;
      u.uCursorGain.value = steer.gain * steer.infl * f * (1 - 0.55 * Math.exp(-dd * dd));
    };
    function frame(now) {
      raf = 0;
      if (!visible) return;
      const ms = Math.min(64, Math.max(1, now - prev)), sec = ms / 1000;
      prev = now;
      if (now - lastPointer > 4000) { const w = ((now - t0) / 1000) * 0.3; target.x = Math.sin(w * 0.9) * 0.2; target.y = Math.sin(w * 0.7 + 1.3) * 0.2; }
      const k = 1 - Math.exp(-5 * sec);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      if (ampOn && amp < 1) amp = Math.min(1, amp + sec / 1.2);
      const hr = hero.getBoundingClientRect(), scrollV = hr.height ? Math.min(1, Math.max(0, -hr.top / hr.height)) * 14 : 0;
      const vx = cur.x * amp, vy = cur.y * amp + scrollV;
      updateSteer(now, sec);
      updateFlow(sec);
      u.uParallax.value.set(-vx, cur.y * amp);
      // Front layer parallax — original onFrame values (cutout and light −18.7, −11.22px)
      const fx = (vx * -18.7).toFixed(2) + "px", fy = (vy * -11.22).toFixed(2) + "px";
      if (front) front.style.transform = `translate3d(${fx},${fy},0)`;
      if (glow) {
        glow.style.transform = `translate3d(${fx},${fy},0)`;
        const g = sweep.gain, live = g > 0.001;
        hero.style.setProperty("--sweep-gain", g.toFixed(3));
        hero.style.setProperty("--sweep-t", sweep.t.toFixed(3));
        if (live !== glowLive) { glowLive = live; glow.classList.toggle("is-live", live); }
      }
      u.uTime.value = (now - t0) / 1000;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    canvas.classList.add("is-on");
    // First sweep — the light turns on and a diagonal band passes once (1.6s)
    return { u, sweep() {
      if (!hasGsap) { u.uGain.value = 1; ampOn = true; return; }
      ampOn = true;
      gsap.fromTo(u.uGain, { value: 0 }, { value: 1, duration: 1.6, ease: "power2.out" });
      gsap.fromTo(sweep, { t: 0, gain: 1 }, { t: 1, gain: 0, duration: 1.6, ease: "power2.inOut" });
    } };
  }

  /* ────────── Loader — brick cover, number hole, percent, skip → sucked into the center 0 as the first screen appears ────────── */
  const loader = document.getElementById("loader");
  const blocksEl = loader.querySelector(".loader__blocks"), pctEl = loader.querySelector(".loader__pct"), barEl = loader.querySelector(".loader__bar i"), skipBtn = document.getElementById("skip");
  const HT = { at: -1.1, dur: 2.6, copyLead: 0.2, groupEarly: 0.9, copyStagger: 0.18, tagDurK: 0.6 };
  const blocks = [];
  let hidden = 0;
  function makeBlocks() {
    const cols = Array.from({ length: 5 + Math.floor(Math.random() * 2) }, () => 0.6 + Math.random());
    const sum = cols.reduce((a, b) => a + b, 0);
    let x = 0;
    cols.forEach((c) => {
      const w = (c / sum) * 100;
      const rows = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => 0.7 + Math.random());
      const rs = rows.reduce((a, b) => a + b, 0);
      let y = 0;
      rows.forEach((r) => {
        const h = (r / rs) * 100, el = document.createElement("div");
        el.className = "loader__block";
        el.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
        blocksEl.appendChild(el);
        blocks.push({ el, cx: x + w / 2, cy: y + h / 2 });
        y += h;
      });
      x += w;
    });
    for (let i = blocks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [blocks[i], blocks[j]] = [blocks[j], blocks[i]]; }
    // Lower-left bricks drop out first so the first number shows
    let first = blocks.findIndex((b) => b.cx < 32 && b.cy > 60);
    if (first > 0) blocks.unshift(blocks.splice(first, 1)[0]);
    loader.classList.add("loader--live");
  }
  function hideBlocks(p) {
    const k = Math.min(1, p / 86);
    let n = Math.floor(Math.pow(k, 1.5) * blocks.length);
    if (p >= 4) n = Math.max(1, n);
    if (p >= 100) n = blocks.length;
    while (hidden < n) blocks[hidden++].el.style.visibility = "hidden";
  }
  // Giant number hole — three-cell number, at 100 it grows for 1.1s power3.in around the hollow center of the 0
  const SVGNS = "http://www.w3.org/2000/svg";
  function makeNum() {
    const wrap = document.createElement("div");
    wrap.className = "loader-num";
    wrap.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "loader-num__svg");
    const bg = document.createElementNS(SVGNS, "rect");
    bg.setAttribute("class", "loader-num__bg");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    const g = document.createElementNS(SVGNS, "g");
    const digits = [0, 1, 2].map((i) => { const t = document.createElementNS(SVGNS, "text"); t.setAttribute("class", "loader-num__digit"); t.setAttribute("text-anchor", "middle"); t.dataset.i = i; g.appendChild(t); return t; });
    svg.append(bg, g);
    wrap.appendChild(svg);
    loader.before(wrap);
    let m = null, lay = {}, shown = "", zoom = null, done = false, val = 0;
    const family = fontVar("--kf-font-display");
    function metrics() {
      const c = document.createElement("canvas"), S = 200;
      c.width = c.height = S * 2;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.font = `400 ${S}px ${family}`;
      let adv = 0;
      for (let d = 0; d < 10; d++) adv = Math.max(adv, x.measureText(String(d)).width);
      const z = x.measureText("0"), asc = z.actualBoundingBoxAscent, desc = z.actualBoundingBoxDescent;
      x.fillStyle = cssRgb("--site-cream");
      const base = S * 1.5;
      x.fillText("0", 0, base);
      const row = Math.round(base - (asc - desc) / 2), px = x.getImageData(0, row, c.width, 1).data;
      let a = -1, b = -1;
      for (let i = 0; i < c.width; i++) { const on = px[i * 4 + 3] > 128; if (on && a < 0) a = i; if (!on && a >= 0) { b = i; break; } }
      m = { S, adv, adv0: z.width, asc, desc, sx: (a + b) / 2, sw: Math.max(1, b - a) };
    }
    function layout(three) {
      const W = innerWidth, H = innerHeight, tall = H > W;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const slot = (m.adv / m.S) * 1.04, F = Math.min(H * (tall ? 0.42 : 0.7), (W * 0.94) / (3 * slot)) * 1.15, k = F / m.S, sw = slot * F;
      const base = H / 2 + ((m.asc - m.desc) * k) / 2, x0 = W / 2 - ((three ? 3 : 2) * sw) / 2;
      lay = { F, k, sw, base, x0, W, H };
      digits.forEach((t) => { const i = +t.dataset.i - (three ? 0 : 1); t.setAttribute("x", x0 + (i + 0.5) * sw); t.setAttribute("y", base); t.setAttribute("font-size", F); });
      shown = "";
    }
    function text(n) { const s = n >= 100 ? "100" : " " + String(n).padStart(2, "0"); if (s !== shown) { shown = s; digits.forEach((t) => { t.textContent = s[+t.dataset.i].trim(); }); } }
    const scaleAt = (x, y, s) => g.setAttribute("transform", `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`);
    const ready = (document.fonts ? document.fonts.load(`400 100px ${family}`) : Promise.resolve()).catch(() => {}).then(() => { if (!done) { metrics(); layout(false); render(val); } });
    addEventListener("resize", () => { if (m && !zoom) { layout(lay.three); render(val); } });
    function render(p) { val = p; if (!m || zoom || done) return; text(Math.min(99, Math.floor(p))); scaleAt(lay.W / 2, lay.H / 2, 1 + 0.06 * Math.min(1, p / 100)); }
    function handoff(dur = 1.1) {
      if (zoom || done) return;
      if (!m || !hasGsap) return dispose();
      layout(true); text(100);
      const { k, sw, x0, base, W } = lay;
      const cx = x0 + 2.5 * sw - (m.adv0 * k) / 2 + m.sx * k, cy = base - ((m.asc - m.desc) * k) / 2;
      const to = ((2 * Math.max(cx, W - cx)) / (m.sw * k)) * 1.2, s = { v: 1.06 };
      const apply = () => scaleAt(cx, cy, s.v);
      apply();
      zoom = gsap.timeline({ onComplete: dispose }).to(s, { v: to, duration: dur, ease: "power3.in", onUpdate: apply }, 0).to(wrap, { opacity: 0, duration: 0.2, ease: "none" }, dur - 0.12);
    }
    function dispose() { if (done) return; done = true; wrap.remove(); }
    return { ready, render, handoff, dispose };
  }

  let introDone = false;
  function revealHero(instant) {
    if (introDone) return;
    introDone = true;
    try { sessionStorage.setItem("site-intro-seen", "1"); } catch {}
    root.classList.remove("is-intro");
    heroGL = heroGL || buildHeroGL();
    const lines = hero.querySelectorAll(".hero__h1 .hero__h1-line > span, .hero__h1-ghost .hero__h1-line > span");
    const tag = hero.querySelectorAll(".hero__tagline .hero__h1-line > span");
    const h1 = hero.querySelector(".hero__h1"), tagline = hero.querySelector(".hero__tagline");
    if (!hasGsap || instant || reduce) {
      loader.style.display = "none";
      [...lines, ...tag].forEach((s) => { s.style.opacity = 1; });
      [h1, ghost, tagline].forEach((el) => window.sitePlayFill?.(el, true));
      [".hero__para", ".hero__cta-row", ".hero__slogan", ".hero__prod-card", ".hero__learn"].forEach((s) => { const el = hero.querySelector(s); el.style.opacity = 1; el.style.transform = "none"; });
      heroGL?.sweep();
      slogans();
      return;
    }
    const a0 = Math.max(0, HT.at), a1 = HT.at + HT.dur;
    const tagAt = Math.max(0, a1 - HT.copyLead - HT.groupEarly), tagEnd = tagAt + HT.dur * HT.tagDurK;
    const copyAt = Math.max(tagAt, tagEnd - HT.copyLead), st = HT.copyStagger;
    h1.dataset.fillDur = HT.dur; ghost.dataset.fillDur = HT.dur; tagline.dataset.fillDur = HT.dur * HT.tagDurK;
    gsap.timeline({ defaults: { ease: "power2.out" } })
      .to(loader, { opacity: 0, duration: 0.8, ease: "power2.inOut" }, 0)
      .set(loader, { display: "none" })
      .set(lines, { opacity: 1 }, a0)
      .call(() => { window.sitePlayFill?.(h1); window.sitePlayFill?.(ghost); }, null, a0)
      .set(tag, { opacity: 1 }, tagAt)
      .call(() => window.sitePlayFill?.(tagline), null, tagAt)
      .to(".hero__para", { opacity: 1, y: 0, duration: 0.7 }, copyAt)
      .to(".hero__cta-row", { opacity: 1, y: 0, duration: 0.7 }, copyAt + st)
      .to(".hero__prod-card", { opacity: 1, y: 0, duration: 0.7 }, copyAt + st * 2)
      .to(".hero__slogan", { opacity: 1, duration: 1.2 }, copyAt + st * 3)
      .to(".hero__learn", { opacity: 1, duration: 0.8 }, copyAt + st * 4)
      .call(() => { heroGL?.sweep(); slogans(); });
  }

  function intro() {
    if (root.classList.contains("is-seen") || reduce || !hasGsap) { revealHero(true); return; }
    makeBlocks();
    const num = makeNum();
    heroGL = buildHeroGL();
    let p = 0, finished = false;
    const t0 = performance.now(), LEN = 3200;
    const set = (v) => { const n = Math.max(0, Math.min(100, Math.round(v))); pctEl.textContent = n + "%"; barEl.style.width = n + "%"; hideBlocks(v); num.render(v); };
    setTimeout(() => skipBtn.classList.add("is-on"), 1200);
    const finish = (skipped) => {
      if (finished) return;
      finished = true;
      set(100);
      if (skipped) { for (let i = hidden, d = 0; i < blocks.length; i++, d += 28) { const el = blocks[i].el; setTimeout(() => { el.style.visibility = "hidden"; }, d); } hidden = blocks.length; }
      num.handoff(1.1);
      revealHero(false);
    };
    skipBtn.addEventListener("click", () => finish(true));
    num.ready.then(() => {
      const tick = (now) => {
        if (finished) return;
        const k = Math.min(1, (now - t0) / LEN);
        p = 100 * (1 - Math.pow(1 - k, 1.6));
        set(p);
        if (k >= 1) return finish(false);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* Four slogans — every 3s the current slogan vanishes in .28s and the next is stamped in scrambled over .7s */
  let slogansOn = false;
  function slogans() {
    if (slogansOn || !hasGsap || reduce) return;
    slogansOn = true;
    const items = [...hero.querySelectorAll(".hero__slogan-item")];
    const texts = items.map((i) => i.querySelector(".hero__slogan-text").textContent);
    gsap.set(items, { opacity: 0, y: 0 });
    gsap.set(items[0], { opacity: 1 });
    let i = 0;
    const next = () => {
      const out = items[i];
      i = (i + 1) % items.length;
      const inn = items[i], txt = inn.querySelector(".hero__slogan-text");
      gsap.to(out, { opacity: 0, duration: 0.28, ease: "power1.in" });
      gsap.delayedCall(0.28 * 0.7, () => { window.siteScramble.cancel(txt); txt.textContent = ""; gsap.set(inn, { opacity: 1 }); window.siteScramble.in(txt, texts[i], { duration: 0.7 }); });
      gsap.delayedCall(3, next);
    };
    gsap.delayedCall(3, next);
  }

  intro();

  if (!hasGsap) return;
  const mm = gsap.matchMedia();

  /* ────────── Court 3D — around a sock (our basic shape) in a pillar of light, seven photo cards are born in a spiral and orbit ────────── */
  const court = document.querySelector("[data-court]");
  const courtCanvas = document.querySelector("[data-court-canvas]");
  const vignette = document.querySelector("[data-court-vignette]");
  const caption = document.querySelector("[data-court-caption]");
  gsap.to(caption, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: court, start: "28% top", end: "40% top", scrub: true } });
  function buildCourt() {
    if (!T || reduce) { courtCanvas.style.visibility = "hidden"; caption.style.opacity = 1; caption.style.transform = "none"; return; }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas: courtCanvas, antialias: true, alpha: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    const scene = new T.Scene();
    const voidCol = threeColor("--site-court");
    scene.fog = new T.Fog(voidCol, 3, 9);
    const S = { sockY: 0.62, camX: 0.1, camY: 0.78, camZ: 1.3, fov: 42, lookY: -0.05 };
    const cam = new T.PerspectiveCamera(S.fov, 1, 0.05, 40);
    const small = () => !desktop.matches;
    const placeCam = (p) => {
      const z = small() ? 1.85 : S.camZ, y = small() ? 0.84 : S.camY;
      cam.position.set(S.camX, y + p * 0.05, z - p * 0.18);
      cam.lookAt(0, S.sockY + S.lookY, 0);
    };
    // Floor — draw plank grain on a canvas and repeat it, only below the light beam does it look wet and reflective
    const plank = document.createElement("canvas");
    plank.width = plank.height = 1024;
    const pc = plank.getContext("2d");
    const wood = rgbOf("--site-sand"), N = 42, step = 1024 / N;
    let seed = 20260802;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) {
      const k = 0.55 + rnd() * 0.15;
      pc.fillStyle = `rgb(${wood.map((v) => Math.round(v * 255 * k)).join(",")})`;
      pc.fillRect(i * step, 0, step + 1, 1024);
      pc.fillStyle = cssRgb("--site-ink", 0.3);
      pc.fillRect(i * step, 0, 1.2, 1024);
      for (let j = 0; j < 3 + Math.floor(rnd() * 4); j++) pc.fillRect(i * step, rnd() * 1024, step, 1.4);
    }
    const floorTex = new T.CanvasTexture(plank);
    floorTex.wrapS = floorTex.wrapT = T.RepeatWrapping;
    floorTex.repeat.set(4, 4);
    floorTex.colorSpace = T.SRGBColorSpace;
    const floor = new T.Mesh(new T.PlaneGeometry(16, 16), new T.MeshStandardMaterial({ map: floorTex, roughness: 0.34, metalness: 0 }));
    floor.material.color.setScalar(0.12);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    // Light — one spot dropping from above (shadow), warm front fill, dark hemisphere
    const spot = new T.SpotLight(threeColor("--site-peach"), 0, 0, 0.3, 0.9, 1.45);
    spot.position.set(0.15, 4.8, 0.1);
    spot.target.position.set(0, 0, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -0.0002;
    scene.add(spot, spot.target);
    scene.add(new T.HemisphereLight(threeColor("--site-terra-deep"), voidCol, 0.25));
    const fill = new T.DirectionalLight(threeColor("--site-cream"), 0.9);
    fill.position.set(-1.4, 2.2, 2.6);
    scene.add(fill);
    // Light pillar — an open cone plus fbm streaks, additive blending, with a flipped copy below the floor reflected
    const beamU = { uTime: { value: 0 }, uColor: { value: threeColor("--site-peach") }, uIntensity: { value: 0 } };
    const beamMat = new T.ShaderMaterial({
      transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, uniforms: beamU,
      vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uIntensity; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
        float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 3; i++){ s += a*n(p); p *= 2.13; a *= .5; } return s; }
        void main(){ vec3 v = normalize(cameraPosition - vW); float fac = pow(abs(dot(normalize(vN), v)), 1.6);
          float rays = .55 + .9 * fbm(vec2(vUv.x * 18., vUv.y * 1.5 - uTime * .05));
          float fall = smoothstep(0., .85, vUv.y) * (1. - smoothstep(.92, 1., vUv.y));
          gl_FragColor = vec4(uColor * fac * rays * fall * uIntensity, 1.); }`,
    });
    const beam = new T.Mesh(new T.CylinderGeometry(0.05, 0.95, 4.6, 64, 1, true), beamMat);
    beam.position.set(0, 2.3, 0);
    scene.add(beam);
    const beamMirror = beam.clone();
    beamMirror.material = beamMat.clone();
    beamMirror.material.uniforms = { uTime: beamU.uTime, uColor: beamU.uColor, uIntensity: { value: 0 } };
    beamMirror.scale.y = -1;
    beamMirror.position.y = -2.3;
    scene.add(beamMirror);
    // Sock — a tube bending from the leg tube at the heel and out to the instep, with slots for the cuff rib and endless loop pattern
    const sockMat = new T.MeshStandardMaterial({ color: threeColor("--site-sand"), roughness: 0.82, metalness: 0 });
    const sock = new T.Group();
    const path = new T.CatmullRomCurve3([new T.Vector3(0, 0.62, 0), new T.Vector3(0, 0.3, 0), new T.Vector3(0.01, 0.12, 0.02), new T.Vector3(0.06, 0.05, 0.12), new T.Vector3(0.1, 0.045, 0.3)]);
    const tube = new T.Mesh(new T.TubeGeometry(path, 80, 0.085, 32, false), sockMat);
    tube.castShadow = true;
    const cuff = new T.Mesh(new T.CylinderGeometry(0.092, 0.09, 0.12, 40, 1, true), sockMat);
    cuff.position.y = 0.58;
    const toe = new T.Mesh(new T.SphereGeometry(0.085, 32, 16), sockMat);
    toe.position.set(0.1, 0.045, 0.3);
    toe.scale.set(1, 0.85, 1.15);
    const heel = new T.Mesh(new T.SphereGeometry(0.088, 32, 16), sockMat);
    heel.position.set(0.005, 0.1, -0.005);
    sock.add(tube, cuff, toe, heel);
    sock.scale.setScalar(0.72);
    sock.position.y = 0;
    scene.add(sock);
    // Dust — 420 particles drift slowly inside the light beam
    const DUST = 420, dpos = new Float32Array(DUST * 3), dph = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      const a = rnd() * Math.PI * 2, y = 0.12 + rnd() * 4.1, r = Math.sqrt(rnd()) * (0.55 - 0.05 * y);
      dpos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
      dph[i] = rnd() * Math.PI * 2;
    }
    const dustGeo = new T.BufferGeometry();
    dustGeo.setAttribute("position", new T.BufferAttribute(dpos.slice(), 3));
    const dust = new T.Points(dustGeo, new T.PointsMaterial({ color: threeColor("--site-peach"), size: 0.006, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    scene.add(dust);
    // Seven cards — 3:2, spiral (radius .59, height 1.31, 1.5 turns), fluttering like flags as they pass
    const C = { count: 7, scale: 0.96, radius: 0.59, height: 1.31, base: -0.28, turns: 1.5, theta0: -Math.PI / 4, birth0: 0.07, birthSpan: 0.2, birthDur: 0.1 };
    const cardFx = { uFlut: { value: 0 }, uPhase: { value: 0 } };
    const labels = ["Court card 01 · socks side view", "Court card 02 · standing pose close-up", "Court card 03 · player breakthrough video", "Court card 04 · running legs", "Court card 05 · two people’s heels", "Court card 06 · player clip video", "Court card 07 · behind the court"];
    const cards = labels.map((lab, i) => {
      const cv = document.createElement("canvas");
      cv.width = 600; cv.height = 400;
      const c = cv.getContext("2d");
      const grd = c.createLinearGradient(0, 0, 600, 400);
      grd.addColorStop(0, cssRgb("--site-court-2"));
      grd.addColorStop(1, cssRgb("--site-terra-deep", 0.55));
      c.fillStyle = grd; c.fillRect(0, 0, 600, 400);
      c.strokeStyle = cssRgb("--site-cream", 0.25); c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(600, 400); c.moveTo(600, 0); c.lineTo(0, 400); c.stroke();
      c.strokeRect(1, 1, 598, 398);
      c.fillStyle = cssRgb("--site-cream", 0.85);
      c.font = `500 26px ${fontVar("--kf-font-mono")}`;
      c.textAlign = "center";
      c.fillText(lab, 300, 205);
      c.font = `500 18px ${fontVar("--kf-font-mono")}`;
      c.fillText(i === 2 || i === 5 ? "Landscape 3:2 · looping video" : "Landscape 3:2 · warm side light", 300, 240);
      const tex = new T.CanvasTexture(cv);
      tex.colorSpace = T.SRGBColorSpace;
      const mat = new T.MeshStandardMaterial({ map: tex, side: T.DoubleSide, roughness: 0.6, transparent: true, opacity: 0 });
      mat.onBeforeCompile = (sh) => {
        sh.uniforms.uFlut = cardFx.uFlut; sh.uniforms.uPhase = cardFx.uPhase;
        sh.vertexShader = "uniform float uFlut; uniform float uPhase;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
          { vec2 q = uv * 2. - 1.; float s = q.x; float env = smoothstep(-1., .2, s) * (1. - .35 * q.y * q.y);
            float w = sin(5.5 * s - uPhase + .9 * q.y) + .35 * sin(10.5 * s + 2.6 * q.y - uPhase * 1.63);
            transformed.z += uFlut * .030 * env * w; }`);
      };
      const w = 0.3 * C.scale, mesh = new T.Mesh(new T.PlaneGeometry(w, w / 1.5, 24, 8), mat);
      scene.add(mesh);
      return { mesh, i };
    });
    // Section heading — instead of a DOM title, a text plate inside the stage (original HEAD: two lines · 5 from the camera · .46 of screen width · .27 up). Each line’s color fill catches the stage light.
    const titleEl = court.querySelector(".court__title");
    const words = titleEl.textContent.trim().split(/\s+/), cut = Math.max(1, Math.round(words.length / 2) - 1);
    const headLines = [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
    const hc = document.createElement("canvas");
    hc.width = 2048; hc.height = 640;
    const hx = hc.getContext("2d");
    const headFont = fontVar("--kf-font-display");
    const headTex = new T.CanvasTexture(hc);
    const drawHead = () => {
      let fsz = 300;
      hx.clearRect(0, 0, 2048, 640);
      hx.font = `400 ${fsz}px ${headFont}`;
      const widest = Math.max(...headLines.map((l) => hx.measureText(l.toUpperCase()).width));
      fsz = Math.min(300, (fsz * 1960) / widest);
      hx.font = `400 ${fsz}px ${headFont}`;
      hx.textAlign = "center";
      hx.textBaseline = "alphabetic";
      hx.fillStyle = cssRgb("--site-cream");
      const b = headLines.map((l, i) => { const w = hx.measureText(l.toUpperCase()).width; hx.fillText(l.toUpperCase(), 1024, 300 + i * fsz * 0.9); return [(1024 - w / 2) / 2048, (1024 + w / 2) / 2048]; });
      headTex.needsUpdate = true;
      return b;
    };
    const bounds = drawHead();
    const headU = {
      uMap: { value: headTex }, uP1: { value: 0 }, uP2: { value: 0 }, uB1: { value: new T.Vector2(...bounds[0]) }, uB2: { value: new T.Vector2(...bounds[1]) },
      uFinal: { value: new T.Vector3(...rgbOf("--site-sand")) }, uEdge: { value: new T.Vector3(...rgbOf("--site-terra")) }, uUnread: { value: new T.Vector3(...rgbOf("--site-white-dim")) }, uLight: { value: 0 },
    };
    const head = new T.Mesh(new T.PlaneGeometry(1, 640 / 2048), new T.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: headU,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform sampler2D uMap; uniform float uP1, uP2, uLight; uniform vec2 uB1, uB2; uniform vec3 uFinal, uEdge, uUnread; varying vec2 vUv;
        vec3 fillCol(float u, float p, out float a){ float s = (u + 2.5 * (1. - p)) / 3.5;
          if (s < .3) { a = 1.; return uFinal; }
          if (s < .4) { a = 1.; return mix(uFinal, uEdge, (s - .3) / .1); }
          if (s < .5) { a = mix(1., .22, (s - .4) / .1); return mix(uEdge, uUnread, (s - .4) / .1); }
          a = .22; return uUnread; }
        void main(){ float m = texture2D(uMap, vUv).a; if (m < .01) discard;
          bool top = vUv.y > .53; vec2 b = top ? uB1 : uB2; float p = top ? uP1 : uP2; float a;
          vec3 c = fillCol(clamp((vUv.x - b.x) / max(.001, b.y - b.x), 0., 1.), p, a);
          float glow = exp(-pow(vUv.x - .5, 2.) / .08);
          c *= .78 + uLight * .85 * glow;
          gl_FragColor = vec4(c, m * a); }`,
    }));
    cam.add(head);
    scene.add(cam);
    court.classList.add("court--glhead");
    document.fonts?.ready.then(() => { const b = drawHead(); headU.uB1.value.set(...b[0]); headU.uB2.value.set(...b[1]); });
    const placeHead = () => { const h = 2 * 5 * Math.tan((cam.fov * Math.PI) / 360), w = h * cam.aspect, k = small() ? 0.86 : 0.46; head.scale.setScalar(w * k); head.position.set(0, 0.27 * (h / 2), -5); };
    ScrollTrigger.create({ trigger: court, start: "top top", once: true, onEnter: () => gsap.timeline().to(headU.uP1, { value: 1, duration: 1.4, ease: "power1.inOut" }, 0.35).to(headU.uP2, { value: 1, duration: 1.4, ease: "power1.inOut" }, 0.47) });
    // Precompile — so it doesn’t stall on the first scroll
    placeCam(0);
    renderer.compile(scene, cam);
    const enter = { p: 0 }, leave = { p: 0 };
    gsap.to(enter, { p: 1, ease: "none", scrollTrigger: { trigger: court, start: "top bottom", end: "bottom bottom", scrub: 0.6 } });
    gsap.fromTo(leave, { p: 0 }, { p: () => 1 + innerHeight / Math.max(1, court.getBoundingClientRect().height), ease: "none", scrollTrigger: { trigger: court, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
    let on = false, raf = 0, prevP = 0, t0 = performance.now();
    const size = () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); placeHead(); };
    size();
    addEventListener("resize", size);
    ScrollTrigger.create({ trigger: court, start: "top bottom", end: "bottom top", onToggle: (st) => { on = st.isActive; courtCanvas.style.visibility = on ? "visible" : "hidden"; if (on && !raf) raf = requestAnimationFrame(frame); } });
    function frame(now) {
      raf = 0;
      if (!on) return;
      const t = (now - t0) / 1000, p = enter.p, lp = leave.p;
      const land = clamp(innerHeight / Math.max(1, court.offsetHeight), 0.1, 0.75), q = land + (1 - land) * p;
      const lightUp = span(q, 0.05, 0.4), out = span(lp, 0.86, 1);
      beamU.uIntensity.value = lightUp * 2.6 * (1 - out);
      beamMirror.material.uniforms.uIntensity.value = beamU.uIntensity.value * 0.38;
      beamU.uTime.value = t;
      spot.intensity = 18 * lightUp * (1 - out);
      dust.material.opacity = 0.9 * lightUp * (1 - out);
      const pos = dustGeo.attributes.position.array;
      for (let i = 0; i < DUST; i++) {
        const b = i * 3, ph = dph[i];
        pos[b] = dpos[b] + Math.sin(t * 0.11 + ph) * 0.016;
        pos[b + 1] = dpos[b + 1] + Math.sin(t * 0.07 + ph * 1.7) * 0.03;
        pos[b + 2] = dpos[b + 2] + Math.cos(t * 0.09 + ph * 0.6) * 0.016;
      }
      dustGeo.attributes.position.needsUpdate = true;
      sock.rotation.y = -0.6 + q * 1.2 + Math.sin(t * 0.4) * 0.03;
      const vel = q - prevP;
      prevP = q;
      cardFx.uFlut.value += (clamp(Math.abs(vel) * 220, 0, 1) - cardFx.uFlut.value) * 0.1;
      cardFx.uPhase.value = t * 6;
      cards.forEach(({ mesh, i }) => {
        const k = i / (C.count - 1);
        const b0 = C.birth0 + k * C.birthSpan, born = span(q, b0, b0 + C.birthDur);
        const theta = C.theta0 + k * C.turns * Math.PI * 2 + q * Math.PI * 1.1;
        const r = C.radius * (0.6 + 0.4 * born);
        mesh.position.set(Math.cos(theta) * r, S.sockY + C.base + k * C.height * (0.85 + 0.15 * q), Math.sin(theta) * r - 0.05);
        mesh.lookAt(cam.position.x * 0.4, mesh.position.y, cam.position.z);
        mesh.scale.setScalar(0.4 + 0.6 * born);
        mesh.material.opacity = born * (1 - out);
        mesh.visible = born > 0.001;
      });
      placeCam(q);
      headU.uLight.value = lightUp;
      head.visible = out < 1;
      vignette.style.opacity = (lightUp * (1 - out)).toFixed(3);
      courtCanvas.style.opacity = (1 - out).toFixed(3);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
  }
  buildCourt();

  /* Four technologies — the band pinned to the screen moves horizontally (scrub .6), panels lag by 34vh × distance from center, photos the opposite */
  const qq = document.querySelector("[data-qq]");
  const strip = qq.querySelector("[data-strip]");
  const panels = [...qq.querySelectorAll("[data-panel]")];
  const pimgs = [...qq.querySelectorAll("[data-pimg]")];
  const trxCfg = { closeVh: 1, leadVh: 0.6, tailVh: 0.45, stag: 0.58 };
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", small: "(max-width: 991.98px)" }, (ctx) => {
    const { small } = ctx.conditions;
    const lag = () => innerHeight * 0.34, follow = 0.11, off = panels.map(() => 0);
    const titles = [...qq.querySelectorAll("[data-qq-title]")].map((el) => ({ el, rows: [...el.querySelectorAll(".cf-seg")], bridge: el.classList.contains("qq__bridge-title"), key: "", played: false }));
    const TT = { target: 0.23, slide: 0.34, stag: 0.5, power: 3 };
    const dist = () => Math.max(0, strip.scrollWidth - innerWidth);
    const extra = () => innerHeight * (0.5 + trxCfg.closeVh);
    let ease = (t) => t;
    const calcEase = () => { const P = (innerHeight * trxCfg.closeVh) / (dist() + extra()); ease = (z) => Math.min(1, z / (1 - P)); };
    calcEase();
    const tw = gsap.to(strip, { x: () => -dist(), ease: (t) => ease(t), scrollTrigger: { trigger: qq, start: "top top", end: () => "+=" + (dist() + extra()), pin: "[data-stage]", pinSpacing: true, scrub: 0.6, invalidateOnRefresh: true, onRefresh: calcEase } });
    let seen = false, raf = 0, live = true;
    const io = new IntersectionObserver((es) => { live = es[0].isIntersecting; if (live && !raf) raf = requestAnimationFrame(tick); }, { rootMargin: "25% 0px" });
    io.observe(qq);
    function tick() {
      raf = 0;
      if (!live) return;
      const mid = innerWidth / 2;
      seen = seen || qq.getBoundingClientRect().top < innerHeight * 0.85;
      panels.forEach((pn, i) => {
        const r = pn.getBoundingClientRect(), d = clamp((r.left + r.width / 2 - mid) / innerWidth, -1.2, 1.2);
        off[i] += (d * lag() - off[i]) * follow;
        gsap.set(pn, { y: off[i] });
        const z = off[i] / lag();
        gsap.set(pimgs[i], { xPercent: z * -5, yPercent: z * -4 });
        if (seen) {
          const inView = r.left < innerWidth * 0.7;
          if (inView && !pn.classList.contains("is-in")) pn.classList.add("is-in");
          else if (!inView && r.left > innerWidth + 20 && pn.classList.contains("is-in")) pn.classList.remove("is-in");
        }
        pn.classList.toggle("is-live", r.right > innerWidth * 0.08);
      });
      // Title lines — entering from the right of the screen, lower lines come later, sliding into place with a cubic (power 3) curve
      titles.forEach((tt) => {
        const r = tt.el.getBoundingClientRect();
        if (!r.width) return;
        const goal = tt.bridge ? (innerWidth - r.width) / 2 : small ? 20 : innerWidth * TT.target;
        const k = clamp((innerWidth - r.left) / Math.max(1, innerWidth - goal));
        const key = k.toFixed(4);
        if (key !== tt.key) {
          tt.key = key;
          const n = tt.rows.length;
          tt.rows.forEach((row, j) => {
            const s0 = (j / Math.max(1, n)) * TT.stag, kk = clamp((k - s0) / (1 - s0));
            row.style.transform = `translateX(${((1 - Math.pow(kk, 1 / TT.power)) * innerWidth * TT.slide).toFixed(1)}px)`;
          });
        }
        if (!tt.played && k > 0.35) { tt.played = true; window.sitePlayFill?.(tt.el); }
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); tw.scrollTrigger?.kill(); tw.kill(); };
  });

  /* ────────── Sawtooth band transition — when the band section ends, 14 rows cover alternately from left and right (.58 interval), and when the team section attaches they clear in reverse ────────── */
  const trx = document.getElementById("trx");
  const team = document.getElementById("knit");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const rows = [];
    for (let i = 0; i < 14; i++) { const r = document.createElement("i"); r.className = "trx__row"; r.style.top = (i * 100) / 14 + "vh"; trx.appendChild(r); rows.push(r); }
    const n = rows.length;
    let edges = null;
    const qqST = () => ScrollTrigger.getAll().find((s) => s.pin?.classList?.contains("qq__stage"));
    const tmST = () => ScrollTrigger.getAll().find((s) => s.pin === team);
    const measure = () => { const a = qqST(), b = tmST(); if (!a || !b) { edges = null; return; } const H = innerHeight; edges = { a: a.end - H * trxCfg.closeVh, b: a.end, c: b.start - H * trxCfg.leadVh, d: b.start + H * trxCfg.tailVh }; };
    const R = (x, k, s) => clamp((x - (k / (n - 1)) * (1 - s)) / s);
    let last = -1;
    const tick = () => {
      if (!edges) return;
      const y = scrollY;
      let u;
      if (y <= edges.a) u = 0; else if (y < edges.b) u = ((y - edges.a) / (edges.b - edges.a)) * 0.5; else if (y < edges.c) u = 0.5; else if (y < edges.d) u = 0.5 + ((y - edges.c) / (edges.d - edges.c)) * 0.5; else u = 1;
      if (u === last) return;
      last = u;
      const a = clamp(u / 0.5), b = clamp((u - 0.5) / 0.5);
      rows.forEach((r, k) => { const dir = k % 2 ? 1 : -1, x = (1 - R(a, k, trxCfg.stag)) * 110 * dir - R(b, n - 1 - k, trxCfg.stag) * 110 * dir; r.style.transform = `translateX(${x.toFixed(2)}%)`; });
    };
    ScrollTrigger.addEventListener("refresh", measure);
    gsap.ticker.add(tick);
    requestAnimationFrame(() => { measure(); tick(); });
    return () => { gsap.ticker.remove(tick); ScrollTrigger.removeEventListener("refresh", measure); rows.forEach((r) => r.remove()); };
  });

  /* ────────── Name embroidery — the scene scaled 240% (scrub .8) approaches the ankle, vertical names fly in leaving only initials, then are embroidered stitch by stitch ────────── */
  (() => {
    const scene = team;
    const IMG_W = 2400, IMG_H = 1600, AX = 1493, AY = 893, ROT = 90, STITCH_H = 105, SPINE_K = 1.48, START_X = 0.95;
    const NAME = scene.querySelector(".tbr-scene__spine").textContent.trim();
    const initials = (() => { const w = NAME.split(/\s+/).filter(Boolean); return w.length > 1 ? w[0][0] + w[w.length - 1][0] : (w[0] || "X")[0]; })();
    const K = { fillAt: 0.06, drift: -4, bgScale: 1.22, frontScale: 1.32, leadDrop: 48, leadArm: 44, leadIn: 52, cardAt: 0.44, cardAtM: 0.6, zoneXM: 0.55, zoneYM: 0.42 };
    const views = [...scene.querySelectorAll(".tbr-scene__view")];
    const bg = scene.querySelector(".tbr-scene__view--bg"), front = scene.querySelector(".tbr-scene__view--front");
    const stitch = scene.querySelector(".tbr-scene__stitch"), sx = stitch.getContext("2d");
    const fx = scene.querySelector(".tbr-scene__stitch-fx"), fxc = fx.getContext("2d");
    const spine = scene.querySelector(".tbr-scene__spine");
    const word = scene.querySelector(".tbr-scene__word");
    const card = scene.querySelector(".tbr-scene__card");
    const leader = scene.querySelector(".tbr-scene__leader"), lpath = leader.querySelector("path"), ldot = leader.querySelector("circle");
    const small = () => !desktop.matches;
    const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const hashf = (n) => (((n + 1) * 2654435761) % 2147483647 % 1000) / 1000;
    views.forEach((v) => { v.style.transformOrigin = `${((AX / IMG_W) * 100).toFixed(2)}% ${((AY / IMG_H) * 100).toFixed(2)}%`; });
    let I = 1, ox = 0, oy = 0, stitches = [], letters = [], spineSize = 16, totalW = 0, keepW = 1, fold = [];
    const thread = cssRgb("--site-ink", 0.98), threadShade = cssRgb("--site-ink", 0.18), sheen = cssRgb("--site-cream", 0.3), needle = cssRgb("--site-cream", 0.95);
    function layout() {
      const W = scene.clientWidth, H = scene.clientHeight;
      I = Math.max(W / IMG_W, H / IMG_H);
      if (small()) I = Math.max(I, (H * (1 - K.zoneYM)) / (IMG_H - AY));
      const w = IMG_W * I, h = IMG_H * I;
      ox = (W - w) / 2; oy = (H - h) / 2;
      if (small()) { ox = Math.min(0, Math.max(W - w, W * K.zoneXM - AX * I)); oy = Math.min(0, Math.max(H - h, H * K.zoneYM - AY * I)); }
      views.forEach((v) => Object.assign(v.style, { width: w + "px", height: h + "px", left: ox + "px", top: oy + "px" }));
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      stitch.width = fx.width = Math.round(w * dpr);
      stitch.height = fx.height = Math.round(h * dpr);
      sx.setTransform(dpr * I, 0, 0, dpr * I, 0, 0);
      fxc.setTransform(dpr * I, 0, 0, dpr * I, 0, 0);
      buildSpine(); buildStitches(); placeLeader(); draw();
    }
    // Heading letters are drawn on a large canvas and swept in vertical columns to form a stitch list — rotated 90° and placed at the ankle
    function buildStitches() {
      const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true });
      const fam = fontVar("--kf-font-sans");
      x.font = `700 260px ${fam}`;
      const tw = Math.max(1, x.measureText(initials).width);
      c.width = Math.ceil(tw) + 80; c.height = Math.ceil(260 * 1.4);
      x.font = `700 260px ${fam}`;
      x.fillStyle = cssRgb("--site-cream");
      x.fillText(initials, 40, 260);
      const B = STITCH_H / tw, colStep = Math.max(1, 1.6 / B), maxRun = Math.max(2, 9 / B), thick = 1.3 / B;
      const d = x.getImageData(0, 0, c.width, c.height).data, on = (px, py) => d[((py | 0) * c.width + (px | 0)) * 4 + 3] > 120;
      const segs = [];
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let px = 0; px < c.width; px += colStep) {
        let py = 0;
        while (py < c.height) {
          if (!on(px, py)) { py++; continue; }
          const s = py;
          while (py < c.height && on(px, py)) py++;
          const len = py - s, parts = Math.max(1, Math.ceil(len / maxRun)), each = len / parts;
          for (let k = 0; k < parts; k++) segs.push([px, s + k * each - (k > 0 ? each * 0.12 : 0), px + thick, s + (k + 1) * each]);
          x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, s); y1 = Math.max(y1, py);
        }
      }
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, a = (ROT * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
      const map = (px, py) => { const X = (px - mx) * B, Y = (py - my) * B; return [AX + X * ca - Y * sa, AY + X * sa + Y * ca]; };
      stitches = segs.map((s, i) => { const jx = hashf(i + 331) - 0.5, jy = hashf(i + 733) - 0.5, [a0, b0] = map(s[0], s[1]), [a1, b1] = map(s[2], s[3]); return { x0: a0 + jx, y0: b0 + jy, x1: a1 + jx, y1: b1 + jy, sheen: hashf(i + 991) > 0.55 }; });
    }
    function drawStitches(t) {
      const n = stitches.length;
      if (!n || t <= 0) return;
      sx.lineCap = fxc.lineCap = "round";
      const f = clamp(t) * n, full = Math.floor(f), part = f - full;
      let tip = null;
      const one = (s, k) => {
        const ex = s.x0 + (s.x1 - s.x0) * k, ey = s.y0 + (s.y1 - s.y0) * k;
        sx.strokeStyle = threadShade; sx.lineWidth = 2.2; sx.beginPath(); sx.moveTo(s.x0 + 0.7, s.y0 + 0.9); sx.lineTo(ex + 0.7, ey + 0.9); sx.stroke();
        sx.strokeStyle = thread; sx.lineWidth = 2.1; sx.beginPath(); sx.moveTo(s.x0, s.y0); sx.lineTo(ex, ey); sx.stroke();
        if (s.sheen) { fxc.strokeStyle = sheen; fxc.lineWidth = 0.55; fxc.beginPath(); fxc.moveTo(s.x0 + 0.5, s.y0 + 0.3); fxc.lineTo(ex + 0.5, ey + 0.3); fxc.stroke(); }
        return [ex, ey];
      };
      for (let i = 0; i < full; i++) tip = one(stitches[i], 1);
      if (full < n && part > 0) tip = one(stitches[full], part);
      if (t < 1 && tip) { fxc.fillStyle = needle; fxc.beginPath(); fxc.arc(tip[0], tip[1], 2.1, 0, Math.PI * 2); fxc.fill(); }
    }
    function buildSpine() {
      spineSize = scene.clientWidth * 0.062 * SPINE_K;
      spine.style.fontSize = spineSize + "px";
      spine.textContent = "";
      letters = [...NAME].map((ch) => { const s = document.createElement("span"); s.textContent = ch === " " ? " " : ch; spine.appendChild(s); return { el: s, ch }; });
      letters.forEach((l) => { l.w = l.el.offsetWidth; l.el.style.width = l.w + "px"; });
      totalW = letters.reduce((a, l) => a + l.w, 0);
      const sp = NAME.lastIndexOf(" "), keepA = 0, keepB = sp >= 0 ? sp + 1 : -1;
      keepW = letters[keepA].w + (keepB >= 0 ? letters[keepB].w + spineSize * 0.04 : 0);
      fold = letters.map((_, i) => i).filter((i) => i !== keepA && i !== keepB).reverse();
    }
    function moveSpine(p) {
      if (!letters.length) return;
      const W = scene.clientWidth, H = scene.clientHeight, from = { x: W * START_X, y: H * 0.5 };
      if (small()) { const pad = parseFloat(getComputedStyle(root).getPropertyValue("--size-font")) * 1.25 || 20; from.x = W - pad - spineSize / 2; from.y = H - Math.max(0, H - innerHeight) - pad - totalW / 2; }
      const tx = ox + AX * I, ty = oy + AY * I, e = io3(span(p, 0.18, 0.72));
      const x = lerp(from.x, tx, e), y = lerp(from.y, ty, e);
      const s = lerp(1, (STITCH_H * I * K.frontScale) / Math.max(1, keepW), Math.pow(span(p, 0.3, 0.78), 3));
      fold.forEach((idx, j) => { const a = 0.3 + j * (0.42 / Math.max(1, fold.length)), k = io3(span(p, a, a + 0.14)), l = letters[idx]; l.el.style.width = l.w * (1 - k) + "px"; l.el.style.opacity = 1 - k; });
      spine.style.transform = `translate(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%)) rotate(${ROT}deg) scale(${s.toFixed(4)})`;
      spine.style.opacity = 1 - span(p, 0.8, 0.9);
    }
    const prog = { p: 0 };
    function draw() {
      sx.save(); sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, stitch.width, stitch.height); sx.restore();
      fxc.save(); fxc.setTransform(1, 0, 0, 1, 0, 0); fxc.clearRect(0, 0, fx.width, fx.height); fxc.restore();
      moveSpine(prog.p);
      drawStitches(span(prog.p, 0.74, 0.98));
    }
    let master = null, cardTl = null;
    function placeLeader() {
      const g = scene.getBoundingClientRect(), cr = card.getBoundingClientRect(), fr = front.getBoundingClientRect();
      const ax = fr.left - g.left + (AX / IMG_W) * fr.width, ay = fr.top - g.top + (AY / IMG_H) * fr.height;
      const cx = cr.left - g.left, cy = cr.bottom - g.top - K.leadDrop, arm = cx - K.leadArm, inX = ax + K.leadIn;
      leader.setAttribute("viewBox", `0 0 ${Math.round(g.width)} ${Math.round(g.height)}`);
      leader.style.cssText = `left:0;top:0;width:${Math.round(g.width)}px;height:${Math.round(g.height)}px`;
      if (small()) {
        const x = Math.min(cr.right - g.left - 14, Math.max(cr.left - g.left + 14, ax)), top = cr.top - g.top, end = Math.min(top - 12, ay + (STITCH_H * I * K.frontScale) / 2 + 12);
        lpath.setAttribute("d", `M ${x.toFixed(1)} ${top.toFixed(1)} L ${x.toFixed(1)} ${end.toFixed(1)}`);
        ldot.setAttribute("cx", x.toFixed(1)); ldot.setAttribute("cy", end.toFixed(1));
      } else {
        lpath.setAttribute("d", inX < arm ? `M ${cx} ${cy} L ${arm} ${cy} L ${arm} ${ay.toFixed(1)} L ${inX.toFixed(1)} ${ay.toFixed(1)}` : `M ${cx} ${cy} L ${arm} ${cy} L ${ax.toFixed(1)} ${ay.toFixed(1)}`);
        ldot.setAttribute("cx", (inX < arm ? inX : ax).toFixed(1)); ldot.setAttribute("cy", ay.toFixed(1));
      }
      const len = lpath.getTotalLength();
      gsap.set(lpath, { strokeDasharray: len });
      if (!cardTl || cardTl.progress() === 0) gsap.set(lpath, { strokeDashoffset: len });
      if (master) { const q = master.progress(); master.progress(0, true).invalidate().progress(q, true); }
    }
    function cardIn() {
      return gsap.timeline()
        .fromTo(scene.querySelectorAll(".tbr-scene__corner"), { scale: 0 }, { scale: 1, duration: 0.05, stagger: 0.012, ease: "back.out(3)" }, 0)
        .fromTo(scene.querySelectorAll(".tbr-scene__edge"), { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 0.07, stagger: 0.015, ease: "power2.inOut" }, 0.04)
        .fromTo(scene.querySelector(".tbr-scene__panel"), { clipPath: "inset(0 100% 100% 0)" }, { clipPath: "inset(0 0% 0% 0)", duration: 0.1, ease: "power3.inOut" }, 0.08)
        .fromTo(scene.querySelectorAll(".tbr-scene__h, .tbr-scene__p, .tbr-scene__cta"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.07, stagger: 0.015 }, 0.14)
        .fromTo(lpath, { strokeDashoffset: () => lpath.getTotalLength() }, { strokeDashoffset: 0, duration: 0.12, ease: "power2.inOut" }, 0.1)
        .fromTo(ldot, { scale: 0, transformOrigin: "center" }, { scale: 1, duration: 0.05, ease: "back.out(3)" }, 0.2);
    }
    master = gsap.timeline({ paused: true });
    let filled = false;
    master.eventCallback("onUpdate", () => { if (!filled && master.progress() >= K.fillAt) { filled = true; window.sitePlayFill?.(word); } });
    master.to(prog, { p: 1, duration: 1, ease: "none", onUpdate: draw }, 0)
      .to(word, { y: () => K.drift + "vh", duration: 0.66, ease: "none" }, 0.3)
      .fromTo(bg, { scale: 1.04 }, { scale: () => K.bgScale, duration: 0.72, ease: "power1.inOut" }, 0.06)
      .fromTo(front, { scale: 1.04 }, { scale: () => K.frontScale, duration: 0.72, ease: "power1.inOut" }, 0.06);
    cardTl = cardIn();
    master.add(cardTl, small() ? K.cardAtM : K.cardAt);
    layout();
    addEventListener("resize", layout);
    ScrollTrigger.addEventListener("refresh", placeLeader);
    document.fonts?.ready.then(layout);
    if (reduce) { master.progress(1).pause(); draw(); window.sitePlayFill?.(word, true); return; }
    ScrollTrigger.create({ trigger: scene, start: "top top", end: "+=240%", pin: true, scrub: 0.8, animation: master });
  })();

  /* ────────── Reviews — three rows fill in at .16 intervals, and each card runs corner dots (back.out 3) → border (.6) → video opening from the center (.9 power3.inOut) → text ────────── */
  (() => {
    const ttl = document.querySelector(".ttl");
    const parts = (k) => {
      const c = document.querySelector(".ttl__card--" + k);
      return { video: c.querySelector(".ttl__video"), dots: c.querySelectorAll(".hud2__dot"), h: c.querySelectorAll(".hud2__edge--t, .hud2__edge--b"), v: c.querySelectorAll(".hud2__edge--l, .hud2__edge--r"), read: [...c.querySelectorAll(".hud2__top, .hud2__bot"), c.querySelector(".ttl__credit")] };
    };
    const keys = ["west", "gaffney"];
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      keys.forEach((k) => { const a = parts(k); gsap.set(a.video, { clipPath: "inset(50% 50% 50% 50%)" }); gsap.set(a.dots, { scale: 0 }); gsap.set(a.h, { scaleX: 0 }); gsap.set(a.v, { scaleY: 0 }); gsap.set(a.read, { opacity: 0 }); });
      const show = (k, at) => {
        const a = parts(k);
        gsap.timeline()
          .to(a.dots, { scale: 1, duration: 0.4, ease: "back.out(3)", stagger: 0.04 }, at)
          .to(a.h, { scaleX: 1, duration: 0.6, ease: "power2.inOut", stagger: 0.06 }, at + 0.2)
          .to(a.v, { scaleY: 1, duration: 0.6, ease: "power2.inOut", stagger: 0.06 }, at + 0.2)
          .to(a.video, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut" }, at + 0.35)
          .to(a.read, { opacity: 1, duration: 0.5, stagger: 0.08 }, at + 1.15);
      };
      ScrollTrigger.create({ trigger: ttl, start: "top 62%", once: true, onEnter: () => {
        document.querySelectorAll(".ttl__line").forEach((l, i) => gsap.delayedCall(i * 0.16, () => window.sitePlayFill?.(l)));
        show("west", 0); show("gaffney", 0.35);
      } });
      gsap.to(".ttl__card--west", { y: () => -innerHeight * 0.07, ease: "none", scrollTrigger: { trigger: ttl, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
      gsap.to(".ttl__card--gaffney", { y: () => innerHeight * 0.07, ease: "none", scrollTrigger: { trigger: ttl, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
    });
    if (reduce) document.querySelectorAll(".ttl__line").forEach((l) => window.sitePlayFill?.(l, true));
    // Video time display — down to 30fps frames
    const tcs = [...document.querySelectorAll("[data-tc]")], tStart = performance.now();
    setInterval(() => { const s = ((performance.now() - tStart) / 1000) % 14; tcs.forEach((el, i) => { const t = (s + i * 3.1) % 14; el.textContent = `00:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(Math.floor((t % 1) * 30)).padStart(2, "0")}`; }); }, 120);
    // Cursor over a card — the ”Play” pill follows right away (.6 → 1)
    const pill = document.getElementById("ttl-cursor");
    if (desktop.matches) {
      addEventListener("mousemove", (e) => { pill.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(${pill.classList.contains("is-on") ? 1 : 0.6})`; });
      document.querySelectorAll(".ttl__card").forEach((c) => { c.addEventListener("mouseenter", () => pill.classList.add("is-on")); c.addEventListener("mouseleave", () => pill.classList.remove("is-on")); });
    }
    // Enlarge view — press for a full video box, time passes and the caption position changes
    const lb = document.getElementById("lb"), lbName = document.getElementById("lbName"), lbTime = document.getElementById("lbTime"), lbCap = document.getElementById("lbCap");
    let timer = 0, opener = null;
    const caps = ["Transcribed captions scroll past here one line at a time.", "Second caption line — short, just as spoken.", "Adding the third caption line."];
    const open = (c) => {
      opener = c;
      lbName.innerHTML = `<b>${c.querySelector(".ttl__credit b").textContent}</b> — Team`;
      lb.classList.add("is-open");
      window.lenis?.stop();
      const t0 = performance.now();
      clearInterval(timer);
      timer = setInterval(() => { const s = Math.min(30, (performance.now() - t0) / 1000); lbTime.textContent = `00:${String(Math.floor(s)).padStart(2, "0")} / 00:30`; lbCap.textContent = caps[Math.floor(s / 4) % caps.length]; }, 200);
      document.getElementById("lbClose").focus();
    };
    const close = () => { lb.classList.remove("is-open"); clearInterval(timer); window.lenis?.start(); opener?.focus(); };
    document.querySelectorAll(".ttl__card").forEach((c) => { c.addEventListener("click", () => open(c)); c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(c); } }); });
    document.getElementById("lbClose").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("is-open")) close(); });
  })();

  /* ────────── Light mist — as the testimonials section ends, a bright mist column fills up from below and leads into the closing section (light panel) ────────── */
  const anchor = document.querySelector("[data-haze-anchor]");
  const finale = document.getElementById("finale");
  const hazeProgress = () => { const b = anchor.getBoundingClientRect().bottom, h = finale.getBoundingClientRect().bottom - b; return clamp((innerHeight - b) / Math.max(1, h)); };
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const cv = document.querySelector("[data-fhaze]"), cx = cv.getContext("2d");
    const light = rgbOf("--kf-contrast-bg"), warm = rgbOf("--site-peach");
    const col = (c, a) => `rgba(${c.map((v) => Math.round(v * 255)).join(",")},${a})`;
    let W = 0, H = 0;
    const size = () => { const d = Math.min(devicePixelRatio, 1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); };
    size();
    addEventListener("resize", size);
    const shafts = Array.from({ length: 22 }, (_, i) => ({ x: (i + 0.5) / 22 + (hashf2(i) - 0.5) * 0.04, w: 0.02 + hashf2(i + 40) * 0.05, h: 0.35 + hashf2(i + 80) * 0.65 }));
    function hashf2(n) { return (Math.sin(n * 91.7) * 43758.5453) % 1 * 0.5 + 0.5; }
    function paint(p) {
      cx.clearRect(0, 0, W, H);
      if (p <= 0) return;
      const x = clamp((p - 0.05) / 0.75), u = x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2, k = x * 0.8 + u * 0.2;
      const edge = Math.min(anchor.getBoundingClientRect().bottom + H * 0.08, H * (1.05 - k * 1.25));
      const g = cx.createLinearGradient(0, edge - H * 0.35, 0, edge + H * 0.25);
      g.addColorStop(0, col(light, 0)); g.addColorStop(0.55, col(light, 0.75)); g.addColorStop(1, col(light, 1));
      cx.fillStyle = g;
      cx.fillRect(0, edge - H * 0.35, W, H * 2);
      shafts.forEach((s) => {
        const top = edge - H * s.h * (0.6 + k), sg = cx.createLinearGradient(0, top, 0, edge);
        sg.addColorStop(0, col(warm, 0)); sg.addColorStop(1, col(light, 0.55 * Math.min(1, k * 2)));
        cx.fillStyle = sg;
        cx.fillRect(s.x * W - (s.w * W) / 2, top, s.w * W, edge - top);
      });
    }
    let shown = false;
    const st = ScrollTrigger.create({ trigger: anchor, start: "bottom bottom", endTrigger: finale, end: "bottom bottom", onUpdate: () => { const p = hazeProgress(); const vis = p > 0 && p < 0.8; if (vis !== shown) { shown = vis; cv.style.visibility = vis ? "visible" : "hidden"; } if (vis) paint(p); } });
    return () => st.kill();
  });

  /* ────────── Closing — two pouches drop from above (power3/2.out, the second .1 later) and float (sine 3.4/3.9s), tilting toward the mouse (.9s power3.out) ────────── */
  (() => {
    const shade = finale.querySelector(".rat__shade"), stage = finale.querySelector(".rat__stage"), title = finale.querySelector(".rat__title");
    const packs = gsap.utils.toArray("[data-pack]");
    const fs = parseFloat(getComputedStyle(document.body).fontSize);
    const D = { dropStart: 0.1, dropEnd: 0.58, fillAt: 0.21, revealEnd: 0.26 }, DM = { dropStart: 0, dropEnd: 90, fillAt: 62, revealEnd: 80 };
    const lane = [{ sx: -38, rot: -11, lag: 0 }, { sx: 38, rot: 10, lag: 0.1 }], landed = [0, 0];
    let cfg = D, ctaUp = false;
    const conf = () => { if (desktop.matches) { cfg = D; return; } const L = Math.max(1, finale.offsetHeight - innerHeight), m = (v) => ((v / 100) * innerHeight) / L; cfg = { dropStart: m(DM.dropStart), dropEnd: m(DM.dropEnd), fillAt: m(DM.fillAt), revealEnd: m(DM.revealEnd) }; };
    if (reduce) { shade.style.opacity = 0; window.sitePlayFill?.(title, true); packs.forEach((p) => { p.querySelector("[data-shadow]").style.opacity = 1; }); return; }
    conf();
    gsap.set("[data-cta]", { y: "16vh" });
    const e3 = gsap.parseEase("power3.out"), e2 = gsap.parseEase("power2.out");
    const update = (v) => {
      shade.style.opacity = String(1 - clamp(v / cfg.revealEnd));
      if (v > cfg.fillAt) { window.sitePlayFill?.(title); if (!ctaUp) { ctaUp = true; gsap.to("[data-cta]", { y: 0, duration: 1.2, delay: 0.25, ease: "power3.out" }); } }
      const m = clamp((v - cfg.dropStart) / (cfg.dropEnd - cfg.dropStart));
      packs.forEach((p, i) => {
        const L = lane[i], a = clamp((m - L.lag) / (1 - L.lag)), x = e3(a), y = e2(a);
        p.querySelector("[data-drop]").style.transform = `translate(${(1 - x) * L.sx}vw, ${(1 - y) * -120}vh) rotate(${(1 - y) * L.rot}deg)`;
        landed[i] = clamp((a - 0.55) / 0.45);
      });
    };
    update(0);
    ScrollTrigger.create({ trigger: finale, start: "top top", end: "bottom bottom", scrub: 0.4, onRefresh: (s) => { conf(); update(s.progress); }, onUpdate: (s) => update(s.progress) });
    packs.forEach((p, i) => {
      const fl = p.querySelector("[data-float]"), sh = p.querySelector("[data-shadow]"), li = p.querySelector("[data-light]");
      const dur = i === 0 ? 3.4 : 3.9, amp = (i === 0 ? 0.55 : 0.7) * fs;
      gsap.fromTo(fl, { y: amp * 0.5 }, { y: -amp, duration: dur, delay: i * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate() { const k = (parseFloat(gsap.getProperty(fl, "y")) + amp) / (amp * 1.5); gsap.set(sh, { scaleX: 0.9 + k * 0.12, opacity: landed[i] * (0.75 + k * 0.25) }); li.style.opacity = String(0.72 + (1 - k) * 0.28); } });
      gsap.to(fl, { rotation: i === 0 ? 0.7 : -0.8, duration: dur * 1.27, delay: i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
    const tilts = packs.map((p) => { const t = p.querySelector("[data-tilt]"); gsap.set(t, { transformPerspective: 900 }); return { rx: gsap.quickTo(t, "rotationX", { duration: 0.9, ease: "power3.out" }), ry: gsap.quickTo(t, "rotationY", { duration: 0.9, ease: "power3.out" }), x: gsap.quickTo(t, "x", { duration: 1.1, ease: "power3.out" }) }; });
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect(), nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      tilts.forEach((t, i) => { const k = i === 0 ? 1 : 1.3; t.ry(nx * 7 * k); t.rx(-ny * 4.5 * k); t.x(nx * 0.45 * fs * k); });
    });
    stage.addEventListener("pointerleave", () => tilts.forEach((t) => { t.rx(0); t.ry(0); t.x(0); }));
  })();

  /* ────────── Dusk — the light center rises (-12% → 40%) as the sun rises and sets. Header bar and sound button turn ink-black over the bright panel ────────── */
  const dusk = document.getElementById("dusk");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tw = gsap.fromTo(dusk, { "--ay": "-85%", "--suno": 0 }, { "--ay": "-12%", "--suno": 0.85, ease: "none", scrollTrigger: { trigger: dusk, start: "top bottom", end: "top 12%", scrub: 0.5 } });
    return () => tw.scrollTrigger?.kill();
  });
  const bar = document.getElementById("bar"), snd = document.getElementById("snd");
  ScrollTrigger.create({ trigger: finale, start: "top 5%", endTrigger: dusk, end: "45% top", onToggle: (s) => { bar.classList.toggle("bar--ink", s.isActive); snd.classList.toggle("snd--ink", s.isActive); } });
  // Header bar — hides upward when scrolling down (always visible under 80px) and returns on scroll up
  let lastY = 0;
  const onScrollBar = (y) => { if (y < 80) bar.classList.remove("bar--hidden"); else if (y > lastY + 1) bar.classList.add("bar--hidden"); else if (y < lastY - 1) bar.classList.remove("bar--hidden"); lastY = y; };
  if (window.lenis) window.lenis.on("scroll", (l) => onScrollBar(l.scroll)); else addEventListener("scroll", () => onScrollBar(scrollY), { passive: true });
})();

/* Quote window — when opened, the page · fixed stage · header row are pushed by the window width over .7s and scrolling stops. Close with the cover · ✕ · Esc */
(() => {
  const root = document.documentElement, quote = document.getElementById("quote");
  if (!quote) return;
  let opener = null;
  const pushed = () => (window.ScrollTrigger ? ScrollTrigger.getAll().filter((s) => s.pin && s.isActive).map((s) => s.pin) : []);
  const open = (from) => {
    opener = from;
    pushed().forEach((p) => p.classList.add("is-quote-pushed"));
    root.classList.add("is-quote");
    window.lenis?.stop();
    setTimeout(() => quote.querySelector("input")?.focus({ preventScroll: true }), 400);
  };
  const close = () => {
    if (!root.classList.contains("is-quote")) return;
    root.classList.remove("is-quote");
    window.lenis?.start();
    setTimeout(() => document.querySelectorAll(".is-quote-pushed").forEach((p) => p.classList.remove("is-quote-pushed")), 720);
    opener?.focus({ preventScroll: true });
  };
  document.querySelectorAll("[data-quote-open]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); open(a); }));
  document.querySelectorAll("[data-quote-close]").forEach((b) => b.addEventListener("click", close));
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
