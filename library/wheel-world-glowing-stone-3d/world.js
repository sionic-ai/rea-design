// 3D stage shared by three pages: wasteland (uneven ground, dead trees, fog), sunset sky (stars at night), a glowing stone in the center and its shadow reflected in water.
// Each project wears a different stone pattern (grain·band·density) and scene (fog·water·relief·night) — values are in GC.PROJECTS.
// The loader shows the same screen painted only in the window area with a material for each render stage (wireframe·clay·UV·normal·transmission·final).
(() => {
  const T = THREE;

  // Noise is not the original shader but a newly written common value noise + fbm
  const NOISE = `
    float h3(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
      return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
    float fbm(vec3 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * n3(p); p = p * 2.03 + 11.7; a *= .5; } return s; }
  `;

  const STONE_VS = `
    uniform float uTime; varying vec3 vObj; varying vec3 vN; varying vec3 vView; varying vec3 vW;
    ${NOISE}
    void main(){
      vec3 p = position;
      // Turn the ball into a monument-like round pillar: flat top and bottom, broad shoulders (superellipse exponent 3.2)
      float ay = abs(p.y);
      float rs = sqrt(max(1. - ay * ay, 1e-4));
      float rn = pow(max(1. - pow(ay, 3.2), 0.), 1. / 3.2);
      p.xz *= rn / rs * (1. + .06 * p.y * -1.);
      // Make a smooth shape lumpy with low frequency
      float d = fbm(p * 1.3 + 3.1) - .5;
      p += normal * d * .18;
      vObj = p;
      #ifdef MIRROR
      // A stone reflected in water ripples horizontally with the waves — water surface (p.y=Larger the farther from −1)
      float far = clamp((p.y + 1.) * .5, 0., 1.);
      p.x += (sin(p.y * 13. + uTime * 1.7) * .6 + sin(p.y * 31. - uTime * 2.3) * .4) * .035 * far;
      #endif
      vW = (modelMatrix * vec4(p, 1.)).xyz;
      #ifdef MIRROR
      vW.y = -vW.y;
      #endif
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      vN = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`;
  const STONE_FS = `
    uniform vec3 uColor; uniform float uVeins, uVeinScale, uBands, uBandScale, uDensity, uTime, uDim;
    uniform sampler2D uScene; uniform vec2 uRes;
    uniform vec3 uLight, uLightRest, uRay, uCrack, uGoboC; uniform vec2 uGoboSize; uniform float uLampDim, uCrackAmp, uGobo; uniform vec4 uHeat[12];
    varying vec3 vObj; varying vec3 vN; varying vec3 vView; varying vec3 vW;
    ${NOISE}
    // Share lit by the lantern behind the stone — soft light, narrow across and tall down
    float lampK(vec3 L){ vec2 d = vW.xy - L.xy; return exp(-(d.x * d.x / 1.6 + d.y * d.y / 4.5)); }
    // Subtract the depth difference between the cursor spot (on the panel at the stone’s center) and the surface, using only the distance perpendicular to the gaze — measured as seen on screen even if the stone is thick
    vec3 across(vec3 c){ vec3 d = vW - c; return d - dot(d, uRay) * uRay; }
    vec3 h33(vec3 p){ p = fract(p * vec3(.1031, .103, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
    // Fragment mesh stuck to stone: distance to the fragment edge (F2−F1) and a per-fragment value
    vec2 shards(vec3 x){
      vec3 i = floor(x), f = fract(x); float d1 = 8., d2 = 8., id = 0.;
      for (int a = -1; a <= 1; a++) for (int b = -1; b <= 1; b++) for (int c = -1; c <= 1; c++) {
        vec3 g = vec3(float(a), float(b), float(c)); vec3 r = g + h33(i + g) - f; float d = dot(r, r);
        if (d < d1) { d2 = d1; d1 = d; id = dot(i + g, vec3(1., 57., 113.)); } else if (d < d2) d2 = d;
      }
      return vec2(sqrt(d2) - sqrt(d1), fract(sin(id) * 43758.5453));
    }
    void main(){
      vec3 p = vObj;
      float fres = pow(1. - max(dot(normalize(vN), vView), 0.), 1.6);
      // Horizontal band: light and dark layers undulating with height
      float band = sin(p.y * 5.5 * uBandScale + fbm(p * 1.8) * 3.2) * .5 + .5;
      // Grain: thin dark lines only near fbm contours
      float v = fbm(p * 2.6 * uVeinScale + 7.);
      float vein = 1. - smoothstep(.0, .06, abs(v - .5));
      float cloud = fbm(vec3(p.x * 1.1, p.y * 2.6, p.z * 1.1) * uDensity + vec3(0., uTime * .02, 0.));
      vec3 light = mix(vec3(1., .9, .8), uColor, .3);
      vec3 deep = mix(uColor, vec3(1., .85, .8), .3) * .62 + vec3(.05, .02, .02);
      vec3 col = mix(deep, light, smoothstep(.3, .8, cloud * .8 + band * .55 * min(uBands + .3, 1.6)));
      col = mix(col, deep * .85, vein * .22 * min(uVeins, 1.6));
      // Glows from within: bright at center, dark at edges
      float glow = pow(1. - fres, 2.2);
      col *= .55 + .62 * glow;
      col += light * pow(glow, 6.) * .14 * smoothstep(-.4, .5, -abs(p.y + .1) + .5);
      // One crack — the original’s fracture mark
      float crack = smoothstep(.007, .0, abs(p.y + .25 - .22 * p.x + .1 * abs(fract(p.x * 4.) - .5))) * step(-.55, p.x) * step(p.x, .12) * step(0., p.z);
      col = mix(col, deep * .35, crack * .85);
      // A lantern moves behind the stones following the cursor — brightness at the rest position (center) is 1, and only the amount brighter or darker than that changes. When the cursor is over a stone, the lantern is halved.
      col *= (.7 + .55 * lampK(uLight) * (1. - uLampDim)) / (.7 + .55 * lampK(uLightRest));
      vec3 beam = mix(vec3(1., .93, .82), uColor, .25);
      // Only around the cursor, cracks split into fragments — radius is crack strength × .56 + .04, sharper toward the center.
      // Passed spots keep a crack as strong as they were warmed (Gaussian σ .34) and then cool off
      float heat = 0.;
      for (int i = 0; i < 12; i++) { vec3 hd = across(uHeat[i].xyz); heat = max(heat, uHeat[i].w * exp(-dot(hd, hd) / .23)); }
      if (uCrackAmp > .002 || heat > .05) {
        float R = uCrackAmp * .56 + .04;
        float ls = length(across(uCrack)) + (fbm(vObj * 4.3) - .5) * .25;
        float vis = (1. - smoothstep(R - .24, R, ls)) * (pow(1. - clamp(ls / (R + .001), 0., 1.), 1.5) * .85 + .15) * smoothstep(.015, .3, uCrackAmp);
        vis = max(vis, smoothstep(.1, .85, heat) * .8);
        vec2 sh = shards(vObj * vec3(1.24, 2.2, .95) * .8);
        col *= 1. + (sh.y - .5) * .5 * vis;
        col += beam * (1. - smoothstep(0., .12, sh.x)) * vis * .35;
        col = mix(col, deep * .3, (1. - smoothstep(.01, .035, sh.x)) * vis);
      }
      // Spotlight in the stone: glides after the cursor, flattening when moving horizontally and stretching long when moving vertically
      vec2 gd = across(uGoboC).xy / (uGoboSize * .5 + .3);
      col += beam * exp(-dot(gd, gd) * 1.4) * uGobo;
      #ifndef MIRROR
      // Transmission: the scene behind the stone (half-res render without the stone) is read warped toward the normal more at the edges and tinted with the stone color — sky and ground refract through the thin edges
      vec2 suv = gl_FragCoord.xy / uRes + normalize(vN).xy * (.035 + .07 * fres);
      vec3 behind = texture2D(uScene, clamp(suv, .001, .999)).rgb;
      col = mix(col, behind * (uColor * .7 + .45) * 1.25, smoothstep(.15, .95, fres) * .55);
      #endif
      #ifdef MIRROR
      // Ripples break the reflected light into horizontal stripes
      col *= .82 + .18 * smoothstep(-.2, .9, sin(vObj.y * 46. + uTime * 2.6 + sin(vObj.x * 9.) * 1.5));
      gl_FragColor = vec4(col * uDim, 1.);
      #else
      // Alpha 0 = Stone spot — the screen fluid steers around the stone on the first page
      gl_FragColor = vec4(col * uDim, 0.);
      #endif
    }`;

  const GROUND_VS = `
    uniform float uRelief, uWater; varying vec3 vW; varying float vH;
    ${NOISE}
    void main(){
      vec3 p = position;
      float r = length(p.xz);
      float hill = fbm(vec3(p.x * .045, 0., p.z * .045)) * 7. * uRelief * smoothstep(6., 30., r);
      float dune = (fbm(vec3(p.x * .18, 1., p.z * .18)) - .5) * .5 * smoothstep(3., 9., r);
      p.y += hill + dune - .02;
      vH = hill;
      vec4 w = modelMatrix * vec4(p, 1.);
      vW = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  const GROUND_FS = `
    uniform vec3 uColor, uHorizon, uPointerGround; uniform float uMist, uWater, uNight, uPool; varying vec3 vW; varying float vH;
    ${NOISE}
    void main(){
      float dist = length(vW.xz - cameraPosition.xz);
      vec3 soil = mix(vec3(.09, .05, .032), uColor * .14 + vec3(.06, .035, .022), .45);
      soil *= .65 + .6 * fbm(vW * .7);
      soil += uHorizon * .25 * smoothstep(0., 6., vH);
      soil *= 1. - uNight * .55;
      // The ground the cursor points at brightens warmly (Gaussian radius ≈1.6, weaker farther from the stone — strength is uPointerGround.y)
      vec2 pg = vW.xz - uPointerGround.xz;
      soil += vec3(.72, .58, .42) * exp(-.375 * dot(pg, pg)) * uPointerGround.y * .5;
      float fog = 1. - exp(-dist * .028 * (.6 + uMist));
      vec3 col = mix(soil, uHorizon * (1. - uNight * .6), clamp(fog, 0., 1.));
      // Puddle around the stone: transparent so reflections show through
      float pool = (1. - smoothstep(uPool * .6, uPool, length(vW.xz))) * clamp(uWater * 40. + .55, 0., 1.);
      gl_FragColor = vec4(col, 1. - pool * .78);
    }`;

  const SKY_VS = `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
  const SKY_FS = `
    uniform vec3 uHorizon, uTop; uniform float uNight; varying vec3 vD;
    ${NOISE}
    void main(){
      float y = vD.y;
      vec3 col = mix(uHorizon, uTop, smoothstep(-.02, .45, y));
      col += uHorizon * .5 * pow(max(0., 1. - abs(y) * 6.), 3.) * (1. - uNight * .7);
      float star = step(.9975, h3(floor(vD * 420.))) * smoothstep(.05, .3, y) * uNight;
      col += star * .8;
      gl_FragColor = vec4(col, 1.);
    }`;

  // Screen fluid (frost): where the cursor has passed, drop paint drops (Gaussian radius² .0045, in screen height units), and each frame the drops fade by .96 and
  // Drifts on, slowing by .98 in the direction it was moving. Sum of drops (xy = Direction moved × strength, z = Shade) on a small board first, and
  // In compositing, that spot is warped by .012, blurred with a radius of density × .02, and brightened up to ×1.43 depending on density
  const SPLATS = 64;
  const QUAD_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
  const DYE_FS = `
    uniform vec4 uS[${SPLATS}]; uniform vec4 uV[${SPLATS}]; uniform int uN; uniform float uAspect; varying vec2 vUv;
    void main(){
      vec3 d = vec3(0.);
      for (int i = 0; i < ${SPLATS}; i++) {
        if (i >= uN) break;
        vec2 o = vec2((vUv.x - uS[i].x) * uAspect, vUv.y - uS[i].y);
        d += vec3(uV[i].xy, uS[i].z) * exp(-dot(o, o) / .0045);
      }
      gl_FragColor = vec4(d, 1.);
    }`;
  const FROST_FS = `
    uniform sampler2D uImg, uDye; uniform float uMask; varying vec2 vUv;
    void main(){
      vec3 d = texture2D(uDye, vUv).xyz;
      // The first page avoids the stone slot (alpha 0) — About and Detail extend up over the stone
      float ee = 1. - (1. - texture2D(uImg, vUv).a) * uMask;
      vec2 uv = vUv - d.xy * .012 * ee;
      float W = clamp(d.z, 0., 1.) * .02 * ee;
      vec3 c = vec3(0.);
      float a0 = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.2832;
      for (int i = 0; i < 8; i++) {
        float a = a0 + float(i) * 2.39996, r = sqrt((float(i) + .5) / 8.) * .5;
        c += texture2D(uImg, uv + vec2(cos(a), sin(a)) * r * W).rgb;
      }
      c /= 8.;
      float wt = clamp(d.z, 0., 2.5);
      gl_FragColor = vec4(c * (1. + wt / (wt + 1.) * ee * .6), 1.);
    }`;

  // Background and text color are read from the Skin (CSS color strings as three colors)
  const kf = (name) => new T.Color().setStyle(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "black");

  // Different render stage for each loader window
  const passMaterials = () => ({
    wireframe: new T.MeshBasicMaterial({ color: kf("--kf-ink"), wireframe: true, transparent: true, opacity: .55 }),
    clay: new T.ShaderMaterial({
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `varying vec3 vN; void main(){ float l = .25 + .75 * max(dot(vN, normalize(vec3(.4, .7, .6))), 0.); gl_FragColor = vec4(vec3(.72, .7, .68) * l, 1.); }`,
    }),
    uv: new T.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `varying vec2 vUv; void main(){ vec2 c = floor(vUv * vec2(16., 10.)); float k = mod(c.x + c.y, 2.); gl_FragColor = vec4(mix(vec3(.08), vec3(.95), k), 1.); }`,
    }),
    normals: new T.MeshNormalMaterial(),
    transmission: new T.ShaderMaterial({
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = 1. - max(dot(vN, vV), 0.); vec3 a = vec3(.55, .95, 1.), b = vec3(.85, .35, 1.), c = vec3(1., .95, .6); gl_FragColor = vec4(mix(mix(a, b, f), c, pow(f, 4.)), 1.); }`,
    }),
  });

  function deadTree(rng) {
    const g = new T.Group();
    // Not skin: dry-wood shadow color (#120a08) matched to the scene light — 3D content, same as the project scene tone.
    // The default material skips sRGB conversion when drawing to a render target, so it only darkens during fluid compositing, so paint with a shader that outputs values as they are, like the other materials.
    const mat = new T.ShaderMaterial({
      vertexShader: "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: "void main(){ gl_FragColor = vec4(.0706, .0392, .0314, 1.); }",
    });
    const h = 1.6 + rng() * 2.4;
    const trunk = new T.Mesh(new T.CylinderGeometry(.03, .09, h, 5), mat);
    trunk.position.y = h / 2;
    trunk.rotation.z = (rng() - .5) * .3;
    g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const l = .5 + rng() * 1.1;
      const b = new T.Mesh(new T.CylinderGeometry(.015, .04, l, 4), mat);
      b.position.set((rng() - .5) * .3, h * (.45 + rng() * .45), 0);
      b.rotation.z = (rng() < .5 ? -1 : 1) * (.5 + rng() * .7);
      b.translateY(l / 2);
      g.add(b);
    }
    return g;
  }

  function seeded(seed) {
    let s = seed;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  }

  // layout: home (stone in the center) · about (stone on the right, large) · detail (no stone, video panel in the screen center)
  function world({ canvas, layout = "home", project }) {
    const renderer = new T.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(kf("--kf-bg"), 1);
    renderer.autoClear = false;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, .1, 400);
    const P = GC.PROJECTS[project] || GC.PROJECTS[0];

    const u = {
      uColor: { value: new T.Color(...P.color) },
      uHorizon: { value: new T.Color() },
      uTop: { value: new T.Color() },
      uMist: { value: P.scene.mist },
      uWater: { value: P.scene.water },
      uRelief: { value: P.scene.relief },
      uNight: { value: P.scene.night || 0 },
      uPool: { value: layout === "about" ? 9 : 4.2 },
      uVeins: { value: P.matter.veins },
      uVeinScale: { value: P.matter.veinScale },
      uBands: { value: P.matter.bands },
      uBandScale: { value: P.matter.bandScale },
      uDensity: { value: P.matter.density },
      uTime: { value: 0 },
      uDim: { value: 1 },
      uScene: { value: null },
      uRes: { value: new T.Vector2(1, 1) },
      uLight: { value: new T.Vector3(0, 2.06, -2) },
      uLightRest: { value: new T.Vector3(0, 2.06, -2) },
      uRay: { value: new T.Vector3(0, 0, -1) },
      uCrack: { value: new T.Vector3(0, 2.17, 0) },
      uCrackAmp: { value: 0 },
      uGoboC: { value: new T.Vector3(0, 2.17, 0) },
      uGoboSize: { value: new T.Vector2(2.8, .44) },
      uGobo: { value: 0 },
      uLampDim: { value: 0 },
      uPointerGround: { value: new T.Vector3(0, 0, -2) },
      uHeat: { value: Array.from({ length: 12 }, () => new T.Vector4(0, -99, 0, 0)) },
    };
    const skyColors = () => {
      const c = u.uColor.value;
      const night = u.uNight.value;
      u.uHorizon.value.setRGB(.3 + c.r * .2, .16 + c.g * .16, .11 + c.b * .14).multiplyScalar(1 - night * .55);
      u.uTop.value.setRGB(.05 + c.r * .03, .025 + c.g * .02, .02 + c.b * .04).multiplyScalar(1 - night * .5);
    };
    skyColors();

    const sky = new T.Mesh(new T.SphereGeometry(300, 32, 16), new T.ShaderMaterial({ uniforms: u, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: T.BackSide, depthWrite: false }));
    scene.add(sky);
    const ground = new T.Mesh(new T.PlaneGeometry(260, 260, 220, 220).rotateX(-Math.PI / 2), new T.ShaderMaterial({ uniforms: u, vertexShader: GROUND_VS, fragmentShader: GROUND_FS, transparent: true }));
    ground.renderOrder = 2;
    scene.add(ground);
    const rng = seeded(7);
    const trees = new T.Group();
    // In About, only wide water, no dead trees
    if (layout !== "about") scene.add(trees);
    for (let i = 0; i < 26; i++) {
      const t = deadTree(rng);
      const a = (rng() - .5) * 2.4;
      const r = 34 + rng() * 40;
      t.position.set(Math.sin(a) * r, 0, -Math.cos(a) * r);
      t.scale.setScalar(1.4 + rng() * 1.6);
      trees.add(t);
    }

    let stone = null;
    let mirror = null;
    let stoneGeo = null;
    const wireGeo = new T.IcosahedronGeometry(1, 3);
    if (layout !== "detail") {
      const geo = (stoneGeo = new T.SphereGeometry(1, 128, 96));
      const mat = new T.ShaderMaterial({ uniforms: u, vertexShader: STONE_VS, fragmentShader: STONE_FS });
      stone = new T.Mesh(geo, mat);
      stone.scale.set(1.24, 2.2, .95);
      stone.position.set(0, 2.17, 0);
      scene.add(stone);
      // Stone reflected in water: a flipped copy sits below the ground, and the ground’s puddle spot is opened semi-transparent so it reflects
      const mu = { ...u, uDim: { value: .62 } };
      mirror = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: mu, vertexShader: STONE_VS, fragmentShader: STONE_FS, side: T.BackSide, defines: { MIRROR: "" } }));
      mirror.scale.set(1.24, -2.2, .95);
      mirror.position.set(0, -2.17, 0);
      mirror.renderOrder = 1;
      scene.add(mirror);
    }

    const look = new T.Vector3();
    const POSES = { home: [0, 1.0, 8.6, 0, 2.05, 0], about: [-2.3, .9, 10.5, -2.3, 2.3, 0], detail: [0, 1.25, 9, 0, 1.6, 0] };
    const base = [...POSES[layout]];

    // ── Cursor reaction — original values in copy coordinates (original stone half-width .63·half-height 1.1 → copy 1.24·2.2, length ×2) ──
    // The original does not move the camera or stones with the cursor at rest. The cursor moves the lantern behind the stone, the gold and spotlight on the stone, the ground light, and the screen fluid,
    // Only in detail (after the stone opens) the camera turns ±.11 rad toward the cursor. On touch screens only the lantern follows, and with reduced motion everything is off
    const coarse = matchMedia("(pointer: coarse)").matches;
    const live = !GC.reduced;
    const cur = { x: innerWidth / 2, y: innerHeight / 2, dirty: false };
    const onPointer = (e) => {
      if (e.pointerType === "touch" && !e.isPrimary) return;
      cur.x = e.clientX; cur.y = e.clientY; cur.dirty = true;
    };
    addEventListener("pointermove", onPointer);
    addEventListener("pointerdown", onPointer);
    const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
    const ray = new T.Raycaster(), ndc = new T.Vector2(), hit = new T.Vector3();
    const midPlane = new T.Plane(new T.Vector3(0, 0, 1), 0), groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
    const LIGHT = { x: 1.16, y: 2.06, ry: 2.04, z: -2 };
    // The original spotlight is added to the HDR scene and then tone mapped — the copy is LDR, so adding the same amount blows out to white, so scale it down to the ratio matched to the recording
    const GOBO = .55;
    const fx = {
      at: new T.Vector3(0, 2.17, 0), hover: false, target: u.uLightRest.value.clone(), prev: new T.Vector3(),
      amp: 0, energy: 0, level: 0, glide: new T.Vector2(0, 2.17),
      size: new T.Vector2(2.8, .44), vel: new T.Vector2(), last: null, heat: [], ground: new T.Vector3(0, 0, -2), openX: 0, orbit: 0, roll: 0,
    };
    // Only when the cursor moves: where the line shot from the camera to the cursor meets the stone’s center panel and the ground
    const aim = () => {
      ndc.set((cur.x / innerWidth) * 2 - 1, 1 - (cur.y / innerHeight) * 2);
      ray.setFromCamera(ndc, camera);
      u.uRay.value.copy(ray.ray.direction);
      if (ray.ray.intersectPlane(midPlane, hit)) {
        fx.at.copy(hit);
        fx.hover = layout === "home" && !coarse && Math.hypot(hit.x / 1.26, (hit.y - 2.17) / 2.2) < 1;
        // Lantern target: confines the spot on the panel to an ellipse 1.16 wide · 2.04 tall (original lightRangeX .58 · lightRangeY 1.02)
        let lx = hit.x / LIGHT.x, ly = (hit.y - LIGHT.y) / LIGHT.ry;
        const k = Math.hypot(lx, ly);
        if (k > 1) (lx /= k), (ly /= k);
        if (layout !== "about") fx.target.set(lx * LIGHT.x, LIGHT.y + ly * LIGHT.ry, LIGHT.z);
      }
      // Ground light is fully on in front of the stone and goes off beyond 7 behind it (original 1 − (−z − 3.5) × .22, length ×2)
      if (!coarse && ray.ray.intersectPlane(groundPlane, hit)) fx.ground.set(hit.x, Math.min(Math.max(1 - (-hit.z / 2 - 3.5) * .22, 0), 1), hit.z);
      else fx.ground.y = 0;
    };
    const react = (dt) => {
      if (!live) return;
      camera.updateMatrixWorld();
      if (cur.dirty) aim(), (cur.dirty = false);
      const L = u.uLight.value;
      fx.prev.copy(L);
      L.set(damp(L.x, fx.target.x, 9.5, dt), damp(L.y, fx.target.y, 9.5, dt), fx.target.z);
      // The lantern’s moving speed (×70·×2.2 in original units, cap .6) grows the cracks
      const motion = Math.min(L.distanceTo(fx.prev) / 2 * 70 + L.distanceTo(fx.target) / 2 * 2.2, 1) * .6;
      fx.energy = damp(fx.energy, Math.max(fx.energy * Math.exp(-2.2 * dt), motion), 8, dt);
      const on = fx.hover && !document.body.classList.contains("is-dragging");
      fx.amp = damp(fx.amp, on ? 1 : 0, on ? 8 : 2, dt);
      fx.level = damp(fx.level, on ? 1 : 0, on ? 9 : 3, dt);
      if (fx.level < .001) fx.level = 0;
      const C = u.uCrack.value;
      if (fx.amp < .01) C.copy(fx.at);
      else C.set(damp(C.x, fx.at.x, 9, dt), damp(C.y, fx.at.y, 9, dt), 0);
      u.uCrackAmp.value = fx.amp * (.25 + .75 * fx.energy);
      // Gold memory: under the cursor warms at rise 2.2 and cools at decay 1 — when the cursor moves more than .25 it warms the new spot (max 12 spots)
      let top = fx.heat[fx.heat.length - 1];
      if (on && (!top || top.p.distanceTo(fx.at) > .25)) {
        fx.heat.push((top = { p: fx.at.clone(), h: 0 }));
        if (fx.heat.length > 12) fx.heat.shift();
      }
      fx.heat.forEach((s, i) => {
        const warm = on && s === top;
        s.h = damp(s.h, warm ? 1 : 0, warm ? 2.2 : 1, dt);
        u.uHeat.value[i].set(s.p.x, s.p.y, s.p.z, s.h);
      });
      // Spotlight: blend .45 × intensity 2.4, lantern halved. Position follows with glide 5, and the size flattens (2.8×.44) ↔ elongates (.8×2.1) depending on the direction of movement
      u.uLampDim.value = .5 * fx.level;
      u.uGobo.value = .45 * fx.level * 2.4 * fx.level * GOBO;
      if (fx.level < .02) fx.glide.set(fx.at.x, fx.at.y);
      fx.glide.set(damp(fx.glide.x, fx.at.x, 5, dt), damp(fx.glide.y, fx.at.y, 5, dt));
      u.uGoboC.value.set(fx.glide.x, fx.glide.y, 0);
      if (fx.level > 0) {
        fx.last ??= { x: cur.x, y: cur.y };
        const h = Math.max(dt, .001) * innerHeight;
        fx.vel.set(damp(fx.vel.x, (cur.x - fx.last.x) / h, 10, dt), damp(fx.vel.y, (cur.y - fx.last.y) / h, 10, dt));
        fx.last = { x: cur.x, y: cur.y };
        const sp = fx.vel.length();
        if (sp > .04) {
          const tall = (fx.vel.y / sp) ** 2, st = 1 + .35 * T.MathUtils.smoothstep(sp, .1, 1.4);
          fx.size.set(damp(fx.size.x, T.MathUtils.lerp(2.8 * st, .8, tall), 7, dt), damp(fx.size.y, T.MathUtils.lerp(.44, 2.1 * st, tall), 7, dt));
        }
        u.uGoboSize.value.copy(fx.size);
      } else fx.last = null;
      const G = u.uPointerGround.value, kg = 1 - Math.exp(-11 * dt);
      G.lerp(fx.ground, kg);
      // Detail: after the stone opens, the camera turns toward the cursor’s horizontal position (damp 2.4, max ±.11 rad, tilt ×.7 ×.05)
      if (layout === "detail" && !coarse) {
        fx.openX = damp(fx.openX, Math.min(Math.max((cur.x / innerWidth) * 2 - 1, -1), 1), 2.4, dt);
        fx.orbit = fx.openX * .11;
        fx.roll = -fx.openX * .7 * .05;
      }
      fluid.step(dt);
    };

    // For transmission — renders the scene without the stone first at 1/4 resolution (it’s read warped by refraction so a soft image is fine, and it cuts the cost of drawing twice every frame)
    const behind = new T.WebGLRenderTarget(1, 1, { colorSpace: T.SRGBColorSpace });
    u.uScene.value = behind.texture;

    // Screen fluid — only while droplets remain, draw the scene to a panel and composite, and once all have faded, draw directly to the screen as before
    const fluid = (() => {
      const on = live && !coarse;
      const list = [];
      const beauty = new T.WebGLRenderTarget(1, 1, { colorSpace: T.SRGBColorSpace, samples: 4 });
      const dye = new T.WebGLRenderTarget(256, 160, { type: T.HalfFloatType, depthBuffer: false });
      const S = Array.from({ length: SPLATS }, () => new T.Vector4()), V = Array.from({ length: SPLATS }, () => new T.Vector4());
      const quad = new T.PlaneGeometry(2, 2), cam = new T.Camera();
      const dyeMat = new T.ShaderMaterial({ uniforms: { uS: { value: S }, uV: { value: V }, uN: { value: 0 }, uAspect: { value: 1 } }, vertexShader: QUAD_VS, fragmentShader: DYE_FS, depthTest: false, depthWrite: false });
      const frostMat = new T.ShaderMaterial({ uniforms: { uImg: { value: beauty.texture }, uDye: { value: dye.texture }, uMask: { value: layout === "home" ? 1 : 0 } }, vertexShader: QUAD_VS, fragmentShader: FROST_FS, depthTest: false, depthWrite: false });
      const dyeScene = new T.Scene().add(new T.Mesh(quad, dyeMat)), frostScene = new T.Scene().add(new T.Mesh(quad, frostMat));
      let px = null, py = null;
      return {
        beauty,
        get active() { return list.length > 0; },
        size(w, h) { beauty.setSize(w, h); dyeMat.uniforms.uAspect.value = innerWidth / innerHeight; },
        step(dt) {
          if (!on) return;
          const k = dt * 60, kd = Math.pow(.96, k), kv = Math.pow(.98, k);
          for (let i = list.length - 1; i >= 0; i--) {
            const s = list[i];
            s.z *= kd; s.dx *= kd; s.dy *= kd;
            s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= kv; s.vy *= kv;
            if (s.z < .01) list.splice(i, 1);
          }
          const x = cur.x / innerWidth, y = 1 - cur.y / innerHeight;
          if (px === null) (px = x), (py = y);
          const dx = x - px, dy = y - py;
          px = x; py = y;
          const step = Math.hypot(dx, dy);
          if (step / Math.max(dt, .001) <= 1e-4) return;
          // Original: intensity W = min(speed × .6, 1), density W × 4 × .5 every frame. Drops are pushed out at 1/4 of the cursor speed
          const w = Math.min((step / Math.max(dt, .001)) * .6, 1), add = w * 2 * k;
          const last = list[list.length - 1], aspect = innerWidth / innerHeight;
          if (last && Math.hypot((x - last.x) * aspect, y - last.y) < .02) {
            last.z = Math.min(last.z + add, 6); last.dx += (dx / step) * w * k; last.dy += (dy / step) * w * k;
          } else {
            list.push({ x, y, z: add, dx: (dx / step) * w * k, dy: (dy / step) * w * k, vx: (dx / Math.max(dt, .001)) * .25, vy: (dy / Math.max(dt, .001)) * .25 });
            if (list.length > SPLATS) list.shift();
          }
        },
        // Darkness at screen positions (px) — when blurring intro text lines with the same blob
        at(cx, cy) {
          const aspect = innerWidth / innerHeight, x = cx / innerWidth, y = 1 - cy / innerHeight;
          let z = 0;
          for (const s of list) z += s.z * Math.exp(-(((x - s.x) * aspect) ** 2 + (y - s.y) ** 2) / .0045);
          return z;
        },
        composite() {
          list.forEach((s, i) => { S[i].set(s.x, s.y, s.z, 0); V[i].set(s.dx, s.dy, 0, 0); });
          dyeMat.uniforms.uN.value = list.length;
          renderer.setRenderTarget(dye);
          renderer.render(dyeScene, cam);
          renderer.setRenderTarget(null);
          renderer.render(frostScene, cam);
        },
        // The first cursor move would compile the shader and freeze the screen — so when building the world, run the board draw and compositing once ahead of time
        warm() {
          if (!on) return;
          renderer.setRenderTarget(beauty);
          renderer.compile(scene, camera);
          renderer.render(scene, camera);
          renderer.setRenderTarget(dye);
          renderer.render(dyeScene, cam);
          renderer.setRenderTarget(null);
          renderer.compile(frostScene, cam);
        },
      };
    })();

    const resize = () => {
      const w = innerWidth;
      const h = innerHeight;
      renderer.setSize(w, h, false);
      const buf = renderer.getDrawingBufferSize(new T.Vector2());
      u.uRes.value.copy(buf);
      fluid.size(buf.x, buf.y);
      behind.setSize(Math.ceil(buf.x / 4), Math.ceil(buf.y / 4));
      camera.aspect = w / h;
      // On portrait screens widen the field of view to 45° so the stone fills about 3/4 of the screen width
      camera.fov = camera.aspect < .8 ? 35 + Math.min(10, ((.8 - camera.aspect) / .34) * 10) : 35;
      camera.updateProjectionMatrix();
    };
    addEventListener("resize", resize);
    resize();
    fluid.warm();

    const passes = passMaterials();
    let spin = 0, lastT = null;
    const api = {
      renderer, scene, camera, stone, uniforms: u,
      spin: (v) => (spin += v),
      // When switching projects, the stone pattern and scene values shift over 1s
      setProject(i, duration = 1) {
        const p = GC.PROJECTS[i];
        const c = new T.Color(...p.color);
        const to = { r: c.r, g: c.g, b: c.b, mist: p.scene.mist, water: p.scene.water, relief: p.scene.relief, night: p.scene.night || 0,
          veins: p.matter.veins, veinScale: p.matter.veinScale, bands: p.matter.bands, bandScale: p.matter.bandScale, density: p.matter.density };
        const from = { r: u.uColor.value.r, g: u.uColor.value.g, b: u.uColor.value.b, mist: u.uMist.value, water: u.uWater.value, relief: u.uRelief.value, night: u.uNight.value,
          veins: u.uVeins.value, veinScale: u.uVeinScale.value, bands: u.uBands.value, bandScale: u.uBandScale.value, density: u.uDensity.value };
        gsap.to(from, {
          ...to, duration, ease: "power2.inOut", overwrite: true,
          onUpdate() {
            u.uColor.value.setRGB(from.r, from.g, from.b);
            u.uMist.value = from.mist; u.uWater.value = from.water; u.uRelief.value = from.relief; u.uNight.value = from.night;
            u.uVeins.value = from.veins; u.uVeinScale.value = from.veinScale; u.uBands.value = from.bands; u.uBandScale.value = from.bandScale; u.uDensity.value = from.density;
            skyColors();
          },
        });
      },
      // Original does not change pages when going to About, it moves the camera in the same scene — the copy splits the move in two and joins them while the page changes
      travel(to, duration = 1.08, ease = "power2.inOut") {
        const pose = Array.isArray(to) ? to : POSES[to];
        return gsap.to(base, { ...Object.fromEntries(pose.map((v, i) => [i, v])), duration: GC.reduced ? .01 : duration, ease });
      },
      // Camera position f of the way between two spots — for splitting the movement in two and continuing it during a page transition
      between: (a, b, f) => POSES[a].map((v, i) => v + (POSES[b][i] - v) * f),
      place: (pose) => pose.forEach((v, i) => (base[i] = v)),
      // Where the stone is on screen (click hit-testing / outline position)
      stoneRect() {
        if (!stone) return null;
        const v = new T.Vector3();
        const pts = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([x, y]) => {
          v.set(stone.position.x + x * stone.scale.x, stone.position.y + y * stone.scale.y, 0).project(camera);
          return [(v.x * .5 + .5) * innerWidth, (-v.y * .5 + .5) * innerHeight];
        });
        return { top: pts[0][1], bottom: pts[1][1], right: pts[2][0], left: pts[3][0] };
      },
      // windows: [{ kind, x, y, w, h }] screen pixels — only that area is painted to that stage. If null, the whole finished scene
      render(windows = null) {
        if (stone && stone.visible) {
          stone.visible = mirror.visible = false;
          renderer.setRenderTarget(behind);
          renderer.clear();
          renderer.render(scene, camera);
          renderer.setRenderTarget(null);
          stone.visible = mirror.visible = true;
        }
        if (!windows && fluid.active) {
          renderer.setRenderTarget(fluid.beauty);
          renderer.clear();
          renderer.render(scene, camera);
          return void fluid.composite();
        }
        renderer.clear();
        if (!windows) return void renderer.render(scene, camera);
        renderer.setScissorTest(true);
        const H = innerHeight;
        for (const w of windows) {
          if (w.w < 1 || w.h < 1) continue;
          renderer.setScissor(w.x, H - w.y - w.h, w.w, w.h);
          if (w.kind === "beauty") {
            renderer.render(scene, camera);
          } else {
            const keep = [sky.visible, ground.visible, mirror?.visible];
            sky.visible = ground.visible = trees.visible = false;
            if (mirror) mirror.visible = false;
            renderer.clear();
            scene.overrideMaterial = passes[w.kind];
            // Wireframe as a coarse polyhedron — a smooth stone mesh is too dense and reads as a gray lump
            if (stone && w.kind === "wireframe") stone.geometry = wireGeo;
            renderer.render(scene, camera);
            if (stone) stone.geometry = stoneGeo;
            scene.overrideMaterial = null;
            [sky.visible, ground.visible] = keep;
            trees.visible = true;
            if (mirror) mirror.visible = keep[2];
          }
        }
        renderer.setScissorTest(false);
      },
      // Make the paper-scrap scene in the detail follow the same camera tilt
      get orbit() { return fx.orbit; },
      get roll() { return fx.roll; },
      frostAt: (x, y) => fluid.at(x, y),
      tick(t) {
        const dt = Math.min(Math.max(t - (lastT ?? t), 0), .1);
        lastT = t;
        u.uTime.value = t;
        const [cx, cy, cz, lx, ly, lz] = base;
        const portrait = camera.aspect < .8;
        const dz = portrait ? cz * 1.05 - lz : cz - lz, dx = cx - lx;
        const c = Math.cos(fx.orbit), s = Math.sin(fx.orbit);
        camera.position.set(lx + dx * c + dz * s, cy, lz - dx * s + dz * c);
        look.set(lx, ly, lz);
        camera.lookAt(look);
        camera.rotateZ(fx.roll);
        if (stone) {
          // On the phone About screen, like the original, the stone is moved off-screen leaving only text
          stone.visible = mirror.visible = !(portrait && layout === "about");
          // The original doesn’t spin the stone when idle (decorRotation 0 · spin only when advancing)
          stone.rotation.y = spin;
          mirror.rotation.y = stone.rotation.y;
        }
        react(dt);
      },
    };
    return api;
  }

  window.GC = window.GC || {};
  GC.world = world;
})();
