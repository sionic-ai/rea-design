// Home page scenes: cursor photo trail, About photo curling like paper, work tunnel (pin 10×), standing DJ card, sine-wave photo band.
(() => {
  const { reduce } = window.yf;

  /* ---------- Cursor photo trail ----------
     Watches the cursor across the whole window and draws only when it is inside the hero box (even over the floating header row). From the lagging dot (per frame 1 − .9^(dt/16.7))
     One photo per size×150/275 px, trailing the cursor with a 1s glide, max 24. Each photo is placed so the cursor sits at its .318 top-left point
     10 bands open from the center in .75s (.1s per band), then after 1s close from the outside (25ms per band). Below 1000px and on touch, it runs by itself along a sine path (up to 12 slides) */
  const trail = document.querySelector(".yf-trail");
  if (trail && !reduce) {
    const LABELS = ["Work photo · Collage portrait", "Studio photo · Daylight", "Performance photo · green lighting", "Person film photo · Seaside", "Exhibition photo · white wall"];
    const TINTS = [1, 2, 3, 4, 5].map((i) => `var(--site-tint-${i})`);
    const S = { mode: null, size: 0, offset: 0, threshold: 150, max: 24, rect: null, dirty: true, seen: false, raf: 0, lastT: 0, next: 0,
      client: { x: 0, y: 0 }, mouse: { x: 0, y: 0 }, lag: { x: 0, y: 0 }, last: { x: 0, y: 0 }, has: false, moved: 0, phase: 0 };
    const pool = [], live = [], fresh = [];
    // When the menu opens, the page plate is locked (shared.js) — no trail is drawn in the meantime
    const menuOpen = () => Boolean(document.querySelector(".yf-page.is-locked"));
    const free = (it) => { it.anim?.cancel(); it.anim = null; it.state = "free"; it.el.className = "yf-trail__img is-free"; };
    const make = () => {
      const el = document.createElement("div");
      el.className = "yf-trail__img is-free";
      for (let i = 0; i < 10; i++) {
        const band = document.createElement("div");
        band.className = "yf-trail__band";
        band.style.cssText = `--i:${i};--dm:${Math.abs(i - 4.5)};--de:${4.5 - Math.abs(i - 4.5)}`;
        const img = document.createElement("div");
        img.className = "wf-img";
        band.append(img);
        el.append(band);
      }
      trail.append(el);
      const it = { el, anim: null, state: "free", outAt: 0, freeAt: 0 };
      pool.push(it);
      return it;
    };
    const spawn = (now) => {
      let it = pool.find((p) => p.state === "free");
      if (!it) {
        if (pool.length < S.max) it = make();
        else { it = live.shift(); const k = fresh.indexOf(it); if (k > -1) fresh.splice(k, 1); }
      }
      const k = S.next++ % LABELS.length;
      it.el.querySelectorAll(".wf-img").forEach((img) => { img.style.backgroundColor = TINTS[k]; img.dataset.label = LABELS[k]; });
      it.anim?.cancel();
      it.el.className = "yf-trail__img is-reset";
      it.anim = it.el.animate([
        { transform: `translate3d(${S.lag.x - S.offset}px, ${S.lag.y - S.offset}px, 0)` },
        { transform: `translate3d(${S.mouse.x - S.offset}px, ${S.mouse.y - S.offset}px, 0)` },
      ], { duration: 1000, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "forwards" });
      it.state = "pending";
      it.outAt = now + 1000;
      live.push(it);
      fresh.push(it);
    };
    const follow = (now, dt) => {
      if (!S.has) { S.lag.x = S.last.x = S.mouse.x; S.lag.y = S.last.y = S.mouse.y; S.has = true; }
      const k = 1 - Math.pow(0.9, dt / 16.667);
      S.lag.x += (S.mouse.x - S.lag.x) * k;
      S.lag.y += (S.mouse.y - S.lag.y) * k;
      if (Math.hypot(S.mouse.x - S.last.x, S.mouse.y - S.last.y) > S.threshold) { spawn(now); S.last.x = S.mouse.x; S.last.y = S.mouse.y; }
    };
    const inside = () => S.client.x >= S.rect.left && S.client.x <= S.rect.right && S.client.y >= S.rect.top && S.client.y <= S.rect.bottom;
    const frame = (now) => {
      S.raf = 0;
      const dt = S.lastT ? Math.min(now - S.lastT, 50) : 16.667;
      S.lastT = now;
      fresh.forEach((it) => { it.el.classList.remove("is-reset"); it.el.classList.add("is-in"); it.state = "in"; });
      fresh.length = 0;
      if (S.mode === "auto") {
        S.phase += (dt / 1000) * 0.85;
        const x0 = S.offset, x1 = Math.max(x0, S.rect.width - S.size + S.offset), y0 = S.offset, y1 = Math.max(y0, S.rect.height - S.size + S.offset);
        const ox = (x1 - x0) / 2, oy = (y1 - y0) / 2;
        S.mouse.x = x0 + ox + ox * Math.sin(S.phase + 0.6);
        S.mouse.y = y0 + oy + oy * Math.sin(1.37 * S.phase);
        follow(now, dt);
      } else if (S.mode === "mouse" && S.moved) {
        if (!S.rect || S.dirty) { S.rect = trail.getBoundingClientRect(); S.dirty = false; }
        S.mouse.x = S.client.x - S.rect.left;
        S.mouse.y = S.client.y - S.rect.top;
        if (!menuOpen() && inside()) follow(now, dt); else S.has = false;
      }
      for (let i = 0; i < live.length; i++) {
        const it = live[i];
        if (it.state === "in" && now >= it.outAt) { it.state = "out"; it.freeAt = now + 1112; it.el.classList.remove("is-in"); it.el.classList.add("is-out"); }
        if (it.state === "out" && now >= it.freeAt) { free(it); live.splice(i, 1); i--; }
      }
      const idle = S.mode === "mouse" && !live.length && now - S.moved > 200;
      if (S.seen && !document.hidden && S.mode !== "off" && !idle) S.raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!S.raf && S.seen && !document.hidden && S.mode && S.mode !== "off") { S.lastT = 0; S.raf = requestAnimationFrame(frame); } };
    const fit = () => {
      S.rect = trail.getBoundingClientRect(); S.dirty = false;
      const w = innerWidth, size = w > 1000 ? 275 : w > 600 ? 200 : 150, mode = w > 1000 && window.yf.fine ? "mouse" : "auto";
      let changed = false;
      if (size !== S.size) { S.size = size; S.offset = 0.3181818181818182 * size; S.threshold = (size / 275) * 150; trail.style.setProperty("--trail-size", `${size}px`); changed = true; }
      if (mode !== S.mode) { S.mode = mode; S.max = mode === "auto" ? 12 : 24; S.moved = 0; changed = true; }
      if (changed) { cancelAnimationFrame(S.raf); S.raf = 0; fresh.length = 0; live.forEach(free); live.length = 0; S.has = false; }
      kick();
    };
    addEventListener("pointermove", (e) => {
      if (S.mode !== "mouse" || menuOpen()) return;
      S.rect = trail.getBoundingClientRect(); S.dirty = false;
      S.client.x = e.clientX; S.client.y = e.clientY;
      if (!inside()) { S.has = false; return; }
      S.moved = performance.now();
      kick();
    }, { passive: true });
    addEventListener("scroll", () => (S.dirty = true), { passive: true });
    new IntersectionObserver(([e]) => { S.seen = e.isIntersecting; if (S.seen) { S.dirty = true; kick(); } else { cancelAnimationFrame(S.raf); S.raf = 0; } }).observe(trail);
    new ResizeObserver(fit).observe(trail);
  }

  /* ---------- Paper curl shader ----------
     Wraps the photo (center half of the panel) around a cylinder on an axis tilted 30°. For each screen point, it finds the paper point on the same axis line
     Pick what is visible in this order: cylinder top (paper back, cylinder lighting) → cylinder inside (photo face) → flat photo not yet rolled.
     The curl position goes from -0.15 to 1.25 as progress goes 0→1. */
  const CURL_FRAG = `
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
        float a = cover(uv);
        float near = clamp(1.0 - (t - uAt) / R, 0.0, 1.0);
        col = vec4(texture2D(uMap, uv).rgb * (1.0 - 0.2 * near * near * near), 1.0) * a;
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
  // Draws the photo placeholder (.wf-img background, diagonal and label) at its size on a canvas to use as the shader’s paper
  const paintPlaceholder = (el, w, h) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d"), cs = getComputedStyle(el), tag = getComputedStyle(el, "::after");
    g.fillStyle = cs.backgroundColor;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = cs.getPropertyValue("--wf-line");
    g.lineWidth = Math.max(1, w / 300);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const k = w / el.clientWidth, label = el.dataset.label || "";
    g.font = `500 ${12 * k}px ${cs.getPropertyValue("--wf-mono")}`;
    const tw = g.measureText(label).width, pw = tw + 16.8 * k, ph = 22 * k;
    g.fillStyle = tag.backgroundColor;
    g.fillRect((w - pw) / 2, (h - ph) / 2, pw, ph);
    g.fillStyle = tag.color;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(label, w / 2, h / 2);
    return c;
  };
  const makeCurl = (box) => {
    const T = window.THREE, img = box?.querySelector(".yf-curl__img");
    if (!T || !img) return null;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: false, alpha: true, depth: false, stencil: false, powerPreference: "high-performance" }); } catch (e) { return null; }
    renderer.outputColorSpace = T.SRGBColorSpace;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    // Paper back color — skin variables are relative-color expressions, so paint them on an element and read the computed value
    const paper = new T.Color();
    const probe = document.createElement("i");
    probe.style.color = "var(--site-white)";
    box.append(probe);
    paper.setStyle(getComputedStyle(probe).color);
    probe.remove();
    const uni = { uMap: { value: null }, uAt: { value: -0.15 }, uPaper: { value: paper }, uPx: { value: new T.Vector2(1, 1) } };
    const mat = new T.ShaderMaterial({ vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: CURL_FRAG, uniforms: uni, transparent: true, depthTest: false, depthWrite: false });
    const geo = new T.PlaneGeometry(2, 2), scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    scene.add(new T.Mesh(geo, mat));
    const cv = renderer.domElement;
    cv.setAttribute("aria-hidden", "true");
    box.append(cv);
    box.classList.add("is-gl");
    const render = () => renderer.render(scene, cam);
    let W = 0, H = 0;
    const size = () => {
      const w = box.clientWidth, h = box.clientHeight;
      if (!w || !h || (w === W && h === H)) return;
      W = w; H = h;
      renderer.setSize(w, h, false);
      uni.uMap.value?.dispose();
      const tex = new T.CanvasTexture(paintPlaceholder(img, Math.round((w / 2) * dpr), Math.round((h / 2) * dpr)));
      tex.colorSpace = T.SRGBColorSpace;
      tex.minFilter = tex.magFilter = T.LinearFilter;
      tex.generateMipmaps = false;
      uni.uMap.value = tex;
      uni.uPx.value.set((w / 2) * dpr, (h / 2) * dpr);
      render();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(box);
    document.fonts.ready.then(() => { W = 0; size(); });
    return {
      set: (p) => { uni.uAt.value = p * 1.4 - 0.15; render(); },
      dispose: () => { ro.disconnect(); uni.uMap.value?.dispose(); geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss(); cv.remove(); box.classList.remove("is-gl"); },
    };
  };

  window.yf.scene((mm) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* ---------- About photo: rolls up onto a cylinder (radius 1/2π) from the bottom-right corner toward the top-left (top top → +85%) ---------- */
      const about = document.querySelector(".yf-about");
      const curl = makeCurl(about.querySelector(".yf-curl"));
      if (curl) {
        ScrollTrigger.create({ trigger: about, start: "top top", end: "+=85%", onUpdate: (s) => curl.set(s.progress), onRefresh: (s) => curl.set(s.progress) });
      }

      /* ---------- Work tunnel: each section spreads in a set direction by (progress - .03i)×4 while z goes -1000→+2000, hidden once past 2000 ---------- */
      const flow = document.querySelector(".yf-flow");
      const imgs = gsap.utils.toArray(".yf-flow__img", flow);
      const DIRS = [[-0.8, -0.6], [0.7, 0.4], [-0.5, 0.7], [0.6, -0.5], [-0.8, 0.2], [0.8, -0.3], [-0.6, -0.8], [0.4, 0.6], [-0.7, 0.5], [0.5, -0.7], [-0.4, -0.4], [0.3, 0.8], [-0.8, 0.3], [0.6, 0.2]];
      const coverAt = imgs.length - 1;
      let tx = [], ty = [];
      const measure = () => {
        const w = flow.clientWidth, h = flow.clientHeight, k = w < 800 ? 1.5 : 0.7;
        tx = imgs.map((_, i) => DIRS[i % DIRS.length][0] * w * k);
        ty = imgs.map((_, i) => DIRS[i % DIRS.length][1] * h * k);
      };
      const place = (p) => imgs.forEach((el, i) => {
        const s = (p - 0.03 * i) * 4;
        let show = false;
        if (s > 0) {
          let x = tx[i] * s, y = ty[i] * s, z = -1000 + 3000 * s;
          if (i === coverAt) { x = 0; y = 0; z *= 1.5; }
          if (z < 2000) { show = true; el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${s.toFixed(4)})`; }
        }
        el.style.visibility = show ? "visible" : "hidden";
      });
      measure();
      ScrollTrigger.create({
        trigger: flow, start: "top top", end: () => `+=${10 * flow.offsetHeight}`, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => place(s.progress), onRefresh: (s) => { measure(); place(s.progress); },
      });

      /* ---------- DJ card: the further out, the more it lies down and rises from a slanted angle ---------- */
      const TILT = [{ rotateX: 58, rotateY: 18, y: 48 }, { rotateX: 74, rotateY: 5, y: 32 }, { rotateX: 90, rotateY: 0, y: 18 }, { rotateX: 74, rotateY: -5, y: 32 }, { rotateX: 58, rotateY: -18, y: 48 }];
      const dj = document.querySelector(".yf-dj");
      const cards = gsap.utils.toArray(".yf-dj__card", dj);
      cards.forEach((c, i) => gsap.set(c, { ...TILT[cards.length > 1 ? Math.round((i * (TILT.length - 1)) / (cards.length - 1)) : 2], transformOrigin: "50% 100%", transformPerspective: 1560 }));
      gsap.set(".yf-dj__copy", { y: -10 });
      gsap.timeline({ scrollTrigger: { trigger: dj, start: "top 40%", end: "top 0%", scrub: 1 } })
        .to(cards, { rotateX: 0, rotateY: 0, y: 0, ease: "power1.inOut", duration: 1 }, 0)
        .to(".yf-dj__copy", { y: 0 }, 0);

      /* ---------- Photo strip: three layered sine waves (base .1 · flow .15 · ripple .025) set the left-right position, and both sides are cropped up to 20% near the screen edges ---------- */
      const items = gsap.utils.toArray(".yf-strip__item");
      const WAVE = { base: { amp: 0.1, freq: 1, speed: 1, phase: 5 }, flow: { amp: 0.15, freq: 5, speed: 5, phase: 10 }, detail: { amp: 0.025, freq: 5, speed: 1.5, phase: 2.5 } };
      const tail = Math.floor(0.75 * items.length);
      items.forEach((el, i) => {
        el.style.setProperty("--k", 1 - 0.5 * (i >= tail ? (i - tail + 1) / (items.length - tail) : 0));
        const at = items.length > 1 ? i / (items.length - 1) : 0;
        const move = (t) => {
          const W = innerWidth;
          const b = Math.sin(at * WAVE.base.freq + (1 - t) * WAVE.base.speed + WAVE.base.phase);
          const f = 0.5 + Math.sin(at * WAVE.flow.freq + WAVE.flow.phase + t * WAVE.flow.speed);
          const d = 0.5 + Math.sin(at * WAVE.detail.freq + WAVE.detail.phase + t * WAVE.detail.speed);
          const x = (W - el.offsetWidth) / 2 - 0.1 * W + b * W * WAVE.base.amp + f * W * WAVE.flow.amp + d * W * WAVE.detail.amp;
          const cut = 20 * Math.pow(2 * Math.abs(t - 0.5), 2);
          el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
          el.style.clipPath = `inset(0 ${cut.toFixed(2)}% 0 ${cut.toFixed(2)}%)`;
        };
        ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: (s) => move(s.progress), onRefresh: (s) => move(s.progress) });
      });
      return () => curl?.dispose();
    });
  });
})();
