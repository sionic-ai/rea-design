// Home page — takes the chaos level (--fx-chaos, scroll-chaos-mode part) and shakes the hero WebGL·list photos·title·cover on the same frame clock
(() => {
  const { cl, mix, rad, rnd, range, hit, any, css, val } = kk;
  const root = document.documentElement, body = document.body;
  const W = () => root.clientWidth, H = () => innerHeight;
  const chaos = () => { const v = root.style.getPropertyValue("--fx-chaos"); return v === "" ? 0 : +v; };
  const firstRate = () => cl(scrollY, 0, 1, 0, H() * 0.25) * chaos();
  const hue = (h) => `hsl(${(h * 360) % 360} 100% 50%)`; // Not skin: the random color wheel in chaos mode is the content

  // Gathers the English subtitles hidden on phone at the end of the statement and shows them again
  const subs = document.querySelector(".kk-concept__subs");
  document.querySelectorAll(".kk-block .kk-block__sub").forEach((s) => {
    const k = s.cloneNode(true);
    k.classList.remove("kk-lg");
    subs.append(k);
  });

  // Like the original, sweep through declaration lines, list titles and list photos in document order and pick one effect each that differs from the one just before. WebGL up to 6
  const LOOKS = ["blur", "echo", "strike", "wave", "shadow", "font", "slice", "wobble", "scale", "block"];
  const GL = ["shatter", "cube", "cloth"];
  let prev = "", glCount = 0;
  const choose = (list) => {
    const pool = list.filter((e) => e !== prev);
    let e = any(pool.length ? pool : list);
    if (GL.includes(e)) glCount++;
    if (glCount >= 6) e = e === "cube" || e === "cloth" ? any(["spread", "edge"]) : e === "shatter" ? "shadow" : e;
    prev = e;
    return e;
  };
  const useLook = (el, look) => { el.setAttribute("data-fx", "char-glitch-medley"); el.setAttribute("data-fx-char-glitch-medley", `look: ${look}`); };
  document.querySelectorAll(".kk-line").forEach((el) => useLook(el, choose(LOOKS)));

  const shatters = [], cubes = [], cloths = [], edges = [];
  document.querySelectorAll(".kk-item").forEach((item) => {
    const ttl = item.querySelector(".kk-item__ttl"), media = item.querySelector(".kk-item__media");
    const t = choose(ttl.dataset.effects.split(","));
    if (t === "shatter") shatters.push(ttl);
    else useLook(ttl, t);
    const m = choose(media.dataset.effects.split(","));
    media.dataset.effect = m;
    if (m === "spread") {
      media.setAttribute("data-fx", "slice-spread-glitch");
      media.setAttribute("data-fx-slice-spread-glitch", `types: ${any([0, 1])}; every: 5; swap: 0`);
    } else if (m === "edge") edges.push(media);
    else if (m === "cube") cubes.push(media);
    else if (m === "cloth") cloths.push(media);
  });

  if (kk.reduce) return;

  const seen = new Set();
  const io = new IntersectionObserver((list) => list.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target))));
  const watch = (el) => { io.observe(el); return el; };
  const docTop = (el) => el.getBoundingClientRect().top + scrollY;
  const scrollRate = (top) => cl(scrollY + H(), 0, 1, top + H() * 0.25, top + H() * 2);
  let frame = 0;

  // ---- WebGL shared: 1 unit = Perspective camera at 1px, photo placeholder texture ----
  const makeGL = (canvas, alpha) => {
    const r = new THREE.WebGLRenderer({ canvas, antialias: false, alpha, powerPreference: "low-power" });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    return {
      r, scene, cam,
      size(w, h) {
        r.setSize(w, h, false);
        cam.aspect = w / h;
        cam.position.z = h / 2 / Math.tan(rad(22.5));
        cam.far = cam.position.z * 6;
        cam.updateProjectionMatrix();
      },
    };
  };
  const placeholder = (label) => {
    const s = 1024, c = document.createElement("canvas");
    c.width = c.height = s;
    const x = c.getContext("2d");
    x.fillStyle = css("--kf-surface");
    x.fillRect(0, 0, s, s);
    x.strokeStyle = css("--kf-dim");
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(s, s); x.moveTo(s, 0); x.lineTo(0, s); x.stroke();
    x.font = `500 26px ${css("--kf-font-mono")}`;
    const w = x.measureText(label).width + 36;
    x.fillStyle = css("--kf-surface");
    x.fillRect((s - w) / 2, s / 2 - 24, w, 48);
    x.fillStyle = css("--kf-ink-soft");
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(label, s / 2, s / 2);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const plane = new THREE.PlaneGeometry(1, 1);
  // Six cube faces — each face number has a set position and direction, and turning by key changes the front face
  const placeFace = (m, k, a) => {
    m.rotation.set(0, 0, 0);
    m.position.set(0, 0, 0);
    if (k === 0) m.position.z = a / 2;
    if (k === 1) { m.rotation.y = rad(90); m.position.x = a / 2; }
    if (k === 2) { m.rotation.y = rad(180); m.position.z = -a / 2; }
    if (k === 3) { m.rotation.y = rad(270); m.position.x = -a / 2; }
    if (k === 4) { m.rotation.x = rad(90); m.position.y = a / 2; }
    if (k === 5) { m.rotation.x = rad(-90); m.position.y = -a / 2; }
  };

  // ---- Hero back panel: cube (normal) ↔ afterimage smear (switches with a 1% chance when the chaos level exceeds .5) ----
  const noise = (() => {
    const wrap = document.querySelector(".kk-noise");
    if (!wrap || !window.THREE) return null;
    const cubeCv = wrap.querySelector(".kk-noise__cube"), smearCv = wrap.querySelector(".kk-noise__smear");
    const tex = ["Person snapshot · night street · shaky long exposure · square", "Upper-body portrait · fluorescent light · blurred background · square", "Street scene · blurred lights · camera shake · square"].map(placeholder);
    const bgColor = () => new THREE.Color(css("--kf-bg"));
    let type = 1, key = 0, c = 0, target = new THREE.Color(hue(Math.random()));

    const A = makeGL(cubeCv, false);
    const spin = new THREE.Group();
    A.scene.add(spin);
    const faces = [0, 1, 2, 3, 4, 5].map((i) => { const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: tex[i % 3], side: THREE.DoubleSide })); spin.add(m); return m; });
    const alts = [0, 1].map((i) => { const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: tex[i % 2], side: THREE.DoubleSide })); m.visible = false; spin.add(m); return m; });

    // Afterimage: over the color board (10 photo pieces), drag the previous frame near the mouse and blend it, feeding back at .98 so it fades
    const B = new THREE.WebGLRenderer({ canvas: smearCv, antialias: false, powerPreference: "low-power" });
    B.setPixelRatio(1);
    const ortho = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10, 10);
    const rt = () => new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false });
    const rtColor = rt(), rtMix = rt(), rtKeep = rt();
    const colorScene = new THREE.Scene();
    const pieces = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: any(tex.slice(0, 2)), transparent: true })); colorScene.add(m); return m; });
    const vert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
    const mixMat = new THREE.ShaderMaterial({
      uniforms: { layer: { value: rtColor.texture }, past: { value: rtKeep.texture }, pointer: { value: new THREE.Vector2() }, pull: { value: new THREE.Vector2() }, drift: { value: new THREE.Vector2() } },
      vertexShader: vert,
      fragmentShader: `uniform sampler2D layer; uniform sampler2D past; uniform vec2 pointer; uniform vec2 pull; uniform vec2 drift; varying vec2 vUv;
        void main(){
          float near = pow(max(0.0, 1.4142 - distance(pointer * 0.5 + 0.5, vUv)), 30.0) * 0.000005;
          vec4 old = texture2D(past, vUv + pull * near + drift);
          vec4 now = texture2D(layer, vUv);
          gl_FragColor = vec4(old.rgb * old.a + now.rgb * (1.0 - old.a), min(1.0, (now.a + old.a) * 0.98));
        }`,
    });
    const copyMat = new THREE.ShaderMaterial({ uniforms: { src: { value: rtMix.texture } }, vertexShader: vert, fragmentShader: "uniform sampler2D src; varying vec2 vUv; void main(){ gl_FragColor = texture2D(src, vUv); }" });
    const toneMat = new THREE.ShaderMaterial({
      uniforms: { src: { value: rtKeep.texture }, lift: { value: 0 }, punch: { value: 0 } },
      vertexShader: vert,
      fragmentShader: "uniform sampler2D src; uniform float lift; uniform float punch; varying vec2 vUv; void main(){ vec4 c = texture2D(src, vUv); c.rgb = (c.rgb - 0.5) / (1.0 - punch) + 0.5 + lift; gl_FragColor = c; }",
    });
    const quad = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(plane, mat)); return s; };
    const mixScene = quad(mixMat), copyScene = quad(copyMat), toneScene = quad(toneMat);
    const sm = { pull: [0, 0], drift: [0, 0], pointer: [0, 0], bg: new THREE.Color(), base: [] };

    const size = () => {
      A.size(W(), H());
      B.setSize(W(), H(), false);
      [rtColor, rtMix, rtKeep].forEach((t) => t.setSize(W(), H()));
      ortho.left = -W() / 2; ortho.right = W() / 2; ortho.top = H() / 2; ortho.bottom = -H() / 2;
      ortho.updateProjectionMatrix();
      [mixScene, copyScene, toneScene].forEach((s) => s.children[0].scale.set(W(), H(), 1));
    };
    size();
    addEventListener("resize", size);

    const reset = () => {
      const e = firstRate(), n0 = Math.max(W(), H()) * 0.38;
      pieces.forEach((p, i) => {
        p.material.map = any(tex.slice(0, 2));
        p.position.set(i === 0 ? 0 : mix(0, range(W()), e), i === 0 ? 0 : mix(0, range(H()), e), 0);
        const s = mix(n0, i === 0 ? n0 : n0 * rnd(0.2, 2), e);
        p.scale.set(s, s, 1);
      });
      const k = mix(0, 0.1, e), sgn = () => rnd(50, 1000) * (hit(2) ? -1 : 1);
      sm.pull = [sgn() * k, sgn() * k];
      sm.drift = [sgn() * k * 1e-4, sgn() * k * 1e-4];
      sm.pointer = [range(1), range(2)];
      toneMat.uniforms.lift.value = mix(0, rnd(0, 0.3) * (hit(2) ? -1 : 1), e);
      toneMat.uniforms.punch.value = mix(0, rnd(0.2, 0.6), e);
      sm.bg = new THREE.Color(any([0, 1 / 3, 2 / 3].map(hue)));
      B.setRenderTarget(rtMix); B.setClearColor(0x000000, 0); B.clear();
      B.setRenderTarget(rtKeep); B.clear();
      B.setRenderTarget(null);
    };
    reset();

    return () => {
      c++;
      const n = firstRate();
      if (n < 0.05) type = 1;
      else if (n > 0.5 && hit(100)) type = any([0, 1, 2]);
      const visible = scrollY < H() * 1.2 || body.classList.contains("is-chaos");
      cubeCv.hidden = type === 0;
      smearCv.hidden = type !== 0;
      if (type === 0) {
        if (c % 30 === 0) reset();
        const a = rad(c * 0.5);
        mixMat.uniforms.pointer.value.set(mix(0, sm.pointer[0], n), mix(0, sm.pointer[1], n));
        mixMat.uniforms.drift.value.set(sm.drift[0], sm.drift[1]);
        mixMat.uniforms.pull.value.set(Math.sin(a * 1.23) * 2000 * n, Math.cos(a * -0.97) * 2000 * n);
        if (c % 2 || !visible) return;
        const clear = bgColor().lerp(sm.bg, n);
        B.setClearColor(clear, 1);
        B.setRenderTarget(rtColor); B.clear(); B.render(colorScene, ortho);
        B.setRenderTarget(rtMix); B.clear(); B.render(mixScene, ortho);
        B.setRenderTarget(rtKeep); B.clear(); B.render(copyScene, ortho);
        B.setRenderTarget(null); B.clear(); B.render(toneScene, ortho);
        return;
      }
      const i = W() * val(0.69, 0.38), s = rad(c);
      spin.rotation.set(rad(Math.sin(s) * 180 * n), rad(Math.cos(s * 1.2) * 180 * n), rad(Math.sin(s * -0.88) * 180 * n));
      spin.position.z = mix(-i / 2, 0, n);
      if (n < 0.05 && c % 120 === 0) key++;
      const a = mix(i, i * cl(Math.sin(s * 6.73), 0, 1.2, -1, 1), n);
      faces.forEach((m, h) => {
        m.scale.set(i, i, 1);
        placeFace(m, (h + key) % 6, a);
        if (h === 2 || h === 5) {
          const f = alts[h === 2 ? 0 : 1];
          m.visible = n <= 0.05;
          f.visible = !m.visible;
          f.position.copy(m.position);
          f.rotation.copy(m.rotation);
          f.scale.set(i, i, 1);
        }
      });
      if (hit(50)) target = new THREE.Color(hue(Math.random()));
      if (c % 2 || !visible) return;
      A.r.setClearColor(bgColor().lerp(target, n), 1);
      A.r.render(A.scene, A.cam);
    };
  })();

  // ---- List photo: WebGL cube ----
  const cubeUpdaters = cubes.map((media) => {
    const cv = document.createElement("canvas");
    media.append(cv);
    media.classList.add("is-gl");
    watch(media);
    const g = makeGL(cv, true);
    const spin = new THREE.Group();
    g.scene.add(spin);
    const t = placeholder(media.querySelector(".kk-item__pic").dataset.label.replace("Landscape 2:1", "Square Texture"));
    const faces = [0, 1, 2, 3, 4, 5].map(() => { const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); spin.add(m); return m; });
    let c = (Math.random() * 360) | 0, w = 0;
    const size = () => { w = W(); g.size(w, w * 0.5); };
    size();
    addEventListener("resize", size);
    return () => {
      c++;
      if (!seen.has(media) || c % 2) return;
      const r = chaos(), n = rad(c);
      spin.rotation.set(rad(Math.sin(n) * 180 * r), rad(Math.cos(n * 1.4) * 180 * r), rad(Math.sin(n * -0.78) * 180 * r));
      spin.position.z = mix(-w / 2, 0, r);
      const s = mix(w, w * cl(Math.sin(n * 6.73), 1, 1, -1, 1), r);
      faces.forEach((m, k) => { m.scale.set(w, w, 1); placeFace(m, k, s); });
      g.r.setClearColor(0x000000, 0);
      g.r.render(g.scene, g.cam);
    };
  });

  // ---- List photos: photos laid over a matter-js cloth mesh (12×10), and a mouse circle pushes the mesh — one mesh is shared by all cloth photos ----
  const pointer = { x: -9999, y: -9999 };
  const follow = (x, y) => { pointer.x = x; pointer.y = y; };
  addEventListener("pointermove", (e) => follow(e.clientX, e.clientY), { passive: true });
  // Touch pointermove is cut off once scrolling starts. Like the original, finger position is still received while scrolling (after release it stays at the last position)
  const onTouch = (e) => e.touches.length && follow(e.touches[0].clientX, e.touches[0].clientY);
  addEventListener("touchstart", onTouch, { passive: true });
  addEventListener("touchmove", onTouch, { passive: true });
  const cloth = (() => {
    if (!cloths.length || !window.Matter) return null;
    const { Engine, Runner, Bodies, Composite, Composites, Body, Events, Common } = Matter;
    const COLS = 12, ROWS = 10;
    const engine = Engine.create();
    engine.timing.timeScale = 0.5;
    engine.constraintIterations = 1;
    engine.positionIterations = 3;
    engine.gravity.x = range(0.5);
    engine.gravity.y = range(0.5);
    const NET = 8, MOUSE = 4;
    const w = W(), canvasH = w * 0.5, side = w * 1.25, cw = side / COLS, ch = side / ROWS;
    const stack = Composites.stack((w - side) / 2, (canvasH - side) / 2, COLS, ROWS, 0, 0, (x, y) => Bodies.rectangle(x, y, cw, ch, Common.extend({ inertia: Infinity, friction: 0.85, collisionFilter: { category: NET, mask: MOUSE, group: 0 } })));
    Composites.mesh(stack, COLS, ROWS, false, { stiffness: 0.9, damping: 0.9 });
    const b = stack.bodies;
    for (let i = 0; i < COLS; i++) { b[i].isStatic = true; b[b.length - 1 - i].isStatic = true; }
    for (let j = 0; j < ROWS; j++) { b[j * COLS].isStatic = true; b[j * COLS + COLS - 1].isStatic = true; }
    const ball = Bodies.circle(0, 0, Math.max(w, H()) * 0.15, { isStatic: true, collisionFilter: { category: MOUSE, mask: NET, group: 0 } });
    Composite.add(engine.world, [stack, ball]);
    Body.setPosition(ball, { x: 9999, y: 9999 });
    let rate = 0, cnt = 0;
    Events.on(engine, "afterUpdate", () => {
      cnt++;
      // Below chaos .75 the circle stays off screen (toward -9999) — only from .75→1 does it come in to the cursor spot
      const k = cl(rate, 0, 1, 0.75, 1);
      Body.setPosition(ball, { x: mix(-9999, pointer.x + Math.sin(cnt * 0.05) * w * 0.15, k), y: mix(0, pointer.y, k) });
    });
    Runner.run(Runner.create(), engine);
    const meshes = cloths.map((media) => {
      const cv = document.createElement("canvas");
      media.append(cv);
      media.classList.add("is-gl");
      watch(media);
      const g = makeGL(cv, true);
      g.size(w, canvasH);
      const geo = new THREE.PlaneGeometry(1, 1, COLS - 1, ROWS - 1);
      const t = placeholder(media.querySelector(".kk-item__pic").dataset.label.replace("Landscape 2:1", "Square Texture"));
      g.scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide })));
      return { media, g, geo };
    });
    return (f) => {
      rate = chaos();
      if (f % 60 === 0) {
        if (hit(5)) { engine.gravity.x = range(10); engine.gravity.y = range(10); }
        else { engine.gravity.x = 0; engine.gravity.y = 0; }
      }
      if (f % 2) return;
      meshes.forEach(({ media, g, geo }) => {
        if (!seen.has(media)) return;
        const pos = geo.attributes.position;
        b.forEach((body, i) => pos.setXYZ(i, body.position.x - w / 2, -body.position.y + canvasH / 2, 0));
        pos.needsUpdate = true;
        g.r.setClearColor(0x000000, 0);
        g.r.render(g.scene, g.cam);
      });
    };
  })();

  // ---- List title: triangle pieces — split 151 points by Name, punch a hole only for each piece’s inner triangle and cover the rest with the background color ----
  const delaunay = (pts) => {
    const big = [[-1e5, -1e5], [1e5, -1e5], [0, 1e5]];
    const all = pts.concat(big);
    let tris = [[pts.length, pts.length + 1, pts.length + 2]];
    const circ = (t) => {
      const [a, b, c] = t.map((i) => all[i]);
      const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
      const ux = ((a[0] ** 2 + a[1] ** 2) * (b[1] - c[1]) + (b[0] ** 2 + b[1] ** 2) * (c[1] - a[1]) + (c[0] ** 2 + c[1] ** 2) * (a[1] - b[1])) / d;
      const uy = ((a[0] ** 2 + a[1] ** 2) * (c[0] - b[0]) + (b[0] ** 2 + b[1] ** 2) * (a[0] - c[0]) + (c[0] ** 2 + c[1] ** 2) * (b[0] - a[0])) / d;
      return [ux, uy, (a[0] - ux) ** 2 + (a[1] - uy) ** 2];
    };
    pts.forEach((p, pi) => {
      const bad = tris.filter((t) => { const [x, y, r] = circ(t); return (p[0] - x) ** 2 + (p[1] - y) ** 2 < r; });
      const edges = [];
      bad.forEach((t) => [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]].forEach((e) => {
        const dup = edges.findIndex((f) => (f[0] === e[1] && f[1] === e[0]) || (f[0] === e[0] && f[1] === e[1]));
        dup >= 0 ? edges.splice(dup, 1) : edges.push(e);
      }));
      tris = tris.filter((t) => !bad.includes(t)).concat(edges.map((e) => [e[0], e[1], pi]));
    });
    return tris.filter((t) => t.every((i) => i < pts.length)).map((t) => t.map((i) => pts[i]));
  };
  const shatterUpdaters = shatters.map((ttl) => {
    ttl.classList.add("is-shatter");
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    ttl.append(cv);
    watch(ttl);
    const x = cv.getContext("2d");
    let shards = [], w = 0, h = 0, c = 0;
    const build = () => {
      w = W(); h = ttl.offsetHeight;
      cv.width = w; cv.height = h;
      const pts = [[0, 0]];
      for (let i = 0; i < 150; i++) pts.push([rnd(-w / 2, w / 2), rnd(-h / 2, h / 2)]);
      shards = delaunay(pts).map((t) => {
        const la = Math.hypot(t[1][0] - t[2][0], t[1][1] - t[2][1]), lb = Math.hypot(t[2][0] - t[0][0], t[2][1] - t[0][1]), lc = Math.hypot(t[0][0] - t[1][0], t[0][1] - t[1][1]), p = la + lb + lc;
        const cx = (la * t[0][0] + lb * t[1][0] + lc * t[2][0]) / p, cy = (la * t[0][1] + lb * t[1][1] + lc * t[2][1]) / p;
        const k = rnd(0.01, 0.3) / 2;
        return { cx, inner: t.map(([px, py]) => [px + (cx - px) * k, py + (cy - py) * k]) };
      });
    };
    build();
    new ResizeObserver(build).observe(ttl);
    return () => {
      c++;
      const r = chaos();
      cv.style.opacity = r > 0 ? 1 : 0;
      if (!seen.has(ttl) || c % 10 || r <= 0) return;
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.globalCompositeOperation = "source-over";
      x.fillStyle = css("--kf-bg");
      x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = "destination-out";
      const s = 1.1 * mix(10, 1, r);
      shards.forEach(({ cx, inner }) => {
        x.setTransform(s, 0, 0, s, w / 2 + 0.5 * cx + range(10) * r, h / 2 + range(10) * r);
        x.beginPath();
        x.moveTo(inner[0][0], inner[0][1]); x.lineTo(inner[1][0], inner[1][1]); x.lineTo(inner[2][0], inner[2][1]);
        x.closePath();
        x.fill();
      });
    };
  });

  // ---- List photo: edge noise — a clip-path with 50 points per side jittered by 3% (10% chance of 50%) ----
  const defs = document.querySelector(".kk-defs defs");
  const edgeUpdaters = edges.map((media, idx) => {
    const id = `kk-edge-${idx}`;
    const cp = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    cp.id = id;
    cp.setAttribute("clipPathUnits", "objectBoundingBox");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cp.append(path);
    defs.append(cp);
    media.style.clipPath = `url(#${id})`;
    watch(media);
    let c = 0, type = any([0, 1]);
    return () => {
      c++;
      if (hit(100)) type = any([0, 1]);
      if (!seen.has(media) || c % 3) return;
      const r = chaos();
      const e = type ? mix(1, cl(Math.sin(c * 0.1), 0, 1, -1, 1), r) : 1;
      const k = type ? mix(1, cl(Math.cos(c * 0.1), 0, 1, -1, 1), r) : 1;
      const lo = cl(e, 0.5, 0, 0, 1), hi = cl(e, 0.5, 1, 0, 1), count = Math.round(cl(k, 5, 50, 0, 1));
      const corners = [[lo, lo], [hi, lo], [hi, hi], [lo, hi]];
      let d = "";
      for (let side = 0; side < 4; side++) {
        const [ax, ay] = corners[side], [bx, by] = corners[(side + 1) % 4];
        for (let l = 0; l < count; l++) {
          const amp = mix(0, hit(10) ? 0.5 : 0.03, r), f = cl(l, 0, 1, 0, count - 2);
          const px = mix(ax, bx, f) + (side % 2 ? range(amp) : 0), py = mix(ay, by, f) + (side % 2 ? 0 : range(amp));
          d += `${d ? "L" : "M"} ${px.toFixed(4)} ${py.toFixed(4)} `;
        }
      }
      path.setAttribute("d", d + "Z");
    };
  });

  // ---- List rows: cover panels (1~5, phone 1~3) with primary-color borders rotating or breathing vertically, and text·photos in rows tilt ±5° ----
  const itemUpdaters = [...document.querySelectorAll(".kk-item")].map((item) => {
    watch(item);
    const cover = item.querySelector(".kk-item__cover");
    const tgs = [...item.querySelectorAll(".kk-tg")].map((el) => ({ el, n: Math.random() }));
    const blocks = Array.from({ length: val((Math.random() * 3 + 1) | 0, (Math.random() * 5 + 1) | 0) }, () => {
      const i = document.createElement("i");
      cover.append(i);
      gsap.set(i, { backgroundColor: hit(2) ? "transparent" : hue(Math.random()), mixBlendMode: any(["difference", "color-burn", "hard-light"]) }); // Not skin: random color wheel
      return i;
    });
    let c = (Math.random() * 1000) | 0, type = any([0, 1]), top = docTop(item);
    return () => {
      c++;
      if (hit(100)) type = any([0, 1]);
      if (c % 60 === 0) top = docTop(item);
      if (!seen.has(item) || c % 2) return;
      const r = chaos(), sr = scrollRate(top), w = W(), base = val(w, H()), o = w / blocks.length;
      tgs.forEach(({ el, n }) => gsap.set(el, { rotation: mix(0, mix(-5, 5, n), r) }));
      blocks.forEach((s, a) => {
        if (type === 0) {
          const l = base * 1.2, cc = rad(c * val(0.1, 1) + a * 5), styles = val(["solid", "double"], ["dotted", "dashed", "solid", "double"]);
          gsap.set(s, {
            border: `${cl(Math.cos(cc * 1.4), 0, val(300, 200), -1, 1)}px ${styles[a % styles.length]} ${hue(c * 0.01 + a * 0.2)}`, // Not skin: random color wheel
            opacity: r, width: o, height: l, x: o * a, y: mix(0, cl(sr, -l, l, 0, 1), r), rotation: Math.sin(cc) * mix(0, 360, r), scale: 1,
            transformOrigin: `${cl(Math.sin(cc * 0.75), 40, 60, -1, 1)}% ${cl(Math.cos(cc * -2.5), 40, 60, -1, 1)}%`,
          });
        } else {
          const l = base * 1.5, hh = rad(c * val(1, 5) + a * 20);
          gsap.set(s, { border: "0px none", opacity: r, width: o, height: l, x: o * a, y: mix(0, cl(sr, -l, l, 0, 1), r), rotation: 0, scaleX: 1, scaleY: cl(Math.sin(hh), 0, mix(0, 1, r), -1, 1), transformOrigin: "50% 0%" });
        }
      });
    };
  });

  // ---- English subtitle wave band: color-cycling stripes breathe at 0~20% width, and the tilt follows how far the row has passed ----
  const waveUpdaters = [...document.querySelectorAll(".kk-wave")].map((el) => {
    watch(el);
    let c = (Math.random() * 360) | 0, top = docTop(el);
    return () => {
      c++;
      if (c % 60 === 0) top = docTop(el);
      if (!seen.has(el) || c % 2) return;
      const r = chaos(), t = rad(c * 3), e = mix(0, cl(Math.sin(t), 5, 20, -1, 1), r), ang = mix(0, cl(scrollRate(top), -360, 360, 0, 1), r), col = hue(c * 0.01);
      el.style.backgroundImage = r > 0 ? `repeating-linear-gradient(${ang}deg, ${col} 0, ${col} ${e}%, transparent 0, transparent ${e + 20}%)` : "";
    };
  });

  // ---- Manifesto English subtitle: 10 layers of red shadow (3 on phone) spread apart to at most 20px as it rises up the screen ----
  const smearUpdaters = [...document.querySelectorAll(".kk-smear")].map((el) => {
    watch(el);
    let c = (Math.random() * 1000) | 0, top = docTop(el);
    return () => {
      c++;
      if (c % 60 === 1) top = docTop(el);
      if (!seen.has(el) || c % 2 || !el.offsetParent) return;
      const r = chaos(), count = val(3, 10), gap = val(5, cl(scrollRate(top), 0, 20, 0, 1));
      const list = [];
      for (let n = 0; n < count; n++) list.push(`0px ${n * gap * r}px 0px var(--site-smear)`);
      el.style.textShadow = r > 0 ? list.join(", ") : "";
    };
  });

  // ---- Bottom banner: two lines of text jump ±5px·±3°·±10% every 12 frames ----
  const banner = document.querySelector(".kk-foot__banner");
  const bannerParts = banner ? [...banner.children] : [];
  if (banner) watch(banner);
  let bannerC = 0;
  const bannerUpdate = () => {
    if (!banner || ++bannerC % 12 || !seen.has(banner)) return;
    const r = chaos();
    bannerParts.forEach((p) => gsap.set(p, { x: range(5) * r, y: range(5) * r, rotation: range(3) * r, scale: 1 + range(0.1) * r }));
  };

  // ---- Scroll arrow: stack 6 more copies, spread them front and back by the Hero’s scroll amount, as outlines ----
  const arrow = document.querySelector(".kk-scroll");
  const arrows = [arrow.querySelector(".kk-scroll__item")];
  for (let s = 0; s <= 5; s++) { const k = arrows[0].cloneNode(true); arrow.append(k); arrows.push(k); }
  let arrowC = 0;
  const arrowUpdate = () => {
    arrowC++;
    arrow.classList.toggle("is-gone", scrollY > H() * 0.75);
    if (arrowC % 3) return;
    const r = firstRate();
    arrows.forEach((el, i) => {
      const n = rad(arrowC * 5 + i * 10), a = mix(0, cl(Math.sin(n), -100, 100, -1, 1), r);
      el.classList.toggle("is-line", r > 0);
      gsap.set(el, { scale: mix(1, cl(Math.sin(n), 0.5, 3, -1, 1), r), y: a * 0.5, z: a });
    });
  };

  const conceptBg = document.querySelector(".kk-concept__bg");
  kk.loop(() => {
    frame++;
    const n = firstRate();
    body.classList.toggle("is-calm-top", n <= 0.02);
    conceptBg.style.opacity = 1 - chaos();
    noise?.();
    cubeUpdaters.forEach((f) => f());
    cloth?.(frame);
    shatterUpdaters.forEach((f) => f());
    edgeUpdaters.forEach((f) => f());
    itemUpdaters.forEach((f) => f());
    waveUpdaters.forEach((f) => f());
    smearUpdaters.forEach((f) => f());
    bannerUpdate();
    arrowUpdate();
  });
})();
