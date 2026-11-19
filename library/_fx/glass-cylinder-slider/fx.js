(() => {
  // Slides are attached to the inner face of a cylinder (radius 2.28) and drawn with three — camera z 3.72, the center slide is flat and wraps onto the cylinder toward the outside
  // Top and bottom edges open up to 35%. It turns .22 sheets per second by itself, with inertia (.94/frame) when dragged, and follows at .6× when scrolled.
  // On entering, slides fly in from 7 slides away at .08s intervals with 1.6s expo.out and settle. At 1024px and up, the 20% at both screen edges bulges and blurs like thick glass.
  // prev·next children go one at a time, .8s expo.out. Pressing a slide fires fx:pick (index) — if the slide is a link it goes to that address.
  const three = () => (window.THREE?.WebGLRenderer ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const QV = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

  kfFx.register("glass-cylinder-slider", (el, ctx) => {
    let off = null, gone = false;
    three().then((T) => { if (!gone && el.isConnected && T?.WebGLRenderer) off = build(el, ctx, T); });
    return () => { gone = true; off?.(); };
  });

  function build(el, { options, reduce }, T) {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return null;
    const cs = getComputedStyle(el), val = (n) => cs.getPropertyValue(n).trim() || cs.color;
    const R = +(options.radius || 2.28), CAMZ = +(options.camera || 3.72), speed = +(options.speed ?? 0.22), introOn = +(options.intro ?? 1) > 0;
    const RATIO = +(options.ratio || 1280 / 804), VIS = (86 * Math.PI) / 180, CUT = (115 * Math.PI) / 180, EDGE = +(options.edge ?? 0.35), GLASS_MIN = +(options.glass ?? 1024);
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0, 0);
    const cv = renderer.domElement; cv.className = "fx-glass-cylinder-slider__gl"; cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const camera = new T.PerspectiveCamera(40, 1, 0.01, 20); camera.position.set(0, 0, CAMZ);
    const scene = new T.Scene(), geo = new T.PlaneGeometry(1, 1 / RATIO, 48, 1);
    const tile = (s, i) => {
      const c = document.createElement("canvas"); c.width = 640; c.height = Math.round(640 / RATIO);
      const g = c.getContext("2d"), img = s.querySelector("img");
      if (img?.complete && img.naturalWidth) {
        const k = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight), w = c.width / k, h = c.height / k;
        g.drawImage(img, (img.naturalWidth - w) / 2, (img.naturalHeight - h) / 2, w, h, 0, 0, c.width, c.height);
      } else {
        g.fillStyle = val("--kf-contrast-bg"); g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = val("--kf-accent"); g.fillRect(60 + (i % 3) * 90, 70, 120 + (i % 4) * 40, c.height * 0.5);
      }
      g.fillStyle = val("--kf-contrast-ink"); g.font = `500 22px ${val("--kf-font-sans")}`;
      g.fillText((s.dataset.title || s.textContent || `Slide ${i + 1}`).trim().slice(0, 40), 22, c.height - 20);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    };
    const ring = [];
    while (ring.length < 12) for (let i = 0; i < slides.length && ring.length < 12; i++) ring.push(i);
    const texes = slides.map(tile);
    const VERT = `uniform float uPsi, uScale, uR, uEdge, uVis, uReach; varying vec2 vUv;
      void main() { vUv = uv; float t = position.x * uScale, psi = uPsi + t / uR;
        vec3 bent = vec3(uR * sin(psi), 0.0, -uR * cos(psi));
        vec3 fl = vec3(uR * sin(uPsi) + t * cos(uPsi), 0.0, -uR * cos(uPsi) + t * sin(uPsi));
        vec3 p = mix(fl, bent, smoothstep(0.0, 1.0, abs(uPsi) / uReach));
        p.y = position.y * (1.0 + uEdge * min(1.0, abs(atan(p.x, -p.z)) / uVis));
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`;
    const FRAG = "uniform sampler2D uMap; uniform float uAlpha; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(uMap, vUv).rgb, uAlpha); }";
    const meshes = ring.map((k) => {
      const m = new T.Mesh(geo, new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true,
        uniforms: { uMap: { value: texes[k] }, uAlpha: { value: 1 }, uPsi: { value: 0 }, uScale: { value: 1 }, uR: { value: R }, uEdge: { value: EDGE }, uVis: { value: VIS }, uReach: { value: 1.04 / R } } }));
      m.frustumCulled = false; scene.add(m); return m;
    });
    const base = 1 / R;
    let table = [], gapAt = () => 0.04, wpx = 300;
    const build2 = (gap) => {
      const ang = (s) => base * Math.abs(s), widen = (a) => 1 + EDGE * Math.min(1, Math.abs(a) / VIS), step = (s) => widen(ang(s)) + gap(ang(s));
      let s = 0, x = 0, z = -R; table = [{ x, z, psi: 0 }];
      for (let i = 1; i <= 512; i++) { const ds = step(s + (0.5 * step(s)) / 64) / 64, a = ang(s + ds / 2); x += Math.cos(a) * ds; z += Math.sin(a) * ds; s += ds; table.push({ x, z, psi: ang(s) }); }
    };
    const at = (s) => { const t = Math.min(64 * Math.abs(s), table.length - 1.001), i = Math.floor(t), f = t - i, a = table[i], b = table[i + 1]; return Math.sign(s || 1) * (a.psi + (b.psi - a.psi) * f); };
    const rt = new T.WebGLRenderTarget(2, 2);
    const post = new T.ShaderMaterial({ vertexShader: QV, transparent: true, depthTest: false, depthWrite: false,
      uniforms: { tScene: { value: rt.texture }, uRes: { value: new T.Vector2(1, 1) }, uGlass: { value: 1 } },
      fragmentShader: `uniform sampler2D tScene; uniform vec2 uRes; uniform float uGlass; varying vec2 vUv;
        vec4 frost(vec2 uv, float r) { vec4 a = texture2D(tScene, uv); float ws = 1.0;
          for (int i = 1; i < 32; i++) { float f = float(i), rr = sqrt(f / 31.0), an = f * 2.39996, w = 1.0 - 0.6 * rr; a += texture2D(tScene, uv + vec2(cos(an), sin(an)) * rr * r / uRes) * w; ws += w; }
          return a / ws; }
        vec4 smear(vec2 uv, vec2 dir, float sp) { vec4 a = vec4(0.0); for (int i = 0; i < 12; i++) a += texture2D(tScene, uv + dir * sp * (float(i) / 11.0 - 0.5)); return a / 12.0; }
        float hgt(vec2 p) { return sin(p.x * 7.0 + sin(p.y * 4.0) * 1.5) * 0.5 + sin(p.y * 9.0 - p.x * 3.0) * 0.5; }
        void main() {
          float asp = uRes.x / uRes.y, side = sign(vUv.x - 0.5), r = 1.0 - clamp((0.5 - abs(vUv.x - 0.5)) * asp / 0.2, 0.0, 1.0), g = r * uGlass, g3 = r * r * r * uGlass;
          vec4 c = texture2D(tScene, vUv);
          if (g > 0.001) {
            vec2 uv = vUv; uv.x -= side * 0.035 * g3; uv.y = 0.5 + (vUv.y - 0.5) / (1.0 + 0.14 * g3);
            vec2 q = vUv * vec2(asp, 1.0); float e = 0.002;
            uv += vec2(hgt(q + vec2(e, 0.0)) - hgt(q - vec2(e, 0.0)), hgt(q + vec2(0.0, e)) - hgt(q - vec2(0.0, e))) / (2.0 * e) * 0.004 * g;
            vec4 f = 0.7 * frost(uv, 42.0 * g) + 0.3 * smear(uv, vec2(side, 0.0), 0.06 * g3);
            f.rgb = mix(f.rgb, f.rgb * 0.88 + 0.07 * f.a, 0.6 * g); c = mix(c, f, smoothstep(0.0, 0.1, g));
          }
          gl_FragColor = c; }` });
    const quad = new T.PlaneGeometry(2, 2), pS = new T.Scene(); pS.add(new T.Mesh(quad, post));
    const pCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const st = { offset: 0, vel: 0, drag: false, t: introOn && !reduce ? 0 : null, on: true, slots: [] };
    const n = ring.length;
    const size = () => {
      const w = cv.clientWidth || el.clientWidth || 1, h = cv.clientHeight || el.clientHeight || 1, pr = renderer.getPixelRatio();
      const dist = (a, l) => (l * (CAMZ * Math.cos(a) + R)) / Math.pow(CAMZ + R * Math.cos(a), 2);
      let gap = () => 0.04, half = 1;
      for (let k = 0; k < 4; k++) { build2(gap); const p = at(2), e = p - gap(p) / 2 / R; half = ((R * Math.sin(e)) / (CAMZ + R * Math.cos(e)) / 1.33) * 0.73; const l = w / 2 / half; gap = (a) => 8 / dist(a, l); }
      build2(gap); gapAt = gap;
      camera.aspect = w / h; camera.fov = (2 * Math.atan(half / (w / h)) * 180) / Math.PI; camera.updateProjectionMatrix();
      wpx = (w / 2) * (1 / 6 / half);
      renderer.setSize(w, h, false); rt.setSize(Math.round(w * pr), Math.round(h * pr)); post.uniforms.uRes.value.set(w * pr, h * pr);
      post.uniforms.uGlass.value = innerWidth >= GLASS_MIN ? 1 : 0;
    };
    const frame = (ms) => {
      const dt = Math.min(ms / 1000, 0.1), d = dt * 60;
      if (!reduce) st.offset += (speed * d) / 60;
      if (st.t !== null) { st.t += dt; if (st.t > 1.6 + 6 * 0.08) st.t = null; }
      if (!st.drag && Math.abs(st.vel) > 2e-5) { st.offset += st.vel * d; st.vel *= Math.pow(0.94, d); }
      meshes.forEach((m, i) => {
        const r = T.MathUtils.euclideanModulo(i + st.offset + n / 2, n) - n / 2;
        const fly = st.t !== null ? 7 * (1 - expoOut(T.MathUtils.clamp((st.t - (3 - r) * 0.08) / 1.6, 0, 1))) : 0;
        const s = r - fly, a0 = at(s - 0.5), a1 = at(s + 0.5), psi = (a0 + a1) / 2, show = !(Math.abs(psi) > CUT || s < -n / 2);
        const sc = Math.max(0.2, R * (a1 - a0) - gapAt(psi));
        m.visible = show;
        const u = m.material.uniforms; u.uAlpha.value = show ? 1 : 0; u.uPsi.value = psi; u.uScale.value = sc;
        st.slots[i] = { psi, half: (0.5 * sc) / R, on: show };
      });
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(pS, pCam);
    };
    let last = 0, raf = 0;
    const loop = (now) => { raf = 0; if (!st.on) return; frame(Math.max(1, now - (last || now - 16))); last = now; raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => { st.on = e.isIntersecting; if (st.on && !raf) { last = 0; raf = requestAnimationFrame(loop); } }, { rootMargin: "200px 0px" });
    io.observe(el);
    const pick = (cx, cy) => {
      const rc = cv.getBoundingClientRect(), ray = new T.Raycaster();
      ray.setFromCamera(new T.Vector2(((cx - rc.left) / rc.width) * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1), camera);
      const o = ray.ray.origin, dv = ray.ray.direction, A = dv.x * dv.x + dv.z * dv.z, B = 2 * (o.x * dv.x + o.z * dv.z), C = o.x * o.x + o.z * o.z - R * R, D = B * B - 4 * A * C;
      if (D < 0 || !A) return -1;
      for (const t of [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)]) {
        if (t <= 0) continue;
        const x = o.x + dv.x * t, y = o.y + dv.y * t, ang = Math.atan2(x, -(o.z + dv.z * t));
        if (Math.abs(y) > (0.5 * (1 + EDGE * Math.min(1, Math.abs(ang) / VIS))) / RATIO) continue;
        const k = st.slots.findIndex((sl) => sl?.on && Math.abs(ang - sl.psi) <= sl.half);
        if (k >= 0) return ring[k];
      }
      return -1;
    };
    const toOff = (px) => px / wpx / (1 + gapAt(0));
    let lx = 0, lt = 0, sx = 0;
    const down = (e) => { if (e.target.closest('[data-fx-part="prev"],[data-fx-part="next"]')) return; st.drag = true; st.vel = 0; lx = sx = e.clientX; lt = performance.now(); };
    const move = (e) => {
      if (!st.drag) { if (el.contains(e.target) && e.pointerType === "mouse") el.style.cursor = pick(e.clientX, e.clientY) >= 0 ? "pointer" : "grab"; return; }
      const now = performance.now(), o = toOff(e.clientX - lx);
      st.offset += o; st.vel = (o / Math.max(1, now - lt)) * (1000 / 60); lx = e.clientX; lt = now;
    };
    const up = () => { st.drag = false; };
    const click = (e) => {
      const nav = e.target.closest('[data-fx-part="prev"],[data-fx-part="next"]');
      if (nav) { gsap.to(st, { offset: Math.round(st.offset) + (nav.dataset.fxPart === "next" ? 1 : -1), duration: reduce ? 0 : 0.8, ease: "expo.out" }); return; }
      if (Math.abs(e.clientX - sx) > 6) return;
      const k = pick(e.clientX, e.clientY);
      if (k < 0) return;
      el.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { index: k } }));
      const href = slides[k].getAttribute("href") || slides[k].querySelector("a")?.getAttribute("href");
      if (href) location.href = href;
    };
    let ly = scrollY;
    const scroll = () => { st.offset += 0.6 * toOff(scrollY - ly); ly = scrollY; };
    el.addEventListener("pointerdown", down); addEventListener("pointermove", move); addEventListener("pointerup", up); el.addEventListener("click", click);
    addEventListener("scroll", scroll, { passive: true });
    const ro = new ResizeObserver(size); ro.observe(el);
    size(); renderer.compile(scene, camera); renderer.compile(pS, pCam); frame(16);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); gsap.killTweensOf(st);
      el.removeEventListener("pointerdown", down); removeEventListener("pointermove", move); removeEventListener("pointerup", up); el.removeEventListener("click", click); removeEventListener("scroll", scroll);
      renderer.dispose(); rt.dispose(); texes.forEach((t) => t.dispose()); meshes.forEach((m) => m.material.dispose()); geo.dispose(); quad.dispose(); post.dispose(); cv.remove(); el.style.cursor = "";
    };
  }
})();
