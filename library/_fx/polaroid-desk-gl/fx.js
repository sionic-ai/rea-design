(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const css = (el, name, fallback) => {
    const probe = document.createElement("span");
    probe.style.cssText = `display:none;color:var(${name}, ${fallback})`;
    el.appendChild(probe);
    const c = getComputedStyle(probe).color; probe.remove();
    return c;
  };
  const rgbOf = (color) => {
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const g = c.getContext("2d"); g.fillStyle = color; g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const seeded = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const shadeOf = (rgb, k) => `rgb(${rgb.map((v) => Math.round(clamp(v * k, 0, 1) * 255)).join(",")})`;

  // Plaster or static mat texture — creates light and dark stains, cracks and edge shading from a single base color
  const drawFloor = (w, h, base, look, seed) => {
    const rnd = seeded(seed);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = shadeOf(base, 1); g.fillRect(0, 0, w, h);
    if (look === "mat") {
      g.strokeStyle = shadeOf(base, 1.18); g.lineWidth = 1;
      const step = w / 48;
      for (let x = 0; x <= w; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (let y = 0; y <= h; y += step) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      for (let i = 0; i < 9000; i++) { g.fillStyle = shadeOf(base, 0.85 + rnd() * 0.3); g.fillRect(rnd() * w, rnd() * h, 1.2, 1.2); }
      return c;
    }
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w, y = rnd() * h, r = (40 + rnd() * 220) * (w / 2048);
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const k = rnd() < 0.5 ? 0.86 : 1.1;
      gr.addColorStop(0, shadeOf(base, k)); gr.addColorStop(1, shadeOf(base, 1).replace("rgb", "rgba").replace(")", ",0)"));
      g.globalAlpha = 0.35; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 30000; i++) { g.fillStyle = shadeOf(base, 0.9 + rnd() * 0.2); const s = rnd() * 1.6 + 0.5; g.fillRect(rnd() * w, rnd() * h, s, s); }
    for (let i = 0; i < 900; i++) { g.fillStyle = shadeOf(base, rnd() < 0.5 ? 0.72 : 1.22); g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    g.strokeStyle = shadeOf(base, 0.7); g.lineCap = "round"; g.globalAlpha = 0.8;
    for (let i = 0; i < 7; i++) {
      let x = rnd() * w, y = rnd() * h, a = rnd() * Math.PI * 2;
      g.lineWidth = 0.6 + rnd() * 0.8; g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 26; j++) { a += (rnd() - 0.5) * 0.7; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); }
      g.stroke();
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 18; i++) {
      const x = rnd() * w, y = rnd() * h, r = 3 + rnd() * 10;
      g.fillStyle = shadeOf(base, 1.25); g.beginPath();
      for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, rr = r * (0.5 + rnd() * 0.6); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.fill();
    }
    return c;
  };

  const roundRect = (T, w, h, r) => {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const ringShape = (T, ow, oh, or, iw, ih, ir) => {
    const s = roundRect(T, ow, oh, or), hole = roundRect(T, iw, ih, ir);
    s.holes.push(new T.Path(hole.getPoints(12).reverse()));
    return s;
  };

  kfFx.register("polaroid-desk-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const cardEls = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!T || !window.gsap) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

    const thomas = kfFx.ease(".625,.05,0,1", "expo.inOut");
    const opt = (k, d) => (options[k] ?? d);
    const camH = +opt("height", 6.4), fov = +opt("fov", 32), amount = +opt("parallax", 0.2), look = +opt("look", 0.28);
    const size = +opt("size", 0.104), msize = +opt("msize", 0.29), aspect = +opt("aspect", 0.8), lookFloor = String(opt("look-floor", opt("floor", "plaster")));
    const introMode = String(opt("intro", "now")), zoom = +opt("zoom", 0.65), introDur = +opt("dur", 2.1);
    const wind = String(opt("wind", "on")) !== "off", openDur = +opt("open", 0.7);
    const rimK = +opt("rim", 0.05), titleOn = String(opt("title", "off")) !== "off", captionStyle = String(opt("caption", "hand"));

    const canvas = document.createElement("canvas");
    canvas.className = "fx-desk-canvas"; canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    el.classList.add("fx-desk-on");
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 40);
    camera.up.set(0, 0, -1);

    const ambient = new T.AmbientLight(new T.Color(1, 0.97, 0.94), 1.05);
    const key = new T.DirectionalLight(new T.Color(1, 0.96, 0.9), 2.1);
    key.position.set(3.4, 6, -4.5); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 0.8; key.shadow.camera.far = 23.5;
    Object.assign(key.shadow.camera, { left: -6.5, right: 6.5, top: 6.5, bottom: -6.5 });
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
    const fill = new T.DirectionalLight(new T.Color(0.9, 0.92, 0.96), 0.22);
    fill.position.set(-4.2, 5.5, -3.1);
    scene.add(ambient, key, fill);

    let colors = {};
    const readColors = () => {
      colors = {
        floor: rgbOf(css(el, "--fx-floor", "var(--kf-surface)")),
        paper: css(el, "--fx-paper", "var(--kf-raised)"),
        photo: css(el, "--fx-photo", "color-mix(in oklab, var(--kf-ink) 30%, var(--kf-bg))"),
        photoInk: css(el, "--fx-photo-ink", "var(--kf-bg)"),
        caption: css(el, "--fx-caption", "var(--kf-line)"),
        glow: rgbOf(css(el, "--fx-glow", "var(--kf-accent)")),
        title: css(el, "--fx-title", "var(--kf-ink)"),
      };
      scene.background = new T.Color(...colors.floor.map((v) => v * 0.5));
    };
    readColors();
    const cs = getComputedStyle(el);
    const handFont = (cs.getPropertyValue("--kf-font-hand") || "").trim() || (cs.getPropertyValue("--kf-font-display") || "").trim() || "cursive";
    const sansFont = (cs.getPropertyValue("--kf-font-sans") || "").trim() || "sans-serif";
    const displayFont = (cs.getPropertyValue("--kf-font-display") || "").trim() || "sans-serif";

    const floorTex = new T.CanvasTexture(drawFloor(2048, 1280, colors.floor, lookFloor, 7));
    floorTex.colorSpace = T.SRGBColorSpace; floorTex.anisotropy = 8;
    const floorMat = new T.MeshStandardMaterial({ map: floorTex, bumpMap: floorTex, bumpScale: 1.2, roughness: 1, metalness: 0 });
    const floor = new T.Mesh(new T.PlaneGeometry(1, 1), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    scene.add(floor);
    const rimMat = floorMat.clone();
    rimMat.color = new T.Color(1.22, 1.2, 1.17);
    // Inner edge shade of the panel — a dark band the walls of the recessed panel cast on the floor, drawn as one sheet fit to the panel size
    const aoCanvas = document.createElement("canvas"); aoCanvas.width = 1024; aoCanvas.height = 1024;
    const aoTex = new T.CanvasTexture(aoCanvas);
    const aoMat = new T.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false, color: new T.Color(...rgbOf(css(el, "--fx-edge", "var(--kf-line)"))) });
    const ao = new T.Mesh(new T.PlaneGeometry(1, 1), aoMat);
    ao.rotation.x = -Math.PI / 2; ao.position.y = 0.0015; ao.renderOrder = 0;
    scene.add(ao);
    const paintAo = (ratio, edge) => {
      const w = 1024, h = Math.round(1024 / ratio); aoCanvas.width = w; aoCanvas.height = h;
      const g = aoCanvas.getContext("2d"), e = edge * w;
      g.clearRect(0, 0, w, h);
      const side = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const gr = g.createLinearGradient(x0, y0, x1, y1);
        gr.addColorStop(0, "rgba(255,255,255,.7)"); gr.addColorStop(0.35, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: shade strength cover (color is --fx-edge) */
        g.fillStyle = gr; g.fillRect(rx, ry, rw, rh);
      };
      side(0, 0, e, 0, 0, 0, e, h); side(w, 0, w - e, 0, w - e, 0, e, h);
      side(0, 0, 0, e, 0, 0, w, e); side(0, h, 0, h - e, 0, h - e, w, e);
      aoTex.needsUpdate = true;
    };
    let rim = null, well = null, wellGlow = null, wellZone = null;
    const wellEl = el.querySelector('[data-fx-part="well"]');
    const wellMat = new T.MeshStandardMaterial({ map: floorTex, roughness: 1, color: new T.Color(0.84, 0.82, 0.8) });
    const glowMat = new T.MeshBasicMaterial({ color: new T.Color(...colors.glow), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });

    let W = 1, H = 1, viewW = 1, viewH = 1, mobile = false;
    const toWorld = (fx, fy) => ({ x: (fx - 0.5) * viewW, z: (fy - 0.5) * viewH });
    const px = (v) => (v / W) * viewW;

    const cards = cardEls.map((a, i) => {
      const root = new T.Group(), lift = new T.Group(), tilt = new T.Group();
      root.add(lift); lift.add(tilt); scene.add(root);
      const tex = new T.CanvasTexture(document.createElement("canvas"));
      tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
      const side = new T.MeshStandardMaterial({ roughness: 0.9 });
      const top = new T.MeshStandardMaterial({ map: tex, roughness: 0.75 });
      const mesh = new T.Mesh(new T.BoxGeometry(1, 0.008, 1), [side, side, top, side, side, side]);
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.index = i;
      tilt.add(mesh);
      return { a, i, root, lift, tilt, mesh, tex, side, aspect: +(a.dataset.aspect || aspect) || aspect, home: { x: 0, z: 0, yaw: 0 }, vel: { x: 0, z: 0, spin: 0 }, free: false, hop: { y: 0 }, w: 1, h: 1, still: 0 };
    });

    const paintCard = (c) => {
      const cw = 512, ch = Math.round(512 / c.aspect), g = c.tex.image.getContext ? c.tex.image : null;
      const cvs = g || document.createElement("canvas"); cvs.width = cw; cvs.height = ch;
      const x = cvs.getContext("2d");
      x.fillStyle = colors.paper; x.fillRect(0, 0, cw, ch);
      const rnd = seeded(31 + c.i * 17);
      for (let k = 0; k < 5; k++) {
        const sx = rnd() * cw, sy = rnd() * ch, r = 40 + rnd() * 120, gr = x.createRadialGradient(sx, sy, 0, sx, sy, r);
        gr.addColorStop(0, colors.caption); gr.addColorStop(1, colors.paper);
        x.globalAlpha = 0.05; x.fillStyle = gr; x.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
      x.globalAlpha = 1;
      const m = cw * 0.065, pw = cw - m * 2, ph = Math.min(pw * 0.98, ch - m - Math.max(56, ch * 0.18));
      x.fillStyle = colors.photo; x.fillRect(m, m, pw, ph);
      const gr = x.createLinearGradient(m, m, m + pw, m + ph);
      gr.addColorStop(0, colors.photoInk); gr.addColorStop(1, colors.photo);
      x.globalAlpha = 0.28; x.fillStyle = gr; x.fillRect(m, m, pw, ph); x.globalAlpha = 1;
      x.strokeStyle = colors.photoInk; x.globalAlpha = 0.35; x.lineWidth = 2;
      x.beginPath(); x.moveTo(m, m); x.lineTo(m + pw, m + ph); x.moveTo(m + pw, m); x.lineTo(m, m + ph); x.stroke(); x.globalAlpha = 1;
      const label = c.a.dataset.label || "";
      if (label) {
        x.fillStyle = colors.photoInk; x.font = `500 22px ${sansFont}`; x.textAlign = "center"; x.textBaseline = "middle";
        const words = label.split(" · ");
        words.forEach((wd, k) => x.fillText(wd, cw / 2, m + ph / 2 + (k - (words.length - 1) / 2) * 30, pw - 24));
      }
      const cap = c.a.dataset.caption || "";
      if (cap && captionStyle === "sans") {
        x.fillStyle = colors.caption; x.font = `500 17px ${sansFont}`; x.textAlign = "left"; x.textBaseline = "middle";
        x.fillText(cap, m + 4, m + ph + (ch - m - ph) * 0.42, pw);
      } else if (cap) {
        x.fillStyle = colors.caption; x.font = `400 40px ${handFont}`; x.textAlign = "center"; x.textBaseline = "middle";
        x.save(); x.translate(cw / 2, m + ph + (ch - m - ph) / 2); x.rotate((rnd() - 0.5) * 0.08); x.fillText(cap, 0, 0, pw); x.restore();
      }
      if (!g) c.tex.image = cvs;
      c.tex.needsUpdate = true;
      c.side.color = new T.Color(...rgbOf(colors.paper));
    };
    const paintAll = () => cards.forEach(paintCard);
    paintAll();
    // Fonts used only on canvas aren’t loaded by the document, so load them directly and then redraw
    if (document.fonts?.load) Promise.all([`400 40px ${handFont}`, `500 22px ${sansFont}`, `700 300px ${displayFont}`].map((f) => document.fonts.load(f).catch(() => null))).then(() => { paintAll(); titlePaint(); });

    // Big work name text — a board right above the floor, so the polaroid covers it and the shadow·leaf shadow fall together
    let title = null, titleTex = null, titleText = "";
    const titleState = { t: 0 };
    const titlePaint = () => {
      if (!title) return;
      const cvs = titleTex.image, x = cvs.getContext("2d");
      x.clearRect(0, 0, cvs.width, cvs.height);
      x.fillStyle = colors.title; x.textAlign = "center"; x.textBaseline = "middle";
      let f = 300; x.font = `700 ${f}px ${displayFont}`;
      if ("letterSpacing" in x) x.letterSpacing = `${-0.05 * f}px`;
      const wmax = cvs.width * 0.98, mw = x.measureText(titleText.toUpperCase()).width;
      if (mw > wmax) { f = Math.floor((f * wmax) / mw); x.font = `700 ${f}px ${displayFont}`; if ("letterSpacing" in x) x.letterSpacing = `${-0.05 * f}px`; }
      x.fillText(titleText.toUpperCase(), cvs.width / 2, cvs.height / 2);
      titleTex.needsUpdate = true;
    };
    if (titleOn) {
      const cvs = document.createElement("canvas"); cvs.width = 2048; cvs.height = 400;
      titleTex = new T.CanvasTexture(cvs); titleTex.colorSpace = T.SRGBColorSpace; titleTex.anisotropy = 8;
      title = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshStandardMaterial({ map: titleTex, transparent: true, roughness: 1, depthWrite: false }));
      title.rotation.x = -Math.PI / 2; title.receiveShadow = true; title.renderOrder = 1;
      scene.add(title);
      titleText = cardEls[0]?.dataset.title || "";
      titlePaint();
      title.material.opacity = 1; titleState.t = 1;
    }
    const showTitle = (text) => {
      if (!title || !text) return;
      if (text === titleText && titleState.t > 0.5) return;
      const travel = 0.2;
      gsap.to(titleState, { t: 0, duration: reduce ? 0 : 0.15, ease: thomas, overwrite: true, onComplete: () => {
        titleText = text; titlePaint();
        gsap.fromTo(titleState, { t: 0 }, { t: 1, duration: reduce ? 0 : 0.3, ease: thomas });
      } });
      titleState.travel = travel;
    };

    const layout = () => {
      const r = el.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      mobile = W < 768;
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      viewH = 2 * camH * Math.tan(T.MathUtils.degToRad(fov / 2)); viewW = viewH * camera.aspect;
      floor.scale.set(viewW * 1.8, viewH * 1.8, 1);
      floorTex.repeat.set(1, 1);
      const rimPx = rimK * Math.min(W, H), rw = px(rimPx), rr = px(rimPx * 0.7);
      if (rim) { scene.remove(rim); rim.geometry.dispose(); }
      const geo = new T.ExtrudeGeometry(ringShape(T, viewW * 1.8, viewH * 1.8, 0.01, viewW - rw * 2, viewH - rw * 2, rr), { depth: 0.11, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4, curveSegments: 10 });
      rim = new T.Mesh(geo, rimMat); rim.rotation.x = -Math.PI / 2; rim.castShadow = true; rim.receiveShadow = true;
      scene.add(rim);
      ao.scale.set(viewW - rw * 2, viewH - rw * 2, 1);
      paintAo((viewW - rw * 2) / (viewH - rw * 2), Math.min(0.2, 46 / Math.max(1, W - rimPx * 2)));
      if (wellEl) {
        const d = wellEl.dataset, k = mobile ? "m" : "";
        const wx = +(d[k ? "mx" : "x"] ?? d.x ?? 0.86), wy = +(d[k ? "my" : "y"] ?? d.y ?? 0.77);
        const ww = +(d[k ? "mw" : "w"] ?? d.w ?? 0.15) * viewW, wh = +(d[k ? "mh" : "h"] ?? d.h ?? 0.31) * viewH;
        const p = toWorld(wx, wy);
        wellZone = { x: p.x, z: p.z, width: ww, height: wh };
        if (well) { well.parent.remove(well); well.children.forEach((m) => m.geometry.dispose()); }
        well = new T.Group(); well.position.set(p.x, 0, p.z);
        const lip = px(Math.min(W, H) * 0.012), r0 = Math.min(ww, wh) * 0.12;
        const outer = new T.Mesh(new T.ExtrudeGeometry(ringShape(T, ww, wh, r0, ww - lip * 2, wh - lip * 2, r0 * 0.8), { depth: 0.022, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 8 }), rimMat);
        outer.rotation.x = -Math.PI / 2; outer.castShadow = true; outer.receiveShadow = true;
        const inner = new T.Mesh(new T.ShapeGeometry(roundRect(T, ww - lip * 2, wh - lip * 2, r0 * 0.8), 8), wellMat);
        inner.rotation.x = -Math.PI / 2; inner.position.y = 0.001; inner.receiveShadow = true;
        const lip2 = new T.Mesh(new T.ExtrudeGeometry(ringShape(T, ww - lip * 4, wh - lip * 4, r0 * 0.7, ww - lip * 5, wh - lip * 5, r0 * 0.65), { depth: 0.01, bevelEnabled: false, curveSegments: 8 }), rimMat);
        lip2.rotation.x = -Math.PI / 2; lip2.castShadow = true; lip2.receiveShadow = true;
        wellGlow = new T.Mesh(new T.ShapeGeometry(ringShape(T, ww - lip * 2, wh - lip * 2, r0 * 0.8, ww - lip * 3.4, wh - lip * 3.4, r0 * 0.7), 8), glowMat);
        wellGlow.rotation.x = -Math.PI / 2; wellGlow.position.y = 0.03;
        well.add(outer, inner, lip2, wellGlow);
        scene.add(well);
      }
      cards.forEach((c) => {
        const d = c.a.dataset, k = mobile ? "m" : "";
        const cw = (mobile ? +(d.msize ?? msize) : +(d.size ?? size)) * viewW;
        c.w = cw; c.h = cw / c.aspect;
        c.mesh.scale.set(c.w, 1, c.h);
        const pick = (n) => +(d[k + n] ?? d[n] ?? (n === "r" ? 0 : 0.5));
        const p = toWorld(pick("x"), pick("y"));
        c.home = { x: p.x, z: p.z, yaw: T.MathUtils.degToRad(-pick("r")) };
        if (d.well !== undefined && wellZone) c.home = { x: wellZone.x, z: wellZone.z, yaw: 0 };
        if (!c.free && !c.drag) { c.root.position.set(c.home.x, 0, c.home.z); c.root.rotation.y = c.home.yaw; }
      });
      if (title) {
        const fs = Math.min((viewW - rw * 2) / 5.4, (viewH - rw * 2) * 0.46) * +opt("title-size", 0.53);
        title.scale.set((fs * 2048) / 300, (fs * 400) / 300, 1);
        const tp = toWorld(+opt("title-x", 0.5), +opt("title-y", 0.32));
        title.position.set(tp.x, 0.002, tp.z);
        titleState.baseZ = tp.z;
        // On phones there is no hover, so nothing triggers the name to float up — the original also drops the back name on phones
        title.visible = !mobile;
      }
    };
    const ro = new ResizeObserver(layout); ro.observe(el); layout();

    // Camera: looks down from height 6.4 with a 32° field of view, shifts .2 toward the cursor and looks .28 that way (.85s power3.out)
    const cam = { x: 0, z: 0, zoom: 1, lx: 0, lz: 0 };
    const parallaxTo = (nx, ny) => {
      if (reduce) return;
      gsap.to(cam, { x: nx * amount, z: ny * amount, lx: nx * amount * look, lz: ny * amount * look, duration: 0.85, ease: "power3.out", overwrite: "auto" });
    };
    const placeCamera = () => {
      const h = camH / cam.zoom;
      camera.position.set(cam.x, h, cam.z + 0.12);
      camera.lookAt(cam.lx, 0, cam.lz);
      // Expose how far the floor has scrolled off screen as a variable so bottom text like the HUD moves with it
      const shift = ((cam.x - cam.lx) / viewW) * W;
      el.style.setProperty("--fx-desk-x", `${(-shift).toFixed(2)}px`);
      el.style.setProperty("--fx-desk-y", `${(-((cam.z - cam.lz) / viewH) * H).toFixed(2)}px`);
    };

    const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3();
    const pick = (e) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray;
    };
    const floorAt = (e, y = 0) => { plane.constant = -y; pick(e).ray.intersectPlane(plane, hit); return hit; };
    const cardAt = (e) => { const hits = pick(e).intersectObjects(cards.map((c) => c.mesh), false); return hits.length ? cards[hits[0].object.userData.index] : null; };

    const inside = (x, z, c) => {
      const lim = px(rimK * Math.min(W, H));
      return { x: clamp(x, -viewW / 2 + lim + c.w / 2, viewW / 2 - lim - c.w / 2), z: clamp(z, -viewH / 2 + (rimK * Math.min(W, H) / H) * viewH + c.h / 2, viewH / 2 - (rimK * Math.min(W, H) / H) * viewH - c.h / 2) };
    };
    const inWell = (x, z, latched) => {
      if (!wellZone) return false;
      const d = Math.hypot((x - wellZone.x) / (wellZone.width * 0.42), (z - wellZone.z) / (wellZone.height * 0.42));
      return latched ? d <= 1.6 : d <= 1;
    };
    const glow = (on) => gsap.to(glowMat, { opacity: on ? 0.44 : 0, duration: 0.36, ease: thomas, overwrite: true });

    let hovered = null, drag = null, lastMove = null, returnTimer = 0;
    const setHover = (c) => {
      if (c === hovered) return;
      if (hovered && hovered !== drag?.c) gsap.to(hovered.lift.position, { y: 0, duration: 0.4, ease: thomas, overwrite: "auto" });
      hovered = c;
      el.style.cursor = c ? "grab" : "";
      if (c && !drag) {
        gsap.to(c.lift.position, { y: 0.05, duration: 0.4, ease: thomas, overwrite: "auto" });
        if (title) showTitle(c.a.dataset.title || "");
        el.dispatchEvent(new CustomEvent("fx:card-hover", { detail: { index: c.i, title: c.a.dataset.title || "" }, bubbles: true }));
      }
    };
    const open = (c) => {
      if (!wellZone) { el.dispatchEvent(new CustomEvent("fx:open", { detail: { href: c.a.getAttribute("href"), index: c.i }, bubbles: true, cancelable: true })) && c.a.href && (location.href = c.a.href); return; }
      c.free = true;
      const tl = gsap.timeline({ onComplete: () => {
        const go = el.dispatchEvent(new CustomEvent("fx:open", { detail: { href: c.a.getAttribute("href"), index: c.i }, bubbles: true, cancelable: true }));
        if (go && c.a.href) location.href = c.a.href;
      } });
      glow(true);
      tl.to(c.root.position, { x: wellZone.x, z: wellZone.z, duration: reduce ? 0 : openDur, ease: thomas }, 0)
        .to(c.root.rotation, { y: 0, duration: reduce ? 0 : openDur, ease: thomas }, 0)
        .to(c.lift.position, { y: 0.3, duration: reduce ? 0 : openDur * 0.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
        .to(c.tilt.rotation, { x: 0, z: 0, duration: reduce ? 0 : 0.3 }, 0);
    };

    const onDown = (e) => {
      if (e.button !== 0) return;
      const c = cardAt(e);
      if (!c) return;
      e.preventDefault();
      const p = floorAt(e, 0.3);
      drag = { c, id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, ox: c.root.position.x - p.x, oz: c.root.position.z - p.z, tx: c.root.position.x, tz: c.root.position.z, latched: false, vx: 0, vz: 0, lx: e.clientX, ly: e.clientY, lt: performance.now() };
      c.drag = true; c.free = true;
      canvas.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
      gsap.to(c.lift.position, { y: 0.3, duration: reduce ? 0 : 0.4, ease: thomas, overwrite: "auto" });
    };
    const onMove = (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1, ny = (e.clientY / innerHeight) * 2 - 1;
      if (hover) parallaxTo(nx, ny);
      if (drag && e.pointerId === drag.id) {
        if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) drag.moved = true;
        const p = floorAt(e, 0.3), c = drag.c;
        let x = p.x + drag.ox, z = p.z + drag.oz;
        const latched = inWell(x, z, drag.latched);
        if (latched !== drag.latched) { drag.latched = latched; glow(latched); }
        if (latched) { x = wellZone.x + (x - wellZone.x) * 0.08; z = wellZone.z + (z - wellZone.z) * 0.08; }
        const now = performance.now(), dt = Math.max(1, now - drag.lt);
        drag.vx = (e.clientX - drag.lx) / dt; drag.vz = (e.clientY - drag.ly) / dt; drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
        drag.tx = x; drag.tz = z;
        return;
      }
      if (hover) setHover(cardAt(e));
      if (!wind || reduce || !hover) return;
      const now = performance.now();
      if (lastMove) {
        const dt = Math.max(1, now - lastMove.t) / 1000, dx = e.clientX - lastMove.x, dy = e.clientY - lastMove.y, speed = Math.hypot(dx, dy) / dt;
        // When the cursor sweeps past faster than 1000px/s, Polaroids within 160px are pushed by that wind
        if (speed > 1000) {
          const k = Math.pow(clamp((speed - 1000) / 11000, 0, 1), 0.5), len = Math.hypot(dx, dy) || 1;
          cards.forEach((c) => {
            if (c.drag) return;
            const v = new T.Vector3(c.root.position.x, 0, c.root.position.z).project(camera);
            const sx = ((v.x + 1) / 2) * W, sy = ((1 - v.y) / 2) * H;
            const t = clamp(((sx - lastMove.x) * dx + (sy - lastMove.y) * dy) / (len * len), 0, 1);
            const dist = Math.hypot(sx - (lastMove.x + dx * t), sy - (lastMove.y + dy * t));
            if (dist > 160) return;
            const fall = 1 - dist / 160, imp = 0.08 * 6.26 * k * fall;
            c.vel.x += (dx / len) * imp; c.vel.z += (dy / len) * imp;
            c.vel.spin += (((dx / len) * (sy - lastMove.y) - (dy / len) * (sx - lastMove.x)) / 160) * 1.55 * k * fall * -1;
            c.free = true; c.still = 0;
            gsap.to(c.hop, { y: 0.06 * k * fall, duration: 0.2, ease: "sine.out", yoyo: true, repeat: 1, overwrite: true });
          });
          clearTimeout(returnTimer);
          returnTimer = setTimeout(goHome, 5000);
        }
      }
      lastMove = { x: e.clientX, y: e.clientY, t: now };
    };
    const goHome = () => {
      cards.filter((c) => c.free && !c.drag).forEach((c, n) => {
        c.vel.x = c.vel.z = c.vel.spin = 0;
        gsap.to(c.root.position, { x: c.home.x, z: c.home.z, duration: 1.8, delay: n * 0.18, ease: thomas, onComplete: () => { c.free = false; } });
        gsap.to(c.root.rotation, { y: c.home.yaw, duration: 1.8, delay: n * 0.18, ease: thomas });
      });
    };
    const onUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { c, moved, latched } = drag;
      drag = null; c.drag = false;
      el.style.cursor = hovered ? "grab" : "";
      gsap.to(c.tilt.rotation, { x: 0, z: 0, duration: 0.4, ease: thomas });
      if (!moved || latched) { open(c); return; }
      gsap.to(c.lift.position, { y: 0, duration: reduce ? 0 : 0.4, ease: thomas, overwrite: "auto" });
      clearTimeout(returnTimer);
      returnTimer = setTimeout(goHome, 5000);
    };
    const onKey = (e) => {
      if ((e.key === "Enter" || e.key === " ") && document.activeElement && cardEls.includes(document.activeElement)) {
        e.preventDefault(); open(cards[cardEls.indexOf(document.activeElement)]);
      }
    };
    const onLeaveWin = () => { setHover(null); if (hover) parallaxTo(0, 0); };
    canvas.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    document.documentElement.addEventListener("pointerleave", onLeaveWin);
    el.addEventListener("keydown", onKey);

    const frames = new Set();
    let raf = 0, last = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
      if (drag) {
        const c = drag.c, k = 1 - Math.exp(-11.5 * dt);
        c.root.position.x += (drag.tx - c.root.position.x) * k;
        c.root.position.z += (drag.tz - c.root.position.z) * k;
        c.tilt.rotation.x += (clamp(drag.vz * 0.35, -0.35, 0.35) - c.tilt.rotation.x) * k;
        c.tilt.rotation.z += (clamp(-drag.vx * 0.35, -0.35, 0.35) - c.tilt.rotation.z) * k;
        drag.vx *= 0.9; drag.vz *= 0.9;
      }
      cards.forEach((c) => {
        if (c.drag || (!c.vel.x && !c.vel.z && !c.vel.spin)) { c.lift.position.y = Math.max(c.lift.position.y, 0); c.root.position.y = c.hop.y; return; }
        const f = Math.exp(-2.75 * dt);
        c.root.position.x += c.vel.x * dt; c.root.position.z += c.vel.z * dt; c.root.rotation.y += c.vel.spin * dt;
        const p = inside(c.root.position.x, c.root.position.z, c);
        if (p.x !== c.root.position.x) c.vel.x *= -0.4;
        if (p.z !== c.root.position.z) c.vel.z *= -0.4;
        c.root.position.x = p.x; c.root.position.z = p.z; c.root.position.y = c.hop.y;
        c.vel.x *= f; c.vel.z *= f; c.vel.spin *= f;
        if (Math.abs(c.vel.x) + Math.abs(c.vel.z) + Math.abs(c.vel.spin) < 0.002) c.vel.x = c.vel.z = c.vel.spin = 0;
      });
      if (title) {
        title.material.opacity = titleState.t;
        title.position.z = (titleState.baseZ ?? 0);
        title.position.y = 0.002 + (1 - titleState.t) * 0.05;
      }
      if (glowMat.opacity > 0 && !reduce) glowMat.opacity = Math.max(0, glowMat.opacity * (0.86 + 0.14 * Math.sin(now / 1000 * 1.7 * Math.PI)));
      frames.forEach((fn) => fn(dt, now));
      placeCamera();
      renderer.render(scene, camera);
    };
    renderer.compile(scene, camera);

    // Entrance: the camera settles down from .65x zoom (higher) over 2.1s thomas, and polaroids drop at .07 intervals over .7s
    const intro = (full, instant, hold) => {
      if (reduce || instant) {
        cam.zoom = 1; cards.forEach((c) => { c.lift.position.y = 0; c.tilt.rotation.set(0, 0, 0); });
        // hold: only the desk stands, cards drop at .07 stagger in .7s on receiving fx:reveal, and name letters rise in .3s
        if (hold && !reduce) {
          if (title) titleState.t = 0;
          cards.forEach((c) => { c.root.visible = false; });
          el.addEventListener("fx:reveal", () => {
            if (title) gsap.to(titleState, { t: 1, duration: 0.3, ease: thomas });
            cards.forEach((c, n) => {
              c.root.visible = true;
              gsap.fromTo(c.lift.position, { y: 0.42 }, { y: 0, duration: 0.7, ease: thomas, delay: n * 0.07, immediateRender: true });
              gsap.fromTo(c.tilt.rotation, { x: -0.2, z: 0.15 }, { x: 0, z: 0, duration: 0.7, ease: thomas, delay: n * 0.07, immediateRender: true });
            });
          }, { once: true });
        }
        el.dispatchEvent(new CustomEvent("fx:intro-start", { detail: { full: false, hold: !!hold }, bubbles: true }));
        return;
      }
      const tl = gsap.timeline();
      if (full) { cam.zoom = zoom; tl.to(cam, { zoom: 1, duration: introDur, ease: thomas }, 0); }
      // Cards start falling when the camera is nearly landed (3/4 of the entrance)
      const drop = full ? introDur * 0.75 : 0.04;
      cards.forEach((c, n) => {
        tl.fromTo(c.lift.position, { y: 0.42 }, { y: 0, duration: 0.7, ease: thomas, immediateRender: true }, drop + n * 0.07);
        tl.fromTo(c.tilt.rotation, { x: -0.2, z: 0.15 }, { x: 0, z: 0, duration: 0.7, ease: thomas, immediateRender: true }, drop + n * 0.07);
      });
      el.dispatchEvent(new CustomEvent("fx:intro-start", { detail: { full }, bubbles: true }));
    };
    const onIntro = (e) => intro(e.detail?.full !== false, e.detail?.instant === true, e.detail?.hold === true);
    el.addEventListener("fx:intro", onIntro);
    if (introMode === "wait") { cam.zoom = zoom; cards.forEach((c) => { c.lift.position.y = 0.42; }); }
    else if (introMode === "short") intro(false);
    else if (introMode === "full") intro(true);
    const onLeave = () => {
      const tl = gsap.timeline({ onComplete: () => el.dispatchEvent(new CustomEvent("fx:left", { bubbles: true })) });
      if (!reduce) cards.forEach((c, n) => {
        tl.to(c.lift.position, { y: 0.42, duration: 0.7, ease: "power2.in" }, n * 0.05);
        tl.to(c.root.position, { x: c.root.position.x * 1.25, duration: 0.7, ease: "power2.in" }, n * 0.05);
      });
      if (title) tl.to(titleState, { t: 0, duration: reduce ? 0 : 0.3, ease: thomas }, 0);
    };
    el.addEventListener("fx:leave", onLeave);
    const onTheme = () => { readColors(); paintAll(); titlePaint(); glowMat.color = new T.Color(...colors.glow); };
    el.addEventListener("fx:theme", onTheme);

    raf = requestAnimationFrame(tick);
    el.kfDesk = { THREE: T, scene, camera, renderer, toWorld, view: () => ({ w: viewW, h: viewH, W, H, mobile }), px, onFrame: (fn) => (frames.add(fn), () => frames.delete(fn)), well: () => wellZone, cards };
    el.dispatchEvent(new CustomEvent("fx:desk-ready", { bubbles: true }));

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(returnTimer);
      canvas.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeaveWin);
      el.removeEventListener("keydown", onKey); el.removeEventListener("fx:intro", onIntro); el.removeEventListener("fx:leave", onLeave); el.removeEventListener("fx:theme", onTheme);
      gsap.killTweensOf([cam, titleState, glowMat]);
      cards.forEach((c) => { gsap.killTweensOf([c.root.position, c.root.rotation, c.lift.position, c.tilt.rotation, c.hop]); c.mesh.geometry.dispose(); c.tex.dispose(); });
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      floorTex.dispose(); titleTex?.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      canvas.remove(); el.classList.remove("fx-desk-on");
      el.style.removeProperty("--fx-desk-x"); el.style.removeProperty("--fx-desk-y"); el.style.cursor = "";
      delete el.kfDesk;
    };
  });
})();
