// Deep sea world — rebuilt with our own shaders on top of three.js. Water column (light beams, marine snow), particle jellyfish and their echo swarm, particle flowers that change shape each season
// (four-season ring · cherry blossom · fireworks · maple · snow · wordmark), seasonal floating items (petals·fireflies·maple leaves·snow), seven work panels, glow and water-refraction finish.
// All colors are read from the skin (jbShared.rgbOf). index.js writes the stations and camera to the rig, and here only the drawing is done.
(() => {
  const T = THREE;
  const { rgbOf, css } = window.jbShared;
  const rand = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  // Cursor stir: the original stacks velocity per particle (after entry, spring 18 · damping .9/frame), so the spot the cursor pushed, spun and dragged heals in about 1 second.
  // To get the same linear response without storing particle positions separately, cursor history is gathered into 1/30s bins, each bin multiplied by that spring’s impulse response and added in the vertex shader.
  // 32 cells (1.07 seconds) — meanwhile the response drops below 3%, and five arrays fit within the phone vertex uniform lower limit (256)
  const STIR_N = 32, STIR_STEP = 1 / 30, SPRING = 18, SIG = (-60 * Math.log(0.9)) / 2, WD = Math.sqrt(SPRING - SIG * SIG);
  const impulse = (age) => (age <= 0 ? 0 : (Math.exp(-SIG * age) * Math.sin(WD * age)) / WD);
  const impulseRate = (age) => (age <= 0 ? 0 : (Math.exp(-SIG * age) * (WD * Math.cos(WD * age) - SIG * Math.sin(WD * age))) / WD);
  const v4s = () => Array.from({ length: STIR_N }, () => new T.Vector4());

  const NOISE = `
  float h11(float n){ return fract(sin(n) * 43758.5453); }
  vec3 drift3(vec3 p, float t){
    return vec3(sin(p.y * 1.7 + t * 0.9) + sin(p.z * 2.3 - t * 0.6),
                sin(p.z * 1.9 + t * 0.7) + sin(p.x * 2.1 + t * 0.5),
                sin(p.x * 1.5 - t * 0.8) + sin(p.y * 2.5 + t * 0.4)) * 0.5;
  }`;

  // Per-type motion used by flower and jellyfish particles — 0 jellyfish · 2 sparks · 3 letters · 4 swirl ring · 6 falling pieces (leaves, petals, snow)
  const ANIMATE = `
  vec3 animateForm(vec4 t, vec4 c, float form, float time){
    vec3 p = t.xyz;
    if (form < 0.5) {
      if (t.w >= 0.5 && t.w < 3.0) {
        float along = fract(t.w), ph = atan(t.z, t.x);
        p.x += sin(along * 5.0 - time * 0.9 + ph * 3.0) * 0.09 * along;
        p.z += cos(along * 4.0 - time * 0.7 + ph * 2.0) * 0.09 * along;
      }
    } else if (form < 2.5) {
      p.z += sin(time * 1.3 + t.x * 1.7) * 0.04;
      p.y += sin(time * 0.9 + t.x * 0.8) * 0.025;
    } else if (form < 3.5) {
      p.z += sin(length(t.xy) * 5.0 - time * 1.6) * 0.018;
    } else if (form < 4.5) {
      float r = length(t.xz), a = time * 0.32 / (0.35 + r * 0.6), cs = cos(a), sn = sin(a);
      p.xz = mat2(cs, -sn, sn, cs) * t.xz;
      p.y += sin(r * 2.0 - time) * 0.06;
    } else {
      float kind = step(1.5, c.w), seed = fract(c.w);
      float speed = mix(0.3 + seed * 0.32, 0.13 + seed * 0.14, kind);
      float sway = mix(0.75 + seed * 0.55, 0.25 + seed * 0.2, kind);
      vec3 ce = c.xyz;
      ce.y = mod(ce.y - time * speed + 7.0, 14.0) - 7.0;
      ce.x += sin(time * (0.35 + seed * 0.45) + seed * 20.0) * sway;
      ce.z += cos(time * (0.27 + seed * 0.3) + seed * 11.0) * sway * 0.5;
      vec3 l = t.xyz - c.xyz;
      float an = time * mix(0.55 + seed * 1.3, 0.2 + seed * 0.45, kind) + seed * 6.2832;
      vec3 ax = normalize(vec3(sin(seed * 17.0), cos(seed * 23.0) * 0.6, sin(seed * 5.0 + 1.0)));
      l = l * cos(an) + cross(ax, l) * sin(an) + ax * dot(ax, l) * (1.0 - cos(an));
      p = ce + l;
    }
    return p;
  }`;

  const POINTS_V = `
  attribute vec4 aA; attribute vec4 aB; attribute vec4 aCA; attribute vec4 aCB; attribute vec3 aColA; attribute vec3 aColB; attribute float aSeed;
  uniform float uTime, uMorph, uFormA, uFormB, uGather, uNoise, uScatter, uFocus, uSize, uPixel, uRing, uIgnite, uObjScale;
  uniform float uHighlight, uHighlightAmount, uRippleReach, uRippleStrength, uFog, uOpacity;
  uniform vec2 uRippleFocus;
  // Cursor history cell (response weight h · its derivative h'): P cursor spot · push×h · V drag×h · spring weight×h · Q drag×h'·Push×h' · O cursor gaze start·proximity strength · D gaze direction·spring weight×h'
  uniform vec4 uStirP[${STIR_N}], uStirV[${STIR_N}], uStirQ[${STIR_N}], uMixO[${STIR_N}], uMixD[${STIR_N}];
  uniform float uStirOn, uStirR, uMixOn, uMixTail, uMixIr2, uMixSpark;
  uniform vec3 uHotA, uHotB;
  varying vec3 vCol; varying float vAlpha;
  ${NOISE}
  ${ANIMATE}
  float localMorph(float m, float s){ return smoothstep(0.0, 1.0, clamp((m - s * 0.45) / 0.55, 0.0, 1.0)); }
  void main(){
    float k = localMorph(uMorph, aSeed);
    vec3 pa = animateForm(aA, aCA, uFormA, uTime), pb = animateForm(aB, aCB, uFormB, uTime);
    // Blend pair — the type at the spot the cursor’s gaze crosses passes over to the pair type. Measuring at the moving house spot keeps the boundary from flickering
    float flight = 0.0, kDot = 0.0;
    if (uMixOn > 0.5) {
      float km = k * uMixTail, k0 = k;
      for (int i = 0; i < ${STIR_N}; i++) {
        vec3 c = cross(pa - uMixO[i].xyz, uMixD[i].xyz);
        float l = localMorph(uMorph + uMixO[i].w * exp(-dot(c, c) * uMixIr2), aSeed);
        km += uStirV[i].w * l;
        kDot += uMixD[i].w * (l - k0);
      }
      k = clamp(km, 0.0, 1.0);
      // While crossing over, as in the original, the spring loosens and is carried by the current (.8 release · current ×5.5), floating as a dust cloud
      flight = max(0.0, sin(k * 3.14159) - sin(k0 * 3.14159));
    }
    vec3 vel = (pb - pa) * kDot;
    vec3 p = mix(pa, pb, k);
    p += drift3(pa * 0.5 + aSeed * 0.6, uTime * 0.8) * flight * 1.1;
    vec3 dir = normalize(vec3(h11(aSeed * 91.7) - 0.5, h11(aSeed * 47.3) - 0.5, h11(aSeed * 13.1) - 0.5) + 1e-4);
    // Gathering (prologue) · scattering (between sections) · gentle sway
    p += dir * (1.0 - uGather) * (2.4 + aSeed * 3.0);
    p += drift3(p * 1.3 + aSeed * 7.0, uTime) * (uNoise * 0.35 + uScatter * 0.6);
    p += dir * uScatter * (1.2 + aSeed * 2.6);
    // Flame’s what-we-do line highlight — one of eight branches brightens and extends slightly
    float sector = floor(mod(atan(aA.y, aA.x) / 6.2832 + 1.0, 1.0) * 8.0);
    float hl = uHighlightAmount * (1.0 - step(0.5, abs(sector - uHighlight))) * step(1.5, uFormA) * (1.0 - step(2.5, uFormA)) * (1.0 - k);
    p *= 1.0 + hl * 0.12;
    // The cursor stirs the water — push (1.0) + swirl (1.4) + drag by cursor velocity, with z measured squashed to .35.
    if (uStirOn > 0.5) {
      vec3 stir = vec3(0.0); float ir = 1.0 / (uStirR * uStirR);
      for (int i = 0; i < ${STIR_N}; i++) {
        vec3 away = p - uStirP[i].xyz; away.z *= 0.35;
        float f = exp(-dot(away, away) * ir);
        vec3 d = normalize(away + 1e-4), push = d + vec3(-d.y, d.x, 0.0) * 1.4;
        stir += (push * uStirP[i].w + uStirV[i].xyz) * f;
        vel += (push * uStirQ[i].w + uStirQ[i].xyz) * f;
      }
      p += stir;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    // Shuffle ripple — a ring spreads from the pressed spot and pushes particles away
    vec2 nd = clip.xy / clip.w - uRippleFocus;
    float ring = exp(-pow((length(nd) - uRippleReach * 0.22) * 6.0, 2.0)) * uRippleStrength;
    mv.xy += normalize(nd + 1e-4) * ring * 0.18 * -mv.z * 0.1;
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    float blur = clamp(abs(dist - uFocus) * 0.09, 0.0, 1.6);
    gl_PointSize = uSize * uPixel * uObjScale * (0.55 + aSeed * 0.9) * (1.0 + blur * 2.2) / max(0.4, dist) * (1.0 + hl * 0.6);
    // The ring draws one full turn when switched on
    float ringDraw = uFormA > 3.5 && uFormA < 4.5 ? step(fract(atan(aA.z, aA.x) / 6.2832 + 0.75), uRing) : 1.0;
    ringDraw = mix(ringDraw, 1.0, k);
    vCol = mix(aColA, aColB, k) * (1.0 + hl * 0.8);
    // Particles where the two types cross burn in two colors, and fast-moving particles heat up (a light trail when stirred)
    vCol += (aColA + aColB) * sin(k * 3.14159) * uMixSpark * 0.55;
    float speed = length(vel);
    vCol = mix(vCol, uHotA * 1.6, smoothstep(1.2, 6.0, speed) * 0.7);
    vCol += uHotB * smoothstep(0.4, 2.5, speed) * 0.25;
    vAlpha = uOpacity * uIgnite * ringDraw * exp(-dist * uFog) / (1.0 + blur * 3.0) * mix(1.0, uObjScale, 0.6);
  }`;
  const POINTS_F = `
  varying vec3 vCol; varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vCol * a, a);
  }`;

  function makeSystem(count, { size, fog }) {
    const g = new T.BufferGeometry();
    const mk = (n) => new Float32Array(count * n);
    const attrs = { aA: mk(4), aB: mk(4), aCA: mk(4), aCB: mk(4), aColA: mk(3), aColB: mk(3), aSeed: mk(1) };
    for (let i = 0; i < count; i++) attrs.aSeed[i] = Math.random();
    g.setAttribute("position", new T.BufferAttribute(mk(3), 3));
    for (const [k, v] of Object.entries(attrs)) g.setAttribute(k, new T.BufferAttribute(v, v.length / count));
    const uniforms = {
      uTime: { value: 0 }, uMorph: { value: 0 }, uFormA: { value: 0 }, uFormB: { value: 0 },
      uGather: { value: 1 }, uNoise: { value: 0.05 }, uScatter: { value: 0 }, uFocus: { value: 8 },
      uSize: { value: size }, uPixel: { value: 1 }, uObjScale: { value: 1 }, uRing: { value: 1 }, uIgnite: { value: 1 },
      uHighlight: { value: -1 }, uHighlightAmount: { value: 0 }, uRippleReach: { value: 0 }, uRippleStrength: { value: 0 },
      uRippleFocus: { value: new T.Vector2() },
      uStirP: { value: v4s() }, uStirV: { value: v4s() }, uStirQ: { value: v4s() }, uMixO: { value: v4s() }, uMixD: { value: v4s() },
      uStirOn: { value: 0 }, uStirR: { value: 0.55 }, uMixOn: { value: 0 }, uMixTail: { value: 1 }, uMixIr2: { value: 0 }, uMixSpark: { value: 0 },
      uHotA: { value: new T.Vector3(1, 1, 1) }, uHotB: { value: new T.Vector3(1, 1, 1) },
      uFog: { value: fog }, uOpacity: { value: 1 },
    };
    const mat = new T.ShaderMaterial({ vertexShader: POINTS_V, fragmentShader: POINTS_F, uniforms, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    const points = new T.Points(g, mat);
    points.frustumCulled = false;
    const sys = {
      points, uniforms, count, forms: {}, a: null, b: null, stir: [],
      setPair(A, B, t) {
        if (A && A !== sys.a) { g.attributes.aA.array.set(A.pos); g.attributes.aCA.array.set(A.cen); g.attributes.aColA.array.set(A.col); g.attributes.aA.needsUpdate = g.attributes.aCA.needsUpdate = g.attributes.aColA.needsUpdate = true; uniforms.uFormA.value = A.anim; sys.a = A; }
        if (B && B !== sys.b) { g.attributes.aB.array.set(B.pos); g.attributes.aCB.array.set(B.cen); g.attributes.aColB.array.set(B.col); g.attributes.aB.needsUpdate = g.attributes.aCB.needsUpdate = g.attributes.aColB.needsUpdate = true; uniforms.uFormB.value = B.anim; sys.b = B; }
        uniforms.uMorph.value = t;
      },
    };
    return sys;
  }

  // ── Shaping — all our own shapes. pos (xyz+w) · cen (center and type of falling pieces) · col ──
  function form(count, anim) { return { anim, pos: new Float32Array(count * 4), cen: new Float32Array(count * 4), col: new Float32Array(count * 3) }; }
  const put = (f, i, x, y, z, w, c) => { f.pos.set([x, y, z, w], i * 4); f.col.set(c, i * 3); };
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  function ringForm(n, pal) {
    const f = form(n, 4);
    const stops = [pal.s4, pal.mix3, pal.mix2, pal.drift2a, pal.s4];
    for (let i = 0; i < n; i++) {
      const dust = Math.random() < 0.06;
      const a = Math.random() * Math.PI * 2, u = (a / (Math.PI * 2) + 0.25) % 1;
      const seg = u * 4, k = Math.floor(seg), c = mixc(stops[k], stops[k + 1], seg - k);
      if (dust) { const r = Math.sqrt(Math.random()) * 0.95; put(f, i, Math.cos(a) * r, gauss() * 0.12, Math.sin(a) * r, 0, mixc(c, pal.ink, 0.5)); continue; }
      const r = 1 + gauss() * 0.035;
      // Rings stack as dense overlapping particles, so keep each one dark — the seasonal colors come alive when overlapped
      put(f, i, Math.cos(a) * r, gauss() * 0.03, Math.sin(a) * r, 0, c.map((v) => v * 0.14));
    }
    return f;
  }
  // Falling pieces — shape (one dot placed inside the piece) · kind 0 shakes fast (petals, leaves) / 1 slowly (snow)
  function fallForm(n, per, kind, shape, colors, spread) {
    const f = form(n, 6);
    const pieces = Math.ceil(n / per);
    const centers = Array.from({ length: pieces }, () => [rand(-spread[0], spread[0]), rand(-7, 7), rand(spread[1], spread[2]), Math.random()]);
    for (let i = 0; i < n; i++) {
      const p = i % pieces, c = centers[p];
      const [lx, ly, lz] = shape(Math.random(), Math.random(), c[3]);
      put(f, i, c[0] + lx, c[1] + ly, c[2] + lz, 0, mixc(colors[0], colors[1], Math.random() * 0.6 + c[3] * 0.4));
      f.cen.set([c[0], c[1], c[2], kind + 0.5 + c[3] * 0.49 + (kind ? 1 : 0)], i * 4);
    }
    return f;
  }
  const petal = (u, v) => { const a = Math.floor(u * 5) / 5 * Math.PI * 2 + (u * 5 % 1 - 0.5) * 0.9, r = Math.sqrt(v) * 0.12 * (0.6 + 0.4 * Math.cos((u * 5 % 1 - 0.5) * 3)); return [Math.cos(a) * r, Math.sin(a) * r, 0]; };
  const maple = (u, v) => { const a = u * Math.PI * 2, lobe = 0.55 + 0.45 * Math.abs(Math.cos(a * 2.5)), r = Math.sqrt(v) * 0.16 * lobe; return [Math.cos(a) * r, Math.sin(a) * r + 0.02, 0]; };
  const flake = (u, v) => { const arm = Math.floor(u * 6) / 6 * Math.PI * 2, r = v * 0.1, side = (u * 6 % 1 - 0.5) * 0.04 * Math.sin(v * 9); return [Math.cos(arm) * r - Math.sin(arm) * side, Math.sin(arm) * r + Math.cos(arm) * side, 0]; };

  function hanabiForm(n, pal) {
    const f = form(n, 2);
    const rays = 190;
    for (let i = 0; i < n; i++) {
      const ray = i % rays, a = (ray / rays) * Math.PI * 2 + Math.sin(ray * 12.9) * 0.02, tilt = Math.sin(ray * 7.3) * 0.35;
      const t = Math.pow(Math.random(), 0.6), r = 0.12 + t * (0.88 + Math.sin(ray * 3.1) * 0.08);
      const x = Math.cos(a) * r, y = Math.sin(a) * r, z = tilt * r * 0.4 + gauss() * 0.02;
      const c = t > 0.82 ? mixc(pal.ink, pal.drift2a, 0.5) : mixc(pal.drift2b, pal.s2, t);
      put(f, i, x, y, z, 0, mixc(c, pal.mix0, 0.35));
    }
    return f;
  }
  function textForm(n, word, font, width, ink) {
    const f = form(n, 3);
    const cv = document.createElement("canvas"), g = cv.getContext("2d", { willReadFrequently: true });
    cv.width = 1600; cv.height = 300;
    let px = 240;
    g.font = `800 ${px}px ${font}`;
    const w = g.measureText(word).width;
    px = Math.min(260, px * (cv.width * 0.94) / w);
    g.font = `800 ${px}px ${font}`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "white"; /* Not skin: invisible panel that extracts only the letter shapes */
    g.fillText(word, cv.width / 2, cv.height / 2);
    const d = g.getImageData(0, 0, cv.width, cv.height).data, pts = [];
    for (let y = 0; y < cv.height; y += 2) for (let x = 0; x < cv.width; x += 2) if (d[(y * cv.width + x) * 4 + 3] > 140) pts.push(x, y);
    const tw = g.measureText(word).width, s = width / tw;
    for (let i = 0; i < n; i++) {
      const k = Math.floor(Math.random() * (pts.length / 2)) * 2;
      put(f, i, (pts[k] - cv.width / 2 + Math.random() * 2) * s, -(pts[k + 1] - cv.height / 2 + Math.random() * 2) * s, gauss() * 0.04, 0, ink);
    }
    return f;
  }
  function medusaForm(n, pal) {
    const f = form(n, 0);
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      if (r < 0.46) {
        // Bell: from the top (0) to the rim (1) — a slightly flared hemisphere
        const u = Math.sqrt(Math.random()), ph = Math.random() * Math.PI * 2, th = u * 1.42;
        const rad = Math.sin(th) * (1 + u * u * 0.08), y = Math.cos(th) * 0.72 - 0.05;
        const shell = 1 + gauss() * 0.02;
        put(f, i, Math.cos(ph) * rad * shell, y, Math.sin(ph) * rad * shell, u * 0.5, mixc(pal.ink, pal.glint, 0.25 + u * 0.2).map((v) => v * 0.72));
      } else if (r < 0.52) {
        // Gonads: four cross rings at the top inside the bell
        const arm = Math.floor(Math.random() * 4), a = arm * Math.PI / 2 + gauss() * 0.35, rr = 0.18 + Math.random() * 0.12;
        put(f, i, Math.cos(a) * rr, 0.52 + gauss() * 0.04, Math.sin(a) * rr, 0.1, pal.s1.map((v) => v * 0.45));
      } else if (r < 0.9) {
        // 32 tentacle strands — hanging down from the edge
        const k = Math.floor(Math.random() * 32), ph = (k / 32) * Math.PI * 2, along = Math.random(), len = 2.6 + Math.sin(k * 2.7) * 0.6;
        put(f, i, Math.cos(ph) * 0.98, -0.05 - along * len, Math.sin(ph) * 0.98, 1 + along * 0.999, mixc(pal.ink, pal.s1, 0.18 + along * 0.2));
      } else {
        // Four petals — stretched long from the center
        const k = Math.floor(Math.random() * 4), ph = k * Math.PI / 2 + 0.4, along = Math.random(), len = 1.9;
        const sp = 0.08 + along * 0.16;
        put(f, i, Math.cos(ph) * sp + gauss() * 0.03, 0.3 - along * len, Math.sin(ph) * sp + gauss() * 0.03, 2 + along * 0.999, mixc(pal.s1, pal.ink, 0.45));
      }
    }
    return f;
  }

  // ── Water Column Background ──
  const ABYSS_F = `
  uniform vec2 uRes; uniform float uTime, uDepth, uRise, uOpacity;
  uniform vec3 uShallow, uMid, uDeep, uLight, uTint;
  varying vec2 vUv;
  float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
  void main(){
    vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 p = vec2((uv.x - 0.5) * asp, uv.y);
    float d = clamp(uDepth, 0.0, 1.0);
    // Shallow teal → deep teal → near-black backdrop — from autumn (.62) on it sinks deeper toward the backdrop
    vec3 top = mix(mix(uShallow * uTint, uMid, smoothstep(0.0, 0.35, d)), uDeep * 1.8, smoothstep(0.22, 0.75, d));
    vec3 bot = mix(uMid * 0.42, uDeep, smoothstep(0.0, 0.5, d));
    vec3 col = mix(bot, top, pow(uv.y, 1.3));
    float sY = 1.02 + d * 0.9, near = smoothstep(0.35, 0.0, sY - uv.y);
    float rip = fbm(vec2(p.x * 2.4 + uTime * 0.05, uTime * 0.07));
    float web = smoothstep(0.62, 0.7, fbm(vec2(p.x * 5.5, p.x * 1.3 + uTime * 0.11) + rip * 1.6));
    col += uLight * near * (0.45 * rip + 0.55 * web) * (1.0 - d);
    float ang = atan(p.x + 0.25, 1.9 - uv.y);
    float shaft = fbm(vec2(ang * 7.0, uTime * 0.05)) * fbm(vec2(ang * 17.0 + 3.0, uTime * 0.03));
    col += uLight * 0.9 * pow(shaft, 1.6) * uv.y * 0.6 * (1.0 - d * 0.85);
    for (int k = 0; k < 3; k++) {
      float l = float(k), sc = 16.0 + l * 13.0;
      vec2 q = p * sc + vec2(0.0, -(uTime * (0.18 + l * 0.1) + uRise * (5.0 + l * 6.0)));
      vec2 id = floor(q), f = fract(q) - 0.5; float h = h21(id);
      vec2 o = vec2(h21(id + 1.3), h21(id + 2.7)) - 0.5; o.x += sin(uTime * 0.4 + h * 20.0) * 0.12;
      float spk = smoothstep(0.09 + 0.05 * h, 0.0, length(f - o * 0.7)) * step(0.74, h);
      col += uLight * spk * (0.1 + l * 0.1) * uOpacity * 4.0;
    }
    // The bottom shimmers dark, like the shadow of a sand dune
    float floorN = fbm(vec2(p.x * 1.6, uv.y * 3.0 + uTime * 0.01));
    col *= 1.0 - smoothstep(0.32, 0.0, uv.y) * (0.35 + floorN * 0.25);
    col *= mix(1.0, smoothstep(1.35, 0.25, length((uv - 0.5) * vec2(asp, 1.0))), 0.5);
    gl_FragColor = vec4(col, 1.0);
  }`;

  // ── Floating things (seasons) ──
  const DRIFT_V = `
  attribute float aSeed; attribute float aKind;
  uniform float uTime, uFall, uSway, uPixel, uPetal, uLeaf, uFirefly, uOpacity, uTravel;
  uniform vec3 uCam; uniform vec3 uColorA, uColorB;
  varying vec3 vCol; varying float vAlpha; varying float vShape; varying float vSpin;
  void main(){
    vec3 p = position;
    p.y -= uTime * uFall * (0.5 + aSeed) * 2.2 + uTravel * 0.8;
    p.x += sin(uTime * (0.4 + aSeed) + aSeed * 40.0) * uSway * 1.4;
    p.z += cos(uTime * (0.3 + aSeed * 0.5) + aSeed * 17.0) * uSway * 0.7;
    vec3 box = vec3(26.0, 18.0, 26.0);
    p = uCam + mod(p - uCam + box * 0.5, box) - box * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    // Types: 0 sea snow · 1 petal · 2 leaf · 3 firefly — picked by seasonal weight
    float pick = aKind;
    float shape = pick < uPetal ? 1.0 : pick < uPetal + uLeaf ? 2.0 : pick < uPetal + uLeaf + uFirefly ? 3.0 : 0.0;
    vShape = shape;
    vSpin = aSeed * 6.2832 + uTime * (0.5 + aSeed);
    float big = shape == 2.0 ? 2.6 : shape == 1.0 ? 1.7 : shape == 3.0 ? 1.2 : 0.8;
    gl_PointSize = big * uPixel * 34.0 / max(0.6, dist);
    vCol = mix(uColorA, uColorB, aSeed);
    float flick = shape == 3.0 ? 0.55 + 0.45 * sin(uTime * (2.0 + aSeed * 3.0) + aSeed * 30.0) : 1.0;
    vAlpha = uOpacity * flick * smoothstep(0.4, 2.0, dist) * exp(-dist * 0.05);
  }`;
  const DRIFT_F = `
  varying vec3 vCol; varying float vAlpha; varying float vShape; varying float vSpin;
  void main(){
    vec2 q = gl_PointCoord - 0.5;
    float cs = cos(vSpin), sn = sin(vSpin); q = mat2(cs, -sn, sn, cs) * q;
    float a;
    if (vShape == 1.0) { a = smoothstep(0.02, -0.02, length(q * vec2(1.0, 2.2)) - 0.22) * (1.0 - smoothstep(0.0, 0.05, -q.y - 0.17 + abs(q.x) * 0.6)); }
    else if (vShape == 2.0) { float an = atan(q.y, q.x), r = length(q); float lobe = 0.24 + 0.2 * abs(cos(an * 2.5)); a = smoothstep(0.02, -0.02, r - lobe); }
    else if (vShape == 3.0) { a = exp(-dot(q, q) * 40.0) * 1.6; }
    else { a = smoothstep(0.5, 0.0, length(q)) * 0.6; }
    a *= vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vCol * a, a);
  }`;

  // ── Work Panel ──
  const PANEL_V = `
  uniform float uBend; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){
    vUv = uv; vec3 p = position;
    p.z -= p.x * p.x * 0.06 + uBend * sin(uv.x * 3.14159) * 0.06;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vN = normalize(mat3(modelMatrix) * normal); vV = cameraPosition - w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
  const PANEL_F = `
  uniform sampler2D uMap; uniform float uOpacity, uActive, uSplit, uBlur; uniform vec2 uSize; uniform vec3 uAccent, uRest;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  float box(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main(){
    vec2 px = (vUv - 0.5) * uSize;
    float d = box(px, uSize * 0.5, 10.0);
    float mask = 1.0 - smoothstep(-1.2, 0.8, d);
    if (mask < 0.01) discard;
    vec2 sh = vec2(uSplit * 0.006, 0.0);
    vec3 c = vec3(texture2D(uMap, vUv + sh).r, texture2D(uMap, vUv).g, texture2D(uMap, vUv - sh).b);
    if (uBlur > 0.01) {
      vec3 s = c; float r = uBlur * 0.022;
      for (int i = 0; i < 12; i++) { float a = float(i) * 0.5235988; vec2 o = vec2(cos(a), sin(a) * (uSize.x / uSize.y)) * r; s += texture2D(uMap, vUv + o).rgb + texture2D(uMap, vUv + o * 0.5).rgb; }
      c = mix(c, s / 25.0, smoothstep(0.0, 0.35, uBlur));
    }
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    vec3 rest = mix(vec3(l), c, 0.3) * uRest * 0.5;
    c = mix(rest, c * 0.94, uActive);
    float edge = 1.0 - smoothstep(0.0, 2.2, abs(d + 1.0));
    c += uAccent * edge * (0.25 + uActive * 0.45);
    float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
    gl_FragColor = vec4(c, mask * uOpacity * mix(mix(0.45, 1.0, facing), 1.0, uActive));
  }`;

  // ── Finish: bright-area extraction · blur · merge (light bloom + water refraction between works + edge color split) ──
  const QUAD_V = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const BRIGHT_F = `uniform sampler2D tSrc; uniform float uThreshold; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tSrc, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(uThreshold, uThreshold + 0.25, l), 1.0); }`;
  const BLUR_F = `uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
  void main(){ vec3 s = texture2D(tSrc, vUv).rgb * 0.227;
    s += (texture2D(tSrc, vUv + uDir * 1.38).rgb + texture2D(tSrc, vUv - uDir * 1.38).rgb) * 0.316;
    s += (texture2D(tSrc, vUv + uDir * 3.23).rgb + texture2D(tSrc, vUv - uDir * 3.23).rgb) * 0.07;
    gl_FragColor = vec4(s, 1.0); }`;
  const COMP_F = `uniform sampler2D tScene, tBloom; uniform float uBloom, uTime, uWater, uFront, uAspect; uniform vec2 uDir; varying vec2 vUv;
  float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
  void main(){
    vec2 uv = vUv;
    if (uWater > 0.002) {
      float band = exp(-pow((uv.x - 0.5) * uDir.x * 2.0 - uFront * 0.5, 2.0) * 2.5);
      vec2 w = vec2(sin(uv.y * 18.0 + uTime * 3.1) + sin(uv.y * 41.0 - uTime * 2.3) * 0.5, cos(uv.x * 14.0 * uAspect + uTime * 2.7));
      uv += w * uWater * (0.012 + band * 0.03);
    }
    vec2 off = (uv - 0.5) * 0.0025 * (1.0 + uWater * 3.0);
    vec3 c = vec3(texture2D(tScene, uv + off).r, texture2D(tScene, uv).g, texture2D(tScene, uv - off).b);
    c += texture2D(tBloom, uv).rgb * uBloom * 2.2;
    c += (h21(uv * 900.0 + uTime) - 0.5) * 0.018;
    gl_FragColor = vec4(c, 1.0);
  }`;

  class World {
    constructor(canvas, { reduce }) {
      this.reduce = reduce;
      this.canvas = canvas;
      this.renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.outputColorSpace = T.LinearSRGBColorSpace;
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
      this.rig = { x: 0, y: 0, z: 8, tx: 0, ty: 0, tz: 0, roll: 0, fov: 40, depth: 1 };
      this.fx = { bloom: 0.32, threshold: 0.78, travel: 0 };
      this.water = { strength: 0, front: 0, dir: 1 };
      this.parallax = 1; this.flowerOpacity = 1; this.time = 0; this.paused = false; this.aspectFit = 1;
      this.look = new T.Vector2(); this.pointer = { ndc: new T.Vector2(), world: new T.Vector3(99, 99, 99), velocity: new T.Vector3(), active: false, energy: 0 };
      this.mixFocus = { ndc: new T.Vector2(), reach: 1.8, strength: 0 };
      this.mixHover = { ndc: new T.Vector2(), reach: 1.8, strength: 0 };
      this.schoolCount = 0; this.schoolClear = [-1, -1, 0, 0]; this.echo = { a: 0, x: 0, y: 0, z: -50, s: 12 };
      this.jellyIgnite = 1; this.ringIgnite = 1;
      this.readColors();
      this.build();
      this.resize();
      // Compiling for the first time on the first cursor move freezes the screen — precompile all shaders when building the world
      this.renderer.compile(this.scene, this.camera);
      [this.pBright, this.pBlur, this.pComp].forEach((q) => this.renderer.compile(q.scene, this.postCam));
      // Like the original, finger swipes don’t count as cursor movement (phones just page-scroll)
      window.addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; this.pointer.active = true; this.pointer.ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); }, { passive: true });
      document.addEventListener("pointerleave", () => { this.pointer.active = false; });
    }
    readColors() {
      const v = (n) => rgbOf(n);
      this.pal = {
        ink: v("--kf-ink"), glint: v("--kf-accent-soft"), bg: v("--kf-bg"), shallow: v("--kf-raised"), mid: v("--kf-surface"), deep: v("--site-deep"),
        s0: v("--site-season-0"), s1: v("--site-season-1"), s2: v("--site-season-2"), s3: v("--site-season-3"), s4: v("--site-season-4"),
        drift2a: v("--site-drift-2a"), drift2b: v("--site-drift-2b"), drift3a: v("--site-drift-3a"), drift3b: v("--site-drift-3b"),
        drift1a: v("--site-drift-1a"), drift4b: v("--site-drift-4b"), mix0: v("--site-mix-0"), mix2: v("--site-mix-2"), mix3: v("--site-mix-3"),
      };
    }
    build() {
      const narrow = innerWidth < 760;
      const P = this.pal, NF = narrow ? 30000 : 60000, NJ = narrow ? 36000 : 72000;
      this.N = NF;
      // Water column
      this.abyss = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
        vertexShader: QUAD_V, fragmentShader: ABYSS_F, depthTest: false, depthWrite: false,
        uniforms: { uRes: { value: new T.Vector2(1, 1) }, uTime: { value: 0 }, uDepth: { value: 1 }, uRise: { value: 0 }, uOpacity: { value: 0.22 },
          uShallow: { value: new T.Vector3(...P.shallow) }, uMid: { value: new T.Vector3(...P.mid) }, uDeep: { value: new T.Vector3(...P.deep) }, uLight: { value: new T.Vector3(...P.glint) }, uTint: { value: new T.Vector3(1, 1, 1) } },
      }));
      this.abyss.frustumCulled = false; this.abyss.renderOrder = -10;
      this.scene.add(this.abyss);
      // Flowers and jellyfish
      this.flower = makeSystem(NF, { size: 20, fog: 0.035 });
      this.jelly = makeSystem(NJ, { size: 17, fog: 0.012 });
      // Heated particle color — blue-white (pale accent plus a bit of text color), pink (accent color)
      [this.flower, this.jelly].forEach((s) => { s.uniforms.uHotA.value.set(...mixc(P.glint, P.ink, 0.35)); s.uniforms.uHotB.value.set(...P.s1); });
      this.flower.points.renderOrder = 10; this.jelly.points.renderOrder = 9;
      this.scene.add(this.flower.points, this.jelly.points);
      this.tasks = [
        () => { this.jelly.forms.medusa = medusaForm(NJ, P); this.jelly.setPair(this.jelly.forms.medusa, this.jelly.forms.medusa, 0); },
        () => { this.flower.forms.seasonsRing = ringForm(NF, P); },
        () => { this.flower.forms.sakuraFall = fallForm(NF, 60, 0, petal, [P.drift1a, P.s1], [6, -4, 3]); },
        () => { this.flower.forms.hanabi = hanabiForm(NF, P); },
        () => { this.flower.forms.mapleFall = fallForm(NF, 80, 0, maple, [P.drift3a, P.drift3b], [7, -5, 3]); },
        () => { this.flower.forms.snowFall = fallForm(NF, 50, 1, flake, [P.ink, P.drift4b], [7, -5, 3]); },
      ];
      // Echo jellyfish swarm — draw the same particle small, many times
      this.school = Array.from({ length: 8 }, (_, i) => {
        const m = this.jelly.points.material.clone();
        m.uniforms = T.UniformsUtils.clone(this.jelly.points.material.uniforms);
        const pts = new T.Points(this.jelly.points.geometry, m);
        pts.frustumCulled = false; pts.renderOrder = 8; pts.visible = false;
        const a = (i / 8) * Math.PI * 2 + 0.6;
        pts.userData = { home: new T.Vector3(Math.cos(a) * rand(6, 10), rand(-2, 4), Math.sin(a) * rand(4, 8) - 5), phase: Math.random() * 10, s: rand(0.24, 0.42) };
        this.scene.add(pts);
        return pts;
      });
      this.echoJelly = new T.Points(this.jelly.points.geometry, this.school[0].material.clone());
      this.echoJelly.material.uniforms = T.UniformsUtils.clone(this.school[0].material.uniforms);
      this.echoJelly.frustumCulled = false; this.scene.add(this.echoJelly);
      // Floating things
      const ND = narrow ? 900 : 1600, dg = new T.BufferGeometry(), dp = new Float32Array(ND * 3), ds = new Float32Array(ND), dk = new Float32Array(ND);
      for (let i = 0; i < ND; i++) { dp.set([rand(-13, 13), rand(-9, 9), rand(-13, 13)], i * 3); ds[i] = Math.random(); dk[i] = Math.random(); }
      dg.setAttribute("position", new T.BufferAttribute(dp, 3)); dg.setAttribute("aSeed", new T.BufferAttribute(ds, 1)); dg.setAttribute("aKind", new T.BufferAttribute(dk, 1));
      this.drift = new T.Points(dg, new T.ShaderMaterial({ vertexShader: DRIFT_V, fragmentShader: DRIFT_F, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uFall: { value: 0.07 }, uSway: { value: 0.2 }, uPixel: { value: 1 }, uPetal: { value: 0 }, uLeaf: { value: 0 }, uFirefly: { value: 0 }, uOpacity: { value: 0 }, uTravel: { value: 0 },
          uCam: { value: new T.Vector3() }, uColorA: { value: new T.Vector3(1, 1, 1) }, uColorB: { value: new T.Vector3(1, 1, 1) } } }));
      this.drift.frustumCulled = false; this.drift.renderOrder = 12;
      this.scene.add(this.drift);
      // Seven work plates — set at varying heights around a radius of 3.9
      this.works = new T.Group(); this.scene.add(this.works);
      this.panelLayout = layoutPanels(7);
      const geo = new T.PlaneGeometry(2.4, (424 / 960) * 2.4, 24, 1);
      this.panels = this.panelLayout.map((L, i) => {
        const u = { uMap: { value: placeholderTexture(i, P) }, uOpacity: { value: 0 }, uActive: { value: 0 }, uSplit: { value: 0 }, uBlur: { value: 0 }, uBend: { value: 0 },
          uSize: { value: new T.Vector2(960, 424) }, uAccent: { value: new T.Vector3(...P.s3) }, uRest: { value: new T.Vector3(...mixc(P.glint, P.ink, 0.5)) } };
        const mesh = new T.Mesh(geo, new T.ShaderMaterial({ vertexShader: PANEL_V, fragmentShader: PANEL_F, uniforms: u, transparent: true, depthWrite: false, side: T.DoubleSide }));
        mesh.position.copy(L.position); mesh.quaternion.copy(L.quaternion); mesh.rotateZ(L.tilt); mesh.renderOrder = 4; mesh.frustumCulled = false;
        this.works.add(mesh);
        return { mesh, u, active: 0 };
      });
      // Closing panel
      const rt = (s) => new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, depthBuffer: s });
      this.rtScene = rt(true); this.rtA = rt(false); this.rtB = rt(false);
      const quad = (frag, uniforms) => { const m = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false })); m.frustumCulled = false; const s = new T.Scene(); s.add(m); return { scene: s, u: uniforms }; };
      this.pBright = quad(BRIGHT_F, { tSrc: { value: null }, uThreshold: { value: 0.78 } });
      this.pBlur = quad(BLUR_F, { tSrc: { value: null }, uDir: { value: new T.Vector2() } });
      this.pComp = quad(COMP_F, { tScene: { value: null }, tBloom: { value: null }, uBloom: { value: 0.3 }, uTime: { value: 0 }, uWater: { value: 0 }, uFront: { value: 0 }, uAspect: { value: 1 }, uDir: { value: new T.Vector2(1, 0.32) } });
      this.postCam = new T.Camera();
    }
    buildTasks() { const t = this.tasks || []; this.tasks = null; return t; }
    addWordmark(word, width) {
      this.flower.forms.wordmark = textForm(this.N, word, css("--kf-font-mincho") || css("--kf-font-display"), width, this.pal.ink);
    }
    resize() {
      const w = innerWidth, h = innerHeight, r = w / h;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = r; this.camera.updateProjectionMatrix();
      this.aspectFit = r < 1 ? Math.min(1.9, 1.12 / Math.max(0.45, r)) : 1;
      const pr = this.renderer.getPixelRatio();
      this.rtScene.setSize(w * pr, h * pr);
      this.rtA.setSize(Math.max(1, w * pr / 4), Math.max(1, h * pr / 4)); this.rtB.setSize(Math.max(1, w * pr / 4), Math.max(1, h * pr / 4));
      this.abyss.material.uniforms.uRes.value.set(w, h);
      const px = pr * (h / 900);
      [this.flower, this.jelly].forEach((s) => (s.uniforms.uPixel.value = px));
      this.school.concat(this.echoJelly).forEach((p) => (p.material.uniforms.uPixel.value = px));
      this.drift.material.uniforms.uPixel.value = px;
    }
    place(points, a, b, t) {
      const L = (x, y) => x + (y - x) * t;
      points.position.set(L(a.x, b.x), L(a.y, b.y), L(a.z, b.z));
      points.scale.setScalar(L(a.s, b.s));
      points.rotation.set(L(a.rx, b.rx), L(a.ry, b.ry), L(a.rz, b.rz));
    }
    setSeason(colors) {
      const d = this.drift.material.uniforms;
      Object.entries(colors.drift).forEach(([k, v]) => { if (d[k]) d[k].value = v; });
      d.uColorA.value.set(...colors.a); d.uColorB.value.set(...colors.b);
      this.abyss.material.uniforms.uTint.value.set(...colors.tint);
      this.panels.forEach((p) => p.u.uAccent.value.set(...colors.accent));
    }
    updateWorks({ weight, focus, speed }) {
      this.works.visible = weight > 0.005;
      if (!this.works.visible) return;
      this.panels.forEach((p, i) => {
        p.active = smooth(1 - Math.abs(focus - i) * 1.7, 0, 1);
        p.u.uOpacity.value = weight * (0.38 + p.active * 0.62);
        p.u.uActive.value = p.active; p.u.uSplit.value = speed;
        p.u.uBlur.value = Math.min(1, Math.abs(focus - i)) * (0.6 + speed * 0.4);
        p.u.uBend.value = speed;
      });
    }
    // Adds this frame’s cursor force to the open cells — push (1.2 + tilt×5)/size, pull cursor speed ×.12/size ×2.4, mix gaze (radius 1.8/size)
    stirRecord(s, sc, dt, ray) {
      const now = this.time, g = this.pointer;
      let b = s.stir[0];
      if (!b || now - b.t0 >= STIR_STEP) {
        b = { t0: now - dt, dur: 0, p: new T.Vector3(), v: new T.Vector3(), push: 0, o: new T.Vector3(), d: new T.Vector3(), near: 0 };
        s.stir.unshift(b);
        if (s.stir.length > STIR_N) s.stir.pop();
      }
      b.dur += dt;
      b.p.addScaledVector(s.points.worldToLocal(g.world.clone()), dt);
      b.push += (this.reduce ? 0 : (1.2 + g.energy * 5) / sc) * dt;
      if (!this.reduce) b.v.addScaledVector(g.velocity, (0.12 / sc) * 2.4 * dt);
      if (ray) {
        const o = s.points.worldToLocal(ray.origin.clone()), e = s.points.worldToLocal(ray.origin.clone().add(ray.direction)).sub(o).normalize();
        b.o.addScaledVector(o, dt); b.d.addScaledVector(e, dt);
        b.near += this.mixHover.strength * dt;
        s.uniforms.uMixIr2.value = (sc * sc) / (this.mixHover.reach * this.mixHover.reach);
      }
    }
    stirUpload(s) {
      const u = s.uniforms, P = u.uStirP.value, V = u.uStirV.value, Q = u.uStirQ.value, O = u.uMixO.value, D = u.uMixD.value, now = this.time;
      let tail = 1, mixing = false;
      for (let i = 0; i < STIR_N; i++) {
        const b = s.stir[i];
        if (!b || b.dur <= 0) { P[i].set(0, 0, 0, 0); V[i].set(0, 0, 0, 0); Q[i].set(0, 0, 0, 0); O[i].set(0, 0, 0, 0); D[i].set(0, 0, 1, 0); continue; }
        const age = now - (b.t0 + b.dur / 2), h = impulse(age), r = impulseRate(age), inv = 1 / b.dur;
        P[i].set(b.p.x * inv, b.p.y * inv, b.p.z * inv, b.push * h);
        V[i].set(b.v.x * h, b.v.y * h, b.v.z * h, SPRING * h * b.dur);
        Q[i].set(b.v.x * r, b.v.y * r, b.v.z * r, b.push * r);
        tail -= SPRING * h * b.dur;
        if (b.near > 0) { mixing = true; O[i].set(b.o.x * inv, b.o.y * inv, b.o.z * inv, b.near * inv); const d = b.d.clone().normalize(); D[i].set(d.x, d.y, d.z, SPRING * r * b.dur); }
        else { O[i].set(0, 0, 0, 0); D[i].set(0, 0, 1, SPRING * r * b.dur); }
      }
      u.uStirOn.value = s.stir.length && !this.reduce ? 1 : 0;
      // When shuffle ends (dive, press) the pairs change, so discard the remaining gaze history
      u.uMixOn.value = mixing && this.mixHover.strength > 0 ? 1 : 0;
      u.uMixTail.value = tail;
    }
    frame(dtRaw) {
      const dt = this.paused ? 0 : Math.min(0.1, dtRaw);
      this.time += dt;
      const t = this.time, rig = this.rig, o = this.reduce ? 0 : this.parallax, cam = this.camera;
      const src = this.pointer.active ? this.pointer.ndc : null;
      const curve = (v) => Math.sign(v) * Math.min(1, Math.abs(v)) ** 1.6;
      const k = 1 - Math.exp(-dt * 2.2);
      this.look.x += ((src ? curve(src.x) : 0) - this.look.x) * k;
      this.look.y += ((src ? curve(src.y) : 0) - this.look.y) * k;
      const f = this.look.x, p = this.look.y, A = this.aspectFit;
      cam.position.set(rig.tx + (rig.x - rig.tx) * A + f * 1.4 * o + Math.sin(t * 0.13) * 0.12 * o,
        rig.ty + (rig.y - rig.ty) * A + p * 0.7 * o + Math.sin(t * 0.17) * 0.08 * o,
        rig.tz + (rig.z - rig.tz) * A);
      cam.up.set(Math.sin(rig.roll), Math.cos(rig.roll), 0);
      cam.lookAt(rig.tx, rig.ty, rig.tz);
      cam.rotateY(-f * 1.05 * o);
      cam.rotateX(p * 0.4 * o);
      if (cam.fov !== rig.fov) { cam.fov = rig.fov; cam.updateProjectionMatrix(); }
      cam.updateMatrixWorld();
      // Spot in the water the cursor points at — particles step aside
      const ray = new T.Raycaster(); ray.setFromCamera(this.pointer.ndc, cam);
      const plane = new T.Plane().setFromNormalAndCoplanarPoint(cam.getWorldDirection(new T.Vector3()).negate(), new T.Vector3(rig.tx, rig.ty, rig.tz));
      const hit = new T.Vector3(), g = this.pointer;
      if (g.active && ray.ray.intersectPlane(plane, hit)) {
        if (dt > 0) { const v = hit.clone().sub(g.world).divideScalar(dt); if (g.world.x > 90) v.set(0, 0, 0); g.velocity.lerp(v.clampLength(0, 12), 1 - Math.exp(-dt * 10)); }
        else g.velocity.set(0, 0, 0);
        g.world.copy(hit); g.energy = Math.min(1, g.energy + g.velocity.length() * dt * 0.8);
      }
      g.energy *= Math.exp(-dt * 0.9);
      const mh = this.mixHover, mixRay = new T.Raycaster();
      if (mh.strength > 0) mixRay.setFromCamera(mh.ndc, cam);
      for (const s of [this.flower, this.jelly]) {
        s.points.updateMatrixWorld();
        const sc = Math.max(0.2, s.points.scale.x), u = s.uniforms;
        u.uTime.value = t;
        u.uStirR.value = 0.55 / sc;
        u.uFocus.value = cam.position.distanceTo(new T.Vector3(rig.tx, rig.ty, rig.tz));
        u.uObjScale.value = Math.sqrt(sc);
        if (dt > 0 && g.world.x < 90) this.stirRecord(s, sc, dt, s === this.flower && mh.strength > 0 ? mixRay.ray : null);
        this.stirUpload(s);
      }
      const fu = this.flower.uniforms;
      fu.uOpacity.value = this.flowerOpacity;
      fu.uRing.value = this.ringIgnite;
      fu.uRippleFocus.value.copy(this.mixFocus.ndc); fu.uRippleReach.value = this.mixFocus.reach; fu.uRippleStrength.value = this.mixFocus.strength;
      this.jelly.uniforms.uIgnite.value = this.jellyIgnite;
      // Echo swarm
      const clear = this.schoolClear, v3 = new T.Vector3();
      this.school.forEach((pts, i) => {
        const on = i < this.schoolCount, U = pts.material.uniforms, d = pts.userData;
        pts.visible = on || U.uOpacity.value > 0.01;
        U.uOpacity.value += ((on ? 0.38 : 0) - U.uOpacity.value) * (1 - Math.exp(-dt * 1.5));
        if (!pts.visible) return;
        U.uTime.value = t + d.phase; U.uFocus.value = this.focus ?? 8; U.uIgnite.value = this.jellyIgnite;
        pts.position.set(rig.tx + d.home.x + Math.sin(t * 0.11 + d.phase) * 0.8, rig.ty + d.home.y + Math.sin(t * 0.23 + d.phase) * 0.5, rig.tz + d.home.z);
        v3.copy(pts.position).project(cam);
        if (v3.x > clear[0] && v3.x < clear[2] && v3.y > clear[1] && v3.y < clear[3]) U.uOpacity.value *= 0.92;
        pts.scale.setScalar(d.s);
      });
      const E = this.echo, EU = this.echoJelly.material.uniforms;
      this.echoJelly.visible = E.a > 0.01;
      EU.uOpacity.value = E.a; EU.uTime.value = t * 0.7; EU.uFocus.value = 40; EU.uFog.value = 0.006;
      this.echoJelly.position.set(E.x, E.y + Math.sin(t * 0.1) * 0.6, E.z); this.echoJelly.scale.setScalar(E.s);
      // Water columns and floating things
      const au = this.abyss.material.uniforms;
      au.uTime.value = t; au.uDepth.value = rig.depth; au.uRise.value = t * 0.02 + this.fx.travel * 0.22;
      const du = this.drift.material.uniforms;
      du.uTime.value = t; du.uCam.value.copy(cam.position); du.uTravel.value = this.fx.travel;
      // Drawing
      const R = this.renderer;
      R.setRenderTarget(this.rtScene); R.render(this.scene, cam);
      this.pBright.u.tSrc.value = this.rtScene.texture; this.pBright.u.uThreshold.value = this.fx.threshold;
      R.setRenderTarget(this.rtA); R.render(this.pBright.scene, this.postCam);
      const bw = this.rtA.width, bh = this.rtA.height;
      for (let i = 0; i < 2; i++) {
        this.pBlur.u.tSrc.value = this.rtA.texture; this.pBlur.u.uDir.value.set((1 + i) / bw, 0);
        R.setRenderTarget(this.rtB); R.render(this.pBlur.scene, this.postCam);
        this.pBlur.u.tSrc.value = this.rtB.texture; this.pBlur.u.uDir.value.set(0, (1 + i) / bh);
        R.setRenderTarget(this.rtA); R.render(this.pBlur.scene, this.postCam);
      }
      const cu = this.pComp.u;
      cu.tScene.value = this.rtScene.texture; cu.tBloom.value = this.rtA.texture; cu.uBloom.value = this.fx.bloom; cu.uTime.value = t;
      cu.uWater.value = this.water.strength; cu.uFront.value = this.water.front; cu.uDir.value.set(this.water.dir, 0.32); cu.uAspect.value = cam.aspect;
      R.setRenderTarget(null); R.render(this.pComp.scene, this.postCam);
    }
  }

  function smooth(x, a, b) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // Plate positions: angles [-22,56,-62,12,66,-44,34,-8]° · heights [1.7,-1.3,.5,2.3,-2.2,-.3,1.2,-2.6] · radius 3.9 — plates are turned to face outward
  function layoutPanels(n) {
    const ang = [-22, 56, -62, 12, 66, -44, 34, -8], hgt = [1.7, -1.3, 0.5, 2.3, -2.2, -0.3, 1.2, -2.6];
    return Array.from({ length: n }, (_, i) => {
      const a = T.MathUtils.degToRad(ang[i % 8]), y = hgt[i % 8];
      const position = new T.Vector3(Math.sin(a) * 3.9, y, Math.cos(a) * 3.9);
      const normal = new T.Vector3(Math.sin(a), -y * 0.08, Math.cos(a)).normalize();
      const quaternion = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(position.clone().add(normal), position, new T.Vector3(0, 1, 0)));
      return { position, normal, tangent: new T.Vector3().crossVectors(new T.Vector3(0, 1, 0), normal).normalize(), quaternion, tilt: (i % 2 ? 1 : -1) * 0.05 };
    });
  }

  // Placeholder attached to the work panel — a website hero capture slot (header row, big title, photo cell)
  function placeholderTexture(i, P) {
    const cv = document.createElement("canvas"), g = cv.getContext("2d");
    cv.width = 960; cv.height = 424;
    const hex = (c, a = 1) => `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
    const light = i % 3 === 1;
    const bg = light ? P.ink : mixc(P.mid, P.bg, 0.4 + (i % 2) * 0.3), fg = light ? P.bg : P.ink;
    g.fillStyle = hex(bg); g.fillRect(0, 0, 960, 424);
    g.fillStyle = hex(fg, 0.12); g.fillRect(0, 0, 960, 44);
    g.fillStyle = hex(fg, 0.7); g.fillRect(28, 18, 90, 8);
    for (let k = 0; k < 4; k++) { g.fillStyle = hex(fg, 0.35); g.fillRect(560 + k * 86, 19, 56, 6); }
    const ix = i % 2 ? 470 : 40, iy = 76, iw = 450, ih = 300;
    g.fillStyle = hex(mixc(bg, fg, 0.18)); g.fillRect(ix, iy, iw, ih);
    g.strokeStyle = hex(fg, 0.3); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(ix, iy); g.lineTo(ix + iw, iy + ih); g.moveTo(ix + iw, iy); g.lineTo(ix, iy + ih); g.stroke();
    g.fillStyle = hex(fg, 0.85);
    g.font = `400 54px ${css("--kf-font-display")}`;
    const tx = i % 2 ? 40 : 520;
    g.fillText(`Work 0${i + 1}`, tx, 150);
    g.font = `500 17px ${css("--kf-font-sans")}`;
    g.fillStyle = hex(fg, 0.55);
    g.fillText("Website hero capture slot", tx, 196);
    g.fillText("Landscape 960:424 · a real screen recording video works too", tx, 224);
    g.fillStyle = hex(P.s3, 0.9); g.fillRect(tx, 262, 120, 34);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.NoColorSpace;
    return tex;
  }

  window.JbWorld = World;
})();
