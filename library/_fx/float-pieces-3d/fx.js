// Play pieces (chess pieces·dice·cards) float in 3D over the panel — four each on two canvases, one behind the image and one in front (FOV 30° · camera z 20).
// Once attached, each word flies in spinning from off-screen after a 1~1.6s delay with 2.6s expo.out and settles in place, then floats up and down as if breathing (amplitude .07) and turns slowly (drift).
// The camera follows the cursor with exponential damping 2.8, shifting 1.4 horizontally · −.8 vertically so the layers show parallax, and pressing a horse makes it bounce (.32s), roll, and when it slows down
// It settles on the nearest face (dice 90° · others a full turn). By scroll progress, front layers drift upward in proportion to depth and back layers drift slightly down.
// Our horse is built from Lathe shapes and boxes, with no model file
(() => {
  const TAU = Math.PI * 2;
  const SPEC = [
    { make: "card", layer: "back", at: [0.5, 0.25], depth: -4, size: 0.78, tilt: [0.2, -0.3, 0.16], snap: TAU, drift: -0.1, flip: true },
    { make: "rook", layer: "back", at: [0.215, 0.43], depth: -2.5, size: 0.68, tilt: [0.16, 0, 0.32], snap: TAU, drift: -0.14 },
    { make: "king", layer: "back", at: [0.8, 0.45], depth: -3, size: 0.68, tilt: [0.14, 0.4, -0.26], snap: TAU, drift: 0.12 },
    { make: "pawn", layer: "back", at: [0.255, 0.6], depth: -2, size: 0.55, tilt: [1.05, 0, 0.35], snap: TAU, drift: 0.2, gold: true },
    { make: "queen", layer: "front", at: [0.1, 0.53], depth: 4, size: 0.72, tilt: [0.1, 0.3, 0.22], snap: TAU, drift: 0.1, gold: true },
    { make: "die", layer: "front", at: [0.9, 0.54], depth: 3, size: 0.72, tilt: [0.62, 0.78, 0.18], snap: Math.PI / 2, drift: -0.16 },
    { make: "card", layer: "front", at: [0.83, 0.74], depth: 2, size: 0.8, tilt: [-0.25, -0.45, -0.3], snap: TAU, drift: 0.12 },
    { make: "pawn", layer: "front", at: [0.18, 0.78], depth: 5, size: 0.5, tilt: [1.15, 0, -0.4], snap: TAU, drift: -0.2 },
  ];
  // look: board — a group on a chessboard (big pawn in the middle, rook and king behind, dice and card in front)
  const BOARD = [
    { make: "rook", layer: "back", at: [0.12, 0.5], depth: -2, size: 0.9, tilt: [0.08, 0.2, 0.06], snap: TAU, drift: 0.06 },
    { make: "king", layer: "back", at: [0.88, 0.34], depth: -4, size: 0.8, tilt: [0.06, -0.2, -0.05], snap: TAU, drift: -0.05 },
    { make: "pawn", layer: "front", at: [0.45, 0.6], depth: 3, size: 1.3, tilt: [0.04, 0, 0.03], snap: TAU, drift: 0.04 },
    { make: "die", layer: "front", at: [0.85, 0.66], depth: 2, size: 0.62, tilt: [0.5, 0.7, 0.1], snap: Math.PI / 2, drift: -0.08 },
    { make: "card", layer: "front", at: [0.06, 0.9], depth: 4, size: 0.62, tilt: [-0.9, 0.3, 0.4], snap: TAU, drift: 0.05 },
  ];
  const lathe = (T, pts, mat) => new T.Mesh(new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), 40), mat);
  const BASE = [[0, 0], [0.42, 0], [0.44, 0.06], [0.4, 0.12], [0.3, 0.16], [0.26, 0.2]];
  const build = (T, kind, m) => {
    const g = new T.Group();
    if (kind === "pawn") {
      g.add(lathe(T, [...BASE, [0.17, 0.5], [0.13, 0.78], [0.2, 0.82], [0.11, 0.86], [0, 0.86]], m.body));
      const head = new T.Mesh(new T.SphereGeometry(0.2, 32, 20), m.body); head.position.y = 1.02; g.add(head);
    } else if (kind === "rook") {
      g.add(lathe(T, [...BASE, [0.22, 0.6], [0.22, 1.0], [0.3, 1.04], [0.3, 1.22], [0, 1.22]], m.body));
      for (let i = 0; i < 4; i++) {
        const b = new T.Mesh(new T.BoxGeometry(0.14, 0.14, 0.12), m.body);
        const a = (i / 4) * TAU; b.position.set(Math.cos(a) * 0.23, 1.29, Math.sin(a) * 0.23); b.rotation.y = -a; g.add(b);
      }
    } else if (kind === "king" || kind === "queen") {
      g.add(lathe(T, [...BASE, [0.16, 0.7], [0.12, 1.2], [0.24, 1.26], [0.14, 1.32], [0.22, 1.5], [0, 1.56]], m.body));
      if (kind === "king") {
        const v = new T.Mesh(new T.BoxGeometry(0.08, 0.34, 0.08), m.gold); v.position.y = 1.72; g.add(v);
        const h = new T.Mesh(new T.BoxGeometry(0.24, 0.08, 0.08), m.gold); h.position.y = 1.76; g.add(h);
      } else {
        const ball = new T.Mesh(new T.SphereGeometry(0.09, 20, 14), m.gold); ball.position.y = 1.64; g.add(ball);
      }
      const ring = new T.Mesh(new T.TorusGeometry(0.17, 0.025, 10, 40), m.gold); ring.rotation.x = Math.PI / 2; ring.position.y = 1.26; g.add(ring);
    } else if (kind === "die") {
      g.add(new T.Mesh(new T.BoxGeometry(1, 1, 1, 1, 1, 1), m.body));
      const pip = new T.SphereGeometry(0.085, 14, 10);
      const faces = [[[0, 0]], [[-0.25, -0.25], [0.25, 0.25]], [[-0.25, -0.25], [0, 0], [0.25, 0.25]], [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]], [[-0.25, -0.25], [0.25, -0.25], [0, 0], [-0.25, 0.25], [0.25, 0.25]], [[-0.25, -0.27], [0.25, -0.27], [-0.25, 0], [0.25, 0], [-0.25, 0.27], [0.25, 0.27]]];
      // Per face [normal, horizontal axis, vertical axis] — the eye is a gold bead set .47 above the face
      const axes = [[[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 0, -1], [1, 0, 0], [0, 1, 0]]];
      faces.forEach((f, i) => f.forEach(([u, v]) => {
        const [n, tu, tv] = axes[i], p = new T.Mesh(pip, m.gold);
        p.position.set(n[0] * 0.47 + tu[0] * u + tv[0] * v, n[1] * 0.47 + tu[1] * u + tv[1] * v, n[2] * 0.47 + tu[2] * u + tv[2] * v);
        g.add(p);
      }));
    } else {
      const card = new T.Mesh(new T.BoxGeometry(1.1, 1.54, 0.03), [m.edge, m.edge, m.edge, m.edge, m.face, m.back]);
      g.add(card);
    }
    return g;
  };
  const cardBack = (T, ink, gold) => {
    const c = document.createElement("canvas"); c.width = 220; c.height = 308;
    const x = c.getContext("2d");
    x.fillStyle = ink; x.fillRect(0, 0, 220, 308);
    x.strokeStyle = gold; x.lineWidth = 6; x.strokeRect(14, 14, 192, 280);
    x.fillStyle = gold; x.beginPath(); x.moveTo(110, 110); x.lineTo(140, 154); x.lineTo(110, 198); x.lineTo(80, 154); x.closePath(); x.fill();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  };

  kfFx.register("float-pieces-3d", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const backBox = el.querySelector('[data-fx-part="back"]'), frontBox = el.querySelector('[data-fx-part="front"]');
    if (!T || !backBox || !frontBox) return;
    const css = getComputedStyle(el);
    const col = (k, f) => (css.getPropertyValue(k).trim() || f);
    // Reads only skin values — kf-defaults always fills them, and if empty falls back to the plate text color
    const ivory = new T.Color(col("--fx-ivory", col("--kf-ink", css.color)));
    const gold = new T.Color(col("--fx-gold", col("--kf-accent", css.color)));
    const ink = col("--kf-bg", css.color);
    // Cartoon-style three-step shading (brown outline on cream and gold pieces like the original art) — the outline is an inverted shell inflated along the normal
    const ramp = new T.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, T.RGBAFormat);
    ramp.minFilter = ramp.magFilter = T.NearestFilter; ramp.needsUpdate = true;
    const lineVar = col("--fx-line", "");
    const line = lineVar ? new T.Color(lineVar) : gold.clone().lerp(new T.Color(ink), 0.55).multiplyScalar(0.55);
    const std = (c) => new T.MeshToonMaterial({ color: c, gradientMap: ramp });
    const hull = new T.MeshBasicMaterial({ color: line, side: T.BackSide });
    const outline = (group, w) => group.traverse((o) => {
      if (!o.isMesh || o.userData.hull) return;
      const g = o.geometry.clone(), pos = g.attributes.position, nor = g.attributes.normal;
      for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) + nor.getX(i) * w, pos.getY(i) + nor.getY(i) * w, pos.getZ(i) + nor.getZ(i) * w);
      const h = new T.Mesh(g, hull); h.userData.hull = true; o.add(h);
    });
    const mats = {
      ivory: { body: std(ivory), gold: std(gold) },
      gilded: { body: std(gold), gold: std(ivory) },
    };
    const back = cardBack(T, ink, "#" + gold.getHexString());
    const cardMats = { face: std(ivory), back: new T.MeshToonMaterial({ map: back, gradientMap: ramp }), edge: std(gold) };
    const layer = (box) => {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      box.append(canvas);
      const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = T.SRGBColorSpace;
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 20);
      scene.add(new T.HemisphereLight(ivory, new T.Color(ink), 1.4));
      const key = new T.DirectionalLight(ivory, 2.2); key.position.set(-6, 9, 8); scene.add(key);
      const rim = new T.DirectionalLight(gold, 1.6); rim.position.set(6, 7, -12); scene.add(rim);
      return { canvas, renderer, scene, camera };
    };
    const L = { back: layer(backBox), front: layer(frontBox) };
    const a = Math.tan((15 * Math.PI) / 180);
    let unit = 1;
    const items = (options.look === "board" ? BOARD : SPEC).map((s, i) => {
      const m = s.make === "card" ? cardMats : s.gold ? mats.gilded : mats.ivory;
      const inner = build(T, s.make, m);
      outline(inner, s.make === "card" ? 0.02 : 0.03);
      if (s.flip) inner.rotation.y = Math.PI;
      const center = new T.Box3().setFromObject(inner).getCenter(new T.Vector3());
      inner.position.sub(center);
      const holder = new T.Group(); holder.add(inner);
      L[s.layer].scene.add(holder);
      return { s, holder, rest: new T.Quaternion().setFromEuler(new T.Euler(...s.tilt)), home: new T.Vector3(), from: new T.Vector3(), scale: 1,
        phase: 1.7 * i, intro: reduce ? 1 : 0, turns: (i % 2 ? -1 : 1) * TAU * (s.layer === "front" ? 1 : 2), tumble: 0, spin: 0, yaw: 0, yawSpeed: 0, hover: 0, hop: 0 };
    });
    const place = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1, r = w / h;
      for (const k of ["back", "front"]) { L[k].renderer.setSize(w, h, false); L[k].camera.aspect = r; L[k].camera.updateProjectionMatrix(); }
      unit = (40 * a * r) / 10;
      for (const it of items) {
        const { at, depth, size, layer } = it.s, l = (20 - depth) * a;
        it.home.set((at[0] - 0.5) * 2 * l * r, (0.5 - at[1]) * 2 * l, depth);
        it.scale = size * unit;
        if (layer === "back") it.from.set(0.45 * it.home.x, 0.6 * it.home.y - 0.4 * unit, depth - 5);
        else it.from.set(1.8 * it.home.x, 1.4 * it.home.y - 2 * unit, depth + 9);
      }
    };
    place();
    const ro = new ResizeObserver(place); ro.observe(el);
    const cam = new T.Vector2(), want = new T.Vector2(), ray = new T.Raycaster(), ndc = new T.Vector2();
    const ax = new T.Vector3(1, 0, 0), ay = new T.Vector3(0, 1, 0), qa = new T.Quaternion(), qb = new T.Quaternion(), lift = new T.Vector3();
    let over = null, clock = 0, scrollP = 0, last = 0;
    const pick = (e) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      for (const k of ["front", "back"]) {
        ray.setFromCamera(ndc, L[k].camera);
        const live = items.filter((it) => it.s.layer === k && it.intro > 0.6);
        const [hit] = ray.intersectObjects(live.map((it) => it.holder), true);
        if (hit) return live.find((it) => { let o = hit.object; while (o && o !== it.holder) o = o.parent; return o === it.holder; }) || null;
      }
      return null;
    };
    const onWin = (e) => want.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const onMove = (e) => { if (e.pointerType === "mouse") { over = pick(e); el.style.cursor = over ? "pointer" : ""; } };
    const onLeave = () => { over = null; el.style.cursor = ""; };
    const onDown = (e) => {
      const it = pick(e); if (!it) return;
      const d = Math.random() < 0.5 ? 1 : -1;
      it.spin += d * (it.s.snap === TAU ? 15 : 19); it.yawSpeed += -5 * d;
      gsap.fromTo(it, { hop: 0 }, { hop: 1, duration: 0.32, ease: "power2.out", yoyo: true, repeat: 1, overwrite: true });
    };
    const frame = () => {
      const now = performance.now() / 1000, dt = last ? Math.min(0.1, Math.max(0.001, now - last)) : 0.016;
      last = now;
      if (!reduce) clock += dt;
      cam.lerp(want, 1 - Math.exp(-2.8 * dt));
      for (const k of ["back", "front"]) { L[k].camera.position.set(1.4 * cam.x, -0.8 * cam.y, 20); L[k].camera.lookAt(0, 0, 0); }
      for (const it of items) {
        it.hover += ((over === it ? 1 : 0) - it.hover) * (1 - Math.exp(-8 * dt));
        it.tumble += it.spin * dt; it.spin *= Math.exp(-2.2 * dt);
        if (Math.abs(it.spin) < 2.5) { const to = Math.round(it.tumble / it.s.snap) * it.s.snap; it.tumble += (to - it.tumble) * (1 - Math.exp(-6 * dt)); it.spin *= Math.exp(-5 * dt); }
        it.yawSpeed *= Math.exp(-1.6 * dt); it.yaw += (it.s.drift + it.yawSpeed) * dt;
        const par = it.s.layer === "front" ? 1.6 + 0.7 * it.s.depth : -0.35;
        it.holder.position.lerpVectors(it.from, it.home, it.intro).add(lift.set(0, Math.sin(0.7 * clock + it.phase) * unit * 0.07 + it.hop * unit * 0.45 + scrollP * par * unit, 0));
        it.holder.scale.setScalar(Math.max(it.scale * it.intro * (1 + 0.08 * it.hover), 1e-4));
        it.holder.visible = it.intro > 0.001;
        const sway = 0.06 * Math.sin(0.5 * clock + it.phase) + 0.18 * it.hover;
        qa.setFromAxisAngle(ax, it.tumble + (1 - it.intro) * it.turns + sway);
        qb.setFromAxisAngle(ay, it.yaw + scrollP * it.s.drift * 14);
        it.holder.quaternion.copy(it.rest).multiply(qa).multiply(qb);
      }
      L.back.renderer.render(L.back.scene, L.back.camera);
      L.front.renderer.render(L.front.scene, L.front.camera);
    };
    let seen = true;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { rootMargin: "10% 0px" });
    io.observe(el);
    const tick = () => { if (seen) frame(); };
    gsap.ticker.add(tick);
    const st = window.ScrollTrigger ? ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top", onUpdate: (s) => (scrollP = reduce ? 0 : s.progress) }) : null;
    // Entrance: back layer 1 + .09·i seconds, front layer 1.15 + .07·i seconds late, 2.6s expo.out — the delay option syncs it with the Hero intro
    const delay = +(options.delay ?? 0);
    const intro = reduce ? [] : items.map((it, i) => gsap.to(it, { intro: 1, duration: +(options.dur ?? 2.6), delay: delay + (it.s.layer === "back" ? 1 + 0.09 * i : 1.15 + 0.07 * i), ease: "expo.out" }));
    if (!reduce) {
      addEventListener("pointermove", onWin);
      el.addEventListener("pointerdown", onDown);
      if (hover) { el.addEventListener("pointermove", onMove); el.addEventListener("pointerleave", onLeave); }
    }
    return () => {
      gsap.ticker.remove(tick); io.disconnect(); ro.disconnect(); st?.kill(); intro.forEach((t) => t.kill());
      removeEventListener("pointermove", onWin);
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      el.style.cursor = "";
      for (const k of ["back", "front"]) { L[k].renderer.dispose(); L[k].canvas.remove(); }
      back.dispose();
    };
  });
})();
