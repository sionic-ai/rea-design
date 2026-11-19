(() => {
  // A four-color vertical gradient fills the panel, warped by four layers of sine waves to ripple slowly, with the bottom 40% melted to transparent (one three panel).
  // One wave layer = (strength · density · speed · two phases). Coordinates are warped layer by layer in turn, so the spot bent by the front layer is bent again by the next layer
  const WAVES = [
    [0.1, 1, 1, 1.2, 3.4],
    [0.06, 2.7, 0.8, 3.5, 0.4],
    [0.08, 1.8, 0.6, 1.2, 3.1],
    [0.16, 0.5, 0.4, 0.8, 2.4],
  ];
  const VERT = `varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const FRAG = `precision highp float;
uniform float uTime;
uniform float uAmp;
uniform float uShift;
uniform float uFade;
uniform vec4 uWave[4];
uniform vec2 uPhase[4];
uniform vec3 uStop[4];
varying vec2 vUv;
vec3 ramp(float t) {
  const float third = 1.0 / 3.0;
  if (t < third) return mix(uStop[0], uStop[1], smoothstep(0.0, third, t));
  if (t < 2.0 * third) return mix(uStop[1], uStop[2], smoothstep(third, 2.0 * third, t));
  return mix(uStop[2], uStop[3], smoothstep(2.0 * third, 1.0, t));
}
void main() {
  vec2 q = vUv * 2.0 - 1.0;
  for (int i = 0; i < 4; i++) {
    vec4 w = uWave[i];
    q += uAmp * w.x * sin(w.y * q.yx + uPhase[i] + uTime * w.z);
  }
  float t = clamp(0.5 + 0.5 * q.y - uShift, 0.0, 1.0);
  gl_FragColor = vec4(ramp(t), smoothstep(0.0, uFade, vUv.y));
}`;

  // Convert skin variables (including oklch relative colors) to sRGB bytes — paint on a canvas and read back
  const probeCtx = () => document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const readColor = (el, name, fallback, ctx) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name}, ${fallback})`;
    el.append(probe);
    const css = getComputedStyle(probe).color;
    probe.remove();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("sine-warp-gradient-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    const amp = +(options.amp ?? 5), speed = +(options.speed ?? 1.5), shift = +(options.shift ?? 0.25), fade = +(options.fade ?? 0.4);
    const narrowAt = +(options.narrow || 650);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fx-swg-canvas";
    el.prepend(canvas);
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
    } catch {
      canvas.remove();
      return;
    }
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const ctx = probeCtx();
    const fall = ["oklch(from var(--kf-accent) calc(l * 1.42) calc(c * .27) calc(h - 19))", "oklch(from var(--kf-accent) calc(l * 1.27) calc(c * .55) calc(h - 11))", "oklch(from var(--kf-accent) calc(l * 1.22) calc(c * .71) calc(h + 15))", "oklch(from var(--kf-accent) calc(l * 1.13) calc(c * .9) calc(h + 9))"];
    const stops = () => fall.map((f, i) => new T.Color().setRGB(...readColor(el, `--fx-c${i + 1}`, f, ctx), T.SRGBColorSpace));
    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: amp },
      uShift: { value: shift },
      uFade: { value: fade },
      uWave: { value: WAVES.map((w) => new T.Vector4(w[0], w[1], w[2], 0)) },
      uPhase: { value: WAVES.map((w) => new T.Vector2(w[3], w[4])) },
      uStop: { value: stops() },
    };
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new T.PlaneGeometry(2, 2);
    const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false });
    const mesh = new T.Mesh(geo, mat);
    mesh.frustumCulled = false;
    scene.add(mesh);
    // Precompile shaders when building the world — compiling on the first frame freezes the screen briefly.
    renderer.compile(scene, camera);

    let rate = 1;
    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      const narrow = innerWidth <= narrowAt;
      renderer.setPixelRatio(Math.min(narrow ? 1 : 1.5, devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      uniforms.uAmp.value = amp * (narrow ? 0.33 : 1);
      rate = narrow ? 1.5 : 1;
    };
    size();
    let visible = true, raf = 0, last = performance.now(), t = 0;
    const frame = (now) => {
      if (!visible) { raf = 0; return; }
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      t += speed * dt * rate;
      uniforms.uTime.value = t;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && visible && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0 });
    io.observe(el);
    const ro = new ResizeObserver(() => { size(); renderer.render(scene, camera); });
    ro.observe(el);
    // When the skin is swapped (theme replaced or data-theme), read the colors again
    const mo = new MutationObserver(() => { uniforms.uStop.value = stops(); renderer.render(scene, camera); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    renderer.render(scene, camera);
    start();
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
