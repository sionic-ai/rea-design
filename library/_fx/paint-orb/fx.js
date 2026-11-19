(() => {
  // Paint-coated ball (three full-screen shader). The pattern plate is value noise on a six-step palette made from the skin accent color (deep night brown → accent → apricot → near white), and
  // The ball views that plate through a spherical lens and warps it with domain-warp noise, so the paint flows slowly (time .12/s). On press, a ripple ring spreads along the ball surface from the pressed spot (1.6s, up to three).
  // Pressing a tab child or sending fx:goto(number) rolls to another spot on the image (exponential .35s), and the paint is stirred while rolling (rise .12s · settle .7s) — one ripple from the center.
  const three = () => (window.THREE?.WebGLRenderer ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  const V = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

  kfFx.register("paint-orb", (el, ctx) => {
    let off = null, gone = false;
    three().then((T) => { if (!gone && el.isConnected && T?.WebGLRenderer) off = build(el, ctx, T); });
    return () => { gone = true; off?.(); };
  });

  function build(el, { options, reduce }, T) {
    const cs = getComputedStyle(el);
    const val = (n) => cs.getPropertyValue(n).trim() || cs.color;
    const rgb = (n) => { const c = new T.Color(); c.setStyle(val(n), T.SRGBColorSpace); const o = {}; c.getRGB(o, T.SRGBColorSpace); return new T.Color(o.r, o.g, o.b); };
    const frames = Math.max(2, +(options.frames || 3)), speed = +(options.speed ?? 0.12), seed = +(options.seed || 7);
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const holder = el.querySelector('[data-fx-part="ball"]') || el;
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0, 0);
    const cv = renderer.domElement; cv.className = "fx-paint-orb__gl"; cv.setAttribute("aria-hidden", "true");
    holder.append(cv);
    const acc = rgb("--kf-accent"), light = rgb("--kf-contrast-bg"), dark = rgb("--kf-bg").lerp(acc, 0.2).multiplyScalar(1.4);
    const stops = [dark, acc.clone(), acc.clone().lerp(light, 0.16), acc.clone().lerp(light, 0.36), acc.clone().lerp(light, 0.7), acc.clone().lerp(light, 0.93)];
    let s0 = seed;
    const rnd = () => ((s0 = (s0 * 16807) % 2147483647) - 1) / 2147483646;
    const lattice = (n) => { const a = new Float32Array(n * n).map(rnd); return (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, x0 = ((xi % n) + n) % n, y0 = ((yi % n) + n) % n, x1 = (x0 + 1) % n, y1 = (y0 + 1) % n;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a0 = a[y0 * n + x0], b0 = a[y0 * n + x1], a1 = a[y1 * n + x0], b1 = a[y1 * n + x1];
      return a0 + (b0 - a0) * sx + (a1 - a0) * sy + (a0 - b0 - a1 + b1) * sx * sy; }; };
    const fbm = () => { const o = [0, 1, 2, 3].map((k) => lattice(3 << k)); return (x, y) => { let s = 0, w = 0.5, t = 0; o.forEach((f, k) => { s += w * f(x * (3 << k), y * (3 << k)); t += w; w *= 0.5; }); return s / t; }; };
    const n0 = fbm(), n1 = fbm(), n2 = fbm(), N = 256, pc = document.createElement("canvas"); pc.width = pc.height = N;
    const g = pc.getContext("2d"), img = g.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      let t = n0(u + 0.3 * (n1(u, v) - 0.5), v + 0.3 * (n2(u, v) - 0.5));
      t = Math.min(1, Math.max(0, (t - 0.3) / 0.42)); t = t * t * (3 - 2 * t);
      const h = t * 5, i = Math.min(4, Math.floor(h)), c = stops[i].clone().lerp(stops[i + 1], h - i), k = (y * N + x) * 4;
      img.data[k] = c.r * 255; img.data[k + 1] = c.g * 255; img.data[k + 2] = c.b * 255; img.data[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const tex = new T.CanvasTexture(pc); tex.wrapS = tex.wrapT = T.RepeatWrapping;
    const rip = Array.from({ length: 3 }, () => new T.Vector4());
    const mat = new T.ShaderMaterial({
      vertexShader: V, transparent: true,
      uniforms: { uPaint: { value: tex }, uTime: { value: 0 }, uPx: { value: 0.01 }, uFrame: { value: new T.Vector4(0.8, 0, 0, 0) }, uStir: { value: 0 }, uRip: { value: rip }, uRim: { value: acc } },
      fragmentShader: `
        uniform sampler2D uPaint; uniform float uTime, uPx, uStir; uniform vec4 uFrame; uniform vec4 uRip[3]; uniform vec3 uRim; varying vec2 vUv;
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float vn(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z) * 2.0 - 1.0; }
        float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
        vec3 paint(vec2 uv) { float c = cos(uFrame.y), s = sin(uFrame.y); return texture2D(uPaint, mat2(c, -s, s, c) * (uv - 0.5) * uFrame.x + 0.5 + uFrame.zw).rgb; }
        void main() {
          vec2 p = (vUv - 0.5) * 2.0; float d = length(p);
          if (d > 1.0 + uPx * 2.0) { gl_FragColor = vec4(0.0); return; }
          float z = sqrt(max(0.0, 1.0 - min(d * d, 1.0))); vec3 n = normalize(vec3(p, z));
          vec2 uv = 0.5 + p / (1.0 + z) * 0.62; float glow = 0.0, slope = 0.0;
          for (int i = 0; i < 3; i++) {
            vec4 r = uRip[i]; if (r.w <= 0.0) continue;
            float a = r.z / 1.6, g0 = acos(clamp(dot(n, normalize(vec3(r.xy, sqrt(max(0.0, 1.0 - dot(r.xy, r.xy)))))), -1.0, 1.0));
            float rad = 2.2 * (1.0 - exp(-3.0 * a)), wd = 0.16 * (1.0 + rad * 0.6);
            float fade = r.w * exp(-2.0 * a) / sqrt(1.0 + rad) * (1.0 - smoothstep(0.85, 1.0, a)) * smoothstep(0.0, 0.15, g0);
            float b = (g0 - rad) / wd, wave = b * exp(-b * b);
            uv += (p / max(d, 0.001)) * wave * 0.05 * fade; glow += max(wave, 0.0) * fade; slope += wave * fade;
          }
          float tw = uStir * 1.4 * (1.0 - d * d); uv = mat2(cos(tw), -sin(tw), sin(tw), cos(tw)) * (uv - 0.5) + 0.5;
          float st = 1.0 + uStir * 1.5; vec2 w = uv * 2.2;
          vec2 q = vec2(fbm(vec3(w, uTime * 0.4)), fbm(vec3(w + vec2(5.2, 1.3), uTime * 0.4)));
          vec2 r2 = vec2(fbm(vec3(w + 1.6 * q + vec2(1.7, 9.2), uTime)), fbm(vec3(w + 1.6 * q + vec2(8.3, 2.8), uTime * 0.9)));
          uv += (n.xy * fbm(vec3(w + 1.6 * r2, uTime * 0.5)) * 0.08 + r2 * 0.05) * 0.8 * st;
          vec3 c = clamp(paint(uv) * 1.06, 0.0, 1.0);
          c = mix(c, vec3(1.0), clamp(glow * 0.35, 0.0, 1.0)); c *= 1.0 - clamp(slope, -1.0, 1.0) * 0.18;
          c = mix(c, c * vec3(0.55, 0.5, 0.62), smoothstep(0.35, 1.05, d) * (0.5 - 0.5 * dot(n, normalize(vec3(0.6, 0.7, 0.4)))) * 0.5);
          float rm = smoothstep(0.82, 1.0, d); c = mix(c, uRim, rm * rm * 0.3);
          c = mix(c, c + (fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.1, 0.35);
          float al = 1.0 - smoothstep(1.0 - max(uPx * 2.0, 0.054), 1.0 + uPx, d);
          gl_FragColor = vec4(c * al, al);
        }`,
    });
    const quad = new T.PlaneGeometry(2, 2), scene = new T.Scene(); scene.add(new T.Mesh(quad, mat));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fr = Array.from({ length: frames }, (_, i) => new T.Vector4(0.7 + 0.2 * (((i * 37) % 10) / 10), (((i * 53) % 10) / 10 - 0.5) * 0.6, 0.06 * i, -0.32 * i));
    let target = 0, at = 0, stir = 0, ri = 0, on = true, dirty = true, lastDraw = 0;
    const size = () => { const w = holder.clientWidth || 1; renderer.setSize(w, w, false); mat.uniforms.uPx.value = 2 / (w * renderer.getPixelRatio()); dirty = true; };
    const ripple = (x, y) => { rip[ri].set(x, y, 0, 1); ri = (ri + 1) % 3; dirty = true; };
    const draw = () => {
      const k = Math.min(Math.max(at, 0), frames - 1), a = Math.min(Math.floor(k), frames - 2), f = k - a, A = fr[a], B = fr[a + 1];
      mat.uniforms.uFrame.value.set(A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f, A.z + (B.z - A.z) * f, A.w + (B.w - A.w) * f);
      mat.uniforms.uStir.value = stir; renderer.render(scene, cam); dirty = false;
    };
    const tick = (t, ms) => {
      if (!on) return;
      const dt = Math.min(ms, 100) / 1000;
      mat.uniforms.uTime.value += speed * dt;
      rip.forEach((r) => { if (r.w) { r.z += dt; if (r.z > 1.6) r.w = 0; dirty = true; } });
      const prev = at;
      at += (target - at) * (1 - Math.exp(-dt / 0.35));
      const sp = Math.min((Math.abs(at - prev) / Math.max(dt, 0.001)) * 0.9, 1);
      stir += (sp - stir) * (1 - Math.exp(-dt / (sp > stir ? 0.12 : 0.7)));
      if (Math.abs(target - at) > 5e-4 || stir > 0.002) dirty = true;
      if (dirty || t - lastDraw > 0.03) { lastDraw = t; draw(); }
    };
    if (!reduce) gsap.ticker.add(tick);
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; }, { rootMargin: "200px 0px" }); io.observe(el);
    const goTo = (i) => {
      const n = ((i % frames) + frames) % frames;
      tabs.forEach((b, k) => b.setAttribute("aria-pressed", String(k === n)));
      if (n === target) return;
      target = n;
      if (reduce) { at = n; draw(); } else ripple(0, 0);
    };
    const click = (e) => {
      const b = e.target.closest('[data-fx-part="tab"]');
      if (b) { goTo(tabs.indexOf(b)); return; }
      const r = cv.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = -((e.clientY - r.top) / r.height - 0.5) * 2;
      if (x * x + y * y <= 1) ripple(x, y);
    };
    const onGo = (e) => goTo(+e.detail?.index || 0);
    el.addEventListener("click", click); el.addEventListener("fx:goto", onGo);
    const ro = new ResizeObserver(size); ro.observe(holder);
    size(); renderer.compile(scene, cam); draw(); goTo(0);
    return () => {
      gsap.ticker.remove(tick); io.disconnect(); ro.disconnect();
      el.removeEventListener("click", click); el.removeEventListener("fx:goto", onGo);
      renderer.dispose(); tex.dispose(); mat.dispose(); quad.dispose(); cv.remove();
    };
  }
})();
