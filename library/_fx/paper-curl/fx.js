(() => {
  // For each screen point, finds the paper point on the same axis line and picks what’s visible in order: cylinder top (paper back) → cylinder inside (photo face) → still-unrolled flat
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uMap;
    uniform float uAt;
    uniform vec3 uPaper;
    uniform vec2 uPx;
    const float TAU = 6.28318531;
    const float R = 0.15915494;
    const vec2 ACROSS = vec2(-0.5, 0.8660254);
    const float SHIFT = 0.258;
    float across(vec2 p) { return dot(p, ACROSS) + SHIFT; }
    vec2 onLine(vec2 p, float t) { return p + ACROSS * (t - across(p)); }
    float cover(vec2 p) { vec2 d = min(p, 1.0 - p) * uPx; return clamp(min(d.x, d.y) + 0.5, 0.0, 1.0); }
    vec4 over(vec4 top, vec4 under) { return vec4(top.rgb * top.a + under.rgb * under.a * (1.0 - top.a), top.a + under.a * (1.0 - top.a)); }
    void main() {
      vec2 uv = (vUv - 0.25) * 2.0;
      float t = across(uv);
      vec4 col = vec4(0.0);
      if (t > uAt) {
        float near = clamp(1.0 - (t - uAt) / R, 0.0, 1.0);
        col = vec4(texture2D(uMap, uv).rgb * (1.0 - 0.2 * near * near * near), 1.0) * cover(uv);
      }
      float s = (uAt - t) / R;
      if (abs(s) <= 1.0) {
        float base = asin(s), lift = sqrt(1.0 - s * s);
        vec4 inner = vec4(0.0);
        for (int k = 2; k >= 0; k--) {
          float phi = base + TAU * float(k);
          if (phi <= 0.0) continue;
          vec2 p = onLine(uv, uAt - phi * R);
          float a = cover(p);
          if (a > 0.0) { inner = vec4(texture2D(uMap, p).rgb * (0.8 + 0.2 * lift), a); break; }
        }
        if (inner.a > 0.0) col = over(inner, col);
        else if (s > 0.0) col = over(vec4(vec3(0.0), 0.2 * s * s * s), col);
        for (int k = 0; k <= 2; k++) {
          vec2 p = onLine(uv, uAt - (3.14159265 - base + TAU * float(k)) * R);
          float a = cover(p);
          if (a > 0.0) { col = over(vec4(uPaper * (0.82 + 0.18 * (0.5 + 0.5 * pow(lift, 0.2))), a), col); break; }
        }
      }
      if (col.a <= 0.001) discard;
      gl_FragColor = vec4(col.rgb / col.a, col.a);
      #include <colorspace_fragment>
    }`;
  // A placeholder (.wf-img) draws its background, diagonal and label at its own size and uses it as paper
  const paint = (el, w, h) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    if (el.tagName === "IMG") {
      const k = Math.max(w / el.naturalWidth, h / el.naturalHeight);
      g.drawImage(el, (w - el.naturalWidth * k) / 2, (h - el.naturalHeight * k) / 2, el.naturalWidth * k, el.naturalHeight * k);
      return c;
    }
    const cs = getComputedStyle(el), tag = getComputedStyle(el, "::after");
    g.fillStyle = cs.backgroundColor;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = cs.getPropertyValue("--wf-line") || cs.color;
    g.lineWidth = Math.max(1, w / 300);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = el.dataset.label || "";
    if (label) {
      const k = w / (el.clientWidth || w);
      g.font = `500 ${12 * k}px ${cs.getPropertyValue("--wf-mono") || cs.fontFamily}`;
      const pw = g.measureText(label).width + 16.8 * k, ph = 22 * k;
      g.fillStyle = tag.backgroundColor;
      g.fillRect((w - pw) / 2, (h - ph) / 2, pw, ph);
      g.fillStyle = tag.color;
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(label, w / 2, h / 2);
    }
    return c;
  };

  kfFx.register("paper-curl", (el, { options, reduce, scroller }) => {
    const T = window.THREE, photo = el.querySelector(':scope > [data-fx-part="photo"]');
    if (reduce || !T || !photo || !window.ScrollTrigger) return;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: false, alpha: true, depth: false, stencil: false, powerPreference: "high-performance" }); } catch (e) { return; }
    gsap.registerPlugin(ScrollTrigger);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    // Paper color may be a skin variable expression, so paint it on an element and read the computed value
    const paper = new T.Color();
    const probe = document.createElement("i");
    probe.style.color = "var(--fx-paper, var(--kf-surface))";
    el.append(probe);
    paper.setStyle(getComputedStyle(probe).color);
    probe.remove();
    const uni = { uMap: { value: null }, uAt: { value: -0.15 }, uPaper: { value: paper }, uPx: { value: new T.Vector2(1, 1) } };
    const mat = new T.ShaderMaterial({ vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: FRAG, uniforms: uni, transparent: true, depthTest: false, depthWrite: false });
    const geo = new T.PlaneGeometry(2, 2), scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    scene.add(new T.Mesh(geo, mat));
    const cv = renderer.domElement;
    cv.className = "fx-paper-curl";
    cv.setAttribute("aria-hidden", "true");
    el.append(cv);
    el.classList.add("fx-paper-curl--on");
    const render = () => renderer.render(scene, cam);
    let W = 0, H = 0;
    const size = (force) => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h || (!force && w === W && h === H)) return;
      W = w; H = h;
      renderer.setSize(w, h, false);
      uni.uMap.value?.dispose();
      const tex = new T.CanvasTexture(paint(photo, Math.round((w / 2) * dpr), Math.round((h / 2) * dpr)));
      tex.colorSpace = T.SRGBColorSpace;
      tex.minFilter = tex.magFilter = T.LinearFilter;
      tex.generateMipmaps = false;
      uni.uMap.value = tex;
      uni.uPx.value.set((w / 2) * dpr, (h / 2) * dpr);
      render();
    };
    size(true);
    const ro = new ResizeObserver(() => size());
    ro.observe(el);
    const redraw = () => size(true);
    if (photo.tagName === "IMG" && !photo.complete) photo.addEventListener("load", redraw, { once: true });
    document.fonts.ready.then(() => W && redraw());
    const trigger = (options.trigger && el.closest(options.trigger)) || el;
    const set = (p) => { uni.uAt.value = p * 1.4 - 0.15; render(); };
    const st = ScrollTrigger.create({ trigger, scroller, start: options.start || "top top", end: options.end || "+=85%", onUpdate: (s) => set(s.progress), onRefresh: (s) => set(s.progress) });
    return () => {
      st.kill();
      ro.disconnect();
      photo.removeEventListener("load", redraw);
      uni.uMap.value?.dispose(); geo.dispose(); mat.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      cv.remove();
      el.classList.remove("fx-paper-curl--on");
    };
  });
})();
