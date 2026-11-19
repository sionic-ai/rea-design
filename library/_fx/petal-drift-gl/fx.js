(() => {
  // One petal shape — a cherry blossom petal with a pointed bottom and a slightly notched top center. Plate height 4 (units), size multiplied by scale
  const petalShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, -2);
    s.bezierCurveTo(1.1, -1.2, 1.6, 0.6, 1.1, 1.6);
    s.bezierCurveTo(0.8, 2.1, 0.35, 2.05, 0, 1.7);
    s.bezierCurveTo(-0.35, 2.05, -0.8, 2.1, -1.1, 1.6);
    s.bezierCurveTo(-1.6, 0.6, -1.1, -1.2, 0, -2);
    return s;
  };
  // Leaf grain: a panel that darkens toward the bottom from background color to line color — repainted when the skin changes
  const paint = (ctx, a, b) => {
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, a); g.addColorStop(0.55, a); g.addColorStop(1, b);
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  };
  const BLUR_V = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  // Nine-tap Gaussian blur — once horizontal, once vertical (step is the direction)
  const BLUR_F = `
uniform sampler2D tSrc; uniform vec2 step; varying vec2 vUv;
void main(){
  vec4 c = texture2D(tSrc, vUv) * 0.1633;
  c += (texture2D(tSrc, vUv - step) + texture2D(tSrc, vUv + step)) * 0.1531;
  c += (texture2D(tSrc, vUv - 2.0 * step) + texture2D(tSrc, vUv + 2.0 * step)) * 0.12245;
  c += (texture2D(tSrc, vUv - 3.0 * step) + texture2D(tSrc, vUv + 3.0 * step)) * 0.0918;
  c += (texture2D(tSrc, vUv - 4.0 * step) + texture2D(tSrc, vUv + 4.0 * step)) * 0.051;
  gl_FragColor = c;
}`;
  const rand = (a, b) => a + Math.random() * (b - a);

  kfFx.register("petal-drift-gl", (el, { options, reduce, scroller }) => {
    if (!window.THREE) return;
    const front = options.layer === "front";
    const narrow = () => innerWidth < +(options.narrow ?? 768);
    const push = +(options.push ?? (front ? 200 : 0));
    const blur = +(options.blur ?? (front ? 0.0015 : 0));
    const lift = +(options.speed ?? 1);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, depth: false, stencil: false, precision: "lowp" }); } catch { return; }
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.dataset.fxPart = "canvas";
    el.append(canvas);

    let w = 1, h = 1;
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 1e4);
    camera.position.set(0, 0, 1e4);
    const box = new THREE.Group();
    scene.add(box);

    const tex = document.createElement("canvas");
    tex.width = tex.height = 128;
    const tctx = tex.getContext("2d");
    const css = () => getComputedStyle(el);
    const recolor = () => { const c = css(); paint(tctx, c.getPropertyValue("--fx-petal").trim() || c.getPropertyValue("--kf-bg").trim(), c.getPropertyValue("--fx-petal-edge").trim() || c.getPropertyValue("--kf-line").trim()); map.needsUpdate = true; };
    const map = new THREE.CanvasTexture(tex);
    const geo = new THREE.ShapeGeometry(petalShape(), 12);
    geo.computeBoundingBox();
    { const bb = geo.boundingBox, uv = geo.attributes.uv, p = geo.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y)); uv.needsUpdate = true; }
    const mat = new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false });
    recolor();

    // Front layer is two pieces (center sides ±.75), back layer one piece every 400 (250 on phone) spacing — mixes eight edge-side spots and hands them out
    let slots = [];
    const xPick = () => { if (!slots.length) slots = front ? [-0.75, 0.75] : [0.64, 0.75, 0.86, 1, -0.64, -0.75, -0.86, -1].sort(() => Math.random() - 0.5); return slots.shift(); };
    const make = () => {
      box.clear();
      slots = front ? [-0.75, 0.75] : [];
      const gap = front ? (narrow() ? h : 800) : narrow() ? 250 : 400;
      const total = +options.count || (front ? 2 : Math.floor((narrow() ? h * 1.5 : 3000) / gap));
      for (let i = 0; i < total; i++) {
        const leaf = new THREE.Group(), mesh = new THREE.Mesh(geo, mat);
        const k = narrow() ? (front ? rand(20, 30) * 0.8 : rand(10, 20)) * 0.8 : front ? rand(25, 33) : rand(10, 20);
        leaf.scale.setScalar(k);
        leaf.position.set(xPick() * innerWidth * 0.5, -i * gap, 300 + k * 40);
        leaf.rotation.set(0, rand(-1, 1) * 0.1, (rand(-180, 180) * Math.PI) / 180);
        Object.assign(leaf.userData, {
          vel: narrow() ? (front ? 0.25 : 0.175) : front ? 0.5 : 0.35,
          rise: (narrow() ? (front ? rand(1.7, 2.2) * 0.85 : rand(0.8, 1.5)) * 0.85 : front ? rand(1.7, 2.2) : rand(0.8, 1.5)) * lift,
          rx: rand(-1, 1) * 0.005, ry: rand(-1, 1) * 0.005, rz: rand(-1, 1) * 0.006,
          t: rand(0, 3), dir: Math.random() > 0.5 ? 0.01 : -0.01, x0: leaf.position.x, nudge: 0,
        });
        leaf.add(mesh);
        box.add(leaf);
      }
    };

    // Front layer blur: draws the scene to a plate, blurs it twice horizontally and vertically, then outputs to the screen (original h = v = 1.5/1000, phone 3/1000)
    let rtA, rtB, quad, qScene, qCam, blurMat;
    if (blur) {
      rtA = new THREE.WebGLRenderTarget(1, 1); rtB = new THREE.WebGLRenderTarget(1, 1);
      blurMat = new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null }, step: { value: new THREE.Vector2() } }, vertexShader: BLUR_V, fragmentShader: BLUR_F, transparent: true, depthTest: false, depthWrite: false });
      blurMat.blending = THREE.CustomBlending;
      blurMat.blendSrc = THREE.OneFactor; blurMat.blendDst = THREE.OneMinusSrcAlphaFactor;
      quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat);
      qScene = new THREE.Scene(); qScene.add(quad); qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    const size = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      box.position.y = h / 2;
      if (rtA) { const pr = renderer.getPixelRatio(); rtA.setSize(w * pr, h * pr); rtB.setSize(w * pr, h * pr); }
    };
    size();
    make();
    renderer.compile(scene, camera);

    const draw = () => {
      if (!blur) { renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene, camera); return; }
      const k = narrow() ? blur * 2 : blur;
      renderer.setRenderTarget(rtA); renderer.clear(); renderer.render(scene, camera);
      blurMat.uniforms.tSrc.value = rtA.texture; blurMat.uniforms.step.value.set(k, 0);
      renderer.setRenderTarget(rtB); renderer.clear(); renderer.render(qScene, qCam);
      blurMat.uniforms.tSrc.value = rtB.texture; blurMat.uniforms.step.value.set(0, k * (w / h));
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(qScene, qCam);
    };

    const mouse = { x: -1e5, y: -1e5 };
    const onMove = (e) => { const r = el.getBoundingClientRect(); mouse.x = e.clientX - r.left - w / 2; mouse.y = e.clientY - r.top; };
    const sc = scroller || document.scrollingElement || document.documentElement;
    let lastY = sc.scrollTop;

    const step = (ratio) => {
      const y = sc.scrollTop, flow = (y - lastY) / Math.max(ratio, 0.001);
      lastY = y;
      box.children.forEach((leaf) => {
        const d = leaf.userData, mesh = leaf.children[0];
        leaf.position.y += d.rise * ratio + flow * d.vel * ratio;
        mesh.rotation.x += Math.sin(d.t) * d.rx;
        mesh.rotation.y += Math.sin(d.t) * d.ry;
        mesh.rotation.z += d.rz;
        d.t += d.dir * ratio;
        // Front layer: within the cursor radius it is pushed outward (toward the side of the center where that leaf sits) and settles by .99 each frame
        if (push) {
          const dx = mouse.x - leaf.position.x, dy = mouse.y + leaf.position.y, dist = Math.hypot(dx, dy);
          if (dist < push) { d.nudge = Math.max(Math.abs(d.nudge), (push - dist) * 0.02); if (leaf.position.x <= 0) d.nudge = -d.nudge; }
          d.nudge *= 0.99;
          leaf.position.x += d.nudge;
          leaf.rotation.z += d.nudge * 0.002;
        }
        if (leaf.position.y > 500) { leaf.position.x = d.x0; leaf.position.y -= h + 800; d.nudge = 0; }
      });
    };

    const ro = new ResizeObserver(() => { size(); if (reduce) draw(); });
    ro.observe(el);
    const theme = new MutationObserver(() => { recolor(); if (reduce) draw(); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });

    if (reduce) {
      draw();
      return () => { ro.disconnect(); theme.disconnect(); renderer.dispose(); geo.dispose(); mat.dispose(); map.dispose(); rtA?.dispose(); rtB?.dispose(); canvas.remove(); };
    }

    // Runs only while that section is on screen (original: top-render-start when the Service section is visible) — is-on is added to the board and revealed with css
    let raf = 0, last = 0, seen = false;
    const tick = (now) => {
      raf = 0;
      const ratio = last ? Math.min(4, Math.max(0.001, (now - last) / (1000 / 60))) : 1;
      last = now;
      step(ratio);
      draw();
      if (seen) raf = requestAnimationFrame(tick);
    };
    const watch = el.closest(options.watch || "section") || el;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      el.classList.toggle("is-on", seen);
      if (seen && !raf) { last = 0; lastY = sc.scrollTop; raf = requestAnimationFrame(tick); }
    });
    io.observe(watch);
    if (push) addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); theme.disconnect();
      removeEventListener("mousemove", onMove);
      el.classList.remove("is-on");
      renderer.dispose(); geo.dispose(); mat.dispose(); map.dispose(); rtA?.dispose(); rtB?.dispose(); blurMat?.dispose();
      canvas.remove();
    };
  });
})();
