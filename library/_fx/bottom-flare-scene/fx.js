// Draws the photos, videos and color planes inside the section as panels on one screen-fixed canvas instead of the DOM, and applies it once more over the whole screen
// Bends wider horizontally (bell shape) toward the screen bottom — uv.x += (2x − 1) · strength · −.05 · (1 − y)^distance.
// With distance 34 it bends only in the bottom 6% or so of the screen, so the bottom edge of a photo scrolling up looks like it peels off the floor and straightens.
// The board position is re-measured every frame with getBoundingClientRect — hooked on gsap.ticker so it draws in the same tick after Lenis moves the scroll.
(() => {
  const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  // Board: an image (cover crop) or a single color. Paint the values as they are without color management so the same value as the Skin color shows on screen.
  const FS_ITEM = `varying vec2 vUv; uniform sampler2D uMap; uniform float uHasMap, uOpacity; uniform vec3 uColor; uniform vec2 uRepeat, uOffset;
    void main(){ vec4 c = uHasMap > 0.5 ? texture2D(uMap, vUv * uRepeat + uOffset) : vec4(uColor, 1.0); gl_FragColor = vec4(c.rgb, c.a * uOpacity); }`;
  const FS_POST = `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uDistance, uStrength;
    void main(){ vec2 uv = vUv; float str = uStrength * -0.05; uv.x += (uv.x * 2.0 - 1.0) * str * pow(1.0 - uv.y, uDistance); gl_FragColor = texture2D(tDiffuse, uv); }`;

  // Skin variables, color-mix and even oklch(from …) to real sRGB values — paint one dot on canvas 2d and read it back
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  const rgbOf = (css) => {
    pg.clearRect(0, 0, 1, 1);
    pg.fillStyle = "transparent";
    pg.fillStyle = css;
    pg.fillRect(0, 0, 1, 1);
    const d = pg.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  };
  const dprOf = () => Math.min(window.devicePixelRatio || 1, 2);

  // Photo slots (cells like wf-img) draw the same placeholder on canvas from the cell’s background and line color plus data-label, and use it as the panel’s image
  const placeholder = (node, w, h) => {
    const dpr = dprOf(), cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w * dpr));
    cv.height = Math.max(1, Math.round(h * dpr));
    const g = cv.getContext("2d"), cs = getComputedStyle(node);
    g.scale(dpr, dpr);
    g.fillStyle = cs.backgroundColor;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = cs.borderTopColor;
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.strokeRect(0.5, 0.5, w - 1, h - 1);
    const label = node.getAttribute("data-label") || "";
    if (label) {
      const after = getComputedStyle(node, "::after");
      g.font = `500 12px ${after.fontFamily || cs.fontFamily}`;
      const tw = g.measureText(label).width;
      g.fillStyle = rgbOf(after.backgroundColor)[3] > 0 ? after.backgroundColor : cs.backgroundColor;
      g.fillRect(w / 2 - tw / 2 - 9, h / 2 - 11, tw + 18, 22);
      g.fillStyle = after.color || cs.color;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, w / 2, h / 2 + 1);
    }
    return cv;
  };

  let stage = null;
  const getStage = (T) => {
    if (stage) return stage;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "flare-stage");
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, stencil: false, depth: false, powerPreference: "high-performance" }); } catch { return null; }
    document.body.append(canvas);
    const view = { w: innerWidth, h: innerHeight };
    renderer.setPixelRatio(dprOf());
    renderer.setSize(view.w, view.h, false);
    renderer.setClearColor(0x000000, 0);
    const camera = new T.OrthographicCamera(-view.w / 2, view.w / 2, view.h / 2, -view.h / 2, -10, 10);
    const target = new T.WebGLRenderTarget(view.w * dprOf(), view.h * dprOf());
    const post = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS_POST, depthTest: false, depthWrite: false,
      uniforms: { tDiffuse: { value: target.texture }, uDistance: { value: 34 }, uStrength: { value: 1 } } });
    const postScene = new T.Scene(), postCam = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
    postScene.add(new T.Mesh(new T.PlaneGeometry(1, 1), post));
    const scene = new T.Scene();
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        view.w = innerWidth; view.h = innerHeight;
        renderer.setPixelRatio(dprOf()); renderer.setSize(view.w, view.h, false);
        target.setSize(view.w * dprOf(), view.h * dprOf());
        Object.assign(camera, { left: -view.w / 2, right: view.w / 2, top: view.h / 2, bottom: -view.h / 2 });
        camera.updateProjectionMatrix();
        stage.items.forEach((it) => it.resize?.());
      }, 100);
    };
    addEventListener("resize", onResize);
    const tick = () => {
      if (!stage.items.size) return;
      stage.items.forEach((it) => it.place());
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
    };
    gsap.ticker.add(tick);
    stage = { canvas, scene, view, post, items: new Set(),
      drop() { gsap.ticker.remove(tick); clearTimeout(timer); removeEventListener("resize", onResize); target.dispose(); post.dispose(); renderer.dispose(); canvas.remove(); stage = null; } };
    return stage;
  };

  kfFx.register("bottom-flare-scene", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    // The original also skips building this stage on touch screens (pointer: coarse) and leaves the DOM photo as is
    if (reduce || !hover || !T || !window.gsap) return;
    const st = getStage(T);
    if (!st) return;
    st.post.uniforms.uDistance.value = +(options.distance ?? 34);
    st.post.uniforms.uStrength.value = +(options.strength ?? 1);
    const fade = +(options.fade ?? 0.25);
    el.classList.add("is-flare");
    const meshes = [];
    let drawn = false;

    const make = (node, kind) => {
      const uniforms = { uMap: { value: null }, uHasMap: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new T.Vector3(1, 1, 1) },
        uRepeat: { value: new T.Vector2(1, 1) }, uOffset: { value: new T.Vector2(0, 0) } };
      const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: FS_ITEM, transparent: true, depthTest: false, depthWrite: false }));
      mesh.visible = false;
      const media = kind === "media" ? node.querySelector("img, video") : null;
      // Cover fit — if the image and slot ratios differ, crop the center
      const cover = (iw, ih, w, h) => {
        const a = iw / ih, b = w / h;
        uniforms.uRepeat.value.set(a > b ? b / a : 1, a > b ? 1 : a / b);
        uniforms.uOffset.value.set((1 - uniforms.uRepeat.value.x) / 2, (1 - uniforms.uRepeat.value.y) / 2);
      };
      const paint = () => {
        const r = node.getBoundingClientRect();
        if (kind === "fill") {
          const [cr, cg, cb] = rgbOf(getComputedStyle(node).backgroundColor);
          uniforms.uColor.value.set(cr, cg, cb);
          return;
        }
        if (media?.tagName === "VIDEO") {
          if (!uniforms.uMap.value) uniforms.uMap.value = new T.VideoTexture(media);
          if (media.videoWidth) cover(media.videoWidth, media.videoHeight, r.width, r.height);
        } else if (media) {
          if (!uniforms.uMap.value) { uniforms.uMap.value = new T.Texture(media); uniforms.uMap.value.flipY = true; }
          if (media.complete && media.naturalWidth) { uniforms.uMap.value.needsUpdate = true; cover(media.naturalWidth, media.naturalHeight, r.width, r.height); }
        } else {
          uniforms.uMap.value?.dispose();
          uniforms.uMap.value = new T.CanvasTexture(placeholder(node, r.width || 1, r.height || 1));
          uniforms.uRepeat.value.set(1, 1); uniforms.uOffset.value.set(0, 0);
        }
        uniforms.uHasMap.value = 1;
      };
      if (media && media.tagName === "IMG" && !media.complete) media.addEventListener("load", paint, { once: true });
      st.scene.add(mesh);
      meshes.push({ node, mesh, uniforms, paint, tween: null });
    };

    const nodes = () => [...el.querySelectorAll('[data-fx-part="media"], [data-fx-part="fill"]')];
    const draw = () => {
      if (!drawn) {
        nodes().forEach((n) => make(n, n.getAttribute("data-fx-part")));
        meshes.forEach((m) => m.paint());
        drawn = true;
        el.classList.add("is-drawn");
      }
      meshes.forEach((m) => {
        m.mesh.visible = true;
        m.tween?.kill();
        m.tween = gsap.to(m.uniforms.uOpacity, { value: 1, duration: fade, ease: "none" });
      });
    };
    const hide = () => meshes.forEach((m) => { m.tween?.kill(); m.mesh.visible = false; });
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? draw() : hide())), { rootMargin: "25% 0px" });
    io.observe(el);

    // If the slot is off-screen or hidden (display:none), the panel hides too — like color planes swapped below and above 1400px
    const item = {
      place() {
        const vw = st.view.w, vh = st.view.h;
        for (const m of meshes) {
          if (!m.mesh.visible && !m.uniforms.uOpacity.value) continue;
          const r = m.node.getBoundingClientRect();
          const shown = r.width > 0 && r.height > 0 && r.bottom > -vh * 0.25 && r.top < vh * 1.25;
          m.mesh.material.visible = shown;
          if (!shown) continue;
          m.mesh.scale.set(r.width, r.height, 1);
          m.mesh.position.set(r.left + r.width / 2 - vw / 2, vh / 2 - r.top - r.height / 2, 0);
        }
      },
      resize() { if (drawn) meshes.forEach((m) => m.paint()); },
    };
    st.items.add(item);
    const ro = new ResizeObserver(() => item.resize());
    ro.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
      meshes.forEach((m) => { m.tween?.kill(); st.scene.remove(m.mesh); m.uniforms.uMap.value?.dispose(); m.mesh.geometry.dispose(); m.mesh.material.dispose(); });
      el.classList.remove("is-flare", "is-drawn");
      st.items.delete(item);
      if (!st.items.size) st.drop();
    };
  });
})();
