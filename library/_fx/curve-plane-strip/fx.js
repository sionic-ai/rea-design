(() => {
  // Original Brand BRAND: keep the DOM cells as they are on the panel attached to the screen (position, size and animation are left to the DOM) and draw the WebGL panel in the same place.
  // The vertex shader pushes z by cos according to screen x, making a curved surface whose center recedes — curvature is screen half-width × curve.
  const VS = `precision highp float; uniform float uCurve; uniform float uView; varying vec2 vUv;
    void main(){ vUv = uv; vec4 p = modelViewMatrix * vec4(position, 1.0); p.z -= cos(p.x / uView * 3.14159265) * uCurve; gl_Position = projectionMatrix * p; }`;
  const FS = `precision highp float; uniform sampler2D uTex; uniform vec2 uMesh; uniform vec2 uTexSize; uniform float uBright; varying vec2 vUv;
    void main(){ vec2 r = vec2(min((uMesh.x/uMesh.y)/(uTexSize.x/uTexSize.y), 1.0), min((uMesh.y/uMesh.x)/(uTexSize.y/uTexSize.x), 1.0));
      gl_FragColor = texture2D(uTex, (vUv - .5) * r + .5) * uBright; }`;

  kfFx.register("curve-plane-strip", (el, { options, reduce }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!T || !items.length) return;
    let curve = +(options.curve ?? 0.2);
    const bright = +(options.bright ?? 1);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "stage");
    el.append(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { canvas.remove(); return; }
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(45, 1, 0.01, 10000), geo = new T.PlaneGeometry(1, 1, 10, 10);
    const css = getComputedStyle(el);
    // Inside the cell’s <img> If there is an image, use it, if not, paint a placeholder with the slot’s data-label in the skin color
    const texOf = (item) => {
      const img = item.querySelector("img");
      if (img) { const t = new T.Texture(img); const up = () => { t.needsUpdate = true; m.uTexSize.value.set(img.naturalWidth || 1, img.naturalHeight || 1); }; const m = { uTexSize: { value: new T.Vector2(1, 1) } }; img.complete ? up() : img.addEventListener("load", up, { once: true }); return [t, m.uTexSize]; }
      const c = document.createElement("canvas"); c.width = 800; c.height = 500;
      const g = c.getContext("2d"), v = (k) => css.getPropertyValue(k).trim();
      const grad = g.createLinearGradient(0, 0, 800, 500); grad.addColorStop(0, v("--kf-raised") || v("--kf-surface")); grad.addColorStop(1, v("--kf-bg"));
      g.fillStyle = grad; g.fillRect(0, 0, 800, 500);
      g.fillStyle = v("--kf-dim"); g.font = `20px ${v("--kf-font-mono") || "monospace"}`; g.textAlign = "center"; g.fillText(item.dataset.label || "", 400, 450);
      const t = new T.CanvasTexture(c); return [t, { value: new T.Vector2(800, 500) }];
    };
    const meshes = items.map((item) => {
      const [tex, size] = texOf(item);
      tex.colorSpace = T.SRGBColorSpace;
      const mat = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, side: T.DoubleSide,
        uniforms: { uTex: { value: tex }, uMesh: { value: new T.Vector2(1, 1) }, uTexSize: size, uBright: { value: bright }, uCurve: { value: 0 }, uView: { value: 1 } } });
      const mesh = new T.Mesh(geo, mat); scene.add(mesh); return mesh;
    });
    el.setAttribute("data-gl", "");
    let W = 1, H = 1;
    const fit = () => {
      const r = el.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      camera.position.z = (0.5 * H) / Math.tan((22.5 * Math.PI) / 180);
      renderer.setSize(W, H, false);
    };
    const draw = () => {
      const s = el.getBoundingClientRect();
      meshes.forEach((m, i) => {
        const r = items[i].getBoundingClientRect(), u = m.material.uniforms;
        m.scale.set(r.width || 0.001, r.height || 0.001, 1);
        m.position.set(r.left - s.left + r.width / 2 - W / 2, -(r.top - s.top + r.height / 2 - H / 2), 0);
        u.uMesh.value.set(r.width || 1, r.height || 1); u.uCurve.value = (W / 2) * curve; u.uView.value = W;
      });
      renderer.render(scene, camera);
    };
    // Curvature can be changed from outside — el.dispatchEvent(new CustomEvent("fx:curve", { detail: .05 }))
    const onCurve = (e) => { curve = +e.detail; if (reduce) draw(); };
    el.addEventListener("fx:curve", onCurve);
    fit();
    const ro = new ResizeObserver(() => { fit(); draw(); }); ro.observe(el);
    let raf = 0, seen = false;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; cancelAnimationFrame(raf); if (seen && !reduce) raf = requestAnimationFrame(loop); else draw(); });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); el.removeEventListener("fx:curve", onCurve);
      meshes.forEach((m) => { m.material.uniforms.uTex.value.dispose(); m.material.dispose(); });
      geo.dispose(); renderer.dispose(); canvas.remove(); el.removeAttribute("data-gl");
    };
  });
})();
