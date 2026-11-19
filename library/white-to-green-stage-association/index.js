/* Home — canvas behind a rounded panel (white block → gray → melts like clouds into green, whirl particles → white box), pickup cover, activity photo slider, material intro text lines */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const logos = $(".t-member__logos");
  if (logos) logos.innerHTML = Array.from({ length: 60 }, () => '<li><div class="jp-ph wf-img" data-label="Member Logo"></div></li>').join("");

  // Activity row: the photo of the raised row expands, earlier photos stay as they are, later photos fold
  const links = $$(".t-action__link");
  const imgs = $$(".t-action__img");
  const linkBox = $(".t-action__links");
  links.forEach((link, i) => link.addEventListener("mouseenter", () => {
    links.forEach((l) => l.classList.toggle("isSelect", l === link));
    imgs.forEach((im, j) => {
      im.classList.remove("isSelect", "isPrev", "isNext");
      im.classList.add(j < i ? "isPrev" : j > i ? "isNext" : "isSelect");
    });
    linkBox.style.setProperty("--val", i);
  }));

  // When passing Skin colours to a shader, paint once and take rgb so oklch and color-mix can be read too
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (name) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    probe.clearRect(0, 0, 1, 1);
    if (!v) return [0, 0, 0];
    probe.fillStyle = v;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const cssColor = (name) => { const [r, g, b] = rgbOf(name); return "rgb(" + r + ", " + g + ", " + b + ")"; };

  const R = { ratio1: { value: 0 }, ratio2: { value: 0 }, ratio3: { value: 0 }, ratio4: { value: 0 }, ratio5: { value: 0 } };
  const isSP = () => innerWidth < 1024;

  // ── Canvas Scene ──
  const stageEl = $("#world");
  let scene3 = null;
  const buildStage = () => {
    if (!stageEl || !window.THREE) return null;
    const T = THREE;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
    const toColor = (name) => { const [r, g, b] = rgbOf(name); return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace); };
    const col = { stage: toColor("--kf-accent"), panel: toColor("--kf-surface"), ground: toColor("--kf-bg") };
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setClearColor(col.stage, 1);
    renderer.toneMapping = T.LinearToneMapping;
    renderer.toneMappingExposure = 1;
    stageEl.append(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(15, 1, 0.1, 1e4);
    const camBase = new T.Vector3();
    const camOff = { x: 0, y: 0 };
    const sun = new T.DirectionalLight(0xffffff, 4); // Not skin: light intensity and direction, so fixed white light
    sun.position.set(66.73, 78.49, 48.65);
    scene.add(sun, new T.AmbientLight(0xffffff, 0.8)); // Not skin: ambient light

    // Surface of clustered foam beads — stack the height as bead hemispheres and make normals from the slope
    const beadNormal = () => {
      const N = 256, h = new Float32Array(N * N);
      for (let k = 0; k < 2600; k++) {
        const cx = Math.random() * N, cy = Math.random() * N, r = 2 + Math.random() * 3;
        for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
          const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
          if (d2 > r * r) continue;
          const i = ((y + N) % N) * N + ((x + N) % N);
          h[i] = Math.max(h[i], Math.sqrt(r * r - d2) / r);
        }
      }
      const c = document.createElement("canvas"); c.width = c.height = N;
      const g = c.getContext("2d"), img = g.createImageData(N, N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const at = (xx, yy) => h[((yy + N) % N) * N + ((xx + N) % N)];
        const nx = (at(x - 1, y) - at(x + 1, y)) * 0.35, ny = (at(x, y - 1) - at(x, y + 1)) * 0.35;
        const l = Math.hypot(nx, ny, 1), o = (y * N + x) * 4;
        img.data[o] = (nx / l * 0.5 + 0.5) * 255; img.data[o + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[o + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[o + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      const t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(0.6, 0.6);
      t.colorSpace = T.NoColorSpace;
      return t;
    };

    const model = new T.Group(); model.renderOrder = 1;
    const overlay = new T.Group(); overlay.renderOrder = 3;
    scene.add(model, overlay);

    // Box: as the progress value rises, the screen-coordinate noise threshold lowers and the box fills up, glowing from the edges
    const boxMat = new T.MeshStandardMaterial({ transparent: true, color: col.panel, roughness: 0, metalness: 0.15, normalMap: beadNormal(), normalScale: new T.Vector2(1, 1), depthWrite: false, depthTest: false, opacity: 0 });
    boxMat.onBeforeCompile = (sh) => {
      sh.uniforms.uReveal = { value: 0 };
      sh.fragmentShader = "uniform float uReveal;\n" +
        "float vnHash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }\n" +
        "float vnNoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 w = f * f * (3.0 - 2.0 * f);\n" +
        "  return mix(mix(vnHash(i), vnHash(i + vec2(1.0, 0.0)), w.x), mix(vnHash(i + vec2(0.0, 1.0)), vnHash(i + vec2(1.0, 1.0)), w.x), w.y); }\n" +
        "float vnFbm(vec2 p){ float s = 0.0, a = 0.5; for (int k = 0; k < 4; k++) { s += a * vnNoise(p); p *= 2.0; a *= 0.5; } return s; }\n" +
        sh.fragmentShader.replace("#include <dithering_fragment>", [
          "#include <dithering_fragment>",
          "float cut = 1.0 - uReveal;",
          "if (cut >= 1.0) discard;",
          "if (cut > 0.0) {",
          "  vec2 q = gl_FragCoord.xy * 0.002;",
          "  float n = vnFbm(vec2(q.x * 6.0, q.y * 4.0));",
          "  float keep = smoothstep(cut, cut + 0.06, n);",
          "  if (keep < 0.01) discard;",
          "  gl_FragColor.rgb += (1.0 - keep) * keep * 2.5;",
          "  gl_FragColor.a *= keep;",
          "}",
        ].join("\n"));
      boxMat.userData.shader = sh;
    };
    const box = new T.Mesh(new T.BoxGeometry(4, 4, 4), boxMat);
    box.scale.setScalar(0.6); box.position.y = -2;
    model.add(box);

    // 10k particles: from the whirlwind spots to the box surface spots, the higher ones gather later
    const COUNT = 10000;
    const from = new Float32Array(COUNT * 3), to = new Float32Array(COUNT * 3), delay = new Float32Array(COUNT), size = new Float32Array(COUNT);
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < COUNT; i++) {
      const face = Math.floor(Math.random() * 6), u = Math.random() * 4 - 2, v = Math.random() * 4 - 2, s = face % 2 ? 2 : -2;
      const p = face < 2 ? [s, u, v] : face < 4 ? [u, s, v] : [u, v, s];
      to.set(p, i * 3);
      const a = i / COUNT, ring = 20 * a + 0.5, ang = a * Math.PI * 30 + 1.5 * (Math.random() - 0.5);
      const y = 40 * a + 1.5 * (Math.random() - 0.5) + 4;
      from.set([Math.cos(ang) * ring * (3 + 0.8 * Math.random()), y, Math.sin(ang) * ring * (1 + 0.8 * Math.random())], i * 3);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      size[i] = 0.6 * Math.random() + 0.4;
    }
    for (let i = 0; i < COUNT; i++) delay[i] = 0.8 * ((from[i * 3 + 1] - minY) / (maxY - minY)) + 0.2 * Math.random();
    const pg = new T.BufferGeometry();
    pg.setAttribute("position", new T.BufferAttribute(from, 3));
    pg.setAttribute("aTarget", new T.BufferAttribute(to, 3));
    pg.setAttribute("aDelay", new T.BufferAttribute(delay, 1));
    pg.setAttribute("aSize", new T.BufferAttribute(size, 1));
    const pMat = new T.ShaderMaterial({
      uniforms: { uGather: { value: 0 }, uFade: { value: 0 }, uTime: { value: 0 }, uTint: { value: col.panel } },
      vertexShader: [
        "attribute vec3 aTarget; attribute float aDelay; attribute float aSize;",
        "uniform float uGather; uniform float uTime; varying float vSize;",
        "float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }",
        "float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);",
        "  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),",
        "             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z) * 2.0 - 1.0; }",
        "void main(){",
        "  vSize = aSize;",
        "  float k = clamp((uGather - aDelay * 0.2) / 0.8, 0.0, 1.0);",
        "  float e = smoothstep(0.0, 1.0, k);",
        "  vec3 q = position * 0.5 + uTime * 0.2;",
        "  vec3 drift = vec3(n3(q), n3(q + vec3(31.4, 17.3, 0.0)), n3(q + vec3(0.0, 53.7, 91.2))) * (1.0 - e) * 1.5;",
        "  vec3 p = mix(position, aTarget, e) + drift;",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
        "  gl_PointSize = aSize * 60.0 * (1.0 - e) + 7.0 * e;",
        "}",
      ].join("\n"),
      fragmentShader: [
        "uniform float uFade; uniform vec3 uTint; varying float vSize;",
        "void main(){",
        "  float d = length(gl_PointCoord - 0.5);",
        "  if (d > 0.5) discard;",
        "  float core = 1.0 - smoothstep(0.0, vSize, d);",
        "  float halo = pow(1.0 - d * 2.0, 4.0) * smoothstep(0.0, 1.0, uFade);",
        "  float lum = core + halo * 0.5;",
        "  gl_FragColor = vec4(uTint * lum, lum * (1.0 - uFade));",
        "}",
      ].join("\n"),
      transparent: true, depthTest: false, depthWrite: false, blending: T.AdditiveBlending,
    });
    const points = new T.Points(pg, pMat);
    points.renderOrder = 2; points.frustumCulled = false;
    model.add(points);

    // Cover: one full-screen panel — each cell shrinks from the bottom row from square to circle, then turns transparent through a cloud-pattern threshold
    const oMat = new T.ShaderMaterial({
      uniforms: { uShrink: { value: 0 }, uMelt: { value: 0 }, uCols: { value: 15 }, uRows: { value: 10 }, uAspect: { value: 1 }, uPanel: { value: col.panel }, uGround: { value: col.ground } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: [
        "uniform float uShrink, uMelt, uCols, uRows, uAspect; uniform vec3 uPanel, uGround; varying vec2 vUv;",
        "float ch(vec2 p){ return fract(sin(dot(p, vec2(41.7, 289.3))) * 15731.743); }",
        "float cn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);",
        "  return mix(mix(ch(i), ch(i + vec2(1, 0)), f.x), mix(ch(i + vec2(0, 1)), ch(i + vec2(1, 1)), f.x), f.y); }",
        "float cloud(vec2 p){ float s = 0.0, a = 0.55; for (int k = 0; k < 5; k++) { s += a * cn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }",
        "float rbox(vec2 p, vec2 b, float r){ vec2 d = abs(p) - b + r; return length(max(d, 0.0)) - r; }",
        "void main(){",
        "  vec2 cell = vUv * vec2(uCols, uRows);",
        "  float row = floor(cell.y) / max(uRows - 1.0, 1.0);",
        "  float k = clamp((uShrink - row * 0.5) / 0.5, 0.0, 1.0);",
        "  float ph = smoothstep(0.0, 1.0, k);",
        "  float sc = 1.0 - ph;",
        "  float sdf = rbox(fract(cell) - 0.5, vec2(0.5 * sc), 0.6 * ph * sc);",
        "  if (sdf <= 0.0) { gl_FragColor = vec4(mix(uPanel, uGround, ph), 1.0); return; }",
        "  float mono = smoothstep(0.15, 0.95, cloud(vec2(vUv.x * uAspect, vUv.y) * 2.2));",
        "  float clear = clamp(mono + uMelt * 2.0 - 1.0, 0.0, 1.0);",
        "  gl_FragColor = vec4(uGround, 1.0 - clear);",
        "}",
      ].join("\n"),
      transparent: true, depthTest: false, depthWrite: false,
    });
    const cover = new T.Mesh(new T.PlaneGeometry(2, 2), oMat);
    cover.frustumCulled = false; cover.renderOrder = 3;
    overlay.add(cover);

    let lastKey = "", sizeTick = 0;
    const fit = () => {
      const w = stageEl.clientWidth || innerWidth, h = stageEl.clientHeight || innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (isSP()) camBase.set(43, 35, 43); else camBase.set(33, 25, 33);
      const cols = isSP() ? 10 : 15 * (w >= 1920 ? 1.6 : 1);
      oMat.uniforms.uCols.value = cols;
      oMat.uniforms.uRows.value = Math.ceil(h / (w / cols));
      oMat.uniforms.uAspect.value = w / h;
      sizeTick++;
    };
    fit();
    new ResizeObserver(fit).observe(stageEl);

    let pointer = null;
    addEventListener("mousemove", (e) => { pointer = e; }, { passive: true });
    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: "200px" }).observe(stageEl);

    const tick = () => {
      if (!visible) return;
      if (R.ratio3.value >= 1) {
        if (pointer) {
          const w = innerWidth, h = innerHeight;
          gsap.to(camOff, { x: (pointer.clientX - w / 2) * 0.01, y: -(pointer.clientY - h / 2) * 0.01, duration: 1, ease: "expo.out", overwrite: "auto" });
          pointer = null;
        }
        const r2 = R.ratio2.value;
        pMat.uniforms.uGather.value = R.ratio1.value;
        pMat.uniforms.uFade.value = r2;
        pMat.uniforms.uTime.value += 0.016;
        boxMat.opacity = r2;
        if (boxMat.userData.shader) boxMat.userData.shader.uniforms.uReveal.value = r2;
        box.scale.setScalar(0.6 + 0.4 * r2);
        box.position.y = 2 * r2 - 2;
        if (isSP()) { box.position.x = 5 * R.ratio5.value; box.rotation.y = R.ratio5.value * Math.PI; }
        else { box.position.x = 0; box.rotation.y = 0; }
      }
      camera.position.set(camBase.x + camOff.x, camBase.y + camOff.y, camBase.z);
      camera.lookAt(0, 0, 0);
      oMat.uniforms.uShrink.value = R.ratio3.value;
      oMat.uniforms.uMelt.value = R.ratio4.value;
      // Don’t redraw if nothing changed — every frame only while particles drift (before gathering and before vanishing)
      const drifting = R.ratio3.value >= 1 && R.ratio1.value < 1 && R.ratio2.value < 1;
      const key = [R.ratio1.value, R.ratio2.value, R.ratio3.value, R.ratio4.value, R.ratio5.value, camOff.x, camOff.y, sizeTick].join();
      if (!drifting && key === lastKey) return;
      lastKey = key;
      renderer.render(scene, camera);
    };
    let raf = 0;
    const loop = () => { tick(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return { kill: () => { cancelAnimationFrame(raf); renderer.dispose(); renderer.domElement.remove(); } };
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { motion } = ctx.conditions;
    root.classList.toggle("is-still", !motion);
    if (!motion) return;

    scene3 = scene3 || buildStage();

    $$("[data-trigger]").forEach((el) => {
      const [start, end] = (el.dataset.pos || "top bottom|bottom top").split("|");
      el.dataset.trigger.split("|").forEach((name) => {
        if (!R[name]) return;
        gsap.fromTo(R[name], { value: 0 }, { value: 1, ease: "none", scrollTrigger: { trigger: el, start, end, scrub: true } });
      });
    });

    // While the pickup stays attached, a rising rounded plate pushes it 30svh and darkens it
    gsap.to(".l-sticky-move-el", { "--val": 1, ease: "none", scrollTrigger: { trigger: ".l-world", start: "top 95%", end: "top top", scrub: true } });

    const video = $('video[data-sound="hero"]');
    ScrollTrigger.create({ trigger: ".l-sticky-container", start: "top bottom", end: "top top", scrub: true, onUpdate: (st) => { if (video) video.volume = Math.max(0, 1 - st.progress); } });

    // While passing the green stage the menu text is white, and turns green again on entering the usage panel
    const navLinks = $$(".m-global a");
    const green = cssColor("--kf-accent"), white = cssColor("--kf-on-accent");
    const wash = $('[data-trigger="ratio1|ratio4"]');
    if (navLinks.length && wash) {
      gsap.fromTo(navLinks, { "--nav-c": green, "--nav-circle": green, "--nav-hover": white }, { "--nav-c": white, "--nav-circle": white, "--nav-hover": green, ease: "none", scrollTrigger: { trigger: wash, start: "top center", end: "bottom center", scrub: true } });
      const paint = (c, h) => navLinks.forEach((a) => { a.style.setProperty("--nav-c", c); a.style.setProperty("--nav-circle", c); a.style.setProperty("--nav-hover", h); });
      ScrollTrigger.create({ trigger: ".t-usage", start: "top top", end: "bottom top", onEnter: () => paint(green, white), onLeaveBack: () => paint(white, green) });
    }

    const wis = $(".t-wis");
    if (wis) {
      gsap.to(".t-wis .u-hr", { "--clip-val": 1, ease: "none", scrollTrigger: { trigger: wis, start: "top 50%", end: "80% bottom", scrub: true } });
      gsap.to([".t-wis .hl h2", ".t-wis .hl p"], { opacity: 1, ease: "none", scrollTrigger: { trigger: ".t-wis .hl", start: "top 50%", end: "bottom 50%", scrub: true } });
      $$(".t-wis__copy p > span").forEach((line, i) => {
        const lg = line.querySelector(".lg");
        gsap.to(lg ? [line, lg] : line, { opacity: 1, scale: 1, ease: "none", scrollTrigger: { trigger: line, start: "top " + (60 + 5 * i) + "%", end: "bottom " + (60 + 5 * i) + "%", scrub: true } });
      });
      $$(".t-wis__buttons .m-btn").forEach((b, i) => {
        gsap.to(b, { opacity: 1, ease: "none", scrollTrigger: { trigger: b, start: "top " + (80 + 5 * i) + "%", end: "bottom " + (80 + 5 * i) + "%", scrub: true } });
      });
    }
    return () => { if (scene3) { scene3.kill(); scene3 = null; } };
  });

  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
