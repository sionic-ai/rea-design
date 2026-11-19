(() => {
  // Original brand: the photo panel’s center sags by the difference (speed) from a value that follows the scroll position 10% per frame (y += cos(xπ)·(−.0003·v))
  // Side line bends (x += sin(yπ·.0001·v)·.3) red and green split up and down (uv.y + v·.00005, green is the opposite half) — three version, 300×300 cell.
  // stage: fixed draws all boards with a perspective camera (60°) on a single screen-fixed canvas so curved edges can go outside the cell,
  // local is drawn orthographically on a canvas inside the cell and clipped within it (in the original, the hero and portrait photos are local, the two info photos are fixed).
  const VS = `varying vec2 vUv; uniform float uVel, uSag, uSway, uAmp; const float PI = 3.14159265;
    void main(){ vUv = uv; vec3 p = position;
      p.x += sin(p.y * PI * (uSway * uVel)) * uAmp;
      p.y += cos(p.x * PI) * (-uSag * uVel);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
  const FS = `varying vec2 vUv; uniform sampler2D uTex; uniform float uImg, uPlane, uVel, uSplit, uOpacity;
    void main(){ vec2 fit = vec2(min(uPlane / uImg, 1.0), min(uImg / uPlane, 1.0));
      vec2 uv = (vUv - 0.5) * fit + 0.5; vec2 s = vec2(0.0, uVel * uSplit);
      gl_FragColor = vec4(texture2D(uTex, uv + s).r, texture2D(uTex, uv + s * 0.5).g, texture2D(uTex, uv).b, uOpacity); }`;

  // Turn the skin variable into an actual color — variables made with color-mix also become values the canvas can read
  const colorOf = (scope, name) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    scope.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    return c;
  };
  const placeholder = (el, w, h, dpr) => {
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w * dpr));
    cv.height = Math.max(1, Math.round(h * dpr));
    const g = cv.getContext("2d");
    g.scale(dpr, dpr);
    g.fillStyle = colorOf(el, "--kf-raised");
    g.fillRect(0, 0, w, h);
    g.strokeStyle = colorOf(el, "--kf-line");
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = el.dataset.label || "";
    if (label) {
      g.font = `500 12px ${getComputedStyle(el).getPropertyValue("--kf-font-mono").trim() || "monospace"}`;
      g.fillStyle = colorOf(el, "--kf-dim");
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, w / 2, h / 2);
    }
    return cv;
  };

  const dprOf = () => Math.min(window.devicePixelRatio || 1, 2);
  // Only one screen-fixed panel regardless of element count — created when the first element attaches and removed when the last one detaches
  let stage = null;
  const fixedStage = (T) => {
    if (stage) return stage;
    const wrap = document.createElement("div");
    wrap.setAttribute("data-fx-part", "sag-stage");
    wrap.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    wrap.append(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return null; }
    document.body.append(wrap);
    const FOV = 60, dist = (h) => h / 2 / Math.tan((FOV / 2) * Math.PI / 180);
    const view = { w: innerWidth, h: innerHeight };
    renderer.setPixelRatio(dprOf());
    renderer.setSize(view.w, view.h);
    renderer.setClearColor(0x000000, 0);
    const camera = new T.PerspectiveCamera(FOV, view.w / view.h, 0.1, 2000);
    camera.position.z = dist(view.h);
    let timer = 0, raf = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        view.w = innerWidth; view.h = innerHeight;
        renderer.setPixelRatio(dprOf()); renderer.setSize(view.w, view.h);
        camera.aspect = view.w / view.h; camera.position.z = dist(view.h); camera.updateProjectionMatrix();
      }, 200);
    };
    addEventListener("resize", onResize);
    // No matter how many panels, draws once per frame
    const loop = () => {
      stage.items.forEach((update) => update());
      renderer.render(stage.scene, camera);
      raf = requestAnimationFrame(loop);
    };
    stage = { wrap, renderer, camera, scene: new T.Scene(), view, items: new Set(),
      drop() { cancelAnimationFrame(raf); clearTimeout(timer); removeEventListener("resize", onResize); renderer.dispose(); wrap.remove(); stage = null; } };
    raf = requestAnimationFrame(loop);
    return stage;
  };

  kfFx.register("scroll-sag-warp", (el, { options, reduce, scroller }) => {
    const T = window.THREE;
    if (!T) return;
    const fixed = options.stage !== "local";
    const lerp = +(options.lerp ?? 0.1);
    const segs = Math.max(1, Math.round(+options.segments || 300));
    const uniforms = {
      uTex: { value: null }, uImg: { value: 1 }, uPlane: { value: 1 }, uVel: { value: 0 }, uOpacity: { value: 1 },
      uSag: { value: +(options.sag ?? 0.0003) }, uSway: { value: +(options.sway ?? 0.0001) },
      uAmp: { value: +(options.amp ?? 0.3) }, uSplit: { value: +(options.split ?? 0.00005) },
    };
    const img = el.querySelector("img");
    const target = img || el;
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, segs, segs), new T.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: FS, transparent: true }));
    const feed = (w, h) => {
      uniforms.uPlane.value = w / h;
      if (img) {
        if (!uniforms.uTex.value) uniforms.uTex.value = new T.TextureLoader().load(img.currentSrc || img.src);
        uniforms.uImg.value = (img.naturalWidth || w) / (img.naturalHeight || h);
      } else {
        uniforms.uTex.value?.dispose();
        uniforms.uTex.value = new T.CanvasTexture(placeholder(el, w, h, dprOf()));
        uniforms.uImg.value = w / h;
      }
    };

    // Speed = Scroll position − a value that follows that position with a lerp each frame
    const pos = () => (scroller ? scroller.scrollTop : window.scrollY);
    let follow = pos();
    const speed = () => {
      const y = pos();
      follow += (y - follow) * lerp;
      uniforms.uVel.value = reduce ? 0 : y - follow;
    };

    let drop;
    if (fixed) {
      const st = fixedStage(T);
      if (!st) return;
      st.scene.add(mesh);
      const update = () => {
        speed();
        const r = target.getBoundingClientRect();
        mesh.scale.set(r.width || 0.001, r.height || 0.001, 1);
        mesh.position.set(r.left - st.view.w / 2 + r.width / 2, -r.top + st.view.h / 2 - r.height / 2, 0);
        uniforms.uOpacity.value = parseFloat(getComputedStyle(el).opacity) || 0;
      };
      st.items.add(update);
      drop = () => { st.scene.remove(mesh); st.items.delete(update); if (!st.items.size) st.drop(); };
    } else {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("data-fx-part", "sag-canvas");
      canvas.setAttribute("aria-hidden", "true");
      let renderer;
      try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return; }
      el.append(canvas);
      renderer.setPixelRatio(dprOf());
      renderer.setClearColor(0x000000, 0);
      const camera = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
      camera.position.z = 1;
      const scene = new T.Scene();
      scene.add(mesh);
      let seen = true, raf = 0;
      const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
      io.observe(el);
      const fit = () => { const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight); renderer.setSize(w, h, false); };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);
      const loop = () => {
        speed();
        if (seen) renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      drop = () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); renderer.dispose(); canvas.remove(); };
    }
    const size = () => feed(Math.max(1, target.clientWidth || el.clientWidth), Math.max(1, target.clientHeight || el.clientHeight));
    size();
    const ro = new ResizeObserver(size);
    ro.observe(target);
    el.setAttribute("data-gl", "");
    return () => {
      ro.disconnect();
      drop();
      uniforms.uTex.value?.dispose();
      mesh.geometry.dispose();
      mesh.material.dispose();
      el.removeAttribute("data-gl");
    };
  });
})();
