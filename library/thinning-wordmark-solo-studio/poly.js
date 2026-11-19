/* Low-poly 3D figure (the original is a human scan model — here we stack our basic shapes into a standing person with the same height and silhouette ratio).
   Retro console style: drawn at half resolution to enlarge the pixels, with flat shading on each face. The chest breathes at 1.7rad/s and the upper body sways at .75rad/s.
   data-spin="scroll" While the back face crosses the screen it makes one full turn (−180°→180°, .12 per frame), otherwise it tilts ±.6rad toward the cursor (.05 per frame) */
(() => {
  const T = window.THREE;
  if (!T) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const colorOf = (v) => {
    const p = document.createElement("i");
    p.style.cssText = `position:absolute;visibility:hidden;color:${v}`;
    document.body.append(p);
    pix.fillStyle = getComputedStyle(p).color;
    p.remove();
    pix.clearRect(0, 0, 1, 1); pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };

  // One part = Basic shapes + color. All joined into one mesh with one color per vertex
  function figure() {
    const skin = colorOf("color-mix(in oklab, var(--site-sun) 45%, var(--kf-bg))");
    const shirt = colorOf("color-mix(in oklab, var(--kf-ink-soft) 70%, var(--site-lime) 12%)");
    const pants = colorOf("color-mix(in oklab, var(--kf-contrast-bg) 70%, var(--site-blue) 18%)");
    const shoe = colorOf("var(--kf-bg)");
    const hair = colorOf("color-mix(in oklab, var(--kf-contrast-bg) 80%, var(--kf-accent) 10%)");
    const parts = [];
    const add = (geo, color, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      const m = new T.Matrix4().compose(new T.Vector3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(rx, ry, rz)), new T.Vector3(sx, sy, sz));
      g.applyMatrix4(m);
      const n = g.attributes.position.count, c = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { c[i * 3] = color.r; c[i * 3 + 1] = color.g; c[i * 3 + 2] = color.b; }
      g.setAttribute("color", new T.BufferAttribute(c, 3));
      g.deleteAttribute("uv");
      parts.push(g);
    };
    const leg = new T.CylinderGeometry(0.075, 0.06, 0.82, 6, 2);
    add(leg, pants, -0.1, 0.47, 0, 0, 0, 0.03);
    add(leg, pants, 0.1, 0.47, 0, 0, 0, -0.03);
    add(new T.BoxGeometry(0.13, 0.08, 0.26), shoe, -0.11, 0.04, 0.05);
    add(new T.BoxGeometry(0.13, 0.08, 0.26), shoe, 0.11, 0.04, 0.05);
    add(new T.CylinderGeometry(0.2, 0.17, 0.62, 7, 3), shirt, 0, 1.17, 0, 0, 0, 0, 1, 1, 0.62);
    add(new T.CylinderGeometry(0.17, 0.19, 0.12, 7, 1), pants, 0, 0.88, 0, 0, 0, 0, 1, 1, 0.62);
    const arm = new T.CylinderGeometry(0.055, 0.045, 0.62, 5, 2);
    add(arm, shirt, -0.27, 1.12, 0, 0, 0, 0.12);
    add(arm, shirt, 0.27, 1.12, 0, 0, 0, -0.12);
    add(new T.IcosahedronGeometry(0.05, 0), skin, -0.31, 0.79, 0);
    add(new T.IcosahedronGeometry(0.05, 0), skin, 0.31, 0.79, 0);
    add(new T.CylinderGeometry(0.05, 0.06, 0.1, 6), skin, 0, 1.51, 0);
    add(new T.IcosahedronGeometry(0.12, 1), skin, 0, 1.66, 0.01, 0, 0, 0, 0.9, 1.08, 0.95);
    add(new T.SphereGeometry(0.125, 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 1.69, -0.005, -0.15, 0, 0, 0.95, 0.85, 1);
    const merged = mergeAll(parts);
    merged.computeVertexNormals();
    return merged;
  }
  function mergeAll(list) {
    const total = list.reduce((a, g) => a + g.attributes.position.count, 0);
    const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
    let o = 0;
    for (const g of list) { pos.set(g.attributes.position.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; }
    const out = new T.BufferGeometry();
    out.setAttribute("position", new T.BufferAttribute(pos, 3));
    out.setAttribute("color", new T.BufferAttribute(col, 3));
    return out;
  }

  document.querySelectorAll("[data-poly-figure]").forEach((host) => {
    const box = host.querySelector("[data-poly-canvas]") || host;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      let renderer;
      try { renderer = new T.WebGLRenderer({ antialias: false, alpha: true }); } catch { return; }
      renderer.setPixelRatio(0.5);
      renderer.outputColorSpace = T.SRGBColorSpace;
      box.append(renderer.domElement);
      const scene = new T.Scene(), cam = new T.PerspectiveCamera(28, 1, 0.1, 100);
      scene.add(new T.HemisphereLight(0xffffff, 0x445566, 0.9)); /* Not skin: sky·ground light */
      const sun = new T.DirectionalLight(0xffffff, 2.6); /* Not skin: white sunlight */
      sun.position.set(-1.5, 2, 2.5);
      scene.add(sun);
      const geo = figure();
      geo.computeBoundingBox();
      const bb = geo.boundingBox, H = bb.max.y - bb.min.y;
      const time = { value: 0 };
      const mat = new T.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: T.DoubleSide });
      if (!reduce) mat.onBeforeCompile = (sh) => {
        sh.uniforms.uT = time; sh.uniforms.uH = { value: H }; sh.uniforms.uY = { value: bb.min.y };
        sh.vertexShader = sh.vertexShader
          .replace("#include <common>", "#include <common>\nuniform float uT; uniform float uH; uniform float uY;")
          .replace("#include <begin_vertex>", `#include <begin_vertex>
            float k = (position.y - uY) / uH;
            float inhale = sin(uT * 1.7);
            float ribs = smoothstep(0.55, 0.68, k) * (1.0 - smoothstep(0.78, 0.86, k));
            transformed.xz *= 1.0 + 0.018 * inhale * ribs;
            transformed.x += sin(uT * 0.75) * 0.018 * uH * smoothstep(0.45, 1.0, k);
            transformed.y += inhale * 0.004 * uH * smoothstep(0.6, 0.9, k);`);
      };
      const mesh = new T.Mesh(geo, mat);
      mesh.frustumCulled = false;
      const pivot = new T.Group();
      pivot.add(mesh);
      scene.add(pivot);
      const frame = () => {
        const d = (H * 1.12) / 2 / Math.tan(T.MathUtils.degToRad(cam.fov) / 2);
        cam.position.set(0, H / 2, d);
        cam.lookAt(0, H / 2, 0);
      };
      const size = () => {
        const w = box.clientWidth, h = box.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        cam.aspect = w / h; cam.updateProjectionMatrix(); frame();
      };
      new ResizeObserver(size).observe(box);
      size();
      renderer.compile(scene, cam);
      const scrollSpin = host.dataset.spin === "scroll";
      let aim = 0;
      if (scrollSpin) {
        const f = () => { const r = host.getBoundingClientRect(); aim = (T.MathUtils.clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1) - 0.5) * Math.PI * 2; };
        addEventListener("scroll", f, { passive: true });
        f();
      } else {
        addEventListener("pointermove", (e) => { const r = box.getBoundingClientRect(); aim = T.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1) * 0.6; }, { passive: true });
      }
      let seen = true;
      new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(host);
      const clock = new T.Clock();
      const loop = () => {
        requestAnimationFrame(loop);
        const dt = clock.getDelta();
        if (!seen) return;
        time.value += dt;
        pivot.rotation.y += (aim - pivot.rotation.y) * (scrollSpin ? 0.12 : 0.05);
        renderer.render(scene, cam);
      };
      loop();
    };
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "300px" });
    io.observe(host);
  });
})();
