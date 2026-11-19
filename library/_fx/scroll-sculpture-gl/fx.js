(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rgbOf = (el, name, fallback) => {
    const p = document.createElement("span"); p.style.cssText = `display:none;color:var(${name}, ${fallback})`;
    el.appendChild(p); const c = getComputedStyle(p).color; p.remove();
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const g = cv.getContext("2d"); g.fillStyle = c; g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const roundRect = (T, w, h, r) => {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  // Our shapes — same silhouette proportions instead of the original models: ring (thick torus) · half circle (C) · bar (rounded box) · glasses (two lenses + temples)
  const shapes = {
    ring: (T) => new T.TorusGeometry(1, 0.42, 48, 160),
    arc: (T) => { const g = new T.TorusGeometry(1, 0.34, 48, 120, Math.PI * 1.08); g.rotateZ(Math.PI * 0.46); return g; },
    bar: (T) => { const g = new T.ExtrudeGeometry(roundRect(T, 2.4, 0.62, 0.12), { depth: 0.62, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 6, curveSegments: 12 }); g.center(); return g; },
    glasses: (T) => {
      const parts = [];
      const rim = (x) => { const g = new T.TorusGeometry(0.62, 0.06, 20, 96); g.scale(1, 0.86, 1); g.translate(x, 0, 0); return g; };
      parts.push(rim(-0.74), rim(0.74));
      const lens = (x) => { const g = new T.CircleGeometry(0.6, 64); g.scale(1, 0.86, 1); g.translate(x, 0, -0.01); return g; };
      parts.push(lens(-0.74), lens(0.74));
      const bridge = new T.TorusGeometry(0.16, 0.035, 12, 32, Math.PI); bridge.translate(0, 0.32, 0); parts.push(bridge);
      const temple = (x) => { const g = new T.CylinderGeometry(0.035, 0.03, 1.9, 12); g.rotateX(Math.PI / 2); g.translate(x, 0.18, -0.95); return g; };
      parts.push(temple(-1.33), temple(1.33));
      return parts;
    },
  };

  kfFx.register("scroll-sculpture-gl", (el, { options, reduce, hover, scroller }) => {
    const T = window.THREE;
    const stages = [...el.querySelectorAll('[data-fx-part="stage"]')];
    if (!T || !window.gsap || !window.ScrollTrigger || !stages.length) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
    gsap.registerPlugin(ScrollTrigger);
    const tiltAmt = +(options.tilt ?? 0.12), spin = +(options.spin ?? 0.06), sway = +(options.sway ?? 0), enter = reduce ? 0 : +(options.enter ?? 0);

    const canvas = document.createElement("canvas");
    canvas.className = "fx-sculpture-canvas"; canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    // Reflection environment — three elongated light panels in a dark room, baked with PMREM (white streak reflections on black glossy metal)
    const pm = new T.PMREMGenerator(renderer);
    const room = new T.Scene();
    const glowMat = new T.MeshBasicMaterial({ color: new T.Color(...rgbOf(el, "--fx-light", "var(--kf-ink)")).multiplyScalar(3), side: T.DoubleSide });
    [[0, 4, 0, 6, 1.2, -Math.PI / 2, 0], [-5, 1, 2, 1, 5, 0, Math.PI / 2], [5, -1, -2, 0.6, 4, 0, -Math.PI / 2]].forEach(([x, y, z, w, h, rx, ry]) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), glowMat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); room.add(m);
    });
    const env = pm.fromScene(room, 0.04).texture;
    scene.environment = env;
    const base = new T.Color(...rgbOf(el, "--fx-metal", "var(--kf-bg)"));
    const mat = new T.MeshPhysicalMaterial({ color: base, metalness: 0.92, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.18, envMapIntensity: 1.25 });
    const lensMat = new T.MeshPhysicalMaterial({ color: base, metalness: 0.2, roughness: 0.06, transmission: 0, transparent: true, opacity: 0.92, clearcoat: 1, envMapIntensity: 1.6 });

    const holder = new T.Group(); scene.add(holder);
    const made = {};
    const build = (name) => {
      if (made[name]) return made[name];
      const g = new T.Group(), geo = shapes[name] ? shapes[name](T) : shapes.ring(T);
      (Array.isArray(geo) ? geo : [geo]).forEach((p) => g.add(new T.Mesh(p, p.type === "CircleGeometry" ? lensMat : mat)));
      g.visible = false; holder.add(g); made[name] = g; return g;
    };

    // Each section takes position·size·rotation for enter → exit via data-from / data-to (keys: x y z s rx ry rz o, x·y as ratios of screen width·height)
    const parse = (s) => { const o = {}; String(s || "").split(";").forEach((kv) => { const [k, v] = kv.split(":").map((t) => t && t.trim()); if (k && v != null && v !== "") o[k] = +v; }); return o; };
    const D = { x: 0, y: 0, z: 0, s: 1, rx: 0, ry: 0, rz: 0, o: 1 };
    const state = { ...D };
    let W = 1, H = 1, vw = 1, vh = 1;
    const size = () => {
      W = Math.max(1, innerWidth); H = Math.max(1, innerHeight);
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      vh = 2 * camera.position.z * Math.tan(T.MathUtils.degToRad(camera.fov / 2)); vw = vh * camera.aspect;
    };
    size();
    const triggers = [];
    let active = null;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 0px)", () => {
      stages.forEach((st) => {
        const shape = st.dataset.shape || "ring", obj = build(shape);
        const from = { ...D, ...parse(st.dataset.from) }, to = { ...D, ...parse(st.dataset.to ?? st.dataset.from) };
        const narrow = matchMedia("(max-width: 767px)").matches;
        if (narrow && st.dataset.mfrom) Object.assign(from, parse(st.dataset.mfrom));
        if (narrow && st.dataset.mto) Object.assign(to, parse(st.dataset.mto));
        const ease = st.dataset.ease || "none";
        const tween = gsap.parseEase(ease) || ((t) => t);
        triggers.push(ScrollTrigger.create({
          trigger: st, scroller, start: st.dataset.start || "top center", end: st.dataset.end || "bottom center", scrub: reduce ? false : +(options.scrub ?? 0.48),
          onUpdate: (self) => {
            active = obj;
            const t = tween(reduce ? 0.5 : self.progress);
            for (const k in D) state[k] = lerp(from[k], to[k], t);
            Object.values(made).forEach((m) => { m.visible = m === obj; });
          },
          // Hides the form when leaving the section — the next section takes over, or nothing shows in the gap between sections (with data-keep it stays in its end shape)
          // In sections with data-front, raise the canvas above the text — the shape passes in front of the big letters and hides them
          onToggle: (self) => {
            if (self.isActive) { active = obj; Object.values(made).forEach((m) => { m.visible = m === obj; }); canvas.style.zIndex = st.dataset.front !== undefined ? "3" : ""; }
            else if (active === obj && st.dataset.keep === undefined) { active = null; canvas.style.zIndex = ""; }
          },
        }));
      });
      ScrollTrigger.refresh();
      // If the first section starts at the top (start 0), no on signal arrives before scrolling — set up the section straddling the current position right away
      triggers.forEach((t) => {
        const y = t.scroll();
        if (y >= t.start && y <= t.end) { t.vars.onUpdate(t); t.vars.onToggle({ isActive: true }); }
      });
    });

    const cur = { x: 0, y: 0 };
    const onMove = (e) => gsap.to(cur, { x: (e.clientX / W) * 2 - 1, y: (e.clientY / H) * 2 - 1, duration: 1.2, ease: "power3.out", overwrite: true });
    if (hover && !reduce) addEventListener("pointermove", onMove);
    const onResize = () => { size(); ScrollTrigger.refresh(); };
    addEventListener("resize", onResize);

    // enter: the form that was tilted at the moment of opening settles into pose with expo.out — mostly upright in the first 1 second, the rest settles unnoticeably
    const intro = { k: enter > 0 ? 1 : 0 };
    if (enter > 0) gsap.to(intro, { k: 0, duration: enter, ease: "expo.out" });
    let raf = 0, t0 = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000;
      holder.position.set(state.x * vw * 0.5, -state.y * vh * 0.5, state.z);
      holder.scale.setScalar(Math.max(0.0001, state.s));
      // sway: floats in place, swaying slowly (the breath of a non-rotating form)
      const sw = reduce ? 0 : sway;
      holder.rotation.set(state.rx + cur.y * tiltAmt + Math.sin(t * 0.37) * sw * 0.5 + intro.k * 0.18, state.ry + cur.x * tiltAmt + (reduce ? 0 : t * spin) + Math.sin(t * 0.5) * sw - intro.k * 0.5, state.rz);
      holder.position.y += Math.sin(t * 0.6) * sw * 0.3;
      mat.opacity = state.o; mat.transparent = state.o < 1;
      holder.visible = state.o > 0.01 && !!active;
      renderer.render(scene, camera);
    };
    renderer.compile(scene, camera);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); mm.revert(); triggers.forEach((s) => s.kill());
      removeEventListener("pointermove", onMove); removeEventListener("resize", onResize);
      gsap.killTweensOf([cur, intro]);
      scene.traverse((o) => o.geometry && o.geometry.dispose());
      mat.dispose(); lensMat.dispose(); env.dispose(); pm.dispose(); renderer.dispose(); renderer.forceContextLoss();
      canvas.remove();
    };
  });
})();
