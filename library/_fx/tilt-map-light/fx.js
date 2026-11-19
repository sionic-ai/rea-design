// Tilted map panel (three) — the panel tilts slightly toward the mouse (lerp .08), and when the cursor is over the panel, that spot lights up round (uHover lerp .12).
// Place pins are HTML, so every frame the plate’s points are projected onto the screen to move them. Values follow the Brand scene section (fov 45, camera 0,-.2,4.5, plate 7×7, tilt −.35π·.35π)
(() => {
  const VERT = `
    #include <fog_pars_vertex>
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`;
  const FRAG = `
    #include <fog_pars_fragment>
    uniform sampler2D uMap;
    uniform vec2 uMouse;
    uniform float uHover, uRadius, uSoftness, uStrength;
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(uMap, vUv);
      if (base.a < 0.01) discard;
      float d = distance(vUv, uMouse);
      float light = (1.0 - smoothstep(uRadius - uSoftness, uRadius, d)) * uHover * uStrength;
      gl_FragColor = vec4(base.rgb + (1.0 - base.rgb) * light, base.a);
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`;
  const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();
  const num = (s, d) => (s ? s.split(",").map(Number) : d);

  // With no map image, draw roads and blocks in skin colors — dense at the bottom left where pins gather (around panel −2.4,−1.2)
  function drawMap(el, size = 2048) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const road = css(el, "--fx-map-road") || css(el, "--kf-ink-soft"), block = css(el, "--fx-map-block") || css(el, "--kf-line");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.lineCap = "round";
    g.save();
    g.translate(size * 0.2, size * 0.68);
    g.rotate(-0.42);
    for (let i = -14; i <= 14; i++) {
      for (let j = -14; j <= 14; j++) {
        if (rnd() < 0.35) continue;
        const w = 80 + rnd() * 70, h = 60 + rnd() * 90, x = i * 170 + rnd() * 20, y = j * 170 + rnd() * 20;
        g.globalAlpha = 0.18 + rnd() * 0.12;
        g.fillStyle = block;
        g.beginPath();
        g.roundRect(x, y, w, h, 10);
        g.fill();
      }
    }
    g.globalAlpha = 0.8;
    g.strokeStyle = road;
    for (let i = -14; i <= 14; i++) {
      g.lineWidth = i % 4 === 0 ? 10 : 4;
      g.beginPath(); g.moveTo(i * 170 - 12, -2600); g.lineTo(i * 170 - 12, 2600); g.stroke();
      g.beginPath(); g.moveTo(-2600, i * 170 - 12); g.lineTo(2600, i * 170 - 12); g.stroke();
    }
    g.lineWidth = 14;
    g.beginPath(); g.moveTo(-2600, -900); g.bezierCurveTo(-600, -300, 400, 400, 2600, 1300); g.stroke();
    g.restore();
    // Edges are transparent — outside the panel melts into the background
    const fade = g.createRadialGradient(size * 0.25, size * 0.68, size * 0.1, size * 0.25, size * 0.68, size * 0.75);
    fade.addColorStop(0, "transparent");
    fade.addColorStop(1, road);
    g.globalCompositeOperation = "destination-out";
    g.globalAlpha = 1;
    g.fillStyle = fade;
    g.fillRect(0, 0, size, size);
    return c;
  }

  kfFx.register("tilt-map-light", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !T.WebGLRenderer) return;
    if (innerWidth < +(options.min ?? 0)) return;
    const pins = [...el.querySelectorAll('[data-fx-part="pin"], [data-fx-part="home"]')];
    const src = el.querySelector('[data-fx-part="map"]');
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.domElement.className = "fx-tilt-map-light__gl";
    el.prepend(renderer.domElement);
    const scene = new T.Scene();
    const fogColor = new T.Color(css(el, "--kf-surface") || getComputedStyle(el).backgroundColor);
    scene.fog = new T.Fog(fogColor, +(options["fog-near"] ?? 4), +(options["fog-far"] ?? 8));
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, -0.2, 4.5);
    camera.lookAt(0, 0, 0);
    scene.add(new T.AmbientLight(new T.Color(1, 1, 1), 1));
    const sun = new T.DirectionalLight(new T.Color(1, 1, 1), 10);
    sun.position.set(10, 0, 20);
    scene.add(sun);
    const tex = new T.CanvasTexture(src && src.tagName === "CANVAS" ? src : drawMap(el));
    if (src && src.tagName === "IMG") { tex.image = src; if (!src.complete) src.addEventListener("load", () => (tex.needsUpdate = true), { once: true }); }
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    const uniforms = T.UniformsUtils.merge([T.UniformsLib.fog, {
      uMap: { value: null }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uHover: { value: 0 },
      uRadius: { value: +(options.radius ?? 0.05) }, uSoftness: { value: +(options.soft ?? 0.05) }, uStrength: { value: +(options.light ?? 0.9) },
    }]);
    uniforms.uMap.value = tex;
    const mat = new T.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, fog: true });
    const baseX = (-Math.PI / 2) * 0.7, baseZ = 0.35 * Math.PI;
    const group = new T.Group();
    group.position.set(...num(options.at, [0, 1.28, 0.44]));
    group.rotation.set(baseX, 0, baseZ);
    group.scale.setScalar(+(options.scale ?? 1.2));
    const plane = new T.Mesh(new T.PlaneGeometry(7, 7), mat);
    group.add(plane);
    const home = el.querySelector('[data-fx-part="home"]');
    if (home) {
      const post = new T.Mesh(new T.BoxGeometry(0.03, 0.3, 0.03), new T.MeshStandardMaterial({ color: new T.Color(css(el, "--kf-accent-text") || getComputedStyle(el).color) }));
      post.position.set(...num(home.dataset.at, [0, 0, 0]));
      post.rotation.z = 1.09;
      group.add(post);
    }
    scene.add(group);
    const marks = pins.map((p) => ({ el: p, v: new T.Vector3(...num(p.dataset.at, [0, 0, 0])) }));

    const look = { x: 0, y: 0 }, ray = new T.Raycaster(), ndc = new T.Vector2();
    let want = 0, w = 1, h = 1, raf = 0, seen = true;
    const fit = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const onMove = (e) => {
      look.x = (e.clientX / innerWidth) * 2 - 1;
      look.y = (e.clientY / innerHeight) * 2 - 1;
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = e.target.closest?.('[data-fx-part="pin"]') ? null : ray.intersectObject(plane)[0];
      want = hit && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 ? 1 : 0;
      if (hit?.uv) uniforms.uMouse.value.copy(hit.uv);
    };
    const v = new T.Vector3();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!seen) return;
      if (!reduce && hover) {
        group.rotation.x += (baseX + 0.02 * look.y - group.rotation.x) * 0.08;
        group.rotation.z += (baseZ + 0.03 * look.x - group.rotation.z) * 0.08;
      }
      uniforms.uHover.value += (want - uniforms.uHover.value) * 0.12;
      group.updateMatrixWorld();
      for (const m of marks) {
        v.copy(m.v).applyMatrix4(group.matrixWorld).project(camera);
        m.el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -50%)`;
      }
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    fit();
    addEventListener("pointermove", onMove);
    frame();
    el.classList.add("is-live");
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      removeEventListener("pointermove", onMove);
      marks.forEach((m) => (m.el.style.transform = ""));
      el.classList.remove("is-live");
      tex.dispose(); mat.dispose(); plane.geometry.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  });
})();
