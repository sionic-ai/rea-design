(() => {
  // Lay a three layer over one photo panel, and the photo group (data-fx-part="src" ’s img·data-src, or a placeholder image if none) once every (every) seconds
  // Pushes and blends with a displacement map to move to the next photo — the front photo is pushed toward −45°, the back toward 135°, by map × strength, over dur seconds power2.out.
  // When the panel touches the top edge of the screen (original rootMargin 0 0 −100%) it is set up, with the first advance after wait seconds. The shader is precompiled at setup.
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const FRAG = "uniform float progress; uniform float intensity; uniform sampler2D tA; uniform sampler2D tB; uniform sampler2D disp; uniform vec2 fit; varying vec2 vUv;\n" +
    "mat2 rot(float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }\n" +
    "void main(){ vec2 uv = (vUv - 0.5) * fit + 0.5; vec2 d = texture2D(disp, uv).rg;\n" +
    "  vec4 a = texture2D(tA, uv + rot(-0.785398) * d * intensity * progress);\n" +
    "  vec4 b = texture2D(tB, uv + rot(2.356194) * d * intensity * (1.0 - progress));\n" +
    "  gl_FragColor = mix(a, b, progress); }";
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const placeholder = (i, label) => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d"), a = css("--kf-ink"), b = css("--kf-bg"), m = css("--kf-dim") || a;
    const gr = g.createLinearGradient(0, 0, 512, 512);
    gr.addColorStop(0, i % 2 ? a : m); gr.addColorStop(1, i % 2 ? m : b);
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    g.fillStyle = i % 2 ? b : a; g.font = `500 24px ${css("--kf-font-sans") || "sans-serif"}`; g.textAlign = "center";
    g.fillText(label || `Photo ${i + 1}`, 256, 264);
    return c;
  };
  const noise = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d"), img = g.createImageData(256, 256);
    const n = (x, y, s) => Math.sin(x * s + Math.sin(y * s * 1.7) * 2.1) * 0.5 + Math.sin(y * s * 0.8 + Math.cos(x * s * 1.3) * 1.7) * 0.5;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4, v = n(x, y, 0.045) * 0.6 + n(x + 40, y - 20, 0.11) * 0.4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(127 + 120 * v);
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  };
  kfFx.register("displace-mix-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    const srcs = [...el.querySelectorAll('[data-fx-part="src"]')];
    const labels = (options.labels || "").split("|").filter(Boolean);
    const count = Math.max(srcs.length, labels.length, 2);
    const every = +(options.every ?? 3), dur = +(options.dur ?? 1.5), wait = +(options.wait ?? 2), intensity = +(options.intensity ?? 1);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    let renderer, scene, camera, plane, mat, tick, timer, delay, ro, io, current = 0, running = false, built = false;
    const loader = new T.TextureLoader();
    const tex = (i) => {
      const s = srcs[i], url = s && (s.getAttribute("src") || s.dataset.src);
      return url ? loader.load(url) : new T.CanvasTexture(placeholder(i, labels[i]));
    };
    const fit = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.fov = (180 / Math.PI) * 2 * Math.atan(1 / (2 * camera.position.z));
      camera.updateProjectionMatrix();
      plane.scale.set(camera.aspect, 1, 1);
      mat.uniforms.fit.value.set(h / w > 1 ? w / h : 1, h / w > 1 ? 1 : h / w);
    };
    const next = () => {
      if (running) return;
      running = true;
      const nx = (current + 1) % textures.length;
      mat.uniforms.tB.value = textures[nx];
      gsap.to(mat.uniforms.progress, { value: 1, duration: dur, ease, onComplete: () => { current = nx; mat.uniforms.tA.value = textures[nx]; mat.uniforms.progress.value = 0; running = false; } });
    };
    let textures = [];
    const build = () => {
      if (built) return;
      built = true;
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.domElement.setAttribute("data-fx-part", "canvas");
      el.appendChild(renderer.domElement);
      scene = new T.Scene();
      camera = new T.PerspectiveCamera(70, 1, 0.001, 1000);
      camera.position.set(0, 0, 2);
      textures = Array.from({ length: count }, (_, i) => tex(i));
      const d = new T.CanvasTexture(noise());
      d.wrapS = d.wrapT = T.RepeatWrapping;
      mat = new T.ShaderMaterial({ uniforms: { progress: { value: 0 }, intensity: { value: intensity }, tA: { value: textures[0] }, tB: { value: textures[1] }, disp: { value: d }, fit: { value: new T.Vector2(1, 1) } }, vertexShader: VERT, fragmentShader: FRAG });
      plane = new T.Mesh(new T.PlaneGeometry(1, 1, 2, 2), mat);
      scene.add(plane);
      renderer.compile(scene, camera);
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(el);
      tick = () => renderer.render(scene, camera);
      gsap.ticker.add(tick);
      if (!reduce) delay = setTimeout(() => { next(); timer = setInterval(next, every * 1000); }, wait * 1000);
      el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true }));
    };
    io = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) { build(); io.disconnect(); } }), { rootMargin: options.at === "enter" ? "0px 0px -15% 0px" : "0px 0px -100% 0px" });
    const scope = (options.scope && el.closest(options.scope)) || el;
    io.observe(scope);
    if (scope.getBoundingClientRect().top <= 0) build();
    return () => {
      io?.disconnect(); ro?.disconnect(); clearTimeout(delay); clearInterval(timer);
      if (tick) gsap.ticker.remove(tick);
      if (mat) gsap.killTweensOf(mat.uniforms.progress);
      textures.forEach((t) => t.dispose());
      mat?.dispose(); plane?.geometry.dispose();
      if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
    };
  });
})();
