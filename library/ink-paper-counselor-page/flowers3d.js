// Build the original’s 3D flower models (dandelion · allium · hydrangea · echinacea · artichoke · peony glb) as our basic shapes of the same size and silhouette.
// Per flower { group, tint(t) } returns it — tint colors from a black silhouette (0) to its own color (1), like the original.
(() => {
  const T = window.THREE;
  if (!T) return;
  const F = (window.EGFlowers = {});
  // Flower colors are content, so they don’t follow the skin
  const C = (hex) => new T.Color(hex);
  const DARK = C("#151515"); /* Not skin: silhouette before tinting */
  const mat = (hex, o = {}) => {
    const m = new T.MeshStandardMaterial({ color: hex, roughness: o.rough ?? 0.7, metalness: 0, side: o.side ?? T.FrontSide, transparent: !!o.alpha, opacity: o.alpha ?? 1 });
    m.userData.target = C(hex);
    return m;
  };
  const tinter = (mats) => (t) => mats.forEach((m) => m.color.copy(DARK).lerp(m.userData.target, t));
  const stem = (len, r, hex, bend = 0.08) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push(new T.Vector3(Math.sin(k * Math.PI) * bend, -k * len, 0)); }
    const m = mat(hex);
    return { mesh: new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, r, 8), m), mat: m };
  };
  const onSphere = (n, i) => { const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * 2.399963; return new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); };
  const up = new T.Vector3(0, 1, 0);
  const orient = (obj, dir) => obj.quaternion.setFromUnitVectors(up, dir.clone().normalize());

  // Dandelion fluff ball — thin stalks reaching out from the center, each tipped with a fan of bristles. A single flying seed has the same shape (seed)
  const pappus = (dir, len, fan, spread, out) => {
    const tip = dir.clone().multiplyScalar(len);
    out.push(0, 0, 0, tip.x, tip.y, tip.z);
    const a = new T.Vector3().crossVectors(dir, Math.abs(dir.y) < 0.9 ? up : new T.Vector3(1, 0, 0)).normalize();
    const b = new T.Vector3().crossVectors(dir, a).normalize();
    for (let k = 0; k < fan; k++) {
      const ang = (k / fan) * Math.PI * 2;
      const d = dir.clone().multiplyScalar(0.55).add(a.clone().multiplyScalar(Math.cos(ang) * spread)).add(b.clone().multiplyScalar(Math.sin(ang) * spread)).normalize();
      const e = tip.clone().add(d.multiplyScalar(len * 0.32));
      out.push(tip.x, tip.y, tip.z, e.x, e.y, e.z);
    }
  };
  F.seed = () => {
    const g = new T.Group(), v = [];
    pappus(up.clone(), 0.55, 22, 1.1, v);
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(v, 3));
    const lm = new T.LineBasicMaterial({ color: "#2b2622", transparent: true, opacity: 0.55 }); /* Not skin: seed fluff */
    g.add(new T.LineSegments(geo, lm));
    const body = new T.Mesh(new T.SphereGeometry(0.03, 8, 8), mat("#1d1612")); /* Not Skin: Seed */
    body.scale.set(1, 3.2, 1); body.position.y = -0.08;
    g.add(body);
    return { group: g, line: lm };
  };
  F.dandelion = () => {
    const g = new T.Group(), v = [], n = 260;
    for (let i = 0; i < n; i++) pappus(onSphere(n, i), 0.62 + Math.random() * 0.08, 9, 0.9, v);
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(v, 3));
    const lm = new T.LineBasicMaterial({ color: "#3a3430", transparent: true, opacity: 0.32 }); /* Not Skin: Fluff */
    const fluff = new T.LineSegments(geo, lm);
    g.add(fluff);
    const core = mat("#7a3e22"); /* Not skin: calyx brown */
    const coreM = new T.Mesh(new T.SphereGeometry(0.12, 16, 12), core);
    coreM.scale.set(1, 0.6, 1);
    g.add(coreM);
    const bractM = mat("#5c7a3a"); /* Not skin: calyx green */
    for (let i = 0; i < 14; i++) { const b = new T.Mesh(new T.ConeGeometry(0.02, 0.22, 4), bractM); const a = (i / 14) * Math.PI * 2; b.position.set(Math.cos(a) * 0.08, -0.12, Math.sin(a) * 0.08); b.rotation.set(Math.sin(a) * 2.6, 0, -Math.cos(a) * 2.6); g.add(b); }
    const s = stem(2.6, 0.022, "#4f7a2c", 0.05); /* Not Skin: Stem */
    s.mesh.position.y = -0.12; g.add(s.mesh);
    const tint = tinter([core, bractM, s.mat]);
    return { group: g, fluff: lm, tint: (t) => { tint(t); lm.opacity = 0.18 + 0.14 * t; } };
  };
  F.allium = () => {
    const g = new T.Group(), n = 420;
    const fm = mat("#4646a8", { rough: 0.55 }); /* Not skin: allium purple */
    const geo = new T.ConeGeometry(0.07, 0.26, 6, 1, true); geo.translate(0, 0.13, 0);
    const inst = new T.InstancedMesh(geo, fm, n);
    const o = new T.Object3D();
    for (let i = 0; i < n; i++) { const d = onSphere(n, i); o.position.copy(d.clone().multiplyScalar(0.5)); orient(o, d.clone().multiplyScalar(-1)); o.rotateX(Math.PI); o.scale.setScalar(0.8 + Math.random() * 0.5); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); }
    g.add(inst);
    const coreM = mat("#2a2440"); /* Not skin: inner */
    g.add(new T.Mesh(new T.SphereGeometry(0.46, 24, 18), coreM));
    const s = stem(2.4, 0.03, "#4c6b33", 0.03); /* Not Skin */
    s.mesh.position.y = -0.44; g.add(s.mesh);
    return { group: g, tint: tinter([fm, coreM, s.mat]) };
  };
  F.hydrangea = () => {
    const g = new T.Group(), n = 260;
    const pm = mat("#d9dccb", { rough: 0.85, side: T.DoubleSide }); /* Not skin: hydrangea white petals */
    const petalGeo = new T.CircleGeometry(0.1, 10); petalGeo.scale(1, 0.75, 1);
    const parts = [];
    for (let k = 0; k < 4; k++) { const p = petalGeo.clone(); p.translate(0, 0.09, 0); p.rotateZ((k / 4) * Math.PI * 2 + 0.4); parts.push(p); }
    const floret = mergeGeos(parts);
    const inst = new T.InstancedMesh(floret, pm, n);
    const o = new T.Object3D();
    for (let i = 0; i < n; i++) { const d = onSphere(n, i); if (d.y < -0.55) d.y = -0.55; o.position.copy(d.clone().multiplyScalar(0.62 + Math.random() * 0.06)); o.lookAt(d.clone().multiplyScalar(3)); o.rotateZ(Math.random() * 6); o.scale.setScalar(0.85 + Math.random() * 0.4); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); }
    g.add(inst);
    const eye = mat("#a8b85a"); /* Not skin: stamen lime green */
    g.add(new T.Mesh(new T.SphereGeometry(0.58, 20, 16), eye));
    const s = stem(2.4, 0.035, "#5f8a2c", 0.12); /* Not Skin */
    s.mesh.position.y = -0.5; g.add(s.mesh);
    return { group: g, tint: tinter([pm, eye, s.mat]) };
  };
  F.echinacea = () => {
    const g = new T.Group();
    const cm = mat("#3b3324", { rough: 0.9 }); /* Not skin: Echinacea seed head */
    const cone = new T.Mesh(new T.SphereGeometry(0.34, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), cm);
    cone.scale.set(1, 0.9, 1); g.add(cone);
    const spikeM = mat("#a8642a"); /* Not skin: seed tip orange */
    const n = 300, inst = new T.InstancedMesh(new T.ConeGeometry(0.012, 0.07, 4), spikeM, n), o = new T.Object3D();
    for (let i = 0; i < n; i++) { const d = onSphere(n * 2, i); o.position.set(d.x * 0.34, Math.abs(d.y) * 0.31, d.z * 0.34); orient(o, new T.Vector3(d.x, Math.abs(d.y) + 0.2, d.z)); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); }
    g.add(inst);
    const pm = mat("#e7799b", { rough: 0.6, side: T.DoubleSide }); /* Not skin: pink petal */
    for (let i = 0; i < 15; i++) {
      const geo = new T.PlaneGeometry(0.16, 0.9, 2, 12); geo.translate(0, -0.45, 0);
      const pos = geo.attributes.position;
      for (let k = 0; k < pos.count; k++) { const y = pos.getY(k); pos.setZ(k, 0.25 * Math.sin((-y / 0.9) * 1.6)); pos.setX(k, pos.getX(k) * (1 - Math.abs(y) * 0.5)); }
      geo.computeVertexNormals();
      const p = new T.Mesh(geo, pm); const a = (i / 15) * Math.PI * 2;
      p.position.set(Math.cos(a) * 0.3, 0.02, Math.sin(a) * 0.3); p.rotation.y = -a + Math.PI / 2; p.rotateX(-0.55);
      g.add(p);
    }
    const s = stem(2.4, 0.03, "#4e7a2a", 0.04); /* Not Skin */
    g.add(s.mesh);
    return { group: g, tint: tinter([cm, spikeM, pm, s.mat]) };
  };
  F.artichoke = () => {
    const g = new T.Group();
    const sm = mat("#6c6a3c", { rough: 0.75, side: T.DoubleSide }); /* Not skin: artichoke scales */
    const scale = new T.SphereGeometry(0.14, 10, 8, 0, Math.PI, 0, Math.PI); scale.scale(1, 1.6, 0.4);
    const rows = 9, o = new T.Object3D(), list = [];
    for (let r = 0; r < rows; r++) { const k = r / (rows - 1), rad = 0.18 + Math.sin(k * Math.PI * 0.9 + 0.2) * 0.32, y = -0.35 + k * 0.62, cnt = 9 + Math.round(Math.sin(k * Math.PI) * 6); for (let i = 0; i < cnt; i++) { const a = (i / cnt) * Math.PI * 2 + r * 0.35; o.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad); o.rotation.set(0, -a + Math.PI / 2, 0); o.rotateX(-0.5 - k * 0.4); o.updateMatrix(); list.push(o.matrix.clone()); } }
    const inst = new T.InstancedMesh(scale, sm, list.length); list.forEach((m, i) => inst.setMatrixAt(i, m)); g.add(inst);
    const tm = new T.LineBasicMaterial({ color: "#a873c9", transparent: true, opacity: 0.9 }); /* Not skin: purple tassel */
    const v = []; for (let i = 0; i < 500; i++) { const d = onSphere(1000, i); if (d.y < 0.05) continue; v.push(d.x * 0.05, 0.25, d.z * 0.05, d.x * 0.32, 0.25 + d.y * 0.34, d.z * 0.32); }
    const tg = new T.BufferGeometry(); tg.setAttribute("position", new T.Float32BufferAttribute(v, 3));
    const tuft = new T.LineSegments(tg, tm); g.add(tuft);
    const s = stem(2.4, 0.05, "#6a8a3a", 0.02); /* Not Skin */
    s.mesh.position.y = -0.36; g.add(s.mesh);
    const tint = tinter([sm, s.mat]);
    const purple = C("#a873c9"); /* Not Skin */
    return { group: g, tint: (t) => { tint(t); tm.color.copy(DARK).lerp(purple, t); } };
  };
  F.peony = () => {
    const g = new T.Group();
    const inner = mat("#7a2338", { rough: 0.45, side: T.DoubleSide }); /* Not skin: peony dark center */
    const outer = mat("#e6607e", { rough: 0.4, side: T.DoubleSide, alpha: 0.82 }); /* Not skin: outer pink */
    const layers = [[7, 0.3, 0.45, inner], [9, 0.55, 0.95, inner], [11, 0.85, 1.35, inner], [9, 1.15, 1.75, outer]];
    layers.forEach(([cnt, rad, tilt, m], li) => {
      for (let i = 0; i < cnt; i++) {
        const geo = new T.SphereGeometry(0.42 + li * 0.08, 16, 10, 0, Math.PI * 0.9, 0, Math.PI * 0.55);
        geo.scale(1, 0.9, 0.45);
        const p = new T.Mesh(geo, m); const a = (i / cnt) * Math.PI * 2 + li * 0.4;
        p.position.set(Math.cos(a) * rad * 0.35, -li * 0.05, Math.sin(a) * rad * 0.35);
        p.rotation.y = -a; p.rotateZ(tilt * 0.9);
        g.add(p);
      }
    });
    const s = stem(2.6, 0.05, "#7ea36a", 0.1); /* Not Skin */
    s.mesh.position.y = -0.3; g.add(s.mesh);
    return { group: g, tint: tinter([inner, outer, s.mat]) };
  };
  F.petal = () => { const geo = new T.SphereGeometry(0.16, 10, 6, 0, Math.PI, 0, Math.PI * 0.6); geo.scale(1, 1.3, 0.3); return new T.Mesh(geo, mat("#e57791", { side: T.DoubleSide, rough: 0.4 })); }; /* Not skin: drifting petals */

  function mergeGeos(list) {
    const pos = [], nor = [], idx = [];
    let off = 0;
    list.forEach((gm) => {
      const g2 = gm.index ? gm : gm;
      const p = g2.attributes.position, n = g2.attributes.normal;
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); }
      if (g2.index) for (let i = 0; i < g2.index.count; i++) idx.push(g2.index.getX(i) + off);
      off += p.count;
    });
    const out = new T.BufferGeometry();
    out.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    out.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    out.setIndex(idx);
    return out;
  }

  // One panel — canvas, scene, camera, light. Not drawn when off-screen
  F.stage = (canvas, { fov = 32, z = 6 } = {}) => {
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputEncoding = T.sRGBEncoding;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.set(0, 0, z);
    scene.add(new T.HemisphereLight("#fffaf2", "#5a4a44", 0.95)); /* Not skin: light color */
    const key = new T.DirectionalLight("#ffffff", 0.9); key.position.set(2.5, 3, 4); scene.add(key); /* Not skin: light color */
    const fit = () => { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    fit();
    new ResizeObserver(fit).observe(canvas);
    // Screen x (0~1) and y (0~1, top 0) at z in front of the camera=To 0 plane coordinates
    const toWorld = (x, y) => { const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z; return new T.Vector3((x - 0.5) * h * camera.aspect, (0.5 - y) * h, 0); };
    const unit = () => 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    return { renderer, scene, camera, toWorld, unit, render: () => renderer.render(scene, camera) };
  };
})();
