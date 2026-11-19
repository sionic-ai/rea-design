// Defer 3D building until after the first frame so the curtain draws first
const bzStory = () => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const rtl = () => root.dir === "rtl";
  const $ = (id) => document.getElementById(id);

  // Reads the Skin’s color by painting it on screen — so three materials and canvas images follow the Skin
  const probe = document.createElement("i");
  const tone = (v) => {
    probe.style.color = `var(${v})`; document.body.append(probe);
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const x = c.getContext("2d"); x.fillStyle = getComputedStyle(probe).color; x.fillRect(0, 0, 1, 1); probe.remove();
    const d = x.getImageData(0, 0, 1, 1).data; return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace);
  };
  const css = (c) => `#${c.getHexString(THREE.SRGBColorSpace)}`;
  const mixC = (a, b, t) => a.clone().lerp(b, t);

  // ───────── Stage ─────────
  const canvas = document.querySelector(".bz-stage__canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 2, 20000);
  let W = 1, H = 1;
  let P = {};
  const palette = () => {
    P = {
      bg: tone("--kf-bg"), ink: tone("--kf-ink"), accent: tone("--kf-accent"), danger: tone("--kf-danger"),
      dark: tone("--kf-contrast-bg"), light: tone("--kf-contrast-ink"), surface: tone("--kf-surface"), gold: tone("--site-gold"),
    };
  };
  palette();

  // Canvas drawing board — we draw the stripe, checkerboard and star patterns ourselves
  const tex = (w, h, draw, rep = [1, 1]) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 4;
    return t;
  };
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o });
  const flat = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });
  const mesh = (g, m, p, parent) => { const o = new THREE.Mesh(g, m); if (p) o.position.copy(p); (parent || scene).add(o); return o; };

  // Cyber type swaps the material for a single cyan line
  const looks = new Map();
  let cyberMat = null;

  // ── Earth space: land and sea drawn with noise on a sphere of radius 100, atmosphere glow, clouds, stars ──
  const globe = new THREE.Group(); globe.name = "globe";
  const R = 100;
  const globeWorld = (lat, lon, r = R) => {
    const la = lat * D2R, lo = lon * D2R;
    return V(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
  };
  const TARGET = { lat: 25.14, lon: 55.19 };
  {
    const earth = tex(1024, 512, (x, w, h) => {
      const img = x.createImageData(w, h);
      const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
      const noise = (u, v) => { const i = Math.floor(u), j = Math.floor(v), f = u - i, g = v - j; const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); const s = f * f * (3 - 2 * f), t = g * g * (3 - 2 * g); return a + (b - a) * s + (c - a) * t + (a - b - c + d) * s * t; };
      const fbm = (u, v) => { let s = 0, a = 0.5; for (let k = 0; k < 5; k++) { s += a * noise(u, v); u *= 2.03; v *= 2.03; a *= 0.5; } return s; };
      // Add weight around the target spot (a peninsula region) so it becomes land
      const tu = (TARGET.lon + 180) / 360, tv = (90 - TARGET.lat) / 180;
      for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
        const u = px / w, v = py / h;
        let n = fbm(u * 9, v * 6);
        const d = Math.hypot((u - tu - 0.01) * 2, v - tv + 0.02);
        n += 0.35 * Math.exp(-((d / 0.09) ** 2)) - (d < 0.03 && u > tu ? 0.4 : 0);
        const land = n > 0.56, i = (py * w + px) * 4, ice = v < 0.06 || v > 0.94;
        const c = ice ? [235, 238, 240] : land ? [196 - n * 60, 168 - n * 50, 120 - n * 40] : [18 + n * 30, 52 + n * 40, 92 + n * 50];
        img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
    });
    earth.wrapS = THREE.RepeatWrapping;
    const sphere = mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshStandardMaterial({ map: earth, roughness: 0.9 }), null, globe);
    sphere.rotation.y = -Math.PI / 2;
    const air = mesh(new THREE.SphereGeometry(R * 1.06, 64, 48), new THREE.ShaderMaterial({
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: { glow: { value: new THREE.Color(0.35, 0.6, 1) } },
      vertexShader: "varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 p = modelViewMatrix * vec4(position, 1.0); vP = p.xyz; gl_Position = projectionMatrix * p; }",
      fragmentShader: "uniform vec3 glow; varying vec3 vN; varying vec3 vP; void main(){ float k = pow(0.72 - dot(vN, normalize(-vP)), 3.0); gl_FragColor = vec4(glow * k * 1.6, k); }",
    }), null, globe);
    air.name = "air";
    const cloudTex = tex(512, 256, (x, w, h) => { x.fillStyle = "rgba(0,0,0,0)"; for (let k = 0; k < 260; k++) { x.globalAlpha = Math.random() * 0.18; x.fillStyle = `rgb(255 255 255)`; x.beginPath(); x.ellipse(Math.random() * w, h * (0.15 + Math.random() * 0.7), 10 + Math.random() * 40, 3 + Math.random() * 8, 0, 0, TAU); x.fill(); } }); /* Not skin: colors of the building·interior·globe patterns in the art */
    const clouds = mesh(new THREE.SphereGeometry(R * 1.012, 64, 48), new THREE.MeshLambertMaterial({ map: cloudTex, transparent: true, depthWrite: false }), null, globe);
    clouds.name = "clouds";
    const starG = new THREE.BufferGeometry(), sp = [];
    for (let i = 0; i < 1800; i++) { const v = V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(2500 + Math.random() * 1500); sp.push(v.x, v.y, v.z); }
    starG.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    globe.add(new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.8 })));
    const ring = mesh(new THREE.TorusGeometry(2.4, 0.12, 8, 48), new THREE.MeshBasicMaterial({ color: P.accent }), globeWorld(TARGET.lat, TARGET.lon, R + 0.3), globe);
    ring.lookAt(0, 0, 0); ring.name = "ring";
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(300, 200, 400); globe.add(sun);
    globe.add(new THREE.AmbientLight(0x8899bb, 0.6));
  }

  // ── Outer space: sky ball, sea, island, sail-shaped tower, white arch, round top plate, stakes ──
  const out = new THREE.Group(); out.name = "out";
  const ISLAND = 105;
  const mats = {};
  {
    const sky = mesh(new THREE.SphereGeometry(9000, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color(0.22, 0.45, 0.85) }, mid: { value: new THREE.Color(0.68, 0.82, 0.95) }, low: { value: new THREE.Color(0.95, 0.9, 0.82) }, night: { value: 0 } },
      vertexShader: "varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 top, mid, low; uniform float night; varying float vY; void main(){ vec3 c = mix(low, mid, smoothstep(0.0, 0.12, vY)); c = mix(c, top, smoothstep(0.12, 0.6, vY)); vec3 dusk = mix(vec3(0.95, 0.5, 0.3), vec3(0.05, 0.07, 0.16), smoothstep(-0.02, 0.35, vY)); gl_FragColor = vec4(mix(c, dusk, night), 1.0); }",
    }), null, out);
    mats.sky = sky.material;
    const sea = mesh(new THREE.PlaneGeometry(16000, 16000, 1, 1), new THREE.ShaderMaterial({
      transparent: true, depthWrite: true,
      uniforms: { time: { value: 0 }, deep: { value: new THREE.Color(0.04, 0.28, 0.42) }, shallow: { value: new THREE.Color(0.28, 0.78, 0.8) }, night: { value: 0 }, xray: { value: 0 } },
      vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: `uniform float time, night, xray; uniform vec3 deep, shallow; varying vec3 vW;
        void main(){ float d = length(vW.xz - vec2(0.0, 40.0)); float k = smoothstep(${ISLAND + 10}.0, ${ISLAND * 3}.0, d);
          vec3 c = mix(shallow, deep, k);
          float w = sin(vW.x * 0.05 + time * 0.9) * sin(vW.z * 0.043 - time * 0.7) + sin((vW.x + vW.z) * 0.021 + time * 0.4);
          c += 0.035 * w;
          c = mix(c, c * vec3(0.18, 0.2, 0.32), night);
          float fade = smoothstep(9000.0, 2500.0, d);
          gl_FragColor = vec4(c, mix(1.0, 0.35, xray) * fade + (1.0 - fade) * 0.0); }`,
    }), V(0, 0, 0), out);
    sea.rotation.x = -Math.PI / 2; mats.sea = sea.material;

    // Island: a teardrop-shaped sand base with a rounded front, plus grass and hexagonal breakwater blocks around it
    const isl = new THREE.Shape();
    isl.moveTo(0, -ISLAND * 0.7);
    isl.bezierCurveTo(ISLAND * 0.9, -ISLAND * 0.7, ISLAND, ISLAND * 0.6, 0, ISLAND * 0.95);
    isl.bezierCurveTo(-ISLAND, ISLAND * 0.6, -ISLAND * 0.9, -ISLAND * 0.7, 0, -ISLAND * 0.7);
    const islGeo = new THREE.ExtrudeGeometry(isl, { depth: 50, bevelEnabled: true, bevelSize: 6, bevelThickness: 4, bevelSegments: 3 });
    islGeo.rotateX(Math.PI / 2); islGeo.translate(0, 6, 0);
    mats.sand = flat(new THREE.Color(0.93, 0.86, 0.7), { transparent: true });
    const island = mesh(islGeo, mats.sand, null, out); island.name = "island";
    const lawn = new THREE.ShapeGeometry(isl, 24); lawn.rotateX(-Math.PI / 2); lawn.scale(0.78, 1, 0.74); lawn.translate(0, 6.3, 6);
    mats.lawn = flat(new THREE.Color(0.36, 0.62, 0.3), { transparent: true });
    mesh(lawn, mats.lawn, null, out);
    const block = new THREE.CylinderGeometry(3.4, 3.8, 5, 6);
    mats.rock = flat(new THREE.Color(0.82, 0.8, 0.74), { transparent: true });
    const pts = new THREE.Shape(isl.getPoints(80)).getPoints(80);
    pts.forEach((p, i) => { if (i % 2) return; const o = mesh(block, mats.rock, V(p.x * 1.07, 3, p.y * 1.07), out); o.rotation.y = i; });
    // Palm: trunk + five leaves
    const trunk = new THREE.CylinderGeometry(0.6, 0.9, 12, 6), frond = new THREE.ConeGeometry(4, 1, 5);
    const palmM = flat(new THREE.Color(0.25, 0.5, 0.22)), trunkM = flat(new THREE.Color(0.55, 0.42, 0.3));
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * TAU, r = ISLAND * (0.55 + 0.15 * Math.sin(i * 3.1));
      const p = V(Math.cos(a) * r * 0.85, 6, Math.sin(a) * r * 0.8 + 10);
      mesh(trunk, trunkM, p.clone().setY(12), out);
      const f = mesh(frond, palmM, p.clone().setY(18.5), out); f.scale.set(1, 1.2, 1);
    }
    // Bridge: a path curving from in front of the island to the shore
    const bridgeCurve = new THREE.CatmullRomCurve3([V(0, 6, ISLAND * 0.92), V(30, 5, ISLAND * 1.8), V(20, 4, ISLAND * 2.8), V(-10, 4, ISLAND * 3.7)]);
    mesh(new THREE.TubeGeometry(bridgeCurve, 60, 3, 6, false), flat(new THREE.Color(0.9, 0.9, 0.88)), null, out).scale.set(1, 0.4, 1);
    // Seaside strip and a few low buildings
    mesh(new THREE.BoxGeometry(4000, 6, 160), flat(new THREE.Color(0.93, 0.87, 0.72)), V(0, 1, ISLAND * 4.4), out);
    for (let i = 0; i < 40; i++) { const h = 10 + Math.random() * 40; mesh(new THREE.BoxGeometry(18 + Math.random() * 30, h, 20 + Math.random() * 20), flat(new THREE.Color(0.94, 0.94, 0.92)), V(-1600 + i * 80, h / 2 + 4, ISLAND * 4.6 + Math.random() * 60), out); }

    // Tower — two wings fan forward from the rear vertex (the mast), and a billowing white sail fills the gap between their front ends. Height 200 (roof) · mast tip 321
    const ROOF = 200, APEX = -14;
    const tipOf = (s, y) => { const t = y / ROOF; return V(s * 34 * (1 - 0.32 * t), y, APEX + 58 * (1 - t ** 1.7)); };
    const ribbon = (from, to, rows = 40, cols = 12) => {
      const g = new THREE.BufferGeometry(), p = [], uv = [], idx = [];
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) { const v = to(j / rows, i / cols); p.push(v.x, v.y, v.z); uv.push(i / cols, j / rows); }
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      g.setIndex(idx); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
      return g;
    };
    const windows = tex(64, 512, (x, w, h) => { x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { x.fillStyle = "#2d5fb8"; x.fillRect(0, y + 2, w, 4); } }, [1, 1]); /* Not skin: colors of the building·interior·globe patterns in the art */
    mats.wing = std(0xffffff, { map: windows, side: THREE.DoubleSide, roughness: 0.4 });
    for (const s of [-1, 1]) mesh(ribbon(null, (v, u) => { const y = 7 + v * (ROOF - 7); return V(0, y, APEX).lerp(tipOf(s, y), u); }), mats.wing, null, out).name = "wing";
    mats.sail = std(0xfbfbf8, { side: THREE.DoubleSide, roughness: 0.55, emissive: 0xffe6c2, emissiveIntensity: 0, transparent: true, opacity: 0.96 });
    mesh(ribbon(null, (v, u) => { const y = 7 + v * (ROOF - 7); const a = tipOf(-1, y), b = tipOf(1, y); const p = a.lerp(b, u); p.z += Math.sin(u * Math.PI) * (8 + 10 * Math.sin(v * Math.PI)); return p; }, 40, 16), mats.sail, null, out).name = "sail";
    mats.white = std(0xffffff, { roughness: 0.35 });
    mesh(new THREE.CylinderGeometry(1.4, 6, 321, 12), mats.white, V(0, 160.5, APEX - 1), out).name = "mast";
    mesh(new THREE.BoxGeometry(22, 8, 22), mats.white, V(0, ROOF + 4, APEX + 6), out);
    // White steel arch — tubes rising from the ground on both sides, curving up over the mast, plus a horizontal truss
    for (const s of [-1, 1]) {
      const c = new THREE.CatmullRomCurve3([V(s * 48, 6, 36), V(s * 46, 90, 22), V(s * 34, 170, 2), V(s * 12, 236, APEX + 2), V(0, 248, APEX)]);
      mesh(new THREE.TubeGeometry(c, 80, 2.2, 8, false), mats.white, null, out).name = "exo";
      for (let k = 1; k < 8; k++) { const a = c.getPoint(k / 9), b = tipOf(s, Math.min(a.y, ROOF)); const d = b.clone().sub(a); const t = mesh(new THREE.CylinderGeometry(0.8, 0.8, d.length(), 6), mats.white, a.clone().add(b).multiplyScalar(0.5), out); t.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
    }
    // Round top plate (jutting out front right) and the opposite-side panorama restaurant block
    mats.helipad = std(0xffffff, { roughness: 0.5 });
    const pad = mesh(new THREE.CylinderGeometry(12, 12, 1.6, 40), mats.helipad, V(30, 212, 6), out); pad.name = "helipad";
    const padMark = tex(128, 128, (x, w, h) => { x.fillStyle = "#2f8f5a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#ffffff"; x.lineWidth = 8; x.beginPath(); x.arc(64, 64, 46, 0, TAU); x.stroke(); x.font = "bold 60px sans-serif"; x.fillStyle = "#ffffff"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("H", 64, 66); }); /* Not skin: colors of the building·interior·globe patterns in the art */
    mesh(new THREE.CircleGeometry(11, 40), new THREE.MeshLambertMaterial({ map: padMark }), V(30, 213, 6), out).rotation.x = -Math.PI / 2;
    mesh(new THREE.CylinderGeometry(1.5, 3, 30, 8), mats.white, V(18, 200, 2), out).rotation.z = Math.PI / 2.6;
    const pod = mesh(new THREE.CapsuleGeometry(7, 26, 6, 16), std(0xf2f2f2, { roughness: 0.4 }), V(-26, 196, -2), out); pod.rotation.z = Math.PI / 2;
    // Piles — 40 m posts in the sand beneath the island (only in the see-through section)
    const piles = new THREE.Group(); piles.visible = false; piles.name = "piles";
    const pileG = new THREE.CylinderGeometry(1.2, 1.2, 40, 8), pileM = std(0xb9b2a6, { roughness: 0.9 });
    for (let i = -6; i <= 6; i++) for (let j = -4; j <= 6; j++) { if (Math.abs(i) + Math.abs(j) > 9) continue; mesh(pileG, pileM, V(i * 6, -24, j * 6 - 6), piles); }
    out.add(piles);
    mats.piles = piles;
    // Sun and sky light
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.2); sun.position.set(400, 600, 500); out.add(sun);
    out.add(new THREE.HemisphereLight(0xcfe6ff, 0xe8d8b0, 1.1));
    const night = new THREE.PointLight(0xffd7a6, 0, 600, 1.2); night.position.set(0, 120, 140); out.add(night); mats.nightLight = night;
  }

  // ── Three interior spaces — built in the same spot, only the visible one turned on ──
  const atrium = new THREE.Group(); atrium.name = "atrium";
  {
    const chevron = tex(256, 256, (x, w, h) => { x.fillStyle = "#f6f3ea"; x.fillRect(0, 0, w, h); x.fillStyle = "#1d4fa8"; for (let k = -2; k < 8; k++) { x.beginPath(); x.moveTo(0, k * 40); x.lineTo(w / 2, k * 40 + 60); x.lineTo(w, k * 40); x.lineTo(w, k * 40 + 18); x.lineTo(w / 2, k * 40 + 78); x.lineTo(0, k * 40 + 18); x.fill(); } x.fillStyle = "#d9a531"; x.fillRect(w / 2 - 4, 0, 8, h); }, [18, 14]); /* Not skin: colors of the building·interior·globe patterns in the art */
    const shaft = mesh(new THREE.CylinderGeometry(46, 56, 196, 48, 1, true), new THREE.MeshLambertMaterial({ map: chevron, side: THREE.BackSide }), V(0, 98, -30), atrium); shaft.name = "shaft";
    const checker = tex(256, 256, (x, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? "#e9c13a" : "#2a4c9e"; x.beginPath(); x.moveTo(i * 64 + 32, j * 64); x.lineTo(i * 64 + 64, j * 64 + 32); x.lineTo(i * 64 + 32, j * 64 + 64); x.lineTo(i * 64, j * 64 + 32); x.fill(); } }, [16, 16]); /* Not skin: colors of the building·interior·globe patterns in the art */
    const floor = mesh(new THREE.PlaneGeometry(140, 160), new THREE.MeshLambertMaterial({ map: checker }), V(0, 0, 0), atrium); floor.rotation.x = -Math.PI / 2;
    const wall = new THREE.MeshLambertMaterial({ color: 0xe8e2d4, side: THREE.BackSide });
    mesh(new THREE.BoxGeometry(140, 30, 160), wall, V(0, 15, 0), atrium);
    // Golden spindle pillar — bulges in the middle
    const prof = [[0.2, 0], [1.4, 0.4], [1.0, 1.2], [2.0, 6], [2.5, 12], [1.6, 20], [0.9, 25], [1.8, 26.5], [0.2, 27]].map(([a, b]) => new THREE.Vector2(a, b));
    const col = new THREE.LatheGeometry(prof, 32);
    const goldM = std(0xe8b847, { metalness: 0.55, roughness: 0.32, emissive: 0x6a4300, emissiveIntensity: 0.45 });
    mats.gold = goldM;
    for (const x of [-22, -10, 10, 22]) for (const z of [0, 14]) mesh(col, goldM, V(x, 0, z), atrium);
    // Fountain — three round tiers and a water-colored plate
    for (const [r, h] of [[9, 1.2], [6, 2.4], [3, 3.6]]) mesh(new THREE.CylinderGeometry(r, r + 0.4, 1.2, 40), std(0xf4efe4), V(0, h - 0.6, -30), atrium);
    mesh(new THREE.CircleGeometry(8.6, 40), std(0x58b7d8, { roughness: 0.15 }), V(0, 1.25, -30), atrium).rotation.x = -Math.PI / 2;
    // Row of red coral-like planters
    for (let i = 0; i < 10; i++) mesh(new THREE.ConeGeometry(1.4, 5, 5), flat(0xd8343a), V(-30 + (i % 2) * 60, 2.5, -10 + i * 6), atrium);
    atrium.add(new THREE.HemisphereLight(0xfff6e6, 0x6a5a40, 1.4));
    const l = new THREE.PointLight(0xfff0d0, 900, 200, 1.6); l.position.set(0, 60, 0); atrium.add(l);
  }
  const mahara = new THREE.Group(); mahara.name = "mahara";
  {
    mesh(new THREE.CylinderGeometry(30, 30, 12, 48, 1, true), new THREE.MeshLambertMaterial({ color: 0x0a2a55, side: THREE.BackSide }), V(0, 6, 0), mahara);
    mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshLambertMaterial({ color: 0x0b1e3c }), V(0, 0, 0), mahara).rotation.x = -Math.PI / 2;
    const tank = mesh(new THREE.CylinderGeometry(7, 7, 11, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x3fb7ff, transparent: true, opacity: 0.45, roughness: 0.1, side: THREE.DoubleSide, emissive: 0x0b4d86, emissiveIntensity: 0.6 }), V(0, 5.5, 0), mahara); tank.name = "tank";
    const fishG = new THREE.ConeGeometry(0.25, 0.9, 5); fishG.rotateZ(Math.PI / 2);
    const fish = new THREE.Group(); fish.name = "fish"; mahara.add(fish);
    for (let i = 0; i < 40; i++) { const f = mesh(fishG, flat([0xffb347, 0xffe066, 0xff6f61, 0x9be7ff][i % 4]), V(0, 0, 0), fish); f.userData = { r: 2 + Math.random() * 4, h: 1.5 + Math.random() * 8, a: Math.random() * TAU, s: 0.2 + Math.random() * 0.5 }; }
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.15, 24), std(0xf3efe6), V(Math.cos(a) * 17, 1.1, Math.sin(a) * 17), mahara); mesh(new THREE.CylinderGeometry(0.15, 0.3, 1.1, 8), std(0xd8a737, { metalness: 0.7, roughness: 0.3 }), V(Math.cos(a) * 17, 0.55, Math.sin(a) * 17), mahara); }
    mahara.add(new THREE.HemisphereLight(0x5aa0ff, 0x08142a, 0.9));
    const l = new THREE.PointLight(0x6fd0ff, 120, 60, 1.4); l.position.set(0, 8, 0); mahara.add(l);
  }
  const suite = new THREE.Group(); suite.name = "suite";
  {
    const stripes = tex(128, 256, (x, w, h) => { x.fillStyle = "#b5141d"; x.fillRect(0, 0, w, h); x.fillStyle = "#e0b04a"; x.fillRect(0, 0, 6, h); x.fillRect(w / 2, 0, 3, h); }, [24, 2]); /* Not skin: colors of the building·interior·globe patterns in the art */
    mesh(new THREE.BoxGeometry(40, 12, 50), new THREE.MeshLambertMaterial({ map: stripes, side: THREE.BackSide }), V(0, 6, 0), suite);
    const carpet = tex(256, 256, (x, w, h) => { x.fillStyle = "#c4161f"; x.fillRect(0, 0, w, h); x.fillStyle = "#f2c84b"; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const cx = i * 64 + 32 + (j % 2) * 32, cy = j * 64 + 32; x.beginPath(); for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU, r = k % 2 ? 4 : 11; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.fill(); } }, [8, 10]); /* Not skin: colors of the building·interior·globe patterns in the art */
    mesh(new THREE.PlaneGeometry(40, 50), new THREE.MeshLambertMaterial({ map: carpet }), V(0, 0.02, 0), suite).rotation.x = -Math.PI / 2;
    const gold = std(0xd8a737, { metalness: 0.8, roughness: 0.3, emissive: 0x2a1800 });
    // Round bed and canopy — four gold posts · red roof
    mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.9, 40), std(0xf5f0e6), V(0, 0.8, -12), suite);
    mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.5, 40), std(0xa40f18), V(0, 0.25, -12), suite);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + Math.PI / 4; mesh(new THREE.CylinderGeometry(0.18, 0.18, 7, 10), gold, V(Math.cos(a) * 4, 3.5, -12 + Math.sin(a) * 4), suite); }
    mesh(new THREE.CylinderGeometry(5, 4.4, 0.8, 40), std(0xb5141d), V(0, 7.2, -12), suite);
    // A pair of big doors and stairs
    for (const x of [-1.6, 1.6]) mesh(new THREE.BoxGeometry(3, 7, 0.3), std(0x7a3f1d, { roughness: 0.6 }), V(x, 3.5, 24.8), suite);
    for (let k = 0; k < 10; k++) mesh(new THREE.BoxGeometry(6, 0.5, 1.2), std(0xf0ebe0), V(14, 0.25 + k * 0.5, 10 - k * 1.2), suite);
    for (const z of [-20, -4, 12]) for (const x of [-17, 17]) mesh(new THREE.CylinderGeometry(0.5, 0.6, 12, 16), gold, V(x, 6, z), suite);
    suite.add(new THREE.HemisphereLight(0xfff0dc, 0x5a1010, 1.2));
    const l = new THREE.PointLight(0xffe2b0, 160, 80, 1.5); l.position.set(0, 10, 0); suite.add(l);
  }
  const spaces = { globe, out, atrium, mahara, suite };
  Object.values(spaces).forEach((g) => { g.visible = false; scene.add(g); });
  const ROOM_BG = { globe: () => P.dark.clone().multiplyScalar(0.25), atrium: () => new THREE.Color(0.85, 0.82, 0.76), mahara: () => new THREE.Color(0.02, 0.05, 0.1), suite: () => new THREE.Color(0.07, 0.02, 0.02) };
  const fogOut = new THREE.Fog(0xd8e6f0, 2500, 9000);
  let curSpace = null, cyber = root.dataset.mode === "cyber";
  const setSpace = (name) => {
    if (name === curSpace) return;
    curSpace = name;
    for (const [k, g] of Object.entries(spaces)) g.visible = k === name;
    const inside = name !== "out";
    scene.fog = inside || cyber ? null : fogOut;
    scene.background = cyber ? P.bg.clone() : inside ? ROOM_BG[name]() : null;
    camera.fov = name === "atrium" ? 66 : name === "mahara" || name === "suite" ? 58 : 36;
    camera.near = name === "out" ? 10 : name === "globe" ? 2 : 0.2;
    camera.updateProjectionMatrix();
    $("bSpace").textContent = `SPACE: ${{ out: "EXTERIOR", globe: "ORBIT" }[name] || "INTERIOR"}`;
  };
  const applyLook = () => {
    cyber = root.dataset.mode === "cyber";
    palette();
    cyberMat = cyberMat || new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.32 });
    cyberMat.color.copy(P.accent);
    scene.traverse((o) => {
      if (!o.isMesh || o.material?.isShaderMaterial) return;
      if (!looks.has(o)) looks.set(o, o.material);
      o.material = cyber ? cyberMat : looks.get(o);
    });
    mats.sky.uniforms.night.value = cyber ? 1 : 0;
    const s = curSpace; curSpace = null; if (s) setSpace(s);
  };

  // ───────── Section — camera position (target point, direction, distance), space, pins and dimension lines ─────────
  const sections = [...document.querySelectorAll(".bz-ch")];
  const target = globeWorld(TARGET.lat, TARGET.lon);
  const near = (d) => ({ target: target.clone(), dir: target.clone().normalize().add(V(0, -0.06, 0.18)).normalize(), dist: d });
  const CH = {
    region: { cam: near(260), labels: [["REGION", target, "big"]] },
    city: { cam: near(150), labels: [["REGION", target, "big"]] },
    coast: { cam: near(48), labels: [["CITY", target.clone().add(V(-2, 1, 0)), "city"]] },
    overview: { cam: { target: V(0, 60, 10), dir: V(0.42, 0.62, 0.66), dist: 980 } },
    explore: { cam: { target: V(0, 150, 0), dir: V(0.6, 0.1, 0.8), dist: 680 } },
    design: { cam: { target: V(10, 165, 0), dir: V(0.55, 0.1, 0.83), dist: 760 }, annot: { paths: [[V(72, 7, -10), V(72, 321, -10)], [V(67, 7, -10), V(77, 7, -10)], [V(67, 321, -10), V(77, 321, -10)], [V(60, 202, -10), V(84, 202, -10)]], labels: [["000 m", V(84, 172, -10)], ["Roof ≈ 000 m", V(90, 210, -10), "small"]] } },
    island: { cam: { target: V(-20, -6, 18), dir: V(0.62, 0.3, 0.73), dist: 470 }, pins: [["Bridge", "Your one line on the length of the bridge linking island and beach goes here.", V(0, 8, ISLAND * 0.95)], ["Grass Lawn", "Your line about the lawn and pool behind the tower goes here.", V(-40, 8, -30)], ["Breakwater block", "Your one line about wave-breaking blocks goes here.", V(ISLAND * 0.85, 6, 20)]] },
    foundation: { cam: { target: V(-14, -26, 2), dir: V(0.5, 0.45, 0.74), dist: 220 }, xray: true, pins: [["000 stakes", "Your one line noting the stake layout is an example.", V(0, -12, 12)], ["Sand without rocks", "Your one line on holding firm through friction.", V(-46, -28, -20)]], annot: { paths: [[V(52, -4, 40), V(52, -44, 40)], [V(49, -4, 40), V(55, -4, 40)], [V(49, -44, 40), V(55, -44, 40)]], labels: [["00 m", V(57, -24, 40)]] } },
    sail: { cam: { target: V(0, 135, 40), dir: V(0.16, 0.06, 1), dist: 440 }, night: 1 },
    helipad: { cam: { target: V(30, 212, 6), dir: V(-0.55, 0.42, 0.72), dist: 120 }, annot: { paths: [[V(18, 214, 6), V(42, 214, 6)]], labels: [["00 m", V(30, 222, 6)]] } },
    arrive: { cam: { target: V(0, 12, ISLAND * 0.9), dir: V(0.35, 0.2, 1), dist: 68 } },
    columns: { cam: { target: V(-18, 14, 14), dir: V(0.0817, -0.346, 0.935), dist: 30.6 }, pins: [["Golden pillar", "One line about gold leaf covering the pillars.", V(-18, 14, 24)]] },
    atrium: { cam: { target: V(0, 80, -30), dir: V(0, -0.845, 0.535), dist: 82.3 }, annot: { paths: [[V(0, 8, -30), V(0, 186, -30)]], labels: [["000 m", V(4, 120, -30)]] } },
    aquarium: { cam: { target: V(0, 2.8, 0), dir: V(0.86, 0.02, 0.51), dist: 17.5 } },
    suite: { cam: { target: V(1.9, 2.6, 2.6), dir: V(-0.3009, -0.0679, 0.9512), dist: 10.3 }, pins: [["Big stairs", "Your one-line red carpet staircase caption.", V(14, 3, 6)]] },
    bedroom: { cam: { target: V(0, 3.7, -12), dir: V(0, 0.154, 0.988), dist: 9.8 } },
    finale: { cam: { target: V(-10, 140, 20), dir: V(-0.7, 0.08, 0.71), dist: 780 }, night: 0.42, drift: true },
  };
  const order = sections.map((s) => s.id);
  const poses = order.map((id) => { const c = CH[id].cam; return { target: c.target.clone(), dir: c.dir.clone().normalize(), dist: c.dist }; });
  const spaceOf = (i) => sections[i].dataset.space;
  const layoutOf = (i) => (sections[i].classList.contains("--left") ? "left" : "center");

  let centers = [];
  const measure = () => {
    const phone = innerWidth <= 760;
    centers = sections.map((s) => {
      const r = s.querySelector(".bz-copy").getBoundingClientRect(), top = scrollY + r.top;
      if (s.classList.contains("--center")) return top + innerHeight * 0.37;
      return phone ? top - innerHeight * 0.02 : top + r.height / 2;
    });
  };
  // When passing between card centers, the first 25% and last 25% hold, and over the middle 50% it blends to the next section’s position with smoothstep
  const storyState = () => {
    const mid = scrollY + innerHeight / 2;
    let i = 0;
    while (i < centers.length - 1 && mid >= centers[i + 1]) i++;
    let t = 0;
    if (i < centers.length - 1 && mid > centers[i]) t = (mid - centers[i]) / (centers[i + 1] - centers[i]);
    const e = smooth((t - 0.25) / 0.5);
    return { i, e, t, active: e < 0.5 ? i : i + 1 };
  };
  const pose = { target: V(0, 0, 0), dir: V(0, 0, 1), dist: 1 };
  const lerpLog = (a, b, e) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * e);
  const blendPose = (a, b, e, k = 1) => { const A = poses[a], B = poses[b]; pose.target.lerpVectors(A.target, B.target, e); pose.dir.lerpVectors(A.dir, B.dir, e).normalize(); pose.dist = lerpLog(A.dist, B.dist, e) * k; return pose; };
  const _pa = V(0, 0, 0), _pb = V(0, 0, 0), _zp = V(0, 0, 0), _zt = V(0, 0, 0);
  // Approach — fly in toward the next aim point, shrinking the distance ratio exponentially
  const zoomPose = (a, b, e) => {
    const A = poses[a], B = poses[b], D = B.target;
    _pa.copy(A.target).addScaledVector(A.dir, A.dist); _pb.copy(B.target).addScaledVector(B.dir, B.dist);
    const k = Math.exp(Math.log(B.dist / A.dist) * e);
    _zp.copy(_pa).sub(D).multiplyScalar(k).add(D); _zt.copy(A.target).sub(D).multiplyScalar(k).add(D);
    const w = e * e * (3 - 2 * e);
    _zp.lerp(_pb, w); _zt.lerp(D, w);
    pose.target.copy(_zt); pose.dist = _zp.distanceTo(_zt); pose.dir.copy(_zp).sub(_zt).normalize();
    return pose;
  };
  // Walking — the eye moves straight and the aim point turns late by e²
  const walkPose = (a, b, e) => {
    const A = poses[a], B = poses[b];
    _pa.copy(A.target).addScaledVector(A.dir, A.dist); _pb.copy(B.target).addScaledVector(B.dir, B.dist);
    _pa.lerp(_pb, e);
    pose.target.lerpVectors(A.target, B.target, e * e);
    pose.dir.copy(_pa).sub(pose.target); pose.dist = pose.dir.length(); pose.dir.normalize();
    return pose;
  };
  // Turning — shifts the eye position and turns the head left and right the shorter way
  const turnPose = (a, b, e) => {
    const A = poses[a], B = poses[b];
    _pa.copy(A.target).addScaledVector(A.dir, A.dist); _pb.copy(B.target).addScaledVector(B.dir, B.dist);
    _pa.lerp(_pb, e);
    const ya = Math.atan2(-A.dir.x, -A.dir.z), yb = Math.atan2(-B.dir.x, -B.dir.z);
    let dy = yb - ya; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU;
    const yaw = ya + dy * e, pitch = Math.asin(-A.dir.y) + (Math.asin(-B.dir.y) - Math.asin(-A.dir.y)) * e;
    pose.dist = lerpLog(A.dist, B.dist, e);
    pose.dir.set(-Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    pose.target.copy(_pa).addScaledVector(pose.dir, -pose.dist);
    return pose;
  };
  // When the space changes, a dark veil (1 − |e − .5| × 4) covers from the center, the front one approaches up to 55% · the back one enters from a spot pulled back 35%
  const frameOf = (s) => {
    const a = s.i, b = Math.min(s.i + 1, order.length - 1), sa = spaceOf(a), sb = spaceOf(b), mv = sections[b].dataset.move;
    if (sa === sb && a !== b && mv === "turn") return { space: sa, pose: turnPose(a, b, s.e), veil: 0 };
    if (sa === sb && a !== b && mv === "zoom") return { space: sa, pose: zoomPose(a, b, s.e), veil: 0 };
    if (sa === sb && a !== b && mv === "walk") return { space: sa, pose: walkPose(a, b, s.e), veil: 0 };
    if (sa === sb) return { space: sa, pose: blendPose(a, b, s.e), veil: 0 };
    const veil = clamp01(1 - Math.abs(s.e - 0.5) * 4);
    return s.e < 0.5 ? { space: sa, pose: blendPose(a, a, 0, 1 - 0.55 * smooth(s.e * 2)), veil } : { space: sb, pose: blendPose(b, b, 0, 1 + 0.35 * smooth((1 - s.e) * 2)), veil };
  };
  const weight = (idx, s) => (s.i === idx ? 1 - s.e : 0) + (s.i + 1 === idx ? s.e : 0);

  // ── Pins · dimension lines · labels ──
  const pinsEl = $("pins"), card = $("pincard"), annot = $("annot"), labelsEl = $("labels");
  const pins = [], marks = [], labels = [];
  order.forEach((id, idx) => {
    (CH[id].pins || []).forEach(([title, text, at], n) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "bz-pin"; b.textContent = n + 1; b.dataset.off = "true";
      b.setAttribute("aria-label", title);
      b.addEventListener("click", (e) => { e.stopPropagation(); card.querySelector("h3").textContent = title; card.querySelector("p").textContent = text; card.hidden = false; const r = b.getBoundingClientRect(); card.style.left = `${Math.min(innerWidth - 306, r.right + 10)}px`; card.style.top = `${Math.max(16, r.top - 20)}px`; });
      pinsEl.append(b); pins.push({ idx, at, el: b });
    });
    if (CH[id].annot) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.style.opacity = 0; annot.append(g);
      const paths = CH[id].annot.paths.map(() => { const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); g.append(p); return p; });
      const texts = CH[id].annot.labels.map(([t, , k]) => { const n = document.createElementNS("http://www.w3.org/2000/svg", "text"); n.textContent = t; if (k) n.classList.add("--small"); g.append(n); return n; });
      marks.push({ idx, g, paths, texts, def: CH[id].annot });
    }
    (CH[id].labels || []).forEach(([t, at, k]) => { const n = document.createElement("span"); n.className = `bz-glabel${k === "city" ? " --city" : ""}`; n.textContent = t; n.style.opacity = 0; labelsEl.append(n); labels.push({ idx, at, el: n }); });
  });
  card.querySelector(".bz-x").addEventListener("click", () => (card.hidden = true));
  addEventListener("pointerdown", (e) => { if (!card.hidden && !card.contains(e.target) && !e.target.closest(".bz-pin")) card.hidden = true; });
  const proj = V(0, 0, 0);
  const toScreen = (p) => { proj.copy(p).project(camera); return { x: ((proj.x + 1) / 2) * W, y: ((1 - proj.y) / 2) * H, ok: proj.z < 1 }; };

  // ── Screen size · drawing ──
  const view = { x: 0, y: 0 };
  const resize = () => {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    annot.setAttribute("viewBox", `0 0 ${W} ${H}`);
    measure();
  };
  new ResizeObserver(resize).observe(document.body);
  resize();

  const camPos = V(0, 0, 0), camTarget = V(0, 0, 0);
  let first = true, last = performance.now(), session = performance.now(), frames = 0, fpsAt = performance.now(), prevPos = V(0, 0, 0);
  let exploring = false;
  const orbit = { yaw: 0, pitch: 0.3, dist: 900, target: V(0, 120, 0) };
  const hudSector = $("tSector"), hudAlt = $("tAlt"), hudVel = $("tVel"), hudTime = $("tTime"), hudPos = $("bPos"), hudFps = $("bFps");
  const rail = $("rail");
  const veilEl = $("veil");

  const tick = (now) => {
    requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    const s = storyState();
    let f;
    if (exploring) {
      f = { space: "out", pose: { target: orbit.target, dir: V(Math.sin(orbit.yaw) * Math.cos(orbit.pitch), Math.sin(orbit.pitch), Math.cos(orbit.yaw) * Math.cos(orbit.pitch)), dist: orbit.dist }, veil: 0 };
    } else f = frameOf(s);
    setSpace(f.space);
    veilEl.style.opacity = String(f.veil);
    const goalPos = f.pose.target.clone().addScaledVector(f.pose.dir, f.pose.dist);
    // The camera follows its target position by 1 − e^(−3.2·dt) each step — it jumps immediately when the space changes and on the first frame
    const k = first || f.veil > 0.98 ? 1 : 1 - Math.exp(-dt * 3.2);
    camTarget.lerp(f.pose.target, k); camPos.lerp(goalPos, k);
    first = false;
    camera.position.copy(camPos); camera.lookAt(camTarget);
    // On left-card sections the screen shifts sideways by min(260, width × .2) so the building sits opposite the card (on phones, down 20%), and on the middle section up 12%
    let leftW = 0, centreW = 0;
    order.forEach((id, i) => { const w = weight(i, s); if (layoutOf(i) === "left") leftW += w; else if (spaceOf(i) !== "globe") centreW += w; });
    const phone = W <= 760;
    const tx = exploring ? 0 : phone ? 0 : -Math.min(260, W * 0.2) * leftW * (rtl() ? -1 : 1);
    const ty = exploring ? 0 : (phone ? H * 0.2 * leftW : 0) - H * 0.12 * centreW;
    const kv = 1 - Math.exp(-dt * 3.2);
    view.x += (tx - view.x) * kv; view.y += (ty - view.y) * kv;
    camera.setViewOffset(W, H, view.x, view.y, W, H);
    // Night light · seeing through · stake
    let night = 0, xray = 0;
    order.forEach((id, i) => { const w = weight(i, s); night += (CH[id].night || 0) * w; xray += (CH[id].xray ? 1 : 0) * w; });
    if (!cyber) { mats.sky.uniforms.night.value = night; }
    mats.sea.uniforms.night.value = night; mats.sea.uniforms.xray.value = xray; mats.sea.uniforms.time.value = now / 1000;
    mats.sail.emissiveIntensity = night * 0.9; mats.nightLight.intensity = night * 5;
    [mats.sand, mats.lawn, mats.rock].forEach((m) => { m.opacity = 1 - 0.75 * xray; m.depthWrite = xray < 0.5; });
    mats.piles.visible = xray > 0.02;
    globe.getObjectByName("clouds").rotation.y += dt * 0.01;
    mahara.getObjectByName("fish").children.forEach((o) => { const u = o.userData; u.a += dt * u.s; o.position.set(Math.cos(u.a) * u.r, u.h, Math.sin(u.a) * u.r); o.rotation.y = -u.a; });
    renderer.render(scene, camera);
    // Pins, dimensions and labels show when that section’s weight exceeds .5
    pins.forEach((p) => { const w = exploring ? 0 : weight(p.idx, s); const q = toScreen(p.at); p.el.style.transform = `translate(${q.x}px, ${q.y}px)`; p.el.dataset.off = String(!(w > 0.5 && q.ok)); });
    marks.forEach((m) => {
      const w = exploring ? 0 : weight(m.idx, s);
      m.g.style.opacity = smooth((w - 0.4) / 0.4).toFixed(3);
      if (w <= 0.01) return;
      m.def.paths.forEach((pp, n) => { m.paths[n].setAttribute("d", pp.map((v, k) => { const q = toScreen(v); return `${k ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join(" ")); });
      m.def.labels.forEach(([, at], n) => { const q = toScreen(at); m.texts[n].setAttribute("x", q.x.toFixed(1)); m.texts[n].setAttribute("y", q.y.toFixed(1)); });
    });
    labels.forEach((l) => { const w = weight(l.idx, s); const q = toScreen(l.at); l.el.style.transform = `translate(${q.x}px, ${q.y}px) translate(-50%, -50%)`; l.el.style.opacity = smooth((w - 0.3) / 0.4).toFixed(3); });
    // Dashboard
    frames++;
    if (now - fpsAt > 500) { hudFps.textContent = `FPS ${Math.round((frames * 1000) / (now - fpsAt))}`; frames = 0; fpsAt = now; }
    const v = camPos.distanceTo(prevPos) / Math.max(dt, 1e-3); prevPos.copy(camPos);
    hudSector.textContent = (order[s.active] || "—").toUpperCase();
    hudAlt.textContent = `${Math.max(0, Math.round(camPos.y))} M`;
    hudVel.textContent = `${v.toFixed(1)} M/S`;
    const sec = Math.floor((now - session) / 1000); hudTime.textContent = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    hudPos.textContent = `X:${Math.round(camPos.x)} Y:${Math.round(camPos.y)} Z:${Math.round(camPos.z)}`;
  };

  // Bake the shaders of all spaces once at the start — so it doesn’t stall when the space changes
  for (const name of ["atrium", "mahara", "suite", "globe", "out"]) { setSpace(name); try { renderer.compile(scene, camera); } catch {} }
  curSpace = null;
  applyLook();
  requestAnimationFrame(tick);

  // ───────── Curtain — after the icon finishes drawing (3s at most) it stays .8s, then lifts away in .6s ─────────
  const boot = $("boot"), cyload = $("loader");
  const drawn = (el) => Promise.race([Promise.all(el.getAnimations({ subtree: true }).filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished)).catch(() => {}), new Promise((r) => setTimeout(r, 3000))])
    .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).then(() => new Promise((r) => setTimeout(r, 800)));
  const hide = (el) => { el.classList.add("is-done"); setTimeout(() => el.classList.remove("is-on", "is-done"), 650); };
  cyload.prepend(boot.querySelector(".bz-icon").cloneNode(true));
  if (cyber) { cyload.classList.add("is-on"); boot.remove(); drawn(cyload).then(() => hide(cyload)); }
  else drawn(boot).then(() => { hide(boot); setTimeout(() => boot.remove(), 700); });

  // ── Type switcher — going to cyber, a connecting curtain fills for 1.6s and then lifts ──
  const setMode = (m) => {
    const was = root.dataset.mode === "cyber";
    if (m === "cyber") root.dataset.mode = "cyber"; else delete root.dataset.mode;
    try { localStorage.setItem("bz-mode", m); } catch {}
    $("modeClassic").setAttribute("aria-pressed", String(m !== "cyber"));
    $("modeCyber").setAttribute("aria-pressed", String(m === "cyber"));
    applyLook();
    if (m === "cyber" && !was && !reduce) { cyload.classList.remove("is-done"); cyload.classList.add("is-on"); drawn(cyload).then(() => hide(cyload)); }
  };
  $("modeClassic").addEventListener("click", () => setMode("classic"));
  $("modeCyber").addEventListener("click", () => setMode("cyber"));
  setMode(root.dataset.mode === "cyber" ? "cyber" : "classic");

  // ── Language switcher — passes along the name of the section at screen center so other versions open at the same section ──
  document.querySelectorAll(".bz-lang a").forEach((a) => a.addEventListener("click", () => {
    const mid = innerHeight / 2;
    const sec = [...document.querySelectorAll("main [id], header[id], footer[id]")].find((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (sec) a.href = `${a.getAttribute("href").split("#")[0]}#${sec.id}`;
  }));

  // ── Hero pause button ──
  $("pauseHero").addEventListener("click", (e) => { const on = document.querySelector(".bz-hero").classList.toggle("is-paused"); e.currentTarget.setAttribute("aria-pressed", String(on)); });

  // ── Go to section · follow the guide · view again ──
  const goTo = (i) => { measure(); scrollTo({ top: Math.max(0, centers[i] - innerHeight / 2), behavior: reduce ? "auto" : "smooth" }); };
  let tour = 0;
  const bar = $("tourbar");
  const label = (i) => sections[i].querySelector(".bz-big, .bz-sub")?.textContent.trim() || sections[i].id;
  const stopTour = () => { clearInterval(tour); tour = 0; bar.hidden = true; };
  $("tourLink").addEventListener("click", () => {
    let i = 0; stopTour(); goTo(i); bar.hidden = false; bar.querySelector("span").textContent = `Viewing with the guide — ${label(i)}`;
    tour = setInterval(() => { i++; if (i >= order.length) return stopTour(); goTo(i); bar.querySelector("span").textContent = `Viewing with the guide — ${label(i)}`; }, 4200);
  });
  bar.querySelector("button").addEventListener("click", stopTour);

  // ── Real photos — press or hit Enter to enlarge, press the panel or Esc to close ──
  const box = $("photoBox");
  let lastPhoto = null;
  const openPhoto = (f) => { lastPhoto = f; box.querySelector("figcaption").textContent = `${f.getAttribute("aria-label").replace(/^Enlarge photo: /, "")} · ${f.querySelector(".bz-real__cr").textContent}`; box.classList.add("is-open"); box.querySelector("button").focus(); };
  const closePhoto = () => { box.classList.remove("is-open"); lastPhoto?.focus(); };
  document.querySelectorAll(".bz-real").forEach((f) => {
    f.addEventListener("click", (e) => { e.stopPropagation(); openPhoto(f); });
    f.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPhoto(f); } });
  });
  box.addEventListener("click", (e) => { e.stopPropagation(); closePhoto(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && box.classList.contains("is-open")) { e.stopImmediatePropagation(); closePhoto(); } }, true);
  ["wheel", "touchstart", "keydown"].forEach((t) => addEventListener(t, () => tour && stopTour(), { passive: true }));
  $("replay").addEventListener("click", () => goTo(0));

  // ── 3D tour — drag to rotate, wheel to move closer, click again or press Esc to return to the story ──
  const exploreBtn = $("enterExplore");
  const back = document.createElement("button"); back.type = "button"; back.className = "bz-btn-outline bz-back"; back.textContent = "Back to story"; back.hidden = true; document.body.append(back);
  // On entering explore mode, close the pinned card, lock page scroll, then start from the foreground position (target 0,60,10 · distance 980)
  const setExplore = (on) => {
    exploring = on; document.body.classList.toggle("is-exploring", on); back.hidden = !on;
    root.style.overflow = on ? "hidden" : "";
    card.hidden = true; stopTour();
    if (on) { const o = CH.overview.cam; orbit.target = o.target.clone(); orbit.dist = o.dist; orbit.yaw = Math.atan2(o.dir.x, o.dir.z); orbit.pitch = Math.asin(o.dir.y); first = true; }
  };
  exploreBtn?.addEventListener("click", () => setExplore(true));
  back.addEventListener("click", () => setExplore(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && exploring) setExplore(false); });
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => { if (!exploring) return; drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => { if (!drag) return; orbit.yaw -= (e.clientX - drag.x) * 0.005; orbit.pitch = Math.max(0.02, Math.min(1.3, orbit.pitch + (e.clientY - drag.y) * 0.004)); drag = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener("pointerup", () => (drag = null));
  canvas.addEventListener("wheel", (e) => { if (!exploring) return; e.preventDefault(); orbit.dist = Math.max(160, Math.min(2400, orbit.dist * (1 + e.deltaY * 0.001))); }, { passive: false });

  // ── Phone: left card as a folded pill ──
  const hintify = () => {
    const phone = innerWidth <= 760;
    sections.forEach((s) => {
      if (!s.classList.contains("--left")) return;
      const c = s.querySelector(".bz-copy");
      let btn = c.querySelector(".bz-hint-btn");
      if (phone && !btn) {
        const src = c.querySelector(".bz-stack, .bz-sub") || c.querySelector("p");
        src.classList.add("bz-hint-src");
        btn = document.createElement("button"); btn.type = "button"; btn.className = "bz-hint-btn"; btn.innerHTML = 'MORE <svg viewBox="0 0 10 10"><path d="M2 3.5l3 3 3-3"/></svg>';
        btn.setAttribute("aria-expanded", "false");
        c.append(btn); c.classList.add("is-hint");
        c.addEventListener("click", (e) => { if (!c.classList.contains("is-hint")) return; if (c.classList.contains("is-open") && !e.target.closest(".bz-hint-btn")) return; const open = c.classList.toggle("is-open"); btn.setAttribute("aria-expanded", String(open)); requestAnimationFrame(measure); });
      } else if (!phone && btn) { btn.remove(); c.classList.remove("is-hint", "is-open"); }
    });
  };
  hintify();
  addEventListener("resize", hintify);

  // ── Moments — the card nearest the center brightens and the dot follows ──
  const track = $("track"), dotsEl = $("dots");
  if (track) {
    const cards = [...track.children];
    const dots = cards.map((c, i) => { const d = document.createElement("button"); d.type = "button"; d.className = "bz-dot"; d.setAttribute("aria-label", `${i + 1}`); d.addEventListener("click", () => to(i)); dotsEl.append(d); return d; });
    let cur = 0;
    const to = (i) => { i = Math.max(0, Math.min(cards.length - 1, i)); const c = cards[i]; track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" }); };
    const mark = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bd = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      cur = best;
      cards.forEach((c, i) => c.classList.toggle("is-on", i === best));
      dots.forEach((d, i) => d.setAttribute("aria-current", String(i === best)));
    };
    track.addEventListener("scroll", mark, { passive: true });
    const dlg = $("moment");
    track.querySelectorAll("[data-moment]").forEach((b) => b.addEventListener("click", () => { const c = b.closest(".bz-moment"); dlg.querySelector("h3").textContent = c.querySelector("h3").textContent; try { dlg.showModal(); } catch { dlg.setAttribute("open", ""); } }));
    dlg.querySelector(".bz-x").addEventListener("click", () => dlg.close());
    $("prev").addEventListener("click", () => to(cur - 1));
    $("next").addEventListener("click", () => to(cur + 1));
    requestAnimationFrame(() => { to(0); mark(); });
  }
  addEventListener("load", measure);
};
requestAnimationFrame(() => setTimeout(bzStory, 0));
