// 3D meadow first page. Doesn’t use the original’s models (glb), textures or font files, and gets the same composition, camera and motion from basic shapes and canvas drawings.
// Order: dandelion (press and the seeds scatter) → 3D name letters hung on seed parachutes fly in and land on a floating island → into the clouds → campfire camp.
// Values: 105s per day (original Op), sky, fog and grass color keyframes use the original Ts values, seed 1.6s, dandelion .9s, letter landing 1.1s, world entry 1.8s (original duration list).
(() => {
  const T = window.THREE;
  const body = document.body;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  // Lilita One has no Korean glyphs, so the name letter placeholder uses Latin capitals. Same 10 letters as the original name text.
  const WORDMARK = "SAMPLENAME";

  // ── Meadow colors made from the Skin ──
  // Paints the background color (--kf-accent, --site-* in shared.css) onto a canvas and reads it as sRGB (since the computed value comes out as oklch text),
  // Prop·sky·grass colors are written from that background in oklch as lightness l times · chroma c times · hue h added — the original skin yields the original values as they are, and switching skins brings the meadow tone along.
  const BASE = {
    accent: "--kf-accent", skyTop: "--site-sky-top", skyLow: "--site-sky-low", grass: "--site-grass", grassDeep: "--site-grass-deep",
    fog: "--site-fog", sun: "--site-sun", bark: "--site-bark", fire: "--site-fire", water: "--site-water", petal: "--site-petal",
    paper: "--site-paper", charcoal: "--site-charcoal", honey: "--site-honey", night: "--site-night", dusk: "--site-dusk", stone: "--site-stone",
  };
  const lch = (() => {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const el = document.body.appendChild(document.createElement("i"));
    const lin = (x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
    const out = {};
    for (const k in BASE) {
      el.style.color = `var(${BASE[k]})`;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = getComputedStyle(el).color;
      ctx.fillRect(0, 0, 1, 1);
      const [R, G, B] = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((x) => lin(x / 255));
      const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
      const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
      const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
      const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
      out[k] = [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(a, b), (Math.atan2(b, a) * 180) / Math.PI];
    }
    el.remove();
    return out;
  })();
  const gam = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  const toneRGB = (k, lr = 1, cr = 1, dh = 0) => {
    const [L0, C0, H0] = lch[k], L = L0 * lr, Cc = C0 * cr, h = ((H0 + dh) * Math.PI) / 180, a = Cc * Math.cos(h), b = Cc * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
      .map((x) => Math.round(255 * Math.min(1, Math.max(0, gam(x)))));
  };
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  // The name font is preloaded from the first family name of the skin’s --kf-font-wordmark (or the heading font if absent)
  const WORD_FONT = cssVar("--kf-font-wordmark") || cssVar("--kf-font-display");
  const tone = (k, lr, cr, dh, alpha = 1) => {
    const [r, g, b] = toneRGB(k, lr, cr, dh);
    return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
  };

  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const range = (a, b) => a + (b - a) * rnd();
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const canvasTex = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };

  const renderer = new T.WebGLRenderer({ canvas: document.querySelector(".mw-gl"), antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.autoClear = true;
  // Like the original, the scene is drawn into a buffer, then bloom, brightness contrast, saturation and vignette are applied, and tone mapping comes last (post.js)
  const post = window.MeadowPost(T, renderer);
  post.setAoTint(new T.Color(tone("charcoal", 0.93, 2.5, 5)));

  const opScene = new T.Scene();
  const opCam = new T.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 600);
  const wScene = new T.Scene();
  const wCam = new T.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 600);
  let quality = 3;
  const resize = () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 3 ? 2 : quality === 2 ? 1.5 : 1));
    renderer.setSize(innerWidth, innerHeight, false);
    post.setSize(innerWidth * renderer.getPixelRatio(), innerHeight * renderer.getPixelRatio());
    for (const c of [opCam, wCam]) { c.aspect = innerWidth / innerHeight; c.updateProjectionMatrix(); }
    // On portrait screens, widen the field of view so the same horizontal width fits as in the original
    opCam.fov = innerWidth < innerHeight ? 58 : 40;
    wCam.fov = innerWidth < innerHeight ? 66 : 55;
    opCam.updateProjectionMatrix(); wCam.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

  // ---------- Shared materials ----------
  function makeSky() {
    const mat = new T.ShaderMaterial({
      uniforms: { top: { value: new T.Color() }, bottom: { value: new T.Color() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp((vP.y + 0.06) * 1.5, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.75)), 1.0); \n#include <colorspace_fragment>\n }",
      side: T.BackSide, depthWrite: false, fog: false,
    });
    const m = new T.Mesh(new T.SphereGeometry(300, 32, 16), mat);
    m.renderOrder = -10;
    m.frustumCulled = false;
    return m;
  }

  const softTex = canvasTex(128, 128, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.4, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: white alpha mask — the material color is multiplied */
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
  const cloudTex = canvasTex(256, 128, (g, w, h) => {
    for (let i = 0; i < 26; i++) {
      const x = range(w * 0.15, w * 0.85), y = range(h * 0.35, h * 0.7), r = range(18, 46);
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: white alpha mask — the material color is multiplied */
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
  const leafTex = canvasTex(64, 64, (g) => {
    g.fillStyle = "#fff"; /* Not skin: white alpha mask — multiplied by the leaf material color */
    for (const [x, y, a, s] of [[22, 30, -0.6, 1], [42, 24, 0.5, 0.85], [34, 44, 0.1, 0.9]]) {
      g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
      g.beginPath(); g.moveTo(0, -15); g.quadraticCurveTo(10, -4, 0, 14); g.quadraticCurveTo(-10, -4, 0, -15); g.fill();
      g.restore();
    }
  });
  const turfTex = canvasTex(128, 128, (g, w) => {
    g.fillStyle = tone("grass", 1, 1, 0); g.fillRect(0, 0, w, w);
    const cols = [tone("accent", 0.946, 0.8392, -20.2657), tone("grass", 1.1, 1.0546, -1.1308), tone("honey", 0.9724, 0.9047, 33.6167), tone("grass", 0.9381, 0.9852, 1.0725), tone("accent", 0.8548, 0.774, -18.8823)];
    for (let i = 0; i < 520; i++) {
      const x = rnd() * w, y = rnd() * w, l = range(5, 13);
      g.strokeStyle = cols[i % cols.length]; g.lineWidth = range(1.2, 2.4);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + range(-2, 2), y - l); g.stroke();
    }
  });
  turfTex.wrapS = turfTex.wrapT = T.RepeatWrapping;
  turfTex.repeat.set(1.6, 1.6);

  // Grass: each blade is a five-point shape, the tips sway in the wind and are pushed flat near the character
  const bladeGeo = (() => {
    const g = new T.BufferGeometry();
    const w = 0.055;
    g.setAttribute("position", new T.Float32BufferAttribute([-w, 0, 0, w, 0, 0, -w * 0.62, 0.5, 0, w * 0.62, 0.5, 0, 0, 1, 0], 3));
    g.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
    return g;
  })();
  function grassMaterial() {
    return new T.ShaderMaterial({
      side: T.DoubleSide,
      uniforms: {
        uTime: { value: 0 }, uWind: { value: 1 },
        uBase: { value: new T.Color(tone("grassDeep", 1, 1, 0)) }, uTop: { value: new T.Color(tone("grass", 1.0637, 0.7468, 0.1112)) },
        uFog: { value: new T.Color(tone("fog", 1, 1, 0)) }, uFogNear: { value: 24 }, uFogFar: { value: 80 },
        uLight: { value: 1 }, uPlayer: { value: new T.Vector3(0, -99, 0) }, uGust: { value: 0 }, uGustX: { value: 0 },
      },
      // Opening breeze (original breeze): a band of strength uGust crosses the island along uGustX, bending the grass
      vertexShader: `
        uniform float uTime; uniform float uWind; uniform vec3 uPlayer; uniform float uGust; uniform float uGustX;
        varying float vH; varying float vDist; varying float vRnd;
        void main(){
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          float h = position.y;
          float ph = wp.x * 0.35 + wp.z * 0.27;
          float sway = sin(uTime * 1.6 + ph) * 0.12 + sin(uTime * 3.1 + ph * 1.7) * 0.04;
          wp.x += sway * h * h * uWind; wp.z += sway * 0.6 * h * h * uWind;
          float gust = uGust * exp(-pow((wp.x - uGustX) / 1.6, 2.0)) * h * h;
          wp.x += gust * 0.32; wp.y -= gust * 0.08;
          vec2 d = wp.xz - uPlayer.xz; float dl = length(d);
          float push = (1.0 - smoothstep(0.2, 1.3, dl)) * h * h;
          wp.xz += normalize(d + 0.0001) * push * 0.45; wp.y -= push * 0.25;
          vH = h;
          vRnd = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
          vec4 mv = viewMatrix * wp; vDist = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uBase; uniform vec3 uTop; uniform vec3 uFog; uniform float uFogNear; uniform float uFogFar; uniform float uLight;
        varying float vH; varying float vDist; varying float vRnd;
        void main(){
          vec3 c = mix(uBase, uTop * vec3(0.8, 1.05, 0.5), vH) * (0.9 + vRnd * 0.35) * uLight * 1.15;
          c = mix(c, uFog, smoothstep(uFogNear, uFogFar, vDist));
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
  }
  function makeGrass(count, mat, place) {
    const mesh = new T.InstancedMesh(bladeGeo, mat, count);
    const o = new T.Object3D();
    for (let i = 0; i < count; i++) {
      const [x, y, z, s] = place(i);
      o.position.set(x, y, z);
      o.rotation.set(range(-0.18, 0.18), rnd() * Math.PI, range(-0.18, 0.18));
      const hgt = range(0.45, 0.95) * s;
      o.scale.set(range(1, 1.7) * s, hgt, 1);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.frustumCulled = false;
    return mesh;
  }

  // Tree: trunk + branches + leaf clusters (hundreds of small leaf images shaped into a sphere)
  function makeTree({ height = 4, spread = 1.6, colors, birch = false, leaves = 900, clusters = 6 }) {
    const g = new T.Group();
    const barkMat = new T.MeshStandardMaterial({ color: birch ? tone("fog", 1.0174, 1.0499, -71.2015) : tone("bark", 0.9753, 1.1175, -2.5199), roughness: 0.9 });
    const trunk = new T.Mesh(new T.CylinderGeometry(0.1, 0.2, height, 7), barkMat);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const b = new T.Mesh(new T.CylinderGeometry(0.04, 0.08, height * 0.42, 5), barkMat);
      const a = (i / 3) * Math.PI * 2 + range(-0.4, 0.4);
      b.position.set(Math.cos(a) * 0.35, height * (0.62 + i * 0.08), Math.sin(a) * 0.35);
      b.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
      b.castShadow = true;
      g.add(b);
    }
    const leafMat = new T.MeshLambertMaterial({ map: leafTex, alphaTest: 0.45, side: T.DoubleSide, emissive: tone("bark", 0.9695, 0.4342, 12.2079) });
    const mesh = new T.InstancedMesh(new T.PlaneGeometry(0.5, 0.5), leafMat, leaves);
    const centers = Array.from({ length: clusters }, () => new T.Vector3(range(-spread, spread), height + range(-0.4, 1.3), range(-spread, spread) * 0.8));
    const o = new T.Object3D(), col = new T.Color();
    for (let i = 0; i < leaves; i++) {
      const c = centers[i % clusters];
      const r = Math.pow(rnd(), 0.35) * (0.75 + spread * 0.35);
      const th = rnd() * Math.PI * 2, ph = Math.acos(range(-0.6, 1));
      o.position.set(c.x + r * Math.sin(ph) * Math.cos(th), c.y + r * Math.cos(ph) * 0.8, c.z + r * Math.sin(ph) * Math.sin(th));
      o.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
      o.scale.setScalar(range(0.8, 1.3));
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      col.set(colors[Math.floor(rnd() * colors.length)]).offsetHSL(0, 0, range(-0.05, 0.05));
      mesh.setColorAt(i, col);
    }
    mesh.castShadow = true;
    const crown = new T.Group();
    crown.add(mesh);
    g.add(crown);
    g.userData.crown = crown;
    return g;
  }

  // One dandelion seed (origin below the body, stem along +Y, pappus fluff at the tip)
  const SEED = (() => {
    const s = [0, 0.16, 0, 0, 0.62, 0];
    const k = 18;
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2;
      s.push(0, 0.62, 0, Math.cos(a) * 0.26, 0.7, Math.sin(a) * 0.26);
      s.push(Math.cos(a) * 0.26, 0.7, Math.sin(a) * 0.26, Math.cos(a) * 0.3, 0.69, Math.sin(a) * 0.3);
    }
    return new Float32Array(s);
  })();
  const seedMat = new T.LineBasicMaterial({ color: tone("paper", 1.0295, 1.15, -6.9363), transparent: true, opacity: 0.34, depthWrite: false, toneMapped: false });
  const lonelySeed = (scale) => {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(SEED.slice(), 3));
    const l = new T.LineSegments(g, new T.LineBasicMaterial({ color: tone("paper", 1.0295, 1.15, -6.9363), transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }));
    l.scale.setScalar(scale);
    return l;
  };

  // ---------- Opening ----------
  // The original lays the boot dandelion over the 3D sky with a 2D canvas, and when it is blown, the name letters are born from a 3D point at the same screen spot (.5·.42) and fall onto a floating island.
  // The copy keeps the dandelion in 3D but puts it in a rig (bootRig) attached to the first camera (original key 0) to hold its screen position, and shrinks the island, letters and seed path by factor K from the original coordinates
  const opSky = makeSky();
  opSky.material.uniforms.top.value.set(tone("skyTop", 1, 1, 0));
  opSky.material.uniforms.bottom.value.set(tone("skyLow", 1, 1, 0));
  opScene.add(opSky);
  opScene.add(new T.HemisphereLight(tone("paper", 1.0102, 1.2412, 165.6772), tone("water", 1.0144, 0.3961, -71.675), 1.5));
  const opSun = new T.DirectionalLight(tone("sun", 1, 1, 0), 2.4);
  opSun.position.set(4, 6, 6);
  opScene.add(opSun);
  const bootRig = new T.Group(), bootInner = new T.Group();
  bootInner.position.set(0, -0.6, -9);
  bootRig.add(bootInner);
  opScene.add(bootRig);
  for (const [x, y, z, w, h, o] of [[7, 3.6, -30, 34, 14, 0.85], [-9, -2.6, -26, 15, 5, 0.75], [-1.5, -0.6, -34, 15, 4.5, 0.5], [11, -1.2, -40, 26, 9, 0.6], [-13, 6, -45, 22, 8, 0.5]]) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, transparent: true, opacity: o, depthWrite: false, fog: false }));
    s.position.set(x, y, z); s.scale.set(w, h, 1);
    bootInner.add(s);
  }

  const dandelion = new T.Group();
  dandelion.position.set(0, 1.18, 0);
  bootInner.add(dandelion);
  const flowerMats = [];
  const flowerMat = (m) => { m.transparent = true; flowerMats.push(m); return m; };
  const stemCurve = new T.CatmullRomCurve3([[0, -0.12, 0], [-0.1, -0.8, 0.04], [-0.42, -1.7, 0.02], [-0.82, -2.7, 0], [-1.08, -3.6, 0], [-1.25, -4.8, 0]].map((p) => new T.Vector3(...p)));
  dandelion.add(new T.Mesh(new T.TubeGeometry(stemCurve, 64, 0.042, 8), flowerMat(new T.MeshStandardMaterial({ color: tone("grass", 0.9848, 0.8504, 1.1205), roughness: 0.55 }))));
  const headCore = new T.Mesh(new T.IcosahedronGeometry(0.2, 2), flowerMat(new T.MeshStandardMaterial({ color: tone("stone", 0.8643, 8.8349, -31.2367), roughness: 1, flatShading: true })));
  dandelion.add(headCore);
  const bractMat = flowerMat(new T.MeshStandardMaterial({ color: tone("grass", 0.9506, 0.7908, -4.5347), roughness: 0.8 }));
  for (let i = 0; i < 10; i++) {
    const b = new T.Mesh(new T.ConeGeometry(0.035, 0.36, 5), bractMat);
    const a = (i / 10) * Math.PI * 2;
    b.position.set(Math.cos(a) * 0.12, -0.2, Math.sin(a) * 0.12);
    b.rotation.set(Math.sin(a) * 2.7, 0, -Math.cos(a) * 2.7);
    dandelion.add(b);
  }
  const glow = new T.Sprite(new T.SpriteMaterial({ map: softTex, color: tone("paper", 1.0361, 1.18, 6.759), transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false }));
  glow.scale.set(2.9, 2.9, 1);
  dandelion.add(glow);
  const fluff = new T.Sprite(new T.SpriteMaterial({ map: softTex, color: tone("sun", 1.0186, 0.6414, 6.7902), transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false }));
  fluff.scale.set(1.8, 1.8, 1);
  dandelion.add(fluff);

  const HEAD_N = 340;
  const SEG = SEED.length / 3;
  const head = { pos: [], quat: [], vel: [], spin: [], size: [], dir: [], delay: [], live: false, t: 0 };
  const headGroup = new T.Group();
  headGroup.position.copy(dandelion.position);
  bootInner.add(headGroup);
  const up = new T.Vector3(0, 1, 0), tmpM = new T.Matrix4(), tmpV = new T.Vector3();
  for (let i = 0, n = 0; n < HEAD_N; i++) {
    const y = 1 - ((i + 0.5) / (HEAD_N * 1.12)) * 2;
    if (y < -0.78) break;
    const r = Math.sqrt(1 - y * y), th = i * 2.399963;
    const dir = new T.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    head.dir.push(dir);
    head.pos.push(new T.Vector3());
    head.quat.push(new T.Quaternion().setFromUnitVectors(up, dir));
    head.vel.push(dir.clone().multiplyScalar(range(0.5, 1.2)).add(new T.Vector3(range(1.2, 2.6), range(0.4, 1.4), range(-0.5, 0.6))));
    head.spin.push(range(-1.5, 1.5));
    head.size.push(new T.Vector3().setScalar(1.45 * range(0.84, 1.08)));
    n++;
  }
  const headCount = head.pos.length;
  // Original boot: fur (seeds) fills in over the first 1.1 seconds with smooth(.05, 1.1, t) — each seed sprouts between order × .9 and .1, growing in size .55 → 1 while sprouting
  const headOrder = Float32Array.from({ length: headCount }, () => Math.random());
  const headAppear = new Float32Array(headCount).fill(1);
  const headScale = new T.Vector3();
  let furDone = false;
  const gust = { next: 2.4, bend: 0, bendVel: 0, gone: new Set() };
  // The original boot draws the seed behind the head (below depth −.25) blurred, as if the lens missed it — split by depth into three layers: sharp, middle and farthest back,
  // The center and rearmost layers sit on three layers 1·2 so post.js draws and blurs them separately
  const headParts = [0, 1, 2].map((layer) => ({ layer, idx: [] }));
  head.dir.forEach((d, i) => headParts[d.z < -0.6 ? 2 : d.z < -0.25 ? 1 : 0].idx.push(i));
  for (const part of headParts) {
    part.geo = new T.BufferGeometry();
    part.geo.setAttribute("position", new T.BufferAttribute(new Float32Array(part.idx.length * SEG * 3), 3));
    part.lines = new T.LineSegments(part.geo, seedMat);
    part.lines.layers.set(part.layer);
    part.lines.frustumCulled = false;
    headGroup.add(part.lines);
  }
  // Jitter random uses Math.random — drawing more from the seeded random (rnd) shifts the islands, trees and grass built afterward
  const quiver = new Float32Array(headCount), flutter = Float32Array.from({ length: headCount }, () => 0.6 + Math.random() * 0.8), flutterPhase = Float32Array.from({ length: headCount }, () => Math.random() * 6.28);
  const towardView = new T.Vector3(0, 0, 1), tmpQ = new T.Quaternion();
  function writeHead(shaking = false) {
    for (const part of headParts) {
      const arr = part.geo.attributes.position.array;
      part.idx.forEach((i, j) => {
        const a = headAppear[i];
        tmpM.compose(head.pos[i], shaking ? tmpQ.setFromAxisAngle(towardView, quiver[i]).multiply(head.quat[i]) : head.quat[i], headScale.copy(head.size[i]).multiplyScalar(a > 0 ? 0.55 + a * 0.45 : 1e-4));
        for (let k = 0; k < SEG; k++) {
          tmpV.set(SEED[k * 3], SEED[k * 3 + 1], SEED[k * 3 + 2]).applyMatrix4(tmpM);
          const o = (j * SEG + k) * 3;
          arr[o] = tmpV.x; arr[o + 1] = tmpV.y; arr[o + 2] = tmpV.z;
        }
      });
      part.geo.attributes.position.needsUpdate = true;
    }
  }
  writeHead();

  const drifter = lonelySeed(1.4);
  drifter.position.set(3.1, 3.1, -1.2);
  drifter.rotation.z = -0.35;
  bootInner.add(drifter);

  // Floating island: grass top + rock underside + hanging roots + pink tree. Like the original it sits below the text lines from the start (the boot camera looks up at the sky so it isn’t visible),
  // Pool radius is the original max(8.4, name width × .5 + 3) = Enlarge by 1.26 so that 9.9 scaled by K becomes 5.4. The top face is the stage origin
  const ISLE = 1.26;
  const island = new T.Group();
  island.scale.setScalar(ISLE);
  island.position.set(0, -0.25 * ISLE, 0);
  opScene.add(island);
  const dirtMat = new T.MeshStandardMaterial({ color: tone("grassDeep", 1.0665, 0.7453, -75.3789), roughness: 1, flatShading: true });
  island.add(new T.Mesh(new T.CylinderGeometry(4.3, 4.1, 0.5, 40), [dirtMat, new T.MeshStandardMaterial({ color: tone("grass", 0.9448, 0.9705, 0.4644), roughness: 1 }), dirtMat]));
  const rockGeo = new T.ConeGeometry(4.1, 2.6, 22, 3);
  rockGeo.rotateX(Math.PI);
  const rp = rockGeo.attributes.position;
  for (let i = 0; i < rp.count; i++) if (rp.getY(i) < 1.2) rp.setXYZ(i, rp.getX(i) * range(0.88, 1.08), rp.getY(i) + range(-0.15, 0.15), rp.getZ(i) * range(0.88, 1.08));
  rockGeo.computeVertexNormals();
  // In the original, the island underside gets light lifted by the cloud sea, so earth color shows from below too — it self-lights by .45 of the base color
  const rockColor = tone("bark", 1.0958, 0.8257, 18.6487);
  const rock = new T.Mesh(rockGeo, new T.MeshStandardMaterial({ color: rockColor, emissive: new T.Color(rockColor).multiplyScalar(0.45), roughness: 1, flatShading: true }));
  rock.position.y = -1.55;
  island.add(rock);
  const roots = [];
  for (let i = 0; i < 14; i++) {
    const a = rnd() * 6.28, r = range(0.6, 2.6), x = Math.cos(a) * r, z = Math.sin(a) * r, y0 = -0.4 - (1 - r / 4.1) * 2.4;
    roots.push(x, y0, z, x + range(-0.3, 0.3), y0 - range(0.6, 1.6), z + range(-0.3, 0.3));
  }
  const rootGeo = new T.BufferGeometry();
  rootGeo.setAttribute("position", new T.Float32BufferAttribute(roots, 3));
  island.add(new T.LineSegments(rootGeo, new T.LineBasicMaterial({ color: tone("charcoal", 1.1228, 3.8133, -10.9238) })));
  const islandGrassMat = grassMaterial();
  islandGrassMat.uniforms.uBase.value.set(tone("grassDeep", 1.1685, 1.8792, -14.2251)); islandGrassMat.uniforms.uTop.value.set(tone("honey", 0.9614, 1.0044, 36.5967));
  islandGrassMat.uniforms.uFog.value.set(tone("skyLow", 1, 1, 0)); islandGrassMat.uniforms.uFogFar.value = 400;
  island.add(makeGrass(3200, islandGrassMat, () => { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 4.1; return [Math.cos(a) * r, 0.25, Math.sin(a) * r, 0.42]; }));
  const isleTree = makeTree({ height: 2.6, spread: 0.9, colors: [tone("petal", 1, 1, 0), tone("petal", 1.1121, 0.8342, 4.6982), tone("petal", 0.9125, 1.078, -1.9203), tone("fire", 1.0638, 0.5096, -28.0707)], birch: true, leaves: 700, clusters: 5 });
  // Original island tree placement: bearing π × 1.14 (portrait 1.12) · .66 of the full radius (portrait .8)
  const treeAt = (portrait) => { const a = Math.PI * (portrait ? 1.12 : 1.14), r = 4.3 * (portrait ? 0.8 : 0.66); return [Math.cos(a) * r, Math.sin(a) * r]; };
  isleTree.position.set(treeAt(innerWidth < innerHeight)[0], 0.25, treeAt(innerWidth < innerHeight)[1]);
  // The original tree is about .35 of the island width tall (three letters high) — the copy’s tree shape is scaled by .65 to match
  isleTree.scale.setScalar(0.65);
  island.add(isleTree);

  // Name letters: trace the outline of text written on a canvas in Lilita One and extrude it into 3D (to avoid porting a font file to 3D)
  function glyphShapes(ch) {
    const S = 160, PX = 120, c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.font = `${PX}px ${WORD_FONT}`;
    g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillStyle = tone("night", 0, 0, 0);
    g.fillText(ch, S / 2, S * 0.8);
    const data = g.getImageData(0, 0, S, S).data;
    const on = (x, y) => (x >= 0 && y >= 0 && x < S && y < S && data[(y * S + x) * 4 + 3] > 127 ? 1 : 0);
    const adj = new Map();
    const link = (a, b) => { adj.has(a) || adj.set(a, []); adj.has(b) || adj.set(b, []); adj.get(a).push(b); adj.get(b).push(a); };
    for (let y = -1; y < S; y++) for (let x = -1; x < S; x++) {
      const k = (on(x, y) << 3) | (on(x + 1, y) << 2) | (on(x + 1, y + 1) << 1) | on(x, y + 1);
      if (k === 0 || k === 15) continue;
      const t = `${2 * x + 1},${2 * y}`, b = `${2 * x + 1},${2 * y + 2}`, l = `${2 * x},${2 * y + 1}`, r = `${2 * x + 2},${2 * y + 1}`;
      if (k === 1 || k === 14) link(l, b);
      else if (k === 2 || k === 13) link(b, r);
      else if (k === 3 || k === 12) link(l, r);
      else if (k === 4 || k === 11) link(t, r);
      else if (k === 6 || k === 9) link(t, b);
      else if (k === 7 || k === 8) link(t, l);
      else if (k === 5) { link(t, r); link(l, b); }
      else if (k === 10) { link(t, l); link(b, r); }
    }
    const seen = new Set(), loops = [];
    for (const start of adj.keys()) {
      if (seen.has(start)) continue;
      const loop = [];
      let prev = null, cur = start;
      for (;;) {
        seen.add(cur);
        const [X, Y] = cur.split(",").map(Number);
        loop.push([X / 2, Y / 2]);
        const nb = adj.get(cur), next = nb[0] !== prev ? nb[0] : nb[1];
        prev = cur; cur = next;
        if (cur === start || seen.has(cur)) break;
      }
      if (loop.length > 10) loops.push(loop);
    }
    const soften = (L) => L.map((p, i) => { const a = L[(i - 1 + L.length) % L.length], b = L[(i + 1) % L.length]; return [(a[0] + p[0] * 2 + b[0]) / 4, (a[1] + p[1] * 2 + b[1]) / 4]; });
    const clean = loops.map((L) => soften(soften(L)).filter((_, i) => i % 2 === 0));
    const inside = (p, poly) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const area = (P) => { let a = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) a += (P[j][0] - P[i][0]) * (P[j][1] + P[i][1]); return Math.abs(a / 2); };
    const depth = clean.map((L, i) => clean.reduce((n, M, j) => n + (i !== j && inside(L[0], M) ? 1 : 0), 0));
    const toV = ([x, y]) => new T.Vector2((x - S / 2) / PX, (S * 0.8 - y) / PX);
    const outers = [];
    clean.forEach((L, i) => { if (depth[i] % 2 === 0) outers.push({ L, shape: new T.Shape(L.map(toV)) }); });
    clean.forEach((L, i) => {
      if (depth[i] % 2 === 0) return;
      let best = null;
      for (const o of outers) if (inside(L[0], o.L) && (!best || area(o.L) < area(best.L))) best = o;
      best && best.shape.holes.push(new T.Path(L.map(toV)));
    });
    return outers.map((o) => o.shape);
  }

  // ---------- Opening stage: original coordinates (island = Original (−1, 34, 7.8)) scaled down by K, placing the center of the island’s top face at the origin ----------
  // K = Copy text em(.85) ÷ original text em(1.55). Original name row width 13.81 (10 Latin characters in Lilita One, letter spacing .04)
  const K = 0.85 / 1.55;
  const ORIG = { x: -1, y: 34, z: 7.8, word: 13.81 };
  const toStage = (x, y, z) => new T.Vector3((x - ORIG.x) * K, (y - ORIG.y) * K, (z - ORIG.z) * K);
  // Original opening length (main chunk): start .12 · letter i drop 1.9 + arrival order × .075 (order = i × 7 mod 10) · title .315 · breath .7 · seed ride 4.8
  const OP = { start: 0.12, fall0: 1.9, fallStep: 0.075, title: 0.315, hold: 0.7, ride: 4.8, settle: 0.62, release: 2.1, releaseAt: 0.1, grow: 0.6, sideEase: 1.7 };
  const RIDE_KEYS = [0, 1.2, 2.3, 3.2, 4.1, 4.8, 5.4, 6.4, 7.9, 9.6];
  const RIDE_END = RIDE_KEYS[RIDE_KEYS.length - 1];
  const RIDE_LETTER = 7;
  const SEEDS_PER = touch ? 2 : 3;
  const FR = (1.46 * 0.42 + 0.62) * K, MR = 1.5 * K;
  const arrival = (i) => (i * 7) % WORDMARK.length;
  const fallOf = (i) => OP.fall0 + arrival(i) * OP.fallStep;
  const lastFall = OP.fall0 + (WORDMARK.length - 1) * OP.fallStep;
  // Original vertical drop curve: the first .18 speeds up, the last .12 slows to .3 as it settles down
  const fallCurve = (t) => {
    const a = 0.18, b = 0.12, keep = 0.3, e = Math.min(1, Math.max(0, t));
    const total = 1 - a / 2 - ((1 - keep) * b) / 2;
    let n;
    if (e < a) n = (e * e) / (2 * a);
    else if (e < 1 - b) n = a / 2 + (e - a);
    else { const o = e - (1 - b); n = a / 2 + (1 - b - a) + o - ((1 - keep) * o * o) / (2 * b); }
    return n / total;
  };
  // Monotonic interpolation turning a bar time into 0–1 (the original seed-riding clock). With settle, the end slope is 0
  const monotone = (knots, settle = false) => {
    const n = knots.length, ys = knots.map((_, i) => i / (n - 1)), sl = [];
    for (let i = 0; i < n - 1; i++) sl.push((ys[i + 1] - ys[i]) / Math.max(1e-5, knots[i + 1] - knots[i]));
    const m = ys.map((_, i) => (i === 0 ? 0 : i === n - 1 ? (settle ? 0 : sl[n - 2]) : sl[i - 1] * sl[i] <= 0 ? 0 : (2 * sl[i - 1] * sl[i]) / (sl[i - 1] + sl[i])));
    return (x) => {
      if (x <= knots[0]) return 0;
      if (x >= knots[n - 1]) return 1;
      let i = 0;
      while (x > knots[i + 1]) i++;
      const h = knots[i + 1] - knots[i], t = (x - knots[i]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  };
  const rideClock = monotone(RIDE_KEYS, true), rideCamClock = monotone(RIDE_KEYS.slice(0, 6));

  const letters = [];
  const letterSide = new T.MeshStandardMaterial({ color: tone("fog", 1.0124, 4.2949, -65.6053), roughness: 0.85 });
  const letterFace = new T.MeshStandardMaterial({ color: tone("paper", 1.0438, 0, 0), map: turfTex, roughness: 1 });
  const chuteMat = seedMat.clone();
  chuteMat.opacity = 0.9;
  const threadGeo = new T.BufferGeometry();
  threadGeo.setAttribute("position", new T.BufferAttribute(new Float32Array(WORDMARK.length * SEEDS_PER * 6), 3));
  const threads = new T.LineSegments(threadGeo, new T.LineBasicMaterial({ color: tone("paper", 1.0295, 1.15, -6.9363), transparent: true, opacity: 0.55, depthWrite: false }));
  threads.frustumCulled = false;
  opScene.add(threads);
  const seeded = (n) => { let s = n; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; };
  function buildLetters() {
    [...WORDMARK].forEach((ch, i) => {
      const geo = new T.ExtrudeGeometry(glyphShapes(ch), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 2, curveSegments: 2 });
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -0.15);
      const g = new T.Group();
      g.add(new T.Mesh(geo, [letterFace, letterSide]));
      // Per-letter jitter values drawn separately like the original (sway, swing, twist, rotation, landing nod, the side the released seed leaves toward)
      const q = seeded(1000 + i * 97);
      const ph = Array.from({ length: 6 }, () => q() * Math.PI * 2);
      const P = {
        ph, drift: 3.4 * (0.88 + q() * 0.24), wobble: 0.22 + q() * 0.2, swing: 0.2 + q() * 0.12, twist: (q() - 0.5) * 1.2,
        spin: (q() < 0.5 ? -1 : 1) * (1.1 + q() * 1.3), rock: (q() < 0.5 ? -1 : 1) * (0.045 + q() * 0.04),
        release: new T.Vector3(1.4 + q() * 1.8, 3.4 + q() * 2, -(0.9 + q() * 2)),
      };
      const sq = seeded(4000 + i * 53), base = sq() * Math.PI * 2;
      const seeds = Array.from({ length: SEEDS_PER }, (_, b) => {
        const s = lonelySeed(0.48);
        s.material = chuteMat;
        s.visible = false;
        opScene.add(s);
        return {
          obj: s, angle: base + (b / SEEDS_PER) * Math.PI * 2 + (sq() - 0.5) * 0.5, lift: (b === 0 ? 0.16 : 0) + sq() * 0.12, delay: b * 0.07 + sq() * 0.05,
          spin: sq() * Math.PI * 2, spinRate: (sq() < 0.5 ? -1 : 1) * (0.6 + sq() * 0.9),
          drift: new T.Vector3((sq() - 0.5) * 1.4, (sq() - 0.5) * 1, (sq() - 0.5) * 1.4),
        };
      });
      g.userData = { width: bb.max.x - bb.min.x, height: bb.max.y - bb.min.y, P, seeds, s: { p: 0, settle: 0, release: 0 }, squash: new T.Vector3(1, 1, 1) };
      g.visible = false;
      opScene.add(g);
      letters.push(g);
    });
  }

  // Original four camera keys (progress 0 · .11 · .34 · .44) and field of view 39 · 40 · 41 · 40.5. On portrait screens, farther and higher like the original
  const opStage = {};
  function layoutStage() {
    const portrait = innerWidth < innerHeight, aspect = innerWidth / innerHeight;
    // In portrait, as in the original, set the name on two lines (first 5 letters, last 5) and measure with the wide line width 7.91
    const W = ((portrait ? 7.91 : ORIG.word) * 1.12) / Math.max(0.2, 2 * Math.tan(T.MathUtils.degToRad(21)) * aspect * 0.8);
    const q = Math.min(40, Math.max(portrait ? 15 : 11.5, W)) * (portrait ? 1.12 : 1.5);
    const fr = 1.46 * 0.42 + 0.62, J = ORIG.y, mt = ORIG.z, Mt = ORIG.x, y = 0.88;
    const P = portrait ? Math.max(4.4, q * Math.tan(T.MathUtils.degToRad(29))) : 5.4;
    const O = J + P + y, ee = J + 11.5 + 1.5 + fr, Y = Math.max(ee - 2.4, O + 0.6);
    const re = mt + q * 1.12, we = Y - 0.9, fe = mt + q * 1.08, le = ee - 3.6;
    const Me = Y + (re - mt - 1.4) * Math.tan(T.MathUtils.degToRad(15));
    opStage.keys = [
      { p: 0, pos: toStage(Mt - q * 0.34, Y, re), tgt: toStage(Mt - 1.3, Me, mt + 1.4), fov: 39 },
      { p: 0.11, pos: toStage(Mt - q * 0.2, we, fe), tgt: toStage(Mt - 0.6, le - 1.6, mt + 1.1), fov: 40 },
      { p: 0.34, pos: toStage(Mt - q * 0.09, O + 0.3, mt + q), tgt: toStage(Mt + 0.24, J + y, mt), fov: 41 },
      { p: 0.44, pos: toStage(Mt + q * 0.03, O - 0.05, mt + q * 0.91), tgt: toStage(Mt + 0.34, J + y + 0.08, mt), fov: 40.5 },
    ];
    const arcs = (curve) => { const L = curve.getLengths(300), total = Math.max(1e-5, L[300]); return [0, 1, 2, 3].map((i) => L[i * 100] / total); };
    opStage.posCurve = new T.CatmullRomCurve3(opStage.keys.map((k) => k.pos), false, "centripetal");
    opStage.tgtCurve = new T.CatmullRomCurve3(opStage.keys.map((k) => k.tgt), false, "centripetal");
    opStage.posArc = arcs(opStage.posCurve); opStage.tgtArc = arcs(opStage.tgtCurve);
    opStage.seaTop = -9 * K; opStage.seaBottom = -19 * K;
    opStage.ribbon = (portrait ? 8.4 : 7) * 0.5;
    opStage.portrait = portrait;
    // Boot frame: overlay the old boot camera (0, .6, 9 → −z) on the first camera position and direction
    const k0 = opStage.keys[0];
    bootRig.position.copy(k0.pos);
    bootRig.quaternion.setFromRotationMatrix(new T.Matrix4().lookAt(k0.pos, k0.tgt, up));
    bootRig.updateMatrixWorld(true);
    opCam.position.copy(k0.pos);
    opCam.lookAt(k0.tgt);
    opCam.updateMatrixWorld();
  }
  // Dots on the original path (original absolute coordinates) — a seed rises from the island, passes the cloud sea and lands at camp. On portrait screens the path is .7 ahead
  const rideOrig = (portrait) => {
    const R = ORIG.z + (portrait ? 4.2 : 3.5), P = new T.Vector3(2.28, 36.75, 7.99), top = 25;
    return [P, P.clone().add(new T.Vector3(0.15, 1.5, 1.6)), new T.Vector3(P.x - 0.2, 36.4, R + 2.2), new T.Vector3(P.x - 0.9, 30.8, R + 3.6),
      new T.Vector3(P.x - 2, top + 0.5, R + 3.2), new T.Vector3(P.x - 2.8, top - 7.2, R + 2), new T.Vector3(-1.8, 13.5, 8), new T.Vector3(-2.3, 4.6, 1.4),
      new T.Vector3(-1.5, 0.87, -2.9), new T.Vector3(-1.75, 0.07, -3.45)];
  };
  const ORIG_CAMP = new T.Vector3(-2.45, 0, -4.35);
  function layoutRide(hub7) {
    const pts = rideOrig(opStage.portrait).map((p) => toStage(p.x, p.y, p.z));
    const shift = hub7.clone().sub(pts[0]);
    for (let i = 0; i < 6; i++) pts[i].add(shift);
    opStage.ride = new T.CatmullRomCurve3(pts, false, "centripetal");
    const off = [[-1, 1.3, 5.2], [-1.2, 1.5, 5.2], [-0.9, 1, 5.8], [-0.6, 2.4, 4.8], [-0.4, 1.4, 4]];
    opStage.rideCam = new T.CatmullRomCurve3([opStage.keys[3].pos.clone(), ...off.map((o, i) => pts[i + 1].clone().add(new T.Vector3(...o).multiplyScalar(K)))], false, "centripetal");
    opStage.camp = toStage(ORIG_CAMP.x, 2.6, ORIG_CAMP.z);
    opStage.ridePts = pts;
  }

  // Two seed pairs (late .2·.38, circle .85·1.25, spin 1.9·4.3, speed .8·−.65, sway .3·.45) orbit by following the previous seed
  const MATES = [
    { lag: 0.2, radius: 0.85, turn: 1.9, rate: 0.8, bob: 0.3, land: [0.45, 0.25] },
    { lag: 0.38, radius: 1.25, turn: 4.3, rate: -0.65, bob: 0.45, land: [-0.3, 0.45] },
  ];
  // Where seed b sits at time R (seconds relative to seed riding) — curve is that scene’s path, s is that scene’s distance multiplier
  function ridePoint(b, R, curve, s, out) {
    const m = b > 0 ? MATES[(b - 1) % MATES.length] : null, Rb = m ? Math.max(0, R - m.lag) : R;
    curve.getPoint(rideClock(Rb), out);
    const sway = sstep(RIDE_KEYS[6], RIDE_KEYS[8], Rb) * (1 - sstep(RIDE_KEYS[8], RIDE_END, Rb));
    out.x += Math.sin(Rb * 2.1 + b * 1.7) * 0.18 * sway * s;
    out.z += Math.cos(Rb * 1.7 + b * 2.3) * 0.12 * sway * s;
    if (!m) return out;
    const J = sstep(0.4, 2.2, R), L = sstep(RIDE_KEYS[6], RIDE_END, Rb), a = m.turn + R * m.rate, r = m.radius * J * (1 - L);
    out.x += (Math.cos(a) * r + m.land[0] * L) * s;
    out.z += (Math.sin(a) * r + m.land[1] * L) * s;
    out.y += Math.sin(R * 1.3 + m.turn) * m.bob * J * (1 - L) * s;
    return out;
  }
  const rideEuler = new T.Euler(), rideTurn = new T.Quaternion();
  function rideQuat(b, R, out) {
    const P = b * 2.1, Rb = b > 0 ? Math.max(0, R - MATES[(b - 1) % MATES.length].lag) : R;
    const z = sstep(RIDE_END - 0.25, RIDE_END + 0.2, Rb), J = 1 - z;
    rideEuler.set(Math.sin(R * 1.5 + P) * 0.16 * J + (0.22 + Math.sin(R * 1.3 + P) * 0.04) * z, 0, (-0.18 + Math.sin(R * 1.1 + P * 1.7) * 0.1) * J + (Math.sin(R * 0.9 + P) * 0.05 - 0.12) * z);
    return out.setFromEuler(rideEuler).multiply(rideTurn.setFromAxisAngle(up, P + Math.min(R, RIDE_END) * (0.9 + b * 0.35)));
  }
  // Seed size (original Q0 .42 → .05, shrinks between 3.4~6.6 seconds and vanishes over .8 seconds after RIDE_END + 1.2)
  const rideScale = (R) => (0.42 + (0.05 - 0.42) * sstep(3.4, 6.6, R)) * (1 - sstep(RIDE_END + 1.2, RIDE_END + 2, R));

  // ---------- Cloud sea: six cloud layers 9~19 cells deep (original) below the island + a cloud fill covering the screen ----------
  function makeCloudSea({ top, bottom, radius, scale }) {
    const group = new T.Group(), mats = [];
    const sky = new T.Color(tone("skyLow", 1, 1, 0)), zen = new T.Color(tone("skyTop", 1, 1, 0)), sunC = new T.Color(tone("sun", 1, 1, 0)), white = new T.Color(1, 1, 1);
    // Original cloud light: sun side mixes sunlight with white .35, shade mixes horizon and zenith .3 × .86, inside mixes horizon and white .55 × .94
    // Finally pressed down by ACES, so raised by 1.9, 1.5, 1.6x to match the white clouds of the original screen
    const lit = sunC.clone().lerp(white, 0.35).multiplyScalar(1.9), shade = sky.clone().lerp(zen, 0.3).multiplyScalar(0.86 * 1.5);
    const LAYERS = 6;
    for (let i = 0; i < LAYERS; i++) {
      const f = i / (LAYERS - 1);
      const mat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, side: T.DoubleSide, fog: false,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uLit: { value: shade.clone().lerp(lit, 1 - f) }, uHaze: { value: sky.clone().lerp(white, 0.55).multiplyScalar(0.94 * 1.6) }, uScale: { value: scale }, uSeed: { value: i * 7.31 }, uRadius: { value: radius }, uDensity: { value: 0.88 - f * 0.3 } },
        vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
        fragmentShader: `uniform float uTime; uniform float uOpacity; uniform vec3 uLit; uniform vec3 uHaze; uniform float uScale; uniform float uSeed; uniform float uRadius; uniform float uDensity; varying vec3 vW;
          float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0)), f.x), f.y); }
          void main(){
            vec2 p = vW.xz / uScale * 0.09 + vec2(uTime * 0.011, uTime * 0.007) + uSeed;
            float v = n(p) * 0.5 + n(p * 2.03 + 1.7) * 0.25 + n(p * 4.1 + 3.1) * 0.125 + n(p * 8.3) * 0.0625;
            // White floor spread to the horizon like the original cloud sea: the top layer is darkest, fading with inner light (white mist) farther away, thinning only at the end
            float a = clamp(uDensity + (v - 0.5) * 1.6, 0.0, 1.0);
            float d = length(vW.xz - cameraPosition.xz);
            a *= 1.0 - smoothstep(uRadius * 0.85, uRadius, d);
            vec3 c = mix(uLit, uHaze, smoothstep(uRadius * 0.08, uRadius * 0.6, d) * 0.85);
            gl_FragColor = vec4(c, a * 0.86 * uOpacity);
            #include <colorspace_fragment>
          }`,
      });
      const m = new T.Mesh(new T.CircleGeometry(radius, 48), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.y = top + (bottom - top) * f;
      m.renderOrder = 2 + i;
      m.frustumCulled = false;
      group.add(m);
      mats.push(mat);
    }
    const inside = sky.clone().lerp(white, 0.55).multiplyScalar(0.94 * 1.6);
    const fillMat = new T.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false, fog: false,
      uniforms: { uColor: { value: inside }, uAlpha: { value: 0 } },
      vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: "uniform vec3 uColor; uniform float uAlpha; void main(){ gl_FragColor = vec4(uColor, uAlpha); \n#include <colorspace_fragment>\n }",
    });
    const fill = new T.Mesh(new T.PlaneGeometry(2, 2), fillMat);
    fill.frustumCulled = false;
    fill.renderOrder = 999;
    group.add(fill);
    // When the camera passes between the layers, it fills with the inner cloud light
    const set = ({ opacity, cloud, time, camY, camX = 0, camZ = 0 }) => {
      group.position.x = camX; group.position.z = camZ;
      mats.forEach((m) => { m.uniforms.uOpacity.value = opacity; m.uniforms.uTime.value = time; });
      const within = sstep(top + 0.4 * scale, top - 2.2 * scale, camY) * (1 - sstep(bottom + 1.5 * scale, bottom - 0.5 * scale, camY));
      fillMat.uniforms.uAlpha.value = Math.max(cloud, within * 0.88 * opacity);
      group.visible = opacity > 0.002 || cloud > 0.002;
    };
    return { group, set };
  }
  const opSea = makeCloudSea({ top: -9 * K, bottom: -19 * K, radius: 170, scale: K });
  opScene.add(opSea.group);

  // ---------- Drifting seeds: 16 scattered from the dandelion · 12 around the seed path · 20 scattered in the sky (phone 10 · 7 · 9) ----------
  const LOOSE = touch ? 26 : 48, LOOSE_BLOOM = touch ? 10 : 16;
  const loose = [];
  const looseGeo = new T.BufferGeometry();
  looseGeo.setAttribute("position", new T.BufferAttribute(new Float32Array(LOOSE * SEG * 3), 3));
  const looseLines = new T.LineSegments(looseGeo, chuteMat);
  looseLines.frustumCulled = false;
  looseLines.visible = false;
  opScene.add(looseLines);
  function layoutLoose() {
    const q = seeded(2024), k0 = opStage.keys[0];
    const view = k0.tgt.clone().sub(k0.pos).normalize(), right = new T.Vector3().crossVectors(view, up).normalize(), upv = new T.Vector3().crossVectors(right, view);
    loose.length = 0;
    for (let j = 0; j < LOOSE; j++) {
      const phase = q() * Math.PI * 2, spin = (q() - 0.5) * 2.4, scale = 0.07 + q() * 0.08;
      const wind = new T.Vector3(0.75 + q() * 0.9, (q() - 0.4) * 0.3, (q() - 0.5) * 0.3).multiplyScalar(K);
      if (j < LOOSE_BLOOM) {
        const a = q() * Math.PI * 2, d = right.clone().multiplyScalar(Math.cos(a)).addScaledVector(upv, Math.sin(a));
        const start = opStage.bloom.clone().addScaledVector(d, opStage.bloomR * (0.2 + q() * 0.5)).addScaledVector(view, (q() - 0.5) * 1.6 * K);
        const vel = d.multiplyScalar(0.9 + q() * 0.6).addScaledVector(right, 0.7 + q() * 0.6).addScaledVector(upv, 0.4 + q() * 0.5).multiplyScalar((2.2 + q() * 2.2) * K);
        loose.push({ start, vel, decay: 1.2 + q(), wind, phase, spin, scale, tumble: 1 });
        continue;
      }
      const start = j < LOOSE_BLOOM + Math.round(LOOSE * 0.26)
        ? opStage.ridePts[0].clone().lerp(opStage.ridePts[5], 0.15 + q() * 0.85).add(new T.Vector3((q() - 0.5) * 8, (q() - 0.5) * 4, (q() - 0.5) * 6).multiplyScalar(K))
        : toStage(ORIG.x + (q() - 0.62) * 24, ORIG.y + q() * 9 - 0.4, ORIG.z + (q() - 0.2) * (opStage.keys[2].pos.z / K) * 0.85);
      loose.push({ start, vel: new T.Vector3(), decay: 1, wind, phase, spin, scale, tumble: 0 });
    }
  }
  const looseEuler = new T.Euler(), looseQ = new T.Quaternion(), looseS = new T.Vector3(), looseP = new T.Vector3();
  function writeLoose(O) {
    const arr = looseGeo.attributes.position.array;
    loose.forEach((s, j) => {
      const go = (1 - Math.exp(-s.decay * O)) / s.decay;
      looseP.copy(s.start).addScaledVector(s.vel, go).addScaledVector(s.wind, O);
      looseP.x += Math.sin(O * 0.9 + s.phase) * 0.35 * K;
      looseP.y += Math.sin(O * 1.4 + s.phase * 1.3) * 0.22 * K;
      looseP.z += Math.cos(O * 0.8 + s.phase) * 0.3 * K;
      const fe = 0.22 + s.tumble * 1.3 * Math.exp(-O * 2.2);
      looseEuler.set(Math.sin(O * 1.1 + s.phase) * fe, s.phase + O * s.spin, Math.cos(O * 0.9 + s.phase * 0.7) * fe);
      tmpM.compose(looseP, looseQ.setFromEuler(looseEuler), looseS.setScalar((1.46 * s.scale * K) / 0.7));
      for (let k = 0; k < SEG; k++) {
        tmpV.set(SEED[k * 3], SEED[k * 3 + 1], SEED[k * 3 + 2]).applyMatrix4(tmpM);
        const o = (j * SEG + k) * 3;
        arr[o] = tmpV.x; arr[o + 1] = tmpV.y; arr[o + 2] = tmpV.z;
      }
    });
    looseGeo.attributes.position.needsUpdate = true;
  }
  // ---------- World: a round meadow with a campfire camp ----------
  const H = (x, z) => -0.0075 * (x * x + z * z) + 0.25 * Math.sin(x * 0.3) * Math.cos(z * 0.25) + 0.12 * Math.sin(x * 0.7 + z * 0.4);
  const PLACES = {
    works: { at: [-16, -14.5], label: "Menu 1", color: tone("fire", 0.99, 0.8158, 10.4304) },
    pond: { at: [12.2, -16], label: "Menu 2", color: tone("water", 1.0768, 0.9736, -14.9549) },
    keeper: { at: [-14.5, 9.5], label: "Menu 3", color: tone("fire", 1.0441, 0.6703, 15.5036) },
    easel: { at: [17, 11.4], label: "Menu 4", color: tone("petal", 1.0082, 1.1984, 24.4153) },
    camp: { at: [0.4, 1.6], label: "Menu 5", color: tone("honey", 1.0068, 0.681, -16.7872) },
  };
  // All paths branch off in front of the camp (0, 2.4). Follow-path goes back along the current path to the junction, then takes the destination path
  const HUB = [0, 2.4];
  const PATHS = {
    works: [HUB, [-0.6, -2], [-1.4, -6], [-6, -11], [-12, -14.5], [-16, -14.5]],
    pond: [HUB, [-0.6, -2], [2.2, -6.5], [8, -12], [12.2, -16]],
    keeper: [HUB, [-4, 5], [-10, 8], [-14.5, 9.5]],
    easel: [HUB, [3, 5], [8, 7], [12, 9], [17, 11.4]],
    camp: [HUB, [0.4, 1.6]],
    entry: [[0.2, 8], HUB],
  };
  const segDist = (px, pz, [ax, az], [bx, bz]) => {
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(px - ax - dx * t, pz - az - dz * t);
  };
  const pathDist = (x, z) => {
    let d = Infinity;
    for (const P of Object.values(PATHS)) for (let i = 0; i < P.length - 1; i++) d = Math.min(d, segDist(x, z, P[i], P[i + 1]));
    return d;
  };
  const clearing = (x, z) => Math.hypot(x - 2.6, z + 1) < 4.6;

  const wSky = makeSky();
  wScene.add(wSky);
  wScene.fog = new T.Fog(tone("fog", 1, 1, 0), 24, 80);
  const hemi = new T.HemisphereLight(tone("fog", 1.0215, 1.7061, -12.4493), tone("grassDeep", 1.0383, 0.4191, -53.2545), 1.3);
  wScene.add(hemi);
  const sun = new T.DirectionalLight(tone("sun", 1, 1, 0), 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 });
  sun.shadow.bias = -0.0006;
  wScene.add(sun, sun.target);
  const SUN_DIR = new T.Vector3(8, 9, -7).normalize();

  const terrainGeo = new T.RingGeometry(0.01, 38, 120, 44);
  terrainGeo.rotateX(-Math.PI / 2);
  const tp = terrainGeo.attributes.position;
  const terrainMask = new Float32Array(tp.count);
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i);
    tp.setY(i, H(x, z));
    terrainMask[i] = Math.max(1 - sstep(0.5, 1.1, pathDist(x, z)), clearing(x, z) ? 1 - sstep(3.6, 4.6, Math.hypot(x - 2.6, z + 1)) : 0);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.setAttribute("color", new T.BufferAttribute(new Float32Array(tp.count * 3), 3));
  const terrain = new T.Mesh(terrainGeo, new T.MeshLambertMaterial({ vertexColors: true }));
  terrain.receiveShadow = true;
  wScene.add(terrain);
  function paintTerrain(dirt, grass) {
    const c = terrainGeo.attributes.color;
    for (let i = 0; i < tp.count; i++) {
      const m = terrainMask[i];
      c.setXYZ(i, grass.r + (dirt.r - grass.r) * m, grass.g + (dirt.g - grass.g) * m, grass.b + (dirt.b - grass.b) * m);
    }
    c.needsUpdate = true;
  }

  const worldGrassMat = grassMaterial();
  const GRASS_MAX = 18000;
  const worldGrass = makeGrass(GRASS_MAX, worldGrassMat, (i) => {
    for (;;) {
      const near = i < GRASS_MAX * 0.72;
      const a = rnd() * 6.28, r = near ? Math.sqrt(rnd()) * 13 : 13 + rnd() * 19;
      const x = 1 + Math.cos(a) * r, z = Math.sin(a) * r;
      if (pathDist(x, z) < 0.75 || clearing(x, z)) continue;
      return [x, H(x, z) - 0.02, z, near ? 1.1 : 0.9];
    }
  });
  wScene.add(worldGrass);

  const std = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: 0.9, ...extra });
  const solids = [];
  const put = (obj, x, z, dy = 0) => { obj.position.set(x, H(x, z) + dy, z); wScene.add(obj); obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); solids.push(obj); return obj; };

  // Stepping stone
  const stoneMat = std(tone("fog", 0.9186, 2.4209, -68.8324));
  const stoneSpots = [];
  for (const P of [[[0.2, 8], HUB, [-0.6, -2], [-1.4, -6], [-6, -11]]]) {
    for (let i = 0; i < 4; i++) {
      const [ax, az] = P[i], [bx, bz] = P[i + 1], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 1.15);
      for (let k = 0; k < n; k++) {
        const t = k / n, x = ax + (bx - ax) * t + range(-0.25, 0.25), z = az + (bz - az) * t + range(-0.2, 0.2);
        const s = new T.Mesh(new T.CylinderGeometry(0.42, 0.46, 0.08, 10), stoneMat);
        s.scale.set(range(0.8, 1.15), 1, range(0.65, 0.9));
        s.rotation.y = rnd() * 3;
        put(s, x, z, 0.02);
        stoneSpots.push([x, z]);
      }
    }
  }

  const trees = [];
  trees.push(put(makeTree({ height: 4.6, spread: 2.1, colors: [tone("honey", 1, 1, 0), tone("honey", 1.0746, 0.8918, 4.877), tone("honey", 0.9292, 0.9469, -2.2214), tone("sun", 0.9559, 2.6089, 9.9449)], leaves: 2600, clusters: 9 }), -4.6, -1.0));
  trees.push(put(makeTree({ height: 4.4, spread: 1.5, colors: [tone("petal", 1, 1, 0), tone("petal", 1.1121, 0.8342, 4.6982), tone("petal", 0.9125, 1.078, -1.9203), tone("fire", 1.0638, 0.5096, -28.0707)], birch: true, leaves: 1800, clusters: 6 }), 1.0, -9.2));
  trees.push(put(makeTree({ height: 3.6, spread: 1.5, colors: [tone("honey", 1, 1, 0), tone("honey", 1.0746, 0.8918, 4.877), tone("honey", 0.9292, 0.9469, -2.2214)], leaves: 800, clusters: 5 }), -10, -6));
  trees.push(put(makeTree({ height: 3.8, spread: 1.3, colors: [tone("petal", 1, 1, 0), tone("petal", 1.1121, 0.8342, 4.6982), tone("fire", 1.0638, 0.5096, -28.0707)], birch: true, leaves: 700, clusters: 5 }), 9, -9));
  trees.push(put(makeTree({ height: 3.4, spread: 1.4, colors: [tone("honey", 1, 1, 0), tone("sun", 0.9559, 2.6089, 9.9449)], leaves: 700, clusters: 5 }), 10, 4));
  trees.push(put(makeTree({ height: 3.2, spread: 1.2, colors: [tone("petal", 1, 1, 0), tone("fire", 1.0638, 0.5096, -28.0707)], birch: true, leaves: 600, clusters: 4 }), -9, 6));

  // Campfire: stone ring, firewood, tripod, pot, flames, smoke, orange point light
  const fire = new T.Group();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 6.28, s = new T.Mesh(new T.DodecahedronGeometry(0.16, 0), std(tone("grassDeep", 1.0843, 0.0322, 92.7956), { flatShading: true }));
    s.position.set(Math.cos(a) * 0.6, 0.06, Math.sin(a) * 0.6);
    fire.add(s);
  }
  for (let i = 0; i < 4; i++) {
    const l = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.95, 6), std(tone("bark", 1.0822, 1.4258, 1.3646)));
    l.rotation.set(1.25, (i / 4) * Math.PI, 0);
    l.position.y = 0.16;
    fire.add(l);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 6.28 + 0.4, leg = new T.Mesh(new T.CylinderGeometry(0.025, 0.03, 1.7, 5), std(tone("bark", 1.3137, 1.7003, 3.0019)));
    leg.position.set(Math.cos(a) * 0.38, 0.78, Math.sin(a) * 0.38);
    leg.rotation.set(-Math.sin(a) * 0.24, 0, Math.cos(a) * 0.24);
    fire.add(leg);
  }
  const pot = new T.Mesh(new T.SphereGeometry(0.2, 14, 10, 0, 6.28, 0, Math.PI * 0.62), std(tone("charcoal", 0.914, 0.4204, -26.6604), { roughness: 0.6 }));
  pot.rotation.x = Math.PI;
  pot.position.y = 0.92;
  fire.add(pot);
  const flames = [];
  for (const [c, s, x, z] of [[tone("fire", 1, 1, 0), 1, 0, 0], [tone("honey", 0.9906, 0.9736, -21.5609), 0.75, 0.08, 0.05], [tone("honey", 1.0676, 0.7732, -10.735), 0.5, -0.06, -0.04]]) {
    const f = new T.Mesh(new T.ConeGeometry(0.2 * s, 0.7 * s, 8), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false }));
    f.position.set(x, 0.3 + 0.35 * s, z);
    fire.add(f);
    flames.push(f);
  }
  const fireLight = new T.PointLight(tone("fire", 1.0378, 0.8881, 2.7524), 3, 8, 1.6);
  fireLight.position.y = 0.8;
  fire.add(fireLight);
  const smoke = [];
  for (let i = 0; i < 12; i++) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: softTex, color: tone("fog", 1.0242, 0.432, -75.3226), transparent: true, opacity: 0, depthWrite: false }));
    s.userData.t = i / 12;
    fire.add(s);
    smoke.push(s);
  }
  put(fire, 1.2, 0.4);
  fireLight.castShadow = false;
  flames.forEach((f) => (f.castShadow = false));

  // Tent: triangular poles + a pole + rope
  const tent = new T.Group();
  const tri = new T.Shape([new T.Vector2(-1.7, 0), new T.Vector2(1.7, 0), new T.Vector2(0, 2.5)]);
  const tentGeo = new T.ExtrudeGeometry(tri, { depth: 3.8, bevelEnabled: false });
  tentGeo.translate(0, 0, -1.9);
  tent.add(new T.Mesh(tentGeo, std(tone("petal", 0.8866, 0.9625, 35.8935), { flatShading: true })));
  for (const z of [-1.95, 1.95]) {
    const pole = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 2.9, 6), std(tone("bark", 0.8858, 0.8308, 2.0222)));
    pole.position.set(0, 1.45, z);
    tent.add(pole);
  }
  const ropes = new T.BufferGeometry();
  ropes.setAttribute("position", new T.Float32BufferAttribute([0, 2.85, 1.95, 0, 0, 3.6, 0, 2.85, -1.95, 0, 0, -3.6, 1.6, 0.1, 1.9, 2.6, 0, 2.6, -1.6, 0.1, 1.9, -2.6, 0, 2.6], 3));
  tent.add(new T.LineSegments(ropes, new T.LineBasicMaterial({ color: tone("fog", 1.011, 1.878, -70.6703) })));
  tent.rotation.y = -0.55;
  put(tent, 5.4, 0.9);

  // Stall: four posts, slanted roof, sack
  const stall = new T.Group();
  for (const [x, z] of [[-0.9, -0.6], [0.9, -0.6], [-0.9, 0.6], [0.9, 0.6]]) {
    const p = new T.Mesh(new T.BoxGeometry(0.08, 1.8, 0.08), std(tone("bark", 0.8858, 0.8308, 2.0222)));
    p.position.set(x, 0.9, z);
    stall.add(p);
  }
  const roof = new T.Mesh(new T.BoxGeometry(2.2, 0.08, 1.6), std(tone("petal", 0.9168, 0.9766, 34.6145)));
  roof.position.y = 1.85;
  roof.rotation.x = 0.18;
  stall.add(roof);
  const shelf = new T.Mesh(new T.BoxGeometry(1.9, 0.08, 1.1), std(tone("bark", 1.217, 1.4139, 2.9322)));
  shelf.position.y = 0.6;
  stall.add(shelf);
  for (let i = 0; i < 5; i++) {
    const s = new T.Mesh(new T.SphereGeometry(0.2, 10, 8), std(i % 2 ? tone("honey", 0.934, 0.5221, -8.7655) : tone("stone", 1.0652, 9.8583, -28.569)));
    s.scale.y = 1.25;
    s.position.set(-0.7 + i * 0.35, 0.86, range(-0.2, 0.2));
    stall.add(s);
  }
  stall.rotation.y = -0.35;
  put(stall, 4.6, -3.8);

  // Lantern pillar (brightens at night)
  const lanternMat = new T.MeshStandardMaterial({ color: tone("sun", 0.9968, 1.1198, 0.4885), emissive: tone("honey", 1.0774, 0.6837, -12.4082), emissiveIntensity: 0.4 });
  for (const [x, z] of [[-2.1, -3.4], [-2.5, -6.8]]) {
    const post = new T.Group();
    const p = new T.Mesh(new T.BoxGeometry(0.14, 2.3, 0.14), std(tone("bark", 1, 1, 0)));
    p.position.y = 1.15;
    const arm = new T.Mesh(new T.BoxGeometry(0.5, 0.07, 0.07), std(tone("bark", 1, 1, 0)));
    arm.position.set(0.22, 2.1, 0);
    const lamp = new T.Mesh(new T.BoxGeometry(0.2, 0.28, 0.2), lanternMat);
    lamp.position.set(0.4, 1.85, 0);
    const cap = new T.Mesh(new T.ConeGeometry(0.17, 0.12, 4), std(tone("charcoal", 1, 1, 0)));
    cap.position.set(0.4, 2.04, 0);
    cap.rotation.y = Math.PI / 4;
    post.add(p, arm, lamp, cap);
    put(post, x, z);
  }

  // Places: three work screens, a pond, the meadow keeper’s sign and cabin, an easel
  const screenTex = (label) => canvasTex(512, 300, (g, w, h) => {
    g.fillStyle = tone("fog", 1.0158, 0.3998, -53.3849); g.fillRect(0, 0, w, h);
    g.strokeStyle = tone("fog", 0.9442, 0.5086, -53.3463); g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.fillStyle = tone("fog", 1.0158, 0.3998, -53.3849); g.fillRect(w / 2 - 170, h / 2 - 22, 340, 44);
    g.fillStyle = tone("stone", 1, 1, 0); g.font = `500 22px ${cssVar("--kf-font-mono")}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(label, w / 2, h / 2);
  });
  const screens = new T.Group();
  ["Work screen 01 · landscape 16:10", "Work screen 02 · landscape 16:10", "Work screen 03 · landscape 16:10"].forEach((label, i) => {
    const s = new T.Group();
    const face = new T.Mesh(new T.BoxGeometry(2.6, 1.6, 0.1), [std(tone("charcoal", 1, 1, 0)), std(tone("charcoal", 1, 1, 0)), std(tone("charcoal", 1, 1, 0)), std(tone("charcoal", 1, 1, 0)), new T.MeshBasicMaterial({ map: screenTex(label) }), std(tone("charcoal", 1, 1, 0))]);
    face.position.y = 2;
    const leg = new T.Mesh(new T.BoxGeometry(0.12, 1.3, 0.12), std(tone("charcoal", 1, 1, 0)));
    leg.position.y = 0.65;
    s.add(face, leg);
    s.position.set((i - 1) * 3, 0, Math.abs(i - 1) * 0.6);
    s.rotation.y = (1 - i) * 0.25;
    screens.add(s);
  });
  screens.rotation.y = Math.atan2(18, 16);
  put(screens, -19.5, -17.4);

  const pond = new T.Group();
  const water = new T.Mesh(new T.CircleGeometry(3.4, 40), new T.MeshStandardMaterial({ color: tone("water", 1, 1, 0), roughness: 0.12, metalness: 0.1 }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.12;
  pond.add(water);
  for (let i = 0; i < 18; i++) {
    const a = rnd() * 6.28, reed = new T.Mesh(new T.CylinderGeometry(0.02, 0.03, range(0.6, 1.2), 4), std(tone("accent", 0.8815, 0.6729, -23.7074)));
    reed.position.set(Math.cos(a) * range(3.1, 3.6), 0.4, Math.sin(a) * range(3.1, 3.6));
    reed.rotation.z = range(-0.2, 0.2);
    pond.add(reed);
  }
  put(pond, 15.5, -19.5, -0.05);

  const keeper = new T.Group();
  const hut = new T.Mesh(new T.BoxGeometry(2.4, 1.8, 2), std(tone("stone", 0.9158, 7.8422, -41.5587)));
  hut.position.y = 0.9;
  const hutRoof = new T.Mesh(new T.ConeGeometry(2.1, 1.3, 4), std(tone("petal", 0.9168, 0.9766, 34.6145), { flatShading: true }));
  hutRoof.position.y = 2.45;
  hutRoof.rotation.y = Math.PI / 4;
  const sign = new T.Mesh(new T.BoxGeometry(1.4, 0.6, 0.08), std(tone("fire", 0.9875, 0.4959, 23.8225)));
  sign.position.set(2.2, 1.3, 0.6);
  const signPost = new T.Mesh(new T.BoxGeometry(0.1, 1.4, 0.1), std(tone("bark", 1, 1, 0)));
  signPost.position.set(2.2, 0.7, 0.6);
  keeper.add(hut, hutRoof, sign, signPost);
  keeper.rotation.y = 2.13;
  put(keeper, -17.5, 11);

  const easel = new T.Group();
  for (const [x, rz] of [[-0.35, -0.12], [0.35, 0.12]]) {
    const l = new T.Mesh(new T.BoxGeometry(0.07, 2, 0.07), std(tone("bark", 1.3137, 1.7003, 3.0019)));
    l.position.set(x, 1, 0);
    l.rotation.z = rz;
    easel.add(l);
  }
  const board = new T.Mesh(new T.BoxGeometry(1.3, 1, 0.05), [std(tone("paper", 1, 1, 0)), std(tone("paper", 1, 1, 0)), std(tone("paper", 1, 1, 0)), std(tone("paper", 1, 1, 0)), new T.MeshBasicMaterial({ map: screenTex("Sketch · experiment screen 4:3") }), std(tone("paper", 1, 1, 0))]);
  board.position.set(0, 1.45, 0.06);
  board.rotation.x = -0.1;
  easel.add(board);
  easel.rotation.y = -2.2;
  put(easel, 19.2, 13);

  // Character: round head, black curly hair, round glasses, red clothes
  const hero = new T.Group();
  const skin = std(tone("stone", 0.9216, 10.0815, -51.149)), shirt = std(tone("petal", 0.9146, 1.3576, 19.4176)), pants = std(tone("bark", 0.9429, 0.3969, -145.2883)), hair = std(tone("charcoal", 0.7883, 0.9765, -127.1897), { flatShading: true });
  const limb = (geo, mat, x, y) => { const pivot = new T.Group(); pivot.position.set(x, y, 0); const m = new T.Mesh(geo, mat); m.position.y = -geo.parameters.length / 2 - (geo.parameters.radius || 0); pivot.add(m); hero.add(pivot); return pivot; };
  const legL = limb(new T.CapsuleGeometry(0.085, 0.3, 4, 8), pants, -0.12, 0.47);
  const legR = limb(new T.CapsuleGeometry(0.085, 0.3, 4, 8), pants, 0.12, 0.47);
  const torso = new T.Mesh(new T.CapsuleGeometry(0.25, 0.3, 4, 10), shirt);
  torso.position.y = 0.78;
  hero.add(torso);
  const armL = limb(new T.CapsuleGeometry(0.065, 0.28, 4, 8), shirt, -0.32, 0.98);
  const armR = limb(new T.CapsuleGeometry(0.065, 0.28, 4, 8), shirt, 0.32, 0.98);
  const headM = new T.Mesh(new T.SphereGeometry(0.3, 20, 16), skin);
  headM.position.y = 1.36;
  hero.add(headM);
  for (let i = 0; i < 22; i++) {
    const th = rnd() * 6.28, ph = range(0, 1.35), r = range(0.26, 0.34);
    const h = new T.Mesh(new T.IcosahedronGeometry(range(0.11, 0.17), 0), hair);
    h.position.set(Math.sin(ph) * Math.cos(th) * r, 1.46 + Math.cos(ph) * r * 0.9, Math.sin(ph) * Math.sin(th) * r - 0.04);
    hero.add(h);
  }
  const rim = std(tone("charcoal", 0.9939, 0, 0), { roughness: 0.4 });
  for (const x of [-0.11, 0.11]) {
    const ring = new T.Mesh(new T.TorusGeometry(0.075, 0.014, 6, 16), rim);
    ring.position.set(x, 1.33, 0.27);
    const eye = new T.Mesh(new T.SphereGeometry(0.025, 8, 6), std(tone("night", 0.7443, 0, 0)));
    eye.position.set(x, 1.33, 0.28);
    hero.add(ring, eye);
  }
  const nose = new T.Mesh(new T.SphereGeometry(0.045, 10, 8), std(tone("petal", 0.8781, 1.1214, 18.0216)));
  nose.position.set(0, 1.27, 0.3);
  hero.add(nose);
  const player = { pos: new T.Vector3(0.2, 0, 2.6), vy: 0, y: 0, heading: 0.35, speed: 0, walk: 0 };
  hero.rotation.y = player.heading;
  put(hero, player.pos.x, player.pos.z);

  // Night sky stars
  const starGeo = new T.BufferGeometry();
  const sp = [];
  for (let i = 0; i < 700; i++) {
    const th = rnd() * 6.28, y = range(0.08, 1);
    const r = Math.sqrt(1 - y * y);
    sp.push(Math.cos(th) * r * 250, y * 250, Math.sin(th) * r * 250);
  }
  starGeo.setAttribute("position", new T.Float32BufferAttribute(sp, 3));
  const stars = new T.Points(starGeo, new T.PointsMaterial({ color: tone("skyLow", 1.0403, 0.8038, 36.1763), size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  wScene.add(stars);

  // Rain
  const RAIN = 1600;
  const rainGeo = new T.BufferGeometry();
  const rainArr = new Float32Array(RAIN * 6);
  for (let i = 0; i < RAIN; i++) { const x = range(-14, 14), y = range(0, 16), z = range(-14, 14); rainArr.set([x, y, z, x + 0.06, y - 0.5, z], i * 6); }
  rainGeo.setAttribute("position", new T.BufferAttribute(rainArr, 3));
  const rain = new T.LineSegments(rainGeo, new T.LineBasicMaterial({ color: tone("fog", 0.9881, 1.0206, 81.0824), transparent: true, opacity: 0, fog: false, depthWrite: false }));
  rain.frustumCulled = false;
  wScene.add(rain);

  // ---------- Day cycle · weather ----------
  const KEYS = [
    { at: 0, sky: tone("skyLow", 0.915, 0.9607, -6.989), fog: tone("fog", 1, 1, 0), terrain: tone("grassDeep", 1.1482, 0.4915, -61.7611), grassBase: tone("grassDeep", 1, 1, 0), grassTop: tone("grass", 1.0637, 0.7468, 0.1112) },
    { at: 0.16, sky: tone("water", 1.0362, 0.9079, 12.3206), fog: tone("fog", 0.9743, 1.45, 16.4843), terrain: tone("grassDeep", 1.0923, 0.5776, -53.3894), grassBase: tone("grassDeep", 1.0364, 1.2299, 1.6954), grassTop: tone("grass", 1.1229, 0.9245, 1.0311) },
    { at: 0.42, sky: tone("water", 0.978, 0.9774, 17.1064), fog: tone("fog", 0.9389, 1.5823, 21.8836), terrain: tone("grassDeep", 1.0701, 0.6041, -55.0235), grassBase: tone("grassDeep", 1.0275, 1.2633, 0.0965), grassTop: tone("grass", 1.0978, 0.9238, -0.2559) },
    { at: 0.52, sky: tone("stone", 0.9489, 6.722, -135.3277), fog: tone("petal", 1.1352, 0.4791, 12.0714), terrain: tone("bark", 1.1321, 0.4839, 14.6884), grassBase: tone("grassDeep", 0.9604, 0.9183, -2.641), grassTop: tone("grass", 0.9688, 0.6361, -7.3615) },
    { at: 0.62, sky: tone("bark", 1.0485, 1.386, -136.2469), fog: tone("dusk", 0.8817, 0.5961, 21.5128), terrain: tone("bark", 1.0141, 0.2908, 98.3525), grassBase: tone("grassDeep", 0.8555, 0.8759, 1.8279), grassTop: tone("stone", 0.8577, 7.6598, 21.1621) },
    { at: 0.72, sky: tone("night", 1, 1, 0), fog: tone("charcoal", 1.2883, 7.2637, -166.7287), terrain: tone("bark", 0.9416, 0.4585, 105.113), grassBase: tone("grassDeep", 0.8494, 1.1469, -5.0247), grassTop: tone("accent", 0.9624, 0.7289, -24.5053) },
    { at: 1, sky: tone("skyLow", 0.915, 0.9607, -6.989), fog: tone("fog", 1, 1, 0), terrain: tone("grassDeep", 1.1482, 0.4915, -61.7611), grassBase: tone("grassDeep", 1, 1, 0), grassTop: tone("grass", 1.0637, 0.7468, 0.1112) },
  ].map((k) => Object.fromEntries(Object.entries(k).map(([n, v]) => [n, n === "at" ? v : new T.Color(v)])));
  const RAINY = { sky: new T.Color(tone("bark", 1.0059, 0.4322, -166.52)), fog: new T.Color(tone("stone", 0.9606, 1.7078, 120.0543)), terrain: new T.Color(tone("grassDeep", 1.0283, 0.6602, -40.1506)), grassBase: new T.Color(tone("grassDeep", 0.9772, 1.2342, -9.924)), grassTop: new T.Color(tone("grass", 1.0366, 0.7165, 1.1968)) };
  const DAY = 105;
  const pal = { sky: new T.Color(), fog: new T.Color(), terrain: new T.Color(), grassBase: new T.Color(), grassTop: new T.Color() };
  const grassGround = new T.Color();
  const nightOf = (t) => (t < 0.54 ? 0 : t < 0.62 ? sstep(0.54, 0.62, t) : t < 0.93 ? 1 : 1 - sstep(0.93, 1, t));
  const sunsetOf = (t) => sstep(0.44, 0.49, t) * (1 - sstep(0.54, 0.585, t));
  const morningOf = (t) => Math.max(sstep(0.94, 1, t), 1 - sstep(0.02, 0.13, t));
  const world = { day: 0.16, rain: 0, view: 0, ready: false };
  let paintTick = 0;
  function applyDay(dt) {
    world.day = (world.day + dt / DAY) % 1;
    const t = world.day;
    let a = KEYS[0], b = KEYS[1];
    for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i].at && t <= KEYS[i + 1].at) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    const s = sstep(a.at, b.at, t);
    for (const k in pal) pal[k].copy(a[k]).lerp(b[k], s).lerp(RAINY[k], world.rain * 0.8);
    const night = nightOf(t), dusk = sunsetOf(t);
    wSky.material.uniforms.top.value.copy(pal.sky);
    wSky.material.uniforms.bottom.value.copy(pal.fog);
    wScene.fog.color.copy(pal.fog);
    wScene.fog.near = 24 - world.rain * 10;
    wScene.fog.far = 80 - world.rain * 30;
    const light = (1 - night * 0.62) * (1 - world.rain * 0.3);
    worldGrassMat.uniforms.uBase.value.copy(pal.grassBase);
    worldGrassMat.uniforms.uTop.value.copy(pal.grassTop);
    worldGrassMat.uniforms.uFog.value.copy(pal.fog);
    worldGrassMat.uniforms.uFogNear.value = wScene.fog.near;
    worldGrassMat.uniforms.uFogFar.value = wScene.fog.far;
    worldGrassMat.uniforms.uLight.value = light;
    sun.intensity = (2.6 * (1 - night) + 0.25 * night) * (1 - world.rain * 0.55);
    sun.color.set(tone("sun", 1, 1, 0)).lerp(new T.Color(tone("honey", 1.0213, 0.7014, -31.2812)), dusk).lerp(new T.Color(tone("water", 1.0596, 1.5474, 45.1856)), night);
    hemi.intensity = (1.3 - night * 0.9) * (1 - world.rain * 0.2);
    hemi.color.set(tone("fog", 1.0215, 1.7061, -12.4493)).lerp(new T.Color(tone("dusk", 1, 1, 0)), night);
    stars.material.opacity = night * (1 - world.rain);
    lanternMat.emissiveIntensity = 0.4 + night * 2.6;
    rain.material.opacity = world.rain * 0.5;
    if (++paintTick % 20 === 1) {
      grassGround.copy(pal.grassBase).lerp(pal.terrain, 0.25);
      paintTerrain(pal.terrain, grassGround);
    }
    return night;
  }

  // ---------- Physics: kinematic character controller from the same rapier as the original ----------
  // For each prop, block every shape with a box of its own size and orientation (flat things under 25cm tall, leaves and flames are stepped over),
  // The character is a capsule of radius .35 and height 1.8, sliding along obstructions at each step. If rapier is missing or late, it walks without blocking
  const phys = { world: null, ctl: null, body: null };
  // rapier (2MB, a build embedding wasm) loads separately after the opening is painted so it doesn’t block the first paint — the original also receives the physics chunk later via import()
  // CJS build, so exports is left open and received, and re-read at init() so it isn’t removed
  const loadRapier = () => new Promise((done) => {
    if (window.RAPIER) return done(window.RAPIER);
    window.exports = {};
    const tag = document.createElement("script");
    tag.src = "../_vendor/rapier3d-compat@0.14.0/rapier.cjs.js";
    tag.onload = () => done((window.RAPIER = window.exports));
    tag.onerror = () => done(null);
    document.head.append(tag);
  });
  requestAnimationFrame(() => setTimeout(() => loadRapier().then((R) => R && R.init()).then(() => {
    const R = window.RAPIER;
    if (!R) return;
    const world = new R.World({ x: 0, y: 0, z: 0 });
    const pos = new T.Vector3(), quat = new T.Quaternion(), scl = new T.Vector3(), size = new T.Vector3(), mid = new T.Vector3();
    wScene.updateMatrixWorld(true);
    for (const prop of solids) {
      if (prop === hero || prop === pond) continue;
      prop.traverse((o) => {
        if (!o.isMesh || o.isInstancedMesh || o.material.transparent || o.material.alphaTest) return;
        o.geometry.computeBoundingBox();
        o.geometry.boundingBox.getSize(size);
        o.geometry.boundingBox.getCenter(mid);
        o.matrixWorld.decompose(pos, quat, scl);
        size.multiply(scl);
        if (size.y < 0.25 && size.x * size.z > 0) {
          const up = new T.Vector3(0, 1, 0).applyQuaternion(quat);
          if (Math.abs(up.y) > 0.7) return;
        }
        mid.applyMatrix4(o.matrixWorld);
        world.createCollider(
          R.ColliderDesc.cuboid(Math.max(0.02, size.x / 2), Math.max(0.02, size.y / 2), Math.max(0.02, size.z / 2))
            .setTranslation(mid.x, mid.y, mid.z).setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w }),
        );
      });
    }
    phys.body = world.createCollider(R.ColliderDesc.capsule(0.55, 0.35).setTranslation(player.pos.x, H(player.pos.x, player.pos.z) + 0.9, player.pos.z));
    phys.ctl = world.createCharacterController(0.02);
    phys.ctl.setSlideEnabled(true);
    world.step();
    phys.world = world;
  }), 0));
  function walkBy(dx, dz) {
    if (!phys.world) { player.pos.x += dx; player.pos.z += dz; return; }
    phys.body.setTranslation({ x: player.pos.x, y: H(player.pos.x, player.pos.z) + 0.9 + player.y, z: player.pos.z });
    phys.ctl.computeColliderMovement(phys.body, { x: dx, y: 0, z: dz });
    const m = phys.ctl.computedMovement();
    player.pos.x += m.x;
    player.pos.z += m.z;
  }

  // ---------- Sound: sound.js (synthesized with WebAudio like the original — ambient sound · birds · generative music) ----------
  // Turns on at the first press or key stroke (browser autoplay block). Phones and touch use a lighter version like the original (fewer harmonics and less reverb)
  const sound = (() => {
    const engine = window.MeadowSound.create({ lean: touch });
    const kick = () => engine.start();
    addEventListener("pointerdown", kick, { once: true });
    addEventListener("keydown", kick, { once: true });
    const pressable = 'button, [role="button"], a[href], summary';
    document.addEventListener("pointerdown", (e) => {
      if ((e.pointerType === "mouse" && e.button !== 0) || !e.target.closest?.(pressable)) return;
      setTimeout(engine.click, 0);
    }, { capture: true, passive: true });
    document.addEventListener("keydown", (e) => {
      if (!e.repeat && (e.key === "Enter" || e.key === " ") && document.activeElement?.closest?.(pressable)) engine.click();
    }, { capture: true });
    return { update: engine.update, toggle: (on) => engine.setMuted(!on), intro: engine.intro, step: engine.step };
  })();

  // ---------- Camera · motion ----------
  const keys = new Set();
  const stick = { x: 0, y: 0 };
  const cam = { yaw: 0, pitch: 0.2, dist: 4.1 };
  const follow = { place: null, route: [] };
  function routeTo(place) {
    let best = { d: Infinity };
    for (const [name, P] of Object.entries(PATHS)) P.forEach((pt, i) => {
      const d = Math.hypot(pt[0] - player.pos.x, pt[1] - player.pos.z);
      if (d < best.d) best = { d, name, i };
    });
    const back = best.name === place ? [] : PATHS[best.name].slice(1, best.i + 1).reverse();
    const out = PATHS[place].slice(best.name === place ? best.i : 1);
    return best.name === place ? out : [...back, HUB, ...out];
  }
  const camTarget = new T.Vector3(), camPos = new T.Vector3(), lookAt = new T.Vector3();

  // ---------- Cursor response ----------
  // Original takes the cursor only on mouse devices, and when a joystick is held its value replaces the cursor position (main chunk js.engaged)
  const ptr = { x: 0, y: 0, px: -1e5, py: -1e5 };
  if (!touch) addEventListener("pointermove", (e) => {
    ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = (e.clientY / innerHeight) * 2 - 1;
    ptr.px = e.clientX; ptr.py = e.clientY;
  }, { passive: true });
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  // Third-person parallax: the original looks from a camera 14.8m back with a 42° field of view, shifting the look-at point by 1.15·.7m and the camera by .45·.28m.
  // The values (.151·.094·.492·.298) are shifted so the on-screen angle matches in the copy camera (4.1m back, 50° field of view): nearby grass gets pushed more, so the response is stronger than the original,
  // Uses the .7x value, matched for intensity and settling from the cursor-sweep recording
  const SWAY = { camX: 0.106, camY: 0.066, lookX: 0.344, lookY: 0.209 };
  const aim = { x: 0, y: 0, sx: 0, sy: 0, yaw: 0, pitch: 0 };
  const swayRight = new T.Vector3(), swayUp = new T.Vector3(), swayDir = new T.Vector3();
  function updateAim(dt) {
    const held = stick.x || stick.y;
    const on = !reducedMotion.matches && (held || !touch);
    const tx = on ? (held ? stick.x : ptr.x) : 0, ty = on ? (held ? stick.y : ptr.y) : 0;
    aim.x = damp(aim.x, tx, 3.2, dt); aim.y = damp(aim.y, ty, 3.2, dt);
    aim.sx = damp(aim.sx, aim.x, 4.2, dt); aim.sy = damp(aim.sy, aim.y, 4.2, dt);
    aim.yaw = damp(aim.yaw, tx * T.MathUtils.degToRad(42), 5, dt);
    aim.pitch = damp(aim.pitch, -ty * T.MathUtils.degToRad(38), 5, dt);
  }
  let time = 0;
  function updateWorld(dt) {
    const night = applyDay(dt);
    const [pondX, pondZ] = PLACES.pond.at;
    sound.update({
      night, golden: sunsetOf(world.day), rain: world.rain,
      fireDist: Math.hypot(player.pos.x - 1.2, player.pos.z - 0.4), fireDx: 1.2 - player.pos.x,
      pondDist: Math.hypot(player.pos.x - pondX, player.pos.z - pondZ), pondDx: pondX - player.pos.x,
    });
    post.setMood({ night, golden: sunsetOf(world.day), morning: morningOf(world.day), rainy: world.rain }, dt);
    const moving = { x: (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0) + stick.x, z: (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0) + stick.y };
    let len = Math.hypot(moving.x, moving.z);
    const run = keys.has("shift");
    let dirX = 0, dirZ = 0;
    if (len > 0.1) {
      follow.place && stopFollow();
      const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
      dirX = (rx * moving.x - fx * moving.z) / Math.max(1, len);
      dirZ = (rz * moving.x - fz * moving.z) / Math.max(1, len);
      len = Math.min(1, len);
    } else if (follow.place) {
      let [tx, tz] = follow.route[0];
      let dx = tx - player.pos.x, dz = tz - player.pos.z, d = Math.hypot(dx, dz);
      while (d < (follow.route.length > 1 ? 1.4 : 0.8) && follow.route.length) {
        follow.route.shift();
        if (!follow.route.length) break;
        [tx, tz] = follow.route[0];
        dx = tx - player.pos.x; dz = tz - player.pos.z; d = Math.hypot(dx, dz);
      }
      if (!follow.route.length) arrive();
      else { dirX = dx / d; dirZ = dz / d; len = 1; }
    }
    const target = len * (run ? 6 : follow.place ? 4.2 : 3.2);
    player.speed += (target - player.speed) * Math.min(1, dt * 6);
    if (player.speed > 0.05 && (dirX || dirZ)) {
      walkBy(dirX * player.speed * dt, dirZ * player.speed * dt);
      const want = Math.atan2(dirX, dirZ);
      let d = want - player.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      player.heading += d * Math.min(1, dt * 10);
      if (follow.place) {
        let cd = Math.atan2(-dirX, -dirZ) - cam.yaw;
        cd = Math.atan2(Math.sin(cd), Math.cos(cd));
        cam.yaw += cd * Math.min(1, dt * 1.6);
      }
    }
    const r = Math.hypot(player.pos.x, player.pos.z);
    if (r > 27) player.pos.multiplyScalar(27 / r);
    player.vy -= 14 * dt;
    player.y = Math.max(0, player.y + player.vy * dt);
    if (player.y === 0) player.vy = 0;
    const ground = H(player.pos.x, player.pos.z);
    hero.position.set(player.pos.x, ground + player.y, player.pos.z);
    hero.rotation.y = player.heading;
    // Footstep floor: on stepping stones it’s stone, on road/camp dirt (within .8 of the road) it’s dirt, otherwise grass (grass is sparse at the road edge)
    const pd = pathDist(player.pos.x, player.pos.z);
    const onStone = stoneSpots.some(([sx, sz]) => Math.abs(sx - player.pos.x) < 0.45 && Math.abs(sz - player.pos.z) < 0.45);
    sound.step({
      x: player.pos.x, z: player.pos.z, moving: player.speed > 0.05 && !!(dirX || dirZ), sprinting: run, grounded: player.y === 0, speed: player.speed,
      floor: onStone ? "stone" : pd < 0.8 ? "dirt" : "grass", grassy: Math.min(1, Math.max(0.35, (pd - 0.8) / 0.6 + 0.35)),
    });
    player.walk += dt * player.speed * 3.2;
    const swing = Math.sin(player.walk) * Math.min(1, player.speed / 3) * 0.7;
    legL.rotation.x = swing; legR.rotation.x = -swing; armL.rotation.x = -swing * 0.8; armR.rotation.x = swing * 0.8;
    torso.position.y = 0.78 + Math.abs(Math.sin(player.walk)) * 0.03 * Math.min(1, player.speed) + Math.sin(time * 2) * 0.008;
    worldGrassMat.uniforms.uPlayer.value.set(player.pos.x, ground, player.pos.z);
    worldGrassMat.uniforms.uTime.value = time;

    const fwd = new T.Vector3(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw));
    camTarget.set(player.pos.x, ground + player.y + 1.25, player.pos.z);
    const third = new T.Vector3(camTarget.x - fwd.x * cam.dist * Math.cos(cam.pitch), camTarget.y + cam.dist * Math.sin(cam.pitch), camTarget.z - fwd.z * cam.dist * Math.cos(cam.pitch));
    const first = new T.Vector3(player.pos.x, ground + player.y + 1.42, player.pos.z).addScaledVector(fwd, 0.25);
    const look3 = camTarget.clone().addScaledVector(fwd, 1.5);
    updateAim(dt);
    swayDir.subVectors(look3, third).normalize();
    swayRight.crossVectors(swayDir, up).normalize();
    swayUp.crossVectors(swayRight, swayDir);
    third.addScaledVector(swayRight, aim.sx * SWAY.camX).addScaledVector(swayUp, -aim.sy * SWAY.camY);
    look3.addScaledVector(swayRight, aim.sx * SWAY.lookX).addScaledVector(swayUp, -aim.sy * SWAY.lookY);
    camPos.copy(third).lerp(first, world.view);
    const gazeYaw = cam.yaw - aim.yaw, gazeFlat = Math.cos(aim.pitch) * 6;
    const look1 = first.clone().add(new T.Vector3(-Math.sin(gazeYaw) * gazeFlat, Math.sin(aim.pitch) * 6 - 0.4 - cam.pitch + 0.36, -Math.cos(gazeYaw) * gazeFlat));
    lookAt.copy(look3).lerp(look1, world.view);
    hero.visible = world.view < 0.6;
    if (landing.on) updateLanding();
    wCam.position.copy(camPos);
    wCam.lookAt(lookAt);
    wSky.position.copy(camPos);
    stars.position.copy(camPos);
    rain.position.set(camPos.x, camPos.y - 6, camPos.z);
    if (world.rain > 0.01) {
      const p = rainGeo.attributes.position.array;
      for (let i = 0; i < RAIN; i++) {
        const o = i * 6;
        p[o + 1] -= 16 * dt; p[o + 4] -= 16 * dt;
        if (p[o + 1] < 0) { p[o + 1] += 16; p[o + 4] += 16; }
      }
      rainGeo.attributes.position.needsUpdate = true;
    }
    sun.position.copy(player.pos).addScaledVector(SUN_DIR, 30);
    sun.target.position.copy(player.pos);
    flames.forEach((f, i) => { f.scale.set(1 + Math.sin(time * 13 + i) * 0.08, 1 + Math.sin(time * 9.3 + i * 2) * 0.16, 1 + Math.cos(time * 11 + i) * 0.08); });
    fireLight.intensity = (2.4 + night * 5) * (0.9 + Math.sin(time * 17) * 0.06 + Math.sin(time * 7.3) * 0.05);
    smoke.forEach((s) => {
      s.userData.t = (s.userData.t + dt * 0.22) % 1;
      const k = s.userData.t;
      s.position.set(Math.sin(k * 6 + time) * 0.15 * k, 1.1 + k * 2.6, Math.cos(k * 5) * 0.1 * k);
      s.scale.setScalar(0.35 + k * 1.1);
      s.material.opacity = Math.sin(k * Math.PI) * 0.35 * (1 - world.rain * 0.4);
    });
    trees.forEach((t, i) => { t.userData.crown.rotation.z = Math.sin(time * 0.9 + i) * 0.015 * (1 + world.rain); t.userData.crown.rotation.x = Math.cos(time * 0.7 + i) * 0.012; });
    if (follow.place || trail.open) updateDistances();
  }

  // ---------- Opening progress ----------
  let stage = "opening";
  // Boot dandelion (original index.html boot canvas): radius R = max(62, min(width .27, height .2, 160))px. If the cursor is within 3R, it tilts away and
  // (max .045rad · damping 4, base at bottom left of the screen — copy stem tip (-1.25, -4.8)), lens bokeh shifts by tilt × R × 6px,
  // Seeds within 1.1R jitter by (1 - distance/1.1R) × .07rad (2.2 + 2 × 0.6~1.4 rad per second). After blowing, the tilt returns with the same damping
  const bokeh = document.querySelector(".mw-bokeh");
  const bctx = bokeh.getContext("2d");
  const headRest = dandelion.position.clone(), headPx = new T.Vector3(), seedPx = new T.Vector3();
  const bootR = () => Math.max(62, Math.min(innerWidth * 0.27, innerHeight * 0.2, 160));
  const toScreen = (local, out) => {
    bootInner.localToWorld(out.copy(local)).project(opCam);
    out.set((out.x + 1) * 0.5 * innerWidth, (1 - out.y) * 0.5 * innerHeight, 0);
    return out;
  };
  let bootLean = 0, shook = false, shown = 0, blownAt = -1;
  function updateBootCursor(dt) {
    const idle = body.dataset.phase === "idle" && !reducedMotion.matches;
    const W = innerWidth, R = bootR();
    toScreen(headRest, headPx);
    const cx = headPx.x, cy = headPx.y;
    const pdx = ptr.px - cx, pdy = ptr.py - cy;
    const reach = Math.hypot(pdx, pdy) / (R * 3);
    const target = idle && reach < 1 ? Math.min(1, Math.max(-1, pdx / (R * 2))) * 0.045 * (1 - reach) : 0;
    bootLean = damp(bootLean, target, 4, dt);
    const s = Math.sin(bootLean), c = Math.cos(bootLean);
    dandelion.position.x = headGroup.position.x = headRest.x + 1.25 * (c - 1) - 4.8 * s;
    headGroup.position.y = headRest.y + 1.25 * s + 4.8 * (c - 1);
    if (idle) dandelion.position.y = headGroup.position.y;
    if (!idle || head.live) return;
    let any = false;
    if (reach < 0.75) {
      const unit = Math.abs(toScreen(seedPx.set(1, 0, 0).add(headRest), seedPx).x - cx);
      for (let i = 0; i < headCount; i++) {
        seedPx.set(0, 0.9, 0).applyQuaternion(head.quat[i]);
        const d = Math.hypot(ptr.px - (cx + seedPx.x * unit), ptr.py - (cy - seedPx.y * unit));
        const near = d < R * 1.1 ? 1 - d / (R * 1.1) : 0;
        quiver[i] = near ? Math.sin(time * (2.2 + flutter[i] * 2) + flutterPhase[i]) * near * 0.07 : 0;
        any ||= near > 0;
      }
    }
    if (any || shook) writeHead(any);
    shook = any;
  }

  // Lens bokeh (original BOKEH, four of them: position in half-width and half-height units from head center, radius R times, intensity) and
  // When lit, draw 4–6 large seeds sweeping past in front of the lens on a 2D canvas (.95s — diameter grows as e^(1.1–1.8 × age) and they vanish at .4–.9s)
  const BOKEH = [{ x: -0.62, y: 0.34, r: 0.55, a: 0.16 }, { x: 0.7, y: 0.18, r: 0.42, a: 0.12 }, { x: 0.5, y: 0.58, r: 0.7, a: 0.1 }, { x: -0.3, y: 0.72, r: 0.36, a: 0.09 }];
  const [gR, gG, gB] = toneRGB("paper", 1.0361, 1.18, 6.759);
  const glint = (a) => `rgba(${gR}, ${gG}, ${gB}, ${Math.max(0, a).toFixed(3)})`;
  let bdpr = 1;
  const sizeBokeh = () => {
    bdpr = Math.min(devicePixelRatio, 2);
    bokeh.width = Math.round(innerWidth * bdpr); bokeh.height = Math.round(innerHeight * bdpr);
  };
  sizeBokeh();
  addEventListener("resize", () => { sizeBokeh(); if (body.dataset.phase === "idle") layoutStage(); });
  // Lens seed drawing: a seed with 24 hairs spread like an umbrella seen from the front, drawn small and scaled up so it blurs like the original
  const lensSprite = (() => {
    const S = 64, c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    g.translate(S / 2, S / 2);
    g.lineCap = "round";
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2 + Math.sin(k * 7.3) * 0.15, L = S * (0.36 + 0.06 * Math.sin(k * 3.1));
      g.strokeStyle = glint(0.75); g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.stroke();
      g.strokeStyle = glint(0.4); g.lineWidth = 0.5;
      for (let h = 0.3; h < 0.97; h += 0.12) {
        const px = Math.cos(a) * L * h, py = Math.sin(a) * L * h, hl = S * (0.03 + h * 0.035);
        for (const side of [-1, 1]) { g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a + side * 0.6) * hl, py + Math.sin(a + side * 0.6) * hl); g.stroke(); }
      }
    }
    g.fillStyle = glint(0.9);
    g.beginPath(); g.arc(0, 0, 1.6, 0, Math.PI * 2); g.fill();
    return c;
  })();
  const lens = [];
  const wind = { x: 0.606, y: -0.795 };
  function aimWind() {
    // Blowing via button or key sends wind from the flower’s lower left (2R·1.4R) like the original — lifted .5 more upward
    const R = bootR(), dx = 2 * R, dy = -1.4 * R, d = Math.hypot(dx, dy);
    let wx = dx / d, wy = dy / d - 0.5;
    const l = Math.hypot(wx, wy);
    wind.x = wx / l; wind.y = wy / l;
  }
  function spawnLens() {
    if (reducedMotion.matches) return;
    const R = bootR(), front = head.dir.map((d, i) => [d, i]).filter(([d]) => d.z > 0.2), count = Math.min(front.length, innerWidth < 600 ? 4 : 6);
    toScreen(headRest, headPx);
    for (let l = 0; l < count; l++) {
      const [d] = front[Math.floor(Math.random() * front.length)];
      const spread = (l / count) * Math.PI * 2 + Math.random() * 0.6, speed = (260 + Math.random() * 420) * (R / 120);
      lens.push({
        x0: headPx.x + d.x * R * 0.9, y0: headPx.y - d.y * R * 0.9, size: R * 0.55,
        vx: (Math.cos(spread) * 0.7 + wind.x * 0.9) * speed, vy: (Math.sin(spread) * 0.7 + wind.y * 0.9) * speed,
        grow: 1.1 + Math.random() * 0.7, rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 2.4, delay: 0.03 + Math.random() * 0.22,
      });
    }
  }
  const blowHead = new T.Vector3();
  function drawBoot(headFade, since) {
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, bokeh.width, bokeh.height);
    const W = innerWidth, Hh = innerHeight, R = bootR();
    toScreen(headRest, headPx);
    const alpha = headFade * sstep(0, 0.6, shown);
    if (alpha > 0) for (const b of BOKEH) {
      const bx = (headPx.x + b.x * W * 0.5 + bootLean * R * 6) * bdpr, by = (headPx.y + b.y * Hh * 0.5) * bdpr, br = b.r * R * bdpr;
      const disc = bctx.createRadialGradient(bx, by, br * 0.2, bx, by, br);
      disc.addColorStop(0, glint(b.a * 0.55 * alpha)); disc.addColorStop(0.82, glint(b.a * alpha)); disc.addColorStop(1, glint(0));
      bctx.fillStyle = disc;
      bctx.beginPath(); bctx.arc(bx, by, br, 0, Math.PI * 2); bctx.fill();
    }
    if (since < 0) return;
    // The original pins the boot canvas to the 3D flower position and drags it along — the lens seed also moves by as much as the head moved on screen
    const fx = headPx.x - blowHead.x, fy = headPx.y - blowHead.y;
    for (const s of lens) {
      const age = since - s.delay;
      if (age <= 0 || age > 0.95) continue;
      const a = 0.75 * sstep(0, 0.12, age) * (1 - sstep(0.4, 0.9, age));
      if (a <= 0.003) continue;
      const k = (Math.exp(s.grow * age) * s.size * bdpr) / lensSprite.width;
      bctx.globalAlpha = a;
      bctx.setTransform(k, 0, 0, k, (s.x0 + fx + s.vx * age) * bdpr, (s.y0 + fy + s.vy * age) * bdpr);
      bctx.rotate(s.rot + s.spin * age);
      bctx.drawImage(lensSprite, -lensSprite.width / 2, -lensSprite.height / 2);
    }
    bctx.globalAlpha = 1;
    bctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ---------- Text·seed single scene ----------
  const op = { progress: 0, seedTime: 0, ride: 0, sea: 0, cloud: 0, breeze: 0, breezeX: 0, rideStart: 0 };
  const gr = new T.Vector3(), io = new T.Vector3(), off = new T.Vector3(), tmp3 = new T.Vector3(), pivot = new T.Vector3(), tilt = new T.Vector3();
  const dq = new T.Quaternion(), jq = new T.Quaternion(), tq = new T.Quaternion(), e0 = new T.Quaternion(), sq = new T.Quaternion(), rockQ = new T.Quaternion();
  const eul = new T.Euler(), zAxis = new T.Vector3(0, 0, 1);
  function updateLetters() {
    const tArr = threadGeo.attributes.position.array;
    tArr.fill(0);
    letters.forEach((l, i) => {
      const { P, seeds, s, land, D, width, squash } = l.userData;
      if (!land) return;
      const p = s.p, lp = 1 - p, ft = p * fallOf(i);
      const side = 1 - Math.pow(1 - Math.min(1, ft / OP.sideEase), 2.4), down = fallCurve(p), grow = 0.2 + 0.8 * sstep(0, OP.grow, ft);
      gr.set(land.x + D.x * (1 - side) + Math.sin(p * 5.3 + P.ph[0]) * P.wobble * K * lp * p, land.y + D.y * (1 - down), land.z + D.z * (1 - side) + Math.cos(p * 4.1 + P.ph[1]) * P.wobble * 0.7 * K * lp * p);
      const yt = Math.pow(lp, 1.3);
      eul.set(Math.sin(p * 7.1 + P.ph[2]) * P.swing * 0.6 * yt, 0, (Math.sin(p * 8.6 + P.ph[3]) * P.swing - P.drift * 0.045) * yt);
      dq.setFromEuler(eul);
      jq.copy(dq).multiply(tq.setFromAxisAngle(up, P.twist * Math.sin(p * 3.3 + P.ph[4]) * lp * lp));
      io.set(0, -FR * grow, 0).applyQuaternion(dq).add(gr);
      l.position.copy(io).sub(tmp3.set(0, MR * grow, 0).applyQuaternion(jq));
      l.quaternion.copy(jq);
      l.scale.set(0.85 * grow * squash.x, 0.85 * grow * squash.y, 0.85 * grow * squash.z);
      if (s.settle > 0 && s.settle < 1) {
        const b = P.rock * Math.sin(s.settle * Math.PI * 2.2) * Math.pow(1 - s.settle, 1.6), half = (width * 0.85) / 2 - 0.04 * K;
        pivot.set(land.x + (b < 0 ? half : -half), 0, land.z);
        rockQ.setFromAxisAngle(zAxis, b);
        l.position.sub(pivot).applyQuaternion(rockQ).add(pivot);
        l.quaternion.premultiply(rockQ);
      }
      e0.copy(dq).multiply(tq.setFromAxisAngle(up, P.ph[5] + p * P.spin * 0.35));
      const riding = i === RIDE_LETTER && op.ride > 0;
      seeds.forEach((sd, b) => {
        const De = riding ? 0 : Math.min(1, Math.max(0, s.release * 1.18 - sd.delay));
        sd.obj.visible = l.visible && De < 1;
        if (!sd.obj.visible) return;
        off.set(Math.cos(sd.angle) * 0.32 * K, sd.lift * K, Math.sin(sd.angle) * 0.32 * K).multiplyScalar(grow).applyQuaternion(e0);
        const co = sd.obj.position.copy(gr).add(off);
        tilt.set(Math.sin(sd.angle), 0, -Math.cos(sd.angle));
        sd.obj.quaternion.copy(e0).multiply(sq.setFromAxisAngle(tilt, 0.3)).multiply(tq.setFromAxisAngle(up, sd.spin + p * sd.spinRate));
        let st = grow;
        if (riding) {
          const Ut = op.ride * OP.ride;
          ridePoint(b, Ut, opStage.ride, K, co).addScaledVector(off, 1 - sstep(0, 1.2, Ut));
          rideQuat(b, Ut, sd.obj.quaternion);
          st = rideScale(Ut) / 0.42;
        } else if (De > 0) {
          co.x += (P.release.x + sd.drift.x) * K * Math.pow(De, 1.4) + Math.sin(De * 4.2 + P.ph[0] + b) * 0.18 * K * De;
          co.y += (P.release.y + sd.drift.y) * K * Math.pow(De, 1.15) - 0.28 * K * Math.sin(Math.min(1, De / 0.22) * Math.PI);
          co.z += (P.release.z + sd.drift.z) * K * Math.pow(De, 1.3);
          eul.set(Math.sin(De * 3.1 + P.ph[2] + b) * 0.18, 0, -0.34 * Math.sin(Math.min(1, De * 1.7) * Math.PI * 0.5));
          sd.obj.quaternion.setFromEuler(eul).multiply(tq.setFromAxisAngle(up, sd.spin + P.spin * De * 1.6));
          st *= 1 - sstep(0.78, 1, De);
        }
        sd.obj.scale.setScalar(st);
        if (riding || De > 0.02) return;
        const o = (i * SEEDS_PER + b) * 6;
        tArr[o] = co.x; tArr[o + 1] = co.y; tArr[o + 2] = co.z; tArr[o + 3] = io.x; tArr[o + 4] = io.y; tArr[o + 5] = io.z;
      });
    });
    threadGeo.attributes.position.needsUpdate = true;
  }

  const camP = new T.Vector3(), camT = new T.Vector3(), seedNow = new T.Vector3(), look = new T.Vector3();
  const lerpN = (a, b, t) => a + (b - a) * t;
  function cameraAt(P) {
    const keys = opStage.keys;
    let y = keys.length - 2;
    for (let i = 0; i < keys.length - 1; i++) if (P <= keys[i + 1].p) { y = i; break; }
    const R = Math.min(1, Math.max(0, (P - keys[y].p) / Math.max(1e-5, keys[y + 1].p - keys[y].p)));
    opStage.posCurve.getPointAt(lerpN(opStage.posArc[y], opStage.posArc[y + 1], R), camP);
    opStage.tgtCurve.getPointAt(lerpN(opStage.tgtArc[y], opStage.tgtArc[y + 1], R), camT);
    return lerpN(keys[y].fov, keys[y + 1].fov, R);
  }
  function updateOpening(dt) {
    updateBootCursor(dt);
    const since = blownAt < 0 ? -1 : time - blownAt;
    shown += (1 - shown) * (1 - Math.exp(-dt * 3.2));
    // Original: flowers vanish .26~.7s after the burst (the lens seed is darkest meanwhile), and thrown seeds fade by 2.4 per second after 3.4s
    const headFade = since < 0 ? 1 : 1 - sstep(0.26, 0.7, since);
    flowerMats.forEach((m) => { m.opacity = headFade; });
    // The light of the sun shining through the fur also scales with how full it is (original ripeness = smooth(0, 1, shown))
    const ripe = sstep(0, 1, shown);
    glow.material.opacity = 0.3 * headFade * ripe; fluff.material.opacity = 0.22 * headFade * ripe;
    dandelion.visible = headFade > 0.002;
    if (!furDone) {
      const fur = reducedMotion.matches ? 1 : sstep(0.05, 1.1, time);
      for (let i = 0; i < headCount; i++) headAppear[i] = sstep(headOrder[i] * 0.9, headOrder[i] * 0.9 + 0.1, fur);
      furDone = fur >= 1;
      if (!head.live) writeHead();
    }
    // Original boot: after ready, every 2.4~4.2s a breeze pushes the stem (spring 14 · damping 3.4) and takes one front seed away at .32 strength (up to 4)
    if (pill.classList.contains("is-ready") && body.dataset.phase === "idle" && !reducedMotion.matches && time > gust.next) {
      gust.next = time + 2.4 + Math.random() * 1.8;
      gust.bendVel += (Math.random() - 0.3) * 0.035;
      if (gust.gone.size < 4) {
        const pick = head.dir.map((d, i) => i).filter((i) => head.dir[i].z > -0.2 && !gust.gone.has(i));
        if (pick.length) gust.gone.add(pick[Math.floor(Math.random() * pick.length)]);
      }
    }
    gust.bendVel += (-gust.bend * 14 - gust.bendVel * 3.4) * dt;
    gust.bend += gust.bendVel * dt;
    if (!head.live && gust.gone.size) {
      for (const i of gust.gone) {
        head.pos[i].addScaledVector(head.vel[i], dt * 0.32);
        head.quat[i].multiply(tq.setFromAxisAngle(up, head.spin[i] * dt));
      }
      writeHead();
    }
    dandelion.rotation.z = headGroup.rotation.z = Math.sin(time * 0.6) * 0.03 + bootLean + gust.bend;
    dandelion.rotation.x = headGroup.rotation.x = Math.sin(time * 0.45) * 0.02;
    drifter.position.x += dt * 0.05;
    if (body.dataset.phase === "idle") drifter.position.y = 3.1 + Math.sin(time * 0.7) * 0.12;
    drifter.rotation.z = -0.35 + Math.sin(time * 0.9) * 0.08;
    if (head.live) {
      for (let i = 0; i < headCount; i++) {
        if (since < head.delay[i]) continue;
        const v = head.vel[i];
        head.pos[i].addScaledVector(v, dt);
        v.y += 0.25 * dt;
        v.multiplyScalar(1 - 0.35 * dt);
        head.quat[i].multiply(tq.setFromAxisAngle(up, head.spin[i] * dt));
      }
      writeHead();
      seedMat.opacity = 0.34 * Math.min(1, Math.max(0, 1 - (since - 3.4) * 2.4));
      headGroup.visible = seedMat.opacity > 0.003;
    }
    if (since >= 0) {
      updateLetters();
      looseLines.visible = true;
      writeLoose(op.seedTime);
      let fov = cameraAt(op.progress);
      if (op.ride > 0) {
        const O = op.ride * OP.ride;
        opStage.rideCam.getPoint(rideCamClock(O), camP);
        opStage.ride.getPoint(rideClock(O), seedNow);
        opStage.ride.getPoint(rideClock(O + 0.4), look).lerp(seedNow, 0.55);
        look.y += 1.5 * K * sstep(1.7, 2.8, O) * (1 - sstep(3.3, 4.2, O));
        look.lerp(opStage.camp, sstep(4.25, OP.ride - 0.05, O));
        camT.lerp(look, sstep(0, 1.4, O));
        fov = lerpN(fov, 45, sstep(0.1, 2.2, O));
      }
      opCam.position.copy(camP);
      opCam.lookAt(camT);
      opCam.rotateZ(Math.sin(op.progress * Math.PI) * -0.012 + Math.sin(op.ride * Math.PI) * Math.sin(op.ride * 5.1) * 0.035 * (1 - sstep(0.75, 0.95, op.ride)));
      // The boot screen uses the copy’s field of view (58° vertical · 40° horizontal) and shifts to the original key’s field of view up to key 1 (.11)
      opCam.fov = fov * lerpN((innerWidth < innerHeight ? 58 : 40) / 39, 1, sstep(0, 0.11, op.progress));
      opCam.updateProjectionMatrix();
    } else {
      opCam.position.copy(opStage.keys[0].pos);
      opCam.lookAt(opStage.keys[0].tgt);
    }
    opSea.set({ opacity: op.sea, cloud: op.cloud, time, camY: opCam.position.y, camX: opCam.position.x, camZ: opCam.position.z });
    islandGrassMat.uniforms.uTime.value = time;
    islandGrassMat.uniforms.uGust.value = op.breeze;
    islandGrassMat.uniforms.uGustX.value = op.breezeX * K;
    isleTree.userData.crown.rotation.z = Math.sin(time * 0.9) * 0.02;
    opSky.position.copy(opCam.position);
    drawBoot(headFade, since);
  }

  gsap.ticker.add((_, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    time += dt;
    if (stage === "opening") {
      updateOpening(dt);
      post.setMood({}, dt);
      post.render(opScene, opCam, { bloom: quality > 1, ao: quality === 3, layers: headGroup.visible ? [1, 2] : null });
    } else {
      updateWorld(dt);
      post.render(wScene, wCam, { bloom: quality > 1, ao: quality === 3 });
    }
  });

  const pill = document.querySelector(".skip-opening");
  const pillCopy = pill.querySelector(".skip-opening__copy");
  const pillKey = pill.querySelector("kbd");
  const introTitle = document.querySelector(".intro-title");
  if (touch) pillKey.textContent = "Tab";
  const bootStatus = document.querySelector(".boot-status");
  let opening = null, autoBlow = 0;
  layoutStage();
  // Original boot: when drawing starts, switch to the second guide line, and when it is all built (down to the name letters) remove the guide and raise the blow button.
  // If nobody blows within 9s, it blows by itself (main chunk $B=9e3 — measured from when ready)
  requestAnimationFrame(() => bootStatus?.classList.add("is-warming"));
  function bootReady() {
    if (body.dataset.phase !== "idle") return;
    bootStatus?.classList.add("is-done");
    pill.classList.add("is-ready");
    autoBlow = setTimeout(() => body.dataset.phase === "idle" && blow(), 9000);
  }

  // Where letters settle (original: .04 between letters, hanging dot at floor 1.5 + seed row 1.23) and where they spawn from the dandelion head
  // In portrait it is two lines like the original — the first 5 characters at z −1.45, the last 5 at z 1.25 (original units)
  function placeLetters() {
    const adv = letters.map((l) => l.userData.width * 0.85 + 0.04 * K);
    const rows = opStage.portrait ? [[0, 5, -1.45 * K], [5, letters.length, 1.25 * K]] : [[0, letters.length, 0]];
    const { bloom, bloomR } = opStage;
    const widest = Math.max(...rows.map(([a, b]) => adv.slice(a, b).reduce((s, v) => s + v, 0) - 0.04 * K));
    for (const [from, to, z] of rows) {
      const total = adv.slice(from, to).reduce((s, v) => s + v, 0) - 0.04 * K;
      let x = -total / 2;
      for (let i = from; i < to; i++) {
        const l = letters[i], cx = x + (adv[i] - 0.04 * K) / 2;
        x += adv[i];
        const land = new T.Vector3(cx, MR + FR, z);
        const Rr = Math.min(1, Math.max(-1, cx / Math.max(0.001, widest / 2))), q = seeded(3000 + i * 31);
        l.userData.land = land;
        l.userData.D = new T.Vector3(
          bloom.x + Rr * bloomR * 0.55 + (q() - 0.5) * bloomR * 0.1 - land.x,
          bloom.y + bloomR * (0.12 - Rr * Rr * 0.28) + (q() - 0.5) * bloomR * 0.2 - land.y,
          bloom.z + z * 0.5 + (q() - 0.5) * 0.5 * K - land.z,
        );
      }
    }
  }
  // Original key 0: the point where the light passing through the dandelion head’s screen position from the camera meets the plane 1.2 in front of the text line — letters are born there, spread by the head’s size
  function layoutBloom() {
    opCam.position.copy(opStage.keys[0].pos);
    opCam.lookAt(opStage.keys[0].tgt);
    opCam.updateMatrixWorld();
    bootRig.scale.setScalar(1);
    bootRig.updateMatrixWorld(true);
    const dir = bootInner.localToWorld(tmp3.copy(headRest)).sub(opCam.position), headDist = dir.length();
    dir.normalize();
    const t = (1.2 * K - opCam.position.z) / Math.min(-0.001, dir.z);
    opStage.bloom = opCam.position.clone().addScaledVector(dir, t);
    // The original attaches the boot canvas at this point’s screen position and drags it along — stretches the 3D dandelion Frame relative to the camera so the head sits at this point’s depth (Hero look unchanged)
    bootRig.scale.setScalar(t / headDist);
    bootRig.updateMatrixWorld(true);
    opStage.bloomR = (bootR() / innerHeight) * 2 * t * Math.tan(T.MathUtils.degToRad(opCam.fov / 2));
  }

  function blow() {
    if (body.dataset.phase !== "idle") return;
    body.dataset.phase = "opening";
    clearTimeout(autoBlow);
    bootStatus?.classList.add("is-done");
    // Original (measured, blow = 0): the boot button leaves at .24s and a new Skip opening button enters at 1.5s (.42s). The opening timeline starts .2s later
    pill.classList.remove("is-ready");
    setTimeout(() => {
      pill.classList.add("is-skip");
      pillCopy.textContent = "Skip intro";
      pill.setAttribute("aria-label", "Skip intro");
      pillKey.textContent = touch ? "Tab" : "esc";
    }, 1500);
    blownAt = time;
    aimWind();
    // Seeds on the side the wind hits fall first, at .03 + (.5 − wind side × .5) × .42 + 0~.18 seconds
    head.delay = head.dir.map((d) => 0.03 + (0.5 - (d.x * wind.x - d.y * wind.y) * 0.5) * 0.42 + Math.random() * 0.18);
    head.live = true;
    toScreen(headRest, blowHead);
    spawnLens();
    sound.intro("dandelion-blow", { direction: 1 });
    if (!letters.length) buildLetters();
    layoutBloom();
    placeLetters();
    layoutRide(letters[RIDE_LETTER].userData.land);
    layoutLoose();
    const tl = gsap.timeline({ delay: 0.2 });
    opening = tl;
    tl.to(drifter.position, { y: 9, x: 6, duration: 1.8, ease: "sine.in" }, 0);
    letters.forEach((l, i) => {
      const s = l.userData.s, at = OP.start + fallOf(i);
      tl.set(l, { visible: true }, 0)
        .fromTo(s, { p: 0 }, { p: 1, duration: at - OP.start, ease: "none" }, OP.start)
        .to(l.userData.squash, { x: 1.025, y: 0.965, z: 1.01, duration: 0.1, ease: "power1.out" }, at)
        .to(l.userData.squash, { x: 1, y: 1, z: 1, duration: 0.34, ease: "back.out(1.8)" }, at + 0.1)
        .fromTo(s, { settle: 0 }, { settle: 1, duration: OP.settle, ease: "none" }, at);
      tl.add(() => sound.intro("letter-impact", { index: i, order: arrival(i), strength: 0.76 + (i % 4) * 0.06 }), at);
      if (i !== RIDE_LETTER) {
        tl.fromTo(s, { release: 0 }, { release: 1, duration: OP.release, ease: "none" }, at + OP.releaseAt)
          .add(() => sound.intro("seed-release", { index: i, strength: 0.7 + (i % 2 ? 0.08 : -0.08) }), at + OP.releaseAt + 0.04);
      }
    });
    const fe = OP.start + lastFall, le = fe + OP.title + OP.hold, end = le + OP.ride;
    op.rideStart = le;
    tl.fromTo(op, { breezeX: -18 }, { breezeX: 18, duration: fe + 0.6 - OP.start, ease: "none" }, OP.start)
      .to(op, { breeze: 1, duration: 0.7, ease: "sine.out" }, OP.start)
      .to(op, { breeze: 0, duration: 0.9, ease: "sine.in" }, fe - 0.2)
      .fromTo(op, { breezeX: -14 }, { breezeX: 14, duration: 1.8, ease: "none", immediateRender: false }, le)
      .to(op, { breeze: 0.55, duration: 0.5, ease: "sine.out" }, le)
      .to(op, { breeze: 0, duration: 1, ease: "sine.in" }, le + 1.1)
      .fromTo(op, { seedTime: 0 }, { seedTime: end, duration: end, ease: "none" }, 0)
      .to(op, { progress: 0.34, duration: fe, ease: "power1.inOut" }, 0)
      .to(op, { progress: 0.44, duration: OP.title + OP.hold, ease: "sine.inOut" }, fe)
      .fromTo(op, { ride: 0 }, { ride: 1, duration: OP.ride, ease: "none" }, le)
      .fromTo(op, { sea: 0 }, { sea: 1, duration: 1.6, ease: "sine.inOut" }, 0)
      .fromTo(op, { cloud: 0 }, { cloud: 1, duration: 0.26, ease: "sine.in", immediateRender: false }, end - 0.3)
      .add(() => introTitle.classList.add("is-shown"), fe + OP.title)
      .add(() => introTitle.classList.remove("is-shown"), end - 1)
      .add(() => sound.intro("seed-release", { index: RIDE_LETTER, strength: 1.1 }), le + 0.05)
      .add(() => sound.intro("dive-start", { strength: 0.8 }), le + RIDE_KEYS[2])
      .add(() => sound.intro("cloud-enter", { strength: 0.9 }), le + RIDE_KEYS[4] - 0.1)
      .add(enterWorld, end);
    // Original: someone returning within 30 days skips straight to after the letters have all settled (nod finished, .02s before the seed ride)
    if (visitedRecently()) {
      tl.seek(Math.min(fe + OP.settle, le - 0.02), true);
      introTitle.classList.add("is-shown");
    }
  }

  // Skip: as in the original, if before the seed ride it jumps to just before it (−.02s) and plays the rest of the scene at 2.6x
  function skip() {
    if (stage !== "opening" || !opening) return;
    if (opening.time() < op.rideStart) opening.seek(Math.max(0, op.rideStart - 0.02));
    opening.timeScale(2.6);
  }

  // To the world: like the original, starts inside clouds and over 3.4 seconds the sea of clouds clears ((1 − g)^1.6) as it descends to the camp.
  // The cloud filling the screen clears at .04~.35s and the cloud-on g fades at .3~1, while the pill and HUD enter at g .5. Three seeds land beside the camp.
  const CAMP = new T.Vector3(1.2, 0, 0.4);
  const landing = { on: false, at: 0, dPos: null, dLook: null, from: new T.Vector3(), look: new T.Vector3() };
  const wSea = makeCloudSea({ top: 25, bottom: 15, radius: 260, scale: 1 });
  wScene.add(wSea.group);
  wSea.group.visible = false;
  const wRide = { curve: null, seeds: [0, 1, 2].slice(0, SEEDS_PER).map(() => { const s = lonelySeed(1); s.material = chuteMat; s.visible = false; wScene.add(s); return s; }) };
  const SEEN_KEY = "meadow-opened", SEEN_FOR = 720 * 60 * 60 * 1000;
  function visitedRecently() {
    try { const t = Number(localStorage.getItem(SEEN_KEY)); return t > 0 && Date.now() - t < SEEN_FOR; } catch { return false; }
  }
  function enterWorld() {
    if (stage !== "opening") return;
    try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch {}
    opening && opening.kill();
    introTitle.classList.remove("is-shown");
    setTimeout(() => pill.classList.add("is-gone"), 100);
    stage = "world";
    body.dataset.phase = "dive";
    bokeh.getContext("2d").clearRect(0, 0, bokeh.width, bokeh.height);
    const shift = CAMP.clone().sub(ORIG_CAMP);
    shift.y = H(CAMP.x, CAMP.z);
    wRide.curve = new T.CatmullRomCurve3(rideOrig(opStage.portrait).map((p) => p.add(shift)), false, "centripetal");
    landing.from.set(-0.92, 19.2, 17.3).add(shift);
    landing.look.set(-2.45, 2.6, -4.35).add(shift);
    landing.on = true; landing.at = time; landing.dPos = null;
  }
  function updateLanding() {
    const m = time - landing.at, g = Math.min(1, m / 3.4), desc = Math.pow(1 - g, 1.6);
    if (!landing.dPos) { landing.dPos = landing.from.clone().sub(camPos); landing.dLook = landing.look.clone().sub(lookAt); }
    camPos.addScaledVector(landing.dPos, desc);
    lookAt.addScaledVector(landing.dLook, desc);
    wSea.set({ opacity: 1 - sstep(0.3, 1, g), cloud: 1 - sstep(0.04, 0.35, m), time, camY: camPos.y, camX: camPos.x, camZ: camPos.z });
    if (g >= 0.18 && !landing.revealed) { landing.revealed = true; sound.intro("cloud-reveal"); }
    if (g >= 0.5 && body.dataset.phase === "dive") body.dataset.phase = "world";
    if (g >= 1 && !landing.done) { landing.done = true; sound.intro("complete"); }
    const R = OP.ride + m;
    wRide.seeds.forEach((s, b) => {
      s.visible = R < RIDE_END + 2;
      if (!s.visible) return;
      ridePoint(b, R, wRide.curve, 1, s.position);
      rideQuat(b, R, s.quaternion);
      s.scale.setScalar((1.46 * rideScale(R)) / 0.7);
    });
    if (g >= 1 && R >= RIDE_END + 2) { landing.on = false; wSea.group.visible = false; world.ready = true; }
  }
  // The controls guide appears briefly, only via the ‹Controls› button
  const hints = document.getElementById("mw-hints");
  let hintTimer;
  const showHints = (on) => {
    hints.setAttribute("aria-hidden", on ? "false" : "true");
    clearTimeout(hintTimer);
    if (on) hintTimer = setTimeout(() => showHints(false), 4500);
  };

  // ---------- HUD ----------
  const trailNav = document.querySelector(".trail-nav");
  const trailMenu = document.getElementById("mw-trail");
  const trigger = trailNav.querySelector(".trail-nav__trigger");
  const active = trailNav.querySelector(".trail-nav__active");
  const announce = trailNav.querySelector(".trail-nav__announcement");
  const trail = { open: false };
  const openTrail = (on) => {
    trail.open = on;
    trailMenu.hidden = !on;
    trailNav.classList.toggle("is-open", on);
    trigger.setAttribute("aria-expanded", String(on));
    on && updateDistances();
  };
  function updateDistances() {
    for (const btn of trailMenu.querySelectorAll("[data-place]")) {
      const [x, z] = PLACES[btn.dataset.place].at;
      btn.querySelector(".trail-menu__meta").textContent = `${Math.round(Math.hypot(x - player.pos.x, z - player.pos.z))}m`;
      btn.dataset.selected = String(btn.dataset.place === follow.place);
    }
    if (follow.place) {
      const [x, z] = PLACES[follow.place].at;
      active.querySelector("[data-active-dist]").textContent = `${Math.round(Math.hypot(x - player.pos.x, z - player.pos.z))}m`;
    }
  }
  function startFollow(place) {
    follow.place = place;
    follow.route = routeTo(place);
    active.hidden = false;
    active.style.setProperty("--destination-color", PLACES[place].color);
    active.querySelector("[data-active-label]").textContent = PLACES[place].label;
    trigger.querySelector("span:nth-child(2)").hidden = true;
    announce.textContent = `${PLACES[place].label}Heading to (place)`;
    openTrail(false);
    updateDistances();
  }
  function stopFollow() {
    follow.place = null;
    active.hidden = true;
    trigger.querySelector("span:nth-child(2)").hidden = false;
  }
  function arrive() {
    announce.textContent = `${PLACES[follow.place].label}Arrive at`;
    stopFollow();
  }
  trigger.addEventListener("click", () => openTrail(!trail.open));
  trailNav.querySelector(".trail-menu__scrim").addEventListener("click", () => openTrail(false));
  trailMenu.querySelector("[data-close]").addEventListener("click", () => openTrail(false));
  active.querySelector("[data-stop]").addEventListener("click", stopFollow);
  trailMenu.querySelectorAll("[data-place]").forEach((b) => b.addEventListener("click", () => startFollow(b.dataset.place)));

  const setSwitch = (name, side) => {
    const sw = document.querySelector(`[data-switch="${name}"]`);
    sw.dataset.side = side;
    sw.querySelectorAll(".meadow-deck__option").forEach((o, i) => o.setAttribute("aria-pressed", String((i === 0) === (side === "a"))));
  };
  const toggleWeather = () => {
    const rainy = document.querySelector('[data-switch="weather"]').dataset.side === "a";
    setSwitch("weather", rainy ? "b" : "a");
    gsap.to(world, { rain: rainy ? 1 : 0, duration: 1.6, ease: "sine.inOut" });
  };
  const toggleView = () => {
    const firstP = document.querySelector('[data-switch="view"]').dataset.side === "a";
    setSwitch("view", firstP ? "b" : "a");
    gsap.to(world, { view: firstP ? 1 : 0, duration: 0.9, ease: "power3.out" });
  };
  document.querySelectorAll('[data-switch="weather"] .meadow-deck__option').forEach((o, i) => o.addEventListener("click", () => { if ((i === 1) !== (o.closest("[data-switch]").dataset.side === "b")) toggleWeather(); }));
  document.querySelectorAll('[data-switch="view"] .meadow-deck__option').forEach((o, i) => o.addEventListener("click", () => { if ((i === 1) !== (o.closest("[data-switch]").dataset.side === "b")) toggleView(); }));

  const flash = (btn) => { btn.removeAttribute("data-flash"); void btn.offsetWidth; btn.setAttribute("data-flash", ""); };
  const reroll = (el, text) => { el.textContent = text; el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; };
  const QUALITY = { 3: "High", 2: "Regular", 1: "Low" };
  document.querySelectorAll("[data-tool]").forEach((btn) => btn.addEventListener("click", () => {
    flash(btn);
    const tool = btn.dataset.tool;
    if (tool === "sound") {
      const off = btn.classList.toggle("meadow-tools__button--off");
      reroll(btn.querySelector("[data-sound-label]"), off ? "Blink" : "On");
      sound.toggle(!off);
    } else if (tool === "graphics") {
      quality = quality === 1 ? 3 : quality - 1;
      document.querySelectorAll('[data-tool="graphics"]').forEach((b) => { b.dataset.sparks = String(quality); reroll(b.querySelector("[data-graphics-label]"), QUALITY[quality]); });
      worldGrass.count = Math.round(GRASS_MAX * [0, 0.35, 0.65, 1][quality]);
      renderer.shadowMap.enabled = quality > 1;
      resize();
    } else if (tool === "controls") {
      openTrail(false);
      showHints(hints.getAttribute("aria-hidden") === "true");
    }
  }));

  // Card: the backdrop blurs and the panel floats up from below
  let card = null;
  function openCard(name) {
    const el = document.getElementById(`mw-card-${name}`);
    if (!el) return;
    openTrail(false);
    card = el;
    el.hidden = false;
    const content = el.querySelector(".section-card__content");
    gsap.fromTo(el.querySelector(".section-card__veil"), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.out" });
    gsap.fromTo(content, { y: 28, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
    gsap.fromTo(el.querySelectorAll(".section-card__scroll > *"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: 0.05, delay: 0.1 });
    el.querySelector(".section-card__close").focus({ preventScroll: true });
  }
  function closeCard() {
    if (!card) return;
    const el = card;
    card = null;
    gsap.to(el.querySelector(".section-card__veil"), { opacity: 0, duration: 0.26 });
    gsap.to(el.querySelector(".section-card__content"), { y: 16, opacity: 0, duration: 0.26, ease: "power2.in", onComplete: () => (el.hidden = true) });
  }
  document.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openCard(b.dataset.open)));
  document.querySelectorAll(".section-card [data-close]").forEach((b) => b.addEventListener("click", closeCard));

  // ---------- Input ----------
  const MOVE = new Set(["w", "a", "s", "d", "shift", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
  const ARROW = { arrowup: "w", arrowdown: "s", arrowleft: "a", arrowright: "d" };
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = ARROW[e.key.toLowerCase()] || e.key.toLowerCase();
    if (stage === "opening") {
      if (body.dataset.phase === "idle") blow();
      else if (k === "escape") skip();
      return;
    }
    if (k === "escape") { card ? closeCard() : trail.open ? openTrail(false) : null; return; }
    if (card || body.dataset.phase !== "world") return;
    if (k === "g") openTrail(!trail.open);
    else if (k === "r") toggleWeather();
    else if (k === "v") toggleView();
    else if (k === " ") { e.preventDefault(); if (player.y === 0) player.vy = 5.2; }
    else if (MOVE.has(e.key.toLowerCase())) {
      keys.add(k);
      hints.querySelectorAll(".hints__key").forEach((kb) => kb.classList.toggle("is-held", keys.has(kb.textContent.toLowerCase())));
    }
  });
  addEventListener("keyup", (e) => {
    const k = ARROW[e.key.toLowerCase()] || e.key.toLowerCase();
    keys.delete(k);
    hints.querySelectorAll(".hints__key").forEach((kb) => kb.classList.toggle("is-held", keys.has(kb.textContent.toLowerCase())));
  });
  addEventListener("blur", () => keys.clear());

  pill.addEventListener("click", (e) => { e.stopPropagation(); body.dataset.phase === "idle" ? blow() : skip(); });
  const gl = renderer.domElement;
  let drag = null;
  gl.addEventListener("pointerdown", (e) => {
    if (stage === "opening") { body.dataset.phase === "idle" && blow(); return; }
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
    gl.setPointerCapture(e.pointerId);
  });
  gl.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    cam.yaw -= (e.clientX - drag.x) * 0.005;
    cam.pitch = Math.min(0.9, Math.max(0.08, cam.pitch + (e.clientY - drag.y) * 0.003));
    drag.x = e.clientX; drag.y = e.clientY;
  });
  gl.addEventListener("pointerup", () => (drag = null));
  gl.addEventListener("pointercancel", () => (drag = null));

  const ring = document.querySelector(".mw-stick__ring");
  const knob = ring.querySelector("i");
  let stickId = null;
  ring.addEventListener("pointerdown", (e) => { stickId = e.pointerId; ring.setPointerCapture(e.pointerId); });
  ring.addEventListener("pointermove", (e) => {
    if (e.pointerId !== stickId) return;
    const r = ring.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / 32, y = (e.clientY - (r.top + r.height / 2)) / 32;
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    stick.x = x; stick.y = y;
    knob.style.transform = `translate(${x * 24}px, ${y * 24}px)`;
  });
  const release = () => { stickId = null; stick.x = stick.y = 0; knob.style.transform = ""; };
  ring.addEventListener("pointerup", release);
  ring.addEventListener("pointercancel", release);
  document.querySelector(".mw-hop").addEventListener("click", () => { if (player.y === 0) player.vy = 5.2; });

  // ---------- Start ----------
  const mm = gsap.matchMedia();
  const fontReady = Promise.race([document.fonts.load(`120px ${WORD_FONT.split(",")[0]}`), new Promise((r) => setTimeout(r, 2500))]);
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) {
      worldGrassMat.uniforms.uWind.value = 0;
      stage = "world";
      body.dataset.phase = "world";
      world.ready = true;
      bootStatus?.classList.add("is-done");
      return;
    }
    fontReady.then(() => { buildLetters(); requestAnimationFrame(bootReady); });
    return () => clearTimeout(autoBlow);
  });
})();
