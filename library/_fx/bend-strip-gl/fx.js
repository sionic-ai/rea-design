// Photo plates joined in one line (horizontal x or vertical y), an endless strip flowing by wheel or push inside a tilted group (Brand work list · detail).
// The panel sags sideways by cos(t × freq) × curve − curve according to its world-axis distance t, and recedes by |t|^1.25 × depth, so the band bends like a bow.
// Wheel adds deltaY × .18 to the velocity (±180) and cools it by .92 each frame, pushing the board each frame by .005 × velocity × wheel-factor × direction.
// Names on the board (data-top·data-bottom) sit tilted by clockwise angles (32°·12°), fade as flow speeds up (speed ÷ 14), and return when it stops.
(() => {
  const VERT = `uniform float uFreq;
uniform float uCurve;
uniform float uDepth;
uniform float uSpeed;
uniform float uAxis;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec3 p = position;
  if (uAxis < 0.5) {
    float t = w.x;
    p.y += cos(t * uFreq) * uCurve - uCurve;
    p.z -= pow(abs(t), 1.25) * uDepth;
  } else {
    float t = w.y;
    p.x += uCurve * cos(t * uFreq) - uCurve;
    p.y -= sin(uv.x * 3.14159265) * uSpeed;
    p.z -= pow(abs(t), 1.25) * uDepth;
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
  const FRAG = `uniform sampler2D uMap;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uMap, vUv);
  gl_FragColor = vec4(c.rgb, c.a * uAlpha);
}`;
  const cssVar = (el, n, fb) => getComputedStyle(el).getPropertyValue(n).trim() || fb;
  const nums = (s, fb) => (s ? String(s).split(",").map(Number) : fb);
  const mod = (a, n) => ((a % n) + n) % n;

  // Photo placeholder — keeps the ratio, with a diagonal X and a label. For video slots, the bar below fills up every 4s
  function slate(T, el, item, ratio) {
    const w = 360, h = Math.round(360 / ratio);
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
      g.font = `400 16px ${fam}`; g.textAlign = "center"; g.textBaseline = "middle";
      words.forEach((s, i) => g.fillText(s, w / 2, h / 2 + (i - (words.length - 1) / 2) * 22, w * 0.8));
      if (video) {
        // Playing — a faint light band sweeps diagonally once every 6s (like a video changing scenes) and the bar below fills every 4s
        const x = (((time / 6) % 1) * 1.6 - 0.3) * w;
        const grad = g.createLinearGradient(x - w * 0.25, 0, x + w * 0.25, h);
        grad.addColorStop(0, "transparent"); grad.addColorStop(0.5, ink); grad.addColorStop(1, "transparent");
        g.globalAlpha = 0.18; g.fillStyle = grad; g.fillRect(0, 0, w, h);
        g.fillStyle = ink; g.globalAlpha = 0.3; g.fillRect(16, h - 18, w - 32, 2); g.globalAlpha = 1; g.fillRect(16, h - 18, (w - 32) * ((time % 4) / 4), 2);
      }
    };
    draw(0);
    const tex = new T.CanvasTexture(cv);
    tex.minFilter = T.LinearFilter;
    return { tex, draw: video ? draw : null };
  }
  // One-line name on a plate — a text plate vertically centered and anchored to the left edge
  function label(T, el, text, size) {
    const px = 96, fam = cssVar(el, "--kf-font-display", "serif");
    const cv = document.createElement("canvas");
    const g = cv.getContext("2d");
    const font = `${cssVar(el, "--kf-weight-display", "300")} ${px}px ${fam}`;
    g.font = font;
    const tw = Math.ceil(g.measureText(text).width) + 8;
    cv.width = tw; cv.height = Math.ceil(px * 1.3);
    g.font = font; g.textBaseline = "middle";
    g.fillStyle = cssVar(el, "--kf-bg", "transparent");
    g.fillText(text, 4, cv.height / 2);
    const tex = new T.CanvasTexture(cv);
    tex.minFilter = T.LinearFilter;
    const h = size * 1.3, w = h * (cv.width / cv.height);
    const geo = new T.PlaneGeometry(w, h);
    geo.translate(w / 2, 0, 0);
    return { tex, geo };
  }

  kfFx.register("bend-strip-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!T || !items.length) return;
    const axisY = options.axis === "y";
    const fov = +(options.fov ?? (axisY ? 34 : 28)), camZ = +(options.z ?? 3.3);
    const sizeX = +(options["size-x"] ?? (axisY ? 1.1 : 0.72)), sizeY = +(options["size-y"] ?? 1.28);
    const gap = +(options.gap ?? (axisY ? 0.08 : 0.16));
    const pos = nums(options.pos, axisY ? [0.72, 0, 0.35] : [-0.9, 0.1, 0.32]);
    const rot = nums(options.rot, axisY ? [0.28, -0.02, -0.14] : [-0.02, 0.28, -0.03]);
    const freq = +(options.freq ?? 0.18), curve = +(options.curve ?? (axisY ? 0.32 : 0.12)), depth = +(options.depth ?? (axisY ? 0 : 0.2));
    const wheelFactor = +(options["wheel-factor"] ?? (axisY ? 0.5 : 0.52)), dir = +(options.dir ?? -1);
    const dragMul = +(options.drag ?? (axisY ? 0.315 : 0.9));
    const hourDeg = +(options.hour ?? 32), minuteDeg = +(options.minute ?? 12);

    let canvas = el.querySelector('canvas[data-fx-part="canvas"]');
    const madeCanvas = !canvas;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.setAttribute("data-fx-part", "canvas"); el.prepend(canvas); }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov, 1, 0.01, 200);
    camera.position.set(0, 0, camZ);
    const group = new T.Group();
    group.position.set(pos[0], pos[1], pos[2]);
    group.rotation.set(rot[0], rot[1], rot[2]);
    scene.add(group);
    const uni = { uFreq: { value: freq }, uCurve: { value: curve }, uDepth: { value: depth }, uSpeed: { value: 0 }, uAxis: { value: axisY ? 1 : 0 } };
    const geo = new T.PlaneGeometry(1, 1, 16, 16);
    const nameMat = { uAlpha: { value: 1 } };
    const made = [];
    const planes = items.map((item, i) => {
      const ratio = +item.getAttribute("data-ratio") || (axisY ? 2 / 3 : sizeX / sizeY);
      const s = slate(T, el, item, ratio);
      const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: T.DoubleSide, uniforms: { ...uni, uMap: { value: s.tex }, uAlpha: { value: 1 } } });
      const mesh = new T.Mesh(geo, mat);
      // Fit proportionally inside the box (sizeX × sizeY) as contain — a vertical strip matches the width and sets the height by ratio
      let w, h;
      if (axisY) { w = sizeX; h = sizeX / ratio; } else if (ratio > sizeX / sizeY) { w = sizeX; h = sizeX / ratio; } else { h = sizeY; w = sizeY * ratio; }
      mesh.scale.set(w, h, 1);
      mesh.userData = { i, item, w, h, cat: (item.getAttribute("data-category") || "").toLowerCase(), slate: s };
      [["data-top", 0.1, -0.16, 0.045, hourDeg], ["data-bottom", 0.088, -0.105, -0.015, minuteDeg]].forEach(([attr, size, x, y, deg]) => {
        const text = item.getAttribute(attr);
        if (!text) return;
        const lb = label(T, el, text, size);
        const m = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, uniforms: { ...uni, uMap: { value: lb.tex }, uAlpha: nameMat.uAlpha } });
        const t = new T.Mesh(lb.geo, m);
        t.position.set(x, y, 0.001);
        t.rotation.z = (deg * Math.PI) / 180;
        mesh.add(t);
        made.push(lb.tex, lb.geo, m);
      });
      group.add(mesh);
      made.push(s.tex, mat);
      return mesh;
    });

    let W = 1, H = 1;
    const measure = () => {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      // The vertical band moves the group depending on width (original: 0 below 767, between .6 and .15 for 768 to 1400, pos x beyond that)
      if (axisY && options.pos == null) group.position.x = W <= 767 ? 0 : W <= 1400 ? 0.6 + ((1400 - W) / 632) * (0.15 - 0.6) : pos[0];
    };
    measure();

    let shown = planes.slice();
    let total = 1, half = 0.5;
    const lay = (list) => {
      shown = list;
      planes.forEach((p) => { p.visible = false; });
      if (axisY) {
        total = list.reduce((s, p) => s + p.userData.h, 0) + list.length * gap;
        half = total / 2;
        let y = 0, prev = 0;
        list.forEach((p, k) => { if (k > 0) y -= prev / 2 + gap + p.userData.h / 2; prev = p.userData.h; p.position.set(0, mod(y + half, total) - half, 0); p.visible = true; });
      } else {
        const D = sizeX + gap;
        total = Math.max(list.length, 1) * D; half = total / 2;
        list.forEach((p, k) => { p.position.set(mod(k * D + half, total) - half, 0, 0); p.visible = true; });
      }
    };
    lay(planes);

    let vel = 0;
    const st = { filtering: false, active: -1 };
    const ac = new AbortController(), sig = { signal: ac.signal };
    const push = (d) => { vel = Math.max(-180, Math.min(180, vel + d)); };
    let seen = true;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);
    addEventListener("wheel", (e) => { if (seen && !st.filtering) push(0.18 * e.deltaY); }, sig);
    const drag = { id: null, axis: null, x: 0, y: 0, sx: 0, sy: 0 };
    el.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") return; Object.assign(drag, { id: e.pointerId, axis: null, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }); vel = axisY ? vel : 0; }, sig);
    el.addEventListener("pointermove", (e) => {
      if (drag.id !== e.pointerId) return;
      let d = 0;
      if (axisY) { d = e.clientY - drag.y; if (Math.abs(e.clientY - drag.sy) >= 6) drag.axis = "y"; }
      else if (drag.axis) d = drag.axis === "x" ? e.clientX - drag.x : e.clientY - drag.y;
      else if (Math.max(Math.abs(e.clientX - drag.sx), Math.abs(e.clientY - drag.sy)) >= 6) { drag.axis = Math.abs(e.clientX - drag.sx) >= Math.abs(e.clientY - drag.sy) ? "x" : "y"; d = drag.axis === "x" ? e.clientX - drag.sx : e.clientY - drag.sy; }
      drag.x = e.clientX; drag.y = e.clientY;
      if (drag.axis) push(-dragMul * d);
    }, sig);
    const up = (e) => { if (drag.id === e.pointerId) drag.id = null; };
    el.addEventListener("pointerup", up, sig);
    el.addEventListener("pointercancel", up, sig);

    const ray = new T.Raycaster(), ptr = new T.Vector2(1e4, 1e4);
    const pick = () => { ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(shown, false); return h.length ? h[0].object : null; };
    addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }, sig);
    el.addEventListener("click", (e) => {
      if (drag.axis || e.target.closest("a,button")) return;
      const p = pick();
      const href = p?.userData.item.getAttribute("data-href");
      if (href) location.href = href;
    }, sig);

    // Category change — the visible panels fade over .28s at .09s intervals, shrink to .96 and slide up (whole panel blur 10px), then new panels rise from .88 scale over .52s power3.out at .055s intervals
    const tls = [];
    el.addEventListener("fx:filter", (e) => {
      const cat = String(e.detail?.category || "all").toLowerCase();
      const next = cat === "all" ? planes.slice() : planes.filter((p) => p.userData.cat === cat);
      if (reduce) { lay(next); return; }
      st.filtering = true; vel = 0;
      const out = gsap.timeline({ onComplete: () => {
        lay(next);
        const inn = gsap.timeline({ onComplete: () => { st.filtering = false; } });
        tls.push(inn);
        inn.to(canvas, { filter: "blur(0px)", opacity: 1, duration: 0.48, ease: "power2.out" }, 0);
        next.slice(0, 8).forEach((p, k) => {
          p.material.uniforms.uAlpha.value = 0;
          p.scale.set(0.88 * p.userData.w, 0.88 * p.userData.h, 1);
          inn.to(p.material.uniforms.uAlpha, { value: 1, duration: 0.52, ease: "power3.out" }, 0.055 * k);
          inn.to(p.scale, { x: p.userData.w, y: p.userData.h, duration: 0.52, ease: "power3.out" }, 0.055 * k);
          inn.fromTo(p.position, { y: p.position.y - 0.035 }, { y: p.position.y, duration: 0.52, ease: "power3.out" }, 0.055 * k);
        });
        inn.fromTo(nameMat.uAlpha, { value: 0 }, { value: 1, duration: 0.5, ease: "power3.out" }, Math.min(next.length, 8) * 0.055 + 0.52 + 0.1);
      } });
      tls.push(out);
      out.to(nameMat.uAlpha, { value: 0, duration: 0.26, ease: "power2.in" }, 0.03);
      shown.forEach((p, k) => {
        const at = 0.04 + 0.09 * k;
        out.to(p.material.uniforms.uAlpha, { value: 0, duration: 0.28, ease: "power2.in" }, at);
        out.to(p.scale, { x: 0.96 * p.userData.w, y: 0.96 * p.userData.h, duration: 0.28, ease: "power2.in" }, at);
        out.to(p.position, { y: p.position.y + 0.055, duration: 0.28, ease: "power2.in" }, at);
      });
      out.to(canvas, { filter: "blur(10px)", opacity: 0.88, duration: 0.22, ease: "power2.in" }, Math.max(0.04 + (shown.length - 1) * 0.09 + 0.28 - 0.12, 0));
    }, sig);

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const v3 = new T.Vector3();
    const tick = (time) => {
      if (!seen) return;
      if (st.filtering) vel = 0;
      vel *= 0.92;
      const sp = 0.005 * vel * wheelFactor * dir;
      uni.uSpeed.value = axisY ? sp : -sp;
      for (const p of shown) {
        if (axisY) p.position.y = mod(p.position.y - sp + half, total) - half;
        else p.position.x = mod(p.position.x + sp + half, total) - half;
      }
      const a = Math.abs(vel), target = a <= 0.06 ? 1 : Math.max(0, 1 - a / 14);
      if (!st.filtering) nameMat.uAlpha.value += (target - nameMat.uAlpha.value) * 0.28;
      if (axisY) {
        let best = -1, d = Infinity;
        for (const p of shown) { p.updateMatrixWorld(true); v3.setFromMatrixPosition(p.matrixWorld).project(camera); const k = Math.abs(v3.y) + 0.25 * Math.abs(v3.x); if (k < d) { d = k; best = p.userData.i; } }
        if (best !== st.active && best >= 0) { st.active = best; el.dispatchEvent(new CustomEvent("fx:bend-strip-gl", { detail: { index: best } })); }
      }
      if (hover) { const p = pick(); el.style.cursor = p && p.userData.item.getAttribute("data-href") ? "pointer" : ""; }
      for (const p of shown) { const s = p.userData.slate; if (s.draw) { s.draw(time); s.tex.needsUpdate = true; } }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    return () => {
      ac.abort(); ro.disconnect(); io.disconnect();
      gsap.ticker.remove(tick);
      tls.forEach((t) => t.kill());
      gsap.killTweensOf([canvas, nameMat.uAlpha]);
      planes.forEach((p) => gsap.killTweensOf([p.scale, p.position, p.material.uniforms.uAlpha]));
      made.forEach((m) => m.dispose());
      geo.dispose(); renderer.dispose();
      if (madeCanvas) canvas.remove(); else gsap.set(canvas, { clearProps: "filter,opacity" });
      el.style.cursor = "";
    };
  });
})();
