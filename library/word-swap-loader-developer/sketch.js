// Architectural sketch scene — a two-story mansion built from our basic shapes (slab, wall, column, stairs), drawn in pencil lines.
// Like the original, when the section is visible the lines are drawn in turn as if a drawing video were playing, and the viewpoint tilts 2° left-right and 1.33° up-down with the mouse (quickTo .8s Out), and −5°→5° with scroll.
(() => {
  const LV = window.LV || (window.LV = {});
  LV.sketch = (root) => {
    const cv = root.querySelector("[data-sketch-scene]"), T = window.THREE;
    if (!cv || !T) return;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(32, 1718 / 1258, 0.1, 200);
    const target = new T.Vector3(0, 2.2, 0);
    const segs = [];
    const box = (x, y, z, w, h, d) => {
      const g = new T.EdgesGeometry(new T.BoxGeometry(w, h, d));
      const p = g.attributes.position.array;
      for (let i = 0; i < p.length; i += 6) segs.push([p[i] + x, p[i + 1] + y, p[i + 2] + z, p[i + 3] + x, p[i + 4] + y, p[i + 5] + z]);
      g.dispose();
    };
    // Floor 1 slab · floor 2 slab (eaves jutting forward) · roof slab, wall mass, thin pillars, front stairs, glass mullions
    box(0, 0.1, 0, 14, 0.2, 7);
    box(-1.5, 1.6, -0.6, 8, 2.8, 5);
    box(0.8, 3.15, 0.4, 13, 0.3, 7.6);
    box(1.6, 4.6, -0.4, 8.5, 2.6, 5);
    box(1.6, 6.05, 0.2, 11, 0.3, 6.8);
    [-5.6, -3.2, 3.4, 5.8].forEach((x) => box(x, 1.6, 3.3, 0.18, 2.8, 0.18));
    [-1.4, 4.4].forEach((x) => box(x, 4.6, 2.6, 0.16, 2.6, 0.16));
    for (let i = 0; i < 6; i++) box(-1.5, 0.1 + i * 0.12, 4.2 + i * 0.35, 4.4 - i * 0.2, 0.12, 0.35);
    for (let i = 0; i < 7; i++) box(-4.4 + i * 1.2, 1.6, 1.92, 0.04, 2.6, 0.04);
    for (let i = 0; i < 6; i++) box(-1.5 + i * 1.3, 4.6, 2.12, 0.04, 2.4, 0.04);
    segs.push([-20, 0, 6, 20, 0, 6], [-20, 0, -9, 20, 0, -9]);
    const pos = new Float32Array(segs.length * 6), ord = new Float32Array(segs.length * 2);
    segs.forEach((s, i) => { pos.set(s, i * 6); const o = (i + Math.random() * 6) / (segs.length + 6); ord[i * 2] = ord[i * 2 + 1] = o; });
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("aOrder", new T.BufferAttribute(ord, 1));
    const ink = new T.Color(getComputedStyle(cv).color);
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uProgress: { value: 0 }, uColor: { value: new T.Vector3(ink.r, ink.g, ink.b) } },
      vertexShader: "attribute float aOrder; varying float vO; void main(){ vO = aOrder; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: "uniform float uProgress; uniform vec3 uColor; varying float vO; void main(){ float a = smoothstep(vO - .04, vO, uProgress * 1.04); if (a <= 0.) discard; gl_FragColor = vec4(uColor, .85 * a); }",
    });
    scene.add(new T.LineSegments(geo, mat));
    const st = { x: 0, y: 0, scroll: 0 }, axY = new T.Vector3(0, 1, 0), axX = new T.Vector3(1, 0, 0), off = new T.Vector3();
    const qx = gsap.quickTo(st, "x", { duration: 0.8, ease: "Out" }), qy = gsap.quickTo(st, "y", { duration: 0.8, ease: "Out" });
    const size = () => { renderer.setSize(cv.clientWidth, cv.clientHeight, false); cam.aspect = cv.clientWidth / Math.max(1, cv.clientHeight); cam.updateProjectionMatrix(); dirty = true; };
    let dirty = true, last = "";
    const render = () => {
      const key = `${st.x.toFixed(4)}/${st.y.toFixed(4)}/${st.scroll.toFixed(4)}/${mat.uniforms.uProgress.value.toFixed(3)}`;
      if (!dirty && key === last) return;
      dirty = false; last = key;
      const yaw = (st.x * Math.PI) / 90 - 0.38, pitch = (st.y * Math.PI) / 135 + (5 * st.scroll * Math.PI) / 180 - 0.06;
      off.set(0, 0, 24).applyAxisAngle(axX, pitch).applyAxisAngle(axY, yaw);
      cam.position.copy(target).add(off);
      cam.lookAt(target);
      renderer.render(scene, cam);
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    gsap.ticker.add(render);
    const move = (e) => { if (e.pointerType !== "touch") { qx((e.clientX / innerWidth) * 2 - 1); qy((e.clientY / innerHeight) * 2 - 1); } };
    const leave = () => { qx(0); qy(0); };
    const kill = [];
    if (LV.reduce) mat.uniforms.uProgress.value = 1;
    else {
      // Drawing video slot — each time the section shows, lines are drawn from the start for 6s (original sketch-drawing video playback)
      const draw = gsap.fromTo(mat.uniforms.uProgress, { value: 0 }, { value: 1, duration: 6, ease: "none", paused: true });
      const sec = cv.closest(".section") || cv;
      kill.push(ScrollTrigger.create({ trigger: cv, start: "top bottom", end: "bottom top", onEnter: () => draw.restart(), onEnterBack: () => draw.restart(), onLeave: () => draw.pause(), onLeaveBack: () => draw.pause() }));
      kill.push(gsap.fromTo(st, { scroll: -1 }, { scroll: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } }));
      addEventListener("pointermove", move);
      document.documentElement.addEventListener("mouseleave", leave);
    }
    return () => {
      gsap.ticker.remove(render);
      ro.disconnect();
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      kill.forEach((k) => (k.scrollTrigger ? k.scrollTrigger.kill() : k.kill?.()));
      geo.dispose(); mat.dispose(); renderer.dispose();
    };
  };
})();
