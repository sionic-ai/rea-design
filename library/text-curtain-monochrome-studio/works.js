// Work log section — draws 12 cards in a single full-screen shader. Cards are SDF rounded rects, so when close they melt together like honey,
// Between neighbors hangs a sagging thread (thread·sag) that thins as they move apart until it snaps. The top and bottom 8% of the screen are thick glass borders (refraction 30px · color split 1.5px · ripple 5px).
// Sequence: the first card swells into a bubble (.5s) → moves outward (1.3s) → neighbors peel off to both sides and spread into a ring (3.6s power2.out, stagger .34) → rotates at .08rad/s.
// One wheel tick makes one full turn (2.6s power2.inOut) while scaling up 4.21x and retreating left (2.2s power2.inOut, .2s late). After that it turns by drag·arrows, and cards near the cursor get pulled in, swell and come alive in color
(() => {
  const host = document.querySelector("[data-works]");
  if (!host) return;
  const canvas = host.querySelector("[data-works-gl]");
  const tag = host.querySelector("[data-works-tag]");
  const index = host.querySelector("[data-works-index]");
  const tagLabel = tag ? tag.textContent : "";
  if (tag) tag.innerHTML = `<span class="works__tag-text">${tagLabel}</span><span class="works__tag-bar" aria-hidden="true">${tagLabel}</span>`;
  const tagText = tag?.firstElementChild, tagBar = tag?.lastElementChild;
  const cursorEl = host.querySelector("[data-works-cursor]");
  const list = host.querySelector("[data-works-list] ul");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 767px)");
  const WORKS = [
    ["Your work name one here", "Brand"], ["Your work name two", "Product"], ["Your work name three", "Website"],
    ["Your work name four", "Notes"], ["Your work name five here", "Anniversary"], ["Your work name six here", "Region"],
  ];
  const COUNT = 12, ART = WORKS.length;
  const items = Array.from({ length: COUNT }, (_, i) => ({ name: WORKS[i % ART][0], type: WORKS[i % ART][1], no: String((i % ART) + 1).padStart(3, "0") }));

  // Phone: two-column list instead of a ring (the original is also a list under 767)
  if (list) {
    list.innerHTML = items.slice(0, 6).map((it, i) => `<li><button type="button" class="works__card" data-open-work="${i}"><span class="works__thumb"><span class="wf-img" data-media-in data-label="Work cover photo ${it.no} · Black and white · Landscape 1.6:1"></span></span><span class="works__card-copy"><span class="works__card-name gv-bodoni">Project Title ${it.no}</span><span class="works__card-body">${it.name} — Introduce the work in two lines here.</span></span></button></li>`).join("");
    list.querySelectorAll("[data-open-work]").forEach((b) => b.addEventListener("click", () => window.GV?.drawer?.open()));
  }

  // Desktop stage right-hand list: one line per six pictures (category prefix_number + work name)
  if (index) index.innerHTML = WORKS.map((_, k) => `<li><button type="button" data-works-pick="${k}">${`Record Details_${String(k + 1).padStart(3, "0")}  Project Title ${["One", "Two", "Three", "Four", "Five", "Six"][k]}: Placeholder Name for the Work`.split(/\s+/).map((w) => `<span class="works__w">${w}</span>`).join(" ")}</button></li>`).join("");
  const rows = index ? [...index.children] : [];
  const words = index ? [...index.querySelectorAll(".works__w")] : [];

  if (!window.THREE || !canvas) return;
  const T = window.THREE;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // Original settings (px·seconds at 1440×800)
  const C = {
    entryPlane: 108, plane: 90, entryR: 254, ringR: 206, offX: -4, offY: 18, posX: -1.48, endScale: 4.21,
    narrowAt: 1024, narrowPlane: 1.25, narrowRadius: 1.3, narrowPosX: -2.5, narrowEndScale: 4.22, tightAt: 640, tightRadius: 0.82, tightPosX: -3.5,
    stagger: 0.34, launchTime: 1.3, spreadTime: 3.6, holdSpin: 0.08, spinTime: 2.6, moveTime: 2.2, moveDelay: 0.2,
    damping: 0.94, snapTime: 0.8, snapFrom: 1, pickTime: 0.55, scrollSpeed: 0.0022, maxSpeed: 12,
    goo: 35, wobble: 3, blend: 14, band: 0.08, refract: 30, squeeze: 0.05, ripple: 5, rippleFreq: 0.02, fringe: 1.5, sheen: 0.05,
    lag: 0.3, melt: 34, meltReach: 260, reach: 2.4, swell: 0.2, pull: 72, grab: 0.22, release: 0.06, web: 0.2, webReach: 1.15,
    wave: 4, waveFreq: 0.05, waveSpeed: 7, sideScale: 0.06, sidePush: 28, sideDim: 0.15, sideReach: 2.4,
    thread: 1, thin: 0.4, pinch: 0.35, sag: 6, dissolve: 2.9, fillet: 14, cursorFrom: 1024,
  };
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const outCubic = (v) => 1 - Math.pow(1 - v, 3);
  const inOutCubic = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
  const follow = (dt, k) => 1 - Math.pow(1 - k, 60 * dt);
  // Ring order: 0, 1, -1, 2, -2 … — peeled off alternately to both sides starting from the first card
  const ord = (e) => (e === 0 ? 0 : e % 2 ? (e + 1) / 2 : -e / 2);
  const artOf = (e) => ((-ord(e)) % ART + ART) % ART;

  // Six card images on one sheet (3×2 cells, each 1.6:1) — the shader reads only one sheet. This is our placeholder layout and the original photos are not used
  function atlas() {
    const cw = 640, ch = 400, c = document.createElement("canvas");
    c.width = cw * 3; c.height = ch * 2;
    const g = c.getContext("2d");
    const paper = css("--kf-raised"), ink = css("--kf-ink"), soft = css("--kf-ink-soft"), dim = css("--kf-dim"), bg = css("--kf-bg"), accent = css("--kf-accent"), surface = css("--kf-surface");
    for (let k = 0; k < ART; k++) {
      const x = (k % 3) * cw, y = Math.floor(k / 3) * ch;
      // Like the original card, art inside a white acrylic frame (7% edge · four screws) — the frame color becomes the honey strip color
      g.save(); g.beginPath(); g.rect(x, y, cw, ch); g.clip();
      g.fillStyle = paper; g.fillRect(x, y, cw, ch);
      g.fillStyle = surface; g.fillRect(x + cw * 0.02, y + ch * 0.03, cw * 0.96, ch * 0.94);
      const ix = x + cw * 0.07, iy = y + ch * 0.1, iw = cw * 0.86, ih = ch * 0.8;
      g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
      g.fillStyle = [ink, bg, soft, surface, dim, ink][k]; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = [soft, ink, paper, ink, paper, dim][k];
      if (k % 2) { g.beginPath(); g.arc(ix + iw * 0.5, iy + ih * 0.5, ih * 0.3, 0, TAU); g.fill(); }
      else g.fillRect(ix + iw * (0.16 + k * 0.03), iy + ih * 0.2, iw * (0.68 - k * 0.06), ih * 0.6);
      g.globalAlpha = 0.55; g.fillStyle = accent; g.fillRect(ix, iy + ih * 0.74, iw, ih * 0.26); g.globalAlpha = 1;
      g.fillStyle = k === 1 || k === 3 ? ink : paper;
      g.font = `400 ${Math.round(ch * 0.08)}px ${css("--kf-font-display") || "serif"}`;
      g.fillText(`WORK ${String(k + 1).padStart(3, "0")}`, ix + iw * 0.06, iy + ih * 0.9);
      g.restore();
      g.fillStyle = dim;
      for (const [sx, sy] of [[0.035, 0.06], [0.965, 0.06], [0.035, 0.94], [0.965, 0.94]]) { g.beginPath(); g.arc(x + cw * sx, y + ch * sy, ch * 0.018, 0, TAU); g.fill(); }
    }
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.NoColorSpace; t.flipY = false; t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter;
    return t;
  }

  const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`;
  const frag = `
    precision highp float;
    #define N 12
    varying vec2 vUv;
    uniform vec2 uRes, uSize, uGrid;
    uniform float uCount, uLinkCount, uK, uWobble, uTime, uBlend, uHoverPlane, uHoverColor, uBandT, uBandB, uFringe, uSheen;
    uniform vec2 uPos[N]; uniform float uRot[N]; uniform vec4 uScale[N];
    uniform vec2 uLinkA[N], uLinkB[N]; uniform vec4 uLinkP[N];
    uniform vec4 uMouse, uMelt, uGlass;
    uniform sampler2D uAtlas;

    float roundBox(vec2 p, vec2 hs, float r) {
      vec2 q = abs(p) - hs + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }
    // Melting union: if the difference of two distances is within k, join them smoothly
    float meld(float a, float b, float k) {
      if (k < 1e-4) return min(a, b);
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    // Honey band linking neighbors: a flat sheet pinched in the middle and sagging downward (ends are buried in the cards)
    float strand(vec2 p, vec2 a, vec2 b, vec4 par) {
      vec2 ab = b - a; float len = length(ab);
      if (len < 1e-3) return 1e6;
      vec2 dir = ab / len, nrm = vec2(-dir.y, dir.x);
      vec2 q = p - 0.5 * (a + b);
      float along = dot(q, dir), across = dot(q, nrm);
      float h = clamp(along / len + 0.5, 0.0, 1.0);
      float arch = sin(3.14159265 * h);
      across += par.z * arch * nrm.y;
      float r = mix(par.y, par.x, pow(1.0 - arch, 1.7));
      return max(abs(along) - 0.5 * len, abs(across) - r);
    }
    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
    }
    float gnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
      float a = dot(hash2(i), f), b = dot(hash2(i + vec2(1, 0)), f - vec2(1, 0));
      float c = dot(hash2(i + vec2(0, 1)), f - vec2(0, 1)), d = dot(hash2(i + vec2(1, 1)), f - vec2(1, 1));
      return 1.6 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    // Top and bottom glass borders: the inner edge barely bends and the outer edge bends sharply, a rounded cross-section — reading the inside backwards stretches the image into the border
    float lip(inout vec2 p) {
      float band = p.y > 0.0 ? uBandT : uBandB;
      if (band < 0.5) return 0.0;
      float into = abs(p.y) - (0.5 * uRes.y - band);
      if (into <= 0.0) return 0.0;
      float t = clamp(into / band, 0.0, 1.0);
      float bend = 1.0 - sqrt(max(0.0, 1.0 - t * t));
      p.y -= sign(p.y) * bend * (uGlass.x + sin(p.x * uGlass.w) * uGlass.z);
      p.x *= 1.0 - bend * uGlass.y;
      return bend;
    }
    vec2 cell(vec2 uv, float k) { return (vec2(mod(k, uGrid.x), floor(k / uGrid.x)) + uv) / uGrid; }
    // The color split widens only on the outside, in proportion to the glass edge depth (bend) — branches are split with uniform so the mipmap derivatives don’t wobble
    vec3 art(vec2 uv, float k, float fr) {
      if (uFringe <= 0.0) return texture2D(uAtlas, cell(uv, k)).rgb;
      vec2 o = vec2(fr, 0.0);
      return vec3(texture2D(uAtlas, cell(clamp(uv + o, 0.004, 0.996), k)).r, texture2D(uAtlas, cell(uv, k)).g, texture2D(uAtlas, cell(clamp(uv - o, 0.004, 0.996), k)).b);
    }

    void main() {
      vec2 p = (vUv - 0.5) * uRes;
      float bend = lip(p);
      float toMouse = length(p - uMouse.xy);
      float k = uK;
      if (uMouse.z > 0.001) { float s = 1.0 - smoothstep(0.0, max(uMelt.x, 1.0), toMouse); k += uMouse.w * uMouse.z * s * s; }

      float d = 1e6, d0 = 1e6, d1 = 1e6, i0 = -1.0, i1 = -1.0;
      vec2 uv0 = vec2(0.5), uv1 = vec2(0.5);
      vec2 dm = vec2(1.0), im = vec2(0.0);
      float span = 0.5 * length(uSize);
      for (int i = 0; i < N; i++) {
        if (float(i) >= uCount) break;
        vec4 sc = uScale[i];
        float grow = max(sc.x, sc.y);
        if (grow < 1e-4) continue;
        vec2 q = p - uPos[i];
        float reach = span * grow + k + uWobble + 8.0;
        if (dot(q, q) > reach * reach) continue;
        float c = cos(uRot[i]), s = sin(uRot[i]);
        q = vec2(q.x * c + q.y * s, -q.x * s + q.y * c);
        vec2 hs = max(0.5 * uSize * sc.xy, vec2(1e-4));
        float rMax = min(hs.x, hs.y);
        // Born as a droplet, and once fully grown becomes a card with angular corners
        float r = mix(rMax, 0.0, smoothstep(0.3, 1.0, min(sc.x, sc.y)));
        float di = roundBox(q, hs, r);
        d = meld(d, di, k);
        vec2 luv = clamp(vec2(q.x / (2.0 * hs.x) + 0.5, 0.5 - q.y / (2.0 * hs.y)), 0.004, 0.996);
        if (di < d0) { d1 = d0; uv1 = uv0; i1 = i0; dm.y = dm.x; im.y = im.x; d0 = di; uv0 = luv; i0 = float(i); dm.x = sc.z; im.x = sc.w; }
        else if (di < d1) { d1 = di; uv1 = luv; i1 = float(i); dm.y = sc.z; im.y = sc.w; }
      }
      for (int i = 0; i < N; i++) {
        if (float(i) >= uLinkCount) break;
        vec4 par = uLinkP[i];
        if (par.x <= -3.0) continue;
        vec2 a = uLinkA[i], b = uLinkB[i], mid = 0.5 * (a + b);
        float reach = 0.5 * length(b - a) + par.x + par.w + 8.0;
        if (dot(p - mid, p - mid) > reach * reach) continue;
        d = meld(d, strand(p, a, b, par), par.w);
      }
      if (uWobble > 0.001) d += gnoise(p * 0.012 + vec2(uTime * 0.22, -uTime * 0.17)) * uWobble;
      if (uMelt.y > 0.001) d += sin(toMouse * uMelt.z - uTime * uMelt.w) * uMelt.y * exp(-toMouse / max(uMelt.x, 1.0));

      float aa = clamp(fwidth(d), 0.5, 2.0);
      float alpha = 1.0 - smoothstep(-aa, aa, d);
      if (alpha <= 0.001) discard;
      float pick = smoothstep(-uBlend, uBlend, d1 - d0);
      float fr = uFringe * bend / max(uSize.x, 1.0);
      vec3 c0 = art(uv0, im.x, fr), c1 = art(uv1, im.y, fr);
      vec3 luma = vec3(0.2126, 0.7152, 0.0722);
      float h0 = (1.0 - step(0.5, abs(i0 - uHoverPlane))) * uHoverColor;
      float h1 = (1.0 - step(0.5, abs(i1 - uHoverPlane))) * uHoverColor;
      c0 = mix(vec3(dot(c0, luma)), c0, h0);
      c1 = mix(vec3(dot(c1, luma)), c1, h1);
      vec3 col = mix(c1, c0, pick) * mix(dm.y, dm.x, pick);
      col += bend * uSheen;
      gl_FragColor = vec4(col, alpha);
    }`;

  const vec2s = () => Array.from({ length: COUNT }, () => new T.Vector2());
  const U = {
    uRes: { value: new T.Vector2(1, 1) }, uSize: { value: new T.Vector2(108, 67.5) }, uGrid: { value: new T.Vector2(3, 2) },
    uCount: { value: COUNT }, uLinkCount: { value: 0 }, uK: { value: C.goo }, uWobble: { value: 0 }, uTime: { value: 0 }, uBlend: { value: C.blend },
    uHoverPlane: { value: -1 }, uHoverColor: { value: 0 }, uBandT: { value: 0 }, uBandB: { value: 0 }, uFringe: { value: C.fringe }, uSheen: { value: C.sheen },
    uPos: { value: vec2s() }, uRot: { value: new Float32Array(COUNT) }, uScale: { value: Array.from({ length: COUNT }, () => new T.Vector4(0, 0, 1, 0)) },
    uLinkA: { value: vec2s() }, uLinkB: { value: vec2s() }, uLinkP: { value: Array.from({ length: COUNT }, () => new T.Vector4(-100, -100, 0, 0)) },
    uMouse: { value: new T.Vector4() }, uMelt: { value: new T.Vector4() }, uGlass: { value: new T.Vector4(C.refract, C.squeeze, C.ripple, C.rippleFreq) },
    uAtlas: { value: atlas() },
  };
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new T.Scene(), camera = new T.Camera();
  const quad = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: U, transparent: true, depthTest: false, depthWrite: false }));
  quad.frustumCulled = false;
  scene.add(quad);
  // Shaders in advance when built: compiling them on the first gesture freezes the screen
  renderer.compile(scene, camera);

  // States as in the original: progress (first drop) → launch (departure) → spread (unfolding) → spin (rotating) → shift (to the stage)
  const S = { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 };
  let phase = "idle", live = false, holdSpin = false, vel = 0, dragging = false, picking = false, snapping = false, snapTo = 0, snapMax = 0, queued = false;
  let W = 1440, H = 800, eb = 1, narrow = false, tight = false, last = 0, raf = 0, entryTl = null, focusArt = -1;
  const mouse = { x: 0, y: 0, inside: false, seeded: false }, lagged = { x: 0, y: 0, amt: 0, wake: 0 };
  const hov = new Float32Array(COUNT), pullX = new Float32Array(COUNT), pullY = new Float32Array(COUNT), side = new Float32Array(COUNT), web = new Float32Array(COUNT);
  const tg = new Float32Array(8), tv = new Float32Array(8);
  const base = Array.from({ length: COUNT }, () => ({ x: 0, y: 0 }));
  const sorted = Array.from({ length: COUNT }, (_, e) => e).sort((a, b) => ord(a) - ord(b));
  let hovered = -1, colorPlane = -1, focus = 0, ringX = 0, ringY = 0, ringR = 1, plane = 108;

  function resize() {
    const r = host.getBoundingClientRect();
    W = r.width || innerWidth; H = r.height || innerHeight;
    eb = Math.min(3, Math.max(0.5, Math.max(W / 1440, H / 800)));
    narrow = W <= C.narrowAt; tight = W <= C.tightAt;
    renderer.setSize(W, H, false);
    U.uRes.value.set(W, H);
  }
  new ResizeObserver(resize).observe(host);
  resize();

  const swell = (e) => Math.max(0.05, 1 + C.swell * hov[e] - C.sideScale * side[e]);

  function layout(dt) {
    const a = clamp01(S.spread), l = clamp01(S.shift), r = TAU / COUNT;
    const endScale = narrow ? C.narrowEndScale : C.endScale, posX = tight ? C.tightPosX : narrow ? C.narrowPosX : C.posX;
    const h = (1 + (endScale - 1) * l) * eb;
    const c = posX * W * 0.5 * l;
    const f = c + C.offX * eb * a, m = -C.offY * eb * a * (1 - l);
    const ePlane = narrow ? C.narrowPlane : 1, eRad = (narrow ? C.narrowRadius : 1) * (tight ? C.tightRadius : 1);
    const x = (C.entryPlane + (C.plane - C.entryPlane) * l) * (1 + (ePlane - 1) * l) * h, M = x / 1.6;
    const R = (C.entryR + (C.ringR - C.entryR) * l) * (1 + (eRad - 1) * l) * h;
    ringX = f; ringY = m; ringR = R; plane = x;
    U.uSize.value.set(x, M);
    const gap = Math.max(1, 2 * R * Math.sin(r / 2) - M);
    const L = Math.abs(ord(COUNT - 1)), Nw = Math.max(0.1, 0.94 - C.stagger);
    tv[0] = 0;
    for (let e = 1; e <= L; e++) { const t = clamp01((a - (0.06 + ((e - 1) / L) * C.stagger)) / Nw); tg[e] = t * t * (3 - 2 * t); tv[e] = tv[e - 1] + tg[e]; }
    const D = inOutCubic(clamp01(S.launch)), O = R * D;
    const on = lagged.amt > 0.001, B = Math.max(1, C.reach * x), Z = Math.max(1, C.sideReach * x);
    const gIn = follow(dt, C.grab), gOut = follow(dt, C.release);
    const hoverRef = hovered >= 0 ? base[hovered] : null;
    let best = 1e9, bestE = 0, hit = -1;
    for (let e = 0; e < COUNT; e++) {
      const t = ord(e), n = e === 0 ? clamp01(S.progress) : tg[Math.abs(t)];
      const ang = Math.sign(t) * r * tv[Math.abs(t)] + S.spin;
      const ox = Math.cos(ang) * O + f, oy = Math.sin(ang) * O + m;
      base[e].x = ox; base[e].y = oy;
      const off = Math.abs(Math.atan2(Math.sin(ang), Math.cos(ang)));
      if (off < best) { best = off; bestE = e; }
      // The card beside the cursor is pulled toward the cursor (up to 72px) and swells — follows at .22 when approaching and .06 when leaving
      let u = 0, px = 0, py = 0;
      if (on) {
        const dx = lagged.x - ox, dy = lagged.y - oy, dist = Math.hypot(dx, dy);
        u = smooth(B, 0.22 * B, dist) * lagged.amt * n;
        if (u > 1e-4 && dist > 1e-4) { const k = (C.pull * eb * u) / dist; px = dx * k; py = dy * k; }
      }
      const g = u > hov[e] ? gIn : gOut;
      hov[e] += (u - hov[e]) * g; pullX[e] += (px - pullX[e]) * g; pullY[e] += (py - pullY[e]) * g;
      // Neighbors of the pointed card shrink a bit (.06), darken (.15) and are pushed away 28px
      let v = 0;
      if (hoverRef && e !== hovered) v = smooth(Z, 0.2 * Z, Math.hypot(hoverRef.x - ox, hoverRef.y - oy)) * n;
      side[e] += (v - side[e]) * (v > side[e] ? gIn : gOut);
      let sx = 0, sy = 0;
      if (side[e] > 1e-4 && hoverRef) { const dx = ox - hoverRef.x, dy = oy - hoverRef.y, dd = Math.hypot(dx, dy); if (dd > 1e-4) { const k = (C.sidePush * eb * side[e]) / dd; sx = dx * k; sy = dy * k; } }
      const px2 = ox + pullX[e] + sx, py2 = oy + pullY[e] + sy;
      U.uPos.value[e].set(px2, py2);
      const rot = ang * D;
      U.uRot.value[e] = rot;
      const sX = e === 0 ? outCubic(clamp01(n / 0.7)) : outCubic(clamp01(n / 0.34));
      const sY = e === 0 ? outCubic(clamp01((n - 0.18) / 0.74)) : outCubic(clamp01((n - 0.06) / 0.36));
      const k = swell(e);
      U.uScale.value[e].set(sX * k, sY * k, 1 - C.sideDim * side[e], artOf(e));
      if (live && mouse.inside && hit < 0) {
        const cx = Math.cos(rot), sn = Math.sin(rot), dx = lagged.x - px2, dy = lagged.y - py2;
        if (Math.abs(dx * cx + dy * sn) <= 0.5 * x * sX * k && Math.abs(-dx * sn + dy * cx) <= 0.5 * M * sY * k) hit = e;
      }
    }
    hovered = hit;
    focus = bestE;
    let top = -1, amt = 0;
    for (let e = 0; e < COUNT; e++) if (hov[e] > amt) { amt = hov[e]; top = e; }
    if (hovered >= 0) colorPlane = hovered; else if (top >= 0) colorPlane = top;
    const cAmt = colorPlane >= 0 ? hov[colorPlane] : 0;
    if (cAmt < 0.001) colorPlane = -1;
    U.uHoverPlane.value = colorPlane; U.uHoverColor.value = cAmt;

    // Thread between neighbors: the wider the gap (relative to the rest gap), the thinner and narrower it gets, sagging until it melts away. Threads beside the cursor revive by .2
    const reachT = 0.5 * M * C.thread, links = Math.min(a > 0.995 ? COUNT : COUNT - 1, COUNT);
    for (let e = 0; e < links; e++) {
      const i = sorted[e], j = sorted[(e + 1) % COUNT];
      const sa = U.uScale.value[i], sb = U.uScale.value[j];
      const la = sa.y / swell(i), lb = sb.y / swell(j);
      const u = clamp01((Math.hypot(base[i].x - base[j].x, base[i].y - base[j].y) - 0.5 * M * (la + lb)) / gap);
      let w = 0;
      if (on) { const pa = U.uPos.value[i], pb = U.uPos.value[j], wr = Math.max(1, C.webReach * x); w = smooth(wr, 0.15 * wr, Math.hypot(lagged.x - (pa.x + pb.x) / 2, lagged.y - (pa.y + pb.y) / 2)) * lagged.amt; }
      web[e] += (w - web[e]) * (w > web[e] ? gIn : gOut);
      const rEnd = reachT * Math.max(Math.pow(1 - u, C.thin), C.web * web[e]) - C.dissolve;
      const rMid = rEnd * (1 - (1 - C.pinch) * smooth(0, 0.7, u));
      U.uLinkA.value[e].copy(U.uPos.value[i]); U.uLinkB.value[e].copy(U.uPos.value[j]);
      U.uLinkP.value[e].set(rEnd, rMid, C.sag * h * Math.pow(u, 1.5), Math.min(C.fillet * h * smooth(0, 0.35, u), 1.5 * Math.max(rMid, 0)));
    }
    for (let e = links; e < COUNT; e++) U.uLinkP.value[e].set(-100, -100, 0, 0);
    U.uLinkCount.value = links;
    U.uK.value = C.goo * ePlane * eb;
    U.uWobble.value = C.wobble * eb * (1 - smooth(0.2, 0.95, S.progress));
    U.uBlend.value = Math.max(0.5, C.blend * ePlane * h);
    U.uBandT.value = U.uBandB.value = C.band * H;
  }

  // Show the image number of the center card on the matching row of the right-hand list
  function setMeta(i) {
    const k = artOf(i);
    if (k === focusArt) return;
    focusArt = k;
    rows.forEach((li, n) => (n === k ? li.setAttribute("aria-current", "true") : li.removeAttribute("aria-current")));
  }

  // After drag·inertia, snaps to the nearest slot — when speed drops below half a slot width, it sets the stopping spot and approaches at 4.8/.8s strength
  function settle(dt) {
    S.spin += vel * dt;
    vel *= Math.pow(C.damping, 60 * dt);
    const slot = TAU / COUNT, rate = Math.max(0.01, -(60 * Math.log(C.damping))), from = Math.max(C.snapFrom, rate * slot * 0.5), k = 4.8 / C.snapTime;
    let diff = 0;
    if (!snapping && Math.abs(vel) < from) { snapTo = Math.round((S.spin + vel / rate) / slot) * slot; snapMax = Math.max(Math.abs(vel), 0.5 * slot * k); snapping = true; }
    if (snapping) { diff = snapTo - S.spin; const want = Math.max(-snapMax, Math.min(snapMax, diff * k)); vel += (want - vel) * clamp01(k * dt); }
    if (Math.abs(vel) < 0.0015 && Math.abs(diff) < 8e-4) { vel = 0; S.spin += diff; }
  }

  // The nameplate shows from the moment it is moving to the stage (once moved past .18)
  const cursorOn = () => mouse.inside && (live || S.shift >= 0.18) && W > C.cursorFrom && matchMedia("(hover: hover)").matches;
  let cursorShown = false;
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    U.uTime.value = now / 1000;
    if (holdSpin && !reduce) S.spin -= C.holdSpin * dt;
    if (live && !dragging && !picking) settle(dt);
    const want = live && mouse.inside && mouse.seeded && !reduce ? 1 : 0;
    lagged.amt += (want - lagged.amt) * follow(dt, 0.12);
    const k = follow(dt, C.lag);
    lagged.x += (mouse.x - lagged.x) * k; lagged.y += (mouse.y - lagged.y) * k;
    const lagD = Math.hypot(mouse.x - lagged.x, mouse.y - lagged.y);
    lagged.wake = Math.max(lagged.wake * Math.pow(0.94, 60 * dt), clamp01(lagD / (2600 * Math.max(dt, 0.001))));
    U.uMouse.value.set(lagged.x, lagged.y, lagged.amt, C.melt * eb);
    U.uMelt.value.set(C.meltReach * eb, C.wave * eb * lagged.wake * lagged.amt, C.waveFreq, C.waveSpeed);
    loadTick(dt);
    layout(dt);
    canvas.style.cursor = dragging ? "grabbing" : hovered >= 0 && live ? "pointer" : "";
    // Cursor label: the lagging cursor position +12px (it still tracks even when hidden), View when over a card
    const show = cursorOn();
    if (cursorEl) {
      if (mouse.seeded) gsap.set(cursorEl, { x: lagged.x + W / 2 + 12, y: H / 2 - lagged.y + 12 });
      if (show) {
        const text = hovered >= 0 ? "View" : "Drag", span = cursorEl.querySelector("span");
        if (span && span.textContent !== text) span.textContent = text;
      }
      if (show !== cursorShown) { cursorShown = show; gsap.to(cursorEl, { autoAlpha: show ? 1 : 0, duration: show ? 0 : 0.2, overwrite: "auto" }); }
    }
    if (live && !dragging && !picking && vel === 0) setMeta(focus);
    renderer.render(scene, camera);
  }

  function entry() {
    if (phase !== "idle") return;
    phase = "entry";
    Object.assign(S, { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 });
    gsap.set(tag, { autoAlpha: 0 });
    if (reduce) { Object.assign(S, { progress: 1, launch: 1, spread: 1 }); gsap.set(tag, { autoAlpha: 1 }); phase = "hold"; return; }
    // During the first drop (.5s) the % at bottom right fills along (.18 per frame), and at 100% the % exits in .45s and from then on the exit · spread-out continue
    loadShown = 0; loadDone = false;
    if (loadEl) gsap.set(loadEl, { autoAlpha: 1 });
    const tl = (entryTl = gsap.timeline({ delay: 0.15 }));
    tl.to(S, { progress: 1, duration: 0.5, ease: "power2.out" }, 0);
    tl.addPause(0.5);
    tl.to(S, { launch: 1, duration: C.launchTime, ease: "power2.inOut" }, 0.5);
    // Nameplate: dark text is revealed from the left in 1s power2.out, and .5s later a dark band (white text) covers it in .8s power2.inOut
    const at = 0.5 + C.launchTime * 0.58;
    tl.set(tag, { autoAlpha: 1 }, at);
    tl.fromTo(tagText, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.out" }, at);
    tl.fromTo(tagBar, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut" }, at + 0.5);
    const spreadAt = 0.5 + C.launchTime - 0.15;
    tl.to(S, { spread: 1, duration: C.spreadTime, ease: "power2.out" }, spreadAt);
    tl.call(() => { holdSpin = true; phase = "hold"; if (queued) { queued = false; toStage(); } }, null, spreadAt + C.spreadTime);
  }
  const loadEl = document.createElement("p");
  loadEl.className = "works__load"; loadEl.setAttribute("aria-hidden", "true"); loadEl.textContent = "1%";
  host.append(loadEl);
  let loadShown = 0, loadDone = true;
  function loadTick(dt) {
    if (loadDone) return;
    loadShown += (clamp01(S.progress) - loadShown) * follow(dt, 0.18);
    const pct = Math.min(100, Math.max(1, Math.round(100 * loadShown)));
    loadEl.textContent = `${pct}%`;
    if (pct < 100) return;
    loadDone = true;
    gsap.to(loadEl, { autoAlpha: 0, duration: 0.45, ease: "power2.in" });
    entryTl && entryTl.paused() && entryTl.resume();
  }

  function toStage() {
    if (phase !== "hold" && !(phase === "entry" && S.spread >= 0.9)) return false;
    phase = "moving"; holdSpin = false;
    entryTl && entryTl.kill();
    S.progress = S.launch = 1;
    // The card with the first picture (001) (ring order 0·6 — half a turn apart) spins at least one more full turn from the nearest position where it stands at the center
    let target = Math.round(S.spin / Math.PI) * Math.PI;
    while (S.spin - target < TAU - 1e-4) target -= TAU;
    const tl = gsap.timeline({ onComplete: () => { phase = "final"; live = true; vel = 0; snapping = false; } });
    tl.to(tag, { autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: "power2.in" }, 0);
    tl.to(S, { spread: 1, duration: reduce ? 0 : 0.3 }, 0);
    tl.to(S, { spin: target, duration: reduce ? 0 : C.spinTime, ease: "power2.inOut" }, 0);
    tl.to(S, { shift: 1, duration: reduce ? 0 : C.moveTime, ease: "power2.inOut" }, reduce ? 0 : C.moveDelay);
    // Once all items are on stage (2.4s), the list animates word by word from 0 scale and 75% below in shuffled order over .8s power2.out (.05 stagger)
    if (index && words.length) {
      tl.set(index, { opacity: 1, pointerEvents: "auto" }, reduce ? 0 : C.moveDelay + C.moveTime);
      tl.fromTo(gsap.utils.shuffle([...words]), { opacity: 0, yPercent: 75, scale: 0 }, { opacity: 1, yPercent: 0, scale: 1, duration: reduce ? 0 : 0.8, ease: "power2.out", stagger: reduce ? 0 : 0.05 }, reduce ? 0 : C.moveDelay + C.moveTime);
    }
    tl.add(() => { live = true; }, reduce ? 0 : Math.max(C.moveDelay + C.moveTime, C.spinTime));
    return true;
  }

  // Section-switch wheel interception (as in the original): while expanding, wheel input is collected and applied to the stage once expanded, on the ring the first wheel goes to the stage, on the stage the wheel is handed back to section switching
  window.GV?.intercept("works", (delta) => {
    if (mobile.matches) return false;
    if (phase === "moving") return true;
    if (delta <= 0 || phase === "final") return false;
    if (phase === "hold" || S.spread >= 0.9) return toStage() || true;
    if (Math.abs(delta) >= 8) { queued = true; return true; }
    return false;
  });

  // Angle of rotation around the ring center — it turns as much as you drag, and after release it glides at that speed
  const toLocal = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left - r.width / 2, y: r.height / 2 - (e.clientY - r.top) }; };
  const angleAt = (e) => { const p = toLocal(e); return Math.atan2(p.y - ringY, p.x - ringX); };
  let lastA = 0, lastT = 0, travel = 0, downX = 0, downY = 0;
  host.addEventListener("pointermove", (e) => {
    const p = toLocal(e);
    // Above the right list is outside the loop (the original list is a separate layer laid over the loop panel)
    mouse.x = p.x; mouse.y = p.y; mouse.inside = e.pointerType === "mouse" && !e.target.closest?.("[data-works-index]");
    if (!mouse.seeded) { mouse.seeded = true; lagged.x = p.x; lagged.y = p.y; }
    travel += Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY); downX = e.clientX; downY = e.clientY;
    if (!dragging) return;
    const a = angleAt(e);
    let d = a - lastA;
    if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU;
    S.spin += d;
    const now = performance.now();
    vel = d / (Math.max(8, now - lastT) / 1000);
    lastA = a; lastT = now;
  });
  host.addEventListener("pointerdown", (e) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || e.target.closest?.("[data-works-index]")) return;
    travel = 0; downX = e.clientX; downY = e.clientY;
    const p = toLocal(e);
    mouse.x = p.x; mouse.y = p.y; mouse.inside = e.pointerType === "mouse"; mouse.seeded = true;
    if (!live || mobile.matches) return;
    picking && gsap.killTweensOf(S, "spin"); picking = false;
    dragging = true; snapping = false; vel = 0; lastA = angleAt(e); lastT = performance.now();
    canvas.setPointerCapture?.(e.pointerId);
  });
  const release = (e) => { if (!dragging) return; dragging = false; canvas.hasPointerCapture?.(e.pointerId) && canvas.releasePointerCapture(e.pointerId); };
  host.addEventListener("pointerup", release);
  host.addEventListener("pointercancel", release);
  host.addEventListener("pointerleave", () => { mouse.inside = false; });
  // Rotates the card to the center (.55s × √count, power3.inOut) — clicking a card then opens the detail drawer, list rows only rotate
  function pick(e, open) {
    const slot = TAU / COUNT, want = -Math.sign(ord(e)) * slot * Math.abs(ord(e));
    const target = want + Math.round((S.spin - want) / TAU) * TAU, steps = Math.abs(target - S.spin) / slot;
    if (steps < 0.01) return open && window.GV?.drawer?.open();
    picking = true; snapping = false; vel = 0;
    gsap.to(S, { spin: target, duration: reduce ? 0 : C.pickTime * Math.sqrt(Math.max(1, steps)), ease: "power3.inOut", onComplete: () => { picking = false; open && window.GV?.drawer?.open(); } });
  }
  host.addEventListener("click", (e) => {
    const row = e.target.closest?.("[data-works-pick]");
    if (row) {
      if (!live) return;
      // Among the cards carrying that image, the one closest to the current position
      const k = +row.dataset.worksPick, slot = TAU / COUNT;
      let best = -1, bd = Infinity;
      for (let i = 0; i < COUNT; i++) {
        if (artOf(i) !== k) continue;
        const want = -Math.sign(ord(i)) * slot * Math.abs(ord(i)), d = Math.abs(want + Math.round((S.spin - want) / TAU) * TAU - S.spin);
        if (d < bd) { bd = d; best = i; }
      }
      return best >= 0 && pick(best, false);
    }
    if (!live || travel >= 10 || hovered < 0) return;
    pick(hovered, true);
  });
  addEventListener("keydown", (e) => {
    if (!live || window.GV?.key !== "works" || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    snapping = false;
    vel = Math.max(-C.maxSpeed, Math.min(C.maxSpeed, vel + (e.key === "ArrowLeft" ? -120 : 120) * C.scrollSpeed));
  });

  // While the detail drawer is up, ring drawing stops like the original (resumes from the same spot when the drawer closes)
  let drawerOn = false;
  const start = () => { if (!raf && !drawerOn) { last = 0; raf = requestAnimationFrame(tick); } entry(); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const drawerEl = document.querySelector("[data-drawer]");
  drawerEl?.addEventListener("gv:drawer-open", () => { drawerOn = true; stop(); });
  drawerEl?.addEventListener("gv:drawer-close", () => { drawerOn = false; if (window.GV?.key === "works") start(); });
  window.GV?.on((type, key) => {
    if (key !== "works") return;
    if (type === "shown" || (type === "enter" && host.dataset.startNow !== undefined)) start();
    if (type === "leave") stop();
  });
  if (window.GV?.key === "works") start();
  host.addEventListener("gv:stage", () => { if (phase === "entry") { entryTl && entryTl.progress(1); } toStage(); });
})();
