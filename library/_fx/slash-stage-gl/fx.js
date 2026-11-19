(() => {
  // Original DisplayText WebGL stage (three) — behind the big title, a slanted (/) pillar and a floor stand on the panel, and while passing the section the camera rotates half of .35 turns while
  // Tilts toward the mouse by .13rad·26 (.02 per frame). Three types: wire (curved grid floor + wire pillars + sky net), points (point-cloud terrain + glass pillars), aurora (aurora sky + mountain range + glowing pillars)
  const here = document.currentScript?.src || location.href;
  let loading = null;
  const loadThree = () => {
    if (window.THREE) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const had = "exports" in window, prev = window.exports;
      window.exports = {};
      const tag = document.createElement("script");
      tag.src = new URL("../../_vendor/three@0.174.0/build/three.cjs", here).href;
      tag.onload = () => { window.THREE = window.exports; if (had) window.exports = prev; else delete window.exports; resolve(); };
      tag.onerror = reject;
      document.head.append(tag);
    });
    return loading;
  };

  // Values carried over from the original scene settings (camera·terrain·grid·pulse·reveal)
  const PRESET = {
    wire: { fov: 60, height: 80, distance: 180, aim: 70 },
    points: { fov: 58, height: 95, distance: 175, aim: 100 },
    aurora: { fov: 52, height: 85, distance: 220, aim: 85 },
  };

  kfFx.register("slash-stage-gl", (el, ctx) => {
    if (window.THREE) return build(el, ctx);
    let off = null, gone = false;
    loadThree().then(() => { if (!gone && el.isConnected) off = build(el, ctx); }, () => {});
    return () => { gone = true; off?.(); };
  });

  const GRID_VERT = `
    uniform float uTime, uPulse, uReveal, uRing, uRingW, uRingH, uFar;
    varying float vA;
    void main() {
      vec3 p = position;
      float r = length(p.xz);
      p.y = uRingH * exp(-pow((r - 35.0) / uRingW, 2.0)) + 10.5 * sin(p.x * 0.004 + 1.3) * sin(p.z * 0.005);
      float front = uPulse * 290.0;
      p.y += 20.0 * exp(-pow((r - front) / 60.0, 2.0)) * step(0.0, uPulse) * (1.0 - smoothstep(0.9, 1.3, uPulse));
      vA = (1.0 - smoothstep(uFar * 0.45, uFar, r)) * uReveal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const GRID_FRAG = `
    uniform vec3 uColor; uniform float uStrength;
    varying float vA;
    void main() { gl_FragColor = vec4(uColor, vA * uStrength); }`;

  const POINT_VERT = `
    uniform float uReveal, uTime, uSize, uFar;
    attribute float aSeed;
    varying float vA; varying float vH;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
    void main() {
      vec3 p = position;
      float r = length(p.xz);
      float m = smoothstep(120.0, 700.0, r);
      float h = fbm(p.xz * 0.006 + 3.1) * (25.0 + 260.0 * m) - 30.0 * exp(-r * r / 9000.0);
      h += sin(uTime * 0.6 + aSeed * 6.28) * 1.5;
      p.y = h;
      vH = clamp(h / 180.0, 0.0, 1.0);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vA = (1.0 - smoothstep(uFar * 0.55, uFar, r)) * uReveal * (0.35 + 0.65 * fract(aSeed * 7.31));
      gl_PointSize = uSize * (300.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }`;
  const POINT_FRAG = `
    uniform vec3 uColor, uDeep;
    varying float vA; varying float vH;
    void main() {
      vec2 c = gl_PointCoord - 0.5; if (dot(c, c) > 0.25) discard;
      gl_FragColor = vec4(mix(uDeep, uColor, 0.35 + 0.65 * vH), vA);
    }`;

  const SPARK_VERT = `
    uniform float uTime, uReveal; attribute float aSeed; varying float vA;
    void main() {
      vec3 p = position;
      float life = fract(uTime / 4.0 + aSeed);
      p.y = mod(p.y + 75.0 + life * 30.0, 150.0) - 75.0;
      vA = uReveal * sin(life * 3.14159) * (0.4 + 0.6 * step(0.5, fract(aSeed * 17.0 + uTime * 0.7)));
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = 24.0 * 0.95 * (8.0 / -mv.z) * (0.4 + aSeed);
      gl_Position = projectionMatrix * mv;
    }`;
  const SPARK_FRAG = `
    uniform vec3 uColor; varying float vA;
    void main() { vec2 c = gl_PointCoord - 0.5; float d = dot(c, c); if (d > 0.25) discard; gl_FragColor = vec4(uColor * 1.6, vA * (1.0 - d * 4.0)); }`;

  const SKY_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const SKY_FRAG = `
    uniform float uTime, uReveal; uniform vec3 uColor, uDeep, uBase;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.05;
      float curtain = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float x = uv.x * (2.2 + fi * 1.3) + t * (1.0 + fi * 0.4) + fi * 4.1;
        float edge = 0.48 + 0.12 * noise(vec2(x, fi)) + 0.05 * sin(x * 3.0 + t * 6.0);
        float band = smoothstep(edge - 0.02, edge, uv.y) * (1.0 - smoothstep(edge, edge + 0.22 + 0.1 * fi, uv.y));
        float rays = 0.55 + 0.45 * noise(vec2(uv.x * 40.0 + fi * 13.0, t * 3.0));
        curtain += band * rays * (0.55 - fi * 0.12);
      }
      // The original sky isn’t bands but patches of hazy light blooming here and there — cut up with large noise and laid low
      float clump = smoothstep(0.35, 0.85, noise(vec2(uv.x * 3.2 + t * 0.6, uv.y * 2.0 - t * 0.3)));
      float glow = exp(-pow((uv.y - 0.36) / 0.16, 2.0)) * 0.22;
      vec3 col = uBase + uDeep * glow + uColor * curtain * clump * 0.38;
      float star = step(0.9975, hash(floor(uv * vec2(900.0, 500.0)))) * smoothstep(0.55, 0.9, uv.y);
      col += vec3(star) * 0.6;
      gl_FragColor = vec4(col * uReveal, 1.0);
    }`;

  const TERRAIN_VERT = `
    uniform float uReveal;
    varying float vH; varying float vD; varying float vY;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { s += a * noise(p); p *= 2.07; a *= 0.48; } return s; }
    float hgt(vec2 q) {
      float r = length(q);
      float ridge = 1.0 - abs(fbm(q * 0.0022 + 7.0) * 2.0 - 1.0);
      float m = smoothstep(260.0, 1500.0, r);
      return -20.0 + ridge * ridge * 420.0 * m + fbm(q * 0.02) * (14.0 + 40.0 * m);
    }
    varying vec3 vN; varying vec3 vW;
    void main() {
      vec3 p = position;
      float r = length(p.xz);
      p.y = hgt(p.xz);
      // Get the face direction from the height gradient so it catches light (the original terrain is a metalness .6 · roughness .3 surface with a mint point light)
      float e = 6.0;
      vN = normalize(vec3(hgt(p.xz - vec2(e, 0.0)) - hgt(p.xz + vec2(e, 0.0)), 2.0 * e, hgt(p.xz - vec2(0.0, e)) - hgt(p.xz + vec2(0.0, e))));
      vH = clamp(p.y / 380.0, 0.0, 1.0);
      vD = r;
      vY = p.y;
      vec4 w = modelMatrix * vec4(p, 1.0);
      vW = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  // When drawing the water reflection, cut off the ground below the water (uClip) — the mirror camera looks up from under the water
  const TERRAIN_FRAG = `
    uniform vec3 uColor, uBase, uDeep, uRock, uFog; uniform float uReveal, uClip;
    varying float vH; varying float vD; varying float vY; varying vec3 vN; varying vec3 vW;
    void main() {
      if (vY < uClip) discard;
      vec3 n = normalize(vN);
      vec3 L = normalize(vec3(0.0, 1000.0, 0.0) - vW);
      vec3 L2 = normalize(vec3(0.0, 300.0, -1200.0) - vW);
      float dif = max(dot(n, L), 0.0) * 0.55 + max(dot(n, L2), 0.0) * 0.45;
      vec3 V = normalize(cameraPosition - vW);
      float spec = pow(max(dot(reflect(-L2, n), V), 0.0), 18.0) * 0.35;
      vec3 col = uRock * (0.18 + 0.75 * dif) + uColor * (0.05 * dif + spec);
      col = mix(col, uDeep * 1.4, (1.0 - smoothstep(0.0, 0.05, vH)) * 0.6);
      // Original fog #173a37 · density .00018 (scene scale 10)
      float fog = 1.0 - exp(-pow(length(cameraPosition - vW) * 0.00018 * 1.6, 2.0));
      col = mix(col, uFog, clamp(fog, 0.0, 1.0));
      gl_FragColor = vec4(col * uReveal, 1.0);
    }`;

  // Water (original water: height 20 · reflectivity .55 · opacity .3 · reflection strength .43 · ripple .6 · blur .46 · wave amplitude 1 · frequency .5 · speed .1 · edge .09/1.6)
  //   For reflection, a panel drawn with a mirror camera is read flipped vertically in screen position
  const WATER_VERT = `
    varying vec3 vW; varying vec2 vUv;
    void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  const WATER_FRAG = `
    uniform sampler2D uReflect; uniform vec2 uRes; uniform float uTime, uReveal, uStrength; uniform vec3 uDeep, uShallow;
    varying vec3 vW; varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    void main() {
      vec2 st = gl_FragCoord.xy / uRes;
      float t = uTime * 0.1;
      vec2 q = vW.xz * 0.5 * 0.02;
      vec2 n = vec2(noise(q * vec2(1.0, 3.0) + vec2(t * 4.0, 0.0)), noise(q * vec2(1.3, 3.4) + vec2(7.0, -t * 3.0))) - 0.5;
      n += (vec2(noise(q * 4.1 - t * 5.0), noise(q * 3.7 + t * 6.0 + 3.0)) - 0.5) * 0.5;
      vec3 V = normalize(cameraPosition - vW);
      float graze = 1.0 - clamp(V.y, 0.0, 1.0);
      vec2 ruv = vec2(st.x, 1.0 - st.y) + n * 0.6 * 0.04 * (0.35 + 0.65 * graze);
      vec2 b = 0.46 * 2.5 / uRes;
      vec3 r = texture2D(uReflect, ruv).rgb * 0.36
        + (texture2D(uReflect, ruv + vec2(b.x, 0.0)).rgb + texture2D(uReflect, ruv - vec2(b.x, 0.0)).rgb
         + texture2D(uReflect, ruv + vec2(0.0, b.y)).rgb + texture2D(uReflect, ruv - vec2(0.0, b.y)).rgb) * 0.16;
      float fres = 0.55 + 0.45 * pow(graze, 5.0);
      float glint = dot(r, vec3(0.2126, 0.7152, 0.0722));
      vec3 col = mix(uDeep, r, clamp(fres * (uStrength + 0.3), 0.0, 1.0)) + uShallow * glint * 0.08;
      vec2 e = min(vUv, 1.0 - vUv);
      float feather = pow(smoothstep(0.0, 0.09, min(e.x, e.y)), 1.6);
      gl_FragColor = vec4(col * uReveal, (0.3 + 0.7 * fres) * feather * uReveal);
    }`;

  // Bloom (original post-processing: brightness threshold .82 · softness .25 · mip blur radius .7 · 6 levels (phone 4) · strength .85, vignette .4/.5).
  //   The scene is drawn in screen values, so unpack it linearly for threshold · blur · add, then wrap back to screen values at the end
  const POST_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const LIN = `
    vec3 toLin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
    vec3 toScr(vec3 c) { c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }`;
  const BRIGHT_FRAG = `
    uniform sampler2D tMap; uniform float uThreshold, uSmooth; varying vec2 vUv; ${LIN}
    void main() { vec3 c = toLin(texture2D(tMap, vUv).rgb); float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      gl_FragColor = vec4(c * smoothstep(uThreshold, uThreshold + uSmooth, l), 1.0); }`;
  const DOWN_FRAG = `
    uniform sampler2D tMap; uniform vec2 uTexel; varying vec2 vUv;
    vec3 s(vec2 o) { return texture2D(tMap, vUv + o * uTexel).rgb; }
    void main() {
      vec3 c = s(vec2(0.0)) * 0.125;
      c += (s(vec2(-1.0, -1.0)) + s(vec2(1.0, -1.0)) + s(vec2(-1.0, 1.0)) + s(vec2(1.0, 1.0))) * 0.125;
      c += (s(vec2(-2.0, -2.0)) + s(vec2(2.0, -2.0)) + s(vec2(-2.0, 2.0)) + s(vec2(2.0, 2.0))) * 0.03125;
      c += (s(vec2(-2.0, 0.0)) + s(vec2(2.0, 0.0)) + s(vec2(0.0, -2.0)) + s(vec2(0.0, 2.0))) * 0.0625;
      gl_FragColor = vec4(c, 1.0);
    }`;
  const UP_FRAG = `
    uniform sampler2D tMap, tSupport; uniform vec2 uTexel; uniform float uRadius; varying vec2 vUv;
    vec3 s(vec2 o) { return texture2D(tMap, vUv + o * uTexel).rgb; }
    void main() {
      vec3 c = s(vec2(0.0)) * 0.25;
      c += (s(vec2(-1.0, 0.0)) + s(vec2(1.0, 0.0)) + s(vec2(0.0, -1.0)) + s(vec2(0.0, 1.0))) * 0.125;
      c += (s(vec2(-1.0, -1.0)) + s(vec2(1.0, -1.0)) + s(vec2(-1.0, 1.0)) + s(vec2(1.0, 1.0))) * 0.0625;
      gl_FragColor = vec4(mix(texture2D(tSupport, vUv).rgb, c, uRadius), 1.0);
    }`;
  const FINAL_FRAG = `
    uniform sampler2D tScene, tBloom; uniform float uIntensity, uOffset, uDark; varying vec2 vUv; ${LIN}
    void main() {
      vec4 base = texture2D(tScene, vUv);
      vec3 bloom = texture2D(tBloom, vUv).rgb * uIntensity;
      vec3 c = toScr(toLin(base.rgb) + bloom);
      vec2 v = (vUv - 0.5) * vec2(uOffset);
      c = min(c, mix(c, vec3(1.0 - uDark), dot(v, v)));
      gl_FragColor = vec4(c, clamp(max(base.a, dot(bloom, vec3(0.2126, 0.7152, 0.0722))), 0.0, 1.0));
    }`;

  function build(el, { options, reduce, hover }) {
    const look = PRESET[options.look] ? options.look : "wire";
    const P = PRESET[look];
    const turns = +(options.turns ?? 0.35);
    const yawAmp = +(options.yaw ?? 0.13);
    const liftAmp = +(options.lift ?? 26);
    const damping = +(options.damping ?? 0.02);
    const revealDur = +(options.reveal ?? 0.55);
    const stagger = +(options.stagger ?? 0.16);
    const drop = +(options.drop ?? 900);
    const tiltZ = +(options.tilt ?? -0.36);
    // In the original post-processing, only the wire scene turns bloom off (post.bloom false) — 0 means off
    const bloomAmt = +(options.bloom ?? (look === "wire" ? 0 : 0.85));
    const waterAmt = +(options.water ?? (look === "aurora" ? 0.43 : 0));

    // Even if a skin value is oklch, color-mix or a relative color, it stays readable — resolved into text color and the rgb painted on a 1px canvas is taken
    const pad = document.createElement("canvas");
    pad.width = pad.height = 1;
    const pg = pad.getContext("2d", { willReadFrequently: true });
    const css = (name, grey) => {
      const c = new THREE.Color(grey, grey, grey);
      if (!getComputedStyle(el).getPropertyValue(name).trim()) return c;
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
      el.append(probe);
      const v = getComputedStyle(probe).color;
      probe.remove();
      pg.clearRect(0, 0, 1, 1);
      pg.fillStyle = v;
      pg.fillRect(0, 0, 1, 1);
      const [r, g, b] = pg.getImageData(0, 0, 1, 1).data;
      return c.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    };
    const accent = css(look === "wire" ? "--kf-accent-text" : "--kf-accent", 0.7);
    const ink = css("--kf-ink", 0);
    const bg = css("--kf-bg", 1);
    const stageBg = css("--kf-contrast-bg", 0);
    const stageInk = css("--kf-contrast-ink", 1);
    const gridColor = ink.clone().lerp(bg, 0.48);
    const domeColor = ink.clone().lerp(bg, 0.78);
    const deep = accent.clone().lerp(stageBg, 0.78);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(P.fov, 1, 5, 24000);
    const disposables = [];
    const keep = (x) => (disposables.push(x), x);
    const uniforms = { uTime: { value: 0 }, uReveal: { value: 0 }, uPulse: { value: -1 } };

    // Pillar — the slash of the logo. A long box with 8 vertical segments, stood up and tilted to the right
    const slash = new THREE.Group();
    let sparks = null;
    const boxGeo = keep(new THREE.BoxGeometry(14, 150, 14, 1, 8, 1));
    if (look === "wire") {
      slash.add(new THREE.LineSegments(keep(new THREE.WireframeGeometry(boxGeo)), keep(new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 1 }))));
      slash.add(new THREE.Mesh(boxGeo, keep(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.08, depthWrite: false }))));
    } else {
      // Original glass: black glass (opacity .65) with mint glow .1, so it is dark inside and only the edges glow
      const glass = keep(new THREE.MeshBasicMaterial({ color: accent.clone().multiplyScalar(0.1).lerp(stageBg, 0.2), transparent: true, opacity: 0.65, depthWrite: false }));
      slash.add(new THREE.Mesh(boxGeo, glass));
      slash.add(new THREE.LineSegments(keep(new THREE.EdgesGeometry(boxGeo)), keep(new THREE.LineBasicMaterial({ color: accent }))));
      const glowGeo = keep(new THREE.BoxGeometry(20, 156, 20));
      slash.add(new THREE.Mesh(glowGeo, keep(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }))));
      // Sparkles inside the pillar (original slashParticles 240 · 4s lifetime) — they slowly rise inside the glass and twinkle
      const sp = [], ss = [];
      for (let i = 0; i < 240; i++) { sp.push((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 148, (Math.random() - 0.5) * 12); ss.push(Math.random()); }
      const sg = keep(new THREE.BufferGeometry());
      sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
      sg.setAttribute("aSeed", new THREE.Float32BufferAttribute(ss, 1));
      sparks = new THREE.Points(sg, keep(new THREE.ShaderMaterial({
        vertexShader: SPARK_VERT, fragmentShader: SPARK_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { ...uniforms, uColor: { value: accent } },
      })));
      slash.add(sparks);
    }
    slash.rotation.z = tiltZ;
    // The original pillar stands 345~370px at screen height 900 — panel size (150) is reduced per type and the center height is matched
    const SLASH = { wire: { s: 0.57, y: 95 }, points: { s: 0.5, y: 104 }, aurora: { s: 0.55, y: 99 } }[look];
    slash.scale.setScalar(SLASH.s);
    slash.position.set(0, SLASH.y, 0);
    scene.add(slash);

    let ground = null, sky = null, terrain = null, dome = null, water = null, reflectRT = null;
    // Water level — nearby low ground (-20…-6) is submerged and only distant mountain ranges rise above the water
    const WATER_Y = -4;
    const clipY = { value: -1e5 };
    const mirror = new THREE.PerspectiveCamera(P.fov, 1, 5, 24000);
    const aim = new THREE.Vector3();
    if (look === "wire") {
      // Warped grid floor — density 48, the center ring (radius 35, width 150) sinks 84 deep, ripple spreading at 290/s for 1.3s
      const N = 48, half = 900, seg = 72, pos = [];
      for (let i = 0; i <= N; i++) {
        const c = -half + (2 * half * i) / N;
        for (let j = 0; j < seg; j++) {
          const a = -half + (2 * half * j) / seg, b = -half + (2 * half * (j + 1)) / seg;
          pos.push(c, 0, a, c, 0, b, a, 0, c, b, 0, c);
        }
      }
      const g = keep(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      const m = keep(new THREE.ShaderMaterial({
        vertexShader: GRID_VERT, fragmentShader: GRID_FRAG, transparent: true, depthWrite: false,
        uniforms: { ...uniforms, uRing: { value: 35 }, uRingW: { value: 150 }, uRingH: { value: -84 }, uFar: { value: half }, uColor: { value: gridColor }, uStrength: { value: 0.73 } },
      }));
      ground = new THREE.LineSegments(g, m);
      ground.frustumCulled = false;
      scene.add(ground);
      // Sky mesh — the original dome (radius 12900, detail 5) as a sparse mesh on a nearby large sphere
      dome = new THREE.LineSegments(keep(new THREE.WireframeGeometry(keep(new THREE.IcosahedronGeometry(1400, 2)))), keep(new THREE.LineBasicMaterial({ color: domeColor, transparent: true, opacity: 0, depthWrite: false })));
      dome.position.y = -200;
      scene.add(dome);
    } else if (look === "points") {
      const n = 200, half = 900, pos = [], seed = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        pos.push(-half + (2 * half * i) / n + (Math.random() - 0.5) * 6, 0, -half + (2 * half * j) / n + (Math.random() - 0.5) * 6);
        seed.push(Math.random());
      }
      const g = keep(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
      const m = keep(new THREE.ShaderMaterial({
        vertexShader: POINT_VERT, fragmentShader: POINT_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { ...uniforms, uSize: { value: 2.4 }, uFar: { value: half }, uColor: { value: accent }, uDeep: { value: deep } },
      }));
      ground = new THREE.Points(g, m);
      ground.frustumCulled = false;
      scene.add(ground);
      // Back vertical dotted lines: rain-like pillars behind the original points scene
      const cols = [], cs = [];
      for (let k = 0; k < 140; k++) {
        const x = (Math.random() - 0.5) * 1600, z = -300 - Math.random() * 700, len = 40 + Math.random() * 260;
        for (let s = 0; s < len; s += 6) { cols.push(x, s - 20, z); cs.push(Math.random()); }
      }
      const cg = keep(new THREE.BufferGeometry());
      cg.setAttribute("position", new THREE.Float32BufferAttribute(cols, 3));
      cg.setAttribute("aSeed", new THREE.Float32BufferAttribute(cs, 1));
      const colsMat = keep(new THREE.PointsMaterial({ color: accent.clone().lerp(stageBg, 0.55), size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
      dome = new THREE.Points(cg, colsMat);
      scene.add(dome);
    } else {
      sky = new THREE.Mesh(keep(new THREE.PlaneGeometry(9000, 3200)), keep(new THREE.ShaderMaterial({
        vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, depthWrite: false,
        uniforms: { ...uniforms, uColor: { value: accent }, uDeep: { value: deep }, uBase: { value: stageBg } },
      })));
      sky.position.set(0, 900, -2600);
      scene.add(sky);
      terrain = new THREE.Mesh(keep(new THREE.PlaneGeometry(4000, 4000, 220, 220).rotateX(-Math.PI / 2)), keep(new THREE.ShaderMaterial({
        vertexShader: TERRAIN_VERT, fragmentShader: TERRAIN_FRAG,
        uniforms: { ...uniforms, uColor: { value: accent }, uBase: { value: stageBg }, uDeep: { value: deep }, uClip: clipY,
          uRock: { value: stageInk.clone().lerp(stageBg, 0.62).lerp(accent, 0.12) }, uFog: { value: accent.clone().lerp(stageBg, 0.8).lerp(stageInk, 0.06) } },
      })));
      terrain.position.z = -600;
      scene.add(terrain);
      if (waterAmt > 0) {
        reflectRT = keep(new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
        water = new THREE.Mesh(keep(new THREE.PlaneGeometry(5200, 5200).rotateX(-Math.PI / 2)), keep(new THREE.ShaderMaterial({
          vertexShader: WATER_VERT, fragmentShader: WATER_FRAG, transparent: true, depthWrite: false,
          uniforms: { ...uniforms, uReflect: { value: reflectRT.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uStrength: { value: waterAmt }, uDeep: { value: deep }, uShallow: { value: accent } },
        })));
        water.position.set(0, WATER_Y, -600);
        scene.add(water);
      }
      const n = 260, pos = [];
      for (let i = 0; i < n; i++) pos.push((Math.random() - 0.5) * 900, 10 + Math.random() * 260, (Math.random() - 0.5) * 600);
      const pg = keep(new THREE.BufferGeometry());
      pg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      dome = new THREE.Points(pg, keep(new THREE.PointsMaterial({ color: stageInk.clone().lerp(accent, 0.6), size: 1.8, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false })));
      scene.add(dome);
    }

    // Ratio of passing through a section — 0 when the panel touches the screen bottom, 1 when it leaves the top
    const progress = () => {
      const r = el.getBoundingClientRect();
      const span = innerHeight + r.height;
      return span > 0 ? Math.min(1, Math.max(0, (innerHeight - r.top) / span)) : 0.5;
    };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => { pointer.tx = (e.clientX / innerWidth - 0.5) * 2; pointer.ty = (e.clientY / innerHeight - 0.5) * 2; };
    if (hover) addEventListener("pointermove", onMove, { passive: true });

    const place = (dt) => {
      const k = 1 - Math.pow(1 - damping, dt * 60);
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;
      const mobile = el.clientWidth < 768;
      const dist = P.distance * (mobile ? 1.6 : 1);
      const theta = (progress() - 0.5) * turns * Math.PI + pointer.x * yawAmp;
      camera.position.set(Math.sin(theta) * dist, P.height - pointer.y * liftAmp * 0.5, Math.cos(theta) * dist);
      aim.set(0, P.aim - pointer.y * liftAmp * 0.25, 0);
      camera.lookAt(aim);
    };

    // Post-processing — draw the scene to a half-precision buffer, filter out only the bright areas, spread them by going down and up through mips, and add them back
    let post = null;
    if (bloomAmt > 0) {
      // The default material writes linear values to the plate while our shader uses screen values — convert the default material color to screen values so the two match,
      //   like the original neon (glow .8 + mint light 4), the pillars are painted past 1 to cross the threshold
      scene.traverse((o) => {
        if (!o.material || o.material.isShaderMaterial || !o.material.color) return;
        o.material.color.convertLinearToSRGB();
        if (slash.children.includes(o) && o.material.blending !== THREE.AdditiveBlending) o.material.color.multiplyScalar(1.8);
      });
      const quad = new THREE.Mesh(keep(new THREE.PlaneGeometry(2, 2)));
      quad.frustumCulled = false;
      const pScene = new THREE.Scene();
      pScene.add(quad);
      const pCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const mat = (frag, u) => keep(new THREE.ShaderMaterial({ vertexShader: POST_VERT, fragmentShader: frag, uniforms: u, depthTest: false, depthWrite: false }));
      const rt = (o) => keep(new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false, ...o }));
      const sceneRT = rt({ depthBuffer: true, samples: 4 });
      const down = Array.from({ length: 6 }, () => rt()), up = Array.from({ length: 5 }, () => rt());
      const bright = mat(BRIGHT_FRAG, { tMap: { value: null }, uThreshold: { value: 0.82 }, uSmooth: { value: 0.25 } });
      const downM = mat(DOWN_FRAG, { tMap: { value: null }, uTexel: { value: new THREE.Vector2() } });
      const upM = mat(UP_FRAG, { tMap: { value: null }, tSupport: { value: null }, uTexel: { value: new THREE.Vector2() }, uRadius: { value: 0.7 } });
      const finalM = mat(FINAL_FRAG, { tScene: { value: sceneRT.texture }, tBloom: { value: null }, uIntensity: { value: bloomAmt }, uOffset: { value: 0.4 }, uDark: { value: 0.5 } });
      const pass = (m, target) => { quad.material = m; renderer.setRenderTarget(target); renderer.render(pScene, pCam); };
      let levels = 6;
      post = {
        size(w, h, mobile) {
          sceneRT.setSize(w, h);
          levels = mobile ? 4 : 6;
          let lw = w, lh = h;
          down.forEach((d, i) => { lw = Math.max(1, Math.round(lw / 2)); lh = Math.max(1, Math.round(lh / 2)); d.setSize(lw, lh); if (i < up.length) up[i].setSize(lw, lh); });
        },
        render() {
          renderer.setRenderTarget(sceneRT);
          renderer.clear();
          renderer.render(scene, camera);
          bright.uniforms.tMap.value = sceneRT.texture;
          pass(bright, down[0]);
          for (let i = 1; i < levels; i++) {
            downM.uniforms.tMap.value = down[i - 1].texture;
            downM.uniforms.uTexel.value.set(1 / down[i - 1].width, 1 / down[i - 1].height);
            pass(downM, down[i]);
          }
          let src = down[levels - 1];
          for (let i = levels - 2; i >= 0; i--) {
            upM.uniforms.tMap.value = src.texture;
            upM.uniforms.tSupport.value = down[i].texture;
            upM.uniforms.uTexel.value.set(1 / src.width, 1 / src.height);
            pass(upM, up[i]);
            src = up[i];
          }
          finalM.uniforms.tBloom.value = src.texture;
          pass(finalM, null);
        },
      };
    }

    // Water reflection — like the original reflectionInterval 2, drawn with a mirror camera once every two frames
    let frame = 0;
    const reflect = () => {
      if (!water || frame++ % 2) return;
      mirror.position.set(camera.position.x, 2 * WATER_Y - camera.position.y, camera.position.z);
      mirror.up.set(0, 1, 0);
      mirror.lookAt(aim.x, 2 * WATER_Y - aim.y, aim.z);
      water.visible = false;
      clipY.value = WATER_Y - 0.5;
      renderer.setRenderTarget(reflectRT);
      renderer.clear();
      renderer.render(scene, mirror);
      renderer.setRenderTarget(null);
      clipY.value = -1e5;
      water.visible = true;
    };
    const render = () => {
      reflect();
      if (post) post.render();
      else renderer.render(scene, camera);
    };

    const size = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mirror.fov = camera.fov;
      mirror.aspect = camera.aspect;
      mirror.updateProjectionMatrix();
      const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
      if (water) {
        reflectRT.setSize(Math.max(1, buf.x >> 1), Math.max(1, buf.y >> 1));
        water.material.uniforms.uRes.value.copy(buf);
      }
      post?.size(buf.x, buf.y, w < 768);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    // On first view, floor → pillars (dropping from 900 above, after .16s) stand in order over .55s
    const easeOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    let shownAt = -1, t = 0, last = 0, raf = 0, visible = false;
    const setReveal = (time) => {
      const a = shownAt < 0 ? 0 : easeOut(Math.min(1, (time - shownAt) / revealDur));
      const b = shownAt < 0 ? 0 : easeOut(Math.min(1, Math.max(0, (time - shownAt - stagger) / revealDur)));
      uniforms.uReveal.value = a;
      slash.position.y = SLASH.y + (1 - b) * drop;
      if (dome) dome.material.opacity = (look === "wire" ? 0.55 : look === "points" ? 0.5 : 0.7) * a;
      if (look === "wire") uniforms.uPulse.value = shownAt < 0 ? -1 : (time - shownAt - stagger - revealDur * 0.5) % 6;
    };
    const draw = (now) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(draw);
      if (!last) last = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (document.hidden) return;
      t += dt;
      uniforms.uTime.value = t;
      setReveal(t);
      slash.rotation.y += dt * 0.05;
      place(dt);
      render();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && shownAt < 0) shownAt = t;
      if (visible && !raf && !reduce) { last = 0; raf = requestAnimationFrame(draw); }
    }, { rootMargin: "200px 0px" });
    if (reduce) {
      shownAt = -10; setReveal(10); place(1); render();
      const again = () => { size(); setReveal(10); place(1); render(); };
      addEventListener("resize", again);
      disposables.push({ dispose: () => removeEventListener("resize", again) });
    } else io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      canvas.remove();
    };
  }
})();
