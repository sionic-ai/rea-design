// White miniature industry map — our shapes placed on the same floor coordinates and same camera formula as the original (the original is three r182 WebGPU + GLB models).
// Values read and measured from the original:
//   Camera progress follows the scroll value with smooth damping (smoothDamp 0.15s, 0.1s on phones). It goes past 1, up to 1.25.
//   red line 0~.17 · one blue line .17~.74 · two blue lines .74~.9 · tile .72~.75 · oblique→top-down .72~.85 · pull back .9~1.25(45)
//   Camera = Looking at the point 66 above the point on the path, offset by (−30, 0, +50) · field of view 14.43° (if narrower than aspect 1.5, widened up to 1.6x)
//   On entry it descends from 80 above over 1.4s (cubic out) · mouse parallax .6 (follows with 1−e^(−1.5dt)) · wind turbine blades 2.5 rad/s
//   Mouse trail = Floor board 256 cells · following dot .15 per frame · radius (board ratio) .002 + frame movement × .0025, max .033 · × .947 per frame ·
//     motion level rises at .05 / falls at .0108 · dot size gate 0~.09 · reveal 0~.31
//   The symbol gathers in .5s once the two blue lines end · on the initial screen (progress 0) four red lines are drawn over 1s and erased over .8s, then repeat every 1.4~3s
window.VMap = (canvas, { reduced = false } = {}) => {
  const T = THREE;
  const mobile = matchMedia("(pointer: coarse)").matches;
  const css = (name) => {
    const { r, g, b } = window.V.color(name);
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };
  const mixc = (a, b, t) => a.clone().lerp(b, t);
  const BG = css("--kf-bg"), INK = css("--kf-ink"), SOFT = css("--kf-accent-soft"), ACC = css("--kf-accent");
  const STAGE = css("--site-stage"), BEAM = css("--site-beam"), RED = css("--kf-danger");
  const PAPER = mixc(BG, SOFT, 0.28);
  const rgb = (c, a = 1) => {
    const h = c.getHex(T.SRGBColorSpace);
    return `rgba(${h >> 16}, ${(h >> 8) & 255}, ${h & 255}, ${a})`;
  };

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(STAGE);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const scene = new T.Scene();
  scene.fog = new T.Fog(STAGE, 110, 260);
  const camera = new T.PerspectiveCamera(14.426, 1, 0.5, 400);

  scene.add(new T.HemisphereLight(BG, mixc(STAGE, INK, 0.2), 2.3));
  const sun = new T.DirectionalLight(BG, 1.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 });
  sun.shadow.bias = -0.0006;
  scene.add(sun, sun.target);

  const ground = new T.Mesh(new T.PlaneGeometry(600, 600), new T.ShadowMaterial({ color: mixc(STAGE, INK, 0.5), opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Texture: bake window strips·floor bleed·symbols onto a canvas ──
  const canvasTex = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };
  const winTex = canvasTex(128, 128, (g) => {
    g.fillStyle = rgb(BG);
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = rgb(mixc(STAGE, INK, 0.08));
    g.fillRect(18, 40, 92, 46);
    g.fillStyle = rgb(mixc(BG, SOFT, 0.58));
    for (let x = 40; x < 110; x += 24) g.fillRect(x, 40, 3, 46);
  });
  winTex.wrapS = winTex.wrapT = T.RepeatWrapping;
  winTex.anisotropy = 4;
  const blobTex = canvasTex(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    r.addColorStop(0, rgb(BG, 1));
    r.addColorStop(1, rgb(BG, 0));
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  });
  const markTex = canvasTex(256, 256, (g) => {
    g.fillStyle = g.strokeStyle = rgb(ACC);
    g.translate(128, 128);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      g.save();
      g.translate(Math.cos(a) * 96, Math.sin(a) * 96);
      g.rotate(((i * 45) % 90) * (Math.PI / 180));
      g.fillRect(-15, -15, 30, 30);
      g.restore();
    }
    g.lineWidth = 30;
    g.lineJoin = "miter";
    g.beginPath();
    g.moveTo(-26, -52);
    g.lineTo(26, 0);
    g.lineTo(-26, 52);
    g.stroke();
  });

  const matWhite = new T.MeshLambertMaterial({ color: PAPER });
  const matWin = new T.MeshLambertMaterial({ color: PAPER, map: winTex });
  const matBlob = new T.MeshBasicMaterial({ map: blobTex, color: mixc(STAGE, INK, 0.3), transparent: true, opacity: 0.55, depthWrite: false });
  const blobGeo = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

  // The model is built at 3x the original coordinates and scaled down by .33 as a whole — fits an original building height of about 5 (positions use o() with the original coordinates as-is)
  const S = 0.33, o = (v) => v / S;
  const world = new T.Group();
  world.scale.setScalar(S);
  scene.add(world);
  const loops = [];

  const add = (mesh, x, y, z, shadow = true) => {
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    world.add(mesh);
    return mesh;
  };
  // A faint blur wherever it touches the floor, like the soft contact shadow of the original
  const blob = (x, z, sx, sz = sx) => {
    const m = new T.Mesh(blobGeo, matBlob);
    m.position.set(x, 0.03, z);
    m.scale.set(sx, 1, sz);
    m.renderOrder = -1;
    world.add(m);
  };
  // The sides stretch UVs by size so the window band repeats per floor, and the top samples a spot with no pattern.
  const winBox = (w, h, d) => {
    const g = new T.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    for (let f = 0; f < 6; f++)
      for (let i = 0; i < 4; i++) {
        const k = f * 4 + i;
        if (f === 2 || f === 3) uv.setXY(k, 0.02, 0.02);
        else uv.setXY(k, uv.getX(k) * Math.max(1, Math.round((f < 2 ? d : w) / 3)), uv.getY(k) * Math.max(1, Math.round(h / 2.6)));
      }
    return g;
  };
  const box = (w, h, d) => new T.BoxGeometry(w, h, d);

  // ── Model ──
  const office = (x, z, w, d, h, { tiers = 1, win = true, rotY = 0 } = {}) => {
    const g = new T.Group();
    let cw = w, cd = d, y = 0;
    for (let t = 0; t < tiers; t++) {
      const th = h / tiers;
      const m = new T.Mesh(win ? winBox(cw, th, cd) : box(cw, th, cd), win ? matWin : matWhite);
      m.position.set(t * 0.4, y + th / 2, -t * 0.4);
      m.castShadow = m.receiveShadow = true;
      g.add(m);
      y += th;
      if (t < tiers - 1) { cw *= 0.78; cd *= 0.78; }
    }
    // Four rooftop railing sides plus a machine-room box
    const p = 0.35;
    [[cw, p, p, 0, -cd / 2 + p / 2], [cw, p, p, 0, cd / 2 - p / 2], [p, p, cd, -cw / 2 + p / 2, 0], [p, p, cd, cw / 2 - p / 2, 0]].forEach(([a, b, c, px, pz]) => {
      const m = new T.Mesh(box(a, 0.5, c), matWhite);
      m.position.set(px + (tiers - 1) * 0.4, y + 0.25, pz - (tiers - 1) * 0.4);
      m.castShadow = true;
      g.add(m);
    });
    const hut = new T.Mesh(box(cw * 0.35, 0.9, cd * 0.3), matWhite);
    hut.position.set(cw * 0.12, y + 0.45, -cd * 0.15);
    hut.castShadow = true;
    g.add(hut);
    g.rotation.y = rotY;
    add(g, x, 0, z);
    blob(x, z, w * 2.1, d * 2.1);
    return g;
  };
  const prism = (w, rh, d) => {
    const s = new T.Shape([new T.Vector2(-w / 2, 0), new T.Vector2(w / 2, 0), new T.Vector2(0, rh)]);
    return new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2);
  };
  const warehouse = (x, z, w, d, h, { bays = 1, rotY = 0 } = {}) => {
    const g = new T.Group();
    const body = new T.Mesh(box(w, h, d), matWhite);
    body.position.y = h / 2;
    g.add(body);
    for (let b = 0; b < bays; b++) {
      const r = new T.Mesh(prism(w / bays, (w / bays) * 0.32, d + 0.4), matWhite);
      r.position.set(-w / 2 + (w / bays) * (b + 0.5), h, 0);
      g.add(r);
    }
    g.children.forEach((m) => (m.castShadow = m.receiveShadow = true));
    g.rotation.y = rotY;
    add(g, x, 0, z);
    blob(x, z, w * 2, d * 2);
  };
  const steamGeo = new T.PlaneGeometry(1, 1);
  const towerGeo = (r, h) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const k = t < 0.7 ? 0.62 + 0.38 * ((0.7 - t) / 0.7) ** 2 : 0.62 + 0.14 * ((t - 0.7) / 0.3) ** 2;
      pts.push(new T.Vector2(r * k, t * h));
    }
    return new T.LatheGeometry(pts, 48);
  };
  const tower = (x, z, r, h) => {
    const m = new T.Mesh(towerGeo(r, h), new T.MeshLambertMaterial({ color: PAPER, side: T.DoubleSide }));
    add(m, x, 0, z);
    const base = new T.Mesh(new T.CylinderGeometry(r * 1.12, r * 1.16, 0.5, 48), matWhite);
    add(base, x, 0.25, z);
    blob(x, z, r * 4.2);
    // Steam: four soft white panels rise, growing larger and fading
    for (let i = 0; i < 4; i++) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: blobTex, color: BG, transparent: true, opacity: 0, depthWrite: false }));
      s.position.set(x, h, z);
      world.add(s);
      loops.push((t) => {
        const k = (t * 0.12 + i / 4) % 1;
        s.position.set(x - k * 3, h + 1 + k * 9, z - k * 2);
        s.scale.setScalar(r * (1.2 + k * 2.4));
        s.material.opacity = Math.sin(k * Math.PI) * 0.55;
      });
    }
  };
  const turbine = (x, z, h = 6.25) => {
    const g = new T.Group();
    const mast = new T.Mesh(new T.CylinderGeometry(0.12, 0.26, h, 10), matWhite);
    mast.position.y = h / 2;
    const nac = new T.Mesh(box(0.5, 0.45, 1.1), matWhite);
    nac.position.y = h;
    const rotor = new T.Group();
    rotor.position.set(0, h, 0.6);
    for (let b = 0; b < 3; b++) {
      const bl = new T.Mesh(box(0.2, 2.6, 0.06).translate(0, 1.3, 0), matWhite);
      bl.rotation.z = (b / 3) * Math.PI * 2;
      bl.castShadow = true;
      rotor.add(bl);
    }
    g.add(mast, nac, rotor);
    mast.castShadow = nac.castShadow = true;
    g.rotation.y = Math.PI * 0.75;
    add(g, x, 0, z);
    blob(x, z, 2.4);
    rotor.rotation.z = Math.random() * 6;
    loops.push((t, dt) => (rotor.rotation.z -= dt * 2.5));
  };
  const waterTower = (x, z) => {
    const g = new T.Group();
    const tank = new T.Mesh(new T.CylinderGeometry(2, 2, 2.6, 28), matWhite);
    tank.position.y = 8;
    const cap = new T.Mesh(new T.ConeGeometry(2.1, 0.9, 28), matWhite);
    cap.position.y = 9.75;
    g.add(tank, cap);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new T.Mesh(box(0.22, 7, 0.22), matWhite);
      leg.position.set(Math.cos(a) * 1.5, 3.5, Math.sin(a) * 1.5);
      g.add(leg);
    }
    g.children.forEach((m) => (m.castShadow = true));
    add(g, x, 0, z);
    blob(x, z, 5);
  };
  const tank = (x, z, rotY = 0) => {
    const g = new T.Group();
    const body = new T.Mesh(new T.CylinderGeometry(1.4, 1.4, 6, 24).rotateZ(Math.PI / 2), matWhite);
    body.position.y = 1.8;
    const pipe = new T.Mesh(new T.TorusGeometry(1.2, 0.22, 10, 20, Math.PI), matWhite);
    pipe.position.set(3.4, 1.8, 0);
    pipe.rotation.y = Math.PI / 2;
    const cab = new T.Mesh(box(1.8, 2.4, 2.4), matWhite);
    cab.position.set(-3.6, 1.2, 0);
    g.add(body, pipe, cab);
    g.children.forEach((m) => (m.castShadow = m.receiveShadow = true));
    g.rotation.y = rotY;
    add(g, x, 0, z);
    blob(x, z, 9, 5);
  };

  // Repeated props use InstancedMesh — people, boxes, server racks, trees
  const instanced = (geo, mat, list, place) => {
    const m = new T.InstancedMesh(geo, mat, list.length);
    const o = new T.Object3D();
    list.forEach((it, i) => {
      place(o, it, i);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.castShadow = m.receiveShadow = true;
    world.add(m);
    return m;
  };
  const people = [];
  const crowd = (cx, cz, n, spread) => {
    for (let i = 0; i < n; i++) people.push([cx + (Math.random() - 0.5) * spread, cz + (Math.random() - 0.5) * spread]);
  };
  const crates = [];
  const pallet = (cx, cz, nx = 3, nz = 3, layers = 2) => {
    for (let l = 0; l < layers; l++) for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) if (l === 0 || Math.random() > 0.3) crates.push([cx + i * 1.05, l, cz + j * 1.05]);
    blob(cx + nx * 0.5, cz + nz * 0.5, nx * 2.2, nz * 2.2);
  };
  const racks = [];
  const rackRows = (cx, cz, rows, cols) => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) racks.push([cx + c * 1.25, cz + r * 2.2]);
    blob(cx + cols * 0.6, cz + rows * 1.1, cols * 2.6, rows * 3.4);
  };
  const trees = [];

  // ── Layout: original bottom coordinates (values inside o()). The band the road passes through is left empty ──
  // Four red lines: x −59~−53 · z −27.5 gather onto the x −56 line up to z 3 (HQ) · one blue line: HQ → (−50, 20) → along z 25 to x 24 (tile)
  //   Two blue lines: follow z 25 as x goes 24 → 55.5 (symbol) · two wind turbine groups (original blade positions as-is)
  // The city around the Hero (look-at point −50, −35)
  office(o(-51), o(-31.5), 6, 6, 16, { tiers: 3 });
  office(o(-58.5), o(-37), 7, 7, 12);
  office(o(-44), o(-29), 9, 9, 10);
  office(o(-49), o(-41.5), 6, 6, 7);
  office(o(-40), o(-38), 8, 6, 6, { win: false });
  warehouse(o(-37.5), o(-29.5), 9, 7, 3.4, { bays: 2 });
  pallet(o(-63), o(-43), 3, 3, 3);
  crowd(o(-50), o(-35), 10, 30);
  // Four small houses with red lines coming out
  [[-51.4, -21], [-51.4, -28.5], [-60.6, -28.5], [-60.6, -21.2]].forEach(([x, z]) => office(o(x), o(z), 5, 5, 4, { win: false }));
  for (const x of [-41.5, -44.5]) for (const z of [-15.85, -18.85, -21.85]) turbine(o(x), o(z));
  for (const x of [-61.5, -64.5]) for (const z of [12.15, 15.15, 18.15]) turbine(o(x), o(z));
  // Stage 1: headquarters (symbol on the side of the center building, two wings) + trees + people
  const HQ = new T.Vector3(o(-56), 0, o(3));
  office(HQ.x, HQ.z, 8, 8, 11, { tiers: 2 });
  office(o(-59.4), o(1), 6, 7, 7);
  office(o(-52.6), o(5), 6, 7, 7);
  const decal = new T.Mesh(new T.PlaneGeometry(3.4, 3.4), new T.MeshBasicMaterial({ map: markTex, transparent: true }));
  decal.position.set(HQ.x, 4.6, HQ.z + 4.02);
  world.add(decal);
  for (let i = 0; i < 6; i++) trees.push([o(-53.5 + (i % 3) * 1.3), o(8.5 + Math.floor(i / 3) * 1.4)]);
  crowd(o(-51), o(9), 8, 14);
  crowd(o(-60), o(-6), 6, 12);
  office(o(-63), o(-8), 7, 7, 8);
  office(o(-49), o(-8), 8, 8, 9, { tiers: 2 });
  office(o(-44), o(0), 7, 7, 6, { win: false });
  // Stage 2: cooling tower, box stacks, server racks, tanks, plus warehouses and small houses on both sides of the z 25 road
  tower(o(-47.5), o(12), 5, 11);
  tower(o(-44), o(8.4), 4.4, 9.5);
  pallet(o(-39), o(13.5), 4, 3, 2);
  rackRows(o(-43.5), o(17.6), 2, 6);
  tank(o(-37), o(31), 0.4);
  waterTower(o(-31), o(17.5));
  warehouse(o(-24), o(18), 12, 7, 3.6);
  warehouse(o(-12), o(17), 16, 12, 5, { bays: 3 });
  warehouse(o(-26), o(33), 9, 6, 3.2);
  warehouse(o(-8), o(33), 10, 6, 3.2);
  [-33, -30, -19, -16].forEach((x, i) => office(o(x), o(30 + (i % 2) * 1.5), 5, 6, 4, { win: false }));
  pallet(o(-4), o(19), 2, 2, 2);
  crowd(o(-28), o(23), 12, 34);
  crowd(o(-6), o(27), 6, 20);
  for (let i = 0; i < 6; i++) trees.push([o(-46 + i * 1.1), o(29 + (i % 2))]);
  // Leave steps 3·4 (tiles·symbols) empty — people only at the edges

  const personBody = new T.CapsuleGeometry(0.22, 0.6, 4, 8).translate(0, 0.52, 0);
  const personHead = new T.SphereGeometry(0.2, 10, 8).translate(0, 1.2, 0);
  instanced(personBody, matWhite, people, (o, [x, z]) => o.position.set(x, 0, z));
  instanced(personHead, matWhite, people, (o, [x, z]) => o.position.set(x, 0, z));
  instanced(box(0.95, 0.95, 0.95).translate(0, 0.48, 0), matWin, crates, (o, [x, l, z]) => o.position.set(x, l * 0.97, z));
  instanced(box(0.95, 2.4, 1.6).translate(0, 1.2, 0), matWin, racks, (o, [x, z]) => o.position.set(x, 0, z));
  instanced(new T.CylinderGeometry(0.08, 0.1, 1.2, 6).translate(0, 0.6, 0), matWhite, trees, (o, [x, z]) => o.position.set(x, 0, z));
  instanced(new T.SphereGeometry(0.75, 12, 10).scale(1, 1.45, 1).translate(0, 2, 0), matWhite, trees, (o, [x, z]) => o.position.set(x, 0, z));

  // ── Road: same floor coordinates as the original (height .15). One blue line is a Catmull-Rom (tension .5) sampled at 30 points and re-picked as 40 evenly spaced points ──
  const Y = 0.15;
  const v3 = ([x, z]) => new T.Vector3(x, Y, z);
  const redPaths = [
    [[-53, -21], [-53, -20.3], [-53.09, -20.09], [-53.3, -20], [-55.45, -20], [-55.57, -19.98], [-55.66, -19.91], [-55.73, -19.81], [-55.75, -19.7], [-55.75, 3]],
    [[-53, -27.5], [-53, -26.3], [-53.09, -26.09], [-53.3, -26], [-55.7, -26], [-55.91, -25.91], [-56, -25.7], [-56, 3]],
    [[-59, -27.5], [-59, -26.3], [-58.91, -26.09], [-58.7, -26], [-56.55, -26], [-56.34, -25.91], [-56.25, -25.7], [-56.25, 3]],
    [[-59, -21.2], [-59, -19.3], [-58.91, -19.09], [-58.7, -19], [-56.8, -19], [-56.59, -18.91], [-56.5, -18.7], [-56.5, 3]],
  ].map((p) => {
    const c = new T.CurvePath();
    for (let i = 1; i < p.length; i++) c.add(new T.LineCurve3(v3(p[i - 1]), v3(p[i])));
    return c;
  });
  const evenly = (curve, count) => {
    const pts = curve.getPoints(30);
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = acc[acc.length - 1], out = [pts[0].clone()];
    let j = 1;
    for (let i = 1; i < count - 1; i++) {
      const at = (i / (count - 1)) * total;
      while (j < acc.length - 1 && acc[j] < at) j++;
      const span = acc[j] - acc[j - 1];
      out.push(pts[j - 1].clone().lerp(pts[j], span > 0 ? (at - acc[j - 1]) / span : 0));
    }
    out.push(pts[pts.length - 1].clone());
    return out;
  };
  const pathA = new T.CatmullRomCurve3(evenly(new T.CatmullRomCurve3([[-56.1, 3], [-55.5, 11], [-50, 20], [-40, 25], [-20, 25], [0, 25], [24, 25]].map(v3), false, "catmullrom", 0.5), 40));
  const pathB = new T.LineCurve3(v3([24, 25]), v3([55.5, 25]));
  // The point the camera looks at in the first segment: a cubic curve joining (−50, −35) → (−56.1, 3). The end handle follows the direction a blue line departs
  const L0 = v3([-50, -35]), L1 = v3([-56.1, 3]);
  const span = L1.clone().sub(L0);
  const lookPath = new T.CubicBezierCurve3(L0, L0.clone().addScaledVector(span, 1 / 3), L1.clone().addScaledVector(pathA.getTangent(0), -span.length() / 3), L1);

  // ── Line: draw the tube only up to the progress value and heat the head end white (erase up to the trailing tail uTail) ──
  const tint = "\n#include <colorspace_fragment>\n";
  const lineMat = (color, hot, alpha, additive) =>
    new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: additive ? T.AdditiveBlending : T.NormalBlending,
      uniforms: { uHead: { value: 0 }, uTail: { value: 0 }, uColor: { value: color }, uHot: { value: hot }, uAlpha: { value: alpha } },
      vertexShader: "varying float vT; varying vec3 vN; varying vec3 vV; void main(){ vT=uv.x; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }",
      fragmentShader:
        "uniform float uHead; uniform float uTail; uniform vec3 uColor; uniform vec3 uHot; uniform float uAlpha; varying float vT; varying vec3 vN; varying vec3 vV;" +
        "void main(){ if(vT>uHead||vT<uTail) discard; float k=smoothstep(uHead-0.18,uHead,vT); float rim=pow(abs(dot(vN,vV)),1.5);" +
        "gl_FragColor=vec4(mix(uColor,uHot,k*0.85),uAlpha*rim*(0.55+0.45*k)); " + tint + " }",
    });
  const HOT = mixc(BEAM, BG, 0.85), CORE = mixc(BEAM, ACC, 0.35);
  const line = (curve, r, color, hot, segs = 240) => {
    const core = new T.Mesh(new T.TubeGeometry(curve, segs, r, 10), lineMat(color, hot, 1, false));
    const glow = new T.Mesh(new T.TubeGeometry(curve, segs, r * 3.2, 10), lineMat(color, hot, 0.35, true));
    scene.add(core, glow);
    const mats = [core.material, glow.material];
    return {
      set(head, tail = 0) {
        mats.forEach((m) => ((m.uniforms.uHead.value = head), (m.uniforms.uTail.value = tail)));
        core.visible = glow.visible = head > 0.001 && tail < head;
      },
    };
  };
  const redHot = mixc(RED, BG, 0.4);
  const redLines = redPaths.map((c) => line(c, 0.06, RED, redHot, 200));
  const redIdle = redPaths.map((c) => line(c, 0.06, RED, redHot, 200));
  const blueA = line(pathA, 0.16, CORE, HOT);
  const blueB = line(pathB, 0.16, CORE, HOT, 80);
  const head = new T.Sprite(new T.SpriteMaterial({ map: blobTex, color: HOT, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
  head.scale.setScalar(2.4);
  scene.add(head);

  // ── Mouse trail panel: like the original, the whole floor panel (968.79 × 894.28, margin 3 around) is covered with 256 cells — one cell is 3.8 units so
  //    spreads by linear interpolation and remains as a wide band swept across (about 200px high on a 1440 screen). Finer cells make a thinner line than the original ──
  const TRAIL_MIN = new T.Vector2(-517.8, -509.38), TRAIL_SIZE = new T.Vector2(974.79, 900.28);
  // On an 8-bit buffer, small values don’t shrink from rounding even when multiplied by .947, leaving traces — so use a half-precision float buffer
  const trailRT = () => new T.WebGLRenderTarget(256, 256, { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
  let trailRead = trailRT(), trailWrite = trailRT();
  const trailMat = new T.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: { uPrev: { value: null }, uA: { value: new T.Vector2(-1, -1) }, uB: { value: new T.Vector2(-1, -1) }, uR: { value: 0 }, uFade: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }",
    fragmentShader:
      "uniform sampler2D uPrev; uniform vec2 uA; uniform vec2 uB; uniform float uR; uniform float uFade; varying vec2 vUv;" +
      "void main(){ vec2 ab=uB-uA; float t=clamp(dot(vUv-uA,ab)/max(dot(ab,ab),1e-6),0.,1.); float d=length(vUv-uA-ab*t);" +
      " float s=(uR>1e-5&&min(uB.x,uB.y)>-.5)?1.-smoothstep(0.,uR,d):0.;" +
      " gl_FragColor=vec4(max(texture2D(uPrev,vUv).r*uFade,s),0.,0.,1.); }",
  });
  const trailScene = new T.Scene(), trailCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  trailScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), trailMat));

  // ── Floor dot pattern: between the light-beam head and tail, dots around the mouse trail reveal from background color to sky blue and grow ──
  //    Trace dots as in the original — size = Cell × .3 × (1 + .2·sin 3t) × (.1 + .9 × mark 0~.09 gate), reveal = Trace × motion amount 0~.31.
  //    The original dots add a sky tint to the background, so G·B are about +15 brighter than the background (recorded background 185,214,230 → dot 193,232,245) — painting with a strong light-beam color would
  //    The band stands out far more than the original. The original plus .8 is a value squashed by tone mapping, so to match the recording, use stage color + light beam × .2 in linear space
  const GLOW = STAGE.clone().add(BEAM.clone().multiplyScalar(0.2));
  const dots = new T.Mesh(
    new T.PlaneGeometry(160, 110).rotateX(-Math.PI / 2).translate(0, 0.03, 0),
    new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uHead: { value: new T.Vector2() }, uTail: { value: new T.Vector2() }, uAmt: { value: 0 }, uPitch: { value: 0.62 }, uTime: { value: 0 },
        uColor: { value: BEAM }, uGlow: { value: GLOW }, uTrailTex: { value: trailRead.texture }, uTrailMin: { value: TRAIL_MIN }, uTrailSize: { value: TRAIL_SIZE }, uMove: { value: 0 },
      },
      vertexShader: "varying vec2 vP; void main(){ vec4 w=modelMatrix*vec4(position,1.); vP=w.xz; gl_Position=projectionMatrix*viewMatrix*w; }",
      fragmentShader:
        "uniform vec2 uHead; uniform vec2 uTail; uniform float uAmt; uniform float uPitch; uniform float uTime; uniform vec3 uColor; uniform vec3 uGlow; uniform sampler2D uTrailTex; uniform vec2 uTrailMin; uniform vec2 uTrailSize; uniform float uMove; varying vec2 vP;" +
        "float seg(vec2 p, vec2 a, vec2 b){ vec2 ab=b-a; float t=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-4),0.,1.); return length(p-a-ab*t); }" +
        "void main(){ vec2 g=vP/uPitch; float row=floor(g.y); g.x+=mod(row,2.)*.5; vec2 c=(floor(g)+.5); c.x-=mod(row,2.)*.5; c*=uPitch; float d=length(vP-c);" +
        " float kb=uAmt*(1.-smoothstep(.6,6.,seg(c,uTail,uHead)));" +
        " float rb=uPitch*.26*kb; float mb=1.-smoothstep(rb-.025,rb+.025,d); float ab=mb*kb<.01?0.:mb*(.3+.7*kb);" +
        " float tr=texture2D(uTrailTex,clamp((c-uTrailMin)/uTrailSize,0.,1.)).r;" +
        " float rt=uPitch*.3*(1.+.2*sin(uTime*3.))*(.1+.9*smoothstep(0.,.09,tr)*uMove);" +
        " float at=(1.-smoothstep(rt-.025,rt+.025,d))*smoothstep(0.,.31,tr*uMove);" +
        " if(max(ab,at)<.01) discard;" +
        " gl_FragColor=vec4(ab>=at?uColor:uGlow,max(ab,at)); " + tint + " }",
    })
  );
  dots.renderOrder = -1;
  scene.add(dots);
  const dotU = dots.material.uniforms;
  const ray = new T.Raycaster(), floor = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3(), ndc = new T.Vector2();
  const aim = new T.Vector2(), at = new T.Vector2(), atPrev = new T.Vector2();
  let move = 0, lastPx = 0, lastPy = 0, seeded = false;

  // ── Stage 3: tile grid (original slots 24, 25 · side 25) rises from the center, and the center heats up to sky blue ──
  const TILE = { x: 24, z: 25 };
  const ts = 1.9, tr = 0.3;
  const tileShape = new T.Shape();
  tileShape.moveTo(-ts / 2 + tr, -ts / 2);
  tileShape.lineTo(ts / 2 - tr, -ts / 2);
  tileShape.quadraticCurveTo(ts / 2, -ts / 2, ts / 2, -ts / 2 + tr);
  tileShape.lineTo(ts / 2, ts / 2 - tr);
  tileShape.quadraticCurveTo(ts / 2, ts / 2, ts / 2 - tr, ts / 2);
  tileShape.lineTo(-ts / 2 + tr, ts / 2);
  tileShape.quadraticCurveTo(-ts / 2, ts / 2, -ts / 2, ts / 2 - tr);
  tileShape.lineTo(-ts / 2, -ts / 2 + tr);
  tileShape.quadraticCurveTo(-ts / 2, -ts / 2, -ts / 2 + tr, -ts / 2);
  const tileGeo = new T.ExtrudeGeometry(tileShape, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }).rotateX(-Math.PI / 2);
  const N = 9, pitch = 25 / N;
  const tileList = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = (i - (N - 1) / 2) * pitch, z = (j - (N - 1) / 2) * pitch;
    tileList.push([TILE.x + x, TILE.z + z, Math.hypot(x, z) / (((N - 1) / 2) * pitch * 1.414), Math.random() * 0.15]);
  }
  const tiles = new T.InstancedMesh(tileGeo, new T.MeshLambertMaterial({ color: BG }), tileList.length);
  tiles.castShadow = tiles.receiveShadow = true;
  scene.add(tiles);
  const tileGlow = new T.Sprite(new T.SpriteMaterial({ map: blobTex, color: mixc(BEAM, BG, 0.15), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0 }));
  tileGlow.position.set(TILE.x, 1, TILE.z);
  tileGlow.scale.setScalar(18);
  scene.add(tileGlow);
  const tileCol = new T.Color(), TILE_HOT = mixc(BEAM, BG, 0.4);
  const tileObj = new T.Object3D();
  // The original starts a clock once the rise amount (.72~.75) exceeds 0 and raises tiles over that time — the rise runs to the end even if scrolling stops
  const setTiles = (ratio, time) => {
    tiles.visible = ratio > 0;
    if (!tiles.visible) return;
    tileList.forEach(([x, z, d, j], i) => {
      const k = T.MathUtils.clamp((time * 1.6 - d * 0.9 - j) / 0.5, 0, 1);
      const e = 1 - (1 - k) ** 3;
      tileObj.position.set(x, -0.8 + e * 0.8, z);
      tileObj.updateMatrix();
      tiles.setMatrixAt(i, tileObj.matrix);
      const glow = ratio * Math.max(0, 1 - d * 1.6) * (0.85 + 0.15 * Math.sin(time * 3 - d * 9)) * T.MathUtils.clamp(time * 1.6 - 0.4, 0, 1);
      tiles.setColorAt(i, tileCol.copy(BG).lerp(TILE_HOT, glow));
    });
    tiles.instanceMatrix.needsUpdate = true;
    tiles.instanceColor.needsUpdate = true;
    tileGlow.material.opacity = ratio * 0.55 * T.MathUtils.clamp(time * 1.6 - 0.4, 0, 1);
  };

  // ── Stage 4: scattered cubes gather into a symbol (eight-cell ring + arrow) — original arrow position (55.25~62.75, 25) ──
  const LOGO = { x: 59, z: 25 };
  const logoMat = new T.MeshLambertMaterial({ color: ACC, emissive: mixc(ACC, INK, 0.2), emissiveIntensity: 0.55 });
  const cubes = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const m = new T.Mesh(new T.BoxGeometry(1.04, 1.04, 1.04), logoMat);
    m.castShadow = true;
    const to = new T.Vector3(LOGO.x + Math.cos(a) * 3.2, 0.52, LOGO.z + Math.sin(a) * 3.2);
    const from = new T.Vector3(LOGO.x + Math.cos(a) * 12 + (Math.random() - 0.5) * 4, 6 + Math.random() * 4, LOGO.z + Math.sin(a) * 12);
    const rot = new T.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    scene.add(m);
    cubes.push({ m, to, from, rot, endY: ((i * 45) % 90) * (Math.PI / 180), delay: i * 0.06 });
  }
  const chevShape = new T.Shape([[-1.6, 2.16], [-0.56, 2.16], [1.6, 0], [-0.56, -2.16], [-1.6, -2.16], [0.56, 0]].map(([x, y]) => new T.Vector2(x, y)));
  const chev = new T.Mesh(new T.ExtrudeGeometry(chevShape, { depth: 0.96, bevelEnabled: false }).rotateX(-Math.PI / 2), logoMat);
  chev.castShadow = true;
  scene.add(chev);
  const qa = new T.Quaternion(), qb = new T.Quaternion(), UP = new T.Vector3(0, 1, 0);
  const setLogo = (p) => {
    cubes.forEach(({ m, to, from, rot, endY, delay }) => {
      const e = 1 - (1 - T.MathUtils.clamp((p - delay) / 0.55, 0, 1)) ** 3;
      m.visible = p > 0.001;
      m.position.lerpVectors(from, to, e);
      qa.setFromEuler(rot);
      qb.setFromAxisAngle(UP, endY + Math.PI / 4);
      m.quaternion.slerpQuaternions(qa, qb, e);
      m.scale.setScalar(0.4 + 0.6 * e);
    });
    const k = T.MathUtils.clamp((p - 0.35) / 0.5, 0, 1);
    chev.visible = k > 0;
    chev.position.set(LOGO.x, -0.96 + (1 - (1 - k) ** 3) * 0.96, LOGO.z);
  };

  // ── Camera ──
  const Z = (v, a, b, from, to) => from + T.MathUtils.clamp((v - a) / (b - a), 0, 1) * (to - from);
  // Same critically damped follow as the original (game-engine SmoothDamp) — one step is capped at .1s
  const damp = (cur, goal, vel, time, dt) => {
    dt = Math.min(Math.max(dt, 0), 0.1);
    const w = 2 / Math.max(1e-4, time), x = w * dt, k = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const ch = cur - goal, tmp = (vel + w * ch) * dt;
    const out = goal + (ch + tmp) * k;
    return goal - cur > 0 === out > goal ? [goal, 0] : [out, (vel - w * tmp) * k];
  };
  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect >= 1.5 ? 14.426 : Math.min(T.MathUtils.radToDeg(2 * Math.atan((Math.tan(T.MathUtils.degToRad(14.426) / 2) * 1.5) / camera.aspect)), 14.426 * 1.6);
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

  const idle = [0, 1, 2, 3].map((i) => ({ on: false, t: 0, wait: i * 0.45 }));
  const P = new T.Vector3(), Q = new T.Vector3(), qTop = new T.Quaternion(), qSide = new T.Quaternion(), ax = new T.Vector3(), ay = new T.Vector3();
  let goal = 0, prog = 0, vel = 0, px = 0, py = 0, parX = 0, parY = 0, last = null;
  let enter = reduced ? 1 : 0, entering = false, logoR = 0, gridTime = 0;

  const frame = (time) => {
    const dt = last === null ? 0 : Math.max(0, time - last);
    last = time;
    [prog, vel] = reduced ? [goal, 0] : damp(prog, goal, vel, mobile ? 0.1 : 0.15, dt);
    const n = Z(prog, 0, 0.17, 0, 1), s = Z(prog, 0.17, 0.74, 0, 1), l = Z(prog, 0.72, 0.85, 0, 1), a = Z(prog, 0.74, 0.9, 0, 1);

    redLines.forEach((r) => r.set(n));
    blueA.set(s);
    blueB.set(a);
    idle.forEach((st, i) => {
      if (st.on) {
        st.t += dt;
        if (st.t >= 1.8) Object.assign(st, { on: false, t: 0, wait: 1.4 + Math.random() * 1.6 });
        redIdle[i].set(st.on ? Math.min(1, st.t) : 0, st.on ? Math.max(0, (st.t - 1) / 0.8) : 0);
      } else {
        redIdle[i].set(0);
        if (goal === 0 && !reduced && (st.wait -= dt) <= 0) Object.assign(st, { on: true, t: 0 });
      }
    });
    if (a > 0) pathB.getPoint(a, P), pathB.getPoint(Math.max(0, a - 0.2), Q);
    else if (s > 0) pathA.getPoint(s, P), pathA.getPoint(Math.max(0, s - 0.1), Q);
    const lit = a > 0 || s > 0;
    head.visible = lit && (a > 0 ? a < 1 : s < 1);
    if (lit) head.position.set(P.x, Y + 0.2, P.z);
    dotU.uAmt.value = lit ? 1 : 0;
    dotU.uHead.value.set(P.x, P.z);
    dotU.uTail.value.set(Q.x, Q.z);
    dotU.uTime.value = time;

    gridTime = Z(prog, 0.72, 0.75, 0, 1) === 0 ? 0 : gridTime + dt;
    setTiles(Z(prog, 0.72, 0.75, 0, 1), reduced ? 9 : gridTime);
    logoR = reduced ? (a === 1 ? 1 : 0) : T.MathUtils.clamp(logoR + 2 * dt * (a === 1 ? 1 : -1), 0, 1);
    setLogo(logoR);

    if (a > 0) pathB.getPoint(a, P);
    else if (s > 0) pathA.getPoint(s, P);
    else lookPath.getPoint(n, P);
    if (entering) enter = Math.min(1, enter + dt / 1.4);
    const d = 1 - (1 - enter) ** 3;
    camera.position.copy(P);
    camera.position.y = 66 + 80 * (1 - d);
    camera.lookAt(P);
    qTop.copy(camera.quaternion);
    camera.position.x += -30 * Z(l, 0, 0.35, 1, 0) + 3.5 * Z(a, 0.8, 1, 0, 1);
    camera.position.z += 50 * Z(l, 0.25, 0.5, 1, 0);
    camera.lookAt(P);
    camera.quaternion.copy(qSide.copy(camera.quaternion).slerp(qTop, 1 - Z(l, 0.5, 1, 1, 0)));
    const f = 1 - Math.exp(-1.5 * dt);
    parX += (px - parX) * f;
    parY += (py - parY) * f;
    camera.updateMatrixWorld();
    ax.setFromMatrixColumn(camera.matrixWorld, 0);
    ay.setFromMatrixColumn(camera.matrixWorld, 1);
    camera.position.addScaledVector(ax, parX * 0.6).addScaledVector(ay, parY * 0.6);
    const back = Z(prog, 0.9, 1.25, 0, 1);
    if (back > 0) camera.translateZ(back * 45);
    camera.updateMatrixWorld();

    // Mouse trail (none on phones): a dot that follows the touched spot on the floor at .15 per frame stamps the last segment onto the plate.
    // The original formula is per 60fps frame, so steps, fading and movement amount are converted by dt — so trails don’t get shorter on slow machines
    if (!mobile && !reduced) {
      const f60 = dt * 60;
      ray.setFromCamera(ndc.set(px, py), camera);
      if (ray.ray.intersectPlane(floor, hit)) aim.set(hit.x, hit.z);
      if (!seeded) at.copy(aim), (seeded = true);
      atPrev.copy(at);
      at.lerp(aim, 1 - Math.pow(0.85, f60));
      const moved = (px - lastPx) ** 2 + (py - lastPy) ** 2 > 1e-7;
      (lastPx = px), (lastPy = py);
      const R = at.distanceTo(atPrev) / Math.max(f60, 1e-3);
      const u = trailMat.uniforms;
      u.uA.value.copy(atPrev).sub(TRAIL_MIN).divide(TRAIL_SIZE);
      u.uB.value.copy(at).sub(TRAIL_MIN).divide(TRAIL_SIZE);
      u.uR.value = moved || R > 0.01 ? Math.min(0.002 + R * 0.0025, 0.033) : 0;
      u.uFade.value = Math.pow(0.947, f60);
      u.uPrev.value = trailRead.texture;
      renderer.setRenderTarget(trailWrite);
      renderer.render(trailScene, trailCam);
      renderer.setRenderTarget(null);
      [trailRead, trailWrite] = [trailWrite, trailRead];
      dotU.uTrailTex.value = trailRead.texture;
      const g = moved ? 1 : 0;
      move += (g - move) * (1 - Math.pow(1 - (g > move ? 0.05 : 0.0108), f60));
      dotU.uMove.value = move;
    }

    sun.position.set(P.x - 25, 70, P.z - 35);
    sun.target.position.copy(P);
    if (!reduced) loops.forEach((fn) => fn(time, dt));
    renderer.render(scene, camera);
  };

  // Bake when setting up the shader and trail panels — compiling for the first time on the first cursor move freezes the screen for 0.5s. Panels are filled with 0 (the clear color is the stage color, so it can’t be used)
  renderer.compile(scene, camera);
  for (const t of [trailRead, trailWrite]) renderer.setRenderTarget(t), renderer.render(trailScene, trailCam);
  renderer.setRenderTarget(null);

  return {
    setProgress: (u) => (goal = Math.max(0, u)),
    // Takes screen coordinates (−1 to 1, down is +) and sets them as device coordinates with up as + like the original — phones also get parallax from the touched spot like the original (no trail)
    setPointer: (x, y) => reduced || ((px = x), (py = -y)),
    enter: () => (entering = true),
    frame,
  };
};
