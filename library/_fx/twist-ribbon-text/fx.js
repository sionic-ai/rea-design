// Lift the element’s text as a canvas picture and attach it to a three plate (a strip finely divided horizontally), twisting vertices on the X axis by their x position and rotating over time.
// Text flows twisted like a ribbon, alternately showing front and back faces. The panel redraws to fit the element size and stops drawing when offscreen
(() => {
  kfFx.register("twist-ribbon-text", (el, { options, reduce }) => {
    const label = (el.textContent || "").trim();
    if (!label || !window.THREE || !window.gsap) return;
    const T = window.THREE;
    const twist = +(options.twist ?? 3.2), speed = +(options.speed ?? 0.8), angle = +(options.angle ?? -40);
    const cs = getComputedStyle(el);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-twist__canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.setAttribute("aria-label", label);
    el.classList.add("fx-twist");
    el.append(canvas);
    const tc = document.createElement("canvas");
    tc.width = 1024; tc.height = 256;
    const ctx = tc.getContext("2d");
    ctx.fillStyle = cs.color;
    ctx.font = `${cs.fontWeight} 150px ${cs.fontFamily}`;
    ctx.textBaseline = "middle";
    const w = ctx.measureText(label).width;
    const sx = Math.min(1, 980 / w);
    ctx.setTransform(sx, 0, 0, 1, 20, 0);
    ctx.fillText(label, 0, 136);
    const tex = new T.CanvasTexture(tc);
    tex.colorSpace = T.SRGBColorSpace;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 10);
    camera.position.z = 2.4;
    const mat = new T.ShaderMaterial({
      transparent: true, side: T.DoubleSide, depthWrite: false,
      uniforms: { map: { value: tex }, time: { value: 0 }, twist: { value: twist } },
      vertexShader: "uniform float time, twist; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; float a = p.x * twist + time; float c = cos(a), s = sin(a); p.yz = vec2(p.y * c - p.z * s, p.y * s + p.z * c); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
      fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.05) discard; gl_FragColor = c; }",
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(2.3, 0.575, 128, 8), mat);
    mesh.rotation.z = T.MathUtils.degToRad(angle);
    scene.add(mesh);
    const size = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let on = true;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(el);
    const t0 = performance.now();
    const tick = () => {
      if (!on) return;
      mat.uniforms.time.value = reduce ? 0.6 : ((performance.now() - t0) / 1000) * speed;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    tick();
    return () => {
      gsap.ticker.remove(tick); ro.disconnect(); io.disconnect();
      mesh.geometry.dispose(); mat.dispose(); tex.dispose(); renderer.dispose();
      canvas.remove(); el.classList.remove("fx-twist"); el.removeAttribute("aria-label");
    };
  });
})();
