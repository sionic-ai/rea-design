/* Poster swarm (three r182) — draws 64 posters as a single instanced mesh and moves between formations to match scroll position (in screen-height units).
   As in the original, the scroll value is followed by a spring (natural frequency 18), so it settles slightly late after you let go. Fast-moving posters bleed with split colors (RGB offset).
   Poster art is a placeholder painted with skin variables (red · blue · dark panels + figure silhouette + big text). Shaders are precompiled at setup. */
(() => {
  const T = window.THREE;
  if (!T) return;
  const { css, reduce } = window.PM;
  const N = 64, COLS = 8, CW = 192, CH = 240;
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const ease = (x) => x * x * (3 - 2 * x);

  /* Large — position (x,y,z) · rotation (x,y,z) · size. All in world units as seen from camera z 20 */
  const F = {
    fly: (i, t) => {
      if (i >= 28) return [(rnd(i, 1) - 0.5) * 30, -18, -30, 0, 0, 0, 0.001];
      const z = -24 + ((rnd(i, 3) * 30 + t * 0.9) % 30);
      return [(rnd(i, 1) - 0.5) * 34, (rnd(i, 2) - 0.5) * 19, z, (rnd(i, 4) - 0.5) * 1.4, (rnd(i, 5) - 0.5) * 1.6, (rnd(i, 6) - 0.5) * 1.2, 2.1];
    },
    wall: (i) => {
      const c = i % COLS, r = Math.floor(i / COLS), x = (c - 3.5) * 1.7, y = (r - 3.5) * 2.1;
      const a = -0.5, ca = Math.cos(a), sa = Math.sin(a), rx = x * ca - y * sa, ry = x * sa + y * ca;
      return [rx * 1.2, ry * 0.62 - 1, -4 + ry * 0.9, -0.95, 0, a, 1.5];
    },
    gone: (i) => [(rnd(i, 1) - 0.5) * 30, -16 - rnd(i, 2) * 6, -10, 0, 0, 0, 0.001],
    ring: (i, t) => {
      const a = (i / N) * Math.PI * 2 + t * 0.12, R = 3.4 + (i % 2) * 0.5;
      return [5.2 + Math.cos(a) * R, Math.sin(a) * R, 0, 0, 0, a - Math.PI / 2, 0.95];
    },
    carousel: (i, t) => { const k = ((i + t * 0.6) % 16) - 8; return [5 + k * 1.25, 0, -Math.abs(k) * 0.4, 0, -k * 0.08, 0, i < 16 ? 1.1 : 0.001]; },
    grid: (i) => { const c = i % 6, r = Math.floor(i / 6); return i < 36 ? [5 + (c - 2.5) * 1.35, (r - 2.5) * 1.6, 0, 0, 0, 0, 0.95] : F.gone(i); },
    roll: (i, t) => { const a = (i / 16) * Math.PI * 2 + t * 0.4, row = Math.floor(i / 16); return i < 48 ? [5 + Math.sin(a) * 3.2, (row - 1) * 2.4, Math.cos(a) * 3.2 - 2, 0, a, 0, 1] : F.gone(i); },
    field: (i) => [5 + (rnd(i, 7) - 0.5) * 10, (rnd(i, 8) - 0.5) * 7, (rnd(i, 9) - 0.5) * 6 - 2, -0.6, 0, (rnd(i, 10) - 0.5) * 0.8, 0.8],
    reveals: (i) => i < 12 ? [5.2 + i * 0.05, -i * 0.04, -i * 0.25, 0, 0, (i % 2 ? 1 : -1) * 0.04 * i, 2.4] : F.gone(i),
    trails: (i) => i < 14 ? [3 + i * 0.55, 2.4 - i * 0.42, -i * 0.9, 0, -0.35, 0, 2.2] : F.gone(i),
  };
  /* Scroll position (viewport height) → large size. It changes smoothly over the 1.2 screens before the next large size (up to 70% of the gap). The wall is handled by the DOM (.pm-wall) */
  const PLAN = [[0, "fly"], [3.4, "gone"], [9, "carousel"], [10.3, "ring"], [11.6, "grid"], [12.9, "roll"], [14.2, "field"], [15.5, "reveals"], [16.6, "trails"], [17.4, "fly"], [19.6, "gone"]];

  const build = (box) => {
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0, 0);
    box.append(renderer.domElement);
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 80); camera.position.set(0, 0, 20);
    const scene = new T.Scene();
    const atlas = document.createElement("canvas"); atlas.width = CW * COLS; atlas.height = CH * (N / COLS);
    const paint = () => {
      const g = atlas.getContext("2d"), tones = [css("--kf-accent"), css("--kf-ink"), css("--kf-raised"), css("--kf-surface")];
      for (let i = 0; i < N; i++) {
        const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH, tone = tones[i % 4], dark = i % 4 < 2;
        g.fillStyle = tone; g.fillRect(x, y, CW, CH);
        g.fillStyle = dark ? css("--kf-bg") : css("--kf-accent");
        if (i % 3 === 0) { g.beginPath(); g.ellipse(x + CW * (0.35 + rnd(i, 1) * 0.3), y + CH * 0.42, CW * 0.13, CH * 0.11, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x + CW * 0.3, y + CH * 0.52, CW * 0.38, CH * 0.4); }
        else if (i % 3 === 1) { g.fillRect(x + CW * 0.12, y + CH * 0.2, CW * 0.4, CH * 0.62); }
        else { g.beginPath(); g.moveTo(x + 10, y + CH - 20); g.lineTo(x + CW * 0.8, y + CH * 0.3); g.lineTo(x + CW * 0.85, y + CH * 0.42); g.closePath(); g.fill(); }
        g.fillStyle = dark ? css("--kf-surface") : css("--kf-ink");
        g.font = `600 ${Math.round(CW * 0.14)}px ${css("--kf-font-display")}`;
        g.fillText(["Signal", "Upward", "Paper", "Moder", "Flight", "Season"][i % 6], x + 12, y + 30);
      }
      tex.needsUpdate = true;
    };
    const tex = new T.CanvasTexture(atlas); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
    const geo = new T.PlaneGeometry(1, 1.25);
    const slot = new Float32Array(N * 2), vel = new Float32Array(N);
    for (let i = 0; i < N; i++) { slot[i * 2] = i % COLS; slot[i * 2 + 1] = Math.floor(i / COLS); }
    geo.setAttribute("aSlot", new T.InstancedBufferAttribute(slot, 2));
    const velAttr = new T.InstancedBufferAttribute(vel, 1); velAttr.setUsage(T.DynamicDrawUsage);
    geo.setAttribute("aVel", velAttr);
    const mat = new T.ShaderMaterial({
      transparent: true, side: T.DoubleSide, depthWrite: false,
      uniforms: { uMap: { value: tex }, uGrid: { value: new T.Vector2(COLS, N / COLS) }, uFade: { value: 0 } },
      vertexShader: `attribute vec2 aSlot; attribute float aVel; varying vec2 vUv; varying vec2 vSlot; varying float vVel; varying float vDepth;
        void main() { vUv = uv; vSlot = aSlot; vVel = aVel; vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uMap; uniform vec2 uGrid; uniform float uFade; varying vec2 vUv; varying vec2 vSlot; varying float vVel; varying float vDepth;
        vec3 at(vec2 uv) { uv = clamp(uv, 0.002, 0.998); return texture2D(uMap, vec2((vSlot.x + uv.x) / uGrid.x, 1.0 - (vSlot.y + 1.0 - uv.y) / uGrid.y)).rgb; }
        void main() {
          float s = min(vVel, 1.0) * 0.06;
          vec3 c = vec3(at(vUv + vec2(s, 0.0)).r, at(vUv).g, at(vUv - vec2(s, 0.0)).b);
          vec2 e = min(vUv, 1.0 - vUv); float edge = smoothstep(0.0, 0.004 + s, min(e.x, e.y));
          float near = smoothstep(2.0, 6.0, vDepth);
          gl_FragColor = vec4(c, edge * near * uFade);
        }`,
    });
    const mesh = new T.InstancedMesh(geo, mat, N); mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    scene.add(mesh);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), eu = new T.Euler(), v3 = new T.Vector3(), s3 = new T.Vector3();
    const prev = Array.from({ length: N }, () => new T.Vector3());
    const st = { raw: 0, shown: 0, pace: 0, t: 0, on: true, px: 0, py: 0, cx: 0, cy: 0, fade: 0, go: reduce, mx: 9, my: 9 };
    const push = Array.from({ length: N }, () => new T.Vector3());
    const scr = new T.Vector3();
    const size = () => { const w = box.clientWidth || 1, h = box.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const pose = (p, i, t) => {
      let k = 0;
      while (k < PLAN.length - 1 && p >= PLAN[k + 1][0]) k++;
      const [p0, a] = PLAN[k], next = PLAN[k + 1];
      const A = F[a](i, t);
      if (!next) return A;
      const win = Math.min(1.2, (next[0] - p0) * 0.45), w = ease(Math.min(1, Math.max(0, (p - (next[0] - win)) / win)));
      if (w <= 0) return A;
      const B = F[next[1]](i, t), d = w * 0.9 + (rnd(i, 11) * 0.1) * w;
      return A.map((v, j) => v + (B[j] - v) * Math.min(1, d));
    };
    const frame = (dt) => {
      st.t += reduce ? 0 : dt;
      /* Spring: natural frequency 18, critical damping */
      const w = 18, a = w * w * (st.raw - st.shown) - 2 * w * st.pace;
      st.pace += a * dt; st.shown += st.pace * dt;
      if (reduce) st.shown = st.raw;
      st.cx += (st.px - st.cx) * Math.min(1, dt * 4); st.cy += (st.py - st.cy) * Math.min(1, dt * 4);
      camera.position.x = st.cx * 0.6; camera.position.y = -st.cy * 0.4; camera.lookAt(0, 0, 0);
      if (st.go) st.fade += (1 - st.fade) * Math.min(1, dt * 9);
      mat.uniforms.uFade.value = st.fade;
      const p = st.shown + (st.shown < 3.4 ? 0 : 0);
      for (let i = 0; i < N; i++) {
        const [x, y, z, rx, ry, rz, s] = pose(p, i, st.t + (p < 3.4 ? p * 3 : 0));
        /* Cursor push — posters within .36 of the cursor on screen are pushed outward (max 2.6) and return to place within .8s */
        scr.set(x, y, z).project(camera);
        const dx = scr.x - st.mx, dy = scr.y - st.my, dd = Math.hypot(dx, dy), pw = !reduce && p < 3.4 && dd < 0.36 ? (1 - dd / 0.36) * 2.6 : 0;
        const P = push[i], kk = Math.min(1, dt * (pw ? 10 : 5));
        P.x += ((pw ? (dx / (dd || 1)) * pw : 0) - P.x) * kk; P.y += ((pw ? (dy / (dd || 1)) * pw : 0) - P.y) * kk;
        v3.set(x + P.x, y + P.y, z); eu.set(rx, ry, rz); q.setFromEuler(eu); s3.set(s, s, s);
        m4.compose(v3, q, s3); mesh.setMatrixAt(i, m4);
        vel[i] = Math.min(1, prev[i].distanceTo(v3) / Math.max(dt, 0.001) / 40); prev[i].copy(v3);
      }
      mesh.instanceMatrix.needsUpdate = true; velAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };
    let last = 0, raf = 0;
    const loop = (now) => { raf = 0; if (!st.on) return; frame(Math.min(0.1, Math.max(0.001, (now - (last || now - 16)) / 1000))); last = now; raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => { st.on = e.isIntersecting; if (st.on && !raf) { last = 0; raf = requestAnimationFrame(loop); } }).observe(box);
    addEventListener("mousemove", (e) => { st.px = e.clientX / innerWidth - 0.5; st.py = e.clientY / innerHeight - 0.5; st.mx = (e.clientX / innerWidth) * 2 - 1; st.my = -(e.clientY / innerHeight) * 2 + 1; }, { passive: true });
    document.addEventListener("mouseleave", () => { st.mx = st.my = 9; });
    new ResizeObserver(size).observe(box);
    size(); paint(); document.fonts?.ready.then(paint);
    renderer.compile(scene, camera); frame(0.016);
    raf = requestAnimationFrame(loop);
    return { set: (p) => { st.raw = p; }, start: () => { st.go = true; } };
  };

  window.PMStage = { build, plan: PLAN };
})();
