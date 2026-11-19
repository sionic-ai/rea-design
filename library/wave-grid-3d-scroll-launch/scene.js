// 3D world — rebuild the original r3f scene with our own shapes and shaders at the same positions and values. The art reads colors from skin variables (--kf-*)
window.sgScene = (canvas) => {
  const T = THREE, css = window.sgCss;
  const C = (n) => new T.Color(css(n));
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  const scene = new T.Scene();
  scene.environment = window.sgEnv(renderer);
  const cam = new T.PerspectiveCamera(35, 1, .1, 200);
  const light = new T.DirectionalLight(C("--kf-ink"), 1.4);
  light.position.set(-3, 5, 6);
  scene.add(light, new T.AmbientLight(C("--kf-ink"), .25));

  // Text plane: draws the text on a canvas and attaches it to a plane (where the original’s troika text sits). h = Letter height (world units)
  const fontOf = (kind) => (kind === "display" ? `${css("--kf-weight-display")} 100px ${css("--kf-font-display")}` : `500 100px ${css("--kf-font-sans")}`);
  function textPlane(str, h, kind = "sans", opts = {}) {
    const c = document.createElement("canvas"), g = c.getContext("2d"), r = opts.res || 1, font = fontOf(kind).replace("100px", 100 * r + "px"), pad = 20 * r;
    g.font = font;
    const upper = kind === "display" ? str.toUpperCase() : str, ls = opts.spacing || 0;
    const w = Math.ceil(g.measureText(upper).width + ls * 100 * r * upper.length) + pad * 2;
    c.width = w; c.height = 140 * r;
    g.font = font; g.fillStyle = opts.color || css("--kf-ink"); g.textBaseline = "middle";
    if (ls && "letterSpacing" in g) g.letterSpacing = ls * 100 * r + "px";
    g.fillText(upper, pad, 72 * r);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
    const k = h / (100 * r), pw = w * k, ph = 140 * r * k;
    const mat = opts.material ? opts.material(tex) : new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: opts.both ? T.DoubleSide : T.FrontSide, toneMapped: false });
    const m = new T.Mesh(new T.PlaneGeometry(pw, ph), mat);
    if (opts.anchor === "left") m.geometry.translate(pw / 2 - pad * k, 0, 0);
    m.userData.w = pw - 2 * pad * k;
    return m;
  }

  // 1) Wave grid terrain: the plane wobbles with noise (.1x time) and bold grid lines are drawn on it in a shader
  const gridGroup = new T.Group(), gridPivot = new T.Group();
  gridGroup.add(gridPivot);
  gridPivot.rotation.set(Math.PI / 12, Math.PI / 4, 0);
  gridPivot.scale.setScalar(10.648);
  const NOISE = `vec2 hsh(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1. + 2. * fract(sin(p) * 43758.5453); }
  float gnoise(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6. - 15.) + 10.);
    return mix(mix(dot(hsh(i), f), dot(hsh(i + vec2(1, 0)), f - vec2(1, 0)), u.x), mix(dot(hsh(i + vec2(0, 1)), f - vec2(0, 1)), dot(hsh(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y); }`;
  const gridMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, side: T.DoubleSide,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uColor: { value: C("--kf-line") } },
    vertexShader: `uniform float uTime; varying vec2 vUv; varying float vFog; ${NOISE}
      void main(){ vUv = uv; vec3 p = position; float t = uTime * .1; p.y += gnoise(vec2(p.z * 1.25 + t, p.x * 1.25 + t)) * .62;
        vec4 mv = modelViewMatrix * vec4(p, 1.); vFog = smoothstep(48., 8., -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv; varying float vFog;
      void main(){ vec2 g = vUv * 34.; vec2 d = abs(fract(g - .5) - .5) / fwidth(g); float line = 1. - min(min(d.x, d.y) / 2.8, 1.);
        float a = line * uOpacity * vFog; if (a < .01) discard; gl_FragColor = vec4(uColor, a); }`,
  });
  const gridGeo = new T.PlaneGeometry(2.6, 2.6, 180, 180);
  gridGeo.rotateX(-Math.PI / 2);
  gridPivot.add(new T.Mesh(gridGeo, gridMat));
  scene.add(gridGroup);

  // 2) Center dot-cloud head: 2,600 gray dots, turns its head toward the cursor (.1 of the remainder each step)
  const headGeo = new T.BufferGeometry(), HN = 1500, hp = new Float32Array(HN * 3);
  for (let i = 0; i < HN; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1), r = .5 + .08 * Math.sin(5 * u) * Math.sin(3 * v) + (Math.random() - .5) * .08;
    let x = r * Math.sin(v) * Math.cos(u) * .82, y = r * Math.cos(v) * 1.05, z = r * Math.sin(v) * Math.sin(u) * .9;
    if (z > .35 && Math.abs(x) < .1 && y > -.2 && y < .15) z += .12;
    if (y < -.45) { x *= .6; z *= .6; }
    hp.set([x, y, z], i * 3);
  }
  // At first the dots are scattered across the screen (radius 9 balls), then gather into a head shape once the scene is ready
  const home = hp.slice(), far = new Float32Array(HN * 3);
  for (let i = 0; i < HN; i++) { const r = 3 + Math.random() * 6, u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1); far.set([r * Math.sin(v) * Math.cos(u) * 1.6, r * Math.cos(v), r * Math.sin(v) * Math.sin(u) * .5], i * 3); }
  hp.set(far);
  headGeo.setAttribute("position", new T.BufferAttribute(hp, 3));
  const head = new T.Points(headGeo, new T.PointsMaterial({ color: C("--kf-dim"), size: .026, sizeAttenuation: true, transparent: true, opacity: .85, depthWrite: false }));
  scene.add(head);

  // 3) Ten text lines: per line, white if world x is left of uWipe, gray if right — wiped from the left as you scroll
  const lines = ["Your first line on what the brand is", "Write it down. With this, people", "One line on what you can do.", "Continuing to write. The work of buying, selling and sharing,", "The structure underlying that work", "Add about two more lines. In easy words.", "The last four lines are the ones supporting it", "We put technology and promises in writing.", "So it reads in short breaks", "One thought per line."];
  const textGroup = new T.Group(), wipeUni = [];
  lines.forEach((t, i) => {
    const u = { uWipe: { value: -10 } };
    wipeUni.push(u);
    const m = textPlane(t, .6 * .45 * .72, "sans", { anchor: "left", material: (tex) => new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { map: { value: tex }, uWipe: u.uWipe, uOn: { value: C("--kf-ink") }, uOff: { value: C("--kf-line") } },
      vertexShader: "varying vec2 vUv; varying float vX; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.); vX = w.x; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: "uniform sampler2D map; uniform float uWipe; uniform vec3 uOn, uOff; varying vec2 vUv; varying float vX; void main(){ float a = texture2D(map, vUv).a; if (a < .01) discard; gl_FragColor = vec4(vX < uWipe ? uOn : uOff, a); }",
    }) });
    m.position.y = -i * .3;
    textGroup.add(m);
  });
  scene.add(textGroup);

  // 4) Wheel: 24 cells stand on a circle of radius 5.6 and roll around the x axis. Five cells carry step words (large text .35 · small text .14), four carry Chrome mockups
  const content = new T.Group(), wheel = new T.Group();
  content.add(wheel);
  scene.add(content);
  const R = 5.6, slots = { 11: ["Step four", "Your fourth step line here"], 13: ["Step three", "Your third step here, one line"], 15: ["Step two here", "Your one-line second step here"], 17: ["Step one here", "Your first step line here"], 19: ["", "< how it works >"] };
  const chrome = new T.MeshStandardMaterial({ color: C("--kf-ink-soft"), metalness: .9, roughness: .24, envMapIntensity: 2.2 });
  const extrude = (shape, depth = .18) => new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .04, bevelSize: .03, bevelSegments: 3, curveSegments: 24 });
  const models = {
    // Upload indicator: up arrow plus a base
    17: (() => { const g = new T.Group(); const a = new T.Shape(); a.moveTo(-.12, -.2); a.lineTo(-.12, .25); a.lineTo(-.32, .25); a.lineTo(0, .6); a.lineTo(.32, .25); a.lineTo(.12, .25); a.lineTo(.12, -.2); a.closePath();
      const tray = new T.Shape(); tray.moveTo(-.55, -.1); tray.lineTo(-.55, -.55); tray.lineTo(.55, -.55); tray.lineTo(.55, -.1); tray.lineTo(.42, -.1); tray.lineTo(.42, -.42); tray.lineTo(-.42, -.42); tray.lineTo(-.42, -.1); tray.closePath();
      g.add(new T.Mesh(extrude(a), chrome), new T.Mesh(extrude(tray), chrome)); return g; })(),
    // Coin: flat disc + slanted groove lines
    15: (() => { const g = new T.Group(); const disc = new T.Mesh(new T.CylinderGeometry(.6, .6, .1, 64), chrome); disc.rotation.x = Math.PI / 2; g.add(disc);
      for (let i = -5; i <= 5; i++) { const len = 2 * Math.sqrt(Math.max(0, .36 - Math.pow(i * .1, 2))); if (len < .05) continue; const b = new T.Mesh(new T.BoxGeometry(len, .025, .04), chrome); b.position.set(0, i * .1, .07); g.add(b); }
      g.rotation.z = .6; return g; })(),
    // Key: ring + body + teeth
    13: (() => { const g = new T.Group(); const ring = new T.Mesh(new T.TorusGeometry(.22, .07, 16, 48), chrome); ring.position.y = .45; g.add(ring);
      const s = new T.Mesh(new T.BoxGeometry(.1, .75, .1), chrome); g.add(s);
      [[-.25, .1], [-.38, .07], [-.15, .06]].forEach(([y, w]) => { const t = new T.Mesh(new T.BoxGeometry(w * 2.4, .07, .1), chrome); t.position.set(.08 + w, y, 0); g.add(t); }); return g; })(),
    // Money sign: two semicircles joined into an S shape + a vertical bar
    11: (() => { const g = new T.Group(); const top = new T.Mesh(new T.TorusGeometry(.2, .07, 16, 48, Math.PI * 1.25), chrome); top.position.y = .2; top.rotation.z = Math.PI * .1; g.add(top);
      const bot = new T.Mesh(new T.TorusGeometry(.2, .07, 16, 48, Math.PI * 1.25), chrome); bot.position.y = -.2; bot.rotation.z = Math.PI * 1.1; g.add(bot);
      const bar = new T.Mesh(new T.BoxGeometry(.06, 1, .06), chrome); g.add(bar); return g; })(),
  };
  const pops = [];
  Object.entries(slots).forEach(([k, [big, small]]) => {
    const s = +k * Math.PI * 2 / 24, slot = new T.Group();
    slot.position.set(0, R * Math.sin(s), R * Math.cos(s));
    slot.rotation.x = -s;
    if (big) { const b = textPlane(big, .35 * .72, "display", { spacing: .05 }); b.position.y = .12; slot.add(b); }
    const sm = textPlane(small, .14 * .72, big ? "sans" : "display", { spacing: .05 }); sm.position.y = big ? -.32 : 0; slot.add(sm);
    if (models[k]) { const m = models[k], holder = new T.Group(); m.scale.setScalar(1.7); holder.add(m); holder.position.set(3.1, .25, .3); holder.scale.setScalar(.3); slot.add(holder); pops.push({ k: +k, holder, model: m }); }
    wheel.add(slot);
  });

  // 5) Three cards: rounded plates (2.24×3.84, .14) — front is a pattern, back is text. They flip half a turn in sequence. The border fills with white on hover
  const cards = new T.Group();
  scene.add(cards);
  const rr = (w, h, r) => { const s = new T.Shape(); s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0); s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2); s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI); s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5); return s; };
  function face(kind, label, foot, text) {
    const c = document.createElement("canvas"); c.width = 448; c.height = 768;
    const g = c.getContext("2d"), ink = css("--kf-ink");
    g.fillStyle = css("--kf-bg"); g.fillRect(0, 0, 448, 768);
    g.fillStyle = ink; g.strokeStyle = ink;
    if (kind === "front") {
      g.globalAlpha = .25;
      for (let y = 40; y < 768; y += 18) for (let x = 20; x < 448; x += 18) { g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
      g.globalAlpha = 1; g.beginPath(); g.arc(80, 80, 26, 0, 7); g.fill();
      g.beginPath(); g.arc(220, 620, 80, 0, 7); g.fill();
      g.lineWidth = 2; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(448, 300 + i * 18); g.lineTo(250, 640 + i * 6); g.stroke(); }
    } else {
      g.font = `${css("--kf-weight-display")} 22px ${css("--kf-font-display")}`; g.textBaseline = "middle";
      g.fillText(label.toUpperCase(), 40, 70); g.textAlign = "right"; g.fillText(foot.toUpperCase(), 408, 700);
      g.beginPath(); g.arc(380, 70, 16, 0, 7); g.lineWidth = 3; g.stroke();
      g.beginPath(); g.arc(70, 700, 22, 0, 7); g.stroke();
      g.textAlign = "center"; g.font = `500 26px ${css("--kf-font-sans")}`;
      text.forEach((t, i) => g.fillText(t, 224, 360 + i * 36 - text.length * 18));
    }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; return tex;
  }
  const cardShape = rr(2.24, 3.84, .14), cardData = [
    { pos: [-2, -2.5], dir: -1, label: "Card one", foot: "Tag one", text: ["Your first card here", "The Promise in a Few Lines", "We write it down"] },
    { pos: [2, -5.5], dir: 1, label: "Card two", foot: "Tag two", text: ["Your second card text here", "The Promise in a Few Lines", "We write it down"] },
    { pos: [-2, -8.5], dir: -1, label: "Card three", foot: "Tag three", text: ["Your third card here", "The Promise in a Few Lines", "We write it down"] },
  ].map((d) => {
    const pivot = new T.Group(), g = new T.Group();
    pivot.position.set(d.pos[0], d.pos[1], 0);
    const geo = new T.ShapeGeometry(cardShape, 12);
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 2.24 + .5, pos.getY(i) / 3.84 + .5);
    const front = new T.Mesh(geo, new T.MeshBasicMaterial({ map: face("front"), toneMapped: false }));
    const back = new T.Mesh(geo, new T.MeshBasicMaterial({ map: face("back", d.label, d.foot, d.text), toneMapped: false }));
    back.rotation.y = Math.PI; back.position.z = -.005;
    const edge = new T.LineLoop(new T.BufferGeometry().setFromPoints(cardShape.getSpacedPoints(160)), new T.LineBasicMaterial({ color: C("--kf-line"), transparent: true }));
    const edgeB = edge.clone(); edgeB.position.z = -.006;
    g.add(front, back, edge, edgeB);
    pivot.add(g); cards.add(pivot);
    return { ...d, pivot, g, edge: [edge, edgeB], hit: front, over: 0 };
  });
  const title = new T.Group();
  const t1 = textPlane("Section", .5 * .72, "display"), t2 = textPlane("Title", .5 * .72, "display");
  t2.position.y = -.7; title.add(t1, t2); title.position.y = 2; cards.add(title);
  const tagOf = (a, b, line) => {
    const g = new T.Group(), c = document.createElement("canvas"); c.width = 900; c.height = 108;
    const x = c.getContext("2d"); x.strokeStyle = css("--kf-ink"); x.fillStyle = css("--kf-ink"); x.lineWidth = 2; x.setLineDash([6, 5]);
    x.font = `${css("--kf-weight-display")} 34px ${css("--kf-font-display")}`; x.textBaseline = "middle";
    const wa = x.measureText(a.toUpperCase()).width + 60;
    x.beginPath(); x.roundRect(2, 8, wa, 92, 46); x.stroke(); x.fillText(a.toUpperCase(), 32, 56); x.fillText(b.toUpperCase(), wa + 30, 56);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(new T.PlaneGeometry(2.8, .336), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
    m.position.x = 1.4; g.add(m);
    const d = textPlane(line, .145 * .72, "sans", { anchor: "left" }); d.position.set(.06, -.5, 0); g.add(d);
    return g;
  };
  const tag1 = tagOf("Tag one", "Tag two", "Summarize this paragraph in one line here");
  tag1.position.set(.8, -1.5, 0); cards.add(tag1);

  // 6) Particle field: 18,000 dots on a wide panel undulate in two layers of waves (yOffset 8→-8) and lean toward the cursor
  const field = new T.Group(), FW = 150, FH = 120, fp = new Float32Array(FW * FH * 3), seed = new Float32Array(FW * FH);
  for (let j = 0, n = 0; j < FH; j++) for (let i = 0; i < FW; i++, n++) { fp.set([(i / FW - .5) * 30 + (Math.random() - .5) * .2, 0, (j / FH - .5) * 24 + (Math.random() - .5) * .2], n * 3); seed[n] = Math.random(); }
  const fgeo = new T.BufferGeometry();
  fgeo.setAttribute("position", new T.BufferAttribute(fp, 3)); fgeo.setAttribute("aSeed", new T.BufferAttribute(seed, 1));
  const fieldMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uOffset: { value: 8 }, uColor: { value: C("--kf-ink") }, uPx: { value: 1 }, uAlpha: { value: 0 } },
    vertexShader: `uniform float uTime, uOffset, uPx; attribute float aSeed; varying float vA;
      void main(){ vec3 p = position; p.y = sin(p.x * .35 + uTime * .4) * .9 + cos(p.z * .45 + uTime * .3) * .7 + uOffset * .25 * sin(p.z * .1);
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = uPx * (1. + 2.2 * aSeed) * 16. / -mv.z; vA = (.35 + .65 * aSeed) * smoothstep(60., 8., -mv.z); }`,
    fragmentShader: "uniform vec3 uColor; uniform float uAlpha; varying float vA; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(uColor, uAlpha * vA * smoothstep(.5, .3, d)); }",
  });
  const points = new T.Points(fgeo, fieldMat);
  points.rotation.x = .9;
  const fieldPivot = new T.Group(); fieldPivot.add(points); field.add(fieldPivot);
  const pave = textPlane("Third title here", .9 * .72, "display", { spacing: .05 }); pave.position.set(0, -7.75, 0); field.add(pave);
  const tag2 = tagOf("Tag one", "Tag two", "Summarize your last paragraph here in one line"); tag2.position.set(2.2, -9.35, 0); field.add(tag2);
  fieldPivot.position.y = -7.75;
  scene.add(field);

  // 7) Footer: giant wordmark overflowing the screen
  const endGroup = new T.Group(), giant = textPlane("Brand", 4.2, "display", { res: 4 });
  endGroup.add(giant); scene.add(endGroup);

  // Screen bend: after drawing the scene onto a plane, the bottom of the screen pinches −0.23 horizontally and shifts up .05 by the amount of scroll inertia (cubed toward the bottom)
  const rt = new T.WebGLRenderTarget(2, 2, { samples: 4 });
  const post = new T.ShaderMaterial({
    uniforms: { tScene: { value: rt.texture }, uInertia: { value: 0 }, uAmt: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
    fragmentShader: `uniform sampler2D tScene; uniform float uInertia, uAmt; varying vec2 vUv;
      void main(){ float k = uInertia * uAmt; float y = 1. - vUv.y; y = y * y * y;
        vec2 uv = vec2(vUv.x + (vUv.x - .5) * (-.23 * k * y), vUv.y + .05 * k * y);
        gl_FragColor = texture2D(tScene, uv); }`,
    depthTest: false, depthWrite: false, transparent: true,
  });
  const postScene = new T.Scene(), postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  postScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), post));

  let W = 1, H = 1;
  function size() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    const dpr = renderer.getPixelRatio();
    rt.setSize(W * dpr, H * dpr);
    cam.aspect = W / H;
    // Pulls back so the text line (width 5) fits even on narrow screens
    cam.position.set(0, 0, Math.max(13, 5.4 / (2 * Math.tan(17.5 * Math.PI / 180) * cam.aspect)));
    cam.updateProjectionMatrix();
    fieldMat.uniforms.uPx.value = H / 900 * dpr;
    // Narrow screen: like the original phone version, cards stand in a single centered column and the button caption moves above the card
    const narrow = cam.aspect < .8;
    cardData.forEach((c, i) => c.pivot.position.set(narrow ? 0 : c.pos[0], narrow ? -3 - i * 4.4 : c.pos[1], 0));
    tag1.position.set(narrow ? -1.4 : .8, narrow ? -.6 : -1.5, 0);
  }
  size();
  addEventListener("resize", size);
  renderer.compile(scene, cam);

  const mouse = { x: 0, y: 0 }, ray = new T.Raycaster(), ndc = new T.Vector2();
  addEventListener("pointermove", (e) => { mouse.x = e.clientX / W * 2 - 1; mouse.y = -(e.clientY / H * 2 - 1); }, { passive: true });

  // Dot head: each dot follows cursor position + a rotated head shape at its own speed (.03~.1), leaving a tail as it moves.
  // k is how far it has gathered from the scattered spot (far) into the head shape
  const lag = new Float32Array(HN).map(() => .03 + Math.random() * .07), hv = new T.Vector3();
  const headStep = (center, yaw, pitch, k) => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    for (let i = 0; i < HN; i++) {
      const j = i * 3;
      let x = home[j] * .78, y = home[j + 1] * .9, z = home[j + 2] * .78;
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      hv.set(center.x + x1, center.y + y2, center.z + z2);
      const tx = far[j] + (hv.x - far[j]) * k, ty = far[j + 1] + (hv.y - far[j + 1]) * k, tz = far[j + 2] + (hv.z - far[j + 2]) * k, f = lag[i];
      hp[j] += (tx - hp[j]) * f; hp[j + 1] += (ty - hp[j + 1]) * f; hp[j + 2] += (tz - hp[j + 2]) * f;
    }
    headGeo.attributes.position.needsUpdate = true;
  };
  // z the cursor points at = Slot on the 2 plane
  const plane = new T.Plane(new T.Vector3(0, 0, 1), -2), aim = new T.Vector3();
  const cursorAt = () => { ndc.set(mouse.x, mouse.y); ray.setFromCamera(ndc, cam); return ray.ray.intersectPlane(plane, aim) || aim.set(0, 0, 2); };

  return {
    headStep, cursorAt,
    renderer, cam, gridGroup, gridMat, textGroup, wipeUni, content, wheel, pops, cards, cardData, field, fieldPivot, fieldMat, endGroup, giant, post, mouse,
    project(obj, out) { obj.getWorldPosition(out); out.project(cam); return { x: (out.x + 1) / 2 * W, y: (1 - out.y) / 2 * H, z: out.z }; },
    hover() {
      ndc.set(mouse.x, mouse.y); ray.setFromCamera(ndc, cam);
      const hit = ray.intersectObjects(cardData.map((c) => c.hit))[0];
      return hit ? cardData.find((c) => c.hit === hit.object) : null;
    },
    render(bend) {
      if (bend > .001) {
        renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
        renderer.setRenderTarget(null); renderer.clear(); renderer.render(postScene, postCam);
      } else { renderer.setRenderTarget(null); renderer.render(scene, cam); }
    },
  };
};
