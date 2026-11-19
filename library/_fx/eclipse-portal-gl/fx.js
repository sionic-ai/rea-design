// Two layers, the disc (black) and the light (additive blend panel). The disc sits in front of the light panel so it hides the light inside the ring. The open option can also be received via el.dataset.fxOpen, without the user changing data-fx-eclipse-portal-gl and reattaching.
(() => {
  kfFx.register("eclipse-portal-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const canvas = document.createElement("canvas");
    canvas.className = "fx-eclipse";
    el.prepend(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    cam.position.z = 2;
    const R = +(options.radius ?? 0.4) || 0.4;
    const NOISE = `vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453); }
      float nz(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), mix(dot(h2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(h2(i + vec2(1.0)), f - vec2(1.0)), u.x), u.y); }`;
    const uni = { uTime: { value: 0 }, uR: { value: R }, uAspect: { value: 1 }, uCol: { value: new T.Color(css("--kf-ink") || "white") }, uBg: { value: new T.Color(css("--kf-bg") || "black") }, uOpen: { value: +(options.open ?? 0) }, uGlow: { value: +(options.glow ?? 1) } };
    const mat = new T.ShaderMaterial({
      transparent: true,
      uniforms: uni,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform float uTime, uR, uAspect, uOpen, uGlow; uniform vec3 uCol, uBg; varying vec2 vUv;
        ${NOISE}
        void main(){
          vec2 p = (vUv - 0.5) * 2.0;
          if (uAspect > 1.0) p.x *= uAspect; else p.y /= uAspect;
          float d = length(p) * 0.5;
          float a = atan(p.y, p.x);
          float jag = nz(vec2(a * 9.0, 1.7)) * 0.012;
          float streak = pow(max(nz(vec2(a * 3.2, uTime)) * 0.5 + 0.5, 0.0), 3.0) * 1.6 + 0.15;
          float rim = exp(-abs(d - uR - jag) * 90.0) * (0.6 + streak);
          float haze = smoothstep(uR, uR + 0.005, d) * exp(-(d - uR) * 7.0) * streak * 0.55;
          float light = (rim + haze) * uGlow * (1.0 - uOpen);
          float inside = (1.0 - smoothstep(uR + jag - 0.002, uR + jag + 0.002, d)) * (1.0 - uOpen);
          vec3 col = mix(uCol * light, uBg, inside);
          gl_FragColor = vec4(col, max(light, inside));
          #include <colorspace_fragment>
        }`,
    });
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    const speed = +(options.speed ?? 0.05);
    const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); uni.uAspect.value = w / h; };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let raf = 0, visible = true, t0 = performance.now();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }, { threshold: 0 });
    io.observe(el);
    function tick(now) {
      raf = 0;
      if (!visible) return;
      uni.uTime.value = reduce ? 0 : ((now - t0) / 1000) * speed;
      const o = el.dataset.fxOpen;
      if (o != null && o !== "") uni.uOpen.value = Math.min(1, Math.max(0, +o));
      renderer.render(scene, cam);
      if (!reduce) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); mat.dispose(); renderer.dispose(); canvas.remove(); };
  });
})();
