// One 3D studio room — only the original’s room dimensions (10 × 12m, wall 4.6m · ridge 5.8m, loft 3m, 16 stairs …) and object positions are carried over
// Built fresh from our basic shapes and our canvas patterns. The original model and texture files are not used. Colors read the --site-* variables in shared.css.
(() => {
  const T = THREE;
  const ROOM = { width: 10, depth: 12, wall: 4.6, ridge: 5.8 };
  const LOFT = { height: 3, depth: 3.2, slab: 0.22, rightEdge: 3.2, fascia: 0.36, rail: 1.05, bars: 6, posts: [-4.55, 0.35, 3.05], post: 0.22 };
  const STAIR = { x: 4.05, width: 1.5, steps: 16, riser: 3 / 16, tread: 0.27, bottomZ: 1.52, rail: 0.95 };
  const TABLE = { length: 3, width: 1.4, height: 0.92, top: 0.075, planks: 4, apron: 0.16, leg: 0.13, legInset: 0.32, z: 0.6 };
  const STOOL = { seat: 0.21, height: 0.68, near: [-1.13, -0.35, 0.46, 1.27], nearFinish: ["chrome", "zebra", "zebra", "chrome"], far: [0.08], end: 0.46, reach: 0.34 };
  const LAMP = { rot: -0.14, hang: 2.6, thick: 0.36, top: 4.6, bulbs: [[0, 0, 0.65], [-1.35, -0.05, 0.4], [-0.92, -0.97, 0.42], [0.3, -0.98, 0.34], [1.3, -0.72, 0.4], [1.3, 0.42, 0.38], [0.72, 0.99, 0.35], [-0.23, 1.09, 0.27], [-1.11, 0.67, 0.3]], chains: [[-1, 0.1], [0.8, -0.35], [0.35, 0.6]] };
  const SWING = { x: -3.35, z: 1, bench: 1.5, depth: 0.65, seat: 0.5, back: 0.5, frame: 0.055 };
  const BOARD = { width: 1.65, height: 1.05, sill: 0.8, frame: 0.05, x: 2.6, z: -1.65 };
  // Shelf height is the value measured on the original close-up view (top shelf .62m) — set one step (.26) down from the original bundle value y .62
  const PEG = { x: 3.145, y: 0.62, shelfY: 0.36, z: 0, shelf: { length: 0.8, depth: 0.14, x: -0.5, ys: [0.26, 0, -0.26] }, roll: { x: 0.5, y: -0.22, r: 0.055, length: 0.3 } };
  const BOOTH = { x: -3.05, z: -5.36, width: 0.94, height: 2.17, depth: 0.9 };
  const TV = { width: 1.98, height: 1.14, x: 0.09, y: 2.17 + 0.025 - 0.57 };

  // Camera position — original values as they are (position, look-at, fov)
  const VIEWS = {
    overview: { position: [1.7043, 2.4, 4.8702], target: [-0.3, 2, -2.1], fov: 77 },
    table: { position: [0.02, 2.08, 0.79], target: [0, 0.92, 0.6], fov: 24 },
    whiteboard: { position: [0.35, 1.52, -1.25], target: [2.6, 1.325, -1.65], fov: 32 },
    tv: { position: [TV.x, TV.y, -3.4], target: [TV.x, TV.y, -5.9], fov: 35 },
    swing: { position: [-1.7, 1.52, 1.24], target: [-3.28, 0.72, 1], fov: 32 },
    pegboard: { position: [1.8, 1, -0.1], target: [3.145, 0.56, -0.1], fov: 30 },
    booth: { position: [-3.5, 1.4, -2.48], target: [-3.05, 1.1, -5.35], fov: 52 },
  };

  const cache = {};
  const col = (name) => {
    if (!cache[name]) { const [r, g, b] = CL.rgb(name); cache[name] = new T.Color().setRGB(r, g, b, T.SRGBColorSpace); }
    return cache[name];
  };
  const mats = {};
  const mat = (key, opts = {}) => {
    if (mats[key]) return mats[key];
    const m = new T.MeshStandardMaterial({ roughness: 0.82, metalness: 0, ...opts });
    if (opts.color === undefined && !opts.map) m.color = col(key);
    return (mats[key] = m);
  };
  const chrome = () => mats.chrome || (mats.chrome = new T.MeshStandardMaterial({ color: col("--site-chrome"), metalness: 0.85, roughness: 0.28 }));

  function canvasTex(w, h, draw, rx = 1, ry = 1) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 4;
    return t;
  }
  // Small jitter mixed evenly per pattern — the seed is fixed so the same image appears every time it opens
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const shade = (g, x, y, w, h, amt) => {
    g.fillStyle = amt > 0 ? CL.css("--site-white") : CL.css("--site-screen");
    g.globalAlpha = Math.abs(amt);
    g.fillRect(x, y, w, h);
    g.globalAlpha = 1;
  };

  const TEX = {
    brick: (base, mortar) => canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = CL.css(mortar); g.fillRect(0, 0, w, h);
      const rows = 14, bw = w / 4.6, bh = h / rows;
      for (let r = 0; r < rows; r++) {
        const off = (r % 2) * bw / 2;
        for (let x = -bw; x < w + bw; x += bw) {
          g.fillStyle = CL.css(base);
          g.fillRect(x + off + 3, r * bh + 3, bw - 6, bh - 6);
          shade(g, x + off + 3, r * bh + 3, bw - 6, bh - 6, (rnd() - 0.5) * 0.28);
        }
      }
    }, 2.2, 2.2),
    tiles: () => canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = CL.css("--site-floor"); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 600; i++) shade(g, rnd() * w, rnd() * h, 3, 3, (rnd() - 0.5) * 0.12);
      g.strokeStyle = CL.css("--site-grout"); g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
    }, ROOM.width / 0.8, ROOM.depth / 0.8),
    wood: (base, grain = 0.12, planks = 1) => canvasTex(256, 512, (g, w, h) => {
      g.fillStyle = CL.css(base); g.fillRect(0, 0, w, h);
      const pw = w / planks;
      for (let p = 0; p < planks; p++) shade(g, p * pw, 0, pw, h, (rnd() - 0.5) * 0.14);
      for (let i = 0; i < 70; i++) {
        const x = rnd() * w;
        g.strokeStyle = CL.css(rnd() > 0.5 ? "--site-white" : "--site-beam");
        g.globalAlpha = grain * rnd(); g.lineWidth = 1 + rnd() * 2;
        g.beginPath(); g.moveTo(x, 0);
        for (let y = 0; y <= h; y += 32) g.lineTo(x + Math.sin(y / 60 + i) * 4, y);
        g.stroke();
      }
      g.globalAlpha = 1;
    }),
    pegboard: () => canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = CL.css("--site-peg"); g.fillRect(0, 0, w, h);
      g.fillStyle = CL.css("--site-peg-hole");
      for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
    }, 6, 6),
    zebra: () => canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = CL.css("--site-seat"); g.fillRect(0, 0, w, h);
      g.fillStyle = CL.css("--site-stripe");
      for (let i = 0; i < 9; i++) {
        const y0 = i * 30 + rnd() * 10;
        g.beginPath(); g.moveTo(0, y0);
        for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x / 40 + i) * 12);
        for (let x = w; x >= 0; x -= 16) g.lineTo(x, y0 + 7 + rnd() * 6 + Math.sin(x / 40 + i) * 12);
        g.fill();
      }
    }),
    rug: () => canvasTex(512, 64, (g, w, h) => {
      for (let i = 0; i < 16; i++) { g.fillStyle = CL.css(i % 2 ? "--site-rug-dark" : "--site-rug"); g.fillRect((i * w) / 16, 0, w / 16, h); }
    }),
    sky: () => canvasTex(1024, 512, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, CL.css("--site-sky")); grd.addColorStop(1, CL.css("--site-sky-haze"));
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      g.fillStyle = CL.css("--site-white");
      [[0.2, 0.62, 1], [0.48, 0.7, 1.4], [0.8, 0.58, 1.1]].forEach(([cx, cy, s]) => {
        for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(cx * w + (i - 3) * 34 * s, cy * h - Math.sin((i / 6) * Math.PI) * 40 * s, (30 + rnd() * 26) * s, 0, 7); g.fill(); }
        g.fillRect(cx * w - 110 * s, cy * h, 220 * s, 40 * s);
      });
    }),
    screen: (label) => canvasTex(1024, 590, (g, w, h) => {
      g.fillStyle = CL.css("--kf-accent"); g.fillRect(0, 0, w, h);
      g.fillStyle = CL.css("--kf-on-accent"); g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `400 96px ${CL.font("--kf-font-display")}`;
      g.fillText(label, w / 2, h / 2);
    }),
    board: () => canvasTex(1024, 650, (g, w, h) => {
      g.fillStyle = CL.css("--site-board"); g.fillRect(0, 0, w, h);
      g.strokeStyle = CL.css("--kf-accent"); g.fillStyle = CL.css("--kf-accent"); g.lineWidth = 5; g.lineCap = "round";
      g.font = `400 64px ${CL.font("--kf-font-hand") || CL.font("--kf-font-display")}`;
      [["Question", "one?", 0.12, 0.2], ["Question", "two?", 0.6, 0.46], ["Question", "three?", 0.36, 0.72]].forEach(([a, b, x, y]) => {
        g.fillText(a, x * w, y * h); g.fillText(b, x * w + 30, y * h + 70);
      });
      g.beginPath(); g.moveTo(0.38 * w, 0.22 * h); g.quadraticCurveTo(0.5 * w, 0.1 * h, 0.6 * w, 0.32 * h); g.stroke();
      g.beginPath(); g.moveTo(0.66 * w, 0.62 * h); g.quadraticCurveTo(0.62 * w, 0.72 * h, 0.56 * w, 0.76 * h); g.stroke();
      g.strokeStyle = CL.css("--site-red"); g.lineWidth = 4;
      for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(0.82 * w + i * 40, 0.72 * h); g.lineTo(0.82 * w + i * 40, 0.92 * h); g.stroke(); g.beginPath(); g.moveTo(0.82 * w, 0.72 * h + i * 34); g.lineTo(0.82 * w + 120, 0.72 * h + i * 34); g.stroke(); }
    }),
  };

  const box = (w, h, d, m, x = 0, y = 0, z = 0, parent) => {
    const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); o.castShadow = o.receiveShadow = true;
    parent && parent.add(o);
    return o;
  };
  const cyl = (rt, rb, h, m, x = 0, y = 0, z = 0, parent, seg = 24) => {
    const o = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg), m);
    o.position.set(x, y, z); o.castShadow = o.receiveShadow = true;
    parent && parent.add(o);
    return o;
  };
  // Thin bar between two points (railing, line, chain)
  const rod = (a, b, r, m, parent) => {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b);
    const o = cyl(r, r, va.distanceTo(vb), m, 0, 0, 0, parent, 8);
    o.position.copy(va).add(vb).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    o.castShadow = false;
    return o;
  };

  // ───────── Objects ─────────
  function makeTable() {
    const g = new T.Group();
    const top = new T.Group();
    const pw = TABLE.width / TABLE.planks;
    const woodA = mats.tableTop || mat("tableTop", { map: TEX.wood("--site-table", 0.16, 4) });
    const woodB = mats.tableAlt || mat("tableAlt", { map: TEX.wood("--site-table-leg", 0.14, 3) });
    for (let i = 0; i < TABLE.planks; i++) {
      const m = i % 2 ? woodB : woodA;
      box(TABLE.length, TABLE.top, pw - 0.007, m, 0, TABLE.height - TABLE.top / 2, -TABLE.width / 2 + pw * (i + 0.5), top);
    }
    g.add(top);
    const legM = mat("--site-table-leg");
    const lx = TABLE.length / 2 - TABLE.legInset, lz = TABLE.width / 2 - 0.12;
    [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].forEach(([x, z]) => box(TABLE.leg, TABLE.height - TABLE.top, TABLE.leg, legM, x, (TABLE.height - TABLE.top) / 2, z, g));
    box(TABLE.length - 0.11, TABLE.apron, 0.035, legM, 0, TABLE.height - TABLE.top - TABLE.apron / 2, lz + 0.03, g);
    box(TABLE.length - 0.11, TABLE.apron, 0.035, legM, 0, TABLE.height - TABLE.top - TABLE.apron / 2, -lz - 0.03, g);
    box(lx * 2, 0.075, 0.075, legM, 0, 0.22, 0, g);
    [-lx, lx].forEach((x) => box(0.075, 0.075, lz * 2, legM, x, 0.22, 0, g));
    // Eight polaroids on a table — photo slots (person upper body, indoor lighting)
    const card = mat("--site-white"), photo = mat("--site-concrete");
    const pol = [];
    for (let i = 0; i < 8; i++) {
      const p = new T.Group();
      box(0.09, 0.003, 0.108, card, 0, 0, 0, p).castShadow = false;
      box(0.076, 0.0035, 0.075, photo, 0, 0.0005, -0.01, p).castShadow = false;
      const col4 = i % 4, row = Math.floor(i / 4);
      p.position.set(-0.24 + col4 * 0.15 + (row ? 0.04 : 0), TABLE.height + 0.002, -0.05 + row * 0.15);
      p.rotation.y = (rnd() - 0.5) * 0.9;
      g.add(p);
      pol.push(p);
    }
    g.position.z = TABLE.z;
    g.userData.items = pol;
    return g;
  }

  function makeStool(finish) {
    const g = new T.Group();
    const c = chrome();
    if (finish === "zebra") {
      const seat = new T.Mesh(new T.BoxGeometry(0.4, 0.13, 0.36), mat("zebra", { map: TEX.zebra(), roughness: 0.9 }));
      seat.position.y = STOOL.height - 0.06; seat.castShadow = true; g.add(seat);
      const black = mat("--site-stripe");
      cyl(0.028, 0.028, STOOL.height - 0.1, black, 0, (STOOL.height - 0.1) / 2, 0, g, 12);
      [0, Math.PI / 2].forEach((r) => { const b = box(0.5, 0.025, 0.04, black, 0, 0.0125, 0, g); b.rotation.y = r + Math.PI / 4; });
    } else {
      const seat = new T.Mesh(new T.SphereGeometry(STOOL.seat, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2.6), c);
      seat.scale.y = 0.42; seat.position.y = STOOL.height - 0.04; seat.castShadow = true; g.add(seat);
      cyl(STOOL.seat, STOOL.seat * 0.9, 0.03, c, 0, STOOL.height - 0.05, 0, g);
      cyl(0.028, 0.028, STOOL.height - 0.08, mat("--site-stripe"), 0, (STOOL.height - 0.08) / 2, 0, g, 12);
      cyl(0.2, 0.2, 0.022, c, 0, 0.011, 0, g);
    }
    const ring = new T.Mesh(new T.TorusGeometry(0.16, 0.009, 6, 32), c);
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; g.add(ring);
    return g;
  }

  function makeStools() {
    const g = new T.Group();
    const zNear = TABLE.z + TABLE.width / 2 + STOOL.reach, zFar = TABLE.z - TABLE.width / 2 - STOOL.reach;
    STOOL.near.forEach((x, i) => { const s = makeStool(STOOL.nearFinish[i]); s.position.set(x, 0, zNear); s.rotation.y = (rnd() - 0.5) * 0.6; g.add(s); });
    STOOL.far.forEach((x) => { const s = makeStool("chrome"); s.position.set(x, 0, zFar); g.add(s); });
    const s = makeStool("chrome"); s.position.set(TABLE.length / 2 + STOOL.end, 0, TABLE.z); g.add(s);
    return g;
  }

  function makeLamp() {
    const g = new T.Group();
    const shadeM = mat("lampShade", { color: col("--site-lamp"), emissive: col("--site-glow"), emissiveIntensity: 0.32, roughness: 0.9, side: T.DoubleSide });
    const glowM = mat("lampGlow", { color: col("--site-glow"), emissive: col("--site-glow"), emissiveIntensity: 1.4 });
    LAMP.bulbs.forEach(([x, z, r]) => {
      const drum = new T.Mesh(new T.CylinderGeometry(r, r, LAMP.thick, 40, 1, true), shadeM);
      drum.position.set(x, LAMP.hang + LAMP.thick / 2, z); g.add(drum);
      const cap = new T.Mesh(new T.CircleGeometry(r * 0.96, 40), shadeM);
      cap.rotation.x = -Math.PI / 2; cap.position.set(x, LAMP.hang + LAMP.thick - 0.01, z); g.add(cap);
      const glow = new T.Mesh(new T.CircleGeometry(r * 0.94, 40), glowM);
      glow.rotation.x = Math.PI / 2; glow.position.set(x, LAMP.hang + 0.03, z); g.add(glow);
    });
    const chainM = mat("--site-panel-dark");
    LAMP.chains.forEach(([x, z]) => rod([x, LAMP.hang + LAMP.thick, z], [x, LAMP.top, z], 0.006, chainM, g));
    g.rotation.y = LAMP.rot;
    g.position.z = TABLE.z;
    return g;
  }

  function makeSwing() {
    const g = new T.Group();
    const frameM = mat("swingFrame", { map: TEX.wood("--site-oak", 0.12) });
    const L = SWING.bench, D = SWING.depth, f = SWING.frame;
    box(L, f, D, frameM, 0, SWING.seat - 0.1, 0, g);
    box(L, SWING.back, f, frameM, 0, SWING.seat + SWING.back / 2 - 0.1, -D / 2, g);
    [-1, 1].forEach((s) => box(f, 0.32, D, frameM, (s * L) / 2, SWING.seat + 0.06, 0, g));
    box(1.36, 0.13, 0.53, mat("--site-seat"), 0, SWING.seat + 0.02, 0.04, g);
    const back = box(1.3, 0.42, 0.12, mat("--site-red"), 0, SWING.seat + 0.28, -D / 2 + 0.09, g);
    back.rotation.x = -0.12;
    const pillow = box(0.42, 0.34, 0.12, mat("--site-green"), -0.36, SWING.seat + 0.26, -D / 2 + 0.2, g);
    pillow.rotation.set(-0.2, 0.2, 0.08);
    const ropeM = mat("--site-linen");
    [[-L / 2, -D / 2], [-L / 2, D / 2], [L / 2, -D / 2], [L / 2, D / 2]].forEach(([x, z]) => rod([x, SWING.seat - 0.1, z], [x * 1.04, ROOM.wall + 0.3, z * 0.5], 0.008, ropeM, g));
    // Four props on the swing — one slot for a black dial phone and three question-mark boxes
    const items = [];
    const phone = new T.Group();
    box(0.2, 0.09, 0.18, mat("--site-stripe", { roughness: 0.3 }), 0, 0.045, 0, phone);
    box(0.22, 0.04, 0.06, mat("--site-stripe", { roughness: 0.3 }), 0, 0.13, 0, phone);
    phone.position.set(-0.5, SWING.seat + 0.09, 0.08); g.add(phone); items.push(phone);
    [[-0.08, 0.1], [0.24, -0.08], [0.5, 0.12]].forEach(([x, z]) => {
      const b = box(0.12, 0.12, 0.12, mat("--site-canvas-yellow"), x, SWING.seat + 0.15, z, g);
      b.rotation.y = rnd(); items.push(b);
    });
    g.rotation.y = Math.PI / 2;
    g.position.set(SWING.x, 0, SWING.z);
    g.userData.items = items;
    return g;
  }

  function makeStairs(g) {
    const treadM = mat("treads", { map: TEX.wood("--site-oak", 0.12) });
    const stringer = mat("--site-beam");
    const x0 = STAIR.x - STAIR.width / 2;
    for (let i = 0; i < STAIR.steps; i++) {
      const y = (i + 1) * STAIR.riser, z = STAIR.bottomZ - (i + 0.5) * STAIR.tread;
      box(STAIR.width, 0.04, STAIR.tread + 0.02, treadM, STAIR.x, y - 0.02, z, g);
      box(STAIR.width, STAIR.riser, 0.02, treadM, STAIR.x, y - STAIR.riser / 2, z + STAIR.tread / 2, g);
    }
    const run = STAIR.steps * STAIR.tread, rise = STAIR.steps * STAIR.riser;
    const len = Math.hypot(run, rise), ang = Math.atan2(rise, run);
    const s = box(0.06, 0.3, len, stringer, x0 - 0.03, rise / 2 - 0.1, STAIR.bottomZ - run / 2, g);
    s.rotation.x = ang;
    // Perforated pegboard wall closing off under the stairs (the board that holds shelves)
    const shape = new T.Shape();
    shape.moveTo(STAIR.bottomZ, 0); shape.lineTo(STAIR.bottomZ - run, rise - 0.12); shape.lineTo(STAIR.bottomZ - run, 0); shape.closePath();
    const wall = new T.Mesh(new T.ShapeGeometry(shape), mat("pegwall", { map: TEX.pegboard(), side: T.DoubleSide }));
    wall.material.map.repeat.set(1.5, 1.5);
    wall.rotation.y = -Math.PI / 2; wall.position.x = x0 - 0.08; wall.receiveShadow = true;
    g.add(wall);
    // Railing — a post every 4 steps, six horizontal bars following the slope
    const rail = chrome(), x = x0 + 0.02;
    for (let i = 0; i <= STAIR.steps; i += 4) {
      const y = i * STAIR.riser, z = STAIR.bottomZ - i * STAIR.tread;
      rod([x, y, z], [x, y + STAIR.rail, z], 0.014, rail, g);
    }
    for (let b = 1; b <= 6; b++) {
      const h = (STAIR.rail * b) / 6;
      rod([x, h, STAIR.bottomZ], [x, rise + h, STAIR.bottomZ - run], 0.007, rail, g);
    }
  }

  function makePegboard(g) {
    const items = [];
    const shelfM = mat("shelf", { map: TEX.wood("--site-oak", 0.1) });
    const wx = PEG.x;
    PEG.shelf.ys.forEach((dy) => box(PEG.shelf.depth, 0.025, PEG.shelf.length, shelfM, wx - PEG.shelf.depth / 2, PEG.shelfY + dy, PEG.z + PEG.shelf.x, g));
    const roll = cyl(PEG.roll.r, PEG.roll.r, PEG.roll.length, mat("--site-kraft"), wx - 0.07, PEG.y + PEG.roll.y, PEG.z + PEG.roll.x, g);
    roll.rotation.x = Math.PI / 2;
    const paper = box(0.004, 0.33, PEG.roll.length * 0.96, mat("--site-kraft"), wx - 0.02, PEG.y + PEG.roll.y - 0.18, PEG.z + PEG.roll.x, g);
    paper.rotation.z = 0.08;
    // Shelf props — spots for mic·tape·teddy bear / robot·yarn ball / camcorder·marker stand
    const put = (o, dy, dz) => { o.position.set(wx - 0.08, PEG.shelfY + dy + 0.0125, PEG.z + PEG.shelf.x + dz); g.add(o); return o; };
    const mic = new T.Group(); cyl(0.035, 0.035, 0.1, mat("--site-sky-haze"), 0, 0.06, 0, mic); box(0.06, 0.08, 0.05, mat("--site-seat"), 0, 0.14, 0, mic);
    items.push(put(mic, 0.26, -0.28));
    const tape = new T.Mesh(new T.TorusGeometry(0.05, 0.02, 10, 24), mat("--site-chair-blue")); tape.rotation.y = Math.PI / 2;
    put(tape, 0.31, -0.08);
    const bear = new T.Group(), bm = mat("--site-kraft");
    const body = new T.Mesh(new T.SphereGeometry(0.05, 16, 12), bm); body.position.y = 0.05; bear.add(body);
    const head = new T.Mesh(new T.SphereGeometry(0.038, 16, 12), bm); head.position.y = 0.12; bear.add(head);
    items.push(put(bear, 0.26, 0.16));
    const robot = new T.Group(); box(0.08, 0.06, 0.11, mat("--site-rug"), 0, 0.05, 0, robot);
    [-0.035, -0.012, 0.012, 0.035].forEach((z) => box(0.02, 0.03, 0.015, mat("--site-rug"), 0, 0.015, z, robot));
    items.push(put(robot, 0, -0.28));
    put(new T.Mesh(new T.SphereGeometry(0.05, 16, 12), mat("--site-canvas-red")), 0.05, -0.06).position.y += 0.035;
    const cam = new T.Group(); box(0.07, 0.06, 0.1, mat("--site-panel-dark"), 0, 0.04, 0, cam);
    [-0.025, 0.025].forEach((z) => { const r = cyl(0.03, 0.03, 0.02, mat("--site-canvas-yellow"), 0, 0.1, z, cam); r.rotation.x = Math.PI / 2; r.rotation.z = Math.PI / 2; });
    items.push(put(cam, -0.26, -0.28));
    put(box(0.05, 0.04, 0.06, mat("--site-oak-dark")), -0.26, -0.05);
    return items;
  }

  function makeWhiteboard(g) {
    const s = new T.Group();
    const b = BOARD;
    const face = new T.Mesh(new T.PlaneGeometry(b.width, b.height), mat("board", { map: TEX.board(), roughness: 0.35 }));
    face.position.y = b.sill + b.height / 2; face.position.z = 0.016; s.add(face);
    const fr = chrome();
    box(b.width + 0.1, b.height + 0.1, 0.03, fr, 0, b.sill + b.height / 2, 0, s);
    [-1, 1].forEach((k) => {
      box(0.04, b.sill + b.height + 0.05, 0.04, fr, (k * (b.width + 0.12)) / 2, (b.sill + b.height + 0.05) / 2, -0.03, s);
      box(0.06, 0.03, 0.6, fr, (k * (b.width + 0.12)) / 2, 0.06, -0.03, s);
    });
    box(b.width, 0.03, 0.06, fr, 0, b.sill - 0.03, 0.03, s);
    s.rotation.y = -Math.PI / 2;
    s.position.set(b.x, 0, b.z);
    g.add(s);
    // Three marker spots on the panel (ratios of the original memo spots)
    return [[0.07, 0.13], [0.62, 0.34], [0.34, 0.61]].map(([u, v]) => new T.Vector3(b.x - 0.03, b.sill + b.height * (1 - v - 0.08), b.z + (u + 0.06 - 0.5) * b.width));
  }

  function makeLounge(g) {
    const zw = -ROOM.depth / 2;
    const ledM = mat("led", { color: col("--site-glow"), emissive: col("--site-glow"), emissiveIntensity: 2 });
    [-2.42, 2.6].forEach((x) => box(0.016, LOFT.height - LOFT.slab - 0.1, 0.02, ledM, x, (LOFT.height - LOFT.slab) / 2, zw + 0.12, g));
    const screen = new T.Mesh(new T.PlaneGeometry(TV.width, TV.height), new T.MeshBasicMaterial({ map: TEX.screen("Coming soon"), toneMapped: false }));
    screen.position.set(TV.x, TV.y, zw + 0.07); g.add(screen);
    box(TV.width + 0.08, TV.height + 0.06, 0.04, mat("--site-screen"), TV.x, TV.y, zw + 0.045, g);
    const con = mat("--site-oak");
    box(2.65, 0.5, 0.4, con, TV.x, 0.25, zw + 0.45, g);
    // Books on the console shelf — multicolored spines
    const books = ["--site-canvas-blue", "--site-red", "--site-linen", "--site-green", "--site-seat", "--site-stripe", "--site-canvas-yellow", "--site-chair-blue"];
    for (let i = 0; i < 26; i++) box(0.04 + rnd() * 0.02, 0.18 + rnd() * 0.06, 0.16, mat(books[i % books.length]), TV.x - 1.2 + i * 0.075, 0.6, zw + 0.45, g);
    const rug = new T.Mesh(new T.PlaneGeometry(5, 2.7), mat("rug", { map: TEX.rug() }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0.35, 0.006, zw + 1.8); rug.receiveShadow = true; g.add(rug);
    const couch = mat("couch", { color: col("--site-brick-light"), roughness: 1 });
    const cz = zw + 2.25;
    box(3, 0.42, 0.95, couch, -0.5, 0.21, cz, g);
    box(3, 0.36, 0.26, couch, -0.5, 0.6, cz + 0.35, g);
    [-1, 1].forEach((k) => box(0.2, 0.62, 0.95, couch, -0.5 + k * 1.4, 0.31, cz, g));
    box(0.75, 0.38, 0.75, mat("--site-seat"), 0.35, 0.19, zw + 1.15, g);
    const red = mat("armchair", { color: col("--site-red"), roughness: 0.95 });
    [1.2, 2].forEach((z) => {
      const zc = zw + z + 0.6;
      box(0.86, 0.42, 0.86, red, 2.2, 0.21, zc, g);
      box(0.18, 0.46, 0.86, red, 2.2 + 0.34, 0.65, zc, g);
      [-1, 1].forEach((k) => box(0.86, 0.6, 0.16, red, 2.2, 0.3, zc + k * 0.35, g));
    });
  }

  function makeBooth(g) {
    const b = BOOTH, s = new T.Group();
    const frameM = mat("--site-canvas-yellow", { metalness: 0.4, roughness: 0.4 });
    const inner = mat("boothInner", { color: col("--kf-accent-soft"), emissive: col("--site-glow"), emissiveIntensity: 0.12 });
    box(b.width, b.height, 0.04, inner, 0, b.height / 2, -b.depth / 2, s);
    [-1, 1].forEach((k) => box(0.04, b.height, b.depth, inner, (k * b.width) / 2, b.height / 2, 0, s));
    box(b.width, 0.06, b.depth, frameM, 0, b.height, 0, s);
    box(b.width, 0.04, b.depth, mat("--kf-accent"), 0, 0.02, 0, s);
    const glass = new T.Mesh(new T.PlaneGeometry(b.width - 0.08, b.height - 0.1), new T.MeshStandardMaterial({ color: col("--site-sky-haze"), transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.2 }));
    glass.position.set(0, b.height / 2, b.depth / 2); s.add(glass);
    [-1, 1].forEach((k) => box(0.04, b.height, 0.04, frameM, (k * b.width) / 2, b.height / 2, b.depth / 2, s));
    box(0.42, 0.12, 0.03, mat("--site-seat"), 0, b.height + 0.12, b.depth / 2, s);
    box(0.12, 0.22, 0.08, mat("--site-red"), 0.25, 1.35, -b.depth / 2 + 0.06, s);
    s.position.set(b.x, 0, b.z);
    g.add(s);
  }

  function makeLoft(g) {
    const zb = -ROOM.depth / 2, zf = zb + LOFT.depth, xl = -ROOM.width / 2, xr = LOFT.rightEdge;
    const w = xr - xl, cx = (xl + xr) / 2;
    const deck = mat("deck", { map: TEX.wood("--site-deck", 0.12, 6) });
    box(w, LOFT.slab, LOFT.depth, deck, cx, LOFT.height - LOFT.slab / 2, zb + LOFT.depth / 2, g);
    box(w, LOFT.fascia, 0.06, mat("fascia", { map: TEX.wood("--site-beam-light", 0.14) }), cx, LOFT.height - LOFT.fascia / 2, zf, g);
    const carpet = new T.Mesh(new T.PlaneGeometry(w, LOFT.depth), mat("--kf-accent", { roughness: 1 }));
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(cx, LOFT.height + 0.002, zb + LOFT.depth / 2); carpet.receiveShadow = true; g.add(carpet);
    const rail = chrome();
    for (let x = xl + 0.1; x <= xr; x += 1.45) rod([x, LOFT.height, zf - 0.04], [x, LOFT.height + LOFT.rail, zf - 0.04], 0.018, rail, g);
    rod([xr - 0.02, LOFT.height, zf - 0.04], [xr - 0.02, LOFT.height + LOFT.rail, zf - 0.04], 0.018, rail, g);
    for (let i = 1; i <= LOFT.bars; i++) rod([xl, LOFT.height + (LOFT.rail * i) / LOFT.bars, zf - 0.04], [xr, LOFT.height + (LOFT.rail * i) / LOFT.bars, zf - 0.04], 0.008, rail, g);
    rod([xr - 0.02, LOFT.height + LOFT.rail, zf - 0.04], [xr - 0.02, LOFT.height + LOFT.rail, zb], 0.012, rail, g);
    LOFT.posts.forEach((x) => box(LOFT.post, LOFT.height - LOFT.slab, LOFT.post, mat("--site-linen"), x, (LOFT.height - LOFT.slab) / 2, zf - 0.11, g));
    // Linen curtain wrapped around the pillar (folds shaded by vertical columns)
    const pleat = canvasTex(64, 8, (c, cw, ch) => { for (let i = 0; i < 8; i++) { c.fillStyle = CL.css("--site-linen"); c.fillRect((i * cw) / 8, 0, cw / 8, ch); shade(c, (i * cw) / 8, 0, cw / 16, ch, -0.12); } }, 3, 1);
    [[-4.05, 0.95], [0.35, 0.52], [2.9, 0.62]].forEach(([x, wd]) => box(wd, LOFT.height - LOFT.slab - 0.05, 0.08, mat("pleat", { map: pleat, roughness: 1 }), x, (LOFT.height - LOFT.slab) / 2, zf + 0.02, g));
    // Two desks in the attic, a monitor, and a yellow ball chair spot
    const desk = mat("--site-seat");
    [[-2.7, -4.45], [0.25, -4.45]].forEach(([x, z]) => {
      box(2.3, 0.04, 1.14, desk, x, LOFT.height + 0.7625, z, g);
      [-1, 1].forEach((k) => box(0.04, 0.7625, 1.0, mat("--site-panel-dark"), x + k * 1.1, LOFT.height + 0.38, z, g));
      [-0.6, 0.4].forEach((dx) => box(0.6, 0.36, 0.03, mat("--site-screen"), x + dx, LOFT.height + 1.0, z - 0.3, g));
    });
    const ball = new T.Mesh(new T.SphereGeometry(0.32, 24, 16), mat("--site-canvas-yellow"));
    ball.position.set(-3.9, LOFT.height + 0.32, -3.4); ball.castShadow = true; g.add(ball);
  }

  function makePlant(g, x, z, h, potR) {
    const p = new T.Group();
    cyl(potR, potR * 0.75, potR * 1.4, mat("pot", { color: col("--site-brick-light") }), 0, potR * 0.7, 0, p);
    const leafM = mat("leaf", { color: col("--site-leaf"), side: T.DoubleSide, roughness: 0.7 });
    const leafG = (() => {
      const s = new T.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.09, 0.22, 0, 0.5); s.quadraticCurveTo(-0.09, 0.22, 0, 0);
      return new T.ShapeGeometry(s, 6);
    })();
    for (let i = 0; i < 26; i++) {
      const l = new T.Mesh(leafG, leafM);
      const a = rnd() * Math.PI * 2, y = potR * 1.4 + rnd() * h;
      l.position.set(Math.cos(a) * 0.08, y, Math.sin(a) * 0.08);
      l.rotation.set(-0.5 - rnd() * 0.6, a, 0, "YXZ");
      l.scale.setScalar(0.8 + rnd() * 0.9);
      l.castShadow = true; p.add(l);
      rod([0, potR * 1.2, 0], [Math.cos(a) * 0.08, y, Math.sin(a) * 0.08], 0.006, mat("--site-green"), p);
    }
    p.position.set(x, 0, z);
    g.add(p);
  }

  function makeShell(g) {
    const W = ROOM.width / 2, D = ROOM.depth / 2;
    const floor = new T.Mesh(new T.PlaneGeometry(ROOM.width, ROOM.depth), mat("floor", { map: TEX.tiles(), roughness: 0.6 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
    const brick = mat("brick", { map: TEX.brick("--site-brick", "--site-panel-dark"), roughness: 0.95 });
    const plaster = mat("--site-plaster", { roughness: 0.95 });
    // Back wall — light brick below the attic, dark brick above. The ridge runs along x, so the gable stands on the side wall
    const back = new T.Mesh(new T.PlaneGeometry(ROOM.width, ROOM.wall), brick);
    back.material.map.repeat.set(2.2, 1);
    back.position.set(0, ROOM.wall / 2, -D); back.receiveShadow = true; g.add(back);
    const lb = new T.Mesh(new T.PlaneGeometry(LOFT.rightEdge + W, LOFT.height - LOFT.slab), mat("brickLight", { map: TEX.brick("--site-brick-light", "--site-plaster"), roughness: 0.95 }));
    lb.position.set((LOFT.rightEdge - W) / 2, (LOFT.height - LOFT.slab) / 2, -D + 0.01); g.add(lb);
    const front = new T.Mesh(new T.PlaneGeometry(ROOM.width, ROOM.wall), plaster);
    front.rotation.y = Math.PI; front.position.set(0, ROOM.wall / 2, D); g.add(front);
    const gable = new T.Shape();
    gable.moveTo(-D, 0); gable.lineTo(D, 0); gable.lineTo(D, ROOM.wall); gable.lineTo(0, ROOM.ridge); gable.lineTo(-D, ROOM.wall); gable.closePath();
    const peak = new T.Shape();
    peak.moveTo(-D, ROOM.wall); peak.lineTo(D, ROOM.wall); peak.lineTo(0, ROOM.ridge); peak.closePath();
    // Right wall — white plaster (gable) + a group of canvas paintings above the stairs
    const right = new T.Mesh(new T.ShapeGeometry(gable), plaster);
    right.rotation.y = -Math.PI / 2; right.position.x = W; right.receiveShadow = true; g.add(right);
    const leftPeak = new T.Mesh(new T.ShapeGeometry(peak), brick);
    leftPeak.rotation.y = Math.PI / 2; leftPeak.position.x = -W; g.add(leftPeak);
    const c = (STAIR.steps * STAIR.tread * 0.95) / 850;
    [[175, 413, 134, 194, "--site-canvas-red"], [313, 464, 114, 178, "--site-canvas-blue"], [488, 369, 198, 160, "--site-canvas-yellow"], [457, 646, 200, 154, "--site-canvas-green"],
      [674, 516, 198, 130, "--site-canvas-red"], [644, 704, 134, 190, "--site-canvas-blue"], [810, 820, 146, 202, "--site-canvas-yellow"],
      [74, 394, 49, 66, null], [297, 337, 78, 66, null], [216, 538, 48, 42, null], [294, 579, 27, 36, null], [332, 578, 27, 36, null], [423, 511, 55, 71, null], [489, 506, 57, 70, null],
      [674, 409, 89, 67, null], [804, 550, 25, 33, null], [777, 653, 74, 87, null], [865, 671, 66, 46, null], [514, 765, 84, 62, null]].forEach(([px, py, pw, ph, colr]) => {
      const z = STAIR.bottomZ - STAIR.steps * STAIR.tread + 0.1 + (px - 49) * c, y = 4.6 - (py + 0.06 * px - 313) * c;
      if (colr) box(0.04, ph * c, pw * c, mat(colr), W - 0.03, y, z, g);
      else {
        box(0.02, ph * c, pw * c, mat("--site-frame"), W - 0.012, y, z, g);
        box(0.022, ph * c * 0.78, pw * c * 0.74, mat("--site-kraft"), W - 0.014, y, z, g);
      }
    });
    // Left wall — a sky panel outside the window (dark frame, mullions)
    const sill = 0.35, head = 3.55;
    box(0.2, sill, ROOM.depth, brick, -W - 0.1, sill / 2, 0, g);
    const top = box(0.2, ROOM.wall - head, ROOM.depth, brick, -W - 0.1, (ROOM.wall + head) / 2, 0, g);
    top.castShadow = false;
    box(0.2, head - sill, 1.4, plaster, -W - 0.1, (head + sill) / 2, 1.3, g);
    box(0.2, head - sill, 0.5, brick, -W - 0.1, (head + sill) / 2, -5.75, g);
    box(0.2, head - sill, 0.5, brick, -W - 0.1, (head + sill) / 2, 5.75, g);
    const fm = mat("--site-frame", { roughness: 0.5 });
    [[-5.5, 0.6, 4], [2, 5.5, 1]].forEach(([a, b, n]) => {
      box(0.09, 0.09, b - a, fm, -W, sill, (a + b) / 2, g);
      box(0.09, 0.09, b - a, fm, -W, head, (a + b) / 2, g);
      box(0.09, 0.09, b - a, fm, -W, (sill + head) / 2 + 0.4, (a + b) / 2, g);
      for (let i = 0; i <= n + 1; i++) box(0.09, head - sill, 0.09, fm, -W, (head + sill) / 2, a + ((b - a) * i) / (n + 1), g);
    });
    const sky = new T.Mesh(new T.PlaneGeometry(30, 10), new T.MeshBasicMaterial({ map: TEX.sky(), toneMapped: false }));
    sky.rotation.y = Math.PI / 2; sky.position.set(-W - 3, 3, 0); g.add(sky);
    // Roof — two faces tilted front and back, beams side by side in the x direction (seen as horizontal lines from the camera)
    const slope = Math.hypot(D, ROOM.ridge - ROOM.wall), ang = Math.atan2(ROOM.ridge - ROOM.wall, D);
    const roofM = mat("roof", { map: TEX.wood("--site-beam", 0.16, 8), roughness: 0.9, side: T.DoubleSide });
    roofM.map.repeat.set(4, 1);
    const rafterM = mat("--site-beam-light", { roughness: 0.8 });
    const roofY = (z) => ROOM.ridge - ((ROOM.ridge - ROOM.wall) * Math.abs(z)) / D;
    [-1, 1].forEach((k) => {
      const r = new T.Mesh(new T.PlaneGeometry(ROOM.width, slope), roofM);
      r.rotation.x = Math.PI / 2 + k * ang;
      r.position.set(0, (ROOM.wall + ROOM.ridge) / 2 + 0.02, (k * D) / 2);
      g.add(r);
    });
    for (let z = -D + 0.25; z < D; z += 0.55) {
      const b = box(ROOM.width, 0.16, 0.1, rafterM, 0, roofY(z) - 0.1, z, g);
      b.rotation.x = Math.sign(z) * ang; b.castShadow = false;
    }
    box(ROOM.width, 0.24, 0.16, rafterM, 0, ROOM.ridge - 0.12, 0, g);
    // Two silver ducts that follow the ceiling and bend down in front of the attic
    const duct = chrome();
    [[-2.6, 4.25, -2.2], [1.9, 4.45, -2.2]].forEach(([x, y, zEnd]) => {
      const d = cyl(0.24, 0.24, D - zEnd, duct, x, y, (D + zEnd) / 2, g, 28); d.rotation.x = Math.PI / 2; d.castShadow = false;
      cyl(0.24, 0.24, y - 3.75, duct, x, (y + 3.75) / 2, zEnd, g, 28).castShadow = false;
    });
    const tube = box(1.1, 0.05, 0.12, mat("tube", { color: col("--site-white"), emissive: col("--site-white"), emissiveIntensity: 0.6 }), 0.1, 4.0, -1.4, g);
    tube.castShadow = false;
  }

  function makeRailing(g) {
    const r = chrome(), z = SWING.z + 1.45, x0 = -ROOM.width / 2, x1 = x0 + 2.3;
    [x0 + 0.05, x1].forEach((x) => rod([x, 0, z], [x, 0.95, z], 0.02, r, g));
    for (let i = 1; i <= 8; i++) rod([x0, (0.95 * i) / 8, z], [x1, (0.95 * i) / 8, z], 0.008, r, g);
  }

  function lights(scene) {
    scene.add(new T.HemisphereLight(col("--site-white"), col("--site-floor"), 1.25));
    const sun = new T.DirectionalLight(col("--site-sky-fill"), 2.2);
    sun.position.set(-9, 7, 2); sun.target.position.set(0, 0, -1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
    sun.shadow.bias = -0.0006;
    scene.add(sun, sun.target);
    const warm = new T.PointLight(col("--site-glow"), 6, 7, 1.6);
    warm.position.set(0, 2.4, TABLE.z); scene.add(warm);
    const lounge = new T.PointLight(col("--site-glow"), 3, 6, 1.8);
    lounge.position.set(0, 2.2, -4.6); scene.add(lounge);
    scene.add(new T.AmbientLight(col("--site-white"), 0.35));
  }

  // Builds the scene in several pieces — each piece reports progress so the entrance door number climbs along
  async function build(scene, progress = () => {}) {
    seed = 7;
    const anchors = {};
    const steps = [
      () => lights(scene),
      () => makeShell(scene),
      () => makeLoft(scene),
      () => makeLounge(scene),
      () => makeBooth(scene),
      () => makeStairs(scene),
      () => { anchors.pegboard = makePegboard(scene); },
      () => { anchors.whiteboard = makeWhiteboard(scene); },
      () => { const t = makeTable(); scene.add(t); anchors.table = t.userData.items; scene.add(makeStools()); scene.add(makeLamp()); },
      () => { const s = makeSwing(); scene.add(s); anchors.swing = s.userData.items; makeRailing(scene); },
      () => { makePlant(scene, -4.3, -1.3, 1.6, 0.26); makePlant(scene, -3.7, -2.2, 1.1, 0.2); makePlant(scene, -4.5, 3.6, 1.2, 0.24); makePlant(scene, -2.2, 3.0, 0.9, 0.18); },
    ];
    for (let i = 0; i < steps.length; i++) {
      steps[i]();
      progress(((i + 1) / steps.length) * 100);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    return anchors;
  }

  // Entrance door model — only the desk, chair and lights are built separately, turning once around in 44 seconds (original video length)
  function turntable() {
    seed = 7;
    const g = new T.Group();
    const t = makeTable(); t.position.z = 0; g.add(t);
    const st = makeStools(); st.position.z = -TABLE.z; g.add(st);
    const l = makeLamp(); l.position.set(0, -0.35, 0); l.rotation.y = 0; g.add(l);
    return g;
  }

  window.CatRoom = { build, turntable, VIEWS, TABLE, SWING, PEG, BOARD, BOOTH, TV };
})();
