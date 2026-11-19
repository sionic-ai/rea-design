// Photos bend like a bow by the scroll speed — on a single three canvas stuck to the screen (only when elements with parts exist), a plane (1×1, 10×10 cells) is laid for each element,
// Tracks the element’s position every frame, with vertical bend = cos(x·π) × bend × speed × strength, horizontal wave = sin(y·π·wavelength·speed·intensity) × amplitude × intensity.
// Speed is the window.lenis velocity if present, otherwise the scroll difference between frames (px). The image is the img inside the element, otherwise a placeholder is drawn (gray panel, diagonal, label).
// Original Brand history values (amplitude .1 · wavelength 0 · bend .01 · intensity .07) are the default. On touch devices or reduced motion nothing is applied (DOM left as is)
(() => {
  let stage = null;
  const VERT = `
    uniform float uSpeed; uniform float uAmp; uniform float uFreq; uniform float uBow; uniform float uGain;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      float k = 3.14159265;
      p.x += sin(p.y * k * uFreq * uSpeed * uGain) * uAmp * uGain;
      p.y += cos(p.x * k) * uBow * uSpeed * uGain;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = `uniform sampler2D uMap; varying vec2 vUv; void main() { gl_FragColor = texture2D(uMap, vUv); }`;
  const open = () => {
    const T = window.THREE;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "3" });
    document.body.append(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
    const st = { T, canvas, renderer, scene: new T.Scene(), camera, items: new Set(), lastY: scrollY, raf: 0 };
    st.size = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      Object.assign(camera, { left: -innerWidth / 2, right: innerWidth / 2, top: innerHeight / 2, bottom: -innerHeight / 2 });
      camera.updateProjectionMatrix();
    };
    st.size();
    addEventListener("resize", st.size);
    const loop = () => {
      const y = scrollY, speed = window.lenis && typeof window.lenis.velocity === "number" ? window.lenis.velocity : y - st.lastY;
      st.lastY = y;
      for (const it of st.items) {
        const r = it.el.getBoundingClientRect(), pad = innerHeight * it.pad;
        const on = r.width > 0 && r.bottom > -pad && r.top < innerHeight + pad;
        it.mesh.visible = on;
        if (!on) continue;
        it.mesh.scale.set(r.width, r.height, 1);
        it.mesh.position.set(r.left + r.width / 2 - innerWidth / 2, innerHeight / 2 - r.top - r.height / 2, 0);
        it.mat.uniforms.uSpeed.value = speed;
      }
      renderer.render(st.scene, camera);
      st.raf = requestAnimationFrame(loop);
    };
    st.raf = requestAnimationFrame(loop);
    return st;
  };
  const close = () => {
    cancelAnimationFrame(stage.raf);
    removeEventListener("resize", stage.size);
    stage.renderer.dispose();
    stage.canvas.remove();
    stage = null;
  };
  // Placeholder image — like the gray plate in wire.css. The color is read from Skin variables
  const placeholder = (T, el) => {
    const css = getComputedStyle(document.documentElement), v = (n) => css.getPropertyValue(n).trim();
    const r = el.getBoundingClientRect(), s = 2, c = document.createElement("canvas");
    c.width = Math.max(2, Math.round(r.width * s)); c.height = Math.max(2, Math.round(r.height * s));
    const g = c.getContext("2d");
    g.fillStyle = v("--kf-raised"); g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = v("--kf-dim"); g.globalAlpha = 0.5; g.lineWidth = s;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    g.globalAlpha = 1; g.fillStyle = v("--kf-dim"); g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `${11 * s}px ${v("--kf-font-mono")}`;
    g.fillText((el.dataset.label || "").slice(0, 30), c.width / 2, c.height / 2);
    return new T.CanvasTexture(c);
  };
  kfFx.register("velocity-bend-gl", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !window.THREE) return;
    stage = stage || open();
    const T = stage.T, img = el.querySelector("img");
    const map = img ? new T.TextureLoader().load(img.currentSrc || img.src) : placeholder(T, el);
    map.colorSpace = T.SRGBColorSpace;
    const u = (k, d) => ({ value: +(options[k] ?? d) });
    const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { uMap: { value: map }, uSpeed: { value: 0 }, uAmp: u("amp", 0.1), uFreq: u("freq", 0), uBow: u("bow", 0.01), uGain: u("gain", 0.07) } });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 10, 10), mat);
    stage.scene.add(mesh);
    const it = { el, mesh, mat, pad: +(options.pad ?? 0.1) };
    stage.items.add(it);
    el.classList.add("fx-vbg-on");
    return () => {
      el.classList.remove("fx-vbg-on");
      if (!stage) return;
      stage.items.delete(it);
      stage.scene.remove(mesh);
      mesh.geometry.dispose(); mat.dispose(); map.dispose();
      if (!stage.items.size) close();
    };
  });
})();
