(() => {
  kfFx.register("crystal-photo-stage", (el, { options, reduce }) => {
    const T = window.THREE;
    const srcs = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!T || !window.gsap || !srcs.length) return;
    const cycle = +(options.cycle ?? 8), fade = +(options.fade ?? 1.4), lag = +(options.delay ?? 1.8);
    const peak = +(options.glass ?? 0.2), zoom = +(options.zoom ?? 1.1);
    const W = () => el.clientWidth || 1, H = () => el.clientHeight || 1;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setSize(W(), H());
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const cv = renderer.domElement;
    cv.className = "fx-crystal-canvas";
    el.appendChild(cv);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.z = 2;
    const geo = new T.PlaneGeometry(1, 1);
    const slides = srcs.map((s) => {
      const tex = s.tagName === "CANVAS" ? new T.CanvasTexture(s) : new T.Texture(s);
      if (s.tagName === "IMG") { const up = () => (tex.needsUpdate = true); s.complete ? up() : s.addEventListener("load", up, { once: true }); }
      tex.colorSpace = T.SRGBColorSpace;
      const m = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex, color: 0xcccccc })); /* Not skin: original value that multiplies the photo by 80% */
      m.visible = false; scene.add(m);
      return m;
    });
    const ratio = () => { const s = srcs[0]; return (s.naturalWidth || s.width || 3) / (s.naturalHeight || s.height || 2); };
    const fit = () => {
      camera.aspect = W() / H(); camera.updateProjectionMatrix();
      const vh = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360), vw = vh * camera.aspect, r = ratio();
      const h = Math.max(vh, vw / r) * 1.02;
      slides.forEach((m) => { m.userData.w = h * r; m.userData.h = h; m.scale.set(h * r, h, 1); });
    };
    const glassMat = new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, depthWrite: false, opacity: 0, transmission: 1, roughness: 0, ior: +(options.ior ?? 1.1), thickness: 1.6, dispersion: +(options.dispersion ?? 1), specularIntensity: 1 }); /* Not skin: clear glass body */
    const glass = new T.Mesh(new T.IcosahedronGeometry(+(options.size ?? 1.3), 0), glassMat);
    glass.position.set(0, 0.3, -0.2);
    scene.add(glass, new T.AmbientLight(0xffffff, 1.2)); /* Not skin: light intensity */
    fit();
    renderer.compile(scene, camera);
    let raf = 0, on = true, cur = 0;
    const draw = () => { renderer.render(scene, camera); raf = requestAnimationFrame(draw); };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; cancelAnimationFrame(raf); if (on) draw(); });
    io.observe(el);
    const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); fit(); });
    ro.observe(el);
    const rad = (d) => (d * Math.PI) / 180;
    const grow = (m, d) => { const { w, h } = m.userData; gsap.fromTo(m.scale, { x: w, y: h }, { duration: d, ease: "linear", x: w * zoom, y: h * zoom }); };
    const calls = [];
    const run = () => {
      const nx = (cur + 1) % slides.length, a = slides[cur], b = slides[nx];
      slides.forEach((m, i) => (m.visible = i === cur || i === nx));
      b.position.z = 0.0005; a.position.z = -0.0005;
      b.material.transparent = true; b.material.opacity = 0; a.material.transparent = false;
      const h = cycle * 0.6;
      gsap.fromTo(glassMat, { opacity: 0 }, { duration: h * 0.65, ease: "sine.inOut", opacity: peak });
      gsap.to(glassMat, { duration: 1, delay: h * 0.65, ease: "linear", opacity: 0 });
      gsap.fromTo(glass.rotation, { x: rad(50), y: rad(24), z: rad(17) }, { duration: h, ease: "sine.out", x: rad(53), y: rad(-8), z: rad(15) });
      gsap.fromTo(b.material, { opacity: 0 }, { duration: fade, delay: lag, ease: "sine.inOut", opacity: 1 });
      grow(b, cycle * 1.8);
      cur = nx;
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: cur, total: slides.length, after: lag } }));
      calls.push(gsap.delayedCall(cycle - 2, run));
    };
    slides[0].visible = true;
    if (reduce || slides.length < 2) { renderer.render(scene, camera); }
    else { grow(slides[0], 6); calls.push(gsap.delayedCall(3, run)); }
    return () => {
      calls.forEach((c) => c.kill());
      gsap.killTweensOf([glassMat, glass.rotation, ...slides.map((m) => m.material), ...slides.map((m) => m.scale)]);
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      slides.forEach((m) => { m.material.map?.dispose(); m.material.dispose(); });
      geo.dispose(); glass.geometry.dispose(); glassMat.dispose(); renderer.dispose(); cv.remove();
    };
  });
})();
