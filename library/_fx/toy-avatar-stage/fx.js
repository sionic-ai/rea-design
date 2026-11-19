// A basic shape doll (3-step toon material + outline) stands in the panel, breathing and continuing its actions — pressing an action button spins it once in 1s (power2.inOut) while
// With that motion, a 1s cross-fade, the three decorations (pyramid · box · twisted tube) vanish in .5s and return in 1s on a new orbit. Pressing the panel gives a different motion + the decorations spin over a full turn.
// The camera shifts by .001 per ms following the cursor. Rebuilt with the same keys and proportions in place of the original’s VRM avatar.
(() => {
  const POSES = {
    idle: (t) => ({ cx: Math.sin(t * 2.2) * 0.02, laz: 0.18, raz: -0.18, lex: -0.2, rex: -0.2, nz: Math.sin(t * 1.2) * 0.08, hz: Math.sin(t * 1.2) * 0.03 }),
    wave: (t) => ({ hz: 0.05, nz: -0.12, raz: -2.6 + Math.sin(t * 9) * 0.25, rex: -0.3, ray: 0.3, laz: 0.2, lex: -0.4 }),
    draw: (t) => ({ lax: -1.0, lex: -0.9, lay: 0.4, laz: 0.2, rax: -1.15 + Math.sin(t * 6) * 0.06, rex: -1.1 + Math.cos(t * 6) * 0.1, ray: -0.3, nx: 0.2 }),
    sing: (t) => ({ hy: Math.abs(Math.sin(t * 4)) * 0.02, rax: -0.7, rex: -2.0, ray: -0.4, raz: -0.25, laz: 1.0 + Math.sin(t * 2) * 0.2, nx: -0.15 }),
    dance: (t) => ({ hy: Math.abs(Math.sin(t * 4)) * 0.04, hz: Math.sin(t * 4) * 0.06, laz: 2.4 + Math.sin(t * 4) * 0.3, raz: -2.4 + Math.sin(t * 4) * 0.3, lkx: 0.25 + Math.sin(t * 4) * 0.15, rkx: 0.25 - Math.sin(t * 4) * 0.15 }),
    type: (t) => ({ lax: -0.8, rax: -0.8, lex: -1.0 + Math.sin(t * 14) * 0.08, rex: -1.0 + Math.cos(t * 14) * 0.08, laz: 0.3, raz: -0.3, nx: 0.25 }),
    think: (t) => ({ rax: -1.4, rex: -2.3, ray: -0.6, lax: -0.6, lex: -1.5, lay: 0.6, nz: 0.18 + Math.sin(t) * 0.04 }),
    open: (t) => ({ lax: -0.9, rax: -0.9, laz: 0.55 + Math.sin(t * 1.3) * 0.06, raz: -0.55 - Math.sin(t * 1.3) * 0.06, lex: -0.5, rex: -0.5, nz: Math.sin(t * 1.3) * 0.08 }),
    cheer: (t) => ({ hy: Math.max(0, Math.sin(t * 5)) * 0.06, laz: 2.5, raz: -2.5, lex: -0.4, rex: -0.4, lkx: Math.max(0, Math.sin(t * 5)) * 0.5, rkx: Math.max(0, Math.sin(t * 5)) * 0.5 }),
  };
  const KEYS = ["hy", "hz", "cx", "nx", "ny", "nz", "lax", "lay", "laz", "lex", "rax", "ray", "raz", "rex", "lkx", "rkx"];
  const full = (o) => { const p = {}; KEYS.forEach((k) => (p[k] = o[k] ?? (k === "laz" ? 0.12 : k === "raz" ? -0.12 : 0))); return p; };

  kfFx.register("toy-avatar-stage", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    const view = options.view || "bust";
    const follow = (options.cursor || "on") !== "off";
    const spinDur = +(options.spin ?? 1);
    const order = String(options.poses || "idle wave draw sing dance type think cheer").split(/\s+/).filter((k) => POSES[k]);
    if (!order.length) return;

    // Skin → color (painted in one canvas cell to get sRGB)
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.canvas.width = probe.canvas.height = 1;
    const tint = document.createElement("i");
    tint.style.display = "none";
    el.append(tint);
    const col = (v) => {
      tint.style.color = `var(${v})`;
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = getComputedStyle(tint).color;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
    };
    const accent = col("--kf-accent"), surface = col("--kf-surface"), ink = col("--kf-ink"), soft = col("--kf-accent-soft");
    const hsl = accent.getHSL({});
    const lilac = new T.Color().setHSL((hsl.h + 0.94) % 1, hsl.s * 0.8, hsl.l * 0.92);
    const sky = new T.Color().setHSL((hsl.h + 0.62) % 1, hsl.s * 0.6, Math.min(0.8, hsl.l + 0.05));
    const skin = surface.clone().lerp(accent, 0.14);

    const canvas = el.querySelector('[data-fx-part="canvas"]') || el.appendChild(document.createElement("canvas"));
    const made = !canvas.hasAttribute("data-fx-part");
    canvas.style.display = "block";
    canvas.style.width = canvas.style.height = "100%";
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    scene.add(new T.AmbientLight(surface, 1.6));
    const sun = new T.DirectionalLight(surface, 2.2);
    sun.position.set(1.5, 2.5, 3);
    scene.add(sun);
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    const rig = new T.Group();
    rig.add(camera);
    scene.add(rig);

    const ramp = new T.DataTexture(new Uint8Array([150, 205, 255]), 3, 1, T.RedFormat);
    ramp.minFilter = ramp.magFilter = T.NearestFilter;
    ramp.needsUpdate = true;
    const mats = [];
    const toon = (c, side) => { const m = new T.MeshToonMaterial({ color: c, gradientMap: ramp, side: side || T.FrontSide }); mats.push(m); return m; };
    const line = new T.MeshBasicMaterial({ color: ink.clone().lerp(accent, 0.35), side: T.BackSide });
    mats.push(line);
    const geos = [];
    const add = (parent, geo, mat, pos, scale, rot, outline = true) => {
      geos.push(geo);
      const m = new T.Mesh(geo, mat);
      if (pos) m.position.set(...pos);
      if (scale) m.scale.set(...scale);
      if (rot) m.rotation.set(...rot);
      parent.add(m);
      if (outline) { const o = new T.Mesh(geo, line); o.scale.setScalar(1.04); m.add(o); }
      return m;
    };
    const joint = (parent, pos) => { const g = new T.Group(); g.position.set(...pos); parent.add(g); return g; };

    // Height 1.62 — hips .86, head radius .118 (6.5 heads tall)
    const doll = new T.Group();
    const hips = joint(doll, [0, 0.86, 0]);
    add(hips, new T.CylinderGeometry(0.1, 0.3, 0.3, 40, 1, true), toon(lilac.clone().lerp(ink, 0.25), T.DoubleSide), [0, -0.13, 0], [1, 1, 0.92], null, false);
    add(hips, new T.CylinderGeometry(0.1, 0.25, 0.2, 40, 1, true), toon(soft, T.DoubleSide), [0, -0.06, 0], [1, 1, 0.92], null, false);
    const spine = joint(hips, [0, 0.06, 0]);
    const chest = joint(spine, [0, 0.18, 0]);
    add(chest, new T.CapsuleGeometry(0.088, 0.1, 6, 20), toon(surface), [0, -0.02, 0], [1.06, 1, 0.78]);
    add(chest, new T.CylinderGeometry(0.09, 0.17, 0.12, 32, 1, true), toon(accent, T.DoubleSide), [0, 0.06, 0], [1, 1, 0.85], null, false);
    const head = joint(joint(chest, [0, 0.17, 0]), [0, 0.05, 0]);
    add(head, new T.SphereGeometry(0.118, 32, 24), toon(skin), [0, 0.12, 0.004], [1, 1.04, 1]);
    const eyeMat = new T.MeshBasicMaterial({ color: lilac.clone().lerp(ink, 0.45) });
    mats.push(eyeMat);
    for (const s of [-1, 1]) add(head, new T.SphereGeometry(0.025, 16, 12), eyeMat, [s * 0.044, 0.112, 0.103], [0.8, 1.25, 0.35], [0, s * 0.35, 0], false);
    const hairMat = toon(accent);
    add(head, new T.SphereGeometry(0.134, 32, 24), hairMat, [0, 0.135, -0.03], [1.04, 1.02, 1]);
    add(head, new T.SphereGeometry(0.128, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.36), hairMat, [0, 0.14, 0.012], [1.03, 1.05, 1.06], [0.35, 0, 0]);
    for (const s of [-1, 1]) add(head, new T.SphereGeometry(0.058, 20, 16), hairMat, [s * 0.098, 0.235, -0.035]);
    const arm = (s) => {
      const sh = joint(chest, [s * 0.108, 0.105, 0]);
      add(sh, new T.SphereGeometry(0.06, 16, 12), toon(surface), [s * 0.008, -0.055, 0], [1, 1.25, 1]);
      add(sh, new T.CapsuleGeometry(0.03, 0.15, 4, 10), toon(surface), [0, -0.12, 0]);
      const el2 = joint(sh, [0, -0.235, 0]);
      add(el2, new T.CapsuleGeometry(0.026, 0.14, 4, 10), toon(surface), [0, -0.09, 0]);
      add(el2, new T.SphereGeometry(0.032, 14, 10), toon(skin), [0, -0.235, 0], [0.9, 1.2, 0.7]);
      return { sh, el: el2 };
    };
    const leg = (s) => {
      const th = joint(hips, [s * 0.058, -0.04, 0]);
      add(th, new T.CapsuleGeometry(0.05, 0.28, 4, 12), toon(ink.clone().lerp(lilac, 0.15)), [0, -0.19, 0]);
      const kn = joint(th, [0, -0.4, 0]);
      add(kn, new T.CapsuleGeometry(0.04, 0.3, 4, 12), toon(ink.clone().lerp(lilac, 0.15)), [0, -0.19, 0]);
      add(kn, new T.SphereGeometry(0.05, 14, 10), toon(ink.clone().multiplyScalar(0.7)), [0, -0.415, 0.025], [0.85, 0.6, 1.5]);
      return { th, kn };
    };
    const LA = arm(1), RA = arm(-1), LL = leg(1), RL = leg(-1);
    const stand = new T.Group();
    stand.add(doll);
    scene.add(stand);

    // Three decorations — matcap (light face → sky → accent, sparkle at top left)
    const cap = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d");
      const hex = (x) => `#${x.getHexString(T.SRGBColorSpace)}`;
      const lin = g.createLinearGradient(0, 0, 128, 128);
      lin.addColorStop(0, hex(surface)); lin.addColorStop(0.35, hex(sky)); lin.addColorStop(1, hex(accent));
      g.fillStyle = lin; g.fillRect(0, 0, 128, 128);
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      return t;
    })();
    const capMat = new T.MeshMatcapMaterial({ matcap: cap, transparent: true });
    mats.push(capMat);
    const tubeGeo = (() => {
      const pts = [];
      for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push(new T.Vector3(Math.sin(u * Math.PI * 3) * 0.08, (u - 0.5) * 0.34, Math.cos(u * Math.PI * 3) * 0.05)); }
      return new T.TubeGeometry(new T.CatmullRomCurve3(pts), 80, 0.022, 12, false);
    })();
    const orbs = [new T.ConeGeometry(0.11, 0.2, 3), new T.BoxGeometry(0.13, 0.13, 0.13), tubeGeo].map((g, id) => {
      geos.push(g);
      const m = new T.Mesh(g, capMat);
      const o = { m, id, mag: 1, rs: new T.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1) };
      o.reset = () => { o.rad = (2 / 3) * id * Math.PI; o.rad0 = Math.random() * Math.PI * 2; o.sp = Math.random() * 2 - 1; o.r = Math.random() * 0.25 + 0.75; };
      o.reset();
      scene.add(m);
      return o;
    });

    // Motion: 1s crossfade between the current and previous pose
    let cur = { k: order[0], t0: 0 }, prev = null, fade0 = -9, clock = 0, spin = 0, mx = 0, my = 0;
    const play = (k) => { if (!POSES[k]) return; prev = { k: cur.k, t0: cur.t0 }; cur = { k, t0: clock }; fade0 = clock; };
    const lerp = (a, b, t) => a + (b - a) * t;
    const pose = (dt) => {
      clock += dt;
      const a = full(POSES[cur.k](clock - cur.t0));
      let p = a;
      const w = Math.min(1, clock - fade0);
      if (prev && w < 1) {
        const b = full(POSES[prev.k](clock - prev.t0)), k = w < 0.5 ? 2 * w * w : 1 - Math.pow(-2 * w + 2, 2) / 2;
        p = {};
        KEYS.forEach((key) => (p[key] = lerp(b[key], a[key], k)));
      } else prev = null;
      hips.position.y = 0.86 + p.hy; hips.rotation.z = p.hz; chest.rotation.x = p.cx;
      head.rotation.set(p.nx, p.ny, p.nz);
      LA.sh.rotation.set(p.lax, p.lay, p.laz); LA.el.rotation.x = p.lex;
      RA.sh.rotation.set(p.rax, p.ray, p.raz); RA.el.rotation.x = p.rex;
      LL.th.rotation.x = -p.lkx * 0.5; LL.kn.rotation.x = p.lkx;
      RL.th.rotation.x = -p.rkx * 0.5; RL.kn.rotation.x = p.rkx;
    };

    let w = 1, h = 1;
    const size = () => {
      w = Math.max(1, el.clientWidth); h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    renderer.compile(scene, camera);

    const draw = (dt) => {
      pose(dt);
      stand.rotation.y = spin;
      orbs.forEach((o) => {
        o.rad += o.sp * dt * 0.5;
        const r = 0.625 * o.mag, asp = Math.max(1, w / h);
        o.m.position.set(Math.cos(o.rad) * o.r * r * asp * 0.8, (view === "full" ? 0.95 : 1.3) + Math.sin(o.rad * 0.5 + o.rad0) * o.r * r * 0.375, Math.sin(o.rad) * o.r * r);
        o.m.rotation.x += o.rs.x * dt; o.m.rotation.y += o.rs.y * dt; o.m.rotation.z += o.rs.z * dt;
        o.m.scale.setScalar(0.625 * o.mag);
      });
      if (follow) {
        rig.position.x = lerp(rig.position.x, mx * 0.5, Math.min(1, dt));
        rig.position.y = lerp(rig.position.y, my * 0.25, Math.min(1, dt));
      }
      if (view === "full") { camera.position.set(0, 0.86, 4.1); camera.lookAt(0, 0.82, 0); }
      else { camera.position.set(0, 1.3, 1.75); camera.lookAt(0, 1.25, 0); }
      renderer.render(scene, camera);
    };

    const tw = [];
    const change = (k, dir) => {
      play(k);
      if (!reduce) tw.push(gsap.to({ v: spin }, { v: spin + (dir < 0 ? 1 : -1) * Math.PI * 2, duration: spinDur, ease: "power2.inOut", onUpdate() { spin = this.targets()[0].v; } }));
      orbs.forEach((o) => tw.push(gsap.to(o, { mag: 0, duration: reduce ? 0 : 0.5, ease: "power2.in", onComplete: () => { o.reset(); tw.push(gsap.to(o, { mag: 1, duration: reduce ? 0 : 1, ease: "power2.out" })); } })));
      el.dispatchEvent(new CustomEvent("fx:pose", { bubbles: true, detail: { pose: k } }));
    };
    const buttons = [...el.querySelectorAll('[data-fx-part="pose"]')];
    const onButton = (e) => {
      const b = e.currentTarget, k = b.dataset.pose, i = order.indexOf(cur.k), j = order.indexOf(k);
      if (k === cur.k) return;
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      change(k, j >= i ? 1 : -1);
    };
    buttons.forEach((b) => b.addEventListener("click", onButton));
    let lock = false;
    const onStage = (e) => {
      if (e.target.closest('[data-fx-part="pose"]') || lock) return;
      lock = true;
      const pool = order.filter((k) => k !== cur.k);
      play(pool[Math.floor(Math.random() * pool.length)] || order[0]);
      if (!reduce) orbs.forEach((o) => tw.push(gsap.to(o.m.rotation, { y: `+=${Math.PI * 2 + Math.random() * Math.PI * 2}`, duration: 2 + Math.random(), ease: "power2.inOut" })));
      setTimeout(() => (lock = false), 2000);
    };
    canvas.addEventListener("click", onStage);
    const onMove = (e) => { const r = el.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width) * 2 - 1; my = -(((e.clientY - r.top) / r.height) * 2 - 1); };
    if (follow && hover) el.addEventListener("pointermove", onMove);

    let raf = 0, last = 0, seen = true;
    const io = new IntersectionObserver(([en]) => (seen = en.isIntersecting));
    io.observe(el);
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.max(0.001, Math.min(0.1, (now - last) / 1000)) : 1 / 60;
      last = now;
      if (seen) draw(dt);
    };
    if (reduce) draw(0.016); else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      tw.forEach((t) => t.kill());
      buttons.forEach((b) => { b.removeEventListener("click", onButton); b.removeAttribute("aria-pressed"); });
      canvas.removeEventListener("click", onStage);
      el.removeEventListener("pointermove", onMove);
      geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()); cap.dispose(); ramp.dispose();
      renderer.dispose();
      tint.remove();
      if (made) canvas.remove();
    };
  });
})();
