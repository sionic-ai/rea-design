// Wave gradient behind the panel — color centers (round gradients) and water rings (spreading ripples) move separately.
// When the type (data-mode) changes, the two centers drift to new positions over 3 seconds, so the same background shows a different face in Hero, body, menu and footer
(() => {
  const MODES = {
    intro: { dur: 2, ease: "power2.inOut", c: [0.5, 0.5], w: [0.5, 0.5, 0.6, 0.8] },
    top: { dur: 3, ease: "power2.inOut", c: [0.2, 1], w: [0, 1.15, 0.6, 0.45], wSmall: 0.45 },
    normal: { dur: 3, ease: "power3.inOut", c: [0.2, 1], w: [0, 1, 0.9, 0.8], wSmall: 0.7 },
    navi: { dur: 3, ease: "power3.inOut", c: [0.2, 1], w: [0, 1, 0.9, 0.8], wSmall: 0.7 },
    footer: { dur: 3, ease: "power3.inOut", c: [0.2, 0.5], w: [0, 1, 0.9, 0.8], wSmall: 0.7 },
  };
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FRAG = `
    #define TAU 6.283185307179586
    varying vec2 vUv;
    uniform vec2 uColorAt, uWaterAt, uRes;
    uniform vec3 uC0, uC1, uC2, uC3;
    uniform float uTime, uScale, uFreq, uAmp, uGlow, uRadius, uThick, uFade;
    float band(vec2 p, vec2 o, float r, float t){
      float d = length(p - o);
      return smoothstep(r - t * 0.5, r, d) * (1.0 - smoothstep(r, r + t * 0.5, d));
    }
    void main(){
      float k = uRes.y / uRes.x;
      vec2 p = vec2(vUv.x, vUv.y * k);
      vec2 co = vec2(uColorAt.x, uColorAt.y * k);
      vec2 wo = vec2(uWaterAt.x, uWaterAt.y * k);
      vec2 off = p - co;
      float wave = sin(length(off) * TAU * (uFreq / uScale) - uTime) * (uAmp / uScale) * uScale;
      float bend = length(atan(off)) * wave;
      float d = distance(p, co) / (length(vec2(1.0, k)) * 0.5);
      vec3 col = mix(uC0, uC1, smoothstep(0.0, 0.3, d));
      col = mix(col, uC2, smoothstep(0.2, 1.0, d));
      col = mix(col, uC2, smoothstep(0.3, 1.0, d));
      col = mix(col, uC2, smoothstep(0.33, 1.0, d));
      col = mix(col, uC3 + bend * 0.1, band(p, wo, uRadius * uScale, uThick * uScale));
      col += smoothstep(0.0, 1.0, max(0.0, wave)) * uGlow;
      gl_FragColor = vec4(mix(col, uC2, uFade), 1.0);
    }`;

  // A skin color may be an oklch relative expression that cannot be read as a string — resolve it as text color and paint it on a canvas to get sRGB
  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const colorOf = (el, name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    swatch.clearRect(0, 0, 1, 1);
    swatch.fillStyle = c;
    swatch.fillRect(0, 0, 1, 1);
    const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(r / 255, g / 255, b / 255);
  };

  kfFx.register("ripple-gradient-bg", (el, { options, reduce }) => {
    if (!window.THREE) return;
    const freq = +(options.freq ?? 1.2), amp = +(options.amp ?? 0.8), glow = +(options.glow ?? 0.1), speed = +(options.speed ?? 1);
    const narrow = () => innerWidth < 768;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fx-rgb-canvas";
    el.append(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); } catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const u = {
      uColorAt: { value: new THREE.Vector2(0.5, 0.5) }, uWaterAt: { value: new THREE.Vector2(0.5, 0.5) }, uRes: { value: new THREE.Vector2(1, 1) },
      uC0: { value: new THREE.Color() }, uC1: { value: new THREE.Color() }, uC2: { value: new THREE.Color() }, uC3: { value: new THREE.Color() },
      uTime: { value: 0 }, uScale: { value: 1 }, uFreq: { value: freq }, uAmp: { value: amp }, uGlow: { value: glow },
      uRadius: { value: 0.8 }, uThick: { value: 0.8 }, uFade: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(mesh);
    const paint = () => ["uC0", "uC1", "uC2", "uC3"].forEach((n, i) => u[n].value.copy(colorOf(el, `--fx-grad-${i}`)));
    paint();

    const start = MODES[el.dataset.mode] || MODES.normal;
    const c = { x: start.c[0], y: start.c[1] };
    const w = { x: start.w[0], y: start.w[1], r: narrow() && start.wSmall ? start.wSmall : start.w[2], t: start.w[3] };
    let mode = el.dataset.mode || "normal";
    const footY = () => Math.min(1, Math.max(0, +(el.dataset.y ?? 0.5)));
    const go = (next) => {
      const m = MODES[next];
      if (!m) return;
      const fromIntro = mode === "intro" && next === "top";
      const cy = next === "footer" ? footY() : m.c[1];
      const dur = reduce ? 0 : fromIntro ? 1.5 : m.dur, delay = reduce ? 0 : fromIntro ? 1 : 0;
      gsap.to(c, { x: m.c[0], y: cy, duration: dur, delay, ease: m.ease, overwrite: true });
      gsap.to(w, { x: m.w[0], y: m.w[1], r: narrow() && m.wSmall ? m.wSmall : m.w[2], t: m.w[3], duration: dur, delay, ease: m.ease, overwrite: true });
      if (next === "navi" && !reduce) {
        const s = { v: 0, last: 0 };
        gsap.to(s, { v: 1, duration: 2, ease: "sine.inOut", onUpdate: () => { u.uTime.value += (s.v - s.last) * 5; s.last = s.v; } });
      }
      if (fromIntro && !reduce) {
        gsap.to(u.uFade, { value: 1, duration: 2, ease: "power1.inOut" });
        gsap.to(u.uAmp, { value: 0, duration: 1.5, ease: "power1.inOut" });
        gsap.delayedCall(2, () => {
          u.uTime.value = 0;
          gsap.to(u.uFade, { value: 0, duration: 2, ease: "power1.out" });
          gsap.to(u.uAmp, { value: 1, duration: 0.8, ease: "power1.inOut" });
        });
      }
      mode = next;
    };

    const size = () => {
      const r = el.getBoundingClientRect(), W = Math.max(1, r.width), H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      u.uRes.value.set(W, H);
      // The narrower the screen, the larger the pattern (1 at 1440, up to 3 toward 375)
      const s = Math.min(1, Math.max(0, (1440 - W) / Math.max(1, innerWidth - 375)));
      u.uScale.value = s * 2 + 1;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const mo = new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.attributeName === "data-mode" && el.dataset.mode !== mode) go(el.dataset.mode);
        if (m.attributeName === "data-y" && mode === "footer") gsap.to(c, { y: footY(), duration: reduce ? 0 : 0.6, ease: "power2.out", overwrite: "auto" });
      }
    });
    mo.observe(el, { attributes: true, attributeFilter: ["data-mode", "data-y"] });
    // Swapping skins re-reads the colors
    const themeMo = new MutationObserver(paint);
    themeMo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });

    let raf = 0, last = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      if (!reduce) u.uTime.value += dt * speed;
      u.uColorAt.value.set(c.x, c.y);
      u.uWaterAt.value.set(w.x, w.y);
      u.uRadius.value = w.r;
      u.uThick.value = w.t;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    const vis = () => { cancelAnimationFrame(raf); last = 0; if (!document.hidden) raf = requestAnimationFrame(frame); };
    document.addEventListener("visibilitychange", vis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", vis);
      ro.disconnect(); mo.disconnect(); themeMo.disconnect();
      gsap.killTweensOf([c, w, u.uFade, u.uAmp]);
      mesh.geometry.dispose(); mat.dispose(); renderer.dispose();
      canvas.remove();
    };
  });
})();
