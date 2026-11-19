/* Ironing board, iron and cloth rebuilt with our own shapes as a 3D stage. The original is a three r184 scene that stacks shapes in code with no model files, so 
   Place our own shapes on the same board (three@0.184.0) with the same silhouette ratios (ironing board 3.9 × 1.1, iron base plate 2 : 1).
   Color is read from the Skin variable, so it changes along when the skin is swapped. */
(() => {
  const T = window.THREE;
  if (!T) return;
  const css = (name, fallback) => (getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback);
  const col = (name) => new T.Color(css(name, "gray"));
  const mixCol = (a, b, t) => col(a).lerp(col(b), t);

  // If the body is hooked (shared.js TB.scope), the renderer and loop are released together when the body leaves
  const keep = (off) => window.TB?.scope?.add(off);

  function renderer(canvas, { alpha = true } = {}) {
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: "high-performance" });
    keep(() => { r.dispose(); r.forceContextLoss(); });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setClearColor(0x000000, 0);
    r.toneMapping = T.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.9;
    r.outputColorSpace = T.SRGBColorSpace;
    return r;
  }

  // Light band on top, white line in the middle, dark room below — a hand-built environment so a long reflection band stands on the glossy surface
  function environment(r, scene) {
    const w = 128, h = 64, data = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      const v = y / h, k = v < 0.3 ? 40 : v < 0.42 ? 255 : v < 0.55 ? 110 : 24;
      for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; data[i] = data[i + 1] = data[i + 2] = k; data[i + 3] = 255; }
    }
    const tex = new T.DataTexture(data, w, h, T.RGBAFormat);
    tex.mapping = T.EquirectangularReflectionMapping;
    tex.needsUpdate = true;
    const pm = new T.PMREMGenerator(r);
    scene.environment = pm.fromEquirectangular(tex).texture;
    tex.dispose(); pm.dispose();
  }

  function lights(scene) {
    scene.add(new T.AmbientLight(0xffffff, 0.35));
    const key = new T.DirectionalLight(0xffffff, 2.6); key.position.set(-2.2, 4, 2.8); scene.add(key);
    const rim = new T.DirectionalLight(0xffffff, 1.8); rim.position.set(1.5, 2, -4); scene.add(rim);
    const glow = new T.PointLight(col("--kf-accent"), 9, 7); glow.position.set(-0.3, -1.6, -0.4); scene.add(glow);
    return { key, rim, glow };
  }

  const phys = (o) => new T.MeshPhysicalMaterial(o);

  // Ironing board: a panel with one rounded pointed end + a cover + two sets of X legs. fold (0 to 1) folds the legs
  function boardOutline(s = 1) {
    const L = 1.95 * s, W = 0.55 * s, sh = new T.Shape();
    sh.moveTo(-L, 0);
    sh.bezierCurveTo(-L, W * 0.62, -L + 0.45 * s, W, -L + 1.1 * s, W);
    sh.lineTo(L - 0.5 * s, W * 0.98);
    sh.bezierCurveTo(L - 0.1 * s, W * 0.9, L + 0.06 * s, W * 0.45, L + 0.04 * s, 0);
    sh.bezierCurveTo(L + 0.06 * s, -W * 0.45, L - 0.1 * s, -W * 0.9, L - 0.5 * s, -W * 0.98);
    sh.lineTo(-L + 1.1 * s, -W);
    sh.bezierCurveTo(-L + 0.45 * s, -W, -L, -W * 0.62, -L, 0);
    return sh;
  }
  function board() {
    const g = new T.Group();
    const shell = phys({ color: mixCol("--kf-bg", "--kf-surface", 0.2), metalness: 0.2, roughness: 0.38, clearcoat: 0.85, clearcoatRoughness: 0.25, envMapIntensity: 0.45 });
    const cover = phys({ color: mixCol("--kf-bg", "--kf-surface", 0.35), metalness: 0, roughness: 0.85, clearcoat: 0.15, envMapIntensity: 0.15 });
    const leg = phys({ color: mixCol("--kf-bg", "--kf-surface", 0.4), metalness: 0.55, roughness: 0.44, clearcoat: 0.5, envMapIntensity: 0.4 });
    const ex = (s, d, b) => { const geo = new T.ExtrudeGeometry(boardOutline(s), { depth: d, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 6, curveSegments: 48 }); geo.center(); return geo; };
    const top = new T.Mesh(ex(1, 0.1, 0.04), shell); top.rotation.x = -Math.PI / 2; g.add(top);
    const pad = new T.Mesh(ex(0.92, 0.05, 0.03), cover); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.08; g.add(pad);
    const rod = (a, b, r) => {
      const d = new T.Vector3().subVectors(b, a), m = new T.Mesh(new T.CylinderGeometry(r, r * 0.8, d.length(), 12), leg);
      m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); return m;
    };
    const legs = [];
    [[-0.8, -0.06], [0.75, -0.14]].forEach(([x, y]) => {
      const pivot = new T.Group(); pivot.position.set(x, y, 0);
      const len = -1.95 - y;
      pivot.add(rod(new T.Vector3(0, 0, -0.35), new T.Vector3(0, len, 0.45), 0.036));
      pivot.add(rod(new T.Vector3(0, 0, 0.35), new T.Vector3(0, len, -0.45), 0.036));
      [-0.45, 0.45].forEach((z) => { const f = new T.Mesh(new T.CylinderGeometry(0.05, 0.044, 0.065, 18), leg); f.position.set(0, len - 0.03, z); pivot.add(f); });
      const hub = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.09, 16), leg); hub.rotation.z = Math.PI / 2; hub.position.y = len / 2; pivot.add(hub);
      g.add(pivot); legs.push(pivot);
    });
    return { group: g, pad, legs, fold(t) { legs[0].rotation.z = (Math.PI / 2) * t; legs[1].rotation.z = -(Math.PI / 2) * t; } };
  }

  // Iron: pointed soleplate (metal) + green glowing edge + two-layer body + tube handle + dial + small flame
  function ironOutline(s = 1) {
    const L = 1 * s, W = 0.5 * s, sh = new T.Shape();
    sh.moveTo(-L, -W);
    sh.lineTo(L * 0.2, -W * 0.96);
    sh.bezierCurveTo(L * 0.7, -W * 0.82, L * 1.02, -W * 0.3, L * 1.05, 0);
    sh.bezierCurveTo(L * 1.02, W * 0.3, L * 0.7, W * 0.82, L * 0.2, W * 0.96);
    sh.lineTo(-L, W);
    sh.bezierCurveTo(-L * 1.08, W * 0.6, -L * 1.08, -W * 0.6, -L, -W);
    return sh;
  }
  function iron() {
    const g = new T.Group();
    const metal = phys({ color: mixCol("--kf-surface", "--kf-dim", 0.25), metalness: 0.9, roughness: 0.22, clearcoat: 0.4, envMapIntensity: 1.05 });
    const body = phys({ color: mixCol("--kf-bg", "--kf-surface", 0.5), metalness: 0.35, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.14, envMapIntensity: 0.85 });
    const grip = phys({ color: mixCol("--kf-bg", "--kf-surface", 0.15), metalness: 0, roughness: 0.88, clearcoat: 0.12, envMapIntensity: 0.4 });
    const lit = (k) => new T.MeshStandardMaterial({ color: 0x000000, emissive: col("--kf-accent"), emissiveIntensity: k, toneMapped: false });
    const layer = (s, d, b, y, mat) => {
      const geo = new T.ExtrudeGeometry(ironOutline(s), { depth: d, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 40 });
      geo.center(); geo.rotateX(-Math.PI / 2); geo.translate(0, y, 0);
      const m = new T.Mesh(geo, mat); g.add(m); return m;
    };
    layer(1, 0.06, 0.02, 0, metal);
    layer(1.04, 0.03, 0, 0.022, lit(1.5));
    layer(0.95, 0.1, 0.045, 0.1, body);
    const dome = layer(0.78, 0.16, 0.09, 0.28, body);
    dome.scale.set(1, 1.5, 0.92); dome.position.x = -0.06;
    const curve = new T.CatmullRomCurve3([[-0.72, 0.42], [-0.82, 0.66], [-0.62, 0.9], [-0.2, 0.98], [0.2, 0.9], [0.34, 0.66], [0.34, 0.44]].map(([x, y]) => new T.Vector3(x, y, 0)));
    g.add(new T.Mesh(new T.TubeGeometry(curve, 64, 0.065, 14, false), body));
    g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([0.32, 0.38, 0.44, 0.5].map((t) => curve.getPointAt(t))), 12, 0.078, 14, false), grip));
    const dial = new T.Mesh(new T.CylinderGeometry(0.085, 0.09, 0.07, 24), metal); dial.rotation.x = Math.PI / 2; dial.position.set(0.02, 0.24, 0.42); g.add(dial);
    const led = new T.Mesh(new T.CapsuleGeometry(0.03, 0.14, 4, 10), lit(2.6)); led.rotation.z = Math.PI / 2; led.position.set(0.42, 0.33, 0.12); g.add(led);
    return { group: g };
  }

  // Photo placeholder drawn on a canvas — applied to cloth and work cards
  function placeholderTexture(label, { w = 1024, h = 640, tone = "--kf-contrast-bg", ink = "--kf-contrast-ink" } = {}) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.fillStyle = css(tone, "gray"); x.fillRect(0, 0, w, h);
    x.strokeStyle = css("--kf-dim", "gray"); x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
    x.strokeRect(1, 1, w - 2, h - 2);
    x.fillStyle = css(tone, "gray"); const tw = Math.min(w - 40, label.length * 22 + 40); x.fillRect((w - tw) / 2, h / 2 - 28, tw, 56);
    x.fillStyle = css(ink, "black"); x.font = `500 30px ${css("--kf-font-mono", "monospace")}`; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(label, w / 2, h / 2);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  // Header fabric image slot (4:5 portrait) — a fabric whose top edge and lower part are bright in the accent color and whose middle sinks into the background color, with fine vertical grain,
  // Seven partner logo slots with an X grid laid at the bottom (the middle one large). The brightness layout of the original cloth art, redrawn with skin variables
  function glowCloth(label, { w = 1024, h = 1268 } = {}) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"), a = css("--kf-accent", "green"), s = css("--kf-accent-soft", "green"), bg = css("--kf-bg", "black");
    const g = x.createLinearGradient(0, 0, 0, h);
    [[0, s], [0.14, bg], [0.5, bg], [0.72, a], [0.88, s], [1, bg]].forEach(([k, v]) => g.addColorStop(k, v));
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    [[0, 0.32], [1, 0.68]].forEach(([from, to]) => { const v = x.createLinearGradient(from * w, 0, to * w, 0); v.addColorStop(0, bg); v.addColorStop(1, "transparent"); x.globalAlpha = 0.7; x.fillStyle = v; x.fillRect(0, 0, w, h); });
    x.globalAlpha = 0.12; x.strokeStyle = bg; x.lineWidth = 2;
    for (let i = 1; i < 20; i++) { x.beginPath(); x.moveTo((i * w) / 20, 0); x.lineTo((i * w) / 20, h * 0.78); x.stroke(); }
    x.globalAlpha = 0.35; x.beginPath(); x.moveTo(w * 0.2, h * 0.62); x.lineTo(w * 0.8, h * 0.93); x.moveTo(w * 0.8, h * 0.62); x.lineTo(w * 0.2, h * 0.93); x.stroke();
    x.globalAlpha = 0.55; x.fillStyle = bg; x.strokeStyle = bg; x.lineWidth = 3;
    x.font = `500 26px ${css("--kf-font-mono", "monospace")}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, w / 2, h * 0.58);
    [[0.33, 0.69, 1], [0.65, 0.69, 1], [0.2, 0.78, 1], [0.49, 0.78, 1.5], [0.79, 0.78, 1], [0.33, 0.87, 1], [0.65, 0.87, 1]].forEach(([px, py, k]) => {
      const bw = 150 * k, bh = 54 * k; x.beginPath(); x.roundRect(px * w - bw / 2, py * h - bh / 2, bw, bh, 8); x.stroke(); x.fillText("Logo", px * w, py * h);
    });
    x.globalAlpha = 1;
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  // Cloth — same form as the original Cloth Fall: treat the resting shape lying on the board (four fold sines + four fine wrinkles, hem wave) as a strip of one-line length 3.08,
  // Each line is placed at one spot on the path ”wrapping the plate’s front edge and down → over the plate → back edge → down behind the plate, bending in an S and out upward” (lines · arcs).
  // Pushing along the path by travel (0~1 × 11): the cloth falls from behind the top of the board and covers it, and pushing the other way drags it out behind the board.
  // After sitting, the drooping hem ripples (speed .9 · horizontal 3 · vertical 3.6 · strength .24), and when the cursor sweeps the cloth, concentric ripples rise at that spot.
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const DRAPE = { L: 3.08, travel: 11, backR: 0.18, backDrop: 0.9, R1: 0.42, straight: 0.3, R2: 0.42, wave: { speed: 0.9, kx: 3, kv: 3.6, amp: 0.24 } };
  function drapePath(tail) {
    const { L, backR, backDrop, R1, straight, R2 } = DRAPE, ds = 0.015, front = L - 1.12 - (Math.PI / 2) * 0.12;
    const segs = [[0, front], [0.12, Math.PI / 2], [0, 1.12], [backR, Math.PI / 2], [0, backDrop], [R1, -Math.PI / 2], [0, straight], [R2, -Math.PI / 2], [0, tail]];
    let z = 0.84, y = 0.185 - front - 0.12, hz = 0, hy = 1;
    const pts = [[z, y]];
    for (const [r, turn] of segs) {
      if (!r) { for (let s = 0; s < turn - 1e-6; s += ds) { const k = Math.min(ds, turn - s); z += hz * k; y += hy * k; pts.push([z, y]); } continue; }
      const sg = Math.sign(turn), cz = z - hy * sg * r, cy = y + hz * sg * r, nz = z - cz, ny = y - cy, len = Math.abs(turn) * r;
      for (let s = ds; s < len + ds - 1e-6; s += ds) { const a = (Math.min(s, len) / r) * sg; pts.push([cz + nz * Math.cos(a) - ny * Math.sin(a), cy + nz * Math.sin(a) + ny * Math.cos(a)]); }
      z = cz + nz * Math.cos(turn) - ny * Math.sin(turn); y = cy + nz * Math.sin(turn) + ny * Math.cos(turn);
      [hz, hy] = [hz * Math.cos(turn) - hy * Math.sin(turn), hz * Math.sin(turn) + hy * Math.cos(turn)];
    }
    return (s) => { const i = s / ds, k = Math.floor(i); if (k <= 0) return pts[0]; if (k >= pts.length - 1) return pts[pts.length - 1]; const f = i - k, a = pts[k], b = pts[k + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
  }
  // Path share of the 2s fall — it comes 90% of the way straight during the first .9/1.15, then settles the remaining 10% slowly
  const fallLeft = (r) => { const a = 0.9 / 1.15; r = Math.min(1, Math.max(0, r)); return 1 - (r <= a ? (r / a) * 0.9 : 0.9 + ((r - a) / (1 - a)) * 0.1); };
  function drape(label, { scale = 1, glow = false } = {}) {
    const ROWS = 110, COLS = 72, n = (ROWS + 1) * (COLS + 1);
    const rest = new Float32Array(n * 3), fold = new Float32Array(n * 2), rowV = new Float32Array(n), colX = new Float32Array(n), uv = new Float32Array(n * 2), idx = [];
    for (let i = 0, k = 0; i <= ROWS; i++) {
      const d = i / ROWS; let z, y;
      if (d <= 0.3) { z = -0.4 + 0.8 * (d / 0.3); y = 0.185; }
      else if (d <= 0.4) { const e = ss(0, 1, (d - 0.3) / 0.1); z = 0.4 + 0.32 * e; y = 0.185 - 0.025 * e; }
      else { const e = (d - 0.4) / 0.6; if (e <= 0.22) { const a = (e / 0.22) * (Math.PI / 2); z = 0.72 + 0.12 * Math.sin(a); y = 0.16 - 0.12 * (1 - Math.cos(a)); } else { const t = (e - 0.22) / 0.78; z = 0.84 + 0.06 * Math.sin(t * Math.PI * 0.5); y = 0.04 - 1.75 * t; } }
      for (let j = 0; j <= COLS; j++, k++) {
        const u = (j / COLS) * 2 - 1, x = 0.02 + 1.5 * u;
        let c, h;
        if (d <= 0.4) { const e = ss(0, 1, d / 0.4); c = 0.3 + 0.7 * e; h = 1 + 0.5 * e; } else { const e = (d - 0.4) / 0.6; c = 1 - 0.78 * ss(0.2, 1, e); h = 1.5 - 0.95 * e; }
        const m = 0.022 + 0.135 * c;
        let g = 0.62 * Math.sin(3.6 * u * h + 1.2) + 0.3 * Math.sin(7 * u * h + 3 * d + 3) + 0.22 * Math.sin(1.7 * u * h + 1.5 * d + 0.5) + 0.1 * Math.sin(9 * d + 1.2 * u * h);
        let v = 0.5 * Math.sin(22 * u + 31 * d + 1) + 0.32 * Math.sin(41 * u - 19 * d + 4.3) + 0.26 * Math.sin(14 * u + 53 * d + 2.6) + 0.16 * Math.sin(67 * u - 8 * d + 5.1);
        v = Math.sign(v) * Math.pow(Math.abs(v), 0.75); g += ((0.01 + 0.02 * c) / m) * v;
        const dz = g * m, dy = g * m * 0.5, hem = d > 0.92 ? 0.018 * Math.sin(3.3 * u + 1) * ss(0.92, 1, d) : 0;
        rest.set([x, y + dy + hem, z + dz], k * 3); fold.set([dy + hem, dz], k * 2); rowV[k] = d; colX[k] = u; uv.set([(j / COLS) * 0.955, 1 - d], k * 2);
        if (i < ROWS && j < COLS) { const a = i * (COLS + 1) + j, b = a + COLS + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(rest.slice(), 3)); geo.setAttribute("uv", new T.BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const at = drapePath(14 * scale), travelMax = DRAPE.travel * scale;
    // Cloth in the screen slot glows by itself (original: same picture as emissive) — the picture isn’t buried even under board light
    const tex = glow ? glowCloth(label) : placeholderTexture(label);
    const mat = new T.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55, roughness: 1, metalness: 0, envMapIntensity: 0, side: T.DoubleSide, polygonOffset: true, polygonOffsetUnits: -12 });
    const mesh = new T.Mesh(geo, mat); mesh.visible = false;
    const touch = { x: 0, v: 0, strength: 0 };
    let landTime = -Infinity;
    return {
      mesh, travelMax,
      landed: () => landTime > -Infinity,
      // Ripples all stand from the moment of sitting (original: set to sit time − 2.5s)
      land(time) { if (landTime === -Infinity) landTime = time - 2.5; },
      lift() { landTime = -Infinity; },
      // Cursor ripple — when the cloth is hit, around its uv, scaled by cursor speed (full at 1400px/s). Follows at .25 when rising and .05 when falling
      touch(hit, speed, time, idle = 0.014) {
        const on = hit ? (0.28 * Math.min(1, speed / 1400) + idle) * ss(0, 2, time - landTime) : 0;
        if (hit) { touch.x = hit.x * 2 - 1; touch.v = 1 - hit.y; }
        touch.strength += (on - touch.strength) * (on > touch.strength ? 0.25 : 0.05);
      },
      // t: share of the path pushed (0 = sits on the panel). If eased, cubic in-out. If wrap, always on the path (first page header — the folds flatten until t .25 and float 1.1→.5),
      // Otherwise blends from the rest pose toward the path up to t .12 (work list — when seated, stays in the wrinkled rest pose, floating .07)
      pose(time, t, { eased = false, wrap = true } = {}) {
        const p = geo.attributes.position.array, { speed, kx, kv, amp } = DRAPE.wave, s = touch.strength, w = ss(0, 2, time - landTime) * (1 - ss(0, 0.06, t));
        const go = (eased ? (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) : t) * travelMax;
        const flat = 1 - ss(0, 0.25, t), mixIn = ss(0, 0.12, t), lift = wrap ? 0.05 + 0.06 * flat : 0.07 * flat;
        for (let k = 0; k < n; k++) {
          const a = rowV[k], u = colX[k], k3 = k * 3;
          let x = rest[k3], y = rest[k3 + 1], z = rest[k3 + 2];
          if (w > 0.001) {
            const from = 0.45 + (u + 1) * 0.1, r = ss(from, from + 0.25, a);
            if (r > 0) { const ph = u * kx - a * kv - time * speed, q = (Math.sin(ph) * amp + Math.sin(0.5 * ph + 1.3) * amp * 0.4) * w; x += 0.25 * q * r; y += 0.5 * q * r; z += q * r; }
            if (s > 0.001) { const dx = u - touch.x, dv = (a - touch.v) * 1.8, dd = Math.sqrt(dx * dx + dv * dv), e = Math.exp(-dd * dd * 7); if (e > 0.001) { const q = Math.sin(13 * dd - 7.5 * time) * e * s * w; x += 0.0175 * q; y += 0.035 * q; z += 0.056 * q; } }
          }
          if (!wrap && mixIn <= 0) { p[k3] = x; p[k3 + 1] = y + lift; p[k3 + 2] = z; continue; }
          const [pz, py] = at((1 - a) * DRAPE.L + go);
          if (wrap) { p[k3] = x; p[k3 + 1] = py + fold[k * 2] * flat + (y - rest[k3 + 1]) + lift; p[k3 + 2] = pz + fold[k * 2 + 1] * flat + (z - rest[k3 + 2]); }
          else { p[k3] = x; p[k3 + 1] = y + (py - y) * mixIn + lift; p[k3 + 2] = z + (pz - z) * mixIn; }
        }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
      },
    };
  }


  // Striped tube ring: a flat ring with black and white bands wound around the tube. Rounded polygon (sides 0=Mix the circle · 3 · 4 · 5) shapes with each other to change form, and uWob ripples the outline (first page ‹To do› · About year ring)
  function stripeRing({ scale = 2.1, pipe = 1.25, flat = 0.3, bands = 24 } = {}) {
    const uniforms = {
      uTime: { value: 0 }, uA: { value: 0 }, uB: { value: 0 }, uMix: { value: 0 }, uScale: { value: scale }, uPipe: { value: pipe }, uWob: { value: 0 }, uSeed: { value: 0 }, uFlat: { value: flat }, uBands: { value: bands },
      uInk: { value: new T.Color(css("--kf-contrast-ink", "black")) }, uPaper: { value: new T.Color(css("--kf-contrast-bg", "white")).lerp(new T.Color(css("--kf-ink-soft", "white")), 0.7) },
    };
    const mat = new T.ShaderMaterial({
      uniforms, side: T.DoubleSide,
      vertexShader: `
        uniform float uA; uniform float uB; uniform float uMix; uniform float uScale; uniform float uPipe; uniform float uTime; uniform float uWob; uniform float uSeed; uniform float uFlat;
        varying float vPhi; varying vec3 vN; varying vec3 vV;
        const float PI = 3.14159265;
        // Rounded polygon radius — rounds between a straight n-sided polygon and a circle by .22
        float poly(float th, float n) {
          if (n < 2.5) return 1.0;
          float seg = 2.0 * PI / n;
          float a = mod(th + PI * 0.5, seg) - seg * 0.5;
          float r = cos(PI / n) / cos(a);
          return mix(r, 1.0, 0.22);
        }
        vec2 centre(float th) { float r = mix(poly(th, uA), poly(th, uB), uMix); r *= 1.0 + uWob * (sin(th * 3.0 + uTime * 0.6 + uSeed) * 0.5 + sin(th * 5.0 - uTime * 0.4 + uSeed * 1.3) * 0.3 + sin(th * 8.0 + uTime * 0.9) * 0.2); return vec2(cos(th), sin(th)) * r * uScale; }
        void main() {
          float th = uv.x * 2.0 * PI, ph = uv.y * 2.0 * PI;
          vec2 c = centre(th), c2 = centre(th + 0.002);
          vec2 tg = normalize(c2 - c), nr = vec2(tg.y, -tg.x);
          float w = uPipe * 0.5 * (1.0 + 0.03 * sin(ph * 22.0));
          vec3 p = vec3(c + nr * cos(ph) * w, sin(ph) * w * uFlat);
          vPhi = ph; vN = normalize(vec3(nr * cos(ph), sin(ph)));
          vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uInk; uniform vec3 uPaper; uniform float uBands; varying float vPhi; varying vec3 vN; varying vec3 vV;
        void main() {
          float s = sin(vPhi * uBands);
          float aa = fwidth(s) * 1.2;
          float band = smoothstep(-aa, aa, s);
          vec3 n = normalize(vN), v = normalize(vV);
          float lit = 0.75 + 0.25 * max(dot(n, normalize(vec3(-0.4, 0.6, 0.7))), 0.0);
          float rim = pow(1.0 - abs(dot(n, v)), 3.0) * 0.15;
          vec3 col = mix(uInk, uPaper * lit, band) + rim;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 600, 180), mat);
    return { mesh, uniforms };
  }

  // Number board — a board with a big number and two lines of explanation drawn on canvas (the original also draws text on a 3D board). green gives a green gradient board
  function statTexture(num, cap, green) {
    const c = document.createElement("canvas"); c.width = 900; c.height = 560; const x = c.getContext("2d");
    const rr = (w, h, r) => { x.beginPath(); x.moveTo(r, 0); x.arcTo(w, 0, w, h, r); x.arcTo(w, h, 0, h, r); x.arcTo(0, h, 0, 0, r); x.arcTo(0, 0, w, 0, r); x.closePath(); };
    if (green) { const g = x.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, css("--kf-accent-soft", "green")); g.addColorStop(1, css("--kf-accent", "green")); x.fillStyle = g; }
    else x.fillStyle = css("--kf-contrast-bg", "white");
    rr(900, 560, 36); x.fill();
    x.fillStyle = css("--kf-contrast-ink", "black"); x.font = `400 150px ${css("--kf-font-sans", "sans-serif")}`; x.textBaseline = "top"; x.fillText(num, 56, 48);
    x.font = `400 34px ${css("--kf-font-sans", "sans-serif")}`; x.textAlign = "right"; x.fillText(cap[0], 844, 420); x.fillText(cap[1], 844, 466);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }

  function fit(r, cam, canvas) {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }

  // Do not draw when off-screen — a page has several canvases and running them all makes phones stutter
  function loop(canvas, draw) {
    let on = false, raf = 0, last = 0;
    const tick = (now) => { raf = requestAnimationFrame(tick); const dt = last ? Math.max(1, now - last) / 1000 : 0.016; last = now; draw(Math.min(dt, 0.05), now / 1000); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; last = 0; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
    }, { rootMargin: "120px 0px" });
    io.observe(canvas);
    const stop = () => { io.disconnect(); cancelAnimationFrame(raf); };
    keep(stop);
    return stop;
  }

  window.TB3D = { T, css, col, renderer, environment, lights, board, iron, drape, fallLeft, placeholderTexture, stripeRing, statTexture, fit, loop };
})();
