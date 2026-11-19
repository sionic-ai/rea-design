// The original walks through four baked GLB rooms with camera animation. Models and textures aren’t used, only the same composition, colors and prop placement
// Built fresh from basic shapes and canvas drawings. Rooms are stacked at the same origin and only the room currently being walked is visible so light doesn’t mix.
window.PKWorld = async function build(THREE, onRoom = () => {}) {
  // Rests one frame after building each room so the loader text lights up in line with real progress
  const breathe = (i) => (onRoom(i), new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))));
  const css = (n, fb) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fb;

  // ── Room color is made from the skin ──
  // Paints the background color (--kf-accent, --site-* in shared.css) onto a canvas and reads it as sRGB (since the computed value comes out as oklch text),
  // Prop colors are written from that background in oklch as lightness l times, chroma c times, hue h added — the original skin gives the original values as is, and swapping the skin makes the room tone follow
  const probeCtx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probeEl = document.body.appendChild(document.createElement("i"));
  const readRGB = (v) => {
    probeEl.style.color = `var(${v})`;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = getComputedStyle(probeEl).color;
    probeCtx.fillRect(0, 0, 1, 1);
    return [...probeCtx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((x) => x / 255);
  };
  const lin = (x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  const gam = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  function toLch([r, g, b]) {
    const R = lin(r), G = lin(g), B = lin(b);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(a, bb), (Math.atan2(bb, a) * 180) / Math.PI];
  }
  function fromLch(L, Cc, H) {
    const h = (H * Math.PI) / 180, a = Cc * Math.cos(h), b = Cc * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
      .map((x) => Math.round(255 * Math.min(1, Math.max(0, gam(x)))));
  }
  const BASE = {
    accent: "--kf-accent", accentSoft: "--kf-accent-soft",
    warm: "--site-plaster-warm", cool: "--site-plaster-cool", wood: "--site-wood", woodDark: "--site-wood-dark", bronze: "--site-bronze",
    terracotta: "--site-terracotta", duskTop: "--site-dusk-top", duskMid: "--site-dusk-mid", duskLow: "--site-dusk-low",
    skyTop: "--site-sky-top", skyLow: "--site-sky-low", water: "--site-water", leaf: "--site-leaf", autumn: "--site-autumn",
  };
  const lch = {};
  for (const k in BASE) lch[k] = toLch(readRGB(BASE[k]));
  probeEl.remove();
  const toneRGB = (k, lr = 1, cr = 1, dh = 0) => fromLch(lch[k][0] * lr, lch[k][1] * cr, lch[k][2] + dh);
  const tone = (k, lr, cr, dh, alpha = 1) => {
    const [r, g, b] = toneRGB(k, lr, cr, dh);
    return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
  };
  const C = {};
  for (const k in BASE) C[k] = tone(k);
  const font = {
    display: css("--kf-font-display", "sans-serif"),
    sans: css("--kf-font-sans", "sans-serif"),
  };

  // ── Seed random: same layout even when reopened ──
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();

  // ── Material · shape helpers ──
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
  const baked = (map, o = {}) => new THREE.MeshBasicMaterial({ map, toneMapped: false, ...o });
  const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...o });
  function add(parent, geo, mat, x = 0, y = 0, z = 0, ry = 0, { cast = true, receive = true, rx = 0, rz = 0 } = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = cast;
    m.receiveShadow = receive;
    parent.add(m);
    return m;
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, s = 40) => new THREE.CylinderGeometry(rt, rb, h, s);
  function roundRect(s, w, h, r, cx = 0, cy = 0) {
    const x = cx - w / 2, y = cy - h / 2;
    r = Math.min(r, w / 2, h / 2);
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r);
    s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }
  // Straight at the bottom, with only the two top corners rounded, like a door (origin at bottom center)
  function doorPath(s, w, h, r, cx = 0, y0 = 0) {
    s.moveTo(cx - w / 2, y0);
    s.lineTo(cx + w / 2, y0);
    s.lineTo(cx + w / 2, y0 + h - r);
    s.absarc(cx + w / 2 - r, y0 + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(cx - w / 2 + r, y0 + h);
    s.absarc(cx - w / 2 + r, y0 + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(cx - w / 2, y0);
    return s;
  }
  const archPath = (s, w, h, cx = 0, y0 = 0) => doorPath(s, w, h, w / 2 - 0.0001, cx, y0);
  function softBox(w, h, d, r = 0.06) {
    const s = roundRect(new THREE.Shape(), w - 2 * r, h - 2 * r, Math.min(w, h) * 0.18);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 5 });
    g.center();
    return g;
  }
  function stadium(len, wid, depth, bevel = 0.02) {
    const s = roundRect(new THREE.Shape(), len, wid, wid / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    g.center();
    return g;
  }
  const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
  function rock(r, detail = 3, amp = 0.28) {
    const g = new THREE.IcosahedronGeometry(r, detail);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = v.clone().normalize();
      const k = Math.sin(n.x * 5.1 + n.y * 2.3) * 0.5 + Math.sin(n.y * 7.7 - n.z * 3.1) * 0.3 + Math.sin(n.z * 11.3 + n.x * 6.7) * 0.2;
      v.addScaledVector(n, k * amp * r);
      v.y *= 0.82;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }

  // ── Canvas Drawing ──
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    // If a dozen big canvases are GPU canvases, content gets erased when memory runs short and rises black — draw with CPU canvases
    const g = c.getContext("2d", { willReadFrequently: true });
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  function grain(g, w, h, n, alpha, light = tone("duskLow", 1.1851, 0, 0), dark = tone("bronze", 0, 0, 0)) {
    for (let i = 0; i < n; i++) {
      g.globalAlpha = alpha * rnd();
      g.fillStyle = rnd() > 0.5 ? light : dark;
      const s = rr(1, 3);
      g.fillRect(rnd() * w, rnd() * h, s, s);
    }
    g.globalAlpha = 1;
  }
  function textTex(lines, { w = 1024, h = 512, color = tone("bronze", 0.6947, 0.6031, -7.8981), align = "left", pad = 40 } = {}) {
    return canvasTex(w, h, (g) => {
      g.textBaseline = "alphabetic";
      g.fillStyle = color;
      let y = pad;
      for (const L of lines) {
        y += L.size * (L.gapBefore ?? 1.1);
        g.font = `${L.weight || 400} ${L.size}px ${L.font || font.sans}`;
        g.letterSpacing = `${(L.ls || 0) * L.size}px`;
        g.textAlign = align;
        const x = align === "center" ? w / 2 : pad;
        if (L.bar) {
          g.fillRect(x, y - L.size * 0.6, L.bar, Math.max(2, L.size * 0.08));
          continue;
        }
        g.fillText(L.text, x, y);
      }
    });
  }
  function wallPlane(tex, w, h) {
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  }

  const wallTexts = {};
  document.querySelectorAll("[data-wall]").forEach((el) => {
    wallTexts[el.dataset.wall] = [...el.querySelectorAll("p")].map((p) => ({ k: p.dataset.k || "", text: p.textContent.trim() }));
  });
  const labels = [...document.querySelectorAll("[data-media]")].map((el) => ({ kind: el.dataset.media, label: el.dataset.label || "", el }));

  // Leaf cluster: scatters small leaf plates around the branch tip (a single InstancedMesh)
  function foliage(parent, centers, { count = 300, spread = 0.5, size = 0.09, colors = [C.leaf], flat = 1 } = {}) {
    const ls = new THREE.Shape();
    ls.moveTo(0, 0);
    ls.quadraticCurveTo(size * 0.5, size * 0.36, size, 0);
    ls.quadraticCurveTo(size * 0.5, -size * 0.36, 0, 0);
    const geo = new THREE.ShapeGeometry(ls, 3);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, side: THREE.DoubleSide });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const c = centers[i % centers.length];
      const r = spread * Math.cbrt(rnd());
      const th = rnd() * Math.PI * 2, ph = Math.acos(rr(-1, 1));
      p.set(c[0] + r * Math.sin(ph) * Math.cos(th), c[1] + r * Math.cos(ph) * flat, c[2] + r * Math.sin(ph) * Math.sin(th));
      e.set(rr(-1.2, 1.2), rr(0, Math.PI * 2), rr(-1.2, 1.2));
      q.setFromEuler(e);
      const k = rr(0.7, 1.3);
      s.set(k, k, k);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
      col.set(colors[i % colors.length]).offsetHSL(rr(-0.02, 0.02), rr(-0.08, 0.08), rr(-0.1, 0.06));
      mesh.setColorAt(i, col);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function twigs(parent, base, n, len, color = tone("bronze", 0.8966, 0.4984, -1.9033), spreadR = 0.35) {
    const mat = std(color, { roughness: 0.9 });
    const tips = [];
    for (let i = 0; i < n; i++) {
      const a = rr(0, Math.PI * 2), tilt = rr(0.12, 0.55), L = len * rr(0.7, 1.1);
      const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(a), Math.cos(tilt), Math.sin(tilt) * Math.sin(a));
      const g = cyl(0.004, 0.008, L, 5);
      g.translate(0, L / 2, 0);
      const m = add(parent, g, mat, base[0], base[1], base[2], 0, { receive: false });
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      for (let k = 0.45; k <= 1.0001; k += 0.11) tips.push([base[0] + dir.x * L * k, base[1] + dir.y * L * k, base[2] + dir.z * L * k]);
    }
    return tips;
  }

  // Build an environment to reflect in metal·glass, with a different sky tint per room
  function envScene(top, mid, low) {
    const s = new THREE.Scene();
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { a: { value: new THREE.Color(top) }, b: { value: new THREE.Color(mid) }, c: { value: new THREE.Color(low) } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform vec3 a,b,c; varying vec3 vP; void main(){ float y=vP.y; vec3 col = y>0.0 ? mix(b,a,smoothstep(0.0,0.8,y)) : mix(b,c,smoothstep(0.0,-0.5,y)); gl_FragColor=vec4(col,1.0); }",
    });
    s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat));
    return s;
  }

  const rooms = [];
  const updaters = [];

  // ════════ Room 1 — an arched door in the outer wall, a sunlit living room inside ════════
  {
    const g = new THREE.Group();
    g.name = "living";
    const W = 1.5, H = 2.9, R = 0.42;

    // Outer wall: a canvas with sun-ray bands and plaster grain baked in. 16×8m at 2048×1024
    const wallTex = canvasTex(2048, 1024, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, tone("woodDark", 1.0974, 0.6895, 6.0201));
      gr.addColorStop(0.5, C.warm);
      gr.addColorStop(0.9, tone("warm", 0.9224, 0.9742, -2.5705));
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
      // Slanted rays from top center to lower right (two edge lines measured from the original screen)
      const L = (y) => 0.45 + 0.6 * (y - 0.36), Rr = (y) => 0.56 + 0.743 * (y - 0.36);
      const beam = c.createLinearGradient(0, 0, 0, h * 0.9);
      beam.addColorStop(0, tone("duskLow", 1.0369, 1.0883, 12.6053));
      beam.addColorStop(0.55, tone("duskLow", 1.0046, 1.1608, 11.5615, 0.85));
      beam.addColorStop(1, tone("accent", 1.0231, 1.1494, -3.6986, 0));
      c.save();
      c.filter = "blur(46px)";
      c.fillStyle = beam;
      c.beginPath();
      c.moveTo(L(0) * w, 0);
      c.lineTo(Rr(0) * w, 0);
      c.lineTo(Rr(0.9) * w, h * 0.9);
      c.lineTo(L(0.9) * w, h * 0.9);
      c.closePath();
      c.fill();
      c.restore();
      const vg = c.createRadialGradient(w * 0.55, h * 0.5, 60, w * 0.5, h * 0.55, w * 0.3);
      vg.addColorStop(0, tone("bronze", 0, 0, 0, 0));
      vg.addColorStop(1, tone("bronze", 0.6492, 0.6676, -5.4812, 0.28));
      c.fillStyle = vg;
      c.fillRect(0, 0, w, h);
      grain(c, w, h, 30000, 0.07, tone("duskLow", 1.0737, 0.615, 12.4333), tone("woodDark", 0.9238, 0.7121, 5.2247));
    });
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-24, -0.9); wallShape.lineTo(24, -0.9); wallShape.lineTo(24, 13); wallShape.lineTo(-24, 13); wallShape.lineTo(-24, -0.9);
    wallShape.holes.push(doorPath(new THREE.Path(), W, H, R));
    const wallGeo = new THREE.ExtrudeGeometry(wallShape, { depth: 0.4, bevelEnabled: false, curveSegments: 16 });
    wallGeo.translate(0, 0, -0.4);
    wallTex.repeat.set(1 / 16, 1 / 8);
    wallTex.offset.set(0.5, 0.9 / 8);
    const wall = add(g, wallGeo, [baked(wallTex), std(tone("bronze", 0.9752, 0.9385, -2.4819), { roughness: 0.5 })], 0, 0, 0, 0, { cast: false });
    wall.receiveShadow = false;

    // Two layers of leaf shadows on the wall: sway in the wind once every 9s
    // Shadow of leaves attached alternately along a branch — blurred just enough that each leaf stays visible, like the original
    const leafShadow = (branches, u0, u1, v0, v1, alpha) => canvasTex(2048, 1024, (c, w, h) => {
      c.filter = "blur(1.6px)";
      c.fillStyle = tone("bronze", 0.6586, 0.7167, -8.2629);
      c.strokeStyle = tone("bronze", 0.6586, 0.7167, -8.2629);
      for (let b = 0; b < branches; b++) {
        let x = rr(u0, u1) * w, y = rr(v0, v1) * h, a = rr(0, Math.PI * 2);
        const n = Math.floor(rr(4, 8));
        c.globalAlpha = alpha * rr(0.55, 1);
        for (let i = 0; i < n; i++) {
          const nx = x + Math.cos(a) * 20, ny = y + Math.sin(a) * 20;
          c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
          x = nx; y = ny; a += rr(-0.25, 0.25);
          for (const side of [-1, 1]) {
            c.save();
            c.translate(x, y);
            c.rotate(a + side * rr(0.5, 1.0));
            c.beginPath();
            c.ellipse(rr(14, 20), 0, rr(14, 22), rr(7, 11), 0, 0, Math.PI * 2);
            c.fill();
            c.restore();
          }
        }
      }
    });
    const shadows = [
      { tex: leafShadow(60, 0.63, 0.82, 0.3, 0.92, 0.3), z: 0.02, amp: 0.05 },
      { tex: leafShadow(22, 0.2, 0.36, 0.45, 0.85, 0.16), z: 0.025, amp: 0.035 },
    ].map((L, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, depthWrite: false, toneMapped: false }));
      m.position.set(0, 3.1, L.z);
      g.add(m);
      return { m, amp: L.amp, ph: i * 1.7 };
    });
    updaters.push((t) => {
      if (!g.visible) return;
      for (const s of shadows) {
        const k = Math.sin((t / 9) * Math.PI * 2 + s.ph);
        s.m.position.x = k * s.amp;
        s.m.position.y = 3.1 + Math.sin((t / 9) * Math.PI * 4 + s.ph) * s.amp * 0.4;
        s.m.rotation.z = k * 0.006;
      }
    });

    // Bronze door frame
    const frameShape = doorPath(new THREE.Shape(), W + 0.2, H + 0.1, R + 0.1, 0, -0.02);
    frameShape.holes.push(doorPath(new THREE.Path(), W, H, R));
    const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3, curveSegments: 20 });
    frameGeo.translate(0, 0, -0.42);
    const bronze = std(C.bronze, { metalness: 0.92, roughness: 0.26, envMapIntensity: 1.3 });
    add(g, frameGeo, bronze, 0, 0, 0);
    // A line of light running along the inside of the door frame
    add(g, box(0.018, H - 0.5, 0.02), glow(tone("duskLow", 1.1467, 0.3684, 19.2352)), -W / 2 + 0.03, (H - 0.5) / 2 + 0.05, -0.45, 0, { cast: false });

    // Door: opened inward on a left hinge (70° in Hero → 100° by scrolling)
    const hinge = new THREE.Group();
    hinge.position.set(-W / 2 + 0.02, 0, -0.44);
    g.add(hinge);
    const leafMat = std(tone("autumn", 0.9938, 0.899, 3.7421), { roughness: 0.42, envMapIntensity: 0.9 });
    add(hinge, box(W - 0.06, H - 0.06, 0.07), leafMat, (W - 0.06) / 2, (H - 0.06) / 2, -0.035);
    add(hinge, box(0.025, 0.55, 0.03), std(tone("bronze", 0.6903, 0.5785, -6.3007), { metalness: 0.6, roughness: 0.35 }), W - 0.2, 1.1, 0.02);
    const door = { hinge, closed: 1.05, open: 1.75 };

    // Three stone steps and a dark floor
    const stone = std(tone("cool", 1.0032, 1.2306, 12.721), { roughness: 0.3, envMapIntensity: 0.7 });
    add(g, box(1.8, 0.9, 0.55), stone, 0, -0.45, 0.27);
    add(g, box(3.3, 0.6, 1.2), stone, 0, -0.6, 1.4);
    add(g, box(3.7, 0.2, 1.8), stone, 0, -0.8, 4.3);
    add(g, new THREE.PlaneGeometry(80, 60), std(tone("bronze", 0.4618, 0.2796, -5.9869), { roughness: 0.16, envMapIntensity: 0.6 }), 0, -0.9, 25, 0, { rx: -Math.PI / 2, cast: false });
    add(g, box(48, 0.77, 0.3), std(tone("bronze", 0.6982, 0.5521, -4.4879), { roughness: 0.6 }), 0, -0.52, 0.12, 0, { cast: false });
    add(g, box(48, 0.035, 0.04), glow(tone("duskLow", 1.1403, 0.4315, 19.3536)), 0, -0.12, 0.28, 0, { cast: false });

    // ── Inside: 10×14m living room ──
    const inW = 10, inD = 14, inH = 3.6, back = -0.4 - inD;
    const plaster = (base, lit, patches) => canvasTex(1600, 600, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, tone("warm", 1.0206, 1.2368, -3.986));
      gr.addColorStop(0.3, base);
      gr.addColorStop(1, base);
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
      // Sunlight through the window: bright cells between the mullions
      if (patches) {
        c.save();
        c.filter = "blur(14px)";
        c.fillStyle = lit;
        for (const [x0, y0, cols, rows, cw, ch] of patches) {
          for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
            c.globalAlpha = rr(0.55, 0.8);
            c.fillRect(x0 * w + i * cw * w * 1.12, y0 * h + j * ch * h * 1.08, cw * w, ch * h);
          }
        }
        c.restore();
      }
      grain(c, w, h, 14000, 0.07, tone("duskLow", 1.1386, 0.3979, 15.2075), tone("woodDark", 1.1513, 0.872, 6.6937));
    });
    const backTex = plaster(tone("autumn", 1.0655, 0.8327, 2.1414), tone("duskLow", 1.0642, 0.9632, 16.2376), [[0.05, 0.28, 4, 3, 0.07, 0.17], [0.42, 0.3, 3, 3, 0.06, 0.16]]);
    add(g, new THREE.PlaneGeometry(inW, inH), baked(backTex), 0, inH / 2, back, 0, { cast: false });
    const sideTex = plaster(tone("autumn", 1.0081, 0.7963, 0.6754), tone("duskLow", 1.0337, 0.9906, 15.194), [[0.15, 0.35, 3, 2, 0.08, 0.2]]);
    add(g, new THREE.PlaneGeometry(inD, inH), baked(sideTex), inW / 2, inH / 2, -0.4 - inD / 2, -Math.PI / 2, { cast: false });
    const leftTex = plaster(tone("accentSoft", 0.9969, 0.9683, -4.9163), tone("duskLow", 1.0435, 0.7954, 14.8034), null);
    add(g, new THREE.PlaneGeometry(inD, inH), baked(leftTex), -inW / 2, inH / 2, -0.4 - inD / 2, Math.PI / 2, { cast: false });
    // Front wall seen from inside (back of the wall with a door opening)
    const innerFront = new THREE.Shape();
    innerFront.moveTo(-inW / 2, 0); innerFront.lineTo(inW / 2, 0); innerFront.lineTo(inW / 2, inH); innerFront.lineTo(-inW / 2, inH); innerFront.lineTo(-inW / 2, 0);
    innerFront.holes.push(doorPath(new THREE.Path(), W + 0.2, H + 0.1, R + 0.1));
    add(g, new THREE.ShapeGeometry(innerFront, 16), std(tone("accent", 0.9652, 0.7872, -12.768), { roughness: 0.9 }), 0, 0, -0.43, Math.PI, { cast: false });

    add(g, new THREE.PlaneGeometry(inW, inD), std(tone("cool", 1.0611, 1.4185, 4.3973), { roughness: 0.55 }), 0, 0, -0.4 - inD / 2, 0, { rx: -Math.PI / 2, cast: false });
    add(g, new THREE.PlaneGeometry(5.4, 4.2), std(tone("cool", 1.0303, 1.4324, 5.9451), { roughness: 0.95 }), -0.6, 0.006, -9.4, 0, { rx: -Math.PI / 2, cast: false });
    add(g, new THREE.PlaneGeometry(inW, inD), glow(tone("warm", 0.9009, 0.9271, -5.9865)), 0, inH, -0.4 - inD / 2, 0, { rx: Math.PI / 2, cast: false });
    // White band along the ceiling edge and indirect lighting
    const soffit = glow(tone("duskLow", 1.067, 0.3023, 10.2651));
    add(g, box(inW, 0.34, 0.9), soffit, 0, inH - 0.17, back + 0.45, 0, { cast: false });
    add(g, box(0.9, 0.34, inD), soffit, -inW / 2 + 0.45, inH - 0.17, -0.4 - inD / 2, 0, { cast: false });
    add(g, box(0.9, 0.34, inD), soffit, inW / 2 - 0.45, inH - 0.17, -0.4 - inD / 2, 0, { cast: false });
    add(g, box(inW - 1.8, 0.02, 0.03), glow(tone("duskLow", 1.1409, 0.4052, 17.7064)), 0, inH - 0.33, back + 0.92, 0, { cast: false });

    // Large window on the left wall: bright light behind black bars
    add(g, new THREE.PlaneGeometry(6.5, 2.9), glow(tone("duskLow", 1.1507, 0.2973, 15.7759)), -inW / 2 + 0.02, 1.65, -10.2, Math.PI / 2, { cast: false });
    const mullion = std(tone("bronze", 0.5344, 0.2128, 1.6986), { roughness: 0.5 });
    for (let i = 0; i <= 6; i++) add(g, box(0.06, 2.95, 0.06), mullion, -inW / 2 + 0.05, 1.65, -13.45 + i * 1.083);
    for (const y of [0.2, 1.2, 3.1]) add(g, box(0.06, 0.06, 6.5), mullion, -inW / 2 + 0.05, y, -10.2);

    // Right upon entering: a wooden slat partition on the right and a potted tree
    const slat = std(tone("wood", 0.9536, 0.886, 5.755), { roughness: 0.6 });
    for (let i = 0; i < 16; i++) add(g, box(0.05, 3.0, 0.05), slat, 0.45 + i * 0.12, 1.5, -3.7);
    add(g, new THREE.PlaneGeometry(2.0, 3.0), std(tone("duskLow", 0.9937, 0.6566, -3.5588), { roughness: 0.9 }), 1.35, 1.5, -3.78, 0, { cast: false });
    add(g, box(0.7, 0.35, 0.7), std(tone("duskLow", 1.067, 0.3023, 10.2651), { roughness: 0.8 }), 1.5, 0.17, -2.4);
    add(g, cyl(0.035, 0.06, 2.4, 8), std(tone("woodDark", 0.9696, 0.5679, 5.9283)), 1.5, 1.4, -2.4);
    const treeC = [];
    for (let i = 0; i < 9; i++) treeC.push([1.5 + rr(-0.5, 0.6), rr(2.1, 3.2), -2.4 + rr(-0.5, 0.5)]);
    foliage(g, treeC, { count: 900, spread: 0.42, size: 0.11, colors: [C.leaf, tone("leaf", 1.1024, 0.9649, -4.0612), tone("warm", 0.925, 1.4588, 50.1347)] });
    add(g, box(1.3, 0.42, 0.42), std(tone("duskLow", 1.0388, 0.3679, 11.9458)), -1.0, 0.21, -2.0);
    add(g, lathe([[0, 0], [0.14, 0.02], [0.17, 0.18], [0.1, 0.36], [0.05, 0.42], [0, 0.42]]), std(tone("bronze", 0.5337, 0.1291, -24.6402), { roughness: 0.3 }), -0.7, 0.42, -2.0);

    // A set of round sofas (arc around the table)
    const ct = [0.2, -9.5];
    const sofaMat = std(tone("duskLow", 1.0104, 0.7002, 8.7208), { roughness: 0.95 });
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (0.62 + i * 0.13);
      const r = 2.5, x = ct[0] + Math.cos(a) * r, z = ct[1] - Math.sin(a) * r * 0.85;
      const seg = new THREE.Group();
      seg.position.set(x, 0, z);
      seg.lookAt(ct[0], 0, ct[1]);
      g.add(seg);
      add(seg, softBox(1.05, 0.42, 0.95, 0.08), sofaMat, 0, 0.21, 0);
      add(seg, softBox(1.0, 0.46, 0.28, 0.1), sofaMat, 0, 0.62, -0.38);
      if (i % 2 === 0) add(seg, softBox(0.5, 0.38, 0.14, 0.06), std(tone("duskLow", 0.9947, 0.7591, 8.0991), { roughness: 1 }), rr(-0.2, 0.2), 0.62, -0.18, 0, { rx: -0.25 });
    }
    // Two-tier round table and vase branch
    add(g, cyl(0.75, 0.75, 0.26), std(tone("bronze", 0.8801, 0.5636, -3.1895), { roughness: 0.7 }), ct[0], 0.13, ct[1]);
    add(g, cyl(1.05, 1.05, 0.1, 64), std(tone("accent", 1.0206, 0.6121, -1.698), { roughness: 0.35, envMapIntensity: 0.6 }), ct[0], 0.31, ct[1]);
    add(g, lathe([[0, 0], [0.1, 0.01], [0.13, 0.12], [0.07, 0.34], [0.045, 0.4], [0, 0.4]]), std(tone("bronze", 0.5299, 0.0997, -19.6019), { roughness: 0.25 }), ct[0], 0.36, ct[1]);
    foliage(g, twigs(g, [ct[0], 0.74, ct[1]], 10, 0.75), { count: 260, spread: 0.06, size: 0.04, colors: [tone("woodDark", 1.0708, 0.9103, 66.546), tone("warm", 0.8964, 1.2572, 49.561)] });
    add(g, box(0.45, 0.08, 0.32), std(tone("bronze", 0.7989, 0.1926, 2.0804)), ct[0] - 0.55, 0.4, ct[1] + 0.25, 0.3);
    add(g, box(0.4, 0.05, 0.3), std(tone("duskLow", 1.0651, 0.3348, 16.1734)), ct[0] - 0.55, 0.46, ct[1] + 0.25, 0.3);
    add(g, box(0.45, 0.08, 0.32), std(tone("bronze", 0.7989, 0.1926, 2.0804)), ct[0] + 0.6, 0.4, ct[1] + 0.2, -0.2);
    add(g, lathe([[0, 0], [0.12, 0.0], [0.16, 0.08], [0, 0.04]]), std(tone("bronze", 0.9759, 0.1629, -5.763)), ct[0] + 0.6, 0.45, ct[1] + 0.2);

    // Dark curved desk and laptop on the right
    const deskMat = std(tone("bronze", 0.7792, 0.1966, -10.6518), { roughness: 0.5 });
    add(g, stadium(2.4, 0.85, 0.06), deskMat, 2.8, 0.76, -10.6);
    add(g, box(0.08, 0.74, 0.8), deskMat, 1.75, 0.37, -10.6);
    add(g, cyl(0.42, 0.42, 0.74), deskMat, 3.75, 0.37, -10.6);
    add(g, box(0.36, 0.015, 0.25), std(tone("duskLow", 1.0161, 0.0332, -159.9376), { metalness: 0.7, roughness: 0.3 }), 2.6, 0.8, -10.55);
    add(g, box(0.36, 0.24, 0.012), std(tone("duskLow", 1.0161, 0.0332, -159.9376), { metalness: 0.7, roughness: 0.3 }), 2.6, 0.92, -10.68, 0, { rx: -0.25 });
    add(g, cyl(0.24, 0.24, 0.08), std(tone("bronze", 0.6203, 0.1138, -2.9183)), 2.7, 0.48, -9.8);
    add(g, box(0.5, 0.55, 0.06), std(tone("bronze", 0.6203, 0.1138, -2.9183)), 2.7, 0.8, -9.55, 0, { rx: 0.15 });

    // Wooden bookshelf on the right back wall
    const shelf = std(tone("woodDark", 1.1548, 1.2937, -4.7424), { roughness: 0.6 });
    const sx = 3.0, sw = 2.9, sz = back + 0.25;
    add(g, box(sw, inH - 0.34, 0.45), std(tone("woodDark", 0.9796, 1.0778, -4.8509), { roughness: 0.7 }), sx, (inH - 0.34) / 2, sz - 0.02, 0, { cast: false });
    for (let i = 0; i <= 6; i++) add(g, box(sw, 0.04, 0.46), shelf, sx, 0.05 + i * 0.52, sz);
    for (let i = 0; i <= 3; i++) add(g, box(0.04, inH - 0.34, 0.46), shelf, sx - sw / 2 + i * (sw / 3), (inH - 0.34) / 2, sz);
    const bookCols = [tone("duskLow", 1.0995, 0.2633, 17.6414), tone("duskLow", 0.9915, 0.4618, 14.9525), tone("bronze", 0.8847, 0.5692, -7.2899), tone("warm", 0.9518, 1.2191, -7.4288), tone("duskLow", 1.1301, 0.1474, 17.9238), tone("woodDark", 0.9919, 0.5021, 3.9043)];
    for (let i = 0; i < 6; i++) for (let c = 0; c < 3; c++) {
      if (rnd() < 0.25) continue;
      let x = sx - sw / 2 + c * (sw / 3) + 0.1;
      const n = Math.floor(rr(3, 7));
      for (let k = 0; k < n; k++) {
        const bw = rr(0.03, 0.07), bh = rr(0.24, 0.4);
        add(g, box(bw, bh, rr(0.22, 0.3)), std(bookCols[Math.floor(rnd() * bookCols.length)]), x, 0.07 + i * 0.52 + bh / 2, sz + 0.05, 0, { cast: false });
        x += bw + 0.005;
      }
    }
    const shelfPlants = [];
    for (let i = 0; i < 4; i++) shelfPlants.push([sx + rr(0.1, 1.2), rr(1.8, 3.0), sz + 0.15]);
    foliage(g, shelfPlants, { count: 420, spread: 0.32, size: 0.1, colors: [tone("water", 0.8689, 1.1742, -65.0004), tone("leaf", 0.9025, 0.991, 9.1016)], flat: 1.6 });

    // Two rows of long horizontal black pendants etc.
    for (const [x0, z0, L] of [[-0.2, -7.6, 4.6], [-0.2, -11.2, 3.2]]) {
      add(g, box(L, 0.05, 0.09), std(tone("bronze", 0.5384, 0.0957, 8.5454), { roughness: 0.4 }), x0, 2.55, z0, 0, { cast: false });
      add(g, box(L - 0.1, 0.01, 0.05), glow(tone("duskLow", 1.1444, 0.3606, 16.521)), x0, 2.52, z0, 0, { cast: false });
      for (const s of [-1, 1]) add(g, cyl(0.004, 0.004, 1.05, 4), std(tone("bronze", 0.5204, 0, 0)), x0 + s * (L / 2 - 0.4), 3.07, z0, 0, { cast: false });
    }

    // Text on the left of the back wall: small wide-spaced keyword · two-line copy · underline
    const lv = wallTexts.living || [];
    const kicker = lv.find((l) => l.k === "kicker")?.text || "";
    const lines = lv.filter((l) => l.k === "line").map((l) => l.text);
    const tTex = textTex([
      { text: kicker, size: 34, weight: 500, ls: 0.32, gapBefore: 1 },
      ...lines.map((text, i) => ({ text, size: 40, weight: 400, ls: 0.01, gapBefore: i ? 1.45 : 1.6 })),
      { bar: 150, size: 40, gapBefore: 0.9 },
    ], { w: 1024, h: 400, color: tone("bronze", 0.8248, 0.801, -5.7485) });
    const tPlane = wallPlane(tTex, 2.4, 0.94);
    tPlane.position.set(-2.55, 1.95, back + 0.01);
    g.add(tPlane);

    // Light
    g.add(new THREE.HemisphereLight(tone("duskLow", 1.0735, 0.8548, 9.196), tone("bronze", 0.9758, 0.9237, -3.7237), 1.0));
    const sun = new THREE.DirectionalLight(tone("duskLow", 1.059, 0.9915, 10.1019), 3.2);
    sun.position.set(-9, 7, -5);
    sun.target.position.set(1, 0, -9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.02;
    g.add(sun, sun.target);
    const porch = new THREE.DirectionalLight(tone("duskLow", 1.0943, 0.6542, 6.699), 1.3);
    porch.position.set(-3, 6, 10);
    porch.target.position.set(0, 0, 0);
    g.add(porch, porch.target);
    const entry = new THREE.PointLight(tone("duskLow", 1.0671, 0.9366, 10.7416), 14, 9, 2);
    entry.position.set(0.2, 2.6, -2.2);
    g.add(entry);

    rooms.push({
      name: "living",
      group: g,
      bg: tone("bronze", 0.6312, 0.2946, 3.472),
      env: envScene(tone("duskLow", 1.0554, 0.7997, 14.0031), tone("autumn", 1.0655, 0.8327, 2.1414), tone("bronze", 0.7219, 0.5657, -1.9388)),
      door,
    });
  }

  await breathe(1);
  // ════════ Room 2 — exhibition hall with a round disc wall, stones and black spheres ════════
  {
    const g = new THREE.Group();
    g.name = "gallery";
    const back = -1.6;
    const wallTex = canvasTex(1600, 1200, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, w, 0);
      gr.addColorStop(0, tone("cool", 1.0526, 1.0559, 3.4745));
      gr.addColorStop(0.5, C.cool);
      gr.addColorStop(1, tone("warm", 1.0417, 0.7667, -8.1919));
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
      const v = c.createLinearGradient(0, 0, 0, h);
      v.addColorStop(0, tone("bronze", 0.7145, 0.4382, 7.3801, 0.35));
      v.addColorStop(0.5, tone("bronze", 0, 0, 0, 0));
      v.addColorStop(1, tone("bronze", 0.7145, 0.4382, 7.3801, 0.2));
      c.fillStyle = v;
      c.fillRect(0, 0, w, h);
      grain(c, w, h, 30000, 0.09, tone("duskLow", 1.0666, 0.2706, 9.1155), tone("bronze", 1.0766, 0.5155, 3.4374));
    });
    add(g, new THREE.PlaneGeometry(12, 6), baked(wallTex), 0, 3, back, 0, { cast: false });
    add(g, new THREE.PlaneGeometry(14, 14), std(tone("cool", 0.9847, 0.9072, 3.7695), { roughness: 0.3, envMapIntensity: 0.7 }), 0, 0, 3, 0, { rx: -Math.PI / 2, cast: false });
    add(g, new THREE.CircleGeometry(2.9, 64), std(tone("warm", 0.9724, 0.5619, 0.2868), { roughness: 0.95 }), 0.1, 0.004, 0.4, 0, { rx: -Math.PI / 2, cast: false });
    add(g, new THREE.PlaneGeometry(14, 14), glow(tone("warm", 0.9941, 0.5161, -1.1366)), 0, 4.6, 3, 0, { rx: Math.PI / 2, cast: false });

    // Disc: a bright circle slightly off the wall with a rim glow spreading behind
    const discTex = canvasTex(1024, 1024, (c, w, h) => {
      const gr = c.createRadialGradient(w * 0.42, h * 0.38, 40, w / 2, h / 2, w / 2);
      gr.addColorStop(0, tone("duskMid", 0.983, 0.4434, 44.8657));
      gr.addColorStop(0.8, tone("cool", 1.0421, 0.8785, 5.2135));
      gr.addColorStop(1, tone("accent", 1.0135, 0.4837, -2.2552));
      c.fillStyle = gr;
      c.beginPath();
      c.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      c.fill();
      grain(c, w, h, 9000, 0.05, tone("duskLow", 1.1851, 0, 0), tone("woodDark", 1.0105, 0.423, 13.2139));
      c.fillStyle = tone("bronze", 0.895, 0.5375, 3.0541);
      c.font = `500 46px ${font.sans}`;
      c.letterSpacing = `${46 * 0.42}px`;
      (wallTexts["gallery-disc"] || []).forEach((l, i) => c.fillText(l.text, w * 0.3, h * 0.3 + i * 82));
    });
    add(g, cyl(1.55, 1.55, 0.08, 96), std(tone("accent", 0.9736, 0.4898, -5.7497), { roughness: 0.8 }), 0.35, 2.6, back + 0.05, 0, { rx: Math.PI / 2, cast: false });
    add(g, new THREE.CircleGeometry(1.55, 96), baked(discTex), 0.35, 2.6, back + 0.091, 0, { cast: false });
    add(g, new THREE.RingGeometry(1.53, 1.68, 96), glow(tone("duskLow", 1.0426, 0.8376, 13.3875), { transparent: true, opacity: 0.3 }), 0.35, 2.6, back + 0.01, 0, { cast: false });

    const plinth = std(tone("accent", 0.9731, 0.5138, -3.8832), { roughness: 0.85 });
    add(g, softBox(3.5, 0.66, 0.95, 0.03), plinth, 0.5, 0.33, -1.05);
    add(g, rock(0.42), std(tone("cool", 1.0401, 1.2723, 6.7017), { roughness: 0.95, flatShading: true }), -0.75, 0.98, -1.05, 0.6);
    add(g, lathe([[0, 0], [0.12, 0], [0.3, 0.12], [0.31, 0.15], [0, 0.07]]), std(tone("bronze", 0.6086, 0.096, -19.5821), { roughness: 0.4 }), 0.55, 0.66, -0.95);
    add(g, new THREE.SphereGeometry(0.21, 40, 24), std(tone("bronze", 0.5528, 0.0709, -10.4415), { roughness: 0.18, envMapIntensity: 1.2 }), 0.55, 0.96, -0.95);
    foliage(g, twigs(g, [0.55, 1.15, -0.95], 5, 0.42, tone("bronze", 0.7507, 0.3268, -3.483)), { count: 60, spread: 0.04, size: 0.035, colors: [tone("water", 0.8848, 1.014, -74.121)] });

    // Round stone pedestal in front, a book, a glass marble
    add(g, cyl(0.95, 0.98, 0.52, 64), std(tone("cool", 1.1053, 0.8458, 10.852), { roughness: 0.95 }), -0.1, 0.26, 0.9);
    const bookTex = canvasTex(512, 128, (c, w, h) => {
      c.fillStyle = tone("duskLow", 1.0919, 0.2317, 17.3018);
      c.fillRect(0, 0, w, h);
      c.fillStyle = tone("bronze", 0.7406, 0.3913, 1.3366);
      c.font = `500 34px ${font.display}`;
      c.textAlign = "center";
      c.fillText(wallTexts.book?.[0]?.text || "", w / 2, h * 0.62);
    });
    const paper = std(tone("duskLow", 1.0919, 0.2317, 17.3018));
    add(g, box(0.6, 0.06, 0.4), [paper, paper, new THREE.MeshStandardMaterial({ map: bookTex, roughness: 0.9 }), paper, paper, paper], 0.05, 0.55, 0.95, -0.12);
    add(g, new THREE.SphereGeometry(0.16, 40, 24), std(tone("duskLow", 1.1851, 0, 0), { roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.28, envMapIntensity: 2 }), -0.62, 0.68, 1.15);

    // Left vertical wing window, right vermilion panel and white stairs
    add(g, new THREE.PlaneGeometry(2.0, 4.6), glow(tone("duskLow", 1.1209, 0.217, 15.6396)), -4.6, 2.3, back + 0.02, 0, { cast: false });
    for (let i = 0; i < 9; i++) add(g, box(0.05, 4.6, 0.32), std(tone("duskLow", 1.0267, 0.1891, 14.8652), { roughness: 0.7 }), -5.45 + i * 0.22, 2.3, back + 0.2, 0.5);
    add(g, box(1.1, 4.6, 0.06), std(C.terracotta, { roughness: 0.75 }), 3.0, 2.3, back + 0.04);
    for (let i = 0; i < 3; i++) add(g, box(1.4 - i * 0.0, 0.2, 0.42), std(tone("duskLow", 1.0962, 0.1603, 9.9419), { roughness: 0.8 }), 2.7, 0.1 + i * 0.2, 0.6 - i * 0.42);
    add(g, cyl(0.008, 0.008, 1.8, 4), std(tone("bronze", 0.5204, 0, 0)), 1.25, 3.7, -1.0, 0, { cast: false });
    add(g, cyl(0.03, 0.03, 0.12, 12), std(tone("bronze", 0.5204, 0, 0)), 1.25, 2.78, -1.0, 0, { cast: false });

    const side = wallTexts["gallery-side"] || [];
    const sTex = textTex(side.map((l, i) => ({ text: l.text, size: 44, weight: 500, ls: 0.3, gapBefore: i ? (i === 2 ? 3.2 : 1.3) : 1 })), { w: 1024, h: 512, color: tone("bronze", 0.715, 0.4832, -3.1099) });
    const sPlane = wallPlane(sTex, 2.2, 1.1);
    sPlane.position.set(-2.55, 2.75, back + 0.01);
    g.add(sPlane);

    g.add(new THREE.HemisphereLight(tone("duskLow", 1.0749, 0.5125, 7.0062), tone("bronze", 1.0598, 0.5955, 3.7673), 1.1));
    const key = new THREE.DirectionalLight(tone("duskLow", 1.069, 0.8482, 6.6671), 3.0);
    key.position.set(-6, 5, 4);
    key.target.position.set(0.3, 0.5, -1);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 });
    key.shadow.bias = -0.0008;
    key.shadow.normalBias = 0.02;
    g.add(key, key.target);
    const halo = new THREE.PointLight(tone("duskLow", 1.0735, 0.8548, 9.196), 2.5, 4, 2);
    halo.position.set(0.35, 1.4, -0.3);
    g.add(halo);
    const warmSide = new THREE.PointLight(C.terracotta, 5, 6, 2);
    warmSide.position.set(2.4, 1.5, 0.4);
    g.add(warmSide);

    rooms.push({ name: "gallery", group: g, bg: tone("bronze", 0.7406, 0.3913, 1.3366), env: envScene(tone("duskLow", 1.0911, 0.3893, 9.9229), tone("cool", 1.0534, 1.1193, 4.3871), tone("bronze", 0.895, 0.5375, 3.0541)) });
  }

  await breathe(2);
  // ════════ Room 3 — Water garden at sunset ════════
  {
    const g = new THREE.Group();
    g.name = "water";
    // Sky sphere: purplish blue on top, a pink and orange cloud band toward the horizon, low mountain shadows
    const skyTex = canvasTex(2048, 1024, (c, w, h) => {
      const hz = h * 0.5;
      const gr = c.createLinearGradient(0, 0, 0, hz);
      gr.addColorStop(0, tone("skyTop", 0.9026, 0.6544, 14.4076));
      gr.addColorStop(0.45, C.duskTop);
      gr.addColorStop(0.78, C.duskMid);
      gr.addColorStop(1, C.duskLow);
      c.fillStyle = gr;
      c.fillRect(0, 0, w, hz);
      c.fillStyle = tone("cool", 1.0567, 1.6253, -35.6816);
      c.fillRect(0, hz, w, h - hz);
      // Clouds: stack flat, horizontally stretched hazy masses near the horizon
      for (let i = 0; i < 520; i++) {
        const y = hz - Math.pow(rnd(), 1.6) * h * 0.24;
        const x = rnd() * w;
        c.save();
        c.filter = `blur(${rr(2, 7)}px)`;
        c.globalAlpha = rr(0.25, 0.7);
        c.fillStyle = rnd() > 0.45 ? tone("duskLow", 1.0518, 0.5644, -21.5023) : rnd() > 0.5 ? tone("duskLow", 1.1081, 0.248, -10.1456) : tone("warm", 0.9966, 0.9789, -78.1795);
        c.beginPath();
        c.ellipse(x, y, rr(20, 90), rr(3, 10), 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      c.fillStyle = tone("woodDark", 1.092, 0.7376, -75.6481);
      c.beginPath();
      c.moveTo(0, hz);
      for (let x = 0; x <= w; x += 16) c.lineTo(x, hz - 10 - 14 * Math.abs(Math.sin(x * 0.006)) - 8 * Math.abs(Math.sin(x * 0.021)));
      c.lineTo(w, hz);
      c.fill();
      c.fillStyle = tone("duskLow", 1.0478, 0.9779, 4.6177);
      c.fillRect(0, hz - 2, w, 3);
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 48, 24), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, toneMapped: false, depthWrite: false }));
    sky.rotation.y = -Math.PI / 2;
    g.add(sky);

    // Water: layered sine waves + sky reflection + sparkle
    const waterMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, deep: { value: new THREE.Color(C.water) }, sky: { value: new THREE.Color(C.duskMid) }, spark: { value: new THREE.Color(tone("duskLow", 1.1101, 0.5865, 11.0228)) } },
      vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
      fragmentShader: `uniform float uT; uniform vec3 deep, sky, spark; varying vec3 vW;
        void main(){
          vec2 p = vW.xz;
          float n = sin(p.x*1.7 + uT*0.9)*0.5 + sin(p.y*2.6 - uT*1.2 + p.x*0.6)*0.5 + sin((p.x+p.y)*6.1 + uT*2.1)*0.22 + sin((p.x-p.y)*9.3 - uT*1.6)*0.12;
          vec3 V = normalize(cameraPosition - vW);
          float fres = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);
          vec3 col = mix(deep, sky, clamp(fres*0.75 + n*0.05, 0.0, 0.6));
          float s = pow(clamp(n*0.32 + 0.5, 0.0, 1.0), 14.0) * (0.4 + fres);
          col += spark * s * 1.4;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    add(g, new THREE.PlaneGeometry(240, 240, 1, 1), waterMat, 0, 0, 0, 0, { rx: -Math.PI / 2, cast: false, receive: false });
    updaters.push((t) => { if (g.visible) waterMat.uniforms.uT.value = t; });

    const cream = std(tone("duskLow", 1.0138, 0.5514, 2.6116), { roughness: 0.85 });
    const ember = glow(tone("duskLow", 0.9768, 1.4385, -0.1009));
    const terrace = (x, z, r, h) => {
      add(g, cyl(r, r, h, 64), cream, x, h / 2, z);
      add(g, new THREE.TorusGeometry(r - 0.02, 0.025, 6, 96), ember, x, h * 0.35, z, 0, { rx: Math.PI / 2, cast: false });
    };
    terrace(-3.4, 4.8, 3.0, 0.5);
    terrace(-1.2, -0.4, 2.1, 0.32);
    terrace(3.2, 4.0, 2.0, 0.6);
    terrace(2.6, -4.5, 2.4, 0.45);
    for (const [x, z, r] of [[0.3, 7.2, 0.55], [1.1, 5.6, 0.6], [0.2, 3.9, 0.55], [1.0, 2.3, 0.5], [2.0, 1.0, 0.45], [0.6, -2.6, 0.5]]) add(g, cyl(r, r, 0.12, 48), std(tone("duskLow", 0.9852, 0.519, 4.8015), { roughness: 0.8 }), x, 0.05, z);
    // Two sofas (on the large left step, on the middle step)
    const sofa = (x, y, z, ry) => {
      const s = new THREE.Group();
      s.position.set(x, y, z);
      s.rotation.y = ry;
      g.add(s);
      const m = std(tone("duskLow", 1.054, 0.4803, 3.8996), { roughness: 1 });
      add(s, softBox(2.1, 0.34, 0.9, 0.1), m, 0, 0.17, 0);
      add(s, softBox(2.1, 0.34, 0.24, 0.1), m, 0, 0.45, -0.34);
      for (const sx of [-1, 1]) add(s, new THREE.CapsuleGeometry(0.13, 0.55, 6, 16), m, sx * 0.95, 0.42, 0, 0, { rx: Math.PI / 2 });
    };
    sofa(-2.8, 0.5, 4.4, 0.3);
    sofa(-0.9, 0.32, -0.5, 0.15);

    // Right arch gallery: arch openings lined up in a thick wall
    const colon = new THREE.Shape();
    colon.moveTo(-14, 0); colon.lineTo(12, 0); colon.lineTo(12, 5.4); colon.lineTo(-14, 5.4); colon.lineTo(-14, 0);
    for (let i = 0; i < 8; i++) colon.holes.push(archPath(new THREE.Path(), 1.6, 3.7, -12 + i * 3.1, 0.6));
    const colonGeo = new THREE.ExtrudeGeometry(colon, { depth: 0.6, bevelEnabled: false, curveSegments: 18 });
    add(g, colonGeo, std(tone("duskLow", 1.0252, 0.5282, 0.556), { roughness: 0.9 }), 5.4, 0, 0, -Math.PI / 2);
    for (let i = 0; i < 7; i++) {
      const z = -12 + i * 3.1 + 1.55;
      add(g, box(0.16, 0.36, 0.16), glow(tone("duskLow", 1.0717, 0.9454, 12.9889)), 4.6, 0.42, z, 0, { cast: false });
      if (i % 2) continue;
      const lamp = new THREE.PointLight(tone("duskLow", 0.9896, 1.3271, -0.6939), 4, 4.5, 2);
      lamp.position.set(4.3, 0.9, z);
      g.add(lamp);
    }
    // Two arched doors over water (far center)
    for (const [x, z] of [[0.6, -8], [-2.6, -10.5]]) {
      const s = new THREE.Shape();
      s.moveTo(-1.5, 0); s.lineTo(1.5, 0); s.lineTo(1.5, 5); s.lineTo(-1.5, 5); s.lineTo(-1.5, 0);
      s.holes.push(archPath(new THREE.Path(), 1.7, 3.8, 0, 0));
      add(g, new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 18 }), std(tone("duskLow", 1.0351, 0.5184, 1.6131), { roughness: 0.9 }), x, 0, z);
    }
    // Left text wall and four vertical lines of text
    add(g, box(2.2, 5.4, 0.45), std(tone("duskLow", 1.0346, 0.4882, 0.4575), { roughness: 0.9 }), -1.9, 2.7, -2.6);
    const wt = wallTexts.water || [];
    const big = wt.filter((l) => l.k === "big"), small = wt.filter((l) => l.k === "small");
    const wTex = textTex([
      ...big.map((l, i) => ({ text: l.text, size: 46, weight: 500, ls: 0.34, gapBefore: i ? 1.55 : 1 })),
      { bar: 70, size: 30, gapBefore: 1.2 },
      ...small.map((l) => ({ text: l.text, size: 22, weight: 500, ls: 0.3, gapBefore: 1.7 })),
    ], { w: 512, h: 640, color: tone("bronze", 0.8475, 0.7113, -3.3935) });
    const wPlane = wallPlane(wTex, 1.1, 1.375);
    wPlane.position.set(-1.75, 3.0, -2.37);
    g.add(wPlane);
    // Waterfall: white streams falling in front of the corridor
    const fallLo = toneRGB("duskLow", 1.114, 0.4293, -3.482), fallHi = toneRGB("duskLow", 1.1835, 0.0737, 42.0397);
    const fallTex = canvasTex(64, 256, (c, w, h) => {
      for (let x = 0; x < w; x += 2) {
        const gv = rr(0, 1), bv = rr(0, 1);
        c.fillStyle = `rgba(${fallLo[0]},${fallLo[1] + (fallHi[1] - fallLo[1]) * gv | 0},${fallLo[2] + (fallHi[2] - fallLo[2]) * bv | 0},${rr(0.35, 0.95)})`;
        c.fillRect(x, 0, 2, h);
      }
    });
    fallTex.wrapT = THREE.RepeatWrapping;
    add(g, new THREE.PlaneGeometry(0.7, 2.6), new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.85, toneMapped: false }), 4.7, 1.3, 2.0, -Math.PI / 2, { cast: false });
    updaters.push((t) => { if (g.visible) fallTex.offset.y = -t * 0.8; });

    // Stones · spheres · trees
    add(g, rock(1.4, 3, 0.32), std(tone("woodDark", 1.0278, 0.3834, -0.3961), { roughness: 0.95, flatShading: true }), -4.3, 1.3, 8.6, 1.2);
    add(g, new THREE.SphereGeometry(0.6, 48, 24), std(tone("cool", 0.9334, 0.2744, -10.1809), { roughness: 0.22, envMapIntensity: 1.1 }), 2.9, 1.2, 7.6);
    const tree = (x, y, z, h, colors, n = 600) => {
      add(g, cyl(0.04, 0.08, h, 8), std(tone("bronze", 1.0107, 0.7899, -6.1196)), x, y + h / 2, z);
      const cs = [];
      for (let i = 0; i < 7; i++) cs.push([x + rr(-0.6, 0.6), y + h * rr(0.75, 1.1), z + rr(-0.5, 0.5)]);
      foliage(g, cs, { count: n, spread: 0.55, size: 0.12, colors });
    };
    tree(-2.2, 0.5, 3.2, 2.0, [C.autumn, tone("autumn", 1.0762, 1.0079, 5.3151), tone("terracotta", 1.0046, 0.8582, 11.6704)]);
    tree(-4.6, 0.5, 2.6, 2.4, [C.autumn, tone("wood", 1.0002, 1.1455, -0.3009)]);
    tree(1.6, 0.45, -4.0, 1.8, [tone("autumn", 1.0217, 0.9906, 2.1631), tone("wood", 0.9749, 1.1646, -3.2767)]);
    tree(3.9, 0.6, 3.2, 1.6, [tone("warm", 0.9033, 1.5985, 59.3639), tone("leaf", 0.941, 0.9881, 7.3388)], 500);
    tree(4.2, 0.0, -2.2, 2.2, [tone("warm", 0.9033, 1.5985, 59.3639), tone("woodDark", 1.1322, 1.2208, 73.984)], 500);
    tree(4.2, 0.0, 6.6, 2.0, [tone("warm", 0.9033, 1.5985, 59.3639), tone("leaf", 0.941, 0.9881, 7.3388)], 400);

    g.add(new THREE.HemisphereLight(tone("duskLow", 1.0029, 0.8065, -26.5379), tone("bronze", 1.13, 0.4993, 151.6614), 1.25));
    const dusk = new THREE.DirectionalLight(tone("duskLow", 0.9883, 1.1345, -15.7921), 2.6);
    dusk.position.set(-3, 5, -18);
    dusk.target.position.set(0, 0, 3);
    dusk.castShadow = true;
    dusk.shadow.mapSize.set(1024, 1024);
    Object.assign(dusk.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
    dusk.shadow.bias = -0.0008;
    dusk.shadow.normalBias = 0.03;
    g.add(dusk, dusk.target);
    const front = new THREE.DirectionalLight(tone("duskLow", 1.0207, 0.7648, -10.8993), 1.1);
    front.position.set(2, 4, 12);
    g.add(front);

    rooms.push({ name: "water", group: g, bg: C.duskMid, env: envScene(C.duskTop, C.duskMid, tone("bronze", 1.1377, 0.6069, 142.8374)) });
  }

  await breathe(3);
  // ════════ Room 4 — round desk in the white arch room (contact) ════════
  let screenTex = null, screenDraw = null, figure = null;
  {
    const g = new THREE.Group();
    g.name = "studio";
    const skyTex = canvasTex(2048, 1024, (c, w, h) => {
      const hz = h * 0.5;
      const gr = c.createLinearGradient(0, 0, 0, hz);
      gr.addColorStop(0, tone("skyTop", 0.7617, 0.9255, 3.5178));
      gr.addColorStop(0.6, C.skyTop);
      gr.addColorStop(1, C.skyLow);
      c.fillStyle = gr;
      c.fillRect(0, 0, w, hz);
      c.fillStyle = tone("duskMid", 0.9767, 0.4234, -150.3902);
      c.fillRect(0, hz, w, h - hz);
      // Hazy snow-capped mountain: white peak over a blue body, the whole thing blurred
      c.save();
      c.filter = "blur(6px)";
      for (let k = 0; k < 22; k++) {
        const cx = rr(0, w), pw = rr(90, 220), ph = rr(40, 120);
        c.fillStyle = tone("skyTop", 0.8668, 0.6043, -0.1683);
        c.beginPath();
        c.moveTo(cx - pw, hz + 4);
        c.lineTo(cx - pw * 0.2, hz - ph * 0.8);
        c.lineTo(cx, hz - ph);
        c.lineTo(cx + pw * 0.3, hz - ph * 0.7);
        c.lineTo(cx + pw, hz + 4);
        c.fill();
        c.fillStyle = tone("duskLow", 1.1395, 0.0851, 177.1858);
        c.beginPath();
        c.moveTo(cx - pw * 0.38, hz - ph * 0.55);
        c.lineTo(cx - pw * 0.2, hz - ph * 0.8);
        c.lineTo(cx, hz - ph);
        c.lineTo(cx + pw * 0.3, hz - ph * 0.7);
        c.lineTo(cx + pw * 0.42, hz - ph * 0.45);
        c.lineTo(cx + pw * 0.1, hz - ph * 0.62);
        c.lineTo(cx - pw * 0.12, hz - ph * 0.5);
        c.fill();
      }
      c.restore();
      c.fillStyle = tone("duskLow", 1.0239, 0.4033, 175.8572, 0.6);
      c.fillRect(0, hz - 6, w, 10);
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, toneMapped: false, depthWrite: false }));
    g.add(sky);

    const white = std(tone("duskLow", 0.9839, 0.4695, 9.9074), { roughness: 0.85 });
    add(g, new THREE.CircleGeometry(9, 96), std(tone("accent", 0.9736, 0.4898, -5.7497), { roughness: 0.75 }), 0, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
    add(g, lathe([[4.4, 0], [4.4, 0.28], [5.0, 0.28], [5.0, 0.56], [5.6, 0.56], [5.6, 0.84], [7.4, 0.84], [7.4, 0]], 96), white, 0, 0, 0, 0, { cast: false });

    // Round wall: twelve bays, with big arches (sky) and picture niches alternating
    const R = 6.6, N = 12, pw = 2 * R * Math.tan(Math.PI / N) + 0.02;
    const paintTex = canvasTex(256, 384, (c, w, h) => {
      c.fillStyle = tone("duskLow", 1.1092, 0.1667, 16.2284);
      c.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) {
        c.globalAlpha = rr(0.3, 0.9);
        c.fillStyle = [tone("bronze", 0.6448, 0.1372, 8.4751), tone("accentSoft", 1.0135, 1.0189, 3.8696), tone("woodDark", 1.154, 0.5137, 15.9369), tone("duskLow", 0.9979, 0.4553, 16.3812)][Math.floor(rnd() * 4)];
        c.save();
        c.translate(rr(0, w), rr(0, h));
        c.rotate(rr(-0.6, 0.6));
        c.fillRect(-rr(8, 40), -rr(2, 14), rr(16, 80), rr(4, 26));
        c.restore();
      }
    });
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const s = new THREE.Shape();
      s.moveTo(-pw / 2, 0); s.lineTo(pw / 2, 0); s.lineTo(pw / 2, 5.0); s.lineTo(-pw / 2, 5.0); s.lineTo(-pw / 2, 0);
      const isArch = i % 2 === 0;
      if (isArch) s.holes.push(archPath(new THREE.Path(), 2.6, 3.4, 0, 0.36));
      const panel = new THREE.Group();
      panel.position.set(Math.sin(a) * R, 0.84, Math.cos(a) * R);
      panel.rotation.y = a + Math.PI;
      g.add(panel);
      add(panel, new THREE.ExtrudeGeometry(s, { depth: 0.55, bevelEnabled: false, curveSegments: 20 }), white, 0, 0, -0.55, 0, { cast: false });
      if (!isArch) {
        const ns = archPath(new THREE.Shape(), 0.95, 1.45, 0, 0);
        add(panel, new THREE.ShapeGeometry(ns, 16), std(tone("duskLow", 1.007, 0.2352, 10.1561), { roughness: 0.9 }), 0, 1.0, 0.01, 0, { cast: false });
        add(panel, new THREE.PlaneGeometry(0.62, 0.92), new THREE.MeshStandardMaterial({ map: paintTex, roughness: 0.9 }), 0, 1.5, 0.03, 0, { cast: false });
      }
    }

    // Desk: wooden top (pill shape) · two white bases · brown screen panel
    const top = std(C.wood, { roughness: 0.5, envMapIntensity: 0.6 });
    add(g, stadium(3.5, 1.35, 0.06, 0.02), top, 0, 0.9, 0);
    for (const x of [-1.25, 1.25]) add(g, softBox(0.72, 0.86, 1.15, 0.05), std(tone("duskLow", 1.1066, 0.1726, 12.5904), { roughness: 0.8 }), x, 0.43, 0);
    add(g, box(1.8, 0.66, 0.04), std(C.woodDark, { roughness: 0.6 }), 0, 0.55, -0.1);
    add(g, box(1.8, 0.66, 0.04), std(C.woodDark, { roughness: 0.6 }), 0, 0.55, 0.12);

    // Monitor: the work grid on the screen (front, +z) flips every 9 seconds
    const mon = new THREE.Group();
    mon.position.set(0, 0.93, -0.12);
    g.add(mon);
    const shell = std(tone("duskLow", 1.0221, 0.1374, 15.3014), { metalness: 0.35, roughness: 0.35 });
    add(mon, box(1.3, 0.8, 0.045), shell, 0, 0.62, 0);
    add(mon, box(0.12, 0.3, 0.03), shell, 0, 0.18, -0.06, 0, { rx: 0.18 });
    add(mon, cyl(0.2, 0.22, 0.012, 32), shell, 0, 0.01, 0.0);
    const thumbs = labels.filter((l) => l.kind === "thumb");
    screenDraw = (c, w, h, t) => {
      c.fillStyle = tone("duskLow", 1.1366, 0.0831, 16.2429);
      c.fillRect(0, 0, w, h);
      c.fillStyle = tone("duskLow", 1.066, 0.1684, 16.2266);
      c.fillRect(0, 0, w * 0.17, h);
      c.fillStyle = tone("duskMid", 0.964, 0.29, 49.3645);
      for (let i = 0; i < 7; i++) c.fillRect(w * 0.025, h * (0.12 + i * 0.06), w * 0.11, h * 0.018);
      const cols = 3, rows = 2, gx = w * 0.2, gy = h * 0.1, cw = (w * 0.77) / cols, ch = (h * 0.8) / rows;
      const shift = Math.floor((t % 9) / 3);
      const tones = [tone("accent", 0.9717, 0.7628, -9.0991), tone("duskMid", 1.0034, 0.9373, 19.2152), tone("duskLow", 1.0141, 0.1863, -179.3626), tone("accent", 1.0181, 0.5571, -0.6012), tone("accentSoft", 1.0263, 0.7752, -8.0674), tone("duskLow", 1.0404, 0.4468, 6.5069)];
      for (let i = 0; i < cols * rows; i++) {
        const x = gx + (i % cols) * cw, y = gy + Math.floor(i / cols) * ch;
        c.fillStyle = tones[(i + shift) % tones.length];
        c.fillRect(x + 6, y + 6, cw - 12, ch - 12);
        c.strokeStyle = tone("bronze", 0, 0, 0, 0.25);
        c.beginPath();
        c.moveTo(x + 6, y + 6); c.lineTo(x + cw - 6, y + ch - 6);
        c.moveTo(x + cw - 6, y + 6); c.lineTo(x + 6, y + ch - 6);
        c.stroke();
        const lab = thumbs[(i + shift) % Math.max(1, thumbs.length)]?.label || "";
        c.fillStyle = tone("duskLow", 1.1851, 0, 0, 0.85);
        c.fillRect(x + 12, y + ch - 34, cw - 24, 22);
        c.fillStyle = tone("bronze", 1.0751, 0.5571, 7.7035);
        c.font = `400 12px ${font.sans}`;
        c.fillText(lab.slice(0, 22), x + 16, y + ch - 18);
      }
    };
    const scr = document.createElement("canvas");
    scr.width = 640;
    scr.height = 400;
    screenTex = new THREE.CanvasTexture(scr);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenDraw.canvas = scr;
    // As in the original, wide screens (over 960px) run the video as a texture (started directly with play() so it doesn’t stop even off screen), and phones get a single still image.
    // Opened via file:// the video is a different origin so WebGL can’t read it — in that case the same 9-second loop (the cell advances every 3 seconds) is drawn on a canvas
    const wide = innerWidth > 960;
    const screenVideo = wide && location.protocol !== "file:" && document.querySelector('video[data-media="screen"]');
    let scrMap = screenTex;
    if (screenVideo) {
      screenVideo.muted = true;
      screenVideo.play().catch(() => {});
      scrMap = new THREE.VideoTexture(screenVideo);
      scrMap.colorSpace = THREE.SRGBColorSpace;
    } else screenDraw(scr.getContext("2d"), scr.width, scr.height, 0);
    if (wide && !screenVideo) {
      let lastDraw = 0;
      updaters.push((t) => {
        const k = Math.floor((t % 9) / 3);
        if (!g.visible || k === lastDraw) return;
        lastDraw = k;
        screenDraw(scr.getContext("2d"), scr.width, scr.height, t);
        screenTex.needsUpdate = true;
      });
    }
    add(mon, new THREE.PlaneGeometry(1.24, 0.75), glow(tone("duskLow", 1.1851, 0, 0), { map: scrMap }), 0, 0.62, 0.024, 0, { cast: false });

    add(g, box(0.82, 0.02, 0.24), std(tone("duskLow", 1.1286, 0.0786, 24.1654), { roughness: 0.6 }), 0.32, 0.94, 0.34);
    add(g, new THREE.CapsuleGeometry(0.035, 0.05, 4, 12), std(tone("duskLow", 1.1286, 0.0786, 24.1654), { roughness: 0.5 }), -0.35, 0.95, 0.38, 0, { rx: Math.PI / 2 });

    // Props: potted branch (+x), architectural model, pencil holder, book stack, mushrooms, etc. (-x)
    add(g, lathe([[0, 0], [0.16, 0], [0.24, 0.1], [0.25, 0.2], [0, 0.18]]), std(tone("duskLow", 1.1066, 0.1726, 12.5904), { roughness: 0.7 }), 0.62, 0.93, -0.28);
    foliage(g, twigs(g, [0.62, 1.1, -0.28], 9, 0.6, tone("bronze", 0.9096, 0.5756, 3.2528)), { count: 260, spread: 0.05, size: 0.06, colors: [C.leaf, tone("leaf", 1.095, 1.0805, -2.2178), tone("leaf", 0.9182, 0.9685, 1.6568)] });
    const model = new THREE.Group();
    model.position.set(1.1, 0.93, -0.25);
    g.add(model);
    const mWhite = std(tone("duskLow", 1.1292, 0.0968, 20.095), { roughness: 0.7 });
    add(model, box(0.42, 0.03, 0.32), mWhite, 0, 0.015, 0);
    add(model, box(0.38, 0.02, 0.28), mWhite, 0, 0.17, 0);
    for (let i = 0; i < 4; i++) for (const z of [-0.12, 0.12]) add(model, cyl(0.012, 0.012, 0.14, 8), mWhite, -0.16 + i * 0.107, 0.1, z);
    add(g, cyl(0.06, 0.06, 0.14, 24), std(tone("duskLow", 1.1066, 0.1726, 12.5904)), 1.42, 1.0, -0.2);
    for (let i = 0; i < 5; i++) add(g, cyl(0.005, 0.005, 0.26, 5), std(tone("warm", 1.0211, 1.1764, 3.1813)), 1.42 + rr(-0.03, 0.03), 1.1, -0.2 + rr(-0.03, 0.03), 0, { rz: rr(-0.15, 0.15) });
    for (let i = 0; i < 3; i++) add(g, box(0.42, 0.045, 0.3), std([tone("duskLow", 1.0651, 0.2897, 14.4301), tone("accent", 1.0138, 0.5269, -0.9669), tone("duskLow", 1.103, 0.2178, 15.6383)][i]), 0.28, 0.955 + i * 0.047, -0.42, 0.06 * i);
    add(g, cyl(0.012, 0.012, 0.22, 8), std(tone("duskLow", 1.088, 0.1543, 13.7815)), -0.82, 1.04, 0.22);
    add(g, new THREE.SphereGeometry(0.15, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(tone("duskLow", 1.1197, 0.1343, 15.3056), { roughness: 0.5, side: THREE.DoubleSide }), -0.82, 1.12, 0.22);
    add(g, new THREE.SphereGeometry(0.05, 16, 8), glow(tone("duskLow", 1.1427, 0.44, 21.581)), -0.82, 1.12, 0.22, 0, { cast: false });
    add(g, cyl(0.1, 0.1, 0.012, 24), std(tone("duskLow", 1.088, 0.1543, 13.7815)), -0.82, 0.93, 0.22);
    // Front round seat
    add(g, softBox(0.8, 0.42, 0.62, 0.16), std(tone("duskLow", 0.9967, 0.3976, 9.8782), { roughness: 1 }), -0.1, 0.21, 1.25);

    // Small wooden doll: behind the monitor (-z), looks at the last camera and dances
    figure = new THREE.Group();
    figure.position.set(-0.22, 0.93, -0.5);
    figure.rotation.y = Math.PI;
    g.add(figure);
    const bark = std(tone("warm", 0.9123, 1.0151, -1.9358), { roughness: 0.95 });
    const hips = new THREE.Group();
    hips.position.y = 0.17;
    figure.add(hips);
    const torso = add(hips, new THREE.CapsuleGeometry(0.06, 0.14, 6, 12), bark, 0, 0.12, 0);
    torso.scale.set(1, 1, 0.8);
    const head = new THREE.Group();
    head.position.y = 0.3;
    hips.add(head);
    add(head, new THREE.SphereGeometry(0.085, 24, 16), bark, 0, 0.04, 0).scale.set(0.9, 1.15, 0.95);
    for (const s of [-1, 1]) add(head, new THREE.SphereGeometry(0.014, 12, 8), std(tone("bronze", 0.4712, 0.2476, -2.8295), { roughness: 0.2 }), s * 0.033, 0.05, 0.072, 0, { cast: false });
    foliage(head, [[0, 0.13, 0]], { count: 40, spread: 0.06, size: 0.035, colors: [tone("leaf", 0.9667, 1.1558, 12.4056), tone("leaf", 1.091, 1.1861, 7.9725)], flat: 0.4 });
    const limb = (parent, x, y, len, r) => {
      const p = new THREE.Group();
      p.position.set(x, y, 0);
      parent.add(p);
      const geo = new THREE.CapsuleGeometry(r, len, 4, 8);
      geo.translate(0, -len / 2 - r, 0);
      add(p, geo, bark, 0, 0, 0);
      return p;
    };
    const armL = limb(hips, -0.075, 0.22, 0.13, 0.017), armR = limb(hips, 0.075, 0.22, 0.13, 0.017);
    const legL = limb(figure, -0.035, 0.17, 0.12, 0.022), legR = limb(figure, 0.035, 0.17, 0.12, 0.022);
    figure.userData = { hips, head, armL, armR, legL, legR };
    updaters.push((t, still) => {
      if (!g.visible || still) return;
      const b = t * Math.PI * 2 * 1.1;
      hips.rotation.z = Math.sin(b) * 0.12;
      hips.position.y = 0.17 + Math.abs(Math.sin(b)) * 0.015;
      head.rotation.z = -Math.sin(b) * 0.18;
      head.rotation.y = Math.sin(b * 0.5) * 0.3;
      armL.rotation.z = -0.4 - Math.sin(b) * 0.5;
      armR.rotation.z = 0.4 - Math.sin(b + 1) * 0.5;
      armL.rotation.x = Math.sin(b * 0.5) * 0.6;
      armR.rotation.x = -Math.sin(b * 0.5) * 0.6;
      legL.rotation.x = Math.max(0, Math.sin(b)) * 0.4;
      legR.rotation.x = Math.max(0, -Math.sin(b)) * 0.4;
    });

    g.add(new THREE.HemisphereLight(tone("duskLow", 1.114, 0.1798, -170.5738), tone("accent", 0.9424, 0.6124, -5.2982), 1.2));
    const day = new THREE.DirectionalLight(tone("duskLow", 1.1101, 0.5865, 11.0228), 3.0);
    day.position.set(4, 8, 5);
    day.target.position.set(0, 0.9, 0);
    day.castShadow = true;
    day.shadow.mapSize.set(1024, 1024);
    Object.assign(day.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 25 });
    day.shadow.bias = -0.0006;
    day.shadow.normalBias = 0.02;
    g.add(day, day.target);
    const back = new THREE.DirectionalLight(tone("duskLow", 1.0711, 0.5207, -161.9561), 1.2);
    back.position.set(-3, 5, -6);
    g.add(back);

    rooms.push({ name: "studio", group: g, bg: C.skyTop, env: envScene(tone("duskMid", 1.029, 0.8489, -136.4261), tone("duskLow", 1.1206, 0.1403, 10.887), tone("accent", 0.9874, 0.3543, -3.3747)) });
  }

  return {
    rooms,
    update(t, still) { for (const u of updaters) u(t, still); },
  };
};
