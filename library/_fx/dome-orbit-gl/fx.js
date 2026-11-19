// A photo dome (brand home) with the camera at the center of a ring of twelve panels (radius 15.2) looking outward. Wheel·push turns the whole orbit, like turning your head.
// Slot e (0~11) sits at e/12·2π each, height is the cos of the angle .52π + .24·(e%3 − 1) × radius × .88 (anything rising up is pulled down by .8) − .9, and panels face the center.
// Each panel sags sideways by cos(t × .18) × .11 and recedes by |t|^1.25 × .05 according to vertical distance t. The wheel adds deltaY × .18 to the velocity (±180), which decays by .92 per frame at 60fps,
// The orbit rotates by distance pushed while cooling × .005 × .5 × −1 × .253. Slots that left the screen are swapped for the next work image (up to four per frame).
(() => {
  const VERT = `uniform float uFreq;
uniform float uCurve;
uniform float uDepth;
uniform float uSpeed;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  float t = w.y;
  vec3 p = position;
  p.x += uCurve * cos(t * uFreq) - uCurve;
  p.y -= sin(uv.x * 3.14159265) * uSpeed;
  p.z -= pow(abs(t), 1.25) * uDepth;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
  const FRAG = `uniform sampler2D uMap;
uniform float uAlpha;
varying vec2 vUv;
void main() { vec4 c = texture2D(uMap, vUv); gl_FragColor = vec4(c.rgb, c.a * uAlpha); }`;
  const cssVar = (el, n, fb) => getComputedStyle(el).getPropertyValue(n).trim() || fb;
  const mod = (a, n) => ((a % n) + n) % n;

  function slate(T, el, item, ratio) {
    const w = 420, h = Math.round(420 / ratio);
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g = cv.getContext("2d");
    const tone = item.getAttribute("data-tone"), dark = tone === "dark", mid = tone === "mid";
    const bg = cssVar(el, dark ? "--kf-contrast-bg" : mid ? "--kf-dim" : "--kf-raised", "transparent");
    const ink = cssVar(el, dark || mid ? "--kf-contrast-ink" : "--kf-dim", "transparent");
    const fam = cssVar(el, "--kf-font-sans", "sans-serif");
    const words = (item.getAttribute("data-label") || "").split(" · ");
    const video = item.hasAttribute("data-video");
    const draw = (time) => {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = ink; g.globalAlpha = 0.2; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
      g.globalAlpha = 1; g.fillStyle = ink;
      g.font = `400 18px ${fam}`; g.textAlign = "center"; g.textBaseline = "middle";
      words.forEach((s, i) => g.fillText(s, w / 2, h / 2 + (i - (words.length - 1) / 2) * 24, w * 0.8));
      if (video) {
        // Playing — a faint light band sweeps diagonally once every 6s (like a video changing scenes) and the bar below fills every 4s
        const x = (((time / 6) % 1) * 1.6 - 0.3) * w;
        const grad = g.createLinearGradient(x - w * 0.25, 0, x + w * 0.25, h);
        grad.addColorStop(0, "transparent"); grad.addColorStop(0.5, ink); grad.addColorStop(1, "transparent");
        g.globalAlpha = 0.18; g.fillStyle = grad; g.fillRect(0, 0, w, h);
        g.fillStyle = ink; g.globalAlpha = 0.3; g.fillRect(18, h - 20, w - 36, 2); g.globalAlpha = 1; g.fillRect(18, h - 20, (w - 36) * ((time % 4) / 4), 2);
      }
    };
    draw(0);
    const tex = new T.CanvasTexture(cv);
    tex.minFilter = T.LinearFilter;
    return { tex, ratio, draw: video ? draw : null };
  }

  kfFx.register("dome-orbit-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!T || !items.length) return;
    const R = +(options.radius ?? 15.2), count = Math.max(4, +(options.count ?? 12) || 12);
    const planeH = +(options["plane-h"] ?? 8.1), minW = +(options["min-w"] ?? 5.6), maxW = +(options["max-w"] ?? 9.9), shrink = +(options.collision ?? 0.94);
    const yScale = +(options["y-scale"] ?? 0.88), pull = +(options.pull ?? 0.8), yOff = +(options["y-offset"] ?? -0.9);
    const wheelFactor = +(options["wheel-factor"] ?? 0.5), dir = +(options.dir ?? -1), sens = +(options.sens ?? 0.253);
    const start = options.start || "auto";
    const reach = 0.95 * R;
    const slots = Array.from({ length: count }, (_, e) => {
      const r = (e / count) * Math.PI * 2, n = 0.52 * Math.PI + 0.24 * ((e % 3) - 1), i = R * Math.cos(n) * yScale;
      return new T.Vector3(reach * Math.cos(r), i - Math.max(0, i) * pull + yOff, reach * Math.sin(r));
    });
    const size = (ratio) => ({ w: Math.max(minW, Math.min(maxW, planeH * ratio)) * shrink, h: planeH * shrink });

    let canvas = el.querySelector('canvas[data-fx-part="canvas"]');
    const madeCanvas = !canvas;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.setAttribute("data-fx-part", "canvas"); el.prepend(canvas); }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(+(options.fov ?? 60), 1, 0.1, 1000);
    const uni = { uFreq: { value: +(options.freq ?? 0.18) }, uCurve: { value: +(options.curve ?? 0.11) }, uDepth: { value: +(options.depth ?? 0.05) }, uSpeed: { value: 0 } };
    const slates = items.map((it) => slate(T, el, it, +it.getAttribute("data-ratio") || 0.75));
    const assign = [];
    const meshes = slots.map((pos, k) => {
      const idx = mod(mod(k - 2, count), items.length);
      assign[k] = idx;
      const s = slates[idx], sz = size(s.ratio);
      const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: T.DoubleSide, uniforms: { ...uni, uMap: { value: s.tex }, uAlpha: { value: 0 } } });
      const m = new T.Mesh(new T.PlaneGeometry(sz.w, sz.h, 16, 16), mat);
      m.position.set(pos.x, pos.y - 1.25, pos.z - 0.45);
      m.lookAt(0, 0, 0);
      m.position.copy(pos);
      scene.add(m);
      return m;
    });
    const setSlate = (k, idx) => {
      assign[k] = idx;
      const m = meshes[k], s = slates[idx], sz = size(s.ratio);
      m.material.uniforms.uMap.value = s.tex;
      m.geometry.dispose();
      m.geometry = new T.PlaneGeometry(sz.w, sz.h, 16, 16);
    };

    let W = 1, H = 1;
    const measure = () => {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    measure();

    const st = { live: false, vel: 0, orbit: 0, next: count, seenSet: Array(count).fill(false) };
    const ac = new AbortController(), sig = { signal: ac.signal };
    let seen = true;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);
    const push = (d) => { if (st.live) st.vel = Math.max(-180, Math.min(180, st.vel + d)); };
    addEventListener("wheel", (e) => { if (seen) push(0.18 * e.deltaY); }, sig);
    const drag = { id: null, axis: null, sx: 0, sy: 0, x: 0, y: 0, until: 0 };
    el.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" || !st.live || drag.id !== null) return; st.vel = 0; Object.assign(drag, { id: e.pointerId, axis: null, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY }); }, sig);
    el.addEventListener("pointermove", (e) => {
      if (drag.id !== e.pointerId) return;
      let d = 0;
      if (drag.axis) d = drag.axis === "x" ? e.clientX - drag.x : e.clientY - drag.y;
      else if (Math.max(Math.abs(e.clientX - drag.sx), Math.abs(e.clientY - drag.sy)) >= 6) { drag.axis = Math.abs(e.clientX - drag.sx) >= Math.abs(e.clientY - drag.sy) ? "x" : "y"; d = drag.axis === "x" ? e.clientX - drag.sx : e.clientY - drag.sy; }
      drag.x = e.clientX; drag.y = e.clientY;
      if (drag.axis) push(-0.9 * d);
    }, sig);
    const up = (e) => { if (drag.id !== e.pointerId) return; if (drag.axis) drag.until = performance.now() + 250; drag.id = null; drag.axis = null; };
    el.addEventListener("pointerup", up, sig);
    el.addEventListener("pointercancel", up, sig);
    const ray = new T.Raycaster(), ptr = new T.Vector2(1e4, 1e4);
    const setPtr = (e) => { const r = el.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
    const pick = () => { ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(meshes, false); return h.length ? meshes.indexOf(h[0].object) : -1; };
    el.addEventListener("pointermove", (e) => { setPtr(e); if (!st.live) return; const k = pick(); el.style.cursor = k >= 0 ? "pointer" : ""; }, sig);
    el.addEventListener("click", (e) => {
      if (!st.live || drag.axis || performance.now() < drag.until || e.target.closest("a,button")) return;
      setPtr(e);
      const k = pick();
      const href = k >= 0 ? items[assign[k]].getAttribute("data-href") : null;
      if (href) { const a = document.createElement("a"); a.href = href; el.append(a); a.click(); a.remove(); }
    }, sig);

    // Reveal — starting from the top-most slots (left first if tied), rise from 1.25 below, .45 behind, .92 scale at .78t and appear at .48t (t = .98/1.1, gap min(.045, t/18))
    const tls = [];
    const reveal = (t = 0.98 / 1.1) => {
      const tl = gsap.timeline({ onComplete: () => { st.live = true; el.dispatchEvent(new CustomEvent("fx:dome-orbit-gl", { detail: { live: true } })); } });
      tls.push(tl);
      if (reduce) { meshes.forEach((m, k) => { m.position.copy(slots[k]); m.scale.setScalar(1); m.material.uniforms.uAlpha.value = 1; }); tl.progress(1); return; }
      [...slots.keys()].sort((a, b) => slots[b].y - slots[a].y || slots[a].x - slots[b].x).forEach((k, n) => {
        const m = meshes[k], s = slots[k];
        m.position.set(s.x, s.y - 1.25, s.z - 0.45);
        m.scale.setScalar(0.92);
        m.material.uniforms.uAlpha.value = 0;
        const at = n * Math.min(0.045, t / 18);
        tl.to(m.position, { y: s.y, z: s.z, duration: 0.78 * t, ease: "power3.out" }, at);
        tl.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.78 * t, ease: "power3.out" }, at);
        tl.to(m.material.uniforms.uAlpha, { value: 1, duration: 0.48 * t, ease: "power2.out" }, at + 0.03);
      });
    };
    el.addEventListener("fx:reveal", (e) => reveal(e.detail?.t), sig);
    if (start === "auto") reveal(reduce ? 0.4 / 1.1 : 0.98 / 1.1);

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const look = new T.Vector3(), dirV = new T.Vector3();
    const tick = (time, dt) => {
      if (!seen) return;
      const o = 60 * Math.max(0, Math.min(dt / 1000, 0.05)), a = Math.pow(0.92, o);
      const v = st.vel, disp = (0.92 * v * (1 - a)) / 0.08;
      st.vel = v * a;
      uni.uSpeed.value = 0.5 * 0.005 * st.vel * wheelFactor * dir;
      if (st.live) st.orbit += 0.005 * disp * wheelFactor * dir * sens;
      camera.position.set(0, 0, 0);
      look.set(0.9 * R * Math.sin(st.orbit), -4, 0.9 * R * Math.cos(st.orbit));
      camera.lookAt(look);
      camera.updateMatrixWorld();
      // Only the eight spots nearest the viewing side are shown — spots dropped from that set are swapped for the next image
      dirV.set(0.9 * R * Math.sin(st.orbit), -4, 0.9 * R * Math.cos(st.orbit));
      const ranked = slots.map((s, k) => ({ k, d: s.x * dirV.x + s.y * dirV.y + s.z * dirV.z })).sort((p, q) => q.d - p.d);
      const vis = new Set(ranked.slice(0, count - 4).map((r) => r.k));
      let swapped = 0;
      for (let j = 0; j < count; j++) {
        const k = (j + 9) % count;
        const now = vis.has(k);
        if (st.live && st.seenSet[k] && !now && swapped < 4) { setSlate(k, mod(st.next, items.length)); st.next++; swapped++; }
        st.seenSet[k] = now;
      }
      for (let k = 0; k < count; k++) { const s = slates[assign[k]]; if (s.draw && vis.has(k)) { s.draw(time); s.tex.needsUpdate = true; } }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    return () => {
      ac.abort(); ro.disconnect(); io.disconnect();
      gsap.ticker.remove(tick);
      tls.forEach((t) => t.kill());
      meshes.forEach((m) => { gsap.killTweensOf([m.position, m.scale, m.material.uniforms.uAlpha]); m.geometry.dispose(); m.material.dispose(); });
      slates.forEach((s) => s.tex.dispose());
      renderer.dispose();
      if (madeCanvas) canvas.remove();
      el.style.cursor = "";
    };
  });
})();
