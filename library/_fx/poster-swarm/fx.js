(() => {
  // Poster crowd — attach a screen-height stage (sticky) inside a long panel, and draw N posters (up to 64) as a single three instanced mesh.
  // Scrolling the board passes through the plan’s formations (fly·wall·ring·grid·roll·field·stack·trail·carousel·gone) in order, moving between them during the last 1.2 screens of each.
  // The scroll value follows a spring (natural frequency 18, critically damped) so the group stops slightly late after release. Fast-moving posters split into blurred RGB fringes.
  const three = () => (window.THREE?.WebGLRenderer ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const ease = (x) => x * x * (3 - 2 * x);
  const NAMES = ["fly", "wall", "ring", "grid", "roll", "field", "stack", "trail", "carousel", "gone"];

  kfFx.register("poster-swarm", (el, ctx) => {
    let off = null, gone = false;
    three().then((T) => { if (!gone && el.isConnected && T?.WebGLRenderer) off = build(el, ctx, T); });
    return () => { gone = true; off?.(); };
  });

  function build(el, { options, reduce, scroller }, T) {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const N = Math.min(64, Math.max(items.length, +(options.count || 48))), COLS = 8, ROWS = Math.ceil(N / COLS), CW = 192, CH = 240;
    const plan = String(options.plan || "fly,wall,ring,grid,roll,field,stack,trail").split(",").map((s) => s.trim()).filter((s) => NAMES.includes(s));
    const k = +(options.spring || 18), side = +(options.side ?? 0);
    if (!plan.length) return null;
    const cs = getComputedStyle(el), val = (n) => cs.getPropertyValue(n).trim() || cs.color;
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const F = {
      fly: (i, t) => [(rnd(i, 1) - 0.5) * 30, (rnd(i, 2) - 0.5) * 17, -26 + ((rnd(i, 3) * 32 + t * 0.9) % 32), (rnd(i, 4) - 0.5) * 1.4, (rnd(i, 5) - 0.5) * 1.6, (rnd(i, 6) - 0.5) * 1.2, 1.6],
      wall: (i) => { const c = i % COLS, r = Math.floor(i / COLS), x = (c - 3.5) * 1.7, y = (r - ROWS / 2 + 0.5) * 2.1, a = -0.5, rx = x * Math.cos(a) - y * Math.sin(a), ry = x * Math.sin(a) + y * Math.cos(a); return [rx * 1.2 + side, ry * 0.62 - 1, -4 + ry * 0.9, -0.95, 0, a, 1.5]; },
      gone: (i) => [(rnd(i, 1) - 0.5) * 30, -16 - rnd(i, 2) * 6, -10, 0, 0, 0, 0.001],
      ring: (i, t) => { const a = (i / N) * Math.PI * 2 + t * 0.12, R = 3.4 + (i % 2) * 0.5; return [side + Math.cos(a) * R, Math.sin(a) * R, 0, 0, 0, a - Math.PI / 2, 0.95]; },
      carousel: (i, t) => { const q = ((i + t * 0.6) % 16) - 8; return [side + q * 1.25, 0, -Math.abs(q) * 0.4, 0, -q * 0.08, 0, i < 16 ? 1.1 : 0.001]; },
      grid: (i) => { const c = i % 6, r = Math.floor(i / 6); return i < 36 ? [side + (c - 2.5) * 1.35, (r - 2.5) * 1.6, 0, 0, 0, 0, 0.95] : F.gone(i); },
      roll: (i, t) => { const a = (i / 16) * Math.PI * 2 + t * 0.4, row = Math.floor(i / 16); return i < 48 ? [side + Math.sin(a) * 3.2, (row - 1) * 2.4, Math.cos(a) * 3.2 - 2, 0, a, 0, 1] : F.gone(i); },
      field: (i) => [side + (rnd(i, 7) - 0.5) * 10, (rnd(i, 8) - 0.5) * 7, (rnd(i, 9) - 0.5) * 6 - 2, -0.6, 0, (rnd(i, 10) - 0.5) * 0.8, 0.8],
      stack: (i) => (i < 12 ? [side + i * 0.05, -i * 0.04, -i * 0.25, 0, 0, (i % 2 ? 1 : -1) * 0.04 * i, 2.4] : F.gone(i)),
      trail: (i) => (i < 14 ? [side - 2 + i * 0.55, 2.4 - i * 0.42, -i * 0.9, 0, -0.35, 0, 2.2] : F.gone(i)),
    };
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0, 0);
    const cv = renderer.domElement; cv.className = "fx-poster-swarm__gl"; cv.setAttribute("aria-hidden", "true");
    stage.prepend(cv);
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 80); camera.position.set(0, 0, 20);
    const scene = new T.Scene();
    const atlas = document.createElement("canvas"); atlas.width = CW * COLS; atlas.height = CH * ROWS;
    const tex = new T.CanvasTexture(atlas); tex.colorSpace = T.SRGBColorSpace;
    const paint = () => {
      const g = atlas.getContext("2d"), tones = [val("--kf-accent"), val("--kf-ink"), val("--kf-raised"), val("--kf-surface")];
      for (let i = 0; i < N; i++) {
        const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH, it = items[i % Math.max(1, items.length)], img = it?.querySelector("img");
        if (img?.complete && img.naturalWidth) {
          const s = Math.max(CW / img.naturalWidth, CH / img.naturalHeight), w = CW / s, h = CH / s;
          g.drawImage(img, (img.naturalWidth - w) / 2, (img.naturalHeight - h) / 2, w, h, x, y, CW, CH);
          continue;
        }
        g.fillStyle = tones[i % 4]; g.fillRect(x, y, CW, CH);
        g.fillStyle = i % 4 < 2 ? val("--kf-bg") : val("--kf-accent");
        g.fillRect(x + CW * 0.14, y + CH * (0.2 + (i % 3) * 0.08), CW * 0.42, CH * 0.5);
        g.fillStyle = i % 4 < 2 ? val("--kf-surface") : val("--kf-ink");
        g.font = `600 ${Math.round(CW * 0.13)}px ${val("--kf-font-display")}`;
        g.fillText((it?.dataset.title || it?.textContent || "").trim().slice(0, 10), x + 12, y + 30);
      }
      tex.needsUpdate = true;
    };
    const geo = new T.PlaneGeometry(1, 1.25);
    const slot = new Float32Array(N * 2), vel = new Float32Array(N);
    for (let i = 0; i < N; i++) { slot[i * 2] = i % COLS; slot[i * 2 + 1] = Math.floor(i / COLS); }
    geo.setAttribute("aSlot", new T.InstancedBufferAttribute(slot, 2));
    const va = new T.InstancedBufferAttribute(vel, 1); va.setUsage(T.DynamicDrawUsage); geo.setAttribute("aVel", va);
    const mat = new T.ShaderMaterial({
      transparent: true, side: T.DoubleSide, depthWrite: false,
      uniforms: { uMap: { value: tex }, uGrid: { value: new T.Vector2(COLS, ROWS) }, uFade: { value: 0 } },
      vertexShader: `attribute vec2 aSlot; attribute float aVel; varying vec2 vUv, vSlot; varying float vVel, vDepth;
        void main() { vUv = uv; vSlot = aSlot; vVel = aVel; vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uMap; uniform vec2 uGrid; uniform float uFade; varying vec2 vUv, vSlot; varying float vVel, vDepth;
        vec3 at(vec2 uv) { uv = clamp(uv, 0.002, 0.998); return texture2D(uMap, vec2((vSlot.x + uv.x) / uGrid.x, 1.0 - (vSlot.y + 1.0 - uv.y) / uGrid.y)).rgb; }
        void main() { float s = min(vVel, 1.0) * 0.06; vec3 c = vec3(at(vUv + vec2(s, 0.0)).r, at(vUv).g, at(vUv - vec2(s, 0.0)).b);
          vec2 e = min(vUv, 1.0 - vUv); gl_FragColor = vec4(c, smoothstep(0.0, 0.004 + s, min(e.x, e.y)) * smoothstep(2.0, 6.0, vDepth) * uFade); }`,
    });
    const mesh = new T.InstancedMesh(geo, mat, N); mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); scene.add(mesh);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), eu = new T.Euler(), v3 = new T.Vector3(), s3 = new T.Vector3();
    const prev = Array.from({ length: N }, () => new T.Vector3());
    const st = { raw: 0, shown: 0, pace: 0, t: 0, on: true, fade: reduce ? 1 : 0 };
    const pose = (p, i, t) => {
      const seg = Math.min(plan.length - 1, Math.max(0, Math.floor(p))), A = F[plan[seg]](i, t), nxt = plan[seg + 1];
      if (!nxt) return A;
      const w = ease(Math.min(1, Math.max(0, (p - seg - 0.6) / 0.4)));
      if (w <= 0) return A;
      const B = F[nxt](i, t), d = Math.min(1, w * (0.9 + rnd(i, 11) * 0.1));
      return A.map((v, j) => v + (B[j] - v) * d);
    };
    const size = () => { const w = stage.clientWidth || 1, h = stage.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const frame = (dt) => {
      if (!reduce) st.t += dt;
      const a = k * k * (st.raw - st.shown) - 2 * k * st.pace;
      st.pace += a * dt; st.shown += st.pace * dt;
      if (reduce) st.shown = st.raw;
      st.fade += (1 - st.fade) * Math.min(1, dt * 2.2); mat.uniforms.uFade.value = st.fade;
      for (let i = 0; i < N; i++) {
        const [x, y, z, rx, ry, rz, s] = pose(st.shown, i, st.t);
        v3.set(x, y, z); eu.set(rx, ry, rz); q.setFromEuler(eu); s3.set(s, s, s); m4.compose(v3, q, s3); mesh.setMatrixAt(i, m4);
        vel[i] = Math.min(1, prev[i].distanceTo(v3) / Math.max(dt, 0.001) / 40); prev[i].copy(v3);
      }
      mesh.instanceMatrix.needsUpdate = true; va.needsUpdate = true; renderer.render(scene, camera);
    };
    let last = 0, raf = 0;
    const loop = (now) => { raf = 0; if (!st.on) return; frame(Math.min(0.1, Math.max(0.001, (now - (last || now - 16)) / 1000))); last = now; raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => { st.on = e.isIntersecting; if (st.on && !raf) { last = 0; raf = requestAnimationFrame(loop); } }); io.observe(el);
    const trig = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: "top top", end: "bottom bottom", onUpdate: (s) => { st.raw = s.progress * plan.length; } });
    const ro = new ResizeObserver(size); ro.observe(stage);
    size(); paint(); document.fonts?.ready.then(paint);
    items.forEach((it) => it.querySelector("img")?.addEventListener("load", paint, { once: true }));
    renderer.compile(scene, camera); frame(0.016);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); trig.kill(); renderer.dispose(); tex.dispose(); geo.dispose(); mat.dispose(); cv.remove(); };
  }
})();
