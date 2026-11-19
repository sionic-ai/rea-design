// Hero — three scene (20px grid shader · blackletter title letter plane · transmissive glass object) and desktop windows (placement, drag, expand, work picking, mosaic photo, cipher intro).
(() => {
  const MC = window.MC;
  const { EASE, SCRAMBLE, css, touch, reduce } = MC;
  const root = document.documentElement;
  const wide = () => innerWidth > 1024;

  /* ═════════ three scene ═════════ */
  const canvas = document.querySelector(".mc-scene");
  const T = window.THREE;
  const scene3 = (() => {
    if (!T || !canvas) return null;
    let W = innerWidth, H = innerHeight;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.NoToneMapping;
    // The transmission plane is at half resolution — lighter than the original (drei resolution 1 · samples 4) so frames don’t stutter
    if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = 0.5;
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -4000, 4000);
    camera.position.z = 2000;
    const col = (v) => new T.Color(css(v));

    // Reflection environment — a gray room with a few white panels (so white and black streaks reflect on the glass like the original’s studio environment)
    const pmrem = new T.PMREMGenerator(renderer);
    const room = new T.Scene();
    room.add(new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color: col("--kf-dim"), side: T.BackSide })));
    [[0, 4.5, 0, 6, 0.2, 6], [-4.8, 1, 1, 0.2, 3, 5], [4.8, 0, -1, 0.2, 4, 2], [0, -1, -4.8, 5, 2, 0.2]].forEach(([x, y, z, w, h, d], i) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshBasicMaterial({ color: col(i % 2 ? "--kf-contrast-ink" : "--kf-raised") }));
      m.position.set(x, y, z);
      room.add(m);
    });
    room.add(new T.Mesh(new T.BoxGeometry(3, 0.3, 3).translate(0, -4.8, 0), new T.MeshBasicMaterial({ color: col("--kf-ink") })));
    scene.environment = pmrem.fromScene(room, 0.03).texture;

    // Grid lines — the original used 20px lines on a shader plane. Drawn in screen pixels here
    const gridMat = new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uColor: { value: col("--kf-ink") }, uOpacity: { value: 0.035 }, uCell: { value: 20 }, uPad: { value: 20 }, uDpr: { value: renderer.getPixelRatio() } },
      vertexShader: "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uCell; uniform float uPad; uniform float uDpr;
        void main(){
          vec2 p = gl_FragCoord.xy / uDpr - uPad;
          vec2 g = abs(fract(p / uCell + 0.5) - 0.5) * uCell;
          float line = max(1.0 - smoothstep(0.0, 1.0, g.x), 1.0 - smoothstep(0.0, 1.0, g.y));
          if (line < 0.001) discard;
          gl_FragColor = vec4(uColor, line * uOpacity);
        }`,
    });
    const grid = new T.Mesh(new T.PlaneGeometry(1, 1), gridMat);
    grid.position.z = -1000;
    grid.renderOrder = -1;
    scene.add(grid);

    // Blackletter title — one plane per letter (opaque + alphaTest so it is caught by the transmission pass). Like the original SDF letters, letter spacing is fixed at .72 × size
    const LINES = ["WORDMARK", "HEADLINES"];
    const title = new T.Group();
    title.position.z = -400;
    scene.add(title);
    const texCache = new Map();
    let fs = 160;
    const glyph = (ch) => {
      const key = ch + fs + css("--kf-ink");
      if (texCache.has(key)) return texCache.get(key);
      const r = Math.min(2, devicePixelRatio || 1), w = Math.ceil(fs * 1.25), h = Math.ceil(fs * 1.4);
      const c = document.createElement("canvas");
      c.width = w * r; c.height = h * r;
      const g = c.getContext("2d");
      g.scale(r, r);
      g.fillStyle = css("--kf-ink");
      g.font = `${fs}px ${css("--kf-font-display")}`;
      g.textAlign = "center"; g.textBaseline = "middle";
      // The original blackletter is a narrow type that fits within the letter spacing (.72 × size), so a wider fallback font is squeezed horizontally to that width
      const fit = Math.min(1, (0.66 * fs) / Math.max(1, g.measureText(ch).width));
      g.translate(w / 2, 0); g.scale(fit, 1);
      g.fillText(ch, 0, h / 2 + fs * 0.06);
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      t.anisotropy = 4;
      const out = { t, w, h };
      texCache.set(key, out);
      return out;
    };
    const chars = [[], []];
    const buildTitle = () => {
      title.clear();
      texCache.forEach((v) => v.t.dispose());
      texCache.clear();
      fs = wide() ? W / 9 : W / 6.4;
      LINES.forEach((word, li) => {
        const step = 0.72 * fs, x0 = -((word.length - 1) * step) / 2, y = (li ? -1 : 1) * 0.58 * fs + 7;
        chars[li] = [...word].map((ch, i) => {
          const gph = glyph(ch);
          const m = new T.Mesh(new T.PlaneGeometry(gph.w, gph.h), new T.MeshBasicMaterial({ map: gph.t, alphaTest: 0.5, transparent: false, toneMapped: false }));
          const holder = new T.Group();
          holder.position.set(x0 + i * step, y, 0);
          holder.add(m);
          title.add(holder);
          return m;
        });
      });
    };
    const introTitle = () => {
      chars.forEach((row, li) => {
        const meshes = row.filter(Boolean);
        if (!meshes.length) return;
        if (reduce) { meshes.forEach((m) => { m.position.y = 0; m.scale.set(1, 1, 1); }); return; }
        const tl = gsap.timeline({ delay: 0.12 * li, defaults: { duration: 1.2, ease: EASE, stagger: { from: "center", amount: 0.2 } } });
        tl.fromTo(meshes.map((m) => m.position), { y: -0.15 * fs }, { y: 0 }, 0);
        tl.fromTo(meshes.map((m) => m.scale), { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1 }, 0);
      });
    };
    const hideTitle = () => chars.flat().forEach((m) => { m.position.y = -0.15 * fs; m.scale.set(0.001, 0.001, 0.001); });

    // Glass objects — in place of the original models (bust·skull·chess·jellyfish·rose·heart), our own shapes with the same silhouette proportions. Thickness carries the original value scaled to size
    const lathe = (pts, seg = 96) => new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), seg);
    const wobble = (geo, amp, f) => {
      const p = geo.attributes.position, v = new T.Vector3();
      geo.computeVertexNormals();
      const n = geo.attributes.normal;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const d = amp * (Math.sin(v.x * f + v.y * 3.1) * Math.cos(v.z * f * 0.8 - v.y * 2.3) + 0.5 * Math.sin(v.y * f * 1.7 + v.x));
        p.setXYZ(i, v.x + n.getX(i) * d, v.y + n.getY(i) * d, v.z + n.getZ(i) * d);
      }
      geo.computeVertexNormals();
      return geo;
    };
    const SHAPES = [
      { name: "Bust", thick: 0.6, make: () => wobble(lathe([[0, -1], [0.62, -0.98], [0.78, -0.86], [0.74, -0.64], [0.5, -0.46], [0.27, -0.33], [0.24, -0.12], [0.36, 0.02], [0.44, 0.24], [0.42, 0.5], [0.3, 0.74], [0.12, 0.88], [0, 0.9]]).scale(1, 1, 0.62), 0.035, 7) },
      { name: "Skull", thick: 0.4, make: () => {
        const g = new T.SphereGeometry(0.55, 96, 72), p = g.attributes.position, v = new T.Vector3();
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i);
          if (v.y < -0.1) { const k = 1 - Math.min(1, (-0.1 - v.y) * 1.6); v.x *= 0.62 + 0.38 * k; v.z *= 0.75 + 0.25 * k; }
          [-0.2, 0.2].forEach((ex) => { const d = Math.hypot(v.x - ex, v.y + 0.02, v.z - 0.48); if (d < 0.18) v.z -= (0.18 - d) * 0.9; });
          p.setXYZ(i, v.x * 0.9, v.y * 1.05, v.z * 1.1);
        }
        g.computeVertexNormals();
        return g;
      } },
      { name: "Chess", thick: 0.1, make: () => lathe([[0, -1], [0.5, -1], [0.52, -0.9], [0.4, -0.82], [0.42, -0.74], [0.26, -0.66], [0.18, -0.2], [0.3, -0.1], [0.22, -0.04], [0.26, 0.1], [0.3, 0.3], [0.24, 0.46], [0, 0.52]]) },
      { name: "Jellyfish", thick: 0.85, make: () => lathe([[0, 0.7], [0.3, 0.66], [0.52, 0.48], [0.62, 0.2], [0.6, 0.02], [0.5, 0.06], [0.36, -0.02], [0.2, -0.3], [0.12, -0.7], [0.04, -1], [0, -1]]) },
      { name: "Rose", thick: 0.85, make: () => new T.TorusKnotGeometry(0.5, 0.16, 240, 32, 2, 5) },
      { name: "Heart", thick: 3, make: () => {
        const s = new T.Shape();
        s.moveTo(0, -0.6); s.bezierCurveTo(-0.15, -0.45, -0.7, -0.15, -0.7, 0.2); s.bezierCurveTo(-0.7, 0.5, -0.4, 0.62, -0.2, 0.62);
        s.bezierCurveTo(-0.05, 0.62, 0, 0.5, 0, 0.42); s.bezierCurveTo(0, 0.5, 0.05, 0.62, 0.2, 0.62); s.bezierCurveTo(0.4, 0.62, 0.7, 0.5, 0.7, 0.2);
        s.bezierCurveTo(0.7, -0.15, 0.15, -0.45, 0, -0.6);
        const g = new T.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.12, bevelSegments: 12, curveSegments: 48 });
        g.center();
        return g;
      } },
    ];
    const glass = new T.MeshPhysicalMaterial({
      color: col("--kf-contrast-ink"), metalness: 0, roughness: 0.12, transmission: 1, ior: 1.45, thickness: 1,
      dispersion: 3, iridescence: 0.55, iridescenceIOR: 1.5, envMapIntensity: 2, specularIntensity: 1,
    });
    const holder = new T.Group();
    scene.add(holder);
    let mesh = null, shapeIx = 0, S = 390;
    const fitSize = () => (S = Math.min(H * 0.43, W * (wide() ? 0.3 : 0.64)));
    const setShape = (i) => {
      shapeIx = (i + SHAPES.length) % SHAPES.length;
      if (mesh) { holder.remove(mesh); mesh.geometry.dispose(); }
      const geo = SHAPES[shapeIx].make();
      geo.computeBoundingBox();
      const b = geo.boundingBox, size = new T.Vector3(), c = new T.Vector3();
      b.getSize(size); b.getCenter(c);
      geo.translate(-c.x, -c.y, -c.z);
      geo.scale(1 / Math.max(size.x, size.y, size.z), 1 / Math.max(size.x, size.y, size.z), 1 / Math.max(size.x, size.y, size.z));
      mesh = new T.Mesh(geo, glass);
      mesh.renderOrder = 2;
      holder.add(mesh);
      // three multiplies thickness by object scale, so set it at a size-1 basis (original: thick at size 1.8)
      glass.thickness = SHAPES[shapeIx].thick / 1.8;
      mesh.scale.setScalar(S);
    };
    const introObject = () => {
      if (!mesh) return;
      if (reduce) { holder.scale.set(1, 1, 1); holder.rotation.set(0, 0, 0); return; }
      gsap.fromTo(holder.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 1.85, ease: EASE, overwrite: true });
      gsap.fromTo(holder.rotation, { x: 0, y: -2 * Math.PI, z: 0 }, { x: 0, y: 0, z: 0, duration: 1.85, ease: EASE, overwrite: true });
    };
    const nextShape = () => {
      gsap.to(holder.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.45, ease: "power2.in", overwrite: true, onComplete: () => { setShape(shapeIx + 1); introObject(); } });
    };

    // Drag to rotate — on release it spins by inertia and then stops. Normally it turns very slowly
    const spin = { y: 0, x: 0, vy: 0, vx: 0, drag: false, px: 0, py: 0 };
    const hit = (e) => {
      if (!mesh) return false;
      const r = new T.Raycaster(), v = new T.Vector2((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
      r.setFromCamera(v, camera);
      return r.intersectObject(mesh).length > 0;
    };
    canvas.addEventListener("pointerdown", (e) => {
      if (touch || !hit(e)) return;
      spin.drag = true; spin.px = e.clientX; spin.py = e.clientY;
      canvas.classList.add("is-grab");
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!spin.drag) { canvas.style.cursor = hit(e) ? "" : "default"; return; }
      spin.vy = (e.clientX - spin.px) * 0.01; spin.vx = (e.clientY - spin.py) * 0.006;
      spin.px = e.clientX; spin.py = e.clientY;
    });
    const release = () => { spin.drag = false; canvas.classList.remove("is-grab"); };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    let gridOn = 1;
    const resize = () => {
      W = innerWidth; H = innerHeight;
      renderer.setSize(W, H, false);
      Object.assign(camera, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 });
      camera.updateProjectionMatrix();
      grid.scale.set(W, H, 1);
      gridMat.uniforms.uDpr.value = renderer.getPixelRatio();
      fitSize();
      if (mesh) mesh.scale.setScalar(S);
      buildTitle();
    };
    const recolor = () => {
      scene.background = col("--kf-bg");
      gridMat.uniforms.uColor.value = col("--kf-ink");
      glass.color = col("--kf-contrast-ink");
      const keep = chars.flat().map((m) => ({ y: m.position.y, s: m.scale.x }));
      buildTitle();
      chars.flat().forEach((m, i) => { if (keep[i]) { m.position.y = keep[i].y; m.scale.setScalar(keep[i].s); } });
    };
    scene.background = col("--kf-bg");
    fitSize();
    grid.scale.set(W, H, 1);

    const clock = new T.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(0.05, clock.getDelta());
      if (!spin.drag) { spin.vy *= 0.95; spin.vx *= 0.92; }
      spin.y += spin.vy + (reduce ? 0 : dt * 0.25);
      spin.x = gsap.utils.clamp(-0.5, 0.5, spin.x + spin.vx);
      if (!spin.drag) spin.x *= 0.97;
      if (mesh) { mesh.rotation.y = spin.y; mesh.rotation.x = spin.x; }
      const p = MC.pointer;
      if (p?.ready && !touch) { title.position.x += ((p.x / W - 0.5) * -12 - title.position.x) * 0.05; title.position.y += ((p.y / H - 0.5) * 8 - title.position.y) * 0.05; }
      gridMat.uniforms.uOpacity.value += ((gridOn ? 0.035 : 0) - gridMat.uniforms.uOpacity.value) * 0.1;
      renderer.render(scene, camera);
    });

    return {
      ready: async () => {
        try { await document.fonts.load(`160px ${css("--kf-font-display")}`, "WORDMARKHEADLINES"); } catch (e) { /* If the font fails to load, draw with a fallback font */ }
        buildTitle(); hideTitle(); setShape(0); holder.scale.set(0.001, 0.001, 0.001);
      },
      introTitle, introObject, nextShape, recolor, resize,
      toggleGrid: () => { gridOn = gridOn ? 0 : 1; },
    };
  })();

  if (scene3) {
    scene3.ready();
    MC.intro.title = () => scene3.introTitle();
    MC.intro.object = () => scene3.introObject();
    MC.on("object", () => scene3.nextShape());
    MC.on("theme", () => requestAnimationFrame(() => scene3.recolor()));
    MC.on("grid", () => scene3.toggleGrid());
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => scene3.resize(), 120); });
  }

  /* ═════════ Window ═════════ */
  const gridEl = document.querySelector(".mc-grid");
  const wins = [...document.querySelectorAll(".mc-win")];
  const PAD = 20, GAP = 20, CELL = 20, COLS = 12;
  const parse = (s) => s.split("/").map(Number);
  const home = new Map(wins.map((w) => [w, parse(w.dataset.area)]));
  const now = new Map(wins.map((w) => [w, parse(w.dataset.area)]));
  const rows = () => Math.max(20, Math.round((innerHeight - 2 * PAD) / CELL));
  const colW = () => (innerWidth - 2 * PAD - (COLS - 1) * GAP) / COLS;
  const place = (w, a) => {
    now.set(w, a);
    w.style.gridArea = wide() ? `${a[0]} / ${a[1]} / span ${a[2]} / span ${a[3]}` : "";
  };
  const layout = () => {
    gridEl.style.setProperty("--rows", rows());
    wins.forEach((w) => place(w, now.get(w)));
  };
  layout();
  addEventListener("resize", layout);

  // Hatching — on windows with the header off (detail · photo before a work is picked), white translucent 1px lines at 5px spacing tilted 30°
  wins.forEach((w) => {
    const h = w.querySelector(".mc-hatch");
    if (!h) return;
    for (let x = -30; x < 420; x += 5) { const i = document.createElement("i"); i.style.left = x + "px"; h.append(i); }
  });
  const hatch = (w, on) => {
    const lines = w.querySelectorAll(".mc-hatch i");
    if (!lines.length) return;
    gsap.to(lines, { scaleY: on ? 1 : 0, opacity: on ? 1 : 0, duration: on ? 0.6 : 0.4, ease: on ? EASE : "power2.in", stagger: { each: 0.008, from: on ? "start" : "end" }, overwrite: true });
  };
  gsap.set(".mc-hatch i", { rotate: 30, scaleY: 0, opacity: 0, transformOrigin: "50% 0%" });

  // Window open order — the clip expands from a 20px point at top left → handle cell (40px) → right → down, and the backdrop veil lifts at .45s (.04s per window)
  const revealWin = (w) => {
    const surf = w.querySelector(".mc-win__surface");
    const n = surf.offsetWidth, r = surf.offsetHeight, i = Math.min(20, n / 2, r / 2), a = Math.min(40, n, r), b = Math.max(0, r - a);
    const shield = document.createElement("div");
    shield.className = "mc-win__shield";
    surf.prepend(shield);
    const icons = [...w.querySelectorAll(".mc-ico")];
    gsap.set(icons, { scale: 0, transformOrigin: "50% 50%" });
    const clip = { t: i, r: Math.max(0, n - i), b: Math.max(0, r - i), l: i };
    const paint = () => { surf.style.clipPath = `inset(${clip.t}px ${clip.r}px ${clip.b}px ${clip.l}px round 4px)`; };
    paint();
    const tl = gsap.timeline({ defaults: { duration: 1, ease: EASE }, onUpdate: paint });
    tl.to(clip, { t: 0, r: Math.max(0, n - a), b, l: 0 })
      .to(clip, { r: 0 }, "-=0.8")
      .to(clip, { b: 0, onComplete: () => { surf.style.clipPath = ""; } }, "-=0.2")
      .to(shield, { opacity: 0, duration: 0.45, ease: "power2.out", onComplete: () => shield.remove() });
    if (icons.length) tl.to(icons, { scale: 1, duration: 0.55, stagger: 0.05, ease: "back.out(1.6)", clearProps: "transform" }, "-=0.25");
    if (w.classList.contains("is-off")) tl.add(() => hatch(w, true), "-=0.2");
    return tl;
  };
  // Before opening, only a single point is left via clip — like the original, the window stays in the document
  const preClip = (w) => {
    const surf = w.querySelector(".mc-win__surface"), n = surf.offsetWidth, r = surf.offsetHeight, i = Math.min(20, n / 2, r / 2);
    surf.style.clipPath = `inset(${i}px ${Math.max(0, n - i)}px ${Math.max(0, r - i)}px ${i}px round 4px)`;
  };
  wins.forEach(preClip);
  MC.intro.windows = () => {
    wins.forEach((w, k) => {
      gsap.delayedCall(0.04 * k, () => {
        const tl = revealWin(w);
        if (reduce) tl.progress(1);
      });
    });
  };

  /* Drag — when the handle is grabbed the clone follows the pointer with .16s power4.out, and a dotted cell shows where it will land. On drop it moves into that cell in 1s (original curve) */
  const ghost = document.createElement("div");
  ghost.className = "mc-ghost";
  gridEl.append(ghost);
  let drag = null;
  const snap = (w, left, top) => {
    const [, , rs, cs] = now.get(w), cw = colW();
    const c = gsap.utils.clamp(0, COLS - cs, Math.round(left / (cw + GAP)));
    const rr = gsap.utils.clamp(0, rows() - rs, Math.round(top / CELL));
    return [rr + 1, c + 1, rs, cs];
  };
  const areaRect = (a) => {
    const cw = colW();
    return { left: (a[1] - 1) * (cw + GAP), top: (a[0] - 1) * CELL, width: a[3] * cw + (a[3] - 1) * GAP, height: a[2] * CELL };
  };
  document.querySelectorAll("[data-handle]").forEach((hd) => {
    hd.addEventListener("pointerdown", (e) => {
      if (!wide() || e.button !== 0) return;
      const w = hd.closest(".mc-win");
      if (w.classList.contains("is-expanded")) return;
      e.preventDefault();
      const g = gridEl.getBoundingClientRect(), r = w.getBoundingClientRect();
      const float = w.cloneNode(true);
      float.classList.add("mc-float");
      float.removeAttribute("data-slot");
      gsap.set(float, { left: r.left - g.left, top: r.top - g.top, width: r.width, height: r.height, gridArea: "auto" });
      gridEl.append(float);
      w.classList.add("is-dragging");
      drag = { w, float, ox: e.clientX - r.left, oy: e.clientY - r.top, qx: gsap.quickTo(float, "left", { duration: 0.16, ease: "power4.out" }), qy: gsap.quickTo(float, "top", { duration: 0.16, ease: "power4.out" }), target: now.get(w) };
      gsap.set(ghost, { ...areaRect(now.get(w)), opacity: 1 });
      MC.blip(440, 0.05, 0.03);
    });
  });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const g = gridEl.getBoundingClientRect(), x = e.clientX - g.left - drag.ox, y = e.clientY - g.top - drag.oy;
    drag.qx(x); drag.qy(y);
    const t = snap(drag.w, x, y);
    if (t.join() !== drag.target.join()) { drag.target = t; gsap.to(ghost, { ...areaRect(t), duration: 0.16, ease: "power4.out", overwrite: true }); MC.blip(1200, 0.015, 0.015); }
  });
  addEventListener("pointerup", () => {
    if (!drag) return;
    const { w, float, target } = drag;
    drag = null;
    const fr = float.getBoundingClientRect();
    float.remove();
    w.classList.remove("is-dragging");
    place(w, target);
    const nr = w.getBoundingClientRect();
    gsap.fromTo(w, { x: fr.left - nr.left, y: fr.top - nr.top }, { x: 0, y: 0, duration: 1, ease: EASE, clearProps: "transform" });
    gsap.to(ghost, { opacity: 0, duration: 0.3 });
    w.classList.add("is-lift");
    gsap.delayedCall(1, () => w.classList.remove("is-lift"));
  });

  const flipTo = (list, dur = 1) => {
    const state = Flip.getState(list.map(([w]) => w));
    list.forEach(([w, a]) => place(w, a));
    Flip.from(state, { duration: reduce ? 0 : dur, ease: EASE, absolute: false });
  };
  MC.on("layout", () => {
    collapseAll();
    flipTo(wins.map((w) => [w, home.get(w)]));
  });

  /* Expand — press + and that window moves to the data-expand spot over .8s, and returns on another press, an outside click, or Esc */
  const before = new Map();
  const expand = (w, on) => {
    const btn = w.querySelector(".mc-win__plus");
    if (on === w.classList.contains("is-expanded")) return;
    if (on) before.set(w, now.get(w));
    w.classList.toggle("is-expanded", on);
    btn?.setAttribute("aria-expanded", on);
    if (wide() && w.dataset.expand) {
      const a = on ? parse(w.dataset.expand) : before.get(w) || home.get(w);
      flipTo([[w, a]], 0.8);
    }
    if (w.dataset.win === "about") cipher(on || w.matches(":hover"));
    if (w.dataset.win === "photo" && on) clearPhoto();
    MC.blip(on ? 620 : 420, 0.06, 0.03);
  };
  const collapseAll = () => wins.forEach((w) => expand(w, false));
  wins.forEach((w) => {
    w.querySelector(".mc-win__plus")?.addEventListener("click", (e) => { e.stopPropagation(); expand(w, !w.classList.contains("is-expanded")); });
  });
  document.addEventListener("click", (e) => { wins.forEach((w) => { if (w.classList.contains("is-expanded") && !w.contains(e.target)) expand(w, false); }); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { collapseAll(); pick(null); } });

  /* Work picker — list · strip · number keys. The detail and photo windows turn on (the hatching lifts) and the photo opens from bottom to top over 1s (.1 stagger · .35 delay) */
  const details = wins.find((w) => w.dataset.win === "details"), images = wins.find((w) => w.dataset.win === "images");
  const shots = [...images.querySelectorAll(".mc-shot")];
  let current = null;
  const pick = (n) => {
    if (n === current) n = null;
    const prev = current;
    current = n;
    document.querySelectorAll(".mc-list button").forEach((b) => b.classList.toggle("is-on", +b.dataset.project === n));
    if (n == null) {
      if (prev == null) return;
      gsap.to(shots, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.45, stagger: { each: 0.05, from: "end" }, ease: "power2.in", overwrite: true });
      gsap.delayedCall(0.6, () => {
        [details, images].forEach((w) => { w.classList.add("is-off"); hatch(w, true); });
        flipTo([[details, home.get(details)], [images, home.get(images)]]);
        setNames(null);
      });
      return;
    }
    setNames(n);
    if (prev == null) {
      [details, images].forEach((w) => { w.classList.remove("is-off"); hatch(w, false); });
      flipTo([[details, [4, 4, 6, 3]], [images, [11, 4, 12, 3]]]);
    }
    details.querySelector('[data-field="year"]').textContent = String(2000 + n * 2).padStart(4, "0");
    gsap.fromTo(shots, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, stagger: 0.1, delay: 0.35, ease: EASE, overwrite: true });
  };
  const setNames = (n) => {
    [details, images].forEach((w) => {
      const b = w.querySelector("[data-name]");
      const txt = n == null ? (w === details ? "Work/Details" : "Work/Photo") : `Work ${n} /${b.dataset.name}`;
      gsap.to(b, { duration: 0.6, scrambleText: { text: txt, chars: SCRAMBLE, speed: 0.4 } });
    });
  };
  document.querySelectorAll(".mc-list button, .mc-strip").forEach((b) => b.addEventListener("click", () => pick(+b.dataset.project)));
  MC.on("project", (e) => pick(e.detail));

  /* Photo — 24-cell mosaic (monochrome). On click the cell count grows from 24 back to the original and the image sharpens */
  const photo = document.querySelector(".mc-photo"), px = photo.querySelector(".mc-photo__px");
  const drawPx = (cols) => {
    const r = photo.getBoundingClientRect();
    if (!r.width) return;
    const rowsN = Math.max(1, Math.round((cols * r.height) / r.width));
    px.width = cols; px.height = rowsN;
    const g = px.getContext("2d");
    const bg = css("--kf-raised"), ink = css("--kf-ink"), mid = css("--kf-dim");
    g.fillStyle = bg; g.fillRect(0, 0, cols, rowsN);
    const sx = cols / 24, sy = rowsN / 30;
    g.fillStyle = mid; g.beginPath(); g.ellipse(12 * sx, 8 * sy, 3.2 * sx, 3.8 * sy, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ink; g.beginPath(); g.ellipse(12 * sx, 6.4 * sy, 3 * sx, 2.4 * sy, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(6 * sx, 12 * sy, 12 * sx, 10 * sy);
    g.fillStyle = mid; g.fillRect(4 * sx, 20 * sy, 16 * sx, 4 * sy);
    g.fillStyle = ink; g.fillRect(5 * sx, 24 * sy, 5 * sx, 4 * sy); g.fillRect(14 * sx, 24 * sy, 5 * sx, 4 * sy);
  };
  const px0 = { n: 24 };
  drawPx(24);
  let clear = false;
  const clearPhoto = () => {
    if (clear) return;
    clear = true;
    gsap.to(px0, { n: 96, duration: reduce ? 0 : 0.6, ease: "power2.in", onUpdate: () => drawPx(Math.round(px0.n)), onComplete: () => photo.classList.add("is-clear") });
    MC.blip(760, 0.08, 0.03);
  };
  photo.addEventListener("click", clearPhoto);
  addEventListener("resize", () => { if (!clear) drawPx(24); });
  MC.on("theme", () => { if (!clear) requestAnimationFrame(() => drawPx(24)); });

  /* About — locked as symbols by default, unscrambled with ScrambleText on hover or expand */
  const about = wins.find((w) => w.dataset.win === "about");
  const pieces = [];
  about.querySelectorAll("[data-cipher]").forEach((p) => {
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3 && c.textContent.trim()) { const s = document.createElement("span"); s.textContent = c.textContent; c.replaceWith(s); pieces.push({ el: s, text: s.textContent }); }
      else if (c.nodeType === 1) walk(c);
    });
    walk(p);
  });
  const rnd = (t) => [...t].map((c) => (c === " " ? " " : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0])).join("");
  pieces.forEach((p) => { p.el.textContent = rnd(p.text); });
  let open = false;
  const cipher = (on) => {
    if (on === open) return;
    open = on;
    pieces.forEach((p) => gsap.to(p.el, { duration: on ? 0.8 : 0.5, scrambleText: { text: on ? p.text : rnd(p.text), chars: SCRAMBLE, speed: 0.4 }, overwrite: true }));
  };
  about.addEventListener("pointerenter", () => cipher(true));
  about.addEventListener("pointerleave", () => cipher(about.classList.contains("is-expanded")));
  if (touch) cipher(true);

  /* Language — the original switches French · English with a shuffle. Here: Korean placeholder ↔ English placeholder */
  const ALT = [
    [".mc-chips > .mc-chip:nth-child(1)", "NAME 0000"], [".mc-chips > .mc-chip:nth-child(2)", "TITLE 00"],
    ['[data-win="list"] .mc-win__title', "[WORK/LIST]"], ['[data-win="grid"] .mc-win__title', "[WORK/GRID]"],
    ['[data-win="about"] .mc-win__title', "[ABOUT]"], ['[data-win="awards"] .mc-win__title', "[AWARDS]"], ['[data-win="stack"] .mc-win__title', "[STACK]"],
  ];
  const keep = new Map();
  let alt = false;
  MC.on("lang", () => {
    alt = !alt;
    root.lang = alt ? "en" : "ko";
    ALT.forEach(([sel, en]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (el._cells) { if (!keep.has(el)) keep.set(el, el.getAttribute("aria-label")); const t = alt ? en : keep.get(el); el.textContent = t; MC.splitScramble(el); MC.scramble(el); return; }
      if (!keep.has(el)) keep.set(el, el.innerHTML);
      if (alt) gsap.to(el, { duration: 0.6, scrambleText: { text: en, chars: SCRAMBLE, speed: 0.4 } });
      else { gsap.killTweensOf(el); el.innerHTML = keep.get(el); }
    });
  });
})();
