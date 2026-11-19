// Halftone flow: a pattern warped by sine waves is stamped as dots on a 45° staggered grid and neighboring dots stick together gooey (WebGL, three).
// Holding makes the pattern flow bigger and faster, and releasing lets it slowly return — Brand footer bottom. The shader is newly written after measuring the original.
(() => {
  const FRAG = `
    precision highp float;
    uniform vec2 uRes; uniform float uT, uAmp, uReveal, uCell, uGoo, uGain, uBias, uInvert; uniform vec3 uPaper, uInk;
    varying vec2 vUv;
    float flow(vec2 q) {
      vec2 p = q * 2.0 - 1.0;
      float a = uAmp * uReveal;
      p += a * vec2(0.42 * sin(p.y * 0.9 + uT + 1.3), 0.36 * sin(p.x * 1.1 - uT * 0.8 + 0.2));
      p += a * vec2(0.18 * sin(p.y * 4.9 + uT * 1.3 + 2.6), 0.22 * sin(p.x * 4.1 - uT + 0.9));
      p += a * vec2(1.5 * sin(p.y * 0.42 + uT * 0.7 + 0.5), 1.7 * sin(p.x * 0.36 - uT * 0.6 + 2.2));
      float d = length(p);
      return clamp(0.5 + 0.55 * cos(d * 2.1 + 0.4) * cos(d * 0.7), 0.0, 1.0);
    }
    float radiusFor(float v, float s) {
      float k = clamp((v - 0.5 + uBias) * uGain + 0.5, 0.0, 1.0);
      if (uInvert > 0.5) k = 1.0 - k;
      return k * s * 0.6 + s * 0.05;
    }
    float blend(float a, float b, float k) {
      if (k < 0.001) return min(a, b);
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    void main() {
      vec2 px = vUv * uRes;
      float s = uCell;
      vec2 g = vec2(px.x + px.y, px.y - px.x) / (2.0 * s);
      vec2 base = floor(g);
      float dmin = 1e5;
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          vec2 c = base + vec2(float(i), float(j)) + 0.5;
          vec2 cp = vec2(c.x - c.y, c.x + c.y) * s;
          float r = radiusFor(flow(cp / uRes), s * 1.41421356 * 0.75);
          dmin = blend(dmin, length(px - cp) - r, uGoo * 1.5 * s);
        }
      }
      float aa = max(fwidth(dmin), 0.0001);
      float dot = 1.0 - smoothstep(-aa, aa, dmin);
      gl_FragColor = vec4(mix(uPaper, uInk, dot) * uReveal, 1.0);
    }`;
  kfFx.register("halftone-flow", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    const cs = getComputedStyle(el);
    const pick = (a, b) => (cs.getPropertyValue(a) || cs.getPropertyValue(b) || "").trim();
    const num = (k, d) => +(options[k] ?? d);
    const P = { amp: num("amp", 0.8), speed: num("speed", 0.0045), hold: num("hold", 2), holdSpeed: num("hold-speed", 1.5), lerp: num("lerp", 0.03), reveal: num("reveal", 2), delay: num("delay", 0.3), cell: +options.cell || 4, goo: num("goo", 0.58), gain: num("contrast", 1.5), bias: num("bias", 0), invert: num("invert", 1) };
    const canvas = el.querySelector('[data-fx-part="canvas"]') || el.appendChild(document.createElement("canvas"));
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: false, antialias: false }); } catch { return; }
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const U = {
      uRes: { value: new T.Vector2(1, 1) }, uT: { value: 0 }, uAmp: { value: P.amp }, uReveal: { value: 0 }, uCell: { value: P.cell }, uGoo: { value: P.goo }, uGain: { value: P.gain }, uBias: { value: P.bias }, uInvert: { value: P.invert },
      uPaper: { value: new T.Color(pick("--fx-paper", "--kf-bg") || 0) }, uInk: { value: new T.Color(pick("--fx-ink", "--kf-ink") || 0) },
    };
    const geo = new T.PlaneGeometry(2, 2);
    const mat = new T.ShaderMaterial({ uniforms: U, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: FRAG });
    scene.add(new T.Mesh(geo, mat));
    const st = { hold: false, amp: P.amp, speed: P.speed }, rev = { v: 0 };
    const down = () => (st.hold = true), up = () => (st.hold = false);
    el.addEventListener("pointerdown", down); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(1); renderer.setSize(w, h, false);
      U.uRes.value.set(w, h);
    };
    const ro = new ResizeObserver(size); ro.observe(el);
    let last = 0;
    const frame = (time) => {
      const now = time * 1000;
      if (!last) last = now;
      const n = Math.min(Math.max(1, now - last) / (1000 / 60), 3);
      last = now;
      const k = 1 - (1 - P.lerp) ** n;
      st.amp += ((st.hold ? P.amp * P.hold : P.amp) - st.amp) * k;
      st.speed += ((st.hold ? P.speed * P.holdSpeed : P.speed) - st.speed) * k;
      U.uAmp.value = st.amp; U.uT.value += st.speed * n;
      renderer.render(scene, cam);
    };
    let on = false, seen = true;
    const start = () => { if (!on && !reduce) { last = 0; gsap.ticker.add(frame); on = true; } };
    const stop = () => { if (on) { gsap.ticker.remove(frame); on = false; } };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? start() : stop(); }); io.observe(el);
    const vis = () => (document.hidden ? stop() : seen && start()); document.addEventListener("visibilitychange", vis);
    size();
    if (reduce) { U.uReveal.value = 1; renderer.render(scene, cam); }
    else gsap.to(rev, { v: 1, duration: P.reveal, delay: P.delay, ease: kfFx.ease(options.ease || "0.31,0.75,0.22,1", "power2.out"), onUpdate: () => (U.uReveal.value = rev.v) });
    start();
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); el.removeEventListener("pointerdown", down); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); gsap.killTweensOf(rev); geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); if (!canvas.hasAttribute("data-fx-part")) canvas.remove(); };
  });
})();
