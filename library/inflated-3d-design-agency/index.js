// Home page: loader → inflated 3D pattern (three.js procedural shape) → on scroll it folds into a lens bead · mission words fill up · vertical line,
// Interview title pinned and outline-only, platform row lens, blue circle shrinking to a dot while the title row slides sideways, careers photo parallax.
(() => {
  const { reduced } = GP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";

  // ── Puffy 3D pattern ────────────────────────────────
  const canvas = $(".hx__gl");
  const gl = { meshes: [], heart: null, run: false };
  if (window.THREE && canvas) try {
    const T = THREE;
    // three can’t read rgba, so skin variables go in as rgb
    const col = (name) => new T.Color(GP.color(name).replace(/^rgba\((\d+), (\d+), (\d+).*$/, "rgb($1, $2, $3)"));
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    scene.background = col("--site-pattern-bg");
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 32);
    scene.add(new T.HemisphereLight(col("--site-sky-hi"), col("--site-deep"), 1.5));
    const key = new T.DirectionalLight(new T.Color(1, 1, 1), 1.5);
    key.position.set(-8, 12, 14);
    scene.add(key);
    const pink = new T.PointLight(col("--site-heart-glow"), 45, 7, 1.6);
    pink.position.set(0, 0, 3.5);
    scene.add(pink);

    // Petal count k · puff amp · sharpness p · flatness flat — pushes a sphere through polar coordinates to make balloon-like stars, flowers and clovers
    const SHAPES = {
      ball: [0, 0, 1, 1],
      clover: [4, 0.55, 1.2, 0.62],
      star4: [4, 1.05, 4, 0.55],
      spiky: [8, 0.6, 3, 0.58],
      gear: [10, 0.2, 1.4, 0.6],
      blob: [5, 0.42, 1.1, 0.6],
    };
    const geoCache = {};
    const puff = (name) => {
      if (geoCache[name]) return geoCache[name];
      const [k, amp, p, flat] = SHAPES[name];
      const g = new T.SphereGeometry(1, 72, 54);
      const a = g.attributes.position;
      for (let i = 0; i < a.count; i++) {
        let x = a.getX(i), y = a.getY(i), z = a.getZ(i);
        const th = Math.atan2(y, x);
        const f = k ? 1 + amp * Math.pow(Math.abs(Math.cos((k * th) / 2)), p) : 1;
        a.setXYZ(i, x * f, y * f, z * flat * (1 - 0.18 * (f - 1)));
      }
      g.computeVertexNormals();
      return (geoCache[name] = g);
    };
    const heartShape = new T.Shape();
    heartShape.moveTo(0, -1.2);
    heartShape.bezierCurveTo(-0.6, -0.7, -1.5, -0.1, -1.5, 0.6);
    heartShape.bezierCurveTo(-1.5, 1.3, -0.6, 1.6, 0, 0.9);
    heartShape.bezierCurveTo(0.6, 1.6, 1.5, 1.3, 1.5, 0.6);
    heartShape.bezierCurveTo(1.5, -0.1, 0.6, -0.7, 0, -1.2);
    const hg = new T.ExtrudeGeometry(heartShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.75, bevelSize: 0.55, bevelSegments: 12, curveSegments: 40 });
    hg.center();
    gl.heart = new T.Mesh(hg, new T.MeshStandardMaterial({ color: col("--site-heart-lit"), emissive: col("--site-heart-glow"), emissiveIntensity: 0.55, roughness: 0.45 }));
    gl.heart.scale.setScalar(1.45);
    gl.heart.position.set(0, 0.2, 1.5);
    scene.add(gl.heart);

    // Layout that fills the screen with no gaps using a seeded random (leave the center heart spot empty)
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const names = Object.keys(SHAPES);
    // Painted with a matcap like the original — we draw the matcap image on a canvas: wide light at top left → deeper shade toward the edges (a feeling of darkening in touching gaps)
    // → faint reflection on the bottom edge. Only gray shading is drawn and the material color (Skin variable) multiplies it. The pink glow around the heart is added by distance·Fresnel
    const mc = document.createElement("canvas");
    mc.width = mc.height = 256;
    const g2 = mc.getContext("2d");
    const grey = (v, a = 1) => `rgba(${v}, ${v}, ${v}, ${a})`;
    let grad = g2.createRadialGradient(98, 88, 4, 120, 116, 132);
    [[0, 255], [0.3, 236], [0.62, 182], [0.86, 118], [1, 84]].forEach(([o, v]) => grad.addColorStop(o, grey(v)));
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 256, 256);
    grad = g2.createRadialGradient(128, 236, 10, 128, 236, 120);
    grad.addColorStop(0, grey(255, 0.22));
    grad.addColorStop(1, grey(255, 0));
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 256, 256);
    const matcap = new T.CanvasTexture(mc);
    matcap.colorSpace = T.SRGBColorSpace;
    const glow = { uGlow: { value: col("--site-heart-glow") }, uHeart: { value: new T.Vector3(0, 0.2, 1.5) } };
    const mats = ["--site-pattern-1", "--site-pattern-2", "--site-pattern-3", "--site-pattern-4"].map((c) => {
      const m = new T.MeshMatcapMaterial({ color: col(c).multiplyScalar(1.45), matcap });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, glow);
        sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;").replace("#include <fog_vertex>", "#include <fog_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.)).xyz;");
        sh.fragmentShader = sh.fragmentShader
          .replace("#include <common>", "#include <common>\nuniform vec3 uGlow, uHeart; varying vec3 vWp;")
          .replace("#include <opaque_fragment>", "float fr = pow(1. - abs(dot(normal, viewDir)), 2.);\noutgoingLight += uGlow * smoothstep(9., 2.4, distance(vWp, uHeart)) * (.22 + .85 * fr);\n#include <opaque_fragment>");
      };
      return m;
    });
    for (let gy = -2; gy <= 2; gy++) {
      for (let gx = -4; gx <= 4; gx++) {
        for (let layer = 0; layer < 2; layer++) {
          const x = gx * 4.7 + (rnd() - 0.5) * 2.4;
          const y = gy * 4.4 + (rnd() - 0.5) * 2.2;
          const z = layer ? -4 - rnd() * 3 : -0.5 + rnd() * 2;
          if (!layer && Math.hypot(x, y) < 3.6) continue;
          if (layer && rnd() < 0.35) continue;
          const name = Math.hypot(x, y) < 6 && !layer ? names[(gx + gy + 6) % names.length] : names[Math.floor(rnd() * names.length)];
          const m = new T.Mesh(puff(name), mats[Math.floor(rnd() * mats.length)]);
          const s = (name === "ball" ? 2.3 : 1.9) + rnd() * 1.0;
          m.position.set(x, y, z);
          m.rotation.set((rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6, rnd() * Math.PI);
          m.userData = { s, ph: rnd() * Math.PI * 2, sp: 0.25 + rnd() * 0.35, rz: (rnd() - 0.5) * 0.12, y };
          m.scale.setScalar(s);
          scene.add(m);
          gl.meshes.push(m);
        }
      }
    }

    // Lens bead: draws the pattern on an offscreen plate first, then moves it to the screen with our shader, which adds refraction (ior 1.45) from the sphere normal, edge light and color split.
    // As the fold progress (k 0→1) goes, the radius shrinks from the screen diagonal to marble size, the pattern shrinks 1→.34, and refraction fills in.
    const rt = new T.WebGLRenderTarget(1, 1, { samples: 4, type: T.HalfFloatType });
    const lensMat = new T.ShaderMaterial({
      uniforms: { uTex: { value: rt.texture }, uRes: { value: new T.Vector2(1, 1) }, uR: { value: 1e5 }, uZoom: { value: 1 }, uK: { value: 0 }, uRim: { value: col("--site-sky-hi") }, uGlow: { value: col("--site-bright") } },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: `
        uniform sampler2D uTex; uniform vec2 uRes; uniform float uR, uZoom, uK; uniform vec3 uRim, uGlow; varying vec2 vUv;
        void main() {
          vec2 c = uRes * .5, o = vUv * uRes - c;
          float d = length(o) / uR, a = 1. - smoothstep(1. - 1.5 / uR, 1., d);
          if (a <= 0.) { gl_FragColor = vec4(0.); return; }
          float dd = min(d, .999), z = sqrt(1. - dd * dd);
          vec3 n = normalize(vec3(o / uR, z));
          vec3 r = refract(vec3(0., 0., -1.), n, 1. / 1.45);
          vec2 q = (o + r.xy * uR * .6 * uK) / uZoom, split = r.xy * uR * .025 * uK;
          vec3 col = vec3(texture2D(uTex, (c + q + split) / uRes).r, texture2D(uTex, (c + q) / uRes).g, texture2D(uTex, (c + q - split) / uRes).b);
          float fres = pow(1. - z, 2.6) * uK;
          col = mix(col, uRim, fres * .75);
          col += uGlow * smoothstep(.82, 1., d) * .35 * uK;
          col += uRim * pow(max(dot(n, normalize(vec3(-.45, .6, .66))), 0.), 60.) * .9 * uK;
          gl_FragColor = vec4(linearToOutputTexel(vec4(col, 1.)).rgb * a, a);
        }`,
      depthTest: false,
      depthWrite: false,
      blending: T.NoBlending,
    });
    const post = new T.Scene();
    post.add(new T.Mesh(new T.PlaneGeometry(2, 2), lensMat));
    const postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const size = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      const pr = renderer.getPixelRatio();
      rt.setSize(Math.round(w * pr), Math.round(h * pr));
      lensMat.uniforms.uRes.value.set(Math.round(w * pr), Math.round(h * pr));
      gl.pr = pr;
      camera.aspect = w / h;
      // On narrow screens like phones, widen the field of view to keep the same pattern density
      camera.fov = w / h < 1 ? 58 : 35;
      camera.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size);
    // Cursor reaction — two kinds, like the original HeartBloom.
    // 1) Pushes the pattern around the ray from camera to cursor away and springs it back. Original values (original physics units): radius 1.76 · strength 4.8 · (1-d/r)^1.5 ·
    //    the last 180ms cursor trail of 4 points also weakly (1-i/5) · spring 8.83 · velocity damping e^-2.8t · when overlapping, pushes apart by 18 (margin .39).
    //    Original 1 unit is about 112px at mid depth of 1440 width, this copy’s 1 unit is about 45px, so only length values are ×2.47 (screen radius about 196px·max push about 61px come out the same)
    // 2) Camera parallax: at distance 5.35 the original steps aside by (.85, .71) to the side opposite the cursor and follows at 2.2/s — moving it at the same angle to our copy’s distance 32
    //    Because of the bright edges of the copy pattern, the swipe response cell came out at twice the original (43%), so matched against a recording we use half that angle
    const L = 2.47;
    const PUSH = { r: 1.76 * L, s: 4.8 * L, fall: 1.5, wake: 4, spring: 8.83, damp: 2.8, rep: 18, slop: 0.39 * L };
    const PAR = { x: (0.85 / 5.35) * 32 * 0.5, y: (0.71 / 5.35) * 32 * 0.5, follow: 2.2 };
    const ptr = { x: 0, y: 0, wx: 0, wy: 0, on: false, buttons: 0 };
    addEventListener(
      "pointermove",
      (e) => {
        const r = canvas.getBoundingClientRect();
        ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        ptr.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        ptr.wx = (e.clientX / innerWidth) * 2 - 1;
        ptr.wy = (e.clientY / innerHeight) * 2 - 1;
        ptr.buttons = e.buttons;
        ptr.on = true;
      },
      { passive: true }
    );
    const bodies = gl.meshes.map((m) => ({ m, rest: m.position.clone(), v: new T.Vector3(), r: m.userData.s * 1.1 }));
    bodies.push({ m: gl.heart, rest: gl.heart.position.clone(), v: new T.Vector3(), r: 1.45 * 1.6, fixed: true });
    // A pair already overlapping at rest is treated as touching only up to that distance — they don’t push each other while still
    const pairs = [];
    bodies.forEach((a, i) =>
      bodies.slice(i + 1).forEach((b) => {
        const d = a.rest.distanceTo(b.rest);
        if (d < a.r + b.r + 4) pairs.push([a, b, Math.min(a.r + b.r, d)]);
      })
    );
    const trail = [], rays = [], tmp = new T.Vector3(), par = { x: 0, y: 0 };
    const aim = () => {
      const now = performance.now(), tail = trail[trail.length - 1];
      if (tail && tail.x === ptr.x && tail.y === ptr.y) tail.t = now;
      else trail.push({ x: ptr.x, y: ptr.y, t: now });
      while (trail.length && now - trail[0].t > 180) trail.shift();
      while (trail.length > PUSH.wake + 1) trail.shift();
      rays.length = 0;
      const n = trail.length - 1;
      trail.forEach((q, i) => {
        const d = new T.Vector3(q.x, -q.y, 0.5).unproject(camera).sub(camera.position).normalize();
        rays.push({ o: camera.position.clone(), d, k: 1 - (n - i) / (n + 1) });
      });
    };
    const sim = (dt, t) => {
      for (const b of bodies) {
        if (b.fixed) continue;
        const u = b.m.userData, p = b.m.position;
        b.v.x += (b.rest.x - p.x) * PUSH.spring * dt;
        b.v.y += (u.y + Math.sin(t * u.sp + u.ph) * 0.18 - p.y) * PUSH.spring * dt;
        b.v.z += (b.rest.z - p.z) * PUSH.spring * dt;
      }
      for (const [a, b, c] of pairs) {
        tmp.subVectors(b.m.position, a.m.position);
        const d = tmp.length(), e = c - d - PUSH.slop;
        if (e <= 0 || d < 1e-6) continue;
        tmp.multiplyScalar((e * PUSH.rep * dt) / d);
        a.fixed || a.v.sub(tmp);
        b.fixed || b.v.add(tmp);
      }
      for (const b of bodies) {
        if (b.fixed || !rays.length) continue;
        const p = b.m.position;
        for (const q of rays) {
          tmp.subVectors(p, q.o);
          tmp.addScaledVector(q.d, -Math.max(0, tmp.dot(q.d)));
          const d = tmp.length();
          if (d >= PUSH.r || d < 1e-4) continue;
          b.v.addScaledVector(tmp, ((PUSH.s * q.k * (1 - d / PUSH.r) ** PUSH.fall) / d) * dt);
        }
      }
      const k = Math.exp(-PUSH.damp * dt);
      for (const b of bodies) if (!b.fixed) b.m.position.addScaledVector(b.v.multiplyScalar(k), dt);
    };
    const t0 = performance.now();
    let last = t0;
    gl.render = () => {
      const now = performance.now(), t = (now - t0) / 1000, gap = (now - last) / 1000;
      last = now;
      const live = gl.run && !reduced && !GP.still && gap <= 0.2;
      gl.meshes.forEach((m) => {
        const u = m.userData;
        if (!live) m.position.y = u.y + Math.sin(t * u.sp + u.ph) * 0.18;
        m.rotation.z += u.rz * 0.016;
        m.scale.setScalar(u.s * (gl.intro ?? 1) * (1 + Math.sin(t * u.sp * 1.3 + u.ph) * 0.025));
      });
      gl.heart.scale.setScalar(1.45 * (gl.intro ?? 1) * (1 + Math.sin(t * 2.2) * 0.035));
      gl.heart.rotation.y = Math.sin(t * 0.6) * 0.25;
      if (live) {
        const dt = Math.min(gap, 1 / 30), f = 1 - Math.exp(-PAR.follow * dt);
        par.x += ((ptr.on ? -ptr.wx * PAR.x : 0) - par.x) * f;
        par.y += ((ptr.on ? -ptr.wy * PAR.y : 0) - par.y) * f;
      }
      camera.position.set(par.x, par.y, 32);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      if (live) {
        // While pressed and dragging (touch included), it doesn’t push like the original
        if (ptr.on && !(ptr.buttons & 1)) aim();
        else rays.length = trail.length = 0;
        const dt = Math.min(gap, 1 / 30), n = dt > 1 / 45 ? 2 : 1;
        for (let i = 0; i < n; i++) sim(dt / n, t);
      }
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(post, postCam);
    };
    gl.lens = ({ r, zoom, k }) => {
      const u = lensMat.uniforms;
      u.uR.value = r * gl.pr;
      u.uZoom.value = zoom;
      u.uK.value = k;
      if (!gl.run) gl.render();
    };
    const loop = () => {
      if (!gl.run) return;
      gl.render();
      requestAnimationFrame(loop);
    };
    gl.start = () => {
      if (gl.run || reduced || GP.still) return;
      gl.run = true;
      requestAnimationFrame(loop);
    };
    gl.stop = () => (gl.run = false);
    addEventListener("gp:motion", (e) => (e.detail ? gl.stop() : gl.inView && gl.start()));
    ScrollTrigger.create({ trigger: ".hx", start: "top bottom", end: "bottom top", onToggle: (st) => ((gl.inView = st.isActive), st.isActive ? gl.start() : gl.stop()) });
    gl.render();
  } catch (e) {
    // On machines that can’t open WebGL (some headless, disabled GPU) only a blue surface is left instead of the pattern, and the loader and scroll go on as usual
    gl.start = gl.stop = gl.lens = null;
    canvas.closest(".hx__lens")?.classList.add("is-flat");
  }

  // ── Loader line drawing ──────────────────────────────
  const wire = $(".ld__wire");
  const heartD = (s) => `M0 ${60 * s}C${-62 * s} ${18 * s} ${-96 * s} ${-14 * s} ${-90 * s} ${-52 * s}C${-84 * s} ${-90 * s} ${-28 * s} ${-100 * s} 0 ${-58 * s}C${28 * s} ${-100 * s} ${84 * s} ${-90 * s} ${90 * s} ${-52 * s}C${96 * s} ${-14 * s} ${62 * s} ${18 * s} 0 ${60 * s}Z`;
  if (wire) {
    const ring = document.createElementNS(NS, "g");
    ring.setAttribute("class", "ld__ring");
    for (let i = 0; i < 12; i++) {
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("rx", 42 + i * 1.5);
      e.setAttribute("ry", 120);
      e.setAttribute("opacity", (0.15 + (i % 4) * 0.12).toFixed(2));
      ring.append(e);
    }
    const hearts = document.createElementNS(NS, "g");
    hearts.setAttribute("class", "ld__hearts");
    for (let i = 0; i < 14; i++) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", heartD(0.7 + (i % 7) * 0.05));
      p.setAttribute("transform", `rotate(${(i - 7) * 4}) translate(${(i % 3) - 1} ${(i % 4) - 1.5})`);
      p.setAttribute("opacity", (0.2 + (i % 5) * 0.12).toFixed(2));
      hearts.append(p);
    }
    wire.append(ring, hearts);
    $(".ld").insertAdjacentHTML("beforeend", '<i class="ld__glow"></i>');
    $(".ld__logo").innerHTML = GP.logo("#");
  }

  // ── Contour drawing (interview background) · heart contour (company) ───────────
  const contour = $(".ci__contour");
  if (contour) {
    contour.setAttribute("viewBox", "0 0 1440 2630");
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    [[260, 520], [1180, 1250], [420, 2050], [1300, 2400]].forEach(([cx, cy]) => {
      const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
      for (let r = 40; r < 900; r += 34) {
        let d = "";
        for (let a = 0; a <= 64; a++) {
          const t = (a / 64) * Math.PI * 2;
          const rr = r * (1 + 0.12 * Math.sin(3 * t + ph[0] + r / 300) + 0.07 * Math.sin(5 * t + ph[1]) + 0.05 * Math.cos(2 * t + ph[2] + r / 200));
          d += `${a ? "L" : "M"}${(cx + Math.cos(t) * rr).toFixed(1)} ${(cy + Math.sin(t) * rr * 0.8).toFixed(1)}`;
        }
        const p = document.createElementNS(NS, "path");
        p.setAttribute("d", d + "Z");
        contour.append(p);
      }
    });
  }
  const coHeart = $(".co__heart");
  if (coHeart) {
    for (let i = 1; i <= 16; i++) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", heartD(i * 0.19));
      p.setAttribute("transform", `translate(300 290) rotate(${-8 + i * 0.6})`);
      coHeart.append(p);
    }
  }

  // ── Work filter: on choosing, cards slide in from 180px to the right (the original refetches the list from the server in between) ──
  const cats = $(".fw__cats");
  if (cats) cats.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("button", cats).forEach((x) => x.classList.toggle("is-on", x === b));
    if (!reduced) gsap.fromTo(".fw__grid > *", { x: 180, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.04, overwrite: "auto" });
  });

  // ── Lens follow ──────────────────────────────
  $$(".svc__half").forEach((h) => GP.lens(h, $(".svc__lens", h), { rest: (r) => { const s = $(".svc").getBoundingClientRect(); return [s.left + s.width / 2 - r.left, r.height * 0.5]; }, size: [280, 440], scale: [0.7, 1] }));
  $$(".wk__img").forEach((w) => GP.lens(w, $(".wk__lens", w)));
  if ($(".pf__list")) GP.lens($(".pf__list"), $(".pf__lens"));

  // ── Loader → hero entrance ─────────────────────────────
  const ld = $(".ld");
  const title = $(".hx__title");
  const chars = GP.split(title);
  const intro = () => {
    GP.showHead && GP.showHead();
    gl.intro = 1;
  };
  if (reduced) {
    ld.remove();
    intro();
  } else {
    GP.lenis && GP.lenis.stop();
    scrollTo(0, 0);
    gl.intro = 0;
    gl.start && gl.start();
    gsap.set($(".hx__copy"), { autoAlpha: 1 });
    gsap.set(chars, { yPercent: 110 });
    gsap.set([".hx__sub", ".hx__motion"], { autoAlpha: 0, y: 24 });
    const tl = gsap.timeline({
      onComplete: () => {
        GP.lenis && GP.lenis.start();
        ld.remove();
        ScrollTrigger.refresh();
      },
    });
    tl.to(".ld__logo", { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.2)
      .to(".ld__logo", { opacity: 0, duration: 0.3, ease: "power2.in" }, 1.5)
      .fromTo(".ld__ring", { opacity: 0, rotation: -8 }, { opacity: 1, rotation: 8, duration: 0.5, ease: "power2.out", transformOrigin: "50% 50%" }, 1.7)
      .to(".ld__ring ellipse", { attr: { rx: (i) => 120 + i * 2 }, duration: 0.9, ease: "power2.inOut", stagger: 0.012 }, 1.8)
      .to(".ld__ring", { opacity: 0, duration: 0.3 }, 2.6)
      .fromTo(".ld__hearts", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 2.55)
      .to(".ld__glow", { scale: 1, duration: 0.6, ease: "power3.out" }, 2.55)
      .to([".ld__glow", ".ld__wire"], { scale: 5, opacity: 0, duration: 0.6, ease: "power3.in" }, 3.4)
      .to(ld, { backgroundColor: GP.color("--kf-accent", 0), duration: 0.5, ease: "power2.inOut" }, 3.6)
      .to(gl, { intro: 1, duration: 0.9, ease: "back.out(1.4)" }, 3.6)
      .add(intro, 4.3)
      .to(chars, { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.04 }, 4.3)
      .to([".hx__sub", ".hx__motion"], { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 4.7);
  }

  // ── Scroll scene ─────────────────────────────────
  GP.mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero → lens bead: in the original, the 3D face that covered the screen on a sticky stage shrinks into a 260px diameter bead (scrub, ease none)
    const hx = $(".hx");
    const rimSize = () => $(".hx__rim").offsetWidth / 2;
    const fold = { r: 1e5, zoom: 1, k: 0 };
    const cover = () => Math.hypot(innerWidth, innerHeight) / 2 + 40;
    const setFold = () => gl.lens && gl.lens(fold);
    const words = $$(".hx__state .w");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hx, start: "top top", end: () => `+=${hx.offsetHeight - innerHeight}`, scrub: true, invalidateOnRefresh: true },
    });
    tl.to(".hx__copy", { autoAlpha: 0, y: -60, duration: 0.16 }, 0)
      .fromTo(fold, { r: cover, zoom: 1, k: 0 }, { r: rimSize, zoom: 0.34, k: 1, duration: 0.42, onUpdate: setFold }, 0)
      .to(".hx__rim", { opacity: 1, duration: 0.08 }, 0.36)
      .to(".hx__mission", { opacity: 1, duration: 0.06 }, 0.4)
      .fromTo(words, { color: () => GP.color("--kf-ink", 0.12) }, { color: (i, el) => GP.color(el.classList.contains("is-b") ? "--kf-accent" : "--kf-ink"), duration: 0.03, stagger: 0.012 }, 0.43)
      .to(".hx__mission", { y: () => -innerHeight * 0.7, opacity: 0, duration: 0.24 }, 0.62)
      .to(".hx__line", { scaleY: 1, duration: 0.26 }, 0.74);

    // Interview: when the card rises, the fill of the centered fixed title drops out and only the outline stays
    gsap.to(".ci__fill", { opacity: 0, ease: "none", scrollTrigger: { trigger: ".ci__cards", start: "top bottom", end: "top 45%", scrub: true } });

    // The blue circle shrinks to a dot while the title line slides left
    const la = $(".la"), row = $(".la__row"), dot = $(".la__dot"), brand = $(".la__brand"), fly = $(".la__fly");
    if (fly) fly.innerHTML = GP.mascot(true);
    const dotC = () => dot.offsetLeft + dot.offsetWidth / 2;
    const x0 = () => innerWidth * 0.74 - (brand.offsetLeft + brand.offsetWidth / 2);
    const x1 = () => innerWidth * (innerWidth < 1024 ? 0.7 : 0.62) - dotC();
    const s0 = () => {
      const cx = x0() + dotC(), cy = innerHeight / 2;
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(innerWidth - cx, cy), Math.hypot(cx, innerHeight - cy), Math.hypot(innerWidth - cx, innerHeight - cy));
      return (far / (dot.offsetWidth / 2)) * 1.05;
    };
    const lt = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: la, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    lt.fromTo(row, { x: x0 }, { x: x1, duration: 1 }, 0)
      .fromTo(dot, { scale: s0 }, { scale: 1, duration: 0.8, ease: "power1.in" }, 0)
      .fromTo(fly, { x: () => innerWidth * 0.72, y: () => innerHeight * 0.62, rotation: 8 }, { x: () => innerWidth * 0.2, y: () => innerHeight * 0.08, rotation: -6, duration: 1 }, 0);

    // Careers photo parallax
    $$(".cr__ph").forEach((el) => {
      const s = +el.dataset.speed;
      gsap.fromTo(el, { y: -s }, { y: s * 1.6, ease: "none", scrollTrigger: { trigger: ".cr", start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
})();
