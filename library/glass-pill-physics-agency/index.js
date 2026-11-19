// First page only. Four-column drag for the services block (phone), result glass band (three.js: drag a card on the curved band and it spins with inertia while the center glass refracts and splits color), News photo pixel-resolve
(() => {
  const { rgb, css, reduce } = window.brand;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // What we do, four columns — drag sideways on phone with a progress bar following
  const vp = $("[data-drag-columns]"), list = vp?.firstElementChild, bar = $("[data-drag-progress]");
  if (vp && list) {
    let x = 0, target = 0, drag = null;
    const max = () => Math.max(0, list.scrollWidth - vp.clientWidth);
    vp.addEventListener("pointerdown", (e) => { if (!max()) return; drag = { x: e.clientX, s: target }; vp.setPointerCapture(e.pointerId); });
    vp.addEventListener("pointermove", (e) => { if (drag) target = Math.min(0, Math.max(-max(), drag.s + e.clientX - drag.x)); });
    const end = () => (drag = null);
    vp.addEventListener("pointerup", end); vp.addEventListener("pointercancel", end);
    gsap.ticker.add(() => { if (!max()) { if (x) { x = target = 0; list.style.transform = ""; } return; } x += (target - x) * (reduce ? 1 : 0.12); list.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`; if (bar) bar.style.transform = `scaleX(${(-x / max() || 0).toFixed(3)})`; });
  }

  // Result glass strip
  const canvas = $("[data-glass-canvas]"), items = $$("[data-glass-item]"), caption = $("[data-glass-caption]");
  if (canvas && items.length && window.THREE) {
    const T = THREE;
    let R;
    try { R = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { R = null; }
    if (R) {
      R.setPixelRatio(Math.min(devicePixelRatio, 1.75)); R.outputColorSpace = T.LinearSRGBColorSpace;
      const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 0, 9);
      const surf = rgb("--kf-surface"), raised = rgb("--kf-raised"), dim = rgb("--kf-dim"), white = rgb("--kf-bg"), ink = rgb("--kf-ink");
      const col = (c, a = 1) => `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
      const tex = items.map((it, k) => {
        const c2 = document.createElement("canvas"), g = c2.getContext("2d"); c2.width = 600; c2.height = 800;
        const gr = g.createLinearGradient(0, 0, 0, 800); gr.addColorStop(0, col(k % 2 ? raised : surf)); gr.addColorStop(1, col(k % 2 ? surf : raised));
        g.fillStyle = gr; g.fillRect(0, 0, 600, 800);
        g.strokeStyle = col(dim, 0.4); g.beginPath(); g.moveTo(0, 0); g.lineTo(600, 800); g.moveTo(600, 0); g.lineTo(0, 800); g.stroke();
        g.fillStyle = col(dim); g.font = `500 22px ${css("--kf-font-sans")}`; g.textAlign = "center";
        ($("[data-label]", it)?.dataset.label || "").split(" · ").forEach((w, n) => g.fillText(w, 300, 420 + n * 30));
        g.fillStyle = col(k % 2 ? ink : white); g.font = `300 120px ${css("--kf-font-display")}`; g.textAlign = "left";
        g.fillText($("[data-glass-figure]", it).textContent.trim(), 36, 150);
        const t = new T.CanvasTexture(c2); t.colorSpace = T.NoColorSpace; return t;
      });
      const N = items.length * 3, R0 = 6.2, step = 0.42;
      const geo = new T.PlaneGeometry(2.2, 2.93, 24, 1);
      const VERT = `uniform float uBend; varying vec2 vUv; varying float vX;
        void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vX = w.x; gl_Position = projectionMatrix * viewMatrix * w; }`;
      const FRAG = `uniform sampler2D uMap; uniform float uSpeed; varying vec2 vUv; varying float vX;
        void main(){
          // Center glass: crossing the middle band of the screen shifts the image by refraction and splits colors at the edges
          float lens = exp(-vX * vX * 0.9);
          vec2 uv = vUv + vec2((vUv.x - 0.5) * -0.12 * lens, 0.0);
          float sp = 0.004 + lens * 0.006 + uSpeed * 0.02;
          vec3 c = vec3(texture2D(uMap, uv + vec2(sp, 0.0)).r, texture2D(uMap, uv).g, texture2D(uMap, uv - vec2(sp, 0.0)).b);
          float edge = smoothstep(0.0, 0.03, vUv.x) * smoothstep(1.0, 0.97, vUv.x);
          c += (1.0 - edge) * lens * 0.25;
          gl_FragColor = vec4(c, 1.0);
        }`;
      const cards = Array.from({ length: N }, (_, i) => {
        const u = { uMap: { value: tex[i % items.length] }, uSpeed: { value: 0 } };
        const m = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, side: T.DoubleSide }));
        scene.add(m); return { m, u };
      });
      let pos = 0, target = 0, vel = 0, drag = null, shown = -1;
      const place = () => {
        const total = N * step;
        cards.forEach((c, i) => {
          let a = ((i * step + pos) % total + total) % total; if (a > total / 2) a -= total;
          c.m.position.set(Math.sin(a) * R0, 0, Math.cos(a) * R0 - R0); c.m.rotation.y = a; c.u.uSpeed.value = Math.min(1, Math.abs(vel) * 6);
        });
        const k = ((Math.round(-pos / step) % items.length) + items.length) % items.length;
        if (k !== shown) {
          shown = k;
          const txt = $("p", items[k]).textContent;
          if (reduce) caption.textContent = txt;
          else gsap.timeline().to(caption, { yPercent: -40, autoAlpha: 0, duration: 0.3, ease: "power2.in" }).call(() => (caption.textContent = txt)).fromTo(caption, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" });
        }
      };
      canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, s: target }; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", (e) => { if (drag) target = drag.s + (e.clientX - drag.x) * 0.004; });
      const end = () => { if (!drag) return; drag = null; target = Math.round(target / step) * step; };
      canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
      const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
      resize(); addEventListener("resize", resize);
      let visible = false;
      ScrollTrigger.create({ trigger: canvas, start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
      gsap.ticker.add((t, dms) => {
        if (!visible) return;
        if (!drag && !reduce) target -= (dms || 16) * 0.00004;
        const prev = pos; pos += (target - pos) * (reduce ? 1 : 0.08); vel = pos - prev;
        place(); R.render(scene, cam);
      });
      place();
    }
  }

  // News photo — resolves from coarse pixels (1.2s when visible), scrolling up makes it coarse again then resolves
  $$("[data-pixel]").forEach((box) => {
    const cv = document.createElement("canvas"); box.append(cv);
    const g = cv.getContext("2d"), src = document.createElement("canvas"), sg = src.getContext("2d");
    const ink = rgb("--kf-ink"), surf = rgb("--kf-surface"), acc = rgb("--kf-accent"), dim = rgb("--kf-dim");
    const col = (c, a = 1) => `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
    const st = { px: 40 };
    const draw = () => {
      const w = box.clientWidth, h = box.clientHeight; if (!w) return;
      if (src.width !== w) {
        src.width = cv.width = w; src.height = cv.height = h;
        const gr = sg.createRadialGradient(w * 0.45, h * 0.4, 10, w * 0.5, h * 0.5, w * 0.7); gr.addColorStop(0, col(surf)); gr.addColorStop(1, col(ink, 0.85));
        sg.fillStyle = gr; sg.fillRect(0, 0, w, h);
        sg.fillStyle = col(acc); for (let i = 0; i < 26; i++) sg.fillRect((i * 37) % w, (i * 53) % h, 6, 6);
        sg.fillStyle = col(dim); sg.font = `500 13px ${css("--kf-font-sans")}`; sg.textAlign = "center"; sg.fillText(box.dataset.label || "", w / 2, h - 18);
      }
      const p = Math.max(1, Math.round(st.px)), tw = Math.ceil(w / p), th = Math.ceil(h / p);
      g.imageSmoothingEnabled = false; g.clearRect(0, 0, w, h);
      g.drawImage(src, 0, 0, w, h, 0, 0, tw, th); g.drawImage(cv, 0, 0, tw, th, 0, 0, w, h);
    };
    if (reduce) { st.px = 1; requestAnimationFrame(draw); return; }
    ScrollTrigger.create({ trigger: box, start: "top 90%", once: true, onEnter: () => gsap.to(st, { px: 1, duration: 1.2, ease: "power2.out", onUpdate: draw }) });
    box.closest("a")?.addEventListener("pointerenter", () => gsap.fromTo(st, { px: 14 }, { px: 1, duration: 0.8, ease: "power2.out", onUpdate: draw, overwrite: true }));
    addEventListener("resize", () => { src.width = 0; draw(); });
    requestAnimationFrame(draw);
  });
})();
