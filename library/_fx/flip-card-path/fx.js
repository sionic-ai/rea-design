(() => {
  const VERT = `precision mediump float;
    #define PI 3.141592
    uniform float u_bend; varying vec2 vUv; varying vec3 vNormal;
    void main() {
      vec3 p = position;
      float sx = sin(PI * uv.x), sy = 0.75 + 0.25 * sin(PI * uv.y);
      p.z += u_bend * sx * sy;
      vNormal = normalize(normalMatrix * vec3(-u_bend * PI * cos(PI * uv.x) * sy, -u_bend * sx * 0.25 * PI * cos(PI * uv.y), 1.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      vUv = uv;
    }`;
  const FRAG = `precision highp float;
    uniform vec2 u_res, u_size; uniform sampler2D u_texture; varying vec2 vUv; varying vec3 vNormal;
    vec2 cover(vec2 s, vec2 i, vec2 uv) {
      float sr = s.x / s.y, ir = i.x / i.y;
      vec2 n = sr < ir ? vec2(i.x * (s.y / i.y), s.y) : vec2(s.x, i.y * (s.x / i.x));
      return uv * s / n + (sr < ir ? vec2((n.x - s.x) / 2.0, 0.0) : vec2(0.0, (n.y - s.y) / 2.0)) / n;
    }
    void main() {
      vec2 suv = vUv;
      if (!gl_FrontFacing) suv.x = 1.0 - suv.x;
      vec4 tex = texture2D(u_texture, cover(u_res, u_size, suv));
      vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
      float shade = clamp(0.65 + 0.45 * clamp(dot(n, vec3(-0.39, 0.49, 0.78)), 0.0, 1.0), 0.0, 1.0);
      if (!gl_FrontFacing) shade *= 0.82;
      gl_FragColor = vec4(tex.rgb * shade, tex.a);
    }`;
  kfFx.register("flip-card-path", (el, { options, reduce, scroller }) => {
    const T = window.THREE;
    const slots = [...el.querySelectorAll('[data-fx-part="slot"]')];
    if (!T || reduce || slots.length < 2) return;
    const scrub = +(options.scrub ?? 0.75), tilt = +(options.tilt ?? 0.4), bendK = +(options.bend ?? 0.45);
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: String(options.z ?? 0) });
    document.body.prepend(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.z = 50;
    const css = getComputedStyle(document.documentElement), cv = (k) => css.getPropertyValue(k).trim();
    const faces = [...el.querySelectorAll('[data-fx-part="face"]')];
    const texOf = (f, i) => {
      if (f?.tagName === "IMG") { const t = new T.Texture(f); t.colorSpace = T.SRGBColorSpace; const up = () => { t.needsUpdate = true; t.userData.w = f.naturalWidth; t.userData.h = f.naturalHeight; }; f.complete ? up() : f.addEventListener("load", up, { once: true }); return t; }
      const c = document.createElement("canvas"); c.width = 540; c.height = 960;
      const x = c.getContext("2d");
      x.fillStyle = cv("--kf-raised"); x.fillRect(0, 0, 540, 960);
      x.fillStyle = cv("--kf-line"); x.fillRect(40, 60 + i * 90, 460, 300);
      x.fillStyle = cv("--kf-ink"); x.font = `500 26px ${cv("--kf-font-sans")}`;
      x.fillText(f?.dataset.label || `Figure ${i + 1}`, 40, 900);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.userData.w = 540; t.userData.h = 960;
      return t;
    };
    const textures = (faces.length ? faces : [null]).map(texOf);
    const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, side: T.DoubleSide, transparent: true, depthTest: false, depthWrite: false,
      uniforms: { u_texture: { value: textures[0] }, u_res: { value: new T.Vector2(1, 1) }, u_size: { value: new T.Vector2(540, 960) }, u_bend: { value: 0 } } });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 32, 16), mat);
    scene.add(mesh);
    let W = 1, H = 1, cam = { x: 1, y: 1 };
    const size = () => {
      W = innerWidth; H = innerHeight; renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z; cam = { x: h * camera.aspect, y: h };
    };
    size();
    const st = { p: 0, idx: -1, v: 0, n: null };
    const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    const live = () => slots.filter((s) => s.getBoundingClientRect().width > 0);
    const sync = () => {
      const ss = live();
      if (ss.length < 2) { mesh.visible = false; return; }
      mesh.visible = true;
      const last = ss.length - 1, e = Math.max(0, Math.min(st.p, last)), s = Math.min(Math.floor(e), last - 1), u = e - s;
      const k = Math.min(Math.floor((e / last) * textures.length), textures.length - 1);
      if (k !== st.idx) { st.idx = k; mat.uniforms.u_texture.value = textures[k]; mat.uniforms.u_size.value.set(textures[k].userData.w || 540, textures[k].userData.h || 960); }
      const rs = ss.map((x) => x.getBoundingClientRect()), at = (i) => rs[Math.max(0, Math.min(i, last))];
      const f = (key) => cr(at(s - 1)[key], at(s)[key], at(s + 1)[key], at(s + 2)[key], u);
      const b = { w: f("width"), h: f("height"), l: f("left"), t: f("top") };
      mat.uniforms.u_res.value.set(b.w, b.h);
      const sx = cam.x * (b.w / W), sy = cam.y * (b.h / H);
      mesh.scale.set(sx, sy, 1);
      mesh.position.set(-cam.x / 2 + sx / 2 + (b.l / W) * cam.x, cam.y / 2 - sy / 2 - (b.t / H) * cam.y, 0);
      mesh.rotation.set(Math.sin(Math.PI * u) * -tilt, e * Math.PI, 0);
      if (st.n === null) st.n = e;
      st.v += (e - st.n - st.v) * 0.12; st.n = e;
      mat.uniforms.u_bend.value = Math.max(-1, Math.min(1, st.v * 40)) * sx * bendK;
    };
    let tl = null;
    const build = () => {
      tl?.scrollTrigger?.kill(); tl?.kill();
      const ss = live();
      if (ss.length < 2) return;
      const y = scrollY, h = innerHeight;
      const pos = ss.map((x, i) => { const r = x.getBoundingClientRect(), top = r.top + y; return i === 0 ? top - h / 2 : top + r.height / 2 - h / 2; });
      st.p = 0;
      tl = gsap.timeline({ scrollTrigger: { scroller, start: pos[0], end: pos[pos.length - 1], scrub } });
      for (let i = 1; i < pos.length; i++) tl.to(st, { p: i, duration: pos[i] - pos[i - 1], ease: "none" }, ">");
    };
    build();
    let rt = 0;
    const onR = () => { clearTimeout(rt); rt = setTimeout(() => { size(); build(); }, 150); };
    addEventListener("resize", onR);
    const tick = () => { sync(); renderer.render(scene, camera); };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick); removeEventListener("resize", onR); clearTimeout(rt);
      tl?.scrollTrigger?.kill(); tl?.kill();
      textures.forEach((t) => t.dispose()); mat.dispose(); mesh.geometry.dispose(); renderer.dispose(); canvas.remove();
    };
  });
})();
