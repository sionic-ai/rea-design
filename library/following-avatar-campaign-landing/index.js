// First page — eight canvases (same count as the original): an avatar world (one canvas shifting between hero/intro and footer), a second avatar (school About ↔ unit),
// Sparkle sky (video ↔ target job), point header decoration, and floating pieces of four point cards. The canvas hops to the visible panel (portal) and only one draws at a time.
(() => {
  const A = window.tsmAvatar;
  const site = window.tsmSite || {};
  const reduce = !!site.reduce;
  if (!A) { site.loaded?.(); return; }
  const { T, ease, lerp } = A;
  const pal = A.palette();
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const cpw = () => clamp01(innerWidth / 1440);

  const makeRenderer = (canvas, alpha = true) => {
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: "high-performance" });
    r.setPixelRatio(DPR);
    r.outputColorSpace = T.SRGBColorSpace;
    return r;
  };
  const sizeOf = (canvas) => {
    const p = canvas.parentElement;
    const w = Math.max(1, canvas.clientWidth || p.clientWidth), h = Math.max(1, canvas.clientHeight || p.clientHeight);
    return { w, h, aspect: w / h };
  };
  const light = (scene) => {
    scene.add(new T.AmbientLight(pal.surface, 1.6));
    const d = new T.DirectionalLight(pal.surface, 2.2);
    d.position.set(1.5, 2.5, 3);
    scene.add(d);
  };
  // Move the canvas into the visible plate (original setPortal) — if a plate is on screen, the canvas becomes that plate’s child
  const portal = (canvas, homes, onMove) => {
    const seen = new Map();
    let parent = canvas.parentElement;
    const io = new IntersectionObserver((list) => {
      list.forEach(({ target, isIntersecting }) => seen.set(target, isIntersecting));
      for (const h of homes) {
        if (seen.get(h) && parent !== h) { parent = h; h.append(canvas); onMove?.(h); break; }
      }
    });
    homes.forEach((h) => io.observe(h));
    return { get inView() { return homes.some((h) => seen.get(h)); }, get home() { return parent; } };
  };

  const worlds = [];
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (!site.paused) worlds.forEach((w) => w.tick(dt, now));
    requestAnimationFrame(loop);
  };

  // ───────────────────── 1. Avatar world ─────────────────────
  const mainCanvas = document.getElementById("t-canvas-main");
  const kv = document.getElementById("top");
  const footer = document.getElementById("t-footer");
  const main = {};
  if (mainCanvas && kv && footer) {
    const renderer = makeRenderer(mainCanvas);
    const scene = new T.Scene();
    light(scene);
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    const camGroup = new T.Group();
    camGroup.add(camera);
    scene.add(camGroup);
    const state = { opening: reduce ? 1 : 0, spin: 0, mx: 0, my: 0 };
    main.state = state;

    // Doll — the original VRM stands facing −z and turns half a turn backward (0.8π→π) to face front. Our doll faces +z, so it pre-rotates half a turn inside.
    const avatar = A.makeAvatar(pal, { start: "base_01" });
    main.avatar = avatar;
    const model = new T.Group(), child = new T.Group();
    avatar.root.rotation.y = Math.PI;
    child.add(avatar.root);
    model.add(child);
    scene.add(model);

    // White disc: swells up from below with the Hero scroll to cover the screen, and when moving on to About a dot pattern floats up
    const circle = new T.Group();
    const discGeo = new T.CircleGeometry(1, 64);
    const ring = new T.Mesh(discGeo, new T.MeshBasicMaterial({ color: pal.surface, transparent: true, opacity: 0.25, depthWrite: false }));
    const disc = new T.Mesh(discGeo, new T.MeshBasicMaterial({ color: pal.surface, transparent: true, depthWrite: false }));
    disc.scale.set(0.95, 0.95, 1);
    const dots = new T.Mesh(discGeo, new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uColor: { value: pal.accent }, uOpacity: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
        void main(){
          vec2 g = vUv * vec2(36.0, 36.0);
          vec2 c = fract(g + vec2(step(1.0, mod(floor(g.y), 2.0)) * 0.5, 0.0)) - 0.5;
          float d = smoothstep(0.12, 0.08, length(c));
          gl_FragColor = vec4(uColor, d * 0.22 * uOpacity);
          #include <colorspace_fragment>
        }`,
    }));
    dots.scale.set(0.95, 0.95, 1);
    circle.add(ring, disc, dots);
    circle.position.z = -1;
    scene.add(circle);

    // Back band text: panels stand up one after another from the left (original shader values as-is — 12·0.375 progression, sin/cos folding), text flows horizontally
    const bandFont = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-band").trim() || "serif";
    const bandCanvas = document.createElement("canvas");
    bandCanvas.width = 2486; bandCanvas.height = 480;
    const bandTex = new T.CanvasTexture(bandCanvas);
    bandTex.wrapS = T.RepeatWrapping;
    const paintBand = () => {
      const g = bandCanvas.getContext("2d");
      g.clearRect(0, 0, 2486, 480);
      g.fillStyle = A.cssString("--kf-surface");
      g.textBaseline = "middle";
      g.textAlign = "center";
      g.font = `700 330px ${bandFont}`;
      g.fillText("STUDIO", 2486 / 2, 250);
      bandTex.needsUpdate = true;
    };
    paintBand();
    document.fonts?.load(`700 120px ${bandFont}`).then(paintBand).catch(() => {});
    const band = new T.Mesh(new T.PlaneGeometry((2486 / 480) * 2, 1, 256, 16), new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTexture: { value: bandTex }, uColor: { value: pal.accent }, uTime: { value: 0 }, uProgress: { value: 0 }, uAspect: { value: 1 }, uOpacity: { value: 0 } },
      vertexShader: `uniform float uProgress; varying vec2 vUv; const float PI = 3.141592653589793;
        void main(){
          vec3 p = position;
          float pr = clamp(12.0 * 0.375 * uProgress - (p.x + 12.0 * 0.5) * 0.375, 0.0, 1.0);
          p.y = sin(pr * 0.5 * PI) * position.y;
          p.z = cos(pr * 0.5 * PI) * position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          vUv = uv;
        }`,
      fragmentShader: `uniform sampler2D uTexture; uniform vec3 uColor; uniform float uTime; uniform float uAspect; uniform float uOpacity; varying vec2 vUv;
        void main(){
          float s = texture2D(uTexture, vec2(vUv.x * uAspect * 2.0 + uTime, vUv.y)).a;
          gl_FragColor = vec4(uColor, s * 0.2 * uOpacity);
          #include <colorspace_fragment>
        }`,
    }));
    band.scale.setScalar(0.75);
    band.position.z = -0.95;
    scene.add(band);

    // Three decorations: first they float up one by one into place (pyramid front upper left · box back left · tube front right), then orbit the doll as you scroll.
    const INIT = { cone: [-0.1375, 0.1625, 0.375], box: [-0.15, 0.1, -0.75], tube: [0.125, 0.05, 0.5] };
    const IROT = { cone: [Math.PI * 0.125, Math.PI * 0.125], box: [0, 0], tube: [-Math.PI * 0.125, -Math.PI * 0.125] };
    const ornaments = ["cone", "box", "tube"].map((type, id) => {
      const o = A.makeOrnament(type, pal);
      o.type = type; o.id = id; o.mag = 1; o.footerY = Math.random();
      o.reset = () => {
        o.radian = (2 / 3) * id * Math.PI; o.radianStart = Math.random() * Math.PI * 2; o.radianSpeed = Math.random() * 2 - 1; o.radius = Math.random() * 0.25 + 0.75;
      };
      o.reset();
      o.rotateSpeed = new T.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      o.group.rotation.set(IROT[type][0], 0, IROT[type][1]);
      scene.add(o.group);
      return o;
    });
    // Six triangle pieces
    const triColors = [pal.accent, pal.sky, pal.lemon, pal.purple, pal.soft];
    const triGeo = new T.CircleGeometry(0.0625, 3);
    const tris = Array.from({ length: 6 }, (_, id) => {
      const m = new T.Mesh(triGeo, new T.MeshBasicMaterial({ color: triColors[id % triColors.length], transparent: true, side: T.DoubleSide }));
      const t = { mesh: m, id, mag: 1 };
      t.reset = () => {
        t.radian = (2 / 6) * id * Math.PI; t.radius = Math.random() * 0.5 + 0.5; t.radianSpeed = Math.random() * 2 - 1; t.radianY = Math.random() * Math.PI * 2;
        t.size = Math.random() * 0.75 + 0.25; m.scale.setScalar(t.size);
        m.material.color.copy(triColors[Math.floor(Math.random() * triColors.length)]);
      };
      t.reset();
      t.rot = new T.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      scene.add(m);
      return t;
    });
    // Two prop panels (a left, b right) — changing the tab makes them vanish and come back swapped to that item’s props
    const itemGeo = new T.PlaneGeometry(0.4 * 1.1, 0.3 * 1.1);
    const itemTex = A.ITEMS.map((pair) => pair.map((k) => A.itemTexture(k, pal)));
    const items = ["a", "b"].map((type, k) => {
      const mat = new T.MeshBasicMaterial({ map: itemTex[0][k], transparent: true, depthWrite: false });
      const mesh = new T.Mesh(itemGeo, mat);
      const it = { type, mesh, mat, mag: 1 };
      it.reset = () => { it.radian = Math.random() * Math.PI * 2; it.radianSpeed = Math.random() * 0.75 + 0.25; };
      it.reset();
      scene.add(mesh);
      return it;
    });
    // Sparkle
    const kira = A.kiraTexture(pal);
    const stars = Array.from({ length: 14 }, () => {
      const s = new T.Sprite(new T.SpriteMaterial({ map: kira, transparent: true, depthWrite: false }));
      s.userData = { base: new T.Vector3((Math.random() - 0.5) * 3.2, (Math.random() - 0.5) * 1.8, -0.6 + Math.random() * 0.9), size: 0.03 + Math.random() * 0.05, speed: 0.6 + Math.random() * 0.8, phase: Math.random() * 6 };
      scene.add(s);
      return s;
    });

    let size = sizeOf(mainCanvas);
    const resize = () => {
      size = sizeOf(mainCanvas);
      renderer.setSize(size.w, size.h, false);
      camera.aspect = size.aspect;
      camera.updateProjectionMatrix();
      const k = Math.max(1, size.aspect * 0.5);
      band.scale.x = 0.75 * k;
      band.material.uniforms.uAspect.value = k;
    };
    new ResizeObserver(resize).observe(mainCanvas);
    resize();
    renderer.compile(scene, camera);

    const homes = [document.getElementById("t-kv-about-bg").querySelector("[data-portal]"), footer.querySelector("[data-portal]")];
    const where = portal(mainCanvas, homes);
    const inFooter = () => where.home === homes[1];
    const B1 = () => ["idle_01", "idle_02", "idle_03", "idle_04"][Math.floor(Math.random() * 4)];
    const Z1 = () => avatar.names.filter((n) => n !== "base_01" && n !== "base_09")[Math.floor(Math.random() * 13)];

    main.change = (action, forward) => {
      avatar.play(action);
      if (forward !== undefined && !reduce) gsap.to(state, { spin: `${forward ? "-" : "+"}=${Math.PI * 2}`, duration: 1, ease: "power2.inOut" });
      // Triangle pieces, decorations, props: vanish in .5s, scatter anew and return in 1s
      tris.forEach((t) => {
        gsap.to(t.mesh.material, { opacity: 0, duration: 0.5, ease: "power2.in", onComplete: () => gsap.to(t.mesh.material, { opacity: 1, duration: 1, ease: "power4.out" }) });
        gsap.to(t, { mag: 0, duration: 0.5, ease: "power2.in", onComplete: () => { t.reset(); gsap.to(t, { mag: 1, duration: 1, ease: "power4.out" }); } });
      });
      ornaments.forEach((o, i) => {
        if (i === 0) gsap.to(o.mat, { opacity: 0, duration: 0.5, ease: "power2.in", onComplete: () => gsap.to(o.mat, { opacity: 1, ease: "power2.out" }) });
        gsap.to(o, { mag: 0, duration: 0.5, ease: "power2.in", onComplete: () => { o.reset(); gsap.to(o, { mag: 1, duration: 1, ease: "power2.out" }); } });
      });
      const idx = Number(String(action).split("_")[1]) - 1;
      if (action.startsWith("active") && itemTex[idx]) {
        items.forEach((it, k) => gsap.to(it, { mag: 0, duration: 0.625, ease: "power2.in", onComplete: () => { it.mat.map = itemTex[idx][k]; it.reset(); gsap.to(it, { mag: 1, duration: 1.25, ease: "power4.out" }); } }));
      }
    };

    // Footer: the camera slowly follows the mouse (.001×ms per frame), and a click triggers a different action + the decoration spins more than a full turn (2s cooldown)
    let footerLock = false;
    footer.addEventListener("click", () => {
      if (footerLock) return;
      footerLock = true;
      avatar.play(Z1());
      ornaments.forEach((o) => gsap.to(o.group.rotation, { y: `+=${Math.PI * 2 + Math.random() * Math.PI * 2}`, duration: 2 + Math.random(), ease: "power2.inOut" }));
      setTimeout(() => (footerLock = false), 2000);
    });
    footer.addEventListener("mousemove", (e) => {
      state.mx = (e.clientX / size.w) * 2 - 1;
      state.my = -((e.clientY / size.h) * 2 - 1);
    });

    const kvH = () => kv.clientHeight || innerHeight;
    worlds.push({
      tick(dt, now) {
        if (!where.inView) return;
        const e = 1 - cpw();
        const footerMode = inFooter();
        const t = footerMode ? 1 : clamp01(scrollY / kvH());
        const n = clamp01((scrollY - kvH()) / size.h);
        avatar.update(dt, () => (footerMode ? "idle_05" : state.opening < 1 ? "base_01" : B1()));
        // Puppet spot (original V1.update)
        model.rotation.y = Math.PI * (0.8 + 0.075 * e + (0.2 - 0.075 * e) * t) + state.spin;
        model.position.x = 0.05 * size.aspect * (1 - t);
        // The original VRM has hips at height 1.3, so the same formula (-1.3×(1−.375t−.1e(1−t))) puts the face above screen center — our doll (face 1.42) takes 1.34 only on the first screen to land in the same spot
        child.position.y = -(1.34 * (1 - 0.1 * e) * (1 - t) + 0.8125 * t);
        child.rotation.x = Math.PI * 0.05 * (1 - t);
        avatar.joints.head.children.forEach((c) => { if (c.userData.ribbon) c.rotation.z += dt * 0.6; });

        // Camera
        if (footerMode) {
          const ft = scrollY + innerHeight - document.documentElement.scrollHeight;
          camera.position.set(0, 0.5 - ft * 0.0025, 1.75 + (1 - cpw()) * 0.25);
          camGroup.position.x = lerp(camGroup.position.x, state.mx, Math.min(1, 0.001 * dt * 1000));
          camGroup.position.y = lerp(camGroup.position.y, state.my * 0.5, Math.min(1, 0.001 * dt * 1000));
          camera.lookAt(0, 0.45 - ft * 5e-4, 0);
        } else {
          const te = ease.inOut(t);
          const op = 1 - state.opening, ang = Math.PI * 1.75 * op, rad = op * 3;
          const ox = Math.cos(ang) * rad, oy = Math.sin(ang) * rad * 0.25, oz = Math.sin(ang) * rad;
          camGroup.position.set(0, 0, 0);
          camera.position.x = ox * (1 - te);
          camera.position.y = Math.sin(((15 + e * 15) / 180) * Math.PI) * 1.25 * (1 - te) + oy * (1 - te);
          camera.position.z = 1 + e * 0.625 * (1 - te) + te * 3 + oz * (1 - te);
          camera.lookAt(0, cpw() * (state.opening - 1) * 0.125, 0);
        }

        // Disc · band
        circle.visible = band.visible = !footerMode;
        dots.material.uniforms.uOpacity.value = ease.out(n);
        const s = Math.max(1.75, Math.max(size.w, size.h) / Math.min(size.w, size.h)) * 1.1 * t + cpw() * t;
        circle.position.y = -1 + t;
        circle.scale.setScalar(Math.max(0.0001, s));
        band.material.uniforms.uTime.value = now * 5e-5;
        band.material.uniforms.uProgress.value = t;
        band.material.uniforms.uOpacity.value = state.opening;
        band.lookAt(camera.getWorldPosition(new T.Vector3()));

        // Decoration (original ph.update / footerUpdate)
        const te2 = ease.inOut(t);
        ornaments.forEach((o) => {
          const ms = dt * 1000;
          o.radian += o.radianSpeed * ms * 5e-4;
          if (footerMode) {
            const r = 0.5;
            o.group.position.set(Math.cos(o.radian) * o.radius * r * Math.max(1, size.aspect), 0, Math.sin(o.radian) * o.radius * r);
            o.group.position.y = -o.group.position.z * (cpw() * 0.5 + 0.5) + (1 - cpw()) * 0.25 + o.footerY * (cpw() * 0.625 + 0.375);
            o.group.rotation.x += o.rotateSpeed.x * ms * 0.001;
            o.group.rotation.z += o.rotateSpeed.z * ms * 0.001;
            o.mesh.rotation.y += o.rotateSpeed.y * ms * 0.001;
            o.group.scale.setScalar(0.625 * o.mag);
            return;
          }
          const ni = Math.max(0, state.opening * (o.id + 2) - (o.id + 1)), ii = ease.out(ni);
          const r = 0.625 * o.mag;
          const ax = Math.cos(o.radian) * o.radius * r * Math.max(1, size.aspect);
          const ip = INIT[o.type];
          o.group.position.x = lerp(ip[0] * Math.max(1, size.aspect) * ii, ax, te2);
          const ay = Math.sin(o.radian * 0.5 + o.radianStart) * o.radius * r * 0.375 + 0.125;
          o.group.position.y = lerp(ip[1] * ((2 - Math.min(1, size.aspect)) * 1.25) * ii, ay, te2 * ni);
          const az = Math.sin(o.radian) * o.radius * r;
          o.group.position.z = lerp(ip[2] * ii, az, te2 * ni);
          const rx = o.group.rotation.x + o.rotateSpeed.x * ms * 0.001;
          o.group.rotation.x = lerp(IROT[o.type][0], rx, o.type === "box" ? 1 : te2);
          o.mesh.rotation.y += o.rotateSpeed.y * ms * 0.001;
          const rz = o.group.rotation.z + o.rotateSpeed.z * ms * 0.001;
          o.group.rotation.z = lerp(IROT[o.type][1], rz, o.type === "box" ? 1 : te2);
          o.group.scale.setScalar(0.625 * lerp(ni, 1, t) * o.mag);
        });
        tris.forEach((tr) => {
          const ms = dt * 1000;
          tr.mesh.visible = !footerMode;
          tr.mesh.rotation.x += tr.rot.x * ms * 0.001; tr.mesh.rotation.y += tr.rot.y * ms * 0.001; tr.mesh.rotation.z += tr.rot.z * ms * 0.001;
          tr.radian += tr.radianSpeed * ms * 5e-4;
          tr.mesh.position.set(Math.cos(tr.radian) * tr.radius * tr.mag * 0.625 * Math.max(1, size.aspect), Math.sin(tr.radian * 0.5 + tr.radianY) * tr.radius * 0.5 * tr.mag + 0.25, Math.sin(tr.radian) * tr.radius * tr.mag * 0.625);
        });
        items.forEach((it) => {
          it.mesh.visible = !footerMode;
          it.radian += it.radianSpeed * dt * 1000 * 5e-4;
          it.mat.opacity = it.mag;
          const i = 0.625 + (1 - t) * 0.375, r = cpw() * 0.125 + 0.875;
          it.mesh.position.y = Math.sin(it.radian) * 0.25 * it.mag + 0.25 + ease.in(1 - t);
          // Turns out 3/4 of a revolution from behind (−z) to the front on both sides — a is left, b is right
          const a = it.type === "a" ? -it.mag * Math.PI * 0.75 - Math.PI * 0.5 : it.mag * Math.PI * 0.75 - Math.PI * 0.5;
          it.mesh.position.x = Math.cos(a) * i * r;
          it.mesh.position.z = Math.sin(a) * i;
          it.mesh.lookAt(camera.getWorldPosition(new T.Vector3()));
        });
        stars.forEach((s) => {
          const u = s.userData, k = (Math.sin(now * 0.001 * u.speed + u.phase) + 1) / 2;
          s.visible = !footerMode;
          s.position.copy(u.base);
          s.position.y += t * 0.6;
          s.scale.setScalar(u.size * k * state.opening);
        });

        renderer.render(scene, camera);
      },
    });
  }

  // ───────────────────── 2. Second avatar (About the school ↔ Unit) ─────────────────────
  const duoCanvas = document.getElementById("t-canvas-duo");
  if (duoCanvas) {
    const renderer = makeRenderer(duoCanvas);
    const scene = new T.Scene();
    light(scene);
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    const avatar = A.makeAvatar(pal, { start: "idle_05" });
    const holder = new T.Group();
    holder.add(avatar.root);
    scene.add(holder);
    let size = sizeOf(duoCanvas);
    const resize = () => { size = sizeOf(duoCanvas); renderer.setSize(size.w, size.h, false); camera.aspect = size.aspect; camera.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(duoCanvas);
    const ctaHome = document.getElementById("t-cta"), projHome = document.getElementById("t-project");
    const where = portal(duoCanvas, [ctaHome, projHome], () => resize());
    resize();
    renderer.compile(scene, camera);
    const pick = () => (where.home === ctaHome ? "idle_05" : ["base_01", "idle_01", "idle_03"][Math.floor(Math.random() * 3)]);
    worlds.push({
      tick(dt) {
        if (!where.inView) return;
        const inCta = where.home === ctaHome;
        avatar.update(dt, pick);
        if (inCta) {
          // Big upper body — both arms reach out from the right side of the screen
          holder.rotation.y = -0.45;
          holder.position.set(size.aspect > 1 ? 0.55 : 0.25, 0, 0);
          camera.position.set(0, 1.3, 1.25);
          camera.lookAt(0, 1.2, 0);
        } else {
          const r = projHome.getBoundingClientRect();
          const p = clamp01(-r.top / Math.max(1, r.height - innerHeight));
          holder.rotation.y = 0.35 - p * 0.5;
          holder.position.set(0, 0, 0);
          camera.position.set(0, 0.86, 4.1);
          camera.lookAt(0, 0.82, 0);
        }
        renderer.render(scene, camera);
      },
    });
  }

  // ───────────────────── 3. Sparkle sky (video ↔ target job, 30 per second) ─────────────────────
  const skyCanvas = document.getElementById("t-canvas-sky");
  if (skyCanvas) {
    const renderer = makeRenderer(skyCanvas);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.z = 4;
    const kira = A.kiraTexture(pal);
    const sparks = Array.from({ length: 18 }, () => {
      const s = new T.Sprite(new T.SpriteMaterial({ map: kira, transparent: true, depthWrite: false }));
      s.userData = { x: (Math.random() - 0.5) * 3.6, y: (Math.random() - 0.5) * 2.2, size: 0.04 + Math.random() * 0.08, speed: 0.5 + Math.random(), phase: Math.random() * 6 };
      scene.add(s);
      return s;
    });
    const tri = new T.CircleGeometry(0.06, 3);
    const triColors = [pal.accent, pal.sky, pal.lemon, pal.purple];
    const bits = Array.from({ length: 8 }, (_, i) => {
      const m = new T.Mesh(tri, new T.MeshBasicMaterial({ color: triColors[i % 4], side: T.DoubleSide, transparent: true, opacity: 0.9 }));
      m.userData = { x: (Math.random() - 0.5) * 3.4, y: (Math.random() - 0.5) * 2, r: new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), s: 0.5 + Math.random() };
      m.scale.setScalar(m.userData.s);
      scene.add(m);
      return m;
    });
    const cube = A.makeOrnament("box", pal);
    cube.group.position.set(-1.2, 0.5, 0.2);
    scene.add(cube.group);
    let size = sizeOf(skyCanvas);
    const resize = () => { size = sizeOf(skyCanvas); renderer.setSize(size.w, size.h, false); camera.aspect = size.aspect; camera.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(skyCanvas);
    const where = portal(skyCanvas, [document.querySelector("#t-movie [data-portal]"), document.querySelector("#t-future [data-portal]")], () => resize());
    resize();
    let acc = 0;
    worlds.push({
      tick(dt, now) {
        if (!where.inView) return;
        acc += dt;
        if (acc < 1 / 30) return;
        const step = acc; acc = 0;
        sparks.forEach((s) => { const u = s.userData, k = (Math.sin(now * 0.001 * u.speed + u.phase) + 1) / 2; s.position.set(u.x * Math.max(1, size.aspect * 0.6), u.y, 0); s.scale.setScalar(u.size * k); });
        bits.forEach((m) => { const u = m.userData; m.rotation.x += u.r.x * step * 2; m.rotation.y += u.r.y * step * 2; m.rotation.z += u.r.z * step * 2; m.position.set(u.x * Math.max(1, size.aspect * 0.6), u.y + Math.sin(now * 0.0006 + u.x) * 0.1, 0); });
        cube.mesh.rotation.x += step * 0.4; cube.mesh.rotation.y += step * 0.6;
        renderer.render(scene, camera);
      },
    });
  }

  // ───────────────────── 4. Point header decoration + card fragments (45 per second) ─────────────────────
  const floaters = (canvas, spec) => {
    const renderer = makeRenderer(canvas);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.z = 4;
    const things = spec.map(([type, x, y, s]) => {
      let o;
      if (type === "tri") {
        const m = new T.Mesh(new T.CircleGeometry(0.1, 3), new T.MeshMatcapMaterial({ matcap: A.matcap(pal, "sky", "accent"), side: T.DoubleSide }));
        o = { group: m, mesh: m };
      } else o = A.makeOrnament(type, pal);
      o.group.position.set(x, y, 0);
      o.group.scale.setScalar(s);
      o.r = new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      o.y0 = y; o.ph = Math.random() * 6;
      scene.add(o.group);
      return o;
    });
    let size = sizeOf(canvas), seen = false, acc = 0;
    const resize = () => { size = sizeOf(canvas); renderer.setSize(size.w, size.h, false); camera.aspect = size.aspect; camera.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(canvas);
    resize();
    let first = true;
    worlds.push({
      tick(dt, now) {
        if (!seen && !first) return;
        acc += dt;
        if (acc < 1 / 45 && !first) return;
        const step = acc; acc = 0; first = false;
        things.forEach((o) => {
          o.mesh.rotation.x += o.r.x * step * 1.6; o.mesh.rotation.y += o.r.y * step * 1.6; o.mesh.rotation.z += o.r.z * step * 1.6;
          o.group.position.y = o.y0 + Math.sin(now * 0.0008 + o.ph) * 0.06;
          o.group.position.x = o.group.position.x;
        });
        renderer.render(scene, camera);
      },
    });
  };
  const eye = document.getElementById("t-canvas-eye");
  if (eye) floaters(eye, [["tube", -1.5, 0.15, 2.4], ["cone", 1.6, -0.05, 2.2], ["box", 0.95, 0.45, 1.3]]);
  document.querySelectorAll(".t-point__canvas").forEach((c, i) =>
    floaters(c, [["tri", -1.6, 0.9, 1], ["tri", 1.7, 0.4, 0.8], ["tri", -1.2, -0.6, 0.7], ["tri", 1.4, -1.0, 1.1], [["cone", "box", "tube", "cone"][i % 4], 1.75, 1.05, 0.9]]),
  );

  // ───────────────────── About tab: pressing one of the eight circles makes the doll spin once and take that pose, text goes heading band → body ─────────────────────
  const tab = document.getElementById("t-about-tab");
  const content = document.getElementById("t-about-content");
  if (tab && content) {
    const buttons = [...tab.querySelectorAll("button")];
    const panes = [...content.children];
    // Picture inside the tab circle: the same drawing as the prop plate, as a small SVG
    const ICON = [
      '<path d="M5 7h10v12H5zM15 7h10v12H15z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
      '<circle cx="15" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 15v8M10 25h10" stroke="currentColor" stroke-width="1.8"/>',
      '<path d="M15 4l3 7 7 .5-5.4 4.6 1.8 7L15 19l-6.4 4.1 1.8-7L5 11.5l7-.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      '<rect x="5" y="8" width="20" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 24h24" stroke="currentColor" stroke-width="1.8"/>',
      '<circle cx="15" cy="15" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="15" cy="15" r="2.5" fill="currentColor"/>',
      '<path d="M15 4l9 5v11l-9 5-9-5V9z M6 9l9 5 9-5 M15 14v11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
      '<path d="M6 23V14M12 23V9M18 23v-6M24 23V6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
      '<rect x="4" y="9" width="22" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="15" cy="16" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    ];
    buttons.forEach((b, i) => { b.querySelector(".t-tab-icon").innerHTML = `<span class="t-tab-icon__img"><svg viewBox="0 0 30 30" aria-hidden="true">${ICON[i]}</svg></span>`; });
    let current = 0, busy = false;
    panes.forEach((p, i) => p.classList.toggle("is-current", i === 0));
    buttons.forEach((b, i) => (b.disabled = i === 0));
    const change = (i, forward) => {
      busy = true;
      main.change?.(`active_0${i + 1}`, forward);
      buttons.forEach((b, k) => (b.disabled = k === i));
      const from = panes[current], to = panes[i];
      gsap.fromTo(content, { height: from.clientHeight }, { height: to.clientHeight, duration: reduce ? 0 : 1 });
      from.style.position = "absolute";
      to.style.position = "relative";
      to.style.visibility = "visible";
      gsap.to(from, {
        opacity: 0, duration: reduce ? 0 : 0.5,
        onComplete: () => {
          from.classList.remove("is-current");
          from.style.visibility = "hidden"; from.style.opacity = "1";
          from.style.setProperty("--p1", "0"); from.style.setProperty("--p2", "0");
          to.classList.add("is-current");
          gsap.fromTo(to, { "--p1": 0, "--p2": 0 }, { "--p1": 1, duration: reduce ? 0 : 0.5, ease: "power2.in" });
          gsap.to(to, { "--p2": 1, duration: reduce ? 0 : 0.5, ease: "power2.out", delay: reduce ? 0 : 0.5, onComplete: () => { content.style.height = "auto"; busy = false; current = i; } });
        },
      });
    };
    buttons.forEach((b, i) => b.addEventListener("click", () => { if (!busy && i !== current) change(i, i > current); }));
    // Phone: sliding the doll slot sideways goes to the next·previous item (original keen-slider infinite loop)
    const swipe = document.getElementById("t-about-swipe");
    if (swipe && window.KeenSlider && matchMedia("(max-width: 1023px)").matches) {
      buttons.forEach(() => { const li = document.createElement("li"); li.className = "keen-slider__slide"; swipe.append(li); });
      swipe.classList.add("keen-slider");
      let abs = 0;
      new KeenSlider(swipe, {
        renderMode: "custom", loop: true,
        slideChanged: (s) => {
          if (busy) return;
          const a = s.track.details.abs;
          if (a > abs && current < buttons.length - 1) change(current + 1, true);
          if (a < abs && current > 0) change(current - 1, false);
          abs = a;
        },
      });
      tab.classList.add("keen-slider");
      [...tab.children].forEach((li) => li.classList.add("keen-slider__slide"));
      new KeenSlider(tab, { mode: "free-snap", slides: { perView: "auto" } });
    }
  }

  // ───────────────────── Loader → opening scene ─────────────────────
  const copy = document.querySelector(".t-kv [data-fx~='pop-hop-copy']");
  // In the original, while the VRM model, 15 motions and images load, hearts fill one by one by the share received (measured: the loader is on screen 4.3 seconds).
  // Our doll has no file to receive, so fill six hearts at .18s intervals to get the same length
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const hearts = () => reduce ? Promise.resolve() : new Promise((done) => {
    let n = 0;
    const id = setInterval(() => { n += 1; site.loadProgress?.(n / 6); if (n >= 6) { clearInterval(id); done(); } }, 180);
  });
  fontsReady.then(hearts).then(() => {
    requestAnimationFrame((t) => { last = t; requestAnimationFrame(loop); });
    // Original: the moment loading finishes, the loader rests 1s and begins vanishing over 1s, 1.5s after that same moment the camera spirals in over 3s
    if (main.state && !reduce) gsap.to(main.state, { opening: 1, duration: 3, delay: 1.5, ease: "power2.inOut", onComplete: () => document.body.classList.add("is-loaded") });
    return site.loaded?.();
  }).then(() => {
    if (reduce) { copy?.dispatchEvent(new CustomEvent("fx:start")); document.body.classList.add("is-loaded"); return; }
    // .25s after the loader fully disappears the greeting motion plays, .5s later the heading pops out
    setTimeout(() => main.avatar?.play("base_09"), 250);
    setTimeout(() => copy?.dispatchEvent(new CustomEvent("fx:start")), 500);
  });
})();
