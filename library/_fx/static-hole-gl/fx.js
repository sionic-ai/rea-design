(() => {
  // Cover the whole panel in sizzling grain, and let a clear hole around the cursor, where the grain is cleared, follow it late.
  // Grain values are a fixed random number per cell plus time × rate, wrapped around, so they aren’t re-scattered every frame and the threshold window slowly slides to sparkle.
  const VERT = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";
  const FRAG = `
precision highp float;
uniform vec2 uSize;
uniform float uDpr, uTime, uRate, uHole, uAlpha, uRadius, uSoft, uMix;
uniform vec2 uPointer;
uniform vec3 uInk;
float cell(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
void main() {
  vec2 st = gl_FragCoord.xy / (uSize * uDpr) - .5;
  float aspect = uSize.y / uSize.x;
  st.y *= aspect;
  vec2 c = uPointer * .5;
  c.y *= aspect;
  vec2 d = st - c;
  float inner = uRadius * (1. - uSoft), outer = uRadius * (1. + uSoft);
  float clear = (1. - smoothstep(inner, outer, dot(d, d) * 4.)) * uHole;
  float n = fract(cell(floor(gl_FragCoord.xy)) + uTime * uRate);
  float v = mix(n, clear, uMix);
  float on = v < uAlpha ? 1. : 0.;
  gl_FragColor = vec4(uInk * v * on, on);
}`;

  const readColor = (name) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "currentColor";
    c.fillRect(0, 0, 1, 1);
    const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };

  kfFx.register("static-hole-gl", (el, { options, reduce, hover }) => {
    if (!window.THREE) return;
    const narrowAt = +(options.narrow ?? 834);
    const isNarrow = () => !hover || innerWidth <= narrowAt;
    const alpha = +(options.alpha ?? 0.24), alphaNarrow = +(options["alpha-narrow"] ?? 0.25);
    const follow = +(options.follow ?? 1);
    const dpr = () => (devicePixelRatio < 2 ? +(options.dpr ?? 1.5) : Math.min(2, devicePixelRatio));

    const canvas = document.createElement("canvas");
    canvas.className = "fx-static-hole";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); } catch (e) { canvas.remove(); return; }
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const pointer = { x: 0, y: 0 };
    const u = {
      uSize: { value: new THREE.Vector2(1, 1) }, uDpr: { value: 1 }, uTime: { value: 0 },
      uRate: { value: +(options.rate ?? 0.5) }, uHole: { value: isNarrow() ? 0 : 1 },
      uAlpha: { value: isNarrow() ? alphaNarrow : alpha }, uRadius: { value: +(options.radius ?? 0.01) },
      uSoft: { value: +(options.soft ?? 80) }, uMix: { value: +(options.mix ?? 0.5) },
      uPointer: { value: new THREE.Vector2(0, 0) }, uInk: { value: new THREE.Vector3(...readColor("--kf-ink")) },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true, depthTest: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    // Shaders are precompiled when set up — compiling on the first cursor move freezes the screen
    renderer.compile(scene, camera);

    const size = () => {
      const r = el.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      renderer.setPixelRatio(dpr());
      renderer.setSize(w, h, false);
      u.uSize.value.set(w, h);
      u.uDpr.value = renderer.getPixelRatio();
      u.uHole.value = isNarrow() ? 0 : 1;
      u.uAlpha.value = isNarrow() ? alphaNarrow : alpha;
      if (reduce) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    let tween = null;
    const move = (e) => {
      if (isNarrow()) return;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1, y = -((e.clientY - r.top) / r.height) * 2 + 1;
      if (window.gsap) { tween?.kill(); tween = gsap.to(pointer, { x, y, duration: follow }); }
      else { pointer.x = x; pointer.y = y; }
    };
    const recolor = () => u.uInk.value.set(...readColor("--kf-ink"));
    addEventListener("fx:theme", recolor);

    let raf = 0, t0 = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      u.uTime.value = (now - t0) / 1000;
      u.uPointer.value.set(pointer.x, pointer.y);
      renderer.render(scene, camera);
    };
    if (reduce) renderer.render(scene, camera);
    else { addEventListener("mousemove", move, { passive: true }); raf = requestAnimationFrame(loop); }

    return () => {
      cancelAnimationFrame(raf);
      tween?.kill();
      ro.disconnect();
      removeEventListener("mousemove", move);
      removeEventListener("fx:theme", recolor);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
