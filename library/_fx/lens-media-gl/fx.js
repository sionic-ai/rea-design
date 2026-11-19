// Redraws the video and photo cells on one transparent WebGL plane over the screen — when a cell enters view it blooms in .98s as a wobbling circle from the center,
// Hovering swells the panel toward that spot (peak .12) and stretches it like a lens. Cell position, size and clipping (the ancestor with hidden overflow) are read from the DOM on each frame.
(() => {
  const S = { renderer: null, scene: null, cam: null, items: new Set(), raf: 0, last: 0, pointer: null, canvas: null };
  const WAVE = `
    uniform float uTime;
    vec4 wave(float e, vec2 asp, vec2 uv, vec2 c){
      vec2 p = (uv - c) * asp; float dist = length(p); float th = atan(p.y, p.x);
      float l = e * (length(asp * 0.5) + 0.2) - 0.1;
      float d = l + sin(th * 6.0 + uTime * 3.0) * 0.04 * sin(3.14159 * e) * smoothstep(0.0, 0.2, l);
      return vec4(1.0 - smoothstep(d - 0.06, d + 0.06, dist), d, dist, sin(3.14159 * e));
    }
    vec2 ripple(vec4 w, vec2 asp, vec2 uv, vec2 c, float k){
      vec2 p = (uv - c) * asp; float near = 1.0 - smoothstep(0.0, 0.36, abs(w.z - w.y));
      float a = sin(w.z * 40.0 - uTime * 8.0) * near * 0.06 * k + sin(w.z * 8.0 - uTime * 2.0) * 0.012 * k;
      return p / max(w.z, 1e-4) / asp * (w.w * smoothstep(0.0, 0.15, w.z)) * a;
    }`;
  const boot = (z) => {
    if (S.renderer) return true;
    const T = window.THREE;
    try { S.renderer = new T.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false }); } catch (e) { return false; }
    S.canvas = S.renderer.domElement;
    S.canvas.className = "fx-lmg";
    S.canvas.setAttribute("aria-hidden", "true");
    S.canvas.style.zIndex = z;
    document.body.appendChild(S.canvas);
    S.renderer.setClearColor(0x000000, 0);
    S.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    S.scene = new T.Scene();
    S.cam = new T.OrthographicCamera(0, 1, 1, 0, -10, 10);
    const size = () => { S.renderer.setSize(innerWidth, innerHeight, false); S.cam.left = -innerWidth / 2; S.cam.right = innerWidth / 2; S.cam.top = innerHeight / 2; S.cam.bottom = -innerHeight / 2; S.cam.updateProjectionMatrix(); };
    size();
    S.size = size;
    addEventListener("resize", size);
    S.move = (e) => { S.pointer = { x: e.clientX, y: e.clientY }; };
    S.out = () => { S.pointer = null; };
    addEventListener("pointermove", S.move, { passive: true });
    document.documentElement.addEventListener("pointerleave", S.out);
    S.last = performance.now();
    const frame = (now) => {
      S.raf = requestAnimationFrame(frame);
      const dt = Math.max(0.001, Math.min(0.1, (now - S.last) / 1000));
      S.last = now;
      S.items.forEach((it) => it.update(dt, now / 1000));
      S.renderer.render(S.scene, S.cam);
    };
    S.raf = requestAnimationFrame(frame);
    return true;
  };
  const shut = () => {
    if (!S.renderer || S.items.size) return;
    cancelAnimationFrame(S.raf);
    removeEventListener("resize", S.size);
    removeEventListener("pointermove", S.move);
    document.documentElement.removeEventListener("pointerleave", S.out);
    S.renderer.dispose(); S.canvas.remove(); S.renderer = null;
  };

  kfFx.register("lens-media-gl", (el, { options, reduce, hover }) => {
    if (!window.THREE || !window.gsap) return;
    const src = el.querySelector('[data-fx-part="source"]') || el.querySelector("canvas, video, img");
    if (!src || !boot(options.z || 10)) return;
    const T = window.THREE, dur = +(options.dur ?? 0.9775), bulge = +(options.bulge ?? 0.12), lens = +(options.lens ?? 0.05);
    const tex = src.tagName === "VIDEO" ? new T.VideoTexture(src) : src.tagName === "CANVAS" ? new T.CanvasTexture(src) : new T.Texture(src);
    tex.minFilter = T.LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
    const u = { uTex: { value: tex }, uTime: { value: 0 }, uSize: { value: new T.Vector2(1, 1) }, uRatio: { value: 16 / 9 }, uReveal: { value: reduce ? 1 : 0 },
      uHover: { value: 0 }, uHP: { value: new T.Vector2(0.5, 0.5) }, uClip: { value: new T.Vector4(0, 0, 1, 1) }, uOpacity: { value: 1 }, uBulge: { value: bulge }, uLens: { value: lens } };
    const mat = new T.ShaderMaterial({
      uniforms: u, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: `varying vec2 vUv; uniform vec2 uSize, uHP; uniform float uHover, uBulge;
        void main(){ vUv = uv; vec2 asp = vec2(uSize.x / uSize.y, 1.0); vec2 n = uv - uHP; float r = 1.0 - smoothstep(0.0, 0.8, length(n * asp));
          vec3 p = position; p.xy += n * r * uHover * uBulge; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uSize, uHP; uniform float uRatio, uReveal, uHover, uOpacity, uLens; uniform vec4 uClip; ${WAVE}
        void main(){
          vec2 asp = vec2(uSize.x / uSize.y, 1.0);
          vec4 rv = wave(uReveal, asp, vUv, vec2(0.5)); vec4 hv = wave(uHover * 0.75, asp, vUv, uHP);
          vec2 uv = vUv - (vUv - uHP) * hv.x * uHover * uLens + ripple(rv, asp, vUv, vec2(0.5), 1.0) + ripple(hv, asp, vUv, uHP, 0.25);
          float dst = uSize.x / uSize.y; vec2 s = vec2(min(dst / uRatio, 1.0), min(uRatio / dst, 1.0));
          vec4 c = texture2D(uTex, (uv - 0.5) * s + 0.5);
          float clip = step(uClip.x, vUv.x) * step(vUv.x, uClip.z) * step(uClip.y, vUv.y) * step(vUv.y, uClip.w);
          gl_FragColor = vec4(c.rgb, rv.x * clip * uOpacity);
        }`,
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 32, 32), mat);
    mesh.frustumCulled = false;
    S.scene.add(mesh);
    const clippers = [];
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") clippers.push(p); }
    let revealed = reduce, tween = null;
    const show = (v, d) => { revealed = true; tween && tween.kill(); tween = gsap.to(u.uReveal, { value: v, duration: d ?? dur, ease: "power1.inOut" }); };
    const onHide = (e) => show(0, e.detail && e.detail.dur);
    const onShow = (e) => show(1, e.detail && e.detail.dur);
    el.addEventListener("fx:hide", onHide);
    el.addEventListener("fx:show", onShow);
    el.classList.add("is-gl");
    const item = {
      update(dt, t) {
        const r = el.getBoundingClientRect();
        let op = 1;
        for (let p = el; p && p !== document.documentElement; p = p.parentElement) { const st = getComputedStyle(p); if (st.visibility === "hidden" || st.display === "none") { op = 0; break; } op *= +st.opacity; }
        mesh.visible = r.width > 0 && r.bottom > 0 && r.top < innerHeight && op > 0.001;
        if (!mesh.visible) return;
        if (src.tagName === "CANVAS") tex.needsUpdate = true;
        u.uRatio.value = (src.videoWidth || src.naturalWidth || src.width || 16) / (src.videoHeight || src.naturalHeight || src.height || 9);
        if (!revealed && r.top < innerHeight * 0.99) show(1);
        mesh.scale.set(r.width, r.height, 1);
        mesh.position.set(r.left + r.width / 2 - innerWidth / 2, innerHeight / 2 - r.top - r.height / 2, 0);
        u.uSize.value.set(r.width, r.height); u.uTime.value = t; u.uOpacity.value = op;
        const c = { top: r.top, right: r.right, bottom: r.bottom, left: r.left };
        clippers.forEach((p) => { const b = p.getBoundingClientRect(); c.top = Math.max(c.top, b.top); c.right = Math.min(c.right, b.right); c.bottom = Math.min(c.bottom, b.bottom); c.left = Math.max(c.left, b.left); });
        u.uClip.value.set((c.left - r.left) / r.width, (r.bottom - c.bottom) / r.height, (c.right - r.left) / r.width, (r.bottom - c.top) / r.height);
        const P = S.pointer, inside = hover && !reduce && P && P.x >= c.left && P.x <= c.right && P.y >= c.top && P.y <= c.bottom;
        if (inside) { const k = u.uHover.value > 0.01 ? 1 - Math.exp(-dt * 2) : 1; u.uHP.value.lerp(new T.Vector2((P.x - r.left) / r.width, (r.bottom - P.y) / r.height), k); }
        u.uHover.value += ((inside ? 1 : 0) - u.uHover.value) * (1 - Math.exp(-dt * 6));
      },
    };
    S.renderer.compile(S.scene, S.cam);
    S.items.add(item);
    return () => {
      S.items.delete(item);
      tween && tween.kill();
      el.removeEventListener("fx:hide", onHide); el.removeEventListener("fx:show", onShow);
      el.classList.remove("is-gl");
      S.scene.remove(mesh); mesh.geometry.dispose(); mat.dispose(); tex.dispose();
      shut();
    };
  });
})();
