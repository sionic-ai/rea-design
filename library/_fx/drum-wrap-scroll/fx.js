(() => {
  // Wraps the picture (sticker) around a bumpy vertical cylinder (radius 1.4 ± 1.25 height variation) and draws it — during progress t, which is 0 when the panel touches the screen bottom and 1 when it fully exits the top
  // The sticker rises from height −2.7 to 2.7 while spinning turns times (around the turn-offset center). Sticker width 1 = One turn around the cylinder, with the vertical stretched to 6 times the horizontal (scale).
  // Camera fov 35 · z 3.5 (phone 5), tilts ±.2rad following the mouse (10% per frame). Light is a subtle ambient .75 + a (2,4,1) directional .75.
  const STICK_VS = `
    uniform vec2 uAspect; uniform vec2 uScale; uniform vec2 uShift; uniform float uTurn; uniform float uGap; uniform float uRadius; uniform float uBump;
    varying vec2 vUv; varying vec3 vN;
    const float TAU = 6.28318530718;
    float hill(vec2 q) {
      float a = q.x * TAU, y = clamp(q.y, 0.0, 1.0);
      float n = 0.46 * sin(a + 2.9 * y + 0.6) * cos(5.3 * y - 0.4) + 0.28 * sin(2.0 * a - 4.1 * y + 1.7)
              + 0.16 * cos(3.0 * a + 6.7 * y + 0.3) + 0.10 * sin(5.0 * a - 9.2 * y + 2.2);
      float edge = clamp(smoothstep(0.86, 0.98, y) + 1.0 - smoothstep(0.02, 0.14, y), 0.0, 1.0);
      return mix(n, -1.0, edge);
    }
    vec3 drum(vec2 p) {
      vec2 o = p / uAspect;
      float c = cos(uTurn), s = sin(uTurn);
      vec2 q = vec2(c * o.x + s * o.y, -s * o.x + c * o.y) * uScale + uShift;
      float rad = uRadius + uBump * hill(vec2(q.x + 0.5, (q.y + 1.8) / 3.6)) + uGap;
      float ang = q.x * TAU;
      return vec3(sin(ang) * rad, q.y, cos(ang) * rad);
    }
    void main() {
      vUv = uv;
      vec3 p = drum(position.xy), px = drum(position.xy + vec2(0.01, 0.0)), py = drum(position.xy + vec2(0.0, 0.01));
      vN = normalize(mat3(viewMatrix) * normalize(cross(px - p, py - p)));
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
    }`;
  const STICK_FS = `
    uniform sampler2D uMap; uniform vec3 uLight; varying vec2 vUv; varying vec3 vN;
    void main() {
      vec4 t = texture2D(uMap, vUv);
      if (t.a < 0.5) discard;
      vec3 n = normalize(vN);
      if (!gl_FrontFacing) n = -n;
      n = normalize(mix(vec3(0.0, 0.0, 1.0), n, 0.3));
      gl_FragColor = vec4(min(t.rgb * (0.75 + 0.75 * max(dot(n, uLight), 0.0)), vec3(1.0)), 1.0);
    }`;

  const colorOf = (el, expr) => {
    const s = document.createElement("i");
    s.style.cssText = `display:none;color:${expr}`;
    el.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    return c;
  };
  function wordsArt(el, rows, fam) {
    const S = 1024, c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    const fills = ["var(--kf-accent-soft)", "var(--kf-accent)", "var(--kf-ink)"], inks = ["var(--kf-ink)", "var(--kf-on-accent)", "var(--kf-bg)"];
    const band = S / Math.max(rows.length, 1);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    rows.forEach((text, i) => {
      const cy = band * (i + 0.5), n = 9, pts = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        pts.push([S / 2 + Math.cos(a) * S * 0.47 * (0.78 + rand() * 0.34), cy + Math.sin(a) * band * 0.66 * (0.7 + rand() * 0.45)]);
      }
      ctx.beginPath();
      for (let k = 0; k < n; k++) {
        const p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
        if (!k) ctx.moveTo(p1[0], p1[1]);
        ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
      }
      ctx.fillStyle = colorOf(el, fills[i % 3]);
      ctx.fill();
      let px = band * 0.9;
      ctx.font = `400 ${px}px ${fam}`;
      const w = ctx.measureText(text).width;
      if (w > S * 0.82) px *= (S * 0.82) / w;
      ctx.font = `400 ${px}px ${fam}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = colorOf(el, inks[i % 3]);
      ctx.fillText(text, S / 2, cy);
    });
    return c;
  }

  kfFx.register("drum-wrap-scroll", (el, { options, reduce, hover, scroller }) => {
    const T = window.THREE;
    const parts = [...el.querySelectorAll('[data-fx-part="sticker"]')];
    if (!T?.WebGLRenderer || !parts.length) return;
    const num = (k, d) => { const v = parseFloat(options[k]); return Number.isFinite(v) ? v : d; };
    const radius = num("radius", 1.4), bump = num("bump", 1.25), tilt = num("tilt", 0.2), follow = num("follow", 0.1);
    const whole = num("whole", 0) > 0;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: devicePixelRatio < 2, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const cv = renderer.domElement;
    cv.className = "fx-drum-wrap-scroll__gl";
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, 0.001, 100), dolly = new T.Object3D();
    dolly.add(camera);
    scene.add(dolly);
    const light = new T.Vector3(2, 4, 1).normalize(), lightView = new T.Vector3();
    const fam = getComputedStyle(el).getPropertyValue("--kf-font-display").trim() || "sans-serif";
    const ds = (p, k, d) => { const v = parseFloat(p.dataset[k]); return Number.isFinite(v) ? v : d; };
    let dirty = true, alive = true, raf = 0, W = 1, H = 1;
    const items = parts.map((p) => {
      const scale = ds(p, "scale", 0.5);
      const mat = new T.ShaderMaterial({
        vertexShader: STICK_VS, fragmentShader: STICK_FS, transparent: true, side: T.DoubleSide,
        uniforms: {
          uMap: { value: null }, uAspect: { value: new T.Vector2(2, 2) }, uScale: { value: new T.Vector2(scale, scale * 6) },
          uShift: { value: new T.Vector2(0, -3) }, uTurn: { value: (ds(p, "rotation", 0) * Math.PI) / 180 }, uGap: { value: ds(p, "distance", 0) },
          uRadius: { value: radius }, uBump: { value: bump }, uLight: { value: lightView },
        },
      });
      const mesh = new T.Mesh(new T.PlaneGeometry(2, 2, 100, 100), mat);
      mesh.frustumCulled = false;
      mesh.visible = false;
      scene.add(mesh);
      const it = { p, mat, mesh, ready: false, speed: ds(p, "speed", 1), offset: ds(p, "offset", 0), turns: ds(p, "turns", 0), turnOffset: ds(p, "turnOffset", 0) };
      const img = p.tagName === "IMG" ? p : p.querySelector("img");
      const use = (src, aspect) => {
        const tex = new T.CanvasTexture(src);
        tex.minFilter = T.LinearFilter;
        tex.generateMipmaps = false;
        mat.uniforms.uMap.value = tex;
        mat.uniforms.uAspect.value.set(aspect * 2, 2);
        it.ready = true;
        dirty = true;
        renderer.compile(scene, camera);
      };
      if (img) {
        const go = () => {
          if (!alive || !img.naturalWidth) return;
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext("2d").drawImage(img, 0, 0);
          use(c, img.naturalHeight / img.naturalWidth);
        };
        img.complete ? go() : img.addEventListener("load", go, { once: true });
      } else {
        const rows = (p.dataset.words || p.textContent || "").split("|").map((s) => s.trim()).filter(Boolean);
        if (rows.length) document.fonts.load(`400 100px ${fam}`).catch(() => {}).then(() => alive && use(wordsArt(el, rows, fam), 1));
      }
      return it;
    });
    const size = () => {
      W = Math.max(1, innerWidth); H = Math.max(1, innerHeight);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.z = W >= 768 ? 3.5 : 5;
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const progress = () => {
      if (whole) return (scroller ? scroller.scrollTop : scrollY) / (H * 5);
      const r = el.getBoundingClientRect();
      return -(r.top - H) / (r.height + H);
    };
    const place = () => {
      const e = progress();
      items.forEach((it) => {
        const t = e * it.speed - it.offset;
        it.mesh.visible = it.ready && t >= 0 && t <= 1;
        if (it.mesh.visible) it.mat.uniforms.uShift.value.set(-it.turns * 0.5 + it.turnOffset + it.turns * t, -2.7 + 5.4 * t);
      });
      dirty = true;
    };
    const pointer = new T.Vector2(), eased = new T.Vector2();
    const onMove = (ev) => { pointer.set((ev.clientX / W) * 2 - 1, -(ev.clientY / H) * 2 + 1); dirty = true; };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (eased.distanceTo(pointer) > 0.01) {
        eased.lerp(pointer, follow);
        dolly.rotation.set(eased.y * tilt, eased.x * -tilt, 0);
        dirty = true;
      }
      if (!dirty) return;
      dirty = false;
      dolly.updateMatrixWorld(true);
      lightView.copy(light).transformDirection(camera.matrixWorldInverse);
      renderer.render(scene, camera);
    };
    const target = scroller || window;
    target.addEventListener("scroll", place, { passive: true });
    addEventListener("resize", size);
    if (hover && !reduce) addEventListener("pointermove", onMove);
    size();
    place();
    renderer.compile(scene, camera);
    loop();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", place);
      removeEventListener("resize", size);
      removeEventListener("pointermove", onMove);
      items.forEach((it) => { it.mat.uniforms.uMap.value?.dispose(); it.mat.dispose(); it.mesh.geometry.dispose(); });
      renderer.dispose();
      cv.remove();
    };
  });
})();
