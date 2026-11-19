// About — a single vertical 9:16 card passes three placeholders (.js-flip-ref) by scroll (scrub .75). Between placeholders it is joined by Catmull-Rom,
// While moving it leans forward (sin(π·u) × −.4 rad) and turns half a turn on the Y axis per cell — the back face is mirrored left-to-right and darkened to .82.
// The panel’s center bulges in proportion to scroll speed (up to .45 of max width) and shading falls from a top-left light (ambient .65, diffuse .45). The photo switches among three as progress advances.
(() => {
  const T = window.THREE;
  const refs = [...document.querySelectorAll(".js-flip-ref")];
  if (!T || G.reduce || refs.length < 2) return;
  const VERT = `precision mediump float;
    #define PI 3.141592
    uniform float u_bend; varying vec2 vUv; varying vec3 vNormal;
    void main() {
      vec3 p = position;
      float sx = sin(PI * uv.x), sy = 0.75 + 0.25 * sin(PI * uv.y);
      p.z += u_bend * sx * sy;
      float dzdx = u_bend * PI * cos(PI * uv.x) * sy, dzdy = u_bend * sx * 0.25 * PI * cos(PI * uv.y);
      vNormal = normalize(normalMatrix * vec3(-dzdx, -dzdy, 1.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      vUv = uv;
    }`;
  const FRAG = `precision highp float;
    uniform vec2 u_res, u_size; uniform sampler2D u_texture; uniform float u_alpha;
    varying vec2 vUv; varying vec3 vNormal;
    const vec3 LIGHT = vec3(-0.39, 0.49, 0.78);
    vec2 cover(vec2 s, vec2 i, vec2 uv) {
      float sr = s.x / s.y, ir = i.x / i.y;
      vec2 n = sr < ir ? vec2(i.x * (s.y / i.y), s.y) : vec2(s.x, i.y * (s.x / i.x));
      vec2 o = (sr < ir ? vec2((n.x - s.x) / 2.0, 0.0) : vec2(0.0, (n.y - s.y) / 2.0)) / n;
      return uv * s / n + o;
    }
    void main() {
      vec2 suv = vUv;
      if (!gl_FrontFacing) suv.x = 1.0 - suv.x;
      vec4 tex = texture2D(u_texture, cover(u_res, u_size, suv));
      vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
      float shade = clamp(0.65 + 0.45 * clamp(dot(n, LIGHT), 0.0, 1.0), 0.0, 1.0);
      if (!gl_FrontFacing) shade *= 0.82;
      gl_FragColor = vec4(tex.rgb * shade, tex.a * u_alpha);
    }`;
  const canvas = document.createElement("canvas");
  canvas.className = "ab-gl";
  document.body.prepend(canvas);
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(45, 1, 0.1, 2000);
  camera.position.z = 50;
  // Placeholder photos — three vertical 9:16 plates, gray compositions painted in the Skin’s colors + a note on what the photo is
  const css = getComputedStyle(document.documentElement);
  const v = (k) => css.getPropertyValue(k).trim();
  const LABELS = ["Vertical 9:16 photo 1 · work on a desk screen · from above", "Vertical 9:16 photo 2 · newsletter cover · front view", "Portrait 9:16 photo 3 · Lecture screen · Front view"];
  const textures = LABELS.map((label, i) => {
    const c = document.createElement("canvas");
    c.width = 540; c.height = 960;
    const x = c.getContext("2d");
    x.fillStyle = v("--kf-raised"); x.fillRect(0, 0, 540, 960);
    x.fillStyle = v("--kf-line"); x.fillRect(40, 60 + i * 90, 460, 300); x.fillRect(40, 420 + i * 40, 220, 360);
    x.fillStyle = v("--kf-dim"); x.fillRect(290, 420 + i * 40, 210, 160);
    x.fillStyle = v("--kf-ink"); x.font = `500 26px ${v("--kf-font-sans")}`;
    label.split(" · ").forEach((l, k) => x.fillText(l, 40, 860 + k * 34 - (label.split(" · ").length - 1) * 34));
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  });
  const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, side: T.DoubleSide, transparent: true, depthTest: false, depthWrite: false,
    uniforms: { u_texture: { value: textures[0] }, u_res: { value: new T.Vector2(1, 1) }, u_size: { value: new T.Vector2(540, 960) }, u_alpha: { value: 1 }, u_bend: { value: 0 } } });
  const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 32, 16), mat);
  scene.add(mesh);
  let W = innerWidth, H = innerHeight, cam = { x: 1, y: 1 };
  const size = () => {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    cam = { x: h * camera.aspect, y: h };
  };
  size();
  const st = { progress: 0, oy: 0, idx: 0, v: 0, n: null };
  const cr = (a, b, c, d, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); };
  const sync = () => {
    const last = refs.length - 1, e = Math.max(0, Math.min(st.progress, last)), s = Math.min(Math.floor(e), last - 1), u = e - s;
    const k = Math.min(Math.floor((e / last) * textures.length), textures.length - 1);
    if (k !== st.idx) { st.idx = k; mat.uniforms.u_texture.value = textures[k]; }
    const rs = refs.map((r) => r.getBoundingClientRect());
    const at = (i) => rs[Math.max(0, Math.min(i, last))];
    const f = (key) => cr(at(s - 1)[key], at(s)[key], at(s + 1)[key], at(s + 2)[key], u);
    const b = { width: f("width"), height: f("height"), left: f("left"), top: f("top") };
    mat.uniforms.u_res.value.set(b.width, b.height);
    const sx = cam.x * (b.width / W), sy = cam.y * (b.height / H);
    mesh.scale.set(sx, sy, 1);
    mesh.position.x = -cam.x / 2 + sx / 2 + (b.left / W) * cam.x;
    mesh.position.y = cam.y / 2 - sy / 2 - ((b.top + st.oy) / H) * cam.y;
    mesh.rotation.set(Math.sin(Math.PI * u) * -0.4, e * Math.PI, 0);
    if (st.n === null) st.n = e;
    st.v += (e - st.n - st.v) * 0.12; st.n = e;
    mat.uniforms.u_bend.value = Math.max(-1, Math.min(1, st.v * 40)) * sx * 0.45;
  };
  let tl = null;
  const build = () => {
    tl?.scrollTrigger?.kill(); tl?.kill();
    const y = scrollY, h = innerHeight;
    const pos = refs.map((r, i) => { const b = r.getBoundingClientRect(), top = b.top + y; return i === 0 ? top - h / 2 : top + b.height / 2 - h / 2; });
    tl = gsap.timeline({ scrollTrigger: { start: pos[0], end: pos[pos.length - 1], scrub: 0.75 } });
    for (let i = 1; i < pos.length; i++) tl.to(st, { progress: i, duration: pos[i] - pos[i - 1], ease: "none" }, ">");
  };
  build();
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { size(); build(); ScrollTrigger.refresh(); }, 150); });
  // First entrance: if on screen, it rises from below over 1.3s expo like the other panels
  addEventListener("g:intro", () => {
    const r = refs[0].getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) { st.oy = innerHeight - r.top; gsap.to(st, { oy: 0, duration: 1.3, ease: "expo" }); }
  });
  gsap.ticker.add(() => { sync(); renderer.render(scene, camera); });
})();
