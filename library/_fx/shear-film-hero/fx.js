// Draws the hero film in one shader and shifts the film’s center line sideways by the mouse’s horizontal position —
// Target push = (x / screen width · 2 − 1) · −amount, follows .1 of the remaining distance every frame (60fps).
// The shift is a parabola (1 − (2(y − .5))²) that is 0 at top and bottom and 1 in the middle, and shrinks by smoothstep toward both screen edges so the edges stay attached.
// Film content is ours instead of the original video — rays spreading from the center slowly cycle through four colors (video placeholder)
(() => {
  const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FS = `precision mediump float; varying vec2 vUv; uniform float uTime, uShift, uAspect; uniform vec3 uC0, uC1, uC2, uC3;
    vec3 pal(float t){ vec4 w = pow(0.5 + 0.5 * cos(6.2831853 * (t - vec4(0.0, 0.25, 0.5, 0.75))), vec4(3.0));
      return (uC0 * w.x + uC1 * w.y + uC2 * w.z + uC3 * w.w) / (w.x + w.y + w.z + w.w); }
    void main(){
      vec2 uv = vUv;
      float ramp = 1.0 - pow(2.0 * (uv.y - 0.5), 2.0);
      float sx = uv.x + uShift * ramp;
      float fade = smoothstep(0.0, 0.5, sx) * (1.0 - smoothstep(0.5, 1.0, sx));
      uv.x = mix(uv.x, sx, fade);
      vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
      float a = atan(p.y, p.x), r = length(p);
      float v = 0.5 + 0.25 * sin(a * 7.0 + uTime * 0.21 + 1.7 * sin(a * 3.0 - uTime * 0.13)) + 0.25 * sin(a * 13.0 - uTime * 0.17 + r * 3.0);
      vec3 col = pal(v * 0.7 + r * 0.55 - uTime * 0.035);
      col *= 0.55 + 0.45 * smoothstep(0.0, 0.22, r);
      gl_FragColor = vec4(col, 1.0);
    }`;
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, name) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    el.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    pg.clearRect(0, 0, 1, 1); pg.fillStyle = "transparent"; pg.fillStyle = c; pg.fillRect(0, 0, 1, 1);
    const d = pg.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("shear-film-hero", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "film-canvas");
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return; }
    el.prepend(canvas);
    const amount = +(options.amount ?? 0.2), follow = +(options.follow ?? 0.1), speed = +(options.speed ?? 1);
    const uniforms = { uTime: { value: 0 }, uShift: { value: 0 }, uAspect: { value: 1 },
      uC0: { value: new T.Vector3() }, uC1: { value: new T.Vector3() }, uC2: { value: new T.Vector3() }, uC3: { value: new T.Vector3() } };
    const colors = () => ["--fx-film-1", "--fx-film-2", "--fx-film-3", "--fx-film-4"].forEach((n, i) => uniforms[`uC${i}`].value.set(...rgbOf(el, n)));
    colors();
    const scene = new T.Scene(), cam = new T.Camera();
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: FS, depthTest: false, depthWrite: false })));
    const size = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      uniforms.uAspect.value = w / h;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    let goal = 0, shown = true, last = 0;
    const ac = new AbortController();
    if (hover && !reduce) addEventListener("mousemove", (e) => { goal = (e.clientX / innerWidth * 2 - 1) * -amount; }, { passive: true, signal: ac.signal });
    const io = new IntersectionObserver(([e]) => { shown = e.isIntersecting; });
    io.observe(el);
    const tick = (time) => {
      if (!shown) return;
      const now = time * 1000, dt = last ? Math.max(1, now - last) : 16.667;
      last = now;
      uniforms.uShift.value += (goal - uniforms.uShift.value) * (1 - Math.pow(1 - follow, dt / 16.667));
      uniforms.uTime.value = reduce ? 4 : time * speed;
      renderer.render(scene, cam);
    };
    if (reduce) { uniforms.uTime.value = 4; renderer.render(scene, cam); } else gsap.ticker.add(tick);
    return () => { ac.abort(); io.disconnect(); ro.disconnect(); gsap.ticker.remove(tick); renderer.dispose(); canvas.remove(); };
  });
})();
