// One big blob sphere floats on one side of the board, and a raymarching scene where the tails of 15 small spheres following the cursor melt into it (one three.js board + our shader).
// Original values (Brand service CLICK section): tail 15 · radius 8e-3×(15−i) · smooth-min k 7 · 16 ray steps · .5x resolution · time ×2 · cursor follow .35 · tail on adds +.05 per frame
// · Two layers of reflection-direction noise (±time) blend two colors, ×2.3 then to the 7th power · big sphere (max(1.25, aspect × .75), .25) radius .82 (phone (.65, −.15) .8).
(() => {
  const VERT = "attribute vec3 position; void main(){ gl_Position = vec4(position, 1.0); }";
  const FRAG = `precision highp float;
    const int N = 15;
    uniform float uTime; uniform vec2 uRes; uniform vec2 uTrail[N]; uniform vec2 uBase; uniform float uBaseR; uniform float uOn;
    uniform vec3 uTintA; uniform vec3 uTintB; uniform vec3 uBg;
    float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
    float vnoise(vec3 p){
      vec3 i = floor(p), f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), u.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), u.x), u.y),
                 mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), u.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), u.x), u.y), u.z);
    }
    float smin(float a, float b, float k){ return -log(exp(-k * a) + exp(-k * b)) / k; }
    float field(vec3 p){
      float d = 1e5;
      vec2 asp = uRes / min(uRes.x, uRes.y);
      if (uOn > 0.01) {
        for (int i = 0; i < N; i++) {
          float r = (0.008 * float(N) - 0.008 * float(i)) * uOn;
          d = smin(d, length(p - vec3(uTrail[i] * asp, 0.0)) - r, 7.0);
        }
        return smin(d, length(p - vec3(uBase, 0.0)) - uBaseR, 7.0);
      }
      return length(p - vec3(uBase, 0.0)) - uBaseR;
    }
    vec3 normalAt(vec3 p){
      const float e = 1e-4;
      return normalize(vec3(field(p + vec3(e,0,0)) - field(p - vec3(e,0,0)), field(p + vec3(0,e,0)) - field(p - vec3(0,e,0)), field(p + vec3(0,0,e)) - field(p - vec3(0,0,e))));
    }
    void main(){
      vec2 q = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);
      vec3 ro = vec3(q, 1.0), rd = vec3(0.0, 0.0, -1.0);
      float d = 0.0;
      for (int i = 0; i < 16; i++) { d = field(ro); ro += rd * d; if (d < 1e-4) break; }
      vec3 c = vec3(0.0);
      if (d < 1e-4) {
        vec3 rf = reflect(rd, normalAt(ro));
        c = (uTintA * vnoise(rf * 2.0 + uTime) + uTintB * vnoise(rf * 2.0 - uTime)) * 2.3;
      }
      gl_FragColor = vec4(uBg + pow(c, vec3(7.0)), 1.0);
    }`;
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (el, name, fb) => {
    const cs = getComputedStyle(el);
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = cs.getPropertyValue(name).trim() || cs.getPropertyValue(fb).trim() || "transparent"; probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };

  kfFx.register("metaball-trail-gl", (el, { options, reduce }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    let canvas = el.querySelector('[data-fx-part="canvas"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.dataset.fxPart = "canvas"; canvas.setAttribute("aria-hidden", "true"); el.prepend(canvas); }
    const SCALE = +(options.res ?? 0.5) || 0.5, TIME = +(options.speed ?? 2), FOLLOW = +(options.follow ?? 0.35);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2) * SCALE);
    const trail = Array.from({ length: 15 }, () => new THREE.Vector2(9999, 9999));
    const U = {
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uTrail: { value: trail },
      uBase: { value: new THREE.Vector2(1.25, 0.25) }, uBaseR: { value: 0.82 }, uOn: { value: 0 },
      uTintA: { value: new THREE.Vector3() }, uTintB: { value: new THREE.Vector3() }, uBg: { value: new THREE.Vector3() },
    };
    const scene = new THREE.Scene(), cam = new THREE.Camera();
    const mat = new THREE.RawShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);
    const paint = () => { U.uTintA.value.set(...rgb(el, "--fx-tint-a", "--kf-accent")); U.uTintB.value.set(...rgb(el, "--fx-tint-b", "--kf-contrast-ink")); U.uBg.value.set(...rgb(el, "--fx-bg", "--kf-contrast-bg")); };
    paint();
    const place = () => {
      const r = el.getBoundingClientRect(), aspect = r.width / Math.max(1, r.height);
      renderer.setSize(r.width, r.height, false);
      U.uRes.value.set(canvas.width, canvas.height);
      const small = r.width <= 768 || aspect < 0.95;
      if (small) { U.uBase.value.set(+(options["m-x"] ?? 0.65), +(options["m-y"] ?? -0.15)); U.uBaseR.value = +(options["m-r"] ?? 0.8); }
      else { U.uBase.value.set(Math.max(+(options.x ?? 1.25), aspect * 0.75), +(options.y ?? 0.25)); U.uBaseR.value = +(options.r ?? 0.82); }
    };
    place();
    renderer.compile(scene, cam);
    renderer.render(scene, cam);
    if (reduce) return () => { renderer.dispose(); mat.dispose(); quad.geometry.dispose(); if (made) canvas.remove(); };

    const now = { x: 9999, y: 9999 }, target = { x: 9999, y: 9999 };
    let touched = false, running = false, raf = 0, t0 = performance.now();
    const setCoords = (cx, cy) => {
      if (!running) return;
      const r = canvas.getBoundingClientRect(), x = ((cx - r.left) / r.width) * 2 - 1, y = -((cy - r.top) / r.height) * 2 + 1;
      if (!touched) { touched = true; now.x = target.x = x; now.y = target.y = y; trail.forEach((v) => v.set(x, y)); }
      else { target.x = x; target.y = y; }
    };
    const onMove = (e) => setCoords(e.clientX, e.clientY);
    const onDown = (e) => { if (e.pointerType === "touch" && e.isPrimary) setCoords(e.clientX, e.clientY); };
    const frame = (t) => {
      if (!running) return;
      U.uTime.value = ((t - t0) / 1000) * TIME;
      if (touched) {
        U.uOn.value = Math.min(1, U.uOn.value + 0.05);
        now.x += (target.x - now.x) * FOLLOW; now.y += (target.y - now.y) * FOLLOW;
        for (let i = trail.length - 1; i > 0; i--) trail[i].copy(trail[i - 1]);
        trail[0].set(now.x, now.y);
      } else U.uOn.value = 0;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (running) return; running = true; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    let seen = false;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen && !document.hidden ? start() : stop(); }, { threshold: 0 });
    io.observe(el);
    const onVis = () => (document.hidden || !seen ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    document.body.addEventListener("pointermove", onMove);
    document.body.addEventListener("pointerdown", onDown);
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => {
      stop(); io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      document.body.removeEventListener("pointermove", onMove); document.body.removeEventListener("pointerdown", onDown);
      renderer.dispose(); mat.dispose(); quad.geometry.dispose();
      if (made) canvas.remove();
    };
  });
})();
