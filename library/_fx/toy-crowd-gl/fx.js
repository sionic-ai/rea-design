(() => {
  // A toy crowd walking on a paper floor (our basic shapes — capsule body, ball head, stick limbs, ink-colored outline) and a giant’s two legs standing at one end.
  // Each person walks to its own destination and stops, pairs meet to chat, and every 2.4~5.2 seconds a coin pops up above the head. A speech bubble (DOM) floats above the head.
  // The camera follows the original Brand hero formula exactly — on a 16 second cycle it moves between far (distance 64 · height 35) and near (13 · 4.4) while orbiting at .08rad per second.
  // On fx:play it moves to the play viewpoint (0,43,54 → 0,2,−3) in 1.5s, and on fx:title it spins again.
  const T = () => window.THREE;
  const rand = (a, b) => a + Math.random() * (b - a);
  const smooth = (t) => t * t * (3 - 2 * t);

  // Paints the skin variable (any color syntax) onto a canvas and reads it back as a three color
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const colorOf = (el, name) => {
    const cs = getComputedStyle(el);
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = cs.color;
    probe.fillStyle = cs.getPropertyValue(name).trim() || cs.color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return new (T().Color)().setRGB(r / 255, g / 255, b / 255, T().SRGBColorSpace);
  };

  kfFx.register("toy-crowd-gl", (el, { options, reduce }) => {
    const THREE = T();
    if (!THREE) return;
    const narrow = () => el.clientWidth < 820;
    const count = Math.max(1, Math.round(+(narrow() ? options["count-narrow"] ?? 26 : options.count ?? 48)));
    const spin = +(options.spin ?? 0.08), cycle = +(options.cycle ?? 16) || 16, handover = +(options.handover ?? 1.5);
    const [wideDist, wideHigh] = String(options.wide ?? "64,35").split(",").map(Number);
    const [closeDist, closeHigh] = String(options.close ?? "13,4.4").split(",").map(Number);
    const fov = +(options.fov ?? 34) || 34, designAspect = 1.4, maxFov = 58;
    const radius = +(options.radius ?? 27) || 27, noticed = Math.round(+(options.noticed ?? 2));
    const lines = String(options.lines ?? "Um|Right|As usual|It’s fine|What?|Anyway|So—|Okay").split("|");
    const shouts = String(options.shouts ?? "Oh!|Over there!").split("|");
    const giantOn = options.giant !== "off", coinsOn = options.coins !== "off";

    let renderer;
    try {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.setAttribute("data-fx-part", "canvas");
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, narrow() ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.prepend(renderer.domElement);
    let layer = el.querySelector('[data-fx-part="bubbles"]');
    const madeLayer = !layer;
    if (madeLayer) { layer = document.createElement("div"); layer.setAttribute("data-fx-part", "bubbles"); el.append(layer); }

    const paper = colorOf(el, "--kf-bg"), ink = colorOf(el, "--kf-ink");
    const white = colorOf(el, "--kf-surface"), dark = colorOf(el, "--kf-ink-soft"), notice = colorOf(el, "--kf-accent");
    const scene = new THREE.Scene();
    scene.background = paper;
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.5, 600);
    // Intensity tuned so the bright face stays pure white and the two shaded cells become .88 and .77 (physical lighting, so divided by π)
    scene.add(new THREE.AmbientLight(0xffffff, 1.32));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(-0.55, 1, 0.42);
    scene.add(sun);

    // Three-tone shading — white on the light side, two steps of pale gray on the shadow side (face division of hand-drawn comics)
    const ramp = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1);
    ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
    ramp.needsUpdate = true;
    const toon = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: ramp });
    // Dark outline — push the face toward its normal and paint only the back side (inverted shell)
    const outline = (w) => {
      const m = new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide });
      m.onBeforeCompile = (s) => {
        s.uniforms.uOut = { value: w };
        s.vertexShader = "uniform float uOut;\n" + s.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = position + normal * uOut;");
      };
      return m;
    };
    const owned = [];
    const keep = (x) => (owned.push(x), x);

    // Floor + round shadow
    const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(800, 800)), keep(new THREE.MeshBasicMaterial({ color: paper })));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    // The round shadow is an alpha-only plate: smooth from 1 at the center to 0 at the edge (the color is the material’s ink color)
    const blobPx = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const d = Math.min(1, Math.hypot(x - 31.5, y - 31.5) / 32), i = (y * 64 + x) * 4;
      blobPx[i] = blobPx[i + 1] = blobPx[i + 2] = 255;
      blobPx[i + 3] = Math.round(255 * (1 - smooth(d)));
    }
    const blobTex = keep(new THREE.DataTexture(blobPx, 64, 64));
    blobTex.needsUpdate = true;
    const blobMat = keep(new THREE.MeshBasicMaterial({ map: blobTex, color: ink, transparent: true, opacity: 0.17, depthWrite: false }));
    const blobGeo = keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));

    // ── People: one InstancedMesh per body part (one silhouette) ──
    const geo = {
      body: keep(new THREE.CapsuleGeometry(0.33, 0.38, 6, 16)),
      head: keep(new THREE.SphereGeometry(0.31, 20, 14)),
      leg: keep(new THREE.CapsuleGeometry(0.1, 0.3, 4, 10).translate(0, -0.25, 0)),
      arm: keep(new THREE.CapsuleGeometry(0.075, 0.32, 4, 10).translate(0, -0.23, 0)),
      eye: keep(new THREE.SphereGeometry(0.036, 8, 6)),
      brim: keep(new THREE.CylinderGeometry(0.4, 0.4, 0.035, 22)),
      crown: keep(new THREE.CylinderGeometry(0.22, 0.26, 0.2, 18)),
    };
    const skin = keep(toon(0xffffff));
    const capMat = keep(toon(dark));
    const eyeMat = keep(new THREE.MeshBasicMaterial({ color: ink }));
    const lineThin = keep(outline(0.05));
    const parts = {};
    const instanced = (name, g, mat, n, line) => {
      const m = new THREE.InstancedMesh(g, mat, n);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      scene.add(m);
      parts[name] = m;
      if (line) { const o = new THREE.InstancedMesh(g, line, n); o.instanceMatrix = m.instanceMatrix; o.frustumCulled = false; scene.add(o); }
      return m;
    };
    instanced("body", geo.body, skin, count, lineThin);
    instanced("head", geo.head, skin, count, lineThin);
    instanced("leg", geo.leg, skin, count * 2, lineThin);
    instanced("arm", geo.arm, skin, count * 2, lineThin);
    instanced("eye", geo.eye, eyeMat, count * 2);
    instanced("brim", geo.brim, capMat, count, lineThin);
    instanced("crown", geo.crown, capMat, count, lineThin);
    const blobs = new THREE.InstancedMesh(blobGeo, blobMat, count + 2);
    blobs.frustumCulled = false;
    scene.add(blobs);

    // Giant — two legs (trouser cylinder · folded hem · shoe) stand at the world’s edge (0, −26), sway and occasionally shift weight
    const giant = new THREE.Group();
    const legPosts = [];
    const giantLegs = [];
    if (giantOn) {
      giant.position.set(0, 0, -26);
      giant.rotation.y = 0.14;
      scene.add(giant);
      // A giant 25 times a person’s height (1.9) — trouser radius 4.6, shoe length 13.8 (seven person lengths)
      const pant = keep(new THREE.CylinderGeometry(4.6, 4.2, 46, 32)), cuff = keep(new THREE.CylinderGeometry(4.5, 4.5, 1.6, 32));
      const shoe = keep(new THREE.CapsuleGeometry(3.1, 7.6, 8, 28));
      const giantSkin = keep(toon(0xffffff)), giantLine = keep(outline(0.2));
      for (const side of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(side * 7.6, 2.4, side < 0 ? 1.2 : -0.8);
        const add = (g, x, y, z, rx = 0, sx = 1, sy = 1, sz = 1) => {
          for (const m of [giantSkin, giantLine]) {
            const mesh = new THREE.Mesh(g, m);
            mesh.position.set(x, y, z);
            mesh.rotation.x = rx;
            mesh.scale.set(sx, sy, sz);
            pivot.add(mesh);
          }
        };
        add(pant, 0, 23.6, 0);
        add(cuff, 0, 1.1, 0);
        add(shoe, 0, -0.6, 3.6, Math.PI / 2, 1.1, 1, 0.62);
        giant.add(pivot);
        giantLegs.push(pivot);
      }
      for (const side of [-1, 1]) {
        const p = new THREE.Vector3(side * 7.6, 0, side < 0 ? 1.2 : -0.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.14).add(giant.position);
        legPosts.push({ x: p.x, z: p.z, r: 4.7 });
      }
    }

    // Coin — rises above the head, spins, then shrinks away
    const coinCap = coinsOn ? 96 : 1;
    const coinGeo = keep(new THREE.CylinderGeometry(0.28, 0.28, 0.07, 26).rotateX(Math.PI / 2));
    const ringGeo = keep(new THREE.TorusGeometry(0.17, 0.018, 6, 26));
    instanced("coin", coinGeo, skin, coinCap, keep(outline(0.022)));
    instanced("ring", ringGeo, eyeMat, coinCap * 2);
    const coins = [];

    // ── Person State ──
    const pocket = { x: giantOn ? 0 : 999, z: -24, r: 13 };
    const spot = () => {
      for (let i = 0; i < 40; i++) {
        const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * radius;
        const x = Math.cos(a) * d, z = Math.sin(a) * d;
        if (Math.hypot(x - pocket.x, z - pocket.z) > pocket.r) return { x, z };
      }
      return { x: 0, z: 0 };
    };
    const agents = [];
    for (let i = 0; i < count; i++) {
      const p = spot();
      agents.push({
        x: p.x, z: p.z, vx: 0, vz: 0, head: Math.random() * Math.PI * 2, scale: rand(0.9, 1.12), speed: rand(1.05, 1.65),
        target: spot(), state: "walk", until: 0, phase: Math.random() * 6, mate: null,
        hat: i % 3 === 0, shirt: i % 3 === 1, noticed: i < noticed, look: 0, pay: rand(0.5, 5.2), talk: 0,
      });
    }
    for (let i = 0; i < count; i++) {
      const a = agents[i];
      parts.body.setColorAt(i, a.noticed ? notice : a.shirt ? dark : white);
      parts.head.setColorAt(i, a.noticed ? notice : white);
      for (const k of [0, 1]) { parts.leg.setColorAt(i * 2 + k, a.noticed ? notice : white); parts.arm.setColorAt(i * 2 + k, a.noticed ? notice : white); }
    }
    for (const n of ["body", "head", "leg", "arm"]) parts[n].instanceColor.needsUpdate = true;

    const M = new THREE.Matrix4(), L = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
    const local = (x, y, z, rx = 0, ry = 0, rz = 0, s = 1) => L.compose(V.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), S.set(s, s, s));
    const put = (mesh, i, base, l) => { M.multiplyMatrices(base, l); mesh.setMatrixAt(i, M); };
    const base = new THREE.Matrix4();

    const think = (a, now) => {
      if (Math.random() < 0.3) {
        const b = agents.find((o) => o !== a && o.state === "walk" && Math.hypot(o.x - a.x, o.z - a.z) < 7);
        if (b) {
          const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, ang = Math.atan2(b.z - a.z, b.x - a.x);
          a.target = { x: mx - Math.cos(ang) * 0.55, z: mz - Math.sin(ang) * 0.55 };
          b.target = { x: mx + Math.cos(ang) * 0.55, z: mz + Math.sin(ang) * 0.55 };
          a.state = b.state = "meet";
          a.mate = b; b.mate = a;
          return;
        }
      }
      a.target = spot();
      a.state = "walk";
    };
    const step = (dt, now) => {
      for (const a of agents) {
        if (a.state === "chat" || a.state === "loiter") {
          if (now > a.until) { if (a.mate) { a.mate.mate = null; a.mate.state === "chat" && think(a.mate, now); } a.mate = null; think(a, now); }
          a.vx *= 0.8; a.vz *= 0.8;
        } else {
          const dx = a.target.x - a.x, dz = a.target.z - a.z, d = Math.hypot(dx, dz);
          if (d < 1.1) {
            if (a.state === "meet" && a.mate) {
              a.state = "chat";
              a.until = now + rand(7, 26);
              if (a.mate.state === "chat") a.until = a.mate.until;
            } else if (a.state === "meet") think(a, now);
            else if (Math.random() < 0.12) { a.state = "loiter"; a.until = now + rand(2, 6.5); }
            else think(a, now);
          }
          let fx = (dx / (d || 1)) * a.speed - a.vx, fz = (dz / (d || 1)) * a.speed - a.vz;
          for (const b of agents) {
            if (b === a) continue;
            const ox = a.x - b.x, oz = a.z - b.z, od = Math.hypot(ox, oz);
            if (od > 0 && od < 1.55) { const k = (5.2 * (1 - od / 1.55)) / od; fx += ox * k; fz += oz * k; }
          }
          const fl = Math.hypot(fx, fz), cap = 9;
          if (fl > cap) { fx *= cap / fl; fz *= cap / fl; }
          a.vx += fx * dt; a.vz += fz * dt;
          const sp = Math.hypot(a.vx, a.vz);
          if (sp > a.speed) { a.vx *= a.speed / sp; a.vz *= a.speed / sp; }
        }
        a.x += a.vx * dt; a.z += a.vz * dt;
        const pd = Math.hypot(a.x - pocket.x, a.z - pocket.z);
        if (pd > 0 && pd < pocket.r) { a.x = pocket.x + ((a.x - pocket.x) / pd) * pocket.r; a.z = pocket.z + ((a.z - pocket.z) / pd) * pocket.r; }
        const sp = Math.hypot(a.vx, a.vz);
        let want = a.head;
        if (a.state === "chat" && a.mate) want = Math.atan2(a.mate.x - a.x, a.mate.z - a.z);
        else if (sp > 0.15) want = Math.atan2(a.vx, a.vz);
        let dh = ((want - a.head + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        a.head += Math.max(-7.5 * dt, Math.min(7.5 * dt, dh));
        a.phase += sp * dt * 4.2;
        a.look += ((a.noticed ? 1 : 0) - a.look) * Math.min(1, dt * 3);
        if (coinsOn && (a.pay -= dt) <= 0) {
          a.pay = rand(2.4, 5.2);
          if (coins.length < coinCap) coins.push({ x: a.x, y: 1.95 * a.scale + 0.35, z: a.z, t: 0, spin: Math.random() * 6 });
        }
      }
    };
    const pose = () => {
      agents.forEach((a, i) => {
        const sp = Math.min(1, Math.hypot(a.vx, a.vz) / 1.2);
        const swing = Math.sin(a.phase) * 0.55 * sp, bob = Math.abs(Math.cos(a.phase)) * 0.05 * sp;
        base.compose(V.set(a.x, bob, a.z), Q.setFromEuler(E.set(0, a.head, 0)), S.set(a.scale, a.scale, a.scale));
        put(parts.body, i, base, local(0, 0.98, 0, 0, 0, 0));
        const tilt = -0.42 * a.look;
        put(parts.head, i, base, local(0, 1.62, 0, tilt));
        put(parts.leg, i * 2, base, local(-0.13, 0.52, 0, swing));
        put(parts.leg, i * 2 + 1, base, local(0.13, 0.52, 0, -swing));
        put(parts.arm, i * 2, base, local(-0.35, 1.2, 0, -swing * 0.8, 0, -0.14));
        put(parts.arm, i * 2 + 1, base, local(0.35, 1.2, 0, swing * 0.8, 0, 0.14));
        // Eyes and hat lift with the head — placed at the same angle rotated around the head’s center axis
        const c = Math.cos(tilt), sn = Math.sin(tilt);
        const onHead = (x, oy, oz) => local(x, 1.62 + oy * c - oz * sn, oy * sn + oz * c, tilt);
        put(parts.eye, i * 2, base, onHead(-0.1, 0.04, 0.285));
        put(parts.eye, i * 2 + 1, base, onHead(0.1, 0.04, 0.285));
        if (a.hat) {
          put(parts.brim, i, base, onHead(0, 0.26, 0.02));
          put(parts.crown, i, base, onHead(0, 0.37, 0));
        } else { parts.brim.setMatrixAt(i, ZERO); parts.crown.setMatrixAt(i, ZERO); }
        blobs.setMatrixAt(i, L.compose(V.set(a.x, 0.02, a.z), Q.identity(), S.set(1.32 * a.scale, 1, 1.32 * a.scale)));
      });
      giantLegs.forEach((leg, k) => {
        const p = new THREE.Vector3();
        leg.getWorldPosition(p);
        blobs.setMatrixAt(count + k, L.compose(V.set(p.x, 0.03, p.z + 3.2), Q.identity(), S.set(12, 1, 19)));
      });
      for (const n of ["body", "head", "leg", "arm", "eye", "brim", "crown"]) parts[n].instanceMatrix.needsUpdate = true;
      blobs.instanceMatrix.needsUpdate = true;
    };
    let shift = 0, shiftFrom = 0, shiftTo = 0, shiftAt = 0, nextShift = rand(6, 13);
    const sway = (t) => {
      if (!giantOn) return;
      if (t > nextShift) { shiftFrom = shift; shiftTo = rand(-1.1, 1.1); shiftAt = t; nextShift = t + rand(6, 13); }
      shift = shiftFrom + (shiftTo - shiftFrom) * smooth(Math.min(1, (t - shiftAt) / 1.8));
      const lean = 0.009 * Math.sin(t * 0.21 * Math.PI * 2) + shift / 46;
      for (const leg of giantLegs) { leg.rotation.z = lean; leg.position.y = 2.4 + 0.05 * Math.sin(t * 0.42 * Math.PI * 2); }
    };
    const flyCoins = (dt) => {
      if (!coinsOn) return;
      for (let i = coins.length - 1; i >= 0; i--) { const c = coins[i]; c.t += dt / 1.45; if (c.t >= 1) coins.splice(i, 1); }
      for (let i = 0; i < coinCap; i++) {
        const c = coins[i];
        if (!c) { parts.coin.setMatrixAt(i, ZERO); parts.ring.setMatrixAt(i * 2, ZERO); parts.ring.setMatrixAt(i * 2 + 1, ZERO); continue; }
        const rise = 1 - (1 - c.t) * (1 - c.t), s = Math.min(1, c.t / 0.12) * Math.min(1, (1 - c.t) / 0.25);
        base.compose(V.set(c.x, c.y + rise * 3.6, c.z), Q.setFromEuler(E.set(0, c.spin + c.t * 1.45 * 7, 0)), S.set(s, s, s));
        parts.coin.setMatrixAt(i, base);
        put(parts.ring, i * 2, base, local(0, 0, 0.04));
        put(parts.ring, i * 2 + 1, base, local(0, 0, -0.04));
      }
      parts.coin.instanceMatrix.needsUpdate = true;
      parts.ring.instanceMatrix.needsUpdate = true;
    };

    // ── Speech bubbles — like the original, builds a fixed set (17) and reuses them (only toggling on and off) ──
    const pool = Array.from({ length: 17 }, () => {
      const b = document.createElement("div");
      b.setAttribute("data-fx-part", "bubble");
      // Always the same leading name — so the bubble reads as the same speech bubble even when on/shout markers attach and detach (both the measuring tool and the writer-side css)
      b.className = "fx-say";
      b.innerHTML = `<span></span><svg viewBox="0 0 18 14" aria-hidden="true"><path class="fx-tail-fill" d="M0 -1 L18 -1 L9 12.5 Z"/><path class="fx-tail-line" d="M2.5 0 L9 12 L15.5 0"/></svg>`;
      layer.append(b);
      return { el: b, who: null, until: 0 };
    });
    const bubbles = [];
    const say = (now) => {
      if (bubbles.length >= 6) return;
      const slot = pool.find((p) => !p.who && now > p.until + 0.2);
      if (!slot) return;
      const free = agents.filter((a) => !a.bubble);
      if (!free.length) return;
      const talkers = free.filter((a) => a.state === "chat");
      const from = talkers.length && Math.random() < 0.7 ? talkers : free;
      const a = from[Math.floor(Math.random() * from.length)];
      const shout = Math.random() < 1 / 7, words = shout ? shouts : lines;
      slot.el.classList.toggle("is-shout", shout);
      slot.el.firstChild.textContent = words[Math.floor(Math.random() * words.length)];
      slot.who = a;
      slot.until = now + rand(2.2, 3.6);
      a.bubble = slot;
      bubbles.push(a);
    };
    const W = new THREE.Vector3();
    const placeBubbles = (now) => {
      const w = el.clientWidth, h = el.clientHeight;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const a = bubbles[i], bb = a.bubble;
        if (now > bb.until) { bb.el.classList.remove("is-visible"); bb.who = null; a.bubble = null; bubbles.splice(i, 1); continue; }
        W.set(a.x, 2.05 * a.scale + 0.25, a.z).project(camera);
        const off = W.z > 1 || W.x < -1.1 || W.x > 1.1 || W.y < -1.1 || W.y > 1.1;
        bb.el.style.left = `${((W.x + 1) / 2) * w}px`;
        bb.el.style.top = `${((1 - W.y) / 2) * h}px`;
        bb.el.classList.toggle("is-visible", !off);
      }
    };

    // ── Camera ──
    const focus = new THREE.Vector3(0, 1.6, 0), aim = new THREE.Vector3(0, 1.6, 0), lookAt = new THREE.Vector3();
    const playPos = new THREE.Vector3(0, 43, 54), playAim = new THREE.Vector3(0, 2, -3);
    const fromPos = new THREE.Vector3(), fromAim = new THREE.Vector3();
    let clock = 0, closeUp = false, mode = "title", handT = 0;
    const centroid = (v) => {
      let x = 0, z = 0;
      for (const a of agents) { x += a.x; z += a.z; }
      return v.set(x / agents.length, 1.7, z / agents.length);
    };
    centroid(aim);
    focus.copy(aim);
    const keepClear = () => {
      for (const p of legPosts) {
        const dx = camera.position.x - p.x, dz = camera.position.z - p.z, d = Math.hypot(dx, dz), min = p.r + 3.4;
        if (d < min) { camera.position.x = p.x + (d ? dx / d : 1) * min; camera.position.z = p.z + (d ? dz / d : 0) * min; }
      }
    };
    const titleCam = (dt) => {
      clock += dt;
      const e = 0.5 - 0.5 * Math.cos((clock / cycle) * Math.PI * 2);
      if (e > 0.5 && !closeUp) { closeUp = true; const a = agents[Math.floor(Math.random() * agents.length)]; aim.set(a.x, 1.95 * a.scale * 0.72, a.z); }
      else if (e < 0.5 && closeUp) { closeUp = false; centroid(aim); }
      focus.lerp(aim, Math.min(1, dt * 1.2));
      const n = clock * spin, dist = wideDist + (closeDist - wideDist) * e, high = wideHigh + (closeHigh - wideHigh) * e;
      camera.position.set(focus.x + Math.sin(n) * dist, high, focus.z + Math.cos(n) * dist);
      keepClear();
      camera.lookAt(focus);
      lookAt.copy(focus);
    };
    const playCam = (dt) => {
      handT = Math.min(1, handT + dt / Math.max(0.001, handover));
      const k = smooth(handT);
      camera.position.lerpVectors(fromPos, playPos, k);
      lookAt.lerpVectors(fromAim, playAim, k);
      camera.lookAt(lookAt);
    };
    const onPlay = () => { if (mode === "play") return; mode = "play"; handT = 0; fromPos.copy(camera.position); fromAim.copy(lookAt); };
    const onTitle = () => { mode = "title"; };
    // Hero orbit from the start (far away · center of the crowd) — fired when the loading curtain lifts so, like the original, the 16-second period counts from the moment the scene becomes visible
    const onRestart = () => { clock = 0; closeUp = false; centroid(aim); focus.copy(aim); };
    el.addEventListener("fx:play", onPlay);
    el.addEventListener("fx:title", onTitle);
    el.addEventListener("fx:restart", onRestart);

    const fit = () => {
      const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight), aspect = w / h;
      renderer.setSize(w, h, false);
      camera.aspect = aspect;
      // On tall narrow screens, widen the field of view (up to 58°) so the horizontal visible width matches wide screens (aspect 1.4)
      camera.fov = aspect >= designAspect ? fov : Math.min(maxFov, (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * (designAspect / aspect)) * 180) / Math.PI);
      camera.updateProjectionMatrix();
      if (reduce) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();

    let raf = 0, last = performance.now(), seen = true, sayAt = 0, t = 0;
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen && !raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } });
    io.observe(el);
    function frame(now) {
      raf = 0;
      if (!seen) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      t += dt;
      step(dt, t);
      pose();
      sway(t);
      flyCoins(dt);
      if (mode === "title") titleCam(dt); else playCam(dt);
      if (t > sayAt) { say(t); sayAt = t + rand(0.35, 0.8); }
      placeBubbles(t);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    // After building all scenes it draws the first section right away and fires fx:ready — like the original, the loading cover starts lifting before the frame runs.
    // With reduced motion, only this one frame remains with the person standing (fit redraws when the window is resized)
    pose(); flyCoins(0); titleCam(reduce ? cycle * 0.25 : 0.001); renderer.render(scene, camera);
    queueMicrotask(() => el.dispatchEvent(new CustomEvent("fx:ready")));
    if (!reduce) raf = requestAnimationFrame(frame);

    function cleanup() {
      el.removeEventListener("fx:play", onPlay);
      el.removeEventListener("fx:title", onTitle);
      el.removeEventListener("fx:restart", onRestart);
      for (const p of pool) p.el.remove();
      if (madeLayer) layer.remove();
      scene.traverse((o) => { if (o.isInstancedMesh) o.dispose?.(); });
      owned.forEach((x) => x.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); cleanup(); };
  });
})();
