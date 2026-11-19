// Rebuilds the original’s VRM character (three r171 + 15 VRM animations) as our basic-shape doll — same height (about 1.62) · same head/body ratio,
// Three-step toon material plus outline, linking 15 hand-made poses on the skeleton with 1s cross-fades (original crossFadeFrom(…, 1)).
// All colors are read from Skin variables — header = Accent color, skin = White cotton · purple accent, stockings = Text color.
(() => {
  const T = window.THREE;
  if (!T) return;

  // ── Skin variable → color: paint it into one canvas cell so oklch and color-mix also resolve, then read it back as sRGB ──
  const probeEl = document.createElement("i");
  probeEl.style.display = "none";
  document.documentElement.append(probeEl);
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  const cssColor = (v) => {
    probeEl.style.color = `var(${v})`;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(probeEl).color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };
  const cssString = (v) => {
    const c = cssColor(v);
    return `#${c.getHexString(T.SRGBColorSpace)}`;
  };

  const palette = () => ({
    accent: cssColor("--kf-accent"),
    soft: cssColor("--kf-accent-soft"),
    purple: cssColor("--site-purple"),
    sky: cssColor("--site-sky"),
    lemon: cssColor("--site-lemon"),
    surface: cssColor("--kf-surface"),
    raised: cssColor("--kf-raised"),
    ink: cssColor("--kf-ink"),
    skin: cssColor("--site-skin"),
    bg: cssColor("--kf-bg"),
  });

  // Toon 3-step (dark · mid · light) gradient map
  let toonMap = null;
  const gradient = () => {
    if (toonMap) return toonMap;
    toonMap = new T.DataTexture(new Uint8Array([150, 205, 255]), 3, 1, T.RedFormat);
    toonMap.minFilter = toonMap.magFilter = T.NearestFilter;
    toonMap.needsUpdate = true;
    return toonMap;
  };

  // Glossy decoration (original environment-map reflection) as a single matcap — flowing from sky blue to pink with a white sparkle at upper left
  const matcap = (pal, a = "sky", b = "accent") => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const lin = g.createLinearGradient(0, 0, 256, 256);
    lin.addColorStop(0, `#${pal.surface.getHexString(T.SRGBColorSpace)}`);
    lin.addColorStop(0.35, `#${pal[a].getHexString(T.SRGBColorSpace)}`);
    lin.addColorStop(1, `#${pal[b].getHexString(T.SRGBColorSpace)}`);
    g.fillStyle = lin;
    g.fillRect(0, 0, 256, 256);
    const hi = g.createRadialGradient(80, 70, 4, 80, 70, 70);
    hi.addColorStop(0, `#${pal.surface.getHexString(T.SRGBColorSpace)}`);
    hi.addColorStop(1, "transparent");
    g.fillStyle = hi;
    g.fillRect(0, 0, 256, 256);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  };

  const ease = {
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: (t) => 1 - (1 - t) * (1 - t),
    in: (t) => t * t,
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

  // ── Complete Doll Set ──
  function makeAvatar(pal, opts = {}) {
    const toon = (color) => new T.MeshToonMaterial({ color, gradientMap: gradient() });
    const lineMat = new T.MeshBasicMaterial({ color: pal.ink.clone().lerp(pal.accent, 0.35), side: T.BackSide });
    const outline = opts.outline !== false;
    const add = (parent, geo, mat, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0], line = 1.04) => {
      const m = new T.Mesh(geo, mat);
      m.position.set(...pos);
      m.scale.set(...scale);
      m.rotation.set(...rot);
      parent.add(m);
      if (outline && line) {
        const o = new T.Mesh(geo, lineMat);
        o.scale.setScalar(line);
        m.add(o);
      }
      return m;
    };
    const pivot = (parent, pos) => {
      const p = new T.Group();
      p.position.set(...pos);
      parent.add(p);
      return p;
    };

    const M = {
      hair: toon(pal.accent),
      hairDeep: toon(pal.accent.clone().lerp(pal.purple, 0.5)),
      skin: toon(pal.skin),
      white: toon(pal.surface),
      dress: toon(pal.accent),
      skirt: toon(pal.purple.clone().lerp(pal.ink, 0.25)),
      frill: toon(pal.soft),
      ribbon: toon(pal.purple),
      gold: toon(pal.lemon),
      legs: toon(pal.ink.clone().lerp(pal.purple, 0.15)),
      shoe: toon(pal.ink.clone().multiplyScalar(0.7)),
      eye: new T.MeshBasicMaterial({ color: pal.purple.clone().lerp(pal.ink, 0.45) }),
      eyeHi: new T.MeshBasicMaterial({ color: pal.surface }),
      blush: new T.MeshBasicMaterial({ color: pal.accent, transparent: true, opacity: 0.35 }),
    };

    const root = new T.Group();
    const body = pivot(root, [0, 0, 0]);
    const hips = pivot(body, [0, 0.86, 0]);
    // Skirt: two truncated cones (purple inside, pink outside), hem made wavy
    const skirtGeo = (rt, rb, h, waves, amp) => {
      const g = new T.CylinderGeometry(rt, rb, h, 48, 1, true);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        if (p.getY(i) > 0) continue;
        const a = Math.atan2(p.getZ(i), p.getX(i));
        const k = 1 + amp * Math.sin(a * waves);
        p.setX(i, p.getX(i) * k);
        p.setZ(i, p.getZ(i) * k);
        p.setY(i, p.getY(i) + amp * 0.4 * Math.cos(a * waves));
      }
      g.computeVertexNormals();
      return g;
    };
    const skirtMatIn = M.skirt.clone(); skirtMatIn.side = T.DoubleSide;
    const skirtMatOut = M.frill.clone(); skirtMatOut.side = T.DoubleSide;
    add(hips, skirtGeo(0.1, 0.3, 0.3, 12, 0.07), skirtMatIn, [0, -0.13, 0], [1, 1, 0.92], [0, 0, 0], 0);
    add(hips, skirtGeo(0.1, 0.25, 0.2, 10, 0.08), skirtMatOut, [0, -0.06, 0], [1, 1, 0.92], [0, 0, 0], 0);
    add(hips, new T.CylinderGeometry(0.085, 0.095, 0.08, 24), M.skirt, [0, 0.02, 0], [1, 1, 0.8]);

    const spine = pivot(hips, [0, 0.06, 0]);
    add(spine, new T.CylinderGeometry(0.072, 0.082, 0.1, 24), M.skirt, [0, 0.03, 0], [1, 1, 0.78]);
    const chest = pivot(spine, [0, 0.18, 0]);
    add(chest, new T.CapsuleGeometry(0.088, 0.1, 6, 20), M.white, [0, -0.02, 0], [1.06, 1, 0.78]);
    // Shoulder cape + chest ribbon
    add(chest, new T.CylinderGeometry(0.09, 0.17, 0.12, 32, 1, true), Object.assign(M.dress.clone(), { side: T.DoubleSide }), [0, 0.06, 0], [1, 1, 0.85], [0, 0, 0], 0);
    const bow = pivot(chest, [0, 0.05, 0.09]);
    add(bow, new T.SphereGeometry(0.035, 16, 12), M.ribbon, [-0.04, 0, 0], [1.3, 0.8, 0.5]);
    add(bow, new T.SphereGeometry(0.035, 16, 12), M.ribbon, [0.04, 0, 0], [1.3, 0.8, 0.5]);
    add(bow, new T.SphereGeometry(0.02, 12, 10), M.gold, [0, 0, 0.012]);

    const neck = pivot(chest, [0, 0.17, 0]);
    add(neck, new T.CylinderGeometry(0.022, 0.026, 0.07, 12), M.skin, [0, -0.015, 0], [1, 1, 1], [0, 0, 0], 0);
    const head = pivot(neck, [0, 0.05, 0]);
    head.scale.setScalar(0.84);
    add(head, new T.SphereGeometry(0.118, 32, 24), M.skin, [0, 0.12, 0.004], [1, 1.04, 1]);
    // Face: eyes (vertical ellipses), sparkle, cheeks, mouth
    for (const s of [-1, 1]) {
      const e = add(head, new T.SphereGeometry(0.025, 16, 12), M.eye, [s * 0.044, 0.112, 0.103], [0.8, 1.25, 0.35], [0, s * 0.35, 0], 0);
      add(e, new T.SphereGeometry(0.009, 8, 6), M.eyeHi, [-s * 0.006, 0.008, 0.02], [1, 1, 1], [0, 0, 0], 0);
      add(head, new T.CircleGeometry(0.018, 16), M.blush, [s * 0.062, 0.078, 0.108], [1.4, 0.7, 1], [0, s * 0.5, 0], 0);
    }
    add(head, new T.SphereGeometry(0.008, 8, 6), M.eye, [0, 0.058, 0.115], [1.6, 0.6, 0.5], [0, 0, 0], 0);
    // Hair: back hair · front hair cap · side buns · side locks · ribbon
    add(head, new T.SphereGeometry(0.134, 32, 24), M.hair, [0, 0.135, -0.03], [1.04, 1.02, 1]);
    add(head, new T.SphereGeometry(0.128, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.36), M.hair, [0, 0.14, 0.012], [1.03, 1.05, 1.06], [0.35, 0, 0]);
    for (const s of [-1, 1]) {
      add(head, new T.SphereGeometry(0.05, 20, 16), M.hair, [s * 0.1, 0.215, -0.045]);
      add(head, new T.CapsuleGeometry(0.026, 0.16, 4, 10), M.hairDeep, [s * 0.112, 0.03, 0.02], [1, 1, 0.8], [0, 0, s * 0.08]);
      const r = add(head, new T.TorusGeometry(0.03, 0.013, 8, 16), M.ribbon, [s * 0.13, 0.275, -0.01], [1, 1, 1], [0.3, s * 0.9, 0]);
      r.userData.ribbon = true;
    }

    const arm = (s) => {
      const shoulder = pivot(chest, [s * 0.108, 0.105, 0]);
      add(shoulder, new T.SphereGeometry(0.06, 16, 12), M.white, [s * 0.008, -0.055, 0], [1, 1.25, 1]);
      add(shoulder, new T.CapsuleGeometry(0.03, 0.15, 4, 10), M.white, [0, -0.12, 0]);
      const elbow = pivot(shoulder, [0, -0.235, 0]);
      add(elbow, new T.CapsuleGeometry(0.026, 0.14, 4, 10), M.white, [0, -0.09, 0]);
      add(elbow, new T.CylinderGeometry(0.03, 0.05, 0.05, 16, 1, true), Object.assign(M.frill.clone(), { side: T.DoubleSide }), [0, -0.18, 0], [1, 1, 1], [0, 0, 0], 0);
      const hand = pivot(elbow, [0, -0.22, 0]);
      add(hand, new T.SphereGeometry(0.032, 14, 10), M.skin, [0, -0.015, 0], [0.9, 1.2, 0.7]);
      return { shoulder, elbow, hand };
    };
    const leg = (s) => {
      const thigh = pivot(hips, [s * 0.058, -0.04, 0]);
      add(thigh, new T.CapsuleGeometry(0.05, 0.3, 4, 12), M.legs, [0, -0.2, 0]);
      const knee = pivot(thigh, [0, -0.4, 0]);
      add(knee, new T.CapsuleGeometry(0.04, 0.3, 4, 12), M.legs, [0, -0.19, 0]);
      const foot = pivot(knee, [0, -0.4, 0]);
      add(foot, new T.SphereGeometry(0.05, 14, 10), M.shoe, [0, -0.015, 0.025], [0.85, 0.6, 1.5]);
      return { thigh, knee, foot };
    };
    const L = arm(1), R = arm(-1), LL = leg(1), RL = leg(-1);
    const J = { body, hips, spine, chest, neck, head, armL: L, armR: R, legL: LL, legR: RL };

    // ── Poses: time (seconds) → joint angles. Stands in for the original’s 15 VRMA clips (two base, five idle, eight active) with the same count and length ──
    const P = (o) => Object.assign({ hy: 0, hz: 0, hry: 0, sx: 0, sz: 0, cx: 0, cz: 0, nx: 0, nz: 0, ny: 0, lax: 0, laz: 0.12, lay: 0, lex: 0, rax: 0, raz: -0.12, ray: 0, rex: 0, ltx: 0, ltz: 0, lkx: 0, rtx: 0, rtz: 0, rkx: 0 }, o);
    const breath = (t) => Math.sin(t * 2.2) * 0.02;
    const actions = {
      base_01: { dur: 6, f: (t) => P({ hz: Math.sin(t * 1.2) * 0.03, cx: breath(t), nz: Math.sin(t * 1.2 + 1) * 0.08, laz: 0.18, raz: -0.18, lex: -0.2, rex: -0.2 }) },
      base_09: { dur: 4.2, f: (t) => P({ hz: 0.05, nz: -0.12, ny: 0.1, raz: -2.6 + Math.sin(t * 9) * 0.25, rex: -0.3, ray: 0.3, laz: 0.2, lex: -0.4, cx: breath(t) }) },
      // The four hero idle motions keep the arms down like the original idle and vary only the body and head — and run long like the original VRMA idle motions (around 12 seconds)
      idle_01: { dur: 12, f: (t) => P({ hz: Math.sin(t * 0.9) * 0.035, cx: breath(t), laz: 0.2, raz: -0.2, lex: -0.35, rex: -0.35, lax: -0.12, rax: -0.12, nz: Math.sin(t * 0.9) * 0.09 }) },
      idle_02: { dur: 12, f: (t) => P({ hz: 0.04, sz: -0.02, cx: breath(t), laz: 0.24, raz: -0.16, lex: -0.25, rex: -0.4, nz: 0.1 + Math.sin(t * 1.1) * 0.04, ny: 0.08, ltz: 0.04, rkx: 0.15 }) },
      idle_03: { dur: 11, f: (t) => P({ hy: Math.abs(Math.sin(t * 1.6)) * 0.01, cx: breath(t), laz: 0.18 + Math.sin(t * 1.6) * 0.03, raz: -0.18 - Math.sin(t * 1.6) * 0.03, lex: -0.2, rex: -0.2, nz: Math.sin(t * 1.6) * 0.05 }) },
      idle_04: { dur: 12, f: (t) => P({ hz: Math.sin(t * 0.7) * 0.04, cx: breath(t), laz: 0.16, raz: -0.22, lex: -0.3, rex: -0.45, rax: -0.15, nz: -0.1, nx: 0.06 }) },
      idle_05: { dur: 7, f: (t) => P({ cx: breath(t), lax: -0.9, rax: -0.9, laz: 0.55 + Math.sin(t * 1.3) * 0.06, raz: -0.55 - Math.sin(t * 1.3) * 0.06, lex: -0.5, rex: -0.5, nz: Math.sin(t * 1.3) * 0.08 }) },
      active_01: { dur: 6, f: (t) => P({ lax: -1.0, lex: -0.9, lay: 0.4, laz: 0.2, rax: -1.15 + Math.sin(t * 6) * 0.06, rex: -1.1 + Math.cos(t * 6) * 0.1, ray: -0.3, nx: 0.2, nz: 0.08 }) },
      active_02: { dur: 5, f: (t) => P({ hy: Math.abs(Math.sin(t * 4)) * 0.02, rax: -0.7, rex: -2.0, ray: -0.4, raz: -0.25, laz: 1.0 + Math.sin(t * 2) * 0.2, lex: -0.2, nx: -0.15, nz: Math.sin(t * 2) * 0.1 }) },
      active_03: { dur: 5, f: (t) => P({ hy: Math.abs(Math.sin(t * 4)) * 0.04, hz: Math.sin(t * 4) * 0.06, laz: 2.4 + Math.sin(t * 4) * 0.3, raz: -2.4 + Math.sin(t * 4) * 0.3, lex: -0.3, rex: -0.3, ltz: 0.1, rtz: -0.1, lkx: 0.25 + Math.sin(t * 4) * 0.15, rkx: 0.25 - Math.sin(t * 4) * 0.15 }) },
      active_04: { dur: 5, f: (t) => P({ lax: -0.8, rax: -0.8, lex: -1.0 + Math.sin(t * 14) * 0.08, rex: -1.0 + Math.cos(t * 14) * 0.08, laz: 0.3, raz: -0.3, lay: 0.4, ray: -0.4, nx: 0.25 }) },
      active_05: { dur: 5, f: (t) => P({ nx: Math.abs(Math.sin(t * 4)) * 0.15, lax: -0.6, lex: -1.2, laz: 0.3, rax: -0.6 + Math.sin(t * 4) * 0.15, rex: -1.1, raz: -0.3, hy: Math.abs(Math.sin(t * 4)) * 0.01 }) },
      active_06: { dur: 6, f: (t) => P({ hry: Math.sin(t * 1.2) * 0.4, laz: 1.3, raz: -1.3, lex: -0.15, rex: -0.15, nz: Math.sin(t * 1.2) * 0.1 }) },
      active_07: { dur: 6, f: (t) => P({ rax: -1.4, rex: -2.3, ray: -0.6, lax: -0.6, lex: -1.5, lay: 0.6, nz: 0.18 + Math.sin(t) * 0.04, nx: 0.08, hz: -0.04 }) },
      active_08: { dur: 4.4, f: (t) => P({ hy: Math.max(0, Math.sin(t * 5)) * 0.06, laz: 2.5, raz: -2.5, lex: -0.4, rex: -0.4, lax: -0.2, rax: -0.2, lkx: Math.max(0, Math.sin(t * 5)) * 0.5, rkx: Math.max(0, Math.sin(t * 5)) * 0.5, nx: -0.1 }) },
    };
    const names = Object.keys(actions);
    let cur = { name: opts.start || "base_01", t0: 0 }, prev = null, fadeT0 = -10, clock = 0, timer = actions[cur.name].dur - 1;

    const apply = (p, k) => {
      const set = (o, x, y, z) => { o.rotation.x = lerp(o.rotation.x, x, k); o.rotation.y = lerp(o.rotation.y, y, k); o.rotation.z = lerp(o.rotation.z, z, k); };
      hips.position.y = lerp(hips.position.y, 0.86 + p.hy, k);
      set(hips, 0, p.hry, p.hz);
      set(spine, p.sx, 0, p.sz);
      set(chest, p.cx, 0, p.cz);
      set(head, p.nx, p.ny, p.nz);
      set(L.shoulder, p.lax, p.lay, p.laz);
      set(L.elbow, p.lex, 0, 0);
      set(R.shoulder, p.rax, p.ray, p.raz);
      set(R.elbow, p.rex, 0, 0);
      set(LL.thigh, -p.lkx * 0.5 + p.ltx, 0, p.ltz);
      set(LL.knee, p.lkx, 0, 0);
      set(RL.thigh, -p.rkx * 0.5 + p.rtx, 0, p.rtz);
      set(RL.knee, p.rkx, 0, 0);
    };

    return {
      root, joints: J, names,
      get current() { return cur.name; },
      // Original: replaying the same action as the current one is taken as the paired (back) action with a 1s crossfade — we blend the before and after poses
      play(name) {
        if (!actions[name]) return;
        prev = { name: cur.name, t0: cur.t0, freeze: clock };
        cur = { name, t0: clock };
        fadeT0 = clock;
        timer = actions[name].dur - 1;
      },
      // The original picks the next action (action length − 1 second) later — it receives the picker
      update(dt, pick) {
        clock += dt;
        timer -= dt;
        if (timer <= 0 && pick) this.play(pick());
        const a = actions[cur.name].f(clock - cur.t0);
        const w = Math.min(1, (clock - fadeT0) / 1);
        if (prev && w < 1) {
          const b = actions[prev.name].f(clock - prev.t0);
          const k = ease.inOut(w);
          const mix = {};
          for (const key in a) mix[key] = lerp(b[key], a[key], k);
          apply(mix, 1);
        } else {
          prev = null;
          apply(a, 1);
        }
      },
    };
  }

  // Decorative shapes: triangular pyramid (three cone faces), cube, twisted tube
  function makeOrnament(type, pal) {
    let geo;
    if (type === "cone") geo = new T.ConeGeometry(0.11, 0.2, 3);
    else if (type === "box") geo = new T.BoxGeometry(0.13, 0.13, 0.13);
    else {
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40;
        pts.push(new T.Vector3(Math.sin(u * Math.PI * 3) * 0.08, (u - 0.5) * 0.34, Math.cos(u * Math.PI * 3) * 0.08 * 0.6));
      }
      geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 80, 0.022, 12, false);
    }
    const mat = new T.MeshMatcapMaterial({ matcap: matcap(pal, type === "box" ? "purple" : "sky", type === "box" ? "sky" : "accent"), transparent: true });
    const mesh = new T.Mesh(geo, mat);
    const group = new T.Group();
    group.add(mesh);
    return { group, mesh, mat };
  }

  // Sparkle star grain (4 points) — for sprites
  function kiraTexture(pal) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = `#${pal.surface.getHexString(T.SRGBColorSpace)}`;
    g.beginPath();
    g.moveTo(64, 0); g.quadraticCurveTo(70, 58, 128, 64); g.quadraticCurveTo(70, 70, 64, 128); g.quadraticCurveTo(58, 70, 0, 64); g.quadraticCurveTo(58, 58, 64, 0);
    g.fill();
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }

  // Hand-held prop illustration (original: two prop photos a and b per action) — our drawings on the same-size panel
  const ITEMS = [["book", "pencil"], ["mic", "note"], ["star", "shoe"], ["pad", "game"], ["disc", "phone"], ["cube", "brush"], ["chart", "bulb"], ["camera", "heart"]];
  function itemTexture(kind, pal) {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 192;
    const g = c.getContext("2d");
    const hex = (k) => `#${pal[k].getHexString(T.SRGBColorSpace)}`;
    g.lineJoin = g.lineCap = "round";
    g.lineWidth = 7;
    g.strokeStyle = hex("ink");
    const shape = (fill, draw) => { g.beginPath(); draw(); g.fillStyle = hex(fill); g.fill(); g.stroke(); };
    g.translate(128, 96);
    g.rotate(-0.2);
    switch (kind) {
      case "book": shape("lemon", () => g.rect(-80, -55, 160, 110)); shape("surface", () => g.rect(-70, -45, 66, 92)); shape("surface", () => g.rect(4, -45, 66, 92)); break;
      case "pencil": shape("sky", () => g.rect(-90, -14, 140, 28)); shape("lemon", () => { g.moveTo(50, -14); g.lineTo(90, 0); g.lineTo(50, 14); g.closePath(); }); break;
      case "mic": shape("raised", () => g.arc(-20, -30, 38, 0, Math.PI * 2)); shape("purple", () => g.rect(-34, 4, 28, 80)); break;
      case "note": shape("accent", () => { g.ellipse(-30, 40, 28, 20, -0.4, 0, Math.PI * 2); }); g.beginPath(); g.moveTo(-6, 36); g.lineTo(-6, -60); g.lineTo(50, -40); g.stroke(); break;
      case "star": shape("lemon", () => { for (let i = 0; i < 10; i++) { const r = i % 2 ? 30 : 70, a = (i / 10) * Math.PI * 2 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }); break;
      case "shoe": shape("accent", () => { g.moveTo(-80, 30); g.lineTo(-70, -30); g.lineTo(-10, -20); g.lineTo(70, 10); g.lineTo(80, 40); g.closePath(); }); break;
      case "pad": shape("purple", () => g.roundRect(-85, -55, 170, 110, 14)); shape("sky", () => g.rect(-70, -42, 140, 84)); break;
      case "game": shape("sky", () => g.roundRect(-90, -40, 180, 80, 40)); shape("surface", () => g.arc(-45, 0, 16, 0, Math.PI * 2)); shape("accent", () => g.arc(45, 0, 12, 0, Math.PI * 2)); break;
      case "disc": shape("raised", () => g.arc(0, 0, 80, 0, Math.PI * 2)); shape("accent", () => g.arc(0, 0, 22, 0, Math.PI * 2)); break;
      case "phone": shape("ink", () => g.roundRect(-40, -80, 80, 160, 14)); shape("sky", () => g.rect(-30, -64, 60, 120)); break;
      case "cube": shape("purple", () => { g.moveTo(0, -70); g.lineTo(70, -35); g.lineTo(70, 40); g.lineTo(0, 75); g.lineTo(-70, 40); g.lineTo(-70, -35); g.closePath(); }); g.beginPath(); g.moveTo(-70, -35); g.lineTo(0, 0); g.lineTo(70, -35); g.moveTo(0, 0); g.lineTo(0, 75); g.stroke(); break;
      case "brush": shape("lemon", () => g.rect(-90, -10, 120, 20)); shape("accent", () => g.ellipse(55, 0, 40, 18, 0, 0, Math.PI * 2)); break;
      case "chart": shape("surface", () => g.rect(-85, -60, 170, 120)); shape("accent", () => g.rect(-60, 0, 30, 45)); shape("sky", () => g.rect(-15, -25, 30, 70)); shape("lemon", () => g.rect(30, -45, 30, 90)); break;
      case "bulb": shape("lemon", () => g.arc(0, -15, 55, 0, Math.PI * 2)); shape("raised", () => g.rect(-25, 40, 50, 30)); break;
      case "camera": shape("ink", () => g.roundRect(-85, -50, 170, 105, 16)); shape("sky", () => g.arc(0, 2, 34, 0, Math.PI * 2)); break;
      default: shape("accent", () => { g.moveTo(0, 60); g.bezierCurveTo(-100, -10, -50, -80, 0, -30); g.bezierCurveTo(50, -80, 100, -10, 0, 60); });
    }
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }

  window.tsmAvatar = { T, cssColor, cssString, palette, makeAvatar, makeOrnament, kiraTexture, itemTexture, ITEMS, ease, lerp, damp, matcap, gradient };
})();
