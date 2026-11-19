// Walking island — behind a water-drop door (iris), procedurally builds a low-poly island floating in the night sky, and lets the character walk with keys or a joystick.
// The original is built with a glb model · physics engine · node post-processing. Here the same composition · camera · values are produced with basic shapes.
(() => {
  const T = THREE;
  const { touch, keys, joy, sound, toast } = MF;
  const paint = MF.color;
  const state = { reduce: MF.reduce };
  const skipGate = new URLSearchParams(location.search).has("enter");

  // ───── Original Values
  const CAM = { fov: 40, near: 0.5, far: 200, pitch: -Math.PI / 8, start: [-3.5, 17.4, 29.6], end: { x: 0, y: 4, z: touch ? 7.5 : 5.5 }, intro: 5, unlock: 3, follow: 5, parallax: 0.5 };
  const MOVE = { speed: 4, sprint: 6, jump: 6.548, gravity: -29.43, turn: 15, radius: 0.3, step: 0.45 };
  const IRIS = { start: -0.1, idle: 0.35, hover: 0.45, open: 1.5, size: 15 };
  const HAMMER = { at: [-5.8, 1.8, -10.8], every: () => (state.reduce ? 4 : 2), maxDistance: 17, cap: 0.2 };
  const SLEEP = { duration: 5, riseHeight: 0.88, minScale: 0.05, maxScale: 0.15, count: 3 };
  const PLATE_ON = 3.56;

  // ───── Swap slot — the original has email · social signposts, three projects (stepping on the pad switches the portal screen) ─────
  // Signs and name text (label) are English placeholders — the original font Metamorphous has no Korean glyphs, so Korean text would fall back to a Ming serif. Put the actual English name here
  const WORLD = {
    spawn: [0, 5.6],
    controls: { slot: "controls-sign", label: "Move", at: [1.1, 0, 1.7] },
    links: [
      { slot: "link-signs", id: "link-1", label: "Link 1", href: "#", sign: [-4.45, -8.55], rot: 0.45 },
      { slot: "link-signs", id: "link-2", label: "Link 2", href: "#", sign: [-3.4, -9.09], rot: 0.47 },
      { slot: "link-signs", id: "link-3", label: "Link 3", href: "#", sign: [-2.26, -9.65], rot: 0.47 },
    ],
    portal: { slot: "project-portal", at: [-6, 7, -38.6], label: "Open selected project" },
    projects: [
      { slot: "project-plates", id: "project-1", label: "Project Name 01", href: "#", plate: [-8.7, -34.6], photo: "Project 1 first-screen capture · full browser window · landscape 16:10" },
      { slot: "project-plates", id: "project-2", label: "Project Name 02", href: "#", plate: [-6, -34], photo: "Project 2 Hero capture · light background · landscape 16:10" },
      { slot: "project-plates", id: "project-3", label: "Project Name 03", href: "#", plate: [-3.3, -34.6], photo: "Project 3 Hero capture · Dark background · Landscape 16:10" },
    ],
  };

  const COLORS = {
    grass: paint("grass"), grassSide: paint("grass-side"), rock: paint("rock"), rockDark: paint("rock-dark"),
    wood: paint("wood"), woodDark: paint("wood-dark"), fence: paint("fence"), cap: paint("cap"),
    stone: paint("stone"), wall: paint("wall"), wallDark: paint("wall-dark"), roof: paint("roof"), trim: paint("trim"),
    pine: paint("pine"), pine2: paint("pine-2"), trunk: paint("trunk"), crystal: paint("crystal"), well: paint("well"),
    metal: paint("metal"), post: paint("post"),
  };

  // ───── Terrain — lower tier (y 0) · upper tier (y 7) · front stairs · high stairs. Walking checks use these values too
  const LOWER = [[-12.5, 3.6], [-1.45, 3.95], [1.45, 3.95], [5.2, 3.3], [7.8, -2], [10, -10], [8.6, -17], [5.5, -22], [-2, -22.6], [-9, -21.5], [-13, -15], [-13.8, -5]];
  const UPPER = [[-15, -23.7], [0.6, -24.62], [3, -24.62], [9, -24], [10.5, -32], [8, -44], [-2, -48], [-12, -47], [-16.5, -38]];
  const UP_Y = 7;
  const FRONT_STAIRS = { x: 1.15, z0: 3.8, z1: 6.9, y1: -1.1 };
  const LANDING = { x: 1.6, z0: 6.85, z1: 8.7, y: -1.1 };
  const TALL_STAIRS = { x0: 0.8, x1: 2.8, z0: -18, z1: -24.62 };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rng = ((s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; })(11);
  const rr = (a, b) => a + (b - a) * rng();
  const inPoly = (p, x, z) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, zi] = p[i], [xj, zj] = p[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const groundAt = (x, z) => {
    let h = null;
    const take = (v) => { if (h === null || v > h) h = v; };
    if (inPoly(LOWER, x, z)) take(0);
    if (inPoly(UPPER, x, z)) take(UP_Y);
    if (Math.abs(x) < FRONT_STAIRS.x && z > 3.5 && z < FRONT_STAIRS.z1) take(FRONT_STAIRS.y1 * clamp((z - FRONT_STAIRS.z0) / (FRONT_STAIRS.z1 - FRONT_STAIRS.z0), 0, 1));
    if (Math.abs(x) < LANDING.x - 0.05 && z >= LANDING.z0 && z < LANDING.z1 - 0.05) take(LANDING.y);
    if (x > TALL_STAIRS.x0 && x < TALL_STAIRS.x1 && z < TALL_STAIRS.z0 + 0.3 && z > TALL_STAIRS.z1 - 0.01)
      take(UP_Y * clamp((TALL_STAIRS.z0 - z) / (TALL_STAIRS.z0 - TALL_STAIRS.z1), 0, 1));
    return h;
  };
  const obstacles = []; // { x, z, r } Or { x0, x1, z0, z1 }, blocks only at heights between y0 and y1
  const blocked = (x, z, y) => obstacles.some((o) => {
    if (y < o.y0 - 0.2 || y > o.y1) return false;
    if (o.r) return Math.hypot(x - o.x, z - o.z) < o.r + MOVE.radius;
    return x > o.x0 - MOVE.radius && x < o.x1 + MOVE.radius && z > o.z0 - MOVE.radius && z < o.z1 + MOVE.radius;
  });

  // ───── Renderer and post-processing (bloom + iris hole). The outside is transparent so the CSS sky gradient shows through
  const host = document.querySelector(".mf-world");
  const renderer = new T.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = !touch;
  renderer.shadowMap.type = T.PCFShadowMap;
  host.append(renderer.domElement);

  const scene = new T.Scene();
  const NIGHT_FOG = new T.Color(paint("night-fog"));
  scene.fog = new T.FogExp2(NIGHT_FOG.clone(), 0.012);
  const camera = new T.PerspectiveCamera(CAM.fov, innerWidth / innerHeight, CAM.near, CAM.far);
  camera.rotation.set(CAM.pitch, 0, 0);

  const rtOpts = { type: T.HalfFloatType, depthBuffer: true };
  const rtScene = new T.WebGLRenderTarget(1, 1, { ...rtOpts, samples: 4 });
  const rtA = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, depthBuffer: false });
  const rtB = rtA.clone();
  const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2));
  const quadScene = new T.Scene();
  quadScene.add(quad);
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

  const brightMat = new T.ShaderMaterial({
    uniforms: { tMap: { value: null } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tMap; varying vec2 vUv;
      void main(){ vec3 c = texture2D(tMap, vUv).rgb; float l = dot(c, vec3(.2126,.7152,.0722));
        gl_FragColor = vec4(c * smoothstep(1.1, 2.4, l), 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const blurMat = new T.ShaderMaterial({
    uniforms: { tMap: { value: null }, uDir: { value: new T.Vector2() } },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
      void main(){ vec3 c = texture2D(tMap, vUv).rgb * .227;
        c += (texture2D(tMap, vUv + uDir * 1.385).rgb + texture2D(tMap, vUv - uDir * 1.385).rgb) * .316;
        c += (texture2D(tMap, vUv + uDir * 3.231).rgb + texture2D(tMap, vUv - uDir * 3.231).rgb) * .070;
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  // Original iris: radius = progress² + noise×.1×progress. The noise rotates with the progress and flows with time×.15. Units are screen width (y is divided by the aspect ratio)
  const irisMat = new T.ShaderMaterial({
    uniforms: {
      tScene: { value: null }, tBloom: { value: null },
      uProgress: { value: IRIS.start }, uSize: { value: IRIS.size }, uUnit: { value: new T.Vector2(1, 1) }, uTime: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: `uniform sampler2D tScene, tBloom; uniform float uProgress, uSize, uTime; uniform vec2 uUnit; varying vec2 vUv;
      vec4 perm(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
      vec4 tis(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
        i = mod(i, 289.0);
        vec4 p = perm(perm(perm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        vec3 ns = 0.142857142857 * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = tis(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      void main(){
        vec3 col = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb;
        float vig = 1.0 - smoothstep(.3995, .8, distance(vUv, vec2(.5)));
        gl_FragColor = vec4(col * vig, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        if (uProgress < 1.5) {
          vec2 o = (vUv - .5) * uUnit;
          float s = max(abs(uProgress), 1e-5);
          float c = length(o / s);
          float a = sin(uProgress) * 2.0;
          vec2 l = mat2(cos(a), -sin(a), sin(a), cos(a)) * o;
          float u = snoise(vec3(l * uSize, uTime * .15));
          float d = c - uProgress;
          float f = max(fwidth(d), 1e-5);
          gl_FragColor *= 1.0 - smoothstep(-f, f, d - u * .1);
        }
      }`,
    depthTest: false, depthWrite: false,
  });

  let W = 1, H = 1;
  const resize = () => {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H);
    const pr = renderer.getPixelRatio();
    rtScene.setSize(Math.round(W * pr), Math.round(H * pr));
    rtA.setSize(Math.round((W * pr) / 4), Math.round((H * pr) / 4));
    rtB.setSize(Math.round((W * pr) / 4), Math.round((H * pr) / 4));
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    irisMat.uniforms.uUnit.value.set(1, H / W);
  };
  resize();
  addEventListener("resize", resize);

  const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); };
  const draw = () => {
    renderer.setRenderTarget(rtScene);
    renderer.render(scene, camera);
    brightMat.uniforms.tMap.value = rtScene.texture;
    pass(brightMat, rtA);
    for (const k of [1, 2]) {
      blurMat.uniforms.tMap.value = rtA.texture; blurMat.uniforms.uDir.value.set(k / rtA.width, 0); pass(blurMat, rtB);
      blurMat.uniforms.tMap.value = rtB.texture; blurMat.uniforms.uDir.value.set(0, k / rtA.height); pass(blurMat, rtA);
    }
    irisMat.uniforms.tScene.value = rtScene.texture;
    irisMat.uniforms.tBloom.value = rtA.texture;
    pass(irisMat, null);
  };

  // ───── Ingredients
  const mats = {};
  const mat = (key, extra = {}) => (mats[key] ??= new T.MeshStandardMaterial({ color: COLORS[key] ?? key, roughness: 0.95, metalness: 0, flatShading: true, ...extra }));
  const glow = (hex, k) => new T.MeshBasicMaterial({ color: new T.Color(hex).multiplyScalar(k), toneMapped: false, fog: false });
  const canvasTex = (w, h, paint) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    paint(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const radialTex = (inner = paint("ink")) => canvasTex(128, 128, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, inner); g.addColorStop(0.35, paint("ink", 0.35)); g.addColorStop(1, paint("ink", 0));
    x.fillStyle = g; x.fillRect(0, 0, w, w);
  });

  // Static shapes of the same material are merged into one mesh to cut draw calls
  const batches = new Map();
  const tmpM = new T.Matrix4(), tmpQ = new T.Quaternion(), tmpE = new T.Euler(), tmpV = new T.Vector3(), tmpS = new T.Vector3();
  const put = (key, geo, [x = 0, y = 0, z = 0] = [], [rx = 0, ry = 0, rz = 0] = [], [sx = 1, sy = 1, sz = 1] = []) => {
    tmpM.compose(tmpV.set(x, y, z), tmpQ.setFromEuler(tmpE.set(rx, ry, rz)), tmpS.set(sx, sy, sz));
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute("uv"); g.deleteAttribute("normal");
    g.applyMatrix4(tmpM);
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(g);
  };
  const bake = (receiveOnly = []) => {
    for (const [key, list] of batches) {
      const total = list.reduce((n, g) => n + g.attributes.position.count, 0);
      const arr = new Float32Array(total * 3);
      let off = 0;
      for (const g of list) { arr.set(g.attributes.position.array, off); off += g.attributes.position.array.length; g.dispose(); }
      const geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.BufferAttribute(arr, 3));
      geo.computeVertexNormals();
      const m = new T.Mesh(geo, mat(key));
      m.receiveShadow = true;
      m.castShadow = !receiveOnly.includes(key);
      scene.add(m);
    }
    batches.clear();
  };

  const G = {
    box: new T.BoxGeometry(1, 1, 1),
    cyl6: new T.CylinderGeometry(1, 1, 1, 6),
    cyl8: new T.CylinderGeometry(1, 1, 1, 8),
    cone6: new T.ConeGeometry(1, 1, 6),
    prism: new T.CylinderGeometry(1, 1, 1, 3),
    ico: new T.IcosahedronGeometry(1, 0),
    oct: new T.OctahedronGeometry(1, 0),
    dodec: new T.DodecahedronGeometry(1, 0),
  };

  // ───── Sky, stars, clouds
  const sky = new T.Mesh(
    new T.SphereGeometry(180, 32, 16),
    new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { uHaze: { value: 0 }, uHazeColor: { value: new T.Color() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform float uHaze; uniform vec3 uHazeColor; varying vec3 vP;
        void main(){ float y = vP.y;
          vec3 top = vec3(.010, .030, .200), hor = vec3(.030, .085, .520), bot = vec3(.008, .018, .140);
          vec3 c = y > 0.0 ? mix(hor, top, smoothstep(0.0, .55, y)) : mix(hor, bot, smoothstep(0.0, .35, -y));
          gl_FragColor = vec4(mix(c, uHazeColor, uHaze), 1.0); }`,
    }),
  );
  sky.renderOrder = -1;
  scene.add(sky);

  {
    const n = 900, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rr(-0.75, 1), t = rr(0, Math.PI * 2), r = rr(120, 170), s = Math.sqrt(1 - u * u);
      pos.set([Math.cos(t) * s * r, u * r, Math.sin(t) * s * r], i * 3);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3));
    scene.add(new T.Points(g, new T.PointsMaterial({ color: new T.Color(1.6, 1.6, 1.8), size: 2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false })));
  }

  const cloudTex = canvasTex(256, 256, (x, w) => {
    for (let i = 0; i < 22; i++) {
      const cx = w / 2 + rr(-60, 60), cy = w / 2 + rr(-30, 40), r = rr(30, 70);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, paint("ink", 0.55)); g.addColorStop(1, paint("ink", 0));
      x.fillStyle = g; x.fillRect(0, 0, w, w);
    }
  });
  const clouds = [];
  // Linear values solved backwards so the original in-droplet cloud color #bbd4fc comes out through ACES (blue exceeds 1)
  const CLOUD_TINT = new T.Color(0.116, 0.644, 4.54);
  sky.material.uniforms.uHazeColor.value.copy(CLOUD_TINT).multiplyScalar(0.7);
  const cloud = (x, y, z, s, op, tint = CLOUD_TINT) => {
    const sp = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, color: tint, transparent: true, depthWrite: false, opacity: op, fog: false }));
    sp.position.set(x, y, z); sp.scale.set(s, s * 0.7, 1); sp.userData.op = op;
    scene.add(sp); clouds.push(sp);
  };
  // Fills the space between the start camera (high above the island) and the island with a cloud layer, so it looks like you descend through the clouds on entering
  for (let i = 0; i < 34; i++) cloud(rr(-22, 16), rr(4, 18), rr(15, 42), rr(10, 22), rr(0.7, 1));
  for (let i = 0; i < 14; i++) { const a = rr(0, Math.PI * 2), r = rr(22, 40); cloud(Math.cos(a) * r - 2, rr(-16, -9), Math.sin(a) * r - 20, rr(18, 30), rr(0.12, 0.22), paint("cloud-far")); }

  // ───── Light
  scene.add(new T.HemisphereLight(paint("hemi-sky"), paint("hemi-ground"), 1.25));
  const moon = new T.DirectionalLight(paint("moon"), 1.7);
  moon.castShadow = !touch;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
  moon.shadow.bias = -0.0008;
  scene.add(moon, moon.target);

  // ───── Island (grass cover + rock cliff narrowing downward)
  const island = (poly, top, depth, seedJitter) => {
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const shape = new T.Shape(poly.map(([x, z]) => new T.Vector2(x, -z)));
    put("grass", new T.ShapeGeometry(shape).rotateX(-Math.PI / 2), [0, top, 0]);
    const R = 5, rings = [];
    rings.push(poly.map(([x, z]) => [x, top, z]));
    rings.push(poly.map(([x, z]) => [x, top - 0.38, z]));
    for (let k = 1; k <= R; k++) {
      const s = 1 - 0.62 * Math.pow(k / R, 1.25), y = top - 0.38 - depth * (k / R);
      rings.push(poly.map(([x, z]) => [cx + (x - cx) * s + rr(-seedJitter, seedJitter), y + rr(-0.5, 0.5) * (k < R ? 1 : 0), cz + (z - cz) * s + rr(-seedJitter, seedJitter)]));
    }
    const tip = [cx, top - depth - 3, cz];
    const band = [], rock = [];
    const quadTo = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let k = 0; k < rings.length - 1; k++) {
      const A = rings[k], B = rings[k + 1];
      for (let i = 0; i < A.length; i++) {
        const j = (i + 1) % A.length;
        quadTo(k === 0 ? band : rock, A[i], A[j], B[j], B[i]);
      }
    }
    const last = rings[rings.length - 1];
    for (let i = 0; i < last.length; i++) rock.push(...last[i], ...last[(i + 1) % last.length], ...tip);
    const geo = (arr) => { const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(arr, 3)); return g; };
    put("grassSide", geo(band));
    put("rock", geo(rock));
  };
  island(LOWER, 0, 9, 0.7);
  island(UPPER, UP_Y, 16, 0.9);

  // Front cliff face of the upper tier rising behind the lower tier — the original is a layered rock wall
  for (let i = 0; i < 9; i++) put(i % 2 ? "rock" : "rockDark", G.box, [-13 + i * 2.6 + rr(-0.3, 0.3), 3.2, -23.6 + rr(-0.25, 0.1)], [rr(-0.05, 0.05), rr(-0.15, 0.15), 0], [2.9, 6.8 + rr(-0.6, 0.4), 1]);

  // ───── Stairs
  const stairs = ({ x0, x1, z0, z1, y0, y1, n }) => {
    const run = (z1 - z0) / n, rise = (y1 - y0) / n, w = x1 - x0;
    for (let i = 0; i < n; i++) {
      const yt = y0 + rise * (i + 1) - (rise > 0 ? 0 : rise), z = z0 + run * (i + 0.5);
      put(i % 2 ? "wood" : "woodDark", G.box, [(x0 + x1) / 2, yt - 0.12, z], [], [w, 0.24, Math.abs(run) + 0.02]);
    }
    const len = Math.hypot(z1 - z0, y1 - y0), ang = Math.atan2(y1 - y0, -(z1 - z0));
    for (const sx of [x0 + 0.1, x1 - 0.1]) put("woodDark", G.box, [sx, (y0 + y1) / 2 - 0.35, (z0 + z1) / 2], [ang, 0, 0], [0.18, 0.5, len]);
  };
  stairs({ x0: -FRONT_STAIRS.x, x1: FRONT_STAIRS.x, z0: FRONT_STAIRS.z0, z1: FRONT_STAIRS.z1, y0: 0, y1: FRONT_STAIRS.y1, n: 6 });
  put("wood", G.box, [0, LANDING.y - 0.12, (LANDING.z0 + LANDING.z1) / 2], [], [LANDING.x * 2, 0.24, LANDING.z1 - LANDING.z0]);
  for (const [x, z] of [[-1.5, LANDING.z0 + 0.1], [1.5, LANDING.z0 + 0.1], [-1.5, LANDING.z1 - 0.1], [1.5, LANDING.z1 - 0.1]]) put("woodDark", G.box, [x, LANDING.y - 2.2, z], [], [0.2, 4, 0.2]);
  stairs({ x0: TALL_STAIRS.x0 - 0.15, x1: TALL_STAIRS.x1 + 0.15, z0: TALL_STAIRS.z0, z1: TALL_STAIRS.z1, y0: 0, y1: UP_Y, n: 18 });

  // ───── Fence (post + two rails, only the post tops are pink)
  const fence = ([ax, az], [bx, bz], y = 0) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 1.5)), yaw = Math.atan2(bx - ax, bz - az);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      put("fence", G.box, [x, y + 0.5, z], [0, yaw, 0], [0.16, 1, 0.16]);
      put("cap", G.box, [x, y + 1.05, z], [0, yaw, 0], [0.2, 0.12, 0.2]);
    }
    for (const h of [0.45, 0.82]) put("fence", G.box, [(ax + bx) / 2, y + h, (az + bz) / 2], [0, yaw, 0], [0.08, 0.12, len]);
  };
  fence([-12.3, 3.55], [-1.5, 3.9]);
  fence([1.5, 3.9], [5.2, 3.3]);
  fence([5.2, 3.3], [7.7, -2]);
  fence([-12.3, 3.55], [-13.7, -5]);
  fence([-LANDING.x, LANDING.z1], [LANDING.x, LANDING.z1], LANDING.y);
  fence([-LANDING.x, LANDING.z0], [-LANDING.x, LANDING.z1], LANDING.y);
  fence([LANDING.x, LANDING.z0], [LANDING.x, LANDING.z1], LANDING.y);
  fence([-14.8, -23.75], [0.55, -24.6], UP_Y);
  fence([3.05, -24.6], [9, -24.05], UP_Y);
  // Stair railings only set posts along the slope
  for (const [x, z0, z1, y0, y1, n] of [[-FRONT_STAIRS.x - 0.05, 3.9, FRONT_STAIRS.z1, 0, FRONT_STAIRS.y1, 2], [FRONT_STAIRS.x + 0.05, 3.9, FRONT_STAIRS.z1, 0, FRONT_STAIRS.y1, 2], [TALL_STAIRS.x0 - 0.25, -18, -24.4, 0, UP_Y, 6], [TALL_STAIRS.x1 + 0.25, -18, -24.4, 0, UP_Y, 6]]) {
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = y0 + (y1 - y0) * t, z = z0 + (z1 - z0) * t;
      put("fence", G.box, [x, y + 0.5, z], [], [0.16, 1, 0.16]);
      put("cap", G.box, [x, y + 1.05, z], [], [0.2, 0.12, 0.2]);
    }
    // The box’s long axis is z, so as z shrinks while rising it rotates +x, and as z grows while descending it rotates -x
    const len = Math.hypot(z1 - z0, y1 - y0);
    put("fence", G.box, [x, (y0 + y1) / 2 + 0.85, (z0 + z1) / 2], [Math.atan2(y1 - y0, z0 - z1), 0, 0], [0.08, 0.12, len]);
  }

  // ───── Cobblestones (pile of flat hexagonal stones)
  const stones = [];
  const path = (pts, y, spread) => {
    for (let s = 0; s < pts.length - 1; s++) {
      const [ax, az] = pts[s], [bx, bz] = pts[s + 1], len = Math.hypot(bx - ax, bz - az), n = Math.ceil(len / 0.42);
      const px = -(bz - az) / len, pz = (bx - ax) / len;
      for (let i = 0; i < n; i++) {
        const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        for (let k = 0; k < 3; k++) {
          if (rng() < 0.22) continue;
          const o = rr(-spread, spread);
          stones.push([x + px * o + rr(-0.12, 0.12), y, z + pz * o + rr(-0.12, 0.12), rr(0.18, 0.34), rr(0.14, 0.28), rr(0, 6)]);
        }
      }
    }
  };
  path([[0.1, 3.6], [0.3, 0], [0.9, -4], [1.5, -8], [1.8, -12], [1.85, -17.6]], 0.03, 0.85);
  path([[0.6, -5.5], [-1.4, -7.2], [-3.3, -8.4]], 0.03, 0.55);
  path([[1.8, -25], [0, -29], [-3, -32.6], [-6, -36]], UP_Y + 0.03, 0.8);
  {
    const inst = new T.InstancedMesh(new T.CylinderGeometry(1, 1, 0.07, 6), mat("stone", { roughness: 0.8 }), stones.length);
    stones.forEach(([x, y, z, sx, sz, ry], i) => inst.setMatrixAt(i, tmpM.compose(tmpV.set(x, y, z), tmpQ.setFromEuler(tmpE.set(0, ry, 0)), tmpS.set(sx, 1, sz))));
    inst.receiveShadow = true;
    scene.add(inst);
  }

  // ───── House · Forge
  const house = (x, y, z, w, h, d, roofKey = "roof", window = true) => {
    put("wall", G.box, [x, y + h / 2, z], [], [w, h, d]);
    put("wallDark", G.box, [x, y + 0.25, z], [], [w + 0.2, 0.5, d + 0.2]);
    put(roofKey, G.prism, [x, y + h + 0.75, z], [0, 0, Math.PI / 2], [0.95, d + 0.6, 1.15 * (w / 2 + 0.3)]);
    put("trim", G.box, [x, y + h + 0.05, z + d / 2 + 0.05], [], [w + 0.3, 0.12, 0.12]);
    if (window) {
      const m = new T.Mesh(new T.PlaneGeometry(0.6, 0.8), glow(paint("window-glow"), 2.4));
      m.position.set(x + w * 0.22, y + h * 0.55, z + d / 2 + 0.01);
      scene.add(m);
      put("trim", G.box, [x - w * 0.18, y + 0.9, z + d / 2 + 0.03], [], [0.9, 1.6, 0.06]);
    }
    obstacles.push({ x0: x - w / 2 - 0.1, x1: x + w / 2 + 0.1, z0: z - d / 2 - 0.1, z1: z + d / 2 + 0.1, y0: y, y1: y + h + 2 });
  };
  house(-8.6, 0, -12.6, 5, 3.2, 4.4);
  put("wallDark", G.box, [-8.6, 4.4, -13.4], [], [0.7, 2.4, 0.7]);
  house(-11.2, 0, -18.4, 4, 3.6, 3.6);
  house(-2.6, 0, -21, 3.2, 2.6, 2.4);
  house(-11.5, UP_Y, -30.5, 4.4, 3.4, 4);
  house(5.6, UP_Y, -40, 4.8, 3.6, 4.2);
  house(-1.5, UP_Y, -43.5, 3.4, 3, 3);

  // Forge furnace (hemisphere + glowing hearth), anvil, hammer
  put("wallDark", new T.SphereGeometry(1.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), [-7.3, 0, -9.6]);
  const forgeMouth = new T.Mesh(new T.CircleGeometry(0.55, 10, 0, Math.PI), glow(paint("forge"), 5));
  forgeMouth.position.set(-7.3, 0.02, -8.42);
  scene.add(forgeMouth);
  obstacles.push({ x: -7.3, z: -9.6, r: 1.2, y0: 0, y1: 1.4 });
  const forgeLight = new T.PointLight(paint("forge"), 14, 9, 2);
  forgeLight.position.set(-7.3, 0.9, -8);
  scene.add(forgeLight);
  put("metal", G.box, [-5.8, 0.35, -10.4], [0, 0.4, 0], [0.4, 0.7, 0.4]);
  put("metal", G.box, [-5.8, 0.78, -10.4], [0, 0.4, 0], [0.5, 0.18, 0.95]);
  obstacles.push({ x: -5.8, z: -10.4, r: 0.55, y0: 0, y1: 1 });
  const hammer = new T.Group();
  hammer.position.set(-5.55, 1.05, -10.15);
  {
    const handle = new T.Mesh(G.box, mat("trunk"));
    handle.scale.set(0.07, 0.07, 0.6); handle.position.z = 0.3;
    const head = new T.Mesh(G.box, mat("metal"));
    head.scale.set(0.16, 0.26, 0.16); head.position.z = 0.6;
    hammer.add(handle, head);
    hammer.rotation.set(-0.9, 0.4 + Math.PI, 0);
    scene.add(hammer);
  }
  const sparkGeo = new T.BufferGeometry();
  const sparkN = 18, sparkPos = new Float32Array(sparkN * 3), sparkVel = [];
  sparkGeo.setAttribute("position", new T.BufferAttribute(sparkPos, 3));
  const sparks = new T.Points(sparkGeo, new T.PointsMaterial({ color: new T.Color(paint("spark")).multiplyScalar(6), size: 3, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  scene.add(sparks);

  // Table · chair
  for (const [x, z, r] of [[-11, -7.4, 0.2], [-10.6, -10.2, -0.1]]) {
    put("wood", G.box, [x, 0.75, z], [0, r, 0], [1.9, 0.12, 0.9]);
    put("woodDark", G.box, [x, 0.36, z], [0, r, 0], [1.6, 0.7, 0.12]);
    put("woodDark", G.box, [x, 0.3, z + 0.8], [0, r, 0], [1.7, 0.1, 0.35]);
    obstacles.push({ x, z: z + 0.3, r: 1, y0: 0, y1: 1 });
  }

  // ───── Trees, rocks, crystals, well
  const pine = (x, y, z, s) => {
    put("trunk", G.cyl6, [x, y + 0.45 * s, z], [], [0.18 * s, 0.9 * s, 0.18 * s]);
    [[1.25, 1.5, 1.2], [1.0, 1.35, 2.0], [0.7, 1.15, 2.75]].forEach(([r, h, yy], i) =>
      put(i % 2 ? "pine2" : "pine", G.cone6, [x, y + yy * s, z], [0, rr(0, 1), 0], [r * s, h * s, r * s]));
    obstacles.push({ x, z, r: 0.35 * s, y0: y, y1: y + 4 * s });
  };
  for (const [x, z, s] of [[4.6, -13, 1.1], [6.5, -15.8, 1.35], [3.4, -20, 1.2], [-4.6, -19.4, 1.25], [8.1, -9.6, 1], [-12.2, -2.4, 1.1], [8.4, -19.5, 1.2], [-6.8, -20, 1]]) pine(x, 0, z, s);
  for (const [x, z, s] of [[5, -28.2, 1.3], [7.6, -33.5, 1.4], [-13.4, -26.6, 1.2], [1.5, -45, 1.3], [-4.6, -45.2, 1.1], [-14.6, -40, 1.3]]) pine(x, UP_Y, z, s);
  for (const [x, z, s, ry] of [[8.3, -4.4, 1, 0.2], [9, -6.6, 1.3, -0.3], [7.9, -8.3, 0.8, 0.6], [9.3, -26.5, 1.1, 0.1]]) {
    const y = z < -24 ? UP_Y : 0;
    put("crystal", G.oct, [x, y + 0.95 * s, z], [rr(-0.2, 0.2), ry, rr(-0.25, 0.25)], [0.45 * s, 1.35 * s, 0.4 * s]);
    obstacles.push({ x, z, r: 0.42 * s, y0: y, y1: y + 2 });
  }
  mat("crystal", { emissive: new T.Color(paint("crystal-glow")), emissiveIntensity: 0.35 });
  for (let i = 0; i < 10; i++) {
    const x = rr(-12, 9), z = rr(-21, 2);
    if (Math.abs(x - 1) < 2.5 || groundAt(x, z) !== 0) continue;
    put("rockDark", G.dodec, [x, 0.15, z], [rng(), rng(), 0], [rr(0.2, 0.45), rr(0.15, 0.3), rr(0.2, 0.4)]);
  }
  // Well — round stone basin + two posts + roof beam + water surface
  put("well", G.cyl8, [5.2, 0.45, -5.6], [], [1, 0.9, 1]);
  put("wallDark", G.cyl8, [5.2, 0.92, -5.6], [], [1.08, 0.12, 1.08]);
  put("post", G.box, [4.2, 1.2, -5.6], [], [0.14, 2.4, 0.14]);
  put("post", G.box, [6.2, 1.2, -5.6], [], [0.14, 2.4, 0.14]);
  put("woodDark", G.box, [5.2, 2.35, -5.6], [], [2.3, 0.14, 0.14]);
  {
    const water = new T.Mesh(new T.CircleGeometry(0.88, 8).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ color: paint("water"), emissive: paint("water-glow"), emissiveIntensity: 0.6, roughness: 0.2, flatShading: true }));
    water.position.set(5.2, 0.86, -5.6);
    scene.add(water);
  }
  put("well", G.cyl6, [4, 0.22, -4.4], [], [0.3, 0.44, 0.3]);
  obstacles.push({ x: 5.2, z: -5.6, r: 1.15, y0: 0, y1: 2.5 });

  // ───── Lantern (gallows-shaped post hung with a pink lamp). Only the six lower tiers light up ─────
  const haloTex = radialTex();
  const lanterns = [];
  const lantern = (x, y, z, dir, lit) => {
    put("post", G.box, [x, y + 1.3, z], [], [0.16, 2.6, 0.16]);
    put("post", G.box, [x + dir * 0.35, y + 2.55, z], [], [0.8, 0.12, 0.12]);
    put("cap", G.box, [x, y + 0.12, z], [], [0.36, 0.24, 0.36]);
    put("metal", G.box, [x + dir * 0.62, y + 2.25, z], [], [0.04, 0.5, 0.04]);
    put("metal", G.box, [x + dir * 0.62, y + 1.98, z], [], [0.36, 0.06, 0.36]);
    put("metal", G.box, [x + dir * 0.62, y + 1.52, z], [], [0.36, 0.06, 0.36]);
    const core = new T.Mesh(G.box, glow(paint("lamp-core"), 4));
    core.scale.set(0.24, 0.42, 0.24);
    core.position.set(x + dir * 0.62, y + 1.75, z);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: haloTex, color: paint("lamp-halo"), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.55, fog: false }));
    halo.scale.setScalar(1.6);
    halo.position.copy(core.position);
    scene.add(core, halo);
    let light = null;
    if (lit) {
      light = new T.PointLight(paint("lamp-light"), 7, 7, 2);
      light.position.copy(core.position);
      scene.add(light);
    }
    lanterns.push({ halo, light, seed: rng() * 10 });
    obstacles.push({ x, z, r: 0.2, y0: y, y1: y + 3 });
  };
  lantern(-1.85, 0, 3.35, 1, true);
  lantern(-1.4, 0, -2.6, 1, true);
  lantern(2.6, 0, -6.4, -1, true);
  lantern(0.35, 0, -17.6, 1, true);
  lantern(3.25, 0, -17.6, -1, true);
  lantern(-4.3, 0, -6.9, 1, true);
  lantern(0.35, UP_Y, -25.1, 1, false);
  lantern(3.25, UP_Y, -25.1, -1, false);
  lantern(-3.6, UP_Y, -33.4, 1, false);
  lantern(-9.2, UP_Y, -36.2, 1, false);

  // ───── Control signs — glowing arrow keycaps standing on the ground and floating letters
  const fontReady = Promise.race([
    Promise.all([MF.font("--kf-font-display"), MF.font("--kf-font-glyph")].map((f) => document.fonts.load(`96px ${f}`, "Move Link 0"))),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
  const keycapTex = (glyph) => canvasTex(128, 128, (x, w) => {
    x.fillStyle = paint("board"); x.fillRect(0, 0, w, w);
    x.strokeStyle = paint("rune-line"); x.lineWidth = 7; x.shadowColor = paint("rune-glow"); x.shadowBlur = 14;
    x.beginPath(); x.roundRect(12, 12, w - 24, w - 24, 12); x.stroke();
    x.lineWidth = 9; x.lineCap = "round"; x.lineJoin = "round"; x.beginPath();
    const c = w / 2, s = 18;
    const P = { up: [[c - s, c + 8], [c, c - 10], [c + s, c + 8]], down: [[c - s, c - 8], [c, c + 10], [c + s, c - 8]], left: [[c + 8, c - s], [c - 10, c], [c + 8, c + s]], right: [[c - 8, c - s], [c + 10, c], [c - 8, c + s]] }[glyph];
    x.moveTo(...P[0]); x.lineTo(...P[1]); x.lineTo(...P[2]); x.stroke();
  });
  const signTextTex = (text, w = 512, h = 192, size = 104, color = paint("ink-soft")) => canvasTex(w, h, (x) => {
    x.font = `${size}px ${MF.font("--kf-font-display")}`;
    x.textAlign = "center"; x.textBaseline = "middle";
    x.shadowColor = paint("sign-glow"); x.shadowBlur = 22; x.fillStyle = color;
    x.fillText(text, w / 2, h / 2);
    x.shadowBlur = 0; x.fillText(text, w / 2, h / 2);
  });
  const buildSigns = () => {
    const { at, label } = WORLD.controls;
    const body = mat(paint("board"), { roughness: 0.6 });
    [["up", 0, 0.7], ["left", -0.5, 0.23], ["down", 0, 0.23], ["right", 0.5, 0.23]].forEach(([g, dx, y]) => {
      const t = keycapTex(g);
      const face = new T.MeshStandardMaterial({ map: t, emissive: paint("ink"), emissiveMap: t, emissiveIntensity: 3.4, roughness: 0.6 });
      const cap = new T.Mesh(new T.BoxGeometry(0.46, 0.46, 0.46), [body, body, body, body, face, body]);
      cap.position.set(at[0] + dx, y, at[2]);
      cap.rotation.x = -0.12;
      cap.castShadow = true;
      scene.add(cap);
    });
    const text = new T.Mesh(new T.PlaneGeometry(1.7, 0.64), new T.MeshBasicMaterial({ map: signTextTex(label), transparent: true, depthWrite: false, color: new T.Color(2.2, 2.2, 2.2), toneMapped: false }));
    text.position.set(at[0], 1.25, at[2] - 0.1);
    text.rotation.x = -0.2;
    scene.add(text);
    obstacles.push({ x0: at[0] - 0.7, x1: at[0] + 0.7, z0: at[2] - 0.25, z1: at[2] + 0.25, y0: -0.5, y1: 1 });
  };

  // ───── Link signpost — a diamond ring (original RingGeometry(.12,.15,4), color 10/1.5/1) turns into an Enter tile when stepped on
  const RING_COLOR = new T.Color(10, 1.5, 1);
  const enterTileTex = canvasTex(128, 128, (x, w) => {
    x.strokeStyle = paint("ink"); x.lineWidth = 8; x.lineJoin = "round"; x.lineCap = "round";
    x.beginPath(); x.roundRect(10, 10, w - 20, w - 20, 16); x.stroke();
    x.beginPath(); x.moveTo(88, 38); x.lineTo(88, 74); x.lineTo(42, 74); x.stroke();
    x.beginPath(); x.moveTo(56, 60); x.lineTo(42, 74); x.lineTo(56, 88); x.stroke();
  });
  const sensors = [];
  const indicator = (pos, rotY, scale = 1) => {
    const g = new T.Group();
    g.position.set(...pos); g.rotation.y = rotY; g.scale.setScalar(scale);
    const ring = new T.Mesh(new T.RingGeometry(0.12, 0.15, 4), new T.MeshBasicMaterial({ color: RING_COLOR, side: T.DoubleSide, toneMapped: false, fog: false }));
    const tile = new T.Mesh(new T.PlaneGeometry(250 / 256, 252 / 256), new T.MeshBasicMaterial({ map: enterTileTex, alphaMap: enterTileTex, color: RING_COLOR, transparent: true, depthWrite: false, toneMapped: false, fog: false, side: T.DoubleSide }));
    tile.scale.setScalar(0.001);
    g.add(ring, tile);
    scene.add(g);
    const tl = gsap.timeline({ paused: true })
      .to(ring.rotation, { z: Math.PI / 4, duration: 0.1, ease: "power2.in" })
      .to(ring.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.15, ease: "power2.out" }, ">")
      .to(tile.scale, { x: 0.45, y: 0.45, z: 0.45, duration: 0.15, ease: "power2.out" }, "<");
    return { g, ring, tile, tl };
  };
  const linkBoardTex = (label) => canvasTex(256, 128, (x, w, h) => {
    x.fillStyle = paint("key-board"); x.fillRect(0, 0, w, h);
    x.strokeStyle = paint("key-line"); x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12);
    x.strokeStyle = paint("ink-soft"); x.lineWidth = 5; x.beginPath(); x.roundRect(22, 32, 64, 64, 12); x.stroke();
    x.font = `40px ${MF.font("--kf-font-display")}`; x.fillStyle = paint("ink-soft"); x.textBaseline = "middle"; x.fillText(label, 104, h / 2 + 2);
  });
  const buildLinks = () => {
    for (const L of WORLD.links) {
      const [sx, sz] = L.sign;
      const dx = Math.sin(L.rot), dz = Math.cos(L.rot);
      put("post", G.box, [sx - Math.cos(L.rot) * 0.5, 0.55, sz + Math.sin(L.rot) * 0.5], [0, L.rot, 0], [0.12, 1.1, 0.12]);
      put("post", G.box, [sx + Math.cos(L.rot) * 0.5, 0.55, sz - Math.sin(L.rot) * 0.5], [0, L.rot, 0], [0.12, 1.1, 0.12]);
      const board = new T.Mesh(new T.BoxGeometry(1.2, 0.6, 0.08), [mat("woodDark"), mat("woodDark"), mat("woodDark"), mat("woodDark"), new T.MeshStandardMaterial({ map: linkBoardTex(L.label), roughness: 0.9, emissive: paint("ink"), emissiveMap: linkBoardTex(L.label), emissiveIntensity: 0.25 }), mat("woodDark")]);
      board.position.set(sx, 0.95, sz);
      board.rotation.y = L.rot;
      board.castShadow = true;
      scene.add(board);
      const ind = indicator([sx, 2.2, sz], L.rot);
      sensors.push({ kind: "link", ...L, x: sx + dx * 0.55, z: sz + dz * 0.55, y: 0, r: 0.55, ind });
      obstacles.push({ x: sx, z: sz, r: 0.35, y0: 0, y1: 1.4 });
    }
  };

  // ───── Top row: project portal and three footholds. Stepping on a foothold switches the screen inside the portal to that project (original .3s power2.out)
  const photoTex = (label) => canvasTex(1024, 640, (x, w, h) => {
    x.fillStyle = paint("shot-fill"); x.fillRect(0, 0, w, h);
    x.strokeStyle = paint("shot-line"); x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
    x.font = `600 34px ${MF.font("--wf-mono")}`;
    const tw = x.measureText(label).width;
    x.fillStyle = paint("shot-fill"); x.fillRect(w / 2 - tw / 2 - 24, h / 2 - 34, tw + 48, 68);
    x.fillStyle = paint("shot-ink"); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, w / 2, h / 2);
  });
  const portal = { selected: null };
  const buildPortal = () => {
    const [px, py, pz] = WORLD.portal.at;
    const ring = new T.Mesh(new T.TorusGeometry(2.1, 0.34, 6, 12), mat("rock"));
    ring.position.set(px, py + 2.45, pz);
    ring.castShadow = true;
    scene.add(ring);
    put("rockDark", G.box, [px, py + 0.2, pz], [], [3.2, 0.4, 1.2]);
    obstacles.push({ x0: px - 2.6, x1: px + 2.6, z0: pz - 0.6, z1: pz + 0.6, y0: py, y1: py + 5 });
    const swirl = new T.Mesh(new T.CircleGeometry(1.8, 48), new T.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false, toneMapped: false,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.82 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform float uTime, uOpacity; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        void main(){ vec2 p = vUv - .5; float r = length(p) * 2.0; float a = atan(p.y, p.x) + uTime * .6 + r * 3.0;
          float v = n(vec2(cos(a), sin(a)) * 2.2 * r + uTime * .1) * .7 + n(p * 6.0 - uTime * .1) * .3;
          vec3 deep = vec3(.06,.30,.10), mid = vec3(.03,.75,.01), bright = vec3(.05,.68,.20);
          vec3 c = mix(deep, mix(mid, bright, v), smoothstep(.2, .9, v)) * (1.0 + 1.67 * (1.0 - r));
          c += vec3(3.7) * smoothstep(.96, 1.0, r);
          gl_FragColor = vec4(c, uOpacity * smoothstep(1.0, .97, r)); }`,
    }));
    swirl.position.set(px, py + 2.45, pz + 0.02);
    swirl.visible = false;
    const screens = WORLD.projects.map((p) => {
      const m = new T.Mesh(new T.PlaneGeometry(2.4, 1.5), new T.MeshBasicMaterial({ map: photoTex(p.photo), transparent: true, toneMapped: true }));
      m.position.set(px, py + 2.45, pz + 0.05);
      m.scale.setScalar(0.001);
      m.visible = false;
      scene.add(m);
      return m;
    });
    const light = new T.PointLight(paint("plate-light"), 0, 8, 2);
    light.position.set(px, py + 2.4, pz + 1.2);
    scene.add(swirl, light);
    Object.assign(portal, { swirl, screens, light });

    const ind = indicator([px, py + 4.95, pz + 0.1], 0, 2.2);
    sensors.push({ kind: "portal", id: "portal", label: WORLD.portal.label, x: px, z: pz + 1.6, y: py, r: 0.8, ind });

    WORLD.projects.forEach((p, i) => {
      const [x, z] = p.plate;
      const t = canvasTex(128, 128, (c, w) => {
        c.fillStyle = paint("board"); c.fillRect(0, 0, w, w);
        c.strokeStyle = paint("accent"); c.lineWidth = 8; c.beginPath(); c.arc(w / 2, w / 2, 50, 0, Math.PI * 2); c.stroke();
        c.font = `56px ${MF.font("--kf-font-glyph")}`; c.fillStyle = paint("accent"); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(i + 1), w / 2, w / 2 + 4);
      });
      const top = new T.MeshStandardMaterial({ map: t, emissive: paint("accent"), emissiveMap: t, emissiveIntensity: 0, roughness: 0.6 });
      const plate = new T.Mesh(new T.CylinderGeometry(0.75, 0.82, 0.14, 8), [mat("wallDark"), top, mat("wallDark")]);
      plate.position.set(x, UP_Y + 0.07, z);
      plate.rotation.y = Math.PI / 2;
      plate.receiveShadow = true;
      scene.add(plate);
      const tw = gsap.to(top, { emissiveIntensity: PLATE_ON, duration: 0.2, paused: true, onStart: () => sound.plate() });
      sensors.push({ kind: "plate", ...p, index: i, x, z, y: UP_Y, r: 0.75, tw });
    });
  };
  const selectProject = (s) => {
    if (portal.selected === s.index) return;
    if (portal.selected !== null) {
      sensors.find((o) => o.kind === "plate" && o.index === portal.selected)?.tw.reverse();
      const old = portal.screens[portal.selected];
      gsap.to(old.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.15, onComplete: () => (old.visible = false) });
    }
    portal.selected = s.index;
    s.tw.play();
    portal.swirl.visible = true;
    gsap.to(portal.light, { intensity: 8, duration: 0.3 });
    const scr = portal.screens[s.index];
    scr.visible = true;
    gsap.fromTo(scr.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" });
  };

  // ───── Sleeping beast and rising Z (original SleepText: rises .88 over 5s, .05→.15, three staggered)
  const sleeper = new T.Group();
  {
    const body = new T.Mesh(new T.IcosahedronGeometry(0.55, 0), mat(paint("beast")));
    body.scale.set(1.2, 0.6, 0.9);
    const head = new T.Mesh(new T.IcosahedronGeometry(0.3, 0), mat(paint("beast")));
    head.position.set(0.55, 0.12, 0.2);
    const ear1 = new T.Mesh(G.cone6, mat(paint("beast"))); ear1.scale.set(0.1, 0.2, 0.1); ear1.position.set(0.5, 0.42, 0.1);
    const ear2 = ear1.clone(); ear2.position.set(0.68, 0.42, 0.3);
    const tail = new T.Mesh(G.cone6, mat(paint("beast-tail"))); tail.scale.set(0.18, 0.7, 0.18); tail.position.set(-0.6, 0.05, 0.35); tail.rotation.set(1.4, 0, 0.9);
    sleeper.add(body, head, ear1, ear2, tail);
    sleeper.traverse((o) => (o.castShadow = true));
    sleeper.position.set(-10.6, UP_Y + 0.3, -41.5);
    scene.add(sleeper);
    obstacles.push({ x: -10.6, z: -41.5, r: 0.8, y0: UP_Y, y1: UP_Y + 1.5 });
    const zTex = canvasTex(128, 128, (x, w) => { x.font = `96px ${MF.font("--kf-font-glyph")}`; x.fillStyle = paint("ink"); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("z", w / 2, w / 2); });
    for (let i = 0; i < SLEEP.count; i++) {
      const z = new T.Sprite(new T.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false, fog: false }));
      z.position.set(-10.2, UP_Y + 0.8, -41.4);
      scene.add(z);
      const short = Math.min(0.15, SLEEP.duration * 0.25), grow = SLEEP.duration - short;
      gsap.timeline({ repeat: -1, delay: (i * SLEEP.duration) / SLEEP.count })
        .fromTo(z.position, { y: UP_Y + 0.8 }, { y: UP_Y + 0.8 + SLEEP.riseHeight, duration: SLEEP.duration, ease: "linear" }, 0)
        .fromTo(z.scale, { x: SLEEP.minScale, y: SLEEP.minScale }, { x: SLEEP.maxScale, y: SLEEP.maxScale, duration: grow, ease: "linear" }, 0)
        .to(z.scale, { x: 0, y: 0, duration: short, ease: "power2.in" }, grow);
    }
  }

  // ───── Character (a small hooded person + a green orb in hand)
  const hero = new T.Group();
  const limbs = {};
  {
    const cloth = mat(paint("cloth")), dark = mat(paint("cloth-dark")), skin = mat(paint("skin")), scarf = mat(paint("scarf"));
    const leg = (x) => { const p = new T.Group(); p.position.set(x, 0.46, 0); const m = new T.Mesh(G.box, dark); m.scale.set(0.13, 0.46, 0.15); m.position.y = -0.23; p.add(m); hero.add(p); return p; };
    limbs.legL = leg(-0.1); limbs.legR = leg(0.1);
    const body = new T.Mesh(new T.CylinderGeometry(0.19, 0.29, 0.6, 6), cloth);
    body.position.y = 0.74;
    const sc = new T.Mesh(new T.CylinderGeometry(0.21, 0.22, 0.1, 6), scarf);
    sc.position.y = 1.02;
    const head = new T.Mesh(new T.IcosahedronGeometry(0.19, 0), skin);
    head.position.set(0, 1.2, 0.03);
    const hood = new T.Mesh(new T.ConeGeometry(0.25, 0.55, 6), cloth);
    hood.position.set(0, 1.33, -0.06);
    hood.rotation.x = -0.35;
    const arm = (x) => { const p = new T.Group(); p.position.set(x, 0.98, 0); const m = new T.Mesh(G.box, cloth); m.scale.set(0.1, 0.42, 0.12); m.position.y = -0.2; p.add(m); hero.add(p); return p; };
    limbs.armL = arm(-0.27); limbs.armR = arm(0.27);
    const orb = new T.Mesh(new T.IcosahedronGeometry(0.075, 1), glow(paint("orb"), 5));
    orb.position.set(0, -0.45, 0.06);
    limbs.armR.add(orb);
    const orbLight = new T.PointLight(paint("orb-light"), 3, 4, 2);
    orbLight.position.copy(orb.position);
    limbs.armR.add(orbLight);
    limbs.body = body;
    hero.add(body, sc, head, hood);
    hero.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    hero.scale.setScalar(0.8);
    hero.position.set(WORLD.spawn[0], groundAt(...WORLD.spawn), WORLD.spawn[1]);
    hero.rotation.y = Math.PI;
    scene.add(hero);
  }

  // ───── State · Controls
  const C = { vy: 0, grounded: true, sprinting: false, phase: 0, yaw: Math.PI, locked: true, started: false, lastStep: 0 };
  const Rx = new T.Vector3(...CAM.start), Lx = new T.Vector3(), Ix = new T.Vector3();
  // The original doesn’t lower the camera below ground height 0 — here the lowest landing pad is that floor
  const camTarget = () => Ix.set(hero.position.x, Math.max(hero.position.y, LANDING.y), hero.position.z).add(Rx);
  Lx.copy(camTarget());

  MF.on("jump", () => { if (C.locked || !C.grounded) return; C.vy = MOVE.jump; C.grounded = false; });
  MF.on("sprint", (v) => (C.sprinting = v));
  let active = null;
  const activate = () => {
    if (!active || C.locked) return;
    const href = active.kind === "portal" ? WORLD.projects[portal.selected]?.href : active.href;
    const label = active.kind === "portal" ? (portal.selected === null ? "Step on a pad first to pick a project" : WORLD.projects[portal.selected].label) : active.label;
    if (href && href !== "#") {
      if (href.startsWith("mailto:")) location.href = href; else open(href, "_blank", "noopener,noreferrer");
    } else toast(`${label} — Enter your address here`);
  };
  MF.on("activate", activate);
  const ray = new T.Raycaster(), ptr = new T.Vector2();
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (!active?.ind) return;
    ptr.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    if (ray.intersectObject(active.ind.tile).length || touch) activate();
  });
  if (!touch && !state.reduce) addEventListener("mousemove", (e) => { Rx.x = ((e.clientX / innerWidth) * 2 - 1) * CAM.parallax; });

  const inputDir = () => {
    if (C.locked) return null;
    if (joy.angle !== undefined) return [Math.cos(joy.angle), -Math.sin(joy.angle)];
    const x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), z = (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0);
    if (!x && !z) return null;
    const l = Math.hypot(x, z);
    return [x / l, z / l];
  };
  const canStand = (x, z, sx, sz) => {
    const g = groundAt(x, z), gp = groundAt(x + sx * MOVE.radius, z + sz * MOVE.radius);
    if (g === null || gp === null) return false;
    if (g - hero.position.y > MOVE.step) return false;
    if (Math.max(hero.position.y, g) < 0.6 && hero.position.y > -0.2 && z > 3.7 && z < 4.15 && Math.abs(x) > FRONT_STAIRS.x) return false;
    return !blocked(x, z, Math.max(hero.position.y, g));
  };

  const update = (dt, t) => {
    const p = hero.position;
    const dir = inputDir();
    const speed = C.sprinting ? MOVE.sprint : MOVE.speed;
    if (dir) {
      const [dx, dz] = dir, nx = p.x + dx * speed * dt, nz = p.z + dz * speed * dt;
      if (canStand(nx, nz, dx, dz)) { p.x = nx; p.z = nz; }
      else if (dx && canStand(nx, p.z, Math.sign(dx), 0)) p.x = nx;
      else if (dz && canStand(p.x, nz, 0, Math.sign(dz))) p.z = nz;
      const target = Math.atan2(dx, dz);
      let d = target - C.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      C.yaw += clamp(d, -MOVE.turn * dt, MOVE.turn * dt);
      hero.rotation.y = C.yaw;
    }
    const g = groundAt(p.x, p.z) ?? p.y;
    if (C.grounded && g < p.y && p.y - g < 0.6) p.y = g;
    else if (g < p.y) C.grounded = false;
    if (!C.grounded) {
      C.vy += MOVE.gravity * dt;
      p.y += C.vy * dt;
      if (p.y <= g) { p.y = g; C.vy = 0; C.grounded = true; }
    } else if (g > p.y) p.y = g;

    // Running: leg and arm swing plus running sound (repeats only while moving on the ground, as in the original), and idle breathing when stopped
    const moving = !!dir;
    sound.run(moving && C.grounded);
    if (moving && C.grounded) C.phase += dt * (C.sprinting ? 15 : 11.5);
    sound.portalAt(p.distanceTo(tmpV.set(...WORLD.portal.at)));
    const swing = moving && C.grounded ? Math.sin(C.phase) * (C.sprinting ? 0.9 : 0.7) : 0;
    const k = 1 - Math.exp(-14 * dt);
    limbs.legL.rotation.x += (swing - limbs.legL.rotation.x) * k;
    limbs.legR.rotation.x += (-swing - limbs.legR.rotation.x) * k;
    limbs.armL.rotation.x += (-swing * 0.8 - limbs.armL.rotation.x) * k;
    limbs.armR.rotation.x += ((C.grounded ? swing * 0.8 : -1.2) - limbs.armR.rotation.x) * k;
    if (!C.grounded) { limbs.legL.rotation.x += (0.7 - limbs.legL.rotation.x) * k; limbs.legR.rotation.x += (-0.3 - limbs.legR.rotation.x) * k; }
    limbs.body.scale.y = moving ? 1 : 1 + Math.sin(t * 2.2) * 0.025;
    hero.children.forEach((c) => { if (c !== limbs.legL && c !== limbs.legR) c.position.y = (c.userData.y0 ??= c.position.y) + (moving && C.grounded ? Math.abs(Math.sin(C.phase)) * 0.05 : 0); });

    // Stepping spots (link signs, footholds, portals)
    let now = null;
    for (const s of sensors) if (Math.hypot(p.x - s.x, p.z - s.z) < s.r && Math.abs(p.y - s.y) < 1.2) { now = s; break; }
    if (now !== active) {
      active?.ind?.tl.reverse();
      active = now;
      if (active?.ind) active.ind.tl.play();
      if (active?.kind === "plate") selectProject(active);
    }

    // Camera: follows character + offset with 1-exp(-5dt). Tilt fixed at -π/8
    Lx.lerp(camTarget(), 1 - Math.exp(-CAM.follow * dt));
    camera.position.copy(Lx);
    moon.position.set(p.x - 8, Math.max(p.y, 0) + 20, p.z + 10);
    moon.target.position.set(p.x, Math.max(p.y, 0), p.z);

    for (const L of lanterns) {
      const f = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(t * 13 + L.seed)) * (0.5 + 0.5 * Math.sin(t * 7.3 + L.seed * 2));
      if (L.light) L.light.intensity = 7 * f;
      L.halo.material.opacity = 0.55 * f;
    }
    forgeLight.intensity = 14 * (0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 5.7 + 1));
    // For the first few seconds of entering, the island is seen through sky-blue mist, and once the camera comes close to the character only night mist remains
    const haze = clamp((camera.position.distanceTo(hero.position) - 10) / 20, 0, 1);
    const hz = haze * haze * (3 - 2 * haze);
    scene.fog.density = 0.012 + hz * 0.05;
    scene.fog.color.lerpColors(NIGHT_FOG, sky.material.uniforms.uHazeColor.value, hz);
    sky.material.uniforms.uHaze.value = hz;
    for (const c of clouds) {
      const d = c.position.distanceTo(camera.position);
      c.material.opacity = c.userData.op * clamp((d - 3) / 7, 0, 1);
    }
    if (portal.swirl) portal.swirl.material.uniforms.uTime.value = t;
    if (sparks.material.opacity > 0) {
      for (let i = 0; i < sparkN; i++) {
        const v = sparkVel[i];
        v[1] += MOVE.gravity * 0.3 * dt;
        sparkPos[i * 3] += v[0] * dt; sparkPos[i * 3 + 1] += v[1] * dt; sparkPos[i * 3 + 2] += v[2] * dt;
      }
      sparkGeo.attributes.position.needsUpdate = true;
    }
    sleeper.scale.y = 1 + Math.sin(t * 1.3) * 0.04;
    irisMat.uniforms.uTime.value = t;
  };

  // Hammering: the original strikes the anvil every 2 seconds (4 seconds with reduced motion) with sparks and sound (within distance 17, min(1/distance, .2))
  const strike = () => {
    gsap.timeline()
      .to(hammer.rotation, { x: 0.25, duration: 0.15, ease: "power2.in" })
      .add(() => {
        for (let i = 0; i < sparkN; i++) {
          sparkPos.set([-5.8, 0.95, -10.4], i * 3);
          sparkVel[i] = [rr(-1.6, 1.6), rr(1.5, 3.5), rr(-1.6, 1.6)];
        }
        gsap.fromTo(sparks.material, { opacity: 1 }, { opacity: 0, duration: 0.5, delay: 0.1, ease: "linear" });
        if (C.started) {
          const d = hero.position.distanceTo(tmpV.set(...HAMMER.at));
          sound.hammer(d);
        }
      })
      .to(hammer.rotation, { x: -0.9, duration: 0.5, ease: "power1.out" });
    gsap.delayedCall(HAMMER.every(), strike);
  };

  // ───── Door (loader → droplet → enter)
  const loaderEl = document.querySelector(".mf-loader");
  const gate = document.querySelector(".mf-gate");
  const enterBtn = document.querySelector(".mf-enter");
  const soundBtn = MF.soundButton;
  const iris = irisMat.uniforms.uProgress;
  let hoverTw = null;

  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
    state.reduce = true;
    return () => (state.reduce = false);
  });

  const unlock = () => {
    C.locked = false;
    if (touch) joy.el?.classList.add("is-visible");
  };
  const enter = () => {
    hoverTw?.kill();
    C.started = true;
    gate.style.pointerEvents = "none";
    sound.start();
    // The original tweens a style object, not an element — the inline opacity is empty so the start value reads as 0 and it vanishes on the very first frame (confirmed by measuring: 91ms)
    gsap.to(gate.style, { opacity: 0, duration: 0.5 });
    gsap.to(iris, { value: IRIS.open, duration: state.reduce ? 1 : 5, ease: "expo.out", overwrite: true });
    if (state.reduce) { Rx.set(CAM.end.x, CAM.end.y, CAM.end.z); Lx.copy(camTarget()); unlock(); }
    else {
      gsap.to(Rx, { ...CAM.end, duration: CAM.intro, ease: "power3.out" });
      gsap.delayedCall(CAM.unlock, unlock);
    }
    soundBtn.classList.add("is-on");
    gsap.to(soundBtn.style, { opacity: 0.9, duration: 0.5, delay: 3 });
  };
  enterBtn.addEventListener("click", enter);
  enterBtn.addEventListener("mouseenter", () => { hoverTw?.kill(); hoverTw = gsap.to(iris, { value: IRIS.hover, duration: 0.5, ease: "power2.out" }); });
  enterBtn.addEventListener("mouseleave", () => hoverTw?.reverse());

  // The original loader shows progress (Math.ceil) of downloading models and textures. With no files to download, the same count-up runs while fonts and the scene are being built.
  const count = { v: 0 };
  const counted = gsap.to(count, { v: 100, duration: skipGate ? 0 : 1.2, ease: "power1.out", onUpdate: () => (loaderEl.textContent = Math.ceil(count.v)) });

  fontReady.then(() => {
    buildSigns();
    buildLinks();
    buildPortal();
    bake(["grass", "stone"]);
    strike();
    return counted.then();
  }).then(() => {
    loaderEl.parentElement.classList.add("is-done");
    loaderEl.classList.add("is-done");
    if (skipGate) {
      C.started = true;
      gate.classList.add("is-hidden");
      iris.value = IRIS.open;
      Rx.set(CAM.end.x, CAM.end.y, CAM.end.z);
      Lx.copy(camTarget());
      unlock();
      soundBtn.classList.add("is-on");
      soundBtn.style.opacity = 0.9;
      return;
    }
    gate.hidden = false;
    enterBtn.classList.add("is-ready");
    if (state.reduce) iris.value = IRIS.idle;
    else gsap.to(iris, { value: IRIS.idle, duration: 1, ease: "circ.out" });
  });

  const timer = new T.Timer();
  timer.connect(document);
  renderer.setAnimationLoop((now) => {
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 1 / 20);
    update(dt, timer.getElapsed());
    draw();
  });
})();
