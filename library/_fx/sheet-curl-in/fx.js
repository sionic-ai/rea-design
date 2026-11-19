(() => {
  // One photo panel, curled like a cylinder around its top edge (bottom edge rolled toward the screen), floats up from below and lies down in place, unrolling over 1.5s.
  // Since plates extend beyond their element (200px below, 120 forward), one screen-fixed canvas draws them all instead of a canvas per plate.
  const VERT = `
    uniform float uP, uDist, uShape, uMotion, uSlide;
    uniform vec2 uSize, uCenter;
    varying vec2 vUv;
    float quint(float t) { return 1.0 - pow(1.0 - t, 5.0); }
    void main() {
      vUv = uv;
      float d = 1.0 - quint(clamp(uP, 0.0, 1.0));
      float a = uMotion / uShape * d;
      vec3 p = position;
      float lift = 0.0;
      if (a > 0.0001) {
        float r = (0.5 - position.y) * a;
        p.y = 0.5 - sin(r) / a;
        lift = uSize.y * (1.0 - cos(r)) / a;
      }
      vec4 w = modelMatrix * vec4(p, 1.0);
      w.z += lift;
      float t = 0.25 / uShape * uMotion * d;
      float top = uCenter.y + uSize.y * 0.5, dy = w.y - top, z = w.z;
      w.y = top + dy * cos(t) + z * sin(t);
      w.z = (z * cos(t) - dy * sin(t)) * (1.0 + 0.3 * uMotion) + 120.0 * uMotion * d;
      w.y -= 200.0 * uMotion * d * uSlide;
      float k = w.z / uDist;
      w.xy = uCenter * (1.0 - k) + (w.xy - uCenter) * (1.0 - 0.25 * k);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  const FRAG = `
    precision highp float;
    uniform sampler2D uMap;
    uniform vec2 uSize;
    uniform float uRadius, uOpacity, uP, uZoom, uShift;
    varying vec2 vUv;
    float quint(float t) { return 1.0 - pow(1.0 - t, 5.0); }
    void main() {
      vec2 h = uSize * 0.5, q = abs(vUv * uSize - h) - (h - min(uRadius, min(h.x, h.y)));
      if (length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - min(uRadius, min(h.x, h.y)) > 0.0) discard;
      float d = 1.0 - quint(clamp(uP, 0.0, 1.0));
      vec2 uv = (vUv - 0.5) / (1.0 + uZoom * d) + 0.5;
      uv.y += uShift * d;
      gl_FragColor = texture2D(uMap, uv);
      gl_FragColor.a *= uOpacity;
      #include <colorspace_fragment>
    }`;
  const DUR = 1500;

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
    if (label && tag.display !== "none") {
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

  // One canvas per screen — removed once the board is fully out
  let stage = null;
  const cards = new Set();
  const getStage = () => {
    if (stage) return stage;
    const T = window.THREE;
    let renderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" }); } catch (e) { return null; }
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const cv = renderer.domElement;
    cv.className = "fx-sheet-curl-in";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, 0.1, 5000);
    const geo = new T.PlaneGeometry(1, 1, 1, 256);
    let W = 0, H = 0, raf = 0;
    const size = () => {
      W = Math.max(1, innerWidth); H = Math.max(1, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      cam.aspect = W / H;
      cam.position.z = H / (2 * Math.tan(T.MathUtils.degToRad(20)));
      cam.far = cam.position.z + 2000;
      cam.updateProjectionMatrix();
    };
    size();
    const frame = (now) => {
      raf = 0;
      let busy = false;
      for (const c of cards) busy = c.tick(now, W, H, cam.position.z) || busy;
      renderer.render(scene, cam);
      if (busy && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const resize = () => { size(); kick(); };
    addEventListener("resize", resize);
    addEventListener("scroll", kick, { passive: true });
    stage = { T, scene, geo, kick, drop: () => {
      if (cards.size) return;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("scroll", kick);
      geo.dispose(); renderer.dispose(); renderer.forceContextLoss(); cv.remove();
      stage = null;
    } };
    return stage;
  };

  kfFx.register("sheet-curl-in", (el, { options, reduce }) => {
    const photo = el.querySelector('[data-fx-part="photo"]');
    if (reduce || !window.THREE || !photo || innerWidth < +(options.min ?? 1024)) return;
    const s = getStage();
    if (!s) return;
    const { T } = s;
    const motion = Math.min(1, Math.max(0, +(options.motion ?? 1)));
    const fade = +(options.fade ?? 0) * 1000, delay = +(options.delay ?? 0) * 1000;
    const uni = {
      uMap: { value: null }, uP: { value: 0 }, uDist: { value: 1 }, uShape: { value: 1 }, uMotion: { value: motion }, uSlide: { value: 1 },
      uSize: { value: new T.Vector2(1, 1) }, uCenter: { value: new T.Vector2() }, uRadius: { value: 0 }, uOpacity: { value: fade ? 0 : 1 },
      uZoom: { value: +(options.zoom ?? 0) }, uShift: { value: +(options.shift ?? 0) },
    };
    const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uni, transparent: true, depthTest: false, depthWrite: false });
    const mesh = new T.Mesh(s.geo, mat);
    mesh.frustumCulled = false;
    mesh.visible = false;
    s.scene.add(mesh);
    el.classList.add("fx-sheet-curl-in--wait");
    let startAt = null, done = false, near = false, tw = 0, th = 0, textSent = false;
    const text = +(options.text ?? 0.35);
    const texture = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (!w || !h || (w === tw && h === th)) return;
      tw = w; th = h;
      uni.uMap.value?.dispose();
      const tex = new T.CanvasTexture(paint(photo, w, h));
      tex.colorSpace = T.SRGBColorSpace;
      tex.minFilter = tex.magFilter = T.LinearFilter;
      tex.generateMipmaps = false;
      uni.uMap.value = tex;
      uni.uRadius.value = Math.max(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, parseFloat(getComputedStyle(photo).borderTopLeftRadius) || 0);
    };
    const finish = () => {
      done = true;
      mesh.visible = false;
      el.classList.remove("fx-sheet-curl-in--wait", "fx-sheet-curl-in--on");
      s.kick();
    };
    const card = {
      tick(now, W, H, dist) {
        if (done) return false;
        // A hero photo opened by an event is not drawn before it starts. The board rolled up before opening must not show first on the hero.
        if ((!near || options.on) && startAt === null) { mesh.visible = false; return false; }
        if (!uni.uMap.value) texture();
        const r = el.getBoundingClientRect();
        const w = Math.max(1, r.width), h = Math.max(1, r.height);
        mesh.position.set(r.left + w / 2 - W / 2, H / 2 - (r.top + h / 2), 0);
        mesh.scale.set(w, h, 1);
        uni.uSize.value.set(w, h);
        uni.uCenter.value.set(mesh.position.x, mesh.position.y);
        uni.uDist.value = dist;
        uni.uShape.value = Math.min(1.35, Math.max(0.75, Math.sqrt((H * 0.65) / h)));
        mesh.visible = true;
        if (startAt === null || now < startAt) return false;
        const p = Math.min(1, (now - startAt) / DUR);
        uni.uP.value = p;
        if (fade) uni.uOpacity.value = T.MathUtils.smoothstep(Math.min(1, (now - startAt) / fade), 0, 1);
        if (!textSent && p >= text) { textSent = true; el.dispatchEvent(new CustomEvent("fx:sheet-curl-in:text", { bubbles: true })); }
        if (p >= 1) { finish(); return false; }
        return true;
      },
    };
    cards.add(card);
    const go = () => {
      if (startAt !== null || done) return;
      el.classList.add("fx-sheet-curl-in--on");
      startAt = performance.now() + delay + +(options.stagger ?? 0) * 1000 * order;
      s.kick();
    };
    const nearIo = new IntersectionObserver(([e]) => { near = e.isIntersecting; s.kick(); }, { rootMargin: "100px 0px" });
    nearIo.observe(el);
    // For a group, it starts together with the group’s entrance and each item inside is delayed by stagger in order
    const group = (options.group && el.closest(options.group)) || el;
    const order = group === el ? 0 : Math.max(0, [...group.querySelectorAll('[data-fx~="sheet-curl-in"]')].indexOf(el));
    let io = null, onEvent = null;
    if (options.on) {
      onEvent = go;
      addEventListener(options.on, onEvent, { once: true });
    } else {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); go(); } }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      io.observe(group);
    }
    const ro = new ResizeObserver(() => { texture(); s.kick(); });
    ro.observe(el);
    s.kick();
    return () => {
      nearIo.disconnect(); io?.disconnect(); ro.disconnect();
      if (onEvent) removeEventListener(options.on, onEvent);
      cards.delete(card);
      s.scene.remove(mesh);
      uni.uMap.value?.dispose(); mat.dispose();
      el.classList.remove("fx-sheet-curl-in--wait", "fx-sheet-curl-in--on");
      s.drop();
    };
  });
})();
