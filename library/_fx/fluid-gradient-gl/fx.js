// A panel where mouse-pushed fluid (a velocity field fed back through ping-pong render targets) bends a four-color band gradient (WebGL · three).
// Within brush px around the cursor segment, force is applied in the direction of movement (max 10px per frame) and cools by decay each frame. When the cursor stops (within 2px), only the area around it settles stop times faster.
// The band flows slowly with time (speed), and coordinates are pushed by the fluid velocity, leaving swirl trails where the cursor passed
(() => {
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const SIM = `
    uniform sampler2D uPrev; uniform vec2 uRes; uniform vec4 uMouse; uniform float uOn, uBrush, uForce, uDecay, uStop;
    varying vec2 vUv;
    float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0); return length(pa - ba * h); }
    void main(){
      vec2 px = 1.0 / uRes;
      vec2 v0 = texture2D(uPrev, vUv).xy;
      vec2 at = vUv - v0 * px;
      vec4 s = texture2D(uPrev, at);
      vec4 nb = texture2D(uPrev, at + vec2(0.0, px.y)) + texture2D(uPrev, at - vec2(0.0, px.y)) + texture2D(uPrev, at + vec2(px.x, 0.0)) + texture2D(uPrev, at - vec2(px.x, 0.0));
      s = mix(s, nb * 0.25, 0.18);
      s.xy *= uDecay;
      if (uOn > 0.5) {
        vec2 p = vUv * uRes, d = uMouse.xy - uMouse.zw;
        float l = length(d);
        if (l > 0.0) d = min(l, 10.0) * d / l;
        float q = seg(p, uMouse.xy, uMouse.zw);
        s.xy += d * uForce * 0.12 * exp(-q * q / (uBrush * uBrush * 4.0));
        if (l < 2.0) s.xy *= mix(1.0, uStop, exp(-length(p - uMouse.xy) * 0.01));
      }
      gl_FragColor = vec4(clamp(s.xy, -12.0, 12.0), 0.0, 1.0);
    }`;
  const SHOW = `
    uniform sampler2D uFluid; uniform vec2 uRes; uniform float uTime, uWarp; uniform vec3 uC1, uC2, uC3, uC4;
    varying vec2 vUv;
    void main(){
      vec2 vel = texture2D(uFluid, vUv).xy;
      vec2 p = (vUv * uRes * 2.0 - uRes) / min(uRes.x, uRes.y);
      p += vel * 0.05 * uWarp;
      float t = uTime;
      vec2 q = p;
      for (int i = 0; i < 4; i++) { float f = float(i); q += 0.32 * vec2(sin(q.y * 1.6 + t * 1.1 + f * 1.3), cos(q.x * 1.4 - t * 0.9 + f * 1.9)); }
      float a = 0.5 + 0.5 * sin(q.x * 1.9 + t);
      float b = 0.5 + 0.5 * sin(q.y * 2.2 - t * 0.7 + 1.3);
      float c = pow(0.5 + 0.5 * sin((q.x - q.y) * 1.7 + t * 0.5 + 2.4), 3.0);
      vec4 w = pow(max(vec4((1.0 - a) * (1.0 - b) * (1.0 - c), a * (1.0 - b) * (1.0 - c), b * (1.0 - c), c), 0.0), vec4(0.8));
      w /= max(w.x + w.y + w.z + w.w, 1e-4);
      gl_FragColor = vec4(uC1 * w.x + uC2 * w.y + uC3 * w.z + uC4 * w.w, 1.0);
    }`;
  // Not skin: the original’s four colors (red, green, blue, white) are the fluid art itself, so only options change them
  const COLORS = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1]];
  const vec = (s, d) => { const n = String(s ?? "").trim().split(/[\s,]+/).map(Number); return n.length === 3 && n.every((x) => !Number.isNaN(x)) ? n : d; };

  kfFx.register("fluid-gradient-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    const canvas = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas"));
    canvas.classList.add("fx-fluid__canvas");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" }); } catch { return; }
    const narrow = innerWidth <= 767;
    const k = narrow ? 0.75 : 1;
    const brush = +(options.brush ?? 25) * (narrow ? 0.7 : 1), force = +(options.force ?? 10) * (narrow ? 0.8 : 1);
    const decay = +(options.decay ?? 0.98) * (narrow ? 0.95 : 1), stop = +(options.stop ?? 0.85), warp = +(options.warp ?? 1) * (narrow ? 0.8 : 1), speed = +(options.speed ?? 0.12);
    renderer.setPixelRatio(Math.min(devicePixelRatio, narrow ? 1.5 : 2));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const opts = { minFilter: T.LinearFilter, magFilter: T.LinearFilter, type: T.HalfFloatType, depthBuffer: false };
    let w = 2, h = 2, a = new T.WebGLRenderTarget(w, h, opts), b = new T.WebGLRenderTarget(w, h, opts);
    const sim = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: SIM, uniforms: { uPrev: { value: null }, uRes: { value: new T.Vector2(w, h) }, uMouse: { value: new T.Vector4() }, uOn: { value: 0 }, uBrush: { value: brush }, uForce: { value: force }, uDecay: { value: decay }, uStop: { value: stop } } });
    const show = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: SHOW, uniforms: { uFluid: { value: null }, uRes: { value: new T.Vector2(w, h) }, uTime: { value: 0 }, uWarp: { value: warp },
      uC1: { value: new T.Vector3(...vec(options.c1, COLORS[0])) }, uC2: { value: new T.Vector3(...vec(options.c2, COLORS[1])) }, uC3: { value: new T.Vector3(...vec(options.c3, COLORS[2])) }, uC4: { value: new T.Vector3(...vec(options.c4, COLORS[3])) } } });
    const geo = new T.PlaneGeometry(2, 2), simMesh = new T.Mesh(geo, sim), showMesh = new T.Mesh(geo, show);
    const size = () => {
      const r = el.getBoundingClientRect();
      const cw = Math.max(2, Math.round(r.width || innerWidth)), ch = Math.max(2, Math.round(r.height || innerHeight));
      renderer.setSize(cw, ch, false);
      w = Math.max(2, Math.floor(cw * k)); h = Math.max(2, Math.floor(ch * k));
      a.setSize(w, h); b.setSize(w, h);
      sim.uniforms.uRes.value.set(w, h); show.uniforms.uRes.value.set(w, h);
    };
    size();
    // Shaders are precompiled on setup — compiling on the first cursor move freezes the screen
    renderer.compile(simMesh, cam); renderer.compile(showMesh, cam);
    let mx = 0, my = 0, last = 0;
    const move = (e) => {
      const r = canvas.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
      const nx = (t.clientX - r.left) * (w / Math.max(1, r.width)), ny = h - (t.clientY - r.top) * (h / Math.max(1, r.height));
      sim.uniforms.uMouse.value.set(nx, ny, mx, my);
      mx = nx; my = ny; last = performance.now();
      sim.uniforms.uOn.value = 1;
    };
    const leave = () => { sim.uniforms.uOn.value = 0; };
    document.addEventListener("mousemove", move);
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const step = 1000 / (narrow ? 30 : 60);
    let raf = 0, prev = performance.now(), t0 = prev, seen = true;
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; });
    io.observe(el);
    const draw = (now) => {
      sim.uniforms.uPrev.value = b.texture;
      renderer.setRenderTarget(a); renderer.render(simMesh, cam);
      show.uniforms.uFluid.value = a.texture;
      show.uniforms.uTime.value = ((now - t0) / 1000) * speed;
      renderer.setRenderTarget(null); renderer.render(showMesh, cam);
      [a, b] = [b, a];
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!seen || document.hidden || now - prev < step) return;
      prev = now;
      if (now - last > 100) sim.uniforms.uOn.value = 0;
      draw(now);
    };
    if (reduce) draw(t0); else raf = requestAnimationFrame(loop);
    el.classList.add("is-fx-ready");
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener("mousemove", move); document.removeEventListener("touchmove", move); document.removeEventListener("mouseleave", leave);
      a.dispose(); b.dispose(); sim.dispose(); show.dispose(); geo.dispose(); renderer.dispose();
      if (canvas !== el) canvas.remove(); else canvas.classList.remove("fx-fluid__canvas");
      el.classList.remove("is-fx-ready");
    };
  });
})();
