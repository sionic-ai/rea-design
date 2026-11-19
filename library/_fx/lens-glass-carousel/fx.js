// Work panels run on in an endless horizontal strip, and a big oval glass lens at screen center pulls the passing panel to the middle (zoom), warps it like waves at the edges and bleeds the color.
// Dragging or the horizontal wheel pushes it, it slides with inertia then snaps to the nearest panel, and the faster the push the smaller the panels get. The center panel’s title and number show in the header and bottom slots
(() => {
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTex; uniform float uAspect; uniform vec2 uSize; uniform float uZoom; uniform float uDisp; uniform float uWave;
    uniform float uTime; uniform vec3 uRing; uniform float uRingK; uniform float uRingR; uniform float uRingW; uniform float uRim;
    void main() {
      vec4 base = texture2D(uTex, vUv);
      vec2 off = vUv - 0.5;
      vec2 p = vec2(off.y, -off.x * uAspect);
      float d = length(p / uSize);
      if (d > 1.0) { gl_FragColor = base; return; }
      float ang = atan(p.y, p.x);
      float pull = uZoom * 0.3 * d * d;
      float edge = smoothstep(0.58, 1.0, d);
      vec2 rd = normalize(off + 1e-6), td = vec2(-rd.y, rd.x);
      float wave = sin(ang * 2.0) * 0.55 + sin(ang) * 0.25;
      vec2 uv = 0.5 + off * (1.0 - pull) + td * wave * edge * (uSize.x + uSize.y) * 0.5 * uWave;
      vec2 split = off * uDisp * 0.004 * smoothstep(0.55, 1.0, d);
      vec4 g = texture2D(uTex, uv);
      vec3 col = vec3(texture2D(uTex, uv - split).r, g.g, texture2D(uTex, uv + split).b);
      float r = d * 0.5;
      float ring = exp(-pow((r - uRingR) / uRingW, 2.0)) * uRingK * (sin(ang * 12.0 + uTime * 3.5) * 0.12 + 0.88);
      float aura = exp(-pow((r - uRingR) / (uRingW * 6.0), 2.0)) * 0.28 * uRingK;
      float line = exp(-pow((r - 0.488) / 0.003, 2.0)) * uRim;
      col += uRing * (ring + aura) + vec3(line);
      float m = 1.0 - smoothstep(0.93, 1.0, d);
      vec4 lens = vec4(col, max(g.a, clamp(max(ring + aura, line), 0.0, 1.0)));
      gl_FragColor = mix(base, lens, m);
    }`;
  const tex = (T, label, aspect, css) => {
    const h = 640, w = Math.round(h * aspect), c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"), s = getComputedStyle(css);
    x.fillStyle = s.backgroundColor; x.fillRect(0, 0, w, h);
    x.strokeStyle = s.borderTopColor; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke(); x.strokeRect(1, 1, w - 2, h - 2);
    x.font = `500 26px ${s.fontFamily}`; const tw = x.measureText(label).width + 40;
    x.fillStyle = s.backgroundColor; x.fillRect((w - tw) / 2, h / 2 - 26, tw, 52);
    x.fillStyle = s.color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, w / 2, h / 2);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  };
  kfFx.register("lens-glass-carousel", (root, { options, reduce, hover }) => {
    const T = window.THREE, items = [...root.querySelectorAll('[data-fx-part="item"]')];
    if (!T || !items.length) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const caption = root.querySelector('[data-fx-part="caption"]'), counter = root.querySelector('[data-fx-part="counter"]');
    const cv = document.createElement("canvas"); cv.className = "fx-lens-canvas"; cv.setAttribute("aria-hidden", "true"); root.prepend(cv);
    const probe = document.createElement("span"); probe.className = "fx-lens-probe"; root.append(probe);
    const O = (k, d) => +(options[k] ?? d);
    const panelH = O("height", 0.6), gap = O("gap", 40), ease = O("ease", 0.09), friction = O("friction", 0.865), snapIdle = O("snapIdle", 120), snapEase = O("snapEase", 0.05);
    const dragSpeed = O("drag", 1.6), wheelSpeed = O("wheel", 1.4), shrinkMax = O("shrinkMax", 60), shrinkK = O("shrink", 0.25), maxW = O("maxWidth", 0.78);
    let r;
    try { r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { cv.remove(); probe.remove(); return; }
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.NoToneMapping; r.setClearColor(0x000000, 0);
    let W = Math.max(1, root.clientWidth), H = Math.max(1, root.clientHeight);
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -100, 100); cam.position.z = 10;
    const rt = new T.WebGLRenderTarget(1, 1, { colorSpace: T.SRGBColorSpace });
    const ringRgb = new T.Color(getComputedStyle(probe).outlineColor);
    const U = {
      uTex: { value: rt.texture }, uAspect: { value: W / H }, uSize: { value: new T.Vector2(1, 0.6) }, uZoom: { value: O("zoom", 0.4) }, uDisp: { value: O("dispersion", 11) },
      uWave: { value: O("wave", 0.3) }, uTime: { value: 0 }, uRing: { value: ringRgb }, uRingK: { value: O("ring", 1) * (O("glow", 4) / 17) * 1.8 }, uRingR: { value: 0.49 }, uRingW: { value: 0.01 }, uRim: { value: O("rim", 1) },
    };
    const post = new T.Scene(), postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    post.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true })));
    const src = items.map((it, i) => {
      const aspect = +(it.dataset.aspect || options.aspect || 1.6);
      const img = it.querySelector("img, video");
      const t = img ? (img.tagName === "VIDEO" ? new T.VideoTexture(img) : new T.Texture(img)) : tex(T, it.dataset.label || `${i + 1}`, aspect, probe);
      if (img && img.tagName === "IMG") { t.colorSpace = T.SRGBColorSpace; if (img.complete) t.needsUpdate = true; else img.addEventListener("load", () => (t.needsUpdate = true), { once: true }); }
      return { aspect, tex: t, item: it };
    });
    const REP = 4, total = src.length, meshes = [];
    for (let k = 0; k < REP; k++) src.forEach((s) => { const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: s.tex, toneMapped: false })); scene.add(m); meshes.push({ m, s }); });
    let pH = 0, offs = [], tot = 0;
    const layout = () => {
      const widest = Math.max(...src.map((s) => s.aspect)); pH = Math.min(H * panelH, (W * maxW) / widest);
      offs = []; let a = 0; src.forEach((s) => { offs.push(a); a += s.aspect * pH + gap; }); tot = a;
    };
    const centerOf = (i) => { const loop = Math.floor(i / total), k = ((i % total) + total) % total; return offs[k] + (src[k].aspect * pH) / 2 + loop * tot; };
    const nearest = (v) => { let best = 0, bd = Infinity; for (let i = 0; i < total; i++) { const c = offs[i] + (src[i].aspect * pH) / 2, k = Math.round((v - c) / tot), dd = Math.abs(c + k * tot - v); if (dd < bd) { bd = dd; best = i + k * total; } } return best; };
    const size = () => {
      W = Math.max(1, root.clientWidth); H = Math.max(1, root.clientHeight);
      r.setSize(W, H, false); const k = r.getPixelRatio(); rt.setSize(Math.round(W * k), Math.round(H * k));
      cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2; cam.updateProjectionMatrix();
      const narrow = W < 768; U.uAspect.value = W / H; U.uSize.value.set(1 * (W / H), (narrow ? 0.7 : 0.6) * (W / H));
      const keep = pH ? (pos - centerOf(nearest(pos))) / pH : 0, idx = pH ? nearest(pos) : 0; layout(); pos = goal = centerOf(idx) + keep * pH;
    };
    let pos = 0, goal = 0, vel = 0, prev = 0, energy = 0, last = performance.now(), snapped = true, active = -1;
    size(); pos = goal = prev = centerOf(0);
    const ro = new ResizeObserver(size); ro.observe(root);
    const show = (i) => {
      if (i === active) return; active = i;
      if (counter) counter.textContent = `${String(i + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
      if (caption) {
        const c = src[i].item.querySelector('[data-fx-part="content"]') || src[i].item;
        caption.replaceChildren(...[...c.children].map((n) => n.cloneNode(true)));
        if (!reduce && window.gsap) gsap.fromTo(caption, { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", overwrite: true });
      }
    };
    // Drag and horizontal wheel — the vertical wheel is left to page scrolling
    let drag = false, dx = 0, dist = 0, dvel = 0, dt0 = 0, pid = null;
    root.addEventListener("wheel", (e) => { if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault(); goal += e.deltaX * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? W : 1) * wheelSpeed; last = performance.now(); snapped = false; }, { passive: false, signal: ac.signal });
    cv.addEventListener("pointerdown", (e) => { if (!e.isPrimary || (e.pointerType === "mouse" && e.button)) return; drag = true; pid = e.pointerId; dx = e.clientX; dist = 0; dvel = 0; vel = 0; dt0 = performance.now(); cv.setPointerCapture?.(pid); root.classList.add("is-fx-grabbing"); }, on);
    cv.addEventListener("pointermove", (e) => { if (!drag || e.pointerId !== pid) return; const d = e.clientX - dx; dx = e.clientX; dist += Math.abs(d); const s = (e.pointerType === "mouse" ? dragSpeed : 1); goal -= d * s; dvel = -d * s; dt0 = performance.now(); last = dt0; snapped = false; }, on);
    const up = (e) => { if (!drag) return; drag = false; vel = performance.now() - dt0 > 90 ? 0 : dvel; last = performance.now(); snapped = false; root.classList.remove("is-fx-grabbing"); if (dist < 6 && e.type === "pointerup") { const bx = cv.getBoundingClientRect(), x = e.clientX - bx.left - W / 2; goal = centerOf(nearest(pos + x)); snapped = true; } };
    cv.addEventListener("pointerup", up, on); cv.addEventListener("pointercancel", up, on); cv.addEventListener("lostpointercapture", up, on);
    root.classList.remove("is-fx-grabbing");
    // Entering a section for the first time auto-advances one slot
    let entered = false;
    const io2 = new IntersectionObserver(([e]) => { if (e.isIntersecting && !entered && !reduce) { entered = true; goal = centerOf(nearest(pos) + 1); snapped = true; } }, { rootMargin: "0px 0px -20% 0px" });
    io2.observe(root);
    let raf = 0, live = false;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(3, Math.max(0.25, (now - (frame.t || now)) / 16.67)); frame.t = now;
      if (!drag && Math.abs(vel) > 0.01) { goal += vel * dt; vel *= Math.pow(friction, dt); }
      if (!drag && !snapped && Math.abs(vel) < 0.5 && now - last > snapIdle) { goal = centerOf(nearest(goal)); snapped = true; }
      const f = snapped ? snapEase : ease; pos += (goal - pos) * (1 - Math.pow(1 - (reduce ? 1 : f), dt));
      const speed = (pos - prev) / dt; prev = pos;
      const n = Math.min(1, Math.abs(speed) / Math.max(1, shrinkMax)), k = n > energy ? 0.25 : 0.06; energy += (n - energy) * (1 - Math.pow(1 - k, dt));
      const sh = 1 - shrinkK * energy, base = Math.floor(pos / tot) - 1;
      meshes.forEach(({ m, s }, j) => {
        const loop = base + Math.floor(j / total), i = j % total, c = offs[i] + (s.aspect * pH) / 2 + loop * tot;
        m.position.set(c - pos, 0, 0); m.scale.set(s.aspect * pH * sh, pH * sh, 1);
      });
      show(((nearest(pos) % total) + total) % total);
      U.uTime.value = now / 1000;
      r.setRenderTarget(rt); r.clear(); r.render(scene, cam); r.setRenderTarget(null); r.clear(); r.render(post, postCam);
    };
    const vis = new IntersectionObserver(([e]) => { if (e.isIntersecting && !live) { live = true; raf = requestAnimationFrame(frame); } else if (!e.isIntersecting && live) { live = false; cancelAnimationFrame(raf); frame.t = 0; } }, { threshold: 0 });
    vis.observe(root);
    if (!hover) cv.style.touchAction = "pan-y pinch-zoom";
    return () => {
      ac.abort(); cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); io2.disconnect();
      src.forEach((s) => s.tex.dispose()); rt.dispose(); r.dispose(); r.forceContextLoss?.(); cv.remove(); probe.remove(); root.classList.remove("is-fx-grabbing");
    };
  });
})();
