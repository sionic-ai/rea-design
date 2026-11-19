// Draws the photo panel with WebGL (three) — grain always shimmers, and on interaction RGB splits sideways and a glitch makes horizontal bands jump for .3s,
// Where the cursor passed, six square cells remain (larger the faster) and only inside them RGB splits and bands bend, vanishing in about .25s. With reveal, on appearing it unveils from bottom to top in 12 steps (.75s).
// Picture is the child <img data-fx-part="image"> Uses it, and if absent draws a dark scene placeholder in the skin color (label is data-label).
(() => {
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uMap;
    uniform vec2 uRes;
    uniform float uImgAspect, uTime, uGrain, uHover, uPulse, uShift, uReveal, uSteps, uZoom;
    uniform vec4 uTrail[6];
    uniform float uTrailAmt;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      float box = uRes.x / uRes.y;
      vec2 s = box > uImgAspect ? vec2(1.0, uImgAspect / box) : vec2(box / uImgAspect, 1.0);
      vec2 cuv = (uv - 0.5) * s / uZoom + 0.5;
      float g = 0.0;
      for (int i = 0; i < 6; i++) {
        vec4 t = uTrail[i];
        vec2 q = abs((uv - t.xy) * vec2(box, 1.0));
        g = max(g, step(max(q.x, q.y), t.z) * t.w);
      }
      g *= uTrailAmt;
      float rn = hash(floor(uv * vec2(4.0, 24.0)) + floor(uTime * 30.0));
      cuv.x += (rn - 0.5) * 0.04 * g;
      float band = floor(uv.y * 24.0);
      float jump = step(0.72, hash(vec2(band, floor(uTime * 30.0)))) * uPulse;
      cuv.x += (hash(vec2(band, 3.1)) - 0.5) * 0.06 * jump;
      float sh = uShift * uHover + 0.01 * jump + 0.012 * rn * g;
      vec3 col;
      col.r = texture2D(uMap, cuv + vec2(sh, 0.0)).r;
      col.g = texture2D(uMap, cuv).g;
      col.b = texture2D(uMap, cuv - vec2(sh, 0.0)).b;
      col *= 1.0 + g * step(0.7, rn) * 0.7;
      col += (hash(uv * uRes + fract(uTime * 7.0) * 100.0) - 0.5) * uGrain;
      float shown = floor(uReveal * uSteps + 0.0001) / uSteps;
      float a = uReveal >= 1.0 ? 1.0 : step(uv.y, shown);
      gl_FragColor = vec4(col * a, a);
    }`;
  const placeholder = (el, w, h) => {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const c = cv.getContext("2d");
    const css = getComputedStyle(el);
    const pick = (n, fb) => css.getPropertyValue(n).trim() || fb;
    const bg = pick("--kf-bg", "black"), mid = pick("--fx-photo-tint", "") || pick("--kf-raised", "gray"), ink = pick("--kf-dim", "gray"), hot = pick("--kf-accent", "red");
    let seed = (el.dataset.label || "x").split("").reduce((a, ch) => a + ch.charCodeAt(0), 7);
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, mid); g.addColorStop(0.62, bg); g.addColorStop(1, bg);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = mid; c.globalAlpha = 0.5;
    for (let i = 0; i < 14; i++) { const x = rnd() * w, bw = w * (0.03 + rnd() * 0.08), bh = h * (0.2 + rnd() * 0.5); c.fillRect(x, h * 0.62 - bh, bw, bh); }
    c.globalAlpha = 1; c.fillStyle = bg;
    const cx = w * (0.35 + rnd() * 0.3), cw = w * 0.22, ch = h * 0.62;
    c.fillRect(cx - cw / 2, h - ch, cw, ch); c.fillRect(cx - cw * 0.18, h - ch * 1.22, cw * 0.36, ch * 0.3);
    c.fillStyle = hot; c.globalAlpha = 0.85;
    for (let i = 0; i < 3; i++) c.fillRect(cx - cw * 0.12 + i * cw * 0.1, h - ch * 1.1, cw * 0.05, cw * 0.05);
    c.globalAlpha = 1; c.fillStyle = ink;
    c.font = `${Math.round(h * 0.03)}px monospace`;
    c.fillText((el.dataset.label || "").toUpperCase().slice(0, 60), w * 0.03, h * 0.95);
    return cv;
  };

  kfFx.register("hud-photo-gl", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const grain = +(options.grain ?? 0.09), shift = +(options.shift ?? 0.006), trailAmt = +(options.trail ?? options.curl ?? 1), zoom = +(options.zoom ?? 1);
    const steps = parseInt(options.steps, 10) || 12, revealDur = +(options.dur ?? 0.75), wantReveal = options.reveal === "on";
    const img = el.querySelector('[data-fx-part="image"]');
    let gl = null, raf = 0, on = false, last = 0;
    const u = {
      uMap: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uImgAspect: { value: 1.6 }, uTime: { value: 0 }, uGrain: { value: grain },
      uHover: { value: 0 }, uPulse: { value: 0 }, uShift: { value: shift }, uTrailAmt: { value: trailAmt }, uTrail: { value: Array.from({ length: 6 }, () => new THREE.Vector4(-9, -9, 0, 0)) }, uReveal: { value: wantReveal && !reduce ? 0 : 1 },
      uSteps: { value: steps }, uZoom: { value: zoom },
    };
    const target = { hover: 0 };
    let hoverAt = -10, slot = 0, lastPt = null;

    const build = () => {
      const canvas = document.createElement("canvas");
      canvas.className = "fx-hpg__gl";
      canvas.setAttribute("aria-hidden", "true");
      el.appendChild(canvas);
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" }); }
      catch { canvas.remove(); return null; }
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      const scene = new THREE.Scene(), camera = new THREE.Camera();
      const src = img && img.complete && img.naturalWidth ? img : placeholder(el, 1024, Math.round(1024 / Math.max(0.5, Math.min(2.5, el.clientWidth / Math.max(1, el.clientHeight)))));
      const tex = new THREE.Texture(src);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      u.uMap.value = tex;
      u.uImgAspect.value = (src.naturalWidth || src.width) / (src.naturalHeight || src.height);
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      scene.add(mesh);
      try { renderer.compile(scene, camera); } catch {}
      const fit = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); u.uRes.value.set(w, h); };
      const ro = new ResizeObserver(fit); ro.observe(el); fit();
      return { canvas, renderer, scene, camera, tex, mat, mesh, ro };
    };
    const drop = () => {
      if (!gl) return;
      gl.ro.disconnect(); gl.tex.dispose(); gl.mat.dispose(); gl.mesh.geometry.dispose();
      gl.renderer.dispose(); gl.renderer.forceContextLoss?.(); gl.canvas.remove(); gl = null;
    };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, Math.max(0.001, (now - (last || now)) / 1000)); last = now;
      u.uTime.value += dt;
      u.uHover.value += (target.hover - u.uHover.value) * (1 - Math.exp(-dt / 0.08));
      const fade = Math.exp(-dt * 6);
      u.uTrail.value.forEach((t) => { t.w *= fade; if (t.w < 0.01) t.w = 0; });
      u.uPulse.value = Math.max(0, 1 - (u.uTime.value - hoverAt) / 0.3);
      if (gl) gl.renderer.render(gl.scene, gl.camera);
    };
    const start = () => { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!gl) gl = build();
        on = true;
        if (reduce && gl) gl.renderer.render(gl.scene, gl.camera); else start();
        if (wantReveal && !reduce && u.uReveal.value < 1 && window.gsap) gsap.to(u.uReveal, { value: 1, duration: revealDur, ease: "none", delay: +(options.delay ?? 0) });
      } else { on = false; stop(); }
    }, { rootMargin: "25% 0px" });
    io.observe(el);
    const far = new IntersectionObserver(([e]) => { if (!e.isIntersecting) { stop(); drop(); } }, { rootMargin: "150% 0px" });
    far.observe(el);

    // Trail cells — screen-relative speed .001~.015/ms maps to cell size .01~.055 (ratio of panel height), cells are stamped randomly offset from the cursor by their size
    const move = (e) => {
      if (trailAmt <= 0) return;
      const r = el.getBoundingClientRect(), now = performance.now();
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      const v = lastPt ? Math.hypot(e.clientX - lastPt.x, e.clientY - lastPt.y) / Math.max(innerHeight, 1) / Math.max(1, now - lastPt.t) : 0;
      lastPt = { x: e.clientX, y: e.clientY, t: now };
      const k = Math.min(1, Math.max(0, (v - 0.001) / 0.014)), size = 0.01 + (0.055 - 0.01) * k;
      if (k <= 0) return;
      const t = u.uTrail.value[slot]; slot = (slot + 1) % 6;
      const box = r.width / r.height;
      t.set(x + ((Math.random() - 0.5) * size * 2) / box, y + (Math.random() - 0.5) * size * 2, size, 1);
    };
    const enter = (e) => { if (e.pointerType !== "mouse" && !hover) return; target.hover = 1; hoverAt = u.uTime.value; };
    const leave = () => { target.hover = 0; lastPt = null; };
    if (hover && !reduce) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
    }
    const onReveal = (e) => { const d = e?.detail || {}; u.uReveal.value = 0; if (window.gsap) gsap.to(u.uReveal, { value: 1, duration: d.dur ?? revealDur, delay: d.delay ?? 0, ease: "none" }); };
    const onPulse = () => { hoverAt = u.uTime.value; };
    el.addEventListener("fx:reveal", onReveal);
    el.addEventListener("fx:glitch", onPulse);
    return () => {
      stop(); io.disconnect(); far.disconnect(); drop();
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("fx:reveal", onReveal); el.removeEventListener("fx:glitch", onPulse);
      if (window.gsap) gsap.killTweensOf(u.uReveal);
    };
  });
})();
