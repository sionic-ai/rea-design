// Stands one 3D object in the center of the panel (egg body + petal tube + two goggles, or three fuzzy petals), with a tilted ring of sentences orbiting around it.
// The ring has two layers, outer and inner face, so text turned to the back isn’t mirrored, and by depth it is hidden while passing behind the object.
(() => {
  const css = (el, name, fallback) => getComputedStyle(el).getPropertyValue(name).trim() || fallback;
  // Even if skin values are oklch() or color-mix(), paints them into one canvas pixel and reads sRGB so three can read it
  let probe;
  const rgb = (T, str) => {
    probe = probe || document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = str;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };

  function petalsGeometry(T, bump) {
    const parts = [];
    [-0.95, 0, 0.95].forEach((a, i) => {
      const g = new T.SphereGeometry(0.62, 72, 56);
      g.scale(0.62, 1, 0.5);
      const p = g.attributes.position, n = new T.Vector3();
      for (let k = 0; k < p.count; k++) {
        n.fromBufferAttribute(p, k);
        const d = 1 + bump * Math.sin(n.x * 38) * Math.sin(n.y * 34) * Math.sin(n.z * 40 + i);
        p.setXYZ(k, n.x * d, n.y * d, n.z * d);
      }
      g.translate(0, 0.62, 0);
      g.rotateZ(-a);
      g.translate(0, i === 1 ? -0.12 : -0.3, 0);
      g.computeVertexNormals();
      parts.push(g);
    });
    return parts;
  }

  function eggGeometry(T) {
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48, y = -1 + 2 * t;
      const r = Math.sqrt(Math.max(0, 1 - y * y)) * (0.78 - 0.16 * y);
      pts.push(new T.Vector2(Math.max(0.0001, r), y * 1.08));
    }
    return new T.LatheGeometry(pts, 96);
  }

  function ringTexture(T, text, color, font, h, circ) {
    const H = 96, W = Math.min(8192, Math.round(H * circ / h));
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.font = `700 ${Math.round(H * 0.68)}px ${font}`;
    x.textBaseline = "middle";
    x.fillStyle = color;
    const unit = x.measureText(text).width || 1;
    const n = Math.max(1, Math.round(W / unit));
    const gap = (W - unit * n) / n;
    for (let i = 0; i < n; i++) x.fillText(text, i * (unit + gap) + gap / 2, H * 0.54);
    const tex = new T.CanvasTexture(c);
    tex.wrapS = T.RepeatWrapping;
    tex.anisotropy = 4;
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }

  kfFx.register("orbit-ring-3d", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T || !T.WebGLRenderer) return;
    const shape = options.shape || "egg";
    const text = (options.text || el.getAttribute("aria-label") || "").trim();
    const ringOn = text && options.ring !== "0";
    const radius = +(options.radius ?? 1.55);
    const band = +(options.band ?? 0.2);
    const tilt = +(options.tilt ?? 30) * Math.PI / 180;
    const roll = +(options.roll ?? -12) * Math.PI / 180;
    const turn = +(options.turn ?? 24);
    const spin = +(options.spin ?? 14);
    const bob = +(options.bob ?? 0.06);
    const size = +(options.size ?? 1);
    const lift = +(options.y ?? 0), ringLift = +(options["ring-y"] ?? 0);
    // With fps given, it draws only at that rate — slow loops and jitter look the same at 30 and free up time for hand response
    const fps = +(options.fps || 0), gap = fps ? 1000 / fps - 2 : 0;
    const sep = options.sep ?? " / ";

    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(canvas);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.1, 7.2);

    const ink = getComputedStyle(el).color;
    const body = rgb(T, css(el, "--fx-body", css(el, "--kf-raised", ink)));
    const rim = rgb(T, css(el, "--fx-rim", css(el, "--kf-accent", ink)));
    const key = rgb(T, css(el, "--fx-key", css(el, "--kf-ink", ink)));
    scene.add(new T.HemisphereLight(key, body, 0.9));
    const sun = new T.DirectionalLight(key, 2.2); sun.position.set(2.5, 3, 4); scene.add(sun);
    const back = new T.PointLight(rim, 30, 12); back.position.set(-2.6, 1.2, -1.8); scene.add(back);
    const under = new T.PointLight(rim, 14, 10); under.position.set(2.2, -2.4, 1.5); scene.add(under);

    const fig = new T.Group();
    const geos = [], mats = [];
    const gloss = new T.MeshStandardMaterial({ color: body, roughness: shape === "petals" ? 0.78 : 0.22, metalness: shape === "petals" ? 0 : 0.35 });
    mats.push(gloss);
    if (shape === "petals") {
      petalsGeometry(T, 0.035).forEach((g) => { geos.push(g); fig.add(new T.Mesh(g, gloss)); });
    } else {
      const egg = eggGeometry(T); geos.push(egg);
      fig.add(new T.Mesh(egg, gloss));
      const crown = options.crown === "rim" ? new T.MeshStandardMaterial({ color: rim, roughness: 0.55, metalness: 0.05 }) : gloss;
      if (crown !== gloss) mats.push(crown);
      petalsGeometry(T, 0.02).forEach((g) => { g.scale(0.34, 0.34, 0.34); g.translate(0, 1.08, 0); geos.push(g); fig.add(new T.Mesh(g, crown)); });
      const steel = new T.MeshStandardMaterial({ color: key, roughness: 0.18, metalness: 0.9 });
      mats.push(steel);
      const wingG = new T.SphereGeometry(0.5, 40, 24); wingG.scale(0.28, 0.95, 0.5); geos.push(wingG);
      [-1, 1].forEach((side) => { const w = new T.Mesh(wingG, gloss); w.position.set(side * 0.78, -0.12, -0.05); w.rotation.z = side * 0.75; fig.add(w); });
      const chain = new T.CatmullRomCurve3([new T.Vector3(-0.3, 0.05, 0.74), new T.Vector3(-0.12, -0.42, 0.8), new T.Vector3(0.12, -0.44, 0.8), new T.Vector3(0.36, 0.0, 0.72)]);
      const chainG = new T.TubeGeometry(chain, 48, 0.022, 8, false); geos.push(chainG);
      fig.add(new T.Mesh(chainG, steel));
      const ringG = new T.TorusGeometry(0.17, 0.05, 20, 48); geos.push(ringG);
      [-0.22, 0.22].forEach((x) => { const m = new T.Mesh(ringG, steel); m.position.set(x, 0.48, 0.66); m.rotation.y = x * 0.9; fig.add(m); });
    }
    fig.scale.setScalar(size);
    const hold = new T.Group(); hold.position.y = lift; hold.add(fig);
    scene.add(hold);

    let ring = null, tex = null;
    if (ringOn) {
      const color = getComputedStyle(el).color;
      const font = css(el, "--kf-font-display", "sans-serif");
      const circ = 2 * Math.PI * radius;
      tex = ringTexture(T, text + sep, color, font, band, circ);
      const inner = tex.clone(); inner.needsUpdate = true; inner.repeat.x = -1;
      const g = new T.CylinderGeometry(radius, radius, band, 160, 1, true); geos.push(g);
      const outM = new T.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.35, side: T.FrontSide });
      const inM = new T.MeshBasicMaterial({ map: inner, transparent: true, alphaTest: 0.35, side: T.BackSide });
      mats.push(outM, inM);
      ring = new T.Group();
      const spinGroup = new T.Group();
      spinGroup.add(new T.Mesh(g, outM), new T.Mesh(g, inM));
      ring.add(spinGroup);
      ring.rotation.set(tilt, 0, roll);
      ring.position.y = ringLift;
      ring.userData.spin = spinGroup;
      scene.add(ring);
    }

    const fit = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // On narrow panels the ring backs off so it doesn’t leave the panel
      camera.position.z = 7.2 * Math.max(1, 0.82 / Math.min(1, camera.aspect));
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);

    let raf = 0, last = 0, t = 0, seen = true;
    const draw = (dt) => {
      t += dt;
      if (ring) ring.userData.spin.rotation.y = -(t / turn) * Math.PI * 2;
      fig.rotation.y = Math.sin((t / spin) * Math.PI * 2) * 0.45;
      fig.position.y = Math.sin((t / 3.2) * Math.PI * 2) * bob;
      renderer.render(scene, camera);
    };
    const tick = (now) => {
      raf = 0;
      if (gap && last && now - last < gap) { if (seen) raf = requestAnimationFrame(tick); return; }
      // If a window covering the panel is open (<html class="fx-hold">) do not draw it — it is hidden and unseen, and drawing it slows the response when the window is opened
      if (document.documentElement.classList.contains("fx-hold")) { last = now; if (seen) raf = requestAnimationFrame(tick); return; }
      if (!last) last = now;
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      draw(Math.min(dt, 0.05));
      if (seen) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf && !reduce) { last = 0; raf = requestAnimationFrame(tick); }
    });
    io.observe(el);
    if (reduce) draw(0); else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => { m.map?.dispose(); m.dispose(); });
      tex?.dispose();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
