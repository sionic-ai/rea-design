// Puts the image on the plate (or text if none) into a glass box — each face warps that image by how much the view bends, harder toward the corners, splitting red, green and blue into a rainbow edge.
// Drag the box to spin it, release and it stops with inertia, left alone it floats and turns slowly
(() => {
  const VS = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vV = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`;
  const FS = `uniform sampler2D uTex; uniform float uBevel, uDispersion; uniform vec3 uInk; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){
      vec3 n = normalize(vN), v = normalize(vV), r = refract(-v, n, 1. / 1.5);
      vec2 c = vUv - .5; float edge = min(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y));
      float bev = 1. - smoothstep(0., .22, edge); vec2 dir = normalize(c + 1e-4);
      vec2 off = r.xy * .18 + dir * bev * bev * .22 * (uBevel / 1.5); float d = uDispersion * (.016 + bev * .09);
      vec2 b = c * .94 + .5 + off;
      vec4 s = texture2D(uTex, b);
      vec3 col = vec3(texture2D(uTex, b + dir * d).r, s.g, texture2D(uTex, b - dir * d).b);
      float hi = pow(1. - max(dot(n, v), 0.), 3.) * .55 + (1. - smoothstep(0., .012, edge)) * .45;
      gl_FragColor = vec4(col + uInk * hi, max(s.a, min(1., hi + .35)));
    }`;
  const colorOf = (css) => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = css; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255]; };

  kfFx.register("glass-refract-box", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T) return;
    const o = {
      bevel: +(options.bevel ?? 1.5), dispersion: +(options.dispersion ?? 0.8), sensitivity: +(options.sensitivity ?? 0.01), friction: +(options.friction ?? 0.95),
      hold: +(options.hold ?? 0.5), spin: +(options.spin ?? 0.002), float: +(options.float ?? 0.004), speed: +(options.speed ?? 1.2), zoom: Number(options.zoom) || 0.2,
    };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-glass-refract-box";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(55, 1, 0.01, 10);
    camera.position.set(0, 0, o.zoom);
    // Inner image: fits the panel’s image into a square canvas, or centers the text if there is none
    const pic = document.createElement("canvas"); pic.width = pic.height = 1024;
    const tex = new T.CanvasTexture(pic);
    if ("colorSpace" in tex) tex.colorSpace = T.SRGBColorSpace;
    const ink = colorOf(getComputedStyle(el).color);
    const paint = () => {
      const g = pic.getContext("2d"), img = el.querySelector('[data-fx-part="image"]'), label = el.querySelector('[data-fx-part="label"]');
      g.clearRect(0, 0, 1024, 1024);
      if (img && img.complete && img.naturalWidth) {
        const k = Math.min(1024 / img.naturalWidth, 1024 / img.naturalHeight) * 0.8, w = img.naturalWidth * k, h = img.naturalHeight * k;
        g.drawImage(img, (1024 - w) / 2, (1024 - h) / 2, w, h);
      } else if (label) {
        const cs = getComputedStyle(label);
        g.fillStyle = cs.color; g.textAlign = "center"; g.textBaseline = "middle";
        g.font = `${cs.fontWeight} 220px ${cs.fontFamily}`;
        g.fillText(label.textContent.trim().slice(0, 6), 512, 520);
      }
      tex.needsUpdate = true;
    };
    paint();
    const img = el.querySelector('[data-fx-part="image"]');
    img?.addEventListener("load", paint);
    const uniforms = { uTex: { value: tex }, uBevel: { value: o.bevel }, uDispersion: { value: o.dispersion }, uInk: { value: new T.Vector3(ink[0], ink[1], ink[2]) } };
    const box = new T.Mesh(new T.BoxGeometry(0.06, 0.06, 0.06), new T.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: FS, transparent: true }));
    box.rotation.set(0.35, -0.6, 0.12);
    scene.add(box);
    const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    // Drag: sensitivity .01, .95 inertia on release, .5 when held still
    const vel = new T.Vector2(), Y = new T.Vector3(0, 1, 0), X = new T.Vector3(1, 0, 0);
    let drag = null;
    const down = (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture?.(e.pointerId); canvas.style.cursor = "grabbing"; };
    const move = (e) => { if (!drag) return; vel.set((e.clientX - drag.x) * o.sensitivity, (e.clientY - drag.y) * o.sensitivity); drag = { x: e.clientX, y: e.clientY }; box.rotateOnWorldAxis(Y, vel.x); box.rotateOnWorldAxis(X, vel.y); };
    const up = () => { drag = null; canvas.style.cursor = ""; };
    if (hover) { canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.style.cursor = "grab"; }
    const t0 = performance.now();
    const tick = () => {
      if (!reduce) {
        if (drag) vel.multiplyScalar(o.hold); else { box.rotateOnWorldAxis(Y, vel.x); box.rotateOnWorldAxis(X, vel.y); vel.multiplyScalar(o.friction); }
        box.position.y = Math.sin(((performance.now() - t0) / 1000) * o.speed) * o.float;
        box.rotateOnWorldAxis(Y, o.spin);
      }
      renderer.render(scene, camera);
    };
    renderer.compile(scene, camera);
    if (window.gsap) gsap.ticker.add(tick); else tick();
    return () => {
      window.gsap?.ticker.remove(tick); ro.disconnect(); img?.removeEventListener("load", paint);
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up);
      box.geometry.dispose(); box.material.dispose(); tex.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); canvas.remove();
    };
  });
})();
