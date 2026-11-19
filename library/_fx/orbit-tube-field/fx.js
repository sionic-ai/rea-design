// White tube elliptical orbits (solid and dotted) and the blue dot circling on them — values exactly as in Studio BgAnimation (seed 3737844653, camera z 7 · FOV 40, fog 1~40, tube radius .01)
(() => {
  const ROT = [[Math.PI / 3, 0, 0], [Math.PI / 4, Math.PI / 6, 0], [Math.PI / 5, -Math.PI / 8, Math.PI / 6], [-Math.PI / 6, Math.PI / 4, Math.PI / 8]];
  const POS = [[-2, 1, 0], [3, -1, -2], [0, 2, 1], [1, -0.5, 1.5]];
  const SIZE = [[6, 3], [5, 4], [4, 2.5], [5.5, 3.5]];
  const merge = (T, geos) => {
    const pos = [], nor = [], idx = [];
    let base = 0;
    geos.forEach((g) => {
      pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array);
      g.index.array.forEach((i) => idx.push(i + base));
      base += g.attributes.position.count; g.dispose();
    });
    const m = new T.BufferGeometry();
    m.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    m.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    m.setIndex(idx);
    return m;
  };
  kfFx.register("orbit-tube-field", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    // Skin variables can be hex, oklch or color-mix, so they are converted to computed rgb before being passed on
    const color = (n) => { const i = document.createElement("i"); i.style.color = `var(${n})`; el.append(i); const c = getComputedStyle(i).color; i.remove(); return new T.Color(c); };
    const solid = Math.max(0, Math.floor(+(options.solid ?? 2))), dashed = Math.max(0, Math.floor(+(options.dashed ?? 2)));
    const rotSpeed = +(options.spin ?? 0.1), dotSpeed = +(options.speed ?? 0.2);
    const scene = new T.Scene();
    scene.fog = new T.Fog(color("--kf-bg"), 1, 40);
    const cam = new T.PerspectiveCamera(40, 1, 0.1, 1000);
    cam.position.z = 7;
    const ren = new T.WebGLRenderer({ antialias: true, alpha: true });
    ren.setClearColor(0x000000, 0);
    ren.domElement.style.cssText = "display:block;width:100%;height:100%";
    el.append(ren.domElement);
    let s = (+(options.seed ?? 3737844653)) >>> 0;
    const rng = () => { s += 1831565813; let e = Math.imul(s ^ (s >>> 15), s | 1); e ^= e + Math.imul(e ^ (e >>> 7), e | 61); return ((e ^ (e >>> 14)) >>> 0) / 4294967296; };
    const r2 = () => rng() * 2 - 1;
    const tubeMat = (op) => new T.MeshBasicMaterial({ color: color("--kf-surface"), transparent: true, opacity: op, fog: true });
    const orbits = [];
    for (let i = 0; i < solid + dashed; i++) {
      const k = i % 4, isDash = i >= solid;
      const rot = ROT[k].map((v) => v + r2() * 0.35), pos = POS[k].map((v) => v * 0.55);
      const a = Math.max(0.5, SIZE[k][0] + r2() * 0.45), b = Math.max(0.5, SIZE[k][1] + r2() * 0.45);
      const pts = new T.EllipseCurve(0, 0, a, b, 0, Math.PI * 2, false, 0).getSpacedPoints(200).map((p) => new T.Vector3(p.x, p.y, 0));
      const curve = new T.CatmullRomCurve3(pts, true, "centripetal");
      let geo;
      if (!isDash) geo = new T.TubeGeometry(curve, 256, 0.01, 12, true);
      else {
        const L = curve.getLength(), parts = [];
        for (let n = 0; n < Math.floor(L / 0.09); n++) {
          const t0 = (n * 0.09) / L, t1 = Math.min((n * 0.09 + 0.045) / L, 1), seg = [];
          for (let m = 0; m <= 12; m++) seg.push(curve.getPointAt(Math.min(1, t0 + ((t1 - t0) * m) / 12)));
          parts.push(new T.TubeGeometry(new T.CatmullRomCurve3(seg, false, "centripetal"), 16, 0.01, 12, false));
        }
        geo = merge(T, parts);
      }
      const mesh = new T.Mesh(geo, tubeMat(isDash ? 0.5 : 1));
      mesh.rotation.set(...rot); mesh.position.set(...pos);
      scene.add(mesh);
      orbits.push({ mesh, curve });
    }
    const dotGeo = new T.SphereGeometry(0.15, 16, 16), dotMat = new T.MeshBasicMaterial({ color: color("--kf-accent"), fog: true });
    const dots = orbits.map((o, i) => { const m = new T.Mesh(dotGeo, dotMat); m.scale.setScalar(0.05 / 0.15); scene.add(m); return { m, o, ang: (i * Math.PI * 2) / Math.max(1, orbits.length), speed: 0.3 + i * 0.15 }; });
    const size = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      ren.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); ren.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const frame = () => {
      orbits.forEach((o, i) => { o.mesh.rotation.y += 0.002 * (i + 1) * rotSpeed; o.mesh.rotation.x += 0.001 * (i + 1) * rotSpeed; });
      dots.forEach((d) => {
        d.ang += d.speed * 0.01 * dotSpeed;
        const p = d.o.curve.getPoint((d.ang % (Math.PI * 2)) / (Math.PI * 2));
        p.applyEuler(d.o.mesh.rotation);
        d.m.position.copy(p.add(d.o.mesh.position));
      });
      ren.render(scene, cam);
    };
    if (reduce) frame(); else ren.setAnimationLoop(frame);
    return () => {
      ren.setAnimationLoop(null); ro.disconnect();
      orbits.forEach((o) => { o.mesh.geometry.dispose(); o.mesh.material.dispose(); });
      dotGeo.dispose(); dotMat.dispose(); ren.dispose(); ren.domElement.remove();
    };
  });
})();
