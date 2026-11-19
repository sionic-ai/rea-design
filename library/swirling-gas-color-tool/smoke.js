// Hero gas swirl — the original flow field (gas carrying photo colors circles around a central eye) rebuilt with our own shader.
// Take the screen center as the eye and set polar coordinates, twist the angles with a differential rotation (shear) that spins faster at smaller radii to make spiral arms, then
// Three layers of fbm noise flow over time in those warped coordinates to give a gas-like grain. Colors are read from the skin (--kf-*) and painted in four: base, cream, sand and ink.
(() => {
  const canvas = document.querySelector("[data-smoke]");
  if (!canvas || !window.THREE) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    canvas.closest("[data-smoke-wrap]")?.classList.add("is-flat");
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const css = (n) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "gray");
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uSpin: { value: 1 },
    uEnter: { value: reduce ? 1 : 0 },
    uBg: { value: css("--kf-bg") },
    uCream: { value: css("--kf-raised") },
    uSand: { value: css("--kf-accent") },
    uDeep: { value: css("--kf-accent-text") },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uSpin, uEnter;
      uniform vec2 uRes;
      uniform vec3 uBg, uCream, uSand, uDeep;
      float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 4; i++){ s += a * n(p); p = m * p; a *= 0.5; } return s; }
      void main(){
        vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
        p.y *= 1.75;                       // So the eyes become a horizontally long ellipse
        float r = length(p), a = atan(p.y, p.x), t = uTime * 0.06 * uSpin;
        // Differential rotation — the further inside, the more it twists. Use the angle only through cos and sin so no atan seam shows.
        float tw = a + 1.1 / (r + 0.35) - t * (1.0 + 0.8 / (r + 0.4));
        vec2 q = vec2(cos(tw), sin(tw)) * (0.7 + r * 1.2);
        vec2 w = vec2(fbm(q * 0.9 + t), fbm(q * 0.9 - t + 3.1));
        float gas = fbm(q * 1.3 + w * 1.2 + vec2(0.0, t * 1.5));
        float streak = fbm(q * vec2(2.4, 0.6) + vec2(log(r + 0.05) * 1.5, 0.0) + w);
        float dens = clamp(gas * 0.8 + streak * 0.45 - 0.2, 0.0, 1.0);
        float eye = smoothstep(1.15, 0.2, r);
        vec3 col = mix(uSand, uCream, smoothstep(0.15, 0.7, dens));
        col = mix(col, uDeep, smoothstep(0.45, 0.0, dens) * smoothstep(0.5, 1.4, r) * 0.18);
        col = mix(col, uCream, eye * 0.92);
        col = mix(uBg, col, uEnter);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const size = () => {
    const w = canvas.clientWidth, hgt = canvas.clientHeight;
    renderer.setSize(w, hgt, false);
    uniforms.uRes.value.set(w, hgt);
  };
  new ResizeObserver(size).observe(canvas);
  size();
  const recolor = () => {
    uniforms.uBg.value = css("--kf-bg"); uniforms.uCream.value = css("--kf-raised");
    uniforms.uSand.value = css("--kf-accent"); uniforms.uDeep.value = css("--kf-accent-text");
  };
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  let visible = true;
  new IntersectionObserver((es) => (visible = es[0].isIntersecting)).observe(canvas);
  window.aSmoke = { uniforms, render: () => renderer.render(scene, camera) };
  const tick = (time) => {
    if (!visible) return;
    if (!reduce) uniforms.uTime.value = time * 0.6;
    renderer.render(scene, camera);
  };
  if (window.gsap) gsap.ticker.add(tick); else { const loop = (t) => { tick(t / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
})();
