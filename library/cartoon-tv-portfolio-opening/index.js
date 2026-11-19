/* Home stage — as in the original, the whole screen is a single three.js canvas.
   The background is one shader that changes form per scene (concentric circles·sunrays·dome·curtain·diagonal pattern…), and transitions blend with a different mask per form (TV screen·card·dome·iris).
   TV, 3D letters, cards, stars and remote are our own shapes, and a film texture (grain, scanlines, color bleed, vignette) is applied once more over the finished panel.
   Scroll lowers the window by the height of .qd-track, and the stage follows that spot at the .072 ratio, same as the original virtual scroll. */
(async () => {
  const { reduce, color, css, font } = QD;
  // The loader spins right away — the scene is built after the fonts arrive (so text painted on the canvas doesn’t lock to a fallback font)
  let ready = false, startIntro = null;
  QD.runLoader(() => ready, () => startIntro && startIntro());
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease2 = gsap.parseEase("power2.out"), ease2io = gsap.parseEase("power2.inOut");

  const cv = $(".qd-gl");
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, stencil: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 0, 1);
  const scene = new THREE.Scene();
  const bgScene = new THREE.Scene(), postScene = new THREE.Scene();
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let W = 1, H = 1, unit = 1, portrait = false;
  const VH = 2 * Math.tan((45 / 2) * Math.PI / 180); // z=Visible height at 0 (camera distance 1)
  const px = (v) => v * unit;

  // ── Skin colors ──
  const C = {};
  const readColors = () => {
    ["--kf-bg", "--kf-surface", "--kf-accent", "--kf-ink", "--site-ring-deep", "--site-ring-light", "--site-sun-a", "--site-sun-b", "--site-sun-deep",
      "--site-works-face", "--site-ellipse", "--site-pink", "--site-magenta", "--site-wine", "--site-curtain", "--site-blue", "--site-blue-hi",
      "--site-cyan", "--site-room", "--site-tv", "--site-cream", "--site-white"].forEach((n) => (C[n.replace(/^--(kf|site)-/, "")] = new THREE.Vector3(...color(n))));
  };
  readColors();
  const cssc = (n) => css(n);
  const FONT = () => font("--kf-font-display"), SCRIPT = () => font("--kf-font-script");
  await Promise.race([
    Promise.all([`40px ${FONT()}`, `italic 700 40px ${SCRIPT()}`, `600 26px ${font("--kf-font-sans")}`].map((f) => document.fonts.load(f, "AaA0").catch(() => {}))),
    new Promise((r) => setTimeout(r, 3000)),
  ]);

  // ── Canvas texture helpers ──
  const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t; };
  const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const wrap = (g, text, maxW) => {
    const words = text.split(/\s+/), out = []; let line = "";
    words.forEach((w) => { const t = line ? `${line} ${w}` : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
    if (line) out.push(line); return out;
  };
  // Photo spot: diagonal planes in two Skin colors plus a label saying what the photo is
  const shotTexture = (label, a, b, title) => {
    const c = canvas(640, 480), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 640, 480); gr.addColorStop(0, cssc(a)); gr.addColorStop(1, cssc(b));
    g.fillStyle = gr; g.fillRect(0, 0, 640, 480);
    g.globalAlpha = 0.18; g.fillStyle = cssc("--kf-ink");
    for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(80 + i * 90, 360 - (i % 3) * 60, 40 + (i % 4) * 18, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = cssc("--kf-ink"); g.textAlign = "center";
    if (title) { g.font = `56px ${FONT()}`; g.fillText(title, 320, 150); }
    g.font = `600 26px ${font("--kf-font-sans")}`;
    wrap(g, label, 520).forEach((l, i) => g.fillText(l, 320, 230 + i * 36));
    g.font = `600 18px ${font("--kf-font-sans")}`; g.globalAlpha = 0.6; g.fillText("Photo slot", 320, 440); g.globalAlpha = 1;
    return tex(c);
  };

  // ── 1. Background shader: blends scene types A·B by a mask shape ──
  const patternTex = (() => {
    const c = canvas(1024, 256), g = c.getContext("2d");
    g.fillStyle = cssc("--site-cream"); g.font = `150px ${FONT()}`; g.textBaseline = "middle";
    const word = ($("[data-gl=awards-word]")?.textContent || "").trim() + " ";
    let x = 0; while (x < 1024 + 400) { g.fillText(word, x, 128); x += g.measureText(word).width; }
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  })();
  const bgU = {
    uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() },
    uA: { value: 0 }, uB: { value: 0 }, uMix: { value: 0 }, uWipe: { value: 0 }, uP: { value: 0 }, uPB: { value: 0 },
    uRect: { value: new THREE.Vector4(0.5, 0.5, 0.1, 0.1) }, uRingC: { value: new THREE.Vector2(0.5, 0.42) }, uRingScale: { value: 1 },
    uPattern: { value: patternTex }, uDark: { value: 0 },
  };
  Object.keys(C).forEach((k) => (bgU[`c_${k.replace(/-/g, "_")}`] = { value: C[k] }));
  const colorUniforms = Object.keys(C).map((k) => `uniform vec3 c_${k.replace(/-/g, "_")};`).join("\n");
  const bgMat = new THREE.ShaderMaterial({
    uniforms: bgU, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uRes, uMouse, uRingC; uniform float uTime, uA, uB, uMix, uWipe, uP, uPB, uRingScale, uDark;
      uniform vec4 uRect; uniform sampler2D uPattern;
      ${colorUniforms}
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
      float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }
      vec2 aspect(vec2 uv, vec2 c){ return (uv - c) * vec2(uRes.x / uRes.y, 1.0); }
      // Concentric rings: each ring has shade on its inner edge, darker toward the outside. uMouse is the distance (uv) the whole ring is pushed by the cursor
      vec3 rings(vec2 uv){
        float sp = 0.195 * uRingScale, r0 = 0.27 * uRingScale;
        vec3 col = c_ring_light;
        for (int i = 0; i < 6; i++){
          float fi = float(i);
          vec2 c = uRingC + uMouse;
          float r = length(aspect(uv, c));
          float edge = r0 + sp * fi;
          float inside = step(edge, r);
          float k = (fi + 1.0) / 6.0;
          vec3 band = mix(mix(c_ring_light, c_bg, smoothstep(0.0, 0.45, k)), c_ring_deep, smoothstep(0.45, 1.15, k));
          float d = r - edge;
          float shade = 0.55 + 0.45 * smoothstep(0.0, 0.05, d);
          float lift = smoothstep(sp, 0.0, d) * 0.08;
          col = mix(col, band * shade + lift, inside);
        }
        float r = length(aspect(uv, uRingC + uMouse));
        col = mix(col, mix(c_ring_light, c_accent, 0.12), smoothstep(r0, 0.0, r) * 0.35);
        return col;
      }
      vec3 sunburst(vec2 uv, vec2 c, float n, float speed){
        vec2 d = aspect(uv, c); float a = atan(d.y, d.x), r = length(d);
        float ray = smoothstep(-0.35, 0.35, sin(a * n + uTime * speed + sin(r * 6.0 - uTime) * 0.15));
        vec3 col = mix(c_sun_a, c_sun_b, ray);
        col = mix(col, mix(c_accent, c_sun_b, 0.4), smoothstep(0.55, 0.0, r) * 0.45);
        col = mix(col, c_sun_deep, smoothstep(0.55, 1.2, r) * 0.6);
        float streak = step(0.985, hash(vec2(floor(a * 60.0), floor(r * 8.0 - uTime * 2.0)))) * smoothstep(0.15, 0.6, r);
        col += streak * 0.12;
        col = mix(col, c_sun_deep * 0.55, uDark * smoothstep(0.42, 0.0, r));
        return col;
      }
      vec3 glow(vec2 uv, vec3 base, vec3 hi, float rad){ float r = length(aspect(uv, vec2(0.5))); return mix(base, hi, smoothstep(rad, 0.0, r)); }
      vec3 curtain(vec2 uv){
        float x = uv.x * uRes.x / uRes.y;
        float fold = 0.5 + 0.5 * sin(x * 34.0 + sin(uv.y * 3.0 + x * 2.0) * 0.6);
        vec3 col = mix(c_curtain * 0.42, c_curtain, pow(fold, 1.6));
        col *= 0.7 + 0.3 * smoothstep(1.0, 0.55, uv.y);
        float spot = smoothstep(0.42, 0.0, length(aspect(uv, vec2(0.5, 0.52)) * vec2(1.0, 0.8)));
        col = mix(col, mix(c_pink, c_cream, 0.25), spot * 0.75);
        return col;
      }
      vec3 awards(vec2 uv){
        vec2 p = aspect(uv, vec2(0.5));
        float a = -0.36; mat2 m = mat2(cos(a), -sin(a), sin(a), cos(a)); p = m * p;
        float row = floor(p.y * 4.2);
        vec2 t = vec2(p.x * 1.05 + row * 0.37 + uTime * 0.03 * (mod(row, 2.0) * 2.0 - 1.0) + uP * 0.4, fract(p.y * 4.2));
        float word = texture2D(uPattern, t).a;
        vec3 base = mix(c_sun_a, c_bg, 0.18);
        return mix(base, c_cream, word * 0.92);
      }
      vec3 room(vec2 uv){
        float n = fbm(uv * vec2(3.0, 2.4) * vec2(uRes.x / uRes.y, 1.0) + 2.0);
        vec3 col = mix(c_room * 0.55, c_room * 1.05, n);
        col *= mix(0.75, 1.05, smoothstep(0.0, 0.7, uv.y));
        return col;
      }
      vec3 stage(float m, vec2 uv, float p){
        if (m < 0.5) return rings(uv);
        if (m < 1.5) return sunburst(uv, vec2(0.5, 0.5), 18.0, 0.05);
        if (m < 2.5) return glow(uv, c_pink, mix(c_pink, c_cream, 0.35), 0.8);
        if (m < 3.5) return glow(uv, c_magenta * 0.82, c_magenta * 1.08, 0.75);
        if (m < 4.5) return glow(uv, c_blue, c_cyan, 0.85);
        if (m < 5.5) return sunburst(uv, vec2(0.5, -0.1), 12.0, 0.04);
        if (m < 6.5) return curtain(uv);
        if (m < 7.5) return glow(uv, c_wine, mix(c_wine, c_pink, 0.45), 0.45 + 0.2 * p);
        if (m < 8.5) return awards(uv);
        if (m < 9.5) return mix(c_blue, c_blue_hi, uv.y);
        if (m < 10.5) return mix(c_accent, c_sun_a, 0.35);
        return room(uv);
      }
      float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      float wipe(vec2 uv, float t){
        float w = uWipe;
        if (w < 0.5) return t;
        vec2 asp = vec2(uRes.x / uRes.y, 1.0);
        if (w < 1.5) { // At the TV screen spot, a rounded rectangle grows until it covers the screen
          vec2 c = mix(uRect.xy, vec2(0.5), t); vec2 b = mix(uRect.zw, vec2(1.2), t * t);
          return 1.0 - smoothstep(-0.002, 0.002, sdBox((uv - c) * asp, b * asp, mix(0.03, 0.0, t)));
        }
        if (w < 2.5) { // The tilted card grows as it approaches
          float a = mix(-0.42, 0.0, t); vec2 p = (uv - 0.5) * asp; p = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
          vec2 b = mix(vec2(0.07, 0.11), vec2(1.3, 0.9), t * t * t);
          return 1.0 - smoothstep(-0.002, 0.002, sdBox(p, b, 0.02));
        }
        if (w < 3.5) { // Dome rises from below
          vec2 p = (uv - vec2(0.5, -0.05)) * asp; return 1.0 - smoothstep(-0.003, 0.003, length(p) - t * 1.5);
        }
        if (w < 4.5) { vec2 p = (uv - 0.5) * asp; return 1.0 - smoothstep(-0.003, 0.003, length(p) - t * 1.05); }
        // A straight band rises from below
        return step(uv.y + 0.04 * sin(uv.x * 3.14159), t * 1.08);
      }
      void main(){
        vec2 uv = vUv;
        vec3 a = stage(uA, uv, uP), col = a;
        if (uMix > 0.0) {
          vec3 b = stage(uB, uv, uPB);
          // Card transition first switches to a pink panel and then the card approaches, the iris transition opens in yellow and then becomes the next stage color
          if (uWipe > 1.5 && uWipe < 2.5) a = mix(a, c_pink, smoothstep(0.0, 0.35, uMix));
          if (uWipe > 3.5 && uWipe < 4.5) { a = mix(a, c_pink, smoothstep(0.35, 0.6, uMix)); b = mix(stage(10.0, uv, 0.0), b, smoothstep(0.7, 1.0, uMix)); }
          col = mix(a, b, wipe(uv, uMix));
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

  // ── 2. Film post-processing ──
  const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
  const postU = { tScene: { value: rt.texture }, uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uFlash: { value: 0 }, uGlitch: { value: 0 } };
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: postU, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      precision highp float; varying vec2 vUv; uniform sampler2D tScene; uniform vec2 uRes; uniform float uTime, uFlash, uGlitch;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 uv = vUv, d = uv - 0.5;
        float frame = floor(uTime * 24.0);
        uv.x += (hash(vec2(floor(uv.y * 24.0), frame)) - 0.5) * 0.03 * uGlitch;
        float ab = 0.0014 + 0.004 * dot(d, d) + 0.01 * uGlitch;
        vec3 col = vec3(texture2D(tScene, uv + d * ab).r, texture2D(tScene, uv).g, texture2D(tScene, uv - d * ab).b);
        col = (col - 0.5) * 1.06 + 0.5;
        float grain = hash(vUv * uRes + frame * 7.13) - 0.5;
        col += grain * 0.085;
        col *= 0.97 + 0.03 * sin(vUv.y * uRes.y * 1.6);
        float vig = smoothstep(0.95, 0.25, length(d * vec2(1.0, 0.85)));
        col *= mix(0.62, 1.0, vig);
        col += uFlash;
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }`,
  })));

  // ── 3. Shapes ──
  const roundRect = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  };
  // Halftone shading: the light side is a flat tone, the shadow side darkens with screen halftone dots, and a cream light runs along the edge (rebuilt from scratch in the style of the original uHalftone·uRim)
  const toon = (base, dot = 5) => new THREE.ShaderMaterial({
    uniforms: { uBase: { value: base }, uRim: { value: C.cream }, uDot: { value: dot }, uOpacity: { value: 1 } },
    transparent: true,
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      precision highp float; varying vec3 vN; uniform vec3 uBase, uRim; uniform float uDot, uOpacity;
      void main(){
        vec3 n = normalize(vN); float d = max(dot(n, normalize(vec3(-0.45, 0.6, 0.75))), 0.0);
        float tone = floor(d * 3.0 + 0.4) / 3.0;
        vec2 g = fract(gl_FragCoord.xy / uDot) - 0.5;
        float dots = step(length(g), (1.0 - d) * 0.55);
        vec3 col = uBase * (0.45 + 0.8 * tone) * (1.0 - dots * 0.35);
        col += uRim * pow(1.0 - abs(n.z), 3.0) * 0.18;
        gl_FragColor = vec4(col, uOpacity);
      }`,
  });
  const screenMat = (texA) => new THREE.ShaderMaterial({
    uniforms: { texA: { value: texA }, texB: { value: texA }, uSlide: { value: 0 }, uTime: { value: 0 }, uGlitch: { value: 0 }, uOpacity: { value: 1 }, uSize: { value: new THREE.Vector2(1, 1) }, uInk: { value: C.ink } },
    transparent: true,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; vec2 q = uv - 0.5; p.z += (0.25 - dot(q, q)) * 0.02; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `
      precision highp float; varying vec2 vUv; uniform sampler2D texA, texB; uniform float uSlide, uTime, uGlitch, uOpacity; uniform vec2 uSize; uniform vec3 uInk;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main(){
        vec2 q = vUv - 0.5; vec2 uv = 0.5 + q * (1.0 - 0.12 * dot(q, q)); // CRT convex glass
        float frame = floor(uTime * 30.0);
        uv.x += sin(uv.y * 15.0 + uTime * 20.0) * sin(uv.y * 73.0 - uTime * 10.0) * 0.05 * uGlitch;
        uv.x += step(0.85, hash(vec2(floor(uv.y * 20.0), frame))) * 0.15 * uGlitch * (hash(vec2(frame, 0.0)) > 0.5 ? 1.0 : -1.0);
        float s = smoothstep(0.0, 1.0, uSlide);
        vec3 a = texture2D(texA, uv).rgb, b = texture2D(texB, uv).rgb;
        vec3 col = mix(a, b, s);
        col.r = mix(col.r, mix(texture2D(texA, uv + vec2(0.03 * uGlitch, 0.0)).r, texture2D(texB, uv + vec2(0.03 * uGlitch, 0.0)).r, s), uGlitch);
        col += (hash(vUv * 400.0 + frame) - 0.5) * (0.06 + 0.5 * uGlitch);
        col *= 0.9 + 0.1 * sin(vUv.y * 420.0 - uTime * 30.0);
        col *= smoothstep(0.75, 0.2, length(q * vec2(1.0, 1.2))) * 0.35 + 0.65;
        float edge = sdBox(q * uSize, uSize * 0.5, min(uSize.x, uSize.y) * 0.14);
        if (edge > 0.0) discard;
        col = mix(col, uInk, smoothstep(-0.03 * uSize.y, 0.0, edge) * 0.6);
        gl_FragColor = vec4(col, uOpacity);
      }`,
  });
  const glowMat = (c, power = 1.6) => new THREE.ShaderMaterial({
    uniforms: { uC: { value: c }, uOpacity: { value: 1 }, uPow: { value: power } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uC; uniform float uOpacity, uPow; void main(){ float r = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(uC * pow(clamp(1.0 - r, 0.0, 1.0), uPow) * uOpacity, 1.0); }`,
  });

  // TV: rounded box body + convex screen + control panel below. w is the body width (world units)
  function makeTV(texA) {
    const g = new THREE.Group(), w = 1, h = 0.86, d = 0.55;
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(roundRect(w, h, 0.1), { depth: d, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 3, curveSegments: 10 }), toon(C.tv));
    body.geometry.translate(0, 0, -d); g.add(body);
    const rim = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(0.86, 0.64, 0.12), 10), toon(C.tv.clone().multiplyScalar(1.5)));
    rim.position.set(0, 0.07, 0.04); g.add(rim);
    const sm = screenMat(texA); sm.uniforms.uSize.value.set(0.78, 0.56);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.56, 12, 8), sm);
    screen.position.set(0, 0.07, 0.05); g.add(screen);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.1, 0.04), toon(C.tv.clone().multiplyScalar(0.7), 3));
    panel.position.set(0, -0.33, 0.04); g.add(panel);
    for (let i = 0; i < 12; i++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.06, 0.01), toon(C.tv.clone().multiplyScalar(0.35), 3));
      slot.position.set(-0.36 + i * 0.022, -0.33, 0.065); g.add(slot);
    }
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.9), glowMat(C.cream, 2.2));
    halo.position.z = -0.6; halo.material.uniforms.uOpacity.value = 0.55; g.add(halo);
    const mats = []; g.traverse((m) => { if (m !== halo && m.material?.uniforms?.uOpacity) mats.push(m.material); });
    g.userData = { screen, sm, halo, mats };
    return g;
  }

  // 3D text: paint the text on a canvas and stack the same sheet in many layers behind it for thickness. Given arc, it bends along the arc (each letter turns along the curve)
  function makeText3D(text, o) {
    const lines = text.split("\n"), fs = 220, pad = Math.ceil(fs * (o.outline || 0.12) * 1.5 + 12);
    const m = canvas(8, 8).getContext("2d"); m.font = `${fs}px ${o.font || FONT()}`; if ("letterSpacing" in m) m.letterSpacing = `${-0.03 * fs}px`;
    const lw = Math.max(...lines.map((l) => m.measureText(l).width)), lh = fs * (o.leading || 0.86);
    const c = canvas(Math.ceil(lw + pad * 2), Math.ceil(lh * (lines.length - 1) + fs * 1.05 + pad * 2)), g = c.getContext("2d");
    g.font = m.font; if ("letterSpacing" in g) g.letterSpacing = m.letterSpacing; g.textAlign = o.align === "left" ? "left" : "center"; g.textBaseline = "alphabetic"; g.lineJoin = "round";
    const x = o.align === "left" ? pad : c.width / 2;
    // Faces are painted separately (halftone only inside the face) and laid over the border
    const face = canvas(c.width, c.height), f = face.getContext("2d");
    f.font = g.font; if ("letterSpacing" in f) f.letterSpacing = g.letterSpacing; f.textAlign = g.textAlign; f.textBaseline = "alphabetic";
    f.fillStyle = cssc(o.face);
    lines.forEach((l, i) => f.fillText(l, x, pad + fs * 0.85 + i * lh));
    if (o.dots) { // Halftone dots on the surface (original WORKS lettering)
      f.globalCompositeOperation = "source-atop"; f.fillStyle = cssc(o.dots); f.globalAlpha = 0.5;
      for (let yy = 0; yy < c.height; yy += 9) for (let xx = (yy / 9) % 2 ? 4 : 0; xx < c.width; xx += 9) { f.beginPath(); f.arc(xx, yy, 1.4 + 1.8 * (yy / c.height), 0, Math.PI * 2); f.fill(); }
    }
    g.strokeStyle = cssc(o.outlineColor || "--kf-ink"); g.lineWidth = fs * (o.outline || 0.12) * 2;
    lines.forEach((l, i) => g.strokeText(l, x, pad + fs * 0.85 + i * lh));
    g.drawImage(face, 0, 0);
    const t = tex(c), aspect = c.width / c.height, hw = 1, hh = 1 / aspect;
    const geo = new THREE.PlaneGeometry(hw, hh, 96, 1);
    if (o.arc) { // Arc radius = Width × arc
      const R = o.arc, pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) { const px0 = pos.getX(i), py0 = pos.getY(i), a = px0 / R; pos.setXY(i, (R + py0) * Math.sin(a), (R + py0) * Math.cos(a) - R); }
      geo.computeBoundingSphere();
    }
    const grp = new THREE.Group(), n = o.layers || 14, side = C[o.side || "ink"];
    const mats = [];
    for (let i = n; i >= 0; i--) {
      const mat = new THREE.ShaderMaterial({
        uniforms: { map: { value: t }, uSide: { value: side }, uLayer: { value: i / n }, uOpacity: { value: 1 } }, transparent: true,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform sampler2D map; uniform vec3 uSide; uniform float uLayer, uOpacity;
          void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.5) discard; vec3 col = uLayer > 0.0 ? uSide * (1.0 - 0.5 * uLayer) : c.rgb; gl_FragColor = vec4(col, uOpacity); }`,
      });
      mats.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      const k = i / n;
      mesh.position.set(k * (o.dx ?? 0.004), -k * (o.dy ?? 0.035), -k * (o.depth ?? 0.06));
      mesh.renderOrder = n - i;
      grp.add(mesh);
    }
    grp.userData = { mats, aspect, tex: t };
    return grp;
  }
  const setOpacity = (obj, v) => obj.traverse((m) => { if (m.material?.uniforms?.uOpacity) m.material.uniforms.uOpacity.value = v; m.visible = v > 0.001; });

  // Star: four-point sparkle
  const starTex = (() => {
    const c = canvas(128, 128), g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, cssc("--site-cream")); gr.addColorStop(0.3, cssc("--kf-accent")); gr.addColorStop(1, cssc("--kf-accent"));
    g.fillStyle = gr; g.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 9 : 62; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
    g.closePath(); g.fill(); return tex(c);
  })();
  const makeStars = (spots) => {
    const g = new THREE.Group();
    spots.forEach(([x, y, s, ph]) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false }));
      sp.userData = { x, y, s, ph }; g.add(sp);
    });
    return g;
  };
  const placeStars = (g, t, show = 1) => g.children.forEach((sp) => {
    const { x, y, s, ph } = sp.userData, tw = 0.75 + 0.25 * Math.sin(t * 2.2 + ph * 6.28);
    sp.position.set(x * VH * W / H * 0.5, y * VH * 0.5, 0.01);
    const k = px(s) * tw * show; sp.scale.set(k, k, 1); sp.material.rotation = Math.sin(t * 0.8 + ph) * 0.2; sp.material.opacity = show;
  });

  // ── 4. Objects per scene ──
  const src = (k) => $(`[data-gl="${k}"]`);
  const textOf = (el) => (el?.innerHTML || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
  const heroShots = $$("li", src("hero-screens")).map((li, i) => shotTexture(li.dataset.label, i % 2 ? "--site-cream" : "--site-sun-b", i % 2 ? "--site-cyan" : "--site-pink", li.textContent.trim()));
  const awardShots = $$("li", src("awards-screens")).map((li, i) => shotTexture(li.dataset.label, ["--kf-accent", "--site-pink", "--site-cyan", "--site-blue-hi"][i % 4], "--site-cream", li.textContent.trim()));
  const workItems = $$("li", src("works")).map((li, i) => ({ title: li.textContent.trim(), tex: shotTexture(li.dataset.label, ["--site-cyan", "--kf-ink-soft", "--site-curtain", "--site-magenta", "--site-cream"][i % 5], "--site-sun-b") }));

  const hero = new THREE.Group(); scene.add(hero);
  const heroTV = makeTV(heroShots[0]); hero.add(heroTV);
  const heroTitle = makeText3D(textOf(src("hero-title")), { face: "--kf-accent", outline: 0.1, arc: 2.2, layers: 16, dy: 0.05, depth: 0.08 }); hero.add(heroTitle);
  const heroStars = makeStars([[-0.86, 0.66, 14, 0.1], [-0.6, 0.38, 12, 0.4], [-0.72, -0.4, 22, 0.7], [-0.36, -0.22, 26, 0.2], [0.42, 0.06, 44, 0.5], [0.86, 0.5, 12, 0.9], [-0.84, -0.7, 14, 0.3], [0.62, -0.64, 12, 0.6]]); hero.add(heroStars);

  const worksT = new THREE.Group(); scene.add(worksT);
  const ellipse = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: { uFill: { value: C.ellipse }, uLine: { value: C.cream }, uInk: { value: C.ink }, uOpacity: { value: 1 } }, transparent: true,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uFill, uLine, uInk; uniform float uOpacity;
      void main(){ float r = length((vUv - 0.5) * 2.0); if (r > 1.0) discard; vec3 c = r > 0.93 ? uInk : r > 0.86 ? uLine : mix(uFill * 1.15, uFill, r); gl_FragColor = vec4(c, uOpacity); }`,
  }));
  worksT.add(ellipse);
  const worksTitle = makeText3D(textOf(src("works-title")), { face: "--site-works-face", outlineColor: "--site-cream", outline: 0.07, dots: "--site-ring-deep", layers: 12, dy: 0.04, depth: 0.06 }); worksT.add(worksTitle);
  const worksStars = makeStars([[-0.62, 0.62, 30, 0.2], [0.26, 0.3, 26, 0.5], [0.42, 0.18, 14, 0.1], [-0.66, -0.36, 26, 0.8], [0.14, -0.52, 18, 0.3], [0.86, -0.6, 70, 0.6], [0.92, 0.86, 10, 0.4], [0.3, -0.44, 12, 0.9]]); worksT.add(worksStars);

  const works = new THREE.Group(); scene.add(works);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667, 8, 6), screenMat(workItems[0]?.tex || heroShots[0]));
  card.material.uniforms.uSize.value.set(1, 0.667); works.add(card);
  const cardBorder = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(1.06, 0.73, 0.13), 10), new THREE.MeshBasicMaterial({ transparent: true }));
  cardBorder.material.color.setRGB(C.cream.x, C.cream.y, C.cream.z); cardBorder.position.z = -0.002; works.add(cardBorder);
  const cardGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.8), glowMat(C.cream, 2.4)); cardGlow.position.z = -0.01; works.add(cardGlow);
  const workTitles = workItems.map((w) => { const t = makeText3D(w.title, { face: "--site-cream", outline: 0.11, layers: 12, dy: 0.05, depth: 0.05 }); works.add(t); return t; });

  const about = new THREE.Group(); scene.add(about);
  const aboutTitle = makeText3D(textOf(src("about-title")), { face: "--site-cream", outline: 0.1, layers: 12, dy: 0.05, depth: 0.05, align: "left", leading: 0.9 }); about.add(aboutTitle);

  const awards = new THREE.Group(); scene.add(awards);
  const awardTV = makeTV(awardShots[0]); awards.add(awardTV);

  // Menu room: a slanted TV on the left, a huge remote on the right (the pressed buttons are the menu links)
  const menuG = new THREE.Group(); scene.add(menuG); menuG.visible = false;
  const menuTV = makeTV(shotTexture("The scene you were just watching is reflected on this screen · sunburst pattern background", "--site-sun-a", "--site-sun-b", textOf(src("works-title")))); menuG.add(menuTV);
  const links = $$(".qd-menu__list a");
  const remote = new THREE.Group(); menuG.add(remote);
  const remoteBody = new THREE.Mesh(new THREE.ExtrudeGeometry(roundRect(1, 2.2, 0.16), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }), toon(C.tv));
  remoteBody.geometry.translate(0, 0, -0.12); remote.add(remoteBody);
  const keyAt = (i) => (i < 2 ? { x: 0.1, y: 0.72 - i * 0.28, w: 0.2, h: 0.2 } : { x: -0.2 + (i - 2) * 0.22, y: -0.25, w: 0.17, h: 0.62 });
  const plateTex = (() => {
    const c = canvas(400, 880), g = c.getContext("2d");
    g.fillStyle = cssc("--site-cream"); g.fillRect(0, 0, 400, 880);
    g.fillStyle = cssc("--site-tv"); g.globalAlpha = 0.12;
    for (let y = 0; y < 880; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < 400; x += 8) g.fillRect(x, y, 2, 2);
    g.globalAlpha = 1; g.fillStyle = cssc("--kf-ink"); g.font = `bold italic 40px ${SCRIPT()}`; g.textAlign = "center";
    g.save(); g.translate(330, 120); g.rotate(-Math.PI / 2); g.fillText($(".qd-menu__kicker")?.textContent.trim() || "", 0, 0); g.restore();
    g.font = `bold italic 26px ${SCRIPT()}`;
    links.forEach((a, i) => {
      const k = keyAt(i), cx = ((k.x + 0.44) / 0.88) * 400, cy = ((1.02 - k.y) / 2.04) * 880;
      // Short buttons are written beside on the left, long ones vertically at the bottom end (so side buttons don’t cover them)
      g.save();
      if (i < 2) { g.translate(cx - (k.w / 0.88) * 400 * 0.5 - 14, cy); g.rotate(-Math.PI / 2); g.textAlign = "center"; }
      else { g.translate(cx + 9, cy + (k.h / 2.04) * 880 * 0.5 + 14); g.rotate(-Math.PI / 2); g.textAlign = "right"; }
      g.fillText(a.textContent.trim(), 0, 0); g.restore();
    });
    return tex(c);
  })();
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 2.04), new THREE.MeshBasicMaterial({ map: plateTex })); plate.position.z = 0.035; remote.add(plate);
  const keys = links.map((a, i) => {
    const L = keyAt(i), k = new THREE.Mesh(new THREE.BoxGeometry(L.w, L.h, 0.06), toon(i === 0 ? C.curtain.clone().multiplyScalar(1.3) : C.tv.clone().multiplyScalar(1.2), 3));
    k.position.set(L.x, L.y, 0.07);
    k.userData = { link: a, z: 0.07 }; remote.add(k); return k;
  });

  // ── 5. Scene row: joined according to the section’s data-len (number of screens) ──
  const MODE = { rings: 0, sun: 1, pink: 2, magenta: 3, blue: 4, dome: 5, curtain: 6, wine: 7, awards: 8, contact: 9, yellow: 10, room: 11 };
  const WIPE = { fade: 0, tv: 1, card: 2, dome: 3, iris: 4, rise: 5 };
  const BG = { hero: ["rings", "tv"], "works-title": ["sun", "tv"], works: ["sun", "fade"], "about-me": ["magenta", "card"], quote: ["blue", "fade"], service: ["dome", "dome"], curtain: ["curtain", "fade"], steps: ["wine", "fade"], awards: ["awards", "rise"], trusted: ["wine", "dome"], contact: ["contact", "iris"] };
  const T = 0.6; // Paging length (number of screens)
  const scenes = $$(".qd-scene").map((el) => ({ el, id: el.dataset.scene, slot: el.dataset.slot, len: +el.dataset.len || 1 }));
  let acc = 0; scenes.forEach((s) => { s.start = acc; acc += s.len; s.end = acc; });
  const TOTAL = acc;
  const track = $(".qd-track");
  const sizeTrack = () => { track.style.height = `${(TOTAL - scenes[scenes.length - 1].len + 1) * 100}vh`; };
  sizeTrack();
  const byId = Object.fromEntries(scenes.map((s) => [s.id, s]));
  const goTo = (id, off = 0) => { const s = byId[id] || scenes.find((x) => x.slot === id); if (s) scrollTo(0, (s.start + off) * innerHeight); };
  document.addEventListener("qd:go", (e) => goTo(e.detail.id, 0.05));

  // ── 6. Size · mouse ──
  // Original sets the cursor position from both pointermove and pointerdown (grab) — on phones too it tilts toward the pressed spot.
  // Each object follows at a different speed (original values): concentric circles 2·dt for 40 design px, 3D letters 2·dt, TV 10·dt, menu room .05 per frame (at 120fps)
  const mouse = new THREE.Vector2(), ringOff = new THREE.Vector2(), lean = new THREE.Vector2(), menuTilt = new THREE.Vector2();
  const tvTilt = { hero: new THREE.Vector2(), award: new THREE.Vector2() };
  const k120 = (a, dt) => 1 - Math.pow(1 - a, 120 * Math.min(dt, 0.1));
  const aim = (e) => mouse.set((e.clientX / W) * 2 - 1, -((e.clientY / H) * 2 - 1));
  if (!reduce) { addEventListener("pointermove", aim, { passive: true }); addEventListener("pointerdown", aim, { passive: true, capture: true }); }
  const resize = () => {
    W = innerWidth; H = innerHeight; portrait = W / H < 0.8;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    rt.setSize(Math.round(W * dpr), Math.round(H * dpr));
    camera.aspect = W / H; camera.updateProjectionMatrix();
    unit = VH / H;
    bgU.uRes.value.set(W, H); postU.uRes.value.set(W * dpr, H * dpr);
    bgU.uRingScale.value = portrait ? 0.9 : 1;
    bgU.uRingC.value.set(0.5, portrait ? 0.46 : 0.42);
  };
  resize(); addEventListener("resize", resize);

  // ── 7. First reveal (after loader) — original IntroConfig: TV·concentric circles 1.5s after .45s, name .95/1.5, ‹Present› 1.2/1.2, text below 1.45/.8, star .6/1.5, head 1.9/.6 ──
  const intro = { tv: 0, ring: 0, name: 0, sub: 0, texts: 0, stars: 0, head: 0 };
  const playIntro = () => {
    const tl = gsap.timeline();
    tl.add(QD.powerOn(0.9), 0);
    const a = (k, delay, duration) => tl.to(intro, { [k]: 1, duration, ease: "power2.out" }, delay);
    a("tv", 0.45, 1.5); a("ring", 0.45, 1.5); a("name", 0.95, 1.5); a("sub", 1.2, 1.2); a("texts", 1.45, 0.8); a("stars", 0.6, 1.5);
    tl.to(".qd-head", { opacity: 1, duration: 0.6, ease: "power2.out" }, 1.9);
    tl.call(() => document.body.classList.remove("qd-locked"), null, 2);
  };

  // ── 8. Work switch: when the cell changes, swap the picture during a glitch (.16s rise and .6s settle) ──
  let workIdx = -1, awardIdx = -1, slideIdx = 0;
  const glitch = (mat, swap) => {
    const u = mat.uniforms.uGlitch;
    gsap.killTweensOf(u);
    gsap.timeline().to(u, { value: 1, duration: 0.16, ease: "power1.in" }).call(swap).to(u, { value: 0, duration: 0.6, ease: "power2.out" });
  };
  $(".qd-works__prev")?.addEventListener("click", () => goTo("works", ((Math.max(0, workIdx - 1) + 0.5) / workItems.length) * (byId.works.len - T)));
  $(".qd-works__next")?.addEventListener("click", () => goTo("works", ((Math.min(workItems.length - 1, workIdx + 1) + 0.5) / workItems.length) * (byId.works.len - T)));
  // The hero TV switches to the next work screen every 4 seconds
  setInterval(() => {
    if (reduce || heroShots.length < 2) return;
    const sm = heroTV.userData.sm, next = heroShots[(slideIdx + 1) % heroShots.length];
    slideIdx = (slideIdx + 1) % heroShots.length;
    sm.uniforms.texB.value = next;
    gsap.fromTo(sm.uniforms.uSlide, { value: 0 }, { value: 1, duration: 0.8, ease: "power2.inOut", onComplete: () => { sm.uniforms.texA.value = next; sm.uniforms.uSlide.value = 0; } });
  }, 4000);

  // ── 9. Menu room ──
  let menuOpen = false;
  document.addEventListener("qd:menu", (e) => { menuOpen = e.detail.open; menuG.visible = menuOpen; });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let hoverKey = null;
  addEventListener("pointermove", (e) => {
    if (!menuOpen) return;
    ndc.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(keys, false)[0]?.object || null;
    if (hit !== hoverKey) {
      if (hoverKey) gsap.to(hoverKey.position, { z: hoverKey.userData.z, duration: 0.2, ease: "power2.out" });
      if (hit) gsap.to(hit.position, { z: hit.userData.z - 0.035, duration: 0.2, ease: "power2.out" });
      hoverKey = hit; document.body.style.cursor = hit ? "pointer" : "";
    }
  });
  addEventListener("click", (e) => { if (menuOpen && hoverKey && !e.target.closest("a,button")) hoverKey.userData.link.click(); });
  const placeLinks = () => { // Aligns the press position so the keyboard focus outline sits over the button
    const v = new THREE.Vector3();
    keys.forEach((k) => {
      k.getWorldPosition(v); v.project(camera);
      const a = k.userData.link, s = k.geometry.parameters;
      a.style.setProperty("--x", `${((v.x + 1) / 2) * W}px`); a.style.setProperty("--y", `${((1 - v.y) / 2) * H}px`);
      a.style.setProperty("--w", `${(s.width / unit) * 0.55}px`); a.style.setProperty("--h", `${(s.height / unit) * 0.55}px`); a.style.setProperty("--r", "-38deg");
    });
  };

  // 3D text (name · WORKS · ABOUT ME): moves .01 toward the cursor and tilts .1rad so the face looks at the cursor
  const leanText = (obj, x, y, z) => { obj.position.set(x + 0.01 * lean.x, y + 0.01 * lean.y, z); obj.rotation.set(-0.1 * lean.y, 0.1 * lean.x, 0); };
  // TV: the screen turns ±.1rad to face the cursor. In the original the pivot is a point behind the body at width .25, so it shifts slightly toward the cursor as it turns
  const tiltTV = (tv, rot, k, dt, size, x, y, z) => {
    rot.x = lerp(rot.x, -mouse.y * 0.1 * k, Math.min(1, 10 * dt)); rot.y = lerp(rot.y, mouse.x * 0.1 * k, Math.min(1, 10 * dt));
    const p = 0.25 * size, cy = Math.cos(rot.y);
    tv.rotation.set(rot.x, rot.y, 0);
    tv.position.set(x + p * Math.sin(rot.y), y - p * cy * Math.sin(rot.x), z + p * (cy * Math.cos(rot.x) - 1));
  };

  // Photo over a service word: first appears right at the cursor, then follows at .12 per frame (at 120fps) and bends — the original uses .72 of the lagged distance in board coordinates,
  // The panel is .32× so on screen it is .23 of the late distance. The original is an arc where the center leads, but since photo slots are DOM it uses the same amount of tilt. After leaving, the bend relaxes at .1 per frame
  const svc = $$(".qd-service__list li").map((li) => ({ li, img: $(".qd-service__img", li), on: false, p: { x: 0, y: 0 }, t: { x: 0, y: 0 }, bend: { x: 0, y: 0 } }));
  const svcAim = (o, e) => { const r = o.li.getBoundingClientRect(); o.t.x = e.clientX - (r.left + r.width / 2); o.t.y = e.clientY - (r.top + r.height / 2); };
  if (!reduce) svc.forEach((o) => {
    o.li.addEventListener("pointerenter", (e) => { svcAim(o, e); o.p.x = o.t.x; o.p.y = o.t.y; o.on = true; });
    o.li.addEventListener("pointermove", (e) => svcAim(o, e));
    o.li.addEventListener("pointerleave", () => (o.on = false));
  });
  const followSvc = (dt) => svc.forEach((o) => {
    if (o.on) {
      const k = k120(0.12, dt);
      o.p.x = lerp(o.p.x, o.t.x, k); o.p.y = lerp(o.p.y, o.t.y, k);
      o.bend.x = 0.72 * 0.32 * (o.t.x - o.p.x); o.bend.y = 0.72 * 0.32 * (o.t.y - o.p.y);
    } else { const k = k120(0.1, dt); o.bend.x = lerp(o.bend.x, 0, k); o.bend.y = lerp(o.bend.y, 0, k); }
    const w2 = o.img.offsetWidth / 2 || 1, h2 = o.img.offsetHeight / 2 || 1;
    o.img.style.setProperty("--fx", `${o.p.x}px`); o.img.style.setProperty("--fy", `${o.p.y}px`);
    o.img.style.setProperty("--bx", `${Math.atan(o.bend.x / h2)}rad`); o.img.style.setProperty("--by", `${Math.atan(o.bend.y / w2)}rad`);
  });

  // ── Cursor: the original hides the default cursor and draws a white arrow (a hand over clickable items) on a 47px plate directly at the cursor position.
  //    On hover change, blending uses damping 28 and size uses a spring (stiffness 320 · damping 20) — a one-time bounce at velocity +5.5 the moment it becomes a hand, .84 while pressed.
  //    The panel must also sit over DOM photos and text, so it is drawn on a small canvas on top, outside the main canvas. Only on machines with a mouse ──
  const pointer = (() => {
    if (reduce || !matchMedia("(hover: hover) and (pointer: fine)").matches) return null;
    const S = 47, dpr = Math.min(devicePixelRatio || 1, 2);
    const sprite = (shape) => { // 256 panel: the cursor at the center is the end, outside a dark border·white face, around it a white glow and teal·pink color shift
      const c = canvas(256, 256), g = c.getContext("2d"), at = (dx) => { g.save(); g.translate(128 + dx, 128); g.beginPath(); shape(g); g.restore(); };
      const white = cssc("--site-white");
      g.shadowColor = white; g.shadowBlur = 18; g.globalAlpha = 0.55; at(0); g.fillStyle = white; g.fill(); g.shadowBlur = 0;
      at(3); g.fillStyle = cssc("--site-cyan"); g.globalAlpha = 0.5; g.fill(); at(-3); g.fillStyle = cssc("--site-pink"); g.globalAlpha = 0.45; g.fill(); g.globalAlpha = 1;
      at(0); g.lineJoin = "round"; g.lineWidth = 18; g.strokeStyle = cssc("--kf-ink"); g.stroke();
      at(0); g.fillStyle = white; g.fill();
      const d = g.getImageData(0, 0, 256, 256); // Film grain: lightly tint one of every five painted pixels
      for (let i = 3; i < d.data.length; i += 4) if (d.data[i] && Math.random() < 0.2) d.data[i] *= 0.6;
      g.putImageData(d, 0, 0); return c;
    };
    const rr = (g, x, y, w, h, r) => g.roundRect(x, y, w, h, r);
    const arrow = sprite((g) => { [[0, 0], [0, 100], [25, 77], [42, 113], [60, 105], [43, 70], [76, 70]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); });
    const hand = sprite((g) => {
      rr(g, -10, 0, 20, 66, 10); rr(g, 10, 30, 19, 42, 9.5); rr(g, 29, 36, 18, 38, 9); rr(g, 47, 44, 16, 32, 8);
      rr(g, -10, 54, 73, 50, 22);
      g.save(); g.translate(-6, 76); g.rotate(-0.75); rr(g, -26, -9, 34, 18, 9); g.restore();
    });
    const el = canvas(Math.round(S * dpr), Math.round(S * dpr)), g = el.getContext("2d");
    el.className = "qd-cursor"; el.setAttribute("aria-hidden", "true"); document.body.append(el);
    document.documentElement.classList.add("qd-glcursor");
    const st = { x: -99, y: -99, show: false, over: false, down: false, mix: -1, hov: 0, s: 1, v: 0, was: false };
    addEventListener("pointermove", (e) => { st.x = e.clientX; st.y = e.clientY; st.show = true; }, { passive: true });
    document.addEventListener("mouseleave", () => (st.show = false));
    document.addEventListener("mouseenter", () => (st.show = true));
    document.addEventListener("pointerover", (e) => (st.over = !!e.target.closest?.('a[href], button, [role="button"]')));
    addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") st.down = true; });
    addEventListener("pointerup", () => (st.down = false)); addEventListener("blur", () => (st.down = false));
    return (dt) => {
      const r = Math.min(dt, 1 / 30), on = st.over || ["pointer", "grab", "grabbing"].includes(document.body.style.cursor);
      st.hov = lerp(st.hov, on ? 1 : 0, 1 - Math.exp(-28 * r));
      if (on !== st.was) { st.was = on; if (on) st.v += 5.5; }
      st.v += (320 * ((st.down ? 0.84 : 1) - st.s) - 20 * st.v) * r; st.s += st.v * r;
      if (Math.abs(st.hov - st.mix) > 0.004) {
        st.mix = st.hov; g.clearRect(0, 0, el.width, el.height);
        g.globalAlpha = 1 - st.mix; g.drawImage(arrow, 0, 0, el.width, el.height); g.globalAlpha = st.mix; g.drawImage(hand, 0, 0, el.width, el.height); g.globalAlpha = 1;
      }
      el.style.opacity = st.show ? 1 : 0;
      el.style.transform = `translate(${st.x - S / 2}px, ${st.y - S / 2}px) scale(${st.s})`;
    };
  })();

  // ── 10. Every frame ──
  let s = 0, last = 0, t0 = performance.now();
  const frameEl = $(".qd-frame");
  const steps = $$(".qd-step");
  const quote = $(".qd-quote__text");
  const trustedLis = $$(".qd-trusted__list li");
  trustedLis.forEach((li) => { const t = li.textContent, h = Math.ceil(t.length / 2); li.innerHTML = `<span>${t.slice(0, h)}</span><span>${t.slice(h)}</span>`; });
  const trustedStar = makeStars([[0, 0, 40, 0]]); scene.add(trustedStar);
  const kicker = $(".qd-trusted__kicker"), tlist = $(".qd-trusted__list"), serviceList = $(".qd-service__list");

  const tick = (now) => {
    requestAnimationFrame(tick);
    const dt = Math.min(0.1, Math.max(0.001, (now - (last || now)) / 1000)); last = now;
    const t = (now - t0) / 1000;
    const target = scrollY / innerHeight;
    s = reduce ? target : s + (target - s) * (1 - Math.pow(1 - 0.072, dt * 60));
    if (Math.abs(target - s) < 0.0005) s = target;
    // Concentric circles: pushed toward the cursor x, and away on y (the original shader subtracts directly in screen-y-down coordinates)
    ringOff.x = lerp(ringOff.x, 40 * mouse.x, 2 * dt); ringOff.y = lerp(ringOff.y, 40 * mouse.y, 2 * dt);
    const ringPx = Math.min(W / 1920, H / 1080);
    bgU.uMouse.value.set(ringOff.x * ringPx / W, -ringOff.y * ringPx / H);
    lean.x = lerp(lean.x, mouse.x, 2 * dt); lean.y = lerp(lean.y, mouse.y, 2 * dt);
    bgU.uTime.value = t; postU.uTime.value = t;

    let ci = scenes.findIndex((x) => s < x.end); if (ci < 0) ci = scenes.length - 1;
    const cur = scenes[ci], nxt = scenes[ci + 1];
    const tx = nxt ? clamp((s - (cur.end - T)) / T) : 0;
    const p = clamp((s - cur.start) / Math.max(0.01, cur.len - T));
    const w = {}; scenes.forEach((x) => (w[x.id] = 0));
    w[cur.id] = 1 - (nxt ? tx : 0); if (nxt) w[nxt.id] = tx;
    const prog = (x) => clamp((s - x.start) / Math.max(0.01, x.len - T));

    // Background
    const [ma] = BG[cur.id]; bgU.uA.value = MODE[ma]; bgU.uP.value = p;
    if (nxt && tx > 0) { const [mb, wb] = BG[nxt.id]; bgU.uB.value = MODE[mb]; bgU.uWipe.value = WIPE[wb]; bgU.uMix.value = tx; bgU.uPB.value = 0; }
    else bgU.uMix.value = 0;
    if (menuOpen) { bgU.uA.value = MODE.room; bgU.uMix.value = 0; }

    // DOM scene
    scenes.forEach((x) => {
      const o = w[x.id];
      x.el.classList.toggle("is-on", o > 0.001 && !menuOpen);
      x.el.style.opacity = menuOpen ? 0 : (x === nxt ? smooth(0.55, 1, tx) : x === cur && nxt ? 1 - smooth(0, 0.45, tx) : o);
    });
    frameEl.style.opacity = menuOpen ? 0 : smooth(byId["about-me"].start - T * 0.4, byId["about-me"].start, s);

    const sx = VH * W / H * 0.5, sy = VH * 0.5; // World distance to the screen edge (z=0)
    // Hide fully faded objects — even at opacity 0 they still use depth and would hide the text of the scene behind
    hero.visible = w.hero > 0.001 && !menuOpen;

    // Hero: on scroll the name·stars·concentric circles fly toward the camera and the TV screen grows to open the next scene
    {
      const hp = cur.id === "hero" ? p : 1, out = cur.id === "hero" ? tx : 1;
      const tvW = px(portrait ? W * 0.75 : 370), it = reduce ? 1 : intro.tv;
      const tvS = tvW * lerp(0.55, 1, it) * (1 + out * 2.5);
      heroTV.scale.setScalar(tvS);
      // Once it starts entering the screen (30% scrolled), the tilt shrinks to 0
      tiltTV(heroTV, tvTilt.hero, Math.max(0, 1 - out / 0.3), dt, tvS, 0, portrait ? -px(33) : -px(76), out * 0.35);
      setOpacity(heroTV, clamp(it * 3) * (1 - smooth(0.6, 1, out)));
      heroTV.userData.halo.material.uniforms.uOpacity.value = 0.55 * it * (1 - out);
      const nameZ = (reduce ? 0 : (1 - intro.name) * -1.2) + hp * 0.86 * 0.6;
      heroTitle.scale.setScalar(px(portrait ? W * 0.86 : 940));
      leanText(heroTitle, 0, sy - px(portrait ? 155 : 175), nameZ);
      setOpacity(heroTitle, (reduce ? 1 : intro.name) * (1 - smooth(0.2, 0.9, hp)));
      placeStars(heroStars, t, (reduce ? 1 : intro.stars) * (1 - smooth(0, 0.7, hp)));
      heroStars.position.z = hp * 0.5;
      bgU.uRingScale.value = (portrait ? 0.9 : 1) * lerp(0.6, 1, reduce ? 1 : intro.ring) * (1 + hp * 1.2);
      // The next scene opens in the TV screen spot
      const scrW = 0.78 * tvW * (1 + out * 2.5) / (VH * W / H), scrH = 0.56 * tvW * (1 + out * 2.5) / VH;
      bgU.uRect.value.set(0.5, 0.5 + (heroTV.position.y + 0.07 * tvW) / VH, scrW * 0.5, scrH * 0.5);
      const sub = $(".qd-hero__sub"), hint = $(".qd-hero__hint");
      sub.style.opacity = (reduce ? 1 : intro.sub) * (1 - smooth(0.1, 0.6, hp));
      sub.style.scale = String(1 + hp * 1.5);
      const low = (reduce ? 1 : intro.texts) * (1 - smooth(0, 0.3, hp));
      [hint, ...$$(".qd-hero__foot")].forEach((el) => (el.style.opacity = low));
    }
    // WORKS: the ellipse and text bounce in, and exit toward the camera at the end
    {
      const x = byId["works-title"], on = w[x.id], pp = prog(x);
      worksT.visible = on > 0.001 && !menuOpen;
      const pop = x === nxt ? ease2(smooth(0.2, 0.9, tx)) : 1;
      const z = smooth(0.75, 1, pp) * 0.4 + (x === cur ? tx * 0.3 : 0), fade = 1 - smooth(0.85, 1, pp + (x === cur ? tx : 0));
      const sc = px(portrait ? 330 : 610);
      ellipse.scale.set(sc * pop, sc * 0.43 * pop, 1); ellipse.rotation.z = 0.1; ellipse.position.set(0, px(-10), z - 0.01);
      ellipse.material.uniforms.uOpacity.value = on * fade;
      worksTitle.scale.setScalar(sc * 0.78 * pop); leanText(worksTitle, 0, px(30), z);
      setOpacity(worksTitle, on * pop * fade);
      placeStars(worksStars, t, on * pop * fade); worksStars.position.z = z;
      $(".qd-works-title__badge").style.scale = String(pop);
    }
    // Work cell: card + 3D title, glitch when the cell changes
    {
      const x = byId.works, on = w[x.id];
      works.visible = on > 0.001 && !menuOpen;
      const idx = Math.min(workItems.length - 1, Math.floor(prog(x) * workItems.length * 0.9999));
      if (idx !== workIdx && workItems.length) {
        const first = workIdx < 0; workIdx = idx;
        const swap = () => { card.material.uniforms.texA.value = workItems[idx].tex; workTitles.forEach((tt, i) => (tt.userData.cur = i === idx)); };
        if (first || reduce) swap(); else { glitch(card.material, swap); }
        bgU.uDark.value = 0; if (!first && !reduce) gsap.fromTo(bgU.uDark, { value: 1 }, { value: 0, duration: 0.8, ease: "power2.out" });
      }
      const cw = px(portrait ? 260 : 290), enter = x === nxt ? ease2(tx) : 1, leave = x === cur && nxt ? tx : 0;
      card.scale.setScalar(cw * enter); cardBorder.scale.setScalar(cw * enter); cardGlow.scale.setScalar(cw * enter);
      card.position.set(0, px(portrait ? 60 : 0), leave * 0.2);
      cardBorder.position.set(card.position.x, card.position.y, card.position.z - 0.002); cardGlow.position.set(card.position.x, card.position.y, card.position.z - 0.01);
      card.material.uniforms.uOpacity.value = on; cardBorder.material.opacity = on; cardGlow.material.uniforms.uOpacity.value = 0.5 * on;
      card.material.uniforms.uTime.value = t;
      workTitles.forEach((tt) => {
        tt.scale.setScalar(px(portrait ? 340 : 470)); tt.position.set(0, -sy + px(portrait ? 270 : 178), leave * 0.15);
        setOpacity(tt, tt.userData.cur ? on * (1 - card.material.uniforms.uGlitch.value * 0.6) : 0);
      });
    }
    // About: 3D ‹ABOUT ME›
    {
      const x = byId["about-me"], on = w[x.id];
      about.visible = on > 0.001 && !menuOpen;
      aboutTitle.scale.setScalar(px(portrait ? W * 0.62 : 610));
      leanText(aboutTitle, portrait ? -px(W * 0.08) : px(320), portrait ? sy - px(230) : -px(40), x === nxt ? (1 - tx) * -0.2 : 0);
      setOpacity(aboutTitle, on);
    }
    // Quote: text passes from bottom to top
    {
      const x = byId.quote, pp = prog(x);
      quote.style.setProperty("--qy", `${lerp(H * 0.7, -quote.offsetHeight + H * 0.15, pp)}px`);
    }
    // Services: three words rise from below along with the DOM
    {
      const x = byId.service, pp = prog(x);
      serviceList.style.translate = `0 ${lerp(H * 0.02, -H * 0.36, ease2io(pp))}px`;
      if (!reduce && w[x.id] > 0.001) {
        serviceList.style.transform = `translate(-50%, 0) translate(${0.01 * lean.x / unit}px, ${-0.01 * lean.y / unit}px) perspective(${H / VH}px) rotateX(${0.1 * lean.y}rad) rotateY(${0.1 * lean.x}rad)`;
        followSvc(dt);
      }
    }
    // Process: the row matching the scroll position lights up
    {
      const x = byId.steps, pp = prog(x), on = Math.min(steps.length - 1, Math.floor(pp * steps.length * 0.9999));
      steps.forEach((el, i) => el.classList.toggle("is-active", i === on));
    }
    // Awards: the TV screen changes in each cell
    {
      const x = byId.awards, on = w[x.id], pp = prog(x);
      awards.visible = on > 0.001 && !menuOpen;
      const idx = Math.min(awardShots.length - 1, Math.floor(pp * awardShots.length * 0.9999));
      if (idx !== awardIdx) { const first = awardIdx < 0; awardIdx = idx; const sw = () => (awardTV.userData.sm.uniforms.texA.value = awardShots[idx]); first || reduce ? sw() : glitch(awardTV.userData.sm, sw); }
      const aS = px(portrait ? 280 : 420) * (x === nxt ? lerp(0.6, 1, ease2(tx)) : 1);
      awardTV.scale.setScalar(aS);
      tiltTV(awardTV, tvTilt.award, 1, dt, aS, 0, px(portrait ? 20 : 0), 0);
      setOpacity(awardTV, on);
      awardTV.userData.halo.material.uniforms.uOpacity.value = 0.35 * on;
      awardTV.userData.sm.uniforms.uTime.value = t;
    }
    // Partners: name lines rise up, and lines passing the center star split at the center
    {
      const x = byId.trusted, on = w[x.id], pp = prog(x);
      const lh = trustedLis[0]?.offsetHeight || 80, starY = H * 0.47;
      const listY = lerp(H * 0.59, starY - lh * (trustedLis.length + 0.5), pp);
      tlist.style.setProperty("--ly", `${listY}px`);
      kicker.style.top = `${listY - lh * 2.4}px`;
      trustedLis.forEach((li, i) => { const cy = listY + lh * (i + 0.5); li.style.setProperty("--gap", `${Math.max(0, starY + lh * 0.5 - cy) * 1.3}px`); });
      trustedStar.visible = on > 0.001 && !menuOpen;
      placeStars(trustedStar, t, on * (0.6 + 0.4 * smooth(0, 0.2, pp)) * (x === cur && nxt ? 1 + tx * 3 : 1));
      trustedStar.position.y = sy - starY * unit;
    }

    // Menu room
    if (menuOpen) {
      const k = portrait ? 0.62 : 1;
      menuTV.scale.setScalar(px(560) * k); menuTV.position.set(portrait ? -sx * 0.3 : -sx * 0.42, portrait ? sy * 0.4 : px(40), -0.1); menuTV.rotation.set(-0.06, 0.42, 0);
      menuTV.userData.sm.uniforms.uTime.value = t;
      remote.scale.setScalar(px(330) * k); remote.position.set(portrait ? sx * 0.25 : sx * 0.4, portrait ? -sy * 0.45 : -px(150), 0.05); remote.rotation.set(-0.95, 0.05, -0.62);
      // The whole room turns ±2° toward the cursor (for x, the top edge comes closer when the cursor is above)
      const mk = k120(0.05, dt);
      menuTilt.x = lerp(menuTilt.x, mouse.y * Math.PI / 90, mk); menuTilt.y = lerp(menuTilt.y, mouse.x * Math.PI / 90, mk);
      menuG.rotation.set(menuTilt.x, menuTilt.y, 0);
      placeLinks();
    }
    heroTV.userData.sm.uniforms.uTime.value = t;
    if (pointer) pointer(dt);

    renderer.setRenderTarget(rt); renderer.autoClear = true; renderer.render(bgScene, flat);
    renderer.autoClear = false; renderer.clearDepth(); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(postScene, flat); renderer.autoClear = true;
  };

  // The original loader waits until the shaders are all set — same spot here: ready once the scene is built and the shaders are pre-baked
  renderer.compile(scene, camera); renderer.compile(bgScene, flat); renderer.compile(postScene, flat);
  ready = true; startIntro = playIntro;
  requestAnimationFrame(tick);
  if (reduce) { Object.keys(intro).forEach((k) => (intro[k] = 1)); $(".qd-head").style.opacity = 1; document.body.classList.remove("qd-locked"); }
})();
