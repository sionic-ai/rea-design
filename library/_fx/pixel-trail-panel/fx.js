(() => {
  // The stamp panels share one setup — an orthographic scene sized to the window with 150 stamps, each panel drawn and read with its own renderer
  let shared = null;
  const stampsOf = (T) => {
    if (shared) return shared;
    const brush = document.createElement("canvas");
    brush.width = brush.height = 64;
    const bx = brush.getContext("2d"), g = bx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"); /* Not skin: stamp alpha panel (not visible on screen) */
    g.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: stamp alpha plate */
    bx.fillStyle = g; bx.fillRect(0, 0, 64, 64);
    const tex = new T.CanvasTexture(brush), quad = new T.PlaneGeometry(1, 1), scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    cam.position.z = 1;
    const vert = `uniform float uTime, uBirth, uBirthScroll, uScroll, uLife; varying float vOn; varying vec2 vUv;
      void main() { vec4 p = modelMatrix * vec4(position, 1.0); p.y += uScroll - uBirthScroll; gl_Position = projectionMatrix * viewMatrix * p; vUv = uv;
        float age = uTime - uBirth; vOn = (age >= 0.0 && age <= uLife) ? 1.0 : 0.0; }`;
    const frag = "uniform sampler2D uTex; varying float vOn; varying vec2 vUv; void main() { if (vOn < 0.5) discard; gl_FragColor = texture2D(uTex, vUv); }";
    const stamps = Array.from({ length: 150 }, () => {
      const m = new T.Mesh(quad, new T.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, transparent: true, depthTest: false, depthWrite: false,
        uniforms: { uTime: { value: 0 }, uBirth: { value: -999 }, uBirthScroll: { value: 0 }, uScroll: { value: 0 }, uLife: { value: 0.7 }, uTex: { value: tex } } }));
      scene.add(m);
      return m;
    });
    const size = () => { Object.assign(cam, { left: -innerWidth / 2, right: innerWidth / 2, top: innerHeight / 2, bottom: -innerHeight / 2 }); cam.updateProjectionMatrix(); };
    size();
    addEventListener("resize", size);
    let next = 0, lx = null, ly = null;
    const opt = { size: 125, life: 0.7 };
    addEventListener("mousemove", (e) => {
      const x = e.clientX - innerWidth / 2, y = -e.clientY + innerHeight / 2;
      if (lx !== null && (x - lx) ** 2 + (y - ly) ** 2 < 1) return;
      lx = x; ly = y;
      const m = stamps[next];
      next = (next + 1) % stamps.length;
      m.position.set(x, y, 0);
      m.scale.set(opt.size, opt.size, 1);
      m.material.uniforms.uLife.value = opt.life;
      m.material.uniforms.uBirth.value = performance.now() / 1000;
      m.material.uniforms.uBirthScroll.value = scrollY;
    }, { passive: true });
    const tick = () => { const now = performance.now() / 1000; stamps.forEach((m) => { m.material.uniforms.uTime.value = now; m.material.uniforms.uScroll.value = scrollY; }); };
    return (shared = { scene, cam, tick, opt });
  };
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (T, css, el) => {
    const i = document.createElement("i");
    i.style.cssText = `position:absolute;visibility:hidden;color:${css}`;
    el.append(i);
    probe.fillStyle = getComputedStyle(i).color;
    i.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.SRGBColorSpace);
  };
  const common = `uniform sampler2D uTouch; uniform vec2 uRes, uCenter, uSize; uniform float uScroll, uCell; varying vec2 vUv;
    vec2 cellOf(vec2 px) { float py = px.y + uScroll; vec2 c = (floor(vec2(px.x, py) / uCell) + 0.5) * uCell; return vec2(c.x / uRes.x, 1.0 - (c.y - uScroll) / uRes.y); }
    vec2 screenOf() { return uCenter + (vUv - 0.5) * uSize * vec2(1.0, -1.0); }`;
  const panelFrag = common + `uniform vec3 uColor, uTrail; void main() { float on = step(0.2, texture2D(uTouch, clamp(cellOf(screenOf()), 0.0, 1.0)).r); gl_FragColor = vec4(mix(uColor, uTrail, on), 1.0);
    #include <colorspace_fragment>
    }`;
  const mediaFrag = common + `uniform sampler2D uMedia; uniform vec2 uMediaSize;
    vec2 cover(vec2 uv) { float rs = uSize.x / uSize.y, ri = uMediaSize.x / max(1.0, uMediaSize.y); vec2 sc = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs); return (uv - 0.5) * sc + 0.5; }
    void main() { vec2 n = uSize / uCell, puv = (floor(vUv * n) + 0.5) / n; vec3 o = texture2D(uMedia, cover(vUv)).rgb, p = texture2D(uMedia, cover(puv)).rgb;
      float m = dot(texture2D(uTouch, clamp(cellOf(screenOf()), 0.0, 1.0)).rgb, vec3(0.2126, 0.7152, 0.0722)), l = dot(p, vec3(0.2126, 0.7152, 0.0722));
      gl_FragColor = vec4(mix(o, p * 1.2, smoothstep(0.05, 0.25, l) * smoothstep(0.05, 0.25, m)), 1.0);
      #include <colorspace_fragment>
    }`;

  kfFx.register("pixel-trail-panel", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || reduce || !hover) return;
    const st = stampsOf(T);
    st.opt.size = +(options.size || 125);
    st.opt.life = +(options.life ?? 0.7);
    const media = el.querySelector('[data-fx-part="media"]');
    const R = new T.WebGLRenderer({ alpha: true, antialias: false });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    R.outputColorSpace = T.SRGBColorSpace;
    R.domElement.className = "fx-ptp-gl" + (media ? " is-media" : "");
    el.append(R.domElement);
    const u = { uTouch: { value: null }, uRes: { value: new T.Vector2() }, uCenter: { value: new T.Vector2() }, uSize: { value: new T.Vector2() }, uScroll: { value: 0 }, uCell: { value: +(options.cell || 25) } };
    let tex = null;
    if (media) {
      tex = media.tagName === "VIDEO" ? new T.VideoTexture(media) : new T.Texture(media);
      tex.colorSpace = T.SRGBColorSpace;
      const dims = () => u.uMediaSize.value.set(media.videoWidth || media.naturalWidth || 16, media.videoHeight || media.naturalHeight || 9);
      Object.assign(u, { uMedia: { value: tex }, uMediaSize: { value: new T.Vector2(16, 9) } });
      media.addEventListener("loadedmetadata", dims);
      media.addEventListener("load", () => { dims(); tex.needsUpdate = true; });
      dims();
    } else Object.assign(u, { uColor: { value: rgb(T, getComputedStyle(el).backgroundColor, el) }, uTrail: { value: rgb(T, options.color || "var(--kf-surface)", el) } });
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: media ? mediaFrag : panelFrag, uniforms: u })));
    const rt = new T.WebGLRenderTarget(50, 32);
    let seen = false, w = 0, h = 0;
    const io = new IntersectionObserver((e) => (seen = e[0].isIntersecting));
    io.observe(el);
    const draw = () => {
      if (!seen) return;
      st.tick();
      const r = el.getBoundingClientRect();
      if (r.width !== w || r.height !== h) { w = r.width; h = r.height; R.setSize(Math.max(1, w), Math.max(1, h), false); }
      rt.setSize(50, Math.max(1, Math.round((50 * innerHeight) / innerWidth)));
      u.uRes.value.set(innerWidth, innerHeight);
      u.uCenter.value.set(r.left + r.width / 2, r.top + r.height / 2);
      u.uSize.value.set(w, h);
      u.uScroll.value = scrollY;
      R.setRenderTarget(rt); R.clear(); R.render(st.scene, st.cam); R.setRenderTarget(null);
      u.uTouch.value = rt.texture;
      R.render(scene, cam);
    };
    gsap.ticker.add(draw);
    return () => { gsap.ticker.remove(draw); io.disconnect(); rt.dispose(); tex?.dispose(); R.dispose(); R.domElement.remove(); };
  });
})();
