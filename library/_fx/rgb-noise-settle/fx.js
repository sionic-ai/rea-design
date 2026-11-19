(() => {
  // Lays the photo onto a three plane, picks red, green and blue at different strengths from random positions and scatters them like TV noise, then
  // Reduce the intensity (power) from 1 to 0 so the photo gathers into its own shape. Drawing stops once fully gathered.
  const VERT = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";
  const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uView, uImage;
uniform vec3 uSpread;
uniform float uPower, uTime, uRate, uFit;
varying vec2 vUv;
float cell(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
void main() {
  vec2 uv = vUv;
  if (uFit > .5) {
    float va = uView.x / uView.y, ia = uImage.x / uImage.y;
    vec2 k = va > ia ? vec2(1., ia / va) : vec2(va / ia, 1.);
    uv = uv * k + (1. - k) * .5;
  }
  float n = fract(cell(floor(uv * 4096.)) + uTime * uRate);
  // Where to scatter — a point on the diagonal given by the cell value squared divided by the position product. Beyond the edge it sticks to the end pixel
  float s = n * n / max(uv.x * uv.y, 1e-4);
  vec2 far = vec2(s);
  float p = uPower * uPower;
  gl_FragColor = vec4(
    texture2D(uTex, mix(uv, far, p * uSpread.x)).r,
    texture2D(uTex, mix(uv, far, p * uSpread.y)).g,
    texture2D(uTex, mix(uv, far, p * uSpread.z)).b,
    1.);
}`;

  kfFx.register("rgb-noise-settle", (el, { options, reduce, hover, scroller }) => {
    const wide = el.querySelector('[data-fx-part="image"]');
    if (!wide || !window.THREE) return;
    const narrowSrc = el.querySelector('[data-fx-part="image-narrow"]');
    const narrowAt = +(options.narrow ?? 835);
    const pick = () => (narrowSrc && innerWidth <= narrowAt ? narrowSrc : wide);
    const spread = String(options.spread || "0.1 0.5 1").split(/[\s,]+/).map(Number);
    const onLoad = (options.on || "load") === "load";
    const delay = +(options.delay ?? (onLoad ? 0.5 : 0));
    const dur = +(options.dur ?? (onLoad ? 2 : hover ? 1.5 : 1));
    const ease = options.ease ? kfFx.ease(options.ease, "circ.out") : "circ.out";

    const canvas = document.createElement("canvas");
    canvas.className = "fx-rgb-settle";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); } catch (e) { canvas.remove(); return; }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(+(options.dpr ?? 2));
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const u = {
      uTex: { value: null }, uView: { value: new THREE.Vector2(1, 1) }, uImage: { value: new THREE.Vector2(1, 1) },
      uSpread: { value: new THREE.Vector3(spread[0] ?? 0.1, spread[1] ?? 0.5, spread[2] ?? 1) },
      uPower: { value: reduce ? 0 : 1 }, uTime: { value: 0 }, uRate: { value: +(options.rate ?? 1) },
      uFit: { value: options.fit === "stretch" ? 0 : 1 },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, depthTest: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    renderer.compile(scene, camera);

    let src = null, texture = null, raf = 0, tween = null, st = null, settled = reduce, t0 = performance.now();
    const draw = () => { if (u.uTex.value) renderer.render(scene, camera); };
    const useSource = (next) => {
      if (next === src) return;
      src = next;
      const make = () => {
        texture?.dispose();
        texture = next.tagName === "CANVAS" ? new THREE.CanvasTexture(next) : new THREE.Texture(next);
        texture.needsUpdate = true;
        u.uTex.value = texture;
        u.uImage.value.set(next.naturalWidth || next.width || 1, next.naturalHeight || next.height || 1);
        wide.style.visibility = "hidden";
        if (narrowSrc) narrowSrc.style.visibility = "hidden";
        draw();
        start();
      };
      if (next.tagName === "IMG" && !next.complete) next.addEventListener("load", make, { once: true });
      else make();
    };
    const size = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
      u.uView.value.set(Math.max(1, r.width), Math.max(1, r.height));
      useSource(pick());
      draw();
    };
    const loop = (now) => {
      u.uTime.value = (now - t0) / 1000;
      draw();
      if (!settled) raf = requestAnimationFrame(loop);
    };
    let started = false;
    const run = () => {
      el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true }));
      if (reduce || !window.gsap) { u.uPower.value = 0; settled = true; draw(); el.classList.add("is-fx-settled"); return; }
      tween = gsap.to(u.uPower, { value: 0, duration: dur, ease, onComplete: () => { settled = true; el.classList.add("is-fx-settled"); draw(); } });
    };
    function start() {
      if (started) return;
      started = true;
      if (!reduce) raf = requestAnimationFrame(loop);
      if (onLoad || reduce || !window.ScrollTrigger) { if (delay > 0 && !reduce) setTimeout(run, delay * 1000); else run(); return; }
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, start: options.start || "top 85%", scroller, once: true, onEnter: () => (delay > 0 ? setTimeout(run, delay * 1000) : run()) });
    }
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    return () => {
      cancelAnimationFrame(raf);
      tween?.kill();
      st?.kill();
      ro.disconnect();
      texture?.dispose();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
      wide.style.visibility = "";
      if (narrowSrc) narrowSrc.style.visibility = "";
      el.classList.remove("is-fx-settled");
    };
  });
})();
