(() => {
  // rapier (2MB CJS build embedding wasm) is loaded separately when attached so it does not block the first paint. This build re-reads global exports every time a body is created, so
  // Leaves exports swapped to rapier’s and does not restore them — THREE in three-global.js holds its own exports object, so it does not break
  const here = document.currentScript && document.currentScript.src;
  const RAPIER_SRC = here ? new URL("../../_vendor/rapier3d-compat@0.14.0/rapier.cjs.js", here).href : "";
  let rapierWait = null;
  const loadRapier = () => {
    if (window.RAPIER && window.RAPIER.World) return Promise.resolve(window.RAPIER);
    if (rapierWait) return rapierWait;
    rapierWait = new Promise((done) => {
      if (!RAPIER_SRC) return done(null);
      window.exports = {};
      const tag = document.createElement("script");
      tag.src = RAPIER_SRC;
      tag.onload = () => {
        const R = window.exports;
        Promise.resolve(R.init && R.init()).then(() => { window.RAPIER = R; done(R); }, () => done(null));
      };
      tag.onerror = () => done(null);
      document.head.append(tag);
    });
    return rapierWait;
  };

  // Skin values like color-mix compute to oklab() which THREE.Color cannot read — paint on a 1px canvas and read it as sRGB
  let pix = null;
  const rgbOf = (host, css) => {
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    probe.style.color = css;
    host.append(probe);
    const got = getComputedStyle(probe).color;
    probe.remove();
    if (!pix) pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = got;
    pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // Text breaks by letter, not by word (like the original, the overflowing letter stays on that line before moving to the next) — large text gets cut mid-word at the column edge
  const paint = (ctx, text, w, h, dpr, look) => {
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    ctx.canvas.width = W;
    ctx.canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    const wide = W / H >= 1;
    const boxW = W * (wide ? look.measure : look.measureTall), boxH = H * look.measure;
    const size = wide ? boxW / look.perLine : boxH / look.lines;
    ctx.font = `${look.weight} ${size}px ${look.family}`;
    ctx.fillStyle = look.color;
    const rows = [];
    let from = 0;
    for (let i = 0; i < text.length; i++) {
      const piece = text.slice(from, i + 1);
      if (ctx.measureText(piece).width > boxW) { rows.push(piece); from = i + 1; }
      else if (i === text.length - 1) rows.push(piece);
    }
    const lead = size * look.leading;
    const block = rows.length * lead - lead * 0.7;
    const top = (H - boxH) / 2 + boxH / 2 + size / 2 - block / 2;
    rows.forEach((row, i) => ctx.fillText(row, (W - boxW) / 2, top + lead * i));
  };

  // The whole panel is pushed by big-cell (128~2048px) value noise so the text slowly ripples — the noise position slides by cos(time × speed°) × strength
  const WOBBLE_FRAG = `
    precision highp float;
    uniform sampler2D map;
    uniform float uTime;
    uniform float uPower;
    uniform float uSpeed;
    varying vec2 vUv;
    const float PI_ = 3.14159265;
    float cell(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float smoothCell(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = 0.5 - 0.5 * cos(f * PI_);
      float a = cell(i), b = cell(i + vec2(1.0, 0.0)), c = cell(i + vec2(0.0, 1.0)), d = cell(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float field(vec2 p) {
      float t = 0.0;
      for (int k = 7; k < 12; k++) t += smoothCell(p / exp2(float(k))) * exp2(float(k - 12));
      return t;
    }
    void main() {
      float slide = cos(uTime * uSpeed * PI_ / 180.0) * uPower;
      float n = field(gl_FragCoord.xy + vec2(slide));
      vec2 uv = vUv * 0.9 + n * 0.1;
      uv.x += 0.01;
      gl_FragColor = texture2D(map, uv);
    }`;
  const PLANE_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`;

  kfFx.register("ball-cloud-push", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !T.WebGLRenderer || !window.gsap) return () => {};
    const count = hover ? +options.count || 100 : +options["count-touch"] || 30;
    const radius = +options.radius || 1;
    const pull = String(options.pull ?? "-0.2, -0.4, -0.2").split(",").map((v) => +v);
    const force = { x: pull[0] ?? -0.2, y: pull[1] ?? -0.4, z: pull[2] ?? -0.2 };
    const damping = +(options.damping ?? 0.75);
    const spin = +(options.spin ?? 0.15);
    const bounce = +(options.bounce ?? 0.8);
    const hand = +(options.pointer ?? 1);
    const rebirthEvery = +(options.rebirth ?? 1);
    const fov = +options.fov || 75;
    const near = +options.z || 10;
    const far = +(options["z-out"] ?? 12);
    const dur = +(options.dur ?? 1);
    const fade = +(options.fade ?? 0.5);
    const power = +(options.wobble ?? 2000);
    const speed = +(options.speed ?? 10);
    const startOut = options.enter === "1" || options.enter === "true";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    el.append(canvas);
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      canvas.remove();
      return () => {};
    }
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0, 0);
    renderer.autoClear = false;
    renderer.toneMapping = T.LinearToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.VSMShadowMap;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 1000);
    camera.position.set(0, 0, startOut ? far : near);
    // Two spotlights lighting from above and below — the balls glow in the same color so they are nearly flat, and the light only casts a faint shadow where they touch
    [12, -12].forEach((y) => {
      const spot = new T.SpotLight(undefined, 60);
      spot.penumbra = 1;
      spot.angle = 0.7;
      spot.position.set(0, y, 0);
      spot.castShadow = true;
      scene.add(spot);
    });

    const ballRgb = rgbOf(el, "var(--fx-ball)");
    const tint = new T.Color().setRGB(ballRgb[0], ballRgb[1], ballRgb[2], T.SRGBColorSpace);
    const material = new T.MeshLambertMaterial({ color: tint, emissive: tint.clone(), transparent: true, opacity: startOut ? 0 : 1 });
    const balls = new T.InstancedMesh(new T.IcosahedronGeometry(radius, 3), material, count);
    balls.instanceMatrix.setUsage(T.DynamicDrawUsage);
    balls.frustumCulled = false;
    balls.castShadow = true;
    balls.receiveShadow = true;
    scene.add(balls);

    // Standing spots without physics (reduced motion or rapier failed to load) — evenly spread inside a flat, wide ellipsoid
    const rest = [];
    const span = Math.cbrt((count * radius ** 3) / 0.55 / 0.62);
    for (let i = 0; i < count; i++) {
      const a = (i * 0.8191725) % 1, b = (i * 0.6710436) % 1, c = (i + 0.5) / count;
      const r = Math.cbrt(c) * span, th = a * Math.PI * 2, ph = Math.acos(1 - 2 * b);
      rest.push(new T.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.62, r * Math.sin(ph) * Math.sin(th)));
    }
    const m4 = new T.Matrix4(), q = new T.Quaternion(), one = new T.Vector3(1, 1, 1), v = new T.Vector3();
    const start = [];
    for (let i = 0; i < count; i++) {
      start.push(reduce ? rest[i].clone() : new T.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5));
      balls.setMatrixAt(i, m4.compose(start[i], q.identity(), one));
    }

    // Text panel — data-fx-part="text" Only when there is one. Font style and color are read from that element’s computed style
    const source = el.querySelector('[data-fx-part="text"]');
    const flat = new T.Scene();
    const flatCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let sheet = null, sheetCtx = null, wobble = null;
    if (source) {
      sheetCtx = document.createElement("canvas").getContext("2d");
      sheet = new T.CanvasTexture(sheetCtx.canvas);
      wobble = new T.ShaderMaterial({
        uniforms: { map: { value: sheet }, uTime: { value: 0 }, uPower: { value: power }, uSpeed: { value: speed } },
        vertexShader: PLANE_VERT,
        fragmentShader: WOBBLE_FRAG,
        depthTest: false,
        transparent: true,
      });
      flat.add(new T.Mesh(new T.PlaneGeometry(1, 1), wobble));
    }
    const look = () => {
      const s = getComputedStyle(source);
      return {
        family: s.fontFamily, weight: s.fontWeight, color: s.color,
        measure: +options.measure || 0.7, measureTall: +options["measure-tall"] || 0.65,
        perLine: +options["per-line"] || 18, lines: +options.lines || 16, leading: +(options.leading ?? 1.35),
      };
    };
    const repaint = () => {
      if (!source) return;
      paint(sheetCtx, source.textContent.replace(/\s+/g, " ").trim(), el.clientWidth || 1, el.clientHeight || 1, dpr, look());
      sheet.needsUpdate = true;
    };

    const draw = () => {
      renderer.clear();
      if (source) renderer.render(flat, flatCam);
      renderer.render(scene, camera);
    };
    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      repaint();
      draw();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    if (source && document.fonts) document.fonts.ready.then(() => { if (!gone) { repaint(); draw(); } });
    // Shaders are precompiled on setup — compiling on the first cursor move freezes the screen
    renderer.compile(scene, camera);
    if (source) renderer.compile(flat, flatCam);

    let R = null, world = null, handBody = null, bodies = [];
    let active = !startOut, gone = false, seen = true, rebirthId = 0;

    // Light beam shot from cursor → camera at z=The spot touching the 0 plane. Moves the kinematic ball straight there (no lag while following)
    const ndc = new T.Vector3(), dir = new T.Vector3(), aim = new T.Vector3();
    const move = (e) => {
      if (!active || !handBody) return;
      const b = el.getBoundingClientRect();
      ndc.set(((e.clientX - b.left) / (b.width || 1)) * 2 - 1, -(((e.clientY - b.top) / (b.height || 1)) * 2 - 1), 0.5).unproject(camera);
      dir.copy(ndc).sub(camera.position).normalize();
      aim.copy(camera.position).addScaledVector(dir, -camera.position.z / dir.z);
      handBody.setNextKinematicTranslation(aim);
    };
    if (!reduce) window.addEventListener("pointermove", move, { passive: true });

    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; });
    io.observe(el);

    // Throw one blob back up to the rear — the cloud always keeps stirring a little
    const rebirth = () => {
      if (!world || !active) return;
      const b = bodies[Math.floor(Math.random() * bodies.length)];
      b.setAngvel({ x: 0, y: 0, z: 0 }, true);
      b.setLinvel({ x: 0, y: 0, z: 0 }, true);
      b.setTranslation({ x: Math.random() - 0.5, y: Math.random() + 1, z: Math.random() - 0.5 - 3 }, true);
    };

    const push = { x: 0, y: 0, z: 0 };
    let last = 0;
    const clock = new T.Clock();
    const tick = () => {
      if (!seen) return;
      const now = performance.now();
      const dt = last ? Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000)) : 1 / 60;
      last = now;
      if (wobble) wobble.uniforms.uTime.value = clock.getElapsedTime();
      if (world && active) {
        world.timestep = dt;
        world.step();
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i], t = b.translation(), r = b.rotation();
          const len = Math.hypot(t.x, t.y, t.z) || 1;
          push.x = (t.x / len) * force.x; push.y = (t.y / len) * force.y; push.z = (t.z / len) * force.z;
          b.applyImpulse(push, true);
          balls.setMatrixAt(i, m4.compose(v.set(t.x, t.y, t.z), q.set(r.x, r.y, r.z, r.w), one));
        }
        balls.instanceMatrix.needsUpdate = true;
      }
      draw();
    };

    // Turns the stage on and off — the camera moves in or out in 1s power3.inOut and balls appear or vanish in .5s. Physics is paused while off
    const setActive = (on) => {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(material);
      if (on) active = true;
      gsap.to(material, { opacity: on ? 1 : 0, duration: reduce ? 0 : fade });
      gsap.to(camera.position, { z: on ? near : far, duration: reduce ? 0 : dur, ease: "power3.inOut", onUpdate: draw, onComplete: () => { if (!on) active = false; draw(); } });
    };
    const onActive = (e) => setActive(!(e.detail && e.detail.active === false));
    el.addEventListener("fx:active", onActive);

    size();
    if (reduce) {
      el.dispatchEvent(new CustomEvent("fx:ready"));
    } else {
      gsap.ticker.add(tick);
      if (startOut) setActive(true);
      loadRapier().then((got) => {
        if (gone) return;
        if (!got) {
          start.forEach((p, i) => gsap.to(p, { x: rest[i].x, y: rest[i].y, z: rest[i].z, duration: 2, ease: "power2.out", onUpdate: () => { balls.setMatrixAt(i, m4.compose(p, q.identity(), one)); balls.instanceMatrix.needsUpdate = true; } }));
        } else {
          R = got;
          const w = new R.World({ x: 0, y: 0, z: 0 });
          const made = (desc, p) => {
            desc.setTranslation(p.x, p.y, p.z);
            desc.linearDamping = damping;
            desc.angularDamping = spin;
            return w.createRigidBody(desc);
          };
          bodies = start.map((p) => {
            const b = made(R.RigidBodyDesc.dynamic(), p);
            w.createCollider(R.ColliderDesc.ball(radius).setMass(1).setRestitution(bounce), b);
            return b;
          });
          handBody = made(R.RigidBodyDesc.kinematicPositionBased(), { x: 0, y: 0, z: 0 });
          w.createCollider(R.ColliderDesc.ball(hand).setRestitution(bounce), handBody);
          world = w;
          if (rebirthEvery > 0) rebirthId = setInterval(rebirth, rebirthEvery * 1000);
        }
        el.dispatchEvent(new CustomEvent("fx:ready"));
      });
    }

    return () => {
      gone = true;
      gsap.ticker.remove(tick);
      clearInterval(rebirthId);
      window.removeEventListener("pointermove", move);
      el.removeEventListener("fx:active", onActive);
      ro.disconnect();
      io.disconnect();
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(material);
      start.forEach((p) => gsap.killTweensOf(p));
      if (world) world.free();
      balls.geometry.dispose();
      material.dispose();
      if (sheet) { sheet.dispose(); wobble.dispose(); }
      renderer.dispose();
      canvas.remove();
    };
  });
})();
