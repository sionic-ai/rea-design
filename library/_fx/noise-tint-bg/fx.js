(() => {
  // Lays a fine noise grain over the background (three.js shader) — mixes two hash noises per cell (freq), cuts the coverage edge with a soft step,
  // Only where there is noise, the background color is pulled toward the grain color by strength × opacity. The grain steps once every speed seconds and drifts very slowly within jitter cells.
  // Opacity and coverage are multiplied by the square root of the pixel ratio (coverage .5 · opacity 1 at the end). If the panel is body it is fixed to the screen, otherwise it covers the panel
  const three = () => (window.THREE ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  kfFx.register("noise-tint-bg", (el, ctx) => {
    let off = null, gone = false;
    three().then((T) => { if (!gone && el.isConnected) off = build(el, ctx, T); });
    return () => { gone = true; off?.(); };
  });
  function build(el, { options, reduce }, T) {
    if (!T) return null;
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.append(probe);
    // Skin variables may be oklch relative colors — three.Color reads only rgb, so paint it on a one-cell canvas and convert to rgb
    const dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const color = (v) => {
      probe.style.color = v;
      dot.clearRect(0, 0, 1, 1);
      dot.fillStyle = getComputedStyle(probe).color;
      dot.fillRect(0, 0, 1, 1);
      const [r, g, b] = dot.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };
    const page = el === document.body || el === document.documentElement;
    const canvas = document.createElement("canvas");
    canvas.className = `fx-ntb${page ? " is-page" : ""}`;
    canvas.setAttribute("aria-hidden", "true");
    (page ? document.body : el).append(canvas);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false });
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const k = Math.sqrt(renderer.getPixelRatio());
    const own = getComputedStyle(el).backgroundColor;
    const bg = !own || /rgba\([^)]*,\s*0\)$/.test(own) || own === "transparent" ? color("var(--kf-bg)") : color(own);
    const uniforms = {
      uTime: { value: 0 },
      uFrequency: { value: (+(options.freq ?? 120) || 120) / Math.max(0.001, +(options.size ?? 1) || 1) },
      uOpacity: { value: Math.min(+(options.opacity ?? 0.25) * k, 1) },
      uCoverage: { value: Math.min(+(options.coverage ?? 0.25) * k, 0.5) },
      uTintColor: { value: new T.Color(color("var(--fx-noise-tint, var(--kf-dim))")) },
      uTintStrength: { value: +(options.strength ?? 0.25) },
      uBaseColor: { value: new T.Color(bg) },
      uSpeed: { value: Math.min(Math.max(+(options.speed ?? 120) || 120, 0.5), 600) },
      uSpeedJitter: { value: Math.min(Math.max(+(options.jitter ?? 0.1), 0), 1) },
    };
    const mat = new T.ShaderMaterial({
      uniforms, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `varying vec2 vUv;
        uniform float uTime, uOpacity, uCoverage, uTintStrength, uSpeed, uSpeedJitter, uFrequency;
        uniform vec3 uTintColor, uBaseColor;
        float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
        void main() {
          vec2 p = vUv * uFrequency;
          float tt = uTime / max(0.001, uSpeed), t0 = floor(tt), f = fract(tt);
          f = f * f * (3.0 - 2.0 * f);
          vec2 d = vec2(mix(hash12(vec2(t0, 12.345)), hash12(vec2(t0 + 1.0, 12.345)), f), mix(hash12(vec2(t0, 67.890)), hash12(vec2(t0 + 1.0, 67.890)), f));
          p += (d - 0.5) * 2.0 * uSpeedJitter;
          float n = (hash12(p) + hash12(p + 17.0)) * 0.5;
          float mask = smoothstep(0.5 - uCoverage, 0.5 + uCoverage, n);
          float s = clamp(mask * uTintStrength * uOpacity, 0.0, 1.0);
          gl_FragColor = vec4(mix(uBaseColor, uTintColor, s), s);
        }`,
    });
    const geo = new T.PlaneGeometry(2, 2);
    const scene = new T.Scene(), cam = new T.Camera();
    scene.add(new T.Mesh(geo, mat));
    const draw = () => renderer.render(scene, cam);
    const fit = () => {
      const w = page ? innerWidth : el.clientWidth, h = page ? innerHeight : el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      draw();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(page ? document.documentElement : el);
    fit();
    let raf = 0, last = 0, on = true;
    const io = page ? null : new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io?.observe(el);
    if (!reduce) {
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = last ? Math.max(0, now - last) / 1000 : 0;
        last = now;
        if (!on || document.hidden) return;
        uniforms.uTime.value += dt;
        draw();
      };
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io?.disconnect(); geo.dispose(); mat.dispose(); renderer.dispose(); canvas.remove(); probe.remove(); };
  }
})();
