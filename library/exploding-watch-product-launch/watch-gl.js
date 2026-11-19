// The original draws pre-rendered watch frame sets (front → exploded 171 frames, layers 86, three colors 360° 259 each) by feeding them to a canvas.
// We draw primitive-shape watches of the same silhouette ratio at that angle in one three pass and transfer them to a 2D canvas —
// Frame numbers are cut to integers like the original (progress × (sheet count − 1) rounded), so even the stepped feel of flipping matches.
(() => {
  const T = window.THREE;
  if (!T) return;
  // Skin colors arrive via color-mix and oklab, but three’s Color can’t read them — paint the computed color onto a 1px canvas and read it back as RGB
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.documentElement.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const col = (n) => {
    probe.style.color = `var(${n})`;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };
  const SIZE = 800;

  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(SIZE, SIZE, false);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = T.SRGBColorSpace;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(26, 1, 0.1, 60);
  camera.position.set(0, 0, 7.2);

  // A room for the metal to reflect — four light panels inside a dark box (the studio lighting spots of the original render)
  const room = new T.Scene();
  const roomBox = new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ side: T.BackSide }));
  room.add(roomBox);
  const panels = [];
  [[0, 4.6, 0, 6, 0.4, 6, 2.6], [-4.6, 1, 1, 0.4, 5, 3, 1.4], [4.6, -0.5, 0.5, 0.4, 4, 4, 1.0], [0, -1, 4.6, 5, 1.2, 0.4, 0.8]].forEach(([x, y, z, w, h, d, k]) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshBasicMaterial());
    m.position.set(x, y, z);
    m.userData.k = k;
    room.add(m);
    panels.push(m);
  });
  const pmrem = new T.PMREMGenerator(renderer);
  const bakeEnv = () => {
    const ink = col("--kf-ink"), bg = col("--kf-bg");
    roomBox.material.color.copy(bg).lerp(ink, 0.08);
    panels.forEach((p) => p.material.color.copy(ink).multiplyScalar(p.userData.k));
    if (scene.environment) scene.environment.dispose();
    scene.environment = pmrem.fromScene(room, 0.03).texture;
  };

  const key = new T.DirectionalLight(0xffffff, 1.4); // Not skin: uses only the white light intensity
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new T.DirectionalLight(0xffffff, 0.8); // Not skin: uses only the white light intensity
  rim.position.set(4, -2, -3);
  scene.add(rim);

  const steel = new T.MeshStandardMaterial({ metalness: 1, roughness: 0.28 });
  const polish = new T.MeshStandardMaterial({ metalness: 1, roughness: 0.12 });
  const brushed = new T.MeshStandardMaterial({ metalness: 1, roughness: 0.42 });
  const gold = new T.MeshStandardMaterial({ metalness: 1, roughness: 0.35 });
  const ruby = new T.MeshStandardMaterial({ metalness: 0.2, roughness: 0.3 });
  const glass = new T.MeshStandardMaterial({ metalness: 0, roughness: 0.05, transparent: true, opacity: 0.12 });
  const lume = new T.MeshStandardMaterial({ metalness: 0.6, roughness: 0.3 });

  // Waffle dial pattern — draws on a canvas the grain of light slanting into small square cells
  const dialTex = (base, night) => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d");
    const b = base.clone(), lo = b.clone().multiplyScalar(0.55), hi = b.clone().lerp(new T.Color(1, 1, 1), 0.28);
    g.fillStyle = `#${lo.getHexString()}`;
    g.fillRect(0, 0, 512, 512);
    const n = 22, s = 512 / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const grd = g.createLinearGradient(i * s, j * s, i * s + s, j * s + s);
      grd.addColorStop(0, `#${hi.getHexString()}`);
      grd.addColorStop(1, `#${b.getHexString()}`);
      g.fillStyle = grd;
      g.fillRect(i * s + s * 0.14, j * s + s * 0.14, s * 0.72, s * 0.72);
    }
    if (night) { g.fillStyle = "rgba(0,0,0,.72)"; g.fillRect(0, 0, 512, 512); } // Not skin: overlay that darkens the dial in night mode
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };
  const dialMats = {};
  const dialMat = (variant, night) => {
    const k = variant + (night ? ":n" : "");
    if (!dialMats[k]) dialMats[k] = new T.MeshStandardMaterial({ map: dialTex(col(`--site-dial-${variant}`), night), metalness: 0.35, roughness: 0.45 });
    return dialMats[k];
  };

  const cyl = (rt, rb, h, seg, mat, opts = {}) => {
    const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg, 1, false, opts.start || 0, opts.len || Math.PI * 2), mat);
    m.rotation.x = Math.PI / 2; // Move the axis toward the screen (z)
    return m;
  };
  const wrap = (mesh, z) => { const g = new T.Group(); g.add(mesh); g.position.z = z; return g; };
  // Hollow rim — the outside has sides angles (8 gives an octagon), the inside a round hole. The dial and movement show through the hole
  const ring = (outer, inner, depth, sides, mat) => {
    const sh = new T.Shape();
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 + Math.PI / sides;
      i ? sh.lineTo(Math.cos(a) * outer, Math.sin(a) * outer) : sh.moveTo(Math.cos(a) * outer, Math.sin(a) * outer);
    }
    const hole = new T.Path();
    hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
    sh.holes.push(hole);
    const g = new T.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 48 });
    g.translate(0, 0, -depth / 2);
    return new T.Mesh(g, mat);
  };

  // Head (case) — splits apart along z by layer when exploded
  const head = new T.Group();
  const layers = {};
  const layer = (name, z) => { const g = new T.Group(); g.userData.z = z; g.position.z = z; head.add(g); layers[name] = g; return g; };

  const back = layer("back", -0.12);
  back.add(ring(0.44, 0.33, 0.04, 64, brushed));
  back.add(cyl(0.34, 0.34, 0.01, 48, glass));
  const screw = new T.CylinderGeometry(0.018, 0.018, 0.02, 12);
  for (let i = 0; i < 6; i++) { const s = new T.Mesh(screw, polish); const a = (i / 6) * Math.PI * 2; s.rotation.x = Math.PI / 2; s.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4, -0.03); back.add(s); }

  const move = layer("move", -0.06);
  move.add(wrap(cyl(0.36, 0.36, 0.03, 64, gold), 0));
  for (let i = 0; i < 5; i++) { // Geneva stripes — shallow bands on the plate
    const band = new T.Mesh(new T.BoxGeometry(0.64, 0.035, 0.012), brushed);
    band.position.set(0, -0.24 + i * 0.12, -0.02);
    move.add(band);
  }
  [[0.12, 0.1, 0.07], [-0.14, 0.06, 0.05], [0.02, -0.16, 0.06], [-0.08, -0.08, 0.035]].forEach(([x, y, r]) => {
    const g = cyl(r, r, 0.02, 24, polish); g.position.set(x, y, -0.035); move.add(g);
    const j = cyl(0.012, 0.012, 0.01, 12, ruby); j.position.set(x, y, -0.048); move.add(j);
  });
  const rotor = layer("rotor", -0.105);
  rotor.add(cyl(0.34, 0.34, 0.012, 48, gold, { start: Math.PI * 0.15, len: Math.PI }));
  rotor.add(cyl(0.05, 0.05, 0.02, 24, polish));

  const mid = layer("mid", 0);
  mid.add(ring(0.5, 0.38, 0.17, 64, steel));
  const lugGeo = new T.BoxGeometry(0.62, 0.2, 0.13);
  [1, -1].forEach((sgn) => { const l = new T.Mesh(lugGeo, brushed); l.position.set(0, sgn * 0.47, -0.01); mid.add(l); });
  const crown = cyl(0.06, 0.06, 0.1, 24, polish);
  crown.rotation.set(0, 0, Math.PI / 2);
  crown.position.set(0.55, 0, 0);
  mid.add(crown);

  const dialL = layer("dial", 0.09);
  const dial = cyl(0.37, 0.37, 0.012, 64, dialMat("blue"));
  dial.rotation.y = Math.PI / 2;
  dialL.add(dial);
  const idxGeo = new T.BoxGeometry(0.022, 0.085, 0.016);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const m = new T.Mesh(idxGeo, lume);
    m.position.set(Math.sin(a) * 0.3, Math.cos(a) * 0.3, 0.012);
    m.rotation.z = -a;
    dialL.add(m);
    if (i === 0) { const m2 = m.clone(); m.position.x -= 0.018; m2.position.x += 0.018; dialL.add(m2); }
  }
  const hands = layer("hands", 0.12);
  const hand = (w, h, a) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.008), polish); m.geometry.translate(0, h / 2 - 0.03, 0); m.rotation.z = a; hands.add(m); };
  hand(0.028, 0.2, (-10 / 12) * Math.PI * 2 + 0.3);
  hand(0.02, 0.3, (2 / 12) * Math.PI * 2);
  hands.add(cyl(0.025, 0.025, 0.02, 16, polish));

  const bezel = layer("bezel", 0.15);
  bezel.add(ring(0.5, 0.39, 0.06, 8, polish));
  const crystal = layer("crystal", 0.2);
  crystal.add(cyl(0.4, 0.4, 0.015, 64, glass));

  // Bracelet — links are laid out on a loop (wrist circumference) that wraps behind the case
  const bracelet = new T.Group();
  const R = 1.55, pitch = 0.135, span = 1.15;
  const linkMid = new T.BoxGeometry(1, 0.11, 0.07), linkSide = new T.BoxGeometry(1, 0.115, 0.085);
  const half = Math.floor((span * R) / pitch), count = half * 2;
  const imMid = new T.InstancedMesh(linkMid, polish, count), imL = new T.InstancedMesh(linkSide, brushed, count), imR = new T.InstancedMesh(linkSide, brushed, count);
  const dummy = new T.Object3D();
  for (let i = 0; i < count; i++) {
    // At the case top and bottom ends it curves slightly back with a large radius and stretches up and down — the original render also stood the ring up unclosed
    const k = i < half ? i : i - half, sg = i < half ? 1 : -1;
    const a = sg * (0.5 / R + k * (pitch / R)), w = 0.58 - 0.1 * (k / half);
    const y = Math.sin(a) * R, z = Math.cos(a) * R - R - 0.03;
    dummy.position.set(0, y, z);
    dummy.rotation.set(-a, 0, 0);
    dummy.scale.set(w * 0.42, 1, 1);
    dummy.updateMatrix();
    imMid.setMatrixAt(i, dummy.matrix);
    [[-1, imL], [1, imR]].forEach(([sg, im]) => {
      dummy.position.set(sg * w * 0.35, y, z);
      dummy.scale.set(w * 0.28, 1, 1);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      dummy.scale.set(w * 0.42, 1, 1);
    });
  }
  bracelet.add(imMid, imL, imR);

  const watch = new T.Group();
  watch.add(head, bracelet);
  scene.add(watch);

  const ease = (x) => x * x * (3 - 2 * x);
  const seg = (t, a, b) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
  const lerp = (a, b, t) => a + (b - a) * t;
  const show = (o) => {
    bracelet.visible = !!o.bracelet;
    Object.entries(layers).forEach(([k, g]) => (g.visible = !o.only || o.only.includes(k)));
  };
  const explode = (e) => {
    const off = { crystal: 1.25, bezel: 0.85, hands: 0.55, dial: 0.3, mid: 0, move: -0.45, rotor: -0.85, back: -1.2 };
    Object.entries(layers).forEach(([k, g]) => (g.position.z = g.userData.z + off[k] * e));
    crown.position.x = 0.55 + 0.45 * e;
  };

  // Pose per scene — t runs 0 to 1 (frame number / number of frames)
  const POSES = {
    // Front → turning sideways → exploded view with layers split at a three-quarter angle
    explode(t) {
      show({ bracelet: true });
      dial.material = dialMat("blue");
      explode(seg(t, 0.42, 0.92));
      watch.rotation.set(lerp(0, -0.55, seg(t, 0.35, 1)), lerp(0, 1.55, seg(t, 0, 0.42)) - lerp(0, 0.75, seg(t, 0.42, 1)), lerp(0, 0.35, seg(t, 0.4, 1)));
      watch.position.set(lerp(0, -0.35, seg(t, 0.42, 1)), lerp(0, -0.25, seg(t, 0.42, 1)), 0);
      watch.scale.setScalar(lerp(1.6, 1.05, seg(t, 0.35, 1)));
    },
    // The head showing the dial tilts and turns, revealing the movement on the back plate
    layers(t) {
      show({});
      dial.material = dialMat("blue");
      explode(0);
      watch.rotation.set(0.28, lerp(-0.25, Math.PI + 0.35, ease(t)), 0);
      watch.position.set(0, 0, 0);
      watch.scale.setScalar(1.85);
    },
    // Glass rim — slanted only on the bezel and case rim
    ring() {
      show({ only: ["bezel", "mid"] });
      layers.mid.children.forEach((m) => (m.visible = m.geometry !== lugGeo && m !== crown));
      layers.mid.visible = false;
      explode(0);
      watch.rotation.set(0.75, -0.15, 0);
      watch.scale.setScalar(1.85);
      watch.position.set(0, 0, 0);
    },
    // Three colors 360° — standing upright, one turn around the vertical axis
    spin(t, o = {}) {
      show({ bracelet: true });
      layers.mid.children.forEach((m) => (m.visible = true));
      dial.material = dialMat(o.variant || "blue", o.night);
      explode(0);
      watch.rotation.set(0.05, t * Math.PI * 2, 0);
      watch.position.set(0, 0, 0);
      watch.scale.setScalar(o.scale || 1.2);
    },
  };

  let baked = false;
  const draw = (canvas, pose, t, o) => {
    if (!baked) { bakeEnv(); baked = true; }
    const ink = col("--site-steel");
    steel.color.copy(ink); polish.color.copy(ink).lerp(new T.Color(1, 1, 1), 0.2); brushed.color.copy(ink).multiplyScalar(0.9);
    gold.color.copy(col("--site-gold"));
    ruby.color.copy(col("--kf-accent-soft"));
    lume.color.copy(col("--site-lume"));
    lume.emissive.copy(o && o.night ? col("--site-lume") : new T.Color(0, 0, 0));
    layers.mid.children.forEach((m) => (m.visible = true));
    POSES[pose](t, o || {});
    if (canvas.width !== SIZE) { canvas.width = SIZE; canvas.height = SIZE; }
    renderer.render(scene, camera);
    const g = canvas.getContext("2d");
    g.clearRect(0, 0, SIZE, SIZE);
    g.drawImage(renderer.domElement, 0, 0);
  };

  // Imitating frame bundles — like the original ImageSequence, progress is cut into frame counts and the same number is not redrawn
  window.PHWatch = {
    frames: { explode: 171, layers: 86, spin: 259 },
    draw,
    seq(canvas, pose, frames, o) {
      let last = -1;
      return (p) => {
        const i = Math.min(frames - 1, Math.max(0, Math.round(p * (frames - 1))));
        if (i === last) return i;
        last = i;
        draw(canvas, pose, i / (frames - 1), o);
        return i;
      };
    },
    // Shaders are precompiled at setup — so the first scroll doesn’t stall
    warm() { bakeEnv(); baked = true; renderer.compile(scene, camera); },
  };
})();
