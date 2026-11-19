// Hero covered by a single-color panel with a logo-shaped hole showing the scene beyond.
// Open: morphs from a dot (radius .01) to the logo shape over .9s (cubic in-out), and near the end the panel swells once on an e^12 beat and spreads (uv 1.4 → 1.2, soft edge).
// Scroll: as you pass the section the plate approaches the camera (size 1/(1 − p)) and the hole passes beyond the screen, with barrel distortion −p·6 bending the edges.
// Mouse: the pattern is pushed by the trail left where it passed (radius .095, grows in the first 30% and fades over 600ms), and before scrolling grain noise is mixed in by (1 − p)^4
(() => {
  const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FS = `precision highp float; varying vec2 vUv;
    uniform float uReveal, uPulse, uProgress, uAspect, uFluid, uNoise, uBarrel, uUvScale, uPulseMult, uMobile;
    uniform sampler2D uTrail; uniform vec3 uColor;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float noise(vec2 x){ vec2 i = floor(x), f = fract(x); float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f); return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y; }
    vec2 barrel(vec2 uv, float s){ vec2 st = uv - 0.5; return 0.5 + (1.0 + s * dot(st, st)) * st; }
    float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
    float circle(vec2 p, vec2 c, float r){ return length(p - c) - r; }
    // Our logo shape — two big blobs smoothly joined, with one separate dot below (a blob like a question mark or footprint)
    float shape(vec2 p){
      float d = smin(circle(p, vec2(0.06, 0.15), 0.2), circle(p, vec2(-0.17, 0.04), 0.12), 0.12);
      d = smin(d, circle(p, vec2(0.15, -0.08), 0.1), 0.09);
      d = smin(d, circle(p, vec2(0.0, -0.19), 0.075), 0.1);
      d = min(d, circle(p, vec2(-0.16, -0.34), 0.06));
      d = min(d, smin(circle(p, vec2(0.3, 0.33), 0.07), circle(p, vec2(0.38, 0.36), 0.045), 0.05));
      return d;
    }
    void main(){
      float pulse = uPulse * uPulseMult;
      vec2 uv = (vUv - 0.5) * (1.0 - min(uProgress, 0.98)) + 0.5;
      uv = (uv - 0.5) * (uUvScale - pulse) + 0.5;
      uv = barrel(uv, -uProgress * uBarrel);
      if (uMobile < 0.5) {
        float fn = pow(1.0 - uProgress, 4.0) * noise(uv * 1000.0) * uNoise;
        uv -= texture2D(uTrail, vUv).rg * fn * uFluid;
      }
      vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
      vec2 c = (vUv - 0.5) * vec2(uAspect, 1.0);
      float sdf = mix(shape(p), length(c) - 0.01, 1.0 - uReveal);
      float mask = mix(smoothstep(0.001, 0.003, sdf), smoothstep(0.0, 0.003, sdf), pow(uReveal, 4.0));
      if (uMobile < 0.5) { mask = mix(mask, length(c) + smoothstep(-1.0, 1.0, sdf) + 0.3, uPulse); mask = pow(clamp(mask, 0.0, 1.0), 4.0); }
      gl_FragColor = vec4(uColor * mask, mask);
    }`;
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, name) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    el.append(i);
    const css = getComputedStyle(i).color;
    i.remove();
    pg.clearRect(0, 0, 1, 1); pg.fillStyle = "transparent"; pg.fillStyle = css; pg.fillRect(0, 0, 1, 1);
    const d = pg.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("shape-hole-hero", (el, { options, reduce, hover, scroller }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "hole-canvas");
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true }); } catch { return; }
    el.append(canvas);
    const mobile = !hover;
    const uniforms = {
      uReveal: { value: 0 }, uPulse: { value: 0 }, uProgress: { value: 0 }, uAspect: { value: 1 },
      uFluid: { value: +(options.fluid ?? 0.6) }, uNoise: { value: +(options.noise ?? 0.6) }, uBarrel: { value: mobile ? +(options.barrelMobile ?? 1.5) : +(options.barrel ?? 6) },
      uUvScale: { value: +(options.scale ?? 1.4) }, uPulseMult: { value: +(options.pulse ?? 0.2) }, uMobile: { value: mobile ? 1 : 0 },
      uTrail: { value: null }, uColor: { value: new T.Vector3(...rgbOf(el, "--fx-hole")) },
    };
    // Mouse trail — one dot at the cursor each frame. The dot grows along a quarter-circle curve over the first 30% of its life and shrinks away over the remaining 70%,
    // Size grows with the squared distance from the previous point ×10k (.5~1). Every frame the board is cleared and the live points are redrawn with difference
    const SZ = 256;
    const tc = document.createElement("canvas");
    tc.width = tc.height = SZ;
    const tg = tc.getContext("2d");
    tg.fillStyle = "black"; tg.fillRect(0, 0, SZ, SZ); // Not skin: plate holding mark intensity (values, not colors)
    const trail = new T.CanvasTexture(tc);
    uniforms.uTrail.value = trail;
    const radius = +(options.radius ?? 0.095) * SZ, life = +(options.life ?? 600);
    const touches = [], circOut = (t) => Math.sqrt(1 - (t - 1) ** 2);
    let force = 0;
    const scene = new T.Scene(), cam = new T.Camera();
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: FS, transparent: true, depthTest: false })));
    const size = () => {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(innerWidth, innerHeight, false);
      uniforms.uAspect.value = innerWidth / innerHeight;
    };
    size();
    addEventListener("resize", size);
    let px = -1, py = -1, last = 0, moved = false;
    const ac = new AbortController();
    if (!mobile && !reduce) addEventListener("pointermove", (e) => { px = e.clientX / innerWidth; py = e.clientY / innerHeight; moved = true; }, { passive: true, signal: ac.signal });
    const st = window.ScrollTrigger ? ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom top", onUpdate: (s) => { uniforms.uProgress.value = s.progress; } }) : null;
    // Open .9s — e of cubic in-out is the shape, e^12 is the swell
    let t0 = null;
    // With fx:reveal detail.instant it stands already open — for returning to a hero already seen
    const open = (e) => { if (t0 !== null) return; t0 = e?.detail?.instant ? performance.now() - 900 : performance.now(); };
    if (reduce) { uniforms.uReveal.value = 1; uniforms.uPulse.value = 0; }
    else if (options.reveal === "manual") el.addEventListener("fx:reveal", open, { signal: ac.signal });
    else open();
    const tick = (time) => {
      const now = time * 1000, dt = last ? Math.max(1, now - last) : 16.667;
      last = now;
      if (t0 !== null && !reduce) {
        const t = Math.min(1, (performance.now() - t0) / 900), e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
        uniforms.uReveal.value = e;
        uniforms.uPulse.value = t >= 1 ? 0 : e ** 12;
        if (t >= 1 && !el.dataset.revealed) { el.dataset.revealed = "1"; el.dispatchEvent(new CustomEvent("fx:revealed", { bubbles: true })); }
      }
      if (px >= 0 && moved) {
        moved = false;
        const prev = touches[touches.length - 1];
        if (prev) force = Math.max(0.5, Math.min(1e4 * ((prev.x - px) ** 2 + (prev.y - py) ** 2), 1));
        touches.push({ x: px, y: py, age: 0, force });
      }
      for (const t of touches) t.age += dt;
      while (touches.length && touches[0].age > life) touches.shift();
      if (!touches.length) force = 0;
      tg.globalCompositeOperation = "source-over";
      tg.fillStyle = "black"; tg.fillRect(0, 0, SZ, SZ); // Not skin: clear the mark panel
      tg.globalCompositeOperation = "difference";
      for (const t of touches) {
        const k = (t.age < 0.3 * life ? circOut(t.age / (0.3 * life)) : circOut(1 - (t.age - 0.3 * life) / (0.7 * life))) * t.force, r = Math.max(0, radius * k);
        if (r <= 0) continue;
        // CanvasTexture is uploaded flipped vertically, so the panel y stays as the screen y
        const g = tg.createRadialGradient(t.x * SZ, t.y * SZ, 0.25 * r, t.x * SZ, t.y * SZ, r);
        g.addColorStop(0, "rgba(255,255,255,0.1)"); g.addColorStop(1, "rgba(0,0,0,0)"); // Not skin: mark intensity .1
        tg.fillStyle = g; tg.beginPath(); tg.arc(t.x * SZ, t.y * SZ, r, 0, Math.PI * 2); tg.fill();
      }
      trail.needsUpdate = true;
      canvas.style.visibility = uniforms.uProgress.value >= 0.98 ? "hidden" : "visible";
      renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    return () => { ac.abort(); removeEventListener("resize", size); st?.kill(); gsap.ticker.remove(tick); trail.dispose(); renderer.dispose(); canvas.remove(); delete el.dataset.revealed; };
  });
})();
