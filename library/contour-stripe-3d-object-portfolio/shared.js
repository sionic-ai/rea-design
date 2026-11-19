/* The stage of the whole site — all pages use the same WebGL stage (background waves · contour objects · floor mirror) and header · foot · drawer · transition. 
   First page (data-page="home") picks three projects, and the detail (data-page="detail") puts the chosen object in the center and attaches the controls.
   All colors are painted by reading --site-* from shared.css — swap theme.css and the stage changes with it. */
(() => {
  const THREE = window.THREE;
  const body = document.body;
  const PAGE = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const phone = () => innerWidth <= 960;
  if (window.CustomEase) CustomEase.create("hkCss", "0.25,0.1,0.25,1");
  const EASE_CSS = window.CustomEase ? "hkCss" : "power1.inOut";

  // Three projects — original order (Brand sphere · City airport star balloon · Brand blob). shape is the shader’s shape number.
  const PROJECTS = [
    { shape: 0, theme: "t1", href: "detail.html", tilt: true },
    { shape: 1, theme: "t2", href: "detail-play.html", tilt: false },
    { shape: 2, theme: "t3", href: "detail-sound.html", tilt: true },
  ];
  const qs = new URLSearchParams(location.search);
  let active = Math.max(0, Math.min(2, +(body.dataset.project ?? qs.get("p") ?? 0) || 0));

  /* ---------- Color reading: variable → computed color → RGB via a 1×1 canvas ---------- */
  const probe = document.createElement("i");
  probe.style.display = "none";
  body.append(probe);
  const pc = document.createElement("canvas");
  pc.width = pc.height = 1;
  const px = pc.getContext("2d", { willReadFrequently: true });
  const cssColor = (name) => {
    probe.style.color = `var(${name})`;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const d = px.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };
  const palette = (k) => ({
    bg: cssColor(`--site-${k}-bg`), blob: cssColor(`--site-${k}-blob`), glow: cssColor(`--site-${k}-glow`),
    motif: cssColor(`--site-${k}-motif`), line: cssColor(`--site-${k}-line`), fill: cssColor(`--site-${k}-fill`),
  });
  const PAL = { t1: palette("t1"), t2: palette("t2"), t3: palette("t3") };
  PAL.dir = { ...PAL.t1, blob: cssColor("--site-dir-blob"), glow: cssColor("--site-dir-glow"), motif: cssColor("--site-dir-motif") };
  const DARK = { bg: cssColor("--site-dark-bg"), atmo: cssColor("--site-dark-atmo"), atmoLight: cssColor("--site-atmo"), flow: cssColor("--site-t3-flow") };

  /* ---------- Shared GLSL — our own value noise (hash · 5-octave fbm) ---------- */
  const NOISE = `
    float hk_h(vec3 p){ p = fract(p * 0.1031 + vec3(0.37, 0.53, 0.19)); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
    float hk_n(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hk_h(i), hk_h(i + vec3(1,0,0)), f.x), mix(hk_h(i + vec3(0,1,0)), hk_h(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hk_h(i + vec3(0,0,1)), hk_h(i + vec3(1,0,1)), f.x), mix(hk_h(i + vec3(0,1,1)), hk_h(i + vec3(1,1,1)), f.x), f.y), f.z); }
    float hk_fbm(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++){ v += a * hk_n(p); p = p * 2.02 + vec3(1.7, 9.2, 3.1); a *= 0.52; } return v; }
  `;

  /* ---------- Object: blends in the vertex shader between a sphere (0) · a six-pointed star balloon (1) · a wobbling blob (2) ---------- */
  const OBJ_VERT = `
    uniform float uFrom; uniform float uTo; uniform float uMorph; uniform float uTime; uniform float uAudio; uniform float uBass;
    varying vec3 vDir; varying vec3 vObjN; varying vec3 vNormalW; varying vec3 vViewW; varying float vWorldY;
    ${NOISE}
    vec3 shapePos(float k, vec3 d){
      if (k < 0.5) return d;
      if (k < 1.5){
        // Front-facing six-pointed star balloon — the tips are blunt so the outline looks like a rounded hexagon, and it bulges front and back
        float phi = atan(d.y, d.x);
        float rim = 1.0 - abs(d.z);
        float lobe = cos(6.0 * phi);
        float s = 1.0 + 0.12 * lobe * (0.35 + 0.65 * rim);
        return vec3(d.x * s, d.y * s * 1.19, d.z * 0.8) * 0.97;
      }
      float n = hk_n(d * 1.5 + vec3(0.0, uTime * 0.12, 0.0)) - 0.5;
      float ripple = (sin(d.y * 10.0 + n * 2.0 + uTime * 0.7) + sin(d.x * 8.0 + n * 2.0 + uTime * 0.84) + sin(d.y * 12.0 + n * 2.0 + uTime * 0.56))
        * uAudio * 0.15 * (1.0 + uBass * 0.5);
      return d * (1.0 + n * 0.32 + ripple) * 0.95;
    }
    vec3 morphPos(vec3 d){ return mix(shapePos(uFrom, d), shapePos(uTo, d), uMorph); }
    void main(){
      vec3 d = normalize(position);
      vec3 p = morphPos(d);
      vec3 up = abs(d.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
      vec3 t1 = normalize(cross(up, d)); vec3 t2 = cross(d, t1);
      vec3 n = normalize(cross(morphPos(normalize(d + t1 * 0.01)) - p, morphPos(normalize(d + t2 * 0.01)) - p));
      if (dot(n, d) < 0.0) n = -n;
      vec4 wp = modelMatrix * vec4(p, 1.0);
      vDir = d; vObjN = n; vNormalW = normalize(mat3(modelMatrix) * n); vViewW = cameraPosition - wp.xyz; vWorldY = wp.y;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const OBJ_FRAG = `
    uniform vec3 uLine; uniform vec3 uFill; uniform float uFillAlpha; uniform float uOpacity;
    uniform float uSpacing; uniform float uWidth; uniform float uNoiseAmt; uniform float uNoiseScale; uniform float uIdle; uniform float uTime;
    uniform float uHolo; uniform float uReflect; uniform float uFloorY; uniform vec3 uTouch; uniform float uTouchAmt;
    uniform float uGlow; uniform vec3 uGlowColor; uniform float uBass; uniform float uTreble; uniform float uFlash;
    varying vec3 vDir; varying vec3 vObjN; varying vec3 vNormalW; varying vec3 vViewW; varying float vWorldY;
    ${NOISE}
    mat2 rot(float a){ float s = sin(a); float c = cos(a); return mat2(c, -s, s, c); }
    vec2 onPlane(vec3 p, vec3 c){ vec3 up = abs(c.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
      vec3 u = normalize(cross(up, c)); vec3 v = cross(c, u); vec3 q = p - c * dot(p, c); return vec2(dot(q, u), dot(q, v)); }
    vec3 drift(vec3 base, float t, float rate, float ph){
      vec3 ax = normalize(vec3(sin(ph * 1.7), cos(ph * 2.3), sin(ph * 0.9 + 1.1)));
      vec3 tg = normalize(cross(ax, base)); vec3 bt = cross(base, tg); float w = t * rate + ph;
      return normalize(base + tg * sin(w) * 0.26 + bt * cos(w * 0.73 + ph) * 0.26); }
    float dCircle(vec2 p, float r){ return length(p) - r; }
    float dEllipse(vec2 p, vec2 r){ return (length(p / r) - 1.0) * min(r.x, r.y); }
    float dBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
    float dTri(vec2 p, float r, float cr){ const float k = 1.7320508; float s = r - cr; p.x = abs(p.x) - s; p.y += s / k;
      if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5; p.x -= clamp(p.x, -2.0 * s, 0.0); return -length(p) * sign(p.y) - cr; }
    float blend(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
    float field(vec3 p, float t){
      vec3 q = p * uNoiseScale;
      vec3 off = vec3(hk_fbm(q + vec3(3.1, 0.4, 7.7) + t * vec3(0.31, -0.17, 0.23)),
                      hk_fbm(q + vec3(-6.2, 4.4, 1.9) + t * vec3(-0.19, 0.27, 0.13)),
                      hk_fbm(q + vec3(5.3, -8.1, 2.6) + t * vec3(0.11, 0.21, -0.29))) - 0.5;
      vec3 w = normalize(p + off * uNoiseAmt);
      float d = dCircle(onPlane(w, drift(normalize(vec3(0.6, 0.5, 0.62)), t, 0.41, 0.0)), 0.35);
      d = blend(d, dTri(rot(0.4 + t * 0.11) * onPlane(w, drift(normalize(vec3(-0.55, 0.4, 0.73)), t, 0.29, 1.9)), 0.4, 0.08), 0.12);
      d = blend(d, dBox(rot(-0.25 - t * 0.08) * onPlane(w, drift(normalize(vec3(-0.6, -0.55, 0.58)), t, 0.53, 3.4)), vec2(0.3, 0.22), 0.09), 0.12);
      d = blend(d, dEllipse(rot(0.9 + t * 0.13) * onPlane(w, drift(normalize(vec3(0.5, -0.6, -0.62)), t, 0.35, 5.0)), vec2(0.42, 0.22)), 0.12);
      d = blend(d, dCircle(onPlane(w, drift(normalize(vec3(0.0, 0.15, -1.0)), t, 0.47, 2.6)), 0.3), 0.12);
      return d;
    }
    void main(){
      vec3 N = normalize(vNormalW); vec3 V = normalize(vViewW);
      if (uReflect > 0.5) N = -N;
      float facing = dot(N, V);
      float mask = smoothstep(-0.3, 0.45, facing);
      float t = uIdle;
      vec3 dir = normalize(vDir);
      float coord = field(dir, t) / (uSpacing * (1.0 + sin(t * 0.6) * 0.09)) - t * 0.35;
      float s = abs(fract(coord) - 0.5);
      float aa = fwidth(coord) * 0.65;
      float lw = max(0.0, uWidth + (hk_fbm(N * 4.0 + vec3(9.1, -2.7, 4.4)) - 0.5) * 0.03);
      lw *= 1.0 + sin(floor(coord) * 0.9 - t * 1.3) * 0.16;
      float tf = 1.0 - smoothstep(0.0, 0.55, distance(dir, normalize(uTouch)));
      lw += tf * tf * (3.0 - 2.0 * tf) * uTouchAmt * 0.08;
      float line = (1.0 - smoothstep(lw - aa, lw + aa, s)) * mask;
      vec3 ink = mix(uLine, vec3(1.0), uFlash * 0.18);
      if (uHolo > 0.0){
        float fr = pow(1.0 - max(facing, 0.0), 1.4);
        float hue = fract(fr * 0.85 + dot(vObjN, vec3(0.4, 0.7, 0.3)) * 0.3 + uTime * 0.05);
        vec3 h = clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); h = h * h * (3.0 - 2.0 * h);
        h = mix(vec3(dot(h, vec3(0.333))), h, 0.85);
        ink = mix(ink, mix(uLine, h, 0.75), clamp(uHolo, 0.0, 1.0));
      }
      vec3 col = mix(uFill, ink, line);
      float a = mix(uFillAlpha * mask, 1.0, line);
      if (uGlow > 0.0){
        float pulse = pow(0.5 + 0.5 * sin((coord * 0.6 - uTime * 0.28) * 6.2831853), 2.5);
        float heat = line * mix(0.35, 1.0, pulse) * (0.55 + uTreble * 1.35);
        float rim = pow(1.0 - max(facing, 0.0), mix(2.9, 1.9, uBass)) * (1.0 + (hk_fbm(N * 3.2 + vec3(uTime * 0.08)) - 0.5) * 0.55);
        col = mix(col, uGlowColor, clamp(heat * uGlow * 0.7, 0.0, 1.0));
        col += uGlowColor * max(rim, 0.0) * uGlow * (0.55 + uBass * 0.7);
        a = max(a, max(rim, 0.0) * mask * uGlow * 0.75);
      }
      a *= uOpacity;
      if (uReflect > 0.5) a *= (1.0 - smoothstep(0.0, 2.4, uFloorY - vWorldY)) * 0.42;
      gl_FragColor = vec4(col, a);
    }`;

  /* Background — a pale colored ring around the bright mass (light) behind the object, and outside it fine concentric circles distorted by noise. Within radius .5 around the cursor the ripples tremble finely */
  const BG_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;
  const BG_FRAG = `
    uniform vec3 uBg; uniform vec3 uBlob; uniform vec3 uGlow; uniform vec3 uMotif; uniform vec3 uDarkBg;
    uniform float uAspect; uniform float uTime; uniform float uDark; uniform float uHover; uniform float uClear;
    uniform vec2 uPointer; uniform vec2 uCenter; uniform float uSpacing;
    varying vec2 vUv;
    ${NOISE}
    void main(){
      vec2 p = vUv - uCenter - uPointer * 0.012; p.x *= uAspect;
      float d = length(p / vec2(1.0, 0.85));
      vec3 col = mix(uBg, uBlob, (1.0 - smoothstep(0.3, 1.15, d)) * 0.55 * smoothstep(-0.2, 0.5, vUv.y));
      col = mix(col, uGlow, (1.0 - smoothstep(0.0, 0.62, d)) * uClear);
      vec2 pa = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
      vec2 pp = vec2(uPointer.x * 0.5 * uAspect, uPointer.y * 0.5);
      float near = (1.0 - smoothstep(0.0, 0.5, distance(pa, pp))) * uHover;
      float scale = mix(0.42, 2.2, near);
      float warp = hk_fbm(vec3(pa * scale * 2.4, uTime * 0.02)) - 0.5;
      float rc = (length(p) + warp * 0.165) / uSpacing;
      float s = abs(fract(rc) - 0.5);
      float aa = fwidth(rc) * 0.8;
      float ring = 1.0 - smoothstep(0.03 - aa, 0.03 + aa, s);
      ring *= smoothstep(0.28, 0.95, d) * smoothstep(0.15, 0.65, vUv.y);
      col = mix(col, uMotif, ring * 0.18 * 1.6);
      col = mix(col, uDarkBg, uDark);
      gl_FragColor = vec4(col, 1.0);
    }`;

  /* Bottom — thin concentric circles on a translucent background panel, a click spreads one big ripple over 7 seconds */
  const FLOOR_VERT = `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  const FLOOR_FRAG = `
    uniform vec3 uBg; uniform vec3 uMotif; uniform vec2 uC; uniform float uOpacity; uniform float uImpact; uniform float uImpactT; uniform float uTime; uniform float uDark;
    varying vec3 vW;
    ${NOISE}
    void main(){
      vec2 q = vW.xz - uC; float r = length(q);
      float warp = hk_fbm(vec3(q * 0.42 * 0.35, uTime * 0.02)) - 0.5;
      float rc = (r + warp * 0.165 * 6.0) / 0.42;
      float s = abs(fract(rc) - 0.5); float aa = fwidth(rc);
      float ring = (1.0 - smoothstep(0.036 - aa, 0.036 + aa, s)) * (1.0 - smoothstep(3.0, 7.0, r)) * smoothstep(0.8, 2.2, r);
      float ir = mix(1.2, 24.0, 1.0 - pow(1.0 - uImpactT, 3.0));
      float band = (1.0 - smoothstep(0.0, 1.1, abs(r - ir))) * uImpact * (1.0 - uImpactT);
      float near = 1.0 - smoothstep(5.0, 9.0, r);
      vec3 col = mix(uBg, uMotif, clamp(ring * mix(0.55, 0.45, uDark) * 0.6 + band * 0.16 * 3.0, 0.0, 1.0));
      gl_FragColor = vec4(col, uOpacity * near + band * 0.3);
    }`;

  /* Standby — 1.1x shell behind the Brand sphere. Darker the more it faces you */
  const ATMO_VERT = `varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = cameraPosition - w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  const ATMO_FRAG = `uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vV;
    void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uColor, smoothstep(0.0, 1.0, f) * f * uOpacity); }`;

  /* ---------- World building ---------- */
  const host = document.querySelector("[data-stage]");
  if (!THREE || !host) return;
  THREE.ColorManagement.enabled = false;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  const STAGE_Z = -14, FLOOR_Y = -2.59, R = 1.9;

  const bgU = {
    uBg: { value: PAL[PROJECTS[active].theme].bg.clone() }, uBlob: { value: PAL[PROJECTS[active].theme].blob.clone() },
    uGlow: { value: PAL[PROJECTS[active].theme].glow.clone() }, uMotif: { value: PAL[PROJECTS[active].theme].motif.clone() },
    uDarkBg: { value: DARK.bg }, uAspect: { value: 1 }, uTime: { value: 0 }, uDark: { value: 0 }, uHover: { value: 0 }, uClear: { value: 1 },
    uPointer: { value: new THREE.Vector2() }, uCenter: { value: new THREE.Vector2(0.5, 0.52) }, uSpacing: { value: 0.04 },
  };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: BG_VERT, fragmentShader: BG_FRAG, uniforms: bgU, depthWrite: false, depthTest: false }));
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  const floorU = {
    uBg: bgU.uBg, uMotif: bgU.uMotif, uC: { value: new THREE.Vector2(0, STAGE_Z) }, uOpacity: { value: 0.59 },
    uImpact: { value: 0 }, uImpactT: { value: 1 }, uTime: bgU.uTime, uDark: bgU.uDark,
  };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShaderMaterial({ vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG, uniforms: floorU, transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y, STAGE_Z);
  floor.renderOrder = 2;
  scene.add(floor);

  const geo = new THREE.SphereGeometry(1, 192, 128);
  const first = PAL[PROJECTS[active].theme];
  const U = {
    uFrom: { value: PROJECTS[active].shape }, uTo: { value: PROJECTS[active].shape }, uMorph: { value: 0 }, uTime: { value: 0 },
    uAudio: { value: 0 }, uBass: { value: 0 }, uTreble: { value: 0 },
    uLine: { value: first.line.clone() }, uFill: { value: first.fill.clone() }, uFillAlpha: { value: 0 }, uOpacity: { value: 1 },
    uSpacing: { value: 0.016 * 4 }, uWidth: { value: 0.109 }, uNoiseAmt: { value: 0.165 }, uNoiseScale: { value: 0.42 }, uIdle: { value: 0 },
    uHolo: { value: 0 }, uReflect: { value: 0 }, uFloorY: { value: FLOOR_Y }, uTouch: { value: new THREE.Vector3(0, 0, 1) }, uTouchAmt: { value: 0 },
    uGlow: { value: 0 }, uGlowColor: { value: DARK.flow }, uFlash: { value: 0 },
  };
  const objMat = new THREE.ShaderMaterial({ vertexShader: OBJ_VERT, fragmentShader: OBJ_FRAG, uniforms: U, transparent: true, extensions: { derivatives: true } });
  const stage = new THREE.Group();
  stage.position.set(0, 0, STAGE_Z);
  scene.add(stage);
  const pivot = new THREE.Group();
  stage.add(pivot);
  const obj = new THREE.Mesh(geo, objMat);
  obj.renderOrder = 5;
  pivot.add(obj);
  const reflU = { ...U, uReflect: { value: 1 } };
  const refl = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: OBJ_VERT, fragmentShader: OBJ_FRAG, uniforms: reflU, transparent: true, depthWrite: false, side: THREE.BackSide }));
  refl.matrixAutoUpdate = false;
  refl.renderOrder = 1;
  scene.add(refl);
  const MIRROR = new THREE.Matrix4().makeTranslation(0, 2 * FLOOR_Y, 0).multiply(new THREE.Matrix4().makeScale(1, -1, 1));

  const atmoU = { uColor: { value: DARK.atmoLight.clone() }, uOpacity: { value: 0 } };
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 48), new THREE.ShaderMaterial({ vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG, uniforms: atmoU, transparent: true, depthWrite: false, side: THREE.BackSide }));
  atmo.renderOrder = 4;
  stage.add(atmo);

  /* ---------- Size & camera ---------- */
  let W = 1, H = 1;
  const view = { dist: 15.8, hover: 0, hoverP: 0, focus: PAGE === "detail" ? 1 : 0, dir: 0, leave: 0, intro: reduce ? 1 : 0 };
  const camPos = new THREE.Vector3(0, 0, 1.8);
  const tanH = Math.tan(THREE.MathUtils.degToRad(15));
  const resize = () => {
    W = host.clientWidth || innerWidth;
    H = host.clientHeight || innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    bgU.uAspect.value = W / H;
  };
  // Share of screen taken by the object’s diameter — desktop by height (rest .45 · raised .6 · detail .533), phone by width .61
  const distFor = (frac) => (phone() ? (2 * R) / (frac * 2 * tanH * camera.aspect) : (2 * R) / (frac * 2 * tanH));
  resize();
  addEventListener("resize", resize);

  /* ---------- Shape change — 1.05s cubic in-out, the spun angle unwinds with cubic out ---------- */
  const morph = { active: false, p: 1, from: PROJECTS[active].shape, to: PROJECTS[active].shape, rot0: 0 };
  const cubicInOut = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
  const cubicOut = (x) => 1 - (1 - x) ** 3;
  const quintInOut = (x) => (x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2);
  const rotState = { y: 0, x: 0, vy: 0, vx: 0 };
  const startMorph = (to) => {
    const wrap = ((rotState.y + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    morph.from = PROJECTS[active].shape;
    morph.to = PROJECTS[to].shape;
    morph.rot0 = reduce ? 0 : wrap;
    morph.p = reduce ? 1 : 0;
    morph.active = !reduce;
    rotState.y = 0; rotState.x = 0; rotState.vx = 0; rotState.vy = 0;
    active = to;
    U.uFrom.value = morph.from;
    U.uTo.value = morph.to;
    U.uMorph.value = reduce ? 1 : 0;
  };

  /* ---------- Cursor and drag ---------- */
  const ptr = { x: 0, y: 0, sx: 0, sy: 0, moved: false, inside: false, down: false, lastX: 0, lastY: 0, startX: 0, startY: 0, dragged: false, id: null };
  const smoothPtr = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const hitSphere = new THREE.Sphere(new THREE.Vector3(), R);
  const canvas = renderer.domElement;
  const overObject = () => {
    ray.setFromCamera(new THREE.Vector2(ptr.x, ptr.y), camera);
    hitSphere.center.setFromMatrixPosition(pivot.matrixWorld);
    hitSphere.radius = pivot.scale.x * (PROJECTS[active].shape === 1 ? 1.08 : 1.02);
    return ray.ray.intersectsSphere(hitSphere);
  };
  const tip = document.querySelector("[data-tip]");
  const dragHint = document.querySelector("[data-drag-hint]");
  let hintTimer = 0;
  const DRAG_KEY = "hk-dragged";
  const hadDragged = () => { try { return localStorage.getItem(DRAG_KEY) === "1"; } catch { return false; } };
  const hideHint = (remember) => {
    clearTimeout(hintTimer);
    dragHint?.classList.remove("is-visible");
    if (remember) try { localStorage.setItem(DRAG_KEY, "1"); } catch {}
  };
  const showHintLater = () => {
    if (!dragHint || reduce || hadDragged()) return;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => dragHint.classList.add("is-visible"), 1400);
  };

  const DRAG_SENS = 2.2, DRAG_SMOOTH = 0.35, DAMP = 0.955;
  canvas.addEventListener("pointermove", (e) => {
    ptr.x = (e.clientX / W) * 2 - 1;
    ptr.y = -(e.clientY / H) * 2 + 1;
    ptr.sx = e.clientX; ptr.sy = e.clientY;
    ptr.moved = true;
    ptr.inside = true;
    if (!ptr.down || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.lastX, dy = e.clientY - ptr.lastY;
    ptr.lastX = e.clientX; ptr.lastY = e.clientY;
    if (Math.hypot(e.clientX - ptr.startX, e.clientY - ptr.startY) > 6 && !ptr.dragged) {
      ptr.dragged = true;
      host.classList.add("is-grabbing");
      hideHint(true);
    }
    rotState.vy = THREE.MathUtils.lerp(rotState.vy, (dx / W) * Math.PI * DRAG_SENS, DRAG_SMOOTH);
    rotState.y += rotState.vy;
    if (PROJECTS[active].tilt) {
      rotState.vx = THREE.MathUtils.lerp(rotState.vx, (dy / H) * Math.PI * DRAG_SENS, DRAG_SMOOTH);
      rotState.x = THREE.MathUtils.clamp(rotState.x + rotState.vx, -1.2, 1.2);
    }
  });
  canvas.addEventListener("pointerleave", () => { ptr.inside = false; ptr.moved = false; });
  canvas.addEventListener("pointerenter", () => { ptr.inside = true; });
  canvas.addEventListener("pointerdown", (e) => {
    if (body.classList.contains("is-directory-open") || view.leave) return;
    ptr.down = true; ptr.id = e.pointerId; ptr.dragged = false;
    ptr.startX = ptr.lastX = e.clientX; ptr.startY = ptr.lastY = e.clientY;
    rotState.vx = 0; rotState.vy = 0;
    canvas.setPointerCapture?.(e.pointerId);
  });
  const release = (e) => {
    if (!ptr.down || e.pointerId !== ptr.id) return;
    ptr.down = false;
    host.classList.remove("is-grabbing");
    canvas.releasePointerCapture?.(e.pointerId);
    if (!ptr.dragged && e.type === "pointerup") onTap(e);
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  const fireImpact = () => {
    floorU.uImpact.value = 1;
    floorU.uImpactT.value = 0;
    gsap.to(floorU.uImpactT, { value: 1, duration: 7, ease: "none" });
    gsap.fromTo(U.uFlash, { value: 1 }, { value: 0, duration: 0.6, ease: "power2.out" });
  };
  const hooks = { tap: [], frame: [] };
  function onTap(e) {
    ptr.x = (e.clientX / W) * 2 - 1;
    ptr.y = -(e.clientY / H) * 2 + 1;
    for (const h of hooks.tap) if (h(e) === true) return;
    if (!overObject()) return;
    if (PAGE === "home") { fireImpact(); go(PROJECTS[active].href); }
    else fireImpact();
  }

  /* ---------- Cursor response of line weight — within 420px of the object’s screen center it thickens from .109 to .274, following by .08 per frame ---------- */
  const tmpV = new THREE.Vector3();
  let widthNow = 0.109;
  const phase = 0;
  const widthTarget = (t) => {
    if (!fine || !ptr.moved) return fine ? 0.109 : 0.109 + 0.165 * (0.22 + (0.5 + 0.5 * Math.sin(t * 0.42 + phase)) * 0.5);
    tmpV.setFromMatrixPosition(pivot.matrixWorld).project(camera);
    const dx = (ptr.x - tmpV.x) * (W / 2), dy = (ptr.y - tmpV.y) * (H / 2);
    return 0.109 + 0.165 * THREE.MathUtils.clamp(1 - Math.hypot(dx, dy) / 420, 0, 1);
  };

  /* ---------- Object screen position → control button position ---------- */
  const root = document.documentElement;
  let lastBottom = -1;
  const publishBounds = () => {
    const c = tmpV.setFromMatrixPosition(pivot.matrixWorld).clone();
    const s = pivot.scale.x;
    const hy = s * (PROJECTS[active].shape === 1 ? 1.11 : 1);
    const hx = s * (PROJECTS[active].shape === 1 ? 1.09 : 1);
    const b = c.clone().add(new THREE.Vector3(0, -hy, 0)).project(camera);
    const l = c.clone().add(new THREE.Vector3(-hx, 0, 0)).project(camera);
    const r = c.clone().add(new THREE.Vector3(hx, 0, 0)).project(camera);
    const bottom = (1 - b.y) * 0.5 * H;
    if (Math.abs(bottom - lastBottom) < 0.5) return;
    lastBottom = bottom;
    root.style.setProperty("--obj-bottom", `${bottom.toFixed(1)}px`);
    root.style.setProperty("--obj-left", `${((l.x + 1) * 0.5 * W).toFixed(1)}px`);
    root.style.setProperty("--obj-right", `${((r.x + 1) * 0.5 * W).toFixed(1)}px`);
  };

  /* ---------- State (values changed from outside) ---------- */
  const state = {
    dark: 0, darkTarget: 0, holoTarget: 0,
    audio: 0, bass: 0, treble: 0, playing: null, playLevel: 0, presetW: [1, 0, 0],
    touch: 0, game: 0, gameScale: 1,
  };

  /* ---------- One frame ---------- */
  const k = (base, dt) => 1 - Math.pow(1 - base, dt * 60);
  const lerpColor = (c, to, f) => c.lerp(to, f);
  let last = performance.now(), clock = 0, idle = 0;
  const loop = (now) => {
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    clock += dt;
    if (!reduce) idle += dt;
    const t = clock;

    // Slowly tints (.03/frame) to the chosen project color — drawer color when the drawer opens
    const pal = view.dir > 0.5 ? PAL.dir : PAL[PROJECTS[active].theme];
    const cf = reduce ? 1 : k(0.03, dt);
    lerpColor(bgU.uBg.value, pal.bg, cf); lerpColor(bgU.uBlob.value, pal.blob, cf);
    lerpColor(bgU.uGlow.value, pal.glow, cf); lerpColor(bgU.uMotif.value, pal.motif, cf);
    const target = PAL[PROJECTS[active].theme];
    if (morph.active) {
      morph.p = Math.min(1, morph.p + dt / 1.05);
      const e = cubicInOut(morph.p);
      U.uMorph.value = e;
      rotState.y = 0;
      pivot.rotation.y = morph.rot0 * (1 - cubicOut(morph.p));
      U.uLine.value.copy(PAL[PROJECTS.find((p) => p.shape === morph.from).theme].line).lerp(target.line, e);
      U.uFill.value.copy(PAL[PROJECTS.find((p) => p.shape === morph.from).theme].fill).lerp(target.fill, e);
      if (morph.p >= 1) { morph.active = false; U.uFrom.value = morph.to; U.uMorph.value = 0; }
    } else {
      U.uLine.value.lerp(target.line, cf);
      U.uFill.value.lerp(target.fill, cf);
    }

    // Drag inertia — on release it decays by .955 per frame, and below .0016 it eases to 0 in .055 steps
    if (!ptr.down && !morph.active) {
      const decay = (v) => {
        let n = v * Math.pow(DAMP, dt * 60);
        if (Math.abs(n) < 0.0016) n = THREE.MathUtils.lerp(n, 0, k(0.055, dt));
        return Math.abs(n) < 2e-5 ? 0 : n;
      };
      rotState.vy = decay(rotState.vy); rotState.vx = decay(rotState.vx);
      rotState.y += rotState.vy;
      rotState.x = THREE.MathUtils.clamp(rotState.x + rotState.vx, -1.2, 1.2);
    }
    if (!morph.active) pivot.rotation.y = rotState.y;
    pivot.rotation.x = rotState.x;

    // Hover — approaches with 0.9s quint in-out and recedes with 0.6s cubic in-out
    const hovering = PAGE === "home" && fine && ptr.inside && !ptr.down && view.dir < 0.5 && !view.leave && view.intro > 0.9 && overObject();
    if (hovering !== view.hover) { view.hover = hovering; tip?.classList.toggle("is-visible", hovering); host.classList.toggle("is-hover", hovering); }
    if (hovering && tip) { tip.style.setProperty("--tip-x", `${ptr.sx}px`); tip.style.setProperty("--tip-y", `${ptr.sy}px`); }
    view.hoverP = THREE.MathUtils.clamp(view.hoverP + (hovering ? dt / 0.9 : -dt / 0.6), 0, 1);
    const pull = reduce ? 0 : (hovering ? quintInOut(view.hoverP) : cubicInOut(view.hoverP));

    // Camera — from rest 15.8, scrolling brings it 4 closer, and detail is the distance where the diameter is .533. Very slow drift
    const restD = phone() ? distFor(0.61) : 15.8;
    const focusD = phone() ? distFor(0.52) : distFor(0.533);
    const wantD = THREE.MathUtils.lerp(restD - (phone() ? 0 : pull * 4), focusD, view.focus);
    const g = k(0.08, dt);
    view.dist = THREE.MathUtils.lerp(view.dist, wantD, g);
    const driftOn = reduce || view.focus > 0.5 || view.dir > 0.5 ? 0 : 1;
    camPos.set(
      Math.sin(t * 0.19) * 0.15 * driftOn,
      Math.sin(t * 0.23 + 1.3) * 0.08 * driftOn + (phone() ? -0.28 * (view.dist / 15.8) : 0),
      STAGE_Z + view.dist + Math.sin(t * 0.17 + 2.1) * 0.05 * driftOn,
    );
    camera.position.copy(camPos);
    camera.lookAt(Math.sin(t * 0.13) * 0.09 * driftOn, camPos.y * 0.6, STAGE_Z);
    camera.rotation.z += Math.sin(t * 0.11) * 0.012 * driftOn;

    // When the drawer opens, the object moves down and shrinks (.06/frame)
    view.dir = THREE.MathUtils.lerp(view.dir, body.classList.contains("is-directory-open") ? 1 : 0, reduce ? 1 : k(0.06, dt));
    const introS = 0.86 + 0.14 * view.intro;
    const gs = state.gameScale;
    pivot.scale.setScalar(R * introS * (1 - 0.35 * view.dir) * gs);
    pivot.position.y = -0.5 * (1 - view.intro) - view.dir * 3.2 - (1 - gs) * 1.6;
    U.uOpacity.value = view.intro * (1 - view.dir);
    atmo.scale.setScalar(pivot.scale.x);
    atmo.position.copy(pivot.position);
    atmo.visible = PROJECTS[active].shape === 0 && !morph.active;

    // Electric view (Brand) — dark background, rainbow lines, teal atmosphere
    state.dark = THREE.MathUtils.lerp(state.dark, state.darkTarget, reduce ? 1 : k(0.05, dt));
    bgU.uDark.value = state.dark;
    U.uHolo.value = state.dark * state.holoTarget;
    atmoU.uColor.value.copy(DARK.atmoLight).lerp(DARK.atmo, state.dark);
    atmoU.uOpacity.value = THREE.MathUtils.lerp(0.18, 0.5, state.dark) * view.intro * (1 - view.dir);

    // Sound — the surface ripples and the lines glow with the beat of the chosen sound
    const playing = state.playing !== null;
    state.playLevel = THREE.MathUtils.lerp(state.playLevel, playing ? 1 : 0, 0.045);
    if (!playing && state.playLevel < 0.001) state.playLevel = 0;
    const s = state.playLevel;
    U.uAudio.value = state.audio * s;
    U.uBass.value = state.bass * s;
    U.uTreble.value = state.treble * s;
    U.uFillAlpha.value = PROJECTS[active].shape === 2 ? s * 0.28 : 0;
    U.uGlow.value = PROJECTS[active].shape === 2 ? s * (0.45 + state.audio * 0.55) : 0;

    // Hand interaction — the line on the side of the surface the cursor touches gets thicker (.16 on enter, .05 on leave)
    const touchOn = PAGE === "detail" && PROJECTS[active].shape === 2 && fine && ptr.inside && overObject();
    if (touchOn) {
      const hit = ray.ray.intersectSphere(hitSphere, new THREE.Vector3());
      if (hit) U.uTouch.value.copy(pivot.worldToLocal(hit)).normalize();
    }
    U.uTouchAmt.value = THREE.MathUtils.lerp(U.uTouchAmt.value, touchOn ? 1 : 0, touchOn ? 0.16 : 0.05);

    widthNow = THREE.MathUtils.lerp(widthNow, widthTarget(t), 0.08);
    U.uWidth.value = widthNow;
    U.uTime.value = t;
    U.uIdle.value = idle * 0.15;
    bgU.uTime.value = t;
    smoothPtr.lerp(new THREE.Vector2(ptr.inside ? ptr.x : 0, ptr.inside ? ptr.y : 0), k(0.06, dt));
    bgU.uPointer.value.copy(smoothPtr);
    bgU.uHover.value = THREE.MathUtils.lerp(bgU.uHover.value, ptr.inside && fine ? 1 : 0, k(0.05, dt));
    bgU.uCenter.value.set(0.5, phone() ? 0.55 : 0.52);
    floorU.uOpacity.value = THREE.MathUtils.lerp(0.59, 0.85, state.dark);

    for (const h of hooks.frame) h(dt, t);

    scene.updateMatrixWorld();
    refl.matrix.multiplyMatrices(MIRROR, obj.matrixWorld);
    refl.matrixWorld.copy(refl.matrix);
    renderer.render(scene, camera);
    publishBounds();
    requestAnimationFrame(loop);
  };

  // Shaders are precompiled when the world is built — compiling on the first move would freeze the screen
  renderer.compile(scene, camera);

  /* ---------- Transition — clears the on-screen text, the camera approaches detail distance, then moves on ---------- */
  const overlay = document.querySelector("[data-overlay]");
  function go(href) {
    if (view.leave) return;
    view.leave = 1;
    hideHint(false);
    tip?.classList.remove("is-visible");
    const toDetail = PAGE === "home";
    body.classList.add("is-leaving");
    if (reduce) { location.href = href; return; }
    gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power1.out" });
    // Transition length differs per original object — returning from detail: Brand A .65s · City and Brand B 1.45s (body data-leave)
    gsap.to(view, { focus: toDetail ? 1 : 0, duration: +(body.dataset.leave || 0.9), ease: "power2.inOut", onComplete: () => { location.href = href; } });
  }
  hooks.go = go;

  /* ---------- Loader → Entrance ---------- */
  const loader = document.querySelector("[data-loader]");
  const revealGroups = [...document.querySelectorAll("[data-reveal]")]
    .sort((a, b) => +a.dataset.reveal - +b.dataset.reveal)
    .reduce((acc, el) => { (acc[+el.dataset.reveal] ||= []).push(el); return acc; }, [])
    .filter(Boolean);
  const intro = () => {
    if (reduce) { view.intro = 1; showHintLater(); hooks.afterIntro?.(); return; }
    gsap.set(revealGroups.flat(), { opacity: 0, y: 16 });
    const tl = gsap.timeline({ onComplete: () => gsap.set(revealGroups.flat(), { clearProps: "opacity,transform" }) });
    tl.to(view, { intro: 1, duration: 1.4, ease: "expo.out" }, 0);
    revealGroups.forEach((group, i) => tl.to(group, { opacity: 1, y: 0, duration: 0.7, ease: EASE_CSS }, 0.2 + i * 0.18));
    tl.call(showHintLater, [], 0.4);
    if (hooks.afterIntro) tl.call(hooks.afterIntro, [], 0.3);
  };
  const counter = { v: 0 };
  const start = () => {
    requestAnimationFrame((n) => { last = n; requestAnimationFrame(loop); });
    if (reduce || !loader) { loader?.classList.add("is-hidden"); intro(); return; }
    gsap.to(counter, {
      v: 1, duration: 0.7, ease: "power1.out",
      onUpdate: () => { loader.textContent = `${Math.round(counter.v * 100)}%`; },
      onComplete: () => gsap.to(loader, { opacity: 0, duration: 0.25, ease: "power1.out", onComplete: () => { loader.classList.add("is-hidden"); intro(); } }),
    });
  };
  if (PAGE === "home") gsap.set(revealGroups.flat(), { opacity: 0 });

  /* ---------- Home: choose a project ---------- */
  const items = [...document.querySelectorAll("[data-project]")];
  const exploreLinks = [...document.querySelectorAll("[data-explore]")];
  const select = (i) => {
    i = ((i % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
    if (i === active && !morph.active) return;
    startMorph(i);
    document.querySelectorAll("[data-projects]").forEach((l) => l.style.setProperty("--active", i));
    items.forEach((el) => el.classList.toggle("is-active", +el.dataset.project === i));
    items.forEach((el) => el.querySelector("button")?.setAttribute("aria-current", String(+el.dataset.project === i)));
    exploreLinks.forEach((a) => {
      if (reduce) { a.href = PROJECTS[i].href; return; }
      gsap.timeline().to(a, { opacity: 0, duration: 0.16, ease: "power1.out" }).call(() => { a.href = PROJECTS[i].href; }).to(a, { opacity: 1, duration: 0.16, ease: "power1.out" });
    });
  };
  if (PAGE === "home") {
    document.querySelectorAll("[data-projects]").forEach((l) => l.style.setProperty("--active", active));
    items.forEach((el) => el.classList.toggle("is-active", +el.dataset.project === active));
    exploreLinks.forEach((a) => { a.href = PROJECTS[active].href; });
    items.forEach((el) => el.querySelector("button")?.addEventListener("click", () => {
      const i = +el.dataset.project;
      if (i === active) go(PROJECTS[i].href); else select(i);
    }));
    addEventListener("keydown", (e) => {
      if (body.classList.contains("is-directory-open")) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") select(active + 1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") select(active - 1);
    });
    // Phone list swipes horizontally
    const mList = document.querySelector(".hk-projects-m__list");
    let sx = null;
    mList?.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    mList?.addEventListener("pointerup", (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 36) select(active + (dx < 0 ? 1 : -1));
    });
    exploreLinks.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); go(PROJECTS[active].href); }));
  }

  /* ---------- Detail: entrance (panel text → bottom scale → controls) ---------- */
  if (PAGE === "detail") {
    body.classList.add("is-focus");
    hooks.afterIntro = () => {
      if (reduce) return;
      const panel = [...document.querySelectorAll("[data-panel] > *")];
      const rail = [...document.querySelectorAll(".hk-grid__item")];
      const ctl = [...document.querySelectorAll("[data-ctl] .hk-btn, [data-card]")];
      gsap.set([...panel, ...rail], { opacity: 0, y: 14 });
      gsap.set(ctl, { opacity: 0 });
      const tl = gsap.timeline();
      let at = 0;
      const add = (els, rise = true) => {
        if (!els.length) return;
        tl.to(els, { opacity: 1, ...(rise ? { y: 0 } : {}), duration: 0.55, ease: EASE_CSS, stagger: 0.05, clearProps: "opacity,transform" }, at);
        at += 0.12 + (els.length - 1) * 0.05;
      };
      add(panel); add(rail); add(ctl, false);
    };
    document.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      if (state.game) { hooks.endGame?.(true); return; }
      go(`index.html?p=${active}`);
    }));
  }

  /* ---------- Drawer ---------- */
  const dir = document.querySelector("[data-dir]");
  const dirBtn = document.querySelector("[data-dir-open]");
  const preview = document.querySelector("[data-preview]");
  let dirTl = null;
  const openDir = () => {
    if (!dir || dir.classList.contains("is-open")) return;
    dir.classList.add("is-open");
    body.classList.add("is-directory-open");
    dirBtn?.setAttribute("aria-expanded", "true");
    hideHint(false);
    tip?.classList.remove("is-visible");
    revealRows();
  };
  const closeDir = () => {
    if (!dir?.classList.contains("is-open")) return;
    dir.classList.remove("is-open");
    body.classList.remove("is-directory-open");
    dirBtn?.setAttribute("aria-expanded", "false");
    preview?.classList.remove("is-visible");
  };
  const revealRows = () => {
    dirTl?.kill();
    if (reduce) return;
    const rows = [...dir.querySelectorAll(".hk-dir__list.is-active .hk-dir__row")];
    const tabs = [...dir.querySelectorAll(".hk-dir__tab")];
    gsap.set([...tabs, ...rows], { opacity: 0, y: 12 });
    dirTl = gsap.timeline();
    dirTl.to(tabs, { opacity: 1, y: 0, duration: 0.5, ease: EASE_CSS, clearProps: "opacity,transform" });
    dirTl.to(rows, { opacity: 1, y: 0, duration: 0.5, ease: EASE_CSS, stagger: 0.035, clearProps: "opacity,transform" }, 0.08);
  };
  dirBtn?.addEventListener("click", openDir);
  document.querySelectorAll("[data-dir-close]").forEach((b) => b.addEventListener("click", (e) => {
    if (!dir?.classList.contains("is-open")) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    closeDir();
  }, true));
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDir(); });
  dir?.querySelectorAll(".hk-dir__tab").forEach((tab) => tab.addEventListener("click", () => {
    dir.querySelectorAll(".hk-dir__tab").forEach((t) => { t.classList.toggle("is-active", t === tab); t.setAttribute("aria-selected", String(t === tab)); });
    dir.querySelectorAll(".hk-dir__list").forEach((l) => l.classList.toggle("is-active", l.dataset.list === tab.dataset.tab));
    preview?.classList.remove("is-visible");
    revealRows();
  }));
  // The preview follows the cursor by .18 each step
  const pv = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
  const pvStep = () => {
    pv.x += (pv.tx - pv.x) * 0.18;
    pv.y += (pv.ty - pv.y) * 0.18;
    preview.style.setProperty("--pv-x", `${pv.x.toFixed(1)}px`);
    preview.style.setProperty("--pv-y", `${pv.y.toFixed(1)}px`);
    pv.raf = Math.abs(pv.tx - pv.x) + Math.abs(pv.ty - pv.y) > 0.3 ? requestAnimationFrame(pvStep) : 0;
  };
  dir?.addEventListener("pointermove", (e) => {
    if (!preview || !fine) return;
    const row = e.target.closest?.(".hk-dir__row");
    if (!row) { preview.classList.remove("is-visible"); return; }
    if (!preview.classList.contains("is-visible")) { pv.x = e.clientX; pv.y = e.clientY; }
    pv.tx = e.clientX; pv.ty = e.clientY;
    preview.dataset.label = row.dataset.thumb || "";
    preview.classList.add("is-visible");
    if (!pv.raf) pv.raf = requestAnimationFrame(pvStep);
  });
  dir?.addEventListener("pointerleave", () => preview?.classList.remove("is-visible"));
  dir?.querySelectorAll(".hk-dir__row[data-href]").forEach((row) => row.addEventListener("click", () => {
    closeDir();
    go(row.dataset.href);
  }));

  /* ---------- Sound button · mail copy · magnet · ripple ---------- */
  const sound = document.querySelector("[data-sound]");
  const soundTip = sound?.querySelector(".hk-sound__tip");
  state.soundOn = false;
  // From .9s after start, the sound button breathes once every 3s, calling to be pressed
  const invite = setTimeout(() => sound?.classList.add("is-inviting"), 900);
  sound?.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    sound.classList.toggle("is-on", state.soundOn);
    clearTimeout(invite);
    sound.classList.remove("is-inviting");
    sound.setAttribute("aria-pressed", String(state.soundOn));
    if (soundTip) soundTip.textContent = state.soundOn ? "Sound is on · Return to silence" : "Sound is off · The page comes alive with a sound";
    hooks.sound?.(state.soundOn);
  });
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch {}
    b.classList.add("is-copied");
    setTimeout(() => b.classList.remove("is-copied"), 1600);
  }));
  // Magnet — the button follows the cursor distance × .22 linearly over 120ms, the text inside moves .35 of that, and it returns over 620ms on leave
  if (fine && !reduce) document.querySelectorAll("[data-magnet]").forEach((el) => {
    const m = +el.dataset.magnet || 0.22;
    const label = el.querySelector("span");
    el.style.transition = `${getComputedStyle(el).transition}, translate 120ms linear`;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${dx * m}px ${dy * m}px`;
      if (label) { label.style.transition = "transform 120ms linear"; label.style.transform = `translate(${dx * m * 0.35}px, ${dy * m * 0.35}px)`; }
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = `${getComputedStyle(el).transition.replace(/,?\s*translate 120ms linear/, "")}, translate 620ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
      el.style.translate = "0px 0px";
      if (label) { label.style.transition = "transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1)"; label.style.transform = "translate(0, 0)"; }
    });
  });
  document.querySelectorAll("[data-ripple]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    el.addEventListener("pointerleave", () => { el.style.removeProperty("--px"); el.style.removeProperty("--py"); });
  });

  window.hkStage = { THREE, scene, stage, pivot, camera, renderer, U, state, hooks, PAL, R, FLOOR_Y, STAGE_Z, fireImpact, go, select, reduce, fine, cssColor, objMat, geo };
  start();
})();
