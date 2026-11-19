// Home — glass trophy (three r186), person card focus hover, overlapping slider, branch map pins. Registered in TBP.index so they are set up again after page transitions.
(() => {
  const TBP = (window.TBP = window.TBP || {});

  // Branch map pins — the original mapbox branch marker spots (about 130, as many as are visible on screen). Positions are scattered from a fixed seed
  TBP.mapPins = (root) => {
    root.querySelectorAll(".t-map__pins").forEach((box) => {
      if (box.children.length) return;
      let seed = 7;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let k = 0; k < 34; k++) {
        const x = 30 + rnd() * 48, y = 18 + rnd() * 62;
        box.insertAdjacentHTML("beforeend", `<svg class="t-map__pin" viewBox="0 0 18 24" style="left:${x}%;top:${y}%"><path d="M9 0C4 0 0 4 0 9c0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9z"/><circle cx="9" cy="9" r="3.4"/></svg>`);
      }
    });
  };

  // Overlap slider — dragging stacks passed cards on the left, shrinking them to .45x and −8° (axis at 75% center), and on release it snaps one card at a time with inertia (max 1s)
  TBP.overlap = (root) => {
    const offs = [];
    root.querySelectorAll(".t-ovl").forEach((wrap) => {
      const list = wrap.querySelector(".t-ovl__list"), items = [...wrap.querySelectorAll(".t-ovl__item")];
      if (!list || !items.length || !window.Draggable) return;
      const scaleTo = +(wrap.dataset.scale ?? 0.45), rot = +(wrap.dataset.rotate ?? -8);
      let step = 0, max = 0, u = 0;
      const clamp = (v) => (max <= 0 ? 0 : Math.min(Math.max(v, 0), max));
      const draw = () => {
        gsap.set(list, { x: -u });
        items.forEach((it, r) => { const o = Math.max(0, u - r * step), a = step > 0 ? Math.min(o / step, 1) : 0; gsap.set(it, { x: o, scale: 1 - (1 - scaleTo) * a, rotation: rot * a, transformOrigin: "75% center" }); });
      };
      const measure = () => { const mr = parseFloat(getComputedStyle(items[0]).marginRight) || 0; step = items[0].offsetWidth + mr; max = step * (items.length - 1); u = clamp(u); draw(); d && d.applyBounds({ minX: -max, maxX: 0 }); };
      const d = Draggable.create(list, {
        type: "x", bounds: { minX: -max, maxX: 0 }, inertia: !!window.InertiaPlugin, maxDuration: 1,
        snap: (x) => -(step > 0 ? Math.round(clamp(-x) / step) : 0) * step,
        onDrag() { u = clamp(-this.x); draw(); }, onThrowUpdate() { u = clamp(-this.x); draw(); },
      })[0];
      const ro = new ResizeObserver(measure); ro.observe(wrap);
      measure();
      offs.push(() => { ro.disconnect(); d.kill(); });
    });
    return () => offs.forEach((f) => f());
  };

  // Portrait card focus — the card in the cell under the cursor scales to 1.1x and the insides of other cards are pushed away by 50/(distance)% (.8s elastic.out(1, .75))
  TBP.people = (root) => {
    const wrap = root.querySelector(".t-people__wrap");
    if (!wrap || !TB.fine || TB.reduce || innerWidth < 768) return;
    const cards = [...wrap.querySelectorAll(".t-people__card")], content = [...wrap.querySelectorAll(".t-people__content")], n = cards.length;
    let cur = 0;
    const el = "elastic.out(1, 0.75)";
    const focus = (t) => {
      gsap.to(cards[t], { xPercent: 0, yPercent: 0, duration: 0.8, scale: 1.1, ease: el });
      content.forEach((c, k) => gsap.to(c, { xPercent: k !== t ? 50 / (k - t) : 0, duration: 0.8, ease: el }));
    };
    const move = (e) => {
      const p = (e.clientX - wrap.getBoundingClientRect().left) / wrap.clientWidth;
      let k = Math.ceil(p * n);
      if (k === 2 && p < 1 / n + 0.04) k = 1;
      if (k !== cur && k > 0 && k <= n) { if (cur) gsap.to(cards[cur - 1], { scale: 1, duration: 0.8, ease: el }); cur = k; focus(k - 1); }
    };
    const leave = () => { if (cur) gsap.to(cards[cur - 1], { scale: 1, duration: 0.8, ease: el }); gsap.to(content, { xPercent: 0, duration: 0.8, ease: el }); cur = 0; };
    wrap.addEventListener("mousemove", move); wrap.addEventListener("mouseleave", leave);
    return () => { wrap.removeEventListener("mousemove", move); wrap.removeEventListener("mouseleave", leave); };
  };

  // Glass trophy — the original floats a glb model (glass outside, orange inside) over the big title of the same section, and redraws the title letters as a back-plate image so the glass refracts.
  // Rebuilt with our own shape (a house-shaped shield, extruded) and the same numbers: field of view 38°, from the section top at the screen bottom → the section center at 60% of the screen, .75 turn (scrub 1), bobbing (.55·.23·.31 sin), tilt toward the mouse (y .3·x .25, 5x per second)
  TBP.award = (root) => {
    const sec = root.querySelector(".t-award"), box = sec && sec.querySelector(".t-award__3d"), cv = box && box.querySelector("canvas");
    if (!cv || !window.THREE) return;
    const T = window.THREE;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
    renderer.outputColorSpace = T.SRGBColorSpace;
    const css = (name) => { const p = document.createElement("i"); p.style.color = `var(${name})`; sec.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
    // three’s Color can’t read oklch or color() — paint it on a 1px canvas and read back sRGB 0–1
    const px = document.createElement("canvas"); px.width = px.height = 1;
    const pc = px.getContext("2d", { willReadFrequently: true });
    const rgb = (name) => { pc.clearRect(0, 0, 1, 1); pc.fillStyle = css(name); pc.fillRect(0, 0, 1, 1); const d = pc.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };
    const scene = new T.Scene();
    // Ambient light made of four light boxes — glass·gloss will reflect it
    const envScene = new T.Scene(); envScene.background = new T.Color(0x000000);
    const panel = (w, h, k, x, y, z) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color().setRGB(...rgb("--site-cream"), T.SRGBColorSpace).multiplyScalar(k), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); };
    panel(5, 1, 2.5, 2, 4.5, 4); panel(0.25, 7, 8, -5, 0.5, -1.3); panel(7, 3, 3, 0, 1.5, -5); panel(5, 1.2, 2, 0, -5, 2);
    const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0.04).texture;
    const cam = new T.PerspectiveCamera(38, 1, 0.1, 100); cam.position.set(0, 0, 4.2);
    const group = new T.Group(); scene.add(group);
    const house = (w, h, r) => {
      const s = new T.Shape(), hw = w / 2, roof = h * 0.28;
      s.moveTo(-hw + r, -h / 2); s.lineTo(hw - r, -h / 2); s.quadraticCurveTo(hw, -h / 2, hw, -h / 2 + r);
      s.lineTo(hw, h / 2 - roof); s.lineTo(r * 0.6, h / 2 - r * 0.2); s.quadraticCurveTo(0, h / 2, -r * 0.6, h / 2 - r * 0.2);
      s.lineTo(-hw, h / 2 - roof); s.lineTo(-hw, -h / 2 + r); s.quadraticCurveTo(-hw, -h / 2, -hw + r, -h / 2);
      return s;
    };
    const coreGeo = new T.ExtrudeGeometry(house(1.25, 1.55, 0.12), { depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 }); coreGeo.center();
    const glassGeo = new T.ExtrudeGeometry(house(1.5, 1.85, 0.18), { depth: 0.34, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 6 }); glassGeo.center();
    const core = new T.Mesh(coreGeo, new T.MeshBasicMaterial({ color: new T.Color().setRGB(...rgb("--site-award"), T.SRGBColorSpace), toneMapped: false }));
    const glass = new T.Mesh(glassGeo, new T.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 0.6, roughness: 0.04, ior: 1.45, transparent: true, envMapIntensity: 1.2 }));
    // Trophy front text (our placeholder) — canvas drawing
    const face = document.createElement("canvas"); face.width = 512; face.height = 640;
    const fc = face.getContext("2d"), fontD = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display");
    fc.fillStyle = css("--site-cream"); fc.textAlign = "center"; fc.font = `64px ${fontD}`;
    ["BEST", "REGIONAL", "SHOP"].forEach((w, k) => fc.fillText(w, 256, 330 + k * 74));
    fc.font = `40px ${fontD}`; fc.fillText("AWARD", 256, 230);
    const ftex = new T.CanvasTexture(face); ftex.colorSpace = T.SRGBColorSpace;
    const label = new T.Mesh(new T.PlaneGeometry(1.0, 1.25), new T.MeshBasicMaterial({ map: ftex, alphaTest: 0.5, toneMapped: false }));
    label.position.z = 0.13;
    group.add(core, label, glass);
    // Back panel — redraws the section’s big title in the same spot so it refracts through the glass (z −.9)
    const back = document.createElement("canvas"), bctx = back.getContext("2d");
    const btex = new T.CanvasTexture(back); btex.colorSpace = T.SRGBColorSpace;
    const backMesh = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: btex, transparent: true, toneMapped: false }));
    backMesh.position.z = -0.9; scene.add(backMesh);
    const title = sec.querySelector(".t-award__title");
    const layout = () => {
      const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      const dist = cam.position.z + 0.9, vh = 2 * Math.tan((19 * Math.PI) / 180) * dist, vw = vh * cam.aspect;
      backMesh.scale.set(vw, vh, 1);
      const dpr = Math.min(devicePixelRatio || 1, 2); back.width = Math.floor(w * dpr); back.height = Math.floor(h * dpr);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.clearRect(0, 0, w, h);
      const br = box.getBoundingClientRect(), cs = getComputedStyle(title);
      bctx.fillStyle = css("--site-lime"); bctx.font = `${cs.fontSize} ${cs.fontFamily}`; bctx.textAlign = "center"; bctx.textBaseline = "alphabetic";
      title.querySelectorAll(".t-award__line").forEach((ln) => { const r = ln.getBoundingClientRect(); bctx.fillText(ln.textContent.toUpperCase(), r.left - br.left + r.width / 2, r.top - br.top + r.height * 0.84); });
      btex.needsUpdate = true;
      const tr = title.getBoundingClientRect(), sc = (tr.height * 0.81) / h * vh / 1.85 * 0.72;
      group.scale.setScalar(Math.max(0.3, sc));
      group.userData.y = -((tr.top + tr.height / 2 - br.top) / h - 0.5) * (2 * Math.tan((19 * Math.PI) / 180) * cam.position.z);
    };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const pm2 = (e) => { mouse.tx = Math.max(-1, Math.min(1, (e.clientX / innerWidth) * 2 - 1)); mouse.ty = Math.max(-1, Math.min(1, (e.clientY / innerHeight) * 2 - 1)); };
    if (!TB.reduce) addEventListener("pointermove", pm2, { passive: true });
    const prog = { p: TB.reduce ? 1 : 0 };
    const st = TB.reduce ? null : ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "center 60%", scrub: 1, onUpdate: (s) => (prog.p = s.progress), onRefresh: (s) => { prog.p = s.progress; layout(); } });
    let t = 0, last = 0, seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting)); io.observe(sec);
    const floatK = innerWidth < 768 ? 0.5 : innerWidth < 992 ? 0.75 : 1, turns = innerWidth < 768 ? 0.5 : 0.75;
    const tick = () => {
      const now = performance.now(), dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now;
      if (!seen) return;
      t += TB.reduce ? 0 : dt;
      mouse.x += (mouse.tx - mouse.x) * Math.min(dt * 5, 1); mouse.y += (mouse.ty - mouse.y) * Math.min(dt * 5, 1);
      group.position.set(Math.sin(t * 0.31 + 0.7) * 0.035 * floatK, (group.userData.y || 0) + (Math.sin(t * 0.55) * 0.085 + Math.sin(t * 0.23 + 1.3) * 0.045) * floatK, 0);
      group.rotation.set(Math.sin(t * 0.45) * 0.035 * floatK + mouse.y * 0.25, (1 - prog.p) * turns * Math.PI * 2 + Math.sin(t * 0.35) * 0.06 * floatK + mouse.x * 0.3, Math.sin(t * 0.3) * 0.02 * floatK);
      renderer.render(scene, cam);
    };
    layout(); renderer.compile(scene, cam); renderer.render(scene, cam);
    sec.classList.add("is-3d");
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(layout); ro.observe(box);
    document.fonts && document.fonts.ready.then(layout);
    return () => { gsap.ticker.remove(tick); st && st.kill(); io.disconnect(); ro.disconnect(); removeEventListener("pointermove", pm2); renderer.dispose(); sec.classList.remove("is-3d"); };
  };

  TBP.index = (root) => {
    TBP.mapPins(root);
    const offs = [TBP.overlap(root), TBP.people(root), TBP.award(root)];
    return () => offs.forEach((f) => f && f());
  };
})();
