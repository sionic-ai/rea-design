// Rebuilds the two original three r176 scenes with our own shapes · shaders — first page: two cans spin in front of an orthographic camera (px units) and move out to both sides along the scroll curve,
// About: in a zero-gravity (cannon-es) box, 25 cans burst from one point, bounce off the walls and are pushed away by the mouse ball, while the big wordmark letters below rise inside a panel mask.
// Each scene is drawn separately, and a final single-screen shader applies the transition (a boundary sweeping from the bottom of the screen upward) and the rounded top-corner mask of the sub panel.
(() => {
  if (!window.THREE) return;
  const T = window.THREE;
  const canvas = document.getElementById("lj-gl");
  if (!canvas) return;
  const docEl = document.documentElement;
  const rem = () => parseFloat(getComputedStyle(docEl).fontSize) || 10;
  const mobile = () => innerWidth <= 1024;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const map = (v, a, b, c, d) => c + ((d - c) * (v - a)) / (b - a);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // CSS variable color to real rgb — colors made with color-mix also resolve when painted on a canvas and read back
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssColor = (name) => {
    const tmp = document.createElement("i");
    tmp.style.color = `var(${name})`;
    document.body.append(tmp);
    const c = getComputedStyle(tmp).color;
    tmp.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new T.Vector3(d[0] / 255, d[1] / 255, d[2] / 255);
  };

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", stencil: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = true;

  // Original camera: orthographic camera using screen px as is (z 80, 0~2000)
  const camera = new T.OrthographicCamera(-innerWidth / 2, innerWidth / 2, innerHeight / 2, -innerHeight / 2, 0, 2000);
  camera.position.set(0, 0, 80);

  // ── Can — a cylinder with the same silhouette ratio (diameter:height ≈ 1:1.34) in place of the original model, with paper band, big circle pattern and metal rim done in shaders ──
  const CAN_R = 1.75, CAN_H = 4.7;
  const canGeo = new T.CylinderGeometry(CAN_R, CAN_R, CAN_H, 56, 1);
  canGeo.computeBoundingSphere();
  const canRadius = canGeo.boundingSphere.radius + canGeo.boundingSphere.center.length();

  const canVert = /* glsl */ `
    varying vec2 vUv; varying vec3 vObjN; varying vec3 vN;
    void main() {
      vUv = uv; vObjN = normal;
      vec4 p = vec4(position, 1.0); vec3 n = normal;
      #ifdef USE_INSTANCING
        p = instanceMatrix * p; n = mat3(instanceMatrix) * n;
      #endif
      vN = normalize(normalMatrix * n);
      gl_Position = projectionMatrix * modelViewMatrix * p;
    }`;
  const canFrag = /* glsl */ `
    uniform vec3 uPaper; uniform vec3 uLabel; uniform vec3 uInk; uniform vec3 uMetal;
    uniform float uLight; uniform float uSpec;
    varying vec2 vUv; varying vec3 vObjN; varying vec3 vN;
    void main() {
      float cap = step(0.5, abs(vObjN.y));
      float y = vUv.y;
      float rim = 1.0 - step(0.035, y) * step(y, 0.965);
      float u = fract(vUv.x + 0.25) - 0.5;
      // Ratio of circumference 2πr to height — keeps the circle pattern from distorting
      vec2 q = vec2(u * ${((2 * Math.PI * CAN_R) / CAN_H).toFixed(3)}, y - 0.5);
      float disc = 1.0 - smoothstep(0.31, 0.318, length(q));
      float band = step(0.035, y) * step(y, 0.1) + step(0.9, y) * step(y, 0.965);
      float back = step(0.24, abs(u));
      float lines = back * step(0.28, y) * step(y, 0.72) * step(0.55, fract(y * 38.0)) * step(0.3, fract(vUv.x * 26.0));
      vec3 base = mix(uPaper, uLabel, max(disc, band));
      base = mix(base, mix(uPaper, uInk, 0.55), lines * 0.6);
      float metal = max(rim, cap);
      base = mix(base, uMetal, metal);
      vec3 L = normalize(vec3(0.25, 0.35, 1.0));
      float diff = max(dot(vN, L), 0.0) * 0.6 + 0.48;
      float spec = pow(max(dot(reflect(-L, vN), vec3(0.0, 0.0, 1.0)), 0.0), mix(10.0, 48.0, metal));
      float fres = pow(1.0 - max(vN.z, 0.0), 3.0);
      vec3 col = base * diff * uLight + spec * mix(0.18, 0.75, metal) * uSpec + fres * 0.12;
      gl_FragColor = vec4(col, 1.0);
    }`;
  const canMaterial = (label) => new T.ShaderMaterial({
    uniforms: { uPaper: { value: new T.Vector3(1, 1, 1) }, uLabel: { value: new T.Vector3() }, uInk: { value: new T.Vector3() }, uMetal: { value: new T.Vector3() }, uLight: { value: 1 }, uSpec: { value: 1 } },
    vertexShader: canVert,
    fragmentShader: canFrag,
    userData: { label },
  });
  const paint = (m) => {
    m.uniforms.uPaper.value.copy(cssColor("--site-can-paper"));
    m.uniforms.uInk.value.copy(cssColor("--kf-ink"));
    m.uniforms.uMetal.value.copy(cssColor("--site-can-metal"));
    m.uniforms.uLabel.value.copy(cssColor(m.userData.label));
  };

  const makeRT = (stencil) => new T.WebGLRenderTarget(1, 1, { depthBuffer: true, stencilBuffer: stencil });

  // ── First page scene ──
  const home = (() => {
    const scene = new T.Scene();
    const rt = makeRT(false);
    const matGreen = canMaterial("--site-can-green"), matRed = canMaterial("--site-can-red");
    const one = new T.Mesh(canGeo, matGreen), two = new T.Mesh(canGeo, matRed);
    scene.add(one, two);
    // A path redrawn in five points after measuring the original path (a 3D tool curve) — green goes from bottom left to top right, red from bottom right to top left, crossing
    const curve = (pts) => new T.CatmullRomCurve3(pts.map(([x, y]) => new T.Vector3(x, y, -3)));
    const green = curve([[-0.921, -0.781], [-0.145, 0.432], [0.686, 0.74], [1.83, 0.898], [3.552, 0.662]]);
    const red = curve([[0.972, -0.9], [0.391, -0.379], [-0.358, -0.047], [-1.737, 0.189], [-3.452, 0.33]]);
    const SCALAR = 350;
    const st = { scale: 80, initX: 0, transitioning: true, ready: false };
    const resize = () => {
      st.scale = innerWidth > 1600 ? 90 : 80;
      st.initX = innerWidth / 2 + canRadius * st.scale + 16;
      one.scale.setScalar(st.scale); two.scale.setScalar(st.scale);
    };
    const reset = () => {
      const g0 = green.getPointAt(0).multiplyScalar(SCALAR), r0 = red.getPointAt(0).multiplyScalar(SCALAR);
      one.position.set(st.initX, g0.y, -1300); one.rotation.set(0, Math.PI, 0);
      two.position.set(-st.initX, r0.y, -1000); two.rotation.set(0, 0, 0);
    };
    resize(); reset();
    let tl = null;
    const animateIn = () => {
      if (mobile()) return;
      st.transitioning = true;
      tl?.kill();
      const g0 = green.getPointAt(0).multiplyScalar(SCALAR), r0 = red.getPointAt(0).multiplyScalar(SCALAR);
      tl = gsap.timeline({
        defaults: { duration: 1.4, ease: "power4.out" },
        onStart: () => { document.body.style.pointerEvents = "none"; reset(); },
        onComplete: () => { st.transitioning = false; document.body.style.pointerEvents = ""; },
      });
      if (reduce) { tl.progress(1); return; }
      tl.fromTo(one.position, { x: () => st.initX }, { x: g0.x })
        .fromTo(one.rotation, { z: 1 }, { z: -0.1 }, "<+0.1")
        .fromTo(two.position, { x: () => -st.initX }, { x: r0.x }, "<")
        .fromTo(two.rotation, { z: 1 }, { z: 0.2 }, "<+0.1");
    };
    const update = () => {
      const lenis = window.LJ && window.LJ.lenis;
      const vel = lenis ? lenis.velocity || 0 : 0;
      one.visible = two.visible = !mobile();
      if (reduce) return;
      one.rotation.y += 0.008 + vel / 80;
      two.rotation.y -= 0.008 + vel / 80;
      if (st.transitioning || mobile()) return;
      const t = clamp(map(lenis ? lenis.progress || 0 : 0, 0, 0.5, 0, 1), 0, 1);
      const n = green.getPointAt(t).multiplyScalar(SCALAR), i = red.getPointAt(t).multiplyScalar(SCALAR);
      const o = T.MathUtils.smoothstep(t, 0, 1);
      const a = green.getPointAt(1).x * SCALAR, l = red.getPointAt(1).x * SCALAR;
      n.x += Math.max(0, st.initX - a) * o;
      i.x -= Math.max(0, st.initX + l) * o;
      one.position.set(n.x, n.y, -1300);
      two.position.set(i.x, i.y, -1000);
    };
    return { scene, rt, resize, update, animateIn, reset, st, mats: [matGreen, matRed], name: "home" };
  })();

  // ── About Scene ──
  const about = (() => {
    const scene = new T.Scene();
    const rt = makeRT(true);
    const group = new T.Group();
    scene.add(group);
    const S = 25, COUNT = 25, Z0 = -80;
    const mat = canMaterial("--site-can-red");
    mat.uniforms.uLight.value = 1.08; mat.uniforms.uSpec.value = 1.4;
    Object.assign(mat, { stencilWrite: true, stencilRef: 1, stencilFunc: T.EqualStencilFunc });
    const cans = new T.InstancedMesh(canGeo, mat, COUNT);
    cans.instanceMatrix.setUsage(T.DynamicDrawUsage);
    cans.frustumCulled = false;
    const hide = new T.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < COUNT; i++) cans.setMatrixAt(i, hide);
    group.add(cans);

    // Panel mask — paint only the About hero area with stencil 1 so the can and letters show only inside it
    const maskMat = new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: T.AlwaysStencilFunc, stencilZPass: T.ReplaceStencilOp });
    const mask = new T.Mesh(new T.PlaneGeometry(1, 1), maskMat);
    mask.renderOrder = -1;
    group.add(mask);

    // Big wordmark — the original is six MSDF glyph boards. Here, boards with letters drawn on a canvas sit at the same spot and size
    const LETTERS = [
      { c: "B", s: 29.6, x: -2.65, y: 12.5 - 2.4 }, { c: "R", s: 29.6, x: 23.1, y: 12.5 - 2.4 }, { c: "A", s: 36.5, x: 38.6, y: 12.5 - 9 },
      { c: "N", s: 30.2, x: 65, y: 12.5 - 2.7 }, { c: "D", s: 29.6, x: 91.2, y: 12.5 - 2.4 }, { c: "S", s: 29.6, x: 114.1, y: 12.5 - 2.4 },
    ];
    const letterFrag = /* glsl */ `
      uniform sampler2D uTex; uniform vec3 uInk; varying vec2 vUv;
      void main() { float a = texture2D(uTex, vUv).a; if (a < 0.01) discard; gl_FragColor = vec4(uInk * a, a); }`;
    const letterVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const logo = new T.Group();
    group.add(logo);
    const letters = LETTERS.map((L) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 512;
      const tex = new T.CanvasTexture(cv);
      const m = new T.ShaderMaterial({
        uniforms: { uTex: { value: tex }, uInk: { value: new T.Vector3() } },
        vertexShader: letterVert, fragmentShader: letterFrag,
        transparent: true, depthTest: false, premultipliedAlpha: true,
        stencilWrite: true, stencilRef: 1, stencilFunc: T.EqualStencilFunc,
      });
      const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), m);
      logo.add(mesh);
      return { ...L, cv, tex, mesh };
    });
    const drawLetters = () => {
      const fam = getComputedStyle(docEl).getPropertyValue("--kf-font-logo").trim() || getComputedStyle(docEl).getPropertyValue("--kf-font-display").trim();
      for (const L of letters) {
        const ctx = L.cv.getContext("2d");
        ctx.clearRect(0, 0, 512, 512);
        const px = 470;
        ctx.font = `400 ${px}px ${fam}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        // In the original letter plate, the wide Didone capitals nearly fill the plate width and overlap neighbors — letters are drawn stretched to 94% of the plate
        const gw = ctx.measureText(L.c).width || 1;
        ctx.save();
        ctx.translate(256, 0);
        ctx.scale((512 * 0.94) / gw, 1);
        ctx.fillText(L.c, 0, 440);
        ctx.restore();
        L.tex.needsUpdate = true;
        L.mesh.material.uniforms.uInk.value.copy(cssColor("--kf-ink"));
      }
    };
    const placeLetters = () => {
      const r = rem(), w = innerWidth, h = innerHeight;
      for (const L of letters) {
        const s = L.s * r;
        L.mesh.scale.set(s, s, 1);
        L.mesh.position.x = -w / 2 + s / 2 + L.x * r;
        L.mesh.position.y = L.baseY = -h / 2 + s / 2 + L.y * r;
      }
      if (mobile()) { logo.scale.set(0.25, 0.25, 1); logo.position.set(r * -13.2, r * -2.4, 0); }
      else { logo.scale.set(1, 1, 1); logo.position.set(0, 0, 0); }
      st.logoY = logo.position.y;
    };

    // Phone: a single can spins with scroll instead of physics
    const single = new T.Mesh(canGeo, mat);
    group.add(single);

    const st = { ready: false, scrollY: 0, logoY: 0, transitioning: false, scrollEl: null };
    let world = null, bodies = [], walls = {}, ball = null;
    const tmp = new T.Matrix4(), q = new T.Quaternion(), pos = new T.Vector3(), sc = new T.Vector3(S, S, S);

    const C = window.CANNON;
    const initPhysics = () => {
      if (!C) return;
      world = new C.World();
      world.gravity.set(0, 0, 0);
      world.defaultContactMaterial.contactEquationStiffness = 1e6;
      world.defaultContactMaterial.contactEquationRelaxation = 10;
      const stone = new C.Material("stone");
      world.addContactMaterial(new C.ContactMaterial(stone, stone, { friction: 0, restitution: 1 }));
      const r = rem(), w = innerWidth, h = innerHeight;
      const W = {
        top: [[Math.PI / 2, 0, 0], [0, h / 2 - r * 9.2, 0]], bottom: [[-Math.PI / 2, 0, 0], [0, -h / 2 + r * 12.5, 0]],
        left: [[0, Math.PI / 2, 0], [-w / 2, 0, 0]], right: [[0, -Math.PI / 2, 0], [w / 2, 0, 0]],
        back: [[0, 0, 0], [0, 0, -90]], front: [[0, Math.PI, 0], [0, 0, 0]],
      };
      for (const [id, [e, p]] of Object.entries(W)) {
        const b = new C.Body({ mass: 0, material: stone });
        b.addShape(new C.Plane());
        b.quaternion.setFromEuler(e[0], e[1], e[2]);
        b.position.set(p[0], p[1], p[2]);
        world.addBody(b);
        walls[id] = b;
      }
      ball = new C.Body({ mass: 0 });
      ball.addShape(new C.Sphere(20));
      ball.position.set(-w / 2, h / 2, -30);
      world.addBody(ball);
      bodies = [];
      for (let i = 0; i < COUNT; i++) {
        const b = new C.Body({ mass: 5 });
        b.addShape(new C.Cylinder(S * 1.7, S * 1.7, S * 4.7, 10));
        b.position.set(0, 0, Z0);
        b.linearDamping = 0;
        world.addBody(b);
        bodies.push(b);
      }
    };
    const placeWalls = () => {
      if (!world) return;
      const r = rem(), w = innerWidth, h = innerHeight;
      walls.top.position.set(0, h / 2 - r * 9.2, 0);
      walls.bottom.position.set(0, -h / 2 + r * 12.5, 0);
      walls.left.position.set(-w / 2, 0, 0);
      walls.right.position.set(w / 2, 0, 0);
    };
    const placeMask = () => {
      const heroEl = document.querySelector(".lj-about__hero");
      if (!heroEl) return;
      const e = heroEl.getBoundingClientRect();
      const head = document.querySelector(".lj-header");
      const headH = head ? head.clientHeight : 0;
      let y;
      if (mobile()) y = innerHeight / 2 - e.height / 2 - e.top;
      else { const hh = e.height - rem() * 0.4; y = innerHeight / 2 - hh / 2 - headH; mask.scale.set(innerWidth, hh, 1); mask.position.y = y; return; }
      mask.position.y = y;
      mask.scale.set(innerWidth, e.height, 1);
    };
    const resize = () => { placeLetters(); placeWalls(); placeMask(); };

    let tl = null;
    const animateIn = () => {
      tl?.kill();
      tl = gsap.timeline({ defaults: { ease: "power4.inOut", duration: 1.8 } });
      letters.forEach((L) => {
        const s = L.s * rem();
        tl.fromTo(L.mesh.position, { y: -innerHeight / 2 - s }, { y: L.baseY }, "<+=0.05");
      });
      if (reduce) tl.progress(1);
    };
    const init = () => {
      if (st.ready) return;
      drawLetters();
      document.fonts && document.fonts.ready.then(drawLetters);
      initPhysics();
      st.ready = true;
      resize();
    };
    const pointer = (e) => {
      if (!ball || mobile()) return;
      ball.position.set(e.clientX - innerWidth / 2, -(e.clientY - innerHeight / 2), 0);
    };
    addEventListener("pointermove", pointer, { passive: true });

    let last = 0;
    const update = (now) => {
      if (!st.ready) return;
      st.scrollEl = document.querySelector(".lj-container.is-about");
      if (!st.transitioning) {
        st.scrollY = st.scrollEl ? st.scrollEl.scrollTop : 0;
        group.position.y = st.scrollY;
        logo.position.y = st.logoY - st.scrollY;
      }
      const dt = last ? Math.max(1, now - last) / 1000 : 1 / 60;
      last = now;
      if (mobile()) {
        cans.visible = false; single.visible = true;
        const s = rem() * 7;
        single.scale.setScalar(s);
        single.rotation.z = 0.25;
        single.position.set(0, rem() * -2.5, -70);
        single.rotation.y = clamp(map(st.scrollY, 0, innerHeight / 2, 0, -2), -2, 0);
        return;
      }
      cans.visible = true; single.visible = false;
      if (!world || reduce) return;
      world.step(1 / 60, Math.min(dt, 0.1), 20);
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        pos.set(b.position.x, b.position.y, b.position.z);
        q.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
        tmp.compose(pos, q, sc);
        cans.setMatrixAt(i, tmp);
      }
      cans.instanceMatrix.needsUpdate = true;
    };
    return { scene, rt, group, logo, resize, update, animateIn, init, st, mats: [mat], letters, name: "about" };
  })();

  // ── Screen compositing — below the boundary is the lower scene, above is the upper scene. On sub pages, anything outside the rounded panel under the header is discarded ──
  const blank = makeRT(false);
  const quadScene = new T.Scene();
  const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    uniforms: { uHigh: { value: null }, uLow: { value: null }, uCut: { value: 0 }, uBorder: { value: 0 }, uRadius: { value: 0 }, uTop: { value: 0 }, uSize: { value: new T.Vector2() } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uHigh; uniform sampler2D uLow; uniform float uCut; uniform float uBorder; uniform float uRadius; uniform float uTop; uniform vec2 uSize;
      varying vec2 vUv;
      void main() {
        vec4 hi = texture2D(uHigh, vUv), lo = texture2D(uLow, vUv);
        float y = gl_FragCoord.y / uSize.y;
        vec4 c = mix(hi, lo, step(y, uCut));
        // Panel: from below the head (uTop px from the top), with top two corners of radius uRadius
        vec2 p = gl_FragCoord.xy;
        float top = uSize.y - uTop;
        float inside = step(p.y, top);
        vec2 cl = vec2(uRadius, top - uRadius), cr = vec2(uSize.x - uRadius, top - uRadius);
        if (p.y > top - uRadius) {
          if (p.x < uRadius) inside *= step(distance(p, cl), uRadius);
          if (p.x > uSize.x - uRadius) inside *= step(distance(p, cr), uRadius);
        }
        if (mix(1.0, inside, uBorder) < 1.0) discard;
        gl_FragColor = c;
      }`,
    depthTest: false, depthWrite: false,
  }));
  quadScene.add(quad);

  const scenes = { home, about };
  const state = { current: null, low: null, high: null, cut: 0, border: 0, active: false };

  const resize = () => {
    const w = innerWidth, h = innerHeight, dpr = renderer.getPixelRatio();
    renderer.setSize(w, h, false);
    camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    for (const s of [home, about]) s.rt.setSize(w * dpr, h * dpr);
    blank.setSize(2, 2);
    quad.material.uniforms.uSize.value.set(w * dpr, h * dpr);
    quad.material.uniforms.uRadius.value = rem() * 3 * dpr;
    const head = document.querySelector(".lj-header");
    quad.material.uniforms.uTop.value = (head ? head.getBoundingClientRect().height : rem() * 9.2) * dpr;
    home.resize();
    if (about.st.ready) about.resize();
  };
  const repaint = () => [...home.mats, ...about.mats].forEach(paint);

  const render = (time) => {
    const need = new Set([state.low, state.high].filter(Boolean));
    if (!need.size) { renderer.setRenderTarget(null); renderer.clear(); return; }
    for (const name of need) {
      const s = scenes[name];
      s.update(time * 1000);
      renderer.setRenderTarget(s.rt);
      renderer.clear(true, true, true);
      renderer.render(s.scene, camera);
    }
    renderer.setRenderTarget(null);
    renderer.clear();
    const u = quad.material.uniforms;
    u.uHigh.value = state.high ? scenes[state.high].rt.texture : blank.texture;
    u.uLow.value = state.low ? scenes[state.low].rt.texture : blank.texture;
    u.uCut.value = state.cut;
    u.uBorder.value = state.border;
    renderer.render(quadScene, quadCam);
  };

  const has = (ns) => ns === "home" || ns === "about";
  const LJGL = (window.LJGL = {
    // Scene of the first opened page
    mount(ns) {
      repaint();
      if (ns === "about") { about.init(); about.st.transitioning = false; }
      state.current = has(ns) ? ns : null;
      state.high = state.current; state.low = null; state.cut = 0;
      state.border = ns === "home" ? 0 : 1;
      resize();
    },
    animateIn(ns) { scenes[ns]?.animateIn(); },
    // Transition start — the incoming panel (lower scene) pushes the boundary up from the bottom of the screen. When closing and going back, the leaving panel becomes the lower scene and the boundary moves down.
    begin(from, to, leaving) {
      if (to === "about") { about.init(); about.resize(); }
      if (leaving) { state.high = has(to) ? to : null; state.low = has(from) ? from : null; }
      else { state.high = has(from) ? from : null; state.low = has(to) ? to : null; }
      // As soon as the transition starts, the original returns the can to its off-screen start position through the first-page scene’s onPageLeave.
      if (from === "home" || to === "home") { home.reset(); home.st.transitioning = true; }
      if (from === "about" || to === "about") about.st.transitioning = true;
      state.cut = leaving ? 1 : 0;
      state.from = from; state.to = to; state.leaving = leaving;
    },
    // o: transition progress (0→1, value passed through expo.inOut)
    progress(o) {
      const h = innerHeight;
      state.cut = state.leaving ? clamp(map(o + 0.038, 0, 1, 1.025, 0), 0, 1) : o + 0.0078;
      state.border = o;
      if (state.from === "about" && state.leaving) about.group.position.y = map(o, 0, 1, about.st.scrollY, about.st.scrollY - h);
      if (state.to === "about") about.group.position.y = state.leaving ? 0 : map(o, 0, 1, -h, 0);
    },
    end(to) {
      state.current = has(to) ? to : null;
      state.high = state.current; state.low = null; state.cut = 0;
      state.border = to === "home" ? 0 : 1;
      about.st.transitioning = false;
      if (to === "about") { about.st.scrollY = 0; about.resize(); }
    },
    resize,
    repaint,
  });

  addEventListener("resize", resize);
  gsap.ticker.add((t) => render(t));
})();
