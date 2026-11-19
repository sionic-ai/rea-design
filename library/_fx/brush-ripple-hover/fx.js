// As the cursor passes over a photo, brush-stroke rings are stamped one by one at that spot, spinning, growing and fading, and the photo is pushed in the swirl direction by each stroke’s brightness (WebGL).
// Marks are drawn additively onto an offscreen plate (render target), and the photo shader reads that red value as the direction (θ = r·2π) and distance (r × strength) are determined here.
// Stop drawing once the cursor has left and the trails have fully faded
(() => {
  const paintHolder = (node, w, h, seed) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const css = getComputedStyle(node), v = (n) => css.getPropertyValue(n).trim();
    const tones = [v("--kf-raised"), v("--kf-dim"), v("--kf-ink-soft"), v("--kf-accent"), v("--kf-surface")].filter(Boolean);
    const pick = (k) => tones[(seed * 2 + k) % tones.length] || "gray";
    const sky = g.createLinearGradient(0, 0, w * 0.25, h);
    sky.addColorStop(0, pick(0)); sky.addColorStop(0.55, pick(1)); sky.addColorStop(1, pick(2));
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 7; i++) {
      const x = rnd() * w, y = rnd() * h, r = (0.12 + rnd() * 0.3) * Math.max(w, h);
      const blob = g.createRadialGradient(x, y, 0, x, y, r);
      blob.addColorStop(0, pick(i + 3)); blob.addColorStop(1, "transparent");
      g.globalAlpha = 0.55; g.fillStyle = blob; g.fillRect(0, 0, w, h);
    }
    g.globalAlpha = 0.5; g.strokeStyle = v("--kf-bg") || "white"; g.lineWidth = Math.max(1, w / 600);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = node.getAttribute("data-label") || node.getAttribute("alt") || "";
    if (label) {
      g.globalAlpha = 1;
      g.font = `400 ${Math.round(w / 45)}px ${v("--kf-font-sans") || "sans-serif"}`;
      g.textAlign = "center"; g.textBaseline = "middle";
      const tw = g.measureText(label).width + w / 30;
      g.fillStyle = v("--kf-bg") || "white"; g.fillRect(w / 2 - tw / 2, h / 2 - w / 50, tw, w / 25);
      g.fillStyle = v("--kf-ink") || "black"; g.fillText(label, w / 2, h / 2);
    }
    return c;
  };

  // Brush marks — draws a ring with an empty center as a few broken brush strokes (the original image file isn’t used)
  const paintBrush = (n = 256) => {
    const c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d");
    g.translate(n / 2, n / 2);
    const strokes = [[0, 1.1], [1.5, 0.9], [2.6, 1.2], [4.1, 0.8], [5.2, 0.7]];
    for (const [a0, len] of strokes) {
      for (let k = 0; k < 18; k++) {
        const a = a0 + (len * k) / 18, r = n * (0.3 + 0.03 * Math.sin(a * 3));
        const x = Math.cos(a) * r, y = Math.sin(a) * r, s = n * (0.11 - 0.04 * Math.abs(k / 18 - 0.5));
        const dot = g.createRadialGradient(x, y, 0, x, y, s);
        dot.addColorStop(0, "rgba(255,255,255,0.35)"); /* Not skin: mask that passes stroke strength to the shader as the red value */
        dot.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: same mask as above */
        g.fillStyle = dot;
        g.fillRect(x - s, y - s, s * 2, s * 2);
      }
    }
    return c;
  };

  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const FRAG = [
    "uniform vec2 scale; uniform float strength; uniform sampler2D uTexture; uniform sampler2D uDisplacement; varying vec2 vUv;",
    "void main(){",
    "  float r = texture2D(uDisplacement, vUv).r;",
    "  float theta = r * 6.283185307;",
    "  vec2 dir = vec2(sin(theta), cos(theta));",
    "  vec2 uv = (vUv - 0.5) / scale + 0.5 + dir * r * strength;",
    "  gl_FragColor = texture2D(uTexture, uv);",
    "}",
  ].join("\n");

  kfFx.register("brush-ripple-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !window.THREE) return;
    const box = el.querySelector('[data-fx-part="image"]');
    if (!box) return;
    const T = THREE;
    const holder = box.tagName === "IMG" || box.tagName === "CANVAS" || box.tagName === "VIDEO" ? box.parentElement : box;
    let w = holder.clientWidth || 1, h = holder.clientHeight || 1;
    // Sizes and gaps in px, or as a ratio of panel height like ”0.65h” (for sites where the original measured in screen units)
    const len = (v, d) => (v == null ? d : String(v).trim().endsWith("h") ? parseFloat(v) * h : +v);
    const max = +options.waves || 90, grow = +(options.grow ?? 0.09), fade = +(options.fade ?? 0.96);
    let size = len(options.size, 60) || 60, gap = len(options.gap, 4);
    const spin = +(options.spin ?? 0.02), strength = +(options.strength ?? 0.1);
    // Size and opacity when stamped, growth decay (scale = Damping × scale + grow — at 1 it just adds)
    const from = +(options.from ?? 0.2), alpha = +(options.alpha ?? 0.5), decay = +(options.decay ?? 1);
    // Live panels (video, or a canvas that keeps redrawing) keep drawing while on screen even without a cursor
    const live = box.tagName === "VIDEO" || options.live === "1";

    const renderer = new T.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block", zIndex: "1", pointerEvents: "none" });
    if (getComputedStyle(holder).position === "static") holder.style.position = "relative";
    holder.append(canvas);

    const target = new T.WebGLRenderTarget(w, h, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat });
    const camera = new T.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000);
    camera.position.z = 2;
    const waves = new T.Scene(), photo = new T.Scene();
    const video = box.tagName === "VIDEO" ? box : null;
    const picture = box.tagName === "IMG" || video ? null : box.tagName === "CANVAS" ? box : paintHolder(box, 1200, Math.round((1200 * h) / w), 3);
    const texture = video ? new T.VideoTexture(video) : picture ? new T.CanvasTexture(picture) : new T.TextureLoader().load(box.currentSrc || box.src, () => resize());
    texture.minFilter = texture.magFilter = T.LinearFilter;
    const imageAspect = () => (video ? video.videoWidth / (video.videoHeight || 1) || w / h : picture ? picture.width / picture.height : box.naturalWidth / (box.naturalHeight || 1) || w / h);
    const material = new T.ShaderMaterial({
      uniforms: { uDisplacement: { value: target.texture }, uTexture: { value: texture }, scale: { value: new T.Vector2(1, 1) }, strength: { value: strength } },
      vertexShader: VERT, fragmentShader: FRAG,
    });
    const Plane = T.PlaneBufferGeometry || T.PlaneGeometry;
    const quadGeo = new Plane(1, 1);
    const quad = new T.Mesh(quadGeo, material);
    photo.add(quad);
    const brush = new T.CanvasTexture(paintBrush());
    let waveGeo = new Plane(size, size);
    const meshes = [];
    for (let i = 0; i < max; i++) {
      const m = new T.Mesh(waveGeo, new T.MeshBasicMaterial({ map: brush, transparent: true, blending: T.AdditiveBlending, depthTest: false, depthWrite: false }));
      m.visible = false;
      m.rotation.z = Math.random() * Math.PI * 2;
      waves.add(m);
      meshes.push(m);
    }

    const pointer = { inside: false, x: 0, y: 0, px: 0, py: 0 };
    let current = 0, ticking = false, seen = false;

    function frame() {
      if (Math.abs(pointer.x - pointer.px) >= gap || Math.abs(pointer.y - pointer.py) >= gap) {
        current = (current + 1) % max;
        const m = meshes[current];
        m.visible = true;
        m.position.set(pointer.x, pointer.y, 0);
        m.scale.set(from, from, 1);
        m.material.opacity = alpha;
      }
      if (live && picture) texture.needsUpdate = true;
      pointer.px = pointer.x; pointer.py = pointer.y;
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(waves, camera);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(photo, camera);
      let left = 0.018;
      for (const m of meshes) {
        if (!m.visible) continue;
        m.rotation.z += spin;
        m.material.opacity *= fade;
        m.scale.x = m.scale.y = decay * m.scale.x + grow;
        left -= m.material.opacity;
        if (m.material.opacity < 0.002) m.visible = false;
      }
      if (left > 0.016 && !pointer.inside && !(live && seen)) { gsap.ticker.remove(frame); ticking = false; }
    }
    const start = () => { if (!ticking) { ticking = true; gsap.ticker.add(frame); } };

    function resize() {
      w = holder.clientWidth || 1; h = holder.clientHeight || 1;
      size = len(options.size, 60) || 60; gap = len(options.gap, 4);
      waveGeo.dispose();
      waveGeo = new Plane(size, size);
      meshes.forEach((m) => (m.geometry = waveGeo));
      renderer.setSize(w, h, false);
      target.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
      Object.assign(camera, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
      camera.updateProjectionMatrix();
      quad.scale.set(w, h, 1);
      const ia = imageAspect(), va = w / h;
      if (ia > va) material.uniforms.scale.value.set(ia / va, 1); else material.uniforms.scale.value.set(1, va / ia);
      renderer.setRenderTarget(null);
      renderer.render(photo, camera);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(holder);
    resize();
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && live) start(); });
    io.observe(holder);

    const move = (e) => {
      const r = holder.getBoundingClientRect();
      pointer.x = e.clientX - r.left - w / 2;
      pointer.y = h / 2 - (e.clientY - r.top);
    };
    const enter = (e) => {
      if (e.pointerType !== "mouse") return;
      move(e);
      pointer.px = pointer.x; pointer.py = pointer.y;
      pointer.inside = true;
      start();
    };
    const leave = () => (pointer.inside = false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);

    return () => {
      gsap.ticker.remove(frame);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      ro.disconnect();
      io.disconnect();
      meshes.forEach((m) => m.material.dispose());
      [waveGeo, quadGeo, material, brush, texture, target, renderer].forEach((x) => x.dispose());
      canvas.remove();
    };
  });
})();
