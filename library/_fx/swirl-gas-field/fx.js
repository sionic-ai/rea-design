// Attach a panel-sized canvas and draw a gas swirl with polar differential rotation + fbm shader — colors are read from variables and re-read when data-theme changes
(() => {
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime, uSpin, uEnter, uEye;
    uniform vec2 uRes;
    uniform vec3 uC1, uC2, uC3, uC4;
    float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
    float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 4; i++){ s += a * n(p); p = m * p; a *= 0.5; } return s; }
    void main(){
      vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
      p.y *= uEye;
      float r = length(p), a = atan(p.y, p.x), t = uTime;
      // Differential rotation — the further inside, the more it twists. Use the angle only through cos and sin so no atan seam shows.
      float tw = a + 1.1 / (r + 0.35) - t * (1.0 + 0.8 / (r + 0.4));
      vec2 q = vec2(cos(tw), sin(tw)) * (0.7 + r * 1.2);
      vec2 w = vec2(fbm(q * 0.9 + t), fbm(q * 0.9 - t + 3.1));
      float gas = fbm(q * 1.3 + w * 1.2 + vec2(0.0, t * 1.5));
      float streak = fbm(q * vec2(2.4, 0.6) + vec2(log(r + 0.05) * 1.5, 0.0) + w);
      float dens = clamp(gas * 0.8 + streak * 0.45 - 0.2, 0.0, 1.0);
      float eye = smoothstep(1.15, 0.2, r);
      vec3 col = mix(uC3, uC2, smoothstep(0.15, 0.7, dens));
      col = mix(col, uC4, smoothstep(0.45, 0.0, dens) * smoothstep(0.5, 1.4, r) * 0.18);
      col = mix(col, uC2, eye * 0.92);
      gl_FragColor = vec4(mix(uC1, col, uEnter), 1.0);
    }`;
  kfFx.register("swirl-gas-field", (el, { options, reduce }) => {
    if (!window.THREE) return;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-swirl";
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false }); } catch (e) { return; }
    el.prepend(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const read = (v, fb) => new THREE.Color((getComputedStyle(el).getPropertyValue(v).trim() || getComputedStyle(el).getPropertyValue(fb).trim() || "gray"));
    const U = {
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uSpin: { value: +(options.spin ?? 1) }, uEye: { value: +(options.eye ?? 1.75) },
      uEnter: { value: 0 }, uC1: { value: null }, uC2: { value: null }, uC3: { value: null }, uC4: { value: null },
    };
    const paint = () => { U.uC1.value = read("--fx-c1", "--kf-bg"); U.uC2.value = read("--fx-c2", "--kf-raised"); U.uC3.value = read("--fx-c3", "--kf-accent"); U.uC4.value = read("--fx-c4", "--kf-accent-text"); };
    paint();
    const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: FRAG });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(mesh);
    const size = () => { const w = el.clientWidth || 1, hh = el.clientHeight || 1; renderer.setSize(w, hh, false); U.uRes.value.set(w, hh); };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    const mo = new MutationObserver(paint); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    let seen = true, clock = 0;
    const io = new IntersectionObserver((es) => (seen = es[0].isIntersecting)); io.observe(el);
    const spin = { k: reduce ? 1 : 4 };
    const enter = +(options.enter ?? 1.25), ease = kfFx.ease("0.16,1,0.3,1", "expo.out");
    const tweens = reduce || enter === 0 ? [] : [gsap.to(U.uEnter, { value: 1, duration: enter, ease }), gsap.to(spin, { k: 1, duration: enter * 2, ease })];
    if (!tweens.length) U.uEnter.value = 1, spin.k = 1;
    let last = 0;
    const tick = (time) => {
      const dt = last ? Math.max(0, time - last) : 0;
      last = time;
      if (!seen) return;
      if (!reduce) clock += dt * 0.06 * U.uSpin.value * spin.k;
      U.uTime.value = clock;
      renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick); tweens.forEach((t) => t.kill());
      ro.disconnect(); mo.disconnect(); io.disconnect();
      mesh.geometry.dispose(); mat.dispose(); renderer.dispose(); canvas.remove();
    };
  });
})();
