(() => {
  // Photo cards are attached as a cylindrical band (curved pieces), tilted on X · Z and slowly rotated (three.js). The front is the photo, the back is --kf-raised gray.
  // Card corner = 360/count − gap, radius = Card width / angle (radians). The camera pulls back so card height × 1.15 takes the fill share of screen height, and looks toward bias × half screen width.
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function placeholder(T, label, i) {
    const c = document.createElement("canvas"); c.width = 700; c.height = 440;
    const g = c.getContext("2d"), grad = g.createLinearGradient(0, 0, 700, 440);
    grad.addColorStop(0, i % 2 ? css("--kf-surface") : css("--kf-accent")); grad.addColorStop(1, css("--kf-ink"));
    g.fillStyle = grad; g.fillRect(0, 0, 700, 440);
    g.globalAlpha = 0.18; g.fillStyle = css("--kf-surface");
    for (let k = 0; k < 5; k++) g.fillRect(k * 140 + 10, 110, 120, 330);
    g.globalAlpha = 1; g.font = `500 28px ${css("--kf-font-sans")}`; g.fillText(label || "", 24, 412);
    return new T.CanvasTexture(c);
  }
  // three is loaded first via three-global.js + three.cjs. A module build attaching late fills window.THREE and then fires ‹three:ready›, at which point it attaches
  const three = () => (window.THREE ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  kfFx.register("photo-cylinder-spin", (el, ctx) => {
    let off = null, gone = false;
    three().then((T) => { if (!gone && el.isConnected) off = build(el, ctx, T); });
    return () => { gone = true; off?.(); };
  });
  function build(el, { options, reduce }, T) {
    const parts = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!T || !parts.length || !window.gsap) return null;
    const cardW = +(options["card-w"] ?? 350), cardH = +(options["card-h"] ?? 220), tiltX = +(options.tilt ?? 15), tiltZ = +(options["tilt-z"] ?? 8);
    const dur = +(options.dur ?? 40) || 40, gap = +(options.gap ?? 1.2), tighten = +(options.tighten ?? -20), fill = +(options.fill ?? 0.44) || 0.44, bias = +(options.bias ?? -0.35), lift = +(options.lift ?? 30);
    const scaleOf = (w) => (w <= 575 ? 0.75 : w <= 767 ? 0.85 : w <= 1024 ? 0.9 : 1);
    const stage = document.createElement("div"); stage.className = "fx-pcs-stage"; el.appendChild(stage);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, 0.1, 5e4);
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); stage.appendChild(renderer.domElement);
    const tilt = new T.Group(), spin = new T.Group(), ring = new T.Group();
    scene.add(tilt); tilt.add(spin); spin.add(ring);
    tilt.rotation.x = T.MathUtils.degToRad(tiltX); tilt.rotation.z = T.MathUtils.degToRad(tiltZ); tilt.scale.setScalar(scaleOf(innerWidth));
    const n = parts.length, step = 360 / n, arc = T.MathUtils.degToRad(Math.max(2, step - gap));
    const R = cardW / arc, F = Math.max(1, Math.round(cardW / (2 * Math.sin(Math.PI / Math.max(2, n))) + tighten));
    const back = new T.MeshBasicMaterial({ color: new T.Color(css("--kf-raised") || css("--kf-line")), side: T.BackSide });
    const disposables = [back];
    parts.forEach((p, i) => {
      const img = p.tagName === "IMG" ? p : p.querySelector("img");
      const tex = img?.src ? new T.TextureLoader().load(img.currentSrc || img.src) : placeholder(T, p.dataset.label, i);
      tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
      const geo = new T.CylinderGeometry(R, R, cardH, 48, 1, true, -arc / 2, arc);
      const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, side: T.FrontSide });
      const front = new T.Mesh(geo, mat), rear = new T.Mesh(geo, back);
      front.rotation.y = rear.rotation.y = T.MathUtils.degToRad(step * i);
      front.position.z = rear.position.z = F;
      const g = new T.Group(); g.add(rear, front); ring.add(g);
      disposables.push(geo, mat, tex);
    });
    const box = new T.Box3().setFromObject(ring), mid = new T.Vector3(); box.getCenter(mid); ring.position.sub(mid); ring.position.y += lift;
    const fit = () => {
      const r = stage.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      const fov = T.MathUtils.degToRad(camera.fov), d = (cardH * 1.15) / (Math.min(Math.max(fill, 0.1), 0.98) * 2 * Math.tan(fov / 2));
      camera.position.set(0, 0, d); camera.lookAt(new T.Vector3(bias * Math.tan(fov / 2) * d * camera.aspect, 0, 0));
      tilt.scale.setScalar(scaleOf(innerWidth));
      renderer.render(scene, camera);
    };
    fit();
    const tw = reduce ? null : gsap.to(spin.rotation, { y: "+=" + Math.PI * 2, duration: dur, ease: "none", repeat: -1 });
    let raf = 0, last = 0;
    const loop = (now) => { raf = requestAnimationFrame(loop); if (now - last < 1) return; last = now; renderer.render(scene, camera); };
    if (!reduce) raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(fit); ro.observe(stage);
    return () => { cancelAnimationFrame(raf); tw?.kill(); ro.disconnect(); disposables.forEach((d) => d.dispose?.()); renderer.dispose(); stage.remove(); };
  }
})();
