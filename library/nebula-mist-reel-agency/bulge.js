// Photo bulge (original BulgeImage, three) — hovering makes the cursor spot bulge like a lens.
// Original values: radius .95 · swell = mix(1, 1/(1+d²), strength) · strength 0→.7 .65s sine.out, on leave .8s sine.inOut · follows the cursor with 1−e^(−6·dt).
// The placeholder panel has no image, so it draws the panel’s fill, diagonals and label on a canvas and inflates that image (uses the photo if one is put in).
(() => {
  const THREE = window.THREE;
  if (!THREE || !window.gsap) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches) return;
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FRAG = `precision highp float; uniform sampler2D uTex; uniform vec2 uMouse; uniform float uStrength; varying vec2 vUv;
    const float radius = 0.95;
    vec2 bulge(vec2 uv, vec2 c, float s){ uv -= c; float d = length(uv) / radius; uv *= mix(1.0, 1.0 / (1.0 + d * d), s); return uv + c; }
    void main(){ gl_FragColor = texture2D(uTex, bulge(vUv, uMouse, uStrength)); }`;

  function paint(el, w, h) {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const c = cv.getContext("2d");
    const cs = getComputedStyle(el);
    const img = el.querySelector("img");
    if (img && img.complete && img.naturalWidth) { c.drawImage(img, 0, 0, w, h); return cv; }
    c.fillStyle = cs.backgroundColor; c.fillRect(0, 0, w, h);
    c.strokeStyle = cs.borderTopColor; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.moveTo(w, 0); c.lineTo(0, h); c.stroke();
    const lab = el.dataset.label || "";
    const after = getComputedStyle(el, "::after");
    c.font = `500 ${Math.round(12 * (w / el.clientWidth))}px ${after.fontFamily}`;
    c.textAlign = "center"; c.textBaseline = "middle";
    const words = lab.split(" "), lines = [];
    let line = "";
    words.forEach((wd) => { const t = line ? line + " " + wd : wd; if (c.measureText(t).width > w * 0.8 && line) { lines.push(line); line = wd; } else line = t; });
    if (line) lines.push(line);
    const lh = 16 * (w / el.clientWidth), top = h / 2 - ((lines.length - 1) * lh) / 2;
    const tw = Math.max(...lines.map((l) => c.measureText(l).width)) + 18;
    c.fillStyle = after.backgroundColor; c.fillRect(w / 2 - tw / 2, top - lh * 0.8, tw, lines.length * lh + lh * 0.6);
    c.fillStyle = after.color;
    lines.forEach((l, i) => c.fillText(l, w / 2, top + i * lh));
    return cv;
  }

  function attach(el) {
    let st = null;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }, S = { v: 0 };
    let raf = 0, last = 0, hover = false;
    function init() {
      const w = el.clientWidth, h = el.clientHeight;
      const r = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      r.setSize(w, h, false);
      const tex = new THREE.CanvasTexture(paint(el, Math.round(w * 1.5), Math.round(h * 1.5)));
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { uTex: { value: tex }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uStrength: { value: 0 } } });
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      r.domElement.style.opacity = "0";
      el.append(r.domElement);
      st = { r, mat, scene, cam: new THREE.Camera() };
      st.r.compile(st.scene, st.cam);
    }
    // Compiling a shader for the first time on first interaction freezes the screen — build it ahead when it nears the screen, and give back the WebGL slot when it moves away (so with over twenty plates it stays under the context limit of 16)
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { if (!st) init(); return; }
      if (!st || hover || S.v > 0.001) return;
      cancelAnimationFrame(raf); raf = 0;
      st.mat.uniforms.uTex.value.dispose(); st.mat.dispose(); st.r.dispose(); st.r.forceContextLoss(); st.r.domElement.remove();
      st = null;
    }, { rootMargin: "50% 0px" }).observe(el);
    const loop = (t) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60; last = t;
      const k = 1 - Math.exp(-dt * 6);
      mouse.x += (mouse.tx - mouse.x) * k; mouse.y += (mouse.ty - mouse.y) * k;
      st.mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      st.mat.uniforms.uStrength.value = S.v;
      st.r.render(st.scene, st.cam);
      if (hover || S.v > 0.001) raf = requestAnimationFrame(loop);
      else { raf = 0; st.r.domElement.style.opacity = "0"; }
    };
    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      if (!st) init();
      hover = true;
      const b = el.getBoundingClientRect();
      mouse.x = mouse.tx = (e.clientX - b.left) / b.width; mouse.y = mouse.ty = 1 - (e.clientY - b.top) / b.height;
      st.r.domElement.style.opacity = "1";
      gsap.to(S, { v: 0.7, duration: 0.65, ease: "sine.out", overwrite: true });
      if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
    });
    el.addEventListener("pointermove", (e) => { const b = el.getBoundingClientRect(); mouse.tx = (e.clientX - b.left) / b.width; mouse.ty = 1 - (e.clientY - b.top) / b.height; });
    el.addEventListener("pointerleave", () => { hover = false; gsap.to(S, { v: 0, duration: 0.8, ease: "sine.inOut", overwrite: true }); });
  }
  document.addEventListener("DOMContentLoaded", () => document.querySelectorAll("[data-bulge]").forEach(attach));
})();
